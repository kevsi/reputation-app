"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorCard = ConnectorCard;
function ConnectorCard({ name, icon, status, collected24h, errors, lastSync, onConfigure, onTest }) {
    const getStatusStyle = () => {
        switch (status) {
            case "Opérationnel":
                return "bg-green-100 text-green-700";
            case "Dégradé":
                return "bg-orange-100 text-orange-700";
            case "Maintenance":
                return "bg-red-100 text-red-700";
            case "Hors ligne":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const getStatusDot = () => {
        switch (status) {
            case "Opérationnel":
                return "bg-green-500";
            case "Dégradé":
                return "bg-orange-500";
            case "Maintenance":
                return "bg-red-500";
            case "Hors ligne":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };
    return (<div className="bg-card border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${getStatusDot()}`}/>
          <div>
            <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              {name}
            </h3>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle()}`}>
          {status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Collectées (24h)
          </div>
          <div className="text-2xl font-bold text-foreground">
            {collected24h.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Erreurs
          </div>
          <div className={`text-2xl font-bold ${errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {errors}
          </div>
        </div>
      </div>

      {/* Last Sync */}
      <div className="mb-4">
        <div className="text-xs text-muted-foreground">
          Dernière sync: {lastSync}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onConfigure} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
          Configurer
        </button>
        <button onClick={onTest} className="flex-1 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Tester
        </button>
      </div>
    </div>);
}
exports.default = ConnectorCard;
