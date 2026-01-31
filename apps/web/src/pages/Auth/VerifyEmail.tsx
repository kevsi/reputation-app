import React, { useState, useRef, useEffect } from 'react';
import { Mail, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * 📧 VerifyEmail
 * 
 * Page de vérification d'email par code OTP.
 */
export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

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

  const handleResend = () => {
    setCountdown(60);
    setCode(['', '', '', '', '', '']);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join('').length === 6) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10">
        <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mb-6 shadow-inner shadow-indigo-500/10 transition-transform hover:scale-105 duration-300">
          <Mail className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Vérification d'email
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Nous avons envoyé un code de vérification à votre adresse email.
        </p>
      </div>

      <form onSubmit={handleVerify}>
        {/* Code Input */}
        <div className="flex justify-between gap-2 mb-10">
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
              className="w-full aspect-square text-center text-2xl font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          ))}
        </div>

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
                Vérifier l'email
                <Mail className="w-4 h-4" />
              </>
            )}
          </span>
        </button>

        <div className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Vous n'avez pas reçu le code ?
          </p>
          <div className="mt-2">
            {countdown > 0 ? (
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Renvoyer dans {countdown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Renvoyer le code
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}