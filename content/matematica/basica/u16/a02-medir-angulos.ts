import type { Aula, Visual } from '@/lib/formation/schema'

// Medir ângulos. O marceneiro precisa copiar uma abertura: como dizer o
// tamanho de um ângulo com um número? Uma volta tem 360 graus; o canto
// reto, 90°; a meia volta, 180°. O transferidor vai no vértice, com a
// linha do 0 sobre um lado. Momento-chave: no Mexa, o aluno segue o outro
// lado do ângulo até a escala e toca o número; se tocar a escala de fora,
// o palco avisa. Depois o erro de Joana (140° num ângulo agudo) e um
// segundo ângulo que abre para o outro lado, em que a escala certa é a de
// fora: a certa é sempre a que começa no 0 sobre o lado deitado.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** O ângulo do Mexa: 40°, com um lado deitado para a direita. */
const QUARENTA = { graus: 40, comprimento: 3 }
/** O segundo ângulo: 110°, com o lado deitado para a esquerda. */
const CENTO_E_DEZ = { graus: -110, inicio: 180, comprimento: 3 }

export const aula: Aula = {
  id: 'B.U16.A2',
  titulo: 'Medir ângulos',
  objetivo: 'Medir um ângulo em graus com o transferidor, escolhendo a escala que começa no 0 sobre um lado, e conferir a medida com o tipo do ângulo (agudo tem menos de 90°).',
  modelo: 'figura',
  esboco: 'A figura o tempo todo. O ângulo do marceneiro; o canto reto com 90° e a meia volta com 180°. O transferidor aparece sobre um ângulo de 40°, com o centro no vértice. Momento-chave: o Mexa de medir, em que o aluno segue o outro lado até a escala e toca o número; a escala de fora dá 140 e o palco avisa. Joana leu 140°: a aposta desmonta o erro com o tipo do ângulo. No segundo Mexa, o ângulo abre para a esquerda e a escala certa é a de fora.',
  vega: 'Ideia central: o grau é uma de 360 partes iguais de uma volta; o reto tem 90°, o raso 180°. Para medir, o centro do transferidor vai no vértice e a linha do 0 sobre um lado; lê-se o número por onde passa o outro lado, na escala que começa no 0 sobre o primeiro lado. Conferir sempre com o tipo do ângulo: agudo tem menos de 90°, obtuso mais. Erros esperados: ler a escala errada (140 em vez de 40); trocar a volta (360°) pela meia volta (180°); usar 180 quando o inteiro era um canto reto. Guie com "Onde está o 0 dessa escala?", "Esse ângulo é agudo ou obtuso? O número combina?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'O marceneiro precisa cortar a madeira com a mesma abertura do desenho. Como dizer o tamanho de um ângulo com um número?',
      visual: fig({ angulo: { graus: 60, comprimento: 3 } }, 'Um ângulo de 60°, com um lado deitado e o arco âmbar. Nenhum número ainda.'),
      esboco: 'Uma necessidade real: copiar uma abertura sem levar o desenho junto.',
    },
    {
      tipo: 'ideia',
      texto: 'Divida uma volta inteira em 360 partes iguais. Cada parte é **1 grau**: 1°. O canto reto tem 90°.',
      fala: 'Divida uma volta inteira em trezentas e sessenta partes iguais. Cada parte é um grau. O canto reto tem noventa graus.',
      visual: fig({ angulo: { graus: 90, comprimento: 2.4, valor: '90°' } }, 'O ângulo abre até o canto reto, com o quadradinho e o valor 90°.'),
      esboco: 'O grau como pedaço de volta. O reto, que o aluno já conhece, ganha o seu número.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E a meia volta, o ângulo raso? Quantos graus ela tem?',
      visual: fig({ angulo: { graus: 90, comprimento: 2.4, valor: '90°' } }, 'O canto reto, com 90°.'),
      opcoes: [
        {
          texto: '180°', certa: true,
          explica: 'Isso. Meia volta são dois cantos retos: ${90 + 90 = 180}$.',
          fala: 'Isso. Meia volta são dois cantos retos: noventa mais noventa, cento e oitenta.',
          mostra: fig({ angulo: { graus: 180, comprimento: 2.4, valor: '180°' } }, 'O lado continua girando até deitar do outro lado: meia volta, 180°.'),
        },
        {
          texto: '360°', erro: 'confunde-volta-e-meia-volta',
          explica: '360° é a volta inteira, quatro cantos retos. A meia volta tem dois: ${90 + 90 = 180}$.',
          fala: 'Trezentos e sessenta é a volta inteira, quatro cantos retos. A meia volta tem dois: noventa mais noventa, cento e oitenta.',
          mostra: fig({ angulo: { graus: 180, comprimento: 2.4, valor: '180°' } }, 'O lado continua girando até deitar do outro lado: meia volta, 180°.'),
        },
      ],
      esboco: 'O raso como dois retos. A errada vê a mesma meia volta se formar.',
    },
    {
      tipo: 'ideia',
      texto: 'O **transferidor** mede ângulos. O centro vai no vértice, e a linha do 0 fica em cima de um lado.',
      visual: fig({ angulo: QUARENTA, transferidor: true }, 'Um ângulo de 40°, e o transferidor azul por cima: o centro no vértice, a base sobre o lado deitado. Duas escalas de números, a de dentro e a de fora.'),
      esboco: 'O instrumento aparece já no lugar certo. As duas escalas ficam à vista: é delas que vem o erro.',
    },
    {
      tipo: 'mexa',
      texto: 'Siga o outro lado do ângulo até a escala. A escala certa tem o 0 em cima do lado deitado.',
      visual: fig({ angulo: QUARENTA, transferidor: true }, 'O mesmo transferidor sobre o ângulo de 40°. Os números são tocáveis.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no número da escala por onde passa o lado do ângulo.',
        sucesso: { graus: 40 },
        mostre: 'O 40 da escala de dentro ganha o anel âmbar, e o ângulo mostra 40°.',
      },
      descoberta: 'O lado passa no 40 da escala de dentro, que começa no 0 sobre o lado deitado. A escala de fora, no mesmo lugar, diz 140: ela começa do outro lado.',
      esboco: 'O momento-chave. Quem toca o 140 vê o palco tremer e o aviso de que essa é a escala de fora.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Joana mediu este mesmo ângulo e anotou 140°. O que aconteceu?',
      fala: 'Joana mediu este mesmo ângulo e anotou cento e quarenta graus. O que aconteceu?',
      visual: fig({ angulo: QUARENTA, transferidor: true, medido: true }, 'O ângulo medido: o 40 com o anel âmbar. O 140 da escala de fora está logo acima.'),
      opcoes: [
        {
          texto: 'Leu a escala que começa do outro lado', certa: true,
          explica: 'Isso. E dava para desconfiar: o ângulo é agudo, tem menos de 90°. Não pode ter 140°.',
          fala: 'Isso. E dava para desconfiar: o ângulo é agudo, tem menos de noventa graus. Não pode ter cento e quarenta.',
        },
        {
          texto: 'Nada: as duas escalas valem', erro: 'le-escala-de-fora',
          explica: 'Só vale a escala com o 0 sobre o lado deitado. O ângulo é agudo, menor que 90°: 140° não pode ser.',
          fala: 'Só vale a escala com o zero sobre o lado deitado. O ângulo é agudo, menor que noventa graus: cento e quarenta não pode ser.',
        },
      ],
      esboco: 'O erro comum dito por outra pessoa. O desmonte usa a aula anterior: um ângulo agudo tem de ter menos de 90°.',
    },
    {
      tipo: 'anote',
      titulo: 'Grau e transferidor',
      definicao: 'O **grau** (1°) é uma de 360 partes iguais de uma volta. O reto tem 90°; o raso, 180°. Mede-se com o **transferidor**.',
      exemplo: { tex: '\\text{agudo} < 90^\\circ < \\text{obtuso} < 180^\\circ', fala: 'o agudo tem menos de noventa graus; o obtuso, mais de noventa e menos de cento e oitenta' },
      alerta: 'Use a escala com o 0 em cima de um lado. Confira: ângulo agudo tem menos de 90°.',
      esboco: 'Na página, o transferidor desenhado sobre um ângulo, com o 0 da escala certa circulado.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora o lado deitado vai para a esquerda. Ache a escala que tem o 0 em cima dele e meça.',
      visual: fig({ angulo: CENTO_E_DEZ, transferidor: { invertido: true } }, 'Um ângulo de 110° com o lado deitado para a esquerda, e o transferidor por cima. Agora o 0 da escala de fora é que está sobre o lado deitado.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no número da escala por onde passa o lado do ângulo.',
        sucesso: { graus: 110 },
        mostre: 'O 110 da escala de fora ganha o anel âmbar, e o ângulo mostra 110°.',
      },
      descoberta: 'A escala certa nem sempre é a de dentro: é a que começa no 0 sobre o lado deitado. Aqui, a de fora, que dá 110°. O ângulo é obtuso, e 110 passa de 90: combina.',
      esboco: 'O mesmo gesto com o ângulo virado. A regra não é "dentro" ou "fora", é "onde está o 0".',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um canto reto foi dividido em dois ângulos iguais. Quantos graus tem cada um?',
      resposta: 45,
      resolucao: [
        { tex: '\\text{reto} = 90^\\circ', fala: 'o reto tem noventa graus' },
        { tex: '90 \\div 2 = 45', fala: 'noventa dividido por dois, quarenta e cinco' },
        { tex: '45^\\circ', fala: 'cada um tem quarenta e cinco graus' },
      ],
      esboco: 'Dobre o canto de uma folha ao meio: a dobra mostra os dois ângulos de 45°. Quem digitar 90 dividiu o raso.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['medir-angulo-n1', 'medir-angulo-n2', 'medir-angulo-n3'],
      esboco: 'Nível 1: ler um ângulo no transferidor desenhado (de 10 em 10), virado para um lado ou para o outro. Nível 2: as duas escalas descritas em palavras, e o tipo do ângulo pelos graus. Nível 3: o ângulo que falta num canto reto ou numa reta, e o canto de cada fatia de uma pizza.',
    },
    {
      tipo: 'fecho',
      texto: 'Agora a abertura tem número: o marceneiro anota 60° e corta igual. Na próxima aula: os três ângulos de um triângulo.',
      fala: 'Agora a abertura tem número: o marceneiro anota sessenta graus e corta igual. Na próxima aula: os três ângulos de um triângulo.',
      visual: fig({ angulo: { graus: 60, comprimento: 3 }, transferidor: true, medido: true }, 'O ângulo do gancho com o transferidor por cima, medido: 60°.'),
      esboco: 'Responde ao gancho com o próprio instrumento.',
    },
  ],
}
