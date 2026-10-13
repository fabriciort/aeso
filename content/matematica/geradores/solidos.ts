import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 17: sólidos e volume. Aula 1, planificações; aula 2, volume de
// prismas e cilindros; aula 3, área de superfície.
//
// O teclado só digita números. As medidas vêm em negrito no enunciado, com
// a unidade e o espaço que não quebra (5 cm, 12 m²). As contas com π usam
// 3,14 e dão decimais com vírgula (219,8); elas são feitas em centésimos,
// com inteiros, para não carregar erros de arredondamento. Nos textos, o
// milhar leva ponto (1.200); na resposta, como o aluno digita, não (o
// teclado ignora os pontos). Nenhuma resposta é negativa: os itens não levam
// a tecla do menos.

// ---------------------------------------------------------------- ferramentas

/** O espaço que não quebra: 5 cm e 12 m² ficam na mesma linha. */
const NB = ' '
const med = (n: number | string, u: string) => `${n}${NB}${u}`
const neg = (n: number | string, u: string) => `**${med(n, u)}**`

const milhar = (i: number) => String(i).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** Centésimos como texto: 120000 → '1.200'; 2512 → '25,12'; 6280 → '62,8'. */
function txt(c: number): string {
  const i = Math.floor(c / 100)
  const r = c % 100
  if (r === 0) return milhar(i)
  return `${milhar(i)},${String(r).padStart(2, '0').replace(/0$/, '')}`
}
/** O mesmo, em TeX: 25{,}12. */
const tx = (c: number) => txt(c).replace(',', '{,}')
/** A resposta em centésimos, como o aluno digita: um número se for inteiro, o texto com vírgula (sem o ponto do milhar) se não. */
const resp = (c: number) => (c % 100 === 0 ? c / 100 : txt(c).replace(/\./g, ''))
/** Uma medida em metros a partir de decímetros: 15 → '1,5'. */
const dm = (d: number) => txt(d * 10)

/** Erros previsíveis (como o aluno digitaria), sem a certa e sem repetir. Os valores vêm em centésimos. */
function mapaC(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (!Number.isInteger(valor) || valor <= 0 || valor === certa) continue
    const k = String(resp(valor))
    if (k in erros) continue
    erros[k] = erro
  }
  return erros
}
/** O mesmo, para inteiros. */
const mapa = (certa: number, pares: [number, string][]) => mapaC(certa * 100, pares.map(([v, e]) => [v * 100, e]))

