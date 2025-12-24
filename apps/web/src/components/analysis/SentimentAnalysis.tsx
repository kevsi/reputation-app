interface SentimentData {
  label: string;
  percentage: number;
  color: string;
}

interface SentimentAnalysisProps {
  data: SentimentData[];
  totalPositive: number;
}

export function SentimentAnalysis({
  data,
  totalPositive,
}: SentimentAnalysisProps) {
  const total = data.reduce((sum, item) => sum + item.percentage, 0);
  let currentAngle = 0;

  const segments = data.map((item) => {
    const angle = (item.percentage / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    return { ...item, startAngle, angle };
  });

  const radius = 80;
  const innerRadius = 55;
  const center = 100;

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">
        Analyse de sentiment
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LISTE */}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-semibold">
                  {item.percentage}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* DONUT SVG */}
        <div className="flex items-center justify-center">
          <svg
            viewBox="0 0 200 200"
            className="w-64 h-64"
            aria-label="Sentiment chart"
          >
            {/* Segments */}
            {segments.map((segment, i) => {
              const startRad =
                ((segment.startAngle - 90) * Math.PI) / 180;
              const endRad =
                ((segment.startAngle + segment.angle - 90) * Math.PI) /
                180;

              const x1 = center + radius * Math.cos(startRad);
              const y1 = center + radius * Math.sin(startRad);
              const x2 = center + radius * Math.cos(endRad);
              const y2 = center + radius * Math.sin(endRad);

              const largeArc = segment.angle > 180 ? 1 : 0;

              const path = `
                M ${center} ${center}
                L ${x1} ${y1}
                A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
                Z
              `;

              return (
                <path
                  key={i}
                  d={path}
                  fill={segment.color}
                  opacity={0.9}
                />
              );
            })}

            {/* Cercle intérieur */}
            <circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="currentColor"
              className="text-card"
            />

            {/* Texte centré */}
            <text
              x="100"
              y="96"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="32"
              fontWeight="700"
              fill="currentColor"
              className="text-foreground"
            >
              {totalPositive}%
            </text>

            <text
              x="100"
              y="122"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fill="currentColor"
              className="text-muted-foreground"
            >
              Positif
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default SentimentAnalysis;
