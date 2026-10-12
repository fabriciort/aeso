import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 8: decimais (aulas 1 a 3). Décimos e centésimos, fração ↔ decimal,
// comparar e arredondar. Os números são guardados em centésimos (inteiros)
// e escritos com vírgula, como o aluno digita: 25 vira "0,25".

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

/** "0,50" e "0,5" são o mesmo número: tira os zeros do fim e a vírgula solta. */
const norm = (s: string) => (s.includes(',') ? s.replace(/0+$/, '').replace(/,$/, '') : s)
/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: string, pares: [string, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([norm(certa)])
  for (const [valor, erro] of pares) {
    if (vistos.has(norm(valor))) continue
    vistos.add(norm(valor))
    erros[valor] = erro
  }
  return erros
}

const dois = (n: number) => String(n).padStart(2, '0')
/** Centésimos com 2 casas: 307 → "3,07"; 50 → "0,50". */
const casas2 = (c: number) => `${Math.floor(c / 100)},${dois(c % 100)}`
/** Centésimos do jeito mais curto, com pelo menos uma casa: 50 → "0,5"; 400 → "4,0"; 25 → "0,25". */
const dec = (c: number) => (c % 10 === 0 ? `${Math.floor(c / 100)},${(c % 100) / 10}` : casas2(c))
/** O mesmo, em TeX: "0{,}25". */
const tex = (c: number) => dec(c).replace(',', '{,}')
const fr = (n: number, d: number) => `$\\frac{${n}}{${d}}$`
/** Centésimos como número de JavaScript, para a reta: 237 → 2.37. */
const valor = (c: number) => Number((c / 100).toFixed(2))
const mdc = (a: number, b: number): number => (b === 0 ? a : mdc(b, a % b))
/** "1 décimo", "3 décimos". */
const qt = (n: number, nome: string) => `${n} ${nome}${n === 1 ? '' : 's'}`

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })

// ---------------------------------------------------------------- aula 1: décimos e centésimos

export const decimosCentesimosN1: Gerador = {
  id: 'decimos-centesimos-n1',
  aula: 'B.U8.A1',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    const a = tipo === 1 ? 0 : r.int(1, 9)
    const b = tipo === 0 ? 0 : r.int(1, 9)
    const p = 10 * a + b
    const certa = dec(p)
    const pares: [string, string][] =
      tipo === 0 ? [[`0,0${a}`, 'troca-decimo-centesimo']] : tipo === 1 ? [[`0,${b}`, 'esquece-zero-decimal']] : [[`${a},${b}`, 'troca-decimo-centesimo']]
    return {
      enunciado: 'A grade inteira é 1. Que número está pintado? Escreva com vírgula.',
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares),
      dicas: [
        'Cada coluna cheia é 1 décimo. Cada quadradinho solto é 1 centésimo.',
        `Conte: ${a} ${a === 1 ? 'coluna cheia' : 'colunas cheias'} e ${b} ${b === 1 ? 'quadradinho solto' : 'quadradinhos soltos'}.`,
        `${qt(a, 'décimo')} e ${qt(b, 'centésimo')}: ${certa}.`,
      ],
      visual: grade({ pintadas: p, separar: true, semRotulo: true }, `Uma grade 10 × 10 com ${a} colunas âmbar e ${b} quadradinhos verdes, sem o número. Ao conferir, ${certa} aparece embaixo.`),
    }
  },
}

