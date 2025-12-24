import { SourceCard } from "@/components/sources/SourceCard";

const sourcesData = [
  {
    id: 1,
    name: "TikTok",
    icon: "⚫",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  },
  {
    id: 2,
    name: "Pinterest",
    icon: "📌",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  },
  {
    id: 3,
    name: "Facebook",
    icon: "📘",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  },
  {
    id: 4,
    name: "Reddit",
    icon: "🔴",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  },
  {
    id: 5,
    name: "Discord",
    icon: "💬",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  },
  {
    id: 6,
    name: "LinkedIn",
    icon: "💼",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  },
  {
    id: 7,
    name: "Instagram",
    icon: "📷",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  },
  {
    id: 8,
    name: "X",
    icon: "❌",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  },
  {
    id: 9,
    name: "WhatsApp",
    icon: "💚",
    mentions: 2078,
    mentionsTrend: "+14%",
    engagements: 1420,
    engagementsTrend: "+8%",
    sentiments: 78,
    sentimentsTrend: "-12%",
    isActive: true
  }
];

export default function SourcesPage() {
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
          {sourcesData.map((source) => (
            <SourceCard
              key={source.id}
              name={source.name}
              icon={source.icon}
              mentions={source.mentions}
              mentionsTrend={source.mentionsTrend}
              engagements={source.engagements}
              engagementsTrend={source.engagementsTrend}
              sentiments={source.sentiments}
              sentimentsTrend={source.sentimentsTrend}
              isActive={source.isActive}
            />
          ))}
        </div>
      </div>
    </div>
  );
}