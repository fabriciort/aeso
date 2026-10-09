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
      texto: 'Talvez você já saiba parte da unidade 1. Vamos descobrir por qual aula começar, sem repetir o que você já sabe.',
      visual: coleta({ alvos: ['Agrupar de 10 em 10', 'O zero que guarda o lugar', 'Números grandes', 'Comparar na reta numérica', 'Arredondar e estimar'], avaliados: [] }, 'Cinco cartões da U1, todos sem preenchimento. Ao fundo, o restante da formação fica fora da área avaliada, sem porcentagem de conclusão nem selo de domínio.'),
      esboco: 'Apresentar uma dúvida real de retomada. O painel delimita U1 e evita transformar o diagnóstico do piloto numa avaliação da Matemática Básica inteira.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Nas próximas perguntas, o que fazer quando você não souber?',
      visual: coleta({ registros: ['minha resposta', 'Não sei'], preenchidos: [] }, 'Duas folhas fechadas, antes e depois de ajuda. Nenhuma contém uma pergunta matemática ou resposta, para ensinar só o protocolo de coleta.'),
      opcoes: [
        {
          texto: 'Responder do meu jeito, ou tocar em “Não sei”', certa: true,
          explica: 'Isso. Assim aparece onde você está hoje. Errar aqui só ajuda a escolher a aula certa.',
          mostra: coleta({ primeiraResposta: 'própria', ajudaAntesDaResposta: false }, 'A primeira folha recebe um registro próprio ou “Não sei”. A folha de ajuda continua fechada até terminar a coleta.'),
        },
        {
          texto: 'Procurar a resposta antes de responder', erro: 'diagnostico-resposta-ajudada',
          explica: 'Aí o resultado mostra a resposta que você achou, não o que você sabe. Melhor tocar em “Não sei”.',
          mostra: coleta({ registros: ['o que eu sei', 'o que eu procurei'], mesmosDados: false }, 'As duas folhas permanecem separadas: a resolução não sobrescreve a primeira tentativa. Nenhum exemplo matemático é corrigido aqui.'),
        },
      ],
      esboco: 'Interagir antes da explicação, sobre honestidade da observação. O feedback explica a diferença entre registros e não ensina a responder nenhum dos cinco itens matemáticos.',
    },
    {
      tipo: 'ideia',
      texto: 'São 5 perguntas, sem dicas. Tocar em **Não sei** também ajuda.',
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
      texto: 'Essas perguntas mostram por onde começar a unidade 1. Elas não medem tudo o que você sabe.',
      visual: coleta({ escopo: 'U1', tipoDeResultado: 'indicação de retomada', dominioConcedido: false }, 'Os cinco alvos recebem estados “retomar” ou “confirmar na prática”, não “dominado”. O restante da Básica continua sem avaliação.'),
      esboco: 'Abrir somente depois da coleta completa. A devolutiva conserva respostas e apoios, e dá uma próxima ação concreta dentro da U1.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Imagine que você acertou as 5 perguntas. O que isso quer dizer?',
      visual: coleta({ amostra: 'U1', respostasCorretas: 5, quantidadeDeAlvos: 5, avaliaDemaisUnidades: false }, 'Exemplo de devolutiva, explicitamente uma amostra imaginada com cinco acertos. Deixar visível o contorno de U1 e as outras unidades sem preenchimento.'),
      opcoes: [
        {
          texto: 'Que posso começar pelos exercícios da unidade 1', certa: true,
          explica: 'Isso. Os acertos indicam um bom começo. Os exercícios confirmam.',
          mostra: coleta({ proximaAcao: 'prática da U1', dominioConcedido: false }, 'Os cinco cartões apontam à prática; nenhuma seta salta para operações, frações ou álgebra. Preservar a possibilidade de retornar a uma explicação.'),
        },
        {
          texto: 'Que já sei toda a Matemática Básica', erro: 'diagnostico-generaliza-dominio',
          explica: 'As perguntas foram só da unidade 1. Contas e frações, por exemplo, ainda nem apareceram.',
          mostra: coleta({ coberto: ['U1'], naoCoberto: ['operações', 'frações', 'álgebra'] }, 'Mostrar cinco perguntas pequenas dentro de U1 e áreas ainda vazias ao lado. O contraste é de cobertura, não de nota ou capacidade.'),
        },
      ],
      esboco: 'Desmontar a generalização a partir do que foi observado. O texto do exemplo não atribui esses cinco acertos ao aluno real.',
    },
    {
      tipo: 'anote',
      titulo: 'Diagnóstico de entrada',
      definicao: 'O diagnóstico de entrada são perguntas sem ajuda que mostram por onde começar.',
      exemplo: { tex: '\\text{Errei o valor do 3 em 305} \\longrightarrow \\text{começo pela aula 2}', fala: 'errei o valor do três em trezentos e cinco, então começo pela aula dois' },
      alerta: 'Não procure a resposta. O diagnóstico só ajuda se mostrar o que você sabe hoje.',
      esboco: 'Copiar após a coleta. Guardar uma anotação da próxima aula a retomar, não uma nota global. O exemplo é uma recomendação condicional, sem fingir que já existe roteamento automático.',
    },
    {
      tipo: 'passo',
      problema: 'Agora, um exemplo com calma. Em **305**, quanto vale o **3**?',
      visual: quadro(305, 'nenhuma', 'Agora, depois da coleta, revelar o quadro C, D, U com 305 e espaço para placas, barras e cubos. A resposta não aparece antes da escolha.'),
      passos: [
        {
          pergunta: 'Contando da direita: unidades, dezenas, centenas. Em que casa está o 3?',
          opcoes: [
            {
              texto: 'Centenas', certa: true,
              explica: 'Isso. O 3 está na terceira casa: a das centenas.',
              mostra: quadro(305, 'C', 'Acender U sob o 5, D sob o 0 e C sob o 3, nessa ordem. Depois mostrar três placas, sem mover os algarismos.'),
            },
            {
              texto: 'Unidades', erro: 'casa-errada',
              explica: 'Nas unidades, à direita, está o 5. O 3 está na terceira casa: centenas.',
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
              explica: '3 é o algarismo. Na casa das centenas, ele vale 3 grupos de 100: 300.',
              mostra: quadro(305, 'C', 'Mostrar três cubos ao lado das três placas. Os cubos representam 3 unidades, enquanto cada placa representa 100; destacar só as placas do 3 em 305.'),
            },
            {
              texto: '30', erro: 'casa-errada',
              explica: '30 seriam 3 dezenas. Aqui o 3 está nas centenas: vale 300.',
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
      instrucao: 'No papel, escreva **608** como soma de centenas, dezenas e unidades. Depois digite quanto vale o 6.',
      resposta: 600,
      resolucao: [
        { tex: '608 = 600 + 0 + 8', fala: 'seiscentos e oito é seiscentos mais zero mais oito' },
        { tex: '6 \\text{ centenas} = 600', fala: 'seis centenas são seiscentos' },
      ],
      esboco: 'Uma tentativa nova no caderno, ou no rascunho se estiver sem papel, depois da retomada guiada. Só abrir a decomposição após o envio. Registrar como prática posterior, sem sobrescrever a primeira resposta do diagnóstico.',
    },
    {
      tipo: 'ideia',
      texto: 'Onde você errou ou tocou em **Não sei**, vale ver a aula. Onde acertou, é só confirmar nos exercícios.',
      visual: coleta({ caminhos: ['ver a aula', 'confirmar nos exercícios'], acessoLivre: true }, 'Duas próximas ações com igual dignidade. Ambas mantêm uma passagem de volta ao mapa da U1; não usar cadeado ou caminho punitivo.'),
      esboco: 'Propor a primeira aula-alvo com lacuna como ponto inicial. Com cinco acertos, sugerir prática variada da U1 e checkpoint posterior. Não tratar uma resposta isolada como domínio; ausência de resposta é ausência de evidência.',
    },
    {
      tipo: 'fecho',
      texto: 'Pronto. Na unidade 1, comece pela primeira aula marcada **Ver a aula**. Acertou tudo? Vá direto aos exercícios.',
      visual: coleta({ escopo: 'U1', proximaAcao: 'retomar ou confirmar', promessaDeDominio: false }, 'Voltar aos cinco cartões do gancho. Destacar a próxima ação recomendada sem preencher as unidades seguintes; oferecer o mapa para quem quiser escolher outro ponto.'),
      esboco: 'Fechar a pergunta inicial com uma indicação provisória. A sugestão depende dos registros coletados pela experiência; se essa integração faltar, informar a limitação e oferecer começar por Agrupar de 10 em 10.',
    },
  ],
}
