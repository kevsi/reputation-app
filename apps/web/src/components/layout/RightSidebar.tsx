import { Bug, User, Radio, X, FileEdit, Trash2, CheckCircle, PanelRightClose } from "lucide-react";

interface RightSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const notifications = [
  { icon: Bug, bg: "#EDEEFC", text: "You fixed a bug.", time: "Just now" },
  { icon: User, bg: "#E6F1FD", text: "New user registered.", time: "59 minutes ago" },
  { icon: Bug, bg: "#EDEEFC", text: "You fixed a bug.", time: "12 hours ago" },
  { icon: Radio, bg: "#E6F1FD", text: "Andi Lane subscribed to you.", time: "Today, 11:59 AM" },
];

const mentions = [
  { text: "Changed the style.", time: "Just now", icon: FileEdit },
  { text: "Released a new version.", time: "59 minutes ago", icon: CheckCircle },
  { text: "Submitted a bug.", time: "12 hours ago", icon: Bug },
  { text: "Modified A data in Page X.", time: "Today, 11:59 AM", icon: FileEdit },
  { text: "Deleted a page in Project X.", time: "Feb 2, 2025", icon: Trash2 },
];

export function RightSidebar({ isCollapsed = false, onToggle, onClose }: RightSidebarProps) {
  if (isCollapsed) {
    return null;
  }

  return (
    <div className="w-[280px] h-full border-l border-border p-4 flex flex-col gap-4 bg-card overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-normal text-foreground">Notifications</span>
        <div className="flex items-center gap-1">
          {/* Bouton fermer mobile */}
          {onClose && (
            <button 
              onClick={onClose}
              className="xl:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          )}
          
          {/* Bouton collapse desktop */}
          {onToggle && (
            <button 
              onClick={onToggle}
              className="hidden xl:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-accent transition-colors"
              title="Masquer le panneau"
            >
              <PanelRightClose className="w-4 h-4 text-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="flex flex-col gap-1">
        {notifications.map((notif, i) => {
          const Icon = notif.icon;
          return (
            <div key={i} className="flex items-start gap-2 p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer">
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: notif.bg }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-normal text-foreground truncate">{notif.text}</p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-px bg-border" />

      {/* Mentions */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between px-1 py-2">
          <span className="text-sm font-normal text-foreground">Mentions</span>
          <button className="text-sm font-normal text-primary hover:underline">
            Voir tout
          </button>
        </div>

        {mentions.map((mention, i) => {
          const Icon = mention.icon;
          return (
            <div key={i} className="flex items-start gap-2 p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-normal text-foreground truncate">{mention.text}</p>
                <p className="text-xs text-muted-foreground">{mention.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}