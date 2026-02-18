type Source = {
  name: string;
  value: number;
  color: string;
};

interface BarChartProps {
  data?: Source[];
  loading?: boolean;
}

export default function BarChart({
  data = [],
  loading = false,
}: BarChartProps) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map((s) => s.value), 0);
  const total = sorted.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="w-full max-w-sm mx-auto p-5 rounded-2xl bg-card border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-sm font-semibold text-foreground">
          Mentions par<br />source
        </h2>
        {!loading && (
          <div className="text-right text-xs text-muted-foreground">
            <div className="text-base font-semibold text-foreground">
              {total}
            </div>
            total
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Loading */}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-3 w-6 bg-muted rounded" />
              </div>
              <div className="h-2 bg-muted rounded-full" />
            </div>
          ))}

        {/* Empty */}
        {!loading && sorted.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-8">
            Aucune donnée disponible
          </div>
        )}

        {/* Data */}
        {!loading &&
          sorted.map((source) => {
            const percent = max ? (source.value / max) * 100 : 0;

            return (
              <div key={source.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {source.name}
                  </span>
                  <span className="font-semibold text-foreground">
                    {source.value}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: source.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      {!loading && sorted.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border flex justify-between text-[11px] text-muted-foreground">
          <span>• 1 point = 10 mentions</span>
          <span>Max : {max}</span>
        </div>
      )}
    </div>
  );
}
