import { useEffect, useState, useCallback } from "react";
import { SourceCard } from "@/components/sources/SourceCard";
import SourceForm from "@/components/sources/SourceForm";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { sourcesService, Source } from "@/services/sources.service";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { isApiError } from "@/types/http";
import { ApiErrorHandler } from "@/lib/api-error-handler";
import { Plus, Loader2, AlertCircle, Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SourcesPage() {
  const { selectedBrand, brands: contextBrands } = useBrand();
  const navigate = useNavigate();

  // State
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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
      const response = await sourcesService.getByBrandId(selectedBrand.id);

      if (isApiError(response)) {
        setError(ApiErrorHandler.getUserMessage(response.error));
        setSources([]);
      } else {
        setSources((response.data || []) as Source[]);
      }
    } catch (err) {
      setError("Erreur réseau");
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useBrandListener(async () => { await fetchData(); });

  const handleSourceCreated = async (newSource: any) => {
    setIsDialogOpen(false);
    setSources(prev => [newSource, ...prev]);
    toast.success("Source ajoutée avec succès");
    handleScrapeSource(newSource.id);
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (isDeleting) return; // Prevent double-click
    setIsDeleting(true);
    try {
      const response = await sourcesService.delete(sourceId);
      if (isApiError(response)) {
        toast.error(ApiErrorHandler.getUserMessage(response.error));
      } else {
        setSources(prev => prev.filter(s => s.id !== sourceId));
        toast.success("Source supprimée");
      }
    } catch (error) {
      toast.error('Échec de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleScrapeSource = async (sourceId: string) => {
    setIsScraping(true);
    try {
      const response = await sourcesService.triggerScraping(sourceId);
      if (isApiError(response)) {
        toast.error("Erreur d'analyse");
      } else {
        toast.success("Analyse terminée");
        await fetchData();
      }
    } catch (error) {
      toast.error("Erreur technique");
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sources</h1>
            <p className="text-muted-foreground mt-1">Gérez vos sources de veille pour {selectedBrand?.name}.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter une source
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl px-6 py-6">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle source</DialogTitle>
                <DialogDescription>
                  Créez une source de veille pour surveiller votre e-réputation
                </DialogDescription>
              </DialogHeader>

              {contextBrands.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground mb-4">Configurez d'abord une marque</p>
                  <Button onClick={() => navigate('/brands')}>Créer une marque</Button>
                </div>
              ) : (
                <SourceForm
                  brandId={selectedBrand?.id || contextBrands[0].id}
                  onSuccess={handleSourceCreated}
                  onCancel={() => setIsDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher une source..." className="pl-12" />
          </div>
          <Button variant="outline" className="gap-2"><Filter className="w-4 h-4" /> Filtres</Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isScraping && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-xl shadow-xl border max-w-sm w-full mx-4 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analyse en cours...</h3>
              <p className="text-muted-foreground text-sm">
                Récupération des mentions. Cela peut prendre quelques instants.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Chargement des sources...</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl">
              <p className="text-muted-foreground mb-4">Aucune source trouvée.</p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une source
              </Button>
            </div>
          ) : (
            sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onDelete={() => setConfirmDelete({ isOpen: true, id: source.id })}
                onScrapeNow={() => handleScrapeSource(source.id)}
              />
            ))
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onOpenChange={(v) => setConfirmDelete(prev => ({ ...prev, isOpen: v }))}
        title="Désactiver la source"
        description="Cette source cessera d'être synchronisée. Les données déjà collectées resteront disponibles dans votre historique."
        onConfirm={async () => {
          if (confirmDelete.id) await handleDeleteSource(confirmDelete.id);
        }}
      />
    </div>
  );
}
