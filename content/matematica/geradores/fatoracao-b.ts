import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Exercícios da unidade 2 de Álgebra e Funções, parte B. Aula 4, fator comum
// em evidência; aula 5, fatorar x² + bx + c; aula 6, reconhecer os produtos
// notáveis.
//
// O teclado só digita números. Por isso os itens pedem um número (o que
// falta num parêntese, o fator comum, um expoente, um lado com x dado) ou
// dão as fatorações como opções de `escolha`, escritas em TeX. Todo
// polinômio é uma lista de termos [coeficiente, expoente], escrita por
// `poli` na ordem da lista (do grau maior para o menor). Erros com resposta
// negativa se escrevem com o menos verdadeiro (−5).

// ---------------------------------------------------------------- ferramentas

/** Um termo: [coeficiente, expoente de x]. [3, 2] é 3x². */
type Termo = [number, number]
type Par = [number, number]

/** Espaço que não quebra, entre o número e a unidade. */
const NB = '\u00a0'

/** O número como se escreve no texto, com o menos verdadeiro: −12. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))

/** A parte com x em TeX: '', 'x', 'x^2', 'x^{12}'. */
const potencia = (e: number) => (e === 0 ? '' : e === 1 ? 'x' : e < 10 ? `x^${e}` : `x^{${e}}`)

/** Um termo em TeX, sem o sinal: (3, 2) → '3x^2'; (1, 1) → 'x'; (5, 0) → '5'. */
function corpo(k: number, e: number): string {
  const a = Math.abs(k)
  if (e === 0) return String(a)
  return `${a === 1 ? '' : a}${potencia(e)}`
}

/** Um monômio em TeX: (−3, 1) → '-3x'. */
const mono = (k: number, e: number) => `${k < 0 ? '-' : ''}${corpo(k, e)}`

/** Os termos em TeX, na ordem da lista: [[3, 2], [−12, 1]] → '3x^2 - 12x'. */
function poli(termos: Termo[]): string {
  const ts = termos.filter(([k]) => k !== 0)
  if (!ts.length) return '0'
  return ts.map(([k, e], i) => (i === 0 ? mono(k, e) : `${k < 0 ? ' - ' : ' + '}${corpo(k, e)}`)).join('')
}

/** Um monômio como o retângulo lê: '3x', '−2x²', 4. */
function lado(k: number, e: number): string | number {
  if (e === 0) return k
  const a = Math.abs(k)
  const sobre = e === 1 ? '' : e === 2 ? '²' : e === 3 ? '³' : `^${e}`
  return `${k < 0 ? '−' : ''}${a === 1 ? '' : a}x${sobre}`
}

/** O trinômio x² + bx + c em TeX. */
const trinomio = (b: number, c: number) => poli([[1, 2], [b, 1], [c, 0]])

/** Um binômio x ± b em TeX: 'x + 3', 'x - 2'. */
const xMais = (b: number) => `x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`

/** (x + p)(x + q) em TeX. */
const fatores = ([p, q]: Par) => `(${xMais(p)})(${xMais(q)})`

/** O maior divisor comum. */
function mdc(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) [a, b] = [b, a % b]
  return a
}

/** Erros previsíveis (como o aluno digitaria), sem a certa e sem repetir. */
function mapa(certa: number, pares: [number, string | undefined][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    const k = num(valor)
    if (!erro || valor === certa || k in erros) continue
    erros[k] = erro
  }
  return erros
}

/** Embaralha com o rng (Fisher–Yates). */
function embaralha<T>(r: Rng, xs: T[]): T[] {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada,
 * embaralhada. Cada opção é TeX sem os cifrões; o item a mostra como $...$
 * (ou como texto, com `tex: false`).
 */
function escolha(r: Rng, opcoes: [string, string | undefined][], tex = true): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const ordem = embaralha(r, opcoes.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = opcoes[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => (tex ? `$${opcoes[o][0]}$` : opcoes[o][0])), resposta: ordem.indexOf(0), erros }
}

