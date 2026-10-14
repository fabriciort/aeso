import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Exercícios da unidade 1 de Álgebra e Funções, parte B. Aula 4, monômio
// vezes polinômio; aula 5, polinômio vezes polinômio; aula 6, dividir por um
// monômio.
//
// O teclado só digita números. Por isso os itens pedem um número (o que
// falta, um coeficiente, o número sem x, um expoente, uma área com x dado)
// ou dão os polinômios como opções de `escolha`, escritas em TeX. Todo
// polinômio é uma lista de termos [coeficiente, expoente], escrita por
// `poli` na ordem da lista (do grau maior para o menor), com o coeficiente 1
// escondido (x, não 1x) e o sinal de cada termo. Erros com resposta negativa
// se escrevem com o menos verdadeiro (−12).

// ---------------------------------------------------------------- ferramentas

/** Um termo: [coeficiente, expoente de x]. [3, 2] é 3x². */
type Termo = [number, number]

/** Espaço que não quebra, entre o número e a unidade. */
const NB = ' '

/** O número como se escreve no texto, com o menos verdadeiro: −12. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))
/** Um número em TeX, com parênteses se for negativo: −3 vira '(-3)'. */
const fator = (n: number) => (n < 0 ? `(${n})` : String(n))

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

/** Um monômio como fator em TeX: negativo vai entre parênteses. */
const monoFator = (k: number, e: number) => (k < 0 ? `(${mono(k, e)})` : mono(k, e))

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

/** O monômio [k, e] vezes cada termo. */
const vezes = ([k, e]: Termo, termos: Termo[]): Termo[] => termos.map(([k2, e2]) => [k * k2, e + e2])

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

/** O erro de sinal de um produto ou quociente: o sinal trocado de um resultado negativo ou positivo. */
const erroSinal = (a: number, b: number) => (a < 0 && b < 0 ? 'sinais-iguais-da-negativo' : a < 0 || b < 0 ? 'sinais-diferentes-da-positivo' : undefined)

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
 * embaralhada. Cada opção é TeX sem os cifrões; o item a mostra como $...$.
 */
function escolha(r: Rng, opcoes: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const ordem = embaralha(r, opcoes.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = opcoes[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => `$${opcoes[o][0]}$`), resposta: ordem.indexOf(0), erros }
}

/** Um inteiro de `de` a `ate`, com o sinal sorteado. */
const comSinal = (r: Rng, de: number, ate: number) => r.int(de, ate) * (r.int(0, 1) === 0 ? 1 : -1)

/** Um binômio x ± b em TeX: 'x + 3', 'x - 2'. */
const xMais = (b: number) => `x ${b < 0 ? '-' : '+'} ${Math.abs(b)}`

// ---------------------------------------------------------------- aula 4: monômio vezes polinômio

