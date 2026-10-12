import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'
import { mdc, mmc } from './divisibilidade'

// Unidade 7: frações (aulas 6 a 10). Comparar (mesmo pedaço ou a metade
// como régua), somar e subtrair com pedaços iguais, somar com pedaços
// diferentes (o MMC), multiplicar (fração de fração, a área do retângulo)
// e dividir (quantas vezes uma cabe na outra).
//
// Respostas em fração vão como escolha, com as frações em TeX nas opções:
// o teclado numérico só aceita inteiros. Cada gerador sorteia de uma lista
// de casos válidos montada uma vez, sem laços de tentativa.

type Op = { texto: string; certa?: boolean; erro?: string }
/** Opções em ordem embaralhada pela semente; a resposta é o índice da certa. */
function embaralhar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const resto = [...opcoes]
  const ordem: Op[] = []
  while (resto.length) ordem.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

/** Erros previsíveis de uma resposta numérica, sem marcar a certa. */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (Number.isInteger(valor) && valor >= 0 && valor !== certa && !(String(valor) in erros)) erros[String(valor)] = erro
  }
  return erros
}

/** A fração em TeX, como foi escrita (sem simplificar). */
const fr = (n: number, d: number) => `$\\frac{${n}}{${d}}$`
/** A fração na forma mais simples; um inteiro sai sem traço. */
function simples(n: number, d: number): string {
  const g = mdc(n, d)
  return d / g === 1 ? String(n / g) : fr(n / g, d / g)
}
const irredutivel = (n: number, d: number) => mdc(n, d) === 1
const ate = (de: number, a: number) => Array.from({ length: a - de + 1 }, (_, i) => de + i)

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })

// ---------------------------------------------------------------- aula 6: comparar

const IGUAIS = 'São iguais'

/** Pares de frações unitárias 1/a e 1/b, com a < b. */
const UNITARIAS = ate(2, 12).flatMap((a) => ate(a + 1, 12).map((b) => [a, b] as const))

export const compararFracoesN1: Gerador = {
  id: 'comparar-fracoes-n1',
  aula: 'B.U7.A6',
  nivel: 1,
  gerar(r) {
    const [a, b] = r.pick(UNITARIAS)
    const [x, y] = r.int(0, 1) === 0 ? [a, b] : [b, a]
    return {
      enunciado: `A mesma torta, cortada de dois jeitos. Qual pedaço é maior: ${fr(1, x)} ou ${fr(1, y)}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(1, a), certa: true },
        { texto: fr(1, b), erro: 'maior-denominador-maior-fracao' },
        { texto: IGUAIS },
      ]),
      dicas: [
        'Mais partes no mesmo inteiro: pedaços menores.',
        `${fr(1, a)} é o inteiro em ${a} partes; ${fr(1, b)}, em ${b}. Qual tem menos partes?`,
        `Em ${a} partes, cada pedaço é maior: ${fr(1, a)} > ${fr(1, b)}.`,
      ],
      visual: barra(
        { barras: [{ partes: x, pintadas: 1 }, { partes: y, pintadas: 1 }] },
        'As duas barras do mesmo tamanho, cada uma com 1 pedaço pintado. O pedaço da barra com menos partes é mais comprido.',
      ),
    }
  },
}

type Par = { p: number; q: number; s: number; t: number }
/** Mesmo denominador (p/q e s/q) ou mesmo numerador (p/q e p/t), frações menores que 1. */
const MESMO_DEN: Par[] = ate(3, 12).flatMap((q) => ate(1, q - 1).flatMap((p) => ate(p + 1, q - 1).map((s) => ({ p, q, s, t: q }))))
const MESMO_NUM: Par[] = ate(2, 6).flatMap((p) => ate(p + 1, 12).flatMap((q) => ate(q + 1, 12).map((t) => ({ p, q, s: p, t }))))

export const compararFracoesN2: Gerador = {
  id: 'comparar-fracoes-n2',
  aula: 'B.U7.A6',
  nivel: 2,
  gerar(r) {
    const mesmoNum = r.int(0, 1) === 0
    const { p, q, s, t } = r.pick(mesmoNum ? MESMO_NUM : MESMO_DEN)
    // Mesmo denominador: p/q < s/q. Mesmo numerador: p/q > p/t (q < t).
    const [maior, menor] = mesmoNum ? [fr(p, q), fr(s, t)] : [fr(s, t), fr(p, q)]
    const [x, y] = r.int(0, 1) === 0 ? [fr(p, q), fr(s, t)] : [fr(s, t), fr(p, q)]
    return {
      enunciado: `Qual é maior: ${x} ou ${y}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: maior, certa: true },
        mesmoNum ? { texto: menor, erro: 'maior-denominador-maior-fracao' } : { texto: menor },
        { texto: IGUAIS },
      ]),
      dicas: mesmoNum
        ? [
            `Os dois têm ${p} pedaços. Quem tem os pedaços maiores?`,
            `Pedaços de ${fr(1, q)} são maiores que pedaços de ${fr(1, t)}: ${q} partes contra ${t}.`,
            `${p} pedaços maiores valem mais: ${fr(p, q)} > ${fr(p, t)}.`,
          ]
        : [
            `Os pedaços são do mesmo tamanho: ${fr(1, q)}. É só contar.`,
            `Um tem ${p} pedaços, o outro tem ${s}.`,
            `${s} pedaços valem mais que ${p}: ${fr(s, q)} > ${fr(p, q)}.`,
          ],
    }
  },
}

