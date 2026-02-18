"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectorStatusItem = ConnectorStatusItem;
function ConnectorStatusItem({ name, status, lastSync }) {
    const getStatusColor = () => {
        switch (status) {
            case "online":
                return "bg-green-500";
            case "warning":
                return "bg-orange-500";
            case "error":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };
    const getStatusBadge = () => {
        switch (status) {
            case "online":
                return "bg-green-100 text-green-700";
            case "warning":
                return "bg-orange-100 text-orange-700";
            case "error":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const getStatusLabel = () => {
        switch (status) {
            case "online":
                return "En ligne";
            case "warning":
                return "Attention";
            case "error":
                return "Erreur";
            default:
                return "Inconnu";
        }
    };
    return (<div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`}/>
        <div>
          <div className="font-medium text-sm text-foreground">
            {name}
          </div>
          <div className="text-xs text-muted-foreground">
            {lastSync}
          </div>
        </div>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge()}`}>
        {getStatusLabel()}
      </span>
    </div>);
}
