import type { Aula, Visual } from '@/lib/formation/schema'

// Reconhecer os produtos notáveis. Uma placa quadrada de x por x perdeu um
// canto de 3 por 3: sobrou x² − 9. O momento-chave é o Mexa mover: o L se
// corta em dois, o pedaço de baixo gira e vai para o lado, e a sobra vira um
// retângulo de (x + 3) por (x − 3). Depois, x² − 25 (o lado do canto é 5, não
// 25); os azulejos de x² + 6x + 9 que fecham num quadrado, (x + 3)²; e
// x² − 6x + 9, o quadrado de x − 3. O passo a passo escolhe a forma certa
// para x² − 16 e x² + 8x + 16 e confere com x = 1. É a última aula da
// unidade: o fecho mostra a jornada do módulo, com Equações do 2º grau a
// seguir.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const PLACA = ret({ recorte: 3 }, 'A placa: um quadrado de x por x sem o canto de 3 por 3, tracejado, com 9 dentro. À direita, x − 3 e 3; embaixo, x² − 9.')
const VINTE_CINCO = ret({ recorte: 5, movido: true }, 'A sobra de x² − 25 remontada: um retângulo de x + 5 por x − 5. Embaixo, x² − 25 = (x + 5)(x − 5).')

/** x² − 6x + 9 = (x − 3)²: o quadrado com os pedaços do meio vermelhos. */
const MENOS_TRES = ret({ base: ['x', -3], altura: ['x', -3], areas: true, somaTermos: true }, 'O quadrado de lado x − 3: x², os dois −3x do meio em vermelho e o canto +9. Embaixo, x² − 3x − 3x + 9 = x² − 6x + 9.')

/** As duas expressões do passo a passo, e como ficam depois de cada passo. */
const DEZESSEIS = 'x² − 16'
const QUADRADO_4 = 'x² + 8x + 16'

/** As unidades do módulo Álgebra e Funções, na ordem do currículo. */
const JORNADA = ['Expressões algébricas', 'Produtos notáveis e fatoração', 'Equações do 2º grau', 'Sistemas de equações', 'Inequações', 'Funções', 'Função afim', 'Função quadrática', 'Função exponencial', 'Logaritmo', 'Transformações, composição e inversa']

