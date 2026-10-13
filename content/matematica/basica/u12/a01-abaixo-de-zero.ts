import type { Aula, Visual } from '@/lib/formation/schema'

// Abaixo de zero: a reta continua para a esquerda. O termômetro deitado é a
// reta da unidade 1 com o lado esquerdo do zero aceso (sinais: true). O aluno
// põe −2 e −5 na reta e vê que −5 fica mais à esquerda: mais frio, menor.
// As distâncias até o zero (os colchetes) mostram por que −5 < −2 mesmo com
// o 5 maior que o 2, e que 4 e −4 são opostos, à mesma distância. Os erros a
// desmontar: comparar pelo número sem o sinal (negativo-maior-pelo-numero),
// esquecer o sinal (esquece-sinal-do-resultado) e ler a reta ao contrário
// (inverte-reta).

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { sinais: true, ...estado }, esboco })

/** A reta do termômetro, de −6 a 6. */
const T = { de: -6, ate: 6, passo: 1 }
/** A reta do extrato, de −100 a 20, de 10 em 10. */
const EXTRATO = { de: -100, ate: 20, passo: 10, marcas: [-100, 0] }
/** A reta da ordem, de −5 a 5. */
const ORDEM = { de: -5, ate: 5, passo: 1, marcas: [0] }

