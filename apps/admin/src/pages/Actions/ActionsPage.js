"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ActionsPage;
const react_1 = require("react");
const api_client_1 = require("@/lib/api-client");
const AuthContext_1 = require("@/contexts/AuthContext");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const card_1 = require("@/components/ui/card");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const dialog_1 = require("@/components/ui/dialog");
const select_1 = require("@/components/ui/select");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const alert_1 = require("@/components/ui/alert");
function ActionsPage() {
    const { user } = (0, AuthContext_1.useAuth)();
    const [actions, setActions] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [statusFilter, setStatusFilter] = (0, react_1.useState)('all');
    const [priorityFilter, setPriorityFilter] = (0, react_1.useState)('all');
    const [editingAction, setEditingAction] = (0, react_1.useState)(null);
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
        title: '',
        description: '',
        priority: 2, // MEDIUM
        type: 'RESPONSE',
        dueDate: '',
        assignedTo: ''
    });
    // Utility functions for priority mapping
    const priorityToNumber = (priority) => {
        switch (priority) {
            case 'LOW': return 1;
            case 'MEDIUM': return 2;
            case 'HIGH': return 3;
            case 'CRITICAL': return 4;
            default: return 2;
        }
    };
    const numberToPriority = (num) => {
        switch (num) {
            case 1: return 'LOW';
            case 2: return 'MEDIUM';
            case 3: return 'HIGH';
            case 4: return 'CRITICAL';
            default: return 'MEDIUM';
        }
    };
    (0, react_1.useEffect)(() => {
        fetchActions();
    }, []);
    const fetchActions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.getActions();
            if (response.success) {
                setActions(response.data);
            }
            else {
                throw new Error('Failed to fetch actions');
            }
        }
        catch (err) {
            console.error('Error loading actions:', err);
            setError('Impossible de charger les actions. Veuillez réessayer.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateAction = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.createAction({
                ...formData,
                status: 'PENDING'
            });
            if (response.success) {
                setActions([response.data, ...actions]);
                setIsDialogOpen(false);
                setFormData({
                    title: '',
                    description: '',
                    priority: 2, // MEDIUM
                    type: 'RESPONSE',
                    dueDate: '',
                    assignedTo: ''
                });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la création');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la création de l\'action.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleStatusChange = async (actionId, newStatus) => {
        try {
            const response = await api_client_1.apiClient.updateAction(actionId, { status: newStatus });
            if (response.success) {
                setActions(actions.map(action => action.id === actionId ? { ...action, status: newStatus } : action));
            }
        }
        catch (err) {
            console.error('Error updating action status:', err);
        }
    };
    const handleEditAction = (action) => {
        setEditingAction(action);
        setFormData({
            title: action.title,
            description: action.description || '',
            priority: action.priority,
            type: action.type,
            dueDate: action.dueDate ? new Date(action.dueDate).toISOString().slice(0, 16) : '',
            assignedTo: action.assignedTo || ''
        });
        setIsDialogOpen(true);
    };
    const handleUpdateAction = async (e) => {
        e.preventDefault();
        if (!editingAction)
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.updateAction(editingAction.id, formData);
            if (response.success) {
                setActions(actions.map(action => action.id === editingAction.id ? { ...action, ...formData, type: formData.type } : action));
                setIsDialogOpen(false);
                setEditingAction(null);
                setFormData({
                    title: '',
                    description: '',
                    priority: 2,
                    type: 'RESPONSE',
                    dueDate: '',
                    assignedTo: ''
                });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la mise à jour');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la mise à jour de l\'action.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteAction = async (actionId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette action ?'))
            return;
        try {
            const response = await api_client_1.apiClient.deleteAction(actionId);
            if (response.success) {
                setActions(actions.filter(action => action.id !== actionId));
            }
            else {
                throw new Error('Failed to delete action');
            }
        }
        catch (err) {
            console.error('Error deleting action:', err);
            setError('Erreur lors de la suppression de l\'action.');
        }
    };
    const filteredActions = actions.filter(action => {
        const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            action.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || action.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || numberToPriority(action.priority) === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
    });
    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <lucide_react_1.CheckCircle2 className="w-4 h-4 text-green-500"/>;
            case 'IN_PROGRESS': return <lucide_react_1.Play className="w-4 h-4 text-blue-500"/>;
            case 'PENDING': return <lucide_react_1.Clock className="w-4 h-4 text-yellow-500"/>;
            case 'CANCELLED': return <lucide_react_1.Pause className="w-4 h-4 text-gray-500"/>;
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            COMPLETED: 'bg-green-100 text-green-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            CANCELLED: 'bg-gray-100 text-gray-800'
        };
        return variants[status];
    };
    const getPriorityBadge = (priority) => {
        const priorityStr = numberToPriority(priority);
        const variants = {
            CRITICAL: 'bg-red-100 text-red-800',
            HIGH: 'bg-orange-100 text-orange-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            LOW: 'bg-green-100 text-green-800'
        };
        return variants[priorityStr];
    };
    return (<div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestion des Actions</h1>
                    <p className="text-sm text-muted-foreground">
                        Planifiez et suivez vos réponses stratégiques
                    </p>
                </div>

                <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <dialog_1.DialogTrigger asChild>
                        <button_1.Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-all">
                            <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                            Nouvelle action
                        </button_1.Button>
                    </dialog_1.DialogTrigger>
                    <dialog_1.DialogContent className="sm:max-w-[600px]">
                        <dialog_1.DialogHeader>
                            <dialog_1.DialogTitle>
                                {editingAction ? 'Modifier l\'action' : 'Créer une nouvelle action'}
                            </dialog_1.DialogTitle>
                            <dialog_1.DialogDescription>
                                {editingAction
            ? 'Modifiez les détails de cette action stratégique.'
            : 'Planifiez une action stratégique en réponse à une alerte ou une analyse.'}
                            </dialog_1.DialogDescription>
                        </dialog_1.DialogHeader>
                        <form onSubmit={editingAction ? handleUpdateAction : handleCreateAction} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label_1.Label htmlFor="title">Titre de l'action *</label_1.Label>
                                <input_1.Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Répondre à la critique sur Twitter" required/>
                            </div>

                            <div className="space-y-2">
                                <label_1.Label htmlFor="description">Description</label_1.Label>
                                <textarea_1.Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Détails de l'action à mener..." rows={3}/>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label_1.Label htmlFor="priority">Priorité</label_1.Label>
                                    <select_1.Select value={numberToPriority(formData.priority)} onValueChange={(value) => setFormData({ ...formData, priority: priorityToNumber(value) })}>
                                        <select_1.SelectTrigger>
                                            <select_1.SelectValue />
                                        </select_1.SelectTrigger>
                                        <select_1.SelectContent>
                                            <select_1.SelectItem value="LOW">Faible</select_1.SelectItem>
                                            <select_1.SelectItem value="MEDIUM">Moyenne</select_1.SelectItem>
                                            <select_1.SelectItem value="HIGH">Élevée</select_1.SelectItem>
                                            <select_1.SelectItem value="CRITICAL">Critique</select_1.SelectItem>
                                        </select_1.SelectContent>
                                    </select_1.Select>
                                </div>

                                <div className="space-y-2">
                                    <label_1.Label htmlFor="type">Type</label_1.Label>
                                    <select_1.Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                        <select_1.SelectTrigger>
                                            <select_1.SelectValue />
                                        </select_1.SelectTrigger>
                                        <select_1.SelectContent>
                                            <select_1.SelectItem value="RESPONSE">Réponse</select_1.SelectItem>
                                            <select_1.SelectItem value="INVESTIGATION">Investigation</select_1.SelectItem>
                                            <select_1.SelectItem value="COMMUNICATION">Communication</select_1.SelectItem>
                                            <select_1.SelectItem value="MONITORING">Surveillance</select_1.SelectItem>
                                        </select_1.SelectContent>
                                    </select_1.Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label_1.Label htmlFor="dueDate">Échéance</label_1.Label>
                                <input_1.Input id="dueDate" type="datetime-local" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}/>
                            </div>

                            <div className="space-y-2">
                                <label_1.Label htmlFor="assignedTo">Assigné à</label_1.Label>
                                <input_1.Input id="assignedTo" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} placeholder="Nom de la personne assignée"/>
                            </div>

                            {error && (<alert_1.Alert variant="destructive">
                                    <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                                    <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
                                </alert_1.Alert>)}

                            <dialog_1.DialogFooter>
                                <button_1.Button type="button" variant="outline" onClick={() => {
            setIsDialogOpen(false);
            setEditingAction(null);
            setFormData({
                title: '',
                description: '',
                priority: 2,
                type: 'RESPONSE',
                dueDate: '',
                assignedTo: ''
            });
        }}>
                                    Annuler
                                </button_1.Button>
                                <button_1.Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
                                    {editingAction ? 'Modifier' : 'Créer'} l'action
                                </button_1.Button>
                            </dialog_1.DialogFooter>
                        </form>
                    </dialog_1.DialogContent>
                </dialog_1.Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <input_1.Input placeholder="Rechercher des actions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full"/>
                </div>
                <select_1.Select value={statusFilter} onValueChange={setStatusFilter}>
                    <select_1.SelectTrigger className="w-full sm:w-48">
                        <select_1.SelectValue placeholder="Statut"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                        <select_1.SelectItem value="all">Tous les statuts</select_1.SelectItem>
                        <select_1.SelectItem value="PENDING">En attente</select_1.SelectItem>
                        <select_1.SelectItem value="IN_PROGRESS">En cours</select_1.SelectItem>
                        <select_1.SelectItem value="COMPLETED">Terminée</select_1.SelectItem>
                        <select_1.SelectItem value="CANCELLED">Annulée</select_1.SelectItem>
                    </select_1.SelectContent>
                </select_1.Select>
                <select_1.Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <select_1.SelectTrigger className="w-full sm:w-48">
                        <select_1.SelectValue placeholder="Priorité"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                        <select_1.SelectItem value="all">Toutes les priorités</select_1.SelectItem>
                        <select_1.SelectItem value="CRITICAL">Critique</select_1.SelectItem>
                        <select_1.SelectItem value="HIGH">Élevée</select_1.SelectItem>
                        <select_1.SelectItem value="MEDIUM">Moyenne</select_1.SelectItem>
                        <select_1.SelectItem value="LOW">Faible</select_1.SelectItem>
                    </select_1.SelectContent>
                </select_1.Select>
            </div>

            {/* Actions List */}
            {isLoading ? (<div className="flex justify-center items-center py-12">
                    <lucide_react_1.Loader2 className="w-8 h-8 animate-spin"/>
                </div>) : error ? (<alert_1.Alert variant="destructive">
                    <lucide_react_1.AlertTriangle className="h-4 w-4"/>
                    <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
                </alert_1.Alert>) : (<div className="space-y-4">
                    {filteredActions.map((action) => (<card_1.Card key={action.id} className="hover:shadow-md transition-shadow">
                            <card_1.CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(action.status)}
                                            <h3 className="font-semibold text-lg">{action.title}</h3>
                                            <badge_1.Badge className={getPriorityBadge(action.priority)}>
                                                {numberToPriority(action.priority)}
                                            </badge_1.Badge>
                                            <badge_1.Badge className={getStatusBadge(action.status)}>
                                                {action.status === 'PENDING' ? 'En attente' :
                    action.status === 'IN_PROGRESS' ? 'En cours' :
                        action.status === 'COMPLETED' ? 'Terminée' : 'Annulée'}
                                            </badge_1.Badge>
                                        </div>

                                        <p className="text-muted-foreground mb-3">{action.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span>Type: {action.type}</span>
                                            {action.assignedTo && <span>Assigné à: {action.assignedTo}</span>}
                                            {action.dueDate && <span>Échéance: {new Date(action.dueDate).toLocaleString()}</span>}
                                            <span>Créée: {new Date(action.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <dropdown_menu_1.DropdownMenu>
                                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                                            <button_1.Button variant="ghost" size="sm">
                                                <lucide_react_1.MoreVertical className="w-4 h-4"/>
                                            </button_1.Button>
                                        </dropdown_menu_1.DropdownMenuTrigger>
                                        <dropdown_menu_1.DropdownMenuContent align="end">
                                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleEditAction(action)}>
                                                <lucide_react_1.Edit2 className="w-4 h-4 mr-2"/>
                                                Modifier
                                            </dropdown_menu_1.DropdownMenuItem>
                                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleStatusChange(action.id, 'IN_PROGRESS')}>
                                                <lucide_react_1.Play className="w-4 h-4 mr-2"/>
                                                Marquer en cours
                                            </dropdown_menu_1.DropdownMenuItem>
                                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleStatusChange(action.id, 'COMPLETED')}>
                                                <lucide_react_1.CheckCircle2 className="w-4 h-4 mr-2"/>
                                                Marquer terminée
                                            </dropdown_menu_1.DropdownMenuItem>
                                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleStatusChange(action.id, 'CANCELLED')}>
                                                <lucide_react_1.Pause className="w-4 h-4 mr-2"/>
                                                Annuler
                                            </dropdown_menu_1.DropdownMenuItem>
                                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleDeleteAction(action.id)} className="text-red-600">
                                                <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/>
                                                Supprimer
                                            </dropdown_menu_1.DropdownMenuItem>
                                        </dropdown_menu_1.DropdownMenuContent>
                                    </dropdown_menu_1.DropdownMenu>
                                </div>
                            </card_1.CardContent>
                        </card_1.Card>))}

                    {filteredActions.length === 0 && (<div className="text-center py-12">
                            <lucide_react_1.AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
                            <h3 className="text-lg font-semibold mb-2">Aucune action trouvée</h3>
                            <p className="text-muted-foreground">
                                Créez votre première action pour commencer à gérer vos réponses stratégiques.
                            </p>
                        </div>)}
                </div>)}
        </div>);
}
