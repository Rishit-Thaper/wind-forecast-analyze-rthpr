import React from 'react'
import MetricCard from '../MetricCard'
import { formatNumber, formatSignedMw } from '../../utils/formatters'
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
      ? 'Forecast above actual on average'
      : 'Forecast below actual on average'

  const biasTone =
    metrics.bias_mw === null ? '' : metrics.bias_mw >= 0 ? 'positive' : 'negative'

  const wape = metrics.wape_percent === null ? '—' : `${metrics.wape_percent.toFixed(1)}%`

  const coveragePercent = coverage.expected_periods
    ? ((coverage.matched_periods / coverage.expected_periods) * 100).toFixed(1)
    : '0.0'

  return (
    <section className="metrics-grid" aria-label="Monthly forecast performance metrics">
      <MetricCard
        label="Mean Absolute Error (MAE)"
        value={formatNumber(metrics.mae_mw)}
        detail={`RMSE ${formatNumber(metrics.rmse_mw)} · WAPE ${wape}`}
      />
      <MetricCard
        label="Forecast Bias"
        value={formatSignedMw(metrics.bias_mw)}
        detail={biasLabel}
        tone={biasTone}
      />
      <MetricCard
        label="Shortfall Risk (P90)"
        value={formatNumber(metrics.p90_error_mw)}
        detail="Actual wind fell further below forecast in only 1 hour in 10"
        tone="negative"
      />
      <MetricCard
        label="Matched Delivery Hours"
        value={`${coverage.matched_periods.toLocaleString()} / ${coverage.expected_periods.toLocaleString()}`}
        detail={`${coveragePercent}% of delivery hours have a forecast and outturn`}
      />
    </section>
  )
}

export default OverviewMetrics
