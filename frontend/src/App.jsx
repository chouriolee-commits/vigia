import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import RequireAuth from './components/RequireAuth'
import AppShell from './layouts/AppShell'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LivestockMonitoringPage from './pages/LivestockMonitoringPage'
import AlertsPage from './pages/AlertsPage'
import EventsLogPage from './pages/EventsLogPage'

// Contrato de navegación — README.md §7 / specs/002-dashboard/design.md.
// Únicas 5 rutas del MVP: /login (pública) + 4 protegidas por RequireAuth.
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/animales" element={<LivestockMonitoringPage />} />
            <Route path="/alertas" element={<AlertsPage />} />
            <Route path="/eventos" element={<EventsLogPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
