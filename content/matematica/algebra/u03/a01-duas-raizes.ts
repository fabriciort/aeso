import type { Aula, Visual } from '@/lib/formation/schema'

// x² = k tem duas raízes. Um cômodo quadrado de 25 m²: o lado x é 5. Mas a
// equação x² = 25 não sabe que x é um lado: (−5)² = 25 também. O momento-
// chave é a aposta "só o 5?", com os dois pulos de mesmo tamanho na reta, e
// o Mexa da tabela dos quadrados de −3 a 3: cada quadrado aparece duas vezes
// (de um número e do oposto), o 0 uma vez só, e nenhum dá negativo. Daí
// x² = 0 (uma raiz) e x² = −9 (nenhuma). Depois, (x − 1)² = 16: x − 1 é 4 ou
// −4, e x é 5 ou −3, conferindo as duas.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { passo: 1, sinais: true, ...estado }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const COMODO = ret({ base: ['x'], altura: ['x'], areas: [['25']], total: 'x² = 25' }, 'O chão do cômodo: um quadrado de lado x, com 25 dentro. Embaixo, x² = 25.')

const DUAS = reta({ de: -6, ate: 6, marcas: [-5, 0, 5], numeros: [-5, 5], saltos: [[0, 5, '+5'], [0, -5, '−5']] }, 'A reta de −6 a 6: do zero saem dois pulos de 5, um para cada lado, e acendem o 5 e o −5.')

const QUADRADOS = (completar: boolean): Visual => ({
  modelo: 'livre',
  estado: {
    tabela: {
      linhas: [
        { rotulo: 'x', valores: ['−3', '−2', '−1', 0, 1, 2, 3] },
        { rotulo: 'x²', valores: [9, 4, 1, 0, 1, 4, 9] },
      ],
      ...(completar ? { completar: true, mostradas: 1 } : {}),
    },
  },
  esboco: completar
    ? 'A tabela de x de −3 a 3, com x² embaixo. Começa só com −3 e 9; cada toque preenche a próxima coluna: 4, 1, 0, 1, 4, 9.'
    : 'A tabela inteira: 9, 4, 1, 0, 1, 4, 9. Os quadrados se repetem dos dois lados do 0, e nenhum é negativo.',
})

const P_INICIO = reta({ de: -4, ate: 6, marcas: [-3, 0, 1, 5] }, 'A reta de −4 a 6, com o 1 marcado: x − 1 mede a distância do x até o 1.')
const P_SALTOS = reta({ de: -4, ate: 6, marcas: [-3, 0, 1, 5], saltos: [[1, 5, '+4'], [1, -3, '−4']] }, 'Do 1 saem dois pulos de 4, um para cada lado: x − 1 é 4 ou −4.')
const P_UM = reta({ de: -4, ate: 6, marcas: [-3, 0, 1, 5], numeros: [5], saltos: [[1, 5, '+4'], [1, -3, '−4']] }, 'Os dois pulos, e o 5 aceso.')
const P_DOIS = reta({ de: -4, ate: 6, marcas: [-3, 0, 1, 5], numeros: [-3, 5], saltos: [[1, 5, '+4'], [1, -3, '−4']] }, 'Os dois pulos, e o 5 e o −3 acesos: as duas raízes.')

