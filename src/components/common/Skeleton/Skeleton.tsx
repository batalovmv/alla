import React from 'react'
import styles from './Skeleton.module.css'

export type SkeletonVariant = 'rect' | 'text' | 'circle'

export interface SkeletonProps {
  variant?: SkeletonVariant
  width?: number | string
  height?: number | string
  radius?: number
  className?: string
  style?: React.CSSProperties
  'aria-label'?: string
}

function toCssSize(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}px` : v
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  radius,
  className,
  style,
  'aria-label': ariaLabel = 'Loading',
}) => {
  const cls = [
    styles.skeleton,
    variant === 'text' ? styles.text : '',
    variant === 'circle' ? styles.circle : '',
    className || '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={cls}
      aria-label={ariaLabel}
      role="status"
      style={{
        width: toCssSize(width),
        height: toCssSize(height),
        borderRadius: radius,
        ...style,
      }}
    />
  )
}


