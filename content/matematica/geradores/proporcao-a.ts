import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 10: razão e proporção (aulas 1 a 3). Razão, escala, proporção e
// regra de três. Todo número com vírgula é guardado como um inteiro n e um
// número de casas decimais d (o valor é n ÷ 10^d), para nenhuma conta passar
// por um decimal de JavaScript. dec(p, q) escreve p ÷ q assim, quando a
// divisão é exata em poucas casas.

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
/** Como o aluno digita: um inteiro vira número; um decimal, texto com vírgula ('2,5'). */
const resposta = (n: number, d = 0): number | string => {
  const [i, f] = partes(n, d)
  return f ? `${i},${f}` : Number(i)
}
/** p ÷ q como [n, d], se a divisão for exata em até 4 casas; senão, null. */
function dec(p: number, q: number): [number, number] | null {
  for (let d = 0; d <= 4; d++) if ((p * 10 ** d) % q === 0) return [(p * 10 ** d) / q, d]
  return null
}
const dig = (m: [number, number]) => String(resposta(...m))

/** "0,50" e "0,5" são o mesmo número. */
const norm = (s: string) => (s.includes(',') ? s.replace(/0+$/, '').replace(/,$/, '') : s)
/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number | string, pares: [string | null, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([norm(String(certa))])
  for (const [valor, erro] of pares) {
    if (valor === null || vistos.has(norm(valor))) continue
    vistos.add(norm(valor))
    erros[valor] = erro
  }
  return erros
}
/** Um erro só quando a conta errada dá um número positivo. */
const positivo = (v: number) => (v > 0 ? String(v) : null)
/** Um erro de divisão só quando ela é exata. */
const divisao = (p: number, q: number) => {
  const m = dec(p, q)
  return m ? dig(m) : null
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

const tabela = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })

// ---------------------------------------------------------------- aula 1: razão

export const razaoN1: Gerador = {
  id: 'razao-n1',
  aula: 'B.U10.A1',
  nivel: 1,
  gerar(r) {
    const a = r.int(1, 3)
    const m = r.int(2, 4)
    const b = a * m
    const copos = a === 1 ? '1 copo' : `${a} copos`
    return {
      enunciado: `Na jarra, **${copos} de suco** e **${b} copos de água**. Quantos copos de água para cada copo de suco?`,
      formato: 'numero',
      resposta: m,
      erros: mapa(m, [
        [positivo(b - a), 'pensa-aditivamente'],
        [divisao(a, b), 'razao-invertida'],
      ]),
      dicas: [
        'A razão compara por divisão: quantas vezes o suco cabe na água?',
        `Divida a água pelo suco: ${b} ÷ ${a}.`,
        `${b} ÷ ${a} = ${m}: ${m} copos de água para cada copo de suco.`,
      ],
      visual: { modelo: 'barra', estado: { partes: a + b, pintadas: a, semFracao: true }, esboco: `A jarra como uma barra de ${a + b} copos: ${a} em âmbar (suco) e ${b} apagados (água).` },
    }
  },
}

const MISTURAS: [string, string, string][] = [
  ['xícaras', 'açúcar', 'farinha'],
  ['latas', 'cimento', 'areia'],
  ['latas', 'tinta branca', 'tinta azul'],
  ['colheres', 'café', 'açúcar'],
  ['copos', 'leite', 'água'],
]

