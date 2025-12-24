import { useState } from "react";
import { OrganisationTableRow } from "@/components/organisations/OrganisationTableRow";
import { Search, Plus } from "lucide-react";

const organisationsData = [
  {
    id: 1,
    name: "ByeWind",
    createdDate: "2024-01-15",
    plan: "Enterprise" as const,
    users: 12,
    mentions: 45230,
    iaUsage: "89%",
    status: "Actif" as const
  },
  {
    id: 2,
    name: "TechCorp",
    createdDate: "2024-03-22",
    plan: "Professional" as const,
    users: 5,
    mentions: 23100,
    iaUsage: "45%",
    status: "Actif" as const
  },
  {
    id: 3,
    name: "StartupXYZ",
    createdDate: "2024-06-10",
    plan: "Starter" as const,
    users: 2,
    mentions: 1200,
    iaUsage: "12%",
    status: "Suspendu" as const
  },
  {
    id: 4,
    name: "GlobalBrand",
    createdDate: "2023-11-08",
    plan: "Enterprise" as const,
    users: 25,
    mentions: 89450,
    iaUsage: "156%",
    status: "Actif" as const
  }
];

export default function OrganisationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const filteredOrganisations = organisationsData.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || org.status === statusFilter;
    const matchesPlan = planFilter === "all" || org.plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
              🏢 Gestion des organisations
            </h1>
            <p className="text-sm text-muted-foreground">
              Superviser les clients et comptes
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Nouvelle organisation
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une organisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Suspendu">Suspendu</option>
          <option value="Inactif">Inactif</option>
        </select>

        {/* Plan Filter */}
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        >
          <option value="all">Tous les plans</option>
          <option value="Enterprise">Enterprise</option>
          <option value="Professional">Professional</option>
          <option value="Starter">Starter</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Organisation
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Utilisateurs
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mentions
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  IA Usage
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrganisations.map((org) => (
                <OrganisationTableRow
                  key={org.id}
                  name={org.name}
                  createdDate={org.createdDate}
                  plan={org.plan}
                  users={org.users}
                  mentions={org.mentions}
                  iaUsage={org.iaUsage}
                  status={org.status}
                  onViewDetails={() => console.log("View details", org.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredOrganisations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm text-muted-foreground">
              Aucune organisation trouvée
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-4 text-sm text-muted-foreground">
        {filteredOrganisations.length} organisation(s) sur {organisationsData.length}
      </div>
    </div>
  );
}