export const decimosCentesimosN2: Gerador = {
  id: 'decimos-centesimos-n2',
  aula: 'B.U8.A1',
  nivel: 2,
  gerar(r) {
    const reais = r.int(1, 20)
    const tipo = r.int(0, 3)
    // Metade das vezes, centavos de 1 a 9 (o zero dos décimos); depois, dezenas redondas; depois, o resto.
    const c = tipo <= 1 ? r.int(1, 9) : tipo === 2 ? 10 * r.int(1, 9) : 10 * r.int(1, 9) + r.int(1, 9)
    const certa = casas2(100 * reais + c)
    const pares: [string, string][] = c < 10 ? [[`${reais},${c}`, 'esquece-zero-decimal']] : c % 10 === 0 ? [[`${reais},0${c / 10}`, 'troca-decimo-centesimo']] : []
    return {
      enunciado: `Escreva em reais, com vírgula: **${reais} ${reais === 1 ? 'real' : 'reais'} e ${c} ${c === 1 ? 'centavo' : 'centavos'}**.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares),
      dicas: [
        'Depois da vírgula vêm 2 casas: décimos (moedas de 10 centavos) e centésimos (de 1 centavo).',
        `${qt(c, 'centavo')}: ${qt(Math.floor(c / 10), 'décimo')} e ${qt(c % 10, 'centésimo')}.`,
        `${qt(reais, 'inteiro')}, ${qt(Math.floor(c / 10), 'décimo')} e ${qt(c % 10, 'centésimo')}: R$ ${certa}.`,
      ],
    }
  },
}

const PRECOS = ['O litro da gasolina custa', 'A passagem de ônibus custa', 'O quilo da banana custa', 'Um pão de queijo custa', 'Um litro de leite custa']

export const decimosCentesimosN3: Gerador = {
  id: 'decimos-centesimos-n3',
  aula: 'B.U8.A1',
  nivel: 3,
  gerar(r) {
    // Três algarismos diferentes, para a pergunta não ter dois iguais. Décimo e centésimo de 2 a 9.
    const b = r.int(2, 9)
    const c = [2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== b)[r.int(0, 6)]
    const a = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== b && x !== c)[r.int(0, 6)]
    const decimo = r.int(0, 1) === 0
    const d = decimo ? b : c
    const opDecimo: Op = { texto: `${d} décimos de real: ${d}0 centavos`, certa: decimo, erro: decimo ? undefined : 'troca-decimo-centesimo' }
    const opCentesimo: Op = { texto: `${d} centésimos de real: ${d} centavos`, certa: !decimo, erro: decimo ? 'troca-decimo-centesimo' : undefined }
    return {
      enunciado: `${r.pick(PRECOS)} **R$ ${a},${b}${c}**. O que quer dizer o ${d}?`,
      formato: 'escolha',
      ...embaralhar(r, [opDecimo, opCentesimo, { texto: `${d} reais`, erro: decimo ? 'casa-errada' : undefined }, { texto: `${d}0 reais` }]),
      dicas: [
        'Depois da vírgula: a 1ª casa conta os décimos (10 centavos); a 2ª, os centésimos (1 centavo).',
        `O ${d} está na ${decimo ? '1ª' : '2ª'} casa depois da vírgula.`,
        decimo ? `${d} décimos: ${d} moedas de 10 centavos, ${d}0 centavos.` : `${d} centésimos: ${d} moedas de 1 centavo, ${d} centavos.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: fração ↔ decimal

export const fracaoDecimalN1: Gerador = {
  id: 'fracao-decimal-n1',
  aula: 'B.U8.A2',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const n = r.int(1, 9)
      const certa = `0,${n}`
      return {
        enunciado: `Escreva ${fr(n, 10)} como decimal.`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[`0,0${n}`, 'troca-decimo-centesimo'], [`${n},10`, 'fracao-vira-virgula']]),
        dicas: [
          '10 embaixo: a fração conta décimos, a 1ª casa depois da vírgula.',
          `${qt(n, 'décimo')}: ${n} das 10 partes da tira.`,
          `$\\frac{${n}}{10} = 0{,}${n}$.`,
        ],
        visual: grade({ pintadas: n, linhas: 1, escala: true, semRotulo: true }, `A tira de 10 décimos com ${n} pintados. Ao conferir, ${certa} aparece embaixo.`),
      }
    }
    // Centésimos que não são décimos redondos (de 1 a 99, sem 10, 20…).
    const n = [...Array(99).keys()].map((i) => i + 1).filter((x) => x % 10 !== 0)[r.int(0, 89)]
    const certa = casas2(n)
    return {
      enunciado: `Escreva ${fr(n, 100)} como decimal.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, n < 10 ? [[`0,${n}`, 'esquece-zero-decimal'], [`${n},100`, 'fracao-vira-virgula']] : [[`${n},100`, 'fracao-vira-virgula']]),
      dicas: [
        '100 embaixo: a fração conta centésimos, e precisa das 2 casas depois da vírgula.',
        n < 10 ? `${qt(n, 'centésimo')} e nenhum décimo: a casa dos décimos leva 0.` : `${n} centésimos são ${qt(Math.floor(n / 10), 'décimo')} e ${qt(n % 10, 'centésimo')}.`,
        `$\\frac{${n}}{100} = ${tex(n)}$.`,
      ],
      visual: grade({ pintadas: n, separar: true, semRotulo: true }, `A grade 10 × 10 com ${n} quadradinhos pintados. Ao conferir, ${certa} aparece embaixo.`),
    }
  },
}

/** Frações irredutíveis n/d que viram décimos ou centésimos exatos. */
const PARA_DECIMAL: [number, number][] = []
for (const d of [2, 4, 5, 20, 25, 50]) for (let n = 1; n < d; n++) if (mdc(n, d) === 1) PARA_DECIMAL.push([n, d])

export const fracaoDecimalN2: Gerador = {
  id: 'fracao-decimal-n2',
  aula: 'B.U8.A2',
  nivel: 2,
  gerar(r) {
    const [n, d] = r.pick(PARA_DECIMAL)
    const D = 10 % d === 0 ? 10 : 100
    const k = D / d
    const certa = dec(n * (100 / d))
    const pares: [string, string][] = [[`${n},${d}`, 'fracao-vira-virgula'], [`0,${n}${d}`, 'fracao-vira-virgula']]
    if (n === 1) pares.push([`0,${d}`, 'denominador-como-decimal'])
    return {
      enunciado: `Escreva ${fr(n, d)} como decimal.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares),
      dicas: [
        'Ache a fração equivalente com 10 ou 100 embaixo: multiplique os dois números pelo mesmo.',
        `$${d} \\times ${k} = ${D}$. Multiplique o ${n} também por ${k}.`,
        `$\\frac{${n}}{${d}} = \\frac{${n * k}}{${D}} = ${tex(n * (100 / d))}$.`,
      ],
    }
  },
}

