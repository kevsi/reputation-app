interface ScheduledReportItemProps {
  id: string;
  title: string;
  schedule: string;
  isActive: boolean;
  onToggle: (id: string) => void;
}

export function ScheduledReportItem({
  id,
  title,
  schedule,
  isActive,
  onToggle
}: ScheduledReportItemProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="font-medium text-sm text-foreground mb-1">{title}</div>
        <div className="text-xs text-muted-foreground">{schedule}</div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => onToggle(id)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}

export default ScheduledReportItem;