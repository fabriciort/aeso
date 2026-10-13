import type { Aula, Visual } from '@/lib/formation/schema'

// Área. A unidade 9 contou a área do retângulo em quadradinhos (comprimento ×
// largura). Aqui ela vai para as figuras tortas: o canteiro em forma de
// paralelogramo, de base 6 m e altura 4 m, com o lado inclinado de 5 m. O
// momento-chave é o Mexa "recortar": o triângulo da ponta sai e desliza para
// o outro lado, e o canteiro vira um retângulo de 6 por 4, com os mesmos 24
// quadradinhos. Recortar e mover não muda a área, e quem manda é a altura,
// não o lado inclinado. Depois, a diagonal parte o paralelogramo em dois
// triângulos iguais: o triângulo é a metade de base · altura. Os erros:
// usar o lado inclinado (6 · 5 = 30), esquecer a metade do triângulo,
// calcular a volta no lugar da área e escrever a área em m.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** O canteiro torto: base 6, altura 4, lado inclinado 5 (3 para o lado, 4 para cima). A altura vai em pé um pouco à direita do meio, para o número caber dentro. */
const TORTO = [[0, 0], [6, 0], [9, 4], [3, 4]]
const RETO = [[0, 0], [6, 0], [6, 4], [0, 4]]
const ALTURA = { de: [5, 4], ate: [5, 0], medida: '4 m', tracejado: true, destaque: 'azul' }
const torto = (extra: Record<string, unknown>, esboco: string) =>
  fig({ grade: true, poligono: { vertices: TORTO, preenchido: true, lados: [6, 5, null, null] }, segmentos: [ALTURA], unidade: 'm', ...extra }, esboco)
const RECORTADO = { grade: true, poligono: TORTO, recortado: true, rotulo: '6 · 4 = 24 m²' }

/** Os dois triângulos do canteiro torto, cortado na diagonal. */
const T1 = [[0, 0], [6, 0], [3, 4]]
const T2 = [[6, 0], [9, 4], [3, 4]]
const metade = (esboco: string) =>
  fig({ grade: true, poligonos: [{ vertices: T1, preenchido: true, nome: '12 m²' }, { vertices: T2, preenchido: 'azul', nome: '12 m²' }], rotulo: '24 ÷ 2 = 12 m²' }, esboco)

/** O triângulo do passo a passo: base 8, altura 4, um lado de 5 (3 para o lado, 4 para cima). */
const TRI = [[0, 0], [8, 0], [5, 4]]
const tri = (extra: Record<string, unknown>, esboco: string) =>
  fig({ poligono: { vertices: TRI, preenchido: true, lados: ['8 cm', '5 cm', null] }, ...extra, segmentos: [{ de: [5, 4], ate: [5, 0], medida: '4 cm', tracejado: true, destaque: 'azul' }] }, esboco)

