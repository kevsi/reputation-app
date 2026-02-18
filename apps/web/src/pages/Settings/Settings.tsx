import { useState, useEffect, useCallback } from "react";
import { Book, MessageCircle, Loader2, Save, RefreshCw, AlertCircle, Shield, CreditCard, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usersService } from "@/services/users.service";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { isApiError } from "@/types/http";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface OrgData {
  name: string;
  id: string;
  plan?: string;
  renewalDate?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgData, setOrgData] = useState<OrgData | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationName: "",
    language: "Français",
    timezone: "Europe/Paris (GMT+1)"
  });

  const [notifications, setNotifications] = useState({
    mentions: true,
    alerts: true,
    reports: true,
    negative: true
  });

  const handleNotificationChange = async (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    try {
      const res = await apiClient.put('/notifications/preferences', { [key]: value });
      if (!isApiError(res)) {
        toast.success('Préférence mise à jour');
      } else {
        toast.error('Erreur de mise à jour');
        // Rollback on error
        setNotifications(prev => ({ ...prev, [key]: !value }));
      }
    } catch (error) {
      toast.error('Erreur réseau');
      // Rollback on error
      setNotifications(prev => ({ ...prev, [key]: !value }));
    }
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));

      if (user.organizationId) {
        // Fetch org data
        const res = await apiClient.get<OrgData>(`/organizations/${user.organizationId}`);
        if (!isApiError(res) && res.data) {
          setOrgData(res.data);
          setFormData(prev => ({ ...prev, organizationName: res.data!.name }));
        }
      }
    } catch (err) {
      toast.error("Chargement des paramètres impossible");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await usersService.updateProfile({
        name: formData.name
      });

      if (!isApiError(response)) {
        // Trigger a re-fetch of user data
        window.location.reload();
        toast.success("Profil mis à jour");
      } else {
        toast.error("Erreur de mise à jour");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background min-h-[500px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">Paramètres</h1>
            <p className="text-muted-foreground mt-2">Gérez votre profil et les préférences de votre organisation.</p>
          </div>
          <Button variant="outline" size="icon" onClick={fetchData} className="rounded-full">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> Informations Personnelles
                </CardTitle>
                <CardDescription>Mettez à jour vos informations publiques.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email professionnel</Label>
                    <Input id="email" value={formData.email} disabled className="bg-muted/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org">Organisation</Label>
                  <Input id="org" value={formData.organizationName} disabled className="bg-muted/50" />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 pt-4 border-t flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-full px-6">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" /> Enregistrer les changements
                </Button>
              </CardFooter>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" /> Centre de Notifications
                </CardTitle>
                <CardDescription>Choisissez comment et quand vous voulez être alerté.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <div className="font-semibold">Nouvelles Mentions</div>
                    <div className="text-xs text-muted-foreground">Recevoir une alerte pour chaque nouvelle mention détectée.</div>
                  </div>
                  <Switch 
                    checked={notifications.mentions} 
                    onCheckedChange={(v) => handleNotificationChange('mentions', v)} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <div className="font-semibold text-red-600">Alertes Critiques</div>
                    <div className="text-xs text-muted-foreground">Notifications immédiates pour les situations de crise.</div>
                  </div>
                  <Switch 
                    checked={notifications.alerts} 
                    onCheckedChange={(v) => handleNotificationChange('alerts', v)} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl">
                  <div>
                    <div className="font-semibold text-amber-600">Sentiments Négatifs</div>
                    <div className="text-xs text-muted-foreground">Surveillance spécifique des mentions négatives.</div>
                  </div>
                  <Switch 
                    checked={notifications.negative} 
                    onCheckedChange={(v) => handleNotificationChange('negative', v)} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden border-primary/20">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CreditCard className="w-5 h-5" /> Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Offre</span>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded uppercase">
                    {orgData?.plan || 'Standard'}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-6 text-sm">
                  <span className="text-muted-foreground">Prochain paiement</span>
                  <span className="font-medium">{orgData?.renewalDate || 'N/A'}</span>
                </div>
                <Button className="w-full rounded-full" variant="outline" onClick={() => toast.info('Gestion de facturation bientôt disponible')}>Gérer la facturation</Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground px-2">Assistance</h3>
              <button 
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:bg-muted/30 transition-all group w-full text-left"
                onClick={() => toast.info('Documentation bientôt disponible')}
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Book className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Base de connaissance</div>
                  <div className="text-xs text-muted-foreground">Guides et tutoriels</div>
                </div>
              </button>
              <button 
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:bg-muted/30 transition-all group w-full text-left"
                onClick={() => toast.info('Support disponible par email')}
              >
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <MessageCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Contacter le support</div>
                  <div className="text-xs text-muted-foreground">Réponse sous 24h</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}