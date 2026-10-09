import type { Aula, Visual } from '@/lib/formation/schema'

const mesa = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado, esboco })
const percurso = (etapa: string, esboco: string): Visual => ({
  modelo: 'livre',
  estado: { etapas: ['tentar', 'conferir', 'tentar de novo', 'revisar'], etapa },
  esboco,
})

export const aula: Aula = {
  id: 'B.U0.A1',
  titulo: 'Como esta formação funciona',
  objetivo: 'Organizar uma tentativa no papel ou no rascunho, pedir apoio sem copiar a resposta, escolher o ritmo e retomar com revisão.',
  modelo: 'livre',
  esboco: 'Proposta para a experiência: uma mesa adulta de estudo vira um percurso de quatro ações. Modelo livre porque organizar o estudo não é representar uma quantidade. O momento-chave é esconder uma resolução e oferecer uma tentativa nova: reconhecer uma resposta não é conseguir produzi-la. O caderno e o rascunho guardam a mesma tentativa; voz, ritmo e retorno são escolhas do aluno. “Já sei isso” deve levar à Sua vez para conferir a rotina, sem atribuir domínio matemático. As affordances descritas dependem do player; esta entrega é conteúdo e roteiro, não implementação de voz, rascunho ou revisão.',
  vega: 'Ideia central: estudar ativamente é tentar, conferir o raciocínio e tentar de novo sem olhar a resolução. Não julgue talento nem use “fácil”. Pergunte qual foi a tentativa e onde o aluno travou; a primeira dica aponta a ideia, a segunda ajuda no primeiro passo, a terceira mostra a resolução quando ele pedir. Se houve resolução, convide a tentar uma nova questão depois. Caderno quadriculado, lápis e borracha são recomendados; a falta de caderno não deve impedir o estudo: qualquer folha ou as notas do celular servem. Voz é opcional e desligada por padrão. Não imponha minutos, velocidade ou sequência sem pausa. “Já sei isso” leva direto à Sua vez; verifica decisões de estudo nesta aula, não proficiência matemática. A proposta de revisão espaçada em 1, 3, 7 e 21 dias segue o plano da formação e exige agendamento pela experiência; esta aula não agenda notificações. Os cenários são situações do dia a dia, sem dados externos.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você separou um tempo para estudar. Como usar esse tempo para aprender de verdade?',
      visual: mesa({ materiais: ['celular', 'caderno fechado', 'lápis', 'borracha'], tentativa: null }, 'Mesa vista de cima, com um intervalo livre no calendário e uma folha ainda vazia. A resolução fica fechada; nenhum selo de velocidade ou contagem regressiva.'),
      esboco: 'Começar com uma situação de tempo disponível, sem fixar duração. A pergunta fica ao lado da página vazia: o aluno prevê uma forma de estudar antes de receber a sequência.',
    },
    {
      tipo: 'mexa',
      texto: 'Primeiro você **tenta**. Depois **confere**.',
      visual: mesa({ fichas: ['conferir', 'tentar'], lugares: ['primeiro', 'depois'], ordem: [] }, 'Duas fichas móveis sobre a mesa, sem ordem sugerida. Cada encaixe move um lápis ou abre a aba da resolução, sem revelar uma conta.'),
      acao: {
        tipo: 'arrastar', instrucao: 'Coloque as fichas nessa ordem.', sucesso: { ordem: ['tentar', 'conferir'] },
        mostre: 'Mover tentar para o primeiro lugar, escrever um rascunho e só então abrir a aba conferir. Ainda não mostrar uma resposta matemática.',
      },
      descoberta: 'Uma tentativa própria dá algo para comparar com a resolução; olhar antes pode esconder a lacuna.',
      esboco: 'O arraste faz a folha ganhar um traço antes da resolução abrir. Oferecer escolha por toque como alternativa de acesso. A tarefa organiza o estudo, não mede matemática.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você leu uma resolução e entendeu tudo. Como saber se consegue resolver sozinho?',
      visual: percurso('conferir', 'Uma resolução aberta ocupa metade da mesa; a outra metade é uma folha vazia. O aluno escolhe antes de ver a resolução fechar.'),
      opcoes: [
        {
          texto: 'Tentar outra questão, sem olhar a resolução', certa: true,
          explica: 'Isso. Se você resolve sem olhar, você sabe. Achar a resposta conhecida não é saber.',
          mostra: percurso('tentar de novo', 'A resolução se fecha e uma folha nova recebe os passos da tentativa. Colocar lado a lado “vi a resposta” e “produzi os passos”, sem premiar rapidez.'),
        },
        {
          texto: 'Reler até a resposta parecer conhecida', erro: 'estudo-so-observar',
          explica: 'Reler deixa a resposta familiar, mas não testa nada. Feche a resolução e tente uma questão nova.',
          mostra: percurso('tentar de novo', 'A resposta conhecida é coberta e sobra a folha vazia; uma nova tentativa torna visível a diferença entre reconhecer e resolver.'),
        },
        {
          texto: 'Copiar a resposta e contar como acerto', erro: 'estudo-dica-resposta',
          explica: 'Copiar mostra o que você viu, não o que você sabe fazer.',
          mostra: mesa({ registros: ['copiei', 'resolvi sem olhar'], equivalentes: false }, 'Duas folhas têm rótulos distintos. A cópia permanece como estudo com apoio; só a folha sem resposta à vista serve para conferir o que foi recuperado.'),
        },
      ],
      esboco: 'Momento-chave: cobrir a resolução e abrir uma questão diferente da mesma ideia. A ausência de passos próprios vira uma pista útil, sem humilhar quem precisa retomar.',
    },
    {
      tipo: 'ideia',
      texto: 'Tente sozinho. Confira. Depois tente de novo, agora sem olhar a resolução.',
      visual: percurso('tentar de novo', 'As fichas ganham uma terceira estação: uma folha nova, após a conferência. A seta volta à ideia se a tentativa ainda não avançar.'),
      esboco: 'Dar nome à sequência que o aluno acabou de prever. Manter os objetos concretos no percurso: lápis, conferência e página nova.',
    },
    {
      tipo: 'ideia',
      texto: 'Tenha do lado um **caderno quadriculado**, lápis e borracha. Os quadradinhos ajudam a alinhar as contas.',
      visual: mesa({ materiais: ['caderno quadriculado', 'lápis', 'borracha'], colunasAlinhadas: true }, 'Abrir o caderno e alinhar três espaços verticais na quadricula. A borracha muda um traço específico, preservando o raciocínio já registrado.'),
      esboco: 'Apresentar cada material pela função que cumpre. A quadricula sustenta o alinhamento; a borracha não apaga o esforço inteiro.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada unidade começa numa página nova, com o título no alto. Ali você anota as definições e os exemplos.',
      visual: mesa({ pagina: { titulo: 'Comece aqui', blocos: ['definição', 'exemplo', 'cuidado'] } }, 'A página vira para uma folha nova. O título fica no topo, seguido de três espaços separados para o Anote; deixar margem para rascunhar.'),
      esboco: 'Mostrar uma organização que o aluno pode copiar, sem exigir caderno perfeito. O modelo se repete nas unidades seguintes.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Hoje você está sem o caderno. Dá para estudar mesmo assim?',
      visual: mesa({ papelDisponivel: false, materiais: ['lápis', 'celular'] }, 'O caderno se afasta; a superfície da tela mantém uma grade leve e um lápis digital. Não sugerir que o recurso já foi implementado: é o desenho proposto para o player.'),
      opcoes: [
        {
          texto: 'Sim. Escrevo numa folha qualquer ou nas notas do celular', certa: true,
          explica: 'Isso. O caderno ajuda, mas o importante é escrever sua tentativa em algum lugar.',
          mostra: mesa({ materiais: ['folha solta', 'celular'], tentativaRegistrada: true }, 'O mesmo traço antes visto no papel aparece no rascunho. Conservar a comparação com a resolução sem exigir transcrição no momento.'),
        },
        {
          texto: 'Não. Sem caderno, melhor deixar para outro dia', erro: 'estudo-sem-papel',
          explica: 'O caderno ajuda, mas não é obrigatório. Qualquer folha serve para escrever sua tentativa.',
          mostra: mesa({ materiais: ['caderno', 'folha solta', 'celular'], finalidade: 'registrar tentativa' }, 'Papel e tela ficam lado a lado, ambos com uma tentativa registrada. O aluno vê a função compartilhada dos dois suportes.'),
        },
      ],
      esboco: 'Evitar transformar os materiais recomendados numa barreira de entrada. Propor rascunho desenhável, com alternativa por teclado, e retorno ao caderno quando possível.',
    },
    {
      tipo: 'ideia',
      texto: 'Travou? A **Vega** dá dicas, uma de cada vez. Se quiser, ela também lê as aulas em voz alta.',
      visual: mesa({ dicas: ['ideia', 'primeiro passo', 'resolução'], vozLigada: false }, 'Três abas de dica, abertas apenas sob pedido. O controle de voz começa desligado; ligar áudio não abre dica nem entrega resposta.'),
      esboco: 'Separar a escolha de ouvir da escolha de pedir ajuda. A primeira aba orienta o olhar, a segunda inicia um passo, a terceira abre resolução; registrar apoio na prática.',
    },
    {
      tipo: 'anote',
      titulo: 'Estudo ativo',
      definicao: 'Estudo ativo é tentar sozinho, conferir e tentar de novo sem olhar a resolução.',
      exemplo: { tex: '\\text{tentar} \\longrightarrow \\text{conferir} \\longrightarrow \\text{tentar de novo}', fala: 'tentar, depois conferir, depois tentar de novo' },
      alerta: 'Entender a resolução lendo não quer dizer que você consegue resolver sozinho.',
      esboco: 'A página-modelo recebe os três blocos do Anote. Deixar a definição igual nas retomadas; o exemplo é uma sequência, sem usar igualdade entre ações.',
    },
    {
      tipo: 'passo',
      problema: 'Você travou num exercício. Já escreveu uma parte no caderno. E agora?',
      visual: mesa({ tentativaRegistrada: true, dicaAberta: null, resolucaoAberta: false }, 'Uma tentativa parcial permanece no caderno, com a linha onde houve dúvida. Vega aponta para essa linha, sem preencher o resultado.'),
      passos: [
        {
          pergunta: 'Como pedir ajuda?',
          opcoes: [
            {
              texto: 'Mostrar onde travei e pedir uma dica', certa: true,
              explica: 'Isso. A dica parte do que você já fez e destrava o próximo passo.',
              mostra: mesa({ tentativaRegistrada: true, apoio: 'pista' }, 'Destacar só a linha da dúvida e abrir a primeira aba de dica. A linha seguinte permanece vazia para a tentativa do aluno.'),
            },
            {
              texto: 'Abrir a resolução e copiar tudo', erro: 'estudo-dica-resposta',
              explica: 'Copiando, você não descobre onde travou. Com uma dica, o próximo passo continua sendo seu.',
              mostra: mesa({ comparacao: ['copiar tudo', 'pedir uma dica'] }, 'Cobrir a cópia completa e deixar a tentativa parcial com um espaço para o próximo passo. Mostrar que a pista orienta sem preencher todo o registro.'),
            },
          ],
          linha: { tex: '\\text{Onde travei} \\longrightarrow \\text{peço uma dica}', fala: 'mostro onde travei e peço uma dica' },
        },
        {
          pergunta: 'Você conferiu a resolução. Como saber se aprendeu?',
          opcoes: [
            {
              texto: 'Fechar a resolução e tentar outra questão', certa: true,
              explica: 'Isso. Se você resolve outra sem olhar, aprendeu.',
              mostra: percurso('tentar de novo', 'A aba da resolução se fecha e outra questão da mesma ideia entra numa página limpa. Preservar a tentativa anterior para comparar depois.'),
            },
            {
              texto: 'Reler a resolução e seguir em frente', erro: 'estudo-so-observar',
              explica: 'Reler não testa nada. Tente outra questão sem olhar.',
              mostra: percurso('tentar de novo', 'Uma folha só relida não tem passos próprios; uma folha nova convida a produzi-los. O contraste se faz pelo registro, sem ícone de fracasso.'),
            },
          ],
          linha: { tex: '\\text{Conferi} \\longrightarrow \\text{tento outra sem olhar}', fala: 'depois de conferir, tento outra sem olhar' },
        },
      ],
      esboco: 'Guiar decisões, sem ensinar matemática antes do diagnóstico. Cada escolha muda a folha e a aba de apoio para tornar sua consequência visível.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, escreva os 3 passos do estudo ativo. Depois digite aqui o primeiro.',
      resposta: 'tentar',
      resolucao: [
        { tex: '\\text{1. Tentar sozinho.}', fala: 'um: tentar sozinho' },
        { tex: '\\text{2. Conferir com a resolução.}', fala: 'dois: conferir com a resolução' },
        { tex: '\\text{3. Tentar de novo, sem olhar.}', fala: 'três: tentar de novo, sem olhar' },
      ],
      esboco: 'Pedir os três passos no papel; o primeiro, digitado, confere a ordem. A resolução numerada serve para comparar com o que o aluno escreveu.',
    },
    {
      tipo: 'ideia',
      texto: 'Você escolhe o ritmo. Pode sair quando quiser: a aula continua de onde parou.',
      visual: percurso('tentar', 'A tentativa permanece quando o percurso pausa. Ao voltar, a mesma linha ainda aparece; oferecer retornar à ideia sem retirar o que já foi feito.'),
      esboco: 'Propor preservação do estado no player. Não usar cronômetro, penalidade por pausa ou promessa de progresso salvo antes dessa integração existir.',
    },
    {
      tipo: 'ideia',
      texto: 'Já sabe o assunto de uma aula? No começo dela, toque em **Já sei isso** e vá direto aos exercícios.',
      visual: mesa({ atalho: 'Já sei isso', destino: 'Sua vez', dominioAutomatico: false }, 'Uma ligação encurta o caminho até a prática, preservando uma seta de retorno à explicação. O atalho não acende selo de domínio.'),
      esboco: 'Proposta de navegação: pular a exposição, fazer tentativas e voltar à ideia se precisar. Na orientação, os itens verificam a rotina de estudo; a matemática será verificada na U1.',
    },
    {
      tipo: 'ideia',
      texto: 'Para revisar, refaça uma questão antiga sem olhar. Só depois confira.',
      visual: percurso('revisar', 'Uma folha antiga volta fechada, sem resposta visível. Após a tentativa, abrir a conferência e desenhar um retorno à ideia quando necessário.'),
      esboco: 'Revisar pela recuperação, sem repetir só leitura. O agendamento futuro segue 1, 3, 7 e 21 dias; não exibir notificações ou calendário como recurso implementado.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['estudo-material-n1', 'estudo-apoio-n2', 'estudo-retomada-n3'],
      esboco: 'Nível 1 escolhe como registrar; nível 2 decide apoio, voz e atalho; nível 3 escolhe como retomar sem visual. Conferir decisões de estudo. Acertos aqui não devem marcar habilidades matemáticas como dominadas.',
    },
    {
      tipo: 'fecho',
      texto: 'É assim que se estuda aqui: tentar, conferir, tentar de novo. Agora, umas perguntas rápidas para ver por onde você começa.',
      visual: percurso('tentar', 'Retornar à mesa do gancho, agora com uma tentativa própria e um plano de retomada. Ao lado, cinco cartões da U1 ainda sem marcas de domínio.'),
      esboco: 'Responder à pergunta inicial pela rotina que ficou visível. Fazer a ponte para o diagnóstico sem apresentar os acertos de orientação como prova de capacidade matemática.',
    },
  ],
}
