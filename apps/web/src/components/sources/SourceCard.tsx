import { Settings, Eye } from "lucide-react";

interface SourceCardProps {
  name: string;
  icon: string;
  mentions: number;
  mentionsTrend: string;
  engagements: number;
  engagementsTrend: string;
  sentiments: number;
  sentimentsTrend: string;
  isActive: boolean;
}

export function SourceCard({
  name,
  icon,
  mentions,
  mentionsTrend,
  engagements,
  engagementsTrend,
  sentiments,
  sentimentsTrend,
  isActive
}: SourceCardProps) {
  const getTrendClass = (trend: string) => {
    return trend.startsWith('+') ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
      {/* Header avec icon et nom */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-xl">
            {icon}
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold text-foreground text-base">{name}</h3>
          </div>
        </div>
        {isActive && (
          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Actif
          </span>
        )}
      </div>

      {/* Stats en ligne */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Mentions</div>
          <div className="text-lg font-bold text-foreground mb-0.5">
            {mentions.toLocaleString()}
          </div>
          <div className={`text-xs font-medium ${getTrendClass(mentionsTrend)}`}>
            {mentionsTrend}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Engagements</div>
          <div className="text-lg font-bold text-foreground mb-0.5">
            {engagements.toLocaleString()}
          </div>
          <div className={`text-xs font-medium ${getTrendClass(engagementsTrend)}`}>
            {engagementsTrend}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Sentiments</div>
          <div className="text-lg font-bold text-foreground mb-0.5">
            {sentiments}
          </div>
          <div className={`text-xs font-medium ${getTrendClass(sentimentsTrend)}`}>
            {sentimentsTrend}
          </div>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-2 mt-auto">
        <button className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Voir détails
        </button>
        <button className="px-3 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors">
          <Settings className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </div>
  );
}

export default SourceCard;