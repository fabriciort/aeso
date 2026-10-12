import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 4: divisão. Os dois sentidos (repartir e quantos cabem), o resto
// e o que fazer com ele, a divisão longa na chave (com o zero no quociente),
// a prova real e a divisão por zero.

/** Erros previsíveis, sem nunca marcar a resposta certa e sem sobrescrever. */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor !== certa && valor >= 0 && !(String(valor) in erros)) erros[String(valor)] = erro
  }
  return erros
}

type Op = { texto: string; certa?: boolean; erro?: string }
/** Opções em ordem girada pela semente; a resposta é o índice da certa. */
function girar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const inicio = r.int(0, opcoes.length - 1)
  const ordem = [...opcoes.slice(inicio), ...opcoes.slice(0, inicio)]
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

/** O quociente sem os zeros: o erro de quem pula a casa que não dá (102 → 12). */
export const semZeros = (q: number) => Number(String(q).replace(/0/g, '') || '0')

/**
 * Os passos da divisão longa na chave: cada parcial dividida, o algarismo do
 * quociente e o resto. A primeira parcial é o menor começo do número que
 * já dá para dividir.
 */
export function chave(t: number, d: number): { parcial: number; digito: number; resto: number }[] {
  const s = String(t)
  const passos: { parcial: number; digito: number; resto: number }[] = []
  let i = 0
  let parcial = 0
  while (i < s.length - 1 && parcial * 10 + Number(s[i]) < d) parcial = parcial * 10 + Number(s[i++])
  for (; i < s.length; i++) {
    parcial = parcial * 10 + Number(s[i])
    const digito = Math.floor(parcial / d)
    passos.push({ parcial, digito, resto: parcial - digito * d })
    parcial = parcial - digito * d
  }
  return passos
}

/** A dica do primeiro passo e, se houver, a do primeiro zero do quociente. */
function dicaChave(t: number, d: number): string {
  const ps = chave(t, d)
  const p0 = ps[0]
  const primeiro = `Comece por ${p0.parcial} ÷ ${d} = ${p0.digito}${p0.resto ? `, resto ${p0.resto}` : ''}.`
  const z = ps.find((p) => p.digito === 0)
  if (z) return `${primeiro} Depois, ${z.parcial} ÷ ${d} não dá nem 1: escreva 0.`
  return p0.resto ? `${primeiro} O ${p0.resto} junta com o próximo algarismo.` : `${primeiro} Depois, desça o próximo algarismo.`
}

const retangulo = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const naChave = (dividendo: number, divisor: number): Visual => ({
  modelo: 'quadro-posicional',
  estado: { divisao: { dividendo, divisor } },
  esboco: `A chave armada: ${dividendo} à esquerda, ${divisor} na caixa, o quociente vazio. Ao conferir, os algarismos descem um a um.`,
})

// ---------------------------------------------------------------- aula 1: repartir e quantos cabem

