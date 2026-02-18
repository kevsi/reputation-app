/**
 * 🎣 useFormSubmission - Hook personnalisé pour la soumission de formulaires
 * 
 * Ce hook gère:
 * - La soumission avec gestion d'erreurs
 * - L'affichage des toasts de succès/erreur
 * - La validation côté client avant soumission
 * - Le mapping des erreurs API vers les champs
 */

import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { ApiErrorHandler, logger } from '@/lib/api-error-handler';
import { extractApiErrors, setFormErrors } from '@/components/ui/form-field';
import { ZodError } from 'zod';

// ============================================
// TYPES
// ============================================

export interface UseFormSubmissionOptions<T extends Record<string, unknown>> {
  /** Fonction à exécuter lors de la soumission */
  onSubmit: (data: T) => Promise<void>;
  /** Callback en cas de succès */
  onSuccess?: (data: T) => void;
  /** Callback en cas d'erreur */
  onError?: (error: unknown) => void;
  /** Message de succès à afficher */
  successMessage?: string;
  /** Message d'erreur à afficher (personnalisé) */
  errorMessage?: string;
  /** Afficher le toast de succès */
  showSuccessToast?: boolean;
  /** Afficher le toast d'erreur */
  showErrorToast?: boolean;
  /** Schema de validation Zod (optionnel) */
  validationSchema?: any;
  /** Mapper les erreurs API vers les champs du formulaire */
  mapErrorsToFields?: boolean;
}

export interface UseFormSubmissionReturn<T extends Record<string, unknown>> {
  /** Si le formulaire est en cours de soumission */
  isSubmitting: boolean;
  /** Erreur générale (non liée à un champ) */
  submitError: string | null;
  /** Fonction de soumission */
  handleSubmit: (data: T) => Promise<void>;
  /** Réinitialiser l'état d'erreur */
  resetSubmitState: () => void;
}

// ============================================
// HOOK
// ============================================

/**
 * Hook pour gérer la soumission d'un formulaire avec erreurs
 */
export function useFormSubmission<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
  options: UseFormSubmissionOptions<T>
): UseFormSubmissionReturn<T> {
  const {
    onSubmit,
    onSuccess,
    onError,
    successMessage = 'Opération réussie',
    errorMessage,
    showSuccessToast = true,
    showErrorToast = true,
    validationSchema,
    mapErrorsToFields = true
  } = options;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Valide les données avec Zod si un schéma est fourni
   */
  const validateData = useCallback(async (data: T): Promise<boolean> => {
    if (!validationSchema) return true;

    try {
      await validationSchema.parseAsync(data);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        // Map Zod errors to form fields
        error.errors.forEach((err) => {
          const path = err.path.join('.');
          form.setError(path as any, {
            type: 'manual',
            message: err.message
          });
        });
        
        if (showErrorToast) {
          toast.error('Veuillez corriger les erreurs dans le formulaire');
        }
      }
      return false;
    }
  }, [validationSchema, form, showErrorToast]);

  /**
   * Gère la réponse d'erreur de l'API
   */
  const handleApiError = useCallback((error: unknown, status: number) => {
    // Parser la réponse d'erreur
    const apiError = ApiErrorHandler.parseErrorResponse(error, status);
    const userMessage = ApiErrorHandler.getUserMessage(apiError);
    
    // Logger l'erreur
    logger.error('Form submission failed', error);
    
    // Essayer de mapper les erreurs vers les champs
    if (mapErrorsToFields) {
      const fieldErrors = extractApiErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setFormErrors(form, fieldErrors);
        
        if (showErrorToast) {
          toast.error('Veuillez corriger les erreurs.indiquées dans le formulaire');
        }
        return;
      }
    }
    
    // Afficher le message d'erreur
    if (showErrorToast) {
      toast.error(errorMessage || userMessage);
    }
    
    setSubmitError(errorMessage || userMessage);
    
    // Appeler le callback d'erreur
    onError?.(error);
  }, [form, mapErrorsToFields, showErrorToast, errorMessage, onError]);

  /**
   * Fonction principale de soumission
   */
  const handleSubmit = useCallback(async (data: T) => {
    // Reset error state
    setSubmitError(null);
    
    // Valider les données avant soumission
    const isValid = await validateData(data);
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(data);
      
      // Afficher le toast de succès
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      // Callback de succès
      onSuccess?.(data);
      
      logger.info('Form submitted successfully', data);
      
    } catch (error: any) {
      // Gérer les différents types d'erreurs
      
      if (error?.response) {
        // Erreur HTTP avec réponse
        const status = error.response.status;
        const errorData = error.response.data;
        handleApiError(errorData, status);
      } 
      else if (error?.request) {
        // Erreur réseau (pas de réponse)
        const status = 0;
        handleApiError({ error: { message: 'Erreur réseau' } }, status);
      } 
      else {
        // Erreur inattendue
        logger.error('Unexpected error during submission', error);
        
        if (showErrorToast) {
          toast.error(errorMessage || 'Une erreur inattendue s\'est produite');
        }
        
        setSubmitError(errorMessage || 'Une erreur inattendue s\'est produite');
        onError?.(error);
      }
    } 
    finally {
      setIsSubmitting(false);
    }
  }, [
    validateData, 
    onSubmit, 
    showSuccessToast, 
    successMessage, 
    onSuccess,
    handleApiError, 
    errorMessage, 
    onError,
    showErrorToast
  ]);

  /**
   * Reset l'état de soumission
   */
  const resetSubmitState = useCallback(() => {
    setSubmitError(null);
    setIsSubmitting(false);
  }, []);

  return {
    isSubmitting,
    submitError,
    handleSubmit,
    resetSubmitState
  };
}

