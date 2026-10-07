import type { DataProduct, Observation, SearchResponse } from '@/lib/astro/types'

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal })
  const body = (await res.json().catch(() => null)) as (T & { error?: string }) | null
  if (!body) throw new Error('Resposta inválida do servidor')
  if (!res.ok && 'error' in body && body.error) throw new Error(body.error)
  return body
}

export function searchQuery(q: string, signal?: AbortSignal) {
  return getJson<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`, signal)
}

export async function fetchObservations(ra: number, dec: number, radius: number, signal?: AbortSignal) {
  const r = await getJson<{ observations: Observation[] }>(
    `/api/observations?ra=${ra}&dec=${dec}&radius=${radius}`,
    signal,
  )
  return r.observations
}

export async function fetchProducts(obsid: string, signal?: AbortSignal) {
  const r = await getJson<{ products: DataProduct[] }>(`/api/products?obsid=${encodeURIComponent(obsid)}`, signal)
  return r.products
}

/** Builds a bash script that downloads the chosen products with curl. */
export function curlScript(products: DataProduct[], label: string): string {
  const lines = [
    '#!/usr/bin/env bash',
    `# AESo — download de ${products.length} arquivo(s) do MAST para ${label}`,
    `# Gerado em ${new Date().toISOString()}`,
    'set -euo pipefail',
    `mkdir -p "aeso_${label.replace(/[^A-Za-z0-9_-]+/g, '_')}" && cd "$_"`,
    '',
    ...products.map((p) => `curl -fL --retry 3 -o ${JSON.stringify(p.filename)} ${JSON.stringify(p.downloadUrl)}`),
    '',
  ]
  return lines.join('\n')
}

export function saveFile(contents: string, filename: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([contents], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Starts several downloads without popups: MAST serves files as attachments,
 * so loading each URL in a hidden iframe triggers a regular download.
 */
export function downloadAll(urls: string[]) {
  urls.forEach((url, i) => {
    setTimeout(() => {
      const frame = document.createElement('iframe')
      frame.style.display = 'none'
      frame.src = url
      document.body.appendChild(frame)
      setTimeout(() => frame.remove(), 120_000)
    }, i * 400)
  })
}
