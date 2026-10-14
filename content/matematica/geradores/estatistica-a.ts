import type { Gerador, Rng, Visual } from '@/lib/formation/schema'

// Unidade 19: estatística (aulas 1 a 3). Média, mediana e moda; quando a
// média engana (o valor que destoa e a amplitude); desvio padrão, a ideia.
// Os números vão com vírgula decimal e ponto de milhar (32,5; 1.000), o
// desvio com o sinal de menos verdadeiro (−3) e as unidades com o espaço que
// não quebra (500 mg, R$ 6 mil). Respostas decimais são escritas como o aluno
// digita ('32,5'); as chaves do mapa `erros` também ('4,5', '-3'). No nível
// 1, o visual é o gráfico de pontos (`dados`), sem a resposta desenhada. O
// desvio padrão divide pela quantidade de valores (n), como na aula, e os
// conjuntos são feitos de desvios com raiz exata.

// ---------------------------------------------------------------- ajudas

/** O espaço que não quebra, entre o número e a unidade. */
const NB = ' '
const arred = (x: number) => Math.round(x * 1e6) / 1e6
/** Para a tela: vírgula decimal, ponto de milhar e o menos verdadeiro: 32,5; 1.000; −3. */
function n(x: number): string {
  x = arred(x)
  if (x < 0) return `−${n(-x)}`
  const [int, dec] = String(x).split('.')
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${dec ? `,${dec}` : ''}`
}
/** O desvio com sinal: +3, −1, 0. */
const comSinal = (d: number) => (d > 0 ? `+${n(d)}` : n(d))
/** A resposta como o aluno digita: inteiro como número, decimal com vírgula. */
const resp = (x: number): number | string => (Number.isInteger(arred(x)) ? arred(x) : String(arred(x)).replace('.', ','))
/** A chave do mapa de erros: '-3', '4,5'. */
const chave = (x: number) => String(arred(x)).replace('.', ',')
/** Só números que se digitam com até 2 casas viram erro previsível. */
const digitavel = (x: number) => Number.isFinite(x) && Math.abs(Math.round(x * 100) - x * 100) < 1e-6

/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number, pares: [number | null, string][], positivos = true): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([chave(certa)])
  for (const [valor, erro] of pares) {
    if (valor === null || !digitavel(valor)) continue
    if (positivos && valor < 0) continue
    const k = chave(valor === 0 ? 0 : valor)
    if (vistos.has(k)) continue
    vistos.add(k)
    erros[k] = erro
  }
  return erros
}

/** Junta na tela: "a, b e c". */
const juntar = (xs: string[]) => `${xs.slice(0, -1).join(', ')} e ${xs[xs.length - 1]}`
/** A lista na tela: "8, 2, 5, 2 e 3". */
const lista = (vs: number[], un = '') => `${juntar(vs.map(n))}${un ? `${NB}${un}` : ''}`
/** Embaralha com o rng (Fisher-Yates). */
function embaralhar<T>(r: Rng, xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const soma = (v: number[]) => v.reduce((a, b) => a + b, 0)
const media = (v: number[]) => arred(soma(v) / v.length)
const fila = (v: number[]) => [...v].sort((a, b) => a - b)
function mediana(v: number[]): number {
  const o = fila(v)
  const m = o.length / 2
  return o.length % 2 ? o[Math.floor(m)] : arred((o[m - 1] + o[m]) / 2)
}
/** Quantas vezes cada valor aparece. */
const contagem = (v: number[]) => v.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map<number, number>())
/** A moda, quando um valor só aparece mais que todos; senão, null. */
function modaUnica(v: number[]): number | null {
  const c = [...contagem(v).entries()].sort((a, b) => b[1] - a[1])
  return c.length && c[0][1] > 1 && (c.length === 1 || c[0][1] > c[1][1]) ? c[0][0] : null
}
/** A média dos valores diferentes, cada um contado uma vez (o erro dos repetidos). */
const mediaSemRepetidos = (v: number[]) => media([...new Set(v)])
/** O meio da lista como veio, sem pôr em fila. */
function meioDaLista(v: number[]): number {
  const m = v.length / 2
  return v.length % 2 ? v[Math.floor(m)] : arred((v[m - 1] + v[m]) / 2)
}

const dados = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'dados', estado, esboco })

// ---------------------------------------------------------------- aula 1: média, mediana e moda

/** n valores de [lo, hi] cuja soma é múltipla de n (a média sai inteira). */
function comMediaInteira(r: Rng, quantos: number, lo: number, hi: number): number[] {
  const v = Array.from({ length: quantos - 1 }, () => r.int(lo, hi))
  const s = soma(v)
  const ultimos: number[] = []
  for (let x = lo; x <= hi; x++) if ((s + x) % quantos === 0) ultimos.push(x)
  return embaralhar(r, [...v, r.pick(ultimos)])
}
/** n valores de [lo, hi] com uma moda só, que aparece `vezes` vezes; os outros, no máximo vezes − 1. */
function comModa(r: Rng, quantos: number, lo: number, hi: number, vezes: number): { v: number[]; moda: number } {
  const moda = r.int(lo, hi)
  const outros: number[] = []
  for (let x = lo; x <= hi; x++) if (x !== moda) for (let k = 0; k < vezes - 1; k++) outros.push(x)
  const resto = embaralhar(r, outros).slice(0, quantos - vezes)
  return { v: embaralhar(r, [...Array(vezes).fill(moda), ...resto]), moda }
}

const DICAS_MEDIA = (v: number[]): [string, string, string] => [
  'A média é a soma dividida pela quantidade.',
  `São ${v.length} valores. Some todos, contando os repetidos: ${v.map(n).join(' + ')}.`,
  `${n(soma(v))} ÷ ${v.length} = ${n(media(v))}.`,
]
const DICAS_MEDIANA = (v: number[]): [string, string, string] => {
  const o = fila(v)
  const m = o.length / 2
  return [
    'A mediana é o valor do meio, com os valores em fila.',
    `Em fila, do menor ao maior: ${o.map(n).join(', ')}.`,
    o.length % 2
      ? `O do meio é o ${Math.ceil(m)}º: ${n(mediana(v))}.`
      : `Ficam dois no meio, ${n(o[m - 1])} e ${n(o[m])}: (${n(o[m - 1])} + ${n(o[m])}) ÷ 2 = ${n(mediana(v))}.`,
  ]
}

export const mediaMedianaModaN1: Gerador = {
  id: 'media-mediana-moda-n1',
  aula: 'B.U19.A1',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      const v = comMediaInteira(r, r.int(4, 6), 2, 10)
      const certa = media(v)
      return {
        enunciado: 'Cada ponto é a nota de um aluno numa prova. Qual é a média das notas?',
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [mediaSemRepetidos(v), 'media-esquece-valores'],
          [(Math.min(...v) + Math.max(...v)) / 2, 'media-do-menor-e-do-maior'],
          [mediana(v), 'troca-media-mediana-moda'],
        ]),
        dicas: DICAS_MEDIA(v),
        visual: dados({ valores: v, titulo: 'Notas da prova' }, `${v.length} notas como pontos sobre a reta, sem a média desenhada.`),
      }
    }
    if (tipo === 1) {
      const v = Array.from({ length: r.pick([5, 7]) }, () => r.int(1, 10))
      const certa = mediana(v)
      const mo = modaUnica(v)
      return {
        enunciado: 'Cada ponto é a nota de um aluno numa prova. Qual é a mediana das notas?',
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [media(v), 'troca-media-mediana-moda'],
          [mo, 'troca-media-mediana-moda'],
          [(Math.min(...v) + Math.max(...v)) / 2, 'media-do-menor-e-do-maior'],
        ]),
        dicas: DICAS_MEDIANA(v),
        visual: dados({ valores: v, titulo: 'Notas da prova' }, `${v.length} notas como pontos sobre a reta, sem a mediana marcada.`),
      }
    }
    const { v, moda } = comModa(r, r.int(6, 8), 1, 10, 3)
    return {
      enunciado: 'Cada ponto é a nota de um aluno numa prova. Qual é a moda das notas?',
      formato: 'numero',
      resposta: moda,
      erros: mapa(moda, [
        [Math.max(...v), 'moda-e-o-maior-valor'],
        [3, 'moda-como-frequencia'],
        [mediana(v), 'troca-media-mediana-moda'],
      ]),
      dicas: ['A moda é o valor que mais aparece: no desenho, a pilha mais alta.', 'Procure a pilha com mais pontos e leia o número embaixo dela, na reta.', `A pilha do ${n(moda)} tem 3 pontos: a moda é ${n(moda)}.`],
      visual: dados({ valores: v, titulo: 'Notas da prova' }, `${v.length} notas como pontos; a pilha mais alta, de 3 pontos, no ${moda}.`),
    }
  },
}

/** O que se conta, em listas pequenas (de 0 a 12). */
const CONTAGENS = ['Os gols de um time', 'As faltas de um aluno', 'Os pães que uma família comprou', 'As horas de estudo de Rita', 'Os clientes de um salão']
const QUANDO = ['jogos', 'meses', 'dias', 'semanas', 'horas']

export const mediaMedianaModaN2: Gerador = {
  id: 'media-mediana-moda-n2',
  aula: 'B.U19.A1',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    const i = r.int(0, CONTAGENS.length - 1)
    if (tipo === 0) {
      // A mediana com quantidade par: a média dos dois do meio (que pode dar ,5).
      const v = Array.from({ length: r.pick([4, 6]) }, () => r.int(0, 12))
      const o = fila(v)
      const m = v.length / 2
      const certa = mediana(v)
      return {
        enunciado: `${CONTAGENS[i]} em ${v.length} ${QUANDO[i]}: ${lista(v)}. Qual é a mediana?`,
        formato: 'numero',
        resposta: resp(certa),
        erros: mapa(certa, [
          [o[m - 1], 'mediana-par-pega-um-do-meio'],
          [o[m], 'mediana-par-pega-um-do-meio'],
          [meioDaLista(v), 'mediana-sem-ordenar'],
        ]),
        dicas: DICAS_MEDIANA(v),
      }
    }
    if (tipo === 1) {
      // A média com valores repetidos: cada um conta.
      const quantos = r.int(5, 6)
      let v = comMediaInteira(r, quantos, 0, 12)
      if (new Set(v).size === v.length) {
        // Sem repetido: repete um valor no lugar de outro e corrige a soma com um terceiro.
        const o = fila(v)
        const [a, b] = [o[0], o[1]]
        v = embaralhar(r, [a, a, ...o.slice(2, -1), o[o.length - 1] + (b - a)])
      }
      const certa = media(v)
      return {
        enunciado: `${CONTAGENS[i]} em ${v.length} ${QUANDO[i]}: ${lista(v)}. Qual é a média?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [mediaSemRepetidos(v), 'media-esquece-valores'],
          [mediana(v), 'troca-media-mediana-moda'],
        ]),
        dicas: DICAS_MEDIA(v),
      }
    }
    // A mediana de uma lista fora de ordem: o meio da lista não é o meio da fila.
    const quantos = r.pick([5, 7])
    let v = [8, 2, 5, 2, 3]
    for (let t = 0; t < 20; t++) {
      const w = Array.from({ length: quantos }, () => r.int(0, 12))
      if (meioDaLista(w) !== mediana(w)) {
        v = w
        break
      }
    }
    const certa = mediana(v)
    return {
      enunciado: `${CONTAGENS[i]} em ${v.length} ${QUANDO[i]}: ${lista(v)}. Qual é a mediana?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [meioDaLista(v), 'mediana-sem-ordenar'],
        [media(v), 'troca-media-mediana-moda'],
      ]),
      dicas: DICAS_MEDIANA(v),
    }
  },
}

const NOMES = ['Bia', 'Caio', 'Dora', 'Edu', 'Fátima', 'Gil', 'Iara', 'João']
const ORDINAL = ['', 'primeira', 'segunda', 'terceira', 'quarta', 'quinta']
const NUMERAL = ['', 'uma', 'duas', 'três', 'quatro', 'cinco']

export const mediaMedianaModaN3: Gerador = {
  id: 'media-mediana-moda-n3',
  aula: 'B.U19.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // A nota que falta para a média.
      const k = r.int(3, 4)
      let v: number[] = []
      let alvo = 0
      let falta = -1
      for (const m of embaralhar(r, [6, 7, 8])) {
        const w = Array.from({ length: k }, () => r.int(5, 10))
        const x = (k + 1) * m - soma(w)
        if (x >= 0 && x <= 10) {
          ;[v, alvo, falta] = [w, m, x]
          break
        }
      }
      if (falta < 0) [v, alvo, falta] = [Array(k).fill(7), 7, 7]
      const nome = r.pick(NOMES)
      return {
        enunciado: `${nome} tirou ${lista(v)} nas ${NUMERAL[k]} primeiras provas. Quanto precisa tirar na ${ORDINAL[k + 1]} para ficar com média ${alvo}?`,
        formato: 'numero',
        resposta: falta,
        erros: mapa(falta, [
          [alvo, 'responde-outra-pergunta'],
          [k * alvo - soma(v), 'media-esquece-valores'],
        ]),
        dicas: [
          `Média ${alvo} em ${k + 1} provas quer dizer que a soma das ${k + 1} notas é ${k + 1} × ${alvo}.`,
          `A soma tem de dar ${(k + 1) * alvo}. As ${NUMERAL[k]} primeiras já somam ${soma(v)}.`,
          `${(k + 1) * alvo} − ${soma(v)} = ${falta}.`,
        ],
      }
    }
    if (tipo === 1) {
      // O total a partir da média.
      const q = r.int(4, 9)
      const m = r.pick([15, 20, 25, 30, 35, 40, 45])
      const certa = q * m
      return {
        enunciado: `A média de ${q} entregas foi de ${m}${NB}minutos. Quantos minutos as ${q} entregas somaram?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [q + m, 'soma-no-lugar-de-multiplicar'],
          [m, 'responde-outra-pergunta'],
        ]),
        dicas: ['A média é a soma dividida pela quantidade. Então a soma é a média vezes a quantidade.', `Soma ÷ ${q} = ${m}. Que soma é essa?`, `${q} × ${m} = ${certa} minutos.`],
      }
    }
    // A média de números maiores, num contexto.
    const v = comMediaInteira(r, 5, 80, 150)
    const certa = media(v)
    return {
      enunciado: `Uma padaria vendeu ${lista(v)} pães em 5 dias. Quantos pães por dia, na média?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [(Math.min(...v) + Math.max(...v)) / 2, 'media-do-menor-e-do-maior'],
        [mediana(v), 'troca-media-mediana-moda'],
        [soma(v), 'responde-outra-pergunta'],
      ]),
      dicas: DICAS_MEDIA(v),
    }
  },
}

// ---------------------------------------------------------------- aula 2: quando a média engana

/** Salários comuns (de 2 a 5 mil) e um que destoa (de 15 a 30 mil). */
function comDestoante(r: Rng, comuns: number): { v: number[]; alto: number } {
  const alto = r.int(15, 30)
  return { v: embaralhar(r, [...Array.from({ length: comuns }, () => r.int(2, 5)), alto]), alto }
}

export const mediaEnganaN1: Gerador = {
  id: 'media-engana-n1',
  aula: 'B.U19.A2',
  nivel: 1,
  gerar(r) {
    const { v, alto } = comDestoante(r, r.pick([4, 6]))
    const visual = dados({ valores: v, unidade: 'mil R$', titulo: 'Salários' }, `${v.length} salários como pontos: ${v.length - 1} juntos entre 2 e 5 mil e um sozinho no ${alto}.`)
    if (r.int(0, 1) === 0) {
      const certa = mediana(v)
      return {
        enunciado: 'Cada ponto é um salário de uma firma, em mil reais. Qual é a mediana, em mil reais?',
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [media(v), 'usa-sempre-a-media'],
          [alto, 'mediana-segue-o-extremo'],
        ]),
        dicas: DICAS_MEDIANA(v),
        visual,
      }
    }
    const menor = Math.min(...v)
    const certa = alto - menor
    return {
      enunciado: 'Cada ponto é um salário de uma firma, em mil reais. Qual é a amplitude, em mil reais?',
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[alto, 'amplitude-e-o-maior-valor']]),
      dicas: ['A amplitude é o maior valor menos o menor.', `O maior salário é ${alto} mil; o menor, ${menor} mil.`, `${alto} − ${menor} = ${certa} mil.`],
      visual,
    }
  },
}

const LOJAS = ['Loja A', 'Loja B'] as const

export const mediaEnganaN2: Gerador = {
  id: 'media-engana-n2',
  aula: 'B.U19.A2',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo <= 1) {
      // O maior salário muda: a média anda, a mediana não.
      const v = embaralhar(r, [...Array.from({ length: 4 }, () => r.int(2, 5)), r.int(6, 8)])
      const x = Math.max(...v)
      const pedeMedia = tipo === 1
      // Para a nova média sair inteira, o aumento deixa a soma múltipla de 5.
      const aumentos: number[] = []
      for (let d = 10; d <= 25; d++) if (!pedeMedia || (soma(v) + d) % 5 === 0) aumentos.push(d)
      const d = r.pick(aumentos)
      const y = x + d
      const novos = v.map((s, i) => (i === v.indexOf(x) ? y : s))
      const med = mediana(v)
      const certa = pedeMedia ? media(novos) : med
      return {
        enunciado: `Salários de uma firma, em mil reais: ${lista(v)}. O de ${x} mil passa para ${y} mil. Qual é a nova ${pedeMedia ? 'média' : 'mediana'}?`,
        formato: 'numero',
        resposta: resp(certa),
        erros: pedeMedia
          ? mapa(certa, [[med, 'troca-media-mediana-moda']])
          : mapa(certa, [
              [med + d, 'mediana-segue-o-extremo'],
              [media(novos), 'usa-sempre-a-media'],
            ]),
        dicas: pedeMedia
          ? ['A média usa todos os valores: a soma muda, e a média muda junto.', `A soma era ${soma(v)}. Com o aumento de ${d}, passa a ${soma(novos)}.`, `${soma(novos)} ÷ 5 = ${n(certa)} mil.`]
          : ['A mediana é o do meio da fila. O maior continua no fim da fila.', `Em fila: ${fila(novos).map(n).join(', ')}.`, `O do meio continua ${n(med)}: a mediana não muda.`],
      }
    }
    // Duas lojas com a mesma média: qual se espalha mais?
    const m = r.int(20, 30)
    const perto = embaralhar(r, r.pick([[-1, 1, -2, 2], [-1, 0, 1, 0], [-2, 1, 1, 0]]))
    const k = r.int(2, 3)
    const longe = embaralhar(r, r.pick([[-6, 6, -3, 3], [-4, -4, 4, 4], [-5, 5, -2, 2]])).map((x) => x * k)
    const a = perto.map((x) => m + x)
    const b = longe.map((x) => m + x)
    const largaPrimeiro = r.int(0, 1) === 0
    const [va, vb] = largaPrimeiro ? [b, a] : [a, b]
    const certa = largaPrimeiro ? 0 : 1
    const erros: Record<string, string> = { '2': 'usa-sempre-a-media' }
    return {
      enunciado: `Pães vendidos em 4 dias. ${LOJAS[0]}: ${lista(va)}. ${LOJAS[1]}: ${lista(vb)}. As duas têm média ${m}. Qual se espalha mais?`,
      formato: 'escolha',
      opcoes: [`A ${LOJAS[0]}`, `A ${LOJAS[1]}`, 'As duas espalham igual'],
      resposta: certa,
      erros,
      dicas: [
        'A mesma média não quer dizer o mesmo espalhamento. Compare a amplitude: o maior menos o menor.',
        `${LOJAS[0]}: ${Math.max(...va)} − ${Math.min(...va)}. ${LOJAS[1]}: ${Math.max(...vb)} − ${Math.min(...vb)}.`,
        `A ${LOJAS[certa]} tem amplitude ${Math.max(...(certa ? vb : va)) - Math.min(...(certa ? vb : va))}: ela se espalha mais.`,
      ],
    }
  },
}

/** Situações em que um resumo serve melhor: a mediana, com um valor que destoa; a moda, para o mais pedido. */
const SITUACOES: { texto: string; certa: 1 | 2 }[] = [
  { texto: `Numa rua, 4 casas custam perto de R$${NB}200 mil e uma mansão, R$${NB}3 milhões. Que resumo diz o preço comum de uma casa?`, certa: 1 },
  { texto: `Numa firma, 9 pessoas ganham de R$${NB}2 mil a R$${NB}3 mil, e o dono, R$${NB}40 mil. Que resumo diz o salário comum?`, certa: 1 },
  { texto: 'Rui leva uns 30 minutos até o trabalho. Num dia de acidente, levou 2 horas. Que resumo diz o tempo comum da viagem?', certa: 1 },
  { texto: 'Uma loja quer saber qual número de sapato vende mais, para encomendar mais dele. Que resumo ela usa?', certa: 2 },
  { texto: 'Uma feira quer saber qual tamanho de camiseta é o mais pedido. Que resumo ela usa?', certa: 2 },
  { texto: 'Uma escola quer saber o sabor de suco que os alunos mais escolhem. Que resumo ela usa?', certa: 2 },
]
const RESUMOS = ['A média', 'A mediana', 'A moda']

export const mediaEnganaN3: Gerador = {
  id: 'media-engana-n3',
  aula: 'B.U19.A2',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const s = r.pick(SITUACOES)
      const outra = s.certa === 1 ? 2 : 1
      return {
        enunciado: s.texto,
        formato: 'escolha',
        opcoes: [...RESUMOS],
        resposta: s.certa,
        erros: { '0': 'usa-sempre-a-media', [String(outra)]: 'troca-media-mediana-moda' },
        dicas:
          s.certa === 1
            ? ['Um valor muito longe dos outros puxa a média para o lado dele.', 'A mediana é o do meio da fila: o valor que destoa fica na ponta e não mexe nela.', 'A mediana diz o valor comum quando um valor destoa.']
            : ['A pergunta é qual aparece mais vezes.', 'O valor que mais aparece tem um nome: a moda.', 'A moda: o tamanho (ou o sabor) mais pedido.'],
      }
    }
    // A mediana de tempos de viagem com um dia que destoa, fora de ordem.
    const quantos = r.pick([5, 7])
    const base = r.int(25, 45)
    const comuns = Array.from({ length: quantos - 1 }, () => base + r.int(-5, 5))
    const alto = r.int(90, 150)
    let v = embaralhar(r, [...comuns, alto])
    // O meio da lista como veio não pode ser a mediana (senão o erro de não ordenar não aparece).
    if (meioDaLista(v) === mediana(v)) {
      const meio = Math.floor(quantos / 2)
      const j = v.indexOf(alto)
      v = v.map((x, k) => (k === meio ? alto : k === j ? v[meio] : x))
    }
    const certa = mediana(v)
    return {
      enunciado: `Os minutos de viagem de Rui até o trabalho em ${quantos} dias: ${lista(v)}. Qual é a mediana, em minutos?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [media(v), 'usa-sempre-a-media'],
        [meioDaLista(v), 'mediana-sem-ordenar'],
      ]),
      dicas: DICAS_MEDIANA(v),
    }
  },
}

