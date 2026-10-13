import type { Aula, Visual } from '@/lib/formation/schema'

// Ponto, reta, ângulo. Abre com uma tesoura que se abre: o que cresce, as
// lâminas ou a abertura? Depois as peças da geometria, uma de cada vez, no
// mesmo palco: o ponto, o segmento AB, a reta que passa de A e de B sem
// fim, a semirreta que começa em A. Duas semirretas que saem do mesmo ponto
// fazem um ângulo. Momento-chave: dois ângulos lado a lado, o de lados
// compridos abre menos; o aluno aposta, e os lados compridos encolhem sem
// que a abertura mude. O ângulo é a abertura, não o tamanho dos lados. Por
// fim, os nomes pela comparação com o canto da folha: reto, agudo, obtuso
// e raso. Os graus ficam para a próxima aula.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** Os pontos A e B, deitados. */
const AB = { A: [0, 0], B: [4, 0] }
/** O ângulo de vértice V, entre as semirretas VA e VB. */
const VAB = { V: [0, 0], A: [4, 0], B: [3, 2.2] }
/** Os dois ângulos da aposta: o 1 de lados compridos e abertura pequena; o 2 de lados curtos e abertura grande. */
const DOIS = (comp1: number) => [
  { graus: 25, em: [0, 0], comprimento: comp1, nome: 'ângulo 1' },
  { graus: 70, em: [4.9, 0], comprimento: 2.2, nome: 'ângulo 2' },
]
/** Três ângulos, dois em cima e um embaixo, com o nome de cada um. */
const TRES = [
  { graus: 45, em: [0, 3.4], comprimento: 2.4, nome: 'agudo' },
  { graus: 90, em: [3.6, 3.4], comprimento: 2.4, nome: 'reto' },
  { graus: 135, em: [2.6, 0], comprimento: 2.4, nome: 'obtuso' },
]