/**
 * Pares p/q < s/t, as duas irredutíveis e diferentes de 1/2, em que a menor
 * tem os números maiores (p > s e q > t): quem compara pelos números erra.
 */
const ARMADILHAS: Par[] = []
for (const q of ate(3, 12))
  for (const p of ate(1, q - 1))
    for (const t of ate(2, q - 1))
      for (const s of ate(1, Math.min(p - 1, t - 1)))
        if (irredutivel(p, q) && irredutivel(s, t) && p * t < s * q && 2 * p !== q && 2 * s !== t && mmc(q, t) <= 60) ARMADILHAS.push({ p, q, s, t })

const RECEITAS_COMPARAR: ((x: string, y: string) => string)[] = [
  (x, y) => `Um bolo leva ${x} de xícara de açúcar. Um pudim leva ${y}. Qual leva mais açúcar?`,
  (x, y) => `Uma receita de pão usa ${x} de xícara de leite; a de broa, ${y}. Qual usa mais leite?`,
  (x, y) => `Ana já fez ${x} da receita. Bruno, ${y} da dele. Quem fez a parte maior?`,
]

export const compararFracoesN3: Gerador = {
  id: 'comparar-fracoes-n3',
  aula: 'B.U7.A6',
  nivel: 3,
  gerar(r) {
    const { p, q, s, t } = r.pick(ARMADILHAS)
    const [x, y] = r.int(0, 1) === 0 ? [fr(p, q), fr(s, t)] : [fr(s, t), fr(p, q)]
    const m = mmc(q, t)
    return {
      enunciado: r.pick(RECEITAS_COMPARAR)(x, y),
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(s, t), certa: true },
        { texto: fr(p, q), erro: 'maior-denominador-maior-fracao' },
        { texto: 'As duas, igual' },
      ]),
      dicas: [
        'Compare cada uma com a metade, ou deixe os pedaços do mesmo tamanho.',
        `Com o denominador ${m}: ${fr(p, q)} é ${fr((p * m) / q, m)} e ${fr(s, t)} é ${fr((s * m) / t, m)}.`,
        `${fr((s * m) / t, m)} > ${fr((p * m) / q, m)}: ${fr(s, t)} é maior, mesmo com números menores.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 7: somar com pedaços iguais

type Tres = { a: number; b: number; d: number }
const SOMAS_ATE_1: Tres[] = ate(3, 10).flatMap((d) => ate(1, d - 2).flatMap((a) => ate(1, d - 1 - a).map((b) => ({ a, b, d })))).filter(({ a, b, d }) => irredutivel(a + b, d))
const SOMAS_PASSA_1: Tres[] = ate(3, 10).flatMap((d) => ate(1, d - 1).flatMap((a) => ate(d - a + 1, d - 1).map((b) => ({ a, b, d })))).filter(({ a, b, d }) => irredutivel(a + b, d))
/** a/d − b/d, com a sobra diferente do que foi usado. */
const SUBTRACOES: Tres[] = ate(3, 12).flatMap((d) => ate(2, d - 1).flatMap((a) => ate(1, a - 1).map((b) => ({ a, b, d })))).filter(({ a, b }) => a !== 2 * b)

export const somarIguaisN1: Gerador = {
  id: 'somar-iguais-n1',
  aula: 'B.U7.A7',
  nivel: 1,
  gerar(r) {
    const { a, b, d } = r.pick(SOMAS_ATE_1)
    return {
      enunciado: `Quanto é ${fr(a, d)} + ${fr(b, d)}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(a + b, d), certa: true },
        { texto: fr(a + b, 2 * d), erro: 'soma-denominadores-iguais' },
        { texto: fr(a + b, d * d) },
      ]),
      dicas: [
        `Os pedaços são do mesmo tamanho: ${fr(1, d)}. Junte os pedaços.`,
        `${a} pedaços e mais ${b} pedaços. O tamanho do pedaço não muda.`,
        `${a} + ${b} = ${a + b}: ${fr(a, d)} + ${fr(b, d)} = ${fr(a + b, d)}.`,
      ],
      visual: barra(
        { barras: [{ partes: d, pintadas: a }, { partes: d, pintadas: b }] },
        'Duas barras com o mesmo corte, uma com cada parcela pintada. Ao conferir, os pedaços de baixo sobem para a barra de cima.',
      ),
    }
  },
}

