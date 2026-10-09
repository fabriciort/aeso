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
    enunciado: 'Exemplo imaginado: você tem papel e vai estudar. Qual material ajuda a registrar e alinhar tentativas?',
    opcoes: [
      { texto: 'Caderno quadriculado, lápis e borracha' },
      { texto: 'Só a tela; observar basta para aprender', erro: 'estudo-so-observar' },
      { texto: 'Só o gabarito; copiar substitui tentar', erro: 'estudo-dica-resposta' },
    ],
    dicas: ['Registre seu raciocínio para poder conferir depois.', 'Procure o material que permite escrever, alinhar e corrigir.', 'Caderno quadriculado, lápis e borracha ajudam a registrar e alinhar tentativas.'],
    cena: 'mesa-com-papel',
  },
  {
    enunciado: 'Exemplo imaginado: você está sem papel agora. Como continuar registrando suas tentativas?',
    opcoes: [
      { texto: 'Usar o rascunho na tela e conferir a tentativa' },
      { texto: 'Esperar ter papel; sem ele não se aprende', erro: 'estudo-sem-papel' },
      { texto: 'Só assistir às respostas, sem tentar', erro: 'estudo-so-observar' },
    ],
    dicas: ['O que importa é tentar e guardar seu raciocínio.', 'Procure um jeito de escrever na tela.', 'Use o rascunho na tela, registre uma tentativa e depois confira.'],
    cena: 'mesa-sem-papel',
  },
]

const APOIO: readonly Situacao[] = [
  {
    enunciado: 'Exemplo imaginado: você travou num exercício de prática. Como pedir uma dica sem pular sua tentativa?',
    opcoes: [
      { texto: 'Pedir uma pista, tentar um passo e só depois conferir' },
      { texto: 'Abrir a resolução e copiar a resposta', erro: 'estudo-dica-resposta' },
      { texto: 'Só assistir ao exemplo, sem fazer uma tentativa', erro: 'estudo-so-observar' },
    ],
    dicas: ['A dica deve ajudar você a dar o próximo passo.', 'Comece pela pista sobre a ideia; registre o que conseguiu.', 'Peça uma pista, tente um passo e depois confira seu raciocínio.'],
    cena: 'pratica-com-dica',
  },
  {
    enunciado: 'Exemplo imaginado: você prefere estudar em silêncio. O que fazer com a voz da Vega?',
    opcoes: [
      { texto: 'Deixar a voz desligada e usar texto e visuais' },
      { texto: 'Ligar a voz: ouvir é obrigatório', erro: 'estudo-voz-obrigatoria' },
      { texto: 'Só ouvir a resolução, sem tentar', erro: 'estudo-so-observar' },
    ],
    dicas: ['O áudio é uma opção de acesso, não uma exigência.', 'Procure a escolha que respeita sua preferência.', 'Deixe a voz desligada; as tarefas continuam disponíveis em texto e nos visuais.'],
    cena: 'voz-opcional',
  },
  {
    enunciado: 'Exemplo imaginado: você já conhece a ideia da aula. O que deve acontecer ao escolher “Já sei isso”?',
    opcoes: [
      { texto: 'Ir à Sua vez e tentar sem ajuda' },
      { texto: 'Marcar domínio sem resolver nada', erro: 'estudo-pula-sem-tentar' },
      { texto: 'Só reler a definição e seguir', erro: 'estudo-so-observar' },
    ],
    dicas: ['Conhecer uma ideia precisa ser conferido numa tentativa.', 'O atalho leva à prática da mesma aula.', '“Já sei isso” leva à Sua vez; a tentativa sem ajuda verifica o que você sabe.'],
    cena: 'atalho-para-pratica',
  },
]

