import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string | null;
    isActive: boolean;
}

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
        const checkAuth = async () => {
            const token = apiClient.getToken();
            if (token) {
                try {
                    const response = await apiClient.me();
                    if (response.success && response.data) {
                        setUser(response.data);
                    } else {
                        apiClient.setToken(null);
                    }
                } catch (error) {
                    console.error('Check auth error:', error);
                    apiClient.setToken(null);
                }
            }
            setIsLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await apiClient.login(email, password);

            if (response.success && response.data) {
                const { accessToken, user: userData } = response.data;

                // Sauvegarder le token
                apiClient.setToken(accessToken);

                // Sauvegarder l'utilisateur
                setUser(userData);
            } else {
                throw new Error(response.error?.message || 'Login failed');
            }
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error.error?.message || 'Invalid credentials');
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await apiClient.register(data);

            if (response.success && response.data) {
                const { accessToken, user: userData } = response.data;

                // Sauvegarder le token
                apiClient.setToken(accessToken);

                // Sauvegarder l'utilisateur
                setUser(userData);
            } else {
                throw new Error(response.error?.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('Registration error:', error);
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
