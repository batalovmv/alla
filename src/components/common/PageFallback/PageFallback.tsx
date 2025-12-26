import React from 'react'
import { TopProgress } from '../TopProgress/TopProgress'
import {
  GridSkeleton,
  PageShellSkeleton,
  ProcedureCardSkeleton,
  ReviewCardSkeleton,
} from '../Skeleton/SkeletonPresets'
import { Skeleton } from '../Skeleton/Skeleton'

export type PageFallbackVariant =
  | 'home'
  | 'procedures'
  | 'procedureDetail'
  | 'reviews'
  | 'contacts'
  | 'privacy'
  | 'about'
  | 'admin'

export const PageFallback: React.FC<{ variant: PageFallbackVariant }> = ({ variant }) => {
  return (
    <>
      <TopProgress />
      {variant === 'procedures' && (
        <PageShellSkeleton titleWidth={220}>
          <GridSkeleton count={6} item={<ProcedureCardSkeleton />} />
        </PageShellSkeleton>
      )}

      {variant === 'reviews' && (
        <PageShellSkeleton titleWidth={200}>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr', marginBottom: 16 }}>
            <Skeleton height={180} radius={16} />
          </div>
          <GridSkeleton count={4} item={<ReviewCardSkeleton />} />
        </PageShellSkeleton>
      )}

      {variant === 'contacts' && (
        <PageShellSkeleton titleWidth={180}>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr' }}>
            <Skeleton height={160} radius={16} />
            <Skeleton height={320} radius={16} />
            <Skeleton height={420} radius={16} />
          </div>
        </PageShellSkeleton>
      )}

      {variant === 'procedureDetail' && (
        <PageShellSkeleton titleWidth={280}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Skeleton height={360} radius={16} />
            <Skeleton height={220} radius={16} />
          </div>
        </PageShellSkeleton>
      )}

      {(variant === 'home' || variant === 'about' || variant === 'privacy' || variant === 'admin') && (
        <PageShellSkeleton titleWidth={variant === 'home' ? 280 : 220}>
          <div style={{ display: 'grid', gap: 16 }}>
            <Skeleton height={220} radius={16} />
            <Skeleton height={180} radius={16} />
          </div>
        </PageShellSkeleton>
      )}
    </>
  )
}




