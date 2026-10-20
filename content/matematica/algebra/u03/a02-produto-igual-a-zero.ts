import type { Aula, Visual } from '@/lib/formation/schema'

// Produto igual a zero. Um item da nota saiu por R$ 0: preço vezes
// quantidade. Sem ver, você sabe que um dos dois é zero. 3 · □ = 0 só com
// □ = 0. O momento-chave é o Mexa "zerar": o aluno troca o x em
// (x − 2)(x + 3) e vê o produto zerar só em 2 e em −3, quando um dos fatores
// zera. A regra: iguale cada fator a zero. O erro de ler o número do fator
// com o sinal dele ((x + 4)(x − 1) com raízes 4 e −1) e o contraste: em
// (x − 2)(x + 3) = 6, nenhum fator precisa dar 6. Depois, um fator com
// coeficiente: (2x − 6)(x + 4) = 0.

const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })
const pz = (produtoZero: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { produtoZero }, esboco })

const VALORES = [-4, -3, -1, 0, 1, 2, 3]
const TABELA = pz({ fatores: [-2, 3], valores: VALORES }, 'A tabela de (x − 2)(x + 3): em cima o produto, embaixo um botão para cada x de −4 a 3. As colunas ainda vazias.')
const TABELA_CHEIA = pz({ fatores: [-2, 3], valores: VALORES, marcados: VALORES, x: -3 }, 'A tabela inteira: só as colunas do 2 e do −3 têm um fator âmbar e o produto 0 com moldura. Embaixo, (−3 − 2) · (−3 + 3) = (−5) · 0 = 0.')
const OITO = expr(['(x − 2)(x + 3) = 6', 'x = 8: (8 − 2) · (8 + 3)', '= 6 · 11 = 66'], 'A conta do 8: (8 − 2)(8 + 3) = 6 · 11 = 66, longe do 6.')

const DUPLO = '(2x − 6)(x + 4) = 0'

