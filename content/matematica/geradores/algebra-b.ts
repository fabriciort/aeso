import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 14: linguagem algébrica (parte B). Aula 4, distributiva com
// letras; aula 5, traduzir frases.
//
// O teclado só digita números. Por isso os itens pedem um número (o que
// falta em a(x + b) = ax + □, o termo sem x, o valor para um x dado, o preço
// de uma corrida) ou dão as expressões como opções de `escolha`, escritas em
// TeX. Toda expressão de primeiro grau ax + b é montada por `lin`, que cuida
// do coeficiente 1 (x, não 1x) e do sinal do termo. Erros com resposta
// negativa se escrevem com o menos verdadeiro (−12).

// ---------------------------------------------------------------- ferramentas

/** O número como se escreve no texto, com o menos verdadeiro: −12. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))
/** Um fator em TeX, com parênteses se for negativo: (−3) vira '(-3)'. */
const fator = (n: number) => (n < 0 ? `(${n})` : String(n))

/** ax + b em TeX: (2, −6) → '2x - 6'; (−1, 3) → '-x + 3'; (3, 0) → '3x'. */
function lin(a: number, b: number): string {
  const x = a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`
  if (b === 0) return x
  return b > 0 ? `${x} + ${b}` : `${x} - ${-b}`
}
/** a(x ± b) em TeX: (2, −3) → '2(x - 3)'; (−2, 3) → '-2(x + 3)'. */
const parenteses = (a: number, b: number) => `${a}(x ${b < 0 ? '-' : '+'} ${Math.abs(b)})`

/** Erros previsíveis (como o aluno digitaria), sem a certa e sem repetir. */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    const k = num(valor)
    if (valor === certa || k in erros) continue
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

// ---------------------------------------------------------------- aula 4: distributiva com letras

export const distributivaLetrasN1: Gerador = {
  id: 'distributiva-letras-n1',
  aula: 'B.U14.A4',
  nivel: 1,
  gerar(r) {
    // a(x + b) = ax + □, com o retângulo partido em x e b.
    const a = r.int(2, 9)
    const b = r.int(2, 9)
    const visual: Visual = {
      modelo: 'retangulo',
      estado: { base: ['x', b], altura: [a], areas: [[`${a}x`, '?']], total: `${a}x + ?` },
      esboco: `O retângulo de ${a} de altura, com a base partida em x e ${b}: ${a}x no pedaço grande e "?" no pedaço do ${b}.`,
    }
    return {
      enunciado: `Complete: $${a}(x + ${b}) = ${a}x + \\square$. Qual número falta?`,
      formato: 'numero',
      resposta: a * b,
      erros: mapa(a * b, [
        [b, 'distributiva-parcial'],
        [a + b, 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        'O número de fora multiplica **cada termo** de dentro.',
        `O ${a} multiplica o x e também o ${b}. O pedaço do ${b} tem ${a} de altura.`,
        `$${a} \\cdot ${b} = ${a * b}$, então $${a}(x + ${b}) = ${a}x + ${a * b}$.`,
      ],
      visual,
    }
  },
}

/** Os três tipos do nível 2: um menos dentro, um menos fora com diferença, um menos fora com soma. */
type TipoD2 = 'menos-dentro' | 'menos-fora' | 'menos-fora-soma'
const TIPOS_D2: TipoD2[] = ['menos-dentro', 'menos-fora', 'menos-fora-soma']

export const distributivaLetrasN2: Gerador = {
  id: 'distributiva-letras-n2',
  aula: 'B.U14.A4',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(TIPOS_D2)
    const a = r.int(2, 6)
    const b = r.int(2, 9)
    // A = o número de fora; B = o termo sem x de dentro, com o sinal.
    const A = tipo === 'menos-dentro' ? a : -a
    const B = tipo === 'menos-fora-soma' ? b : -b
    const certa = lin(A, A * B)
    return {
      enunciado: `Tire os parênteses: $${parenteses(A, B)}$.`,
      formato: 'escolha',
      ...escolha(r, [
        [certa, undefined],
        [lin(A, -A * B), 'distributiva-sinal-do-negativo'],
        [lin(A, B), 'distributiva-parcial'],
      ]),
      dicas: [
        'O número de fora multiplica **cada termo** de dentro, com o sinal de cada um.',
        `Faça as duas contas: $${fator(A)} \\cdot x$ e $${fator(A)} \\cdot ${fator(B)}$. Sinais iguais dão mais; diferentes, menos.`,
        `$${fator(A)} \\cdot ${fator(B)} = ${A * B}$, então $${parenteses(A, B)} = ${certa}$.`,
      ],
    }
  },
}

/** Os quatro tipos do nível 3. */
type TipoD3 = 'evidencia' | 'area' | 'valor' | 'constante'
const TIPOS_D3: TipoD3[] = ['evidencia', 'area', 'valor', 'constante']

export const distributivaLetrasN3: Gerador = {
  id: 'distributiva-letras-n3',
  aula: 'B.U14.A4',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(TIPOS_D3)
    if (tipo === 'evidencia') {
      // ax ± ab = a(x ± □): o caminho de volta.
      const a = r.int(2, 9)
      const b = r.int(2, 9)
      const s = r.pick(['+', '-'] as const)
      return {
        enunciado: `Ponha em evidência: $${a}x ${s} ${a * b} = ${a}(x ${s} \\square)$. Qual número falta?`,
        formato: 'numero',
        resposta: b,
        erros: mapa(b, [[a * b, 'evidencia-esquece-termo']]),
        dicas: [
          'Pôr em evidência é o caminho de volta: distribua o resultado e confira.',
          `Qual número, vezes ${a}, dá ${a * b}?`,
          `$${a * b} \\div ${a} = ${b}$, então $${a}x ${s} ${a * b} = ${a}(x ${s} ${b})$.`,
        ],
      }
    }
    if (tipo === 'area') {
      // A área da horta: a(x + b) = ax + □.
      const a = r.int(2, 9)
      const b = r.int(2, 9)
      return {
        enunciado: `Uma horta tem **${a} m** de fundo e $(x + ${b})$ m de frente. A área é $${a}x + \\square$ m². Qual número falta?`,
        formato: 'numero',
        resposta: a * b,
        erros: mapa(a * b, [
          [b, 'distributiva-parcial'],
          [a + b, 'soma-no-lugar-de-multiplicar'],
        ]),
        dicas: [
          'Parta a horta em dois pedaços: o do x e o do número. Os dois têm o mesmo fundo.',
          `O pedaço do ${b} tem ${a} m de fundo: a área dele é $${a} \\cdot ${b}$.`,
          `$${a}(x + ${b}) = ${a}x + ${a * b}$.`,
        ],
      }
    }
    if (tipo === 'valor') {
      // A área com o x medido: a(k + b).
      const a = r.int(2, 9)
      const b = r.int(2, 9)
      const k = r.int(2, 12)
      return {
        enunciado: `Uma horta tem **${a} m** de fundo e $(x + ${b})$ m de frente. Com **x = ${k}**, qual é a área, em m²?`,
        formato: 'numero',
        resposta: a * (k + b),
        erros: mapa(a * (k + b), [
          [a * k + b, 'distributiva-parcial'],
          [a + k + b, 'soma-no-lugar-de-multiplicar'],
        ]),
        dicas: [
          `A área é $${a}(x + ${b}) = ${a}x + ${a * b}$. Troque o x por ${k}.`,
          `A frente mede $${k} + ${b} = ${k + b}$ m.`,
          `$${a} \\cdot ${k + b} = ${a * (k + b)}$, ou $${a * k} + ${a * b} = ${a * (k + b)}$ m².`,
        ],
      }
    }
    // O termo sem x, com sinais: A(x ± b) tem A · (±b).
    const a = r.int(2, 9)
    const b = r.int(2, 9)
    const A = r.pick([a, -a])
    const B = r.pick([b, -b])
    const certa = A * B
    return {
      enunciado: `Tire os parênteses de $${parenteses(A, B)}$. Qual é o número que fica sem o x?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [-certa, 'distributiva-sinal-do-negativo'],
        [B, 'distributiva-parcial'],
      ]),
      dicas: [
        'O número de fora multiplica **cada termo** de dentro, com o sinal.',
        `O número sem x vem de $${fator(A)} \\cdot ${fator(B)}$.`,
        `$${fator(A)} \\cdot ${fator(B)} = ${A * B}$: $${parenteses(A, B)} = ${lin(A, A * B)}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: traduzir frases

/** As frases de uma conta só do nível 1. */
type TipoT1 = 'dobro' | 'triplo' | 'metade' | 'sucessor' | 'a-mais' | 'a-menos'
const TIPOS_T1: TipoT1[] = ['dobro', 'triplo', 'metade', 'sucessor', 'a-mais', 'a-menos']

export const traduzirFrasesN1: Gerador = {
  id: 'traduzir-frases-n1',
  aula: 'B.U14.A5',
  nivel: 1,
  gerar(r) {
    const tipo = r.pick(TIPOS_T1)
    const B = r.int(2, 9)
    const casos: Record<TipoT1, { frase: string; ideia: string; opcoes: [string, string | undefined][] }> = {
      dobro: {
        frase: 'o dobro de um número',
        ideia: 'O dobro é 2 vezes o número.',
        opcoes: [['2x', undefined], ['x + 2', 'vezes-como-mais'], ['\\frac{x}{2}', 'confunde-dobro-e-metade']],
      },
      triplo: {
        frase: 'o triplo de um número',
        ideia: 'O triplo é 3 vezes o número.',
        opcoes: [['3x', undefined], ['x + 3', 'vezes-como-mais'], ['\\frac{x}{3}', undefined]],
      },
      metade: {
        frase: 'a metade de um número',
        ideia: 'A metade é o número dividido por 2.',
        opcoes: [['\\frac{x}{2}', undefined], ['2x', 'confunde-dobro-e-metade'], ['x - 2', undefined]],
      },
      sucessor: {
        frase: 'o sucessor de um número',
        ideia: 'O sucessor é o número seguinte: 1 a mais.',
        opcoes: [['x + 1', undefined], ['x - 1', undefined], ['2x', undefined]],
      },
      'a-mais': {
        frase: `${B} a mais que um número`,
        ideia: `${B} a mais: some ${B} ao número.`,
        opcoes: [[`x + ${B}`, undefined], [`${B}x`, 'vezes-como-mais'], [`x - ${B}`, undefined]],
      },
      'a-menos': {
        frase: `${B} a menos que um número`,
        ideia: `${B} a menos: tire ${B} do número. O número vem primeiro.`,
        opcoes: [[`x - ${B}`, undefined], [`${B} - x`, 'inverte-ordem-da-subtracao'], [`x + ${B}`, undefined]],
      },
    }
    const c = casos[tipo]
    return {
      enunciado: `Como se escreve **${c.frase}**, com x no lugar do número?`,
      formato: 'escolha',
      ...escolha(r, c.opcoes),
      dicas: [
        'Troque o número por **x** e a palavra pela sua conta.',
        `${c.ideia} Confira com o número 10.`,
        `**${c.frase[0].toUpperCase()}${c.frase.slice(1)}** se escreve $${c.opcoes[0][0]}$.`,
      ],
    }
  },
}

const VEZES: [number, string][] = [
  [2, 'dobro'],
  [3, 'triplo'],
  [4, 'quádruplo'],
]

/** As frases do nível 2: com e sem parênteses. */
type TipoT2 = 'sem-parenteses' | 'da-soma' | 'da-diferenca' | 'soma-vezes'
const TIPOS_T2: TipoT2[] = ['sem-parenteses', 'da-soma', 'da-diferenca', 'soma-vezes']

export const traduzirFrasesN2: Gerador = {
  id: 'traduzir-frases-n2',
  aula: 'B.U14.A5',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(TIPOS_T2)
    const [k, nome] = r.pick(VEZES)
    const b = r.int(2, 9)
    const mais = r.int(0, 1) === 0
    // A frase, a certa e a outra leitura (em TeX e como conta), e um terceiro erro.
    let frase: string
    let certa: [string, (x: number) => number]
    let outra: [string, (x: number) => number]
    let terceira: [string, string | undefined]
    let ideia: string
    if (tipo === 'sem-parenteses') {
      const s = mais ? 1 : -1
      frase = `o ${nome} de um número, ${mais ? 'mais' : 'menos'} ${b}`
      certa = [lin(k, s * b), (x) => k * x + s * b]
      outra = [`${k}(x ${mais ? '+' : '-'} ${b})`, (x) => k * (x + s * b)]
      terceira = [`x + ${k} ${mais ? '+' : '-'} ${b}`, 'vezes-como-mais']
      ideia = `Primeiro o ${nome}, depois ${mais ? 'some' : 'tire'} ${b}. Nada vem antes do ${nome}.`
    } else if (tipo === 'da-soma') {
      frase = `o ${nome} da soma de um número com ${b}`
      certa = [`${k}(x + ${b})`, (x) => k * (x + b)]
      outra = [lin(k, b), (x) => k * x + b]
      terceira = [`x + ${k} + ${b}`, 'vezes-como-mais']
      ideia = `Primeiro a soma, depois o ${nome}: a soma vai para os parênteses.`
    } else if (tipo === 'da-diferenca') {
      frase = `o ${nome} da diferença entre um número e ${b}`
      certa = [`${k}(x - ${b})`, (x) => k * (x - b)]
      outra = [lin(k, -b), (x) => k * x - b]
      terceira = [`${k}(${b} - x)`, 'inverte-ordem-da-subtracao']
      ideia = `Primeiro a diferença, depois o ${nome}: a diferença vai para os parênteses.`
    } else {
      frase = `a soma de um número com ${b}, vezes ${k}`
      certa = [`${k}(x + ${b})`, (x) => k * (x + b)]
      outra = [lin(k, b), (x) => k * x + b]
      terceira = [`x + ${b} \\cdot ${k}`, 'traduz-parenteses-errados']
      ideia = `Primeiro a soma, depois vezes ${k}: a soma vai para os parênteses.`
    }
    const dicas: [string, string, string] = [
      'A ordem das palavras decide a ordem das contas. A conta que vem antes vai para os parênteses.',
      ideia,
      `**${frase[0].toUpperCase()}${frase.slice(1)}** se escreve $${certa[0]}$.`,
    ]
    if (r.int(0, 1) === 0) {
      return {
        enunciado: `Como se escreve **${frase}**?`,
        formato: 'escolha',
        ...escolha(r, [
          [certa[0], undefined],
          [outra[0], 'traduz-parenteses-errados'],
          terceira,
        ]),
        dicas,
      }
    }
    // Com um número: a frase feita como ela pede.
    const n = tipo === 'da-diferenca' || (tipo === 'sem-parenteses' && !mais) ? r.int(b + 1, b + 8) : r.int(3, 12)
    const valor = certa[1](n)
    return {
      enunciado: `Faça com o número **${n}**: quanto dá **${frase}**?`,
      formato: 'numero',
      resposta: valor,
      erros: mapa(valor, [[outra[1](n), 'traduz-parenteses-errados']]),
      dicas: [dicas[0], ideia, `$${certa[0]}$ com x = ${n}: $${certa[0].replace(/(\d)x/, `$1 \\cdot ${n}`).replace(/\bx\b/, String(n))} = ${valor}$.`],
    }
  },
}

/** Preços com um valor fixo e um valor por unidade. */
const TARIFAS: { texto: (f: number, p: number, k: number) => string; f: [number, number, number]; p: [number, number, number]; k: [number, number]; unidade: string }[] = [
  {
    texto: (f, p, k) => `Uma corrida de aplicativo custa **R$ ${f}** para começar e **R$ ${p}** por km. Quanto custa uma corrida de **${k} km**?`,
    f: [3, 8, 1], p: [2, 4, 1], k: [3, 15], unidade: 'km',
  },
  {
    texto: (f, p, k) => `Um eletricista cobra **R$ ${f}** pela visita e **R$ ${p}** por hora. Quanto custa um serviço de **${k} horas**?`,
    f: [50, 100, 10], p: [40, 90, 10], k: [2, 5], unidade: 'hora',
  },
  {
    texto: (f, p, k) => `Uma academia cobra **R$ ${f}** de matrícula e **R$ ${p}** por mês. Quanto se paga em **${k} meses**, com a matrícula?`,
    f: [50, 120, 10], p: [80, 150, 10], k: [2, 6], unidade: 'mês',
  },
  {
    texto: (f, p, k) => `Um estacionamento cobra **R$ ${f}** na entrada e **R$ ${p}** por hora. Quanto custam **${k} horas**?`,
    f: [5, 10, 1], p: [2, 5, 1], k: [2, 8], unidade: 'hora',
  },
]
const passo = (r: Rng, [de, ate, por]: [number, number, number]) => de + por * r.int(0, (ate - de) / por)

const PESSOAS: [string, string][] = [
  ['Lia', 'dela'],
  ['Davi', 'dele'],
  ['Ana', 'dela'],
  ['Caio', 'dele'],
  ['Rita', 'dela'],
  ['Igor', 'dele'],
]

export const traduzirFrasesN3: Gerador = {
  id: 'traduzir-frases-n3',
  aula: 'B.U14.A5',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 2) > 0) {
      // Um preço: f + p · k.
      const t = r.pick(TARIFAS)
      const f = passo(r, t.f)
      const p = passo(r, t.p)
      const k = r.int(t.k[0], t.k[1])
      const valor = f + p * k
      return {
        enunciado: t.texto(f, p, k),
        formato: 'numero',
        resposta: valor,
        erros: mapa(valor, [
          [(f + p) * k, 'ignora-prioridade'],
          [p * k, 'esquece-valor-fixo'],
        ]),
        dicas: [
          `Com x no lugar do número de ${t.unidade === 'mês' ? 'meses' : t.unidade === 'hora' ? 'horas' : 'km'}, o preço é $${f} + ${p}x$: o fixo uma vez, mais ${p} por ${t.unidade}.`,
          `Troque o x por ${k}. Primeiro o vezes: $${p} \\cdot ${k} = ${p * k}$.`,
          `$${f} + ${p} \\cdot ${k} = ${f} + ${p * k} = ${valor}$ reais.`,
        ],
      }
    }
    // Uma idade: o dobro ou o triplo da idade, mais b anos.
    const [nome, de] = r.pick(PESSOAS)
    const [k, vezes] = r.pick(VEZES.slice(0, 2))
    const n = k === 2 ? r.int(14, 20) : r.int(8, 12)
    const b = r.int(2, 9)
    const valor = k * n + b
    return {
      enunciado: `${nome} tem x anos. A mãe tem **o ${vezes} da idade ${de}, mais ${b} anos**. Se ${nome} tem **${n} anos**, quantos anos tem a mãe?`,
      formato: 'numero',
      resposta: valor,
      erros: mapa(valor, [
        [k * (n + b), 'traduz-parenteses-errados'],
        [n + k + b, 'vezes-como-mais'],
      ]),
      dicas: [
        `A idade da mãe é $${k}x + ${b}$: primeiro o ${vezes}, depois mais ${b}.`,
        `Troque o x por ${n}: $${k} \\cdot ${n} = ${k * n}$.`,
        `$${k} \\cdot ${n} + ${b} = ${k * n} + ${b} = ${valor}$ anos.`,
      ],
    }
  },
}

export const GERADORES_U14B: Gerador[] = [
  distributivaLetrasN1,
  distributivaLetrasN2,
  distributivaLetrasN3,
  traduzirFrasesN1,
  traduzirFrasesN2,
  traduzirFrasesN3,
]
