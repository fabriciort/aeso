import type { Gerador, Item, Visual } from '@/lib/formation/schema'

// Unidade 9: medidas (aulas 1 a 3). Comprimento, massa e capacidade, área.
// Toda medida é guardada como um inteiro n e um número de casas decimais d
// (o valor é n ÷ 10^d), para nenhuma conta passar por um decimal de
// JavaScript. Converter é mover a vírgula: mover(n, d, 2) multiplica por 100.

/** Os algarismos de n ÷ 10^d: a parte inteira e a decimal, sem zeros no fim. */
function partes(n: number, d: number): [string, string] {
  if (d <= 0) return [String(n * 10 ** -d), '']
  const s = String(n).padStart(d + 1, '0')
  return [s.slice(0, s.length - d), s.slice(s.length - d).replace(/0+$/, '')]
}
const milhar = (i: string) => i.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** Para a tela: (2400, 0) → "2.400"; (15, 1) → "1,5"; (5, 2) → "0,05". */
const escrito = (n: number, d = 0) => {
  const [i, f] = partes(n, d)
  return f ? `${milhar(i)},${f}` : milhar(i)
}
/** Como o aluno digita: um inteiro vira número; um decimal, texto com vírgula ('0,35'). */
const resposta = (n: number, d = 0): number | string => {
  const [i, f] = partes(n, d)
  return f ? `${i},${f}` : Number(i)
}
/** O número no quadro de unidades: sem pontos de milhar ('1200', '0,5'). */
const noQuadro = (n: number, d = 0) => String(resposta(n, d))
/** A vírgula anda s casas para a direita (s negativo: para a esquerda). */
const mover = (n: number, d: number, s: number): [number, number] => (d - s >= 0 ? [n, d - s] : [n * 10 ** (s - d), 0])

/** "0,50" e "0,5" são o mesmo número. */
const norm = (s: string) => (s.includes(',') ? s.replace(/0+$/, '').replace(/,$/, '') : s)
/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number | string, pares: [string, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([norm(String(certa))])
  for (const [valor, erro] of pares) {
    if (vistos.has(norm(valor))) continue
    vistos.add(norm(valor))
    erros[valor] = erro
  }
  return erros
}
const dig = (m: [number, number]) => String(resposta(...m))

const COMP = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']
const MASSA = ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg']
const CAP = ['kL', 'hL', 'daL', 'L', 'dL', 'cL', 'mL']
const AREA = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²']
const NOME: Record<string, string> = {
  km: 'quilômetros', m: 'metros', cm: 'centímetros', mm: 'milímetros',
  kg: 'quilos', g: 'gramas', mg: 'miligramas', L: 'litros', mL: 'mililitros',
  'm²': 'metros quadrados', 'dm²': 'decímetros quadrados', 'cm²': 'centímetros quadrados',
}
/** "É 1 casa", "São 3 casas". */
const saoCasas = (s: number) => (s === 1 ? 'É 1 casa' : `São ${s} casas`)
const fator = (s: number) => escrito(10 ** Math.abs(s))

function quadro(lista: string[], numero: string, de: string, porCasa?: number): Visual {
  return {
    modelo: 'quadro-posicional',
    estado: { medida: { casas: lista, numero, de, ...(porCasa ? { porCasa } : {}) } },
    esboco: `O quadro de unidades (${lista.join(' ')}) com ${numero.replace('.', ',')} ${de}, a vírgula âmbar depois do ${de}. Ao conferir, a vírgula anda até a unidade pedida.`,
  }
}

/** Um decimal amigável com d casas, a última diferente de zero: 7, 2,5, 0,75. */
function amigavel(r: { int(a: number, b: number): number }, d: number): number {
  if (d === 0) return r.int(2, 12)
  if (d === 1) return 10 * r.int(0, 4) + r.int(1, 9)
  return 100 * r.int(0, 2) + 10 * r.int(1, 9) + r.int(1, 9)
}

