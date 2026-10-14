'use client'

import { useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { alpha, amber, clamp, Desenho, green, largura, rose, sky, useCena, type Prim } from './cena'
import { fmtNum } from './figura-geo'
import { favoraveisDe } from './contagem-geo'
import { bordaCaso, corCaso, linhaChance } from './Contagem'
import { casosDe, chancesDe, contarResultados, jogadasDe, pctTexto, resultadosDe, sortear, tipoSorteio, type SorteioState } from './sorteio-geo'

export type { SorteioState }

// O sorteio da U19: os casos possíveis (as faces do dado, a moeda, as bolas
// no saco, as cartas), com os favoráveis acesos e a chance escrita; e a
// simulação: jogar muitas vezes, as contagens crescem nas barras e a
// frequência relativa chega perto da chance (a linha tracejada). A
// simulação é determinística (a `semente` do estado). As contas ficam em
// sorteio-geo.ts.

export interface SorteioInteract {
  /** Mexa "favoráveis": um toque num caso. */
  onCaso?: (i: number) => void
  marcados?: number[]
  errado?: number | null
  /** Mexa "jogar": um botão joga 1, 10 ou 100 vezes. */
  onJogar?: (n: number) => void
  tremer?: number
}

const PECA = '#e5e7eb'
/** The dots of a die face, in units of the face (−1 to 1). */
const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.5, -0.5], [0.5, 0.5]],
  3: [[-0.5, -0.5], [0, 0], [0.5, 0.5]],
  4: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]],
  5: [[-0.5, -0.5], [0.5, -0.5], [0, 0], [-0.5, 0.5], [0.5, 0.5]],
  6: [[-0.5, -0.55], [0.5, -0.55], [-0.5, 0], [0.5, 0], [-0.5, 0.55], [0.5, 0.55]],
}
const quadrado = (cx: number, cy: number, s: number, r = s * 0.18) => {
  // A rounded square as a closed path: each corner a quarter circle in 4 pieces.
  const h = s / 2 - r
  const v: number[] = []
  ;[[h, -h, -90], [h, h, 0], [-h, h, 90], [-h, -h, 180]].forEach(([dx, dy, a0]) => {
    for (let q = 0; q <= 4; q++) {
      const a = ((a0 + q * 22.5) * Math.PI) / 180
      v.push(cx + dx + r * Math.cos(a), cy + dy + r * Math.sin(a))
    }
  })
  return v
}

function face(prims: Prim[], k: string, cx: number, cy: number, s: number, n: number, o: { fill: string; pip: string; op?: number; stroke?: string; sw?: number }) {
  prims.push({ k, t: 'path', v: quadrado(cx, cy, s), fechado: true, fill: o.fill, stroke: o.stroke ?? '#000', sw: o.sw ?? 1.5, op: o.op })
  ;(PIPS[n] ?? []).forEach(([px, py], j) => prims.push({ k: `${k}:p:${j}`, t: 'circle', v: [cx + px * s * 0.62, cy + py * s * 0.62, s * 0.09], fill: o.pip, op: o.op }))
}

interface Alvos {
  casos: { i: number; x: number; y: number; r: number }[]
}

/** Columns that make the pieces biggest in the box. */
function encaixe(n: number, w: number, h: number, razao: number, max: number): { cols: number; lado: number } {
  // Pieces never bigger than `max`; among the layouts that reach it, the one with fewer rows.
  let best = { cols: 1, lado: 0 }
  for (let c = 1; c <= n; c++) {
    const rows = Math.ceil(n / c)
    const lado = Math.min(w / c, h / rows / razao, max)
    if (lado >= best.lado - 0.01) best = { cols: c, lado }
  }
  return best
}

