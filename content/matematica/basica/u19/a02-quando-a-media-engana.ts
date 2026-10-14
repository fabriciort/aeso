import type { Aula, Visual } from '@/lib/formation/schema'

// Quando a média engana. Duas partes, uma ideia: a média sozinha não conta
// tudo. Primeiro, os salários de uma loja de 7 pessoas: o do dono (R$ 25
// mil) puxa a média para R$ 6 mil, longe de todos os outros, e a mediana (R$
// 3 mil) fica junto da maioria. O momento-chave é o Mexa "equilibrar": o
// apoio tem de ir para longe dos pontos para a reta ficar reta. Depois, duas
// linhas de ônibus com a mesma média (10 minutos) e espalhamentos muito
// diferentes: a amplitude, como um colchete, mostra a diferença. Os erros a
// desmontar: usar sempre a média, achar que a mediana segue o valor que
// destoa e tomar o maior valor pela amplitude.

const dados = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'dados', estado, esboco })

/** Os salários da loja, em mil reais: soma 42, média 6, mediana 3. O 25 é o do dono. */
const S = { valores: [2, 3, 2, 4, 3, 25, 3], unidade: 'mil R$', titulo: 'Salários da loja' }
/** O dono passa a ganhar 32: soma 49, média 7, mediana ainda 3. */
const S32 = { ...S, valores: [2, 3, 2, 4, 3, 32, 3] }
/** Duas linhas de ônibus, 6 esperas cada, em minutos: média 10 nas duas; amplitude 4 e 16. */
const LINHAS = {
  conjuntos: [
    { nome: 'Linha A', valores: [9, 11, 10, 8, 12, 10] },
    { nome: 'Linha B', valores: [14, 2, 10, 18, 6, 10] },
  ],
  unidade: 'min',
  de: 0,
  ate: 20,
  passo: 2,
}

