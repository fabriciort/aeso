import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 19: probabilidade (aulas 4 a 6). Contagem; probabilidade;
// frequência e simulação.
//
// Os números do enunciado vêm em negrito; os milhares, com ponto (1.200), e a
// porcentagem com o espaço que não quebra (70 %). As chances das opções vêm
// em TeX ($\frac{3}{8}$), sem simplificar: o aluno conta os casos e escreve a
// fração como contou. As respostas em porcentagem são sempre inteiras (o total
// divide 100). Nenhuma resposta é negativa: não há `sinal`.

// ---------------------------------------------------------------- ferramentas

/** O espaço que não quebra: 70 % fica na mesma linha. */
const NB = ' '
/** Em negrito: **3**, **3 camisas**. */
const neg = (t: string | number) => `**${t}**`
/** Milhar com ponto: 1200 → '1.200'. */
const mil = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** A fração em TeX: $\frac{3}{8}$. */
const fr = (n: number, d: number) => `$\\frac{${n}}{${d}}$`
/** Plural simples: 1 bola, 2 bolas. */
const pl = (n: number, um: string, varios: string) => (n === 1 ? um : varios)

/** Erros previsíveis (como o aluno digitaria), só inteiros positivos, sem a certa e sem repetir (fica o primeiro). */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (!Number.isInteger(valor) || valor <= 0 || valor === certa) continue
    const k = String(valor)
    if (k in erros) continue
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
/** O valor da fração de uma opção ('$\\frac{3}{8}$' → 0,375), ou o próprio texto. */
const valorDaOpcao = (t: string) => {
  const m = t.match(/^\$\\frac\{(\d+)\}\{(\d+)\}\$$/)
  return m ? String(Number(m[1]) / Number(m[2])) : t
}
/**
 * Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada;
 * tira as repetidas (também as frações de mesmo valor, como 3/33 e 1/11: fica
 * a primeira) e embaralha.
 */
function escolha(r: Rng, opcoes: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const unicas = opcoes.filter(([t], i) => opcoes.findIndex(([u]) => valorDaOpcao(u) === valorDaOpcao(t)) === i)
  const ordem = embaralha(r, unicas.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = unicas[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => unicas[o][0]), resposta: ordem.indexOf(0), erros }
}

// ---------------------------------------------------------------- aula 4: contagem

/** Duas etapas: o enunciado, as opções de cada etapa (para a árvore) e o nome do que se conta. */
const DUAS = [
  {
    nomes: ['camisa', 'calça'],
    a: ['azul', 'preta', 'branca', 'verde'],
    b: ['jeans', 'social', 'bege'],
    texto: (x: number, y: number) => `Lia tem ${neg(`${x} camisas`)} e ${neg(`${y} calças`)}. Quantas roupas diferentes ela pode montar, com uma de cada?`,
    coisa: 'roupas',
  },
  {
    nomes: ['sabor', 'calda'],
    a: ['coco', 'uva', 'limão', 'manga'],
    b: ['mel', 'morango', 'caramelo'],
    texto: (x: number, y: number) => `Uma sorveteria tem ${neg(`${x} sabores`)} e ${neg(`${y} caldas`)}. Quantas taças diferentes, com um sabor e uma calda?`,
    coisa: 'taças',
  },
  {
    nomes: ['pão', 'recheio'],
    a: ['francês', 'forma', 'integral', 'sírio'],
    b: ['queijo', 'frango', 'ovo'],
    texto: (x: number, y: number) => `Uma padaria tem ${neg(`${x} pães`)} e ${neg(`${y} recheios`)}. Quantos sanduíches diferentes, com um pão e um recheio?`,
    coisa: 'sanduíches',
  },
]

