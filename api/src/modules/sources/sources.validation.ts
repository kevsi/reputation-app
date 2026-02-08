/**
 * Schémas de validation Zod pour le module Sources
 * Conforme à PROMPT_AGENT_IA_PRECISION_MAXIMALE.md
 */
import { z } from 'zod';

/**
 * Configuration spécifique Google Reviews
 */
const googleReviewsConfigSchema = z.object({
  placeId: z.string().min(1, 'Place ID requis'),
  googleApiKey: z.string().min(1, 'API Key requise'),
  maxResults: z.number().int().min(1).max(500).optional().default(50),
});

/**
 * Configuration spécifique Trustpilot
 */
const trustpilotConfigSchema = z.object({
  companyUrl: z.string().url('URL invalide'),
  maxPages: z.number().int().min(1).max(50).optional().default(5),
});

/**
 * Configuration spécifique Twitter
 */
const twitterConfigSchema = z.object({
  username: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  twitterBearerToken: z.string().min(1, 'Bearer token requis'),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
});

/**
 * Configuration spécifique News
 */
const newsConfigSchema = z.object({
  keywords: z.array(z.string().min(1)).min(1, 'Au moins un mot-clé requis'),
  language: z.string().length(2).optional().default('fr'),
  newsApiKey: z.string().min(1, 'API Key requise'),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
});

/**
 * Configuration spécifique RSS
 */
const rssConfigSchema = z.object({
  feedUrl: z.string().url('URL RSS invalide'),
});

/**
 * Configuration spécifique Reddit
 */
const redditConfigSchema = z.object({
  subreddits: z.array(z.string().min(1)).min(1, 'Au moins un subreddit requis'),
  redditClientId: z.string().min(1, 'Client ID requis'),
  redditClientSecret: z.string().min(1, 'Client Secret requis'),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
});

/**
 * Configuration spécifique TripAdvisor
 */
const tripadvisorConfigSchema = z.object({
  locationId: z.string().min(1, 'Location ID requis'),
  maxPages: z.number().int().min(1).max(50).optional().default(5),
});

/**
 * Configuration spécifique Facebook
 */
const facebookConfigSchema = z.object({
  pageId: z.string().min(1, 'Page ID requis'),
  accessToken: z.string().min(1, 'Access Token requis'),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
});

/**
 * Configuration spécifique Instagram
 */
const instagramConfigSchema = z.object({
  username: z.string().min(1, 'Username requis'),
  accessToken: z.string().min(1, 'Access Token requis'),
  hashtags: z.array(z.string()).optional(),
  maxResults: z.number().int().min(1).max(100).optional().default(50),
});

/**
 * Configuration spécifique YouTube
 */
const youtubeConfigSchema = z
  .object({
    channelId: z.string().optional(),
    videoId: z.string().optional(),
    youtubeApiKey: z.string().min(1, 'API Key requise'),
    maxResults: z.number().int().min(1).max(100).optional().default(50),
  })
  .refine((data) => !!data.channelId || !!data.videoId, {
    message: 'channelId ou videoId requis',
  });

const sourceTypeEnum = z.enum([
  'GOOGLE_REVIEWS',
  'TRUSTPILOT',
  'TRIPADVISOR',
  'FACEBOOK',
  'TWITTER',
  'INSTAGRAM',
  'NEWS',
  'RSS',
  'REDDIT',
  'YOUTUBE',
]);

const scrapingFrequencyEnum = z.enum([
  'REALTIME',
  'EVERY_15_MIN',
  'HOURLY',
  'EVERY_6_HOURS',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
]);

/**
 * Validation pour la création d'une source
 */
export const createSourceSchema = z
  .object({
    type: sourceTypeEnum,
    name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
    config: z.record(z.any()),
    scrapingFrequency: scrapingFrequencyEnum.optional().default('DAILY'),
  })
  .refine(
    (data) => {
      try {
        switch (data.type) {
          case 'GOOGLE_REVIEWS':
            googleReviewsConfigSchema.parse(data.config);
            break;
          case 'TRUSTPILOT':
            trustpilotConfigSchema.parse(data.config);
            break;
          case 'TWITTER':
            twitterConfigSchema.parse(data.config);
            break;
          case 'NEWS':
            newsConfigSchema.parse(data.config);
            break;
          case 'RSS':
            rssConfigSchema.parse(data.config);
            break;
          case 'REDDIT':
            redditConfigSchema.parse(data.config);
            break;
          case 'TRIPADVISOR':
            tripadvisorConfigSchema.parse(data.config);
            break;
          case 'FACEBOOK':
            facebookConfigSchema.parse(data.config);
            break;
          case 'INSTAGRAM':
            instagramConfigSchema.parse(data.config);
            break;
          case 'YOUTUBE':
            youtubeConfigSchema.parse(data.config);
            break;
          default:
            return true;
        }
        return true;
      } catch {
        return false;
      }
    },
    { message: 'Configuration invalide pour ce type de source' }
  );

/**
 * Validation pour la mise à jour d'une source
 */
export const updateSourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.record(z.any()).optional(),
  scrapingFrequency: scrapingFrequencyEnum.optional(),
});

/**
 * Validation du paramètre sourceId
 */
export const sourceIdSchema = z.object({
  sourceId: z.string().min(1, 'ID source invalide'),
});

/**
 * Validation du statut pour PATCH /sources/:sourceId/status
 */
export const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED']),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
