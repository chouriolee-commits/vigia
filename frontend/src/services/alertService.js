import { apiFetch, USE_MOCK } from './api'
import { getAlertsMock } from './mocks/alerts.mock'
import { delay } from '../utils/delay'

// Contrato: specs/006-alert-system/design.md
export async function getAlerts() {
  if (USE_MOCK) {
    await delay()
    return getAlertsMock()
  }
  return apiFetch('/api/alertas')
}
