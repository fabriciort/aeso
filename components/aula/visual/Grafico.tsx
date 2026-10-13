'use client'

import { useEffect, useState } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { alpha, amber, arcoD, clamp, Desenho, DUR, gray, green, largura, rose, sky, useCena, type Prim } from './cena'
import { fmtNum } from './figura-geo'
import { dadosDe, destaquesDe, escalaDe, porcentagensDe, seriesDe, setoresDe, tipoDe, valorTexto, type CorGrafico, type Escala, type GraficoState } from './grafico-geo'

export type { GraficoState }

// Os gráficos de dados da U18: barras, linhas e setores. O eixo pode começar
// longe do 0 (o eixo cortado) e as marcas podem ter valores desiguais (a
// escala torta); com `honesto`, a versão honesta aparece ao lado. De um
// cartão para o outro, as barras crescem ou encolhem até o novo valor (o
// eixo que desce até o 0). As contas ficam em grafico-geo.ts.

export interface GraficoInteract {
  /** Mexa "apontar": um toque numa barra, num ponto da linha ou numa fatia. */
  onItem?: (i: number) => void
  /** O último toque errado (rosa). */
  errado?: number | null
  /** Mexa "ajustar": arrastar a barra `ativa` (o valor na altura do dedo) e soltar. */
  onAjuste?: (v: number) => void
  onSolta?: () => void
  /** Cresce a cada erro: o palco treme. */
  tremer?: number
}

const lilas = '#c4b5fd'
const cinza = '#9ca3af'
const PALETA = [amber, sky, green, rose, lilas, cinza]
/** The lines: the first one sky, the others never amber (amber is the highlight). */
const LINHAS = [sky, green, rose, lilas, cinza]
const corDe = (c: CorGrafico | undefined, padrao: string) => (c === 'azul' ? sky : c === 'erro' ? rose : c === 'verde' ? green : c === 'lilas' ? lilas : c === 'cinza' ? cinza : c === false ? gray : c ? amber : padrao)
const FS_NUM = 12

interface Painel {
  x: number
  y: number
  w: number
  h: number
}

interface Alvos {
  itens: { i: number; d?: string; x?: number; y?: number; w?: number; h?: number; r?: number }[]
  /** The plot area of the (first) panel, for the drag. */
  area?: { top: number; bottom: number; left: number; right: number; escala: Escala }
}

