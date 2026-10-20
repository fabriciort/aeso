import type { Aula, Visual } from '@/lib/formation/schema'

// Duas incógnitas. Você comprou 10 frutas, entre maçãs e peras: quantas de
// cada? Não há uma resposta só: 5 e 5, 3 e 7, 8 e 2… A tabela de pares de
// x + y = 10 e, no plano, o momento-chave: o Mexa "pares", em que o aluno
// marca pares que somam 10 e eles se alinham numa reta. A reta é a
// equação: cada ponto dela é um par que serve. Fora das frutas, a reta
// continua, com decimais e negativos ((12, −2), (4,5; 5,5)). Depois, os
// pares de 2x + y = 8, com o 2x que pede vezes e um y negativo.

const tabela = (linhas: { rotulo: string; valores: (number | string)[] }[], esboco: string, destaque?: number[]): Visual => ({
  modelo: 'livre',
  estado: { tabela: { linhas, ...(destaque ? { destaque } : {}) } },
  esboco,
})
const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })

const DEZ = { equacao: 'x + y = 10' }
const EIXOS = { x: [0, 10], y: [0, 10] }
const FRUTAS = (maças: (number | string)[], peras: (number | string)[], esboco: string, destaque?: number[]) =>
  tabela(
    [
      { rotulo: 'maçãs', valores: maças },
      { rotulo: 'peras', valores: peras },
      { rotulo: 'total', valores: maças.map(() => 10) },
    ],
    esboco,
    destaque,
  )
const XY = (xs: (number | string)[], ys: (number | string)[], esboco: string, destaque?: number[]) =>
  tabela(
    [
      { rotulo: 'x', valores: xs },
      { rotulo: 'y', valores: ys },
      { rotulo: 'x + y', valores: xs.map(() => 10) },
    ],
    esboco,
    destaque,
  )

const RETA_PARES = plano(
  { ...EIXOS, retas: [DEZ], pontos: { A: [0, 10], B: [2, 8], C: [5, 5], D: [10, 0] }, nomes: false, coordenadas: true },
  'A reta de x + y = 10, âmbar, com quatro pares marcados e as coordenadas: (0, 10), (2, 8), (5, 5), (10, 0).',
)
const LONGE = plano(
  { x: [-2, 13], y: [-3, 12], retas: [DEZ], pontos: { A: [3, 7], B: [4.5, 5.5], C: [12, -2] }, nomes: false, coordenadas: true },
  'A mesma reta, com os eixos maiores: ela passa pelo (4,5; 5,5), entre dois pontos inteiros, e desce até o (12, −2), abaixo do eixo x.',
)

const OITO = { equacao: '2x + y = 8' }
const EIXOS_OITO = { x: [-1, 6], y: [-3, 9] }
const pontosOito = (pontos: Record<string, number[]>, esboco: string) =>
  plano({ ...EIXOS_OITO, retas: [OITO], pontos, nomes: false, coordenadas: true }, esboco)

