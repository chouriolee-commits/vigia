import { apiFetch, USE_MOCK } from './api'
import { getDashboardSummaryMock } from './mocks/dashboard.mock'
import { delay } from '../utils/delay'

// Contrato: specs/002-dashboard/design.md
export async function getDashboardSummary() {
  if (USE_MOCK) {
    await delay()
    return getDashboardSummaryMock()
  }
  return apiFetch('/api/dashboard')
}