function montar(s: GraficoState, W: number, H: number, it: GraficoInteract & { arrastando?: boolean }): { prims: Prim[]; alvos: Alvos } {
  const prims: Prim[] = []
  const topo: Prim[] = []
  const alvos: Alvos = { itens: [] }
  const linha = (k: string, a: [number, number], b: [number, number], o: Partial<Prim> = {}) => prims.push({ k, t: 'path', v: [...a, ...b], stroke: gray, sw: 2, ...o })
  const texto = (k: string, at: [number, number], t: string, o: Partial<Prim> = {}) => topo.push({ k, t: 'text', v: at, texto: t, ...o })
  const dados = dadosDe(s)
  const tipo = tipoDe(s)
  const acesos = destaquesDe(s)
  let y0 = 0
  if (s.titulo) {
    texto('titulo', [W / 2, 11], s.titulo, { fs: clamp((W - 16) / Math.max(1, s.titulo.length * 0.56), 12, 16), peso: 600, fill: 'rgba(255,255,255,0.88)' })
    y0 = 26
  }

  // ---------------------------------------------------------------- sectors
  if (tipo === 'setores') {
    const valores = dados.map((d) => d.valor)
    const pcts = porcentagensDe(valores)
    const ang = setoresDe(valores)
    const mostraValor = s.valores !== false
    const legendas = dados.map((d, i) => `${d.rotulo}  ${s.antes || s.depois ? valorTexto(s, d.valor) : `${pcts[i]} %`}`)
    const lw = Math.max(0, ...legendas.map((t) => largura(t, 14))) + 24
    const lado = W >= 300 && W - lw - 24 >= 150
    const hh = H - y0
    const r = lado ? clamp(Math.min((hh - 16) / 2, (W - lw - 36) / 2), 50, 150) : clamp(Math.min((hh - dados.length * 24 - 24) / 2, W / 2 - 20), 46, 150)
    const bloco = lado ? 2 * r + 24 + lw : 0
    const cx = lado ? (W - bloco) / 2 + r : W / 2
    const cy = lado ? y0 + hh / 2 : y0 + r + 8
    dados.forEach((d, i) => {
      const cor = corDe(d.cor, PALETA[i % PALETA.length])
      const a0 = ang[i].de - 90
      const a1 = ang[i].ate - 90
      const meio = ((a0 + a1) / 2) * (Math.PI / 180)
      const sai = acesos.includes(i) ? 9 : 0
      const ox = cx + Math.cos(meio) * sai
      const oy = cy + Math.sin(meio) * sai
      const errou = it.errado === i
      prims.push({ k: `set:${i}`, t: 'wedge', v: [ox, oy, r, a0, a1], fill: cor, stroke: errou ? rose : '#000', sw: errou ? 3.5 : 2 })
      if (mostraValor && pcts[i] >= 7) {
        const rt = r * 0.62
        texto(`setp:${i}`, [ox + Math.cos(meio) * rt, oy + Math.sin(meio) * rt], `${pcts[i]} %`, { fs: clamp(r * 0.14, 12, 17), peso: 700 })
      }
      alvos.itens.push({ i, d: arcoD(ox, oy, r, a0, a1, true) })
      // The legend: a swatch and the name with the share.
      const lx = lado ? cx + r + 24 : W / 2 - lw / 2
      const ly = lado ? cy - (dados.length * 24) / 2 + 12 + i * 24 : cy + r + 22 + i * 24
      prims.push({ k: `legq:${i}`, t: 'path', v: [lx, ly - 6, lx + 12, ly - 6, lx + 12, ly + 6, lx, ly + 6], fechado: true, fill: cor })
      texto(`legt:${i}`, [lx + 20, ly], legendas[i], { anchor: 'start', fs: 14, peso: acesos.includes(i) ? 700 : 500, fill: acesos.includes(i) ? amber : 'rgba(255,255,255,0.9)' })
    })
    return { prims: [...prims, ...topo], alvos }
  }

  // ---------------------------------------------------------------- bars and lines, in one or two panels
  const series = seriesDe(s)
  const n = Math.max(dados.length, ...series.map((x) => x.valores.length))
  const honesto = Boolean(s.honesto)
  const titulos: [string, string] = Array.isArray(s.honesto) ? s.honesto : ['como veio', s.escala ? 'escala regular' : 'eixo no 0']
  const paineis: { p: Painel; e: Escala; id: string }[] = honesto
    ? [
        { p: { x: 0, y: y0 + 22, w: W / 2 - 6, h: H - y0 - 22 }, e: escalaDe(s), id: 'a' },
        { p: { x: W / 2 + 6, y: y0 + 22, w: W / 2 - 6, h: H - y0 - 22 }, e: escalaDe(s, true), id: 'b' },
      ]
    : [{ p: { x: 0, y: y0, w: W, h: H - y0 }, e: escalaDe(s), id: 'a' }]
  if (honesto) paineis.forEach(({ p }, j) => texto(`ptit:${j}`, [p.x + p.w / 2, y0 + 10], titulos[j], { fs: 13, peso: 600, fill: j ? green : 'rgba(255,255,255,0.75)' }))
  const nomeSerie = (si: number) => s.legenda?.[si] ?? series[si]?.nome
  const legenda = tipo === 'linhas' && series.length > 1 && series.some((_, si) => nomeSerie(si))

  paineis.forEach(({ p, e, id }, pi) => {
    const labs = e.marcas.map((v) => largura(fmtNum(v), FS_NUM))
    const padL = Math.max(...labs, 8) + 12
    const padT = 24 + (legenda ? 18 : 0)
    const padB = 26 + (s.rotuloX ? 18 : 0)
    const left = p.x + padL
    const right = p.x + p.w - 8
    const top = p.y + padT
    const bottom = p.y + p.h - padB
    const ph = Math.max(20, bottom - top)
    const pw = Math.max(20, right - left)
    const slot = pw / Math.max(1, n)
    const Y = (v: number) => bottom - e.pos(v) * ph
    const Xc = (i: number) => left + slot * (i + 0.5)

    // Grid, axis and the numbers.
    e.marcas.forEach((v) => {
      const y = Y(v)
      linha(`${id}:gy:${v}`, [left, y], [right, y], { stroke: 'rgba(255,255,255,0.10)', sw: 1, cap: 'butt' })
      linha(`${id}:ty:${v}`, [left - 4, y], [left, y], { stroke: gray, sw: 1.5, cap: 'butt' })
      texto(`${id}:ny:${v}`, [left - 7, y], fmtNum(v), { anchor: 'end', fs: FS_NUM, peso: 500, fill: 'rgba(255,255,255,0.75)' })
    })
    linha(`${id}:eixo:y`, [left, bottom], [left, top - 8], { stroke: gray, sw: 2 })
    linha(`${id}:eixo:x`, [left, bottom], [right, bottom], { stroke: gray, sw: 2 })
    if (s.quebra && !e.torta && e.de !== 0 && pi === 0) {
      const zz = [left, bottom - 4, left - 5, bottom - 8, left + 5, bottom - 13, left, bottom - 17]
      prims.push({ k: `${id}:quebra:f`, t: 'path', v: zz, stroke: '#000', sw: 6 })
      prims.push({ k: `${id}:quebra`, t: 'path', v: zz, stroke: gray, sw: 2 })
    }
    if (s.rotuloY) texto(`${id}:rotY`, [p.x + 4, p.y + 10], s.rotuloY, { anchor: 'start', fs: 12, peso: 500, fill: 'rgba(255,255,255,0.6)' })
    if (s.rotuloX) texto(`${id}:rotX`, [left + pw / 2, p.y + p.h - 8], s.rotuloX, { fs: 12, peso: 500, fill: 'rgba(255,255,255,0.6)' })

    // The category names under the axis.
    const maxLen = Math.max(1, ...dados.map((d) => d.rotulo.length))
    const fsCat = clamp((slot - 4) / (maxLen * 0.56), 11, 13)
    for (let i = 0; i < n; i++) {
      const rot = dados[i]?.rotulo
      if (rot) texto(`${id}:cat:${i}`, [Xc(i), bottom + 13], rot, { fs: fsCat, peso: 500, fill: acesos.includes(i) ? amber : 'rgba(255,255,255,0.8)' })
    }
    if (pi === 0) alvos.area = { top, bottom, left, right, escala: e }

    if (tipo === 'barras') {
      const bw = Math.min(56, slot * 0.62)
      const mostraValor = s.valores !== false
      const fsVal = clamp((slot - 2) / (Math.max(1, ...dados.map((d) => valorTexto(s, d.valor).length)) * 0.56), 11, 14)
      dados.forEach((d, i) => {
        const x = Xc(i)
        const yt = Y(d.valor)
        const ativa = it.onAjuste && i === (s.ativa ?? 0) && pi === 0
        const cor = it.errado === i && pi === 0 ? rose : acesos.includes(i) || ativa ? amber : corDe(d.cor, sky)
        const dur = ativa && it.arrastando ? 1 : DUR
        prims.push({ k: `${id}:bar:${i}`, t: 'path', v: [x - bw / 2, bottom, x + bw / 2, bottom, x + bw / 2, yt, x - bw / 2, yt], fechado: true, fill: alpha(cor, 0.82), stroke: cor, sw: 1, dur })
        if (ativa) prims.push({ k: `${id}:alca`, t: 'path', v: [x - bw / 2 - 6, yt, x + bw / 2 + 6, yt], stroke: '#fff', sw: 3, dash: '5 3', dur })
        if (mostraValor) texto(`${id}:val:${i}`, [x, yt - 11], valorTexto(s, d.valor), { fs: fsVal, peso: 700, fill: acesos.includes(i) || ativa ? amber : '#fff', dur })
        if (pi === 0) alvos.itens.push({ i, x: x - slot / 2, y: top - 10, w: slot, h: bottom - top + 24 })
      })
    } else {
      // Lines: one per series, a dot on each value.
      const mostraValor = s.valores === true
      series.forEach((se, si) => {
        const cor = corDe(se.cor, LINHAS[si % LINHAS.length])
        const pts = se.valores.map((v, i) => [Xc(i), Y(v)] as [number, number])
        if (pts.length > 1) prims.push({ k: `${id}:ln:${si}`, t: 'path', v: pts.flat(), stroke: cor, sw: 2.75, rota: [pts.map((q) => [q[0], bottom]).flat()], dur: 700 })
        pts.forEach((q, i) => {
          const aceso = si === 0 && acesos.includes(i)
          const errou = si === 0 && it.errado === i && pi === 0
          prims.push({ k: `${id}:lp:${si}:${i}`, t: 'circle', v: [...q, aceso ? 6.5 : 4.5], fill: errou ? rose : aceso ? amber : cor, stroke: '#000', sw: 1.5 })
          if (mostraValor || aceso) texto(`${id}:lv:${si}:${i}`, [q[0], q[1] - 14], valorTexto(s, se.valores[i]), { fs: 13, peso: 700, fill: aceso ? amber : '#fff' })
          if (si === 0 && pi === 0) alvos.itens.push({ i, x: q[0], y: q[1], r: Math.min(26, slot / 2) })
        })
      })
      if (legenda && pi === 0) {
        // The legend, at the top right (the axis name stays at the top left).
        let lx = right
        ;[...series.entries()].reverse().forEach(([si, se]) => {
          const nome = nomeSerie(si)
          if (!nome) return
          const cor = corDe(se.cor, LINHAS[si % LINHAS.length])
          lx -= largura(nome, 13)
          texto(`legt:${si}`, [lx, p.y + 10], nome, { anchor: 'start', fs: 13, peso: 500, fill: 'rgba(255,255,255,0.85)' })
          linha(`leg:${si}`, [lx - 22, p.y + 10], [lx - 6, p.y + 10], { stroke: cor, sw: 3 })
          lx -= 34
        })
      }
    }
  })
  return { prims: [...prims, ...topo], alvos }
}