type Sentido = 'repartir' | 'cabem'
const FACEIS: Record<Sentido, ((t: number, d: number) => string)[]> = {
  repartir: [
    (t, d) => `${t} balas para ${d} pessoas, em partes iguais. Quantas cada uma ganha?`,
    (t, d) => `${t} mudas para ${d} canteiros, o mesmo tanto em cada. Quantas por canteiro?`,
  ],
  cabem: [
    (t, d) => `${t} balas em pacotes de ${d}. Quantos pacotes dá para fazer?`,
    (t, d) => `Você tem ${t} ovos e cada receita usa ${d}. Quantas receitas dá para fazer?`,
  ],
}
const ADULTOS: Record<Sentido, ((t: number, d: number) => string)[]> = {
  repartir: [
    (t, d) => `Uma conta de R$ ${t} foi dividida igualmente entre ${d} amigos. Quanto cada um paga?`,
    (t, d) => `${t} horas de trabalho divididas igualmente em ${d} dias. Quantas horas por dia?`,
    (t, d) => `${t} cadeiras arrumadas em ${d} fileiras iguais. Quantas cadeiras em cada fileira?`,
  ],
  cabem: [
    (t, d) => `Um rolo de ${t} m de fio é cortado em pedaços de ${d} m. Quantos pedaços saem?`,
    (t, d) => `Uma caixa tem ${t} comprimidos e a dose é ${d} por dia. A caixa dura quantos dias?`,
    (t, d) => `${t} pessoas vão sentar em mesas de ${d} lugares, todas cheias. Quantas mesas?`,
  ],
}
const dicasSentido = (s: Sentido, t: number, d: number, q: number): Item['dicas'] =>
  s === 'repartir'
    ? ['Repartir é dar partes iguais até acabar.', `Dê rodadas de ${d}, uma para cada parte. Quantas rodadas até ${t}?`, `${d} × ${q} = ${t}, então ${t} ÷ ${d} = ${q}.`]
    : [`Quantos cabem: tire grupos de ${d} até acabar.`,`Conte de ${d} em ${d} até chegar a ${t}.`, `${d} × ${q} = ${t}, então ${t} ÷ ${d} = ${q}.`]

export const repartirN1: Gerador = {
  id: 'repartir-n1',
  aula: 'B.U4.A1',
  nivel: 1,
  gerar(r) {
    const sentido = r.pick(['repartir', 'cabem'] as const)
    const d = r.int(2, 5)
    const q = r.int(2, 6)
    const t = d * q
    return {
      enunciado: r.pick(FACEIS[sentido])(t, d),
      formato: 'numero',
      resposta: q,
      erros: mapa(q, [[t * d, 'operacao-trocada'], [t - d, 'operacao-trocada']]),
      dicas: dicasSentido(sentido, t, d, q),
      visual: retangulo(
        { linhas: 0, colunas: d, rotulos: true, total: t },
        sentido === 'repartir' ? `${d} colunas, uma por parte. Ao conferir, as rodadas entram como linhas até usar os ${t}.` : `Linhas de ${d}, uma por grupo. Ao conferir, os grupos entram até usar os ${t}.`,
      ),
    }
  },
}

export const repartirN2: Gerador = {
  id: 'repartir-n2',
  aula: 'B.U4.A1',
  nivel: 2,
  gerar(r) {
    const sentido = r.pick(['repartir', 'cabem'] as const)
    const d = r.int(3, 9)
    const q = r.int(3, 9)
    const t = d * q
    return {
      enunciado: r.pick(FACEIS[sentido])(t, d) + ' Escolha a conta.',
      formato: 'escolha',
      ...girar(r, [
        { texto: `${t} ÷ ${d}`, certa: true },
        { texto: `${d} ÷ ${t}`, erro: 'divide-o-menor-pelo-maior' },
        { texto: `${t} × ${d}`, erro: 'operacao-trocada' },
        { texto: `${t} − ${d}`, erro: 'operacao-trocada' },
      ]),
      dicas: [
        'Pergunte: o que está sendo repartido? Esse total vem primeiro na divisão.',
        sentido === 'repartir' ? `O total é ${t}, repartido entre ${d}.` : `O total é ${t}, separado em grupos de ${d}.`,
        `${t} ÷ ${d} = ${q}, porque ${d} × ${q} = ${t}.`,
      ],
    }
  },
}

export const repartirN3: Gerador = {
  id: 'repartir-n3',
  aula: 'B.U4.A1',
  nivel: 3,
  gerar(r) {
    const sentido = r.pick(['repartir', 'cabem'] as const)
    const d = r.int(3, 9)
    const q = r.int(4, 12)
    const t = d * q
    return {
      enunciado: r.pick(ADULTOS[sentido])(t, d),
      formato: 'numero',
      resposta: q,
      erros: mapa(q, [[t * d, 'operacao-trocada'], [t - d, 'operacao-trocada']]),
      dicas: dicasSentido(sentido, t, d, q),
    }
  },
}

