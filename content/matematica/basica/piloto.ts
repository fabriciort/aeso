import type { Visual } from '@/lib/formation/schema'

/** Roteiros para a frente de experiência; não implementam um motor de avaliação. */
interface EsbocoCheckpoint {
  unidade: 'B.U0' | 'B.U1'
  objetivo: string
  blocos: { aula: string; geradores: string[]; observar: string }[]
  apresentacao: Visual
  esboco: string
  devolutiva: string
}

export const ESBOCOS_CHECKPOINTS: EsbocoCheckpoint[] = [
  {
    unidade: 'B.U0',
    objetivo: 'Escolher um jeito de estudar e compreender o alcance do diagnóstico, sem dar nota ao ritmo da pessoa.',
    blocos: [
      {
        aula: 'B.U0.A1',
        geradores: ['estudo-material-n1', 'estudo-apoio-n2', 'estudo-retomada-n3'],
        observar: 'A pessoa escolhe como registrar o raciocínio, pedir uma dica e retomar uma ideia sem depender da resposta pronta.',
      },
      {
        aula: 'B.U0.A2',
        geradores: ['diagnostico-agrupamento-n1', 'diagnostico-posicao-n2', 'diagnostico-numeros-grandes-n3', 'diagnostico-comparacao-n3', 'diagnostico-arredondamento-n3'],
        observar: 'Usar o roteiro de diagnóstico exportado pela U0, registrando a primeira resposta antes de qualquer dica ou correção.',
      },
    ],
    apresentacao: {
      modelo: 'livre',
      estado: { unidade: 0, etapas: ['escolha de estudo', 'amostra do piloto', 'próximo passo'], nota: null },
      esboco: 'Caderno e mapa de aulas são objetos de orientação, sem modelo matemático equivalente. Mostrar uma decisão por cartão, sem placar. O mapa só acende depois da coleta das cinco habilidades.',
      movimento: 'A escolha de apoio entra numa página do caderno; as respostas iniciais viram marcas discretas junto às cinco aulas do piloto.',
    },
    esboco: 'Misturar decisões de estudo com a amostra matemática somente se a pessoa ainda não fez o diagnóstico. Se já fez, reutilizar o registro sem sobrescrever primeiras respostas. Momento-chave: uma lacuna vira indicação de uma aula, sem rótulo de capacidade. Sem cronômetro. Voz e rascunho ficam disponíveis; dicas, resolução e feedback matemático só depois de encerrar os cinco registros. Na coleta, acolher pedido de ajuda com a opção Não sei; oferecer apoio e uma tentativa nova na retomada após a coleta.',
    devolutiva: 'Propor a primeira aula U1 cuja habilidade ainda precisa de observação independente. Oferecer começar do zero e escolher outra aula. Sem lacuna aparente, confirmar na prática da U1 antes de recomendar U2; a amostra não avalia U2 nem certifica domínio da Básica. A orientação de estudo não bloqueia o mapa.',
  },
  {
    unidade: 'B.U1',
    objetivo: 'Verificar as cinco habilidades em itens novos e misturados, distinguindo resolução independente de resolução apoiada.',
    blocos: [
      { aula: 'B.U1.A1', geradores: ['agrupamento-n3'], observar: 'Conta grupos de dez, cem ou mil sem perder as sobras e conserva a quantidade na troca.' },
      { aula: 'B.U1.A2', geradores: ['valor-posicional-sozinho', 'palavras-para-numero', 'leitura-com-zero'], observar: 'Localiza o valor de uma casa e mantém os zeros na escrita e na leitura.' },
      { aula: 'B.U1.A3', geradores: ['numeros-grandes-n3', 'numeros-grandes-n2'], observar: 'Interpreta as classes de mil, milhão e bilhão; incluir também a variante de separador de milhar em inglês do nível 2, com quadro recolhido.' },
      { aula: 'B.U1.A4', geradores: ['comparar-n3'], observar: 'Compara pelo tamanho e pela primeira casa diferente; explica pela posição na reta.' },
      { aula: 'B.U1.A5', geradores: ['arredondar-n3'], observar: 'Escolhe a referência mais próxima, resolve o empate e usa aproximação para conferir plausibilidade.' },
    ],
    apresentacao: {
      modelo: 'reta',
      estado: { unidade: 1, tentativas: [], apoioInicial: false, marcas: [] },
      esboco: 'Inicialmente só enunciado e campo de resposta. A reta fica recolhida; após a tentativa, pode se abrir junto ao quadro ou aos blocos da habilidade. Alternar as cinco famílias sem cabeçalho que revele a estratégia.',
      movimento: 'Após responder, o rascunho permanece; o modelo adequado aparece para explicar a escolha. Na questão seguinte, recolher esse apoio.',
    },
    esboco: 'Uma rodada começa com um item novo de cada habilidade, em ordem sorteada pelo rng. Nunca sortear uma única família e chamar isso de checkpoint misto. Em A2, alternar valor de casa, escrita e leitura entre rodadas. Em A3, incluir classes vazias, bilhões e a variante de separador do nível 2: selecionar essa variante por seu formato escolha, não confundir um novo item de classes com cobertura de separadores. Recolher os quadros de nível 2 nas tentativas independentes. Repetir com novos números onde falta evidência e retomar demais habilidades. Perguntar como conferiu antes da resolução; não depender só da cor para marcar acertos.',
    devolutiva: 'Proposta inicial: observar três acertos independentes e variados por habilidade, incluindo casos com zero, sobras e empate. Ajustar após o piloto com pessoas reais. Resposta apoiada serve à aprendizagem, não soma à evidência independente. Recomendar a aula da dificuldade com seu erro comum e permitir seguir; nenhuma unidade bloqueada. Checkpoint não é exame oficial.',
  },
]

export const ESBOCO_REVISAO_PILOTO = {
  diasDepois: [1, 3, 7, 21],
  geradores: ['agrupamento-n3', 'valor-posicional-sozinho', 'numeros-grandes-n3', 'comparar-n3', 'arredondar-n3'],
  esboco: 'Proposta para o player: trazer itens novos com sementes novas, misturando uma habilidade recente e uma antiga. Pedir a primeira tentativa sem visual, depois permitir modelo, rascunho e dicas. Retomar a explicação do erro observado; não reutilizar a mesma resposta memorizada. O calendário, a persistência e a seleção adaptativa ainda pertencem à frente de experiência.',
}
