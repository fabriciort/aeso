import type { Aula, Visual } from '@/lib/formation/schema'

// A primeira aula de álgebra. A letra guarda um número: um que ainda não
// sabemos (as figurinhas de uma caixa fechada) ou um que muda (os km de uma
// corrida). Começa nas caixas fechadas: cada barra dos azulejos é uma caixa
// e vale x; três caixas são x + x + x = 3x. Momento-chave: a letra é um
// número, não um objeto. Se um abacaxi custa a reais, 3a é 3 × a reais, o
// preço de 3 abacaxis, e não "3 abacaxis". Depois a escrita: 3 × x, 3 · x e
// 3x são a mesma conta. A tabela do aplicativo de transporte mostra a letra
// valendo vários números (1, 2, 3, 4 km… x km), e a aposta 3x com x = 5
// desmonta o 35 (colar os algarismos) e o 8 (somar).

const az = (pecas: string[], extra: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos: { pecas, ...extra } }, esboco })
const exp = (expressao: string[], esboco: string, destaque?: string): Visual => ({ modelo: 'livre', estado: { expressao, ...(destaque ? { destaque } : {}) }, esboco })

const CAIXAS = ['x', 'x', 'x']
const ABACAXIS = ['a', 'a', 'a']
const INGRESSOS = ['p', 'p', 'p', 'p']

/** A tabela da corrida: R$ 3 por km, de 1 a 4 km e depois x km. */
const CORRIDA = (extra: Record<string, unknown>, esboco: string): Visual => ({
  modelo: 'livre',
  estado: {
    tabela: {
      linhas: [
        { rotulo: 'km', valores: [1, 2, 3, 4, 'x'] },
        { rotulo: 'preço (R$)', valores: [3, 6, 9, 12, '3x'] },
      ],
      fator: '× 3',
      ...extra,
    },
  },
  esboco,
})

const TRES_VEZES_CINCO = exp(['3x', '3 × 5', '15'], 'Três linhas: 3x, depois 3 × 5 e, grande, 15.')
const TRES_A = az(ABACAXIS, { letra: 'a', agrupado: true, rotulo: '3a = 3 × a' }, 'As três barras com "a" juntas, com 3a embaixo do grupo. Embaixo de tudo: 3a = 3 × a.')

