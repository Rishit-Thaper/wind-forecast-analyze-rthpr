import React from 'react'
import MetricCard from '../MetricCard'
import { formatNumber } from '../../utils/formatters'
import type { Metrics, Coverage } from '../../types/analytics'

export interface OverviewMetricsProps {
  metrics: Metrics
  coverage: Coverage
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({ metrics, coverage }) => {
  const biasLabel =
    metrics.bias_mw === null
      ? 'Unavailable'
      : metrics.bias_mw >= 0
      ? 'Over-forecasting on average'
      : 'Under-forecasting on average'

  const biasTone =
    metrics.bias_mw === null ? '' : metrics.bias_mw >= 0 ? 'positive' : 'negative'

  const biasValue =
    metrics.bias_mw !== null
      ? `${metrics.bias_mw >= 0 ? '+' : ''}${formatNumber(metrics.bias_mw)}`
      : '—'

  const coveragePercent = ((coverage.matched_periods / coverage.expected_periods) * 100).toFixed(1)

  return (
    <section className="metrics-grid" aria-label="Monthly forecast performance metrics">
      <MetricCard
        label="Mean Absolute Error (MAE)"
        value={formatNumber(metrics.mae_mw)}
        detail={`${metrics.matched_periods.toLocaleString()} matched half-hour periods`}
      />
      <MetricCard
        label="Root Mean Square Error (RMSE)"
        value={formatNumber(metrics.rmse_mw)}
        detail="Penalizes large extreme deviations"
      />
      <MetricCard
        label="Forecast Bias"
        value={biasValue}
        detail={biasLabel}
        tone={biasTone}
      />
      <MetricCard
        label="Matched Delivery Periods"
        value={`${coverage.matched_periods.toLocaleString()} / ${coverage.expected_periods.toLocaleString()}`}
        detail={`${coveragePercent}% complete January coverage`}
      />
    </section>
  )
}

export default OverviewMetrics
