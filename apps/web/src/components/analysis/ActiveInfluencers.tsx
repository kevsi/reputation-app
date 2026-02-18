interface Influencer {
  username: string;
  mentions: number;
  followers: string;
  sentiment: "Positif" | "Neutre" | "Négatif";
}

interface ActiveInfluencersProps {
  influencers: Influencer[];
}

export function ActiveInfluencers({ influencers }: ActiveInfluencersProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positif":
        return "bg-green-100 text-green-700";
      case "Neutre":
        return "bg-gray-100 text-gray-700";
      case "Négatif":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-foreground mb-6">
        Influenceurs actifs
      </h2>

      <div className="space-y-4">
        {influencers.map((influencer, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm font-semibold text-foreground">
                  {influencer.username}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSentimentColor(
                    influencer.sentiment
                  )}`}
                >
                  😊 {influencer.sentiment}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {influencer.mentions} mentions
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">
                {influencer.followers}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActiveInfluencers;