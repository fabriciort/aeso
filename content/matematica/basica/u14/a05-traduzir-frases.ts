import type { Aula, Visual } from '@/lib/formation/schema'

// Traduzir frases. O número que não sabemos vira x, e cada palavra vira a
// sua conta: o dobro é 2x, o triplo é 3x, a metade é x/2, o sucessor é
// x + 1, "3 a mais que x" é x + 3, "3 a menos que x" é x − 3. O
// momento-chave: a ordem das palavras decide a ordem das contas, e os
// parênteses. "O dobro de um número menos 3" dobra primeiro e tira 3
// depois: 2x − 3. Para tirar o 3 antes, a frase teria de dizer "o dobro da
// diferença entre um número e 3": 2(x − 3). Com o número 10, uma leitura dá
// 17 e a outra, 14. A missão fecha a unidade: a corrida de aplicativo,
// R$ 5 mais R$ 2 por km, é 5 + 2x; com 8 km, R$ 21.

const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const FRASE = 'o dobro de um número menos 3'

/** A tabela da corrida: km, o que se paga pelos km e o preço da corrida. */
const corrida = (km: (number | string)[], pelosKm: (number | string)[], preco: (number | string)[], esboco: string, extra: Record<string, unknown> = {}): Visual => ({
  modelo: 'livre',
  estado: {
    tabela: {
      linhas: [
        { rotulo: 'km', valores: km },
        { rotulo: 'pelos km (R$)', valores: pelosKm },
        { rotulo: 'preço (R$)', valores: preco },
      ],
      ...extra,
    },
  },
  esboco,
})
const CORRIDA_X = (pelosKm: string, preco: string) =>
  corrida([1, 2, 3, 'x'], [2, 4, 6, pelosKm], [7, 9, 11, preco], `A tabela da corrida: 1, 2 e 3 km; pelos km, R$ 2, R$ 4 e R$ 6; com os R$ 5 de começar, R$ 7, R$ 9 e R$ 11. Na última coluna, x km: ${pelosKm} e ${preco}.`)
const CORRIDA_8 = (esboco: string) => corrida([1, 2, 3, 8], [2, 4, 6, 16], [7, 9, 11, 21], esboco, { destaque: [3] })

