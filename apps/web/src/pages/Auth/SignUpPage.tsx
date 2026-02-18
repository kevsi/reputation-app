import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * 📝 SignUpPage
 * 
 * Page d'inscription premium.
 * Structure claire avec validation de mot de passe et feedback utilisateur.
 */
export default function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    organizationName: '',
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name || !formData.organizationName) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        organizationName: formData.organizationName
      });
      navigate('/get-started');
    } catch (err: any) {
      const errorMsg = err?.message || err?.error?.message || 'Une erreur est survenue lors de l\'inscription';
      if (err?.status === 409) {
        setError('Cet email est déjà utilisé.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Créer un compte
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Rejoignez des milliers d'entreprises qui protègent leur réputation.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-2xl flex items-center gap-3"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {error}
        </motion.div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5">
          {/* Nom de l'organisation */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Nom de l'entreprise
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Building2 className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                name="organizationName"
                required
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Ex: Ma Super Entreprise"
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Votre Nom */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Votre Nom Complet
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jean Dupont"
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
            Email Professionnel
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="jean@entreprise.com"
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
            Mot de passe
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pl-11 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 ml-1">
            Minimum 8 caractères, une majuscule et un chiffre.
          </p>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full bg-indigo-600 dark:bg-white text-white dark:text-slate-950 font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 overflow-hidden mt-4"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-600 opacity-0 group-hover:opacity-100 dark:hidden transition-opacity" />
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Créer mon compte
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>
      </form>

      {/* Lien Connexion */}
      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-900 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Déjà un compte ? {' '}
          <Link
            to="/signin"
            className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 transition-colors ml-1"
          >
            Se connecter
          </Link>
        </p>
      </div>

      {/* Google SignUp */}
      <div className="mt-6">
        <button className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          S'inscrire avec Google
        </button>
      </div>
    </div>
  );
}
