
import { useState, useEffect, useCallback } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { ScheduledReportItem } from "@/components/reports/ScheduledReportItem";
import { Plus, Loader2, RefreshCw, Calendar, FileText } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
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
import { toast } from "sonner";
import { Report, ScheduledReport, BrandDetail, ApiResponse } from "@/types/api";

interface ReportFormSelection {
  brandId: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  format: 'pdf' | 'json';
}

interface MappedReport {
  id: string;
  title: string;
  type: string;
  date: string;
  status: "Terminé" | "En cours";
  mentions: number;
  sentiment: string;
  engagement: number;
}

interface StatsCard {
  total: number;
  thisMonth: number;
  scheduled: number;
  pending: number;
}

export default function ReportsPage() {
  // const { user } = useAuth();
  const { selectedBrand } = useBrand();
  const [reports, setReports] = useState<Report[]>([]);
  const [brands, setBrands] = useState<BrandDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selection, setSelection] = useState<ReportFormSelection>({
    brandId: "",
    type: "WEEKLY",
    format: "pdf"
  });

  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    { id: "s1", brandId: "", title: "Rapport quotidien", schedule: "Tous les jours à 9h00", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "s2", brandId: "", title: "Résumé hebdomadaire", schedule: "Tous les lundis à 10h00", isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ]);

  const fetchData = useCallback(async () => {
    if (!selectedBrand) return;
    
    setLoading(true);
    setError(null);
    try {
      const reportsRes = await apiClient.getReports({ brandId: selectedBrand.id });
      const reportsData: Report[] = Array.isArray((reportsRes as any).data) ? ((reportsRes as any).data as Report[]) : [];

      setReports(reportsData);
      setBrands(brands); // Use brands from context

      if (selectedBrand) {
        setSelection(prev => ({ ...prev, brandId: selectedBrand.id }));
      }
    } catch (err) {
      // const errorMessage = err instanceof Error ? err.message : "Une erreur est survenue";
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Écouter les changements de brand
  useBrandListener(async (_brand) => {
    await fetchData();
  });

  const handleGenerateReport = async () => {
    if (!selection.brandId) return;
    setIsGenerating(true);
    try {
      // Mock dates for demonstration
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const response = await apiClient.callApi<ApiResponse<Report>>('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({
          brandId: selection.brandId,
          type: selection.type,
          format: selection.format,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (response.success) {
        toast.success("Rapport généré avec succès");
        setIsModalOpen(false);
        await fetchData(); // Refresh list
      } else {
        toast.error("Échec de la génération");
      }
    } catch (error) {
      // const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";
      toast.error("Une erreur est survenue");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTypeChange = (val: string) => {
    if (['DAILY', 'WEEKLY', 'MONTHLY'].includes(val)) {
      setSelection({ ...selection, type: val as 'DAILY' | 'WEEKLY' | 'MONTHLY' });
    }
  };

  const handleFormatChange = (val: string) => {
    if (['pdf', 'json'].includes(val)) {
      setSelection({ ...selection, format: val as 'pdf' | 'json' });
    }
  };

  const handleToggleReport = (id: string) => {
    setScheduledReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, isActive: !report.isActive } : report
      )
    );
  };

  const mappedReports: MappedReport[] = reports.map((report) => ({
    id: report.id,
    title: report.title || `Report ${report.brandId || 'Unknown'}`,
    type: report.type || "Ponctuel",
    date: report.createdAt ? new Date(report.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : "Date inconnue",
    status: (report.status === 'COMPLETED') ? "Terminé" : "En cours",
    mentions: 0, // Placeholder
    sentiment: "N/A", // Placeholder
    engagement: 0 // Placeholder
  }));

  const stats: StatsCard = {
    total: mappedReports.length,
    thisMonth: mappedReports.length, // Placeholder
    scheduled: scheduledReports.length,
    pending: mappedReports.filter(r => r.status === 'En cours').length
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Rapports
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Générez et consultez vos rapports d'analyse détaillés
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nouveau rapport
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Générer un rapport</DialogTitle>
                    <DialogDescription>
                      Configurez les paramètres de votre nouveau rapport d'analyse.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Marque</label>
                      <Select
                        value={selection.brandId}
                        onValueChange={(val) => setSelection({ ...selection, brandId: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir une marque" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map(brand => (
                            <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Période</label>
                      <Select
                        value={selection.type}
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Quotidien (Dernières 24h)</SelectItem>
                          <SelectItem value="WEEKLY">Hebdomadaire (7 jours)</SelectItem>
                          <SelectItem value="MONTHLY">Mensuel (30 jours)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Format</label>
                      <Select
                        value={selection.format}
                        onValueChange={handleFormatChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF (Document complet)</SelectItem>
                          <SelectItem value="json">JSON (Données brutes)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={handleGenerateReport}
                      disabled={isGenerating || !selection.brandId}
                      className="w-full"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                      {isGenerating ? "Génération..." : "Générer maintenant"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Rapports générés
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              Période actuelle
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.thisMonth}</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-purple-500" />
              Programmés
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.scheduled}</div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-amber-500" />
              En cours
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.pending}</div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <h2 className="text-lg font-semibold text-foreground mb-4">Rapports récents</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : mappedReports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-2xl">
                <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">Aucun rapport disponible.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mappedReports.map((report) => (
                  <ReportCard
                    key={report.id}
                    {...report}
                    onPreview={() => undefined}
                    onDownload={() => undefined}
                    onEdit={() => undefined}
                    onDelete={() => undefined}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="xl:col-span-1">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Programmés</h2>
                <button className="text-xs font-bold text-primary hover:underline uppercase tracking-wider">
                  Config.
                </button>
              </div>
              <div className="space-y-3">
                {scheduledReports.map((report) => (
                  <ScheduledReportItem
                    key={report.id}
                    {...report}
                    onToggle={handleToggleReport}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}