const SIMPLES: [number, number][] = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5]]
type Medida = { ida: (f: string) => string; volta: (x: string) => string; u: string; de: string }
const MEDIDAS: Medida[] = [
  { ida: (f) => `A receita pede ${f} kg de farinha. Que número a balança mostra?`, volta: (x) => `A balança marca **${x} kg**. Que fração do quilo é isso?`, u: ' kg', de: 'do quilo' },
  { ida: (f) => `A garrafa tem ${f} L de suco. Como fica no rótulo, em decimal?`, volta: (x) => `O rótulo diz **${x} L**. Que fração do litro é isso?`, u: ' L', de: 'do litro' },
  { ida: (f) => `O tecido tem ${f} m. Como fica na fita métrica, em decimal?`, volta: (x) => `A fita marca **${x} m**. Que fração do metro é isso?`, u: ' m', de: 'do metro' },
]

export const fracaoDecimalN3: Gerador = {
  id: 'fracao-decimal-n3',
  aula: 'B.U8.A2',
  nivel: 3,
  gerar(r) {
    const m = r.pick(MEDIDAS)
    if (r.int(0, 1) === 0) {
      // Da fração para o decimal.
      const [n, d] = r.pick(SIMPLES)
      const c = n * (100 / d)
      return {
        enunciado: m.ida(fr(n, d)),
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: `${dec(c)}${m.u}`, certa: true },
          { texto: `${n},${d}${m.u}`, erro: 'fracao-vira-virgula' },
          { texto: `0,${n}${d}${m.u}`, erro: 'fracao-vira-virgula' },
          n === 1 ? { texto: `0,${d}${m.u}`, erro: 'denominador-como-decimal' } : { texto: `0,${n}${m.u}` },
        ]),
        dicas: [
          'Escreva a fração com 10 ou 100 embaixo. E pense: é mais ou menos que 1 inteiro?',
          `${fr(n, d)} é menos que 1. Com 100 embaixo: $\\frac{${c}}{100}$.`,
          `$\\frac{${n}}{${d}} = \\frac{${c}}{100} = ${tex(c)}$.`,
        ],
      }
    }
    // Do decimal para a fração.
    const a = r.int(2, 9)
    return {
      enunciado: m.volta(`0,${a}`),
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `${fr(a, 10)} ${m.de}`, certa: true },
        { texto: `${fr(a, 100)} ${m.de}`, erro: 'troca-decimo-centesimo' },
        { texto: `${fr(1, a)} ${m.de}`, erro: 'denominador-como-decimal' },
        { texto: `${fr(10, a)} ${m.de}` },
      ]),
      dicas: [
        'Leia o decimal: em que casa está o algarismo depois da vírgula?',
        `O ${a} está na 1ª casa depois da vírgula: são ${a} décimos.`,
        `$0{,}${a} = \\frac{${a}}{10}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: comparar e arredondar

export const compararDecimaisN1: Gerador = {
  id: 'comparar-decimais-n1',
  aula: 'B.U8.A3',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 3)
    // [centésimos, texto] dos dois números; o primeiro é o de 1 casa.
    let curto: [number, string]
    let longo: [number, string]
    if (tipo <= 1) {
      // O mais curto é o maior: 0,5 contra 0,25.
      const x = r.int(2, 9)
      const y = r.int(1, x - 1)
      const z = r.int(1, 9)
      curto = [10 * x, `0,${x}`]
      longo = [10 * y + z, `0,${y}${z}`]
    } else if (tipo === 2) {
      // Os mesmos décimos, e o mais comprido é o maior: 0,4 contra 0,45.
      const x = r.int(1, 8)
      const z = r.int(1, 9)
      curto = [10 * x, `0,${x}`]
      longo = [10 * x + z, `0,${x}${z}`]
    } else {
      // Iguais: 0,5 e 0,50.
      const x = r.int(1, 9)
      curto = [10 * x, `0,${x}`]
      longo = [10 * x, `0,${x}0`]
    }
    const [p, q] = r.int(0, 1) === 0 ? [curto, longo] : [longo, curto]
    const opcoes = [p[1], q[1], 'São iguais']
    const certa = p[0] === q[0] ? 2 : p[0] > q[0] ? 0 : 1
    const iLongo = p === longo ? 0 : 1
    const erros: Record<string, string> = tipo === 2 ? { [String(1 - iLongo)]: 'decimal-mais-curto-maior' } : { [String(iLongo)]: 'decimal-mais-casas-maior' }
    return {
      enunciado: `Qual é maior: **${p[1]}** ou **${q[1]}**?`,
      formato: 'escolha',
      opcoes,
      resposta: certa,
      erros,
      dicas: [
        'Compare casa por casa: primeiro os décimos (as colunas cheias).',
        `Complete com zero para ficarem do mesmo tamanho: ${casas2(p[0])} e ${casas2(q[0])}.`,
        certa === 2 ? `${casas2(p[0])} e ${casas2(q[0])}: o mesmo pintado.` : `${casas2(p[0])} contra ${casas2(q[0])}: o maior é ${opcoes[certa]}.`,
      ],
      visual: grade({ grades: [{ pintadas: p[0], rotulo: p[1] }, { pintadas: q[0], rotulo: q[1] }], separar: true }, `Duas grades lado a lado, com ${p[1]} e ${q[1]} pintados. Ao conferir, a maior acende.`),
    }
  },
}

/** Arredonda centésimos ao décimo, com o empate para cima: 237 → 24 décimos. */
const aoDecimo = (h: number) => Math.floor((h + 5) / 10)

export const arredondarDecimaisN2: Gerador = {
  id: 'arredondar-decimais-n2',
  aula: 'B.U8.A3',
  nivel: 2,
  gerar(r) {
    const I = r.int(0, 9)
    const tipo = r.int(0, 3)
    // Antes do meio, depois do meio, no meio, e o 9 que vira o inteiro seguinte.
    const t = tipo === 3 ? 9 : r.int(0, 9)
    const c = tipo === 0 ? r.int(1, 4) : tipo === 1 ? r.int(6, 9) : tipo === 2 ? 5 : r.int(5, 9)
    const h = 100 * I + 10 * t + c
    const T = aoDecimo(h)
    const certa = dec(10 * T)
    const baixo = 10 * I + t
    const pares: [string, string][] = c < 5 ? [[dec(10 * (baixo + 1)), 'arredonda-sempre-para-cima']] : [[dec(10 * baixo), c === 5 ? 'empate-para-baixo' : 'arredondar-corta-casas']]
    return {
      enunciado: `Arredonde **${casas2(h)}** ao décimo mais perto.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares),
      dicas: [
        'Ache os dois décimos vizinhos e o meio entre eles. Quem decide é o centésimo.',
        `${casas2(h)} fica entre ${dec(10 * baixo)} e ${dec(10 * (baixo + 1))}. O meio é ${casas2(10 * baixo + 5)}.`,
        c < 5 ? `O centésimo é ${c}, antes do meio: fica. ${casas2(h)} ≈ ${certa}.` : c === 5 ? `Bem no meio: fica o maior. ${casas2(h)} ≈ ${certa}.` : `O centésimo é ${c}, depois do meio: sobe. ${casas2(h)} ≈ ${certa}.`,
      ],
      visual: reta(
        { de: valor(10 * baixo), ate: valor(10 * baixo + 10), passo: 0.01, marcas: [valor(10 * baixo), valor(h), valor(10 * baixo + 10)], meio: valor(10 * baixo + 5) },
        `A reta entre os dois décimos vizinhos, com um traço por centésimo, o meio tracejado e o ponto ${casas2(h)}. Ao conferir, um arco vai até ${certa}.`,
      ),
    }
  },
}

