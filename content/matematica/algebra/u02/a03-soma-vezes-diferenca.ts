import type { Aula, Visual } from '@/lib/formation/schema'

// A soma vezes a diferença. Um terreno quadrado de x metros ganha 3 m na
// frente e perde 3 m no fundo: a área muda? A aposta: muita gente acha que
// fica igual. O momento-chave é o Mexa revelar com `cancela`: os pedaços do
// meio, 3x e −3x, aparecem riscados (um põe o que o outro tira), e sobra
// x² − 9. A conferência com x = 10 (13 · 7 = 91), o contraste com (x − 3)²,
// em que os pedaços do meio se somam, a regra, o passo a passo de
// (2x + 3)(2x − 3) e a conta de cabeça 21 · 19 = 400 − 1.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** O terreno novo: x + 3 de frente (a base) e x − 3 de fundo (a altura). */
const TERRENO = { base: ['x', 3], altura: ['x', -3] }
const TERRENO_PRONTO = ret({ ...TERRENO, areas: true, cancela: true, somaTermos: true }, 'Os quatro pedaços: x², 3x, −3x (vermelho) e −9 (vermelho). O 3x e o −3x apagados e riscados. Embaixo, x² + 3x − 3x − 9, com os dois do meio riscados, e = x² − 9.')
const TERRENO_CANTO = ret({ ...TERRENO, areas: true, cancela: true, somaTermos: true }, 'Os quatro pedaços, o 3x e o −3x riscados, o canto −9 em vermelho: é ele que se perde.')

const CONFERE = expr(['com x = 10:', 'x² = 100', '13 · 7 = 91', 'x² − 9 = 100 − 9 = 91'], 'A conferência com x = 10: o terreno de 13 por 7 tem 91; x² − 9 também dá 91; x² dá 100.')

/** (x − 3)², da aula passada, para o contraste. */
const QUADRADO = ret({ base: ['x', -3], altura: ['x', -3], areas: true, somaTermos: true }, 'O quadrado de (x − 3)²: os dois pedaços do meio, −3x e −3x, vermelhos. Embaixo, x² − 3x − 3x + 9 = x² − 6x + 9.')

/** (2x + 3)(2x − 3), do passo a passo. */
const PASSO = { base: ['2x', 3], altura: ['2x', -3], tamanhoLetra: 2.4 }
const passo = (areas: unknown, esboco: string, extra: Record<string, unknown> = {}) => ret({ ...PASSO, areas, ...extra }, esboco)

/** 21 · 19 = (20 + 1)(20 − 1), em linhas: os números grandes deixam os pedaços de 1 finos demais no retângulo. */
const CONTA = expr(['21 · 19 = (20 + 1)(20 − 1)', '= 400 − 20 + 20 − 1', '= 400 − 1 = 399'], 'A conta em linhas: os pedaços do meio, −20 e +20, se cancelam; sobra 400 − 1 = 399.')