// ---------------------------------------------------------------- aula 2: o resto

const SOBRA: ((t: number, d: number) => string)[] = [
  (t, d) => `Você tem ${t} balas e faz pacotes de ${d}. Quantas balas sobram?`,
  (t, d) => `Você tem ${t} ovos e enche caixas de ${d}. Quantos ovos ficam fora das caixas?`,
]
const SOBRA_ADULTOS: ((t: number, d: number) => string)[] = [
  (t, d) => `${t} parafusos vão em saquinhos de ${d}. Quantos parafusos sobram fora dos saquinhos?`,
  (t, d) => `Com R$ ${t}, você compra o máximo de pacotes de R$ ${d}. Quanto sobra de troco?`,
]
/** Situações em que o resto pede mais um grupo. */
const PARA_CIMA: ((t: number, d: number) => string)[] = [
  (t, d) => `${t} pessoas vão de van, ${d} em cada van. Quantas vans é preciso alugar?`,
  (t, d) => `${t} convidados e mesas de ${d} lugares. Quantas mesas é preciso para todos sentarem?`,
  (t, d) => `${t} livros vão em caixas de ${d}. Quantas caixas é preciso para levar todos?`,
]
/** Situações em que o resto fica de fora. */
const PARA_BAIXO: ((t: number, d: number) => string)[] = [
  (t, d) => `${t} salgados vão em caixas de ${d}. Quantas caixas ficam cheias?`,
  (t, d) => `Com ${t} m de tecido, quantas cortinas de ${d} m dá para fazer?`,
  (t, d) => `Com R$ ${t}, quantos ingressos de R$ ${d} dá para comprar?`,
]

function itemResto(r: Rng, t: number, d: number, q: number, resto: number, frases: ((t: number, d: number) => string)[]): Item {
  return {
    enunciado: r.pick(frases)(t, d),
    formato: 'numero',
    resposta: resto,
    erros: mapa(resto, [[q, 'troca-quociente-e-resto'], ...(q >= 2 ? ([[resto + d, 'resto-maior-que-divisor']] as [number, string][]) : [])]),
    dicas: ['O resto é o que sobra quando não cabe mais um grupo inteiro.', `Conte de ${d} em ${d} sem passar de ${t}: até ${d * q}.`, `${d} × ${q} = ${d * q}. De ${d * q} até ${t} sobram ${resto}.`],
  }
}

function itemContexto(r: Rng, t: number, d: number, q: number, resto: number): Item {
  const cima = r.int(0, 1) === 0
  const certa = cima ? q + 1 : q
  return {
    enunciado: r.pick(cima ? PARA_CIMA : PARA_BAIXO)(t, d),
    formato: 'numero',
    resposta: certa,
    erros: mapa(certa, [[cima ? q : q + 1, 'ignora-contexto-do-resto'], [resto, 'troca-quociente-e-resto']]),
    dicas: [
      'Divida e depois volte à pergunta: o que fazer com o que sobra?',
      `${t} ÷ ${d} = ${q}, resto ${resto}.`,
      cima ? `O resto, ${resto}, também precisa de lugar: ${q} + 1 = ${q + 1}.` : `O resto, ${resto}, não completa mais um grupo inteiro: são ${q}.`,
    ],
  }
}

export const restoN1: Gerador = {
  id: 'resto-n1',
  aula: 'B.U4.A2',
  nivel: 1,
  gerar(r) {
    const d = r.int(3, 6)
    const q = r.int(2, 6)
    const resto = r.int(1, d - 1)
    const t = d * q + resto
    return {
      ...itemResto(r, t, d, q, resto, SOBRA),
      visual: retangulo({ linhas: q, colunas: d, grupos: true, total: t, sobra: resto }, `${q} linhas de ${d}, cada uma um grupo, e os ${resto} quadradinhos que sobram soltos ao lado, com a borda tracejada.`),
    }
  },
}