export const aula: Aula = {
  id: 'B.U19.A2',
  titulo: 'Quando a média engana',
  objetivo: 'Reconhecer quando a média sozinha engana: um valor muito longe dos outros puxa a média e não mexe na mediana, e dois conjuntos com a mesma média podem estar espalhados de jeitos muito diferentes, o que a amplitude (o maior menos o menor) mostra.',
  modelo: 'dados',
  esboco: 'O palco é o gráfico de pontos. Os salários de uma loja: seis pontos juntos entre 2 e 4 mil e um ponto sozinho no 25, o dono. Momento-chave: o Mexa "equilibrar". O apoio tem de ir até o 6 para a reta ficar reta, longe de todos os pontos: o 25 puxa. A mediana fica no 3, junto da maioria. O dono passa a ganhar 32: a média anda, a mediana não. Depois duas linhas de ônibus, uma embaixo da outra, com o apoio no 10 nas duas; o colchete da amplitude mostra 4 minutos numa e 16 na outra.',
  vega: 'Ideia central: a média sozinha pode enganar. Um valor muito longe dos outros (o salário do dono) puxa a média para o lado dele: na loja, a média é R$ 6 mil, mas 6 das 7 pessoas ganham até R$ 4 mil. A mediana (R$ 3 mil) fica no meio da fila e não se mexe quando o maior valor cresce: com um valor que destoa, ela descreve melhor o comum. E dois conjuntos com a mesma média podem se espalhar muito diferente: a amplitude, o maior menos o menor, mede esse espalhamento (4 minutos na linha A, 16 na B). Salários e esperas são exemplo da aula. Erros esperados: usar sempre a média, como se ela fosse o valor típico; achar que a mediana sobe junto com o valor que destoa; dizer que a amplitude é o maior valor. Guie com "Quantas pessoas ganham perto da média?", "Na fila, quem está no meio?", "Qual foi a menor espera? E a maior?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Numa loja trabalham 7 pessoas, contando o dono. A vaga diz: salário médio de R$ 6 mil. Você vai ganhar perto disso?',
      fala: 'Numa loja trabalham sete pessoas, contando o dono. A vaga diz: salário médio de seis mil reais. Você vai ganhar perto disso?',
      visual: dados(S, 'Sete pontos sobre a reta de 0 a 30 mil: dois no 2, três no 3, um no 4 e um sozinho, lá no 25.'),
      esboco: 'A pergunta que todo mundo já se fez ao ler um anúncio.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada ponto é um salário, em mil reais. Onde fica o ponto de equilíbrio?',
      visual: dados({ ...S, fulcro: 3 }, 'O apoio embaixo do 3, junto da maioria. A reta pende para a direita, para o 25.'),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Arraste o apoio até a reta ficar reta.',
        sucesso: { media: 6 },
        mostre: 'O apoio vai para o 6, longe de todos os pontos.',
      },
      descoberta: 'A média é 6 mil: o salário de 25 sozinho puxa o equilíbrio para longe dos outros.',
      esboco: 'O momento-chave. Perto dos pontos, a reta ainda pende: o apoio precisa ir até o 6, num lugar onde não há ninguém.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A média deu R$ 6 mil. Quantas das 7 pessoas ganham R$ 6 mil ou mais?',
      fala: 'A média deu seis mil reais. Quantas das sete pessoas ganham seis mil ou mais?',
      visual: dados({ ...S, media: true }, 'A reta equilibrada no 6, com "média 6 mil R$".'),
      opcoes: [
        {
          texto: 'Só uma: o dono, com R$ 25 mil', certa: true,
          fala: 'Só uma: o dono, com vinte e cinco mil reais.',
          explica: 'Isso. As outras 6 ganham de R$ 2 mil a R$ 4 mil. O dono puxa a média sozinho.',
          mostra: dados({ ...S, media: true, destaque: 25 }, 'O ponto do 25 aceso em âmbar, sozinho à direita do apoio.'),
        },
        {
          texto: 'Umas 3 ou 4, perto da metade', erro: 'usa-sempre-a-media',
          explica: 'Olhe os pontos: 6 pessoas ganham de R$ 2 mil a R$ 4 mil. Só o dono passa de 6 e puxa a média.',
          fala: 'Olhe os pontos: seis pessoas ganham de dois a quatro mil reais. Só o dono passa de seis e puxa a média.',
          mostra: dados({ ...S, media: true, destaque: 25 }, 'O ponto do 25 aceso: o único à direita do apoio.'),
        },
      ],
      esboco: 'A média não é o salário de ninguém. A errada é a ideia de que a média é o valor do meio.',
    },
    {
      tipo: 'mexa',
      texto: 'E a mediana? Ela não procura o equilíbrio: ela olha o meio da fila.',
      visual: dados({ ...S, media: true }, 'A reta equilibrada no 6.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na mediana dos salários.',
        sucesso: { mediana: 3 },
        mostre: 'A linha azul da mediana aparece no 3.',
      },
      descoberta: 'Em fila, 2, 2, 3, 3, 3, 4, 25: o do meio é 3. A mediana fica junto da maioria.',
      esboco: 'Tocar o 6 dá o aviso: esse é o ponto de equilíbrio, a média.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O dono passou a ganhar R$ 32 mil. Os outros salários não mudaram. O que acontece com a média e a mediana?',
      fala: 'O dono passou a ganhar trinta e dois mil reais. Os outros salários não mudaram. O que acontece com a média e a mediana?',
      visual: dados({ ...S, media: true, mediana: true, destaque: 25 }, 'A média no 6, a mediana no 3 e o salário do dono aceso.'),
      opcoes: [
        {
          texto: 'A média sobe para 7; a mediana fica em 3', certa: true,
          fala: 'A média sobe para sete; a mediana fica em três.',
          explica: 'Isso. A soma cresce 7 mil, e a média sobe 1. Na fila, o dono continua no fim: o meio não muda.',
          mostra: dados({ ...S32, media: true, mediana: true, destaque: 32 }, 'O ponto do dono anda até o 32; o apoio vai para o 7; a linha da mediana fica no 3.'),
        },
        {
          texto: 'As duas sobem', erro: 'mediana-segue-o-extremo',
          explica: 'A média sobe, para 7. Mas na fila o dono continua no fim, e o do meio ainda é o 3.',
          fala: 'A média sobe, para sete. Mas na fila o dono continua no fim, e o do meio ainda é o três.',
          mostra: dados({ ...S32, media: true, mediana: true, destaque: 32 }, 'O dono anda até o 32; a média vai para o 7; a mediana fica no 3.'),
        },
      ],
      esboco: 'O ponto do dono anda para a direita, o apoio vai atrás e a linha azul não se mexe.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Duas linhas de ônibus, 6 esperas em cada uma. As duas têm média de 10 minutos. Você não pode se atrasar: qual linha pega?',
      fala: 'Duas linhas de ônibus, seis esperas em cada uma. As duas têm média de dez minutos. Você não pode se atrasar: qual linha pega?',
      visual: dados({ ...LINHAS, media: true }, 'Duas retas, uma embaixo da outra, de 0 a 20 minutos. Na linha A, os pontos juntos entre 8 e 12; na B, espalhados de 2 a 18. O apoio no 10 nas duas.'),
      opcoes: [
        {
          texto: 'A linha A: as esperas ficam perto de 10', certa: true,
          explica: 'Isso. Na A, a espera nunca passou de 12 minutos. Na B, já foi de 18.',
          mostra: dados({ ...LINHAS, media: true, amplitude: true }, 'O colchete lilás embaixo de cada reta: curto na A, de 8 a 12; longo na B, de 2 a 18.'),
        },
        {
          texto: 'Tanto faz: a média é a mesma', erro: 'usa-sempre-a-media',
          explica: 'A média é a mesma, mas a linha B já fez alguém esperar 18 minutos. Na A, a espera nunca passou de 12.',
          mostra: dados({ ...LINHAS, media: true, amplitude: true }, 'Os colchetes: curto na A, longo na B.'),
        },
      ],
      esboco: 'A segunda parte da aula: mesma média, espalhamentos diferentes. O colchete aparece com a escolha.',
    },
    {
      tipo: 'passo',
      problema: 'O colchete vai da menor espera à maior. Essa distância é a **amplitude**. Quanto ela vale em cada linha?',
      visual: dados({ ...LINHAS, media: true }, 'As duas linhas, com o apoio no 10.'),
      passos: [
        {
          pergunta: 'Na linha A, a menor espera foi 8 minutos e a maior, 12. Qual é a amplitude?',
          opcoes: [
            {
              texto: '$12 - 8 = 4$ minutos', certa: true,
              explica: 'Isso. Da menor à maior, 4 minutos.',
              mostra: dados({ ...LINHAS, media: true, amplitude: true }, 'Os colchetes com "amplitude: 12 − 8 = 4" e "amplitude: 18 − 2 = 16".'),
            },
            {
              texto: '12 minutos', erro: 'amplitude-e-o-maior-valor',
              explica: '12 é a espera mais longa. A amplitude é a distância da menor até a maior: 12 − 8 = 4.',
              fala: 'Doze é a espera mais longa. A amplitude é a distância da menor até a maior: doze menos oito, quatro.',
            },
          ],
          linha: { tex: '\\text{linha A: } 12 - 8 = 4', fala: 'linha A: doze menos oito, quatro' },
        },
        {
          pergunta: 'E na linha B, de 2 a 18 minutos?',
          opcoes: [
            {
              texto: '$18 - 2 = 16$ minutos', certa: true,
              explica: 'Isso. Com a mesma média, a linha B se espalha 4 vezes mais que a A.',
              mostra: dados({ ...LINHAS, media: true, amplitude: true }, 'Os dois colchetes: 4 e 16.'),
            },
            {
              texto: '18 minutos', erro: 'amplitude-e-o-maior-valor',
              explica: '18 é a espera mais longa. A amplitude vai da menor até a maior: 18 − 2 = 16.',
              fala: 'Dezoito é a espera mais longa. A amplitude vai da menor até a maior: dezoito menos dois, dezesseis.',
            },
          ],
          linha: { tex: '\\text{linha B: } 18 - 2 = 16', fala: 'linha B: dezoito menos dois, dezesseis' },
        },
      ],
      esboco: 'Dá o nome ao colchete e faz a conta nas duas linhas.',
    },
    {
      tipo: 'anote',
      titulo: 'Quando a média engana',
      definicao: 'Um valor muito longe dos outros puxa a média; a mediana fica no lugar. A **amplitude**, o maior menos o menor, mostra o espalhamento.',
      exemplo: { tex: '\\text{salários: média } 6 \\text{ mil}, \\text{ mediana } 3 \\text{ mil}', fala: 'nos salários da loja: média seis mil, mediana três mil' },
      alerta: 'A média sozinha não conta tudo. Veja se algum valor destoa e quanto os valores se espalham.',
      esboco: 'Na página: os salários com o ponto do dono longe, a média e a mediana marcadas; as duas linhas de ônibus com os colchetes.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: 5 casas de uma rua estão à venda por 220, 200, 900, 230 e 210 mil reais. Qual é a mediana, em mil reais?',
      resposta: 220,
      resolucao: [
        { tex: '\\text{fila: } 200,\\ 210,\\ 220,\\ 230,\\ 900', fala: 'em fila: duzentos, duzentos e dez, duzentos e vinte, duzentos e trinta, novecentos' },
        { tex: '\\text{mediana} = 220', fala: 'a mediana é duzentos e vinte' },
        { tex: '\\text{média} = 1{.}760 \\div 5 = 352', fala: 'a média é mil setecentos e sessenta dividido por cinco, trezentos e cinquenta e dois: mais que quatro das cinco casas' },
      ],
      esboco: 'A casa de 900 mil puxa a média para 352, mais que quatro das cinco casas. A mediana diz o preço comum da rua.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['media-engana-n1', 'media-engana-n2', 'media-engana-n3'],
      esboco: 'Nível 1: a mediana e a amplitude lidas num gráfico de pontos com um valor que destoa. Nível 2: o maior valor muda (o que acontece com a média e a mediana) e qual de dois conjuntos se espalha mais. Nível 3: qual resumo usar numa situação, e a mediana de uma lista fora de ordem com um valor que destoa.',
    },
    {
      tipo: 'fecho',
      texto: 'A vaga dizia R$ 6 mil de média, mas 6 das 7 pessoas ganham até R$ 4 mil. Na próxima aula: medir o espalhamento.',
      fala: 'A vaga dizia seis mil reais de média, mas seis das sete pessoas ganham até quatro mil. Na próxima aula: medir o espalhamento.',
      visual: dados({ ...S, media: true, mediana: true }, 'Os salários com a média no 6 e a mediana no 3.'),
      esboco: 'Responde ao gancho e prepara o desvio padrão.',
    },
  ],
}
