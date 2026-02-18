import { Sparkles, TrendingUp } from "lucide-react";

interface Insight {
  type: "positive" | "neutral" | "warning";
  title: string;
  description: string;
  icon: typeof TrendingUp;
}

interface AIInsightsProps {
  insights: Insight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  const getInsightStyle = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900";
      case "warning":
        return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900";
      default:
        return "bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600";
      case "warning":
        return "text-amber-600";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-900 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-foreground">
          Insights IA
        </h2>
        <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
          Nouveau
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border ${getInsightStyle(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${getIconColor(insight.type)}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AIInsights;