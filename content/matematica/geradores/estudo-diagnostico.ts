import type { Gerador, Item, Rng } from '@/lib/formation/schema'

type Alternativa = { texto: string; erro?: string }
type Situacao = { enunciado: string; opcoes: Alternativa[]; dicas: Item['dicas']; cena: string }

function escolha(rng: Rng, situacao: Situacao, nivel: 1 | 2 | 3): Item {
  const opcoes = [...situacao.opcoes]
  for (let i = opcoes.length - 1; i > 0; i--) {
    const j = rng.int(0, i)
    ;[opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]]
  }
  const resposta = opcoes.findIndex((opcao) => !opcao.erro)
  const erros = Object.fromEntries(opcoes.flatMap((opcao, indice) => opcao.erro ? [[String(indice), opcao.erro]] : []))
  return {
    enunciado: situacao.enunciado,
    formato: 'escolha',
    opcoes: opcoes.map((opcao) => opcao.texto),
    resposta,
    erros,
    dicas: situacao.dicas,
    ...(nivel < 3 ? {
      visual: {
        modelo: 'livre' as const,
        estado: { cena: situacao.cena, etapa: 'antes-da-escolha' },
        esboco: 'Proposta: mesa de estudo e cartões de ações, sem resposta destacada. Ao conferir, mostrar a tentativa registrada e o próximo passo. Modelo livre porque a tarefa é organizar o estudo, sem representar uma quantidade.',
      },
    } : {}),
  }
}

const MATERIAL: readonly Situacao[] = [
  {
    enunciado: 'Você vai estudar e tem papel à mão. O que deixar do lado?',
    opcoes: [
      { texto: 'Caderno quadriculado, lápis e borracha' },
      { texto: 'Só o celular: olhar já basta', erro: 'estudo-so-observar' },
      { texto: 'Só as respostas, para copiar', erro: 'estudo-dica-resposta' },
    ],
    dicas: ['Você vai precisar escrever suas tentativas.', 'Procure o que serve para escrever, alinhar e apagar.', 'Caderno quadriculado, lápis e borracha: para escrever, alinhar e corrigir.'],
    cena: 'mesa-com-papel',
  },
  {
    enunciado: 'Você está sem caderno agora. Como continuar estudando?',
    opcoes: [
      { texto: 'Escrever numa folha qualquer ou nas notas do celular' },
      { texto: 'Esperar ter caderno: sem ele não dá', erro: 'estudo-sem-papel' },
      { texto: 'Só assistir às respostas, sem tentar', erro: 'estudo-so-observar' },
    ],
    dicas: ['O importante é escrever sua tentativa em algum lugar.', 'Qualquer folha serve. O celular também.', 'Escreva numa folha qualquer ou nas notas do celular, e depois confira.'],
    cena: 'mesa-sem-papel',
  },
]

const APOIO: readonly Situacao[] = [
  {
    enunciado: 'Você travou num exercício. Como pedir ajuda sem pular sua tentativa?',
    opcoes: [
      { texto: 'Pedir uma dica, tentar o próximo passo e depois conferir' },
      { texto: 'Abrir a resolução e copiar a resposta', erro: 'estudo-dica-resposta' },
      { texto: 'Só olhar o exemplo, sem tentar', erro: 'estudo-so-observar' },
    ],
    dicas: ['A dica serve para você dar o próximo passo.', 'Comece pela dica mais leve e tente de novo.', 'Peça uma dica, tente um passo e depois confira.'],
    cena: 'pratica-com-dica',
  },
  {
    enunciado: 'Você prefere estudar em silêncio. E a voz da Vega?',
    opcoes: [
      { texto: 'Deixar a voz desligada e seguir pelo texto' },
      { texto: 'Ligar a voz: ouvir é obrigatório', erro: 'estudo-voz-obrigatoria' },
      { texto: 'Só ouvir a resolução, sem tentar', erro: 'estudo-so-observar' },
    ],
    dicas: ['A voz é opcional.', 'Escolha o que respeita o seu jeito de estudar.', 'Deixe a voz desligada. Tudo continua no texto e nos desenhos.'],
    cena: 'voz-opcional',
  },
  {
    enunciado: 'Você já sabe o assunto e toca em “Já sei isso”. O que acontece?',
    opcoes: [
      { texto: 'Vou direto aos exercícios, sem ajuda' },
      { texto: 'A aula fica marcada como feita, sem exercício', erro: 'estudo-pula-sem-tentar' },
      { texto: 'Releio a definição e sigo em frente', erro: 'estudo-so-observar' },
    ],
    dicas: ['Saber precisa ser conferido num exercício.', '“Já sei isso” leva aos exercícios da mesma aula.', '“Já sei isso” leva direto aos exercícios. Acertando, você mostra que sabe.'],
    cena: 'atalho-para-pratica',
  },
]

