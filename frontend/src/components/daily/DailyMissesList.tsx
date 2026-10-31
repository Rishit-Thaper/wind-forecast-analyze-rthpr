import React from 'react'
import { formatMw } from '../../utils/formatters'
import type { DeliveryHour } from '../../types/analytics'

export interface DailyMissesListProps {
  misses: DeliveryHour[]
}

export const DailyMissesList: React.FC<DailyMissesListProps> = ({ misses }) => {
  return (
    <div className="panel">
      <h2>Largest Absolute Misses</h2>
      {misses.length > 0 ? (
        <ul className="misses-list">
          {misses.map((row) => (
            <li key={row.start_time}>
              <div className="miss-time">
                <strong>{row.start_time.slice(11, 16)} UTC</strong>
                <span>Actual: {formatMw(row.actual_mw)}</span>
              </div>
              <div className="miss-forecast">
                <span>Forecast: {formatMw(row.forecast_mw)}</span>
              </div>
              <div className="miss-error">
                <strong className="error-abs">{formatMw(row.absolute_error_mw)}</strong>
                <small
                  className={
                    row.error_mw !== null && row.error_mw >= 0
                      ? 'text-positive'
                      : 'text-negative'
                  }
                >
                  {row.error_mw !== null && row.error_mw >= 0 ? '+' : ''}
                  {formatMw(row.error_mw)}
                </small>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">No matched periods available for this date.</div>
      )}
    </div>
  )
}

export default DailyMissesList
