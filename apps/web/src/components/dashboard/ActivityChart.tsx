const activities = [
  { name: "X", value: 25, color: "#A0BCE8" },
  { name: "Tiktok", value: 62, color: "#6BE6D3" },
  { name: "Reddit", value: 37, color: "#000000" }, // corrigé
  { name: "Insta", value: 75, color: "#7DBBFF" },
  { name: "Whatsapp", value: 12, color: "#B899EB" },
  { name: "Discord", value: 50, color: "#71DD8C" },
];


export default function ActivityChart() {
  const maxValue = Math.max(...activities.map(a => a.value));

  return (
    <div className="w-full lg:min-w-[400px] flex-1 p-5 rounded-2xl bg-card border border-border flex flex-col gap-4 h-[280px] shadow-sm">
      <div className="text-sm font-semibold text-foreground mb-2">Activité par source</div>

      <div className="flex-1 flex gap-4">
        {/* Axe Y */}
        <div className="flex flex-col justify-between text-xs text-muted-foreground text-right">
          <div>{Math.round(maxValue * 0.75)}K</div>
          <div>{Math.round(maxValue * 0.5)}K</div>
          <div>{Math.round(maxValue * 0.25)}K</div>
          <div>0</div>
        </div>

        {/* Barres */}
        <div className="flex-1 flex flex-col justify-end">
          <div className="flex-1 flex items-end justify-between gap-3 pb-6">
            {activities.map((activity) => (
              <div key={activity.name} className="flex-1 flex flex-col justify-end h-full relative group">
                <div
                  className="w-full rounded-t-lg transition-all duration-500 ease-out"
                  style={{
                    height: `${activity.value}%`,
                    backgroundColor: activity.color,
                  }}
                />
                {/* Tooltip au hover */}
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {activity.value}K
                </div>
              </div>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            {activities.map((activity) => (
              <div key={activity.name} className="flex-1 text-center truncate">
                {activity.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
