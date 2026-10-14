import type { Aula, Visual } from '@/lib/formation/schema'

// Monômio vezes polinômio. Na Linguagem algébrica, a horta de 2 por (x + 3)
// se partiu em 2x e 6. Agora o fundo também tem letra: o galpão de 3x por
// (x + 4). O momento-chave é o Mexa revelar: o aluno toca cada pedaço e vê
// 3x² no grande e 12x no pequeno. O pedaço do 4 também tem 3x de fundo, então
// vale 12x (não 4, nem 12). O hábito de conferir com x = 2 desmonta os dois
// erros. Depois, um trinômio com um termo negativo, 2x(x² − 3x + 1): o pedaço
// do −3x aparece vermelho e vale −6x². Por fim, um menos fora, −3x(x − 2).

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** O galpão: 3x de fundo, x + 4 de frente. */
const GALPAO = { base: ['x', 4], altura: ['3x'] }
const GALPAO_PRONTO = ret({ ...GALPAO, areas: true, somaTermos: true }, 'O galpão partido em x e 4, com 3x de fundo: 3x² no pedaço grande, 12x no pequeno, e 3x² + 12x embaixo.')

/** 2x(x² − 3x + 1): três pedaços, o do meio negativo. */
const TRES = { base: ['x²', '−3x', 1], altura: ['2x'], tamanhoLetra: 1.5 }

/** −3x(x − 2): o fundo é negativo. */
const MENOS_FORA = { base: ['x', -2], altura: ['−3x'] }
const menosFora = (areas: string[], esboco: string, extra: Record<string, unknown> = {}) => ret({ ...MENOS_FORA, areas: [areas], ...extra }, esboco)

const CONFERE = expr(['com x = 2:', '3x(x + 4) = 6 · 6 = 36', '3x² + 12x = 12 + 24 = 36'], 'A conferência com x = 2, em três linhas: o galpão de 6 por 6 dá 36, e 3x² + 12x também dá 36.')

