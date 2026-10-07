// Coordinate parsing and formatting (ICRS, degrees).

export interface Coordinates {
  ra: number
  dec: number
}

const num = String.raw`[+-]?\d+(?:[.,]\d+)?`

function toNumber(s: string): number {
  return parseFloat(s.replace(',', '.'))
}

/**
 * Parses free-form coordinates. Accepts:
 *  - decimal degrees: "202.47 47.19", "202.47, +47.19", "ra=202.47 dec=47.19"
 *  - sexagesimal: "13 29 52.7 +47 11 43", "13:29:52.7 +47:11:43", "13h29m52.7s +47d11m43s"
 * Returns null when the input is not unambiguously a coordinate pair.
 */
export function parseCoordinates(input: string): Coordinates | null {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/ra\s*[=:]?\s*/g, '')
    .replace(/dec\s*[=:]?\s*/g, ' ')
    .replace(/[°º]/g, 'd')
    .replace(/[′']/g, 'm')
    .replace(/[″"]/g, 's')
    .trim()

  // Decimal pair
  const dec = new RegExp(`^(${num})\\s*[,;\\s]\\s*(${num})$`).exec(s)
  if (dec) {
    const ra = toNumber(dec[1])
    const de = toNumber(dec[2])
    if (ra >= 0 && ra < 360 && de >= -90 && de <= 90) return { ra, dec: de }
    return null
  }

  // Sexagesimal: split into RA and Dec at the sign of the declination, or in
  // two groups of three numbers.
  const sexa =
    /^(\d{1,2})\s*[h:\s]\s*(\d{1,2})\s*[m:\s]\s*(\d{1,2}(?:[.,]\d+)?)\s*s?\s*,?\s*([+-]?)(\d{1,2})\s*[d:\s]\s*(\d{1,2})\s*[m:\s]\s*(\d{1,2}(?:[.,]\d+)?)\s*s?$/.exec(
      s,
    )
  if (sexa) {
    const [, h, m, sec, sign, d, dm, ds] = sexa
    const ra = (toNumber(h) + toNumber(m) / 60 + toNumber(sec) / 3600) * 15
    const absDec = toNumber(d) + toNumber(dm) / 60 + toNumber(ds) / 3600
    const de = sign === '-' ? -absDec : absDec
    if (ra >= 0 && ra < 360 && absDec <= 90) return { ra, dec: de }
  }

  // Short sexagesimal with minutes only: "13h29m +47d11m"
  const short = /^(\d{1,2})\s*h\s*(\d{1,2}(?:[.,]\d+)?)\s*m?\s*,?\s*([+-]?)(\d{1,2})\s*d\s*(\d{1,2}(?:[.,]\d+)?)\s*m?$/.exec(s)
  if (short) {
    const [, h, m, sign, d, dm] = short
    const ra = (toNumber(h) + toNumber(m) / 60) * 15
    const absDec = toNumber(d) + toNumber(dm) / 60
    if (ra < 360 && absDec <= 90) return { ra, dec: sign === '-' ? -absDec : absDec }
  }

  return null
}

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, '0')
}

export function formatRA(ra: number): string {
  let totalSeconds = ((((ra % 360) + 360) % 360) / 15) * 3600
  totalSeconds = Math.round(totalSeconds * 100) / 100
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds - h * 3600) / 60)
  const s = totalSeconds - h * 3600 - m * 60
  return `${pad(h % 24)}h ${pad(m)}m ${s.toFixed(2).padStart(5, '0')}s`
}

export function formatDec(dec: number): string {
  const sign = dec < 0 ? '−' : '+'
  let totalSeconds = Math.round(Math.abs(dec) * 3600 * 10) / 10
  const d = Math.floor(totalSeconds / 3600)
  totalSeconds -= d * 3600
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds - m * 60
  return `${sign}${pad(d)}° ${pad(m)}′ ${s.toFixed(1).padStart(4, '0')}″`
}

/** Angular separation in degrees (haversine). */
export function separation(a: Coordinates, b: Coordinates): number {
  const r = Math.PI / 180
  const dRa = (b.ra - a.ra) * r
  const dDec = (b.dec - a.dec) * r
  const h =
    Math.sin(dDec / 2) ** 2 + Math.cos(a.dec * r) * Math.cos(b.dec * r) * Math.sin(dRa / 2) ** 2
  return (2 * Math.asin(Math.min(1, Math.sqrt(h)))) / r
}
