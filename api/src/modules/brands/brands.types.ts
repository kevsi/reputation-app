
/**
 * 📋 Brands (Marques)
 * 
 * Une marque est une entité surveillée par une organisation.
 */
export interface Brand {
    id: string;
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    isActive: boolean;
    organizationId: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * 📤 Format de réponse de l'API pour plusieurs marques
 */
export interface BrandsResponse {
    success: boolean;
    data: Brand[];
    count: number;
}

/**
 * 📤 Format de réponse de l'API pour une seule marque
 */
export interface BrandResponse {
    success: boolean;
    data: Brand;
}

/**
 * 📥 Données pour créer une nouvelle marque
 */
export interface CreateBrandInput {
    name: string;
    description?: string;
    website?: string;
    logo?: string;
    isActive?: boolean;
    organizationId: string;
}

/**
 * 📝 Données pour mettre à jour une marque
 */
export interface UpdateBrandInput {
    name?: string;
    description?: string;
    website?: string;
    logo?: string;
    isActive?: boolean;
}

/**
 * 📤 Réponse après suppression
 */
export interface DeleteResponse {
    success: boolean;
    message: string;
}