export const somarIguaisN2: Gerador = {
  id: 'somar-iguais-n2',
  aula: 'B.U7.A7',
  nivel: 2,
  gerar(r) {
    const { a, b, d } = r.pick(SOMAS_PASSA_1)
    return {
      enunciado: `Quanto é ${fr(a, d)} + ${fr(b, d)}? A soma passa de 1 inteiro.`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(a + b, d), certa: true },
        { texto: fr(a + b, 2 * d), erro: 'soma-denominadores-iguais' },
        { texto: fr(a + b - d, d) },
      ]),
      dicas: [
        `Mesmo pedaço, ${fr(1, d)}: some só os numeradores.`,
        `${a} + ${b} = ${a + b} pedaços. Passou de ${d}: mais de 1 inteiro.`,
        `${fr(a + b, d)}: 1 inteiro e mais ${fr(a + b - d, d)}.`,
      ],
      visual: barra(
        { barras: [{ partes: d, pintadas: a }, { partes: d, pintadas: b }] },
        'As duas parcelas em barras de mesmo corte. Ao conferir, os pedaços enchem 1 inteiro e transbordam para um segundo.',
      ),
    }
  },
}

const RECEITAS_SOMA: ((x: string, y: string) => string)[] = [
  (x, y) => `Um bolo leva ${x} de xícara de açúcar na massa e ${y} na cobertura. Quanto açúcar ao todo?`,
  (x, y) => `Um molho leva ${x} de xícara de leite e depois mais ${y}. Quanto leite ao todo?`,
]
const RECEITAS_SOBRA: ((x: string, y: string) => string)[] = [
  (x, y) => `Você tinha ${x} de um pacote de farinha e usou ${y}. Quanto sobrou?`,
  (x, y) => `Havia ${x} de uma garrafa de leite. A receita usou ${y}. Quanto sobrou?`,
]

