import React from 'react'
import MetricCard from '../MetricCard'
import { formatMw } from '../../utils/formatters'
import type { Metrics } from '../../types/analytics'

export interface DailyMetricsProps {
  metrics: Metrics
}

export const DailyMetrics: React.FC<DailyMetricsProps> = ({ metrics }) => {
  const biasLabel =
    metrics.bias_mw === null
      ? 'Unavailable'
      : metrics.bias_mw >= 0
      ? 'Over-forecasting outturn'
      : 'Under-forecasting outturn'

  const biasTone =
    metrics.bias_mw === null ? '' : metrics.bias_mw >= 0 ? 'positive' : 'negative'

  const biasValue =
    metrics.bias_mw !== null
      ? `${metrics.bias_mw >= 0 ? '+' : ''}${formatMw(metrics.bias_mw)}`
      : '—'

  const wapeValue =
    metrics.wape_percent === null ? '—' : `${metrics.wape_percent.toFixed(1)}%`

  return (
    <section className="metrics-grid compact">
      <MetricCard
        label="Daily MAE"
        value={formatMw(metrics.mae_mw)}
        detail={`${metrics.matched_periods} matched delivery periods`}
      />
      <MetricCard
        label="Daily Forecast Bias"
        value={biasValue}
        detail={biasLabel}
        tone={biasTone}
      />
      <MetricCard
        label="WAPE"
        value={wapeValue}
        detail="Total absolute error / total generation"
      />
    </section>
  )
}

export default DailyMetrics
