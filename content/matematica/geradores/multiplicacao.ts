import type { Gerador, Rng, Visual } from '@/lib/formation/schema'

// Unidade 3: multiplicação. Grupos iguais e o retângulo, a tabuada com
// estratégia (dobro, comutativa, fatos derivados), multiplicar por 10, 100 e
// 1.000, a distributiva com o retângulo partido e a multiplicação armada.

const fmt = (n: number) => n.toLocaleString('pt-BR')

/** Erros previsíveis, sem nunca marcar a resposta certa e sem sobrescrever. */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor !== certa && valor >= 0 && Number.isInteger(valor) && !(String(valor) in erros)) erros[String(valor)] = erro
  }
  return erros
}

const retangulo = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const quadro = (numeros: number[], esboco: string): Visual => ({
  modelo: 'quadro-posicional',
  estado: { numeros, casas: ['M', 'C', 'D', 'U'], blocosVisiveis: false },
  esboco,
})
const contaVezes = (a: number, b: number, esboco: string): Visual => ({
  modelo: 'quadro-posicional',
  estado: { conta: { parcelas: [a, b], sinal: '×' } },
  esboco,
})

/** A soma repetida: 4 grupos de 6 → "6 + 6 + 6 + 6". */
const repetida = (grupos: number, cada: number) => Array(grupos).fill(cada).join(' + ')

/** O erro de quem esquece o vai um: a casa das unidades guarda só o último algarismo. */
export function multSemReserva(n: number, d: number): number {
  const t = Math.floor(n / 10)
  const u = n % 10
  return d * t * 10 + ((d * u) % 10)
}

/** O erro de quem soma a reserva antes de multiplicar: 6 × 27 → (2 + 4) × 6 = 36, e 362. */
export function reservaAntes(n: number, d: number): number {
  const t = Math.floor(n / 10)
  const u = n % 10
  const c = Math.floor((d * u) / 10)
  return (t + c) * d * 10 + ((d * u) % 10)
}

/** O erro de quem escreve o produto inteiro de cada casa: 6 × 47 → 24 | 42 → 2442. */
export function produtosColados(n: number, d: number): number {
  return Number(`${d * Math.floor(n / 10)}${d * (n % 10)}`)
}

/** O erro de quem não desloca a segunda linha: a × b vira a × (unidades de b) + a × (dezenas de b). */
export function semDeslocar(a: number, b: number): number {
  return a * (b % 10) + a * Math.floor(b / 10)
}

/** O erro de quem multiplica só casa com casa: 23 × 14 → 20 × 10 + 3 × 4 = 212. */
export function casasIguais(a: number, b: number): number {
  return Math.floor(a / 10) * Math.floor(b / 10) * 100 + (a % 10) * (b % 10)
}

// ---------------------------------------------------------------- aula 1: grupos iguais