const RETOMADA: readonly Situacao[] = [
  {
    enunciado: 'Exemplo imaginado: você voltou após uma pausa. Como retomar e verificar o que lembra?',
    opcoes: [
      { texto: 'Tentar uma questão antiga sem olhar e conferir depois' },
      { texto: 'Só reler as respostas: reconhecer é saber resolver', erro: 'estudo-so-observar' },
      { texto: 'Pular toda questão antiga porque já terminou a aula', erro: 'estudo-sem-revisao' },
    ],
    dicas: ['Lembrar aparece quando você tenta sem a resposta à vista.', 'Escolha uma questão anterior e registre uma tentativa.', 'Tente uma questão antiga sem olhar; confira depois e retome a ideia se precisar.'],
    cena: 'retomar-depois-da-pausa',
  },
  {
    enunciado: 'Exemplo imaginado: você viu uma correção e ela fez sentido. Como verificar que consegue sozinho?',
    opcoes: [
      { texto: 'Fechar a resolução e tentar outra questão da mesma ideia' },
      { texto: 'Copiar a correção como se fosse uma tentativa própria', erro: 'estudo-dica-resposta' },
      { texto: 'Nunca voltar à ideia: a correção já encerrou o assunto', erro: 'estudo-sem-revisao' },
    ],
    dicas: ['Entender a correção é um começo; resolver exige tentar.', 'Tire a resolução da vista e busque uma nova questão.', 'Feche a resolução e tente outra questão da mesma ideia, sem ajuda.'],
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
      enunciado: `Exemplo imaginado: há ${grupos} pacotes com 10 parafusos cada e ${soltos} soltos. Quantos parafusos há ao todo?`,
      formato: 'numero',
      resposta: grupos * 10 + soltos,
      erros: { [String(grupos + soltos)]: 'conta-grupos-como-unidades', [String(grupos * 10)]: 'descarta-sobra' },
      dicas: ['Cada pacote reúne 10 parafusos; os soltos também contam.', `Conte ${grupos} grupos de 10 e depois acrescente ${soltos} soltos.`, `${grupos} grupos de 10 e ${soltos} soltos: ${grupos * 10 + soltos} parafusos.`],
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
    return {
      enunciado: `Em ${numero}, quanto vale o algarismo ${centena} da esquerda?`,
      formato: 'numero', resposta: centena * 100,
      erros: { [String(centena)]: 'valor-de-face', [String(centena * 10)]: 'casa-errada' },
      dicas: ['O valor de um algarismo depende da casa em que ele está.', 'Conte as casas da direita: unidades, dezenas, centenas.', `O ${centena} da esquerda está nas centenas e vale ${centena * 100}.`],
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
      enunciado: `Exemplo imaginado: um arquivo contém ${milhoes} milhões e ${milhares} mil registros. Escreva o total com algarismos.`,
      formato: 'numero', resposta: total,
      erros: { [String(milhoes * 1_000 + milhares)]: 'classe-errada', [String(milhoes * 1_000_000_000 + milhares * 1_000)]: 'classe-errada' },
      dicas: ['Mil e milhão são classes diferentes: cada milhão reúne 1.000 milhares.', `Separe ${milhoes} milhões e ${milhares} mil em grupos de três algarismos.`, `${milhoes} milhões e ${milhares} mil registros correspondem a ${numeroPtBr(total)} registros.`],
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
      enunciado: `Exemplo imaginado: duas lojas têm ${numeros[0]} e ${numeros[1]} peças em estoque. Qual quantidade é maior?`,
      formato: 'numero', resposta: maior,
      erros: { [String(menor)]: 'compara-pela-ultima-casa' },
      dicas: ['Compare as casas de maior valor primeiro.', 'Os números têm três algarismos; comece pelas centenas.', `${maior} tem mais centenas que ${menor}; portanto, ${maior} é a maior quantidade.`],
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
      enunciado: `Exemplo imaginado: um orçamento é de R$ ${numero}. Arredonde à dezena mais próxima; no meio, escolha a maior.`,
      formato: 'numero', resposta: superior,
      erros: { [String(inferior)]: 'empate-para-baixo' },
      dicas: ['Arredondar troca o valor pelo múltiplo de 10 mais próximo.', `As dezenas vizinhas são ${inferior} e ${superior}; ${numero} está no meio.`, `Como há empate, usamos a maior dezena: R$ ${superior}.`],
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
