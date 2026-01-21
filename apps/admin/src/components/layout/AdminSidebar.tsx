import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Plug,
  Key,
  Bell,
  Brain,
  CheckCircle,
  Database,
  MessageSquare,
  ChevronLeft,
  ArrowLeft
} from "lucide-react";

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const menuItems = [
  {
    section: "PRINCIPAL",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
      { icon: Building2, label: "Organisations", path: "/admin/organisations" },
      { icon: Users, label: "Utilisateurs", path: "/admin/users" }
    ]
  },
  {
    section: "VEILLE",
    items: [
      { icon: MessageSquare, label: "Mentions", path: "/admin/mentions" },
      { icon: Building2, label: "Marques", path: "/admin/brands" },
      { icon: Database, label: "Sources de données", path: "/admin/sources" },
      { icon: Key, label: "Mots-clés & règles", path: "/admin/keywords" },
      { icon: Bell, label: "Alertes", path: "/admin/alerts" }
    ]
  },
  {
    section: "AVANCÉ",
    items: [
      { icon: Plug, label: "État système (Connecteurs)", path: "/admin/connectors" },
      { icon: Brain, label: "IA & modèles", path: "/admin/ai" }
    ]
  }
];

export function AdminSidebar({ isCollapsed = false, onToggle, onClose }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <div className={`h-full flex flex-col bg-card border-r border-border transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
      }`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">🔧</span>
              </div>
              <div>
                <h1 className="font-bold text-sm text-foreground">Admin Panel</h1>
                <p className="text-xs text-muted-foreground">Sentinnelle Platform</p>
              </div>
            </div>
          )}

          {/* Toggle button desktop */}
          <button
            onClick={onToggle}
            className="hidden lg:flex p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 text-muted-foreground transition-transform ${isCollapsed ? 'rotate-180' : ''
              }`} />
          </button>

          {/* Close button mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {menuItems.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  {section.section}
                </span>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={itemIdx}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.label}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer - User */}
      <div className="p-3 border-t border-border">
        <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer ${isCollapsed ? 'justify-center' : ''
          }`}>
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">SA</span>
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                Super Admin
              </div>
              <div className="text-xs text-muted-foreground truncate">
                admin@sentinnelle.com
              </div>
            </div>
          )}
        </div>

        {/* Retour app principale */}
        {!isCollapsed && (
          <button className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Retour app principale</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default AdminSidebar;