export const gruposN1: Gerador = {
  id: 'grupos-n1',
  aula: 'B.U3.A1',
  nivel: 1,
  gerar(r) {
    const a = r.int(2, 5)
    const b = r.int(3, 9)
    const certa = a * b
    return {
      enunciado: `Um retângulo tem ${a} linhas de ${b} quadradinhos. Quantos quadradinhos ao todo?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[a + b, 'soma-no-lugar-de-multiplicar']]),
      dicas: [`Cada linha é um grupo de ${b}.`, `Some uma linha de cada vez: ${repetida(a, b)}.`, `${repetida(a, b)} = ${certa}. Ou seja, ${a} × ${b} = ${certa}.`],
      visual: retangulo({ linhas: a, colunas: b, rotulos: true }, `O retângulo de ${a} linhas e ${b} colunas, com os tamanhos escritos. Ao conferir, as linhas acendem uma a uma e o total aparece.`),
    }
  },
}

const GRUPOS = [
  (a: number, b: number) => `Uma estante tem ${a} prateleiras com ${b} livros em cada. Quantos livros?`,
  (a: number, b: number) => `Você comprou ${a} caixas com ${b} ovos em cada. Quantos ovos?`,
  (a: number, b: number) => `Um salão tem ${a} mesas com ${b} cadeiras em cada. Quantas cadeiras?`,
  (a: number, b: number) => `Um prédio tem ${a} andares com ${b} janelas em cada. Quantas janelas?`,
] as const

export const gruposN2: Gerador = {
  id: 'grupos-n2',
  aula: 'B.U3.A1',
  nivel: 2,
  gerar(r) {
    const a = r.int(3, 6)
    const b = r.int(4, 9)
    const certa = a * b
    return {
      enunciado: r.pick(GRUPOS)(a, b),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[a + b, 'soma-no-lugar-de-multiplicar'], [(a - 1) * b, 'esquece-grupo-extra']]),
      dicas: [`São ${a} grupos iguais, com ${b} em cada.`, `Desenhe um retângulo de ${a} linhas de ${b}, ou some ${b} + ${b} + …`, `${repetida(a, b)} = ${certa}. São ${a} × ${b} = ${certa}.`],
    }
  },
}

export const gruposN3: Gerador = {
  id: 'grupos-n3',
  aula: 'B.U3.A1',
  nivel: 3,
  gerar(r) {
    const a = r.int(3, 6)
    const b = r.int(4, 9)
    if (r.int(0, 1) === 0) {
      const certa = a * b
      return {
        enunciado: `Uma receita leva ${b} ovos. Você vai fazer ${a} receitas. Quantos ovos precisa?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[a + b, 'soma-no-lugar-de-multiplicar']]),
        dicas: ['Cada receita é um grupo igual de ovos.', `São ${a} grupos de ${b}.`, `${a} × ${b} = ${certa} ovos.`],
      }
    }
    const certa = a + b
    return {
      enunciado: `Você tem ${b} ovos e compra mais ${a}. Quantos ovos ficam?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[a * b, 'operacao-trocada']]),
      dicas: ['Aqui não há grupos iguais: você só junta mais alguns.', `Juntar ${b} e ${a} é somar.`, `${b} + ${a} = ${certa} ovos.`],
    }
  },
}

// ---------------------------------------------------------------- aula 2: a tabuada com estratégia

export const tabuadaN1: Gerador = {
  id: 'tabuada-n1',
  aula: 'B.U3.A2',
  nivel: 1,
  gerar(r) {
    const b = r.int(3, 9)
    const dois = 2 * b
    const certa = 4 * b
    return {
      enunciado: `2 × ${b} = ${dois}. Quanto é 4 × ${b}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[4 + b, 'soma-no-lugar-de-multiplicar'], [dois + b, 'esquece-grupo-extra']]),
      dicas: ['4 linhas são o dobro de 2 linhas.', `O retângulo de 4 × ${b} são dois pedaços de 2 × ${b}.`, `${dois} + ${dois} = ${certa}. Então 4 × ${b} = ${certa}.`],
      visual: retangulo({ linhas: 4, colunas: b, cortesLinhas: [2], rotulos: true }, `O retângulo de 4 linhas de ${b}, partido ao meio por um corte entre a segunda e a terceira linha. Ao conferir, cada metade mostra ${dois}.`),
    }
  },
}

export const tabuadaN2: Gerador = {
  id: 'tabuada-n2',
  aula: 'B.U3.A2',
  nivel: 2,
  gerar(r) {
    const b = r.int(3, 9)
    if (r.int(0, 1) === 0) {
      const cinco = 5 * b
      const certa = 6 * b
      return {
        enunciado: `5 × ${b} = ${cinco}. Quanto é 6 × ${b}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[cinco, 'esquece-grupo-extra'], [cinco + 6, 'soma-grupo-errado'], [6 + b, 'soma-no-lugar-de-multiplicar']]),
        dicas: ['6 linhas são 5 linhas e mais uma.', `A linha que falta tem ${b}.`, `${cinco} + ${b} = ${certa}. Então 6 × ${b} = ${certa}.`],
      }
    }
    const dez = 10 * b
    const certa = 9 * b
    return {
      enunciado: `10 × ${b} = ${dez}. Quanto é 9 × ${b}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[dez, 'esquece-grupo-extra'], [dez - 9, 'soma-grupo-errado'], [9 + b, 'soma-no-lugar-de-multiplicar']]),
      dicas: ['9 linhas são 10 linhas menos uma.', `A linha que sobra tem ${b}.`, `${dez} − ${b} = ${certa}. Então 9 × ${b} = ${certa}.`],
    }
  },
}

