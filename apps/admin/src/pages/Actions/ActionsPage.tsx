import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Play,
    Pause,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Action {
    id: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    priority: number;
    type: 'RESPONSE' | 'INVESTIGATION' | 'COMMUNICATION' | 'MONITORING';
    assignedTo?: string;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    relatedMentionIds?: string[];
    relatedAlertIds?: string[];
}

export default function ActionsPage() {
    const { user } = useAuth();
    const [actions, setActions] = useState<Action[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [editingAction, setEditingAction] = useState<Action | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 2, // MEDIUM
        type: 'RESPONSE',
        dueDate: '',
        assignedTo: ''
    });

    // Utility functions for priority mapping
    const priorityToNumber = (priority: string): number => {
        switch (priority) {
            case 'LOW': return 1;
            case 'MEDIUM': return 2;
            case 'HIGH': return 3;
            case 'CRITICAL': return 4;
            default: return 2;
        }
    };

    const numberToPriority = (num: number): string => {
        switch (num) {
            case 1: return 'LOW';
            case 2: return 'MEDIUM';
            case 3: return 'HIGH';
            case 4: return 'CRITICAL';
            default: return 'MEDIUM';
        }
    };

    useEffect(() => {
        fetchActions();
    }, []);

    const fetchActions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.getActions();
            if (response.success) {
                setActions(response.data as Action[]);
            } else {
                throw new Error('Failed to fetch actions');
            }
        } catch (err: any) {
            console.error('Error loading actions:', err);
            setError('Impossible de charger les actions. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAction = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiClient.createAction({
                ...formData,
                status: 'PENDING'
            });

            if (response.success) {
                setActions([response.data as Action, ...actions]);
                setIsDialogOpen(false);
                setFormData({
                    title: '',
                    description: '',
                    priority: 2, // MEDIUM
                    type: 'RESPONSE',
                    dueDate: '',
                    assignedTo: ''
                });
            } else {
                throw new Error(response.error?.message || 'Erreur lors de la création');
            }
        } catch (err: any) {
            setError(err.error?.message || err.message || 'Erreur lors de la création de l\'action.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (actionId: string, newStatus: Action['status']) => {
        try {
            const response = await apiClient.updateAction(actionId, { status: newStatus });
            if (response.success) {
                setActions(actions.map(action =>
                    action.id === actionId ? { ...action, status: newStatus } : action
                ));
            }
        } catch (err) {
            console.error('Error updating action status:', err);
        }
    };

    const handleEditAction = (action: Action) => {
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

    const handleUpdateAction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAction) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiClient.updateAction(editingAction.id, formData);
            if (response.success) {
                setActions(actions.map(action =>
                    action.id === editingAction.id ? { ...action, ...formData, type: formData.type as Action['type'] } : action
                ));
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
            } else {
                throw new Error(response.error?.message || 'Erreur lors de la mise à jour');
            }
        } catch (err: any) {
            setError(err.error?.message || err.message || 'Erreur lors de la mise à jour de l\'action.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAction = async (actionId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) return;

        try {
            const response = await apiClient.deleteAction(actionId);
            if (response.success) {
                setActions(actions.filter(action => action.id !== actionId));
            } else {
                throw new Error('Failed to delete action');
            }
        } catch (err: any) {
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

    const getStatusIcon = (status: Action['status']) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'IN_PROGRESS': return <Play className="w-4 h-4 text-blue-500" />;
            case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'CANCELLED': return <Pause className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: Action['status']) => {
        const variants = {
            COMPLETED: 'bg-green-100 text-green-800',
            IN_PROGRESS: 'bg-blue-100 text-blue-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            CANCELLED: 'bg-gray-100 text-gray-800'
        };
        return variants[status];
    };

    const getPriorityBadge = (priority: number) => {
        const priorityStr = numberToPriority(priority);
        const variants = {
            CRITICAL: 'bg-red-100 text-red-800',
            HIGH: 'bg-orange-100 text-orange-800',
            MEDIUM: 'bg-yellow-100 text-yellow-800',
            LOW: 'bg-green-100 text-green-800'
        };
        return variants[priorityStr as keyof typeof variants];
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestion des Actions</h1>
                    <p className="text-sm text-muted-foreground">
                        Planifiez et suivez vos réponses stratégiques
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-all">
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvelle action
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingAction ? 'Modifier l\'action' : 'Créer une nouvelle action'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingAction
                                    ? 'Modifiez les détails de cette action stratégique.'
                                    : 'Planifiez une action stratégique en réponse à une alerte ou une analyse.'
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={editingAction ? handleUpdateAction : handleCreateAction} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titre de l'action *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Répondre à la critique sur Twitter"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Détails de l'action à mener..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priorité</Label>
                                    <Select value={numberToPriority(formData.priority)} onValueChange={(value) => setFormData({ ...formData, priority: priorityToNumber(value) })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Faible</SelectItem>
                                            <SelectItem value="MEDIUM">Moyenne</SelectItem>
                                            <SelectItem value="HIGH">Élevée</SelectItem>
                                            <SelectItem value="CRITICAL">Critique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Action['type'] })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="RESPONSE">Réponse</SelectItem>
                                            <SelectItem value="INVESTIGATION">Investigation</SelectItem>
                                            <SelectItem value="COMMUNICATION">Communication</SelectItem>
                                            <SelectItem value="MONITORING">Surveillance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Échéance</Label>
                                <Input
                                    id="dueDate"
                                    type="datetime-local"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assignedTo">Assigné à</Label>
                                <Input
                                    id="assignedTo"
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                    placeholder="Nom de la personne assignée"
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => {
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
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {editingAction ? 'Modifier' : 'Créer'} l'action
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        placeholder="Rechercher des actions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="PENDING">En attente</SelectItem>
                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                        <SelectItem value="COMPLETED">Terminée</SelectItem>
                        <SelectItem value="CANCELLED">Annulée</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Priorité" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les priorités</SelectItem>
                        <SelectItem value="CRITICAL">Critique</SelectItem>
                        <SelectItem value="HIGH">Élevée</SelectItem>
                        <SelectItem value="MEDIUM">Moyenne</SelectItem>
                        <SelectItem value="LOW">Faible</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Actions List */}
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            ) : error ? (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : (
                <div className="space-y-4">
                    {filteredActions.map((action) => (
                        <Card key={action.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            {getStatusIcon(action.status)}
                                            <h3 className="font-semibold text-lg">{action.title}</h3>
                                            <Badge className={getPriorityBadge(action.priority)}>
                                                {numberToPriority(action.priority)}
                                            </Badge>
                                            <Badge className={getStatusBadge(action.status)}>
                                                {action.status === 'PENDING' ? 'En attente' :
                                                 action.status === 'IN_PROGRESS' ? 'En cours' :
                                                 action.status === 'COMPLETED' ? 'Terminée' : 'Annulée'}
                                            </Badge>
                                        </div>

                                        <p className="text-muted-foreground mb-3">{action.description}</p>

                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                            <span>Type: {action.type}</span>
                                            {action.assignedTo && <span>Assigné à: {action.assignedTo}</span>}
                                            {action.dueDate && <span>Échéance: {new Date(action.dueDate).toLocaleString()}</span>}
                                            <span>Créée: {new Date(action.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditAction(action)}>
                                                <Edit2 className="w-4 h-4 mr-2" />
                                                Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(action.id, 'IN_PROGRESS')}>
                                                <Play className="w-4 h-4 mr-2" />
                                                Marquer en cours
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(action.id, 'COMPLETED')}>
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Marquer terminée
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(action.id, 'CANCELLED')}>
                                                <Pause className="w-4 h-4 mr-2" />
                                                Annuler
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteAction(action.id)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {filteredActions.length === 0 && (
                        <div className="text-center py-12">
                            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Aucune action trouvée</h3>
                            <p className="text-muted-foreground">
                                Créez votre première action pour commencer à gérer vos réponses stratégiques.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}