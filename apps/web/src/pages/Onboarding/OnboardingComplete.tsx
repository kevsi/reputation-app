import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function OnboardingComplete() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="text-center max-w-2xl px-8">
        {/* Icône de succès avec logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
          Tout est prêt ! 🎉
        </h1>

        {/* Description */}
        <p className="text-xl text-muted-foreground mb-12">
          Votre espace de surveillance est configuré et prêt à l'emploi.
          Commencez dès maintenant à protéger votre réputation en ligne.
        </p>

        {/* Bouton CTA */}
        <Button 
          size="lg" 
          onClick={() => navigate("/")}
          className="text-lg px-8 py-6 gap-2"
        >
          Accéder au Dashboard
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8">
          <div>
            <div className="text-2xl font-bold text-primary mb-1">✓</div>
            <div className="text-sm text-muted-foreground">Produit configuré</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">✓</div>
            <div className="text-sm text-muted-foreground">Plateformes liées</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary mb-1">✓</div>
            <div className="text-sm text-muted-foreground">Alertes activées</div>
          </div>
        </div>
      </div>
    </div>
  );
}