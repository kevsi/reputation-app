import { Eye, Download, Edit, Trash2 } from "lucide-react";

interface ReportCardProps {
  id: string;
  title: string;
  type: string;
  date: string;
  status: "Terminé" | "En cours" | "Programmé";
  mentions: number;
  sentiment: string;
  engagement: number;
  onPreview?: () => void;
  onDownload?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReportCard({
  id: _id,
  title,
  type,
  date,
  status,
  mentions,
  sentiment,
  engagement,
  onPreview,
  onDownload,
  onEdit,
  onDelete
}: ReportCardProps) {
  const getStatusStyle = () => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-700";
      case "En cours":
        return "bg-blue-100 text-blue-700";
      case "Programmé":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{type}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}>
          {status}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Mentions</div>
          <div className="text-lg font-bold text-foreground">
            {mentions.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Sentiment</div>
          <div className="text-lg font-bold text-foreground">{sentiment}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Engagement</div>
          <div className="text-lg font-bold text-foreground">
            {engagement.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onPreview}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground min-w-[130px]"
        >
          <Eye className="w-4 h-4" />
          <span>Prévisualiser</span>
        </button>
        <button
          onClick={onDownload}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity min-w-[160px]"
        >
          <Download className="w-4 h-4" />
          <span>Télécharger PDF</span>
        </button>
        <button
          onClick={onEdit}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground min-w-[110px]"
        >
          <Edit className="w-4 h-4" />
          <span>Modifier</span>
        </button>
        <button
          onClick={onDelete}
          className="flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors min-w-[120px]"
        >
          <Trash2 className="w-4 h-4" />
          <span>Supprimer</span>
        </button>
      </div>
    </div>
  );
}

export default ReportCard;