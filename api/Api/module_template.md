# 🎨 Template Générique pour Créer N'importe Quel Module

## 📁 Structure à créer

```
src/modules/[NOM_MODULE]/
├── [nom].types.ts          # 1. Commence ici
├── [nom].service.ts        # 2. Puis ici
├── [nom].controller.ts     # 3. Puis ici
└── [nom].routes.ts         # 4. Enfin ici
```

---

## 🔄 Processus en 4 étapes

### Étape 1 : Définir ton entité (`types.ts`)

```typescript
// Exemple pour ALERTS
export interface Alert {
  id: string;
  sourceId: string;        // Lien vers une source
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
  status: 'new' | 'read' | 'archived';
  createdAt: Date;
}

export interface CreateAlertInput {
  sourceId: string;
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UpdateAlertInput {
  title?: string;
  content?: string;
  severity?: 'low' | 'medium' | 'high';
  status?: 'new' | 'read' | 'archived';
}

// Réponses API
export interface AlertsResponse {
  success: boolean;
  data: Alert[];
  count: number;
}

export interface AlertResponse {
  success: boolean;
  data: Alert;
}
```

---

### Étape 2 : Créer le Service (`service.ts`)

```typescript
import { Alert, CreateAlertInput, UpdateAlertInput } from './alerts.types';

class AlertsService {
  private mockAlerts: Alert[] = [
    {
      id: '1',
      sourceId: '1',
      title: 'Nouvelle mention',
      content: 'Votre marque a été mentionnée sur TechCrunch',
      severity: 'high',
      status: 'new',
      createdAt: new Date(),
    },
  ];

  async getAll(): Promise<Alert[]> {
    return Promise.resolve(this.mockAlerts);
  }

  async getById(id: string): Promise<Alert | null> {
    return this.mockAlerts.find(a => a.id === id) || null;
  }

  async create(input: CreateAlertInput): Promise<Alert> {
    const newAlert: Alert = {
      id: String(this.mockAlerts.length + 1),
      ...input,
      status: 'new',
      createdAt: new Date(),
    };
    this.mockAlerts.push(newAlert);
    return newAlert;
  }

  async update(id: string, input: UpdateAlertInput): Promise<Alert | null> {
    const index = this.mockAlerts.findIndex(a => a.id === id);
    if (index === -1) return null;
    
    this.mockAlerts[index] = { ...this.mockAlerts[index], ...input };
    return this.mockAlerts[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.mockAlerts.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    this.mockAlerts.splice(index, 1);
    return true;
  }
}

export const alertsService = new AlertsService();
```

---

### Étape 3 : Créer le Controller (`controller.ts`)

```typescript
import { Request, Response, NextFunction } from 'express';
import { alertsService } from './alerts.service';
import { logger } from '@/infrastructure/logger';

class AlertsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await alertsService.getAll();
      res.status(200).json({ success: true, data: alerts, count: alerts.length });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await alertsService.getById(req.params.id);
      if (!alert) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      res.status(200).json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { sourceId, title, content, severity } = req.body;
      
      if (!sourceId || !title || !content || !severity) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const newAlert = await alertsService.create(req.body);
      res.status(201).json({ success: true, data: newAlert });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await alertsService.update(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await alertsService.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Alert not found' });
      }
      res.status(200).json({ success: true, message: 'Alert deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export const alertsController = new AlertsController();
```

---

### Étape 4 : Créer les Routes (`routes.ts`)

```typescript
import { Router } from 'express';
import { alertsController } from './alerts.controller';

const router = Router();

router.get('/', alertsController.getAll.bind(alertsController));
router.get('/:id', alertsController.getById.bind(alertsController));
router.post('/', alertsController.create.bind(alertsController));
router.patch('/:id', alertsController.update.bind(alertsController));
router.delete('/:id', alertsController.delete.bind(alertsController));

export default router;
```

---

### Étape 5 : Connecter dans `app.ts`

```typescript
// Dans app.ts
import alertsRoutes from './modules/alerts/alerts.routes';

// ...

apiRouter.use('/sources', sourcesRoutes);
apiRouter.use('/alerts', alertsRoutes);    // ← Ajouter ici
```

---

## 🎯 Suggestions pour Chaque Module