// ============================================
// HOOKS SPÉCIALISÉS
// ============================================

/**
 * Hook pour la création d'une ressource
 */
export function useCreateResource<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
  options: UseFormSubmissionOptions<T>
) {
  return useFormSubmission(form, {
    ...options,
    successMessage: options.successMessage || 'Ressource créée avec succès'
  });
}

/**
 * Hook pour la mise à jour d'une ressource
 */
export function useUpdateResource<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
  options: UseFormSubmissionOptions<T>
) {
  return useFormSubmission(form, {
    ...options,
    successMessage: options.successMessage || 'Ressource mise à jour avec succès'
  });
}

/**
 * Hook pour la suppression d'une ressource
 */
export function useDeleteResource<T extends Record<string, unknown>>(
  form: UseFormReturn<T>,
  options: UseFormSubmissionOptions<T>
) {
  return useFormSubmission(form, {
    ...options,
    successMessage: options.successMessage || 'Ressource supprimée avec succès'
  });
}

// ============================================
// HOOK POUR LA VALIDATION EN TEMPS RÉEL
// ============================================

/**
 * Hook pour la validation d'un champ en temps réel
 */
export function useFieldValidation(
  form: UseFormReturn<any>,
  fieldName: string,
  validationFn?: (value: any) => Promise<boolean>
) {
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback(async (value: any) => {
    if (!validationFn) {
      // Utiliser la validation native de react-hook-form
      const result = await form.trigger(fieldName);
      setIsValid(result);
      return result;
    }

    setIsValidating(true);
    try {
      const result = await validationFn(value);
      setIsValid(result);
      return result;
    } catch {
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [form, fieldName, validationFn]);

  const validateDebounced = useCallback(
    debounce(async (value: any) => {
      await validate(value);
    }, 500),
    [validate]
  );

  return {
    isValidating,
    isValid,
    validate,
    validateDebounced
  };
}

// ============================================
// UTILITAIRES
// ============================================

/**
 * Debounce function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Hook pour gérer l'état d'un champ avec validation
 */
export function useFieldState<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const handleChange = useCallback((newValue: T) => {
    setValue(newValue);
    // Clear error on change
    if (error) setError(null);
  }, [error]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
  }, []);

  const setFieldError = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
    setIsTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    isTouched,
    handleChange,
    handleBlur,
    setFieldError,
    setValue,
    reset
  };
}
