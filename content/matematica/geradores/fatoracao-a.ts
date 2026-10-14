import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Exercícios da unidade 2 de Álgebra e Funções, parte A. Aula 1, o quadrado
// da soma; aula 2, o quadrado da diferença; aula 3, a soma vezes a
// diferença.
//
// O teclado só digita números. Por isso os itens pedem um número (o que
// falta, um coeficiente, uma área com x dado, uma conta de cabeça) ou dão os
// polinômios como opções de `escolha`, escritas em TeX, com as erradas
// vindas dos erros comuns. Todo polinômio é uma lista de termos
// [coeficiente, expoente], escrita por `poli` na ordem da lista (do grau
// maior para o menor). Erros com resposta negativa se escrevem com o menos
// verdadeiro (−12).

// ---------------------------------------------------------------- ferramentas

/** Um termo: [coeficiente, expoente de x]. [4, 2] é 4x². */
type Termo = [number, number]

/** Espaço que não quebra, entre o número e a unidade. */
const NB = ' '

/** O número como se escreve no texto, com o menos verdadeiro: −12. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))

/** A parte com x em TeX: '', 'x', 'x^2'. */
const potencia = (e: number) => (e === 0 ? '' : e === 1 ? 'x' : `x^${e}`)

/** Um termo em TeX, sem o sinal: (3, 2) → '3x^2'; (1, 1) → 'x'; (5, 0) → '5'. */
function corpo(k: number, e: number): string {
  const a = Math.abs(k)
  if (e === 0) return String(a)
  return `${a === 1 ? '' : a}${potencia(e)}`
}

/** Um monômio em TeX: (−3, 1) → '-3x'. */
const mono = (k: number, e: number) => `${k < 0 ? '-' : ''}${corpo(k, e)}`

/** Os termos em TeX, na ordem da lista: [[4, 2], [−12, 1], [9, 0]] → '4x^2 - 12x + 9'. */
function poli(termos: Termo[]): string {
  const ts = termos.filter(([k]) => k !== 0)
  if (!ts.length) return '0'
  return ts.map(([k, e], i) => (i === 0 ? mono(k, e) : `${k < 0 ? ' - ' : ' + '}${corpo(k, e)}`)).join('')
}

/** O binômio px ± a em TeX: '2x + 3', 'x - 5'. */
const binomio = (p: number, a: number) => `${p === 1 ? '' : p}x ${a < 0 ? '-' : '+'} ${Math.abs(a)}`

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

/** O quadrado de lado x ± a, partido, com as áreas dadas. */
const quadrado = (a: number, areas: unknown[][], esboco: string): Visual => ({
  modelo: 'retangulo',
  estado: { base: ['x', a], altura: ['x', a], areas },
  esboco,
})

/** Um monômio como o retângulo lê: '3x', '−3x'. */
const ladoX = (k: number) => `${k < 0 ? '−' : ''}${Math.abs(k) === 1 ? '' : Math.abs(k)}x`

// ---------------------------------------------------------------- aula 1: o quadrado da soma

