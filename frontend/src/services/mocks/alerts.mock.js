import { ALERTS, priorityWeight } from './seed'

// Contrato: specs/006-alert-system/design.md
export function getAlertsMock() {
  return [...ALERTS].sort((a, b) => {
    const byPriority = priorityWeight(b.priority) - priorityWeight(a.priority)
    if (byPriority !== 0) return byPriority
    return new Date(b.created_at) - new Date(a.created_at)
  })
}

export function getActiveAlertsMock() {
  return getAlertsMock().filter((a) => a.status === 'activa' || a.status === 'en_revision')
}
