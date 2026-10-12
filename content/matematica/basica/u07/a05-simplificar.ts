import type { Aula, Visual } from '@/lib/formation/schema'

// Simplificar é o caminho de volta das equivalentes: juntar pedaços. 6/8 de
// uma torta, juntando as fatias de 2 em 2, vira 3/4: o mesmo pedaço, com
// números menores. A regra é dividir os dois termos pelo mesmo número; pelo
// MDC, de uma vez. Quando só o 1 divide os dois, a fração não simplifica mais.

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const SEIS_OITAVOS = { partes: 8, pintadas: 6 }
const TRES_QUARTOS = { partes: 4, pintadas: 3 }

export const aula: Aula = {
  id: 'B.U7.A5',
  titulo: 'Simplificar',
  objetivo: 'Simplificar uma fração dividindo os dois termos pelo mesmo número, até o fim (pelo MDC), e reconhecer quando ela já está na forma mais simples.',
  modelo: 'barra',
  esboco: 'Sobraram 6 de 8 fatias de uma torta. Embaixo, a mesma torta em 4 pedaços maiores: o aluno pinta o mesmo tanto e acha 3 de 4. 6/8 = 3/4: as fatias se juntaram de 2 em 2. Depois 12/18: dividir por 2 dá 6/9, mas ainda dá para juntar; pelo MDC (6), sai 2/3 de uma vez. Momento-chave: a barra de 3/4 embaixo da de 6/8 com o pintado terminando no mesmo lugar, agora com pedaços maiores.',
  vega: 'Ideia central: simplificar é dividir os dois termos da fração pelo mesmo número, o que junta os pedaços sem mudar o tamanho do pintado (6/8 = 3/4). Para simplificar de uma vez, divida pelo MDC dos dois termos (unidade 6). A fração está na forma mais simples (irredutível) quando só o 1 divide os dois. Erros esperados: dividir só um termo (6/8 = 3/8); subtrair o mesmo dos dois (6/8 = 4/6); parar antes do fim (12/18 = 6/9); usar um divisor comum que não é o maior. Guie perguntando "Os dois números ainda têm um divisor comum?", "Qual é o maior?", "A barra do resultado termina no mesmo lugar?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Sobraram **6** das **8** fatias de uma torta. Dá para dizer o mesmo com pedaços maiores e números menores?',
      fala: 'Sobraram seis das oito fatias de uma torta. Dá para dizer o mesmo com pedaços maiores e números menores?',
      visual: barra({ ...SEIS_OITAVOS }, 'A torta numa barra de 8 fatias, 6 pintadas, com 6/8 ao lado.'),
      esboco: 'A mesma quantidade, um nome mais curto. A pergunta é o contrário da aula anterior.',
    },
    {
      tipo: 'mexa',
      texto: 'Embaixo, a mesma torta em **4** pedaços maiores. Pinte o mesmo tanto que sobrou.',
      fala: 'Embaixo, a mesma torta em quatro pedaços maiores. Pinte o mesmo tanto que sobrou.',
      visual: barra({ barras: [SEIS_OITAVOS, { partes: 4, pintadas: 0 }], ativa: 1, pintar: true }, 'A barra de 6/8 em cima e, embaixo, uma barra de 4 partes vazia, com a borda tracejada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte a barra de baixo até onde vai o pintado de cima.',
        sucesso: { pintadas: 3 },
        mostre: '3 dos 4 pedaços de baixo se pintam e terminam exatamente onde termina o 6/8.',
      },
      descoberta: 'Cada pedaço de baixo cobre 2 fatias de cima: 6 fatias são 3 pedaços. 6/8 = 3/4.',
      esboco: 'Se passar do lugar, o palco balança e pede para tirar. O fim dos dois pintados se alinha.',
    },
    {
      tipo: 'aposta',
      pergunta: '$\\frac{6}{8}$ virou $\\frac{3}{4}$. O que aconteceu com os dois números?',
      fala: 'Seis oitavos virou três quartos. O que aconteceu com os dois números?',
      visual: barra({ barras: [SEIS_OITAVOS, TRES_QUARTOS], guia: 0.75 }, 'As barras de 6/8 e 3/4, com a linha tracejada no fim dos dois pintados.'),
      opcoes: [
        {
          texto: 'Os dois foram divididos por 2', certa: true,
          explica: 'Isso. As fatias se juntaram de 2 em 2: as partes caem pela metade, e as pintadas também.',
          mostra: barra({ barras: [SEIS_OITAVOS, TRES_QUARTOS], rotulos: true, guia: 0.75 }, 'Cada quarto de baixo cobre dois oitavos de cima.'),
        },
        {
          texto: 'Os dois perderam 3', erro: 'equivalente-somando',
          explica: '$8 - 3 = 5$, e não 4. Juntar pedaços **divide**: $6 \\div 2$ e $8 \\div 2$.',
          mostra: barra({ barras: [SEIS_OITAVOS, TRES_QUARTOS], rotulos: true, guia: 0.75 }, 'Cada quarto de baixo cobre dois oitavos de cima.'),
        },
        {
          texto: 'Só o de cima foi dividido', erro: 'muda-so-um-termo',
          explica: 'O de baixo também: 8 fatias viraram 4 pedaços. Os dois foram divididos por 2.',
          mostra: barra({ barras: [SEIS_OITAVOS, { partes: 8, pintadas: 3 }], guia: 0.75 }, 'Se só o de cima mudasse, seriam 3/8: o pintado fica longe da linha.'),
        },
      ],
      esboco: 'A regra é o espelho da aula anterior: lá multiplicava, aqui divide.',
    },
    {
      tipo: 'anote',
      titulo: 'Simplificar',
      definicao: '**Simplificar** é dividir os **dois** números da fração pelo mesmo número. Os pedaços ficam maiores, e a fração continua igual.',
      exemplo: { tex: '\\frac{6}{8} = \\frac{6 \\div 2}{8 \\div 2} = \\frac{3}{4}', fala: 'seis oitavos é seis dividido por dois sobre oito dividido por dois, três quartos' },
      alerta: 'Divida os dois, nunca um só: $\\frac{6}{8}$ não é $\\frac{3}{8}$. E subtrair não vale.',
      esboco: 'Na página: a barra de 6/8 com as fatias agrupadas de 2 em 2 e a de 3/4 embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Dividindo por 2, $\\frac{12}{18}$ vira $\\frac{6}{9}$. Acabou?',
      fala: 'Dividindo por dois, doze dezoito avos vira seis nonos. Acabou?',
      visual: barra({ barras: [{ partes: 18, pintadas: 12 }, { partes: 9, pintadas: 6 }] }, 'As barras de 12/18 e 6/9, uma embaixo da outra.'),
      opcoes: [
        {
          texto: 'Não: 6 e 9 ainda dividem por 3', certa: true,
          explica: 'Isso. $6 \\div 3 = 2$ e $9 \\div 3 = 3$: sai $\\frac{2}{3}$, com pedaços ainda maiores.',
          mostra: barra({ barras: [{ partes: 18, pintadas: 12 }, { partes: 9, pintadas: 6 }, { partes: 3, pintadas: 2 }], guia: 2 / 3 }, 'A terceira barra, de 2/3, aparece embaixo; os três pintados terminam na mesma linha.'),
        },
        {
          texto: 'Sim: já dividi uma vez', erro: 'simplificacao-incompleta',
          explica: 'Ainda dá para juntar: 6 e 9 se dividem por 3. Sai $\\frac{2}{3}$.',
          mostra: barra({ barras: [{ partes: 18, pintadas: 12 }, { partes: 9, pintadas: 6 }, { partes: 3, pintadas: 2 }], guia: 2 / 3 }, 'A barra de 2/3 aparece embaixo, com pedaços de 3 nonos.'),
        },
      ],
      esboco: 'Parar no primeiro "deu" é o erro mais comum de quem já sabe simplificar.',
    },
    {
      tipo: 'ideia',
      texto: 'Para ir até o fim de uma vez, divida pelo **MDC**. $\\text{mdc}(12, 18) = 6$, e $\\frac{12}{18} = \\frac{2}{3}$.',
      fala: 'Para ir até o fim de uma vez, divida pelo mdc. O mdc de doze e dezoito é seis, e doze dezoito avos é dois terços.',
      visual: barra({ barras: [{ partes: 18, pintadas: 12 }, { partes: 3, pintadas: 2 }], guia: 2 / 3 }, 'A barra de 12/18 e a de 2/3; cada terço de baixo cobre 6 partes de cima.'),
      esboco: 'O MDC da unidade 6 volta como ferramenta: o maior pedaço que cabe nos dois.',
    },
    {
      tipo: 'passo',
      problema: 'Simplifique $\\frac{18}{24}$ até o fim.',
      fala: 'Simplifique dezoito vinte e quatro avos até o fim.',
      visual: barra({ partes: 24, pintadas: 18 }, 'Uma barra de 24 partes finas, 18 pintadas.'),
      passos: [
        {
          pergunta: 'Qual é o maior número que divide 18 e 24?',
          fala: 'Qual é o maior número que divide dezoito e vinte e quatro?',
          opcoes: [
            { texto: '6', certa: true, explica: 'Isso. $18 = 6 \\times 3$ e $24 = 6 \\times 4$.' },
            { texto: '2', erro: 'mdc-nao-e-o-maior', explica: '2 divide os dois, mas 6 também divide, e é maior.' },
            { texto: '3', erro: 'mdc-nao-e-o-maior', explica: '3 divide os dois, mas 6 também divide, e é maior.' },
            { texto: '72', erro: 'confunde-mmc-mdc', explica: '72 é o mmc, um múltiplo. Aqui se quer dividir: o maior divisor comum, 6.' },
          ],
          linha: { tex: '\\text{mdc}(18, 24) = 6', fala: 'o mdc de dezoito e vinte e quatro é seis' },
        },
        {
          pergunta: 'Divida os dois por 6.',
          fala: 'Divida os dois por seis.',
          opcoes: [
            { texto: '$\\frac{3}{4}$', fala: 'três quartos', certa: true, explica: 'Isso. $18 \\div 6 = 3$ e $24 \\div 6 = 4$.', mostra: barra({ barras: [{ partes: 24, pintadas: 18 }, TRES_QUARTOS], guia: 0.75 }, 'A barra de 3/4 aparece embaixo; os dois pintados terminam na mesma linha.') },
            { texto: '$\\frac{3}{24}$', fala: 'três vinte e quatro avos', erro: 'muda-so-um-termo', explica: 'O 24 também se divide por 6. $\\frac{3}{24}$ é um pedacinho, bem menor.' },
            { texto: '$\\frac{12}{18}$', fala: 'doze dezoito avos', erro: 'equivalente-somando', explica: 'Isso é tirar 6 dos dois. Simplificar é dividir: $18 \\div 6$ e $24 \\div 6$.' },
          ],
          linha: { tex: '\\frac{18 \\div 6}{24 \\div 6} = \\frac{3}{4}', fala: 'dezoito dividido por seis sobre vinte e quatro dividido por seis, três quartos' },
        },
        {
          pergunta: 'E $\\frac{3}{4}$, ainda simplifica?',
          fala: 'E três quartos, ainda simplifica?',
          opcoes: [
            { texto: 'Não: só o 1 divide 3 e 4', certa: true, explica: 'Isso. É a forma mais simples, a fração **irredutível**.' },
            { texto: 'Sim: por 2', explica: 'O 4 se divide por 2, mas o 3 não. Só o 1 divide os dois.' },
          ],
          linha: { tex: '\\frac{18}{24} = \\frac{3}{4}', fala: 'dezoito vinte e quatro avos é três quartos' },
        },
      ],
      esboco: 'O método completo: MDC, dividir os dois, conferir que acabou.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: de **20** questões, você acertou **15**. Que fração acertou? Simplifique até o fim.',
      fala: 'No papel: de vinte questões, você acertou quinze. Que fração acertou? Simplifique até o fim.',
      resposta: '3/4',
      resolucao: [
        { tex: '\\frac{15}{20}', fala: 'quinze vinte avos' },
        { tex: '\\text{mdc}(15, 20) = 5', fala: 'o mdc de quinze e vinte é cinco' },
        { tex: '\\frac{15 \\div 5}{20 \\div 5} = \\frac{3}{4}', fala: 'quinze dividido por cinco sobre vinte dividido por cinco, três quartos' },
      ],
      esboco: 'Uma nota de prova: o tipo de fração que aparece de verdade.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['simplificar-n1', 'simplificar-n2', 'simplificar-n3'],
      esboco: 'Nível 1: dividir os dois pelo número dado, com a barra. Nível 2: simplificar até o fim, quando o primeiro divisor não basta. Nível 3: notas, trilhas e fatias, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'Sobraram $\\frac{6}{8}$ da torta, ou $\\frac{3}{4}$: o mesmo pedaço, com números menores. Na próxima aula: comparar frações.',
      fala: 'Sobraram seis oitavos da torta, ou três quartos: o mesmo pedaço, com números menores. Na próxima aula: comparar frações.',
      visual: barra({ barras: [SEIS_OITAVOS, TRES_QUARTOS], guia: 0.75 }, 'As barras de 6/8 e 3/4 com a linha no fim dos pintados.'),
      esboco: 'Responde ao gancho com as duas barras alinhadas.',
    },
  ],
}
