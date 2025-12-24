import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './global.css';

import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Mentions from '@/pages/Mentions/Mentions';
import Alerts from '@/pages/Alerts/Alerts';
import Analysis from '@/pages/Analysis/Analysis';
import Reports from '@/pages/Reports/Reports';
import Actions from '@/pages/Actions/Actions';
import Sources from '@/pages/Sources/Sources';
import Settings from '@/pages/Settings/Settings';

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
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

          {/* Routes d'onboarding (sans layout) */}
          <Route path="/get-started" element={<Started />} />
          <Route path="/onboarding/product" element={<OnboardingProduct />} />
          <Route path="/onboarding/platforms" element={<OnboardingPlatforms />} />
          <Route path="/onboarding/alerts" element={<OnboardingAlerts />} />
          <Route path="/onboarding/invite" element={<OnboardingInvite />} />
          <Route path="/onboarding/setup" element={<OnboardingSetup />} />
          <Route path="/onboarding/complete" element={<OnboardingComplete />} />
          
          {/* Routes avec layout (sidebar + rightbar) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="mentions" element={<Mentions />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="reports" element={<Reports />} />
            <Route path="actions" element={<Actions />} />
            <Route path="sources" element={<Sources />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<div>404 Not Found</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);