import React from 'react'
import { GenerationChart } from '../Charts'
import type { DeliveryHour } from '../../types/analytics'

export interface DailyChartPanelProps {
  periods: DeliveryHour[]
}

export const DailyChartPanel: React.FC<DailyChartPanelProps> = ({ periods }) => {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Forecast vs Actual Generation</h2>
          <p>
            Hourly national wind outturn (mean of two settlement periods) against the forecast
            available at gate closure.
          </p>
        </div>
        <span className="utc-badge">UTC</span>
      </div>
      <GenerationChart data={periods} />
    </section>
  )
}

export default DailyChartPanel
