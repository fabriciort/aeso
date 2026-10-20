import type { Aula, Visual } from '@/lib/formation/schema'

// Resolver por fatoração. x² + 5x + 6 = 0 é uma soma: a regra do produto
// que zera não serve ainda. O momento-chave é o Mexa fatorar da unidade
// anterior: os azulejos se arrumam em (x + 2)(x + 3), e a soma vira um
// produto. Daí as raízes −2 e −3. Com sinais, só na conta: x² − 5x + 6 = 0
// vira (x − 2)(x − 3) = 0, e confere-se o 3. Depois, x² = 4x: dividir por x
// perde a raiz 0, e o x em evidência a guarda. A diferença de quadrados
// x² − 9 = 0 volta ao x² = 9 da primeira aula. Por fim, arrumar antes de
// fatorar: x² = x + 12 vira x² − x − 12 = 0.

const az = (azulejos: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })
const pz = (produtoZero: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { produtoZero }, esboco })

const SOLTOS = az({ fatorar: [5, 6] }, 'Os azulejos de x² + 5x + 6, soltos: o x², 5 barras e 6 quadradinhos. Embaixo, x² + 5x + 6.')
const PRONTO = az({ retangulo: [2, 3] }, 'O retângulo fechado: (x + 2) por (x + 3). Embaixo, x² + 5x + 6 = (x + 2)(x + 3).')

const SEIS = 'x² − 5x + 6 = 0'

const V4 = [-1, 0, 1, 2, 3, 4]
const EVIDENCIA = pz({ fatores: [0, -4], valores: V4, marcados: V4, x: 0 }, 'A tabela de x(x − 4), com x de −1 a 4: o produto zera no 0 e no 4. Embaixo, 0 · (0 − 4) = 0 · (−4) = 0, com o 0 âmbar.')

const DOZE = 'x² = x + 12'

