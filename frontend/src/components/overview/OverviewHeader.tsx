import React from 'react'
import { ArrowRight, Calendar } from 'lucide-react'
import { formatShortDate } from '../../utils/formatters'
import { MIN_DATE, MAX_DATE } from '../../constants/analytics'

export interface OverviewHeaderProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  onOpenDetail: () => void
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  selectedDate,
  onSelectDate,
  onOpenDetail,
}) => {
  const selectedDateFormatted = formatShortDate(selectedDate)

  return (
    <section className="section-heading">
      <div>
        <span className="eyebrow">Monthly Summary</span>
        <h1>January 2026 Forecast Performance</h1>
        <p className="subtitle">
          UK national wind generation day-ahead forecasts compared with half-hourly outturn.
        </p>
      </div>

      <div className="date-picker-group">
        <label htmlFor="overview-date-input" className="date-control-label">
          <Calendar size={15} className="date-icon" />
          <span>Target date:</span>
        </label>
        <input
          id="overview-date-input"
          aria-label="Select a January 2026 date"
          type="date"
          min={MIN_DATE}
          max={MAX_DATE}
          value={selectedDate}
          onChange={(e) => onSelectDate(e.target.value)}
          className="date-input"
        />
        <button type="button" className="button primary" onClick={onOpenDetail}>
          <span>View {selectedDateFormatted}</span>
          <ArrowRight size={15} style={{ marginLeft: 6 }} />
        </button>
      </div>
    </section>
  )
}

export default OverviewHeader
