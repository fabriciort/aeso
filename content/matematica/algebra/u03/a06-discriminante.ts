import type { Aula, Visual } from '@/lib/formation/schema'

// O discriminante. Três equações parecidas: x² − 2x − 3 = 0, x² − 6x + 9 = 0
// e x² + 2x + 5 = 0. Antes de resolver, o número embaixo da raiz da fórmula,
// b² − 4ac, diz quantas raízes há: 16, positivo, duas (3 e −1, na reta); 0,
// uma (o quadrado perfeito (x − 3)² = 0); −16, negativo, nenhuma. O
// momento-chave é o Mexa completar em x² + 2x = −5: o quadrado completo dá
// (x + 1)² = −4, e nenhum quadrado tem área negativa. Depois, prever antes
// de resolver: calcular Δ com sinais (b negativo, c negativo) e contar as
// raízes.

const az = (azulejos: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { de: -2, ate: 4, passo: 1, sinais: true, ...estado }, esboco })

const TRES = ['x² − 2x − 3 = 0', 'x² − 6x + 9 = 0', 'x² + 2x + 5 = 0']
const DUAS = reta({ marcas: [-1, 0, 3], numeros: [-1, 3] }, 'A reta de −2 a 4, com os pontos −1 (azul) e 3 (âmbar): as duas raízes de x² − 2x − 3 = 0.')
const UMA = reta({ marcas: [0, 3], numeros: [3] }, 'A mesma reta, agora com um ponto só, em 3: a raiz de x² − 6x + 9 = 0.')
const NEGATIVO = az({ completar: 2, igual: -5 }, 'Os azulejos de x² + 2x, soltos: o x² e 2 barras. Embaixo, x² + 2x = −5.')
const AREA_NEGATIVA = az({ completar: 2, igual: -5, completo: true }, 'O quadrado de lado x + 1, completo com 1 quadradinho. Embaixo, x² + 2x + 1 = −5 + 1 e, em rosa, (x + 1)² = −4: "nenhum quadrado tem área negativa".')

/** 2x² − 4x + 3 = 0, para prever. */
const PREVER = '2x² − 4x + 3 = 0'

