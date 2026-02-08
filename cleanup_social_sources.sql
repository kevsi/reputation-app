-- 🧹 Nettoyage des sources de réseaux sociaux non accessibles
-- Date: 2026-02-05
-- Raison: Supprimer les sources Twitter, Facebook, Reddit, Instagram, LinkedIn

-- Option 1: DÉSACTIVER les sources (recommandé - conserve l'historique)
UPDATE "Source"
SET "isActive" = false
WHERE type IN ('TWITTER', 'FACEBOOK', 'REDDIT', 'INSTAGRAM', 'LINKEDIN');

-- Option 2: SUPPRIMER complètement les sources (attention: perte de données)
-- Décommentez les lignes ci-dessous si vous voulez supprimer définitivement

-- DELETE FROM "Mention" WHERE "sourceId" IN (
--   SELECT id FROM "Source" WHERE type IN ('TWITTER', 'FACEBOOK', 'REDDIT', 'INSTAGRAM', 'LINKEDIN')
-- );

-- DELETE FROM "Source" WHERE type IN ('TWITTER', 'FACEBOOK', 'REDDIT', 'INSTAGRAM', 'LINKEDIN');

-- Vérification: Afficher les sources désactivées
SELECT id, name, type, "isActive", "createdAt"
FROM "Source"
WHERE type IN ('TWITTER', 'FACEBOOK', 'REDDIT', 'INSTAGRAM', 'LINKEDIN')
ORDER BY "createdAt" DESC;
