import type { Aula, Visual } from '@/lib/formation/schema'

// Substituição. Na banca há 10 frutas, e as peras são 2 a mais que as
// maçãs: y = x + 2 e x + y = 10. O momento-chave é o Mexa "trocar": a
// caixa x + 2 vai para o lugar do y, com os parênteses, e sobra uma
// equação com uma letra só, x + (x + 2) = 10, como no 1º grau. Achar x,
// depois y, e conferir nas duas (no plano, o cruzamento (4, 6)). O erro de
// tirar os parênteses: 3(x − 3) não é 3x − 3. Por fim, um sistema em que é
// preciso isolar uma letra antes: x + y = 7 dá y = 7 − x.

const sistema = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { sistema: estado }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const BANCA = ['y = x + 2', 'x + y = 10']
const TROCAR = sistema({ equacoes: BANCA, trocar: 'y' }, 'As duas equações empilhadas: em cima, y = x + 2, com o x + 2 numa caixa; embaixo, x + y = 10, com o y aceso e sublinhado.')
const TROCADO = sistema({ equacoes: BANCA, trocar: 'y', trocado: true }, 'A caixa já está no lugar do y: x + (x + 2) = 10. Em cima, a marca tracejada de onde ela saiu.')
const UMA = 'x + (x + 2) = 10'

const DIST = ['y = x − 3', '2x + 3y = 21']
const DIST_TROCAR = sistema({ equacoes: DIST, trocar: 'y' }, 'Em cima, y = x − 3, com o x − 3 na caixa; embaixo, 2x + 3y = 21, com o y aceso.')
const DIST_TROCADO = sistema({ equacoes: DIST, trocar: 'y', trocado: true }, 'A caixa no lugar do y: 2x + 3(x − 3) = 21, com os parênteses.')
const DUAS_LINHAS = '2x + 3(x − 3) = 21'

const ISOLAR = ['y = 7 − x', '3x + 2y = 18']

