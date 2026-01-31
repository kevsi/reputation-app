"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AdminDashboard;
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const api_client_1 = require("@/lib/api-client");
const AuthContext_1 = require("@/contexts/AuthContext");
const AdminStatCard_1 = require("@/components/dashboard/AdminStatCard");
const ConnectorStatusItem_1 = require("@/components/dashboard/ConnectorStatusItem");
const ActivityItem_1 = require("@/components/dashboard/ActivityItem");
const lucide_react_1 = require("lucide-react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
function AdminDashboard() {
    const { user } = (0, AuthContext_1.useAuth)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [stats, setStats] = (0, react_1.useState)({
        organizations: { total: 0, active: 0 },
        users: { total: 0, active: 0 },
        mentions: { total: 24, trend: 0 },
        alerts: { critical: 0 }
    });
    const [timeSeries, setTimeSeries] = (0, react_1.useState)([]);
    const [connectorsStatus, setConnectorsStatus] = (0, react_1.useState)([
        { name: "X (Twitter)", status: "online", lastSync: "Il y a 2 min" },
        { name: "Reddit", status: "online", lastSync: "Il y a 5 min" },
        { name: "Web / RSS", status: "warning", lastSync: "Il y a 15 min" }
    ]);
    (0, react_1.useEffect)(() => {
        if (user?.organizationId) {
            fetchDashboardData();
        }
    }, [user]);
    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const endDate = new Date().toISOString();
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
            const [orgsRes, usersRes, summaryRes, alertsRes] = await Promise.all([
                api_client_1.apiClient.getOrganizations(),
                api_client_1.apiClient.getUsers(),
                api_client_1.apiClient.getAnalyticsSummary({ startDate, endDate }),
                api_client_1.apiClient.getAlerts({ organizationId: user?.organizationId || '' })
            ]);
            // Fetch time series (separate to keep cards responsive even if chart fails)
            try {
                const tsRes = await api_client_1.apiClient.getTimeSeries({ period: 'daily', startDate, endDate });
                const tsData = Array.isArray(tsRes) ? tsRes : (tsRes.data || []);
                setTimeSeries(tsData);
            }
            catch (e) {
                console.error('Error fetching time series:', e);
                setTimeSeries([]);
            }
            setStats({
                organizations: {
                    total: orgsRes.data?.length || 0,
                    active: orgsRes.data?.filter((o) => o.isActive).length || 0
                },
                users: {
                    total: usersRes.data?.length || 0,
                    active: usersRes.data?.filter((u) => u.isActive).length || 0
                },
                mentions: {
                    total: summaryRes.data?.totalMentions || 0,
                    trend: 0 // Backend doesn't provide trend yet
                },
                alerts: {
                    critical: alertsRes.data?.filter((a) => a.level === 'CRITICAL' && a.isActive).length || 0
                }
            });
        }
        catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const statsCards = [
        {
            label: "Organisations",
            value: `${stats.organizations.active} / ${stats.organizations.total}`,
            trend: stats.organizations.total > 0 ? "Actives" : "Aucune",
            trendPositive: true,
            icon: lucide_react_1.Building2
        },
        {
            label: "Utilisateurs",
            value: `${stats.users.active} / ${stats.users.total}`,
            trend: "Utilisateurs inscrits",
            trendPositive: true,
            icon: lucide_react_1.Users
        },
        {
            label: "Mentions Totales",
            value: stats.mentions.total.toLocaleString(),
            trend: "Depuis le début",
            trendPositive: true,
            icon: lucide_react_1.MessageSquare
        },
        {
            label: "Alertes Critiques",
            value: stats.alerts.critical.toString(),
            trend: stats.alerts.critical > 0 ? "Action requise" : "Tout est normal",
            trendPositive: stats.alerts.critical === 0,
            icon: lucide_react_1.Bell
        }
    ];
    return (<div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            📊 Tableau de Bord
          </h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de votre plateforme de réputation
          </p>
        </div>
        <button_1.Button onClick={fetchDashboardData} variant="outline" size="sm" className="h-9">
          <lucide_react_1.RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}/>
          Actualiser
        </button_1.Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {statsCards.map((stat, index) => (<AdminStatCard_1.AdminStatCard key={index} {...stat}/>))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sentiment Overview */}
        <card_1.Card className="lg:col-span-2">
          <card_1.CardHeader className="flex flex-row items-center justify-between">
            <card_1.CardTitle className="text-lg font-semibold flex items-center gap-2">
              <lucide_react_1.TrendingUp className="w-5 h-5 text-blue-500"/>
              Tendance des Mentions
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            {isLoading ? (<div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
                <lucide_react_1.Loader2 className="w-8 h-8 mb-3 animate-spin"/>
                <p className="text-sm">Chargement des données...</p>
              </div>) : timeSeries.length === 0 ? (<div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
                <lucide_react_1.BarChart3 className="w-12 h-12 mb-4 opacity-20"/>
                <p className="text-sm">Aucune donnée pour l’instant (ajoute une source et lance un scraping).</p>
              </div>) : (<SimpleSparkline data={timeSeries}/>)}
          </card_1.CardContent>
        </card_1.Card>

        {/* Connectors Status */}
        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg font-semibold flex items-center gap-2">
              <lucide_react_1.RefreshCw className="w-5 h-5 text-green-500"/>
              État des Sources
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              {connectorsStatus.map((connector, index) => (<ConnectorStatusItem_1.ConnectorStatusItem key={index} {...connector}/>))}
              <div className="pt-4 mt-4 border-t border-border/50 text-center">
                <button_1.Button variant="ghost" size="sm" className="text-xs text-muted-foreground w-full" onClick={() => navigate('/admin/connectors')}>
                  Voir tous les connecteurs
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <card_1.Card className="lg:col-span-2">
          <card_1.CardHeader>
            <card_1.CardTitle className="text-lg font-semibold flex items-center gap-2">
              <lucide_react_1.Activity className="w-5 h-5 text-purple-500"/>
              Derniers événements
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-4">
              <ActivityItem_1.ActivityItem user="Système" action="Synchronisation des mentions terminée" time="Il y a 5 min"/>
              <ActivityItem_1.ActivityItem user={user?.name || "Admin"} action="A consulté le rapport de réputation" time="Il y a 15 min"/>
              <ActivityItem_1.ActivityItem user="Bot Twitter" action="A détecté 12 nouvelles mentions" time="Il y a 30 min"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Quick Tips / Help */}
        <card_1.Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-none shadow-xl">
          <card_1.CardContent className="pt-6">
            <lucide_react_1.AlertCircle className="w-10 h-10 mb-4 opacity-50"/>
            <h3 className="text-xl font-bold mb-2">Configurez vos alertes</h3>
            <p className="text-sm text-blue-100 mb-6 leading-relaxed">
              Ne manquez aucun retour critique. Configurez des alertes automatiques basées sur le sentiment pour être informé en temps réel.
            </p>
            <button_1.Button className="w-full bg-white text-blue-600 hover:bg-blue-50" onClick={() => navigate('/admin/alerts')}>
              Paramétrer les alertes
            </button_1.Button>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
function SimpleSparkline({ data, }) {
    const values = data.map((d) => d.count);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const width = 640;
    const height = 180;
    const padding = 12;
    const scaleX = (i) => {
        if (data.length <= 1)
            return padding;
        return padding + (i / (data.length - 1)) * (width - padding * 2);
    };
    const scaleY = (v) => {
        const range = max - min || 1;
        const normalized = (v - min) / range;
        return height - padding - normalized * (height - padding * 2);
    };
    const path = data
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i)} ${scaleY(d.count)}`)
        .join(' ');
    const total = values.reduce((a, b) => a + b, 0);
    const last = data[data.length - 1]?.count ?? 0;
    return (<div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          Total (30j): <span className="font-semibold text-foreground">{total}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Dernier point: <span className="font-semibold text-foreground">{last}</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
          <path d={path} fill="none" stroke="currentColor" strokeWidth="3" className="text-blue-500"/>
        </svg>
      </div>
    </div>);
}