function montarCasos(s: SorteioState, W: number, H: number, it: SorteioInteract): { prims: Prim[]; alvos: Alvos } {
  const prims: Prim[] = []
  const topo: Prim[] = []
  const alvos: Alvos = { casos: [] }
  const tipo = tipoSorteio(s)
  const casos = casosDe(s)
  const N = casos.length
  const fav = favoraveisDe(casos, s.favoraveis)
  const marcando = it.marcados !== undefined
  const acesos = marcando ? it.marcados! : s.marcar ? [] : fav
  const mostraChance = marcando || s.chance === true
  const completa = s.chance === true && (!marcando || acesos.length === fav.length)
  // The room for the chance does not change while the student marks (the pieces never jump).
  const rodape = mostraChance ? (s.chance === true ? 56 : 36) : 0
  const sorteado = typeof s.sorteado === 'number' && s.sorteado >= 0 && s.sorteado < N ? s.sorteado : undefined
  const apaga = (i: number) => (sorteado !== undefined ? i !== sorteado : !marcando && completa && acesos.length > 0 && !acesos.includes(i))
  const bolas = tipo === 'bolas'
  const razao = tipo === 'lista' ? 1.4 : 1
  const pad = bolas ? 26 : 8
  const areaW = W - 2 * pad
  const areaH = H - rodape - 2 * pad - (bolas ? 8 : 0)
  const maxT = tipo === 'dado' ? 78 : tipo === 'moeda' ? 96 : bolas ? 44 : 64
  const { cols, lado } = encaixe(N, areaW, areaH, razao, maxT / 0.8)
  const rows = Math.ceil(N / cols)
  const t = Math.min(lado * 0.8, maxT)
  const passoX = Math.min(lado, t * 1.25)
  const passoY = passoX * razao
  const x0 = W / 2 - (passoX * (cols - 1)) / 2
  // The pieces and the chance under them sit together in the middle of the stage.
  const meiaPeca = tipo === 'lista' ? t * 0.65 : t / 2
  const alto = passoY * (rows - 1) + 2 * meiaPeca + (bolas ? 40 : 0)
  const topoBloco = Math.max(0, (H - alto - (mostraChance ? rodape + 12 : 0)) / 2)
  const y0 = topoBloco + (bolas ? 22 : 0) + meiaPeca
  const yChance = topoBloco + alto + 12 + (s.chance === true ? 30 : 18)
  if (bolas) {
    // The bag: a rounded outline around the balls, open at the top.
    const bw = passoX * cols + 22
    const bh = passoY * rows + 26
    const bx = W / 2 - bw / 2
    const by = y0 - passoY / 2 - 6
    prims.push({ k: 'saco', t: 'path', v: [bx + 10, by - 6, bx, by + 12, bx, by + bh - 14, bx + 14, by + bh, bx + bw - 14, by + bh, bx + bw, by + bh - 14, bx + bw, by + 12, bx + bw - 10, by - 6], fill: 'rgba(255,255,255,0.05)', stroke: 'rgba(255,255,255,0.45)', sw: 2 })
  }
  casos.forEach((c, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    // The last row is centred.
    const naLinha = row === rows - 1 ? N - row * cols : cols
    const cx = x0 + passoX * (col + (cols - naLinha) / 2)
    const cy = y0 + passoY * row - (i === sorteado ? 12 : 0)
    const aceso = acesos.includes(i)
    const errou = it.errado === i
    const op = apaga(i) ? 0.38 : 1
    const anel = errou ? rose : aceso ? amber : i === sorteado ? '#fff' : '#000'
    const sw = errou || aceso || i === sorteado ? 3.5 : 1.5
    const k = `c:${i}`
    if (tipo === 'dado') face(prims, k, cx, cy, t, i + 1, { fill: aceso ? amber : PECA, pip: '#111', op, stroke: anel, sw })
    else if (tipo === 'moeda') {
      prims.push({ k, t: 'circle', v: [cx, cy, t / 2], fill: alpha(corCaso(c.cor, amber), 0.9), stroke: anel === '#000' ? '#000' : anel, sw: sw + 1, op })
      prims.push({ k: `${k}:in`, t: 'circle', v: [cx, cy, t / 2 - 6], stroke: 'rgba(0,0,0,0.35)', sw: 1.5, op })
      topo.push({ k: `${k}:t`, t: 'text', v: [cx, cy], texto: c.nome, fs: clamp(t * 0.2, 12, 18), peso: 700, op })
    } else if (bolas) {
      prims.push({ k, t: 'circle', v: [cx, cy, t / 2], fill: corCaso(c.cor, PECA), stroke: anel === '#000' ? bordaCaso(c.cor) : anel, sw, op })
      prims.push({ k: `${k}:brilho`, t: 'circle', v: [cx - t * 0.16, cy - t * 0.16, t * 0.1], fill: 'rgba(255,255,255,0.55)', op })
    } else {
      const w = t
      const h = t * 1.3
      const cor = c.cor ? corCaso(c.cor, PECA) : PECA
      // A card: dark, with a coloured border (amber when lit) and the name in white.
      const borda = errou ? rose : aceso ? amber : i === sorteado ? '#fff' : cor
      prims.push({ k, t: 'path', v: [cx - w / 2, cy - h / 2, cx + w / 2, cy - h / 2, cx + w / 2, cy + h / 2, cx - w / 2, cy + h / 2], fechado: true, fill: alpha(aceso ? amber : cor, aceso ? 0.5 : 0.16), stroke: borda, sw: aceso || errou ? 3 : 2, op })
      topo.push({ k: `${k}:t`, t: 'text', v: [cx, cy], texto: c.nome, fs: clamp(Math.min((w - 6) / (c.nome.length * 0.6), t * 0.42), 10, 24), peso: 700, fill: c.cor && !aceso ? cor : '#fff', op })
    }
    alvos.casos.push({ i, x: cx, y: cy, r: Math.max(t * 0.6, 20) })
  })
  if (mostraChance) topo.push(...linhaChance('ch', W, yChance, acesos.length, N, { completa, simplificada: s.simplificada, porcentagem: s.porcentagem }))
  return { prims: [...prims, ...topo], alvos }
}

