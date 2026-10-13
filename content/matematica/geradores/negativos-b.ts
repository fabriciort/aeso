import type { Gerador, Item, Resposta, Visual } from '@/lib/formation/schema'

// Unidade 12: números negativos (aulas 4 e 5). Multiplicar e dividir com
// sinais e os números racionais.
//
// Toda conta é feita em inteiros: decimais e dinheiro em centésimos ou
// milésimos. Um número só vira texto no fim, com a vírgula e o sinal de
// menos verdadeiro (−). Respostas inteiras vão como número (-6); decimais,
// como texto com vírgula ('−0,75'). Todo item numérico tem `sinal: true`:
// a tecla do menos aparece sempre, e o teclado não entrega o sinal.
// Quando os números precisam combinar (a divisão tem de dar exata), as
// combinações boas são listadas uma vez, ao carregar o arquivo.

/** n em unidades de 10^-casas, com o menos verdadeiro, vírgula e sem zeros no fim: (−125, 2) → '−1,25'; (−600, 2) → '−6'. */
function dec(n: number, casas = 0): string {
  const m = Math.abs(n)
  const s = String(m).padStart(casas + 1, '0')
  const inteira = s.slice(0, s.length - casas)
  const resto = s.slice(s.length - casas).replace(/0+$/, '')
  const t = resto ? `${inteira},${resto}` : inteira
  return n < 0 ? `−${t}` : t
}
/** Dinheiro em centavos, com duas casas quando há centavos: −1250 → '12,50' (sem sinal). */
const reais = (c: number) => {
  const m = Math.abs(c)
  return m % 100 ? `${Math.floor(m / 100)},${String(m % 100).padStart(2, '0')}` : String(m / 100)
}
/** Dinheiro em centavos, com sinal, em TeX: −1250 → '-12{,}50'. */
const texR = (c: number) => `${c < 0 ? '-' : ''}${reais(c).replace(',', '{,}')}`
/** O mesmo número em TeX: (−125, 2) → '-1{,}25'. */
const tex = (n: number, casas = 0) => dec(n, casas).replace('−', '-').replace(',', '{,}')
/** Um negativo depois de um sinal vai entre parênteses: −2 → '(−2)'; 3 → '3'. */
const par = (n: number) => (n < 0 ? `(${dec(n)})` : dec(n))
const parTex = (n: number) => (n < 0 ? `(${tex(n)})` : tex(n))
/** A resposta como o aluno digita: inteiro vira número; decimal, texto com vírgula e o menos verdadeiro. */
function resposta(n: number, casas = 0): Resposta {
  const t = dec(n, casas)
  return t.includes(',') ? t : n / 10 ** casas
}

/** Erros previsíveis (valores na mesma escala da certa), sem a certa e sem repetir. */
function mapa(certa: number, casas: number, pares: [number | undefined, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor === undefined || valor === certa) continue
    const k = dec(valor, casas)
    if (!(k in erros)) erros[k] = erro
  }
  return erros
}

const saldo = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { saldo: estado }, esboco })

// ---------------------------------------------------------------- aula 4: multiplicar e dividir

/** Positivo vezes negativo com produto até 12 (as fichas cabem numa linha): [vezes, dívida]. */
const COMBOS_N1: [number, number][] = []
for (let a = 2; a <= 6; a++) for (let b = 2; b <= 6; b++) if (a * b <= 12) COMBOS_N1.push([a, b])

