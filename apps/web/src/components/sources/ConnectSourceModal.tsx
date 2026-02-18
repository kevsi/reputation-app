import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SourceForm from './SourceForm';

export type SourceType = 'TRUSTPILOT' | 'TWITTER' | 'FACEBOOK';

interface ConnectSourceModalProps {
  brandId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const PLATFORMS = [
  { type: 'TRUSTPILOT' as SourceType, label: 'Trustpilot', icon: '⭐', disabled: false },
  { type: 'TWITTER' as SourceType, label: 'Twitter', icon: '𝕏', disabled: true },
  { type: 'FACEBOOK' as SourceType, label: 'Facebook', icon: 'f', disabled: true },
];

export default function ConnectSourceModal({
  brandId,
  open,
  onOpenChange,
  onSuccess,
}: ConnectSourceModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<SourceType | null>(null);

  const handleBack = () => {
    setSelectedPlatform(null);
  };

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
    setSelectedPlatform(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {selectedPlatform ? 'Configurer la source' : 'Connecter une source'}
          </DialogTitle>
          <DialogDescription>
            {selectedPlatform
              ? `Entrez les détails pour accéder à ${PLATFORMS.find(p => p.type === selectedPlatform)?.label}`
              : 'Sélectionnez la plateforme de laquelle vous souhaitez collecter les mentions'}
          </DialogDescription>
        </DialogHeader>

        {!selectedPlatform ? (
          // Platform Selection
          <div className="grid grid-cols-3 gap-4 py-4">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.type}
                onClick={() => !platform.disabled && setSelectedPlatform(platform.type)}
                disabled={platform.disabled}
                className={`
                  relative p-4 border rounded-lg text-center transition-all
                  ${
                    platform.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-blue-500 hover:shadow-md cursor-pointer'
                  }
                `}
              >
                <div className="text-3xl mb-2">{platform.icon}</div>
                <div className="font-medium text-sm">{platform.label}</div>
                {platform.disabled && (
                  <div className="text-xs text-gray-500 mt-1">Bientôt</div>
                )}
              </button>
            ))}
          </div>
        ) : (
          // Source Configuration Form
          <div className="space-y-4 py-4">
            <SourceForm
              brandId={brandId}
              onSuccess={handleSuccess}
            />
            <Button
              variant="ghost"
              onClick={handleBack}
              className="w-full"
            >
              ← Retour
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
