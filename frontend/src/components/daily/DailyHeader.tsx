import React from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDateTitle } from '../../utils/formatters'
import { MIN_DATE, MAX_DATE } from '../../constants/analytics'

export interface DailyHeaderProps {
  date: string
  matchedPeriods: number
  expectedPeriods: number
  prevIso: string
  nextIso: string
  isMinDate: boolean
  isMaxDate: boolean
  onDate: (date: string) => void
  onBack: () => void
}

export const DailyHeader: React.FC<DailyHeaderProps> = ({
  date,
  matchedPeriods,
  expectedPeriods,
  prevIso,
  nextIso,
  isMinDate,
  isMaxDate,
  onDate,
  onBack,
}) => {
  return (
    <>
      <div className="back-nav">
        <button type="button" className="back-link" onClick={onBack}>
          <ArrowLeft size={14} />
          <span>Back to Monthly Overview</span>
        </button>
      </div>

      <section className="section-heading">
        <div>
          <span className="eyebrow">Daily Analysis</span>
          <h1>{formatDateTitle(date)}</h1>
          <p className="subtitle">
            {matchedPeriods} of {expectedPeriods} delivery periods matched · All timestamps UTC
          </p>
        </div>

        <div className="day-navigation">
          <button
            type="button"
            aria-label="Previous day"
            className="button secondary icon-button"
            disabled={isMinDate}
            onClick={() => onDate(prevIso)}
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <input
            aria-label="Select date"
            type="date"
            min={MIN_DATE}
            max={MAX_DATE}
            value={date}
            onChange={(e) => onDate(e.target.value)}
            className="date-input"
          />

          <button
            type="button"
            aria-label="Next day"
            className="button secondary icon-button"
            disabled={isMaxDate}
            onClick={() => onDate(nextIso)}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </>
  )
}

export default DailyHeader
