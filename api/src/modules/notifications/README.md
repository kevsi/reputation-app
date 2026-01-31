# Notifications Module

Le module de notifications gère l'envoi de notifications aux utilisateurs selon leur plan d'abonnement.

## Fonctionnalités

- ✅ Notifications in-app pour tous les plans
- ✅ Notifications par email (Premium+)
- ✅ Webhooks personnalisés (Team uniquement)
- ✅ Gestion des préférences utilisateur
- ✅ Respect des limites par plan
- ✅ Envoi asynchrone via queues
- ✅ Temps réel via WebSocket

## Types de notifications

- `NEW_MENTION` : Nouvelle mention détectée
- `ALERT_TRIGGERED` : Alerte déclenchée
- `SENTIMENT_SPIKE` : Pic de sentiment
- `ACTION_REQUIRED` : Action nécessitant attention
- `REPORT_READY` : Rapport généré
- `KEYWORD_TRENDING` : Mot-clé en tendance

## API Endpoints

### Récupérer les notifications
```http
GET /api/v1/notifications
```

**Query Parameters:**
- `limit` (number, optional): Nombre maximum de résultats (défaut: 50)
- `offset` (number, optional): Offset pour la pagination (défaut: 0)
- `unreadOnly` (boolean, optional): Uniquement les non lues

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_123",
      "userId": "user_456",
      "organizationId": "org_789",
      "type": "NEW_MENTION",
      "title": "Nouvelle mention",
      "message": "Vous avez une nouvelle mention",
      "data": { "mentionId": "123" },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 25,
  "unreadCount": 5,
  "hasMore": true
}
```

### Compte des notifications non lues
```http
GET /api/v1/notifications/unread
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### Marquer comme lue
```http
PATCH /api/v1/notifications/:id/read
```

### Marquer toutes comme lues
```http
PATCH /api/v1/notifications/read-all
```

### Supprimer une notification
```http
DELETE /api/v1/notifications/:id
```

### Récupérer les préférences
```http
GET /api/v1/notifications/preferences
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pref_123",
      "userId": "user_456",
      "organizationId": "org_789",
      "type": "NEW_MENTION",
      "inApp": true,
      "email": false,
      "webhook": false,
      "webhookUrl": null
    }
  ]
}
```

### Modifier les préférences
```http
PUT /api/v1/notifications/preferences
```

**Body:**
```json
{
  "type": "NEW_MENTION",
  "inApp": true,
  "email": true,
  "webhook": false
}
```

## Limites par plan

| Fonctionnalité | FREE | STARTER | PRO | PREMIUM | TEAM | ENTERPRISE |
|---|---|---|---|---|---|---|
| Notifications in-app | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Emails | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Webhooks | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Historique (jours) | 7 | 30 | 90 | 365 | ∞ | ∞ |

## Utilisation dans le code

### Créer une notification
```typescript
import { notificationsService } from '../notifications/notifications.service';

await notificationsService.createNotification({
  userId: 'user_123',
  organizationId: 'org_456',
  type: 'NEW_MENTION',
  title: 'Nouvelle mention détectée',
  message: 'Une nouvelle mention a été trouvée pour votre marque',
  data: {
    mentionId: 'mention_789',
    brandId: 'brand_101'
  }
});
```

### Intégration avec les alertes
```typescript
// Dans alerts.service.ts
async triggerAlert(alertId: string) {
  // Logique d'alerte...

  // Déclencher notification
  await notificationsService.createNotification({
    userId: alert.userId,
    organizationId: alert.organizationId,
    type: 'ALERT_TRIGGERED',
    title: `Alerte: ${alert.name}`,
    message: alert.condition,
    data: { alertId, threshold: alert.threshold }
  });
}
```

## Architecture technique

### Services
- **NotificationsService**: Logique métier principale
- **EmailService**: Envoi d'emails SMTP
- **WebSocketService**: Notifications temps réel
- **NotificationsQueue**: Traitement asynchrone avec BullMQ

### Base de données
- **Notification**: Stockage des notifications
- **NotificationPreference**: Préférences utilisateur par type

### Files d'attente
- `notifications`: Traitement des notifications
- `cleanup`: Nettoyage périodique des anciennes notifications

### WebSocket Events
- `notification:new`: Nouvelle notification pour l'utilisateur

## Configuration

### Variables d'environnement
```env
# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@sentinelle-reputation.com

# Redis pour les queues
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Frontend pour CORS WebSocket
FRONTEND_URL=http://localhost:3000
```

## Tests

```bash
# Exécuter les tests du module
npm test -- src/modules/notifications/__tests__/
```

## Migration

Après avoir ajouté les modèles à `schema.prisma`, exécuter:

```bash
cd database
npm run db:generate
npm run db:push
```