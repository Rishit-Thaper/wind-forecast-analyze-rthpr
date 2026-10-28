import React, { useState } from 'react'
import { Wind, RefreshCw, BarChart3, CalendarDays } from 'lucide-react'
import { useDailyQuery, useOverviewQuery } from './hooks/useAnalytics'
import Overview from './pages/Overview'
import DailyDetail from './pages/DailyDetail'
import StatusMessage from './components/StatusMessage'
import { OverviewSkeleton, DailyDetailSkeleton } from './components/skeletons'

const DEFAULT_DATE = '2026-01-15'

export const App: React.FC = () => {
  const [page, setPage] = useState<'overview' | 'daily'>('overview')
  const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_DATE)

  // TanStack Query for Overview
  const overviewQuery = useOverviewQuery()

  // TanStack Query for Daily Detail (cached per date!)
  const dailyQuery = useDailyQuery(selectedDate)

  const handleOpenDetail = () => {
    setPage('daily')
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
  }

  const handleBackToOverview = () => {
    setPage('overview')
  }

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
      {/* Top Navigation Bar */}
      <header className="topbar">
        <div className="brand" onClick={handleBackToOverview} role="button" tabIndex={0}>
          <div className="brand-mark" aria-hidden="true">
            <Wind size={20} />
          </div>
          <div className="brand-text">
            <strong>Wind Analytics</strong>
            <span>UK National Generation Outturn</span>
          </div>
        </div>

        <nav className="nav-tabs" aria-label="Primary navigation">
          <button
            type="button"
            className={`nav-tab ${page === 'overview' ? 'active' : ''}`}
            onClick={handleBackToOverview}
          >
            <BarChart3 size={15} />
            <span>Monthly Overview</span>
          </button>
          <button
            type="button"
            className={`nav-tab ${page === 'daily' ? 'active' : ''}`}
            onClick={handleOpenDetail}
          >
            <CalendarDays size={15} />
            <span>Daily Analysis</span>
          </button>
        </nav>

        <div className="topbar-actions">
          <button
            type="button"
            className="refresh-button"
            onClick={handleManualRefresh}
            title="Refresh current data"
            disabled={isCurrentLoading}
          >
            <RefreshCw size={14} className={isCurrentLoading ? 'spinning' : ''} />
            <span className="refresh-label">Refresh</span>
          </button>
          <span className="period-badge">January 2026</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content">
        {/* Error Banner */}
        {currentError && (
          <StatusMessage
            error={currentError.message}
            onRetry={handleManualRefresh}
          />
        )}

        {/* Content with Skeletons */}
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
                <p>The interface remains available. Please verify network access to Elexon BMRS or try again.</p>
                <button type="button" className="button primary" onClick={() => overviewQuery.refetch()}>
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
                <button type="button" className="button primary" onClick={() => dailyQuery.refetch()}>
                  Retry Date
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Professional Footer */}
      <footer className="footer">
        <div className="footer-content">
          <span>Wind Analytics · Official data sourced from Elexon BMRS WINDFOR and FUELHH streams</span>
          <span className="footer-note">All timestamps normalized to UTC · Metrics calculated over matched pairs only</span>
        </div>
      </footer>
    </div>
  )
}

export default App
