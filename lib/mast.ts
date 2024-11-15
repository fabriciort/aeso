const MAST_API_URL = "https://mast.stsci.edu/api/v0.1"

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
    const response = await fetch(`${MAST_API_URL}/invoke/Mast.Name.Lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: objectName,
        format: 'json'
      })
    })

    if (!response.ok) throw new Error('Falha na busca do objeto')
    
    const data = await response.json()
    if (!data?.[0]) return null

    const result = data[0]
    const ra = parseFloat(result.ra)
    const dec = parseFloat(result.dec)

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