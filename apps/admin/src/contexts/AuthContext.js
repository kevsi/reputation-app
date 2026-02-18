"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthProvider = AuthProvider;
exports.useAuth = useAuth;
const react_1 = require("react");
const api_client_1 = require("@/lib/api-client");
const AuthContext = (0, react_1.createContext)(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    // Vérifier si un token existe au chargement
    (0, react_1.useEffect)(() => {
        const token = api_client_1.apiClient.getToken();
        if (token) {
            // TODO: Vérifier la validité du token avec l'API
            // Pour l'instant, on considère que le token est valide
            setIsLoading(false);
        }
        else {
            setIsLoading(false);
        }
    }, []);
    const login = async (email, password) => {
        try {
            const response = await api_client_1.apiClient.login(email, password);
            if (response.success && response.data) {
                const { accessToken, user: userData } = response.data;
                // Sauvegarder le token
                api_client_1.apiClient.setToken(accessToken);
                // Sauvegarder l'utilisateur
                setUser(userData);
            }
            else {
                throw new Error(response.error?.message || 'Login failed');
            }
        }
        catch (error) {
            console.error('Login error:', error);
            throw new Error(error.error?.message || 'Invalid credentials');
        }
    };
    const register = async (data) => {
        try {
            console.log('🔵 Attempting registration with:', { email: data.email, name: data.name, organizationName: data.organizationName });
            const response = await api_client_1.apiClient.register(data);
            console.log('🟢 Registration API response:', response);
            if (response.success && response.data) {
                const { accessToken, user: userData } = response.data;
                // Sauvegarder le token
                api_client_1.apiClient.setToken(accessToken);
                // Sauvegarder l'utilisateur
                setUser(userData);
                console.log('✅ Registration successful, user saved:', userData);
            }
            else {
                console.error('🔴 Registration failed - no data in response:', response);
                throw new Error(response.error?.message || 'Registration failed');
            }
        }
        catch (error) {
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
        api_client_1.apiClient.logout();
        setUser(null);
    };
    return (<AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            register,
            logout,
        }}>
            {children}
        </AuthContext.Provider>);
}
function useAuth() {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
