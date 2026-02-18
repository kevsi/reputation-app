import { ReactNode } from "react";
import { ProgressSteps } from "./ProgressSteps";

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  rightImage?: string;
  rightContent?: ReactNode;
}

export function OnboardingLayout({ 
  children, 
  currentStep, 
  totalSteps,
  rightImage,
  rightContent 
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Formulaire */}
      <div className="flex-1 flex flex-col p-8 lg:p-12 bg-background">
        {/* Logo */}
        <div className="mb-12">
          <img 
            src="/logoicon.svg" 
            alt="Sentinelle" 
            className="h-12 w-12 dark:brightness-0 dark:invert"
          />
        </div>

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>

        {/* Progress bar */}
        <div className="pt-8 border-t border-border">
          <ProgressSteps currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>

      {/* Section droite - Visuel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-purple-900 via-slate-900 to-black">
        {rightImage && (
          <img 
            src={rightImage}
            alt="Onboarding visual"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        )}
        
        {rightContent && (
          <div className="absolute inset-0 flex items-center justify-center p-12">
            {rightContent}
          </div>
        )}
        
        {/* Éléments décoratifs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}