import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Trash2, RotateCw, AlertCircle, ExternalLink } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import type { Source, SourceType } from '@/types/models';
import { OPEN_WEB_SOURCES } from './SourceTypeSelector';

interface SourceCardProps {
  source: Source;
  onDelete?: () => void;
  onScrapeNow?: () => void;
  isDeleting?: boolean;
  isScraping?: boolean;
}

const SOURCE_ICONS: Record<SourceType, string> = {
  FORUM: '💬',
  BLOG: '✍️',
  NEWS: '📰',
  REVIEW: '⭐',
  REDDIT: '🔴',
  RSS: '📡',
  OTHER: '🌐',
  // Legacy/disabled
  TWITTER: '𝕏',
  FACEBOOK: '📘',
  INSTAGRAM: '📷',
  LINKEDIN: '💼',
  TRUSTPILOT: '⭐',
  GOOGLE_REVIEWS: '🟦',
  YOUTUBE: '▶️',
};

const SOURCE_COLORS: Record<SourceType, string> = {
  FORUM: 'bg-blue-50 border-blue-200',
  BLOG: 'bg-purple-50 border-purple-200',
  NEWS: 'bg-yellow-50 border-yellow-200',
  REVIEW: 'bg-green-50 border-green-200',
  REDDIT: 'bg-orange-50 border-orange-200',
  RSS: 'bg-red-50 border-red-200',
  OTHER: 'bg-gray-50 border-gray-200',
  // Legacy
  TWITTER: 'bg-blue-50 border-blue-200',
  FACEBOOK: 'bg-blue-100 border-blue-300',
  INSTAGRAM: 'bg-pink-50 border-pink-200',
  LINKEDIN: 'bg-blue-50 border-blue-200',
  TRUSTPILOT: 'bg-green-50 border-green-200',
  GOOGLE_REVIEWS: 'bg-blue-50 border-blue-200',
  YOUTUBE: 'bg-red-50 border-red-200',
};

function getSourceLabel(type: SourceType): string {
  const source = OPEN_WEB_SOURCES.find(s => s.type === type);
  return source?.label || type;
}

export function SourceCard({
  source,
  onDelete,
  onScrapeNow,
  isDeleting = false,
  isScraping = false,
}: SourceCardProps) {
  const { apiClient } = useApi();
  const [error, setError] = useState<string | null>(null);

  const handleScrapeNow = async () => {
    if (isScraping) return;

    try {
      await apiClient.post(`/sources/${source.id}/scrape-now`);
      onScrapeNow?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du scraping');
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette source?')) {
      return;
    }

    try {
      await apiClient.delete(`/sources/${source.id}`);
      onDelete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const lastScrapedDate = source.lastScrapedAt
    ? new Date(source.lastScrapedAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Jamais';

  return (
    <div
      className={`
        border rounded-lg p-4 space-y-3 transition-all hover:shadow-md
        ${SOURCE_COLORS[source.type] || 'bg-gray-50 border-gray-200'}
      `}
    >
      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          {/* Header with icon and title */}
          <div className="flex items-start gap-2 mb-3">
            <span className="text-2xl flex-shrink-0">{SOURCE_ICONS[source.type] || '🔗'}</span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{source.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {getSourceLabel(source.type)}
              </p>
            </div>
          </div>

          {/* URL */}
          {source.config?.baseUrl && (
            <div className="mb-3">
              <a
                href={source.config.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
              >
                <span className="truncate">{source.config.baseUrl}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Keywords */}
          {source.keywords && source.keywords.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] text-muted-foreground mb-1 font-medium">
                Mots-clés:
              </p>
              <div className="flex flex-wrap gap-1">
                {source.keywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="text-[10px] px-1.5 py-0.5">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Status & Info */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${source.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span>{source.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <p>Dernier scan: {lastScrapedDate}</p>
            {source.errorCount > 0 && (
              <p className="text-destructive font-medium">
                ⚠️ {source.errorCount} erreur{source.errorCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handleScrapeNow}
            disabled={isScraping || isDeleting}
            className="w-10 h-10 p-0"
            title="Analyser maintenant"
          >
            <RotateCw className={`w-4 h-4 ${isScraping ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={isDeleting || isScraping}
            className="w-10 h-10 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}