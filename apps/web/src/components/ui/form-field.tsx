/**
 * 🎨 FormField Component avec gestion d'erreurs avancée
 * 
 * Ce composant enrichit les champs de formulaire avec:
 * - Validation en temps réel
 * - Messages d'erreur stylisés
 * - Indicateurs visuels d'état (success, error, loading)
 * - Support pour différents types de champs
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2, HelpCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

// ============================================
// TYPES
// ============================================

export interface FormFieldProps<
  TFieldValues extends Record<string, unknown> = Record<string, unknown>,
  TName extends string = string
> {
  /** Nom du champ */
  name: TName;
  /** Label à afficher */
  label?: string;
  /** Description aide */
  description?: string;
  /** Placeholder */
  placeholder?: string;
  /** Si le champ est obligatoire */
  required?: boolean;
  /** Si le champ est désactivé */
  disabled?: boolean;
  /** Classe CSS supplémentaire */
  className?: string;
  /** Callback lors du changement */
  onChange?: (value: unknown) => void;
  /** Configuration de validation temps réel */
  validateOnChange?: boolean;
  /** Callback de validation personnalisée */
  customValidation?: (value: unknown) => string | undefined;
  /** Enfants (champ personnalisé) */
  children?: React.ReactNode;
}

export interface InputFieldProps extends FormFieldProps {
  /** Type d'input */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  /** Valeur par défaut */
  defaultValue?: string;
  /** Icône à gauche */
  leftIcon?: React.ReactNode;
  /** Icône à droite */
  rightIcon?: React.ReactNode;
  /** Montrer/masquer le mot de passe */
  showPasswordToggle?: boolean;
}

export interface SelectFieldProps extends FormFieldProps {
  /** Options du select */
  options: { value: string; label: string; disabled?: boolean }[];
  /** Placeholder par défaut */
  defaultPlaceholder?: string;
}

export interface TextareaFieldProps extends FormFieldProps {
  /** Nombre de lignes */
  rows?: number;
  /** Hauteur automatique */
  autoResize?: boolean;
  /** Valeur par défaut */
  defaultValue?: string;
}

export interface SwitchFieldProps extends FormFieldProps {
  /** Label description quand activé */
  onLabel?: string;
  /** Label description quand désactivé */
  offLabel?: string;
}

export interface CheckboxFieldProps extends FormFieldProps {
  /** Label à afficher à côté de la checkbox */
  checkboxLabel?: string;
}

// ============================================
// COMPOSANT PRINCIPAL: ENHANCED FORM FIELD
// ============================================

/**
 * Hook pour gérer l'état de validation d'un champ
 */
