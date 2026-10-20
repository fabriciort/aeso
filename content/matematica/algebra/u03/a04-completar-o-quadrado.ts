import type { Aula, Visual } from '@/lib/formation/schema'

// Completar o quadrado. x² + 6x = 16 não tem zero do lado direito, e o
// lado esquerdo não é um quadrado. O momento-chave é o Mexa completar: nos
// azulejos de x² + 6x, as 6 barras se partem em 3 e 3 ao redor do x², e
// falta um canto de 3 por 3. Com 9 quadradinhos, o lado esquerdo vira
// (x + 3)². O 9 entra dos dois lados, como na balança: (x + 3)² = 25, e a
// primeira aula resolve: x + 3 = ±5, x = 2 ou x = −8. Conferir o −8. Depois,
// o número que completa x² + 10x, e só na conta, x² − 4x = 5.

const az = (azulejos: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos }, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { passo: 1, sinais: true, ...estado }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const EQ_SOLTA = az({ completar: 6, igual: 16 }, 'Os azulejos de x² + 6x, soltos: o x² e as 6 barras em duas filas. Embaixo, x² + 6x = 16.')
const PARTIDA = az({ completar: 6, igual: 16, partido: true }, 'As barras partidas, 3 de pé e 3 deitadas ao redor do x², e o canto vazio tracejado. Embaixo, x² + 6x = 16 e "falta um canto 3 por 3".')
const EQ_COMPLETA = az({ completar: 6, igual: 16, completo: true }, 'O canto cheio com 9 quadradinhos. Embaixo, x² + 6x + 9 = 16 + 9, com os dois "+ 9" sublinhados, e em âmbar (x + 3)² = 25.')

const R_INICIO = reta({ de: -9, ate: 3, marcas: [-8, -3, 0, 2] }, 'A reta de −9 a 3, com o −3 marcado: x + 3 mede a distância do x até o −3.')
const R_SALTOS = reta({ de: -9, ate: 3, marcas: [-8, -3, 0, 2], saltos: [[-3, 2, '+5'], [-3, -8, '−5']] }, 'Do −3 saem dois pulos de 5: para o 2 e para o −8.')
const R_UM = reta({ de: -9, ate: 3, marcas: [-8, -3, 0, 2], numeros: [2], saltos: [[-3, 2, '+5'], [-3, -8, '−5']] }, 'Os dois pulos, e o 2 aceso.')
const R_DOIS = reta({ de: -9, ate: 3, marcas: [-8, -3, 0, 2], numeros: [-8, 2], saltos: [[-3, 2, '+5'], [-3, -8, '−5']] }, 'Os dois pulos, e o 2 e o −8 acesos: as duas raízes.')

const DEZ = (estado: Record<string, unknown>, esboco: string) => az({ completar: 10, ...estado }, esboco)

const QUATRO = 'x² − 4x = 5'

