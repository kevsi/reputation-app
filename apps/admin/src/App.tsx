import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'

import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Organisations from './pages/Organisations/Organisations'
import Users from './pages/Users/Users'
import Connectors from './pages/Connectors/Connectors'
import Keywords from './pages/Keywords/Keywords'
import Alerts from './pages/Alerts/Alerts'
import AIPage from './pages/AI/AIPage'
import Quality from './pages/Quality/QualityPage'
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import BrandsPage from './pages/Brands/BrandsPage'
import SourcesPage from './pages/Sources/SourcesPage'
import MentionsPage from './pages/Mentions/MentionsPage'
import ActionsPage from './pages/Actions/ActionsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected admin routes */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="mentions" element={<MentionsPage />} />
              <Route path="brands" element={<BrandsPage />} />
              <Route path="sources" element={<SourcesPage />} />
              <Route path="actions" element={<ActionsPage />} />
              <Route path="organisations" element={<Organisations />} />
              <Route path="users" element={<Users />} />
              <Route path="connectors" element={<Connectors />} />
              <Route path="keywords" element={<Keywords />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="ai" element={<AIPage />} />
              <Route path="quality" element={<Quality />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}