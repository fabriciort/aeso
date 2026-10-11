import type { Gerador, Item, Rng } from '@/lib/formation/schema'

const numero = (n: number) => n.toLocaleString('pt-BR')
const ordem = (valores: readonly number[]) => valores.map(numero).join(' < ')

/** Embaralhamento limitado: funciona também com um rng que só devolve uma borda. */
function misture<T>(valores: readonly T[], r: Rng): T[] {
  const copia = [...valores]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

function escolhasDeOrdem(valoresCrescentes: [number, number, number], r: Rng) {
  const porUnidades = [...valoresCrescentes].sort((a, b) => (a % 10) - (b % 10))
  // Os casos são construídos com unidades distintas e ordem por unidades
  // diferente tanto da crescente como da inversa. Não há colisões de opções.
  const propostas = misture([
    { texto: ordem(valoresCrescentes), certa: true },
    { texto: ordem([...valoresCrescentes].reverse()), erro: 'inverte-reta' },
    { texto: ordem(porUnidades), erro: 'compara-pela-ultima-casa' },
  ], r)
  const erros: Record<string, string> = {}
  propostas.forEach((p, indice) => {
    // No formato escolha, a resposta é o índice: os diagnósticos usam a
    // mesma convenção, não o texto exibido na opção.
    if (p.erro) erros[String(indice)] = p.erro
  })
  return {
    opcoes: propostas.map((p) => p.texto),
    resposta: propostas.findIndex((p) => p.certa),
    erros,
  }
}

export const compararN1: Gerador = {
  id: 'comparar-n1',
  aula: 'B.U1.A4',
  nivel: 1,
  gerar(r) {
    const dezena = r.int(1, 6)
    const valores: [number, number, number] = [
      dezena * 10 + r.int(7, 9),
      (dezena + 1) * 10 + r.int(1, 3),
      (dezena + 2) * 10 + r.int(4, 6),
    ]
    const fichas = misture(valores, r)
    return {
      enunciado: `Ordene ${fichas.map(numero).join(', ')} do menor ao maior.`,
      formato: 'escolha',
      ...escolhasDeOrdem(valores, r),
      dicas: [
        'Na reta numérica, os números crescem da esquerda para a direita.',
        `${numero(valores[0])} vem primeiro. Compare os outros pela casa das dezenas.`,
        `${ordem(valores)}. Esta é a ordem do menor ao maior.`,
      ],
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 100, passo: 10, marcas: [0, 100], fichas, pontos: [] },
        esboco: 'Reta com intervalos iguais de 10 e fichas fora dela. O aluno pode arrastar as fichas antes de escolher. Não posicionar nem ordenar os números automaticamente; revelar os pontos proporcionais apenas na conferência.',
      },
    }
  },
}

export const compararN2: Gerador = {
  id: 'comparar-n2',
  aula: 'B.U1.A4',
  nivel: 2,
  gerar(r): Item {
    const caso = r.pick(['zero', 'troca', 'casas'] as const)
    let menor: number
    let maior: number
    let primeiroPasso: string
    let erro: string
    if (caso === 'casas') {
      const potencia = 10 ** r.int(2, 3)
      menor = potencia - 1
      maior = r.int(1, 4) * potencia
      primeiroPasso = `${numero(menor)} tem menos algarismos que ${numero(maior)}. Compare a quantidade de casas primeiro.`
      erro = 'ignora-quantidade-casas'
    } else {
      const centenas = r.int(1, 9) * 100
      const unidade = r.int(6, 9)
      const dezena = caso === 'zero' ? 0 : r.int(1, 3)
      menor = centenas + dezena * 10 + unidade
      maior = centenas + (caso === 'zero' ? r.int(1, 5) * 10 : unidade * 10 + dezena)
      primeiroPasso = 'Os dois têm a mesma quantidade de algarismos e centenas iguais. Compare as dezenas.'
      erro = 'compara-pela-ultima-casa'
    }
    const pergunta = r.pick(['maior', 'menor'] as const)
    const fichas = misture([menor, maior], r)
    const opcoes = misture([menor, maior], r).map(numero)
    const procurado = pergunta === 'maior' ? maior : menor
    const resposta = opcoes.indexOf(numero(procurado))
    return {
      enunciado: `Qual é o ${pergunta} número: ${numero(fichas[0])} ou ${numero(fichas[1])}?`,
      formato: 'escolha',
      opcoes,
      resposta,
      erros: { [String(1 - resposta)]: erro },
      dicas: [
        'Compare a quantidade de algarismos; se empatar, compare as casas da esquerda para a direita.',
        primeiroPasso,
        `${numero(menor)} < ${numero(maior)}. O ${pergunta} é ${numero(procurado)}.`,
      ],
      visual: {
        modelo: 'quadro-posicional',
        estado: { casas: ['M', 'C', 'D', 'U'], numero: null, fichas },
        esboco: 'Quadro vazio com casas de milhar a unidade; números em fichas fora do quadro. Deixar o aluno preencher e alinhar as casas à direita. Não destacar a primeira diferença nem o número maior antes da escolha.',
      },
    }
  },
}

export const compararN3: Gerador = {
  id: 'comparar-n3',
  aula: 'B.U1.A4',
  nivel: 3,
  gerar(r) {
    let valores: [number, number, number]
    if (r.int(0, 5) === 0) {
      valores = [999_900 + r.int(1, 4) * 10 + 8, 999_950 + r.int(0, 4) * 10 + 9, 1_000_000]
    } else {
      const escala = 10 ** r.int(3, 5)
      valores = [
        escala - 1,
        escala + r.int(2, 4) * (escala / 10) + r.int(1, 3),
        r.int(2, 8) * escala + r.int(4, 6),
      ]
    }
    const fichas = misture(valores, r)
    return {
      enunciado: `Três trilhas medem ${fichas.slice(0, -1).map(numero).join(' m, ')} m e ${numero(fichas[fichas.length - 1])} m. Ordene do menor ao maior.`,
      formato: 'escolha',
      ...escolhasDeOrdem(valores, r),
      dicas: [
        'Conte os algarismos primeiro: quem tem menos é menor.',
        `${numero(valores[0])} é o menor. Agora compare ${numero(valores[1])} e ${numero(valores[2])}.`,
        `Do menor ao maior: ${ordem(valores)}.`,
      ],
    }
  },
}
