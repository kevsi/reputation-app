import { ConnectorCard } from "@/components/connectors/ConnectorCard";
import { RefreshCw } from "lucide-react";

const connectorsData = [
  {
    id: 1,
    name: "X (Twitter)",
    icon: "❌",
    status: "Opérationnel" as const,
    collected24h: 12450,
    errors: 0,
    lastSync: "Il y a 2 min"
  },
  {
    id: 2,
    name: "Reddit",
    icon: "🔴",
    status: "Opérationnel" as const,
    collected24h: 8923,
    errors: 2,
    lastSync: "Il y a 5 min"
  },
  {
    id: 3,
    name: "Instagram",
    icon: "📷",
    status: "Dégradé" as const,
    collected24h: 6734,
    errors: 15,
    lastSync: "Il y a 15 min"
  },
  {
    id: 4,
    name: "TikTok",
    icon: "🎵",
    status: "Maintenance" as const,
    collected24h: 0,
    errors: 0,
    lastSync: "Il y a 2h"
  },
  {
    id: 5,
    name: "News & Blogs",
    icon: "📰",
    status: "Opérationnel" as const,
    collected24h: 4521,
    errors: 0,
    lastSync: "Il y a 10 min"
  },
  {
    id: 6,
    name: "YouTube",
    icon: "📹",
    status: "Opérationnel" as const,
    collected24h: 3245,
    errors: 1,
    lastSync: "Il y a 20 min"
  }
];

export default function ConnectorsPage() {
  const totalCollected = connectorsData.reduce((sum, c) => sum + c.collected24h, 0);
  const totalErrors = connectorsData.reduce((sum, c) => sum + c.errors, 0);
  const operationalCount = connectorsData.filter(c => c.status === "Opérationnel").length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
              🔌 Connecteurs & Sources
            </h1>
            <p className="text-sm text-muted-foreground">
              Piloter la collecte de données
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <RefreshCw className="w-4 h-4" />
            Rafraîchir tout
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Total collectées (24h)
          </div>
          <div className="text-3xl font-bold text-foreground">
            {totalCollected.toLocaleString()}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Connecteurs actifs
          </div>
          <div className="text-3xl font-bold text-foreground">
            {operationalCount}/{connectorsData.length}
          </div>
        </div>

        <div className={`${
          totalErrors > 0 
            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' 
            : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'
        } border rounded-xl p-5`}>
          <div className="text-sm text-muted-foreground mb-1">
            Erreurs totales
          </div>
          <div className={`text-3xl font-bold ${
            totalErrors > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {totalErrors}
          </div>
        </div>
      </div>

      {/* Connectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {connectorsData.map((connector) => (
          <ConnectorCard
            key={connector.id}
            name={connector.name}
            icon={connector.icon}
            status={connector.status}
            collected24h={connector.collected24h}
            errors={connector.errors}
            lastSync={connector.lastSync}
            onConfigure={() => console.log("Configure", connector.id)}
            onTest={() => console.log("Test", connector.id)}
          />
        ))}
      </div>
    </div>
  );
}