export const aula: Aula = {
  id: 'B.U16.A1',
  titulo: 'Ponto, reta, ângulo',
  objetivo: 'Reconhecer ponto, segmento, reta e semirreta; entender o ângulo como a abertura entre duas semirretas que saem do mesmo ponto, que não depende do tamanho dos lados; e classificar ângulos em agudo, reto, obtuso e raso.',
  modelo: 'figura',
  esboco: 'O palco é a figura o tempo todo. A tesoura do gancho; depois os pontos A e B, o segmento entre eles, a reta (que ganha setas e passa dos pontos) e a semirreta (que começa em A). As duas semirretas de V viram um ângulo. Momento-chave: dois ângulos, o 1 de lados compridos e pouca abertura, o 2 de lados curtos e muita abertura. O aluno aposta qual abre mais; os lados do 1 encolhem até ficarem do tamanho dos do 2, e a abertura continua a mesma. Depois os nomes: o canto da folha é o reto; menor, agudo; maior, obtuso; em linha, raso.',
  vega: 'Ideia central: o ângulo é a abertura entre duas semirretas que saem do mesmo ponto (o vértice). O tamanho dos lados não muda o ângulo: lados desenhados mais compridos não fazem um ângulo maior. Segmento tem duas pontas; reta não tem pontas, segue sem fim para os dois lados; semirreta tem começo e não tem fim. O reto é o canto da folha, um quarto de volta; agudo é menor que o reto; obtuso é maior que o reto e menor que o raso; o raso tem as duas semirretas em linha, meia volta. Erros esperados: achar maior o ângulo de lados mais compridos; confundir reta e segmento; trocar agudo e obtuso. Guie com "Qual abre mais?", "Ponha o canto de uma folha sobre ele: cabe dentro ou passa?". Os graus e o transferidor são da próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Abra uma tesoura devagar. O que cresce: as lâminas ou a abertura entre elas?',
      visual: fig({ angulo: { graus: 25, inicio: -12.5, comprimento: 4 } }, 'Duas linhas que saem do mesmo ponto, como as lâminas de uma tesoura meio aberta, com o arco âmbar da abertura.'),
      esboco: 'Uma pergunta que parece boba e é o centro da aula: o que importa é a abertura.',
    },
    {
      tipo: 'ideia',
      texto: 'Um **ponto** marca um lugar: A, B. O caminho reto de A até B é o **segmento** AB. Ele tem duas pontas.',
      fala: 'Um ponto marca um lugar: A, B. O caminho reto de A até B é o segmento A B. Ele tem duas pontas.',
      visual: fig({ pontos: AB, segmentos: [['A', 'B']] }, 'Os pontos A e B, brancos, com o segmento entre eles.'),
      esboco: 'A tesoura some; ficam dois pontos e o traço entre eles.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora a linha passa de A e de B, com uma seta em cada ponta. Onde ela termina?',
      visual: fig({ pontos: AB, retas: [['A', 'B']] }, 'O segmento cresce para os dois lados e ganha uma seta em cada ponta.'),
      opcoes: [
        {
          texto: 'Não termina: segue sem fim', certa: true,
          explica: 'Isso. As setas dizem que ela continua para os dois lados. Essa linha sem fim é a **reta** AB.',
          fala: 'Isso. As setas dizem que ela continua para os dois lados. Essa linha sem fim é a reta A B.',
        },
        {
          texto: 'Em A e em B', erro: 'confunde-reta-e-segmento',
          explica: 'O que termina em A e em B é o segmento. As setas dizem que a **reta** continua sem fim.',
          fala: 'O que termina em A e em B é o segmento. As setas dizem que a reta continua sem fim.',
          mostra: fig({ pontos: AB, retas: [['A', 'B']], segmentos: [{ de: 'A', ate: 'B', destaque: true }] }, 'O pedaço de A até B acende em âmbar, por cima da reta que continua.'),
        },
      ],
      esboco: 'A reta como o segmento que não para. A errada acende só o pedaço entre os pontos.',
    },
    {
      tipo: 'ideia',
      texto: 'Comece em A e siga por B, sem parar: é uma **semirreta**. Ela tem começo e não tem fim.',
      fala: 'Comece em A e siga por B, sem parar: é uma semirreta. Ela tem começo e não tem fim.',
      visual: fig({ pontos: AB, semirretas: [['A', 'B']] }, 'A seta da esquerda some: a linha começa em A e segue com uma seta depois de B.'),
      esboco: 'A mesma linha perde a ponta da esquerda.',
    },
    {
      tipo: 'ideia',
      texto: 'Duas semirretas que saem do mesmo ponto formam um **ângulo**. O ponto V é o **vértice**.',
      fala: 'Duas semirretas que saem do mesmo ponto formam um ângulo. O ponto V é o vértice.',
      visual: fig({ pontos: VAB, semirretas: [['V', 'A'], ['V', 'B']], angulo: { vertice: 'V', de: 'A', ate: 'B', lados: false } }, 'Do ponto V saem duas semirretas, por A e por B. O arco âmbar marca a abertura entre elas.'),
      esboco: 'A semirreta ganha uma irmã que sai do mesmo ponto. O arco acende: isso é o ângulo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual dos dois ângulos abre mais?',
      visual: fig({ angulo: DOIS(4.6) }, 'Lado a lado: o ângulo 1, de lados compridos e pouca abertura; o ângulo 2, de lados curtos e bem aberto.'),
      opcoes: [
        {
          texto: 'O 2, de lados curtos', certa: true,
          explica: 'Isso. Encolha os lados do 1: a abertura não muda. O ângulo é a abertura, não o tamanho dos lados.',
          fala: 'Isso. Encolha os lados do um: a abertura não muda. O ângulo é a abertura, não o tamanho dos lados.',
          mostra: fig({ angulo: DOIS(2.2) }, 'Os lados do ângulo 1 encolhem até ficarem do tamanho dos do 2. O arco continua igual, bem mais fechado que o do 2.'),
        },
        {
          texto: 'O 1, de lados compridos', erro: 'angulo-pelo-tamanho-dos-lados',
          explica: 'Encolha os lados do 1: ele fica pequeno e continua fechado. Lado comprido não faz o ângulo maior.',
          fala: 'Encolha os lados do um: ele fica pequeno e continua fechado. Lado comprido não faz o ângulo maior.',
          mostra: fig({ angulo: DOIS(2.2) }, 'Os lados do ângulo 1 encolhem até ficarem do tamanho dos do 2. O arco continua igual, bem mais fechado que o do 2.'),
        },
      ],
      esboco: 'O momento-chave. O desmonte é o mesmo para as duas opções: os lados do 1 encolhem e a abertura não muda, e o 2 continua abrindo mais.',
    },
    {
      tipo: 'ideia',
      texto: 'O canto de uma folha é um **ângulo reto**. Menor que ele, o ângulo é **agudo**; maior, é **obtuso**.',
      fala: 'O canto de uma folha é um ângulo reto. Menor que ele, o ângulo é agudo; maior, é obtuso.',
      visual: fig({ angulo: TRES }, 'Três ângulos de lados iguais, com o nome embaixo: agudo e reto (com o quadradinho no canto) em cima, obtuso embaixo.'),
      esboco: 'O reto é a régua: o canto da folha. Os outros dois se comparam com ele.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A linha tracejada faz um canto reto com o chão. Este ângulo é agudo ou obtuso?',
      visual: fig({ angulo: { graus: 125, comprimento: 2.2 }, segmentos: [{ de: [0, 0], ate: [0, 2.2], tracejado: true }] }, 'Um ângulo bem aberto, com um lado deitado para a direita. Do vértice sobe uma linha tracejada, em pé: o canto reto.'),
      opcoes: [
        {
          texto: 'Obtuso', certa: true,
          explica: 'Isso. O lado passa da linha tracejada: ele abre mais que o reto.',
          fala: 'Isso. O lado passa da linha tracejada: ele abre mais que o reto.',
        },
        {
          texto: 'Agudo', erro: 'troca-tipo-de-angulo',
          explica: 'O agudo fica dentro do canto reto. Este passa da linha tracejada: abre mais que o reto, é obtuso.',
          fala: 'O agudo fica dentro do canto reto. Este passa da linha tracejada: abre mais que o reto, é obtuso.',
        },
      ],
      esboco: 'A linha tracejada é o canto da folha posto sobre o ângulo. Quem passa dela é obtuso.',
    },
    {
      tipo: 'ideia',
      texto: 'Abra até as duas semirretas ficarem em linha: meia volta, dois retos. É o ângulo **raso**.',
      visual: fig({ angulo: { graus: 180, comprimento: 2.2 }, segmentos: [{ de: [0, 0], ate: [0, 2.2], tracejado: true }] }, 'O lado do ângulo continua girando até deitar do outro lado. O arco vira meia volta, e a linha tracejada o divide em dois retos.'),
      esboco: 'O mesmo ângulo continua abrindo. A linha tracejada mostra os dois retos dentro do raso.',
    },
    {
      tipo: 'anote',
      titulo: 'Ângulo',
      definicao: 'Um **ângulo** é a abertura entre duas semirretas que saem do mesmo ponto, o vértice. O tamanho dos lados não muda o ângulo.',
      exemplo: { tex: '\\text{agudo} < \\text{reto} < \\text{obtuso} < \\text{raso}', fala: 'agudo é menor que o reto, que é menor que o obtuso, que é menor que o raso' },
      alerta: 'Lados mais compridos não fazem o ângulo maior. Compare a abertura com o canto de uma folha.',
      esboco: 'Na página, os quatro ângulos desenhados lado a lado, com o canto da folha marcado no reto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Às 4 horas, os ponteiros do relógio formam um ângulo. Ele é agudo, reto ou obtuso?',
      fala: 'Às quatro horas, os ponteiros do relógio formam um ângulo. Ele é agudo, reto ou obtuso?',
      visual: fig({ angulo: { graus: 120, inicio: -30, comprimento: 2 }, segmentos: [{ de: [0, 0], ate: [2, 0], tracejado: true }] }, 'Os ponteiros de um relógio às 4 horas: um aponta para cima, para o 12; o outro desce para a direita, para o 4. A linha tracejada aponta para o 3.'),
      opcoes: [
        {
          texto: 'Obtuso', certa: true,
          explica: 'Isso. Do 12 ao 3 já é um canto reto, e o ponteiro passa do 3: abre mais que o reto.',
          fala: 'Isso. Do doze ao três já é um canto reto, e o ponteiro passa do três: abre mais que o reto.',
        },
        {
          texto: 'Reto', erro: 'troca-tipo-de-angulo',
          explica: 'Reto seria às 3 horas, do 12 ao 3. Às 4, o ponteiro passa do 3: o ângulo é obtuso.',
          fala: 'Reto seria às três horas, do doze ao três. Às quatro, o ponteiro passa do três: o ângulo é obtuso.',
        },
        {
          texto: 'Agudo', erro: 'troca-tipo-de-angulo',
          explica: 'O agudo cabe dentro do canto reto, do 12 ao 3. Às 4, o ponteiro passa do 3: é obtuso.',
          fala: 'O agudo cabe dentro do canto reto, do doze ao três. Às quatro, o ponteiro passa do três: é obtuso.',
        },
      ],
      esboco: 'Um ângulo do dia a dia. A linha tracejada vai para o 3: do 12 até ela, o canto reto.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No caderno, desenhe um ângulo agudo, um reto e um obtuso. Qual dos três passa do canto da folha?',
      resposta: 'obtuso',
      resolucao: [
        { tex: '\\text{agudo: cabe dentro do canto}', fala: 'o agudo cabe dentro do canto da folha' },
        { tex: '\\text{reto: igual ao canto}', fala: 'o reto é igual ao canto' },
        { tex: '\\text{obtuso: passa do canto}', fala: 'o obtuso passa do canto' },
      ],
      esboco: 'Papel na mão: o aluno desenha e confere com o canto de uma folha de verdade. A resposta em texto é "obtuso".',
    },
    {
      tipo: 'sua-vez',
      geradores: ['tipo-de-angulo-n1', 'tipo-de-angulo-n2', 'tipo-de-angulo-n3'],
      esboco: 'Nível 1: classificar um ângulo desenhado e dizer qual de dois abre mais (os lados compridos no menor). Nível 2: os ponteiros do relógio nas horas cheias e ângulos descritos pela comparação com o reto. Nível 3: segmento, reta ou semirreta pela descrição, e lados medidos em centímetros que não decidem o ângulo.',
    },
    {
      tipo: 'fecho',
      texto: 'Na tesoura, o que cresce é a abertura: esse é o ângulo. Na próxima aula: medir a abertura, em graus.',
      visual: fig({ angulo: { graus: 60, inicio: -30, comprimento: 4 } }, 'A tesoura do gancho, mais aberta, com o arco âmbar.'),
      esboco: 'Responde ao gancho e anuncia o transferidor.',
    },
  ],
}
