import { describe, expect, it } from 'vitest'
import { GERADORES_U17 } from '@/content/matematica/geradores/solidos'
import { rng } from '@/lib/formation/rng'
import type { Gerador, Item } from '@/lib/formation/schema'

// Cada teste lê o enunciado (as medidas em negrito) e refaz a conta por conta
// própria, sem usar as funções do gerador. Faces, arestas e vértices saem de
// montar o sólido: os cantos como pontos, as arestas como pares de cantos e
// as faces pela relação de Euler (V − A + F = 2), que é conferida nos dois
// sólidos contados à mão. Se uma rede de 6 quadrados fecha um cubo, o teste
// descobre rolando um dado pelos quadrados. Os volumes contam cubinhos um a
// um (ou multiplicam em ponto flutuante, com π = 3,14), e as superfícies
// somam as 6 faces uma por uma.

const g = (id: string) => GERADORES_U17.find((x) => x.id === id)!
const itens = (ger: Gerador) => Array.from({ length: 300 }, (_, i) => ger.gerar(rng(i + 1)))

const negritos = (s: string) => [...s.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1])
/** '1,5 m' → 1.5; '12 cm²' → 12. */
const numero = (s: string) => {
  const m = s.match(/\d+(,\d+)?/)
  expect(m, `sem número em "${s}"`).not.toBeNull()
  return Number(m![0].replace(',', '.'))
}
const medidas = (item: Item) => negritos(item.enunciado).map(numero)
/** A resposta (ou um erro) como o aluno digita: 219,8 ou '219,8' → 219.8. */
const valor = (v: string | number) => {
  expect(String(v), 'sem menos nem ponto').toMatch(/^\d+(,\d+)?$/)
  return Number(String(v).replace(',', '.'))
}
const perto = (a: number, b: number) => Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b))
/** O erro mapeado para a resposta errada que vale `v`. */
const erroPara = (item: Item, v: number) => {
  const k = Object.keys(item.erros).find((t) => perto(valor(t), v))
  return k === undefined ? undefined : item.erros[k]
}
/**
 * Os erros previsíveis, na ordem em que o gerador os põe: cada valor aponta
 * para o seu erro. Fica de fora o valor que repete a certa ou um anterior
 * (o mesmo número não pode apontar para dois erros) e o que não cabe em
 * centésimos, que o aluno não digitaria.
 */
function esperaErros(item: Item, pares: [number, string][]) {
  const certa = valor(item.resposta)
  const usados: number[] = []
  for (const [v, id] of pares) {
    const pula = !perto(Math.round(v * 100), v * 100) || v <= 0 || perto(v, certa) || usados.some((u) => perto(u, v))
    usados.push(v)
    if (!pula) expect(erroPara(item, v), `${item.enunciado}: o erro que vale ${v}`).toBe(id)
  }
}
const confere = (item: Item, certa: number) => expect(perto(valor(item.resposta), certa), `${item.enunciado}: ${item.resposta} ≠ ${certa}`).toBe(true)

// ---------------------------------------------------------------- sólidos montados

type P3 = [number, number, number]
interface Poliedro {
  V: number
  A: number
  F: number
}
/** Os cantos e as arestas, contados; as faces pela relação de Euler. */
function poliedro(cantos: P3[], arestas: [number, number][]): Poliedro {
  const V = new Set(cantos.map((p) => p.join(','))).size
  const A = new Set(arestas.map(([a, b]) => [Math.min(a, b), Math.max(a, b)].join('-'))).size
  return { V, A, F: 2 - V + A }
}
/** A base de n lados como um polígono regular, em z = 0. */
const poligono = (n: number): P3[] => Array.from({ length: n }, (_, i) => [Math.round(1000 * Math.cos((2 * Math.PI * i) / n)), Math.round(1000 * Math.sin((2 * Math.PI * i) / n)), 0])
function prisma(n: number): Poliedro {
  const base = poligono(n)
  const cantos = [...base, ...base.map(([x, y]) => [x, y, 1] as P3)]
  const arestas: [number, number][] = []
  for (let i = 0; i < n; i++) arestas.push([i, (i + 1) % n], [n + i, n + ((i + 1) % n)], [i, n + i])
  return poliedro(cantos, arestas)
}
function piramide(n: number): Poliedro {
  const cantos = [...poligono(n), [0, 0, 1] as P3]
  const arestas: [number, number][] = []
  for (let i = 0; i < n; i++) arestas.push([i, (i + 1) % n], [i, n])
  return poliedro(cantos, arestas)
}
/** A caixa: os 8 cantos e as arestas, pares de cantos que diferem numa medida só. */
function caixa(c: number, l: number, h: number): Poliedro {
  const cantos: P3[] = []
  for (const x of [0, c]) for (const y of [0, l]) for (const z of [0, h]) cantos.push([x, y, z])
  const arestas: [number, number][] = []
  cantos.forEach((p, i) => cantos.forEach((q, j) => j > i && p.filter((v, k) => v !== q[k]).length === 1 && arestas.push([i, j])))
  return poliedro(cantos, arestas)
}

