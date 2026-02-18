import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-1 rounded-full transition-all",
            index < currentStep 
              ? "bg-primary w-12" 
              : "bg-muted w-8"
          )}
        />
      ))}
    </div>
  );
}