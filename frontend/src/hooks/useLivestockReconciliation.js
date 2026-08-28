import { useEffect, useState } from 'react'
import { getReconciliation } from '../services/livestockService'

export function useLivestockReconciliation(potreroId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getReconciliation(potreroId)
      .then((result) => {
        if (!cancelled) setData(result)
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
  }, [potreroId])

  return { data, loading, error }
}
