import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 18: plano cartesiano e gráficos (aulas 1 a 3). Coordenadas; ler
// gráficos de barras, linhas e setores; gráficos que enganam (o eixo
// cortado e a escala torta). As coordenadas vão como (x, y), com o sinal de
// menos verdadeiro: (−3, 2). Os itens de coordenadas levam `sinal: true`,
// para o teclado não entregar o sinal; as chaves do mapa `erros` são o
// número como o JavaScript o escreve ('-3'). Dinheiro e porcentagem com o
// espaço que não quebra (R$ 40, 25 %). No nível 1, o visual: o plano com o
// ponto, o gráfico de barras ou de linhas sem os valores escritos, o
// gráfico com o eixo cortado e o gráfico na escala torta.

// ---------------------------------------------------------------- ajudas

/** O espaço que não quebra, entre o número e a unidade. */
const NB = '\u00a0'
/** Para a tela, com o sinal de menos verdadeiro e o ponto de milhar: −3, 2.000. */
const n = (x: number): string => (x < 0 ? `−${n(-x)}` : String(x).replace(/\B(?=(\d{3})+(?!\d))/g, '.'))
const reais = (x: number) => `R$${NB}${n(x)}`
const pct = (x: number) => `${n(x)}${NB}%`
/** O par (x, y), com o menos verdadeiro. */
const par = (x: number, y: number) => `(${n(x)},${NB}${n(y)})`

/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number, pares: [number | null, string][], positivos = false): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([certa === 0 ? 0 : certa])
  for (const [valor, erro] of pares) {
    if (valor === null || !Number.isInteger(valor)) continue
    if (positivos && valor <= 0) continue
    const v = valor === 0 ? 0 : valor // −0 vale 0
    if (vistos.has(v)) continue
    vistos.add(v)
    erros[String(v)] = erro
  }
  return erros
}
/** A divisão, só quando é exata (senão, null: não vira erro previsível). */
const exata = (a: number, b: number) => (b !== 0 && a % b === 0 ? a / b : null)

/** Um inteiro de [min, max] diferente de zero. */
const naoZero = (r: Rng, min: number, max: number) => {
  const v = r.int(min, max - 1)
  return v >= 0 ? v + 1 : v
}
/** Um inteiro de [min, max] diferente de zero e fora de `fora` (sem laço: termina com qualquer rng). */
const naoZeroFora = (r: Rng, min: number, max: number, fora: (v: number) => boolean) => {
  const xs: number[] = []
  for (let v = min; v <= max; v++) if (v !== 0 && !fora(v)) xs.push(v)
  return r.pick(xs)
}

const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })
const graf = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grafico', estado, esboco })

// ---------------------------------------------------------------- aula 1: coordenadas

export const QUADRANTES = ['1º quadrante', '2º quadrante', '3º quadrante', '4º quadrante'] as const
const quadrante = (x: number, y: number) => (x > 0 ? (y > 0 ? 1 : 4) : y > 0 ? 2 : 3)
/** As opções dos quadrantes: o do par trocado (y, x) é a troca; os outros, o sinal. */
function opcoesQuadrante(x: number, y: number): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const certa = quadrante(x, y) - 1
  const troca = quadrante(y, x) - 1
  const erros: Record<string, string> = {}
  QUADRANTES.forEach((_, i) => i !== certa && (erros[String(i)] = i === troca ? 'troca-x-e-y' : 'ignora-sinal-da-coordenada'))
  return { opcoes: [...QUADRANTES], resposta: certa, erros }
}
const sentido = (v: number, eixo: 'x' | 'y') => (eixo === 'x' ? (v < 0 ? 'para a esquerda' : 'para a direita') : v < 0 ? 'para baixo' : 'para cima')
const dicasQuadrante = (x: number, y: number): [string, string, string] => [
  'Primeiro o x, para o lado; depois o y, para cima ou para baixo.',
  `O x é ${n(x)}: ${sentido(x, 'x')}. O y é ${n(y)}: ${sentido(y, 'y')}.`,
  `${par(x, y)} fica no ${QUADRANTES[quadrante(x, y) - 1]}.`,
]

