import type { DailyResponse, OverviewResponse } from './analytics'

export type AppPage = 'overview' | 'daily'

export type SortField =
  | 'start_time'
  | 'forecast_mw'
  | 'actual_mw'
  | 'error_mw'
  | 'absolute_error_mw'

export interface SortConfig {
  field: SortField
  asc: boolean
}

export interface DailyDetailProps {
  data: DailyResponse
  onDate: (date: string) => void
  onBack: () => void
}

export interface OverviewProps {
  data: OverviewResponse
  selectedDate: string
  onSelectDate: (date: string) => void
  onOpenDetail: () => void
}
