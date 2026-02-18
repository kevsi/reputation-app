import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { isApiSuccess } from '@/types/http';
import type { User } from '@/types/models';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
    organizationName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        try {
            const response = await apiClient.login(email, password);

            if (isApiSuccess(response)) {
                const { accessToken, user: userData } = response.data as { accessToken: string; user: User };

                // Sauvegarder le token
                apiClient.setToken(accessToken);

                // Sauvegarder l'utilisateur
                setUser(userData);
            } else {
                throw new Error(response.error?.message || 'Login failed');
            }
        } catch (error: any) {
            throw new Error(error.error?.message || 'Invalid credentials');
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await apiClient.register(data);

            if (isApiSuccess(response)) {
                const { accessToken, user: userData } = response.data as { accessToken: string; user: User };

                // Sauvegarder le token
                apiClient.setToken(accessToken);

                // Sauvegarder l'utilisateur
                setUser(userData);
            } else {
                throw new Error(response.error?.message || 'Registration failed');
            }
        } catch (error: any) {
            if (error.status === 409) {
                throw new Error('This email is already registered.');
            }
            throw new Error(error.error?.message || 'Registration failed');
        }
    };

    const logout = () => {
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
