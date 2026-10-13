import type { Aula, Visual } from '@/lib/formation/schema'

// Triângulos e os 180°. A tesoura de um telhado é um triângulo: o
// carpinteiro sabe dois ângulos (30° e 30°). Dá para saber o terceiro sem
// medir? Momento-chave: no Mexa, o aluno recorta os três cantos de um
// triângulo e junta-os sobre uma reta: eles fecham meia volta, 180°. Num
// triângulo bem diferente, comprido e fino, acontece o mesmo. Daí sai a
// conta do ângulo que falta: somar os conhecidos e tirar de 180. Depois, o
// triângulo retângulo (o reto conta!) e por que um triângulo não pode ter
// dois ângulos retos.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** A tesoura do telhado: 30°, 30° e 120°. */
const TELHADO = { A: [0, 0], B: [6, 0], C: [3, 1.732] }
/** O triângulo do Mexa. */
const MEXA = { A: [0, 0], B: [6, 0], C: [2, 4] }
/** Um triângulo comprido e fino, com um canto bem aberto. */
const FINO = { A: [0, 0], B: [7, 0], C: [5.4, 1.8] }
/** Um triângulo retângulo, com o reto em A e 35° em B. */
const RETO = { A: [0, 0], B: [4, 0], C: [0, 2.8] }
const ABC = ['A', 'B', 'C']

const telhado = (angulos: (number | string | null)[], esboco: string, extra: Record<string, unknown> = {}) =>
  fig({ pontos: TELHADO, poligono: { vertices: ABC, angulos }, ...extra }, esboco)

