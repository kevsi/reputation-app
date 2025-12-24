const countries = [
  { name: "United States", value: 52.1, color: "#1F2937" },
  { name: "Canada", value: 22.8, color: "#3B82F6" },
  { name: "Mexico", value: 13.9, color: "#10B981" },
  { name: "Other", value: 11.2, color: "#60A5FA" },
];

export default function DonutChart() {
  const total = countries.reduce((sum, c) => sum + c.value, 0);

  const segments = countries.reduce((acc, country, i) => {
    const startAngle = i === 0 ? 0 : acc[acc.length - 1].endAngle;
    const angle = (country.value / total) * 360;
    const endAngle = startAngle + angle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = 60 + 50 * Math.cos(startRad);
    const y1 = 60 + 50 * Math.sin(startRad);
    const x2 = 60 + 50 * Math.cos(endRad);
    const y2 = 60 + 50 * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;
    const path = `M 60 60 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

    acc.push({ endAngle, path, color: country.color });
    return acc;
  }, [] as { endAngle: number; path: string; color: string }[]);

  return (
    <div className="w-full lg:min-w-[400px] flex-1 p-5 rounded-2xl bg-card border border-border flex flex-col gap-5 h-auto md:h-[280px] shadow-sm">
      <div className="text-sm font-semibold text-foreground">Mentions par pays</div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 w-full">
        {/* Donut */}
        <div className="w-[140px] h-[140px] flex-shrink-0 relative mx-auto md:mx-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            {segments.map((segment, i) => (
              <path
                key={i}
                d={segment.path}
                fill={segment.color}
                opacity={0.95}
                className="transition-all duration-500 ease-out"
              />
            ))}
            <circle cx="60" cy="60" r="35" fill="currentColor" className="text-card" />
          </svg>
        </div>

        {/* Légende */}
        <div className="flex-1 flex flex-col gap-3 w-full max-w-full">
          {countries.map((country) => (
            <div
              key={country.name}
              className="flex items-center justify-between min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="w-4 h-4 rounded-full inline-block flex-shrink-0"
                  style={{ backgroundColor: country.color }}
                />
                <span className="text-sm font-medium text-foreground truncate">
                  {country.name}
                </span>
              </div>
              <span className="text-sm text-muted-foreground flex-shrink-0">
                {country.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
