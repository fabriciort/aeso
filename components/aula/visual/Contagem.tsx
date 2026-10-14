'use client'

import { useEffect } from 'react'
import { motion, useAnimationControls } from 'framer-motion'
import { alpha, amber, clamp, Desenho, green, largura, rose, sky, useCena, type Prim } from './cena'
import { fmtNum } from './figura-geo'
import { caminhos, casosDaGrade, chanceDe, contaTexto, etapasDe, favoraveisDe, gradeDe, mostradasDe, textoCasa, type ContagemState, type CorCaso } from './contagem-geo'

export type { ContagemState }

// A contagem da U19: a árvore de possibilidades (cada etapa abre um ramo
// para cada opção; as escolhas se multiplicam: 3 × 2 = 6) e a tabela de
// dupla entrada (a grade de pares, como os 36 resultados de dois dados),
// com os casos favoráveis acesos e a chance escrita embaixo. As contas ficam
// em contagem-geo.ts.

export interface ContagemInteract {
  /** Mexa "favoráveis": um toque numa casa da grade (índice linha por linha). */
  onCaso?: (i: number) => void
  /** As casas que o aluno já acendeu (no lugar dos favoráveis do estado). */
  marcados?: number[]
  errado?: number | null
  /** Mexa "ramificar": um toque na árvore faz a próxima etapa crescer. */
  onRamo?: () => void
  tremer?: number
}

export const lilas = '#c4b5fd'
export const cinza = '#9ca3af'
const ETAPA = [amber, sky, green, lilas]
export const corCaso = (c: CorCaso | undefined, padrao: string) =>
  c === 'ambar' ? amber : c === 'azul' ? sky : c === 'verde' ? green : c === 'erro' ? rose : c === 'cinza' ? cinza : c === 'lilas' ? lilas : c === 'branco' ? '#f8fafc' : c === 'preto' ? '#52525b' : padrao
/** The ring of a piece: a black one gets a light ring, so it shows on the dark stage. */
export const bordaCaso = (c: CorCaso | undefined) => (c === 'preto' ? 'rgba(255,255,255,0.7)' : '#000')

/**
 * The chance, written in one line at y: "6 de 36 = 6/36 = 1/6 ≈ 16,7 %" (the fractions stacked).
 * Without `completa`, only "6 de 36".
 */
export function linhaChance(k: string, W: number, y: number, f: number, n: number, o: { completa: boolean; simplificada?: boolean; porcentagem?: boolean }): Prim[] {
  const c = chanceDe(f, n)
  type Peca = { t: string; cor?: string } | { num: number; den: number; cor?: string }
  const pecas: Peca[] = [{ t: c.de, cor: amber }]
  if (o.completa) {
    pecas.push({ t: '=' }, { num: f, den: n })
    if (o.simplificada && c.simples) pecas.push({ t: '=' }, { num: c.simples[0], den: c.simples[1], cor: amber })
    if (o.porcentagem) pecas.push({ t: c.exata ? '=' : '≈' }, { t: c.pct, cor: amber })
  }
  let fs = 17
  const larg = (p: Peca, z: number) => ('t' in p ? largura(p.t, z) : Math.max(fmtNum(p.num).length, fmtNum(p.den).length) * z * 0.6 + 8)
  const total = (z: number) => pecas.reduce((a, p) => a + larg(p, z) + 8, -8)
  while (fs > 11 && total(fs) > W - 16) fs--
  let x = W / 2 - total(fs) / 2
  const out: Prim[] = []
  pecas.forEach((p, i) => {
    const w = larg(p, fs)
    if ('t' in p) out.push({ k: `${k}:${i}`, t: 'text', v: [x + w / 2, y], texto: p.t, fs, peso: 700, fill: p.cor ?? '#fff' })
    else {
      out.push({ k: `${k}:${i}:n`, t: 'text', v: [x + w / 2, y - fs * 0.62], texto: fmtNum(p.num), fs, peso: 700, fill: p.cor ?? '#fff' })
      out.push({ k: `${k}:${i}:b`, t: 'path', v: [x + 2, y, x + w - 2, y], stroke: p.cor ?? '#fff', sw: 2 })
      out.push({ k: `${k}:${i}:d`, t: 'text', v: [x + w / 2, y + fs * 0.66], texto: fmtNum(p.den), fs, peso: 700, fill: p.cor ?? '#fff' })
    }
    x += w + 8
  })
  return out
}

