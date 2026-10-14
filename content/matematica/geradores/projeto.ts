import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 20: projeto final e conclusão. Aula 1, o projeto (a reforma de um
// cômodo); aula 2, a avaliação final (questões no estilo do ENCCEJA).
//
// O projeto: o rodapé (perímetro), o piso (área), as caixas de piso (área ÷
// o que cobre uma caixa, arredondando para cima, com 10 % de sobra), as latas
// de tinta (as paredes sem a porta e a janela), o orçamento com desconto à
// vista e a equação do pedreiro. As respostas são inteiras e positivas: os
// itens não levam a tecla do menos.
//
// A avaliação: questões de escolher, com uma situação curta e quatro (às
// vezes três) opções, cada opção errada vinda de um erro comum de uma unidade
// anterior. As situações estão escritas aqui mesmo, sem usar os geradores das
// outras unidades, para o teste refazer cada conta por conta própria.
//
// Os números do enunciado vêm em negrito, com a unidade e o espaço que não
// quebra (5 m, R$ 60, 10 %); os milhares, com ponto (1.200); os decimais, com
// vírgula (1,5).

// ---------------------------------------------------------------- ferramentas

/** O espaço que não quebra: 5 m, R$ 60 e 10 % ficam na mesma linha. */
const NB = ' '
const neg = (t: string | number) => `**${t}**`
/** Milhar com ponto e decimal com vírgula, até duas casas: 1200 → '1.200'; 7.25 → '7,25'. */
function num(n: number): string {
  const r = Math.round(n * 100) / 100
  const [i, d] = String(Math.abs(r)).split('.')
  const int = i.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${r < 0 ? '−' : ''}${int}${d ? `,${d}` : ''}`
}
/** O mesmo em TeX: 7{,}25 e 1.200. */
const tx = (n: number) => num(n).replace(',', '{,}').replace('−', '-')
const med = (n: number | string, u: string) => `${typeof n === 'number' ? num(n) : n}${NB}${u}`
const reais = (n: number) => `R$${NB}${num(n)}`
const pct = (n: number) => `${num(n)}${NB}%`
/** "= 7,5" quando a conta fecha em duas casas; "≈ 9,53" quando não fecha. */
const ig = (v: number) => (Math.abs(v * 100 - Math.round(v * 100)) < 1e-9 ? `= ${tx(v)}` : `\\approx ${tx(v)}`)

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
/** Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada; tira as repetidas (fica a primeira) e embaralha. */
function escolha(r: Rng, opcoes: [string, string][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const unicas = opcoes.filter(([t], i) => opcoes.findIndex(([u]) => u === t) === i)
  const ordem = embaralha(r, unicas.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    if (o !== 0) erros[String(i)] = unicas[o][1]
  })
  return { opcoes: ordem.map((o) => unicas[o][0]), resposta: ordem.indexOf(0), erros }
}

/** A planta de um cômodo de c por l, com os lados medidos. */
const planta = (c: number, l: number, extra: Record<string, unknown>, esboco: string): Visual => ({
  modelo: 'figura',
  estado: { poligono: { vertices: [[0, 0], [c, 0], [c, l], [0, l]], preenchido: true, lados: [c, l, null, null] }, unidade: 'm', ...extra },
  esboco,
})

// ---------------------------------------------------------------- aula 1: o projeto

export const obraN1: Gerador = {
  id: 'obra-n1',
  aula: 'B.U20.A1',
  nivel: 1,
  gerar(r) {
    const tipo = r.pick(['rodape', 'piso', 'caixas'] as const)
    const c = r.int(3, 7)
    const l = r.int(2, c - 1)
    const area = c * l
    const volta = 2 * (c + l)
    if (tipo === 'rodape') {
      return {
        enunciado: `Um quarto tem ${neg(med(c, 'm'))} por ${neg(med(l, 'm'))}. Quantos metros de rodapé dão a volta no quarto?`,
        formato: 'numero',
        resposta: volta,
        erros: mapa(volta, [
          [c + l, 'perimetro-esquece-lados'],
          [area, 'confunde-area-perimetro'],
        ]),
        dicas: [
          'O rodapé corre na borda do chão: é o perímetro, a soma de todos os lados.',
          `Os lados de frente são iguais: ${c}, ${l}, ${c} e ${l}.`,
          `$${c} + ${l} + ${c} + ${l} = ${volta}$. São ${med(volta, 'm')} de rodapé.`,
        ],
        visual: planta(c, l, {}, `A planta do quarto, ${c} m por ${l} m.`),
      }
    }
    if (tipo === 'piso') {
      return {
        enunciado: `Um quarto tem ${neg(med(c, 'm'))} por ${neg(med(l, 'm'))}. Quantos m² de piso cobrem o chão?`,
        formato: 'numero',
        resposta: area,
        erros: mapa(area, [
          [volta, 'confunde-area-perimetro'],
          [c + l, 'soma-no-lugar-de-multiplicar'],
        ]),
        dicas: [
          'O piso cobre o chão de dentro: é a área, em quadrados de 1 m².',
          `São ${l} fileiras de ${c} quadrados.`,
          `$${c} \\cdot ${l} = ${area}$. São ${med(area, 'm²')} de piso.`,
        ],
        visual: planta(c, l, { grade: true }, `A planta do quarto, ${c} m por ${l} m, com a grade de 1 m².`),
      }
    }
    // Caixas, sem sobra: a divisão que não dá exata pede mais uma caixa.
    const ks = [2, 3, 4].filter((k) => area % k !== 0)
    if (ks.length === 0) return obraN1.gerar(r)
    const k = r.pick(ks)
    const caixas = Math.ceil(area / k)
    return {
      enunciado: `Um chão tem ${neg(med(c, 'm'))} por ${neg(med(l, 'm'))}. Cada caixa de piso cobre ${neg(med(k, 'm²'))}. Quantas caixas cobrem o chão?`,
      formato: 'numero',
      resposta: caixas,
      erros: mapa(caixas, [[Math.floor(area / k), 'ignora-contexto-do-resto']]),
      dicas: [
        'Divida a área do chão pelo que cobre uma caixa. A loja vende só caixas inteiras.',
        `A área é $${c} \\cdot ${l} = ${area}$ m². Divida por ${k}.`,
        `$${area} \\div ${k} ${ig(area / k)}$. Para não faltar piso, arredonde para cima: ${caixas} caixas.`,
      ],
      visual: planta(c, l, { grade: true }, `A planta do chão, ${c} m por ${l} m, com a grade de 1 m².`),
    }
  },
}

/** As janelas: a medida dita e a área, em décimos de m². */
const JANELAS: [string, number][] = [
  ['1,5 m²', 15],
  ['2 m²', 20],
  ['1 m²', 10],
]

export const obraN2: Gerador = {
  id: 'obra-n2',
  aula: 'B.U20.A1',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(['sobra', 'tinta'] as const)
    if (tipo === 'sobra') {
      const c = r.int(3, 8)
      const l = r.int(2, 6)
      const area = c * l
      // A caixa, em décimos de m²: 1,5, 2 ou 2,5 m². Com a sobra, a área é 11/10 dela.
      const k10 = r.pick([15, 20, 25])
      const k = k10 / 10
      const caixas = Math.ceil((11 * area) / k10)
      const semSobra = Math.ceil((10 * area) / k10)
      const paraBaixo = Math.floor((11 * area) / k10)
      const dez = Math.ceil((10 * (area + 10)) / k10)
      return {
        enunciado: `Um chão tem ${neg(med(c, 'm'))} por ${neg(med(l, 'm'))}. Cada caixa de piso cobre ${neg(med(k, 'm²'))}, e o pedreiro pede ${neg(pct(10))} a mais. Quantas caixas?`,
        formato: 'numero',
        resposta: caixas,
        erros: mapa(caixas, [
          [semSobra, 'esquece-a-sobra'],
          [paraBaixo, 'ignora-contexto-do-resto'],
          [dez, 'porcentagem-como-numero-inteiro'],
        ]),
        dicas: [
          'Some a sobra à área, divida pelo que cobre uma caixa e arredonde para cima.',
          `A área é $${c} \\cdot ${l} = ${area}$ m². Com ${pct(10)} a mais: $${area} + ${tx(area / 10)} = ${tx((11 * area) / 10)}$ m².`,
          `$${tx((11 * area) / 10)} \\div ${tx(k)} ${ig((11 * area) / k10)}$. Arredonde para cima: ${caixas} caixas.`,
        ],
      }
    }
    const c = r.int(3, 6)
    const l = r.int(3, c)
    // A altura, em décimos de metro: 2,5 m ou 3 m.
    const h10 = r.pick([25, 30])
    const [janela, j10] = r.pick(JANELAS)
    const lata = r.pick([10, 12, 15])
    // As áreas em décimos de m².
    const paredes10 = 2 * (c + l) * h10
    const pinta10 = paredes10 - 20 - j10
    const latas = Math.ceil(pinta10 / (10 * lata))
    return {
      enunciado: `Pinte as paredes de um quarto de ${neg(med(c, 'm'))} por ${neg(med(l, 'm'))} e ${neg(med(h10 / 10, 'm'))} de altura, sem a porta (${neg('2' + NB + 'm²')}) e a janela (${neg(janela.replace(' ', NB))}). Lata: ${neg(med(lata, 'm²'))}. Quantas latas?`,
      formato: 'numero',
      resposta: latas,
      erros: mapa(latas, [
        [Math.ceil(paredes10 / (10 * lata)), 'esquece-de-descontar-aberturas'],
        [Math.floor(pinta10 / (10 * lata)), 'ignora-contexto-do-resto'],
        [Math.ceil((paredes10 + 2 * 10 * c * l) / (10 * lata)), 'pinta-faces-a-mais'],
      ]),
      dicas: [
        'As 4 paredes: a volta do quarto vezes a altura. Tire a porta e a janela, divida pela lata e arredonde para cima.',
        `A volta é $${2 * (c + l)}$ m. As paredes: $${2 * (c + l)} \\cdot ${tx(h10 / 10)} = ${tx(paredes10 / 10)}$ m². Sem a porta e a janela: ${med(pinta10 / 10, 'm²')}.`,
        `$${tx(pinta10 / 10)} \\div ${lata} ${ig(pinta10 / (10 * lata))}$. Arredonde para cima: ${latas} latas.`,
      ],
    }
  },
}

export const obraN3: Gerador = {
  id: 'obra-n3',
  aula: 'B.U20.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['orcamento', 'pedreiro'] as const)
    if (tipo === 'orcamento') for (;;) {
      const q1 = r.int(5, 14)
      const p1 = r.pick([40, 50, 60, 70, 80])
      const m = r.int(10, 24)
      const p2 = r.pick([10, 12, 15])
      const q3 = r.int(2, 6)
      const p3 = r.pick([80, 90, 100, 110, 120])
      const total = q1 * p1 + m * p2 + q3 * p3
      const ds = [5, 10].filter((d) => (total * (100 - d)) % 100 === 0)
      if (ds.length === 0) continue
      const d = r.pick(ds)
      const paga = (total * (100 - d)) / 100
      const precos = p1 + p2 + p3
      return {
        enunciado: `Orçamento: ${neg(q1)} caixas de piso a ${neg(reais(p1))}, ${neg(med(m, 'm'))} de rodapé a ${neg(reais(p2))} e ${neg(q3)} latas a ${neg(reais(p3))}. À vista, ${neg(pct(d))} de desconto. Quanto pagar à vista?`,
        formato: 'numero',
        resposta: paga,
        erros: mapa(paga, [
          [total, 'responde-outra-pergunta'],
          [(total * d) / 100, 'desconto-como-preco-final'],
          [total - d, 'porcentagem-como-numero-inteiro'],
          [precos, 'esquece-a-quantidade'],
          [(precos * (100 - d)) / 100, 'esquece-a-quantidade'],
        ]),
        dicas: [
          'Cada coisa é a quantidade vezes o preço. Some tudo e depois tire o desconto.',
          `Piso: $${q1} \\cdot ${p1} = ${tx(q1 * p1)}$. Rodapé: $${m} \\cdot ${p2} = ${tx(m * p2)}$. Tinta: $${q3} \\cdot ${p3} = ${tx(q3 * p3)}$.`,
          `A obra: ${reais(total)}. ${pct(d)} de desconto: ${reais((total * d) / 100)}. À vista: ${reais(paga)}.`,
        ],
      }
    }
    const fixo = r.pick([30, 40, 50, 60, 80, 100])
    const a = r.int(8, 25)
    const x = r.pick([15, 20, 25, 30, 35, 40])
    const total = fixo + a * x
    return {
      enunciado: `O pedreiro cobra ${neg(reais(fixo))} fixos mais um valor por m². Por ${neg(med(a, 'm²'))} de piso, cobrou ${neg(reais(total))}. Quantos reais ele cobra por m²?`,
      formato: 'numero',
      resposta: x,
      erros: mapa(x, [
        [total / a, 'esquece-valor-fixo'],
        [total - fixo, 'esquece-de-dividir'],
        [(total + fixo) / a, 'desfaz-com-a-mesma-operacao'],
      ]),
      dicas: [
        `Monte a equação: o valor fixo mais ${a} vezes o preço do m² dá o total.`,
        `$${fixo} + ${a}x = ${tx(total)}$. Tire ${fixo} dos dois lados.`,
        `$${a}x = ${tx(total - fixo)}$, então $x = ${x}$: ${reais(x)} por m².`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: a avaliação final

const COISAS = ['Uma blusa', 'Um tênis', 'Uma cadeira', 'Um celular', 'Uma bicicleta', 'Um ventilador']
/** As cores do saco, no singular e no plural. */
const CORES: [string, string][] = [
  ['vermelha', 'vermelhas'],
  ['azul', 'azuis'],
  ['verde', 'verdes'],
]
const NOMES = ['Ana', 'Bia', 'Caio', 'Davi', 'Lia', 'Rui']

/** A chance em porcentagem: exata (30 %) ou "cerca de" (cerca de 43 %). */
const chancePct = (fav: number, tot: number) => {
  const p = (fav * 100) / tot
  return Number.isInteger(p) ? pct(p) : `cerca de ${pct(Math.round(p))}`
}

export const provaN1: Gerador = {
  id: 'prova-n1',
  aula: 'B.U20.A2',
  nivel: 1,
  gerar(r) {
    const tipo = r.pick(['desconto', 'pizza', 'chance', 'media'] as const)
    if (tipo === 'desconto') {
      const preco = 100 * r.int(2, 30)
      const d = r.pick([10, 15, 20, 25, 30])
      const desc = (preco * d) / 100
      const paga = preco - desc
      const coisa = r.pick(COISAS)
      return {
        enunciado: `${coisa} custa ${neg(reais(preco))}. À vista, tem ${neg(pct(d))} de desconto. Quanto você paga?`,
        formato: 'escolha',
        ...escolha(r, [
          [reais(paga), ''],
          [reais(desc), 'desconto-como-preco-final'],
          [reais(preco - d), 'porcentagem-como-numero-inteiro'],
          [reais(preco + desc), 'operacao-trocada'],
        ]),
        dicas: [
          'Ache o desconto e tire do preço. Cada quadradinho da grade é 1 % do preço.',
          `1 % de ${reais(preco)} é ${reais(preco / 100)}. ${pct(d)}: $${d} \\cdot ${tx(preco / 100)} = ${tx(desc)}$.`,
          `$${tx(preco)} - ${tx(desc)} = ${tx(paga)}$. Você paga ${reais(paga)}.`,
        ],
        visual: { modelo: 'grade', estado: { pintadas: 100, leitura: { vezes: preco / 100, antes: 'R$ ' } }, esboco: `A grade inteira: ${reais(preco)}, cada quadradinho ${reais(preco / 100)}.` },
      }
    }
    if (tipo === 'pizza') {
      const n = r.pick([6, 8, 10, 12])
      let k = r.int(1, n - 2)
      if (2 * k === n) k += 1
      const s = n - k
      const fr = (a: number, b: number) => `$\\frac{${a}}{${b}}$`
      return {
        enunciado: `Uma pizza foi cortada em ${neg(n)} fatias iguais. Você comeu ${neg(k)}. Que fração da pizza sobrou?`,
        formato: 'escolha',
        ...escolha(r, [
          [fr(s, n), ''],
          [fr(k, n), 'responde-outra-pergunta'],
          [fr(s, k), 'pintadas-sobre-nao-pintadas'],
          [fr(n, s), 'troca-numerador-denominador'],
        ]),
        dicas: [
          'Embaixo vai em quantas fatias a pizza foi cortada. Em cima, as que sobraram.',
          `Sobraram $${n} - ${k} = ${s}$ fatias, de ${n}.`,
          `A fração que sobrou é $\\frac{${s}}{${n}}$.`,
        ],
        visual: { modelo: 'barra', estado: { partes: n, pintadas: k, semFracao: true }, esboco: `A barra em ${n} partes, com ${k} pintadas: as fatias comidas.` },
      }
    }
    if (tipo === 'chance') {
      const tot = r.pick([10, 20])
      // Três cores, cada uma com pelo menos 2 bolas.
      const a = r.int(2, tot - 4)
      const b = r.int(2, tot - a - 2)
      const qs = [a, b, tot - a - b]
      const i = r.int(0, 2)
      const fav = qs[i]
      const certa = chancePct(fav, tot)
      const plur = CORES[i][1]
      return {
        enunciado: `Num saco há ${neg(qs[0])} bolas vermelhas, ${neg(qs[1])} azuis e ${neg(qs[2])} verdes. Tirando uma sem olhar, qual é a chance de sair uma ${CORES[i][0]}?`,
        formato: 'escolha',
        ...escolha(r, [
          [certa, ''],
          [pct(fav), 'parte-como-porcentagem'],
          [chancePct(fav, tot - fav), 'pintadas-sobre-nao-pintadas'],
          [chancePct(1, 3), 'resultados-como-casos-iguais'],
        ]),
        dicas: [
          'A chance é o número de casos que servem dividido pelo número de casos possíveis. Cada bola é um caso.',
          `São ${tot} bolas, e ${fav} são ${plur}: $\\frac{${fav}}{${tot}}$.`,
          `$\\frac{${fav}}{${tot}} = \\frac{${(fav * 100) / tot}}{100}$: ${certa}.`,
        ],
        visual: { modelo: 'sorteio', estado: { bolas: { vermelha: qs[0], azul: qs[1], verde: qs[2] } }, esboco: `O saco: ${qs[0]} vermelhas, ${qs[1]} azuis e ${qs[2]} verdes.` },
      }
    }
    // Média de 5 valores, com um valor repetido.
    for (;;) {
      const media = r.int(5, 12)
      const vs = [media - r.int(1, 4), 0, 0, 0, 0]
      vs[1] = media + r.int(-3, 3)
      vs[2] = vs[1]
      vs[3] = media + r.int(1, 5)
      vs[4] = 5 * media - vs[0] - vs[1] - vs[2] - vs[3]
      if (vs.some((v) => v <= 0) || vs[4] > media + 8) continue
      if (new Set(vs).size !== 4) continue
      const fila = [...vs].sort((x, y) => x - y)
      const mediana = fila[2]
      const meio = (fila[0] + fila[4]) / 2
      const distintos = [...new Set(vs)]
      const semRepetir = distintos.reduce((s, v) => s + v, 0) / distintos.length
      const ops = [media, mediana, meio, semRepetir]
      if (new Set(ops.map((o) => Math.round(o * 100))).size !== 4) continue
      if (!Number.isInteger(semRepetir * 100)) continue
      const ordem = embaralha(r, vs)
      const nome = r.pick(NOMES)
      const lista = `${ordem.slice(0, 4).map(neg).join(', ')} e ${neg(med(ordem[4], 'km'))}`
      return {
        enunciado: `${nome} correu ${lista} em 5 dias. Qual foi a média por dia?`,
        formato: 'escolha',
        ...escolha(r, [
          [med(media, 'km'), ''],
          [med(mediana, 'km'), 'troca-media-mediana-moda'],
          [med(meio, 'km'), 'media-do-menor-e-do-maior'],
          [med(semRepetir, 'km'), 'media-esquece-valores'],
        ]),
        dicas: [
          'A média é a soma de todos os valores dividida pela quantidade de valores.',
          `A soma: $${ordem.join(' + ')} = ${5 * media}$. São 5 dias.`,
          `$${5 * media} \\div 5 = ${media}$. A média é ${med(media, 'km')} por dia.`,
        ],
        visual: { modelo: 'dados', estado: { valores: ordem, unidade: 'km' }, esboco: 'Os 5 valores como pontos sobre a reta dos km.' },
      }
    }
  },
}

/** Os pacotes de queijo, para o decimal maior. */
export const provaN2: Gerador = {
  id: 'prova-n2',
  aula: 'B.U20.A2',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(['onibus', 'temperatura', 'decimal', 'copos'] as const)
    if (tipo === 'onibus') {
      for (;;) {
        const cap = r.pick([12, 15, 20, 30, 40, 45])
        const q = r.int(2, 8)
        const resto = r.int(1, cap - 1)
        const n = q * cap + resto
        if (resto === q || resto === q + 1) continue
        const carro = r.pick(['ônibus', 'vans'] as const)
        const um = carro === 'ônibus' ? 'Cada ônibus' : 'Cada van'
        const pl = (k: number) => `${k} ${k === 1 && carro === 'vans' ? 'van' : carro}`
        return {
          enunciado: `Uma excursão tem ${neg(n)} pessoas. ${um} leva ${neg(cap)}. Quantos ${carro === 'ônibus' ? 'ônibus são precisos' : 'vans são precisas'}, no mínimo?`.replace('Quantos vans', 'Quantas vans'),
          formato: 'escolha',
          ...escolha(r, [
            [pl(q + 1), ''],
            [pl(q), 'ignora-contexto-do-resto'],
            [pl(resto), 'troca-quociente-e-resto'],
            [pl(n - cap), 'operacao-trocada'],
          ]),
          dicas: [
            'Divida as pessoas pelos lugares. Depois decida o que fazer com quem sobra.',
            `$${n} \\div ${cap} = ${q}$, e sobram ${resto} pessoas.`,
            `As ${resto} pessoas que sobram também vão: ${q} + 1 = ${q + 1} ${carro}.`,
          ],
        }
      }
    }
    if (tipo === 'temperatura') {
      const a = r.int(1, 9)
      let b = r.int(1, 15)
      if (b === a || a === 2 * b) b += 1
      if (b === a) b += 1
      const sobe = a + b
      return {
        enunciado: `De madrugada fez ${neg(`−${a}${NB}°C`)}. À tarde, ${neg(`${b}${NB}°C`)}. Quantos graus a temperatura subiu?`,
        formato: 'escolha',
        ...escolha(r, [
          [`${sobe} graus`, ''],
          [`${Math.abs(b - a)} graus`, 'tirar-negativo-subtrai'],
          [`${b} graus`, 'responde-outra-pergunta'],
        ]),
        dicas: [
          'Ande na reta do −' + a + ' até o ' + b + ', passando pelo zero.',
          `Do −${a} até o 0 são ${a} graus. Do 0 até o ${b}, mais ${b}.`,
          `$${a} + ${b} = ${sobe}$: a temperatura subiu ${sobe} graus.`,
        ],
      }
    }
    if (tipo === 'decimal') {
      // O maior tem uma casa só; os outros são mais compridos e menores.
      const x = r.int(3, 8)
      const maior = `0,${x}`
      const outros = [`0,${x - 1}${r.int(1, 9)}`, `0,${x - 2}${r.int(1, 9)}${r.int(1, 9)}`, `0,0${r.int(2, 9)}`]
      return {
        enunciado: 'Quatro pacotes de queijo. Qual é o mais pesado?',
        formato: 'escolha',
        ...escolha(r, [
          [med(maior, 'kg'), ''],
          ...outros.map((o): [string, string] => [med(o, 'kg'), 'decimal-mais-casas-maior']),
        ]),
        dicas: [
          'Compare casa por casa, a partir da vírgula: primeiro os décimos.',
          `Os décimos: ${maior} tem ${x}; os outros têm ${x - 1}, ${x - 2} e 0.`,
          `O mais pesado é ${med(maior, 'kg')}. Mais casas não quer dizer mais peso.`,
        ],
      }
    }
    for (;;) {
      const g10 = r.pick([10, 15, 20, 25, 30])
      const copo = r.pick([200, 250, 300, 500])
      const ml = g10 * 100
      if (ml % copo !== 0) continue
      const n = ml / copo
      const copos = (k: number) => `${num(k)} ${k < 2 ? 'copo' : 'copos'}`
      return {
        enunciado: `Uma garrafa tem ${neg(med(g10 / 10, 'L'))} de suco. Quantos copos de ${neg(med(copo, 'mL'))} ela enche?`,
        formato: 'escolha',
        ...escolha(r, [
          [copos(n), ''],
          [copos(n / 10), 'fator-de-conversao-errado'],
          [copos(n * 10), 'fator-de-conversao-errado'],
        ]),
        dicas: [
          'Ponha tudo na mesma unidade: 1 L tem 1.000 mL.',
          `${med(g10 / 10, 'L')} são ${med(ml, 'mL')}.`,
          `$${tx(ml)} \\div ${copo} = ${n}$: ${copos(n)}.`,
        ],
      }
    }
  },
}

export const provaN3: Gerador = {
  id: 'prova-n3',
  aula: 'B.U20.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['equacao', 'raiz', 'volume', 'receita'] as const)
    if (tipo === 'equacao') for (;;) {
      const fixo = r.pick([20, 25, 30, 35, 40, 50])
      const k = r.pick([2, 3, 4, 5])
      const x = r.int(3, 15)
      const total = fixo + k * x
      const ctx = r.pick(['celular', 'taxi'] as const)
      const u = ctx === 'celular' ? 'GB' : 'km'
      const enunciado =
        ctx === 'celular'
          ? `Um plano de celular custa ${neg(reais(fixo))} por mês, mais ${neg(reais(k))} por GB extra. A conta veio ${neg(reais(total))}. Quantos GB extras?`
          : `Uma viagem de carro de aplicativo custa ${neg(reais(fixo))} fixos, mais ${neg(reais(k))} por km. Você pagou ${neg(reais(total))}. Quantos km?`
      const ops: [string, string][] = [
        [med(x, u), ''],
        [med(total - fixo, u), 'esquece-de-dividir'],
      ]
      if (total % k === 0) ops.push([med(total / k, u), 'esquece-valor-fixo'])
      if ((total + fixo) % k === 0) ops.push([med((total + fixo) / k, u), 'desfaz-com-a-mesma-operacao'])
      if (ops.length < 3) continue
      return {
        enunciado,
        formato: 'escolha',
        ...escolha(r, ops),
        dicas: [
          `Monte a equação: o valor fixo mais ${k} vezes x dá o total.`,
          `$${fixo} + ${k}x = ${total}$. Tire ${fixo} dos dois lados: $${k}x = ${total - fixo}$.`,
          `$x = ${total - fixo} \\div ${k} = ${x}$: ${med(x, u)}.`,
        ],
      }
    }
    if (tipo === 'raiz') {
      const s = r.int(5, 15)
      const area = s * s
      return {
        enunciado: `Um terreno quadrado tem ${neg(med(area, 'm²'))} de área. Quanto mede cada lado?`,
        formato: 'escolha',
        ...escolha(r, [
          [med(s, 'm'), ''],
          [med(area / 2, 'm'), 'raiz-e-a-metade'],
          [med(area / 4, 'm'), 'confunde-area-perimetro'],
        ]),
        dicas: [
          'A área do quadrado é o lado vezes o lado. Procure o número que, vezes ele mesmo, dá a área.',
          `Experimente: $${s - 1} \\cdot ${s - 1} = ${(s - 1) * (s - 1)}$. Falta pouco.`,
          `$${s} \\cdot ${s} = ${area}$: cada lado mede ${med(s, 'm')}.`,
        ],
      }
    }
    if (tipo === 'volume') {
      for (;;) {
        const c = r.int(1, 4)
        const l = r.int(1, 3)
        const h = r.int(1, 2)
        const v = c * l * h
        const sup = 2 * (c * l + c * h + l * h)
        if (sup === v) continue
        const litros = (n: number) => `${num(n)} ${n === 1 ? 'litro' : 'litros'}`
        return {
          enunciado: `Uma caixa-d'água tem ${neg(med(c, 'm'))} por ${neg(med(l, 'm'))} por ${neg(med(h, 'm'))}. Quantos litros cabem nela?`,
          formato: 'escolha',
          ...escolha(r, [
            [litros(v * 1000), ''],
            [litros(v), 'confunde-m3-com-litro'],
            [litros(v * 100), 'fator-de-conversao-errado'],
            [litros(sup * 1000), 'confunde-volume-superficie'],
          ]),
          dicas: [
            'Ache o volume em m³ e lembre: cada m³ guarda 1.000 litros.',
            `O volume: $${c} \\cdot ${l} \\cdot ${h} = ${v}$ m³.`,
            `$${v} \\cdot 1.000 = ${tx(v * 1000)}$: ${litros(v * 1000)}.`,
          ],
        }
      }
    }
    // A receita: a xícaras para b pães (u pães por xícara); para c pães, t xícaras.
    for (;;) {
      const u = r.int(2, 6)
      const a = r.int(2, 5)
      const t = r.int(2, 9)
      if (t === a) continue
      const b = a * u
      const c = t * u
      const aditivo = a + (c - b)
      const ops: [string, string][] = [
        [`${t} xícaras`, ''],
        [`${b * c / a} xícaras`, 'razao-invertida'],
      ]
      if (aditivo > 0) ops.push([`${aditivo} xícaras`, 'pensa-aditivamente'])
      if (ops.length < 3) continue
      return {
        enunciado: `Uma receita usa ${neg(a)} xícaras de farinha para ${neg(b)} pães. Quantas xícaras para ${neg(c)} pães?`,
        formato: 'escolha',
        ...escolha(r, ops),
        dicas: [
          'Passe pelo 1: quantos pães sai com 1 xícara?',
          `$${b} \\div ${a} = ${u}$: cada xícara dá ${u} pães.`,
          `$${c} \\div ${u} = ${t}$: ${t} xícaras.`,
        ],
      }
    }
  },
}

export const GERADORES_U20: Gerador[] = [obraN1, obraN2, obraN3, provaN1, provaN2, provaN3]