export const restoN2: Gerador = {
  id: 'resto-n2',
  aula: 'B.U4.A2',
  nivel: 2,
  gerar(r) {
    const d = r.int(3, 9)
    const q = r.int(2, 9)
    const resto = r.int(1, d - 1)
    return itemContexto(r, d * q + resto, d, q, resto)
  },
}

export const restoN3: Gerador = {
  id: 'resto-n3',
  aula: 'B.U4.A2',
  nivel: 3,
  gerar(r) {
    const d = r.int(4, 9)
    const q = r.int(6, 12)
    const resto = r.int(1, d - 1)
    const t = d * q + resto
    return r.int(0, 2) === 0 ? itemResto(r, t, d, q, resto, SOBRA_ADULTOS) : itemContexto(r, t, d, q, resto)
  },
}

// ---------------------------------------------------------------- aula 3: divisão longa

const LONGA: ((t: number, d: number) => string)[] = [
  (t, d) => `R$ ${t} vão ser divididos igualmente entre ${d} pessoas. Quanto cada uma recebe?`,
  (t, d) => `Uma viagem de ${t} km vai ser feita em ${d} dias, o mesmo tanto por dia. Quantos km por dia?`,
  (t, d) => `${t} garrafas vão em engradados de ${d}. Quantos engradados ficam cheios?`,
  (t, d) => `Um livro de ${t} páginas, lido em ${d} semanas, o mesmo tanto por semana. Quantas páginas por semana?`,
]

export const divisaoLongaN1: Gerador = {
  id: 'divisao-longa-n1',
  aula: 'B.U4.A3',
  nivel: 1,
  gerar(r) {
    const d = r.int(2, 4)
    const casas = r.int(2, 3)
    const digitos = Array.from({ length: casas }, () => r.int(1, Math.floor(9 / d)))
    const q = Number(digitos.join(''))
    const t = d * q
    return {
      enunciado: `Divida na chave: ${t} ÷ ${d}.`,
      formato: 'numero',
      resposta: q,
      erros: mapa(q, [[t * d, 'operacao-trocada']]),
      dicas: ['Divida casa por casa, começando pela casa da esquerda.', dicaChave(t, d), `${t} ÷ ${d} = ${q}. Confira: ${d} × ${q} = ${t}.`],
      visual: naChave(t, d),
    }
  },
}

export const divisaoLongaN2: Gerador = {
  id: 'divisao-longa-n2',
  aula: 'B.U4.A3',
  nivel: 2,
  gerar(r) {
    const d = r.int(2, 9)
    const a = r.int(1, Math.floor(9 / d))
    // O zero no meio (612 ÷ 6 = 102) ou no fim (840 ÷ 4 = 210).
    const noFim = r.int(0, 2) === 0
    const q = noFim ? 100 * a + 10 * r.int(1, Math.floor((999 / d - 100 * a) / 10)) : 100 * a + r.int(1, 9)
    const t = d * q
    return {
      enunciado: `Divida na chave: ${t} ÷ ${d}.`,
      formato: 'numero',
      resposta: q,
      erros: mapa(q, [[semZeros(q), 'esquece-zero-no-quociente']]),
      dicas: ['Se uma casa não dá para dividir, escreva 0 no quociente e siga.', dicaChave(t, d), `${t} ÷ ${d} = ${q}. Confira: ${d} × ${q} = ${t}.`],
      visual: naChave(t, d),
    }
  },
}

export const divisaoLongaN3: Gerador = {
  id: 'divisao-longa-n3',
  aula: 'B.U4.A3',
  nivel: 3,
  gerar(r) {
    const d = r.int(3, 9)
    const q = r.int(Math.ceil(100 / d), Math.floor(999 / d))
    const t = d * q
    return {
      enunciado: r.pick(LONGA)(t, d),
      formato: 'numero',
      resposta: q,
      erros: mapa(q, [[semZeros(q), 'esquece-zero-no-quociente'], [t * d, 'operacao-trocada']]),
      dicas: ['Arme a chave e divida casa por casa, da esquerda para a direita.', dicaChave(t, d), `${t} ÷ ${d} = ${q}. Confira: ${d} × ${q} = ${t}.`],
    }
  },
}

