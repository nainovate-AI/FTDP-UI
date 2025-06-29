import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

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

interface JobConfigurationSummaryProps {
  jobConfig: JobConfiguration;
}

export const JobConfigurationSummary: React.FC<JobConfigurationSummaryProps> = ({ jobConfig }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatValue = (value: number | number[]): string => {
    if (Array.isArray(value)) {
      if (value[0] < 0.001) {
        return `${value[0].toExponential(1)} - ${value[1].toExponential(1)}`;
      }
      return `${value[0]} - ${value[1]}`;
    }
    if (value < 0.001) {
      return value.toExponential(1);
    }
    return value.toString();
  };

  const getDisplayName = (baseModel: string): string => {
    // Extract the model name from full model path
    const parts = baseModel.split('/');
    return parts[parts.length - 1] || baseModel;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div 
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Job Configuration Summary
          </h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Model Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Model Configuration
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Model:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {getDisplayName(jobConfig.model.baseModel)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Provider:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {jobConfig.model.provider}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Adapter:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {jobConfig.hyperparameters.adapterMethod}
                  </span>
                </div>
              </div>
            </div>

            {/* Dataset Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-green-500" />
                Dataset Configuration
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Dataset:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {jobConfig.dataset.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Selected:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(jobConfig.dataset.selectedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Hyperparameters Configuration */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-500" />
              Training Configuration
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Mode:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {jobConfig.hyperparameters.mode}
                    </span>
                  </div>
                  {jobConfig.hyperparameters.mode === 'Automated' && jobConfig.hyperparameters.modeLogic && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Logic:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {jobConfig.hyperparameters.modeLogic}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Learning Rate:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(jobConfig.hyperparameters.learningRate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Batch Size:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(jobConfig.hyperparameters.batchSize)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Epochs:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(jobConfig.hyperparameters.epochs)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Weight Decay:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(jobConfig.hyperparameters.weightDecay)}
                    </span>
                  </div>
                  {jobConfig.hyperparameters.mode === 'Automated' && (
                    <>
                      {jobConfig.hyperparameters.searchLimit && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Search Limit:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {jobConfig.hyperparameters.searchLimit}
                          </span>
                        </div>
                      )}
                      {jobConfig.hyperparameters.targetLoss && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Target Loss:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {jobConfig.hyperparameters.targetLoss}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">LoRA Rank (r):</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(jobConfig.hyperparameters.loraR)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">LoRA Alpha:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(jobConfig.hyperparameters.loraAlpha)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">LoRA Dropout:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatValue(jobConfig.hyperparameters.loraDropout)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Output Directory Note */}
          <div className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Checkpoint Directory
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Training checkpoints will be saved to: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">{jobConfig.hyperparameters.outputDirectory}</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