function montarSimulacao(s: SorteioState, W: number, H: number): Prim[] {
  const prims: Prim[] = []
  const topo: Prim[] = []
  const texto = (k: string, at: [number, number], t: string, o: Partial<Prim> = {}) => topo.push({ k, t: 'text', v: at, texto: t, ...o })
  const rs = resultadosDe(s)
  const n = jogadasDe(s) ?? 0
  const res = sortear(s, n)
  const cont = contarResultados(res, rs.length)
  const chances = chancesDe(s)
  const tipo = tipoSorteio(s)
  const cores = rs.map((r, i) => corCaso(r.cor, tipo === 'dado' ? sky : [amber, sky, green, rose][i % 4]))

  // The header: how many throws, and the last ones (the newest on the right).
  texto('n', [10, 14], `${fmtNum(n)} ${n === 1 ? 'jogada' : 'jogadas'}`, { anchor: 'start', fs: 16, peso: 700 })
  // The last results fit to the right of the count ("10.000 jogadas").
  const cabe = W - 20 - largura(`${fmtNum(n)} jogadas`, 16) * 1.05 - 12
  const ts = clamp((W - 130) / 10 - 4, 14, 22)
  const ult = Math.max(0, Math.min(10, res.length, Math.floor((cabe + 4) / (ts + 4))))
  for (let q = 0; q < ult; q++) {
    const j = res.length - ult + q
    const cx = W - 10 - ts / 2 - (ult - 1 - q) * (ts + 4)
    const cy = 14
    const r = res[j]
    const novo = q === ult - 1
    const k = `ult:${j}`
    if (tipo === 'dado') face(prims, k, cx, cy, ts, r + 1, { fill: novo ? amber : '#e5e7eb', pip: '#111', sw: novo ? 2 : 1 })
    else if (tipo === 'lista') {
      prims.push({ k, t: 'path', v: quadrado(cx, cy, ts, 3), fechado: true, fill: alpha(novo ? amber : '#e5e7eb', 0.3), stroke: novo ? amber : '#e5e7eb', sw: 1.25 })
      texto(`${k}:t`, [cx, cy], rs[r].nome.slice(0, 2), { fs: ts * 0.55, peso: 700 })
    } else prims.push({ k, t: 'circle', v: [cx, cy, ts / 2], fill: cores[r], stroke: novo ? '#fff' : '#000', sw: novo ? 2.5 : 1.25 })
  }

  // The bars: the relative frequency of each outcome, with the count on top and the chance as a dashed line.
  const curva = s.curva !== undefined && s.curva !== false
  const topBar = 64
  const fundo = curva ? Math.round(H * 0.56) : H
  const bottom = fundo - 40
  const maxP = Math.max(...chances, 0)
  const freqs = cont.map((c) => (n ? c / n : 0))
  const pico = Math.max(maxP * 1.6, ...freqs, 0.05)
  const passoPct = pico > 0.5 ? 0.25 : pico > 0.2 ? 0.1 : 0.05
  const marcaTopo = Math.min(1, Math.ceil(pico / passoPct - 1e-9) * passoPct)
  const left = 44
  const right = W - 8
  const Y = (p: number) => bottom - (p / marcaTopo) * (bottom - topBar)
  for (let p = 0; p <= marcaTopo + 1e-9; p += passoPct) {
    const y = Y(p)
    prims.push({ k: `gy:${Math.round(p * 100)}`, t: 'path', v: [left, y, right, y], stroke: 'rgba(255,255,255,0.1)', sw: 1, cap: 'butt' })
    texto(`ny:${Math.round(p * 100)}`, [left - 6, y], `${Math.round(p * 100)} %`, { anchor: 'end', fs: 11, peso: 500, fill: 'rgba(255,255,255,0.7)' })
  }
  prims.push({ k: 'eixoX', t: 'path', v: [left, bottom, right, bottom], stroke: '#e5e7eb', sw: 2 })
  const slot = (right - left) / Math.max(1, rs.length)
  const bw = Math.min(54, slot * 0.6)
  const iguais = chances.every((c) => Math.abs(c - chances[0]) < 1e-9)
  rs.forEach((r, i) => {
    const x = left + slot * (i + 0.5)
    const yt = Y(freqs[i])
    prims.push({ k: `bar:${i}`, t: 'path', v: [x - bw / 2, bottom, x + bw / 2, bottom, x + bw / 2, yt, x - bw / 2, yt], fechado: true, fill: alpha(cores[i], 0.82), stroke: cores[i], sw: 1 })
    // The count over the bar; when the dashed line of the chance passes there, inside the bar (or over the line).
    const yc = Y(chances[i])
    const yCnt = s.probabilidade === false || Math.abs(yt - 10 - yc) > 9 ? yt - 10 : bottom - yt > 28 ? yt + 12 : yc - 12
    texto(`cnt:${i}`, [x, yCnt], fmtNum(cont[i]), { fs: 13, peso: 700 })
    const nome = tipo === 'dado' ? r.nome : r.nome
    texto(`cat:${i}`, [x, bottom + 12], nome, { fs: clamp((slot - 2) / (nome.length * 0.58), 10, 13), peso: 600, fill: 'rgba(255,255,255,0.9)' })
    texto(`pct:${i}`, [x, bottom + 27], n ? pctTexto(freqs[i]) : '', { fs: clamp((slot - 2) / 5, 9, 12), peso: 600, fill: amber })
    if (s.probabilidade !== false && !iguais) prims.push({ k: `chance:${i}`, t: 'path', v: [x - slot * 0.45, Y(chances[i]), x + slot * 0.45, Y(chances[i])], stroke: '#fff', sw: 2, dash: '5 4' })
  })
  if (s.probabilidade !== false && iguais && rs.length) {
    prims.push({ k: 'chance', t: 'path', v: [left, Y(chances[0]), right, Y(chances[0])], stroke: '#fff', sw: 2, dash: '6 4' })
  }
  if (s.probabilidade !== false && rs.length) {
    // The legend of the dashed line, above the bars.
    const t = iguais ? `chance: ${pctTexto(chances[0])}` : 'chance de cada um'
    const lw = largura(t, 12)
    prims.push({ k: 'chanceLeg', t: 'path', v: [right - lw - 30, 40, right - lw - 8, 40], stroke: '#fff', sw: 2, dash: '5 4' })
    texto('chanceT', [right, 40], t, { anchor: 'end', fs: 12, peso: 700 })
  }

  // The curve: the relative frequency of one outcome as the throws go on.
  if (curva) {
    const alvo = typeof s.curva === 'number' ? clamp(Math.round(s.curva), 0, rs.length - 1) : 0
    const ct = fundo + 26
    const cb = H - 24
    const cl = 44
    const cr = W - 10
    const topoC = Math.min(1, Math.max(0.2, Math.ceil(chances[alvo] * 2 * 10 - 1e-9) / 10))
    const Yc = (p: number) => cb - (Math.min(p, topoC) / topoC) * (cb - ct)
    texto('curvaT', [cl - 36, ct - 18], `% de ${rs[alvo]?.nome ?? ''} ao longo das jogadas`, { anchor: 'start', fs: 12, peso: 600, fill: 'rgba(255,255,255,0.8)' })
    ;[0, topoC / 2, topoC].forEach((p, j) => {
      prims.push({ k: `cgy:${j}`, t: 'path', v: [cl, Yc(p), cr, Yc(p)], stroke: 'rgba(255,255,255,0.1)', sw: 1, cap: 'butt' })
      texto(`cny:${j}`, [cl - 6, Yc(p)], `${Math.round(p * 100)} %`, { anchor: 'end', fs: 11, peso: 500, fill: 'rgba(255,255,255,0.7)' })
    })
    prims.push({ k: 'cEixo', t: 'path', v: [cl, cb, cr, cb], stroke: '#e5e7eb', sw: 1.5 })
    texto('cN0', [cl, cb + 11], '1', { fs: 11, peso: 500, fill: 'rgba(255,255,255,0.7)' })
    texto('cN1', [cr, cb + 11], fmtNum(Math.max(1, n)), { anchor: 'end', fs: 11, peso: 500, fill: 'rgba(255,255,255,0.7)' })
    prims.push({ k: 'cChance', t: 'path', v: [cl, Yc(chances[alvo]), cr, Yc(chances[alvo])], stroke: '#fff', sw: 1.75, dash: '6 4' })
    if (n >= 1) {
      // Always 60 points (so the line morphs from one number of throws to the next).
      const pts: number[] = []
      let k = 0
      let j = 0
      for (let q = 1; q <= 60; q++) {
        const ate = Math.max(1, Math.round((q * n) / 60))
        while (j < ate) if (res[j++] === alvo) k++
        pts.push(cl + ((ate - 1) / Math.max(1, n - 1)) * (cr - cl), Yc(k / ate))
      }
      prims.push({ k: 'curva', t: 'path', v: pts, stroke: cores[alvo], sw: 2.5 })
    }
  }
  return [...prims, ...topo]
}

