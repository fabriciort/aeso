import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 6: múltiplos, divisores e primos. Quem cabe em quem (múltiplos e
// divisores), os atalhos de divisibilidade (2, 3, 5, 9 e 10), os primos e
// a fatoração, e o MMC e o MDC em situações do dia a dia.

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

export const divisores = (n: number) => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0)
export const mdc = (a: number, b: number): number => (b === 0 ? a : mdc(b, a % b))
export const mmc = (a: number, b: number) => (a / mdc(a, b)) * b
export const ehPrimo = (n: number) => n >= 2 && divisores(n).length === 2
/** Os fatores primos de n, do menor para o maior, com repetição. */
export function fatorar(n: number): number[] {
  const fs: number[] = []
  for (let p = 2; n > 1; p++) {
    while (n % p === 0) {
      fs.push(p)
      n /= p
    }
  }
  return fs
}
const vezes = (fs: number[]) => fs.join(' × ')
const soma = (n: number) => String(n).split('').reduce((s, c) => s + Number(c), 0)

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })

// ---------------------------------------------------------------- aula 1: múltiplos e divisores

/** Números com um divisor no meio (nem 1, nem ele mesmo). */
const COM_DIVISOR_NO_MEIO = [4, 6, 8, 9, 10, 12]

export const multiplosDivisoresN1: Gerador = {
  id: 'multiplos-divisores-n1',
  aula: 'B.U6.A1',
  nivel: 1,
  gerar(r) {
    const d = r.pick(COM_DIVISOR_NO_MEIO)
    const k = r.int(2, 9)
    const m = d * k
    const div = r.pick(divisores(d).filter((x) => x > 1 && x < d))
    const antes = m - d + r.int(1, d - 1)
    const depois = m + r.int(1, d - 1)
    return {
      enunciado: `Qual destes números é múltiplo de ${d}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: String(m), certa: true },
        { texto: String(div), erro: 'confunde-multiplo-divisor' },
        { texto: String(antes) },
        { texto: String(depois) },
      ]),
      dicas: [
        `Múltiplo de ${d} é onde os saltos de ${d} caem: ${d}, ${2 * d}, ${3 * d}…`,
        `Divida cada número por ${d}. O múltiplo não deixa resto. E o ${div} é menor que ${d}: é divisor.`,
        `${d} × ${k} = ${m}. Então ${m} é múltiplo de ${d}.`,
      ],
      visual: reta(
        { de: 0, ate: d * 10, passo: d, marcas: [0, d, 2 * d, 3 * d], saltos: [[0, d, `+${d}`], [d, 2 * d, `+${d}`], [2 * d, 3 * d, `+${d}`]] },
        `A reta de ${d} em ${d}, com os três primeiros saltos. Ao conferir, os saltos continuam até o ${m}.`,
      ),
    }
  },
}

/** Números até 60 com pelo menos 4 divisores. */
const COMPOSTOS = [6, 8, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 26, 27, 28, 30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 50, 52, 54, 56, 60]

export const multiplosDivisoresN2: Gerador = {
  id: 'multiplos-divisores-n2',
  aula: 'B.U6.A1',
  nivel: 2,
  gerar(r) {
    const n = r.pick(COMPOSTOS)
    const ds = divisores(n)
    const t = ds.length
    return {
      enunciado: `Quantos divisores tem ${n}?`,
      formato: 'numero',
      resposta: t,
      erros: mapa(t, [[t - 2, 'esquece-divisores-extremos'], [t - 1, 'esquece-divisores-extremos']]),
      dicas: [
        'Divisores vêm em pares: cada par é um retângulo. O 1 e o próprio número também contam.',
        `Comece pelo par 1 × ${n}. Depois teste 2, 3, 4…`,
        `Os divisores de ${n}: ${ds.join(', ')}. São ${t}.`,
      ],
    }
  },
}

type Frase = (n: number, d: number) => string
const CABE: Frase[] = [
  (n, d) => `${n} ovos cabem certinho em bandejas de ${d}. Qual frase está certa?`,
  (n, d) => `${n} cadeiras formam fileiras de ${d}, sem sobrar. Qual frase está certa?`,
  (n, d) => `Um rolo de ${n} m sai inteiro em pedaços de ${d} m. Qual frase está certa?`,
  (n, d) => `${n} pessoas formam grupos de ${d}, sem sobrar ninguém. Qual frase está certa?`,
]

export const multiplosDivisoresN3: Gerador = {
  id: 'multiplos-divisores-n3',
  aula: 'B.U6.A1',
  nivel: 3,
  gerar(r) {
    const d = r.int(2, 9)
    const k = r.int(3, 12)
    const n = d * k
    const pelaDivisao = r.int(0, 1) === 0
    return {
      enunciado: r.pick(CABE)(n, d),
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: pelaDivisao ? `${d} é divisor de ${n}` : `${n} é múltiplo de ${d}`, certa: true },
        { texto: `${n} é divisor de ${d}`, erro: 'confunde-multiplo-divisor' },
        { texto: `${d} é múltiplo de ${n}`, erro: 'confunde-multiplo-divisor' },
        { texto: pelaDivisao ? `${n} não é múltiplo de ${d}` : `${d} não é divisor de ${n}` },
      ]),
      dicas: [
        'O divisor é o pequeno, que cabe sem sobrar. O múltiplo é o grande, que se forma com ele.',
        `${n} ÷ ${d} = ${k}, sem resto. Quem cabe em quem?`,
        `${d} cabe em ${n}: ${d} é divisor de ${n}, e ${n} é múltiplo de ${d}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: regras de divisibilidade

const FINAIS: Record<number, number[]> = { 2: [0, 2, 4, 6, 8], 5: [0, 5], 10: [0] }
const REGRA: Record<number, string> = {
  2: 'Por 2: o último algarismo é 0, 2, 4, 6 ou 8.',
  5: 'Por 5: o último algarismo é 0 ou 5.',
  10: 'Por 10: o último algarismo é 0.',
}
const tres = (a: number, b: number, c: number) => a * 100 + b * 10 + c
/** Todos os números de três algarismos. Sortear de uma lista filtrada sempre termina. */
const TRES_ALGARISMOS = Array.from({ length: 900 }, (_, i) => i + 100)
const sorteia = (r: Rng, ok: (x: number) => boolean) => r.pick(TRES_ALGARISMOS.filter(ok))

export const divisibilidadeN1: Gerador = {
  id: 'divisibilidade-n1',
  aula: 'B.U6.A2',
  nivel: 1,
  gerar(r) {
    const d = r.pick([2, 5, 10])
    const bons = FINAIS[d]
    const ruins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => !bons.includes(x))
    const certa = tres(r.int(1, 9), r.int(0, 9), r.pick(bons))
    // O engano: olhar o algarismo da frente (ou do meio, para o 10).
    const engano = d === 2 ? tres(r.pick([2, 4, 6, 8]), r.int(1, 9), r.pick(ruins)) : d === 5 ? tres(5, r.int(1, 9), r.pick(ruins)) : tres(r.int(1, 9), 0, r.pick(ruins))
    const outro1 = sorteia(r, (x) => ruins.includes(x % 10) && x !== engano)
    const outros = [outro1, sorteia(r, (x) => ruins.includes(x % 10) && x !== engano && x !== outro1)]
    return {
      enunciado: `Qual destes números é divisível por ${d}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: String(certa), certa: true },
        { texto: String(engano), erro: 'regra-no-algarismo-errado' },
        { texto: String(outros[0]) },
        { texto: String(outros[1]) },
      ]),
      dicas: [
        `Placas e barras de 10 já se dividem por ${d}. Só o último algarismo decide.`,
        REGRA[d],
        `${certa} termina em ${certa % 10}: ${certa} ÷ ${d} = ${certa / d}.`,
      ],
    }
  },
}

export const divisibilidadeN2: Gerador = {
  id: 'divisibilidade-n2',
  aula: 'B.U6.A2',
  nivel: 2,
  gerar(r) {
    const d = r.pick([3, 9])
    const finaisDoD = d === 3 ? [3, 6, 9] : [9]
    const certa = sorteia(r, (x) => x % d === 0 && !finaisDoD.includes(x % 10))
    const engano = sorteia(r, (x) => x % 3 !== 0 && finaisDoD.includes(x % 10))
    const segundo = d === 9 ? sorteia(r, (x) => x % 3 === 0 && x % 9 !== 0 && x !== engano) : sorteia(r, (x) => x % 3 !== 0 && x !== engano)
    const terceiro = sorteia(r, (x) => x % 3 !== 0 && x !== engano && x !== segundo)
    const [a, b, c] = String(certa).split('')
    return {
      enunciado: `Qual destes números é divisível por ${d}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: String(certa), certa: true },
        { texto: String(engano), erro: 'regra-no-algarismo-errado' },
        d === 9 ? { texto: String(segundo), erro: 'confunde-3-e-9' } : { texto: String(segundo) },
        { texto: String(terceiro) },
      ]),
      dicas: [
        `Por ${d}, o último algarismo não decide: some todos os algarismos.`,
        `Some os algarismos de cada número. Qual soma é múltiplo de ${d}?`,
        `${certa}: ${a} + ${b} + ${c} = ${soma(certa)}, múltiplo de ${d}.`,
      ],
    }
  },
}

