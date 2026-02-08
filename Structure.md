sentinelle-reputation
├─ .gemini
│  └─ sources-refactoring-summary.md
├─ ACTION_PLAN.md
├─ ai-service
│  ├─ .dockerignore
│  ├─ README.md
│  ├─ requirements-dev.txt
│  ├─ requirements.txt
│  └─ src
│     ├─ api
│     │  ├─ app.py
│     │  ├─ dependencies.py
│     │  ├─ routes
│     │  │  ├─ emotions.py
│     │  │  ├─ health.py
│     │  │  ├─ keywords.py
│     │  │  ├─ language.py
│     │  │  ├─ sentiment.py
│     │  │  ├─ topics.py
│     │  │  └─ __init__.py
│     │  └─ __init__.py
│     ├─ config
│     │  ├─ logging.py
│     │  ├─ settings.py
│     │  └─ __init__.py
│     ├─ main.py
│     ├─ models
│     │  ├─ emotion_detector.py
│     │  ├─ keyword_extractor.py
│     │  ├─ language_detector.py
│     │  ├─ model_state.py
│     │  ├─ sentiment_analyzer.py
│     │  ├─ topic_analyzer.py
│     │  └─ __init__.py
│     ├─ routes
│     ├─ schemas
│     │  ├─ requests.py
│     │  ├─ responses.py
│     │  └─ __init__.py
│     ├─ tests
│     │  ├─ test_keywords.py
│     │  ├─ test_preprocessing.py
│     │  ├─ test_sentiment.py
│     │  └─ __init__.py
│     └─ utils
│        ├─ cache.py
│        ├─ download_models.py
│        ├─ exceptions.py
│        ├─ preprocessing.py
│        └─ __init__.py
├─ api
│  ├─ .eslintrc.json
│  ├─ debug-source.ts
│  ├─ diagnostic.ts
│  ├─ jest.config.js
│  ├─ jest_output.txt
│  ├─ logs
│  ├─ package.json
│  ├─ pisma.config.js
│  ├─ pisma.config.ts
│  ├─ README
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ config
│  │  │  ├─ app.ts
│  │  │  ├─ plans.ts
│  │  │  └─ redis.ts
│  │  ├─ index.ts
│  │  ├─ infrastructure
│  │  │  ├─ cache
│  │  │  │  └─ redis.service.ts
│  │  │  ├─ email
│  │  │  │  └─ email.service.ts
│  │  │  ├─ errors
│  │  │  │  └─ app-error.ts
│  │  │  ├─ logger
│  │  │  │  └─ index.ts
│  │  │  ├─ monitoring
│  │  │  │  └─ prometheus.ts
│  │  │  ├─ queue
│  │  │  │  ├─ notifications.queue.ts
│  │  │  │  └─ scraping.queue.ts
│  │  │  ├─ storage
│  │  │  ├─ websocket
│  │  │  │  └─ websocket.service.ts
│  │  │  └─ worker
│  │  │     └─ scraping.worker.ts
│  │  ├─ modules
│  │  │  ├─ actions
│  │  │  │  ├─ actions.controller.ts
│  │  │  │  ├─ actions.repository.ts
│  │  │  │  ├─ actions.routes.ts
│  │  │  │  ├─ actions.service.ts
│  │  │  │  ├─ actions.types.ts
│  │  │  │  └─ actions.validation.ts
│  │  │  ├─ alerts
│  │  │  │  ├─ alerts.controller.ts
│  │  │  │  ├─ alerts.repository.ts
│  │  │  │  ├─ alerts.routes.ts
│  │  │  │  ├─ alerts.service.ts
│  │  │  │  ├─ alerts.types.ts
│  │  │  │  └─ alerts.validation.ts
│  │  │  ├─ analytics
│  │  │  │  ├─ analytics.controller.ts
│  │  │  │  ├─ analytics.routes.ts
│  │  │  │  ├─ analytics.service.ts
│  │  │  │  ├─ analytics.types.ts
│  │  │  │  └─ analytics.validation.ts
│  │  │  ├─ auth
│  │  │  │  ├─ auth.controller.ts
│  │  │  │  ├─ auth.routes.ts
│  │  │  │  ├─ auth.service.ts
│  │  │  │  ├─ auth.types.ts
│  │  │  │  ├─ auth.validation.ts
│  │  │  │  ├─ jwt.service.ts
│  │  │  │  └─ password.service.ts
│  │  │  ├─ billing
│  │  │  │  ├─ billing.controller.ts
│  │  │  │  ├─ billing.routes.ts
│  │  │  │  ├─ billing.service.ts
│  │  │  │  ├─ billing.types.ts
│  │  │  │  └─ billing.validation.ts
│  │  │  ├─ brands
│  │  │  │  ├─ brands.controller.ts
│  │  │  │  ├─ brands.repository.ts
│  │  │  │  ├─ brands.routes.ts
│  │  │  │  ├─ brands.service.ts
│  │  │  │  ├─ brands.types.ts
│  │  │  │  └─ brands.validation.ts
│  │  │  ├─ keywords
│  │  │  │  ├─ keywords.controller.ts
│  │  │  │  ├─ keywords.routes.ts
│  │  │  │  ├─ keywords.service.ts
│  │  │  │  ├─ keywords.types.ts
│  │  │  │  └─ keywords.validation.ts
│  │  │  ├─ mentions
│  │  │  │  ├─ mentions.archiving.service.ts
│  │  │  │  ├─ mentions.controller.test.ts
│  │  │  │  ├─ mentions.controller.ts
│  │  │  │  ├─ mentions.repository.ts
│  │  │  │  ├─ mentions.routes.ts
│  │  │  │  ├─ mentions.service.ts
│  │  │  │  ├─ mentions.types.ts
│  │  │  │  └─ mentions.validation.ts
│  │  │  ├─ notifications
│  │  │  │  ├─ notifications.controller.ts
│  │  │  │  ├─ notifications.routes.ts
│  │  │  │  ├─ notifications.service.ts
│  │  │  │  ├─ notifications.types.ts
│  │  │  │  ├─ notifications.validation.ts
│  │  │  │  ├─ README.md
│  │  │  │  └─ __tests__
│  │  │  │     └─ notifications.service.test.ts
│  │  │  ├─ organizations
│  │  │  │  ├─ organizations.controller.ts
│  │  │  │  ├─ organizations.routes.ts
│  │  │  │  ├─ organizations.service.ts
│  │  │  │  └─ organizations.types.ts
│  │  │  ├─ reports
│  │  │  │  ├─ reports.controller.test.ts
│  │  │  │  ├─ reports.controller.ts
│  │  │  │  ├─ reports.repository.ts
│  │  │  │  ├─ reports.routes.ts
│  │  │  │  ├─ reports.service.ts
│  │  │  │  ├─ reports.types.ts
│  │  │  │  └─ reports.validation.ts
│  │  │  ├─ sources
│  │  │  │  ├─ ENV_CONFIGURATION.md
│  │  │  │  ├─ INTEGRATION_GUIDE.md
│  │  │  │  ├─ QUICK_START.md
│  │  │  │  ├─ source-analyzer.controller.ts
│  │  │  │  ├─ source-analyzer.routes.ts
│  │  │  │  ├─ source-analyzer.service.ts
│  │  │  │  ├─ source-analyzer.test.ts
│  │  │  │  ├─ source-analyzer.ts
│  │  │  │  ├─ SOURCEANALYZER_SUMMARY.md
│  │  │  │  ├─ sources.controller.ts
│  │  │  │  ├─ sources.repository.ts
│  │  │  │  ├─ sources.routes.ts
│  │  │  │  ├─ sources.service.ts
│  │  │  │  ├─ sources.types.ts
│  │  │  │  ├─ sources.validation.ts
│  │  │  │  ├─ SOURCE_ANALYZER_GUIDE.md
│  │  │  │  └─ SOURCE_ANALYZER_README.md
│  │  │  ├─ system
│  │  │  │  ├─ system.controller.test.ts
│  │  │  │  ├─ system.controller.ts
│  │  │  │  └─ system.routes.ts
│  │  │  └─ users
│  │  │     ├─ users.controller.test.ts
│  │  │     ├─ users.controller.ts
│  │  │     ├─ users.routes.ts
│  │  │     ├─ users.service.ts
│  │  │     ├─ users.types.ts
│  │  │     └─ users.validation.ts
│  │  ├─ reproduce_issue.ts
│  │  ├─ server.ts
│  │  ├─ shared
│  │  │  ├─ config
│  │  │  │  └─ forbidden-domains.ts
│  │  │  ├─ constants
│  │  │  │  └─ plans.ts
│  │  │  ├─ database
│  │  │  │  └─ prisma.client.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ middleware
│  │  │  │  ├─ auth.middleware.ts
│  │  │  │  ├─ error.middleware.ts
│  │  │  │  ├─ ownership.middleware.ts
│  │  │  │  ├─ plan.middleware.ts
│  │  │  │  ├─ rate-limit.middleware.ts
│  │  │  │  └─ validate.middleware.ts
│  │  │  ├─ types
│  │  │  │  ├─ common.types.ts
│  │  │  │  ├─ express.d.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ utils
│  │  │  │  ├─ api-response.ts
│  │  │  │  ├─ async-handler.ts
│  │  │  │  ├─ errors.ts
│  │  │  │  ├─ normalize.ts
│  │  │  │  └─ pagination.ts
│  │  │  └─ validators
│  │  │     └─ schemas.ts
│  │  ├─ test-jest.test.ts
│  │  ├─ workers
│  │  │  ├─ index.ts
│  │  │  ├─ processors
│  │  │  │  └─ scraping.processor.ts
│  │  │  └─ schedulers
│  │  │     ├─ archiving.scheduler.ts
│  │  │     └─ scraping.scheduler.ts
│  │  └─ __tests__
│  │     └─ integration
│  │        └─ sources.test.ts
│  ├─ tsconfig-paths.json
│  └─ tsconfig.json
├─ api_logs.txt
├─ apps
│  ├─ admin
│  │  ├─ .dockerignore
│  │  ├─ .npmrc
│  │  ├─ .prettierrc
│  │  ├─ AGENTS.md
│  │  ├─ components.json
│  │  ├─ functions
│  │  │  ├─ api.js
│  │  │  └─ api.ts
│  │  ├─ index.html
│  │  ├─ netlify.toml
│  │  ├─ package.json
│  │  ├─ postcss.config.js
│  │  ├─ public
│  │  │  ├─ favicon.ico
│  │  │  ├─ placeholder.svg
│  │  │  └─ robots.txt
│  │  ├─ server
│  │  │  ├─ index.js
│  │  │  ├─ index.ts
│  │  │  ├─ node-build.js
│  │  │  ├─ node-build.ts
│  │  │  └─ routes
│  │  │     ├─ demo.js
│  │  │     └─ demo.ts
│  │  ├─ shared
│  │  │  ├─ api.js
│  │  │  └─ api.ts
│  │  ├─ src
│  │  │  ├─ App.js
│  │  │  ├─ App.tsx
│  │  │  ├─ assets
│  │  │  │  └─ react.svg
│  │  │  ├─ components
│  │  │  │  ├─ ai
│  │  │  │  │  ├─ AIModelCard.js
│  │  │  │  │  └─ AIModelCard.tsx
│  │  │  │  ├─ alerts
│  │  │  │  │  ├─ AdminAlertCard.js
│  │  │  │  │  └─ AdminAlertCard.tsx
│  │  │  │  ├─ auth
│  │  │  │  │  ├─ ProtectedRoute.js
│  │  │  │  │  └─ ProtectedRoute.tsx
│  │  │  │  ├─ connectors
│  │  │  │  │  ├─ ConnectorCard.js
│  │  │  │  │  └─ ConnectorCard.tsx
│  │  │  │  ├─ dashboard
│  │  │  │  │  ├─ ActivityItem.js
│  │  │  │  │  ├─ ActivityItem.tsx
│  │  │  │  │  ├─ AdminStatCard.js
│  │  │  │  │  ├─ AdminStatCard.tsx
│  │  │  │  │  ├─ ConnectorStatusItem.js
│  │  │  │  │  └─ ConnectorStatusItem.tsx
│  │  │  │  ├─ keywords
│  │  │  │  │  ├─ KeywordTableRow.js
│  │  │  │  │  └─ KeywordTableRow.tsx
│  │  │  │  ├─ layout
│  │  │  │  │  ├─ AdminHeader.js
│  │  │  │  │  ├─ AdminHeader.tsx
│  │  │  │  │  ├─ AdminLayout.js
│  │  │  │  │  ├─ AdminLayout.tsx
│  │  │  │  │  ├─ AdminSidebar.js
│  │  │  │  │  └─ AdminSidebar.tsx
│  │  │  │  ├─ organisations
│  │  │  │  │  ├─ OrganisationTableRow.js
│  │  │  │  │  └─ OrganisationTableRow.tsx
│  │  │  │  ├─ quality
│  │  │  │  │  ├─ QualityMetricCard.js
│  │  │  │  │  └─ QualityMetricCard.tsx
│  │  │  │  ├─ ui
│  │  │  │  │  ├─ accordion.js
│  │  │  │  │  ├─ accordion.tsx
│  │  │  │  │  ├─ alert-dialog.js
│  │  │  │  │  ├─ alert-dialog.tsx
│  │  │  │  │  ├─ alert.js
│  │  │  │  │  ├─ alert.tsx
│  │  │  │  │  ├─ aspect-ratio.js
│  │  │  │  │  ├─ aspect-ratio.tsx
│  │  │  │  │  ├─ avatar.js
│  │  │  │  │  ├─ avatar.tsx
│  │  │  │  │  ├─ badge.js
│  │  │  │  │  ├─ badge.tsx
│  │  │  │  │  ├─ breadcrumb.js
│  │  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  │  ├─ button.js
│  │  │  │  │  ├─ button.tsx
│  │  │  │  │  ├─ calendar.js
│  │  │  │  │  ├─ calendar.tsx
│  │  │  │  │  ├─ card.js
│  │  │  │  │  ├─ card.tsx
│  │  │  │  │  ├─ carousel.js
│  │  │  │  │  ├─ carousel.tsx
│  │  │  │  │  ├─ chart.js
│  │  │  │  │  ├─ chart.tsx
│  │  │  │  │  ├─ checkbox.js
│  │  │  │  │  ├─ checkbox.tsx
│  │  │  │  │  ├─ collapsible.js
│  │  │  │  │  ├─ collapsible.tsx
│  │  │  │  │  ├─ command.js
│  │  │  │  │  ├─ command.tsx
│  │  │  │  │  ├─ context-menu.js
│  │  │  │  │  ├─ context-menu.tsx
│  │  │  │  │  ├─ dialog.js
│  │  │  │  │  ├─ dialog.tsx
│  │  │  │  │  ├─ drawer.js
│  │  │  │  │  ├─ drawer.tsx
│  │  │  │  │  ├─ dropdown-menu.js
│  │  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  │  ├─ form.js
│  │  │  │  │  ├─ form.tsx
│  │  │  │  │  ├─ hover-card.js
│  │  │  │  │  ├─ hover-card.tsx
│  │  │  │  │  ├─ input-otp.js
│  │  │  │  │  ├─ input-otp.tsx
│  │  │  │  │  ├─ input.js
│  │  │  │  │  ├─ input.tsx
│  │  │  │  │  ├─ label.js
│  │  │  │  │  ├─ label.tsx
│  │  │  │  │  ├─ menubar.js
│  │  │  │  │  ├─ menubar.tsx
│  │  │  │  │  ├─ navigation-menu.js
│  │  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  │  ├─ pagination.js
│  │  │  │  │  ├─ pagination.tsx
│  │  │  │  │  ├─ popover.js
│  │  │  │  │  ├─ popover.tsx
│  │  │  │  │  ├─ progress.js
│  │  │  │  │  ├─ progress.tsx
│  │  │  │  │  ├─ radio-group.js
│  │  │  │  │  ├─ radio-group.tsx
│  │  │  │  │  ├─ resizable.js
│  │  │  │  │  ├─ resizable.tsx
│  │  │  │  │  ├─ scroll-area.js
│  │  │  │  │  ├─ scroll-area.tsx
│  │  │  │  │  ├─ select.js
│  │  │  │  │  ├─ select.tsx
│  │  │  │  │  ├─ separator.js
│  │  │  │  │  ├─ separator.tsx
│  │  │  │  │  ├─ sheet.js
│  │  │  │  │  ├─ sheet.tsx
│  │  │  │  │  ├─ sidebar.js
│  │  │  │  │  ├─ sidebar.tsx
│  │  │  │  │  ├─ skeleton.js
│  │  │  │  │  ├─ skeleton.tsx
│  │  │  │  │  ├─ slider.js
│  │  │  │  │  ├─ slider.tsx
│  │  │  │  │  ├─ sonner.js
│  │  │  │  │  ├─ sonner.tsx
│  │  │  │  │  ├─ switch.js
│  │  │  │  │  ├─ switch.tsx
│  │  │  │  │  ├─ table.js
│  │  │  │  │  ├─ table.tsx
│  │  │  │  │  ├─ tabs.js
│  │  │  │  │  ├─ tabs.tsx
│  │  │  │  │  ├─ textarea.js
│  │  │  │  │  ├─ textarea.tsx
│  │  │  │  │  ├─ toast.js
│  │  │  │  │  ├─ toast.tsx
│  │  │  │  │  ├─ toaster.js
│  │  │  │  │  ├─ toaster.tsx
│  │  │  │  │  ├─ toggle-group.js
│  │  │  │  │  ├─ toggle-group.tsx
│  │  │  │  │  ├─ toggle.js
│  │  │  │  │  ├─ toggle.tsx
│  │  │  │  │  ├─ tooltip.js
│  │  │  │  │  ├─ tooltip.tsx
│  │  │  │  │  ├─ use-toast.js
│  │  │  │  │  └─ use-toast.ts
│  │  │  │  └─ users
│  │  │  │     ├─ UserTableRow.js
│  │  │  │     └─ UserTableRow.tsx
│  │  │  ├─ contexts
│  │  │  │  ├─ AuthContext.js
│  │  │  │  ├─ AuthContext.tsx
│  │  │  │  ├─ ThemeContext.js
│  │  │  │  └─ ThemeContext.tsx
│  │  │  ├─ global.css
│  │  │  ├─ hooks
│  │  │  │  ├─ use-mobile.js
│  │  │  │  ├─ use-mobile.tsx
│  │  │  │  ├─ use-toast.js
│  │  │  │  └─ use-toast.ts
│  │  │  ├─ lib
│  │  │  │  ├─ api-client.js
│  │  │  │  ├─ api-client.ts
│  │  │  │  ├─ utils.js
│  │  │  │  └─ utils.ts
│  │  │  ├─ main.js
│  │  │  ├─ main.tsx
│  │  │  ├─ pages
│  │  │  │  ├─ Actions
│  │  │  │  │  ├─ ActionsPage.js
│  │  │  │  │  └─ ActionsPage.tsx
│  │  │  │  ├─ AI
│  │  │  │  │  ├─ AIPage.js
│  │  │  │  │  └─ AIPage.tsx
│  │  │  │  ├─ Alerts
│  │  │  │  │  ├─ Alerts.js
│  │  │  │  │  └─ Alerts.tsx
│  │  │  │  ├─ Auth
│  │  │  │  │  ├─ LoginPage.js
│  │  │  │  │  ├─ LoginPage.tsx
│  │  │  │  │  ├─ RegisterPage.js
│  │  │  │  │  └─ RegisterPage.tsx
│  │  │  │  ├─ Brands
│  │  │  │  │  ├─ BrandsPage.js
│  │  │  │  │  └─ BrandsPage.tsx
│  │  │  │  ├─ Connectors
│  │  │  │  │  ├─ Connectors.js
│  │  │  │  │  └─ Connectors.tsx
│  │  │  │  ├─ Dashboard
│  │  │  │  │  ├─ Dashboard.js
│  │  │  │  │  └─ Dashboard.tsx
│  │  │  │  ├─ Keywords
│  │  │  │  │  ├─ Keywords.js
│  │  │  │  │  └─ Keywords.tsx
│  │  │  │  ├─ Mentions
│  │  │  │  │  ├─ MentionsPage.js
│  │  │  │  │  └─ MentionsPage.tsx
│  │  │  │  ├─ NotFound.js
│  │  │  │  ├─ NotFound.tsx
│  │  │  │  ├─ Organisations
│  │  │  │  │  ├─ Organisations.js
│  │  │  │  │  └─ Organisations.tsx
│  │  │  │  ├─ Quality
│  │  │  │  │  ├─ QualityPage.js
│  │  │  │  │  └─ QualityPage.tsx
│  │  │  │  ├─ Sources
│  │  │  │  │  ├─ SourcesPage.js
│  │  │  │  │  └─ SourcesPage.tsx
│  │  │  │  └─ Users
│  │  │  │     ├─ Users.js
│  │  │  │     └─ Users.tsx
│  │  │  └─ vite-env.d.ts
│  │  ├─ tailwind.config.js
│  │  ├─ tailwind.config.ts
│  │  ├─ tsconfig.app.json
│  │  ├─ tsconfig.json
│  │  ├─ vite.config.server.js
│  │  ├─ vite.config.server.ts
│  │  └─ vite.config.ts
│  ├─ collecte
│  │  ├─ index.html
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ App.tsx
│  │  │  ├─ index.css
│  │  │  └─ main.tsx
│  │  ├─ tsconfig.json
│  │  ├─ tsconfig.node.json
│  │  └─ vite.config.ts
│  ├─ landing
│  │  ├─ .builder
│  │  │  └─ rules
│  │  │     ├─ deploy-app.mdc
│  │  │     └─ organize-ui.mdc
│  │  ├─ .dockerignore
│  │  ├─ .npmrc
│  │  ├─ .prettierrc
│  │  ├─ AGENTS.md
│  │  ├─ client
│  │  │  ├─ App.js
│  │  │  ├─ App.tsx
│  │  │  ├─ components
│  │  │  │  └─ ui
│  │  │  │     ├─ accordion.js
│  │  │  │     ├─ accordion.tsx
│  │  │  │     ├─ alert-dialog.js
│  │  │  │     ├─ alert-dialog.tsx
│  │  │  │     ├─ alert.js
│  │  │  │     ├─ alert.tsx
│  │  │  │     ├─ aspect-ratio.js
│  │  │  │     ├─ aspect-ratio.tsx
│  │  │  │     ├─ avatar.js
│  │  │  │     ├─ avatar.tsx
│  │  │  │     ├─ badge.js
│  │  │  │     ├─ badge.tsx
│  │  │  │     ├─ breadcrumb.js
│  │  │  │     ├─ breadcrumb.tsx
│  │  │  │     ├─ button.js
│  │  │  │     ├─ button.tsx
│  │  │  │     ├─ calendar.js
│  │  │  │     ├─ calendar.tsx
│  │  │  │     ├─ card.js
│  │  │  │     ├─ card.tsx
│  │  │  │     ├─ carousel.js
│  │  │  │     ├─ carousel.tsx
│  │  │  │     ├─ chart.js
│  │  │  │     ├─ chart.tsx
│  │  │  │     ├─ checkbox.js
│  │  │  │     ├─ checkbox.tsx
│  │  │  │     ├─ collapsible.js
│  │  │  │     ├─ collapsible.tsx
│  │  │  │     ├─ command.js
│  │  │  │     ├─ command.tsx
│  │  │  │     ├─ context-menu.js
│  │  │  │     ├─ context-menu.tsx
│  │  │  │     ├─ dialog.js
│  │  │  │     ├─ dialog.tsx
│  │  │  │     ├─ drawer.js
│  │  │  │     ├─ drawer.tsx
│  │  │  │     ├─ dropdown-menu.js
│  │  │  │     ├─ dropdown-menu.tsx
│  │  │  │     ├─ form.js
│  │  │  │     ├─ form.tsx
│  │  │  │     ├─ hover-card.js
│  │  │  │     ├─ hover-card.tsx
│  │  │  │     ├─ input-otp.js
│  │  │  │     ├─ input-otp.tsx
│  │  │  │     ├─ input.js
│  │  │  │     ├─ input.tsx
│  │  │  │     ├─ label.js
│  │  │  │     ├─ label.tsx
│  │  │  │     ├─ menubar.js
│  │  │  │     ├─ menubar.tsx
│  │  │  │     ├─ navigation-menu.js
│  │  │  │     ├─ navigation-menu.tsx
│  │  │  │     ├─ pagination.js
│  │  │  │     ├─ pagination.tsx
│  │  │  │     ├─ popover.js
│  │  │  │     ├─ popover.tsx
│  │  │  │     ├─ progress.js
│  │  │  │     ├─ progress.tsx
│  │  │  │     ├─ radio-group.js
│  │  │  │     ├─ radio-group.tsx
│  │  │  │     ├─ resizable.js
│  │  │  │     ├─ resizable.tsx
│  │  │  │     ├─ scroll-area.js
│  │  │  │     ├─ scroll-area.tsx
│  │  │  │     ├─ select.js
│  │  │  │     ├─ select.tsx
│  │  │  │     ├─ separator.js
│  │  │  │     ├─ separator.tsx
│  │  │  │     ├─ sheet.js
│  │  │  │     ├─ sheet.tsx
│  │  │  │     ├─ sidebar.js
│  │  │  │     ├─ sidebar.tsx
│  │  │  │     ├─ skeleton.js
│  │  │  │     ├─ skeleton.tsx
│  │  │  │     ├─ slider.js
│  │  │  │     ├─ slider.tsx
│  │  │  │     ├─ sonner.js
│  │  │  │     ├─ sonner.tsx
│  │  │  │     ├─ switch.js
│  │  │  │     ├─ switch.tsx
│  │  │  │     ├─ table.js
│  │  │  │     ├─ table.tsx
│  │  │  │     ├─ tabs.js
│  │  │  │     ├─ tabs.tsx
│  │  │  │     ├─ textarea.js
│  │  │  │     ├─ textarea.tsx
│  │  │  │     ├─ toast.js
│  │  │  │     ├─ toast.tsx
│  │  │  │     ├─ toaster.js
│  │  │  │     ├─ toaster.tsx
│  │  │  │     ├─ toggle-group.js
│  │  │  │     ├─ toggle-group.tsx
│  │  │  │     ├─ toggle.js
│  │  │  │     ├─ toggle.tsx
│  │  │  │     ├─ tooltip.js
│  │  │  │     ├─ tooltip.tsx
│  │  │  │     ├─ use-toast.js
│  │  │  │     └─ use-toast.ts
│  │  │  ├─ global.css
│  │  │  ├─ hooks
│  │  │  │  ├─ use-mobile.js
│  │  │  │  ├─ use-mobile.tsx
│  │  │  │  ├─ use-toast.js
│  │  │  │  └─ use-toast.ts
│  │  │  ├─ lib
│  │  │  │  ├─ utils.js
│  │  │  │  ├─ utils.spec.js
│  │  │  │  ├─ utils.spec.ts
│  │  │  │  └─ utils.ts
│  │  │  ├─ pages
│  │  │  │  ├─ Index.js
│  │  │  │  ├─ Index.tsx
│  │  │  │  ├─ NotFound.js
│  │  │  │  └─ NotFound.tsx
│  │  │  └─ vite-env.d.ts
│  │  ├─ components.json
│  │  ├─ index.html
│  │  ├─ netlify
│  │  │  └─ functions
│  │  │     ├─ api.js
│  │  │     └─ api.ts
│  │  ├─ netlify.toml
│  │  ├─ package.json
│  │  ├─ postcss.config.js
│  │  ├─ public
│  │  │  ├─ favicon.ico
│  │  │  ├─ placeholder.svg
│  │  │  └─ robots.txt
│  │  ├─ server
│  │  │  ├─ index.js
│  │  │  ├─ index.ts
│  │  │  ├─ node-build.js
│  │  │  ├─ node-build.ts
│  │  │  └─ routes
│  │  │     ├─ demo.js
│  │  │     └─ demo.ts
│  │  ├─ shared
│  │  │  ├─ api.js
│  │  │  └─ api.ts
│  │  ├─ tailwind.config.js
│  │  ├─ tailwind.config.ts
│  │  ├─ tsconfig.json
│  │  ├─ vite.config.js
│  │  ├─ vite.config.server.js
│  │  ├─ vite.config.server.ts
│  │  └─ vite.config.ts
│  └─ web
│     ├─ .dockerignore
│     ├─ .npmrc
│     ├─ .prettierrc
│     ├─ AGENTS.md
│     ├─ components.json
│     ├─ functions
│     │  ├─ api.js
│     │  └─ api.ts
│     ├─ index.html
│     ├─ netlify.toml
│     ├─ package.json
│     ├─ postcss.config.js
│     ├─ public
│     │  ├─ favicon.ico
│     │  ├─ logoicon.svg
│     │  ├─ placeholder.svg
│     │  ├─ robots.txt
│     │  └─ sentinelleLogo.svg
│     ├─ server
│     │  ├─ index.js
│     │  ├─ index.ts
│     │  ├─ node-build.js
│     │  ├─ node-build.ts
│     │  └─ routes
│     │     ├─ demo.js
│     │     └─ demo.ts
│     ├─ shared
│     │  ├─ api.js
│     │  └─ api.ts
│     ├─ src
│     │  ├─ api
│     │  │  └─ src
│     │  │     └─ services
│     │  ├─ App.tsx
│     │  ├─ assets
│     │  │  └─ react.svg
│     │  ├─ components
│     │  │  ├─ actions
│     │  │  │  ├─ ActionDetailModal.tsx
│     │  │  │  ├─ ActionFormModal.tsx
│     │  │  │  └─ ActionItemCard.tsx
│     │  │  ├─ alerts
│     │  │  │  ├─ AlertCard.tsx
│     │  │  │  └─ AlertDetailModal.tsx
│     │  │  ├─ analysis
│     │  │  │  ├─ ActiveInfluencers.tsx
│     │  │  │  ├─ AIInsights.tsx
│     │  │  │  ├─ PeriodSelector.tsx
│     │  │  │  ├─ SentimentAnalysis.tsx
│     │  │  │  ├─ SentimentTimeline.tsx
│     │  │  │  ├─ SourcesBreakdown.tsx
│     │  │  │  └─ TrendingKeywords.tsx
│     │  │  ├─ auth
│     │  │  │  └─ ProtectedRoute.tsx
│     │  │  ├─ brands
│     │  │  │  └─ BrandFormModal.tsx
│     │  │  ├─ dashboard
│     │  │  │  ├─ ActivityChart.tsx
│     │  │  │  ├─ BarChart.tsx
│     │  │  │  ├─ DonutChart.tsx
│     │  │  │  ├─ LineChart.tsx
│     │  │  │  └─ StatCard.tsx
│     │  │  ├─ layout
│     │  │  │  ├─ BrandSelector.tsx
│     │  │  │  ├─ Header.tsx
│     │  │  │  ├─ Layout.tsx
│     │  │  │  ├─ RightSidebar.tsx
│     │  │  │  └─ Sidebar.tsx
│     │  │  ├─ mentions
│     │  │  │  ├─ MentionCard.tsx
│     │  │  │  └─ MentionDetailModal.tsx
│     │  │  ├─ onboarding
│     │  │  │  ├─ NavigationButtons.tsx
│     │  │  │  ├─ OnboardingLayout.tsx
│     │  │  │  ├─ ProductCard.tsx
│     │  │  │  └─ ProgressSteps.tsx
│     │  │  ├─ reports
│     │  │  │  ├─ ReportCard.tsx
│     │  │  │  └─ ScheduledReportItem.tsx
│     │  │  ├─ shared
│     │  │  │  └─ ConfirmModal.tsx
│     │  │  ├─ sources
│     │  │  │  ├─ ConnectSourceModal.tsx
│     │  │  │  ├─ index.js
│     │  │  │  ├─ index.ts
│     │  │  │  ├─ SourceCard.tsx
│     │  │  │  ├─ SourceForm.tsx
│     │  │  │  ├─ SourcesList.tsx
│     │  │  │  └─ SourceTypeSelector.tsx
│     │  │  ├─ started
│     │  │  │  └─ ProductCard.tsx
│     │  │  └─ ui
│     │  │     ├─ accordion.tsx
│     │  │     ├─ alert-dialog.tsx
│     │  │     ├─ alert.tsx
│     │  │     ├─ aspect-ratio.tsx
│     │  │     ├─ avatar.tsx
│     │  │     ├─ badge.tsx
│     │  │     ├─ breadcrumb.tsx
│     │  │     ├─ button.tsx
│     │  │     ├─ calendar.tsx
│     │  │     ├─ card.tsx
│     │  │     ├─ carousel.tsx
│     │  │     ├─ chart.tsx
│     │  │     ├─ checkbox.tsx
│     │  │     ├─ collapsible.tsx
│     │  │     ├─ command.tsx
│     │  │     ├─ context-menu.tsx
│     │  │     ├─ dialog.tsx
│     │  │     ├─ drawer.tsx
│     │  │     ├─ dropdown-menu.tsx
│     │  │     ├─ form.tsx
│     │  │     ├─ hover-card.tsx
│     │  │     ├─ input-otp.tsx
│     │  │     ├─ input.tsx
│     │  │     ├─ label.tsx
│     │  │     ├─ menubar.tsx
│     │  │     ├─ navigation-menu.tsx
│     │  │     ├─ pagination.tsx
│     │  │     ├─ popover.tsx
│     │  │     ├─ progress.tsx
│     │  │     ├─ radio-group.tsx
│     │  │     ├─ resizable.tsx
│     │  │     ├─ scroll-area.tsx
│     │  │     ├─ select.tsx
│     │  │     ├─ separator.tsx
│     │  │     ├─ sheet.tsx
│     │  │     ├─ sidebar.tsx
│     │  │     ├─ skeleton.tsx
│     │  │     ├─ slider.tsx
│     │  │     ├─ sonner.tsx
│     │  │     ├─ switch.tsx
│     │  │     ├─ table.tsx
│     │  │     ├─ tabs.tsx
│     │  │     ├─ textarea.tsx
│     │  │     ├─ toast.tsx
│     │  │     ├─ toaster.tsx
│     │  │     ├─ toggle-group.tsx
│     │  │     ├─ toggle.tsx
│     │  │     ├─ tooltip.tsx
│     │  │     └─ use-toast.ts
│     │  ├─ contexts
│     │  │  ├─ AuthContext.tsx
│     │  │  ├─ BrandContext.tsx
│     │  │  ├─ OnboardingContext.tsx
│     │  │  └─ ThemeContext.tsx
│     │  ├─ global.css
│     │  ├─ hooks
│     │  │  ├─ use-mobile.tsx
│     │  │  ├─ use-toast.ts
│     │  │  ├─ useApi.ts
│     │  │  ├─ useBrandListener.ts
│     │  │  └─ usePlan.ts
│     │  ├─ lib
│     │  │  ├─ api-client.ts
│     │  │  ├─ api-error-handler.ts
│     │  │  ├─ utils.js
│     │  │  └─ utils.ts
│     │  ├─ pages
│     │  │  ├─ Actions
│     │  │  │  └─ Actions.tsx
│     │  │  ├─ Alerts
│     │  │  │  └─ Alerts.tsx
│     │  │  ├─ Analysis
│     │  │  │  └─ Analysis.tsx
│     │  │  ├─ Auth
│     │  │  │  ├─ AuthLayout.tsx
│     │  │  │  ├─ ForgotPassword.tsx
│     │  │  │  ├─ ResetPasswordPage.tsx
│     │  │  │  ├─ SignInPage.tsx
│     │  │  │  ├─ SignUpPage.tsx
│     │  │  │  ├─ TwoFactorAuth.tsx
│     │  │  │  └─ VerifyEmail.tsx
│     │  │  ├─ Brands
│     │  │  │  └─ Brands.tsx
│     │  │  ├─ Dashboard
│     │  │  │  └─ Dashboard.tsx
│     │  │  ├─ Keywords
│     │  │  │  └─ Keywords.tsx
│     │  │  ├─ Mentions
│     │  │  │  └─ Mentions.tsx
│     │  │  ├─ NotFound.tsx
│     │  │  ├─ Onboarding
│     │  │  │  ├─ OnboardingAlerts.tsx
│     │  │  │  ├─ OnboardingComplete.tsx
│     │  │  │  ├─ OnboardingInvite.tsx
│     │  │  │  ├─ OnboardingLoader.tsx
│     │  │  │  ├─ OnboardingPlateforms.tsx
│     │  │  │  ├─ OnboardingProduct.tsx
│     │  │  │  ├─ OnboardingSetup.tsx
│     │  │  │  └─ Started.tsx
│     │  │  ├─ Reports
│     │  │  │  └─ Reports.tsx
│     │  │  ├─ Settings
│     │  │  │  └─ Settings.tsx
│     │  │  └─ Sources
│     │  │     └─ Sources.tsx
│     │  ├─ services
│     │  │  ├─ actions.service.ts
│     │  │  ├─ alerts.service.ts
│     │  │  ├─ analytics.service.ts
│     │  │  ├─ brands.service.ts
│     │  │  ├─ dashboard.service.ts
│     │  │  ├─ keywords.service.ts
│     │  │  ├─ mentions.service.ts
│     │  │  ├─ organizations.service.ts
│     │  │  ├─ reports.service.ts
│     │  │  ├─ sources.service.ts
│     │  │  └─ users.service.ts
│     │  ├─ types
│     │  │  ├─ api.ts
│     │  │  ├─ http.ts
│     │  │  ├─ index.ts
│     │  │  ├─ models.js
│     │  │  └─ models.ts
│     │  └─ vite-env.d.ts
│     ├─ tailwind.config.js
│     ├─ tailwind.config.ts
│     ├─ tsconfig.app.json
│     ├─ tsconfig.json
│     ├─ vite.config.js
│     ├─ vite.config.server.js
│     ├─ vite.config.server.ts
│     └─ vite.config.ts
├─ ARCHITECTURE_ANALYSIS.md
├─ AUDIT_RAPPORT.md
├─ CLEANUP_SOCIAL_MEDIA.md
├─ cleanup_social_sources.sql
├─ CODE_TEMPLATES.md
├─ database
│  ├─ debug_scraping.ts
│  ├─ force_reset.ts
│  ├─ package.json
│  ├─ prisma
│  │  ├─ schema.prisma
│  │  ├─ seed.js
│  │  └─ seed.ts
│  ├─ setup-active-sources.ts
│  ├─ src
│  │  ├─ index.js
│  │  └─ index.ts
│  ├─ test_user.sql
│  └─ tsconfig.json
├─ DELIVERABLES.md
├─ docker-compose.yaml
├─ GUIDE_TEST.md
├─ INDEX_DOCUMENTS.md
├─ infrastructure
│  ├─ docker
│  │  ├─ Dockerfile.ai
│  │  ├─ Dockerfile.api
│  │  └─ Dockerfile.workers
│  └─ k8s
│     ├─ ai.yaml
│     ├─ api.yaml
│     └─ workers.yaml
├─ insert_google_reviews.sql
├─ insert_source.sql
├─ package-lock.json
├─ package.json
├─ PHASE_1_COMPLETE.md
├─ PHASE_1_TESTS.md
├─ PHASE_2_PROGRESS.md
├─ PHASE_3_PROGRESS.md
├─ README.md
├─ RESUME_FINAL.md
├─ scrapers
│  ├─ data
│  │  └─ senscritique_results.jsonl
│  ├─ inspect_sc.py
│  ├─ README.md
│  ├─ requirements.txt
│  ├─ scrapy.cfg
│  └─ sentinelle_scrapers
│     ├─ items.py
│     ├─ middlewares.py
│     ├─ pipelines.py
│     ├─ settings.py
│     ├─ spiders
│     │  ├─ google_reviews.py
│     │  ├─ news.py
│     │  ├─ senscritique.py
│     │  ├─ template_spider.py.example
│     │  ├─ trustpilot.py
│     │  └─ __init__.py
│     └─ __init__.py
├─ shared
│  ├─ constants
│  │  ├─ plans.js
│  │  └─ plans.ts
│  ├─ index.js
│  ├─ index.ts
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ types
│  │  ├─ index.js
│  │  └─ index.ts
│  └─ validators
│     ├─ index.js
│     ├─ index.ts
│     ├─ schemas.js
│     └─ schemas.ts
├─ START_HERE.md
├─ SUMMARY.txt
├─ turbo.json
├─ update_keywords.sql
└─ update_source_type.sql

