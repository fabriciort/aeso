import type { Aula, Visual } from '@/lib/formation/schema'

// O quadrado da soma. Um quarto quadrado de x metros cresce 3 m para a
// frente e 3 m para o lado. A aposta: (x + 3)² = x² + 9? O quadrado de lado
// x + 3 tem QUATRO pedaços, e o momento-chave é o Mexa revelar: x², 3x, 3x e
// 9 aparecem um a um; depois os dois do meio acendem juntos, 6x. A
// conferência com x = 1 desmonta o x² + 9 (dá 10, o quarto tem 16). Um
// segundo caso, (x + 5)², no passo a passo; só então a regra geral, e o
// (2x + 1)², em que o pedaço grande é 4x².

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** O quarto novo: x + 3 de frente e x + 3 de lado, um quadrado. */
const QUARTO = { base: ['x', 3], altura: ['x', 3] }
const MEIO = [[0, 1], [1, 0]]
const QUARTO_CANTOS = ret({ ...QUARTO, areas: [['x²', '?'], ['?', 9]] }, 'Só os cantos: x² em cima, à esquerda, e 9 embaixo, à direita. Os dois pedaços do meio ficam com "?".')
const QUARTO_PRONTO = ret({ ...QUARTO, areas: true, somaTermos: true }, 'O quadrado com os quatro pedaços: x², 3x, 3x e 9. Embaixo, x² + 3x + 3x + 9 e, em âmbar, = x² + 6x + 9.')
const QUARTO_MEIO = ret({ ...QUARTO, areas: true, somaTermos: true, destaque: MEIO }, 'Os quatro pedaços, com os dois 3x do meio acesos juntos, em âmbar. Embaixo, x² + 3x + 3x + 9 = x² + 6x + 9.')

const CONFERE = expr(['com x = 1:', 'x² + 9 = 1 + 9 = 10', '(1 + 3)² = 4² = 16', 'x² + 6x + 9 = 1 + 6 + 9 = 16'], 'A conferência com x = 1: o quarto de 4 por 4 dá 16; x² + 6x + 9 também dá 16; x² + 9 dá só 10.')

/** (x + 5)², do primeiro passo a passo. */
const CINCO = { base: ['x', 5], altura: ['x', 5] }
const cinco = (areas: unknown, esboco: string, extra: Record<string, unknown> = {}) => ret({ ...CINCO, areas, ...extra }, esboco)

/** (2x + 1)², do segundo passo a passo. */
const DOIS = { base: ['2x', 1], altura: ['2x', 1], tamanhoLetra: 1.5 }
const dois = (areas: unknown, esboco: string, extra: Record<string, unknown> = {}) => ret({ ...DOIS, areas, ...extra }, esboco)

