import type { Aula, Visual } from '@/lib/formation/schema'

// Desvio padrão, a ideia. O controle de qualidade de comprimidos de 500 mg:
// dois lotes com a mesma média, um reprovado. O desvio de cada comprimido é
// quanto ele se afasta da média, um segmento de cada ponto até o apoio. O
// momento-chave é a soma dos desvios: dá 0, sempre (a média é o
// equilíbrio). Por isso se tira o sinal: a distância, ou o quadrado. O
// desvio padrão é a raiz da média dos quadrados, com números pequenos e
// redondos: no lote A, 1, 9, 0, 9 e 1 somam 20, 20 ÷ 5 = 4 e √4 = 2 mg; no
// lote B, 36 e 6 mg. A faixa média ± desvio mostra o comprimido típico. A
// missão: o lote passou no controle? Os erros a desmontar: usar sempre a
// média, somar os desvios sem sinal, o quadrado de um negativo dar negativo,
// esquecer o desvio 0 na quantidade e esquecer a raiz.

const dados = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'dados', estado, esboco })

/** O lote A, em mg: desvios −1, +3, 0, −3, +1; quadrados somam 20; desvio padrão 2. */
const A = { valores: [499, 503, 500, 497, 501], unidade: 'mg', titulo: 'Lote A' }
/** O lote B, em mg: desvios −3, +9, 0, −9, +3; quadrados somam 180; desvio padrão 6. */
const VALORES_B = [497, 509, 500, 491, 503]
const LOTES = {
  conjuntos: [
    { nome: 'Lote A', valores: A.valores },
    { nome: 'Lote B', valores: VALORES_B },
  ],
  unidade: 'mg',
  de: 490,
  ate: 510,
  passo: 2,
}