export const somarIguaisN3: Gerador = {
  id: 'somar-iguais-n3',
  aula: 'B.U7.A7',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const { a, b, d } = r.pick(SOMAS_ATE_1)
      return {
        enunciado: r.pick(RECEITAS_SOMA)(fr(a, d), fr(b, d)),
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: fr(a + b, d), certa: true },
          { texto: fr(a + b, 2 * d), erro: 'soma-denominadores-iguais' },
          { texto: fr(a + b, d * d) },
        ]),
        dicas: [
          'Juntar é somar. Os pedaços são do mesmo tamanho?',
          `Os dois são de ${fr(1, d)}: some só os numeradores.`,
          `${a} + ${b} = ${a + b}: ${fr(a + b, d)}.`,
        ],
      }
    }
    const { a, b, d } = r.pick(SUBTRACOES)
    return {
      enunciado: r.pick(RECEITAS_SOBRA)(fr(a, d), fr(b, d)),
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(a - b, d), certa: true },
        { texto: fr(a + b, d) },
        { texto: fr(b, d) },
      ]),
      dicas: [
        'Sobrou é o que tinha menos o que saiu.',
        `Os dois são de ${fr(1, d)}: subtraia só os numeradores.`,
        `${a} − ${b} = ${a - b}: sobrou ${fr(a - b, d)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 8: somar com pedaços diferentes

type Quatro = { a: number; b: number; c: number; d: number; m: number; n: number }
/** a/b + c/d, as duas irredutíveis, com a soma n/m irredutível no MMC. */
function somas(ok: (b: number, d: number) => boolean, maxM: number): Quatro[] {
  const lista: Quatro[] = []
  for (const b of ate(2, 12))
    for (const d of ate(2, 12)) {
      if (b === d || !ok(b, d)) continue
      const m = mmc(b, d)
      if (m > maxM) continue
      for (const a of ate(1, b - 1))
        for (const c of ate(1, d - 1)) {
          const n = (a * m) / b + (c * m) / d
          if (irredutivel(a, b) && irredutivel(c, d) && irredutivel(n, m)) lista.push({ a, b, c, d, m, n })
        }
    }
  return lista
}
/** Um denominador é múltiplo do outro (1/2 + 1/4): só uma fração muda. */
const UM_CABE_NO_OUTRO = somas((b, d) => d % b === 0 && d <= 3 * b, 12)
/** Nenhum cabe no outro e o MMC é menor que o produto (1/4 + 1/6: 12, não 24). */
const MMC_MENOR = somas((b, d) => b < d && d % b !== 0 && mmc(b, d) < b * d, 24)
/** Qualquer par de denominadores diferentes, em ordem crescente. */
const QUAISQUER = somas((b, d) => b < d, 36)

function opcoesSoma({ a, b, c, d, m, n }: Quatro): Op[] {
  const ops: Op[] = [
    { texto: fr(n, m), certa: true },
    { texto: fr(a + c, b + d), erro: 'soma-numeradores-e-denominadores' },
  ]
  // Muda o denominador e esquece de mudar o numerador.
  if (a + c !== n) ops.push({ texto: fr(a + c, m), erro: 'muda-so-um-termo' })
  return ops
}
const dicasSoma = ({ a, b, c, d, m, n }: Quatro): [string, string, string] => [
  'Pedaços de tamanhos diferentes não se somam direto. Primeiro, o mesmo tamanho.',
  `O MMC de ${b} e ${d} é ${m}: ${fr(a, b)} = ${fr((a * m) / b, m)} e ${fr(c, d)} = ${fr((c * m) / d, m)}.`,
  `${fr((a * m) / b, m)} + ${fr((c * m) / d, m)} = ${fr(n, m)}.`,
]

export const somarDiferentesN1: Gerador = {
  id: 'somar-diferentes-n1',
  aula: 'B.U7.A8',
  nivel: 1,
  gerar(r) {
    const q = r.pick(UM_CABE_NO_OUTRO)
    return {
      enunciado: `Quanto é ${fr(q.a, q.b)} + ${fr(q.c, q.d)}?`,
      formato: 'escolha',
      ...embaralhar(r, opcoesSoma(q)),
      dicas: dicasSoma(q),
      visual: barra(
        { barras: [{ partes: q.b, pintadas: q.a }, { partes: q.d, pintadas: q.c }] },
        `As duas parcelas em barras. Ao conferir, a barra de cima se corta até ficar em ${q.m} partes, como a de baixo.`,
      ),
    }
  },
}

export const somarDiferentesN2: Gerador = {
  id: 'somar-diferentes-n2',
  aula: 'B.U7.A8',
  nivel: 2,
  gerar(r) {
    const q = r.pick(MMC_MENOR)
    return {
      enunciado: `Quanto é ${fr(q.a, q.b)} + ${fr(q.c, q.d)}?`,
      formato: 'escolha',
      ...embaralhar(r, opcoesSoma(q)),
      dicas: dicasSoma(q),
    }
  },
}

const RECEITAS_DIFERENTES: ((x: string, y: string) => string)[] = [
  (x, y) => `Uma receita leva ${x} de xícara de leite e ${y} de água. Quanto líquido ao todo?`,
  (x, y) => `Um bolo leva ${x} de xícara de açúcar e ${y} de cacau. Quanto pó ao todo?`,
  (x, y) => `Você usou ${x} de um pacote de farinha no pão e ${y} na torta. Quanto usou ao todo?`,
]

export const somarDiferentesN3: Gerador = {
  id: 'somar-diferentes-n3',
  aula: 'B.U7.A8',
  nivel: 3,
  gerar(r) {
    const q = r.pick(QUAISQUER)
    const [x, y] = r.int(0, 1) === 0 ? [fr(q.a, q.b), fr(q.c, q.d)] : [fr(q.c, q.d), fr(q.a, q.b)]
    return {
      enunciado: r.pick(RECEITAS_DIFERENTES)(x, y),
      formato: 'escolha',
      ...embaralhar(r, opcoesSoma(q)),
      dicas: dicasSoma(q),
    }
  },
}

// ---------------------------------------------------------------- aula 9: multiplicar

const valor = (n: number, d: number) => n / d
const distintos = (vs: number[]) => new Set(vs.map((v) => v.toFixed(9))).size === vs.length

/** 1/b de c/d, com c/(bd) já na forma mais simples e o retângulo pequeno. */
const DE_UNITARIA = ate(2, 4).flatMap((b) => ate(2, 6).flatMap((d) => ate(1, d - 1).map((c) => ({ b, c, d })))).filter(
  ({ b, c, d }) => irredutivel(c, d) && irredutivel(c, b * d) && distintos([valor(c, b * d), valor(c * b, d), valor(1 + c, b + d)]),
)

export const multiplicarFracoesN1: Gerador = {
  id: 'multiplicar-fracoes-n1',
  aula: 'B.U7.A9',
  nivel: 1,
  gerar(r) {
    const { b, c, d } = r.pick(DE_UNITARIA)
    return {
      enunciado: `Quanto é ${fr(1, b)} de ${fr(c, d)}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(c, b * d), certa: true },
        { texto: fr(c * b, d), erro: 'multiplicar-sempre-aumenta' },
        { texto: fr(1 + c, b + d) },
      ]),
      dicas: [
        `${fr(1, b)} de alguma coisa é menos que ela. A resposta é menor que ${fr(c, d)}.`,
        `No retângulo: ${fr(c, d)} nas colunas, ${fr(1, b)} nas linhas. Conte os quadradinhos âmbar.`,
        `${c} quadradinhos âmbar de ${b * d}: ${fr(1, b)} × ${fr(c, d)} = ${fr(c, b * d)}.`,
      ],
      visual: {
        modelo: 'retangulo',
        estado: { linhas: b, colunas: d, faixas: [1, c] },
        esboco: `O retângulo de ${b} × ${d}: as ${c} primeiras colunas são ${c}/${d}, a primeira linha é 1/${b}; o cruzamento em âmbar.`,
      },
    }
  },
}

