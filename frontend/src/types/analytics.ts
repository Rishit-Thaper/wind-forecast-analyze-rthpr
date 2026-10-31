/**
 * Core domain types for Wind Analytics UK
 */

export interface Metrics {
  mae_mw: number | null
  rmse_mw: number | null
  bias_mw: number | null
  wape_percent: number | null
  /** Percentiles of signed error (forecast − actual); positive means actual wind fell short. */
  p10_error_mw: number | null
  p50_error_mw: number | null
  p90_error_mw: number | null
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

export interface DeliveryHour {
  start_time: string
  forecast_mw: number | null
  /** Mean of the hour's two half-hourly settlement periods. */
  actual_mw: number | null
  error_mw: number | null
  absolute_error_mw: number | null
  publication_time: string | null
  lead_time_hours: number | null
}

export interface HourOfDayAccuracy extends Metrics {
  hour: string
}

export interface ForecastLevelAccuracy extends Metrics {
  lower_mw: number
  upper_mw: number | null
}

export interface ForecastFreshness extends Metrics {
  as_of_utc: string
  before_cutoff: boolean
}

export interface OverviewResponse {
  period: string
  cutoff_time_utc: string
  cutoff_assumption: string
  metrics: Metrics
  coverage: Coverage
  daily: DailySummary[]
  error_by_hour: HourOfDayAccuracy[]
  error_by_forecast_level: ForecastLevelAccuracy[]
  forecast_freshness: ForecastFreshness[]
}

export interface DailyResponse {
  date: string
  decision_date: string
  cutoff_time_utc: string
  cutoff_assumption: string
  metrics: Metrics
  coverage: Coverage
  periods: DeliveryHour[]
  largest_misses: DeliveryHour[]
  forecast_publications: string[]
}
