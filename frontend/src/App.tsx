import React, { useState } from 'react'
import { useDailyQuery, useOverviewQuery } from './hooks/useAnalytics'
import Overview from './pages/Overview'
import DailyDetail from './pages/DailyDetail'
import StatusMessage from './components/StatusMessage'
import { OverviewSkeleton, DailyDetailSkeleton } from './components/skeletons'
import { TopBar, Footer } from './components/layout'
import { DEFAULT_DATE } from './constants/analytics'
import type { AppPage } from './types/ui'

export const App: React.FC = () => {
  const [page, setPage] = useState<AppPage>('overview')
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_DATE)

  // TanStack Query for Overview and Daily Detail
  const overviewQuery = useOverviewQuery()
  const dailyQuery = useDailyQuery(selectedDate)

  const handleOpenDetail = () => setPage('daily')
  const handleSelectDate = (date: string) => setSelectedDate(date)
  const handleBackToOverview = () => setPage('overview')

  const handleManualRefresh = () => {
    if (page === 'overview') {
      overviewQuery.refetch()
    } else {
      dailyQuery.refetch()
    }
  }

  const isCurrentLoading = page === 'overview' ? overviewQuery.isLoading : dailyQuery.isLoading
  const currentError = page === 'overview' ? overviewQuery.error : dailyQuery.error

  return (
    <div className="app-shell">
      <TopBar
        page={page}
        isLoading={isCurrentLoading}
        onNavigate={setPage}
        onRefresh={handleManualRefresh}
      />

      <main id="main-content">
        {currentError && (
          <StatusMessage
            error={currentError.message}
            onRetry={handleManualRefresh}
          />
        )}

        {page === 'overview' && (
          <>
            {overviewQuery.isLoading && <OverviewSkeleton />}
            {overviewQuery.isSuccess && (
              <Overview
                data={overviewQuery.data}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                onOpenDetail={handleOpenDetail}
              />
            )}
            {overviewQuery.isError && !overviewQuery.isLoading && (
              <div className="empty-state full">
                <h3>Live Elexon results could not be loaded</h3>
                <p>
                  The interface remains available. Please verify network access to Elexon BMRS or
                  try again.
                </p>
                <button
                  type="button"
                  className="button primary"
                  onClick={() => overviewQuery.refetch()}
                >
                  Retry Loading
                </button>
              </div>
            )}
          </>
        )}

        {page === 'daily' && (
          <>
            {dailyQuery.isLoading && <DailyDetailSkeleton />}
            {dailyQuery.isSuccess && (
              <DailyDetail
                data={dailyQuery.data}
                onDate={handleSelectDate}
                onBack={handleBackToOverview}
              />
            )}
            {dailyQuery.isError && !dailyQuery.isLoading && (
              <div className="empty-state full">
                <h3>Daily analysis data unavailable</h3>
                <p>Could not fetch half-hourly generation records for {selectedDate}.</p>
                <button
                  type="button"
                  className="button primary"
                  onClick={() => dailyQuery.refetch()}
                >
                  Retry Date
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default App
