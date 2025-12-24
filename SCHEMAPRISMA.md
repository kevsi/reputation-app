// Organisations (multi-tenant)
model Organization {
  id          String   @id @default(uuid())
  name        String
  users       User[]
  sources     Source[]
  mentions    Mention[]
  alerts      Alert[]
  createdAt   DateTime @default(now())
}

// Utilisateurs
model User {
  id             String       @id @default(uuid())
  email          String       @unique
  password       String
  role           Role         @default(USER)
  organizationId String
  organization   Organization @relation(...)
}

// Sources surveillées
model Source {
  id             String       @id @default(uuid())
  type           SourceType   // Reddit, Twitter, Discord...
  name           String
  keywords       String[]
  isActive       Boolean      @default(true)
  organizationId String
  organization   Organization @relation(...)
  mentions       Mention[]
}

// Mentions détectées
model Mention {
  id               String       @id @default(uuid())
  text             String
  author           String
  url              String
  sourceId         String
  source           Source       @relation(...)
  sentiment        Sentiment?   // positive, neutral, negative
  sentimentScore   Float?
  emotions         String[]
  viralityScore    Float?
  organizationId   String
  organization     Organization @relation(...)
  alerts           Alert[]
  createdAt        DateTime     @default(now())
  analyzedAt       DateTime?
}

// Alertes
model Alert {
  id             String       @id @default(uuid())
  level          AlertLevel   // low, medium, critical
  type           String
  message        String
  status         AlertStatus  @default(NEW)
  mentionId      String
  mention        Mention      @relation(...)
  organizationId String
  organization   Organization @relation(...)
  actions        Action[]
  createdAt      DateTime     @default(now())
}

// Actions prises
model Action {
  id          String     @id @default(uuid())
  type        ActionType // response, private_message, article
  description String
  status      String     @default("pending")
  alertId     String
  alert       Alert      @relation(...)
  assignedTo  String?
  completedAt DateTime?
  createdAt   DateTime   @default(now())
}

// Rapports générés
model Report {
  id             String       @id @default(uuid())
  type           ReportType   // daily, weekly, monthly
  status         String       @default("pending")
  fileUrl        String?
  organizationId String
  organization   Organization @relation(...)
  startDate      DateTime
  endDate        DateTime
  generatedAt    DateTime?
  createdAt      DateTime     @default(now())
}

// Tendances (stats agrégées)
model Trend {
  id                   String       @id @default(uuid())
  date                 DateTime
  type                 String       // daily, weekly, monthly
  totalMentions        Int
  positiveMentions     Int
  neutralMentions      Int
  negativeMentions     Int
  averageSentimentScore Float
  averageViralityScore Float
  sourceBreakdown      Json
  topEmotions          String[]
  organizationId       String
  organization         Organization @relation(...)
  createdAt            DateTime     @default(now())
}
```

---

## 🔄 **FLUX DE DONNÉES**

### **1. Collecte de mentions**
```
Scraper → API (POST /mentions) → Redis Queue → Workers (Analysis) → IA Service → API (PATCH /mentions)
```

### **2. Génération d'alertes**
```
Mention analysée → Workers vérifie viralité → Si critique → API (POST /alerts) → Realtime (WebSocket) → Dashboard
```

### **3. Génération de rapports**
```
API (POST /reports) → Redis Queue → Workers (Reports) → Puppeteer PDF → S3/MinIO → Email (optionnel)
```

### **4. Notifications temps réel**
```
Alerte créée → API → Redis Pub/Sub → Realtime Service → WebSocket → Dashboard utilisateur