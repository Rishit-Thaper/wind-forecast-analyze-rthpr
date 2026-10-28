import React from 'react'
import { DailyMaeChart } from '../Charts'
import { formatShortDate } from '../../utils/formatters'
import type { DailySummary } from '../../types/analytics'

export interface OverviewChartPanelProps {
  daily: DailySummary[]
  selectedDate: string
  onSelectDate: (date: string) => void
  onOpenDetail: () => void
}

export const OverviewChartPanel: React.FC<OverviewChartPanelProps> = ({
  daily,
  selectedDate,
  onSelectDate,
  onOpenDetail,
}) => {
  const hasMatchedData = daily.some((day) => day.mae_mw !== null)
  const selectedDateFormatted = formatShortDate(selectedDate)

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Daily Forecast Accuracy</h2>
          <p>Mean absolute error for each day of the delivery month.</p>
        </div>
        <button type="button" className="button secondary" onClick={onOpenDetail}>
          Open {selectedDateFormatted} details →
        </button>
      </div>

      {hasMatchedData ? (
        <DailyMaeChart data={daily} onSelect={onSelectDate} selectedDate={selectedDate} />
      ) : (
        <div className="empty-state">No matched periods are available to chart.</div>
      )}
    </section>
  )
}

export default OverviewChartPanel
