import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLiveFeed } from './useLiveFeed'

describe('useLiveFeed', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resuelve loading y expone el frame del mock, y avanza `now` cada segundo', async () => {
    const { result } = renderHook(() => useLiveFeed())

    expect(result.current.loading).toBe(true)
    const initialNow = result.current.now

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    // fake timers + waitFor (polling con setTimeout real) se bloquean entre sí — se asume
    // ya resuelto tras flushear los timers pendientes con act().
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.frame).toHaveProperty('detections')
    expect(Array.isArray(result.current.frame.detections)).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })

    expect(result.current.now.getTime()).toBeGreaterThan(initialNow.getTime())
  })
})
