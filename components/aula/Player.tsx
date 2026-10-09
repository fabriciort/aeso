'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Check, Hand, NotebookPen, PencilLine, X } from 'lucide-react'
import type { Aposta, Aula, Cartao, Caderno as CadernoCard, Anote as AnoteCard, Gerador, Mexa, Opcao, PassoAPasso, Visual, Linha } from '@/lib/formation/schema'
import { markLessonDone, saveCard } from '@/lib/math/formation-progress'
import { haptic } from '@/lib/observatory/immersive'
import { useVega, useVegaScreen } from '@/lib/observatory/vega-context'
import { speak, stopSpeaking, unlockVoice } from '@/lib/observatory/voice'
import { getPreferences } from '@/lib/preferences'
import { cn } from '@/lib/utils'
import { VegaOrb } from '@/components/observatory/Nav'
import { LabSettings } from '@/components/observatory/Settings'
import { Exercicios, type Primary } from './Exercicios'
import { LinhaTex } from './Fit'
import { Display, Keypad, sameAnswer } from './Keypad'
import { GESTO, initMexa, mexaStage, solveMexa, type MexaState } from './mexa'
import { Rich, plain } from './Rich'
import { Stage, hasStage, type Interact } from './visual/Stage'

// O player de aulas da Formação: um story. Um cartão por vez, o palco em
// cima (o mesmo de um cartão para o outro, para as peças se moverem), o texto
// embaixo, um botão só. O botão diz o que acontece agora (Continuar,
// Conferir, Próximo passo, Anotei) e só acende quando o cartão está pronto.

interface CardState {
  mexa?: MexaState
  /** Aposta: the option chosen last, and all the ones tried. */
  choice?: number | null
  tried?: number[]
  /** Passo a passo: current step, wrong options in it, solved, notebook. */
  passo?: number
  passoWrong?: number[]
  passoSolved?: boolean
  passoMostra?: Visual
  passoExplica?: string
  lines?: Linha[]
  /** Full-body cards (caderno, sua-vez) report when they are done. */
  ready?: boolean
}

interface Diagnostico {
  alvo: string
  gerador: string
  habilidade: string
}

