import type { Aula, Visual } from '@/lib/formation/schema'

// x dos dois lados: tirar o mesmo número de caixas dos dois pratos. Abre com
// 3 caixas e 2 pesos contra 1 caixa e 10 pesos (3x + 2 = x + 10). O aluno
// prevê o que acontece se tirar a caixa só da direita: a esquerda desce.
// Momento-chave: no Mexa, ele tira 1 caixa de cada prato (todas pesam o
// mesmo) e depois 2 pesos de cada: sobra 2x = 8. Divide por 2: x = 4, e
// confere nos dois lados (14 = 14). O erro de juntar x + 10 em 11x é
// desmontado com x = 4 (14, não 44). O passo a passo resolve
// 5x + 3 = 2x + 15, e um último Mexa mostra que as caixas podem sobrar do
// lado direito: x + 12 = 4x vira 12 = 3x.

const bal = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'balanca', estado, esboco })

/** 3 caixas e 2 pesos contra 1 caixa e 10 pesos (3x + 2 = x + 10). */
const GANCHO = { esquerda: { x: 3, n: 2 }, direita: { x: 1, n: 10 } }
/** 5 caixas e 3 pesos contra 2 caixas e 15 pesos (5x + 3 = 2x + 15). */
const CINCO = { esquerda: { x: 5, n: 3 }, direita: { x: 2, n: 15 } }
/** 1 caixa e 12 pesos contra 4 caixas (x + 12 = 4x). */
const DIREITA = { esquerda: { x: 1, n: 12 }, direita: { x: 4 } }

