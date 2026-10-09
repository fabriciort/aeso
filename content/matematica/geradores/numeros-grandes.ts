import type { Gerador, Item, Rng } from '@/lib/formation/schema'

const escrito = (n: number) => n.toLocaleString('pt-BR')
const nome = (escala: number, quantidade: number) => {
  if (escala === 1_000_000_000) return quantidade === 1 ? 'bilhão' : 'bilhões'
  if (escala === 1_000_000) return quantidade === 1 ? 'milhão' : 'milhões'
  return quantidade === 1 ? 'milhar' : 'milhares'
}

function montar(maior: number, escala: number, unidades: number, nivel: 1 | 2): Item {
  const total = maior * escala + unidades
  return {
    enunciado: `Escreva com algarismos: ${maior} ${nome(escala, maior)} e ${unidades} unidades.`,
    formato: 'numero',
    resposta: total,
    erros: {
      [String(maior * (escala === 1_000 ? 1_000_000 : escala / 1_000) + unidades)]: 'classe-errada',
      [`${maior}${unidades}`]: 'esquece-zero',
      [`${maior * escala}${unidades}`]: 'concatena-casas',
    },
    dicas: [
      'Separe as classes de três casas, começando pelas unidades à direita.',
      `Reserve a classe de ${nome(escala, 2)}; preencha as casas vazias com zeros.`,
      `${maior} ${nome(escala, maior)} e ${unidades} unidades: ${escrito(total)}. Os zeros mantêm cada grupo no seu lugar.`,
    ],
    visual: {
      modelo: 'quadro-posicional',
      estado: {
        classes: escala === 1_000 ? ['milhares', 'unidades']
          : escala === 1_000_000 ? ['milhões', 'milhares', 'unidades']
            : ['bilhões', 'milhões', 'milhares', 'unidades'],
        entrada: { maior, classe: nome(escala, 2), unidades },
        numero: null,
        preenchimento: [],
      },
      esboco: nivel === 1
        ? 'Mostre o quadro de duas classes vazio e as duas quantidades dadas, fora dele. O aluno preenche antes de ver qualquer algarismo colocado.'
        : 'O quadro de classes começa vazio. Deixe os grupos do enunciado como etiquetas de entrada; só revele classes vazias e zeros após conferir.',
    },
  }
}

function traduzirSeparador(r: Rng): Item {
  const total = r.int(1, 99) * 1_000 + r.int(0, 999)
  const registro = total.toLocaleString('en-US')
  const candidatos = [
    { texto: escrito(total), erro: undefined },
    { texto: registro, erro: 'separador-decimal' },
    { texto: escrito(total * 1_000), erro: 'classe-errada' },
  ]
  const inicio = r.int(0, candidatos.length - 1)
  const ordem = [...candidatos.slice(inicio), ...candidatos.slice(0, inicio)]
  // Para escolha, a resposta do contrato é o índice; os erros usam esse mesmo domínio.
  const erros: Record<string, string> = {}
  ordem.forEach((opcao, indice) => {
    if (opcao.erro) erros[String(indice)] = opcao.erro
  })
  return {
    enunciado: `Exemplo imaginado: um arquivo em inglês registra o inteiro ${registro}. Qual escrita usa ponto para milhar?`,
    formato: 'escolha',
    opcoes: ordem.map((opcao) => opcao.texto),
    resposta: ordem.findIndex((opcao) => !opcao.erro),
    erros,
    dicas: [
      'O enunciado informa que a vírgula separa milhares no arquivo em inglês.',
      'Leia os grupos de três casas; no padrão brasileiro, separe-os com ponto.',
      `${registro} (inglês) e ${escrito(total)} (português do Brasil) registram a mesma quantidade.`,
    ],
    visual: {
      modelo: 'quadro-posicional',
      estado: { origem: 'inglês', registro, classes: ['milhares', 'unidades'], numero: null, preenchimento: [] },
      esboco: 'Mostre o registro original ao lado de um quadro vazio. Não troque o separador antes da escolha; a conferência alinha os grupos sem mudar a quantidade.',
    },
  }
}

export const numerosGrandesN1: Gerador = {
  id: 'numeros-grandes-n1',
  aula: 'B.U1.A3',
  nivel: 1,
  gerar(r) {
    return montar(r.int(1, 9), 1_000, r.int(0, 9), 1)
  },
}

export const numerosGrandesN2: Gerador = {
  id: 'numeros-grandes-n2',
  aula: 'B.U1.A3',
  nivel: 2,
  gerar(r) {
    if (r.pick(['classes', 'separador']) === 'separador') return traduzirSeparador(r)
    const escala = r.pick([1_000_000, 1_000_000_000])
    return montar(r.int(1, 99), escala, r.int(0, 99), 2)
  },
}

export const numerosGrandesN3: Gerador = {
  id: 'numeros-grandes-n3',
  aula: 'B.U1.A3',
  nivel: 3,
  gerar(r) {
    const escala = r.pick([1_000_000, 1_000_000_000])
    const maior = r.int(1, 9)
    const meio = r.int(0, 99)
    const unidades = r.int(0, 99)
    const escalaMeio = escala / 1_000
    const total = maior * escala + meio * escalaMeio + unidades
    const erros: Record<string, string> = {}
    const propostas = [
      [String(maior * escalaMeio + meio * (escalaMeio / 1_000) + unidades), 'classe-errada'],
      [`${maior}${meio}${unidades}`, 'esquece-zero'],
      [`${maior * escala}${meio * escalaMeio}${unidades}`, 'concatena-casas'],
    ]
    // Duas concepções podem produzir o mesmo número. Preserve um diagnóstico
    // possível por resposta, sem sobrescrever nem tratar a certa como erro.
    for (const [valor, erro] of propostas) {
      if (valor !== String(total) && !(valor in erros)) erros[valor] = erro
    }
    return {
      enunciado: `Exemplo imaginado: arquivo com ${maior} ${nome(escala, maior)}, ${meio} ${nome(escalaMeio, meio)} e ${unidades} registros. Escreva com algarismos.`,
      formato: 'numero',
      resposta: total,
      erros,
      dicas: [
        'Cada classe tem três casas; começar pela direita ajuda a preservar os lugares vazios.',
        escala === 1_000_000_000
          ? 'Reserve bilhões, milhões, milhares e unidades. A classe dos milhares está vazia.'
          : 'Reserve milhões, milhares e unidades. Complete com zeros as casas não ocupadas.',
        `Complete cada classe até três casas, exceto a primeira: ${escrito(total)} registros.`,
      ],
    }
  },
}
