import React from 'react'
import { formatMw, formatUtcDateTime } from '../../utils/formatters'
import type { HalfHourPeriod, Coverage } from '../../types/analytics'
import type { SortConfig, SortField } from '../../types/ui'

export interface DailyComparisonTableProps {
  rows: HalfHourPeriod[]
  coverage: Coverage
  sort: SortConfig
  onSortChange: (field: SortField) => void
}

export const DailyComparisonTable: React.FC<DailyComparisonTableProps> = ({
  rows,
  coverage,
  sort,
  onSortChange,
}) => {
  const renderSortIndicator = (field: SortField) => {
    if (sort.field !== field) {
      return <span className="sort-indicator neutral">↕</span>
    }
    return <span className="sort-indicator active">{sort.asc ? '▲' : '▼'}</span>
  }

  return (
    <section className="panel table-panel">
      <div className="panel-header">
        <div>
          <h2>Half-Hourly Comparison Table</h2>
          <p>
            Full breakdown of all 48 settlement periods. Missing values are excluded from metrics.
          </p>
        </div>
        <span className="coverage-badge">
          Missing: {coverage.missing_forecasts} forecasts · {coverage.missing_actuals} actuals
        </span>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>
                <button
                  type="button"
                  className="th-sort-button"
                  onClick={() => onSortChange('start_time')}
                >
                  Delivery Time {renderSortIndicator('start_time')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="th-sort-button"
                  onClick={() => onSortChange('forecast_mw')}
                >
                  Forecast {renderSortIndicator('forecast_mw')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="th-sort-button"
                  onClick={() => onSortChange('actual_mw')}
                >
                  Actual Outturn {renderSortIndicator('actual_mw')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="th-sort-button"
                  onClick={() => onSortChange('error_mw')}
                >
                  Error (Bias) {renderSortIndicator('error_mw')}
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="th-sort-button"
                  onClick={() => onSortChange('absolute_error_mw')}
                >
                  Absolute Error {renderSortIndicator('absolute_error_mw')}
                </button>
              </th>
              <th>Forecast Published</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
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
                      <span
                        className={`status-pill ${
                          isOver ? 'pill-positive' : isUnder ? 'pill-negative' : 'pill-neutral'
                        }`}
                      >
                        {row.error_mw > 0 ? '+' : ''}
                        {formatMw(row.error_mw)}
                      </span>
                    )}
                  </td>
                  <td>{formatMw(row.absolute_error_mw)}</td>
                  <td className="text-muted font-mono">
                    {formatUtcDateTime(row.publication_time)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default DailyComparisonTable
