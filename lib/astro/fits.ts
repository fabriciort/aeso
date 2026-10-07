// Minimal FITS reader: headers of every HDU and scalar numeric columns of
// BINTABLE extensions (what TESS/Kepler light curve files use).
// Spec: https://fits.gsfc.nasa.gov/fits_standard.html

const BLOCK = 2880
const CARD = 80

export type HeaderValue = string | number | boolean | null
export type Header = Record<string, HeaderValue>

export interface Hdu {
  header: Header
  dataOffset: number
  dataLength: number
}

function parseValue(raw: string): HeaderValue {
  const v = raw.trim()
  if (v.startsWith("'")) {
    const m = /^'((?:[^']|'')*)'/.exec(v)
    return m ? m[1].replace(/''/g, "'").trimEnd() : v
  }
  const noComment = v.split('/')[0].trim()
  if (noComment === 'T') return true
  if (noComment === 'F') return false
  if (noComment === '') return null
  const n = Number(noComment.replace(/D/i, 'E'))
  return Number.isFinite(n) ? n : noComment
}

function readHeader(bytes: Uint8Array, offset: number): { header: Header; end: number } {
  const header: Header = {}
  let pos = offset
  for (;;) {
    if (pos + CARD > bytes.length) throw new Error('FITS: cabeçalho truncado')
    const card = String.fromCharCode(...bytes.subarray(pos, pos + CARD))
    pos += CARD
    const key = card.slice(0, 8).trim()
    if (key === 'END') break
    if (card.slice(8, 10) === '= ') header[key] = parseValue(card.slice(10))
  }
  const end = Math.ceil((pos - offset) / BLOCK) * BLOCK + offset
  return { header, end }
}

function dataSize(h: Header): number {
  const naxis = Number(h.NAXIS ?? 0)
  if (!naxis) return 0
  let n = 1
  for (let i = 1; i <= naxis; i++) n *= Number(h[`NAXIS${i}`] ?? 0)
  const bitpix = Math.abs(Number(h.BITPIX ?? 8))
  const gcount = Number(h.GCOUNT ?? 1)
  const pcount = Number(h.PCOUNT ?? 0)
  return ((bitpix / 8) * (n + pcount)) * gcount
}

export function readHdus(buffer: ArrayBuffer): Hdu[] {
  const bytes = new Uint8Array(buffer)
  const hdus: Hdu[] = []
  let offset = 0
  while (offset + BLOCK <= bytes.length) {
    const { header, end } = readHeader(bytes, offset)
    const length = dataSize(header)
    hdus.push({ header, dataOffset: end, dataLength: length })
    offset = end + Math.ceil(length / BLOCK) * BLOCK
    if (hdus.length > 64) break
  }
  if (!hdus.length || hdus[0].header.SIMPLE !== true) throw new Error('Arquivo não é FITS')
  return hdus
}

const TYPE_SIZE: Record<string, number> = { L: 1, B: 1, I: 2, J: 4, K: 8, A: 1, E: 4, D: 8, C: 8, M: 16, P: 8, Q: 16, X: 1 }

interface Column {
  name: string
  type: string
  repeat: number
  offset: number
  scale: number
  zero: number
}

function columns(h: Header): Column[] {
  const n = Number(h.TFIELDS ?? 0)
  const cols: Column[] = []
  let offset = 0
  for (let i = 1; i <= n; i++) {
    const form = String(h[`TFORM${i}`] ?? '').trim()
    const m = /^(\d*)([LXBIJKAEDCMPQ])/.exec(form)
    if (!m) throw new Error(`FITS: TFORM desconhecido "${form}"`)
    const repeat = m[1] === '' ? 1 : parseInt(m[1], 10)
    const type = m[2]
    const width = type === 'X' ? Math.ceil(repeat / 8) : TYPE_SIZE[type] * repeat
    cols.push({
      name: String(h[`TTYPE${i}`] ?? `COL${i}`).trim(),
      type,
      repeat,
      offset,
      scale: Number(h[`TSCAL${i}`] ?? 1),
      zero: Number(h[`TZERO${i}`] ?? 0),
    })
    offset += width
  }
  return cols
}

/**
 * Reads scalar numeric columns from the first BINTABLE extension that has
 * all of them. NaN marks missing values.
 */
export function readTableColumns(buffer: ArrayBuffer, names: string[]): Record<string, Float64Array> & { header: Header } {
  const hdus = readHdus(buffer)
  const view = new DataView(buffer)
  for (const hdu of hdus.slice(1)) {
    if (String(hdu.header.XTENSION).trim() !== 'BINTABLE') continue
    const cols = columns(hdu.header)
    const wanted = names.map((n) => cols.find((c) => c.name.toUpperCase() === n.toUpperCase()))
    if (wanted.some((c) => !c)) continue
    const rowBytes = Number(hdu.header.NAXIS1)
    const rows = Number(hdu.header.NAXIS2)
    if (hdu.dataOffset + rowBytes * rows > buffer.byteLength) throw new Error('FITS: tabela truncada')
    const out: Record<string, Float64Array> = {}
    wanted.forEach((col, k) => {
      const c = col as Column
      const arr = new Float64Array(rows)
      for (let r = 0; r < rows; r++) {
        const p = hdu.dataOffset + r * rowBytes + c.offset
        let v: number
        switch (c.type) {
          case 'D':
            v = view.getFloat64(p, false)
            break
          case 'E':
            v = view.getFloat32(p, false)
            break
          case 'J':
            v = view.getInt32(p, false) * c.scale + c.zero
            break
          case 'I':
            v = view.getInt16(p, false) * c.scale + c.zero
            break
          case 'K':
            v = Number(view.getBigInt64(p, false)) * c.scale + c.zero
            break
          case 'B':
            v = view.getUint8(p) * c.scale + c.zero
            break
          default:
            v = NaN
        }
        arr[r] = v
      }
      out[names[k]] = arr
    })
    return Object.assign(out, { header: hdu.header })
  }
  throw new Error(`FITS: colunas ${names.join(', ')} não encontradas`)
}
