"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminStatCard = AdminStatCard;
function AdminStatCard({ label, value, trend, trendPositive, icon: Icon }) {
    return (<div className="bg-card border border-border rounded-xl p-4 sm:p-5 hover:shadow-md transition-all group overflow-hidden relative">
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="text-xs sm:text-sm text-muted-foreground mb-1">{label}</div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {value}
          </div>
          <div className={`text-xs sm:text-sm font-medium flex items-center gap-1 ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </div>
        </div>
        {Icon && (<div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
            <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"/>
          </div>)}
      </div>

      {/* Background Decor */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        {Icon && <Icon className="w-24 h-24"/>}
      </div>
    </div>);
}
exports.default = AdminStatCard;
