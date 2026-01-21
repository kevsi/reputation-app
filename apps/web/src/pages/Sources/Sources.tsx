import { useEffect, useState } from "react";
import { SourceCard } from "@/components/sources/SourceCard";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

const iconByType: Record<string, string> = {
  TWITTER: "❌",
  FACEBOOK: "📘",
  INSTAGRAM: "📷",
  LINKEDIN: "💼",
  REDDIT: "🔴",
  TRUSTPILOT: "⭐",
  GOOGLE_REVIEWS: "🟦",
  YOUTUBE: "▶️",
  NEWS: "📰",
  BLOG: "✍️",
  RSS: "📡",
  OTHER: "🌐"
};

export default function SourcesPage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSources = async () => {
      setLoading(true);
      try {
        const response: any = await apiClient.getSources();
        const data = Array.isArray(response) ? response : (response.data || []);
        setSources(data);
      } catch (e) {
        console.error("Failed to fetch sources", e);
        setSources([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchSources();
  }, [user]);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Sources</h1>
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground">
              <option>Today</option>
              <option>This week</option>
              <option>This month</option>
              <option>This year</option>
            </select>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
              Ajouter une source
            </button>
          </div>
        </div>

        {/* Sources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {loading ? (
            <div className="text-muted-foreground">Chargement...</div>
          ) : (
            sources.map((source) => (
              <SourceCard
                key={source.id}
                name={source.name}
                icon={iconByType[source.type] || "🌐"}
                mentions={0}
                mentionsTrend={"0%"}
                engagements={0}
                engagementsTrend={"0%"}
                sentiments={0}
                sentimentsTrend={"0%"}
                isActive={!!source.isActive}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}