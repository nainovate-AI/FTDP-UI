import React from 'react';

interface Dataset {
  id: string;
  name: string;
  description: string;
  size: string;
  format: string;
  taskType: string;
  samples: number;
  lastModified: string;
  tags?: string[];
}

interface ExistingDatasetsProps {
  datasets: Dataset[];
  selectedDataset: string | null;
  onDatasetSelect: (datasetId: string) => void;
  onDatasetEdit?: (datasetId: string) => void;
}

export const ExistingDatasets: React.FC<ExistingDatasetsProps> = ({
  datasets,
  selectedDataset,
  onDatasetSelect,
  onDatasetEdit
}) => {
  const handleEditClick = (e: React.MouseEvent, datasetId: string) => {
    e.stopPropagation(); // Prevent triggering dataset selection
    if (onDatasetEdit) {
      onDatasetEdit(datasetId);
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Existing Datasets
      </h2>
      <div className="space-y-4">
        {datasets.map((dataset) => (
          <div
            key={dataset.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedDataset === dataset.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
            onClick={() => onDatasetSelect(dataset.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {dataset.name}
                  </h3>
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                    {dataset.taskType}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {dataset.description}
                </p>
                {dataset.tags && dataset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {dataset.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{dataset.samples.toLocaleString()} samples</span>
                  <span>{dataset.size}</span>
                  <span>{dataset.format}</span>
                  <span>Modified {new Date(dataset.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="ml-4 flex items-center space-x-2">
                {/* Edit Button */}
                {onDatasetEdit && (
                  <button
                    onClick={(e) => handleEditClick(e, dataset.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    title="Edit dataset"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                )}
                
                {/* Selected Indicator */}
                {selectedDataset === dataset.id && (
                  <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
