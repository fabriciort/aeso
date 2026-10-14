import type { Aula, Visual } from '@/lib/formation/schema'

// O quadrado da diferença. Um terreno quadrado de x metros perde 3 m na
// frente e 3 m no lado para a calçada: sobra (x − 3)². A aposta vem antes,
// com os três resultados que as pessoas escrevem. O momento-chave é o Mexa
// revelar: os dois pedaços do meio aparecem vermelhos (−3x e −3x) e o canto,
// de lados −3 e −3, aparece positivo: +9. Depois o porquê do canto (menos
// vezes menos), o contraste com (x + 3)² (só o meio muda de sinal) e a
// conferência com x = 5, em que x² − 6x − 9 dá uma área negativa.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** O terreno que sobra: x − 3 por x − 3, com os −3 em vermelho. */
const TERRENO = { base: ['x', -3], altura: ['x', -3] }
const TERRENO_ABERTO = ret({ ...TERRENO, areas: [['x²', '?'], ['?', '?']] }, 'O quadrado com os lados partidos em x e −3 (vermelho): só o x² à vista; os outros três pedaços com "?".')
const TERRENO_PRONTO = ret({ ...TERRENO, areas: true, somaTermos: true }, 'Os quatro pedaços: x², −3x e −3x (vermelhos) e 9 no canto, em âmbar. Embaixo, x² − 3x − 3x + 9 e = x² − 6x + 9.')
const TERRENO_CANTO = ret({ ...TERRENO, areas: true, somaTermos: true, destaque: [1, 1] }, 'Os quatro pedaços, com o canto de −3 por −3 aceso: +9.')

const CONFERE = expr(['com x = 5:', 'x² − 6x − 9 = 25 − 30 − 9 = −14', '(5 − 3)² = 2² = 4', 'x² − 6x + 9 = 25 − 30 + 9 = 4'], 'A conferência com x = 5: o terreno de 2 por 2 dá 4; x² − 6x + 9 também dá 4; x² − 6x − 9 dá −14, uma área negativa.')

/** (x − 5)², do passo a passo. */
const CINCO = { base: ['x', -5], altura: ['x', -5] }
const cinco = (areas: unknown, esboco: string, extra: Record<string, unknown> = {}) => ret({ ...CINCO, areas, ...extra }, esboco)

