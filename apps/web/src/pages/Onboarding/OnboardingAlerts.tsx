import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Timer } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProductCard } from "@/components/onboarding/ProductCard";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const alertLevels = [
  {
    id: "low",
    icon: Timer,
    title: "Faible",
    description: "Alertes pour les mentions importantes uniquement."
  },
  {
    id: "medium",
    icon: Timer,
    title: "Moyen",
    description: "Alertes équilibrées pour rester informé."
  },
  {
    id: "high",
    icon: Timer,
    title: "Élevé",
    description: "Toutes les mentions en temps réel."
  }
];

const notificationMethods = [
  { id: "email", label: "Email" },
  { id: "push", label: "Notification Push" },
  { id: "sms", label: "SMS" }
];

export default function OnboardingAlerts() {
  const navigate = useNavigate();
  const [selectedLevel, setSelectedLevel] = useState<string>("medium");
  const [selectedMethods, setSelectedMethods] = useState<string[]>(["email", "push"]);

  const toggleMethod = (methodId: string) => {
    setSelectedMethods(prev =>
      prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    );
  };

  return (
    <OnboardingLayout currentStep={3} totalSteps={5}>
      <div className="flex-1 max-w-2xl">
        <h1 className="text-4xl font-bold text-foreground mb-12">
          Niveaux d'alertes
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {alertLevels.map((level) => (
            <ProductCard
              key={level.id}
              icon={level.icon}
              title={level.title}
              description={level.description}
              isSelected={selectedLevel === level.id}
              onClick={() => setSelectedLevel(level.id)}
            />
          ))}
        </div>

        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Alertes options
        </h2>

        <div className="flex flex-wrap gap-3">
          {notificationMethods.map((method) => (
            <Button
              key={method.id}
              variant={selectedMethods.includes(method.id) ? "default" : "outline"}
              onClick={() => toggleMethod(method.id)}
              className={cn(
                "rounded-full px-6",
                selectedMethods.includes(method.id) && "shadow-md"
              )}
            >
              {method.label}
            </Button>
          ))}
        </div>
      </div>

      <NavigationButtons
        onBack={() => navigate("/onboarding/platforms")}
        onContinue={() => navigate("/onboarding/invite")}
      />
    </OnboardingLayout>
  );
}