// A balança da U15, sem React (para o visual, o Mexa e os testes): as peças de
// cada prato, quanto cada prato pesa, para que lado a balança inclina e a
// equação que ela mostra.

export type Lado = 'esquerda' | 'direita'

/** O que há num prato: caixas x, pesos de 1 e pesos maiores rotulados ("10"). */
export interface Prato {
  x?: number
  n?: number
  pesos?: number[]
}

export type Inclinacao = 'esquerda' | 'direita' | 'equilibrio'

/** Uma peça no prato: caixa (x), peso de 1 (1) ou peso rotulado (p). */
export interface PecaBalanca {
  id: string
  tipo: 'x' | '1' | 'p'
  /** O peso em números (1 ou o rótulo); 0 para a caixa. */
  valor: number
  /** O grupo (fileira) quando o prato está partido em grupos iguais. */
  grupo: number
}

/** Mais que isto num prato (ou num grupo), os pesos de 1 viram pesos de 10 e os que sobram. */
export const LIMITE_UNS = 20

const int = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0)

/** The plate's pieces, in groups of `k` (1 = no groups). Boxes and weights go round-robin; units are split evenly. */
export function pecasDe(prato: Prato | undefined, lado: Lado, k = 1): PecaBalanca[] {
  const g = Math.max(1, Math.round(k))
  const x = int(prato?.x)
  const n = int(prato?.n)
  const pesos = (prato?.pesos ?? []).map(int).filter((v) => v > 0)
  const out: PecaBalanca[] = []
  for (let i = 0; i < x; i++) out.push({ id: `${lado}:x:${i}`, tipo: 'x', valor: 0, grupo: i % g })
  for (let grupo = 0; grupo < g; grupo++) {
    const uns = Math.floor(n / g) + (grupo < n % g ? 1 : 0)
    const dezenas = uns > LIMITE_UNS ? Math.floor(uns / 10) : 0
    for (let j = 0; j < dezenas; j++) out.push({ id: `${lado}:d:${grupo}:${j}`, tipo: 'p', valor: 10, grupo })
    // Unit ids are global (unit j sits in group j % g), so the ids match with and without groups.
    for (let j = 0; j < uns - dezenas * 10; j++) out.push({ id: `${lado}:1:${grupo + (j + dezenas * 10) * g}`, tipo: '1', valor: 1, grupo })
  }
  pesos.forEach((v, i) => out.push({ id: `${lado}:p:${i}`, tipo: 'p', valor: v, grupo: i % g }))
  return out
}

/** What a list of pieces is worth: how many boxes and the number weights. */
export function contaPecas(pecas: PecaBalanca[]): { x: number; n: number } {
  return { x: pecas.filter((p) => p.tipo === 'x').length, n: pecas.reduce((s, p) => s + p.valor, 0) }
}

/** The plate written as one count of boxes and one number. */
export function pratoDe(prato: Prato | undefined): { x: number; n: number } {
  return { x: int(prato?.x), n: int(prato?.n) + (prato?.pesos ?? []).map(int).reduce((s, v) => s + v, 0) }
}

export function pesoDe(prato: { x?: number; n?: number; pesos?: number[] } | undefined, valor: number): number {
  const p = pratoDe(prato)
  return p.x * valor + p.n
}

/** The hidden value that balances the two plates, when there is exactly one. */
export function valorInferido(esquerda: Prato | undefined, direita: Prato | undefined): number | undefined {
  const a = pratoDe(esquerda)
  const b = pratoDe(direita)
  if (a.x === b.x) return undefined
  const v = (b.n - a.n) / (a.x - b.x)
  return Number.isFinite(v) ? v : undefined
}

/** Which plate goes down: `inclina` wins; with `valor`, the real weights decide; otherwise level. */
export function inclinacaoDe(esquerda: Prato | undefined, direita: Prato | undefined, valor?: number, inclina?: string): Inclinacao {
  if (inclina === 'esquerda' || inclina === 'direita' || inclina === 'equilibrio') return inclina
  if (typeof valor !== 'number') return 'equilibrio'
  const d = pesoDe(esquerda, valor) - pesoDe(direita, valor)
  return Math.abs(d) < 1e-9 ? 'equilibrio' : d > 0 ? 'esquerda' : 'direita'
}

/** "2x + 3", "x", "11", "0". */
export function ladoTexto(p: { x: number; n: number }, letra = 'x'): string {
  const t: string[] = []
  if (p.x) t.push(`${p.x === 1 ? '' : p.x}${letra}`)
  if (p.n) t.push(String(p.n))
  return t.length ? t.join(' + ') : '0'
}

/** The relation the balance shows: = level; > or < tilted, as an inequality; ≠ otherwise. */
export function relacaoDe(inc: Inclinacao, inequacao?: boolean): string {
  if (inc === 'equilibrio') return '='
  if (!inequacao) return '≠'
  return inc === 'esquerda' ? '>' : '<'
}

export function equacaoDe(esquerda: { x: number; n: number }, direita: { x: number; n: number }, letra = 'x', inc: Inclinacao = 'equilibrio', inequacao?: boolean): string {
  return `${ladoTexto(esquerda, letra)} ${relacaoDe(inc, inequacao)} ${ladoTexto(direita, letra)}`
}
