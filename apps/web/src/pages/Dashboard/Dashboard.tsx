import { StatCard } from "@/components/dashboard/StatCard";
import { LineChart } from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";
import ActivityChart from "@/components/dashboard/ActivityChart";
import DonutChart from "@/components/dashboard/DonutChart";

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Overview</h1>
          <select className="px-4 py-2 border border-border rounded-lg text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground">
            <option>Today</option>
            <option>This week</option>
            <option>This month</option>
            <option>This year</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 mb-6">
          <StatCard
            title="Mentions totales"
            value="7,265"
            change="+11.01%"
            trend="up"
          />
          <StatCard
            title="Sentiment global"
            value="3,671"
            change="-0.03%"
            trend="down"
          />
          <StatCard
            title="Alertes actives"
            value="156"
          />
          <StatCard
            title="Score de reputation"
            value="2,318"
            change="+6.08%"
            trend="up"
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-4 sm:space-y-5 lg:space-y-6">
          {/* Ligne 1 : LineChart (2 cols) + BarChart (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <div className="lg:col-span-2">
              <LineChart />
            </div>
            <div className="lg:col-span-1">
              <BarChart />
            </div>
          </div>

          {/* Ligne 2 : ActivityChart + DonutChart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            <ActivityChart />
            <DonutChart />
          </div>
        </div>
      </div>
    </div>
  );
}