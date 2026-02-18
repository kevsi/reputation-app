import { User } from '../users/users.types';

export interface AuthResponse {
    success: boolean;
    accessToken: string;
    refreshToken: string;
    familyId?: string; // Pour le suivi des tokens sur plusieurs appareils
    user: Omit<User, 'password'> & { organization?: any };
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
    organizationName: string; // Creates an org too usually
}