/** Converter para uma unidade menor: o número cresce. */
function paraMenor(lista: string[], de: string, para: string, n: number, d: number, porCasa = 1): Item {
  const s = (lista.indexOf(para) - lista.indexOf(de)) * porCasa
  const certa = resposta(...mover(n, d, s))
  const pares: [string, string][] = []
  if (porCasa === 2) pares.push([dig(mover(n, d, s / 2)), 'converte-area-como-comprimento'])
  if (s > 1) pares.push([dig(mover(n, d, s - 1)), 'fator-de-conversao-errado'])
  pares.push([dig(mover(n, d, s + 1)), 'fator-de-conversao-errado'])
  pares.push([dig(mover(n, d, -s)), 'converte-no-sentido-errado'])
  if (partes(n, d)[1]) pares.push([`${noQuadro(n, d)}${'0'.repeat(s)}`, 'acrescenta-zeros-no-decimal'])
  const area = porCasa === 2
  return {
    enunciado: `Escreva **${escrito(n, d)} ${de}** em ${NOME[para]}${area ? ` (${para})` : ''}.`,
    formato: 'numero',
    resposta: certa,
    erros: mapa(certa, pares),
    dicas: [
      `Do ${de} para o ${para}, a unidade fica menor: cabem mais pedaços, e o número cresce.`,
      area
        ? `${saoCasas(s / 2)} de área, com 2 algarismos cada: × ${fator(s)}. A vírgula anda ${s} para a direita.`
        : `${saoCasas(s)} no quadro: × ${fator(s)}. A vírgula anda ${s} para a direita.`,
      `${escrito(n, d)} ${de} = ${escrito(...mover(n, d, s))} ${para}.`,
    ],
  }
}

/** Converter para uma unidade maior: o número diminui. */
function paraMaior(lista: string[], de: string, para: string, n: number, porCasa = 1): Item {
  const s = (lista.indexOf(de) - lista.indexOf(para)) * porCasa
  const certa = resposta(...mover(n, 0, -s))
  const pares: [string, string][] = []
  if (porCasa === 2) pares.push([dig(mover(n, 0, -s / 2)), 'converte-area-como-comprimento'])
  if (s > 1) pares.push([dig(mover(n, 0, -(s - 1))), 'fator-de-conversao-errado'])
  pares.push([dig(mover(n, 0, -(s + 1))), 'fator-de-conversao-errado'])
  pares.push([dig(mover(n, 0, s)), 'converte-no-sentido-errado'])
  const area = porCasa === 2
  return {
    enunciado: `Escreva **${escrito(n)} ${de}** em ${NOME[para]}${area ? ` (${para})` : ''}.`,
    formato: 'numero',
    resposta: certa,
    erros: mapa(certa, pares),
    dicas: [
      `Do ${de} para o ${para}, a unidade fica maior: cabem menos, e o número diminui.`,
      area
        ? `${saoCasas(s / 2)} de área, com 2 algarismos cada: ÷ ${fator(s)}. A vírgula anda ${s} para a esquerda.`
        : `${saoCasas(s)} no quadro: ÷ ${fator(s)}. A vírgula anda ${s} para a esquerda, e os zeros que faltam entram.`,
      `${escrito(n)} ${de} = ${escrito(...mover(n, 0, -s))} ${para}.`,
    ],
  }
}

/** Um inteiro com 1, 2 ou 3 algarismos (o tamanho decide os zeros da resposta). */
function inteiro(r: { int(a: number, b: number): number }, tam: number): number {
  if (tam === 0) return r.int(1, 9)
  if (tam === 1) return 10 * r.int(1, 9) + r.int(0, 9)
  return 100 * r.int(1, 9) + 10 * r.int(0, 9) + r.int(0, 9)
}

// ---------------------------------------------------------------- aula 1: comprimento

const MENORES_COMP: [string, string][] = [['m', 'cm'], ['m', 'mm'], ['km', 'm'], ['cm', 'mm']]
const MAIORES_COMP: [string, string][] = [['cm', 'm'], ['mm', 'cm'], ['m', 'km'], ['mm', 'm']]

export const comprimentoN1: Gerador = {
  id: 'comprimento-n1',
  aula: 'B.U9.A1',
  nivel: 1,
  gerar(r) {
    const [de, para] = r.pick(MENORES_COMP)
    const s = COMP.indexOf(para) - COMP.indexOf(de)
    const d = r.int(0, Math.min(2, s))
    const n = amigavel(r, d)
    return { ...paraMenor(COMP, de, para, n, d), visual: quadro(COMP, noQuadro(n, d), de) }
  },
}

export const comprimentoN2: Gerador = {
  id: 'comprimento-n2',
  aula: 'B.U9.A1',
  nivel: 2,
  gerar(r) {
    const [de, para] = r.pick(MAIORES_COMP)
    // Com 3 casas (m → km, mm → m), números de 2 ou 3 algarismos: 0,05 km, 0,75 km.
    const n = inteiro(r, r.int(COMP.indexOf(de) - COMP.indexOf(para) === 3 ? 1 : 0, 2))
    return { ...paraMaior(COMP, de, para, n), visual: quadro(COMP, String(n), de) }
  },
}

