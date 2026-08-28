import { useEffect, useState } from 'react'
import { getDashboardSummary } from '../services/dashboardService'

// Polling simple: no hay WebSocket ni tracking frame-a-frame del video (004-drone-media
// sigue siendo un video pregrabado), así que refrescamos el dashboard cada POLL_MS para
// que las detecciones/alertas se sientan "vivas" mientras el simulador corre en background,
// en vez de depender de que el usuario recargue la página a mano.
const POLL_MS = 4000

export function useDashboardData() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    function fetchOnce(isFirstFetch) {
      if (isFirstFetch) setLoading(true)
      return getDashboardSummary()
        .then((result) => {
          if (cancelled) return
          setData(result)
          setError(null)
        })
        .catch((err) => {
          // En polls posteriores al primero, un error transitorio no debe tirar los
          // datos ya mostrados — solo se marca error si nunca hubo un fetch exitoso.
          if (!cancelled && isFirstFetch) setError(err)
        })
        .finally(() => {
          if (!cancelled && isFirstFetch) setLoading(false)
        })
    }

    fetchOnce(true)
    const intervalId = setInterval(() => fetchOnce(false), POLL_MS)

    return () => {
      cancelled = true
      clearInterval(intervalId)
    }
  }, [])

  return { data, loading, error }
}
