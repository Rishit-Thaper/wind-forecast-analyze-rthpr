import React from 'react'
import { GenerationChart } from '../Charts'
import type { HalfHourPeriod } from '../../types/analytics'

export interface DailyChartPanelProps {
  periods: HalfHourPeriod[]
}

export const DailyChartPanel: React.FC<DailyChartPanelProps> = ({ periods }) => {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Forecast vs Actual Generation</h2>
          <p>Half-hourly national wind generation outturn compared to day-ahead forecasts.</p>
        </div>
        <span className="utc-badge">UTC</span>
      </div>
      <GenerationChart data={periods} />
    </section>
  )
}

export default DailyChartPanel