export const comprimentoN3: Gerador = {
  id: 'comprimento-n3',
  aula: 'B.U9.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Metros inteiros menos centímetros: a resposta em cm.
      const a = r.int(2, 5)
      const b = 10 * r.int(1, 9) + r.int(1, 9)
      const certa = 100 * a - b
      return {
        enunciado: `Você comprou **${a} m** de fio e usou **${b} cm**. Quanto sobrou, em centímetros?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [String(b - a), 'mistura-unidades'],
          [String(100 * a + b), 'subtrai-menor-do-maior'],
          ...(10 * a > b ? [[String(10 * a - b), 'fator-de-conversao-errado'] as [string, string]] : []),
        ]),
        dicas: [
          'Antes da conta, as duas medidas na mesma unidade.',
          `${a} m = ${100 * a} cm. Agora tire ${b}.`,
          `${100 * a} − ${b} = ${certa} cm.`,
        ],
      }
    }
    if (tipo === 1) {
      // Metros com uma casa decimal mais centímetros: a resposta em cm.
      const a = 10 + r.int(1, 9)
      const b = 10 * r.int(2, 9) + r.int(1, 9)
      const certa = 10 * a + b
      return {
        enunciado: `Uma tábua de **${escrito(a, 1)} m** e outra de **${b} cm**, uma atrás da outra. Quanto medem juntas, em centímetros?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [dig([a + 10 * b, 1]), 'mistura-unidades'],
          [String(a + b), 'fator-de-conversao-errado'],
        ]),
        dicas: [
          'Antes da conta, as duas medidas na mesma unidade.',
          `${escrito(a, 1)} m = ${10 * a} cm. Agora some ${b}.`,
          `${10 * a} + ${b} = ${certa} cm.`,
        ],
      }
    }
    // Quilômetros com uma casa decimal mais metros: a resposta em m.
    const a = 10 * r.int(1, 4) + r.int(1, 9)
    const b = 100 * r.int(1, 9) + 50 * r.int(0, 1)
    const certa = 100 * a + b
    return {
      enunciado: `Você andou **${escrito(a, 1)} km** de manhã e **${b} m** à tarde. Quantos metros andou no total?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dig([a + 10 * b, 1]), 'mistura-unidades'],
        [String(10 * a + b), 'fator-de-conversao-errado'],
      ]),
      dicas: [
        'Antes da conta, as duas medidas na mesma unidade.',
        `${escrito(a, 1)} km = ${escrito(100 * a)} m. Agora some ${b}.`,
        `${escrito(100 * a)} + ${b} = ${escrito(certa)} m.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: massa e capacidade

const MENORES_MC: [string[], string, string][] = [[MASSA, 'kg', 'g'], [CAP, 'L', 'mL'], [MASSA, 'g', 'mg']]
const MAIORES_MC: [string[], string, string][] = [[MASSA, 'g', 'kg'], [CAP, 'mL', 'L'], [MASSA, 'mg', 'g']]

export const massaCapacidadeN1: Gerador = {
  id: 'massa-capacidade-n1',
  aula: 'B.U9.A2',
  nivel: 1,
  gerar(r) {
    const [lista, de, para] = r.pick(MENORES_MC)
    const d = r.int(0, 2)
    const n = amigavel(r, d)
    return { ...paraMenor(lista, de, para, n, d), visual: quadro(lista, noQuadro(n, d), de) }
  },
}

export const massaCapacidadeN2: Gerador = {
  id: 'massa-capacidade-n2',
  aula: 'B.U9.A2',
  nivel: 2,
  gerar(r) {
    const [lista, de, para] = r.pick(MAIORES_MC)
    const tam = r.int(0, 2)
    // 50 mL (0,05 L), 250 mL (0,25 L), 1.200 mL (1,2 L).
    const n = tam === 0 ? 10 * r.int(1, 9) : tam === 1 ? 100 * r.int(1, 9) + 50 * r.int(0, 1) : 1000 * r.int(1, 3) + 100 * r.int(1, 9)
    return { ...paraMaior(lista, de, para, n), visual: quadro(lista, String(n), de) }
  },
}

/** Garrafas (em mL) e copos que se dividem sem sobra, com mais de um copo. */
const COPOS: [number, number][] = []
for (const garrafa of [1000, 1500, 2000, 3000]) for (const copo of [200, 250, 300, 500]) if (garrafa % copo === 0) COPOS.push([garrafa, copo])
const MICRO = [5, 25, 50, 75, 100, 125, 150, 200]

export const massaCapacidadeN3: Gerador = {
  id: 'massa-capacidade-n3',
  aula: 'B.U9.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      const [garrafa, copo] = r.pick(COPOS)
      const certa = garrafa / copo
      const pares: [string, string][] = [[String(certa * 10), 'conta-zeros-errado']]
      if ((garrafa / 10) % copo === 0) pares.push([String(garrafa / 10 / copo), 'fator-de-conversao-errado'])
      return {
        enunciado: `Uma garrafa de **${escrito(garrafa, 3)} L** de suco enche quantos copos de **${copo} mL**?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, pares),
        dicas: [
          'Antes da conta, as duas medidas na mesma unidade: 1 L = 1.000 mL.',
          `${escrito(garrafa, 3)} L = ${escrito(garrafa)} mL. Quantos ${copo} cabem aí?`,
          `${escrito(garrafa)} ÷ ${copo} = ${certa} copos.`,
        ],
      }
    }
    if (tipo === 1) {
      const mg = r.pick([100, 200, 250, 500, 750])
      const qtd = r.pick([10, 14, 20, 28, 30])
      const total = mg * qtd
      const certa = resposta(total, 3)
      return {
        enunciado: `Cada comprimido tem **${mg} mg**. Quantos gramas há numa caixa com **${qtd} comprimidos**?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [dig([total, 2]), 'fator-de-conversao-errado'],
          [String(total * 1000), 'converte-no-sentido-errado'],
        ]),
        dicas: [
          'Primeiro o total em mg. Depois, para gramas: 1 g = 1.000 mg.',
          `${qtd} × ${mg} = ${escrito(total)} mg. Do mg para o g, a vírgula anda 3 casas para a esquerda.`,
          `${escrito(total)} mg = ${escrito(total, 3)} g.`,
        ],
      }
    }
    const n = r.pick(MICRO)
    return {
      enunciado: `Um comprimido tem **${escrito(n, 3)} mg**. Quantos microgramas (µg) são? Lembre: 1 mg = 1.000 µg.`,
      formato: 'numero',
      resposta: n,
      erros: mapa(n, [
        [dig([n, 1]), 'fator-de-conversao-errado'],
        [dig([n * 10, 0]), 'fator-de-conversao-errado'],
        [dig([n, 6]), 'converte-no-sentido-errado'],
      ]),
      dicas: [
        'O µg é menor que o mg: o número cresce.',
        'Do mg para o µg é × 1.000: a vírgula anda 3 casas para a direita.',
        `${escrito(n, 3)} mg = ${n} µg.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: área

export const areaN1: Gerador = {
  id: 'area-n1',
  aula: 'B.U9.A3',
  nivel: 1,
  gerar(r) {
    // Sem os retângulos em que a área e a volta dão o mesmo número (3 × 6, 4 × 4).
    const l = r.int(2, 6)
    const lados = [3, 4, 5, 6, 7, 8, 9].filter((x) => l * x !== 2 * (l + x))
    const c = lados[r.int(0, lados.length - 1)]
    const certa = l * c
    return {
      enunciado: 'Cada quadradinho é **1 m²**. Qual é a área do chão, em m²?',
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(2 * (l + c)), 'confunde-area-perimetro'],
        [String(l + c), 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        'Área é quantos quadrados de 1 m² cobrem o chão.',
        `São ${l} fileiras de ${c} quadradinhos.`,
        `${l} × ${c} = ${certa} m².`,
      ],
      visual: {
        modelo: 'retangulo',
        estado: { linhas: l, colunas: c, rotulos: true },
        esboco: `O chão visto de cima: ${l} fileiras de ${c} quadradinhos de 1 m², com ${c} em cima e ${l} do lado. Ao conferir, o total aparece embaixo.`,
      },
    }
  },
}

const MENORES_AREA: [string, string][] = [['m²', 'cm²'], ['m²', 'dm²'], ['dm²', 'cm²']]

export const areaN2: Gerador = {
  id: 'area-n2',
  aula: 'B.U9.A3',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const [de, para] = r.pick(MENORES_AREA)
      const d = r.int(0, 2)
      const n = d === 0 ? r.int(1, 9) : d === 1 ? 10 * r.int(0, 3) + r.int(1, 9) : 100 * r.int(0, 2) + r.pick([25, 75])
      return { ...paraMenor(AREA, de, para, n, d, 2), visual: quadro(AREA, noQuadro(n, d), de, 2) }
    }
    if (r.int(0, 1) === 0) {
      // cm² para m²: 5.000 cm² = 0,5 m²; 25.000 cm² = 2,5 m²; 800 cm² = 0,08 m².
      const tam = r.int(0, 2)
      const n = tam === 0 ? 100 * r.int(1, 9) : tam === 1 ? 1000 * r.int(1, 9) : 10000 * r.int(1, 9) + 5000 * r.int(0, 1)
      return { ...paraMaior(AREA, 'cm²', 'm²', n, 2), visual: quadro(AREA, String(n), 'cm²', 2) }
    }
    // dm² para m²: 45 dm² = 0,45 m²; 250 dm² = 2,5 m².
    const n = r.int(0, 1) === 0 ? 10 * r.int(1, 9) + r.int(1, 9) : 100 * r.int(1, 9) + 50 * r.int(0, 1)
    return { ...paraMaior(AREA, 'dm²', 'm²', n, 2), visual: quadro(AREA, String(n), 'dm²', 2) }
  },
}

export const areaN3: Gerador = {
  id: 'area-n3',
  aula: 'B.U9.A3',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Um lado em m, o outro em cm: a área em m².
      const a = r.int(1, 3)
      const b = r.pick([40, 50, 60, 70, 80, 90, 120, 150])
      const certa = resposta(a * b, 2)
      return {
        enunciado: `Um tapete tem **${a} m** por **${b} cm**. Qual é a área dele, em m²?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [String(a * b), 'mistura-unidades'],
          [dig([2 * (100 * a + b), 2]), 'confunde-area-perimetro'],
        ]),
        dicas: [
          'Os dois lados na mesma unidade, depois comprimento × largura.',
          `${b} cm = ${escrito(b, 2)} m.`,
          `${a} × ${escrito(b, 2)} = ${escrito(a * b, 2)} m².`,
        ],
      }
    }
    if (tipo === 1) {
      // Lados em décimos de metro; a área em centésimos de m²; as caixas arredondam para cima.
      const l = r.pick([30, 35, 40, 45, 50, 55, 60])
      const w = r.pick([25, 30, 35, 40])
      const cx = r.int(2, 3)
      const area = l * w
      const certa = Math.ceil(area / (100 * cx))
      const pares: [string, string][] = []
      if (area % (100 * cx) !== 0) pares.push([String(Math.floor(area / (100 * cx))), 'ignora-contexto-do-resto'])
      pares.push([String(Math.ceil((2 * (l + w)) / (10 * cx))), 'confunde-area-perimetro'])
      return {
        enunciado: `A sala tem **${escrito(l, 1)} m** por **${escrito(w, 1)} m**. Cada caixa de piso cobre **${cx} m²**. Quantas caixas comprar?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, pares),
        dicas: [
          'Primeiro a área do chão. Depois, quantas caixas cobrem essa área, sem faltar piso.',
          `${escrito(l, 1)} × ${escrito(w, 1)} = ${escrito(area, 2)} m².`,
          area % (100 * cx) === 0
            ? `${escrito(area, 2)} ÷ ${cx} = ${certa} caixas.`
            : `${escrito(area, 2)} ÷ ${cx} passa de ${certa - 1}: compre ${certa} caixas, para não faltar piso.`,
        ],
      }
    }
    const l = r.int(2, 6)
    const lados = [2, 3, 4, 5, 6].filter((x) => l * x !== 2 * (l + x))
    const w = lados[r.int(0, lados.length - 1)]
    const p = r.pick([30, 35, 40, 45, 50, 60, 80])
    const certa = l * w * p
    return {
      enunciado: `O piso custa **R$ ${p}** o m². A sala tem **${l} m** por **${w} m**. Quanto custa o piso da sala, em reais?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(2 * (l + w) * p), 'confunde-area-perimetro'],
        [String((l + w) * p), 'soma-no-lugar-de-multiplicar'],
      ]),
      dicas: [
        'Primeiro a área: comprimento × largura. Depois, o preço de cada m².',
        `${l} × ${w} = ${l * w} m².`,
        `${l * w} × R$ ${p} = R$ ${escrito(certa)}.`,
      ],
    }
  },
}

export const GERADORES_U9A: Gerador[] = [
  comprimentoN1, comprimentoN2, comprimentoN3,
  massaCapacidadeN1, massaCapacidadeN2, massaCapacidadeN3,
  areaN1, areaN2, areaN3,
]
