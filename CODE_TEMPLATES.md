# 🛠️ CODE TEMPLATES - PAGES À CORRIGER

Ce document fournit les templates de code pour corriger les pages **Reports** et **Sources**.  
Suivez le pattern appliqué pour **Actions**, **Analysis**, et **Alerts**.

---

## 📋 REPORTS PAGE - TEMPLATE

**Fichier:** `apps/web/src/pages/Reports/Reports.tsx`

### Imports à ajouter
```tsx
import { useCallback } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { isApiError } from "@/types/http";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
```

### Types à ajouter
```tsx
interface Report {
  id: string;
  title: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  brandId: string;
  format?: 'pdf' | 'json';
  mentionCount?: number;
  sentiment?: number;
}

interface AnalysisState {
  reports: Report[];
  loading: boolean;
  error: string | null;
}
```

### Hook principal
```tsx
export default function ReportsPage() {
  const { selectedBrand } = useBrand();
  const [state, setState] = useState<AnalysisState>({
    reports: [],
    loading: true,
    error: null
  });

  // 📡 Récupérer les rapports
  const fetchReports = useCallback(async () => {
    if (!selectedBrand) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // ✅ CORRECTED: Vérifier isApiError
      const response = await apiClient.getReports({
        brandId: selectedBrand.id
      });

      if (isApiError(response)) {
        setState(prev => ({
          ...prev,
          error: response.error?.message || 'Erreur de chargement',
          reports: []
        }));
        return;
      }

      // ✅ CORRECTED: Typage approprié, pas de as any
      const reportsData = (response.data as Report[]) || [];
      setState(prev => ({
        ...prev,
        reports: Array.isArray(reportsData) ? reportsData : [],
        error: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
        reports: []
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [selectedBrand]);

  // 📅 Générer un nouveau rapport
  const handleGenerateReport = async (selection: ReportFormSelection) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.post<Report>('/reports/generate', {
        brandId: selection.brandId,
        type: selection.type,
        format: selection.format,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });

      if (isApiError(response)) {
        setState(prev => ({
          ...prev,
          error: response.error?.message || 'Erreur de génération'
        }));
        return;
      }

      // Ajouter à la liste
      const newReport = response.data as Report;
      setState(prev => ({
        ...prev,
        reports: [newReport, ...prev.reports]
      }));

      toast.success('Rapport généré avec succès');
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erreur'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // Charger au montage et à chaque changement de brand
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useBrandListener(async () => {
    await fetchReports();
  });

  // Rendu
  if (state.loading && !state.error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  if (state.error && !selectedBrand) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div className="text-center">
            <p className="font-semibold text-foreground">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mt-1">{state.error}</p>
            <Button onClick={fetchReports} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Erreur */}
        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Rapports</h1>
            <p className="text-sm text-muted-foreground mt-1">Gérez vos rapports de réputation</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchReports}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Générer un rapport
            </button>
          </div>
        </div>

        {/* Rapports */}
        {state.reports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-foreground">Aucun rapport</p>
            <p className="text-sm text-muted-foreground">Générez un rapport pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.reports.map(report => (
              <ReportCard key={report.id} {...report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 📁 SOURCES PAGE - TEMPLATE

**Fichier:** `apps/web/src/pages/Sources/Sources.tsx`

### Imports à ajouter
```tsx
import { useCallback } from "react";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { isApiError } from "@/types/http";
import { Loader2, AlertCircle, RefreshCw, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
```

### Types à ajouter
```tsx
interface Source {
  id: string;
  name: string;
  type: 'TWITTER' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'GOOGLE' | 'OTHER';
  url?: string;
  status: 'active' | 'paused' | 'failed';
  lastScraped?: string;
  mentionCount?: number;
  brandId: string;
}

interface SourcesState {
  sources: Source[];
  loading: boolean;
  error: string | null;
  scraping: string | null; // ID de la source en cours de scraping
}
```

### Hook principal
```tsx
export default function SourcesPage() {
  const { selectedBrand } = useBrand();
  const [state, setState] = useState<SourcesState>({
    sources: [],
    loading: true,
    error: null,
    scraping: null
  });

  // 📡 Récupérer les sources
  const fetchSources = useCallback(async () => {
    if (!selectedBrand) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await apiClient.get<Source[]>('/sources', {
        brandId: selectedBrand.id
      });

      // ✅ CORRECTED: Vérifier isApiError systématiquement
      if (isApiError(response)) {
        setState(prev => ({
          ...prev,
          error: response.error?.message || 'Erreur de chargement',
          sources: []
        }));
        return;
      }

      // ✅ CORRECTED: Pas de double-check .data, standardiser
      const sourcesData = (response.data as Source[]) || [];
      setState(prev => ({
        ...prev,
        sources: Array.isArray(sourcesData) ? sourcesData : [],
        error: null
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
        sources: []
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [selectedBrand]);

  // 🔄 Forcer le scraping d'une source
  const handleScrapeNow = async (sourceId: string) => {
    try {
      setState(prev => ({ ...prev, scraping: sourceId }));

      await apiClient.post(`/sources/${sourceId}/scrape-now`);

      // Recharger les sources
      await fetchSources();

      toast.success('Scraping lancé');
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erreur de scraping'
      }));
    } finally {
      setState(prev => ({ ...prev, scraping: null }));
    }
  };

  // 🗑️ Supprimer une source
  const handleDeleteSource = async (sourceId: string) => {
    if (!confirm('Êtes-vous sûr ?')) return;

    try {
      const sourceToDelete = state.sources.find(s => s.id === sourceId);
      
      // Optimistic update
      setState(prev => ({
        ...prev,
        sources: prev.sources.filter(s => s.id !== sourceId)
      }));

      await apiClient.delete(`/sources/${sourceId}`);

      toast.success('Source supprimée');
    } catch (err) {
      // Restore on error
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erreur de suppression'
      }));
      
      // Recharger
      await fetchSources();
    }
  };

  // Charger au montage
  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  useBrandListener(async () => {
    await fetchSources();
  });

  // Rendu
  if (state.loading && !state.error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Chargement des sources...</p>
        </div>
      </div>
    );
  }

  if (state.error && !selectedBrand) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full min-h-[500px]">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
          <div className="text-center">
            <p className="font-semibold text-foreground">Erreur de chargement</p>
            <p className="text-sm text-muted-foreground mt-1">{state.error}</p>
            <Button onClick={fetchSources} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Erreur */}
        {state.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sources</h1>
            <p className="text-sm text-muted-foreground mt-1">Gérez vos sources de mentions</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchSources}
              className="p-2 hover:bg-muted rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${state.loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
              <Plus className="w-4 h-4" />
              Ajouter une source
            </button>
          </div>
        </div>

        {/* Sources */}
        {state.sources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-semibold text-foreground">Aucune source configurée</p>
            <p className="text-sm text-muted-foreground">Ajoutez une source pour commencer</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.sources.map(source => (
              <SourceCard
                key={source.id}
                {...source}
                onScrapeNow={() => handleScrapeNow(source.id)}
                onDelete={() => handleDeleteSource(source.id)}
                isScraing={state.scraping === source.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Reports
- [ ] Importer les dépendances
- [ ] Ajouter les types (Report, AnalysisState)
- [ ] Remplacer le hook fetchReports
- [ ] Ajouter handleGenerateReport
- [ ] Ajouter useEffect + useBrandListener
- [ ] Remplacer le rendu
- [ ] Tester avec GUIDE_TEST.md

### Sources
- [ ] Importer les dépendances
- [ ] Ajouter les types (Source, SourcesState)
- [ ] Remplacer le hook fetchSources
- [ ] Ajouter handleScrapeNow
- [ ] Ajouter handleDeleteSource
- [ ] Ajouter useEffect + useBrandListener
- [ ] Remplacer le rendu
- [ ] Tester avec GUIDE_TEST.md

---

## 🧪 TESTS RAPIDES

Une fois implémentés, testez avec:

```bash
# Terminal 1: Backend
cd api && npm run dev

# Terminal 2: Frontend
cd apps/web && npm run dev

# Terminal 3: Tests dans le navigateur
# Ouvrir http://localhost:3000
# Naviguer vers /reports et /sources
# Vérifier les appels API dans DevTools > Network
```

---

**Fin des templates. Suivez le pattern, testez, et vous êtes bon!** ✅