export const razaoN2: Gerador = {
  id: 'razao-n2',
  aula: 'B.U10.A1',
  nivel: 2,
  gerar(r) {
    const [unid, x, y] = r.pick(MISTURAS)
    const a = r.int(2, 5)
    const b = a + r.int(1, 4)
    const xPrimeiro = r.int(0, 1) === 0
    const [P, Q, p, q] = xPrimeiro ? [x, y, a, b] : [y, x, b, a]
    return {
      enunciado: `A mistura leva **${a} ${unid} de ${x}** para **${b} de ${y}**. Qual é a razão de **${P} para ${Q}**?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `${p} : ${q}`, certa: true },
        { texto: `${q} : ${p}`, erro: 'razao-invertida' },
        { texto: `${p} : ${a + b}` },
      ]),
      dicas: [
        'Na razão, a ordem é a da pergunta: o que vem primeiro na pergunta vem primeiro.',
        `A pergunta começa por ${P}: são ${p} ${unid}.`,
        `${P[0].toUpperCase()}${P.slice(1)} para ${Q}: ${p} : ${q}.`,
      ],
      visual: tabela({ linhas: [{ rotulo: `${x} (${unid})`, valores: [a] }, { rotulo: `${y} (${unid})`, valores: [b] }] }, `Uma tabela de uma coluna: ${a} de ${x} em cima, ${b} de ${y} embaixo.`),
    }
  },
}

/** [início da frase, o que se põe, o que se mistura, "Quantos/Quantas", o nome no singular]. */
const POR_UM: [string, string, string, string, string][] = [
  ['Na obra, a massa leva', 'latas de cimento', 'latas de areia', 'Quantas', 'lata de cimento'],
  ['O refresco leva', 'litros de suco', 'litros de água', 'Quantos', 'litro de suco'],
  ['O adubo leva', 'colheres de pó', 'litros de água', 'Quantos', 'colher de pó'],
  ['A tinta leva', 'latas de branco', 'latas de cinza', 'Quantas', 'lata de branco'],
]

export const razaoN3: Gerador = {
  id: 'razao-n3',
  aula: 'B.U10.A1',
  nivel: 3,
  gerar(r) {
    const [inicio, xs, ys, quantos, um] = r.pick(POR_UM)
    let a: number
    let b: number
    if (r.int(0, 1) === 0) {
      // Uma razão inteira: 3 para 12 é 1 para 4.
      a = r.int(2, 5)
      b = a * r.int(2, 6)
    } else {
      // Uma razão com meio: 2 para 5 é 1 para 2,5.
      const t = r.int(1, 3)
      a = 2 * t
      b = t * r.pick([3, 5, 7, 9])
    }
    const certa = resposta(...dec(b, a)!)
    return {
      enunciado: `${inicio} **${a} ${xs}** para **${b} ${ys}**. ${quantos} ${ys} para cada ${um}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [positivo(b - a), 'pensa-aditivamente'],
        [divisao(a, b), 'razao-invertida'],
      ]),
      dicas: [
        'Razão "por um": divida os dois pelo mesmo número, até o primeiro virar 1.',
        `Divida os dois por ${a}: ${a} ÷ ${a} = 1, e ${b} ÷ ${a} = ?`,
        `${b} ÷ ${a} = ${String(certa)}: ${String(certa)} ${ys} para cada ${um}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: escala

export const escalaN1: Gerador = {
  id: 'escala-n1',
  aula: 'B.U10.A2',
  nivel: 1,
  gerar(r) {
    const e = r.pick([10, 20, 25, 50, 100])
    const c = r.int(2, 9)
    const certa = c * e
    return {
      enunciado: `No mapa, **1 cm = ${e} km**. Uma estrada mede **${c} cm** no mapa. Quantos quilômetros de verdade?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(c + e), 'pensa-aditivamente'],
        [divisao(c, e), 'converte-no-sentido-errado'],
      ]),
      dicas: [
        `Cada centímetro do mapa vale ${e} km de verdade.`,
        `São ${c} centímetros: ${c} vezes ${e} km.`,
        `${c} × ${e} = ${escrito(certa)} km.`,
      ],
      visual: tabela(
        { linhas: [{ rotulo: 'no mapa (cm)', valores: [1, c] }, { rotulo: 'de verdade (km)', valores: [e, '?'] }], fator: `× ${e}` },
        `A tabela: 1 cm e ${e} km; ${c} cm e "?". A seta "× ${e}" à direita, do mapa para a estrada.`,
      ),
    }
  },
}