// ---------------------------------------------------------------- the component

export function Grafico({ s, size, onItem, errado, onAjuste, onSolta, tremer = 0 }: { s: GraficoState; size: { w: number; h: number } } & GraficoInteract) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (tremer > 0) void controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }, [tremer, controls])
  const [arrastando, setArrastando] = useState(false)

  const textH = s.rotulo ? 56 : 0
  const W = size.w
  const H = Math.max(160, size.h - textH)
  const { prims, alvos } = montar(s, W, H, { onItem, errado, onAjuste, arrastando })
  const cena = useCena(prims)

  const valorNoToque = (e: React.PointerEvent<SVGRectElement>) => {
    const a = alvos.area
    const svg = e.currentTarget.ownerSVGElement
    if (!a || !svg || !onAjuste) return
    const r = svg.getBoundingClientRect()
    onAjuste(a.escala.valorEm((a.bottom - (e.clientY - r.top)) / (a.bottom - a.top)))
  }

  const a = alvos.area
  return (
    <motion.div className="flex h-full w-full select-none flex-col items-center justify-center gap-2" animate={controls} role="img" aria-label={s.rotulo ?? s.titulo ?? 'Gráfico'}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block shrink-0 overflow-visible">
        {cena.map((q) => (
          <Desenho key={q.p.k} q={q} />
        ))}
        {onItem &&
          alvos.itens.map((t) =>
            t.d ? (
              <path key={t.i} d={t.d} fill="transparent" className="cursor-pointer" onClick={() => onItem(t.i)} aria-label={`fatia ${t.i + 1}`} role="button" />
            ) : t.r ? (
              <circle key={t.i} cx={t.x} cy={t.y} r={t.r} fill="transparent" className="cursor-pointer" onClick={() => onItem(t.i)} aria-label={`ponto ${t.i + 1}`} role="button" />
            ) : (
              <rect key={t.i} x={t.x} y={t.y} width={t.w} height={t.h} fill="transparent" className="cursor-pointer" onClick={() => onItem(t.i)} aria-label={`barra ${t.i + 1}`} role="button" />
            ),
          )}
        {a && onAjuste && (
          <rect
            x={a.left}
            y={a.top - 16}
            width={a.right - a.left}
            height={a.bottom - a.top + 28}
            fill="transparent"
            className="cursor-ns-resize touch-none"
            aria-label="arrastar a barra"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              setArrastando(true)
              valorNoToque(e)
            }}
            onPointerMove={(e) => arrastando && valorNoToque(e)}
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