export const quadradoSomaN1: Gerador = {
  id: 'fatoracao-quadrado-soma-n1',
  aula: 'AF.U2.A1',
  nivel: 1,
  gerar(r) {
    // (x + a)² = x² + □x + a², ou o canto que falta, com o quadrado partido.
    const a = r.int(1, 9)
    const meio = r.int(0, 1) === 0
    if (meio) {
      const certa = 2 * a
      return {
        enunciado: `Complete: $(x + ${a})^2 = x^2 + \\square x + ${a * a}$. Qual número falta?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [a, 'produto-so-das-pontas'],
          [0, 'quadrado-da-soma-sem-o-meio'],
        ]),
        dicas: [
          'O quadrado tem **quatro** pedaços. Os dois do meio têm x e são iguais.',
          `Cada pedaço do meio é $x \\cdot ${a} = ${ladoX(a)}$. Junte os dois.`,
          `$${ladoX(a)} + ${ladoX(a)} = ${certa}x$, então $(x + ${a})^2 = x^2 + ${certa}x + ${a * a}$.`,
        ],
        visual: quadrado(a, [['x²', '?'], ['?', a * a]], `O quadrado de lado x + ${a}: x² e ${a * a} nos cantos, "?" nos dois pedaços do meio.`),
      }
    }
    const certa = a * a
    return {
      enunciado: `Complete: $(x + ${a})^2 = x^2 + ${2 * a}x + \\square$. Qual número falta?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[2 * a, 'potencia-multiplica-base-pelo-expoente']]),
      dicas: [
        'O número sem x é o canto: o quadradinho de baixo, à direita.',
        `O canto é ${a} por ${a}.`,
        `$${a} \\cdot ${a} = ${certa}$, então $(x + ${a})^2 = x^2 + ${2 * a}x + ${certa}$.`,
      ],
      visual: quadrado(a, [['x²', ladoX(a)], [ladoX(a), '?']], `O quadrado de lado x + ${a}: x², ${a}x e ${a}x à vista, "?" no canto de ${a} por ${a}.`),
    }
  },
}

export const quadradoSomaN2: Gerador = {
  id: 'fatoracao-quadrado-soma-n2',
  aula: 'AF.U2.A1',
  nivel: 2,
  gerar(r) {
    // (px + a)², com o pedaço grande p²x², entre os erros comuns.
    const p = r.int(2, 4)
    const a = r.int(1, 6)
    const t = `(${binomio(p, a)})^2`
    const certa: Termo[] = [[p * p, 2], [2 * p * a, 1], [a * a, 0]]
    return {
      enunciado: `Desenvolva: $${t}$.`,
      formato: 'escolha',
      ...escolha(r, [
        [poli(certa), undefined],
        [poli([[p * p, 2], [a * a, 0]]), 'quadrado-da-soma-sem-o-meio'],
        [poli([[p * p, 2], [p * a, 1], [a * a, 0]]), 'produto-so-das-pontas'],
        [poli([[p, 2], [2 * p * a, 1], [a * a, 0]]), 'quadrado-do-monomio-so-na-letra'],
      ]),
      dicas: [
        'O quadrado tem quatro pedaços: o grande, o canto e **dois** iguais no meio.',
        `O pedaço grande é $${p}x \\cdot ${p}x = ${mono(p * p, 2)}$; cada um do meio, $${p}x \\cdot ${a} = ${mono(p * a, 1)}$.`,
        `$${t} = ${poli([[p * p, 2], [p * a, 1], [p * a, 1], [a * a, 0]])} = ${poli(certa)}$.`,
      ],
    }
  },
}