export function Player({
  aula,
  getGerador,
  roteiro,
  start,
  onExit,
}: {
  aula: Aula
  getGerador: (id: string) => Gerador | undefined
  roteiro?: readonly Diagnostico[]
  start: number
  onExit: () => void
}) {
  const total = aula.cartoes.length
  const [index, setIndex] = useState(() => Math.min(Math.max(0, start), total - 1))
  const [dir, setDir] = useState(1)
  const [states, setStates] = useState<Record<number, CardState>>({})
  const card = aula.cartoes[index]
  const st = states[index] ?? {}
  const set = useCallback((patch: CardState) => setStates((s) => ({ ...s, [index]: { ...s[index], ...patch } })), [index])
  const isLast = index === total - 1

  // Full-body cards drive the bottom button themselves.
  const [custom, setCustom] = useState<{ label: string; enabled: boolean } | null>(null)
  const customRun = useRef<(() => void) | undefined>(undefined)
  const onPrimary: Primary = useCallback((label, enabled, run) => {
    customRun.current = run
    setCustom((c) => (label === null ? (c === null ? c : null) : c && c.label === label && c.enabled === enabled ? c : { label, enabled }))
  }, [])

  const { setOpen } = useVega()
  useVegaScreen({ aula: aula.id, state: `Cartão ${index + 1} de ${total} (${card.tipo}): ${plain(cardText(card)).slice(0, 400)}` })

  // A lesson is a fixed, non-scrolling screen.
  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    return () => {
      html.style.overflow = prev
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    saveCard(aula.id, index)
    if (isLast) markLessonDone(aula.id)
    if (getPreferences().voice) {
      const said = cardSpeech(card)
      if (said) speak(said, `aula:${index}`)
    } else stopSpeaking()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(total - 1, i))
      if (next === index) return
      setDir(next > index ? 1 : -1)
      setCustom(null)
      customRun.current = undefined
      setIndex(next)
      haptic(6)
    },
    [index, total],
  )

  // ---------------------------------------------------------------- what the card shows

  let visual: Visual | null = null
  let interact: Interact | undefined
  let tray: ReturnType<typeof mexaStage>['tray']
  let ready = true
  let label = isLast ? 'Concluir' : 'Continuar'
  let run: () => void = () => (isLast ? finish() : go(index + 1))

  switch (card.tipo) {
    case 'gancho':
    case 'ideia':
    case 'fecho':
      visual = card.visual ?? null
      break
    case 'mexa': {
      const m = st.mexa ?? initMexa(card)
      const out = mexaStage(card, m, (next) => {
        if (next.done && !m.done) haptic([8, 40, 8])
        set({ mexa: next })
      })
      visual = out.visual
      interact = out.interact
      tray = out.tray
      ready = m.done
      break
    }
    case 'aposta': {
      const chosen = st.choice ?? null
      visual = (chosen !== null && card.opcoes[chosen].mostra) || card.visual
      ready = chosen !== null
      break
    }
    case 'passo': {
      visual = st.passoMostra ?? card.visual
      const p = st.passo ?? 0
      ready = p >= card.passos.length - 1 && Boolean(st.passoSolved)
      if (st.passoSolved && p < card.passos.length - 1) {
        label = 'Próximo passo'
        ready = true
        run = () => set({ passo: p + 1, passoSolved: false, passoWrong: [], passoExplica: undefined })
      }
      break
    }
    case 'anote':
      label = isLast ? 'Concluir' : 'Anotei'
      break
    case 'caderno':
    case 'sua-vez':
      ready = Boolean(st.ready)
      if (custom) {
        label = custom.label
        ready = custom.enabled
        run = () => customRun.current?.()
      }
      break
  }

  function finish() {
    markLessonDone(aula.id)
    haptic([10, 50, 10])
    onExit()
  }

  const primary = useRef(run)
  primary.current = ready ? run : () => {}

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight' || e.key === 'Enter') primary.current()
      else if (e.key === 'ArrowLeft') go(index - 1)
      else if (e.key === 'Escape') onExit()
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, onExit])

  const full = card.tipo === 'anote' || card.tipo === 'caderno' || card.tipo === 'sua-vez'
  const staged = !full && hasStage(visual)

  return (
    <div className="relative mx-auto flex h-[100svh] max-w-[720px] flex-col overflow-hidden">
      {/* Top: one segment per card, close, title, Vega. */}
      <div className="relative z-30 shrink-0 pb-2 pt-[max(env(safe-area-inset-top),10px)]">
        <ol className="flex gap-[3px]" aria-label="Cartões">
          {aula.cartoes.map((_, i) => (
            <li key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.span className="block h-full rounded-full bg-white/80" initial={false} animate={{ scaleX: i <= index ? 1 : 0 }} style={{ originX: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} />
            </li>
          ))}
        </ol>
        <div className="mt-2 flex items-center gap-1">
          <button onClick={onExit} className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white active:scale-95" aria-label="Sair da aula">
            <X className="h-5 w-5" />
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-[14px] font-medium text-white/60">{aula.titulo}</p>
          <LabSettings />
          <button onClick={() => setOpen(true)} className="focus-ring grid h-10 w-10 place-items-center rounded-full transition hover:bg-white/10 active:scale-95" aria-label="Perguntar à Vega">
            <VegaOrb size={26} />
          </button>
        </div>
      </div>

      {/* Middle: the stage and the card. */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        {staged && (
          <div className="relative flex min-h-[150px] flex-1 flex-col">
            <div className="relative min-h-0 flex-1">
              <Stage visual={visual as Visual} interact={interact} />
            </div>
            {tray && <Tray {...tray} />}
            {card.tipo === 'passo' && <Notebook lines={st.lines ?? []} />}
          </div>
        )}
        <div className={cn('relative', full ? 'min-h-0 flex-1' : staged ? 'max-h-[58%] shrink-0 overflow-y-auto pt-3' : 'flex flex-1 flex-col justify-center')}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={index}
              custom={dir}
              className={cn(full && 'h-full')}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 36, filter: 'blur(8px)' }),
                center: { opacity: 1, x: 0, filter: 'blur(0px)', transitionEnd: { filter: 'none' } },
                exit: (d: number) => ({ opacity: 0, x: d * -36, filter: 'blur(8px)' }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            >
              <CardBody card={card} st={st} set={set} staged={staged} getGerador={getGerador} roteiro={roteiro} onPrimary={onPrimary} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom: back and the one button. */}
      <div className="relative z-30 flex shrink-0 items-center gap-3 pb-[max(env(safe-area-inset-bottom),14px)] pt-3">
        <button
          onClick={() => go(index - 1)}
          disabled={index === 0}
          aria-label="Cartão anterior"
          className="focus-ring grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 transition active:scale-95 disabled:opacity-30"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <motion.button
          whileTap={ready ? { scale: 0.97 } : undefined}
          onClick={() => {
            if (!ready) return
            if (getPreferences().voice) unlockVoice()
            run()
          }}
          aria-disabled={!ready}
          className={cn(
            'focus-ring flex h-14 flex-1 items-center justify-center gap-2 rounded-full text-[17px] font-medium transition-colors duration-300',
            ready ? 'bg-white text-black' : 'bg-white/[0.07] text-white/35',
          )}
        >
          {isLast && ready && label === 'Concluir' && <Check className="h-5 w-5" />}
          {label}
        </motion.button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------- text of a card

function cardText(c: Cartao): string {
  switch (c.tipo) {
    case 'aposta':
      return c.pergunta
    case 'passo':
      return c.problema
    case 'anote':
      return `${c.titulo}: ${c.definicao}`
    case 'caderno':
      return c.instrucao
    case 'sua-vez':
      return 'Exercícios (Sua vez).'
    default:
      return c.texto
  }
}

function cardSpeech(c: Cartao): string | null {
  switch (c.tipo) {
    case 'anote':
      return `${c.titulo}. ${plain(c.definicao)}`
    case 'sua-vez':
      return null
    case 'aposta':
    case 'passo':
    case 'caderno':
      return c.fala ?? plain(cardText(c))
    default:
      return c.fala ?? plain(c.texto)
  }
}

// ---------------------------------------------------------------- bodies

function CardBody({
  card,
  st,
  set,
  staged,
  getGerador,
  roteiro,
  onPrimary,
}: {
  card: Cartao
  st: CardState
  set: (p: CardState) => void
  staged: boolean
  getGerador: (id: string) => Gerador | undefined
  roteiro?: readonly Diagnostico[]
  onPrimary: Primary
}) {
  switch (card.tipo) {
    case 'gancho':
    case 'ideia':
    case 'fecho':
      return <Texto text={card.texto} big={!staged} />
    case 'mexa':
      return <MexaBody card={card} st={st} set={set} />
    case 'aposta':
      return <ApostaBody card={card} st={st} set={set} />
    case 'passo':
      return <PassoBody card={card} st={st} set={set} />
    case 'anote':
      return <AnoteBody card={card} />
    case 'caderno':
      return <CadernoBody card={card} onPrimary={onPrimary} onReady={() => set({ ready: true })} />
    case 'sua-vez': {
      const gs = card.geradores.map(getGerador).filter((g): g is Gerador => Boolean(g))
      if (!gs.length) return <Texto text="Os exercícios desta aula ainda estão sendo preparados." />
      return <Exercicios geradores={gs} roteiro={roteiro} onPrimary={onPrimary} onReady={() => set({ ready: true })} />
    }
  }
}

function Texto({ text, big }: { text: string; big?: boolean }) {
  return (
    <p className={cn('font-medium leading-[1.3] tracking-[-0.01em] text-white/85 [&_strong]:text-white', big ? 'text-[26px]' : 'text-[21px]')}>
      <Rich text={text} />
    </p>
  )
}

function MexaBody({ card, st, set }: { card: Mexa; st: CardState; set: (p: CardState) => void }) {
  const m = st.mexa ?? initMexa(card)
  // After a few seconds without a touch, say the gesture.
  const [idle, setIdle] = useState(false)
  const touch = JSON.stringify(m)
  useEffect(() => {
    setIdle(false)
    const t = setTimeout(() => setIdle(true), 6000)
    return () => clearTimeout(t)
  }, [touch])
  const gesto = GESTO[m.kind]
  return (
    <div className="flex flex-col gap-2">
      <Texto text={card.texto} />
      <AnimatePresence mode="wait" initial={false}>
        {m.done ? (
          <motion.p key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-[17px] font-semibold text-white">
            <Check className="h-5 w-5" /> {m.shown ? 'Assim.' : 'Isso.'}
          </motion.p>
        ) : m.note ? (
          <motion.p key={`n${m.wrong}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[16px] text-rose-200">
            {m.note}
          </motion.p>
        ) : (
          <motion.p key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[16px] leading-snug text-white/55">
            <Rich text={card.acao.instrucao} />
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!m.done && idle && gesto && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 overflow-hidden text-[15px] text-white/70">
            <Hand className="h-4 w-4 shrink-0" /> {gesto}
          </motion.p>
        )}
      </AnimatePresence>
      {!m.done && (
        <button onClick={() => set({ mexa: solveMexa(card, m) })} className={cn('focus-ring -ml-3 self-start rounded-full px-3 py-1.5 text-[14px] transition hover:text-white', m.kind === 'mostre' ? 'text-white' : 'text-white/45')}>
          Me mostre
        </button>
      )}
    </div>
  )
}

function Options({ opcoes, picked, wrong, onPick, reveal }: { opcoes: Opcao[]; picked?: number | null; wrong?: number[]; onPick: (i: number) => void; reveal?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      {opcoes.map((o, i) => {
        const isPicked = picked === i
        const isWrong = wrong?.includes(i) || (isPicked && !o.certa)
        const isRight = (isPicked || reveal) && o.certa
        return (
          <motion.button
            key={i}
            whileTap={{ scale: 0.98 }}
            onClick={() => onPick(i)}
            className={cn(
              'focus-ring flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 py-2.5 text-left text-[17px] leading-snug transition-colors duration-300',
              isRight ? 'border-white bg-white text-black' : isWrong ? (isPicked ? 'border-rose-300/70 bg-rose-400/[0.08] text-rose-50' : 'border-rose-300/25 text-white/45') : 'border-white/15 bg-white/[0.04] text-white hover:border-white/30',
            )}
          >
            <span className="flex-1">
              <Rich text={o.texto} />
            </span>
            {isRight && <Check className="h-5 w-5 shrink-0" />}
          </motion.button>
        )
      })}
    </div>
  )
}

function Explica({ text, good }: { text: string; good?: boolean }) {
  return (
    <motion.p key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={cn('text-[16px] leading-snug', good ? 'text-white/80' : 'text-rose-100/90')}>
      <Rich text={text} />
    </motion.p>
  )
}

function ApostaBody({ card, st, set }: { card: Aposta; st: CardState; set: (p: CardState) => void }) {
  const chosen = st.choice ?? null
  const pick = (i: number) => {
    haptic(card.opcoes[i].certa ? [8, 40, 8] : 12)
    set({ choice: i, tried: [...new Set([...(st.tried ?? []), i])] })
    const prefs = getPreferences()
    if (prefs.voice) speak(card.opcoes[i].explica, 'aposta')
  }
  return (
    <div className="flex flex-col gap-3">
      <Texto text={card.pergunta} />
      <Options opcoes={card.opcoes} picked={chosen} onPick={pick} reveal={chosen !== null} />
      <AnimatePresence mode="wait">{chosen !== null && <Explica key={chosen} text={card.opcoes[chosen].explica} good={card.opcoes[chosen].certa} />}</AnimatePresence>
    </div>
  )
}

function PassoBody({ card, st, set }: { card: PassoAPasso; st: CardState; set: (p: CardState) => void }) {
  const p = st.passo ?? 0
  const passo = card.passos[p]
  const pick = (i: number) => {
    if (st.passoSolved) return
    const o = passo.opcoes[i]
    if (o.certa) {
      haptic([8, 40, 8])
      set({ passoSolved: true, passoMostra: o.mostra ?? st.passoMostra, passoExplica: o.explica, lines: [...(st.lines ?? []).slice(0, p), passo.linha] })
    } else {
      haptic(12)
      set({ passoWrong: [...new Set([...(st.passoWrong ?? []), i])], passoMostra: o.mostra ?? st.passoMostra, passoExplica: o.explica })
    }
  }
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[15px] leading-snug text-white/55">
        <Rich text={card.problema} />
      </p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={p} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }} className="flex flex-col gap-3">
          <p className="flex items-baseline gap-2 text-[21px] font-medium leading-[1.3] text-white">
            {card.passos.length > 1 && <span className="shrink-0 text-[14px] font-medium tabular-nums text-white/40">{p + 1}/{card.passos.length}</span>}
            <span>
              <Rich text={passo.pergunta} />
            </span>
          </p>
          <Options opcoes={passo.opcoes} wrong={st.passoWrong} picked={st.passoSolved ? passo.opcoes.findIndex((o) => o.certa) : null} onPick={pick} />
          <AnimatePresence mode="wait">{st.passoExplica && <Explica key={st.passoExplica} text={st.passoExplica} good={st.passoSolved} />}</AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/** The on-screen notebook of the passo a passo: one line per solved step. */
function Notebook({ lines }: { lines: Linha[] }) {
  if (!lines.length) return null
  return (
    <div className="caderno mt-2 flex flex-col gap-1 rounded-2xl px-4 py-3">
      <AnimatePresence initial={false}>
        {lines.map((l, i) => (
          <motion.div key={i + l.tex} initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-white">
            <LinhaTex tex={l.tex} fala={l.fala} size={17} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function AnoteBody({ card }: { card: AnoteCard }) {
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <p className="flex items-center gap-2 text-[15px] text-white/55">
        <NotebookPen className="h-4 w-4" /> Copie no seu caderno
      </p>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="caderno flex flex-col gap-5 rounded-3xl p-5">
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-white">{card.titulo}</h2>
        <p className="text-[19px] leading-snug text-white/90 [&_strong]:text-white">
          <Rich text={card.definicao} />
        </p>
        <div className="py-1 text-white">
          <LinhaTex tex={card.exemplo.tex} fala={card.exemplo.fala} size={20} />
        </div>
        <p className="border-l-2 border-[#f6b74e] pl-3 text-[16px] leading-snug text-white/80">
          <Rich text={card.alerta} />
        </p>
      </motion.div>
    </div>
  )
}

function CadernoBody({ card, onPrimary, onReady }: { card: CadernoCard; onPrimary: Primary; onReady: () => void }) {
  const numeric = typeof card.resposta === 'number' || /^[\d.\s]+$/.test(String(card.resposta))
  const [value, setValue] = useState('')
  const [checked, setChecked] = useState<null | 'right' | 'wrong' | 'skip'>(null)
  const check = (skip = false) => {
    const right = !skip && (numeric ? sameAnswer(value, card.resposta) : norm(value) === norm(String(card.resposta)))
    setChecked(skip ? 'skip' : right ? 'right' : 'wrong')
    haptic(right ? [8, 40, 8] : 12)
    onReady()
  }
  useEffect(() => {
    if (!checked) onPrimary('Conferir', Boolean(value.trim()), () => check())
    else onPrimary(null, true)
  })

  return (
    <div className="flex h-full flex-col gap-4">
      <p className="flex items-center gap-2 pt-2 text-[15px] text-white/55">
        <PencilLine className="h-4 w-4" /> Resolva no papel
      </p>
      <p className="text-[21px] font-medium leading-[1.3] text-white/85 [&_strong]:text-white">
        <Rich text={card.instrucao} />
      </p>
      {!checked ? (
        <div className="mt-auto flex flex-col gap-2">
          {numeric ? (
            <>
              <Display value={value} />
              <Keypad value={value} onChange={setValue} onEnter={() => check()} />
            </>
          ) : (
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && value.trim() && check()}
              placeholder="Sua resposta"
              className="focus-ring h-[60px] rounded-2xl border border-white/15 bg-transparent px-4 text-center text-[24px] text-white placeholder:text-white/25"
            />
          )}
          <button onClick={() => check(true)} className="focus-ring mx-auto h-9 rounded-full px-3 text-[14px] text-white/50 hover:text-white">
            Ver a resolução
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <p className={cn('text-[18px] font-semibold', checked === 'right' ? 'text-white' : checked === 'wrong' ? 'text-rose-200' : 'text-white/70')}>
            {checked === 'right' ? 'Isso. Compare os passos.' : checked === 'wrong' ? `A resposta é ${fmtAnswer(card.resposta)}. Compare com o seu.` : 'Compare com o seu.'}
          </p>
          <div className="caderno flex min-h-0 flex-col gap-2 overflow-y-auto rounded-3xl p-5">
            {card.resolucao.map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }} animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }} transition={{ delay: 0.15 + i * 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="text-white">
                <LinhaTex tex={l.tex} fala={l.fala} size={18} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const norm = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
const fmtAnswer = (v: string | number) => (typeof v === 'number' ? v.toLocaleString('pt-BR') : v)

/** Cards to place (digits, class groups): tap one, then tap where it goes. */
function Tray({ items, sel, onPick }: { items: string[]; sel: number | null; onPick: (i: number) => void }) {
  return (
    <div className="flex min-h-[64px] flex-wrap items-center justify-center gap-3 pt-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((t, i) => (
          <motion.button
            key={`${t}-${i}`}
            layout
            type="button"
            onClick={() => onPick(i)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: sel === i ? -4 : 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            aria-pressed={sel === i}
            className={cn('h-14 min-w-14 rounded-2xl border px-4 text-[24px] font-semibold tabular-nums transition-colors', sel === i ? 'border-[#f6b74e] bg-[#f6b74e] text-black' : 'border-white/20 bg-white/[0.06] text-white')}
          >
            {t}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
