import { useState, useEffect, useCallback } from "react";
import { AlertCard } from "@/components/alerts/AlertCard";
import { AlertDetailModal } from "@/components/alerts/AlertDetailModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { alertsService } from "@/services/alerts.service";
import { Plus, Loader2, RefreshCw, AlertCircle, AlertTriangle } from "lucide-react";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { isApiError } from "@/types/http";
import { ApiErrorHandler } from "@/lib/api-error-handler";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { AlertDetail } from "@/types/api";
import { toast } from "sonner";

interface MappedAlert {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  mentions: number;
  platform: string;
  impact: 'élevé' | 'moyen' | 'faible';
  raw: AlertDetail;
}

export default function AlertsPage() {
  const { selectedBrand } = useBrand();

  // State
  const [alerts, setAlerts] = useState<AlertDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [confirmResolve, setConfirmResolve] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const fetchAlerts = useCallback(async () => {
    if (!selectedBrand) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await alertsService.getAll(selectedBrand.organizationId);

      if (isApiError(response)) {
        setError(ApiErrorHandler.getUserMessage(response.error));
      } else {
        setAlerts(response.data || []);
      }
    } catch (err) {
      setError("Erreur réseau lors du chargement des alertes");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useBrandListener(async () => {
    await fetchAlerts();
  });

  const handleResolve = async (id: string) => {
    try {
      const response = await alertsService.resolve(id);
      if (!isApiError(response)) {
        toast.success("Alerte marquée comme résolue");
        fetchAlerts();
      } else {
        toast.error("Échec de la résolution");
      }
    } catch (err) {
      toast.error("Erreur de communication");
    }
  };

  const mappedAlerts: MappedAlert[] = alerts.map((alert) => ({
    id: alert.id,
    type: (alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'urgent' :
      alert.severity === 'MEDIUM' ? 'warning' : 'info'),
    title: alert.title || "Alerte système",
    description: alert.description || "Aucune description",
    timestamp: alert.createdAt ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr }) : "À l'instant",
    status: alert.status === 'RESOLVED' ? "Résolu" : alert.status === 'INACTIVE' ? "Ignoré" : "En cours",
    mentions: 0,
    platform: "Toutes",
    impact: (alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'élevé' :
      alert.severity === 'MEDIUM' ? 'moyen' : 'faible') as any,
    raw: alert
  }));

  const stats = {
    urgent: mappedAlerts.filter(a => a.type === 'urgent' && a.raw.status !== 'RESOLVED').length,
    warning: mappedAlerts.filter(a => a.type === 'warning' && a.raw.status !== 'RESOLVED').length,
    total: mappedAlerts.filter(a => a.raw.status !== 'RESOLVED').length
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Alertes</h1>
            <p className="text-muted-foreground mt-1">Surveillez les incidents critiques en temps réel.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchAlerts}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Nouvelle règle
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-10 rounded-2xl border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-destructive text-destructive-foreground rounded-xl shadow-sm">
            <div className="text-destructive-foreground/70 text-xs font-bold mb-1 uppercase tracking-wider">Actives / Critiques</div>
            <div className="text-3xl font-bold">{stats.urgent}</div>
          </div>
          <div className="p-6 bg-amber-500 text-white rounded-xl shadow-sm">
            <div className="text-amber-50 text-xs font-bold mb-1 uppercase tracking-wider">Actives / Warning</div>
            <div className="text-3xl font-bold">{stats.warning}</div>
          </div>
          <div className="p-6 bg-card border rounded-xl shadow-sm">
            <div className="text-muted-foreground text-xs font-bold mb-1 uppercase tracking-wider">Total en cours</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
        </div>

        <div className="space-y-6">
          {loading && !alerts.length ? (
            <div className="py-32 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-6" />
              <p className="text-muted-foreground font-medium">Récupération des événements critiques...</p>
            </div>
          ) : mappedAlerts.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-semibold mb-2">Tout est calme ici</h3>
              <p className="text-muted-foreground mb-6">Aucune alerte n'a été déclenchée pour le moment.</p>
              <Button variant="outline" size="sm">Configurer les seuils</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {mappedAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  {...alert}
                  onView={() => { setSelectedAlert(alert.raw); setIsDetailOpen(true); }}
                  onResolve={() => setConfirmResolve({ isOpen: true, id: alert.id })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onResolve={handleResolve}
      />

      <ConfirmModal
        isOpen={confirmResolve.isOpen}
        onOpenChange={(v) => setConfirmResolve(prev => ({ ...prev, isOpen: v }))}
        title="Résoudre l'alerte"
        description="Confirmez-vous que l'incident lié à cette alerte est totalement maîtrisé ?"
        onConfirm={async () => {
          if (confirmResolve.id) await handleResolve(confirmResolve.id);
        }}
        confirmLabel="Marquer comme résolu"
        variant="default"
      />
    </div>
  );
}