interface Alvos {
  casas: { i: number; x: number; y: number; w: number; h: number }[]
}

function montarGrade(s: ContagemState, W: number, H: number, it: ContagemInteract): { prims: Prim[]; alvos: Alvos } {
  const g = gradeDe(s)!
  const prims: Prim[] = []
  const topo: Prim[] = []
  const alvos: Alvos = { casas: [] }
  const casos = casosDaGrade(g)
  const fav = favoraveisDe(casos, s.favoraveis)
  const marcando = it.marcados !== undefined
  const acesos = marcando ? it.marcados! : fav
  const mostraChance = marcando || s.chance === true
  const N = casos.length
  // The room under the grid does not change while the student marks (the grid never jumps).
  const rodape = mostraChance ? (s.chance ? 52 : 34) : s.conta === false ? 6 : 34
  const nomes = g.nomes
  const headTop = nomes ? 20 : 0
  const L = g.linhas.length
  const C = g.colunas.length
  const fsCab = 13
  const cabW = clamp(Math.max(Math.max(...g.linhas.map((o) => largura(o.nome, fsCab))) + 12, nomes ? largura(`${nomes[0]} ↓`, 11) * 1.15 + 10 : 0), 26, 110)
  const cabH = 24
  const areaW = W - cabW - 6
  const areaH = H - headTop - cabH - rodape - 6
  const cw = Math.min(areaW / C, 74)
  const ch = clamp(areaH / L, 16, Math.max(cw * 0.8, 30))
  const gx = cabW + (areaW - cw * C) / 2
  // The grid and what goes under it sit in the middle of the stage.
  const sobra = Math.max(0, (areaH - ch * L) / 2)
  const gy = sobra + headTop + cabH + 2
  if (nomes) {
    topo.push({ k: 'g:nomeC', t: 'text', v: [gx + (cw * C) / 2, sobra + 9], texto: `${nomes[1]} →`, fs: 13, peso: 600, fill: sky })
    topo.push({ k: 'g:nomeL', t: 'text', v: [Math.max(4, gx - 6 - largura(`${nomes[0]} ↓`, 11) * 1.15), gy - cabH / 2 - 2], texto: `${nomes[0]} ↓`, anchor: 'start', fs: 11, peso: 600, fill: amber })
  }
  g.colunas.forEach((o, c) => topo.push({ k: `g:cc:${c}`, t: 'text', v: [gx + cw * (c + 0.5), gy - cabH / 2], texto: o.nome, fs: clamp((cw - 4) / (o.nome.length * 0.56), 10, fsCab), peso: 700, fill: sky }))
  g.linhas.forEach((o, l) => topo.push({ k: `g:cl:${l}`, t: 'text', v: [gx - 8, gy + ch * (l + 0.5)], texto: o.nome, anchor: 'end', fs: clamp(ch * 0.6, 10, fsCab), peso: 700, fill: amber }))
  const maxT = Math.max(1, ...casos.map((k) => k.nome.length))
  const fsCasa = clamp(Math.min((cw - 6) / (maxT * 0.58), ch * 0.52), 9, 17)
  casos.forEach((k, i) => {
    const x = gx + cw * k.c!
    const y = gy + ch * k.l!
    const p = 1.5
    const aceso = acesos.includes(i)
    const errou = it.errado === i
    const cheia = i < g.preenchidas
    const fill = errou ? alpha(rose, 0.8) : aceso ? alpha(amber, 0.88) : 'rgba(255,255,255,0.06)'
    prims.push({ k: `g:c:${i}`, t: 'path', v: [x + p, y + p, x + cw - p, y + p, x + cw - p, y + ch - p, x + p, y + ch - p], fechado: true, fill, stroke: aceso ? amber : 'rgba(255,255,255,0.2)', sw: 1 })
    if (cheia && g.conteudo !== 'vazio') {
      const t = textoCasa(g, k.l!, k.c!)
      topo.push({ k: `g:t:${i}`, t: 'text', v: [x + cw / 2, y + ch / 2], texto: t, fs: fsCasa, peso: aceso ? 700 : 500, fill: aceso || errou ? '#fff' : 'rgba(255,255,255,0.88)', atraso: Math.min(600, i * 14) })
    }
    alvos.casas.push({ i, x, y, w: cw, h: ch })
  })
  const yb = gy + ch * L + 6
  if (mostraChance) {
    const completa = s.chance === true && (!marcando || acesos.length === fav.length)
    topo.push(...linhaChance('g:ch', W, yb + (s.chance ? 24 : 14), acesos.length, N, { completa, simplificada: s.simplificada, porcentagem: s.porcentagem }))
  } else if (s.conta !== false) topo.push({ k: 'g:conta', t: 'text', v: [W / 2, yb + 15], texto: contaTexto([L, C], s.unidade), fs: 18, peso: 700, fill: '#fff' })
  return { prims: [...prims, ...topo], alvos }
}

