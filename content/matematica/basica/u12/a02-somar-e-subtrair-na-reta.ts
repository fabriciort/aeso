import type { Aula, Visual } from '@/lib/formation/schema'

// Somar e subtrair na reta: cada conta é uma caminhada. Somar um positivo é
// andar para a direita; subtrair um positivo, para a esquerda. A reta não
// para no zero: 3 − 5 anda 3 passos até o zero e mais 2 depois dele, até −2.
// Somar um negativo também anda para a esquerda: 2 + (−3) = −1. As fichas de
// saldo mostram (−3) + 5 (três pares valem zero, sobram 2 +) e
// (−4) + (−3) = −7 (dívida mais dívida). Os erros a desmontar: esquecer o
// sinal ao passar do zero (esquece-sinal-do-resultado), andar para o lado
// errado (anda-para-o-lado-errado) e "menos com menos dá mais" na soma
// (menos-com-menos-na-soma).

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { sinais: true, ...estado }, esboco })
const saldo = (s: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { saldo: s }, esboco })

/** A reta do termômetro, de −5 a 9. */
const T = { de: -5, ate: 9, passo: 1 }
/** A reta da conta de 3 − 5, com o 3 e o 0 escritos. */
const T35 = { ...T, marcas: [-2, 0, 3] }
/** Uma reta mais curta, para o −1 e o 0 não se encostarem. */
const CURTA = { de: -4, ate: 5, passo: 1 }
/** A reta do saldo de R$ 40, de −30 a 50, de 5 em 5. */
const CONTA = { de: -30, ate: 50, passo: 5, marcas: [0, 40] }

