import { SubscriptionTier } from '@sentinelle/database';

/**
 * 📋 Organizations
 */
export interface Organization {
  id: string;
  name: string;
  industry?: string | null;
  numberTeam?: string | null;
  slug: string;
  subscription?: {
    plan: SubscriptionTier;
    status: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    brands: number;
    members: number;
  };
}

/**
 * 📤 Format de réponse de l'API pour plusieurs organizations
 */
export interface OrganizationsResponse {
  success: boolean;
  data: any[];
  count: number;
}

/**
 * 📤 Format de réponse de l'API pour une seule organization
 */
export interface OrganizationResponse {
  success: boolean;
  data: any;
}

/**
 * 📥 Données pour créer une nouvelle organization
 */
export interface CreateOrganizationInput {
  name: string;
  industry?: string;
  subscriptionTier?: string;
  numberTeam?: string;
  slug?: string;
  ownerId: string;
}

/**
 * 📝 Données pour mettre à jour une organization
 */
export interface UpdateOrganizationInput {
  name?: string;
  industry?: string;
  numberTeam?: string;
  slug?: string;
}

/**
 * 📤 Réponse après suppression
 */
export interface DeleteResponse {
  success: boolean;
  message: string;
}