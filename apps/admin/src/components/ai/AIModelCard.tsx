interface AIModelCardProps {
  name: string;
  description: string;
  version: string;
  accuracy: number;
  requests24h: number;
  status: "Actif" | "En maintenance" | "Désactivé";
  onConfigure: () => void;
  onTest: () => void;
}

export function AIModelCard({
  name,
  description,
  version,
  accuracy,
  requests24h,
  status,
  onConfigure,
  onTest
}: AIModelCardProps) {
  const getStatusStyle = () => {
    switch (status) {
      case "Actif":
        return "bg-green-100 text-green-700";
      case "En maintenance":
        return "bg-orange-100 text-orange-700";
      case "Désactivé":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case "Actif":
        return "bg-green-500";
      case "En maintenance":
        return "bg-orange-500";
      case "Désactivé":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot()}`} />
            <h3 className="font-semibold text-base text-foreground">{name}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          <span className="text-xs text-muted-foreground">Version {version}</span>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle()}`}>
          {status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Précision</div>
          <div className="text-xl font-bold text-foreground">{accuracy}%</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Requêtes (24h)</div>
          <div className="text-xl font-bold text-foreground">
            {requests24h.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onConfigure}
          className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground"
        >
          Configurer
        </button>
        <button
          onClick={onTest}
          className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Tester
        </button>
      </div>
    </div>
  );
}

export default AIModelCard;