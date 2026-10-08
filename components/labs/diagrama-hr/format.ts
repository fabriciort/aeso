import { formatNumber } from '@/lib/format'

/** Two significant figures below 1, whole numbers above 10 (pt-BR). */
export function fmtSolar(v: number): string {
  if (v >= 10) return formatNumber(Math.round(v), 0)
  if (v >= 1) return formatNumber(v, 1)
  const digits = Math.min(6, Math.ceil(-Math.log10(v)) + 1)
  return formatNumber(v, digits)
}

export const fmtL = (l: number) => `${fmtSolar(l)} L☉`
export const fmtR = (r: number) => `${fmtSolar(r >= 100 ? Math.round(r / 10) * 10 : r)} R☉`
export const fmtT = (t: number) => `${formatNumber(t >= 10000 ? Math.round(t / 100) * 100 : t, 0)} K`
