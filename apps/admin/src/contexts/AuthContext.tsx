import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';

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
        const token = apiClient.getToken();
        if (token) {
            // TODO: Vérifier la validité du token avec l'API
            // Pour l'instant, on considère que le token est valide
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
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
            console.log('🔵 Attempting registration with:', { email: data.email, name: data.name, organizationName: data.organizationName });
            const response = await apiClient.register(data);
            console.log('🟢 Registration API response:', response);

            if (response.success && response.data) {
                const { accessToken, user: userData } = response.data;

                // Sauvegarder le token
                apiClient.setToken(accessToken);

                // Sauvegarder l'utilisateur
                setUser(userData);
                console.log('✅ Registration successful, user saved:', userData);
            } else {
                console.error('🔴 Registration failed - no data in response:', response);
                throw new Error(response.error?.message || 'Registration failed');
            }
        } catch (error: any) {
            console.error('🔴 Registration error caught:', error);
            console.error('🔴 Error details:', {
                status: error.status,
                error: error.error,
                message: error.message,
                fullError: error
            });

            // Gérer les erreurs spécifiques
            if (error.status === 409) {
                throw new Error('This email is already registered. Please use a different email or try logging in.');
            }

            if (error.error?.message) {
                throw new Error(error.error.message);
            }

            throw new Error('Registration failed. Please try again.');
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
