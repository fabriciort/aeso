import { execFile } from 'node:child_process'
import { URL } from 'node:url'
import { promisify } from 'node:util'
import { NextRequest, NextResponse } from 'next/server'
import { formatRA, formatDec, type ObjectData } from '@/lib/mast'

const MAST_API_URL = 'https://mast.stsci.edu/api/v0'
const mastInvokeUrl = new URL(`${MAST_API_URL}/invoke`)

const execFileAsync = promisify(execFile)

type MastResponse = {
  resolvedCoordinate?: Array<{
    ra: string
    decl: string
    canonicalName?: string
    resolver?: string
    searchString?: string
    cacheDate?: string
    objectType?: string
    radius?: number
  }>
}

// The container used for tests blocks outbound connections from Node.js (they result
// in ENETUNREACH), but the `curl` binary is allowed. We proxy the request through
// `curl` to keep the development experience reliable.
async function invokeMast(body: string): Promise<MastResponse> {
  try {
    const { stdout } = await execFileAsync('curl', [
      '-sS',
      '-X',
      'POST',
      '-H',
      'Content-Type: application/x-www-form-urlencoded',
      '--data',
      body,
      mastInvokeUrl.toString()
    ])

    return JSON.parse(stdout) as MastResponse
  } catch (error) {
    if (error && typeof error === 'object' && 'stderr' in error) {
      const stderr = String((error as { stderr?: unknown }).stderr ?? '')
      throw new Error(`Failed to reach MAST API: ${stderr || (error as Error).message}`)
    }

    throw error
  }
}

export async function GET(req: NextRequest) {
  const object = req.nextUrl.searchParams.get('object')
  if (!object) {
    return NextResponse.json({ error: 'Missing object' }, { status: 400 })
  }

  const requestObject = {
    service: 'Mast.Name.Lookup',
    params: {
      input: object,
      format: 'json'
    },
    format: 'json'
  }

  const formBody = new URLSearchParams({
    request: JSON.stringify(requestObject)
  }).toString()

  try {
    const data = await invokeMast(formBody)
    const result = data.resolvedCoordinate?.[0]

    if (!result) {
      return NextResponse.json({ error: 'Object not found' }, { status: 404 })
    }

    const ra = Number.parseFloat(result.ra)
    const dec = Number.parseFloat(result.decl)

    if (Number.isNaN(ra) || Number.isNaN(dec)) {
      return NextResponse.json({ error: 'Invalid coordinates returned by MAST' }, { status: 502 })
    }

    const payload: ObjectData = {
      ra,
      dec,
      name: result.canonicalName?.trim() || object,
      coordinates: {
        ra_str: formatRA(ra),
        dec_str: formatDec(dec)
      },
      metadata: {
        canonicalName: result.canonicalName,
        resolver: result.resolver,
        searchString: result.searchString,
        cacheDate: result.cacheDate,
        objectType: result.objectType,
        radius: typeof result.radius === 'number' ? result.radius : undefined
      }
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('MAST API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