export const aula: Aula = {
  id: 'AF.U2.A3',
  titulo: 'A soma vezes a diferença',
  objetivo: 'Multiplicar a soma pela diferença dos mesmos termos, como (x + 3)(x − 3) = x² − 9, vendo os pedaços do meio que se cancelam; não confundir com (x − 3)²; e usar a regra numa conta de cabeça, como 21 · 19 = 400 − 1.',
  modelo: 'retangulo',
  esboco: 'Abre num terreno quadrado de x metros que ganha 3 m na frente e perde 3 m no fundo: a área muda? A aposta: muita gente acha que fica igual. Momento-chave: o aluno revela os quatro pedaços e vê o 3x e o −3x se riscarem; sobra x² − 9, o canto que se perde. A conferência com x = 10, o contraste com (x − 3)², a regra, o passo a passo de (2x + 3)(2x − 3) e a conta de cabeça 21 · 19.',
  vega: 'Ideia central: em (x + 3)(x − 3), os pedaços do meio são 3x e −3x: um põe o que o outro tira, e eles se cancelam. Sobra x² − 9: (a + b)(a − b) = a² − b². O terreno que ganha 3 m num lado e perde 3 m no outro perde 9 m², o canto. Erros esperados: achar que a área fica igual (x²), somar os do meio (x² − 6x − 9), errar o sinal do canto (x² + 9), e confundir com (x − 3)² = x² − 6x + 9. Na conta de cabeça: 21 · 19 = (20 + 1)(20 − 1) = 400 − 1 = 399. Guie com "Os dois pedaços do meio têm o mesmo sinal?", "Quanto vale o canto?", "Confira com x = 10".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um terreno quadrado tem **x** metros de lado. Ele vai ganhar 3 m na frente e perder 3 m no fundo. A área muda?',
      fala: 'Um terreno quadrado tem x metros de lado. Ele vai ganhar três metros na frente e perder três metros no fundo. A área muda?',
      visual: ret({ ...TERRENO }, 'O terreno novo: a base partida em x e 3, a altura em x e −3 (vermelho). Quatro pedaços vazios.'),
      esboco: 'Um lado cresce e o outro diminui o mesmo tanto: (x + 3)(x − 3). A pergunta parece ter resposta óbvia, e não tem.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Ganha 3 m num lado e perde 3 m no outro. A área nova é…',
      fala: 'Ganha três metros num lado e perde três no outro. A área nova é…',
      visual: ret({ ...TERRENO }, 'O terreno novo partido em quatro pedaços vazios.'),
      opcoes: [
        {
          texto: 'Igual a $x^2$: uma coisa compensa a outra', erro: 'mais-e-menos-nao-mudam-a-area',
          explica: 'Parece, mas não é. Os pedaços vão mostrar o que sobra.',
          fala: 'Parece, mas não é. Os pedaços vão mostrar o que sobra.',
        },
        {
          texto: 'Menor que $x^2$', certa: true,
          explica: 'Isso. Os pedaços vão mostrar quanto se perde.',
          fala: 'Isso. Os pedaços vão mostrar quanto se perde.',
        },
      ],
      esboco: 'A previsão antes do Mexa. A explicação não entrega o porquê: o aluno vai ver os pedaços.',
    },
    {
      tipo: 'mexa',
      texto: 'Descubra os quatro pedaços de ${(x + 3)(x - 3)}$. Olhe bem os dois do meio.',
      fala: 'Descubra os quatro pedaços de x mais três, vezes x menos três. Olhe bem os dois do meio.',
      visual: ret({ ...TERRENO, revelar: true, cancela: true, somaTermos: true }, 'Os quatro pedaços com "?". Os toques descobrem x², 3x, −3x e −9 (os dois de baixo em vermelho). Quando o 3x e o −3x estão à vista, os dois se apagam e ganham um risco. No fim: x² + 3x − 3x − 9, com os do meio riscados, e = x² − 9.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada pedaço para ver a área.',
        sucesso: { reveladas: 4 },
        mostre: 'Os pedaços mostram x², 3x, −3x e −9. O 3x e o −3x se riscam. Embaixo: x² + 3x − 3x − 9 = x² − 9.',
      },
      descoberta: 'O 3x e o −3x se cancelam: um põe o que o outro tira. Sobra x² − 9: o terreno perde o canto, 9 m².',
      esboco: 'O momento-chave: os dois pedaços do meio se riscam, como os azulejos opostos. O que sobra é o x² menos o canto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Confira com ${x = 10}$: o terreno fica com 13 m por 7 m, ou 91 m². Qual destas também dá 91?',
      fala: 'Confira com x igual a dez: o terreno fica com treze metros por sete, ou noventa e um metros quadrados. Qual destas também dá noventa e um?',
      visual: TERRENO_CANTO,
      opcoes: [
        {
          texto: '$x^2$', erro: 'mais-e-menos-nao-mudam-a-area',
          explica: 'Dá 100, e o terreno tem 91. O canto de ${-9}$ fica.',
          fala: 'Dá cem, e o terreno tem noventa e um. O canto de menos nove fica.',
          mostra: CONFERE,
        },
        {
          texto: '$x^2 - 9$', certa: true,
          explica: 'Isso. ${100 - 9 = 91}$: o terreno perde 9 m², o canto.',
          fala: 'Isso. Cem menos nove, noventa e um: o terreno perde nove metros quadrados, o canto.',
          mostra: CONFERE,
        },
        {
          texto: '$x^2 - 6x - 9$', erro: 'meios-opostos-somados',
          explica: 'Dá ${100 - 60 - 9 = 31}$. O ${3x}$ e o ${-3x}$ não somam ${-6x}$: valem zero.',
          fala: 'Dá cem menos sessenta menos nove, trinta e um. O três x e o menos três x não somam menos seis x: valem zero.',
          mostra: CONFERE,
        },
      ],
      esboco: 'O hábito da unidade: trocar o x por um número. O canto vermelho no palco: é ele que se perde.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E em ${(x - 3)^2}$, da aula passada? Os pedaços do meio também se cancelam?',
      fala: 'E em x menos três, ao quadrado, da aula passada? Os pedaços do meio também se cancelam?',
      visual: ret({ base: ['x', -3], altura: ['x', -3], areas: [['x²', '?'], ['?', 9]] }, 'O quadrado de (x − 3)², com os cantos à vista e os dois pedaços do meio com "?".'),
      opcoes: [
        {
          texto: 'Sim: sobra $x^2 - 9$ também', erro: 'quadrado-da-soma-sem-o-meio',
          explica: 'Lá os dois do meio são ${-3x}$ e ${-3x}$: mesmo sinal, eles se somam.',
          fala: 'Lá os dois do meio são menos três x e menos três x: mesmo sinal, eles se somam.',
          mostra: QUADRADO,
        },
        {
          texto: 'Não: os dois são $-3x$ e se somam', certa: true,
          explica: 'Isso. ${(x - 3)^2 = x^2 - 6x + 9}$. Só se cancelam quando um lado tem + e o outro, −.',
          fala: 'Isso. x menos três, ao quadrado, é x ao quadrado menos seis x mais nove. Só se cancelam quando um lado tem mais e o outro, menos.',
          mostra: QUADRADO,
        },
      ],
      esboco: 'O contraste: no quadrado da diferença, os dois do meio são vermelhos e se somam; na soma vezes a diferença, um é âmbar e o outro vermelho, e se cancelam.',
    },
    {
      tipo: 'anote',
      titulo: 'A soma vezes a diferença',
      definicao: '${(a + b)(a - b) = a^2 - b^2}$: a soma vezes a diferença dos mesmos termos é o quadrado do primeiro **menos** o quadrado do segundo.',
      exemplo: { tex: '(x + 3)(x - 3) = x^2 - 3x + 3x - 9 = x^2 - 9', fala: 'x mais três, vezes x menos três, é x ao quadrado menos três x mais três x menos nove, x ao quadrado menos nove' },
      alerta: 'Não confunda com ${(x - 3)^2 = x^2 - 6x + 9}$: lá os pedaços do meio não se cancelam.',
      esboco: 'Na página: o retângulo com os dois pedaços do meio riscados e o canto −9.',
    },
    {
      tipo: 'passo',
      problema: 'Agora você: ${(2x + 3)(2x - 3)}$.',
      fala: 'Agora você: dois x mais três, vezes dois x menos três.',
      visual: passo([['?', '?'], ['?', '?']], 'O retângulo com a base partida em 2x e 3, a altura em 2x e −3 (vermelho). Os quatro pedaços com "?".'),
      passos: [
        {
          pergunta: 'O pedaço grande: ${2x \\cdot 2x}$.',
          fala: 'O pedaço grande: dois x vezes dois x.',
          opcoes: [
            { texto: '$2x^2$', erro: 'quadrado-do-monomio-so-na-letra', explica: 'O 2 também multiplica: ${2 \\cdot 2 = 4}$, então ${2x \\cdot 2x = 4x^2}$.', fala: 'O dois também multiplica: dois vezes dois, quatro, então dois x vezes dois x, quatro x ao quadrado.', mostra: passo([['4x²', '?'], ['?', '?']], 'O pedaço grande mostra 4x².') },
            { texto: '$4x^2$', certa: true, explica: 'Isso. Números com números, letras com letras.', fala: 'Isso. Números com números, letras com letras.', mostra: passo([['4x²', '?'], ['?', '?']], 'O pedaço grande mostra 4x².') },
          ],
          linha: { tex: '2x \\cdot 2x = 4x^2', fala: 'dois x vezes dois x, quatro x ao quadrado' },
        },
        {
          pergunta: 'Os dois do meio: ${2x \\cdot 3}$ e ${(-3) \\cdot 2x}$.',
          fala: 'Os dois do meio: dois x vezes três, e menos três vezes dois x.',
          opcoes: [
            { texto: '$6x$ e $-6x$: se cancelam', certa: true, explica: 'Isso. Um põe ${6x}$ e o outro tira ${6x}$.', fala: 'Isso. Um põe seis x e o outro tira seis x.', mostra: passo([['4x²', '6x'], ['−6x', '?']], 'Os do meio: 6x e −6x (vermelho), apagados e riscados.', { cancela: true }) },
            { texto: '$6x$ e $-6x$: juntos, $-12x$', erro: 'meios-opostos-somados', explica: '${6x - 6x}$ é zero: um põe o que o outro tira.', fala: 'Seis x menos seis x é zero: um põe o que o outro tira.', mostra: passo([['4x²', '6x'], ['−6x', '?']], 'Os do meio: 6x e −6x (vermelho), apagados e riscados.', { cancela: true }) },
          ],
          linha: { tex: '6x - 6x = 0', fala: 'seis x menos seis x, zero' },
        },
        {
          pergunta: 'E o canto, ${(-3) \\cdot 3}$?',
          fala: 'E o canto, menos três vezes três?',
          opcoes: [
            { texto: '$+9$', erro: 'sinais-diferentes-da-positivo', explica: 'Sinais diferentes dão menos: ${(-3) \\cdot 3 = -9}$.', fala: 'Sinais diferentes dão menos: menos três vezes três, menos nove.', mostra: passo(true, 'Os quatro pedaços: 4x², 6x, −6x e −9, com os do meio riscados.', { cancela: true }) },
            { texto: '$-9$', certa: true, explica: 'Isso. ${(2x + 3)(2x - 3) = 4x^2 - 9}$.', fala: 'Isso. Dois x mais três, vezes dois x menos três, é quatro x ao quadrado menos nove.', mostra: passo(true, 'Os quatro pedaços: 4x², 6x, −6x e −9, os do meio riscados.', { cancela: true }) },
          ],
          linha: { tex: '(2x + 3)(2x - 3) = 4x^2 - 9', fala: 'dois x mais três, vezes dois x menos três, é quatro x ao quadrado menos nove' },
        },
      ],
      esboco: 'O pedaço grande, os do meio que se riscam e o canto: o palco enche um passo por vez.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma conta de cabeça: ${21 \\cdot 19}$. Pense em ${(20 + 1)(20 - 1)}$.',
      fala: 'Uma conta de cabeça: vinte e um vezes dezenove. Pense em vinte mais um, vezes vinte menos um.',
      visual: expr(['21 · 19', '(20 + 1)(20 − 1)'], 'A conta e a mesma conta escrita como soma vezes diferença, em volta de 20.'),
      opcoes: [
        {
          texto: '$400$', erro: 'mais-e-menos-nao-mudam-a-area',
          explica: 'Os do meio se cancelam, mas o canto fica: ${400 - 1 = 399}$.',
          fala: 'Os do meio se cancelam, mas o canto fica: quatrocentos menos um, trezentos e noventa e nove.',
          mostra: CONTA,
        },
        {
          texto: '$399$', certa: true,
          explica: 'Isso. ${20^2 - 1^2 = 400 - 1 = 399}$.',
          fala: 'Isso. Vinte ao quadrado menos um ao quadrado, quatrocentos menos um, trezentos e noventa e nove.',
          mostra: CONTA,
        },
        {
          texto: '$401$', erro: 'sinais-diferentes-da-positivo',
          explica: 'O canto é ${1 \\cdot (-1) = -1}$: ${400 - 1 = 399}$.',
          fala: 'O canto é um vezes menos um, menos um: quatrocentos menos um, trezentos e noventa e nove.',
          mostra: CONTA,
        },
      ],
      esboco: 'A regra vira uma ferramenta de cabeça. Depois da escolha, as linhas mostram o −20 e o +20 que se cancelam.',
    },
    {
      tipo: 'caderno',
      instrucao: 'De cabeça ou no papel: ${32 \\cdot 28}$. Pense em ${(30 + 2)(30 - 2)}$.',
      fala: 'De cabeça ou no papel: trinta e dois vezes vinte e oito. Pense em trinta mais dois, vezes trinta menos dois.',
      resposta: 896,
      resolucao: [
        { tex: '32 \\cdot 28 = (30 + 2)(30 - 2)', fala: 'trinta e dois vezes vinte e oito é trinta mais dois, vezes trinta menos dois' },
        { tex: '= 30^2 - 2^2 = 900 - 4', fala: 'trinta ao quadrado menos dois ao quadrado, novecentos menos quatro' },
        { tex: '= 896', fala: 'oitocentos e noventa e seis' },
      ],
      esboco: 'A mesma ideia com outro par de números em volta de 30.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fatoracao-soma-diferenca-n1', 'fatoracao-soma-diferenca-n2', 'fatoracao-soma-diferenca-n3'],
      esboco: 'Nível 1: o número que falta em (x + a)(x − a), com o retângulo. Nível 2: escolher o produto de (px + a)(px − a) entre os erros comuns. Nível 3: uma conta de cabeça e quanto o terreno perde, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A área muda: o terreno perde 9 m², o canto. Na próxima aula, o caminho de volta: da área para os lados.',
      fala: 'A área muda: o terreno perde nove metros quadrados, o canto. Na próxima aula, o caminho de volta: da área para os lados.',
      visual: TERRENO_PRONTO,
      esboco: 'Responde ao gancho com o retângulo de pedaços riscados e anuncia a fatoração: o fator comum em evidência.',
    },
  ],
}
