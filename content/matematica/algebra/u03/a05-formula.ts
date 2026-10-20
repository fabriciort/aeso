import type { Aula, Visual } from '@/lib/formation/schema'

// A fórmula. Na aula anterior, o aluno completou o quadrado com os azulejos.
// Aqui ele completa de novo, com números (x² + 4x = 12), e depois faz os
// mesmos passos com letras, em ax² + bx + c = 0: dividir por a, tirar o c/a
// dos dois lados, pôr o canto (b/2a)² dos dois lados, tirar a raiz com ±. O
// momento-chave é ver que a fórmula É o completar o quadrado: o canto do
// x² + 4x foi 2 por 2, a metade do 4; o canto de x² + (b/a)x é b/2a, a
// metade do b/a. Depois, usar a fórmula em x² − 2x − 3 = 0 (a, b e c com o
// sinal) e em 2x² + 3x − 2 = 0, conferindo as raízes.

const az = (azulejos: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const DOZE = az({ completar: 4, igual: 12 }, 'Os azulejos de x² + 4x, soltos: o x² e as 4 barras numa fila. Embaixo, x² + 4x = 12.')
const DOZE_COMPLETO = az({ completar: 4, igual: 12, completo: true }, 'O quadrado de lado x + 2: o x², 2 barras de pé, 2 deitadas e o canto 2 por 2 com 4 quadradinhos novos. Embaixo, x² + 4x + 4 = 12 + 4 e, em âmbar, (x + 2)² = 16.')

/** As linhas da conta com letras, como o palco as mostra. */
const GERAL = 'ax² + bx + c = 0'
const DIVIDIDO = 'x² + (b/a)x + c/a = 0'
const SEM_C = 'x² + (b/a)x = −c/a'
const COM_CANTO = '(x + b/2a)² = b²/4a² − c/a'
const UMA_FRACAO = '(x + b/2a)² = (b² − 4ac)/4a²'
const COM_RAIZ = 'x + b/2a = ±√(b² − 4ac)/2a'
const FORMULA = 'x = (−b ± √(b² − 4ac))/2a'

/** x² − 2x − 3 = 0, pela fórmula. */
const EQ = 'x² − 2x − 3 = 0'
const COEF = 'a = 1, b = −2, c = −3'
const DELTA = 'b² − 4ac = 4 + 12 = 16'
const CONTA = 'x = (2 ± 4)/2'

export const aula: Aula = {
  id: 'AF.U3.A5',
  titulo: 'A fórmula',
  objetivo: 'Ver que a fórmula x = (−b ± √(b² − 4ac)) / 2a é o completar o quadrado feito com letras, e usá-la em equações como x² − 2x − 3 = 0 e 2x² + 3x − 2 = 0, identificando a, b e c com o sinal e conferindo cada raiz.',
  modelo: 'livre',
  esboco: 'Abre nos azulejos de x² + 4x = 12, soltos. O aluno completa o quadrado de novo (Mexa completar): o canto é 2 por 2, a metade do 4. A aposta generaliza: com b barras, o canto é b/2 por b/2. Momento-chave: os mesmos passos com letras, em dois passo a passo, até a fórmula aparecer no palco; ela é o completar o quadrado feito uma vez por todas. O anote dá a fórmula (de Bhaskara). Depois, x² − 2x − 3 = 0 passo a passo (a, b e c com sinal, a conta embaixo da raiz, o −b, o 2a que divide tudo, e conferir), e 2x² + 3x − 2 = 0 no caderno.',
  vega: 'Ideia central: a fórmula x = (−b ± √(b² − 4ac)) / 2a não é mágica: é o completar o quadrado em ax² + bx + c = 0, feito com letras. Divide-se por a (para o x² ficar sozinho), tira-se c/a dos dois lados, põe-se o canto (b/2a)² dos dois lados (a metade das barras, ao quadrado), junta-se a direita numa fração só, (b² − 4ac)/4a², e tira-se a raiz com ± (como em x² = 25). Para usar: ler a, b e c COM O SINAL, fazer b² − 4ac, e dividir TUDO por 2a. Sempre conferir cada raiz no lugar do x. Erros esperados: usar +b em vez de −b (com b negativo, −b fica positivo); dividir só a raiz por 2a; perder o sinal de c (−3 vira 3) ou errar −4ac quando c é negativo (menos com menos dá mais); (−2)² = −4; o canto (b/a)² em vez de (b/2a)²; esquecer o ±. Guie com "Quanto vale b, com o sinal?", "Quanto dá b² − 4ac?", "O 2a divide o quê?", "Confira: com esse x, a equação dá zero?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Para resolver ${x^2 + 4x = 12}$, você completa o quadrado. E se fizesse isso uma vez só, com letras, para qualquer equação?',
      fala: 'Para resolver x ao quadrado mais quatro x igual a doze, você completa o quadrado. E se fizesse isso uma vez só, com letras, para qualquer equação?',
      visual: DOZE,
      esboco: 'Os azulejos da aula anterior voltam, soltos. A pergunta promete uma receita que serve para toda equação do 2º grau.',
    },
    {
      tipo: 'mexa',
      texto: 'Primeiro com números: complete o quadrado de ${x^2 + 4x = 12}$.',
      fala: 'Primeiro com números: complete o quadrado de x ao quadrado mais quatro x igual a doze.',
      visual: DOZE,
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos azulejos: as barras se partem ao redor do x².',
        sucesso: { completo: true },
        mostre: 'Duas barras de cada lado; o canto 2 por 2 se enche com 4, dos dois lados.',
      },
      descoberta: 'x² + 4x + 4 = 12 + 4, então (x + 2)² = 16: x + 2 = 4 ou −4, x = 2 ou x = −6.',
      esboco: 'O primeiro toque parte as 4 barras em 2 e 2 e mostra o canto vazio; o segundo enche o canto e escreve (x + 2)² = 16.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Com 4 barras, o canto foi 2 por 2. Com **b** barras, de que tamanho é o canto?',
      fala: 'Com quatro barras, o canto foi dois por dois. Com b barras, de que tamanho é o canto?',
      visual: DOZE_COMPLETO,
      opcoes: [
        {
          texto: '$b$ por $b$', erro: 'completa-com-b-ao-quadrado',
          explica: 'As barras se partem em duas metades, uma de cada lado. Com 4 barras, o canto foi 2, não 4.',
          fala: 'As barras se partem em duas metades, uma de cada lado. Com quatro barras, o canto foi dois, não quatro.',
          mostra: DOZE_COMPLETO,
        },
        {
          texto: '$\\frac{b}{2}$ por $\\frac{b}{2}$', certa: true,
          explica: 'Isso. Metade das barras de cada lado: o canto tem lado ${\\frac{b}{2}}$, a metade do b.',
          fala: 'Isso. Metade das barras de cada lado: o canto tem lado b sobre dois, a metade do b.',
          mostra: DOZE_COMPLETO,
        },
      ],
      esboco: 'O quadrado completo de x² + 4x fica no palco: 2 barras de cada lado, canto 2 por 2. A regra com letras sai do desenho.',
    },
    {
      tipo: 'passo',
      problema: 'Agora com letras: ${ax^2 + bx + c = 0}$. Faça os mesmos passos.',
      fala: 'Agora com letras: a x ao quadrado mais b x mais c igual a zero. Faça os mesmos passos.',
      visual: expr([GERAL], 'A equação geral, sozinha: ax² + bx + c = 0.'),
      passos: [
        {
          pergunta: 'Os azulejos pedem um x² sozinho, mas ele tem um a na frente. O que fazer?',
          fala: 'Os azulejos pedem um x ao quadrado sozinho, mas ele tem um a na frente. O que fazer?',
          opcoes: [
            { texto: 'Dividir só o $ax^2$ por a', erro: 'divide-so-o-primeiro', explica: 'Aí os dois lados deixam de ser iguais. Divida cada termo por a. O 0 continua 0.', fala: 'Aí os dois lados deixam de ser iguais. Divida cada termo por a. O zero continua zero.', mostra: expr([GERAL], 'A equação geral continua no palco.') },
            { texto: 'Dividir tudo por a', certa: true, explica: 'Isso. Cada termo por a, dos dois lados. O a não é zero, então pode.', fala: 'Isso. Cada termo por a, dos dois lados. O a não é zero, então pode.', mostra: expr([GERAL, DIVIDIDO], 'Embaixo da equação geral: x² + (b/a)x + c/a = 0.') },
          ],
          linha: { tex: 'x^2 + \\dfrac{b}{a}x + \\dfrac{c}{a} = 0', fala: 'x ao quadrado mais b sobre a x mais c sobre a igual a zero' },
        },
        {
          pergunta: 'Os azulejos são o ${x^2}$ e as barras. O que fazer com o ${\\frac{c}{a}}$?',
          fala: 'Os azulejos são o x ao quadrado e as barras. O que fazer com o c sobre a?',
          opcoes: [
            { texto: 'Tirar dos dois lados', certa: true, explica: 'Isso. Como na balança: tirando ${\\frac{c}{a}}$ dos dois lados, a direita fica ${-\\frac{c}{a}}$.', fala: 'Isso. Como na balança: tirando c sobre a dos dois lados, a direita fica menos c sobre a.', mostra: expr([DIVIDIDO, SEM_C], 'Embaixo: x² + (b/a)x = −c/a.') },
            { texto: 'Passar para o outro lado do jeito que está', erro: 'passa-para-o-outro-lado', explica: 'Sai da esquerda e sai da direita também: ${0 - \\frac{c}{a}}$. Fica ${-\\frac{c}{a}}$.', fala: 'Sai da esquerda e sai da direita também: zero menos c sobre a. Fica menos c sobre a.', mostra: expr([DIVIDIDO], 'A linha de cima continua: x² + (b/a)x + c/a = 0.') },
          ],
          linha: { tex: 'x^2 + \\dfrac{b}{a}x = -\\dfrac{c}{a}', fala: 'x ao quadrado mais b sobre a x igual a menos c sobre a' },
        },
        {
          pergunta: 'São ${\\frac{b}{a}}$ barras. Que canto completa o quadrado?',
          fala: 'São b sobre a barras. Que canto completa o quadrado?',
          opcoes: [
            { texto: '$\\left(\\frac{b}{a}\\right)^2$', erro: 'completa-com-b-ao-quadrado', explica: 'As barras se partem em duas metades. O lado do canto é a metade de ${\\frac{b}{a}}$: ${\\frac{b}{2a}}$.', fala: 'As barras se partem em duas metades. O lado do canto é a metade de b sobre a: b sobre dois a.', mostra: expr([SEM_C], 'A linha continua: x² + (b/a)x = −c/a.') },
            { texto: '$\\left(\\frac{b}{2a}\\right)^2$', certa: true, explica: 'Isso. O lado é ${\\frac{b}{2a}}$, a metade. O canto entra dos dois lados, e a esquerda vira um quadrado.', fala: 'Isso. O lado é b sobre dois a, a metade. O canto entra dos dois lados, e a esquerda vira um quadrado.', mostra: expr([SEM_C, COM_CANTO], 'Embaixo: (x + b/2a)² = b²/4a² − c/a.') },
          ],
          linha: { tex: '\\left(x + \\dfrac{b}{2a}\\right)^2 = \\dfrac{b^2}{4a^2} - \\dfrac{c}{a}', fala: 'x mais b sobre dois a, ao quadrado, igual a b ao quadrado sobre quatro a ao quadrado menos c sobre a' },
        },
      ],
      esboco: 'Os passos do completar o quadrado, agora com letras. O palco escreve cada linha nova embaixo da anterior. O canto é a metade de b/a, ao quadrado, como o 2 foi a metade do 4.',
    },
    {
      tipo: 'ideia',
      texto: 'Na direita, as duas frações viram uma só: ${\\frac{b^2 - 4ac}{4a^2}}$. Na esquerda, um quadrado.',
      fala: 'Na direita, as duas frações viram uma só: b ao quadrado menos quatro a c, sobre quatro a ao quadrado. Na esquerda, um quadrado.',
      visual: expr([COM_CANTO, UMA_FRACAO], 'Embaixo de (x + b/2a)² = b²/4a² − c/a, a linha maior: (x + b/2a)² = (b² − 4ac)/4a².'),
      esboco: 'A conta do denominador comum fica para quem quiser: c/a é 4ac/4a². O que importa é a forma: um quadrado igual a um número, como (x + 2)² = 16.',
    },
    {
      tipo: 'passo',
      problema: 'Um quadrado igual a um número, como ${(x + 2)^2 = 16}$. Termine a conta.',
      fala: 'Um quadrado igual a um número, como x mais dois, ao quadrado, igual a dezesseis. Termine a conta.',
      visual: expr([UMA_FRACAO], 'A linha (x + b/2a)² = (b² − 4ac)/4a², sozinha.'),
      passos: [
        {
          pergunta: 'Tirando a raiz dos dois lados, fica:',
          opcoes: [
            { texto: '$x + \\frac{b}{2a} = \\frac{\\sqrt{b^2 - 4ac}}{2a}$', erro: 'raiz-so-positiva', explica: 'Esse é só o lado positivo. Como em ${x^2 = 25}$, falta o negativo: use ±.', fala: 'Esse é só o lado positivo. Como em x ao quadrado igual a vinte e cinco, falta o negativo: use mais ou menos.', mostra: expr([UMA_FRACAO], 'A linha continua sozinha.') },
            { texto: '$x + \\frac{b}{2a} = \\pm\\frac{\\sqrt{b^2 - 4ac}}{2a}$', certa: true, explica: 'Isso. O ± guarda as duas raízes. E ${\\sqrt{4a^2} = 2a}$, como ${\\sqrt{16} = 4}$.', fala: 'Isso. O mais ou menos guarda as duas raízes. E a raiz de quatro a ao quadrado é dois a, como a raiz de dezesseis é quatro.', mostra: expr([UMA_FRACAO, COM_RAIZ], 'Embaixo: x + b/2a = ±√(b² − 4ac)/2a.') },
          ],
          linha: { tex: 'x + \\dfrac{b}{2a} = \\pm\\dfrac{\\sqrt{b^2 - 4ac}}{2a}', fala: 'x mais b sobre dois a igual a mais ou menos a raiz de b ao quadrado menos quatro a c, sobre dois a' },
        },
        {
          pergunta: 'Falta tirar ${\\frac{b}{2a}}$ dos dois lados. Fica:',
          fala: 'Falta tirar b sobre dois a dos dois lados. Fica:',
          opcoes: [
            { texto: '$x = \\frac{b \\pm \\sqrt{b^2 - 4ac}}{2a}$', erro: 'formula-sinal-do-b', explica: 'Tirar ${\\frac{b}{2a}}$ deixa ${-\\frac{b}{2a}}$ na direita: o b chega com menos.', fala: 'Tirar b sobre dois a deixa menos b sobre dois a na direita: o b chega com menos.', mostra: expr([COM_RAIZ], 'A linha continua: x + b/2a = ±√(b² − 4ac)/2a.') },
            { texto: '$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$', certa: true, explica: 'Isso. O ${-b}$ e a raiz, tudo sobre 2a. É a fórmula.', fala: 'Isso. O menos b e a raiz, tudo sobre dois a. É a fórmula.', mostra: expr([COM_RAIZ, FORMULA], 'Embaixo, maior: x = (−b ± √(b² − 4ac))/2a.') },
          ],
          linha: { tex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', fala: 'x é igual a menos b mais ou menos a raiz de b ao quadrado menos quatro a c, tudo sobre dois a' },
        },
      ],
      esboco: 'O fim do completar o quadrado: a raiz com ±, como em x² = 25, e tirar b/2a. O palco termina com a fórmula, grande.',
    },
    {
      tipo: 'anote',
      titulo: 'A fórmula do 2º grau',
      definicao: 'Em ${ax^2 + bx + c = 0}$, com a ≠ 0: ${x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}}$. No Brasil, a **fórmula de Bhaskara**.',
      exemplo: { tex: 'x^2 + 4x - 12 = 0: \\ x = \\dfrac{-4 \\pm 8}{2}', fala: 'x ao quadrado mais quatro x menos doze igual a zero: x é menos quatro mais ou menos oito, sobre dois' },
      alerta: 'Leia a, b e c com o sinal. O ${-b}$ troca o sinal do b, e o 2a divide tudo, não só a raiz.',
      esboco: 'Na página: a fórmula grande e, ao lado, os azulejos de x² + 4x completos, para lembrar de onde ela vem. O exemplo é a mesma equação do começo, com o 12 passado para a esquerda.',
    },
    {
      tipo: 'passo',
      problema: 'Use a fórmula em ${x^2 - 2x - 3 = 0}$.',
      fala: 'Use a fórmula em x ao quadrado menos dois x menos três igual a zero.',
      visual: expr([EQ], 'A equação x² − 2x − 3 = 0, sozinha.'),
      passos: [
        {
          pergunta: 'Quanto valem a, b e c?',
          opcoes: [
            { texto: '$a = 1,\\ b = 2,\\ c = 3$', erro: 'termo-perde-o-sinal', explica: 'O sinal faz parte do número: ${-2x}$ dá b = −2, e o ${-3}$ dá c = −3.', fala: 'O sinal faz parte do número: menos dois x dá b igual a menos dois, e o menos três dá c igual a menos três.', mostra: expr([EQ], 'A equação continua sozinha.') },
            { texto: '$a = 2,\\ b = -2,\\ c = -3$', erro: 'coeficiente-e-o-expoente', explica: 'O 2 de cima é o expoente. O ${x^2}$ está sozinho, uma vez: a = 1.', fala: 'O dois de cima é o expoente. O x ao quadrado está sozinho, uma vez: a é igual a um.', mostra: expr([EQ], 'A equação continua sozinha.') },
            { texto: '$a = 1,\\ b = -2,\\ c = -3$', certa: true, explica: 'Isso. Cada um com o sinal que está na frente dele.', fala: 'Isso. Cada um com o sinal que está na frente dele.', mostra: expr([EQ, COEF], 'Embaixo: a = 1, b = −2, c = −3.') },
          ],
          linha: { tex: 'a = 1,\\ b = -2,\\ c = -3', fala: 'a igual a um, b igual a menos dois, c igual a menos três' },
        },
        {
          pergunta: 'Embaixo da raiz, ${b^2 - 4ac}$ vale:',
          fala: 'Embaixo da raiz, b ao quadrado menos quatro a c vale:',
          opcoes: [
            { texto: '$4 - 12 = -8$', erro: 'sinais-iguais-da-negativo', explica: 'Menos vezes menos dá mais: ${-4 \\cdot 1 \\cdot (-3) = 12}$. Fica ${4 + 12}$.', fala: 'Menos vezes menos dá mais: menos quatro vezes um vezes menos três dá doze. Fica quatro mais doze.', mostra: expr([EQ, COEF], 'Os coeficientes continuam embaixo da equação.') },
            { texto: '$-4 + 12 = 8$', erro: 'potencia-sinal-fora-dos-parenteses', explica: '${(-2)^2 = (-2) \\cdot (-2) = 4}$: um número ao quadrado nunca dá negativo.', fala: 'Menos dois ao quadrado é menos dois vezes menos dois, quatro: um número ao quadrado nunca dá negativo.', mostra: expr([EQ, COEF], 'Os coeficientes continuam embaixo da equação.') },
            { texto: '$4 + 12 = 16$', certa: true, explica: 'Isso. ${(-2)^2 = 4}$ e ${-4 \\cdot 1 \\cdot (-3) = 12}$.', fala: 'Isso. Menos dois ao quadrado dá quatro, e menos quatro vezes um vezes menos três dá doze.', mostra: expr([COEF, DELTA], 'Embaixo dos coeficientes: b² − 4ac = 4 + 12 = 16.') },
          ],
          linha: { tex: 'b^2 - 4ac = 4 + 12 = 16', fala: 'b ao quadrado menos quatro a c é quatro mais doze, dezesseis' },
        },
        {
          pergunta: 'Na fórmula, x vale:',
          fala: 'Na fórmula, x vale:',
          opcoes: [
            { texto: '$\\frac{-2 \\pm 4}{2}$', erro: 'formula-sinal-do-b', explica: 'O b é −2, então ${-b = -(-2) = 2}$.', fala: 'O b é menos dois, então menos b é menos menos dois, dois.', mostra: expr([COEF, DELTA], 'A conta embaixo da raiz continua no palco.') },
            { texto: '$2 \\pm \\frac{4}{2}$', erro: 'divide-so-a-raiz', explica: 'O 2a divide tudo, o ${-b}$ também: ${\\frac{2 \\pm 4}{2}}$.', fala: 'O dois a divide tudo, o menos b também: dois mais ou menos quatro, sobre dois.', mostra: expr([COEF, DELTA], 'A conta embaixo da raiz continua no palco.') },
            { texto: '$\\frac{2 \\pm 4}{2}$', certa: true, explica: 'Isso. ${-b = 2}$, ${\\sqrt{16} = 4}$ e ${2a = 2}$.', fala: 'Isso. Menos b é dois, a raiz de dezesseis é quatro, e dois a é dois.', mostra: expr([DELTA, CONTA], 'Embaixo: x = (2 ± 4)/2.') },
          ],
          linha: { tex: 'x = \\dfrac{2 \\pm 4}{2}', fala: 'x é dois mais ou menos quatro, sobre dois' },
        },
        {
          pergunta: 'As raízes são:',
          opcoes: [
            { texto: '$6$ e $-2$', erro: 'esquece-de-dividir', explica: 'Falta dividir por 2: ${\\frac{6}{2} = 3}$ e ${\\frac{-2}{2} = -1}$.', fala: 'Falta dividir por dois: seis sobre dois, três, e menos dois sobre dois, menos um.', mostra: expr([DELTA, CONTA], 'A conta continua: x = (2 ± 4)/2.') },
            { texto: '$3$ e $-1$', certa: true, explica: 'Isso. Confira: ${9 - 6 - 3 = 0}$ e ${1 + 2 - 3 = 0}$.', fala: 'Isso. Confira: nove menos seis menos três, zero, e um mais dois menos três, zero.', mostra: expr([CONTA, 'x = 3 ou x = −1'], 'Embaixo, maior: x = 3 ou x = −1.') },
          ],
          linha: { tex: 'x = 3 \\text{ ou } x = -1', fala: 'x igual a três ou x igual a menos um' },
        },
      ],
      esboco: 'A fórmula em uso: os coeficientes com o sinal, a conta embaixo da raiz, o −b e o 2a, e as duas raízes conferidas no lugar do x.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${2x^2 + 3x - 2 = 0}$ pela fórmula e confira as raízes. Digite a menor.',
      fala: 'No papel: resolva dois x ao quadrado mais três x menos dois igual a zero pela fórmula e confira as raízes. Digite a menor.',
      resposta: -2,
      sinal: true,
      resolucao: [
        { tex: 'a = 2,\\ b = 3,\\ c = -2', fala: 'a igual a dois, b igual a três, c igual a menos dois' },
        { tex: 'b^2 - 4ac = 9 + 16 = 25', fala: 'b ao quadrado menos quatro a c é nove mais dezesseis, vinte e cinco' },
        { tex: 'x = \\dfrac{-3 \\pm 5}{4}', fala: 'x é menos três mais ou menos cinco, sobre quatro' },
        { tex: 'x = \\dfrac{2}{4} = \\dfrac{1}{2} \\text{ ou } x = \\dfrac{-8}{4} = -2', fala: 'x é dois quartos, um meio, ou x é menos oito quartos, menos dois' },
        { tex: '\\text{confere: } 2 \\cdot 4 - 6 - 2 = 0', fala: 'confere: dois vezes quatro menos seis menos dois, zero' },
      ],
      esboco: 'Agora a não é 1: o 2a vale 4. A menor raiz é −2; a outra é 1/2, que não sairia fácil na fatoração da unidade anterior.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['segundo-grau-formula-n1', 'segundo-grau-formula-n2', 'segundo-grau-formula-n3'],
      esboco: 'Nível 1: x² + bx + c = 0 com b par e os azulejos soltos de x² + bx no palco; a maior raiz. Nível 2: escolher como a fórmula fica (contra o +b, o sinal do c e a raiz dividida sozinha). Nível 3: com a = 2, uma raiz que pode ser decimal, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A fórmula é o completar o quadrado feito uma vez, com letras. A seguir: o que fica embaixo da raiz diz quantas raízes há.',
      fala: 'A fórmula é o completar o quadrado feito uma vez, com letras. A seguir: o que fica embaixo da raiz diz quantas raízes há.',
      visual: DOZE_COMPLETO,
      esboco: 'Responde ao gancho com os azulejos completos de x² + 4x = 12 e aponta para o discriminante.',
    },
  ],
}
