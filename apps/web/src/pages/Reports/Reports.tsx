import { useState, useEffect, useCallback } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { ScheduledReportItem } from "@/components/reports/ScheduledReportItem";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { reportsService } from "@/services/reports.service";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { Plus, Loader2, RefreshCw, Calendar, FileText, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Report, ScheduledReport } from "@/types/api";
import { isApiError } from "@/types/http";
import { ApiErrorHandler } from "@/lib/api-error-handler";
import { toast } from "sonner";

interface ReportFormSelection {
  brandId: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  format: 'pdf' | 'json';
}

export default function ReportsPage() {
  const { selectedBrand, brands } = useBrand();

  // State
  const [reports, setReports] = useState<Report[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selection, setSelection] = useState<ReportFormSelection>({
    brandId: "",
    type: "WEEKLY",
    format: "pdf"
  });

  // Modal State
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const fetchData = useCallback(async () => {
    if (!selectedBrand) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [reportsRes, scheduledRes] = await Promise.all([
        reportsService.getAll(selectedBrand.id),
        reportsService.getScheduled(selectedBrand.id)
      ]);

      if (!isApiError(reportsRes) && reportsRes.data) setReports(reportsRes.data);
      if (!isApiError(scheduledRes) && scheduledRes.data) setScheduledReports(scheduledRes.data);

      setSelection(prev => ({ ...prev, brandId: selectedBrand.id }));
    } catch (err) {
      setError("Impossible de charger les rapports");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useBrandListener(async () => { await fetchData(); });

  const handleGenerateReport = async () => {
    if (!selection.brandId) return;
    setIsGenerating(true);
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);

      const response = await reportsService.generate({
        ...selection,
        startDate: start.toISOString(),
        endDate: end.toISOString()
      });

      if (isApiError(response)) {
        toast.error(ApiErrorHandler.getUserMessage(response.error));
      } else {
        toast.success("Rapport en cours de génération");
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error) {
      toast.error("Échec de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    setIsDeleting(id);
    try {
      const response = await reportsService.delete(id);
      if (isApiError(response)) {
        toast.error(ApiErrorHandler.getUserMessage(response.error));
      } else {
        toast.success("Rapport supprimé");
        setReports(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      toast.error("Échec de la suppression");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleScheduled = async (id: string) => {
    if (isToggling) return;
    const report = scheduledReports.find(r => r.id === id);
    if (!report) return;

    setIsToggling(id);
    try {
      const response = await reportsService.toggleScheduled(id, !report.isActive);
      if (isApiError(response)) {
        // handle error if needed
      } else {
        setScheduledReports(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
        toast.success(report.isActive ? "Désactivé" : "Activé");
      }
    } catch (err) {
      toast.error("Erreur toggle");
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Rapports</h1>
            <p className="text-muted-foreground mt-1">Gérez vos synthèses périodiques pour {selectedBrand?.name}.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchData} className="rounded-full px-6">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
            </Button>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Nouveau rapport
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Générer un export</DialogTitle>
                  <DialogDescription>Configurez les paramètres de votre synthèse personnalisée.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Marque ciblée</label>
                    <Select value={selection.brandId} onValueChange={(v) => setSelection({ ...selection, brandId: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Période</label>
                      <Select value={selection.type} onValueChange={(v: any) => setSelection({ ...selection, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Quotidien</SelectItem>
                          <SelectItem value="WEEKLY">Hebdomadaire</SelectItem>
                          <SelectItem value="MONTHLY">Mensuel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Format</label>
                      <Select value={selection.format} onValueChange={(v: any) => setSelection({ ...selection, format: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full">Annuler</Button>
                  <Button onClick={handleGenerateReport} disabled={isGenerating} className="rounded-full px-8">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    Lancer la génération
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-10 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" /> Historique des rapports
            </h2>
            {loading && reports.length === 0 ? (
              <div className="py-32 text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              </div>
            ) : reports.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed border-border rounded-xl bg-muted/20">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">Aucun rapport généré.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reports.map((r) => (
                  <ReportCard
                    key={r.id}
                    {...r as any}
                    title={r.title || `Rapport ${r.type}`}
                    status={r.status === 'COMPLETED' ? 'Terminé' : 'En cours'}
                    onDelete={() => setConfirmDelete({ isOpen: true, id: r.id })}
                    onDownload={() => toast.success("Téléchargement démarré")}
                    onPreview={() => toast.info("Prévisualisation en cours de développement")}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Automations
            </h2>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <p className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">Planification active</p>
              <div className="space-y-6">
                {scheduledReports.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-muted-foreground">Aucune planification trouvée.</p>
                    <Button variant="link" size="sm" className="mt-2">Configurer maintenant</Button>
                  </div>
                ) : (
                  scheduledReports.map((s) => (
                    <ScheduledReportItem key={s.id} {...s} onToggle={handleToggleScheduled} />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onOpenChange={(v) => setConfirmDelete(prev => ({ ...prev, isOpen: v }))}
        title="Supprimer le rapport"
        description="Cette action est irréversible. Le fichier sera définitivement supprimé de nos serveurs."
        onConfirm={async () => {
          if (confirmDelete.id) await handleDelete(confirmDelete.id);
        }}
      />
    </div>
  );
}