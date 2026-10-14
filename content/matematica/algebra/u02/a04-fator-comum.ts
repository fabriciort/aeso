import type { Aula, Visual } from '@/lib/formation/schema'

// Fator comum em evidência. O caminho de volta da distributiva: o depósito
// da divisão (área 6x² + 9x) volta, agora sem o fundo. Os lados todos com
// "?". A aposta pede o lado que os dois pedaços têm em comum (3x; o 3 e o x
// sozinhos são incompletos). O momento-chave é o Mexa revelar: com 3x de
// altura, os toques descobrem 2x e 3 em cima, e aparece 3x(2x + 3). Depois,
// o maior fator comum: a conta de Bruno, 3(2x² + 3x), confere mas não acabou;
// a letra sai com a menor potência (4x³ + 10x² = 2x²(2x + 5)); e o passo a
// passo de 12x² − 8x, conferido com x = 1.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })

/** O depósito: área 6x² + 9x, 3x de fundo, 2x + 3 de frente. */
const AREAS = [['6x²', '9x']]
const DEPOSITO = { base: ['2x', 3], altura: ['3x'], areas: AREAS }
/** Os lados ainda desconhecidos: só as áreas à vista. */
const SEM_LADOS = { base: ['?', '?'], altura: ['?'], areas: AREAS }
const DEPOSITO_PRONTO = ret({ ...DEPOSITO, total: '3x(2x + 3)' }, 'O depósito com os lados à vista: 3x de altura, 2x e 3 em cima, 6x² e 9x dentro, e 3x(2x + 3) embaixo.')

/** 4x³ + 10x² = 2x²(2x + 5). */
const POTENCIA_AREAS = [['4x³', '10x²']]

/** 12x² − 8x = 4x(3x − 2), do passo a passo. */
const PASSO_AREAS = [['12x²', '−8x']]

