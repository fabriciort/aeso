import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 12: números negativos (aulas 1 a 3). Abaixo de zero (ler, comparar
// e ordenar), somar e subtrair na reta, tirar um negativo. Todo item numérico
// leva `sinal: true`: o teclado mostra a tecla do menos sem entregar o sinal
// da resposta. As respostas são números (−3 é -3); as chaves do mapa `erros`
// são o número como o JavaScript o escreve ('-3'), e o hífen e o sinal de
// menos valem o mesmo na tela.

/** Para a tela, com o sinal de menos verdadeiro: −3. */
const n = (x: number) => (x < 0 ? `−${-x}` : String(x))
/** Com parênteses quando é negativo, para vir depois de um sinal: (−3). */
const p = (x: number) => (x < 0 ? `(${n(x)})` : String(x))

/** Como a voz lê o enunciado: "3 − (−2)" vira "3 menos menos 2". */
const falar = (t: string) =>
  t
    .replace(/\*\*/g, '')
    .replace(/R\$ −(\d+)/g, 'menos $1 reais')
    .replace(/R\$ (\d+)/g, '$1 reais')
    .replace(/°C/g, 'graus')
    .replace(/ − /g, ' menos ')
    .replace(/ \+ /g, ' mais ')
    .replace(/[()]/g, '')
    .replace(/−/g, 'menos ')

/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number, pares: [number | null, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([certa === 0 ? 0 : certa])
  for (const [valor, erro] of pares) {
    if (valor === null) continue
    const v = valor === 0 ? 0 : valor // −0 vale 0
    if (vistos.has(v)) continue
    vistos.add(v)
    erros[String(v)] = erro
  }
  return erros
}

type Op = { texto: string; certa?: boolean; erro?: string }
function embaralhar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const resto = [...opcoes]
  const ordem: Op[] = []
  while (resto.length) ordem.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

/** k números inteiros diferentes de [min, max] (de passo em passo), tirados sem repetir. */
function distintos(r: Rng, k: number, min: number, max: number, passo = 1, fora: number[] = []): number[] {
  const resto: number[] = []
  for (let x = Math.ceil(min / passo) * passo; x <= max; x += passo) if (!fora.includes(x)) resto.push(x)
  const xs: number[] = []
  while (xs.length < k && resto.length) xs.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  return xs
}

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { sinais: true, ...estado }, esboco })
const saldo = (s: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { saldo: s }, esboco })

// ---------------------------------------------------------------- aula 1: abaixo de zero

export const abaixoDeZeroN1: Gerador = {
  id: 'abaixo-de-zero-n1',
  aula: 'B.U12.A1',
  nivel: 1,
  gerar(r) {
    // Dois em cada três são negativos; o 5 já vem escrito na reta.
    const v = r.int(0, 2) < 2 ? -r.int(1, 7) : r.pick([1, 2, 3, 4, 6, 7])
    const k = Math.abs(v)
    const lado = v < 0 ? 'esquerda' : 'direita'
    const enunciado = 'Cada traço da reta é **1**. Que número fica no traço marcado com **?**'
    return {
      enunciado,
      fala: 'Cada traço da reta é um. Que número fica no traço marcado com o ponto de interrogação?',
      formato: 'numero',
      resposta: v,
      sinal: true,
      erros: mapa(v, [[-v, v < 0 ? 'esquece-sinal-do-resultado' : 'inverte-reta']]),
      dicas: [
        'À direita do zero ficam os positivos; à esquerda, os negativos.',
        `Conte os traços do 0 até o ?. Ele fica à ${lado} do zero.`,
        `São ${k} traços à ${lado} do zero: ${n(v)}.`,
      ],
      visual: reta({ de: -8, ate: 8, passo: 1, marcas: [0, 5], marcaSemRotulo: v }, `A reta de −8 a 8, com só o 0 e o 5 escritos e um "?" no traço do ${n(v)}.`),
    }
  },
}

