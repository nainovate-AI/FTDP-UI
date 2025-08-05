export interface WizardState {
  currentStepIndex: number;
  formData: Record<string, any>;
  errors: Record<string, any>;
  visited: string[];
  isSubmitting: boolean;
}

export type WizardAction =
  | { type: 'SET_STEP_DATA'; stepId: string; data: any }
  | { type: 'SET_STEP_ERRORS'; stepId: string; errors: any }
  | { type: 'NEXT_STEP' }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'GO_TO_STEP'; index: number }
  | { type: 'MARK_VISITED'; stepId: string }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET' };

export interface ValidationResult {
  isValid: boolean;
  errors?: Record<string, string>;
}

export interface WizardStepProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
  errors?: any;
  isFirstStep: boolean;
  isLastStep: boolean;
}
