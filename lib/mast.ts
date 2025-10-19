const MAST_API_URL = "https://mast.stsci.edu/api/v0"

interface BaseObjectData {
  ra: number
  dec: number
  name: string
  magnitude?: number
  distance?: string
  classification?: string
  constellation?: string
  description?: string
  additionalNames?: string[]
  coordinates?: {
    ra_str: string
    dec_str: string
  }
}

export interface ObjectData extends BaseObjectData {
  source: 'api' | 'fallback' | 'coordinates'
  originalQuery: string
  resolvedQuery: string
}

type FallbackEntry = {
  aliases: string[]
  data: BaseObjectData & { mastQuery?: string }
}

const FALLBACK_OBJECTS: FallbackEntry[] = [
  {
    aliases: ['m51', 'whirlpool galaxy', 'ngc 5194', 'ngc5194', 'messier 51'],
    data: {
      mastQuery: 'M51',
      name: 'M51 — Whirlpool Galaxy',
      ra: 202.4696,
      dec: 47.1952,
      magnitude: 8.4,
      distance: '23 milhões de anos-luz',
      classification: 'SA(s)bc + SB0',
      constellation: 'Canes Venatici',
      description:
        'Uma galáxia espiral em interação que revela braços grandiosos e um núcleo ativo influenciado pela galáxia companheira NGC 5195.',
      additionalNames: ['NGC 5194', 'Whirlpool Galaxy', 'Arp 85'],
      coordinates: {
        ra_str: formatRA(202.4696),
        dec_str: formatDec(47.1952)
      }
    }
  },
  {
    aliases: ['m31', 'andromeda', 'andromeda galaxy', 'ngc 224', 'messier 31'],
    data: {
      mastQuery: 'M31',
      name: 'M31 — Galáxia de Andrômeda',
      ra: 10.6847,
      dec: 41.2687,
      magnitude: 3.4,
      distance: '2.54 milhões de anos-luz',
      classification: 'SA(s)b',
      constellation: 'Andromeda',
      description:
        'A maior galáxia do Grupo Local e vizinha mais próxima da Via Láctea, com um disco proeminente e satélites bem catalogados.',
      additionalNames: ['NGC 224', 'Andromeda Galaxy'],
      coordinates: {
        ra_str: formatRA(10.6847),
        dec_str: formatDec(41.2687)
      }
    }
  },
  {
    aliases: ['ngc 1300', 'ngc1300'],
    data: {
      mastQuery: 'NGC 1300',
      name: 'NGC 1300 — Galáxia Barrada',
      ra: 49.921,
      dec: -19.411,
      magnitude: 11.4,
      distance: '61 milhões de anos-luz',
      classification: 'SB(rs)bc',
      constellation: 'Eridanus',
      description:
        'Uma galáxia espiral barrada icônica observada pelo Hubble, com estrutura central complexa e braços bem definidos.',
      additionalNames: ['PGC 12557'],
      coordinates: {
        ra_str: formatRA(49.921),
        dec_str: formatDec(-19.411)
      }
    }
  },
  {
    aliases: ['horsehead nebula', 'barnard 33', 'ic 434', 'horsehead'],
    data: {
      mastQuery: 'Horsehead Nebula',
      name: 'Nebulosa Cabeça de Cavalo',
      ra: 85.25,
      dec: -2.5,
      distance: '1.375 anos-luz',
      classification: 'Nebulosa de absorção',
      constellation: 'Orion',
      description:
        'Uma nebulosa escura icônica silhuetada contra a emissão avermelhada de IC 434, parte da complexa região de formação estelar de Orion.',
      additionalNames: ['Barnard 33', 'IC 434'],
      coordinates: {
        ra_str: formatRA(85.25),
        dec_str: formatDec(-2.5)
      }
    }
  },
  {
    aliases: ['trappist-1', 'trappist 1', '2mass j23062928-0502285'],
    data: {
      mastQuery: 'TRAPPIST-1',
      name: 'TRAPPIST-1 — Sistema Planetário',
      ra: 346.6234,
      dec: -5.0415,
      distance: '39 anos-luz',
      classification: 'Anã ultrafria do tipo M8V',
      constellation: 'Aquarius',
      description:
        'Estrela ultrafria com sete exoplanetas terrestres transientes, três deles na zona habitável potencial.',
      additionalNames: ['2MASS J23062928-0502285'],
      coordinates: {
        ra_str: formatRA(346.6234),
        dec_str: formatDec(-5.0415)
      }
    }
  }
]

