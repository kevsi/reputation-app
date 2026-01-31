import { useEffect, useState, useMemo, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import { useBrand } from "@/contexts/BrandContext";
import { useBrandListener } from "@/hooks/useBrandListener";
import {
  Plus,
  Loader2,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  CheckSquare,
  Square,
  SortAsc,
  SortDesc,
  Tag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface KeywordStats {
  total: number;
  active: number;
  duplicates: number;
  avgLength: number;
}

type SortOption = 'name-asc' | 'name-desc' | 'length-asc' | 'length-desc' | 'recent';
type FilterOption = 'all' | 'active' | 'duplicates' | 'long' | 'short';

export default function Keywords() {
  // const { user } = useAuth();
  const { selectedBrand } = useBrand();
  // const [brands, setBrands] = useState<Brand[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  // const [loadingBrands, setLoadingBrands] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [bulkKeywords, setBulkKeywords] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState<string>(selectedBrand?.id || "");

  // Nouvelles fonctionnalités
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('name-asc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [keywordToDelete, setKeywordToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");

  const fetchKeywords = useCallback(async () => {
    if (!selectedBrand) return;

    setLoading(true);
    try {
      const res = await apiClient.getKeywords(selectedBrand.id);
      const keywordsData = res && typeof res === 'object' && 'data' in res ? res.data : res;
      setKeywords(Array.isArray(keywordsData) ? (keywordsData as string[]) : []);
    } catch (err) {
      // Error silently handled
      setError("Impossible de charger les mots-clés");
    } finally {
      setLoading(false);
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedBrand) {
      fetchKeywords();
    }
  }, [selectedBrand, fetchKeywords]);

  // Écouter les changements de brand
  useBrandListener(async () => {
    await fetchKeywords();
  });

  // Statistiques calculées
  const stats: KeywordStats = useMemo(() => {
    const total = keywords.length;
    const uniqueKeywords = new Set(keywords.map(k => k.toLowerCase()));
    const duplicates = total - uniqueKeywords.size;
    const avgLength = total > 0 ? Math.round(keywords.reduce((sum, k) => sum + k.length, 0) / total) : 0;

    return {
      total,
      active: total, // Pour l'instant, tous sont actifs
      duplicates,
      avgLength
    };
  }, [keywords]);

  // Mots-clés filtrés et triés
  const filteredAndSortedKeywords = useMemo(() => {
    let filtered = keywords.filter(keyword => {
      // Filtre de recherche
      if (searchTerm && !keyword.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtres avancés
      switch (filterBy) {
        case 'duplicates':
          const count = keywords.filter(k => k.toLowerCase() === keyword.toLowerCase()).length;
          return count > 1;
        case 'long':
          return keyword.length > 20;
        case 'short':
          return keyword.length < 5;
        default:
          return true;
      }
    });

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.localeCompare(b);
        case 'name-desc':
          return b.localeCompare(a);
        case 'length-asc':
          return a.length - b.length;
        case 'length-desc':
          return b.length - a.length;
        case 'recent':
          // Pour l'instant, tri alphabétique (on pourrait ajouter des dates)
          return a.localeCompare(b);
        default:
          return 0;
      }
    });

    return filtered;
  }, [keywords, searchTerm, sortBy, filterBy]);

  const validateKeyword = (keyword: string): string | null => {
    if (!keyword.trim()) return "Le mot-clé ne peut pas être vide";
    if (keyword.length < 2) return "Le mot-clé doit contenir au moins 2 caractères";
    if (keyword.length > 100) return "Le mot-clé ne peut pas dépasser 100 caractères";
    if (keywords.some(k => k.toLowerCase() === keyword.toLowerCase() && k !== editingKeyword)) {
      return "Ce mot-clé existe déjà";
    }
    return null;
  };

  const handleAddKeyword = async () => {
    const validationError = validateKeyword(newKeyword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!selectedBrandId) return;

    try {
      setError("");
      const response = await apiClient.createKeyword({
        brandId: selectedBrandId,
        keyword: newKeyword.trim()
      });
      if (response.success) {
        setKeywords([...keywords, newKeyword.trim()]);
        setNewKeyword("");
        setDialogOpen(false);
        setSuccess("Mot-clé ajouté avec succès");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Erreur lors de l'ajout du mot-clé");
      }
    } catch (error) {
      console.error("Error adding keyword:", error);
      setError("Erreur lors de l'ajout du mot-clé");
    }
  };

  const handleBulkAddKeywords = async () => {
    const keywordList = bulkKeywords.split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywordList.length === 0) {
      setError("Aucun mot-clé valide trouvé");
      return;
    }

    const invalidKeywords: string[] = [];
    const validKeywords: string[] = [];

    keywordList.forEach(keyword => {
      const validationError = validateKeyword(keyword);
      if (validationError) {
        invalidKeywords.push(`${keyword}: ${validationError}`);
      } else {
        validKeywords.push(keyword);
      }
    });

    if (invalidKeywords.length > 0) {
      setError(`Mots-clés invalides:\n${invalidKeywords.join('\n')}`);
      return;
    }

    try {
      setError("");
      let successCount = 0;
      for (const keyword of validKeywords) {
        const response = await apiClient.createKeyword({
          brandId: selectedBrandId,
          keyword
        });
        if (response.success) {
          successCount++;
        }
      }

      if (successCount > 0) {
        setKeywords([...keywords, ...validKeywords]);
        setBulkKeywords("");
        setSuccess(`${successCount} mot(s)-clé ajouté(s) avec succès`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error bulk adding keywords:", error);
      setError("Erreur lors de l'ajout en masse");
    }
  };

  const handleEditKeyword = async () => {
    const validationError = validateKeyword(newKeyword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!editingKeyword || !selectedBrandId) return;

    try {
      setError("");
      // Remove old keyword
      await apiClient.deleteKeyword({
        brandId: selectedBrandId,
        keyword: editingKeyword
      });
      // Add new keyword
      const response = await apiClient.createKeyword({
        brandId: selectedBrandId,
        keyword: newKeyword.trim()
      });
      if (response.success) {
        setKeywords(keywords.map(k => k === editingKeyword ? newKeyword.trim() : k));
        setNewKeyword("");
        setEditingKeyword(null);
        setDialogOpen(false);
        setSuccess("Mot-clé modifié avec succès");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Erreur lors de la modification du mot-clé");
      }
    } catch (error) {
      console.error("Error editing keyword:", error);
      setError("Erreur lors de la modification du mot-clé");
    }
  };

  const handleDeleteKeyword = async (keyword: string) => {
    if (!selectedBrandId) return;

    try {
      setError("");
      const response = await apiClient.deleteKeyword({
        brandId: selectedBrandId,
        keyword
      });
      if (response.success) {
        setKeywords(keywords.filter(k => k !== keyword));
        setSelectedKeywords(prev => {
          const newSet = new Set(prev);
          newSet.delete(keyword);
          return newSet;
        });
        setSuccess("Mot-clé supprimé avec succès");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Erreur lors de la suppression du mot-clé");
      }
    } catch (error) {
      console.error("Error deleting keyword:", error);
      setError("Erreur lors de la suppression du mot-clé");
    }
  };

  const confirmDeleteKeyword = (keyword: string) => {
    setKeywordToDelete(keyword);
    setDeleteDialogOpen(true);
  };

  const executeDeleteKeyword = async () => {
    if (keywordToDelete) {
      await handleDeleteKeyword(keywordToDelete);
      setKeywordToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedKeywords.size === 0 || !selectedBrandId) return;

    try {
      setError("");
      let successCount = 0;
      for (const keyword of selectedKeywords) {
        const response = await apiClient.deleteKeyword({
          brandId: selectedBrandId,
          keyword
        });
        if (response.success) {
          successCount++;
        }
      }

      if (successCount > 0) {
        setKeywords(keywords.filter(k => !selectedKeywords.has(k)));
        setSelectedKeywords(new Set());
        setSuccess(`${successCount} mot(s)-clé supprimé(s) avec succès`);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      console.error("Error bulk deleting keywords:", error);
      setError("Erreur lors de la suppression en masse");
    }
  };

  const confirmBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const executeBulkDelete = async () => {
    await handleBulkDelete();
    setBulkDeleteDialogOpen(false);
  };

  const exportKeywords = () => {
    const dataStr = filteredAndSortedKeywords.join('\n');
    const dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `keywords-${selectedBrand?.name || 'export'}.txt`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyword)) {
        newSet.delete(keyword);
      } else {
        newSet.add(keyword);
      }
      return newSet;
    });
  };

  const toggleAllSelection = () => {
    if (selectedKeywords.size === filteredAndSortedKeywords.length) {
      setSelectedKeywords(new Set());
    } else {
      setSelectedKeywords(new Set(filteredAndSortedKeywords));
    }
  };

  const openEditDialog = (keyword: string) => {
    setEditingKeyword(keyword);
    setNewKeyword(keyword);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingKeyword(null);
    setNewKeyword("");
    setDialogOpen(true);
  };

  // if (loadingBrands) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //     </div>
  //   );
  // }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Mots Clés</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportKeywords} disabled={!selectedBrandId}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Messages de succès/erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      {selectedBrandId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doublons</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.duplicates}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longueur Moy.</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgLength} chars</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sélection de marque */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>Sélectionnez une marque pour gérer ses mots-clés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="brand-select">Marque</Label>
              {/* {brands.length > 0 ? (
                <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez une marque" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                  placeholder="ID de la marque"
                />
              )} */}
              <Input
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                placeholder="ID de la marque"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedBrandId && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="list">Liste des mots-clés</TabsTrigger>
            <TabsTrigger value="bulk">Ajout en masse</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {/* Barre d'outils */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Recherche */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher des mots-clés..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    {/* Filtre */}
                    <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous</SelectItem>
                        <SelectItem value="duplicates">Doublons</SelectItem>
                        <SelectItem value="long">Longs (&gt;20 chars)</SelectItem>
                        <SelectItem value="short">Courts (&lt;5 chars)</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Tri */}
                    <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                      <SelectTrigger className="w-40">
                        {sortBy.includes('desc') ? <SortDesc className="h-4 w-4 mr-2" /> : <SortAsc className="h-4 w-4 mr-2" />}
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name-asc">Nom A-Z</SelectItem>
                        <SelectItem value="name-desc">Nom Z-A</SelectItem>
                        <SelectItem value="length-asc">Longueur ↑</SelectItem>
                        <SelectItem value="length-desc">Longueur ↓</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    {selectedKeywords.size > 0 && (
                      <Button variant="destructive" onClick={confirmBulkDelete}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer ({selectedKeywords.size})
                      </Button>
                    )}

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={openAddDialog}>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingKeyword ? "Modifier le mot-clé" : "Ajouter un mot-clé"}
                          </DialogTitle>
                          <DialogDescription>
                            {editingKeyword ? "Modifiez le mot-clé ci-dessous." : "Entrez le nouveau mot-clé ci-dessous."}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="keyword">Mot-clé</Label>
                            <Input
                              id="keyword"
                              value={newKeyword}
                              onChange={(e) => setNewKeyword(e.target.value)}
                              placeholder="Entrez un mot-clé"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                          </Button>
                          <Button onClick={editingKeyword ? handleEditKeyword : handleAddKeyword}>
                            {editingKeyword ? "Modifier" : "Ajouter"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des mots-clés */}
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Mots-clés ({filteredAndSortedKeywords.length})</CardTitle>
                      <CardDescription>
                        {selectedBrand ? `Pour ${selectedBrand.name}` : ''}
                        {searchTerm && ` • Filtré par "${searchTerm}"`}
                      </CardDescription>
                    </div>
                    {filteredAndSortedKeywords.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleAllSelection}
                      >
                        {selectedKeywords.size === filteredAndSortedKeywords.length ? (
                          <CheckSquare className="h-4 w-4 mr-2" />
                        ) : (
                          <Square className="h-4 w-4 mr-2" />
                        )}
                        Tout sélectionner
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredAndSortedKeywords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {keywords.length === 0 ? (
                        "Aucun mot-clé trouvé. Ajoutez-en un pour commencer."
                      ) : (
                        "Aucun mot-clé ne correspond aux filtres actuels."
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredAndSortedKeywords.map((keyword, index) => {
                        const isDuplicate = keywords.filter(k => k.toLowerCase() === keyword.toLowerCase()).length > 1;
                        const isSelected = selectedKeywords.has(keyword);

                        return (
                          <div
                            key={`${keyword}-${index}`}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                              isSelected ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleKeywordSelection(keyword)}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{keyword}</span>
                                  {isDuplicate && (
                                    <Badge variant="destructive" className="text-xs">
                                      Doublon
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {keyword.length} chars
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(keyword)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmDeleteKeyword(keyword)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ajout en masse</CardTitle>
                <CardDescription>
                  Ajoutez plusieurs mots-clés à la fois. Un mot-clé par ligne.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bulk-keywords">Mots-clés (un par ligne)</Label>
                  <Textarea
                    id="bulk-keywords"
                    value={bulkKeywords}
                    onChange={(e) => setBulkKeywords(e.target.value)}
                    placeholder="mot-clé 1&#10;mot-clé 2&#10;mot-clé 3"
                    rows={10}
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBulkAddKeywords} disabled={!bulkKeywords.trim()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Ajouter en masse
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setBulkKeywords("")}
                    disabled={!bulkKeywords.trim()}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Effacer
                  </Button>
                </div>
                {bulkKeywords.trim() && (
                  <div className="text-sm text-muted-foreground">
                    {bulkKeywords.split('\n').filter(k => k.trim()).length} mot(s)-clé détecté(s)
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!selectedBrandId && (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            Veuillez sélectionner une marque pour gérer les mots-clés.
          </CardContent>
        </Card>
      )}

      {/* Dialogue de confirmation de suppression individuelle */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le mot-clé "{keywordToDelete}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={executeDeleteKeyword}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression en masse */}
      <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression en masse</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedKeywords.size} mot(s)-clé(s) ?
              Cette action est irréversible.
              <br />
              <br />
              <strong>Mots-clés à supprimer :</strong>
              <div className="mt-2 max-h-32 overflow-y-auto">
                <ul className="list-disc list-inside text-sm">
                  {Array.from(selectedKeywords).map(keyword => (
                    <li key={keyword} className="text-muted-foreground">{keyword}</li>
                  ))}
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={executeBulkDelete}>
              Supprimer {selectedKeywords.size} mot(s)-clé(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}