import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { KeywordTableRow } from "@/components/keywords/KeywordTableRow";
import { Plus, Search, Loader2, AlertCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    word: '',
    brandId: '',
    category: 'BRAND',
    priority: '2',
    isNegative: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [kwRes, brandsRes] = await Promise.all([
        apiClient.getKeywords(),
        apiClient.getBrands()
      ]);

      if (kwRes.success) setKeywords(kwRes.data);
      if (brandsRes.success) {
        setBrands(brandsRes.data);
        if (brandsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, brandId: brandsRes.data[0].id }));
        }
      }
    } catch (err: any) {
      console.error("Error loading data:", err);
      setError("Impossible de charger les mots-clés. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.createKeyword({
        ...formData,
        priority: parseInt(formData.priority)
      });

      if (response.success) {
        await fetchData();
        setIsDialogOpen(false);
        setFormData({ ...formData, word: '' });
      } else {
        throw new Error(response.error?.message || "Erreur lors de la création");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!confirm("Supprimer ce mot-clé ?")) return;
    try {
      const response = await apiClient.deleteKeyword(id);
      if (response.success) {
        setKeywords(keywords.filter(k => k.id !== id));
      }
    } catch (err) {
      console.error("Error deleting keyword:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
            🔑 Mots-clés & règles
          </h1>
          <p className="text-sm text-muted-foreground">
            Définissez les termes que nos algorithmes doivent surveiller
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau mot-clé
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un mot-clé de veille</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateKeyword} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="word">Mot ou expression *</Label>
                <Input
                  id="word"
                  value={formData.word}
                  onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                  placeholder="Ex: @AppleSupport ou iPhone 15"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Marque cible</Label>
                <Select value={formData.brandId} onValueChange={(v) => setFormData({ ...formData, brandId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRAND">Marque</SelectItem>
                      <SelectItem value="PRODUCT">Produit</SelectItem>
                      <SelectItem value="COMPETITOR">Concurrent</SelectItem>
                      <SelectItem value="INDUSTRY">Secteur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Basse</SelectItem>
                      <SelectItem value="2">Moyenne</SelectItem>
                      <SelectItem value="3">Haute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Ajouter
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Mots-clés</div>
          <div className="text-3xl font-bold">{keywords.length}</div>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Marques Surveillées</div>
          <div className="text-3xl font-bold">{new Set(keywords.map(k => k.brandId)).size}</div>
        </div>
        <div className="bg-card border rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Moy. Priorité</div>
          <div className="text-3xl font-bold">
            {keywords.length > 0
              ? (keywords.reduce((a, b) => a + (b.priority || 0), 0) / keywords.length).toFixed(1)
              : 0}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mot-clé / Règle</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marque</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priorité</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16"></td></tr>
                ))
              ) : keywords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <Key className="w-10 h-10 mx-auto mb-4 opacity-20 text-muted-foreground" />
                    <p className="text-muted-foreground font-medium">Aucun mot-clé configuré</p>
                  </td>
                </tr>
              ) : (
                keywords.map((kw) => (
                  <KeywordTableRow
                    key={kw.id}
                    id={kw.id}
                    word={kw.word}
                    category={kw.category}
                    brandName={kw.brand?.name}
                    priority={kw.priority}
                    onDelete={() => handleDeleteKeyword(kw.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}