import { useState } from "react";
import { PeriodSelector } from "@/components/analysis/PeriodSelector";
import { AIInsights } from "@/components/analysis/AIInsights";
import { SentimentAnalysis } from "@/components/analysis/SentimentAnalysis";
import { SentimentTimeline } from "@/components/analysis/SentimentTimeline";
import { TrendingKeywords } from "@/components/analysis/TrendingKeywords";
import { ActiveInfluencers } from "@/components/analysis/ActiveInfluencers";
import { SourcesBreakdown } from "@/components/analysis/SourcesBreakdown";
import { Filter, BarChart3, Save, Download, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";

// Data
const aiInsightsData = [
  {
    type: "positive" as const,
    title: "Tendance positive",
    description: "Le sentiment a augmenté de 12% cette semaine, principalement grâce aux mentions de #qualité",
    icon: TrendingUp
  },
  {
    type: "warning" as const,
    title: "Attention requise",
    description: "Pic de mentions négatives détecté hier concernant le service client",
    icon: AlertTriangle
  },
  {
    type: "neutral" as const,
    title: "Opportunité",
    description: "Le hashtag #innovation gagne en popularité, considérez une campagne ciblée",
    icon: Lightbulb
  }
];

const sentimentData = [
  { label: "Très positif", percentage: 35, color: "#22c55e" },
  { label: "Positif", percentage: 28, color: "#86efac" },
  { label: "Neutre", percentage: 22, color: "#94a3b8" },
  { label: "Négatif", percentage: 10, color: "#fca5a5" },
  { label: "Très négatif", percentage: 5, color: "#ef4444" }
];

const timelineData = [
  { date: "Lun", positive: 45, neutral: 30, negative: 15 },
  { date: "Mar", positive: 52, neutral: 28, negative: 12 },
  { date: "Mer", positive: 48, neutral: 32, negative: 18 },
  { date: "Jeu", positive: 60, neutral: 25, negative: 10 },
  { date: "Ven", positive: 55, neutral: 30, negative: 12 },
  { date: "Sam", positive: 50, neutral: 28, negative: 15 },
  { date: "Dim", positive: 58, neutral: 27, negative: 11 }
];

const keywordsData = [
  { tag: "#qualité", mentions: 456, trend: "up" as const },
  { tag: "#service", mentions: 389, trend: "up" as const },
  { tag: "#innovation", mentions: 312, trend: "up" as const },
  { tag: "#prix", mentions: 287, trend: "down" as const },
  { tag: "#design", mentions: 245, trend: "up" as const }
];

const influencersData = [
  { username: "@tech_reviewer", mentions: 24, followers: "125K", sentiment: "Positif" as const },
  { username: "@lifestyle_blog", mentions: 18, followers: "98K", sentiment: "Positif" as const },
  { username: "@consumer_watch", mentions: 15, followers: "76K", sentiment: "Neutre" as const },
  { username: "@digital_trends", mentions: 12, followers: "89K", sentiment: "Positif" as const }
];

const sourcesData = [
  { name: "Twitter/X", icon: "❌", mentions: 2845, percentage: 32, trend: "+12%", sentiment: 68, color: "#000000" },
  { name: "Instagram", icon: "📷", mentions: 2156, percentage: 24, trend: "+8%", sentiment: 75, color: "#E4405F" },
  { name: "Facebook", icon: "📘", mentions: 1823, percentage: 20, trend: "-3%", sentiment: 62, color: "#1877F2" },
  { name: "Reddit", icon: "🔴", mentions: 1245, percentage: 14, trend: "+15%", sentiment: 58, color: "#FF4500" },
  { name: "LinkedIn", icon: "💼", mentions: 892, percentage: 10, trend: "+5%", sentiment: 71, color: "#0A66C2" }
];

export default function AnalysisPage() {
  const [_selectedPeriod, setSelectedPeriod] = useState("30j");
  const { hasFeature } = usePlan();

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            Analyse approfondie de votre présence en ligne
          </p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <PeriodSelector onPeriodChange={setSelectedPeriod} />
        </div>

        {/* Action Buttons */}
        {hasFeature('analysis') && (
          <div className="flex flex-wrap gap-3 mb-6">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
              <Filter className="w-4 h-4" />
              Filtres avancés
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
              <BarChart3 className="w-4 h-4" />
              Comparer
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
              <Save className="w-4 h-4" />
              Sauvegarder vue
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        )}

        {/* Content */}
        {hasFeature('analysis') ? (
          <div className="space-y-6">
            {/* AI Insights */}
            <AIInsights insights={aiInsightsData} />

            {/* Sentiment Analysis + Timeline */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SentimentAnalysis data={sentimentData} totalPositive={78} />
              <SentimentTimeline data={timelineData} evolution="+12.5%" isPositive={true} />
            </div>

            {/* Keywords + Influencers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendingKeywords keywords={keywordsData} />
              <ActiveInfluencers influencers={influencersData} />
            </div>

            {/* Sources Breakdown */}
            <SourcesBreakdown sources={sourcesData} />
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Analyse avancée non disponible
            </h3>
            <p className="text-muted-foreground mb-4">
              Mettez à niveau votre plan pour accéder aux analyses approfondies et aux insights IA.
            </p>
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Mettre à niveau
            </button>
          </div>
        )}
      </div>
    </div>
  );
}