export const aula: Aula = {
  id: 'AF.U2.A2',
  titulo: 'O quadrado da diferença',
  objetivo: 'Expandir o quadrado de uma diferença, como (x − 3)² = x² − 6x + 9, vendo os dois pedaços do meio que se tiram e o canto, menos vezes menos, que soma; e conferir trocando o x por um número.',
  modelo: 'retangulo',
  esboco: 'Abre num terreno quadrado de x metros que perde 3 m na frente e 3 m no lado. A aposta: (x − 3)² dá x² − 9, x² − 6x − 9 ou x² − 6x + 9? Momento-chave: o aluno revela os quatro pedaços; os dois do meio são vermelhos (−3x, −3x) e o canto, de lados −3 e −3, sai positivo: +9. Depois o porquê do canto, o contraste com (x + 3)² (só o meio muda), a conferência com x = 5, a regra, o passo a passo de (x − 5)² e o caderno com (2x − 3)².',
  vega: 'Ideia central: (x − 3)² = (x − 3)(x − 3) tem quatro pedaços: x², −3x, −3x e (−3) · (−3) = +9. Os dois do meio se tiram (−6x) e o canto soma, porque menos vezes menos dá mais: (a − b)² = a² − 2ab + b². Em relação a (x + 3)², só o sinal do meio muda. Erros esperados: x² − 9 (sem o meio e com o canto negativo), x² − 6x − 9 (o canto negativo), x² + 6x + 9 (o meio positivo), um meio só. No retângulo, os pedaços com área negativa são vermelhos e o canto é âmbar. Conferir com x = 5: o terreno de 2 por 2 tem 4, e x² − 6x − 9 dá −14, uma área negativa. Guie com "Quais lados tem o canto?", "Menos vezes menos dá?", "Confira com x = 5".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um terreno quadrado tem **x** metros de lado. A calçada vai tirar 3 m da frente e 3 m do lado. Quanto de terreno sobra?',
      fala: 'Um terreno quadrado tem x metros de lado. A calçada vai tirar três metros da frente e três do lado. Quanto de terreno sobra?',
      visual: ret({ ...TERRENO }, 'O quadrado com cada lado partido em x e −3, o −3 em vermelho. Quatro pedaços vazios.'),
      esboco: 'O lado que sobra é x − 3 nos dois sentidos: a área é (x − 3)². O −3 é vermelho, como os azulejos negativos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na aula passada, ${(x + 3)^2 = x^2 + 6x + 9}$. Quanto é ${(x - 3)^2}$?',
      fala: 'Na aula passada, x mais três, ao quadrado, deu x ao quadrado mais seis x mais nove. Quanto é x menos três, ao quadrado?',
      visual: ret({ ...TERRENO }, 'O quadrado partido em quatro pedaços vazios, os −3 em vermelho.'),
      opcoes: [
        {
          texto: '$x^2 - 9$', erro: 'quadrado-da-soma-sem-o-meio',
          explica: 'Esse esquece os dois pedaços do meio. O quadrado tem quatro: vamos ver cada um.',
          fala: 'Esse esquece os dois pedaços do meio. O quadrado tem quatro: vamos ver cada um.',
          mostra: TERRENO_ABERTO,
        },
        {
          texto: '$x^2 - 6x - 9$', erro: 'canto-do-quadrado-negativo',
          explica: 'O meio está certo. Mas o canto tem os dois lados −3: olhe o sinal dele.',
          fala: 'O meio está certo. Mas o canto tem os dois lados menos três: olhe o sinal dele.',
          mostra: TERRENO_ABERTO,
        },
        {
          texto: '$x^2 - 6x + 9$', certa: true,
          explica: 'Isso. Os pedaços vão mostrar por que o canto fica com mais.',
          fala: 'Isso. Os pedaços vão mostrar por que o canto fica com mais.',
          mostra: TERRENO_ABERTO,
        },
      ],
      esboco: 'A previsão antes da imagem. Os três resultados que as pessoas escrevem; a explicação adia o porquê para o Mexa.',
    },
    {
      tipo: 'mexa',
      texto: '${(x - 3)^2}$ é ${(x - 3)(x - 3)}$. Descubra os quatro pedaços. Os vermelhos se tiram.',
      fala: 'x menos três, ao quadrado, é x menos três vezes x menos três. Descubra os quatro pedaços. Os vermelhos se tiram.',
      visual: ret({ ...TERRENO, revelar: true, somaTermos: true }, 'Os quatro pedaços com "?". Os toques descobrem x², −3x, −3x (vermelhos) e 9 (âmbar, positivo). No fim: x² − 3x − 3x + 9 e, em âmbar, = x² − 6x + 9.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada pedaço para ver a área.',
        sucesso: { reveladas: 4 },
        mostre: 'Os pedaços mostram x², −3x, −3x e 9. Embaixo: x² − 3x − 3x + 9 = x² − 6x + 9.',
      },
      descoberta: 'Os dois do meio são −3x e se juntam em −6x; o canto é (−3) · (−3) = +9: (x − 3)² = x² − 6x + 9.',
      esboco: 'O momento-chave: os dois pedaços do meio saem vermelhos e o canto, que tem dois lados vermelhos, sai âmbar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O canto tem os dois lados ${-3}$. Por que ele ficou com ${+9}$?',
      fala: 'O canto tem os dois lados menos três. Por que ele ficou com mais nove?',
      visual: TERRENO_CANTO,
      opcoes: [
        {
          texto: 'Menos vezes menos dá mais', certa: true,
          explica: 'Isso. ${(-3) \\cdot (-3) = +9}$: sinais iguais, resultado positivo.',
          fala: 'Isso. Menos três vezes menos três, mais nove: sinais iguais, resultado positivo.',
        },
        {
          texto: 'Está errado: devia ser −9', erro: 'canto-do-quadrado-negativo',
          explica: 'A área do canto é ${(-3) \\cdot (-3)}$. Sinais iguais dão mais: ${+9}$.',
          fala: 'A área do canto é menos três vezes menos três. Sinais iguais dão mais: mais nove.',
        },
      ],
      esboco: 'O canto aceso. A regra dos sinais, vista na negativa dos números, explica o +9.',
    },
    {
      tipo: 'ideia',
      texto: 'Compare com ${(x + 3)^2}$: só o meio muda de sinal. O canto é ${+9}$ nos dois.',
      fala: 'Compare com x mais três, ao quadrado: só o meio muda de sinal. O canto é mais nove nos dois.',
      visual: expr(['(x + 3)² = x² + 6x + 9', '(x − 3)² = x² − 6x + 9'], 'Os dois resultados, um embaixo do outro: x² e 9 iguais, o meio +6x em cima e −6x embaixo.'),
      esboco: 'O contraste com a aula passada: o aluno vê que só o termo do meio troca.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Confira com ${x = 5}$: sobra um terreno de 2 m por 2 m, ou 4 m². Qual destas também dá 4?',
      fala: 'Confira com x igual a cinco: sobra um terreno de dois metros por dois, ou quatro metros quadrados. Qual destas também dá quatro?',
      visual: TERRENO_PRONTO,
      opcoes: [
        {
          texto: '$x^2 - 6x + 9$', certa: true,
          explica: 'Isso. ${25 - 30 + 9 = 4}$, a área do terreno.',
          fala: 'Isso. Vinte e cinco menos trinta mais nove, quatro, a área do terreno.',
          mostra: CONFERE,
        },
        {
          texto: '$x^2 - 6x - 9$', erro: 'canto-do-quadrado-negativo',
          explica: 'Dá ${25 - 30 - 9 = -14}$: uma área negativa. O canto é ${+9}$.',
          fala: 'Dá vinte e cinco menos trinta menos nove, menos catorze: uma área negativa. O canto é mais nove.',
          mostra: CONFERE,
        },
        {
          texto: '$x^2 - 9$', erro: 'quadrado-da-soma-sem-o-meio',
          explica: 'Dá ${25 - 9 = 16}$, e o terreno tem 4. Faltam os dois pedaços de ${-3x}$.',
          fala: 'Dá vinte e cinco menos nove, dezesseis, e o terreno tem quatro. Faltam os dois pedaços de menos três x.',
          mostra: CONFERE,
        },
      ],
      esboco: 'O hábito da unidade: trocar o x por um número. Com x = 5, o canto negativo dá uma área negativa, que não existe.',
    },
    {
      tipo: 'anote',
      titulo: 'O quadrado da diferença',
      definicao: '${(a - b)^2 = a^2 - 2ab + b^2}$: o quadrado do primeiro, **menos** duas vezes o primeiro pelo segundo, **mais** o quadrado do segundo.',
      exemplo: { tex: '(x - 3)^2 = x^2 - 6x + 9', fala: 'x menos três, ao quadrado, é x ao quadrado menos seis x mais nove' },
      alerta: 'O canto é ${+9}$, não ${-9}$: ${(-3) \\cdot (-3) = 9}$.',
      esboco: 'Na página: o quadrado partido, os dois pedaços do meio vermelhos e o canto com +9.',
    },
    {
      tipo: 'passo',
      problema: 'Agora você: ${(x - 5)^2}$.',
      fala: 'Agora você: x menos cinco, ao quadrado.',
      visual: cinco([['?', '?'], ['?', '?']], 'O quadrado com os lados partidos em x e −5 (vermelho). Os quatro pedaços com "?".'),
      passos: [
        {
          pergunta: 'Os cantos: ${x \\cdot x}$ e ${(-5) \\cdot (-5)}$.',
          fala: 'Os cantos: x vezes x, e menos cinco vezes menos cinco.',
          opcoes: [
            { texto: '$x^2$ e $-25$', erro: 'canto-do-quadrado-negativo', explica: 'Sinais iguais dão mais: ${(-5) \\cdot (-5) = 25}$.', fala: 'Sinais iguais dão mais: menos cinco vezes menos cinco, vinte e cinco.', mostra: cinco([['x²', '?'], ['?', 25]], 'Os cantos: x² e 25, em âmbar.') },
            { texto: '$x^2$ e $25$', certa: true, explica: 'Isso. O canto de dois lados vermelhos é positivo.', fala: 'Isso. O canto de dois lados vermelhos é positivo.', mostra: cinco([['x²', '?'], ['?', 25]], 'Os cantos: x² e 25, em âmbar.') },
          ],
          linha: { tex: 'x \\cdot x = x^2, \\quad (-5) \\cdot (-5) = 25', fala: 'x vezes x, x ao quadrado; menos cinco vezes menos cinco, vinte e cinco' },
        },
        {
          pergunta: 'E os dois pedaços do meio, ${x \\cdot (-5)}$?',
          fala: 'E os dois pedaços do meio, x vezes menos cinco?',
          opcoes: [
            { texto: '$+5x$ cada: juntos, $+10x$', erro: 'sinais-diferentes-da-positivo', explica: 'Um mais vezes um menos dá menos: ${x \\cdot (-5) = -5x}$.', fala: 'Um mais vezes um menos dá menos: x vezes menos cinco, menos cinco x.', mostra: cinco(true, 'Os quatro pedaços: x², −5x e −5x (vermelhos) e 25.') },
            { texto: '$-5x$ cada: juntos, $-10x$', certa: true, explica: 'Isso. ${(x - 5)^2 = x^2 - 10x + 25}$.', fala: 'Isso. x menos cinco, ao quadrado, é x ao quadrado menos dez x mais vinte e cinco.', mostra: cinco(true, 'Os quatro pedaços, os dois −5x vermelhos.') },
            { texto: 'Um só: $-5x$', erro: 'produto-so-das-pontas', explica: 'São dois pedaços: um na frente e um no lado, ${-5x}$ cada.', fala: 'São dois pedaços: um na frente e um no lado, menos cinco x cada.', mostra: cinco(true, 'Os quatro pedaços: x², −5x e −5x (vermelhos) e 25.') },
          ],
          linha: { tex: '(x - 5)^2 = x^2 - 5x - 5x + 25 = x^2 - 10x + 25', fala: 'x menos cinco, ao quadrado, é x ao quadrado menos cinco x menos cinco x mais vinte e cinco, x ao quadrado menos dez x mais vinte e cinco' },
        },
      ],
      esboco: 'Os cantos e o meio, com os sinais: o palco enche os cantos e depois os dois pedaços vermelhos do meio.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: desenvolva ${(2x - 3)^2}$. Qual é o número na frente do x?',
      fala: 'No papel: desenvolva dois x menos três, ao quadrado. Qual é o número na frente do x?',
      resposta: -12,
      sinal: true,
      resolucao: [
        { tex: '(2x - 3)^2 = 4x^2 - 6x - 6x + 9', fala: 'dois x menos três, ao quadrado, é quatro x ao quadrado menos seis x menos seis x mais nove' },
        { tex: '= 4x^2 - 12x + 9', fala: 'quatro x ao quadrado menos doze x mais nove' },
        { tex: 'x = 2: \\quad (4 - 3)^2 = 1', fala: 'com x igual a dois: quatro menos três, ao quadrado, um' },
        { tex: '16 - 24 + 9 = 1', fala: 'dezesseis menos vinte e quatro mais nove, um: confere' },
      ],
      esboco: 'O pedaço grande 4x², os dois do meio −6x, o canto +9 e a conferência com x = 2.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fatoracao-quadrado-diferenca-n1', 'fatoracao-quadrado-diferenca-n2', 'fatoracao-quadrado-diferenca-n3'],
      esboco: 'Nível 1: o número que falta em (x − a)², com o quadrado. Nível 2: escolher o desenvolvimento de (px − a)². Nível 3: o coeficiente de x, a área do terreno com x dado e um quadrado de cabeça, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Sobram ${x^2 - 6x + 9}$ m² de terreno. Na próxima aula, um lado cresce e o outro diminui: ${(x + 3)(x - 3)}$.',
      fala: 'Sobram x ao quadrado menos seis x mais nove metros quadrados de terreno. Na próxima aula, um lado cresce e o outro diminui: x mais três, vezes x menos três.',
      visual: TERRENO_PRONTO,
      esboco: 'Responde ao gancho com o quadrado partido e anuncia a soma vezes a diferença.',
    },
  ],
}