export const aula: Aula = {
  id: 'AF.U3.A3',
  titulo: 'Resolver por fatoração',
  objetivo: 'Resolver equações do 2º grau por fatoração: deixar zero de um lado, fatorar (trinômio, fator comum ou diferença de quadrados), igualar cada fator a zero e conferir cada raiz no lugar do x, sem dividir por x.',
  modelo: 'livre',
  esboco: 'Abre com x² + 5x + 6 = 0: uma soma, e a regra do produto não serve. Momento-chave: o Mexa fatorar arruma os azulejos em (x + 2)(x + 3), e a equação vira um produto que zera: −2 e −3. Com sinais, só na conta: x² − 5x + 6 = 0, sem igualar pedaços da soma a zero, e conferindo o 3. A aposta de x² = 4x mostra que dividir por x perde o 0; o x em evidência o guarda. x² − 9 = 0 volta ao x² = 9. O anote dá o caminho. O último passo a passo arruma x² = x + 12 antes de fatorar.',
  vega: 'Ideia central: para resolver uma equação do 2º grau por fatoração, deixe zero de um lado, fatore o outro e use a regra do produto que zera: cada fator igual a zero. Os caminhos de fatorar são os da unidade anterior: dois números com soma b e produto c (x² − 5x + 6 = (x − 2)(x − 3)), o fator comum (x² − 4x = x(x − 4)) e a diferença de quadrados (x² − 9 = (x + 3)(x − 3)). Não se divide por x: x pode ser 0, e dividir por zero não existe, por isso a divisão perde a raiz 0. Sempre se confere cada raiz no lugar do x. Erros esperados: igualar pedaços de uma soma a zero (x² − 5x = 0 ou 6 = 0) ou responder 6; copiar o número do fator com o sinal ((x − 2)(x − 3) com raízes −2 e −3); trocar os sinais na fatoração; dividir x² = 4x por x e ficar só com 4; responder só 3 em x² − 9 = 0, ou 9; passar o termo para o outro lado sem trocar o sinal. Guie com "Isso é um produto ou uma soma?", "Que dois números têm essa soma e esse produto?", "E se x for 0?", "Ponha a raiz no lugar do x".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: '${x^2 + 5x + 6 = 0}$. Do lado esquerdo há uma **soma**, não um produto. Como achar os x que dão zero?',
      fala: 'x ao quadrado mais cinco x mais seis igual a zero. Do lado esquerdo há uma soma, não um produto. Como achar os x que dão zero?',
      visual: SOLTOS,
      esboco: 'A regra da aula anterior pede um produto. Os azulejos soltos lembram que a soma pode virar um retângulo, um produto.',
    },
    {
      tipo: 'mexa',
      texto: 'Vire a soma num produto: arrume os azulejos de ${x^2 + 5x + 6}$ num retângulo.',
      fala: 'Vire a soma num produto: arrume os azulejos de x ao quadrado mais cinco x mais seis num retângulo.',
      visual: SOLTOS,
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos azulejos para arrumar os quadradinhos de outro jeito.',
        sucesso: { fatorado: [2, 3] },
        mostre: 'Com 2 por 3, as 5 barras fecham o retângulo: (x + 2) por (x + 3).',
      },
      descoberta: 'x² + 5x + 6 = (x + 2)(x + 3). A equação vira (x + 2)(x + 3) = 0, um produto que zera.',
      esboco: 'O momento-chave: a fatoração, que na unidade anterior achava lados, agora transforma a equação num produto. O 1 por 6 deixa vagas; o 2 por 3 fecha.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Então ${(x + 2)(x + 3) = 0}$. Quais são as raízes?',
      fala: 'Então x mais dois vezes x mais três igual a zero. Quais são as raízes?',
      visual: PRONTO,
      opcoes: [
        {
          texto: '2 e 3', erro: 'raiz-com-o-sinal-do-fator',
          explica: 'Com x = 2, ${(2 + 2)(2 + 3) = 20}$. Os fatores zeram com o sinal contrário.',
          fala: 'Com x igual a dois, dois mais dois vezes dois mais três dá vinte. Os fatores zeram com o sinal contrário.',
          mostra: pz({ fatores: [2, 3], valores: [-4, -3, -2, -1, 0, 2], marcados: [2], x: 2 }, 'A tabela de (x + 2)(x + 3) com o 2 posto: (2 + 2) · (2 + 3) = 4 · 5 = 20.'),
        },
        {
          texto: '−2 e −3', certa: true,
          explica: 'Isso. Confira o −2 no começo: ${4 - 10 + 6 = 0}$.',
          fala: 'Isso. Confira o menos dois no começo: quatro menos dez mais seis, zero.',
          mostra: pz({ fatores: [2, 3], valores: [-4, -3, -2, -1, 0, 2], marcados: [-3, -2], x: -2 }, 'A tabela de (x + 2)(x + 3) com o −3 e o −2 postos: os dois produtos são 0.'),
        },
        {
          texto: '6', erro: 'iguala-a-zero-sem-fatorar',
          explica: 'O 6 é o número solto da soma. Com x = 6, ${36 + 30 + 6 = 72}$, não 0.',
          fala: 'O seis é o número solto da soma. Com x igual a seis, trinta e seis mais trinta mais seis dá setenta e dois, não zero.',
          mostra: expr(['x = 6: 36 + 30 + 6 = 72'], 'A conta do 6: 36 + 30 + 6 = 72, longe de zero.'),
        },
      ],
      esboco: 'Com o produto pronto, a regra da aula anterior dá as raízes. Cada opção vira a sua conta.',
    },
    {
      tipo: 'passo',
      problema: 'Com sinais, só na conta: resolva ${x^2 - 5x + 6 = 0}$.',
      fala: 'Com sinais, só na conta: resolva x ao quadrado menos cinco x mais seis igual a zero.',
      visual: expr([SEIS], 'A equação x² − 5x + 6 = 0, sozinha.'),
      passos: [
        {
          pergunta: 'Qual é o primeiro passo?',
          opcoes: [
            { texto: '${x^2 - 5x = 0}$ ou ${6 = 0}$', erro: 'iguala-a-zero-sem-fatorar', explica: 'A regra do zero vale para um **produto**. Aqui há uma soma: fatore primeiro.', fala: 'A regra do zero vale para um produto. Aqui há uma soma: fatore primeiro.', mostra: expr([SEIS, 'é uma soma: fatore'], 'Embaixo: é uma soma, fatore primeiro.') },
            { texto: 'Fatorar: soma −5 e produto 6', certa: true, explica: 'Isso. Com o produto, a regra do zero vale.', fala: 'Isso. Com o produto, a regra do zero vale.', mostra: expr([SEIS, 'soma −5, produto 6'], 'Embaixo: soma −5, produto 6.') },
          ],
          linha: { tex: '\\text{soma } {-5}, \\text{ produto } 6', fala: 'soma menos cinco, produto seis' },
        },
        {
          pergunta: 'Que dois números têm soma −5 e produto 6?',
          fala: 'Que dois números têm soma menos cinco e produto seis?',
          opcoes: [
            { texto: '2 e 3', erro: 'fatora-com-o-sinal-trocado', explica: 'O produto dá 6, mas a soma dá 5. Com os dois negativos: −2 e −3.', fala: 'O produto dá seis, mas a soma dá cinco. Com os dois negativos: menos dois e menos três.', mostra: expr([SEIS, '2 + 3 = 5'], 'Embaixo: 2 + 3 = 5, a soma com o sinal trocado.') },
            { texto: '−1 e −6', erro: 'fatores-com-a-soma-errada', explica: 'O produto dá 6, mas a soma dá −7.', fala: 'O produto dá seis, mas a soma dá menos sete.', mostra: expr([SEIS, '−1 + (−6) = −7'], 'Embaixo: −1 + (−6) = −7.') },
            { texto: '−2 e −3', certa: true, explica: 'Isso. ${(-2) \\cdot (-3) = 6}$ e ${-2 + (-3) = -5}$.', fala: 'Isso. Menos dois vezes menos três, seis, e menos dois mais menos três, menos cinco.', mostra: expr([SEIS, '(x − 2)(x − 3) = 0'], 'Embaixo, a equação como produto: (x − 2)(x − 3) = 0.') },
          ],
          linha: { tex: '(x - 2)(x - 3) = 0', fala: 'x menos dois vezes x menos três igual a zero' },
        },
        {
          pergunta: 'Então as raízes são:',
          opcoes: [
            { texto: '−2 e −3', erro: 'raiz-com-o-sinal-do-fator', explica: 'Com x = −2, ${x - 2}$ dá −4. Os fatores zeram em 2 e em 3.', fala: 'Com x igual a menos dois, x menos dois dá menos quatro. Os fatores zeram em dois e em três.', mostra: expr([SEIS, '(x − 2)(x − 3) = 0', 'x = −2: (−4) · (−5) = 20'], 'Embaixo: com −2, (−4) · (−5) = 20.') },
            { texto: '2 e 3', certa: true, explica: 'Isso. ${x - 2}$ zera em 2, e ${x - 3}$ zera em 3.', fala: 'Isso. x menos dois zera em dois, e x menos três zera em três.', mostra: expr([SEIS, '(x − 2)(x − 3) = 0', 'x = 2 ou x = 3'], 'Embaixo, maior: x = 2 ou x = 3.') },
          ],
          linha: { tex: 'x = 2 \\;\\text{ ou }\\; x = 3', fala: 'x igual a dois, ou x igual a três' },
        },
        {
          pergunta: 'Confira o 3 na equação do começo: ${3^2 - 5 \\cdot 3 + 6}$ dá:',
          fala: 'Confira o três na equação do começo: três ao quadrado menos cinco vezes três mais seis dá:',
          opcoes: [
            { texto: '30', erro: 'termo-perde-o-sinal', explica: 'O menos do ${-5x}$ fica: ${9 - 15 + 6 = 0}$.', fala: 'O menos do menos cinco x fica: nove menos quinze mais seis, zero.', mostra: expr([SEIS, '9 − 15 + 6 = 0'], 'Embaixo: 9 − 15 + 6 = 0.') },
            { texto: '0', certa: true, explica: 'Isso. ${9 - 15 + 6 = 0}$: o 3 é raiz. O 2 também confere: ${4 - 10 + 6 = 0}$.', fala: 'Isso. Nove menos quinze mais seis, zero: o três é raiz. O dois também confere: quatro menos dez mais seis, zero.', mostra: expr([SEIS, '9 − 15 + 6 = 0', '4 − 10 + 6 = 0'], 'Embaixo, as duas conferências: 9 − 15 + 6 = 0 e 4 − 10 + 6 = 0.') },
          ],
          linha: { tex: '\\text{confere: } 9 - 15 + 6 = 0', fala: 'confere: nove menos quinze mais seis, zero' },
        },
      ],
      esboco: 'Sem azulejos: os sinais pela regra dos sinais, o produto, as raízes com o sinal contrário e a conferência na equação do começo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${x^2 = 4x}$, Lia dividiu os dois lados por x e achou x = 4. Ela achou todas as raízes?',
      fala: 'Em x ao quadrado igual a quatro x, Lia dividiu os dois lados por x e achou x igual a quatro. Ela achou todas as raízes?',
      visual: expr(['x² = 4x', 'x = 4'], 'A conta de Lia: x² = 4x e, embaixo, x = 4.'),
      opcoes: [
        {
          texto: 'Sim: x = 4', erro: 'divide-por-x-e-perde-o-zero',
          explica: 'Teste x = 0: ${0^2 = 4 \\cdot 0}$, 0 = 0. O 0 também é raiz, e a divisão por x o perdeu.',
          fala: 'Teste x igual a zero: zero ao quadrado é quatro vezes zero, zero igual a zero. O zero também é raiz, e a divisão por x o perdeu.',
          mostra: EVIDENCIA,
        },
        {
          texto: 'Não: falta o 0', certa: true,
          explica: 'Isso. ${0^2 = 4 \\cdot 0}$. Dividir por x é dividir por zero quando x é 0, e aí não pode.',
          fala: 'Isso. Zero ao quadrado é quatro vezes zero. Dividir por x é dividir por zero quando x é zero, e aí não pode.',
          mostra: EVIDENCIA,
        },
      ],
      esboco: 'A raiz que some. A tabela de x(x − 4) mostra o produto zerando no 0 e no 4.',
    },
    {
      tipo: 'ideia',
      texto: 'Em vez de dividir, ponha x em evidência: ${x^2 - 4x = x(x - 4)}$. O produto zera em x = 0 ou x = 4.',
      fala: 'Em vez de dividir, ponha x em evidência: x ao quadrado menos quatro x é x vezes x menos quatro. O produto zera em x igual a zero ou x igual a quatro.',
      visual: { modelo: 'retangulo', estado: { base: ['x', -4], altura: ['x'], areas: true, total: 'x(x − 4)' }, esboco: 'O retângulo de altura x e base x − 4: x² e −4x (em vermelho) dentro. Embaixo, x(x − 4).' },
      esboco: 'O fator comum da unidade anterior agora guarda a raiz 0. O retângulo lembra de onde vem o x(x − 4).',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x^2 - 9 = 0}$? Lembre do recorte: ${x^2 - 9 = (x + 3)(x - 3)}$. Quais são as raízes?',
      fala: 'E x ao quadrado menos nove igual a zero? Lembre do recorte: x ao quadrado menos nove é x mais três vezes x menos três. Quais são as raízes?',
      visual: { modelo: 'retangulo', estado: { recorte: 3, movido: true }, esboco: 'O recorte da unidade anterior, já remontado: o retângulo (x + 3) por (x − 3), e embaixo x² − 9 = (x + 3)(x − 3).' },
      opcoes: [
        {
          texto: 'Só 3', erro: 'raiz-so-positiva',
          explica: 'O ${x + 3}$ zera em −3. É o ${x^2 = 9}$ da primeira aula: ${x = \\pm 3}$.',
          fala: 'O x mais três zera em menos três. É o x ao quadrado igual a nove da primeira aula: x igual a mais ou menos três.',
          mostra: pz({ fatores: [3, -3], valores: [-4, -3, 0, 3, 4], marcados: [-3, 3], x: -3 }, 'A tabela de (x + 3)(x − 3) com o −3 e o 3 postos: os dois zeram.'),
        },
        {
          texto: '3 e −3', certa: true,
          explica: 'Isso. ${x - 3}$ zera em 3, ${x + 3}$ zera em −3. É o mesmo que ${x^2 = 9}$.',
          fala: 'Isso. x menos três zera em três, x mais três zera em menos três. É o mesmo que x ao quadrado igual a nove.',
          mostra: pz({ fatores: [3, -3], valores: [-4, -3, 0, 3, 4], marcados: [-3, 3], x: 3 }, 'A tabela de (x + 3)(x − 3) com o −3 e o 3 postos: os dois zeram.'),
        },
        {
          texto: '9 e −9', erro: 'fatora-sem-tirar-a-raiz',
          explica: '9 é a área do canto, não o lado. Com x = 9, ${81 - 9 = 72}$.',
          fala: 'Nove é a área do canto, não o lado. Com x igual a nove, oitenta e um menos nove dá setenta e dois.',
          mostra: { modelo: 'retangulo', estado: { recorte: 3 }, esboco: 'O quadrado recortado: o canto que falta tem 3 de lado e 9 de área.' },
        },
      ],
      esboco: 'A diferença de quadrados resolve x² = 9 de outro jeito, e as duas raízes da primeira aula voltam.',
    },
    {
      tipo: 'anote',
      titulo: 'Resolver por fatoração',
      definicao: 'Deixe **zero** de um lado, **fatore** o outro e iguale cada fator a zero. Confira cada raiz no lugar do x.',
      exemplo: { tex: 'x^2 - 5x + 6 = (x - 2)(x - 3) = 0', fala: 'x ao quadrado menos cinco x mais seis é x menos dois vezes x menos três, igual a zero: x igual a dois ou x igual a três' },
      alerta: 'Não divida por x: em ${x^2 = 4x}$, você perde o 0. Ponha x em evidência.',
      esboco: 'Na página: os três passos (zero de um lado, fatorar, cada fator a zero) e a conferência.',
    },
    {
      tipo: 'passo',
      problema: 'Arrume antes de fatorar: resolva ${x^2 = x + 12}$.',
      fala: 'Arrume antes de fatorar: resolva x ao quadrado igual a x mais doze.',
      visual: expr([DOZE], 'A equação x² = x + 12, sozinha.'),
      passos: [
        {
          pergunta: 'Primeiro, deixe zero de um lado:',
          opcoes: [
            { texto: '${x^2 = 0}$ ou ${x + 12 = 0}$', erro: 'iguala-a-zero-sem-fatorar', explica: 'Não há produto nem zero ainda. Tire ${x + 12}$ dos dois lados.', fala: 'Não há produto nem zero ainda. Tire x mais doze dos dois lados.', mostra: expr([DOZE, 'tire x + 12 dos dois lados'], 'Embaixo: tire x + 12 dos dois lados.') },
            { texto: '${x^2 + x + 12 = 0}$', erro: 'passa-para-o-outro-lado', explica: 'Tirando ${x + 12}$ dos dois lados, ficam ${-x}$ e ${-12}$ à esquerda.', fala: 'Tirando x mais doze dos dois lados, ficam menos x e menos doze à esquerda.', mostra: expr([DOZE, 'tirar x + 12 dá − x − 12'], 'Embaixo: tirar x + 12 deixa − x − 12 do lado esquerdo.') },
            { texto: '${x^2 - x - 12 = 0}$', certa: true, explica: 'Isso. Tirou ${x + 12}$ dos dois lados, como na balança.', fala: 'Isso. Tirou x mais doze dos dois lados, como na balança.', mostra: expr([DOZE, 'x² − x − 12 = 0'], 'Embaixo: x² − x − 12 = 0.') },
          ],
          linha: { tex: 'x^2 - x - 12 = 0', fala: 'x ao quadrado menos x menos doze igual a zero' },
        },
        {
          pergunta: 'Que dois números têm soma −1 e produto −12?',
          fala: 'Que dois números têm soma menos um e produto menos doze?',
          opcoes: [
            { texto: '4 e −3', erro: 'fatora-com-o-sinal-trocado', explica: 'O produto dá −12, mas a soma dá 1. Troque os sinais: −4 e 3.', fala: 'O produto dá menos doze, mas a soma dá um. Troque os sinais: menos quatro e três.', mostra: expr([DOZE, 'x² − x − 12 = 0', '4 + (−3) = 1'], 'Embaixo: 4 + (−3) = 1.') },
            { texto: '−6 e 2', erro: 'fatores-com-a-soma-errada', explica: 'O produto dá −12, mas a soma dá −4.', fala: 'O produto dá menos doze, mas a soma dá menos quatro.', mostra: expr([DOZE, 'x² − x − 12 = 0', '−6 + 2 = −4'], 'Embaixo: −6 + 2 = −4.') },
            { texto: '−4 e 3', certa: true, explica: 'Isso. ${(-4) \\cdot 3 = -12}$ e ${-4 + 3 = -1}$.', fala: 'Isso. Menos quatro vezes três, menos doze, e menos quatro mais três, menos um.', mostra: expr([DOZE, 'x² − x − 12 = 0', '(x − 4)(x + 3) = 0'], 'Embaixo: (x − 4)(x + 3) = 0.') },
          ],
          linha: { tex: '(x - 4)(x + 3) = 0', fala: 'x menos quatro vezes x mais três igual a zero' },
        },
        {
          pergunta: 'Então as raízes são:',
          opcoes: [
            { texto: '4 e −3', certa: true, explica: 'Isso. Confira o −3: ${(-3)^2 = 9}$ e ${-3 + 12 = 9}$.', fala: 'Isso. Confira o menos três: menos três ao quadrado é nove, e menos três mais doze é nove.', mostra: expr([DOZE, '(x − 4)(x + 3) = 0', 'x = 4 ou x = −3'], 'Embaixo, maior: x = 4 ou x = −3.') },
            { texto: '−4 e 3', erro: 'raiz-com-o-sinal-do-fator', explica: 'Com x = 3, ${3^2 = 9}$ e ${3 + 12 = 15}$: não bate. As raízes são 4 e −3.', fala: 'Com x igual a três, três ao quadrado é nove e três mais doze é quinze: não bate. As raízes são quatro e menos três.', mostra: expr([DOZE, 'x = 3: 9 ≠ 15'], 'Embaixo: com 3, 9 ≠ 15.') },
          ],
          linha: { tex: 'x = 4 \\;\\text{ ou }\\; x = -3', fala: 'x igual a quatro, ou x igual a menos três' },
        },
      ],
      esboco: 'A equação chega desarrumada. Primeiro o zero de um lado, como na balança; depois a fatoração e a regra do zero. A conferência usa a equação do começo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${x^2 + 2x - 15 = 0}$ e confira as duas raízes. Qual é a menor?',
      fala: 'No papel: resolva x ao quadrado mais dois x menos quinze igual a zero, e confira as duas raízes. Qual é a menor?',
      resposta: -5,
      sinal: true,
      resolucao: [
        { tex: '5 \\cdot (-3) = -15, \\quad 5 + (-3) = 2', fala: 'cinco vezes menos três, menos quinze; cinco mais menos três, dois' },
        { tex: '(x + 5)(x - 3) = 0 \\;\\Rightarrow\\; x = -5 \\text{ ou } x = 3', fala: 'x mais cinco vezes x menos três igual a zero: x igual a menos cinco ou x igual a três' },
        { tex: '\\text{confere: } 25 - 10 - 15 = 0, \\quad 9 + 6 - 15 = 0', fala: 'confere: vinte e cinco menos dez menos quinze, zero; nove mais seis menos quinze, zero' },
      ],
      esboco: 'O caminho inteiro sozinho: soma 2, produto −15, as raízes com o sinal contrário e as duas conferências.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['segundo-grau-fatoracao-n1', 'segundo-grau-fatoracao-n2', 'segundo-grau-fatoracao-n3'],
      esboco: 'Nível 1: a maior ou a menor raiz de x² + bx + c = 0, com os azulejos soltos. Nível 2: quantas raízes tem x² = bx, a menor raiz de x² − n² = 0 e a maior ou a menor de um trinômio com sinais. Nível 3: arrumar antes de fatorar (x² = bx + c, x² + c = bx), sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Fatorar vira a soma num produto, e o produto que zera dá as raízes. E quando não dá para fatorar? A seguir: completar o quadrado.',
      fala: 'Fatorar vira a soma num produto, e o produto que zera dá as raízes. E quando não dá para fatorar? A seguir: completar o quadrado.',
      visual: PRONTO,
      esboco: 'Responde ao gancho com o retângulo pronto e abre a próxima aula: nem todo trinômio tem dois números inteiros com a soma e o produto certos.',
    },
  ],
}
