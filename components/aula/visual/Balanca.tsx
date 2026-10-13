'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import { cn } from '@/lib/utils'
import { contaPecas, equacaoDe, inclinacaoDe, pecasDe, relacaoDe, ladoTexto, type Lado, type PecaBalanca, type Prato } from './balanca-pratos'

export type { Prato }

// A balança de dois pratos (U15): uma equação é uma balança em equilíbrio.
// Cada caixa âmbar é um x (todas pesam o mesmo, e não sabemos quanto); cada
// peso cinza vale 1, e um peso rotulado ("10") vale o número escrito nele.
// Se os dois pratos pesam o mesmo, o braço fica reto; se não, o prato mais
// pesado desce.
//
// Para resolver, faz-se a mesma coisa dos dois lados: tirar o mesmo peso de
// cada prato, ou partir cada prato no mesmo número de grupos iguais e ficar
// com um grupo só. Tirar só de um lado inclina a balança.
//
// No Mexa "tirar", o aluno toca nas peças e elas saem; no Mexa "dividir", ele
// toca num grupo e fica só aquele grupo em cada prato.

export interface BalancaState {
  esquerda?: Prato
  direita?: Prato
  /** A letra das caixas (padrão "x"). */
  letra?: string
  /** O valor escondido de x: decide a inclinação (e o que aparece com `abrir`). */
  valor?: number
  /** Força a inclinação: o prato que desce, ou 'equilibrio'. */
  inclina?: 'esquerda' | 'direita' | 'equilibrio'
  /** Peças que saíram, apagadas e riscadas (não pesam). */
  riscadas?: { esquerda?: Prato; direita?: Prato }
  /** As caixas mostram o valor de x dentro. */
  abrir?: boolean
  /** Cada prato partido em tantos grupos iguais, um grupo aceso. */
  dividir?: number
  /** O grupo aceso com `dividir` (padrão 0, o de baixo). */
  grupo?: number
  /** A equação embaixo ("2x + 3 = 11"). */
  mostraEquacao?: boolean
  /** Inclinada, a equação usa > ou < (sem isto, ≠). */
  inequacao?: boolean
  /** A frase embaixo, no lugar da equação. */
  rotulo?: string
  /** Mexa: tocar numa peça tira a peça. */
  tirar?: boolean
}

export interface BalancaInteract {
  /** Peças que o aluno já tirou (ids de `pecasDe`). */
  fora?: string[]
  onPeca?: (id: string) => void
  /** Mexa "dividir": o grupo escolhido (null: nenhum ainda). */
  escolhido?: number | null
  onGrupo?: (g: number) => void
  /** Cresce a cada erro: o palco treme. */
  tremer?: number
}

const amber = '#f6b74e'
const gray = '#e5e7eb'
const sky = '#7dd3fc'
const rose = '#fb7185'
const LADOS: Lado[] = ['esquerda', 'direita']
const ANGULO = 8
const mola = { type: 'spring' as const, stiffness: 70, damping: 9, mass: 1 }
const fmt = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',').replace('-', '−')

interface Posta {
  p: PecaBalanca
  riscada: boolean
  /** Center x (from the pan's center), bottom y (up from the pan floor), size. */
  x: number
  y: number
  w: number
  h: number
}

interface Moldura {
  g: number
  x: number
  y: number
  w: number
  h: number
}

