import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { apiClient } from "@/lib/api-client";

export default function OnboardingSetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data } = useOnboarding();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const setupStarted = useRef(false);

  useEffect(() => {
    const setup = async () => {
      // Prevent double execution in strict mode
      if (setupStarted.current) return;

      // Only start if we have a user
      if (!user) return;

      setupStarted.current = true;

      try {
        setProgress(10);

        // 1. Créer la Marque (Brand)
        const brandName = user?.organization?.name || "Ma Marque";
        console.log("Creating brand:", brandName);

        const brandResponse = await apiClient.createBrand({
          name: brandName,
          organizationId: user?.organizationId,
          isActive: true
        });

        if (!brandResponse.success || !brandResponse.data) {
          throw new Error("Erreur lors de la création de la marque");
        }

        const brand = brandResponse.data;
        console.log("Brand created:", brand);
        setProgress(40);

        // 2. Créer le Mot-clé principal (Keyword)
        console.log("Creating keyword for:", brand.name);
        await apiClient.createKeyword({
          word: brand.name,
          brandId: brand.id,
          isActive: true,
          priority: 1
        });

        setProgress(60);

        // 3. Créer les Sources (Platforms)
        console.log("Creating sources:", data.platforms);
        const sourcePromises = data.platforms.map(platform => {
          return apiClient.createSource({
            type: platform.toUpperCase(),
            name: platform,
            brandId: brand.id,
            isActive: true,
            scrapingFrequency: 3600 // hourly in seconds, adjust as needed by backend
          });
        });

        await Promise.all(sourcePromises);
        setProgress(100);

        // Navigation automatique après un court délai
        setTimeout(() => {
          navigate("/onboarding/complete");
        }, 1000);

      } catch (err: any) {
        console.error("Setup error detail:", err);
        setError(err.message || "Une erreur est survenue lors de la configuration.");
        setupStarted.current = false; // Allow retry
      }
    };

    setup();
  }, [user, data, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-8 w-full">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
              {error}
            </div>
            <button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-6 text-primary animate-spin" />
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Configuration de votre espace
            </h2>
            <p className="text-muted-foreground mb-8">
              Nous préparons vos outils de surveillance...
            </p>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
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