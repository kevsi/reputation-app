import { TrendingUp, TrendingDown } from "lucide-react";

interface Keyword {
  tag: string;
  mentions: number;
  trend: "up" | "down";
}

interface TrendingKeywordsProps {
  keywords: Keyword[];
}

export function TrendingKeywords({ keywords }: TrendingKeywordsProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">
        Mots-clés tendance
      </h2>

      <div className="space-y-3">
        {keywords.map((keyword, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">
                {keyword.tag}
              </span>
              {keyword.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {keyword.mentions} mentions
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TrendingKeywords;