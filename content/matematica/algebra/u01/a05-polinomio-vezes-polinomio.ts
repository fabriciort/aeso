import type { Aula, Visual } from '@/lib/formation/schema'

// Polinômio vezes polinômio. A sala de (x + 2) por (x + 3) começa com uma
// aposta: muita gente escreve x² + 6, multiplicando só as pontas. O retângulo
// tem QUATRO pedaços, e o momento-chave é o Mexa revelar: x², 3x, 2x e 6
// aparecem um a um, e a soma junta os semelhantes, x² + 5x + 6. O hábito de
// conferir com x = 1 desmonta o x² + 6 (dá 7, a sala tem 12). Depois, com um
// lado negativo, (x − 2)(x + 3) = x² + x − 6, com os pedaços vermelhos, e o
// passo a passo de (x + 4)(x − 1).

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** A sala: x + 2 de fundo (a altura) e x + 3 de frente (a base). */
const SALA = { base: ['x', 3], altura: ['x', 2] }
const SALA_PONTAS = ret({ ...SALA, areas: [['x²', '?'], ['?', '6']] }, 'Só as pontas: x² no canto de cima e 6 no de baixo. Os dois pedaços do meio ficam com "?".')
const SALA_PRONTA = ret({ ...SALA, areas: true, somaTermos: true }, 'A sala com os quatro pedaços: x², 3x, 2x e 6. Embaixo, x² + 3x + 2x + 6 e, em âmbar, = x² + 5x + 6.')

/** (x − 2)(x + 3): a altura tem um −2 vermelho. */
const COM_MENOS = { base: ['x', 3], altura: ['x', -2] }

/** (x + 4)(x − 3), do passo a passo. */
const PASSO = { base: ['x', -3], altura: ['x', 4] }
const passo = (areas: string[][], esboco: string, extra: Record<string, unknown> = {}) => ret({ ...PASSO, areas, ...extra }, esboco)

const CONFERE = expr(['com x = 1:', '(1 + 2)(1 + 3) = 3 · 4 = 12', 'x² + 5x + 6 = 1 + 5 + 6 = 12', 'x² + 6 = 1 + 6 = 7'], 'A conferência com x = 1: a sala de 3 por 4 dá 12; x² + 5x + 6 também dá 12; x² + 6 dá só 7.')

