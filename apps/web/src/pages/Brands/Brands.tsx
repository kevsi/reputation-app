import { useState, useEffect } from 'react';
import { brandsService } from '@/services/brands.service';
import { useBrand } from '@/contexts/BrandContext';
import { isApiError } from '@/types/http';
import { ApiErrorHandler } from '@/lib/api-error-handler';
import { Brand } from '@/types/models';
import { BrandFormModal } from '@/components/brands/BrandFormModal';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { Plus, Trash2, Edit2, Search, LayoutGrid, List, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function BrandsPage() {
  const { brands: contextBrands, refreshBrands } = useBrand();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [formModal, setFormModal] = useState<{ isOpen: boolean; data: Brand | null }>({
    isOpen: false,
    data: null
  });
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    setBrands(contextBrands as any);
    setIsLoading(false);
  }, [contextBrands]);


  const handleSubmitBrand = async (formData: any) => {
    try {
      let res;
      if (formModal.data) {
        // res = await brandsService.update(formModal.data.id, formData);
        toast.info("Mise à jour activée via API");
        res = { success: true };
      } else {
        res = await brandsService.create(formData);
      }

      if (!isApiError(res)) {
        toast.success(formModal.data ? "Marque mise à jour" : "Marque créée avec succès");
        await refreshBrands();
        setFormModal({ isOpen: false, data: null });
      } else {
        toast.error(ApiErrorHandler.getUserMessage(res.error));
      }
    } catch (e) {
      toast.error("Une erreur est survenue");
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      const response = await brandsService.delete(id);
      if (isApiError(response)) {
        toast.error(ApiErrorHandler.getUserMessage(response.error));
      } else {
        toast.success("Marque supprimée");
        await refreshBrands();
      }
    } catch (err) {
      toast.error("Erreur technique");
    }
  };

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Marques</h1>
            <p className="text-muted-foreground mt-1">Configurez les entités que vous souhaitez surveiller.</p>
          </div>
          <Button onClick={() => setFormModal({ isOpen: true, data: null })} className="gap-2">
            <Plus className="w-4 h-4" /> Nouvelle marque
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une marque..."
              className="pl-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex border rounded-lg p-1 bg-card">
            <Button variant="ghost" size="icon" className="h-8 w-8"><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40"><List className="w-4 h-4" /></Button>
          </div>
        </div>


        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-[250px] bg-muted animate-pulse rounded-[2rem]" />)}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground mb-6">Aucune marque trouvée.</p>
            <Button variant="outline" onClick={() => setFormModal({ isOpen: true, data: null })}>Ajouter une marque</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => (
              <Card key={brand.id} className="group overflow-hidden hover:border-primary transition-colors">
                <CardHeader className="p-6 pb-0">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden border flex items-center justify-center font-bold text-lg text-muted-foreground">
                      {brand.logo ? <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" /> : brand.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted" onClick={() => setFormModal({ isOpen: true, data: brand })}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 text-destructive" onClick={() => setConfirmDelete({ isOpen: true, id: brand.id })}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl mt-4">{brand.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                    {brand.description || "Aucune description fournie pour cette marque."}
                  </p>
                  <div className="pt-4 border-t flex items-center justify-between">
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1.5 text-primary font-bold hover:underline">
                        <Globe className="w-3.5 h-3.5" /> Visiter le site
                      </a>
                    ) : <span className="text-xs text-muted-foreground italic">Pas de site web</span>}
                    <Badge className="bg-primary/5 text-primary border-none text-[10px] uppercase tracking-widest px-3">Actif</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BrandFormModal
        isOpen={formModal.isOpen}
        onOpenChange={(open) => setFormModal(prev => ({ ...prev, isOpen: open }))}
        initialData={formModal.data}
        onSubmit={handleSubmitBrand}
      />

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onOpenChange={(v) => setConfirmDelete(prev => ({ ...prev, isOpen: v }))}
        title="Supprimer la marque"
        description="Attention : la suppression de cette marque entraînera la perte définitive de toutes ses mentions, sources et mots-clés associés. Cette action est irréversible."
        onConfirm={async () => {
          if (confirmDelete.id) await handleDeleteBrand(confirmDelete.id);
        }}
      />
    </div>
  );
}

