import type { Gerador, Item, Resposta, Rng, Visual } from '@/lib/formation/schema'

// Unidade 8: decimais (aulas 4 a 6). Somar e subtrair com vírgula embaixo
// de vírgula, multiplicar contando as casas, dividir continuando depois da
// vírgula, e as dízimas.
//
// Toda conta é feita em inteiros: um decimal é guardado como a quantidade
// de décimos, centésimos ou milésimos (3,75 é 375 centésimos), e só vira
// texto com vírgula no fim. Respostas decimais vão como texto com vírgula
// ('6,25'), que abre o teclado com vírgula; respostas inteiras, como número.
// Cada gerador escolhe direto a partir do rng, sem laços de tentativa.

/** n em unidades de 10^-casas, com vírgula e sem zeros no fim: (735, 2) → '7,35'; (750, 2) → '7,5'; (700, 2) → '7'. */
export function dec(n: number, casas: number): string {
  const s = String(n).padStart(casas + 1, '0')
  const inteira = s.slice(0, s.length - casas)
  const resto = s.slice(s.length - casas).replace(/0+$/, '')
  return resto ? `${inteira},${resto}` : inteira
}
/** Dinheiro: sempre com os centavos (R$ 3,50), ou sem nada quando é inteiro (R$ 10). */
const reais = (centavos: number) => (centavos % 100 === 0 ? `R$ ${centavos / 100}` : `R$ ${Math.floor(centavos / 100)},${String(centavos % 100).padStart(2, '0')}`)
/** O número com os centavos escritos (3,50), para a conta armada. */
const comCentavos = (centavos: number) => `${Math.floor(centavos / 100)},${String(centavos % 100).padStart(2, '0')}`
/** Milhar com ponto: 14760 → 14.760. */
const mil = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** A resposta como o aluno digita: inteiro vira número; decimal, texto com vírgula. */
function resposta(n: number, casas: number): Resposta {
  const t = dec(n, casas)
  return t.includes(',') ? t : Number(t)
}

/** Erros previsíveis, sem marcar a certa e sem repetir. */
function mapa(certa: Resposta, pares: [string, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  // 0,50 = 0,5: zeros no fim de um decimal não contam.
  const igual = (t: string) => (t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t)
  for (const [valor, erro] of pares) {
    if (igual(valor) !== igual(String(certa)) && !(valor in erros)) erros[valor] = erro
  }
  return erros
}

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

const conta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { conta: estado }, esboco })

/** O erro de quem tira o menor do maior em cada coluna, com os dois números em centésimos. */
function menorDoMaior(a: number, b: number): number {
  const k = Math.max(String(a).length, String(b).length)
  const da = String(a).padStart(k, '0')
  const db = String(b).padStart(k, '0')
  return Number([...da].map((d, i) => Math.abs(Number(d) - Number(db[i]))).join(''))
}

// ---------------------------------------------------------------- aula 4: somar e subtrair

/** Uma soma de um número com 1 casa (em décimos) e outro com 2 (em centésimos). */
type Soma = { a: number; b: number }

/** Os erros de quem alinha pela direita e de quem soma o depois da vírgula como inteiro. */
function errosDaSoma(dec1: number, cent2: number): [string, string][] {
  const ia = Math.floor(dec1 / 10)
  const ta = dec1 % 10
  const ib = Math.floor(cent2 / 100)
  const db = cent2 % 100
  return [
    [dec(dec1 + cent2, 2), 'alinha-decimais-pela-direita'],
    [dec((ia + ib) * 100 + ta + db, 2), 'parte-decimal-como-inteiro'],
  ]
}

function itemSoma({ a, b }: Soma, ordem: 0 | 1, enunciado: (x: string, y: string) => string, visual: boolean): Item {
  const x = dec(a, 1)
  const y = dec(b, 2)
  const total = a * 10 + b
  const certa = resposta(total, 2)
  const [p, q] = ordem === 0 ? [x, y] : [y, x]
  return {
    enunciado: enunciado(p, q),
    formato: 'numero',
    resposta: certa,
    erros: mapa(certa, errosDaSoma(a, b)),
    dicas: [
      'Vírgula embaixo de vírgula: décimos com décimos, centésimos com centésimos.',
      `Complete com zero: ${x} é ${comCentavos(a * 10)}. Some ${comCentavos(a * 10)} + ${comCentavos(b)}.`,
      `${comCentavos(a * 10)} + ${comCentavos(b)} = ${comCentavos(total)}.`,
    ],
    ...(visual
      ? { visual: conta({ parcelas: ordem === 0 ? [x, y] : [y, x], sinal: '+', zeros: true }, 'A conta armada com as vírgulas em coluna e o zero apagado que completa o número de 1 casa. Ao conferir, o resultado se escreve da direita para a esquerda.') }
      : {}),
  }
}

