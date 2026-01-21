import { useState, useEffect } from "react";
import { MentionCard } from "@/components/mentions/MentionCard";
import { Search, Filter, Download, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const filters = [
  { label: "Tous", value: "all", count: undefined },
  { label: "Nouveaux", value: "new", count: undefined },
  { label: "Positif", value: "positive", count: undefined },
  { label: "Négatif", value: "negative", count: undefined },
  { label: "Surveillés", value: "monitored", count: undefined },
  { label: "Traités", value: "treated", count: undefined }
];

export default function MentionsPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mentions, setMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build query params based on filters
        const params: any = {};
        if (activeFilter === "positive") params.sentiment = "Positive";
        if (activeFilter === "negative") params.sentiment = "Negative";
        // 'new', 'monitored', 'treated' would require backend support or client-side filtering

        const response: any = await apiClient.getMentions(params); // Adjust if getMentions returns { data: [] } or just []
        const data = Array.isArray(response) ? response : (response.data || []);
        setMentions(data);
      } catch (err) {
        console.error("Failed to fetch mentions", err);
        setError("Impossible de charger les mentions.");
      } finally {
        setLoading(false);
      }
    };

    fetchMentions();
  }, [activeFilter, user]);

  // Client-side mapping
  const mappedMentions = mentions.map((mention: any) => ({
    id: mention.id,
    author: mention.author || "Unknown",
    avatar: (mention.author || "U").substring(0, 2).toUpperCase(),
    timestamp: mention.createdAt ? formatDistanceToNow(new Date(mention.createdAt), { addSuffix: true, locale: fr }) : "",
    content: mention.content,
    platform: mention.source || "Web",
    sentiment: {
      type: mention.sentiment || "Neutral",
      score: mention.sentimentScore ? `${Math.round(mention.sentimentScore * 100)}%` : "N/A"
    },
    tags: [], // Add tags if available in API
    actions: {
      treated: mention.status === 'TREATED',
      // map other statuses
    }
  }));

  // Client-side filtering for demonstration if fields are missing in backend filter
  const displayedMentions = mappedMentions.filter((m: any) => {
    if (searchQuery && !m.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter.value
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

        {/* Stats Cards - Placeholder for now, could fetch stats separately */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Total affiché</div>
            <div className="text-3xl font-bold text-foreground">{displayedMentions.length}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Mentions positives</div>
            <div className="text-3xl font-bold text-foreground">
              {displayedMentions.filter((m: any) => m.sentiment.type === 'Positive').length}
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Mentions négatives</div>
            <div className="text-3xl font-bold text-foreground">
              {displayedMentions.filter((m: any) => m.sentiment.type === 'Negative').length}
            </div>
          </div>
        </div>

        {/* Mentions List */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Mentions récentes
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          ) : displayedMentions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune mention trouvée.
            </div>
          ) : (
            <div className="space-y-4">
              {displayedMentions.map((mention: any) => (
                <MentionCard key={mention.id} {...mention} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
