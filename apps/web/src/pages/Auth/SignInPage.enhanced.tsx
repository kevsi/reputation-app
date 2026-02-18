/**
 * 🔑 Exemple de SignInPage avec gestion d'erreurs avancée
 * 
 * Cet exemple montre comment utiliser:
 * - Schémas de validation Zod
 * - Hooks de soumission avec gestion d'erreurs
 * - Composants de champs avec indicateurs visuels
 * - Toasts pour les erreurs/succès
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Import our new validation and error handling system
import { loginSchema, LoginFormData } from '@/lib/validation-schemas';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { InputField, FormErrorSummary } from '@/components/ui/form-field';

/**
 * 🔑 SignInPage - Version avec gestion d'erreurs avancée
 * 
 * Cette version utilise:
 * - React Hook Form + Zod pour la validation
 * - useFormSubmission hook pour la gestion d'erreurs
 * - Indicateurs visuels sur les champs
 * - Toasts pour les messages d'erreur/succès
 */
export default function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = React.useState(true);

  // Configuration du formulaire avec React Hook Form + Zod
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true
    },
    mode: 'onChange' // Validation en temps réel
  });

  // Utilisation du hook de soumission avec gestion d'erreurs
  const { isSubmitting, submitError, handleSubmit } = useFormSubmission(form, {
    // Schéma de validation (optionnel si déjà défini dans resolver)
    validationSchema: loginSchema,
    
    // Fonction de soumission
    onSubmit: async (data) => {
      await login(data.email, data.password);
    },
    
    // Callback en cas de succès
    onSuccess: () => {
      navigate('/');
    },
    
    // Message de succès (affiché par défaut)
    successMessage: 'Connexion réussie ! Bienvenue.',
    
    // Mapper les erreurs API vers les champs
    mapErrorsToFields: true,
    
    // Afficher les toasts
    showSuccessToast: true,
    showErrorToast: true
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Bon retour parmis nous
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Connectez-vous pour accéder à votre espace Sentinelle.
        </p>
      </div>

      {/* Résumé des erreurs (si plusieurs erreurs de champs) */}
      <FormErrorSummary 
        errors={form.formState.errors} 
        title="Veuillez corriger les erreurs suivantes:"
      />

      {/* Erreur de soumission générale */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {submitError}
        </motion.div>
      )}

      {/* Formulaire avec React Hook Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        
        {/* Email Field - Avec validation en temps réel */}
        <InputField
          form={form}
          name="email"
          label="Email Professionnel"
          type="email"
          placeholder="jean@entreprise.com"
          required
          leftIcon={<Mail className="w-5 h-5" />}
          validateOnChange={true}
          description="Nous utiliserons cet email pour vous identifier"
        />

        {/* Password Field - Avec toggle visibility */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <InputField
              form={form}
              name="password"
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              required
              leftIcon={<Lock className="w-5 h-5" />}
              showPasswordToggle
            />
          </div>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline-offset-4 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center px-1">
          <label className="flex items-center cursor-pointer group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all" />
            <svg
              className="absolute top-1 left-1 w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform duration-200"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="ml-3 text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
              Rester connecté
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-900 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Nouveau sur Sentinelle ? {' '}
          <Link
            to="/signup"
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 transition-colors ml-1"
          >
            Créer un compte gratuitement
          </Link>
        </p>
      </div>

      {/* Social Login */}
      <div className="relative my-10">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-100 dark:border-slate-900"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
          <span className="bg-slate-50 dark:bg-slate-950 px-4 text-slate-400">Ou continuer avec</span>
        </div>
      </div>

      <button className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Google
      </button>
    </div>
  );
}
