import { AlertCard } from "@/components/alerts/AlertCard";
import { Settings, Plus } from "lucide-react";

const alertsData = [
  {
    id: "1",
    type: "urgent" as const,
    title: "Pic de mentions négatives",
    description: "Une augmentation de 45% des mentions négatives détectée dans les dernières 2 heures",
    timestamp: "Il y a 5 minutes",
    status: "En cours",
    mentions: 23,
    platform: "Twitter",
    impact: "élevé" as const
  },
  {
    id: "2",
    type: "warning" as const,
    title: "Baisse d'engagement",
    description: "Le taux d'engagement sur Instagram a diminué de 20% cette semaine",
    timestamp: "Il y a 30 minutes",
    status: "En cours",
    mentions: 12,
    platform: "Instagram",
    impact: "moyen" as const
  },
  {
    id: "3",
    type: "info" as const,
    title: "Nouveau hashtag tendance",
    description: "Le hashtag #innovation lié à votre marque gagne en popularité",
    timestamp: "Il y a 1 heure",
    status: "En cours",
    mentions: 45,
    platform: "Twitter",
    impact: "moyen" as const
  },
  {
    id: "4",
    type: "warning" as const,
    title: "Commentaire viral négatif",
    description: "Un commentaire négatif sur votre dernier post Facebook a reçu plus de 100 réactions",
    timestamp: "Il y a 2 heures",
    status: "En cours",
    mentions: 8,
    platform: "Facebook",
    impact: "élevé" as const
  }
];

export default function AlertsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Alertes
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Surveillez les événements importants concernant votre marque
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
                <Settings className="w-4 h-4" />
                Configurer règles
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                Nouvelle alerte
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Alertes urgentes</div>
            <div className="text-4xl font-bold text-foreground">1</div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Avertissements</div>
            <div className="text-4xl font-bold text-foreground">1</div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
            <div className="text-sm text-muted-foreground mb-2">Total actives</div>
            <div className="text-4xl font-bold text-foreground">3</div>
          </div>
        </div>

        {/* Alerts List */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Alertes actives
          </h2>
          <div className="space-y-4">
            {alertsData.map((alert) => (
              <AlertCard
                key={alert.id}
                {...alert}
                onView={() => console.log("View", alert.id)}
                onResolve={() => console.log("Resolve", alert.id)}
                onIgnore={() => console.log("Ignore", alert.id)}
              />
            ))}
          </div>
        </div>

        {/* Empty State (optional, shown when no alerts) */}
        {alertsData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucune alerte active
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Configurez des règles pour recevoir des alertes personnalisées
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Configurer mes alertes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}