export const quadradoSomaN3: Gerador = {
  id: 'fatoracao-quadrado-soma-n3',
  aula: 'AF.U2.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['quarto', 'coeficiente', 'cabeca'] as const)
    if (tipo === 'quarto') {
      // O quarto quadrado de lado x + a, com o x medido.
      const a = r.int(1, 6)
      const k = r.int(2, 9)
      const certa = (k + a) * (k + a)
      return {
        enunciado: `Um quarto quadrado tem $(x + ${a})$${NB}m de lado. Com **x = ${k}**, quantos m² de piso ele pede?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [k * k + a * a, 'quadrado-da-soma-sem-o-meio'],
          [k * k + k * a + a * a, 'produto-so-das-pontas'],
        ]),
        dicas: [
          `A área é $(x + ${a})^2 = x^2 + ${2 * a}x + ${a * a}$. Troque o x por ${k}.`,
          `O lado mede $${k} + ${a} = ${k + a}$${NB}m.`,
          `$${k + a} \\cdot ${k + a} = ${certa}$, ou $${k * k} + ${2 * a * k} + ${a * a} = ${certa}$${NB}m².`,
        ],
      }
    }
    if (tipo === 'coeficiente') {
      // O coeficiente de x em (px + a)².
      const p = r.int(2, 5)
      const a = r.int(1, 7)
      const t = `(${binomio(p, a)})^2`
      const certa = 2 * p * a
      return {
        enunciado: `Desenvolva $${t}$. Qual é o coeficiente de $x$?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [p * a, 'produto-so-das-pontas'],
          [0, 'quadrado-da-soma-sem-o-meio'],
        ]),
        dicas: [
          'O termo com x vem dos **dois** pedaços do meio, que são iguais.',
          `Cada pedaço do meio é $${p}x \\cdot ${a} = ${mono(p * a, 1)}$.`,
          `$${mono(p * a, 1)} + ${mono(p * a, 1)} = ${mono(certa, 1)}$: $${t} = ${poli([[p * p, 2], [certa, 1], [a * a, 0]])}$.`,
        ],
      }
    }
    // Um quadrado de cabeça: (10d + u)².
    const d = r.int(2, 9)
    const u = r.int(1, 3)
    const n = 10 * d + u
    const certa = n * n
    const dz = 10 * d
    return {
      enunciado: `Calcule de cabeça: $${n}^2$.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dz * dz + u * u, 'quadrado-da-soma-sem-o-meio'],
        [dz * dz + dz * u + u * u, 'produto-so-das-pontas'],
      ]),
      dicas: [
        `Pense em $(${dz} + ${u})^2$: o quadrado de ${dz}, os **dois** pedaços do meio e o canto.`,
        `$${dz}^2 = ${dz * dz}$, cada pedaço do meio é $${dz} \\cdot ${u} = ${dz * u}$ e o canto, $${u * u}$.`,
        `$${dz * dz} + ${2 * dz * u} + ${u * u} = ${certa}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: o quadrado da diferença

export const quadradoDiferencaN1: Gerador = {
  id: 'fatoracao-quadrado-diferenca-n1',
  aula: 'AF.U2.A2',
  nivel: 1,
  gerar(r) {
    // (x − a)² = x² − □x + a², ou o canto que falta, com o quadrado partido.
    const a = r.int(1, 9)
    const meio = r.int(0, 1) === 0
    if (meio) {
      const certa = 2 * a
      return {
        enunciado: `Complete: $(x - ${a})^2 = x^2 - \\square x + ${a * a}$. Qual número falta?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [a, 'produto-so-das-pontas'],
          [0, 'quadrado-da-soma-sem-o-meio'],
        ]),
        dicas: [
          'O quadrado tem **quatro** pedaços. Os dois do meio são vermelhos e iguais.',
          `Cada pedaço do meio é $x \\cdot (-${a}) = ${mono(-a, 1)}$. Junte os dois.`,
          `$${mono(-a, 1)} - ${corpo(a, 1)} = ${mono(-certa, 1)}$, então $(x - ${a})^2 = x^2 - ${certa}x + ${a * a}$.`,
        ],
        visual: quadrado(-a, [['x²', '?'], ['?', a * a]], `O quadrado de lado x − ${a}, com o −${a} em vermelho: x² e ${a * a} nos cantos, "?" nos dois pedaços do meio.`),
      }
    }
    const certa = a * a
    return {
      enunciado: `Complete: $(x - ${a})^2 = x^2 - ${2 * a}x + \\square$. Qual número falta?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [-certa, 'canto-do-quadrado-negativo'],
        [2 * a, 'potencia-multiplica-base-pelo-expoente'],
      ]),
      dicas: [
        'O número sem x é o canto, de lados vermelhos.',
        `O canto é $(-${a}) \\cdot (-${a})$. Sinais iguais dão mais.`,
        `$(-${a}) \\cdot (-${a}) = ${certa}$, então $(x - ${a})^2 = x^2 - ${2 * a}x + ${certa}$.`,
      ],
      visual: quadrado(-a, [['x²', ladoX(-a)], [ladoX(-a), '?']], `O quadrado de lado x − ${a}: x², −${a}x e −${a}x (vermelhos) à vista, "?" no canto de −${a} por −${a}.`),
    }
  },
}

