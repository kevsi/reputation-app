import { AIModelCard } from "@/components/ai/AIModelCard";
import { Brain, Zap } from "lucide-react";

const aiModelsData = [
  {
    id: 1,
    name: "Analyse de sentiment",
    description: "Classification automatique du sentiment (positif/négatif/neutre)",
    version: "3.2.1",
    accuracy: 94,
    requests24h: 45230,
    status: "Actif" as const
  },
  {
    id: 2,
    name: "Détection de crise",
    description: "Identification précoce de situations critiques",
    version: "2.8.0",
    accuracy: 91,
    requests24h: 12450,
    status: "Actif" as const
  },
  {
    id: 3,
    name: "Extraction d'entités",
    description: "Reconnaissance de marques, personnes et lieux",
    version: "4.1.2",
    accuracy: 88,
    requests24h: 38920,
    status: "Actif" as const
  },
  {
    id: 4,
    name: "Classification thématique",
    description: "Catégorisation automatique par sujet",
    version: "1.5.3",
    accuracy: 86,
    requests24h: 0,
    status: "En maintenance" as const
  },
  {
    id: 5,
    name: "Détection de spam",
    description: "Filtrage des contenus indésirables",
    version: "2.0.1",
    accuracy: 96,
    requests24h: 67840,
    status: "Actif" as const
  },
  {
    id: 6,
    name: "Analyse d'intention",
    description: "Identification de l'intention (plainte, question, éloge)",
    version: "1.2.0",
    accuracy: 82,
    requests24h: 0,
    status: "Désactivé" as const
  }
];

export default function AIPage() {
  const activeModels = aiModelsData.filter(m => m.status === "Actif").length;
  const totalRequests = aiModelsData.reduce((sum, m) => sum + m.requests24h, 0);
  const avgAccuracy = Math.round(
    aiModelsData.reduce((sum, m) => sum + m.accuracy, 0) / aiModelsData.length
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Brain className="w-7 h-7" />
          IA & modèles
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestion des modèles d'intelligence artificielle
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Modèles actifs
          </div>
          <div className="text-3xl font-bold text-foreground">
            {activeModels}/{aiModelsData.length}
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Précision moyenne
          </div>
          <div className="text-3xl font-bold text-foreground">
            {avgAccuracy}%
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-5">
          <div className="text-sm text-muted-foreground mb-1">
            Requêtes (24h)
          </div>
          <div className="text-3xl font-bold text-foreground">
            {totalRequests.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {aiModelsData.map((model) => (
          <AIModelCard
            key={model.id}
            name={model.name}
            description={model.description}
            version={model.version}
            accuracy={model.accuracy}
            requests24h={model.requests24h}
            status={model.status}
            onConfigure={() => console.log("Configure", model.id)}
            onTest={() => console.log("Test", model.id)}
          />
        ))}
      </div>

      {/* Performance Info */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">
              Optimisation des performances
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Les modèles IA sont mis à jour automatiquement chaque mois pour améliorer leur précision. 
              Les données d'entraînement sont anonymisées et conformes au RGPD.
            </p>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Voir les métriques détaillées
              </button>
              <button className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
                Historique des mises à jour
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