export const aula: Aula = {
  id: 'AF.U3.A2',
  titulo: 'Produto igual a zero',
  objetivo: 'Saber que um produto só dá zero quando um dos fatores é zero, e resolver equações como (x − 2)(x + 3) = 0 e (2x − 6)(x + 4) = 0 igualando cada fator a zero, com o sinal certo, e conferindo.',
  modelo: 'livre',
  esboco: 'Abre na nota de compras: um item por R$ 0, preço vezes quantidade. A aposta 3 · □ = 0 mostra que só o 0 zera um produto (o −3 zera uma soma). Momento-chave: o Mexa "zerar", em que o aluno troca o x em (x − 2)(x + 3) e vê o produto zerar só em 2 e em −3, cada vez com um fator âmbar. A aposta com (x + 4)(x − 1) desmonta o erro de copiar o número do fator com o sinal. O anote dá a regra, e a aposta seguinte mostra que ela só vale com zero do outro lado: em (x − 2)(x + 3) = 6, o 8 dá 66. O passo a passo resolve (2x − 6)(x + 4) = 0.',
  vega: 'Ideia central: se a · b = 0, então a = 0 ou b = 0. Nenhum outro número zera um produto: qualquer número vezes um número diferente de zero dá diferente de zero. Por isso uma equação do tipo (x − 2)(x + 3) = 0 se resolve fator por fator: x − 2 = 0 dá x = 2; x + 3 = 0 dá x = −3. A raiz tem o sinal contrário do número escrito no fator (x − 2 zera em 2). A regra só vale com zero: se o produto dá 6, os fatores podem ser 1 e 6, 2 e 3, 0,5 e 12… e não dá para separar. Erros esperados: achar que o −3 zera 3 · □ (pensa numa soma); copiar o número do fator com o sinal (raízes −2 e 3); querer os dois fatores zero ao mesmo tempo; separar um produto igual a 6 em x − 2 = 6 ou x + 3 = 6; em 2x − 6 = 0, responder 6 (esquece de dividir por 2). Guie com "Que número, posto no lugar do x, deixa esse fator zero?", "Ponha o número e faça a conta", "E se o produto der 6, quem precisa ser 6?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na nota do mercado, um item saiu por **R$ 0**. Foi preço vezes quantidade. Sem ver a nota, o que você pode dizer?',
      fala: 'Na nota do mercado, um item saiu por zero real. Foi preço vezes quantidade. Sem ver a nota, o que você pode dizer?',
      visual: expr(['preço · quantidade = R$ 0'], 'A conta da nota, grande: preço · quantidade = R$ 0.'),
      esboco: 'Ou o preço é zero (um brinde) ou a quantidade é zero (o item não veio). A pergunta abre a regra do produto que zera.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Com números: ${3 \\cdot \\square = 0}$. Que número vai no quadrado?',
      fala: 'Com números: três vezes um número dá zero. Que número é esse?',
      visual: expr(['3 · □ = 0'], 'A conta com o quadrado vazio: 3 · □ = 0.'),
      opcoes: [
        {
          texto: '−3', erro: 'vezes-como-mais',
          explica: 'O −3 zera uma soma: ${3 + (-3) = 0}$. Mas ${3 \\cdot (-3) = -9}$.',
          fala: 'O menos três zera uma soma: três mais menos três é zero. Mas três vezes menos três é menos nove.',
          mostra: expr(['3 + (−3) = 0', '3 · (−3) = −9'], 'As duas contas, uma embaixo da outra: a soma zera, o produto dá −9.'),
        },
        {
          texto: '0', certa: true,
          explica: 'Isso. ${3 \\cdot 0 = 0}$. Qualquer outro número dá 3 vezes ele, e não zero.',
          fala: 'Isso. Três vezes zero é zero. Qualquer outro número dá três vezes ele, e não zero.',
          mostra: expr(['3 · 0 = 0'], 'A conta fechada: 3 · 0 = 0.'),
        },
      ],
      esboco: 'Só o zero zera um produto. O −3 vem de quem pensa na soma.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora com x: o produto ${(x - 2)(x + 3)}$. Para que valores de x ele dá zero?',
      fala: 'Agora com x: o produto x menos dois vezes x mais três. Para que valores de x ele dá zero?',
      visual: TABELA,
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos valores de x. Quais dão produto zero?',
        sucesso: { raizes: [2, -3] },
        mostre: 'Só o 2 e o −3 zeram o produto: em cada um, um dos fatores vira 0.',
      },
      descoberta: 'O produto só dá zero em 2 e em −3. Em 2, x − 2 vira 0; em −3, x + 3 vira 0. Nos outros, os dois fatores são diferentes de zero.',
      esboco: 'O momento-chave: cada toque preenche uma coluna e mostra a conta embaixo. O 1 dá (−1) · 4 = −4; o 2 dá 0 · 5 = 0, com o 0 âmbar. O aluno vê que o zero do produto vem sempre de um fator zero.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Outro produto, sem fazer as contas: que valores de x zeram ${(x + 4)(x - 1)}$?',
      fala: 'Outro produto, sem fazer as contas: que valores de x zeram x mais quatro vezes x menos um?',
      visual: pz({ fatores: [4, -1], valores: [-5, -4, -1, 0, 1, 4] }, 'A tabela de (x + 4)(x − 1), com os botões de −5 a 4 e as colunas vazias.'),
      opcoes: [
        {
          texto: '4 e −1', erro: 'raiz-com-o-sinal-do-fator',
          explica: 'Com x = 4, ${x + 4}$ dá 8, não 0. O fator ${x + 4}$ zera em −4.',
          fala: 'Com x igual a quatro, x mais quatro dá oito, não zero. O fator x mais quatro zera em menos quatro.',
          mostra: pz({ fatores: [4, -1], valores: [-5, -4, -1, 0, 1, 4], marcados: [-1, 4], x: 4 }, 'A tabela de (x + 4)(x − 1) com o 4 e o −1 postos: nenhum dá produto zero. Embaixo, (4 + 4) · (4 − 1) = 8 · 3 = 24.'),
        },
        {
          texto: '−4 e 1', certa: true,
          explica: 'Isso. ${-4 + 4 = 0}$ e ${1 - 1 = 0}$. A raiz tem o sinal contrário do número do fator.',
          fala: 'Isso. Menos quatro mais quatro é zero, e um menos um é zero. A raiz tem o sinal contrário do número do fator.',
          mostra: pz({ fatores: [4, -1], valores: [-5, -4, -1, 0, 1, 4], marcados: [-4, 1], x: -4 }, 'A tabela de (x + 4)(x − 1) com o −4 e o 1 postos: os dois produtos são 0. Embaixo, (−4 + 4) · (−4 − 1) = 0 · (−5) = 0.'),
        },
      ],
      esboco: 'O sinal da raiz é o contrário do sinal escrito no fator. Cada opção põe os seus dois valores na tabela do novo produto.',
    },
    {
      tipo: 'anote',
      titulo: 'Produto igual a zero',
      definicao: 'Se um produto dá **zero**, um dos fatores é zero. Para resolver, iguale **cada fator** a zero.',
      exemplo: { tex: '(x - 2)(x + 3) = 0 \\;\\Rightarrow\\; x = 2 \\text{ ou } x = -3', fala: 'x menos dois vezes x mais três igual a zero: x igual a dois ou x igual a menos três' },
      alerta: 'Só vale com **zero** do outro lado. E a raiz tem o sinal contrário: ${x + 3}$ zera em −3.',
      esboco: 'Na página: a tabela do produto com as colunas do 2 e do −3 em âmbar, e a regra embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${(x - 2)(x + 3) = 6}$? Dá para fazer ${x - 2 = 6}$ e achar x = 8?',
      fala: 'E x menos dois vezes x mais três igual a seis? Dá para fazer x menos dois igual a seis e achar x igual a oito?',
      visual: TABELA_CHEIA,
      opcoes: [
        {
          texto: 'Dá: x = 8', erro: 'separa-produto-diferente-de-zero',
          explica: 'Confira o 8: ${6 \\cdot 11 = 66}$, não 6. Um produto 6 não obriga nenhum fator a ser 6.',
          fala: 'Confira o oito: seis vezes onze, sessenta e seis, não seis. Um produto seis não obriga nenhum fator a ser seis.',
          mostra: OITO,
        },
        {
          texto: 'Não dá: só o zero separa', certa: true,
          explica: 'Isso. O 6 pode ser ${1 \\cdot 6}$, ${2 \\cdot 3}$, ${12 \\cdot 0{,}5}$… Só o zero obriga um fator a ser zero.',
          fala: 'Isso. O seis pode ser um vezes seis, dois vezes três, doze vezes meio… Só o zero obriga um fator a ser zero.',
          mostra: OITO,
        },
      ],
      esboco: 'O contraste que protege a regra: com outro número do lado direito, ela não vale. A conta do 8 mostra o 66.',
    },
    {
      tipo: 'passo',
      problema: 'Um fator com número na frente: resolva ${(2x - 6)(x + 4) = 0}$.',
      fala: 'Um fator com número na frente: resolva dois x menos seis, vezes x mais quatro, igual a zero.',
      visual: expr([DUPLO], 'A equação (2x − 6)(x + 4) = 0, sozinha.'),
      passos: [
        {
          pergunta: 'O produto é zero. O que se pode dizer dos fatores?',
          fala: 'O produto é zero. O que se pode dizer dos fatores?',
          opcoes: [
            { texto: '${2x - 6 = 0}$ **e** ${x + 4 = 0}$', erro: 'produto-zero-exige-os-dois', explica: 'Basta um ser zero: ${0 \\cdot 7 = 0}$. E nenhum x zera os dois ao mesmo tempo.', fala: 'Basta um ser zero: zero vezes sete é zero. E nenhum x zera os dois ao mesmo tempo.', mostra: expr([DUPLO, '0 · 7 = 0'], 'Embaixo: 0 · 7 = 0, um fator zero basta.') },
            { texto: '${2x - 6 = 0}$ **ou** ${x + 4 = 0}$', certa: true, explica: 'Isso. Um deles é zero. Agora resolva cada um.', fala: 'Isso. Um deles é zero. Agora resolva cada um.', mostra: expr([DUPLO, '2x − 6 = 0 ou x + 4 = 0'], 'Embaixo: 2x − 6 = 0 ou x + 4 = 0.') },
          ],
          linha: { tex: '2x - 6 = 0 \\;\\text{ ou }\\; x + 4 = 0', fala: 'dois x menos seis igual a zero, ou x mais quatro igual a zero' },
        },
        {
          pergunta: 'Se ${2x - 6 = 0}$, quanto vale x?',
          fala: 'Se dois x menos seis é zero, quanto vale x?',
          opcoes: [
            { texto: '6', erro: 'esquece-de-dividir', explica: 'Com 6, ${2 \\cdot 6 - 6 = 6}$. De ${2x = 6}$, falta dividir por 2.', fala: 'Com seis, dois vezes seis menos seis dá seis. De dois x igual a seis, falta dividir por dois.', mostra: expr([DUPLO, '2x = 6'], 'Embaixo: 2x = 6, ainda não é x.') },
            { texto: '3', certa: true, explica: 'Isso. ${2x = 6}$ e ${x = 3}$. Confere: ${2 \\cdot 3 - 6 = 0}$.', fala: 'Isso. Dois x igual a seis, e x igual a três. Confere: dois vezes três menos seis é zero.', mostra: expr([DUPLO, '2x = 6', 'x = 3'], 'Embaixo: 2x = 6 e x = 3.') },
            { texto: '−6', erro: 'raiz-com-o-sinal-do-fator', explica: 'O −6 é o número do fator. Com x = −6, ${2 \\cdot (-6) - 6 = -18}$.', fala: 'O menos seis é o número do fator. Com x igual a menos seis, dois vezes menos seis menos seis dá menos dezoito.', mostra: expr([DUPLO, '2 · (−6) − 6 = −18'], 'Embaixo: 2 · (−6) − 6 = −18.') },
          ],
          linha: { tex: 'x = 3', fala: 'x igual a três' },
        },
        {
          pergunta: 'Se ${x + 4 = 0}$, quanto vale x?',
          fala: 'Se x mais quatro é zero, quanto vale x?',
          opcoes: [
            { texto: '4', erro: 'raiz-com-o-sinal-do-fator', explica: 'Com 4, ${4 + 4 = 8}$. Para dar 0, x é −4.', fala: 'Com quatro, quatro mais quatro é oito. Para dar zero, x é menos quatro.', mostra: expr([DUPLO, '4 + 4 = 8'], 'Embaixo: 4 + 4 = 8.') },
            { texto: '−4', certa: true, explica: 'Isso. ${-4 + 4 = 0}$. As raízes são 3 e −4.', fala: 'Isso. Menos quatro mais quatro é zero. As raízes são três e menos quatro.', mostra: expr([DUPLO, 'x = 3 ou x = −4'], 'Embaixo, maior: x = 3 ou x = −4.') },
          ],
          linha: { tex: 'x = -4', fala: 'x igual a menos quatro' },
        },
      ],
      esboco: 'Sem a tabela: o "ou" da regra, e cada fator resolvido como uma equação do primeiro grau. O 2x − 6 pede dividir por 2.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${(x - 7)(x + 2) = 0}$ e confira as duas raízes. Qual é a menor?',
      fala: 'No papel: resolva x menos sete vezes x mais dois igual a zero, e confira as duas raízes. Qual é a menor?',
      resposta: -2,
      sinal: true,
      resolucao: [
        { tex: 'x - 7 = 0 \\;\\text{ ou }\\; x + 2 = 0', fala: 'x menos sete igual a zero, ou x mais dois igual a zero' },
        { tex: 'x = 7 \\;\\text{ ou }\\; x = -2', fala: 'x igual a sete, ou x igual a menos dois' },
        { tex: '\\text{confere: } 0 \\cdot 9 = 0, \\quad (-9) \\cdot 0 = 0', fala: 'confere: zero vezes nove, zero; menos nove vezes zero, zero' },
      ],
      esboco: 'As duas raízes, com o sinal contrário de cada fator. A conferência põe cada uma no lugar do x.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['segundo-grau-produto-zero-n1', 'segundo-grau-produto-zero-n2', 'segundo-grau-produto-zero-n3'],
      esboco: 'Nível 1: a maior ou a menor raiz de (x + p)(x + q) = 0, com a tabela do produto no palco. Nível 2: a maior ou a menor raiz de (ax + m)(x + n) = 0, com um fator que pede dividir. Nível 3: a soma das raízes de um produto de três fatores, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Na nota, ou o preço ou a quantidade era zero. Com x, é igual: cada fator a zero. A seguir: virar ${x^2 - 5x + 6}$ num produto.',
      fala: 'Na nota, ou o preço ou a quantidade era zero. Com x, é igual: cada fator a zero. A seguir: virar x ao quadrado menos cinco x mais seis num produto.',
      visual: TABELA_CHEIA,
      esboco: 'Responde ao gancho e aponta para a próxima aula: a fatoração da unidade anterior prepara o produto, e o produto que zera dá as raízes.',
    },
  ],
}