export const contagemN1: Gerador = {
  id: 'contagem-n1',
  aula: 'B.U19.A4',
  nivel: 1,
  gerar(r) {
    const ctx = r.pick(DUAS)
    const a = r.int(2, 4)
    let b = r.int(2, 3)
    // 2 + 2 = 2 × 2: o erro de somar não se distinguiria.
    if (a === 2 && b === 2) b = 3
    const certa = a * b
    const visual: Visual = {
      modelo: 'contagem',
      estado: { arvore: [ctx.a.slice(0, a), ctx.b.slice(0, b)], nomes: ctx.nomes, conta: false },
      esboco: `A árvore inteira, sem a conta embaixo: ${a} ramos, cada um abrindo ${b}. O aluno pode contar as ${certa} pontas.`,
    }
    return {
      enunciado: ctx.texto(a, b),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [a + b, 'soma-no-lugar-de-multiplicar'],
        [a, 'esquece-uma-etapa'],
        [b, 'esquece-uma-etapa'],
      ]),
      dicas: [
        'Escolhas em sequência se multiplicam: cada opção da primeira etapa vai com todas as da segunda.',
        `Na árvore, cada um dos ${a} ramos abre ${b}: são ${a} grupos de ${b}.`,
        `$${a} \\times ${b} = ${certa}$: são ${certa} ${ctx.coisa}.`,
      ],
      visual,
    }
  },
}

/** Três etapas: o enunciado com os três números. */
const TRES = [
  { texto: (a: number, b: number, c: number) => `Uma lanchonete tem ${neg(`${a} pães`)}, ${neg(`${b} recheios`)} e ${neg(`${c} sucos`)}. Quantos lanches diferentes, com um de cada?`, coisa: 'lanches' },
  { texto: (a: number, b: number, c: number) => `Um restaurante tem ${neg(`${a} entradas`)}, ${neg(`${b} pratos`)} e ${neg(`${c} sobremesas`)}. Quantos menus diferentes, com um de cada?`, coisa: 'menus' },
  { texto: (a: number, b: number, c: number) => `Um carro vem em ${neg(`${a} cores`)}, com ${neg(`${b} tipos de roda`)} e ${neg(`${c} tipos de banco`)}. Quantos carros diferentes dá para montar?`, coisa: 'carros' },
]

export const contagemN2: Gerador = {
  id: 'contagem-n2',
  aula: 'B.U19.A4',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(['tres', 'tres', 'moeda', 'dados', 'roleta'] as const)
    if (tipo === 'tres') {
      const ctx = r.pick(TRES)
      const a = r.int(2, 5)
      const b = r.int(2, 5)
      const c = r.int(2, 4)
      const certa = a * b * c
      return {
        enunciado: ctx.texto(a, b, c),
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [a + b + c, 'soma-no-lugar-de-multiplicar'],
          [a * b, 'esquece-uma-etapa'],
          [b * c, 'esquece-uma-etapa'],
          [a * c, 'esquece-uma-etapa'],
        ]),
        dicas: [
          'Cada etapa nova multiplica: cada combinação das etapas anteriores abre todas as opções da próxima.',
          `As duas primeiras etapas: $${a} \\times ${b} = ${a * b}$.`,
          `$${a} \\times ${b} \\times ${c} = ${certa}$: são ${certa} ${ctx.coisa}.`,
        ],
      }
    }
    // Dois sorteios juntos: a moeda e o dado, os dois dados, o dado e a roleta.
    const k = r.int(3, 5)
    const [x, y, texto] = tipo === 'moeda'
      ? [2, 6, 'Você joga uma moeda e um dado. Quantos resultados diferentes podem sair, juntando os dois?']
      : tipo === 'dados'
        ? [6, 6, 'Você joga dois dados, um amarelo e um azul. Quantos resultados diferentes podem sair?']
        : [6, k, `Você joga um dado e gira uma roleta de ${neg(`${k} cores`)}. Quantos resultados diferentes podem sair?`]
    const certa = x * y
    const pares: [number, string][] = [
      [x + y, 'soma-no-lugar-de-multiplicar'],
      [Math.max(x, y), 'esquece-uma-etapa'],
      [Math.min(x, y), 'esquece-uma-etapa'],
    ]
    // Os dois dados sem a ordem: 15 pares diferentes e 6 iguais, 21.
    if (tipo === 'dados') pares.push([21, 'ignora-a-ordem-dos-dados'])
        return {
      enunciado: texto,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares),
      dicas: [
        tipo === 'moeda' ? 'Cada face da moeda vai com cada face do dado.' : tipo === 'dados' ? 'Cada face do amarelo vai com cada face do azul.' : 'Cada face do dado vai com cada cor da roleta.',
        `${tipo === 'moeda' ? 'A moeda tem 2 faces e o dado, 6' : tipo === 'dados' ? 'Cada dado tem 6 faces' : `O dado tem 6 faces e a roleta, ${k} cores`}: monte a grade, uma linha para cada resultado do primeiro.`,
        `$${x} \\times ${y} = ${certa}$: são ${certa} resultados.`,
      ],
    }
  },
}