export const tabuadaN3: Gerador = {
  id: 'tabuada-n3',
  aula: 'B.U3.A2',
  nivel: 3,
  gerar(r) {
    const a = r.int(6, 9)
    const b = r.int(6, 9)
    const certa = a * b
    const vizinho = (a - 1) * b
    return {
      enunciado: `Uma prateleira tem ${a} fileiras de ${b} latas. Quantas latas?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[a + b, 'soma-no-lugar-de-multiplicar'], [vizinho, 'esquece-grupo-extra'], [vizinho + a, 'soma-grupo-errado']]),
      dicas: [`Não lembra ${a} × ${b}? Comece por um fato vizinho que você sabe.`, a === 9 ? `10 × ${b} = ${10 * b}. Tire uma fileira de ${b}.` : `5 × ${b} = ${5 * b}. Some as fileiras que faltam, de ${b} em ${b}.`, `${a} × ${b} = ${certa} latas.`],
    }
  },
}

// ---------------------------------------------------------------- aula 3: multiplicar por 10, 100, 1.000

export const vezesDezN1: Gerador = {
  id: 'vezes-dez-n1',
  aula: 'B.U3.A3',
  nivel: 1,
  gerar(r) {
    let n = r.int(11, 99)
    if (n % 10 === 0) n += 1
    const certa = n * 10
    return {
      enunciado: `Quanto é ${n} × 10?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[n + 10, 'soma-no-lugar-de-multiplicar'], [n * 100, 'conta-zeros-errado']]),
      dicas: ['Vezes 10: cada algarismo anda uma casa para a esquerda.', `O ${Math.floor(n / 10)} vai das dezenas para as centenas; o ${n % 10}, das unidades para as dezenas.`, `O zero guarda as unidades: ${n} × 10 = ${certa}.`],
      visual: quadro([n], `O ${n} no quadro de M, C, D, U. Ao conferir, os dois algarismos deslizam uma casa para a esquerda e um 0 entra nas unidades.`),
    }
  },
}

export const vezesDezN2: Gerador = {
  id: 'vezes-dez-n2',
  aula: 'B.U3.A3',
  nivel: 2,
  gerar(r) {
    const n = r.pick([r.int(2, 9) * 10, r.int(11, 99), r.int(11, 99) * 10, r.int(101, 999)])
    const f = r.pick([100, 1000])
    const casas = f === 100 ? 2 : 3
    const certa = n * f
    return {
      enunciado: `Quanto é ${fmt(n)} × ${fmt(f)}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[certa / 10, 'conta-zeros-errado'], [certa * 10, 'conta-zeros-errado'], [n + f, 'soma-no-lugar-de-multiplicar']]),
      dicas: [`Vezes ${fmt(f)}: cada algarismo anda ${casas} casas para a esquerda.`, n % 10 === 0 ? `O ${fmt(n)} já tem um zero. Ele também anda, e entram mais ${casas} zeros.` : `Os algarismos de ${fmt(n)} andam ${casas} casas; as casas vazias ganham zero.`, `${fmt(n)} × ${fmt(f)} = ${fmt(certa)}.`],
    }
  },
}

const REDONDOS = [
  (c: string, d: number) => `Cada caixa tem ${c} pregos. Quantos pregos há em ${d} caixas?`,
  (c: string, d: number) => `Uma obra gasta ${c} tijolos por dia. Quantos tijolos em ${d} dias?`,
  (c: string, d: number) => `Um ônibus roda ${c} km por dia. Quantos km em ${d} dias?`,
] as const

export const vezesDezN3: Gerador = {
  id: 'vezes-dez-n3',
  aula: 'B.U3.A3',
  nivel: 3,
  gerar(r) {
    const a = r.int(2, 9)
    const f = r.pick([10, 100])
    const c = a * f
    const d = r.int(3, 9)
    const certa = c * d
    const base = a * d
    return {
      enunciado: r.pick(REDONDOS)(fmt(c), d),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[base, 'conta-zeros-errado'], [certa * 10, 'conta-zeros-errado'], [c + d, 'soma-no-lugar-de-multiplicar']]),
      dicas: [`São ${d} grupos de ${fmt(c)}: ${d} × ${fmt(c)}.`, `${fmt(c)} é ${a} × ${fmt(f)}. Faça primeiro ${d} × ${a} = ${base}.`, `${base} × ${fmt(f)} = ${fmt(certa)}.`],
    }
  },
}

// ---------------------------------------------------------------- aula 4: quebrar para multiplicar

export const distributivaN1: Gerador = {
  id: 'distributiva-n1',
  aula: 'B.U3.A4',
  nivel: 1,
  gerar(r) {
    const a = r.int(3, 9)
    const b = r.int(7, 9)
    const resto = b - 5
    const certa = a * b
    return {
      enunciado: `Parta ${a} × ${b} em ${a} × 5 e ${a} × ${resto}. Quanto dá ${a} × ${b}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[a * 5 + resto, 'distributiva-parcial'], [a + b, 'soma-no-lugar-de-multiplicar']]),
      dicas: ['Os dois pedaços juntos são o retângulo inteiro.', `${a} × 5 = ${a * 5} e ${a} × ${resto} = ${a * resto}.`, `${a * 5} + ${a * resto} = ${certa}.`],
      visual: retangulo({ linhas: a, colunas: b, cortes: [5], rotulos: true, areas: true }, `O retângulo de ${a} por ${b}, partido depois da quinta coluna. Cada pedaço mostra o seu produto; ao conferir, o total aparece embaixo.`),
    }
  },
}

