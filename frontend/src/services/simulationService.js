import { apiFetch, USE_MOCK } from './api'

// Controla el escaneo real del backend (vision/simulator.py como subproceso).
// En modo mock no hay backend real que lanzar — no-op silencioso.
export async function startSimulation(potreroId, video) {
  if (USE_MOCK) return { corriendo: false, potrero_id: null, video: null }
  return apiFetch('/api/simulacion', {
    method: 'POST',
    body: JSON.stringify({ potrero_id: potreroId, video }),
  })
}
