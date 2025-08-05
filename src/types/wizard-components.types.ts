import { ComponentType } from 'react';
import { WizardStepProps } from './wizard.types';

export interface StepInfo {
  id: string;
  title: string;
  description?: string;
  enabled?: boolean;
  required?: boolean;
  order?: number;
}

export interface WizardStep extends StepInfo {
  component: ComponentType<WizardStepProps>;
}
