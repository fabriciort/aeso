'use client'

import { useId } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { expressaoDe, termo, tipoDe, type Peca } from './azulejos-pecas'

export type { Peca }

// Azulejos algébricos (U14): o quadradinho vale 1, a barra vale x (o lado
// comprido é o x, que não sabemos quanto mede) e o quadrado grande vale x².
// Juntar os do mesmo tipo é somar termos semelhantes: 3 barras são 3x. Uma
// barra e um quadradinho nunca viram uma peça só (2x + 3 não é 5x).
//
// No Mexa "agrupar", as peças começam misturadas; um toque numa peça junta
// todas as do mesmo tipo, com a contagem embaixo.


export interface AzulejosState {
  /** As peças, na ordem em que aparecem (misturadas). Aceita "-" no lugar de "−". */
  pecas?: string[]
  /** A letra das barras e dos quadrados grandes (padrão "x"). */
  letra?: string
  /** Já aparecem juntas por tipo, com a contagem. */
  agrupado?: boolean
  /** Com as peças juntas, a expressão simplificada embaixo ("2x² + 3x + 1"). */
  mostraExpressao?: boolean
  /** A frase embaixo, no lugar da expressão. */
  rotulo?: string
  /** Mexa: tocar numa peça junta as do mesmo tipo. */
  agrupar?: boolean
  /** As peças soltas, em tantos montes iguais, com um vão entre eles (2(x + 3) são 2 montes de x + 3). */
  montes?: number
  /** Com as peças juntas, cada par de opostos (um x e um −x, um 1 e um −1) aparece riscado: vale zero. */
  cancela?: boolean
}

export interface AzulejosInteract {
  /** Tipos já juntados pelo aluno. */
  agrupados?: string[]
  onPeca?: (tipo: Peca) => void
  wrong?: boolean
}

// Each type sits next to its opposite: 3x beside −x.
const ORDEM: Peca[] = ['x²', '−x²', 'x', '−x', '1', '−1']
const COR: Record<string, string> = {
  'x²': '#c4b5fd',
  x: '#f6b74e',
  '1': '#e5e7eb',
}
const rose = '#fb7185'




