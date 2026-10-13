import type { Aula, Visual } from '@/lib/formation/schema'

// Distributiva com letras. Na unidade 3, o retângulo de 3 por 23 se partiu
// em 3 × 20 e 3 × 3. Aqui a frente da horta é x + 3: o retângulo de 2 por
// (x + 3) se parte em 2 × x e 2 × 3, e a área é 2(x + 3) = 2x + 6. O
// momento-chave: o número de fora multiplica CADA termo de dentro; o pedaço
// do 3 também tem 2 m de fundo, então vale 6, não 3. Os azulejos confirmam
// (dois montes de x + 3 são 2 barras e 6 quadradinhos) e a tabela confere
// com números. Depois: um menos dentro, 3(x − 2) = 3x − 6; um menos fora,
// −2(x − 3) = −2x + 6; e o caminho de volta, pôr em evidência: 4x + 8 =
// 4(x + 2), achando os lados do retângulo pela área.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const azulejos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos: estado }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const HORTA = { base: ['x', 3], altura: [2] }
const R3x23 = { base: [20, 3], altura: [3] }
const HORTA_PRONTA = ret({ ...HORTA, areas: true, total: '2x + 6' }, 'A horta partida em x e 3, com 2 de fundo: 2x no pedaço grande, 6 no pequeno, e 2x + 6 embaixo.')

/** Três montes de x − 2: uma barra e dois quadradinhos vermelhos, três vezes. */
const TRES_MONTES = ['x', '−1', '−1', 'x', '−1', '−1', 'x', '−1', '−1']
const TRES_JUNTOS = azulejos({ pecas: TRES_MONTES, agrupado: true, mostraExpressao: true }, 'As peças dos três montes se juntam por tipo: 3 barras (3x) e 6 quadradinhos vermelhos (−6). Embaixo, 3x − 6.')

/** O canteiro do passo a passo: área 4x + 8, fundo 4, frente a descobrir. */
const canteiro = (base: (string | number)[], total: string, esboco: string, extra: Record<string, unknown> = {}) =>
  ret({ base, altura: [4], areas: [['4x', '8']], total, ...extra }, esboco)

