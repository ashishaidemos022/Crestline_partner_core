import { format, formatDistanceToNowStrict, differenceInDays, parseISO } from 'date-fns'

export const fmtUSD = (n: number | string | null | undefined, opts: Intl.NumberFormatOptions = {}) => {
  if (n === null || n === undefined || n === '') return '—'
  const v = typeof n === 'string' ? Number(n) : n
  if (Number.isNaN(v)) return '—'
  return v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    ...opts,
  })
}

export const fmtUSDcents = (n: number | string | null | undefined) =>
  fmtUSD(n, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

export const fmtInt = (n: number | string | null | undefined) => {
  if (n === null || n === undefined) return '—'
  const v = typeof n === 'string' ? Number(n) : n
  if (Number.isNaN(v)) return '—'
  return v.toLocaleString('en-US')
}

export const fmtDate = (iso: string | null | undefined, pattern = 'MMM d, yyyy') => {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), pattern)
  } catch {
    return iso
  }
}

export const fmtDateShort = (iso: string | null | undefined) => fmtDate(iso, 'MMM d')

export const fmtTime = (iso: string | null | undefined) => fmtDate(iso, 'h:mm a')

export const fmtRel = (iso: string | null | undefined) => {
  if (!iso) return '—'
  try {
    return `${formatDistanceToNowStrict(parseISO(iso))} ago`
  } catch {
    return iso
  }
}

export const daysBetween = (isoA: string | null | undefined, isoB: string | null | undefined) => {
  if (!isoA || !isoB) return 0
  try {
    return differenceInDays(parseISO(isoB), parseISO(isoA))
  } catch {
    return 0
  }
}

export const daysUntil = (iso: string | null | undefined) => {
  if (!iso) return 0
  try {
    return differenceInDays(parseISO(iso), new Date())
  } catch {
    return 0
  }
}

export const initials = (first?: string | null, last?: string | null) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'

export const fmtPhone = (raw: string | null | undefined) => {
  if (!raw) return '—'
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return raw
}
