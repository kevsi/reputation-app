import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Started() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-4xl mx-auto px-8 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/logoicon.svg" 
            alt="Sentinelle" 
            className="h-20 w-20 dark:brightness-0 dark:invert"
          />
        </div>

        {/* Titre principal */}
        <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
          Bienvenue sur <span className="text-primary">Sentinelle</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Surveillez votre réputation en ligne en temps réel. 
          Configurez votre espace en quelques minutes et commencez à protéger votre marque.
        </p>

        {/* Bouton CTA */}
        <Button 
          size="lg" 
          onClick={() => navigate("/onboarding/product")}
          className="text-lg px-8 py-6 gap-2"
        >
          Commencer la configuration
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Indicateurs */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">5 min</div>
            <div className="text-sm text-muted-foreground">Configuration rapide</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-sm text-muted-foreground">Surveillance continue</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">∞</div>
            <div className="text-sm text-muted-foreground">Sources illimitées</div>
          </div>
        </div>
      </div>
    </div>
  );
}