export function Azulejos({ s, size, agrupados, onPeca, wrong }: { s: AzulejosState; size: { w: number; h: number } } & AzulejosInteract) {
  // Each stage moves its own pieces: the layout ids never meet another stage's.
  const grupo = useId()
  const letra = s.letra ?? 'x'
  const pecas = (s.pecas ?? []).map(tipoDe)
  const contar = (t: Peca) => pecas.filter((p) => p === t).length
  const juntos = new Set<string>(s.agrupado ? ORDEM : (agrupados ?? []))
  const tipos = ORDEM.filter((t) => pecas.includes(t))
  const grupos = tipos.filter((t) => juntos.has(t))
  const soltas = pecas.map((t, i) => ({ t, i })).filter(({ t }) => !juntos.has(t))
  // Unit size: a bar is 3 units long, a big square 3 × 3. Everything fits the stage width.
  const largura = (t: Peca) => (t.endsWith('x²') ? 3 : 1)
  const ocupado = pecas.reduce((w, t) => w + largura(t) + 0.35, 0) + tipos.length * 0.8 + Math.max(0, (s.montes ?? 1) - 1) * 0.8
  const linhas = Math.max(1, Math.ceil(ocupado / 13))
  const solto = Math.max(16, Math.min(34, (size.w - 32) / Math.min(13, ocupado), (size.h - 90) / (linhas * 3.6 + 0.6)))
  // Joined by type, the groups should stay in one row when that keeps the pieces readable (6x, 3 and −1 side by side).
  const juntas = pecas.reduce((w, t) => w + largura(t) + 0.2, 0) + Math.max(0, tipos.length - 1) * 0.9
  const nMontes = Math.max(1, Math.min(pecas.length, Math.round(s.montes ?? 1)))
  // The heaps too: 3(x − 2) reads as three heaps only when they share a row.
  const emMontes = nMontes > 1 ? pecas.reduce((w, t) => w + largura(t) + 0.35, 0) + (nMontes - 1) * 0.8 : 0
  const cabe = [juntas, emMontes].filter((w) => w > 0).map((w) => (size.w - 40) / w).filter((v) => v >= 18)
  const u = Math.min(solto, ...cabe)
  // Loose pieces split in equal heaps, in order (the content lists heap after heap).
  const montes = nMontes
  const porMonte = Math.ceil(pecas.length / montes)
  const fim = s.agrupado || (tipos.length > 0 && tipos.every((t) => juntos.has(t)))
  const expressao = expressaoDe(s.pecas ?? [], letra)
  // One group alone already says its count ("3x"): the same line again below adds nothing.
  const repetida = tipos.length === 1 && termo(tipos[0], contar(tipos[0]), letra) === expressao
  const legenda = s.rotulo ?? (fim && s.mostraExpressao && !repetida ? expressao : undefined)

  const oposto = (t: Peca) => (t.startsWith('−') ? t.slice(1) : `−${t}`) as Peca
  const riscadas = (t: Peca) => (s.cancela && juntos.has(t) && juntos.has(oposto(t)) ? Math.min(contar(t), contar(oposto(t))) : 0)

  const peca = (t: Peca, key: string, tocavel: boolean, riscada = false) => {
    const neg = t.startsWith('−')
    const k = t.replace('−', '')
    const w = k === 'x²' ? 3 * u : u
    const h = k === '1' ? u : 3 * u
    const nome = k === 'x²' ? `${letra}²` : k === 'x' ? letra : '1'
    return (
      <motion.button
        key={key}
        type="button"
        layout
        layoutId={key}
        disabled={!tocavel}
        onClick={tocavel ? () => onPeca!(t) : undefined}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        animate={{ opacity: riscada ? 0.3 : 1 }}
        className={cn('relative grid shrink-0 place-items-center rounded-[5px] border font-semibold leading-none', tocavel ? 'cursor-pointer' : 'cursor-default')}
        style={{
          width: w,
          height: h,
          fontSize: Math.max(11, u * 0.5),
          background: neg ? 'rgba(251,113,133,0.18)' : COR[k],
          borderColor: neg ? rose : 'rgba(0,0,0,0.35)',
          color: neg ? '#fecdd3' : '#05060a',
        }}
        aria-label={`${neg ? 'menos ' : ''}${nome}`}
      >
        {k === '1' && u < 22 ? '' : `${neg ? '−' : ''}${nome}`}
        {riscada && <span className="absolute inset-x-[-3px] top-1/2 h-[2px] -rotate-45 bg-white" />}
      </motion.button>
    )
  }

  return (
    <LayoutGroup id={grupo}>
      <motion.div
        className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 select-none"
        animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
        role="img"
        aria-label={`Azulejos: ${expressaoDe(s.pecas ?? [], letra)}`}
      >
        {grupos.length > 0 && (
          <div className="flex flex-wrap items-end justify-center" style={{ gap: u * 0.9 }}>
            {grupos.map((t) => {
              const n = pecas.filter((p) => p === t).length
              return (
                <div key={`g${t}`} className="flex flex-col items-center gap-1.5">
                  <div className="flex items-end" style={{ gap: u * 0.2 }}>
                    {pecas.map((p, i) => (p === t ? peca(p, `p${i}`, false, pecas.slice(0, i).filter((q) => q === t).length < riscadas(t)) : null))}
                  </div>
                  <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-[17px] font-semibold tabular-nums" style={{ color: t.startsWith('−') ? rose : COR[t] }}>
                    {termo(t, n, letra)}
                  </motion.span>
                </div>
              )
            })}
          </div>
        )}
        {soltas.length > 0 && (
          <div className="flex max-w-full flex-wrap items-end justify-center" style={{ columnGap: montes > 1 ? u * 1.1 : u * 0.35, rowGap: u * 0.35 }}>
            {Array.from({ length: montes }, (_, m) => (
              <div key={`m${m}`} className="flex flex-wrap items-end justify-center" style={{ gap: u * 0.35 }}>
                {soltas.filter(({ i }) => Math.floor(i / porMonte) === m).map(({ t, i }) => peca(t, `p${i}`, Boolean(onPeca)))}
              </div>
            ))}
          </div>
        )}
        {legenda && (
          <motion.p key={legenda} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-[24px] font-semibold tabular-nums text-white">
            {legenda}
          </motion.p>
        )}
      </motion.div>
    </LayoutGroup>
  )
}
