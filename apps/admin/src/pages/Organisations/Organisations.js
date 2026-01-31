"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OrganisationsPage;
const react_1 = require("react");
const api_client_1 = require("@/lib/api-client");
const OrganisationTableRow_1 = require("@/components/organisations/OrganisationTableRow");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const alert_1 = require("@/components/ui/alert");
const dialog_1 = require("@/components/ui/dialog");
const badge_1 = require("@/components/ui/badge");
function OrganisationsPage() {
    const [organisations, setOrganisations] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    const [statusFilter, setStatusFilter] = (0, react_1.useState)("all");
    const [planFilter, setPlanFilter] = (0, react_1.useState)("all");
    const [selectedOrg, setSelectedOrg] = (0, react_1.useState)(null);
    const [isDetailsOpen, setIsDetailsOpen] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchOrganisations();
    }, []);
    const fetchOrganisations = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.getOrganizations();
            if (response.success) {
                setOrganisations(response.data);
            }
            else {
                throw new Error("Failed to fetch organisations");
            }
        }
        catch (err) {
            console.error("Error loading organisations:", err);
            setError("Impossible de charger les organisations. Veuillez réessayer.");
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleViewDetails = (org) => {
        setSelectedOrg(org);
        setIsDetailsOpen(true);
    };
    const filteredOrganisations = organisations.filter(org => {
        const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
        // In our system, we don't have a status on Organization directly yet, 
        // but we can simulate it or check subscription status
        const matchesStatus = statusFilter === "all" || (org.subscription?.status === 'ACTIVE' ? "Actif" : "Suspendu") === statusFilter;
        const matchesPlan = planFilter === "all" || org.subscription?.plan === planFilter;
        return matchesSearch && matchesStatus && matchesPlan;
    });
    return (<div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
              🏢 Gestion des organisations
            </h1>
            <p className="text-sm text-muted-foreground">
              Superviser les clients et comptes de la plateforme
            </p>
          </div>
          <button_1.Button className="bg-foreground text-background hover:opacity-90 transition-opacity">
            <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
            Nouvelle organisation
          </button_1.Button>
        </div>
      </div>

      {error && (<alert_1.Alert variant="destructive" className="mb-6">
          <lucide_react_1.AlertCircle className="w-4 h-4"/>
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
          <input type="text" placeholder="Rechercher une organisation..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm h-10"/>
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm h-10 min-w-[150px]">
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Suspendu">Suspendu</option>
          </select>

          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm h-10 min-w-[150px]">
            <option value="all">Tous les plans</option>
            <option value="ENTERPRISE">Enterprise</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="STARTER">Starter</option>
            <option value="FREE">Free</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Membres</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Marques</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (Array.from({ length: 5 }).map((_, i) => (<tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </td>
                  </tr>))) : filteredOrganisations.length === 0 ? (<tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="text-muted-foreground">
                      <lucide_react_1.Search className="w-10 h-10 mx-auto mb-4 opacity-20"/>
                      <p>Aucune organisation trouvée</p>
                    </div>
                  </td>
                </tr>) : (filteredOrganisations.map((org) => (<OrganisationTableRow_1.OrganisationTableRow key={org.id} name={org.name} createdDate={new Date(org.createdAt).toLocaleDateString()} plan={org.subscription?.plan || 'FREE'} users={org._count?.members || 0} brands={org._count?.brands || 0} status={org.subscription?.status === 'ACTIVE' ? "Actif" : "Suspendu"} onViewDetails={() => handleViewDetails(org)}/>)))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      {!isLoading && (<div className="mt-4 text-sm text-muted-foreground pl-2">
          Affichage de {filteredOrganisations.length} organisation(s) sur {organisations.length} au total
        </div>)}

      {/* Organisation Details Dialog */}
      <dialog_1.Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <dialog_1.DialogContent className="sm:max-w-[600px]">
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle className="flex items-center gap-2">
              <lucide_react_1.Eye className="w-5 h-5"/>
              Détails de l'organisation
            </dialog_1.DialogTitle>
          </dialog_1.DialogHeader>
          {selectedOrg && (<div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedOrg.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Créée le {new Date(selectedOrg.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <badge_1.Badge className="mb-2">
                    {selectedOrg.subscription?.plan || 'FREE'}
                  </badge_1.Badge>
                  <p className="text-sm">
                    Statut: {selectedOrg.subscription?.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{selectedOrg._count?.members || 0}</div>
                  <div className="text-sm text-muted-foreground">Utilisateurs</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">{selectedOrg._count?.brands || 0}</div>
                  <div className="text-sm text-muted-foreground">Marques</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-muted-foreground">Mentions</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Informations supplémentaires</h4>
                <div className="text-sm text-muted-foreground">
                  <p>ID: {selectedOrg.id}</p>
                  {selectedOrg.subscription && (<p>Abonnement: {selectedOrg.subscription.plan} - {selectedOrg.subscription.status}</p>)}
                </div>
              </div>
            </div>)}
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