export const quadradoDiferencaN2: Gerador = {
  id: 'fatoracao-quadrado-diferenca-n2',
  aula: 'AF.U2.A2',
  nivel: 2,
  gerar(r) {
    // (px − a)², entre os erros comuns: o canto negativo, sem o meio, o meio positivo.
    const p = r.int(1, 3)
    const a = r.int(1, 7)
    const t = `(${binomio(p, -a)})^2`
    const certa: Termo[] = [[p * p, 2], [-2 * p * a, 1], [a * a, 0]]
    return {
      enunciado: `Desenvolva: $${t}$.`,
      formato: 'escolha',
      ...escolha(r, [
        [poli(certa), undefined],
        [poli([[p * p, 2], [-2 * p * a, 1], [-a * a, 0]]), 'canto-do-quadrado-negativo'],
        [poli([[p * p, 2], [-a * a, 0]]), 'quadrado-da-soma-sem-o-meio'],
        [poli([[p * p, 2], [2 * p * a, 1], [a * a, 0]]), 'sinais-diferentes-da-positivo'],
      ]),
      dicas: [
        'Os dois pedaços do meio se tiram; o canto, menos vezes menos, soma.',
        `Cada pedaço do meio é $${mono(p, 1)} \\cdot (-${a}) = ${mono(-p * a, 1)}$, e o canto, $(-${a}) \\cdot (-${a}) = ${a * a}$.`,
        `$${t} = ${poli([[p * p, 2], [-p * a, 1], [-p * a, 1], [a * a, 0]])} = ${poli(certa)}$.`,
      ],
    }
  },
}