type Coisa = { frase: (xs: string[], maior: boolean) => string; u: string }
const COISAS: Coisa[] = [
  { frase: (xs, maior) => `Três tábuas: **${xs[0]}**, **${xs[1]}** e **${xs[2]}**. Qual é a mais ${maior ? 'comprida' : 'curta'}?`, u: ' m' },
  { frase: (xs, maior) => `Três pacotes de café: **${xs[0]}**, **${xs[1]}** e **${xs[2]}**. Qual é o mais ${maior ? 'pesado' : 'leve'}?`, u: ' kg' },
  { frase: (xs, maior) => `Três garrafas: **${xs[0]}**, **${xs[1]}** e **${xs[2]}**. Qual tem ${maior ? 'mais' : 'menos'} água?`, u: ' L' },
]
type Leitura = { frase: (x: string) => string; inteiro: boolean }
const LEITURAS: Leitura[] = [
  { frase: (x) => `A balança marca **${x} kg**. Arredonde ao décimo de quilo mais perto.`, inteiro: false },
  { frase: (x) => `O carro fez **${x} km** por litro. Arredonde ao décimo mais perto.`, inteiro: false },
  { frase: (x) => `A corrida deu **${x} km**. Arredonde ao quilômetro inteiro mais perto.`, inteiro: true },
  { frase: (x) => `A sala tem **${x} m** de largura. Arredonde ao metro inteiro mais perto.`, inteiro: true },
]