// ---------------------------------------------------------------- aula 3: desvio padrão

/** Desvios que somam 0 e cuja média dos quadrados tem raiz exata (o desvio padrão), e as escalas que valem. */
export const MOLDES: { d: number[]; escalas: number[] }[] = [
  { d: [-3, -1, 0, 1, 3], escalas: [1, 2] }, // 2, 4
  { d: [-1, 1, -7, 7], escalas: [1] }, // 5
  { d: [-1, 1, -1, 1], escalas: [2, 3] }, // 2, 3 (com 1, o quadrado e a raiz dariam o mesmo)
  { d: [-4, 1, 1, 1, 1], escalas: [1, 2] }, // 2, 4
  { d: [-8, 2, 2, 2, 2], escalas: [1] }, // 4
  { d: [-2, -2, -1, 0, 0, 1, 2, 2], escalas: [1, 2] }, // 1,5 e 3
  { d: [-9, -3, 0, 3, 9], escalas: [1] }, // 6
  { d: [-6, -2, 0, 2, 6], escalas: [1] }, // 4
]
/** Um conjunto de desvios, embaralhado. `minimo`: só os de desvio padrão a partir dele. */
function desviosDe(r: Rng, minimo = 0): number[] {
  const opcoes = MOLDES.flatMap((m) => m.escalas.map((k) => m.d.map((x) => x * k))).filter((d) => dp(d) >= minimo)
  return embaralhar(r, r.pick(opcoes))
}
const variancia = (d: number[]) => arred(soma(d.map((x) => x * x)) / d.length)
const dp = (d: number[]) => arred(Math.sqrt(variancia(d)))
const distMedia = (d: number[]) => arred(soma(d.map(Math.abs)) / d.length)

