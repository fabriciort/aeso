import type { Mexa, Visual } from '@/lib/formation/schema'
import type { Ordem } from './visual/Blocos'
import type { Interact } from './visual/Stage'

// O "Mexa": o aluno manipula o modelo até chegar ao estado de sucesso que o
// conteúdo descreve em dados. Cada tipo de manipulação é um pequeno jogo de
// regras: estado inicial, o que um toque faz, quando está feito e como fica
// resolvido ("Me mostre").

export type Kind = 'blocos' | 'digitos' | 'classes' | 'separar' | 'etiquetas' | 'vizinho' | 'deslizar' | 'ordem' | 'mostre'

export interface MexaState {
  kind: Kind
  counts?: Record<Ordem, number>
  /** Quadro: digit or class value per column / class. */
  slots?: (number | null)[]
  /** Cards still to place, and the selected one (index in tray). */
  tray?: number[]
  sel?: number | null
  seps?: number[]
  placed?: Record<number, number>
  pick?: number | null
  drag?: number
  order?: string[]
  /** Increments on each wrong try (shakes the stage). */
  wrong: number
  /** Short feedback under the instruction. */
  note?: string
  done: boolean
  shown?: boolean
}

const ORDENS: Ordem[] = ['unidades', 'dezenas', 'centenas', 'milhares']
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const num = (v: unknown) => (typeof v === 'number' ? v : undefined)
const arr = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : undefined)

export function kindOf(card: Mexa): Kind {
  const e = card.visual.estado
  const ok = card.acao.sucesso
  switch (card.visual.modelo) {
    case 'blocos':
      return ORDENS.some((o) => o in ok) ? 'blocos' : 'mostre'
    case 'quadro-posicional':
      if (arr(e.cartoes) && arr(e.classes) && arr(ok.grupos)) return 'classes'
      if (arr(e.algarismos) && arr<unknown[]>(ok.grupos)?.every(Array.isArray)) return 'separar'
      if (arr(e.algarismos) && num(ok.numero) !== undefined) return 'digitos'
      return 'mostre'
    case 'reta':
      if (card.acao.tipo === 'deslizar' && num(ok.numero) !== undefined) return 'deslizar'
      if (num(ok.vizinho) !== undefined && arr(e.escolhas)) return 'vizinho'
      if (num(ok.posicao) !== undefined || arr(ok.posicoes)) return 'etiquetas'
      return 'mostre'
    case 'livre':
      return arr(e.fichas) && arr(ok.ordem) ? 'ordem' : 'mostre'
    default:
      return 'mostre'
  }
}

/** Labels to place on the line and where each one goes. */
function labelsOf(card: Mexa): number[] {
  const e = card.visual.estado
  const ok = card.acao.sucesso
  if (num(ok.posicao) !== undefined) return [num(e.etiquetaSolta) ?? (ok.posicao as number)]
  return arr<number>(e.etiquetas) ?? arr<number>(ok.posicoes) ?? []
}

function targetOf(card: Mexa, label: number): number {
  const ok = card.acao.sucesso
  return num(ok.posicao) ?? label
}

export function initMexa(card: Mexa): MexaState {
  const kind = kindOf(card)
  const e = card.visual.estado
  const base: MexaState = { kind, wrong: 0, done: false }
  switch (kind) {
    case 'blocos':
      return { ...base, counts: { milhares: num(e.milhares) ?? 0, centenas: num(e.centenas) ?? 0, dezenas: num(e.dezenas) ?? 0, unidades: num(e.unidades) ?? 0 } }
    case 'digitos': {
      const digits = (arr<number | null>(e.algarismos) ?? []).filter((d): d is number => d !== null)
      const cols = arr<string>(e.casas)?.length ?? digits.length
      return { ...base, tray: digits, sel: 0, slots: Array(cols).fill(null) }
    }
    case 'classes':
      return { ...base, tray: arr<number>(e.cartoes) ?? [], sel: 0, slots: (arr<string>(e.classes) ?? []).map(() => null) }
    case 'separar':
      return { ...base, seps: [] }
    case 'etiquetas':
      return { ...base, placed: {}, pick: labelsOf(card)[0] ?? null }
    case 'vizinho':
      return { ...base, pick: null }
    case 'deslizar':
      return { ...base, drag: num(e.numero) ?? num(e.de) ?? 0 }
    case 'ordem':
      return { ...base, order: [] }
    default:
      return base
  }
}

