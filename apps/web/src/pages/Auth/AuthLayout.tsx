import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img 
              src="/logoicon.svg" 
              alt="Sentinelle" 
              className="h-12 w-12 dark:brightness-0 dark:invert"
            />
          </div>

          {/* Contenu de la page (SignIn, SignUp, etc.) */}
          <Outlet />
        </div>
      </div>

      {/* Section droite - Visuel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-black">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Protégez votre réputation en ligne
            </h2>
            <p className="text-xl text-gray-300">
              Surveillez, analysez et réagissez en temps réel
            </p>
          </div>
        </div>
        
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}