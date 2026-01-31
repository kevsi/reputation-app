import { Bug, User, Radio, X, FileEdit, Trash2, CheckCircle, PanelRightClose } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ApiResponse } from "@/types/api";

interface RightSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'NEW_MENTION':
      return User;
    case 'ALERT_TRIGGERED':
      return Radio;
    case 'SENTIMENT_SPIKE':
      return Bug;
    case 'ACTION_REQUIRED':
      return CheckCircle;
    case 'REPORT_READY':
      return FileEdit;
    case 'KEYWORD_TRENDING':
      return Trash2;
    default:
      return Bug;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'NEW_MENTION':
      return "#E6F1FD";
    case 'ALERT_TRIGGERED':
      return "#EDEEFC";
    case 'SENTIMENT_SPIKE':
      return "#FDE6E6";
    case 'ACTION_REQUIRED':
      return "#E6FDE6";
    case 'REPORT_READY':
      return "#FDEEE6";
    case 'KEYWORD_TRENDING':
      return "#F0E6FD";
    default:
      return "#EDEEFC";
  }
};

export function RightSidebar({ isCollapsed = false, onToggle, onClose }: RightSidebarProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await apiClient.callApi<Notification[]>('/notifications', {});
        const res = response as ApiResponse<Notification[]>;
        if (res.success && Array.isArray(res.data)) {
          setNotifications(res.data.slice(0, 4)); // Limiter à 4 notifications
        } else {
          // Données fictives si l'API ne fonctionne pas
          setNotifications([
            {
              id: '1',
              userId: 'user1',
              organizationId: 'org1',
              type: 'NEW_MENTION',
              title: 'Nouvelle mention',
              message: 'Votre marque a été mentionnée sur Twitter.',
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
            },
            {
              id: '2',
              userId: 'user1',
              organizationId: 'org1',
              type: 'ALERT_TRIGGERED',
              title: 'Alerte déclenchée',
              message: 'Pic de sentiment négatif détecté.',
              isRead: false,
              createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
            }
          ]);
        }
      } catch (error) {
        // Error loading notifications
    
        // Données fictives en cas d'erreur
        setNotifications([
          {
            id: '1',
            userId: 'user1',
            organizationId: 'org1',
            type: 'NEW_MENTION',
            title: 'Nouvelle mention',
            message: 'Votre marque a été mentionnée sur Twitter.',
            isRead: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

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
        {loading ? (
          <div className="p-2 text-center text-muted-foreground text-sm">
            Chargement...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-2 text-center text-muted-foreground text-sm">
            Aucune notification
          </div>
        ) : (
          notifications.map((notif) => {
            const Icon = getNotificationIcon(notif.type);
            return (
              <div key={notif.id} className="flex items-start gap-2 p-2 rounded-xl hover:bg-accent transition-colors cursor-pointer">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: getNotificationColor(notif.type) }}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-normal text-foreground truncate">{notif.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notif.createdAt), {
                      addSuffix: true,
                      locale: fr
                    })}
                  </p>
                </div>
                {!notif.isRead && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Section vide pour l'instant - peut être utilisée pour d'autres fonctionnalités */}
    </div>
  );
}