/** Escreve os algarismos com o ponto do milhar, um deles trocado por "?". */
function comLacuna(algs: (number | '?')[]): string {
  const s = algs.join('')
  return s.length === 4 ? `${s[0]}.${s.slice(1)}` : s
}

const LACUNA_9: ((x: string) => string)[] = [
  (x) => `Um lote de ${x} peças foi em caixas de 9, sem sobrar. O ? é um algarismo. Qual é?`,
  (x) => `${x} cadeiras formam fileiras de 9, sem sobrar. O ? é um algarismo. Qual é?`,
]
const LACUNA_3: ((x: string) => string)[] = [
  (x) => `R$ ${x} foram divididos entre 3 pessoas, em reais inteiros. Qual é o menor algarismo que cabe no ?`,
  (x) => `${x} alunos formam 3 turmas iguais. Qual é o menor algarismo que cabe no ?`,
]

export const divisibilidadeN3: Gerador = {
  id: 'divisibilidade-n3',
  aula: 'B.U6.A2',
  nivel: 3,
  gerar(r) {
    const d = r.pick([3, 9])
    const tam = r.int(3, 4)
    const algs = Array.from({ length: tam }, (_, i) => (i === 0 ? r.int(1, 9) : r.int(0, 9)))
    const pos = r.int(1, tam - 1)
    const somaVisivel = () => algs.reduce((t, a, i) => (i === pos ? t : t + a), 0)
    // Por 9, com a soma já múltiplo de 9, o 0 e o 9 serviriam: troca-se um algarismo visível.
    const j = pos === tam - 1 ? tam - 2 : tam - 1
    if (d === 9 && somaVisivel() % 9 === 0) algs[j] = algs[j] === 9 ? 8 : algs[j] + 1
    const s = somaVisivel()
    const x = (d - (s % d)) % d
    const lacuna = comLacuna(algs.map((a, i) => (i === pos ? '?' : a)))
    const do3 = (3 - (s % 3)) % 3
    return {
      enunciado: r.pick(d === 9 ? LACUNA_9 : LACUNA_3)(lacuna),
      formato: 'numero',
      resposta: x,
      erros: d === 9 ? mapa(x, [[do3, 'confunde-3-e-9']]) : {},
      dicas: [
        `Some os algarismos que você vê. Com o ?, a soma tem de ser múltiplo de ${d}.`,
        `Os outros algarismos somam ${s}. Qual é o primeiro múltiplo de ${d} a partir de ${s}?`,
        x === 0 ? `${s} já é múltiplo de 3. O menor algarismo é 0.` : `${s} + ${x} = ${s + x}, múltiplo de ${d}. O ? é ${x}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: primos e fatoração

const PRIMOS = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]
const IMPARES_COMPOSTOS = [9, 15, 21, 25, 27, 33, 35, 39, 45, 49]
const PARES_COMPOSTOS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]

export const primosN1: Gerador = {
  id: 'primos-n1',
  aula: 'B.U6.A3',
  nivel: 1,
  gerar(r) {
    const p = r.pick(PRIMOS)
    const impar = r.pick(IMPARES_COMPOSTOS)
    const par = r.pick(PARES_COMPOSTOS)
    const a = fatorar(impar)[0]
    const b = impar / a
    return {
      enunciado: 'Qual destes números é primo?',
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: String(p), certa: true },
        { texto: '1', erro: 'um-e-primo' },
        { texto: String(impar), erro: 'primo-e-impar' },
        { texto: String(par) },
      ]),
      dicas: [
        'Primo tem exatamente dois divisores: 1 e ele mesmo. O 1 tem um só.',
        `Ímpar não basta: ${impar} = ${a} × ${b}. E ${par} é par: ${par} = 2 × ${par / 2}.`,
        `${p} só se divide por 1 e por ${p}: forma uma fileira só. É primo.`,
      ],
    }
  },
}

const produto = (fs: number[]) => fs.reduce((t, f) => t * f, 1)

/** Fatorações com pelo menos um primo repetido e outro diferente, até 300. */
function comRepetido(r: Rng): number[] {
  const a = r.pick([2, 2, 3, 3, 5])
  const fs = [a, a, ...Array.from({ length: r.int(1, 2) }, () => r.pick([2, 3, 5, 7]))]
  while (produto(fs) > 300) fs.pop()
  if (new Set(fs).size < 2) fs[fs.length - 1] = a === 2 ? 3 : 2
  return fs.sort((x, y) => x - y)
}

export const primosN2: Gerador = {
  id: 'primos-n2',
  aula: 'B.U6.A3',
  nivel: 2,
  gerar(r) {
    const fs = comRepetido(r)
    const n = produto(fs)
    // O primo repetido junta num fator composto: 2 × 2 × 3 × 5 vira 4 × 3 × 5.
    const i = fs.findIndex((f, j) => fs[j + 1] === f)
    const junto = [...fs.slice(0, i), fs[i] * fs[i], ...fs.slice(i + 2)].sort((x, y) => x - y)
    const unicos = [...new Set(fs)]
    return {
      enunciado: `Qual é a fatoração de ${n} em primos?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: vezes(fs), certa: true },
        { texto: vezes(junto), erro: 'fatoracao-com-composto' },
        { texto: vezes(unicos), erro: 'esquece-fator-repetido' },
        { texto: vezes([1, ...fs]), erro: 'um-e-primo' },
      ]),
      dicas: [
        'Fatorar é quebrar até sobrar só primos. Os repetidos ficam, e o 1 não é primo.',
        `Comece pelo menor primo: ${n} = ${fs[0]} × ${n / fs[0]}. Continue quebrando.`,
        `${n} = ${vezes(fs)}. Todos são primos, e o produto dá ${n}.`,
      ],
    }
  },
}