export const aula: Aula = {
  id: 'AF.U3.A6',
  titulo: 'O discriminante',
  objetivo: 'Calcular o discriminante Δ = b² − 4ac (com os sinais de b e de c) e, antes de resolver, dizer se a equação tem duas raízes (Δ > 0), uma (Δ = 0) ou nenhuma (Δ < 0), sabendo por quê: nenhum quadrado tem área negativa.',
  modelo: 'livre',
  esboco: 'Abre com três equações parecidas, uma embaixo da outra. A primeira, da aula anterior, tem Δ = 16 e duas raízes na reta. A aposta de x² − 6x + 9 = 0: Δ = 0, ±0 dá o mesmo número, uma raiz só. A aposta de x² + 2x + 5 = 0: Δ = −16, e nenhum número ao quadrado dá negativo. Momento-chave: o Mexa completar em x² + 2x = −5, e o quadrado completo pede área −4. O anote dá o nome. Depois, prever em 2x² − 4x + 3 = 0 passo a passo, o c negativo que garante Δ positivo, e o caderno com x² + 4x − 5 = 0.',
  vega: 'Ideia central: na fórmula, o que fica embaixo da raiz, Δ = b² − 4ac (o discriminante, letra grega delta), decide quantas raízes há antes de resolver. Positivo: a raiz existe e o ± dá dois números diferentes, duas raízes. Zero: ±0 é o mesmo número, uma raiz só (é um quadrado perfeito, (x − 3)² = 0). Negativo: nenhum número real ao quadrado dá negativo, então não há raiz real; nos azulejos, completar o quadrado dá (x + 1)² = −4, um quadrado de área negativa. Com a e c de sinais diferentes, −4ac é positivo e Δ sempre dá positivo. Erros esperados: (−6)² = −36 (b negativo); −4ac com c negativo dado como negativo (menos com menos); √(−16) = −4, achar duas raízes com Δ negativo; achar que Δ = 0 não tem raiz (por causa do zero), ou que tem duas. Guie com "Quanto dá b², com o sinal?", "E o −4ac?", "Que número ao quadrado dá negativo?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Três equações quase iguais. Antes de resolver, dá para saber quantas raízes cada uma tem?',
      visual: expr(TRES, 'As três equações, uma embaixo da outra: x² − 2x − 3 = 0, x² − 6x + 9 = 0 e x² + 2x + 5 = 0. A última fica maior.'),
      esboco: 'A pergunta é prever, não resolver. As três diferem só nos números.',
    },
    {
      tipo: 'ideia',
      texto: 'A primeira você já resolveu: embaixo da raiz, ${b^2 - 4ac = 16}$. A raiz é 4, e o ± dá duas raízes, 3 e −1.',
      fala: 'A primeira você já resolveu: embaixo da raiz, b ao quadrado menos quatro a c é dezesseis. A raiz é quatro, e o mais ou menos dá duas raízes, três e menos um.',
      visual: DUAS,
      esboco: 'As duas raízes na reta: (2 + 4)/2 = 3 e (2 − 4)/2 = −1. Duas porque somar 4 e tirar 4 dão números diferentes.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${x^2 - 6x + 9 = 0}$, embaixo da raiz fica ${36 - 36 = 0}$. Quantas raízes?',
      fala: 'Em x ao quadrado menos seis x mais nove igual a zero, embaixo da raiz fica trinta e seis menos trinta e seis, zero. Quantas raízes?',
      visual: expr(['x² − 6x + 9 = 0', 'x = (6 ± √0)/2'], 'A equação e, embaixo, a fórmula com a raiz de zero: x = (6 ± √0)/2.'),
      opcoes: [
        {
          texto: 'Nenhuma: deu zero', erro: 'discriminante-zero-nenhuma-raiz',
          explica: '${\\sqrt{0} = 0}$ existe. Fica ${\\frac{6 \\pm 0}{2} = 3}$: uma raiz. Confira: ${9 - 18 + 9 = 0}$.',
          fala: 'A raiz de zero existe, é zero. Fica seis mais ou menos zero, sobre dois, três: uma raiz. Confira: nove menos dezoito mais nove, zero.',
          mostra: UMA,
        },
        {
          texto: 'Uma: 3', certa: true,
          explica: 'Isso. Somar 0 e tirar 0 dão o mesmo: ${\\frac{6}{2} = 3}$. É ${(x - 3)^2 = 0}$.',
          fala: 'Isso. Somar zero e tirar zero dão o mesmo: seis sobre dois, três. É x menos três, ao quadrado, igual a zero.',
          mostra: UMA,
        },
        {
          texto: 'Duas: 3 e −3', erro: 'discriminante-zero-da-duas',
          explica: 'O ± soma e tira a raiz, que é 0. Os dois dão ${\\frac{6}{2} = 3}$. Com −3: ${9 + 18 + 9 = 36}$.',
          fala: 'O mais ou menos soma e tira a raiz, que é zero. Os dois dão seis sobre dois, três. Com menos três: nove mais dezoito mais nove, trinta e seis.',
          mostra: UMA,
        },
      ],
      esboco: 'Com zero embaixo da raiz, os dois caminhos do ± chegam ao mesmo ponto. A reta mostra um ponto só.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${x^2 + 2x + 5 = 0}$, embaixo da raiz fica ${4 - 20 = -16}$. Quantas raízes?',
      fala: 'Em x ao quadrado mais dois x mais cinco igual a zero, embaixo da raiz fica quatro menos vinte, menos dezesseis. Quantas raízes?',
      visual: expr(['x² + 2x + 5 = 0', 'x = (−2 ± √−16)/2'], 'A equação e, embaixo, a fórmula com a raiz de −16.'),
      opcoes: [
        {
          texto: 'Duas, porque $\\sqrt{-16} = -4$', erro: 'raiz-de-numero-negativo',
          explica: 'Confira: ${(-4)^2 = 16}$, não −16. Nenhum número ao quadrado dá negativo.',
          fala: 'Confira: menos quatro ao quadrado é dezesseis, não menos dezesseis. Nenhum número ao quadrado dá negativo.',
          mostra: expr(['(−4)² = 16', '4² = 16'], 'Duas contas: (−4)² = 16 e 4² = 16. As duas dão positivo.'),
        },
        {
          texto: 'Nenhuma', certa: true,
          explica: 'Isso. ${4^2 = 16}$ e ${(-4)^2 = 16}$: nenhum número ao quadrado dá −16.',
          fala: 'Isso. Quatro ao quadrado é dezesseis, e menos quatro ao quadrado também: nenhum número ao quadrado dá menos dezesseis.',
          mostra: expr(['(−4)² = 16', '4² = 16'], 'Duas contas: (−4)² = 16 e 4² = 16. As duas dão positivo.'),
        },
      ],
      esboco: 'A raiz de um número negativo não existe entre os números que conhecemos. O porquê, com desenho, vem no Mexa.',
    },
    {
      tipo: 'mexa',
      texto: 'Veja nos azulejos. Tire o 5 dos dois lados: ${x^2 + 2x = -5}$. Complete o quadrado.',
      fala: 'Veja nos azulejos. Tire o cinco dos dois lados: x ao quadrado mais dois x igual a menos cinco. Complete o quadrado.',
      visual: NEGATIVO,
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos azulejos: as barras se partem ao redor do x².',
        sucesso: { completo: true },
        mostre: 'Uma barra de cada lado; o canto 1 por 1 entra dos dois lados, e fica (x + 1)² = −4.',
      },
      descoberta: 'O quadrado de lado x + 1 teria área −4. Nenhum quadrado tem área negativa: não há raiz.',
      esboco: 'O momento-chave: o mesmo gesto da aula do completar o quadrado, mas a conta embaixo fica rosa. O quadrado está ali, inteiro, e a área que ele pede não existe.',
    },
    {
      tipo: 'anote',
      titulo: 'O discriminante',
      definicao: '${\\Delta = b^2 - 4ac}$ é o número embaixo da raiz. Positivo: **duas** raízes. Zero: **uma**. Negativo: **nenhuma**.',
      exemplo: { tex: 'x^2 + 2x + 5 = 0: \\ \\Delta = 4 - 20 = -16', fala: 'x ao quadrado mais dois x mais cinco igual a zero: delta é quatro menos vinte, menos dezesseis' },
      alerta: 'Com b negativo, ${b^2}$ é positivo: ${(-6)^2 = 36}$. Com c negativo, o ${-4ac}$ soma.',
      esboco: 'Na página: Δ = b² − 4ac, a palavra discriminante (a letra grega delta) e três linhas: > 0, duas; = 0, uma; < 0, nenhuma. Ao lado, o quadrado de área −4 riscado.',
    },
    {
      tipo: 'passo',
      problema: 'Sem resolver: quantas raízes tem ${2x^2 - 4x + 3 = 0}$?',
      fala: 'Sem resolver: quantas raízes tem dois x ao quadrado menos quatro x mais três igual a zero?',
      visual: expr([PREVER], 'A equação 2x² − 4x + 3 = 0, sozinha.'),
      passos: [
        {
          pergunta: 'Com b = −4, quanto vale ${b^2}$?',
          fala: 'Com b igual a menos quatro, quanto vale b ao quadrado?',
          opcoes: [
            { texto: '$-16$', erro: 'potencia-sinal-fora-dos-parenteses', explica: '${(-4)^2 = (-4) \\cdot (-4)}$: menos vezes menos dá mais, 16.', fala: 'Menos quatro ao quadrado é menos quatro vezes menos quatro: menos vezes menos dá mais, dezesseis.', mostra: expr([PREVER], 'A equação continua sozinha.') },
            { texto: '$16$', certa: true, explica: 'Isso. ${(-4)^2 = 16}$: um quadrado nunca é negativo.', fala: 'Isso. Menos quatro ao quadrado é dezesseis: um quadrado nunca é negativo.', mostra: expr([PREVER, 'b² = 16'], 'Embaixo: b² = 16.') },
          ],
          linha: { tex: 'b^2 = (-4)^2 = 16', fala: 'b ao quadrado é menos quatro ao quadrado, dezesseis' },
        },
        {
          pergunta: 'E ${\\Delta = b^2 - 4ac}$, com a = 2 e c = 3?',
          fala: 'E delta, b ao quadrado menos quatro a c, com a igual a dois e c igual a três?',
          opcoes: [
            { texto: '$16 - 24 = -8$', certa: true, explica: 'Isso. ${4 \\cdot 2 \\cdot 3 = 24}$, e 16 − 24 dá negativo.', fala: 'Isso. Quatro vezes dois vezes três, vinte e quatro, e dezesseis menos vinte e quatro dá negativo.', mostra: expr(['b² = 16', 'Δ = 16 − 24 = −8'], 'Embaixo: Δ = 16 − 24 = −8.') },
            { texto: '$16 - 24 = 8$', erro: 'esquece-sinal-do-resultado', explica: 'Tirar 24 de 16 passa do zero: ${16 - 24 = -8}$. Confira: ${-8 + 24 = 16}$.', fala: 'Tirar vinte e quatro de dezesseis passa do zero: menos oito. Confira: menos oito mais vinte e quatro, dezesseis.', mostra: expr([PREVER, 'b² = 16'], 'A linha b² = 16 continua.') },
          ],
          linha: { tex: '\\Delta = 16 - 24 = -8', fala: 'delta é dezesseis menos vinte e quatro, menos oito' },
        },
        {
          pergunta: 'Então a equação tem:',
          opcoes: [
            { texto: 'Duas raízes', erro: 'raiz-de-numero-negativo', explica: 'A raiz de −8 não existe: nenhum número ao quadrado dá negativo.', fala: 'A raiz de menos oito não existe: nenhum número ao quadrado dá negativo.', mostra: expr(['b² = 16', 'Δ = 16 − 24 = −8'], 'A conta continua: Δ = −8.') },
            { texto: 'Nenhuma raiz', certa: true, explica: 'Isso. Δ negativo: nenhuma raiz, e você não precisou resolver.', fala: 'Isso. Delta negativo: nenhuma raiz, e você não precisou resolver.', mostra: expr(['Δ = −8', 'nenhuma raiz'], 'Embaixo de Δ = −8, maior: nenhuma raiz.') },
          ],
          linha: { tex: '\\Delta < 0: \\text{ nenhuma raiz}', fala: 'delta menor que zero: nenhuma raiz' },
        },
      ],
      esboco: 'Prever antes de resolver. O b negativo ao quadrado fica positivo; o Δ dá negativo; a conta para ali.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${x^2 + 3x - 10 = 0}$, o c é negativo. Sem fazer a conta toda: o Δ pode dar negativo?',
      fala: 'Em x ao quadrado mais três x menos dez igual a zero, o c é negativo. Sem fazer a conta toda: o delta pode dar negativo?',
      visual: expr(['x² + 3x − 10 = 0', 'Δ = 9 − 4 · 1 · (−10)'], 'A equação e, embaixo, o começo da conta: Δ = 9 − 4 · 1 · (−10).'),
      opcoes: [
        {
          texto: 'Pode: ${9 - 40 = -31}$', erro: 'sinais-iguais-da-negativo',
          explica: 'Menos vezes menos dá mais: ${-4 \\cdot 1 \\cdot (-10) = 40}$. Fica ${9 + 40 = 49}$.',
          fala: 'Menos vezes menos dá mais: menos quatro vezes um vezes menos dez é quarenta. Fica nove mais quarenta, quarenta e nove.',
          mostra: expr(['Δ = 9 − 4 · 1 · (−10)', 'Δ = 9 + 40 = 49'], 'Embaixo: Δ = 9 + 40 = 49.'),
        },
        {
          texto: 'Não: com c negativo, o −4ac soma', certa: true,
          explica: 'Isso. ${-4 \\cdot 1 \\cdot (-10) = 40}$, e ${9 + 40 = 49}$. Duas raízes: 2 e −5.',
          fala: 'Isso. Menos quatro vezes um vezes menos dez é quarenta, e nove mais quarenta, quarenta e nove. Duas raízes: dois e menos cinco.',
          mostra: expr(['Δ = 9 − 4 · 1 · (−10)', 'Δ = 9 + 40 = 49'], 'Embaixo: Δ = 9 + 40 = 49.'),
        },
      ],
      esboco: 'Com a positivo e c negativo, −4ac é positivo e Δ é b² mais alguma coisa: sempre positivo, sempre duas raízes.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: calcule o Δ de ${x^2 + 4x - 5 = 0}$, diga quantas raízes há e ache-as. Digite o Δ.',
      fala: 'No papel: calcule o delta de x ao quadrado mais quatro x menos cinco igual a zero, diga quantas raízes há e ache as raízes. Digite o delta.',
      resposta: 36,
      sinal: true,
      resolucao: [
        { tex: '\\Delta = 16 - 4 \\cdot 1 \\cdot (-5) = 16 + 20 = 36', fala: 'delta é dezesseis menos quatro vezes um vezes menos cinco, dezesseis mais vinte, trinta e seis' },
        { tex: '\\Delta > 0: \\text{ duas raízes}', fala: 'delta maior que zero: duas raízes' },
        { tex: 'x = \\dfrac{-4 \\pm 6}{2}: \\ x = 1 \\text{ ou } x = -5', fala: 'x é menos quatro mais ou menos seis, sobre dois: x é um ou menos cinco' },
        { tex: '\\text{confere: } 1 + 4 - 5 = 0, \\ 25 - 20 - 5 = 0', fala: 'confere: um mais quatro menos cinco, zero; vinte e cinco menos vinte menos cinco, zero' },
      ],
      esboco: 'O c negativo outra vez: o −4ac soma. Δ = 36, raiz 6, duas raízes inteiras.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['segundo-grau-discriminante-n1', 'segundo-grau-discriminante-n2', 'segundo-grau-discriminante-n3'],
      esboco: 'Nível 1: quantas raízes, com os azulejos de x² + bx = k soltos no palco (completar de cabeça). Nível 2: o valor de Δ com b ou c negativos. Nível 3: quantas raízes com a diferente de 1, ou o número que faz a equação ter uma raiz só.',
    },
    {
      tipo: 'fecho',
      texto: 'As três do começo têm Δ igual a 16, 0 e −16: duas raízes, uma e nenhuma. A seguir: problemas, e que raiz serve.',
      fala: 'As três do começo têm delta igual a dezesseis, zero e menos dezesseis: duas raízes, uma e nenhuma. A seguir: problemas, e que raiz serve.',
      visual: AREA_NEGATIVA,
      esboco: 'Responde ao gancho e deixa no palco o quadrado de área negativa, o porquê do "nenhuma".',
    },
  ],
}
