import type { Aula, Visual } from '@/lib/formation/schema'

// A subtração armada é o caminho inverso do vai um: quando em cima falta,
// uma barra se abre em 10 cubos. O aluno abre a dezena com as mãos antes de
// ver o "empresta" no papel, e o caso do zero aparece como uma abertura em
// duas etapas: a centena vira 10 dezenas, e uma dezena vira 10 unidades.

type Conta = { parcelas: number[]; sinal: '+' | '−'; resultado?: string; trocas?: Record<string, string>; destaque?: string }
const conta = (c: Conta, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { conta: c }, esboco })
const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })
const C52 = { parcelas: [52, 17], sinal: '−' as const }
const C304 = { parcelas: [304, 128], sinal: '−' as const }

export const aula: Aula = {
  id: 'B.U2.A4',
  titulo: 'Subtração armada',
  objetivo: 'Armar e resolver subtrações com números até 1.000, começando pelas unidades e fazendo o desagrupamento (empresta) quando em cima falta, inclusive quando há zero no número de cima.',
  modelo: 'quadro-posicional',
  esboco: 'A conta armada no caderno quadriculado, como na aula 3. Quando em cima tem menos que embaixo, os blocos mostram a saída: uma barra se abre em 10 cubos. Na conta, o algarismo de cima é riscado e ganha um a menos, e as unidades ganham 10. Momento-chave: tocar na barra e vê-la virar 10 cubos, entendendo que 52 continua sendo 52, só que agora como 4 dezenas e 12 unidades.',
  vega: 'Ideia central: casa com casa, a partir das unidades. Se em cima tiver menos, abra 1 da casa da esquerda em 10 da casa atual: o número não muda, só a forma (52 = 4 dezenas e 12 unidades). Erros esperados: tirar o menor do maior em cada coluna (52 − 17 → 45), abrir a dezena e esquecer de diminuir a de cima (52 − 17 → 45 também, por outro caminho) e travar no zero (304 − 128). No zero, abra primeiro a centena: 304 vira 2 centenas, 9 dezenas e 14 unidades. Guie perguntando "Em cima tem o bastante?", "De onde vêm as unidades que faltam?", "Quantas dezenas ficaram depois de abrir uma?". Confira somando: o resultado mais o que tirou dá o de cima. Em Sua vez, não diga o resultado.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você tinha **R$ 52** e gastou **R$ 17**. Quanto sobrou? Vamos armar a conta.',
      fala: 'Você tinha cinquenta e dois reais e gastou dezessete. Quanto sobrou? Vamos armar a conta.',
      visual: conta(C52, 'A conta armada no caderno quadriculado: 52 em cima, 17 embaixo, o sinal de menos à esquerda e a linha do resultado vazia.'),
      esboco: 'A mesma arrumação da aula 3, agora com o sinal de menos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Nas unidades, em cima tem **2** e embaixo tem **7**. Dá para tirar 7 de 2?',
      fala: 'Nas unidades, em cima tem dois e embaixo tem sete. Dá para tirar sete de dois?',
      visual: conta({ ...C52, destaque: 'U' }, 'A coluna U acende: o 2 em cima, o 7 embaixo.'),
      opcoes: [
        {
          texto: 'Não: em cima faltam unidades', certa: true,
          explica: 'Isso. De 2 cubos não saem 7. É preciso arranjar mais unidades em cima.',
        },
        {
          texto: 'Dá: faço 7 − 2 = 5', erro: 'subtrai-menor-do-maior',
          explica: 'A conta tira o de baixo do de cima. 7 − 2 inverte tudo e daria 45, longe da resposta.',
        },
      ],
      esboco: 'Encarar o problema antes da solução. A opção errada é o erro mais comum da subtração armada.',
    },
    {
      tipo: 'mexa',
      texto: '**52** são 5 barras e 2 cubos. Abra uma barra em **10 cubos**.',
      fala: 'Cinquenta e dois são cinco barras e dois cubos. Abra uma barra em dez cubos.',
      visual: blocos({ centenas: 0, dezenas: 5, unidades: 2, desagrupar: true }, 'Cinco barras e dois cubos. As barras ficam com a borda tracejada: agora elas é que são tocáveis.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa barra.',
        sucesso: { dezenas: 4, unidades: 12 },
        mostre: 'Uma barra se parte em 10 cubos, que se juntam aos 2: ficam 4 barras e 12 cubos.',
      },
      descoberta: 'Abrir uma dezena não muda o número: 52 também é 4 dezenas e 12 unidades. Agora dá para tirar 7.',
      esboco: 'O gesto inverso do agrupamento. O total 52 continua o mesmo, só a forma muda.',
    },
    {
      tipo: 'ideia',
      texto: 'Na conta, o 5 vira **4** e o 2 vira **12**. É o **empresta**: uma dezena virou 10 unidades.',
      fala: 'Na conta, o cinco vira quatro e o dois vira doze. É o empresta: uma dezena virou dez unidades.',
      visual: conta({ ...C52, trocas: { D: '4', U: '12' }, destaque: 'U' }, 'O 5 é riscado e ganha um 4 pequeno em cima, em âmbar; o 2 é riscado e ganha um 12.'),
      esboco: 'Ligar o gesto à escrita: riscar e escrever em cima é registrar a barra aberta.',
    },
    {
      tipo: 'passo',
      problema: 'Termine: **52 − 17**.',
      fala: 'Termine: cinquenta e dois menos dezessete.',
      visual: conta({ ...C52, trocas: { D: '4', U: '12' }, destaque: 'U' }, 'A conta com as trocas. A coluna U acende.'),
      passos: [
        {
          pergunta: 'Unidades: **12 − 7**.',
          fala: 'Unidades: doze menos sete.',
          opcoes: [
            { texto: '5', certa: true, explica: 'Isso. De 12 cubos saem 7: ficam 5.', mostra: conta({ ...C52, trocas: { D: '4', U: '12' }, resultado: '5', destaque: 'D' }, 'O 5 se escreve embaixo das unidades; a luz passa para D.') },
            { texto: '19', erro: 'operacao-trocada', explica: 'Você somou. Saem 7 dos 12: ficam 5.', mostra: conta({ ...C52, trocas: { D: '4', U: '12' }, resultado: '5', destaque: 'D' }, 'O 5 se escreve embaixo das unidades.') },
          ],
          linha: { tex: '12 - 7 = 5', fala: 'doze menos sete é cinco' },
        },
        {
          pergunta: 'Dezenas: em cima ficaram quantas? Tire 1.',
          fala: 'Dezenas: em cima ficaram quantas? Tire uma.',
          opcoes: [
            { texto: '4 − 1 = 3', certa: true, explica: 'Isso. Uma barra foi aberta: ficaram 4. Resultado: **35**.', mostra: conta({ ...C52, trocas: { D: '4', U: '12' }, resultado: '35' }, 'O 3 se escreve embaixo das dezenas: 35.') },
            { texto: '5 − 1 = 4', erro: 'esquece-que-desagrupou', explica: 'Uma das 5 barras já virou cubos. Ficaram 4: 4 − 1 = 3.', mostra: conta({ ...C52, trocas: { D: '4', U: '12' }, resultado: '35' }, 'O 5 riscado pisca; vale o 4 de cima.') },
          ],
          linha: { tex: '52 - 17 = 35', fala: 'cinquenta e dois menos dezessete é trinta e cinco' },
        },
      ],
      esboco: 'Duas escolhas e a conta pronta. O segundo passo pega o esquecimento da troca.',
    },
    {
      tipo: 'anote',
      titulo: 'Desagrupamento (empresta)',
      definicao: 'Na subtração armada, se em cima faltar, abra 1 da casa da esquerda em 10 da casa atual. O número não muda, só a forma.',
      exemplo: { tex: '52 - 17 = 35', fala: 'cinquenta e dois menos dezessete é trinta e cinco' },
      alerta: 'Não tire o menor do maior em cada casa: sempre o de baixo sai do de cima.',
      esboco: 'A página do caderno com a conta, o 5 riscado e o 4 em cima.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em **304 − 128**, as unidades pedem ajuda, mas as dezenas de cima são **0**. E agora?',
      fala: 'Em trezentos e quatro menos cento e vinte e oito, as unidades pedem ajuda, mas as dezenas de cima são zero. E agora?',
      visual: conta(C304, 'A conta armada com o 0 no meio do 304 em destaque.'),
      opcoes: [
        {
          texto: 'Abro 1 centena, depois 1 dezena', certa: true,
          explica: 'Isso. 304 vira 2 centenas, 9 dezenas e 14 unidades. Daí: 14 − 8, 9 − 2, 2 − 1. Dá **176**.',
          mostra: conta({ ...C304, trocas: { C: '2', D: '9', U: '14' }, resultado: '176' }, 'O 3 vira 2, o 0 vira 10 e logo 9, o 4 vira 14; o resultado 176 se escreve da direita para a esquerda.'),
        },
        {
          texto: 'Não dá: o zero não tem o que dar', erro: 'zero-nao-empresta',
          explica: 'O zero ganha antes: 1 centena vira 10 dezenas. Aí uma dezena vira 10 unidades. Dá **176**.',
          mostra: conta({ ...C304, trocas: { C: '2', D: '9', U: '14' }, resultado: '176' }, 'A centena aberta enche a coluna D; dela sai a dezena que enche U.'),
        },
        {
          texto: 'Faço 8 − 4 nas unidades', erro: 'subtrai-menor-do-maior',
          explica: 'Sempre o de baixo sai do de cima. Abra uma centena e depois uma dezena: 14 − 8 = 6. Dá **176**.',
          mostra: conta({ ...C304, trocas: { C: '2', D: '9', U: '14' }, resultado: '176' }, 'As trocas aparecem uma por uma, da centena para as unidades.'),
        },
      ],
      esboco: 'O caso que mais trava. A imagem das trocas em cascata resolve sem regra nova: é abrir duas vezes.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Arme no caderno e resolva: $403 - 158$.',
      fala: 'Arme no caderno e resolva: quatrocentos e três menos cento e cinquenta e oito.',
      resposta: 245,
      resolucao: [
        { tex: '403 = 3 \\text{ centenas}, 9 \\text{ dezenas}, 13 \\text{ unidades}', fala: 'quatrocentos e três é três centenas, nove dezenas e treze unidades' },
        { tex: '13 - 8 = 5', fala: 'treze menos oito é cinco' },
        { tex: '9 - 5 = 4', fala: 'nove menos cinco é quatro' },
        { tex: '3 - 1 = 2', fala: 'três menos um é dois' },
        { tex: '403 - 158 = 245', fala: 'quatrocentos e três menos cento e cinquenta e oito é duzentos e quarenta e cinco' },
      ],
      esboco: 'De novo um zero no meio, agora sozinho no papel.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['armada-sub-n1', 'armada-sub-n2', 'armada-sub-n3'],
      esboco: 'Nível 1: duas casas com empresta, com a conta na tela. Nível 2: três casas com zero nas dezenas. Nível 3: um problema, sem a conta.',
    },
    {
      tipo: 'fecho',
      texto: 'Sobraram **R$ 35**. Na próxima aula: como **conferir** uma conta e achar o erro.',
      fala: 'Sobraram trinta e cinco reais. Na próxima aula: como conferir uma conta e achar o erro.',
      visual: conta({ ...C52, trocas: { D: '4', U: '12' }, resultado: '35' }, 'A conta do gancho, completa, com as trocas em âmbar.'),
      esboco: 'Responder ao gancho e preparar a aula de conferir: 35 + 17 dá 52?',
    },
  ],
}
