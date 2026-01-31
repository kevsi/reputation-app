import { SourceType } from "@/types/models";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export interface SourceTypeOption {
  type: SourceType;
  label: string;
  description: string;
  icon: string;
  badge?: "Open Web ✅" | "API fermée 🔒";
  disabled?: boolean;
}

export const OPEN_WEB_SOURCES: SourceTypeOption[] = [
  {
    type: 'FORUM',
    label: 'Forum Public',
    description: 'Surveillance des forums de discussion publics',
    icon: '💬',
    badge: 'Open Web ✅',
  },
  {
    type: 'BLOG',
    label: 'Blog',
    description: 'Suivi des articles de blog publics',
    icon: '✍️',
    badge: 'Open Web ✅',
  },
  {
    type: 'NEWS',
    label: 'Actualités',
    description: 'Sources de presse et d\'actualités',
    icon: '📰',
    badge: 'Open Web ✅',
  },
  {
    type: 'REVIEW',
    label: 'Plateforme d\'avis',
    description: 'Sites d\'avis clients génériques',
    icon: '⭐',
    badge: 'Open Web ✅',
  },
  {
    type: 'REDDIT',
    label: 'Reddit',
    description: 'Suivi des communautés Reddit publiques',
    icon: '🔴',
    badge: 'Open Web ✅',
  },
  {
    type: 'RSS',
    label: 'Flux RSS',
    description: 'Surveillance par flux RSS',
    icon: '📡',
    badge: 'Open Web ✅',
  },
  {
    type: 'OTHER',
    label: 'Autre URL publique',
    description: 'Tout site ou page web publique',
    icon: '🌐',
    badge: 'Open Web ✅',
  },
];

export const CLOSED_API_SOURCES: SourceTypeOption[] = [
  {
    type: 'TWITTER',
    label: 'Twitter / X',
    description: 'API fermée - Non disponible',
    icon: '𝕏',
    badge: 'API fermée 🔒',
    disabled: true,
  },
  {
    type: 'FACEBOOK',
    label: 'Facebook',
    description: 'API fermée - Non disponible',
    icon: '📘',
    badge: 'API fermée 🔒',
    disabled: true,
  },
  {
    type: 'INSTAGRAM',
    label: 'Instagram',
    description: 'API fermée - Non disponible',
    icon: '📷',
    badge: 'API fermée 🔒',
    disabled: true,
  },
  {
    type: 'LINKEDIN',
    label: 'LinkedIn',
    description: 'API fermée - Non disponible',
    icon: '💼',
    badge: 'API fermée 🔒',
    disabled: true,
  },
];

interface SourceTypeSelectorProps {
  value: SourceType | null;
  onChange: (type: SourceType) => void;
  showClosedAPIs?: boolean;
}

export function SourceTypeSelector({
  value,
  onChange,
  showClosedAPIs = true,
}: SourceTypeSelectorProps) {
  // const allSources = showClosedAPIs
  //   ? [...OPEN_WEB_SOURCES, ...CLOSED_API_SOURCES]
  //   : OPEN_WEB_SOURCES;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Type de source</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Sélectionnez le type de source à surveiller
        </p>
      </div>

      {/* Open Web Sources Section */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Web Public ✅
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {OPEN_WEB_SOURCES.map((source) => (
            <Card
              key={source.type}
              onClick={() => onChange(source.type)}
              className={`p-4 cursor-pointer transition-all border-2 ${
                value === source.type
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{source.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-foreground">
                        {source.label}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {source.description}
                      </p>
                    </div>
                  </div>
                  {value === source.type && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                  )}
                </div>
                <Badge variant="secondary" className="text-[10px] w-fit bg-green-100 text-green-800 border-green-200">
                  {source.badge}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Closed APIs Section */}
      {showClosedAPIs && (
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            API Fermées 🔒
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CLOSED_API_SOURCES.map((source) => (
              <Card
                key={source.type}
                className="p-4 opacity-60 cursor-not-allowed border-2 border-dashed border-border bg-muted/30"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl opacity-50">{source.icon}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-muted-foreground line-through">
                          {source.label}
                        </h4>
                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                          {source.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive" className="text-[10px] w-fit">
                    {source.badge}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-muted">
            <p className="text-xs text-muted-foreground">
              ℹ️ Les API fermées ne sont pas disponibles. Utilisez les sources <strong>Web Public</strong> pour la surveillance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