export const contagemN3: Gerador = {
  id: 'contagem-n3',
  aula: 'B.U19.A4',
  nivel: 3,
  gerar(r) {
    // Senhas só de algarismos, ou códigos com letras (26) e algarismos (10).
    const letras = r.pick([0, 0, 1, 2])
    const k = letras === 0 ? r.int(2, 4) : r.int(1, letras === 2 ? 2 : 3)
    const certa = 26 ** letras * 10 ** k
    const enunciado = letras === 0
      ? `Uma senha tem ${neg(`${k} algarismos`)}, cada um de 0 a 9. Quantas senhas diferentes existem?`
      : `Um código tem ${neg(`${letras} ${pl(letras, 'letra', 'letras')}`)} (de A a Z, **26** opções) e ${neg(`${k} ${pl(k, 'algarismo', 'algarismos')}`)} (de 0 a 9). Quantos códigos existem?`
    const pares: [number, string][] = [[26 * letras + 10 * k, 'soma-no-lugar-de-multiplicar']]
    if (k >= 2) pares.push([26 ** letras * 10 ** (k - 1), 'conta-zeros-errado'])
    if (letras > 0) pares.push([26 ** letras, 'esquece-uma-etapa'], [10 ** k, 'esquece-uma-etapa'])
    const etapas = [...Array(letras).fill('26'), ...Array(k).fill('10')]
    const conta = etapas.join(' \\times ')
    return {
      enunciado,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares),
      dicas: [
        `Cada posição é uma etapa: ${letras ? '26 opções para cada letra e 10 para cada algarismo' : '10 opções para cada algarismo'}. As etapas se multiplicam.`,
        `São ${etapas.length} posições: $${conta}$.`,
        `$${conta} = ${mil(certa).replace(/\./g, '{.}')}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: probabilidade

/** As faces de um dado que servem, pela regra do enunciado. */
function regraDoDado(r: Rng): { texto: string; faces: number[] } {
  const tipo = r.pick(['par', 'impar', 'maior', 'menor', 'mult3', 'face'] as const)
  const todas = [1, 2, 3, 4, 5, 6]
  if (tipo === 'par') return { texto: 'um número par', faces: [2, 4, 6] }
  if (tipo === 'impar') return { texto: 'um número ímpar', faces: [1, 3, 5] }
  if (tipo === 'mult3') return { texto: 'um múltiplo de 3', faces: [3, 6] }
  if (tipo === 'maior') {
    const k = r.int(1, 4)
    return { texto: `um número maior que ${k}`, faces: todas.filter((f) => f > k) }
  }
  if (tipo === 'menor') {
    const k = r.int(2, 5)
    return { texto: `um número menor que ${k}`, faces: todas.filter((f) => f < k) }
  }
  const k = r.int(1, 6)
  return { texto: `o ${k}`, faces: [k] }
}

/** As cores do saco: o nome no singular (a cor do player) e no plural. */
const CORES: [string, string][] = [['azul', 'azuis'], ['vermelha', 'vermelhas'], ['verde', 'verdes'], ['roxa', 'roxas']]
/** "**3** azuis, **4** vermelhas e **1** verde" */
const lista = (cs: [string, string][], ns: number[]) => {
  const partes = cs.map(([um, varios], i) => `${neg(ns[i])} ${pl(ns[i], um, varios)}`)
  return partes.length === 2 ? partes.join(' e ') : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
}

export const probabilidadeN1: Gerador = {
  id: 'probabilidade-n1',
  aula: 'B.U19.A5',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O dado, com as faces que servem acesas.
      const { texto, faces } = regraDoDado(r)
      const f = faces.length
      return {
        enunciado: `Você joga um dado. Qual é a chance de sair ${texto}?`,
        formato: 'escolha',
        ...escolha(r, [
          [fr(f, 6), undefined],
          [fr(f, 6 - f), 'pintadas-sobre-nao-pintadas'],
          [fr(6, f), 'troca-numerador-denominador'],
        ]),
        dicas: [
          'A chance é o número de casos que servem dividido pelo número de casos possíveis.',
          `O dado tem 6 faces. As que servem estão acesas: ${faces.join(', ')}.`,
          `${f} de 6: a chance é ${fr(f, 6)}.`,
        ],
        visual: {
          modelo: 'sorteio',
          estado: { casos: 'dado', favoraveis: { valores: faces } },
          esboco: `As seis faces do dado, com ${faces.join(', ')} acesas em âmbar.`,
        },
      }
    }
    // O saco de bolas, com as da cor pedida acesas.
    const k = r.int(2, 3)
    const cs = embaralha(r, CORES).slice(0, k)
    let ns = cs.map(() => r.int(1, 5))
    while (ns.reduce((a, b) => a + b, 0) > 12) ns = ns.map((n) => Math.max(1, n - 1))
    const n = ns.reduce((a, b) => a + b, 0)
    const i = r.int(0, k - 1)
    const f = ns[i]
    const opcoes: [string, string | undefined][] = [
      [fr(f, n), undefined],
      [fr(f, n - f), 'pintadas-sobre-nao-pintadas'],
      [fr(n, f), 'troca-numerador-denominador'],
    ]
    // Uma cor para cada caso: só quando dá outra chance.
    if (f * k !== n) opcoes.push([fr(1, k), 'resultados-como-casos-iguais'])
    return {
      enunciado: `Um saco tem ${lista(cs, ns)}. Você tira uma bola sem olhar. Qual é a chance de ela ser ${cs[i][0]}?`,
      formato: 'escolha',
      ...escolha(r, opcoes),
      dicas: [
        'Cada bola é um caso. A chance é o número de bolas que servem dividido pelo número de bolas.',
        `No saco há $${ns.join(' + ')} = ${n}$ bolas. ${pl(f, 'Serve', 'Servem')} ${f}.`,
        `${f} de ${n}: a chance é ${fr(f, n)}.`,
      ],
      visual: {
        modelo: 'sorteio',
        estado: { bolas: Object.fromEntries(cs.map(([um], j) => [um, ns[j]])), favoraveis: { cor: cs[i][0] } },
        esboco: `O saco com ${cs.map(([um, varios], j) => `${ns[j]} ${pl(ns[j], um, varios)}`).join(', ')}; as ${cs[i][1]} acesas.`,
      },
    }
  },
}

export const probabilidadeN2: Gerador = {
  id: 'probabilidade-n2',
  aula: 'B.U19.A5',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O saco: o total divide 100, para a porcentagem sair inteira.
      const n = r.pick([4, 5, 10, 20, 25])
      const k = n === 4 ? 2 : r.int(2, 3)
      const cs = embaralha(r, CORES).slice(0, k)
      const f = r.int(1, n - (k - 1))
      const resto = n - f
      const ns = k === 2 ? [f, resto] : (() => {
        const b = r.int(1, resto - 1)
        return [f, b, resto - b]
      })()
      // A cor pedida não fica sempre em primeiro.
      const ordem = embaralha(r, cs.map((_, j) => j))
      const csO = ordem.map((j) => cs[j])
      const nsO = ordem.map((j) => ns[j])
      const pedida = cs[0]
      const certa = (100 * f) / n
      return {
        enunciado: `Um saco tem ${lista(csO, nsO)}. Qual é a chance de tirar uma bola ${pedida[0]}, em %?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [f, 'parte-como-porcentagem'],
          [(100 * f) / (n - f), 'pintadas-sobre-nao-pintadas'],
          [100 / k, 'resultados-como-casos-iguais'],
        ]),
        dicas: [
          'A chance é bolas que servem sobre todas as bolas. Depois, passe a fração para porcentagem.',
          `São ${n} bolas, e ${f} ${pl(f, 'é', 'são')} ${pl(f, pedida[0], pedida[1])}: ${fr(f, n)}.`,
          `$\\frac{${f}}{${n}} = ${certa}\\%$. A chance é ${certa}${NB}%.`,
        ],
      }
    }
    // As cartas numeradas: os múltiplos de m.
    const N = r.pick([10, 20, 25, 50])
    const m = r.pick([2, 3, 4, 5, 10].filter((x) => x < N))
    const f = Math.floor(N / m)
    const certa = (100 * f) / N
    const multiplos = Array.from({ length: f }, (_, j) => (j + 1) * m)
    return {
      enunciado: `Há ${neg(N)} cartas, numeradas de 1 a ${N}. Você tira uma. Qual é a chance de sair um múltiplo de ${neg(m)}, em %?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [f, 'parte-como-porcentagem'],
        [(100 * f) / (N - f), 'pintadas-sobre-nao-pintadas'],
      ]),
      dicas: [
        'Conte os casos que servem e divida pelo número de cartas. Depois, passe para porcentagem.',
        `Os múltiplos de ${m} até ${N}: ${f > 6 ? `${multiplos.slice(0, 3).join(', ')}… são ${f}` : multiplos.join(', ')}. ${fr(f, N)}.`,
        `$\\frac{${f}}{${N}} = ${certa}\\%$. A chance é ${certa}${NB}%.`,
      ],
    }
  },
}

/** Os 36 resultados de dois dados, contados de dois jeitos: com a ordem (as casas da grade) e sem ela. */
function doisDados(serve: (a: number, b: number) => boolean): { c: number; u: number } {
  let c = 0
  let u = 0
  for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) {
    if (!serve(a, b)) continue
    c++
    if (a <= b) u++
  }
  return { c, u }
}

const DOIS = 'Você joga dois dados, um amarelo e um azul.'

export const probabilidadeN3: Gerador = {
  id: 'probabilidade-n3',
  aula: 'B.U19.A5',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['soma', 'soma', 'maior', 'iguais'] as const)
    if (tipo === 'iguais') {
      return {
        enunciado: `${DOIS} Qual é a chance de os dois darem o mesmo número?`,
        formato: 'escolha',
        ...escolha(r, [
          [fr(6, 36), undefined],
          [fr(6, 30), 'pintadas-sobre-nao-pintadas'],
          [fr(6, 21), 'ignora-a-ordem-dos-dados'],
        ]),
        dicas: [
          'São 6 × 6 = 36 casos possíveis: cada face do amarelo com cada face do azul.',
          'Os iguais: 1 e 1, 2 e 2, 3 e 3, 4 e 4, 5 e 5, 6 e 6.',
          `6 de 36: a chance é ${fr(6, 36)}.`,
        ],
      }
    }
    const S = tipo === 'soma' ? r.pick([3, 4, 5, 6, 7, 8, 9, 10, 11]) : r.int(8, 10)
    const { c, u } = doisDados(tipo === 'soma' ? (a, b) => a + b === S : (a, b) => a + b > S)
    const opcoes: [string, string | undefined][] = [
      [fr(c, 36), undefined],
      [tipo === 'soma' ? fr(1, 11) : fr(12 - S, 11), 'resultados-como-casos-iguais'],
      [fr(u, 36), 'ignora-a-ordem-dos-dados'],
      [fr(c, 36 - c), 'pintadas-sobre-nao-pintadas'],
    ]
    const pergunta = tipo === 'soma' ? `a soma dar ${neg(S)}` : `a soma ser maior que ${neg(S)}`
    return {
      enunciado: `${DOIS} Qual é a chance de ${pergunta}?`,
      formato: 'escolha',
      ...escolha(r, opcoes),
      dicas: [
        'São 6 × 6 = 36 casos: amarelo 2 com azul 5 é um caso; amarelo 5 com azul 2, outro.',
        tipo === 'soma'
          ? `Pense na grade: cada casa com soma ${S} é um caso. Conte também as de ordem trocada.`
          : `As somas que servem: ${Array.from({ length: 12 - S }, (_, j) => S + 1 + j).join(', ')}. Conte as casas de cada uma.`,
        `São ${c} casas de 36: a chance é ${fr(c, 36)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: frequência e simulação

export const frequenciaN1: Gerador = {
  id: 'frequencia-n1',
  aula: 'B.U19.A6',
  nivel: 1,
  gerar(r) {
    // O total divide 100, para a frequência sair inteira.
    const N = r.pick([20, 25, 50, 100])
    if (r.int(0, 1) === 0) {
      let C = r.int(Math.round(0.3 * N), Math.round(0.7 * N))
      if (2 * C === N) C++
      const certa = (100 * C) / N
      return {
        enunciado: `Uma moeda foi jogada ${neg(N)} vezes. Saíram ${neg(C)} caras. Qual foi a frequência de caras, em %?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [C, 'parte-como-porcentagem'],
          [50, 'frequencia-igual-a-chance'],
          [100 - certa, 'responde-outra-pergunta'],
        ]),
        dicas: [
          'A frequência é quantas vezes saiu dividido pelo número de jogadas. Depois, passe para porcentagem.',
          `${C} caras em ${N} jogadas: ${fr(C, N)}.`,
          `$\\frac{${C}}{${N}} = ${certa}\\%$. A frequência de caras foi ${certa}${NB}%.`,
        ],
        visual: {
          modelo: 'grafico',
          estado: { titulo: `${N} jogadas da moeda`, dados: [['cara', C], ['coroa', N - C]] },
          esboco: `Duas barras com os valores escritos: cara ${C}, coroa ${N - C}.`,
        },
      }
    }
    // O dado: as contagens das seis faces, sorteadas uma jogada por vez.
    const cont = [0, 0, 0, 0, 0, 0]
    for (let j = 0; j < N; j++) cont[r.int(0, 5)]++
    let k = r.int(1, 6)
    while (cont[k - 1] === 0) k = (k % 6) + 1
    const C = cont[k - 1]
    const certa = (100 * C) / N
    return {
      enunciado: `Um dado foi jogado ${neg(N)} vezes, e o ${neg(k)} saiu ${neg(C)} ${pl(C, 'vez', 'vezes')}. Qual foi a frequência do ${k}, em %?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [C, 'parte-como-porcentagem'],
        [17, 'frequencia-igual-a-chance'],
      ]),
      dicas: [
        'A frequência é quantas vezes saiu dividido pelo número de jogadas. Depois, passe para porcentagem.',
        `O ${k} saiu ${C} ${pl(C, 'vez', 'vezes')} em ${N}: ${fr(C, N)}.`,
        `$\\frac{${C}}{${N}} = ${certa}\\%$. A frequência do ${k} foi ${certa}${NB}%.`,
      ],
      visual: {
        modelo: 'grafico',
        estado: { titulo: `${N} jogadas do dado`, dados: cont.map((v, j) => [String(j + 1), v]), destaque: k - 1 },
        esboco: `Seis barras, uma por face, com as contagens ${cont.join(', ')}; a do ${k} acesa.`,
      },
    }
  },
}

export const frequenciaN2: Gerador = {
  id: 'frequencia-n2',
  aula: 'B.U19.A6',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(['dado', 'moeda', 'saco'] as const)
    if (tipo === 'dado') {
      const N = 6 * r.int(5, 200)
      const k = r.int(1, 6)
      const certa = N / 6
      return {
        enunciado: `Um dado vai ser jogado ${neg(mil(N))} vezes. Cerca de quantas vezes você espera que saia o ${neg(k)}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [N * 6, 'operacao-trocada'],
          [N - certa, 'responde-outra-pergunta'],
        ]),
        dicas: [
          'Com muitas jogadas, a frequência fica perto da chance. O esperado é a chance vezes as jogadas.',
          `A chance do ${k} é ${fr(1, 6)}. Ache ${fr(1, 6)} de ${mil(N)}.`,
          `$${mil(N).replace(/\./g, '{.}')} \\div 6 = ${mil(certa).replace(/\./g, '{.}')}$. O esperado é cerca de ${mil(certa)} vezes.`,
        ],
      }
    }
    if (tipo === 'moeda') {
      const N = 2 * r.int(10, 1000)
      const certa = N / 2
      return {
        enunciado: `Uma moeda vai ser jogada ${neg(mil(N))} vezes. Cerca de quantas caras você espera?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[N * 2, 'operacao-trocada']]),
        dicas: [
          'Com muitas jogadas, a frequência fica perto da chance. O esperado é a chance vezes as jogadas.',
          `A chance de cara é ${fr(1, 2)}. Ache a metade de ${mil(N)}.`,
          `$${mil(N).replace(/\./g, '{.}')} \\div 2 = ${mil(certa).replace(/\./g, '{.}')}$. O esperado é cerca de ${mil(certa)} caras.`,
        ],
      }
    }
    // O saco, com a bola devolvida a cada vez.
    const n = r.pick([4, 5, 8, 10])
    const a = r.int(1, n - 1)
    const N = n * r.int(5, 50)
    const certa = (N * a) / n
    return {
      enunciado: `Um saco tem ${neg(a)} ${pl(a, 'bola azul', 'bolas azuis')} e ${neg(n - a)} ${pl(n - a, 'vermelha', 'vermelhas')}. Você tira uma, anota a cor e devolve, ${neg(mil(N))} vezes. Quantas azuis você espera?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [N * a, 'esquece-de-dividir'],
        [(N * a) / (n - a), 'pintadas-sobre-nao-pintadas'],
        [N / 2, 'resultados-como-casos-iguais'],
      ]),
      dicas: [
        'O esperado é a chance vezes o número de vezes. A bola volta para o saco: a chance não muda.',
        `A chance de azul é ${fr(a, n)}. Ache ${fr(a, n)} de ${mil(N)}: primeiro $${mil(N).replace(/\./g, '{.}')} \\div ${n} = ${N / n}$.`,
        `$${N / n} \\times ${a} = ${mil(certa).replace(/\./g, '{.}')}$. O esperado é cerca de ${mil(certa)} azuis.`,
      ],
    }
  },
}

const PESSOAS: [string, string][] = [['Ana', 'Beto'], ['Carla', 'Davi'], ['Júlia', 'Marcos'], ['Rita', 'Paulo']]

export const frequenciaN3: Gerador = {
  id: 'frequencia-n3',
  aula: 'B.U19.A6',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['moeda', 'dado', 'saco', 'confianca'] as const)
    const ideia = 'A moeda, o dado e o saco não lembram o que saiu antes: cada jogada é nova.'
    if (tipo === 'moeda') {
      const k = r.int(4, 9)
      return {
        enunciado: `Uma moeda deu ${neg(k)} caras seguidas. Qual é a chance de dar cara na próxima jogada?`,
        formato: 'escolha',
        ...escolha(r, [
          ['$\\frac{1}{2}$, como sempre', undefined],
          ['Menos de $\\frac{1}{2}$: a coroa está atrasada', 'falacia-do-jogador'],
          ['Mais de $\\frac{1}{2}$: a cara está em alta', 'falacia-do-jogador'],
        ]),
        dicas: [
          ideia,
          `As ${k} caras já passaram. Na próxima jogada, a moeda tem as mesmas 2 faces.`,
          'A chance de cara continua $\\frac{1}{2}$.',
        ],
      }
    }
    if (tipo === 'dado') {
      const f = r.int(1, 6)
      const m = r.int(8, 20)
      return {
        enunciado: `Num dado, o ${neg(f)} não sai há ${neg(m)} jogadas. Qual é a chance de sair o ${f} na próxima?`,
        formato: 'escolha',
        ...escolha(r, [
          ['$\\frac{1}{6}$, como sempre', undefined],
          ['Mais de $\\frac{1}{6}$: ele está atrasado', 'falacia-do-jogador'],
          ['Menos de $\\frac{1}{6}$: ele está em baixa', 'falacia-do-jogador'],
        ]),
        dicas: [
          ideia,
          `As ${m} jogadas já passaram. Na próxima, o dado tem as mesmas 6 faces.`,
          `A chance do ${f} continua $\\frac{1}{6}$.`,
        ],
      }
    }
    if (tipo === 'saco') {
      const a = r.int(1, 5)
      const b = r.int(2, 6)
      const k = r.int(3, 6)
      return {
        enunciado: `Um saco tem ${neg(a)} ${pl(a, 'azul', 'azuis')} e ${neg(b)} vermelhas. Você tira e devolve: saíram ${neg(k)} vermelhas seguidas. Qual é a chance de azul agora?`,
        formato: 'escolha',
        ...escolha(r, [
          [fr(a, a + b), undefined],
          [`Mais de ${fr(a, a + b)}: a azul está atrasada`, 'falacia-do-jogador'],
          [fr(a, b), 'pintadas-sobre-nao-pintadas'],
        ]),
        dicas: [
          `${ideia} A bola volta: o saco fica igual.`,
          `No saco continuam ${a + b} bolas, e ${a} ${pl(a, 'é azul', 'são azuis')}.`,
          `${a} de ${a + b}: a chance é ${fr(a, a + b)}.`,
        ],
      }
    }
    // Quem merece mais confiança: poucas ou muitas jogadas da mesma moeda.
    const [p1, p2] = r.pick(PESSOAS)
    const poucas = r.pick([10, 20])
    const muitas = r.pick([500, 1000, 2000])
    const pctPoucas = r.pick([20, 30, 70, 80])
    const pctMuitas = r.int(48, 52)
    const primeiroPoucas = r.int(0, 1) === 0
    const [n1, q1, n2, q2] = primeiroPoucas ? [poucas, pctPoucas, muitas, pctMuitas] : [muitas, pctMuitas, poucas, pctPoucas]
    const certo = primeiroPoucas ? p2 : p1
    const errado = primeiroPoucas ? p1 : p2
    return {
      enunciado: `Com a mesma moeda, ${p1} jogou ${neg(mil(n1))} vezes e tirou ${neg(`${q1}${NB}%`)} de caras; ${p2}, ${neg(mil(n2))} vezes e ${neg(`${q2}${NB}%`)}. Em quem confiar mais?`,
      formato: 'escolha',
      ...escolha(r, [
        [`Em ${certo}: jogou muito mais vezes`, undefined],
        [`Em ${errado}: poucas jogadas já bastam`, 'frequencia-igual-a-chance'],
        ['Tanto faz: os dois jogaram a mesma moeda', 'frequencia-igual-a-chance'],
      ]),
      dicas: [
        'Com poucas jogadas, a frequência pode ficar longe da chance. Com muitas, fica perto.',
        `${mil(poucas)} jogadas são poucas; ${mil(muitas)} são muitas.`,
        `Confie em quem jogou ${mil(muitas)} vezes: ${certo}. A chance de cara deve estar perto de ${pctMuitas}${NB}%.`,
      ],
    }
  },
}

export const GERADORES_U19B: Gerador[] = [
  contagemN1,
  contagemN2,
  contagemN3,
  probabilidadeN1,
  probabilidadeN2,
  probabilidadeN3,
  frequenciaN1,
  frequenciaN2,
  frequenciaN3,
]
