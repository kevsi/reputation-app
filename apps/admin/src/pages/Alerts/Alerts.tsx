import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Bell,
  MoreVertical,
  Edit2,
  Trash2,
  Activity,
  AlertTriangle,
  Loader2,
  Settings,
  Filter
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
import { Switch } from '@/components/ui/switch';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  isActive: boolean;
  brand: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition: 'NEGATIVE_SENTIMENT_THRESHOLD',
    threshold: 0.5,
    level: 'MEDIUM',
    brandId: ''
  });

  useEffect(() => {
    if (user?.organizationId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [alertsRes, brandsRes] = await Promise.all([
        apiClient.getAlerts({ organizationId: user?.organizationId }),
        apiClient.getBrands()
      ]);

      if (alertsRes.success) setAlerts(alertsRes.data);
      if (brandsRes.success) {
        setBrands(brandsRes.data);
        if (brandsRes.data.length > 0) {
          setFormData(prev => ({ ...prev, brandId: brandsRes.data[0].id }));
        }
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Impossible de charger les alertes. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.createAlert({
        ...formData,
        threshold: Number(formData.threshold),
        isActive: true
      });

      if (response.success) {
        await fetchData(); // Refresh list to get associations
        setIsDialogOpen(false);
        setFormData({ ...formData, name: '', description: '' });
      } else {
        throw new Error(response.error?.message || 'Erreur lors de la création');
      }
    } catch (err: any) {
      setError(err.error?.message || err.message || 'Erreur lors de la création.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await apiClient.updateAlert(id, { isActive: !currentStatus });
      if (response.success) {
        setAlerts(alerts.map(a => a.id === id ? { ...a, isActive: !currentStatus } : a));
      }
    } catch (err) {
      console.error('Error toggling alert status:', err);
    }
  };

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL': return <Badge variant="destructive shadow-sm">Critique</Badge>;
      case 'HIGH': return <Badge className="bg-orange-500 text-white hover:bg-orange-600 border-none shadow-sm">Élevée</Badge>;
      case 'MEDIUM': return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600 border-none shadow-sm">Moyenne</Badge>;
      default: return <Badge variant="secondary" className="shadow-sm">Faible</Badge>;
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'NEGATIVE_SENTIMENT_THRESHOLD': return 'Seuil de sentiment négatif';
      case 'VOLUME_SPIKE': return 'Pic de volume (24h)';
      case 'KEYWORD_DETECTION': return 'Détection de mot-clé';
      default: return condition;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Règles d'alertes</h1>
          <p className="text-sm text-muted-foreground">
            Configurez vos notifications intelligentes en fonction des mentions
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md hover:shadow-lg transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle règle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Créer une règle d'alerte</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAlert} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="brandId">Marque concernée *</Label>
                <Select value={formData.brandId} onValueChange={(v) => setFormData({ ...formData, brandId: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                  <SelectContent>
                    {brands.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'alerte *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Alerte bad buzz Apple"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEGATIVE_SENTIMENT_THRESHOLD">Sentiment Négatif</SelectItem>
                      <SelectItem value="VOLUME_SPIKE">Pic de Volume</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Sévérité *</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Faible</SelectItem>
                      <SelectItem value="MEDIUM">Moyenne</SelectItem>
                      <SelectItem value="HIGH">Élevée</SelectItem>
                      <SelectItem value="CRITICAL">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold">Seuil (0 à 1)</Label>
                <Input
                  id="threshold"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                />
                <p className="text-[10px] text-muted-foreground italic">
                  Pour le sentiment, 1.0 = 100% négatif au score max.
                </p>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Créer l'alerte
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-44 bg-muted/50 rounded-xl" />
          ))
        ) : alerts.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-card border border-dashed rounded-xl">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium">Aucune règle configurée</h3>
            <p className="text-muted-foreground mb-6">Recevez des notifications quand quelque chose d'important se passe.</p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Créer ma première alerte</Button>
          </div>
        ) : (
          alerts.map((alert) => (
            <Card key={alert.id} className={`group transition-all hover:shadow-md border-border/50 ${alert.isActive ? '' : 'opacity-60 grayscale-[0.5]'}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">{alert.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-4 py-0 font-bold bg-muted/30">
                        {alert.brand.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={alert.isActive}
                      onCheckedChange={() => handleToggleActive(alert.id, alert.isActive)}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-40 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="w-4 h-4 mr-2" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Activity className="w-4 h-4 mr-2" /> Historique
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive font-medium">
                          <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {getSeverityBadge(alert.level)}
                    <Badge variant="secondary" className="font-normal flex items-center gap-1">
                      <Filter className="w-3 h-3" />
                      {getConditionLabel(alert.condition)}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Seuil: <span className="text-foreground">{alert.threshold}</span></span>
                    </div>
                    <span className="text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}