import React from 'react'
import { useInView } from '../../../utils/useInView'
import styles from './Reveal.module.css'

export interface RevealProps {
  children: React.ReactNode
  className?: string
  once?: boolean
  delayMs?: number
  /**
   * Improves perceived smoothness by starting reveal slightly before element reaches viewport.
   */
  rootMargin?: string
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  className,
  once = true,
  delayMs = 0,
  rootMargin = '0px 0px -8% 0px',
}) => {
  const { ref, inView } = useInView<HTMLElement>({ once, rootMargin })

  const cls = [styles.root, inView ? styles.visible : '', className || '']
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={ref as unknown as React.Ref<HTMLDivElement>}
      className={cls}
      style={delayMs ? ({ transitionDelay: `${delayMs}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  )
}