export const monomioPolinomioN1: Gerador = {
  id: 'polinomios-monomio-polinomio-n1',
  aula: 'AF.U1.A4',
  nivel: 1,
  gerar(r) {
    // ax(x + b) = ax² + □x, com o retângulo partido em x e b.
    const a = r.int(2, 6)
    const b = r.int(2, 9)
    const visual: Visual = {
      modelo: 'retangulo',
      estado: { base: ['x', b], altura: [`${a}x`], areas: [[`${a}x²`, '?']] },
      esboco: `O retângulo de ${a}x de altura, com a base partida em x e ${b}: ${a}x² no pedaço grande e "?" no pedaço do ${b}.`,
    }
    return {
      enunciado: `Complete: $${a}x(x + ${b}) = ${a}x^2 + \\square x$. Qual número falta?`,
      formato: 'numero',
      resposta: a * b,
      erros: mapa(a * b, [
        [b, 'distributiva-parcial'],
        [a + b, 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        'O monômio de fora multiplica **cada termo** de dentro.',
        `O pedaço do ${b} também tem $${a}x$ de fundo: a área dele é $${a}x \\cdot ${b}$.`,
        `$${a}x \\cdot ${b} = ${a * b}x$, então $${a}x(x + ${b}) = ${a}x^2 + ${a * b}x$.`,
      ],
      visual,
    }
  },
}

export const monomioPolinomioN2: Gerador = {
  id: 'polinomios-monomio-polinomio-n2',
  aula: 'AF.U1.A4',
  nivel: 2,
  gerar(r) {
    // Ax(x + B) ou Ax(x² + Bx + C), sempre com um menos.
    const trinomio = r.int(0, 1) === 0
    const A = comSinal(r, 2, trinomio ? 5 : 6)
    let dentro: Termo[]
    if (trinomio) {
      let B = comSinal(r, 1, 6)
      let C = comSinal(r, 1, 6)
      if (B > 0 && C > 0) [B, C] = r.int(0, 1) === 0 ? [-B, C] : [B, -C]
      dentro = [[1, 2], [B, 1], [C, 0]]
    } else {
      let B = comSinal(r, 1, 9)
      if (A > 0 && B > 0) B = -B
      dentro = [[1, 1], [B, 0]]
    }
    const m: Termo = [A, 1]
    const certa = vezes(m, dentro)
    const n = certa.length - 1
    const t = `${mono(A, 1)}(${poli(dentro)})`
    // O último termo com o sinal trocado; só o primeiro multiplicado; o último sem o x.
    const sinal: Termo[] = certa.map(([k, e], i) => [i === n ? -k : k, e])
    const parcial: Termo[] = [certa[0], ...dentro.slice(1)]
    const semLetra: Termo[] = certa.map(([k, e], i) => [k, i === n ? 0 : e])
    return {
      enunciado: `Tire os parênteses: $${t}$.`,
      formato: 'escolha',
      ...escolha(r, [
        [poli(certa), undefined],
        [poli(sinal), 'distributiva-sinal-do-negativo'],
        [poli(parcial), 'distributiva-parcial'],
        [poli(semLetra), 'esquece-a-letra-no-produto'],
      ]),
      dicas: [
        'O monômio de fora multiplica **cada termo** de dentro, com o sinal de cada um.',
        `Comece por $${mono(A, 1)} \\cdot ${potencia(dentro[0][1])} = ${mono(A, dentro[0][1] + 1)}$ e siga termo a termo. Sinais iguais dão mais; diferentes, menos.`,
        `$${t} = ${poli(certa)}$.`,
      ],
    }
  },
}

export const monomioPolinomioN3: Gerador = {
  id: 'polinomios-monomio-polinomio-n3',
  aula: 'AF.U1.A4',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Um coeficiente do produto Ax(x² + Bx + C).
      const A = comSinal(r, 2, 6)
      const B = comSinal(r, 2, 7)
      const C = comSinal(r, 2, 7)
      const dentro: Termo[] = [[1, 2], [B, 1], [C, 0]]
      const t = `${mono(A, 1)}(${poli(dentro)})`
      // O coeficiente de x² vem de Ax · Bx; o de x, de Ax · C.
      const deX2 = r.int(0, 1) === 0
      const k = deX2 ? B : C
      const certa = A * k
      return {
        enunciado: `Tire os parênteses de $${t}$. Qual é o coeficiente de $${deX2 ? 'x^2' : 'x'}$?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [-certa, erroSinal(A, k)],
          [A + k, 'soma-no-lugar-de-multiplicar'],
        ]),
        dicas: [
          'O monômio de fora multiplica **cada termo** de dentro, com o sinal.',
          `O termo com $${deX2 ? 'x^2' : 'x'}$ vem de $${mono(A, 1)} \\cdot ${deX2 ? mono(B, 1) : fator(C)}$.`,
          `$${monoFator(A, 1)} \\cdot ${deX2 ? monoFator(B, 1) : fator(C)} = ${mono(certa, deX2 ? 2 : 1)}$: $${t} = ${poli(vezes([A, 1], dentro))}$.`,
        ],
      }
    }
    // O galpão com o x medido: ax(x + b).
    const a = r.int(2, 5)
    const b = r.int(2, 9)
    const k = r.int(2, 8)
    const certa = a * k * (k + b)
    return {
      enunciado: `Um galpão tem $${a}x$${NB}m de fundo e $(x + ${b})$${NB}m de frente. Com **x = ${k}**, qual é a área, em m²?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [a * k * k + b, 'distributiva-parcial'],
        [a * k * k + a * b, 'esquece-a-letra-no-produto'],
      ]),
      dicas: [
        `A área é $${a}x(x + ${b}) = ${a}x^2 + ${a * b}x$. Troque o x por ${k}.`,
        `O fundo mede $${a} \\cdot ${k} = ${a * k}$${NB}m, e a frente, $${k} + ${b} = ${k + b}$${NB}m.`,
        `$${a * k} \\cdot ${k + b} = ${certa}$, ou $${a * k * k} + ${a * b * k} = ${certa}$${NB}m².`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: polinômio vezes polinômio

export const binomiosN1: Gerador = {
  id: 'polinomios-binomios-n1',
  aula: 'AF.U1.A5',
  nivel: 1,
  gerar(r) {
    // (x + a)(x + b): o número do meio ou o da ponta, com o retângulo.
    const a = r.int(1, 9)
    const b = r.int(1, 9)
    const meio = r.int(0, 1) === 0
    const visual: Visual = {
      modelo: 'retangulo',
      estado: {
        base: ['x', b],
        altura: ['x', a],
        areas: meio ? [['x²', '?'], ['?', a * b]] : [['x²', `${b}x`], [`${a}x`, '?']],
      },
      esboco: meio
        ? `O retângulo de (x + ${a}) por (x + ${b}): x² e ${a * b} nas pontas, "?" nos dois pedaços do meio.`
        : `O retângulo de (x + ${a}) por (x + ${b}): x², ${b}x e ${a}x à vista, "?" no pedaço de ${a} por ${b}.`,
    }
    if (meio) {
      const certa = a + b
      return {
        enunciado: `Complete: $(x + ${a})(x + ${b}) = x^2 + \\square x + ${a * b}$. Qual número falta?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [0, 'produto-so-das-pontas'],
          [a, 'produto-so-das-pontas'],
          [b, 'produto-so-das-pontas'],
          [a * b, 'soma-no-lugar-de-multiplicar'],
        ]),
        dicas: [
          'O retângulo tem **quatro** pedaços. Os dois do meio têm x.',
          `Os pedaços do meio são $x \\cdot ${b} = ${b}x$ e $${a} \\cdot x = ${a}x$. Junte os dois.`,
          `$${b}x + ${a}x = ${certa}x$, então $(x + ${a})(x + ${b}) = x^2 + ${certa}x + ${a * b}$.`,
        ],
        visual,
      }
    }
    const certa = a * b
    return {
      enunciado: `Complete: $(x + ${a})(x + ${b}) = x^2 + ${a + b}x + \\square$. Qual número falta?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[a + b, 'soma-no-lugar-de-multiplicar']]),
      dicas: [
        'Cada termo do primeiro multiplica **cada termo** do segundo.',
        `O número sem x é o pedaço de ${a} por ${b}.`,
        `$${a} \\cdot ${b} = ${certa}$, então $(x + ${a})(x + ${b}) = x^2 + ${a + b}x + ${certa}$.`,
      ],
      visual,
    }
  },
}

export const binomiosN2: Gerador = {
  id: 'polinomios-binomios-n2',
  aula: 'AF.U1.A5',
  nivel: 2,
  gerar(r) {
    // (x + A)(x + B) com um menos, e A + B diferente de zero.
    // Tentativas limitadas, com uma saída fixa: o rng de borda repete sempre o mesmo sorteio.
    let A = -2
    let B = 5
    for (let i = 0; i < 20; i++) {
      const a = comSinal(r, 1, 7)
      const b = comSinal(r, 1, 7)
      if (a + b !== 0 && (a < 0 || b < 0)) {
        A = a
        B = b
        break
      }
    }
    const t = `(${xMais(A)})(${xMais(B)})`
    const certa: Termo[] = [[1, 2], [A + B, 1], [A * B, 0]]
    return {
      enunciado: `Multiplique: $${t}$.`,
      formato: 'escolha',
      ...escolha(r, [
        [poli(certa), undefined],
        [poli([[1, 2], [A * B, 0]]), 'produto-so-das-pontas'],
        [poli([[1, 2], [A, 1], [A * B, 0]]), 'produto-so-das-pontas'],
        [poli([[1, 2], [A + B, 1], [-A * B, 0]]), erroSinal(A, B)],
      ]),
      dicas: [
        'Cada termo do primeiro multiplica **cada termo** do segundo: são quatro pedaços.',
        `Os pedaços: $x \\cdot x$, $x \\cdot ${fator(B)}$, $${fator(A)} \\cdot x$ e $${fator(A)} \\cdot ${fator(B)}$. Depois, junte os semelhantes.`,
        `$${t} = ${poli([[1, 2], [B, 1], [A, 1], [A * B, 0]])} = ${poli(certa)}$.`,
      ],
    }
  },
}

export const binomiosN3: Gerador = {
  id: 'polinomios-binomios-n3',
  aula: 'AF.U1.A5',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O coeficiente de x em (px + A)(x + B).
      const p = r.int(2, 5)
      let A = 3
      let B = 2
      for (let i = 0; i < 20; i++) {
        const a = comSinal(r, 1, 7)
        const b = comSinal(r, 1, 7)
        if (p * b + a !== 0) {
          A = a
          B = b
          break
        }
      }
      const t = `(${p}${xMais(A)})(${xMais(B)})`
      const certa = p * B + A
      return {
        enunciado: `Multiplique $${t}$ e junte os semelhantes. Qual é o coeficiente de $x$?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [0, 'produto-so-das-pontas'],
          [p * B, 'produto-so-das-pontas'],
          [A, 'produto-so-das-pontas'],
        ]),
        dicas: [
          'São quatro pedaços. Os dois com x são os do meio.',
          `Os do meio: $${p}x \\cdot ${fator(B)} = ${mono(p * B, 1)}$ e $${fator(A)} \\cdot x = ${mono(A, 1)}$.`,
          `$${poli([[p * B, 1], [A, 1]])} = ${mono(certa, 1)}$: o coeficiente é ${num(certa)}.`,
        ],
      }
    }
    // A sala com o x medido: (x + a)(x + b).
    const a = r.int(1, 9)
    const b = r.int(1, 9)
    const k = r.int(2, 9)
    const certa = (k + a) * (k + b)
    return {
      enunciado: `Uma sala tem $(x + ${a})$${NB}m por $(x + ${b})$${NB}m. Com **x = ${k}**, quantos m² de piso ela pede?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[k * k + a * b, 'produto-so-das-pontas']]),
      dicas: [
        `A área é $(x + ${a})(x + ${b}) = x^2 + ${a + b}x + ${a * b}$. Troque o x por ${k}.`,
        `Os lados medem $${k} + ${a} = ${k + a}$ e $${k} + ${b} = ${k + b}$ metros.`,
        `$${k + a} \\cdot ${k + b} = ${certa}$, ou $${k * k} + ${(a + b) * k} + ${a * b} = ${certa}$${NB}m².`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: dividir por um monômio

export const divisaoN1: Gerador = {
  id: 'polinomios-divisao-n1',
  aula: 'AF.U1.A6',
  nivel: 1,
  gerar(r) {
    // (ac·x² + ad·x) ÷ ax = cx + □, com o retângulo de lado escondido.
    const a = r.int(2, 5)
    const c = r.int(1, 5)
    const d = r.int(2, 9)
    const cx = mono(c, 1)
    const area = poli([[a * c, 2], [a * d, 1]])
    const visual: Visual = {
      modelo: 'retangulo',
      estado: { base: [lado(c, 1), '?'], altura: [`${a}x`], areas: [[lado(a * c, 2), lado(a * d, 1)]] },
      esboco: `O retângulo de ${a}x de altura, com ${a * c}x² e ${a * d}x dentro; em cima, ${lado(c, 1)} e "?".`,
    }
    return {
      enunciado: `Complete: $(${area}) \\div ${a}x = ${cx} + \\square$. Qual número falta?`,
      formato: 'numero',
      resposta: d,
      erros: mapa(d, [[a * d, 'divide-so-o-primeiro']]),
      dicas: [
        'Dividir pelo monômio é achar o lado que falta: divida **cada termo**.',
        `Que número, vezes $${a}x$, dá $${a * d}x$?`,
        `$${a * d}x \\div ${a}x = ${d}$. Confere: $${a}x(${cx} + ${d}) = ${area}$.`,
      ],
      visual,
    }
  },
}

export const divisaoN2: Gerador = {
  id: 'polinomios-divisao-n2',
  aula: 'AF.U1.A6',
  nivel: 2,
  gerar(r) {
    // (ak·x^(p+e) + bk·x^e) ÷ kx^e = ax^p + b, com b negativo.
    const k = r.int(2, 6)
    const e = r.int(1, 2)
    const p = r.int(1, 2)
    const a = r.int(1, 5)
    const b = -r.int(1, 9)
    const divisor = mono(k, e)
    const dividendo: Termo[] = [[a * k, p + e], [b * k, e]]
    const certa: Termo[] = [[a, p], [b, 0]]
    return {
      enunciado: `Divida: $(${poli(dividendo)}) \\div ${divisor}$.`,
      formato: 'escolha',
      ...escolha(r, [
        [poli(certa), undefined],
        [poli([[a, p], [b * k, e]]), 'divide-so-o-primeiro'],
        [poli([[a, p + 2 * e], [b, 2 * e]]), 'potencia-soma-expoentes-na-divisao'],
        [poli([[a, p], [-b, 0]]), 'sinais-diferentes-da-positivo'],
      ]),
      dicas: [
        'Divida **cada termo** pelo monômio: números com números, e os expoentes se subtraem.',
        `$${mono(a * k, p + e)} \\div ${divisor} = ${mono(a, p)}$. Agora o outro termo, com o sinal.`,
        `$${mono(b * k, e)} \\div ${divisor} = ${b}$: dá $${poli(certa)}$. Confere: $${divisor}(${poli(certa)}) = ${poli(dividendo)}$.`,
      ],
    }
  },
}

export const divisaoN3: Gerador = {
  id: 'polinomios-divisao-n3',
  aula: 'AF.U1.A6',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['sem-x', 'expoente', 'deposito'] as const)
    if (tipo === 'sem-x') {
      // (ak·x³ + bk·x² + ck·x) ÷ kx: o número sem x é c.
      const k = comSinal(r, 2, 6)
      const a = r.int(1, 4)
      const b = comSinal(r, 1, 6)
      const c = comSinal(r, 1, 9)
      const dividendo: Termo[] = [[a * k, 3], [b * k, 2], [c * k, 1]]
      const certa: Termo[] = [[a, 2], [b, 1], [c, 0]]
      return {
        enunciado: `Divida $(${poli(dividendo)}) \\div ${monoFator(k, 1)}$. Qual é o número sem x no resultado?`,
        formato: 'numero',
        resposta: c,
        sinal: true,
        erros: mapa(c, [
          [c * k, 'divide-so-o-primeiro'],
          [-c, erroSinal(c * k, k)],
        ]),
        dicas: [
          'Divida **cada termo** pelo monômio, com o sinal.',
          `O número sem x vem do termo com x: $${mono(c * k, 1)} \\div ${monoFator(k, 1)}$.`,
          `$${mono(c * k, 1)} \\div ${monoFator(k, 1)} = ${c}$: o resultado é $${poli(certa)}$.`,
        ],
      }
    }
    if (tipo === 'expoente') {
      // a·k·x^(p+e) ÷ k·x^e = a·x^□.
      const k = r.int(2, 6)
      const a = r.int(1, 5)
      const p = r.int(2, 5)
      const e = r.int(1, 3)
      const erros: [number, string | undefined][] = [[p + 2 * e, 'potencia-soma-expoentes-na-divisao']]
      if ((p + e) % e === 0) erros.push([(p + e) / e, 'potencia-multiplica-expoentes'])
      return {
        enunciado: `Complete: $${mono(a * k, p + e)} \\div ${mono(k, e)} = ${a === 1 ? '' : a}x^{\\square}$. Qual é o expoente que falta?`,
        formato: 'numero',
        resposta: p,
        erros: mapa(p, erros),
        dicas: [
          'Dividir tira fatores: os expoentes da mesma letra se subtraem.',
          `Por extenso, ${p + e} x em cima e ${e} embaixo. Quantos sobram?`,
          `$${p + e} - ${e} = ${p}$: $${mono(a * k, p + e)} \\div ${mono(k, e)} = ${mono(a, p)}$.`,
        ],
      }
    }
    // A frente do depósito com o x medido: (ac·x² + ad·x) ÷ ax = cx + d.
    const a = r.int(2, 5)
    const c = r.int(1, 4)
    const d = r.int(2, 9)
    const k = r.int(2, 8)
    const area = poli([[a * c, 2], [a * d, 1]])
    const certa = c * k + d
    return {
      enunciado: `Um depósito tem área $(${area})$${NB}m² e $${a}x$${NB}m de fundo. Com **x = ${k}**, quanto mede a frente, em metros?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[c * k + a * d * k, 'divide-so-o-primeiro']]),
      dicas: [
        `A frente é a área dividida pelo fundo: divida cada termo por $${a}x$.`,
        `$(${area}) \\div ${a}x = ${poli([[c, 1], [d, 0]])}$. Troque o x por ${k}.`,
        `$${c === 1 ? '' : `${c} \\cdot `}${k} + ${d} = ${certa}$${NB}m.`,
      ],
    }
  },
}

export const GERADORES_AF_U01B: Gerador[] = [
  monomioPolinomioN1,
  monomioPolinomioN2,
  monomioPolinomioN3,
  binomiosN1,
  binomiosN2,
  binomiosN3,
  divisaoN1,
  divisaoN2,
  divisaoN3,
]
