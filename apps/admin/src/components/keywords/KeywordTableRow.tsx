import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2, PlayCircle } from "lucide-react";

interface KeywordTableRowProps {
  id: string;
  word: string;
  category?: string;
  brandName?: string;
  priority: number;
  onDelete: () => void;
}

export function KeywordTableRow({
  word,
  category,
  brandName,
  priority,
  onDelete
}: KeywordTableRowProps) {
  const getPriorityLabel = () => {
    if (priority >= 3) return "Haute";
    if (priority >= 2) return "Moyenne";
    return "Basse";
  };

  const getPriorityStyle = () => {
    if (priority >= 3) return "bg-red-100 text-red-700 hover:bg-red-100 border-none";
    if (priority >= 2) return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none";
    return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-none";
  };

  return (
    <tr className="group hover:bg-muted/30 transition-colors">
      {/* Mot-clé / Règle */}
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-foreground font-mono bg-muted/50 px-2 py-1 rounded">
          {word}
        </span>
      </td>

      {/* Catégorie */}
      <td className="px-6 py-4">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">
          {category || 'Général'}
        </span>
      </td>

      {/* Marque */}
      <td className="px-6 py-4">
        <Badge variant="outline" className="font-bold text-[10px] bg-muted/20">
          {brandName || 'N/A'}
        </Badge>
      </td>

      {/* Priorité */}
      <td className="px-6 py-4">
        <Badge className={`font-bold text-[10px] uppercase tracking-wider ${getPriorityStyle()}`}>
          {getPriorityLabel()}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 group-hover:opacity-100 transition-opacity">
            <PlayCircle className="w-4 h-4 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 group-hover:opacity-100 transition-opacity">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="h-8 w-8 opacity-40 group-hover:opacity-100 transition-opacity text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default KeywordTableRow;