'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUp, Square, X } from 'lucide-react'
import { getLab } from '@/lib/labs/catalog'
import { useRouter } from '@/lib/observatory/router'
import { useVega } from '@/lib/observatory/vega-context'
import { speak } from '@/lib/observatory/voice'
import { getPreferences } from '@/lib/preferences'
import { cn } from '@/lib/utils'
import { VegaOrb } from './Nav'

// Vega: the AI guide. A side panel (desktop) or bottom sheet (mobile) that
// always knows which area/lab/step the student is in.

interface Msg {
  role: 'user' | 'assistant'
  content: string
  error?: boolean
}

const SUGGESTIONS: Record<string, string[]> = {
  default: ['O que é um exoplaneta?', 'Como os telescópios medem distâncias?', 'O que é uma curva de luz?'],
  ceu: ['O que estou vendo nesta imagem?', 'Por que o céu muda no infravermelho?', 'O que é o MAST?'],
  imagine: ['Por que o brilho cai?', 'Dá para ver um planeta como a Terra assim?'],
  preveja: ['Me dá uma pista sem contar a resposta', 'Por que a área importa?'],
  entenda: ['De onde vem esse quadrado?', 'O que é escurecimento de borda?'],
  observe: ['Por que os pontos estão espalhados?', 'Por que empilhar os trânsitos ajuda?'],
  meca: ['Como sei se o modelo encaixou?', 'O que é razão de raios?'],
  'e-se': ['Como monto essa conta?', 'Por que estrelas pequenas ajudam?'],
  conclua: ['Como os astrônomos medem a massa do planeta?', 'O que é um Júpiter quente?'],
}

export default function Vega() {
  const { open, setOpen, ctx, prompt, clearPrompt } = useVega()
  const { route } = useRouter()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const view = route.area
  const lab = ctx.lab ? getLab(ctx.lab) : undefined
  const stepIndex = lab ? lab.steps.findIndex((s) => s.id === ctx.step) : -1
  const where = lab ? (stepIndex >= 0 ? `${lab.title} · etapa ${stepIndex + 1}` : lab.title) : view === 'ceu' ? 'Céu' : view === 'laboratorios' ? 'Laboratórios' : 'Início'
  const stepAsk = stepIndex >= 0 ? lab?.steps[stepIndex].ask : undefined
  const suggestions = stepAsk ?? (lab?.slug === 'exoplaneta' ? SUGGESTIONS[ctx.step ?? ''] : undefined) ?? (view === 'ceu' ? SUGGESTIONS.ceu : SUGGESTIONS.default)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 250)
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && open && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    setInput('')
    const history: Msg[] = [...messages.filter((m) => !m.error), { role: 'user', content: q }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setBusy(true)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const res = await fetch('/api/vega', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: history.slice(-12).map(({ role, content }) => ({ role, content: content.slice(0, 2000) })),
          context: { view, lab: ctx.lab, step: ctx.step, state: ctx.state?.slice(0, 600) },
        }),
      })
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error ?? 'Não consegui responder agora.')
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((m) => [...m.slice(0, -1), { role: 'assistant', content: acc }])
      }
      if (!acc.trim()) throw new Error('A resposta veio vazia. Tente perguntar de outro jeito.')
      // With the voice on, the Vega also answers out loud.
      if (getPreferences().voice) speak(acc, 'vega-chat')
    } catch (e) {
      if (controller.signal.aborted) {
        setMessages((m) => (m[m.length - 1]?.content ? m : m.slice(0, -1)))
      } else {
        setMessages((m) => [...m.slice(0, -1), { role: 'assistant', content: e instanceof Error ? e.message : 'Erro', error: true }])
      }
    } finally {
      setBusy(false)
    }
  }

  // Questions asked from elsewhere ("Pedir uma dica à Vega").
  useEffect(() => {
    if (open && prompt) {
      clearPrompt()
      send(prompt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prompt])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-label="Vega, sua guia"
            initial={{ opacity: 0, y: 40, x: 0, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="glass-strong fixed inset-x-2 bottom-2 top-[18vh] z-[61] flex flex-col overflow-hidden rounded-[28px] lg:inset-x-auto lg:bottom-4 lg:right-4 lg:top-4 lg:w-[400px]"
          >
            <header className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
              <VegaOrb size={34} pulse={busy} />
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-white">Vega</p>
                <p className="truncate text-[12px] text-white/45">Sua guia · {where}</p>
              </div>
              <button onClick={() => setOpen(false)} className="focus-ring grid h-8 w-8 place-items-center rounded-full text-white/50 hover:bg-white/10 hover:text-white" aria-label="Fechar Vega">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <p className="text-[15px] leading-relaxed text-white/75">
                    Oi! Eu sou a Vega. Posso te dar pistas, explicar conceitos e conversar sobre o que está na sua tela. Não vou te dar as respostas
                    prontas, mas vou te ajudar a chegar nelas.
                  </p>
                  <div className="flex flex-col items-start gap-2">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => send(s)} className="chip focus-ring text-left">
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('max-w-[88%] whitespace-pre-wrap text-[14.5px] leading-relaxed', m.role === 'user' ? 'ml-auto rounded-[20px] rounded-br-md bg-white/[0.1] px-4 py-2.5 text-white' : m.error ? 'text-rose-200/80' : 'text-white/85')}
                >
                  {m.content || (busy && i === messages.length - 1 ? <TypingDots /> : null)}
                </motion.div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="border-t border-white/[0.06] p-3"
            >
              <div className="flex items-end gap-2 rounded-[20px] border border-white/10 bg-white/[0.04] p-1.5 pl-4 focus-within:border-white/25">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  onChange={(e) => setInput(e.target.value.slice(0, 1500))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send(input)
                    }
                  }}
                  placeholder="Pergunte à Vega…"
                  className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent py-2 text-[14.5px] text-white placeholder:text-white/30 focus:outline-none"
                  aria-label="Mensagem para a Vega"
                />
                {busy ? (
                  <button type="button" onClick={() => abortRef.current?.abort()} className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white/15 text-white" aria-label="Parar resposta">
                    <Square className="h-3.5 w-3.5" fill="currentColor" />
                  </button>
                ) : (
                  <button type="submit" disabled={!input.trim()} className="focus-ring grid h-9 w-9 place-items-center rounded-full bg-white text-black transition active:scale-95 disabled:bg-white/10 disabled:text-white/30" aria-label="Enviar">
                    <ArrowUp className="h-4 w-4" strokeWidth={2.4} />
                  </button>
                )}
              </div>
              <p className="mt-2 px-2 text-[11px] text-white/30">A Vega pode errar. Confira os números importantes.</p>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function TypingDots() {
  return (
    <span className="inline-flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-white/60" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </span>
  )
}
