import 'server-only'
import { z } from 'zod'
import type { SearchFilters } from '@/lib/astro/types'
import { aiProvider, completeJson } from './ai'

// Optional "smart" layer for the search bar: when an AI provider is
// configured (see lib/server/ai.ts), free-form questions are turned into
// either an object name or structured SIMBAD filters. Without a provider the
// rule-based parser in lib/astro/query.ts is used on its own.

const nullable = <T extends z.ZodTypeAny>(t: T) => t.nullable().optional()

const Interpretation = z.object({
  intent: z.enum(['object', 'search', 'unknown']),
  objectName: nullable(z.string()),
  filters: z
    .object({
      otype: nullable(z.string()),
      morphology: nullable(z.string()),
      spectralType: nullable(z.string()),
      catalog: nullable(z.string()),
      magMax: nullable(z.number()),
      magMin: nullable(z.number()),
      redshiftMax: nullable(z.number()),
      redshiftMin: nullable(z.number()),
      near: nullable(z.string()),
      radiusDeg: nullable(z.number()),
      sort: nullable(z.enum(['brightness', 'size', 'redshift'])),
      limit: nullable(z.number()),
    })
    .partial()
    .default({}),
})

export type Interpretation = z.infer<typeof Interpretation>

const SYSTEM = `Você interpreta buscas digitadas na barra de pesquisa de um explorador de dados astronômicos (SIMBAD/MAST).
Responda APENAS com um objeto JSON no formato:
{"intent": "object" | "search" | "unknown",
 "objectName": string | null,      // intent=object: designação resolvível pelo SIMBAD, ex. "M 87", "NGC 1300", "HD 209458"
 "filters": {                      // intent=search
   "otype": string | null,         // código SIMBAD; ".." inclui subtipos: "G..", "PN", "GlC", "OpC", "*..", "Pl..", "QSO.."
   "morphology": string | null,    // padrão LIKE: "S%", "SB%", "E%"
   "spectralType": string | null,  // prefixo: "G2", "M"
   "catalog": string | null,       // "M", "NGC", "IC", "HD", "HIP"
   "magMax": number | null, "magMin": number | null,
   "redshiftMax": number | null, "redshiftMin": number | null,
   "near": string | null,          // nome de objeto de referência para busca por proximidade
   "radiusDeg": number | null,
   "sort": "brightness" | "size" | "redshift" | null,
   "limit": number | null }}
Use intent=object para UM objeto específico (traduza nomes populares em qualquer idioma para a designação de catálogo).
Use intent=search para listas por características. Use intent=unknown se não for sobre astronomia.`

export function aiEnabled(): boolean {
  return aiProvider() !== null
}

export async function interpretQuery(query: string): Promise<Interpretation | null> {
  return completeJson(Interpretation, SYSTEM, query.slice(0, 500))
}

export function toFilters(i: Interpretation): SearchFilters {
  const f: SearchFilters = {}
  for (const [k, v] of Object.entries(i.filters ?? {})) {
    if (v !== null && v !== undefined) (f as Record<string, unknown>)[k] = v
  }
  return f
}