const RETOMADA: readonly Situacao[] = [
  {
    enunciado: 'Você ficou uns dias sem estudar. Como ver o que ainda lembra?',
    opcoes: [
      { texto: 'Refazer uma questão antiga sem olhar e depois conferir' },
      { texto: 'Reler as respostas: reconhecer já é saber', erro: 'estudo-so-observar' },
      { texto: 'Pular as questões antigas: a aula já acabou', erro: 'estudo-sem-revisao' },
    ],
    dicas: ['Você lembra de verdade quando consegue sem olhar.', 'Pegue uma questão que já fez e tente de novo.', 'Refaça uma questão antiga sem olhar. Depois confira e reveja a ideia, se precisar.'],
    cena: 'retomar-depois-da-pausa',
  },
  {
    enunciado: 'Você viu a correção e entendeu. Como saber se consegue sozinho?',
    opcoes: [
      { texto: 'Fechar a resolução e tentar outra questão parecida' },
      { texto: 'Copiar a correção como se fosse minha', erro: 'estudo-dica-resposta' },
      { texto: 'Não voltar mais ao assunto: já entendi', erro: 'estudo-sem-revisao' },
    ],
    dicas: ['Entender a correção é o começo. Resolver é outra coisa.', 'Feche a resolução e procure outra questão.', 'Feche a resolução e tente outra questão parecida, sem ajuda.'],
    cena: 'apos-conferir',
  },
]

// Níveis da orientação: decisões de estudo com apoio decrescente.
// Não medem proficiência matemática nem autorizam avançar na Básica.
export const estudoMaterial: Gerador = {
  id: 'estudo-material-n1', aula: 'B.U0.A1', nivel: 1,
  gerar: (rng) => escolha(rng, rng.pick(MATERIAL), 1),
}
export const estudoApoio: Gerador = {
  id: 'estudo-apoio-n2', aula: 'B.U0.A1', nivel: 2,
  gerar: (rng) => escolha(rng, rng.pick(APOIO), 2),
}
export const estudoRetomada: Gerador = {
  id: 'estudo-retomada-n3', aula: 'B.U0.A1', nivel: 3,
  gerar: (rng) => escolha(rng, rng.pick(RETOMADA), 3),
}

const numeroPtBr = (numero: number) => numero.toLocaleString('pt-BR')

// Os itens têm dicas por contrato. Na coleta diagnóstica, a experiência
// deve reter dicas, correção, erros e modelos resolvidos até concluir todos
// os slots. A presença de Item.dicas não autoriza ajuda na primeira resposta.
export const diagnosticoAgrupamento: Gerador = {
  id: 'diagnostico-agrupamento-n1', aula: 'B.U0.A2', nivel: 1,
  gerar(rng) {
    const grupos = rng.int(1, 5)
    const soltos = rng.int(1, 8)
    return {
      enunciado: `Há ${grupos} pacotes com 10 parafusos cada e mais ${soltos} parafusos soltos. Quantos parafusos são ao todo?`,
      formato: 'numero',
      resposta: grupos * 10 + soltos,
      erros: { [String(grupos + soltos)]: 'conta-grupos-como-unidades', [String(grupos * 10)]: 'descarta-sobra' },
      dicas: ['Cada pacote tem 10 parafusos. Os soltos também contam.', `Conte ${grupos} grupos de 10 e depois acrescente ${soltos} soltos.`, `${grupos} grupos de 10 e ${soltos} soltos: ${grupos * 10 + soltos} parafusos.`],
      visual: {
        modelo: 'blocos', estado: { grupos, tamanhoDoGrupo: 10, soltos, totalVisivel: false },
        esboco: 'Pacotes fechados, cada um rotulado 10, e parafusos soltos. Na coleta, não abrir pacotes, animar contagem ou exibir o total. Depois da coleta, cada pacote vira uma barra de 10; os soltos ficam ao lado.',
      },
    }
  },
}

export const diagnosticoPosicao: Gerador = {
  id: 'diagnostico-posicao-n2', aula: 'B.U0.A2', nivel: 2,
  gerar(rng) {
    const centena = rng.int(2, 9)
    const unidade = rng.int(1, 9)
    const numero = centena * 100 + unidade
    // Em 202, há dois 2: a pergunta diz qual.
    const qual = unidade === centena ? `o primeiro ${centena}` : `o ${centena}`
    return {
      enunciado: `Em ${numero}, quanto vale ${qual}?`,
      formato: 'numero', resposta: centena * 100,
      erros: { [String(centena)]: 'valor-de-face', [String(centena * 10)]: 'casa-errada' },
      dicas: ['O valor de um algarismo depende da casa em que ele está.', 'Conte as casas a partir da direita: unidades, dezenas, centenas.', `${qual[0].toUpperCase()}${qual.slice(1)} está nas centenas e vale ${centena * 100}.`],
      visual: {
        modelo: 'quadro-posicional', estado: { numero, casasRotuladas: false, blocosVisiveis: false, destaque: null },
        esboco: 'Na coleta, mostrar apenas o número, sem casas nomeadas, blocos ou destaque de valor. Após concluir os slots, revelar U, D, C da direita para a esquerda e as placas sob a centena.',
      },
    }
  },
}

