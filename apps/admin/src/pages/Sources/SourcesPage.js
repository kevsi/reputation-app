"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SourcesPage;
const react_1 = require("react");
const api_client_1 = require("@/lib/api-client");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const dropdown_menu_1 = require("@/components/ui/dropdown-menu");
const dialog_1 = require("@/components/ui/dialog");
const select_1 = require("@/components/ui/select");
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const alert_1 = require("@/components/ui/alert");
function SourcesPage() {
    const [sources, setSources] = (0, react_1.useState)([]);
    const [brands, setBrands] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [selectedBrandFilter, setSelectedBrandFilter] = (0, react_1.useState)('all');
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [editingSource, setEditingSource] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        type: 'TWITTER',
        url: '',
        brandId: ''
    });
    (0, react_1.useEffect)(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [sourcesRes, brandsRes] = await Promise.all([
                api_client_1.apiClient.getSources(),
                api_client_1.apiClient.getBrands()
            ]);
            if (sourcesRes.success)
                setSources(sourcesRes.data);
            if (brandsRes.success) {
                setBrands(brandsRes.data);
                if (brandsRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, brandId: brandsRes.data[0].id }));
                }
            }
        }
        catch (err) {
            console.error('Error loading sources:', err);
            setError('Impossible de charger les données. Veuillez réessayer.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateSource = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.createSource({
                ...formData,
                isActive: true
            });
            if (response.success) {
                // Refresh sources to get the brand details if included
                const updatedSources = await api_client_1.apiClient.getSources();
                if (updatedSources.success)
                    setSources(updatedSources.data);
                setIsDialogOpen(false);
                setFormData({ ...formData, name: '', url: '' });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la création');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la création de la source.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleEditSource = (source) => {
        setEditingSource(source);
        setFormData({
            name: source.name,
            type: source.type,
            url: source.url || '',
            brandId: source.brandId || ''
        });
        setIsDialogOpen(true);
    };
    const handleUpdateSource = async (e) => {
        e.preventDefault();
        if (!editingSource)
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.updateSource(editingSource.id, formData);
            if (response.success) {
                // Refresh sources
                const updatedSources = await api_client_1.apiClient.getSources();
                if (updatedSources.success)
                    setSources(updatedSources.data);
                setIsDialogOpen(false);
                setEditingSource(null);
                setFormData({ name: '', type: 'WEB', url: '', brandId: '' });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la mise à jour');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la mise à jour de la source.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteSource = async (sourceId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette source ?'))
            return;
        try {
            const response = await api_client_1.apiClient.deleteSource(sourceId);
            if (response.success) {
                setSources(sources.filter(s => s.id !== sourceId));
            }
            else {
                throw new Error('Failed to delete source');
            }
        }
        catch (err) {
            console.error('Error deleting source:', err);
            setError('Erreur lors de la suppression de la source.');
        }
    };
    const filteredSources = sources.filter(source => {
        const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            source.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBrand = selectedBrandFilter === 'all' || source.brandId === selectedBrandFilter;
        return matchesSearch && matchesBrand;
    });
    const getSourceIcon = (type) => {
        switch (type.toUpperCase()) {
            case 'TWITTER': return '❌';
            case 'REDDIT': return '🔴';
            case 'INSTAGRAM': return '📷';
            case 'TIKTOK': return '🎵';
            case 'WEB': return '🌐';
            default: return '🔌';
        }
    };
    return (<div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sources de Veille</h1>
                    <p className="text-sm text-muted-foreground">
                        Configurez les flux de données pour vos marques
                    </p>
                </div>

                <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <dialog_1.DialogTrigger asChild>
                        <button_1.Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                            Nouvelle Source
                        </button_1.Button>
                    </dialog_1.DialogTrigger>
                    <dialog_1.DialogContent className="sm:max-w-[500px]">
                        <dialog_1.DialogHeader>
                            <dialog_1.DialogTitle>
                                {editingSource ? 'Modifier la source' : 'Ajouter une source de veille'}
                            </dialog_1.DialogTitle>
                        </dialog_1.DialogHeader>
                        <form onSubmit={editingSource ? handleUpdateSource : handleCreateSource} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label_1.Label htmlFor="brandId">Marque concernée *</label_1.Label>
                                <select_1.Select value={formData.brandId} onValueChange={(val) => setFormData({ ...formData, brandId: val })}>
                                    <select_1.SelectTrigger>
                                        <select_1.SelectValue placeholder="Sélectionnez une marque"/>
                                    </select_1.SelectTrigger>
                                    <select_1.SelectContent>
                                        {brands.map(brand => (<select_1.SelectItem key={brand.id} value={brand.id}>{brand.name}</select_1.SelectItem>))}
                                    </select_1.SelectContent>
                                </select_1.Select>
                            </div>

                            <div className="space-y-2">
                                <label_1.Label htmlFor="type">Type de source *</label_1.Label>
                                <select_1.Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                    <select_1.SelectTrigger>
                                        <select_1.SelectValue placeholder="Type de plateforme"/>
                                    </select_1.SelectTrigger>
                                    <select_1.SelectContent>
                                        <select_1.SelectItem value="TWITTER">X (Twitter)</select_1.SelectItem>
                                        <select_1.SelectItem value="REDDIT">Reddit</select_1.SelectItem>
                                        <select_1.SelectItem value="INSTAGRAM">Instagram</select_1.SelectItem>
                                        <select_1.SelectItem value="TIKTOK">TikTok</select_1.SelectItem>
                                        <select_1.SelectItem value="WEB">Site Web / RSS</select_1.SelectItem>
                                    </select_1.SelectContent>
                                </select_1.Select>
                            </div>

                            <div className="space-y-2">
                                <label_1.Label htmlFor="name">Nom de la source *</label_1.Label>
                                <input_1.Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Compte Officiel, Hashtag #Launch" required/>
                            </div>

                            <div className="space-y-2">
                                <label_1.Label htmlFor="url">URL ou Identifiant (Optionnel)</label_1.Label>
                                <input_1.Input id="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="Ex: https://twitter.com/user ou @username"/>
                            </div>

                            <dialog_1.DialogFooter className="pt-4">
                                <button_1.Button type="button" variant="ghost" onClick={() => {
            setIsDialogOpen(false);
            setEditingSource(null);
            setFormData({ name: '', type: 'TWITTER', url: '', brandId: '' });
        }}>Annuler</button_1.Button>
                                <button_1.Button type="submit" disabled={isSubmitting || brands.length === 0} className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    {isSubmitting ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : <lucide_react_1.Plus className="w-4 h-4 mr-2"/>}
                                    {editingSource ? 'Modifier' : 'Ajouter'} la source
                                </button_1.Button>
                            </dialog_1.DialogFooter>
                        </form>
                    </dialog_1.DialogContent>
                </dialog_1.Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <input_1.Input placeholder="Rechercher une source..." className="pl-10 h-11" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                    <lucide_react_1.Filter className="w-4 h-4 text-muted-foreground mr-1"/>
                    <select_1.Select value={selectedBrandFilter} onValueChange={setSelectedBrandFilter}>
                        <select_1.SelectTrigger className="h-11">
                            <select_1.SelectValue placeholder="Filtrer par marque"/>
                        </select_1.SelectTrigger>
                        <select_1.SelectContent>
                            <select_1.SelectItem value="all">Toutes les marques</select_1.SelectItem>
                            {brands.map(brand => (<select_1.SelectItem key={brand.id} value={brand.id}>{brand.name}</select_1.SelectItem>))}
                        </select_1.SelectContent>
                    </select_1.Select>
                </div>
            </div>

            {error && (<alert_1.Alert variant="destructive" className="mb-6">
                    <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
                </alert_1.Alert>)}

            {/* Grid */}
            {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (<card_1.Card key={i} className="animate-pulse h-32 bg-muted/50"/>))}
                </div>) : filteredSources.length === 0 ? (<div className="text-center py-20 bg-card border border-dashed rounded-xl">
                    <lucide_react_1.Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20"/>
                    <h3 className="text-lg font-medium">Aucune source trouvée</h3>
                    <p className="text-muted-foreground mb-6">
                        Configurez des sources pour commencer à collecter des mentions.
                    </p>
                </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSources.map((source) => (<card_1.Card key={source.id} className="group hover:shadow-md transition-all border-border/50">
                            <card_1.CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                                            {getSourceIcon(source.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm leading-none mb-1">{source.name}</h3>
                                            <badge_1.Badge variant="outline" className="text-[10px] h-4 px-1 py-0 font-normal">
                                                {source.type}
                                            </badge_1.Badge>
                                        </div>
                                    </div>
                                    <dropdown_menu_1.DropdownMenu>
                                        <dropdown_menu_1.DropdownMenuTrigger asChild>
                                            <button_1.Button variant="ghost" size="icon" className="h-8 w-8">
                                                <lucide_react_1.MoreVertical className="w-4 h-4"/>
                                            </button_1.Button>
                                        </dropdown_menu_1.DropdownMenuTrigger>
                                        <dropdown_menu_1.DropdownMenuContent align="end">
                                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleEditSource(source)}>
                                                <lucide_react_1.Edit2 className="w-4 h-4 mr-2"/> Modifier
                                            </dropdown_menu_1.DropdownMenuItem>
                                            <dropdown_menu_1.DropdownMenuItem onClick={() => handleDeleteSource(source.id)} className="text-destructive">
                                                <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Supprimer
                                            </dropdown_menu_1.DropdownMenuItem>
                                        </dropdown_menu_1.DropdownMenuContent>
                                    </dropdown_menu_1.DropdownMenu>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <lucide_react_1.ArrowRight className="w-3 h-3"/>
                                        <span className="font-medium text-foreground">Marque:</span>
                                        {source.brand?.name || 'Inconnue'}
                                    </div>

                                    {source.url && (<div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                            <lucide_react_1.Globe className="w-3 h-3"/>
                                            <span className="truncate">{source.url}</span>
                                        </div>)}

                                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {source.isActive ? (<>
                                                    <lucide_react_1.CheckCircle2 className="w-3 h-3 text-green-500"/>
                                                    <span className="text-[10px] text-green-600 font-medium">Actif</span>
                                                </>) : (<>
                                                    <lucide_react_1.XCircle className="w-3 h-3 text-slate-400"/>
                                                    <span className="text-[10px] text-slate-500 font-medium">Inactif</span>
                                                </>)}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            Synchro: Jamais
                                        </span>
                                    </div>
                                </div>
                            </card_1.CardContent>
                        </card_1.Card>))}
                </div>)}
        </div>);
}
