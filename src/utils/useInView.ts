import { useCallback, useEffect, useRef, useState } from 'react'

export type InViewOptions = {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useInView<T extends Element>(opts?: InViewOptions): {
  ref: (node: T | null) => void
  inView: boolean
} {
  const { root = null, rootMargin = '0px', threshold = 0, once = true } = opts || {}
  const [inView, setInView] = useState(false)
  const nodeRef = useRef<T | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const setRef = useCallback((node: T | null) => {
    nodeRef.current = node
  }, [])

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    // Fallback for very old browsers: show immediately.
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    observerRef.current?.disconnect()
    const obs = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        const next = Boolean(entry?.isIntersecting)
        if (next) {
          setInView(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { root, rootMargin, threshold }
    )
    observerRef.current = obs
    obs.observe(node)

    return () => {
      obs.disconnect()
    }
  }, [root, rootMargin, threshold, once])

  return { ref: setRef, inView }
}





