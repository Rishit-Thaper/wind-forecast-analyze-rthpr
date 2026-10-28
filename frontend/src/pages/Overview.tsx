import React from 'react'
import {
  OverviewHeader,
  OverviewMetrics,
  OverviewChartPanel,
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
  const { metrics, coverage, daily, cutoff_assumption } = data

  return (
    <>
      <OverviewHeader
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

      <DataIntegritySection
        coverage={coverage}
        cutoffAssumption={cutoff_assumption}
      />
    </>
  )
}

export default Overview
