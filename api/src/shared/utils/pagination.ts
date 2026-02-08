/**
 * 📄 Paramètres de Pagination
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * 📦 Réponse Paginée
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

/**
 * 🔧 Fonction de Pagination Universelle
 * 
 * Utilisation:
 * ```typescript
 * const result = await paginate(
 *   prisma.mention,
 *   { brandId: 'xxx' },
 *   { page: 2, limit: 50 },
 *   { brand: true, source: true }
 * );
 * ```
 */
export async function paginate<T>(
    model: any,
    where: any,
    params: PaginationParams,
    include?: any
): Promise<PaginatedResponse<T>> {
    // Valider et normaliser les paramètres
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20)); // Max 100 items
    const skip = (page - 1) * limit;

    // Construire l'orderBy
    const orderBy: any = {};
    if (params.sortBy) {
        orderBy[params.sortBy] = params.sortOrder || 'desc';
    } else {
        // Par défaut : tri par date de création décroissante
        orderBy.createdAt = 'desc';
    }

    // Exécuter les requêtes en parallèle pour optimiser les performances
    const [data, total] = await Promise.all([
        model.findMany({
            where,
            skip,
            take: limit,
            orderBy,
            include
        }),
        model.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
}

/**
 * 🔍 Extraire les Paramètres de Pagination depuis req.query
 * 
 * Utilisation:
 * ```typescript
 * const pagination = extractPaginationParams(req.query);
 * ```
 */
export function extractPaginationParams(query: any): PaginationParams {
    return {
        page: query.page ? parseInt(query.page as string, 10) : 1,
        limit: query.limit ? parseInt(query.limit as string, 10) : 20,
        sortBy: query.sortBy as string,
        sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc'
    };
}

/**
 * ✅ Valider les Paramètres de Pagination
 */
export function validatePaginationParams(params: PaginationParams): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (params.page && params.page < 1) {
        errors.push('Page must be >= 1');
    }

    if (params.limit && (params.limit < 1 || params.limit > 100)) {
        errors.push('Limit must be between 1 and 100');
    }

    if (params.sortOrder && !['asc', 'desc'].includes(params.sortOrder)) {
        errors.push('Sort order must be "asc" or "desc"');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * 🔗 Générer les URLs de Pagination
 * 
 * Utile pour les headers Link (RFC 5988)
 */
export function generatePaginationLinks(
    baseUrl: string,
    pagination: PaginatedResponse<any>['pagination'],
    queryParams: Record<string, any> = {}
): {
    first: string;
    prev?: string;
    next?: string;
    last: string;
} {
    const buildUrl = (page: number) => {
        const params = new URLSearchParams({
            ...queryParams,
            page: page.toString(),
            limit: pagination.limit.toString()
        });
        return `${baseUrl}?${params.toString()}`;
    };

    const links: any = {
        first: buildUrl(1),
        last: buildUrl(pagination.totalPages)
    };

    if (pagination.hasPrev) {
        links.prev = buildUrl(pagination.page - 1);
    }

    if (pagination.hasNext) {
        links.next = buildUrl(pagination.page + 1);
    }

    return links;
}
