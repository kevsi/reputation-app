import { TrendingUp, TrendingDown } from "lucide-react";

interface TimelineData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentTimelineProps {
  data: TimelineData[];
  evolution: string;
  isPositive: boolean;
}

export function SentimentTimeline({ data, evolution, isPositive }: SentimentTimelineProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.positive, d.neutral, d.negative]));

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Évolution du sentiment
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span className="text-sm font-semibold">{evolution}</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="space-y-4">
        <div className="h-64 flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const positiveHeight = (item.positive / maxValue) * 100;
            const neutralHeight = (item.neutral / maxValue) * 100;
            const negativeHeight = (item.negative / maxValue) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5" style={{ height: '100%', justifyContent: 'flex-end' }}>
                  <div
                    className="w-full bg-green-500 rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${positiveHeight}%` }}
                    title={`Positif: ${item.positive}`}
                  />
                  <div
                    className="w-full bg-gray-400 transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${neutralHeight}%` }}
                    title={`Neutre: ${item.neutral}`}
                  />
                  <div
                    className="w-full bg-red-500 transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{ height: `${negativeHeight}%` }}
                    title={`Négatif: ${item.negative}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center">
              {item.date}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-xs text-muted-foreground">Positif</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span className="text-xs text-muted-foreground">Neutre</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-xs text-muted-foreground">Négatif</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SentimentTimeline;