import React, { useState, useRef } from 'react';
import { Lock, Shield, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 🔐 TwoFactorAuth
 * 
 * Page de double authentification.
 */
export default function TwoFactorAuth() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    setError('');
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    const newCode = [...pastedData.split(''), ...Array(6).fill('')].slice(0, 6);
    setCode(newCode);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        // Traitement 2FA
      }, 2000);
    } else {
      setError('Veuillez entrer les 6 chiffres.');
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 shadow-inner shadow-indigo-500/10 transition-transform hover:scale-105 duration-300">
          <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Double authentification
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Saisissez le code de sécurité généré par votre application d'authentification.
        </p>
      </div>

      <form onSubmit={handleVerify}>
        {/* Code Input */}
        <div className="flex justify-between gap-2 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-full aspect-square text-center text-2xl font-bold rounded-2xl border-2 transition-all focus:outline-none focus:ring-4 ${error
                  ? 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-900/10 text-red-600 focus:ring-red-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-indigo-500/10 focus:border-indigo-500'
                }`}
            />
          ))}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-semibold text-red-600 dark:text-red-400 mb-6"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={isLoading || code.join('').length < 6}
          className="group relative w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 overflow-hidden mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center justify-center gap-2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Vérifier
                <Lock className="w-4 h-4" />
              </>
            )}
          </span>
        </button>

        <div className="text-center space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Un problème ? {' '}
            <button type="button" className="text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 underline-offset-4 hover:underline">
              Utiliser un code de secours
            </button>
          </p>
          <button type="button" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-widest">
            <RefreshCw className="w-3 h-3" />
            Renvoyer le code
          </button>
        </div>
      </form>
    </div>
  );
}