/** Lays the pieces out on a pan: rows from the floor up, centered; with groups, one framed block per group. */
function arrumar(pecas: PecaBalanca[], riscadas: PecaBalanca[], k: number, bx: number, largura: number) {
  const u = Math.round(bx * 0.62)
  const gap = Math.max(2, Math.round(bx * 0.12))
  const dim = (p: PecaBalanca) => (p.tipo === 'x' ? { w: bx, h: bx } : p.tipo === '1' ? { w: u, h: u } : { w: Math.round(u * (String(p.valor).length > 2 ? 2.2 : 1.7)), h: Math.round(u * 1.3) })
  const itens: Posta[] = []
  const molduras: Moldura[] = []
  let base = 0
  // Flows a list into rows of at most `maxW`, from `base` upward.
  const fluir = (lista: { p: PecaBalanca; riscada: boolean }[], maxW: number) => {
    let i = 0
    const inicio = base
    let largo = 0
    while (i < lista.length) {
      const fila: { p: PecaBalanca; riscada: boolean; w: number; h: number }[] = []
      let w = 0
      while (i < lista.length) {
        const d = dim(lista[i].p)
        if (fila.length && w + gap + d.w > maxW) break
        w += (fila.length ? gap : 0) + d.w
        fila.push({ ...lista[i], ...d })
        i++
      }
      const h = Math.max(...fila.map((f) => f.h))
      let x = -w / 2
      for (const f of fila) {
        itens.push({ p: f.p, riscada: f.riscada, x: x + f.w / 2, y: base, w: f.w, h: f.h })
        x += f.w + gap
      }
      largo = Math.max(largo, w)
      base += h + gap
    }
    return { inicio, fim: base - gap, largo }
  }
  const ordem = (l: PecaBalanca[]) => [...l.filter((p) => p.tipo === 'x'), ...l.filter((p) => p.tipo === 'p'), ...l.filter((p) => p.tipo === '1')]
  if (k <= 1) {
    const numeros = (l: PecaBalanca[]) => l.filter((p) => p.tipo !== 'x')
    fluir([...pecas.filter((p) => p.tipo === 'x').map((p) => ({ p, riscada: false })), ...riscadas.filter((p) => p.tipo === 'x').map((p) => ({ p, riscada: true }))], largura)
    fluir([...ordem(numeros(pecas)).map((p) => ({ p, riscada: false })), ...ordem(numeros(riscadas)).map((p) => ({ p, riscada: true }))], largura)
  } else {
    const pad = 5
    for (let g = 0; g < k; g++) {
      const doGrupo = ordem(pecas.filter((p) => p.grupo === g))
      if (!doGrupo.length) continue
      base += pad
      const r = fluir(
        doGrupo.map((p) => ({ p, riscada: false })),
        largura - 2 * pad,
      )
      molduras.push({ g, x: -(r.largo / 2 + pad), y: r.inicio - pad, w: r.largo + 2 * pad, h: r.fim - r.inicio + 2 * pad })
      base = r.fim + pad + 6
    }
    if (riscadas.length) fluir(ordem(riscadas).map((p) => ({ p, riscada: true })), largura)
  }
  const altura = Math.max(0, ...itens.map((it) => it.y + it.h), ...molduras.map((m) => m.y + m.h))
  return { itens, molduras, altura }
}

