import React from 'react'
import { formatDateTitle, formatSignedMw, formatUtcDateTime } from '../../utils/formatters'
import type { DailyResponse } from '../../types/analytics'

export interface DecisionContextPanelProps {
  data: DailyResponse
}

export const DecisionContextPanel: React.FC<DecisionContextPanelProps> = ({ data }) => {
  const leadTimes = data.periods
    .map((row) => row.lead_time_hours)
    .filter((hours): hours is number => hours !== null)
  const leadTimeRange = leadTimes.length
    ? `${Math.min(...leadTimes)}–${Math.max(...leadTimes)} h ahead`
    : '—'

  return (
    <div className="panel">
      <h2>Decision Context</h2>
      <p className="panel-subtitle">What the buyer knew when power for this day was purchased.</p>
      <dl className="coverage-list">
        <div>
          <dt>Purchase decision</dt>
          <dd>
            {formatDateTitle(data.decision_date)}, by {data.cutoff_time_utc} UTC
          </dd>
        </div>
        <div>
          <dt>Forecast used (published)</dt>
          <dd>
            {data.forecast_publications.length
              ? data.forecast_publications.map(formatUtcDateTime).join(', ')
              : 'None available'}
          </dd>
        </div>
        <div>
          <dt>Forecast lead time</dt>
          <dd>{leadTimeRange}</dd>
        </div>
        <div>
          <dt>Typical error (P50)</dt>
          <dd>{formatSignedMw(data.metrics.p50_error_mw)}</dd>
        </div>
        <div>
          <dt>Error range (P10 to P90)</dt>
          <dd>
            {formatSignedMw(data.metrics.p10_error_mw)} to {formatSignedMw(data.metrics.p90_error_mw)}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export default DecisionContextPanel
