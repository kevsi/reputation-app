import { SourceType } from '@sentinelle/database';

/**
 * 📋 Représente une source d'information
 */
export interface Source {
  id: string;
  name: string;
  url?: string | null;
  type: SourceType;
  isActive: boolean;
  brandId: string;
  createdAt: Date;
  updatedAt: Date;
  brand?: any;
}

/**
 * 📤 Format de réponse de l'API pour plusieurs sources
 */
export interface SourcesResponse {
  success: boolean;
  data: any[];
  count: number;
}

/**
 * 📤 Format de réponse de l'API pour une seule source
 */
export interface SourceResponse {
  success: boolean;
  data: any;
}

/**
 * 📥 Données pour créer une nouvelle source
 */
export interface CreateSourceInput {
  name: string;
  url?: string;
  type: string;
  isActive?: boolean;
  brandId: string;
}

/**
 * 📝 Données pour mettre à jour une source
 */
export interface UpdateSourceInput {
  name?: string;
  url?: string;
  type?: string;
  isActive?: boolean;
}

/**
 * 📤 Réponse après suppression
 */
export interface DeleteResponse {
  success: boolean;
  message: string;
}