function montarArvore(s: ContagemState, W: number, H: number): { prims: Prim[]; alvos: Alvos } {
  const etapas = etapasDe(s)
  const prims: Prim[] = []
  const topo: Prim[] = []
  const L = etapas.length
  const k = mostradasDe(s, L)
  const folhas = caminhos(etapas)
  const N = Math.max(1, folhas.length)
  const temNomes = Array.isArray(s.nomes) && s.nomes.length > 0
  const top = temNomes ? 26 : 8
  const conta = s.conta !== false && k > 0
  // The room for the count is kept while the tree grows (the nodes never jump).
  const bottom = H - (s.conta !== false ? 40 : 8)
  const sp = (bottom - top) / N
  const r = clamp(sp * 0.22, 3.5, 6.5)
  const combos = s.combinacoes === true && k > 0
  const comboTexto = (c: number[]) => c.map((o, e) => etapas[e][o].nome).join(', ')
  // With the combinations, the last stage shown writes the whole path in place of its option.
  // Every stage keeps its room (growing a stage never moves the others); the names shrink to fit.
  const larguras = (z: number) => etapas.map((et, e) => (combos && e === k - 1 ? Math.max(...caminhos(etapas, k).map((c) => largura(comboTexto(c), z))) : Math.max(...et.map((o) => largura(o.nome, z)))) + r + 8)
  let fs = clamp(sp * 0.66, 10, 15)
  while (fs > 9 && W - 18 - larguras(fs).reduce((a, b) => a + b, 0) < 18 * L) fs -= 0.5
  const labelW = larguras(fs)
  const resto = W - 18 - labelW.reduce((a, b) => a + b, 0)
  const ramo = clamp(resto / Math.max(1, L), 18, 84)
  const xs = [12]
  for (let e = 0; e < L; e++) xs.push(xs[e] + (e === 0 ? 0 : labelW[e - 1]) + ramo + r)
  // The (whole) tree decides where each node goes: growing a stage never moves the others.
  const yDe = (prefixo: number[]) => {
    const tam = etapas.slice(prefixo.length).reduce((a, et) => a * et.length, 1)
    let idx = 0
    prefixo.forEach((o, e) => (idx = idx * etapas[e].length + o))
    const j0 = idx * tam
    return top + sp * (j0 + tam / 2)
  }
  const cam = Array.isArray(s.caminho) ? s.caminho.slice(0, k) : []
  const noCaminho = (p: number[]) => cam.length >= p.length && p.every((o, e) => cam[e] === o)
  if (temNomes)
    etapas.forEach((_, e) => {
      const nome = s.nomes?.[e]
      // The names of the stages still to grow show dim: the student sees what comes next.
      if (nome) topo.push({ k: `nome:${e}`, t: 'text', v: [xs[e + 1] + labelW[e] / 2 - r, 10], texto: nome, fs: 13, peso: 600, fill: ETAPA[e % 4], op: e < k ? 1 : 0.35, atraso: 200 })
    })
  // The root.
  const yRaiz = yDe([])
  prims.push({ k: 'raiz', t: 'circle', v: [xs[0], yRaiz, r + 1], fill: '#fff', stroke: '#000', sw: 1.5 })
  for (let e = 0; e < k; e++) {
    for (const p of caminhos(etapas, e + 1)) {
      const pai = p.slice(0, -1)
      const o = etapas[e][p[e]]
      const sx = e === 0 ? xs[0] + r + 2 : xs[e] + labelW[e - 1] - 2
      const sy = yDe(pai)
      const ex = xs[e + 1] - r - 1
      const ey = yDe(p)
      const lit = noCaminho(p)
      const key = p.join('.')
      const ordem = p[e] + (pai.length ? caminhos(etapas, e).findIndex((q) => q.join('.') === pai.join('.')) * etapas[e].length : 0)
      const atraso = Math.min(700, ordem * 45)
      prims.push({ k: `ramo:${key}`, t: 'path', v: [sx, sy, ex, ey], stroke: lit ? amber : 'rgba(255,255,255,0.45)', sw: lit ? 3 : 1.75, rota: [[sx, sy, sx, sy]], atraso, dur: 420 })
      const cor = o.cor ? corCaso(o.cor, ETAPA[e % 4]) : ETAPA[e % 4]
      prims.push({ k: `no:${key}`, t: 'circle', v: [xs[e + 1], ey, r], fill: cor, stroke: lit ? '#fff' : bordaCaso(o.cor), sw: lit ? 2 : 1.25, rota: [[sx, sy, r]], atraso, dur: 420 })
      const rotulo = combos && e === k - 1 ? comboTexto(p) : o.nome
      topo.push({ k: `rot:${key}`, t: 'text', v: [xs[e + 1] + r + 5, ey], texto: rotulo, anchor: 'start', fs, peso: lit ? 700 : 500, fill: lit ? amber : 'rgba(255,255,255,0.9)', atraso: atraso + 300, entrada: true })
    }
  }
  if (conta) topo.push({ k: 'conta', t: 'text', v: [W / 2, H - 18], texto: contaTexto(etapas.slice(0, k).map((et) => et.length), s.unidade), fs: 20, peso: 700, fill: '#fff' })

  return { prims: [...prims, ...topo], alvos: { casas: [] } }
}

