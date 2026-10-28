/**
 * Number and string formatting utilities for Wind Analytics
 */

export const formatMw = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value).toLocaleString()} MW`
}

export const formatNumber = (value: number | null | undefined, suffix = ' MW'): string => {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value).toLocaleString()}${suffix}`
}

export const formatDateTitle = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`))
}

export const formatShortDate = (dateStr: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${dateStr}T00:00:00Z`))
}

export const formatUtcDateTime = (dateTimeStr: string | null): string => {
  if (!dateTimeStr) return '—'
  return dateTimeStr.replace('T', ' ').replace('Z', ' UTC')
}
