interface KeywordTableRowProps {
  keyword: string;
  type: "mention" | "hashtag" | "regex" | "exclusion";
  priority: "urgent" | "high" | "medium" | "low";
  organisations: number;
  isActive: boolean;
  onToggle: () => void;
  onModify: () => void;
  onTest: () => void;
}

export function KeywordTableRow({
  keyword,
  type,
  priority,
  organisations,
  isActive,
  onToggle,
  onModify,
  onTest
}: KeywordTableRowProps) {
  const getTypeLabel = () => {
    switch (type) {
      case "mention":
        return "mention";
      case "hashtag":
        return "hashtag";
      case "regex":
        return "regex";
      case "exclusion":
        return "exclusion";
      default:
        return type;
    }
  };

  const getPriorityStyle = () => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-blue-100 text-blue-700";
      case "low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-colors">
      {/* Mot-clé / Règle */}
      <td className="px-4 py-4">
        <span className="text-sm font-mono text-foreground">{keyword}</span>
      </td>

      {/* Type */}
      <td className="px-4 py-4">
        <span className="text-sm text-muted-foreground">{getTypeLabel()}</span>
      </td>

      {/* Priorité */}
      <td className="px-4 py-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityStyle()}`}>
          {priority}
        </span>
      </td>

      {/* Organisations */}
      <td className="px-4 py-4">
        <span className="text-sm text-foreground">{organisations}</span>
      </td>

      {/* Statut (Toggle) */}
      <td className="px-4 py-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={onToggle}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex gap-2">
          <button
            onClick={onModify}
            className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors text-foreground"
          >
            Modifier
          </button>
          <button
            onClick={onTest}
            className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors text-foreground"
          >
            Tester
          </button>
        </div>
      </td>
    </tr>
  );
}

export default KeywordTableRow;