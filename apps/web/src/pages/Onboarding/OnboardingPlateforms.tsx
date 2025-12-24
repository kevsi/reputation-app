import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProductCard } from "@/components/onboarding/ProductCard";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";

const platforms = [
  {
    id: "facebook",
    iconImage: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
    title: "Facebook",
    description: "Surveillez votre présence et mentions sur Facebook."
  },
  {
    id: "instagram",
    iconImage: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png",
    title: "Instagram",
    description: "Suivez vos mentions et hashtags Instagram."
  },
  {
    id: "twitter",
    iconImage: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
    title: "Twitter / X",
    description: "Surveillez les tweets et conversations."
  },
  {
    id: "linkedin",
    iconImage: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png",
    title: "LinkedIn",
    description: "Moniteur professionnel et réseau B2B."
  },
  {
    id: "youtube",
    iconImage: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    title: "YouTube",
    description: "Surveillez les commentaires et mentions vidéo."
  },
  {
    id: "tiktok",
    iconImage: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg",
    title: "TikTok",
    description: "Suivez les tendances et mentions TikTok."
  }
];

export default function OnboardingPlatforms() {
  const navigate = useNavigate();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"]);

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <OnboardingLayout 
      currentStep={2} 
      totalSteps={5}
      rightImage="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200"
    >
      <div className="flex-1 max-w-2xl">
        <h1 className="text-4xl font-bold text-foreground mb-12">
          Quelles plateformes souhaiter vous surveiller
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {platforms.map((platform) => (
            <ProductCard
              key={platform.id}
              iconImage={platform.iconImage}
              title={platform.title}
              description={platform.description}
              isSelected={selectedPlatforms.includes(platform.id)}
              onClick={() => togglePlatform(platform.id)}
            />
          ))}
        </div>
      </div>

      <NavigationButtons
        onBack={() => navigate("/onboarding/product")}
        onContinue={() => navigate("/onboarding/alerts")}
        continueDisabled={selectedPlatforms.length === 0}
      />
    </OnboardingLayout>
  );
}