import { useEffect, useState, useCallback } from "react";
import { SourceCard } from "@/components/sources/SourceCard";
import SourceForm from "@/components/sources/SourceForm";
import { apiClient } from "@/lib/api-client";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import type { Source, Brand } from "@/types/models";
import { Plus, Loader2 } from "lucide-react";
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

export default function SourcesPage() {
  // const { user } = useAuth();
  const { selectedBrand, brands: contextBrands, refreshBrands } = useBrand();
  const navigate = useNavigate();

  // ===== STATE MANAGEMENT =====
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal & Scraping State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [scrapingSourceId, setScrapingSourceId] = useState<string | null>(null);
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);

  // ===== DATA FETCHING =====
  const fetchData = useCallback(async () => {
    if (!selectedBrand) return;

    setLoading(true);
    setError(null);
    try {
      const sourcesRes = await apiClient.getSources();
      // Handle both direct array and wrapped response formats
      let sourcesData: Source[] = [];
      if (Array.isArray(sourcesRes.data)) {
        sourcesData = sourcesRes.data as Source[];
      } else if (sourcesRes.data && Array.isArray((sourcesRes.data as any).data)) {
        sourcesData = (sourcesRes.data as any).data as Source[];
      }
      setSources(sourcesData);
    } catch (e) {
      setError("Erreur lors du chargement des sources");
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  // Charger les données au montage et quand le brand change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Écouter les changements de brand
  useBrandListener(async () => {
    await fetchData();
  });
  const handleSourceCreated = async (newSource: any) => {
    setIsDialogOpen(false);
    
    // Add new source to list
    setSources(prev => [newSource, ...prev]);

    // Auto-trigger scraping for new source
    setIsScraping(true);
    setScrapingSourceId(newSource.id);

    try {
      await apiClient.post(`/sources/${newSource.id}/scrape-now`);
      // Refresh source data
      const updated = await apiClient.getSources();
      const sourcesData = Array.isArray((updated as any).data) ? ((updated as any).data as Source[]) : [];
      setSources(sourcesData);
    } catch (err) {
      // Scraping error
    
    } finally {
      setIsScraping(false);
      setScrapingSourceId(null);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source? Les mentions collectées seront conservées.')) {
      return;
    }

    setDeletingSourceId(sourceId);
    const sourceToDelete = sources.find(s => s.id === sourceId);
    setSources(prev => prev.filter(s => s.id !== sourceId));

    try {
      await apiClient.delete(`/sources/${sourceId}`);
    } catch (error) {
      // Delete error
    
      // Restore on error
      if (sourceToDelete) {
        setSources(prev => [...prev, sourceToDelete]);
      }
      setError('Échec de la suppression. Veuillez réessayer.');
    } finally {
      setDeletingSourceId(null);
    }
  };

  const handleScrapeSource = async (sourceId: string) => {
    setIsScraping(true);
    setScrapingSourceId(sourceId);

    try {
      await apiClient.post(`/sources/${sourceId}/scrape-now`);
      // Refresh sources
      const updated = await apiClient.getSources();
      const sourcesData = Array.isArray((updated as any).data) ? ((updated as any).data as Source[]) : [];
      setSources(sourcesData);
    } catch (error) {
      // Trigger scraping error
    
      setError('Erreur lors du scraping. Veuillez réessayer.');
    } finally {
      setIsScraping(false);
      setScrapingSourceId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sources de mentions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez vos sources de veille web
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-fit">
                <Plus className="w-4 h-4" />
                Ajouter une source
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle source</DialogTitle>
                <DialogDescription>
                  Créez une source de veille pour surveiller votre e-réputation
                </DialogDescription>
              </DialogHeader>

              {contextBrands.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">Aucune marque trouvée</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Créez d'abord une marque avant d'ajouter une source.
                  </p>
                  <Button onClick={() => navigate('/brands')}>
                    Créer une marque
                  </Button>
                </div>
              ) : (
                <SourceForm
                  brandId={contextBrands[0].id}
                  onSuccess={handleSourceCreated}
                  onCancel={() => setIsDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Scraping Loader */}
        {isScraping && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg shadow-lg border max-w-sm w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <h3 className="text-lg font-semibold">Analyse en cours...</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Nous analysons les mentions publiques de votre marque. Cette opération peut prendre quelques minutes.
              </p>
            </div>
          </div>
        )}

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {loading ? (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Chargement des sources...
            </div>
          ) : sources.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground mb-4">Aucune source créée</p>
              <p className="text-sm text-muted-foreground mb-6">
                Cliquez sur "Ajouter une source" pour commencer à surveiller vos mentions.
              </p>
            </div>
          ) : (
            sources.map((source) => (
              <SourceCard
                key={source.id}
                source={source}
                onDelete={() => handleDeleteSource(source.id)}
                onScrapeNow={() => handleScrapeSource(source.id)}
                isDeleting={deletingSourceId === source.id}
                isScraping={scrapingSourceId === source.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