/** Um inteiro de `de` a `ate`, com o sinal sorteado. */
const comSinal = (r: Rng, de: number, ate: number) => r.int(de, ate) * (r.int(0, 1) === 0 ? 1 : -1)

// ---------------------------------------------------------------- aula 4: fator comum em evidência

export const evidenciaN1: Gerador = {
  id: 'fatoracao-evidencia-n1',
  aula: 'AF.U2.A4',
  nivel: 1,
  gerar(r) {
    // acx² + adx = ax(cx + □), com c e d sem divisor comum: ax é o maior fator.
    // Tentativas limitadas, com uma saída fixa: o rng de borda repete sempre o mesmo sorteio.
    const a = r.int(2, 5)
    let c = 2
    let d = 3
    for (let i = 0; i < 20; i++) {
      const c1 = r.int(1, 4)
      const d1 = r.int(2, 9)
      if (mdc(c1, d1) === 1) {
        c = c1
        d = d1
        break
      }
    }
    const area = poli([[a * c, 2], [a * d, 1]])
    const cx = mono(c, 1)
    const visual: Visual = {
      modelo: 'retangulo',
      estado: { base: [lado(c, 1), '?'], altura: [`${a}x`], areas: [[lado(a * c, 2), lado(a * d, 1)]] },
      esboco: `O retângulo de ${a}x de altura, com ${a * c}x² e ${a * d}x dentro; em cima, ${lado(c, 1)} e "?".`,
    }
    return {
      enunciado: `Ponha em evidência: $${area} = ${a}x(${cx} + \\square)$. Qual número falta?`,
      formato: 'numero',
      resposta: d,
      erros: mapa(d, [[a * d, 'evidencia-esquece-termo']]),
      dicas: [
        'Dentro do parêntese fica **cada termo** dividido pelo fator comum.',
        `Que número, vezes $${a}x$, dá $${a * d}x$?`,
        `$${a * d}x \\div ${a}x = ${d}$. Confere: $${a}x(${cx} + ${d}) = ${area}$.`,
      ],
      visual,
    }
  },
}

/** Os números do fator comum que têm um divisor menor (para o erro de parar num divisor comum que não é o maior). */
const COMPOSTOS = [4, 6, 8, 9, 10, 12] as const
/** O menor divisor maior que 1. */
const menorPrimo = (n: number) => [2, 3, 5, 7].find((p) => n % p === 0) ?? n

/**
 * g·a·x^(m+p) ± g·b·x^m, com a e b sem divisor comum: o maior fator comum é g·x^m.
 * Devolve os termos e as partes, com uma saída fixa se o rng não ajudar.
 */
function comFatorComum(r: Rng, g: number, m: number, p: number): { termos: Termo[]; a: number; b: number } {
  let a = 2
  let b = -3
  for (let i = 0; i < 20; i++) {
    const a1 = r.int(1, 5)
    const b1 = comSinal(r, 1, 7)
    if (mdc(a1, b1) === 1) {
      a = a1
      b = b1
      break
    }
  }
  return { termos: [[g * a, m + p], [g * b, m]], a, b }
}

export const evidenciaN2: Gerador = {
  id: 'fatoracao-evidencia-n2',
  aula: 'AF.U2.A4',
  nivel: 2,
  gerar(r) {
    // O maior fator comum de dois termos: o MDC dos números e a menor potência.
    const g = r.pick(COMPOSTOS)
    const m = r.int(1, 2)
    const p = r.int(1, 2)
    const { termos, a, b } = comFatorComum(r, g, m, p)
    const d = menorPrimo(g)
    const certa = mono(g, m)
    const dentro = poli([[a, p], [b, 0]])
    return {
      enunciado: `Qual é o maior fator comum de $${poli(termos)}$?`,
      formato: 'escolha',
      ...escolha(r, [
        [certa, undefined],
        [String(g), 'fator-comum-incompleto'],
        [mono(d, m), 'mdc-nao-e-o-maior'],
        [mono(g, m + p), 'fator-comum-maior-potencia'],
      ]),
      dicas: [
        'O maior fator comum: o **MDC** dos números e a **menor** potência da letra.',
        `O MDC de ${g * a} e ${Math.abs(g * b)} é ${g}. A letra: $${potencia(m + p)}$ e $${potencia(m)}$ têm $${potencia(m)}$ em comum.`,
        `O fator é $${certa}$: $${poli(termos)} = ${certa}(${dentro})$.`,
      ],
    }
  },
}