export const escalaN2: Gerador = {
  id: 'escala-n2',
  aula: 'B.U10.A2',
  nivel: 2,
  gerar(r) {
    const n = r.pick([50, 100])
    // A medida no papel em décimos de cm: 2 cm, 2,5 cm… 9,5 cm.
    const ct = 10 * r.int(2, 9) + r.pick([0, 5])
    const cm: [number, number] = [ct * n, 1]
    const metros: [number, number] = [ct * n, 3]
    const certa = resposta(...metros)
    return {
      enunciado: `A planta baixa tem escala **1 : ${n}**. Uma parede mede **${escrito(ct, 1)} cm** na planta. Quanto ela mede de verdade, em metros?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dig(cm), 'escala-unidade-esquecida'],
        [dig([ct * n, 2]), 'fator-de-conversao-errado'],
      ]),
      dicas: [
        `Na escala 1 : ${n}, 1 cm no papel vale ${n} cm de verdade.`,
        `${escrito(ct, 1)} × ${n} = ${escrito(...cm)} cm. Agora passe para metros.`,
        `${escrito(...cm)} cm = ${escrito(...metros)} m.`,
      ],
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 10, passo: 0.5, marcas: [0, 2, 4, 6, 8, 10], numero: ct / 10, unidade: 'cm' },
        esboco: `Uma régua de 0 a 10 cm sobre a planta, com o ponto âmbar em ${escrito(ct, 1)} cm: a parede.`,
      },
    }
  },
}

export const escalaN3: Gerador = {
  id: 'escala-n3',
  aula: 'B.U10.A2',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Da estrada para o mapa: dividir pela escala.
      const e = r.pick([20, 25, 50, 100])
      const c = r.int(2, 9)
      const d = c * e
      return {
        enunciado: `Duas cidades ficam a **${escrito(d)} km** uma da outra. No mapa, **1 cm = ${e} km**. Quantos centímetros no mapa?`,
        formato: 'numero',
        resposta: c,
        erros: mapa(c, [
          [String(d * e), 'converte-no-sentido-errado'],
          [String(d - e), 'pensa-aditivamente'],
        ]),
        dicas: [
          'Da verdade para o mapa, o número diminui: divida.',
          `Quantos ${e} km cabem em ${escrito(d)} km?`,
          `${escrito(d)} ÷ ${e} = ${c} cm.`,
        ],
      }
    }
    // Do cômodo para a planta: passar a centímetros e dividir pela escala.
    const n = r.pick([50, 100])
    const mt = 10 * r.int(2, 8) + r.pick([0, 5])
    const cm: [number, number] = [(mt * 1000) / n, 2]
    const certa = resposta(...cm)
    return {
      enunciado: `O quarto mede **${escrito(mt, 1)} m** de comprimento. Na planta, com escala **1 : ${n}**, quantos centímetros ele tem?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(mt * 10 * n), 'converte-no-sentido-errado'],
        [dig([(mt * 100) / n, 3]), 'escala-unidade-esquecida'],
      ]),
      dicas: [
        'Primeiro, a medida de verdade em centímetros. Depois, divida pela escala.',
        `${escrito(mt, 1)} m = ${escrito(mt * 10)} cm.`,
        `${escrito(mt * 10)} ÷ ${n} = ${escrito(...cm)} cm.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: regra de três

/**
 * [rótulo de cima, rótulo de baixo, frase com {a} {b} {c}, o maior valor por um].
 * As três medidas vêm em negrito, nessa ordem.
 */
type Situacao = [string, string, (a: number, b: number, c: number) => string, number]
const SITUACOES: Situacao[] = [
  ['farinha (xícaras)', 'ovos', (a, b, c) => `O bolo leva **${a} xícaras de farinha** para **${b} ovos**. Com **${c} xícaras**, quantos ovos?`, 2],
  ['tinta (latas)', 'parede (m²)', (a, b, c) => `**${a} latas** de tinta pintam **${b} m²** de parede. Quantos m² com **${c} latas**?`, 9],
  ['feijão (kg)', 'preço (R$)', (a, b, c) => `**${a} kg** de feijão custam **R$ ${b}**. Quanto custam **${c} kg**, em reais?`, 9],
  ['pães', 'preço (R$)', (a, b, c) => `**${a} pães** custam **R$ ${b}**. Quanto custam **${c} pães**, em reais?`, 3],
]

export const regraDeTresN1: Gerador = {
  id: 'regra-de-tres-n1',
  aula: 'B.U10.A3',
  nivel: 1,
  gerar(r) {
    const [cima, baixo, frase, max] = r.pick(SITUACOES)
    const a = r.int(2, 5)
    // Até max por um, para a receita ter cara de verdade (2 xícaras, no máximo 4 ovos).
    const b = r.int(2, a * max)
    const k = r.int(2, 5)
    const c = a * k
    const certa = b * k
    return {
      enunciado: frase(a, b, c),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(b + c - a), 'pensa-aditivamente'],
        [String(b), 'muda-so-um-termo'],
      ]),
      dicas: [
        'Uma razão igual: os dois números vezes o mesmo número.',
        `${c} é ${a} vezes quanto? ${a} × ${k} = ${c}.`,
        `Embaixo também × ${k}: ${b} × ${k} = ${certa}.`,
      ],
      visual: tabela(
        { linhas: [{ rotulo: cima, valores: [a, c] }, { rotulo: baixo, valores: [b, '?'] }], setas: [{ de: 0, para: 1, rotulo: `× ${k}` }] },
        `A tabela de proporção: ${a} e ${b}; ${c} e "?". Em cima, a seta "× ${k}"; embaixo, ainda nenhuma.`,
      ),
    }
  },
}

export const regraDeTresN2: Gerador = {
  id: 'regra-de-tres-n2',
  aula: 'B.U10.A3',
  nivel: 2,
  gerar(r) {
    const [cima, baixo, frase, max] = r.pick(SITUACOES)
    const a = r.int(2, 5)
    const u = r.int(2, max)
    const b = a * u
    // A coluna nova não é um múltiplo da primeira: 3 → 5, 4 → 6.
    const c = a * r.int(1, 2) + r.int(1, a - 1)
    const certa = c * u
    return {
      enunciado: frase(a, b, c),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(b + c - a), 'pensa-aditivamente'],
        [divisao(b * a, c), 'razao-invertida'],
        [String(b), 'muda-so-um-termo'],
      ]),
      dicas: [
        `De ${a} para ${c} não é vezes um número inteiro. Passe pelo 1.`,
        `÷ ${a} nos dois: 1 e ${b} ÷ ${a} = ${u}.`,
        `× ${c} nos dois: ${u} × ${c} = ${certa}. Pelo atalho: ${b} × ${c} ÷ ${a} = ${certa}.`,
      ],
      visual: tabela(
        { linhas: [{ rotulo: cima, valores: [a, 1, c] }, { rotulo: baixo, valores: [b, '?', '?'] }] },
        `A tabela de proporção: ${a} e ${b}; no meio, 1 e "?"; à direita, ${c} e "?". Sem setas.`,
      ),
    }
  },
}

/** [frase com {a} {b} {c}, valores de a, faixa do valor por um em metades]. */
type Contexto = [(a: string, b: string, c: string) => string, number[], [number, number]]
const CONTEXTOS: Contexto[] = [
  [(a, b, c) => `Com **${a} L** de tinta você pinta **${b} m²**. Quantos m² você pinta com **${c} L**?`, [2, 4, 6], [10, 24]],
  [(a, b, c) => `Com **${a} L** de gasolina, o carro anda **${b} km**. Quantos km ele anda com **${c} L**?`, [2, 4, 6], [16, 30]],
  [(a, b, c) => `Para **${a} pessoas**, a receita usa **${b} xícaras** de arroz. Quantas xícaras para **${c} pessoas**?`, [4, 6, 8], [1, 1]],
  [(a, b, c) => `Uma torneira enche **${a} baldes** em **${b} minutos**. Em quantos minutos enche **${c} baldes**?`, [2, 4, 6], [3, 9]],
]

export const regraDeTresN3: Gerador = {
  id: 'regra-de-tres-n3',
  aula: 'B.U10.A3',
  nivel: 3,
  gerar(r) {
    const [frase, as, [lo, hi]] = r.pick(CONTEXTOS)
    const a = r.pick(as)
    // O valor por um em metades (u2 = 3 é 1,5), para a resposta ter no máximo uma vírgula e um 5.
    const u2 = r.int(lo, hi)
    const b = (a * u2) / 2
    const c = r.int(a + 1, 3 * a)
    const m = dec(b * c, a)!
    const certa = resposta(...m)
    return {
      enunciado: frase(String(a), escrito(b), String(c)),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(b + c - a), 'pensa-aditivamente'],
        [divisao(b * a, c), 'razao-invertida'],
      ]),
      dicas: [
        'Os dois números mudam vezes o mesmo número. Passe pelo 1, ou use o atalho.',
        `Para 1: ${escrito(b)} ÷ ${a} = ${escrito(...dec(b, a)!)}.`,
        `${escrito(b)} × ${c} ÷ ${a} = ${escrito(...m)}.`,
      ],
    }
  },
}

export const GERADORES_U10A: Gerador[] = [
  razaoN1, razaoN2, razaoN3,
  escalaN1, escalaN2, escalaN3,
  regraDeTresN1, regraDeTresN2, regraDeTresN3,
]
