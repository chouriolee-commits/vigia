import { useEffect, useState } from 'react'
import { getPotreros } from '../services/livestockService'

export function usePotreros() {
  const [potreros, setPotreros] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getPotreros()
      .then((result) => {
        if (!cancelled) setPotreros(result)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { potreros, loading }
}
