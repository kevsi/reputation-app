import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Zap, 
  Database,
  Building2,
  Settings,
  Tag,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Analysis", path: "/analysis", icon: BarChart3 },
  { name: "Mentions", path: "/mentions", icon: MessageSquare },
  { name: "Alertes", path: "/alerts", icon: AlertTriangle },
  { name: "Reports", path: "/reports", icon: FileText },
  { name: "Actions", path: "/actions", icon: Zap },
  { name: "Marques", path: "/brands", icon: Building2 },
  { name: "Sources", path: "/sources", icon: Database },
  { name: "Mots Clés", path: "/keywords", icon: Tag },
  { name: "Settings", path: "/settings", icon: Settings },
];

export function Sidebar({ isCollapsed = false, onToggle, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <div 
      className={cn(
        "h-full border-r border-border bg-card flex flex-col transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[212px]"
      )}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!isCollapsed ? (
          <div className="flex items-center justify-center flex-1">
            <img 
              src="/logoicon.svg" 
              alt="Sentinnelle Reputation" 
              className="h-12 w-auto dark:brightness-0 dark:invert"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <img 
              src="/logoicon.svg" 
              alt="Sentinnelle" 
              className="h-12 w-12 object-contain dark:brightness-0 dark:invert"
            />
          </div>
        )}
        
        {/* Boutons actions */}
        <div className="flex items-center gap-1">
          {/* Bouton fermer mobile */}
          {onClose && (
            <button 
              onClick={onClose}
              className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          )}
          
          {/* Bouton collapse desktop */}
          {onToggle && (
            <button 
              onClick={onToggle}
              className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-foreground" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-foreground" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-normal transition-colors relative group",
                isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
              
              {/* Tooltip pour mode collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-border">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}