/** Erros de quem quebra a × (dezenas + unidades). */
function errosDistributiva(a: number, n: number, certa: number) {
  const t = Math.floor(n / 10)
  const u = n % 10
  return mapa(certa, [
    [a * t * 10 + u, 'distributiva-parcial'],
    [a * u + t * 10, 'distributiva-parcial'],
    [a * t + a * u, 'conta-zeros-errado'],
    [a + n, 'soma-no-lugar-de-multiplicar'],
  ])
}

export const distributivaN2: Gerador = {
  id: 'distributiva-n2',
  aula: 'B.U3.A4',
  nivel: 2,
  gerar(r) {
    const a = r.int(3, 9)
    const t = r.int(1, 9)
    const u = r.int(2, 9)
    const n = t * 10 + u
    const certa = a * n
    return {
      enunciado: `Quebre para multiplicar: ${a} × ${n}`,
      formato: 'numero',
      resposta: certa,
      erros: errosDistributiva(a, n, certa),
      dicas: [`Quebre o ${n} em ${t * 10} + ${u} e multiplique cada parte.`, `${a} × ${t * 10} = ${a * t * 10}.`, `${a} × ${u} = ${a * u}. ${a * t * 10} + ${a * u} = ${certa}.`],
      visual: retangulo({ base: [t * 10, u], altura: [a], areas: [['?', '?']] }, `O retângulo de ${a} por ${n}, partido em ${t * 10} e ${u}. As duas partes mostram "?"; ao conferir, os produtos aparecem.`),
    }
  },
}

const PRECOS = [
  (a: number, p: number) => `Você compra ${a} camisetas de R$ ${p}. Quanto paga?`,
  (a: number, p: number) => `Um curso custa R$ ${p} por mês. Quanto custa em ${a} meses?`,
  (a: number, p: number) => `Um pacote de ração custa R$ ${p}. Quanto custam ${a} pacotes?`,
] as const

export const distributivaN3: Gerador = {
  id: 'distributiva-n3',
  aula: 'B.U3.A4',
  nivel: 3,
  gerar(r) {
    const a = r.int(3, 9)
    let p = r.int(12, 99)
    if (p % 10 === 0) p += 3
    const certa = a * p
    const t = Math.floor(p / 10)
    const u = p % 10
    return {
      enunciado: r.pick(PRECOS)(a, p),
      formato: 'numero',
      resposta: certa,
      erros: errosDistributiva(a, p, certa),
      dicas: [`São ${a} vezes R$ ${p}: quebre o ${p} em ${t * 10} + ${u}.`, `${a} × ${t * 10} = ${a * t * 10} e ${a} × ${u} = ${a * u}.`, `${a * t * 10} + ${a * u} = ${certa}. Dá R$ ${fmt(certa)}.`],
    }
  },
}

// ---------------------------------------------------------------- aula 5: multiplicação armada

