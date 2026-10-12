import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 7: frações (aulas 1 a 5). Partes iguais de um todo, a fração na
// reta, a fração como divisão, as equivalentes e a simplificação. As
// frações aparecem em TeX ($\frac{3}{4}$) e as respostas são escolhas ou o
// número que falta.

/** Erros previsíveis, sem nunca marcar a resposta certa e sem sobrescrever. */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor !== certa && valor >= 0 && !(String(valor) in erros)) erros[String(valor)] = erro
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

const mdc = (a: number, b: number): number => (b === 0 ? a : mdc(b, a % b))
/** A fração em TeX, pronta para o texto. */
const fr = (n: number, d: number) => `$\\frac{${n}}{${d}}$`
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })

/** Pares [total, pegas] com 1 ≤ pegas < total e pegas diferente da metade. */
function pares(de: number, ate: number): [number, number][] {
  const out: [number, number][] = []
  for (let d = de; d <= ate; d++) for (let p = 1; p < d; p++) if (2 * p !== d) out.push([d, p])
  return out
}
/** Frações próprias irredutíveis n/d, com d até `ate`. */
function irredutiveis(ate: number): [number, number][] {
  const out: [number, number][] = []
  for (let d = 2; d <= ate; d++) for (let n = 1; n < d; n++) if (mdc(n, d) === 1) out.push([n, d])
  return out
}

/**
 * As 4 opções de "que fração é essa": k das d partes. Os erros: k sobre as
 * outras partes (o), e os números trocados. As outras partes sobre d entram
 * sem erro (leu a parte errada).
 */
const opcoesParte = (k: number, d: number): Op[] => [
  { texto: fr(k, d), certa: true },
  { texto: fr(k, d - k), erro: 'pintadas-sobre-nao-pintadas' },
  { texto: fr(d, k), erro: 'troca-numerador-denominador' },
  { texto: fr(d - k, d) },
]

// ---------------------------------------------------------------- aula 1: partes iguais

const PARES_N1 = pares(3, 8)

export const partesIguaisN1: Gerador = {
  id: 'partes-iguais-n1',
  aula: 'B.U7.A1',
  nivel: 1,
  gerar(r) {
    const [d, p] = r.pick(PARES_N1)
    return {
      enunciado: 'A barra está cortada em partes iguais. Que fração dela está pintada?',
      formato: 'escolha',
      ...embaralhar(r, opcoesParte(p, d)),
      dicas: [
        'Embaixo vai o total de partes iguais. Em cima, as pintadas.',
        `Conte todas as partes, pintadas ou não: são ${d}.`,
        `${p} pintadas de ${d} partes: ${fr(p, d)}.`,
      ],
      visual: barra({ partes: d, pintadas: p, semFracao: true }, `Uma barra de ${d} partes iguais, com ${p} pintadas e a fração escondida. Ao conferir, ${p}/${d} aparece ao lado.`),
    }
  },
}

const PARES_N2 = pares(4, 10)

export const partesIguaisN2: Gerador = {
  id: 'partes-iguais-n2',
  aula: 'B.U7.A1',
  nivel: 2,
  gerar(r) {
    const [d, p] = r.pick(PARES_N2)
    const s = d - p
    return {
      enunciado: 'A barra está cortada em partes iguais. Que fração dela ficou **sem** pintar?',
      formato: 'escolha',
      ...embaralhar(r, opcoesParte(s, d)),
      dicas: [
        'O de baixo continua sendo o total de partes da barra, pintadas ou não.',
        `A barra tem ${d} partes. Quantas estão sem pintar?`,
        `${d} − ${p} = ${s} sem pintar, de ${d}: ${fr(s, d)}.`,
      ],
      visual: barra({ partes: d, pintadas: p, semFracao: true }, `Uma barra de ${d} partes iguais, ${p} pintadas. Ao conferir, as ${s} partes sem pintar se contornam.`),
    }
  },
}

