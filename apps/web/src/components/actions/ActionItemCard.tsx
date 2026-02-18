import { Eye, Clock, User } from "lucide-react";

interface ActionItemCardProps {
  id: string;
  title: string;
  platform: string;
  priority: "Priorité haute" | "Urgent" | "Moyenne" | "Faible";
  assignedTo?: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
}

export function ActionItemCard({
  id: _id,
  title,
  platform,
  priority,
  assignedTo,
  dueDate,
  status,
  onViewDetails,
  onStart,
  onComplete
}: ActionItemCardProps) {
  const getPriorityStyle = () => {
    switch (priority) {
      case "Urgent":
        return "bg-red-100 text-red-700";
      case "Priorité haute":
        return "bg-orange-100 text-orange-700";
      case "Moyenne":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case "Urgent":
      case "Priorité haute":
        return "⚠️";
      case "Moyenne":
        return "👍";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={`bg-card border rounded-xl p-5 flex flex-col min-h-[280px] ${status === "completed" ? "opacity-60" : ""
      }`}>
      {/* Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl flex-shrink-0">
          {getPriorityIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm text-foreground mb-2 line-clamp-2 leading-snug ${status === "completed" ? "line-through" : ""
            }`} title={title}>
            {title}
          </h3>
          <div className="text-xs text-muted-foreground">{platform}</div>
        </div>
      </div>

      {/* Priority Badge */}
      <div className="mb-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityStyle()}`}>
          {priority}
        </span>
      </div>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{assignedTo}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{dueDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-auto">
        <button
          onClick={onViewDetails}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors text-foreground whitespace-nowrap"
        >
          <Eye className="w-3 h-3" />
          <span>Détails</span>
        </button>
        {status === "completed" ? (
          <div className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium whitespace-nowrap">
            <span>✓ Terminé</span>
          </div>
        ) : status === "in-progress" ? (
          <button
            onClick={onComplete}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            <span>Terminer</span>
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-foreground text-background rounded-lg text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <span>Commencer</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ActionItemCard;