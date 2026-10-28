import React from 'react'
import type { HourlyErrorBreakdown } from '../../types/analytics'

export interface HourlyErrorDistributionProps {
  breakdown: HourlyErrorBreakdown[]
}

export const HourlyErrorDistribution: React.FC<HourlyErrorDistributionProps> = ({
  breakdown,
}) => {
  return (
    <div className="panel">
      <h2>Hourly Error Distribution</h2>
      {breakdown.length > 0 ? (
        <div className="hour-grid">
          {breakdown.map((row) => (
            <div key={row.hour} className="hour-card">
              <span className="hour-time">{row.hour}</span>
              <strong className="hour-value">
                {Math.round(row.average_absolute_error_mw).toLocaleString()} MW
              </strong>
              <span className="hour-meta">{row.matched_periods} periods</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No hourly data available for this date.</div>
      )}
    </div>
  )
}

export default HourlyErrorDistribution