export const aula: Aula = {
  id: 'AF.U4.A1',
  titulo: 'Duas incógnitas',
  objetivo: 'Saber que uma equação com x e y tem muitas soluções, cada uma um par (x, y); achar o y de um par dado o x; e ver que, no plano, os pares formam uma reta, inclusive com decimais e negativos.',
  modelo: 'plano',
  esboco: 'Abre nas 10 frutas: maçãs e peras. A primeira aposta mostra que há muitas respostas (5 e 5, 3 e 7…). A tabela de x + y = 10 dá nome às letras e pede o y do 3. Momento-chave: o Mexa "pares", em que o aluno marca pares no plano e a reta aparece passando por todos. Depois, fora das frutas, a reta continua com (4,5; 5,5) e (12, −2). O anote dá o nome. O passo a passo acha três pares de 2x + y = 8, um deles com y negativo.',
  vega: 'Ideia central: uma equação com duas letras não tem uma solução só. Cada solução é um par (x, y) que deixa os dois lados iguais, e esses pares, no plano, ficam todos numa reta: a reta é o desenho da equação. Para achar um par, escolha um x e faça a conta do y. No problema das frutas, só servem números inteiros de 0 a 10 (11 pares); na equação sozinha, qualquer número serve, decimal ou negativo, e a reta continua. Erros esperados: achar que há uma resposta só (5 e 5); desfazer o + 3 somando 3 (y = 13); ler 2x como 2 + x; esquecer o menos em 8 − 10 = −2; achar que só servem números inteiros e positivos; trocar x e y no par. Guie com "Escolha um x. Quanto falta para dar 10?", "Esse par dá 10? Faça a conta", "Onde esse ponto ficaria no plano?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você comprou **10 frutas** na feira, entre maçãs e peras. Quantas são de cada?',
      fala: 'Você comprou dez frutas na feira, entre maçãs e peras. Quantas são de cada?',
      visual: FRUTAS(['?'], ['?'], 'A tabela com uma coluna só: maçãs ?, peras ?, total 10. As duas casas vazias em âmbar.'),
      esboco: 'Uma pergunta que parece ter uma resposta e não tem. O total está dado; as duas quantidades, não.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Só com isso, dá para saber quantas maçãs e quantas peras?',
      visual: FRUTAS(['?'], ['?'], 'A mesma tabela, com as casas vazias.'),
      opcoes: [
        {
          texto: 'Dá: 5 maçãs e 5 peras',
          erro: 'equacao-de-duas-letras-com-um-par-so',
          explica: '5 e 5 serve. Mas 3 e 7 também: ${3 + 7 = 10}$. E 8 e 2, e 0 e 10…',
          fala: 'Cinco e cinco serve. Mas três e sete também: três mais sete é dez. E oito e dois, e zero e dez…',
          mostra: FRUTAS([5, 3, 8, 0], [5, 7, 2, 10], 'A tabela ganha colunas: 5 e 5, 3 e 7, 8 e 2, 0 e 10. Todas com total 10.', [0]),
        },
        {
          texto: 'Não dá: há vários jeitos',
          certa: true,
          explica: 'Isso. 3 e 7, 4 e 6, 8 e 2: todos dão 10 frutas. Falta uma informação.',
          fala: 'Isso. Três e sete, quatro e seis, oito e dois: todos dão dez frutas. Falta uma informação.',
          mostra: FRUTAS([3, 4, 5, 8, 0], [7, 6, 5, 2, 10], 'A tabela com cinco colunas, todas com total 10.'),
        },
      ],
      esboco: 'A ideia da aula numa aposta: uma condição só deixa muitos pares. Quem diz 5 e 5 vê os outros pares na tabela.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Chame as maçãs de **x** e as peras de **y**: ${x + y = 10}$. Com x = 3, quanto vale y?',
      fala: 'Chame as maçãs de x e as peras de y: x mais y igual a dez. Com x igual a três, quanto vale y?',
      visual: XY([0, 1, 2, 3], [10, 9, 8, '?'], 'A tabela com as letras: x 0, 1, 2, 3; y 10, 9, 8, ?; x + y 10 em todas. A coluna do 3 com moldura âmbar.', [3]),
      opcoes: [
        {
          texto: '13',
          erro: 'desfaz-com-a-mesma-operacao',
          explica: 'Com 13, ${3 + 13 = 16}$ frutas. Para dar 10, falta ${10 - 3 = 7}$.',
          fala: 'Com treze, três mais treze dá dezesseis frutas. Para dar dez, falta dez menos três, sete.',
          mostra: XY([0, 1, 2, 3], [10, 9, 8, 13], 'O 13 na casa do y, e o total da coluna não confere: 3 + 13 = 16.', [3]),
        },
        {
          texto: '7',
          certa: true,
          explica: 'Isso. ${3 + 7 = 10}$. O par é ${(3, 7)}$: primeiro o x, depois o y.',
          fala: 'Isso. Três mais sete é dez. O par é três, sete: primeiro o x, depois o y.',
          mostra: XY([0, 1, 2, 3], [10, 9, 8, 7], 'O 7 entra na casa do y. A tabela de pares: (0, 10), (1, 9), (2, 8), (3, 7).', [3]),
        },
      ],
      esboco: 'Cada coluna é um par (x, y). Achar o y é ver quanto falta para 10. O 13 vem de quem soma em vez de tirar.',
    },
    {
      tipo: 'mexa',
      texto: 'No plano, cada par vira um ponto: o x anda para o lado e o y, para cima.',
      fala: 'No plano, cada par vira um ponto: o x anda para o lado e o y, para cima.',
      visual: plano({ ...EIXOS, retas: [DEZ] }, 'O plano de 0 a 10 nos dois eixos, vazio. A reta de x + y = 10 está escondida; embaixo, "0 de 4 pares".'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em 4 pontos da grade em que x + y dá 10.',
        sucesso: { pontos: 4 },
        mostre: 'Quatro pares de x + y = 10, e a reta passa por todos.',
      },
      descoberta: 'Os pares de x + y = 10 ficam todos alinhados: a reta aparece passando por eles.',
      esboco: 'O momento-chave: o aluno marca (3, 7), (5, 5)… e cada ponto fica âmbar com o par. Um par que não dá 10 pisca em rosa com a conta. No quarto, a reta cresce e passa por todos.',
    },
    {
      tipo: 'ideia',
      texto: 'Os pares ficam numa **reta**. A reta **é** a equação: cada ponto dela é um par que dá 10.',
      fala: 'Os pares ficam numa reta. A reta é a equação: cada ponto dela é um par que dá dez.',
      visual: RETA_PARES,
      esboco: 'Dá nome ao que o aluno acabou de ver. A reta âmbar com quatro pares e as coordenadas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Fora das frutas, x e y podem ser qualquer número. O par ${(12, -2)}$ está na reta?',
      fala: 'Fora das frutas, x e y podem ser qualquer número. O par doze, menos dois, está na reta?',
      visual: plano({ x: [-2, 13], y: [-3, 12], retas: [{ ...DEZ, rotulo: false }], pontos: { A: [3, 7] }, nomes: false, coordenadas: true, rotulo: 'x + y = 10' }, 'A reta de x + y = 10 com os eixos maiores, que passam do zero, e só o (3, 7) marcado. A equação embaixo do plano.'),
      opcoes: [
        {
          texto: 'Não: −2 não é uma quantidade',
          erro: 'reta-so-com-inteiros-positivos',
          explica: 'Nas frutas, não. Mas a equação aceita: ${12 + (-2) = 10}$. A reta continua abaixo do eixo.',
          fala: 'Nas frutas, não. Mas a equação aceita: doze mais menos dois é dez. A reta continua abaixo do eixo.',
          mostra: LONGE,
        },
        {
          texto: 'Está: 12 + (−2) = 10',
          certa: true,
          explica: 'Isso. E ${4{,}5 + 5{,}5 = 10}$ também: entre dois pontos da reta, sempre cabe mais um.',
          fala: 'Isso. E quatro e meio mais cinco e meio também dá dez: entre dois pontos da reta, sempre cabe mais um.',
          mostra: LONGE,
        },
      ],
      esboco: 'A reta inteira: decimais entre os pontos e negativos depois dos eixos. As duas opções mostram o (12, −2) e o (4,5; 5,5) na reta.',
    },
    {
      tipo: 'anote',
      titulo: 'Equação com duas incógnitas',
      definicao: 'Uma equação com **x** e **y** tem muitas soluções. Cada uma é um **par** (x, y). No plano, os pares formam uma **reta**.',
      exemplo: { tex: 'x + y = 10: \\; (0, 10),\\; (3, 7),\\; (4{,}5;\\ 5{,}5),\\; (12, -2)', fala: 'x mais y igual a dez: zero e dez; três e sete; quatro e meio e cinco e meio; doze e menos dois' },
      alerta: 'O par tem ordem: (3, 7) é x = 3 e y = 7. O (7, 3) é outro par.',
      esboco: 'Na página: a reta de x + y = 10 com os quatro pares, e a tabela de pares embaixo.',
    },
    {
      tipo: 'passo',
      problema: 'Outra equação: ache três pares de ${2x + y = 8}$.',
      fala: 'Outra equação: ache três pares de dois x mais y igual a oito.',
      visual: pontosOito({}, 'A reta de 2x + y = 8, âmbar, descendo do (0, 8) até abaixo do eixo x. Nenhum ponto marcado ainda.'),
      passos: [
        {
          pergunta: 'Com x = 0, quanto vale y?',
          fala: 'Com x igual a zero, quanto vale y?',
          opcoes: [
            {
              texto: '6',
              erro: 'vezes-como-mais',
              explica: 'O 2x é 2 vezes x: ${2 \\cdot 0 = 0}$, não 2. Sobra ${y = 8}$.',
              fala: 'O dois x é dois vezes x: dois vezes zero é zero, não dois. Sobra y igual a oito.',
              mostra: pontosOito({}, 'A reta sem pontos: o (0, 6) não está nela.'),
            },
            {
              texto: '8',
              certa: true,
              explica: 'Isso. ${2 \\cdot 0 + 8 = 8}$. O par é ${(0, 8)}$.',
              fala: 'Isso. Dois vezes zero mais oito é oito. O par é zero, oito.',
              mostra: pontosOito({ A: [0, 8] }, 'O (0, 8) aparece na reta, no eixo y.'),
            },
          ],
          linha: { tex: 'x = 0: \\; 2 \\cdot 0 + y = 8, \\; y = 8', fala: 'x igual a zero: dois vezes zero mais y igual a oito, y igual a oito' },
        },
        {
          pergunta: 'Com x = 3, quanto vale y?',
          fala: 'Com x igual a três, quanto vale y?',
          opcoes: [
            {
              texto: '3',
              erro: 'vezes-como-mais',
              explica: 'O 2x virou ${2 + 3}$. É ${2 \\cdot 3 = 6}$, e ${6 + y = 8}$.',
              fala: 'O dois x virou dois mais três. É dois vezes três, seis, e seis mais y igual a oito.',
              mostra: pontosOito({ A: [0, 8] }, 'Só o (0, 8) na reta; o (3, 3) não está nela.'),
            },
            {
              texto: '14',
              erro: 'desfaz-com-a-mesma-operacao',
              explica: '${6 + 14 = 20}$, não 8. Para desfazer o + 6, tire 6: ${8 - 6 = 2}$.',
              fala: 'Seis mais catorze dá vinte, não oito. Para desfazer o mais seis, tire seis: oito menos seis, dois.',
              mostra: pontosOito({ A: [0, 8] }, 'Só o (0, 8) na reta.'),
            },
            {
              texto: '2',
              certa: true,
              explica: 'Isso. ${2 \\cdot 3 + 2 = 8}$. O par é ${(3, 2)}$.',
              fala: 'Isso. Dois vezes três mais dois é oito. O par é três, dois.',
              mostra: pontosOito({ A: [0, 8], B: [3, 2] }, 'O (3, 2) aparece na reta, ao lado do (0, 8).'),
            },
          ],
          linha: { tex: 'x = 3: \\; 6 + y = 8, \\; y = 2', fala: 'x igual a três: seis mais y igual a oito, y igual a dois' },
        },
        {
          pergunta: 'Com x = 5, quanto vale y?',
          fala: 'Com x igual a cinco, quanto vale y?',
          opcoes: [
            {
              texto: '2',
              erro: 'esquece-sinal-do-resultado',
              explica: '${10 + 2 = 12}$, não 8. De 10 para 8, o y desce: ${8 - 10 = -2}$.',
              fala: 'Dez mais dois dá doze, não oito. De dez para oito, o y desce: oito menos dez, menos dois.',
              mostra: pontosOito({ A: [0, 8], B: [3, 2] }, 'Os dois pontos de antes; o (5, 2) não está na reta.'),
            },
            {
              texto: '−2',
              certa: true,
              explica: 'Isso. ${10 + (-2) = 8}$. O ponto ${(5, -2)}$ fica abaixo do eixo x.',
              fala: 'Isso. Dez mais menos dois é oito. O ponto cinco, menos dois, fica abaixo do eixo x.',
              mostra: pontosOito({ A: [0, 8], B: [3, 2], C: [5, -2] }, 'Os três pares na reta: (0, 8), (3, 2) e (5, −2), este abaixo do eixo x.'),
            },
          ],
          linha: { tex: 'x = 5: \\; 10 + y = 8, \\; y = -2', fala: 'x igual a cinco: dez mais y igual a oito, y igual a menos dois' },
        },
      ],
      esboco: 'Escolher o x e fazer a conta do y. O 2x pede vezes; o último par tem y negativo e mostra a reta passando do eixo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: em ${x + 2y = 12}$, com x = 6, quanto vale y? Confira o par na equação.',
      fala: 'No papel: em x mais dois y igual a doze, com x igual a seis, quanto vale y? Confira o par na equação.',
      resposta: 3,
      sinal: true,
      resolucao: [
        { tex: '6 + 2y = 12', fala: 'seis mais dois y igual a doze' },
        { tex: '2y = 6, \\quad y = 3', fala: 'dois y igual a seis, y igual a três' },
        { tex: '\\text{confere: } 6 + 2 \\cdot 3 = 12', fala: 'confere: seis mais dois vezes três é doze' },
      ],
      esboco: 'Agora o y tem número na frente: depois de tirar o 6, falta dividir por 2. A conferência põe o par na equação.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['sistemas-pares-n1', 'sistemas-pares-n2', 'sistemas-pares-n3'],
      esboco: 'Nível 1: o y de x + y = S dado o x, com a tabela de pares no palco. Nível 2: qual par está na reta ax + by = c, com negativos. Nível 3: uma compra com dois produtos e o total; dada uma quantidade, a outra.',
    },
    {
      tipo: 'fecho',
      texto: 'Com uma informação só, as 10 frutas têm 11 jeitos. A seguir: com o preço delas, sobra um par só.',
      fala: 'Com uma informação só, as dez frutas têm onze jeitos. A seguir: com o preço delas, sobra um par só.',
      visual: plano(
        { ...EIXOS, retas: [DEZ], pontos: [[0, 10], [1, 9], [2, 8], [3, 7], [4, 6], [5, 5], [6, 4], [7, 3], [8, 2], [9, 1], [10, 0]] },
        'A reta de x + y = 10 com os 11 pares inteiros de 0 a 10 marcados: os jeitos de ter 10 frutas.',
      ),
      esboco: 'Responde ao gancho: são 11 jeitos, todos na reta. Aponta para a próxima aula, a segunda condição.',
    },
  ],
}