export const compararArredondarN3: Gerador = {
  id: 'comparar-arredondar-n3',
  aula: 'B.U8.A3',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Comparar três: um de 1 casa (o de décimos maior) e dois de 2 casas.
      const I = r.int(1, 5)
      const x = r.int(4, 9)
      const y1 = r.int(1, x - 1)
      const y2 = y1 === x - 1 ? y1 - 1 : y1 + 1
      const nums: [number, string][] = [
        [100 * I + 10 * x, `${I},${x}`],
        [100 * I + 10 * y1 + r.int(1, 9), ''],
        [100 * I + 10 * y2 + r.int(1, 9), ''],
      ]
      nums[1][1] = casas2(nums[1][0])
      nums[2][1] = casas2(nums[2][0])
      const maior = r.int(0, 1) === 0
      const coisa = r.pick(COISAS)
      const certo = maior ? nums[0] : nums[1][0] < nums[2][0] ? nums[1] : nums[2]
      // Quem lê o que vem depois da vírgula como inteiro (5 < 35 < 42) escolheria:
      const lidoInteiro = (n: [number, string]) => Number(n[1].split(',')[1])
      const isca = [...nums].sort((a, b) => (maior ? lidoInteiro(b) - lidoInteiro(a) : lidoInteiro(a) - lidoInteiro(b)))[0]
      const ordem = [...nums]
      const textos = ordem.map((n) => `${n[1]}${coisa.u}`)
      return {
        enunciado: coisa.frase(textos, maior),
        formato: 'escolha',
        ...embaralhar(r, ordem.map((n) => ({ texto: `${n[1]}${coisa.u}`, certa: n === certo, erro: n === isca && n !== certo ? 'decimal-mais-casas-maior' : undefined }))),
        dicas: [
          'Compare casa por casa: os inteiros empatam, então olhe os décimos.',
          `Complete com zero: ${ordem.map((n) => casas2(n[0])).join(', ')}.`,
          `O${maior ? ' maior' : ' menor'} é ${certo[1]}${coisa.u}.`,
        ],
      }
    }
    // Arredondar uma medida, ao décimo ou ao inteiro.
    const leitura = r.pick(LEITURAS)
    const I = r.int(1, 30)
    const t = r.int(1, 9)
    const c = r.int(1, 9)
    const h = 100 * I + 10 * t + c
    if (!leitura.inteiro) {
      const baixo = 10 * I + t
      const certa = dec(10 * aoDecimo(h))
      return {
        enunciado: leitura.frase(casas2(h)),
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, c < 5 ? [[dec(10 * (baixo + 1)), 'arredonda-sempre-para-cima']] : [[dec(10 * baixo), c === 5 ? 'empate-para-baixo' : 'arredondar-corta-casas']]),
        dicas: [
          'Ao décimo, quem decide é o centésimo: de 0 a 4 fica, de 5 a 9 sobe.',
          `${casas2(h)} fica entre ${dec(10 * baixo)} e ${dec(10 * (baixo + 1))}. O centésimo é ${c}.`,
          `${casas2(h)} ≈ ${certa}.`,
        ],
      }
    }
    const certa = t >= 5 ? I + 1 : I
    const pares: [number, string][] = t >= 5 ? [[I, 'arredondar-corta-casas']] : [[I + 1, c >= 5 ? 'olha-casa-errada' : 'arredonda-sempre-para-cima']]
    return {
      enunciado: leitura.frase(casas2(h)),
      formato: 'numero',
      resposta: certa,
      erros: Object.fromEntries(pares.filter(([v]) => v !== certa).map(([v, e]) => [String(v), e])),
      dicas: [
        'Ao inteiro, quem decide é o décimo, a 1ª casa depois da vírgula.',
        `${casas2(h)} fica entre ${I} e ${I + 1}. O décimo é ${t}.`,
        `${t >= 5 ? `${t} décimos passam do meio: sobe.` : `${t} décimos não chegam ao meio: fica.`} ${casas2(h)} ≈ ${certa}.`,
      ],
    }
  },
}

export const GERADORES_U8A: Gerador[] = [
  decimosCentesimosN1,
  decimosCentesimosN2,
  decimosCentesimosN3,
  fracaoDecimalN1,
  fracaoDecimalN2,
  fracaoDecimalN3,
  compararDecimaisN1,
  arredondarDecimaisN2,
  compararArredondarN3,
]
