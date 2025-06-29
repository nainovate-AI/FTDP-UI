'use client'

import React, { useState, useEffect } from 'react';
import * as hash from 'object-hash';
import { useRouter } from 'next/navigation';
import { HelpCircle } from 'lucide-react';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { ProgressStepper } from '../../../components/dataset-selection/ProgressStepper';
import { NavigationButtons } from '../../../components/model-selection/NavigationButtons';
import { useToast } from '../../../hooks/useToast';
import { ToastContainer } from '../../../components/common/ToastNotification';

export default function HyperparameterConfiguration() {
  const router = useRouter();
  const { toasts, addToast, removeToast } = useToast();
  
  // State management
  const [outputDirectory, setOutputDirectory] = useState('./fine_tuned_model');
  const [isOutputDirectoryLocked, setIsOutputDirectoryLocked] = useState(true);
  const [adapterMethod, setAdapterMethod] = useState<'LoRA' | 'QLoRA' | 'LoFTQ'>('LoRA');
  const [mode, setMode] = useState<'Manual' | 'Automated'>('Manual');
  
  // Training parameters
  const [learningRate, setLearningRate] = useState(mode === 'Manual' ? 2e-4 : [1e-5, 5e-4]);
  const [batchSize, setBatchSize] = useState(mode === 'Manual' ? 4 : [2, 8]);
  const [epochs, setEpochs] = useState(mode === 'Manual' ? 3 : [1, 10]);
  const [weightDecay, setWeightDecay] = useState(mode === 'Manual' ? 0.01 : [0.001, 0.1]);
  
  // Automated mode specific
  const [modeLogic, setModeLogic] = useState('Bayesian Optimization');
  const [searchLimit, setSearchLimit] = useState(50);
  const [targetLoss, setTargetLoss] = useState(0.1);
  
  // LoRA parameters
  const [loraR, setLoraR] = useState(16);
  const [loraAlpha, setLoraAlpha] = useState(32);
  const [loraDropout, setLoraDropout] = useState(0.1);

  // Animation states for smooth transitions
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Batch size warning debouncing
  const [lastBatchWarningTime, setLastBatchWarningTime] = useState(0);

  // Editing states for inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Memory calculation for batch size soft limit
  const calculateMemorySoftLimit = () => {
    // Rough estimation: 4GB = batch size 8, 8GB = batch size 16, etc.
    const availableMemoryGB = (navigator as any).deviceMemory || 4; // Default to 4GB if not available
    return Math.max(Math.min(Math.floor(availableMemoryGB * 2), 32), 8); // Minimum 8, cap at 32
  };

  const memorySoftLimit = calculateMemorySoftLimit();

  // Tooltip definitions for parameters
  const tooltips = {
    'Learning Rate': 'Controls how much the model parameters change during training. Lower values lead to more stable but slower learning.',
    'Batch Size': 'Number of training examples processed together. Higher values can speed up training but require more memory.',
    'Epochs': 'Number of complete passes through the training dataset. More epochs can improve accuracy but may cause overfitting.',
    'Weight Decay': 'Regularization technique that prevents overfitting by penalizing large weights.',
    'Rank (r)': 'The rank of LoRA adaptation matrices. Higher values allow more expressiveness but increase parameters.',
    'Alpha': 'Scaling factor for LoRA updates. Higher values make LoRA updates more prominent.',
    'Dropout': 'Randomly sets some neurons to zero during training to prevent overfitting.'
  };

  // Load config from metadata UID and hyperparameter-config.json
  useEffect(() => {
    const loadHyperparameters = async () => {
      try {
        const metaRes = await fetch('/api/metadata');
        const configRes = await fetch('/src/data/hyperparameter-config.json');
        if (metaRes.ok && configRes.ok) {
          const metadata = await metaRes.json();
          const configData = await configRes.json();
          let uid = metadata.hyperparameters?.uid;
          
          // Check if UID is an alias first
          if (uid && configData.aliases && configData.aliases[uid]) {
            uid = configData.aliases[uid];
          }
          
          if (uid && configData.configs[uid]) {
            const hp = configData.configs[uid];
            setOutputDirectory(hp.outputDirectory || './fine_tuned_model');
            setAdapterMethod(hp.adapterMethod || 'LoRA');
            setMode(hp.mode || 'Manual');
            setModeLogic(hp.modeLogic || 'Bayesian Optimization');
            setSearchLimit(hp.searchLimit || 50);
            setTargetLoss(hp.targetLoss || 0.1);
            setLoraR(hp.loraR || 16);
            setLoraAlpha(hp.loraAlpha || 32);
            setLoraDropout(hp.loraDropout || 0.1);
            if (hp.mode === 'Manual') {
              setLearningRate(hp.learningRate || 2e-4);
              setBatchSize(hp.batchSize || 4);
              setEpochs(hp.epochs || 3);
              setWeightDecay(hp.weightDecay || 0.01);
            } else {
              setLearningRate(hp.learningRateRange || [1e-5, 5e-4]);
              setBatchSize(hp.batchSizeRange || [2, 8]);
              setEpochs(hp.epochsRange || [1, 10]);
              setWeightDecay(hp.weightDecayRange || [0.001, 0.1]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load hyperparameters:', error);
      }
    };
    loadHyperparameters();
  }, []);

  // Helper to encode hyperparameters into symmetric cipher
  const encodeUID = (config: any) => {
    const modeMap: Record<string, string> = { Manual: '00', Automated: '01' };
    const adapterMap: Record<string, string> = { LoRA: '00', QLoRA: '01', LoFTQ: '02' };
    
    const mm = modeMap[String(config.mode)] || '00';
    const aa = adapterMap[String(config.adapterMethod)] || '00';
    
    if (config.mode === 'Manual') {
      // Manual: MMAALLLLBBBBEEEERRRRDDDD
      const lr = Math.round((config.learningRate || 2e-4) * 1000000).toString(36).padStart(4, '0');
      const bs = (config.batchSize || 4).toString(36).padStart(4, '0');
      const ep = (config.epochs || 3).toString(36).padStart(4, '0');
      const rk = (config.loraR || 16).toString(36).padStart(4, '0');
      const dr = Math.round((config.loraDropout || 0.1) * 1000).toString(36).padStart(4, '0');
      return `${mm}${aa}${lr}${bs}${ep}${rk}${dr}`;
    } else {
      // Automated: MMAARRRRRRRRBBBBBBBBEEEEEEEE...
      const lrRange = config.learningRateRange || [1e-5, 5e-4];
      const bsRange = config.batchSizeRange || [2, 8];
      const epRange = config.epochsRange || [1, 10];
      const lrMin = Math.round(lrRange[0] * 1000000).toString(36).padStart(4, '0');
      const lrMax = Math.round(lrRange[1] * 1000000).toString(36).padStart(4, '0');
      const bsMin = bsRange[0].toString(36).padStart(4, '0');
      const bsMax = bsRange[1].toString(36).padStart(4, '0');
      const epMin = epRange[0].toString(36).padStart(4, '0');
      const epMax = epRange[1].toString(36).padStart(4, '0');
      const rk = (config.loraR || 16).toString(36).padStart(4, '0');
      const dr = Math.round((config.loraDropout || 0.1) * 1000).toString(36).padStart(4, '0');
      return `${mm}${aa}${lrMin}${lrMax}${bsMin}${bsMax}${epMin}${epMax}${rk}${dr}`;
    }
  };

  // Handle batch size warning for both manual and automated modes with debouncing
  const checkBatchSizeWarning = (batchValue: number) => {
    const now = Date.now();
    if (batchValue > memorySoftLimit && now - lastBatchWarningTime > 2000) { // Only show warning every 2 seconds
      setLastBatchWarningTime(now);
      addToast(`Batch size ${batchValue} may cause Out of Memory issues. Recommended max: ${memorySoftLimit}`, 'warning');
    }
  };

  // Handle inline editing for single values
  const handleStartEdit = (fieldId: string, currentValue: number | number[]) => {
    setEditingField(fieldId);
    if (Array.isArray(currentValue)) {
      setEditingValue(`${currentValue[0]}-${currentValue[1]}`);
    } else {
      setEditingValue(currentValue.toString());
    }
  };

  const handleFinishEdit = (
    setValue: (val: number | number[]) => void,
    min: number,
    max: number,
    step: number,
    isRange: boolean = false
  ) => {
    if (isRange) {
      const parts = editingValue.split('-').map(p => parseFloat(p.trim()));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        const newMin = Math.max(min, Math.min(parts[0], parts[1] - step));
        const newMax = Math.min(max, Math.max(parts[1], parts[0] + step));
        
        // Smooth animation for range values
        setValue([newMin, newMax]);
      }
    } else {
      const newValue = parseFloat(editingValue);
      if (!isNaN(newValue)) {
        const clampedValue = Math.max(min, Math.min(max, newValue));
        
        // Smooth animation for single values
        setValue(clampedValue);
      }
    }
    setEditingField(null);
    setEditingValue('');
  };

  const renderEditableValue = (
    fieldId: string,
    value: number | number[],
    setValue: (val: number | number[]) => void,
    min: number,
    max: number,
    step: number,
    formatValue: (val: number) => string
  ) => {
    const isRange = Array.isArray(value);
    const isEditing = editingField === fieldId;

    if (isEditing) {
      return (
        <input
          type="text"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={() => handleFinishEdit(setValue, min, max, step, isRange)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleFinishEdit(setValue, min, max, step, isRange);
            } else if (e.key === 'Escape') {
              setEditingField(null);
              setEditingValue('');
            }
          }}
          className="text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded px-2 py-1 text-gray-700 dark:text-gray-300 outline-none w-24 text-center"
          autoFocus
        />
      );
    }

    return (
      <span 
        className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        onClick={() => handleStartEdit(fieldId, value)}
      >
        {isRange 
          ? `${formatValue((value as number[])[0])} - ${formatValue((value as number[])[1])}`
          : formatValue(value as number)
        }
      </span>
    );
  };

  // Handle manual value input with validation
  const handleManualValueChange = (
    value: string,
    setValue: (val: number | number[]) => void,
    currentValue: number | number[],
    min: number,
    max: number,
    step: number,
    paramName: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    if (Array.isArray(currentValue)) {
      // For range sliders, don't change the implementation here
      return;
    } else {
      // Check if value exceeds recommended limits
      if (numValue > max) {
        addToast(`${paramName} value (${numValue}) exceeds recommended maximum (${max}). This may cause issues.`, 'warning');
      }
      
      // Special handling for batch size
      if (paramName === 'Batch Size' && numValue > memorySoftLimit) {
        addToast(`Batch size ${numValue} may cause Out of Memory issues. Recommended max: ${memorySoftLimit}`, 'warning');
      }
      
      setValue(numValue);
    }
  };

  // Save config to hyperparameter-config.json and UID to metadata.json
  const saveHyperparameters = async () => {
    try {
      const config = {
        outputDirectory,
        adapterMethod,
        mode,
        modeLogic,
        searchLimit,
        targetLoss,
        loraR,
        loraAlpha,
        loraDropout,
        ...(mode === 'Manual' ? {
          learningRate,
          batchSize,
          epochs,
          weightDecay
        } : {
          learningRateRange: learningRate,
          batchSizeRange: batchSize,
          epochsRange: epochs,
          weightDecayRange: weightDecay
        }),
        configuredAt: new Date().toISOString()
      };
      const uid = encodeUID(config);

      // Save config to hyperparameter-config.json
      const configRes = await fetch('/src/data/hyperparameter-config.json');
      let configData = { configs: {}, best_config_uid_manual: null, best_config_uid_automated: null };
      if (configRes.ok) configData = await configRes.json();
      (configData.configs as Record<string, any>)[uid] = config;
      await fetch('/api/hyperparameter-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });

      // Save UID to metadata.json
      await fetch('/api/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hyperparameters: { uid } })
      });

      addToast('Hyperparameters saved successfully', 'success');
      return true;
    } catch (error) {
      console.error('Error saving hyperparameters:', error);
      addToast('Failed to save hyperparameters', 'error');
      return false;
    }
  };

  const steps = [
    'Data Upload',
    'Model Selection',
    'Hyperparameters',
    'Fine-tuning',
    'Deployment'
  ];

  const handleBack = () => {
    router.push('/finetuning/model-selection');
  };

  const handleNext = async () => {
    const saved = await saveHyperparameters();
    if (saved) {
      router.push('/finetuning/training');
    }
  };

  const handleModeChange = (newMode: 'Manual' | 'Automated') => {
    setMode(newMode);
    // Convert single values to ranges or vice versa
    if (newMode === 'Automated') {
      setLearningRate([1e-5, 5e-4]);
      setBatchSize([2, 8]);
      setEpochs([1, 10]);
      setWeightDecay([0.001, 0.1]);
    } else {
      setLearningRate(2e-4);
      setBatchSize(4);
      setEpochs(3);
      setWeightDecay(0.01);
    }
  };

  // Suggest best config for current mode with smooth animation
  const suggestBestConfig = async () => {
    try {
      const configRes = await fetch('/src/data/hyperparameter-config.json');
      if (!configRes.ok) return;
      const configData = await configRes.json();
      
      // Get the best config UID based on current mode
      const bestUidKey = mode === 'Manual' ? 'best_config_uid_manual' : 'best_config_uid_automated';
      let bestUid = configData[bestUidKey];
      
      // Check if the UID is an alias and resolve it
      if (bestUid && configData.aliases && configData.aliases[bestUid]) {
        bestUid = configData.aliases[bestUid];
      }
      
      if (bestUid && configData.configs[bestUid]) {
        setIsAnimating(true);
        const hp = configData.configs[bestUid];
        
        // Animate values smoothly
        setTimeout(() => {
          setOutputDirectory(hp.outputDirectory || './fine_tuned_model');
          setAdapterMethod(hp.adapterMethod || 'LoRA');
          setModeLogic(hp.modeLogic || 'Bayesian Optimization');
          setSearchLimit(hp.searchLimit || 50);
          setTargetLoss(hp.targetLoss || 0.1);
          setLoraR(hp.loraR || 16);
          setLoraAlpha(hp.loraAlpha || 32);
          setLoraDropout(hp.loraDropout || 0.1);
          
          if (mode === 'Manual') {
            setLearningRate(hp.learningRate || 2e-4);
            setBatchSize(hp.batchSize || 4);
            setEpochs(hp.epochs || 3);
            setWeightDecay(hp.weightDecay || 0.01);
          } else {
            setLearningRate(hp.learningRateRange || [1e-5, 5e-4]);
            setBatchSize(hp.batchSizeRange || [2, 8]);
            setEpochs(hp.epochsRange || [1, 10]);
            setWeightDecay(hp.weightDecayRange || [0.001, 0.1]);
          }
          setIsAnimating(false);
        }, 100);
        
        addToast(`Best ${mode.toLowerCase()} configuration loaded successfully`, 'info');
      } else {
        addToast(`No best ${mode.toLowerCase()} configuration found`, 'warning');
      }
    } catch (error) {
      addToast('Failed to load best configuration', 'error');
    }
  };

  const renderSlider = (
    label: string,
    value: number | number[],
    setValue: (val: number | number[]) => void,
    min: number,
    max: number,
    step: number,
    format?: (val: number) => string,
    tooltipKey?: keyof typeof tooltips
  ) => {
    const formatValue = format || ((val: number) => val.toString());
    const fieldId = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
            {label}
            {tooltipKey && (
              <div className="group relative">
                <HelpCircle 
                  className="h-4 w-4 text-gray-400 cursor-help" 
                  onMouseEnter={(e) => e.stopPropagation()}
                />
                <div className="absolute left-0 top-6 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  {tooltips[tooltipKey]}
                </div>
              </div>
            )}
          </label>
          {renderEditableValue(fieldId, value, setValue, min, max, step, formatValue)}
        </div>
        
        {mode === 'Manual' ? (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value as number}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              setValue(newValue);
              if (label === 'Batch Size') {
                checkBatchSizeWarning(newValue);
              }
            }}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-300 ease-out"
          />
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={(value as number[])[0]}
                onChange={(e) => {
                  const newMin = parseFloat(e.target.value);
                  const currentMax = (value as number[])[1];
                  
                  if (newMin < currentMax - step) {
                    setValue([newMin, currentMax]);
                  } else {
                    // Push max when min approaches
                    const newMax = Math.min(max, newMin + step * 2);
                    setValue([newMin, newMax]);
                  }
                  
                  if (label === 'Batch Size') {
                    checkBatchSizeWarning(newMin);
                  }
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider range-min transition-all duration-300 ease-out"
              />
              <span className="absolute -bottom-6 left-0 text-xs text-gray-500 dark:text-gray-400">
                Min: {formatValue((value as number[])[0])}
              </span>
            </div>
            <div className="relative">
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={(value as number[])[1]}
                onChange={(e) => {
                  const newMax = parseFloat(e.target.value);
                  const currentMin = (value as number[])[0];
                  
                  if (newMax > currentMin + step) {
                    setValue([currentMin, newMax]);
                  } else {
                    // Push min when max approaches
                    const newMin = Math.max(min, newMax - step * 2);
                    setValue([newMin, newMax]);
                  }
                  
                  if (label === 'Batch Size') {
                    checkBatchSizeWarning(newMax);
                  }
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider range-max transition-all duration-300 ease-out"
              />
              <span className="absolute -bottom-6 right-0 text-xs text-gray-500 dark:text-gray-400">
                Max: {formatValue((value as number[])[1])}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const loraPresets = {
    r: [8, 16, 32, 64],
    alpha: [16, 32, 64, 128],
    dropout: [0.05, 0.1, 0.15, 0.2]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <ThemeToggle />
        
        <ProgressStepper 
          currentStep={3} 
          steps={steps} 
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Configure Hyperparameters
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Fine-tune your training parameters for optimal results
          </p>
        </div>

        <div className="space-y-6">
          {/* Output Directory */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Output Configuration
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Output Directory
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={outputDirectory}
                  onChange={(e) => setOutputDirectory(e.target.value)}
                  disabled={isOutputDirectoryLocked}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                    isOutputDirectoryLocked
                      ? 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                />
                {isOutputDirectoryLocked && (
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              {isOutputDirectoryLocked && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Using default output path based on your dataset and model selection
                  </span>
                  <button
                    onClick={() => setIsOutputDirectoryLocked(false)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                  >
                    Edit Anyway
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Adapter Method */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Adapter Method
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['LoRA', 'QLoRA', 'LoFTQ'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setAdapterMethod(method)}
                  className={`p-4 border rounded-lg text-center transition-all ${
                    adapterMethod === method
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium">{method}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {method === 'LoRA' && 'Low-Rank Adaptation'}
                    {method === 'QLoRA' && 'Quantized LoRA'}
                    {method === 'LoFTQ' && 'LoRA Fine-Tuning'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Training Mode
            </h3>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {(['Manual', 'Automated'] as const).map((modeOption) => (
                <button
                  key={modeOption}
                  onClick={() => handleModeChange(modeOption)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    mode === modeOption
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {modeOption}
                </button>
              ))}
            </div>
          </div>

          {/* Training Parameters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Training Parameters
              </h3>
              <button
                type="button"
                className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 border border-blue-300 dark:border-blue-700 transition-colors"
                onClick={suggestBestConfig}
              >
                Suggest Best
              </button>
            </div>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${mode === 'Automated' ? 'space-y-4' : ''} ${isAnimating ? 'animate-pulse' : ''} transition-all duration-500`}>
              <div className={mode === 'Automated' ? 'pb-8' : ''}>
                {renderSlider(
                  'Learning Rate',
                  learningRate,
                  setLearningRate,
                  1e-6,
                  1e-3,
                  1e-6,
                  (val) => val.toExponential(1),
                  'Learning Rate'
                )}
              </div>
              
              <div className={mode === 'Automated' ? 'pb-8' : ''}>
                {renderSlider(
                  'Batch Size',
                  batchSize,
                  setBatchSize,
                  1,
                  32,
                  1,
                  undefined,
                  'Batch Size'
                )}
              </div>
              
              <div className={mode === 'Automated' ? 'pb-8' : ''}>
                {renderSlider(
                  'Epochs',
                  epochs,
                  setEpochs,
                  1,
                  20,
                  1,
                  undefined,
                  'Epochs'
                )}
              </div>
              
              <div className={mode === 'Automated' ? 'pb-8' : ''}>
                {renderSlider(
                  'Weight Decay',
                  weightDecay,
                  setWeightDecay,
                  0.001,
                  0.5,
                  0.001,
                  (val) => val.toFixed(3),
                  'Weight Decay'
                )}
              </div>
            </div>

            {/* Automated Mode Additional Options */}
            {mode === 'Automated' && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Optimization Settings
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Mode Logic
                    </label>
                    <select
                      value={modeLogic}
                      onChange={(e) => setModeLogic(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Bayesian Optimization</option>
                      <option>Grid Search</option>
                      <option>Random Search</option>
                      <option>Hyperband</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Limit
                    </label>
                    <input
                      type="number"
                      value={searchLimit}
                      onChange={(e) => setSearchLimit(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Loss
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={targetLoss}
                      onChange={(e) => setTargetLoss(parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* LoRA Parameters */}
          {adapterMethod === 'LoRA' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                LoRA Configuration
              </h3>
              <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${isAnimating ? 'animate-pulse' : ''} transition-all duration-500`}>
                {/* LoRA R */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rank (r)
                      </label>
                      <div className="group relative">
                        <HelpCircle 
                          className="h-4 w-4 text-gray-400 cursor-help" 
                          onMouseEnter={(e) => e.stopPropagation()}
                        />
                        <div className="absolute left-0 top-6 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {tooltips['Rank (r)']}
                        </div>
                      </div>
                    </div>
                    <span 
                      className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleStartEdit('lora-r', loraR)}
                    >
                      {editingField === 'lora-r' ? (
                        <input
                          type="number"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            const newValue = Math.max(8, Math.min(128, parseInt(editingValue) || 8));
                            setLoraR(newValue);
                            setEditingField(null);
                            setEditingValue('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newValue = Math.max(8, Math.min(128, parseInt(editingValue) || 8));
                              setLoraR(newValue);
                              setEditingField(null);
                              setEditingValue('');
                            } else if (e.key === 'Escape') {
                              setEditingField(null);
                              setEditingValue('');
                            }
                          }}
                          className="text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded px-2 py-1 text-gray-700 dark:text-gray-300 outline-none w-16 text-center"
                          autoFocus
                          min="8"
                          max="128"
                          step="8"
                        />
                      ) : (
                        loraR
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {loraPresets.r.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setLoraR(preset)}
                        className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                          loraR === preset
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={8}
                    max={128}
                    step={8}
                    value={loraR}
                    onChange={(e) => setLoraR(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-300 ease-out"
                  />
                </div>

                {/* LoRA Alpha */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Alpha
                      </label>
                      <div className="group relative">
                        <HelpCircle 
                          className="h-4 w-4 text-gray-400 cursor-help" 
                          onMouseEnter={(e) => e.stopPropagation()}
                        />
                        <div className="absolute left-0 top-6 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {tooltips['Alpha']}
                        </div>
                      </div>
                    </div>
                    <span 
                      className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleStartEdit('lora-alpha', loraAlpha)}
                    >
                      {editingField === 'lora-alpha' ? (
                        <input
                          type="number"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            const newValue = Math.max(16, Math.min(256, parseInt(editingValue) || 16));
                            setLoraAlpha(newValue);
                            setEditingField(null);
                            setEditingValue('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newValue = Math.max(16, Math.min(256, parseInt(editingValue) || 16));
                              setLoraAlpha(newValue);
                              setEditingField(null);
                              setEditingValue('');
                            } else if (e.key === 'Escape') {
                              setEditingField(null);
                              setEditingValue('');
                            }
                          }}
                          className="text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded px-2 py-1 text-gray-700 dark:text-gray-300 outline-none w-16 text-center"
                          autoFocus
                          min="16"
                          max="256"
                          step="16"
                        />
                      ) : (
                        loraAlpha
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {loraPresets.alpha.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setLoraAlpha(preset)}
                        className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                          loraAlpha === preset
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={256}
                    step={16}
                    value={loraAlpha}
                    onChange={(e) => setLoraAlpha(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-300 ease-out"
                  />
                </div>

                {/* LoRA Dropout */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dropout
                      </label>
                      <div className="group relative">
                        <HelpCircle 
                          className="h-4 w-4 text-gray-400 cursor-help" 
                          onMouseEnter={(e) => e.stopPropagation()}
                        />
                        <div className="absolute left-0 top-6 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          {tooltips['Dropout']}
                        </div>
                      </div>
                    </div>
                    <span 
                      className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleStartEdit('lora-dropout', loraDropout)}
                    >
                      {editingField === 'lora-dropout' ? (
                        <input
                          type="number"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            const newValue = Math.max(0.01, Math.min(0.5, parseFloat(editingValue) || 0.01));
                            setLoraDropout(newValue);
                            setEditingField(null);
                            setEditingValue('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const newValue = Math.max(0.01, Math.min(0.5, parseFloat(editingValue) || 0.01));
                              setLoraDropout(newValue);
                              setEditingField(null);
                              setEditingValue('');
                            } else if (e.key === 'Escape') {
                              setEditingField(null);
                              setEditingValue('');
                            }
                          }}
                          className="text-sm bg-white dark:bg-gray-800 border border-blue-500 rounded px-2 py-1 text-gray-700 dark:text-gray-300 outline-none w-16 text-center"
                          autoFocus
                          min="0.01"
                          max="0.5"
                          step="0.01"
                        />
                      ) : (
                        loraDropout.toFixed(2)
                      )}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {loraPresets.dropout.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setLoraDropout(preset)}
                        className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                          loraDropout === preset
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min={0.01}
                    max={0.5}
                    step={0.01}
                    value={loraDropout}
                    onChange={(e) => setLoraDropout(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider transition-all duration-300 ease-out"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8">
          <NavigationButtons
            onBack={handleBack}
            onNext={handleNext}
            canProceed={true}
            nextLabel="Continue to Fine-tuning"
            backLabel="Back to Model Selection"
          />
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.1s ease;
        }
        
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        
        .slider::-webkit-slider-thumb:active {
          transform: scale(1.05);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: all 0.1s ease;
        }
        
        .slider::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
        }
        
        .slider::-moz-range-thumb:active {
          transform: scale(1.05);
        }
        
        .range-min::-webkit-slider-thumb {
          background: #10b981;
        }
        
        .range-max::-webkit-slider-thumb {
          background: #ef4444;
        }
        
        .range-min::-moz-range-thumb {
          background: #10b981;
        }
        
        .range-max::-moz-range-thumb {
          background: #ef4444;
        }
        
        /* Ensure smooth dragging */
        .slider {
          outline: none;
          -webkit-appearance: none;
          user-select: none;
          touch-action: pan-x;
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider::-webkit-slider-track {
          background: transparent;
        }
        
        .slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
