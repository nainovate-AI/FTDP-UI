import { useState } from 'react';

export function useModalState() {
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingDataset, setEditingDataset] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const openPreview = () => setShowPreview(true);
  const closePreview = () => setShowPreview(false);

  const openEditModal = (dataset: any) => {
    setEditingDataset(dataset);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDataset(null);
  };

  const setErrors = (errors: string[]) => {
    setValidationErrors(errors);
  };

  const clearErrors = () => {
    setValidationErrors([]);
  };

  return {
    showPreview,
    showEditModal,
    editingDataset,
    validationErrors,
    openPreview,
    closePreview,
    openEditModal,
    closeEditModal,
    setErrors,
    clearErrors,
  };
}
