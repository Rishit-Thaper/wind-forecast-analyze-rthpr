import React, { useMemo, useState } from 'react'
import {
  DailyHeader,
  DailyMetrics,
  DailyChartPanel,
  DailyMissesList,
  HourlyErrorDistribution,
  DailyComparisonTable,
} from '../components/daily'
import { getAdjacentDates } from '../utils/date'
import type { DailyDetailProps, SortConfig, SortField } from '../types/ui'

export const DailyDetail: React.FC<DailyDetailProps> = ({ data, onDate, onBack }) => {
  const [sort, setSort] = useState<SortConfig>({
    field: 'start_time',
    asc: true,
  })

  const sortedRows = useMemo(() => {
    return [...data.periods].sort((a, b) => {
      const aVal = a[sort.field] ?? -Infinity
      const bVal = b[sort.field] ?? -Infinity
      if (aVal > bVal) return sort.asc ? 1 : -1
      if (aVal < bVal) return sort.asc ? -1 : 1
      return 0
    })
  }, [data.periods, sort])

  const handleSortChange = (field: SortField) => {
    setSort((current) => ({
      field,
      asc: current.field === field ? !current.asc : true,
    }))
  }

  const { prevIso, nextIso, isMinDate, isMaxDate } = getAdjacentDates(data.date)

  return (
    <>
      <DailyHeader
        date={data.date}
        matchedPeriods={data.coverage.matched_periods}
        expectedPeriods={data.coverage.expected_periods}
        prevIso={prevIso}
        nextIso={nextIso}
        isMinDate={isMinDate}
        isMaxDate={isMaxDate}
        onDate={onDate}
        onBack={onBack}
      />

      <DailyMetrics metrics={data.metrics} />

      <DailyChartPanel periods={data.periods} />

      <section className="detail-grid">
        <DailyMissesList misses={data.largest_misses} />
        <HourlyErrorDistribution breakdown={data.hourly_error_breakdown} />
      </section>

      <DailyComparisonTable
        rows={sortedRows}
        coverage={data.coverage}
        sort={sort}
        onSortChange={handleSortChange}
      />
    </>
  )
}

export default DailyDetail
