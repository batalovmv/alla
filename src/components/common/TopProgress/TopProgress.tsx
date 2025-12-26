import React, { useEffect, useState } from 'react'
import styles from './TopProgress.module.css'

export interface TopProgressProps {
  /**
   * Delay before showing the bar to avoid flashing on ultra-fast transitions.
   */
  delayMs?: number
}

export const TopProgress: React.FC<TopProgressProps> = ({ delayMs = 120 }) => {
  const [visible, setVisible] = useState(delayMs <= 0)

  useEffect(() => {
    if (delayMs <= 0) return
    const t = window.setTimeout(() => setVisible(true), delayMs)
    return () => window.clearTimeout(t)
  }, [delayMs])

  if (!visible) return null
  return <div className={styles.bar} aria-hidden="true" />
}





