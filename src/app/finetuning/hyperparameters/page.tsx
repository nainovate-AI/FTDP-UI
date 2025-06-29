'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  // Load existing hyperparameters from metadata on component mount
  useEffect(() => {
    const loadHyperparameters = async () => {
      try {
        const response = await fetch('/api/metadata');
        if (response.ok) {
          const metadata = await response.json();
          if (metadata.hyperparameters) {
            const hp = metadata.hyperparameters;
            setOutputDirectory(hp.outputDirectory || './fine_tuned_model');
            setAdapterMethod(hp.adapterMethod || 'LoRA');
            setMode(hp.mode || 'Manual');
            setModeLogic(hp.modeLogic || 'Bayesian Optimization');
            setSearchLimit(hp.searchLimit || 50);
            setTargetLoss(hp.targetLoss || 0.1);
            setLoraR(hp.loraR || 16);
            setLoraAlpha(hp.loraAlpha || 32);
            setLoraDropout(hp.loraDropout || 0.1);
            
            // Set training parameters based on mode
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

  // Save hyperparameters to metadata
  const saveHyperparameters = async () => {
    try {
      const hyperparameters = {
        outputDirectory,
        adapterMethod,
        mode,
        modeLogic,
        searchLimit,
        targetLoss,
        loraR,
        loraAlpha,
        loraDropout,
        // Save training parameters based on mode
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

      const response = await fetch('/api/metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hyperparameters
        }),
      });

      if (response.ok) {
        addToast('Hyperparameters saved successfully', 'success');
        return true;
      } else {
        throw new Error('Failed to save hyperparameters');
      }
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

  const renderSlider = (
    label: string,
    value: number | number[],
    setValue: (val: number | number[]) => void,
    min: number,
    max: number,
    step: number,
    format?: (val: number) => string
  ) => {
    const formatValue = format || ((val: number) => val.toString());
    
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Array.isArray(value) 
              ? `${formatValue(value[0])} - ${formatValue(value[1])}`
              : formatValue(value)
            }
          </span>
        </div>
        
        {mode === 'Manual' ? (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value as number}
            onChange={(e) => setValue(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        ) : (
          <div className="relative space-y-4">
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
                  
                  if (newMin < currentMax) {
                    // Normal case: maintain gap
                    setValue([newMin, currentMax]);
                  } else {
                    // Min slider approaches max: push max slider maintaining 1 step gap
                    const newMax = Math.min(max, newMin + step);
                    setValue([newMin, newMax]);
                  }
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider range-min"
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
                  
                  if (newMax > currentMin) {
                    // Normal case: maintain gap
                    setValue([currentMin, newMax]);
                  } else {
                    // Max slider approaches min: push min slider maintaining 1 step gap
                    const newMin = Math.max(min, newMax - step);
                    setValue([newMin, newMax]);
                  }
                }}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider range-max"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Training Parameters
            </h3>
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${mode === 'Automated' ? 'space-y-4' : ''}`}>
              <div className={mode === 'Automated' ? 'pb-8' : ''}>
                {renderSlider(
                  'Learning Rate',
                  learningRate,
                  setLearningRate,
                  1e-6,
                  1e-3,
                  1e-6,
                  (val) => val.toExponential(1)
                )}
              </div>
              
              <div className={mode === 'Automated' ? 'pb-8' : ''}>
                {renderSlider(
                  'Batch Size',
                  batchSize,
                  setBatchSize,
                  1,
                  32,
                  1
                )}
              </div>
              
              <div className={mode === 'Automated' ? 'pb-8' : ''}>
                {renderSlider(
                  'Epochs',
                  epochs,
                  setEpochs,
                  1,
                  20,
                  1
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
                  (val) => val.toFixed(3)
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* LoRA R */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Rank (r)
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {loraR}
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
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* LoRA Alpha */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Alpha
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {loraAlpha}
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
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* LoRA Dropout */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dropout
                    </label>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {loraDropout.toFixed(2)}
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
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