export const aula: Aula = {
  id: 'AF.U1.A5',
  titulo: 'Polinômio vezes polinômio',
  objetivo: 'Multiplicar dois binômios, como (x + 2)(x + 3) = x² + 5x + 6 e (x − 2)(x + 3) = x² + x − 6, multiplicando cada termo de um por cada termo do outro, juntando os semelhantes e conferindo com x = 1.',
  modelo: 'retangulo',
  esboco: 'Abre numa sala de (x + 2) por (x + 3). Primeiro a aposta: (x + 2)(x + 3) = x² + 6? O retângulo mostra que as pontas cobrem só dois pedaços. Momento-chave: o aluno revela os quatro pedaços, x², 3x, 2x e 6, e a soma embaixo junta 3x e 2x em 5x. A conferência com x = 1 dá 12 dos dois lados (e 7 para x² + 6). Depois, (x − 2)(x + 3) com os pedaços vermelhos, o passo a passo de (x + 4)(x − 3) e o caderno.',
  vega: 'Ideia central: cada termo do primeiro polinômio multiplica cada termo do segundo; depois juntam-se os semelhantes. (x + 2)(x + 3) = x² + 3x + 2x + 6 = x² + 5x + 6. No retângulo, são quatro pedaços: dois termos de cada lado, 2 × 2 produtos. Com sinais: (x − 2)(x + 3) = x² + 3x − 2x − 6 = x² + x − 6; os pedaços com área negativa aparecem vermelhos. Erros esperados: só as pontas (x² + 6), esquecer um dos pedaços do meio, errar o sinal de −2 · 3, x · x = 2x, e juntar x² com x. O hábito: conferir com x = 1 ou x = 2 dos dois lados. Guie com "Quantos pedaços tem o retângulo?", "Confira com x = 1: a sala e a sua resposta dão o mesmo número?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma sala tem **x + 3** metros de frente e **x + 2** de fundo. Quantos metros quadrados de piso ela pede?',
      fala: 'Uma sala tem x mais três metros de frente e x mais dois de fundo. Quantos metros quadrados de piso ela pede?',
      visual: ret({ ...SALA }, 'A sala: um retângulo com a base partida em x e 3 e a altura partida em x e 2. Os dois cortes fazem quatro pedaços vazios.'),
      esboco: 'Agora os dois lados são somas. O retângulo já aparece partido nos dois sentidos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Muita gente escreve ${(x + 2)(x + 3) = x^2 + 6}$: x vezes x e 2 vezes 3. Está certo?',
      fala: 'Muita gente escreve x mais dois vezes x mais três igual a x ao quadrado mais seis: x vezes x e dois vezes três. Está certo?',
      visual: ret({ ...SALA }, 'A sala partida em quatro pedaços vazios.'),
      opcoes: [
        {
          texto: 'Sim: as pontas bastam', erro: 'produto-so-das-pontas',
          explica: 'O ${x^2}$ e o 6 cobrem só dois pedaços. Olhe a sala: sobram dois, com "?".',
          fala: 'O x ao quadrado e o seis cobrem só dois pedaços. Olhe a sala: sobram dois.',
          mostra: SALA_PONTAS,
        },
        {
          texto: 'Não: falta alguma coisa', certa: true,
          explica: 'Isso. O ${x^2}$ e o 6 cobrem só dois dos quatro pedaços.',
          fala: 'Isso. O x ao quadrado e o seis cobrem só dois dos quatro pedaços.',
          mostra: SALA_PONTAS,
        },
      ],
      esboco: 'A aposta vem antes do retângulo cheio. Em qualquer escolha, as pontas acendem e os pedaços do meio ficam com "?": a imagem mostra o que falta.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada termo de um lado multiplica **cada termo** do outro. Descubra os quatro pedaços.',
      fala: 'Cada termo de um lado multiplica cada termo do outro. Descubra os quatro pedaços.',
      visual: ret({ ...SALA, revelar: true, somaTermos: true }, 'Os quatro pedaços com "?" e borda tracejada. Cada toque descobre uma área, com um pulo. No fim, embaixo: x² + 3x + 2x + 6 e, em âmbar, = x² + 5x + 6.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada pedaço para ver a área.',
        sucesso: { reveladas: 4 },
        mostre: 'Os quatro pedaços mostram x², 3x, 2x e 6. Embaixo: x² + 3x + 2x + 6 = x² + 5x + 6.',
      },
      descoberta: 'Os pedaços do meio são 3x e 2x, que se juntam em 5x: (x + 2)(x + 3) = x² + 5x + 6.',
      esboco: 'O momento-chave: os dois pedaços do meio aparecem, e a soma embaixo junta 3x e 2x. O x² + 6 perdia exatamente esses dois.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Confira com ${x = 1}$: a sala fica com 4 m por 3 m, ou 12 m². Qual destas também dá 12?',
      fala: 'Confira com x igual a um: a sala fica com quatro metros por três, ou doze metros quadrados. Qual destas também dá doze?',
      visual: SALA_PRONTA,
      opcoes: [
        {
          texto: '$x^2 + 5x + 6$', certa: true,
          explica: 'Isso. ${1 + 5 + 6 = 12}$. Trocar o x por um número confere a conta.',
          fala: 'Isso. Um mais cinco mais seis, doze. Trocar o x por um número confere a conta.',
          mostra: CONFERE,
        },
        {
          texto: '$x^2 + 6$', erro: 'produto-so-das-pontas',
          explica: 'Dá ${1 + 6 = 7}$, e a sala tem 12. Faltam os pedaços do meio, ${3x}$ e ${2x}$.',
          fala: 'Dá um mais seis, sete, e a sala tem doze. Faltam os pedaços do meio, três x e dois x.',
          mostra: CONFERE,
        },
      ],
      esboco: 'O hábito da unidade: trocar a letra por um número dos dois lados. O x² + 6 não passa.',
    },
    {
      tipo: 'anote',
      titulo: 'Polinômio vezes polinômio',
      definicao: 'Cada termo do primeiro multiplica **cada termo** do segundo. Depois, junte os semelhantes.',
      exemplo: { tex: '(x + 2)(x + 3) = x^2 + 3x + 2x + 6 = x^2 + 5x + 6', fala: 'x mais dois vezes x mais três é x ao quadrado mais três x mais dois x mais seis, x ao quadrado mais cinco x mais seis' },
      alerta: '${(x + 2)(x + 3)}$ não é ${x^2 + 6}$: faltam os pedaços do meio, ${3x}$ e ${2x}$.',
      esboco: 'Na página: o retângulo com os quatro pedaços e quatro setas, de cada termo da esquerda para cada termo de cima.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora ${(x - 2)(x + 3)}$. O ${-2}$ é vermelho. Quanto vale o pedaço de ${-2}$ por 3?',
      fala: 'Agora x menos dois, vezes x mais três. O menos dois é vermelho. Quanto vale o pedaço de menos dois por três?',
      visual: ret({ ...COM_MENOS, destaque: [1, 1] }, 'O retângulo com a altura partida em x e −2 (vermelho) e a base em x e 3. O pedaço de baixo, à direita, aceso e vazio.'),
      opcoes: [
        {
          texto: '$6$', erro: 'sinais-diferentes-da-positivo',
          explica: 'Um menos vezes um mais dá menos: ${(-2) \\cdot 3 = -6}$.',
          fala: 'Um menos vezes um mais dá menos: menos dois vezes três, menos seis.',
          mostra: ret({ ...COM_MENOS, areas: [['?', '?'], ['?', '−6']], destaque: [1, 1] }, 'O pedaço aceso mostra −6, em vermelho.'),
        },
        {
          texto: '$-6$', certa: true,
          explica: 'Isso. ${(-2) \\cdot 3 = -6}$: um pedaço que se tira.',
          fala: 'Isso. Menos dois vezes três, menos seis: um pedaço que se tira.',
          mostra: ret({ ...COM_MENOS, areas: [['?', '?'], ['?', '−6']], destaque: [1, 1] }, 'O pedaço aceso mostra −6, em vermelho.'),
        },
        {
          texto: '$1$', erro: 'soma-no-lugar-de-multiplicar',
          explica: '1 é ${-2 + 3}$. A área de um pedaço é um produto: ${(-2) \\cdot 3 = -6}$.',
          fala: 'Um é menos dois mais três. A área de um pedaço é um produto: menos dois vezes três, menos seis.',
          mostra: ret({ ...COM_MENOS, areas: [['?', '?'], ['?', '−6']], destaque: [1, 1] }, 'O pedaço aceso mostra −6, em vermelho.'),
        },
      ],
      esboco: 'A regra dos sinais num pedaço só, antes de revelar o retângulo inteiro.',
    },
    {
      tipo: 'mexa',
      texto: 'Revele os quatro pedaços de ${(x - 2)(x + 3)}$. Os vermelhos se tiram.',
      fala: 'Revele os quatro pedaços de x menos dois, vezes x mais três. Os vermelhos se tiram.',
      visual: ret({ ...COM_MENOS, revelar: true, somaTermos: true }, 'Os quatro pedaços com "?". Os toques descobrem x², 3x, −2x e −6 (os dois de baixo em vermelho). No fim: x² + 3x − 2x − 6 e, em âmbar, = x² + x − 6.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada pedaço para ver a área.',
        sucesso: { reveladas: 4 },
        mostre: 'Os pedaços mostram x², 3x, −2x e −6. Embaixo: x² + 3x − 2x − 6 = x² + x − 6.',
      },
      descoberta: '3x − 2x = x: (x − 2)(x + 3) = x² + x − 6. Os pedaços negativos entram na soma com o menos.',
      esboco: 'Os pedaços de baixo ficam vermelhos: tirar 2 do fundo tira uma faixa inteira.',
    },
    {
      tipo: 'passo',
      problema: 'Agora você: ${(x + 4)(x - 3)}$.',
      fala: 'Agora você: x mais quatro, vezes x menos três.',
      visual: passo([['?', '?'], ['?', '?']], 'O retângulo com a altura partida em x e 4 e a base em x e −3 (vermelho). Os quatro pedaços com "?".'),
      passos: [
        {
          pergunta: 'As pontas: ${x \\cdot x}$ e ${4 \\cdot (-3)}$.',
          fala: 'As pontas: x vezes x, e quatro vezes menos três.',
          opcoes: [
            { texto: '$x^2$ e $-12$', certa: true, explica: 'Isso. O canto de baixo fica vermelho: ${-12}$.', fala: 'Isso. O canto de baixo fica vermelho: menos doze.', mostra: passo([['x²', '?'], ['?', '−12']], 'As pontas: x² em cima, à esquerda, e −12 em vermelho, embaixo, à direita.') },
            { texto: '$x^2$ e $12$', erro: 'sinais-diferentes-da-positivo', explica: 'Um mais vezes um menos dá menos: ${4 \\cdot (-3) = -12}$.', fala: 'Um mais vezes um menos dá menos: quatro vezes menos três, menos doze.', mostra: passo([['x²', '?'], ['?', '−12']], 'As pontas: x² e −12, em vermelho.') },
            { texto: '$2x$ e $-12$', erro: 'x-vezes-x-da-2x', explica: '${2x}$ é ${x + x}$. O quadrado de lado x tem área ${x^2}$.', fala: 'Dois x é x mais x. O quadrado de lado x tem área x ao quadrado.', mostra: passo([['x²', '?'], ['?', '−12']], 'As pontas: x² e −12, em vermelho.') },
          ],
          linha: { tex: 'x \\cdot x = x^2, \\quad 4 \\cdot (-3) = -12', fala: 'x vezes x, x ao quadrado; quatro vezes menos três, menos doze' },
        },
        {
          pergunta: 'E os dois pedaços do meio?',
          fala: 'E os dois pedaços do meio?',
          opcoes: [
            { texto: 'Não tem: as pontas bastam', erro: 'produto-so-das-pontas', explica: 'O retângulo tem quatro pedaços. Faltam ${x \\cdot (-3)}$ e ${4 \\cdot x}$.', fala: 'O retângulo tem quatro pedaços. Faltam x vezes menos três e quatro vezes x.', mostra: passo([['x²', '−3x'], ['4x', '−12']], 'Os quatro pedaços cheios: x², −3x (vermelho), 4x e −12 (vermelho).') },
            { texto: '$-3x$ e $4x$', certa: true, explica: 'Isso. ${x \\cdot (-3) = -3x}$ e ${4 \\cdot x = 4x}$.', fala: 'Isso. x vezes menos três, menos três x, e quatro vezes x, quatro x.', mostra: passo([['x²', '−3x'], ['4x', '−12']], 'Os quatro pedaços cheios: x², −3x (vermelho), 4x e −12 (vermelho).') },
            { texto: '$3x$ e $4x$', erro: 'sinais-diferentes-da-positivo', explica: 'O −3 é vermelho: ${x \\cdot (-3) = -3x}$.', fala: 'O menos três é vermelho: x vezes menos três, menos três x.', mostra: passo([['x²', '−3x'], ['4x', '−12']], 'Os quatro pedaços cheios: x², −3x (vermelho), 4x e −12 (vermelho).') },
          ],
          linha: { tex: 'x \\cdot (-3) = -3x, \\quad 4 \\cdot x = 4x', fala: 'x vezes menos três, menos três x; quatro vezes x, quatro x' },
        },
        {
          pergunta: 'Junte os semelhantes: ${x^2 - 3x + 4x - 12}$.',
          fala: 'Junte os semelhantes: x ao quadrado menos três x mais quatro x menos doze.',
          opcoes: [
            { texto: '$2x^2 - 12$', erro: 'junta-termos-nao-semelhantes', explica: '${x^2}$ e x são peças diferentes. Só ${-3x + 4x = x}$ se junta.', fala: 'x ao quadrado e x são peças diferentes. Só menos três x mais quatro x, x, se junta.', mostra: passo([['x²', '−3x'], ['4x', '−12']], 'A soma embaixo: x² − 3x + 4x − 12 e, em âmbar, = x² + x − 12.', { somaTermos: true }) },
            { texto: '$x^2 + x - 12$', certa: true, explica: 'Isso. ${-3x + 4x = x}$: o 1 na frente do x não se escreve.', fala: 'Isso. Menos três x mais quatro x, x: o um na frente do x não se escreve.', mostra: passo([['x²', '−3x'], ['4x', '−12']], 'A soma embaixo: x² − 3x + 4x − 12 e, em âmbar, = x² + x − 12.', { somaTermos: true }) },
          ],
          linha: { tex: 'x^2 - 3x + 4x - 12 = x^2 + x - 12', fala: 'x ao quadrado menos três x mais quatro x menos doze é x ao quadrado mais x menos doze' },
        },
      ],
      esboco: 'As pontas, o meio e a soma: o aluno faz os quatro produtos e junta. O palco enche um pedaço por passo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: multiplique ${(x + 6)(x - 2)}$ e junte os semelhantes. Qual é o número na frente do x?',
      fala: 'No papel: multiplique x mais seis, vezes x menos dois, e junte os semelhantes. Qual é o número na frente do x?',
      resposta: 4,
      sinal: true,
      resolucao: [
        { tex: '(x + 6)(x - 2) = x^2 - 2x + 6x - 12', fala: 'x mais seis vezes x menos dois é x ao quadrado menos dois x mais seis x menos doze' },
        { tex: '= x^2 + 4x - 12', fala: 'x ao quadrado mais quatro x menos doze' },
        { tex: 'x = 3: \\quad (3 + 6)(3 - 2) = 9 \\cdot 1 = 9', fala: 'com x igual a três: três mais seis, vezes três menos dois, nove vezes um, nove' },
        { tex: '3^2 + 4 \\cdot 3 - 12 = 9 + 12 - 12 = 9', fala: 'três ao quadrado mais quatro vezes três menos doze, nove mais doze menos doze, nove: confere' },
      ],
      esboco: 'Os quatro produtos, a soma e a conferência com x = 3.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['polinomios-binomios-n1', 'polinomios-binomios-n2', 'polinomios-binomios-n3'],
      esboco: 'Nível 1: o número que falta em (x + a)(x + b), com o retângulo. Nível 2: escolher o produto com sinais. Nível 3: o coeficiente de x em (px + a)(x + b) e a área da sala com x dado, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A sala pede ${x^2 + 5x + 6}$ m² de piso. Na próxima aula, o caminho de volta: a área e um lado dão o outro lado.',
      fala: 'A sala pede x ao quadrado mais cinco x mais seis metros quadrados de piso. Na próxima aula, o caminho de volta: a área e um lado dão o outro lado.',
      visual: SALA_PRONTA,
      esboco: 'Responde ao gancho com a sala partida em quatro e anuncia a divisão por um monômio.',
    },
  ],
}