export const aula: Aula = {
  id: 'AF.U3.A1',
  titulo: 'x² = k tem duas raízes',
  objetivo: 'Resolver x² = k e (x + a)² = k achando as duas raízes, uma positiva e uma negativa, saber que x² = 0 tem uma raiz só e x² = −9 nenhuma, e conferir cada raiz no lugar do x.',
  modelo: 'reta',
  esboco: 'Abre num cômodo quadrado de 25 m², com o lado x. A aposta "só o 5?" desmonta a ideia de que a equação só aceita o lado: (−5)² = 25, e a reta mostra os dois pulos de 5 a partir do zero. Momento-chave: o Mexa da tabela dos quadrados de −3 a 3, em que cada quadrado aparece duas vezes, o 0 uma vez, e nenhum é negativo. Daí x² = −9 sem raiz. No anote, a regra e a diferença entre √25 (o lado, 5) e as raízes da equação (±5). O passo a passo resolve (x − 1)² = 16 na reta, a partir do 1, e confere as duas.',
  vega: 'Ideia central: a equação x² = k, com k positivo, tem duas raízes, √k e −√k, porque um número e o seu oposto têm o mesmo quadrado ((−5)² = (−5) · (−5) = 25, menos vezes menos dá mais). Com k = 0, só o 0. Com k negativo, nenhuma: nenhum número ao quadrado dá negativo. O símbolo √25 continua valendo só 5 (o lado do quadrado, como na unidade de potências); a equação é que tem duas raízes, e se escreve x = ±5. Em (x − 1)² = 16, o que está ao quadrado é x − 1, que vale 4 ou −4: x = 5 ou x = −3. Num problema de medida, o lado negativo não serve, mas a equação o aceita. Erros esperados: responder só a raiz positiva; a raiz como metade (12,5); achar que (−3)² = −9 e que x² = −9 tem raiz; ao desfazer o x − 1, tirar 1 em vez de somar. Guie com "E o oposto desse número, ao quadrado, dá quanto?", "O que está ao quadrado aqui?", "Ponha o número no lugar do x e veja se dá o lado direito".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um cômodo quadrado tem **25 m²** de chão. Se o lado mede x, então ${x^2 = 25}$. Quanto vale x?',
      fala: 'Um cômodo quadrado tem vinte e cinco metros quadrados de chão. Se o lado mede x, então x ao quadrado é vinte e cinco. Quanto vale x?',
      visual: COMODO,
      esboco: 'O lado do cômodo é 5, e o aluno sabe disso da raiz quadrada. A pergunta de verdade vem no próximo cartão: a equação aceita só o 5?',
    },
    {
      tipo: 'aposta',
      pergunta: 'O lado é 5. Mas a equação ${x^2 = 25}$ aceita só o 5?',
      fala: 'O lado é cinco. Mas a equação x ao quadrado igual a vinte e cinco aceita só o cinco?',
      visual: COMODO,
      opcoes: [
        {
          texto: 'Só o 5', erro: 'raiz-so-positiva',
          explica: 'Para o lado, sim. Mas a equação não sabe que x é um lado: ${(-5)^2 = (-5) \\cdot (-5) = 25}$.',
          fala: 'Para o lado, sim. Mas a equação não sabe que x é um lado: menos cinco ao quadrado é menos cinco vezes menos cinco, vinte e cinco.',
          mostra: DUAS,
        },
        {
          texto: 'O 5 e o −5', certa: true,
          explica: 'Isso. ${(-5) \\cdot (-5) = 25}$: menos vezes menos dá mais. Na reta, os dois ficam a 5 do zero.',
          fala: 'Isso. Menos cinco vezes menos cinco é vinte e cinco: menos vezes menos dá mais. Na reta, os dois ficam a cinco do zero.',
          mostra: DUAS,
        },
        {
          texto: 'O 12,5', erro: 'raiz-e-a-metade',
          explica: '12,5 é a metade de 25. Mas ${12{,}5 \\cdot 12{,}5 = 156{,}25}$, bem mais que 25.',
          fala: 'Doze e meio é a metade de vinte e cinco. Mas doze e meio vezes doze e meio dá cento e cinquenta e seis e vinte e cinco, bem mais que vinte e cinco.',
          mostra: expr(['12,5 · 12,5 = 156,25'], 'A conta que desmonta a metade: 12,5 · 12,5 = 156,25.'),
        },
      ],
      esboco: 'O momento em que a equação se separa do desenho. Os dois pulos de 5 na reta mostram as duas raízes, à mesma distância do zero.',
    },
    {
      tipo: 'ideia',
      texto: 'As duas são **raízes** de ${x^2 = 25}$. Escreve-se ${x = \\pm 5}$: mais ou menos 5.',
      fala: 'As duas são raízes de x ao quadrado igual a vinte e cinco. Escreve-se x igual a mais ou menos cinco.',
      visual: DUAS,
      esboco: 'Os dois pulos continuam no palco: o 5 e o −5 estão a 5 do zero. O ± aparece pela primeira vez: ele volta para completar o quadrado e na fórmula.',
    },
    {
      tipo: 'mexa',
      texto: 'Será que todo quadrado vem de dois números? Eleve ao quadrado cada x, de −3 a 3.',
      fala: 'Será que todo quadrado vem de dois números? Eleve ao quadrado cada x, de menos três a três.',
      visual: QUADRADOS(true),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para ver o próximo quadrado.',
        sucesso: { colunas: 7 },
        mostre: 'As colunas se preenchem: 9, 4, 1, 0, 1, 4, 9.',
      },
      descoberta: 'Os quadrados se repetem dos dois lados do 0: 9 vem do 3 e do −3. O 0 vem só do 0. E nenhum quadrado é negativo.',
      esboco: 'O momento-chave: a tabela é simétrica. O aluno vê o 9 aparecer de novo, o 0 sozinho no meio, e nenhum número negativo na linha de baixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na tabela, ${x^2 = 0}$ só com x = 0. E ${x^2 = -9}$: que número ao quadrado dá −9?',
      fala: 'Na tabela, x ao quadrado é zero só com x igual a zero. E x ao quadrado igual a menos nove: que número ao quadrado dá menos nove?',
      visual: QUADRADOS(false),
      opcoes: [
        {
          texto: '−3', erro: 'sinais-iguais-da-negativo',
          explica: '${(-3) \\cdot (-3) = 9}$, positivo. Menos vezes menos dá mais.',
          fala: 'Menos três vezes menos três é nove, positivo. Menos vezes menos dá mais.',
          mostra: QUADRADOS(false),
        },
        {
          texto: '3 e −3', erro: 'raiz-de-numero-negativo',
          explica: 'Os dois dão 9, não −9. Na linha de baixo não há nenhum número negativo.',
          fala: 'Os dois dão nove, não menos nove. Na linha de baixo não há nenhum número negativo.',
          mostra: QUADRADOS(false),
        },
        {
          texto: 'Nenhum', certa: true,
          explica: 'Isso. Positivo vezes positivo e negativo vezes negativo dão positivo. ${x^2 = -9}$ não tem raiz.',
          fala: 'Isso. Positivo vezes positivo e negativo vezes negativo dão positivo. x ao quadrado igual a menos nove não tem raiz.',
          mostra: QUADRADOS(false),
        },
      ],
      esboco: 'A tabela inteira fica no palco. As três situações: duas raízes, uma (o 0), nenhuma.',
    },
    {
      tipo: 'anote',
      titulo: 'x² = k',
      definicao: 'Com k positivo, ${x^2 = k}$ tem **duas raízes**: ${\\sqrt{k}}$ e ${-\\sqrt{k}}$. Com k = 0, só o 0. Com k negativo, nenhuma.',
      exemplo: { tex: 'x^2 = 25 \\quad \\Rightarrow \\quad x = 5 \\;\\text{ ou }\\; x = -5', fala: 'x ao quadrado igual a vinte e cinco: x igual a cinco ou x igual a menos cinco' },
      alerta: 'A raiz ${\\sqrt{25}}$ é só o 5, o lado. A equação ${x^2 = 25}$ tem duas raízes: ${x = \\pm 5}$.',
      esboco: 'Na página: a reta com os dois pulos de 5, e as três linhas: x² = 25 (duas), x² = 0 (uma), x² = −9 (nenhuma).',
    },
    {
      tipo: 'passo',
      problema: 'Agora o quadrado é de uma conta: resolva ${(x - 1)^2 = 16}$.',
      fala: 'Agora o quadrado é de uma conta: resolva x menos um, ao quadrado, igual a dezesseis.',
      visual: P_INICIO,
      passos: [
        {
          pergunta: 'O que está ao quadrado é ${x - 1}$. Quanto pode valer ${x - 1}$?',
          fala: 'O que está ao quadrado é x menos um. Quanto pode valer x menos um?',
          opcoes: [
            { texto: 'Só 4', erro: 'raiz-so-positiva', explica: 'Falta um: ${(-4)^2 = 16}$ também. ${x - 1}$ pode ser 4 ou −4.', fala: 'Falta um: menos quatro ao quadrado também dá dezesseis. x menos um pode ser quatro ou menos quatro.', mostra: P_SALTOS },
            { texto: '4 ou −4', certa: true, explica: 'Isso. Os dois têm quadrado 16. Na reta, x fica a 4 do 1, para um lado ou para o outro.', fala: 'Isso. Os dois têm quadrado dezesseis. Na reta, x fica a quatro do um, para um lado ou para o outro.', mostra: P_SALTOS },
            { texto: '8 ou −8', erro: 'raiz-e-a-metade', explica: '8 é a metade de 16. Mas ${8^2 = 64}$. Que número vezes ele mesmo dá 16?', fala: 'Oito é a metade de dezesseis. Mas oito ao quadrado é sessenta e quatro. Que número vezes ele mesmo dá dezesseis?', mostra: P_INICIO },
          ],
          linha: { tex: 'x - 1 = 4 \\;\\text{ ou }\\; x - 1 = -4', fala: 'x menos um igual a quatro, ou x menos um igual a menos quatro' },
        },
        {
          pergunta: 'Se ${x - 1 = 4}$, quanto vale x?',
          fala: 'Se x menos um é quatro, quanto vale x?',
          opcoes: [
            { texto: '3', erro: 'desfaz-com-a-mesma-operacao', explica: 'Tirar 1 não desfaz o − 1. Some 1 dos dois lados: ${x = 4 + 1}$.', fala: 'Tirar um não desfaz o menos um. Some um dos dois lados: x igual a quatro mais um.', mostra: P_SALTOS },
            { texto: '5', certa: true, explica: 'Isso. ${x = 4 + 1 = 5}$: o pulo para a direita.', fala: 'Isso. x é quatro mais um, cinco: o pulo para a direita.', mostra: P_UM },
          ],
          linha: { tex: 'x = 5', fala: 'x igual a cinco' },
        },
        {
          pergunta: 'Se ${x - 1 = -4}$, quanto vale x?',
          fala: 'Se x menos um é menos quatro, quanto vale x?',
          opcoes: [
            { texto: '−5', erro: 'desfaz-com-a-mesma-operacao', explica: 'Tirar 1 não desfaz o − 1. Some 1: ${x = -4 + 1}$.', fala: 'Tirar um não desfaz o menos um. Some um: x igual a menos quatro mais um.', mostra: P_UM },
            { texto: '−3', certa: true, explica: 'Isso. ${x = -4 + 1 = -3}$: o pulo para a esquerda.', fala: 'Isso. x é menos quatro mais um, menos três: o pulo para a esquerda.', mostra: P_DOIS },
          ],
          linha: { tex: 'x = -3', fala: 'x igual a menos três' },
        },
        {
          pergunta: 'Confira no lugar do x: ${(5 - 1)^2}$ e ${(-3 - 1)^2}$ dão:',
          fala: 'Confira no lugar do x: cinco menos um, ao quadrado, e menos três menos um, ao quadrado, dão:',
          opcoes: [
            { texto: '16 e −16', erro: 'sinais-iguais-da-negativo', explica: '${(-4)^2 = (-4) \\cdot (-4) = 16}$, positivo. As duas dão 16.', fala: 'Menos quatro ao quadrado é menos quatro vezes menos quatro, dezesseis, positivo. As duas dão dezesseis.', mostra: P_DOIS },
            { texto: '16 e 16', certa: true, explica: 'Isso. ${4^2 = 16}$ e ${(-4)^2 = 16}$: o 5 e o −3 servem.', fala: 'Isso. Quatro ao quadrado é dezesseis, e menos quatro ao quadrado também: o cinco e o menos três servem.', mostra: P_DOIS },
          ],
          linha: { tex: '(5 - 1)^2 = 16, \\quad (-3 - 1)^2 = 16', fala: 'cinco menos um, ao quadrado, dezesseis; menos três menos um, ao quadrado, dezesseis' },
        },
      ],
      esboco: 'Na reta, o 1 é o centro: o x fica a 4 dele, para os dois lados. Cada passo certo acende um pulo ou uma raiz. A conferência fecha com as duas raízes.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${(x + 2)^2 = 9}$ e confira as duas raízes. Qual é a menor?',
      fala: 'No papel: resolva x mais dois, ao quadrado, igual a nove, e confira as duas raízes. Qual é a menor?',
      resposta: -5,
      sinal: true,
      resolucao: [
        { tex: 'x + 2 = 3 \\;\\text{ ou }\\; x + 2 = -3', fala: 'x mais dois igual a três, ou x mais dois igual a menos três' },
        { tex: 'x = 1 \\;\\text{ ou }\\; x = -5', fala: 'x igual a um, ou x igual a menos cinco' },
        { tex: '\\text{confere: } 3^2 = 9, \\quad (-3)^2 = 9', fala: 'confere: um mais dois é três, e três ao quadrado é nove; menos cinco mais dois é menos três, e menos três ao quadrado é nove' },
      ],
      esboco: 'O mesmo caminho do passo a passo, com um + no parêntese: para desfazer, tira 2. A menor raiz é −5.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['segundo-grau-duas-raizes-n1', 'segundo-grau-duas-raizes-n2', 'segundo-grau-duas-raizes-n3'],
      esboco: 'Nível 1: a raiz negativa de x² = k, com o quadrado de lado x no palco. Nível 2: a maior ou a menor raiz de (x + a)² = k. Nível 3: quantas raízes tem x² + a = b, e a menor raiz de ax² = c, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'O cômodo mede 5 m: um lado não é negativo. Mas a equação tem duas raízes, 5 e −5. A seguir: um produto que dá zero.',
      fala: 'O cômodo mede cinco metros: um lado não é negativo. Mas a equação tem duas raízes, cinco e menos cinco. A seguir: um produto que dá zero.',
      visual: DUAS,
      esboco: 'Responde ao gancho: o problema escolhe o 5, a equação tem os dois. Aponta para a próxima aula.',
    },
  ],
}
