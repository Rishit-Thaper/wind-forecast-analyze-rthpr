import React from 'react'
import { ArrowRight, Calendar } from 'lucide-react'
import { formatShortDate } from '../../utils/formatters'
import { MIN_DATE, MAX_DATE } from '../../constants/analytics'

export interface OverviewHeaderProps {
  cutoffTimeUtc: string
  selectedDate: string
  onSelectDate: (date: string) => void
  onOpenDetail: () => void
}

export const OverviewHeader: React.FC<OverviewHeaderProps> = ({
  cutoffTimeUtc,
  selectedDate,
  onSelectDate,
  onOpenDetail,
}) => {
  const selectedDateFormatted = formatShortDate(selectedDate)

  return (
    <section className="section-heading">
      <div>
        <span className="eyebrow">Monthly Summary</span>
        <h1>January 2026 Day-Ahead Decisions</h1>
        <p className="subtitle">
          The wind forecast available at the {cutoffTimeUtc} UTC gate closure, compared with actual
          outturn for delivery days 2 Jan – 1 Feb 2026.
        </p>
      </div>

      <div className="date-picker-group">
        <label htmlFor="overview-date-input" className="date-control-label">
          <Calendar size={15} className="date-icon" />
          <span>Delivery date:</span>
        </label>
        <input
          id="overview-date-input"
          aria-label="Select a delivery date"
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
