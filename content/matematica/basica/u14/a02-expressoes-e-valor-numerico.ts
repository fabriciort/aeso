import type { Aula, Visual } from '@/lib/formation/schema'

// Valor numérico: trocar a letra por um número e fazer a conta, na ordem das
// operações da unidade 5. O táxi cobra R$ 3 para começar e R$ 2 por km: a
// corrida de x km custa 2x + 3. Com x = 5, 2 · 5 + 3 = 13, e não 28 (de
// "25 + 3", o 2 colado no 5) nem 25 (somar antes de multiplicar). A tabela
// das corridas confirma o 13 sem conta nenhuma. Momento-chave: ao trocar a
// letra, o vezes escondido volta e a conta segue a ordem; com um número
// negativo, ele entra entre parênteses: com x = −2, 3x = 3 · (−2) = −6, e
// não 3 − 2 = 1.

const exp = (expressao: string[], esboco: string, destaque?: string): Visual => ({ modelo: 'livre', estado: { expressao, ...(destaque ? { destaque } : {}) }, esboco })

/** As corridas de 1 a 5 km: R$ 5, 7, 9, 11 e 13, com "+ 2" embaixo de cada passo. */
const CORRIDAS = (extra: Record<string, unknown>, esboco: string): Visual => ({
  modelo: 'livre',
  estado: {
    tabela: {
      linhas: [
        { rotulo: 'km', valores: [1, 2, 3, 4, 5] },
        { rotulo: 'preço (R$)', valores: [5, 7, 9, 11, 13] },
      ],
      setas: [0, 1, 2, 3].map((i) => ({ de: i, para: i + 1, rotulo: '+ 2', embaixo: true })),
      ...extra,
    },
  },
  esboco,
})

const TAXI = exp(['2x + 3', '2 · 5 + 3', '10 + 3', '13'], 'A expressão encolhe linha a linha: 2x + 3, depois 2 · 5 + 3, 10 + 3 e, grande, 13.')
const TRES_MAIS = exp(['3 + 4x', '3 + 4 · 2', '3 + 8', '11'], 'A expressão encolhe linha a linha: 3 + 4x, 3 + 4 · 2, 3 + 8 e, grande, 11.')
const NEGATIVO = exp(['3x', '3 · (−2)', '−6'], 'Três linhas: 3x, depois 3 · (−2) com os parênteses em destaque e, grande, −6.')

