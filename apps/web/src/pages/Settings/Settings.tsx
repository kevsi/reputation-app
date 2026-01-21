
import { useState, useEffect } from "react";
import { Book, MessageCircle, Bug, Lightbulb, Loader2, Save, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner"; // Assuming sonner is used for toasts

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgData, setOrgData] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organizationName: "",
    language: "Français",
    timezone: "Europe/Paris (GMT+1)"
  });

  const [notifications, setNotifications] = useState({
    nouvelles_mentions: true,
    alertes_urgentes: true,
    rapports_hebdo: true,
    mentions_negatives: true,
    activite_concurrent: false,
    tendances_marche: false
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // In a real app, we might have an endpoint for org settings
      // For now we use the user info and potentially an org fetch if needed
      setFormData({
        name: user.name || "",
        email: user.email || "",
        organizationName: "Organisation", // To be fetched
        language: "Français",
        timezone: "Europe/Paris (GMT+1)"
      });

      if (user.organizationId) {
        const res = await apiClient.callApi<any>(`/organizations/${user.organizationId}`);
        if (res.success) {
          setOrgData(res.data);
          setFormData(prev => ({ ...prev, organizationName: res.data.name }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock update
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Paramètres enregistrés avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Paramètres
            </h1>
            <p className="text-sm text-muted-foreground">
              Gérez vos préférences et les configurations de {formData.organizationName}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Settings */}
          <div className="xl:col-span-2 space-y-6">
            {/* Profil & Organisation */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Profil & Organisation
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Votre Nom
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom de l'organisation
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Langue
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Français</option>
                      <option>English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Fuseau horaire
                    </label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Europe/Paris (GMT+1)</option>
                      <option>UTC (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Notifications
              </h2>

              <div className="space-y-4">
                {[
                  { key: "nouvelles_mentions", label: "Nouvelles mentions" },
                  { key: "alertes_urgentes", label: "Alertes urgentes" },
                  { key: "rapports_hebdo", label: "Rapports hebdomadaires" },
                  { key: "mentions_negatives", label: "Mentions négatives" }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[key as keyof typeof notifications]}
                        onChange={() => toggleNotification(key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Actions rapides */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
                <button className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
                  Exporter mes données
                </button>
              </div>
            </div>

            {/* Informations du plan */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Plan & Abonnement
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan actuel</span>
                  <span className="font-semibold text-foreground">{orgData?.plan || 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renouvellement</span>
                  <span className="font-semibold text-foreground">01/02/2025</span>
                </div>
              </div>
              <button className="w-full mt-6 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Mettre à niveau le plan
              </button>
            </div>

            {/* Support */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Besoin d'aide ?
              </h2>
              <div className="space-y-4">
                <a href="#" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors group">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10">
                    <Book className="w-4 h-4" />
                  </div>
                  <span>Documentation</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-sm text-foreground hover:text-primary transition-colors group">
                  <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span>Contacter le support</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}