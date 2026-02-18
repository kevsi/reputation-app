/**
 * 🛡️ Error Boundary - Capture les erreurs React
 * 
 * Empêche l'application de crasher lors d'erreurs inattendues
 */

import React, { Component, ReactNode } from 'react';
import { logger } from '@/lib/api-error-handler';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary global pour l'application
 * Attrape les erreurs de rendu dans les composants enfants
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    /**
     * Methode statique requise par React
     * Capture l'erreur et met à jour l'état
     */
    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    /**
     * Lifecycle method - appelé après une erreur
     * Ideal pour logger et envoyer à un service de monitoring
     */
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Logger l'erreur
        logger.error('ErrorBoundary caught an error:', {
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack
        });

        // Appeler le callback si fourni
        this.props.onError?.(error, errorInfo);

        // Optionnel: Envoyer à un service de monitoring (Sentry, Datadog, etc.)
        // this.reportToMonitoring(error, errorInfo);
    }

    /**
     * Réinitialiser l'état et retenter le rendu
     */
    reset = (): void => {
        this.setState({ hasError: false, error: null });
    };

    /**
     * Recharger la page
     */
    reload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Afficher le fallback personnalisé si fourni
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // UI de fallback par défaut
            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: '2rem',
                        textAlign: 'center',
                        fontFamily: 'system-ui, sans-serif',
                        backgroundColor: '#f8f9fa'
                    }}
                >
                    <div
                        style={{
                            maxWidth: '500px',
                            padding: '2rem',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        {/* Icon d'erreur */}
                        <div
                            style={{
                                fontSize: '4rem',
                                marginBottom: '1rem'
                            }}
                        >
                            ⚠️
                        </div>

                        <h2
                            style={{
                                color: '#dc3545',
                                marginBottom: '1rem',
                                fontSize: '1.5rem'
                            }}
                        >
                            Une erreur est survenue
                        </h2>

                        <p
                            style={{
                                color: '#6c757d',
                                marginBottom: '1.5rem'
                            }}
                        >
                            Nous nous excusons pour la gêne occasionnée.
                            L'erreur a été automatiquement signalée.
                        </p>

                        {/* Message d'erreur developpeur (seulement en dev) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details
                                style={{
                                    marginBottom: '1.5rem',
                                    textAlign: 'left',
                                    padding: '0.5rem',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                                    Détails techniques (DEV)
                                </summary>
                                <pre
                                    style={{
                                        marginTop: '0.5rem',
                                        overflow: 'auto',
                                        fontSize: '0.75rem',
                                        color: '#dc3545'
                                    }}
                                >
                                    {this.state.error.message}
                                    {'\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}

                        {/* Boutons d'action */}
                        <div
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                justifyContent: 'center'
                            }}
                        >
                            <button
                                onClick={this.reset}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#0d6efd',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                Réessayer
                            </button>

                            <button
                                onClick={this.reload}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                Recharger la page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Rendu normal si pas d'erreur
        return this.props.children;
    }
}

/**
 * Hook pour utiliser ErrorBoundary dans des composants fonctionnels
 * Attention: Ce hook ne peut être utilisé qu'une fois par composant
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
): React.FC<P> {
    const WrappedComponent: React.FC<P> = (props) => (
        <ErrorBoundary fallback={fallback}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
}

/**
 * Hook pour gerer les erreurs dans les composants fonctionnels
 * Utiliser avec useEffect pour capturer les erreurs asynchrones
 */
export function useErrorHandler() {
    const [error, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);

    return setError;
}

export default ErrorBoundary;
