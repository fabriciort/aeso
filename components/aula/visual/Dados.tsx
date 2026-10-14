'use client'

import { useEffect, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { alpha, amber, clamp, Desenho, DUR, gray, green, largura, rose, sky, useCena, type Prim } from './cena'
import { fmtNum } from './figura-geo'
import {
  amplitude,
  comSinal,
  comUnidade,
  conjuntosDe,
  contagens,
  desvioPadrao,
  destaquesDe,
  distanciaMedia,
  eixoDados,
  inclinacao,
  media,
  mediana,
  meioDaFila,
  modas,
  mesmo,
  niveis,
  numerosCabem,
  ordemFila,
  somaDesviosTexto,
  type DadosState,
  type EixoDados,
} from './dados-geo'

export type { DadosState }

// Os dados da U19: um conjunto de valores como pontos empilhados sobre a reta
// (o gráfico de pontos). A média é o ponto de equilíbrio: um apoio embaixo da
// reta, que inclina quando o apoio está fora dela. A mediana é o valor do
// meio da fila (os pontos saem da reta e se enfileiram em ordem), a moda é a
// pilha mais alta. Também a amplitude (o colchete do menor ao maior), os
// desvios até a média, a faixa média ± desvio padrão e dois conjuntos na
// mesma escala. As contas ficam em dados-geo.ts.

export interface DadosInteract {
  /** Mexa "ordenar": os pontos que já estão na fila (índices de `valores`, na ordem da fila). */
  naFila?: number[]
  /** Um toque num ponto (na reta ou na fila). */
  onPonto?: (i: number) => void
  /** O ponto do último toque errado (rosa). */
  errado?: number | null
  /** Mexa "achar": um toque na reta, já como número. */
  onValor?: (v: number) => void
  /** O valor tocado: âmbar se certo, rosa se errado. */
  marcado?: { v: number; certo: boolean } | null
  /** Mexa "equilibrar": arrastar o apoio (o valor na altura do dedo) e soltar. */
  onFulcro?: (v: number) => void
  onSolta?: () => void
  /** Cresce a cada erro: o palco treme. */
  tremer?: number
}

const lilas = '#c4b5fd'
const PONTO = '#e5e7eb'
const IDS = ['a', 'b', 'c']

interface Alvos {
  pontos: { i: number; x: number; y: number; r: number }[]
  /** The line of the active set: where a touch reads a value, and where the support is dragged. */
  reta?: { left: number; right: number; top: number; bottom: number; e: EixoDados }
}

function montar(s: DadosState, W: number, H: number, it: DadosInteract & { arrastando?: boolean }): { prims: Prim[]; alvos: Alvos } {
  const fundo: Prim[] = []
  const prims: Prim[] = []
  const topo: Prim[] = []
  const alvos: Alvos = { pontos: [] }
  const texto = (k: string, at: [number, number], t: string, o: Partial<Prim> = {}) => topo.push({ k, t: 'text', v: at, texto: t, ...o })
  const conjuntos = conjuntosDe(s)
  const e = eixoDados(s)
  const acesos = destaquesDe(s)
  const ativo = Math.min(conjuntos.length - 1, Math.max(0, s.ativo ?? 0))
  const ordenando = it.naFila !== undefined
  let y0 = 0
  if (s.titulo) {
    texto('titulo', [W / 2, 11], s.titulo, { fs: clamp((W - 16) / Math.max(1, s.titulo.length * 0.56), 12, 16), fill: 'rgba(255,255,255,0.88)' })
    y0 = 26
  }
  const fs = 12
  const left = 16
  const right = W - 16
  const X = (v: number) => left + ((v - e.de) / (e.ate - e.de || 1)) * (right - left)
  const cada = numerosCabem(e, right - left, fs)
  // First the sizes of each panel: what is fixed (names, queue, labels, what goes under the line) and the stacks.
  const porLinha = Boolean(s.desvios || s.distancias)
  const folga = porLinha ? 4 : 0
  const medidas = conjuntos.map((cj) => {
    const vals = cj.valores
    const n = vals.length
    const temApoio = s.media === true || typeof s.fulcro === 'number' || Boolean(it.onFulcro)
    const ci = conjuntos.indexOf(cj)
    const fila = (s.fila === true || (ordenando && ci === ativo)) && n > 0
    const mo = s.moda ? modas(vals) : []
    let baixo = 24
    if (temApoio) baixo = 46
    const yAmp = baixo + 8
    if (s.amplitude) baixo += 34
    const linhasTexto = [s.somaDesvios ? somaDesviosTexto(vals) : '', s.distancias ? `distância média: ${comUnidade(s, distanciaMedia(vals))}` : ''].filter(Boolean)
    baixo += linhasTexto.length * 20
    const rf = clamp(Math.min((W - 16) / Math.max(1, n) / 2 - 1.5, 15), 8, 15)
    const filaH = fila ? 2 * rf + 24 : 0
    const extra = (cj.nome ? 20 : 4) + filaH + (s.faixa ? 18 : 0) + (s.mediana && !fila ? 16 : 0) + (mo.length ? 14 : 0) + (s.moda && !mo.length ? 14 : 0)
    const cont = contagens(vals)
    // With the deviations, each point gets its own row (the segments do not cross the other points).
    const maxPilha = porLinha ? Math.max(1, n) : Math.max(1, ...cont.values())
    const distintos = [...cont.keys()].sort((x, y) => x - y)
    const gap = distintos.slice(1).reduce((g, v, i) => Math.min(g, X(v) - X(distintos[i])), X(e.de + e.passo) - X(e.de))
    return { temApoio, fila, mo, baixo, yAmp, linhasTexto, rf, filaH, extra, cont, maxPilha, gap, fixo: extra + baixo + 10 }
  })
  const R_MAX = 13
  const livre = (H - y0) / conjuntos.length
  const ph = Math.min(livre, Math.max(...medidas.map((q) => q.fixo + (2 * Math.min(R_MAX, q.gap * 0.46) + folga) * q.maxPilha)))
  // The dots may touch when the values are close (an outlier squeezes the others), but never get too small to see.
  const r = Math.min(...medidas.map((q) => clamp(Math.min(porLinha ? R_MAX : q.gap * 0.5, (ph - q.fixo) / q.maxPilha / 2 - folga / 2), 4.5, R_MAX)))
  const passoY = 2 * r + folga
  // The panels sit in the middle of the stage.
  y0 += (H - y0 - ph * conjuntos.length) / 2

  conjuntos.forEach((cj, ci) => {
    const id = IDS[ci]
    const vals = cj.valores
    const n = vals.length
    const m = media(vals)
    const md = mediana(vals)
    const { temApoio, fila, mo, baixo, yAmp, linhasTexto, rf, filaH, cont } = medidas[ci]
    const top = y0 + ci * ph + (cj.nome ? 20 : 4)
    const fulcro = typeof s.fulcro === 'number' && !s.media ? s.fulcro : m
    const naFila = fila ? (ordenando && ci === ativo ? it.naFila! : ordemFila(vals)) : []
    const axisY = y0 + (ci + 1) * ph - baixo
    const filaY = top + rf + 2
    const nivel = porLinha ? vals.map((_, i) => i) : niveis(vals)
    const altura = (i: number) => axisY - r - 2 - nivel[i] * passoY
    const maxPilha = medidas[ci].maxPilha
    // Above the stacks, one row each: "moda", "mediana", the band's label.
    const cima = Math.max(top + filaH, axisY - 4 - (maxPilha - 1) * passoY - 2 * r)
    const comModa = Boolean(s.moda)
    const yMediana = cima - (comModa ? 16 : 0) - 9
    const dotTop = cima - (comModa ? 14 : 0) - (s.mediana && !fila ? 16 : 0)
    // The beam tilts about the support.
    const ang = temApoio ? inclinacao(vals, fulcro, e) : 0
    const px = X(fulcro)
    const cos = Math.cos((ang * Math.PI) / 180)
    const sin = Math.sin((ang * Math.PI) / 180)
    const rot = (x: number, y: number): [number, number] => (ang ? [px + (x - px) * cos - (y - axisY) * sin, axisY + (x - px) * sin + (y - axisY) * cos] : [x, y])
    const arrasta = it.arrastando ? 1 : DUR
    const viga = (k: string, pts: number[], o: Partial<Prim> = {}) => {
      const v: number[] = []
      for (let j = 0; j + 1 < pts.length; j += 2) v.push(...rot(pts[j], pts[j + 1]))
      prims.push({ k, t: 'path', v, stroke: gray, sw: 2, dur: arrasta, ...o })
    }

    if (cj.nome) texto(`${id}:nome`, [left - 4, top - 11], cj.nome, { anchor: 'start', fs: 14, peso: 600, fill: ci === 0 ? amber : sky })

    // The band mean ± deviation, behind everything.
    if (s.faixa && n) {
      const dp = typeof s.faixa === 'number' ? s.faixa : desvioPadrao(vals)
      const a = X(m - dp)
      const b = X(m + dp)
      const yt = dotTop - 4
      fundo.push({ k: `${id}:faixa`, t: 'path', v: [...rot(a, axisY), ...rot(b, axisY), ...rot(b, yt), ...rot(a, yt)], fechado: true, fill: alpha(sky, 0.16), dur: arrasta })
      viga(`${id}:faixaA`, [a, axisY, a, yt], { stroke: alpha(sky, 0.8), sw: 1.5, dash: '4 3' })
      viga(`${id}:faixaB`, [b, axisY, b, yt], { stroke: alpha(sky, 0.8), sw: 1.5, dash: '4 3' })
      texto(`${id}:faixaT`, [clamp((a + b) / 2, 90, W - 90), yt - 9], `média ± desvio: ${fmtNum(m)} ± ${fmtNum(dp)}`, { fs: 12, peso: 600, fill: sky })
    }

    // The line, its marks and numbers.
    viga(`${id}:eixo`, [left - 6, axisY, right + 6, axisY], { sw: 2.5 })
    e.marcas.forEach((v, j) => {
      const x = X(v)
      const forte = j % cada === 0
      viga(`${id}:tk:${v}`, [x, axisY - (forte ? 5 : 3), x, axisY + (forte ? 5 : 3)], { sw: forte ? 1.75 : 1.25, cap: 'butt' })
      // The support covers the number under it.
      const tapado = temApoio && n > 0 && Math.abs(x - X(fulcro)) < largura(fmtNum(v), fs) / 2 + 13
      if (forte) texto(`${id}:nx:${v}`, rot(x, axisY + 15), fmtNum(v), { fs, peso: 500, fill: 'rgba(255,255,255,0.8)', dur: arrasta, op: tapado ? 0 : 1 })
    })
    if (s.unidade && ci === conjuntos.length - 1) texto(`${id}:unid`, rot(right + 4, axisY - 12), s.unidade, { anchor: 'end', fs: 12, peso: 500, fill: 'rgba(255,255,255,0.6)', dur: arrasta })

    // The mean line (the deviations go to it).
    if ((s.desvios || s.distancias) && n) viga(`${id}:mlinha`, [X(m), axisY, X(m), dotTop - 2], { stroke: alpha(amber, 0.85), sw: 1.75, dash: '5 4' })
    // The median line.
    if (s.mediana && !fila && n) {
      viga(`${id}:mdlinha`, [X(md), axisY, X(md), comModa ? cima : yMediana + 8], { stroke: sky, sw: 2, dash: '5 4' })
      texto(`${id}:mdT`, rot(clamp(X(md), 54, W - 54), yMediana), `mediana ${fmtNum(md)}`, { fs: 13, peso: 700, fill: sky, dur: arrasta })
    }

    // The deviations, one segment per dot (only the top dot of a stack gets the number).
    const topoDaPilha = new Map<number, number>()
    vals.forEach((v, i) => topoDaPilha.set(Math.round(v * 1e9), i))
    const filaPos = new Map(naFila.map((i, j) => [i, j]))
    const meio = meioDaFila(n)
    const totalFila = fila ? (ordenando ? n : naFila.length) : 0
    const filaX = (j: number) => W / 2 + (j - (totalFila - 1) / 2) * (2 * rf + 3)

    vals.forEach((v, i) => {
      const k = `${id}:pt:${i}`
      const j = filaPos.get(i)
      const naReta: [number, number] = rot(X(v), altura(i))
      if (j !== undefined) {
        // In the queue: a bigger circle with the number inside; the middle one(s) lit.
        const noMeio = (s.mediana || (!ordenando && s.fila)) && meio.includes(j) && naFila.length === n
        const cor = it.errado === i ? rose : noMeio ? sky : acesos.some((a) => mesmo(a, v)) ? amber : PONTO
        const at: [number, number] = [filaX(j), filaY]
        prims.push({ k, t: 'circle', v: [...at, rf], fill: alpha(cor, noMeio ? 0.5 : 0.18), stroke: cor, sw: noMeio ? 2.5 : 1.75 })
        texto(`${id}:ptn:${i}`, at, fmtNum(v), { fs: clamp((2 * rf - 4) / Math.max(1.6, fmtNum(v).length * 0.6), 9, 15), peso: 700, fill: '#fff' })
        alvos.pontos.push({ i, x: at[0], y: at[1], r: Math.max(rf, 14) })
        return
      }
      const emModa = mo.some((x) => mesmo(x, v))
      const cor = it.errado === i ? rose : acesos.some((a) => mesmo(a, v)) ? amber : emModa ? green : PONTO
      prims.push({ k, t: 'circle', v: [...naReta, r], fill: cor, stroke: '#000', sw: 1.25, dur: arrasta })
      // The number hides on the line (it shows in the queue).
      topo.push({ k: `${id}:ptn:${i}`, t: 'text', v: naReta, texto: fmtNum(v), fs: 9, op: 0, dur: arrasta })
      if (ci === ativo) alvos.pontos.push({ i, x: naReta[0], y: naReta[1], r: Math.max(r + 2, 13) })
      const d = v - m
      const desenha = (s.desvios || s.distancias) && Math.abs(d) > 1e-9
      if (desenha) {
        const y = altura(i)
        const cor2 = s.distancias ? lilas : d > 0 ? green : rose
        viga(`${id}:dv:${i}`, [X(m), y, X(v) - Math.sign(d) * r, y], { stroke: cor2, sw: 2.5 })
        if (porLinha || topoDaPilha.get(Math.round(v * 1e9)) === i) {
          const t = s.distancias ? fmtNum(Math.abs(d)) : comSinal(d)
          texto(`${id}:dvT:${i}`, rot(X(v) + Math.sign(d) * (r + 4), y), t, { anchor: d > 0 ? 'start' : 'end', fs: 11, peso: 700, fill: cor2, dur: arrasta })
        }
      }
    })

    // The median between two queue places.
    if (fila && naFila.length === n && (s.mediana || (!ordenando && s.fila)) && n) {
      const xm = meio.length === 2 ? (filaX(meio[0]) + filaX(meio[1])) / 2 : filaX(meio[0])
      if (meio.length === 2) prims.push({ k: `${id}:entre`, t: 'path', v: [xm, filaY + rf + 2, xm, filaY + rf + 9], stroke: sky, sw: 2.5 })
      texto(`${id}:mdF`, [clamp(xm, 54, W - 54), filaY + rf + 17], `mediana ${fmtNum(md)}`, { fs: 13, peso: 700, fill: sky })
    }

    // The mode: "moda" over the highest stack(s); none: "sem moda".
    if (s.moda && n) {
      if (!mo.length) texto(`${id}:semModa`, [right, cima - 9], 'sem moda: nenhum valor se repete', { anchor: 'end', fs: 12, peso: 600, fill: green })
      mo.forEach((v) => {
        const c = cont.get(Math.round(v * 1e9) / 1e9) ?? 1
        texto(`${id}:moda:${v}`, rot(X(v), axisY - 2 - (c - 1) * passoY - 2 * r - 9), 'moda', { fs: 12, peso: 700, fill: green, dur: arrasta })
      })
    }

    // The range: a bracket under the line, from the smallest to the biggest.
    if (s.amplitude && n) {
      const lo = Math.min(...vals)
      const hi = Math.max(...vals)
      const y = axisY + yAmp
      viga(`${id}:amp`, [X(lo), y - 6, X(lo), y, X(hi), y, X(hi), y - 6], { stroke: lilas, sw: 2 })
      texto(`${id}:ampT`, rot((X(lo) + X(hi)) / 2, y + 13), `amplitude: ${fmtNum(hi)} − ${fmtNum(lo)} = ${fmtNum(amplitude(vals))}`, { fs: 13, peso: 700, fill: lilas, dur: arrasta })
    }

    // The support: a triangle under the line, with "média 7" when it balances.
    if (temApoio && n) {
      const x = X(fulcro)
      prims.push({ k: `${id}:fulcro`, t: 'path', v: [x, axisY + 1.5, x + 13, axisY + 24, x - 13, axisY + 24], fechado: true, fill: alpha(amber, 0.92), stroke: '#000', sw: 1.5, dur: arrasta })
      const reta = Math.abs(ang) < 1e-9
      if (reta && (s.media || mesmo(fulcro, m))) texto(`${id}:fulcroT`, [clamp(x, 44, W - 44), axisY + 36], `média ${comUnidade(s, m)}`, { fs: 13, peso: 700, fill: amber, dur: arrasta })
    }

    // The touched value (Mexa "achar").
    if (it.marcado && ci === ativo && !fila) {
      const x = X(it.marcado.v)
      const cor = it.marcado.certo ? amber : rose
      viga(`${id}:marca`, [x, axisY + 6, x, dotTop - 2], { stroke: cor, sw: 2.5 })
      texto(`${id}:marcaT`, rot(clamp(x, 24, W - 24), dotTop - 12), fmtNum(it.marcado.v), { fs: 13, peso: 700, fill: cor })
    }

    linhasTexto.forEach((t, j) => {
      const fsT = clamp((W - 16) / Math.max(1, t.length * 0.56), 9, 13)
      texto(`${id}:linha:${j}`, [W / 2, axisY + baixo - linhasTexto.length * 20 + 12 + j * 20 - (s.amplitude ? 0 : 0)], t, { fs: fsT, peso: 600, fill: s.distancias && j === linhasTexto.length - 1 ? lilas : 'rgba(255,255,255,0.88)' })
    })

    if (ci === ativo) alvos.reta = { left, right, top: dotTop - 10, bottom: axisY + (temApoio ? 30 : 16), e }
  })
  return { prims: [...fundo, ...prims, ...topo], alvos }
}

export function Dados({ s, size, naFila, onPonto, errado, onValor, marcado, onFulcro, onSolta, tremer = 0 }: { s: DadosState; size: { w: number; h: number } } & DadosInteract) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (tremer > 0) void controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }, [tremer, controls])
  const [arrastando, setArrastando] = useState(false)

  const textH = s.rotulo ? 56 : 0
  const W = size.w
  const H = Math.max(160, Math.min(size.h - textH, 460))
  const { prims, alvos } = montar(s, W, H, { naFila, errado, marcado, onFulcro, arrastando })
  const cena = useCena(prims)
  const reta = alvos.reta

  const valorEm = (ev: React.PointerEvent<SVGRectElement>) => {
    const svg = ev.currentTarget.ownerSVGElement
    if (!svg || !reta) return undefined
    const x = ev.clientX - svg.getBoundingClientRect().left
    return reta.e.de + ((x - reta.left) / (reta.right - reta.left)) * (reta.e.ate - reta.e.de)
  }

  return (
    <motion.div className="flex h-full w-full select-none flex-col items-center justify-center gap-2" animate={controls} role="img" aria-label={s.rotulo ?? s.titulo ?? 'Gráfico de pontos'}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block shrink-0 overflow-visible">
        {cena.map((q) => (
          <Desenho key={q.p.k} q={q} />
        ))}
        {reta && onValor && (
          <rect
            x={reta.left - 10}
            y={reta.top}
            width={reta.right - reta.left + 20}
            height={reta.bottom - reta.top}
            fill="transparent"
            className="cursor-pointer"
            aria-label="reta dos dados"
            role="button"
            onPointerDown={(ev) => {
              const v = valorEm(ev)
              if (v !== undefined) onValor(v)
            }}
          />
        )}
        {onPonto &&
          alvos.pontos.map((p) => (
            <circle key={p.i} cx={p.x} cy={p.y} r={p.r} fill="transparent" className="cursor-pointer" onClick={() => onPonto(p.i)} aria-label={`ponto ${p.i + 1}`} role="button" />
          ))}
        {reta && onFulcro && (
          <rect
            x={0}
            y={reta.top}
            width={W}
            height={reta.bottom - reta.top + 20}
            fill="transparent"
            className="cursor-ew-resize touch-none"
            aria-label="arrastar o apoio"
            onPointerDown={(ev) => {
              ev.currentTarget.setPointerCapture(ev.pointerId)
              setArrastando(true)
              const v = valorEm(ev)
              if (v !== undefined) onFulcro(v)
            }}
            onPointerMove={(ev) => {
              if (!arrastando) return
              const v = valorEm(ev)
              if (v !== undefined) onFulcro(v)
            }}
            onPointerUp={() => {
              setArrastando(false)
              onSolta?.()
            }}
            onPointerCancel={() => setArrastando(false)}
          />
        )}
      </svg>
      {s.rotulo ? (
        <motion.p key={s.rotulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-4 text-center text-[20px] font-semibold leading-tight text-white">
          {s.rotulo}
        </motion.p>
      ) : null}
    </motion.div>
  )
}