export const aula: Aula = {
  id: 'AF.U4.A3',
  titulo: 'Substituição',
  objetivo: 'Resolver um sistema por substituição: trocar a letra pelo que ela vale, entre parênteses; resolver a equação de uma letra; achar a outra letra e conferir nas duas. Isolar uma letra antes, quando nenhuma equação diz quanto ela vale.',
  modelo: 'livre',
  esboco: 'Abre na banca: 10 frutas, 2 peras a mais que maçãs. Desenhar retas dá trabalho; uma conta resolve. Momento-chave: o Mexa "trocar", em que a caixa x + 2 entra no lugar do y, com os parênteses. O passo a passo resolve x + (x + 2) = 10. A aposta do "pronto?" pede o y, e o plano confere o (4, 6) nas duas retas. O anote dá o método. Depois, o erro dos parênteses em 2x + 3(x − 3) = 21, e um sistema em que é preciso isolar o y antes.',
  vega: 'Ideia central: quando uma equação diz quanto vale uma letra (y = x + 2), essa letra pode ser trocada, na outra equação, por aquilo que ela vale. Como x + 2 é um número só, ele entra entre parênteses: 3y vira 3(x + 2), que é 3x + 6. Sobra uma equação com uma letra, que se resolve como no 1º grau. Achado o x, volte a uma das equações para achar o y, e confira o par nas duas. Se nenhuma equação diz quanto vale uma letra, isole-a antes (x + y = 7 dá y = 7 − x). Erros esperados: tirar os parênteses e multiplicar só o primeiro termo (3(x − 3) virar 3x − 3); juntar x + x como x²; fazer a conta só de um lado; parar no x e esquecer o y; isolar y = 7 + x, sem trocar o sinal. Guie com "O que a primeira equação diz que o y vale?", "Esse x + 2 entra inteiro: o que o protege?", "Você achou x. O problema perguntou o quê?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na banca há **10 frutas**, e as peras são **2 a mais** que as maçãs. Dá para achar quantas de cada sem desenhar retas?',
      fala: 'Na banca há dez frutas, e as peras são duas a mais que as maçãs. Dá para achar quantas de cada sem desenhar retas?',
      visual: TROCAR,
      esboco: 'O sistema da banca: y = x + 2 (as peras) e x + y = 10 (o total). A primeira já diz quanto vale y.',
    },
    {
      tipo: 'mexa',
      texto: 'A primeira equação diz quanto vale y: **x + 2**. Então, na segunda, o y pode virar x + 2.',
      fala: 'A primeira equação diz quanto vale y: x mais dois. Então, na segunda, o y pode virar x mais dois.',
      visual: TROCAR,
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na caixa para pôr x + 2 no lugar do y.',
        sucesso: { trocado: true },
        mostre: 'O y vira (x + 2), com os parênteses.',
      },
      descoberta: 'Sobra uma equação com uma letra só: x + (x + 2) = 10.',
      esboco: 'O momento-chave: a caixa voa para o lugar do y e chega com os parênteses. Duas letras viram uma.',
    },
    {
      tipo: 'passo',
      problema: 'Sobrou uma letra só. Resolva ${x + (x + 2) = 10}$.',
      fala: 'Sobrou uma letra só. Resolva x mais, abre parênteses, x mais dois, fecha parênteses, igual a dez.',
      visual: TROCADO,
      passos: [
        {
          pergunta: 'Juntando os x, a equação fica:',
          opcoes: [
            {
              texto: '$x^2 + 2 = 10$',
              erro: 'x-mais-x-da-x2',
              explica: 'x + x é um x mais outro: 2x. O x² seria x vezes x.',
              fala: 'x mais x é um x mais outro: dois x. O x ao quadrado seria x vezes x.',
              mostra: expr([UMA, 'x + x = 2x'], 'Embaixo da equação: x + x = 2x.'),
            },
            {
              texto: '$2x + 2 = 10$',
              certa: true,
              explica: 'Isso. Agora é uma equação do 1º grau, como as da balança.',
              fala: 'Isso. Agora é uma equação do primeiro grau, como as da balança.',
              mostra: expr([UMA, '2x + 2 = 10'], 'Embaixo: 2x + 2 = 10.'),
            },
          ],
          linha: { tex: '2x + 2 = 10', fala: 'dois x mais dois igual a dez' },
        },
        {
          pergunta: 'Tire 2 dos dois lados:',
          opcoes: [
            {
              texto: '$2x = 8$',
              certa: true,
              explica: 'Isso. ${10 - 2 = 8}$, dos dois lados, como na balança.',
              fala: 'Isso. Dez menos dois, oito, dos dois lados, como na balança.',
              mostra: expr([UMA, '2x + 2 = 10', '2x = 8'], 'Mais uma linha: 2x = 8.'),
            },
            {
              texto: '$2x = 10$',
              erro: 'opera-so-de-um-lado',
              explica: 'O 2 saiu só da esquerda. Tire do outro lado também: ${10 - 2 = 8}$.',
              fala: 'O dois saiu só da esquerda. Tire do outro lado também: dez menos dois, oito.',
              mostra: expr([UMA, '2x + 2 = 10', '2x = 10 − 2'], 'Embaixo: 2x = 10 − 2, o 2 sai dos dois lados.'),
            },
          ],
          linha: { tex: '2x = 8', fala: 'dois x igual a oito' },
        },
        {
          pergunta: 'Quanto vale x?',
          opcoes: [
            {
              texto: '8',
              erro: 'esquece-de-dividir',
              explica: '8 é o valor de 2x, de dois x juntos. Um x é ${8 \\div 2 = 4}$.',
              fala: 'Oito é o valor de dois x juntos. Um x é oito dividido por dois, quatro.',
              mostra: expr([UMA, '2x + 2 = 10', '2x = 8'], 'A linha 2x = 8 acesa: ainda são dois x.'),
            },
            {
              texto: '4',
              certa: true,
              explica: 'Isso. ${x = 4}$: são 4 maçãs.',
              fala: 'Isso. x igual a quatro: são quatro maçãs.',
              mostra: expr([UMA, '2x + 2 = 10', '2x = 8', 'x = 4'], 'A última linha, maior: x = 4.'),
            },
          ],
          linha: { tex: 'x = 4', fala: 'x igual a quatro' },
        },
      ],
      esboco: 'A equação de uma letra, resolvida como no 1º grau: juntar os x, tirar o número dos dois lados, dividir.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Achamos ${x = 4}$. A conta terminou?',
      fala: 'Achamos x igual a quatro. A conta terminou?',
      visual: expr([UMA, '2x + 2 = 10', '2x = 8', 'x = 4'], 'A conta inteira, com x = 4 embaixo.'),
      opcoes: [
        {
          texto: 'Terminou: 4 de cada',
          erro: 'esquece-a-segunda-letra',
          explica: 'O 4 é só o x, as maçãs. As peras são ${y = 4 + 2 = 6}$. 4 e 4 dariam 8 frutas.',
          fala: 'O quatro é só o x, as maçãs. As peras são y igual a quatro mais dois, seis. Quatro e quatro dariam oito frutas.',
          mostra: expr(['x = 4', 'y = x + 2', 'y = 4 + 2 = 6'], 'O 4 volta para a primeira equação: y = 4 + 2 = 6.'),
        },
        {
          texto: 'Falta o y: ${4 + 2 = 6}$',
          certa: true,
          explica: 'Isso. A primeira diz: ${y = x + 2 = 6}$. São 4 maçãs e 6 peras.',
          fala: 'Isso. A primeira diz: y igual a x mais dois, seis. São quatro maçãs e seis peras.',
          mostra: expr(['x = 4', 'y = x + 2', 'y = 4 + 2 = 6'], 'O 4 volta para a primeira equação: y = 4 + 2 = 6.'),
        },
      ],
      esboco: 'O x é metade da resposta. Quem para no 4 deixa as peras sem resposta.',
    },
    {
      tipo: 'ideia',
      texto: 'Confira o par ${(4, 6)}$ nas **duas**: ${6 = 4 + 2}$ e ${4 + 6 = 10}$. No plano, é o cruzamento das retas.',
      fala: 'Confira o par quatro, seis, nas duas: seis é quatro mais dois, e quatro mais seis é dez. No plano, é o cruzamento das retas.',
      visual: {
        modelo: 'plano',
        estado: { x: [0, 10], y: [0, 10], retas: [{ equacao: 'y = x + 2' }, { equacao: 'x + y = 10' }], cruzamento: true, conferir: true },
        esboco: 'As retas de y = x + 2 e x + y = 10 se cruzam no (4, 6). Embaixo, as duas conferências com ✓.',
      },
      esboco: 'A conta dá o mesmo par que o desenho da aula anterior daria. O plano confirma; a conferência é o hábito.',
    },
    {
      tipo: 'anote',
      titulo: 'Substituição',
      definicao: 'Se uma equação diz quanto vale **y**, troque o y da outra por isso, **entre parênteses**. Sobra uma equação com uma letra.',
      exemplo: { tex: 'y = x + 2,\\; x + y = 10 \\;\\Rightarrow\\; x + (x + 2) = 10', fala: 'y igual a x mais dois, e x mais y igual a dez: x mais, entre parênteses, x mais dois, igual a dez' },
      alerta: 'Ache x, depois **y**, e confira o par nas duas equações.',
      esboco: 'Na página: as duas equações, a seta da caixa para o lugar do y, e a conta até x = 4 e y = 6.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora ${y = x - 3}$ e ${2x + 3y = 21}$. Trocando o y, a segunda fica:',
      fala: 'Agora y igual a x menos três, e dois x mais três y igual a vinte e um. Trocando o y, a segunda fica:',
      visual: DIST_TROCAR,
      opcoes: [
        {
          texto: '$2x + 3x - 3 = 21$',
          erro: 'substitui-sem-parenteses',
          explica: 'O 3 multiplica o y inteiro, e o y é ${x - 3}$. Sem os parênteses, o 3 pegou só o x.',
          fala: 'O três multiplica o y inteiro, e o y é x menos três. Sem os parênteses, o três pegou só o x.',
          mostra: DIST_TROCADO,
        },
        {
          texto: '$2x + 3(x - 3) = 21$',
          certa: true,
          explica: 'Isso. O 3 vale para o y todo: ${3(x - 3) = 3x - 9}$.',
          fala: 'Isso. O três vale para o y todo: três vezes x menos três é três x menos nove.',
          mostra: DIST_TROCADO,
        },
      ],
      esboco: 'Os parênteses protegem o que a caixa vale. As duas opções mostram a caixa chegando com os parênteses.',
    },
    {
      tipo: 'passo',
      problema: 'Resolva ${2x + 3(x - 3) = 21}$ e ache o par.',
      fala: 'Resolva dois x mais três vezes x menos três igual a vinte e um, e ache o par.',
      visual: DIST_TROCADO,
      passos: [
        {
          pergunta: 'Fazendo a distributiva, fica:',
          opcoes: [
            {
              texto: '$2x + 3x - 3 = 21$',
              erro: 'multiplica-so-um-termo',
              explica: 'O 3 vezes o −3 também: ${3 \\cdot (-3) = -9}$.',
              fala: 'O três vezes o menos três também: três vezes menos três é menos nove.',
              mostra: expr([DUAS_LINHAS, '3 · (−3) = −9'], 'Embaixo: 3 · (−3) = −9.'),
            },
            {
              texto: '$2x + 3x - 9 = 21$',
              certa: true,
              explica: 'Isso. ${3x - 9}$. Juntando os x: ${5x - 9 = 21}$.',
              fala: 'Isso. Três x menos nove. Juntando os x: cinco x menos nove igual a vinte e um.',
              mostra: expr([DUAS_LINHAS, '5x − 9 = 21'], 'Embaixo: 5x − 9 = 21.'),
            },
          ],
          linha: { tex: '5x - 9 = 21', fala: 'cinco x menos nove igual a vinte e um' },
        },
        {
          pergunta: 'Quanto vale x?',
          opcoes: [
            {
              texto: '6',
              certa: true,
              explica: 'Isso. ${5x = 30}$, e ${x = 6}$.',
              fala: 'Isso. Cinco x igual a trinta, e x igual a seis.',
              mostra: expr([DUAS_LINHAS, '5x − 9 = 21', '5x = 30', 'x = 6'], 'Mais duas linhas: 5x = 30 e x = 6.'),
            },
            {
              texto: '2,4',
              erro: 'desfaz-com-a-mesma-operacao',
              explica: 'Isso seria ${5x = 12}$, tirando 9. Para desfazer o − 9, some 9: ${5x = 30}$.',
              fala: 'Isso seria cinco x igual a doze, tirando nove. Para desfazer o menos nove, some nove: cinco x igual a trinta.',
              mostra: expr([DUAS_LINHAS, '5x − 9 = 21', '5x = 21 + 9'], 'Embaixo: 5x = 21 + 9.'),
            },
          ],
          linha: { tex: '5x = 30, \\quad x = 6', fala: 'cinco x igual a trinta, x igual a seis' },
        },
        {
          pergunta: 'E o y?',
          opcoes: [
            {
              texto: '3',
              certa: true,
              explica: 'Isso. ${y = 6 - 3 = 3}$. Confere: ${2 \\cdot 6 + 3 \\cdot 3 = 21}$.',
              fala: 'Isso. y igual a seis menos três, três. Confere: dois vezes seis mais três vezes três é vinte e um.',
              mostra: expr(['x = 6', 'y = 6 − 3 = 3', '2 · 6 + 3 · 3 = 21'], 'O par (6, 3), com a conferência na segunda equação.'),
            },
            {
              texto: '6',
              erro: 'esquece-a-segunda-letra',
              explica: 'O 6 é o x. O y vem da primeira equação: ${y = x - 3}$.',
              fala: 'O seis é o x. O y vem da primeira equação: y igual a x menos três.',
              mostra: expr(['x = 6', 'y = x − 3', 'y = 6 − 3'], 'O 6 volta para a primeira: y = 6 − 3.'),
            },
          ],
          linha: { tex: 'y = 6 - 3 = 3', fala: 'y igual a seis menos três, três' },
        },
      ],
      esboco: 'A distributiva com o menos, depois o 1º grau e a volta para o y. O par (6, 3) conferido.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x + y = 7}$ com ${3x + 2y = 18}$? Nenhuma diz quanto vale y. Isolando o y na primeira:',
      fala: 'E x mais y igual a sete, com três x mais dois y igual a dezoito? Nenhuma diz quanto vale y. Isolando o y na primeira:',
      visual: expr(['x + y = 7', '3x + 2y = 18'], 'As duas equações, uma embaixo da outra, sem caixa.'),
      opcoes: [
        {
          texto: '$y = 7 + x$',
          erro: 'passa-para-o-outro-lado',
          explica: 'Para o x sair da esquerda, tire x dos dois lados: ${y = 7 - x}$.',
          fala: 'Para o x sair da esquerda, tire x dos dois lados: y igual a sete menos x.',
          mostra: expr(['x + y = 7', 'x + y − x = 7 − x', 'y = 7 − x'], 'Embaixo: tirando x dos dois lados, y = 7 − x.'),
        },
        {
          texto: '$y = 7 - x$',
          certa: true,
          explica: 'Isso. Tirando x dos dois lados, sobra ${y = 7 - x}$. Agora dá para trocar.',
          fala: 'Isso. Tirando x dos dois lados, sobra y igual a sete menos x. Agora dá para trocar.',
          mostra: sistema({ equacoes: ISOLAR, trocar: 'y' }, 'O sistema reescrito: y = 7 − x em cima, com o 7 − x na caixa; 3x + 2y = 18 embaixo, com o y aceso.'),
        },
      ],
      esboco: 'Quando nenhuma equação diz quanto vale uma letra, isole uma. A certa já monta a troca do próximo cartão.',
    },
    {
      tipo: 'mexa',
      texto: 'Com ${y = 7 - x}$, a troca é a mesma.',
      fala: 'Com y igual a sete menos x, a troca é a mesma.',
      visual: sistema({ equacoes: ISOLAR, trocar: 'y' }, 'Em cima, y = 7 − x com a caixa; embaixo, 3x + 2y = 18 com o y aceso.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na caixa para pôr 7 − x no lugar do y.',
        sucesso: { trocado: true },
        mostre: 'O y vira (7 − x): 3x + 2(7 − x) = 18.',
      },
      descoberta: 'A troca dá 3x + 2(7 − x) = 18, com uma letra só.',
      esboco: 'O mesmo gesto depois de isolar. O 2 fica na frente dos parênteses: o aluno vai fazer a distributiva no papel.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${3x + 2(7 - x) = 18}$, ache o y e confira nas duas. Quanto vale y?',
      fala: 'No papel: resolva três x mais dois vezes sete menos x igual a dezoito, ache o y e confira nas duas. Quanto vale y?',
      resposta: 3,
      sinal: true,
      resolucao: [
        { tex: '3x + 14 - 2x = 18', fala: 'três x mais catorze menos dois x igual a dezoito' },
        { tex: 'x + 14 = 18, \\quad x = 4', fala: 'x mais catorze igual a dezoito, x igual a quatro' },
        { tex: 'y = 7 - 4 = 3', fala: 'y igual a sete menos quatro, três' },
        { tex: '\\text{confere: } 4 + 3 = 7, \\;\\; 3 \\cdot 4 + 2 \\cdot 3 = 18', fala: 'confere: quatro mais três é sete, e três vezes quatro mais dois vezes três é dezoito' },
      ],
      esboco: 'O caminho inteiro sozinho: distributiva com o menos, o x, a volta para o y e a conferência nas duas.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['sistemas-substituicao-n1', 'sistemas-substituicao-n2', 'sistemas-substituicao-n3'],
      esboco: 'Nível 1: y = x + a e x + y = S, o x ou o y, com a troca no palco. Nível 2: y = px + q numa equação com 2y ou 3y, ou a equação que sai da troca, com parênteses. Nível 3: isolar uma letra antes e achar o y ou x + y.',
    },
    {
      tipo: 'fecho',
      texto: 'Trocar uma letra pelo que ela vale deixa uma letra só. A seguir: somar as duas equações para uma letra sumir.',
      fala: 'Trocar uma letra pelo que ela vale deixa uma letra só. A seguir: somar as duas equações para uma letra sumir.',
      visual: TROCADO,
      esboco: 'Responde ao gancho (4 maçãs e 6 peras, sem desenhar) e aponta para o método da adição, na próxima aula.',
    },
  ],
}
