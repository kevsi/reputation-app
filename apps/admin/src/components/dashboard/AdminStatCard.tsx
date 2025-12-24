interface AdminStatCardProps {
  label: string;
  value: string;
  trend: string;
  trendPositive: boolean;
}

export function AdminStatCard({ label, value, trend, trendPositive }: AdminStatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="text-sm text-muted-foreground mb-2">{label}</div>
      <div className="text-3xl font-bold text-foreground mb-2">
        {value}
      </div>
      <div className={`text-xs font-medium ${
        trendPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {trend}
      </div>
    </div>
  );
}

export default AdminStatCard;