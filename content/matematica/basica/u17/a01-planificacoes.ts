import type { Aula, Visual } from '@/lib/formation/schema'

// Planificações. A caixa de sapato chega desmontada, plana: como um papelão
// plano vira uma caixa? O momento-chave é o Mexa "abrir": a caixa se abre e
// vira a cruz de 6 retângulos, iguais dois a dois. Daí os nomes (face,
// aresta, vértice) e a contagem com o que está atrás (6, 12, 8). Depois, o
// cubo: nem toda cruz de 6 quadrados fecha (a fila de 5 deixa um buraco); o
// prisma de base triangular (3 retângulos e 2 triângulos); o cilindro, que
// abre em 2 círculos e um retângulo cuja largura é a volta da tampa, π · d
// (unidade 16). A pirâmide e o cone aparecem só para ganhar o nome. Os erros:
// contar só o que está à vista, contar as arestas face por face (24), achar
// que toda cruz fecha um cubo e dar ao rótulo da lata a largura do diâmetro.

const sol = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'solido', estado, esboco })
const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** A caixa de sapato: 30 cm por 20 cm por 12 cm. */
const CAIXA = { comprimento: 30, largura: 20, altura: 12, unidade: 'cm' }
const caixa = (extra: Record<string, unknown>, esboco: string) => sol({ ...CAIXA, ...extra }, esboco)
/** As faces de frente uma para a outra, com a mesma cor. */
const PARES = { frente: 'ambar', tras: 'ambar', topo: 'azul', base: 'azul', esquerda: 'verde', direita: 'verde' }

/** As duas redes de 6 quadrados: em cima, a cruz (fecha); embaixo, a fila de 5 com um em cima (não fecha). */
const q = (x: number, y: number) => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]]
const CRUZ = [q(0, 5), q(1, 5), q(2, 5), q(3, 5), q(1, 6), q(1, 4)]
const FILA = [q(0, 1), q(1, 1), q(2, 1), q(3, 1), q(4, 1), q(1, 2)]
const redes = (esboco: string) =>
  fig(
    {
      poligonos: [
        ...CRUZ.map((v, i) => ({ vertices: v, preenchido: true, nome: i === 1 ? 'A' : undefined })),
        ...FILA.map((v, i) => ({ vertices: v, preenchido: 'azul', nome: i === 1 ? 'B' : undefined })),
      ],
    },
    esboco,
  )

const CUBO = { solido: 'cubo', aresta: 3, medidas: false }
const PRISMA = { solido: 'prisma', comprimento: 6, largura: 4, altura: 4, medidas: false }
/** A lata: 4 cm de raio (8 cm de diâmetro) e 12 cm de altura. */
const LATA = { solido: 'cilindro', raio: 4, altura: 12, unidade: 'cm' }
const lata = (extra: Record<string, unknown>, esboco: string) => sol({ ...LATA, ...extra }, esboco)

