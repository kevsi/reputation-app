
import { useState, useEffect } from "react";
import { ReportCard } from "@/components/reports/ReportCard";
import { ScheduledReportItem } from "@/components/reports/ScheduledReportItem";
import { Plus, Loader2, RefreshCw, Calendar, FileText } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
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

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selection, setSelection] = useState({
    brandId: "",
    type: "WEEKLY",
    format: "pdf"
  });

  const [scheduledReports, setScheduledReports] = useState([
    { id: "s1", title: "Rapport quotidien", schedule: "Tous les jours à 9h00", isActive: true },
    { id: "s2", title: "Résumé hebdomadaire", schedule: "Tous les lundis à 10h00", isActive: true }
  ]);

  const fetchData = async () => {
    if (!user?.organizationId) return;
    setLoading(true);
    setError(null);
    try {
      const [reportsRes, brandsRes] = await Promise.all([
        apiClient.getReports({ organizationId: user.organizationId }),
        apiClient.getBrands()
      ]);

      const reportsData = (reportsRes as any).data || (Array.isArray(reportsRes) ? reportsRes : []);
      const brandsData = (brandsRes as any).data || (Array.isArray(brandsRes) ? brandsRes : []);

      setReports(reportsData);
      setBrands(brandsData);

      if (brandsData.length > 0) {
        setSelection(prev => ({ ...prev, brandId: brandsData[0].id }));
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleGenerateReport = async () => {
    if (!selection.brandId) return;
    setIsGenerating(true);
    try {
      // Mock dates for demonstration
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const response = await apiClient.callApi<any>('/reports/generate', {
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
        fetchData(); // Refresh list
      } else {
        toast.error("Échec de la génération");
      }
    } catch (error) {
      console.error("Error generating report", error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleReport = (id: string) => {
    setScheduledReports(prev =>
      prev.map(report =>
        report.id === id ? { ...report, isActive: !report.isActive } : report
      )
    );
  };

  const mappedReports = reports.map((report: any) => ({
    id: report.id,
    title: report.title || `Report ${report.brand?.name || 'Unknown'}`,
    type: report.type || "Ponctuel",
    date: report.createdAt ? new Date(report.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : "Date inconnue",
    status: (report.status === 'COMPLETED' || report.generatedAt ? "Terminé" : "En cours") as "Terminé" | "En cours",
    mentions: report.data?.summary?.totalMentions || 0,
    sentiment: report.data?.summary?.sentimentScore ? `${Math.round(report.data.summary.sentimentScore * 100)}%` : "N/A",
    engagement: report.data?.summary?.engagementCount || 0
  }));

  const stats = {
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
                        onValueChange={(val) => setSelection({ ...selection, type: val })}
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
                        onValueChange={(val) => setSelection({ ...selection, format: val })}
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
                    onPreview={() => console.log("Preview", report.id)}
                    onDownload={() => console.log("Download", report.id)}
                    onEdit={() => console.log("Edit", report.id)}
                    onDelete={() => console.log("Delete", report.id)}
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