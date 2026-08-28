import { apiFetch, USE_MOCK } from './api'
import { getPotrerosMock, getReconciliationMock } from './mocks/livestock.mock'
import { delay } from '../utils/delay'

// Lista de potreros disponibles — para que el usuario pueda elegir cuál ver en
// /animales, incluyendo cualquiera que ya se haya escaneado con el simulador.
export async function getPotreros() {
  if (USE_MOCK) {
    await delay()
    return getPotrerosMock()
  }
  return apiFetch('/api/potreros')
}

// Contrato: specs/003-livestock-monitoring/design.md
export async function getReconciliation(potreroId) {
  if (USE_MOCK) {
    await delay()
    return getReconciliationMock(potreroId)
  }
  return apiFetch(`/api/potreros/${potreroId}/reconciliacion`)
}
