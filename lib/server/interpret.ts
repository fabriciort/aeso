import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'
import type { SearchFilters } from '@/lib/astro/types'

// Optional "smart" layer: when ANTHROPIC_API_KEY is configured, Claude turns
// free-form questions ("as nebulosas mais bonitas perto de Órion", "o buraco
// negro da primeira foto do EHT") into either an object name or structured
// SIMBAD filters. Without a key, the rule-based parser in lib/astro/query.ts
// is used on its own.

const Interpretation = z.object({
  intent: z.enum(['object', 'search', 'unknown']),
  objectName: z
    .string()
    .nullable()
    .describe('Identificador resolvível pelo SIMBAD/Sesame (ex.: "M 87", "NGC 1300", "HD 209458") quando intent=object'),
  filters: z.object({
    otype: z.string().nullable().describe('Código de tipo SIMBAD; sufixo ".." inclui subtipos (ex.: "G..", "PN", "GlC", "*..", "Pl..")'),
    morphology: z.string().nullable().describe('Padrão SQL LIKE de morfologia (ex.: "S%", "SB%", "E%")'),
    spectralType: z.string().nullable().describe('Prefixo de tipo espectral (ex.: "G2", "M")'),
    catalog: z.string().nullable().describe('Prefixo de catálogo (ex.: "M", "NGC", "IC", "HD", "HIP")'),
    magMax: z.number().nullable().describe('Magnitude V máxima (mais brilhante que)'),
    magMin: z.number().nullable(),
    redshiftMax: z.number().nullable(),
    redshiftMin: z.number().nullable(),
    near: z.string().nullable().describe('Nome resolvível de um objeto de referência para busca por proximidade'),
    radiusDeg: z.number().nullable(),
    sort: z.enum(['brightness', 'size', 'redshift']).nullable(),
    limit: z.number().nullable(),
  }),
})

export type Interpretation = z.infer<typeof Interpretation>

const SYSTEM = `Você interpreta buscas digitadas na barra de pesquisa de um explorador de dados astronômicos (MAST/SIMBAD).
Decida se o usuário procura UM objeto específico (intent=object, com objectName resolvível pelo SIMBAD — traduza nomes populares em qualquer idioma para a designação de catálogo) ou uma LISTA de objetos por características (intent=search, com filtros SIMBAD).
Use intent=unknown se a busca não tiver relação com astronomia. Preencha com null tudo o que não foi pedido.`

let client: Anthropic | null = null

export function claudeEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export async function interpretWithClaude(query: string): Promise<Interpretation | null> {
  if (!claudeEnabled()) return null
  client ??= new Anthropic({ timeout: 20_000, maxRetries: 1 })
  try {
    const response = await client.messages.parse({
      model: process.env.AESO_CLAUDE_MODEL || 'claude-opus-5-5',
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: 'user', content: query.slice(0, 500) }],
      output_config: { effort: 'low', format: zodOutputFormat(Interpretation) },
    })
    if (response.stop_reason === 'refusal') return null
    return response.parsed_output ?? null
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`[interpret] Claude API ${error.status}: ${error.message}`)
    } else {
      console.error('[interpret]', error)
    }
    return null
  }
}

export function toFilters(i: Interpretation): SearchFilters {
  const f: SearchFilters = {}
  for (const [k, v] of Object.entries(i.filters)) {
    if (v !== null) (f as Record<string, unknown>)[k] = v
  }
  return f
}