export const aula: Aula = {
  id: 'B.U14.A4',
  titulo: 'Distributiva com letras',
  objetivo: 'Tirar os parênteses de expressões como 2(x + 3), 3(x − 2) e −2(x − 3), multiplicando o número de fora por cada termo de dentro, e fazer o caminho de volta, pondo em evidência (4x + 8 = 4(x + 2)).',
  modelo: 'retangulo',
  esboco: 'Abre numa horta de 2 m de fundo e frente x + 3. Primeiro o aluno revê o retângulo da unidade 3 (3 × 23 = 60 + 9). Depois aposta na área da horta: 2x + 6 ou 2x + 3. Momento-chave: o pedaço do 3 acende, com os mesmos 2 m de fundo, e mostra 6; nos azulejos, dois montes de x + 3 viram 2 barras e 6 quadradinhos. A tabela confere com números. Depois o menos dentro (3 montes de x − 2) e fora (−2(x − 3)), e o caminho de volta: do canteiro de área 4x + 8 até a frente x + 2.',
  vega: 'Ideia central: o número de fora dos parênteses multiplica cada termo de dentro (propriedade distributiva, a mesma da unidade 3). 2(x + 3) = 2 · x + 2 · 3 = 2x + 6. No retângulo: 2 de altura, base partida em x e 3; os dois pedaços têm a mesma altura. Com um menos, o sinal vai junto do termo: 3(x − 2) = 3x − 6, e −2(x − 3) = −2x + 6, porque (−2) · (−3) = +6 (unidade 12). Pôr em evidência é o caminho de volta: 4x + 8 = 4(x + 2); confere-se distribuindo de novo. Erros esperados: multiplicar só o primeiro termo (2x + 3), errar o sinal (−2x − 6), pôr em evidência e copiar um termo (4(x + 8)). Guie com "Quanto mede o fundo do pedaço pequeno?", "Confira com x = 10", "Distribua de volta: dá o que você tinha?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma horta tem **2 m** de fundo. A frente tem um trecho **x**, que ninguém mediu, mais **3 m**. Como escrever a área?',
      fala: 'Uma horta tem dois metros de fundo. A frente tem um trecho x, que ninguém mediu, mais três metros. Como escrever a área?',
      visual: ret({ ...HORTA }, 'A horta: um retângulo de 2 de altura, com a base partida em x (mais comprido) e 3. Ainda sem nada dentro.'),
      esboco: 'Uma área que não dá para calcular até o fim, porque o x não foi medido. A pergunta fica aberta; a aula volta aqui.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na unidade 3, você partiu este retângulo: ${3 \\times 23}$ virou ${3 \\times 20}$ e ${3 \\times 3}$. Quanto dá?',
      fala: 'Na unidade três, você partiu este retângulo: três vezes vinte e três virou três vezes vinte, mais três vezes três. Quanto dá?',
      visual: ret({ ...R3x23 }, 'O retângulo de 3 por 23, partido em 20 e 3, sem nada dentro.'),
      opcoes: [
        {
          texto: '69', certa: true,
          explica: 'Isso. ${60 + 9 = 69}$: o 3 multiplica o 20 **e** o 3.',
          fala: 'Isso. Sessenta mais nove, sessenta e nove: o três multiplica o vinte e o três.',
          mostra: ret({ ...R3x23, areas: true, total: 69 }, 'Os pedaços mostram 60 e 9; o 69 aparece embaixo.'),
        },
        {
          texto: '63', erro: 'distributiva-parcial',
          explica: '63 é ${60 + 3}$. O pedaço do 3 também tem altura 3: vale 9. Dá 69.',
          fala: 'Sessenta e três é sessenta mais três. O pedaço do três também tem altura três: vale nove. Dá sessenta e nove.',
          mostra: ret({ ...R3x23, areas: true, destaque: [0, 1], total: 69 }, 'O pedaço pequeno acende: 3 de altura, 3 de base, 9.'),
        },
      ],
      esboco: 'Retomada rápida: o mesmo retângulo partido que a horta vai usar. O erro do pedaço pequeno aparece antes, com números.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora a horta: 2 vezes ${(x + 3)}$, que se escreve ${2(x + 3)}$. Como fica sem os parênteses?',
      fala: 'Agora a horta: dois vezes x mais três, que se escreve dois, abre parênteses, x mais três. Como fica sem os parênteses?',
      visual: ret({ ...HORTA, total: '2(x + 3)' }, 'A horta partida em x e 3, com 2(x + 3) embaixo e os pedaços ainda vazios.'),
      opcoes: [
        {
          texto: '$2x + 3$', erro: 'distributiva-parcial',
          explica: 'O pedaço do 3 também tem **2 m** de fundo: vale ${2 \\cdot 3 = 6}$, não 3.',
          fala: 'O pedaço do três também tem dois metros de fundo: vale dois vezes três, seis, não três.',
          mostra: ret({ ...HORTA, areas: true, destaque: [0, 1], total: '2x + 6' }, 'O pedaço pequeno acende: 2 de fundo, 3 de frente, 6 dentro. Embaixo, 2x + 6.'),
        },
        {
          texto: '$2x + 6$', certa: true,
          explica: 'Isso. O pedaço do x vale ${2x}$, e o pedaço do 3 vale ${2 \\cdot 3 = 6}$.',
          fala: 'Isso. O pedaço do x vale dois x, e o pedaço do três vale dois vezes três, seis.',
          mostra: HORTA_PRONTA,
        },
        {
          texto: '$x + 6$', erro: 'distributiva-parcial',
          explica: 'O pedaço do x também tem **2 m** de fundo: vale ${2x}$. A área é ${2x + 6}$.',
          fala: 'O pedaço do x também tem dois metros de fundo: vale dois x. A área é dois x mais seis.',
          mostra: ret({ ...HORTA, areas: true, destaque: [0, 0], total: '2x + 6' }, 'O pedaço do x acende: 2 de fundo, x de frente, 2x dentro.'),
        },
      ],
      esboco: 'O momento-chave: o pedaço pequeno acende com os mesmos 2 m de fundo. O 2 de fora multiplica cada parte da frente.',
    },
    {
      tipo: 'mexa',
      texto: 'Confira com os azulejos: ${2(x + 3)}$ são **dois montes** de ${x + 3}$. Junte as peças iguais.',
      fala: 'Confira com os azulejos: dois, abre parênteses, x mais três, são dois montes de x mais três. Junte as peças iguais.',
      visual: azulejos({ pecas: ['x', '1', '1', '1', 'x', '1', '1', '1'], montes: 2, agrupar: true, mostraExpressao: true }, 'Dois montes de x + 3, um depois do outro: barra, três quadradinhos, barra, três quadradinhos. Um toque numa peça junta todas do mesmo tipo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa barra e depois num quadradinho.',
        sucesso: { agrupado: true },
        mostre: 'As 2 barras vão para um grupo (2x) e os 6 quadradinhos para outro (6). Embaixo aparece 2x + 6.',
      },
      descoberta: 'O 2 dobra tudo o que está no monte: as barras viram 2x e os quadradinhos viram 6. 2(x + 3) = 2x + 6.',
      esboco: 'O mesmo resultado com outra imagem: dobrar o monte dobra cada peça. Proposta: os dois montes aparecerem um pouco afastados antes do toque.',
    },
    {
      tipo: 'mexa',
      texto: 'Vale para qualquer x? Complete a tabela e compare as duas últimas linhas.',
      fala: 'Vale para qualquer x? Complete a tabela e compare as duas últimas linhas.',
      visual: {
        modelo: 'livre',
        estado: {
          tabela: {
            linhas: [
              { rotulo: 'x', valores: [1, 2, 5, 10] },
              { rotulo: '2(x + 3)', valores: [8, 10, 16, 26] },
              { rotulo: '2x + 6', valores: [8, 10, 16, 26] },
            ],
            completar: true,
            mostradas: 1,
          },
        },
        esboco: 'Três linhas: x, 2(x + 3) e 2x + 6. Começa só com x = 1 (8 e 8). Cada toque preenche uma coluna: 10 e 10, 16 e 16, 26 e 26.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para preencher.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem: com x = 2, 5 e 10, as duas linhas dão 10, 16 e 26.',
      },
      descoberta: 'Para todo x, 2(x + 3) e 2x + 6 dão o mesmo número: são duas formas da mesma expressão.',
      esboco: 'O valor numérico da aula 2 confere a distributiva. Com x = 10: 2 × 13 = 26 e 20 + 6 = 26.',
    },
    {
      tipo: 'anote',
      titulo: 'Distributiva com letras',
      definicao: 'O número de fora dos parênteses multiplica **cada termo** de dentro.',
      exemplo: { tex: '2(x + 3) = 2 \\cdot x + 2 \\cdot 3 = 2x + 6', fala: 'dois, abre parênteses, x mais três, é dois vezes x mais dois vezes três, dois x mais seis' },
      alerta: '${2(x + 3)}$ não é ${2x + 3}$: o 3 também é multiplicado por 2.',
      esboco: 'Na página: a horta partida em x e 3, com 2x e 6 dentro, e setas do 2 de fora até cada termo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E com um menos dentro? Nos azulejos, ${3(x - 2)}$ são três montes de ${x - 2}$. Quanto dá?',
      fala: 'E com um menos dentro? Nos azulejos, três, abre parênteses, x menos dois, são três montes de x menos dois. Quanto dá?',
      visual: azulejos({ pecas: TRES_MONTES, montes: 3 }, 'Três montes de x − 2: barra e dois quadradinhos vermelhos, três vezes, ainda soltos.'),
      opcoes: [
        {
          texto: '$3x - 2$', erro: 'distributiva-parcial',
          explica: 'Cada monte tem dois quadradinhos vermelhos. Três montes têm seis: ${3 \\cdot (-2) = -6}$.',
          fala: 'Cada monte tem dois quadradinhos vermelhos. Três montes têm seis: três vezes menos dois, menos seis.',
          mostra: TRES_JUNTOS,
        },
        {
          texto: '$3x + 6$', erro: 'distributiva-sinal-do-negativo',
          explica: 'Os quadradinhos são vermelhos, negativos: o menos vai junto do 2. ${3 \\cdot (-2) = -6}$.',
          fala: 'Os quadradinhos são vermelhos, negativos: o menos vai junto do dois. Três vezes menos dois, menos seis.',
          mostra: TRES_JUNTOS,
        },
        {
          texto: '$3x - 6$', certa: true,
          explica: 'Isso. Três barras e seis quadradinhos vermelhos: ${3x - 6}$.',
          fala: 'Isso. Três barras e seis quadradinhos vermelhos: três x menos seis.',
          mostra: TRES_JUNTOS,
        },
      ],
      esboco: 'Os três montes se juntam por tipo em qualquer escolha: 3 barras e 6 vermelhos. O menos vai junto do termo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora o menos está fora: ${-2(x - 3)}$. Lembre que menos vezes menos dá mais. Quanto dá?',
      fala: 'Agora o menos está fora: menos dois, abre parênteses, x menos três. Lembre que menos vezes menos dá mais. Quanto dá?',
      visual: expr(['−2(x − 3)'], 'A expressão grande, sozinha.'),
      opcoes: [
        {
          texto: '$-2x + 6$', certa: true,
          explica: 'Isso. ${-2 \\cdot x = -2x}$ e ${-2 \\cdot (-3) = 6}$.',
          fala: 'Isso. Menos dois vezes x, menos dois x, e menos dois vezes menos três, mais seis.',
          mostra: expr(['−2(x − 3)', '(−2) · x + (−2) · (−3)', '−2x + 6'], 'A conta desce em três linhas: a expressão, os dois produtos, e −2x + 6 grande no fim.'),
        },
        {
          texto: '$-2x - 6$', erro: 'distributiva-sinal-do-negativo',
          explica: '${-2 \\cdot (-3)}$ é **+6**. Confira com x = 5: ${-2(5 - 3) = -4}$, e ${-10 + 6 = -4}$.',
          fala: 'Menos dois vezes menos três é mais seis. Confira com x igual a cinco: menos dois vezes dois, menos quatro, e menos dez mais seis, menos quatro.',
          mostra: expr(['com x = 5:', '−2(5 − 3) = −4', '−2 · 5 + 6 = −4'], 'A conferência com x = 5: as duas formas dão −4. Com −6, daria −16.'),
        },
        {
          texto: '$-2x - 3$', erro: 'distributiva-parcial',
          explica: 'O −2 multiplica também o −3: ${-2 \\cdot (-3) = 6}$. Dá ${-2x + 6}$.',
          fala: 'O menos dois multiplica também o menos três: menos dois vezes menos três, seis. Dá menos dois x mais seis.',
          mostra: expr(['−2(x − 3)', '(−2) · x + (−2) · (−3)', '−2x + 6'], 'A conta em três linhas, com os dois produtos à vista.'),
        },
      ],
      esboco: 'O sinal de fora entra em cada termo. A regra dos sinais da unidade 12 volta aqui.',
    },
    {
      tipo: 'passo',
      problema: 'O caminho de volta. Um canteiro tem **4 m** de fundo e área ${4x + 8}$ m². Quanto mede a frente?',
      fala: 'O caminho de volta. Um canteiro tem quatro metros de fundo e área quatro x mais oito metros quadrados. Quanto mede a frente?',
      visual: canteiro(['?', '?'], '4x + 8', 'O canteiro: 4 de altura, a base partida em dois pedaços com "?" em cima, 4x e 8 dentro, e 4x + 8 embaixo.'),
      passos: [
        {
          pergunta: 'O pedaço da esquerda tem área ${4x}$ e fundo 4. Quanto mede a frente dele?',
          fala: 'O pedaço da esquerda tem área quatro x e fundo quatro. Quanto mede a frente dele?',
          opcoes: [
            { texto: '$4x$', explica: 'Assim a área seria ${4 \\cdot 4x = 16x}$. Qual lado, vezes 4, dá ${4x}$? O x.', fala: 'Assim a área seria quatro vezes quatro x, dezesseis x. Qual lado, vezes quatro, dá quatro x? O x.', mostra: canteiro(['x', '?'], '4x + 8', 'O "?" da esquerda vira x.') },
            { texto: '$x$', certa: true, explica: 'Isso. ${4 \\cdot x = 4x}$.', fala: 'Isso. Quatro vezes x, quatro x.', mostra: canteiro(['x', '?'], '4x + 8', 'O "?" da esquerda vira x.') },
          ],
          linha: { tex: '4 \\cdot x = 4x', fala: 'quatro vezes x, quatro x' },
        },
        {
          pergunta: 'E o pedaço da direita, com área 8 e fundo 4?',
          fala: 'E o pedaço da direita, com área oito e fundo quatro?',
          opcoes: [
            { texto: '8', erro: 'evidencia-esquece-termo', explica: 'Assim a área seria ${4 \\cdot 8 = 32}$. Qual número, vezes 4, dá 8? O 2.', fala: 'Assim a área seria quatro vezes oito, trinta e dois. Qual número, vezes quatro, dá oito? O dois.', mostra: canteiro(['x', 2], '4x + 8', 'O "?" da direita vira 2.') },
            { texto: '2', certa: true, explica: 'Isso. ${4 \\cdot 2 = 8}$, ou ${8 \\div 4 = 2}$.', fala: 'Isso. Quatro vezes dois, oito, ou oito dividido por quatro, dois.', mostra: canteiro(['x', 2], '4x + 8', 'O "?" da direita vira 2.') },
            { texto: '4', explica: '${4 \\cdot 4 = 16}$, passa de 8. Divida: ${8 \\div 4 = 2}$.', fala: 'Quatro vezes quatro, dezesseis, passa de oito. Divida: oito dividido por quatro, dois.', mostra: canteiro(['x', 2], '4x + 8', 'O "?" da direita vira 2.') },
          ],
          linha: { tex: '8 \\div 4 = 2', fala: 'oito dividido por quatro, dois' },
        },
        {
          pergunta: 'A frente é ${x + 2}$. Como se escreve a área com parênteses?',
          fala: 'A frente é x mais dois. Como se escreve a área com parênteses?',
          opcoes: [
            { texto: '$4(x + 2)$', certa: true, explica: 'Isso. Tirar o 4 comum para fora se chama **pôr em evidência**.', fala: 'Isso. Tirar o quatro comum para fora se chama pôr em evidência.', mostra: canteiro(['x', 2], '4(x + 2)', 'O total embaixo vira 4(x + 2): os lados do canteiro.') },
            { texto: '$4(x + 8)$', erro: 'evidencia-esquece-termo', explica: 'Distribua de volta: ${4(x + 8) = 4x + 32}$. O 8 também se divide por 4: ${4(x + 2)}$.', fala: 'Distribua de volta: quatro vezes x mais oito dá quatro x mais trinta e dois. O oito também se divide por quatro: quatro vezes x mais dois.', mostra: canteiro(['x', 2], '4(x + 2)', 'O total embaixo vira 4(x + 2).') },
          ],
          linha: { tex: '4x + 8 = 4(x + 2)', fala: 'quatro x mais oito é quatro, abre parênteses, x mais dois' },
        },
      ],
      esboco: 'Pôr em evidência como achar os lados de um retângulo pela área: a altura é o número comum, e cada pedaço da base é o termo dividido por ele.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: tire os parênteses de ${6(x - 4)}$. Depois confira com ${x = 10}$. Quanto dá?',
      fala: 'No papel: tire os parênteses de seis, abre parênteses, x menos quatro. Depois confira com x igual a dez. Quanto dá?',
      resposta: 36,
      sinal: true,
      resolucao: [
        { tex: '6(x - 4) = 6 \\cdot x - 6 \\cdot 4 = 6x - 24', fala: 'seis vezes x menos quatro é seis vezes x menos seis vezes quatro, seis x menos vinte e quatro' },
        { tex: 'x = 10: \\quad 6 \\cdot 10 - 24 = 60 - 24 = 36', fala: 'com x igual a dez: sessenta menos vinte e quatro, trinta e seis' },
        { tex: '\\text{confere: } 6(10 - 4) = 6 \\cdot 6 = 36', fala: 'confere: seis vezes seis, trinta e seis' },
      ],
      esboco: 'Distribuir e conferir com um número: as duas formas dão 36.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['distributiva-letras-n1', 'distributiva-letras-n2', 'distributiva-letras-n3'],
      esboco: 'Nível 1: o número que falta em a(x + b) = ax + □, com o retângulo. Nível 2: escolher a forma sem parênteses com um menos dentro ou fora. Nível 3: pôr em evidência e a área de uma horta com x dado, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A horta tem ${2(x + 3) = 2x + 6}$ m². Na próxima aula: transformar frases, como "o dobro de um número menos 3", em contas.',
      fala: 'A horta tem dois x mais seis metros quadrados. Na próxima aula: transformar frases, como o dobro de um número menos três, em contas.',
      visual: HORTA_PRONTA,
      esboco: 'Responde ao gancho com a horta partida e anuncia a tradução de frases.',
    },
  ],
}
