import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { brandsService } from "@/services/brands.service";
import { keywordsService } from "@/services/keywords.service";
import { sourcesService } from "@/services/sources.service";
import { isApiError } from "@/types/http";

export default function OnboardingSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data } = useOnboarding();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const setupStarted = useRef(false);

  useEffect(() => {
    const setup = async () => {
      if (setupStarted.current || !user) return;
      setupStarted.current = true;

      try {
        setProgress(10);

        // 1. Créer la Marque
        const brandName = user?.organization?.name || "Ma Marque";
        const brandResponse = await brandsService.create({
          name: brandName,
          organizationId: user?.organizationId
        });

        if (isApiError(brandResponse)) {
          throw new Error("Erreur lors de la création de la marque");
        }

        const brand = brandResponse.data;
        setProgress(40);

        // 2. Créer le Mot-clé principal
        const kwRes = await keywordsService.create({
          brandId: brand.id,
          name: brand.name
        });

        if (isApiError(kwRes)) {
          // we can continue even if kw fails as it might exist
        }

        setProgress(60);

        // 3. Créer les Sources (optionnel - peut échouer si config incomplète)
        if (data.platforms?.length) {
          const sourcePromises = data.platforms.map((platform: string) =>
            sourcesService.create(brand.id, {
              type: platform.toUpperCase(),
              name: platform,
              config: {},
              scrapingFrequency: 'HOURLY'
            }).catch(() => null)
          );
          await Promise.all(sourcePromises);
        }
        setProgress(100);

        setTimeout(() => {
          navigate("/onboarding/complete");
        }, 1000);

      } catch (err: any) {
        setError(err.message || "Une erreur est survenue lors de la configuration.");
        setupStarted.current = false;
      }
    };

    setup();
  }, [user, data, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-8 w-full">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 text-sm rounded-xl">
              {error}
            </div>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        ) : (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-6 text-primary animate-spin" />
            <h2 className="text-2xl font-bold text-foreground mb-4">Configuration de votre espace</h2>
            <p className="text-muted-foreground mb-8">Nous préparons vos outils de surveillance...</p>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className="bg-primary h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{progress}%</p>
          </>
        )}
      </div>
    </div>
  );
}

function Button({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors shadow-md"
    >
      {children}
    </button>
  );
}