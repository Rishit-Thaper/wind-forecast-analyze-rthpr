import React from 'react'
import { formatMw, formatSignedMw } from '../../utils/formatters'
import type { ForecastFreshness } from '../../types/analytics'

export interface ForecastFreshnessPanelProps {
  freshness: ForecastFreshness[]
  cutoffTimeUtc: string
}

export const ForecastFreshnessPanel: React.FC<ForecastFreshnessPanelProps> = ({
  freshness,
  cutoffTimeUtc,
}) => {
  // The latest publication available before gate closure is the one decisions actually use.
  const usedAsOf = freshness.filter((row) => row.before_cutoff).pop()?.as_of_utc

  return (
    <div className="panel">
      <h2>Value of Waiting</h2>
      <p className="panel-subtitle">
        Accuracy using the latest forecast as of each WINDFOR publication on the day before
        delivery. Publications after the {cutoffTimeUtc} UTC gate closure arrive too late to buy on.
      </p>
      <table className="mini-table">
        <thead>
          <tr>
            <th>Latest as of</th>
            <th>MAE</th>
            <th>Bias</th>
            <th>P90 shortfall</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {freshness.map((row) => (
            <tr key={row.as_of_utc} className={row.as_of_utc === usedAsOf ? 'row-current' : ''}>
              <td>D-1 {row.as_of_utc}</td>
              <td>{formatMw(row.mae_mw)}</td>
              <td>{formatSignedMw(row.bias_mw)}</td>
              <td>{formatMw(row.p90_error_mw)}</td>
              <td>
                {row.as_of_utc === usedAsOf ? (
                  <span className="status-pill pill-info">Used</span>
                ) : !row.before_cutoff ? (
                  <span className="status-pill pill-neutral">Too late</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ForecastFreshnessPanel