/** The finished state ("Me mostre"). */
export function solveMexa(card: Mexa, st: MexaState): MexaState {
  const ok = card.acao.sucesso
  const e = card.visual.estado
  const done = { ...st, done: true, shown: true, note: undefined }
  switch (st.kind) {
    case 'blocos':
      return { ...done, counts: { ...st.counts!, ...(ok as Partial<Record<Ordem, number>>) } }
    case 'digitos': {
      const d = String(ok.numero).split('').map(Number)
      const cols = st.slots!.length
      return { ...done, tray: [], slots: [...Array(Math.max(0, cols - d.length)).fill(null), ...d] }
    }
    case 'classes':
      return { ...done, tray: [], slots: arr<number>(ok.grupos) }
    case 'separar': {
      const groups = ok.grupos as number[][]
      const seps: number[] = []
      let at = -1
      for (const g of groups.slice(0, -1)) seps.push((at += g.length))
      return { ...done, seps }
    }
    case 'etiquetas':
      return { ...done, placed: Object.fromEntries(labelsOf(card).map((l) => [l, targetOf(card, l)])), pick: null }
    case 'vizinho':
      return { ...done, pick: ok.vizinho as number }
    case 'deslizar':
      return { ...done, drag: ok.numero as number }
    case 'ordem':
      return { ...done, order: [...(ok.ordem as string[])] }
    default:
      void e
      return done
  }
}

const NOTE_WRONG = 'Ainda não. Tente de novo.'

