
import { useEffect, useState } from "react";
import { ConnectorCard } from "@/components/connectors/ConnectorCard";
import { RefreshCw, Loader2, Database, Server, Cpu, Activity } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function ConnectorsPage() {
  const [sources, setSources] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sourcesRes, statusRes] = await Promise.all([
        apiClient.getSources(),
        apiClient.getSystemStatus()
      ]);

      // Handle Sources
      const sourceData = (sourcesRes as any).data || (Array.isArray(sourcesRes) ? sourcesRes : []);
      const mappedSources = sourceData.map((source: any) => ({
        id: source.id,
        name: source.name || source.type,
        icon: getIconForType(source.type),
        status: source.isActive ? "Opérationnel" : "Hors ligne",
        collected24h: source.stats?.collected24h || 0,
        errors: source.stats?.errors || 0,
        lastSync: source.lastScrape ? formatDistanceToNow(new Date(source.lastScrape), { addSuffix: true, locale: fr }) : "Jamais"
      }));
      setSources(mappedSources);

      // Handle System Status
      if (statusRes.success) {
        setSystemStatus(statusRes.data);
      }

    } catch (error) {
      console.error("Failed to fetch connectors/status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigure = async (connectorId: string) => {
    // Simple toggle active/inactive for now
    const connector = sources.find(s => s.id === connectorId);
    if (!connector) return;

    const newActive = connector.status !== "Opérationnel";
    try {
      await apiClient.updateSource(connectorId, { isActive: newActive });
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error("Failed to update connector:", error);
      alert("Erreur lors de la mise à jour du connecteur");
    }
  };

  const handleTest = (connectorId: string) => {
    // For now, just show a message
    alert("Test du connecteur lancé. Cette fonctionnalité sera bientôt disponible.");
  };

  const getIconForType = (type: string) => {
    const t = (type || '').toLowerCase();
    if (t.includes('twitter') || t.includes('x')) return "❌";
    if (t.includes('reddit')) return "🔴";
    if (t.includes('instagram')) return "📷";
    if (t.includes('tiktok')) return "🎵";
    if (t.includes('youtube')) return "📹";
    if (t.includes('news') || t.includes('web')) return "📰";
    return "🌐";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'operational':
        return 'text-green-500 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default:
        return 'text-red-500 bg-red-50 border-red-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'connected':
      case 'operational':
        return 'Opérationnel';
      case 'degraded':
        return 'Dégradé';
      case 'disconnected':
        return 'Déconnecté';
      case 'unreachable':
        return 'Inaccessible';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
              🔌 État Système & Sources
            </h1>
            <p className="text-sm text-muted-foreground">
              Surveillance de l'infrastructure et des sources de données
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {loading && !systemStatus ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Section: Infrastructure System */}
          <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Infrastructure Système
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {/* Database */}
            <div className={`p-4 rounded-xl border ${getStatusColor(systemStatus?.database || 'unknown')}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/50 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/50">
                  {getStatusLabel(systemStatus?.database || 'unknown')}
                </span>
              </div>
              <div className="font-semibold text-lg">Base de données</div>
              <div className="text-sm opacity-80">PostgreSQL (Prisma)</div>
            </div>

            {/* Redis */}
            <div className={`p-4 rounded-xl border ${getStatusColor(systemStatus?.redis || 'unknown')}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/50 rounded-lg">
                  <Server className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/50">
                  {getStatusLabel(systemStatus?.redis || 'unknown')}
                </span>
              </div>
              <div className="font-semibold text-lg">Cache & Queue</div>
              <div className="text-sm opacity-80">Redis</div>
            </div>

            {/* Workers */}
            <div className={`p-4 rounded-xl border ${getStatusColor(systemStatus?.workers || 'unknown')}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/50 rounded-lg">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/50">
                  {getStatusLabel(systemStatus?.workers || 'unknown')}
                </span>
              </div>
              <div className="font-semibold text-lg">Workers</div>
              <div className="text-sm opacity-80">Traitement asynchrone</div>
            </div>

            {/* AI Service */}
            <div className={`p-4 rounded-xl border ${getStatusColor(systemStatus?.aiService || 'unknown')}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-white/50 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/50">
                  {getStatusLabel(systemStatus?.aiService || 'unknown')}
                </span>
              </div>
              <div className="font-semibold text-lg">Service IA</div>
              <div className="text-sm opacity-80">Analyse de texte</div>
            </div>
          </div>

          {/* Section: Data Sources */}
          <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-500" />
            Sources de Données
          </h2>

          {sources.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">Aucune source de données configurée.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sources.map((connector) => (
                <ConnectorCard
                  key={connector.id}
                  name={connector.name}
                  icon={connector.icon}
                  status={connector.status}
                  collected24h={connector.collected24h}
                  errors={connector.errors}
                  lastSync={connector.lastSync}
                  onConfigure={() => handleConfigure(connector.id)}
                  onTest={() => handleTest(connector.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
