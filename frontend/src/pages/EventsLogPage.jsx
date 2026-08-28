import { useEventsToday } from '../hooks/useEventsToday'
import BackButton from '../components/BackButton'
import LivestockTable from '../components/LivestockTable'
import EventTypeIcon from '../components/EventTypeIcon'
import { formatTime } from '../utils/format'
import './EventsLogPage.css'

const COLUMNS = [
  { key: 'occurred_at', header: 'Hora', render: (row) => <span className="mono">{formatTime(row.occurred_at)}</span> },
  { key: 'type', header: 'Tipo', render: (row) => <EventTypeIcon type={row.type} /> },
  { key: 'description', header: 'Descripción', render: (row) => row.description },
  {
    key: 'related',
    header: 'Animal/Potrero',
    render: (row) =>
      row.related_livestock_tag ? (
        <span className="mono">{row.related_livestock_tag}</span>
      ) : (
        row.related_potrero_name ?? 'N/A'
      ),
  },
]

export default function EventsLogPage() {
  const { data, loading, error } = useEventsToday()

  return (
    <div className="events-page">
      <header className="events-page__header">
        <h1>Eventos de hoy</h1>
        <BackButton />
      </header>

      {loading && <p className="events-page__status">Cargando eventos…</p>}
      {error && (
        <p className="events-page__status events-page__status--error">
          No se pudieron cargar los eventos. Intenta de nuevo.
        </p>
      )}
      {!loading && !error && (
        <LivestockTable columns={COLUMNS} rows={data ?? []} rowKey="id" emptyMessage="Sin eventos hoy." />
      )}
    </div>
  )
}
