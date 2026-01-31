import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useBrand } from '@/contexts/BrandContext';
import type { Brand } from '@/types/models';
import { Plus, Trash2, Edit2, Search, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function BrandsPage() {
  // const { user } = useAuth();
  const { brands: contextBrands, refreshBrands } = useBrand();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [maxBrandsWarning, setMaxBrandsWarning] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo: ''
  });

  useEffect(() => {
    // Sync with context brands
    setBrands(contextBrands);
    setIsLoading(false);
  }, [contextBrands]);

  useEffect(() => {
    // Initial load
    refreshBrands();
  }, [refreshBrands]);

  const fetchBrands = async () => {
    setIsLoading(true);
    setError(null);
    setMaxBrandsWarning(null);
    try {
      const response = await apiClient.getBrands();
      if (response.success) {
        setBrands(response.data as Brand[]);
      } else {
        throw new Error(response.error?.message || 'Erreur lors du chargement');
      }
    } catch (err: any) {
      const errorMsg = err.error?.message || err.message || 'Erreur lors du chargement des marques';
      if (errorMsg.includes('limit') || errorMsg.includes('quota') || errorMsg.includes('MAX_BRANDS')) {
        setMaxBrandsWarning(errorMsg);
      } else {
        setError(errorMsg);
      }
      // Error fetching brands
    
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.createBrand({
        name: formData.name,
        description: formData.description || undefined,
        website: formData.website || undefined,
        logo: formData.logo || undefined
      });

      if (response.success) {
        // Refresh brands in context and local state
        await refreshBrands();
        await fetchBrands();
        setIsDialogOpen(false);
        setFormData({ name: '', description: '', website: '', logo: '' });
      } else {
        throw new Error(response.error?.message || 'Erreur lors de la création');
      }
    } catch (err: any) {
      const errorMsg = err.error?.message || err.message || 'Erreur lors de la création';
      if (errorMsg.includes('limit') || errorMsg.includes('quota') || errorMsg.includes('MAX_BRANDS')) {
        setMaxBrandsWarning(errorMsg);
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) return;

    try {
      const response = await apiClient.deleteBrand(id);
      if (response.success) {
        setBrands(brands.filter(b => b.id !== id));
      } else {
        setError(response.error?.message || 'Erreur lors de la suppression');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">Marques</h1>
            <p className="text-sm text-muted-foreground">Gérez les marques que vous surveillez</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Nouvelle marque
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle marque</DialogTitle>
                <DialogDescription>
                  Ajoutez une nouvelle marque à surveiller
                </DialogDescription>
              </DialogHeader>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleCreateBrand} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de la marque *</Label>
                  <Input
                    id="name"
                    placeholder="ex: Nike"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Description de votre marque..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">URL du logo</Label>
                  <Input
                    id="logo"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Création..." : "Créer"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Alerts */}
        {maxBrandsWarning && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {maxBrandsWarning}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une marque..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Brands Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {brands.length === 0 ? 'Aucune marque créée' : 'Aucune marque trouvée'}
            </p>
            {brands.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Créez votre première marque pour commencer à surveiller
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBrands.map((brand) => (
              <Card key={brand.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{brand.name}</CardTitle>
                      {brand.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {brand.description}
                        </p>
                      )}
                    </div>
                    {brand.logo && (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-10 h-10 rounded-lg object-cover ml-2"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      {brand.website}
                    </a>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      disabled
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      onClick={() => handleDeleteBrand(brand.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
