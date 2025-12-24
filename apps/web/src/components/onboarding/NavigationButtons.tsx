import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface NavigationButtonsProps {
  onBack?: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  continueDisabled?: boolean;
  continueText?: string;
  showBack?: boolean;
}

export function NavigationButtons({
  onBack,
  onContinue,
  onSkip,
  continueDisabled = false,
  continueText = "Continue",
  showBack = true
}: NavigationButtonsProps) {
  return (
    <div className="flex items-center justify-between mt-8">
      <div className="flex gap-3">
        {showBack && onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground"
          >
            Pass
          </Button>
        )}
      </div>
      
      <Button
        onClick={onContinue}
        disabled={continueDisabled}
        className="gap-2"
      >
        {continueText}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}