export async function getObjectData(objectName: string): Promise<ObjectData | null> {
  const query = objectName.trim()
  if (!query) return null

  const coordinateMatch = parseCoordinateQuery(query)
  if (coordinateMatch) {
    const normalizedRa = normalizeRightAscension(coordinateMatch.ra)
    const normalizedDec = clampDeclination(coordinateMatch.dec)
    const formattedName = `Coordenadas — RA ${formatRA(normalizedRa)} / Dec ${formatDec(normalizedDec)}`

    return {
      name: formattedName,
      ra: normalizedRa,
      dec: normalizedDec,
      description:
        'Visualização direta das coordenadas fornecidas. Ajuste a área no AstroView para investigar registros próximos.',
      additionalNames: [query],
      coordinates: {
        ra_str: formatRA(normalizedRa),
        dec_str: formatDec(normalizedDec)
      },
      source: 'coordinates',
      originalQuery: query,
      resolvedQuery: query
    }
  }

  try {
    const requestObject = {
      service: 'Mast.Name.Lookup',
      params: {
        input: query,
        format: 'json'
      },
      format: 'json'
    }

    const formBody = new URLSearchParams({
      request: JSON.stringify(requestObject)
    })

    const response = await fetch(`${MAST_API_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody.toString()
    })

    if (!response.ok) throw new Error('Falha na busca do objeto')

    const data = await response.json() as any
    const result = data?.resolvedCoordinate?.[0]

    if (!result) {
      const fallback = findFallback(query)
      if (!fallback) return null

      const fallbackData = stripMastQuery(fallback)

      return {
        ...fallbackData,
        source: 'fallback',
        originalQuery: query,
        resolvedQuery: fallback.mastQuery ?? fallbackData.name
      }
    }

    const ra = parseFloat(result.ra)
    const dec = parseFloat(result.decl)
    const fallback = findFallback(query)
    const fallbackData = fallback ? stripMastQuery(fallback) : null

    const metadata: BaseObjectData = {
      ...(fallbackData ?? {}),
      name: fallbackData?.name ?? (result?.objname ?? query),
      ra,
      dec,
      coordinates: {
        ra_str: formatRA(ra),
        dec_str: formatDec(dec)
      }
    }

    return {
      ...metadata,
      source: 'api',
      originalQuery: query,
      resolvedQuery: result?.objname ?? fallback?.mastQuery ?? query
    }
  } catch (error) {
    console.error('Erro ao buscar dados do objeto:', error)
    const fallback = findFallback(query)
    if (!fallback) {
      return null
    }

    const fallbackData = stripMastQuery(fallback)
    return {
      ...fallbackData,
      source: 'fallback',
      originalQuery: query,
      resolvedQuery: fallback.mastQuery ?? fallbackData.name
    }
  }
}

function findFallback(objectName: string): (BaseObjectData & { mastQuery?: string }) | null {
  const normalized = objectName.trim().toLowerCase()
  const entry = FALLBACK_OBJECTS.find((item) =>
    item.aliases.some((alias) => alias.toLowerCase() === normalized)
  )

  return entry?.data ?? null
}

function formatRA(ra: number): string {
  const normalized = normalizeRightAscension(ra)
  const hours = Math.floor(normalized / 15)
  const minutes = Math.floor((normalized / 15 - hours) * 60)
  const seconds = ((normalized / 15 - hours - minutes / 60) * 3600).toFixed(1)
  return `${hours}h ${minutes}m ${seconds}s`
}

function formatDec(dec: number): string {
  const clamped = clampDeclination(dec)
  const sign = clamped >= 0 ? '+' : '-'
  const absDec = Math.abs(clamped)
  const degrees = Math.floor(absDec)
  const minutes = Math.floor((absDec - degrees) * 60)
  const seconds = ((absDec - degrees - minutes / 60) * 3600).toFixed(1)
  return `${sign}${degrees}° ${minutes}' ${seconds}"`
}

function stripMastQuery(entry: BaseObjectData & { mastQuery?: string }): BaseObjectData {
  const { mastQuery: _unused, ...rest } = entry
  return { ...rest }
}

function parseCoordinateQuery(query: string): { ra: number; dec: number } | null {
  const trimmed = query.trim()
  if (!trimmed) return null

  const normalized = trimmed.replace(/[\u2019\u2018\u2032\u2033]/g, "'")
  const lower = normalized.toLowerCase()
  const raIndex = lower.indexOf('ra')
  const decIndex = lower.indexOf('dec')

  if (raIndex !== -1 && decIndex !== -1 && raIndex < decIndex) {
    const raSegment = normalized.slice(raIndex + 2, decIndex)
    const decSegment = normalized.slice(decIndex + 3)
    const ra = parseRightAscension(raSegment)
    const dec = parseDeclination(decSegment)
    if (ra !== null && dec !== null) {
      return { ra, dec }
    }
  }

  const commaSeparated = normalized.split(/[;,]/).map((part) => part.trim()).filter(Boolean)
  if (commaSeparated.length === 2) {
    const ra = parseRightAscension(commaSeparated[0])
    const dec = parseDeclination(commaSeparated[1])
    if (ra !== null && dec !== null) {
      return { ra, dec }
    }
  }

  const whitespaceSeparated = normalized.split(/\s+/).filter(Boolean)
  if (whitespaceSeparated.length === 2) {
    const ra = parseRightAscension(whitespaceSeparated[0])
    const dec = parseDeclination(whitespaceSeparated[1])
    if (ra !== null && dec !== null) {
      return { ra, dec }
    }
  }

  return null
}

function parseRightAscension(value: string): number | null {
  const raw = value.trim()
  if (!raw) return null

  const hasSexagesimal = /[:hms]/i.test(raw) || raw.split(/\s+/).length > 1
  const cleaned = raw
    .replace(/[hH]/g, ' ')
    .replace(/[mM]/g, ' ')
    .replace(/[sS]/g, ' ')
    .replace(/[°º]/g, ' ')
    .replace(/[,'"]/g, ' ')
    .replace(/[:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const parts = cleaned.split(' ').filter(Boolean)
  if (!parts.length) return null

  const numbers = parts.map((part) => Number(part)).filter((num) => !Number.isNaN(num))
  if (!numbers.length) return null

  if (hasSexagesimal) {
    const [hours, minutes = 0, seconds = 0] = numbers
    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return null
    }
    const sign = hours < 0 ? -1 : 1
    const totalHours = Math.abs(hours) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600
    const degrees = totalHours * 15 * sign
    return normalizeRightAscension(degrees)
  }

  const valueNumber = Number(parts[0])
  if (Number.isNaN(valueNumber)) return null

  if (Math.abs(valueNumber) <= 24 && !/[°º]/.test(raw)) {
    return normalizeRightAscension(valueNumber * 15)
  }

  return normalizeRightAscension(valueNumber)
}

function parseDeclination(value: string): number | null {
  const raw = value.trim()
  if (!raw) return null

  const hasSexagesimal = /[:d°'"º]/i.test(raw) || raw.split(/\s+/).length > 1
  const cleaned = raw
    .replace(/[dD]/g, ' ')
    .replace(/[°º]/g, ' ')
    .replace(/[,'"]/g, ' ')
    .replace(/[:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const parts = cleaned.split(' ').filter(Boolean)
  if (!parts.length) return null

  const numbers = parts.map((part) => Number(part)).filter((num) => !Number.isNaN(num))
  if (!numbers.length) return null

  if (hasSexagesimal) {
    const [degrees, minutes = 0, seconds = 0] = numbers
    if (Number.isNaN(degrees) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return null
    }
    const sign = raw.trim().startsWith('-') || degrees < 0 ? -1 : 1
    const totalDegrees = Math.abs(degrees) + Math.abs(minutes) / 60 + Math.abs(seconds) / 3600
    return clampDeclination(totalDegrees * sign)
  }

  const valueNumber = Number(parts[0])
  if (Number.isNaN(valueNumber)) return null

  return clampDeclination(valueNumber)
}

function normalizeRightAscension(ra: number): number {
  if (!Number.isFinite(ra)) return ra
  const normalized = ra % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function clampDeclination(dec: number): number {
  if (!Number.isFinite(dec)) return dec
  if (dec > 90) return 90
  if (dec < -90) return -90
  return dec
}
