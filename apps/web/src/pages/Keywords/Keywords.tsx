import { useEffect, useState, useMemo, useCallback } from "react";
import { keywordsService } from "@/services/keywords.service";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { isApiError } from "@/types/http";
import { ApiErrorHandler } from "@/lib/api-error-handler";
import {
  Plus, Loader2, Trash2, Search,
  Tag, AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { KeywordDetail } from "@/types/api";

type SortOption = 'name-asc' | 'name-desc' | 'recent';

export default function KeywordsPage() {
  const { selectedBrand } = useBrand();

  // State
  const [keywords, setKeywords] = useState<KeywordDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [activeTab, setActiveTab] = useState("list");

  // Dialog & Modal State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [bulkKeywords, setBulkKeywords] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  const fetchKeywords = useCallback(async () => {
    if (!selectedBrand) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await keywordsService.getAll(selectedBrand.id);

      if (!isApiError(response) && response.data) {
        setKeywords(response.data);
      } else if (isApiError(response)) {
        setError(ApiErrorHandler.getUserMessage(response.error));
      }
    } catch (err) {
      setError("Erreur technique");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => { fetchKeywords(); }, [fetchKeywords]);
  useBrandListener(async () => { await fetchKeywords(); });

  const handleAddKeyword = async () => {
    if (!newKeyword.trim() || !selectedBrand) return;

    try {
      const response = await keywordsService.create({
        name: newKeyword.trim(),
        brandId: selectedBrand.id
      });

      if (!isApiError(response)) {
        setKeywords(prev => [...prev, response.data]);
        setNewKeyword("");
        setDialogOpen(false);
        toast.success("Mot-clé ajouté");
      } else {
        toast.error(ApiErrorHandler.getUserMessage(response.error));
      }
    } catch (err) {
      toast.error("Échec de l'ajout");
    }
  };

  const handleBulkAdd = async () => {
    if (isBulkAdding) return;
    const list = bulkKeywords.split('\n').map(k => k.trim()).filter(k => k.length > 0);
    if (list.length === 0 || !selectedBrand) return;

    setIsBulkAdding(true);
    try {
      let count = 0;
      for (const name of list) {
        const res = await keywordsService.create({ name, brandId: selectedBrand.id });
        if (!isApiError(res)) count++;
      }
      toast.success(`${count} mots-clés importés`);
      setBulkKeywords("");
      setActiveTab("list");
      fetchKeywords();
    } catch (err) {
      toast.error("Erreur import en masse");
    } finally {
      setIsBulkAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const response = await keywordsService.delete(id);
      if (!isApiError(response)) {
        setKeywords(prev => prev.filter(k => k.id !== id));
        toast.success("Mot-clé supprimé");
      }
    } catch (err) {
      toast.error("Échec suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredKeywords = useMemo(() => {
    return keywords
      .filter(k => k.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
        return 0;
      });
  }, [keywords, searchTerm, sortBy]);

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mots-clés</h1>
            <p className="text-muted-foreground mt-1">Gérez les expressions surveillées pour {selectedBrand?.name}.</p>
          </div>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Ajouter
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-10 rounded-[2rem]">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">Liste des termes</TabsTrigger>
            <TabsTrigger value="bulk">Ajout groupé</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un mot-clé..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12"
                />
              </div>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Trier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">A-Z</SelectItem>
                  <SelectItem value="name-desc">Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-6">
              {loading ? (
                <div className="py-24 text-center">
                  <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                </div>
              ) : filteredKeywords.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed rounded-xl bg-muted/20">
                  <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">Aucun mot-clé.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredKeywords.map((k) => (
                    <div key={k.id} className="flex items-center justify-between p-4 bg-card border rounded-lg group">
                      <div className="flex items-center gap-3">
                        <Tag className="w-4 h-4 text-primary" />
                        <div>
                          <div className="font-medium">{k.name}</div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold px-2 py-0 h-4 mt-1">Sémantique</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDelete({ isOpen: true, id: k.id })} className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <Card>
              <CardHeader>
                <CardTitle>Ajout groupé</CardTitle>
                <CardDescription>
                  Ajoutez plusieurs mots-clés en les séparant par une nouvelle ligne.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Textarea
                  placeholder="ex:&#10;Nike&#10;Adidas&#10;Puma"
                  rows={8}
                  value={bulkKeywords}
                  onChange={(e) => setBulkKeywords(e.target.value)}
                />
                <Button onClick={handleBulkAdd} disabled={!bulkKeywords.trim()}>
                  Importer les mots-clés
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un mot-clé</DialogTitle>
            <DialogDescription>Entrez le nouveau terme à surveiller.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="kw-name">Mot-clé</Label>
            <Input
              id="kw-name"
              placeholder="ex: Nike"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleAddKeyword}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onOpenChange={(v) => setConfirmDelete(prev => ({ ...prev, isOpen: v }))}
        title="Supprimer le mot-clé"
        description="Cette expression ne sera plus surveillée. Les mentions déjà collectées resteront néanmoins dans votre historique."
        onConfirm={async () => {
          if (confirmDelete.id) await handleDelete(confirmDelete.id);
        }}
      />
    </div>
  );
}