export function Contagem({ s, size, onCaso, marcados, errado, onRamo, tremer = 0 }: { s: ContagemState; size: { w: number; h: number } } & ContagemInteract) {
  const controls = useAnimationControls()
  useEffect(() => {
    if (tremer > 0) void controls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.35 } })
  }, [tremer, controls])
  const textH = s.rotulo ? 56 : 0
  const W = size.w
  const H = Math.max(160, Math.min(size.h - textH, 460))
  const grade = gradeDe(s)
  const { prims, alvos } = grade ? montarGrade(s, W, H, { marcados, errado }) : montarArvore(s, W, H)
  const cena = useCena(prims)
  return (
    <motion.div className="flex h-full w-full select-none flex-col items-center justify-center gap-2" animate={controls} role="img" aria-label={s.rotulo ?? (grade ? 'Tabela de dupla entrada' : 'Árvore de possibilidades')}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block shrink-0 overflow-visible">
        {cena.map((q) => (
          <Desenho key={q.p.k} q={q} />
        ))}
        {onCaso &&
          alvos.casas.map((c) => (
            <rect key={c.i} x={c.x} y={c.y} width={c.w} height={c.h} fill="transparent" className="cursor-pointer" onClick={() => onCaso(c.i)} aria-label={`casa ${c.i + 1}`} role="button" />
          ))}
        {onRamo && <rect x={0} y={0} width={W} height={H} fill="transparent" className="cursor-pointer" onClick={onRamo} aria-label="abrir a próxima etapa" role="button" />}
      </svg>
      {s.rotulo ? (
        <motion.p key={s.rotulo} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="px-4 text-center text-[20px] font-semibold leading-tight text-white">
          {s.rotulo}
        </motion.p>
      ) : null}
    </motion.div>
  )
}