const MAIOR_PRIMO: ((n: number) => string)[] = [
  (n) => `Na fatoração de ${n} em primos, qual é o maior primo?`,
  (n) => `${n} peças vão em caixas iguais, cada uma com um número primo de peças, o maior possível. Quantas por caixa?`,
]

export const primosN3: Gerador = {
  id: 'primos-n3',
  aula: 'B.U6.A3',
  nivel: 3,
  gerar(r) {
    const fs = Array.from({ length: r.int(2, 4) }, () => r.pick([2, 2, 3, 3, 5, 7, 11, 13])).sort((x, y) => x - y)
    // Entre 20 e 400: tira o maior enquanto passa, junta um primo enquanto falta.
    while (produto(fs) > 400) fs.pop()
    while (produto(fs) < 20) fs.push(r.pick([3, 5, 7]))
    fs.sort((x, y) => x - y)
    const n = produto(fs)
    const maior = fs[fs.length - 1]
    const resto = n / fs[0]
    return {
      enunciado: r.pick(MAIOR_PRIMO)(n),
      formato: 'numero',
      resposta: maior,
      erros: ehPrimo(resto) ? {} : mapa(maior, [[resto, 'fatoracao-com-composto']]),
      dicas: [
        'Quebre o número até sobrar só primos. Depois pegue o maior.',
        `Comece pelo menor primo: ${n} = ${fs[0]} × ${resto}. O ${resto} ainda se quebra?`,
        `${n} = ${vezes(fs)}. O maior primo é ${maior}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 4: MMC e MDC

const intervalo = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => i + min)
/** Dois números diferentes em [min, max] em que nenhum divide o outro (sorteados de uma lista: sempre termina). */
function parSemDivisao(r: Rng, min: number, max: number, limite: number): [number, number] {
  const pares = intervalo(min, max).flatMap((a) => intervalo(min, max).map((b): [number, number] => [a, b]))
  return r.pick(pares.filter(([a, b]) => a !== b && a % b !== 0 && b % a !== 0 && mmc(a, b) <= limite))
}
/** Dois múltiplos de um mesmo g, com o mdc exatamente g. */
function parComMdc(r: Rng, gMax: number, kMax: number): [number, number] {
  const g = r.int(2, gMax)
  const ks = intervalo(2, kMax).flatMap((p) => intervalo(2, kMax).map((q): [number, number] => [p, q]))
  const [p, q] = r.pick(ks.filter(([p, q]) => p !== q && mdc(p, q) === 1))
  return [g * p, g * q]
}
const menorPrimoComum = (a: number, b: number) => fatorar(mdc(a, b))[0]

export const mmcMdcN1: Gerador = {
  id: 'mmc-mdc-n1',
  aula: 'B.U6.A4',
  nivel: 1,
  gerar(r) {
    const [a, b] = parSemDivisao(r, 2, 10, 60)
    const m = mmc(a, b)
    const maior = Math.max(a, b)
    const menor = Math.min(a, b)
    const ate = 2 * m
    const saltos = Array.from({ length: ate / maior }, (_, i) => [i * maior, (i + 1) * maior, `+${maior}`])
    return {
      enunciado: `Dois ônibus saem juntos. Um volta a cada ${a} min, o outro a cada ${b} min. Em quantos minutos saem juntos de novo?`,
      formato: 'numero',
      resposta: m,
      erros: mapa(m, [[a * b, 'mmc-e-o-produto'], [mdc(a, b), 'confunde-mmc-mdc']]),
      dicas: [
        'Eles se encontram num número que está nas duas listas de múltiplos.',
        `Múltiplos de ${maior}: ${maior}, ${2 * maior}, ${3 * maior}… Qual deles também é múltiplo de ${menor}?`,
        `${m} é o primeiro nas duas listas: mmc(${a}, ${b}) = ${m}.`,
      ],
      visual: reta(
        { de: 0, ate, passo: 1, marcas: Array.from({ length: ate / menor + 1 }, (_, i) => i * menor), saltos },
        `Os saltos de ${maior} em ${maior} por cima da reta e as marcas de ${menor} em ${menor} embaixo. Ao conferir, o primeiro ponto em que um salto cai numa marca acende.`,
      ),
    }
  },
}

const FITAS: ((a: number, b: number) => string)[] = [
  (a, b) => `Fitas de ${a} cm e ${b} cm serão cortadas em pedaços iguais, os maiores possíveis, sem sobra. Quantos cm tem cada pedaço?`,
  (a, b) => `Tábuas de ${a} cm e ${b} cm serão serradas em partes iguais, as maiores possíveis, sem sobra. Quantos cm tem cada parte?`,
]

export const mmcMdcN2: Gerador = {
  id: 'mmc-mdc-n2',
  aula: 'B.U6.A4',
  nivel: 2,
  gerar(r) {
    const [a, b] = parComMdc(r, 9, 6)
    const g = mdc(a, b)
    return {
      enunciado: r.pick(FITAS)(a, b),
      formato: 'numero',
      resposta: g,
      erros: mapa(g, [[mmc(a, b), 'confunde-mmc-mdc'], [menorPrimoComum(a, b), 'mdc-nao-e-o-maior']]),
      dicas: [
        'O pedaço tem de caber nas duas sem sobrar: um divisor dos dois. O maior deles é o MDC.',
        `Divisores de ${a}: ${divisores(a).join(', ')}. Quais também dividem ${b}?`,
        `O maior que divide os dois é ${g}: mdc(${a}, ${b}) = ${g}.`,
      ],
    }
  },
}

const ENCONTROS: ((a: number, b: number) => string)[] = [
  (a, b) => `Um remédio é a cada ${a} h, outro a cada ${b} h. Você tomou os dois agora. Em quantas horas toma os dois juntos de novo?`,
  (a, b) => `Uma luz pisca a cada ${a} s, outra a cada ${b} s. Piscaram juntas agora. Em quantos segundos piscam juntas de novo?`,
]
const CORTES: ((a: number, b: number) => string)[] = [
  (a, b) => `Um painel de ${a} cm por ${b} cm vai levar placas quadradas iguais, as maiores possíveis, sem cortar. Qual é o lado, em cm?`,
  (a, b) => `${a} rosas e ${b} margaridas viram buquês iguais, o maior número possível, sem sobrar flor. Quantos buquês?`,
]

export const mmcMdcN3: Gerador = {
  id: 'mmc-mdc-n3',
  aula: 'B.U6.A4',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const [a, b] = parSemDivisao(r, 3, 12, 72)
      const m = mmc(a, b)
      return {
        enunciado: r.pick(ENCONTROS)(a, b),
        formato: 'numero',
        resposta: m,
        erros: mapa(m, [[a * b, 'mmc-e-o-produto'], [mdc(a, b), 'confunde-mmc-mdc']]),
        dicas: [
          'Encontro no futuro: o menor múltiplo comum, o MMC.',
          `Conte de ${Math.max(a, b)} em ${Math.max(a, b)} e pare no primeiro que também é múltiplo de ${Math.min(a, b)}.`,
          `mmc(${a}, ${b}) = ${m}.`,
        ],
      }
    }
    const [a, b] = parComMdc(r, 12, 7)
    const g = mdc(a, b)
    return {
      enunciado: r.pick(CORTES)(a, b),
      formato: 'numero',
      resposta: g,
      erros: mapa(g, [[mmc(a, b), 'confunde-mmc-mdc'], [menorPrimoComum(a, b), 'mdc-nao-e-o-maior']]),
      dicas: [
        'Partes iguais, as maiores possíveis: o maior divisor comum, o MDC.',
        `Fatore: ${a} = ${vezes(fatorar(a))} e ${b} = ${vezes(fatorar(b))}. O que os dois têm em comum?`,
        `mdc(${a}, ${b}) = ${g}.`,
      ],
    }
  },
}

export const GERADORES_U6: Gerador[] = [
  multiplosDivisoresN1, multiplosDivisoresN2, multiplosDivisoresN3,
  divisibilidadeN1, divisibilidadeN2, divisibilidadeN3,
  primosN1, primosN2, primosN3,
  mmcMdcN1, mmcMdcN2, mmcMdcN3,
]