export const aula: Aula = {
  id: 'B.U15.A3',
  titulo: 'x dos dois lados',
  objetivo: 'Resolver equações com x dos dois lados (ax + b = cx + d) tirando o mesmo número de x de cada lado, sem juntar x com número, e conferir a solução nos dois lados.',
  modelo: 'balanca',
  esboco: 'A balança de 3x + 2 = x + 10, com caixas nos dois pratos. Aposta: tirar a caixa só da direita faz a esquerda descer. Momento-chave: no Mexa, o aluno tira 1 caixa de cada prato e 2 pesos de cada: sobra 2x = 8. No Mexa dividir, x = 4. Conferir: 14 dos dois lados. Uma aposta desmonta x + 10 = 11x. O anote dá a regra. O passo a passo resolve 5x + 3 = 2x + 15. O último Mexa (x + 12 = 4x) mostra as caixas sobrando à direita: 12 = 3x.',
  vega: 'Ideia central: com x dos dois lados, todas as caixas pesam o mesmo, então dá para tirar o mesmo número de caixas de cada prato (tirar x dos dois lados). Tira-se do lado que tem menos caixas, para nenhum prato ficar com caixas "negativas". Depois resolve-se como antes: tirar os números soltos e dividir. Confere-se trocando o x nos dois lados: 3 · 4 + 2 = 14 e 4 + 10 = 14. Erros esperados: tirar caixas só de um lado; juntar x com número (x + 10 = 11x); mudar 3x de lado sem trocar o sinal (4x = 10 em vez de 2x = 8); parar no 2x; não conferir os dois lados. Guie com "Quantas caixas dá para tirar dos dois pratos?", "Com x = 4, quanto pesa cada prato?", "Caixa e peso viram uma peça só?". Parênteses e frações são da próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Agora há caixas nos dois pratos: 3 caixas e 2 pesos contra 1 caixa e 10 pesos. Quanto pesa uma caixa?',
      fala: 'Agora há caixas nos dois pratos: três caixas e dois pesos contra uma caixa e dez pesos. Quanto pesa uma caixa?',
      visual: bal({ ...GANCHO, mostraEquacao: true }, 'A balança reta: à esquerda, 3 caixas e 2 pesos; à direita, 1 caixa e 10 pesos. Embaixo: 3x + 2 = x + 10.'),
      esboco: 'A caixa da direita atrapalha o que o aluno já sabe: tirar os pesos não basta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Todas as caixas pesam o mesmo. Se você tirar a caixa só do prato da direita, o que acontece?',
      fala: 'Todas as caixas pesam o mesmo. Se você tirar a caixa só do prato da direita, o que acontece?',
      visual: bal({ ...GANCHO, mostraEquacao: true }, 'A mesma balança, reta.'),
      opcoes: [
        {
          texto: 'A esquerda desce', certa: true,
          explica: 'Isso. A direita perdeu uma caixa e a esquerda não. Para ficar reta, tire uma caixa da esquerda também.',
          fala: 'Isso. A direita perdeu uma caixa e a esquerda não. Para ficar reta, tire uma caixa da esquerda também.',
          mostra: bal({ esquerda: { x: 3, n: 2 }, direita: { n: 10 }, riscadas: { direita: { x: 1 } }, valor: 4, mostraEquacao: true }, 'A caixa da direita sai, riscada, e a esquerda desce. Embaixo, em vermelho: 3x + 2 ≠ 10.'),
        },
        {
          texto: 'Nada: a caixa não tem número', erro: 'opera-so-de-um-lado',
          explica: 'A caixa tem peso, só não sabemos quanto. Tirando de um lado só, a esquerda fica mais pesada e desce.',
          fala: 'A caixa tem peso, só não sabemos quanto. Tirando de um lado só, a esquerda fica mais pesada e desce.',
          mostra: bal({ esquerda: { x: 3, n: 2 }, direita: { n: 10 }, riscadas: { direita: { x: 1 } }, valor: 4, mostraEquacao: true }, 'A caixa da direita sai, riscada, e a esquerda desce. Embaixo, em vermelho: 3x + 2 ≠ 10.'),
        },
      ],
      esboco: 'Previsão antes do Mexa: a caixa é um peso como os outros, só escondido.',
    },
    {
      tipo: 'mexa',
      texto: 'Tire 1 caixa de cada prato. Depois, 2 pesos de cada. A balança tem de ficar reta.',
      fala: 'Tire uma caixa de cada prato. Depois, dois pesos de cada. A balança tem de ficar reta.',
      visual: bal({ ...GANCHO, tirar: true, mostraEquacao: true }, 'A balança de 3x + 2 = x + 10, com as peças tocáveis. Tirando de um lado só, ela inclina e o = vira ≠. No fim: 2 caixas contra 8 pesos, 2x = 8.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas caixas e nos pesos para tirá-los. Tire o mesmo dos dois pratos.',
        sucesso: { esquerda: { x: 2 }, direita: { n: 8 } },
        mostre: 'Sai 1 caixa de cada prato e 2 pesos de cada. Sobram 2 caixas contra 8 pesos, reta: 2x = 8.',
      },
      descoberta: 'Caixa sai junto com caixa: tirar 1 caixa de cada lado mantém a balança reta. Com os pesos, sobra 2x = 8.',
      esboco: 'O momento-chave. As caixas da direita somem, e a equação vira uma que o aluno já sabe resolver. A balança inclina a cada tirada de um lado só.',
    },
    {
      tipo: 'mexa',
      texto: 'Sobrou ${2x = 8}$. Parta cada prato em 2 grupos e fique com um de cada lado.',
      fala: 'Sobrou dois x igual a oito. Parta cada prato em dois grupos e fique com um de cada lado.',
      visual: bal({ esquerda: { x: 2 }, direita: { n: 8 }, dividir: 2, mostraEquacao: true }, 'Cada prato em 2 grupos tracejados: uma caixa em cada grupo da esquerda, 4 pesos em cada da direita. Um toque deixa um grupo de cada lado: x = 4.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque num dos grupos.',
        sucesso: { dividido: true },
        mostre: 'Fica um grupo de cada lado: uma caixa contra 4 pesos. Embaixo, x = 4.',
      },
      descoberta: 'Como na aula anterior: dividir os dois lados por 2 deixa uma caixa contra 4. x = 4.',
      esboco: 'Repete o gesto da aula anterior, já conhecido: o novo desta aula foi tirar as caixas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Confira ${x = 4}$ na balança do começo, ${3x + 2 = x + 10}$. Quanto pesa cada prato?',
      fala: 'Confira x igual a quatro na balança do começo, três x mais dois igual a x mais dez. Quanto pesa cada prato?',
      visual: bal({ ...GANCHO, mostraEquacao: true }, 'A balança do gancho volta, com as caixas fechadas.'),
      opcoes: [
        {
          texto: '14 e 14', certa: true,
          explica: 'Isso. ${3 \\cdot 4 + 2 = 14}$ e ${4 + 10 = 14}$. Os dois lados batem: ${x = 4}$.',
          fala: 'Isso. Três vezes quatro mais dois, catorze, e quatro mais dez, catorze. Os dois lados batem: x igual a quatro.',
          mostra: bal({ ...GANCHO, valor: 4, abrir: true, rotulo: '3 · 4 + 2 = 14 e 4 + 10 = 14' }, 'Todas as caixas abrem com 4, e a balança fica reta. Embaixo: 3 · 4 + 2 = 14 e 4 + 10 = 14.'),
        },
        {
          texto: '14 e 10', erro: 'nao-confere-a-solucao',
          explica: 'A direita também tem uma caixa: ${4 + 10 = 14}$. Confira os **dois** lados inteiros.',
          fala: 'A direita também tem uma caixa: quatro mais dez, catorze. Confira os dois lados inteiros.',
          mostra: bal({ ...GANCHO, valor: 4, abrir: true, rotulo: '3 · 4 + 2 = 14 e 4 + 10 = 14' }, 'Todas as caixas abrem com 4, a da direita também. A balança fica reta.'),
        },
        {
          texto: '36 e 14', erro: 'junta-algarismos-com-a-letra',
          explica: '${3x}$ com ${x = 4}$ é ${3 \\cdot 4 = 12}$, e não 34. Fica ${12 + 2 = 14}$.',
          fala: 'Três x com x igual a quatro é três vezes quatro, doze, e não trinta e quatro. Fica doze mais dois, catorze.',
        },
      ],
      esboco: 'A conferência com x dos dois lados: o x aparece nos dois pratos e vale 4 nos dois.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém escreveu o lado direito, ${x + 10}$, como ${11x}$. Pode?',
      fala: 'Alguém escreveu o lado direito, x mais dez, como onze x. Pode?',
      visual: bal({ ...GANCHO, mostraEquacao: true }, 'A balança do gancho, reta.'),
      opcoes: [
        {
          texto: 'Não: caixa e peso não se juntam', certa: true,
          explica: 'Isso. Com ${x = 4}$: ${x + 10 = 14}$, mas ${11x = 44}$. ${x + 10}$ fica como está.',
          fala: 'Isso. Com x igual a quatro: x mais dez é catorze, mas onze x é quarenta e quatro. x mais dez fica como está.',
          mostra: bal({ esquerda: { x: 3, n: 2 }, direita: { x: 11 }, valor: 4, rotulo: 'x = 4: 11x = 44, não 14' }, 'O prato da direita vira 11 caixas e desce muito. Embaixo: x = 4: 11x = 44, não 14.'),
        },
        {
          texto: 'Sim: ${1 + 10 = 11}$', erro: 'junta-termos-nao-semelhantes',
          explica: '${11x}$ são 11 caixas. A direita tem 1 caixa e 10 pesos: com ${x = 4}$, 14, e não 44.',
          fala: 'Onze x são onze caixas. A direita tem uma caixa e dez pesos: com x igual a quatro, catorze, e não quarenta e quatro.',
          mostra: bal({ esquerda: { x: 3, n: 2 }, direita: { x: 11 }, valor: 4, rotulo: 'x = 4: 11x = 44, não 14' }, 'O prato da direita vira 11 caixas e desce muito. Embaixo: x = 4: 11x = 44, não 14.'),
        },
      ],
      esboco: 'O erro de termos semelhantes da unidade 14, agora dentro da equação. A balança com 11 caixas mostra o tamanho do erro.',
    },
    {
      tipo: 'anote',
      titulo: 'x dos dois lados',
      definicao: 'Com $x$ dos dois lados, tire o mesmo número de $x$ de cada lado. Depois, resolva como antes.',
      exemplo: { tex: '3x + 2 = x + 10 \\;\\Rightarrow\\; 2x = 8 \\;\\Rightarrow\\; x = 4', fala: 'três x mais dois igual a x mais dez. Tira x e tira dois: dois x igual a oito. Divide por dois: x igual a quatro' },
      alerta: '$x$ e número não se juntam: ${x + 10}$ não é ${11x}$. E confira nos dois lados: ${14 = 14}$.',
      esboco: 'Na página: a balança com as caixas riscadas dos dois lados, e as quatro equações em fila.',
    },
    {
      tipo: 'passo',
      problema: 'Resolva ${5x + 3 = 2x + 15}$.',
      fala: 'Resolva cinco x mais três igual a dois x mais quinze.',
      visual: bal({ ...CINCO, mostraEquacao: true }, 'A balança reta: 5 caixas e 3 pesos contra 2 caixas e 15 pesos. Embaixo: 5x + 3 = 2x + 15.'),
      passos: [
        {
          pergunta: 'Primeiro, as caixas. O que tirar?',
          opcoes: [
            {
              texto: '2 caixas de cada prato', certa: true,
              explica: 'Isso. A direita tem 2 caixas: tirando 2 de cada lado, fica ${3x + 3 = 15}$.',
              fala: 'Isso. A direita tem duas caixas: tirando duas de cada lado, fica três x mais três igual a quinze.',
              mostra: bal({ esquerda: { x: 3, n: 3 }, direita: { n: 15 }, riscadas: { esquerda: { x: 2 }, direita: { x: 2 } }, mostraEquacao: true }, 'Duas caixas saem de cada prato, riscadas. A balança continua reta. Embaixo: 3x + 3 = 15.'),
            },
            {
              texto: '2 caixas só da direita', erro: 'opera-so-de-um-lado',
              explica: 'Só da direita, a esquerda desce. As 2 caixas saem dos **dois** pratos.',
              fala: 'Só da direita, a esquerda desce. As duas caixas saem dos dois pratos.',
              mostra: bal({ esquerda: { x: 5, n: 3 }, direita: { n: 15 }, riscadas: { direita: { x: 2 } }, valor: 4, mostraEquacao: true }, 'As 2 caixas saem só da direita e a esquerda desce. Embaixo, em vermelho: 5x + 3 ≠ 15.'),
            },
          ],
          linha: { tex: '3x + 3 = 15', fala: 'três x mais três igual a quinze' },
        },
        {
          pergunta: 'Agora os pesos soltos. O que fazer?',
          opcoes: [
            {
              texto: 'Tirar 3 de cada prato', certa: true,
              explica: 'Isso. Fica ${3x = 12}$, e a balança continua reta.',
              fala: 'Isso. Fica três x igual a doze, e a balança continua reta.',
              mostra: bal({ esquerda: { x: 3 }, direita: { n: 12 }, riscadas: { esquerda: { x: 2, n: 3 }, direita: { x: 2, n: 3 } }, mostraEquacao: true }, 'Três pesos saem de cada prato. Sobram 3 caixas contra 12 pesos. Embaixo: 3x = 12.'),
            },
            {
              texto: 'Pôr 3 em cada prato', erro: 'desfaz-com-a-mesma-operacao',
              explica: 'Pôr mais 3 dá ${3x + 6 = 18}$: os pesos soltos aumentam. Para tirar o + 3, tire 3.',
              fala: 'Pôr mais três dá três x mais seis igual a dezoito: os pesos soltos aumentam. Para tirar o mais três, tire três.',
            },
          ],
          linha: { tex: '3x = 12', fala: 'três x igual a doze' },
        },
        {
          pergunta: 'Três caixas pesam 12. Quanto vale $x$?',
          fala: 'Três caixas pesam doze. Quanto vale x?',
          opcoes: [
            {
              texto: '${x = 4}$', certa: true,
              explica: 'Isso. ${12 \\div 3 = 4}$. Confira: ${5 \\cdot 4 + 3 = 23}$ e ${2 \\cdot 4 + 15 = 23}$.',
              fala: 'Isso. Doze dividido por três, quatro. Confira: cinco vezes quatro mais três, vinte e três, e dois vezes quatro mais quinze, vinte e três.',
              mostra: bal({ ...CINCO, valor: 4, abrir: true, rotulo: '23 = 23' }, 'A balança do começo volta, com todas as caixas abertas mostrando 4, reta. Embaixo: 23 = 23.'),
            },
            {
              texto: '${x = 9}$', erro: 'subtrai-o-coeficiente',
              explica: '9 é ${12 - 3}$. Mas $3x$ é 3 vezes $x$: três caixas de 9 pesariam 27. Divida: ${12 \\div 3}$.',
              fala: 'Nove é doze menos três. Mas três x é três vezes x: três caixas de nove pesariam vinte e sete. Divida: doze dividido por três.',
            },
          ],
          linha: { tex: 'x = 4', fala: 'x igual a quatro' },
        },
      ],
      esboco: 'Os três passos com a balança: caixas, pesos, divisão. O palco risca as peças a cada passo e, no fim, abre as caixas da balança do começo para conferir.',
    },
    {
      tipo: 'mexa',
      texto: 'Às vezes as caixas sobram à direita: ${x + 12 = 4x}$. Tire as caixas que dá dos dois pratos.',
      fala: 'Às vezes as caixas sobram à direita: x mais doze igual a quatro x. Tire as caixas que dá dos dois pratos.',
      visual: bal({ ...DIREITA, tirar: true, mostraEquacao: true }, 'À esquerda, 1 caixa e 12 pesos; à direita, 4 caixas. As peças tocáveis. No fim: 12 pesos contra 3 caixas, 12 = 3x.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas caixas para tirá-las. Tire o mesmo dos dois pratos.',
        sucesso: { esquerda: { n: 12 }, direita: { x: 3 } },
        mostre: 'Sai 1 caixa de cada prato. Sobram 12 pesos contra 3 caixas: 12 = 3x.',
      },
      descoberta: 'Tira-se do lado que tem menos caixas. As caixas que sobram podem ficar à direita: 12 = 3x, e x = 4.',
      esboco: 'O x do lado direito não muda nada: a balança não tem lado preferido.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${4x + 5 = x + 20}$ e confira nos dois lados. Quanto vale $x$?',
      fala: 'No papel: resolva quatro x mais cinco igual a x mais vinte e confira nos dois lados. Quanto vale x?',
      resposta: 5,
      sinal: true,
      resolucao: [
        { tex: '4x - x + 5 = x - x + 20', fala: 'tire x dos dois lados' },
        { tex: '3x + 5 = 20', fala: 'três x mais cinco igual a vinte' },
        { tex: '3x = 15', fala: 'tire cinco dos dois lados: três x igual a quinze' },
        { tex: 'x = 5', fala: 'divida por três: x igual a cinco' },
        { tex: '4 \\cdot 5 + 5 = 25 \\text{ e } 5 + 20 = 25 \\; \\checkmark', fala: 'confere: os dois lados dão vinte e cinco' },
      ],
      esboco: 'Quem digitar 3 juntou 4x com x de lado errado (5x = 15). Quem digitar 15 parou no 3x.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['x-dos-dois-lados-n1', 'x-dos-dois-lados-n2', 'x-dos-dois-lados-n3'],
      esboco: 'Nível 1: ax + b = cx + d na balança, e quantas caixas tirar de cada prato. Nível 2: as caixas sobrando à direita, soluções negativas, e o primeiro passo certo. Nível 3: dois planos de celular com o mesmo preço e equações maiores, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'Cada caixa pesa 4: tiramos caixa com caixa, peso com peso, e os dois lados deram 14. Na próxima aula: parênteses e frações.',
      fala: 'Cada caixa pesa quatro: tiramos caixa com caixa, peso com peso, e os dois lados deram catorze. Na próxima aula: parênteses e frações.',
      visual: bal({ ...GANCHO, valor: 4, abrir: true, rotulo: '14 = 14' }, 'A balança do gancho, reta, com todas as caixas abertas mostrando 4. Embaixo: 14 = 14.'),
      esboco: 'Responde ao gancho e anuncia parênteses e frações.',
    },
  ],
}