// ---------------------------------------------------------------- aula 4: a prova real

export const provaRealN1: Gerador = {
  id: 'prova-real-n1',
  aula: 'B.U4.A4',
  nivel: 1,
  gerar(r) {
    const d = r.int(2, 9)
    const q = r.int(1, 4) * 10 + r.int(1, 9)
    const t = d * q
    return {
      enunciado: `Você dividiu um número por ${d} e deu ${q}, sem resto. Que número você dividiu?`,
      formato: 'numero',
      resposta: t,
      erros: mapa(t, [[d + q, 'operacao-trocada']]),
      dicas: ['Prova real: divisor vezes quociente dá o dividendo.', `Faça ${d} × ${q}.`, `${d} × ${q} = ${t}. E ${t} ÷ ${d} = ${q}.`],
      visual: retangulo({ base: [q - (q % 10), q % 10], altura: [d], areas: true }, `O retângulo de ${d} por ${q}, partido em ${q - (q % 10)} e ${q % 10}. As áreas se somam ao conferir.`),
    }
  },
}

export const provaRealN2: Gerador = {
  id: 'prova-real-n2',
  aula: 'B.U4.A4',
  nivel: 2,
  gerar(r) {
    const d = r.int(3, 9)
    const q = r.int(5, 30)
    const resto = r.int(1, d - 1)
    const t = d * q + resto
    return {
      enunciado: `Você dividiu um número por ${d} e deu ${q}, resto ${resto}. Que número você dividiu?`,
      formato: 'numero',
      resposta: t,
      erros: mapa(t, [[d * q, 'prova-real-sem-resto'], [d * q - resto, 'inversa-errada']]),
      dicas: ['Prova real: divisor vezes quociente, mais o resto, dá o dividendo.', `Faça ${d} × ${q} e não esqueça o resto.`, `${d} × ${q} + ${resto} = ${d * q} + ${resto} = ${t}.`],
    }
  },
}

export const provaRealN3: Gerador = {
  id: 'prova-real-n3',
  aula: 'B.U4.A4',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const d = r.int(2, 9)
      const q = 100 * r.int(1, Math.floor(9 / d)) + r.int(1, 9)
      const t = d * q
      const achou = semZeros(q)
      return {
        enunciado: `Alguém fez ${t} ÷ ${d} e achou ${achou}. Faça a prova real. Qual é o quociente certo?`,
        formato: 'numero',
        resposta: q,
        erros: mapa(q, [[achou, 'esquece-zero-no-quociente']]),
        dicas: ['Prova real: divisor vezes quociente tem de dar o dividendo.', `${d} × ${achou} = ${d * achou}, não ${t}. Refaça na chave.`, `${t} ÷ ${d} = ${q}, porque ${d} × ${q} = ${t}.`],
      }
    }
    const d = r.int(4, 9)
    const q = r.int(4, 9)
    const resto = r.int(1, d - 1)
    const t = d * q + resto
    return {
      enunciado: `Alguém fez ${t} ÷ ${d} = ${q - 1}, resto ${resto + d}. A prova real fecha, mas há um erro. Qual é o quociente certo?`,
      formato: 'numero',
      resposta: q,
      erros: mapa(q, [[q - 1, 'resto-maior-que-divisor']]),
      dicas: ['O resto tem de ser menor que o divisor.', `Um resto de ${resto + d} ainda tem mais um grupo de ${d}.`, `${t} ÷ ${d} = ${q}, resto ${resto}: ${d} × ${q} + ${resto} = ${t}.`],
    }
  },
}

// ---------------------------------------------------------------- aula 5: dividir por zero

const NAO = 'Não existe'