export const coordenadasN1: Gerador = {
  id: 'coordenadas-n1',
  aula: 'B.U18.A1',
  nivel: 1,
  gerar(r) {
    // Um ponto fora dos eixos, com |x| e |y| diferentes: a troca e o sinal dão respostas diferentes.
    const x = naoZero(r, -5, 5)
    const y = naoZeroFora(r, -5, 5, (v) => Math.abs(v) === Math.abs(x))
    const tipo = r.int(0, 2)
    if (tipo === 2) {
      return {
        enunciado: 'Em que quadrante fica o ponto P?',
        formato: 'escolha',
        ...opcoesQuadrante(x, y),
        dicas: dicasQuadrante(x, y),
        visual: plano({ x: [-5, 5], y: [-5, 5], quadrantes: true, pontos: { P: [x, y] } }, `O ponto P em ${par(x, y)}, com os quadrantes escritos nos cantos.`),
      }
    }
    const eixo = tipo === 0 ? 'x' : 'y'
    const certa = eixo === 'x' ? x : y
    const outro = eixo === 'x' ? y : x
    return {
      enunciado: `Qual é o ${eixo} do ponto P?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [outro, 'troca-x-e-y'],
        [-certa, 'ignora-sinal-da-coordenada'],
      ]),
      dicas: [
        eixo === 'x' ? 'O x é o primeiro número: quanto o ponto anda para o lado.' : 'O y é o segundo número: quanto o ponto anda para cima ou para baixo.',
        eixo === 'x' ? 'Do P, ande reto até o eixo de baixo e leia o número. À esquerda do 0, é negativo.' : 'Do P, ande de lado até o eixo em pé e leia o número. Abaixo do 0, é negativo.',
        `P é ${par(x, y)}: o ${eixo} é ${n(certa)}.`,
      ],
      visual: plano({ x: [-5, 5], y: [-5, 5], pontos: { P: [x, y] } }, `O ponto P em ${par(x, y)}, sem o par escrito.`),
    }
  },
}

const DIRECOES = [
  { eixo: 'x', passo: 1, texto: 'para a direita' },
  { eixo: 'x', passo: -1, texto: 'para a esquerda' },
  { eixo: 'y', passo: 1, texto: 'para cima' },
  { eixo: 'y', passo: -1, texto: 'para baixo' },
] as const

export const coordenadasN2: Gerador = {
  id: 'coordenadas-n2',
  aula: 'B.U18.A1',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O quadrante pelo par, sem desenho.
      const x = naoZero(r, -9, 9)
      const y = naoZeroFora(r, -9, 9, (v) => Math.abs(v) === Math.abs(x))
      return {
        enunciado: `Em que quadrante fica o ponto ${par(x, y)}?`,
        formato: 'escolha',
        ...opcoesQuadrante(x, y),
        dicas: dicasQuadrante(x, y),
      }
    }
    // O ponto anda: o novo x ou o novo y.
    const x = r.int(-6, 6)
    const y = r.int(-6, 6)
    const d = r.pick(DIRECOES)
    const k = r.int(2, 6)
    const muda = r.int(0, 3) > 0 // quase sempre, a coordenada que muda
    const pergunta = muda ? d.eixo : d.eixo === 'x' ? 'y' : 'x'
    const antes = pergunta === 'x' ? x : y
    const certa = muda ? antes + d.passo * k : antes
    const erros = muda
      ? mapa(certa, [
          [antes - d.passo * k, 'anda-para-o-lado-errado'],
          [antes !== 0 ? -antes + d.passo * k : null, 'ignora-sinal-da-coordenada'],
        ])
      : mapa(certa, [
          [antes + d.passo * k, 'troca-x-e-y'],
          [antes - d.passo * k, 'troca-x-e-y'],
        ])
    const conta = d.passo > 0 ? `${n(antes)} + ${k} = ${n(certa)}` : `${n(antes)} − ${k} = ${n(certa)}`
    return {
      enunciado: `O ponto ${par(x, y)} anda ${k} ${d.texto}. Qual é o ${pergunta} do ponto novo?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros,
      dicas: [
        'Andar para o lado muda só o x. Andar para cima ou para baixo muda só o y.',
        muda ? `O ${pergunta} começa em ${n(antes)}. ${d.passo > 0 ? 'Para a direita ou para cima, soma' : 'Para a esquerda ou para baixo, subtrai'}.` : `O ponto anda ${d.texto}: o ${pergunta} não muda.`,
        muda ? `${conta}.` : `O ${pergunta} continua ${n(certa)}.`,
      ],
    }
  },
}

