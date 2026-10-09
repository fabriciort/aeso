// Shared state and content of "A velocidade de um instante".

export type DerivLive = {
  /** Imagine: time of the car (s). */
  t: number
  /** Entenda: width of the interval h (s). */
  h: number
  /** Observe: instant where the tangent touches Bolt's curve (s). */
  tb: number
  /** Observe: furthest instant the tangent has visited (draws v(t)). */
  tbMax: number
}

export const DEFAULTS: DerivLive = { t: 0, h: 3, tb: 2, tbMax: 0 }

export const T0 = 5 // the instant of the car the lab is about

export interface SolveOption {
  tex: string
  say: string
  ok?: boolean
  /** Why it is wrong (shown when picked), or why it works. */
  why: string
}

export interface SolveStep {
  /** The question for this step (Legenda). */
  prompt: string
  options: SolveOption[]
  /** Line added to the caderno once the step is right. */
  line: string
  lineSay: string
}

export interface Problem {
  id: string
  /** The problem statement shown at the top of the caderno. */
  title: string
  titleSay: string
  steps: SolveStep[]
}

export const PROBLEMS: Problem[] = [
  {
    id: 'p1',
    title: 's(t) = t^2,\\quad v(5) = \\,?',
    titleSay: 'Posição t ao quadrado. Qual a velocidade em t igual a 5?',
    steps: [
      {
        prompt: 'Comece pela velocidade média entre 5 e 5 + h. Qual é a expressão?',
        options: [
          { tex: '\\frac{(5+h)^2 - 25}{h}', say: '5 mais h ao quadrado, menos 25, sobre h', ok: true, why: 'Isso: quanto andou, s(5 + h) − s(5), dividido pelo tempo que passou, h.' },
          { tex: '\\frac{(5+h)^2}{5+h}', say: '5 mais h ao quadrado sobre 5 mais h', why: 'Essa é a posição dividida pelo tempo desde a largada: a média desde o zero, a mesma armadilha do Preveja.' },
          { tex: '\\frac{25}{5}', say: '25 sobre 5', why: 'Essa é a média de 0 a 5 s. Queremos olhar perto de t = 5, entre 5 e 5 + h.' },
        ],
        line: '\\bar v = \\frac{s(5+h) - s(5)}{h} = \\frac{(5+h)^2 - 25}{h}',
        lineSay: 'velocidade média igual a 5 mais h ao quadrado, menos 25, sobre h',
      },
      {
        prompt: 'Agora expanda o quadrado (5 + h)².',
        options: [
          { tex: '25 + 10h + h^2', say: '25 mais 10 h mais h ao quadrado', ok: true, why: '(5 + h)(5 + h) = 25 + 5h + 5h + h².' },
          { tex: '25 + h^2', say: '25 mais h ao quadrado', why: 'Ótimo erro para aprender! (5 + h)² é (5 + h)(5 + h): faltam os termos do meio, 5h + 5h. Teste com h = 1: dá 36, não 26.' },
          { tex: '10 + 2h', say: '10 mais 2 h', why: 'Isso é 2·(5 + h), o dobro, não o quadrado.' },
        ],
        line: '= \\frac{25 + 10h + h^2 - 25}{h} = \\frac{10h + h^2}{h}',
        lineSay: 'igual a 10 h mais h ao quadrado, sobre h',
      },
      {
        prompt: 'Simplifique a fração. O intervalo h não é zero, então pode dividir por ele.',
        options: [
          { tex: '10 + h', say: '10 mais h', ok: true, why: '10h ÷ h = 10 e h² ÷ h = h.' },
          { tex: '10h', say: '10 h', why: 'Divida cada termo por h: 10h ÷ h = 10 e h² ÷ h = h.' },
          { tex: '10 + h^2', say: '10 mais h ao quadrado', why: 'h² ÷ h é h, não h²: sobra um h só.' },
        ],
        line: '= 10 + h',
        lineSay: 'igual a 10 mais h',
      },
      {
        prompt: 'Agora encolha o intervalo: faça h → 0. Qual é a velocidade no instante?',
        options: [
          { tex: '10\\ \\text{m/s}', say: '10 metros por segundo', ok: true, why: 'Quando h → 0, 10 + h se aproxima de 10.' },
          { tex: '\\text{não existe: } \\tfrac{0}{0}', say: 'não existe, zero sobre zero', why: 'Antes de simplificar daria 0/0. Mas 10 + h não tem mais divisão: basta ver de que valor ele se aproxima.' },
          { tex: '10 + h\\ \\text{m/s}', say: '10 mais h metros por segundo', why: 'Ainda depende de h: falta fazer h → 0.' },
        ],
        line: 'v(5) = \\lim_{h \\to 0} (10 + h) = 10\\ \\text{m/s}',
        lineSay: 'v de 5 igual ao limite de 10 mais h quando h tende a zero: 10 metros por segundo',
      },
    ],
  },
  {
    id: 'p2',
    title: 's(t) = t^2,\\quad v(t) = \\,?',
    titleSay: 'Posição t ao quadrado. Qual a velocidade num instante t qualquer?',
    steps: [
      {
        prompt: 'O mesmo, para um instante t qualquer. A média entre t e t + h vale…',
        options: [
          { tex: '2t + h', say: '2 t mais h', ok: true, why: '((t + h)² − t²) ÷ h = (2th + h²) ÷ h = 2t + h.' },
          { tex: '2t + h^2', say: '2 t mais h ao quadrado', why: 'Expanda: (t + h)² − t² = 2th + h². Dividindo por h sobra 2t + h.' },
          { tex: 't^2 + h', say: 't ao quadrado mais h', why: 'O t² se cancela: (t + h)² − t² = 2th + h².' },
        ],
        line: '\\frac{(t+h)^2 - t^2}{h} = \\frac{2th + h^2}{h} = 2t + h',
        lineSay: 't mais h ao quadrado, menos t ao quadrado, sobre h, é igual a 2 t mais h',
      },
      {
        prompt: 'E quando h → 0?',
        options: [
          { tex: '2t', say: '2 t', ok: true, why: 'Sobra 2t: uma fórmula que dá a velocidade em qualquer instante.' },
          { tex: '2', say: '2', why: 'O t continua: a velocidade depende do instante. Em t = 5 dá 10, lembra?' },
          { tex: 't^2', say: 't ao quadrado', why: 't² é a posição. A velocidade é como ela muda: 2t.' },
        ],
        line: "s'(t) = 2t \\quad\\Rightarrow\\quad v(5) = 2 \\cdot 5 = 10",
        lineSay: 'a derivada de s é 2 t. Em 5, dá 10',
      },
    ],
  },
  {
    id: 'p3',
    title: 's(t) = 3t^2 + t,\\quad v(2) = \\,?',
    titleSay: 'Posição 3 t ao quadrado mais t. Qual a velocidade em t igual a 2?',
    steps: [
      {
        prompt: 'Agora sozinho: um carrinho com s(t) = 3t² + t. Qual a velocidade em t = 2 s?',
        options: [
          { tex: '13\\ \\text{m/s}', say: '13 metros por segundo', ok: true, why: 'A média dá 13 + 3h, que vai a 13. Atalho: 3·(2t) + 1 = 6t + 1 = 13.' },
          { tex: '12\\ \\text{m/s}', say: '12 metros por segundo', why: 'Quase! A parte 3t² dá 12, mas o "+ t" também anda: soma 1 m/s.' },
          { tex: '14\\ \\text{m/s}', say: '14 metros por segundo', why: '14 m é a posição em t = 2, não a velocidade.' },
          { tex: '7\\ \\text{m/s}', say: '7 metros por segundo', why: '14 ÷ 2 = 7 é a média desde a largada, a armadilha de novo.' },
        ],
        line: '\\frac{s(2+h) - s(2)}{h} = 13 + 3h \\;\\to\\; 13\\ \\text{m/s}',
        lineSay: 'a média é 13 mais 3 h, que tende a 13 metros por segundo',
      },
    ],
  },
]

