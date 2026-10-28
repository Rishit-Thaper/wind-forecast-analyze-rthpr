import React, { useMemo, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { GenerationChart } from '../components/Charts'
import MetricCard from '../components/MetricCard'
import type { DailyResponse } from '../types/analytics'

const formatMw = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value).toLocaleString()} MW`
}

const formatDateTitle = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`))
}

interface DailyDetailProps {
  data: DailyResponse
  onDate: (date: string) => void
  onBack: () => void
}

type SortField = 'start_time' | 'forecast_mw' | 'actual_mw' | 'error_mw' | 'absolute_error_mw'

export const DailyDetail: React.FC<DailyDetailProps> = ({ data, onDate, onBack }) => {
  const [sort, setSort] = useState<{ field: SortField; asc: boolean }>({
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

  // Next / Previous day calculations
  const currentDate = new Date(`${data.date}T00:00:00Z`)
  const prevDate = new Date(currentDate)
  prevDate.setUTCDate(prevDate.getUTCDate() - 1)
  const prevIso = prevDate.toISOString().slice(0, 10)

  const nextDate = new Date(currentDate)
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  const nextIso = nextDate.toISOString().slice(0, 10)

  const isMinDate = data.date === '2026-01-01'
  const isMaxDate = data.date === '2026-01-31'

  const renderSortIndicator = (field: SortField) => {
    if (sort.field !== field) return <span className="sort-indicator neutral">↕</span>
    return <span className="sort-indicator active">{sort.asc ? '▲' : '▼'}</span>
  }

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
          <h1>{formatDateTitle(data.date)}</h1>
          <p className="subtitle">
            {data.coverage.matched_periods} of {data.coverage.expected_periods} delivery periods matched · All timestamps UTC
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
            min="2026-01-01"
            max="2026-01-31"
            value={data.date}
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

      {/* KPI Cards */}
      <section className="metrics-grid compact">
        <MetricCard
          label="Daily MAE"
          value={formatMw(data.metrics.mae_mw)}
          detail={`${data.metrics.matched_periods} matched delivery periods`}
        />
        <MetricCard
          label="Daily Forecast Bias"
          value={data.metrics.bias_mw !== null ? `${data.metrics.bias_mw >= 0 ? '+' : ''}${formatMw(data.metrics.bias_mw)}` : '—'}
          detail={
            data.metrics.bias_mw === null
              ? 'Unavailable'
              : data.metrics.bias_mw >= 0
              ? 'Over-forecasting outturn'
              : 'Under-forecasting outturn'
          }
          tone={data.metrics.bias_mw === null ? '' : data.metrics.bias_mw >= 0 ? 'positive' : 'negative'}
        />
        <MetricCard
          label="WAPE"
          value={data.metrics.wape_percent === null ? '—' : `${data.metrics.wape_percent.toFixed(1)}%`}
          detail="Total absolute error / total generation"
        />
      </section>

      {/* Generation Chart Panel */}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Forecast vs Actual Generation</h2>
            <p>Half-hourly national wind generation outturn compared to day-ahead forecasts.</p>
          </div>
          <span className="utc-badge">UTC</span>
        </div>
        <GenerationChart data={data.periods} />
      </section>

      {/* Largest Misses & Hourly Error Breakdown */}
      <section className="detail-grid">
        <div className="panel">
          <h2>Largest Absolute Misses</h2>
          {data.largest_misses.length > 0 ? (
            <ul className="misses-list">
              {data.largest_misses.map((row) => (
                <li key={row.start_time}>
                  <div className="miss-time">
                    <strong>{row.start_time.slice(11, 16)} UTC</strong>
                    <span>Actual: {formatMw(row.actual_mw)}</span>
                  </div>
                  <div className="miss-forecast">
                    <span>Forecast: {formatMw(row.forecast_mw)}</span>
                  </div>
                  <div className="miss-error">
                    <strong className="error-abs">{formatMw(row.absolute_error_mw)}</strong>
                    <small className={row.error_mw !== null && row.error_mw >= 0 ? 'text-positive' : 'text-negative'}>
                      {row.error_mw !== null && row.error_mw >= 0 ? '+' : ''}
                      {formatMw(row.error_mw)}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">No matched periods available for this date.</div>
          )}
        </div>

        <div className="panel">
          <h2>Hourly Error Distribution</h2>
          {data.hourly_error_breakdown.length > 0 ? (
            <div className="hour-grid">
              {data.hourly_error_breakdown.map((row) => (
                <div key={row.hour} className="hour-card">
                  <span className="hour-time">{row.hour}</span>
                  <strong className="hour-value">{Math.round(row.average_absolute_error_mw).toLocaleString()} MW</strong>
                  <span className="hour-meta">{row.matched_periods} periods</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No hourly data available for this date.</div>
          )}
        </div>
      </section>

      {/* Half-hourly comparison table */}
      <section className="panel table-panel">
        <div className="panel-header">
          <div>
            <h2>Half-Hourly Comparison Table</h2>
            <p>Full breakdown of all 48 settlement periods. Missing values are excluded from metrics.</p>
          </div>
          <span className="coverage-badge">
            Missing: {data.coverage.missing_forecasts} forecasts · {data.coverage.missing_actuals} actuals
          </span>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  <button type="button" className="th-sort-button" onClick={() => handleSortChange('start_time')}>
                    Delivery Time {renderSortIndicator('start_time')}
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-button" onClick={() => handleSortChange('forecast_mw')}>
                    Forecast {renderSortIndicator('forecast_mw')}
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-button" onClick={() => handleSortChange('actual_mw')}>
                    Actual Outturn {renderSortIndicator('actual_mw')}
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-button" onClick={() => handleSortChange('error_mw')}>
                    Error (Bias) {renderSortIndicator('error_mw')}
                  </button>
                </th>
                <th>
                  <button type="button" className="th-sort-button" onClick={() => handleSortChange('absolute_error_mw')}>
                    Absolute Error {renderSortIndicator('absolute_error_mw')}
                  </button>
                </th>
                <th>Forecast Published</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => {
                const isOver = row.error_mw !== null && row.error_mw > 0
                const isUnder = row.error_mw !== null && row.error_mw < 0

                return (
                  <tr key={row.start_time}>
                    <td className="font-medium">{row.start_time.slice(11, 16)} UTC</td>
                    <td>{formatMw(row.forecast_mw)}</td>
                    <td>{formatMw(row.actual_mw)}</td>
                    <td>
                      {row.error_mw === null ? (
                        <span className="text-muted">—</span>
                      ) : (
                        <span className={`status-pill ${isOver ? 'pill-positive' : isUnder ? 'pill-negative' : 'pill-neutral'}`}>
                          {row.error_mw > 0 ? '+' : ''}
                          {formatMw(row.error_mw)}
                        </span>
                      )}
                    </td>
                    <td>{formatMw(row.absolute_error_mw)}</td>
                    <td className="text-muted font-mono">
                      {row.publication_time
                        ? row.publication_time.replace('T', ' ').replace('Z', ' UTC')
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export default DailyDetail
