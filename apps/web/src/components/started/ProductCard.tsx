import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ProductCardProps {
  icon?: LucideIcon;
  iconImage?: string;
  title: string;
  description: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ProductCard({ 
  icon: Icon, 
  iconImage,
  title, 
  description, 
  isSelected = false,
  onClick 
}: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-6 rounded-2xl border-2 text-left transition-all hover:border-primary/50 group",
        isSelected 
          ? "border-primary bg-primary/5" 
          : "border-border bg-card hover:bg-accent"
      )}
    >
      {/* Icône de sélection */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <svg 
            className="w-4 h-4 text-primary-foreground" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
        </div>
      )}
      
      {/* Icône du produit */}
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
        isSelected ? "bg-primary/10" : "bg-muted"
      )}>
        {iconImage ? (
          <img src={iconImage} alt={title} className="w-8 h-8 object-contain" />
        ) : Icon ? (
          <Icon className={cn(
            "w-6 h-6",
            isSelected ? "text-primary" : "text-muted-foreground"
          )} />
        ) : null}
      </div>
      
      {/* Contenu */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </button>
  );
}