export const aula: Aula = {
  id: 'B.U14.A1',
  titulo: 'Uma letra no lugar de um número',
  objetivo: 'Entender a letra como um número que ainda não sabemos ou que muda, ler 3x como 3 × x (e x + x + x), escrever a multiplicação com letras sem o sinal (3x) ou com o ponto (3 · x) e trocar a letra por um número simples.',
  modelo: 'livre',
  esboco: 'Abre em três caixas fechadas de figurinhas: ninguém sabe quantas há em cada. O aluno junta as três barras (cada uma vale x) e vê 3x embaixo. Momento-chave: na aposta do abacaxi, 3a não é "3 abacaxis", é 3 vezes o preço, um número. Depois a escrita sem o ×, o anote, e a letra que muda: na tabela do aplicativo, o preço é 3 vezes os km, para qualquer km. Fecha trocando o x por 40 figurinhas.',
  vega: 'Ideia central: uma letra é um número que ainda não sabemos ou que muda. 3x quer dizer 3 × x, que é x + x + x. Com letras, o sinal de vezes some (3x) ou vira um ponto (3 · x). Erros esperados: ler a letra como um objeto (3a = "3 abacaxis", quando a é o preço do abacaxi); colar os algarismos ao trocar a letra (3x com x = 5 dá 35, é 15); somar em vez de multiplicar (3x com x = 5 dá 8). Guie com "O que a letra está guardando: uma coisa ou um número?", "Escreva o sinal de vezes que está escondido: 3 × 5", "Quantas barras de 5?". Não fale ainda de expressões com várias operações (próxima aula) nem de juntar termos diferentes (aula 3).',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você ganhou **3** caixas iguais de figurinhas, ainda fechadas. Não sabe quantas há em cada uma. Como anotar o total?',
      fala: 'Você ganhou três caixas iguais de figurinhas, ainda fechadas. Não sabe quantas há em cada uma. Como anotar o total?',
      visual: exp(['? + ? + ?'], 'Três pontos de interrogação somados, grandes, no centro: um por caixa.'),
      esboco: 'A pergunta é de verdade: não dá para escrever um número. O "?" vai ganhar um nome no próximo cartão.',
    },
    {
      tipo: 'mexa',
      texto: 'Chame de $x$ as figurinhas de uma caixa. Cada barra é uma caixa fechada: vale $x$. Junte as três caixas.',
      fala: 'Chame de x as figurinhas de uma caixa. Cada barra é uma caixa fechada: vale x. Junte as três caixas.',
      visual: az(CAIXAS, { agrupar: true, mostraExpressao: true }, 'Três barras amarelas soltas, cada uma com "x". Um toque e elas se juntam lado a lado, com 3x embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa caixa para juntar as três.',
        sucesso: { agrupado: true },
        mostre: 'As três barras se juntam lado a lado, e aparece 3x embaixo delas.',
      },
      descoberta: 'Três caixas de x figurinhas são x + x + x, e isso se escreve 3x: três vezes o número x.',
      esboco: 'O x nasce como o nome do "?" do gancho. A barra é a caixa fechada: tem um número dentro, só não sabemos qual.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na feira, um abacaxi custa $a$ reais. O que quer dizer $3a$?',
      fala: 'Na feira, um abacaxi custa a reais. O que quer dizer três a?',
      visual: az(ABACAXIS, { letra: 'a' }, 'Três barras soltas, cada uma com "a": o preço de um abacaxi.'),
      opcoes: [
        {
          texto: 'O preço de 3 abacaxis: 3 vezes $a$', certa: true,
          explica: 'Isso. O $a$ é o preço, um número. $3a$ é ${3 \\times a}$ reais: com o abacaxi a R$\u00a04, são R$\u00a012.',
          fala: 'Isso. O a é o preço, um número. Três a é três vezes a, em reais: com o abacaxi a quatro reais, são doze reais.',
          mostra: TRES_A,
        },
        {
          texto: '3 abacaxis', erro: 'letra-como-objeto',
          explica: 'O $a$ não é o abacaxi: é o preço dele, um número. $3a$ é ${3 \\times a}$ reais.',
          fala: 'O a não é o abacaxi: é o preço dele, um número. Três a é três vezes a, em reais.',
          mostra: TRES_A,
        },
        {
          texto: 'O preço de 1 abacaxi e mais 3 reais', erro: 'soma-no-lugar-de-multiplicar',
          explica: 'Isso seria ${a + 3}$. Em $3a$, o 3 multiplica: ${a + a + a}$.',
          fala: 'Isso seria a mais três. Em três a, o três multiplica: a mais a mais a.',
          mostra: TRES_A,
        },
      ],
      esboco: 'O momento-chave: a letra é um número, não um objeto. Todas as opções juntam as três barras e mostram 3a = 3 × a.',
    },
    {
      tipo: 'ideia',
      texto: 'Com letras, o sinal de vezes some ou vira um ponto: ${3 \\times x}$, ${3 \\cdot x}$ e $3x$ são a mesma conta.',
      fala: 'Com letras, o sinal de vezes some ou vira um ponto: três vezes x, três ponto x e três x são a mesma conta.',
      visual: exp(['3 × x', '3 · x', '3x'], 'Três linhas: 3 × x, 3 · x e, grande, 3x. A mesma conta, escrita cada vez mais curta.'),
      esboco: 'A escrita nova, apresentada de uma vez: o × some porque se confunde com a letra x. O ponto aparece também.',
    },
    {
      tipo: 'anote',
      titulo: 'Letra no lugar de um número',
      definicao: 'Uma **letra** guarda um número que ainda não sabemos, ou que muda. $3x$ quer dizer ${3 \\times x}$, ou ${x + x + x}$.',
      exemplo: { tex: 'x + x + x = 3x = 3 \\cdot x', fala: 'x mais x mais x é igual a três x, que é três vezes x' },
      alerta: 'A letra é um número, não um objeto: $3a$ é 3 vezes um número, não "3 abacaxis".',
      esboco: 'Na página: as três barras com x, a soma embaixo e 3x numa moldura. O alerta com o abacaxi riscado.',
    },
    {
      tipo: 'mexa',
      texto: 'A letra também guarda um número que **muda**. Um aplicativo cobra R$\u00a03 por km. Complete a tabela até $x$\u00a0km.',
      fala: 'A letra também guarda um número que muda. Um aplicativo cobra três reais por quilômetro. Complete a tabela até x quilômetros.',
      visual: CORRIDA({ completar: true, mostradas: 1, fatorNoFim: true }, 'A tabela começa com 1\u00a0km e R$\u00a03. Cada toque preenche uma coluna: 2\u00a0km e 6, 3\u00a0km e 9, 4\u00a0km e 12. A última coluna é x km e 3x. No fim, a seta "× 3" aparece à direita.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para mais 1\u00a0km.',
        sucesso: { colunas: 5 },
        mostre: 'As colunas se preenchem: 2, 3 e 4\u00a0km, e por fim x km e 3x reais, com a seta "× 3" à direita.',
      },
      descoberta: 'O preço é sempre 3 vezes os km. Para uma corrida de x km, qualquer que seja, o preço é 3x reais.',
      esboco: 'Aqui a letra não é um número escondido: é um número que pode ser qualquer um. A última coluna resume todas as outras.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Numa corrida de **5** km, o $x$ vale 5. Quanto vale $3x$?',
      fala: 'Numa corrida de cinco quilômetros, o x vale cinco. Quanto vale três x?',
      visual: CORRIDA({ destaque: [4] }, 'A tabela inteira, com a coluna do x km e do 3x em moldura âmbar.'),
      opcoes: [
        {
          texto: '15', certa: true,
          explica: 'Isso. $3x$ é ${3 \\times 5 = 15}$: R$\u00a015 pela corrida.',
          fala: 'Isso. Três x é três vezes cinco, quinze: quinze reais pela corrida.',
          mostra: TRES_VEZES_CINCO,
        },
        {
          texto: '35', erro: 'junta-algarismos-com-a-letra',
          explica: '35 cola o 3 no 5. Mas $3x$ é ${3 \\times x}$: o vezes estava escondido. ${3 \\times 5 = 15}$.',
          fala: 'Trinta e cinco cola o três no cinco. Mas três x é três vezes x: o vezes estava escondido. Três vezes cinco, quinze.',
          mostra: TRES_VEZES_CINCO,
        },
        {
          texto: '8', erro: 'soma-no-lugar-de-multiplicar',
          explica: '8 é ${3 + 5}$. $3x$ é 3 vezes o $x$: ${3 \\times 5 = 15}$.',
          fala: 'Oito é três mais cinco. Três x é três vezes o x: três vezes cinco, quinze.',
          mostra: TRES_VEZES_CINCO,
        },
      ],
      esboco: 'Trocar a letra pela primeira vez. Todas as opções mostram 3x virar 3 × 5 e depois 15.',
    },
    {
      tipo: 'passo',
      problema: 'Um ingresso de cinema custa $p$ reais. Uma família compra **4** ingressos. Quanto ela paga?',
      fala: 'Um ingresso de cinema custa p reais. Uma família compra quatro ingressos. Quanto ela paga?',
      visual: az(INGRESSOS, { letra: 'p' }, 'Quatro barras soltas, cada uma com "p": o preço de um ingresso.'),
      passos: [
        {
          pergunta: 'Como se escreve o preço dos 4 ingressos?',
          fala: 'Como se escreve o preço dos quatro ingressos?',
          opcoes: [
            {
              texto: '$4p$', certa: true,
              explica: 'Isso. ${p + p + p + p = 4p}$: 4 vezes o preço.',
              fala: 'Isso. p mais p mais p mais p é quatro p: quatro vezes o preço.',
              mostra: az(INGRESSOS, { letra: 'p', agrupado: true, mostraExpressao: true }, 'As quatro barras se juntam, com 4p embaixo.'),
            },
            {
              texto: '${4 + p}$', erro: 'soma-no-lugar-de-multiplicar',
              explica: '${4 + p}$ é um ingresso e mais R$\u00a04. São 4 ingressos de $p$ reais: $4p$.',
              fala: 'Quatro mais p é um ingresso e mais quatro reais. São quatro ingressos de p reais: quatro p.',
            },
            {
              texto: '$p^4$', erro: 'x-mais-x-da-x2',
              explica: '$p^4$ é ${p \\cdot p \\cdot p \\cdot p}$, multiplicar. Aqui se somam 4 preços: $4p$.',
              fala: 'p elevado a quatro é p vezes p vezes p vezes p. Aqui se somam quatro preços: quatro p.',
            },
          ],
          linha: { tex: 'p + p + p + p = 4p', fala: 'p mais p mais p mais p é igual a quatro p' },
        },
        {
          pergunta: 'O ingresso custa R$\u00a025. Quanto a família paga?',
          fala: 'O ingresso custa vinte e cinco reais. Quanto a família paga?',
          opcoes: [
            {
              texto: 'R$\u00a0100', certa: true,
              explica: 'Isso. ${4 \\times 25 = 100}$.',
              fala: 'Isso. Quatro vezes vinte e cinco, cem.',
              mostra: exp(['4p', '4 × 25', '100'], 'Três linhas: 4p, depois 4 × 25 e, grande, 100.'),
            },
            {
              texto: 'R$\u00a0425', erro: 'junta-algarismos-com-a-letra',
              explica: '425 cola o 4 no 25. $4p$ é ${4 \\times 25}$, que dá 100.',
              fala: 'Quatrocentos e vinte e cinco cola o quatro no vinte e cinco. Quatro p é quatro vezes vinte e cinco, que dá cem.',
            },
            {
              texto: 'R$\u00a029', erro: 'soma-no-lugar-de-multiplicar',
              explica: '29 é ${4 + 25}$. São 4 ingressos de R$\u00a025: ${4 \\times 25 = 100}$.',
              fala: 'Vinte e nove é quatro mais vinte e cinco. São quatro ingressos de vinte e cinco reais: quatro vezes vinte e cinco, cem.',
            },
          ],
          linha: { tex: '4p = 4 \\cdot 25 = 100', fala: 'quatro p é quatro vezes vinte e cinco, igual a cem' },
        },
        {
          pergunta: 'O preço sobe para R$\u00a030. A escrita $4p$ muda?',
          fala: 'O preço sobe para trinta reais. A escrita quatro p muda?',
          opcoes: [
            {
              texto: 'Não. Muda só o número no lugar do $p$', certa: true,
              explica: 'Isso. $4p$ vale para qualquer preço: agora ${4 \\times 30 = 120}$.',
              fala: 'Isso. Quatro p vale para qualquer preço: agora quatro vezes trinta, cento e vinte.',
              mostra: exp(['4p', '4 × 30', '120'], 'As três linhas de novo, agora com 4 × 30 e, grande, 120.'),
            },
            {
              texto: 'Sim. Precisa de outra letra',
              explica: 'A letra guarda o preço, e o preço pode mudar. A mesma escrita serve: ${4 \\times 30 = 120}$.',
              fala: 'A letra guarda o preço, e o preço pode mudar. A mesma escrita serve: quatro vezes trinta, cento e vinte.',
            },
          ],
          linha: { tex: '4p = 4 \\cdot 30 = 120', fala: 'quatro p é quatro vezes trinta, igual a cento e vinte' },
        },
      ],
      esboco: 'As barras do p se juntam em 4p; depois o p vira 25 e vira 30. A mesma escrita serve para os dois preços: a letra é o número que muda.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: uma caixa tem $x$ lápis. Escreva o total de **6** caixas e calcule com ${x = 12}$.',
      fala: 'No papel: uma caixa tem x lápis. Escreva o total de seis caixas e calcule com x igual a doze.',
      resposta: 72,
      resolucao: [
        { tex: 'x + x + x + x + x + x = 6x', fala: 'seis caixas de x lápis: seis x' },
        { tex: '6x = 6 \\cdot 12 = 72', fala: 'seis x é seis vezes doze, igual a setenta e dois' },
      ],
      esboco: 'Quem digitar 612 colou os algarismos; quem digitar 18 somou. A resolução escreve o vezes que estava escondido.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['letra-numero-n1', 'letra-numero-n2', 'letra-numero-n3'],
      esboco: 'Nível 1: quantas barras (x + x + x = □x), 3x com x pequeno e com as barras na tela, e o que quer dizer 4m. Nível 2: kx com algarismos que tentam a colar, a escrita com o ponto e a + a + a contra a³. Nível 3: caixas, corridas e canetas, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'As 3 caixas têm $3x$ figurinhas. Abriu uma e contou 40? São ${3 \\times 40 = 120}$. Na próxima aula: trocar a letra e calcular.',
      fala: 'As três caixas têm três x figurinhas. Abriu uma e contou quarenta? São três vezes quarenta, cento e vinte. Na próxima aula: trocar a letra e calcular.',
      visual: az(CAIXAS, { agrupado: true, rotulo: 'x = 40: 3 × 40 = 120' }, 'As três barras juntas, com 3x embaixo do grupo. Embaixo de tudo: x = 40: 3 × 40 = 120.'),
      esboco: 'Responde ao gancho: o total se anota como 3x, e vira um número quando a caixa é aberta.',
    },
  ],
}
