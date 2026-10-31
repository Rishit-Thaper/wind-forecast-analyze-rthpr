import React from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DailySummary, DeliveryHour } from '../types/analytics'
import { formatShortDate } from '../utils/formatters'

const formatMw = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value).toLocaleString()} MW`
}

interface DailyMaeChartProps {
  data: DailySummary[]
  onSelect: (date: string) => void
  selectedDate?: string
}

export const DailyMaeChart: React.FC<DailyMaeChartProps> = ({ data, onSelect, selectedDate }) => {
  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={290}>
        <LineChart
          data={data}
          margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
          onClick={(event) => {
            if (event?.activePayload?.[0]?.payload?.date) {
              onSelect(event.activePayload[0].payload.date)
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(date: string) =>
              date.endsWith('-01') ? formatShortDate(date) : String(Number(date.slice(8)))
            }
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={{ stroke: '#e2e8f0' }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tickFormatter={(value: number) => `${Math.round(value).toLocaleString()}`}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={58}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as DailySummary
                const isSelected = item.date === selectedDate
                return (
                  <div className="custom-tooltip">
                    <p className="tooltip-title">
                      {new Intl.DateTimeFormat('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }).format(new Date(`${item.date}T00:00:00Z`))}
                    </p>
                    <div className="tooltip-row">
                      <span>Mean Absolute Error:</span>
                      <strong>{formatMw(item.mae_mw)}</strong>
                    </div>
                    <div className="tooltip-row">
                      <span>Matched Hours:</span>
                      <span>{item.matched_periods} / {item.expected_periods}</span>
                    </div>
                    <p className="tooltip-hint">{isSelected ? 'Currently selected' : 'Click point to inspect'}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="mae_mw"
            name="Daily MAE"
            stroke="#2563eb"
            strokeWidth={2.2}
            dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#1d4ed8' }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="chart-hint">Click any day point on the line to jump to its hourly breakdown.</p>
    </div>
  )
}

interface GenerationChartProps {
  data: DeliveryHour[]
}

export const GenerationChart: React.FC<GenerationChartProps> = ({ data }) => {
  const chartData = data.map((row) => ({
    ...row,
    time: row.start_time.slice(11, 16),
  }))

  return (
    <div className="chart-box">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 12, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="time"
            interval={1}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={{ stroke: '#e2e8f0' }}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as DeliveryHour & { time: string }
                return (
                  <div className="custom-tooltip">
                    <p className="tooltip-title">Delivery Time: {item.time} UTC</p>
                    <div className="tooltip-row">
                      <span className="legend-indicator forecast-dot" />
                      <span>Forecast:</span>
                      <strong>{formatMw(item.forecast_mw)}</strong>
                    </div>
                    <div className="tooltip-row">
                      <span className="legend-indicator actual-dot" />
                      <span>Actual Outturn:</span>
                      <strong>{formatMw(item.actual_mw)}</strong>
                    </div>
                    {item.error_mw !== null && (
                      <div className="tooltip-row variance-row">
                        <span>Variance (Error):</span>
                        <strong className={item.error_mw >= 0 ? 'text-positive' : 'text-negative'}>
                          {item.error_mw >= 0 ? '+' : ''}{formatMw(item.error_mw)}
                        </strong>
                      </div>
                    )}
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: 12, fontSize: 13 }}
          />
          <Line
            connectNulls
            type="monotone"
            dataKey="forecast_mw"
            name="Day-Ahead Forecast"
            stroke="#2563eb"
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            connectNulls
            type="monotone"
            dataKey="actual_mw"
            name="Actual Generation"
            stroke="#059669"
            strokeWidth={2.2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