export const aula: Aula = {
  id: 'AF.U2.A1',
  titulo: 'O quadrado da soma',
  objetivo: 'Expandir o quadrado de uma soma, como (x + 3)² = x² + 6x + 9 e (2x + 1)² = 4x² + 4x + 1, vendo os quatro pedaços do quadrado, com os dois do meio iguais, e conferir trocando o x por um número.',
  modelo: 'retangulo',
  esboco: 'Abre num quarto quadrado de x metros que cresce 3 m para a frente e 3 m para o lado. A aposta: (x + 3)² = x² + 9? O quadrado mostra que os cantos cobrem só dois pedaços. Momento-chave: o aluno revela os quatro pedaços, x², 3x, 3x e 9; depois os dois do meio acendem juntos, 6x. A conferência com x = 1 dá 16 (e 10 para x² + 9). O (x + 5)² no passo a passo, a regra (a + b)² = a² + 2ab + b² só depois dos dois casos, e o (2x + 1)², com o pedaço grande 4x².',
  vega: 'Ideia central: (x + 3)² é (x + 3)(x + 3), um quadrado partido em quatro pedaços: x², 3x, 3x e 9. Os dois do meio são iguais, então o meio é o dobro do produto: (a + b)² = a² + 2ab + b². Erro central: (x + 3)² = x² + 9, elevar cada termo e esquecer o meio. Também: um meio só (x² + 3x + 9), 3² = 6, (2x)² = 2x², e 3x + 3x = 6x². O hábito da unidade: conferir trocando o x por um número (x = 1 dá 16 dos dois lados). Guie com "Quantos pedaços tem o quadrado?", "Os dois do meio são iguais?", "Confira com x = 1".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um quarto quadrado tem **x** metros de lado. Ele vai crescer 3 m para a frente e 3 m para o lado. Quanto piso o quarto novo pede?',
      fala: 'Um quarto quadrado tem x metros de lado. Ele vai crescer três metros para a frente e três para o lado. Quanto piso o quarto novo pede?',
      visual: ret({ ...QUARTO }, 'O quarto novo: um quadrado com cada lado partido em x e 3. Os dois cortes fazem quatro pedaços vazios.'),
      esboco: 'O lado novo é x + 3 nos dois sentidos: a área é (x + 3)². O quadrado já aparece partido.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Muita gente escreve ${(x + 3)^2 = x^2 + 9}$: x ao quadrado e 3 ao quadrado. Está certo?',
      fala: 'Muita gente escreve x mais três, ao quadrado, igual a x ao quadrado mais nove: x ao quadrado e três ao quadrado. Está certo?',
      visual: ret({ ...QUARTO }, 'O quadrado partido em quatro pedaços vazios.'),
      opcoes: [
        {
          texto: 'Sim: cada termo ao quadrado', erro: 'quadrado-da-soma-sem-o-meio',
          explica: 'O ${x^2}$ e o 9 são só os dois cantos. Olhe o quadrado: sobram dois pedaços, com "?".',
          fala: 'O x ao quadrado e o nove são só os dois cantos. Olhe o quadrado: sobram dois pedaços.',
          mostra: QUARTO_CANTOS,
        },
        {
          texto: 'Não: falta alguma coisa', certa: true,
          explica: 'Isso. O ${x^2}$ e o 9 cobrem só os cantos. Faltam dois pedaços.',
          fala: 'Isso. O x ao quadrado e o nove cobrem só os cantos. Faltam dois pedaços.',
          mostra: QUARTO_CANTOS,
        },
      ],
      esboco: 'A aposta vem antes do quadrado cheio. Em qualquer escolha, os cantos aparecem e os pedaços do meio ficam com "?": a imagem mostra o que falta.',
    },
    {
      tipo: 'mexa',
      texto: '${(x + 3)^2}$ é ${(x + 3)(x + 3)}$: cada termo vezes cada termo. Descubra os quatro pedaços.',
      fala: 'x mais três, ao quadrado, é x mais três vezes x mais três: cada termo vezes cada termo. Descubra os quatro pedaços.',
      visual: ret({ ...QUARTO, revelar: true, somaTermos: true }, 'Os quatro pedaços com "?" e borda tracejada. Cada toque descobre uma área, com um pulo. No fim, embaixo: x² + 3x + 3x + 9 e, em âmbar, = x² + 6x + 9.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada pedaço para ver a área.',
        sucesso: { reveladas: 4 },
        mostre: 'Os quatro pedaços mostram x², 3x, 3x e 9. Embaixo: x² + 3x + 3x + 9 = x² + 6x + 9.',
      },
      descoberta: 'Os pedaços do meio são 3x e 3x, que se juntam em 6x: (x + 3)² = x² + 6x + 9. O x² + 9 perdia exatamente esses dois.',
      esboco: 'O momento-chave: os dois pedaços do meio aparecem, e a soma embaixo junta os dois 3x.',
    },
    {
      tipo: 'ideia',
      texto: 'Os dois pedaços do meio são iguais: ${3x}$ na frente e ${3x}$ no lado. Juntos, ${6x}$.',
      fala: 'Os dois pedaços do meio são iguais: três x na frente e três x no lado. Juntos, seis x.',
      visual: { ...QUARTO_MEIO, movimento: 'Os dois pedaços de 3x acendem juntos, em âmbar.' },
      esboco: 'Os dois do meio acendem ao mesmo tempo: o aluno vê que são o mesmo retângulo, x por 3, em dois lugares.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Confira com ${x = 1}$: o quarto fica com 4 m de lado, ou 16 m². Qual destas também dá 16?',
      fala: 'Confira com x igual a um: o quarto fica com quatro metros de lado, ou dezesseis metros quadrados. Qual destas também dá dezesseis?',
      visual: QUARTO_PRONTO,
      opcoes: [
        {
          texto: '$x^2 + 9$', erro: 'quadrado-da-soma-sem-o-meio',
          explica: 'Dá ${1 + 9 = 10}$, e o quarto tem 16. Faltam os dois pedaços do meio.',
          fala: 'Dá um mais nove, dez, e o quarto tem dezesseis. Faltam os dois pedaços do meio.',
          mostra: CONFERE,
        },
        {
          texto: '$x^2 + 3x + 9$', erro: 'produto-so-das-pontas',
          explica: 'Dá ${1 + 3 + 9 = 13}$. Esse tem um pedaço do meio só, e são dois.',
          fala: 'Dá um mais três mais nove, treze. Esse tem um pedaço do meio só, e são dois.',
          mostra: CONFERE,
        },
        {
          texto: '$x^2 + 6x + 9$', certa: true,
          explica: 'Isso. ${1 + 6 + 9 = 16}$. Trocar o x por um número confere a conta.',
          fala: 'Isso. Um mais seis mais nove, dezesseis. Trocar o x por um número confere a conta.',
          mostra: CONFERE,
        },
      ],
      esboco: 'O hábito da unidade: trocar a letra por um número dos dois lados. O x² + 9 e o meio pela metade não passam.',
    },
    {
      tipo: 'passo',
      problema: 'Agora ${(x + 5)^2}$: um quadrado de lado ${x + 5}$.',
      fala: 'Agora x mais cinco, ao quadrado: um quadrado de lado x mais cinco.',
      visual: cinco([['?', '?'], ['?', '?']], 'O quadrado com os lados partidos em x e 5. Os quatro pedaços com "?".'),
      passos: [
        {
          pergunta: 'Os cantos são ${x^2}$ e ${5^2}$. Quanto vale cada um?',
          fala: 'Os cantos são x ao quadrado e cinco ao quadrado. Quanto vale cada um?',
          opcoes: [
            { texto: '$x^2$ e $10$', erro: 'potencia-multiplica-base-pelo-expoente', explica: '10 é ${5 \\cdot 2}$. O canto é 5 por 5: ${5 \\cdot 5 = 25}$.', fala: 'Dez é cinco vezes dois. O canto é cinco por cinco: vinte e cinco.', mostra: cinco([['x²', '?'], ['?', 25]], 'Os cantos: x² em cima, à esquerda, e 25 embaixo, à direita.') },
            { texto: '$x^2$ e $25$', certa: true, explica: 'Isso. O quadrado grande e o quadradinho de 5 por 5.', fala: 'Isso. O quadrado grande e o quadradinho de cinco por cinco.', mostra: cinco([['x²', '?'], ['?', 25]], 'Os cantos: x² em cima, à esquerda, e 25 embaixo, à direita.') },
          ],
          linha: { tex: 'x \\cdot x = x^2, \\quad 5 \\cdot 5 = 25', fala: 'x vezes x, x ao quadrado; cinco vezes cinco, vinte e cinco' },
        },
        {
          pergunta: 'E os pedaços do meio?',
          fala: 'E os pedaços do meio?',
          opcoes: [
            { texto: 'Não tem: os cantos bastam', erro: 'quadrado-da-soma-sem-o-meio', explica: 'O quadrado tem quatro pedaços. Faltam ${x \\cdot 5}$ e ${5 \\cdot x}$.', fala: 'O quadrado tem quatro pedaços. Faltam x vezes cinco e cinco vezes x.', mostra: cinco(true, 'Os quatro pedaços cheios: x², 5x, 5x e 25, com os dois 5x acesos.', { destaque: MEIO }) },
            { texto: 'Um só: $5x$', erro: 'produto-so-das-pontas', explica: 'São dois: um na frente e um no lado, ${5x}$ cada.', fala: 'São dois: um na frente e um no lado, cinco x cada.', mostra: cinco(true, 'Os quatro pedaços cheios: x², 5x, 5x e 25, com os dois 5x acesos.', { destaque: MEIO }) },
            { texto: '$5x$ e $5x$: juntos, $10x$', certa: true, explica: 'Isso. Os dois do meio são iguais: ${5x + 5x = 10x}$.', fala: 'Isso. Os dois do meio são iguais: cinco x mais cinco x, dez x.', mostra: cinco(true, 'Os quatro pedaços cheios, os dois 5x acesos.', { destaque: MEIO }) },
          ],
          linha: { tex: '(x + 5)^2 = x^2 + 5x + 5x + 25 = x^2 + 10x + 25', fala: 'x mais cinco, ao quadrado, é x ao quadrado mais cinco x mais cinco x mais vinte e cinco, x ao quadrado mais dez x mais vinte e cinco' },
        },
      ],
      esboco: 'O segundo caso, antes da regra: os cantos e o meio. O palco enche os cantos e depois os dois pedaços do meio, acesos.',
    },
    {
      tipo: 'ideia',
      texto: 'Nos dois quadrados, o meio é o **dobro**: ${2 \\cdot 3x = 6x}$ e ${2 \\cdot 5x = 10x}$.',
      fala: 'Nos dois quadrados, o meio é o dobro: duas vezes três x, seis x, e duas vezes cinco x, dez x.',
      visual: expr(['(x + 3)² = x² + 6x + 9', '(x + 5)² = x² + 10x + 25'], 'Os dois resultados, um embaixo do outro: o termo do meio é o dobro de x vezes o número, e o último é o número ao quadrado.'),
      esboco: 'O padrão aparece depois de dois casos, antes da fórmula.',
    },
    {
      tipo: 'anote',
      titulo: 'O quadrado da soma',
      definicao: '${(a + b)^2 = a^2 + 2ab + b^2}$: o quadrado do primeiro, mais **duas vezes** o primeiro pelo segundo, mais o quadrado do segundo.',
      exemplo: { tex: '(x + 3)^2 = x^2 + 2 \\cdot 3x + 9 = x^2 + 6x + 9', fala: 'x mais três, ao quadrado, é x ao quadrado mais duas vezes três x mais nove, x ao quadrado mais seis x mais nove' },
      alerta: '${(x + 3)^2}$ não é ${x^2 + 9}$: faltam os dois pedaços do meio, ${3x}$ e ${3x}$.',
      esboco: 'Na página: o quadrado partido em quatro, com a² e b² nos cantos e ab nos dois pedaços do meio.',
    },
    {
      tipo: 'passo',
      problema: 'Agora ${(2x + 1)^2}$. O lado grande é ${2x}$.',
      fala: 'Agora dois x mais um, ao quadrado. O lado grande é dois x.',
      visual: dois([['?', '?'], ['?', '?']], 'O quadrado com os lados partidos em 2x e 1. Os quatro pedaços com "?".'),
      passos: [
        {
          pergunta: 'O pedaço grande é ${2x}$ por ${2x}$. Quanto vale?',
          fala: 'O pedaço grande é dois x por dois x. Quanto vale?',
          opcoes: [
            { texto: '$4x^2$', certa: true, explica: 'Isso. ${2x \\cdot 2x}$: ${2 \\cdot 2 = 4}$ e ${x \\cdot x = x^2}$.', fala: 'Isso. Dois x vezes dois x: dois vezes dois, quatro, e x vezes x, x ao quadrado.', mostra: dois([['4x²', '?'], ['?', '?']], 'O pedaço grande mostra 4x², aceso.', { destaque: [0, 0] }) },
            { texto: '$2x^2$', erro: 'quadrado-do-monomio-so-na-letra', explica: 'O 2 também está no lado: ${2x \\cdot 2x = 4x^2}$. Com x = 1, o lado é 2 e a área, 4.', fala: 'O dois também está no lado: dois x vezes dois x, quatro x ao quadrado. Com x igual a um, o lado é dois e a área, quatro.', mostra: dois([['4x²', '?'], ['?', '?']], 'O pedaço grande mostra 4x², aceso.', { destaque: [0, 0] }) },
          ],
          linha: { tex: '(2x)^2 = 4x^2', fala: 'dois x, ao quadrado, quatro x ao quadrado' },
        },
        {
          pergunta: 'O canto é ${1 \\cdot 1 = 1}$. E o meio, ${2 \\cdot 2x \\cdot 1}$?',
          fala: 'O canto é um vezes um, um. E o meio, duas vezes dois x vezes um?',
          opcoes: [
            { texto: '$2x$', erro: 'produto-so-das-pontas', explica: '${2x}$ é um pedaço só. São dois: ${2x + 2x = 4x}$.', fala: 'Dois x é um pedaço só. São dois: dois x mais dois x, quatro x.', mostra: dois(true, 'Os quatro pedaços: 4x², 2x, 2x e 1, com os dois 2x acesos.', { destaque: MEIO }) },
            { texto: '$4x$', certa: true, explica: 'Isso. Dois pedaços de ${2x}$: ${(2x + 1)^2 = 4x^2 + 4x + 1}$.', fala: 'Isso. Dois pedaços de dois x: dois x mais um, ao quadrado, é quatro x ao quadrado mais quatro x mais um.', mostra: dois(true, 'Os quatro pedaços, os dois 2x acesos.', { destaque: MEIO }) },
            { texto: '$4x^2$', erro: 'x-mais-x-da-x2', explica: '${2x + 2x}$ junta dois pedaços iguais: dá ${4x}$, sem o quadrado.', fala: 'Dois x mais dois x junta dois pedaços iguais: dá quatro x, sem o quadrado.', mostra: dois(true, 'Os quatro pedaços: 4x², 2x, 2x e 1, com os dois 2x acesos.', { destaque: MEIO }) },
          ],
          linha: { tex: '(2x + 1)^2 = 4x^2 + 4x + 1', fala: 'dois x mais um, ao quadrado, é quatro x ao quadrado mais quatro x mais um' },
        },
      ],
      esboco: 'A regra com um termo que tem número e letra: o pedaço grande é 4x², não 2x². Depois o meio, com o dobro.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: desenvolva ${(x + 4)^2}$. Qual é o número na frente do x?',
      fala: 'No papel: desenvolva x mais quatro, ao quadrado. Qual é o número na frente do x?',
      resposta: 8,
      resolucao: [
        { tex: '(x + 4)^2 = x^2 + 4x + 4x + 16', fala: 'x mais quatro, ao quadrado, é x ao quadrado mais quatro x mais quatro x mais dezesseis' },
        { tex: '= x^2 + 8x + 16', fala: 'x ao quadrado mais oito x mais dezesseis' },
        { tex: 'x = 1: \\quad (1 + 4)^2 = 25', fala: 'com x igual a um: um mais quatro, ao quadrado, vinte e cinco' },
        { tex: '1 + 8 + 16 = 25', fala: 'um mais oito mais dezesseis, vinte e cinco: confere' },
      ],
      esboco: 'Os quatro pedaços, a soma e a conferência com x = 1.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fatoracao-quadrado-soma-n1', 'fatoracao-quadrado-soma-n2', 'fatoracao-quadrado-soma-n3'],
      esboco: 'Nível 1: o número que falta em (x + a)², com o quadrado. Nível 2: escolher o desenvolvimento de (px + a)². Nível 3: a área do quarto com x dado, o coeficiente de x e um quadrado de cabeça, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'O quarto novo pede ${x^2 + 6x + 9}$ m² de piso. Na próxima aula, o lado diminui: ${(x - 3)^2}$.',
      fala: 'O quarto novo pede x ao quadrado mais seis x mais nove metros quadrados de piso. Na próxima aula, o lado diminui: x menos três, ao quadrado.',
      visual: QUARTO_PRONTO,
      esboco: 'Responde ao gancho com o quadrado partido em quatro e anuncia o quadrado da diferença.',
    },
  ],
}
