import type { Gerador } from '@/lib/formation/schema'

// Geradores da aula B.U1.A2 ("O zero que guarda o lugar"). Exemplo de
// formato: o autor do conteúdo pode reescrever e criar outros.

const CASAS = ['unidades', 'dezenas', 'centenas', 'milhares'] as const

/** "4.072": ponto de milhar, como no Brasil. */
export const milhar = (n: number) => n.toLocaleString('pt-BR')

/** Valor de um algarismo pela casa: "Em 4.072, quanto vale o 7?" */
export const valorDoAlgarismo: Gerador = {
  id: 'valor-do-algarismo',
  aula: 'B.U1.A2',
  nivel: 1,
  gerar(r) {
    // 3 ou 4 algarismos, com pelo menos um zero no meio, e algarismos não repetidos
    // (para a pergunta "quanto vale o 7?" não ser ambígua).
    let digits: number[]
    do {
      const len = r.int(3, 4)
      digits = [r.int(1, 9), ...Array.from({ length: len - 1 }, () => r.int(0, 9))]
      if (!digits.slice(1, -1).includes(0)) digits[r.int(1, len - 2)] = 0
    } while (new Set(digits).size !== digits.length)
    const n = Number(digits.join(''))
    const candidates = digits.map((d, i) => ({ d, pos: digits.length - 1 - i })).filter((x) => x.d !== 0 && x.pos > 0)
    const { d, pos } = r.pick(candidates)
    const valor = d * 10 ** pos
    const erros: Record<string, string> = { [String(d)]: 'valor-de-face' }
    if (pos + 1 <= 4) erros[String(d * 10 ** (pos + 1))] = 'casa-errada'
    if (pos - 1 >= 0 && pos - 1 !== 0) erros[String(d * 10 ** (pos - 1))] = 'casa-errada'
    return {
      enunciado: `Em ${milhar(n)}, quanto vale o ${d}?`,
      formato: 'numero',
      resposta: valor,
      erros,
      dicas: [
        'O valor depende da casa em que o algarismo está.',
        `O ${d} está na casa das ${CASAS[pos]}.`,
        `${d} ${CASAS[pos]} = ${milhar(valor)}.`,
      ],
      visual: { modelo: 'quadro-posicional', estado: { numero: n, destaque: pos } },
    }
  },
}

const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

/** De palavras para número, com zero no meio: "seiscentos e nove" → 609. */
export const palavrasParaNumero: Gerador = {
  id: 'palavras-para-numero',
  aula: 'B.U1.A2',
  nivel: 2,
  gerar(r) {
    const c = r.int(2, 9)
    const u = r.int(1, 9)
    const n = c * 100 + u
    return {
      enunciado: `Escreva com algarismos: ${CENTENAS[c]} e ${UNIDADES[u]}.`,
      formato: 'numero',
      resposta: n,
      erros: { [`${c * 100}${u}`]: 'concatena-casas', [`${c}${u}`]: 'esquece-zero' },
      dicas: [
        'Pense em quantas centenas, dezenas e unidades o número tem.',
        `São ${c} centenas, nenhuma dezena e ${u} unidades.`,
        `${c} centenas, 0 dezenas, ${u} unidades: ${n}.`,
      ],
      visual: { modelo: 'quadro-posicional', estado: { numero: null, casas: 3 } },
    }
  },
}