export const aula: Aula = {
  id: 'B.U14.A5',
  titulo: 'Traduzir frases',
  objetivo: 'Escrever como expressão frases como "o dobro de um número menos 3" (2x − 3), "3 a menos que x" (x − 3) e "a soma de um número com 5, vezes 2" (2(x + 5)), pondo parênteses só quando a frase pede uma conta antes; e montar e calcular o preço de uma corrida (5 + 2x).',
  modelo: 'livre',
  esboco: 'Abre com uma frase e duas contas: com o número 10, Bia acha 17 e Caio, 14. O aluno decide quem leu certo. Momento-chave: a frase dobra o número primeiro e tira 3 depois (2x − 3); para Caio estar certo, ela teria de dizer "o dobro da diferença", e o aluno põe as contas na ordem dessa outra frase (− 3, depois × 2). Depois o dicionário (dobro, triplo, metade, sucessor), "3 a menos que", a soma vezes 2, e a missão da corrida de aplicativo, que fecha a unidade.',
  vega: 'Ideia central: para traduzir uma frase, troque o número desconhecido por x e cada palavra pela sua conta, na ordem que a frase manda. O dobro de x é 2x; o triplo, 3x; a metade, x/2; o sucessor, x + 1; "3 a mais que x", x + 3; "3 a menos que x", x − 3. Parênteses só quando a frase pede uma conta antes de outra: "o dobro de um número menos 3" é 2x − 3 (dobra, depois tira); "o dobro da diferença entre um número e 3" é 2(x − 3); "a soma de um número com 5, vezes 2" é 2(x + 5). Corrida: R$ 5 fixos mais R$ 2 por km é 5 + 2x; com 8 km, 5 + 16 = 21. Erros esperados: parênteses errados (2(x − 3) para a primeira frase), 3 − x para "3 a menos que x", 2x para "a metade", x + 3 para "o triplo", esquecer o valor fixo (2x), somar antes ((5 + 2) · 8 = 56). Guie com "Faça com o número 10: qual conta vem primeiro?", "Com 0 km, quanto custa?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Pediram **o dobro de um número menos 3**, com o número 10. Bia achou 17. Caio achou 14. Quem leu a frase certo?',
      fala: 'Pediram o dobro de um número menos três, com o número dez. Bia achou dezessete. Caio achou catorze. Quem leu a frase certo?',
      visual: expr(['com o número 10', FRASE], 'A frase grande, e em cima, menor, "com o número 10". Ainda sem conta.'),
      esboco: 'Uma frase, duas contas. A pergunta é de leitura, não de cálculo: as duas contas estão certas, só uma é a da frase.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quem fez a conta que a frase pede?',
      visual: expr(['com o número 10', FRASE], 'A mesma frase.'),
      opcoes: [
        {
          texto: 'Bia: ${2 \\cdot 10 - 3 = 17}$', certa: true,
          explica: 'Isso. A frase fala do **dobro de um número**, e só depois do 3: dobra primeiro, tira 3 depois.',
          fala: 'Isso. A frase fala do dobro de um número, e só depois do três: dobra primeiro, tira três depois.',
          mostra: expr(['o dobro de 10, menos 3', '20 − 3 = 17'], 'A conta da Bia: primeiro o dobro, 20; depois menos 3, 17.'),
        },
        {
          texto: 'Caio: ${2 \\cdot (10 - 3) = 14}$', erro: 'traduz-parenteses-errados',
          explica: 'Caio tirou o 3 antes de dobrar. A frase dobra **o número**, e o 3 vem depois: ${20 - 3 = 17}$.',
          fala: 'Caio tirou o três antes de dobrar. A frase dobra o número, e o três vem depois: vinte menos três, dezessete.',
          mostra: expr(['o dobro de (10 − 3)', '2 · 7 = 14'], 'A conta do Caio: primeiro 10 − 3, depois o dobro. Não é o que a frase diz.'),
        },
      ],
      esboco: 'As duas leituras aparecem com números. A frase dita na ordem natural dobra primeiro.',
    },
    {
      tipo: 'mexa',
      texto: 'Para Caio estar certo, a frase teria de ser **o dobro da diferença entre um número e 3**. Qual conta vem primeiro?',
      fala: 'Para Caio estar certo, a frase teria de ser o dobro da diferença entre um número e três. Qual conta vem primeiro?',
      visual: {
        modelo: 'livre',
        estado: { expressao: ['o dobro da diferença entre x e 3'], fichas: ['× 2', '− 3'], lugares: ['1º', '2º'] },
        esboco: 'A frase do Caio em cima. Embaixo, dois lugares (1º e 2º) e as fichas × 2 e − 3, soltas. A diferença tem de vir antes do dobro.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas contas na ordem em que a frase manda.',
        sucesso: { ordem: ['− 3', '× 2'] },
        mostre: 'O − 3 vai para o 1º lugar e o × 2 para o 2º: primeiro a diferença, depois o dobro.',
      },
      descoberta: 'Nessa frase, tirar 3 vem antes de dobrar. A conta que vem antes vai para dentro dos parênteses: 2(x − 3).',
      esboco: 'O momento-chave: a ordem das palavras decide a ordem das contas. Quem toca × 2 primeiro vê o palco balançar.',
    },
    {
      tipo: 'ideia',
      texto: 'A conta que vem antes fica nos parênteses: ${2(x - 3)}$. Na frase da Bia, o dobro vem antes: ${2x - 3}$.',
      fala: 'A conta que vem antes fica nos parênteses: dois, abre parênteses, x menos três. Na frase da Bia, o dobro vem antes: dois x menos três.',
      visual: expr(['o dobro da diferença: 2(x − 3)', 'o dobro de x, menos 3: 2x − 3'], 'As duas leituras, cada uma com a sua expressão: o dobro da diferença, 2(x − 3), em cima; a da Bia, 2x − 3, embaixo, maior.'),
      esboco: 'As duas leituras lado a lado, cada uma com a sua frase. Vírgula e "da diferença" mudam a conta.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada palavra vira uma conta. O dobro é ${2x}$. E o triplo, a metade e o sucessor (o número seguinte)?',
      fala: 'Cada palavra vira uma conta. O dobro é dois x. E o triplo, a metade e o sucessor, o número seguinte?',
      visual: {
        modelo: 'livre',
        estado: { fichas: ['x + 1', '3x', 'x/2', '2x'], lugares: ['o dobro', 'o triplo', 'a metade', 'o sucessor'] },
        esboco: 'Quatro lugares com as palavras em cima (o dobro, o triplo, a metade, o sucessor) e quatro fichas soltas: x + 1, 3x, x/2, 2x.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas expressões na ordem das palavras.',
        sucesso: { ordem: ['2x', '3x', 'x/2', 'x + 1'] },
        mostre: 'As fichas vão para os lugares: 2x no dobro, 3x no triplo, x/2 na metade e x + 1 no sucessor.',
      },
      descoberta: 'O dobro e o triplo multiplicam (2x, 3x), a metade divide (x/2) e o sucessor soma 1 (x + 1).',
      esboco: 'O dicionário da tradução. A barra da metade é a divisão da unidade 7: x/2 é x dividido por 2.',
    },
    {
      tipo: 'anote',
      titulo: 'Traduzir uma frase',
      definicao: 'Troque o número desconhecido por **x** e cada palavra pela sua conta, **na ordem que a frase manda**.',
      exemplo: { tex: '\\text{o dobro de um número, menos 3} \\;\\to\\; 2x - 3', fala: 'o dobro de um número, menos três, vira dois x menos três' },
      alerta: 'Parênteses só se a frase pede uma conta antes: **o dobro da diferença** entre x e 3 é ${2(x - 3)}$.',
      esboco: 'Na página: o dicionário (dobro 2x, triplo 3x, metade x/2, sucessor x + 1) e as duas frases do 3, cada uma com a sua expressão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Rui tem **x** anos. A irmã tem **3 anos a menos que ele**. Como se escreve a idade dela?',
      fala: 'Rui tem x anos. A irmã tem três anos a menos que ele. Como se escreve a idade dela?',
      visual: expr(['Rui: x anos', 'irmã: ?'], 'A idade do Rui em cima, menor; embaixo, grande, "irmã: ?".'),
      opcoes: [
        {
          texto: '$3 - x$', erro: 'inverte-ordem-da-subtracao',
          explica: 'Com x = 40, ${3 - 40}$ dá −37. O 3 sai da idade dele: ${40 - 3 = 37}$, ou seja, ${x - 3}$.',
          fala: 'Com x igual a quarenta, três menos quarenta dá menos trinta e sete. O três sai da idade dele: quarenta menos três, trinta e sete, ou seja, x menos três.',
          mostra: { modelo: 'reta', estado: { de: 30, ate: 45, marcas: [37, 40], saltos: [[40, 37, '−3']] }, esboco: 'Com x = 40: na reta, um salto de 3 para trás, de 40 até 37.' },
        },
        {
          texto: '$x - 3$', certa: true,
          explica: 'Isso. Se Rui tem 40 anos, ela tem ${40 - 3 = 37}$. O 3 sai da idade dele.',
          fala: 'Isso. Se Rui tem quarenta anos, ela tem quarenta menos três, trinta e sete. O três sai da idade dele.',
          mostra: { modelo: 'reta', estado: { de: 30, ate: 45, marcas: [37, 40], saltos: [[40, 37, '−3']] }, esboco: 'Com x = 40: na reta, um salto de 3 para trás, de 40 até 37.' },
        },
        {
          texto: '$x + 3$',
          explica: 'Assim ela teria 3 anos **a mais**. A menos, tira: ${x - 3}$.',
          fala: 'Assim ela teria três anos a mais. A menos, tira: x menos três.',
          mostra: { modelo: 'reta', estado: { de: 30, ate: 45, marcas: [37, 40, 43], saltos: [[40, 37, '−3']] }, esboco: 'Com x = 40: o salto vai para trás, até 37, não para a frente, até 43.' },
        },
      ],
      esboco: 'A armadilha da ordem das palavras: o 3 aparece antes na frase, mas sai depois na conta. Com x = 40, a reta mostra o salto para trás.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Como se escreve **a soma de um número com 5, vezes 2**?',
      fala: 'Como se escreve a soma de um número com cinco, vezes dois?',
      visual: expr(['a soma de um número com 5, vezes 2'], 'A frase grande, sozinha.'),
      opcoes: [
        {
          texto: '$x + 5 \\cdot 2$', erro: 'traduz-parenteses-errados',
          explica: 'Sem parênteses, o vezes vem antes: só o 5 seria dobrado. A soma vem primeiro: ${2(x + 5)}$.',
          fala: 'Sem parênteses, o vezes vem antes: só o cinco seria dobrado. A soma vem primeiro: dois, abre parênteses, x mais cinco.',
          mostra: expr(['com x = 1:', '1 + 5 · 2 = 11', '(1 + 5) · 2 = 12'], 'Com x = 1: sem parênteses dá 11; a frase pede 12.'),
        },
        {
          texto: '$2(x + 5)$', certa: true,
          explica: 'Isso. A soma vem antes e fica nos parênteses. O 2 multiplica tudo.',
          fala: 'Isso. A soma vem antes e fica nos parênteses. O dois multiplica tudo.',
          mostra: expr(['x + 5', '(x + 5) · 2', '2(x + 5)'], 'A frase se monta: primeiro x + 5, depois tudo vezes 2, e no fim 2(x + 5).'),
        },
        {
          texto: '$2x + 5$', erro: 'traduz-parenteses-errados',
          explica: 'Assim o número é dobrado antes de somar 5. A frase soma primeiro: ${2(x + 5)}$.',
          fala: 'Assim o número é dobrado antes de somar cinco. A frase soma primeiro: dois, abre parênteses, x mais cinco.',
          mostra: expr(['x + 5', '(x + 5) · 2', '2(x + 5)'], 'A frase se monta: primeiro x + 5, depois tudo vezes 2.'),
        },
      ],
      esboco: 'A vírgula e o "vezes 2" no fim: a multiplicação vale para a soma inteira. Pela distributiva da aula passada, 2(x + 5) = 2x + 10.',
    },
    {
      tipo: 'passo',
      problema: 'Missão: uma corrida de aplicativo custa **R$ 5** para começar e **R$ 2** por km. Escreva o preço de x km.',
      fala: 'Missão: uma corrida de aplicativo custa cinco reais para começar e dois reais por quilômetro. Escreva o preço de x quilômetros.',
      visual: CORRIDA_X('?', '?'),
      passos: [
        {
          pergunta: 'Quanto custam só os x km, a **R$ 2** cada?',
          fala: 'Quanto custam só os x quilômetros, a dois reais cada?',
          opcoes: [
            { texto: '$x + 2$', erro: 'vezes-como-mais', explica: 'Cada km custa R$ 2: 3 km são ${2 \\cdot 3 = 6}$, não ${3 + 2}$. Os x km custam ${2x}$.', fala: 'Cada quilômetro custa dois reais: três quilômetros são dois vezes três, seis, não três mais dois. Os x quilômetros custam dois x.', mostra: CORRIDA_X('?', '?') },
            { texto: '$2x$', certa: true, explica: 'Isso. R$ 2 vezes x km: ${2x}$.', fala: 'Isso. Dois reais vezes x quilômetros: dois x.', mostra: CORRIDA_X('2x', '?') },
          ],
          linha: { tex: '\\text{os km: } 2x', fala: 'os quilômetros: dois x' },
        },
        {
          pergunta: 'E o preço da corrida inteira?',
          opcoes: [
            { texto: '$2x$', erro: 'esquece-valor-fixo', explica: 'Faltou o R$ 5 de começar: com 1 km, a tabela dá R$ 7, não R$ 2.', fala: 'Faltou o cinco reais de começar: com um quilômetro, a tabela dá sete reais, não dois.', mostra: CORRIDA_X('2x', '5 + 2x') },
            { texto: '$7x$', explica: 'Assim cada km custaria R$ 7: 3 km dariam R$ 21, e a tabela diz R$ 11. Os R$ 5 se pagam uma vez só.', fala: 'Assim cada quilômetro custaria sete reais: três quilômetros dariam vinte e um, e a tabela diz onze. Os cinco reais se pagam uma vez só.', mostra: CORRIDA_X('2x', '5 + 2x') },
            { texto: '$5 + 2x$', certa: true, explica: 'Isso. R$ 5 uma vez, mais R$ 2 por km. Com 3 km: ${5 + 6 = 11}$, como na tabela.', fala: 'Isso. Cinco reais uma vez, mais dois reais por quilômetro. Com três quilômetros: cinco mais seis, onze, como na tabela.', mostra: CORRIDA_X('2x', '5 + 2x') },
          ],
          linha: { tex: '\\text{preço} = 5 + 2x', fala: 'preço é cinco mais dois x' },
        },
        {
          pergunta: 'Com **8 km**, quanto custa a corrida?',
          fala: 'Com oito quilômetros, quanto custa a corrida?',
          opcoes: [
            { texto: 'R$ 56', erro: 'ignora-prioridade', explica: '${(5 + 2) \\cdot 8}$ soma antes de multiplicar. O vezes vem primeiro: ${5 + 16 = 21}$.', fala: 'Cinco mais dois, vezes oito, soma antes de multiplicar. O vezes vem primeiro: cinco mais dezesseis, vinte e um.', mostra: CORRIDA_8('A última coluna vira 8 km e R$ 21.') },
            { texto: 'R$ 16', erro: 'esquece-valor-fixo', explica: '${2 \\cdot 8 = 16}$ são só os km. Falta o R$ 5 de começar: ${5 + 16 = 21}$.', fala: 'Dois vezes oito, dezesseis, são só os quilômetros. Falta o cinco reais de começar: cinco mais dezesseis, vinte e um.', mostra: CORRIDA_8('A última coluna vira 8 km e R$ 21.') },
            { texto: 'R$ 21', certa: true, explica: 'Isso. Troque o x por 8: ${5 + 2 \\cdot 8 = 5 + 16 = 21}$.', fala: 'Isso. Troque o x por oito: cinco mais dois vezes oito, cinco mais dezesseis, vinte e um.', mostra: CORRIDA_8('A última coluna vira 8 km e R$ 21, em destaque.') },
          ],
          linha: { tex: '5 + 2 \\cdot 8 = 5 + 16 = 21', fala: 'cinco mais dois vezes oito, cinco mais dezesseis, vinte e um' },
        },
      ],
      esboco: 'A missão junta a unidade: traduzir (2x e 5 + 2x) e calcular o valor numérico na ordem (5 + 2 · 8). A tabela confere cada passo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um táxi cobra **R$ 4** mais **R$ 3** por km. Escreva o preço com x km e calcule para **6 km**.',
      fala: 'No papel: um táxi cobra quatro reais mais três reais por quilômetro. Escreva o preço com x quilômetros e calcule para seis quilômetros.',
      resposta: 22,
      resolucao: [
        { tex: '\\text{preço} = 4 + 3x', fala: 'preço é quatro mais três x' },
        { tex: 'x = 6: \\quad 4 + 3 \\cdot 6 = 4 + 18 = 22', fala: 'com x igual a seis: quatro mais três vezes seis, quatro mais dezoito, vinte e dois' },
        { tex: '\\text{a corrida custa 22 reais}', fala: 'a corrida custa vinte e dois reais' },
      ],
      esboco: 'A missão de novo, sozinho: traduzir e calcular.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['traduzir-frases-n1', 'traduzir-frases-n2', 'traduzir-frases-n3'],
      esboco: 'Nível 1: uma palavra só (dobro, triplo, metade, sucessor, a mais, a menos), em escolha. Nível 2: as frases com e sem parênteses, em escolha ou com um número. Nível 3: preços e idades, calculados com um número dado.',
    },
    {
      tipo: 'fecho',
      texto: 'Bia leu certo: ${2 \\cdot 10 - 3 = 17}$. Você fechou a unidade: letras, valor, termos, distributiva e frases. A seguir: equações.',
      fala: 'Bia leu certo: dois vezes dez menos três, dezessete. Você fechou a unidade: letras, valor, termos, distributiva e frases. A seguir: equações.',
      visual: expr(['o dobro de um número, menos 3', '2x − 3'], 'A frase em cima, menor, e embaixo, grande, 2x − 3.'),
      esboco: 'Responde ao gancho, fecha a unidade e anuncia as equações (a balança), onde a frase vira uma igualdade.',
    },
  ],
}
