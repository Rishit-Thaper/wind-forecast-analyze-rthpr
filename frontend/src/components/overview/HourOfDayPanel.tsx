import React from 'react'
import { formatMw, formatSignedMw } from '../../utils/formatters'
import type { HourOfDayAccuracy } from '../../types/analytics'

export interface HourOfDayPanelProps {
  hours: HourOfDayAccuracy[]
}

export const HourOfDayPanel: React.FC<HourOfDayPanelProps> = ({ hours }) => {
  return (
    <section className="panel">
      <h2>Error by Delivery Hour</h2>
      <p className="panel-subtitle">
        Mean absolute error and bias for each hour of the delivery day, across all delivery days.
      </p>
      <div className="hour-grid wide">
        {hours.map((row) => (
          <div key={row.hour} className="hour-card">
            <span className="hour-time">{row.hour} UTC</span>
            <strong className="hour-value">{formatMw(row.mae_mw)}</strong>
            <span className="hour-meta">Bias {formatSignedMw(row.bias_mw)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HourOfDayPanel