export const evidenciaN3: Gerador = {
  id: 'fatoracao-evidencia-n3',
  aula: 'AF.U2.A4',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['sem-x', 'numero', 'expoente'] as const)
    if (tipo === 'sem-x') {
      // gax³ + gbx² + gcx = gx(ax² + bx + c), com a, b e c sem divisor comum.
      const g = r.int(2, 6)
      let a = 1
      let b = -2
      let c = 3
      for (let i = 0; i < 20; i++) {
        const a1 = r.int(1, 4)
        const b1 = comSinal(r, 1, 6)
        const c1 = r.int(0, 2) === 0 ? comSinal(r, 1, 1) : comSinal(r, 2, 9)
        if (mdc(mdc(a1, b1), c1) === 1) {
          a = a1
          b = b1
          c = c1
          break
        }
      }
      const termos: Termo[] = [[g * a, 3], [g * b, 2], [g * c, 1]]
      const dentro = poli([[a, 2], [b, 1], [c, 0]])
      const erros: [number, string | undefined][] = [
        [g * c, 'evidencia-esquece-termo'],
        [-c, 'termo-perde-o-sinal'],
      ]
      if (Math.abs(c) === 1) erros.push([0, 'evidencia-esquece-termo'])
      return {
        enunciado: `Ponha em evidência o maior fator comum de $${poli(termos)}$. Qual número fica sem x dentro do parêntese?`,
        formato: 'numero',
        resposta: c,
        sinal: true,
        erros: mapa(c, erros),
        dicas: [
          'O maior fator comum: o MDC dos números e a menor potência da letra. Cada termo dividido por ele fica dentro.',
          `O fator comum é $${g}x$. O número sem x vem de $${mono(g * c, 1)} \\div ${g}x$, com o sinal.`,
          `$${poli(termos)} = ${g}x(${dentro})$: o número é ${num(c)}.`,
        ],
      }
    }
    const g = r.pick(COMPOSTOS)
    const m = r.int(1, 3)
    const p = r.int(1, 3)
    const { termos } = comFatorComum(r, g, m, p)
    const t = poli(termos)
    if (tipo === 'numero') {
      // O número do fator comum: o MDC, não um divisor menor.
      const menores = [2, 3, 4, 5, 6].filter((d) => d < g && g % d === 0)
      return {
        enunciado: `O maior fator comum de $${t}$ é $\\square ${potencia(m)}$. Qual é o número?`,
        formato: 'numero',
        resposta: g,
        erros: mapa(g, menores.map((d): [number, string] => [d, 'mdc-nao-e-o-maior'])),
        dicas: [
          'O número do fator comum é o **MDC** dos coeficientes: o maior que divide os dois.',
          `Os divisores comuns de ${termos[0][0]} e ${Math.abs(termos[1][0])}: procure o maior.`,
          `O MDC é ${g}: o fator comum é $${mono(g, m)}$.`,
        ],
      }
    }
    // O expoente do fator comum: a menor potência.
    return {
      enunciado: `O maior fator comum de $${t}$ é $${g}x^{\\square}$. Qual é o expoente?`,
      formato: 'numero',
      resposta: m,
      erros: mapa(m, [
        [m + p, 'fator-comum-maior-potencia'],
        [0, 'fator-comum-incompleto'],
      ]),
      dicas: [
        'A letra sai com a **menor** potência: a que está em todos os termos.',
        `$${potencia(m + p)}$ tem ${m + p} fatores x; $${potencia(m)}$ tem ${m}. Quantos estão nos dois?`,
        `Saem ${m}: o fator comum é $${mono(g, m)}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: fatorar x² + bx + c

/** Os pares (p ≤ q) com azulejos que cabem no palco e ao menos duas opções erradas. */
const PARES_AZULEJOS: readonly Par[] = [[1, 4], [1, 5], [1, 6], [1, 7], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4]]

/** Os pares de números inteiros (positivos, p ≤ q) com produto c. */
const paresProduto = (c: number): Par[] => Array.from({ length: c }, (_, i) => i + 1).filter((d) => c % d === 0 && d <= c / d).map((d): Par => [d, c / d])
/** Os pares de números inteiros (positivos, p ≤ q) com soma b. */
const paresSoma = (b: number): Par[] => Array.from({ length: Math.floor(b / 2) }, (_, i): Par => [i + 1, b - i - 1])

export const trinomioN1: Gerador = {
  id: 'fatoracao-trinomio-n1',
  aula: 'AF.U2.A5',
  nivel: 1,
  gerar(r) {
    // Os azulejos de x² + bx + c: que par de números fecha o retângulo?
    const [p, q] = r.pick(PARES_AZULEJOS)
    const b = p + q
    const c = p * q
    const igual = (x: Par) => x[0] === p && x[1] === q
    const produto = embaralha(r, paresProduto(c).filter((x) => !igual(x)))
    const soma = embaralha(r, paresSoma(b).filter((x) => !igual(x) && x[0] * x[1] !== c))
    // Uma errada de cada tipo, quando há, e a terceira do que sobrar.
    const erradas: [Par, string][] = []
    if (produto.length) erradas.push([produto.shift()!, 'fatores-com-a-soma-errada'])
    if (soma.length) erradas.push([soma.shift()!, 'fatores-com-o-produto-errado'])
    const resto: [Par, string][] = [...produto.map((x): [Par, string] => [x, 'fatores-com-a-soma-errada']), ...soma.map((x): [Par, string] => [x, 'fatores-com-o-produto-errado'])]
    if (resto.length) erradas.push(resto[0])
    const par = ([a, b2]: Par) => `${a} e ${b2}`
    const visual: Visual = {
      modelo: 'livre',
      estado: { azulejos: { fatorar: [b, c] } },
      esboco: `Os azulejos de x² + ${b}x + ${c}, soltos: o x², ${b} barras e ${c} quadradinhos.`,
    }
    return {
      enunciado: `Os azulejos de $${trinomio(b, c)}$ fecham num retângulo de lados $(x + p)$ e $(x + q)$. Que par de números serve?`,
      formato: 'escolha',
      ...escolha(r, [[par([p, q]), undefined], ...erradas.map(([x, e]): [string, string] => [par(x), e])], false),
      dicas: [
        `Os ${c} quadradinhos formam um retângulo de p por q, e as ${b} barras fecham o contorno.`,
        `Procure dois números com produto ${c} (os quadradinhos) e soma ${b} (as barras).`,
        `${p} · ${q} = ${c} e ${p} + ${q} = ${b}: $${trinomio(b, c)} = ${fatores([p, q])}$.`,
      ],
      visual,
    }
  },
}

/** Os pares de inteiros (com sinal) com produto c. */
function paresComSinal(c: number): Par[] {
  const out: Par[] = []
  for (let d = 1; d <= Math.abs(c); d++) {
    if (c % d !== 0) continue
    out.push([d, c / d], [-d, -c / d])
  }
  return out
}

export const trinomioN2: Gerador = {
  id: 'fatoracao-trinomio-n2',
  aula: 'AF.U2.A5',
  nivel: 2,
  gerar(r) {
    // x² + bx + c com sinais: a certa contra o sinal trocado, a soma errada e o produto errado.
    // Tentativas limitadas, com uma saída fixa: o rng de borda repete sempre o mesmo sorteio.
    let p = 2
    let q = -3
    let outro: Par = [1, -6]
    let somaCerta: Par = [3, -4]
    for (let i = 0; i < 30; i++) {
      const p1 = comSinal(r, 1, 7)
      const q1 = comSinal(r, 1, 7)
      const b1 = p1 + q1
      const c1 = p1 * q1
      if (b1 === 0 || (p1 > 0 && q1 > 0)) continue
      const outros = paresComSinal(c1).filter(([x, y]) => x + y !== b1 && x + y !== -b1)
      if (!outros.length) continue
      const s = p1 + (r.int(0, 1) === 0 ? 1 : -1)
      const sc: Par = [s, b1 - s]
      if (s === 0 || sc[1] === 0 || s * sc[1] === c1) continue
      p = p1
      q = q1
      outro = r.pick(outros)
      somaCerta = sc
      break
    }
    const b = p + q
    const c = p * q
    return {
      enunciado: `Fatore: $${trinomio(b, c)}$.`,
      formato: 'escolha',
      ...escolha(r, [
        [fatores([p, q]), undefined],
        [fatores([-p, -q]), 'fatora-com-o-sinal-trocado'],
        [fatores(outro), 'fatores-com-a-soma-errada'],
        [fatores(somaCerta), 'fatores-com-o-produto-errado'],
      ]),
      dicas: [
        `Procure dois números com soma ${num(b)} e produto ${num(c)}.`,
        c < 0 ? `O produto é negativo: um número é positivo e o outro, negativo.` : `O produto é positivo e a soma é ${b < 0 ? 'negativa: os dois são negativos' : 'positiva: os dois são positivos'}.`,
        `${num(p)} e ${num(q)}: $${trinomio(b, c)} = ${fatores([p, q])}$.`,
      ],
    }
  },
}

export const trinomioN3: Gerador = {
  id: 'fatoracao-trinomio-n3',
  aula: 'AF.U2.A5',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O número do outro fator, com o sinal.
      let p = 3
      let q = -5
      for (let i = 0; i < 20; i++) {
        const p1 = comSinal(r, 1, 9)
        const q1 = comSinal(r, 1, 9)
        if (p1 + q1 !== 0 && p1 !== q1 && (p1 < 0 || q1 < 0)) {
          p = p1
          q = q1
          break
        }
      }
      const b = p + q
      const c = p * q
      return {
        enunciado: `Em $${trinomio(b, c)} = (${xMais(p)})(x + \\square)$, que número vai no lugar do $\\square$, com o sinal?`,
        formato: 'numero',
        resposta: q,
        sinal: true,
        erros: mapa(q, [[-q, 'fatora-com-o-sinal-trocado']]),
        dicas: [
          `Os dois números têm soma ${num(b)} e produto ${num(c)}. Um deles é ${num(p)}.`,
          `${num(p)} vezes quanto dá ${num(c)}? Confira se a soma dá ${num(b)}.`,
          `${num(p)} · (${num(q)}) = ${num(c)} e ${num(p)} + (${num(q)}) = ${num(b)}: o número é ${num(q)}.`,
        ],
      }
    }
    // O terreno: área x² + bx + c, um lado x + p, x medido.
    const p = r.int(1, 6)
    const q = r.int(1, 9)
    const k = r.int(2, 9)
    const b = p + q
    const c = p * q
    const certa = k + q
    return {
      enunciado: `Um terreno tem área $(${trinomio(b, c)})$${NB}m² e um lado de $(${xMais(p)})$${NB}m. Com **x = ${k}**, quanto mede o outro lado, em metros?`,
      formato: 'numero',
      resposta: certa,
      erros: {},
      dicas: [
        `Fatore a área: $(${xMais(p)})(x + \\square)$, com dois números de soma ${b} e produto ${c}.`,
        `${p} · ${q} = ${c} e ${p} + ${q} = ${b}: o outro lado é $(${xMais(q)})$${NB}m. Troque o x por ${k}.`,
        `${k} + ${q} = ${certa}${NB}m. Confere: ${k + p} · ${certa} = ${k * k + b * k + c}, a área com x = ${k}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: reconhecer os produtos notáveis

export const notaveisN1: Gerador = {
  id: 'fatoracao-notaveis-n1',
  aula: 'AF.U2.A6',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 2) > 0) {
      // A diferença de quadrados, com o recorte.
      const b = r.int(2, 9)
      const visual: Visual = {
        modelo: 'retangulo',
        estado: { recorte: b },
        esboco: `A placa de x por x sem o canto de ${b} por ${b}, com ${b * b} dentro. Embaixo, x² − ${b * b}.`,
      }
      return {
        enunciado: `Complete: $x^2 - ${b * b} = (x + \\square)(x - \\square)$. Qual é o número (o mesmo nos dois)?`,
        formato: 'numero',
        resposta: b,
        erros: mapa(b, [[b * b, 'fatora-sem-tirar-a-raiz']]),
        dicas: [
          `O canto que saiu tem área ${b * b}. O número do parêntese é o lado dele.`,
          `Que número, vezes ele mesmo, dá ${b * b}?`,
          `${b} · ${b} = ${b * b}: $x^2 - ${b * b} = (x + ${b})(x - ${b})$.`,
        ],
        visual,
      }
    }
    // O quadrado perfeito, com os azulejos.
    const b = r.int(2, 3)
    const visual: Visual = {
      modelo: 'livre',
      estado: { azulejos: { fatorar: [2 * b, b * b] } },
      esboco: `Os azulejos de x² + ${2 * b}x + ${b * b}, soltos: o x², ${2 * b} barras e ${b * b} quadradinhos.`,
    }
    return {
      enunciado: `Complete: $x^2 + ${2 * b}x + ${b * b} = (x + \\square)^2$. Qual número falta?`,
      formato: 'numero',
      resposta: b,
      erros: mapa(b, [[b * b, 'fatora-sem-tirar-a-raiz']]),
      dicas: [
        `Os ${b * b} quadradinhos formam o canto de um quadrado. O número é o lado do canto.`,
        `Que número, vezes ele mesmo, dá ${b * b}? Confira o meio: duas vezes ele dá ${2 * b}.`,
        `${b} · ${b} = ${b * b} e ${b} + ${b} = ${2 * b}: $x^2 + ${2 * b}x + ${b * b} = (x + ${b})^2$.`,
      ],
      visual,
    }
  },
}