export function Sorteio({ s, size, onCaso, marcados, errado, onJogar, tremer = 0 }: { s: SorteioState; size: { w: number; h: number } } & SorteioInteract) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (tremer > 0) void controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }, [tremer, controls])
  const simulacao = jogadasDe(s) !== undefined
  const botoes = (Array.isArray(s.botoes) && s.botoes.length ? s.botoes : [1, 10, 100]).filter((b) => typeof b === 'number' && b >= 1).slice(0, 4)
  const textH = (s.rotulo ? 56 : 0) + (onJogar ? 52 : 0)
  const W = size.w
  const H = Math.max(160, Math.min(size.h - textH, 460))
  const montado = simulacao ? { prims: montarSimulacao(s, W, H), alvos: { casos: [] } as Alvos } : montarCasos(s, W, H, { marcados, errado })
  const cena = useCena(montado.prims)
  return (
    <motion.div className="flex h-full w-full select-none flex-col items-center justify-center gap-2" animate={controls} role="img" aria-label={s.rotulo ?? (simulacao ? 'Simulação' : 'Casos possíveis')}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block shrink-0 overflow-visible">
        {cena.map((q) => (
          <Desenho key={q.p.k} q={q} />
        ))}
        {onCaso &&
          montado.alvos.casos.map((c) => (
            <circle key={c.i} cx={c.x} cy={c.y} r={c.r} fill="transparent" className="cursor-pointer" onClick={() => onCaso(c.i)} aria-label={`caso ${c.i + 1}`} role="button" />
          ))}
      </svg>
      {onJogar && (
        <div className="flex gap-3">
          {botoes.map((b) => (
            <motion.button key={b} type="button" whileTap={{ scale: 0.94 }} onClick={() => onJogar(b)} className="rounded-full border border-white/25 bg-white/[0.06] px-5 py-2 text-[16px] font-semibold text-white" aria-label={`jogar ${b} ${b === 1 ? 'vez' : 'vezes'}`}>
              + {fmtNum(b)}
            </motion.button>
          ))}
        </div>
      )}
      {s.rotulo ? (
        <motion.p key={s.rotulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-4 text-center text-[20px] font-semibold leading-tight text-white">
          {s.rotulo}
        </motion.p>
      ) : null}
    </motion.div>
  )
}

