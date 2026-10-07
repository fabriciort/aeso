import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import type { z } from 'zod'

// AI provider layer. Everything that talks to a language model goes through
// here, so switching providers is a matter of environment variables:
//
//   GROQ_API_KEY       → Groq (OpenAI-compatible API), model AESO_AI_MODEL
//                        (default qwen/qwen3.8-27b). Preferred when set.
//   ANTHROPIC_API_KEY  → Claude, model AESO_CLAUDE_MODEL (default claude-opus-5-5).
//
// Without any key the AI features degrade gracefully (rules-only search,
// Vega disabled with a friendly message).

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

type Provider = 'groq' | 'anthropic'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const DEFAULT_GROQ_MODEL = 'qwen/qwen3.8-27b'
const DEFAULT_CLAUDE_MODEL = 'claude-opus-5-5'

export function aiProvider(): Provider | null {
  if (process.env.GROQ_API_KEY) return 'groq'
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  return null
}

export class AIError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
  }
}

// Reasoning models may emit their chain of thought between <think> tags when
// the provider does not hide it; never show that to students.
export function stripThinking(text: string): string {
  return text.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').trimStart()
}

// ---------------------------------------------------------------- Groq

let groqSupportsHiddenReasoning = true

async function groqRequest(body: Record<string, unknown>, timeoutMs: number): Promise<Response> {
  const send = (b: Record<string, unknown>) =>
    fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
      signal: AbortSignal.timeout(timeoutMs),
    })

  const payload = {
    model: process.env.AESO_AI_MODEL || DEFAULT_GROQ_MODEL,
    ...body,
    ...(groqSupportsHiddenReasoning ? { reasoning_format: 'hidden' } : {}),
  }
  let res = await send(payload)
  if (res.status === 400 && groqSupportsHiddenReasoning) {
    const text = await res.text()
    if (/reasoning/i.test(text)) {
      // The model does not accept reasoning_format; remember and retry.
      groqSupportsHiddenReasoning = false
      const { reasoning_format: _, ...rest } = payload
      void _
      res = await send(rest)
    } else {
      throw new AIError(`Groq 400: ${text.slice(0, 300)}`, 400)
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new AIError(`Groq ${res.status}: ${text.slice(0, 300)}`, res.status)
  }
  return res
}

/** Parses an OpenAI-style SSE stream into text deltas. */
async function* sseDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let nl: number
    while ((nl = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, nl).trim()
      buffer = buffer.slice(nl + 1)
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (data === '[DONE]') return
      try {
        const json = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] }
        const delta = json.choices?.[0]?.delta?.content
        if (delta) yield delta
      } catch {
        // ignore keep-alive or partial lines
      }
    }
  }
}

// ----------------------------------------------------------- Anthropic

let anthropic: Anthropic | null = null
function claude(): Anthropic {
  anthropic ??= new Anthropic({ timeout: 30_000, maxRetries: 1 })
  return anthropic
}

function splitSystem(messages: ChatMessage[]) {
  const system = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n')
  const rest = messages.filter((m) => m.role !== 'system') as { role: 'user' | 'assistant'; content: string }[]
  return { system, rest }
}

// ---------------------------------------------------------- Public API

/**
 * Asks the model for a JSON object and validates it with zod.
 * Returns null on any failure (callers fall back to non-AI behavior).
 */
export async function completeJson<T>(schema: z.ZodType<T>, system: string, user: string): Promise<T | null> {
  const provider = aiProvider()
  if (!provider) return null
  try {
    let text = ''
    if (provider === 'groq') {
      const res = await groqRequest(
        {
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.1,
          max_completion_tokens: 2000,
          response_format: { type: 'json_object' },
        },
        20_000,
      )
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] }
      text = json.choices?.[0]?.message?.content ?? ''
    } else {
      const response = await claude().messages.create({
        model: process.env.AESO_CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL,
        max_tokens: 4000,
        system: `${system}\nResponda somente com um objeto JSON válido.`,
        messages: [{ role: 'user', content: user }],
        output_config: { effort: 'low' },
      })
      if (response.stop_reason === 'refusal') return null
      text = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('')
    }
    const raw = stripThinking(text)
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start < 0 || end <= start) return null
    const parsed = schema.safeParse(JSON.parse(raw.slice(start, end + 1)))
    return parsed.success ? parsed.data : null
  } catch (error) {
    console.error(`[ai:${provider}] completeJson`, error instanceof Error ? error.message : error)
    return null
  }
}

/** Streams a chat completion as plain text chunks (thinking removed). */
export async function streamChat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<AsyncGenerator<string>> {
  const provider = aiProvider()
  if (!provider) throw new AIError('Nenhum provedor de IA configurado', 503)

  let source: AsyncGenerator<string>
  if (provider === 'groq') {
    const res = await groqRequest(
      {
        messages,
        stream: true,
        temperature: opts.temperature ?? 0.5,
        max_completion_tokens: opts.maxTokens ?? 700,
      },
      45_000,
    )
    if (!res.body) throw new AIError('Resposta vazia do Groq')
    source = sseDeltas(res.body)
  } else {
    const { system, rest } = splitSystem(messages)
    const stream = claude().messages.stream({
      model: process.env.AESO_CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL,
      max_tokens: opts.maxTokens ? opts.maxTokens * 4 : 4000,
      system,
      messages: rest,
      output_config: { effort: 'low' },
    })
    source = (async function* () {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') yield event.delta.text
      }
    })()
  }

  // Filter <think>…</think> blocks that may span several chunks.
  return (async function* () {
    let inThink = false
    let pending = ''
    for await (const chunk of source) {
      pending += chunk
      let out = ''
      for (;;) {
        if (inThink) {
          const end = pending.indexOf('</think>')
          if (end < 0) {
            pending = pending.slice(-8)
            break
          }
          pending = pending.slice(end + 8)
          inThink = false
        } else {
          const start = pending.indexOf('<think>')
          if (start < 0) {
            // keep a short tail in case a tag is split across chunks
            const safe = Math.max(0, pending.length - 7)
            out += pending.slice(0, safe)
            pending = pending.slice(safe)
            break
          }
          out += pending.slice(0, start)
          pending = pending.slice(start + 7)
          inThink = true
        }
      }
      if (out) yield out
    }
    if (!inThink && pending) yield pending
  })()
}
