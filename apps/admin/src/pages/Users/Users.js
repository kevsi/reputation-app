"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = UsersPage;
const react_1 = require("react");
const api_client_1 = require("@/lib/api-client");
const UserTableRow_1 = require("@/components/users/UserTableRow");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const alert_1 = require("@/components/ui/alert");
const dialog_1 = require("@/components/ui/dialog");
const select_1 = require("@/components/ui/select");
const label_1 = require("@/components/ui/label");
function UsersPage() {
    const [users, setUsers] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    const [roleFilter, setRoleFilter] = (0, react_1.useState)("all");
    const [statusFilter, setStatusFilter] = (0, react_1.useState)("all");
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [editingUser, setEditingUser] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        email: '',
        role: 'USER'
    });
    (0, react_1.useEffect)(() => {
        fetchUsers();
    }, []);
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.getUsers();
            if (response.success) {
                setUsers(response.data);
            }
            else {
                throw new Error("Failed to fetch users");
            }
        }
        catch (err) {
            console.error("Error loading users:", err);
            setError("Impossible de charger les utilisateurs. Veuillez réessayer.");
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.createUser(formData);
            if (response.success) {
                setUsers([response.data, ...users]);
                setIsDialogOpen(false);
                setFormData({ name: '', email: '', role: 'USER' });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la création');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la création de l\'utilisateur.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleManageUser = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email,
            role: user.role
        });
        setIsDialogOpen(true);
    };
    const handleUpdateUser = async (e) => {
        e.preventDefault();
        if (!editingUser)
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.updateUser(editingUser.id, formData);
            if (response.success) {
                setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
                setIsDialogOpen(false);
                setEditingUser(null);
                setFormData({ name: '', email: '', role: 'USER' });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la mise à jour');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la mise à jour de l\'utilisateur.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesStatus = statusFilter === "all" || (user.isActive ? "Actif" : "Bloqué") === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });
    return (<div className="p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
              👥 Gestion des utilisateurs
            </h1>
            <p className="text-sm text-muted-foreground">
              Contrôler les comptes utilisateurs et leurs accès
            </p>
          </div>
          <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <dialog_1.DialogTrigger asChild>
              <button_1.Button className="bg-foreground text-background hover:opacity-90">
                <lucide_react_1.UserPlus className="w-4 h-4 mr-2"/>
                Nouvel utilisateur
              </button_1.Button>
            </dialog_1.DialogTrigger>
            <dialog_1.DialogContent className="sm:max-w-[500px]">
              <dialog_1.DialogHeader>
                <dialog_1.DialogTitle>
                  {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
                </dialog_1.DialogTitle>
              </dialog_1.DialogHeader>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4 py-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="name">Nom complet *</label_1.Label>
                  <input_1.Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Jean Dupont" required/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="email">Email *</label_1.Label>
                  <input_1.Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="jean.dupont@exemple.com" required/>
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="role">Rôle</label_1.Label>
                  <select_1.Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue />
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="USER">Utilisateur</select_1.SelectItem>
                      <select_1.SelectItem value="MANAGER">Manager</select_1.SelectItem>
                      <select_1.SelectItem value="ADMIN">Administrateur</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>

                {error && (<alert_1.Alert variant="destructive">
                    <lucide_react_1.AlertCircle className="h-4 w-4"/>
                    <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
                  </alert_1.Alert>)}

                <dialog_1.DialogFooter>
                  <button_1.Button type="button" variant="outline" onClick={() => {
            setIsDialogOpen(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', role: 'USER' });
        }}>
                    Annuler
                  </button_1.Button>
                  <button_1.Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                    {editingUser ? 'Modifier' : 'Créer'} l'utilisateur
                  </button_1.Button>
                </dialog_1.DialogFooter>
              </form>
            </dialog_1.DialogContent>
          </dialog_1.Dialog>
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
          <input type="text" placeholder="Rechercher par nom ou email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm h-10"/>
        </div>

        <div className="flex flex-wrap gap-2">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm h-10 min-w-[150px]">
            <option value="all">Tous les rôles</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="USER">User</option>
          </select>

          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm h-10 min-w-[150px]">
            <option value="all">Tous les statuts</option>
            <option value="Actif">Actif</option>
            <option value="Bloqué">Bloqué</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Organisation</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date d'inscription</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (Array.from({ length: 5 }).map((_, i) => (<tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8">
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </td>
                  </tr>))) : filteredUsers.length === 0 ? (<tr>
                  <td colSpan={6} className="text-center py-20">
                    <div className="text-muted-foreground">
                      <lucide_react_1.Search className="w-10 h-10 mx-auto mb-4 opacity-20"/>
                      <p>Aucun utilisateur trouvé</p>
                    </div>
                  </td>
                </tr>) : (filteredUsers.map((user) => (<UserTableRow_1.UserTableRow key={user.id} name={user.name || 'Sans nom'} email={user.email} organisationId={user.organizationId} organisationName={user.organization?.name} role={user.role} createdAt={new Date(user.createdAt).toLocaleDateString()} status={user.isActive ? "Actif" : "Bloqué"} onManage={() => handleManageUser(user)}/>)))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      {!isLoading && (<div className="mt-4 text-sm text-muted-foreground pl-2 text-right italic">
          {filteredUsers.length} utilisateur(s) affiché(s)
        </div>)}
    </div>);
}
