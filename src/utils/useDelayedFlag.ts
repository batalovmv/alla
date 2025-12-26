import { useEffect, useState } from 'react'

/**
 * Turns on after delay to avoid UI flicker, turns off immediately.
 */
export function useDelayedFlag(flag: boolean, delayMs = 150): boolean {
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!flag) {
      setOn(false)
      return
    }
    const t = window.setTimeout(() => setOn(true), delayMs)
    return () => window.clearTimeout(t)
  }, [flag, delayMs])

  return on
}




