import { useState, useEffect, useCallback } from "react";
import { PeriodSelector } from "@/components/analysis/PeriodSelector";
import { AIInsights } from "@/components/analysis/AIInsights";
import { SentimentAnalysis } from "@/components/analysis/SentimentAnalysis";
import { analyticsService } from "@/services/analytics.service";
import {
  Filter, BarChart3, Save, Download, TrendingUp,
  AlertTriangle, Lightbulb, Loader2, AlertCircle, RefreshCw
} from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { isApiError } from "@/types/http";
import { ApiErrorHandler } from "@/lib/api-error-handler";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AnalysisPage() {
  const { selectedBrand } = useBrand();
  const { hasFeature } = usePlan();

  // State
  const [selectedPeriod, setSelectedPeriod] = useState("30j");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    sentiment: null,
    sentimentChart: [],
    insights: []
  });

  const getDateRange = useCallback(() => {
    const end = new Date();
    const start = new Date();
    if (selectedPeriod === '7j') start.setDate(end.getDate() - 7);
    else if (selectedPeriod === '30j') start.setDate(end.getDate() - 30);
    else if (selectedPeriod === '90j') start.setDate(end.getDate() - 90);
    else if (selectedPeriod === '1y') start.setFullYear(end.getFullYear() - 1);

    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [selectedPeriod]);

  const fetchAnalysis = useCallback(async () => {
    if (!selectedBrand || !hasFeature('analysis')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { startDate, endDate } = getDateRange();
      const response = await analyticsService.getSentimentBreakdown(selectedBrand.id, startDate, endDate);

      if (!isApiError(response)) {
        const s = response.data;
        const total = s.positive + s.negative + s.neutral + s.mixed;
        const pc = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;

        const sentimentChart = [
          { label: "Positif", percentage: pc(s.positive), color: "#22c55e" },
          { label: "Neutre", percentage: pc(s.neutral + s.mixed), color: "#94a3b8" },
          { label: "Négatif", percentage: pc(s.negative), color: "#ef4444" }
        ];

        const insights = [
          {
            type: s.positive > total * 0.5 ? "positive" : s.negative > total * 0.3 ? "warning" : "neutral",
            title: s.positive > total * 0.5 ? "Excellente réputation" : s.negative > total * 0.3 ? "Risque réputationnel" : "Stabilité",
            description: s.positive > total * 0.5
              ? "Votre marque bénéficie d'une forte adhésion positive ce mois-ci."
              : s.negative > total * 0.3
                ? "Plusieurs mentions négatives nécessitent votre attention immédiate."
                : "Le sentiment global reste équilibré sans pic inhabituel.",
            icon: s.positive > total * 0.5 ? TrendingUp : s.negative > total * 0.3 ? AlertTriangle : Lightbulb
          }
        ];

        setData({ sentiment: s, sentimentChart, insights });
      } else {
        setError(ApiErrorHandler.getUserMessage(response.error));
      }
    } catch (err) {
      setError("Impossible d'analyser les données");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand, hasFeature, getDateRange]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  useBrandListener(async () => {
    await fetchAnalysis();
  });

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Analyse</h1>
            <p className="text-muted-foreground mt-1">Intelligence artificielle et tendances de sentiment</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchAnalysis} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Actualiser
            </Button>
            <Button size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Exporter le rapport
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <PeriodSelector onPeriodChange={setSelectedPeriod} />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!hasFeature('analysis') ? (
          <div className="py-20 text-center bg-card border border-border rounded-3xl">
            <BarChart3 className="w-16 h-16 text-primary/20 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-3">Analyse Premium</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Passez au plan Professionnel pour débloquer l'analyse de sentiment IA, les tendances et les rapports personnalisés.
            </p>
            <Button size="lg" className="rounded-full px-8">Mettre à niveau</Button>
          </div>
        ) : loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground animate-pulse">Calcul des insights en cours...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.insights.length > 0 && <AIInsights insights={data.insights} />}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <SentimentAnalysis
                data={data.sentimentChart}
                totalPositive={data.sentiment?.positive || 0}
              />
              <Card className="flex flex-col justify-center items-center p-8 border-dashed">
                <TrendingUp className="w-12 h-12 text-muted-foreground opacity-10 mb-4" />
                <p className="text-muted-foreground text-sm">Données temporelles en cours de consolidation...</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 bg-card border border-border rounded-2xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" /> Mots-clés émergents
                </h3>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Analyse des hashtags et mots-clés les plus fréquents.</p>
                  <div className="h-40 flex items-center justify-center border border-border border-dashed rounded-xl grayscale opacity-50">
                    Bientôt disponible
                  </div>
                </div>
              </div>
              <div className="p-6 bg-card border border-border rounded-2xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Save className="w-4 h-4 text-primary" /> Sources de trafic
                </h3>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Distribution géographique et par plateforme.</p>
                  <div className="h-40 flex items-center justify-center border border-border border-dashed rounded-xl grayscale opacity-50">
                    Bientôt disponible
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers
function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`bg-card border border-border rounded-2xl ${className}`}>{children}</div>;
}