import type { Aula, Visual } from '@/lib/formation/schema'

const quadro = (numero: number, esboco: string, movimento?: string): Visual => ({
  modelo: 'quadro-posicional',
  estado: { numero, casas: numero >= 1000 ? ['M', 'C', 'D', 'U'] : ['C', 'D', 'U'] },
  esboco,
  movimento,
})

export const aula: Aula = {
  id: 'B.U1.A2',
  titulo: 'O zero que guarda o lugar',
  objetivo: 'Ler, escrever e decompor naturais com casas vazias, distinguindo o algarismo do valor da sua posição.',
  modelo: 'quadro-posicional',
  vega: 'Ideia central: o valor de um algarismo depende da casa; o zero registra uma casa vazia, sem criar blocos. Retome as trocas de dez da A1. Erros: valor de face, casa errada, omitir zero e colar parcelas ditadas. Em 1.005, diferencie cinco unidades de cinco dezenas. Pergunte onde ficam os blocos, depois quantos são. Não diga que todo zero pode desaparecer: só zeros à esquerda não mudam o natural. Em Sua vez, ofereça uma dica por pedido; a terceira é a resolução para comparação, não evidência de domínio. Preços são exemplos imaginados, sem cotação real. Retome o conceito na A3 e na revisão de 1, 3, 7 e 21 dias; agendamento depende do player.',
  esboco: 'Etiquetas viram quadro C | D | U; as trocas de blocos da A1 dão sentido às casas. Momento-chave: retirar o zero de 305 leva o 3 a D e substitui três placas por três barras; é outra quantidade, não uma troca equivalente. Devolver o zero restaura as placas. Depois ampliar à esquerda para M. Com movimento reduzido, mostrar estados antes e depois.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma peça custa **R$ 305**; outra, **R$ 35**. A diferença é só um zero. Por que o preço muda tanto?',
      fala: 'Uma peça custa trezentos e cinco reais; outra, trinta e cinco reais. A diferença é só um zero. Por que o preço muda tanto?',
      visual: {
        modelo: 'quadro-posicional',
        estado: { numeros: [305, 35], contexto: 'preços imaginados', casas: ['C', 'D', 'U'], blocosVisiveis: false },
        esboco: 'Etiquetas sobre dois quadros alinhados pela direita, ainda sem blocos. Manter o espaço vazio à esquerda de 35.',
      },
      esboco: 'Pedir uma previsão antes da decomposição. As etiquetas continuam pequenas no topo do palco.',
    },
    {
      tipo: 'mexa',
      texto: 'Monte **305** nas casas.',
      visual: {
        modelo: 'quadro-posicional',
        estado: { casas: ['C', 'D', 'U'], algarismos: [3, 0, 5], numero: null },
        movimento: 'As etiquetas viram cartões; cada encaixe faz aparecer placas, barras ou cubos sob a casa.',
        esboco: 'C | D | U sobre três faixas. O zero mantém a faixa vazia. Selecionar peça e casa é alternativa ao arrasto.',
      },
      acao: {
        tipo: 'arrastar',
        instrucao: 'Ponha o 3 nas centenas, o 0 nas dezenas e o 5 nas unidades.',
        sucesso: { numero: 305 },
        mostre: 'Encaixar as peças uma por vez: 3 placas, nenhuma barra e 5 cubos. Permitir montar 350 e depois voltar a 305.',
      },
      descoberta: 'A quantidade muda com a casa, mesmo com as mesmas peças; o zero registra a ausência de dezenas.',
      esboco: 'A troca entre 0 e 5 produz 350 ao vivo. Destacar que são quantidades diferentes; não representar a mudança como troca que preserva o total.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E se você tirar o zero de **305**? Continua o mesmo número?',
      visual: quadro(305, 'Zero com alça de remoção; manter no quadro até a aposta.'),
      opcoes: [
        {
          texto: 'Sim, porque o zero não tem blocos', erro: 'esquece-zero',
          explica: 'Sem o zero, o 3 escorrega para as dezenas: 3 barras e 5 cubos. Vira **35**.',
          mostra: quadro(35, 'Comparar 305 e 35, mantendo uma sombra das placas originais.', 'O zero sai; o 3 desliza para D e as placas dão lugar a barras.'),
        },
        {
          texto: 'Não, vira 35', certa: true,
          explica: 'Isso. O zero segura o 3 nas centenas. Sem ele, o 3 vale só 30.',
          mostra: quadro(35, 'Seta de C para D e três barras; devolver o zero restaura as três placas.'),
        },
      ],
      esboco: 'Desmontar a ideia de que ausência de blocos significa ausência de posição; conservar o antes ao lado do depois.',
    },
    {
      tipo: 'ideia',
      texto: 'O mesmo **3** vale 300 nas centenas e 30 nas dezenas.',
      visual: {
        modelo: 'quadro-posicional', estado: { numeros: [305, 35], casas: ['C', 'D', 'U'], destaque: 3 },
        movimento: 'Restaurar 305 no quadro esquerdo; ligar cada 3 aos seus blocos sem mover o 5.',
        esboco: 'Quadros alinhados por U. O valor de cada 3 nasce dos blocos que o aluno manipulou.',
      },
      esboco: 'Nomear o padrão observado sem exigir uma regra de multiplicação ainda não estudada.',
    },
    {
      tipo: 'anote', titulo: 'Valor posicional',
      definicao: 'O valor de um algarismo depende da casa em que ele está.',
      exemplo: { tex: '305 = 300 + 0 + 5', fala: 'trezentos e cinco é trezentos mais zero mais cinco' },
      alerta: 'O zero guarda uma casa vazia: sem ele, 305 vira 35.',
      esboco: 'Copiar título, definição, soma das casas e alerta. O quadro continua pequeno ao lado do caderno.',
    },
    {
      tipo: 'aposta', pergunta: 'Como escrever **seiscentos e nove** com algarismos?',
      visual: {
        modelo: 'quadro-posicional', estado: { casas: ['C', 'D', 'U'], numero: null, ditado: 'seiscentos e nove' },
        esboco: 'Quadro vazio e áudio opcional. Não mostrar os blocos da resposta antes da escolha.',
      },
      opcoes: [
        { texto: '6009', erro: 'concatena-casas', explica: '6009 é seis mil e nove. Seiscentos e nove tem só 3 casas: 6, 0, 9.', mostra: quadro(609, '6009 ocupa quatro casas; alinhar 609 embaixo e comparar a casa do 6.') },
        { texto: '69', erro: 'esquece-zero', explica: '69 é sessenta e nove. Para o 6 valer 600, falta o zero nas dezenas.', mostra: quadro(609, 'Restituir o zero entre 6 e 9; as seis barras dão lugar a seis placas.') },
        { texto: '609', certa: true, explica: 'Isso. 6 centenas, nenhuma dezena e 9 unidades: **609**.', mostra: quadro(609, 'Seis placas, faixa D vazia com zero e nove cubos.') },
      ],
      esboco: 'Transformar a descoberta em escrita e mostrar a concepção por trás de cada distrator.',
    },
    {
      tipo: 'passo', problema: 'Em **4.072**, quanto vale o **7**?',
      visual: quadro(4072, 'Acrescentar M à esquerda; começar a contagem por U à direita.'),
      passos: [
        {
          pergunta: 'Em que casa está o 7?',
          opcoes: [
            { texto: 'Unidades', erro: 'casa-errada', explica: 'Nas unidades está o 2. O 7 está uma casa à esquerda.', mostra: quadro(4072, 'Acender U sob o 2 e depois D sob o 7.') },
            { texto: 'Dezenas', certa: true, explica: 'Isso. A segunda casa, contando da direita, é a das dezenas.', mostra: quadro(4072, 'Acender D e ligar o 7 a sete barras.') },
            { texto: 'Centenas', erro: 'casa-errada', explica: 'Nas centenas está o 0. O 7 está uma casa à direita, nas dezenas.', mostra: quadro(4072, 'Acender C sob o zero e D sob o 7.') },
          ],
          linha: { tex: '7\\text{ está nas dezenas}', fala: 'sete está nas dezenas' },
        },
        {
          pergunta: 'Quanto valem 7 dezenas?',
          opcoes: [
            { texto: '7', erro: 'valor-de-face', explica: '7 é o algarismo. Nas dezenas, ele vale 7 barras de 10: 70.', mostra: quadro(4072, 'Abrir as sete barras em dez cubos cada, preservando o total.') },
            { texto: '70', certa: true, explica: 'Isso. 7 barras de 10 dão **70**.', mostra: quadro(4072, 'Reagrupar os setenta cubos nas sete barras de D.') },
            { texto: '700', erro: 'casa-errada', explica: '700 seriam 7 centenas. O 7 está nas dezenas: vale 70.', mostra: quadro(4072, 'Sete placas ao lado das sete barras como contraprova, sem trocar o número original.') },
          ],
          linha: { tex: '7\\text{ dezenas} = 70', fala: 'sete dezenas são setenta' },
        },
      ],
      esboco: 'Primeiro identificar a casa, depois a quantidade. Cada escolha escreve uma linha no caderno da tela.',
    },
    {
      tipo: 'aposta', pergunta: 'Como se lê **1.005**?',
      visual: quadro(1005, 'Quadro M | C | D | U sem decomposição; o 5 é a última peça.'),
      opcoes: [
        {
          texto: 'Mil e cinquenta', erro: 'casa-errada',
          explica: 'Para ser cinquenta, o 5 teria de estar nas dezenas. Em 1.005, ele está nas unidades.',
          mostra: {
            modelo: 'quadro-posicional', estado: { numeros: [1005, 1050], casas: ['M', 'C', 'D', 'U'] },
            esboco: 'Alinhar os quadros: cinco cubos em 1.005 e cinco barras em 1.050. A posição do 5 muda.',
          },
        },
        { texto: 'Mil e cinco', certa: true, explica: 'Isso. 1 milhar, nenhuma centena, nenhuma dezena e 5 unidades.', mostra: quadro(1005, 'Um bloco de mil e cinco cubos; C e D vazias com zeros.') },
      ],
      esboco: 'Dois zeros seguidos aumentam o desafio; a contraprova distingue as leituras sem antecipar milhões.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, escreva **2.408** como soma de milhares, centenas, dezenas e unidades. Depois digite quanto vale o **4**.',
      resposta: 400,
      resolucao: [
        { tex: '2.408 = 2.000 + 400 + 0 + 8', fala: 'dois mil quatrocentos e oito é dois mil mais quatrocentos mais zero mais oito' },
        { tex: '4\\text{ centenas} = 400', fala: 'quatro centenas são quatrocentos' },
      ],
      esboco: 'Retirar os blocos durante a tentativa. Depois de digitar, abrir a resolução por linhas para comparar com o papel.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['valor-do-algarismo', 'palavras-para-numero', 'leitura-com-zero', 'valor-posicional-sozinho'],
      esboco: 'Começar com casas, passar aos zeros e terminar em contexto sem desenho. Quem já sabe chega direto. Retomar A1 se as dezenas não tiverem sentido; dica não conta como desempenho independente.',
    },
    {
      tipo: 'fecho',
      texto: 'Por isso **R$ 305** e **R$ 35** são tão diferentes: o zero segura o 3 nas centenas. Na próxima aula, números grandes.',
      visual: {
        modelo: 'quadro-posicional', estado: { numeros: [305, 35], casas: ['C', 'D', 'U'], contexto: 'preços imaginados' },
        movimento: 'Voltam as etiquetas, com placas e barras alinhadas embaixo.',
        esboco: '305 tem três placas e cinco cubos; 35, três barras e cinco cubos. Deixar C do segundo vazia, sem zero à esquerda.',
      },
      esboco: 'Responder ao gancho e convidar o aluno a explicar no caderno o que o zero preserva.',
    },
  ],
}
