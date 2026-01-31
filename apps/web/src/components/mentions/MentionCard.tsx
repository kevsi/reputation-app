import { Check, X, Eye, Bell, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MentionCardProps {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  platform: string;
  url?: string;
  sourceType?: string;
  sourceName?: string;
  sentiment: {
    type: string;
    score: string;
  };
  tags: string[];
  actions?: {
    treated?: boolean;
    ignored?: boolean;
    monitored?: boolean;
    alert?: boolean;
  };
}

const SOURCE_TYPE_ICONS: Record<string, string> = {
  FORUM: '💬',
  BLOG: '✍️',
  NEWS: '📰',
  REVIEW: '⭐',
  REDDIT: '🔴',
  RSS: '📡',
  OTHER: '🌐',
};

export function MentionCard({
  id: _id,
  author,
  avatar,
  timestamp,
  content,
  platform,
  url,
  sourceType,
  sourceName,
  sentiment,
  tags,
  actions = {}
}: MentionCardProps) {
  const getSentimentColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "positive":
        return "bg-green-100 text-green-700 border-green-200";
      case "negative":
        return "bg-red-100 text-red-700 border-red-200";
      case "neutral":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "mixed":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getSentimentEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case "positive":
        return "😊";
      case "negative":
        return "😞";
      case "neutral":
        return "😐";
      case "mixed":
        return "🤔";
      default:
        return "❓";
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 space-y-3">
      {/* Header with author and source */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-foreground flex-shrink-0">
            {avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground truncate">{author}</div>
            <div className="text-xs text-muted-foreground">{timestamp}</div>
          </div>
        </div>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 p-1.5 hover:bg-muted rounded transition-colors"
            title="Voir la source"
          >
            <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </a>
        )}
      </div>

      {/* Source Info */}
      {sourceType && sourceName && (
        <div className="bg-muted/30 rounded p-2 flex items-center gap-2">
          <span className="text-sm">{SOURCE_TYPE_ICONS[sourceType] || '🔗'}</span>
          <span className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{sourceName}</span>
            <span className="mx-1">•</span>
            <span>{platform}</span>
          </span>
        </div>
      )}

      {/* URL Link */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline break-all flex items-center gap-1"
          title={url}
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{url}</span>
        </a>
      )}

      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed line-clamp-3">
        {content}
      </p>

      {/* Sentiment and Tags */}
      <div className="flex flex-wrap gap-2">
        <Badge className={`${getSentimentColor(sentiment.type)} border`}>
          <span className="mr-1">{getSentimentEmoji(sentiment.type)}</span>
          {sentiment.type}
        </Badge>
        
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-xs"
          >
            {typeof tag === 'string' ? tag : JSON.stringify(tag)}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
        <Button
          size="sm"
          variant={actions.treated ? "default" : "outline"}
          className="text-xs h-8 flex items-center gap-1"
        >
          <Check className="w-3 h-3" />
          <span className="hidden sm:inline">{actions.treated ? "Traité" : "Traiter"}</span>
        </Button>
        
        <Button
          size="sm"
          variant={actions.ignored ? "default" : "outline"}
          className="text-xs h-8 flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          <span className="hidden sm:inline">{actions.ignored ? "Ignoré" : "Ignorer"}</span>
        </Button>
        
        <Button
          size="sm"
          variant={actions.monitored ? "default" : "outline"}
          className="text-xs h-8 flex items-center gap-1"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">{actions.monitored ? "Surveillé" : "Surveiller"}</span>
        </Button>
        
        <Button
          size="sm"
          variant={actions.alert ? "destructive" : "outline"}
          className="text-xs h-8 flex items-center gap-1"
        >
          <Bell className="w-3 h-3" />
          <span className="hidden sm:inline">{actions.alert ? "Alerté" : "Alerte"}</span>
        </Button>
      </div>
    </div>
  );
}

export default MentionCard;