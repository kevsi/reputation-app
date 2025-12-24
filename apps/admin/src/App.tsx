import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'

import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Organisations from './pages/Organisations/Organisations'
import Users from './pages/Users/Users'
import Connectors from './pages/Connectors/Connectors'
import Keywords from './pages/Keywords/Keywords'
import Alerts from './pages/Alerts/Alerts'
import Ai from './pages/AI/AIPage'
import Quality from './pages/Quality/QualityPage'
import AIPage from './pages/AI/AIPage'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
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
    </ThemeProvider>
  )
}