/** Embaralha com o rng (Fisher–Yates). */
function embaralha<T>(r: Rng, xs: T[]): T[] {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
/** Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada, embaralhada. */
function escolha(r: Rng, opcoes: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const ordem = embaralha(r, opcoes.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = opcoes[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => opcoes[o][0]), resposta: ordem.indexOf(0), erros }
}

/** π vezes um número, em centésimos: 3,14 · n. */
const PI = 314

// ---------------------------------------------------------------- aula 1: planificações

type Contagem = 'faces' | 'arestas' | 'vértices'

export const planificacaoN1: Gerador = {
  id: 'planificacao-n1',
  aula: 'B.U17.A1',
  nivel: 1,
  gerar(r) {
    const solido = r.pick(['caixa', 'cubo', 'prisma'] as const)
    const pede = r.pick(['faces', 'arestas', 'vértices'] as const)
    let estado: Record<string, unknown>
    let nome: string
    let conta: Record<Contagem, number>
    let vistas: Partial<Record<Contagem, number>>
    let porFace: number
    let partes: string
    if (solido === 'prisma') {
      estado = { solido: 'prisma', comprimento: 6, largura: 4, altura: r.int(3, 6), medidas: false }
      nome = 'este prisma de base triangular'
      conta = { faces: 5, arestas: 9, vértices: 6 }
      vistas = { faces: 3 }
      porFace = 18
      partes = '3 retângulos em volta e 2 triângulos, em cima e embaixo'
    } else {
      if (solido === 'cubo') {
        estado = { solido: 'cubo', aresta: 3, medidas: false }
        nome = 'este cubo'
      } else {
        const c = r.int(4, 6)
        estado = { comprimento: c, largura: r.int(2, c - 1), altura: r.int(2, 4), medidas: false }
        nome = 'esta caixa'
      }
      conta = { faces: 6, arestas: 12, vértices: 8 }
      vistas = { faces: 3, arestas: 9, vértices: 7 }
      porFace = 24
      partes = 'frente e fundo, topo e base, os dois lados'
    }
    // As faces se contam no sólido fechado; arestas e vértices, com as de trás tracejadas.
    if (pede !== 'faces') estado = { ...estado, ocultas: true }
    const n = conta[pede]
    const erros: [number, string][] = []
    if (vistas[pede]) erros.push([vistas[pede]!, 'conta-so-o-que-ve'])
    if (pede === 'arestas') erros.push([porFace, 'conta-aresta-duas-vezes'])
    const caixaLike = solido !== 'prisma'
    const dicas: [string, string, string] =
      pede === 'faces'
        ? ['Face é cada parte plana. Conte também as de trás e a de baixo.', `Aberto, o sólido mostra todas: ${partes}.`, `São ${n} faces.`]
        : pede === 'arestas'
          ? ['Aresta é a dobra entre duas faces. As tracejadas, atrás, também contam.', caixaLike ? 'Conte as de cima, as de baixo e as em pé: 4 de cada.' : 'Conte as de cima, as de baixo e as em pé: 3 de cada.', caixaLike ? '$4 + 4 + 4 = 12$ arestas.' : '$3 + 3 + 3 = 9$ arestas.']
          : ['Vértice é cada canto. O tracejado mostra o canto escondido.', caixaLike ? 'Conte os cantos de cima e os de baixo: 4 de cada.' : 'Conte os cantos de cima e os de baixo: 3 de cada.', caixaLike ? '$4 + 4 = 8$ vértices.' : '$3 + 3 = 6$ vértices.']
    const visual: Visual = { modelo: 'solido', estado, esboco: `O sólido (${solido}) fechado${pede === 'faces' ? '' : ', com as arestas de trás tracejadas'}.` }
    return {
      enunciado: `Quantas **${pede}** tem ${nome}?`,
      formato: 'numero',
      resposta: n,
      erros: mapa(n, erros),
      dicas,
      visual,
    }
  },
}

/** Em que cada sólido se abre, e o que se vê dele fechado. */
const PECAS: { nome: string; abre: string; ve: string }[] = [
  { nome: 'uma caixa de sapato', abre: '6 retângulos', ve: '3 retângulos' },
  { nome: 'um cubo', abre: '6 quadrados iguais', ve: '3 quadrados iguais' },
  { nome: 'um prisma de base triangular', abre: '3 retângulos e 2 triângulos', ve: '2 retângulos e 1 triângulo' },
  { nome: 'uma lata, um cilindro', abre: '2 círculos e 1 retângulo', ve: '1 círculo e 1 retângulo' },
]
const ORD = ['1º', '2º', '3º', '4º', '5º']

export const planificacaoN2: Gerador = {
  id: 'planificacao-n2',
  aula: 'B.U17.A1',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(['pecas', 'largura', 'cubo'] as const)
    if (tipo === 'pecas') {
      const i = r.int(0, PECAS.length - 1)
      const s = PECAS[i]
      const outra = PECAS[(i + r.int(1, PECAS.length - 1)) % PECAS.length]
      return {
        enunciado: `Aberto na planificação, ${s.nome} vira o quê?`,
        formato: 'escolha',
        ...escolha(r, [
          [s.abre, undefined],
          [s.ve, 'conta-so-o-que-ve'],
          [outra.abre, undefined],
        ]),
        dicas: [
          'Abra em pensamento: cada face vira uma peça plana, as de trás também.',
          'Fechado, você vê só a frente, um lado e o topo. Falta o que está atrás e embaixo.',
          `Aberto, ${s.nome} vira ${s.abre}.`,
        ],
      }
    }
    if (tipo === 'largura') {
      const pelo = r.pick(['diametro', 'raio'] as const)
      if (pelo === 'diametro') {
        const d = r.int(4, 20)
        const c = PI * d
        return {
          enunciado: `Uma lata tem ${neg(d, 'cm')} de diâmetro. Aberta, a parede vira um retângulo. Qual é a largura dele, em cm? Use π ≈ 3,14.`,
          fala: `Uma lata tem ${d} centímetros de diâmetro. Aberta, a parede vira um retângulo. Qual é a largura dele, em centímetros? Use pi aproximadamente três vírgula catorze.`,
          formato: 'numero',
          resposta: resp(c),
          erros: mapaC(c, [
            [d * 100, 'lateral-com-o-diametro'],
            [(PI * d) / 2, 'confunde-raio-diametro'],
          ]),
          dicas: [
            'A parede dá a volta inteira na tampa. A largura do retângulo é a volta do círculo.',
            `A volta tem π diâmetros: $\\pi \\cdot ${d}$.`,
            `$3{,}14 \\cdot ${d} = ${tx(c)}$. A largura é cerca de ${med(txt(c), 'cm')}.`,
          ],
        }
      }
      const raio = r.int(2, 10)
      const c = 2 * PI * raio
      return {
        enunciado: `Uma lata tem ${neg(raio, 'cm')} de raio. Aberta, a parede vira um retângulo. Qual é a largura dele, em cm? Use π ≈ 3,14.`,
        fala: `Uma lata tem ${raio} centímetros de raio. Aberta, a parede vira um retângulo. Qual é a largura dele, em centímetros? Use pi aproximadamente três vírgula catorze.`,
        formato: 'numero',
        resposta: resp(c),
        erros: mapaC(c, [
          [PI * raio, 'confunde-raio-diametro'],
          [2 * raio * 100, 'lateral-com-o-diametro'],
          [raio * 100, 'lateral-com-o-diametro'],
        ]),
        dicas: [
          'A parede dá a volta inteira na tampa. A largura do retângulo é a volta do círculo.',
          `O diâmetro tem dois raios: ${med(2 * raio, 'cm')}. A volta é $\\pi \\cdot ${2 * raio}$.`,
          `$3{,}14 \\cdot ${2 * raio} = ${tx(c)}$. A largura é cerca de ${med(txt(c), 'cm')}.`,
        ],
      }
    }
    // A rede do cubo: uma fila de 4 com um quadrado de cada lado fecha; os dois do mesmo lado, ou uma fila de 5, não.
    const forma = r.pick(['cruz', 'mesmo-lado', 'fila5'] as const)
    let enunciado: string
    let fecha: boolean
    if (forma === 'cruz') {
      const a = r.int(0, 3)
      const b = r.int(0, 3)
      enunciado = `Uma fila de 4 quadrados, com mais um em cima do ${ORD[a]} e outro embaixo do ${ORD[b]}. Dobrada, ela fecha um cubo?`
      fecha = true
    } else if (forma === 'mesmo-lado') {
      const a = r.int(0, 2)
      const b = r.int(a + 1, 3)
      const lado = r.pick(['em cima', 'embaixo'] as const)
      enunciado = `Uma fila de 4 quadrados, com mais um ${lado} do ${ORD[a]} e outro ${lado} do ${ORD[b]}. Dobrada, ela fecha um cubo?`
      fecha = false
    } else {
      const a = r.int(0, 4)
      enunciado = `Uma fila de 5 quadrados, com mais um em cima do ${ORD[a]}. Dobrada, ela fecha um cubo?`
      fecha = false
    }
    return {
      enunciado,
      formato: 'escolha',
      opcoes: ['Sim', 'Não'],
      resposta: fecha ? 0 : 1,
      erros: fecha ? {} : { '0': 'toda-cruz-fecha-cubo' },
      dicas: [
        'Dobre em pensamento. Uma fila de 4 dá a volta no cubo: são as 4 paredes.',
        'Sobram a tampa e o fundo: um quadrado de cada lado da fila. Dois do mesmo lado caem no mesmo lugar.',
        fecha
          ? 'A fila de 4 vira as paredes, o de cima vira a tampa e o de baixo, o fundo: fecha.'
          : forma === 'fila5'
            ? 'Na fila de 5, o quinto quadrado cai em cima do primeiro e fica um buraco: não fecha.'
            : 'Os dois quadrados do mesmo lado viram a tampa ao mesmo tempo, e o fundo fica aberto: não fecha.',
      ],
    }
  },
}

