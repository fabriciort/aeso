export interface ObjectData {
  ra: number
  dec: number
  name: string
  magnitude?: number
  distance?: string
  coordinates?: {
    ra_str: string
    dec_str: string
  }
  metadata?: {
    canonicalName?: string
    resolver?: string
    searchString?: string
    cacheDate?: string
    objectType?: string
    radius?: number
  }
}

export async function getObjectData(objectName: string): Promise<ObjectData> {
  try {
    const response = await fetch(`/api/mast?object=${encodeURIComponent(objectName)}`)
    const payload = await response.json()

    if (!response.ok) {
      const message = typeof payload?.error === 'string' ? payload.error : 'Falha na busca do objeto'
      throw new Error(message)
    }

    return payload as ObjectData
  } catch (error) {
    console.error('Erro ao buscar dados do objeto:', error)
    throw error
  }
}

export function formatRA(ra: number): string {
  const hours = Math.floor(ra / 15)
  const minutes = Math.floor((ra / 15 - hours) * 60)
  const seconds = ((ra / 15 - hours - minutes / 60) * 3600).toFixed(1)
  return `${hours}h ${minutes}m ${seconds}s`
}

export function formatDec(dec: number): string {
  const sign = dec >= 0 ? '+' : '-'
  const absDec = Math.abs(dec)
  const degrees = Math.floor(absDec)
  const minutes = Math.floor((absDec - degrees) * 60)
  const seconds = ((absDec - degrees - minutes / 60) * 3600).toFixed(1)
  return `${sign}${degrees}° ${minutes}' ${seconds}"`
}
