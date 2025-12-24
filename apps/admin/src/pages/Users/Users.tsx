import { useState } from "react";
import { UserTableRow } from "@/components/users/UserTableRow";
import { Search } from "lucide-react";

const usersData = [
  {
    id: 1,
    name: "Marie Dupont",
    email: "marie@byewind.com",
    organisation: "ByeWind",
    role: "Admin" as const,
    lastConnection: "Il y a 2h",
    status: "Actif" as const
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@techcorp.com",
    organisation: "TechCorp",
    role: "Manager" as const,
    lastConnection: "Il y a 1j",
    status: "Actif" as const
  },
  {
    id: 3,
    name: "Sophie Martin",
    email: "sophie@startup.com",
    organisation: "StartupXYZ",
    role: "Analyst" as const,
    lastConnection: "Il y a 30j",
    status: "Bloqué" as const
  },
  {
    id: 4,
    name: "Pierre Laurent",
    email: "pierre@global.com",
    organisation: "GlobalBrand",
    role: "Admin" as const,
    lastConnection: "Il y a 5h",
    status: "Actif" as const
  }
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = usersData.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          👥 Gestion des utilisateurs
        </h1>
        <p className="text-sm text-muted-foreground">
          Contrôler les comptes utilisateurs
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        >
          <option value="all">Tous les rôles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Analyst">Analyst</option>
          <option value="Viewer">Viewer</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
        >
          <option value="all">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Bloqué">Bloqué</option>
          <option value="Inactif">Inactif</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Organisation
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Dernière connexion
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
              {filteredUsers.map((user) => (
                <UserTableRow
                  key={user.id}
                  name={user.name}
                  email={user.email}
                  organisation={user.organisation}
                  role={user.role}
                  lastConnection={user.lastConnection}
                  status={user.status}
                  onManage={() => console.log("Manage user", user.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-sm text-muted-foreground">
              Aucun utilisateur trouvé
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-4 text-sm text-muted-foreground">
        {filteredUsers.length} utilisateur(s) sur {usersData.length}
      </div>
    </div>
  );
}