import React from 'react'
import Skeleton from './Skeleton'
import MetricCardSkeleton from './MetricCardSkeleton'

export const DailyDetailSkeleton: React.FC = () => {
  return (
    <div className="skeleton-fade-in" aria-busy="true" aria-label="Loading daily detail data">
      {/* Back navigation */}
      <div className="back-nav">
        <Skeleton width={170} height={16} borderRadius={4} />
      </div>

      {/* Header */}
      <section className="section-heading">
        <div>
          <Skeleton width={90} height={13} style={{ marginBottom: 8 }} />
          <Skeleton width={240} height={32} style={{ marginBottom: 8 }} />
          <Skeleton width={220} height={16} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Skeleton width={70} height={38} borderRadius={6} />
          <Skeleton width={150} height={38} borderRadius={6} />
          <Skeleton width={70} height={38} borderRadius={6} />
        </div>
      </section>

      {/* Metric Cards (compact 3 cards) */}
      <section className="metrics-grid compact">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </section>

      {/* Generation Chart Panel */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <Skeleton width={220} height={20} style={{ marginBottom: 6 }} />
            <Skeleton width={260} height={14} />
          </div>
          <Skeleton width={50} height={24} borderRadius={12} />
        </div>
        <Skeleton width="100%" height={290} borderRadius={6} />
      </section>

      {/* Detail Grid: Largest Misses & Hourly Error */}
      <section className="detail-grid">
        <div className="panel">
          <Skeleton width={180} height={20} style={{ marginBottom: 16 }} />
          <div style={{ display: 'grid', gap: 12 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #edf1f3' }}>
                <Skeleton width={50} height={16} />
                <Skeleton width={80} height={16} />
                <Skeleton width={60} height={16} />
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <Skeleton width={210} height={20} style={{ marginBottom: 16 }} />
          <div className="hour-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ padding: 10, background: '#f8fafc', borderRadius: 6 }}>
                <Skeleton width={45} height={12} style={{ marginBottom: 6 }} />
                <Skeleton width={65} height={16} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Half-hourly comparison table */}
      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <Skeleton width={200} height={20} style={{ marginBottom: 6 }} />
            <Skeleton width={280} height={14} />
          </div>
          <Skeleton width={180} height={16} />
        </div>
        <div style={{ padding: '8px 0' }}>
          <div style={{ display: 'flex', gap: 16, padding: '12px 16px', background: '#f8fafc', marginBottom: 8 }}>
            <Skeleton width={90} height={14} />
            <Skeleton width={100} height={14} />
            <Skeleton width={100} height={14} />
            <Skeleton width={90} height={14} />
            <Skeleton width={90} height={14} />
            <Skeleton width={140} height={14} />
          </div>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
            <div key={row} style={{ display: 'flex', gap: 16, padding: '12px 16px', borderTop: '1px solid #edf1f3' }}>
              <Skeleton width={80} height={14} />
              <Skeleton width={90} height={14} />
              <Skeleton width={90} height={14} />
              <Skeleton width={80} height={14} />
              <Skeleton width={80} height={14} />
              <Skeleton width={160} height={14} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DailyDetailSkeleton
