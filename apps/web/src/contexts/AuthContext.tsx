import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { isApiSuccess, ApiResponse } from '@/types/http';
import type { User } from '@/types/models';
import { signInWithGoogle, signOut as firebaseSignOut } from '@/lib/firebase';

/**
 * Types for auth responses
 */
export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: User;
}

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    organizationName: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Type guard to check if an error is an app error with message and status
 */
const isAppError = (e: unknown): e is { message: string; status: number; code?: string } => {
    return typeof e === 'object' && e !== null && 'message' in e && 'status' in e;
};

/**
 * Parse login error response and return user-friendly message
 */
function parseLoginError(response: ApiResponse<LoginResponse>): { message: string; status: number } {
    const error = response.error;
    const statusCode = error?.statusCode || 400;
    const errorCode = error?.code as string;
    let errorMessage = error?.message || 'Identifiants invalides';

    // Handle specific error codes
    if (errorCode === 'INVALID_CREDENTIALS' || statusCode === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
    } else if (statusCode === 429) {
        errorMessage = 'Trop de tentatives. Veuillez patienter quelques instants.';
    } else if (statusCode === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    return { message: errorMessage, status: statusCode };
}

/**
 * Parse register error response and return user-friendly message
 */
function parseRegisterError(response: ApiResponse<LoginResponse>): { message: string; status: number; code?: string } {
    const error = response.error;
    const statusCode = error?.statusCode || 400;

    // Handle nested error format from API
    const nestedData = response.data as Record<string, unknown> | undefined;
    const nestedError = nestedData?.error as Record<string, unknown> | undefined;
    const nestedMessage = nestedData?.message as string | undefined;
    const validationErrors = nestedData?.errors as Array<{ field: string; message: string }> | undefined;

    // Build base error message
    let errorMessage = error?.message || nestedError?.message as string || nestedMessage || "Une erreur est survenue lors de l'inscription";

    // Add details if available
    if (error?.details && Array.isArray(error.details)) {
        const detailsStr = error.details.join(', ');
        errorMessage = `${errorMessage}: ${detailsStr}`;
    }

    // Handle validation errors from nested format
    if (validationErrors && Array.isArray(validationErrors)) {
        const fieldErrors = validationErrors.map((e) => `${e.field}: ${e.message}`).join(', ');
        errorMessage = `Erreurs de validation: ${fieldErrors}`;
    }

    // Specific error codes
    const errorCode = (error?.code as string) || (nestedError?.code as string);

    if (errorCode === 'WEAK_PASSWORD') {
        errorMessage = 'Le mot de passe est trop faible. Il doit contenir au moins 8 caractères, une majuscule et un caractère spécial.';
    } else if (errorCode === 'EMAIL_EXISTS' || statusCode === 409) {
        return { message: 'Cet email est déjà utilisé.', status: 409, code: 'EMAIL_EXISTS' };
    } else if (errorCode === 'VALIDATION_ERROR') {
        errorMessage = `Erreur de validation: ${errorMessage}`;
    } else if (statusCode === 400) {
        errorMessage = `Requête invalide: ${errorMessage}`;
    } else if (statusCode === 500) {
        errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    }

    return { message: errorMessage, status: statusCode, code: errorCode };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Vérifier si un token existe au chargement
    useEffect(() => {
        let isCancelled = false;

        const checkAuth = async () => {
            // Timeout de sécurité de 5 secondes
            const timeoutId = setTimeout(() => {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }, 5000);

            const token = apiClient.getToken();
            if (token) {
                try {
                    const response = await apiClient.me();
                    if (!isCancelled && isApiSuccess(response)) {
                        setUser(response.data as User);
                    } else if (!isCancelled) {
                        apiClient.setToken(null);
                    }
                } catch (error) {
                    if (!isCancelled) {
                        apiClient.setToken(null);
                        setUser(null);
                    }
                }
            }

            clearTimeout(timeoutId);
            if (!isCancelled) {
                setIsLoading(false);
            }
        };

        checkAuth();

        return () => {
            isCancelled = true;
        };
    }, []);

    const login = async (email: string, password: string) => {
        const response = await apiClient.login(email, password);

        if (!response.success) {
            const { message, status } = parseLoginError(response);
            throw { message, status };
        }

        if (response.data) {
            const { accessToken, user: userData } = response.data;
            apiClient.setToken(accessToken);
            setUser(userData);
        } else {
            throw { message: 'Réponse invalide du serveur', status: 500 };
        }
    };

    const register = async (data: RegisterData) => {
        const response = await apiClient.register(data);

        if (!response.success) {
            const { message, status, code } = parseRegisterError(response);
            throw { message, status, code };
        }

        if (response.data) {
            const { accessToken, user: userData } = response.data;
            apiClient.setToken(accessToken);
            setUser(userData);
        } else {
            throw { message: 'Réponse invalide du serveur', status: 500 };
        }
    };

    /**
     * Login with Google - opens popup, gets ID token, sends to backend
     */
    const loginWithGoogle = async () => {
        try {
            // Step 1: Get Google ID token via Firebase popup
            const firebaseUser = await signInWithGoogle();
            const idToken = await firebaseUser.getIdToken();

            // Step 2: Send token to backend
            const response = await apiClient.loginWithGoogle(idToken);

            if (!response.success) {
                const { message, status } = parseLoginError(response);
                // Sign out from Firebase on backend error
                await firebaseSignOut();
                throw { message, status };
            }

            if (response.data) {
                const { accessToken, user: userData } = response.data;
                apiClient.setToken(accessToken);
                setUser(userData);
            } else {
                await firebaseSignOut();
                throw { message: 'Réponse invalide du serveur', status: 500 };
            }
        } catch (error) {
            // Handle Firebase errors (user cancelled, network error, etc.)
            if (error instanceof Error && error.message.includes('auth/')) {
                throw { message: 'Erreur lors de la connexion Google. Veuillez réessayer.', status: 400 };
            }
            // Re-throw our own errors
            if (typeof error === 'object' && error !== null && 'message' in error) {
                throw error;
            }
            throw { message: 'Erreur lors de la connexion Google', status: 500 };
        }
    };

    const logout = () => {
        // Sign out from Firebase if logged in
        firebaseSignOut().catch(() => {
            // Ignore Firebase sign out errors - user may not be logged in with Google
        });
        apiClient.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                loginWithGoogle,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