export const aula: Aula = {
  id: 'B.U12.A2',
  titulo: 'Somar e subtrair na reta',
  objetivo: 'Somar e subtrair inteiros andando na reta: somar um positivo é ir para a direita; subtrair um positivo ou somar um negativo é ir para a esquerda, passando do zero quando for preciso (3 − 5 = −2; (−4) + (−3) = −7).',
  modelo: 'reta',
  esboco: 'O termômetro marca 3 °C e a temperatura cai 5 graus. O aluno anda 5 passos para a esquerda a partir do 3 e chega a −2. Momento-chave: a caminhada passa do zero e continua: 3 − 5 = −2, não 2 nem "não dá". Depois as fichas de saldo: (−3) + 5 (três pares valem zero, sobra +2), somar uma dívida, 2 + (−3) = −1, e dívida mais dívida, (−4) + (−3) = −7. O passo a passo é o saldo de R$ 40 depois de um boleto de R$ 65.',
  vega: 'Ideia central: somar e subtrair são caminhadas na reta. Somar um positivo é andar para a direita; subtrair um positivo, para a esquerda; somar um negativo também é andar para a esquerda (somar uma dívida). A reta continua depois do zero: 3 − 5 anda 3 passos até o zero e mais 2 depois dele, chega a −2. Com as fichas de saldo, uma + e uma − juntas valem zero: (−3) + 5 deixa 3 pares e sobram 2 +. Dívida mais dívida é mais dívida: (−4) + (−3) = −7. Erros esperados: 3 − 5 = 2 (esquece o sinal) ou "não dá"; 2 + (−3) = 5 (anda para o lado errado); (−4) + (−3) = 7 ("menos com menos dá mais", que é regra da multiplicação, e só vem na aula 4). Guie com "Para que lado você anda?", "Você passou do zero?", "Sobrou dinheiro ou dívida?". Tirar um negativo, como 2 − (−3), é a próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Às 18 h, o termômetro marcava **3 °C**. Até a meia-noite, a temperatura caiu **5 graus**. Quanto ele marca agora?',
      fala: 'Às dezoito horas, o termômetro marcava três graus. Até a meia-noite, a temperatura caiu cinco graus. Quanto ele marca agora?',
      visual: reta({ ...T, marcas: [0, 3], numeros: [3] }, 'A reta de −5 a 9, o lado esquerdo do zero em azul, com o ponto âmbar no 3.'),
      esboco: 'Cair 5 graus de 3 °C: quem pensa "3 menos 5 não dá" trava. A reta continua.',
    },
    {
      tipo: 'mexa',
      texto: 'Cair 5 graus é andar **5 passos para a esquerda**. Comece no 3 e ande. Onde você chega?',
      fala: 'Cair cinco graus é andar cinco passos para a esquerda. Comece no três e ande. Onde você chega?',
      visual: reta({ ...T, marcas: [3, 0], numeros: [3], escolhas: [-2, 2, 8] }, 'A reta com 3 e 0 escritos e três círculos vazios, sem número: em −2, em 2 e em 8. O aluno conta os passos e toca um.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Conte 5 traços para a esquerda e toque no círculo.',
        sucesso: { vizinho: -2 },
        mostre: 'A seta sai do 3, passa pelo zero e para no círculo do −2.',
      },
      descoberta: 'Do 3, cinco passos para a esquerda passam do zero: 3 passos até o zero e mais 2 depois dele.',
      esboco: 'O círculo do 2 é o "esqueci o sinal"; o do 8, andar para o lado errado. Errar balança a reta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Então quanto é **3 − 5**?',
      fala: 'Então quanto é três menos cinco?',
      visual: reta({ ...T35, saltos: [[3, -2, '−5']] }, 'O arco do 3 até o −2, com "−5" em cima.'),
      opcoes: [
        {
          texto: '−2', fala: 'Menos dois.', certa: true,
          explica: 'Isso. 3 passos até o zero e mais 2 depois dele: −2.',
          mostra: reta({ ...T35, saltos: [[3, 0, '−3'], [0, -2, '−2']], comparacoes: ['3 − 5 = −2'] }, 'O arco se parte em dois: do 3 ao 0 (−3) e do 0 ao −2 (−2). Embaixo, 3 − 5 = −2.'),
        },
        {
          texto: '2', fala: 'Dois.', erro: 'esquece-sinal-do-resultado',
          explica: 'O 2 fica à direita do zero. Você passou do zero e parou 2 passos depois dele: −2.',
          mostra: reta({ ...T35, saltos: [[3, 0, '−3'], [0, -2, '−2']] }, 'Os dois arcos: o segundo passa para o lado azul.'),
        },
        {
          texto: 'Não dá: 5 é maior que 3',
          explica: 'Na reta dá: depois do zero, ela continua. A temperatura chega a −2 °C.',
          mostra: reta({ ...T35, saltos: [[3, 0, '−3'], [0, -2, '−2']] }, 'Os dois arcos: depois do zero, a caminhada continua no azul.'),
        },
      ],
      esboco: 'O momento-chave: a reta não acaba no zero. A conta "impossível" da unidade 2 agora tem resposta.',
    },
    {
      tipo: 'ideia',
      texto: 'Somar um positivo é andar para a **direita**. Subtrair um positivo é andar para a **esquerda**, passando do zero se for preciso.',
      fala: 'Somar um positivo é andar para a direita. Subtrair um positivo é andar para a esquerda, passando do zero se for preciso.',
      visual: reta({ ...T, marcas: [-2, 0, 3, 7], saltos: [[3, 7, '+4'], [3, -2, '−5']] }, 'Do 3, dois arcos: um para a direita até 7 (+4) e um para a esquerda até −2 (−5).'),
      esboco: 'As duas direções lado a lado, a partir do mesmo 3.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Nas fichas, cada **+** é 1 real e cada **−**, 1 real que você deve. Quanto é **(−3) + 5**?',
      fala: 'Nas fichas, cada mais é um real e cada menos, um real que você deve. Quanto é menos três mais cinco?',
      visual: saldo({ positivas: 5, negativas: 3 }, 'Cinco fichas + âmbar em cima e três fichas − azuis embaixo, alinhadas pela esquerda.'),
      opcoes: [
        {
          texto: '2', fala: 'Dois.', certa: true,
          explica: 'Isso. Uma + e uma − juntas valem zero: são 3 pares, e sobram 2 +.',
          mostra: saldo({ positivas: 5, negativas: 3, pares: true, mostraSaldo: true }, 'Três molduras tracejadas em volta dos pares, com 0 embaixo de cada; embaixo de tudo, "saldo: +2".'),
        },
        {
          texto: '−8', fala: 'Menos oito.', erro: 'anda-para-o-lado-errado',
          explica: '−8 seria juntar mais dívida. Os 5 reais pagam a dívida de 3: três pares valem zero e sobram 2 +.',
          mostra: saldo({ positivas: 5, negativas: 3, pares: true, mostraSaldo: true }, 'Os três pares emoldurados e "saldo: +2".'),
        },
        {
          texto: '−2', fala: 'Menos dois.',
          explica: 'Há mais + que −: depois dos 3 pares, sobram fichas +. O saldo é positivo: 2.',
          mostra: saldo({ positivas: 5, negativas: 3, pares: true, mostraSaldo: true }, 'Os três pares emoldurados; sobram duas + soltas.'),
        },
      ],
      esboco: 'O par zero: uma + e uma − se cancelam. Na reta, é sair do −3 e andar 5 para a direita.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você tem **R$ 2** e soma uma dívida de **R$ 3**. Quanto é **2 + (−3)**?',
      fala: 'Você tem dois reais e soma uma dívida de três reais. Quanto é dois mais menos três?',
      visual: reta({ ...CURTA, marcas: [0, 2], numeros: [2] }, 'A reta com o ponto âmbar no 2.'),
      opcoes: [
        {
          texto: '−1', fala: 'Menos um.', certa: true,
          explica: 'Isso. Somar uma dívida anda para a esquerda: 2 passos até o zero e mais 1.',
          mostra: reta({ ...CURTA, marcas: [-1, 0, 2], saltos: [[2, -1, '+ (−3)']], comparacoes: ['2 + (−3) = −1'] }, 'O arco do 2 até o −1, com "+ (−3)" em cima; embaixo, 2 + (−3) = −1.'),
        },
        {
          texto: '5', fala: 'Cinco.', erro: 'anda-para-o-lado-errado',
          explica: 'Somar uma dívida não deixa você mais rico. O −3 anda para a esquerda: chega a −1.',
          mostra: reta({ ...CURTA, marcas: [-1, 0, 2], saltos: [[2, -1, '+ (−3)']] }, 'O arco vai para a esquerda, não para a direita.'),
        },
        {
          texto: '1', fala: 'Um.', erro: 'esquece-sinal-do-resultado',
          explica: 'O 1 está à direita do zero. Com R$ 2 você paga só 2 dos 3: ainda deve 1, −1.',
          mostra: reta({ ...CURTA, marcas: [-1, 0, 2], saltos: [[2, 0, '−2'], [0, -1, '−1']] }, 'Dois arcos: do 2 ao 0 e do 0 ao −1.'),
        },
      ],
      esboco: 'Somar um negativo anda para o mesmo lado que subtrair um positivo: 2 + (−3) e 2 − 3 dão −1.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você deve **R$ 4** e faz mais uma dívida de **R$ 3**. Quanto é **(−4) + (−3)**?',
      fala: 'Você deve quatro reais e faz mais uma dívida de três reais. Quanto é menos quatro mais menos três?',
      visual: saldo({ negativas: 4 }, 'Quatro fichas − azuis embaixo, nenhuma + em cima.'),
      opcoes: [
        {
          texto: '−7', fala: 'Menos sete.', certa: true,
          explica: 'Isso. Dívida mais dívida: 7 fichas −, nenhuma + para cancelar.',
          mostra: saldo({ negativas: 7, mostraSaldo: true }, 'Mais três − entram ao lado das quatro: sete −, "saldo: −7".'),
        },
        {
          texto: '7', fala: 'Sete.', erro: 'menos-com-menos-na-soma',
          explica: 'Duas dívidas não viram dinheiro. São 7 fichas −, nenhuma +: −7.',
          mostra: saldo({ negativas: 7, mostraSaldo: true }, 'Sete fichas −, nenhuma +: "saldo: −7".'),
        },
        {
          texto: '−1', fala: 'Menos um.', erro: 'anda-para-o-lado-errado',
          explica: 'Assim a dívida teria diminuído. Ela cresceu: 4 − e mais 3 −, são 7 −.',
          mostra: saldo({ negativas: 7, mostraSaldo: true }, 'As sete fichas −: a dívida cresceu.'),
        },
      ],
      esboco: 'O outro momento-chave: dívida mais dívida é mais dívida. "Menos com menos dá mais" não vale aqui.',
    },
    {
      tipo: 'anote',
      titulo: 'Somar e subtrair na reta',
      definicao: 'Somar um positivo: ande para a **direita**. Subtrair um positivo ou somar um negativo: ande para a **esquerda**.',
      exemplo: { tex: '3 - 5 = -2 \\qquad (-4) + (-3) = -7', fala: 'três menos cinco dá menos dois; menos quatro mais menos três dá menos sete' },
      alerta: 'Dívida mais dívida é mais dívida: (−4) + (−3) = **−7**, não 7.',
      esboco: 'Na página: a reta com os arcos de 3 − 5 e de 2 + (−3), e as sete fichas − de (−4) + (−3).',
    },
    {
      tipo: 'passo',
      problema: 'Sua conta tinha **R$ 40**. Você pagou um boleto de **R$ 65**. Qual é o saldo agora?',
      fala: 'Sua conta tinha quarenta reais. Você pagou um boleto de sessenta e cinco reais. Qual é o saldo agora?',
      visual: reta({ ...CONTA, numeros: [40] }, 'A reta de −30 a 50, de 5 em 5, com 0 e 40 escritos e o ponto âmbar no 40.'),
      passos: [
        {
          pergunta: 'Pagar é tirar. Que conta dá o saldo?',
          opcoes: [
            { texto: '40 − 65', fala: 'quarenta menos sessenta e cinco', certa: true, explica: 'Isso. Você tinha 40 e saíram 65.', mostra: reta({ ...CONTA, numeros: [40], comparacoes: ['40 − 65'] }, 'Embaixo da reta aparece 40 − 65.') },
            { texto: '65 − 40', fala: 'sessenta e cinco menos quarenta', explica: 'Essa conta começa nos 65. Você começou com 40 e tirou 65: 40 − 65.' },
            { texto: '40 + 65', fala: 'quarenta mais sessenta e cinco', erro: 'anda-para-o-lado-errado', explica: 'Pagar um boleto não aumenta o saldo. Os 65 saem: 40 − 65.' },
          ],
          linha: { tex: '40 - 65', fala: 'quarenta menos sessenta e cinco' },
        },
        {
          pergunta: 'Ande 40 para a esquerda, até o zero. Quanto ainda falta andar?',
          opcoes: [
            { texto: '25', fala: 'vinte e cinco', certa: true, explica: 'Isso. Dos 65, 40 já foram: faltam $65 - 40 = 25$.', mostra: reta({ ...CONTA, saltos: [[40, 0, '−40']] }, 'O arco do 40 até o 0, com "−40" em cima.') },
            { texto: '65', fala: 'sessenta e cinco', explica: 'Os 40 passos até o zero já contam. Dos 65, faltam 25.', mostra: reta({ ...CONTA, saltos: [[40, 0, '−40']] }, 'O arco do 40 até o 0.') },
          ],
          linha: { tex: '40 - 40 = 0;\\ \\text{faltam } 25', fala: 'quarenta menos quarenta dá zero; faltam vinte e cinco' },
        },
        {
          pergunta: 'Depois do zero, 25 para a esquerda. Qual é o saldo?',
          opcoes: [
            { texto: 'R$ −25', fala: 'menos vinte e cinco reais', certa: true, explica: 'Isso. O boleto passou do que você tinha: você ficou devendo R$ 25.', mostra: reta({ ...CONTA, saltos: [[40, 0, '−40'], [0, -25, '−25']], comparacoes: ['40 − 65 = −25'] }, 'O segundo arco, do 0 ao −25, já no azul; embaixo, 40 − 65 = −25.') },
            { texto: 'R$ 25', fala: 'vinte e cinco reais', erro: 'esquece-sinal-do-resultado', explica: 'R$ 25 seria dinheiro na conta. Você passou do zero: está devendo, −25.', mostra: reta({ ...CONTA, saltos: [[40, 0, '−40'], [0, -25, '−25']] }, 'Os dois arcos: o segundo termina no lado azul.') },
          ],
          linha: { tex: '0 - 25 = -25', fala: 'zero menos vinte e cinco dá menos vinte e cinco' },
        },
      ],
      esboco: 'A conta passa do zero em dois saltos: até o zero e depois dele. É a mesma de 3 − 5, com números maiores.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: o térreo é o andar 0. O elevador está no **1º andar** e desce **4 andares**. Em que andar ele para?',
      fala: 'No papel: o térreo é o andar zero. O elevador está no primeiro andar e desce quatro andares. Em que andar ele para?',
      resposta: -3,
      sinal: true,
      resolucao: [
        { tex: '1 - 4', fala: 'um menos quatro' },
        { tex: '1 - 1 = 0;\\ \\text{faltam } 3', fala: 'um menos um dá zero; faltam três' },
        { tex: '0 - 3 = -3', fala: 'zero menos três dá menos três: o terceiro subsolo' },
      ],
      esboco: 'Os andares de subsolo são os negativos. A reta fica de pé.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['somar-subtrair-reta-n1', 'somar-subtrair-reta-n2', 'somar-subtrair-reta-n3'],
      esboco: 'Nível 1: subtrair passando do zero, ou somar a um negativo, com a reta. Nível 2: somar um negativo e dívida mais dívida, sem desenho. Nível 3: temperatura, saldo, elevador e mergulho.',
    },
    {
      tipo: 'fecho',
      texto: 'Marca **−2 °C**: 3 − 5 passa do zero. Na próxima aula: o que acontece quando se **tira** um negativo.',
      fala: 'Marca menos dois graus: três menos cinco passa do zero. Na próxima aula: o que acontece quando se tira um negativo.',
      visual: reta({ ...T35, saltos: [[3, 0, '−3'], [0, -2, '−2']], comparacoes: ['3 − 5 = −2'] }, 'Os dois arcos do gancho, do 3 ao 0 e do 0 ao −2, com 3 − 5 = −2 embaixo.'),
      esboco: 'Responde ao gancho com a caminhada.',
    },
  ],
}