sentinelle-reputation
├─ .gemini
│  └─ sources-refactoring-summary.md
├─ ACTION_PLAN.md
├─ ai-service
│  ├─ .dockerignore
│  ├─ README.md
│  ├─ requirements-dev.txt
│  ├─ requirements.txt
│  └─ src
│     ├─ api
│     │  ├─ app.py
│     │  ├─ dependencies.py
│     │  ├─ routes
│     │  │  ├─ emotions.py
│     │  │  ├─ health.py
│     │  │  ├─ keywords.py
│     │  │  ├─ language.py
│     │  │  ├─ sentiment.py
│     │  │  ├─ topics.py
│     │  │  └─ __init__.py
│     │  └─ __init__.py
│     ├─ config
│     │  ├─ logging.py
│     │  ├─ settings.py
│     │  └─ __init__.py
│     ├─ main.py
│     ├─ models
│     │  ├─ emotion_detector.py
│     │  ├─ keyword_extractor.py
│     │  ├─ language_detector.py
│     │  ├─ model_state.py
│     │  ├─ sentiment_analyzer.py
│     │  ├─ topic_analyzer.py
│     │  └─ __init__.py
│     ├─ routes
│     ├─ schemas
│     │  ├─ requests.py
│     │  ├─ responses.py
│     │  └─ __init__.py
│     ├─ tests
│     │  ├─ test_keywords.py
│     │  ├─ test_preprocessing.py
│     │  ├─ test_sentiment.py
│     │  └─ __init__.py
│     └─ utils
│        ├─ cache.py
│        ├─ download_models.py
│        ├─ exceptions.py
│        ├─ preprocessing.py
│        └─ __init__.py
├─ api
│  ├─ .eslintrc.json
│  ├─ debug-source.ts
│  ├─ diagnostic.ts
│  ├─ jest.config.js
│  ├─ jest_output.txt
│  ├─ logs
│  ├─ package.json
│  ├─ pisma.config.js
│  ├─ pisma.config.ts
│  ├─ README
│  ├─ src
│  │  ├─ app.ts
│  │  ├─ config
│  │  │  ├─ app.ts
│  │  │  ├─ plans.ts
│  │  │  └─ redis.ts
│  │  ├─ index.ts
│  │  ├─ infrastructure
│  │  │  ├─ cache
│  │  │  │  └─ redis.service.ts
│  │  │  ├─ email
│  │  │  │  └─ email.service.ts
│  │  │  ├─ errors
│  │  │  │  └─ app-error.ts
│  │  │  ├─ logger
│  │  │  │  └─ index.ts
│  │  │  ├─ monitoring
│  │  │  │  └─ prometheus.ts
│  │  │  ├─ queue
│  │  │  │  ├─ notifications.queue.ts
│  │  │  │  └─ scraping.queue.ts
│  │  │  ├─ storage
│  │  │  ├─ websocket
│  │  │  │  └─ websocket.service.ts
│  │  │  └─ worker
│  │  │     └─ scraping.worker.ts
│  │  ├─ modules
│  │  │  ├─ actions
│  │  │  │  ├─ actions.controller.ts
│  │  │  │  ├─ actions.repository.ts
│  │  │  │  ├─ actions.routes.ts
│  │  │  │  ├─ actions.service.ts
│  │  │  │  ├─ actions.types.ts
│  │  │  │  └─ actions.validation.ts
│  │  │  ├─ alerts
│  │  │  │  ├─ alerts.controller.ts
│  │  │  │  ├─ alerts.repository.ts
│  │  │  │  ├─ alerts.routes.ts
│  │  │  │  ├─ alerts.service.ts
│  │  │  │  ├─ alerts.types.ts
│  │  │  │  └─ alerts.validation.ts
│  │  │  ├─ analytics
│  │  │  │  ├─ analytics.controller.ts
│  │  │  │  ├─ analytics.routes.ts
│  │  │  │  ├─ analytics.service.ts
│  │  │  │  ├─ analytics.types.ts
│  │  │  │  └─ analytics.validation.ts
│  │  │  ├─ auth
│  │  │  │  ├─ auth.controller.ts
│  │  │  │  ├─ auth.routes.ts
│  │  │  │  ├─ auth.service.ts
│  │  │  │  ├─ auth.types.ts
│  │  │  │  ├─ auth.validation.ts
│  │  │  │  ├─ jwt.service.ts
│  │  │  │  └─ password.service.ts
│  │  │  ├─ billing
│  │  │  │  ├─ billing.controller.ts
│  │  │  │  ├─ billing.routes.ts
│  │  │  │  ├─ billing.service.ts
│  │  │  │  ├─ billing.types.ts
│  │  │  │  └─ billing.validation.ts
│  │  │  ├─ brands
│  │  │  │  ├─ brands.controller.ts
│  │  │  │  ├─ brands.repository.ts
│  │  │  │  ├─ brands.routes.ts
│  │  │  │  ├─ brands.service.ts
│  │  │  │  ├─ brands.types.ts
│  │  │  │  └─ brands.validation.ts
│  │  │  ├─ keywords
│  │  │  │  ├─ keywords.controller.ts
│  │  │  │  ├─ keywords.routes.ts
│  │  │  │  ├─ keywords.service.ts
│  │  │  │  ├─ keywords.types.ts
│  │  │  │  └─ keywords.validation.ts
│  │  │  ├─ mentions
│  │  │  │  ├─ mentions.archiving.service.ts
│  │  │  │  ├─ mentions.controller.test.ts
│  │  │  │  ├─ mentions.controller.ts
│  │  │  │  ├─ mentions.repository.ts
│  │  │  │  ├─ mentions.routes.ts
│  │  │  │  ├─ mentions.service.ts
│  │  │  │  ├─ mentions.types.ts
│  │  │  │  └─ mentions.validation.ts
│  │  │  ├─ notifications
│  │  │  │  ├─ notifications.controller.ts
│  │  │  │  ├─ notifications.routes.ts
│  │  │  │  ├─ notifications.service.ts
│  │  │  │  ├─ notifications.types.ts
│  │  │  │  ├─ notifications.validation.ts
│  │  │  │  ├─ README.md
│  │  │  │  └─ __tests__
│  │  │  │     └─ notifications.service.test.ts
│  │  │  ├─ organizations
│  │  │  │  ├─ organizations.controller.ts
│  │  │  │  ├─ organizations.routes.ts
│  │  │  │  ├─ organizations.service.ts
│  │  │  │  └─ organizations.types.ts
│  │  │  ├─ reports
│  │  │  │  ├─ reports.controller.test.ts
│  │  │  │  ├─ reports.controller.ts
│  │  │  │  ├─ reports.repository.ts
│  │  │  │  ├─ reports.routes.ts
│  │  │  │  ├─ reports.service.ts
│  │  │  │  ├─ reports.types.ts
│  │  │  │  └─ reports.validation.ts
│  │  │  ├─ sources
│  │  │  │  ├─ ENV_CONFIGURATION.md
│  │  │  │  ├─ INTEGRATION_GUIDE.md
│  │  │  │  ├─ QUICK_START.md
│  │  │  │  ├─ source-analyzer.controller.ts
│  │  │  │  ├─ source-analyzer.routes.ts
│  │  │  │  ├─ source-analyzer.service.ts
│  │  │  │  ├─ source-analyzer.test.ts
│  │  │  │  ├─ source-analyzer.ts
│  │  │  │  ├─ SOURCEANALYZER_SUMMARY.md
│  │  │  │  ├─ sources.controller.ts
│  │  │  │  ├─ sources.repository.ts
│  │  │  │  ├─ sources.routes.ts
│  │  │  │  ├─ sources.service.ts
│  │  │  │  ├─ sources.types.ts
│  │  │  │  ├─ sources.validation.ts
│  │  │  │  ├─ SOURCE_ANALYZER_GUIDE.md
│  │  │  │  └─ SOURCE_ANALYZER_README.md
│  │  │  ├─ system
│  │  │  │  ├─ system.controller.test.ts
│  │  │  │  ├─ system.controller.ts
│  │  │  │  └─ system.routes.ts
│  │  │  └─ users
│  │  │     ├─ users.controller.test.ts
│  │  │     ├─ users.controller.ts
│  │  │     ├─ users.routes.ts
│  │  │     ├─ users.service.ts
│  │  │     ├─ users.types.ts
│  │  │     └─ users.validation.ts
│  │  ├─ reproduce_issue.ts
│  │  ├─ server.ts
│  │  ├─ shared
│  │  │  ├─ config
│  │  │  │  └─ forbidden-domains.ts
│  │  │  ├─ constants
│  │  │  │  └─ plans.ts
│  │  │  ├─ database
│  │  │  │  └─ prisma.client.ts
│  │  │  ├─ logger.ts
│  │  │  ├─ middleware
│  │  │  │  ├─ auth.middleware.ts
│  │  │  │  ├─ error.middleware.ts
│  │  │  │  ├─ ownership.middleware.ts
│  │  │  │  ├─ plan.middleware.ts
│  │  │  │  ├─ rate-limit.middleware.ts
│  │  │  │  └─ validate.middleware.ts
│  │  │  ├─ types
│  │  │  │  ├─ common.types.ts
│  │  │  │  ├─ express.d.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ utils
│  │  │  │  ├─ api-response.ts
│  │  │  │  ├─ async-handler.ts
│  │  │  │  ├─ errors.ts
│  │  │  │  ├─ normalize.ts
│  │  │  │  └─ pagination.ts
│  │  │  └─ validators
│  │  │     └─ schemas.ts
│  │  ├─ test-jest.test.ts
│  │  ├─ workers
│  │  │  ├─ index.ts
│  │  │  ├─ processors
│  │  │  │  └─ scraping.processor.ts
│  │  │  └─ schedulers
│  │  │     ├─ archiving.scheduler.ts
│  │  │     └─ scraping.scheduler.ts
│  │  └─ __tests__
│  │     └─ integration
│  │        └─ sources.test.ts
│  ├─ tsconfig-paths.json
│  └─ tsconfig.json
├─ api_logs.txt
├─ apps
│  ├─ admin
│  │  ├─ .dockerignore
│  │  ├─ .npmrc
│  │  ├─ .prettierrc
│  │  ├─ AGENTS.md
│  │  ├─ components.json
│  │  ├─ functions
│  │  │  ├─ api.js
│  │  │  └─ api.ts
│  │  ├─ index.html
│  │  ├─ netlify.toml
│  │  ├─ package.json
│  │  ├─ postcss.config.js
│  │  ├─ public
│  │  │  ├─ favicon.ico
│  │  │  ├─ placeholder.svg
│  │  │  └─ robots.txt
│  │  ├─ server
│  │  │  ├─ index.js
│  │  │  ├─ index.ts
│  │  │  ├─ node-build.js
│  │  │  ├─ node-build.ts
│  │  │  └─ routes
│  │  │     ├─ demo.js
│  │  │     └─ demo.ts
│  │  ├─ shared
│  │  │  ├─ api.js
│  │  │  └─ api.ts
│  │  ├─ src
│  │  │  ├─ App.js
│  │  │  ├─ App.tsx
│  │  │  ├─ assets
│  │  │  │  └─ react.svg
│  │  │  ├─ components
│  │  │  │  ├─ ai
│  │  │  │  │  ├─ AIModelCard.js
│  │  │  │  │  └─ AIModelCard.tsx
│  │  │  │  ├─ alerts
│  │  │  │  │  ├─ AdminAlertCard.js
│  │  │  │  │  └─ AdminAlertCard.tsx
│  │  │  │  ├─ auth
│  │  │  │  │  ├─ ProtectedRoute.js
│  │  │  │  │  └─ ProtectedRoute.tsx
│  │  │  │  ├─ connectors
│  │  │  │  │  ├─ ConnectorCard.js
│  │  │  │  │  └─ ConnectorCard.tsx
│  │  │  │  ├─ dashboard
│  │  │  │  │  ├─ ActivityItem.js
│  │  │  │  │  ├─ ActivityItem.tsx
│  │  │  │  │  ├─ AdminStatCard.js
│  │  │  │  │  ├─ AdminStatCard.tsx
│  │  │  │  │  ├─ ConnectorStatusItem.js
│  │  │  │  │  └─ ConnectorStatusItem.tsx
│  │  │  │  ├─ keywords
│  │  │  │  │  ├─ KeywordTableRow.js
│  │  │  │  │  └─ KeywordTableRow.tsx
│  │  │  │  ├─ layout
│  │  │  │  │  ├─ AdminHeader.js
│  │  │  │  │  ├─ AdminHeader.tsx
│  │  │  │  │  ├─ AdminLayout.js
│  │  │  │  │  ├─ AdminLayout.tsx
│  │  │  │  │  ├─ AdminSidebar.js
│  │  │  │  │  └─ AdminSidebar.tsx
│  │  │  │  ├─ organisations
│  │  │  │  │  ├─ OrganisationTableRow.js
│  │  │  │  │  └─ OrganisationTableRow.tsx
│  │  │  │  ├─ quality
│  │  │  │  │  ├─ QualityMetricCard.js
│  │  │  │  │  └─ QualityMetricCard.tsx
│  │  │  │  ├─ ui
│  │  │  │  │  ├─ accordion.js
│  │  │  │  │  ├─ accordion.tsx
│  │  │  │  │  ├─ alert-dialog.js
│  │  │  │  │  ├─ alert-dialog.tsx
│  │  │  │  │  ├─ alert.js
│  │  │  │  │  ├─ alert.tsx
│  │  │  │  │  ├─ aspect-ratio.js
│  │  │  │  │  ├─ aspect-ratio.tsx
│  │  │  │  │  ├─ avatar.js
│  │  │  │  │  ├─ avatar.tsx
│  │  │  │  │  ├─ badge.js
│  │  │  │  │  ├─ badge.tsx
│  │  │  │  │  ├─ breadcrumb.js
│  │  │  │  │  ├─ breadcrumb.tsx
│  │  │  │  │  ├─ button.js
│  │  │  │  │  ├─ button.tsx
│  │  │  │  │  ├─ calendar.js
│  │  │  │  │  ├─ calendar.tsx
│  │  │  │  │  ├─ card.js
│  │  │  │  │  ├─ card.tsx
│  │  │  │  │  ├─ carousel.js
│  │  │  │  │  ├─ carousel.tsx
│  │  │  │  │  ├─ chart.js
│  │  │  │  │  ├─ chart.tsx
│  │  │  │  │  ├─ checkbox.js
│  │  │  │  │  ├─ checkbox.tsx
│  │  │  │  │  ├─ collapsible.js
│  │  │  │  │  ├─ collapsible.tsx
│  │  │  │  │  ├─ command.js
│  │  │  │  │  ├─ command.tsx
│  │  │  │  │  ├─ context-menu.js
│  │  │  │  │  ├─ context-menu.tsx
│  │  │  │  │  ├─ dialog.js
│  │  │  │  │  ├─ dialog.tsx
│  │  │  │  │  ├─ drawer.js
│  │  │  │  │  ├─ drawer.tsx
│  │  │  │  │  ├─ dropdown-menu.js
│  │  │  │  │  ├─ dropdown-menu.tsx
│  │  │  │  │  ├─ form.js
│  │  │  │  │  ├─ form.tsx
│  │  │  │  │  ├─ hover-card.js
│  │  │  │  │  ├─ hover-card.tsx
│  │  │  │  │  ├─ input-otp.js
│  │  │  │  │  ├─ input-otp.tsx
│  │  │  │  │  ├─ input.js
│  │  │  │  │  ├─ input.tsx
│  │  │  │  │  ├─ label.js
│  │  │  │  │  ├─ label.tsx
│  │  │  │  │  ├─ menubar.js
│  │  │  │  │  ├─ menubar.tsx
│  │  │  │  │  ├─ navigation-menu.js
│  │  │  │  │  ├─ navigation-menu.tsx
│  │  │  │  │  ├─ pagination.js
│  │  │  │  │  ├─ pagination.tsx
│  │  │  │  │  ├─ popover.js
│  │  │  │  │  ├─ popover.tsx
│  │  │  │  │  ├─ progress.js
│  │  │  │  │  ├─ progress.tsx
│  │  │  │  │  ├─ radio-group.js
│  │  │  │  │  ├─ radio-group.tsx
│  │  │  │  │  ├─ resizable.js
│  │  │  │  │  ├─ resizable.tsx
│  │  │  │  │  ├─ scroll-area.js
│  │  │  │  │  ├─ scroll-area.tsx
│  │  │  │  │  ├─ select.js
│  │  │  │  │  ├─ select.tsx
│  │  │  │  │  ├─ separator.js
│  │  │  │  │  ├─ separator.tsx
│  │  │  │  │  ├─ sheet.js
│  │  │  │  │  ├─ sheet.tsx
│  │  │  │  │  ├─ sidebar.js
│  │  │  │  │  ├─ sidebar.tsx
│  │  │  │  │  ├─ skeleton.js
│  │  │  │  │  ├─ skeleton.tsx
│  │  │  │  │  ├─ slider.js
│  │  │  │  │  ├─ slider.tsx
│  │  │  │  │  ├─ sonner.js
│  │  │  │  │  ├─ sonner.tsx
│  │  │  │  │  ├─ switch.js
│  │  │  │  │  ├─ switch.tsx
│  │  │  │  │  ├─ table.js
│  │  │  │  │  ├─ table.tsx
│  │  │  │  │  ├─ tabs.js
│  │  │  │  │  ├─ tabs.tsx
│  │  │  │  │  ├─ textarea.js
│  │  │  │  │  ├─ textarea.tsx
│  │  │  │  │  ├─ toast.js
│  │  │  │  │  ├─ toast.tsx
│  │  │  │  │  ├─ toaster.js
│  │  │  │  │  ├─ toaster.tsx
│  │  │  │  │  ├─ toggle-group.js
│  │  │  │  │  ├─ toggle-group.tsx
│  │  │  │  │  ├─ toggle.js
│  │  │  │  │  ├─ toggle.tsx
│  │  │  │  │  ├─ tooltip.js
│  │  │  │  │  ├─ tooltip.tsx
│  │  │  │  │  ├─ use-toast.js
│  │  │  │  │  └─ use-toast.ts
│  │  │  │  └─ users
│  │  │  │     ├─ UserTableRow.js
│  │  │  │     └─ UserTableRow.tsx
│  │  │  ├─ contexts
│  │  │  │  ├─ AuthContext.js
│  │  │  │  ├─ AuthContext.tsx
│  │  │  │  ├─ ThemeContext.js
│  │  │  │  └─ ThemeContext.tsx
│  │  │  ├─ global.css
│  │  │  ├─ hooks
│  │  │  │  ├─ use-mobile.js
│  │  │  │  ├─ use-mobile.tsx
│  │  │  │  ├─ use-toast.js
│  │  │  │  └─ use-toast.ts
│  │  │  ├─ lib
│  │  │  │  ├─ api-client.js
│  │  │  │  ├─ api-client.ts
│  │  │  │  ├─ utils.js
│  │  │  │  └─ utils.ts
│  │  │  ├─ main.js
│  │  │  ├─ main.tsx
│  │  │  ├─ pages
│  │  │  │  ├─ Actions
│  │  │  │  │  ├─ ActionsPage.js
│  │  │  │  │  └─ ActionsPage.tsx
│  │  │  │  ├─ AI
│  │  │  │  │  ├─ AIPage.js
│  │  │  │  │  └─ AIPage.tsx
│  │  │  │  ├─ Alerts
│  │  │  │  │  ├─ Alerts.js
│  │  │  │  │  └─ Alerts.tsx
│  │  │  │  ├─ Auth
│  │  │  │  │  ├─ LoginPage.js
│  │  │  │  │  ├─ LoginPage.tsx
│  │  │  │  │  ├─ RegisterPage.js
│  │  │  │  │  └─ RegisterPage.tsx
│  │  │  │  ├─ Brands
│  │  │  │  │  ├─ BrandsPage.js
│  │  │  │  │  └─ BrandsPage.tsx
│  │  │  │  ├─ Connectors
│  │  │  │  │  ├─ Connectors.js
│  │  │  │  │  └─ Connectors.tsx
│  │  │  │  ├─ Dashboard
│  │  │  │  │  ├─ Dashboard.js
│  │  │  │  │  └─ Dashboard.tsx
│  │  │  │  ├─ Keywords
│  │  │  │  │  ├─ Keywords.js
│  │  │  │  │  └─ Keywords.tsx
│  │  │  │  ├─ Mentions
│  │  │  │  │  ├─ MentionsPage.js
│  │  │  │  │  └─ MentionsPage.tsx
│  │  │  │  ├─ NotFound.js
│  │  │  │  ├─ NotFound.tsx
│  │  │  │  ├─ Organisations
│  │  │  │  │  ├─ Organisations.js
│  │  │  │  │  └─ Organisations.tsx
│  │  │  │  ├─ Quality
│  │  │  │  │  ├─ QualityPage.js
│  │  │  │  │  └─ QualityPage.tsx
│  │  │  │  ├─ Sources
│  │  │  │  │  ├─ SourcesPage.js
│  │  │  │  │  └─ SourcesPage.tsx
│  │  │  │  └─ Users
│  │  │  │     ├─ Users.js
│  │  │  │     └─ Users.tsx
│  │  │  └─ vite-env.d.ts
│  │  ├─ tailwind.config.js
│  │  ├─ tailwind.config.ts
│  │  ├─ tsconfig.app.json
│  │  ├─ tsconfig.json
│  │  ├─ vite.config.server.js
│  │  ├─ vite.config.server.ts
│  │  └─ vite.config.ts
│  ├─ collecte
│  │  ├─ index.html
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ App.tsx
│  │  │  ├─ index.css
│  │  │  └─ main.tsx
│  │  ├─ tsconfig.json
│  │  ├─ tsconfig.node.json
│  │  └─ vite.config.ts
│  ├─ landing
│  │  ├─ .builder
│  │  │  └─ rules
│  │  │     ├─ deploy-app.mdc
│  │  │     └─ organize-ui.mdc
│  │  ├─ .dockerignore
│  │  ├─ .npmrc
│  │  ├─ .prettierrc
│  │  ├─ AGENTS.md
│  │  ├─ client
│  │  │  ├─ App.js
│  │  │  ├─ App.tsx
│  │  │  ├─ components
│  │  │  │  └─ ui
│  │  │  │     ├─ accordion.js
│  │  │  │     ├─ accordion.tsx
│  │  │  │     ├─ alert-dialog.js
│  │  │  │     ├─ alert-dialog.tsx
│  │  │  │     ├─ alert.js
│  │  │  │     ├─ alert.tsx
│  │  │  │     ├─ aspect-ratio.js
│  │  │  │     ├─ aspect-ratio.tsx
│  │  │  │     ├─ avatar.js
│  │  │  │     ├─ avatar.tsx
│  │  │  │     ├─ badge.js
│  │  │  │     ├─ badge.tsx
│  │  │  │     ├─ breadcrumb.js
│  │  │  │     ├─ breadcrumb.tsx
│  │  │  │     ├─ button.js
│  │  │  │     ├─ button.tsx
│  │  │  │     ├─ calendar.js
│  │  │  │     ├─ calendar.tsx
│  │  │  │     ├─ card.js
│  │  │  │     ├─ card.tsx
│  │  │  │     ├─ carousel.js
│  │  │  │     ├─ carousel.tsx
│  │  │  │     ├─ chart.js
│  │  │  │     ├─ chart.tsx
│  │  │  │     ├─ checkbox.js
│  │  │  │     ├─ checkbox.tsx
│  │  │  │     ├─ collapsible.js
│  │  │  │     ├─ collapsible.tsx
│  │  │  │     ├─ command.js
│  │  │  │     ├─ command.tsx
│  │  │  │     ├─ context-menu.js
│  │  │  │     ├─ context-menu.tsx
│  │  │  │     ├─ dialog.js
│  │  │  │     ├─ dialog.tsx
│  │  │  │     ├─ drawer.js
│  │  │  │     ├─ drawer.tsx
│  │  │  │     ├─ dropdown-menu.js
│  │  │  │     ├─ dropdown-menu.tsx
│  │  │  │     ├─ form.js
│  │  │  │     ├─ form.tsx
│  │  │  │     ├─ hover-card.js
│  │  │  │     ├─ hover-card.tsx
│  │  │  │     ├─ input-otp.js
│  │  │  │     ├─ input-otp.tsx
│  │  │  │     ├─ input.js
│  │  │  │     ├─ input.tsx
│  │  │  │     ├─ label.js
│  │  │  │     ├─ label.tsx
│  │  │  │     ├─ menubar.js
│  │  │  │     ├─ menubar.tsx
│  │  │  │     ├─ navigation-menu.js
│  │  │  │     ├─ navigation-menu.tsx
│  │  │  │     ├─ pagination.js
│  │  │  │     ├─ pagination.tsx
│  │  │  │     ├─ popover.js
│  │  │  │     ├─ popover.tsx
│  │  │  │     ├─ progress.js
│  │  │  │     ├─ progress.tsx
│  │  │  │     ├─ radio-group.js
│  │  │  │     ├─ radio-group.tsx
│  │  │  │     ├─ resizable.js
│  │  │  │     ├─ resizable.tsx
│  │  │  │     ├─ scroll-area.js
│  │  │  │     ├─ scroll-area.tsx
│  │  │  │     ├─ select.js
│  │  │  │     ├─ select.tsx
│  │  │  │     ├─ separator.js
│  │  │  │     ├─ separator.tsx
│  │  │  │     ├─ sheet.js
│  │  │  │     ├─ sheet.tsx
│  │  │  │     ├─ sidebar.js
│  │  │  │     ├─ sidebar.tsx
│  │  │  │     ├─ skeleton.js
│  │  │  │     ├─ skeleton.tsx
│  │  │  │     ├─ slider.js
│  │  │  │     ├─ slider.tsx
│  │  │  │     ├─ sonner.js
│  │  │  │     ├─ sonner.tsx
│  │  │  │     ├─ switch.js
│  │  │  │     ├─ switch.tsx
│  │  │  │     ├─ table.js
│  │  │  │     ├─ table.tsx
│  │  │  │     ├─ tabs.js
│  │  │  │     ├─ tabs.tsx
│  │  │  │     ├─ textarea.js
│  │  │  │     ├─ textarea.tsx
│  │  │  │     ├─ toast.js
│  │  │  │     ├─ toast.tsx
│  │  │  │     ├─ toaster.js
│  │  │  │     ├─ toaster.tsx
│  │  │  │     ├─ toggle-group.js
│  │  │  │     ├─ toggle-group.tsx
│  │  │  │     ├─ toggle.js
│  │  │  │     ├─ toggle.tsx
│  │  │  │     ├─ tooltip.js
│  │  │  │     ├─ tooltip.tsx
│  │  │  │     ├─ use-toast.js
│  │  │  │     └─ use-toast.ts
│  │  │  ├─ global.css
│  │  │  ├─ hooks
│  │  │  │  ├─ use-mobile.js
│  │  │  │  ├─ use-mobile.tsx
│  │  │  │  ├─ use-toast.js
│  │  │  │  └─ use-toast.ts
│  │  │  ├─ lib
│  │  │  │  ├─ utils.js
│  │  │  │  ├─ utils.spec.js
│  │  │  │  ├─ utils.spec.ts
│  │  │  │  └─ utils.ts
│  │  │  ├─ pages
│  │  │  │  ├─ Index.js
│  │  │  │  ├─ Index.tsx
│  │  │  │  ├─ NotFound.js
│  │  │  │  └─ NotFound.tsx
│  │  │  └─ vite-env.d.ts
│  │  ├─ components.json
│  │  ├─ index.html
│  │  ├─ netlify
│  │  │  └─ functions
│  │  │     ├─ api.js
│  │  │     └─ api.ts
│  │  ├─ netlify.toml
│  │  ├─ package.json
│  │  ├─ postcss.config.js
│  │  ├─ public
│  │  │  ├─ favicon.ico
│  │  │  ├─ placeholder.svg
│  │  │  └─ robots.txt
│  │  ├─ server
│  │  │  ├─ index.js
│  │  │  ├─ index.ts
│  │  │  ├─ node-build.js
│  │  │  ├─ node-build.ts
│  │  │  └─ routes
│  │  │     ├─ demo.js
│  │  │     └─ demo.ts
│  │  ├─ shared
│  │  │  ├─ api.js
│  │  │  └─ api.ts
│  │  ├─ tailwind.config.js
│  │  ├─ tailwind.config.ts
│  │  ├─ tsconfig.json
│  │  ├─ vite.config.js
│  │  ├─ vite.config.server.js
│  │  ├─ vite.config.server.ts
│  │  └─ vite.config.ts
│  └─ web
│     ├─ .dockerignore
│     ├─ .npmrc
│     ├─ .prettierrc
│     ├─ AGENTS.md
│     ├─ components.json
│     ├─ functions
│     │  ├─ api.js
│     │  └─ api.ts
│     ├─ index.html
│     ├─ netlify.toml
│     ├─ package.json
│     ├─ postcss.config.js
│     ├─ public
│     │  ├─ favicon.ico
│     │  ├─ logoicon.svg
│     │  ├─ placeholder.svg
│     │  ├─ robots.txt
│     │  └─ sentinelleLogo.svg
│     ├─ server
│     │  ├─ index.js
│     │  ├─ index.ts
│     │  ├─ node-build.js
│     │  ├─ node-build.ts
│     │  └─ routes
│     │     ├─ demo.js
│     │     └─ demo.ts
│     ├─ shared
│     │  ├─ api.js
│     │  └─ api.ts
│     ├─ src
│     │  ├─ api
│     │  │  └─ src
│     │  │     └─ services
│     │  ├─ App.tsx
│     │  ├─ assets
│     │  │  └─ react.svg
│     │  ├─ components
│     │  │  ├─ actions
│     │  │  │  ├─ ActionDetailModal.tsx
│     │  │  │  ├─ ActionFormModal.tsx
│     │  │  │  └─ ActionItemCard.tsx
│     │  │  ├─ alerts
│     │  │  │  ├─ AlertCard.tsx
│     │  │  │  └─ AlertDetailModal.tsx
│     │  │  ├─ analysis
│     │  │  │  ├─ ActiveInfluencers.tsx
│     │  │  │  ├─ AIInsights.tsx
│     │  │  │  ├─ PeriodSelector.tsx
│     │  │  │  ├─ SentimentAnalysis.tsx
│     │  │  │  ├─ SentimentTimeline.tsx
│     │  │  │  ├─ SourcesBreakdown.tsx
│     │  │  │  └─ TrendingKeywords.tsx
│     │  │  ├─ auth
│     │  │  │  └─ ProtectedRoute.tsx
│     │  │  ├─ brands
│     │  │  │  └─ BrandFormModal.tsx
│     │  │  ├─ dashboard
│     │  │  │  ├─ ActivityChart.tsx
│     │  │  │  ├─ BarChart.tsx
│     │  │  │  ├─ DonutChart.tsx
│     │  │  │  ├─ LineChart.tsx
│     │  │  │  └─ StatCard.tsx
│     │  │  ├─ layout
│     │  │  │  ├─ BrandSelector.tsx
│     │  │  │  ├─ Header.tsx
│     │  │  │  ├─ Layout.tsx
│     │  │  │  ├─ RightSidebar.tsx
│     │  │  │  └─ Sidebar.tsx
│     │  │  ├─ mentions
│     │  │  │  ├─ MentionCard.tsx
│     │  │  │  └─ MentionDetailModal.tsx
│     │  │  ├─ onboarding
│     │  │  │  ├─ NavigationButtons.tsx
│     │  │  │  ├─ OnboardingLayout.tsx
│     │  │  │  ├─ ProductCard.tsx
│     │  │  │  └─ ProgressSteps.tsx
│     │  │  ├─ reports
│     │  │  │  ├─ ReportCard.tsx
│     │  │  │  └─ ScheduledReportItem.tsx
│     │  │  ├─ shared
│     │  │  │  └─ ConfirmModal.tsx
│     │  │  ├─ sources
│     │  │  │  ├─ ConnectSourceModal.tsx
│     │  │  │  ├─ index.js
│     │  │  │  ├─ index.ts
│     │  │  │  ├─ SourceCard.tsx
│     │  │  │  ├─ SourceForm.tsx
│     │  │  │  ├─ SourcesList.tsx
│     │  │  │  └─ SourceTypeSelector.tsx
│     │  │  ├─ started
│     │  │  │  └─ ProductCard.tsx
│     │  │  └─ ui
│     │  │     ├─ accordion.tsx
│     │  │     ├─ alert-dialog.tsx
│     │  │     ├─ alert.tsx
│     │  │     ├─ aspect-ratio.tsx
│     │  │     ├─ avatar.tsx
│     │  │     ├─ badge.tsx
│     │  │     ├─ breadcrumb.tsx
│     │  │     ├─ button.tsx
│     │  │     ├─ calendar.tsx
│     │  │     ├─ card.tsx
│     │  │     ├─ carousel.tsx
│     │  │     ├─ chart.tsx
│     │  │     ├─ checkbox.tsx
│     │  │     ├─ collapsible.tsx
│     │  │     ├─ command.tsx
│     │  │     ├─ context-menu.tsx
│     │  │     ├─ dialog.tsx
│     │  │     ├─ drawer.tsx
│     │  │     ├─ dropdown-menu.tsx
│     │  │     ├─ form.tsx
│     │  │     ├─ hover-card.tsx
│     │  │     ├─ input-otp.tsx
│     │  │     ├─ input.tsx
│     │  │     ├─ label.tsx
│     │  │     ├─ menubar.tsx
│     │  │     ├─ navigation-menu.tsx
│     │  │     ├─ pagination.tsx
│     │  │     ├─ popover.tsx
│     │  │     ├─ progress.tsx
│     │  │     ├─ radio-group.tsx
│     │  │     ├─ resizable.tsx
│     │  │     ├─ scroll-area.tsx
│     │  │     ├─ select.tsx
│     │  │     ├─ separator.tsx
│     │  │     ├─ sheet.tsx
│     │  │     ├─ sidebar.tsx
│     │  │     ├─ skeleton.tsx
│     │  │     ├─ slider.tsx
│     │  │     ├─ sonner.tsx
│     │  │     ├─ switch.tsx
│     │  │     ├─ table.tsx
│     │  │     ├─ tabs.tsx
│     │  │     ├─ textarea.tsx
│     │  │     ├─ toast.tsx
│     │  │     ├─ toaster.tsx
│     │  │     ├─ toggle-group.tsx
│     │  │     ├─ toggle.tsx
│     │  │     ├─ tooltip.tsx
│     │  │     └─ use-toast.ts
│     │  ├─ contexts
│     │  │  ├─ AuthContext.tsx
│     │  │  ├─ BrandContext.tsx
│     │  │  ├─ OnboardingContext.tsx
│     │  │  └─ ThemeContext.tsx
│     │  ├─ global.css
│     │  ├─ hooks
│     │  │  ├─ use-mobile.tsx
│     │  │  ├─ use-toast.ts
│     │  │  ├─ useApi.ts
│     │  │  ├─ useBrandListener.ts
│     │  │  └─ usePlan.ts
│     │  ├─ lib
│     │  │  ├─ api-client.ts
│     │  │  ├─ api-error-handler.ts
│     │  │  ├─ utils.js
│     │  │  └─ utils.ts
│     │  ├─ pages
│     │  │  ├─ Actions
│     │  │  │  └─ Actions.tsx
│     │  │  ├─ Alerts
│     │  │  │  └─ Alerts.tsx
│     │  │  ├─ Analysis
│     │  │  │  └─ Analysis.tsx
│     │  │  ├─ Auth
│     │  │  │  ├─ AuthLayout.tsx
│     │  │  │  ├─ ForgotPassword.tsx
│     │  │  │  ├─ ResetPasswordPage.tsx
│     │  │  │  ├─ SignInPage.tsx
│     │  │  │  ├─ SignUpPage.tsx
│     │  │  │  ├─ TwoFactorAuth.tsx
│     │  │  │  └─ VerifyEmail.tsx
│     │  │  ├─ Brands
│     │  │  │  └─ Brands.tsx
│     │  │  ├─ Dashboard
│     │  │  │  └─ Dashboard.tsx
│     │  │  ├─ Keywords
│     │  │  │  └─ Keywords.tsx
│     │  │  ├─ Mentions
│     │  │  │  └─ Mentions.tsx
│     │  │  ├─ NotFound.tsx
│     │  │  ├─ Onboarding
│     │  │  │  ├─ OnboardingAlerts.tsx
│     │  │  │  ├─ OnboardingComplete.tsx
│     │  │  │  ├─ OnboardingInvite.tsx
│     │  │  │  ├─ OnboardingLoader.tsx
│     │  │  │  ├─ OnboardingPlateforms.tsx
│     │  │  │  ├─ OnboardingProduct.tsx
│     │  │  │  ├─ OnboardingSetup.tsx
│     │  │  │  └─ Started.tsx
│     │  │  ├─ Reports
│     │  │  │  └─ Reports.tsx
│     │  │  ├─ Settings
│     │  │  │  └─ Settings.tsx
│     │  │  └─ Sources
│     │  │     └─ Sources.tsx
│     │  ├─ services
│     │  │  ├─ actions.service.ts
│     │  │  ├─ alerts.service.ts
│     │  │  ├─ analytics.service.ts
│     │  │  ├─ brands.service.ts
│     │  │  ├─ dashboard.service.ts
│     │  │  ├─ keywords.service.ts
│     │  │  ├─ mentions.service.ts
│     │  │  ├─ organizations.service.ts
│     │  │  ├─ reports.service.ts
│     │  │  ├─ sources.service.ts
│     │  │  └─ users.service.ts
│     │  ├─ types
│     │  │  ├─ api.ts
│     │  │  ├─ http.ts
│     │  │  ├─ index.ts
│     │  │  ├─ models.js
│     │  │  └─ models.ts
│     │  └─ vite-env.d.ts
│     ├─ tailwind.config.js
│     ├─ tailwind.config.ts
│     ├─ tsconfig.app.json
│     ├─ tsconfig.json
│     ├─ vite.config.js
│     ├─ vite.config.server.js
│     ├─ vite.config.server.ts
│     └─ vite.config.ts
├─ ARCHITECTURE_ANALYSIS.md
├─ AUDIT_RAPPORT.md
├─ CLEANUP_SOCIAL_MEDIA.md
├─ cleanup_social_sources.sql
├─ CODE_TEMPLATES.md
├─ database
│  ├─ debug_scraping.ts
│  ├─ force_reset.ts
│  ├─ package.json
│  ├─ prisma
│  │  ├─ schema.prisma
│  │  ├─ seed.js
│  │  └─ seed.ts
│  ├─ setup-active-sources.ts
│  ├─ src
│  │  ├─ index.js
│  │  └─ index.ts
│  ├─ test_user.sql
│  └─ tsconfig.json
├─ DELIVERABLES.md
├─ docker-compose.yaml
├─ GUIDE_TEST.md
├─ INDEX_DOCUMENTS.md
├─ infrastructure
│  ├─ docker
│  │  ├─ Dockerfile.ai
│  │  ├─ Dockerfile.api
│  │  └─ Dockerfile.workers
│  └─ k8s
│     ├─ ai.yaml
│     ├─ api.yaml
│     └─ workers.yaml
├─ insert_google_reviews.sql
├─ insert_source.sql
├─ package-lock.json
├─ package.json
├─ PHASE_1_COMPLETE.md
├─ PHASE_1_TESTS.md
├─ PHASE_2_PROGRESS.md
├─ PHASE_3_PROGRESS.md
├─ README.md
├─ RESUME_FINAL.md
├─ scrapers
│  ├─ data
│  │  └─ senscritique_results.jsonl
│  ├─ inspect_sc.py
│  ├─ README.md
│  ├─ requirements.txt
│  ├─ scrapy.cfg
│  └─ sentinelle_scrapers
│     ├─ items.py
│     ├─ middlewares.py
│     ├─ pipelines.py
│     ├─ settings.py
│     ├─ spiders
│     │  ├─ google_reviews.py
│     │  ├─ news.py
│     │  ├─ senscritique.py
│     │  ├─ template_spider.py.example
│     │  ├─ trustpilot.py
│     │  └─ __init__.py
│     └─ __init__.py
├─ shared
│  ├─ constants
│  │  ├─ plans.js
│  │  └─ plans.ts
│  ├─ index.js
│  ├─ index.ts
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ types
│  │  ├─ index.js
│  │  └─ index.ts
│  └─ validators
│     ├─ index.js
│     ├─ index.ts
│     ├─ schemas.js
│     └─ schemas.ts
├─ START_HERE.md
├─ SUMMARY.txt
├─ turbo.json
├─ update_keywords.sql
└─ update_source_type.sql
