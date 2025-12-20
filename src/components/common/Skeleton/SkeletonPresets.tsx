import React from 'react'
import Card from '../Card/Card'
import { Skeleton } from './Skeleton'
import styles from './SkeletonPresets.module.css'

export const ProcedureCardSkeleton: React.FC = () => {
  return (
    <Card className={styles.card}>
      <div className={styles.procedureCardTop}>
        <Skeleton width="100%" height={88} />
        <div className={styles.stack}>
          <Skeleton variant="text" height={16} width="70%" />
          <Skeleton variant="text" height={12} width="95%" />
          <Skeleton variant="text" height={12} width="80%" />
          <div className={styles.row} style={{ justifyContent: 'space-between' }}>
            <Skeleton variant="text" height={14} width={72} />
            <Skeleton variant="text" height={14} width={56} />
          </div>
        </div>
      </div>
      <div className={styles.actionsRow}>
        <Skeleton height={34} width={120} radius={10} />
        <Skeleton height={34} width={120} radius={10} />
      </div>
    </Card>
  )
}

export const ReviewCardSkeleton: React.FC = () => {
  return (
    <Card className={styles.card}>
      <div className={styles.row} style={{ justifyContent: 'space-between' }}>
        <div className={styles.row}>
          <Skeleton variant="circle" width={40} height={40} />
          <div className={styles.stack} style={{ gap: 6 }}>
            <Skeleton variant="text" height={14} width={140} />
            <Skeleton variant="text" height={12} width={180} />
          </div>
        </div>
        <Skeleton variant="text" height={14} width={80} />
      </div>
      <div className={styles.stack} style={{ marginTop: 12 }}>
        <Skeleton variant="text" height={12} width="100%" />
        <Skeleton variant="text" height={12} width="92%" />
        <Skeleton variant="text" height={12} width="78%" />
      </div>
      <div style={{ marginTop: 12 }}>
        <Skeleton variant="text" height={12} width={120} />
      </div>
    </Card>
  )
}

export const GridSkeleton: React.FC<{
  count?: number
  item: React.ReactNode
  className?: string
}> = ({ count = 6, item, className }) => {
  return (
    <div className={[styles.grid, className || ''].filter(Boolean).join(' ')}>
      {Array.from({ length: count }).map((_, i) => (
        <React.Fragment key={i}>{item}</React.Fragment>
      ))}
    </div>
  )
}

export const PageShellSkeleton: React.FC<{
  titleWidth?: number | string
  children: React.ReactNode
}> = ({ titleWidth = 240, children }) => {
  return (
    <div className={styles.page}>
      <div className={styles.pageTitle}>
        <Skeleton variant="text" height={22} width={titleWidth} />
      </div>
      {children}
    </div>
  )
}