export const aula: Aula = {
  id: 'B.U14.A2',
  titulo: 'Expressões e valor numérico',
  objetivo: 'Calcular o valor numérico de uma expressão com uma letra: trocar a letra pelo número (com parênteses quando ele é negativo), escrever o vezes escondido e fazer a conta na ordem das operações.',
  modelo: 'livre',
  esboco: 'Abre no táxi: R$\u00a03 para começar e R$\u00a02 por km, a corrida de x km custa 2x + 3. Quanto custa a de 5\u00a0km? Aposta: 13, 28 ou 25. A tabela das corridas confirma o 13 sem conta. O anote dá o nome: valor numérico. Depois a ordem das operações em 3 + 4x, e o número negativo, que entra entre parênteses. Momento-chave: trocar a letra e fazer a conta na ordem; o −2 no lugar do x vira 3 · (−2), e não 3 − 2. O passo a passo junta tudo em 5 − 2x com x = −3.',
  vega: 'Ideia central: o valor numérico de uma expressão é o número que ela dá quando trocamos a letra por um número e fazemos a conta. Ao trocar, o vezes escondido volta (2x vira 2 · 5) e a conta segue a ordem das operações (potências, depois × e ÷, depois + e −). Um número negativo entra entre parênteses: 3x com x = −2 é 3 · (−2) = −6. Erros esperados: colar os algarismos (2x + 3 com x = 5 dá 25 + 3 = 28, é 13); somar antes de multiplicar ((2 + 3) · 5 = 25); trocar sem parênteses (3 − 2 = 1); perder o sinal (6); tirar um negativo como positivo (5 − (−6) = −1). Guie com "Escreva a conta com o número no lugar da letra, sem resolver", "Onde está o vezes escondido?", "O que vem primeiro?". Não junte ainda termos com letra (aula 3).',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um táxi cobra **R$\u00a03** para começar e **R$\u00a02** por km. A corrida de $x$\u00a0km custa ${2x + 3}$ reais. E a de **5** km?',
      fala: 'Um táxi cobra três reais para começar e dois reais por quilômetro. A corrida de x quilômetros custa dois x mais três reais. E a de cinco quilômetros?',
      visual: exp(['2x + 3'], 'A expressão sozinha, grande: o preço de qualquer corrida.'),
      esboco: 'A expressão já tem sentido: 2x são os km, o 3 é a partida. A pergunta pede um número.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Troque o $x$ por 5. Quanto vale ${2x + 3}$?',
      fala: 'Troque o x por cinco. Quanto vale dois x mais três?',
      visual: exp(['x = 5', '2x + 3'], 'Em cima, pequeno, x = 5; embaixo, grande, 2x + 3.'),
      opcoes: [
        {
          texto: '13', certa: true,
          explica: 'Isso. $2x$ é ${2 \\cdot 5 = 10}$, e ${10 + 3 = 13}$: R$\u00a013.',
          fala: 'Isso. Dois x é dois vezes cinco, dez, e dez mais três, treze: treze reais.',
          mostra: TAXI,
        },
        {
          texto: '28', erro: 'junta-algarismos-com-a-letra',
          explica: '28 vem de ${25 + 3}$: o 2 colado no 5. Mas $2x$ é ${2 \\cdot 5 = 10}$. Dá 13.',
          fala: 'Vinte e oito vem de vinte e cinco mais três: o dois colado no cinco. Mas dois x é dois vezes cinco, dez. Dá treze.',
          mostra: TAXI,
        },
        {
          texto: '25', erro: 'ignora-prioridade',
          explica: '25 é ${(2 + 3) \\cdot 5}$: somou antes. A multiplicação vem primeiro: ${2 \\cdot 5 + 3 = 13}$.',
          fala: 'Vinte e cinco é dois mais três, vezes cinco: somou antes. A multiplicação vem primeiro: dois vezes cinco mais três, treze.',
          mostra: TAXI,
        },
      ],
      esboco: 'O primeiro valor numérico. Todas as opções mostram a conta encolher linha a linha até o 13.',
    },
    {
      tipo: 'mexa',
      texto: 'Confira sem a conta: cada km a mais soma R$\u00a02. Complete a tabela até 5\u00a0km.',
      fala: 'Confira sem a conta: cada quilômetro a mais soma dois reais. Complete a tabela até cinco quilômetros.',
      visual: CORRIDAS({ completar: true, mostradas: 1 }, 'A tabela começa com 1\u00a0km e R$\u00a05 (3 da partida e 2 do km). Cada toque preenche uma coluna: 7, 9, 11, 13, com "+ 2" embaixo de cada passo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para mais 1\u00a0km.',
        sucesso: { colunas: 5 },
        mostre: 'As colunas se preenchem até 5\u00a0km: R$\u00a07, 9, 11 e 13, com "+ 2" embaixo de cada passo.',
      },
      descoberta: 'A corrida de 5\u00a0km custa R$\u00a013, o mesmo número que a conta 2 · 5 + 3 deu. A expressão diz o que a tabela diz.',
      esboco: 'A tabela é a prova concreta: o 13 aparece sem expressão nenhuma. O 28 e o 25 não aparecem em lugar nenhum.',
    },
    {
      tipo: 'anote',
      titulo: 'Valor numérico',
      definicao: 'O **valor numérico** de uma expressão é o número que ela dá quando trocamos a letra por um número e fazemos a conta.',
      exemplo: { tex: 'x = 5\\text{:} \\quad 2x + 3 = 2 \\cdot 5 + 3 = 13', fala: 'com x igual a cinco, dois x mais três é dois vezes cinco mais três, igual a treze' },
      alerta: 'A conta segue a ordem: primeiro × e ÷, depois + e −. Com ${x = 5}$, ${2x + 3}$ dá 13, não 28.',
      esboco: 'Na página: 2x + 3 com uma seta do 5 para o lugar do x, e a conta em linhas, cada uma começando com "=".',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora ${3 + 4x}$ com ${x = 2}$. Quanto dá?',
      fala: 'Agora três mais quatro x, com x igual a dois. Quanto dá?',
      visual: exp(['x = 2', '3 + 4x'], 'Em cima, pequeno, x = 2; embaixo, grande, 3 + 4x.'),
      opcoes: [
        {
          texto: '11', certa: true,
          explica: 'Isso. Primeiro ${4 \\cdot 2 = 8}$, depois ${3 + 8 = 11}$.',
          fala: 'Isso. Primeiro quatro vezes dois, oito, depois três mais oito, onze.',
          mostra: TRES_MAIS,
        },
        {
          texto: '14', erro: 'ignora-prioridade',
          explica: '14 é ${(3 + 4) \\cdot 2}$. O $4x$ é uma multiplicação: vem antes. ${3 + 8 = 11}$.',
          fala: 'Catorze é três mais quatro, vezes dois. O quatro x é uma multiplicação: vem antes. Três mais oito, onze.',
          mostra: TRES_MAIS,
        },
        {
          texto: '45', erro: 'junta-algarismos-com-a-letra',
          explica: '45 vem de ${3 + 42}$, o 4 colado no 2. Mas $4x$ é ${4 \\cdot 2 = 8}$: ${3 + 8 = 11}$.',
          fala: 'Quarenta e cinco vem de três mais quarenta e dois, o quatro colado no dois. Mas quatro x é quatro vezes dois, oito: três mais oito, onze.',
          mostra: TRES_MAIS,
        },
      ],
      esboco: 'A letra no fim da conta tenta a fazer da esquerda para a direita. A ordem das operações da unidade 5 decide.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E se ${x = -2}$? Quanto vale $3x$?',
      fala: 'E se x for igual a menos dois? Quanto vale três x?',
      visual: exp(['x = −2', '3x'], 'Em cima, pequeno, x = −2; embaixo, grande, 3x.'),
      opcoes: [
        {
          texto: '−6', certa: true,
          explica: 'Isso. O −2 entra entre parênteses: ${3 \\cdot (-2) = -6}$. Três dívidas de 2.',
          fala: 'Isso. O menos dois entra entre parênteses: três vezes menos dois, menos seis. Três dívidas de dois.',
          mostra: NEGATIVO,
        },
        {
          texto: '1', erro: 'letra-negativa-sem-parenteses',
          explica: '1 vem de ${3 - 2}$: o menos virou uma conta de tirar. Com parênteses: ${3 \\cdot (-2) = -6}$.',
          fala: 'Um vem de três menos dois: o menos virou uma conta de tirar. Com parênteses: três vezes menos dois, menos seis.',
          mostra: NEGATIVO,
        },
        {
          texto: '6', erro: 'esquece-sinal-do-resultado',
          explica: 'O 6 perdeu o sinal. Positivo vezes negativo dá negativo: ${3 \\cdot (-2) = -6}$.',
          fala: 'O seis perdeu o sinal. Positivo vezes negativo dá negativo: três vezes menos dois, menos seis.',
          mostra: NEGATIVO,
        },
      ],
      esboco: 'O momento-chave do negativo: o número entra no lugar da letra entre parênteses, e o vezes volta. A regra dos sinais é da unidade 12.',
    },
    {
      tipo: 'passo',
      problema: 'Calcule ${5 - 2x}$ com ${x = -3}$.',
      fala: 'Calcule cinco menos dois x, com x igual a menos três.',
      visual: exp(['x = −3', '5 − 2x'], 'Em cima, pequeno, x = −3; embaixo, grande, 5 − 2x.'),
      passos: [
        {
          pergunta: 'Como fica a conta com o −3 no lugar do $x$?',
          fala: 'Como fica a conta com o menos três no lugar do x?',
          opcoes: [
            {
              texto: '${5 - 2 \\cdot (-3)}$', certa: true,
              explica: 'Isso. O vezes escondido volta, e o −3 entra entre parênteses.',
              fala: 'Isso. O vezes escondido volta, e o menos três entra entre parênteses.',
              mostra: exp(['5 − 2x', '5 − 2 · (−3)'], 'Duas linhas: 5 − 2x e, grande, 5 − 2 · (−3).', '(−3)'),
            },
            {
              texto: '${5 - 2 - 3}$', erro: 'letra-negativa-sem-parenteses',
              explica: 'Sem parênteses, o menos do −3 vira outra conta de tirar. O $x$ multiplica: ${2 \\cdot (-3)}$.',
              fala: 'Sem parênteses, o menos do menos três vira outra conta de tirar. O x multiplica: dois vezes menos três.',
            },
            {
              texto: '${5 - 2 \\cdot 3}$',
              explica: 'O $x$ vale −3, não 3. O sinal vai junto, entre parênteses: ${2 \\cdot (-3)}$.',
              fala: 'O x vale menos três, não três. O sinal vai junto, entre parênteses: dois vezes menos três.',
            },
          ],
          linha: { tex: '5 - 2 \\cdot (-3)', fala: 'cinco menos dois vezes menos três' },
        },
        {
          pergunta: 'Qual conta vem primeiro?',
          opcoes: [
            {
              texto: '${2 \\cdot (-3) = -6}$', certa: true,
              explica: 'Isso. A multiplicação vem antes da subtração.',
              fala: 'Isso. A multiplicação vem antes da subtração.',
              mostra: exp(['5 − 2x', '5 − 2 · (−3)', '5 − (−6)'], 'A conta encolhe: 5 − 2 · (−3) vira, grande, 5 − (−6).'),
            },
            {
              texto: '${5 - 2 = 3}$', erro: 'ignora-prioridade',
              explica: 'A subtração espera. Primeiro a multiplicação: ${2 \\cdot (-3) = -6}$.',
              fala: 'A subtração espera. Primeiro a multiplicação: dois vezes menos três, menos seis.',
            },
          ],
          linha: { tex: '= 5 - (-6)', fala: 'igual a cinco menos menos seis' },
        },
        {
          pergunta: 'Quanto é ${5 - (-6)}$?',
          fala: 'Quanto é cinco menos menos seis?',
          opcoes: [
            {
              texto: '11', certa: true,
              explica: 'Isso. Tirar uma dívida de 6 é o mesmo que somar 6: ${5 + 6 = 11}$.',
              fala: 'Isso. Tirar uma dívida de seis é o mesmo que somar seis: cinco mais seis, onze.',
              mostra: exp(['5 − 2 · (−3)', '5 − (−6)', '5 + 6', '11'], 'A conta inteira em linhas, até o 11 grande.'),
            },
            {
              texto: '−1', erro: 'tirar-negativo-subtrai',
              explica: '−1 é ${5 - 6}$. Tirar −6 é tirar uma dívida: ${5 + 6 = 11}$.',
              fala: 'Menos um é cinco menos seis. Tirar menos seis é tirar uma dívida: cinco mais seis, onze.',
            },
          ],
          linha: { tex: '= 5 + 6 = 11', fala: 'igual a cinco mais seis, igual a onze' },
        },
      ],
      esboco: 'As três decisões em ordem: trocar com parênteses, multiplicar antes, e tirar um negativo. O palco anda com o caderno até o 11.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: calcule ${x^2 + 3x}$ com ${x = 4}$.',
      fala: 'No papel: calcule x ao quadrado mais três x, com x igual a quatro.',
      resposta: 28,
      resolucao: [
        { tex: '4^2 + 3 \\cdot 4', fala: 'quatro ao quadrado mais três vezes quatro' },
        { tex: '= 16 + 12', fala: 'igual a dezesseis mais doze' },
        { tex: '= 28', fala: 'igual a vinte e oito' },
      ],
      esboco: 'O x aparece duas vezes e vale 4 nas duas. A potência vem antes: 4² = 16, não 8. Quem digitar 20 fez 4² = 8.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['valor-numerico-n1', 'valor-numerico-n2', 'valor-numerico-n3'],
      esboco: 'Nível 1: ax + b e x² com x pequeno e positivo, com a expressão na tela. Nível 2: x negativo (parênteses), a letra no fim da conta (a ordem) e x² com x negativo. Nível 3: táxi, temperatura e perímetro, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'A corrida de 5\u00a0km custa ${2 \\cdot 5 + 3 = 13}$ reais. Na próxima aula: juntar $x$ com $x$, e ver o que não se junta.',
      fala: 'A corrida de cinco quilômetros custa dois vezes cinco mais três, treze reais. Na próxima aula: juntar x com x, e ver o que não se junta.',
      visual: CORRIDAS({ destaque: [4] }, 'A tabela das corridas inteira, com a coluna dos 5\u00a0km e R$\u00a013 em moldura âmbar.'),
      esboco: 'Responde ao gancho com a tabela e anuncia os termos semelhantes.',
    },
  ],
}
