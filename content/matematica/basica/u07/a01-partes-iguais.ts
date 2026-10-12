import type { Aula, Visual } from '@/lib/formation/schema'

// Fração só existe com partes iguais. O número de baixo (denominador) diz em
// quantas partes iguais o inteiro foi cortado; o de cima (numerador), quantas
// se pegou. Os erros desta aula: chamar de "quarto" um pedaço de partes
// desiguais, pôr embaixo só as partes que sobraram e trocar os dois números.

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const TORTA = [0.14, 0.42, 0.72]

export const aula: Aula = {
  id: 'B.U7.A1',
  titulo: 'Partes iguais de um todo',
  objetivo: 'Reconhecer que fração exige partes iguais, ler e escrever a fração pintada de uma barra (numerador e denominador) e a fração que sobra.',
  modelo: 'barra',
  esboco: 'Um chocolate partido em 4 pedaços tortos: o menor é "um quarto"? Embaixo aparece a barra em 4 partes iguais, e o quarto de verdade não bate com nenhum pedaço. Depois o aluno pinta 3 de 4 partes iguais e escolhe a escrita: 3/4, contra 3/1 (pintadas sobre não pintadas) e 4/3. Momento-chave: a barra de partes iguais embaixo da barra torta, com o pedaço pequeno muito menor que o quarto.',
  vega: 'Ideia central: fração é um pedaço de um inteiro cortado em partes iguais. O denominador (embaixo) conta todas as partes iguais do inteiro; o numerador (em cima), quantas se pegou. Erros esperados: chamar de 1/4 um de 4 pedaços desiguais; escrever pintadas sobre não pintadas (3/1 no lugar de 3/4); trocar os números (4/3). Guie perguntando "As partes são do mesmo tamanho?", "Em quantas partes o inteiro foi cortado, contando todas?", "Quantas você pegou?". Para a fração que sobra, conte as partes sem pintar sobre o mesmo total. Em Sua vez, peça para contar as partes com o dedo antes de escrever.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um chocolate quebrou em **4** pedaços e você pegou o menor. Você comeu **um quarto** do chocolate?',
      fala: 'Um chocolate quebrou em quatro pedaços e você pegou o menor. Você comeu um quarto do chocolate?',
      visual: barra({ cortes: TORTA, marcadas: [0], semFracao: true }, 'A barra de chocolate com 4 pedaços de tamanhos bem diferentes; o menor, na ponta esquerda, aceso em âmbar.'),
      esboco: 'Uma situação de todo dia, com a palavra "quarto" usada do jeito errado.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O pedaço aceso é **um quarto** do chocolate?',
      fala: 'O pedaço aceso é um quarto do chocolate?',
      visual: barra({ cortes: TORTA, marcadas: [0], semFracao: true }, 'A barra torta, com o pedaço pequeno aceso.'),
      opcoes: [
        {
          texto: 'Não: os 4 pedaços não são iguais', certa: true,
          explica: 'Isso. Quarto é uma de **4 partes iguais**. Embaixo, o quarto de verdade: maior que o seu pedaço.',
          mostra: barra({ barras: [{ partes: 1, cortes: TORTA, marcadas: [0] }, { partes: 4, pintadas: 1 }], semFracao: true }, 'A barra de 4 partes iguais aparece embaixo da torta. O quarto aceso passa bem do pedaço pequeno.'),
        },
        {
          texto: 'Sim: é 1 de 4 pedaços', erro: 'partes-desiguais',
          explica: 'É 1 de 4 pedaços, mas eles têm tamanhos diferentes. Embaixo, um quarto de verdade: bem maior.',
          mostra: barra({ barras: [{ partes: 1, cortes: TORTA, marcadas: [0] }, { partes: 4, pintadas: 1 }], semFracao: true }, 'A barra de 4 partes iguais aparece embaixo da torta. O quarto aceso passa bem do pedaço pequeno.'),
        },
      ],
      esboco: 'A palavra parece certa (1 de 4). A barra igual embaixo desmonta na hora.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora o chocolate em **4 partes iguais**. Você comeu **3** delas.',
      fala: 'Agora o chocolate em quatro partes iguais. Você comeu três delas.',
      visual: barra({ partes: 4, pintadas: 0, pintar: true, semFracao: true }, 'Uma barra em 4 partes iguais, todas apagadas, com a borda tracejada de quem pode tocar.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte as 3 partes que você comeu.',
        sucesso: { pintadas: 3 },
        mostre: 'As 3 primeiras partes se pintam de âmbar, uma depois da outra. A última fica apagada.',
      },
      descoberta: 'Com partes iguais, cada parte é um quarto, e 3 delas são 3 quartos.',
      esboco: 'Pintar com o dedo. Cada toque acende uma parte.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você pintou 3 das 4 partes. Como se escreve isso?',
      visual: barra({ partes: 4, pintadas: 3, semFracao: true }, 'A barra com 3 partes pintadas e 1 apagada.'),
      opcoes: [
        {
          texto: '$\\frac{3}{4}$', fala: 'três quartos', certa: true,
          explica: 'Isso. Embaixo, as **4** partes do chocolate. Em cima, as **3** que você comeu.',
          mostra: barra({ partes: 4, pintadas: 3, rotulos: true }, 'A fração 3/4 aparece ao lado da barra, e cada parte ganha o seu 1/4.'),
        },
        {
          texto: '$\\frac{3}{1}$', fala: 'três sobre um', erro: 'pintadas-sobre-nao-pintadas',
          explica: 'O 1 é a parte que sobrou. Embaixo vão **todas** as partes: 4. $\\frac{3}{1}$ seriam 3 chocolates inteiros.',
          mostra: barra({ partes: 4, pintadas: 3, rotulos: true }, 'As 4 partes se numeram de 1 a 4, e a fração 3/4 aparece ao lado.'),
        },
        {
          texto: '$\\frac{4}{3}$', fala: 'quatro terços', erro: 'troca-numerador-denominador',
          explica: 'Os números trocaram de lugar. Embaixo fica o corte, 4 partes. Em cima, quantas você pegou: 3.',
          mostra: barra({ partes: 4, pintadas: 3, rotulos: true }, 'O 4 desce para baixo do traço e o 3 sobe: 3/4.'),
        },
      ],
      esboco: 'A notação aparece como resumo do que ele acabou de pintar. Os dois erros clássicos viram opções.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada parte é **um quarto**: $\\frac{1}{4}$. Três delas, $\\frac{3}{4}$.',
      fala: 'Cada parte é um quarto. Três delas, três quartos.',
      visual: barra({ partes: 4, pintadas: 3, rotulos: true }, 'A barra com 1/4 escrito em cada parte; as 3 pintadas acendem uma a uma enquanto o 3 da fração cresce.'),
      esboco: 'O pedaço ganha nome antes do anote.',
    },
    {
      tipo: 'anote',
      titulo: 'Fração',
      definicao: '**Fração** é um pedaço de um inteiro cortado em partes iguais. Embaixo, o **denominador**: quantas partes. Em cima, o **numerador**: quantas pegamos.',
      exemplo: { tex: '\\frac{3}{4} \\to 3 \\text{ de } 4 \\text{ partes iguais}', fala: 'três quartos: três de quatro partes iguais' },
      alerta: 'Sem partes iguais, não há fração. E embaixo vão todas as partes, não só as que sobraram.',
      esboco: 'Na página: a barra de 3/4, com setas para "numerador" e "denominador", e a barra torta riscada.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual barra mostra $\\frac{1}{3}$ pintado?',
      fala: 'Qual barra mostra um terço pintado?',
      visual: barra({ barras: [{ partes: 1, cortes: [0.2, 0.6], marcadas: [0] }, { partes: 3, pintadas: 1 }, { partes: 4, pintadas: 1 }], semFracao: true }, 'Três barras, uma embaixo da outra, cada uma com uma parte pintada: a de cima em 3 pedaços tortos, a do meio em 3 iguais, a de baixo em 4 iguais.'),
      opcoes: [
        {
          texto: 'A do meio', certa: true,
          explica: 'Isso. 3 partes iguais, 1 pintada.',
          mostra: barra({ barras: [{ partes: 1, cortes: [0.2, 0.6], marcadas: [0] }, { partes: 3, pintadas: 1 }, { partes: 4, pintadas: 1 }], destaque: 1 }, 'A barra do meio acende com 1/3 ao lado; as outras se apagam.'),
        },
        {
          texto: 'A de cima', erro: 'partes-desiguais',
          explica: 'Ela tem 3 pedaços, mas de tamanhos diferentes. Sem partes iguais, não é terço.',
          mostra: barra({ barras: [{ partes: 1, cortes: [0.2, 0.6], marcadas: [0] }, { partes: 3, pintadas: 1 }], semFracao: true }, 'O pedaço torto fica em cima do terço de verdade: bem menor.'),
        },
        {
          texto: 'A de baixo', erro: 'pintadas-sobre-nao-pintadas',
          explica: '1 pintada e 3 sem pintar: são **4** partes ao todo. Essa é $\\frac{1}{4}$.',
          mostra: barra({ barras: [{ partes: 3, pintadas: 1 }, { partes: 4, pintadas: 1 }], rotulos: true }, 'As duas barras iguais, com 1/3 e 1/4 escritos dentro das partes.'),
        },
      ],
      esboco: 'As três barras lado a lado: o aluno aplica as duas regras (partes iguais, contar todas) de uma vez.',
    },
    {
      tipo: 'passo',
      problema: 'Uma pizza foi cortada em **8** fatias iguais. Você comeu **3**. Que fração comeu? E que fração sobrou?',
      fala: 'Uma pizza foi cortada em oito fatias iguais. Você comeu três. Que fração comeu? E que fração sobrou?',
      visual: barra({ partes: 8, pintadas: 3, semFracao: true }, 'A pizza esticada numa barra de 8 fatias, 3 pintadas. Proposta: um círculo de pizza, que vira barra para comparar.'),
      passos: [
        {
          pergunta: 'Qual número vai **embaixo**?',
          fala: 'Qual número vai embaixo?',
          opcoes: [
            { texto: '8', certa: true, explica: 'Isso. A pizza inteira tem 8 fatias iguais.' },
            { texto: '5', erro: 'pintadas-sobre-nao-pintadas', explica: '5 são as que sobraram. Embaixo vão todas as fatias: 8.' },
            { texto: '3', erro: 'troca-numerador-denominador', explica: '3 são as que você comeu: vão em cima. Embaixo, o total de fatias: 8.' },
          ],
          linha: { tex: '\\text{embaixo: } 8 \\text{ fatias}', fala: 'embaixo: oito fatias' },
        },
        {
          pergunta: 'Que fração da pizza você comeu?',
          opcoes: [
            { texto: '$\\frac{3}{8}$', fala: 'três oitavos', certa: true, explica: 'Isso. 3 das 8 fatias.' },
            { texto: '$\\frac{3}{5}$', fala: 'três quintos', erro: 'pintadas-sobre-nao-pintadas', explica: 'O 5 conta só as que sobraram. A pizza tem 8 fatias: $\\frac{3}{8}$.' },
          ],
          linha: { tex: '\\text{comeu: } \\frac{3}{8}', fala: 'comeu: três oitavos' },
        },
        {
          pergunta: 'E que fração **sobrou**?',
          fala: 'E que fração sobrou?',
          opcoes: [
            { texto: '$\\frac{5}{8}$', fala: 'cinco oitavos', certa: true, explica: 'Isso. Sobraram 5 das mesmas 8 fatias.', mostra: barra({ partes: 8, marcadas: [3, 4, 5, 6, 7] }, 'As 5 fatias da direita se acendem e 5/8 aparece ao lado.') },
            { texto: '$\\frac{5}{3}$', fala: 'cinco terços', erro: 'pintadas-sobre-nao-pintadas', explica: 'A pizza continua com 8 fatias. Sobraram 5 delas: $\\frac{5}{8}$.' },
            { texto: '$\\frac{3}{8}$', fala: 'três oitavos', explica: '$\\frac{3}{8}$ é o que você comeu. O que sobrou são as outras 5 fatias.' },
          ],
          linha: { tex: '8 - 3 = 5 \\to \\text{sobrou: } \\frac{5}{8}', fala: 'oito menos três, cinco: sobrou cinco oitavos' },
        },
      ],
      esboco: 'Primeiro o denominador, que é onde mora o erro. Depois as duas frações saem do mesmo total.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: desenhe uma barra de **6** partes iguais e pinte **5**. Que fração ficou **sem** pintar?',
      fala: 'No papel: desenhe uma barra de seis partes iguais e pinte cinco. Que fração ficou sem pintar?',
      resposta: '1/6',
      resolucao: [
        { tex: '\\text{total: } 6 \\text{ partes iguais}', fala: 'total: seis partes iguais' },
        { tex: '6 - 5 = 1 \\text{ sem pintar}', fala: 'seis menos cinco: uma sem pintar' },
        { tex: '\\frac{1}{6}', fala: 'um sexto' },
      ],
      esboco: 'A barra no caderno quadriculado: 6 quadradinhos dão 6 partes iguais sem régua.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['partes-iguais-n1', 'partes-iguais-n2', 'partes-iguais-n3'],
      esboco: 'Nível 1: a fração pintada de uma barra. Nível 2: a fração que ficou sem pintar. Nível 3: pizzas, bolos e terrenos, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'Não foi um quarto: os pedaços eram desiguais. **Fração só existe com partes iguais.** Na próxima aula, a fração vira um ponto na reta.',
      fala: 'Não foi um quarto: os pedaços eram desiguais. Fração só existe com partes iguais. Na próxima aula, a fração vira um ponto na reta.',
      visual: barra({ barras: [{ partes: 1, cortes: TORTA, marcadas: [0] }, { partes: 4, pintadas: 1 }], destaque: 1 }, 'A barra torta apagada em cima e o quarto de verdade aceso embaixo, com 1/4 ao lado.'),
      esboco: 'Volta ao chocolate do gancho, agora com a resposta à vista.',
    },
  ],
}
