"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BrandsPage;
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
const label_1 = require("@/components/ui/label");
const badge_1 = require("@/components/ui/badge");
const alert_1 = require("@/components/ui/alert");
function BrandsPage() {
    const { user } = (0, AuthContext_1.useAuth)();
    const [brands, setBrands] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [editingBrand, setEditingBrand] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        description: '',
        website: '',
        logo: ''
    });
    (0, react_1.useEffect)(() => {
        fetchBrands();
    }, []);
    const fetchBrands = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.getBrands();
            if (response.success) {
                setBrands(response.data);
            }
            else {
                throw new Error('Failed to fetch brands');
            }
        }
        catch (err) {
            console.error('Error loading brands:', err);
            setError('Impossible de charger les marques. Veuillez réessayer.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateBrand = async (e) => {
        e.preventDefault();
        if (!user?.organizationId) {
            setError("Erreur : Aucune organisation associée à votre compte.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.createBrand({
                ...formData,
                organizationId: user.organizationId,
                isActive: true
            });
            if (response.success) {
                setBrands([response.data, ...brands]);
                setIsDialogOpen(false);
                setFormData({ name: '', description: '', website: '', logo: '' });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la création');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la création de la marque.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleEditBrand = (brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            description: brand.description || '',
            website: brand.website || '',
            logo: brand.logo || ''
        });
        setIsDialogOpen(true);
    };
    const handleUpdateBrand = async (e) => {
        e.preventDefault();
        if (!editingBrand)
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.updateBrand(editingBrand.id, formData);
            if (response.success) {
                setBrands(brands.map(b => b.id === editingBrand.id ? { ...b, ...formData } : b));
                setIsDialogOpen(false);
                setEditingBrand(null);
                setFormData({ name: '', description: '', website: '', logo: '' });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la mise à jour');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la mise à jour de la marque.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteBrand = async (brandId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette marque ?'))
            return;
        try {
            const response = await api_client_1.apiClient.deleteBrand(brandId);
            if (response.success) {
                setBrands(brands.filter(b => b.id !== brandId));
            }
            else {
                throw new Error('Failed to delete brand');
            }
        }
        catch (err) {
            console.error('Error deleting brand:', err);
            setError('Erreur lors de la suppression de la marque.');
        }
    };
    const filteredBrands = brands.filter(brand => brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    return (<div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestion des Marques</h1>
                    <p className="text-sm text-muted-foreground">
                        Gérez les marques et entités que vous surveillez
                    </p>
                </div>

                <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <dialog_1.DialogTrigger asChild>
                        <button_1.Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-all">
                            <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                            Ajouter une marque
                        </button_1.Button>
                    </dialog_1.DialogTrigger>
                    <dialog_1.DialogContent className="sm:max-w-[500px]">
                        <dialog_1.DialogHeader>
                            <dialog_1.DialogTitle>
                                {editingBrand ? 'Modifier la marque' : 'Ajouter une nouvelle marque'}
                            </dialog_1.DialogTitle>
                        </dialog_1.DialogHeader>
                        <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label_1.Label htmlFor="name">Nom de la marque *</label_1.Label>
                                <input_1.Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Apple, Nike, My Startup" required/>
                            </div>
                            <div className="space-y-2">
                                <label_1.Label htmlFor="description">Description (Optionnelle)</label_1.Label>
                                <textarea_1.Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brève description de la marque..." className="resize-none"/>
                            </div>
                            <div className="space-y-2">
                                <label_1.Label htmlFor="website">Site Web (Optionnel)</label_1.Label>
                                <input_1.Input id="website" type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com"/>
                            </div>
                            <div className="space-y-2">
                                <label_1.Label htmlFor="logo">Logo URL (Optionnel)</label_1.Label>
                                <input_1.Input id="logo" type="url" value={formData.logo} onChange={(e) => setFormData({ ...formData, logo: e.target.value })} placeholder="https://example.com/logo.png"/>
                            </div>
                            <dialog_1.DialogFooter className="pt-4">
                                <button_1.Button type="button" variant="ghost" onClick={() => {
            setIsDialogOpen(false);
            setEditingBrand(null);
            setFormData({ name: '', description: '', website: '', logo: '' });
        }}>Annuler</button_1.Button>
                                <button_1.Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    {isSubmitting ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : <lucide_react_1.Plus className="w-4 h-4 mr-2"/>}
                                    {editingBrand ? 'Modifier' : 'Créer'} la marque
                                </button_1.Button>
                            </dialog_1.DialogFooter>
                        </form>
                    </dialog_1.DialogContent>
                </dialog_1.Dialog>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <lucide_react_1.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <input_1.Input placeholder="Rechercher une marque..." className="pl-10 h-11" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                </div>
            </div>

            {error && (<alert_1.Alert variant="destructive" className="mb-6">
                    <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
                </alert_1.Alert>)}

            {/* Content */}
            {isLoading ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (<card_1.Card key={i} className="animate-pulse h-48 bg-muted/50"/>))}
                </div>) : filteredBrands.length === 0 ? (<div className="text-center py-20 bg-card border border-dashed rounded-xl">
                    <lucide_react_1.Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20"/>
                    <h3 className="text-lg font-medium">Aucune marque trouvée</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchQuery ? 'Essayez une autre recherche' : 'Commencez par ajouter votre première marque'}
                    </p>
                    {!searchQuery && (<button_1.Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                            Ajouter une marque
                        </button_1.Button>)}
                </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBrands.map((brand) => (<card_1.Card key={brand.id} className="overflow-hidden group hover:shadow-lg transition-all border-border/50">
                            <card_1.CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-2xl border border-blue-100">
                                            {brand.logo ? (<img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain"/>) : (<span>🏢</span>)}
                                        </div>
                                        <dropdown_menu_1.DropdownMenu>
                                            <dropdown_menu_1.DropdownMenuTrigger asChild>
                                                <button_1.Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <lucide_react_1.MoreVertical className="w-4 h-4"/>
                                                </button_1.Button>
                                            </dropdown_menu_1.DropdownMenuTrigger>
                                            <dropdown_menu_1.DropdownMenuContent align="end">
                                                <dropdown_menu_1.DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                                                    <lucide_react_1.Edit2 className="w-4 h-4 mr-2"/> Modifier
                                                </dropdown_menu_1.DropdownMenuItem>
                                                <dropdown_menu_1.DropdownMenuItem onClick={() => handleDeleteBrand(brand.id)} className="text-destructive">
                                                    <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Supprimer
                                                </dropdown_menu_1.DropdownMenuItem>
                                            </dropdown_menu_1.DropdownMenuContent>
                                        </dropdown_menu_1.DropdownMenu>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            {brand.name}
                                            {brand.isActive ? (<lucide_react_1.CheckCircle2 className="w-4 h-4 text-green-500"/>) : (<lucide_react_1.XCircle className="w-4 h-4 text-slate-300"/>)}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                            {brand.description || 'Aucune description fournie.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {brand.website && (<badge_1.Badge variant="secondary" className="flex items-center gap-1 font-normal">
                                                <lucide_react_1.Globe className="w-3 h-3"/>
                                                {new URL(brand.website).hostname}
                                            </badge_1.Badge>)}
                                        <badge_1.Badge variant="outline" className="font-normal capitalize">
                                            ID: {brand.id.substring(0, 8)}
                                        </badge_1.Badge>
                                    </div>

                                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Créé le {new Date(brand.createdAt).toLocaleDateString()}
                                        </span>
                                        <button_1.Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50">
                                            Voir détails
                                            <lucide_react_1.ExternalLink className="w-3 h-3 ml-2"/>
                                        </button_1.Button>
                                    </div>
                                </div>
                            </card_1.CardContent>
                        </card_1.Card>))}
                </div>)}
        </div>);
}
