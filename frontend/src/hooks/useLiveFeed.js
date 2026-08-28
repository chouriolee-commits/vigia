import { useEffect, useState } from 'react'
import { getLiveFeedFrame } from '../services/droneService'

// specs/004-drone-media: timestamp simulado que avanza, sin depender de un stream real.
export function useLiveFeed() {
  const [frame, setFrame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let cancelled = false
    getLiveFeedFrame()
      .then((result) => {
        if (!cancelled) setFrame(result)
      })
      .catch((err) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return { frame, now, loading, error }
}