/** Lugares do mapa do bairro. */
const LUGARES = ['a farmácia', 'a escola', 'o mercado', 'a padaria', 'o posto', 'a igreja', 'o banco']
const Lugar = (s: string) => s[0].toUpperCase() + s.slice(1)

export const coordenadasN3: Gerador = {
  id: 'coordenadas-n3',
  aula: 'B.U18.A1',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O mapa do bairro: dois lugares na mesma linha (ou coluna); quantas quadras entre eles.
      const i = r.int(0, LUGARES.length - 1)
      let j = r.int(0, LUGARES.length - 2)
      if (j >= i) j++
      const [A, B] = [LUGARES[i], LUGARES[j]]
      const a = naoZero(r, -6, 6)
      const b = naoZeroFora(r, -6, 6, (v) => v === a)
      const fixo = r.int(-5, 5)
      const deitado = r.int(0, 1) === 0
      const [pa, pb] = deitado ? [par(a, fixo), par(b, fixo)] : [par(fixo, a), par(fixo, b)]
      const certa = Math.abs(b - a)
      return {
        enunciado: `No mapa do bairro, a praça é o (0,${NB}0). ${Lugar(A)} está em ${pa} e ${B}, em ${pb}. Quantas quadras de uma até a outra?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[Math.abs(Math.abs(b) - Math.abs(a)), 'ignora-sinal-da-coordenada']], true),
        dicas: [
          `Os dois lugares têm o mesmo ${deitado ? 'y' : 'x'}: estão na mesma ${deitado ? 'linha' : 'coluna'}. Conte só o ${deitado ? 'x' : 'y'}.`,
          `Na reta, vá de ${n(Math.min(a, b))} até ${n(Math.max(a, b))}.${a * b < 0 ? ' Passando pelo 0, some as duas partes.' : ''}`,
          `De ${n(Math.min(a, b))} até ${n(Math.max(a, b))} são ${certa} quadras.`,
        ],
      }
    }
    // A batalha naval: o navio está algumas casas ao lado (ou acima) do tiro.
    const x = r.int(-5, 5)
    const y = r.int(-5, 5)
    const d = r.pick(DIRECOES)
    const k = r.int(2, 5)
    const antes = d.eixo === 'x' ? x : y
    const certa = antes + d.passo * k
    const onde = d.eixo === 'x' ? (d.passo > 0 ? 'à direita' : 'à esquerda') : d.passo > 0 ? 'acima' : 'abaixo'
    return {
      enunciado: `Batalha naval: seu tiro caiu em ${par(x, y)}. O navio está ${k} casas ${onde} do tiro. Qual é o ${d.eixo} do navio?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [antes - d.passo * k, 'anda-para-o-lado-errado'],
        [antes !== 0 ? -antes + d.passo * k : null, 'ignora-sinal-da-coordenada'],
        [(d.eixo === 'x' ? y : x) + d.passo * k, 'troca-x-e-y'],
      ]),
      dicas: [
        `${d.eixo === 'x' ? 'À direita ou à esquerda muda o x' : 'Acima ou abaixo muda o y'}. O outro número fica igual.`,
        `O ${d.eixo} do tiro é ${n(antes)}. ${d.passo > 0 ? 'Some' : 'Tire'} ${k}.`,
        `${d.passo > 0 ? `${n(antes)} + ${k}` : `${n(antes)} − ${k}`} = ${n(certa)}: o navio está em ${d.eixo === 'x' ? par(certa, y) : par(x, certa)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: ler gráficos

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const MES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
const DIA = ['na segunda', 'na terça', 'na quarta', 'na quinta', 'na sexta', 'no sábado']

/** Onde o topo fica, nas marcas de 20 em 20. */
const ondeFica = (v: number) => (v % 20 === 0 ? `bem na marca ${v}` : `no meio entre ${v - 10} e ${v + 10}`)

export const lerGraficoN1: Gerador = {
  id: 'ler-grafico-n1',
  aula: 'B.U18.A2',
  nivel: 1,
  gerar(r) {
    const linhas = r.int(0, 1) === 1
    const k = r.int(4, 6)
    const inicio = linhas ? 0 : r.int(0, 12 - k)
    const rotulos = (linhas ? DIAS : MESES).slice(inicio, inicio + k)
    const nomes = (linhas ? DIA : MES).slice(inicio, inicio + k)
    const valores = rotulos.map(() => r.int(3, 15) * 10)
    const i = r.int(0, k - 1)
    // Um valor entre marcas na metade das vezes: o caso que pega.
    if (r.int(0, 1) === 0 && valores[i] % 20 === 0) valores[i] += valores[i] < 150 ? 10 : -10
    const v = valores[i]
    const fim = Math.ceil(Math.max(...valores) / 20) * 20
    const titulo = linhas ? 'Clientes por dia' : 'Conta de água (R$)'
    const coisa = linhas ? 'o ponto' : 'a barra'
    return {
      enunciado: linhas ? `Quantos clientes a loja teve ${nomes[i]}? Leia no eixo.` : `Quanto foi a conta de água de ${nomes[i]}, em reais? Leia no eixo.`,
      formato: 'numero',
      resposta: v,
      erros: mapa(v, v % 20 === 0 ? [[v - 20, 'le-valor-entre-marcas'], [v + 20, 'le-valor-entre-marcas']] : [[v - 10, 'le-valor-entre-marcas'], [v + 10, 'le-valor-entre-marcas']], true),
      dicas: [
        `A altura d${linhas ? 'o ponto' : 'a barra'} é o valor, lido no eixo da esquerda.`,
        `Siga ${coisa} de ${rotulos[i]} até o eixo. ${linhas ? 'Ele' : 'O topo'} fica numa marca ou entre duas?`,
        `${linhas ? 'O ponto' : 'O topo'} fica ${ondeFica(v)}: ${v}.`,
      ],
      visual: graf(
        { tipo: linhas ? 'linhas' : 'barras', titulo, dados: rotulos.map((t, j) => [t, valores[j]]), eixoFim: fim, passo: 20, valores: false, destaque: i },
        `${linhas ? 'Uma linha' : 'Barras'} de ${rotulos[0]} a ${rotulos[k - 1]}, sem os valores escritos; ${rotulos[i]} aceso, em ${v}.`,
      ),
    }
  },
}

/** Quatro meses de conta de luz em que o mês mais caro não é o do maior salto. */
function contaComSalto(r: Rng): number[] {
  for (let tentativa = 0; tentativa < 200; tentativa++) {
    const v = [r.int(8, 14) * 10]
    for (let j = 0; j < 3; j++) v.push(v[j] + r.pick([-30, -20, -10, 10, 20, 30, 40, 50]))
    if (v.some((x) => x < 30)) continue
    const saltos = [1, 2, 3].map((j) => v[j] - v[j - 1])
    const maior = Math.max(...saltos)
    if (saltos.filter((s) => s === maior).length !== 1) continue
    const topo = Math.max(...v)
    if (v.filter((x) => x === topo).length !== 1) continue
    const iTopo = v.indexOf(topo)
    // O mais caro chega com uma subida, mas não com a maior.
    if (iTopo === 0 || saltos[iTopo - 1] <= 0 || saltos[iTopo - 1] === maior) continue
    return v
  }
  // Com um rng que não varia, uma conta fixa que serve.
  return [120, 100, 140, 150]
}

/** Os salários e as fatias que dão reais inteiros. */
const SALARIOS = [1500, 2000, 2400, 2500, 3000, 4000]
const FATIAS = [10, 20, 25, 30, 40, 50]
/** Os gastos: com o artigo e com o "de" (o aluguel, do aluguel). */
const GASTOS: [string, string][] = [['o aluguel', 'do aluguel'], ['a comida', 'da comida'], ['o transporte', 'do transporte'], ['a escola', 'da escola'], ['a conta de luz', 'da conta de luz']]

export const lerGraficoN2: Gerador = {
  id: 'ler-grafico-n2',
  aula: 'B.U18.A2',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O maior salto, numa lista de quatro meses.
      const ini = r.int(0, 8)
      const v = contaComSalto(r)
      const meses = MES.slice(ini, ini + 4)
      const saltos = [1, 2, 3].map((j) => v[j] - v[j - 1])
      const iSalto = saltos.indexOf(Math.max(...saltos)) // a opção certa (o mês que chega)
      const lista = v.map((x, j) => `${reais(x)} em ${meses[j]}`)
      const erros: Record<string, string> = {}
      ;[0, 1, 2].forEach((j) => j !== iSalto && (erros[String(j)] = 'subida-pela-altura'))
      return {
        enunciado: `A conta de luz foi ${lista.slice(0, 3).join(', ')} e ${lista[3]}. Em que mês ela deu o maior salto?`,
        formato: 'escolha',
        opcoes: meses.slice(1).map((m) => `em ${m}`),
        resposta: iSalto,
        erros,
        dicas: [
          'O salto é a diferença de um mês para o seguinte, não o mês mais caro.',
          `Faça as três contas: ${meses[1]} menos ${meses[0]}, ${meses[2]} menos ${meses[1]}, ${meses[3]} menos ${meses[2]}.`,
          `Os saltos: ${saltos.map((s) => (s > 0 ? `+${s}` : n(s))).join(', ')}. O maior chega em ${meses[iSalto + 1]}.`,
        ],
      }
    }
    // A fatia da pizza, em reais.
    const S = r.pick(SALARIOS)
    const p = r.pick(FATIAS.filter((f) => (S * f) % 100 === 0))
    const [, doGasto] = r.pick(GASTOS)
    const certa = (S * p) / 100
    return {
      enunciado: `Na pizza do salário de ${reais(S)}, a fatia ${doGasto} é de ${pct(p)}. Quanto é, em reais?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [p, 'porcentagem-como-numero-inteiro'],
        [exata(S, p), 'divide-pelo-numero-da-porcentagem'],
      ], true),
      dicas: [
        `${pct(p)} quer dizer ${p} de cada 100.`,
        `${pct(10)} de ${reais(S)} são ${reais(S / 10)}.`,
        `${pct(p)} são ${p / 10} vezes ${reais(S / 10)}: ${reais(certa)}.`,
      ],
    }
  },
}