export const diagnosticoNumerosGrandes: Gerador = {
  id: 'diagnostico-numeros-grandes-n3', aula: 'B.U0.A2', nivel: 3,
  gerar(rng) {
    const milhoes = rng.int(2, 9)
    const milhares = rng.int(2, 9)
    const total = milhoes * 1_000_000 + milhares * 1_000
    return {
      enunciado: `Um prêmio é de ${milhoes} milhões e ${milhares} mil reais. Escreva esse valor com algarismos.`,
      formato: 'numero', resposta: total,
      erros: { [String(milhoes * 1_000 + milhares)]: 'classe-errada', [String(milhoes * 1_000_000_000 + milhares * 1_000)]: 'classe-errada' },
      dicas: ['Milhões e milhares são classes diferentes. Cada classe tem 3 algarismos.', `Ponha ${milhoes} nos milhões e ${milhares} nos milhares. Complete com zeros.`, `${milhoes} milhões e ${milhares} mil reais: R$ ${numeroPtBr(total)}.`],
    }
  },
}

export const diagnosticoComparacao: Gerador = {
  id: 'diagnostico-comparacao-n3', aula: 'B.U0.A2', nivel: 3,
  gerar(rng) {
    const centenas = rng.int(2, 8)
    const unidades = rng.int(1, 4)
    const menor = centenas * 100 + rng.int(1, 4) * 10 + unidades + 4
    const maior = (centenas + 1) * 100 + rng.int(1, 4) * 10 + unidades
    const numeros = rng.pick([[menor, maior], [maior, menor]])
    return {
      enunciado: `Uma loja tem ${numeros[0]} peças no estoque; outra, ${numeros[1]}. Qual é o maior número?`,
      formato: 'numero', resposta: maior,
      erros: { [String(menor)]: 'compara-pela-ultima-casa' },
      dicas: ['Compare primeiro as casas que valem mais.', 'Os dois têm três algarismos. Comece pelas centenas.', `${maior} tem mais centenas que ${menor}. O maior é ${maior}.`],
    }
  },
}

export const diagnosticoArredondamento: Gerador = {
  id: 'diagnostico-arredondamento-n3', aula: 'B.U0.A2', nivel: 3,
  gerar(rng) {
    const dezenas = rng.int(12, 48)
    const numero = dezenas * 10 + 5
    const inferior = dezenas * 10
    const superior = inferior + 10
    return {
      enunciado: `Um conserto custa R$ ${numero}. Arredonde à dezena. Se ficar no meio, vá para a maior.`,
      formato: 'numero', resposta: superior,
      erros: { [String(inferior)]: 'empate-para-baixo' },
      dicas: ['Arredondar é trocar pela marca de 10 em 10 mais perto.', `${numero} fica entre ${inferior} e ${superior}, bem no meio.`, `No meio, fica a maior: R$ ${superior}.`],
    }
  },
}

/**
 * Roteiro de conteúdo, ainda sem motor adaptativo: colher uma primeira
 * resposta por alvo, incluindo “Não sei”, sem dicas e sem correção entre
 * slots. Preservar cada primeira resposta e só então abrir devolutiva.
 * Um acerto isolado sugere onde praticar; não marca domínio nem avalia
 * qualquer conteúdo das U2–U20. Sem cobertura, recomendar começar em U1.A1.
 */
export const ROTEIRO_DIAGNOSTICO_ENTRADA = [
  { alvo: 'B.U1.A1', gerador: 'diagnostico-agrupamento-n1', habilidade: 'contar grupos de 10 e unidades soltas' },
  { alvo: 'B.U1.A2', gerador: 'diagnostico-posicao-n2', habilidade: 'reconhecer o valor de uma posição com zero no número' },
  { alvo: 'B.U1.A3', gerador: 'diagnostico-numeros-grandes-n3', habilidade: 'escrever números das classes dos milhares e milhões' },
  { alvo: 'B.U1.A4', gerador: 'diagnostico-comparacao-n3', habilidade: 'comparar naturais pela primeira casa diferente' },
  { alvo: 'B.U1.A5', gerador: 'diagnostico-arredondamento-n3', habilidade: 'arredondar à dezena em um empate' },
] as const

export const GERADORES_U0: Gerador[] = [
  estudoMaterial, estudoApoio, estudoRetomada,
  diagnosticoAgrupamento, diagnosticoPosicao, diagnosticoNumerosGrandes,
  diagnosticoComparacao, diagnosticoArredondamento,
]