export const aula: Aula = {
  id: 'AF.U3.A4',
  titulo: 'Completar o quadrado',
  objetivo: 'Resolver x² + bx = c completando o quadrado: somar o quadrado da metade de b dos dois lados, escrever o lado do x como (x + b/2)², resolver como x² = k, com as duas raízes, e conferir.',
  modelo: 'livre',
  esboco: 'Abre em x² + 6x = 16, com os azulejos soltos: sem zero do lado direito e sem um quadrado do lado esquerdo. Momento-chave: o Mexa completar, em que as 6 barras se partem em 3 e 3 ao redor do x² e o canto de 3 por 3 se enche com 9 quadradinhos: x² + 6x + 9 = (x + 3)². A aposta da balança: o 9 entra dos dois lados. O passo a passo resolve (x + 3)² = 25 na reta, a partir do −3, e a aposta confere o −8. O anote dá a regra. A aposta do x² + 10x pede o 25 (a metade, ao quadrado). O último passo a passo faz x² − 4x = 5 só na conta.',
  vega: 'Ideia central: x² + bx vira um quadrado quando se soma (b/2)². Nos azulejos, as b barras se partem em duas metades ao redor do x², b/2 de cada lado, e falta o canto de b/2 por b/2. Como é uma equação, o que se soma de um lado se soma do outro (a balança): x² + 6x + 9 = 16 + 9, (x + 3)² = 25. Daí, como em x² = k: x + 3 = 5 ou x + 3 = −5, x = 2 ou x = −8. Com b negativo, a metade é negativa e o canto continua positivo: x² − 4x + 4 = (x − 2)². Sempre se confere na equação do começo. Erros esperados: somar 9 só do lado esquerdo; completar com a metade (3) ou com b ao quadrado (36) em vez do quadrado da metade (9); pôr o canto com o sinal de menos (x² − 4x − 4); esquecer a raiz negativa (x + 3 = 5 só); desfazer o + 3 somando 3; achar que (−8)² = −64. Guie com "Quantas barras vão para cada lado do x²?", "Que canto falta para fechar o quadrado?", "O que você pôs de um lado, pôs do outro?", "E o oposto, ao quadrado?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: '${x^2 + 6x = 16}$. Não há zero do lado direito, e o lado esquerdo não é um quadrado. Como resolver?',
      fala: 'x ao quadrado mais seis x igual a dezesseis. Não há zero do lado direito, e o lado esquerdo não é um quadrado. Como resolver?',
      visual: EQ_SOLTA,
      esboco: 'A primeira aula resolvia um quadrado igual a um número. Os azulejos sugerem: e se o lado esquerdo virasse um quadrado?',
    },
    {
      tipo: 'mexa',
      texto: 'Um ${x^2}$ e 6 barras. Dá para montar um quadrado com eles?',
      fala: 'Um x ao quadrado e seis barras. Dá para montar um quadrado com eles?',
      visual: az({ completar: 6 }, 'Só o lado esquerdo: o x² e as 6 barras soltas, com x² + 6x embaixo. O primeiro toque parte as barras; o segundo enche o canto.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos azulejos: as barras se partem ao redor do x².',
        sucesso: { completo: true },
        mostre: 'Metade das barras de cada lado do x². O canto de 3 por 3 se enche com 9.',
      },
      descoberta: 'As 6 barras se partem em 3 e 3. Falta um canto de 3 por 3: com 9 quadradinhos, x² + 6x + 9 = (x + 3)².',
      esboco: 'O momento-chave: o primeiro toque parte as barras e mostra o canto vazio; o segundo enche o canto com 9 quadradinhos novos, e o "+ 9" aparece dos dois lados.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O canto pede 9 quadradinhos do lado esquerdo. E o lado direito, o 16?',
      fala: 'O canto pede nove quadradinhos do lado esquerdo. E o lado direito, o dezesseis?',
      visual: PARTIDA,
      opcoes: [
        {
          texto: 'Fica 16', erro: 'opera-so-de-um-lado',
          explica: 'Na balança, pôr 9 num prato só faz ele descer. Para ficar igual, o 9 entra dos dois lados.',
          fala: 'Na balança, pôr nove num prato só faz ele descer. Para ficar igual, o nove entra dos dois lados.',
          mostra: EQ_COMPLETA,
        },
        {
          texto: 'Vira ${16 + 9}$', certa: true,
          explica: 'Isso. O que entra de um lado entra do outro: ${(x + 3)^2 = 25}$.',
          fala: 'Isso. O que entra de um lado entra do outro: x mais três, ao quadrado, igual a vinte e cinco.',
          mostra: EQ_COMPLETA,
        },
      ],
      esboco: 'A balança da equação do primeiro grau volta: o 9 entra dos dois lados. Embaixo, (x + 3)² = 25.',
    },
    {
      tipo: 'passo',
      problema: 'Agora é como na primeira aula: resolva ${(x + 3)^2 = 25}$.',
      fala: 'Agora é como na primeira aula: resolva x mais três, ao quadrado, igual a vinte e cinco.',
      visual: R_INICIO,
      passos: [
        {
          pergunta: '${x + 3}$ ao quadrado dá 25. Quanto pode valer ${x + 3}$?',
          fala: 'x mais três ao quadrado dá vinte e cinco. Quanto pode valer x mais três?',
          opcoes: [
            { texto: 'Só 5', erro: 'raiz-so-positiva', explica: 'Falta um: ${(-5)^2 = 25}$. ${x + 3}$ pode ser 5 ou −5.', fala: 'Falta um: menos cinco ao quadrado também dá vinte e cinco. x mais três pode ser cinco ou menos cinco.', mostra: R_SALTOS },
            { texto: '5 ou −5', certa: true, explica: 'Isso. ${x + 3 = \\pm 5}$. Na reta, x fica a 5 do −3.', fala: 'Isso. x mais três é mais ou menos cinco. Na reta, x fica a cinco do menos três.', mostra: R_SALTOS },
          ],
          linha: { tex: 'x + 3 = \\pm 5', fala: 'x mais três igual a mais ou menos cinco' },
        },
        {
          pergunta: 'Se ${x + 3 = 5}$, quanto vale x?',
          fala: 'Se x mais três é cinco, quanto vale x?',
          opcoes: [
            { texto: '8', erro: 'desfaz-com-a-mesma-operacao', explica: 'Somar 3 não desfaz o + 3. Tire 3 dos dois lados: ${x = 5 - 3}$.', fala: 'Somar três não desfaz o mais três. Tire três dos dois lados: x igual a cinco menos três.', mostra: R_SALTOS },
            { texto: '2', certa: true, explica: 'Isso. ${x = 5 - 3 = 2}$.', fala: 'Isso. x é cinco menos três, dois.', mostra: R_UM },
          ],
          linha: { tex: 'x = 2', fala: 'x igual a dois' },
        },
        {
          pergunta: 'Se ${x + 3 = -5}$, quanto vale x?',
          fala: 'Se x mais três é menos cinco, quanto vale x?',
          opcoes: [
            { texto: '−8', certa: true, explica: 'Isso. ${x = -5 - 3 = -8}$. As raízes são 2 e −8.', fala: 'Isso. x é menos cinco menos três, menos oito. As raízes são dois e menos oito.', mostra: R_DOIS },
            { texto: '−2', erro: 'desfaz-com-a-mesma-operacao', explica: 'Somar 3 não desfaz o + 3. Tire 3: ${x = -5 - 3}$.', fala: 'Somar três não desfaz o mais três. Tire três: x igual a menos cinco menos três.', mostra: R_UM },
          ],
          linha: { tex: 'x = -8', fala: 'x igual a menos oito' },
        },
      ],
      esboco: 'Na reta, o −3 é o centro: x fica a 5 dele, para os dois lados. Cada passo certo acende um pulo ou uma raiz.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Confira o −8 na equação do começo, ${x^2 + 6x = 16}$:',
      fala: 'Confira o menos oito na equação do começo, x ao quadrado mais seis x igual a dezesseis:',
      visual: R_DOIS,
      opcoes: [
        {
          texto: '${-64 - 48}$: não serve', erro: 'potencia-sinal-fora-dos-parenteses',
          explica: '${(-8)^2 = (-8) \\cdot (-8) = 64}$, positivo. E ${64 - 48 = 16}$.',
          fala: 'Menos oito ao quadrado é menos oito vezes menos oito, sessenta e quatro, positivo. E sessenta e quatro menos quarenta e oito é dezesseis.',
          mostra: expr(['(−8)² + 6 · (−8)', '= 64 − 48 = 16'], 'A conferência: (−8)² + 6 · (−8) = 64 − 48 = 16.'),
        },
        {
          texto: '${64 - 48 = 16}$: serve', certa: true,
          explica: 'Isso. O 2 também: ${4 + 12 = 16}$. As duas raízes conferem.',
          fala: 'Isso. O dois também: quatro mais doze, dezesseis. As duas raízes conferem.',
          mostra: expr(['(−8)² + 6 · (−8) = 64 − 48 = 16', '2² + 6 · 2 = 4 + 12 = 16'], 'As duas conferências, uma embaixo da outra.'),
        },
      ],
      esboco: 'A raiz negativa assusta: o hábito de conferir mostra que ela serve. O (−8)² com parênteses é positivo.',
    },
    {
      tipo: 'anote',
      titulo: 'Completar o quadrado',
      definicao: 'Some o **quadrado da metade** do número do x **dos dois lados**. O lado do x vira um quadrado: resolva como ${x^2 = k}$.',
      exemplo: { tex: 'x^2 + 6x + 9 = 16 + 9 \\;\\Rightarrow\\; (x + 3)^2 = 25', fala: 'x ao quadrado mais seis x mais nove igual a dezesseis mais nove: x mais três, ao quadrado, igual a vinte e cinco' },
      alerta: 'O 9 entra **dos dois lados**, como na balança. E a raiz tem dois sinais: ${x + 3 = \\pm 5}$.',
      esboco: 'Na página: os azulejos com o canto de 3 por 3 cheio, a metade de 6 ao quadrado, e as duas raízes 2 e −8.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${x^2 + 10x}$, que número completa o quadrado?',
      fala: 'Em x ao quadrado mais dez x, que número completa o quadrado?',
      visual: DEZ({ partido: true }, 'As 10 barras partidas em 5 e 5 ao redor do x², e o canto vazio de 5 por 5. Embaixo, "falta um canto 5 por 5".'),
      opcoes: [
        {
          texto: '5', erro: 'completa-com-a-metade',
          explica: 'O 5 é o lado do canto. O canto é 5 por 5: ${5^2 = 25}$ quadradinhos.',
          fala: 'O cinco é o lado do canto. O canto é cinco por cinco: cinco ao quadrado, vinte e cinco quadradinhos.',
          mostra: DEZ({ completo: true }, 'O canto cheio com 25 quadradinhos. Embaixo, x² + 10x + 25 = (x + 5)².'),
        },
        {
          texto: '25', certa: true,
          explica: 'Isso. A metade de 10 é 5, e ${5^2 = 25}$: ${x^2 + 10x + 25 = (x + 5)^2}$.',
          fala: 'Isso. A metade de dez é cinco, e cinco ao quadrado é vinte e cinco: x ao quadrado mais dez x mais vinte e cinco é x mais cinco, ao quadrado.',
          mostra: DEZ({ completo: true }, 'O canto cheio com 25 quadradinhos. Embaixo, x² + 10x + 25 = (x + 5)².'),
        },
        {
          texto: '100', erro: 'completa-com-b-ao-quadrado',
          explica: 'O 100 é ${10^2}$. Mas as barras se partem: o canto é 5 por 5, ${5^2 = 25}$.',
          fala: 'O cem é dez ao quadrado. Mas as barras se partem: o canto é cinco por cinco, cinco ao quadrado, vinte e cinco.',
          mostra: DEZ({ completo: true }, 'O canto cheio com 25 quadradinhos. Embaixo, x² + 10x + 25 = (x + 5)².'),
        },
      ],
      esboco: 'A regra do anote com outro b: a metade, ao quadrado. As barras partidas mostram o canto de 5 por 5.',
    },
    {
      tipo: 'passo',
      problema: 'Só na conta: resolva ${x^2 - 4x = 5}$ completando o quadrado.',
      fala: 'Só na conta: resolva x ao quadrado menos quatro x igual a cinco, completando o quadrado.',
      visual: expr([QUATRO], 'A equação x² − 4x = 5, sozinha.'),
      passos: [
        {
          pergunta: 'A metade de −4 é −2. Que número completa o quadrado?',
          fala: 'A metade de menos quatro é menos dois. Que número completa o quadrado?',
          opcoes: [
            { texto: '−4', erro: 'canto-do-quadrado-negativo', explica: 'O canto é ${(-2) \\cdot (-2) = 4}$, positivo: menos vezes menos dá mais.', fala: 'O canto é menos dois vezes menos dois, quatro, positivo: menos vezes menos dá mais.', mostra: expr([QUATRO, '(−2) · (−2) = 4'], 'Embaixo: (−2) · (−2) = 4.') },
            { texto: '4', certa: true, explica: 'Isso. ${(-2)^2 = 4}$, dos dois lados: ${x^2 - 4x + 4 = 5 + 4}$.', fala: 'Isso. Menos dois ao quadrado é quatro, dos dois lados: x ao quadrado menos quatro x mais quatro igual a cinco mais quatro.', mostra: expr([QUATRO, 'x² − 4x + 4 = 5 + 4'], 'Embaixo: x² − 4x + 4 = 5 + 4.') },
            { texto: '16', erro: 'completa-com-b-ao-quadrado', explica: '16 é ${(-4)^2}$. O canto é a metade ao quadrado: ${(-2)^2 = 4}$.', fala: 'Dezesseis é menos quatro ao quadrado. O canto é a metade ao quadrado: menos dois ao quadrado, quatro.', mostra: expr([QUATRO, '(−2)² = 4'], 'Embaixo: (−2)² = 4.') },
          ],
          linha: { tex: 'x^2 - 4x + 4 = 5 + 4', fala: 'x ao quadrado menos quatro x mais quatro igual a cinco mais quatro' },
        },
        {
          pergunta: 'Então ${x^2 - 4x + 4 = 9}$ é:',
          fala: 'Então x ao quadrado menos quatro x mais quatro igual a nove é:',
          opcoes: [
            { texto: '${(x + 2)^2 = 9}$', erro: 'fatora-com-o-sinal-trocado', explica: '${(x + 2)^2}$ dá ${x^2 + 4x + 4}$. Com −4x, é ${(x - 2)^2}$.', fala: 'x mais dois, ao quadrado, dá x ao quadrado mais quatro x mais quatro. Com menos quatro x, é x menos dois, ao quadrado.', mostra: expr([QUATRO, '(x + 2)² = x² + 4x + 4'], 'Embaixo: (x + 2)² = x² + 4x + 4, o meio com o sinal trocado.') },
            { texto: '${(x - 2)^2 = 9}$', certa: true, explica: 'Isso. A metade, −2, vai para dentro do parêntese.', fala: 'Isso. A metade, menos dois, vai para dentro do parêntese.', mostra: expr([QUATRO, '(x − 2)² = 9'], 'Embaixo: (x − 2)² = 9.') },
          ],
          linha: { tex: '(x - 2)^2 = 9', fala: 'x menos dois, ao quadrado, igual a nove' },
        },
        {
          pergunta: '${x - 2 = \\pm 3}$. As raízes são:',
          fala: 'x menos dois é mais ou menos três. As raízes são:',
          opcoes: [
            { texto: 'Só 5', erro: 'raiz-so-positiva', explica: 'Falta o ${x - 2 = -3}$: x = −1. Confira: ${1 + 4 = 5}$.', fala: 'Falta o x menos dois igual a menos três: x igual a menos um. Confira: um mais quatro, cinco.', mostra: expr([QUATRO, 'x − 2 = 3 ou x − 2 = −3'], 'Embaixo: x − 2 = 3 ou x − 2 = −3.') },
            { texto: '1 e −5', erro: 'desfaz-com-a-mesma-operacao', explica: 'Com x = 1, ${1 - 4 = -3}$, não 5. De ${x - 2 = \\pm 3}$, some 2: 5 e −1.', fala: 'Com x igual a um, um menos quatro dá menos três, não cinco. De x menos dois igual a mais ou menos três, some dois: cinco e menos um.', mostra: expr([QUATRO, 'x = 1: 1 − 4 = −3'], 'Embaixo: com 1, 1 − 4 = −3.') },
            { texto: '5 e −1', certa: true, explica: 'Isso. Confira: ${25 - 20 = 5}$ e ${1 + 4 = 5}$.', fala: 'Isso. Confira: vinte e cinco menos vinte, cinco, e um mais quatro, cinco.', mostra: expr([QUATRO, 'x = 5 ou x = −1'], 'Embaixo, maior: x = 5 ou x = −1.') },
          ],
          linha: { tex: 'x = 5 \\;\\text{ ou }\\; x = -1', fala: 'x igual a cinco, ou x igual a menos um' },
        },
      ],
      esboco: 'Sem azulejos (o player não desenha barras negativas): a metade negativa, o canto positivo, o quadrado com menos e as duas raízes conferidas.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: complete o quadrado em ${x^2 + 8x = 9}$ e ache as raízes. Qual é a menor?',
      fala: 'No papel: complete o quadrado em x ao quadrado mais oito x igual a nove, e ache as raízes. Qual é a menor?',
      resposta: -9,
      sinal: true,
      resolucao: [
        { tex: 'x^2 + 8x + 16 = 9 + 16', fala: 'x ao quadrado mais oito x mais dezesseis igual a nove mais dezesseis' },
        { tex: '(x + 4)^2 = 25 \\;\\Rightarrow\\; x + 4 = \\pm 5', fala: 'x mais quatro, ao quadrado, igual a vinte e cinco: x mais quatro igual a mais ou menos cinco' },
        { tex: 'x = 1 \\;\\text{ ou }\\; x = -9', fala: 'x igual a um, ou x igual a menos nove' },
        { tex: '\\text{confere: } 1 + 8 = 9, \\quad 81 - 72 = 9', fala: 'confere: um mais oito, nove; oitenta e um menos setenta e dois, nove' },
      ],
      esboco: 'O caminho inteiro sozinho: a metade de 8 é 4, o canto 16 dos dois lados, as duas raízes e a conferência.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['segundo-grau-completar-n1', 'segundo-grau-completar-n2', 'segundo-grau-completar-n3'],
      esboco: 'Nível 1: o número que completa x² + bx + □, com as barras partidas no palco. Nível 2: o número com b negativo, ou o lado direito depois de completar. Nível 3: a maior ou a menor raiz de x² + bx = c, completando o quadrado, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: '${x^2 + 6x = 16}$ deu 2 e −8: um canto de 9 dos dois lados. A seguir: completar o quadrado com letras, de uma vez, e chegar à fórmula.',
      fala: 'x ao quadrado mais seis x igual a dezesseis deu dois e menos oito: um canto de nove dos dois lados. A seguir: completar o quadrado com letras, de uma vez, e chegar à fórmula.',
      visual: EQ_COMPLETA,
      esboco: 'Responde ao gancho com o quadrado completo e as raízes, e abre a fórmula, primeira aula da outra parte da unidade.',
    },
  ],
}
