import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    ExternalLink,
    Building2,
    Globe,
    CheckCircle2,
    XCircle,
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
    DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Brand {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logo: string | null;
    isActive: boolean;
    organizationId: string;
    createdAt: string;
}

export default function BrandsPage() {
    const { user } = useAuth();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        logo: ''
    });

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.getBrands();
            if (response.success) {
                setBrands(response.data);
            } else {
                throw new Error('Failed to fetch brands');
            }
        } catch (err: any) {
            console.error('Error loading brands:', err);
            setError('Impossible de charger les marques. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.organizationId) {
            setError("Erreur : Aucune organisation associée à votre compte.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiClient.createBrand({
                ...formData,
                organizationId: user.organizationId,
                isActive: true
            });

            if (response.success) {
                setBrands([response.data, ...brands]);
                setIsDialogOpen(false);
                setFormData({ name: '', description: '', website: '', logo: '' });
            } else {
                throw new Error(response.error?.message || 'Erreur lors de la création');
            }
        } catch (err: any) {
            setError(err.error?.message || err.message || 'Erreur lors de la création de la marque.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditBrand = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            description: brand.description || '',
            website: brand.website || '',
            logo: brand.logo || ''
        });
        setIsDialogOpen(true);
    };

    const handleUpdateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBrand) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiClient.updateBrand(editingBrand.id, formData);
            if (response.success) {
                setBrands(brands.map(b => b.id === editingBrand.id ? { ...b, ...formData } : b));
                setIsDialogOpen(false);
                setEditingBrand(null);
                setFormData({ name: '', description: '', website: '', logo: '' });
            } else {
                throw new Error(response.error?.message || 'Erreur lors de la mise à jour');
            }
        } catch (err: any) {
            setError(err.error?.message || err.message || 'Erreur lors de la mise à jour de la marque.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBrand = async (brandId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) return;

        try {
            const response = await apiClient.deleteBrand(brandId);
            if (response.success) {
                setBrands(brands.filter(b => b.id !== brandId));
            } else {
                throw new Error('Failed to delete brand');
            }
        } catch (err: any) {
            console.error('Error deleting brand:', err);
            setError('Erreur lors de la suppression de la marque.');
        }
    };

    const filteredBrands = brands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Gestion des Marques</h1>
                    <p className="text-sm text-muted-foreground">
                        Gérez les marques et entités que vous surveillez
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-all">
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter une marque
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingBrand ? 'Modifier la marque' : 'Ajouter une nouvelle marque'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom de la marque *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Apple, Nike, My Startup"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optionnelle)</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brève description de la marque..."
                                    className="resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="website">Site Web (Optionnel)</Label>
                                <Input
                                    id="website"
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="logo">Logo URL (Optionnel)</Label>
                                <Input
                                    id="logo"
                                    type="url"
                                    value={formData.logo}
                                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => {
                                    setIsDialogOpen(false);
                                    setEditingBrand(null);
                                    setFormData({ name: '', description: '', website: '', logo: '' });
                                }}>Annuler</Button>
                                <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingBrand ? 'Modifier' : 'Créer'} la marque
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une marque..."
                        className="pl-10 h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse h-48 bg-muted/50" />
                    ))}
                </div>
            ) : filteredBrands.length === 0 ? (
                <div className="text-center py-20 bg-card border border-dashed rounded-xl">
                    <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Aucune marque trouvée</h3>
                    <p className="text-muted-foreground mb-6">
                        {searchQuery ? 'Essayez une autre recherche' : 'Commencez par ajouter votre première marque'}
                    </p>
                    {!searchQuery && (
                        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                            Ajouter une marque
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBrands.map((brand) => (
                        <Card key={brand.id} className="overflow-hidden group hover:shadow-lg transition-all border-border/50">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-2xl border border-blue-100">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                                            ) : (
                                                <span>🏢</span>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                                                    <Edit2 className="w-4 h-4 mr-2" /> Modifier
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteBrand(brand.id)}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                                            {brand.name}
                                            {brand.isActive ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-slate-300" />
                                            )}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                            {brand.description || 'Aucune description fournie.'}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {brand.website && (
                                            <Badge variant="secondary" className="flex items-center gap-1 font-normal">
                                                <Globe className="w-3 h-3" />
                                                {new URL(brand.website).hostname}
                                            </Badge>
                                        )}
                                        <Badge variant="outline" className="font-normal capitalize">
                                            ID: {brand.id.substring(0, 8)}
                                        </Badge>
                                    </div>

                                    <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            Créé le {new Date(brand.createdAt).toLocaleDateString()}
                                        </span>
                                        <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50">
                                            Voir détails
                                            <ExternalLink className="w-3 h-3 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
