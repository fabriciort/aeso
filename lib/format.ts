import type { Measurement } from './astro/types'

const LY_PER_PC = 3.26156

const nf = (digits: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: 0 })

/** "8,6 Mpc · 28 milhões de anos-luz" */
export function formatDistance(d: Measurement): { primary: string; secondary?: string } {
  const unit = d.unit.toLowerCase()
  const factor = unit === 'mpc' ? 1e6 : unit === 'kpc' ? 1e3 : unit === 'pc' ? 1 : NaN
  const value = `${d.approximate ? '≈ ' : ''}${nf(d.value < 10 ? 2 : 1).format(d.value)} ${d.unit}`
  if (!Number.isFinite(factor)) return { primary: value }
  const ly = d.value * factor * LY_PER_PC
  return { primary: value, secondary: `${d.approximate ? '≈ ' : ''}${formatLightYears(ly)}` }
}

export function formatLightYears(ly: number): string {
  if (ly >= 1e9) return `${nf(1).format(ly / 1e9)} bilhões de anos-luz`
  if (ly >= 1e6) return `${nf(1).format(ly / 1e6)} milhões de anos-luz`
  if (ly >= 1e3) return `${nf(1).format(ly / 1e3)} mil anos-luz`
  return `${nf(ly < 10 ? 2 : 0).format(ly)} anos-luz`
}

export function formatAngle(arcmin: number): string {
  if (arcmin >= 60) return `${nf(1).format(arcmin / 60)}°`
  if (arcmin >= 1) return `${nf(1).format(arcmin)}′`
  return `${nf(1).format(arcmin * 60)}″`
}

export function formatBytes(bytes?: number): string {
  if (bytes === undefined) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let i = 0
  let v = bytes
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${nf(v < 10 && i > 0 ? 1 : 0).format(v)} ${units[i]}`
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatExposure(seconds?: number): string {
  if (seconds === undefined) return '—'
  if (seconds >= 3600) return `${nf(1).format(seconds / 3600)} h`
  if (seconds >= 60) return `${nf(0).format(seconds / 60)} min`
  return `${nf(1).format(seconds)} s`
}

export function formatNumber(n: number, digits = 2): string {
  return nf(digits).format(n)
}