export const aula: Aula = {
  id: 'B.U19.A3',
  titulo: 'Desvio padrão, a ideia',
  objetivo: 'Entender o desvio padrão como o afastamento típico dos valores até a média: achar os desvios, ver que eles somam zero, tirar o sinal com o quadrado, fazer a média dos quadrados e a raiz, com números pequenos; ler a faixa média ± desvio padrão e decidir se um lote passa no controle.',
  modelo: 'dados',
  esboco: 'O palco é o gráfico de pontos dos pesos. Dois lotes, um embaixo do outro, com o apoio no 500 nos dois: o A juntinho, o B espalhado. Depois só o lote A: o aluno equilibra a reta no 500, e de cada ponto sai um segmento até a média, verde para cima e rosa para baixo, com o desvio escrito. Momento-chave: a soma dos desvios aparece embaixo e dá 0. Os segmentos perdem o sinal (as distâncias). O passo a passo faz os quadrados, a média e a raiz: 2 mg. A faixa azul vai de 498 a 502. Volta aos dois lotes, com as faixas: a do B é três vezes mais larga, e ele reprova.',
  vega: 'Ideia central: o desvio padrão mede quanto os valores se afastam da média, o afastamento típico. O desvio de cada valor é ele menos a média; os desvios sempre somam zero, porque a média é o ponto de equilíbrio. Para medir o afastamento, tira-se o sinal: elevando ao quadrado. O desvio padrão é a raiz da média dos quadrados dos desvios (dividindo pela quantidade de valores; a estatística de amostras divide por n − 1, mas isso fica para depois). No lote A (499, 503, 500, 497, 501 mg), os quadrados são 1, 9, 0, 9, 1; 20 ÷ 5 = 4; √4 = 2 mg. No lote B, 6 mg. A faixa média ± desvio padrão (498 a 502 mg no lote A) é onde fica o comprimido típico. Os lotes e a regra de até 3 mg são exemplo da aula, não uma norma real; o contexto de controle de qualidade deve ser revisado por alguém da área. Erros esperados: olhar só a média; somar os desvios sem o sinal e achar 8; achar que (−3)² = −9; dividir por 4, deixando de fora o comprimido de desvio 0; esquecer a raiz e dar 4 mg; tomar a raiz pela metade. Guie com "Quanto esse comprimido passa da média?", "O que acontece com os de cima e os de baixo na soma?", "O 4 ainda está ao quadrado?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Comprimidos de 500 mg: a fábrica pesou 5 de cada lote. Os dois lotes têm média de 500 mg, mas um reprovou no controle. Por quê?',
      fala: 'Comprimidos de quinhentos miligramas: a fábrica pesou cinco de cada lote. Os dois lotes têm média de quinhentos miligramas, mas um reprovou no controle. Por quê?',
      visual: dados({ ...LOTES, media: true }, 'Duas retas de 490 a 510 mg, uma embaixo da outra, com o apoio no 500 nas duas. No lote A, os pontos ficam de 497 a 503; no B, de 491 a 509.'),
      esboco: 'A missão da unidade: o lote passou no controle? A média igual não decide.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual lote você acha que reprovou?',
      visual: dados({ ...LOTES, media: true }, 'Os dois lotes, com a média no 500.'),
      opcoes: [
        {
          texto: 'O B: os pesos se espalham mais', certa: true,
          explica: 'Isso. No B, um comprimido tem 491 mg e outro, 509 mg. A dose tem de estar certa em cada um.',
          fala: 'Isso. No B, um comprimido tem quatrocentos e noventa e um miligramas e outro, quinhentos e nove. A dose tem de estar certa em cada um.',
          mostra: dados({ ...LOTES, media: true, amplitude: true }, 'Os colchetes da amplitude: 6 mg no A, 18 mg no B.'),
        },
        {
          texto: 'Nenhum deveria: a média dos dois é 500 mg', erro: 'usa-sempre-a-media',
          explica: 'Quem toma o remédio toma um comprimido, não a média. No B, um tem 491 mg e outro, 509 mg.',
          fala: 'Quem toma o remédio toma um comprimido, não a média. No B, um tem quatrocentos e noventa e um miligramas e outro, quinhentos e nove.',
          mostra: dados({ ...LOTES, media: true, amplitude: true }, 'Os colchetes: curto no A, longo no B.'),
        },
      ],
      esboco: 'Retoma a aula anterior: mesma média, espalhamentos diferentes. Agora a aula mede o espalhamento com todos os comprimidos, não só as pontas.',
    },
    {
      tipo: 'mexa',
      texto: 'A amplitude só olha as pontas. Para olhar cada comprimido, comece pelo lote A e ache a média.',
      visual: dados({ ...A, fulcro: 497 }, 'Só o lote A, de 496 a 504 mg: cinco pontos, um em cada peso. O apoio no 497, e a reta pende para a direita.'),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Arraste o apoio até a reta ficar reta.',
        sucesso: { media: 500 },
        mostre: 'O apoio vai para 500 mg.',
      },
      descoberta: 'A média do lote A é 500 mg: o ponto de equilíbrio.',
      esboco: 'O apoio da média vira a referência de cada desvio.',
    },
    {
      tipo: 'ideia',
      texto: 'O **desvio** é quanto cada comprimido se afasta da média. O de 503 mg tem desvio +3; o de 497 mg, −3.',
      fala: 'O desvio é quanto cada comprimido se afasta da média. O de quinhentos e três miligramas tem desvio mais três; o de quatrocentos e noventa e sete, menos três.',
      visual: dados({ ...A, desvios: true }, 'A linha tracejada da média no 500. De cada ponto sai um segmento até ela: verdes à direita (+1, +3), rosa à esquerda (−1, −3); o 500 fica com 0.'),
      esboco: 'Os pontos sobem, cada um na sua altura, para os segmentos não se cruzarem.',
    },
    {
      tipo: 'mexa',
      texto: 'Os comprimidos mais leves que a média têm desvio negativo.',
      visual: dados({ ...A, desvios: true }, 'Os desvios do lote A.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no comprimido de desvio −1.',
        sucesso: { valor: 499 },
        mostre: 'O comprimido de 499 mg acende: 1 mg abaixo da média.',
      },
      descoberta: 'O desvio −1 é o de 499 mg: 499 − 500 = −1.',
      esboco: 'Ler um desvio no desenho. Tocar o 501 (desvio +1) erra o lado.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora some todos os desvios: $(-1) + (+3) + 0 + (-3) + (+1)$. Quanto dá?',
      fala: 'Agora some todos os desvios: menos um, mais três, zero, menos três e mais um. Quanto dá?',
      visual: dados({ ...A, desvios: true }, 'Os cinco desvios do lote A.'),
      opcoes: [
        {
          texto: '0', certa: true,
          explica: 'Isso. Os de cima e os de baixo se cancelam. A média é o equilíbrio: a soma dá 0 em qualquer lote.',
          mostra: dados({ ...A, desvios: true, somaDesvios: true }, 'Embaixo, a soma escrita: (−1) + (+3) + (0) + (−3) + (+1) = 0.'),
        },
        {
          texto: '8', erro: 'soma-desvios-sem-sinal',
          explica: '8 é a soma sem os sinais. Com eles, os de baixo cancelam os de cima, e a soma dá 0.',
          fala: 'Oito é a soma sem os sinais. Com eles, os de baixo cancelam os de cima, e a soma dá zero.',
          mostra: dados({ ...A, desvios: true, somaDesvios: true }, 'A soma escrita embaixo: dá 0.'),
        },
      ],
      esboco: 'O momento-chave. A soma dos desvios dá 0 sempre: somar desvios não mede o espalhamento.',
    },
    {
      tipo: 'ideia',
      texto: 'Se a soma dá sempre 0, ela não mede nada. É preciso tirar o sinal e olhar só a **distância** até a média.',
      visual: dados({ ...A, distancias: true }, 'Os segmentos perdem a cor do sinal e ficam todos lilás: 1, 3, 0, 3, 1. Embaixo, "distância média: 1,6".'),
      esboco: 'A distância sem sinal: 8 ÷ 5 = 1,6 mg. Prepara o quadrado, o outro jeito de tirar o sinal.',
    },
    {
      tipo: 'passo',
      problema: 'O jeito mais usado de tirar o sinal é elevar ao quadrado. Assim nasce o **desvio padrão** do lote A.',
      visual: dados({ ...A, desvios: true }, 'Os desvios do lote A, com o sinal.'),
      passos: [
        {
          pergunta: 'Os desvios são −1, +3, 0, −3 e +1. Quanto dá cada um ao quadrado?',
          fala: 'Os desvios são menos um, mais três, zero, menos três e mais um. Quanto dá cada um ao quadrado?',
          opcoes: [
            {
              texto: '1, 9, 0, 9 e 1', certa: true,
              explica: 'Isso. $(-3)^2 = (-3) \\cdot (-3) = 9$: o quadrado nunca é negativo.',
              fala: 'Isso. Menos três ao quadrado é menos três vezes menos três, nove: o quadrado nunca é negativo.',
              mostra: dados({ ...A, distancias: true, rotulo: 'quadrados: 1, 9, 0, 9, 1' }, 'Os segmentos sem sinal; embaixo, "quadrados: 1, 9, 0, 9, 1".'),
            },
            {
              texto: '1, 9, 0, −9 e 1', erro: 'potencia-sinal-fora-dos-parenteses',
              explica: '$(-3)^2 = (-3) \\cdot (-3) = 9$. Menos com menos dá mais: o quadrado nunca é negativo.',
              fala: 'Menos três ao quadrado é menos três vezes menos três, nove. Menos com menos dá mais: o quadrado nunca é negativo.',
            },
          ],
          linha: { tex: '\\text{quadrados: } 1,\\ 9,\\ 0,\\ 9,\\ 1', fala: 'os quadrados: um, nove, zero, nove, um' },
        },
        {
          pergunta: 'Qual é a média dos quadrados?',
          opcoes: [
            {
              texto: '$20 \\div 5 = 4$', certa: true,
              explica: 'Isso. 1 + 9 + 0 + 9 + 1 = 20, para 5 comprimidos.',
              fala: 'Isso. Um mais nove mais zero mais nove mais um, vinte, para cinco comprimidos.',
              mostra: dados({ ...A, distancias: true, rotulo: '20 ÷ 5 = 4' }, 'Embaixo, "20 ÷ 5 = 4".'),
            },
            {
              texto: '$20 \\div 4 = 5$', erro: 'media-esquece-valores',
              explica: 'O comprimido de 500 mg também conta, mesmo com desvio 0. São 5: 20 ÷ 5 = 4.',
              fala: 'O comprimido de quinhentos miligramas também conta, mesmo com desvio zero. São cinco: vinte dividido por cinco, quatro.',
            },
          ],
          linha: { tex: '(1 + 9 + 0 + 9 + 1) \\div 5 = 20 \\div 5 = 4', fala: 'um mais nove mais zero mais nove mais um, dividido por cinco: vinte dividido por cinco, quatro' },
        },
        {
          pergunta: 'O 4 está ao quadrado. Como voltar para miligramas?',
          opcoes: [
            {
              texto: '$\\sqrt{4} = 2$ mg', certa: true,
              explica: 'Isso. O desvio padrão do lote A é 2 mg: o afastamento típico até a média.',
              fala: 'Isso. O desvio padrão do lote A é dois miligramas: o afastamento típico até a média.',
              mostra: dados({ ...A, media: true, faixa: true }, 'A faixa azul de 498 a 502 mg, com "média ± desvio: 500 ± 2".'),
            },
            {
              texto: '4 mg, sem raiz', erro: 'desvio-padrao-sem-a-raiz',
              explica: 'Os desvios eram de 1 e de 3 mg: o típico não pode ser 4. A raiz desfaz o quadrado: $\\sqrt{4} = 2$.',
              fala: 'Os desvios eram de um e de três miligramas: o típico não pode ser quatro. A raiz desfaz o quadrado: raiz de quatro, dois.',
            },
          ],
          linha: { tex: '\\sqrt{4} = 2 \\text{ mg}', fala: 'raiz de quatro, dois miligramas' },
        },
      ],
      esboco: 'A conta do desvio padrão, com números pequenos: quadrado, média, raiz. A raiz da unidade 13 volta aqui.',
    },
    {
      tipo: 'anote',
      titulo: 'Desvio padrão',
      definicao: 'O **desvio padrão** mede o afastamento típico até a média: é a raiz da média dos quadrados dos desvios.',
      exemplo: { tex: '\\sqrt{(1 + 9 + 0 + 9 + 1) \\div 5} = \\sqrt{4} = 2', fala: 'raiz de um mais nove mais zero mais nove mais um, dividido por cinco: raiz de quatro, dois' },
      alerta: 'Os desvios somam 0, por isso se usa o quadrado. No fim, não esqueça a raiz.',
      esboco: 'Na página: o lote A com os segmentos dos desvios, a soma que dá 0 e a conta do quadrado à raiz.',
    },
    {
      tipo: 'ideia',
      texto: 'Média ± desvio padrão: $500 \\pm 2$, de 498 a 502 mg. É a faixa do comprimido típico do lote A.',
      fala: 'Média mais ou menos o desvio padrão: quinhentos mais ou menos dois, de quatrocentos e noventa e oito a quinhentos e dois miligramas. É a faixa do comprimido típico do lote A.',
      visual: dados({ ...A, media: true, faixa: true }, 'A faixa azul de 498 a 502 mg sobre a reta: o 499, o 500 e o 501 ficam dentro.'),
      esboco: 'O que o desvio padrão quer dizer na reta: uma faixa em volta da média.',
    },
    {
      tipo: 'aposta',
      pergunta: 'No lote B, os desvios são −3, +9, 0, −9 e +3. Os quadrados somam 180. Qual é o desvio padrão?',
      fala: 'No lote B, os desvios são menos três, mais nove, zero, menos nove e mais três. Os quadrados somam cento e oitenta. Qual é o desvio padrão?',
      visual: dados({ ...LOTES, media: true }, 'Os dois lotes de novo, com a média no 500.'),
      opcoes: [
        {
          texto: '$\\sqrt{180 \\div 5} = \\sqrt{36} = 6$ mg', certa: true,
          explica: 'Isso. O afastamento típico do B é 6 mg, o triplo do A.',
          fala: 'Isso. Raiz de cento e oitenta dividido por cinco, raiz de trinta e seis, seis miligramas: o triplo do lote A.',
          mostra: dados({ ...LOTES, media: true, faixa: true }, 'As duas faixas: 500 ± 2 no A, estreita; 500 ± 6 no B, três vezes mais larga.'),
        },
        {
          texto: '36 mg', erro: 'desvio-padrao-sem-a-raiz',
          explica: '36 ainda está ao quadrado: nenhum comprimido se afasta tanto. A raiz desfaz: $\\sqrt{36} = 6$ mg.',
          fala: 'Trinta e seis ainda está ao quadrado: nenhum comprimido se afasta tanto. A raiz desfaz: raiz de trinta e seis, seis miligramas.',
          mostra: dados({ ...LOTES, media: true, faixa: true }, 'As duas faixas: 500 ± 2 e 500 ± 6.'),
        },
        {
          texto: '18 mg', erro: 'raiz-e-a-metade',
          explica: '18 é a metade de 36. A raiz é o número que vezes ele mesmo dá 36: $6 \\cdot 6 = 36$.',
          fala: 'Dezoito é a metade de trinta e seis. A raiz é o número que vezes ele mesmo dá trinta e seis: seis vezes seis.',
          mostra: dados({ ...LOTES, media: true, faixa: true }, 'As duas faixas: 500 ± 2 e 500 ± 6.'),
        },
      ],
      esboco: 'O lote B, sem refazer tudo: os quadrados já somados. As faixas aparecem com a escolha.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A fábrica só aprova lote com desvio padrão de até 3 mg. Qual lote passou no controle?',
      fala: 'A fábrica só aprova lote com desvio padrão de até três miligramas. Qual lote passou no controle?',
      visual: dados({ ...LOTES, media: true, faixa: true }, 'As duas faixas, uma embaixo da outra.'),
      opcoes: [
        {
          texto: 'Só o A, com 2 mg. O B, com 6 mg, reprovou', certa: true,
          explica: 'Isso. A média dos dois é 500 mg, mas o B se espalha demais: o desvio padrão mostrou o que a média escondia.',
          mostra: dados({ ...LOTES, media: true, faixa: true, rotulo: 'A: 2 mg, passou. B: 6 mg, reprovou.' }, 'As faixas e, embaixo, "A: 2 mg, passou. B: 6 mg, reprovou.".'),
        },
        {
          texto: 'Os dois: a média é 500 mg', erro: 'usa-sempre-a-media',
          explica: 'A média certa não basta. O B tem desvio padrão de 6 mg, o dobro do que a fábrica aceita.',
          fala: 'A média certa não basta. O B tem desvio padrão de seis miligramas, o dobro do que a fábrica aceita.',
          mostra: dados({ ...LOTES, media: true, faixa: true, rotulo: 'A: 2 mg, passou. B: 6 mg, reprovou.' }, 'As faixas: a do B passa da regra.'),
        },
      ],
      esboco: 'A missão da unidade respondida: o lote passou no controle?',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: 5 garrafas de 500 mL têm 494, 498, 500, 502 e 506 mL. A média é 500 mL. Qual é o desvio padrão, em mL?',
      fala: 'No papel: cinco garrafas de quinhentos mililitros têm quatrocentos e noventa e quatro, quatrocentos e noventa e oito, quinhentos, quinhentos e dois e quinhentos e seis mililitros. A média é quinhentos. Qual é o desvio padrão, em mililitros?',
      resposta: 4,
      resolucao: [
        { tex: '\\text{desvios: } -6,\\ -2,\\ 0,\\ +2,\\ +6', fala: 'os desvios: menos seis, menos dois, zero, mais dois, mais seis' },
        { tex: '\\text{quadrados: } 36,\\ 4,\\ 0,\\ 4,\\ 36', fala: 'os quadrados: trinta e seis, quatro, zero, quatro, trinta e seis' },
        { tex: '(36 + 4 + 0 + 4 + 36) \\div 5 = 80 \\div 5 = 16', fala: 'oitenta dividido por cinco, dezesseis' },
        { tex: '\\sqrt{16} = 4 \\text{ mL}', fala: 'raiz de dezesseis, quatro mililitros' },
      ],
      esboco: 'A conta inteira, sozinho, com outro produto da fábrica.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['desvio-padrao-n1', 'desvio-padrao-n2', 'desvio-padrao-n3'],
      esboco: 'Nível 1: o desvio de um valor e a soma dos desvios, no gráfico de pontos. Nível 2: o desvio padrão a partir dos desvios. Nível 3: o desvio padrão a partir dos valores, e se o lote passou no controle.',
    },
    {
      tipo: 'fecho',
      texto: 'Os dois lotes tinham média de 500 mg. O desvio padrão mostrou a diferença: 2 mg no A, 6 mg no B. Na próxima aula: contagem.',
      fala: 'Os dois lotes tinham média de quinhentos miligramas. O desvio padrão mostrou a diferença: dois no A, seis no B. Na próxima aula: contagem.',
      visual: dados({ ...LOTES, media: true, faixa: true }, 'As duas faixas, a estreita e a larga.'),
      esboco: 'Responde ao gancho com o número que a média escondia.',
    },
  ],
}
