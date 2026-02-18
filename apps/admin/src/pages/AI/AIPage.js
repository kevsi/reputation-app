"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AIPage;
const react_1 = require("react");
const AIModelCard_1 = require("@/components/ai/AIModelCard");
const lucide_react_1 = require("lucide-react");
const api_client_1 = require("@/lib/api-client");
const alert_1 = require("@/components/ui/alert");
const button_1 = require("@/components/ui/button");
// Metadata static for models (descriptions, versions)
const MODEL_METADATA = {
    sentiment: {
        name: "Analyse de sentiment",
        description: "Classification automatique du sentiment (positif/négatif/neutre)",
        version: "3.2.1",
        accuracy: 94
    },
    emotion: {
        name: "Détection d'émotions",
        description: "Identification des émotions (joie, colère, tristesse...)",
        version: "2.1.0",
        accuracy: 89
    },
    keywords: {
        name: "Extraction de mots-clés",
        description: "Extraction automatique (YAKE!)",
        version: "1.0.0",
        accuracy: 85
    },
    spacy: {
        name: "Entités Nommées (NER)",
        description: "Reconnaissance de personnes, lieux, organisations (spaCy)",
        version: "3.7.0",
        accuracy: 92
    }
};
function AIPage() {
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [models, setModels] = (0, react_1.useState)([]);
    const [stats, setStats] = (0, react_1.useState)({ requests24h: 0, activeModels: 0, avgAccuracy: 0 });
    const fetchStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api_client_1.apiClient.getSystemStatus();
            if (!res.success) {
                throw new Error("Erreur lors de la récupération du statut système");
            }
            const aiStatus = res.data?.aiService;
            const aiDetails = res.data?.aiDetails;
            if (aiStatus === 'unreachable' || !aiDetails) {
                setError("Le service d'intelligence artificielle est actuellement inaccessible.");
                setModels([]);
                return;
            }
            if (aiDetails.models_loaded) {
                const loadedModels = aiDetails.models_loaded;
                // Transform the object { key: boolean } into an array of models
                const mappedModels = Object.entries(loadedModels).map(([key, isLoaded], index) => {
                    const meta = MODEL_METADATA[key] || {
                        name: key,
                        description: "Modèle générique",
                        version: "1.0.0",
                        accuracy: 80
                    };
                    return {
                        id: index + 1,
                        key: key,
                        ...meta,
                        status: isLoaded ? "Actif" : "Erreur",
                        requests24h: Math.floor(Math.random() * 5000) + 1000 // Mock stats for now
                    };
                });
                setModels(mappedModels);
                // Calculate stats
                const activeCount = mappedModels.filter((m) => m.status === "Actif").length;
                const totalReq = mappedModels.reduce((sum, m) => sum + m.requests24h, 0);
                const avgAcc = Math.round(mappedModels.reduce((sum, m) => sum + m.accuracy, 0) / (mappedModels.length || 1));
                setStats({
                    activeModels: activeCount,
                    requests24h: totalReq,
                    avgAccuracy: avgAcc
                });
            }
            else {
                setError("Aucun modèle n'est actuellement chargé dans le service IA.");
            }
        }
        catch (error) {
            console.error("Failed to fetch AI status", error);
            setError("Une erreur est survenue lors de la connexion au service de surveillance.");
        }
        finally {
            setLoading(false);
        }
    };
    const handleConfigure = (modelKey) => {
        alert(`Configuration du modèle ${modelKey} - Cette fonctionnalité sera bientôt disponible.`);
    };
    const handleTest = (modelKey) => {
        alert(`Test du modèle ${modelKey} lancé. Cette fonctionnalité sera bientôt disponible.`);
    };
    (0, react_1.useEffect)(() => {
        fetchStatus();
    }, []);
    return (<div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <lucide_react_1.Brain className="w-7 h-7"/>
            IA & modèles
          </h1>
          <p className="text-sm text-muted-foreground">
            Gestion des modèles d'intelligence artificielle
          </p>
        </div>
        <button_1.Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
          <lucide_react_1.RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}/>
          Actualiser
        </button_1.Button>
      </div>

      {loading ? (<div className="flex flex-col items-center justify-center py-20">
          <lucide_react_1.Loader2 className="w-10 h-10 animate-spin text-primary mb-4"/>
          <p className="text-muted-foreground animate-pulse">Analyse des modèles en cours...</p>
        </div>) : error ? (<div className="py-10">
          <alert_1.Alert variant="destructive" className="max-w-2xl mx-auto">
            <lucide_react_1.AlertCircle className="h-4 w-4"/>
            <alert_1.AlertTitle>Erreur de service</alert_1.AlertTitle>
            <alert_1.AlertDescription className="mt-2 flex flex-col gap-4">
              <p>{error}</p>
              <button_1.Button variant="outline" className="w-fit" onClick={fetchStatus}>
                Réessayer
              </button_1.Button>
            </alert_1.AlertDescription>
          </alert_1.Alert>
        </div>) : (<>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-5">
              <div className="text-sm text-muted-foreground mb-1">
                Modèles actifs
              </div>
              <div className="text-3xl font-bold text-foreground">
                {stats.activeModels}/{models.length}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-xl p-5">
              <div className="text-sm text-muted-foreground mb-1">
                Précision moyenne
              </div>
              <div className="text-3xl font-bold text-foreground">
                {stats.avgAccuracy}%
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-5">
              <div className="text-sm text-muted-foreground mb-1">
                Requêtes (24h) (Est.)
              </div>
              <div className="text-3xl font-bold text-foreground">
                {stats.requests24h.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Models Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {models.map((model) => (<AIModelCard_1.AIModelCard key={model.id} name={model.name} description={model.description} version={model.version} accuracy={model.accuracy} requests24h={model.requests24h} status={model.status} onConfigure={() => handleConfigure(model.key)} onTest={() => handleTest(model.key)}/>))}
          </div>
        </>)}

      {/* Performance Info */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-900 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <lucide_react_1.Zap className="w-6 h-6 text-purple-600"/>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-2">
              Optimisation des performances
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Les modèles IA sont mis à jour automatiquement pour améliorer leur précision.
              Le service tourne sur une infrastructure containerisée scalant automatiquement selon la charge.
            </p>
          </div>
        </div>
      </div>
    </div>);
}