export const quadradoDiferencaN3: Gerador = {
  id: 'fatoracao-quadrado-diferenca-n3',
  aula: 'AF.U2.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['coeficiente', 'terreno', 'cabeca'] as const)
    if (tipo === 'coeficiente') {
      // O coeficiente de x em (px − a)².
      const p = r.int(1, 4)
      const a = r.int(1, 7)
      const t = `(${binomio(p, -a)})^2`
      const certa = -2 * p * a
      return {
        enunciado: `Desenvolva $${t}$. Qual é o coeficiente de $x$?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [-certa, 'sinais-diferentes-da-positivo'],
          [-p * a, 'produto-so-das-pontas'],
          [0, 'quadrado-da-soma-sem-o-meio'],
        ]),
        dicas: [
          'O termo com x vem dos **dois** pedaços do meio, com o sinal.',
          `Cada pedaço do meio é $${mono(p, 1)} \\cdot (-${a}) = ${mono(-p * a, 1)}$.`,
          `Os dois juntos: $${mono(certa, 1)}$. O coeficiente é ${num(certa)}: $${t} = ${poli([[p * p, 2], [certa, 1], [a * a, 0]])}$.`,
        ],
      }
    }
    if (tipo === 'terreno') {
      // O terreno de lado x que perde a metros na frente e no lado, com o x medido.
      const a = r.int(1, 5)
      const k = r.int(a + 2, a + 10)
      const certa = (k - a) * (k - a)
      return {
        enunciado: `Um terreno quadrado tem x${NB}m de lado e perde ${a}${NB}m na frente e ${a}${NB}m no lado. Com **x = ${k}**, quantos m² sobram?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [k * k - a * a, 'quadrado-da-soma-sem-o-meio'],
          [k * k - 2 * a * k - a * a, 'canto-do-quadrado-negativo'],
        ]),
        dicas: [
          `Sobra um quadrado de lado $x - ${a}$: a área é $(x - ${a})^2 = x^2 - ${2 * a}x + ${a * a}$.`,
          `O lado que sobra mede $${k} - ${a} = ${k - a}$${NB}m.`,
          `$${k - a} \\cdot ${k - a} = ${certa}$, ou $${k * k} - ${2 * a * k} + ${a * a} = ${certa}$${NB}m².`,
        ],
      }
    }
    // Um quadrado de cabeça: (10d − u)².
    const d = r.int(2, 9)
    const u = r.int(1, 3)
    const dz = 10 * d
    const n = dz - u
    const certa = n * n
    return {
      enunciado: `Calcule de cabeça: $${n}^2$.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dz * dz - u * u, 'quadrado-da-soma-sem-o-meio'],
        [dz * dz - 2 * dz * u - u * u, 'canto-do-quadrado-negativo'],
      ]),
      dicas: [
        `Pense em $(${dz} - ${u})^2$: o quadrado de ${dz}, menos os **dois** pedaços do meio, mais o canto.`,
        `$${dz}^2 = ${dz * dz}$, cada pedaço do meio é $${dz} \\cdot ${u} = ${dz * u}$ e o canto, $${u * u}$.`,
        `$${dz * dz} - ${2 * dz * u} + ${u * u} = ${certa}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: a soma vezes a diferença

export const somaDiferencaN1: Gerador = {
  id: 'fatoracao-soma-diferenca-n1',
  aula: 'AF.U2.A3',
  nivel: 1,
  gerar(r) {
    // (x + a)(x − a) = x² − □, ou o coeficiente do meio (zero), com o retângulo.
    const a = r.int(1, 9)
    const meio = r.int(0, 1) === 0
    const visual = (areas: unknown[][], esboco: string): Visual => ({
      modelo: 'retangulo',
      estado: { base: ['x', a], altura: ['x', -a], areas, cancela: true },
      esboco,
    })
    if (meio) {
      return {
        enunciado: `Complete: $(x + ${a})(x - ${a}) = x^2 + \\square x - ${a * a}$. Qual número falta?`,
        formato: 'numero',
        resposta: 0,
        sinal: true,
        erros: mapa(0, [
          [-2 * a, 'meios-opostos-somados'],
          [2 * a, 'meios-opostos-somados'],
        ]),
        dicas: [
          'Olhe os dois pedaços do meio: um tem + e o outro, −.',
          `Os do meio são $x \\cdot ${a} = ${corpo(a, 1)}$ e $(-${a}) \\cdot x = ${mono(-a, 1)}$.`,
          `$${corpo(a, 1)} - ${corpo(a, 1)} = 0$: o meio some, e $(x + ${a})(x - ${a}) = x^2 - ${a * a}$.`,
        ],
        visual: visual([['x²', '?'], ['?', -a * a]], `O retângulo de (x + ${a}) por (x − ${a}): x² e −${a * a} (vermelho) nos cantos, "?" nos dois pedaços do meio.`),
      }
    }
    const certa = a * a
    return {
      enunciado: `Complete: $(x + ${a})(x - ${a}) = x^2 - \\square$. Qual número falta?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[2 * a, 'potencia-multiplica-base-pelo-expoente']]),
      dicas: [
        'Os dois pedaços do meio se cancelam. Sobra o x² e o canto.',
        `O canto é $${a} \\cdot (-${a})$.`,
        `$${a} \\cdot (-${a}) = -${certa}$, então $(x + ${a})(x - ${a}) = x^2 - ${certa}$.`,
      ],
      visual: visual([['x²', ladoX(a)], [ladoX(-a), '?']], `O retângulo de (x + ${a}) por (x − ${a}): x², ${a}x e −${a}x riscados, "?" no canto.`),
    }
  },
}

export const somaDiferencaN2: Gerador = {
  id: 'fatoracao-soma-diferenca-n2',
  aula: 'AF.U2.A3',
  nivel: 2,
  gerar(r) {
    // (px + a)(px − a), em qualquer ordem, entre os erros comuns.
    const p = r.int(1, 3)
    const a = r.int(1, 9)
    const soma = `(${binomio(p, a)})`
    const dif = `(${binomio(p, -a)})`
    const t = r.int(0, 1) === 0 ? `${soma}${dif}` : `${dif}${soma}`
    const certa: Termo[] = [[p * p, 2], [-a * a, 0]]
    return {
      enunciado: `Multiplique: $${t}$.`,
      formato: 'escolha',
      ...escolha(r, [
        [poli(certa), undefined],
        [poli([[p * p, 2], [a * a, 0]]), 'sinais-diferentes-da-positivo'],
        [poli([[p * p, 2], [-2 * p * a, 1], [-a * a, 0]]), 'meios-opostos-somados'],
        [poli([[p * p, 2], [-2 * p * a, 1], [a * a, 0]]), 'soma-vezes-diferenca-como-quadrado'],
      ]),
      dicas: [
        'Os pedaços do meio têm sinais opostos: eles se cancelam.',
        `Os do meio são $${mono(p * a, 1)}$ e $${mono(-p * a, 1)}$; o canto, $${a} \\cdot (-${a}) = -${a * a}$.`,
        `$${t} = ${poli([[p * p, 2], [p * a, 1], [-p * a, 1], [-a * a, 0]])} = ${poli(certa)}$.`,
      ],
    }
  },
}

export const somaDiferencaN3: Gerador = {
  id: 'fatoracao-soma-diferenca-n3',
  aula: 'AF.U2.A3',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Uma conta de cabeça: (10d + u)(10d − u).
      const d = r.int(2, 9)
      const u = r.int(1, 4)
      const dz = 10 * d
      const [m, n] = r.int(0, 1) === 0 ? [dz + u, dz - u] : [dz - u, dz + u]
      const certa = dz * dz - u * u
      return {
        enunciado: `Calcule de cabeça: $${m} \\cdot ${n}$.`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [dz * dz, 'mais-e-menos-nao-mudam-a-area'],
          [dz * dz + u * u, 'sinais-diferentes-da-positivo'],
        ]),
        dicas: [
          `Os dois números ficam em volta de ${dz}: pense em $(${dz} + ${u})(${dz} - ${u})$.`,
          `Os pedaços do meio se cancelam. Sobra $${dz}^2 - ${u}^2$.`,
          `$${dz * dz} - ${u * u} = ${certa}$.`,
        ],
      }
    }
    // O terreno de k metros que ganha a na frente e perde a no fundo.
    const a = r.int(1, 6)
    const k = r.int(a + 2, 30)
    const certa = a * a
    return {
      enunciado: `Um terreno quadrado tem ${k}${NB}m de lado. Ele ganha ${a}${NB}m na frente e perde ${a}${NB}m no fundo. Quantos m² de área ele perde?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [0, 'mais-e-menos-nao-mudam-a-area'],
        [2 * a, 'potencia-multiplica-base-pelo-expoente'],
      ]),
      dicas: [
        `Com o lado x, a área nova é $(x + ${a})(x - ${a}) = x^2 - ${a * a}$.`,
        `Os pedaços do meio se cancelam: o terreno perde só o canto, ${a} por ${a}.`,
        `Antes, $${k}^2 = ${k * k}$${NB}m²; depois, $${k + a} \\cdot ${k - a} = ${(k + a) * (k - a)}$${NB}m². Perde $${certa}$${NB}m².`,
      ],
    }
  },
}

export const GERADORES_AF_U02A: Gerador[] = [
  quadradoSomaN1,
  quadradoSomaN2,
  quadradoSomaN3,
  quadradoDiferencaN1,
  quadradoDiferencaN2,
  quadradoDiferencaN3,
  somaDiferencaN1,
  somaDiferencaN2,
  somaDiferencaN3,
]
