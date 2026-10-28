import { MIN_DATE, MAX_DATE } from '../constants/analytics'

export interface AdjacentDates {
  prevIso: string
  nextIso: string
  isMinDate: boolean
  isMaxDate: boolean
}

// calculates previous and next calendar dates along with bounds checking
export const getAdjacentDates = (dateStr: string): AdjacentDates => {
  const currentDate = new Date(`${dateStr}T00:00:00Z`)

  const prevDate = new Date(currentDate)
  prevDate.setUTCDate(prevDate.getUTCDate() - 1)
  const prevIso = prevDate.toISOString().slice(0, 10)

  const nextDate = new Date(currentDate)
  nextDate.setUTCDate(nextDate.getUTCDate() + 1)
  const nextIso = nextDate.toISOString().slice(0, 10)

  const isMinDate = dateStr <= MIN_DATE
  const isMaxDate = dateStr >= MAX_DATE

  return {
    prevIso,
    nextIso,
    isMinDate,
    isMaxDate,
  }
}
