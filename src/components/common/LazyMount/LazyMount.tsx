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
  rootMargin = '700px 0px',
  onEnter,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, rootMargin })
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