/** n colheres; fazer a/b da receita (menos que 1, ou mais: receita e meia). */
const PORCOES = ate(2, 4).flatMap((b) =>
  ate(1, 2 * b)
    .filter((a) => a !== b && irredutivel(a, b))
    .flatMap((a) => ate(2, 24).filter((n) => n % b === 0).map((n) => ({ a, b, n }))),
)
const RECEITAS_PORCAO: ((n: number, x: string) => string)[] = [
  (n, x) => `Uma receita leva ${n} colheres de açúcar. Você vai fazer ${x} da receita. Quantas colheres?`,
  (n, x) => `Uma receita leva ${n} ovos. Você vai fazer ${x} da receita. Quantos ovos?`,
  (n, x) => `Uma receita rende ${n} pães. Quantos pães rende ${x} da receita?`,
]

export const multiplicarFracoesN2: Gerador = {
  id: 'multiplicar-fracoes-n2',
  aula: 'B.U7.A9',
  nivel: 2,
  gerar(r) {
    const { a, b, n } = r.pick(PORCOES)
    const certa = (n * a) / b
    const menos = a < b
    return {
      enunciado: r.pick(RECEITAS_PORCAO)(n, fr(a, b)),
      formato: 'numero',
      resposta: certa,
      // Quem acha que multiplicar sempre aumenta não divide: n × a, maior que n.
      erros: menos ? mapa(certa, [[n * a, 'multiplicar-sempre-aumenta']]) : {},
      dicas: [
        menos ? `${fr(a, b)} é menos que 1: a resposta é menor que ${n}.` : `${fr(a, b)} é mais que 1: a resposta é maior que ${n}.`,
        `Primeiro ${fr(1, b)} de ${n}: ${n} ÷ ${b} = ${n / b}.`,
        `${fr(a, b)} são ${a} desses: ${a} × ${n / b} = ${certa}.`,
      ],
    }
  },
}