export const abaixoDeZeroN2: Gerador = {
  id: 'abaixo-de-zero-n2',
  aula: 'B.U12.A1',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 2) {
      // A distância até o zero (o módulo).
      const k = r.int(2, 15)
      return {
        enunciado: `Quantos passos separam o **${n(-k)}** do zero, na reta?`,
        fala: `Quantos passos separam o menos ${k} do zero, na reta?`,
        formato: 'numero',
        resposta: k,
        sinal: true,
        erros: mapa(k, [[-k, 'modulo-com-sinal']]),
        dicas: [
          'Distância é quanto se anda: nunca tem sinal de menos.',
          `Do zero até ${n(-k)}, conte os passos para a esquerda.`,
          `São ${k} passos, como do zero até ${k}.`,
        ],
      }
    }
    // Comparar: dois negativos, ou um negativo e um positivo (ou o zero) menor que ele sem o sinal.
    const [a, b] = r.int(0, 2) < 2 ? distintos(r, 2, -15, -1) : [-r.int(3, 12), r.int(0, 2)]
    const maior = r.int(0, 1) === 0
    const certa = maior ? Math.max(a, b) : Math.min(a, b)
    const errada = certa === a ? b : a
    const palavra = maior ? 'maior' : 'menor'
    const [x, y] = r.int(0, 1) === 0 ? [a, b] : [b, a]
    return {
      enunciado: `Qual é ${palavra}: **${n(x)}** ou **${n(y)}**?`,
      fala: `Qual é ${palavra}: ${falar(n(x))} ou ${falar(n(y))}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: n(certa), certa: true },
        { texto: n(errada), erro: 'negativo-maior-pelo-numero' },
      ]),
      dicas: [
        'Na reta, quem está mais à direita é o maior. Os negativos ficam à esquerda do zero.',
        `Ponha ${n(x)} e ${n(y)} na reta. Qual fica mais à ${maior ? 'direita' : 'esquerda'}?`,
        `${n(Math.min(a, b))} < ${n(Math.max(a, b))}: o ${palavra} é ${n(certa)}.`,
      ],
    }
  },
}

export const abaixoDeZeroN3: Gerador = {
  id: 'abaixo-de-zero-n3',
  aula: 'B.U12.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    let xs: number[]
    let enunciado: string
    let maior = false
    if (tipo === 0) {
      // Pelo menos dois negativos entre as quatro mínimas.
      const negs = distintos(r, 2, -9, -1)
      xs = [...negs, ...distintos(r, 2, -9, 5, 1, negs)]
      xs = distintos(r, 4, 0, 3).map((i) => xs[i])
      enunciado = `As mínimas de quatro cidades: ${xs.map((x) => `**${n(x)} °C**`).join(', ')}. Qual foi a temperatura mais baixa?`
    } else if (tipo === 1) {
      xs = distintos(r, 3, -90, -10, 10)
      maior = true
      enunciado = `Três contas estão no vermelho: ${xs.map((x) => `**R$ ${n(x)}**`).join(', ')}. Qual é o maior saldo, em reais?`
    } else {
      xs = [...distintos(r, 2, -4, -1), r.int(1, 6)]
      xs = distintos(r, 3, 0, 2).map((i) => xs[i])
      const [a, b, c] = xs
      enunciado = `O térreo é o andar 0. Ana está no andar **${n(a)}**, Bia no **${n(b)}** e Caio no **${n(c)}**. Em que andar está quem está mais embaixo?`
    }
    const certa = maior ? Math.max(...xs) : Math.min(...xs)
    const negativos = xs.filter((x) => x < 0)
    // A isca: o negativo mais perto do zero, que parece o "menor" pelo número sem sinal (ou o contrário).
    const isca = maior ? Math.min(...negativos) : Math.max(...negativos)
    return {
      enunciado,
      fala: falar(enunciado),
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [isca, 'negativo-maior-pelo-numero'],
        [certa < 0 ? -certa : null, 'esquece-sinal-do-resultado'],
      ]),
      dicas: [
        maior ? 'O maior saldo é o de quem deve menos: o mais perto do zero.' : 'O mais baixo é o menor: o que fica mais à esquerda na reta.',
        `Entre os negativos, ${maior ? 'o maior é o mais perto do zero' : 'o menor é o mais longe do zero'}.`,
        `${[...xs].sort((u, v) => u - v).map(n).join(' < ')}. A resposta é ${n(certa)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: somar e subtrair na reta

export const somarSubtrairRetaN1: Gerador = {
  id: 'somar-subtrair-reta-n1',
  aula: 'B.U12.A2',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // a − b passando do zero.
      const a = r.int(1, 6)
      const b = r.int(a + 1, a + 6)
      const certa = a - b
      return {
        enunciado: `Quanto é **${a} − ${b}**? Comece no ${a} e ande na reta.`,
        fala: `Quanto é ${a} menos ${b}? Comece no ${a} e ande na reta.`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [b - a, 'esquece-sinal-do-resultado'],
          [a + b, 'anda-para-o-lado-errado'],
        ]),
        dicas: [
          'Subtrair um positivo é andar para a esquerda. A reta continua depois do zero.',
          `Do ${a}, ${a} passos levam ao zero. Faltam ${b - a}.`,
          `Depois do zero, ${b - a} passos para a esquerda: ${n(certa)}.`,
        ],
        visual: reta({ de: -10, ate: 10, passo: 1, marcas: [0], numeros: [a] }, `A reta de −10 a 10 com o ponto âmbar no ${a}, de onde se parte.`),
      }
    }
    // (−a) + b: andar para a direita a partir de um negativo.
    const a = r.int(1, 7)
    let b = r.int(1, 9)
    if (b === a) b = a + 1
    const certa = b - a
    return {
      enunciado: `Quanto é **${p(-a)} + ${b}**? Comece no ${n(-a)} e ande na reta.`,
      fala: `Quanto é menos ${a} mais ${b}? Comece no menos ${a} e ande na reta.`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [-a - b, 'anda-para-o-lado-errado'],
        [certa < 0 ? -certa : null, 'esquece-sinal-do-resultado'],
      ]),
      dicas: [
        'Somar um positivo é andar para a direita.',
        b > a ? `Do ${n(-a)}, ${a} passos levam ao zero. Faltam ${b - a}.` : `Do ${n(-a)}, ande ${b} passos para a direita. Você chega ao zero?`,
        `${p(-a)} + ${b} = ${n(certa)}.`,
      ],
      visual: reta({ de: -10, ate: 10, passo: 1, marcas: [0], numeros: [-a] }, `A reta de −10 a 10 com o ponto azul no ${n(-a)}, de onde se parte.`),
    }
  },
}