export const zeroN1: Gerador = {
  id: 'zero-n1',
  aula: 'B.U4.A5',
  nivel: 1,
  gerar(r) {
    const d = r.int(2, 12)
    return {
      enunciado: `Quanto é 0 ÷ ${d}?`,
      formato: 'escolha',
      ...girar(r, [{ texto: '0', certa: true }, { texto: String(d) }, { texto: NAO, erro: 'zero-dividido-nao-existe' }]),
      dicas: ['Pense em repartir: 0 balas para ' + d + ' pessoas.', `Prova real: que número vezes ${d} dá 0?`, `${d} × 0 = 0, então 0 ÷ ${d} = 0.`],
      visual: retangulo({ linhas: 0, colunas: d, rotulos: true, total: 0 }, `${d} colunas vazias, uma por pessoa: não há nada para repartir.`),
    }
  },
}

export const zeroN2: Gerador = {
  id: 'zero-n2',
  aula: 'B.U4.A5',
  nivel: 2,
  gerar(r) {
    const a = r.int(2, 99)
    if (r.int(0, 1) === 0) {
      return {
        enunciado: `Quanto é ${a} ÷ 0?`,
        formato: 'escolha',
        ...girar(r, [{ texto: '0', erro: 'dividir-por-zero-da-zero' }, { texto: String(a), erro: 'dividir-por-zero-da-o-dividendo' }, { texto: NAO, certa: true }]),
        dicas: ['Prova real: a resposta vezes 0 teria de dar ' + a + '.', `Que número vezes 0 dá ${a}? Teste 0, teste ${a}.`, `Todo número vezes 0 dá 0, nunca ${a}. ${a} ÷ 0 não existe.`],
      }
    }
    return {
      enunciado: `Quanto é 0 ÷ ${a}?`,
      formato: 'escolha',
      ...girar(r, [{ texto: '0', certa: true }, { texto: String(a) }, { texto: NAO, erro: 'zero-dividido-nao-existe' }]),
      dicas: ['O zero está na frente: é o total que vai ser repartido.', `Prova real: que número vezes ${a} dá 0?`, `${a} × 0 = 0, então 0 ÷ ${a} = 0.`],
    }
  },
}

export const zeroN3: Gerador = {
  id: 'zero-n3',
  aula: 'B.U4.A5',
  nivel: 3,
  gerar(r) {
    const a = r.int(2, 20)
    if (r.int(0, 1) === 0) {
      return {
        enunciado: 'Qual destas contas não tem resposta?',
        formato: 'escolha',
        ...girar(r, [{ texto: `${a} ÷ 0`, certa: true }, { texto: `0 ÷ ${a}`, erro: 'zero-dividido-nao-existe' }, { texto: `${a} ÷ ${a}` }, { texto: `${a} ÷ 1` }]),
        dicas: ['Só uma divisão é proibida: dividir por zero.', 'Procure o zero depois do sinal ÷.', `${a} ÷ 0 não existe: nenhum número vezes 0 dá ${a}.`],
      }
    }
    return {
      enunciado: 'Qual destas contas dá 0?',
      formato: 'escolha',
      ...girar(r, [{ texto: `0 ÷ ${a}`, certa: true }, { texto: `${a} ÷ 0`, erro: 'dividir-por-zero-da-zero' }, { texto: `${a} ÷ ${a}` }, { texto: `${a} ÷ 1` }]),
      dicas: ['Zero repartido entre quantos for continua zero.', `Faça a prova real de cada uma. Que número vezes ${a} dá 0?`, `0 ÷ ${a} = 0, porque ${a} × 0 = 0. Já ${a} ÷ 0 não existe.`],
    }
  },
}

export const GERADORES_U4: Gerador[] = [
  repartirN1, repartirN2, repartirN3,
  restoN1, restoN2, restoN3,
  divisaoLongaN1, divisaoLongaN2, divisaoLongaN3,
  provaRealN1, provaRealN2, provaRealN3,
  zeroN1, zeroN2, zeroN3,
]
