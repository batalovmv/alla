import React, { useEffect, useState } from 'react'
import { useInView } from '../../../utils/useInView'
import styles from './LazyMount.module.css'

export interface LazyMountProps {
  /**
   * Placeholder is rendered until the section is close to the viewport.
   * It should reserve enough height so the page can be scrolled further.
   */
  placeholder: React.ReactNode
  children: React.ReactNode
  className?: string
  rootMargin?: string
  onEnter?: () => void
}

export const LazyMount: React.FC<LazyMountProps> = ({
  placeholder,
  children,
  className,
  // Strict rootMargin: only trigger when element is actually close to viewport.
  // Negative bottom margin means element must be at least 50% visible from bottom.
  rootMargin = '0px 0px -50% 0px',
  onEnter,
}) => {
  // Use threshold > 0 so element must be at least 5% visible, not just 1px.
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, rootMargin, threshold: 0.05 })
  const [mounted, setMounted] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [enteredOnce, setEnteredOnce] = useState(false)

  useEffect(() => {
    if (!inView) return
    if (!mounted) setMounted(true)
    if (!enteredOnce) {
      setEnteredOnce(true)
      onEnter?.()
    }
  }, [inView, mounted, enteredOnce, onEnter])

  useEffect(() => {
    if (!mounted) return
    const raf = window.requestAnimationFrame(() => setAnimateIn(true))
    return () => window.cancelAnimationFrame(raf)
  }, [mounted])

  return (
    <div ref={ref} className={[styles.root, className || ''].filter(Boolean).join(' ')}>
      {mounted ? (
        <div className={[styles.content, animateIn ? styles.contentVisible : ''].filter(Boolean).join(' ')}>
          {children}
        </div>
      ) : (
        placeholder
      )}
    </div>
  )
}


