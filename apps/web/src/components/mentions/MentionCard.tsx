import { Check, X, Eye, Bell } from "lucide-react";

interface MentionCardProps {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  platform: string;
  sentiment: {
    type: "Positive" | "Negative" | "Neutral";
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

export function MentionCard({
  id,
  author,
  avatar,
  timestamp,
  content,
  platform,
  sentiment,
  tags,
  actions = {}
}: MentionCardProps) {
  const getSentimentColor = (type: string) => {
    switch (type) {
      case "Positive":
        return "bg-green-100 text-green-700";
      case "Negative":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      Twitter: "bg-blue-100 text-blue-700",
      Instagram: "bg-pink-100 text-pink-700",
      Facebook: "bg-blue-100 text-blue-700",
      LinkedIn: "bg-cyan-100 text-cyan-700"
    };
    return colors[platform] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-foreground">
            {avatar}
          </div>
          <div>
            <div className="font-semibold text-foreground">{author}</div>
            <div className="text-xs text-muted-foreground">{timestamp}</div>
          </div>
        </div>
        <button className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 transition-opacity flex items-center gap-1">
          <Eye className="w-3 h-3" />
          Détails
        </button>
      </div>

      {/* Content */}
      <p className="text-sm text-foreground leading-relaxed mb-4">
        {content}
      </p>

      {/* Tags and Sentiment */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPlatformColor(platform)}`}>
          {platform}
        </span>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getSentimentColor(sentiment.type)}`}>
          😊 {sentiment.type} ({sentiment.score})
        </span>
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            actions.treated
              ? "bg-green-100 text-green-700"
              : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          <Check className="w-3 h-3" />
          {actions.treated ? "Traité" : "Traiter"}
        </button>
        
        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            actions.ignored
              ? "bg-gray-100 text-gray-700"
              : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          <X className="w-3 h-3" />
          {actions.ignored ? "Ignoré" : "Ignorer"}
        </button>
        
        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            actions.monitored
              ? "bg-yellow-100 text-yellow-700"
              : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          <Eye className="w-3 h-3" />
          {actions.monitored ? "Surveillé" : "Surveiller"}
        </button>
        
        <button
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            actions.alert
              ? "bg-red-100 text-red-700"
              : "border border-border text-foreground hover:bg-muted"
          }`}
        >
          <Bell className="w-3 h-3" />
          {actions.alert ? "Alerté" : "Alerte"}
        </button>
      </div>
    </div>
  );
}

export default MentionCard;