/** O que se pesa ou se mede no controle de qualidade. */
const PRODUTOS = [
  { cada: 'Cada ponto é um comprimido', varios: 'Comprimidos', un: 'mg', bases: [250, 500] },
  { cada: 'Cada ponto é uma garrafa', varios: 'Garrafas', un: 'mL', bases: [500, 1000] },
  { cada: 'Cada ponto é um pacote de café', varios: 'Pacotes de café', un: 'g', bases: [250, 500] },
]

const errosDp = (d: number[]): Record<string, string> =>
  mapa(dp(d), [
    [variancia(d), 'desvio-padrao-sem-a-raiz'],
    [distMedia(d), 'desvio-padrao-sem-o-quadrado'],
    [variancia(d) / 2, 'raiz-e-a-metade'],
  ])
const dicasDp = (d: number[]): [string, string, string] => [
  'O desvio padrão: eleve cada desvio ao quadrado, faça a média dos quadrados e tire a raiz.',
  `Os quadrados: ${d.map((x) => n(x * x)).join(', ')}. Eles somam ${n(soma(d.map((x) => x * x)))}.`,
  `${n(soma(d.map((x) => x * x)))} ÷ ${d.length} = ${n(variancia(d))}, e a raiz de ${n(variancia(d))} é ${n(dp(d))}.`,
]

