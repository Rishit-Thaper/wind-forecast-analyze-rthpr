import React from 'react'

export interface MetricCardProps {
  label: string
  value: string | number
  detail?: string
  tone?: 'positive' | 'negative' | 'neutral' | ''
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  detail,
  tone = '',
}) => {
  return (
    <article className={`metric-card ${tone ? `tone-${tone}` : ''}`}>
      <span className="metric-label">{label}</span>
      <div className="metric-value">{value}</div>
      {detail && <span className="metric-detail">{detail}</span>}
    </article>
  )
}

export default MetricCard
