/**
 * 🔗 useApi Hook - Gestion robuste des requêtes API
 * 
 * Provides:
 * - Loading states
 * - Error handling
 * - Null safety
 * - Retry on failure
 */

import { useState, useCallback, useRef } from 'react';
import { ApiResponse, ApiError, ApiErrorCode } from '@/types/http';
import { logger } from '@/lib/api-error-handler';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: ApiError) => void;
    immediate?: boolean;
    retries?: number;
}

interface UseApiState<T> {
    data: T | null;
    error: ApiError | null;
    loading: boolean;
    retries: number;
}

/**
 * Hook principal pour les requêtes API
 */
export function useApi<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    options: UseApiOptions<T> = {}
) {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        error: null,
        loading: false,
        retries: 0
    });

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const execute = useCallback(async (): Promise<ApiResponse<T> | null> => {
        setState(s => ({ ...s, loading: true, error: null }));

        try {
            const maxRetries = optionsRef.current.retries ?? 2;
            let lastError: ApiError | null = null;
            let response: ApiResponse<T> | null = null;

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                setState(s => ({ ...s, retries: attempt }));

                response = await apiCall();

                if (response.success && response.data) {
                    // Succès
                    setState({
                        data: response.data,
                        error: null,
                        loading: false,
                        retries: 0
                    });

                    optionsRef.current.onSuccess?.(response.data);
                    return response;
                }

                // Erreur - vérifier si on peut retenter
                const error = response.error;
                lastError = error || { 
                    code: ApiErrorCode.UNKNOWN_ERROR, 
                    message: 'Unknown error' 
                };

                // Ne pas retenter sur certaines erreurs
                if (error?.code === ApiErrorCode.UNAUTHORIZED ||
                    error?.code === ApiErrorCode.FORBIDDEN ||
                    error?.code === ApiErrorCode.VALIDATION_ERROR ||
                    error?.code === ApiErrorCode.NOT_FOUND) {
                    break;
                }

                // Attendre avant de retenter (exponential backoff)
                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
                    await new Promise(r => setTimeout(r, delay));
                }
            }

            // Échec après tous les essais
            setState({
                data: null,
                error: lastError,
                loading: false,
                retries: 0
            });

            optionsRef.current.onError?.(lastError!);
            return null;

        } catch (err) {
            // Erreur inattendue (network, timeout, etc.)
            const error: ApiError = {
                code: ApiErrorCode.NETWORK_ERROR,
                message: err instanceof Error ? err.message : 'Network error',
                statusCode: 0
            };

            logger.error('useApi unexpected error', err);

            setState({
                data: null,
                error,
                loading: false,
                retries: 0
            });

            optionsRef.current.onError?.(error);
            return null;
        }
    }, [apiCall]);

    const reset = useCallback(() => {
        setState({
            data: null,
            error: null,
            loading: false,
            retries: 0
        });
    }, []);

    return {
        ...state,
        execute,
        reset,
        // Helpers
        isIdle: !state.loading && !state.data && !state.error,
        isSuccess: !!state.data && !state.loading,
        hasError: !!state.error && !state.loading
    };
}

/**
 * Hook pour les requêtes avec données persistantes
 * Ne reset pas les données lors des rechargements
 */
export function useApiKeepData<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    options: UseApiOptions<T> = {}
) {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        error: null,
        loading: false,
        retries: 0
    });

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const execute = useCallback(async (): Promise<ApiResponse<T> | null> => {
        setState(s => ({ ...s, loading: true, error: null }));

        try {
            const response = await apiCall();

            if (response.success && response.data) {
                setState(s => ({
                    data: response.data ?? s.data, // Garder anciennes données si nouvelles nulles
                    error: null,
                    loading: false,
                    retries: 0
                }));
                optionsRef.current.onSuccess?.(response.data);
                return response;
            }

            const error = response.error || { 
                code: ApiErrorCode.UNKNOWN_ERROR, 
                message: 'Unknown error' 
            };

            setState(s => ({ ...s, error, loading: false, retries: 0 }));
            optionsRef.current.onError?.(error);
            return null;

        } catch (err) {
            const error: ApiError = {
                code: ApiErrorCode.NETWORK_ERROR,
                message: err instanceof Error ? err.message : 'Network error',
                statusCode: 0
            };

            setState(s => ({ ...s, error, loading: false, retries: 0 }));
            optionsRef.current.onError?.(error);
            return null;
        }
    }, [apiCall]);

    return { ...state, execute };
}

/**
 * Hook pour les mutations (POST, PUT, DELETE)
 */
export function useMutation<TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
    options: UseApiOptions<TData> = {}
) {
    const [state, setState] = useState<UseApiState<TData>>({
        data: null,
        error: null,
        loading: false,
        retries: 0
    });

    const optionsRef = useRef(options);
    optionsRef.current = options;

    const mutate = useCallback(async (variables: TVariables): Promise<ApiResponse<TData> | null> => {
        setState(s => ({ ...s, loading: true, error: null }));

        try {
            const response = await mutationFn(variables);

            if (response.success && response.data) {
                setState({
                    data: response.data,
                    error: null,
                    loading: false,
                    retries: 0
                });
                optionsRef.current.onSuccess?.(response.data);
                return response;
            }

            const error = response.error || { 
                code: ApiErrorCode.UNKNOWN_ERROR, 
                message: 'Unknown error' 
            };

            setState({ data: null, error, loading: false, retries: 0 });
            optionsRef.current.onError?.(error);
            return null;

        } catch (err) {
            const error: ApiError = {
                code: ApiErrorCode.NETWORK_ERROR,
                message: err instanceof Error ? err.message : 'Network error',
                statusCode: 0
            };

            setState({ data: null, error, loading: false, retries: 0 });
            optionsRef.current.onError?.(error);
            return null;
        }
    }, [mutationFn]);

    const reset = useCallback(() => {
        setState({
            data: null,
            error: null,
            loading: false,
            retries: 0
        });
    }, []);

    return {
        ...state,
        mutate,
        reset,
        isIdle: !state.loading && !state.data && !state.error,
        isSuccess: !!state.data && !state.loading
    };
}

/**
 * Composant de chargement (Loading Skeleton)
 */
export function ApiLoading({ 
    count = 3,
    height = '1rem' 
}: { 
    count?: number; 
    height?: string;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        height,
                        backgroundColor: '#e9ecef',
                        borderRadius: '4px',
                        animation: 'pulse 1.5s infinite',
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            ))}
        </div>
    );
}

/**
 * Composant d'erreur avec retry
 */
export function ApiErrorDisplay({ 
    error,
    onRetry,
    style = {}
}: { 
    error: ApiError | null;
    onRetry?: () => void;
    style?: React.CSSProperties;
}) {
    if (!error) return null;

    return (
        <div
            style={{
                padding: '1rem',
                backgroundColor: '#fff5f5',
                border: '1px solid #fc8181',
                borderRadius: '8px',
                color: '#c53030',
                ...style
            }}
        >
            <strong>Erreur: </strong>
            {error.message}
            
            {onRetry && (
                <button
                    onClick={onRetry}
                    style={{
                        marginLeft: '1rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#c53030',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Réessayer
                </button>
            )}
        </div>
    );
}

/**
 * Composant d'état vide
 */
export function ApiEmpty({ 
    message = 'Aucune donnée disponible' 
}: { 
    message?: string;
}) {
    return (
        <div
            style={{
                padding: '2rem',
                textAlign: 'center',
                color: '#718096'
            }}
        >
            📭 {message}
        </div>
    );
}

export default useApi;
