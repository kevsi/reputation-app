import { useState, useEffect } from "react";
import { Search, Loader2, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface DemoMention {
  id: string;
  content: string;
  author: string;
  sentiment: string;
  platform: string;
  publishedAt: string;
  detectedKeywords?: string[];
  brand?: { name: string };
  source?: { name: string };
  externalId?: string;
  url?: string;
}

export default function DemoMentionsPage() {
  const [mentions, setMentions] = useState<DemoMention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMentions = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/demo/mentions");
        if (!response.ok) throw new Error("Erreur API");
        const data = await response.json();
        setMentions(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    };

    fetchMentions();
  }, []);

  const filteredMentions = mentions.filter(m =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sentimentCounts = {
    POSITIVE: mentions.filter(m => m.sentiment === "POSITIVE").length,
    NEGATIVE: mentions.filter(m => m.sentiment === "NEGATIVE").length,
    NEUTRAL: mentions.filter(m => m.sentiment === "NEUTRAL").length,
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return "bg-green-100 text-green-800 border-green-300";
      case "NEGATIVE":
        return "bg-red-100 text-red-800 border-red-300";
      case "NEUTRAL":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    const labels: Record<string, string> = {
      POSITIVE: "Positif",
      NEGATIVE: "Négatif",
      NEUTRAL: "Neutre",
    };
    return labels[sentiment] || sentiment;
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      TWITTER: "𝕏",
      FACEBOOK: "f",
      INSTAGRAM: "📷",
      LINKEDIN: "in",
      YOUTUBE: "▶",
      REDDIT: "🔴",
    };
    return icons[platform] || "📱";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Mentions Trump
          </h1>
          <p className="text-slate-600">
            Affichage public des mentions détectées
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="text-2xl font-bold text-slate-900">
              {mentions.length}
            </div>
            <div className="text-sm text-slate-600">Total</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {sentimentCounts.POSITIVE}
            </div>
            <div className="text-sm text-green-600">Positifs</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {sentimentCounts.NEGATIVE}
            </div>
            <div className="text-sm text-red-600">Négatifs</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une mention..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-blue-600 mr-2" />
            <span className="text-slate-600">Chargement des mentions...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-300 rounded-lg p-6 text-center">
            <p className="text-red-800 font-medium">Erreur</p>
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredMentions.length === 0 ? (
          <div className="bg-slate-100 rounded-lg p-8 text-center">
            <p className="text-slate-600">Aucune mention trouvée</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMentions.map((mention) => (
              <div
                key={mention.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-700">
                      {mention.author.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {mention.author}
                      </div>
                      <div className="text-sm text-slate-500">
                        {formatDistanceToNow(new Date(mention.publishedAt), {
                          locale: fr,
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(
                      mention.sentiment
                    )}`}
                  >
                    {getSentimentLabel(mention.sentiment)}
                  </span>
                </div>

                {/* Content */}
                <p className="text-slate-800 mb-4 leading-relaxed">
                  {mention.content}
                </p>

                {/* Keywords */}
                {mention.detectedKeywords && mention.detectedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mention.detectedKeywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getPlatformIcon(mention.platform)}</span>
                    <span className="text-sm text-slate-600">{mention.platform}</span>
                    {mention.source && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-600">
                          {mention.source.name}
                        </span>
                      </>
                    )}
                  </div>
                  {mention.url && (
                    <a
                      href={mention.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
