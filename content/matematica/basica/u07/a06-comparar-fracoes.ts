import type { Aula, Visual } from '@/lib/formation/schema'

// Comparar frações: com pedaços do mesmo tamanho, é só contar; com o mesmo
// número de pedaços, ganha quem tem o pedaço maior (menos partes); nos
// outros casos, a metade serve de régua ou se deixam os pedaços do mesmo
// tamanho. O erro a desmontar: "1/8 > 1/6 porque 8 > 6".

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const TORTAS = { barras: [{ partes: 1, rotulo: '6 fatias' }, { partes: 1, rotulo: '8 fatias' }] }
const FATIAS = { barras: [{ partes: 6, pintadas: 1 }, { partes: 8, pintadas: 1 }] }

export const aula: Aula = {
  id: 'B.U7.A6',
  titulo: 'Comparar frações',
  objetivo: 'Comparar duas frações: contando pedaços do mesmo tamanho, olhando o tamanho do pedaço quando os numeradores são iguais, ou usando a metade como referência.',
  modelo: 'barra',
  esboco: 'Duas tortas iguais, uma em 6 fatias e outra em 8. Barras empilhadas, do mesmo comprimento, mostram que o pedaço de 8 é mais curto. Depois, pedaços iguais (contar), a metade como régua (3/8 contra 2/3) e, quando as duas passam da metade, cortar até os pedaços ficarem iguais (2/3 e 3/4 em doze avos). Momento-chave: ver o 1/8 mais curto que o 1/6, com o 8 maior que o 6.',
  vega: 'Ideia central: comparar frações é comparar quantidades, não os números soltos. Três caminhos: (1) mesmo denominador, pedaços do mesmo tamanho: ganha quem tem mais pedaços; (2) mesmo numerador: ganha quem tem o pedaço maior, ou seja, o menor denominador; (3) nos outros casos, comparar com 1/2, ou deixar os pedaços do mesmo tamanho (o denominador comum, que já veio nas equivalentes e volta na soma). Erros esperados: achar 1/8 > 1/6 porque 8 > 6; achar que a fração com números maiores é maior (3/8 > 2/3); achar 2/3 e 3/4 iguais porque "falta 1 pedaço em cada". Guie com "Os pedaços são do mesmo tamanho?", "Passa da metade?", "Qual pedaço é maior, o de 6 ou o de 8 partes?". Nunca diga só a regra: mostre as barras empilhadas.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Duas tortas iguais: uma cortada em **6** fatias, a outra em **8**. Você quer a fatia maior. De qual torta você pega?',
      fala: 'Duas tortas iguais: uma cortada em seis fatias, a outra em oito. Você quer a fatia maior. De qual torta você pega?',
      visual: barra(TORTAS, 'Duas barras inteiras do mesmo comprimento, uma em cima da outra, ainda sem cortes: "6 fatias" e "8 fatias" à direita.'),
      esboco: 'Uma escolha de mesa, que todo mundo já fez. A pergunta prepara a armadilha do 8 maior que o 6.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual fatia é maior: $\\frac{1}{6}$ ou $\\frac{1}{8}$ da torta?',
      fala: 'Qual fatia é maior: um sexto ou um oitavo da torta?',
      visual: barra(TORTAS, 'As duas tortas inteiras, sem cortes, para o aluno prever antes de ver.'),
      opcoes: [
        {
          texto: '$\\frac{1}{6}$', fala: 'um sexto', certa: true,
          explica: 'Isso. A torta de 6 foi cortada em menos partes: cada fatia fica maior.',
          mostra: barra(FATIAS, 'As barras se cortam, uma em 6 e a outra em 8, e 1 pedaço de cada acende: o de cima é mais comprido.'),
        },
        {
          texto: '$\\frac{1}{8}$', fala: 'um oitavo', erro: 'maior-denominador-maior-fracao',
          explica: '8 é maior que 6, mas a mesma torta em 8 partes dá fatias **menores**. Olhe as barras.',
          mostra: barra({ ...FATIAS, destaque: 1 }, 'As barras se cortam; o pedaço de 1/8 acende e fica visivelmente mais curto que o de 1/6.'),
        },
        {
          texto: 'São iguais: as duas são 1 fatia',
          explica: 'É 1 fatia de cada, mas de tamanhos diferentes. A fatia de 6 é mais comprida.',
          mostra: barra(FATIAS, 'Os dois pedaços pintados, um embaixo do outro: o de cima passa do de baixo.'),
        },
      ],
      esboco: 'O 1/8 é a isca: o 8 é maior. As barras empilhadas desmontam na hora.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora pedaços do **mesmo** tamanho: $\\frac{3}{8}$ em cima. Qual é maior, $\\frac{3}{8}$ ou $\\frac{5}{8}$?',
      fala: 'Agora pedaços do mesmo tamanho: três oitavos em cima. Qual é maior, três oitavos ou cinco oitavos?',
      visual: barra(
        { barras: [{ partes: 8, pintadas: 3 }, { partes: 8, pintadas: 0 }], pintar: true, ativa: 1 },
        'Duas barras em oitavos. A de cima já tem 3 pintados; o aluno pinta a de baixo.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte $\\frac{5}{8}$ na barra de baixo.',
        sucesso: { pintadas: 5 },
        mostre: 'Cinco oitavos se pintam na barra de baixo e passam dos três de cima.',
      },
      descoberta: 'Com pedaços do mesmo tamanho, é só contar: 5 oitavos é mais que 3 oitavos.',
      esboco: 'O caso fácil, feito com a mão. A barra de baixo passa a de cima.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E $\\frac{3}{8}$ contra $\\frac{2}{3}$? Pedaços diferentes, quantidades diferentes. Qual é maior?',
      fala: 'E três oitavos contra dois terços? Pedaços diferentes, quantidades diferentes. Qual é maior?',
      visual: barra({ barras: [{ partes: 8 }, { partes: 3 }], semFracao: true }, 'Uma barra em oitavos e outra em terços, ainda sem nada pintado.'),
      opcoes: [
        {
          texto: '$\\frac{2}{3}$', fala: 'dois terços', certa: true,
          explica: 'Isso. $\\frac{2}{3}$ passa da metade, e $\\frac{3}{8}$ não chega nela.',
          mostra: barra({ barras: [{ partes: 8, pintadas: 3 }, { partes: 3, pintadas: 2 }], guia: 0.5 }, 'As duas se pintam e a linha tracejada da metade desce: 3/8 fica antes dela, 2/3 passa.'),
        },
        {
          texto: '$\\frac{3}{8}$', fala: 'três oitavos', erro: 'maior-denominador-maior-fracao',
          explica: '3 e 8 são números maiores, mas oitavos são pedaços pequenos: 3 deles não chegam à metade.',
          mostra: barra({ barras: [{ partes: 8, pintadas: 3 }, { partes: 3, pintadas: 2 }], guia: 0.5 }, 'A linha da metade corta as duas: o pintado de 3/8 para antes dela.'),
        },
      ],
      esboco: 'A metade vira régua. A linha tracejada é o que fica na memória.',
    },
    {
      tipo: 'aposta',
      pergunta: '$\\frac{2}{3}$ e $\\frac{3}{4}$ passam da metade. E agora, qual é maior?',
      fala: 'Dois terços e três quartos passam da metade. E agora, qual é maior?',
      visual: barra({ barras: [{ partes: 3, pintadas: 2 }, { partes: 4, pintadas: 3 }], guia: 0.5 }, 'As duas barras pintadas, com a linha da metade: as duas passam, quase empatadas.'),
      opcoes: [
        {
          texto: '$\\frac{3}{4}$', fala: 'três quartos', certa: true,
          explica: 'Isso. Falta 1 pedaço em cada, mas o quarto que falta é menor que o terço.',
        },
        {
          texto: '$\\frac{2}{3}$', fala: 'dois terços',
          explica: 'Terços são maiores que quartos, mas são 2 contra 3. Ainda não dá para saber de olho.',
        },
        {
          texto: 'São iguais: falta 1 pedaço em cada',
          explica: 'Falta 1 em cada, mas pedaços de tamanhos diferentes. Vamos cortar para ver.',
        },
      ],
      esboco: 'A régua da metade não decide. A próxima ferramenta: deixar os pedaços iguais.',
    },
    {
      tipo: 'mexa',
      texto: 'Deixe os pedaços do mesmo tamanho. Corte os terços até virarem **doze avos**.',
      fala: 'Deixe os pedaços do mesmo tamanho. Corte os terços até virarem doze avos.',
      visual: barra(
        { barras: [{ partes: 3, pintadas: 2 }, { partes: 12, pintadas: 9 }], partir: true, fator: 2, ativa: 0 },
        'Em cima, 2/3. Embaixo, 3/4 já cortado em doze avos (9/12). Cada toque corta os pedaços de cima ao meio: 2/3, 4/6, 8/12.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na barra de cima até ela ter 12 partes.',
        sucesso: { partes: 12 },
        mostre: 'A barra de cima se corta ao meio duas vezes: 2/3 vira 4/6 e depois 8/12.',
      },
      descoberta: 'Em doze avos, 2/3 = 8/12 e 3/4 = 9/12. Com pedaços iguais, 9 > 8: 3/4 é maior.',
      esboco: 'As equivalentes da aula anterior viram ferramenta de comparar.',
    },
    {
      tipo: 'ideia',
      texto: 'Pedaços iguais, é só contar: $\\frac{8}{12} < \\frac{9}{12}$. Então $\\frac{2}{3} < \\frac{3}{4}$.',
      fala: 'Pedaços iguais, é só contar: oito doze avos é menor que nove doze avos. Então dois terços é menor que três quartos.',
      visual: barra({ barras: [{ partes: 12, pintadas: 8 }, { partes: 12, pintadas: 9 }] }, 'As duas barras em doze avos: a de baixo tem 1 pedaço a mais pintado, que pisca.'),
      esboco: 'Resume o que o corte mostrou, com a notação de menor que.',
    },
    {
      tipo: 'anote',
      titulo: 'Comparar frações',
      definicao: 'Com pedaços do mesmo tamanho, ganha quem tem mais pedaços. Se não são, compare com a metade ou deixe os pedaços iguais.',
      exemplo: { tex: '\\frac{1}{8} < \\frac{1}{6} \\qquad \\frac{3}{8} < \\frac{1}{2} < \\frac{2}{3}', fala: 'um oitavo é menor que um sexto; três oitavos é menor que um meio, que é menor que dois terços' },
      alerta: 'Mais partes, pedaços menores: $\\frac{1}{8}$ é menor que $\\frac{1}{6}$, mesmo com o 8 maior que o 6.',
      esboco: 'A página com as duas tortas empilhadas e a linha da metade.',
    },
    {
      tipo: 'passo',
      problema: 'Um bolo leva $\\frac{3}{5}$ de xícara de farinha; uma torta, $\\frac{2}{3}$. Qual leva mais farinha?',
      fala: 'Um bolo leva três quintos de xícara de farinha; uma torta, dois terços. Qual leva mais farinha?',
      visual: barra({ barras: [{ partes: 5, pintadas: 3 }, { partes: 3, pintadas: 2 }], guia: 0.5 }, 'As duas frações em barras, com a linha da metade: as duas passam dela.'),
      passos: [
        {
          pergunta: 'As duas passam da metade. O que fazer?',
          opcoes: [
            { texto: 'Deixar os pedaços do mesmo tamanho', certa: true, explica: 'Isso. Quintos e terços viram quinze avos: 15 é múltiplo de 5 e de 3.' },
            { texto: 'Ver qual tem o maior denominador', erro: 'maior-denominador-maior-fracao', explica: 'O denominador maior faz o pedaço menor, não a fração maior. Deixe os pedaços iguais.' },
          ],
          linha: { tex: '\\text{mmc}(5, 3) = 15', fala: 'o mmc de cinco e três é quinze' },
        },
        {
          pergunta: '$\\frac{3}{5}$ em quinze avos é…',
          fala: 'três quintos em quinze avos é…',
          opcoes: [
            { texto: '$\\frac{9}{15}$', certa: true, explica: 'Isso. Cada quinto vira 3 pedaços de quinze avos: $3 \\times 3 = 9$.', mostra: barra({ barras: [{ partes: 15, pintadas: 9 }, { partes: 3, pintadas: 2 }] }, 'A barra de cima se corta: cada quinto em 3.') },
            { texto: '$\\frac{3}{15}$', erro: 'muda-so-um-termo', explica: 'Os pedaços ficaram 3 vezes menores: o pintado precisa de 3 vezes mais pedaços. São 9.', mostra: barra({ barras: [{ partes: 5, pintadas: 3 }, { partes: 15, pintadas: 3 }] }, '3/15 embaixo de 3/5: muito menos pintado.') },
          ],
          linha: { tex: '\\frac{3}{5} = \\frac{9}{15}', fala: 'três quintos é nove quinze avos' },
        },
        {
          pergunta: 'E $\\frac{2}{3}$ em quinze avos?',
          fala: 'E dois terços em quinze avos?',
          opcoes: [
            { texto: '$\\frac{10}{15}$', certa: true, explica: 'Isso. Cada terço vira 5 pedaços: $2 \\times 5 = 10$.', mostra: barra({ barras: [{ partes: 15, pintadas: 9 }, { partes: 15, pintadas: 10 }] }, 'As duas em quinze avos, uma embaixo da outra.') },
            { texto: '$\\frac{2}{15}$', erro: 'muda-so-um-termo', explica: 'Mudou só o de baixo. Cada terço vira 5 pedaços: são 10.' },
          ],
          linha: { tex: '\\frac{2}{3} = \\frac{10}{15}', fala: 'dois terços é dez quinze avos' },
        },
        {
          pergunta: 'Qual leva mais farinha?',
          opcoes: [
            { texto: 'A torta: $\\frac{2}{3}$', certa: true, explica: 'Isso. 10 pedaços contra 9: a torta leva um pouquinho mais.' },
            { texto: 'O bolo: $\\frac{3}{5}$', explica: 'Em quinze avos, o bolo tem 9 e a torta tem 10. A torta leva mais.' },
          ],
          linha: { tex: '\\frac{9}{15} < \\frac{10}{15} \\quad \\text{então} \\quad \\frac{3}{5} < \\frac{2}{3}', fala: 'nove quinze avos é menor que dez quinze avos, então três quintos é menor que dois terços' },
        },
      ],
      esboco: 'O caminho completo, quando a metade não decide: pedaço comum, converter, contar.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: qual é maior, $\\frac{5}{6}$ ou $\\frac{7}{9}$? Use pedaços de dezoito avos. Escreva a maior.',
      fala: 'No papel: qual é maior, cinco sextos ou sete nonos? Use pedaços de dezoito avos. Escreva a maior.',
      resposta: '5/6',
      resolucao: [
        { tex: '\\frac{5}{6} = \\frac{15}{18}', fala: 'cinco sextos é quinze dezoito avos' },
        { tex: '\\frac{7}{9} = \\frac{14}{18}', fala: 'sete nonos é catorze dezoito avos' },
        { tex: '\\frac{15}{18} > \\frac{14}{18} \\quad \\text{então} \\quad \\frac{5}{6} > \\frac{7}{9}', fala: 'quinze dezoito avos é maior que catorze, então cinco sextos é maior que sete nonos' },
      ],
      esboco: 'As duas passam da metade e estão quase empatadas: só o pedaço comum decide.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['comparar-fracoes-n1', 'comparar-fracoes-n2', 'comparar-fracoes-n3'],
      esboco: 'Nível 1: frações de numerador 1, com as barras. Nível 2: mesmo denominador ou mesmo numerador. Nível 3: receitas em que a fração menor tem os números maiores, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Pegue a fatia da torta de **6**: menos partes, pedaços maiores. Na próxima aula: somar frações com pedaços iguais.',
      fala: 'Pegue a fatia da torta de seis: menos partes, pedaços maiores. Na próxima aula: somar frações com pedaços iguais.',
      visual: barra(FATIAS, 'As duas fatias empilhadas, a de 1/6 acesa e mais comprida.'),
      esboco: 'Responde ao gancho e abre a soma.',
    },
  ],
}
