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
  source: 'api' | 'fallback'
}

type FallbackEntry = {
  aliases: string[]
  data: BaseObjectData
}

const FALLBACK_OBJECTS: FallbackEntry[] = [
  {
    aliases: ['m51', 'whirlpool galaxy', 'ngc 5194', 'ngc5194', 'messier 51'],
    data: {
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
      return fallback ? { ...fallback, source: 'fallback' } : null
    }

    const ra = parseFloat(result.ra)
    const dec = parseFloat(result.decl)
    const fallback = findFallback(query)

    return {
      name: fallback?.name ?? query,
      ra,
      dec,
      magnitude: fallback?.magnitude,
      distance: fallback?.distance,
      classification: fallback?.classification,
      constellation: fallback?.constellation,
      description: fallback?.description,
      additionalNames: fallback?.additionalNames,
      coordinates: {
        ra_str: formatRA(ra),
        dec_str: formatDec(dec)
      },
      source: 'api'
    }
  } catch (error) {
    console.error('Erro ao buscar dados do objeto:', error)
    const fallback = findFallback(query)
    if (fallback) {
      return { ...fallback, source: 'fallback' }
    }
    return null
  }
}

function findFallback(objectName: string): BaseObjectData | null {
  const normalized = objectName.trim().toLowerCase()
  const entry = FALLBACK_OBJECTS.find((item) =>
    item.aliases.some((alias) => alias.toLowerCase() === normalized)
  )

  return entry?.data ?? null
}

function formatRA(ra: number): string {
  const hours = Math.floor(ra / 15)
  const minutes = Math.floor((ra / 15 - hours) * 60)
  const seconds = ((ra / 15 - hours - minutes / 60) * 3600).toFixed(1)
  return `${hours}h ${minutes}m ${seconds}s`
}

function formatDec(dec: number): string {
  const sign = dec >= 0 ? '+' : '-'
  const absDec = Math.abs(dec)
  const degrees = Math.floor(absDec)
  const minutes = Math.floor((absDec - degrees) * 60)
  const seconds = ((absDec - degrees - minutes / 60) * 3600).toFixed(1)
  return `${sign}${degrees}° ${minutes}' ${seconds}"`
}