export const desvioPadraoN1: Gerador = {
  id: 'desvio-padrao-n1',
  aula: 'B.U19.A3',
  nivel: 1,
  gerar(r) {
    const p = r.pick(PRODUTOS)
    const base = r.pick(p.bases)
    const d = desviosDe(r)
    const v = d.map((x) => base + x)
    const visual = dados({ valores: v, unidade: p.un, media: true }, `${v.length} ${p.varios.toLowerCase()} como pontos sobre a reta, com o apoio na média, ${base} ${p.un}. Sem os desvios desenhados.`)
    if (r.int(0, 2) > 0) {
      // O desvio de um valor (mais vezes um abaixo da média, o caso do sinal).
      const negativos = d.filter((x) => x < 0)
      const di = r.int(0, 2) > 0 && negativos.length ? r.pick(negativos) : r.pick(d.filter((x) => x !== 0))
      const valor = base + di
      return {
        enunciado: `${p.cada}, em ${p.un}. A média é ${n(base)}${NB}${p.un}. Qual é o desvio do de ${n(valor)}${NB}${p.un}?`,
        formato: 'numero',
        resposta: di,
        sinal: true,
        erros: mapa(di, di < 0 ? [[-di, 'esquece-sinal-do-resultado']] : [], false),
        dicas: [
          'O desvio é o valor menos a média. Abaixo da média, ele é negativo.',
          `${n(valor)} − ${n(base)}: o ponto fica ${di < 0 ? 'à esquerda' : 'à direita'} do apoio.`,
          `${n(valor)} − ${n(base)} = ${n(di)}.`,
        ],
        visual,
      }
    }
    const certa = 0
    return {
      enunciado: `${p.cada}, em ${p.un}. Quanto dá a soma de todos os desvios até a média?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [[soma(d.map(Math.abs)), 'soma-desvios-sem-sinal']]),
      dicas: [
        'Os desvios dos que ficam abaixo da média são negativos; os de cima, positivos.',
        `Os desvios: ${d.map(comSinal).join(', ')}. Os de baixo cancelam os de cima.`,
        'A média é o ponto de equilíbrio: a soma dos desvios dá 0, sempre.',
      ],
      visual,
    }
  },
}

export const desvioPadraoN2: Gerador = {
  id: 'desvio-padrao-n2',
  aula: 'B.U19.A3',
  nivel: 2,
  gerar(r) {
    const d = desviosDe(r)
    const certa = dp(d)
    return {
      enunciado: `Os desvios até a média são ${juntar(d.map(comSinal))}. Qual é o desvio padrão?`,
      formato: 'numero',
      resposta: resp(certa),
      erros: errosDp(d),
      dicas: dicasDp(d),
    }
  },
}

export const desvioPadraoN3: Gerador = {
  id: 'desvio-padrao-n3',
  aula: 'B.U19.A3',
  nivel: 3,
  gerar(r) {
    const p = r.pick(PRODUTOS)
    const quem = p.varios
    if (r.int(0, 1) === 0) {
      // O desvio padrão a partir dos valores, sem a média dada.
      const d = desviosDe(r)
      // Com 8 valores, a base de 1.000 deixa o enunciado longo demais.
      const base = d.length > 5 ? p.bases[0] : r.pick(p.bases)
      const v = d.map((x) => base + x)
      const certa = dp(d)
      return {
        enunciado: `${quem} de ${n(base)}${NB}${p.un}. As medidas: ${lista(v, p.un)}. Qual é o desvio padrão, em ${p.un}?`,
        formato: 'numero',
        resposta: resp(certa),
        erros: errosDp(d),
        dicas: [
          'Primeiro a média; depois os desvios, os quadrados, a média dos quadrados e a raiz.',
          `A média é ${n(soma(v))} ÷ ${v.length} = ${n(base)}. Os desvios: ${d.map(comSinal).join(', ')}.`,
          dicasDp(d)[2],
        ],
      }
    }
    // O lote passou no controle? Os desvios com desvio padrão de pelo menos 1,5, para o limite caber entre a raiz e o quadrado.
    const d = desviosDe(r, 1.5)
    const base = d.length > 5 ? p.bases[0] : r.pick(p.bases)
    const v = d.map((x) => base + x)
    const s = dp(d)
    const vr = variancia(d)
    const passa = r.int(0, 1) === 0
    // Passa: o limite fica entre o desvio padrão e o quadrado dele (quem esquece a raiz reprova o lote).
    const limites: number[] = []
    for (let L = 1; L <= 12; L++) if (passa ? L >= s && L < vr : L < s) limites.push(L)
    const L = r.pick(limites)
    return {
      enunciado: `${quem} de ${n(base)}${NB}${p.un}: ${lista(v)}. O controle aceita desvio padrão de até ${L}${NB}${p.un}. O lote passou?`,
      formato: 'escolha',
      opcoes: ['Passou', 'Reprovou'],
      resposta: passa ? 0 : 1,
      erros: (passa ? { '1': 'desvio-padrao-sem-a-raiz' } : { '0': 'usa-sempre-a-media' }) as Record<string, string>,
      dicas: [
        `A média é ${n(base)}${NB}${p.un}, mas a média sozinha não decide. Ache o desvio padrão e compare com ${L}.`,
        `Os desvios: ${d.map(comSinal).join(', ')}. A média dos quadrados é ${n(vr)}.`,
        `O desvio padrão é a raiz de ${n(vr)}: ${n(s)}${NB}${p.un}. ${passa ? `Até ${L}: passou.` : `Mais que ${L}: reprovou.`}`,
      ],
    }
  },
}

export const GERADORES_U19A: Gerador[] = [
  mediaMedianaModaN1,
  mediaMedianaModaN2,
  mediaMedianaModaN3,
  mediaEnganaN1,
  mediaEnganaN2,
  mediaEnganaN3,
  desvioPadraoN1,
  desvioPadraoN2,
  desvioPadraoN3,
]
