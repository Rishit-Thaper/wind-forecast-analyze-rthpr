import React from 'react'
import Skeleton from './Skeleton'
import MetricCardSkeleton from './MetricCardSkeleton'

export const OverviewSkeleton: React.FC = () => {
  return (
    <div className="skeleton-fade-in" aria-busy="true" aria-label="Loading overview data">
      {/* Section Header */}
      <section className="section-heading">
        <div>
          <Skeleton width={110} height={13} style={{ marginBottom: 8 }} />
          <Skeleton width={320} height={32} style={{ marginBottom: 8 }} />
          <Skeleton width={260} height={16} />
        </div>
        <Skeleton width={160} height={38} borderRadius={6} />
      </section>

      {/* Metrics Grid */}
      <section className="metrics-grid">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </section>

      {/* Chart Panel */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <Skeleton width={200} height={20} style={{ marginBottom: 6 }} />
            <Skeleton width={280} height={14} />
          </div>
          <Skeleton width={160} height={36} borderRadius={6} />
        </div>
        <Skeleton width="100%" height={260} borderRadius={6} />
      </section>

      {/* Bottom Grid */}
      <section className="coverage-grid">
        <div className="panel">
          <Skeleton width={140} height={20} style={{ marginBottom: 20 }} />
          <div style={{ display: 'grid', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width={170} height={14} />
              <Skeleton width={40} height={14} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width={150} height={14} />
              <Skeleton width={40} height={14} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width={140} height={14} />
              <Skeleton width={50} height={14} />
            </div>
          </div>
        </div>

        <div className="panel">
          <Skeleton width={140} height={20} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={16} style={{ marginBottom: 10 }} />
          <Skeleton width="80%" height={16} style={{ marginBottom: 16 }} />
          <Skeleton width="60%" height={13} />
        </div>
      </section>
    </div>
  )
}

export default OverviewSkeleton
