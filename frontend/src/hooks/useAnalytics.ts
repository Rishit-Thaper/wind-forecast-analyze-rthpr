import { useQuery } from '@tanstack/react-query'
import { getDaily, getOverview } from '../services/api'
import type { DailyResponse, OverviewResponse } from '../types/analytics'

export const analyticsKeys = {
  all: ['analytics'] as const,
  overview: () => [...analyticsKeys.all, 'overview'] as const,
  daily: (date: string) => [...analyticsKeys.all, 'daily', date] as const,
}

export function useOverviewQuery() {
  return useQuery<OverviewResponse, Error>({
    queryKey: analyticsKeys.overview(),
    queryFn: getOverview,
  })
}

export function useDailyQuery(date: string) {
  return useQuery<DailyResponse, Error>({
    queryKey: analyticsKeys.daily(date),
    queryFn: () => getDaily(date),
    enabled: Boolean(date),
  })
}
