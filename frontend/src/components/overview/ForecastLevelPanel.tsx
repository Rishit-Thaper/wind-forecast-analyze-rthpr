import React from 'react'
import { formatMw, formatSignedMw } from '../../utils/formatters'
import type { ForecastLevelAccuracy } from '../../types/analytics'

export interface ForecastLevelPanelProps {
  levels: ForecastLevelAccuracy[]
}

const bandLabel = ({ lower_mw, upper_mw }: ForecastLevelAccuracy): string =>
  upper_mw === null ? `≥ ${lower_mw / 1000} GW` : `${lower_mw / 1000}–${upper_mw / 1000} GW`

export const ForecastLevelPanel: React.FC<ForecastLevelPanelProps> = ({ levels }) => {
  return (
    <div className="panel">
      <h2>Error by Forecast Wind Level</h2>
      <p className="panel-subtitle">
        Grouped by the forecast, which is known when buying. Read the row for tomorrow's forecast to
        size the buffer.
      </p>
      <table className="mini-table">
        <thead>
          <tr>
            <th>Forecast</th>
            <th>Hours</th>
            <th>MAE</th>
            <th>Bias</th>
            <th>P90 shortfall</th>
          </tr>
        </thead>
        <tbody>
          {levels.map((level) => (
            <tr key={level.lower_mw}>
              <td>{bandLabel(level)}</td>
              <td>{level.matched_periods}</td>
              <td>{formatMw(level.mae_mw)}</td>
              <td>{formatSignedMw(level.bias_mw)}</td>
              <td>{formatMw(level.p90_error_mw)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ForecastLevelPanel