export const aula: Aula = {
  id: 'AF.U1.A4',
  titulo: 'Monômio vezes polinômio',
  objetivo: 'Multiplicar um monômio por um polinômio, como 3x(x + 4) = 3x² + 12x e 2x(x² − 3x + 1) = 2x³ − 6x² + 2x, multiplicando o monômio por cada termo, com os sinais, e conferir trocando o x por um número.',
  modelo: 'retangulo',
  esboco: 'Abre num galpão de 3x de fundo e x + 4 de frente. O aluno aposta na área do pedaço grande (3x · x = 3x², não 4x) e depois revela os dois pedaços: 3x² e 12x. Momento-chave: o pedaço do 4 também tem 3x de fundo e mostra 12x. A conferência com x = 2 desmonta 3x² + 12 e 3x² + 4. Depois, 2x(x² − 3x + 1), com o pedaço do −3x vermelho, e um menos fora, −3x(x − 2), no passo a passo.',
  vega: 'Ideia central: o monômio de fora multiplica cada termo de dentro, como o número na distributiva da Linguagem algébrica; em cada produto, números com números e letras com letras (os expoentes se somam, como em multiplicar monômios). 3x(x + 4) = 3x · x + 3x · 4 = 3x² + 12x. No retângulo: 3x de fundo, a frente partida em x e 4; os dois pedaços têm o mesmo fundo. Com sinais: 2x · (−3x) = −6x², e −3x · (−2) = 6x. Erros esperados: multiplicar só o primeiro termo (3x² + 4), perder a letra no pedaço do número (3x² + 12), x · x = 2x (4x no lugar de 3x²), errar o sinal, e juntar −3x² + 6x em 3x². Guie com "Quanto mede o fundo do pedaço pequeno?", "Confira com x = 2: as duas formas dão o mesmo número?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um galpão tem **3x** metros de fundo e **x + 4** de frente. Na horta, o fundo era um número. Agora tem letra. Qual é a área?',
      fala: 'Um galpão tem três x metros de fundo e x mais quatro de frente. Na horta, o fundo era um número. Agora tem letra. Qual é a área?',
      visual: ret({ ...GALPAO }, 'O galpão: um retângulo de 3x de altura, com a base partida em x e 4. Ainda sem nada dentro.'),
      esboco: 'A mesma pergunta da horta, um degrau acima: o lado que multiplica também é uma expressão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Comece pelo pedaço grande: **3x** de fundo e **x** de frente. Qual é a área dele?',
      fala: 'Comece pelo pedaço grande: três x de fundo e x de frente. Qual é a área dele?',
      visual: ret({ ...GALPAO, destaque: [0, 0] }, 'O pedaço grande aceso, ainda vazio.'),
      opcoes: [
        {
          texto: '$3x^2$', certa: true,
          explica: 'Isso. ${3x \\cdot x = 3 \\cdot x \\cdot x = 3x^2}$: números com números, letras com letras.',
          fala: 'Isso. Três x vezes x é três vezes x vezes x, três x ao quadrado: números com números, letras com letras.',
          mostra: ret({ ...GALPAO, areas: [['3x²', '?']], destaque: [0, 0] }, 'O pedaço grande mostra 3x²; o pequeno, "?".'),
        },
        {
          texto: '$4x$', erro: 'x-vezes-x-da-2x',
          explica: '${4x}$ seria ${3x + x}$, juntar. Multiplicar x por x dá x²: ${3x \\cdot x = 3x^2}$.',
          fala: 'Quatro x seria três x mais x, juntar. Multiplicar x por x dá x ao quadrado: três x vezes x, três x ao quadrado.',
          mostra: ret({ ...GALPAO, areas: [['3x²', '?']], destaque: [0, 0] }, 'O pedaço grande mostra 3x²; o pequeno, "?".'),
        },
      ],
      esboco: 'Retoma a multiplicação de monômios dentro do retângulo, antes do pedaço que pega.',
    },
    {
      tipo: 'mexa',
      texto: 'E o galpão inteiro? O pedaço do 4 também tem **3x** de fundo.',
      fala: 'E o galpão inteiro? O pedaço do quatro também tem três x de fundo.',
      visual: ret({ ...GALPAO, revelar: true, somaTermos: true }, 'Os dois pedaços com "?" e borda tracejada. Cada toque descobre uma área, com um pulo; no fim aparece 3x² + 12x embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada pedaço para ver a área.',
        sucesso: { reveladas: 2 },
        mostre: 'Os dois pedaços mostram 3x² e 12x. Embaixo aparece 3x² + 12x.',
      },
      descoberta: 'O 3x multiplica o x e também o 4: 3x · 4 = 12x. 3x(x + 4) = 3x² + 12x.',
      esboco: 'O momento-chave: o pedaço do 4 pula e mostra 12x, com a letra. Ele é uma faixa que cresce junto com o fundo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Confira com ${x = 2}$: o galpão fica com 6 m por 6 m, ou 36 m². Qual destas também dá 36?',
      fala: 'Confira com x igual a dois: o galpão fica com seis metros por seis, ou trinta e seis metros quadrados. Qual destas também dá trinta e seis?',
      visual: GALPAO_PRONTO,
      opcoes: [
        {
          texto: '$3x^2 + 4$', erro: 'distributiva-parcial',
          explica: 'Dá ${12 + 4 = 16}$, não 36. O 3x multiplica também o 4.',
          fala: 'Dá doze mais quatro, dezesseis, não trinta e seis. O três x multiplica também o quatro.',
          mostra: CONFERE,
        },
        {
          texto: '$3x^2 + 12$', erro: 'esquece-a-letra-no-produto',
          explica: 'Dá ${12 + 12 = 24}$. O pedaço do 4 é ${3x \\cdot 4 = 12x}$: com x = 2, vale 24.',
          fala: 'Dá doze mais doze, vinte e quatro. O pedaço do quatro é três x vezes quatro, doze x: com x igual a dois, vale vinte e quatro.',
          mostra: CONFERE,
        },
        {
          texto: '$3x^2 + 12x$', certa: true,
          explica: 'Isso. ${3 \\cdot 4 + 12 \\cdot 2 = 12 + 24 = 36}$. Trocar o x por um número confere a conta.',
          fala: 'Isso. Três vezes quatro mais doze vezes dois, doze mais vinte e quatro, trinta e seis. Trocar o x por um número confere a conta.',
          mostra: CONFERE,
        },
      ],
      esboco: 'O hábito da unidade: trocar a letra por um número dos dois lados. Os dois erros dão outro número.',
    },
    {
      tipo: 'anote',
      titulo: 'Monômio vezes polinômio',
      definicao: 'O monômio de fora multiplica **cada termo** de dentro: números com números, letras com letras.',
      exemplo: { tex: '3x(x + 4) = 3x \\cdot x + 3x \\cdot 4 = 3x^2 + 12x', fala: 'três x, abre parênteses, x mais quatro, é três x vezes x mais três x vezes quatro, três x ao quadrado mais doze x' },
      alerta: 'O pedaço do 4 também tem 3x de fundo: vale ${12x}$, não 4 nem 12.',
      esboco: 'Na página: o galpão partido, com 3x² e 12x dentro, e setas do 3x de fora até cada termo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora ${2x(x^2 - 3x + 1)}$. O pedaço do ${-3x}$ é vermelho: ele se tira. Qual é a área dele?',
      fala: 'Agora dois x, abre parênteses, x ao quadrado menos três x mais um. O pedaço do menos três x é vermelho: ele se tira. Qual é a área dele?',
      visual: ret({ ...TRES }, 'Um retângulo de 2x de altura, a base partida em x², −3x (o rótulo em vermelho) e 1. Ainda vazio.'),
      opcoes: [
        {
          texto: '$6x^2$', erro: 'sinais-diferentes-da-positivo',
          explica: 'Um mais vezes um menos dá menos: ${2x \\cdot (-3x) = -6x^2}$.',
          fala: 'Um mais vezes um menos dá menos: dois x vezes menos três x, menos seis x ao quadrado.',
          mostra: ret({ ...TRES, areas: [['?', '−6x²', '?']], destaque: [0, 1] }, 'O pedaço do meio mostra −6x², em vermelho.'),
        },
        {
          texto: '$-6x$', erro: 'esquece-a-letra-no-produto',
          explica: 'Os dois têm x: ${x \\cdot x = x^2}$. A área é ${-6x^2}$.',
          fala: 'Os dois têm x: x vezes x, x ao quadrado. A área é menos seis x ao quadrado.',
          mostra: ret({ ...TRES, areas: [['?', '−6x²', '?']], destaque: [0, 1] }, 'O pedaço do meio mostra −6x², em vermelho.'),
        },
        {
          texto: '$-6x^2$', certa: true,
          explica: 'Isso. ${2 \\cdot (-3) = -6}$ e ${x \\cdot x = x^2}$.',
          fala: 'Isso. Dois vezes menos três, menos seis, e x vezes x, x ao quadrado.',
          mostra: ret({ ...TRES, areas: [['?', '−6x²', '?']], destaque: [0, 1] }, 'O pedaço do meio mostra −6x², em vermelho.'),
        },
      ],
      esboco: 'A regra dos sinais volta dentro do retângulo: o pedaço negativo continua vermelho e a área leva o menos.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora o retângulo todo: ${2x(x^2 - 3x + 1)}$.',
      fala: 'Agora o retângulo todo: dois x, abre parênteses, x ao quadrado menos três x mais um.',
      visual: ret({ ...TRES, revelar: true, somaTermos: true }, 'Os três pedaços com "?". Cada toque descobre uma área: 2x³, −6x² (vermelho) e 2x. No fim, 2x³ − 6x² + 2x embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada pedaço para ver a área.',
        sucesso: { reveladas: 3 },
        mostre: 'Os pedaços mostram 2x³, −6x² e 2x. Embaixo aparece 2x³ − 6x² + 2x.',
      },
      descoberta: '2x · x² = 2x³ (os expoentes se somam), 2x · (−3x) = −6x² e 2x · 1 = 2x. 2x(x² − 3x + 1) = 2x³ − 6x² + 2x.',
      esboco: 'Três pedaços, um vermelho. O pedaço do 1 vale 2x: o monômio inteiro, vezes 1.',
    },
    {
      tipo: 'passo',
      problema: 'E com o menos fora: ${-3x(x - 2)}$. O fundo é ${-3x}$.',
      fala: 'E com o menos fora: menos três x, abre parênteses, x menos dois. O fundo é menos três x.',
      visual: menosFora(['?', '?'], 'Um retângulo de −3x de altura (rótulo vermelho), a base partida em x e −2 (vermelho). Os pedaços com "?".'),
      passos: [
        {
          pergunta: 'O primeiro pedaço: ${-3x \\cdot x}$. Quanto dá?',
          fala: 'O primeiro pedaço: menos três x vezes x. Quanto dá?',
          opcoes: [
            { texto: '$-3x^2$', certa: true, explica: 'Isso. O número fica −3, e ${x \\cdot x = x^2}$.', fala: 'Isso. O número fica menos três, e x vezes x, x ao quadrado.', mostra: menosFora(['−3x²', '?'], 'O primeiro pedaço mostra −3x², em vermelho.') },
            { texto: '$3x^2$', erro: 'sinais-diferentes-da-positivo', explica: 'O fundo é negativo e o x é positivo: o produto é negativo, ${-3x^2}$.', fala: 'O fundo é negativo e o x é positivo: o produto é negativo, menos três x ao quadrado.', mostra: menosFora(['−3x²', '?'], 'O primeiro pedaço mostra −3x², em vermelho.') },
            { texto: '$-3x$', erro: 'esquece-a-letra-no-produto', explica: 'Os dois têm x: ${x \\cdot x = x^2}$. Dá ${-3x^2}$.', fala: 'Os dois têm x: x vezes x, x ao quadrado. Dá menos três x ao quadrado.', mostra: menosFora(['−3x²', '?'], 'O primeiro pedaço mostra −3x², em vermelho.') },
          ],
          linha: { tex: '-3x \\cdot x = -3x^2', fala: 'menos três x vezes x, menos três x ao quadrado' },
        },
        {
          pergunta: 'O segundo: ${-3x \\cdot (-2)}$.',
          fala: 'O segundo: menos três x vezes menos dois.',
          opcoes: [
            { texto: '$-6x$', erro: 'sinais-iguais-da-negativo', explica: 'Menos vezes menos dá mais: ${(-3) \\cdot (-2) = 6}$. O pedaço vale ${6x}$.', fala: 'Menos vezes menos dá mais: menos três vezes menos dois, seis. O pedaço vale seis x.', mostra: menosFora(['−3x²', '6x'], 'O segundo pedaço mostra 6x, em âmbar: positivo.') },
            { texto: '$6x$', certa: true, explica: 'Isso. Menos vezes menos dá mais, e o x vem junto.', fala: 'Isso. Menos vezes menos dá mais, e o x vem junto.', mostra: menosFora(['−3x²', '6x'], 'O segundo pedaço mostra 6x, em âmbar: positivo.') },
            { texto: '$6$', erro: 'esquece-a-letra-no-produto', explica: 'O fundo é ${-3x}$: o x também multiplica. Dá ${6x}$.', fala: 'O fundo é menos três x: o x também multiplica. Dá seis x.', mostra: menosFora(['−3x²', '6x'], 'O segundo pedaço mostra 6x, em âmbar: positivo.') },
          ],
          linha: { tex: '-3x \\cdot (-2) = 6x', fala: 'menos três x vezes menos dois, seis x' },
        },
        {
          pergunta: 'Junte os pedaços. Como fica ${-3x(x - 2)}$?',
          fala: 'Junte os pedaços. Como fica menos três x, abre parênteses, x menos dois?',
          opcoes: [
            { texto: '$-3x^2 + 6x$', certa: true, explica: 'Isso. ${-3x^2}$ e ${6x}$ não são semelhantes: ficam os dois.', fala: 'Isso. Menos três x ao quadrado e seis x não são semelhantes: ficam os dois.', mostra: menosFora(['−3x²', '6x'], 'Os dois pedaços cheios, e −3x² + 6x embaixo.', { somaTermos: true }) },
            { texto: '$3x^2$', erro: 'junta-termos-nao-semelhantes', explica: 'x² e x são peças diferentes: não se juntam. Fica ${-3x^2 + 6x}$.', fala: 'x ao quadrado e x são peças diferentes: não se juntam. Fica menos três x ao quadrado mais seis x.', mostra: menosFora(['−3x²', '6x'], 'Os dois pedaços cheios, e −3x² + 6x embaixo.', { somaTermos: true }) },
          ],
          linha: { tex: '-3x(x - 2) = -3x^2 + 6x', fala: 'menos três x, abre parênteses, x menos dois, é menos três x ao quadrado mais seis x' },
        },
      ],
      esboco: 'Um produto por vez, com o sinal. O pedaço de −3x por −2 fica âmbar: menos com menos, positivo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: tire os parênteses de ${2x(3x - 4)}$. Depois confira com ${x = 2}$. Quanto dá?',
      fala: 'No papel: tire os parênteses de dois x, abre parênteses, três x menos quatro. Depois confira com x igual a dois. Quanto dá?',
      resposta: 8,
      sinal: true,
      resolucao: [
        { tex: '2x(3x - 4) = 2x \\cdot 3x - 2x \\cdot 4 = 6x^2 - 8x', fala: 'dois x vezes três x menos quatro é dois x vezes três x menos dois x vezes quatro, seis x ao quadrado menos oito x' },
        { tex: 'x = 2: \\quad 6 \\cdot 4 - 8 \\cdot 2 = 24 - 16 = 8', fala: 'com x igual a dois: seis vezes quatro menos oito vezes dois, vinte e quatro menos dezesseis, oito' },
        { tex: '\\text{confere: } 2 \\cdot 2 \\cdot (6 - 4) = 4 \\cdot 2 = 8', fala: 'confere: dois vezes dois vezes seis menos quatro, quatro vezes dois, oito' },
      ],
      esboco: 'Multiplicar e conferir com um número: as duas formas dão 8.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['polinomios-monomio-polinomio-n1', 'polinomios-monomio-polinomio-n2', 'polinomios-monomio-polinomio-n3'],
      esboco: 'Nível 1: o número que falta em ax(x + b) = ax² + □x, com o retângulo. Nível 2: escolher o produto com sinais e um trinômio. Nível 3: um coeficiente do produto e a área do galpão com x dado, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'O galpão tem ${3x^2 + 12x}$ m². Na próxima aula, os dois lados têm dois termos, e o retângulo ganha quatro pedaços.',
      fala: 'O galpão tem três x ao quadrado mais doze x metros quadrados. Na próxima aula, os dois lados têm dois termos, e o retângulo ganha quatro pedaços.',
      visual: GALPAO_PRONTO,
      esboco: 'Responde ao gancho com o galpão partido e anuncia o produto de dois binômios.',
    },
  ],
}