export const cubicPosition = (t: number) => 3 * t * t + t

export interface Challenge {
  id: string
  q: string
  options: string[]
  answer: number
  explain: string
}

export const CHALLENGES: Challenge[] = [
  {
    id: 'zero',
    q: 'Em t = 0 o velocímetro do carro marca 0 (2·0 = 0). Então, naquele instante, ele está…',
    options: ['Parado para sempre', 'Prestes a andar', 'Andando para trás', 'Sem velocidade definida'],
    answer: 1,
    explain: 'Velocidade zero num instante não é ficar parado: a tangente é horizontal, mas a curva já começa a subir logo depois.',
  },
  {
    id: 'bico',
    q: 'A curva y = |x| tem um bico em x = 0. Qual é a inclinação dela ali?',
    options: ['0', '1', '−1', 'Não existe'],
    answer: 3,
    explain: 'À esquerda a inclinação é −1; à direita, +1. Por mais zoom que você dê, o bico nunca vira uma reta: não há derivada ali.',
  },
  {
    id: 'aceleracao',
    q: 'A velocidade do carro é v(t) = 2t. Qual é a derivada dela, a taxa com que a velocidade muda?',
    options: ['2 m/s²', '2t m/s²', 't² m/s²', '0'],
    answer: 0,
    explain: 'A cada segundo a velocidade sobe 2 m/s: é a aceleração, 2 m/s². A derivada da derivada mede como a mudança muda.',
  },
]
