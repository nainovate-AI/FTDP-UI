import { useState, useEffect } from 'react';
import { loadDatasets, addDataset, updateDataset, deleteDataset, updateDatasetSelection, type Dataset } from '../utils/datasetUtils';

export function useDatasetManagement() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load datasets on mount
  useEffect(() => {
    const loadInitialDatasets = async () => {
      try {
        setLoading(true);
        const loadedDatasets = await loadDatasets();
        setDatasets(loadedDatasets);
        setError(null);
      } catch (err) {
        console.error('Failed to load datasets:', err);
        setError('Failed to load datasets');
        setDatasets([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialDatasets();
  }, []);

  const handleDatasetSelect = async (datasetId: string) => {
    setSelectedDataset(datasetId);
    
    // Update metadata with selected dataset
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      try {
        await updateDatasetSelection(dataset);
        console.log('Dataset selection saved to metadata:', dataset.uid || dataset.id);
      } catch (error) {
        console.error('Failed to update metadata with dataset selection:', error);
      }
    }
  };

  const handleDatasetSave = async (datasetData: any): Promise<boolean> => {
    try {
      const success = await addDataset(datasetData);
      if (success) {
        // Reload datasets to include the new one
        const updatedDatasets = await loadDatasets();
        setDatasets(updatedDatasets);
        console.log('Dataset saved successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save dataset:', error);
      setError('Failed to save dataset');
      return false;
    }
  };

  const handleDatasetUpdate = async (datasetId: string, updates: Partial<Dataset>): Promise<boolean> => {
    try {
      const success = await updateDataset(datasetId, updates);
      if (success) {
        // Update local state
        setDatasets(prev => prev.map(d => 
          d.id === datasetId ? { ...d, ...updates } : d
        ));
        console.log('Dataset updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update dataset:', error);
      setError('Failed to update dataset');
      return false;
    }
  };

  const handleDatasetDelete = async (datasetId: string): Promise<boolean> => {
    try {
      const success = await deleteDataset(datasetId);
      if (success) {
        // Remove from local state
        setDatasets(prev => prev.filter(d => d.id !== datasetId));
        // Clear selection if the deleted dataset was selected
        if (selectedDataset === datasetId) {
          setSelectedDataset(null);
        }
        console.log('Dataset deleted successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete dataset:', error);
      setError('Failed to delete dataset');
      return false;
    }
  };

  const getSelectedDatasetData = () => {
    return datasets.find(d => d.id === selectedDataset) || null;
  };

  return {
    datasets,
    selectedDataset,
    loading,
    error,
    handleDatasetSelect,
    handleDatasetSave,
    handleDatasetUpdate,
    handleDatasetDelete,
    getSelectedDatasetData,
  };
}
