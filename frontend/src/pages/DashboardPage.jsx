import { useNavigate } from 'react-router-dom'
import { useDashboardData } from '../hooks/useDashboardData'
import { BellIcon, CalendarIcon, PawIcon } from '../components/icons'
import KpiCard from '../components/KpiCard'
import LiveFeedPanel from '../components/LiveFeedPanel'
import DetectedEventPanel from '../components/DetectedEventPanel'
import AiAssistantPanel from '../components/AiAssistantPanel'
import './DashboardPage.css'

const HIGH_PRIORITY = new Set(['alta', 'critica'])

// specs/002-dashboard/design.md — pantalla `/`: feed + 3 KPI cards (única navegación) + evento
// detectado + chat VIGÍA AI. AppShell ya aporta header/nav, esta página solo orquesta el contenido.
export default function DashboardPage() {
  const navigate = useNavigate()
  const { data, loading, error } = useDashboardData()

  const alertasCount = data?.alertas_activas.length ?? 0
  const highPriorityCount = data?.alertas_activas.filter((a) => HIGH_PRIORITY.has(a.priority)).length ?? 0

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__main">
        <LiveFeedPanel />

        <div className="dashboard-page__kpis">
          {loading && (
            <p className="dashboard-page__status" role="status">
              Cargando resumen…
            </p>
          )}
          {!loading && error && (
            <p className="dashboard-page__status dashboard-page__status--error" role="alert">
              No se pudo cargar el resumen del dashboard.
            </p>
          )}
          {!loading && !error && data && (
            <>
              <KpiCard
                icon={PawIcon}
                label="Animales Monitoreados"
                value={data.animales_monitoreados.total}
                sublabel="Actualizado ahora"
                tone="accent"
                onClick={() => navigate('/animales')}
              />
              <KpiCard
                icon={BellIcon}
                label="Alertas Activas"
                value={alertasCount}
                sublabel={alertasCount > 0 ? `${highPriorityCount} prioridad alta` : undefined}
                tone="warning"
                onClick={() => navigate('/alertas')}
              />
              <KpiCard
                icon={CalendarIcon}
                label="Eventos Hoy"
                value={data.eventos_hoy.total}
                sublabel="Total"
                tone="info"
                onClick={() => navigate('/eventos')}
              />
            </>
          )}
        </div>
      </div>

      <div className="dashboard-page__side">
        {loading && (
          <p className="dashboard-page__status" role="status">
            Cargando…
          </p>
        )}
        {!loading && error && (
          <p className="dashboard-page__status dashboard-page__status--error" role="alert">
            No se pudo cargar la información del dashboard. Intenta de nuevo más tarde.
          </p>
        )}
        {!loading && !error && data && (
          <>
            <DetectedEventPanel eventoDetectado={data.evento_detectado} />
            <AiAssistantPanel data={data} />
          </>
        )}
      </div>
    </div>
  )
}