/** As bases dos prismas e pirâmides do nível 3: o nome, o adjetivo e o número de lados. */
const BASES: [string, number][] = [
  ['triangular', 3],
  ['quadrada', 4],
  ['pentagonal', 5],
  ['hexagonal', 6],
  ['octogonal', 8],
]

export const planificacaoN3: Gerador = {
  id: 'planificacao-n3',
  aula: 'B.U17.A1',
  nivel: 3,
  gerar(r) {
    const solido = r.pick(['prisma', 'pirâmide'] as const)
    const [base, n] = r.pick(BASES)
    const pede = r.pick(['faces', 'arestas', 'vértices'] as const)
    const prisma = solido === 'prisma'
    const conta: Record<Contagem, number> = prisma ? { faces: n + 2, arestas: 3 * n, vértices: 2 * n } : { faces: n + 1, arestas: 2 * n, vértices: n + 1 }
    const certa = conta[pede]
    const erros: [number, string][] =
      pede === 'faces'
        ? prisma
          ? [[n, 'conta-so-o-que-ve'], [n + 1, 'conta-so-o-que-ve']]
          : [[n, 'conta-so-o-que-ve']]
        : pede === 'arestas'
          ? [[2 * certa, 'conta-aresta-duas-vezes']]
          : [[n, 'conta-so-o-que-ve']]
    const nome = prisma ? `um prisma de base ${base} (${n} lados)` : `uma pirâmide de base ${base} (${n} lados)`
    const dicas: [string, string, string] = prisma
      ? pede === 'faces'
        ? ['O prisma tem uma face em volta para cada lado da base, mais as duas bases.', `São ${n} faces em volta, mais a base e o topo.`, `$${n} + 2 = ${certa}$ faces.`]
        : pede === 'arestas'
          ? ['Conte as arestas da base, as do topo e as em pé.', `A base tem ${n}, o topo tem ${n}, e há ${n} em pé.`, `$${n} + ${n} + ${n} = ${certa}$ arestas.`]
          : ['Os vértices estão nos cantos da base e do topo.', `A base tem ${n} cantos, e o topo também.`, `$${n} + ${n} = ${certa}$ vértices.`]
      : pede === 'faces'
        ? ['A pirâmide tem um triângulo para cada lado da base, mais a própria base.', `São ${n} triângulos e a base.`, `$${n} + 1 = ${certa}$ faces.`]
        : pede === 'arestas'
          ? ['Conte as arestas da base e as que sobem até a ponta.', `A base tem ${n}, e sobem ${n} até a ponta.`, `$${n} + ${n} = ${certa}$ arestas.`]
          : ['Os vértices são os cantos da base e a ponta.', `A base tem ${n} cantos; a ponta é mais um.`, `$${n} + 1 = ${certa}$ vértices.`]
    return {
      enunciado: `Quantas **${pede}** tem ${nome}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, erros),
      dicas,
    }
  },
}

// ---------------------------------------------------------------- aula 2: volume

export const volumeN1: Gerador = {
  id: 'volume-solidos-n1',
  aula: 'B.U17.A2',
  nivel: 1,
  gerar(r) {
    const c = r.int(3, 6)
    const l = r.int(2, 5)
    const h = r.int(2, 5)
    const v = c * l * h
    const visual: Visual = {
      modelo: 'solido',
      estado: { comprimento: c, largura: l, altura: h, unidade: 'cm', baseCheia: true },
      esboco: `A caixa de ${c} por ${l} por ${h}, com a camada do fundo cheia de cubinhos e ${c} × ${l} = ${c * l} cubinhos embaixo.`,
    }
    return {
      enunciado: `A caixa tem ${neg(c, 'cm')} por ${neg(l, 'cm')}, e ${neg(h, 'cm')} de altura. Quantos cubinhos de 1${NB}cm cabem nela?`,
      formato: 'numero',
      resposta: v,
      erros: mapa(v, [
        [c * l, 'volume-so-a-base'],
        [c + l + h, 'soma-no-lugar-de-multiplicar'],
        [2 * (c * l + c * h + l * h), 'confunde-volume-superficie'],
      ]),
      dicas: [
        'O volume é a área da base vezes a altura: camadas iguais à do fundo.',
        `O fundo tem $${c} \\cdot ${l} = ${c * l}$ cubinhos. A altura dá ${h} camadas.`,
        `$${c * l} \\cdot ${h} = ${v}$. Cabem ${v} cubinhos: ${med(v, 'cm³')}.`,
      ],
      visual,
    }
  },
}

export const volumeN2: Gerador = {
  id: 'volume-solidos-n2',
  aula: 'B.U17.A2',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(['prisma', 'base', 'raio'] as const)
    if (tipo === 'prisma') {
      const b = r.pick([4, 6, 8, 10, 12])
      const a = r.int(3, 9)
      const H = r.int(3, 12)
      const base = (b * a) / 2
      const v = base * H
      return {
        enunciado: `A base de um prisma é um triângulo de ${neg(b, 'cm')} de base e ${neg(a, 'cm')} de altura. O prisma tem ${neg(H, 'cm')} de altura. Qual é o volume, em cm³?`,
        formato: 'numero',
        resposta: v,
        erros: mapa(v, [
          [b * a * H, 'area-do-triangulo-sem-metade'],
          [b + a + H, 'soma-no-lugar-de-multiplicar'],
          [base, 'volume-so-a-base'],
        ]),
        dicas: [
          'Volume = área da base · altura. A base é um triângulo: a metade de base · altura.',
          `A base tem $${b} \\cdot ${a} \\div 2 = ${base}$ cm².`,
          `$${base} \\cdot ${H} = ${v}$. O volume é ${med(v, 'cm³')}.`,
        ],
      }
    }
    if (tipo === 'base') {
      const A = r.int(12, 90)
      const h = r.int(3, 15)
      const v = A * h
      return {
        enunciado: `O fundo de uma lata tem ${neg(A, 'cm²')}, e ela tem ${neg(h, 'cm')} de altura. Qual é o volume, em cm³?`,
        formato: 'numero',
        resposta: v,
        erros: mapa(v, [
          [A + h, 'soma-no-lugar-de-multiplicar'],
          [A, 'volume-so-a-base'],
        ]),
        dicas: [
          'Volume = área da base · altura: discos iguais ao fundo, empilhados.',
          `Cada disco de 1${NB}cm tem ${med(A, 'cm³')}. Cabem ${h} discos.`,
          `$${A} \\cdot ${h} = ${milhar(v)}$. O volume é ${med(milhar(v), 'cm³')}.`,
        ],
      }
    }
    const raio = r.int(1, 10)
    const h = r.int(2, 20)
    const base = PI * raio * raio
    const v = base * h
    return {
      enunciado: `Uma lata tem ${neg(raio, 'cm')} de raio e ${neg(h, 'cm')} de altura. Qual é o volume, em cm³? Use π ≈ 3,14.`,
      fala: `Uma lata tem ${raio} centímetros de raio e ${h} centímetros de altura. Qual é o volume, em centímetros cúbicos? Use pi aproximadamente três vírgula catorze.`,
      formato: 'numero',
      resposta: resp(v),
      erros: mapaC(v, [
        [2 * PI * raio * h, 'confunde-area-perimetro'],
        [4 * raio * raio * h * 100, 'area-do-circulo-como-quadrado'],
        [PI * 4 * raio * raio * h, 'confunde-raio-diametro'],
        [base, 'volume-so-a-base'],
      ]),
      dicas: [
        'Volume = área da base · altura. A base é um círculo: $\\pi \\cdot r \\cdot r$.',
        `A base tem $\\pi \\cdot ${raio} \\cdot ${raio} \\approx ${tx(base)}$ cm².`,
        `$${tx(base)} \\cdot ${h} = ${tx(v)}$. O volume é cerca de ${med(txt(v), 'cm³')}.`,
      ],
    }
  },
}

export const volumeN3: Gerador = {
  id: 'volume-solidos-n3',
  aula: 'B.U17.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['caixa-dagua', 'aquario', 'tanque'] as const)
    if (tipo === 'caixa-dagua') {
      // As medidas em decímetros: cada cubo de 1 dm é 1 litro.
      const c = r.pick([10, 12, 15, 20, 25])
      const l = r.pick([8, 10, 12, 15])
      const h = r.pick([6, 8, 10, 12])
      const litros = c * l * h
      return {
        enunciado: `Uma caixa-d'água tem ${neg(dm(c), 'm')} por ${neg(dm(l), 'm')}, e ${neg(dm(h), 'm')} de altura. Quantos litros cabem nela?`,
        formato: 'numero',
        resposta: litros,
        erros: mapaC(litros * 100, [
          [litros / 10, 'confunde-m3-com-litro'],
          [litros * 10, 'converte-volume-como-comprimento'],
          [litros, 'converte-volume-como-comprimento'],
        ]),
        dicas: [
          'Volume = área da base · altura. Em m³, cada m³ tem 1.000 L.',
          `O volume é $${tx(c * 10)} \\cdot ${tx(l * 10)} \\cdot ${tx(h * 10)} = ${tx(litros / 10)}$ m³.`,
          `$${tx(litros / 10)} \\cdot 1.000 = ${milhar(litros)}$. Cabem ${med(milhar(litros), 'L')}.`,
        ],
      }
    }
    if (tipo === 'aquario') {
      const c = r.pick([40, 50, 60, 80, 100])
      const l = r.pick([20, 25, 30, 40])
      const h = r.pick([30, 40, 50])
      const cm3 = c * l * h
      // Litros em centésimos: cm³ ÷ 1.000.
      const L = cm3 / 10
      return {
        enunciado: `Um aquário tem ${neg(c, 'cm')} por ${neg(l, 'cm')}, e ${neg(h, 'cm')} de altura. Quantos litros cabem nele?`,
        formato: 'numero',
        resposta: resp(L),
        erros: mapaC(L, [
          [cm3, 'converte-volume-como-comprimento'],
          [cm3 * 10, 'converte-volume-como-comprimento'],
          [cm3 * 100, 'converte-no-sentido-errado'],
        ]),
        dicas: [
          'Volume = área da base · altura. Cada litro tem 1.000 cm³.',
          `O volume é $${c} \\cdot ${l} \\cdot ${h} = ${milhar(cm3)}$ cm³.`,
          `$${milhar(cm3)} \\div 1.000 = ${tx(L)}$. Cabem ${med(txt(L), 'L')}.`,
        ],
      }
    }
    // O tanque redondo: raio e altura em decímetros, para os litros saírem direto (1 dm³ = 1 L).
    const raio = r.pick([5, 6, 8, 10])
    const h = r.pick([10, 12, 15, 20])
    const base = PI * raio * raio
    const L = base * h
    return {
      enunciado: `Um tanque redondo tem ${neg(dm(raio), 'm')} de raio e ${neg(dm(h), 'm')} de altura. Quantos litros cabem nele? Use π ≈ 3,14.`,
      fala: `Um tanque redondo tem ${dm(raio)} metro de raio e ${dm(h)} metro de altura. Quantos litros cabem nele? Use pi aproximadamente três vírgula catorze.`,
      formato: 'numero',
      resposta: resp(L),
      erros: mapaC(L, [
        [L / 1000, 'confunde-m3-com-litro'],
        [L / 10, 'converte-volume-como-comprimento'],
        [2 * PI * raio * h, 'confunde-area-perimetro'],
        [4 * raio * raio * h * 100, 'area-do-circulo-como-quadrado'],
      ]),
      dicas: [
        'Volume = área da base · altura, com a base $\\pi \\cdot r \\cdot r$. Em decímetros, cada dm³ é 1 L.',
        `Em decímetros: raio ${med(raio, 'dm')}, altura ${med(h, 'dm')}. A base tem $3{,}14 \\cdot ${raio} \\cdot ${raio} = ${tx(base)}$ dm².`,
        `$${tx(base)} \\cdot ${h} = ${tx(L)}$ dm³. Cabem cerca de ${med(txt(L), 'L')}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: área de superfície

export const superficieN1: Gerador = {
  id: 'area-superficie-n1',
  aula: 'B.U17.A3',
  nivel: 1,
  gerar(r) {
    const c = r.int(3, 7)
    let l = r.int(2, 5)
    if (l === c) l--
    const h = r.int(2, 4)
    const metade = c * l + c * h + l * h
    const s = 2 * metade
    const visual: Visual = {
      modelo: 'solido',
      // Sem a unidade nas faces: com ela, os textos das faces estreitas não cabem e vão para o lado.
      estado: { comprimento: c, largura: l, altura: h, aberto: true, areas: true },
      esboco: `A caixa de ${c} por ${l} por ${h} aberta na planificação, com a área escrita em cada face.`,
    }
    return {
      enunciado: `A caixa de ${neg(c, 'cm')} por ${neg(l, 'cm')} por ${neg(h, 'cm')} está aberta. Quantos cm² de papel cobrem a caixa toda?`,
      formato: 'numero',
      resposta: s,
      erros: mapa(s, [
        [metade, 'conta-so-o-que-ve'],
        [c * l * h, 'confunde-volume-superficie'],
      ]),
      dicas: [
        'A área de superfície é a soma das áreas das 6 faces.',
        `As faces vêm em pares iguais: ${c * l}, ${c * h} e ${l * h}, duas de cada.`,
        `$2 \\cdot (${c * l} + ${c * h} + ${l * h}) = ${s}$. São ${med(s, 'cm²')}.`,
      ],
      visual,
    }
  },
}

export const superficieN2: Gerador = {
  id: 'area-superficie-n2',
  aula: 'B.U17.A3',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(['cubo', 'caixa', 'rotulo'] as const)
    if (tipo === 'cubo') {
      const a = r.int(2, 12)
      const s = 6 * a * a
      return {
        enunciado: `Quantos cm² de papel cobrem um cubo de ${neg(a, 'cm')} de aresta, todo fechado?`,
        formato: 'numero',
        resposta: s,
        erros: mapa(s, [
          [3 * a * a, 'conta-so-o-que-ve'],
          [4 * a * a, 'conta-so-o-que-ve'],
          [a * a * a, 'confunde-volume-superficie'],
        ]),
        dicas: [
          'O cubo tem 6 faces, todas quadrados iguais.',
          `Cada face tem $${a} \\cdot ${a} = ${a * a}$ cm².`,
          `$6 \\cdot ${a * a} = ${milhar(s)}$. São ${med(milhar(s), 'cm²')}.`,
        ],
      }
    }
    if (tipo === 'caixa') {
      const c = r.int(10, 30)
      const l = r.int(5, 20)
      const h = r.int(4, 15)
      const metade = c * l + c * h + l * h
      const s = 2 * metade
      return {
        enunciado: `Uma caixa tem ${neg(c, 'cm')} por ${neg(l, 'cm')}, e ${neg(h, 'cm')} de altura. Qual é a área de superfície, em cm²?`,
        formato: 'numero',
        resposta: s,
        erros: mapa(s, [
          [metade, 'conta-so-o-que-ve'],
          [c * l * h, 'confunde-volume-superficie'],
        ]),
        dicas: [
          'Some as áreas das 6 faces. As de frente uma para a outra são iguais.',
          `Os três pares: $${c} \\cdot ${l} = ${c * l}$, $${c} \\cdot ${h} = ${c * h}$ e $${l} \\cdot ${h} = ${l * h}$.`,
          `$2 \\cdot (${c * l} + ${c * h} + ${l * h}) = ${milhar(s)}$. São ${med(milhar(s), 'cm²')}.`,
        ],
      }
    }
    const raio = r.int(2, 10)
    const h = r.int(5, 20)
    const s = 2 * PI * raio * h
    return {
      enunciado: `Uma lata tem ${neg(raio, 'cm')} de raio e ${neg(h, 'cm')} de altura. Quantos cm² de papel tem o rótulo, que cobre a parede? Use π ≈ 3,14.`,
      fala: `Uma lata tem ${raio} centímetros de raio e ${h} centímetros de altura. Quantos centímetros quadrados de papel tem o rótulo, que cobre a parede? Use pi aproximadamente três vírgula catorze.`,
      formato: 'numero',
      resposta: resp(s),
      erros: mapaC(s, [
        [PI * raio * h, 'confunde-raio-diametro'],
        [2 * raio * h * 100, 'lateral-com-o-diametro'],
        [PI * raio * raio * h, 'confunde-volume-superficie'],
      ]),
      dicas: [
        'Aberto, o rótulo é um retângulo: a largura é a volta da lata, a altura é a da lata.',
        `A volta é $2 \\cdot \\pi \\cdot ${raio} \\approx ${tx(2 * PI * raio)}$ cm.`,
        `$${tx(2 * PI * raio)} \\cdot ${h} = ${tx(s)}$. O rótulo tem cerca de ${med(txt(s), 'cm²')}.`,
      ],
    }
  },
}

export const superficieN3: Gerador = {
  id: 'area-superficie-n3',
  aula: 'B.U17.A3',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['paredes', 'latas', 'lata'] as const)
    if (tipo === 'paredes' || tipo === 'latas') {
      // O quarto: lados em metros, a altura em decímetros (2,5 m, 2,8 m, 3 m). Áreas em centésimos de m².
      const c = r.int(3, 6)
      const l = r.int(2, 5)
      const h = r.pick([25, 28, 30])
      const paredes = 2 * (c + l) * h * 10
      const teto = c * l * 100
      if (tipo === 'paredes') {
        return {
          enunciado: `Você vai pintar só as paredes de um quarto de ${neg(c, 'm')} por ${neg(l, 'm')}, com ${neg(dm(h), 'm')} de altura. Quantos m² de parede?`,
          formato: 'numero',
          resposta: resp(paredes),
          erros: mapaC(paredes, [
            [paredes + teto, 'pinta-faces-a-mais'],
            [paredes + 2 * teto, 'pinta-faces-a-mais'],
            [paredes / 2, 'conta-so-o-que-ve'],
          ]),
          dicas: [
            'São 4 paredes: duas de cada medida. O chão e o teto ficam de fora.',
            `As paredes têm $${c} \\cdot ${tx(h * 10)}$ e $${l} \\cdot ${tx(h * 10)}$, duas de cada.`,
            `$2 \\cdot ${tx(c * h * 10)} + 2 \\cdot ${tx(l * h * 10)} = ${tx(paredes)}$. São ${med(txt(paredes), 'm²')}.`,
          ],
        }
      }
      // A lata que pinta k m², escolhida para a conta não dar exata.
      const opcoes = embaralha(r, [8, 10, 12, 15]).filter((x) => paredes % (x * 100) !== 0)
      const k = opcoes[0] ?? 7
      const latas = Math.ceil(paredes / (k * 100))
      const baixo = Math.floor(paredes / (k * 100))
      return {
        enunciado: `As paredes de um quarto de ${neg(c, 'm')} por ${neg(l, 'm')}, com ${neg(dm(h), 'm')} de altura, vão ser pintadas. Uma lata pinta ${neg(k, 'm²')}. Quantas latas?`,
        formato: 'numero',
        resposta: latas,
        erros: mapa(latas, [
          [baixo, 'ignora-contexto-do-resto'],
          [Math.ceil((paredes + teto) / (k * 100)), 'pinta-faces-a-mais'],
          [Math.ceil(paredes / 2 / (k * 100)), 'conta-so-o-que-ve'],
        ]),
        dicas: [
          'Primeiro a área das 4 paredes; depois, quantas latas cobrem essa área. Lata não se compra pela metade.',
          `As paredes têm $2 \\cdot ${tx(c * h * 10)} + 2 \\cdot ${tx(l * h * 10)} = ${tx(paredes)}$ m².`,
          `$${tx(paredes)} \\div ${k}$ dá ${baixo} e um pouco: ${baixo} latas não bastam. São ${latas} latas.`,
        ],
      }
    }
    const raio = r.int(1, 6)
    const h = r.int(2, 15)
    const tampa = PI * raio * raio
    const lateral = 2 * PI * raio * h
    const s = 2 * tampa + lateral
    return {
      enunciado: `Uma lata fechada tem ${neg(raio, 'cm')} de raio e ${neg(h, 'cm')} de altura. Quantos cm² de chapa ela tem, com as tampas? Use π ≈ 3,14.`,
      fala: `Uma lata fechada tem ${raio} centímetros de raio e ${h} centímetros de altura. Quantos centímetros quadrados de chapa ela tem, com as tampas? Use pi aproximadamente três vírgula catorze.`,
      formato: 'numero',
      resposta: resp(s),
      erros: mapaC(s, [
        [tampa + lateral, 'conta-so-o-que-ve'],
        [lateral, 'conta-so-o-que-ve'],
        [tampa * h, 'confunde-volume-superficie'],
      ]),
      dicas: [
        'Aberta, a lata são 2 tampas, círculos de $\\pi \\cdot r \\cdot r$, e um retângulo: a volta vezes a altura.',
        `Cada tampa tem $3{,}14 \\cdot ${raio} \\cdot ${raio} = ${tx(tampa)}$ cm². O retângulo, $2 \\cdot 3{,}14 \\cdot ${raio} \\cdot ${h} = ${tx(lateral)}$ cm².`,
        `$2 \\cdot ${tx(tampa)} + ${tx(lateral)} = ${tx(s)}$. São cerca de ${med(txt(s), 'cm²')}.`,
      ],
    }
  },
}

export const GERADORES_U17: Gerador[] = [planificacaoN1, planificacaoN2, planificacaoN3, volumeN1, volumeN2, volumeN3, superficieN1, superficieN2, superficieN3]
