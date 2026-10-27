/**
 * Core domain types for Wind Analytics UK
 */

export interface Metrics {
  mae_mw: number | null
  rmse_mw: number | null
  bias_mw: number | null
  wape_percent: number | null
  matched_periods: number
}

export interface Coverage {
  expected_periods: number
  matched_periods: number
  missing_forecasts: number
  missing_actuals: number
}

export interface DailySummary extends Metrics, Coverage {
  date: string
}

export interface HalfHourPeriod {
  start_time: string
  forecast_mw: number | null
  actual_mw: number | null
  error_mw: number | null
  absolute_error_mw: number | null
  publication_time: string | null
}

export interface HourlyErrorBreakdown {
  hour: string
  average_absolute_error_mw: number
  matched_periods: number
}

export interface OverviewResponse {
  period: string
  cutoff_assumption: string
  metrics: Metrics
  coverage: Coverage
  daily: DailySummary[]
}

export interface DailyResponse {
  date: string
  cutoff_assumption: string
  metrics: Metrics
  coverage: Coverage
  periods: HalfHourPeriod[]
  largest_misses: HalfHourPeriod[]
  hourly_error_breakdown: HourlyErrorBreakdown[]
}
