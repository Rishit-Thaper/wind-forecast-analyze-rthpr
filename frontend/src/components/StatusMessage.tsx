import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export interface StatusMessageProps {
  error: string | null
  onRetry?: () => void
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ error, onRetry }) => {
  if (!error) return null

  return (
    <div className="status-message" role="alert">
      <div className="status-icon-wrapper">
        <AlertCircle size={20} className="status-icon" />
      </div>
      <div className="status-content">
        <strong className="status-title">Live Elexon data could not be loaded</strong>
        <p className="status-body">{error}</p>
      </div>
      {onRetry && (
        <button type="button" className="button secondary retry-btn" onClick={onRetry}>
          <RotateCcw size={14} style={{ marginRight: 6 }} />
          Try again
        </button>
      )}
    </div>
  )
}

export default StatusMessage
