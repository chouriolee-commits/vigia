import { useState } from 'react'
import { useLivestockReconciliation } from '../hooks/useLivestockReconciliation'
import { usePotreros } from '../hooks/usePotreros'
import BackButton from '../components/BackButton'
import LivestockTable from '../components/LivestockTable'
import StatusBadge, { RECONCILIATION_TONE } from '../components/StatusBadge'
import { formatDateTime, formatConfidence, BEHAVIOR_LABEL } from '../utils/format'
import './LivestockMonitoringPage.css'

const POTRERO_ID_DEFAULT = 1

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
  const { potreros } = usePotreros()
  const [potreroId, setPotreroId] = useState(POTRERO_ID_DEFAULT)
  const { data, loading, error } = useLivestockReconciliation(potreroId)

  return (
    <div className="livestock-page">
      <header className="livestock-page__header">
        <h1>
          {data?.potrero?.name ?? 'Animales monitoreados'}
          {data && (
            <span className="livestock-page__total">
              {data.animales_esperados.length} {data.animales_esperados.length === 1 ? 'animal' : 'animales'}
            </span>
          )}
          {data && (
            <span className="livestock-page__scanned" title="Animales contados en el último escaneo con dron de este potrero">
              {data.cantidad_escaneada} {data.cantidad_escaneada === 1 ? 'escaneado' : 'escaneados'}
            </span>
          )}
        </h1>
        <div className="livestock-page__header-actions">
          {potreros.length > 1 && (
            <label className="livestock-page__potrero-select">
              <span className="sr-only">Potrero a mostrar</span>
              <select value={potreroId} onChange={(e) => setPotreroId(Number(e.target.value))}>
                {potreros.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <BackButton />
        </div>
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