// ---------------------------------------------------------------- o dado que rola pela rede

type V3 = [number, number, number]
/** Rola o dado para o lado d (no chão): o que apontava para d vai para baixo, o de baixo vai para −d. */
function rola(v: V3, d: V3): V3 {
  const a = v[0] * d[0] + v[1] * d[1]
  const b = v[2]
  return [v[0] - a * d[0] + b * d[0], v[1] - a * d[1] + b * d[1], -a]
}
/** A rede fecha um cubo se, rolando o dado por todos os quadrados, cada quadrado fica sob uma face diferente. */
function fechaCubo(quadrados: [number, number][]): boolean {
  const chave = (q: [number, number]) => q.join(',')
  const em = new Set(quadrados.map(chave))
  // As 6 faces do dado, pela direção para onde apontam.
  const inicio: V3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]
  const visto = new Map<string, V3[]>([[chave(quadrados[0]), inicio]])
  const fila: [number, number][] = [quadrados[0]]
  while (fila.length) {
    const q = fila.shift()!
    const faces = visto.get(chave(q))!
    for (const d of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]] as V3[]) {
      const p: [number, number] = [q[0] + d[0], q[1] + d[1]]
      if (!em.has(chave(p)) || visto.has(chave(p))) continue
      visto.set(chave(p), faces.map((f) => rola(f, d)))
      fila.push(p)
    }
  }
  if (visto.size !== quadrados.length) return false
  const embaixo = [...visto.values()].map((fs) => fs.findIndex((f) => f[2] === -1))
  return new Set(embaixo).size === 6
}
const ORD: Record<string, number> = { '1º': 0, '2º': 1, '3º': 2, '4º': 3, '5º': 4 }
/** Lê "Uma fila de 4 quadrados, com mais um em cima do 2º e outro embaixo do 3º." e monta os quadrados. */
function rede(enunciado: string): [number, number][] {
  const n = Number(enunciado.match(/fila de (\d) quadrados/)![1])
  const qs: [number, number][] = Array.from({ length: n }, (_, i) => [i, 0])
  for (const m of enunciado.matchAll(/(em cima|embaixo) do (\dº)/g)) qs.push([ORD[m[2]], m[1] === 'em cima' ? 1 : -1])
  return qs
}

