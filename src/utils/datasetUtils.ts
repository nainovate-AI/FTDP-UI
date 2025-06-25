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
  inputColumn?: string;
  targetColumn?: string;
  columns?: string[];
  preview?: any[];
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
      lastModified: new Date().toISOString().split('T')[0],
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

export type { Dataset };