export const notaveisN2: Gerador = {
  id: 'fatoracao-notaveis-n2',
  aula: 'AF.U2.A6',
  nivel: 2,
  gerar(r) {
    // Escolher a fatoração: diferença de quadrados, quadrado da soma ou da diferença.
    const b = r.int(2, 9)
    const b2 = b * b
    const forma = r.pick(['diferenca-de-quadrados', 'quadrado-da-soma', 'quadrado-da-diferenca'] as const)
    const soma = `(x + ${b})^2`
    const dif = `(x - ${b})^2`
    const somaDif = `(x + ${b})(x - ${b})`
    let expressao: string
    let opcoes: [string, string | undefined][]
    let dica: string
    if (forma === 'diferenca-de-quadrados') {
      expressao = `x^2 - ${b2}`
      opcoes = [
        [somaDif, undefined],
        [dif, 'confunde-diferenca-e-quadrado-ao-fatorar'],
        [`(x + ${b2})(x - ${b2})`, 'fatora-sem-tirar-a-raiz'],
        [soma, 'confunde-diferenca-e-quadrado-ao-fatorar'],
      ]
      dica = `Dois termos, um menos o outro, e $${b2} = ${b}^2$: soma vezes diferença.`
    } else if (forma === 'quadrado-da-soma') {
      expressao = `x^2 + ${2 * b}x + ${b2}`
      opcoes = [
        [soma, undefined],
        [somaDif, 'confunde-diferenca-e-quadrado-ao-fatorar'],
        [dif, 'fatora-com-o-sinal-trocado'],
        [`(x + ${b2})^2`, 'fatora-sem-tirar-a-raiz'],
      ]
      dica = `Três termos, $${b2} = ${b}^2$ e o meio é $2 \\cdot ${b}x = ${2 * b}x$, com mais: um quadrado.`
    } else {
      expressao = `x^2 - ${2 * b}x + ${b2}`
      opcoes = [
        [dif, undefined],
        [soma, 'fatora-com-o-sinal-trocado'],
        [somaDif, 'confunde-diferenca-e-quadrado-ao-fatorar'],
        [`(x - ${b2})^2`, 'fatora-sem-tirar-a-raiz'],
      ]
      dica = `Três termos, $${b2} = ${b}^2$ e o meio é $-2 \\cdot ${b}x = -${2 * b}x$, com menos: um quadrado.`
    }
    return {
      enunciado: `Fatore: $${expressao}$.`,
      formato: 'escolha',
      ...escolha(r, opcoes),
      dicas: [
        'Conte os termos. Dois, um menos o outro: soma vezes diferença. Três: um quadrado, com o sinal do meio.',
        dica,
        `$${expressao} = ${opcoes[0][0]}$.`,
      ],
    }
  },
}

