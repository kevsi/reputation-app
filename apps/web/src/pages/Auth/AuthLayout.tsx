import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * 🔐 AuthLayout
 * 
 * Layout premium pour les pages d'authentification.
 * Design split-screen avec section visuelle dynamique à droite.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Section gauche - Formulaire */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10">
        {/* Background decorative elements for the form side (subtle) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-[440px] relative">
          {/* Logo with subtle animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 flex flex-col items-center lg:items-start"
          >
            <div className="flex items-center gap-3 font-outfit">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <img
                  src="/logoicon.svg"
                  alt="S"
                  className="h-6 w-6 brightness-0 invert"
                />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 tracking-tight">
                Sentinelle
              </span>
            </div>
          </motion.div>

          {/* Page Content */}
          <div className="relative">
            <Outlet />
          </div>

          {/* Footer - Minimalist */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center lg:text-left text-sm text-slate-500 dark:text-slate-400"
          >
            &copy; {new Date().getFullYear()} Sentinelle Reputation. Tous droits réservés.
          </motion.div>
        </div>
      </div>

      {/* Section droite - Visuel Premium */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        {/* Deep Animated Gradient Background */}
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950" />

          {/* Abstract Animated Blobs */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"
          />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-16 text-white text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl"
          >
            <h2 className="text-5xl font-extrabold mb-8 tracking-tight leading-[1.1] font-outfit">
              Maîtrisez votre <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">réputation numerique.</span>
            </h2>
            <p className="text-xl text-slate-300 mb-12 leading-relaxed font-light">
              Une plateforme tout-en-un pour surveiller, analyser et protéger
              votre présence en ligne grâce à notre intelligence artificielle.
            </p>

            {/* Visual element placeholder or stats */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { label: "Mentions", value: "24k+", color: "bg-indigo-500/20 text-indigo-300" },
                { label: "Alertes", value: "Temps réel", color: "bg-purple-500/20 text-purple-300" }
              ].map((stat, i) => (
                <div key={i} className={`p-6 rounded-2xl border border-white/10 backdrop-blur-sm ${stat.color}`}>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wider opacity-60 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Bottom Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-16 flex gap-8 text-slate-400 font-medium tracking-wide uppercase text-[10px]"
          >
            <span className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-indigo-500" />
              Intelligence Artificielle
            </span>
            <span className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-purple-500" />
              Sécurité Maximale
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}