export const lerGraficoN3: Gerador = {
  id: 'ler-grafico-n3',
  aula: 'B.U18.A2',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Da parte em reais para a fatia em %.
      const S = r.pick(SALARIOS)
      const p = r.pick(FATIAS.filter((f) => (S * f) % 100 === 0))
      const V = (S * p) / 100
      const [gasto] = r.pick(GASTOS)
      return {
        enunciado: `Dos ${reais(S)} do salário, ${reais(V)} vão para ${gasto}. Na pizza do salário, essa fatia é de quantos %?`,
        formato: 'numero',
        resposta: p,
        erros: mapa(p, [
          [V, 'parte-como-porcentagem'],
          [exata(S, V), 'divide-todo-pela-parte'],
        ], true),
        dicas: [
          'A fatia é a parte dividida pelo todo, vezes 100.',
          `Faça ${n(V)} ÷ ${n(S)}.`,
          `${n(V)} ÷ ${n(S)} = ${String(p / 100).replace('.', ',')}: ${pct(p)}.`,
        ],
      }
    }
    // A fatia que falta para fechar os 100 %.
    {
      const a = r.int(6, 9) * 5
      const b = r.int(3, 6) * 5
      // O transporte fecha a conta sem deixar o lazer igual à soma das outras fatias.
      const c = r.pick([5, 10, 15, 20].filter((x) => 100 - a - b - x > 0 && 100 - a - b - x !== a + b + x))
      const certa = 100 - a - b - c
      return {
        enunciado: `Na pizza dos gastos, o aluguel é ${pct(a)}, a comida ${pct(b)} e o transporte ${pct(c)}. O resto é lazer. Quantos % é o lazer?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[a + b + c, 'responde-outra-pergunta']], true),
        dicas: [
          `A pizza inteira é ${pct(100)}.`,
          `Some as fatias que você conhece: ${a} + ${b} + ${c} = ${a + b + c}.`,
          `100 − ${a + b + c} = ${certa}: o lazer é ${pct(certa)}.`,
        ],
      }
    }
  },
}

// ---------------------------------------------------------------- aula 3: gráficos que enganam

/** As escalas tortas e os pares de marcas (A, B) em que a altura engana: [escala, a, b, quantas vezes parece]. */
export const TORTAS: [number[], number, number, number][] = [
  [[0, 10, 20, 50, 100], 10, 50, 3],
  [[0, 10, 20, 50, 100], 10, 100, 4],
  [[0, 10, 20, 50, 100], 20, 100, 2],
  [[0, 5, 10, 50, 100], 5, 50, 3],
  [[0, 5, 10, 50, 100], 5, 100, 4],
  [[0, 5, 10, 50, 100], 10, 100, 2],
  [[0, 25, 50, 100, 200], 25, 100, 3],
  [[0, 25, 50, 100, 200], 25, 200, 4],
  [[0, 25, 50, 100, 200], 50, 200, 2],
]
const listaMarcas = (e: number[]) => `${e.slice(0, -1).join(', ')} e ${e[e.length - 1]}`

export const graficoEnganosoN1: Gerador = {
  id: 'grafico-enganoso-n1',
  aula: 'B.U18.A3',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Onde começa o eixo cortado.
      const s = r.int(4, 9) * 10
      const valores = [r.int(1, 2), r.int(2, 3), r.int(4, 5)].map((k) => s + 2 * k)
      return {
        enunciado: 'Onde começa o eixo deste gráfico? Escreva o número mais baixo dele.',
        formato: 'numero',
        resposta: s,
        erros: mapa(s, [[0, 'nao-olha-o-inicio-do-eixo']]),
        dicas: [
          'O eixo nem sempre começa no 0. Olhe o pé dele.',
          'Desça o eixo da esquerda até o fim e leia o último número.',
          `O eixo começa no ${s}: as barras mostram só o que passa do ${s}.`,
        ],
        visual: graf(
          { titulo: 'Vendas (mil R$)', dados: [['jan', valores[0]], ['fev', valores[1]], ['mar', valores[2]]], eixoInicio: s, eixoFim: s + 10, passo: 2 },
          `Três barras com os valores ${valores.join(', ')}, o eixo cortado no ${s}.`,
        ),
      }
    }
    // A escala torta, desenhada.
    const [escala, a, b, parece] = r.pick(TORTAS)
    const certa = b / a
    return {
      enunciado: 'Quantas vezes o valor de B é o de A? Leia as marcas do eixo.',
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[parece, 'nao-confere-a-escala']], true),
      dicas: [
        'As marcas estão à mesma distância, mas pulam valores diferentes. Leia os números, não a altura.',
        `A chega no ${a}; B chega no ${b}.`,
        `${b} ÷ ${a} = ${certa}: B vale ${certa} vezes A, mesmo parecendo só ${parece}.`,
      ],
      visual: graf(
        { titulo: 'Preço (R$)', dados: [['A', a], ['B', b]], escala, valores: false },
        `Duas barras na escala torta ${listaMarcas(escala)}: A em ${a}, B em ${b}.`,
      ),
    }
  },
}

export const graficoEnganosoN2: Gerador = {
  id: 'grafico-enganoso-n2',
  aula: 'B.U18.A3',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O tamanho do desenho num eixo cortado.
      const s = r.int(4, 18) * 5
      const h = r.int(1, 4)
      const k = r.int(2, 5)
      const x1 = s + h
      const x2 = s + k * h
      return {
        enunciado: `Um gráfico mostra ${x1} e ${x2}, com o eixo começando no ${s}. No desenho, a barra de ${x2} fica quantas vezes a de ${x1}?`,
        formato: 'numero',
        resposta: k,
        erros: mapa(k, [[1, 'nao-olha-o-inicio-do-eixo']], true),
        dicas: [
          `O desenho mostra só o que passa do ${s}.`,
          `As barras desenhadas: ${x1} − ${s} = ${h} e ${x2} − ${s} = ${k * h}.`,
          `${k * h} ÷ ${h} = ${k}: no desenho, ${k} vezes. De verdade, ${x2} é só ${x2 - x1} a mais que ${x1}.`,
        ],
      }
    }
    // O valor de uma barra num eixo cortado.
    const s = r.int(2, 9) * 10
    const p = r.pick([2, 5, 10])
    const h = r.int(2, 6)
    const certa = s + h * p
    return {
      enunciado: `Num gráfico, o eixo começa no ${s} e cada marca pula ${p}. A barra chega ${h} marcas acima do pé. Quanto ela vale?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[h * p, 'nao-olha-o-inicio-do-eixo'], [h, 'nao-confere-a-escala']], true),
      dicas: [
        `O pé do eixo não é o 0: é o ${s}.`,
        `${h} marcas de ${p} são ${h * p} acima do ${s}.`,
        `${s} + ${h * p} = ${certa}.`,
      ],
    }
  },
}

