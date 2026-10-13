import type { Aula, Visual } from '@/lib/formation/schema'

// Igualdade é equilíbrio: uma equação é uma balança em equilíbrio. Abre com
// uma caixa fechada e 3 pesos de 1 kg contra 7 pesos. Quanto pesa a caixa?
// O aluno aposta e a caixa abre (4). Depois prevê o que um peso só de um
// lado faz: a balança desce. Momento-chave: no Mexa, ele tira 3 pesos de
// cada prato e sobra a caixa contra 4 pesos, sem chutar; tirando de um lado
// só, a balança inclina. Só então a balança vira escrita (x + 3 = 7) e o
// anote dá o nome: equação e solução. O resto da aula é conferir: trocar o
// x pelo número e ver se os dois lados dão o mesmo.

const bal = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'balanca', estado, esboco })

/** A balança do gancho: 1 caixa e 3 pesos contra 7 pesos (x + 3 = 7). */
const CAIXA = { esquerda: { x: 1, n: 3 }, direita: { n: 7 } }
/** 2 caixas e 1 peso contra 9 pesos (2x + 1 = 9). */
const DUAS = { esquerda: { x: 2, n: 1 }, direita: { n: 9 } }
/** 3 caixas e 2 pesos contra 20 pesos (3x + 2 = 20). */
const TRES = { esquerda: { x: 3, n: 2 }, direita: { n: 20 } }

