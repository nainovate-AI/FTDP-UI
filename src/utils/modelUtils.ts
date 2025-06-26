import type { Model } from '../types';
import { loadMetadata, saveMetadata } from './datasetUtils';

// Generate a unique identifier (UID) for models
export const generateModelUID = (model: Model): string => {
  const base = `${model.id}__${model.name}`;
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = ((hash << 5) - hash) + base.charCodeAt(i);
    hash |= 0;
  }
  return `${Math.abs(hash)}`;
};

// Update model selection in metadata
export const updateModelSelection = async (model: Model): Promise<boolean> => {
  try {
    const metadata = await loadMetadata();
    const modelUID = generateModelUID(model);
    metadata.model = {
      uid: modelUID,
      baseModel: model.id,
      modelName: model.name,
      provider: model.provider
    };
    metadata.finetuningSession.lastModified = new Date().toISOString();
    return await saveMetadata(metadata);
  } catch (error) {
    console.error('Error updating model selection in metadata:', error);
    return false;
  }
};
