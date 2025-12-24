import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, 
  Palette, 
  DollarSign, 
  Timer, 
  Code, 
  Brain
} from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { ProductCard } from "@/components/onboarding/ProductCard";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";

const products = [
  {
    id: "work",
    icon: Briefcase,
    title: "Work Stuff",
    description: "Just the usual boring work stuff I guess."
  },
  {
    id: "design",
    icon: Palette,
    title: "UI/UX Design",
    description: "Design apps and prototypes and things."
  },
  {
    id: "finance",
    icon: DollarSign,
    title: "Finance",
    description: "Because I need money to live my life?"
  },
  {
    id: "productivity",
    icon: Timer,
    title: "Productivity",
    description: "Sometimes we need to be productive."
  },
  {
    id: "engineering",
    icon: Code,
    title: "Engineering",
    description: "Build web apps and MVPs with engineering power."
  },
  {
    id: "ml",
    icon: Brain,
    title: "Machine Learning",
    description: "To do machine learning and other robots stuff."
  }
];

export default function OnboardingProduct() {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string>("productivity");

  return (
    <OnboardingLayout currentStep={1} totalSteps={5}>
      <div className="flex-1 max-w-2xl">
        <h1 className="text-4xl font-bold text-foreground mb-12">
          Quel produit souhaiter vous surveiller
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              icon={product.icon}
              title={product.title}
              description={product.description}
              isSelected={selectedProduct === product.id}
              onClick={() => setSelectedProduct(product.id)}
            />
          ))}
        </div>
      </div>

      <NavigationButtons
        showBack={false}
        onContinue={() => navigate("/onboarding/platforms")}
        continueDisabled={!selectedProduct}
      />
    </OnboardingLayout>
  );
}