### 📢 **alerts/** (Alertes)
```typescript
interface Alert {
  id: string;
  sourceId: string;
  title: string;
  content: string;
  severity: 'low' | 'medium' | 'high';
  status: 'new' | 'read' | 'archived';
  createdAt: Date;
}
```

### 👥 **users/** (Utilisateurs)
```typescript
interface User {
  id: string;
  email: string;
  password: string; // Hashé avec bcrypt
  role: 'user' | 'admin';
  organizationId?: string;
  createdAt: Date;
}
```
⚠️ **Important** : Ne jamais renvoyer le password dans les réponses !

### 🏢 **organizations/** (Organisations)
```typescript
interface Organization {
  id: string;
  name: string;
  industry: string;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
}
```

### 🔍 **mentions/** (Mentions)
```typescript
interface Mention {
  id: string;
  sourceId: string;
  organizationId: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  url: string;
  detectedAt: Date;
}
```

### 📊 **reports/** (Rapports)
```typescript
interface Report {
  id: string;
  organizationId: string;
  type: 'daily' | 'weekly' | 'monthly';
  data: any; // JSON contenant les métriques
  generatedAt: Date;
}
```

### 🏷️ **keywords/** (Mots-clés)
```typescript
interface Keyword {
  id: string;
  organizationId: string;
  term: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
}
```

### 🎨 **brands/** (Marques)
```typescript
interface Brand {
  id: string;
  organizationId: string;
  name: string;
  logo?: string;
  website?: string;
  createdAt: Date;
}
```

### 🎬 **actions/** (Actions)
```typescript
interface Action {
  id: string;
  alertId: string;
  userId: string;
  type: 'response' | 'escalate' | 'ignore';
  note?: string;
  createdAt: Date;
}
```

### 💳 **billing/** (Facturation)
```typescript
interface Billing {
  id: string;
  organizationId: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  stripePaymentId?: string;
  createdAt: Date;
}
```

### 📈 **analytics/** (Analytiques)
```typescript
interface Analytics {
  id: string;
  organizationId: string;
  metric: string;
  value: number;
  date: Date;
}
```

---

## ✅ Checklist pour Chaque Module

- [ ] Créer le dossier `src/modules/[nom]/`
- [ ] Définir les types dans `[nom].types.ts`
- [ ] Créer les données mock dans `[nom].service.ts`
- [ ] Implémenter CRUD dans le service (getAll, getById, create, update, delete)
- [ ] Créer les méthodes du controller dans `[nom].controller.ts`
- [ ] Définir les routes dans `[nom].routes.ts`
- [ ] Ajouter la route dans `app.ts`
- [ ] Tester avec cURL

---

## 🚀 Ordre Recommandé de Développement

1. **sources** ✅ (Déjà fait)
2. **users** (Important pour l'auth)
3. **organizations** (Lié aux users)
4. **keywords** (Simple, bon exercice)
5. **mentions** (Coeur de l'app)
6. **alerts** (Dépend de mentions)
7. **actions** (Dépend d'alerts)
8. **reports** (Agrégation de données)
9. **brands** (Optionnel)
10. **billing** (Complexe, à faire en dernier)
11. **analytics** (Après avoir des données)

---

## 💡 Astuces Pro

### 1. Relations entre modules
```typescript
// Dans mentions.types.ts
interface Mention {
  id: string;
  sourceId: string;        // FK vers sources
  organizationId: string;  // FK vers organizations
  // ...
}
```

### 2. Réutilise les validations
```typescript
// shared/validators/common.ts
export const idSchema = z.string().uuid();
export const emailSchema = z.string().email();
export const urlSchema = z.string().url();
```

### 3. Middleware d'authentification (à venir)
```typescript
// Plus tard, tu ajouteras :
router.post(
  '/',
  authenticate,      // Vérifie le JWT
  authorize(['admin']), // Vérifie le rôle
  validate(schema),
  controller.create
);
```

---

## 🎓 Exercice Pratique

**Crée le module "keywords" en 20 minutes !**

1. Types : id, organizationId, term, category, isActive
2. Service : Mock avec 3 keywords
3. Controller : 5 méthodes CRUD
4. Routes : 5 routes
5. Test : GET, POST, PATCH, DELETE

Si tu y arrives, tu es prêt pour tous les autres ! 💪