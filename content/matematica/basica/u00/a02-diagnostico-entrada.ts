import type { Aula, Visual } from '@/lib/formation/schema'

const coleta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado, esboco })

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
      texto: 'Talvez você já saiba parte da unidade 1. São 5 perguntas rápidas, sem dicas, para ver por qual aula começar.',
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
      tipo: 'anote',
      titulo: 'Diagnóstico de entrada',
      definicao: 'O diagnóstico de entrada são perguntas sem ajuda que mostram por onde começar.',
      exemplo: { tex: '\\text{Errei o valor do 3 em 305} \\longrightarrow \\text{começo pela aula 2}', fala: 'errei o valor do três em trezentos e cinco, então começo pela aula dois' },
      alerta: 'Não procure a resposta. O diagnóstico só ajuda se mostrar o que você sabe hoje.',
      esboco: 'Copiar após a coleta. Guardar uma anotação da próxima aula a retomar, não uma nota global. O exemplo é uma recomendação condicional, sem fingir que já existe roteamento automático.',
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
      tipo: 'fecho',
      texto: 'Pronto. Onde você errou ou tocou em **Não sei**, vale ver a aula. Onde acertou, vá direto aos exercícios.',
      visual: coleta({ caminhos: ['ver a aula', 'ir aos exercícios'], escopo: 'U1' }, 'Voltar aos cinco cartões do gancho. Destacar a próxima ação recomendada sem preencher as unidades seguintes; oferecer o mapa para quem quiser escolher outro ponto.'),
      esboco: 'Fechar a pergunta inicial com uma indicação provisória. A sugestão depende dos registros coletados pela experiência; se essa integração faltar, informar a limitação e oferecer começar por Agrupar de 10 em 10.',
    },
  ],
}
