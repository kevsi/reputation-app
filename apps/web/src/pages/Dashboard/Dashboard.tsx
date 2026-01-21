
import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { LineChart } from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";
import ActivityChart from "@/components/dashboard/ActivityChart";
import DonutChart from "@/components/dashboard/DonutChart";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<{ stats: any, alerts: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.organizationId) return;

      try {
        setLoading(true);
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago

        const [statsRes, alertsRes] = await Promise.all([
          apiClient.getAnalyticsSummary({
            organizationId: user.organizationId,
            startDate,
            endDate
          }),
          apiClient.getAlerts({ organizationId: user.organizationId })
        ]);

        setData({
          stats: statsRes.success ? statsRes.data : null,
          alerts: (alertsRes as any).data || (Array.isArray(alertsRes) ? alertsRes : [])
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  const { stats, alerts } = data || { stats: null, alerts: [] };

  const totalMentions = stats?.totalMentions || 0;
  const sentimentScore = stats?.sentimentScore || 0;
  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'PENDING').length;

  // Reputation score calculation (simple mock derivation for now)
  const reputationScore = Math.round((sentimentScore * 100) + (totalMentions > 0 ? 50 : 0));

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Aperçu général</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Bienvenue sur votre tableau de bord, {user?.name}.
            </p>
          </div>
          <select className="px-4 py-2 border border-border rounded-lg text-sm w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground">
            <option>Derniers 30 jours</option>
            <option>Aujourd'hui</option>
            <option>Cette semaine</option>
            <option>Cette année</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Mentions totales"
            value={totalMentions.toLocaleString()}
            change="+11.0%"
            trend="up"
          />
          <StatCard
            title="Sentiment global"
            value={`${Math.round(sentimentScore * 100)}%`}
            change={sentimentScore > 0.5 ? "+2.4%" : "-1.2%"}
            trend={sentimentScore > 0.5 ? "up" : "down"}
          />
          <StatCard
            title="Alertes actives"
            value={activeAlerts.toString()}
            className={activeAlerts > 0 ? "border-amber-200 bg-amber-50/50" : ""}
          />
          <StatCard
            title="Score de réputation"
            value={reputationScore.toLocaleString()}
            change="+5.2%"
            trend="up"
          />
        </div>

        {/* Charts Section */}
        <div className="space-y-6">
          {/* Ligne 1 : LineChart (2 cols) + BarChart (1 col) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LineChart />
            </div>
            <div className="lg:col-span-1">
              <BarChart />
            </div>
          </div>

          {/* Ligne 2 : ActivityChart + DonutChart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityChart />
            <DonutChart />
          </div>
        </div>
      </div>
    </div>
  );
}