export const aula: Aula = {
  id: 'B.U16.A3',
  titulo: 'Triângulos e os 180°',
  objetivo: 'Mostrar, juntando os três cantos de um triângulo numa reta, que os ângulos de todo triângulo somam 180°, e usar isso para achar o ângulo que falta.',
  modelo: 'figura',
  esboco: 'A figura o tempo todo, com os pontos A, B e C. A tesoura do telhado com 30°, 30° e um ponto de interrogação no alto. Momento-chave: no Mexa, o ponto C sobe e o triângulo muda; o aluno toca cada canto colorido, que é recortado e vai para a reta embaixo; com os três, a meia volta se fecha e aparece 180°. Num triângulo fino, os cantos fecham a reta de novo. O anote dá a regra; o passo a passo responde ao gancho (120°). Depois o triângulo retângulo e os dois retos que não fecham.',
  vega: 'Ideia central: os três ângulos de qualquer triângulo somam 180°, meia volta. Recortados e juntos, os cantos formam uma reta, em qualquer triângulo, grande ou pequeno. Para achar o ângulo que falta: somar os dois conhecidos e tirar de 180. Erros esperados: usar 360 (a volta inteira); achar que a soma depende do tamanho ou da forma; esquecer o ângulo reto, marcado só pelo quadradinho; somar os ângulos conhecidos e parar. Guie com "Quanto vale o quadradinho?", "Os três juntos fazem o quê?", "Some os três no fim: dá 180?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A tesoura do telhado é um triângulo. O carpinteiro sabe dois ângulos: 30° e 30°. Dá para saber o de cima sem medir?',
      fala: 'A tesoura do telhado é um triângulo. O carpinteiro sabe dois ângulos: trinta e trinta graus. Dá para saber o de cima sem medir?',
      visual: telhado([30, 30, '?'], 'Um triângulo largo, como a tesoura de um telhado: 30° nos dois cantos de baixo e um ponto de interrogação no canto de cima.'),
      esboco: 'Uma pergunta de obra, sem transferidor à mão.',
    },
    {
      tipo: 'mexa',
      texto: 'Recorte os três cantos de um triângulo e junte-os, lado a lado, sobre a reta. O que eles formam?',
      visual: fig({ pontos: MEXA, poligono: ABC, juntar: true }, 'O ponto C sobe e o triângulo muda. Os três cantos ganham cores (âmbar, azul, verde) e borda tocável. Embaixo, uma reta com uma meia volta tracejada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada canto colorido do triângulo.',
        sucesso: { cantos: 3 },
        mostre: 'Os três cantos saem do triângulo, um a um, e se encaixam sobre a reta. Fecham a meia volta, e aparece 180°.',
      },
      descoberta: 'Os três cantos, juntos, fecham exatamente uma reta: meia volta, 180°. Não sobra nem falta.',
      esboco: 'O momento-chave. Cada toque leva um canto para a reta, ao lado dos que já estão lá. O terceiro fecha a reta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora um triângulo bem diferente, comprido e fino. Os cantos dele, juntos, formam o quê?',
      visual: fig({ pontos: FINO, poligono: ABC, juntar: true }, 'O ponto C desce e anda para a direita: um triângulo comprido e fino, com um canto bem aberto em cima.'),
      opcoes: [
        {
          texto: 'Meia volta de novo: 180°', certa: true,
          explica: 'Isso. Dois cantos ficaram fechados, mas o de cima abriu muito. Juntos, fecham a mesma reta.',
          fala: 'Isso. Dois cantos ficaram fechados, mas o de cima abriu muito. Juntos, fecham a mesma reta.',
          mostra: fig({ pontos: FINO, poligono: ABC, juntados: true }, 'Os três cantos vão para a reta e fecham a meia volta: 180°.'),
        },
        {
          texto: 'Menos que meia volta: ele é fino', erro: 'soma-depende-do-triangulo',
          explica: 'Os de baixo são fechados, mas o de cima abriu muito. Juntos, fecham a mesma reta: 180°.',
          fala: 'Os de baixo são fechados, mas o de cima abriu muito. Juntos, fecham a mesma reta: cento e oitenta graus.',
          mostra: fig({ pontos: FINO, poligono: ABC, juntados: true }, 'Os três cantos vão para a reta e fecham a meia volta: 180°.'),
        },
        {
          texto: 'Uma volta inteira: 360°', erro: 'triangulo-soma-360',
          explica: 'Os cantos juntos fazem uma reta, não uma volta. Uma reta é meia volta: 180°.',
          fala: 'Os cantos juntos fazem uma reta, não uma volta. Uma reta é meia volta: cento e oitenta graus.',
          mostra: fig({ pontos: FINO, poligono: ABC, juntados: true }, 'Os três cantos vão para a reta e fecham a meia volta: 180°.'),
        },
      ],
      esboco: 'Para o aluno ver que não foi sorte do primeiro triângulo. Todas as opções terminam com os cantos na reta.',
    },
    {
      tipo: 'anote',
      titulo: 'Os ângulos do triângulo',
      definicao: 'Os três ângulos de qualquer triângulo somam **180°**, meia volta.',
      exemplo: { tex: '50^\\circ + 60^\\circ + 70^\\circ = 180^\\circ', fala: 'cinquenta mais sessenta mais setenta, cento e oitenta graus' },
      alerta: 'Não é 360°. Os três cantos juntos fazem uma reta, não uma volta.',
      esboco: 'Na página, um triângulo com os três cantos coloridos e, embaixo, os cantos juntos sobre uma reta.',
    },
    {
      tipo: 'passo',
      problema: 'Volte ao telhado: 30°, 30° e o de cima. Quanto mede o ângulo de cima?',
      fala: 'Volte ao telhado: trinta, trinta e o de cima. Quanto mede o ângulo de cima?',
      visual: telhado([30, 30, '?'], 'A tesoura do telhado de volta: 30°, 30° e o ponto de interrogação.'),
      passos: [
        {
          pergunta: 'Os três somam 180°. O que fazer primeiro?',
          fala: 'Os três somam cento e oitenta graus. O que fazer primeiro?',
          opcoes: [
            {
              texto: 'Somar os dois que sei: ${30 + 30 = 60}$', certa: true,
              explica: 'Isso. Os dois de baixo já usam 60° dos 180°.',
              fala: 'Isso. Os dois de baixo já usam sessenta dos cento e oitenta graus.',
              mostra: telhado([30, 30, '?'], 'Os dois cantos de baixo acendem.', { rotulo: '30° + 30° = 60°' }),
            },
            {
              texto: 'Somar tudo: ${180 + 30 + 30}$', erro: 'operacao-trocada',
              explica: 'O 180 já é a soma dos três. O de cima é o que falta: tire os dois conhecidos do 180.',
              fala: 'O cento e oitenta já é a soma dos três. O de cima é o que falta: tire os dois conhecidos do cento e oitenta.',
            },
          ],
          linha: { tex: '30^\\circ + 30^\\circ = 60^\\circ', fala: 'trinta mais trinta, sessenta graus' },
        },
        {
          pergunta: 'Quanto falta de 60° para chegar a 180°?',
          fala: 'Quanto falta de sessenta para chegar a cento e oitenta graus?',
          opcoes: [
            {
              texto: '120°', certa: true,
              explica: 'Isso. ${180 - 60 = 120}$. Confira: ${30 + 30 + 120 = 180}$.',
              fala: 'Isso. Cento e oitenta menos sessenta, cento e vinte. Confira: trinta mais trinta mais cento e vinte, cento e oitenta.',
              mostra: telhado([30, 30, 120], 'O ponto de interrogação vira 120°.', { rotulo: '30° + 30° + 120° = 180°' }),
            },
            {
              texto: '300°', erro: 'triangulo-soma-360',
              explica: '300 é ${360 - 60}$. Os três somam 180, não 360. E 300° nem cabe num canto do triângulo.',
              fala: 'Trezentos é trezentos e sessenta menos sessenta. Os três somam cento e oitenta, não trezentos e sessenta. E trezentos graus nem cabe num canto do triângulo.',
            },
          ],
          linha: { tex: '180^\\circ - 60^\\circ = 120^\\circ', fala: 'cento e oitenta menos sessenta, cento e vinte graus' },
        },
      ],
      esboco: 'O gancho respondido com a regra. O ponto de interrogação vira 120° no fim, e o canto de cima é mesmo bem aberto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Este triângulo tem um ângulo reto e um de 35°. Quanto mede o terceiro?',
      fala: 'Este triângulo tem um ângulo reto e um de trinta e cinco graus. Quanto mede o terceiro?',
      visual: fig({ pontos: RETO, poligono: { vertices: ABC, angulos: [null, 35, '?'], angulosRetos: ['A'] } }, 'Um triângulo retângulo: o quadradinho do reto em A, 35° em B e um ponto de interrogação em C.'),
      opcoes: [
        {
          texto: '55°', certa: true,
          explica: 'Isso. O quadradinho vale 90°: ${90 + 35 = 125}$, e ${180 - 125 = 55}$.',
          fala: 'Isso. O quadradinho vale noventa: noventa mais trinta e cinco, cento e vinte e cinco, e cento e oitenta menos cento e vinte e cinco, cinquenta e cinco.',
          mostra: fig({ pontos: RETO, poligono: { vertices: ABC, angulos: [90, 35, 55], angulosRetos: ['A'] } }, 'O ponto de interrogação vira 55°, e o reto ganha o 90°.'),
        },
        {
          texto: '145°', erro: 'esquece-um-angulo-na-soma',
          explica: '145 é ${180 - 35}$: o reto ficou de fora. O quadradinho vale 90°: ${180 - 90 - 35 = 55}$.',
          fala: 'Cento e quarenta e cinco é cento e oitenta menos trinta e cinco: o reto ficou de fora. O quadradinho vale noventa: sobram cinquenta e cinco.',
          mostra: fig({ pontos: RETO, poligono: { vertices: ABC, angulos: [90, 35, 55], angulosRetos: ['A'] } }, 'O reto ganha o 90°, e o ponto de interrogação vira 55°.'),
        },
        {
          texto: '235°', erro: 'triangulo-soma-360',
          explica: '235 sai de ${360 - 90 - 35}$. Os três somam 180: sobram 55°. Um canto de 235° nem cabe no triângulo.',
          fala: 'Duzentos e trinta e cinco sai de trezentos e sessenta menos noventa menos trinta e cinco. Os três somam cento e oitenta: sobram cinquenta e cinco.',
        },
      ],
      esboco: 'O reto aparece só como o quadradinho, sem número: é onde o aluno esquece de contar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um triângulo pode ter dois ângulos retos?',
      visual: fig({ pontos: { A: [0, 0], B: [4, 0] }, segmentos: [['A', 'B']], semirretas: [['A', [0, 3]], ['B', [4, 3]]], angulo: [{ vertice: 'A', de: 'B', ate: [0, 3], lados: false }, { vertice: 'B', de: [4, 3], ate: 'A', lados: false }] }, 'O segmento AB com um canto reto em cada ponta: de A e de B sobem duas semirretas em pé, lado a lado, que nunca se encontram.'),
      opcoes: [
        {
          texto: 'Não: os lados nunca se encontram', certa: true,
          explica: 'Isso. ${90 + 90 = 180}$: não sobra nada para o terceiro canto. Os lados sobem lado a lado e não fecham.',
          fala: 'Isso. Noventa mais noventa, cento e oitenta: não sobra nada para o terceiro canto. Os lados sobem lado a lado e não fecham.',
        },
        {
          texto: 'Pode, se for bem grande', erro: 'soma-depende-do-triangulo',
          explica: 'Por mais que os lados subam, eles seguem lado a lado e não se encontram. Os dois retos já gastam os 180°.',
          fala: 'Por mais que os lados subam, eles seguem lado a lado e não se encontram. Os dois retos já gastam os cento e oitenta graus.',
        },
      ],
      esboco: 'A regra vista ao contrário: dois retos já são meia volta, e o desenho mostra que não fecha.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um triângulo tem ângulos de 48° e 67°. Quanto mede o terceiro?',
      fala: 'No papel: um triângulo tem ângulos de quarenta e oito e sessenta e sete graus. Quanto mede o terceiro?',
      resposta: 65,
      resolucao: [
        { tex: '48^\\circ + 67^\\circ = 115^\\circ', fala: 'quarenta e oito mais sessenta e sete, cento e quinze' },
        { tex: '180^\\circ - 115^\\circ = 65^\\circ', fala: 'cento e oitenta menos cento e quinze, sessenta e cinco' },
        { tex: '48 + 67 + 65 = 180 \\; \\checkmark', fala: 'confere: os três somam cento e oitenta' },
      ],
      esboco: 'Sem desenho: o aluno faz a conta e confere somando os três.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['terceiro-angulo-n1', 'terceiro-angulo-n2', 'terceiro-angulo-n3'],
      esboco: 'Nível 1: o ângulo que falta num triângulo desenhado, com dois ângulos escritos. Nível 2: o triângulo retângulo (o reto conta) e o triângulo com dois ângulos iguais. Nível 3: a escada na parede, a tesoura do telhado e ângulos x, 2x e 3x.',
    },
    {
      tipo: 'fecho',
      texto: 'O canto de cima do telhado mede 120°, sem transferidor. Na próxima aula: figuras com mais lados.',
      fala: 'O canto de cima do telhado mede cento e vinte graus, sem transferidor. Na próxima aula: figuras com mais lados.',
      visual: telhado([30, 30, 120], 'A tesoura do telhado com os três ângulos: 30°, 30° e 120°.'),
      esboco: 'Responde ao gancho e anuncia os polígonos.',
    },
  ],
}
