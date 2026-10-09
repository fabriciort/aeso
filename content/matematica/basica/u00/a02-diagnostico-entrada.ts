import type { Aula, Visual } from '@/lib/formation/schema'

const coleta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado, esboco })
const quadro = (numero: number, destaque: string, esboco: string): Visual => ({
  modelo: 'quadro-posicional', estado: { numero, casas: ['C', 'D', 'U'], destaque }, esboco,
})

export const aula: Aula = {
  id: 'B.U0.A2',
  titulo: 'Diagnóstico de entrada',
  objetivo: 'Registrar primeiras respostas sem apoio a uma amostra das cinco aulas da U1 e escolher uma retomada sem confundir indicação inicial com domínio.',
  modelo: 'livre',
  esboco: 'Proposta de integração, sem motor adaptativo implementado: primeiro apresentar o protocolo; depois coletar os cinco slots de ROTEIRO_DIAGNOSTICO_ENTRADA, em estudo-diagnostico.ts, sem dicas, correções ou animações resolvidas entre eles. Aceitar “Não sei”, preservar cada primeira resposta e só abrir a devolutiva após encerrar a coleta. O momento-chave é comparar “resposta própria” com “resposta depois de ajuda”: as duas são úteis, mas informam coisas diferentes. Modelo livre para painel de coleta e recomendação; quadro-posicional só na retomada após a coleta. O tipo SuaVez não distingue avaliação de prática e Item não tem resposta “Não sei”; a experiência deve integrar esse fluxo antes de apresentar a aula como diagnóstico. Não tratar a sequência comum de prática como avaliação validada. Os cartões Anote, Passo e Caderno ficam depois da coleta, para não ensinar o conteúdo antes de observar a primeira resposta.',
  vega: 'Escopo honesto: apenas uma amostra de agrupamento, valor posicional, números grandes, comparação e arredondamento da U1. Não avalia operações, frações, álgebra nem as demais unidades da Básica. Acolha “Não sei” e permita voltar depois, sem cronômetro. No bloco Sua vez, não ofereça dicas, Me mostre, explicações das respostas nem pistas pelo destaque do visual; mesmo após uma primeira resposta, espere concluir todos os slots antes da devolutiva, pois explicar um item pode ensinar outro. As três dicas existem nos geradores por contrato e só servem para retomada após a coleta. Preserve a primeira resposta mesmo se o aluno revisar depois. Recomende retomar a primeira aula-alvo com erro ou “Não sei”, sem afirmar que todas as anteriores estão dominadas. Se não houver lacuna aparente, proponha a prática da U1 para confirmar; nunca libere domínio ou conclusão da Básica por uma amostra. A implementação adaptativa, a persistência de respostas, a separação coleta/devolutiva e a opção “Não sei” não estão no contrato atual e precisam da frente de experiência. Os exemplos são imaginados; não há valores profissionais ou dados oficiais.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Exemplo imaginado: você quer retomar matemática. Por qual aula da U1 começar, sem repetir tudo nem pular uma lacuna?',
      visual: coleta({ alvos: ['agrupamento', 'posição', 'números grandes', 'comparação', 'arredondamento'], avaliados: [] }, 'Cinco cartões da U1, todos sem preenchimento. Ao fundo, o restante da formação fica fora da área avaliada, sem porcentagem de conclusão nem selo de domínio.'),
      esboco: 'Apresentar uma dúvida real de retomada. O painel delimita U1 e evita transformar o diagnóstico do piloto numa avaliação da Matemática Básica inteira.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Para descobrir o que você consegue agora, qual resposta deve ficar registrada primeiro?',
      visual: coleta({ registros: ['antes de ajuda', 'depois de ajuda'], preenchidos: [] }, 'Duas folhas fechadas, antes e depois de ajuda. Nenhuma contém uma pergunta matemática ou resposta, para ensinar só o protocolo de coleta.'),
      opcoes: [
        {
          texto: 'Minha tentativa sem dica; se não souber, “Não sei”', certa: true,
          explica: 'Essa resposta mostra o ponto de partida; o estudo com ajuda vem depois.',
          mostra: coleta({ primeiraResposta: 'própria', ajudaAntesDaResposta: false }, 'A primeira folha recebe um registro próprio ou “Não sei”. A folha de ajuda continua fechada até terminar a coleta.'),
        },
        {
          texto: 'A resposta copiada depois de abrir a resolução', erro: 'diagnostico-resposta-ajudada',
          explica: 'Uma resposta após ajuda mostra aprendizagem com apoio, mas não mostra seu ponto de partida.',
          mostra: coleta({ registros: ['primeira tentativa', 'tentativa com apoio'], mesmosDados: false }, 'As duas folhas permanecem separadas: a resolução não sobrescreve a primeira tentativa. Nenhum exemplo matemático é corrigido aqui.'),
        },
      ],
      esboco: 'Interagir antes da explicação, sobre honestidade da observação. O feedback explica a diferença entre registros e não ensina a responder nenhum dos cinco itens matemáticos.',
    },
    {
      tipo: 'ideia',
      texto: 'Tente sem dica; “Não sei” também ajuda a escolher o que retomar.',
      visual: coleta({ respostaPendente: true, naoSeiDisponivel: true, dicasAntesDaColeta: false }, 'Uma área de resposta e a opção “Não sei” têm igual legibilidade. Não realçar alternativa correta, resultado ou casas matemáticas no painel de coleta.'),
      esboco: 'Explicar o protocolo em uma frase. Propor envio e pausa sem penalidade, com estados acessíveis por teclado. “Não sei” é uma integração requerida, não um valor correto em Item.',
    },
    {
      tipo: 'sua-vez',
      geradores: [
        'diagnostico-agrupamento-n1',
        'diagnostico-posicao-n2',
        'diagnostico-numeros-grandes-n3',
        'diagnostico-comparacao-n3',
        'diagnostico-arredondamento-n3',
      ],
      esboco: 'BLOCO DE COLETA, distinto da prática: gerar uma primeira questão por slot do roteiro, sem adaptação baseada em acerto. Registrar resposta própria ou “Não sei”, com nenhum feedback de correção entre slots. Nível 1: contar pacotes de 10 e soltos, visual não resolvido. Nível 2: valor de uma posição com zero, só número visível. Nível 3: escrever milhões e milhares, comparar estoques e arredondar orçamento, todos sem visual. Só após cinco registros liberar os cartões seguintes e as dicas. O contrato não implementa essa separação; o player deve tratar esse bloco de forma específica para que a avaliação seja válida.',
    },
    {
      tipo: 'ideia',
      texto: 'Esta amostra indica uma retomada na U1; ela não mede toda a Matemática Básica.',
      visual: coleta({ escopo: 'U1', tipoDeResultado: 'indicação de retomada', dominioConcedido: false }, 'Os cinco alvos recebem estados “retomar” ou “confirmar na prática”, não “dominado”. O restante da Básica continua sem avaliação.'),
      esboco: 'Abrir somente depois da coleta completa. A devolutiva conserva respostas e apoios, e dá uma próxima ação concreta dentro da U1.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você acertou esta amostra da U1. O que podemos concluir?',
      visual: coleta({ amostra: 'U1', respostasCorretas: 5, quantidadeDeAlvos: 5, avaliaDemaisUnidades: false }, 'Exemplo de devolutiva, explicitamente uma amostra imaginada com cinco acertos. Deixar visível o contorno de U1 e as outras unidades sem preenchimento.'),
      opcoes: [
        {
          texto: 'Posso confirmar essas ideias na prática da U1', certa: true,
          explica: 'Os acertos sugerem um bom ponto de partida; exercícios variados, sem ajuda, precisam confirmar.',
          mostra: coleta({ proximaAcao: 'prática da U1', dominioConcedido: false }, 'Os cinco cartões apontam à prática; nenhuma seta salta para operações, frações ou álgebra. Preservar a possibilidade de retornar a uma explicação.'),
        },
        {
          texto: 'Já domino todas as unidades da Matemática Básica', erro: 'diagnostico-generaliza-dominio',
          explica: 'Não vimos frações, operações ou álgebra: uma amostra da U1 não avalia o restante da formação.',
          mostra: coleta({ coberto: ['U1'], naoCoberto: ['operações', 'frações', 'álgebra'] }, 'Mostrar cinco perguntas pequenas dentro de U1 e áreas ainda vazias ao lado. O contraste é de cobertura, não de nota ou capacidade.'),
        },
      ],
      esboco: 'Desmontar a generalização a partir do que foi observado. O texto do exemplo não atribui esses cinco acertos ao aluno real.',
    },
    {
      tipo: 'anote',
      titulo: 'Diagnóstico de entrada',
      definicao: 'O diagnóstico de entrada usa respostas sem ajuda para indicar o que retomar; não prova domínio de toda a formação.',
      exemplo: { tex: '\\text{Dúvida no valor de uma posição} \\longrightarrow \\text{retomar U1, aula 2}', fala: 'dúvida no valor de uma posição indica retomar a aula dois da unidade um' },
      alerta: 'Não troque sua primeira tentativa por uma resposta que você viu depois.',
      esboco: 'Copiar após a coleta. Guardar uma anotação da próxima aula a retomar, não uma nota global. O exemplo é uma recomendação condicional, sem fingir que já existe roteamento automático.',
    },
    {
      tipo: 'passo',
      problema: 'Retomada após o diagnóstico: no número 305, quanto vale o 3?',
      visual: quadro(305, 'nenhuma', 'Agora, depois da coleta, revelar o quadro C, D, U com 305 e espaço para placas, barras e cubos. A resposta não aparece antes da escolha.'),
      passos: [
        {
          pergunta: 'Da direita para a esquerda, em qual casa está o 3?',
          opcoes: [
            {
              texto: 'Centenas', certa: true,
              explica: 'As casas são unidades, dezenas, centenas; o 3 está na terceira.',
              mostra: quadro(305, 'C', 'Acender U sob o 5, D sob o 0 e C sob o 3, nessa ordem. Depois mostrar três placas, sem mover os algarismos.'),
            },
            {
              texto: 'Unidades', erro: 'casa-errada',
              explica: 'As unidades ficam à direita, sob o 5; o 3 ocupa a casa das centenas.',
              mostra: quadro(305, 'U e C', 'Conectar o 5 à primeira casa da direita e o 3 à terceira, com rótulos fixos. Contrapor três cubos a três placas para mostrar a diferença.'),
            },
          ],
          linha: { tex: '3 \\text{ está na casa das centenas}', fala: 'três está na casa das centenas' },
        },
        {
          pergunta: 'Quanto valem 3 centenas?',
          opcoes: [
            {
              texto: '300', certa: true,
              explica: 'São 3 grupos de 100: 300.',
              mostra: quadro(305, 'C', 'As três placas recebem o rótulo 100 cada; reunir seus valores sob a centena e registrar 300, sem incluir os cinco cubos no valor do 3.'),
            },
            {
              texto: '3', erro: 'valor-de-face',
              explica: '3 é o algarismo; nesta casa ele representa 3 grupos de 100, ou 300.',
              mostra: quadro(305, 'C', 'Mostrar três cubos ao lado das três placas. Os cubos representam 3 unidades, enquanto cada placa representa 100; destacar só as placas do 3 em 305.'),
            },
            {
              texto: '30', erro: 'casa-errada',
              explica: '30 seriam 3 dezenas; aqui o 3 está uma casa à esquerda, nas centenas.',
              mostra: quadro(305, 'C e D', 'Três barras ficam sob uma coluna D separada, como contraexemplo 35; as três placas permanecem sob C em 305. Não deslocar o 0 do número original.'),
            },
          ],
          linha: { tex: '3 \\text{ centenas} = 300', fala: 'três centenas são trezentos' },
        },
      ],
      esboco: 'Este exemplo é estudo com apoio após encerrar todas as primeiras respostas; não altera o resultado coletado nem substitui a aula completa da U1. Propor a retomada da aula-alvo, mantendo outros caminhos acessíveis.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Depois da coleta, escreva 608 como soma das casas. Digite quanto vale o 6 e compare seus passos.',
      resposta: 600,
      resolucao: [
        { tex: '608 = 600 + 0 + 8', fala: 'seiscentos e oito é seiscentos mais zero mais oito' },
        { tex: '6 \\text{ centenas} = 600', fala: 'seis centenas são seiscentos' },
      ],
      esboco: 'Uma tentativa nova no caderno, ou no rascunho se estiver sem papel, depois da retomada guiada. Só abrir a decomposição após o envio. Registrar como prática posterior, sem sobrescrever a primeira resposta do diagnóstico.',
    },
    {
      tipo: 'ideia',
      texto: 'Erro ou “Não sei” indica onde retomar; acertar uma questão indica o que confirmar na prática.',
      visual: coleta({ caminhos: ['retomar a ideia', 'confirmar na prática'], acessoLivre: true }, 'Duas próximas ações com igual dignidade. Ambas mantêm uma passagem de volta ao mapa da U1; não usar cadeado ou caminho punitivo.'),
      esboco: 'Propor a primeira aula-alvo com lacuna como ponto inicial. Com cinco acertos, sugerir prática variada da U1 e checkpoint posterior. Não tratar uma resposta isolada como domínio; ausência de resposta é ausência de evidência.',
    },
    {
      tipo: 'fecho',
      texto: 'Seu ponto de partida é uma próxima tentativa na U1: retome a ideia ou confirme na prática, no seu ritmo.',
      visual: coleta({ escopo: 'U1', proximaAcao: 'retomar ou confirmar', promessaDeDominio: false }, 'Voltar aos cinco cartões do gancho. Destacar a próxima ação recomendada sem preencher as unidades seguintes; oferecer o mapa para quem quiser escolher outro ponto.'),
      esboco: 'Fechar a pergunta inicial com uma indicação provisória. A sugestão depende dos registros coletados pela experiência; se essa integração faltar, informar a limitação e oferecer começar por Agrupar de 10 em 10.',
    },
  ],
}
