import React from 'react'
import Skeleton from './Skeleton'

export const MetricCardSkeleton: React.FC = () => {
  return (
    <article className="metric-card skeleton-card">
      <Skeleton width="60%" height={14} style={{ marginBottom: 12 }} />
      <Skeleton width="85%" height={32} style={{ marginBottom: 10 }} />
      <Skeleton width="45%" height={12} />
    </article>
  )
}

export default MetricCardSkeleton
