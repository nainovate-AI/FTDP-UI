import React, { useState } from 'react';
import { HardDrive, Cloud, Edit3, Check, X, ExternalLink } from 'lucide-react';

interface ModelSavingState {
  type: 'local' | 'huggingface';
  localPath: string;
  isLocalPathCustom: boolean;
  huggingfaceRepo: string;
  isPrivateRepo: boolean;
}

interface JobConfiguration {
  model: {
    uid: string;
    baseModel: string;
    modelName: string;
    provider: string;
  };
  dataset: {
    uid: string;
    name: string;
    selectedAt: string;
  };
  hyperparameters: {
    uid: string;
    outputDirectory: string;
    adapterMethod: string;
    mode: string;
    learningRate: number | number[];
    batchSize: number | number[];
    epochs: number | number[];
    weightDecay: number | number[];
    loraR: number | number[];
    loraAlpha: number | number[];
    loraDropout: number | number[];
    modeLogic?: string;
    searchLimit?: number;
    targetLoss?: number;
  };
}

interface ModelSavingOptionsProps {
  modelSaving: ModelSavingState;
  setModelSaving: React.Dispatch<React.SetStateAction<ModelSavingState>>;
  jobConfig: JobConfiguration;
}

export const ModelSavingOptions: React.FC<ModelSavingOptionsProps> = ({
  modelSaving,
  setModelSaving,
  jobConfig
}) => {
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [tempPath, setTempPath] = useState('');

  const handleSavingTypeChange = (type: 'local' | 'huggingface') => {
    setModelSaving(prev => ({ ...prev, type }));
  };

  const handleEditPath = () => {
    setTempPath(modelSaving.localPath);
    setIsEditingPath(true);
  };

  const handleSavePath = () => {
    setModelSaving(prev => ({
      ...prev,
      localPath: tempPath,
      isLocalPathCustom: true
    }));
    setIsEditingPath(false);
  };

  const handleCancelEdit = () => {
    setTempPath('');
    setIsEditingPath(false);
  };

  const getDisplayName = (baseModel: string): string => {
    const parts = baseModel.split('/');
    return parts[parts.length - 1] || baseModel;
  };

  const handleHuggingFaceRepoChange = (value: string) => {
    // Auto-format repository name
    const formatted = value.toLowerCase().replace(/[^a-z0-9\-_\/]/g, '');
    setModelSaving(prev => ({ ...prev, huggingfaceRepo: formatted }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Model Saving Options
        </h3>
      </div>

      {/* Saving Type Selection */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              modelSaving.type === 'local'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleSavingTypeChange('local')}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                modelSaving.type === 'local' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {modelSaving.type === 'local' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <HardDrive className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Local</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Save to local filesystem</p>
              </div>
            </div>
          </div>

          {/* Hugging Face Option */}
          <div
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              modelSaving.type === 'huggingface'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => handleSavingTypeChange('huggingface')}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                modelSaving.type === 'huggingface' 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {modelSaving.type === 'huggingface' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <Cloud className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Hugging Face</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload to Hugging Face Hub</p>
              </div>
            </div>
          </div>
        </div>

        {/* Local Path Configuration */}
        {modelSaving.type === 'local' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Save Path
            </label>
            <div className="space-y-3">
              {isEditingPath ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tempPath}
                    onChange={(e) => setTempPath(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="./ft/job_12345"
                    autoFocus
                  />
                  <button
                    onClick={handleSavePath}
                    className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <code className="text-sm text-gray-900 dark:text-white font-mono">
                    {modelSaving.localPath}
                  </code>
                  <button
                    onClick={handleEditPath}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Path</span>
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Final trained model will be saved to this directory
              </p>
            </div>
          </div>
        )}

        {/* Hugging Face Configuration */}
        {modelSaving.type === 'huggingface' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repository Name
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={modelSaving.huggingfaceRepo}
                  onChange={(e) => handleHuggingFaceRepoChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`username/${getDisplayName(jobConfig.model.baseModel)}-finetuned`}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Format: username/model-name (lowercase, hyphens allowed)
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={modelSaving.isPrivateRepo}
                  onChange={(e) => setModelSaving(prev => ({ ...prev, isPrivateRepo: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Private repository</span>
              </label>
              <div className="group relative">
                <ExternalLink className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute left-0 top-6 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                  Private repositories are only visible to you and collaborators you invite. Public repositories are visible to everyone.
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Cloud className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  Hugging Face Integration
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Your model will be automatically uploaded to Hugging Face Hub after training completes.
                  Make sure you have proper authentication configured.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
