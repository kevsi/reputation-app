import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MentionCard } from "@/components/mentions/MentionCard";
import { Search, Filter, Download, Loader2, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { usePlan } from "@/hooks/usePlan";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MentionDetail } from "@/types/api";
import { isApiError } from "@/types/http";
import { ApiErrorHandler } from "@/lib/api-error-handler";

// Types
interface MappedMention {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  platform: string;
  url?: string;
  sentiment: {
    type: string;
    score: string;
  };
  tags: string[];
  actions: {
    treated?: boolean;
    ignored?: boolean;
    monitored?: boolean;
    alert?: boolean;
  };
}

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface MentionStats {
  total: number;
  positive: number;
  negative: number;
}

const filters: FilterOption[] = [
  { label: "Tous", value: "all" },
  { label: "Nouveaux", value: "new" },
  { label: "Positif", value: "positive" },
  { label: "Négatif", value: "negative" },
  { label: "Surveillés", value: "monitored" },
  { label: "Traités", value: "treated" }
];

export default function MentionsPage() {
  const { user } = useAuth();
  const { brandId: urlBrandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const { brands, selectedBrand, setSelectedBrand } = useBrand();
  const { plan, hasFeature } = usePlan();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mentions, setMentions] = useState<MappedMention[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronisation entre URL et Context
  useEffect(() => {
    if (urlBrandId && brands.length > 0) {
      const brandFromUrl = brands.find(b => b.id === urlBrandId);
      if (brandFromUrl && (!selectedBrand || selectedBrand.id !== urlBrandId)) {
        setSelectedBrand(brandFromUrl);
      } else if (!brandFromUrl && selectedBrand) {
        // Si le brand de l'URL est invalide, on remet le bon URL basé sur le context
        navigate(`/mentions/${selectedBrand.id}`, { replace: true });
      }
    }
  }, [urlBrandId, brands, selectedBrand, setSelectedBrand, navigate]);

  // Safe data transformation
  const transformMention = useCallback((mention: MentionDetail): MappedMention => {
    const platformMap: Record<string, string> = {
      TWITTER: 'Twitter',
      FACEBOOK: 'Facebook',
      INSTAGRAM: 'Instagram',
      LINKEDIN: 'LinkedIn',
      GOOGLE_REVIEWS: 'Google Reviews',
      TRUSTPILOT: 'Trustpilot',
      TRIPADVISOR: 'TripAdvisor',
      YOUTUBE: 'YouTube',
      REDDIT: 'Reddit'
    };

    const sentimentMap: Record<string, string> = {
      POSITIVE: 'Positive',
      NEGATIVE: 'Negative',
      NEUTRAL: 'Neutral',
      MIXED: 'Mixed'
    };

    let score: string = '0%';
    if (typeof mention.sentimentScore === 'number') {
      score = Math.round(Math.max(0, Math.min(mention.sentimentScore, 1)) * 100) + '%';
    } else if (typeof mention.sentimentScore === 'string') {
      score = mention.sentimentScore.includes('%') ? mention.sentimentScore : mention.sentimentScore + '%';
    }

    const tags: string[] = Array.isArray(mention.detectedKeywords) ? mention.detectedKeywords : [];
    const authorName = typeof mention.author === 'string' && mention.author.length > 0 ? mention.author : 'Anonyme';

    return {
      id: mention.id ?? '',
      author: authorName,
      avatar: (authorName?.[0]?.toUpperCase() || 'A').substring(0, 2).toUpperCase(),
      timestamp: mention.publishedAt ? formatDistanceToNow(new Date(mention.publishedAt), { locale: fr, addSuffix: true }) : 'Date inconnue',
      content: mention.content ?? '',
      platform: platformMap[mention.source?.type ?? ''] ?? 'Autres',
      url: mention.url,
      sentiment: { type: sentimentMap[mention.sentiment] ?? 'Neutre', score },
      tags,
      actions: {
        treated: mention.status === 'TREATED',
        ignored: mention.status === 'IGNORED',
        monitored: mention.status === 'MONITORED',
        alert: false
      }
    };
  }, []);

  // Fonction pour charger les mentions
  const fetchMentions = useCallback(async () => {
    const effectiveBrandId = urlBrandId || selectedBrand?.id;

    if (!effectiveBrandId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        brandId: effectiveBrandId
      };
      if (activeFilter === "positive") params.sentiment = "POSITIVE";
      if (activeFilter === "negative") params.sentiment = "NEGATIVE";

      const response = await apiClient.getMentions(params);

      if (isApiError(response)) {
        const userMsg = ApiErrorHandler.getUserMessage(response.error);
        setError(`${userMsg} (${response.error.code})`);
        setMentions([]);
        return;
      }

      let rawData: MentionDetail[] = [];
      const data: any = response.data;
      if (Array.isArray(data)) {
        rawData = data;
      } else if (data && Array.isArray(data.mentions)) {
        rawData = data.mentions;
      } else if (data && Array.isArray(data.items)) {
        rawData = data.items;
      }
      const mappedData: MappedMention[] = rawData.map(transformMention);
      setMentions(mappedData);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Impossible de charger les mentions';
      setError(errorMsg);
      console.error('Mentions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [urlBrandId, selectedBrand?.id, activeFilter, transformMention]);

  useEffect(() => {
    fetchMentions();
  }, [fetchMentions]);

  useBrandListener(async () => {
    if (selectedBrand && selectedBrand.id !== urlBrandId) {
      navigate(`/mentions/${selectedBrand.id}`);
    } else {
      await fetchMentions();
    }
  });

  // Client-side filtering and search
  const displayedMentions = useMemo(() => {
    let filtered = mentions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(mention =>
        mention.content.toLowerCase().includes(query) ||
        mention.author.toLowerCase().includes(query) ||
        mention.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (activeFilter === "new") {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filtered = filtered.filter(mention => {
        try {
          return new Date(mention.timestamp) > oneDayAgo;
        } catch {
          return false;
        }
      });
    } else if (activeFilter === "monitored") {
      filtered = filtered.filter(mention => mention.actions.monitored);
    } else if (activeFilter === "treated") {
      filtered = filtered.filter(mention => mention.actions.treated);
    }

    return filtered;
  }, [mentions, searchQuery, activeFilter]);

  // Calculate stats
  const stats: MentionStats = useMemo(() => {
    const total = displayedMentions.length;
    const positive = displayedMentions.filter(m => m.sentiment.type === 'Positive').length;
    const negative = displayedMentions.filter(m => m.sentiment.type === 'Negative').length;
    return { total, positive, negative };
  }, [displayedMentions]);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Mentions - {user?.organization?.name || 'Votre organisation'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Toutes les mentions de votre marque sur les réseaux sociaux • Plan {plan}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
                <Filter className="w-4 h-4" />
                Filtres avancés
              </button>
              {hasFeature('basic_reports') && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              )}
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Total affiché</div>
            <div className="text-3xl font-bold text-foreground">{stats.total}</div>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Mentions positives</div>
            <div className="text-3xl font-bold text-foreground">{stats.positive}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Mentions négatives</div>
            <div className="text-3xl font-bold text-foreground">{stats.negative}</div>
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
            <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-sm text-red-800 dark:text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => fetchMentions()}
                  className="mt-2 text-sm underline hover:no-underline"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : displayedMentions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Aucune mention trouvée.
            </div>
          ) : (
            <div className="space-y-4">
              {displayedMentions.map((mention) => (
                <MentionCard key={mention.id} {...mention} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
