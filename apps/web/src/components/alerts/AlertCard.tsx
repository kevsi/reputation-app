import { AlertTriangle, Bell, Check, X, Eye } from "lucide-react";

interface AlertCardProps {
  id: string;
  type: "urgent" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  status: string;
  mentions: number;
  platform: string;
  impact: "élevé" | "moyen" | "faible";
  onView?: () => void;
  onResolve?: () => void;
  onIgnore?: () => void;
}

export function AlertCard({
  id: _id,
  type,
  title,
  description,
  timestamp,
  status,
  mentions,
  platform,
  impact,
  onView,
  onResolve,
  onIgnore
}: AlertCardProps) {
  const getAlertIcon = () => {
    switch (type) {
      case "urgent":
        return <Bell className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Eye className="w-5 h-5" />;
    }
  };

  const getAlertStyle = () => {
    switch (type) {
      case "urgent":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900";
      case "warning":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900";
      default:
        return "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900";
    }
  };

  const getAlertIconColor = () => {
    switch (type) {
      case "urgent":
        return "text-red-600";
      case "warning":
        return "text-amber-600";
      default:
        return "text-blue-600";
    }
  };

  const getImpactStyle = () => {
    switch (impact) {
      case "élevé":
        return "bg-red-100 text-red-700";
      case "moyen":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className={`border rounded-xl p-5 ${getAlertStyle()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${getAlertIconColor()}`}>
            {getAlertIcon()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs text-muted-foreground">{timestamp}</span>
          <select
            value={status}
            className="px-2 py-1 text-xs font-medium border border-border rounded bg-background"
          >
            <option value="En cours">En cours</option>
            <option value="Résolu">Résolu</option>
            <option value="Ignoré">Ignoré</option>
          </select>
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>📊</span>
          <span>{mentions} mentions liées</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <span>📱</span>
          <span>{platform}</span>
        </div>
        <span>•</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getImpactStyle()}`}>
          Impact {impact}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Eye className="w-3.5 h-3.5" />
          Voir détails
        </button>
        <button
          onClick={onResolve}
          className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground"
        >
          <Check className="w-3.5 h-3.5" />
          Gérer
        </button>
        <button
          onClick={onIgnore}
          className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground"
        >
          <X className="w-3.5 h-3.5" />
          Ignorer
        </button>
      </div>
    </div>
  );
}

export default AlertCard;