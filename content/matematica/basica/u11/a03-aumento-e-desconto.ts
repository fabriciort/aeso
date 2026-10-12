import type { Aula, Visual } from '@/lib/formation/schema'

// Aumento e desconto numa conta só: multiplicar por um fator. A barra é o
// preço (100 %) em 10 partes de 10 %. Um desconto de 10 % tira uma parte:
// sobram 9, 90 % do preço, o preço × 0,9. Um aumento de 10 % põe uma parte
// a mais: 11 partes, 110 %, o preço × 1,1. A conta com decimais é a da
// unidade 8 (multiplicar). Os erros a desmontar: dar o desconto como preço
// (desconto-como-preco-final, também o × 0,1), multiplicar por 0,1 para
// aumentar (fator-de-aumento-sem-o-um), tirar 10 reais no lugar de 10 %
// (porcentagem-como-numero-inteiro) e 8 % como 0,8 (esquece-zero-decimal).

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const tabela = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })

const ALUGUEL = (reais: (number | string)[]) => [
  { rotulo: 'porcentagem (%)', valores: [100, 108] },
  { rotulo: 'aluguel (R$)', valores: reais },
]
const X108 = [{ de: 0, para: 1, rotulo: '× 1,08' }, { de: 0, para: 1, rotulo: '× 1,08', embaixo: true }]
/** Depois de uma escolha errada no fator: a mesma seta × 1,08 em cima e embaixo. */
const FATOR = tabela({ linhas: ALUGUEL([1500, '?']), setas: X108 }, 'A tabela do aluguel com as setas "× 1,08" em cima (100 % → 108 %) e embaixo (R$ 1.500 → ?).')