function useFieldValidation<T extends Record<string, unknown>>(
  name: string,
  form: any,
  validateOnChange?: boolean
) {
  const [isValidating, setIsValidating] = React.useState(false);
  const [isValid, setIsValid] = React.useState(false);
  
  React.useEffect(() => {
    if (!form) return;
    
    const subscription = form.watch((values: T) => {
      const value = values?.[name];
      if (validateOnChange && value !== undefined) {
        // Petit délai pour éviter trop de re-renders
        const timer = setTimeout(() => {
          form.trigger(name).then((isValid: boolean) => {
            setIsValid(isValid);
          });
        }, 300);
        return () => clearTimeout(timer);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, name, validateOnChange]);
  
  return { isValidating, isValid };
}

// ============================================
// COMPOSANTS DE CHAMPS INDIVIDUELS
// ============================================

/**
 * 🎯 InputField - Champ de saisie enrichi
 */
export const InputField = React.forwardRef<
  HTMLInputElement,
  InputFieldProps & { form: any }
>(({ 
  form, 
  name, 
  label, 
  description, 
  placeholder, 
  required, 
  disabled,
  className,
  type = 'text',
  defaultValue,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  validateOnChange,
  onChange,
  children,
  ...props 
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { isValidating, isValid } = useFieldValidation(name, form, validateOnChange);
  const fieldError = form.formState.errors[name];
  
  const inputType = showPasswordToggle && showPassword ? 'text' : type;
  
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel required={required}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              {/* Icône de gauche */}
              {leftIcon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {leftIcon}
                </div>
              )}
              
              <Input
                {...field}
                ref={ref}
                type={inputType}
                placeholder={placeholder}
                disabled={disabled}
                defaultValue={defaultValue}
                className={cn(
                  leftIcon && 'pl-10',
                  (rightIcon || showPasswordToggle || isValidating || (isValid && field.value)) && 'pr-10',
                  fieldError && 'border-destructive focus:ring-destructive/20',
                  isValid && field.value && 'border-green-500 focus:ring-green-500/20'
                )}
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e.target.value);
                }}
                {...props}
              />
              
              {/* Indicateurs de droite */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isValidating && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {!isValidating && isValid && field.value && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                {!isValidating && fieldError && (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
                {showPasswordToggle && type === 'password' && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <span className="text-xs">🙈</span>
                    ) : (
                      <span className="text-xs">👁️</span>
                    )}
                  </button>
                )}
                {rightIcon && !showPasswordToggle && rightIcon}
              </div>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
});

InputField.displayName = 'InputField';

/**
 * 📝 TextareaField - Champ de texte multiligne enrichi
 */
export const TextareaField = React.forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps & { form: any }
>(({ 
  form, 
  name, 
  label, 
  description, 
  placeholder, 
  required, 
  disabled,
  className,
  rows = 4,
  autoResize,
  defaultValue,
  validateOnChange,
  onChange,
  ...props 
}, ref) => {
  const { isValid, isValidating } = useFieldValidation(name, form, validateOnChange);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useEffect(() => {
    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [autoResize]);
  
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel required={required}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="relative">
              <Textarea
                {...field}
                ref={(e) => {
                  (field as any).ref(e);
                  if (ref && 'current' in ref) {
                    (ref as React.MutableRefObject<HTMLTextAreaElement>).current = e;
                  }
                }}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                defaultValue={defaultValue}
                className={cn(
                  field.error && 'border-destructive focus:ring-destructive/20',
                  isValid && field.value && 'border-green-500 focus:ring-green-500/20',
                  autoResize && 'resize-none overflow-hidden'
                )}
                onChange={(e) => {
                  field.onChange(e);
                  onChange?.(e.target.value);
                }}
                {...props}
              />
              {/* Indicateur de validation */}
              <div className="absolute right-3 top-3 flex items-center gap-2">
                {isValidating && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
                {!isValidating && isValid && field.value && (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                )}
                {!isValidating && field.error && (
                  <AlertCircle className="w-4 h-4 text-destructive" />
                )}
              </div>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
});

TextareaField.displayName = 'TextareaField';

/**
 * 🎯 SelectField - Liste déroulante enrichie
 */
export const SelectField = React.forwardRef<
  HTMLButtonElement,
  SelectFieldProps & { form: any }
>(({ 
  form, 
  name, 
  label, 
  description, 
  placeholder, 
  required, 
  disabled,
  className,
  options,
  defaultPlaceholder = 'Sélectionner une option',
  validateOnChange,
  onChange,
  ...props 
}, ref) => {
  const { isValid } = useFieldValidation(name, form, validateOnChange);
  
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel required={required}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onChange?.(value);
              }}
              defaultValue={field.value}
              disabled={disabled}
              value={field.value}
            >
              <SelectTrigger 
                className={cn(
                  field.error && 'border-destructive focus:ring-destructive/20',
                  isValid && field.value && 'border-green-500 focus:ring-green-500/20'
                )}
              >
                <SelectValue placeholder={defaultPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
});

SelectField.displayName = 'SelectField';

/**
 * 🔘 SwitchField - Interrupteur enrichi
 */
export const SwitchField = React.forwardRef<
  HTMLButtonElement,
  SwitchFieldProps & { form: any }
>(({ 
  form, 
  name, 
  label, 
  description, 
  required, 
  disabled,
  className,
  onLabel,
  offLabel,
  validateOnChange,
  onChange,
  ...props 
}, ref) => {
  const { isValid } = useFieldValidation(name, form, validateOnChange);
  
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-center justify-between space-y-0 rounded-lg border p-4', className)}>
          <div className="space-y-0.5">
            {label && (
              <FormLabel className="text-base">
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            {description && <FormDescription>{description}</FormDescription>}
            {(onLabel || offLabel) && (
              <p className="text-sm text-muted-foreground">
                {field.value ? onLabel : offLabel}
              </p>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                onChange?.(checked);
              }}
              disabled={disabled}
              {...props}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
});

SwitchField.displayName = 'SwitchField';

/**
 * ☑️ CheckboxField - Case à cocher enrichie
 */
export const CheckboxField = React.forwardRef<
  HTMLButtonElement,
  CheckboxFieldProps & { form: any }
>(({ 
  form, 
  name, 
  label,
  checkboxLabel,
  description, 
  required, 
  disabled,
  className,
  validateOnChange,
  onChange,
  ...props 
}, ref) => {
  const { isValid } = useFieldValidation(name, form, validateOnChange);
  
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-start space-x-3 space-y-0', className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                onChange?.(checked);
              }}
              disabled={disabled}
              {...props}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            {label && (
              <FormLabel required={required}>
                {label}
                {required && <span className="text-destructive ml-1">*</span>}
              </FormLabel>
            )}
            {checkboxLabel && (
              <span className="text-sm font-normal">{checkboxLabel}</span>
            )}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
});

CheckboxField.displayName = 'CheckboxField';

// ============================================
// COMPOSANT DE MESSAGE D'ERREUR GLOBAL
// ============================================

/**
 * 🚨 FormErrorSummary - Résumé des erreurs du formulaire
 */
interface FormErrorSummaryProps {
  /** Erreurs à afficher */
  errors: Record<string, { message?: string }>;
  /** Titre du résumé */
  title?: string;
  /** Classe CSS */
  className?: string;
}

export function FormErrorSummary({ 
  errors, 
  title = 'Veuillez corriger les erreurs suivantes:',
  className 
}: FormErrorSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([_, value]) => value?.message);
  
  if (errorEntries.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-lg border border-destructive bg-destructive/10 p-4',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-destructive">{title}</h3>
      </div>
      <ul className="space-y-1">
        {errorEntries.map(([name, error]) => (
          <li key={name} className="text-sm text-destructive/90 flex items-center gap-2">
            <span className="text-destructive">•</span>
            {error.message}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ============================================
// COMPOSANT DE CHARGEMENT
// ============================================

/**
 * ⏳ FormSubmitButton - Bouton de soumission avec état
 */
interface FormSubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Si le formulaire est en cours de soumission */
  isLoading?: boolean;
  /** Texte quand chargement */
  loadingText?: string;
  /** Enfants (texte du bouton) */
  children: React.ReactNode;
}

export const FormSubmitButton = React.forwardRef<
  HTMLButtonElement,
  FormSubmitButtonProps
>(({ 
  isLoading, 
  loadingText = 'Enregistrement...', 
  children, 
  disabled,
  className,
  ...props 
}, ref) => {
  return (
    <button
      ref={ref}
      type="submit"
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/20',
        className
      )}
      {...props}
    >
      {isLoading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {isLoading ? loadingText : children}
    </button>
  );
});

FormSubmitButton.displayName = 'FormSubmitButton';

// ============================================
// HELPERS
// ============================================

/**
 * Extrait les messages d'erreur d'une réponse API
 */
export function extractApiErrors(error: unknown): Record<string, string> {
  if (!error || typeof error !== 'object') return {};
  
  const errorObj = error as any;
  
  // Format standard d'erreur API
  if (errorObj.error?.details) {
    if (Array.isArray(errorObj.error.details)) {
      // Erreurs de validation Zod
      const errors: Record<string, string> = {};
      errorObj.error.details.forEach((err: any) => {
        if (err.path) {
          errors[err.path.join('.')] = err.message;
        }
      });
      return errors;
    }
    if (typeof errorObj.error.details === 'object') {
      return errorObj.error.details;
    }
  }
  
  // Erreurs field-level
  if (errorObj.errors) {
    return errorObj.errors;
  }
  
  return {};
}

/**
 * Affiche une erreur dans le champ correspondant
 */
export function setFormErrors(form: any, errors: Record<string, string>) {
  Object.entries(errors).forEach(([name, message]) => {
    form.setError(name, {
      type: 'server',
      message
    });
  });
}

import { motion } from 'framer-motion';

export { motion, cn };