export const notaveisN3: Gerador = {
  id: 'fatoracao-notaveis-n3',
  aula: 'AF.U2.A6',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['lado', 'meio', 'placa'] as const)
    if (tipo === 'lado') {
      // x² ± 2bx + b² = (x ± □)².
      const b = r.int(2, 12)
      const menos = r.int(0, 1) === 0
      const s = menos ? '-' : '+'
      return {
        enunciado: `Complete: $x^2 ${s} ${2 * b}x + ${b * b} = (x ${s} \\square)^2$. Qual número falta?`,
        formato: 'numero',
        resposta: b,
        erros: mapa(b, [[b * b, 'fatora-sem-tirar-a-raiz']]),
        dicas: [
          'O número do parêntese é o lado do canto: o número que, vezes ele mesmo, dá o termo sem x.',
          `Que número, vezes ele mesmo, dá ${b * b}? Confira o meio: duas vezes ele dá ${2 * b}.`,
          `${b} · ${b} = ${b * b}: $(x ${s} ${b})^2 = x^2 ${s} ${2 * b}x + ${b * b}$.`,
        ],
      }
    }
    if (tipo === 'meio') {
      // x² + □x + b² = (x ± b)²: o termo do meio, com o sinal.
      const b = r.int(2, 9)
      const menos = r.int(0, 1) === 0
      const sb = menos ? -b : b
      const certa = 2 * sb
      return {
        enunciado: `Para $x^2 + \\square x + ${b * b}$ ser $(${xMais(sb)})^2$, que número falta, com o sinal?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [0, 'quadrado-da-soma-sem-o-meio'],
          [sb, 'produto-so-das-pontas'],
          [-certa, 'fatora-com-o-sinal-trocado'],
        ]),
        dicas: [
          'O quadrado tem **dois** pedaços do meio, iguais.',
          `Cada pedaço do meio é $x \\cdot ${menos ? `(${sb})` : sb} = ${mono(sb, 1)}$.`,
          `$${mono(sb, 1)} ${menos ? '-' : '+'} ${b}x = ${mono(certa, 1)}$: o número é ${num(certa)}.`,
        ],
      }
    }
    // A placa remontada: o outro lado, com x medido.
    const b = r.int(2, 6)
    const k = r.int(b + 2, 15)
    const certa = k - b
    return {
      enunciado: `Uma placa de x por x${NB}m perdeu um canto de ${b} por ${b}${NB}m. Remontada, a sobra tem um lado de $(x + ${b})$${NB}m. Com **x = ${k}**, quanto mede o outro?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [k - b * b, 'fatora-sem-tirar-a-raiz'],
        [k + b, 'confunde-diferenca-e-quadrado-ao-fatorar'],
      ]),
      dicas: [
        `A sobra tem área $x^2 - ${b * b}$. Ela vira um retângulo de soma vezes diferença.`,
        `$x^2 - ${b * b} = (x + ${b})(x - ${b})$: o outro lado é $(x - ${b})$${NB}m.`,
        `${k} − ${b} = ${certa}${NB}m. Confere: ${k + b} · ${certa} = ${k * k - b * b} = ${k * k} − ${b * b}.`,
      ],
    }
  },
}

export const GERADORES_AF_U02B: Gerador[] = [
  evidenciaN1,
  evidenciaN2,
  evidenciaN3,
  trinomioN1,
  trinomioN2,
  trinomioN3,
  notaveisN1,
  notaveisN2,
  notaveisN3,
]