export const somarSubtrairRetaN2: Gerador = {
  id: 'somar-subtrair-reta-n2',
  aula: 'B.U12.A2',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    const a = r.int(1, 9)
    const b = r.int(1, 9)
    if (tipo === 0) {
      // a + (−b): somar uma dívida.
      const certa = a - b
      return {
        enunciado: `Quanto é **${a} + ${p(-b)}**?`,
        fala: `Quanto é ${a} mais menos ${b}?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [a + b, 'anda-para-o-lado-errado'],
          [certa < 0 ? -certa : null, 'esquece-sinal-do-resultado'],
        ]),
        dicas: [
          'Somar um negativo é andar para a esquerda, como subtrair.',
          `${a} + ${p(-b)} anda o mesmo que ${a} − ${b}.`,
          `${a} − ${b} = ${n(certa)}.`,
        ],
      }
    }
    const certa = -a - b
    if (tipo === 1) {
      // (−a) + (−b): dívida mais dívida.
      return {
        enunciado: `Quanto é **${p(-a)} + ${p(-b)}**?`,
        fala: `Quanto é menos ${a} mais menos ${b}?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [a + b, 'menos-com-menos-na-soma'],
          [b - a, 'anda-para-o-lado-errado'],
        ]),
        dicas: [
          'Dívida mais dívida é mais dívida. Somar um negativo anda para a esquerda.',
          `Do ${n(-a)}, ande ${b} passos para a esquerda.`,
          `${a} + ${b} = ${a + b} de dívida: ${n(certa)}.`,
        ],
      }
    }
    // (−a) − b: já devendo, tirar mais.
    return {
      enunciado: `Quanto é **${p(-a)} − ${b}**?`,
      fala: `Quanto é menos ${a} menos ${b}?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [b - a, 'anda-para-o-lado-errado'],
        [a + b, 'menos-com-menos-na-soma'],
      ]),
      dicas: [
        'Subtrair um positivo é andar para a esquerda, mesmo começando num negativo.',
        `Do ${n(-a)}, ande ${b} passos para a esquerda: mais longe do zero.`,
        `${p(-a)} − ${b} = ${n(certa)}.`,
      ],
    }
  },
}

export const somarSubtrairRetaN3: Gerador = {
  id: 'somar-subtrair-reta-n3',
  aula: 'B.U12.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    let s: number
    let d: number
    let sobe: boolean
    let enunciado: string
    if (tipo === 0) {
      s = r.int(-8, 6)
      d = r.int(2, 9)
      sobe = r.int(0, 2) === 0
      enunciado = `A temperatura era **${n(s)} °C** e ${sobe ? 'subiu' : 'caiu'} **${d} graus**. Quanto marca agora, em graus?`
    } else if (tipo === 1) {
      sobe = r.int(0, 2) === 0
      if (sobe) {
        s = -5 * r.int(2, 16)
        d = 5 * r.int(1, 20)
        if (d === -s) d += 5
        enunciado = `O saldo da sua conta era **R$ ${n(s)}**. Você depositou **R$ ${d}**. Qual é o saldo agora, em reais?`
      } else {
        s = 5 * r.int(2, 16)
        d = s + 5 * r.int(1, 10)
        enunciado = `Sua conta tinha **R$ ${s}**. Você pagou um boleto de **R$ ${d}**. Qual é o saldo agora, em reais?`
      }
    } else {
      s = r.int(-3, 8)
      sobe = s < 0 ? r.int(0, 1) === 0 : false
      // Descendo de um andar acima do térreo, passa do zero.
      d = sobe ? r.int(2, 9) : s >= 0 ? r.int(Math.max(2, s + 1), s + 4) : r.int(2, 5)
      enunciado = `O térreo é o andar 0. O elevador estava no andar **${n(s)}** e ${sobe ? 'subiu' : 'desceu'} **${d} andares**. Em que andar parou?`
    }
    const certa = sobe ? s + d : s - d
    const errada = sobe ? s - d : s + d
    return {
      enunciado,
      fala: falar(enunciado),
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [errada, 'anda-para-o-lado-errado'],
        [certa < 0 ? -certa : null, 'esquece-sinal-do-resultado'],
      ]),
      dicas: [
        sobe ? 'Subir ou depositar é somar: andar para a direita na reta.' : 'Cair, pagar ou descer é subtrair: andar para a esquerda na reta.',
        `A conta é ${p(s)} ${sobe ? '+' : '−'} ${d}. Do ${n(s)}, ande ${d} para a ${sobe ? 'direita' : 'esquerda'}.`,
        `${p(s)} ${sobe ? '+' : '−'} ${d} = ${n(certa)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: tirar um negativo

export const tirarNegativoN1: Gerador = {
  id: 'tirar-negativo-n1',
  aula: 'B.U12.A3',
  nivel: 1,
  gerar(r) {
    const a = r.int(0, 5)
    const b = r.int(1, 5)
    const certa = a + b
    return {
      enunciado: `Quanto é **${a} − ${p(-b)}**? Os ${b} pares + − já estão postos: tire as ${b} fichas −.`,
      fala: `Quanto é ${a} menos menos ${b}? Os ${b} pares mais e menos já estão postos: tire as ${b} fichas menos.`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [[a - b, 'tirar-negativo-subtrai']]),
      dicas: [
        'Tirar uma ficha − é cancelar uma dívida: o saldo sobe.',
        `Tire as ${b} fichas −. Sobram as ${a + b} fichas +.`,
        `${a} − ${p(-b)} = ${a} + ${b} = ${certa}.`,
      ],
      visual: saldo({ positivas: a + b, negativas: b, pares: true }, `${a + b} fichas + em cima e ${b} fichas − embaixo, com ${b} pares emoldurados: o saldo ainda é +${a}.`),
    }
  },
}

export const tirarNegativoN2: Gerador = {
  id: 'tirar-negativo-n2',
  aula: 'B.U12.A3',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 3) === 0) {
      // a − (−b) com números maiores, sem desenho.
      const a = r.int(1, 15)
      const b = r.int(5, 15)
      const certa = a + b
      return {
        enunciado: `Quanto é **${a} − ${p(-b)}**?`,
        fala: `Quanto é ${a} menos menos ${b}?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [[a - b, 'tirar-negativo-subtrai']]),
        dicas: [
          'Tirar um negativo é o mesmo que somar o positivo.',
          `${a} − ${p(-b)} = ${a} + ${b}.`,
          `${a} + ${b} = ${certa}.`,
        ],
      }
    }
    // (−a) − (−b): tirar parte de uma dívida, ou mais do que ela.
    const a = r.int(1, 9)
    let b = r.int(1, 9)
    if (b === a) b = a === 9 ? 8 : a + 1
    const certa = b - a
    return {
      enunciado: `Quanto é **${p(-a)} − ${p(-b)}**?`,
      fala: `Quanto é menos ${a} menos menos ${b}?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [-a - b, 'tirar-negativo-subtrai'],
        [certa < 0 ? -certa : null, 'esquece-sinal-do-resultado'],
      ]),
      dicas: [
        'Tirar um negativo é o mesmo que somar o positivo.',
        `${p(-a)} − ${p(-b)} = ${p(-a)} + ${b}.`,
        `${p(-a)} + ${b} = ${n(certa)}.`,
      ],
    }
  },
}