export const aula: Aula = {
  id: 'B.U11.A3',
  titulo: 'Aumento e desconto',
  objetivo: 'Achar o valor depois de um desconto ou de um aumento numa conta só, multiplicando pelo fator: o que sobra (× 0,9 para 10 % de desconto) ou o que fica com o acréscimo (× 1,1 para 10 % de aumento).',
  modelo: 'barra',
  esboco: 'A camisa de R$ 60 com 10 % de desconto. A barra do preço em 10 partes de 10 %; o aluno pinta as que ainda paga: 9. Momento-chave: as 9 partes pintadas são 90 % do preço, e 90 % é 0,9: o preço × 0,9, numa conta só. Depois a conta de luz que sobe 10 %: o aluno pinta as 10 partes e mais uma, 110 %, × 1,1. O fator generaliza: 30 % OFF é × 0,7; um aumento de 8 % é × 1,08.',
  vega: 'Ideia central: depois de um desconto de p %, você paga (100 − p) % do preço; depois de um aumento de p %, o valor vira (100 + p) % do antigo. Escrito em decimal, isso é o fator: 10 % de desconto é × 0,9; 10 % de aumento é × 1,1; 30 % de desconto é × 0,7; 8 % de aumento é × 1,08. É uma conta só, no lugar de duas (achar o desconto e subtrair). A multiplicação com decimais é a da unidade 8. Erros esperados: dar o desconto como preço final (R$ 6 em vez de R$ 54; ou × 0,1 em vez de × 0,9); multiplicar por 0,1 para aumentar 10 % (dá só o aumento); tirar 10 reais no lugar de 10 %; escrever 8 % como 0,8 (o fator 1,8 quase dobra o preço). Guie com "Quantas partes você ainda paga?", "Quanto por cento sobra?", "Depois de um aumento, o valor tem de ser maior ou menor?". Os dois caminhos dão o mesmo resultado; o fator é o atalho que a próxima aula e as variações sucessivas vão usar.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A camisa custa **R$ 60** e está com **10 % de desconto**. Quanto você paga no caixa?',
      fala: 'A camisa custa sessenta reais e está com dez por cento de desconto. Quanto você paga no caixa?',
      visual: barra({ partes: 1, pintadas: 1, rotulo: 'R$ 60' }, 'Uma barra inteira em âmbar, com "R$ 60" à direita: o preço cheio.'),
      esboco: 'O aluno já sabe achar 10 % (aula anterior). A pergunta é o que fazer com ele, e se dá para fazer numa conta só.',
    },
    {
      tipo: 'mexa',
      texto: 'A barra é o preço: **100 %**, em 10 partes de 10 %. O desconto tira uma. Pinte as partes que você **ainda paga**.',
      fala: 'A barra é o preço: cem por cento, em dez partes de dez por cento. O desconto tira uma. Pinte as partes que você ainda paga.',
      visual: barra({ partes: 10, pintadas: 0, pintar: true, semFracao: true }, 'A barra do preço em 10 partes, todas apagadas, com a borda tracejada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas partes até pintar o que você paga.',
        sucesso: { pintadas: 9 },
        mostre: 'Nove das 10 partes se pintam; a última, o desconto, fica apagada.',
      },
      descoberta: 'Com 10 % de desconto, você paga 9 das 10 partes: 90 % do preço.',
      esboco: 'O gesto é o de ficar com o que sobra. A parte apagada é o desconto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Cada parte vale **R$ 6**. Quanto você paga pelas 9?',
      fala: 'Cada parte vale seis reais. Quanto você paga pelas nove?',
      visual: barra({ partes: 10, pintadas: 9, semFracao: true }, 'A barra com 9 partes em âmbar e a última apagada.'),
      opcoes: [
        {
          texto: 'R$ 54', fala: 'Cinquenta e quatro reais.', certa: true,
          explica: 'Isso. $9 \\times 6 = 54$, o mesmo que $60 - 6$. Você paga 90 % do preço.',
          mostra: barra({ partes: 10, pintadas: 9, rotulo: 'R$ 54' }, 'À direita da barra aparece "R$ 54".'),
        },
        {
          texto: 'R$ 6', fala: 'Seis reais.', erro: 'desconto-como-preco-final',
          explica: 'R$ 6 é a parte apagada: o que sai do preço. Você paga as 9 pintadas: R$ 54.',
          mostra: barra({ partes: 10, pintadas: 9, rotulo: 'R$ 54' }, 'As 9 partes em âmbar, com "R$ 54" à direita.'),
        },
        {
          texto: 'R$ 50', fala: 'Cinquenta reais.', erro: 'porcentagem-como-numero-inteiro',
          explica: 'Assim saíram R$ 10. Mas 10 % de R$ 60 é uma parte só, R$ 6: você paga R$ 54.',
          mostra: barra({ partes: 10, pintadas: 9, rotulo: 'R$ 54' }, 'Só uma parte apagada, de R$ 6.'),
        },
      ],
      esboco: 'Responde ao gancho pelo caminho conhecido. A próxima aposta mostra a conta só.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Pagar **90 %** do preço é o preço vezes quanto?',
      fala: 'Pagar noventa por cento do preço é o preço vezes quanto?',
      visual: barra({ partes: 10, pintadas: 9, rotulo: '90 %' }, 'A barra com 9 partes em âmbar e "90 %" à direita.'),
      opcoes: [
        {
          texto: '× 0,9', fala: 'Vezes zero vírgula nove.', certa: true,
          explica: 'Isso. 90 % = 0,9. Então $60 \\times 0{,}9 = 54$: o preço final numa conta só.',
          mostra: barra({ partes: 10, pintadas: 9, rotulo: '× 0,9' }, 'À direita, "90 %" vira "× 0,9".'),
        },
        {
          texto: '× 0,1', fala: 'Vezes zero vírgula um.', erro: 'desconto-como-preco-final',
          explica: '$60 \\times 0{,}1 = 6$ é a parte apagada, o desconto. O que você paga é 90 %: × 0,9.',
          mostra: barra({ partes: 10, pintadas: 9, rotulo: '× 0,9' }, 'As 9 partes pintadas, com "× 0,9" à direita.'),
        },
        {
          texto: '× 90', fala: 'Vezes noventa.', erro: 'porcentagem-como-numero-inteiro',
          explica: '$60 \\times 90 = 5.400$: muito mais que a camisa. 90 % é 0,9, menos que 1 inteiro.',
          mostra: barra({ partes: 10, pintadas: 9, rotulo: '× 0,9' }, 'A barra com 9 de 10 partes: menos que o preço inteiro.'),
        },
      ],
      esboco: 'O momento-chave: 90 % do preço é o preço × 0,9. Vezes um número menor que 1 diminui (unidade 8).',
    },
    {
      tipo: 'mexa',
      texto: 'A conta de luz era **R$ 120** e subiu **10 %**. Pinte o valor novo: as 10 partes e mais uma.',
      fala: 'A conta de luz era cento e vinte reais e subiu dez por cento. Pinte o valor novo: as dez partes e mais uma.',
      visual: barra({ partes: 10, inteiros: 2, pintadas: 0, pintar: true, semFracao: true }, 'Duas barras de 10 partes lado a lado, apagadas: espaço para passar de 100 %.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas partes até pintar a conta nova.',
        sucesso: { pintadas: 11 },
        mostre: 'A primeira barra se pinta inteira e mais uma parte da segunda: 11 partes.',
      },
      descoberta: 'Depois do aumento, a conta tem 11 partes de 10 %: 110 % da conta antiga.',
      esboco: 'O aumento passa do inteiro. A parte a mais, na segunda barra, é o aumento.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Pagar **110 %** da conta antiga é vezes quanto?',
      fala: 'Pagar cento e dez por cento da conta antiga é vezes quanto?',
      visual: barra({ partes: 10, inteiros: 2, pintadas: 11, rotulo: '110 %' }, 'Uma barra cheia e uma parte da segunda em âmbar, com "110 %" à direita.'),
      opcoes: [
        {
          texto: '× 1,1', fala: 'Vezes um vírgula um.', certa: true,
          explica: 'Isso. 110 % = 1,1. $120 \\times 1{,}1 = 132$: os R$ 120 e mais R$ 12.',
          mostra: barra({ partes: 10, inteiros: 2, pintadas: 11, rotulo: 'R$ 132' }, 'À direita, "110 %" vira "R$ 132".'),
        },
        {
          texto: '× 0,1', fala: 'Vezes zero vírgula um.', erro: 'fator-de-aumento-sem-o-um',
          explica: '$120 \\times 0{,}1 = 12$ é só a parte a mais. A conta nova é a antiga e mais ela: × 1,1.',
          mostra: barra({ partes: 10, inteiros: 2, pintadas: 11, rotulo: 'R$ 132' }, 'As 11 partes pintadas: a conta antiga inteira e mais uma parte.'),
        },
        {
          texto: '× 1,01', fala: 'Vezes um vírgula zero um.', erro: 'troca-10-e-1-por-cento',
          explica: '1,01 é 101 %: um aumento de só 1 %. 10 % a mais é 110 %, × 1,1.',
          mostra: barra({ partes: 10, inteiros: 2, pintadas: 11, rotulo: '× 1,1' }, 'A parte a mais é uma parte de 10, não de 100: × 1,1.'),
        },
      ],
      esboco: 'O fator do aumento é maior que 1: o inteiro e mais o aumento.',
    },
    {
      tipo: 'anote',
      titulo: 'Aumento e desconto',
      definicao: 'Desconto de 10 %: você paga **90 %**, o preço **× 0,9**. Aumento de 10 %: fica **110 %**, o preço **× 1,1**.',
      exemplo: { tex: '\\text{R\\$}\\,60 \\times 0{,}9 = \\text{R\\$}\\,54 \\qquad \\text{R\\$}\\,120 \\times 1{,}1 = \\text{R\\$}\\,132', fala: 'sessenta reais vezes zero vírgula nove dá cinquenta e quatro; cento e vinte vezes um vírgula um dá cento e trinta e dois' },
      alerta: '× 0,1 dá só o desconto (ou só o aumento). O fator do desconto é menor que 1; o do aumento, maior que 1.',
      esboco: 'Na página: a barra com 9 partes pintadas (× 0,9) e a barra com 11 (× 1,1).',
    },
    {
      tipo: 'aposta',
      pergunta: 'A placa diz **30 % OFF** num tênis de **R$ 200**. Que conta dá o preço final?',
      fala: 'A placa diz trinta por cento de desconto num tênis de duzentos reais. Que conta dá o preço final?',
      visual: barra({ partes: 10, pintadas: 10, rotulo: 'R$ 200' }, 'A barra do tênis em 10 partes, todas em âmbar, com "R$ 200" à direita.'),
      opcoes: [
        {
          texto: '$200 \\times 0{,}7$', fala: 'duzentos vezes zero vírgula sete', certa: true,
          explica: 'Isso. Tirar 30 % deixa 70 %: $200 \\times 0{,}7 = 140$. O tênis sai por R$ 140.',
          mostra: barra({ partes: 10, pintadas: 7, rotulo: 'R$ 140' }, 'Três partes se apagam; 7 ficam em âmbar, com "R$ 140" à direita.'),
        },
        {
          texto: '$200 \\times 0{,}3$', fala: 'duzentos vezes zero vírgula três', erro: 'desconto-como-preco-final',
          explica: '$200 \\times 0{,}3 = 60$ é o desconto, as 3 partes que saem. Você paga as 7 que ficam: × 0,7.',
          mostra: barra({ partes: 10, pintadas: 7, rotulo: 'R$ 140' }, 'As 3 partes do desconto se apagam; 7 ficam: R$ 140.'),
        },
        {
          texto: '$200 \\times 1{,}3$', fala: 'duzentos vezes um vírgula três',
          explica: '× 1,3 aumenta o preço 30 %: R$ 260. Num desconto, o fator é menor que 1: × 0,7.',
          mostra: barra({ partes: 10, pintadas: 7, rotulo: 'R$ 140' }, 'As 7 partes que ficam: R$ 140, menos que o preço cheio.'),
        },
      ],
      esboco: 'O fator para qualquer desconto: o que sobra, em decimal.',
    },
    {
      tipo: 'passo',
      problema: 'O aluguel de **R$ 1.500** vai subir **8 %**. Qual será o aluguel novo?',
      fala: 'O aluguel de mil e quinhentos reais vai subir oito por cento. Qual será o aluguel novo?',
      visual: tabela({ linhas: ALUGUEL([1500, '?']) }, 'A tabela: 100 % e R$ 1.500; 108 % e "?". Sem setas.'),
      passos: [
        {
          pergunta: 'O aluguel novo é **108 %** do antigo. Qual é o fator?',
          fala: 'O aluguel novo é cento e oito por cento do antigo. Qual é o fator?',
          opcoes: [
            { texto: '× 1,08', fala: 'vezes um vírgula zero oito', certa: true, explica: 'Isso. 108 % = 1,08: o inteiro e mais 8 centésimos.' },
            { texto: '× 1,8', fala: 'vezes um vírgula oito', erro: 'esquece-zero-decimal', explica: '1,8 é 180 %: quase dobra o aluguel. 8 % são 0,08, com o zero: × 1,08.', mostra: FATOR },
            { texto: '× 0,08', fala: 'vezes zero vírgula zero oito', erro: 'fator-de-aumento-sem-o-um', explica: '× 0,08 dá só o aumento. O aluguel novo é o antigo e mais ele: × 1,08.', mostra: FATOR },
          ],
          linha: { tex: '108\\,\\% = 1{,}08', fala: 'cento e oito por cento é um vírgula zero oito' },
        },
        {
          pergunta: 'Quanto é $1.500 \\times 1{,}08$?',
          fala: 'Quanto é mil e quinhentos vezes um vírgula zero oito?',
          opcoes: [
            { texto: 'R$ 1.620', fala: 'mil seiscentos e vinte reais', certa: true, explica: 'Isso. $1.500 \\times 1 = 1.500$ e $1.500 \\times 0{,}08 = 120$: R$ 1.620.' },
            { texto: 'R$ 120', fala: 'cento e vinte reais', erro: 'fator-de-aumento-sem-o-um', explica: 'R$ 120 é só o aumento, $1.500 \\times 0{,}08$. O aluguel novo é $1.500 + 120$.' },
            { texto: 'R$ 1.508', fala: 'mil quinhentos e oito reais', erro: 'porcentagem-como-numero-inteiro', explica: 'Subiu R$ 8, não 8 %. 8 % de R$ 1.500 são R$ 120: o aluguel vai a R$ 1.620.' },
          ],
          linha: { tex: '1.500 \\times 1{,}08 = 1.620', fala: 'mil e quinhentos vezes um vírgula zero oito dá mil seiscentos e vinte' },
        },
      ],
      esboco: 'A tabela da unidade 10: de 100 % a 108 % é × 1,08, e o aluguel anda junto. Uma escolha errada no fator mostra as setas × 1,08 em cima e embaixo. A conta se faz em duas partes: × 1 e × 0,08.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um celular de **R$ 850** está com **20 % de desconto**. Quanto você paga, em reais?',
      fala: 'No papel: um celular de oitocentos e cinquenta reais está com vinte por cento de desconto. Quanto você paga, em reais?',
      resposta: 680,
      resolucao: [
        { tex: '100\\,\\% - 20\\,\\% = 80\\,\\% = 0{,}8', fala: 'cem por cento menos vinte por cento: oitenta por cento, zero vírgula oito' },
        { tex: '850 \\times 0{,}8 = 680', fala: 'oitocentos e cinquenta vezes zero vírgula oito dá seiscentos e oitenta' },
        { tex: '\\text{confira: } 20\\,\\% \\text{ de } 850 = 170;\\ 850 - 170 = 680', fala: 'confira: vinte por cento de oitocentos e cinquenta são cento e setenta; oitocentos e cinquenta menos cento e setenta dá seiscentos e oitenta' },
      ],
      esboco: 'Os dois caminhos dão o mesmo: o fator numa conta só, ou o desconto e a subtração.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['aumento-desconto-n1', 'aumento-desconto-n2', 'aumento-desconto-n3'],
      esboco: 'Nível 1: 10 % de desconto ou de aumento num valor redondo, com a barra. Nível 2: escolher o fator de um desconto ou aumento qualquer (× 0,85, × 1,05). Nível 3: o preço final numa situação, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'A camisa sai por **R$ 54**: $60 \\times 0{,}9$, numa conta só. Na próxima aula: que porcentagem um valor é do outro.',
      fala: 'A camisa sai por cinquenta e quatro reais: sessenta vezes zero vírgula nove, numa conta só. Na próxima aula: que porcentagem um valor é do outro.',
      visual: barra({ partes: 10, pintadas: 9, rotulo: 'R$ 54' }, 'A barra do gancho em 10 partes, 9 em âmbar, com "R$ 54" à direita.'),
      esboco: 'Responde ao gancho com o fator.',
    },
  ],
}
