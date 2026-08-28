import { useLivestockReconciliation } from '../hooks/useLivestockReconciliation'
import BackButton from '../components/BackButton'
import LivestockTable from '../components/LivestockTable'
import StatusBadge, { RECONCILIATION_TONE } from '../components/StatusBadge'
import { formatDateTime, formatConfidence, BEHAVIOR_LABEL } from '../utils/format'
import './LivestockMonitoringPage.css'

// RF2 [Fase futura] — selector de potrero. El MVP usa un único potrero fijo del seed/mock
// (specs/003-livestock-monitoring/requirements.md).
const POTRERO_ID = 1

const REAL_COLUMNS = [
  {
    key: 'animal',
    header: 'Animal',
    render: (row) => (row.livestock_tag ? <span className="mono">{row.livestock_tag}</span> : 'Animal no identificado'),
  },
  {
    key: 'detected_at',
    header: 'Última detección',
    render: (row) => <span className="mono">{formatDateTime(row.detected_at)}</span>,
  },
  {
    key: 'behavior',
    header: 'Comportamiento',
    render: (row) => BEHAVIOR_LABEL[row.behavior] ?? row.behavior ?? '—',
  },
  {
    key: 'confidence',
    header: 'Confidence',
    render: (row) => <span className="mono">{formatConfidence(row.confidence)}</span>,
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (row) =>
      row.es_esperado_aqui ? (
        <StatusBadge tone={RECONCILIATION_TONE.ok}>En potrero</StatusBadge>
      ) : (
        <StatusBadge tone={RECONCILIATION_TONE.desconocido}>Fuera de potrero</StatusBadge>
      ),
  },
]

const EXPECTED_COLUMNS = [
  { key: 'animal', header: 'Animal', render: (row) => <span className="mono">{row.livestock_tag}</span> },
  { key: 'especie', header: 'Especie/Raza', render: (row) => `${row.species} / ${row.breed}` },
  { key: 'status', header: 'Estado', render: (row) => row.status },
  {
    key: 'detectado',
    header: '¿Detectado?',
    render: (row) =>
      row.detectado_recientemente ? (
        <StatusBadge tone={RECONCILIATION_TONE.ok}>Sí</StatusBadge>
      ) : (
        <StatusBadge tone={RECONCILIATION_TONE.faltante}>Faltante</StatusBadge>
      ),
  },
]

export default function LivestockMonitoringPage() {
  const { data, loading, error } = useLivestockReconciliation(POTRERO_ID)

  return (
    <div className="livestock-page">
      <header className="livestock-page__header">
        <h1>{data?.potrero?.name ?? 'Animales monitoreados'}</h1>
        <BackButton />
      </header>

      {loading && <p className="livestock-page__status">Cargando reconciliación de animales…</p>}
      {error && (
        <p className="livestock-page__status livestock-page__status--error">
          No se pudo cargar la información del potrero. Intenta de nuevo.
        </p>
      )}

      {!loading && !error && data && (
        <div className="livestock-page__grid">
          <section className="livestock-page__section">
            <h2>En el potrero (real)</h2>
            <LivestockTable
              columns={REAL_COLUMNS}
              rows={data.animales_reales}
              rowKey="livestock_id"
              emptyMessage="No hay detecciones recientes en este potrero."
            />
          </section>
          <section className="livestock-page__section">
            <h2>Deberían estar (esperado)</h2>
            <LivestockTable
              columns={EXPECTED_COLUMNS}
              rows={data.animales_esperados}
              rowKey="livestock_id"
              emptyMessage="No hay animales asignados a este potrero."
            />
          </section>
        </div>
      )}
    </div>
  )
}
