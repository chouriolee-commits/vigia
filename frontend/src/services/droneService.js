import { getLiveFeedFrameMock } from './mocks/liveFeed.mock'
import { delay } from '../utils/delay'

// Contrato: specs/004-drone-media/design.md — 100% mock incluso en fase 2 (feed simulado).
export async function getLiveFeedFrame() {
  await delay(150)
  return getLiveFeedFrameMock()
}
