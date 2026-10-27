import { describe, expect, it, vi } from 'vitest'
import { getDaily, getOverview } from './api'

describe('API client', () => {
  it('encodes a requested daily date', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ date: '2026-01-15' }),
    })
    const res = await getDaily('2026-01-15')
    expect(fetch).toHaveBeenCalledWith('/api/daily?date=2026-01-15')
    expect(res.date).toBe('2026-01-15')
  })

  it('fetches overview data from /api/overview', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ period: '2026-01-01 to 2026-01-31' }),
    })
    const res = await getOverview()
    expect(fetch).toHaveBeenCalledWith('/api/overview')
    expect(res.period).toBe('2026-01-01 to 2026-01-31')
  })

  it('throws informative error when response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'Elexon service unavailable' }),
    })
    await expect(getOverview()).rejects.toThrow('Elexon service unavailable')
  })
})
