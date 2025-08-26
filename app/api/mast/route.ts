import { NextRequest, NextResponse } from 'next/server'
import { formatRA, formatDec, ObjectData } from '@/lib/mast'

const MAST_API_URL = 'https://mast.stsci.edu/api/v0'

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
  })

  try {
    const response = await fetch(`${MAST_API_URL}/invoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody.toString()
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'MAST request failed' }, { status: response.status })
    }

    const data = await response.json() as {
      resolvedCoordinate?: { ra: string; decl: string }[]
    }
    const result = data.resolvedCoordinate?.[0]
    if (!result) {
      return NextResponse.json({ error: 'Object not found' }, { status: 404 })
    }

    const ra = parseFloat(result.ra)
    const dec = parseFloat(result.decl)

    const payload: ObjectData = {
      ra,
      dec,
      name: object,
      coordinates: {
        ra_str: formatRA(ra),
        dec_str: formatDec(dec)
      }
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('MAST API error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
