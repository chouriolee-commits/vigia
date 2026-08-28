import { apiFetch, USE_MOCK } from './api'
import { getEventsTodayMock } from './mocks/events.mock'
import { delay } from '../utils/delay'

// Contrato: specs/012-events-log/design.md
export async function getEventsToday() {
  if (USE_MOCK) {
    await delay()
    return getEventsTodayMock()
  }
  return apiFetch('/api/eventos?date=hoy')
}