export const aula: Aula = {
  id: 'AF.U2.A6',
  titulo: 'Reconhecer os produtos notáveis',
  objetivo: 'Reconhecer e fatorar a diferença de quadrados (x² − 9 = (x + 3)(x − 3)) e o quadrado perfeito (x² + 6x + 9 = (x + 3)², x² − 6x + 9 = (x − 3)²), escolhendo a forma pelo número de termos e pelo sinal do meio, e conferir multiplicando ou trocando o x por um número.',
  modelo: 'retangulo',
  esboco: 'Abre numa placa quadrada de x por x sem um canto de 3 por 3: sobrou x² − 9. Momento-chave: o aluno toca a placa, o L se corta em dois, o pedaço de baixo gira e vai para o lado, e a sobra vira um retângulo de (x + 3) por (x − 3). Em x² − 25, o lado do canto é 5. Os azulejos de x² + 6x + 9 fecham num quadrado: (x + 3)². O x² − 6x + 9 é o quadrado de x − 3, com o meio vermelho. O anote junta as três formas; o passo a passo escolhe a certa para x² − 16 e x² + 8x + 16 e confere com x = 1. O fecho mostra a jornada do módulo, com Equações do 2º grau a seguir.',
  vega: 'Ideia central: os produtos notáveis das três primeiras aulas, lidos de trás para a frente. Dois termos, um quadrado menos outro: a diferença de quadrados, a² − b² = (a + b)(a − b), que se vê no recorte (o L de x² − 9 vira um retângulo de x + 3 por x − 3). Três termos, com os das pontas quadrados e o do meio o dobro do produto: o quadrado perfeito, (a + b)² ou (a − b)², com o sinal do meio. O lado do canto é a raiz do número (25 é 5 · 5). Sempre se confere multiplicando ou com um número no lugar do x. Erros esperados: trocar as formas (x² − 9 = (x − 3)², ou x² + 6x + 9 = (x + 3)(x − 3)), usar o número inteiro no lugar do lado ((x + 25)(x − 25)), errar o sinal ((x + 3)² para x² − 6x + 9), e na conferência elevar cada termo ((1 + 4)² = 17). Guie com "Quantos termos tem?", "Tem o termo do meio? Com que sinal?", "Qual é o lado do canto?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma placa quadrada de x por x perdeu um canto de 3 por 3. Sobrou ${x^2 - 9}$. Dá para remontar a sobra num retângulo?',
      fala: 'Uma placa quadrada de x por x perdeu um canto de três por três. Sobrou x ao quadrado menos nove. Dá para remontar a sobra num retângulo?',
      visual: PLACA,
      esboco: 'A diferença de quadrados como uma sobra concreta: um quadrado grande sem um quadrado pequeno. A pergunta é se o L vira um retângulo.',
    },
    {
      tipo: 'mexa',
      texto: 'Corte a sobra em dois e leve um dos pedaços para o lado do outro.',
      visual: ret({ recorte: 3, mover: true }, 'A placa com o pedaço de baixo tracejado e a linha do corte em âmbar. O toque corta, o pedaço gira e desliza para a direita; os lados viram x + 3 e x − 3.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no pedaço tracejado para cortar e levar para o lado.',
        sucesso: { movido: true },
        mostre: 'O pedaço vai para o lado e o L vira um retângulo de x + 3 por x − 3.',
      },
      descoberta: 'A área não muda: x² − 9 = (x + 3)(x − 3). Um lado ganhou 3, o outro perdeu 3.',
      esboco: 'O momento-chave: a soma vezes a diferença aparece sozinha, sem conta. É o (x + 3)(x − 3) = x² − 9 de duas aulas atrás, ao contrário.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x^2 - 25}$? O canto que falta tem área 25. Que retângulo sai da sobra?',
      fala: 'E x ao quadrado menos vinte e cinco? O canto que falta tem área vinte e cinco. Que retângulo sai da sobra?',
      visual: ret({ recorte: 5 }, 'A placa sem um canto de 5 por 5, com 25 dentro. Embaixo, x² − 25.'),
      opcoes: [
        {
          texto: '$(x + 25)(x - 25)$', erro: 'fatora-sem-tirar-a-raiz',
          explica: '25 é a área do canto. O lado dele é 5, porque ${5 \\cdot 5 = 25}$: ${(x + 5)(x - 5)}$.',
          fala: 'Vinte e cinco é a área do canto. O lado dele é cinco, porque cinco vezes cinco é vinte e cinco: x mais cinco vezes x menos cinco.',
          mostra: VINTE_CINCO,
        },
        {
          texto: '$(x + 5)(x - 5)$', certa: true,
          explica: 'Isso. O canto é 5 por 5: um lado ganha 5 e o outro perde 5.',
          fala: 'Isso. O canto é cinco por cinco: um lado ganha cinco e o outro perde cinco.',
          mostra: VINTE_CINCO,
        },
        {
          texto: '$(x - 5)^2$', erro: 'confunde-diferenca-e-quadrado-ao-fatorar',
          explica: 'Essa dá ${x^2 - 10x + 25}$. Na sobra, um lado ganha 5 e o outro perde 5: ${(x + 5)(x - 5)}$.',
          fala: 'Essa dá x ao quadrado menos dez x mais vinte e cinco. Na sobra, um lado ganha cinco e o outro perde cinco: x mais cinco vezes x menos cinco.',
          mostra: VINTE_CINCO,
        },
      ],
      esboco: 'O mesmo recorte com outro canto. O número do fim é a área do canto; o lado é a raiz.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora três termos: ${x^2 + 6x + 9}$. Arrume os azulejos num retângulo.',
      fala: 'Agora três termos: x ao quadrado mais seis x mais nove. Arrume os azulejos num retângulo.',
      visual: { modelo: 'livre', estado: { azulejos: { fatorar: [6, 9] } }, esboco: 'Os azulejos soltos: o x², 6 barras e 9 quadradinhos. O 1 por 9 pede 10 barras (faltam 4); o 3 por 3 fecha, e o retângulo é um quadrado.' },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos azulejos para arrumar os quadradinhos de outro jeito.',
        sucesso: { fatorado: [3, 3] },
        mostre: 'Com 3 por 3, as 6 barras fecham: um quadrado de lado x + 3.',
      },
      descoberta: 'Os dois lados são iguais: x² + 6x + 9 = (x + 3)². É o quadrado da soma, ao contrário.',
      esboco: 'O retângulo que fecha é um quadrado: os dois números são iguais, 3 e 3. Embaixo, x² + 6x + 9 = (x + 3)².',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x^2 - 6x + 9}$, com o meio negativo? De que quadrado ele vem?',
      fala: 'E x ao quadrado menos seis x mais nove, com o meio negativo? De que quadrado ele vem?',
      visual: expr(['x² − 6x + 9'], 'A expressão x² − 6x + 9, sozinha, com o −6x no meio.'),
      opcoes: [
        {
          texto: '$(x + 3)^2$', erro: 'fatora-com-o-sinal-trocado',
          explica: 'Essa dá ${+6x}$ no meio. Para dar ${-6x}$, os dois pedaços do meio são ${-3x}$: ${(x - 3)^2}$.',
          fala: 'Essa dá mais seis x no meio. Para dar menos seis x, os dois pedaços do meio são menos três x: x menos três, ao quadrado.',
          mostra: MENOS_TRES,
        },
        {
          texto: '$(x + 3)(x - 3)$', erro: 'confunde-diferenca-e-quadrado-ao-fatorar',
          explica: 'Essa dá ${x^2 - 9}$, sem o meio. Aqui o meio é ${-6x}$: ${(x - 3)^2}$.',
          fala: 'Essa dá x ao quadrado menos nove, sem o meio. Aqui o meio é menos seis x: x menos três, ao quadrado.',
          mostra: MENOS_TRES,
        },
        {
          texto: '$(x - 3)^2$', certa: true,
          explica: 'Isso. Os dois pedaços do meio são ${-3x}$, e o canto, ${(-3) \\cdot (-3) = 9}$.',
          fala: 'Isso. Os dois pedaços do meio são menos três x, e o canto, menos três vezes menos três, nove.',
          mostra: MENOS_TRES,
        },
      ],
      esboco: 'O quadrado da diferença ao contrário. O quadrado de lado x − 3 mostra o meio vermelho e o canto positivo.',
    },
    {
      tipo: 'anote',
      titulo: 'Os produtos notáveis ao contrário',
      definicao: '${a^2 - b^2 = (a + b)(a - b)}$, ${a^2 + 2ab + b^2 = (a + b)^2}$ e ${a^2 - 2ab + b^2 = (a - b)^2}$: as mesmas igualdades, lidas ao contrário.',
      exemplo: { tex: 'x^2 - 9 = (x + 3)(x - 3)', fala: 'x ao quadrado menos nove é x mais três vezes x menos três' },
      alerta: 'Dois termos, um menos o outro: soma vezes diferença. Três termos: um quadrado, com o sinal do meio. Confira multiplicando.',
      esboco: 'Na página: a placa remontada, o quadrado de azulejos e as três formas, uma embaixo da outra.',
    },
    {
      tipo: 'passo',
      problema: 'Escolha a fatoração de cada um e confira.',
      visual: expr([DEZESSEIS, QUADRADO_4], 'As duas expressões, uma embaixo da outra: x² − 16 e x² + 8x + 16.'),
      passos: [
        {
          pergunta: '${x^2 - 16}$ é igual a:',
          fala: 'x ao quadrado menos dezesseis é igual a:',
          opcoes: [
            { texto: '$(x - 4)^2$', erro: 'confunde-diferenca-e-quadrado-ao-fatorar', explica: 'Essa dá ${x^2 - 8x + 16}$. Sem o termo do meio, é soma vezes diferença.', fala: 'Essa dá x ao quadrado menos oito x mais dezesseis. Sem o termo do meio, é soma vezes diferença.', mostra: expr([`${DEZESSEIS} = (x + 4)(x − 4)`, QUADRADO_4], 'A primeira linha ganha = (x + 4)(x − 4).') },
            { texto: '$(x + 4)(x - 4)$', certa: true, explica: 'Isso. Dois termos, um menos o outro, e ${16 = 4 \\cdot 4}$.', fala: 'Isso. Dois termos, um menos o outro, e dezesseis é quatro vezes quatro.', mostra: expr([`${DEZESSEIS} = (x + 4)(x − 4)`, QUADRADO_4], 'A primeira linha ganha = (x + 4)(x − 4).') },
            { texto: '$(x + 16)(x - 16)$', erro: 'fatora-sem-tirar-a-raiz', explica: '16 é a área do canto. O lado é 4, porque ${4 \\cdot 4 = 16}$.', fala: 'Dezesseis é a área do canto. O lado é quatro, porque quatro vezes quatro é dezesseis.', mostra: expr([`${DEZESSEIS} = (x + 4)(x − 4)`, QUADRADO_4], 'A primeira linha ganha = (x + 4)(x − 4).') },
          ],
          linha: { tex: 'x^2 - 16 = (x + 4)(x - 4)', fala: 'x ao quadrado menos dezesseis é x mais quatro vezes x menos quatro' },
        },
        {
          pergunta: '${x^2 + 8x + 16}$ é igual a:',
          fala: 'x ao quadrado mais oito x mais dezesseis é igual a:',
          opcoes: [
            { texto: '$(x + 4)(x - 4)$', erro: 'confunde-diferenca-e-quadrado-ao-fatorar', explica: 'Essa dá ${x^2 - 16}$, sem o meio. Aqui o meio é ${8x = 2 \\cdot 4x}$: um quadrado.', fala: 'Essa dá x ao quadrado menos dezesseis, sem o meio. Aqui o meio é oito x, duas vezes quatro x: um quadrado.', mostra: expr([`${DEZESSEIS} = (x + 4)(x − 4)`, `${QUADRADO_4} = (x + 4)²`], 'A segunda linha ganha = (x + 4)².') },
            { texto: '$(x + 16)^2$', erro: 'fatora-sem-tirar-a-raiz', explica: '16 é o canto, uma área. O lado é 4: ${(x + 4)^2}$, e o meio confere, ${2 \\cdot 4x = 8x}$.', fala: 'Dezesseis é o canto, uma área. O lado é quatro: x mais quatro, ao quadrado, e o meio confere, duas vezes quatro x, oito x.', mostra: expr([`${DEZESSEIS} = (x + 4)(x − 4)`, `${QUADRADO_4} = (x + 4)²`], 'A segunda linha ganha = (x + 4)².') },
            { texto: '$(x + 4)^2$', certa: true, explica: 'Isso. ${16 = 4^2}$, e o meio é ${2 \\cdot 4x = 8x}$, com mais.', fala: 'Isso. Dezesseis é quatro ao quadrado, e o meio é duas vezes quatro x, oito x, com mais.', mostra: expr([`${DEZESSEIS} = (x + 4)(x − 4)`, `${QUADRADO_4} = (x + 4)²`], 'A segunda linha ganha = (x + 4)².') },
          ],
          linha: { tex: 'x^2 + 8x + 16 = (x + 4)^2', fala: 'x ao quadrado mais oito x mais dezesseis é x mais quatro, ao quadrado' },
        },
        {
          pergunta: 'Confira o segundo com x = 1: ${1 + 8 + 16 = 25}$. Quanto vale ${(1 + 4)^2}$?',
          fala: 'Confira o segundo com x igual a um: um mais oito mais dezesseis, vinte e cinco. Quanto vale um mais quatro, ao quadrado?',
          opcoes: [
            { texto: '$17$', erro: 'quadrado-da-soma-sem-o-meio', explica: '${1^2 + 4^2 = 17}$ esquece o meio. Primeiro a soma: ${(1 + 4)^2 = 5^2 = 25}$.', fala: 'Um ao quadrado mais quatro ao quadrado, dezessete, esquece o meio. Primeiro a soma: um mais quatro, ao quadrado, cinco ao quadrado, vinte e cinco.', mostra: expr([`${DEZESSEIS} = (x + 4)(x − 4)`, `${QUADRADO_4} = (x + 4)²`, 'x = 1: 25 = 5²'], 'Embaixo, a conferência: com x = 1, 25 = 5².') },
            { texto: '$25$', certa: true, explica: 'Isso. ${(1 + 4)^2 = 5^2 = 25}$: os dois lados valem o mesmo.', fala: 'Isso. Um mais quatro, ao quadrado, cinco ao quadrado, vinte e cinco: os dois lados valem o mesmo.', mostra: expr([`${DEZESSEIS} = (x + 4)(x − 4)`, `${QUADRADO_4} = (x + 4)²`, 'x = 1: 25 = 5²'], 'Embaixo, a conferência: com x = 1, 25 = 5².') },
          ],
          linha: { tex: 'x = 1: \\ 1 + 8 + 16 = 25 = (1 + 4)^2', fala: 'com x igual a um, um mais oito mais dezesseis é vinte e cinco, e um mais quatro, ao quadrado, também' },
        },
      ],
      esboco: 'Duas expressões parecidas, com o 16 e o 4 nas duas: o número de termos e o meio escolhem a forma. A conferência com x = 1.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: ${x^2 - 64 = (x + \\square)(x - \\square)}$. Ache o número e confira com x = 10.',
      fala: 'No papel: x ao quadrado menos sessenta e quatro é igual a x mais um número vezes x menos o mesmo número. Ache o número e confira com x igual a dez.',
      resposta: 8,
      resolucao: [
        { tex: '64 = 8 \\cdot 8', fala: 'sessenta e quatro é oito vezes oito' },
        { tex: 'x^2 - 64 = (x + 8)(x - 8)', fala: 'x ao quadrado menos sessenta e quatro é x mais oito vezes x menos oito' },
        { tex: 'x = 10: \\ 100 - 64 = 36 = 18 \\cdot 2', fala: 'com x igual a dez, cem menos sessenta e quatro é trinta e seis, e dezoito vezes dois também' },
      ],
      esboco: 'A diferença de quadrados sem o desenho, e a conferência com um número.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fatoracao-notaveis-n1', 'fatoracao-notaveis-n2', 'fatoracao-notaveis-n3'],
      esboco: 'Nível 1: o lado do canto na diferença de quadrados (com o recorte) ou no quadrado de azulejos. Nível 2: escolher a fatoração de uma diferença de quadrados ou de um quadrado perfeito (contra a forma trocada, o sinal trocado e o número sem a raiz). Nível 3: o lado do quadrado, o número do meio de um quadrado perfeito e o outro lado da placa remontada com x dado, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A placa vira um retângulo: ${x^2 - 9 = (x + 3)(x - 3)}$. Você fechou a unidade. A seguir, Equações do 2º grau: a fatoração vai resolvê-las.',
      fala: 'A placa vira um retângulo: x ao quadrado menos nove é x mais três vezes x menos três. Você fechou a unidade. A seguir, Equações do segundo grau: a fatoração vai resolvê-las.',
      visual: { modelo: 'livre', estado: { jornada: JORNADA, aqui: 2, feitas: 2 }, esboco: 'O caminho de Álgebra e Funções: Expressões algébricas e Produtos notáveis e fatoração feitas; Equações do 2º grau acesa com "você está aqui"; as outras unidades do módulo esperando.' },
      esboco: 'Responde ao gancho, fecha a unidade e mostra a jornada do módulo: a próxima parada usa a fatoração para resolver equações.',
    },
  ],
}