export const tirarNegativoN3: Gerador = {
  id: 'tirar-negativo-n3',
  aula: 'B.U12.A3',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo < 2) {
      // A diferença entre uma temperatura acima e outra abaixo de zero.
      const x = tipo === 0 ? r.int(2, 15) : r.int(2, 8)
      const y = tipo === 0 ? r.int(1, 9) : r.int(12, 25)
      const enunciado =
        tipo === 0
          ? `De dia fez **${x} °C**; de madrugada, **${n(-y)} °C**. Quantos graus separam as duas temperaturas?`
          : `O freezer está a **${n(-y)} °C** e a geladeira, a **${x} °C**. Quantos graus a geladeira está acima do freezer?`
      const certa = x + y
      return {
        enunciado,
        fala: falar(enunciado),
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [[x - y, 'tirar-negativo-subtrai']]),
        dicas: [
          'A diferença é a maior menos a menor, mesmo quando a menor é negativa.',
          `${x} − ${p(-y)} = ${x} + ${y}.`,
          `${x} + ${y} = ${certa} graus.`,
        ],
      }
    }
    // Uma tarifa cancelada num saldo no vermelho.
    const s = 5 * r.int(2, 12)
    let t = 5 * r.int(1, 16)
    if (t === s) t += 5
    const certa = t - s
    const enunciado = `Seu saldo era **R$ ${n(-s)}**. O banco cancelou uma tarifa de **R$ ${t}**. Qual é o saldo agora, em reais?`
    return {
      enunciado,
      fala: falar(enunciado),
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [-s - t, 'tirar-negativo-subtrai'],
        [certa < 0 ? -certa : null, 'esquece-sinal-do-resultado'],
      ]),
      dicas: [
        'Cancelar uma tarifa é tirar uma dívida: o saldo sobe.',
        `${p(-s)} − ${p(-t)} = ${p(-s)} + ${t}.`,
        `${p(-s)} + ${t} = ${n(certa)}: o saldo é R$ ${n(certa)}.`,
      ],
    }
  },
}

export const GERADORES_U12A: Gerador[] = [
  abaixoDeZeroN1, abaixoDeZeroN2, abaixoDeZeroN3,
  somarSubtrairRetaN1, somarSubtrairRetaN2, somarSubtrairRetaN3,
  tirarNegativoN1, tirarNegativoN2, tirarNegativoN3,
]
