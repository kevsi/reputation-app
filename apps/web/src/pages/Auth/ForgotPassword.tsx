import { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * 📧 ForgotPassword
 * 
 * Page de récupération de mot de passe.
 */
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsLoading(true);
      // Simuler l'envoi d'email
      setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
      }, 1500);
    }
  };

  return (
    <div className="w-full">
      {!isSubmitted ? (
        <>
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-6 group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour à la connexion
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
              Mot de passe oublié ?
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Pas de panique, nous allons vous envoyer des instructions pour le réinitialiser.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                Adresse Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jean@entreprise.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="group relative w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Envoyer le lien"
                )}
              </span>
            </button>
          </form>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4"
        >
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-indigo-500/10">
            <CheckCircle2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Vérifiez vos emails</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
            Nous avons envoyé un lien de réinitialisation à <br />
            <span className="font-bold text-slate-900 dark:text-white">{email}</span>
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            >
              Renvoyer l'email
            </button>
            <div className="pt-6">
              <Link
                to="/signin"
                className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}