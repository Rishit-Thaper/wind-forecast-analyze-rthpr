import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh
      gcTime: 30 * 60 * 1000,    // 30 minutes in cache
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Only retry once on network error, don't spam if 422 or client error
        if (failureCount >= 1) return false
        if (error instanceof Error && error.message.includes('422')) return false
        return true
      },
    },
  },
})
