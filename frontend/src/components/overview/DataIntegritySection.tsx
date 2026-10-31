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
            <dt>Expected delivery hours</dt>
            <dd>{coverage.expected_periods.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Matched forecast & actual hours</dt>
            <dd>{coverage.matched_periods.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Hours missing an eligible WINDFOR forecast</dt>
            <dd>{coverage.missing_forecasts}</dd>
          </div>
          <div>
            <dt>Hours missing FUELHH wind outturn</dt>
            <dd>{coverage.missing_actuals}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <h2>Decision Cutoff & Methodology</h2>
        <p className="body-copy">{cutoffAssumption}</p>
        <p className="muted">
          For each delivery hour, the latest WINDFOR publication at or before the cutoff on the
          previous day is used. WINDFOR is hourly, so each hour's actual is the mean of its two
          half-hourly FUELHH settlement periods. Error is forecast minus actual, so a positive error
          means actual wind fell short of the forecast. Timestamps are normalized to UTC before
          pairing.
        </p>
      </div>
    </section>
  )
}

export default DataIntegritySection
