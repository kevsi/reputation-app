import { useState } from "react";
import { AdminAlertCard } from "@/components/alerts/AdminAlertCard";
import { Plus } from "lucide-react";

const alertsData = [
  {
    id: 1,
    name: "Pic de mentions négatives",
    type: "Sentiment" as const,
    severity: "Critique" as const,
    organisations: 12,
    triggered24h: 8,
    isActive: true
  },
  {
    id: 2,
    name: "Volume inhabituel de mentions",
    type: "Volume" as const,
    severity: "Élevée" as const,
    organisations: 25,
    triggered24h: 15,
    isActive: true
  },
  {
    id: 3,
    name: "Détection mot-clé sensible",
    type: "Mot-clé" as const,
    severity: "Critique" as const,
    organisations: 34,
    triggered24h: 3,
    isActive: true
  },
  {
    id: 4,
    name: "Activité concurrent anormale",
    type: "Concurrent" as const,
    severity: "Moyenne" as const,
    organisations: 18,
    triggered24h: 5,
    isActive: true
  },
  {
    id: 5,
    name: "Baisse d'engagement",
    type: "Volume" as const,
    severity: "Faible" as const,
    organisations: 9,
    triggered24h: 2,
    isActive: false
  },
  {
    id: 6,
    name: "Nouveau hashtag viral",
    type: "Mot-clé" as const,
    severity: "Moyenne" as const,
    organisations: 22,
    triggered24h: 12,
    isActive: true
  }
];

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState(alertsData);

  const handleToggle = (id: number) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
      )
    );
  };

  const activeCount = alerts.filter(a => a.isActive).length;
  const totalTriggered = alerts.reduce((sum, a) => sum + a.triggered24h, 0);
  const criticalCount = alerts.filter(a => a.severity === "Critique" && a.isActive).length;

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
              🔔 Règles d'alertes
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérer les notifications automatiques
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Nouvelle règle
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Règles totales
          </div>
          <div className="text-3xl font-bold text-foreground">
            {alerts.length}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Règles actives
          </div>
          <div className="text-3xl font-bold text-foreground">
            {activeCount}
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Alertes critiques
          </div>
          <div className="text-3xl font-bold text-red-600">
            {criticalCount}
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Déclenchées (24h)
          </div>
          <div className="text-3xl font-bold text-foreground">
            {totalTriggered}
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {alerts.map((alert) => (
          <AdminAlertCard
            key={alert.id}
            name={alert.name}
            type={alert.type}
            severity={alert.severity}
            organisations={alert.organisations}
            triggered24h={alert.triggered24h}
            isActive={alert.isActive}
            onToggle={() => handleToggle(alert.id)}
            onEdit={() => console.log("Edit", alert.id)}
          />
        ))}
      </div>

      {/* Info Footer */}
      <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl">
        <div className="text-sm text-foreground">
          ⚡ <span className="font-semibold">Important :</span> Les règles d'alertes critiques sont envoyées en temps réel. 
          Les autres suivent un délai de 15 minutes pour éviter les notifications excessives.
        </div>
      </div>
    </div>
  );
}