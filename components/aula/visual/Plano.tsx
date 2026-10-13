'use client'

import { useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { alpha, amber, clamp, Desenho, gray, green, largura, rose, sky, useCena, type Prim } from './cena'
import { fmtNum } from './figura-geo'
import {
  coordTexto,
  cruzamento,
  eixoDe,
  encaixar,
  linhasDoEixo,
  mesmoPonto,
  paresDaMaquina,
  pontosDe,
  regraDaMaquina,
  resolve,
  retaNoQuadro,
  retaTexto,
  temPlano,
  type Cor,
  type EixoFinal,
  type PlanoState,
  type Vec,
} from './plano-geo'

export type { PlanoState }

// O plano cartesiano da U18: os dois eixos com números e nomes, a grade, os
// quadrantes, pontos com nome e coordenadas, o ponto que anda (primeiro no x,
// depois no y), retas por uma regra ou por dois pontos, e a máquina de função
// com a tabela de entrada e saída, cujos pares viram pontos no plano.
//
// Tudo é desenhado pelo motor de cena (cena.tsx): de um cartão para o outro,
// o que tem o mesmo nome se move até o novo lugar. As contas ficam em
// plano-geo.ts.

export interface PlanoInteract {
  /** Mexa "marcar": um toque na grade, já no cruzamento mais perto. */
  onMarcar?: (v: Vec) => void
  /** Os pontos já marcados (andam da origem até o lugar) e o último toque errado (rosa). */
  marcados?: Vec[]
  errado?: Vec | null
  /** Mexa "ler": um toque num ponto com nome. */
  onPonto?: (nome: string) => void
  /** Os pontos já lidos: mostram as coordenadas e os tracejados. */
  lidos?: string[]
  /** Mexa "alimentar": um toque na máquina (ou na tabela) põe o próximo número. */
  onAlimentar?: () => void
  /** Cresce a cada erro: o palco treme. */
  tremer?: number
}

const corDe = (c: Cor | undefined, padrao = amber) => (c === 'azul' ? sky : c === 'erro' ? rose : c === 'verde' ? green : c === 'branco' ? '#fff' : c === false ? gray : c ? amber : padrao)
const FS_NUM = 12

interface Alvos {
  plano?: { x0: number; y0: number; x1: number; y1: number; mundo: (px: number, py: number) => Vec; ex: EixoFinal; ey: EixoFinal }
  pontos: { nome: string; x: number; y: number }[]
  maquina?: { x: number; y: number; w: number; h: number }
}

interface Caixa {
  x: number
  y: number
  w: number
  h: number
}

/** The step multiple (1, 2, 5, 10…) whose spacing on screen is at least `min` px. */
function multiplo(passoPx: number, min: number): number {
  for (const k of [1, 2, 5, 10, 20, 50, 100, 200, 500]) if (passoPx * k >= min) return k
  return 1000
}

function montar(s: PlanoState, W: number, H: number, it: PlanoInteract): { prims: Prim[]; alvos: Alvos } {
  const prims: Prim[] = []
  const topo: Prim[] = []
  const alvos: Alvos = { pontos: [] }
  const linha = (k: string, a: [number, number], b: [number, number], o: Partial<Prim> = {}) => prims.push({ k, t: 'path', v: [...a, ...b], stroke: gray, sw: 2, ...o })
  const texto = (k: string, at: [number, number], t: string, o: Partial<Prim> = {}) => topo.push({ k, t: 'text', v: at, texto: t, ...o })
  const retangulo = (r: Caixa): number[] => [r.x, r.y, r.x + r.w, r.y, r.x + r.w, r.y + r.h, r.x, r.y + r.h]

  // ---------------------------------------------------------------- layout: machine, table, plane
  const m = s.maquina
  const feitas = m ? clamp(Math.round(m.feitas ?? 0), 0, m.entradas?.length ?? 0) : 0
  const paresM = m ? paresDaMaquina(m, feitas) : []
  const comTabela = m ? m.tabela !== false && paresM.length > 0 : Boolean(s.tabela?.pares?.length)
  const rotulosT: [string, string] = (m ? m.rotulos : s.tabela?.rotulos) ?? (m ? ['entra', 'sai'] : ['x', 'y'])
  const plano = temPlano(s)
  // Beside a plane on the phone, the machine and the table are more compact.
  const justo = plano && W < 600
  const hM = m ? (justo ? 80 : 96) : 0
  const hT = comTabela ? (justo ? 62 : 72) : 0
  const gap = m && comTabela ? 6 : 0
  let caixaM: Caixa | undefined
  let caixaT: Caixa | undefined
  let caixaP: Caixa | undefined
  const lado = plano && (m || comTabela) && W >= 600
  if (lado) {
    const wl = Math.min(340, W * 0.44)
    const y0 = (H - hM - gap - hT) / 2
    if (m) caixaM = { x: 0, y: y0, w: wl, h: hM }
    if (comTabela) caixaT = { x: 0, y: y0 + hM + gap, w: wl, h: hT }
    caixaP = { x: wl + 12, y: 0, w: W - wl - 12, h: H }
  } else if (plano) {
    if (m) caixaM = { x: 0, y: 0, w: W, h: hM }
    if (comTabela) caixaT = { x: 0, y: hM + gap, w: W, h: hT }
    const y0 = hM + gap + hT + (m || comTabela ? 4 : 0)
    caixaP = { x: 0, y: y0, w: W, h: Math.max(120, H - y0) }
  } else {
    const y0 = Math.max(0, (H - hM - gap - hT) / 2)
    if (m) caixaM = { x: 0, y: y0, w: W, h: hM }
    if (comTabela) caixaT = { x: 0, y: y0 + hM + gap, w: W, h: hT }
  }

  // ---------------------------------------------------------------- the table (entrada / saída, side by side)
  const celulas: { e: [number, number]; s: [number, number] }[] = []
  if (caixaT) {
    const T = caixaT
    const cols: { e: string | null; s: string | null; pendente: boolean }[] = m
      ? paresM.map(([x, y], i) => ({ e: fmtNum(x), s: y === undefined ? null : typeof y === 'number' ? fmtNum(y) : y, pendente: i >= feitas }))
      : (s.tabela?.pares ?? []).map(([x, y]) => ({ e: x === null || x === '?' ? null : typeof x === 'number' ? fmtNum(x) : x, s: y === null || y === '?' ? null : typeof y === 'number' ? fmtNum(y) : y, pendente: false }))
    const n = cols.length
    const hw = clamp(Math.max(...rotulosT.map((r) => largura(r, 13))) + 14, 40, T.w * 0.34)
    const cw = Math.min(78, (T.w - hw - 4) / Math.max(1, n))
    const x0 = T.x + (T.w - hw - n * cw) / 2
    const rh = justo ? 26 : 30
    const r0 = T.y + 5
    const fs = clamp(Math.min(cw * 0.3, (cw - 6) / (Math.max(3, ...cols.map((c) => Math.max(c.e?.length ?? 0, c.s?.length ?? 0))) * 0.56)), 11, 16)
    const g: number[] = []
    for (let r = 0; r <= 2; r++) g.push(x0 + hw, r0 + r * rh, x0 + hw + n * cw, r0 + r * rh)
    for (let c = 0; c <= n; c++) g.push(x0 + hw + c * cw, r0, x0 + hw + c * cw, r0 + 2 * rh)
    prims.push({ k: 't:grade', t: 'path', v: g, pares: true, stroke: 'rgba(255,255,255,0.18)', sw: 1, cap: 'butt' })
    prims.push({ k: 't:fundo', t: 'path', v: retangulo({ x: x0 + hw, y: r0, w: n * cw, h: rh }), fechado: true, fill: 'rgba(255,255,255,0.04)' })
    rotulosT.forEach((r, i) => texto(`t:h${i}`, [x0 + hw - 8, r0 + rh * (i + 0.5)], r, { anchor: 'end', fs: 13, peso: 500, fill: i ? alpha(amber, 0.85) : 'rgba(255,255,255,0.6)' }))
    cols.forEach((c, i) => {
      const cx = x0 + hw + (i + 0.5) * cw
      const pe: [number, number] = [cx, r0 + rh * 0.5]
      const ps: [number, number] = [cx, r0 + rh * 1.5]
      celulas.push({ e: pe, s: ps })
      if (c.e !== null) texto(`t:e:${i}`, pe, c.e, { fs, op: c.pendente ? 0.4 : 1 })
      if (c.s !== null) texto(`t:s:${i}`, ps, c.s, { fs, fill: amber, atraso: m && i === feitas - 1 ? 1050 : 0 })
      else if (!m) texto(`t:s:${i}`, ps, '?', { fs, fill: amber })
    })
    if (m && it.onAlimentar && feitas < n) prims.push({ k: 't:prox', t: 'path', v: retangulo({ x: x0 + hw + feitas * cw + 2, y: r0 + 2, w: cw - 4, h: rh - 4 }), fechado: true, stroke: amber, sw: 1.5, dash: '4 3' })
  }

  // ---------------------------------------------------------------- the machine
  let saidaTela: [number, number] | undefined
  if (m && caixaM) {
    const M = caixaM
    const bw = clamp(M.w * 0.46, 120, 210)
    const bh = justo ? 50 : 58
    const cx = M.x + M.w / 2
    const cy = M.y + (justo ? 32 : 38)
    const bx = cx - bw / 2
    const lateral = (M.w - bw) / 2
    const inX = M.x + lateral / 2
    const outX = M.x + M.w - lateral / 2
    const trabalhou = feitas > 0
    prims.push({ k: 'm:caixa', t: 'path', v: retangulo({ x: bx, y: cy - bh / 2, w: bw, h: bh }), fechado: true, fill: 'rgba(255,255,255,0.05)', stroke: it.onAlimentar ? amber : alpha('#ffffff', 0.45), sw: 2, dash: it.onAlimentar ? '6 4' : undefined })
    if (trabalhou) prims.push({ k: `m:brilho:${feitas}`, t: 'path', v: retangulo({ x: bx - 3, y: cy - bh / 2 - 3, w: bw + 6, h: bh + 6 }), fechado: true, stroke: amber, sw: 2, op: 0.55, atraso: 450, dur: 300 })
    const regra = regraDaMaquina(m)
    const fr = clamp((bw - 18) / Math.max(1, regra.length * 0.56), 12, 21)
    texto('m:regra', [cx, cy], regra, { fs: fr, peso: 700, fill: amber })
    linha('m:seta:e', [inX + 26, cy], [bx - 6, cy], { stroke: alpha('#ffffff', 0.5), sw: 1.8, seta: 'fim' })
    linha('m:seta:s', [bx + bw + 6, cy], [outX - 26, cy], { stroke: alpha('#ffffff', 0.5), sw: 1.8, seta: 'fim' })
    texto('m:rot:e', [inX, cy + bh / 2 + 8], rotulosT[0], { fs: 12, peso: 500, fill: 'rgba(255,255,255,0.55)' })
    texto('m:rot:s', [outX, cy + bh / 2 + 8], rotulosT[1], { fs: 12, peso: 500, fill: alpha(amber, 0.8) })
    const k = feitas - 1
    if (k >= 0) {
      const [x, y] = paresM[k]
      const de = celulas[k]?.e ?? [M.x - 30, cy]
      const fe = clamp((lateral - 34) / Math.max(1, fmtNum(x).length * 0.56), 13, 22)
      texto(`m:e:${k}`, [inX, cy], fmtNum(x), { fs: fe, peso: 700, rota: [de], dur: 600 })
      if (y !== undefined) {
        const t = typeof y === 'number' ? fmtNum(y) : y
        const fsai = clamp((lateral - 34) / Math.max(1, t.length * 0.56), 13, 22)
        texto(`m:s:${k}`, [outX, cy], t, { fs: fsai, peso: 700, fill: amber, rota: [[bx + bw - 8, cy]], atraso: 600, dur: 450 })
        saidaTela = [outX, cy]
      }
    }
    alvos.maquina = { x: M.x, y: M.y, w: M.w, h: M.h + (caixaT ? caixaT.h + gap : 0) }
  }
  if (!m && caixaT && it.onAlimentar) alvos.maquina = caixaT

  // ---------------------------------------------------------------- the plane
  if (caixaP) {
    const P = caixaP
    const ex = eixoDe(s, 'x')
    const ey = eixoDe(s, 'y')
    const nyLab = linhasDoEixo(ey).map((v) => largura(fmtNum(v), FS_NUM))
    const padL = Math.max(...nyLab, 8) + 14
    const padR = 24
    const padT = 26
    const padB = 26
    let sx = (P.w - padL - padR) / (ex.ate - ex.de)
    let sy = (P.h - padT - padB) / (ey.ate - ey.de)
    // The same step on both axes: square cells (the plane is not stretched).
    if (Math.abs(ex.passo - ey.passo) < 1e-9) sx = sy = Math.min(sx, sy)
    sx = Math.max(sx, 0.0001)
    sy = Math.max(sy, 0.0001)
    const pw = sx * (ex.ate - ex.de)
    const ph = sy * (ey.ate - ey.de)
    const left = P.x + padL + (P.w - padL - padR - pw) / 2
    const top = P.y + padT + (P.h - padT - padB - ph) / 2
    const ox = left - ex.de * sx
    const oy = top + ey.ate * sy
    const X = (v: Vec): [number, number] => [ox + v[0] * sx, oy - v[1] * sy]
    const [cxw, cyw] = cruzamento(ex, ey)
    const right = left + pw
    const bottom = top + ph
    const C = X([cxw, cyw])
    alvos.plano = { x0: left, y0: top, x1: right, y1: bottom, mundo: (px, py) => [(px - ox) / sx, (oy - py) / sy], ex, ey }

    // Grid.
    if (s.grade !== false) {
      const kx = multiplo(ex.passo * sx, 7)
      const ky = multiplo(ey.passo * sy, 7)
      for (const v of linhasDoEixo(ex, kx)) linha(`gx:${v}`, [ox + v * sx, top], [ox + v * sx, bottom], { stroke: 'rgba(255,255,255,0.10)', sw: 1, cap: 'butt' })
      for (const v of linhasDoEixo(ey, ky)) linha(`gy:${v}`, [left, oy - v * sy], [right, oy - v * sy], { stroke: 'rgba(255,255,255,0.10)', sw: 1, cap: 'butt' })
    }

    // Quadrants: the names, and the lit ones tinted.
    if (s.quadrantes && ex.de < 0 && ex.ate > 0 && ey.de < 0 && ey.ate > 0) {
      const acesos = Array.isArray(s.quadrantes) ? s.quadrantes : []
      const cantos: Record<number, Caixa> = {
        1: { x: C[0], y: top, w: right - C[0], h: C[1] - top },
        2: { x: left, y: top, w: C[0] - left, h: C[1] - top },
        3: { x: left, y: C[1], w: C[0] - left, h: bottom - C[1] },
        4: { x: C[0], y: C[1], w: right - C[0], h: bottom - C[1] },
      }
      for (const q of [1, 2, 3, 4]) {
        const r = cantos[q]
        const aceso = acesos.includes(q)
        if (aceso) prims.push({ k: `qd:${q}`, t: 'path', v: retangulo(r), fechado: true, fill: alpha(amber, 0.12) })
        // The name sits near the outer corner, away from the axes.
        const nx = q === 1 || q === 4 ? r.x + r.w - 22 : r.x + 22
        const ny = q === 1 || q === 2 ? r.y + 18 : r.y + r.h - 18
        texto(`qn:${q}`, [nx, ny], `${q}º`, { fs: 17, peso: 700, fill: aceso ? amber : 'rgba(255,255,255,0.38)' })
      }
    }

    // Lit numbers on the axes: where the guides and walks arrive.
    const nomeados = pontosDe(s).filter((p) => p.nome) as { nome: string; v: Vec }[]
    const pts = s.pontos && !Array.isArray(s.pontos) ? s.pontos : undefined
    const lista = (v: boolean | string | string[] | undefined) => (v === true ? nomeados.map((p) => p.nome) : typeof v === 'string' ? [v] : Array.isArray(v) ? v : [])
    const caminho = lista(s.caminho)
    const guias = [...lista(s.guias), ...(it.lidos ?? [])]
    const marcados = it.marcados ?? []
    // A marked point with the coordinates of a named point walks as that point.
    const marcadosNomes = marcados.map((v) => nomeados.find((p) => mesmoPonto(p.v, v))?.nome)
    const andam = [...caminho, ...(marcadosNomes.filter(Boolean) as string[])]
    const acesosX = new Set<number>()
    const acesosY = new Set<number>()
    for (const n of [...andam, ...guias]) {
      const v = resolve(n, pts)
      if (v) {
        acesosX.add(v[0])
        acesosY.add(v[1])
      }
    }
    marcados.forEach((v) => {
      acesosX.add(v[0])
      acesosY.add(v[1])
    })

    // Axes, ticks and numbers.
    linha('eixo:x', [left, C[1]], [right + 14, C[1]], { stroke: gray, sw: 2, seta: 'fim' })
    linha('eixo:y', [C[0], bottom], [C[0], top - 14], { stroke: gray, sw: 2, seta: 'fim' })
    const numX = ex.numeros === false ? [] : linhasDoEixo(ex, typeof ex.numeros === 'number' ? ex.numeros : multiplo(ex.passo * sx, Math.max(...linhasDoEixo(ex).map((v) => largura(fmtNum(v), FS_NUM))) + 8))
    const numY = ey.numeros === false ? [] : linhasDoEixo(ey, typeof ey.numeros === 'number' ? ey.numeros : multiplo(ey.passo * sy, 18))
    const marcas: number[] = []
    const origem = Math.abs(cxw) < 1e-9 && Math.abs(cyw) < 1e-9
    for (const v of new Set([...numX, ...acesosX])) {
      const px = ox + v * sx
      if (v < ex.de - 1e-9 || v > ex.ate + 1e-9) continue
      marcas.push(px, C[1] - 3.5, px, C[1] + 3.5)
      if (Math.abs(v - cxw) < 1e-9) continue
      const aceso = acesosX.has(v)
      texto(`nx:${v}`, [px, C[1] + 14], fmtNum(v), { fs: aceso ? 13 : FS_NUM, peso: aceso ? 700 : 500, fill: aceso ? amber : 'rgba(255,255,255,0.72)' })
    }
    for (const v of new Set([...numY, ...acesosY])) {
      const py = oy - v * sy
      if (v < ey.de - 1e-9 || v > ey.ate + 1e-9) continue
      marcas.push(C[0] - 3.5, py, C[0] + 3.5, py)
      if (Math.abs(v - cyw) < 1e-9) continue
      const aceso = acesosY.has(v)
      texto(`ny:${v}`, [C[0] - 7, py], fmtNum(v), { anchor: 'end', fs: aceso ? 13 : FS_NUM, peso: aceso ? 700 : 500, fill: aceso ? sky : 'rgba(255,255,255,0.72)' })
    }
    prims.push({ k: 'eixo:marcas', t: 'path', v: marcas, pares: true, stroke: gray, sw: 1.5, cap: 'butt' })
    // The crossing's numbers: one 0 at the origin; at an edge, both values.
    if (origem) texto('n:0', [C[0] - 7, C[1] + 13], '0', { anchor: 'end', fs: FS_NUM, peso: 500, fill: 'rgba(255,255,255,0.72)' })
    else {
      if (ex.numeros !== false) texto(`nx:${cxw}`, [C[0], C[1] + 14], fmtNum(cxw), { fs: FS_NUM, peso: 500, fill: 'rgba(255,255,255,0.72)' })
      if (ey.numeros !== false) texto(`ny:${cyw}`, [C[0] - 7, C[1]], fmtNum(cyw), { anchor: 'end', fs: FS_NUM, peso: 500, fill: 'rgba(255,255,255,0.72)' })
    }
    // Axis names: x at the right end, above the axis; y at the top, beside the arrow.
    texto('nome:x', [right + 14, C[1] - 14], ex.rotulo, { anchor: 'end', fs: 14, peso: 600, fill: 'rgba(255,255,255,0.85)' })
    texto('nome:y', [C[0] + 10, top - 12], ey.rotulo, { anchor: 'start', fs: 14, peso: 600, fill: 'rgba(255,255,255,0.85)' })

    // Lines by a rule (or by two points), and segments.
    const rotulosRetas: { i: number; a: [number, number]; b: [number, number]; rot: string; cor: string }[] = []
    ;(s.retas ?? []).forEach((r, i) => {
      const seg = retaNoQuadro(r, ex, ey, pts)
      if (!seg) return
      const cor = corDe(r.destaque, sky)
      const a = X(seg[0])
      const b = X(seg[1])
      prims.push({ k: `reta:${i}`, t: 'path', v: [...a, ...b], stroke: cor, sw: 2.75, dash: r.tracejado ? '7 5' : undefined, rota: [[...a, ...a]], dur: 700 })
      const rot = r.rotulo === true ? retaTexto(r, pts) : typeof r.rotulo === 'string' ? r.rotulo : ''
      if (rot) rotulosRetas.push({ i, a, b, rot, cor })
    })
    // The rule beside each line: the place along it (and the side) that stays inside the plane, off the axes and off the other labels.
    const ocupados: Caixa[] = []
    for (const { i, a, b, rot, cor } of rotulosRetas) {
      const w = largura(rot, 14) + 6
      const h = 18
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1
      const nx0 = (b[1] - a[1]) / L
      const ny0 = -(b[0] - a[0]) / L
      let melhor: { x: number; y: number; nota: number } | undefined
      for (const t of [0.86, 0.74, 0.62, 0.5, 0.38, 0.26, 0.14]) {
        for (const lado of [1, -1]) {
          const nx = nx0 * lado
          const ny = ny0 * lado
          const off = 10 + Math.abs(nx) * (w / 2) + Math.abs(ny) * (h / 2)
          const x = a[0] + (b[0] - a[0]) * t + nx * off
          const y = a[1] + (b[1] - a[1]) * t + ny * off
          const r: Caixa = { x: x - w / 2, y: y - h / 2, w, h }
          const fora = Math.max(0, left - r.x) + Math.max(0, r.x + r.w - right) + Math.max(0, top - r.y) + Math.max(0, r.y + r.h - bottom)
          const eixo = (r.x < C[0] && r.x + r.w > C[0] ? 1 : 0) + (r.y < C[1] && r.y + r.h > C[1] ? 1 : 0)
          const bate = ocupados.filter((o) => r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y).length
          // Over another line (sampled along it).
          let cruza = 0
          for (const o of rotulosRetas) {
            if (o.i === i) continue
            for (let k = 0; k <= 40; k++) {
              const px = o.a[0] + ((o.b[0] - o.a[0]) * k) / 40
              const py = o.a[1] + ((o.b[1] - o.a[1]) * k) / 40
              if (px > r.x && px < r.x + r.w && py > r.y && py < r.y + r.h) cruza++
            }
          }
          const nota = fora * 10 + eixo * 40 + bate * 60 + cruza * 12 + (1 - t) * 8 + (ny > 0 ? 3 : 0)
          if (!melhor || nota < melhor.nota) melhor = { x, y, nota }
        }
      }
      if (!melhor) continue
      ocupados.push({ x: melhor.x - w / 2, y: melhor.y - h / 2, w, h })
      texto(`retat:${i}`, [clamp(melhor.x, w / 2, W - w / 2), melhor.y], rot, { fs: 14, peso: 700, fill: cor, atraso: 400 })
    }
    ;(s.segmentos ?? []).forEach((t, i) => {
      const o = Array.isArray(t) ? { de: t[0], ate: t[1] } : t
      const a = resolve(o.de, pts)
      const b = resolve(o.ate, pts)
      if (!a || !b) return
      linha(`seg:${i}`, X(a), X(b), { stroke: 'destaque' in o && o.destaque ? corDe(o.destaque) : gray, sw: 2.5, dash: 'tracejado' in o && o.tracejado ? '6 5' : undefined })
    })

    // The pairs of the machine (or the table) as points; the newest one flies out of the machine.
    const pares: Vec[] = []
    if (m) paresM.forEach(([x, y]) => typeof y === 'number' && pares.push([x, y]))
    else if (s.tabela && s.tabela.noPlano !== false) for (const [x, y] of s.tabela.pares ?? []) if (typeof x === 'number' && typeof y === 'number') pares.push([x, y])
    if (s.ligar) {
      const seq = [...nomeados.map((p) => p.v), ...pares]
      for (let i = 0; i + 1 < seq.length; i++) {
        const a = X(seq[i])
        const b = X(seq[i + 1])
        const novo = m && i + 1 === feitas - 1
        prims.push({ k: `lig:${i}`, t: 'path', v: [...a, ...b], stroke: sky, sw: 2.5, rota: [[...a, ...a]], atraso: novo ? 1500 : 0, dur: 450 })
      }
    }
    pares.forEach((v, i) => {
      const [px, py] = X(v)
      const novo = m && i === feitas - 1 && saidaTela
      prims.push({ k: `par:${i}`, t: 'circle', v: [px, py, 5.5], fill: amber, stroke: '#000', sw: 1.5, ...(novo ? { rota: [[...saidaTela!, 5.5]], atraso: 1100, dur: 700 } : {}) })
    })

    // A point's name and coordinates, beside it (to the upper right; flipped near the edges).
    const rotuloPonto = (k: string, P: [number, number], t: string, pos: string | undefined, o: Partial<Prim>) => {
      const w = largura(t, 15)
      // Outward: away from the axes (to the left of the y axis, under the x axis).
      let dir = pos ?? ''
      const esquerda = pos ? pos === 'esquerda' : P[0] < C[0] - 1
      const abaixo = pos ? pos === 'abaixo' : P[1] > C[1] + 1
      if (!pos) dir = abaixo ? 'abaixo' : 'acima'
      let ax: 'start' | 'end' = esquerda ? 'end' : 'start'
      let x = esquerda ? P[0] - 9 : P[0] + 9
      let y = dir === 'abaixo' ? P[1] + 16 : dir === 'acima' ? P[1] - 14 : P[1]
      if (pos === 'direita') {
        ax = 'start'
        x = P[0] + 12
      } else if (pos === 'esquerda') x = P[0] - 12
      // Near the edges, it flips.
      if (ax === 'start' && x + w > W - 2) {
        ax = 'end'
        x = P[0] - 9
      } else if (ax === 'end' && x - w < 2) {
        ax = 'start'
        x = P[0] + 9
      }
      if (y < 10) y = P[1] + 16
      texto(k, [x, y], t, { anchor: ax, fs: 15, peso: 600, ...o })
    }

    // The walk: from the crossing along x (amber), then up or down along y (sky).
    const andar = (k: string, v: Vec, cor: string, t0: number) => {
      const O = C
      const A = X([v[0], cyw])
      const B = X(v)
      prims.push({ k: `cx:${k}`, t: 'path', v: [...O, ...A], stroke: amber, sw: 4, rota: [[...O, ...O]], atraso: t0, dur: 650 })
      prims.push({ k: `cy:${k}`, t: 'path', v: [...A, ...B], stroke: sky, sw: 4, rota: [[...A, ...A]], atraso: t0 + 650, dur: 650 })
      prims.push({ k: `pa:${k}`, t: 'circle', v: [...B, 6], fill: cor, stroke: '#000', sw: 1.5, rota: [[...O, 6], [...A, 6]], atraso: t0, dur: 1300 })
    }
    const guia = (k: string, v: Vec, atraso = 0) => {
      const B = X(v)
      linha(`gux:${k}`, B, X([v[0], cyw]), { stroke: alpha(amber, 0.8), sw: 1.6, dash: '4 4', cap: 'butt', atraso })
      linha(`guy:${k}`, B, X([cxw, v[1]]), { stroke: alpha(sky, 0.8), sw: 1.6, dash: '4 4', cap: 'butt', atraso })
    }

    // Named points (and the unnamed ones of `pontos`).
    const nomes = typeof s.nomes === 'object' ? s.nomes : {}
    const coords = lista(s.coordenadas)
    let ordemCaminho = 0
    pontosDe(s).forEach((p, i) => {
      const k = p.nome ?? `#${i}`
      const cor = corDe(p.nome ? s.cores?.[p.nome] : undefined)
      const B = X(p.v)
      const anda = p.nome ? andam.includes(p.nome) : false
      const t0 = anda && p.nome && caminho.includes(p.nome) ? 1300 * ordemCaminho++ : 0
      if (anda) andar(k, p.v, cor, t0)
      else prims.push({ k: `pt:${k}`, t: 'circle', v: [...B, 5.5], fill: cor, stroke: '#000', sw: 1.5 })
      if (p.nome && guias.includes(p.nome)) guia(k, p.v, anda ? t0 + 1300 : 0)
      const nome = p.nome && s.nomes !== false ? (nomes[p.nome] ?? p.nome) : ''
      const comCoord = p.nome ? coords.includes(p.nome) || (it.lidos ?? []).includes(p.nome) || anda : false
      const t = [nome, comCoord ? coordTexto(p.v) : ''].filter(Boolean).join(' ')
      if (t) rotuloPonto(`${anda ? 'pnc' : 'pn'}:${k}`, B, t, p.nome ? s.posRotulos?.[p.nome] : undefined, { fill: '#fff', atraso: anda ? t0 + 1250 : 0 })
      if (p.nome && it.onPonto) alvos.pontos.push({ nome: p.nome, x: B[0], y: B[1] })
    })

    // Mexa "marcar": the marked points that are not named points walk to their place.
    marcados.forEach((v, i) => {
      if (marcadosNomes[i]) return
      const k = `mk:${v[0]},${v[1]}`
      andar(k, v, amber, 0)
      rotuloPonto(`mkt:${k}`, X(v), coordTexto(v), undefined, { fill: '#fff', atraso: 1250 })
    })
    if (it.errado) {
      const B = X(it.errado)
      prims.push({ k: `err:${it.errado.join(',')}`, t: 'circle', v: [...B, 6], fill: rose, stroke: '#000', sw: 1.5 })
      rotuloPonto(`errt:${it.errado.join(',')}`, B, coordTexto(it.errado), undefined, { fill: rose })
    }
  }

  return { prims: [...prims, ...topo], alvos }
}

// ---------------------------------------------------------------- the component

export function Plano({ s, size, onMarcar, marcados, errado, onPonto, lidos, onAlimentar, tremer = 0 }: { s: PlanoState; size: { w: number; h: number } } & PlanoInteract) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (tremer > 0) void controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }, [tremer, controls])

  const textH = s.rotulo ? 56 : 0
  const W = size.w
  const H = Math.max(160, size.h - textH)
  const { prims, alvos } = montar(s, W, H, { onMarcar, marcados, errado, onPonto, lidos, onAlimentar })
  const cena = useCena(prims)

  const toquePlano = (e: React.PointerEvent<SVGRectElement>) => {
    const p = alvos.plano
    const svg = e.currentTarget.ownerSVGElement
    if (!p || !svg || !onMarcar) return
    const r = svg.getBoundingClientRect()
    onMarcar(encaixar(p.mundo(e.clientX - r.left, e.clientY - r.top), p.ex, p.ey))
  }

  const pl = alvos.plano
  const mq = alvos.maquina
  return (
    <motion.div className="flex h-full w-full select-none flex-col items-center justify-center gap-2" animate={controls} role="img" aria-label={s.rotulo ?? 'Plano cartesiano'}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block shrink-0 overflow-visible">
        {cena.map((q) => (
          <Desenho key={q.p.k} q={q} />
        ))}
        {pl && onMarcar && (
          <rect x={pl.x0 - 12} y={pl.y0 - 12} width={pl.x1 - pl.x0 + 24} height={pl.y1 - pl.y0 + 24} fill="transparent" className="cursor-crosshair" onPointerDown={toquePlano} aria-label="grade do plano" role="button" />
        )}
        {onPonto &&
          alvos.pontos.map((p) => (
            <circle key={p.nome} cx={p.x} cy={p.y} r={22} fill="transparent" className="cursor-pointer" onClick={() => onPonto(p.nome)} aria-label={`ponto ${p.nome}`} role="button" />
          ))}
        {mq && onAlimentar && <rect x={mq.x} y={mq.y} width={mq.w} height={mq.h} fill="transparent" className="cursor-pointer" onClick={onAlimentar} aria-label="pôr o próximo número na máquina" role="button" />}
      </svg>
      {s.rotulo ? (
        <motion.p key={s.rotulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-4 text-center text-[20px] font-semibold leading-tight text-white">
          {s.rotulo}
        </motion.p>
      ) : null}
    </motion.div>
  )
}
