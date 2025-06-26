interface Dataset {
  id: string;
  uid?: string; // Unique identifier for dataset - used across fine-tuning process (will be required for new datasets)
  name: string;
  description: string;
  size: string;
  format: string;
  taskType: string;
  samples: number;
  lastModified: string;
  tags?: string[];
  inputColumn?: string;
  targetColumn?: string;
  columns?: string[];
  preview?: any[];
  filePath?: string; // Path to the uploaded dataset file
  originalFileName?: string; // Original name of uploaded file
}

// Load datasets from JSON file
export const loadDatasets = async (): Promise<Dataset[]> => {
  try {
    const response = await fetch('/api/datasets');
    if (!response.ok) {
      // Fallback to local import if API is not available
      const datasetsModule = await import('../data/datasets.json');
      return datasetsModule.default;
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading datasets:', error);
    // Fallback to local import
    try {
      const datasetsModule = await import('../data/datasets.json');
      return datasetsModule.default;
    } catch (fallbackError) {
      console.error('Error loading fallback datasets:', fallbackError);
      return [];
    }
  }
};

// Save datasets to JSON file (via API)
export const saveDatasets = async (datasets: Dataset[]): Promise<boolean> => {
  try {
    const response = await fetch('/api/datasets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datasets),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving datasets:', error);
    return false;
  }
};

// Add a new dataset
export const addDataset = async (dataset: Dataset): Promise<boolean> => {
  try {
    const datasets = await loadDatasets();
    const newDataset = {
      ...dataset,
      id: Date.now().toString(),
      uid: dataset.uid || generateDatasetUID(), // Generate UID if not provided
      lastModified: new Date().toISOString().split('T')[0],
      // TODO: In real implementation, filePath would be set after actual file upload to server
      filePath: dataset.filePath || `/uploads/datasets/${dataset.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.csv`,
      originalFileName: dataset.originalFileName || `${dataset.name}.csv`
    };
    const updatedDatasets = [...datasets, newDataset];
    return await saveDatasets(updatedDatasets);
  } catch (error) {
    console.error('Error adding dataset:', error);
    return false;
  }
};

// Update an existing dataset
export const updateDataset = async (datasetId: string, updates: Partial<Dataset>): Promise<boolean> => {
  try {
    const datasets = await loadDatasets();
    const datasetIndex = datasets.findIndex(d => d.id === datasetId);
    if (datasetIndex === -1) {
      throw new Error('Dataset not found');
    }
    
    datasets[datasetIndex] = {
      ...datasets[datasetIndex],
      ...updates,
      lastModified: new Date().toISOString().split('T')[0],
    };
    
    return await saveDatasets(datasets);
  } catch (error) {
    console.error('Error updating dataset:', error);
    return false;
  }
};

// Delete a dataset
export const deleteDataset = async (datasetId: string): Promise<boolean> => {
  try {
    const datasets = await loadDatasets();
    const filteredDatasets = datasets.filter(d => d.id !== datasetId);
    return await saveDatasets(filteredDatasets);
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return false;
  }
};

// Generate a unique identifier (UID) for datasets
// TODO: Replace with backend-generated UUID when integrating with real API
export const generateDatasetUID = (): string => {
  return `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Metadata management functions
// TODO: Replace with real API calls when backend is available
interface FinetuningMetadata {
  finetuningSession: {
    id: string | null;
    createdAt: string | null;
    lastModified: string | null;
    status: string;
  };
  dataset: {
    uid: string | null;
    id: string | null;
    name: string | null;
    selectedAt: string | null;
  };
  model: {
    baseModel: string | null;
    modelName: string | null;
    parameters: Record<string, any>;
  };
  training: {
    epochs: number | null;
    batchSize: number | null;
    learningRate: number | null;
    validationSplit: number | null;
  };
  deployment: {
    endpoint: string | null;
    version: string | null;
    environment: string | null;
  };
}

// Load metadata from JSON file
export const loadMetadata = async (): Promise<FinetuningMetadata> => {
  try {
    // TODO: Replace with API call when backend is available
    const response = await fetch('/api/metadata');
    if (!response.ok) {
      // Fallback to local import if API is not available
      const metadataModule = await import('../data/metadata.json');
      return metadataModule.default as FinetuningMetadata;
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading metadata:', error);
    // Fallback to local import
    try {
      const metadataModule = await import('../data/metadata.json');
      return metadataModule.default as FinetuningMetadata;
    } catch (fallbackError) {
      console.error('Error loading fallback metadata:', fallbackError);
      // Return default metadata structure
      return {
        finetuningSession: { id: null, createdAt: null, lastModified: null, status: "dataset_selection" },
        dataset: { uid: null, id: null, name: null, selectedAt: null },
        model: { baseModel: null, modelName: null, parameters: {} },
        training: { epochs: null, batchSize: null, learningRate: null, validationSplit: null },
        deployment: { endpoint: null, version: null, environment: null }
      };
    }
  }
};

// Save metadata to JSON file
export const saveMetadata = async (metadata: FinetuningMetadata): Promise<boolean> => {
  try {
    // TODO: Replace with real API call when backend is available
    const response = await fetch('/api/metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving metadata:', error);
    return false;
  }
};

// Update dataset selection in metadata
export const updateDatasetSelection = async (dataset: Dataset): Promise<boolean> => {
  try {
    const metadata = await loadMetadata();
    
    // Generate UID if dataset doesn't have one
    const datasetUID = dataset.uid || generateDatasetUID();
    
    // Update dataset information in metadata
    metadata.dataset = {
      uid: datasetUID,
      id: dataset.id,
      name: dataset.name,
      selectedAt: new Date().toISOString()
    };
    
    // Update session info
    metadata.finetuningSession.lastModified = new Date().toISOString();
    if (!metadata.finetuningSession.id) {
      metadata.finetuningSession.id = `session_${Date.now()}`;
      metadata.finetuningSession.createdAt = new Date().toISOString();
    }
    
    return await saveMetadata(metadata);
  } catch (error) {
    console.error('Error updating dataset selection in metadata:', error);
    return false;
  }
};

export type { Dataset };