type Contexto = { pegou: (d: number, k: number) => string; sobrou: (d: number, k: number) => string }
const CONTEXTOS_PARTES: Contexto[] = [
  {
    pegou: (d, k) => `Uma pizza tem ${d} fatias iguais. Você comeu ${k}. Que fração da pizza você comeu?`,
    sobrou: (d, k) => `Uma pizza tem ${d} fatias iguais. Você comeu ${k}. Que fração da pizza sobrou?`,
  },
  {
    pegou: (d, k) => `Um terreno foi dividido em ${d} lotes iguais, e ${k} foram vendidos. Que fração do terreno foi vendida?`,
    sobrou: (d, k) => `Um terreno foi dividido em ${d} lotes iguais, e ${k} foram vendidos. Que fração ainda está à venda?`,
  },
  {
    pegou: (d, k) => `Uma parede tem ${d} faixas iguais, e você pintou ${k}. Que fração da parede está pintada?`,
    sobrou: (d, k) => `Uma parede tem ${d} faixas iguais, e você pintou ${k}. Que fração ainda falta pintar?`,
  },
]
const PARES_N3 = pares(5, 12)

export const partesIguaisN3: Gerador = {
  id: 'partes-iguais-n3',
  aula: 'B.U7.A1',
  nivel: 3,
  gerar(r) {
    const [d, p] = r.pick(PARES_N3)
    const ctx = r.pick(CONTEXTOS_PARTES)
    const resto = r.int(0, 1) === 1
    const k = resto ? d - p : p
    return {
      enunciado: resto ? ctx.sobrou(d, p) : ctx.pegou(d, p),
      formato: 'escolha',
      ...embaralhar(r, opcoesParte(k, d)),
      dicas: [
        'Embaixo, o total de partes iguais. Em cima, as que a pergunta pede.',
        resto ? `O total é ${d}. As que sobraram: ${d} − ${p} = ${d - p}.` : `O total é ${d}. A pergunta pede as ${p}.`,
        `${k} de ${d}: ${fr(k, d)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: fração na reta

const RETA_N1: [number, number][] = []
for (const d of [3, 4, 5, 6, 8]) for (let k = 1; k < d; k++) RETA_N1.push([d, k])

export const fracaoRetaN1: Gerador = {
  id: 'fracao-reta-n1',
  aula: 'B.U7.A2',
  nivel: 1,
  gerar(r) {
    const [d, k] = r.pick(RETA_N1)
    const vizinha = k + 1 < d ? k + 1 : k - 1
    return {
      enunciado: 'O trecho de 0 a 1 está cortado em partes iguais. Que fração está no traço do "?"?',
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(k, d), certa: true },
        { texto: fr(k, d + 1), erro: 'reta-conta-tracos' },
        { texto: fr(d, k), erro: 'troca-numerador-denominador' },
        { texto: fr(vizinha, d) },
      ]),
      dicas: [
        'Conte os espaços entre o 0 e o 1, não os traços.',
        `São ${d} espaços: cada um é ${fr(1, d)}. Conte do 0 até o "?".`,
        `${k} espaços de ${fr(1, d)}: ${fr(k, d)}.`,
      ],
      visual: reta({ de: 0, ate: 1, passo: 1 / d, fracoes: d, marcas: [0, 1], marcaSemRotulo: k / d }, `A reta de 0 a 1 em ${d} espaços iguais, com um traço "?" no ${k}º. Ao conferir, os espaços se pintam até ele.`),
    }
  },
}

const RETA_N2: [number, number][] = []
for (const d of [2, 3, 4, 5, 6]) for (let k = d + 1; k < 2 * d; k++) RETA_N2.push([d, k])

export const fracaoRetaN2: Gerador = {
  id: 'fracao-reta-n2',
  aula: 'B.U7.A2',
  nivel: 2,
  gerar(r) {
    const [d, k] = r.pick(RETA_N2)
    return {
      enunciado: 'Cada inteiro está cortado em partes iguais. Que fração está no traço do "?"?',
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(k, d), certa: true },
        { texto: fr(k - d, d), erro: 'fracao-so-menor-que-um' },
        { texto: fr(k, d + 1), erro: 'reta-conta-tracos' },
        { texto: fr(d, k), erro: 'troca-numerador-denominador' },
      ]),
      dicas: [
        'Conte os espaços a partir do 0, e não pare no 1: a fração pode passar dele.',
        `Cada espaço é ${fr(1, d)}. Até o 1 já são ${d}.`,
        `${d} até o 1 e mais ${k - d}: ${k} espaços, ${fr(k, d)}.`,
      ],
      visual: reta({ de: 0, ate: 2, passo: 1 / d, fracoes: d, marcas: [0, 1, 2], marcaSemRotulo: k / d }, `A reta de 0 a 2, cada inteiro em ${d} espaços, com o "?" depois do 1. Ao conferir, os espaços se pintam do 0 até ele.`),
    }
  },
}

type Medida = { frase: (f: string) => string }
const MEDIDAS: Medida[] = [
  { frase: (f) => `A receita pede ${f} de xícara de farinha. Entre quantas xícaras isso fica?` },
  { frase: (f) => `Você correu ${f} de km. Entre quantos km isso fica?` },
  { frase: (f) => `A garrafa tem ${f} de litro. Entre quantos litros isso fica?` },
]
const ENTRE = ['Entre 0 e 1', 'Entre 1 e 2', 'Entre 2 e 3', 'Entre 3 e 4']

export const fracaoRetaN3: Gerador = {
  id: 'fracao-reta-n3',
  aula: 'B.U7.A2',
  nivel: 3,
  gerar(r) {
    const d = r.pick([2, 3, 4, 5, 6, 8])
    const q = r.int(0, 3)
    const k = q * d + r.int(1, d - 1)
    return {
      enunciado: r.pick(MEDIDAS).frase(fr(k, d)),
      formato: 'escolha',
      opcoes: ENTRE,
      resposta: q,
      erros: (q === 0 ? {} : { '0': 'fracao-so-menor-que-um' }) as Record<string, string>,
      dicas: [
        `Cada inteiro tem ${d} partes de ${fr(1, d)}. Quantos inteiros cabem em ${k} partes?`,
        `${fr(d, d)} = 1. Conte de ${d} em ${d} até passar de ${k}.`,
        `${k} ÷ ${d} = ${q} e sobram ${k - q * d}: ${fr(k, d)} fica entre ${q} e ${q + 1}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: fração como divisão

const REPARTIR_N1: [number, number][] = []
for (let b = 3; b <= 8; b++) for (let a = 2; a < b; a++) REPARTIR_N1.push([a, b])

export const fracaoDivisaoN1: Gerador = {
  id: 'fracao-divisao-n1',
  aula: 'B.U7.A3',
  nivel: 1,
  gerar(r) {
    const [a, b] = r.pick(REPARTIR_N1)
    return {
      enunciado: `${a} chocolates para ${b} pessoas, em partes iguais. Quanto chocolate cada uma recebe?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `${fr(a, b)} de chocolate`, certa: true },
        { texto: `${fr(b, a)} de chocolate`, erro: 'divide-o-menor-pelo-maior' },
        { texto: `${fr(1, b)} de chocolate` },
        { texto: 'Nada: não dá para dividir', erro: 'menor-por-maior-da-zero' },
      ]),
      dicas: [
        'Corte cada chocolate em partes iguais, uma para cada pessoa.',
        `Corte cada chocolate em ${b}. Cada pessoa pega um pedaço de cada chocolate.`,
        `${a} pedaços de ${fr(1, b)}: $${a} \\div ${b} = \\frac{${a}}{${b}}$.`,
      ],
      visual: barra({ partes: 1, inteiros: a, semFracao: true }, `${a} chocolates inteiros lado a lado. Ao conferir, cada um se corta em ${b} e um pedaço de cada acende.`),
    }
  },
}

/** Pares a ÷ b com a e b de 2 a 9, a ≠ b e sem dar um inteiro. */
const DIVISOES: [number, number][] = []
for (let a = 2; a <= 9; a++) for (let b = 2; b <= 9; b++) if (a % b !== 0) DIVISOES.push([a, b])

/** As opções de a ÷ b, com a unidade depois de cada uma. */
function opcoesDivisao(a: number, b: number, u: string): Op[] {
  const q = Math.floor(a / b)
  return [
    { texto: `${fr(a, b)}${u}`, certa: true },
    { texto: `${fr(b, a)}${u}`, erro: 'divide-o-menor-pelo-maior' },
    a < b ? { texto: `0${u}`, erro: 'menor-por-maior-da-zero' } : { texto: `${q}${u}` },
    { texto: `${fr(1, b)}${u}` },
  ]
}

export const fracaoDivisaoN2: Gerador = {
  id: 'fracao-divisao-n2',
  aula: 'B.U7.A3',
  nivel: 2,
  gerar(r) {
    const [a, b] = r.pick(DIVISOES)
    return {
      enunciado: `Qual é o resultado de $${a} \\div ${b}$?`,
      formato: 'escolha',
      ...embaralhar(r, opcoesDivisao(a, b, '')),
      dicas: [
        'O traço da fração é um sinal de dividir: o que se reparte vai em cima.',
        `${a} inteiros repartidos entre ${b}: o ${a} vai em cima, o ${b} embaixo.`,
        `$${a} \\div ${b} = \\frac{${a}}{${b}}$.`,
      ],
    }
  },
}

type Reparte = { frase: (a: number, b: number) => string; u: string }
const REPARTES: Reparte[] = [
  { frase: (a, b) => `Uma corda de ${a} m foi cortada em ${b} pedaços iguais. Quanto mede cada pedaço?`, u: ' m' },
  { frase: (a, b) => `${a} litros de suco foram divididos em ${b} jarras iguais. Quanto vai em cada jarra?`, u: ' L' },
  { frase: (a, b) => `${a} kg de arroz foram divididos em ${b} pacotes iguais. Quanto vai em cada pacote?`, u: ' kg' },
]

export const fracaoDivisaoN3: Gerador = {
  id: 'fracao-divisao-n3',
  aula: 'B.U7.A3',
  nivel: 3,
  gerar(r) {
    const [a, b] = r.pick(DIVISOES)
    const ctx = r.pick(REPARTES)
    return {
      enunciado: ctx.frase(a, b),
      formato: 'escolha',
      ...embaralhar(r, opcoesDivisao(a, b, ctx.u)),
      dicas: [
        'Qual é a divisão? O que se reparte vai primeiro.',
        `São ${a}${ctx.u} repartidos em ${b}: $${a} \\div ${b}$.`,
        `$${a} \\div ${b} = \\frac{${a}}{${b}}$, então cada um fica com ${fr(a, b)}${ctx.u}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 4: equivalentes

const PROPRIAS: [number, number][] = []
for (let d = 2; d <= 6; d++) for (let n = 1; n < d; n++) PROPRIAS.push([n, d])

export const equivalentesN1: Gerador = {
  id: 'equivalentes-n1',
  aula: 'B.U7.A4',
  nivel: 1,
  gerar(r) {
    const [n, d] = r.pick(PROPRIAS)
    const k = r.int(2, 4)
    const D = d * k
    const certa = n * k
    return {
      enunciado: `Complete: $\\frac{${n}}{${d}} = \\frac{?}{${D}}$.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[n, 'muda-so-um-termo'], [n + D - d, 'equivalente-somando']]),
      dicas: [
        'Cortar cada parte em pedaços multiplica os dois números pelo mesmo.',
        `O ${d} virou ${D}: $${d} \\times ${k} = ${D}$. Faça o mesmo em cima.`,
        `$${n} \\times ${k} = ${certa}$: ${fr(n, d)} = ${fr(certa, D)}.`,
      ],
      visual: barra({ barras: [{ partes: d, pintadas: n }, { partes: D, rotulo: '?' }], guia: n / d }, `A barra de ${n}/${d} em cima e uma de ${D} partes vazia embaixo, com a linha no fim do pintado. Ao conferir, ${certa} partes se pintam até a linha.`),
    }
  },
}

export const equivalentesN2: Gerador = {
  id: 'equivalentes-n2',
  aula: 'B.U7.A4',
  nivel: 2,
  gerar(r) {
    const d = r.int(2, 9)
    const n = r.int(1, d - 1)
    const k = r.int(2, 5)
    if (r.int(0, 1) === 0) {
      // Multiplicar: falta o de baixo.
      const certa = d * k
      return {
        enunciado: `Complete: $\\frac{${n}}{${d}} = \\frac{${n * k}}{?}$.`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[d, 'muda-so-um-termo'], [d + n * k - n, 'equivalente-somando']]),
        dicas: [
          'Os dois números mudam juntos, pelo mesmo fator.',
          `O ${n} virou ${n * k}: multiplicou por ${k}. Faça o mesmo embaixo.`,
          `$${d} \\times ${k} = ${certa}$: ${fr(n, d)} = ${fr(n * k, certa)}.`,
        ],
      }
    }
    // Dividir: o caminho de volta.
    const certa = d
    return {
      enunciado: `Complete: $\\frac{${n * k}}{${d * k}} = \\frac{${n}}{?}$.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[d * k, 'muda-so-um-termo'], [d * k - (n * k - n), 'equivalente-somando']]),
      dicas: [
        'Também vale dividir os dois números pelo mesmo.',
        `O ${n * k} virou ${n}: dividiu por ${k}. Faça o mesmo embaixo.`,
        `$${d * k} \\div ${k} = ${certa}$: ${fr(n * k, d * k)} = ${fr(n, certa)}.`,
      ],
    }
  },
}

const RECEITAS = [
  (f: string) => `A receita pede ${f} de xícara de açúcar. Qual medida é a mesma quantidade?`,
  (f: string) => `Você já leu ${f} do livro. Qual fração diz o mesmo?`,
  (f: string) => `O tanque está com ${f} de combustível. Qual fração é a mesma quantidade?`,
]

export const equivalentesN3: Gerador = {
  id: 'equivalentes-n3',
  aula: 'B.U7.A4',
  nivel: 3,
  gerar(r) {
    const [n, d] = r.pick(PROPRIAS)
    const k = r.int(2, 5)
    const j = r.int(1, 3)
    return {
      enunciado: r.pick(RECEITAS)(fr(n, d)),
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(n * k, d * k), certa: true },
        { texto: fr(n + j, d + j), erro: 'equivalente-somando' },
        { texto: fr(n * k, d), erro: 'muda-so-um-termo' },
        { texto: fr(n, d * k), erro: 'muda-so-um-termo' },
      ]),
      dicas: [
        'Frações equivalentes: os dois números multiplicados pelo mesmo.',
        'Em cada opção, veja se o de cima e o de baixo foram multiplicados pelo mesmo número.',
        `$\\frac{${n} \\times ${k}}{${d} \\times ${k}} = \\frac{${n * k}}{${d * k}}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: simplificar

const menorPrimo = (k: number) => [2, 3, 5, 7].find((p) => k % p === 0) ?? k
const IRRED_6 = irredutiveis(6)

export const simplificarN1: Gerador = {
  id: 'simplificar-n1',
  aula: 'B.U7.A5',
  nivel: 1,
  gerar(r) {
    const [n, d] = r.pick(IRRED_6)
    const k = r.int(2, 4)
    const [a, b] = [n * k, d * k]
    return {
      enunciado: `Simplifique ${fr(a, b)} dividindo os dois números por ${k}.`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(n, d), certa: true },
        { texto: fr(n, b), erro: 'muda-so-um-termo' },
        { texto: fr(a, d), erro: 'muda-so-um-termo' },
        { texto: fr(n, b - (a - n)), erro: 'equivalente-somando' },
      ]),
      dicas: [
        'Simplificar é dividir os dois números pelo mesmo: os pedaços se juntam.',
        `Em cima: $${a} \\div ${k}$. Embaixo: $${b} \\div ${k}$.`,
        `$\\frac{${a} \\div ${k}}{${b} \\div ${k}} = \\frac{${n}}{${d}}$.`,
      ],
      visual: barra({ partes: b, pintadas: a }, `A barra de ${a}/${b}. Ao conferir, as partes se juntam de ${k} em ${k} e a barra vira ${n}/${d}, com o pintado no mesmo lugar.`),
    }
  },
}

const IRRED_5 = irredutiveis(5)

export const simplificarN2: Gerador = {
  id: 'simplificar-n2',
  aula: 'B.U7.A5',
  nivel: 2,
  gerar(r) {
    const [n, d] = r.pick(IRRED_5)
    const k = r.pick([4, 6, 8, 9])
    const [a, b] = [n * k, d * k]
    const p = menorPrimo(k)
    return {
      enunciado: `Simplifique ${fr(a, b)} até o fim.`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: fr(n, d), certa: true },
        { texto: fr(a / p, b / p), erro: 'simplificacao-incompleta' },
        { texto: fr(n, b), erro: 'muda-so-um-termo' },
        { texto: fr(n, b - (a - n)), erro: 'equivalente-somando' },
      ]),
      dicas: [
        'Divida os dois pelo maior número que divide os dois: o MDC.',
        `Dividir por ${p} dá ${fr(a / p, b / p)}, mas ainda não acabou. O mdc de ${a} e ${b} é ${k}.`,
        `$\\frac{${a} \\div ${k}}{${b} \\div ${k}} = \\frac{${n}}{${d}}$.`,
      ],
    }
  },
}

type Parte = (b: number, a: number) => string
const NOTAS: Parte[] = [
  (b, a) => `De ${b} questões, você acertou ${a}. Que fração você acertou, na forma mais simples?`,
  (b, a) => `Numa trilha de ${b} km, você já andou ${a} km. Que fração da trilha você andou, na forma mais simples?`,
  (b, a) => `De ${b} fatias de bolo, ${a} já foram comidas. Que fração do bolo foi comida, na forma mais simples?`,
]
const IRRED_8 = irredutiveis(8)

export const simplificarN3: Gerador = {
  id: 'simplificar-n3',
  aula: 'B.U7.A5',
  nivel: 3,
  gerar(r) {
    const [n, d] = r.pick(IRRED_8)
    const k = r.int(2, 6)
    const [a, b] = [n * k, d * k]
    const p = menorPrimo(k)
    const ops: Op[] = [
      { texto: fr(n, d), certa: true },
      { texto: fr(a, b), erro: 'simplificacao-incompleta' },
      { texto: fr(n, b), erro: 'muda-so-um-termo' },
    ]
    if (p !== k) ops.push({ texto: fr(a / p, b / p), erro: 'simplificacao-incompleta' })
    return {
      enunciado: r.pick(NOTAS)(b, a),
      formato: 'escolha',
      ...embaralhar(r, ops),
      dicas: [
        `A fração é ${fr(a, b)}. Simplifique dividindo os dois pelo mesmo número.`,
        `O maior número que divide ${a} e ${b} é ${k}.`,
        `$\\frac{${a} \\div ${k}}{${b} \\div ${k}} = \\frac{${n}}{${d}}$.`,
      ],
    }
  },
}

export const GERADORES_U7A: Gerador[] = [
  partesIguaisN1, partesIguaisN2, partesIguaisN3,
  fracaoRetaN1, fracaoRetaN2, fracaoRetaN3,
  fracaoDivisaoN1, fracaoDivisaoN2, fracaoDivisaoN3,
  equivalentesN1, equivalentesN2, equivalentesN3,
  simplificarN1, simplificarN2, simplificarN3,
]
