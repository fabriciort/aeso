import type { Aula, Visual } from '@/lib/formation/schema'

// Multiplicar e dividir com negativos. Primeiro o que se vê: 3 × (−2) são
// três dívidas de 2, três saltos de 2 para a esquerda, até o −6. Depois o
// padrão, na tabela: 3 × (−2) = −6, 2 × (−2) = −4, 1 × (−2) = −2,
// 0 × (−2) = 0. Cada coluna sobe 2, então (−1) × (−2) tem de ser 2. A
// regra dos sinais não é decreto: ela continua o padrão. A divisão é a
// volta da multiplicação: (−6) ÷ 3 = −2 porque 3 × (−2) = −6. Os erros a
// desmontar: esquecer o sinal (3 × (−2) = 6), achar que menos vezes menos
// dá menos e levar "menos com menos dá mais" para a soma.

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { sinais: true, ...estado }, esboco })
const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })
const saldo = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { saldo: estado }, esboco })

type Valor = number | string
/** Setas entre colunas seguidas: em cima ("− 1") e, nas primeiras `baixo`, embaixo ("+ 2"). */
const setas = (n: number, cima: string, baixo: string, quantasEmbaixo = n - 1) => [
  ...Array.from({ length: n - 1 }, (_, i) => ({ de: i, para: i + 1, rotulo: cima })),
  ...Array.from({ length: quantasEmbaixo }, (_, i) => ({ de: i, para: i + 1, rotulo: baixo, embaixo: true })),
]

/** O padrão de 3 × (−2) até (−1) × (−2). */
const PADRAO = (ultimo: Valor, extra: Record<string, unknown>, esboco: string) => tab(
  {
    linhas: [
      { rotulo: 'número', valores: [3, 2, 1, 0, '−1'] },
      { rotulo: 'número × (−2)', valores: ['−6', '−4', '−2', 0, ultimo] },
    ],
    setas: setas(5, '− 1', '+ 2', ultimo === '?' ? 3 : 4),
    ...extra,
  },
  esboco,
)
const PADRAO_COMPLETO = PADRAO(2, { destaque: [4] }, 'A tabela inteira: −6, −4, −2, 0 e 2, com + 2 embaixo de cada passo. A coluna do (−1) em moldura âmbar: o 2 continua o padrão.')

/** A continuação: de 0 × (−2) até (−3) × (−2). */
const CONTINUA = (extra: Record<string, unknown>, esboco: string) => tab(
  {
    linhas: [
      { rotulo: 'número', valores: [0, '−1', '−2', '−3'] },
      { rotulo: 'número × (−2)', valores: [0, 2, 4, 6] },
    ],
    setas: setas(4, '− 1', '+ 2'),
    ...extra,
  },
  esboco,
)

const TRES_SALTOS = reta(
  { de: -8, ate: 2, passo: 1, marcas: [-8, -6, -4, -2, 0, 2], saltos: [[0, -2, '−2'], [-2, -4, '−2'], [-4, -6, '−2']] },
  'A reta de −8 a 2, azul à esquerda do zero. Três arcos saem do 0, um depois do outro, cada um com "−2": 0, −2, −4, −6.',
)
const DOIS_SALTOS = reta(
  { de: -8, ate: 2, passo: 1, marcas: [-8, -6, -3, 0, 2], saltos: [[0, -3, '−3'], [-3, -6, '−3']] },
  'A mesma reta. Dois arcos de "−3" vão do 0 ao −3 e do −3 ao −6: (−3) × 2 = −6.',
)
const SOMA = reta(
  { de: -8, ate: 6, passo: 1, marcas: [-5, -2, 0, 5], saltos: [[0, -2, '−2'], [-2, -5, '−3']] },
  'A reta de −8 a 6. Dois arcos para a esquerda: do 0 ao −2 e do −2 ao −5. O 5 positivo, à direita, fica longe de onde a conta parou.',
)

