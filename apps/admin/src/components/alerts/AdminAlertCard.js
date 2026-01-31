"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAlertCard = AdminAlertCard;
function AdminAlertCard({ name, type, severity, organisations, triggered24h, isActive, onToggle, onEdit }) {
    const getSeverityStyle = () => {
        switch (severity) {
            case "Critique":
                return "bg-red-100 text-red-700";
            case "Élevée":
                return "bg-orange-100 text-orange-700";
            case "Moyenne":
                return "bg-yellow-100 text-yellow-700";
            case "Faible":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const getSeverityIcon = () => {
        switch (severity) {
            case "Critique":
                return "🚨";
            case "Élevée":
                return "⚠️";
            case "Moyenne":
                return "⚡";
            case "Faible":
                return "ℹ️";
            default:
                return "📌";
        }
    };
    return (<div className={`bg-card border rounded-xl p-5 ${!isActive ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{getSeverityIcon()}</span>
            <h3 className="font-semibold text-base text-foreground">{name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{type}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getSeverityStyle()}`}>
              {severity}
            </span>
          </div>
        </div>

        {/* Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={onToggle} className="sr-only peer"/>
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Organisations
          </div>
          <div className="text-xl font-bold text-foreground">
            {organisations}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Déclenchées (24h)
          </div>
          <div className="text-xl font-bold text-foreground">
            {triggered24h}
          </div>
        </div>
      </div>

      {/* Actions */}
      <button onClick={onEdit} className="w-full px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
        Modifier la règle
      </button>
    </div>);
}
exports.default = AdminAlertCard;
