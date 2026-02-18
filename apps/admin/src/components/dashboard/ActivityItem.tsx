interface ActivityItemProps {
  user: string;
  action: string;
  time: string;
}

export function ActivityItem({ user, action, time }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-semibold text-foreground flex-shrink-0">
        {user[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">{user}</span>{" "}
          {action}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
export default ActivityItem;