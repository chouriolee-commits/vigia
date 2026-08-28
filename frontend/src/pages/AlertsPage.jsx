import { useAlerts } from '../hooks/useAlerts'
import BackButton from '../components/BackButton'
import LivestockTable from '../components/LivestockTable'
import StatusBadge, { PRIORITY_TONE, ALERT_STATUS_TONE } from '../components/StatusBadge'
import { formatDateTime, PRIORITY_LABEL, ALERT_TYPE_LABEL, STATUS_LABEL } from '../utils/format'
import './AlertsPage.css'

const COLUMNS = [
  {
    key: 'priority',
    header: 'Prioridad',
    render: (row) => <StatusBadge tone={PRIORITY_TONE[row.priority]}>{PRIORITY_LABEL[row.priority] ?? row.priority}</StatusBadge>,
  },
  {
    key: 'animal',
    header: 'Animal',
    render: (row) => (row.livestock_tag ? <span className="mono">{row.livestock_tag}</span> : 'N/A'),
  },
  { key: 'type', header: 'Tipo', render: (row) => ALERT_TYPE_LABEL[row.type] ?? row.type },
  { key: 'description', header: 'Descripción', render: (row) => row.description },
  {
    key: 'created_at',
    header: 'Fecha/hora',
    render: (row) => <span className="mono">{formatDateTime(row.created_at)}</span>,
  },
  {
    key: 'status',
    header: 'Estado',
    render: (row) => <StatusBadge tone={ALERT_STATUS_TONE[row.status]}>{STATUS_LABEL[row.status] ?? row.status}</StatusBadge>,
  },
]

export default function AlertsPage() {
  const { data, loading, error } = useAlerts()

  return (
    <div className="alerts-page">
      <header className="alerts-page__header">
        <h1>Alertas</h1>
        <BackButton />
      </header>

      {loading && <p className="alerts-page__status">Cargando alertas…</p>}
      {error && (
        <p className="alerts-page__status alerts-page__status--error">
          No se pudieron cargar las alertas. Intenta de nuevo.
        </p>
      )}
      {!loading && !error && (
        <LivestockTable columns={COLUMNS} rows={data ?? []} rowKey="id" emptyMessage="No hay alertas activas." />
      )}
    </div>
  )
}
