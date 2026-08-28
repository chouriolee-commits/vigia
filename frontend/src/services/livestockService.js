import { apiFetch, USE_MOCK } from './api'
import { getReconciliationMock } from './mocks/livestock.mock'
import { delay } from '../utils/delay'

// Contrato: specs/003-livestock-monitoring/design.md
export async function getReconciliation(potreroId) {
  if (USE_MOCK) {
    await delay()
    return getReconciliationMock(potreroId)
  }
  return apiFetch(`/api/potreros/${potreroId}/reconciliacion`)
}