export const aula: Aula = {
  id: 'B.U12.A4',
  titulo: 'Multiplicar e dividir',
  objetivo: 'Multiplicar e dividir números com sinais, sabendo explicar a regra dos sinais pelo padrão da tabela e conferir uma divisão pela multiplicação.',
  modelo: 'reta',
  esboco: 'Abre com a regra decorada ("menos vezes menos dá mais") e uma pergunta: por quê? Primeiro o concreto: 3 × (−2) são três dívidas de 2, três saltos para a esquerda até o −6. Depois a tabela do padrão: o aluno preenche 3, 2, 1, 0 vezes (−2) e vê cada coluna subir 2. Momento-chave: na aposta do (−1) × (−2), o padrão pede 2. A regra não é decreto, ela continua o padrão. Depois: a regra não vale na soma, e a divisão é a volta da multiplicação.',
  vega: 'Ideia central: a regra dos sinais. Sinais diferentes, o resultado é negativo; sinais iguais, positivo. Vale para multiplicar e dividir. De onde vem: 3 × (−2) = (−2) + (−2) + (−2) = −6. Na tabela, 3, 2, 1, 0 vezes (−2) dão −6, −4, −2, 0: a cada passo, o primeiro número cai 1 e o produto sobe 2. Para o padrão continuar, (−1) × (−2) = 2, (−2) × (−2) = 4. Divisão: (−6) ÷ 3 = −2 porque 3 × (−2) = −6; (−6) ÷ (−3) = 2 porque (−3) × 2 = −6. Erros esperados: esquecer o sinal (3 × (−2) = 6); menos vezes menos dar menos ((−2) × (−3) = −6); levar a regra para a soma ((−2) + (−3) = 5); somar no lugar de multiplicar (3 + (−2) = 1). Guie com "Três dívidas de 2: você tem ou deve?", "O que acontece com o produto a cada coluna?", "Na soma, para que lado você anda?", "Confira a divisão multiplicando de volta".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Muita gente decorou: **menos vezes menos dá mais**. Mas por quê? Nesta aula, a regra vai aparecer sozinha, de um padrão.',
      fala: 'Muita gente decorou: menos vezes menos dá mais. Mas por quê? Nesta aula, a regra vai aparecer sozinha, de um padrão.',
      visual: { modelo: 'livre', estado: { expressao: ['(−1) × (−2) = ?'] }, esboco: 'A conta grande no centro, com o "?" em âmbar: a pergunta da aula.' },
      esboco: 'Um adulto que ouviu a regra na escola e nunca soube de onde ela vem. A promessa: ela vai fazer sentido.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Comece pelo que dá para ver. Você deve **R$ 2** a cada um de **3** amigos. Quanto é ${3 \\times (-2)}$?',
      fala: 'Comece pelo que dá para ver. Você deve dois reais a cada um de três amigos. Quanto é três vezes menos dois?',
      visual: saldo({ negativas: 6, rotulo: '3 dívidas de R$ 2' }, 'Seis fichas azuis de −, cada uma 1 real devido. Embaixo, "3 dívidas de R$ 2".'),
      opcoes: [
        {
          texto: '−6', certa: true,
          explica: 'Isso. ${3 \\times (-2) = (-2) + (-2) + (-2) = -6}$: três saltos de 2 para a esquerda.',
          fala: 'Isso. Três vezes menos dois é menos dois, mais menos dois, mais menos dois: menos seis. Três saltos de dois para a esquerda.',
          mostra: TRES_SALTOS,
        },
        {
          texto: '6', erro: 'sinais-diferentes-da-positivo',
          explica: 'Três dívidas não viram dinheiro no bolso. Na reta, são três saltos de 2 para a esquerda, até o −6.',
          fala: 'Três dívidas não viram dinheiro no bolso. Na reta, são três saltos de dois para a esquerda, até o menos seis.',
          mostra: TRES_SALTOS,
        },
        {
          texto: '1', erro: 'soma-no-lugar-de-multiplicar',
          explica: '1 é ${3 + (-2)}$. Aqui são 3 vezes a dívida de 2: ${(-2) + (-2) + (-2) = -6}$.',
          fala: 'Um é três mais menos dois. Aqui são três vezes a dívida de dois: menos dois, mais menos dois, mais menos dois, menos seis.',
          mostra: TRES_SALTOS,
        },
      ],
      esboco: 'O concreto antes do padrão. Todas as opções mostram os três saltos de −2 na reta: o −6 é onde o dedo para.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora diminua o primeiro número de 1 em 1: ${3}$, ${2}$, ${1}$, ${0}$ vezes ${(-2)}$. O que acontece com o resultado?',
      fala: 'Agora diminua o primeiro número de um em um: três, dois, um, zero vezes menos dois. O que acontece com o resultado?',
      visual: PADRAO('?', { completar: true, mostradas: 1 }, 'A tabela com 3 em cima e −6 embaixo. As outras colunas vazias. Cada toque preenche uma: 2 e −4, 1 e −2, 0 e 0, com "− 1" em cima e "+ 2" embaixo de cada passo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para preencher a próxima conta.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem até o 0: −6, −4, −2, 0, com "+ 2" embaixo de cada passo.',
      },
      descoberta: 'Cada vez que o primeiro número cai 1, o resultado sobe 2: −6, −4, −2, 0. É um padrão regular.',
      esboco: 'A tabela da unidade 10, agora com negativos. As setas de baixo, "+ 2", são a pista da próxima aposta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Siga o padrão um passo além do zero. Quanto é ${(-1) \\times (-2)}$?',
      fala: 'Siga o padrão um passo além do zero. Quanto é menos um vezes menos dois?',
      visual: PADRAO('?', {}, 'A tabela toda à vista, com "?" em âmbar na última coluna, embaixo do −1. As setas "+ 2" vão até o 0; a última ainda não.'),
      opcoes: [
        {
          texto: '2', certa: true,
          explica: 'Isso. Do 0, o padrão sobe mais 2. Menos vezes menos dá mais porque o padrão continua.',
          fala: 'Isso. Do zero, o padrão sobe mais dois. Menos vezes menos dá mais porque o padrão continua.',
          mostra: PADRAO_COMPLETO,
        },
        {
          texto: '−2', erro: 'sinais-iguais-da-negativo',
          explica: 'Depois do 0, −2 seria descer 2. Mas cada coluna sobe 2: do 0, o próximo é 2.',
          fala: 'Depois do zero, menos dois seria descer dois. Mas cada coluna sobe dois: do zero, o próximo é dois.',
          mostra: PADRAO_COMPLETO,
        },
        {
          texto: '0',
          explica: 'O 0 já apareceu, em ${0 \\times (-2)}$. O padrão não para: do 0, sobe mais 2.',
          fala: 'O zero já apareceu, em zero vezes menos dois. O padrão não para: do zero, sobe mais dois.',
          mostra: PADRAO_COMPLETO,
        },
      ],
      esboco: 'O momento-chave: a resposta não vem de uma regra, vem da tabela. A última seta "+ 2" aparece e o 2 entra na moldura âmbar.',
    },
    {
      tipo: 'mexa',
      texto: 'O padrão segue. Complete: ${(-2) \\times (-2)}$ e ${(-3) \\times (-2)}$.',
      fala: 'O padrão segue. Complete: menos dois vezes menos dois, e menos três vezes menos dois.',
      visual: CONTINUA({ completar: true, mostradas: 2 }, 'A tabela começa no 0 e no −1, com 0 e 2 embaixo. Cada toque preenche uma coluna: −2 e 4, −3 e 6.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para seguir o padrão.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem: 4 embaixo do −2 e 6 embaixo do −3, com "+ 2" em cada passo.',
      },
      descoberta: 'Negativo vezes negativo dá positivo: (−2) × (−2) = 4, (−3) × (−2) = 6. Do lado direito da tabela, os sinais são iguais e o produto é positivo.',
      esboco: 'Confirma que o 2 não foi acaso: o padrão de + 2 continua e todos os produtos são positivos.',
    },
    {
      tipo: 'anote',
      titulo: 'A regra dos sinais',
      definicao: 'Ao multiplicar ou dividir, sinais iguais dão positivo e sinais diferentes dão negativo.',
      exemplo: { tex: '3 \\times (-2) = -6 \\qquad (-3) \\times (-2) = 6', fala: 'três vezes menos dois dá menos seis; menos três vezes menos dois dá seis' },
      alerta: 'A regra é só de multiplicar e dividir. Na soma, ${(-2) + (-3) = -5}$: duas dívidas, você deve mais.',
      esboco: 'A página do caderno com a tabela do padrão ao lado da regra, e um quadrinho: + × + = +, − × − = +, + × − = −, − × + = −.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E na soma? Quanto é ${(-2) + (-3)}$?',
      fala: 'E na soma? Quanto é menos dois mais menos três?',
      visual: reta({ de: -8, ate: 6, passo: 1, marcas: [-8, 0, 6] }, 'A reta de −8 a 6, sem pontos: o aluno imagina os saltos.'),
      opcoes: [
        {
          texto: '−5', certa: true,
          explica: 'Isso. Na soma, você anda: 2 e depois 3 para a esquerda. Duas dívidas, você deve 5.',
          fala: 'Isso. Na soma, você anda: dois e depois três para a esquerda. Duas dívidas, você deve cinco.',
          mostra: SOMA,
        },
        {
          texto: '5', erro: 'regra-dos-sinais-na-soma',
          explica: '"Menos com menos dá mais" é da multiplicação. Somar duas dívidas é dever mais: até o −5.',
          fala: 'Menos com menos dá mais é da multiplicação. Somar duas dívidas é dever mais: até o menos cinco.',
          mostra: SOMA,
        },
        {
          texto: '6',
          explica: '6 é ${(-2) \\times (-3)}$. Aqui é soma: dois saltos para a esquerda, até o −5.',
          fala: 'Seis é menos dois vezes menos três. Aqui é soma: dois saltos para a esquerda, até o menos cinco.',
          mostra: SOMA,
        },
      ],
      esboco: 'Logo depois da regra, o lugar onde ela não vale. Os saltos da aula 2 desmontam o "menos com menos dá mais" na soma.',
    },
    {
      tipo: 'passo',
      problema: 'Dividir é a volta de multiplicar. Quanto é ${(-6) \\div 3}$? E ${(-6) \\div (-3)}$?',
      fala: 'Dividir é a volta de multiplicar. Quanto é menos seis dividido por três? E menos seis dividido por menos três?',
      visual: reta({ de: -8, ate: 2, passo: 1, marcas: [-8, -6, 0, 2], numeros: [-6] }, 'A reta de −8 a 2, com o −6 em azul.'),
      passos: [
        {
          pergunta: '${(-6) \\div 3}$: que número, vezes 3, dá −6?',
          fala: 'Menos seis dividido por três: que número, vezes três, dá menos seis?',
          opcoes: [
            { texto: '−2', certa: true, explica: 'Isso. ${3 \\times (-2) = -6}$: três saltos de −2 vão do 0 ao −6.', fala: 'Isso. Três vezes menos dois dá menos seis: três saltos de menos dois vão do zero ao menos seis.', mostra: TRES_SALTOS },
            { texto: '2', erro: 'sinais-diferentes-da-positivo', explica: '${3 \\times 2 = 6}$, não −6. Para chegar ao −6, cada salto vai para a esquerda: −2.', fala: 'Três vezes dois dá seis, não menos seis. Para chegar ao menos seis, cada salto vai para a esquerda: menos dois.', mostra: TRES_SALTOS },
          ],
          linha: { tex: '(-6) \\div 3 = -2', fala: 'menos seis dividido por três dá menos dois' },
        },
        {
          pergunta: 'E ${(-6) \\div (-3)}$: que número, vezes ${(-3)}$, dá −6?',
          fala: 'E menos seis dividido por menos três: que número, vezes menos três, dá menos seis?',
          opcoes: [
            { texto: '2', certa: true, explica: 'Isso. ${(-3) \\times 2 = -6}$: dois saltos de −3. Sinais iguais, o quociente é positivo.', fala: 'Isso. Menos três vezes dois dá menos seis: dois saltos de menos três. Sinais iguais, o quociente é positivo.', mostra: DOIS_SALTOS },
            { texto: '−2', erro: 'sinais-iguais-da-negativo', explica: 'Confira de volta: ${(-3) \\times (-2) = 6}$, não −6. São dois saltos de −3: o quociente é 2.', fala: 'Confira de volta: menos três vezes menos dois dá seis, não menos seis. São dois saltos de menos três: o quociente é dois.', mostra: DOIS_SALTOS },
          ],
          linha: { tex: '(-6) \\div (-3) = 2', fala: 'menos seis dividido por menos três dá dois' },
        },
      ],
      esboco: 'A divisão conferida pela multiplicação, como na unidade 4. A reta mostra os saltos de cada conta de volta.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: quanto é ${(-4) \\times (-5) \\div (-2)}$? Faça da esquerda para a direita.',
      fala: 'No papel: quanto é menos quatro vezes menos cinco, dividido por menos dois? Faça da esquerda para a direita.',
      resposta: -10,
      sinal: true,
      resolucao: [
        { tex: '(-4) \\times (-5) = 20', fala: 'menos quatro vezes menos cinco dá vinte: sinais iguais' },
        { tex: '20 \\div (-2) = -10', fala: 'vinte dividido por menos dois dá menos dez: sinais diferentes' },
      ],
      esboco: 'Duas contas seguidas, uma de cada caso. Confere de volta: (−2) × (−10) = 20.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['multiplicar-negativos-n1', 'multiplicar-negativos-n2', 'multiplicar-negativos-n3'],
      esboco: 'Nível 1: um positivo vezes um negativo, com as fichas da dívida. Nível 2: menos vezes menos e divisões com sinais. Nível 3: temperatura que cai, dívida dividida em parcelas e uma conta com três números, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Menos vezes menos dá mais porque o padrão continua: ${(-1) \\times (-2) = 2}$. Na próxima aula: frações e decimais negativos.',
      fala: 'Menos vezes menos dá mais porque o padrão continua: menos um vezes menos dois dá dois. Na próxima aula: frações e decimais negativos.',
      visual: PADRAO_COMPLETO,
      esboco: 'Responde ao gancho com a tabela inteira e anuncia os racionais.',
    },
  ],
}
