import React from 'react'
import type { Coverage } from '../../types/analytics'

export interface DataIntegritySectionProps {
  coverage: Coverage
  cutoffAssumption: string
}

export const DataIntegritySection: React.FC<DataIntegritySectionProps> = ({
  coverage,
  cutoffAssumption,
}) => {
  return (
    <section className="coverage-grid">
      <div className="panel">
        <h2>Data Integrity & Coverage</h2>
        <dl className="coverage-list">
          <div>
            <dt>Expected half-hour periods</dt>
            <dd>{coverage.expected_periods.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Matched forecast & actual pairs</dt>
            <dd>{coverage.matched_periods.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Missing eligible WINDFOR forecasts</dt>
            <dd>{coverage.missing_forecasts}</dd>
          </div>
          <div>
            <dt>Missing FUELHH wind actuals</dt>
            <dd>{coverage.missing_actuals}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <h2>Decision Cutoff & Methodology</h2>
        <p className="body-copy">{cutoffAssumption}</p>
        <p className="muted">
          For each delivery half-hour, the latest WINDFOR publication at or before 12:00 UTC on the previous day is selected. Timestamps are strictly normalized to UTC before pairing.
        </p>
      </div>
    </section>
  )
}

export default DataIntegritySection
