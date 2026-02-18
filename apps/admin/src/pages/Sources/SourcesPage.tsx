import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Globe,
    Database,
    CheckCircle2,
    XCircle,
    Loader2,
    Filter,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Source {
    id: string;
    name: string;
    type: string;
    url: string | null;
    isActive: boolean;
    brandId: string;
    brand?: {
        name: string;
    };
    createdAt: string;
}

interface Brand {
    id: string;
    name: string;
}

export default function SourcesPage() {
    const [sources, setSources] = useState<Source[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSource, setEditingSource] = useState<Source | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'TWITTER',
        url: '',
        brandId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [sourcesRes, brandsRes] = await Promise.all([
                apiClient.getSources(),
                apiClient.getBrands()
            ]);

            if (sourcesRes.success) setSources(sourcesRes.data);
            if (brandsRes.success) {
                setBrands(brandsRes.data);
                if (brandsRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, brandId: brandsRes.data[0].id }));
                }
            }
        } catch (err: any) {
            console.error('Error loading sources:', err);
            setError('Impossible de charger les données. Veuillez réessayer.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateSource = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiClient.createSource({
                ...formData,
                isActive: true
            });

            if (response.success) {
                // Refresh sources to get the brand details if included
                const updatedSources = await apiClient.getSources();
                if (updatedSources.success) setSources(updatedSources.data);

                setIsDialogOpen(false);
                setFormData({ ...formData, name: '', url: '' });
            } else {
                throw new Error(response.error?.message || 'Erreur lors de la création');
            }
        } catch (err: any) {
            setError(err.error?.message || err.message || 'Erreur lors de la création de la source.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditSource = (source: Source) => {
        setEditingSource(source);
        setFormData({
            name: source.name,
            type: source.type,
            url: source.url || '',
            brandId: source.brandId || ''
        });
        setIsDialogOpen(true);
    };

    const handleUpdateSource = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSource) return;

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await apiClient.updateSource(editingSource.id, formData);
            if (response.success) {
                // Refresh sources
                const updatedSources = await apiClient.getSources();
                if (updatedSources.success) setSources(updatedSources.data);

                setIsDialogOpen(false);
                setEditingSource(null);
                setFormData({ name: '', type: 'WEB', url: '', brandId: '' });
            } else {
                throw new Error(response.error?.message || 'Erreur lors de la mise à jour');
            }
        } catch (err: any) {
            setError(err.error?.message || err.message || 'Erreur lors de la mise à jour de la source.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSource = async (sourceId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette source ?')) return;

        try {
            const response = await apiClient.deleteSource(sourceId);
            if (response.success) {
                setSources(sources.filter(s => s.id !== sourceId));
            } else {
                throw new Error('Failed to delete source');
            }
        } catch (err: any) {
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

    const getSourceIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'TWITTER': return '❌';
            case 'REDDIT': return '🔴';
            case 'INSTAGRAM': return '📷';
            case 'TIKTOK': return '🎵';
            case 'WEB': return '🌐';
            default: return '🔌';
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Sources de Veille</h1>
                    <p className="text-sm text-muted-foreground">
                        Configurez les flux de données pour vos marques
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvelle Source
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingSource ? 'Modifier la source' : 'Ajouter une source de veille'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={editingSource ? handleUpdateSource : handleCreateSource} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="brandId">Marque concernée *</Label>
                                <Select
                                    value={formData.brandId}
                                    onValueChange={(val) => setFormData({ ...formData, brandId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une marque" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map(brand => (
                                            <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Type de source *</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Type de plateforme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TWITTER">X (Twitter)</SelectItem>
                                        <SelectItem value="REDDIT">Reddit</SelectItem>
                                        <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                                        <SelectItem value="TIKTOK">TikTok</SelectItem>
                                        <SelectItem value="WEB">Site Web / RSS</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nom de la source *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Compte Officiel, Hashtag #Launch"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="url">URL ou Identifiant (Optionnel)</Label>
                                <Input
                                    id="url"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="Ex: https://twitter.com/user ou @username"
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => {
                                    setIsDialogOpen(false);
                                    setEditingSource(null);
                                    setFormData({ name: '', type: 'TWITTER', url: '', brandId: '' });
                                }}>Annuler</Button>
                                <Button type="submit" disabled={isSubmitting || brands.length === 0} className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                    {editingSource ? 'Modifier' : 'Ajouter'} la source
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une source..."
                        className="pl-10 h-11"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                    <Filter className="w-4 h-4 text-muted-foreground mr-1" />
                    <Select value={selectedBrandFilter} onValueChange={setSelectedBrandFilter}>
                        <SelectTrigger className="h-11">
                            <SelectValue placeholder="Filtrer par marque" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les marques</SelectItem>
                            {brands.map(brand => (
                                <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse h-32 bg-muted/50" />
                    ))}
                </div>
            ) : filteredSources.length === 0 ? (
                <div className="text-center py-20 bg-card border border-dashed rounded-xl">
                    <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">Aucune source trouvée</h3>
                    <p className="text-muted-foreground mb-6">
                        Configurez des sources pour commencer à collecter des mentions.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSources.map((source) => (
                        <Card key={source.id} className="group hover:shadow-md transition-all border-border/50">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl">
                                            {getSourceIcon(source.type)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm leading-none mb-1">{source.name}</h3>
                                            <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 font-normal">
                                                {source.type}
                                            </Badge>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditSource(source)}>
                                                <Edit2 className="w-4 h-4 mr-2" /> Modifier
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDeleteSource(source.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <ArrowRight className="w-3 h-3" />
                                        <span className="font-medium text-foreground">Marque:</span>
                                        {source.brand?.name || 'Inconnue'}
                                    </div>

                                    {source.url && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                                            <Globe className="w-3 h-3" />
                                            <span className="truncate">{source.url}</span>
                                        </div>
                                    )}

                                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {source.isActive ? (
                                                <>
                                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                    <span className="text-[10px] text-green-600 font-medium">Actif</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] text-slate-500 font-medium">Inactif</span>
                                                </>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            Synchro: Jamais
                                        </span>
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
