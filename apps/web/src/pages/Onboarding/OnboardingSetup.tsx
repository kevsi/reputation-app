import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function OnboardingSetup() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progression
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev >= 100 ? 100 : prev + 10;
        return newProgress;
      });
    }, 300);

    // Navigation automatique
    const timer = setTimeout(() => {
      navigate("/onboarding/complete");
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-8">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/logoicon.svg" 
            alt="Sentinelle" 
            className="h-16 w-16 dark:brightness-0 dark:invert animate-pulse"
          />
        </div>

        {/* Spinner */}
        <Loader2 className="w-12 h-12 mx-auto mb-6 text-primary animate-spin" />

        {/* Texte */}
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Patientez pendant la configuration de l'organisation
        </h2>
        <p className="text-muted-foreground mb-8">
          Nous préparons votre espace de surveillance...
        </p>

        {/* Barre de progression */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
      </div>
    </div>
  );
}