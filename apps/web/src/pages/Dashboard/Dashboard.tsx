import { useEffect, useState, useCallback } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { LineChart } from "@/components/dashboard/LineChart";
import BarChart from "@/components/dashboard/BarChart";
import ActivityChart from "@/components/dashboard/ActivityChart";
import DonutChart from "@/components/dashboard/DonutChart";
import { analyticsService } from "@/services/analytics.service";
import { alertsService } from "@/services/alerts.service";
import { useAuth } from "@/contexts/AuthContext";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { DashboardStats, AlertDetail } from "@/types/api";
import { isApiError } from "@/types/http";
import { Button } from "@/components/ui/button";

interface DashboardState {
  stats: DashboardStats | null;
  alerts: AlertDetail[];
  reputationScore: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedBrand } = useBrand();

  // State
  const [data, setData] = useState<DashboardState>({
    stats: null,
    alerts: [],
    reputationScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (signal?: AbortSignal) => {
    if (!selectedBrand) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [statsRes, alertsRes] = await Promise.all([
        analyticsService.getSummary(selectedBrand.id),
        alertsService.getAll(selectedBrand.organizationId)
      ]);

      // Check if request was aborted
      if (signal?.aborted) return;

      let stats: DashboardStats | null = null;
      if (!isApiError(statsRes) && statsRes.data) {
        stats = statsRes.data as DashboardStats;
      }

      let alerts: AlertDetail[] = [];
      if (!isApiError(alertsRes) && alertsRes.data) {
        alerts = alertsRes.data ?? [];
      }

      // Check again after async operations
      if (signal?.aborted) return;

      // Calcul du score de réputation localement
      const totalMentions = stats?.totalMentions ?? 0;
      const sentimentScore = stats?.sentimentScore ?? 0;
      const repScore = Math.round(
        (Math.max(0, Math.min(sentimentScore, 1)) * 80) +
        (Math.min(Math.log(totalMentions + 1), 5) / 5 * 20)
      );

      setData({
        stats,
        alerts,
        reputationScore: repScore
      });
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') return;
      setError("Impossible de charger les données du tableau de bord");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [selectedBrand]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchDashboardData(abortController.signal);
    
    return () => {
      abortController.abort();
    };
  }, [fetchDashboardData]);

  useBrandListener(async () => {
    await fetchDashboardData();
  });

  if (loading && !data.stats) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Initialisation de votre espace...</p>
        </div>
      </div>
    );
  }

  const { stats, alerts, reputationScore } = data;
  const activeAlerts = alerts.filter(a => a.status !== 'RESOLVED').length;

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground mt-2">
              Ravi de vous revoir, <span className="text-foreground font-medium">{user?.name}</span>.
              Voici l'état de la marque <span className="text-primary font-semibold">{selectedBrand?.name}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => fetchDashboardData()} className="rounded-full shadow-sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
            </Button>
            <Button size="sm" className="rounded-full shadow-md bg-primary hover:bg-primary/90">
              Générer rapport
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm flex items-center gap-3 mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Mentions"
            value={(stats?.totalMentions ?? 0).toLocaleString()}
            change={stats?.mentionTrend ? `${stats.mentionTrend > 0 ? '+' : ''}${stats.mentionTrend}%` : undefined}
            trend={stats?.mentionTrend && stats.mentionTrend > 0 ? "up" : "down"}
          />
          <StatCard
            title="Sentiment"
            value={`${Math.round((stats?.sentimentScore ?? 0) * 100)}%`}
            change={stats?.sentimentTrend ? `${stats.sentimentTrend > 0 ? '+' : ''}${stats.sentimentTrend}%` : undefined}
            trend={stats?.sentimentTrend && stats.sentimentTrend > 0 ? "up" : "down"}
          />
          <StatCard
            title="Alertes"
            value={activeAlerts.toString()}
            className={activeAlerts > 0 ? "border-amber-500/50 bg-amber-500/5" : ""}
          />
          <StatCard
            title="Réputation"
            value={`${reputationScore}/100`}
            trend="up"
          />
        </div>

        {/* Visualizations Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Évolution des mentions</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary" /> Volume
                </div>
              </div>
            </div>
            <LineChart />
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Sources d'influence</h3>
            <BarChart />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Mentions par plateforme</h3>
            <DonutChart />
          </div>
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6">Intensité de l'activité</h3>
            <ActivityChart />
          </div>
        </div>
      </div>
    </div>
  );
}
