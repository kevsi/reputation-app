"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = KeywordsPage;
const react_1 = require("react");
const api_client_1 = require("@/lib/api-client");
const KeywordTableRow_1 = require("@/components/keywords/KeywordTableRow");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const alert_1 = require("@/components/ui/alert");
const dialog_1 = require("@/components/ui/dialog");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
function KeywordsPage() {
    const [keywords, setKeywords] = (0, react_1.useState)([]);
    const [brands, setBrands] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
        word: '',
        brandId: '',
        category: 'BRAND',
        priority: '2',
        isNegative: false
    });
    (0, react_1.useEffect)(() => {
        fetchData();
    }, []);
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [kwRes, brandsRes] = await Promise.all([
                api_client_1.apiClient.getKeywords(),
                api_client_1.apiClient.getBrands()
            ]);
            if (kwRes.success)
                setKeywords(kwRes.data);
            if (brandsRes.success) {
                setBrands(brandsRes.data);
                if (brandsRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, brandId: brandsRes.data[0].id }));
                }
            }
        }
        catch (err) {
            console.error("Error loading data:", err);
            setError("Impossible de charger les mots-clés. Veuillez réessayer.");
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateKeyword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.createKeyword({
                ...formData,
                priority: parseInt(formData.priority)
            });
            if (response.success) {
                await fetchData();
                setIsDialogOpen(false);
                setFormData({ ...formData, word: '' });
            }
            else {
                throw new Error(response.error?.message || "Erreur lors de la création");
            }
        }
        catch (err) {
            setError(err.message || "Erreur lors de la création.");
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteKeyword = async (id) => {
        if (!confirm("Supprimer ce mot-clé ?"))
            return;
        try {
            const response = await api_client_1.apiClient.deleteKeyword(id);
            if (response.success) {
                setKeywords(keywords.filter(k => k.id !== id));
            }
        }
        catch (err) {
            console.error("Error deleting keyword:", err);
        }
    };
    return (<div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
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

        <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              Nouveau mot-clé
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent>
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Ajouter un mot-clé de veille</dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <form onSubmit={handleCreateKeyword} className="space-y-4 py-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="word">Mot ou expression *</label_1.Label>
                <input_1.Input id="word" value={formData.word} onChange={(e) => setFormData({ ...formData, word: e.target.value })} placeholder="Ex: @AppleSupport ou iPhone 15" required/>
              </div>

              <div className="space-y-2">
                <label_1.Label>Marque cible</label_1.Label>
                <select_1.Select value={formData.brandId} onValueChange={(v) => setFormData({ ...formData, brandId: v })}>
                  <select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {brands.map(b => (<select_1.SelectItem key={b.id} value={b.id}>{b.name}</select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label>Catégorie</label_1.Label>
                  <select_1.Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="BRAND">Marque</select_1.SelectItem>
                      <select_1.SelectItem value="PRODUCT">Produit</select_1.SelectItem>
                      <select_1.SelectItem value="COMPETITOR">Concurrent</select_1.SelectItem>
                      <select_1.SelectItem value="INDUSTRY">Secteur</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
                <div className="space-y-2">
                  <label_1.Label>Priorité</label_1.Label>
                  <select_1.Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="1">Basse</select_1.SelectItem>
                      <select_1.SelectItem value="2">Moyenne</select_1.SelectItem>
                      <select_1.SelectItem value="3">Haute</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <dialog_1.DialogFooter className="pt-4">
                <button_1.Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</button_1.Button>
                <button_1.Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : <lucide_react_1.Plus className="w-4 h-4 mr-2"/>}
                  Ajouter
                </button_1.Button>
              </dialog_1.DialogFooter>
            </form>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      {error && (<alert_1.Alert variant="destructive" className="mb-6">
          <lucide_react_1.AlertCircle className="w-4 h-4"/>
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>)}

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
              {isLoading ? (Array.from({ length: 3 }).map((_, i) => (<tr key={i} className="animate-pulse"><td colSpan={5} className="h-16"></td></tr>))) : keywords.length === 0 ? (<tr>
                  <td colSpan={5} className="text-center py-20">
                    <lucide_react_1.Key className="w-10 h-10 mx-auto mb-4 opacity-20 text-muted-foreground"/>
                    <p className="text-muted-foreground font-medium">Aucun mot-clé configuré</p>
                  </td>
                </tr>) : (keywords.map((kw) => (<KeywordTableRow_1.KeywordTableRow key={kw.id} id={kw.id} word={kw.word} category={kw.category} brandName={kw.brand?.name} priority={kw.priority} onDelete={() => handleDeleteKeyword(kw.id)}/>)))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
