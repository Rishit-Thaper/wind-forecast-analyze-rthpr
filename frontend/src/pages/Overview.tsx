import React from 'react'
import { ArrowRight, Calendar } from 'lucide-react'
import { DailyMaeChart } from '../components/Charts'
import MetricCard from '../components/MetricCard'
import type { OverviewResponse } from '../types/analytics'

const formatNumber = (value: number | null | undefined, suffix = ' MW'): string => {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value).toLocaleString()}${suffix}`
}

export interface OverviewProps {
  data: OverviewResponse
  selectedDate: string
  onSelectDate: (date: string) => void
  onOpenDetail: () => void
}

export const Overview: React.FC<OverviewProps> = ({
  data,
  selectedDate,
  onSelectDate,
  onOpenDetail,
}) => {
  const { metrics, coverage, daily } = data
  const hasMatchedData = daily.some((day) => day.mae_mw !== null)

  const selectedDateFormatted = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${selectedDate}T00:00:00Z`))

  return (
    <>
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
            min="2026-01-01"
            max="2026-01-31"
            value={selectedDate}
            onChange={(e) => onSelectDate(e.target.value)}
            className="date-input"
          />
          <button
            type="button"
            className="button primary"
            onClick={onOpenDetail}
          >
            <span>View {selectedDateFormatted}</span>
            <ArrowRight size={15} style={{ marginLeft: 6 }} />
          </button>
        </div>
      </section>

      {/* KPI Metrics */}
      <section className="metrics-grid" aria-label="Monthly forecast performance metrics">
        <MetricCard
          label="Mean Absolute Error (MAE)"
          value={formatNumber(metrics.mae_mw)}
          detail={`${metrics.matched_periods.toLocaleString()} matched half-hour periods`}
        />
        <MetricCard
          label="Root Mean Square Error (RMSE)"
          value={formatNumber(metrics.rmse_mw)}
          detail="Penalizes large extreme deviations"
        />
        <MetricCard
          label="Forecast Bias"
          value={metrics.bias_mw !== null ? `${metrics.bias_mw >= 0 ? '+' : ''}${formatNumber(metrics.bias_mw)}` : '—'}
          detail={
            metrics.bias_mw === null
              ? 'Unavailable'
              : metrics.bias_mw >= 0
              ? 'Over-forecasting on average'
              : 'Under-forecasting on average'
          }
          tone={metrics.bias_mw === null ? '' : metrics.bias_mw >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          label="Matched Delivery Periods"
          value={`${coverage.matched_periods.toLocaleString()} / ${coverage.expected_periods.toLocaleString()}`}
          detail={`${((coverage.matched_periods / coverage.expected_periods) * 100).toFixed(1)}% complete January coverage`}
        />
      </section>

      {/* Daily MAE Chart */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Daily Forecast Accuracy</h2>
            <p>Mean absolute error for each day of the delivery month.</p>
          </div>
          <button
            type="button"
            className="button secondary"
            onClick={onOpenDetail}
          >
            Open {selectedDateFormatted} details →
          </button>
        </div>

        {hasMatchedData ? (
          <DailyMaeChart data={daily} onSelect={onSelectDate} selectedDate={selectedDate} />
        ) : (
          <div className="empty-state">No matched periods are available to chart.</div>
        )}
      </section>

      {/* Coverage and Decision Context */}
      <section className="coverage-grid">
        <div className="panel">
          <h2>Data Integrity & Coverage</h2>
          <dl className="coverage-list">
            <div>
              <dt>Expected half-hour periods</dt>
              <dd>{coverage.expected_periods.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Matched forecast & actual pairs</dt>
              <dd>{coverage.matched_periods.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Missing eligible WINDFOR forecasts</dt>
              <dd>{coverage.missing_forecasts}</dd>
            </div>
            <div>
              <dt>Missing FUELHH wind actuals</dt>
              <dd>{coverage.missing_actuals}</dd>
            </div>
          </dl>
        </div>

        <div className="panel">
          <h2>Decision Cutoff & Methodology</h2>
          <p className="body-copy">{data.cutoff_assumption}</p>
          <p className="muted">
            For each delivery half-hour, the latest WINDFOR publication at or before 12:00 UTC on the previous day is selected. Timestamps are strictly normalized to UTC before pairing.
          </p>
        </div>
      </section>
    </>
  )
}

export default Overview