/** a/b de c/d, resultados com valores diferentes entre as opções. */
const FRACAO_DE_FRACAO = ate(2, 6).flatMap((b) =>
  ate(1, b - 1).flatMap((a) => ate(2, 6).flatMap((d) => ate(1, d - 1).map((c) => ({ a, b, c, d })))),
).filter(
  ({ a, b, c, d }) =>
    a > 1 &&
    irredutivel(a, b) &&
    irredutivel(c, d) &&
    distintos([valor(a * c, b * d), valor(b * c, a * d), valor(a + c, b + d), valor(a * c, d)]),
)
const RECEITAS_FRACAO: ((x: string, y: string) => string)[] = [
  (x, y) => `Você vai fazer ${x} de uma receita que leva ${y} de xícara de óleo. Quanto óleo?`,
  (x, y) => `Uma receita leva ${y} de xícara de leite. Quanto leite vai em ${x} da receita?`,
]

export const multiplicarFracoesN3: Gerador = {
  id: 'multiplicar-fracoes-n3',
  aula: 'B.U7.A9',
  nivel: 3,
  gerar(r) {
    const { a, b, c, d } = r.pick(FRACAO_DE_FRACAO)
    return {
      enunciado: r.pick(RECEITAS_FRACAO)(fr(a, b), fr(c, d)),
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: simples(a * c, b * d), certa: true },
        { texto: simples(b * c, a * d), erro: 'multiplicar-sempre-aumenta' },
        { texto: simples(a + c, b + d) },
        { texto: simples(a * c, d), erro: 'muda-so-um-termo' },
      ]),
      dicas: [
        `${fr(a, b)} da receita é menos que a receita: menos que ${fr(c, d)}.`,
        `${fr(a, b)} de ${fr(c, d)} é ${fr(a, b)} × ${fr(c, d)}: numeradores vezes numeradores, denominadores vezes denominadores.`,
        `${fr(a * c, b * d)}, que é ${simples(a * c, b * d)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 10: dividir

const RECEITAS_CABE: ((n: number, x: string) => string)[] = [
  (n, x) => `Quantos copos de ${x} L você enche com ${n} L de suco?`,
  (n, x) => `Você tem ${n} xícaras de farinha. Cada receita usa ${x} de xícara. Quantas receitas dá?`,
  (n, x) => `Quantos potes de ${x} kg você enche com ${n} kg de doce?`,
]

const UNITARIOS = ate(2, 5).flatMap((d) => ate(2, 6).map((n) => ({ d, n })))

export const dividirFracoesN1: Gerador = {
  id: 'dividir-fracoes-n1',
  aula: 'B.U7.A10',
  nivel: 1,
  gerar(r) {
    const { d, n } = r.pick(UNITARIOS)
    const certa = n * d
    return {
      enunciado: r.pick(RECEITAS_CABE)(n, fr(1, d)),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[n / d, 'dividir-sempre-diminui']]),
      dicas: [
        `A pergunta é quantos ${fr(1, d)} cabem em ${n}. Cabem muitos.`,
        `Em cada inteiro cabem ${d} pedaços de ${fr(1, d)}.`,
        `${n} inteiros × ${d} = ${certa}: ${n} ÷ ${fr(1, d)} = ${certa}.`,
      ],
      visual: barra(
        { partes: d, inteiros: n, rotulos: true, semFracao: true },
        `${n} inteiros lado a lado, cada um cortado em ${d}. Ao conferir, os pedaços se acendem um a um, contados.`,
      ),
    }
  },
}

/** n ÷ c/d com resposta inteira; c > 1 para o numerador pesar. */
const COPOS = ate(3, 6).flatMap((d) =>
  ate(2, d - 1)
    .filter((c) => irredutivel(c, d))
    .flatMap((c) => ate(1, 6).filter((n) => (n * d) % c === 0 && (n * d) / c <= 12 && n * d <= 24).map((n) => ({ c, d, n }))),
)

export const dividirFracoesN2: Gerador = {
  id: 'dividir-fracoes-n2',
  aula: 'B.U7.A10',
  nivel: 2,
  gerar(r) {
    const { c, d, n } = r.pick(COPOS)
    const certa = (n * d) / c
    const saltos = Array.from({ length: certa }, (_, i) => [(i * c) / d, ((i + 1) * c) / d, `${c}/${d}`])
    return {
      enunciado: r.pick(RECEITAS_CABE)(n, fr(c, d)),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[(n * c) / d, 'dividir-sempre-diminui']]),
      dicas: [
        `Quantas vezes ${fr(c, d)} cabe em ${n}? Dividir por fração menor que 1 dá mais que ${n}.`,
        `Em ${n} cabem ${n * d} pedaços de ${fr(1, d)}. Cada ${fr(c, d)} usa ${c} deles.`,
        `${n * d} ÷ ${c} = ${certa}: ${n} ÷ ${fr(c, d)} = ${n} × ${fr(d, c)} = ${certa}.`,
      ],
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: n, passo: 1 / d, fracoes: d, marcas: [0, n], saltos },
        esboco: `A reta de 0 a ${n}, marcada de 1/${d} em 1/${d}. Ao conferir, os saltos de ${c}/${d} aparecem um depois do outro, contados.`,
      },
    }
  },
}

/** a/b ÷ c/d, com c/d < a/b (cabe pelo menos uma vez) e valores distintos nas opções. */
const DIVISOES = ate(2, 8).flatMap((b) =>
  ate(1, b - 1).flatMap((a) => ate(2, 8).flatMap((d) => ate(1, d - 1).map((c) => ({ a, b, c, d })))),
).filter(({ a, b, c, d }) => irredutivel(a, b) && irredutivel(c, d) && c * b < a * d)
const RECEITAS_DIVIDIR: ((x: string, y: string) => string)[] = [
  (x, y) => `Você tem ${x} de xícara de leite. Cada receita usa ${y}. Quantas receitas dá?`,
  (x, y) => `Quantos potes de ${y} kg você enche com ${x} kg de geleia?`,
  (x, y) => `Quantas doses de ${y} de xícara cabem em ${x} de xícara de óleo?`,
]

export const dividirFracoesN3: Gerador = {
  id: 'dividir-fracoes-n3',
  aula: 'B.U7.A10',
  nivel: 3,
  gerar(r) {
    const { a, b, c, d } = r.pick(DIVISOES)
    return {
      enunciado: r.pick(RECEITAS_DIVIDIR)(fr(a, b), fr(c, d)),
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: simples(a * d, b * c), certa: true },
        { texto: simples(b * c, a * d), erro: 'inverte-a-fracao-errada' },
        { texto: simples(a * c, b * d), erro: 'dividir-sempre-diminui' },
      ]),
      dicas: [
        `Quantas vezes ${fr(c, d)} cabe em ${fr(a, b)}? Cabe pelo menos uma vez.`,
        `Inverta só a que divide: ${fr(a, b)} × ${fr(d, c)}.`,
        `${fr(a * d, b * c)}, que é ${simples(a * d, b * c)}.`,
      ],
    }
  },
}

export const GERADORES_U7B: Gerador[] = [
  compararFracoesN1,
  compararFracoesN2,
  compararFracoesN3,
  somarIguaisN1,
  somarIguaisN2,
  somarIguaisN3,
  somarDiferentesN1,
  somarDiferentesN2,
  somarDiferentesN3,
  multiplicarFracoesN1,
  multiplicarFracoesN2,
  multiplicarFracoesN3,
  dividirFracoesN1,
  dividirFracoesN2,
  dividirFracoesN3,
]
