import { TrendingUp, TrendingDown } from "lucide-react";

interface SourceData {
  name: string;
  icon: string;
  mentions: number;
  percentage: number;
  trend: string;
  sentiment: number;
  color: string;
}

interface SourcesBreakdownProps {
  sources: SourceData[];
}

export function SourcesBreakdown({ sources }: SourcesBreakdownProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">
        Répartition par sources
      </h2>

      <div className="space-y-4">
        {sources.map((source, index) => {
          const isPositiveTrend = source.trend.startsWith('+');
          
          return (
            <div key={index} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-lg">
                    {source.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-foreground">
                      {source.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {source.mentions.toLocaleString()} mentions
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    isPositiveTrend ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span>{source.trend}</span>
                    {isPositiveTrend ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                  </div>
                  
                  <div className="text-sm font-semibold text-foreground">
                    {source.percentage}%
                  </div>
                </div>
              </div>

              {/* Progress bar with sentiment */}
              <div className="relative">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${source.percentage}%`,
                      backgroundColor: source.color
                    }}
                  />
                </div>
                
                {/* Sentiment indicator */}
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-muted-foreground">Sentiment:</span>
                  <span className={`text-xs font-medium ${
                    source.sentiment > 60 ? 'text-green-600' : 
                    source.sentiment > 40 ? 'text-gray-600' : 'text-red-600'
                  }`}>
                    {source.sentiment}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SourcesBreakdown;