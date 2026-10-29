import type { DailyResponse, OverviewResponse } from '../types/analytics'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(body.detail || 'Unable to load analytics data.')
  }
  return body as T
}

export const getOverview = (): Promise<OverviewResponse> => request<OverviewResponse>('/api/overview')

export const getDaily = (date: string): Promise<DailyResponse> =>
  request<DailyResponse>(`/api/daily?date=${encodeURIComponent(date)}`)

