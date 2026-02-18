import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { BrandProvider, useBrand } from '@/contexts/BrandContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { OnboardingProvider } from '@/contexts/OnboardingContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import './global.css';

import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Mentions from '@/pages/Mentions/Mentions';

import Alerts from '@/pages/Alerts/Alerts';
import Analysis from '@/pages/Analysis/Analysis';
import Reports from '@/pages/Reports/Reports';
import Actions from '@/pages/Actions/Actions';
import Brands from '@/pages/Brands/Brands';
import Sources from '@/pages/Sources/Sources';
import Settings from '@/pages/Settings/Settings';
import Keywords from '@/pages/Keywords/Keywords';

// Pages Auth
import AuthLayout from '@/pages/Auth/AuthLayout';
import SignInPage from '@/pages/Auth/SignInPage';
import SignUpPage from '@/pages/Auth/SignUpPage';
import ForgotPasswordPage from '@/pages/Auth/ForgotPassword';
import ResetPasswordPage from '@/pages/Auth/ResetPasswordPage';
import VerifyEmail from '@/pages/Auth/VerifyEmail';
import TwoFactorAuth from '@/pages/Auth/TwoFactorAuth';

// Pages Onboarding
import Started from '@/pages/Onboarding/Started';
import OnboardingProduct from '@/pages/Onboarding/OnboardingProduct';
import OnboardingPlatforms from '@/pages/Onboarding/OnboardingPlateforms';
import OnboardingAlerts from '@/pages/Onboarding/OnboardingAlerts';
import OnboardingInvite from '@/pages/Onboarding/OnboardingInvite';
import OnboardingSetup from '@/pages/Onboarding/OnboardingSetup';
import OnboardingComplete from '@/pages/Onboarding/OnboardingComplete';

/**
 * Component to handle redirection from /mentions to /mentions/:brandId
 */
function MentionsRedirect() {
  const { selectedBrand, loading } = useBrand();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (selectedBrand) {
    return <Navigate to={`/mentions/${selectedBrand.id}`} replace />;
  }

  return <Navigate to="/" replace />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <BrandProvider>
          <AuthProvider>
            <OnboardingProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  {/* Routes d'authentification (avec AuthLayout) */}
                  <Route element={<AuthLayout />}>
                    <Route path="/signin" element={<SignInPage />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/two-factor" element={<TwoFactorAuth />} />
                  </Route>

                  {/* Routes d'onboarding (protégées) */}
                  <Route path="/get-started" element={<ProtectedRoute><Started /></ProtectedRoute>} />
                  <Route path="/onboarding/product" element={<ProtectedRoute><OnboardingProduct /></ProtectedRoute>} />
                  <Route path="/onboarding/platforms" element={<ProtectedRoute><OnboardingPlatforms /></ProtectedRoute>} />
                  <Route path="/onboarding/alerts" element={<ProtectedRoute><OnboardingAlerts /></ProtectedRoute>} />
                  <Route path="/onboarding/invite" element={<ProtectedRoute><OnboardingInvite /></ProtectedRoute>} />
                  <Route path="/onboarding/setup" element={<ProtectedRoute><OnboardingSetup /></ProtectedRoute>} />
                  <Route path="/onboarding/complete" element={<ProtectedRoute><OnboardingComplete /></ProtectedRoute>} />

                  {/* Routes avec layout (sidebar + rightbar) (protégées) */}
                  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="mentions" element={<MentionsRedirect />} />
                    <Route path="mentions/:brandId" element={<Mentions />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="analysis" element={<Analysis />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="actions" element={<Actions />} />
                    <Route path="brands" element={<Brands />} />
                    <Route path="sources" element={<Sources />} />
                    <Route path="keywords" element={<Keywords />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </OnboardingProvider>
          </AuthProvider>
        </BrandProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);

