import React from 'react'
import { Wind, RefreshCw, BarChart3, CalendarDays } from 'lucide-react'
import type { AppPage } from '../../types/ui'

export interface TopBarProps {
  page: AppPage
  isLoading: boolean
  onNavigate: (page: AppPage) => void
  onRefresh: () => void
}

export const TopBar: React.FC<TopBarProps> = ({
  page,
  isLoading,
  onNavigate,
  onRefresh,
}) => {
  return (
    <header className="topbar">
      <div
        className="brand"
        onClick={() => onNavigate('overview')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onNavigate('overview')
        }}
        role="button"
        tabIndex={0}
      >
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
          onClick={() => onNavigate('overview')}
        >
          <BarChart3 size={15} />
          <span>Monthly Overview</span>
        </button>
        <button
          type="button"
          className={`nav-tab ${page === 'daily' ? 'active' : ''}`}
          onClick={() => onNavigate('daily')}
        >
          <CalendarDays size={15} />
          <span>Daily Analysis</span>
        </button>
      </nav>

      <div className="topbar-actions">
        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          title="Refresh current data"
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
          <span className="refresh-label">Refresh</span>
        </button>
        <span className="period-badge">Decisions: Jan 2026</span>
      </div>
    </header>
  )
}

export default TopBar