/** Os preços que sobem uma porcentagem inteira: [preço de A, porcentagem]. */
const PRECOS: [number, number][] = [
  [20, 10], [40, 5], [40, 10], [50, 10], [60, 5], [80, 5], [80, 10], [100, 4], [100, 6], [100, 8], [50, 4], [200, 3],
]

export const graficoEnganosoN3: Gerador = {
  id: 'grafico-enganoso-n3',
  aula: 'B.U18.A3',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 2) < 2) {
      // O anúncio com o eixo cortado: a subida de verdade, em %.
      const [a, p] = r.pick(PRECOS)
      const b = a + (a * p) / 100
      const d = b - a
      // O eixo começa num ponto em que a barra de B parece k vezes a de A.
      const ks = [2, 3, 4, 5].filter((k) => d % (k - 1) === 0)
      const k = r.pick(ks)
      const c = a - d / (k - 1)
      return {
        enunciado: `Um anúncio mostra o plano A a ${reais(a)} e o B a ${reais(b)}, com o eixo começando no ${c}. Quantos % B custa a mais que A?`,
        formato: 'numero',
        resposta: p,
        erros: mapa(p, [
          [(k - 1) * 100, 'nao-olha-o-inicio-do-eixo'],
          [d, 'parte-como-porcentagem'],
        ], true),
        dicas: [
          `O eixo começa no ${c}: no desenho, B parece ${k} vezes A. Use os números, não o desenho.`,
          `B custa ${b} − ${a} = ${d} reais a mais. Quanto é ${d} de ${a}, em %?`,
          `${d} ÷ ${a} = ${String(p / 100).replace('.', ',')}: B custa ${pct(p)} a mais.`,
        ],
      }
    }
    // A escala torta, descrita.
    const [escala, a, b, parece] = r.pick(TORTAS)
    const certa = b / a
    return {
      enunciado: `Um gráfico tem as marcas ${listaMarcas(escala)}, à mesma distância. A barra A chega no ${a}, e a B no ${b}. Quantas vezes B vale A?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[parece, 'nao-confere-a-escala']], true),
      dicas: [
        'Marcas à mesma distância com pulos diferentes: a escala é torta. Use os números.',
        `Faça ${b} ÷ ${a}.`,
        `${b} ÷ ${a} = ${certa}. Pela altura, B pareceria só ${parece} vezes A.`,
      ],
    }
  },
}

export const GERADORES_U18A: Gerador[] = [
  coordenadasN1,
  coordenadasN2,
  coordenadasN3,
  lerGraficoN1,
  lerGraficoN2,
  lerGraficoN3,
  graficoEnganosoN1,
  graficoEnganosoN2,
  graficoEnganosoN3,
]
