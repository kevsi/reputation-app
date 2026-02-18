"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualityMetricCard = QualityMetricCard;
function QualityMetricCard({ title, value, unit, trend, isPositiveTrend, threshold, icon }) {
    const isAboveThreshold = value >= threshold;
    const statusColor = isAboveThreshold ? 'text-green-600' : 'text-red-600';
    return (<div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        <div className={`text-xs font-medium ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </div>
      </div>

      <h3 className="text-sm font-medium text-muted-foreground mb-2">
        {title}
      </h3>

      <div className="flex items-end gap-2 mb-2">
        <div className={`text-4xl font-bold ${statusColor}`}>
          {value}
        </div>
        <div className="text-xl text-muted-foreground mb-1">{unit}</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-500 ${isAboveThreshold ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}/>
        </div>
        <span className="text-xs text-muted-foreground">
          Seuil: {threshold}{unit}
        </span>
      </div>
    </div>);
}
exports.default = QualityMetricCard;