export const aula: Aula = {
  id: 'B.U12.A1',
  titulo: 'Abaixo de zero',
  objetivo: 'Pôr números negativos na reta, à esquerda do zero, e comparar e ordenar inteiros pela posição: quanto mais à esquerda, menor (−5 < −2). Reconhecer opostos (4 e −4) pela distância até o zero.',
  modelo: 'reta',
  esboco: 'O termômetro da serra marca −2 °C de manhã e −5 °C à noite. Deitado, o termômetro é a reta: o lado do zero para a esquerda acende em azul. O aluno põe −2 e −5. Momento-chave: −5 fica mais longe do zero e mais à esquerda que −2, então é menor, mesmo com o 5 maior que o 2. Os colchetes das distâncias mostram isso, e depois mostram que 4 e −4 são opostos. O extrato no vermelho e a ordem de cinco temperaturas fecham a ideia.',
  vega: 'Ideia central: a reta continua à esquerda do zero, com os negativos −1, −2, −3…; a ordem continua a mesma de sempre: quem está mais à direita é o maior. Por isso −5 < −2: o −5 está mais longe do zero, do lado esquerdo. A distância até o zero (o módulo) não tem sinal: −4 e 4 estão a 4 passos do zero, em lados contrários, e são opostos. Contextos: temperatura abaixo de zero, saldo no vermelho (dívida), andares de subsolo (o térreo é o 0). Erros esperados: comparar pelo número sem sinal ("−5 > −2"), esquecer o sinal ao ler um ponto à esquerda do zero, dar a distância com sinal (−6 em vez de 6). Guie com "Qual está mais à esquerda?", "Qual é mais frio?", "Quem deve mais?". Não use ainda regras de sinais: só a posição na reta.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na serra, o termômetro marcou **−2 °C** de manhã e **−5 °C** à noite. Qual número é maior?',
      fala: 'Na serra, o termômetro marcou menos dois graus de manhã e menos cinco graus à noite. Qual número é maior?',
      visual: reta({ ...T, marcas: [0], etiquetas: [-2, -5] }, 'A reta de −6 a 6, o lado esquerdo do zero em azul, só o 0 escrito. Em cima, as duas etiquetas −2 e −5, ainda fora do lugar.'),
      esboco: 'Quem lê "5 é maior que 2" vai apostar no −5. A pergunta fica no ar até o aluno pôr os dois na reta.',
    },
    {
      tipo: 'mexa',
      texto: 'Deite o termômetro: vira uma reta. Cada passo para a esquerda do zero é um grau a menos. Ponha **−2** e **−5** no lugar.',
      fala: 'Deite o termômetro: vira uma reta. Cada passo para a esquerda do zero é um grau a menos. Ponha menos dois e menos cinco no lugar.',
      visual: reta({ ...T, marcas: [0, 2, 4, 6], etiquetas: [-2, -5] }, 'A reta com 0, 2, 4 e 6 escritos à direita; à esquerda do zero, só os traços. As etiquetas −2 e −5 em cima.'),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Toque numa etiqueta e depois no lugar dela na reta.',
        sucesso: { posicoes: [-2, -5] },
        mostre: 'O −2 desce 2 traços à esquerda do zero; o −5, 5 traços.',
      },
      descoberta: 'Os negativos ficam à esquerda do zero, na mesma distância que os positivos ficam à direita: −2 a 2 passos, −5 a 5 passos.',
      esboco: 'O 2 escrito à direita ajuda: o −2 fica no espelho dele. Errar o lado (pôr −2 no 2) balança a reta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na reta, quem fica à direita é o maior. Qual é maior: **−5** ou **−2**?',
      fala: 'Na reta, quem fica à direita é o maior. Qual é maior: menos cinco ou menos dois?',
      visual: reta({ ...T, marcas: [-5, -2, 0] }, 'A reta com −5, −2 e 0 escritos: os dois negativos já no lugar.'),
      opcoes: [
        {
          texto: '−2', fala: 'Menos dois.', certa: true,
          explica: 'Isso. −2 está à direita de −5. À noite fez mais frio: −5 < −2.',
          mostra: reta({ ...T, marcas: [-5, -2, 0], maior: -2, comparacoes: ['−5 < −2'] }, 'O ponto do −2 acende e embaixo aparece −5 < −2.'),
        },
        {
          texto: '−5', fala: 'Menos cinco.', erro: 'negativo-maior-pelo-numero',
          explica: '5 é maior que 2, mas −5 são 5 graus abaixo de zero: mais frio. Está mais à esquerda, então é menor.',
          mostra: reta({ ...T, marcas: [-5, -2, 0], distancias: [[-5, '5 abaixo'], [-2, '2 abaixo']], comparacoes: ['−5 < −2'] }, 'Os colchetes do zero até −5 e até −2: o −5 está mais longe, à esquerda.'),
        },
      ],
      esboco: 'A regra da unidade 1 (à direita é maior) vale também do lado esquerdo. A isca é comparar o 5 com o 2.',
    },
    {
      tipo: 'ideia',
      texto: 'Do lado esquerdo, quanto **mais longe do zero**, **menor**. −5 está a 5 passos do zero; −2, a só 2.',
      fala: 'Do lado esquerdo, quanto mais longe do zero, menor. Menos cinco está a cinco passos do zero; menos dois, a só dois.',
      visual: reta({ ...T, marcas: [-5, -2, 0], distancias: [[-5, '5 passos'], [-2, '2 passos']] }, 'Os dois colchetes azuis embaixo da reta, do zero até −5 e do zero até −2.'),
      esboco: 'O momento-chave: o −5 tem o 5 maior, mas está mais longe do zero do lado de baixo. Mais longe à esquerda é menor.',
    },
    {
      tipo: 'anote',
      titulo: 'Números negativos',
      definicao: 'Os **negativos** ficam à esquerda do zero: −1, −2, −3… Na reta, quem está mais à **esquerda** é o **menor**.',
      exemplo: { tex: '-5 < -2 < 0 < 3', fala: 'menos cinco é menor que menos dois, que é menor que zero, que é menor que três' },
      alerta: '−5 é **menor** que −2, mesmo com o 5 maior que o 2. Todo negativo é menor que o zero.',
      esboco: 'Na página: a reta de −5 a 3, o lado esquerdo em azul, com −5, −2, 0 e 3 marcados e a frase −5 < −2 < 0 < 3.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E **4** e **−4**: qual dos dois está mais longe do zero?',
      fala: 'E quatro e menos quatro: qual dos dois está mais longe do zero?',
      visual: reta({ ...T, marcas: [-4, 0, 4] }, 'A reta com −4, 0 e 4 escritos.'),
      opcoes: [
        {
          texto: 'Os dois estão à mesma distância', certa: true,
          explica: 'Isso. São 4 passos para cada lado.',
          mostra: reta({ ...T, marcas: [-4, 0, 4], distancias: [[-4, '4 passos'], [4, '4 passos']] }, 'Dois colchetes do mesmo tamanho: um azul até −4, um âmbar até 4.'),
        },
        {
          texto: 'O 4',
          explica: '4 é maior que −4, mas os dois estão a 4 passos do zero, cada um de um lado.',
          mostra: reta({ ...T, marcas: [-4, 0, 4], distancias: [[-4, '4 passos'], [4, '4 passos']] }, 'Os dois colchetes iguais.'),
        },
        {
          texto: 'O −4', fala: 'O menos quatro.',
          explica: '−4 é menor, mas não está mais longe: são 4 passos para cada lado.',
          mostra: reta({ ...T, marcas: [-4, 0, 4], distancias: [[-4, '4 passos'], [4, '4 passos']] }, 'Os dois colchetes iguais.'),
        },
      ],
      esboco: 'Separa duas ideias: a posição (−4 é menor) e a distância até o zero (a mesma).',
    },
    {
      tipo: 'ideia',
      texto: '**4** e **−4** são **opostos**: a mesma distância do zero, em lados contrários. Essa distância, 4, é o **módulo** dos dois.',
      fala: 'Quatro e menos quatro são opostos: a mesma distância do zero, em lados contrários. Essa distância, quatro, é o módulo dos dois.',
      visual: reta({ ...T, marcas: [-4, 0, 4], distancias: [[-4, '4'], [4, '4']] }, 'Os dois colchetes, agora com o número 4 embaixo de cada um.'),
      esboco: 'Os nomes chegam depois da imagem. O módulo volta nas próximas aulas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O extrato de Rui mostra **R$ −30**; o de Ana, **R$ −80**. Quem tem o maior saldo?',
      fala: 'O extrato de Rui mostra menos trinta reais; o de Ana, menos oitenta reais. Quem tem o maior saldo?',
      visual: reta({ ...EXTRATO, numeros: [-80, -30] }, 'A reta de −100 a 20, de 10 em 10, com os pontos −80 e −30 em azul.'),
      opcoes: [
        {
          texto: 'Rui: R$ −30', fala: 'Rui: menos trinta reais.', certa: true,
          explica: 'Isso. Rui deve menos: o saldo dele está mais perto do zero, à direita. −80 < −30.',
          mostra: reta({ ...EXTRATO, numeros: [-80, -30], maior: -30, comparacoes: ['−80 < −30'] }, 'O −30 acende e embaixo aparece −80 < −30.'),
        },
        {
          texto: 'Ana: R$ −80', fala: 'Ana: menos oitenta reais.', erro: 'negativo-maior-pelo-numero',
          explica: 'Ana deve R$ 80; Rui, só R$ 30. Dever mais é ter menos: −80 está à esquerda de −30.',
          mostra: reta({ ...EXTRATO, numeros: [-80, -30], distancias: [[-80, 'deve 80'], [-30, 'deve 30']] }, 'Os colchetes do zero até −80 e até −30: a dívida de Ana é a mais comprida.'),
        },
      ],
      esboco: 'O saldo no vermelho é o mesmo lado esquerdo da reta. Dever mais é estar mais à esquerda.',
    },
    {
      tipo: 'passo',
      problema: 'As temperaturas do dia: **3 °C**, **−1 °C**, **0 °C**, **−4 °C** e **2 °C**. Ponha da mais fria para a mais quente.',
      fala: 'As temperaturas do dia: três graus, menos um, zero, menos quatro e dois graus. Ponha da mais fria para a mais quente.',
      visual: reta({ ...ORDEM, etiquetas: [3, -1, 0, -4, 2] }, 'A reta de −5 a 5 com só o 0 escrito; em cima, as cinco etiquetas fora de ordem.'),
      passos: [
        {
          pergunta: 'Qual é a mais fria: o menor número?',
          opcoes: [
            { texto: '−4 °C', fala: 'menos quatro graus', certa: true, explica: 'Isso. −4 é o mais à esquerda.', mostra: reta({ ...ORDEM, numeros: [-4], etiquetas: [3, -1, 0, 2] }, 'O −4 desce para a reta; as outras etiquetas ficam em cima.') },
            { texto: '−1 °C', fala: 'menos um grau', erro: 'negativo-maior-pelo-numero', explica: '−1 está a 1 passo do zero; −4, a 4. O −4 está mais à esquerda: é mais frio.', mostra: reta({ ...ORDEM, numeros: [-4, -1], distancias: [[-4, '4 abaixo'], [-1, '1 abaixo']] }, 'Os colchetes do zero até −4 e até −1.') },
            { texto: '0 °C', fala: 'zero grau', explica: 'Zero ainda é mais quente que qualquer negativo. A mais fria é −4 °C.' },
          ],
          linha: { tex: '-4', fala: 'menos quatro' },
        },
        {
          pergunta: 'E depois do −4, qual vem?',
          fala: 'E depois do menos quatro, qual vem?',
          opcoes: [
            { texto: '−1 °C', fala: 'menos um grau', certa: true, explica: 'Isso. −1 é o outro negativo, mais perto do zero.', mostra: reta({ ...ORDEM, numeros: [-4, -1], etiquetas: [3, 0, 2] }, 'O −1 desce para a reta, à direita do −4.') },
            { texto: '0 °C', fala: 'zero grau', explica: 'Antes do zero ainda vem o −1, que é negativo.' },
            { texto: '3 °C', fala: 'três graus', erro: 'inverte-reta', explica: '3 é a mais quente. A lista vai da mais fria para a mais quente: depois do −4, o −1.' },
          ],
          linha: { tex: '-4 < -1', fala: 'menos quatro é menor que menos um' },
        },
        {
          pergunta: 'E o resto, em ordem?',
          opcoes: [
            { texto: '0, 2, 3', fala: 'zero, dois, três', certa: true, explica: 'Isso. Da esquerda para a direita, até o mais quente.', mostra: reta({ ...ORDEM, numeros: [-4, -1, 0, 2, 3] }, 'Os cinco pontos na reta, da esquerda para a direita.') },
            { texto: '3, 2, 0', fala: 'três, dois, zero', erro: 'inverte-reta', explica: 'Assim a lista vira e vai do mais quente para o mais frio. Depois do −1: 0, 2, 3.' },
          ],
          linha: { tex: '-4 < -1 < 0 < 2 < 3', fala: 'menos quatro, menos um, zero, dois, três' },
        },
      ],
      esboco: 'Cada passo tira uma etiqueta de cima e a põe na reta. A ordem lida da esquerda para a direita é a ordem crescente.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: desenhe a reta de −6 a 6 e marque **−6** e **−3**. Qual dos dois é maior?',
      fala: 'No papel: desenhe a reta de menos seis a seis e marque menos seis e menos três. Qual dos dois é maior?',
      resposta: -3,
      sinal: true,
      resolucao: [
        { tex: '-3 \\text{ fica à direita de } {-6}', fala: 'menos três fica à direita de menos seis' },
        { tex: '-6 < -3', fala: 'menos seis é menor que menos três' },
      ],
      esboco: 'O desenho no papel é a reta do aluno. O teclado mostra a tecla do menos.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['abaixo-de-zero-n1', 'abaixo-de-zero-n2', 'abaixo-de-zero-n3'],
      esboco: 'Nível 1: ler o número de um traço à esquerda do zero. Nível 2: qual é maior, e a distância até o zero. Nível 3: a mais fria, o maior saldo ou o andar mais baixo, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'À noite fez mais frio: **−5 < −2**. Na próxima aula: andar na reta para somar e subtrair com negativos.',
      fala: 'À noite fez mais frio: menos cinco é menor que menos dois. Na próxima aula: andar na reta para somar e subtrair com negativos.',
      visual: reta({ ...T, marcas: [-5, -2, 0], comparacoes: ['−5 < −2'] }, 'A reta do gancho, agora com −5 e −2 no lugar e −5 < −2 embaixo.'),
      esboco: 'Responde ao gancho com a reta.',
    },
  ],
}
