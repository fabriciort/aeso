import type { Aula, Visual } from '@/lib/formation/schema'

// Polígonos. A lajota de seis lados do piso: como se chama essa figura, e
// quanto mede cada canto? Polígono é uma figura fechada feita só de
// segmentos: lados, vértices, ângulos. O círculo não é. Os nomes vêm do
// número de lados; regular é o que tem lados iguais E ângulos iguais (o
// losango não é). Momento-chave: no passo a passo do pentágono, as
// diagonais que saem de um vértice o cortam em 3 triângulos coloridos, e
// cada um soma 180°: 3 · 180 = 540. A cada lado a mais, um triângulo a
// mais: (n − 2) · 180°. O fim responde ao gancho: o hexágono soma 720° e
// cada canto da lajota mede 120°.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** O hexágono regular da lajota, de A a F. */
const HEX = { A: [-2, 0], B: [-1, -1.732], C: [1, -1.732], D: [2, 0], E: [1, 1.732], F: [-1, 1.732] }
const AF = ['A', 'B', 'C', 'D', 'E', 'F']
/** Um pentágono qualquer, de A a E. */
const PENTA = { A: [0, 0], B: [4, 0], C: [5, 2.5], D: [2, 4.2], E: [-0.8, 2.4] }
const AE = ['A', 'B', 'C', 'D', 'E']
/** Um quadrilátero qualquer, de A a D, e a diagonal AC. */
const QUADRI = { A: [0, 0], B: [5, 0], C: [5.6, 3.2], D: [1, 3.6] }
/** As cores dos triângulos, um a um. */
const CORES = ['azul', true, 'verde', 'azul'] as const
/** Os triângulos que saem do vértice A: [A, 1, 2], [A, 2, 3]… */
const leque = (nomes: string[]) => nomes.slice(1, -1).map((v, i) => ({ vertices: ['A', v, nomes[i + 2]], preenchido: CORES[i] }))

