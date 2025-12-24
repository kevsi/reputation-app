import { useState } from "react";
import { Book, MessageCircle, Bug, Lightbulb } from "lucide-react";

const connectedAccounts = [
  { id: "1", platform: "Twitter", username: "@byewind", initial: "T", connected: true },
  { id: "2", platform: "Instagram", username: "@byewind_official", initial: "I", connected: true },
  { id: "3", platform: "Facebook", username: "ByeWind", initial: "F", connected: true },
  { id: "4", platform: "LinkedIn", username: "", initial: "L", connected: false },
  { id: "5", platform: "YouTube", username: "", initial: "Y", connected: false }
];

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    nouvelles_mentions: true,
    alertes_urgentes: true,
    rapports_hebdo: true,
    mentions_negatives: true,
    activite_concurrent: false,
    tendances_marche: false
  });

  const toggleNotification = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="p-4 sm:p-6 md:p-8 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Gérez vos préférences et configurations
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Main Settings */}
          <div className="xl:col-span-2 space-y-6">
            {/* Paramètres généraux */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Paramètres généraux
              </h2>

              <div className="space-y-5">
                {/* Nom de l'entreprise */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    defaultValue="ByeWind"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Email de contact */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email de contact
                  </label>
                  <input
                    type="email"
                    defaultValue="contact@byewind.com"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                {/* Langue */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Langue
                  </label>
                  <select className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Français</option>
                    <option>English</option>
                    <option>Español</option>
                  </select>
                </div>

                {/* Fuseau horaire */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fuseau horaire
                  </label>
                  <select className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                    <option>Europe/Paris (GMT+1)</option>
                    <option>America/New_York (GMT-5)</option>
                    <option>Asia/Tokyo (GMT+9)</option>
                  </select>
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
                  { key: "mentions_negatives", label: "Mentions négatives" },
                  { key: "activite_concurrent", label: "Activité des concurrents" },
                  { key: "tendances_marche", label: "Tendances du marché" }
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
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Comptes connectés */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">
                Comptes connectés
              </h2>

              <div className="space-y-3">
                {connectedAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-foreground">
                        {account.initial}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-foreground">
                          {account.platform}
                        </div>
                        {account.username && (
                          <div className="text-xs text-muted-foreground">
                            {account.username}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        account.connected
                          ? "border border-border text-foreground hover:bg-muted"
                          : "bg-foreground text-background hover:opacity-90"
                      }`}
                    >
                      {account.connected ? "Déconnecter" : "Connecter"}
                    </button>
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
                Actions rapides
              </h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                  Sauvegarder les modifications
                </button>
                <button className="w-full px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground">
                  Exporter les données
                </button>
                <button className="w-full px-4 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                  Réinitialiser
                </button>
              </div>
            </div>

            {/* Informations du compte */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Informations du compte
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground">Premium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilisateurs</span>
                  <span className="font-semibold text-foreground">5/10</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stockage</span>
                  <span className="font-semibold text-foreground">2.4 GB / 10 GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Renouvellement</span>
                  <span className="font-semibold text-foreground">01/02/2025</span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Mettre à niveau
              </button>
            </div>

            {/* Support */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Support
              </h2>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                  <Book className="w-4 h-4" />
                  <span>Documentation</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacter le support</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                  <Bug className="w-4 h-4" />
                  <span>Signaler un bug</span>
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors">
                  <Lightbulb className="w-4 h-4" />
                  <span>Demander une fonctionnalité</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}