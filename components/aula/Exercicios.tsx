'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Lightbulb } from 'lucide-react'
import type { Gerador, Item } from '@/lib/formation/schema'
import { rng } from '@/lib/formation/rng'
import { getLesson } from '@/lib/math/curriculum'
import { saveDiagnostico } from '@/lib/math/formation-progress'
import { speak } from '@/lib/observatory/voice'
import { getPreferences } from '@/lib/preferences'
import { som } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { Display, Keypad, sameAnswer } from './Keypad'
import { Rich, plain } from './Rich'
import { Stage, hasStage } from './visual/Stage'

// "Sua vez": exercícios dos geradores, do mais fácil ao mais difícil, até o
// aluno mostrar que sabe. Errar abre uma dica de cada vez (a ideia, o
// primeiro passo, a resolução); acertar sem ajuda é o que conta para o
// domínio. Quem já sabe passa rápido: um acerto de primeira por gerador
// basta, e o próximo exercício vem sozinho. Quem errou naquele gerador
// precisa de dois acertos seguidos. No diagnóstico de entrada, nada de
// dicas: só registrar.

export type Primary = (label: string | null, enabled: boolean, run?: () => void) => void

type Status = 'answer' | 'right' | 'wrong' | 'reveal' | 'registered'

interface Diagnostico {
  alvo: string
  gerador: string
  habilidade: string
}