/** What the stage shows and how a touch changes the state. */
export function mexaStage(card: Mexa, st: MexaState, set: (s: MexaState) => void): { visual: Visual; interact?: Interact; tray?: { items: string[]; sel: number | null; onPick: (i: number) => void } } {
  const e = card.visual.estado
  const ok = card.acao.sucesso
  const visual = (estado: Record<string, unknown>): Visual => ({ ...card.visual, estado })
  const lock = st.done

  switch (st.kind) {
    case 'blocos': {
      const c = st.counts!
      const next: Record<Ordem, Ordem | null> = { unidades: 'dezenas', dezenas: 'centenas', centenas: 'milhares', milhares: null }
      const canTap = (o: Ordem) => !lock && next[o] !== null && c[o] >= 10
      return {
        // The frame of 10 only helps while the loose pieces are the ones being grouped.
        visual: visual({ ...e, ...c, tamanhoGrupo: (num(e.unidades) ?? 0) >= 10 && c.unidades <= 10 ? e.tamanhoGrupo : undefined }),
        interact: {
          blocos: {
            canTap,
            onTap: (o) => {
              if (!canTap(o)) return
              const up = next[o]!
              const counts = { ...c, [o]: c[o] - 10, [up]: c[up] + 1 }
              const done = ORDENS.filter((k) => k in ok).every((k) => counts[k] === ok[k])
              set({ ...st, counts, done, note: undefined })
            },
          },
        },
      }
    }
    case 'digitos':
    case 'classes': {
      const slots = st.slots!
      const tray = st.tray!
      const target = st.kind === 'digitos' ? String(ok.numero).split('').map(Number) : (ok.grupos as number[])
      const onSlot = (i: number) => {
        if (lock) return
        const s2 = [...slots]
        const t2 = [...tray]
        if (s2[i] !== null) {
          t2.push(s2[i] as number)
          s2[i] = null
        } else if (st.sel !== null && st.sel !== undefined && t2[st.sel] !== undefined) {
          s2[i] = t2[st.sel]
          t2.splice(st.sel, 1)
        } else return
        const full = s2.every((v) => v !== null) || t2.length === 0
        const placed = st.kind === 'digitos' ? s2.filter((v) => v !== null) : s2
        const right = full && eq(st.kind === 'digitos' ? s2.slice(s2.length - target.length) : placed, target) && (st.kind === 'classes' || s2.slice(0, s2.length - target.length).every((v) => v === null))
        set({ ...st, slots: s2, tray: t2, sel: t2.length ? 0 : null, done: right, wrong: full && !right ? st.wrong + 1 : st.wrong, note: full && !right ? NOTE_WRONG : undefined })
      }
      const shown = st.kind === 'classes' && st.done ? { ...e, numero: ok.numero } : e
      return {
        visual: visual(shown),
        interact: { quadro: st.kind === 'digitos' ? { filled: slots, onSlot: lock ? undefined : onSlot, wrong: Boolean(st.note) } : { classValues: slots, onClass: lock ? undefined : onSlot, wrong: Boolean(st.note) } },
        tray: { items: tray.map(String), sel: st.sel ?? null, onPick: (i) => !lock && set({ ...st, sel: i }) },
      }
    }
    case 'separar': {
      const digits = arr<number>(e.algarismos) ?? []
      const groups = ok.grupos as number[][]
      const onGap = (i: number) => {
        if (lock) return
        const seps = st.seps!.includes(i) ? st.seps!.filter((x) => x !== i) : [...st.seps!, i].sort((a, b) => a - b)
        const cut: number[][] = []
        let from = 0
        for (const s of [...seps, digits.length - 1]) {
          cut.push(digits.slice(from, s + 1))
          from = s + 1
        }
        const right = eq(cut, groups)
        const tooMany = !right && seps.length >= groups.length - 1
        set({ ...st, seps, done: right, wrong: tooMany ? st.wrong + 1 : st.wrong, note: tooMany ? 'Conte três a partir da direita.' : undefined })
      }
      return { visual: card.visual, interact: { quadro: { seps: st.seps, onGap: lock ? undefined : onGap } } }
    }
    case 'etiquetas': {
      const labels = labelsOf(card)
      const placed = st.placed!
      const loose = labels.filter((l) => placed[l] === undefined)
      const { etiquetas: _a, etiquetaSolta: _b, ...rest } = e
      void _a
      void _b
      return {
        visual: visual(rest),
        interact: {
          reta: {
            placed,
            loose,
            selectedTag: st.pick,
            onTag: lock ? undefined : (l) => set({ ...st, pick: l }),
            onPick: lock
              ? undefined
              : (v) => {
                  const label = st.pick
                  if (label === null || label === undefined) return
                  const p2 = { ...placed, [label]: v }
                  const right = v === targetOf(card, label)
                  const remaining = labels.filter((l) => p2[l] !== targetOf(card, l))
                  const done = remaining.length === 0
                  set({ ...st, placed: p2, pick: right ? (remaining.find((l) => p2[l] === undefined) ?? remaining[0] ?? null) : label, done, wrong: right ? st.wrong : st.wrong + 1, note: right ? undefined : 'Conte os intervalos de novo.' })
                },
          },
        },
      }
    }
    case 'vizinho': {
      const choices = arr<number>(e.escolhas) ?? []
      const from = (arr<number>(e.marcas) ?? []).find((m) => !choices.includes(m))
      return {
        visual: card.visual,
        interact: {
          reta: {
            selected: st.pick,
            wrong: Boolean(st.note),
            arcs: st.pick !== null && st.pick !== undefined && from !== undefined ? [{ from, to: st.pick }] : [],
            onPick: lock
              ? undefined
              : (v) => {
                  const pick = choices.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), choices[0])
                  const right = pick === ok.vizinho
                  set({ ...st, pick, done: right, wrong: right ? st.wrong : st.wrong + 1, note: right ? undefined : 'Compare as duas distâncias.' })
                },
          },
        },
      }
    }
    case 'deslizar': {
      const de = num(e.de) ?? 0
      const ate = num(e.ate) ?? 10
      const lo = de + (num(e.unidadeDe) ?? 0)
      const hi = de + (num(e.unidadeAte) ?? ate - de)
      const meio = num(e.meio) ?? (de + ate) / 2
      const v = st.drag ?? lo
      const { numero: _n, ...rest } = e
      void _n
      return {
        visual: visual(rest),
        interact: {
          reta: {
            dragValue: v,
            dragRange: [lo, hi],
            arcs: [{ from: v, to: v >= meio ? ate : de }],
            onDrag: lock ? undefined : (d) => d !== st.drag && set({ ...st, drag: d, note: undefined }),
            onRelease: lock
              ? undefined
              : () => {
                  const target = ok.numero as number
                  if (v === target) set({ ...st, done: true, note: undefined })
                  else if (v > target) set({ ...st, wrong: st.wrong + 1, note: 'Passou. Volte devagar.' })
                },
          },
        },
      }
    }
    case 'ordem': {
      const order = st.order!
      const target = ok.ordem as string[]
      return {
        visual: card.visual,
        interact: {
          livre: {
            order,
            wrong: Boolean(st.note),
            onFicha: lock
              ? undefined
              : (f) => {
                  const o2 = order.includes(f) ? order.filter((x) => x !== f) : [...order, f]
                  const full = o2.length === target.length
                  const right = full && eq(o2, target)
                  set({ ...st, order: o2, done: right, wrong: full && !right ? st.wrong + 1 : st.wrong, note: full && !right ? NOTE_WRONG : undefined })
                },
          },
        },
      }
    }
    default:
      return { visual: card.visual }
  }
}

/** The gesture, said plainly, for a student who has not found it yet. */
export const GESTO: Record<Kind, string | null> = {
  blocos: 'Toque nas peças com a borda tracejada.',
  digitos: 'Toque num algarismo e depois na casa dele.',
  classes: 'Toque num grupo e depois na classe dele.',
  separar: 'Toque entre dois algarismos para pôr um ponto.',
  etiquetas: 'Toque na reta, onde a etiqueta vai.',
  vizinho: 'Toque numa das duas marcas.',
  deslizar: 'Arraste o ponto pela reta.',
  ordem: 'Toque nas fichas, na ordem.',
  mostre: null,
}
