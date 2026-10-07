import { z } from 'zod'
import { getLab } from '@/lib/labs/catalog'
import { aiProvider, streamChat, AIError, type ChatMessage } from '@/lib/server/ai'
import { isMock } from '@/lib/server/http'
import { clientKey, rateLimit } from '@/lib/server/ratelimit'

export const maxDuration = 60

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(2000) }))
    .min(1)
    .max(16),
  context: z
    .object({
      view: z.enum(['inicio', 'ceu', 'laboratorios', 'laboratorio']).optional(),
      lab: z.string().max(60).optional(),
      step: z.string().max(60).optional(),
      /** Short, client-provided description of what is on screen. */
      state: z.string().max(600).optional(),
    })
    .default({}),
})

const PERSONA = `Você é a Vega, a guia do AESo, um observatório educacional de física e astronomia.
Fale português do Brasil, com "você", de forma calorosa, curta e precisa.
Regras:
- Respostas com no máximo 120 palavras, salvo se o aluno pedir mais.
- Ensine fazendo perguntas e dando pistas; nunca entregue a resposta de uma previsão, medição ou desafio antes de o aluno tentar.
- Use números com vírgula decimal e unidades. Não use LaTeX; escreva fórmulas em texto simples (ex.: δ ≈ (Rp/R★)²).
- Se não souber algo com segurança, diga isso. Não invente dados nem referências.
- Se a pergunta fugir de ciência e do estudo, traga a conversa de volta com gentileza.`

function contextPrompt(ctx: z.infer<typeof Body>['context']): string {
  const parts: string[] = []
  const lab = ctx.lab ? getLab(ctx.lab) : undefined
  if (lab) {
    parts.push(`O aluno está no laboratório "${lab.title}".`)
    const idx = lab.steps.findIndex((s) => s.id === ctx.step)
    const step = lab.steps[idx]
    if (step) parts.push(`Etapa ${idx + 1} de ${lab.steps.length}: "${step.title}". ${step.vega}`)
  } else if (ctx.view === 'ceu') {
    parts.push('O aluno está explorando o Céu: busca objetos, vê o céu interativo e observações do MAST.')
  } else if (ctx.view) {
    parts.push(`O aluno está na área "${ctx.view}" do Observatório.`)
  }
  if (ctx.state) parts.push(`O que está na tela agora: ${ctx.state}`)
  return parts.join('\n')
}

function textStream(chunks: AsyncIterable<string>): ReadableStream<Uint8Array> {
  const enc = new TextEncoder()
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const c of chunks) controller.enqueue(enc.encode(c))
      } catch (err) {
        console.error('[vega] stream', err)
        controller.enqueue(enc.encode('\n\n(Perdi a conexão no meio da resposta. Pode perguntar de novo?)'))
      } finally {
        controller.close()
      }
    },
  })
}

async function* mockAnswer(): AsyncGenerator<string> {
  const text =
    'Boa pergunta! Repare no fundo da queda de brilho: ele mostra quanta luz o planeta bloqueia. Se a queda for de cerca de 1,5 %, que fração do disco da estrela o planeta cobre? E qual seria então a razão entre os raios? (Resposta simulada: configure GROQ_API_KEY para conversar de verdade.)'
  for (const word of text.split(/(?<= )/)) {
    await new Promise((r) => setTimeout(r, 25))
    yield word
  }
}

const HEADERS = { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Pedido inválido' }, { status: 400 })

  const limit = rateLimit(`vega:${clientKey(req)}`, 20, 10 * 60_000)
  if (!limit.ok) {
    return Response.json(
      { error: `Você fez muitas perguntas seguidas. Tente de novo em ${Math.ceil(limit.retryAfter / 60)} min.` },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  if (isMock()) return new Response(textStream(mockAnswer()), { headers: HEADERS })
  if (!aiProvider()) {
    return Response.json({ error: 'A Vega ainda não está configurada neste ambiente.' }, { status: 503 })
  }

  const { messages, context } = parsed.data
  const chat: ChatMessage[] = [
    { role: 'system', content: `${PERSONA}\n\n${contextPrompt(context)}`.trim() },
    ...messages.slice(-10),
  ]
  try {
    // Generous budget: on reasoning models hidden thinking also counts as output.
    const stream = await streamChat(chat, { maxTokens: 1800, temperature: 0.5 })
    return new Response(textStream(stream), { headers: HEADERS })
  } catch (err) {
    console.error('[vega]', err)
    const busy = err instanceof AIError && err.status === 429
    return Response.json(
      { error: busy ? 'Estou com muitas conversas agora. Tente de novo em alguns segundos.' : 'Não consegui responder agora.' },
      { status: busy ? 429 : 502 },
    )
  }
}
