export type UserRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

export interface User {
    id: string;
    email: string;
    name: string | null;
    firstName: string | null;
    lastName: string | null;
    password: string;
    role: UserRole;
    organizationId: string | null;
    isActive: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserInput {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    organizationId?: string;
    isActive?: boolean;
}

export interface UpdateUserInput {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role?: UserRole;
    organizationId?: string | null;
    isActive?: boolean;
    lastLoginAt?: Date;
}

/**
 * 📤 Réponse après suppression
 */
export interface DeleteResponse {
    success: boolean;
    message: string;
}