export function Exercicios({ geradores, roteiro, onPrimary, onReady }: { geradores: Gerador[]; roteiro?: readonly Diagnostico[]; onPrimary: Primary; onReady: () => void }) {
  const diagnostic = geradores.length > 0 && geradores.every((g) => g.id.startsWith('diagnostico-'))
  const seed = useRef(Math.floor(Math.random() * 1e9))
  const counter = useRef(0)
  const [gi, setGi] = useState(0)
  const [streak, setStreak] = useState<number[]>(() => geradores.map(() => 0))
  const [missed, setMissed] = useState<boolean[]>(() => geradores.map(() => false))
  const [item, setItem] = useState<Item>(() => geradores[0].gerar(rng(seed.current)))
  const [input, setInput] = useState('')
  const [wrongOptions, setWrongOptions] = useState<number[]>([])
  const [chosen, setChosen] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>('answer')
  const [hints, setHints] = useState(0)
  const [results, setResults] = useState<Record<string, boolean>>({})
  const [finished, setFinished] = useState(false)
  const gerador = geradores[gi]
  /** First-try answers in a row needed on generator i: 1, or 2 after a miss on it. */
  const need = (i: number) => (diagnostic ? 1 : missed[i] ? 2 : 1)
  const miss = () => setMissed((m) => m.map((v, i) => (i === gi ? true : v)))

  const newItem = useCallback(
    (g: Gerador, previous?: Item) => {
      let it: Item
      let tries = 0
      do {
        counter.current += 1
        it = g.gerar(rng(seed.current + counter.current * 7919))
      } while (previous && it.enunciado === previous.enunciado && ++tries < 6)
      setItem(it)
      setInput('')
      setWrongOptions([])
      setChosen(null)
      setHints(0)
      setStatus('answer')
    },
    [],
  )

  useEffect(() => {
    if (getPreferences().voice && !finished) speak(item.fala ?? plain(item.enunciado), 'exercicio')
  }, [item, finished])

  const answered = (right: boolean, wrongAnswer?: string) => {
    if (diagnostic) {
      setResults((r) => ({ ...r, [gerador.id]: right && hints === 0 }))
      setStatus('registered')
      return
    }
    if (right) {
      const firstTry = hints === 0 && !wrongOptions.length && status === 'answer'
      setStatus('right')
      setStreak((s) => s.map((v, i) => (i === gi ? (firstTry ? v + 1 : 0) : v)))
      if (!firstTry) miss()
      som('certo')
      return
    }
    void wrongAnswer
    miss()
    som('erro')
    const next = hints + 1
    if (next >= 3) {
      setHints(3)
      setStatus('reveal')
      setStreak((s) => s.map((v, i) => (i === gi ? 0 : v)))
    } else {
      setHints(next)
      setStatus('wrong')
    }
  }

  const check = () => {
    if (!input) return
    const right = sameAnswer(input, item.resposta)
    answered(right, input)
    if (!right && !diagnostic) setInput('')
  }

  const choose = (i: number) => {
    if (status === 'right' || status === 'reveal' || status === 'registered' || wrongOptions.includes(i)) return
    setChosen(i)
    const right = i === item.resposta
    if (!right && !diagnostic) setWrongOptions((w) => [...w, i])
    answered(right, String(i))
  }

  const advance = () => {
    // Mastery: enough first-try answers on this generator moves on.
    const done = streak[gi] >= need(gi)
    if (done || diagnostic) {
      if (gi + 1 < geradores.length) {
        setGi(gi + 1)
        newItem(geradores[gi + 1])
      } else {
        setFinished(true)
        if (diagnostic && roteiro) {
          const byAlvo: Record<string, boolean> = {}
          for (const r of roteiro) byAlvo[r.alvo] = Boolean(results[r.gerador])
          saveDiagnostico(byAlvo)
        }
        onReady()
      }
    } else newItem(gerador, item)
  }

  // After a right answer the next exercise comes by itself (a tap is faster).
  const advanceRef = useRef(advance)
  advanceRef.current = advance
  useEffect(() => {
    if (status !== 'right' && status !== 'registered') return
    const t = setTimeout(() => advanceRef.current(), status === 'right' ? 1100 : 700)
    return () => clearTimeout(t)
  }, [status, item])

  // The bottom button: Conferir while answering, Próximo after.
  const isNumber = item.formato !== 'escolha'
  useEffect(() => {
    if (finished) onPrimary(null, true)
    else if (status === 'answer' || status === 'wrong') onPrimary(isNumber ? 'Conferir' : 'Escolha uma opção', isNumber && Boolean(input), check)
    else onPrimary('Próximo', true, advance)
  })

  const totalNeed = geradores.length
  const got = finished ? totalNeed : gi + (diagnostic ? (status === 'registered' ? 1 : 0) : Math.min(1, streak[gi] / need(gi)))

  if (finished) return <Final diagnostic={diagnostic} roteiro={roteiro} results={results} />

  const visual = hasStage(item.visual) ? item.visual : null
  const feedback =
    status === 'right' ? 'Isso.' : status === 'registered' ? 'Anotado.' : status === 'wrong' ? 'Ainda não.' : status === 'reveal' ? 'Veja a resolução.' : null

  return (
    <div className="flex h-full flex-col gap-3" data-resposta={process.env.NODE_ENV === 'development' ? String(item.resposta) : undefined}>
      <div className="h-[3px] overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={totalNeed} aria-valuenow={got} aria-label="Domínio">
        <motion.div className="h-full rounded-full bg-white/70" initial={false} animate={{ width: `${(got / totalNeed) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} />
      </div>

      {visual && (
        <div className="relative min-h-[110px] flex-1">
          <Stage visual={visual} />
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={counter.current + ':' + gi} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className={cn('flex flex-col gap-3', !visual && 'flex-1 justify-center')}>
          <p className={cn('font-medium leading-snug text-white', visual ? 'text-[19px]' : 'text-[22px]')}>
            <Rich text={item.enunciado} />
          </p>

          <AnimatePresence initial={false}>
            {(feedback || hints > 0) && (
              <motion.div key={status + hints} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                {feedback && <p className={cn('text-[17px] font-semibold', status === 'right' ? 'text-white' : status === 'registered' ? 'text-white/70' : 'text-rose-200')}>{feedback}</p>}
                {hints > 0 && status !== 'right' && (
                  <p className="mt-1 flex gap-2 text-[16px] leading-snug text-white/75">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#f6b74e]" />
                    <span>
                      <Rich text={item.dicas[Math.min(hints, 3) - 1]} />
                    </span>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {item.formato === 'escolha' ? (
            <div className="flex flex-col gap-2">
              {(item.opcoes ?? []).map((o, i) => {
                const isRight = i === item.resposta
                const showRight = (status === 'right' || status === 'reveal') && isRight
                const isWrong = wrongOptions.includes(i)
                const picked = diagnostic && chosen === i
                return (
                  <motion.button
                    key={o + i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => choose(i)}
                    disabled={isWrong || status === 'right' || status === 'reveal' || status === 'registered'}
                    className={cn(
                      'focus-ring flex min-h-[52px] items-center gap-3 rounded-2xl border px-4 py-2.5 text-left text-[17px] transition-colors',
                      showRight ? 'border-white bg-white text-black' : isWrong ? 'border-rose-400/40 text-rose-200/70' : picked ? 'border-white/60 bg-white/[0.1] text-white' : 'border-white/15 bg-white/[0.04] text-white hover:border-white/30',
                    )}
                  >
                    <span className="flex-1">
                      <Rich text={o} />
                    </span>
                    {showRight && <Check className="h-5 w-5 shrink-0" />}
                  </motion.button>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Display value={status === 'reveal' ? String(item.resposta) : input} state={status === 'right' ? 'right' : status === 'reveal' ? 'right' : status === 'wrong' && !input ? 'wrong' : null} />
              {(status === 'answer' || status === 'wrong') && <Keypad value={input} onChange={setInput} onEnter={check} />}
            </div>
          )}

          {!diagnostic && (status === 'answer' || status === 'wrong') && hints < 3 && (
            <button onClick={() => setHints((h) => Math.min(3, h + 1))} className="focus-ring mx-auto flex h-9 items-center gap-1.5 rounded-full px-3 text-[14px] text-white/55 hover:text-white">
              <Lightbulb className="h-4 w-4" /> {hints === 0 ? 'Dica' : 'Outra dica'}
            </button>
          )}
          {diagnostic && status === 'answer' && (
            <button onClick={() => answered(false)} className="focus-ring mx-auto flex h-9 items-center rounded-full px-3 text-[14px] text-white/55 hover:text-white">
              Não sei
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Final({ diagnostic, roteiro, results }: { diagnostic: boolean; roteiro?: readonly Diagnostico[]; results: Record<string, boolean> }) {
  if (!diagnostic || !roteiro) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} className="grid h-16 w-16 place-items-center rounded-full bg-white text-black">
          <Check className="h-8 w-8" strokeWidth={2.6} />
        </motion.span>
        <p className="text-[24px] font-semibold text-white">Você domina isto.</p>
      </div>
    )
  }
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {roteiro.map((r, i) => {
        const ok = results[r.gerador]
        return (
          <motion.div key={r.alvo} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 border-t border-white/[0.06] py-3 first:border-t-0">
            <span className="min-w-0 flex-1 text-[17px] text-white/90">{getLesson(r.alvo)?.lesson.title ?? r.habilidade}</span>
            <span className={cn('shrink-0 rounded-full px-3 py-1 text-[14px]', ok ? 'bg-white text-black' : 'border border-white/20 text-white/70')}>{ok ? 'Já sabe' : 'Ver a aula'}</span>
          </motion.div>
        )
      })}
    </div>
  )
}