export const somarDecimaisN1: Gerador = {
  id: 'somar-decimais-n1',
  aula: 'B.U8.A4',
  nivel: 1,
  gerar(r) {
    // Sem vai um: os décimos somam até 9; o de 2 casas tem centésimos.
    const ta = r.int(1, 8)
    const a = r.int(0, 5) * 10 + ta
    const b = r.int(0, 4) * 100 + r.int(0, 9 - ta) * 10 + r.int(1, 9)
    return itemSoma({ a, b }, r.int(0, 1) as 0 | 1, (x, y) => `Quanto é ${x} + ${y}?`, true)
  },
}

/** Uma soma com vai um nos décimos: o de 1 casa tem décimos que, somados, passam de 9. */
function somaComVaiUm(r: Rng): Soma {
  const ta = r.int(2, 9)
  const a = r.int(1, 9) * 10 + ta
  const b = r.int(1, 9) * 100 + r.int(10 - ta, 9) * 10 + r.int(1, 9)
  return { a, b }
}

export const somarDecimaisN2: Gerador = {
  id: 'somar-decimais-n2',
  aula: 'B.U8.A4',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) return itemSoma(somaComVaiUm(r), r.int(0, 1) as 0 | 1, (x, y) => `Quanto é ${x} + ${y}? Atenção ao vai um nos décimos.`, true)
    // Subtração: em cima 1 casa, embaixo 2; os centésimos de cima são 0 e pedem empresta.
    const ia = r.int(2, 9)
    const a = ia * 10 + r.int(1, 9)
    const b = r.int(1, ia - 1) * 100 + r.int(0, 9) * 10 + r.int(1, 9)
    const x = dec(a, 1)
    const y = dec(b, 2)
    const certa = resposta(a * 10 - b, 2)
    const copia = (a - Math.floor(b / 10)) * 10 + (b % 10)
    return {
      enunciado: `Quanto é ${x} − ${y}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dec(copia, 2), 'copia-casas-que-faltam'],
        [dec(menorDoMaior(a * 10, b), 2), 'subtrai-menor-do-maior'],
      ]),
      dicas: [
        'Vírgula embaixo de vírgula, e complete com zero as casas vazias.',
        `${x} é ${comCentavos(a * 10)}. Nos centésimos, 0 − ${b % 10}: abra 1 décimo.`,
        `${comCentavos(a * 10)} − ${comCentavos(b)} = ${comCentavos(a * 10 - b)}.`,
      ],
      visual: conta({ parcelas: [x, y], sinal: '−' }, 'A subtração armada pela vírgula, sem os zeros: o aluno tem de ver a casa vazia em cima. Ao conferir, o zero apagado aparece e as trocas se escrevem.'),
    }
  },
}

const TROCOS: ((nota: number, preco: string) => string)[] = [
  (nota, preco) => `Você paga uma conta de ${preco} com uma nota de R$ ${nota}. Qual é o troco, em reais?`,
  (nota, preco) => `O cartão do ônibus tinha R$ ${nota}. A viagem custou ${preco}. Quantos reais sobraram?`,
  (nota, preco) => `Uma compra de ${preco}. Você dá R$ ${nota}. Quantos reais voltam de troco?`,
]
const JUNTAR: ((x: string, y: string) => string)[] = [
  (x, y) => `Você comprou ${x} kg de carne e ${y} kg de frango. Quantos quilos ao todo?`,
  (x, y) => `Um tanque tinha ${x} L de água e recebeu mais ${y} L. Quantos litros tem agora?`,
  (x, y) => `Uma tábua de ${x} m foi emendada a outra de ${y} m. Qual o comprimento total, em metros?`,
]

export const somarDecimaisN3: Gerador = {
  id: 'somar-decimais-n3',
  aula: 'B.U8.A4',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const item = itemSoma(somaComVaiUm(r), r.int(0, 1) as 0 | 1, r.pick(JUNTAR), false)
      return item
    }
    const nota = r.pick([10, 20, 50, 100])
    const preco = r.int(1, nota - 1) * 100 + r.int(1, 99)
    const inteiros = Math.floor(preco / 100)
    const centavos = preco % 100
    const certa = resposta(nota * 100 - preco, 2)
    return {
      enunciado: r.pick(TROCOS)(nota, reais(preco)),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dec((nota - inteiros) * 100 + centavos, 2), 'copia-casas-que-faltam'],
        [dec((nota - inteiros) * 100 + (100 - centavos), 2), 'esquece-que-desagrupou'],
      ]),
      dicas: [
        `A nota de R$ ${nota} é ${nota},00: em cima há 0 centavos.`,
        `Arme ${nota},00 − ${comCentavos(preco)}, vírgula embaixo de vírgula. Os centavos pedem empresta.`,
        `${nota},00 − ${comCentavos(preco)} = ${comCentavos(nota * 100 - preco)}. Confira: ${comCentavos(preco)} + ${comCentavos(nota * 100 - preco)} = ${nota}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: multiplicar

export const multiplicarDecimaisN1: Gerador = {
  id: 'multiplicar-decimais-n1',
  aula: 'B.U8.A5',
  nivel: 1,
  gerar(r) {
    const a = r.int(1, 9)
    const b = r.int(1, 9)
    const certa = resposta(a * b, 2)
    return {
      enunciado: `Quanto é 0,${a} × 0,${b}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dec(a * b, 1), 'casas-do-produto-como-na-soma'],
        [dec(a + b, 1), 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        'Um décimo de um décimo é um centésimo: um quadradinho da grade.',
        `Sem vírgula, ${a} × ${b} = ${a * b}. Quantas casas os dois fatores têm juntos?`,
        `1 + 1 = 2 casas: 0,${a} × 0,${b} = ${dec(a * b, 2)}.`,
      ],
      visual: {
        modelo: 'grade',
        estado: { faixas: [a, b], semRotulo: true },
        esboco: `A grade com ${a} linhas e ${b} colunas claras; o cruzamento, em âmbar, tem ${a * b} quadradinhos. Ao conferir, eles se contam e o número aparece embaixo.`,
      },
    }
  },
}

const VEZES: ((n: number, x: string) => string)[] = [
  (n, x) => `Quanto pesam ${n} pacotes de ${x} kg?`,
  (n, x) => `${n} garrafas de ${x} L: quantos litros ao todo?`,
  (n, x) => `Você corta ${n} pedaços de ${x} m de fio. Quantos metros usa?`,
]

export const multiplicarDecimaisN2: Gerador = {
  id: 'multiplicar-decimais-n2',
  aula: 'B.U8.A5',
  nivel: 2,
  gerar(r) {
    const n = r.int(2, 6)
    // A parte decimal vezes n passa de uma casa: o vai um entra na parte inteira.
    const casas = r.int(1, 2)
    const i = r.int(1, 9)
    const base = casas === 1 ? 10 : 100
    const minimo = Math.ceil(base / n)
    let d = r.int(minimo, base - 1)
    if (casas === 2 && d % 10 === 0) d += 1
    const x = i * base + d
    const certa = resposta(n * x, casas)
    return {
      enunciado: r.pick(VEZES)(n, dec(x, casas)),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[`${n * i},${n * d}`, 'multiplica-partes-separadas']]),
      dicas: [
        'Multiplique sem a vírgula e ponha de volta as casas do fator decimal.',
        `Sem vírgula: ${n} × ${x} = ${mil(n * x)}. O ${dec(x, casas)} tem ${casas} ${casas === 1 ? 'casa' : 'casas'}.`,
        `${n} × ${dec(x, casas)} = ${dec(n * x, casas)}.`,
      ],
    }
  },
}

/** O preço por unidade, numa faixa de reais que faz sentido para cada coisa. */
const PRECO_POR: { de: number; ate: number; texto: (preco: string, q: string) => string }[] = [
  { de: 30, ate: 90, texto: (preco, q) => `O quilo do queijo custa ${preco}. Quantos reais custam ${q} kg?` },
  { de: 25, ate: 60, texto: (preco, q) => `O quilo da carne custa ${preco}. Quantos reais custam ${q} kg?` },
  { de: 5, ate: 40, texto: (preco, q) => `O metro do tecido custa ${preco}. Quantos reais custam ${q} m?` },
]

export const multiplicarDecimaisN3: Gerador = {
  id: 'multiplicar-decimais-n3',
  aula: 'B.U8.A5',
  nivel: 3,
  gerar(r) {
    // Preço com 2 casas (terminado em 5 centavos) e quantidade com 1 casa, par:
    // o produto tem 3 casas e a última é 0, então dá centavos exatos.
    const { de, ate, texto } = r.pick(PRECO_POR)
    let preco = 10 * r.int(de * 10, ate * 10 - 1) + 5
    let q = 2 * r.int(1, 19)
    if (q % 10 === 0) q += 2
    // Sem resultado inteiro (R$ 1,00): com 10 centavos a mais, nunca é.
    if ((preco * q) % 1000 === 0) preco += 10
    const produto = preco * q
    const certa = resposta(produto / 10, 2)
    return {
      enunciado: texto(reais(preco), dec(q, 1)),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[dec(produto, 2), 'casas-do-produto-como-na-soma']]),
      dicas: [
        'Multiplique sem a vírgula e conte as casas dos dois fatores.',
        `${mil(preco)} × ${q} = ${mil(produto)}. Casas: 2 + 1 = 3.`,
        `${dec(produto, 3)}: são ${reais(produto / 10)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: dividir

/** Quociente e resto inteiros. */
const divInt = (a: number, b: number) => [Math.floor(a / b), a % b] as const

const RATEIO: ((total: number, n: number) => string)[] = [
  (total, n) => `${n} pessoas dividem R$ ${total} igualmente. Quantos reais cada uma paga?`,
  (total, n) => `Uma conta de R$ ${total} para ${n} pessoas, em partes iguais. Quanto cada uma paga, em reais?`,
  (total, n) => `R$ ${total} de prêmio para ${n} pessoas, em partes iguais. Quantos reais para cada uma?`,
]

export const dividirDecimaisN1: Gerador = {
  id: 'dividir-decimais-n1',
  aula: 'B.U8.A6',
  nivel: 1,
  gerar(r) {
    const b = r.pick([2, 4, 5])
    let a = r.int(b + 1, 40)
    if (a % b === 0) a += 1
    const [q, resto] = divInt(a, b)
    const certa = resposta((a * 100) / b, 2)
    return {
      enunciado: r.pick(RATEIO)(a, b),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[`${q},${resto}`, 'resto-vira-decimal']]),
      dicas: [
        'Se sobrar resto, ponha a vírgula no quociente e continue com um 0.',
        `${a} ÷ ${b} = ${q}, e sobram ${resto}. Os ${resto} reais viram ${resto * 10} décimos.`,
        `${a} ÷ ${b} = ${dec((a * 100) / b, 2)}. Confira: ${b} × ${dec((a * 100) / b, 2)} = ${a}.`,
      ],
      visual: {
        modelo: 'quadro-posicional',
        estado: { divisao: { dividendo: a, divisor: b } },
        esboco: `A chave de ${a} ÷ ${b}, vazia. Proposta: ao conferir, a vírgula entra no quociente e um 0 desce depois do ${a}.`,
      },
    }
  },
}

const mdc = (x: number, y: number): number => (y === 0 ? x : mdc(y, x % y))

/** Os primeiros algarismos depois da vírgula, pela divisão longa. */
function casasDepois(a: number, b: number, n: number): string {
  let resto = a % b
  let s = ''
  for (let k = 0; k < n; k++) {
    resto *= 10
    s += String(Math.floor(resto / b))
    resto %= b
  }
  return s
}

/**
 * a ÷ b com b em 3, 6 ou 7 e uma dízima: depois de simplificar, o denominador
 * não é só 2 e 5. Fora os casos em que o resto é o primeiro algarismo depois
 * da vírgula (7 ÷ 6 = 1,1666…, resto 1): aí "1,1" seria também o começo certo.
 */
const DIZIMAS = [3, 6, 7]
  .flatMap((b) => Array.from({ length: 30 }, (_, i) => ({ a: i + 1, b })))
  .filter(({ a, b }) => b / mdc(a, b) > 2 && String(a % b) !== casasDepois(a, b, 1))

export const dividirDecimaisN2: Gerador = {
  id: 'dividir-decimais-n2',
  aula: 'B.U8.A6',
  nivel: 2,
  gerar(r) {
    const { a, b } = r.pick(DIZIMAS)
    const [q, resto] = divInt(a, b)
    const quatro = casasDepois(a, b, 4)
    return {
      enunciado: `Continue a conta depois da vírgula: quanto é ${a} ÷ ${b}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `${q},${quatro}…, e não termina`, certa: true },
        { texto: `${q},${resto}`, erro: 'resto-vira-decimal' },
        { texto: `${q},${quatro.slice(0, 2)}, exato`, erro: 'dizima-como-exata' },
      ]),
      dicas: [
        'Continue com um 0 depois da vírgula e olhe o resto a cada passo.',
        `${a} ÷ ${b} = ${q}, resto ${resto}. Esse resto volta a aparecer?`,
        `O resto se repete: ${a} ÷ ${b} = ${q},${quatro}…, sem fim. É uma dízima periódica.`,
      ],
      visual: {
        modelo: 'quadro-posicional',
        estado: { divisao: { dividendo: a, divisor: b } },
        esboco: `A chave de ${a} ÷ ${b}. Proposta: ao conferir, a conta continua depois da vírgula e os restos repetidos acendem em âmbar.`,
      },
    }
  },
}

/** Quantas vezes um decimal menor que 1 cabe num inteiro: d em unidades de 10^-casas. */
const DIVISORES = [
  { d: 5, casas: 1 },
  { d: 2, casas: 1 },
  { d: 4, casas: 1 },
  { d: 25, casas: 2 },
  { d: 75, casas: 2 },
]
const CABE = DIVISORES.flatMap(({ d, casas }) =>
  Array.from({ length: 12 }, (_, i) => i + 1)
    .filter((a) => (a * 10 ** casas) % d === 0)
    .map((a) => ({ a, d, casas, k: (a * 10 ** casas) / d })),
).filter(({ k }) => k >= 2 && k <= 48)

const CABEM: ((a: number, d: string, centavos: number) => string)[] = [
  (a, d) => `Quantos copos de ${d} L você enche com ${a} L de suco?`,
  (a, _, centavos) => `Cada pão de queijo custa ${reais(centavos)}. Quantos você compra com R$ ${a}?`,
  (a, d) => `Quantos potes de ${d} kg você enche com ${a} kg de doce?`,
]
const RATEIO_KG: ((total: number, n: number) => string)[] = [
  (total, n) => `${total} kg de ração divididos em ${n} potes iguais. Quantos quilos em cada pote?`,
  (total, n) => `${total} L de suco em ${n} jarras iguais. Quantos litros em cada jarra?`,
]

export const dividirDecimaisN3: Gerador = {
  id: 'dividir-decimais-n3',
  aula: 'B.U8.A6',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const { a, d, casas, k } = r.pick(CABE)
      const centavos = d * 10 ** (2 - casas)
      const x = dec(d, casas)
      return {
        enunciado: r.pick(CABEM)(a, x, centavos),
        formato: 'numero',
        resposta: k,
        erros: mapa(k, [[dec(a * d, casas), 'dividir-sempre-diminui']]),
        dicas: [
          `A pergunta é quantas vezes ${x} cabe em ${a}. Como ${x} é menos que 1, cabe mais de ${a} vezes.`,
          `Multiplique os dois por ${10 ** casas}: ${a} ÷ ${x} é o mesmo que ${a * 10 ** casas} ÷ ${d}.`,
          `${a * 10 ** casas} ÷ ${d} = ${k}.`,
        ],
      }
    }
    const n = r.pick([4, 5, 8])
    let total = r.int(n + 1, 99)
    if (total % n === 0) total += 1
    const [q, resto] = divInt(total, n)
    const certa = resposta((total * 1000) / n, 3)
    return {
      enunciado: n === 8 ? r.pick(RATEIO_KG)(total, n) : r.pick(RATEIO)(total, n),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[`${q},${resto}`, 'resto-vira-decimal']]),
      dicas: [
        'Se sobrar resto, ponha a vírgula e continue com um 0.',
        `${total} ÷ ${n} = ${q}, resto ${resto}. O resto vira ${resto * 10} décimos.`,
        `${total} ÷ ${n} = ${dec((total * 1000) / n, 3)}.`,
      ],
    }
  },
}

export const GERADORES_U8B: Gerador[] = [
  somarDecimaisN1,
  somarDecimaisN2,
  somarDecimaisN3,
  multiplicarDecimaisN1,
  multiplicarDecimaisN2,
  multiplicarDecimaisN3,
  dividirDecimaisN1,
  dividirDecimaisN2,
  dividirDecimaisN3,
]
