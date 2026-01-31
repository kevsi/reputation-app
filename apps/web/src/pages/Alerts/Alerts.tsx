
import { useState, useEffect } from "react";
import { AlertCard } from "@/components/alerts/AlertCard";
import { Settings, Plus, Loader2, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.getAlerts({ organizationId: user.organizationId });
      // @ts-ignore
      const data = response.data || (Array.isArray(response) ? response : []);
      setAlerts(data);
    } catch (err) {
      // Error fetching alerts
    
      setError("Impossible de charger les alertes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  // Map API data to UI model expected by AlertCard
  const mappedAlerts = alerts.map((alert: any) => ({
    id: alert.id,
    type: (alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'urgent' :
      alert.severity === 'MEDIUM' ? 'warning' : 'info') as 'urgent' | 'warning' | 'info',
    title: alert.title || "Alerte système",
    description: alert.description || alert.message,
    timestamp: alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr }) : "À l'instant",
    status: alert.status === 'RESOLVED' ? "Résolu" : "En cours",
    mentions: alert.mentionCount || 0,
    platform: alert.metadata?.source || "Toutes",
    impact: (alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'élevé' :
      alert.severity === 'MEDIUM' ? 'moyen' : 'faible') as 'élevé' | 'moyen' | 'faible'
  }));

  const stats = {
    urgent: mappedAlerts.filter(a => a.type === 'urgent').length,
    warning: mappedAlerts.filter(a => a.type === 'warning').length,
    total: mappedAlerts.length
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Alertes
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Surveillez les événements importants concernant votre marque
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchAlerts}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                title="Rafraîchir"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
                <Settings className="w-4 h-4" />
                Configurer règles
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Nouvelle alerte
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Alertes urgentes</div>
            <div className="text-4xl font-bold text-foreground">{stats.urgent}</div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Avertissements</div>
            <div className="text-4xl font-bold text-foreground">{stats.warning}</div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Total actives</div>
            <div className="text-4xl font-bold text-foreground">{stats.total}</div>
          </div>
        </div>

        {/* Alerts List */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Alertes actives ({mappedAlerts.length})
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : mappedAlerts.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Aucune alerte active
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Configurez des règles pour recevoir des alertes personnalisées
              </p>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Configurer mes alertes
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mappedAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  {...alert}
                  onView={() => {}}
                  onResolve={() => {}}
                  onIgnore={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}