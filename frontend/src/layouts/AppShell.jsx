import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BellIcon, CalendarIcon, LogoutIcon, PawIcon } from '../components/icons'
import BrandLogo from '../components/BrandLogo'
import './AppShell.css'

const NAV_ITEMS = [
  { to: '/animales', label: 'Animales', icon: PawIcon },
  { to: '/alertas', label: 'Alertas', icon: BellIcon },
  { to: '/eventos', label: 'Eventos Hoy', icon: CalendarIcon },
]

// specs/002-dashboard/design.md — contrato de navegación de los 3 botones,
// disponible también como bottom-nav en mobile (fotos-diseño/mobile.jpeg).
export default function AppShell() {
  const { user, logout } = useAuth()
  // El dashboard ("/") está pensado para verse completo sin scroll (video + KPIs +
  // asistente) -- las demás pantallas son tablas que sí deben poder crecer y hacer
  // scroll normal cuando hay muchas filas. `app-shell--fit` solo se aplica en "/".
  const { pathname } = useLocation()
  const esDashboard = pathname === '/'

  return (
    <div className={`app-shell${esDashboard ? ' app-shell--fit' : ''}`}>
      <header className="app-shell__topbar">
        <NavLink to="/" className="app-shell__brand">
          <BrandLogo size="sm" />
          <span className="app-shell__brand-sub">VIGILANCIA INTELIGENTE PARA LA GANADERÍA: IDENTIFICACIÓN DE ANOMALÍAS</span>
        </NavLink>

        {/*
          fotos-diseño/desktop.jpeg: el header SOLO tiene el logo — ninguna navegación.
          La navegación a Animales/Alertas/Eventos Hoy vive exclusivamente en las 3 KPI cards
          debajo de "Monitoreo actual" (002-dashboard). En mobile sigue existiendo el bottom-nav
          porque ESE sí está en fotos-diseño/mobile.jpeg.
        */}
        <div className="app-shell__user">
          {user?.name && <span className="app-shell__user-name">{user.name}</span>}
          <button type="button" className="app-shell__logout" onClick={logout}>
            <LogoutIcon width={17} height={17} />
            <span className="app-shell__logout-label">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <main className="app-shell__content">
        <Outlet />
      </main>

      <nav className="app-shell__nav-mobile" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `app-shell__nav-mobile-link${isActive ? ' is-active' : ''}`}>
            <Icon width={20} height={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