export const armadaMultN1: Gerador = {
  id: 'armada-mult-n1',
  aula: 'B.U3.A5',
  nivel: 1,
  gerar(r) {
    const d = r.int(3, 9)
    const u = r.int(Math.ceil(10 / d), 9)
    const t = r.int(1, 9)
    const n = t * 10 + u
    const certa = n * d
    const pu = d * u
    return {
      enunciado: `Arme e resolva: ${n} × ${d}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [multSemReserva(n, d), 'esquece-reserva'],
        [reservaAntes(n, d), 'reserva-antes-de-multiplicar'],
        [produtosColados(n, d), 'escreve-numero-inteiro-na-casa'],
      ]),
      dicas: ['Comece pelas unidades. Se o produto passar de 9, as dezenas dele sobem para a casa da esquerda.', `${d} × ${u} = ${pu}: fica ${pu % 10}, vai ${Math.floor(pu / 10)}.`, `${d} × ${t} = ${d * t}, mais ${Math.floor(pu / 10)}: ${d * t + Math.floor(pu / 10)}. Resultado: ${fmt(certa)}.`],
      visual: contaVezes(n, d, `A conta armada ${n} × ${d}, sem resultado. Ao conferir, o vai um sobe em âmbar sobre as dezenas e o resultado se escreve da direita para a esquerda.`),
    }
  },
}

/** Dois números de dois algarismos; o de baixo tem dezenas e unidades diferentes de zero. */
function doisPorDois(r: Rng, maxBaixo: number): [number, number] {
  const a = r.int(12, 89)
  const tb = r.int(1, Math.floor(maxBaixo / 10))
  const ub = r.int(2, 9)
  return [a % 10 === 0 ? a + 1 : a, tb * 10 + ub]
}

const errosArmada = (a: number, b: number, certa: number) =>
  mapa(certa, [
    [semDeslocar(a, b), 'esquece-deslocar-linha'],
    [semDeslocar(b, a), 'esquece-deslocar-linha'],
    [casasIguais(a, b), 'multiplica-so-casas-iguais'],
    [a + b, 'soma-no-lugar-de-multiplicar'],
  ])

export const armadaMultN2: Gerador = {
  id: 'armada-mult-n2',
  aula: 'B.U3.A5',
  nivel: 2,
  gerar(r) {
    const [a, b] = doisPorDois(r, 49)
    const certa = a * b
    const ub = b % 10
    const tb = Math.floor(b / 10)
    return {
      enunciado: `Arme e resolva: ${a} × ${b}`,
      formato: 'numero',
      resposta: certa,
      erros: errosArmada(a, b, certa),
      dicas: [`Uma linha para cada algarismo do ${b}. A segunda linha começa com um 0.`, `Primeira linha: ${ub} × ${a} = ${a * ub}. Segunda: ${tb * 10} × ${a} = ${fmt(a * tb * 10)}.`, `${a * ub} + ${fmt(a * tb * 10)} = ${fmt(certa)}.`],
      visual: contaVezes(a, b, `A conta armada ${a} × ${b}, com os dois traços. Ao conferir, a primeira linha se escreve, depois o 0 de deslocamento acende em âmbar e a segunda linha entra.`),
    }
  },
}

const AUDITORIOS = [
  (a: number, b: number) => `Um auditório tem ${b} fileiras de ${a} cadeiras. Quantas cadeiras?`,
  (a: number, b: number) => `Um piso tem ${b} fileiras de ${a} lajotas. Quantas lajotas?`,
  (a: number, b: number) => `Uma fábrica embala ${a} potes por caixa. Quantos potes em ${b} caixas?`,
] as const

export const armadaMultN3: Gerador = {
  id: 'armada-mult-n3',
  aula: 'B.U3.A5',
  nivel: 3,
  gerar(r) {
    const [a, b] = doisPorDois(r, 99)
    const certa = a * b
    return {
      enunciado: r.pick(AUDITORIOS)(a, b),
      formato: 'numero',
      resposta: certa,
      erros: errosArmada(a, b, certa),
      dicas: [`São ${b} grupos de ${a}: ${a} × ${b}. Arme a conta.`, `${a} × ${b % 10} = ${a * (b % 10)} e ${a} × ${Math.floor(b / 10) * 10} = ${fmt(a * Math.floor(b / 10) * 10)}.`, `${a * (b % 10)} + ${fmt(a * Math.floor(b / 10) * 10)} = ${fmt(certa)}.`],
    }
  },
}

export const GERADORES_U3: Gerador[] = [
  gruposN1, gruposN2, gruposN3,
  tabuadaN1, tabuadaN2, tabuadaN3,
  vezesDezN1, vezesDezN2, vezesDezN3,
  distributivaN1, distributivaN2, distributivaN3,
  armadaMultN1, armadaMultN2, armadaMultN3,
]