export const multiplicarNegativosN1: Gerador = {
  id: 'multiplicar-negativos-n1',
  aula: 'B.U12.A4',
  nivel: 1,
  gerar(r) {
    // a × (−b) ou (−b) × a: as mesmas a dívidas de b.
    const [a, b] = r.pick(COMBOS_N1)
    const primeiroNegativo = r.int(0, 1) === 1
    const conta = primeiroNegativo ? `${par(-b)} × ${a}` : `${a} × ${par(-b)}`
    const contaTex = primeiroNegativo ? `${parTex(-b)} \\times ${a}` : `${a} \\times ${parTex(-b)}`
    const certa = -a * b
    return {
      enunciado: `Quanto é **${conta}**?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, 0, [
        [a * b, 'sinais-diferentes-da-positivo'],
        [a - b, 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        `É somar ${a} vezes uma dívida de ${b}. Dívida mais dívida: você deve mais.`,
        `$${Array.from({ length: a }, () => `(${tex(-b)})`).join(' + ')}$.`,
        `$${contaTex} = ${tex(certa)}$. Sinais diferentes, o produto é negativo.`,
      ],
      visual: saldo(
        { negativas: a * b, rotulo: `${a} vezes ${dec(-b)}` },
        `${a * b} fichas azuis de −, as ${a} dívidas de ${b}. Embaixo, "${a} vezes ${dec(-b)}".`,
      ),
    }
  },
}

/** Os três casos de sinal da divisão: [sinal do dividendo, sinal do divisor]. */
const CASOS_DIVISAO: [number, number][] = [[-1, 1], [1, -1], [-1, -1]]

export const multiplicarNegativosN2: Gerador = {
  id: 'multiplicar-negativos-n2',
  aula: 'B.U12.A4',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // (−a) × (−b): sinais iguais.
      const a = r.int(2, 9)
      const b = r.int(2, 9)
      const certa = a * b
      return {
        enunciado: `Quanto é **${par(-a)} × ${par(-b)}**?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, 0, [
          [-certa, 'sinais-iguais-da-negativo'],
          [-(a + b), 'soma-no-lugar-de-multiplicar'],
        ]),
        dicas: [
          'Lembre do padrão: a cada passo para a esquerda, o produto sobe. Sinais iguais dão positivo.',
          `Sem os sinais: $${a} \\times ${b} = ${certa}$. Agora, o sinal.`,
          `$${parTex(-a)} \\times ${parTex(-b)} = ${certa}$: sinais iguais, produto positivo.`,
        ],
      }
    }
    // Divisão exata com sinais: dividendo = divisor × quociente.
    const [sp, sd] = r.pick(CASOS_DIVISAO)
    const divisor = r.int(2, 9) * sd
    const q = r.int(2, 9)
    const dividendo = Math.abs(divisor) * q * sp
    const certa = dividendo / divisor
    return {
      enunciado: `Quanto é **${par(dividendo)} ÷ ${par(divisor)}**?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, 0, [[-certa, certa < 0 ? 'sinais-diferentes-da-positivo' : 'sinais-iguais-da-negativo']]),
      dicas: [
        `Dividir é a volta de multiplicar: que número, vezes ${par(divisor)}, dá ${dec(dividendo)}?`,
        `Sem os sinais: $${Math.abs(dividendo)} \\div ${Math.abs(divisor)} = ${q}$. ${certa < 0 ? 'Sinais diferentes' : 'Sinais iguais'}: e o sinal?`,
        `$${parTex(dividendo)} \\div ${parTex(divisor)} = ${tex(certa)}$, porque $${parTex(divisor)} \\times ${parTex(certa)} = ${tex(dividendo)}$.`,
      ],
    }
  },
}

/** (a, b, c) com c dividindo a × b, para as contas de três números. */
const COMBOS_TRES: [number, number, number][] = []
for (let a = 2; a <= 9; a++) {
  for (let b = 2; b <= 9; b++) {
    for (let c = 2; c <= 9; c++) if ((a * b) % c === 0 && (a * b) / c > 1) COMBOS_TRES.push([a, b, c])
  }
}
/** A câmara fria: [temperatura inicial, queda por hora, horas], com o fim abaixo de zero. */
const COMBOS_CAMARA: [number, number, number][] = []
for (let t = 2; t <= 10; t++) {
  for (let c = 2; c <= 5; c++) {
    for (let h = 2; h <= 6; h++) if (t - c * h < 0) COMBOS_CAMARA.push([t, c, h])
  }
}

export const multiplicarNegativosN3: Gerador = {
  id: 'multiplicar-negativos-n3',
  aula: 'B.U12.A4',
  nivel: 3,
  gerar(r): Item {
    const caso = r.int(0, 2)
    if (caso === 0) {
      const [t, c, h] = r.pick(COMBOS_CAMARA)
      const certa = t - c * h
      return {
        enunciado: `Uma câmara fria está a **${t} °C** e esfria **${c} °C** por hora. Quanto ela marca depois de **${h}** horas?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, 0, [
          [-certa, 'decimal-negativo-sem-sinal'],
          [t + c * h, 'sinais-diferentes-da-positivo'],
        ]),
        dicas: [
          `Cada hora muda a temperatura em ${dec(-c)} °C. Em ${h} horas: ${h} × ${par(-c)}.`,
          `$${h} \\times ${parTex(-c)} = ${tex(-c * h)}$. Agora some isso aos ${t} °C.`,
          `$${t} + ${parTex(-c * h)} = ${tex(certa)}$: a câmara marca ${dec(certa)} °C.`,
        ],
      }
    }
    if (caso === 1) {
      const n = r.int(2, 6)
      const parcela = r.int(8, 60)
      const total = n * parcela
      const certa = -parcela
      return {
        enunciado: `Você vai pagar **R$ ${total}** em **${n}** parcelas iguais, tiradas da sua conta. Quanto muda o saldo a cada parcela?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, 0, [[parcela, 'sinais-diferentes-da-positivo']]),
        dicas: [
          'Dinheiro que sai da conta muda o saldo para baixo: é negativo.',
          `O total que sai é ${dec(-total)}. Divida em ${n} partes iguais: ${par(-total)} ÷ ${n}.`,
          `$${parTex(-total)} \\div ${n} = ${tex(certa)}$: o saldo muda ${dec(certa)} reais a cada parcela.`,
        ],
      }
    }
    // Três números: (−a) × (−b) ÷ (−c) ou (−a) × b ÷ (−c).
    const [a, b, c] = r.pick(COMBOS_TRES)
    const bNegativo = r.int(0, 1) === 1
    const bb = bNegativo ? -b : b
    const produto = -a * bb
    const certa = produto / -c
    return {
      enunciado: `Quanto é **${par(-a)} × ${par(bb)} ÷ ${par(-c)}**? Faça da esquerda para a direita.`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, 0, [[-certa, bNegativo ? 'sinais-iguais-da-negativo' : 'sinais-diferentes-da-positivo']]),
      dicas: [
        'Uma conta de cada vez, da esquerda para a direita. Em cada uma, olhe os dois sinais.',
        `Primeiro: $${parTex(-a)} \\times ${parTex(bb)} = ${tex(produto)}$.`,
        `Depois: $${parTex(produto)} \\div ${parTex(-c)} = ${tex(certa)}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: os números racionais

/**
 * Dois negativos com a mesma parte inteira, um com uma casa e o outro com
 * duas (o caso que pega: −0,5 e −0,25), em centésimos: [k, décimos, centésimos].
 * Longe o bastante para os pontos não se encostarem na reta.
 */
const COMBOS_COMPARA: [number, number, number][] = []
for (const k of [0, 1]) {
  for (let d = 1; d <= 9; d++) {
    for (let c = 5; c <= 95; c += 10) {
      if (Math.abs(d * 10 - c) >= (k === 0 ? 25 : 40)) COMBOS_COMPARA.push([k, d, c])
    }
  }
}

export const racionaisN1: Gerador = {
  id: 'racionais-n1',
  aula: 'B.U12.A5',
  nivel: 1,
  gerar(r) {
    const [k, d, c] = r.pick(COMBOS_COMPARA)
    // Os dois números em centésimos, negativos.
    const x = -(k * 100 + d * 10)
    const y = -(k * 100 + c)
    const nums = r.int(0, 1) === 0 ? [x, y] : [y, x]
    const maior = r.int(0, 1) === 0
    const certo = maior ? Math.max(...nums) : Math.min(...nums)
    const certa = nums.indexOf(certo)
    const opcoes = nums.map((n) => dec(n, 2))
    return {
      enunciado: `Qual é ${maior ? 'maior' : 'menor'}: **${opcoes[0]}** ou **${opcoes[1]}**?`,
      formato: 'escolha',
      opcoes,
      resposta: certa,
      erros: { [String(1 - certa)]: 'compara-decimais-negativos-sem-o-sinal' },
      dicas: [
        'Na reta, quem fica à direita é o maior. Do lado negativo, mais perto do zero é maior.',
        `Quem deve mais: quem deve R$ ${reais(-nums[0])} ou R$ ${reais(-nums[1])}? Quem deve mais tem o saldo menor.`,
        `${dec(Math.min(...nums), 2)} < ${dec(Math.max(...nums), 2)}: o ${maior ? 'maior' : 'menor'} é ${opcoes[certa]}.`,
      ],
      visual: {
        modelo: 'reta',
        estado: { sinais: true, de: -(k + 1), ate: 0.25, passo: 0.25, marcas: k === 0 ? [-1, 0] : [-2, -1, 0], numeros: nums.map((n) => n / 100) },
        esboco: `A reta de ${dec(-(k + 1))} a 0, com os pontos ${opcoes[0]} e ${opcoes[1]} em azul. O mais perto do zero é o maior.`,
      },
    }
  },
}

/** Frações com decimal exato (até 3 casas), irredutíveis: [numerador, denominador]. */
const FRACOES: [number, number][] = []
const mdc = (a: number, b: number): number => (b === 0 ? a : mdc(b, a % b))
for (const d of [2, 4, 5, 8, 10]) {
  for (let n = 1; n < 2 * d; n++) if (mdc(n, d) === 1 && n % d !== 0) FRACOES.push([n, d])
}
type Lugar = 'frente' | 'cima' | 'baixo' | 'ambos'
const LUGARES: Lugar[] = ['frente', 'cima', 'baixo', 'ambos']

export const racionaisN2: Gerador = {
  id: 'racionais-n2',
  aula: 'B.U12.A5',
  nivel: 2,
  gerar(r) {
    const [n, d] = r.pick(FRACOES)
    const lugar = r.pick(LUGARES)
    const fracao = {
      frente: `-\\frac{${n}}{${d}}`,
      cima: `\\frac{-${n}}{${d}}`,
      baixo: `\\frac{${n}}{-${d}}`,
      ambos: `\\frac{-${n}}{-${d}}`,
    }[lugar]
    // O valor em milésimos.
    const modulo = (n * 1000) / d
    const certa = lugar === 'ambos' ? modulo : -modulo
    const divisao = {
      frente: `-(${n} \\div ${d})`,
      cima: `(-${n}) \\div ${d}`,
      baixo: `${n} \\div (-${d})`,
      ambos: `(-${n}) \\div (-${d})`,
    }[lugar]
    return {
      enunciado: `Escreva $${fracao}$ em decimal.`,
      formato: 'numero',
      resposta: resposta(certa, 3),
      sinal: true,
      erros: mapa(certa, 3, [[-certa, lugar === 'ambos' ? 'menos-no-numerador-e-no-denominador' : 'sinais-diferentes-da-positivo']]),
      dicas: [
        'Uma fração é uma divisão. Olhe os sinais: iguais dão positivo; diferentes, negativo.',
        `$${divisao}$. Sem os sinais: $${n} \\div ${d} = ${tex(modulo, 3)}$.`,
        `$${fracao} = ${tex(certa, 3)}$.`,
      ],
    }
  },
}

/** A queda de temperatura em décimos: [antes, queda], com o fim abaixo de zero. */
const COMBOS_QUEDA: [number, number][] = []
for (let t = 5; t <= 60; t += 5) {
  for (let q = t + 5; q <= t + 80; q += 5) if (t % 10 !== 0 || q % 10 !== 0) COMBOS_QUEDA.push([t, q])
}

export const racionaisN3: Gerador = {
  id: 'racionais-n3',
  aula: 'B.U12.A5',
  nivel: 3,
  gerar(r): Item {
    const caso = r.int(0, 2)
    if (caso === 0) {
      // Em décimos de grau.
      const [t, q] = r.pick(COMBOS_QUEDA)
      const certa = t - q
      return {
        enunciado: `O termômetro marcava **${dec(t, 1)} °C** e a temperatura caiu **${dec(q, 1)} °C**. Quanto ele marca agora?`,
        formato: 'numero',
        resposta: resposta(certa, 1),
        sinal: true,
        erros: mapa(certa, 1, [[-certa, 'decimal-negativo-sem-sinal']]),
        dicas: [
          `A queda é maior que os ${dec(t, 1)} °C: a temperatura passa do zero.`,
          `${dec(t, 1)} °C de queda levam até o zero. Ainda faltam $${tex(q, 1)} - ${tex(t, 1)} = ${tex(-certa, 1)}$ abaixo dele.`,
          `$${tex(t, 1)} - ${tex(q, 1)} = ${tex(certa, 1)}$: o termômetro marca ${dec(certa, 1)} °C.`,
        ],
      }
    }
    if (caso === 1) {
      // Em centavos: um saldo e um pagamento maior que ele.
      const s = r.int(2, 10) * 500
      const p = s + r.int(1, 60) * 50
      const certa = s - p
      return {
        enunciado: `Seu saldo era **R$ ${reais(s)}** e você pagou um boleto de **R$ ${reais(p)}**. Qual é o saldo agora, em reais?`,
        formato: 'numero',
        resposta: resposta(certa, 2),
        sinal: true,
        erros: mapa(certa, 2, [[-certa, 'decimal-negativo-sem-sinal']]),
        dicas: [
          'O boleto é maior que o saldo: a conta fica negativa.',
          `Faltam $${texR(p)} - ${texR(s)} = ${texR(-certa)}$ reais para pagar tudo.`,
          `$${texR(s)} - ${texR(p)} = ${texR(certa)}$: o saldo é −R$ ${reais(certa)}.`,
        ],
      }
    }
    // Em centavos: um saldo negativo e tarifas iguais.
    const s = -(r.int(1, 40) * 50)
    const k = r.int(2, 5)
    const t = r.int(1, 8) * 50
    const certa = s - k * t
    return {
      enunciado: `Seu saldo é **−R$ ${reais(s)}**. O banco cobra **${k}** tarifas de **R$ ${reais(t)}**. Qual é o saldo agora, em reais?`,
      formato: 'numero',
      resposta: resposta(certa, 2),
      sinal: true,
      erros: mapa(certa, 2, [
        [s + k * t, 'sinais-diferentes-da-positivo'],
        [-certa, 'decimal-negativo-sem-sinal'],
      ]),
      dicas: [
        'Tarifa é dinheiro que sai: aumenta a dívida.',
        `As ${k} tarifas mudam o saldo em $${k} \\times (${texR(-t)}) = ${texR(-k * t)}$.`,
        `$${texR(s)} + (${texR(-k * t)}) = ${texR(certa)}$: o saldo é −R$ ${reais(certa)}.`,
      ],
    }
  },
}

export const GERADORES_U12B: Gerador[] = [
  multiplicarNegativosN1,
  multiplicarNegativosN2,
  multiplicarNegativosN3,
  racionaisN1,
  racionaisN2,
  racionaisN3,
]
