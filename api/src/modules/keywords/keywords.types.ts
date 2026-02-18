
/**
 * 📋 Keywords (Mots-clés)
 * 
 * Un mot-clé est un terme surveillé pour une marque.
 */
export interface Keyword {
  id: string;
  word: string;
  category?: string;
  priority: number;
  isNegative: boolean;
  brandId: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 📤 Format de réponse de l'API pour plusieurs mots-clés
 */
export interface KeywordsResponse {
  success: boolean;
  data: Keyword[];
  count: number;
}

/**
 * 📤 Format de réponse de l'API pour un seul mot-clé
 */
export interface KeywordResponse {
  success: boolean;
  data: Keyword;
}

/**
 * 📥 Données pour créer un nouveau mot-clé
 */
export interface CreateKeywordInput {
  word: string;
  category?: string;
  priority?: number;
  isNegative?: boolean;
  brandId: string;
}

/**
 * 📝 Données pour mettre à jour un mot-clé
 */
export interface UpdateKeywordInput {
  word?: string;
  category?: string;
  priority?: number;
  isNegative?: boolean;
}

/**
 * 📤 Réponse après suppression
 */
export interface DeleteResponse {
  success: boolean;
  message: string;
}