export const aula: Aula = {
  id: 'AF.U2.A4',
  titulo: 'Fator comum em evidência',
  objetivo: 'Pôr em evidência o maior fator comum, como 6x² + 9x = 3x(2x + 3) e 4x³ + 10x² = 2x²(2x + 5): o MDC dos números e a menor potência da letra, com cada termo dividido por ele dentro do parêntese, e conferir multiplicando de volta.',
  modelo: 'retangulo',
  esboco: 'Abre no depósito da divisão, de área 6x² + 9x, agora com os três lados em "?". A aposta pede o lado que os dois pedaços têm em comum: 3x. Momento-chave: com 3x de altura, o aluno toca as partes e descobre 2x e 3 em cima; embaixo aparece 3x(2x + 3). A conta de Bruno, 3(2x² + 3x), confere mas não acabou: o maior fator comum. A letra sai com a menor potência (4x³ + 10x²). O passo a passo de 12x² − 8x, com o menos dentro, e a conferência com x = 1.',
  vega: 'Ideia central: pôr em evidência é a distributiva ao contrário. Na área 6x² + 9x, todos os pedaços têm o mesmo lado, 3x: 6x² + 9x = 3x(2x + 3). O fator comum é o maior: o MDC dos números (unidade de divisores) e a menor potência da letra (x³ e x² têm x² em comum). Cada termo dividido pelo fator fica dentro, com o sinal (−8x ÷ 4x = −2), e um termo igual ao fator vira 1. Sempre se confere multiplicando de volta, ou trocando o x por um número. Erros esperados: tirar só o número ou só a letra (3(2x² + 3x)), parar num divisor que não é o maior (2x em 12x² − 8x), tirar a maior potência (x³), copiar um termo sem dividir, perder o sinal. Guie com "Que lado todos os pedaços têm?", "Dentro do parêntese ainda há algo comum?", "Multiplique de volta: dá o que você tinha?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na divisão, o depósito tinha 3x de fundo. Agora a planta só diz a área: ${6x^2 + 9x}$ m². Que lados dão essa área?',
      fala: 'Na divisão, o depósito tinha três x de fundo. Agora a planta só diz a área: seis x ao quadrado mais nove x metros quadrados. Que lados dão essa área?',
      visual: ret({ ...SEM_LADOS }, 'O depósito com dois pedaços, 6x² e 9x dentro, e "?" em todos os lados: dois em cima e um à esquerda.'),
      esboco: 'O caminho de volta da distributiva: a área é conhecida, os lados não. É o mesmo depósito da aula de divisão, agora sem o fundo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Os dois pedaços têm a mesma altura. Que lado está nos dois, no ${6x^2}$ e no ${9x}$?',
      fala: 'Os dois pedaços têm a mesma altura. Que lado está nos dois, no seis x ao quadrado e no nove x?',
      visual: ret({ ...SEM_LADOS }, 'Os dois pedaços, com "?" nos lados.'),
      opcoes: [
        {
          texto: '$3$', erro: 'fator-comum-incompleto',
          explica: 'O 3 está nos dois, mas o x também: ${6x^2}$ e ${9x}$ têm x. O lado comum é ${3x}$.',
          fala: 'O três está nos dois, mas o x também: seis x ao quadrado e nove x têm x. O lado comum é três x.',
          mostra: ret({ ...SEM_LADOS, altura: ['3x'] }, 'O "?" da altura vira 3x.'),
        },
        {
          texto: '$3x$', certa: true,
          explica: 'Isso. ${6x^2 = 3x \\cdot 2x}$ e ${9x = 3x \\cdot 3}$: o ${3x}$ está nos dois.',
          fala: 'Isso. Seis x ao quadrado é três x vezes dois x, e nove x é três x vezes três: o três x está nos dois.',
          mostra: ret({ ...SEM_LADOS, altura: ['3x'] }, 'O "?" da altura vira 3x.'),
        },
        {
          texto: '$x$', erro: 'fator-comum-incompleto',
          explica: 'O x está nos dois, mas o 3 também: 6 e 9 são múltiplos de 3. O lado comum é ${3x}$.',
          fala: 'O x está nos dois, mas o três também: seis e nove são múltiplos de três. O lado comum é três x.',
          mostra: ret({ ...SEM_LADOS, altura: ['3x'] }, 'O "?" da altura vira 3x.'),
        },
      ],
      esboco: 'Números com números (o MDC de 6 e 9) e letras com letras (o x está nos dois). As duas opções incompletas pegam só uma metade.',
    },
    {
      tipo: 'mexa',
      texto: 'A altura é ${3x}$. Que lado, vezes ${3x}$, dá cada pedaço?',
      fala: 'A altura é três x. Que lado, vezes três x, dá cada pedaço?',
      visual: ret({ ...DEPOSITO, oculto: 'base', revelar: true, total: '3x(2x + 3)' }, 'O depósito com 3x à esquerda e dois "?" em cima, as partes tracejadas. Cada toque descobre um lado: 2x e 3. No fim, 3x(2x + 3) embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada parte para achar o lado de cima.',
        sucesso: { reveladas: 2 },
        mostre: 'Os lados aparecem: 2x e 3. O depósito é 3x por 2x + 3.',
      },
      descoberta: '6x² ÷ 3x = 2x e 9x ÷ 3x = 3: 6x² + 9x = 3x(2x + 3). O 3x vai para fora e cada termo dividido fica dentro.',
      esboco: 'O momento-chave: a área vira um produto. O 3x, que estava nos dois pedaços, fica fora do parêntese.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Bruno escreveu ${6x^2 + 9x = 3(2x^2 + 3x)}$. Multiplicando de volta, confere. A conta dele acabou?',
      fala: 'Bruno escreveu seis x ao quadrado mais nove x igual a três vezes dois x ao quadrado mais três x. Multiplicando de volta, confere. A conta dele acabou?',
      visual: DEPOSITO_PRONTO,
      opcoes: [
        {
          texto: 'Acabou: a conta confere', erro: 'fator-comum-incompleto',
          explica: 'Confere, mas dentro ainda há um x em todos os termos: ${2x^2}$ e ${3x}$. Tire o maior: ${3x}$.',
          fala: 'Confere, mas dentro ainda há um x em todos os termos: dois x ao quadrado e três x. Tire o maior: três x.',
          mostra: DEPOSITO_PRONTO,
        },
        {
          texto: 'Não: dentro ainda há um x comum', certa: true,
          explica: 'Isso. Tire o **maior** fator comum, até dentro não sobrar nada comum: ${3x(2x + 3)}$.',
          fala: 'Isso. Tire o maior fator comum, até dentro não sobrar nada comum: três x vezes dois x mais três.',
          mostra: DEPOSITO_PRONTO,
        },
      ],
      esboco: 'A conta de Bruno não está errada, está incompleta. O retângulo certo mostra o 3x inteiro do lado.',
    },
    {
      tipo: 'anote',
      titulo: 'Fator comum em evidência',
      definicao: 'Pôr em evidência é escrever a soma como um produto: o **maior fator comum** fora, e cada termo dividido por ele dentro.',
      exemplo: { tex: '6x^2 + 9x = 3x(2x + 3)', fala: 'seis x ao quadrado mais nove x é três x vezes dois x mais três' },
      alerta: 'O maior fator comum: o MDC dos números e a menor potência da letra. Confira multiplicando de volta.',
      esboco: 'Na página: o depósito com 3x à esquerda, 2x e 3 em cima, e a seta da área para o produto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${4x^3 + 10x^2}$, o MDC de 4 e 10 é 2. E quantos x saem dos dois termos?',
      fala: 'Em quatro x ao cubo mais dez x ao quadrado, o MDC de quatro e dez é dois. E quantos x saem dos dois termos?',
      visual: ret({ base: ['?', '?'], altura: ['?'], areas: POTENCIA_AREAS }, 'Dois pedaços, 4x³ e 10x² dentro, com "?" nos lados.'),
      opcoes: [
        {
          texto: '$x^3$', erro: 'fator-comum-maior-potencia',
          explica: 'O ${10x^2}$ tem só dois x. Saem os que estão nos dois: ${x^2}$. Fica ${2x^2(2x + 5)}$.',
          fala: 'O dez x ao quadrado tem só dois x. Saem os que estão nos dois: x ao quadrado. Fica dois x ao quadrado vezes dois x mais cinco.',
          mostra: ret({ base: ['2x', 5], altura: ['2x²'], areas: POTENCIA_AREAS, total: '2x²(2x + 5)' }, 'Os lados aparecem: 2x² à esquerda, 2x e 5 em cima, e 2x²(2x + 5) embaixo.'),
        },
        {
          texto: '$x^2$', certa: true,
          explica: 'Isso. ${x^3 = x \\cdot x \\cdot x}$ e ${x^2 = x \\cdot x}$: os dois têm ${x^2}$. Fica ${2x^2(2x + 5)}$.',
          fala: 'Isso. x ao cubo é x vezes x vezes x, e x ao quadrado é x vezes x: os dois têm x ao quadrado. Fica dois x ao quadrado vezes dois x mais cinco.',
          mostra: ret({ base: ['2x', 5], altura: ['2x²'], areas: POTENCIA_AREAS, total: '2x²(2x + 5)' }, 'Os lados aparecem: 2x² à esquerda, 2x e 5 em cima, e 2x²(2x + 5) embaixo.'),
        },
        {
          texto: '$x$', erro: 'fator-comum-incompleto',
          explica: 'Sai, mas dentro sobra um x em cada termo. Saem dois: ${2x^2(2x + 5)}$.',
          fala: 'Sai, mas dentro sobra um x em cada termo. Saem dois: dois x ao quadrado vezes dois x mais cinco.',
          mostra: ret({ base: ['2x', 5], altura: ['2x²'], areas: POTENCIA_AREAS, total: '2x²(2x + 5)' }, 'Os lados aparecem: 2x² à esquerda, 2x e 5 em cima, e 2x²(2x + 5) embaixo.'),
        },
      ],
      esboco: 'A letra sai com a menor potência, escrita por extenso como nas potências. A maior não cabe no termo de grau menor.',
    },
    {
      tipo: 'passo',
      problema: 'Agora você: ponha em evidência ${12x^2 - 8x}$.',
      fala: 'Agora você: ponha em evidência doze x ao quadrado menos oito x.',
      visual: ret({ base: ['?', '?'], altura: ['?'], areas: PASSO_AREAS }, 'Dois pedaços, 12x² e −8x (vermelho) dentro, com "?" nos lados.'),
      passos: [
        {
          pergunta: 'O maior fator comum de ${12x^2}$ e ${8x}$:',
          fala: 'O maior fator comum de doze x ao quadrado e oito x:',
          opcoes: [
            { texto: '$2x$', erro: 'mdc-nao-e-o-maior', explica: 'O 2 divide os dois, mas o 4 também: 12 e 8 são múltiplos de 4. O maior é ${4x}$.', fala: 'O dois divide os dois, mas o quatro também: doze e oito são múltiplos de quatro. O maior é quatro x.', mostra: ret({ base: ['?', '?'], altura: ['4x'], areas: PASSO_AREAS }, 'O "?" da altura vira 4x.') },
            { texto: '$4x$', certa: true, explica: 'Isso. O MDC de 12 e 8 é 4, e o x está nos dois.', fala: 'Isso. O MDC de doze e oito é quatro, e o x está nos dois.', mostra: ret({ base: ['?', '?'], altura: ['4x'], areas: PASSO_AREAS }, 'O "?" da altura vira 4x.') },
            { texto: '$4$', erro: 'fator-comum-incompleto', explica: 'O x também está nos dois termos. O maior fator comum é ${4x}$.', fala: 'O x também está nos dois termos. O maior fator comum é quatro x.', mostra: ret({ base: ['?', '?'], altura: ['4x'], areas: PASSO_AREAS }, 'O "?" da altura vira 4x.') },
          ],
          linha: { tex: '\\text{fator comum: } 4x', fala: 'fator comum: quatro x' },
        },
        {
          pergunta: 'Divida cada termo por ${4x}$. O que fica dentro do parêntese?',
          fala: 'Divida cada termo por quatro x. O que fica dentro do parêntese?',
          opcoes: [
            { texto: '$3x - 2$', certa: true, explica: 'Isso. ${12x^2 \\div 4x = 3x}$ e ${-8x \\div 4x = -2}$.', fala: 'Isso. Doze x ao quadrado dividido por quatro x, três x, e menos oito x dividido por quatro x, menos dois.', mostra: ret({ base: ['3x', '−2'], altura: ['4x'], areas: PASSO_AREAS, total: '4x(3x − 2)' }, 'Os lados aparecem: 3x e −2 (vermelho) em cima, e 4x(3x − 2) embaixo.') },
            { texto: '$3x - 8x$', erro: 'evidencia-esquece-termo', explica: 'O ${-8x}$ também se divide: ${-8x \\div 4x = -2}$.', fala: 'O menos oito x também se divide: menos oito x dividido por quatro x, menos dois.', mostra: ret({ base: ['3x', '?'], altura: ['4x'], areas: PASSO_AREAS }, 'Só o primeiro lado aparece: 3x. O outro continua "?".') },
            { texto: '$3x + 2$', erro: 'termo-perde-o-sinal', explica: 'O menos fica com o termo: ${-8x \\div 4x = -2}$. Fica ${3x - 2}$.', fala: 'O menos fica com o termo: menos oito x dividido por quatro x, menos dois. Fica três x menos dois.', mostra: ret({ base: ['3x', '?'], altura: ['4x'], areas: PASSO_AREAS }, 'Só o primeiro lado aparece: 3x. O outro continua "?".') },
          ],
          linha: { tex: '12x^2 - 8x = 4x(3x - 2)', fala: 'doze x ao quadrado menos oito x é quatro x vezes três x menos dois' },
        },
        {
          pergunta: 'Confira com x = 1: ${12 - 8 = 4}$. Quanto vale ${4x(3x - 2)}$?',
          fala: 'Confira com x igual a um: doze menos oito, quatro. Quanto vale quatro x vezes três x menos dois?',
          opcoes: [
            { texto: '$4$', certa: true, explica: 'Isso. ${4 \\cdot (3 - 2) = 4}$: os dois lados valem o mesmo.', fala: 'Isso. Quatro vezes três menos dois, quatro: os dois lados valem o mesmo.', mostra: ret({ base: ['3x', '−2'], altura: ['4x'], areas: PASSO_AREAS, total: '4x(3x − 2)' }, 'O retângulo pronto, com 4x(3x − 2) embaixo.') },
            { texto: '$20$', erro: 'termo-perde-o-sinal', explica: 'Assim seria ${4 \\cdot (3 + 2)}$. Com o menos: ${4 \\cdot (3 - 2) = 4}$.', fala: 'Assim seria quatro vezes três mais dois. Com o menos: quatro vezes três menos dois, quatro.', mostra: ret({ base: ['3x', '−2'], altura: ['4x'], areas: PASSO_AREAS, total: '4x(3x − 2)' }, 'O retângulo pronto, com 4x(3x − 2) embaixo.') },
          ],
          linha: { tex: 'x = 1: \\ 4 \\cdot (3 - 2) = 4 = 12 - 8', fala: 'com x igual a um, quatro vezes três menos dois dá quatro, e doze menos oito também' },
        },
      ],
      esboco: 'O fator comum, o que fica dentro com o sinal, e a conferência trocando o x por 1.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: ponha em evidência ${15x^2 + 10x}$ e confira. Qual número fica sem x dentro do parêntese?',
      fala: 'No papel: ponha em evidência quinze x ao quadrado mais dez x e confira. Qual número fica sem x dentro do parêntese?',
      resposta: 2,
      resolucao: [
        { tex: '\\text{MDC}(15, 10) = 5, \\quad \\text{fator comum: } 5x', fala: 'o MDC de quinze e dez é cinco; o fator comum é cinco x' },
        { tex: '15x^2 + 10x = 5x(3x + 2)', fala: 'quinze x ao quadrado mais dez x é cinco x vezes três x mais dois' },
        { tex: '\\text{confere: } 5x(3x + 2) = 15x^2 + 10x', fala: 'confere: cinco x vezes três x mais dois, quinze x ao quadrado mais dez x' },
      ],
      esboco: 'O fator comum inteiro (número e letra), cada termo dividido e a volta pela multiplicação.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fatoracao-evidencia-n1', 'fatoracao-evidencia-n2', 'fatoracao-evidencia-n3'],
      esboco: 'Nível 1: o número que falta dentro do parêntese, com o retângulo de lados em "?". Nível 2: escolher o maior fator comum (contra o só número, o divisor menor e a maior potência). Nível 3: o número sem x dentro, com sinais e três termos, e o coeficiente ou o expoente do fator comum, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Com o maior fator comum, ${6x^2 + 9x = 3x(2x + 3)}$. A seguir: trinômios como ${x^2 + 5x + 6}$, que não têm um x em todos os termos.',
      fala: 'Com o maior fator comum, seis x ao quadrado mais nove x é três x vezes dois x mais três. A seguir: trinômios como x ao quadrado mais cinco x mais seis, que não têm um x em todos os termos.',
      visual: DEPOSITO_PRONTO,
      esboco: 'Responde ao gancho com o depósito pronto e aponta para a próxima aula: quando não há fator comum, os azulejos arrumam o retângulo.',
    },
  ],
}
