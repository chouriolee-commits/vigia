import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

// Click en cualquier fila (real o esperado) manda directo al asistente de IA
// (dashboard `/`) con toda la información del animal ya cargada -- ahí el
// usuario puede ver sus datos completos y seguir preguntando. Se arma
// combinando lo que ya viene en `data` (nunca se pide de nuevo al backend):
// `animales_esperados` trae especie/raza/estado del inventario, `animales_reales`
// trae alias/última detección/comportamiento si el animal fue visto en el
// último escaneo. Un animal puede estar en una sola de las dos listas.
function armarAnimalFoco(row, data) {
  const esperado = data.animales_esperados.find((a) => a.livestock_id === row.livestock_id)
  const real = data.animales_reales.find((a) => a.livestock_id === row.livestock_id)
  return {
    livestock_id: row.livestock_id,
    livestock_tag: esperado?.livestock_tag ?? real?.livestock_tag,
    alias: real?.alias ?? null,
    species: esperado?.species ?? null,
    breed: esperado?.breed ?? null,
    status: esperado?.status ?? null,
    potrero: data.potrero.name,
    detectado_recientemente: esperado?.detectado_recientemente ?? null,
    es_esperado_aqui: real?.es_esperado_aqui ?? null,
    ultima_deteccion: real?.detected_at ?? null,
    comportamiento: real?.behavior ?? null,
    confidence: real?.confidence ?? null,
  }
}

export default function LivestockMonitoringPage() {
  const navigate = useNavigate()
  const { potreros } = usePotreros()
  const [potreroId, setPotreroId] = useState(POTRERO_ID_DEFAULT)
  const { data, loading, error } = useLivestockReconciliation(potreroId)

  // Detecciones sin identificar (livestock_id null) no tienen un animal real
  // detrás -- no hay a dónde "ir" con ellas, se ignora el click.
  function handleRowClick(row) {
    if (row.livestock_id == null) return
    navigate('/', { state: { animalFoco: armarAnimalFoco(row, data) } })
  }

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
              onRowClick={handleRowClick}
            />
          </section>
          <section className="livestock-page__section">
            <h2>Deberían estar (esperado)</h2>
            <LivestockTable
              columns={EXPECTED_COLUMNS}
              rows={data.animales_esperados}
              rowKey="livestock_id"
              emptyMessage="No hay animales asignados a este potrero."
              onRowClick={handleRowClick}
            />
          </section>
        </div>
      )}
    </div>
  )
}