export const aula: Aula = {
  id: 'B.U17.A1',
  titulo: 'Planificações',
  objetivo: 'Abrir um sólido na planificação e reconhecer as faces: a caixa (6 retângulos), o cubo, o prisma de base triangular e o cilindro (2 círculos e um retângulo da largura da volta); contar faces, arestas e vértices sem esquecer os de trás; nomear a pirâmide e o cone.',
  modelo: 'solido',
  esboco: 'Abre na caixa de sapato meio aberta: como um papelão plano vira uma caixa? Momento-chave: o Mexa "abrir", em que as faces giram nas dobras e a caixa vira a cruz de 6 retângulos. As faces de frente uma para a outra ganham a mesma cor. Depois, a caixa fecha: os vértices (8, com o canto escondido) e as arestas (12, não 24). O cubo: a cruz fecha, a fila de 5 não. O prisma abre em 3 retângulos e 2 triângulos; a lata, em 2 círculos e um retângulo de largura π · 8. A pirâmide e o cone, só os nomes.',
  vega: 'Ideia central: um sólido de faces planas é feito de partes planas (as faces), dobradas nas arestas, que se encontram nos vértices. Abrir o sólido no plano dá a planificação: a caixa vira 6 retângulos, iguais dois a dois; o prisma de base triangular, 3 retângulos e 2 triângulos; o cilindro, 2 círculos e um retângulo cuja largura é a volta do círculo (π · d). Erros esperados: contar só o que está à vista (3 faces, 7 vértices, 9 arestas na caixa); contar as arestas face por face (6 · 4 = 24), quando cada aresta é de duas faces; achar que qualquer arrumação de 6 quadrados fecha um cubo; dar ao retângulo do cilindro a largura do diâmetro. Guie com "O que tem atrás, que você não vê?", "Esta borda e aquela viram a mesma aresta quando a caixa fecha?", "Dobre em pensamento: onde cai este quadrado?", "O rótulo dá a volta na lata ou só passa pela frente?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A caixa de sapato chega à loja desmontada, toda plana. Como um papelão plano vira uma caixa?',
      visual: caixa({ aberto: 0.5 }, 'A caixa de sapato de 30 cm por 20 cm por 12 cm, meio aberta: as faces de cima, de baixo e dos lados estão a meio caminho entre o plano e a caixa.'),
      esboco: 'A pergunta fica aberta. A caixa meio aberta já sugere a resposta: são partes planas dobradas.',
    },
    {
      tipo: 'mexa',
      texto: 'Uma caixa é feita de quê? Abra e veja.',
      visual: caixa({ abrir: true }, 'A caixa fechada, em perspectiva, com as medidas. Um toque e as faces giram nas dobras até o plano: a cruz de 6 retângulos.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na caixa para abri-la.',
        sucesso: { aberto: true },
        mostre: 'A caixa se abre na planificação: 6 retângulos.',
      },
      descoberta: 'A caixa aberta é uma cruz de 6 retângulos. A da frente fica parada; as outras giram nas dobras.',
      esboco: 'O momento-chave: abrir é dobrar ao contrário.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Cada parte plana é uma **face**. Quantas faces tem a caixa?',
      visual: caixa({ aberto: true, medidas: false }, 'A caixa aberta, sem as medidas.'),
      opcoes: [
        {
          texto: '6', certa: true,
          explica: 'Isso. E iguais duas a duas: frente e fundo, topo e base, os dois lados.',
          fala: 'Isso. E iguais duas a duas: frente e fundo, topo e base, os dois lados.',
          mostra: caixa({ aberto: true, medidas: false, destaque: PARES }, 'As faces de frente uma para a outra com a mesma cor: frente e fundo em âmbar, topo e base em azul, os lados em verde.'),
        },
        {
          texto: '3', erro: 'conta-so-o-que-ve',
          explica: 'Fechada, a caixa mostra 3. Aberta, aparecem as de trás: são 6, iguais duas a duas.',
          fala: 'Fechada, a caixa mostra três. Aberta, aparecem as de trás: são seis, iguais duas a duas.',
          mostra: caixa({ aberto: true, medidas: false, destaque: PARES }, 'As 6 faces em três cores, uma para cada par.'),
        },
      ],
      esboco: 'A contagem na planificação, com o par de cada face na mesma cor.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Feche a caixa. Cada canto é um **vértice**. Quantos vértices ela tem?',
      visual: caixa({ medidas: false, destaque: PARES }, 'A caixa se fecha de novo, com as cores dos pares.'),
      opcoes: [
        {
          texto: '8', certa: true,
          explica: 'Isso. 4 cantos em cima e 4 embaixo, um deles escondido atrás.',
          fala: 'Isso. Quatro cantos em cima e quatro embaixo, um deles escondido atrás.',
          mostra: caixa({ medidas: false, ocultas: true }, 'A caixa "de arame": as arestas de trás tracejadas mostram o canto escondido, embaixo, atrás.'),
        },
        {
          texto: '7', erro: 'conta-so-o-que-ve',
          explica: 'Você contou os que aparecem. O tracejado mostra o canto de trás, embaixo: 4 em cima e 4 embaixo, 8.',
          fala: 'Você contou os que aparecem. O tracejado mostra o canto de trás, embaixo: quatro em cima e quatro embaixo, oito.',
          mostra: caixa({ medidas: false, ocultas: true }, 'A caixa "de arame", com o canto escondido à vista.'),
        },
      ],
      esboco: 'O sólido "de arame" desmonta o erro de contar só o que se vê.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Cada dobra, onde duas faces se encontram, é uma **aresta**. Quantas arestas tem a caixa?',
      visual: caixa({ medidas: false, ocultas: true }, 'A caixa "de arame", com as arestas de trás tracejadas.'),
      opcoes: [
        {
          texto: '12', certa: true,
          explica: 'Isso. 4 em cima, 4 embaixo e 4 em pé.',
          fala: 'Isso. Quatro em cima, quatro embaixo e quatro em pé.',
          mostra: caixa({ medidas: false, ocultas: true }, 'A mesma caixa de arame.'),
        },
        {
          texto: '9', erro: 'conta-so-o-que-ve',
          explica: 'Essas são as que aparecem. As tracejadas também contam: 4 em cima, 4 embaixo e 4 em pé, 12.',
          fala: 'Essas são as que aparecem. As tracejadas também contam: quatro em cima, quatro embaixo e quatro em pé, doze.',
          mostra: caixa({ medidas: false, ocultas: true }, 'A caixa de arame, com as tracejadas.'),
        },
        {
          texto: '24', erro: 'conta-aresta-duas-vezes',
          explica: '$6 \\cdot 4 = 24$ conta cada borda das faces. Mas cada aresta junta duas faces: contou tudo duas vezes. São 12.',
          fala: 'Seis vezes quatro, vinte e quatro, conta cada borda das faces. Mas cada aresta junta duas faces: contou tudo duas vezes. São doze.',
          mostra: caixa({ medidas: false, ocultas: true }, 'A caixa de arame.'),
        },
      ],
      esboco: 'As duas formas de errar a contagem: esquecer as de trás e contar a mesma dobra duas vezes.',
    },
    {
      tipo: 'anote',
      titulo: 'Planificação',
      definicao: '**Face** é cada parte plana; **aresta**, a dobra entre duas faces; **vértice**, o canto. A **planificação** é o sólido aberto, plano.',
      exemplo: { tex: '\\text{caixa: } 6 \\text{ faces, } 12 \\text{ arestas, } 8 \\text{ vértices}', fala: 'a caixa tem seis faces, doze arestas e oito vértices' },
      alerta: 'Conte também o que está atrás e embaixo. Cada aresta é de duas faces: não conte duas vezes.',
      esboco: 'Na página: a caixa fechada e a cruz de 6 retângulos, com uma face, uma aresta e um vértice apontados.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O cubo aberto tem 6 quadrados iguais. Qual destas redes, dobrada, fecha um cubo?',
      visual: redes('Duas redes de 6 quadrados. Em cima, A, em âmbar: uma fila de 4 com um quadrado em cima e outro embaixo do segundo. Embaixo, B, em azul: uma fila de 5 com um quadrado em cima do segundo.'),
      opcoes: [
        {
          texto: 'A, a cruz', certa: true,
          explica: 'Isso. A fila de 4 dá a volta no cubo. Os dois de sobra viram a tampa e o fundo, um de cada lado.',
          fala: 'Isso. A fila de quatro dá a volta no cubo. Os dois de sobra viram a tampa e o fundo, um de cada lado.',
          mostra: sol({ ...CUBO, aberto: true }, 'A cruz âmbar vira o cubo aberto, com as faces nos mesmos lugares.'),
        },
        {
          texto: 'B, a fila de 5', erro: 'toda-cruz-fecha-cubo',
          explica: 'Dobre a fila: 4 quadrados dão a volta, e o quinto cai em cima do primeiro. Fica um buraco.',
          fala: 'Dobre a fila: quatro quadrados dão a volta, e o quinto cai em cima do primeiro. Fica um buraco.',
          mostra: redes('As duas redes de novo; na fila azul, o quinto quadrado repete o primeiro.'),
        },
        {
          texto: 'As duas', erro: 'toda-cruz-fecha-cubo',
          explica: 'Seis quadrados não bastam. Na fila de 5, o quinto cai em cima do primeiro e fica um buraco.',
          fala: 'Seis quadrados não bastam. Na fila de cinco, o quinto cai em cima do primeiro e fica um buraco.',
          mostra: redes('As duas redes de novo.'),
        },
      ],
      esboco: 'A dobra feita em pensamento. A rede A é a mesma cruz da caixa.',
    },
    {
      tipo: 'ideia',
      texto: 'Dobre a cruz: a fila de 4 vira as paredes, e os dois quadrados de sobra viram a tampa e o fundo.',
      visual: sol({ ...CUBO }, 'O cubo aberto se dobra e fecha, com 3 de aresta e sem medidas.'),
      esboco: 'O palco dobra a planificação: a volta inversa do Mexa.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Esta caixa é um **prisma** de base triangular: o topo e a base são triângulos. Aberta, ela vira o quê?',
      visual: sol({ ...PRISMA }, 'O prisma de pé, com um triângulo em cima e outro embaixo, e três faces retangulares em volta.'),
      opcoes: [
        {
          texto: '3 retângulos e 2 triângulos', certa: true,
          explica: 'Isso. Um retângulo para cada lado do triângulo, e os dois triângulos, em cima e embaixo.',
          fala: 'Isso. Um retângulo para cada lado do triângulo, e os dois triângulos, em cima e embaixo.',
          mostra: sol({ ...PRISMA, aberto: true }, 'O prisma se abre: 3 retângulos lado a lado, um triângulo em cima e outro embaixo.'),
        },
        {
          texto: '2 retângulos e 1 triângulo', erro: 'conta-so-o-que-ve',
          explica: 'Essas são as faces à vista. Aberto, aparecem a de trás e a base: 3 retângulos e 2 triângulos.',
          fala: 'Essas são as faces à vista. Aberto, aparecem a de trás e a base: três retângulos e dois triângulos.',
          mostra: sol({ ...PRISMA, aberto: true }, 'O prisma aberto.'),
        },
      ],
      esboco: 'O mesmo raciocínio em outro sólido. O prisma abre na frente do aluno.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora uma lata, um **cilindro**. Abra e veja em que ela se desmonta.',
      visual: lata({ medidas: { volta: '?' }, abrir: true }, 'A lata de pé, com 4 cm de raio na tampa e 12 cm de altura. Um toque e a parede se desenrola num retângulo, com as tampas presas em cima e embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na lata para abri-la.',
        sucesso: { aberto: true },
        mostre: 'A lata se abre: 2 círculos e um retângulo.',
      },
      descoberta: 'O cilindro aberto são 2 círculos (as tampas) e um retângulo (a parede, o rótulo).',
      esboco: 'A parede curva vira plana: um retângulo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O retângulo tem a altura da lata, 12 cm. E a largura dele, quanto é?',
      fala: 'O retângulo tem a altura da lata, doze centímetros. E a largura dele, quanto é?',
      visual: lata({ aberto: true, medidas: { volta: '?' } }, 'A lata aberta, com um ponto de interrogação na largura do retângulo.'),
      opcoes: [
        {
          texto: 'A volta da tampa: $\\pi \\cdot 8 \\approx 25{,}12$ cm', certa: true,
          explica: 'Isso. A parede dá a volta na tampa, e a volta tem π diâmetros. O diâmetro é 8 cm.',
          fala: 'Isso. A parede dá a volta na tampa, e a volta tem pi diâmetros. O diâmetro é oito centímetros.',
          mostra: lata({ aberto: true }, 'A largura do retângulo ganha a cota azul: 25,12 cm.'),
        },
        {
          texto: 'O diâmetro: 8 cm', erro: 'lateral-com-o-diametro',
          explica: 'De frente, a lata mostra 8 cm. Mas o rótulo dá a volta inteira: π diâmetros, uns 25 cm.',
          fala: 'De frente, a lata mostra oito centímetros. Mas o rótulo dá a volta inteira: pi diâmetros, uns vinte e cinco centímetros.',
          mostra: lata({ aberto: true }, 'A largura do retângulo com 25,12 cm, três vezes o diâmetro e um pouco.'),
        },
      ],
      esboco: 'A ponte com a unidade 16: a volta do círculo, π · d.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Esta é uma **pirâmide**: a base é um quadrado, e as faces sobem até uma ponta. Quantas faces ela tem?',
      visual: sol({ solido: 'piramide', comprimento: 4, largura: 4, altura: 4, medidas: false }, 'Uma pirâmide de base quadrada, em perspectiva.'),
      opcoes: [
        {
          texto: '5', certa: true,
          explica: 'Isso. 4 triângulos que sobem até a ponta e o quadrado da base.',
          fala: 'Isso. Quatro triângulos que sobem até a ponta e o quadrado da base.',
          mostra: sol({ solido: 'piramide', comprimento: 4, largura: 4, altura: 4, medidas: false, ocultas: true }, 'A pirâmide com as arestas de trás tracejadas.'),
        },
        {
          texto: '4', erro: 'conta-so-o-que-ve',
          explica: 'Faltou a base, embaixo. São 4 triângulos e 1 quadrado: 5 faces.',
          fala: 'Faltou a base, embaixo. São quatro triângulos e um quadrado: cinco faces.',
          mostra: sol({ solido: 'piramide', comprimento: 4, largura: 4, altura: 4, medidas: false, ocultas: true }, 'A pirâmide com as arestas de trás tracejadas.'),
        },
      ],
      esboco: 'A pirâmide só para nomear (ela não abre no palco). O erro é o mesmo: esquecer a face de baixo.',
    },
    {
      tipo: 'ideia',
      texto: 'O **cone** também termina numa ponta, mas a base é um círculo, como a casquinha de sorvete.',
      visual: sol({ solido: 'cone', raio: 2, altura: 4, medidas: false }, 'Um cone de pé, com a base redonda embaixo e a ponta em cima.'),
      esboco: 'Só o nome. A pirâmide e o cone voltam mais tarde na formação.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: quantas **arestas** tem o prisma de base triangular? Conte as de cima, as de baixo e as em pé.',
      resposta: 9,
      resolucao: [
        { tex: '3 \\text{ em cima} + 3 \\text{ embaixo} + 3 \\text{ em pé}', fala: 'três em cima, três embaixo e três em pé' },
        { tex: '3 + 3 + 3 = 9 \\text{ arestas}', fala: 'três mais três mais três, nove arestas' },
      ],
      esboco: 'A contagem do prisma, sem o desenho. Quem conta face por face acha 18.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['planificacao-n1', 'planificacao-n2', 'planificacao-n3'],
      esboco: 'Nível 1: faces, arestas ou vértices da caixa, do cubo ou do prisma, com o desenho. Nível 2: em que o sólido se abre, se uma rede fecha um cubo, a largura do rótulo da lata. Nível 3: prismas e pirâmides de outras bases.',
    },
    {
      tipo: 'fecho',
      texto: 'O papelão plano é a caixa aberta: 6 retângulos que dobram em 12 arestas. Na próxima aula: quanto cabe dentro dela.',
      fala: 'O papelão plano é a caixa aberta: seis retângulos que dobram em doze arestas. Na próxima aula: quanto cabe dentro dela.',
      visual: caixa({}, 'A caixa de sapato fechada, com as medidas.'),
      esboco: 'Responde ao gancho e anuncia o volume.',
    },
  ],
}
