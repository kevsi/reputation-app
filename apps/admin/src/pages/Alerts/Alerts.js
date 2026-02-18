"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AlertsPage;
const react_1 = require("react");
const api_client_1 = require("@/lib/api-client");
const AuthContext_1 = require("@/contexts/AuthContext");
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
const switch_1 = require("@/components/ui/switch");
function AlertsPage() {
    const { user } = (0, AuthContext_1.useAuth)();
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    const [brands, setBrands] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [isDialogOpen, setIsDialogOpen] = (0, react_1.useState)(false);
    const [editingAlert, setEditingAlert] = (0, react_1.useState)(null);
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        description: '',
        condition: 'NEGATIVE_SENTIMENT_THRESHOLD',
        threshold: 0.5,
        level: 'MEDIUM',
        brandId: ''
    });
    (0, react_1.useEffect)(() => {
        if (user?.organizationId) {
            fetchData();
        }
    }, [user]);
    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [alertsRes, brandsRes] = await Promise.all([
                api_client_1.apiClient.getAlerts({ organizationId: user?.organizationId }),
                api_client_1.apiClient.getBrands()
            ]);
            if (alertsRes.success)
                setAlerts(alertsRes.data);
            if (brandsRes.success) {
                setBrands(brandsRes.data);
                if (brandsRes.data.length > 0) {
                    setFormData(prev => ({ ...prev, brandId: brandsRes.data[0].id }));
                }
            }
        }
        catch (err) {
            console.error('Error loading data:', err);
            setError('Impossible de charger les alertes. Veuillez réessayer.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateAlert = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.createAlert({
                ...formData,
                threshold: Number(formData.threshold),
                isActive: true
            });
            if (response.success) {
                await fetchData(); // Refresh list to get associations
                setIsDialogOpen(false);
                setFormData({ ...formData, name: '', description: '' });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la création');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la création.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleToggleActive = async (id, currentStatus) => {
        try {
            const response = await api_client_1.apiClient.updateAlert(id, { isActive: !currentStatus });
            if (response.success) {
                setAlerts(alerts.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
            }
        }
        catch (err) {
            console.error('Error toggling alert status:', err);
        }
    };
    const handleEditAlert = (alert) => {
        setEditingAlert(alert);
        setFormData({
            name: alert.name,
            description: '',
            condition: alert.condition,
            threshold: alert.threshold,
            level: alert.level,
            brandId: alert.brand.id
        });
        setIsDialogOpen(true);
    };
    const handleUpdateAlert = async (e) => {
        e.preventDefault();
        if (!editingAlert)
            return;
        setIsSubmitting(true);
        setError(null);
        try {
            const response = await api_client_1.apiClient.updateAlert(editingAlert.id, formData);
            if (response.success) {
                await fetchData(); // Refresh to get updated associations
                setIsDialogOpen(false);
                setEditingAlert(null);
                setFormData({ name: '', description: '', condition: 'NEGATIVE_SENTIMENT_THRESHOLD', threshold: 0.5, level: 'MEDIUM', brandId: '' });
            }
            else {
                throw new Error(response.error?.message || 'Erreur lors de la mise à jour');
            }
        }
        catch (err) {
            setError(err.error?.message || err.message || 'Erreur lors de la mise à jour de l\'alerte.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleDeleteAlert = async (alertId) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?'))
            return;
        try {
            const response = await api_client_1.apiClient.deleteAlert(alertId);
            if (response.success) {
                setAlerts(alerts.filter(a => a.id !== alertId));
            }
            else {
                throw new Error('Failed to delete alert');
            }
        }
        catch (err) {
            console.error('Error deleting alert:', err);
            setError('Erreur lors de la suppression de l\'alerte.');
        }
    };
    const getSeverityBadge = (level) => {
        switch (level) {
            case 'CRITICAL': return <badge_1.Badge variant="destructive" className="shadow-sm">Critique</badge_1.Badge>;
            case 'HIGH': return <badge_1.Badge className="bg-orange-500 text-white hover:bg-orange-600 border-none shadow-sm">Élevée</badge_1.Badge>;
            case 'MEDIUM': return <badge_1.Badge className="bg-yellow-500 text-white hover:bg-yellow-600 border-none shadow-sm">Moyenne</badge_1.Badge>;
            default: return <badge_1.Badge variant="secondary" className="shadow-sm">Faible</badge_1.Badge>;
        }
    };
    const getConditionLabel = (condition) => {
        switch (condition) {
            case 'NEGATIVE_SENTIMENT_THRESHOLD': return 'Seuil de sentiment négatif';
            case 'VOLUME_SPIKE': return 'Pic de volume (24h)';
            case 'KEYWORD_DETECTION': return 'Détection de mot-clé';
            default: return condition;
        }
    };
    return (<div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Règles d'alertes</h1>
          <p className="text-sm text-muted-foreground">
            Configurez vos notifications intelligentes en fonction des mentions
          </p>
        </div>

        <dialog_1.Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-all">
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              Nouvelle règle
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="sm:max-w-[500px]">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>
                {editingAlert ? 'Modifier l\'alerte' : 'Créer une règle d\'alerte'}
              </dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <form onSubmit={editingAlert ? handleUpdateAlert : handleCreateAlert} className="space-y-4 py-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="brandId">Marque concernée *</label_1.Label>
                <select_1.Select value={formData.brandId} onValueChange={(v) => setFormData({ ...formData, brandId: v })}>
                  <select_1.SelectTrigger><select_1.SelectValue placeholder="Sélectionnez"/></select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {brands.map(b => (<select_1.SelectItem key={b.id} value={b.id}>{b.name}</select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="name">Nom de l'alerte *</label_1.Label>
                <input_1.Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Alerte bad buzz Apple" required/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="condition">Condition *</label_1.Label>
                  <select_1.Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                    <select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="NEGATIVE_SENTIMENT_THRESHOLD">Sentiment Négatif</select_1.SelectItem>
                      <select_1.SelectItem value="VOLUME_SPIKE">Pic de Volume</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
                <div className="space-y-2">
                  <label_1.Label htmlFor="level">Sévérité *</label_1.Label>
                  <select_1.Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <select_1.SelectTrigger><select_1.SelectValue /></select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="LOW">Faible</select_1.SelectItem>
                      <select_1.SelectItem value="MEDIUM">Moyenne</select_1.SelectItem>
                      <select_1.SelectItem value="HIGH">Élevée</select_1.SelectItem>
                      <select_1.SelectItem value="CRITICAL">Critique</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="threshold">Seuil (0 à 1)</label_1.Label>
                <input_1.Input id="threshold" type="number" step="0.1" min="0" max="1" value={formData.threshold} onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}/>
                <p className="text-[10px] text-muted-foreground italic">
                  Pour le sentiment, 1.0 = 100% négatif au score max.
                </p>
              </div>

              <dialog_1.DialogFooter className="pt-4">
                <button_1.Button type="button" variant="ghost" onClick={() => {
            setIsDialogOpen(false);
            setEditingAlert(null);
            setFormData({ name: '', description: '', condition: 'NEGATIVE_SENTIMENT_THRESHOLD', threshold: 0.5, level: 'MEDIUM', brandId: '' });
        }}>Annuler</button_1.Button>
                <button_1.Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {isSubmitting ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : <lucide_react_1.Plus className="w-4 h-4 mr-2"/>}
                  {editingAlert ? 'Modifier' : 'Créer'} l'alerte
                </button_1.Button>
              </dialog_1.DialogFooter>
            </form>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>

      {error && (<alert_1.Alert variant="destructive" className="mb-6">
          <lucide_react_1.AlertTriangle className="w-4 h-4"/>
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>)}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? ([1, 2, 3].map(i => (<card_1.Card key={i} className="animate-pulse h-44 bg-muted/50 rounded-xl"/>))) : alerts.length === 0 ? (<div className="col-span-full text-center py-20 bg-card border border-dashed rounded-xl">
            <lucide_react_1.Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20"/>
            <h3 className="text-lg font-medium">Aucune règle configurée</h3>
            <p className="text-muted-foreground mb-6">Recevez des notifications quand quelque chose d'important se passe.</p>
            <button_1.Button variant="outline" onClick={() => setIsDialogOpen(true)}>Créer ma première alerte</button_1.Button>
          </div>) : (alerts.map((alert) => (<card_1.Card key={alert.id} className={`group transition-all hover:shadow-md border-border/50 ${alert.isActive ? '' : 'opacity-60 grayscale-[0.5]'}`}>
              <card_1.CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{alert.name}</h3>
                    <div className="flex items-center gap-2">
                      <badge_1.Badge variant="outline" className="text-[10px] h-4 py-0 font-bold bg-muted/30">
                        {alert.brand.name}
                      </badge_1.Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <switch_1.Switch checked={alert.isActive} onCheckedChange={() => handleToggleActive(alert.id, alert.isActive)} className="data-[state=checked]:bg-green-500"/>
                    <dropdown_menu_1.DropdownMenu>
                      <dropdown_menu_1.DropdownMenuTrigger asChild>
                        <button_1.Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 group-hover:opacity-100">
                          <lucide_react_1.MoreVertical className="w-4 h-4"/>
                        </button_1.Button>
                      </dropdown_menu_1.DropdownMenuTrigger>
                      <dropdown_menu_1.DropdownMenuContent align="end">
                        <dropdown_menu_1.DropdownMenuItem onClick={() => handleEditAlert(alert)}>
                          <lucide_react_1.Edit2 className="w-4 h-4 mr-2"/> Modifier
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => alert('Historique non disponible pour le moment')}>
                          <lucide_react_1.Activity className="w-4 h-4 mr-2"/> Historique
                        </dropdown_menu_1.DropdownMenuItem>
                        <dropdown_menu_1.DropdownMenuItem onClick={() => handleDeleteAlert(alert.id)} className="text-destructive font-medium">
                          <lucide_react_1.Trash2 className="w-4 h-4 mr-2"/> Supprimer
                        </dropdown_menu_1.DropdownMenuItem>
                      </dropdown_menu_1.DropdownMenuContent>
                    </dropdown_menu_1.DropdownMenu>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {getSeverityBadge(alert.level)}
                    <badge_1.Badge variant="secondary" className="font-normal flex items-center gap-1">
                      <lucide_react_1.Filter className="w-3 h-3"/>
                      {getConditionLabel(alert.condition)}
                    </badge_1.Badge>
                  </div>

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <lucide_react_1.Settings className="w-3.5 h-3.5"/>
                      <span>Seuil: <span className="text-foreground">{alert.threshold}</span></span>
                    </div>
                    <span className="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>)))}
      </div>
    </div>);
}
