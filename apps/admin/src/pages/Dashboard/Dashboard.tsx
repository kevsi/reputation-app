import { AdminStatCard } from "@/components/dashboard/AdminStatCard";
import { ConnectorStatusItem } from "@/components/dashboard/ConnectorStatusItem";
import { ActivityItem } from "@/components/dashboard/ActivityItem";

const statsData = [
  {
    label: "Organisations actives",
    value: "3 / 4",
    trend: "+2 ce mois-ci",
    trendPositive: true
  },
  {
    label: "Utilisateurs actifs",
    value: "42 / 44",
    trend: "95.5% activité",
    trendPositive: true
  },
  {
    label: "Mentions 24h",
    value: "31.2K",
    trend: "+12.5%",
    trendPositive: true
  },
  {
    label: "Alertes critiques",
    value: "3",
    trend: "Attention requise",
    trendPositive: false
  }
];

const connectorsStatus = [
  { name: "X (Twitter)", status: "online" as const, lastSync: "Il y a 2 min" },
  { name: "Reddit", status: "online" as const, lastSync: "Il y a 5 min" },
  { name: "Instagram", status: "warning" as const, lastSync: "Il y a 15 min" },
  { name: "TikTok", status: "error" as const, lastSync: "Il y a 2h" },
  { name: "News & Blogs", status: "online" as const, lastSync: "Il y a 10 min" }
];

const recentActivities = [
  { user: "Marie Dupont", action: "a créé une nouvelle organisation", time: "Il y a 5 min" },
  { user: "System", action: "a synchronisé 1,234 nouvelles mentions", time: "Il y a 10 min" },
  { user: "Jean Martin", action: "a configuré un nouveau connecteur", time: "Il y a 30 min" },
  { user: "Sophie Laurent", action: "a mis à jour les règles d'alertes", time: "Il y a 1h" }
];

export default function AdminDashboard() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
          📊 Admin Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Vue globale de la plateforme
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsData.map((stat, index) => (
          <AdminStatCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité globale */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Activité globale (7 jours)
          </h2>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-sm">Graphique d'activité</p>
            </div>
          </div>
        </div>

        {/* Statut des connecteurs */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Statut des connecteurs
          </h2>
          <div className="space-y-3">
            {connectorsStatus.map((connector, index) => (
              <ConnectorStatusItem key={index} {...connector} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 bg-card border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Activité récente
        </h2>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <ActivityItem key={index} {...activity} />
          ))}
        </div>
      </div>
    </div>
  );
}