describe('U17 · geradores', () => {
  it('9 geradores, 3 por aula, níveis 1 a 3; visual só no nível 1', () => {
    expect(GERADORES_U17).toHaveLength(9)
    for (const aula of ['B.U17.A1', 'B.U17.A2', 'B.U17.A3']) {
      expect(GERADORES_U17.filter((x) => x.aula === aula).map((x) => x.nivel)).toEqual([1, 2, 3])
    }
    for (const ger of GERADORES_U17) {
      for (const item of itens(ger)) {
        if (ger.nivel > 1) expect(item.visual, ger.id).toBeUndefined()
        else expect(item.visual?.modelo, ger.id).toBe('solido')
      }
    }
  })
  it('nenhum erro vale a certa; sem hífen no lugar do menos; medidas com espaço que não quebra', () => {
    for (const ger of GERADORES_U17) {
      for (const item of itens(ger)) {
        const fora = (t: string) => t.replace(/\$[^$]*\$/g, '')
        for (const t of [item.enunciado, ...item.dicas, ...(item.opcoes ?? [])]) {
          expect(fora(t), `${ger.id}: hífen no lugar do menos em "${t}"`).not.toMatch(/(^|[\s(])-\s*\d|\d\s*-\s*\d/)
          expect(fora(t), `${ger.id}: unidade sem o espaço que não quebra em "${t}"`).not.toMatch(/\d (cm|m|dm|L|cm²|m²|dm²|cm³|m³|dm³)(?![\wÀ-ÿ²³])/)
          expect(t, `${ger.id}: π sem ≈`).not.toMatch(/π = 3,14/)
        }
        expect(item.dicas).toHaveLength(3)
        expect(item.sinal, 'nenhuma resposta é negativa').toBeUndefined()
        if (item.formato === 'escolha') {
          expect(new Set(item.opcoes).size, 'opções diferentes').toBe(item.opcoes!.length)
          for (const k of Object.keys(item.erros)) expect(Number(k)).not.toBe(item.resposta)
          continue
        }
        expect(item.formato).toBe('numero')
        const r = valor(item.resposta)
        expect(r, item.enunciado).toBeGreaterThan(0)
        if (typeof item.resposta === 'string') expect(item.resposta).toMatch(/,/)
        for (const t of Object.keys(item.erros)) expect(perto(valor(t), r), `${item.enunciado}: o erro "${t}" vale a certa`).toBe(false)
      }
    }
  })
  it('as contas de conferência batem com contas feitas à mão', () => {
    expect(caixa(4, 3, 2)).toEqual({ V: 8, A: 12, F: 6 })
    expect(prisma(3)).toEqual({ V: 6, A: 9, F: 5 })
    expect(prisma(6)).toEqual({ V: 12, A: 18, F: 8 })
    expect(piramide(4)).toEqual({ V: 5, A: 8, F: 5 })
    // A cruz da caixa fecha; a fila de 5 e os dois do mesmo lado, não.
    expect(fechaCubo([[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [1, -1]])).toBe(true)
    expect(fechaCubo([[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [3, -1]])).toBe(true)
    expect(fechaCubo([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [1, 1]])).toBe(false)
    expect(fechaCubo([[0, 0], [1, 0], [2, 0], [3, 0], [0, 1], [2, 1]])).toBe(false)
    expect(rede('Uma fila de 4 quadrados, com mais um em cima do 2º e outro embaixo do 4º.')).toEqual([[0, 0], [1, 0], [2, 0], [3, 0], [1, 1], [3, -1]])
  })
})

describe('U17 · aula 1: planificações', () => {
  it('planificacao-n1: faces, arestas ou vértices da caixa, do cubo e do prisma, com o desenho', () => {
    const vistos = new Set<string>()
    for (const item of itens(g('planificacao-n1'))) {
      const m = item.enunciado.match(/^Quantas \*\*(faces|arestas|vértices)\*\* tem (esta caixa|este cubo|este prisma de base triangular)\?$/)
      expect(m, item.enunciado).not.toBeNull()
      const [, pede, nome] = m!
      vistos.add(`${nome}:${pede}`)
      const e = item.visual!.estado as { solido?: string; comprimento?: number; largura?: number; altura?: number; ocultas?: boolean }
      let s: Poliedro
      if (nome === 'este prisma de base triangular') {
        expect(e.solido).toBe('prisma')
        s = prisma(3)
      } else {
        expect(e.solido ?? 'caixa').toBe(nome === 'este cubo' ? 'cubo' : 'caixa')
        s = caixa(e.comprimento ?? 3, e.largura ?? 3, e.altura ?? 3)
      }
      const certa = pede === 'faces' ? s.F : pede === 'arestas' ? s.A : s.V
      expect(item.resposta, item.enunciado).toBe(certa)
      expect(e.ocultas === true, 'arestas e vértices com as de trás tracejadas').toBe(pede !== 'faces')
      if (pede === 'faces') expect(erroPara(item, 3)).toBe('conta-so-o-que-ve')
      if (pede === 'arestas') expect(erroPara(item, 2 * s.A)).toBe('conta-aresta-duas-vezes')
      if (nome !== 'este prisma de base triangular' && pede === 'vértices') expect(erroPara(item, 7)).toBe('conta-so-o-que-ve')
      if (nome !== 'este prisma de base triangular' && pede === 'arestas') expect(erroPara(item, 9)).toBe('conta-so-o-que-ve')
    }
    expect(vistos.size).toBe(9)
  })
  it('planificacao-n2: em que o sólido se abre, a largura do rótulo e se a rede fecha um cubo', () => {
    // Quantas peças tem cada sólido aberto.
    const PECAS: Record<string, number> = { 'uma caixa de sapato': 6, 'um cubo': 6, 'um prisma de base triangular': 5, 'uma lata, um cilindro': 3 }
    const pecas = (t: string) => [...t.matchAll(/\d+/g)].reduce((s, m) => s + Number(m[0]), 0)
    const vistos = { pecas: 0, diametro: 0, raio: 0, fecha: 0, naoFecha: 0 }
    for (const item of itens(g('planificacao-n2'))) {
      const t = item.enunciado
      let m: RegExpMatchArray | null
      if ((m = t.match(/^Aberto na planificação, (.+) vira o quê\?$/))) {
        vistos.pecas++
        const certa = item.opcoes![item.resposta as number]
        expect(pecas(certa), t).toBe(PECAS[m[1]])
        if (m[1] === 'um prisma de base triangular') expect(certa).toMatch(/triângulo/)
        if (m[1] === 'uma lata, um cilindro') expect(certa).toMatch(/círculo/)
        if (m[1] === 'um cubo') expect(certa).toMatch(/quadrado/)
        // A errada que esquece as faces de trás: as mesmas peças, menos delas.
        const ids = Object.entries(item.erros)
        expect(ids, t).toHaveLength(1)
        const [i, id] = ids[0]
        expect(id).toBe('conta-so-o-que-ve')
        const menos = item.opcoes![Number(i)]
        expect(pecas(menos), t).toBeLessThan(PECAS[m[1]])
        expect(menos.replace(/\d+/g, '').replace(/s\b/g, ''), t).toBe(certa.replace(/\d+/g, '').replace(/s\b/g, ''))
      } else if (/fila de/.test(t)) {
        const fecha = fechaCubo(rede(t))
        if (fecha) vistos.fecha++
        else vistos.naoFecha++
        expect(item.opcoes).toEqual(['Sim', 'Não'])
        expect(item.resposta, t).toBe(fecha ? 0 : 1)
        if (!fecha) expect(item.erros['0']).toBe('toda-cruz-fecha-cubo')
      } else {
        const [x] = medidas(item)
        const peloDiametro = /de diâmetro/.test(t)
        const diametro = peloDiametro ? x : 2 * x
        if (peloDiametro) vistos.diametro++
        else vistos.raio++
        confere(item, 3.14 * diametro)
        expect(erroPara(item, diametro), t).toBe('lateral-com-o-diametro')
        esperaErros(item, peloDiametro ? [[diametro, 'lateral-com-o-diametro'], [3.14 * (diametro / 2), 'confunde-raio-diametro']] : [[3.14 * (diametro / 2), 'confunde-raio-diametro'], [diametro, 'lateral-com-o-diametro']])
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(10)
  })
  it('planificacao-n3: prismas e pirâmides de outras bases', () => {
    const ADJ: Record<string, number> = { triangular: 3, quadrada: 4, pentagonal: 5, hexagonal: 6, octogonal: 8 }
    for (const item of itens(g('planificacao-n3'))) {
      const m = item.enunciado.match(/^Quantas \*\*(faces|arestas|vértices)\*\* tem (um prisma|uma pirâmide) de base (\w+) \((\d) lados\)\?$/)
      expect(m, item.enunciado).not.toBeNull()
      const [, pede, solido, adj, lados] = m!
      const n = Number(lados)
      expect(ADJ[adj]).toBe(n)
      const s = solido === 'um prisma' ? prisma(n) : piramide(n)
      const certa = pede === 'faces' ? s.F : pede === 'arestas' ? s.A : s.V
      expect(item.resposta, item.enunciado).toBe(certa)
      if (pede === 'arestas') expect(erroPara(item, 2 * certa)).toBe('conta-aresta-duas-vezes')
      // Esquecer as bases (prisma) ou a base (pirâmide); nos vértices, ficar com os de uma base só.
      else expect(erroPara(item, n)).toBe('conta-so-o-que-ve')
    }
  })
})

/** Os cubinhos de 1 contados um a um. */
const cubinhos = (c: number, l: number, h: number) => {
  let n = 0
  for (let x = 0; x < c; x++) for (let y = 0; y < l; y++) for (let z = 0; z < h; z++) n++
  return n
}
/** As 6 faces da caixa, uma por uma. */
const faces = (c: number, l: number, h: number) => [c * h, c * h, l * h, l * h, c * l, c * l]
const soma = (xs: number[]) => xs.reduce((s, x) => s + x, 0)

describe('U17 · aula 2: volume', () => {
  it('volume-solidos-n1: a caixa em cubinhos, com a camada do fundo', () => {
    for (const item of itens(g('volume-solidos-n1'))) {
      const [c, l, h] = medidas(item)
      expect(item.resposta, item.enunciado).toBe(cubinhos(c, l, h))
      const e = item.visual!.estado as Record<string, unknown>
      expect([e.comprimento, e.largura, e.altura, e.baseCheia]).toEqual([c, l, h, true])
      esperaErros(item, [
        [cubinhos(c, l, 1), 'volume-so-a-base'],
        [c + l + h, 'soma-no-lugar-de-multiplicar'],
        [soma(faces(c, l, h)), 'confunde-volume-superficie'],
      ])
    }
  })
  it('volume-solidos-n2: o prisma de base triangular e o cilindro', () => {
    const vistos = { prisma: 0, base: 0, raio: 0 }
    for (const item of itens(g('volume-solidos-n2'))) {
      const t = item.enunciado
      const ms = medidas(item)
      if (t.startsWith('A base de um prisma')) {
        vistos.prisma++
        const [b, a, H] = ms
        // A área do triângulo pela fórmula do cadarço, com o canto de cima em qualquer lugar.
        const pts = [[0, 0], [b, 0], [1, a]]
        const tri = Math.abs(pts.reduce((s, p, i) => s + p[0] * pts[(i + 1) % 3][1] - pts[(i + 1) % 3][0] * p[1], 0)) / 2
        confere(item, tri * H)
        esperaErros(item, [
          [b * a * H, 'area-do-triangulo-sem-metade'],
          [b + a + H, 'soma-no-lugar-de-multiplicar'],
        ])
      } else if (t.startsWith('O fundo de uma lata')) {
        vistos.base++
        const [A, h] = ms
        confere(item, A * h)
        esperaErros(item, [[A + h, 'soma-no-lugar-de-multiplicar']])
      } else {
        vistos.raio++
        expect(t).toMatch(/π ≈ 3,14/)
        const [r, h] = ms
        confere(item, 3.14 * r * r * h)
        esperaErros(item, [
          [2 * 3.14 * r * h, 'confunde-area-perimetro'],
          [2 * r * 2 * r * h, 'area-do-circulo-como-quadrado'],
        ])
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(30)
  })
  it('volume-solidos-n3: caixas-d\'água, aquários e tanques, em litros', () => {
    const vistos = { caixa: 0, aquario: 0, tanque: 0 }
    for (const item of itens(g('volume-solidos-n3'))) {
      const t = item.enunciado
      const ms = medidas(item)
      if (t.startsWith("Uma caixa-d'água")) {
        vistos.caixa++
        const [c, l, h] = ms
        const m3 = c * l * h
        confere(item, m3 * 1000)
        esperaErros(item, [
          [m3, 'confunde-m3-com-litro'],
          [m3 * 100, 'converte-volume-como-comprimento'],
        ])
      } else if (t.startsWith('Um aquário')) {
        vistos.aquario++
        const [c, l, h] = ms
        const cm3 = cubinhos(c, l, h)
        confere(item, cm3 / 1000)
        esperaErros(item, [[cm3 / 100, 'converte-volume-como-comprimento']])
      } else {
        vistos.tanque++
        expect(t).toMatch(/π ≈ 3,14/)
        const [r, h] = ms
        confere(item, 3.14 * r * r * h * 1000)
        esperaErros(item, [
          [3.14 * r * r * h, 'confunde-m3-com-litro'],
          [3.14 * r * r * h * 100, 'converte-volume-como-comprimento'],
        ])
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(30)
  })
})

describe('U17 · aula 3: área de superfície', () => {
  it('area-superficie-n1: a caixa aberta, com as áreas das faces', () => {
    for (const item of itens(g('area-superficie-n1'))) {
      const [c, l, h] = medidas(item)
      expect(item.resposta, item.enunciado).toBe(soma(faces(c, l, h)))
      const e = item.visual!.estado as Record<string, unknown>
      expect([e.comprimento, e.largura, e.altura, e.aberto, e.areas]).toEqual([c, l, h, true, true])
      esperaErros(item, [
        [soma(faces(c, l, h)) / 2, 'conta-so-o-que-ve'],
        [cubinhos(c, l, h), 'confunde-volume-superficie'],
      ])
    }
  })
  it('area-superficie-n2: o cubo, a caixa e o rótulo da lata', () => {
    const vistos = { cubo: 0, caixa: 0, rotulo: 0 }
    for (const item of itens(g('area-superficie-n2'))) {
      const t = item.enunciado
      const ms = medidas(item)
      if (/cubo/.test(t)) {
        vistos.cubo++
        const [a] = ms
        expect(item.resposta).toBe(soma(faces(a, a, a)))
        esperaErros(item, [
          [soma(faces(a, a, a)) / 2, 'conta-so-o-que-ve'],
          [4 * a * a, 'conta-so-o-que-ve'],
          [cubinhos(a, a, a), 'confunde-volume-superficie'],
        ])
      } else if (/caixa/.test(t)) {
        vistos.caixa++
        const [c, l, h] = ms
        expect(item.resposta).toBe(soma(faces(c, l, h)))
        esperaErros(item, [
          [soma(faces(c, l, h)) / 2, 'conta-so-o-que-ve'],
          [cubinhos(c, l, h), 'confunde-volume-superficie'],
        ])
      } else {
        vistos.rotulo++
        expect(t).toMatch(/π ≈ 3,14/)
        const [r, h] = ms
        // O retângulo do rótulo: a volta (π diâmetros) vezes a altura.
        confere(item, 3.14 * (2 * r) * h)
        esperaErros(item, [
          [3.14 * r * h, 'confunde-raio-diametro'],
          [2 * r * h, 'lateral-com-o-diametro'],
          [3.14 * r * r * h, 'confunde-volume-superficie'],
        ])
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(30)
  })
  it('area-superficie-n3: as paredes, as latas de tinta e a lata inteira', () => {
    const vistos = { paredes: 0, latas: 0, lata: 0 }
    for (const item of itens(g('area-superficie-n3'))) {
      const t = item.enunciado
      const ms = medidas(item)
      if (t.startsWith('Você vai pintar')) {
        vistos.paredes++
        const [c, l, h] = ms
        // As 6 faces do quarto, sem o chão e o teto.
        const paredes = soma(faces(c, l, h).slice(0, 4))
        confere(item, paredes)
        esperaErros(item, [
          [paredes + c * l, 'pinta-faces-a-mais'],
          [soma(faces(c, l, h)), 'pinta-faces-a-mais'],
          [paredes / 2, 'conta-so-o-que-ve'],
        ])
      } else if (t.startsWith('As paredes')) {
        vistos.latas++
        const [c, l, h, k] = ms
        const paredes = soma(faces(c, l, h).slice(0, 4))
        let latas = 0
        while (latas * k < paredes - 1e-9) latas++
        expect(item.resposta, t).toBe(latas)
        expect(perto(paredes / k, Math.round(paredes / k)), 'a conta não dá exata').toBe(false)
        esperaErros(item, [[latas - 1, 'ignora-contexto-do-resto']])
      } else {
        vistos.lata++
        expect(t).toMatch(/π ≈ 3,14/)
        const [r, h] = ms
        const tampa = 3.14 * r * r
        const rotulo = 3.14 * 2 * r * h
        confere(item, tampa + tampa + rotulo)
        esperaErros(item, [
          [tampa + rotulo, 'conta-so-o-que-ve'],
          [rotulo, 'conta-so-o-que-ve'],
          [tampa * h, 'confunde-volume-superficie'],
        ])
      }
    }
    for (const [k, n] of Object.entries(vistos)) expect(n, k).toBeGreaterThan(30)
  })
})
