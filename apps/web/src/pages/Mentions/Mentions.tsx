import { useState } from "react";
import { MentionCard } from "@/components/mentions/MentionCard";
import { Search, Filter, Download } from "lucide-react";

const mentionsData = [
  {
    id: "1",
    author: "@jean_dupont",
    avatar: "JD",
    timestamp: "Il y a 2 minutes",
    content: "Excellente expérience avec @ByeWind ! Le service client est vraiment top et la livraison ultra rapide. Je recommande vivement ce produit !",
    platform: "Twitter",
    sentiment: { type: "Positive" as const, score: "92%" },
    tags: ["#service-client", "#livraison"],
    actions: { treated: true }
  },
  {
    id: "2",
    author: "@marie_martin",
    avatar: "MM",
    timestamp: "Il y a 15 minutes",
    content: "Déçue par la qualité du produit @ByeWind. Ne correspond pas du tout à la description. Service client peu réactif.",
    platform: "Twitter",
    sentiment: { type: "Negative" as const, score: "15%" },
    tags: ["#qualité", "#service-client"],
    actions: { alert: true, monitored: true }
  },
  {
    id: "3",
    author: "@tech_reviewer",
    avatar: "TR",
    timestamp: "Il y a 1 heure",
    content: "Test complet de @ByeWind sur mon blog. Produit intéressant avec quelques points à améliorer. Bon rapport qualité/prix dans l'ensemble.",
    platform: "Instagram",
    sentiment: { type: "Positive" as const, score: "75%" },
    tags: ["#review", "#tech"],
    actions: {}
  },
  {
    id: "4",
    author: "@lifestyle_blog",
    avatar: "LB",
    timestamp: "Il y a 2 heures",
    content: "Découverte du jour : @ByeWind ! Un concept innovant qui change la donne. Hâte de tester plus en profondeur.",
    platform: "Instagram",
    sentiment: { type: "Positive" as const, score: "88%" },
    tags: ["#innovation", "#découverte"],
    actions: { treated: true }
  }
];

const filters = [
  { label: "Tous", value: "all", count: 127 },
  { label: "Nouveaux", value: "new", count: 45 },
  { label: "Positif", value: "positive", count: 98 },
  { label: "Négatif", value: "negative", count: 12 },
  { label: "Surveillés", value: "monitored", count: 8 },
  { label: "Traités", value: "treated", count: 64 }
];

export default function MentionsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Mentions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Toutes les mentions de votre marque sur les réseaux sociaux
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
                <Filter className="w-4 h-4" />
                Filtres avancés
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Download className="w-4 h-4" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher une mention..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveFilter(filter.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeFilter === filter.value
                    ? "bg-foreground text-background"
                    : "bg-card text-foreground border border-border hover:bg-muted"
                }`}
              >
                {filter.label}
                {filter.count !== undefined && (
                  <span className="ml-2 opacity-60">({filter.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Total aujourd'hui</div>
            <div className="text-3xl font-bold text-foreground">127</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Mentions positives</div>
            <div className="text-3xl font-bold text-foreground">98</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Mentions négatives</div>
            <div className="text-3xl font-bold text-foreground">12</div>
          </div>
        </div>

        {/* Mentions List */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Mentions récentes
          </h2>
          <div className="space-y-4">
            {mentionsData.map((mention) => (
              <MentionCard key={mention.id} {...mention} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}