export const aula: Aula = {
  id: 'B.U16.A6',
  titulo: 'Área',
  objetivo: 'Calcular a área do retângulo, do paralelogramo (base · altura) e do triângulo (metade de base · altura), sabendo por que recortar e mover pedaços não muda a área e por que a conta usa a altura, não o lado inclinado.',
  modelo: 'figura',
  esboco: 'Abre num canteiro torto, um paralelogramo sobre a grade. Primeiro o reto: o canteiro de 6 m por 4 m tem 24 m², como na unidade 9 (o torto se endireita na tela). Depois o aluno aposta na área do torto, com a mesma base e a mesma altura e o lado inclinado de 5 m. Momento-chave: o Mexa "recortar", em que o triângulo da ponta sai e desliza para o outro lado; o canteiro vira o retângulo de 6 por 4, e a grade mostra os mesmos 24 quadradinhos. Depois, a diagonal parte o torto em dois triângulos iguais, de 12 m² cada: o triângulo é a metade. Fecha com um triângulo de base 8 cm e altura 4 cm (16 cm²).',
  vega: 'Ideia central: a área é quantos quadrados de 1 de lado cobrem a figura, e recortar um pedaço e mudá-lo de lugar não muda a área. Por isso o paralelogramo tem a área do retângulo de mesma base e mesma altura: base · altura. A altura é a distância em pé, da base até o lado de cima, e não o lado inclinado. O triângulo é metade de um paralelogramo (dois triângulos iguais formam um): base · altura ÷ 2. Erros esperados: multiplicar pela medida do lado inclinado (6 · 5 = 30 no lugar de 24); esquecer a metade do triângulo; somar os lados (o perímetro) quando a pergunta é o chão; escrever a área em m no lugar de m². Guie com "Se você recortar este pedaço e levar para lá, que figura aparece?", "Qual medida está em pé?", "Quantos triângulos iguais a este formam um paralelogramo?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Este canteiro é torto. Você vai cobrir o chão dele com grama. Quantos m² de grama precisa?',
      fala: 'Este canteiro é torto. Você vai cobrir o chão dele com grama. Quantos metros quadrados de grama precisa?',
      visual: fig({ grade: true, poligono: { vertices: TORTO, preenchido: true } }, 'Um paralelogramo âmbar claro sobre a grade, deitado, com os lados de cima e de baixo na horizontal. Os quadradinhos da ponta ficam cortados ao meio.'),
      esboco: 'Os quadradinhos cortados na ponta impedem a contagem direta. A pergunta fica aberta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Comece pelo reto: um canteiro de **6 m** por **4 m**. Quantos m² de grama?',
      fala: 'Comece pelo reto: um canteiro de seis metros por quatro metros. Quantos metros quadrados de grama?',
      visual: fig({ grade: true, poligono: { vertices: RETO, preenchido: true, lados: [6, 4, null, null] }, unidade: 'm' }, 'O canteiro torto se endireita e vira um retângulo de 6 por 4 sobre a grade, com 6 m embaixo e 4 m do lado.'),
      opcoes: [
        {
          texto: '24 m²', certa: true,
          explica: 'Isso. 4 fileiras de 6 quadrados de 1 m²: $6 \\cdot 4 = 24$ m².',
          fala: 'Isso. Quatro fileiras de seis quadrados de um metro quadrado: seis vezes quatro, vinte e quatro metros quadrados.',
          mostra: fig({ grade: true, poligono: { vertices: RETO, preenchido: true, lados: [6, 4, null, null], nome: '24 m²' }, unidade: 'm' }, 'O retângulo com 24 m² no meio.'),
        },
        {
          texto: '20 m', erro: 'confunde-area-perimetro',
          explica: '$6 + 4 + 6 + 4 = 20$ m é a volta, a borda. A grama cobre o chão: 24 quadradinhos.',
          fala: 'Seis mais quatro mais seis mais quatro, vinte metros, é a volta, a borda. A grama cobre o chão: vinte e quatro quadradinhos.',
          mostra: fig({ grade: true, poligono: { vertices: RETO, preenchido: true, lados: [6, 4, null, null], nome: '24 m²' }, unidade: 'm' }, 'O retângulo com 24 m² no meio.'),
        },
        {
          texto: '24 m', erro: 'area-em-unidade-de-comprimento',
          explica: 'A conta está certa, a unidade não. São 24 quadrados de 1 m de lado: 24 m². "24 m" seria uma fita.',
          fala: 'A conta está certa, a unidade não. São vinte e quatro quadrados de um metro de lado: vinte e quatro metros quadrados. Vinte e quatro metros seria uma fita.',
          mostra: fig({ grade: true, poligono: { vertices: RETO, preenchido: true, lados: [6, 4, null, null], nome: '24 m²' }, unidade: 'm' }, 'O retângulo com 24 m² no meio.'),
        },
      ],
      esboco: 'A retomada da unidade 9, com o retângulo da multiplicação. O polígono anda do torto para o reto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora o torto, com a mesma base e a mesma altura. O lado inclinado mede **5 m**. Quantos m²?',
      fala: 'Agora o torto, com a mesma base e a mesma altura. O lado inclinado mede cinco metros. Quantos metros quadrados?',
      visual: torto({}, 'O retângulo volta a ser o canteiro torto: 6 m embaixo, 5 m no lado inclinado e a altura tracejada em azul, em pé, com 4 m.'),
      opcoes: [
        {
          texto: '24 m²', certa: true,
          explica: 'Isso: o mesmo que o reto. Recorte e confira.',
          fala: 'Isso: o mesmo que o reto. Recorte e confira.',
          mostra: torto({}, 'O mesmo canteiro, com a altura tracejada.'),
        },
        {
          texto: '30 m²', erro: 'area-com-o-lado-inclinado',
          explica: '$6 \\cdot 5$ usa o lado inclinado. O canteiro não sobe 5 m: sobe 4, a altura tracejada. Recorte e confira.',
          fala: 'Seis vezes cinco usa o lado inclinado. O canteiro não sobe cinco metros: sobe quatro, a altura tracejada. Recorte e confira.',
          mostra: torto({}, 'O mesmo canteiro, com a altura tracejada em destaque.'),
        },
      ],
      esboco: 'A aposta antes do recorte. A errada é o erro da aula: a medida inclinada no lugar da altura.',
    },
    {
      tipo: 'mexa',
      texto: 'Recorte o triângulo da ponta e leve para o outro lado. A grama é a mesma: só mudou de lugar.',
      fala: 'Recorte o triângulo da ponta e leve para o outro lado. A grama é a mesma: só mudou de lugar.',
      visual: fig({ grade: true, poligono: TORTO, recortar: true }, 'O canteiro torto sobre a grade, com o triângulo da esquerda tracejado em âmbar, cortado na altura. Um toque e ele desliza 6 quadradinhos para a direita.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no canteiro para recortar o triângulo.',
        sucesso: { recortado: true },
        mostre: 'O triângulo da esquerda desliza para a direita e encaixa na ponta: o canteiro vira um retângulo de 6 por 4.',
      },
      descoberta: 'O torto vira um retângulo de base 6 e altura 4, com os mesmos 24 quadradinhos. Recortar e mover não muda a área.',
      esboco: 'O momento-chave. A grade de fundo deixa contar: 4 fileiras de 6.',
    },
    {
      tipo: 'ideia',
      texto: 'Virou um retângulo de **6 m** por **4 m**. A área não mudou: **24 m²**. Quem manda é a altura, não o lado inclinado.',
      fala: 'Virou um retângulo de seis metros por quatro metros. A área não mudou: vinte e quatro metros quadrados. Quem manda é a altura, não o lado inclinado.',
      visual: fig(RECORTADO, 'O retângulo formado, com 6 · 4 = 24 m² embaixo.'),
      esboco: 'Dá o nome ao que o aluno viu: base · altura.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Corte o canteiro torto na diagonal: saem dois triângulos iguais. Quantos m² tem cada um?',
      fala: 'Corte o canteiro torto na diagonal: saem dois triângulos iguais. Quantos metros quadrados tem cada um?',
      visual: fig({ grade: true, poligonos: [{ vertices: T1, preenchido: true }, { vertices: T2, preenchido: 'azul' }] }, 'O canteiro torto partido pela diagonal: um triângulo âmbar embaixo e um azul em cima, o mesmo triângulo virado.'),
      opcoes: [
        {
          texto: '12 m²', certa: true,
          explica: 'Isso. Os dois são iguais e somam 24: cada um é a metade.',
          fala: 'Isso. Os dois são iguais e somam vinte e quatro: cada um é a metade.',
          mostra: metade('Cada triângulo ganha 12 m² no meio; embaixo, 24 ÷ 2 = 12 m².'),
        },
        {
          texto: '24 m²', erro: 'area-do-triangulo-sem-metade',
          explica: '24 m² é o canteiro inteiro, os dois triângulos juntos. Cada um é a metade: 12 m².',
          fala: 'Vinte e quatro metros quadrados é o canteiro inteiro, os dois triângulos juntos. Cada um é a metade: doze metros quadrados.',
          mostra: metade('Cada triângulo com 12 m²; embaixo, 24 ÷ 2 = 12 m².'),
        },
      ],
      esboco: 'Todo triângulo é metade de um paralelogramo: basta juntar dois iguais.',
    },
    {
      tipo: 'anote',
      titulo: 'Área do paralelogramo e do triângulo',
      definicao: '**Paralelogramo:** base · altura. **Triângulo:** a metade de base · altura. A **altura** é a medida em pé, da base até o topo.',
      exemplo: { tex: '\\frac{6 \\cdot 4}{2} = \\frac{24}{2} = 12 \\text{ m}^2', fala: 'seis vezes quatro, vinte e quatro, dividido por dois: doze metros quadrados' },
      alerta: 'Use a altura, não o lado inclinado. No triângulo, não esqueça a metade.',
      esboco: 'Na página: o paralelogramo virando retângulo e o triângulo como a metade dele.',
    },
    {
      tipo: 'passo',
      problema: 'Um triângulo tem **8 cm** de base. Qual é a área dele?',
      fala: 'Um triângulo tem oito centímetros de base. Qual é a área dele?',
      visual: tri({}, 'Um triângulo com 8 cm embaixo, 5 cm no lado da direita e a altura tracejada em azul, em pé, com 4 cm.'),
      passos: [
        {
          pergunta: 'Qual medida é a **altura**?',
          opcoes: [
            {
              texto: '4 cm', certa: true,
              explica: 'Isso. A altura é a tracejada, em pé sobre a base.',
              fala: 'Isso. A altura é a tracejada, em pé sobre a base.',
              mostra: tri({}, 'A altura tracejada de 4 cm.'),
            },
            {
              texto: '5 cm', erro: 'area-com-o-lado-inclinado',
              explica: '5 cm é o lado inclinado. A altura é a medida em pé, a tracejada: 4 cm.',
              fala: 'Cinco centímetros é o lado inclinado. A altura é a medida em pé, a tracejada: quatro centímetros.',
              mostra: tri({}, 'A altura tracejada de 4 cm.'),
            },
          ],
          linha: { tex: '\\text{base } 8 \\text{ cm} \\qquad \\text{altura } 4 \\text{ cm}', fala: 'base oito centímetros, altura quatro centímetros' },
        },
        {
          pergunta: 'Qual é a área?',
          opcoes: [
            {
              texto: '$\\frac{8 \\cdot 4}{2} = 16$ cm²', certa: true,
              explica: 'Isso. $8 \\cdot 4 = 32$ é o paralelogramo. O triângulo é a metade: 16 cm².',
              fala: 'Isso. Oito vezes quatro, trinta e dois, é o paralelogramo. O triângulo é a metade: dezesseis centímetros quadrados.',
              mostra: tri({ rotulo: '16 cm²' }, 'O triângulo, com 16 cm² embaixo.'),
            },
            {
              texto: '$8 \\cdot 4 = 32$ cm²', erro: 'area-do-triangulo-sem-metade',
              explica: '32 cm² são dois triângulos como este. Falta a metade: $32 \\div 2 = 16$ cm².',
              fala: 'Trinta e dois centímetros quadrados são dois triângulos como este. Falta a metade: trinta e dois dividido por dois, dezesseis.',
              mostra: tri({ rotulo: '16 cm²' }, 'O triângulo, com 16 cm² embaixo.'),
            },
          ],
          linha: { tex: '\\frac{8 \\cdot 4}{2} = 16 \\text{ cm}^2', fala: 'oito vezes quatro dividido por dois, dezesseis centímetros quadrados' },
        },
      ],
      esboco: 'Os dois erros da aula, um em cada passo: a medida inclinada e a metade esquecida.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um terreno em forma de paralelogramo tem base **12 m**, altura **5 m** e lado inclinado **7 m**. Qual é a área, em m²?',
      fala: 'No papel: um terreno em forma de paralelogramo tem base doze metros, altura cinco metros e lado inclinado sete metros. Qual é a área, em metros quadrados?',
      resposta: 60,
      resolucao: [
        { tex: 'A = \\text{base} \\cdot \\text{altura}', fala: 'a área é base vezes altura' },
        { tex: '12 \\cdot 5 = 60 \\text{ m}^2', fala: 'doze vezes cinco, sessenta metros quadrados' },
      ],
      esboco: 'O 7 está lá para ser deixado de fora. A resposta é 60, não 84.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['area-figuras-n1', 'area-figuras-n2', 'area-figuras-n3'],
      esboco: 'Nível 1: o retângulo sobre a grade. Nível 2: paralelogramo e triângulo, com o lado inclinado dado para confundir. Nível 3: a parede com janela (tirar a área da janela), o terreno triangular e o canteiro torto.',
    },
    {
      tipo: 'fecho',
      texto: 'O canteiro torto pede **24 m²** de grama, como o reto. Na próxima aula: o círculo, que não tem lado nenhum.',
      fala: 'O canteiro torto pede vinte e quatro metros quadrados de grama, como o reto. Na próxima aula: o círculo, que não tem lado nenhum.',
      visual: fig(RECORTADO, 'O canteiro recortado, virado retângulo, com 6 · 4 = 24 m² embaixo.'),
      esboco: 'Responde ao gancho e anuncia o círculo.',
    },
  ],
}
