import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  trend,
  className 
}: StatCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend === "up" ? "text-green-600" : "text-red-600";

  return (
    <div
      className={`
        p-4 md:p-6 rounded-2xl bg-card border border-border
        min-w-[160px] sm:min-w-[200px]
        transition-all duration-300
        hover:shadow-lg hover:scale-[1.02]
        ${className || ''}
      `}
    >
      {/* Title */}
      <div className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 md:mb-3">
        {title}
      </div>

      {/* Value and Change */}
      <div className="flex items-end justify-between gap-2">
        {/* Value */}
        <div className="text-2xl sm:text-3xl font-bold text-foreground leading-none">
          {value}
        </div>

        {/* Change indicator */}
        {change && trend && (
          <div className={`
            flex items-center gap-1
            text-xs sm:text-sm font-medium
            whitespace-nowrap
            ${trendColor}
          `}>
            <span>{change}</span>
            <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

// Exemple d'utilisation
function App() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Mentions"
            value="24.5K"
            change="+12.5%"
            trend="up"
          />
          <StatCard
            title="Engagement Rate"
            value="8.3%"
            change="-2.1%"
            trend="down"
          />
          <StatCard
            title="Reach"
            value="142K"
            change="+8.7%"
            trend="up"
          />
          <StatCard
            title="Followers"
            value="89.2K"
            change="+5.3%"
            trend="up"
          />
        </div>
      </div>
    </div>
  );
}