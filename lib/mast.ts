const MAST_API_URL = "https://mast.stsci.edu/api/v0"

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
}

export async function getObjectData(objectName: string): Promise<ObjectData | null> {
  try {
    // Build MAST request object
    const requestObject = {
      service: 'Mast.Name.Lookup',
      params: {
        input: objectName,
        format: 'json'
      },
      format: 'json'
    }

    // Per MAST API docs, the request must be wrapped in a "request=" form field
    const formBody = new URLSearchParams({
      request: JSON.stringify(requestObject)
    })

    const response = await fetch(`${MAST_API_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString()
    })

    if (!response.ok) throw new Error('Falha na busca do objeto')
    
    const data = await response.json() as any
    const result = data?.resolvedCoordinate?.[0]
    if (!result) return null

    const ra = parseFloat(result.ra)
    const dec = parseFloat(result.decl)

    return {
      ra,
      dec,
      name: objectName,
      coordinates: {
        ra_str: formatRA(ra),
        dec_str: formatDec(dec)
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados do objeto:', error)
    return null
  }
}

// Funções auxiliares para formatação
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