export function Balanca({ s, size, fora, onPeca, escolhido, onGrupo, tremer = 0 }: { s: BalancaState; size: { w: number; h: number } } & BalancaInteract) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (tremer > 0) void controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }, [tremer, controls])

  const letra = s.letra ?? 'x'
  const k = Math.max(1, Math.round(s.dividir ?? 1))
  const mexaDividir = k > 1 && (onGrupo !== undefined || escolhido !== undefined)
  // Static groups light one up; in the Mexa, all are bright until one is chosen (then the others leave).
  const aceso = k > 1 ? (mexaDividir ? (escolhido ?? null) : (s.grupo ?? 0)) : null
  const saiu = new Set(fora ?? [])

  const pratos = LADOS.map((lado) => {
    const todas = pecasDe(s[lado], lado, k)
    const vivas = todas.filter((p) => !saiu.has(p.id) && !(mexaDividir && aceso !== null && p.grupo !== aceso))
    const riscadas = pecasDe(s.riscadas?.[lado], lado).map((p) => ({ ...p, id: `r${p.id}`, grupo: -1 }))
    return { lado, todas, vivas, riscadas, conta: contaPecas(vivas) }
  })
  const [E, D] = pratos
  const inc = inclinacaoDe(E.conta, D.conta, s.valor, s.inclina)
  const equacao = equacaoDe(E.conta, D.conta, letra, inc, s.inequacao)
  const rel = relacaoDe(inc, s.inequacao)
  const mostraEq = !s.rotulo && s.mostraEquacao

  // Geometry: two pans side by side under the beam, the stand between them.
  const textoH = s.rotulo || mostraEq ? 50 : 0
  const Hb = Math.max(160, size.h - textoH)
  const cx = size.w / 2
  const P = Math.max(110, Math.min(size.w / 2 - 14, 250))
  const A = Math.min(size.w / 2 - P / 2 - 4, Math.max(P / 2 + 8, Math.min(size.w * 0.26, 200)))
  const queda = A * Math.sin((ANGULO * Math.PI) / 180)
  const largura = P - 16
  const agulha = 16
  const folga = 26
  const fixo = 8 + agulha + folga + 12 + 2 * queda + 10 + 14
  let bx = 54
  // The size comes from all the pieces the state starts with, so it does not jump while the student takes some out.
  for (; bx > 14; bx--) {
    const alto = Math.max(...pratos.map((p) => arrumar(p.todas, p.riscadas, k, bx, largura).altura))
    if (bx <= P * 0.27 && fixo + alto <= Hb) break
  }
  const lay = pratos.map((p) => arrumar(p.vivas, p.riscadas, k, bx, largura))
  const pilha = Math.max(...pratos.map((p) => arrumar(p.todas, p.riscadas, k, bx, largura).altura), 20)
  const pendurado = Math.max(pilha + folga, 54)
  const H = fixo - folga + pendurado
  // The balance and the line under it sit together, centered on the stage.
  const topo = 0
  const pivo = topo + 8 + agulha
  const chao = pivo + pendurado + 12 + queda + 10
  const giro = inc === 'esquerda' ? -ANGULO : inc === 'direita' ? ANGULO : 0
  const dy = A * Math.sin((giro * Math.PI) / 180)
  const dx = A * (1 - Math.cos((giro * Math.PI) / 180))
  const fonte = (bx: number) => Math.max(11, Math.round(bx * 0.55))

  const peca = (it: Posta, lado: Lado) => {
    const { p } = it
    const left = P / 2 + it.x - it.w / 2
    const top = pendurado - it.y - it.h
    const tocavel = Boolean(onPeca) && !it.riscada
    const ehX = p.tipo === 'x'
    const aberta = ehX && s.abrir
    const rotulo = ehX ? (aberta && typeof s.valor === 'number' ? fmt(s.valor) : letra) : String(p.valor)
    const apagada = it.riscada || (aceso !== null && !mexaDividir && p.grupo !== aceso)
    return (
      <motion.button
        key={p.id}
        type="button"
        disabled={!tocavel}
        onClick={tocavel ? () => onPeca!(p.id) : undefined}
        initial={{ opacity: 0, x: left, y: top - 24, scale: 0.6 }}
        animate={{ opacity: apagada ? 0.3 : 1, x: left, y: top, scale: 1 }}
        exit={{ opacity: 0, y: top - 48, scale: 0.5, transition: { duration: 0.35 } }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className={cn('absolute left-0 top-0 grid place-items-center overflow-hidden border font-semibold leading-none', tocavel ? 'cursor-pointer' : 'cursor-default', mexaDividir && 'pointer-events-none')}
        style={{
          width: it.w,
          height: it.h,
          borderRadius: ehX ? 5 : p.tipo === 'p' ? `${Math.round(it.h * 0.45)}px ${Math.round(it.h * 0.45)}px 4px 4px` : 4,
          background: ehX ? amber : gray,
          borderColor: 'rgba(0,0,0,0.35)',
          color: '#05060a',
          fontSize: ehX ? fonte(it.w) : Math.max(10, Math.round(it.h * (p.tipo === 'p' ? 0.48 : 0.58))),
          boxShadow: tocavel ? '0 0 0 1.5px rgba(255,255,255,0.65)' : undefined,
        }}
        aria-label={`${ehX ? (aberta ? `caixa ${letra}, vale ${rotulo}` : `caixa ${letra}`) : `peso ${p.valor}`} no prato da ${lado}`}
      >
        {/* The lid line makes the box read as a box. */}
        {ehX && <span className="absolute inset-x-0 top-[22%] h-px bg-black/25" />}
        {(ehX || it.h >= 14) && (
          <motion.span key={aberta ? 'v' : 'x'} initial={aberta ? { opacity: 0, scale: 0.4 } : false} animate={{ opacity: 1, scale: 1 }} className={cn(ehX && !aberta && 'font-serif italic', 'relative tabular-nums')} style={ehX ? { marginTop: it.h * 0.12 } : undefined}>
            {rotulo}
          </motion.span>
        )}
        {it.riscada && <span className="absolute inset-x-[-3px] top-1/2 h-[2px] -rotate-45 bg-white" />}
      </motion.button>
    )
  }

  return (
    <motion.div className="flex h-full w-full flex-col items-center justify-center gap-3 select-none" animate={controls} role="img" aria-label={`Balança: ${s.rotulo ?? equacao}`}>
      <div className="relative w-full shrink-0" style={{ height: Math.min(Hb, H) }}>
        {/* Stand: the pillar from the pivot to the base, and a mark for level. */}
        <div className="absolute rounded-full bg-white/25" style={{ left: cx - 3, top: pivo, width: 6, height: chao - pivo }} />
        <div className="absolute rounded-t-[10px] bg-white/25" style={{ left: cx - 38, top: chao, width: 76, height: 12 }} />
        <div className="absolute bg-white/40" style={{ left: cx - 0.75, top: topo + 1, width: 1.5, height: 6 }} />
        {/* Beam and needle turn together around the pivot. */}
        <motion.div className="absolute" initial={false} animate={{ rotate: giro }} transition={mola} style={{ left: cx - A - 7, top: pivo - 3, width: 2 * A + 14, height: 6, transformOrigin: '50% 50%' }}>
          <div className="h-full w-full rounded-full" style={{ background: 'rgba(229,231,235,0.85)' }} />
          <motion.div
            className="absolute"
            animate={{ backgroundColor: inc === 'equilibrio' ? sky : 'rgba(255,255,255,0.6)' }}
            style={{ left: A + 7 - 3, bottom: 3, width: 6, height: agulha, clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }}
          />
        </motion.div>
        <div className="absolute rounded-full" style={{ left: cx - 5, top: pivo - 5, width: 10, height: 10, background: gray, boxShadow: '0 0 0 2px #000' }} />
        {pratos.map((pr, i) => {
          const sinal = i === 0 ? -1 : 1
          const l = lay[i]
          return (
            <motion.div
              key={pr.lado}
              className="absolute"
              initial={false}
              animate={{ x: -sinal * dx, y: sinal * dy }}
              transition={mola}
              style={{ left: cx + sinal * A - P / 2, top: pivo, width: P, height: pendurado + 12 }}
            >
              <svg className="absolute inset-0 overflow-visible" width={P} height={pendurado + 12} aria-hidden>
                <path d={`M${P / 2} 0 L3 ${pendurado} M${P / 2} 0 L${P - 3} ${pendurado}`} stroke="rgba(255,255,255,0.32)" strokeWidth={1.25} fill="none" />
                <path d={`M0 ${pendurado} Q${P / 2} ${pendurado + 22} ${P} ${pendurado} Z`} fill="rgba(125,211,252,0.10)" stroke="rgba(229,231,235,0.75)" strokeWidth={1.5} strokeLinejoin="round" />
                <circle cx={P / 2} cy={0} r={2.5} fill={gray} />
              </svg>
              {l.molduras.map((m) => {
                const acesa = aceso === m.g
                const tocavel = Boolean(onGrupo) && aceso === null
                return (
                  <motion.button
                    key={`m${m.g}`}
                    type="button"
                    disabled={!tocavel}
                    onClick={tocavel ? () => onGrupo!(m.g) : undefined}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: !mexaDividir && !acesa ? 0.4 : 1, x: P / 2 + m.x, y: pendurado - m.y - m.h }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className={cn('absolute left-0 top-0 rounded-[8px] border-[1.5px]', tocavel ? 'z-10 cursor-pointer border-dashed' : 'cursor-default', acesa ? 'border-solid' : 'border-dashed')}
                    style={{ width: m.w, height: m.h, borderColor: acesa ? sky : 'rgba(255,255,255,0.5)', background: acesa ? 'rgba(125,211,252,0.08)' : 'transparent' }}
                    aria-label={`grupo ${m.g + 1}`}
                  />
                )
              })}
              <AnimatePresence initial={false}>{l.itens.map((it) => peca(it, pr.lado))}</AnimatePresence>
            </motion.div>
          )
        })}
      </div>
      {s.rotulo ? (
        <motion.p key={s.rotulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-4 text-center text-[22px] font-semibold leading-tight text-white">
          {s.rotulo}
        </motion.p>
      ) : mostraEq ? (
        <p className="flex items-baseline gap-[0.35em] whitespace-nowrap text-[26px] font-semibold tabular-nums text-white">
          <span>{ladoTexto(E.conta, letra)}</span>
          <motion.span key={rel} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ color: rel === '=' ? undefined : rel === '≠' ? rose : sky }}>
            {rel}
          </motion.span>
          <span>{ladoTexto(D.conta, letra)}</span>
        </p>
      ) : null}
    </motion.div>
  )
}