export const aula: Aula = {
  id: 'B.U16.A4',
  titulo: 'Polígonos',
  objetivo: 'Reconhecer um polígono e seus lados, vértices e ângulos; nomear triângulo, quadrilátero, pentágono e hexágono; saber o que é um polígono regular; e somar os ângulos de um polígono dividindo-o em triângulos a partir de um vértice: (n − 2) · 180°.',
  modelo: 'figura',
  esboco: 'A figura o tempo todo. A lajota de seis lados; um pentágono com os vértices A a E; o círculo, que não é polígono; os quatro nomes lado a lado; o quadrado e o losango. Depois as somas: a diagonal corta o quadrilátero em 2 triângulos (360°). Momento-chave: no pentágono, as diagonais saem de A e aparecem 3 triângulos coloridos; 3 · 180 = 540. O anote dá (n − 2) · 180°. O fim volta à lajota: 4 triângulos, 720°, e 120° em cada canto.',
  vega: 'Ideia central: polígono é uma figura fechada feita só de segmentos (os lados); cada canto é um vértice, com um ângulo. O polígono de n lados tem n vértices e n ângulos. Os nomes: triângulo (3), quadrilátero (4), pentágono (5), hexágono (6), octógono (8). Regular: todos os lados iguais e todos os ângulos iguais. A soma dos ângulos: as diagonais que saem de um vértice cortam o polígono em n − 2 triângulos, e cada um dá 180°, então a soma é (n − 2) · 180°. No regular, cada ângulo é a soma dividida por n. Erros esperados: chamar o círculo de polígono; achar o losango regular; usar 180° para qualquer polígono; contar n triângulos (n · 180); esquecer de dividir a soma por n. Guie com "Quantos triângulos saem deste canto?", "Os lados que saem de A viram diagonal?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A lajota do piso tem 6 lados iguais, como um favo de mel. Como se chama essa figura? E quanto mede cada canto?',
      fala: 'A lajota do piso tem seis lados iguais, como um favo de mel. Como se chama essa figura? E quanto mede cada canto?',
      visual: fig({ pontos: HEX, rotulos: false, poligono: { vertices: AF, preenchido: true } }, 'Uma lajota de seis lados iguais, pintada de âmbar claro.'),
      esboco: 'Duas perguntas: o nome sai logo; o canto, só no fim da aula.',
    },
    {
      tipo: 'ideia',
      texto: 'Uma figura fechada, feita só de segmentos, é um **polígono**. Os segmentos são os **lados**; os cantos, os **vértices**.',
      visual: fig({ pontos: PENTA, poligono: AE }, 'A lajota se desfaz e aparece um polígono de 5 lados, com os vértices A, B, C, D e E.'),
      esboco: 'Os nomes das partes. Cada vértice tem um ângulo: são tantos ângulos quantos lados.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O círculo também é uma figura fechada. Ele é um polígono?',
      visual: fig({ circulo: { raio: 2 } }, 'Um círculo sozinho no palco.'),
      opcoes: [
        {
          texto: 'Não: não tem lados retos', certa: true,
          explica: 'Isso. O polígono é feito só de segmentos. O círculo é uma curva, sem lados e sem cantos.',
          fala: 'Isso. O polígono é feito só de segmentos. O círculo é uma curva, sem lados e sem cantos.',
        },
        {
          texto: 'Sim: é fechado', erro: 'curva-e-poligono',
          explica: 'Fechado não basta: o polígono é feito só de segmentos. Procure um lado reto ou um canto no círculo: não há.',
          fala: 'Fechado não basta: o polígono é feito só de segmentos. Procure um lado reto ou um canto no círculo: não há.',
        },
      ],
      esboco: 'O contraexemplo que fixa a definição: fechado e feito de segmentos.',
    },
    {
      tipo: 'ideia',
      texto: 'O nome vem do número de lados: **triângulo** (3), **quadrilátero** (4), **pentágono** (5) e **hexágono** (6).',
      fala: 'O nome vem do número de lados: triângulo, três; quadrilátero, quatro; pentágono, cinco; e hexágono, seis.',
      visual: fig(
        {
          poligonos: [
            { vertices: [[0, 3.8], [3, 3.8], [1.5, 6.4]], nome: '3 lados' },
            { vertices: [[4.2, 3.8], [7.2, 3.8], [7.6, 6.4], [4.6, 6.2]], nome: '4 lados' },
            { vertices: [[1.5, 2.8], [0.073, 1.764], [0.618, 0.086], [2.382, 0.086], [2.927, 1.764]], nome: '5 lados' },
            { vertices: [[7.4, 1.3], [6.65, 2.599], [5.15, 2.599], [4.4, 1.3], [5.15, 0.001], [6.65, 0.001]], nome: '6 lados' },
          ],
        },
        'Quatro polígonos, dois em cima e dois embaixo, com o número de lados no meio: 3, 4, 5 e 6.',
      ),
      esboco: 'Os nomes só depois de o aluno ver as figuras. O hexágono embaixo, à direita, é a lajota.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O polígono **regular** tem lados iguais e ângulos iguais. O losango tem 4 lados iguais. Ele é regular?',
      visual: fig(
        {
          poligonos: [
            { vertices: [[0.4, 3.7], [3.4, 3.7], [3.4, 6.7], [0.4, 6.7]], angulosRetos: [0, 1, 2, 3], nome: 'quadrado' },
            { vertices: [[0, 0], [3.4, 0], [5.1, 2.944], [1.7, 2.944]], angulos: [60, 120, 60, 120], nome: 'losango' },
          ],
        },
        'Em cima, o quadrado, com os quatro cantos retos marcados; embaixo, o losango, de lados iguais, com dois cantos de 60° e dois de 120°.',
      ),
      opcoes: [
        {
          texto: 'Não: os ângulos são diferentes', certa: true,
          explica: 'Isso. O losango tem cantos de 60° e de 120°. O quadrado tem lados iguais e cantos iguais: ele é regular.',
          fala: 'Isso. O losango tem cantos de sessenta e de cento e vinte graus. O quadrado tem lados iguais e cantos iguais: ele é regular.',
        },
        {
          texto: 'Sim: os lados são iguais', erro: 'regular-so-pelos-lados',
          explica: 'Os lados são iguais, mas os cantos não: 60° e 120°. Regular pede as duas coisas, como no quadrado.',
          fala: 'Os lados são iguais, mas os cantos não: sessenta e cento e vinte graus. Regular pede as duas coisas, como no quadrado.',
        },
      ],
      esboco: 'Os dois têm 4 lados iguais; os ângulos decidem.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A diagonal AC corta este quadrilátero em 2 triângulos. Quanto somam os 4 ângulos dele?',
      visual: fig({ pontos: QUADRI, poligono: ['A', 'B', 'C', 'D'], poligonos: [{ vertices: ['A', 'B', 'C'], preenchido: 'azul' }, { vertices: ['A', 'C', 'D'], preenchido: 'verde' }] }, 'Um quadrilátero ABCD cortado pela diagonal AC: um triângulo azul embaixo e um verde em cima.'),
      opcoes: [
        {
          texto: '360°', certa: true,
          explica: 'Isso. Cada triângulo soma 180°, e os cantos deles formam os cantos do quadrilátero: ${2 \\cdot 180 = 360}$.',
          fala: 'Isso. Cada triângulo soma cento e oitenta, e os cantos deles formam os cantos do quadrilátero: dois vezes cento e oitenta, trezentos e sessenta.',
          mostra: fig({ pontos: QUADRI, poligono: { vertices: ['A', 'B', 'C', 'D'], angulos: [74, 101, 84, 101] }, poligonos: [{ vertices: ['A', 'B', 'C'], preenchido: 'azul' }, { vertices: ['A', 'C', 'D'], preenchido: 'verde' }] }, 'Os quatro ângulos aparecem: 74°, 101°, 84° e 101°, que somam 360°.'),
        },
        {
          texto: '180°', erro: 'poligono-soma-180',
          explica: '180° é a soma de um triângulo só. Aqui há dois, e os cantos dos dois formam os 4 cantos: ${2 \\cdot 180 = 360}$.',
          fala: 'Cento e oitenta é a soma de um triângulo só. Aqui há dois, e os cantos dos dois formam os quatro cantos: dois vezes cento e oitenta, trezentos e sessenta.',
          mostra: fig({ pontos: QUADRI, poligono: { vertices: ['A', 'B', 'C', 'D'], angulos: [74, 101, 84, 101] }, poligonos: [{ vertices: ['A', 'B', 'C'], preenchido: 'azul' }, { vertices: ['A', 'C', 'D'], preenchido: 'verde' }] }, 'Os quatro ângulos aparecem: 74°, 101°, 84° e 101°, que somam 360°.'),
        },
      ],
      esboco: 'A ponte entre o triângulo e os outros polígonos. Os ângulos medidos conferem a conta: 74 + 101 + 84 + 101 = 360.',
    },
    {
      tipo: 'passo',
      problema: 'Quanto somam os 5 ângulos deste pentágono?',
      fala: 'Quanto somam os cinco ângulos deste pentágono?',
      visual: fig({ pontos: PENTA, poligono: AE }, 'O pentágono ABCDE de volta, sem nada dentro.'),
      passos: [
        {
          pergunta: 'Trace as diagonais que saem do vértice A. Quantos triângulos aparecem?',
          fala: 'Trace as diagonais que saem do vértice A. Quantos triângulos aparecem?',
          opcoes: [
            {
              texto: '3', certa: true,
              explica: 'Isso. De A saem só 2 diagonais, até C e até D. Os lados AB e AE já existem.',
              fala: 'Isso. De A saem só duas diagonais, até C e até D. Os lados A B e A E já existem.',
              mostra: fig({ pontos: PENTA, poligono: AE, poligonos: leque(AE) }, 'As diagonais AC e AD aparecem, e o pentágono fica com 3 triângulos: azul, âmbar e verde.'),
            },
            {
              texto: '5, um por lado', erro: 'triangulos-demais',
              explica: 'De A só saem 2 diagonais, até C e até D: AB e AE já são lados. Ficam 3 triângulos.',
              fala: 'De A só saem duas diagonais, até C e até D: A B e A E já são lados. Ficam três triângulos.',
              mostra: fig({ pontos: PENTA, poligono: AE, poligonos: leque(AE) }, 'As diagonais AC e AD aparecem, e o pentágono fica com 3 triângulos: azul, âmbar e verde.'),
            },
          ],
          linha: { tex: '5 \\text{ lados} \\to 3 \\text{ triângulos}', fala: 'cinco lados, três triângulos' },
        },
        {
          pergunta: 'Cada triângulo soma 180°. Quanto somam os ângulos do pentágono?',
          fala: 'Cada triângulo soma cento e oitenta graus. Quanto somam os ângulos do pentágono?',
          opcoes: [
            {
              texto: '${3 \\cdot 180 = 540}$', certa: true,
              explica: 'Isso. Os cantos dos 3 triângulos formam, juntos, os 5 cantos do pentágono.',
              fala: 'Isso. Os cantos dos três triângulos formam, juntos, os cinco cantos do pentágono.',
              mostra: fig({ pontos: PENTA, poligono: AE, poligonos: leque(AE), rotulo: '3 · 180° = 540°' }, 'Os 3 triângulos coloridos e, embaixo, 3 · 180° = 540°.'),
            },
            {
              texto: '180', erro: 'poligono-soma-180',
              explica: '180° é um triângulo só. O pentágono tem 3, e os cantos de todos formam os cantos dele: ${3 \\cdot 180}$.',
              fala: 'Cento e oitenta é um triângulo só. O pentágono tem três, e os cantos de todos formam os cantos dele: três vezes cento e oitenta.',
            },
          ],
          linha: { tex: '3 \\cdot 180^\\circ = 540^\\circ', fala: 'três vezes cento e oitenta, quinhentos e quarenta graus' },
        },
      ],
      esboco: 'O momento-chave. As diagonais saem de A e os triângulos se pintam um a um. A errada de 5 triângulos é desmontada vendo que AB e AE já são lados.',
    },
    {
      tipo: 'anote',
      titulo: 'Polígono',
      definicao: 'Um **polígono** é uma figura fechada feita de segmentos, os lados. Com $n$ lados, os ângulos somam ${(n - 2) \\cdot 180^\\circ}$.',
      exemplo: { tex: '\\text{pentágono: } (5 - 2) \\cdot 180^\\circ = 540^\\circ', fala: 'pentágono: cinco menos dois, vezes cento e oitenta, quinhentos e quarenta graus' },
      alerta: 'Só o triângulo soma 180°. São $n - 2$ triângulos, não $n$: os lados que saem do vértice não viram diagonal.',
      esboco: 'Na página, o pentágono com os 3 triângulos e a conta ao lado. Regular: lados iguais e ângulos iguais.',
    },
    {
      tipo: 'passo',
      problema: 'Volte à lajota, um hexágono regular. Quanto mede cada canto?',
      visual: fig({ pontos: HEX, poligono: { vertices: AF, preenchido: true } }, 'A lajota do gancho de volta, agora com os vértices A a F.'),
      passos: [
        {
          pergunta: 'Quanto somam os 6 ângulos do hexágono?',
          fala: 'Quanto somam os seis ângulos do hexágono?',
          opcoes: [
            {
              texto: '${(6 - 2) \\cdot 180 = 720}$', certa: true,
              explica: 'Isso. De A saem 3 diagonais, e o hexágono vira 4 triângulos: ${4 \\cdot 180 = 720}$.',
              fala: 'Isso. De A saem três diagonais, e o hexágono vira quatro triângulos: quatro vezes cento e oitenta, setecentos e vinte.',
              mostra: fig({ pontos: HEX, poligono: AF, poligonos: leque(AF), rotulo: '4 · 180° = 720°' }, 'As diagonais saem de A e a lajota fica com 4 triângulos coloridos. Embaixo: 4 · 180° = 720°.'),
            },
            {
              texto: '${6 \\cdot 180 = 1.080}$', erro: 'triangulos-demais',
              explica: 'São 6 lados, mas só 4 triângulos: os 2 lados que saem de A não viram diagonal.',
              fala: 'São seis lados, mas só quatro triângulos: os dois lados que saem de A não viram diagonal.',
              mostra: fig({ pontos: HEX, poligono: AF, poligonos: leque(AF) }, 'As diagonais saem de A e a lajota fica com 4 triângulos coloridos.'),
            },
          ],
          linha: { tex: '(6 - 2) \\cdot 180^\\circ = 720^\\circ', fala: 'seis menos dois, vezes cento e oitenta, setecentos e vinte graus' },
        },
        {
          pergunta: 'Os 6 cantos são iguais. Quanto mede cada um?',
          fala: 'Os seis cantos são iguais. Quanto mede cada um?',
          opcoes: [
            {
              texto: '${720 \\div 6 = 120}$', certa: true,
              explica: 'Isso. Cada canto da lajota mede 120°: um ângulo obtuso.',
              fala: 'Isso. Cada canto da lajota mede cento e vinte graus: um ângulo obtuso.',
              mostra: fig({ pontos: HEX, poligono: { vertices: AF, preenchido: true, angulos: true } }, 'Os triângulos somem; cada canto da lajota ganha o arco e o valor 120°.'),
            },
            {
              texto: '720°', erro: 'esquece-de-dividir',
              explica: '720° é a soma dos 6 cantos juntos. Cada um é a sexta parte: ${720 \\div 6 = 120}$.',
              fala: 'Setecentos e vinte é a soma dos seis cantos juntos. Cada um é a sexta parte: setecentos e vinte dividido por seis, cento e vinte.',
            },
          ],
          linha: { tex: '720^\\circ \\div 6 = 120^\\circ', fala: 'setecentos e vinte dividido por seis, cento e vinte graus' },
        },
      ],
      esboco: 'O gancho respondido com a regra nova. O palco mostra os 4 triângulos e depois os 120° em cada canto.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: o **octógono** tem 8 lados. Quanto somam os seus ângulos, em graus?',
      fala: 'No papel: o octógono tem oito lados. Quanto somam os seus ângulos, em graus?',
      resposta: 1080,
      resolucao: [
        { tex: '8 - 2 = 6 \\text{ triângulos}', fala: 'oito menos dois, seis triângulos' },
        { tex: '6 \\cdot 180^\\circ = 1.080^\\circ', fala: 'seis vezes cento e oitenta, mil e oitenta graus' },
      ],
      esboco: 'A placa de PARE tem 8 lados. Quem digitar 1.440 contou 8 triângulos.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['poligono-n1', 'poligono-n2', 'poligono-n3'],
      esboco: 'Nível 1: o nome do polígono desenhado e quantos triângulos as diagonais de um vértice formam. Nível 2: a soma dos ângulos de um polígono de n lados e o canto de um polígono regular. Nível 3: o ângulo que falta num quadrilátero ou num pentágono, e o canto de uma mesa ou de uma lajota.',
    },
    {
      tipo: 'fecho',
      texto: 'A lajota é um hexágono regular: cada canto mede 120°. Na próxima aula: o contorno das figuras, o perímetro.',
      fala: 'A lajota é um hexágono regular: cada canto mede cento e vinte graus. Na próxima aula: o contorno das figuras, o perímetro.',
      visual: fig({ pontos: HEX, rotulos: false, poligono: { vertices: AF, preenchido: true, angulos: true } }, 'A lajota do gancho com os seis cantos de 120°.'),
      esboco: 'Responde às duas perguntas do gancho e anuncia o perímetro.',
    },
  ],
}