export const aula: Aula = {
  id: 'B.U15.A1',
  titulo: 'Igualdade é equilíbrio',
  objetivo: 'Ler uma equação como uma balança em equilíbrio, entender que a solução é o valor que deixa os dois lados iguais e conferir uma solução trocando o x pelo número.',
  modelo: 'balanca',
  esboco: 'Uma balança de dois pratos o tempo todo. A caixa fechada e 3 pesos contra 7: o aluno aposta no peso da caixa, e ela abre com 4. Um peso a mais só de um lado faz a balança descer. Momento-chave: no Mexa, ele tira 3 pesos de cada prato e vê a caixa sozinha contra 4, com a balança reta. A balança vira x + 3 = 7, e o anote dá os nomes: equação e solução. Depois, conferir: qual valor equilibra 2x + 1 = 9, e se x = 5 resolve 3x + 2 = 20 (não: 17 contra 20).',
  vega: 'Ideia central: uma equação é uma igualdade com um número que não sabemos (o x); é uma balança reta. A solução é o valor de x que deixa os dois lados iguais, a balança reta. Para conferir, troca-se o x pelo número: os dois lados têm de dar o mesmo. Mudar só um lado (pôr ou tirar um peso de um prato só) desequilibra. Erros esperados: somar os números que aparecem (x + 3 = 7 dá 10); fazer a conta só de um lado; parar no 2x (2x + 1 = 9 dá 8); aceitar um valor sem conferir. Guie com "O que há em cada prato?", "Se a caixa pesasse isso, a balança ficaria reta?", "Troque o x pelo número e faça a conta dos dois lados". Resolver passo a passo, com divisão, é da próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma caixa fechada e 3 pesos de 1\u00a0kg equilibram 7 pesos de 1\u00a0kg. Quanto pesa a caixa?',
      fala: 'Uma caixa fechada e três pesos de um quilo equilibram sete pesos de um quilo. Quanto pesa a caixa?',
      visual: bal(CAIXA, 'A balança reta: no prato da esquerda, a caixa âmbar com x e 3 pesos cinza; no da direita, 7 pesos. A agulha acesa no meio.'),
      esboco: 'Uma pergunta de verdade, sem conta escrita. A balança reta já diz que os dois pratos pesam o mesmo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A balança está reta: os dois pratos pesam o mesmo. Quanto pesa a caixa?',
      opcoes: [
        {
          texto: '4\u00a0kg', certa: true,
          explica: 'Isso. A caixa e mais 3 dão 7: ${4 + 3 = 7}$.',
          fala: 'Isso. A caixa e mais três dão sete: quatro mais três, sete.',
          mostra: bal({ ...CAIXA, valor: 4, abrir: true }, 'A caixa abre e mostra 4. A balança continua reta.'),
        },
        {
          texto: '10\u00a0kg', erro: 'operacao-trocada',
          explica: '10 é ${3 + 7}$. Com 10 na caixa, a esquerda pesaria 13, e não 7: ela desceria.',
          fala: 'Dez é três mais sete. Com dez na caixa, a esquerda pesaria treze, e não sete: ela desceria.',
          mostra: bal({ ...CAIXA, valor: 10, abrir: true, rotulo: '10 + 3 = 13, mais que 7' }, 'A caixa abre com 10 e a esquerda desce. Embaixo: 10 + 3 = 13, mais que 7.'),
        },
      ],
      visual: bal(CAIXA, 'A mesma balança, reta.'),
      esboco: 'Aposta antes de qualquer regra. A errada abre a caixa com 10 e a balança desce: o desmonte é ver que não equilibra.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora ponha mais 2 pesos só no prato da direita. O que acontece?',
      fala: 'Agora ponha mais dois pesos só no prato da direita. O que acontece?',
      visual: bal({ ...CAIXA, valor: 4 }, 'A balança reta, com a caixa fechada outra vez.'),
      opcoes: [
        {
          texto: 'A direita desce', certa: true,
          explica: 'Isso. A direita fica com 9 e a esquerda continua com 7. A igualdade acabou.',
          fala: 'Isso. A direita fica com nove e a esquerda continua com sete. A igualdade acabou.',
          mostra: bal({ esquerda: { x: 1, n: 3 }, direita: { n: 9 }, valor: 4 }, 'Dois pesos caem no prato da direita, e ele desce.'),
        },
        {
          texto: 'Continua reta', erro: 'opera-so-de-um-lado',
          explica: 'Os dois pesos novos estão só na direita: 9 contra 7. Para ficar reta, a esquerda também ganharia 2.',
          fala: 'Os dois pesos novos estão só na direita: nove contra sete. Para ficar reta, a esquerda também ganharia dois.',
          mostra: bal({ esquerda: { x: 1, n: 3 }, direita: { n: 9 }, valor: 4 }, 'Dois pesos caem no prato da direita, e ele desce.'),
        },
      ],
      esboco: 'O contraexemplo que vai guiar a unidade: mudar um lado só desequilibra.',
    },
    {
      tipo: 'mexa',
      texto: 'Dá para achar o peso da caixa sem abrir. Tire 3 pesos de cada prato e veja o que sobra.',
      fala: 'Dá para achar o peso da caixa sem abrir. Tire três pesos de cada prato e veja o que sobra.',
      visual: bal({ ...CAIXA, valor: 4, tirar: true }, 'A balança reta; as peças com borda tocável. Cada toque tira um peso. Tirando só de um lado, a balança inclina e aparece o aviso; tirando do outro, ela volta.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos pesos para tirá-los. A balança tem de ficar reta.',
        sucesso: { esquerda: { x: 1 }, direita: { n: 4 } },
        mostre: 'Saem os 3 pesos da esquerda e 3 da direita. Sobra a caixa contra 4 pesos, e a balança fica reta.',
      },
      descoberta: 'Tirar o mesmo dos dois pratos mantém a balança reta. Sobra a caixa sozinha contra 4 pesos: a caixa pesa 4.',
      esboco: 'O momento-chave. O aluno tira com as mãos e vê a inclinação se tirar de um lado só. No fim, a caixa sozinha num prato e o peso dela no outro.',
    },
    {
      tipo: 'ideia',
      texto: 'Chame o peso da caixa de $x$. A balança reta é a **equação** ${x + 3 = 7}$. E sobrou ${x = 4}$.',
      fala: 'Chame o peso da caixa de x. A balança reta é a equação x mais três igual a sete. E sobrou x igual a quatro.',
      visual: bal({ esquerda: { x: 1 }, direita: { n: 4 }, riscadas: { esquerda: { n: 3 }, direita: { n: 3 } }, mostraEquacao: true }, 'A caixa contra 4 pesos, com os 3 pesos tirados de cada lado apagados e riscados. Embaixo: x = 4.'),
      esboco: 'Só agora a escrita, como resumo do que o aluno fez: o sinal de igual é a balança reta.',
    },
    {
      tipo: 'anote',
      titulo: 'Equação e solução',
      definicao: 'Uma **equação** é uma igualdade com um número que não sabemos, o $x$. A **solução** é o valor de $x$ que deixa os dois lados iguais.',
      exemplo: { tex: 'x + 3 = 7 \\qquad x = 4, \\text{ pois } 4 + 3 = 7', fala: 'x mais três igual a sete. x é quatro, pois quatro mais três é sete' },
      alerta: 'Sempre confira: troque o $x$ pela solução. Os dois lados têm de dar o mesmo número.',
      esboco: 'Na página, a balança desenhada ao lado da equação. O "pois" é a conferência.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Duas caixas iguais e 1 peso equilibram 9 pesos: ${2x + 1 = 9}$. Que valor de $x$ deixa a balança reta?',
      fala: 'Duas caixas iguais e um peso equilibram nove pesos: dois x mais um igual a nove. Que valor de x deixa a balança reta?',
      visual: bal({ ...DUAS, mostraEquacao: true }, 'A balança reta: 2 caixas e 1 peso contra 9 pesos. Embaixo: 2x + 1 = 9.'),
      opcoes: [
        {
          texto: '${x = 4}$', certa: true,
          explica: 'Isso. Duas caixas de 4 e mais 1: ${2 \\cdot 4 + 1 = 9}$.',
          fala: 'Isso. Duas caixas de quatro e mais um: dois vezes quatro mais um, nove.',
          mostra: bal({ ...DUAS, valor: 4, abrir: true, rotulo: '2 · 4 + 1 = 9' }, 'As duas caixas abrem com 4. A balança fica reta. Embaixo: 2 · 4 + 1 = 9.'),
        },
        {
          texto: '${x = 8}$', erro: 'esquece-de-dividir',
          explica: '8 é o peso das **duas** caixas juntas. Cada uma com 8 dá ${2 \\cdot 8 + 1 = 17}$, e não 9.',
          fala: 'Oito é o peso das duas caixas juntas. Cada uma com oito dá dois vezes oito mais um, dezessete, e não nove.',
          mostra: bal({ ...DUAS, valor: 8, abrir: true, rotulo: '2 · 8 + 1 = 17, mais que 9' }, 'As caixas abrem com 8 e a esquerda desce. Embaixo: 2 · 8 + 1 = 17, mais que 9.'),
        },
        {
          texto: '${x = 5}$', erro: 'desfaz-com-a-mesma-operacao',
          explica: 'Com 5: ${2 \\cdot 5 + 1 = 11}$, mais que 9. O peso solto se tira: ${9 - 1}$, e não ${9 + 1}$.',
          fala: 'Com cinco: dois vezes cinco mais um, onze, mais que nove. O peso solto se tira: nove menos um, e não nove mais um.',
          mostra: bal({ ...DUAS, valor: 5, abrir: true, rotulo: '2 · 5 + 1 = 11, mais que 9' }, 'As caixas abrem com 5 e a esquerda desce. Embaixo: 2 · 5 + 1 = 11, mais que 9.'),
        },
      ],
      esboco: 'Cada opção é conferida do mesmo jeito: abrir as caixas com o valor e ver se a balança fica reta. É a conferência, antes de saber resolver.',
    },
    {
      tipo: 'passo',
      problema: 'O $x$ vale 5 em ${3x + 2 = 20}$? Confira.',
      fala: 'O x vale cinco em três x mais dois igual a vinte? Confira.',
      visual: bal({ ...TRES, mostraEquacao: true }, 'A balança reta: 3 caixas e 2 pesos contra 20 pesos. Embaixo: 3x + 2 = 20.'),
      passos: [
        {
          pergunta: 'Troque o $x$ por 5. Como fica o lado esquerdo?',
          fala: 'Troque o x por cinco. Como fica o lado esquerdo?',
          opcoes: [
            {
              texto: '${3 \\cdot 5 + 2}$', certa: true,
              explica: 'Isso. ${3x}$ é 3 vezes $x$: o vezes escondido volta.',
              fala: 'Isso. Três x é três vezes x: o vezes escondido volta.',
              mostra: bal({ ...TRES, valor: 5, abrir: true, inclina: 'equilibrio', rotulo: '3 · 5 + 2' }, 'As 3 caixas abrem com 5, a balança ainda parada. Embaixo: 3 · 5 + 2.'),
            },
            {
              texto: '${35 + 2}$', erro: 'junta-algarismos-com-a-letra',
              explica: '${3x}$ não é o 3 colado no 5. É ${3 \\cdot 5}$: três caixas de 5.',
              fala: 'Três x não é o três colado no cinco. É três vezes cinco: três caixas de cinco.',
            },
          ],
          linha: { tex: '3 \\cdot 5 + 2', fala: 'três vezes cinco mais dois' },
        },
        {
          pergunta: 'Quanto dá ${3 \\cdot 5 + 2}$?',
          fala: 'Quanto dá três vezes cinco mais dois?',
          opcoes: [
            {
              texto: '17', certa: true,
              explica: 'Isso. Primeiro ${3 \\cdot 5 = 15}$, depois mais 2.',
              fala: 'Isso. Primeiro três vezes cinco, quinze, depois mais dois.',
              mostra: bal({ ...TRES, valor: 5, abrir: true, rotulo: '3 · 5 + 2 = 17' }, 'A balança se mexe: a direita desce. Embaixo: 3 · 5 + 2 = 17.'),
            },
            {
              texto: '21', erro: 'ignora-prioridade',
              explica: '21 é ${3 \\cdot 7}$. A multiplicação vem antes: ${15 + 2 = 17}$.',
              fala: 'Vinte e um é três vezes sete. A multiplicação vem antes: quinze mais dois, dezessete.',
            },
          ],
          linha: { tex: '3 \\cdot 5 + 2 = 17', fala: 'três vezes cinco mais dois é dezessete' },
        },
        {
          pergunta: 'A esquerda dá 17; a direita, 20. O $x$ vale 5?',
          fala: 'A esquerda dá dezessete; a direita, vinte. O x vale cinco?',
          opcoes: [
            {
              texto: 'Não: 17 não é 20', certa: true,
              explica: 'Isso. A balança inclina. Com ${x = 6}$ ela fica reta: ${3 \\cdot 6 + 2 = 20}$.',
              fala: 'Isso. A balança inclina. Com x igual a seis ela fica reta: três vezes seis mais dois, vinte.',
              mostra: bal({ ...TRES, valor: 6, abrir: true, rotulo: '3 · 6 + 2 = 20' }, 'As caixas trocam para 6 e a balança volta a ficar reta. Embaixo: 3 · 6 + 2 = 20.'),
            },
            {
              texto: 'Sim: dá quase 20', erro: 'nao-confere-a-solucao',
              explica: 'Quase não equilibra: com 5, a direita desce. A solução deixa os dois lados **iguais**.',
              fala: 'Quase não equilibra: com cinco, a direita desce. A solução deixa os dois lados iguais.',
            },
          ],
          linha: { tex: '17 \\neq 20', fala: 'dezessete é diferente de vinte' },
        },
      ],
      esboco: 'A conferência como hábito: trocar, calcular e comparar os dois lados. A balança abre as caixas com 5 e inclina; no fim, com 6, volta a ficar reta.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: que valor de $x$ resolve ${x + 8 = 15}$? Confira trocando o $x$ por ele.',
      fala: 'No papel: que valor de x resolve x mais oito igual a quinze? Confira trocando o x por ele.',
      resposta: 7,
      resolucao: [
        { tex: 'x + 8 - 8 = 15 - 8', fala: 'tire oito dos dois lados' },
        { tex: 'x = 7', fala: 'x igual a sete' },
        { tex: '7 + 8 = 15 \\; \\checkmark', fala: 'confere: sete mais oito é quinze' },
      ],
      esboco: 'Uma caixa e 8 pesos contra 15: tirar 8 de cada lado. Quem digitar 23 somou os dois números.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['equilibrio-n1', 'equilibrio-n2', 'equilibrio-n3'],
      esboco: 'Nível 1: o peso da caixa na balança (x + a = b e kx = b) e o que acontece ao mexer num prato só. Nível 2: x + a = b com números maiores e em outras ordens, e se um valor é solução. Nível 3: sacos de arroz na balança e qual valor resolve kx + a = b, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'A caixa pesa 4\u00a0kg: é o valor que deixa a balança reta. Na próxima aula: resolver qualquer balança, passo a passo.',
      fala: 'A caixa pesa quatro quilos: é o valor que deixa a balança reta. Na próxima aula: resolver qualquer balança, passo a passo.',
      visual: bal({ ...CAIXA, valor: 4, abrir: true, mostraEquacao: true }, 'A balança do gancho, reta, com a caixa aberta mostrando 4. Embaixo: x + 3 = 7.'),
      esboco: 'Responde ao gancho e anuncia a mesma operação dos dois lados.',
    },
  ],
}
