import React from 'react'
import {
  OverviewHeader,
  OverviewMetrics,
  OverviewChartPanel,
  ForecastLevelPanel,
  ForecastFreshnessPanel,
  HourOfDayPanel,
  DataIntegritySection,
} from '../components/overview'
import type { OverviewProps } from '../types/ui'
export type { OverviewProps }

export const Overview: React.FC<OverviewProps> = ({
  data,
  selectedDate,
  onSelectDate,
  onOpenDetail,
}) => {
  const {
    metrics,
    coverage,
    daily,
    cutoff_time_utc,
    cutoff_assumption,
    error_by_hour,
    error_by_forecast_level,
    forecast_freshness,
  } = data

  return (
    <>
      <OverviewHeader
        cutoffTimeUtc={cutoff_time_utc}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onOpenDetail={onOpenDetail}
      />

      <OverviewMetrics metrics={metrics} coverage={coverage} />

      <OverviewChartPanel
        daily={daily}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onOpenDetail={onOpenDetail}
      />

      <section className="detail-grid">
        <ForecastLevelPanel levels={error_by_forecast_level} />
        <ForecastFreshnessPanel freshness={forecast_freshness} cutoffTimeUtc={cutoff_time_utc} />
      </section>

      <HourOfDayPanel hours={error_by_hour} />

      <DataIntegritySection
        coverage={coverage}
        cutoffAssumption={cutoff_assumption}
      />
    </>
  )
}

export default Overview
