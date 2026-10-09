import type { Gerador, Item, Rng } from '@/lib/formation/schema'

const CASAS = ['unidades', 'dezenas', 'centenas', 'milhares'] as const
export const milhar = (n: number) => n.toLocaleString('pt-BR')

/** Escolha sem reposição: a pergunta nunca aponta para um algarismo repetido. */
function algarismos(r: Rng, quantidade: number): number[] {
  let disponiveis = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  return Array.from({ length: quantidade }, () => {
    const d = r.pick(disponiveis)
    disponiveis = disponiveis.filter((v) => v !== d)
    return d
  })
}

function valor(r: Rng, sozinho: boolean): Item {
  const escolhidos = algarismos(r, sozinho ? 3 : 2)
  const digits = sozinho ? [escolhidos[0], 0, escolhidos[1], escolhidos[2]] : escolhidos
  const n = Number(digits.join(''))
  const indice = sozinho ? r.pick([0, 2]) : 0
  const d = digits[indice]
  const pos = digits.length - indice - 1
  const resposta = d * 10 ** pos
  const erros: Record<string, string> = {
    [String(d)]: 'valor-de-face',
    [String(resposta * 10)]: 'casa-errada',
  }
  if (pos > 1) erros[String(resposta / 10)] = 'casa-errada'
  return {
    enunciado: sozinho
      ? 'Exemplo imaginado: há ' + milhar(n) + ' peças numa contagem. Quanto vale o ' + d + ' nesse número?'
      : 'Em ' + milhar(n) + ', quanto vale o ' + d + '?',
    formato: 'numero',
    resposta,
    erros,
    dicas: [
      'O valor de um algarismo depende da casa em que ele está.',
      'Conte as casas da direita: o ' + d + ' está nas ' + CASAS[pos] + '.',
      d + ' ' + CASAS[pos] + ' representam ' + milhar(resposta) + ' unidades.',
    ],
    ...(sozinho ? {} : {
      visual: {
        modelo: 'quadro-posicional' as const,
        estado: { numero: n, casas: ['D', 'U'] },
        esboco: 'Número de duas casas com barras e cubos. O apoio liga cada peça à quantidade sem exibir a resposta numérica pronta.',
      },
    }),
  }
}

export const valorDoAlgarismo: Gerador = {
  id: 'valor-do-algarismo',
  aula: 'B.U1.A2',
  nivel: 1,
  gerar: (r) => valor(r, false),
}

const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'] as const
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'] as const

export const palavrasParaNumero: Gerador = {
  id: 'palavras-para-numero',
  aula: 'B.U1.A2',
  nivel: 2,
  gerar(r) {
    const c = r.int(2, 9)
    const u = r.int(1, 9)
    const n = c * 100 + u
    return {
      enunciado: 'Escreva com algarismos: ' + CENTENAS[c] + ' e ' + UNIDADES[u] + '.',
      formato: 'numero',
      resposta: n,
      erros: { [String(c * 100) + u]: 'concatena-casas', [String(c) + u]: 'esquece-zero' },
      dicas: [
        'O zero guarda uma casa vazia.',
        'São ' + c + ' centenas, nenhuma dezena e ' + u + ' unidades.',
        c + ' centenas, 0 dezenas e ' + u + ' unidades: ' + n + '.',
      ],
      visual: {
        modelo: 'quadro-posicional',
        estado: { numero: null, casas: ['C', 'D', 'U'] },
        esboco: 'Quadro vazio para o aluno distribuir o ditado. Os blocos da resposta só aparecem na correção.',
      },
    }
  },
}

const DEZENAS = ['', 'dez', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'] as const

/** No formato escolha, resposta e chaves de erros são índices das opções. */
export const leituraComZero: Gerador = {
  id: 'leitura-com-zero',
  aula: 'B.U1.A2',
  nivel: 2,
  gerar(r) {
    const u = r.int(1, 9)
    const n = 1000 + u
    const correta = 'Mil e ' + UNIDADES[u]
    const troca = 'Mil e ' + DEZENAS[u]
    const onzeADezenove = ['onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
    const semZeros = onzeADezenove[u - 1]
    const opcoes = r.pick([
      [correta, troca, semZeros],
      [troca, semZeros, correta],
      [semZeros, correta, troca],
    ])
    const resposta = opcoes.indexOf(correta)
    return {
      enunciado: 'Como se lê ' + milhar(n) + '?',
      formato: 'escolha',
      opcoes,
      resposta,
      erros: { [String(opcoes.indexOf(troca))]: 'casa-errada', [String(opcoes.indexOf(semZeros))]: 'esquece-zero' },
      dicas: [
        'Leia o valor do algarismo, não apenas a sequência de peças.',
        'Há um milhar e ' + u + ' unidades; centenas e dezenas estão vazias.',
        milhar(n) + ' se lê ' + correta.toLowerCase() + '.',
      ],
      visual: {
        modelo: 'quadro-posicional',
        estado: { numero: n, casas: ['M', 'C', 'D', 'U'], blocosVisiveis: false },
        esboco: 'Quatro casas alinhadas, com dois zeros centrais. Só na correção abrir os blocos da leitura escolhida.',
      },
    }
  },
}

export const valorPosicionalSozinho: Gerador = {
  id: 'valor-posicional-sozinho',
  aula: 'B.U1.A2',
  nivel: 3,
  gerar: (r) => valor(r, true),
}
