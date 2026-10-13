import type { Aula, Visual } from '@/lib/formation/schema'

// Resolver passo a passo: fazer a mesma operação dos dois lados. Abre com
// 2 caixas e 3 pesos contra 11 pesos (2x + 3 = 11). Momento-chave: no Mexa
// "tirar", o aluno tira os 3 pesos soltos; se tira só de um lado, a balança
// inclina e a equação vira ≠. Sobra 2x = 8, e no Mexa "dividir" ele parte
// cada prato em 2 grupos iguais e fica com um de cada lado: x = 4. A divisão
// desfaz a multiplicação (a prova real da unidade 4). Depois, sem balança:
// x − 4 = 6 na reta, desfeito com + 4 dos dois lados, e o atalho "passa
// para o outro lado" explicado como a mesma conta dos dois lados. O passo a
// passo resolve 3x − 4 = 11 e confere.

const bal = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'balanca', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { de: 0, ate: 12, passo: 1, ...estado }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** 2 caixas e 3 pesos contra 11 pesos (2x + 3 = 11). */
const GANCHO = { esquerda: { x: 2, n: 3 }, direita: { n: 11 } }
/** 3 caixas e 5 pesos contra 20 pesos (3x + 5 = 20). */
const TRES = { esquerda: { x: 3, n: 5 }, direita: { n: 20 } }
/** 1 caixa e 7 pesos contra 12 pesos (x + 7 = 12). */
const SETE = { esquerda: { x: 1, n: 7 }, direita: { n: 12 } }

export const aula: Aula = {
  id: 'B.U15.A2',
  titulo: 'Resolver passo a passo',
  objetivo: 'Resolver equações como ax + b = c e ax − b = c fazendo a mesma operação dos dois lados (tirar, somar, dividir), desfazer cada conta com a contrária e conferir a solução.',
  modelo: 'balanca',
  esboco: 'A balança de 2x + 3 = 11. Momento-chave: o aluno tira os 3 pesos soltos e, se tira de um lado só, vê a balança inclinar e o = virar ≠. Sobra 2x = 8; ele parte os pratos em 2 grupos e fica com um: x = 4. A divisão desfaz o vezes, e a balança do começo confere. Uma aposta mostra o erro de tirar só de um lado na escrita (3x + 5 = 20). Sem balança, x − 4 = 6 na reta: o contrário de voltar 4 é andar 4. O anote dá a regra. O atalho "passa para o outro lado" vira a mesma conta dos dois lados. O passo a passo resolve 3x − 4 = 11 e confere.',
  vega: 'Ideia central: para resolver uma equação, faz-se a mesma operação dos dois lados, até sobrar só o x. Cada conta se desfaz com a contrária: + com −, − com +, vezes com divisão (a divisão desfaz a multiplicação, como na prova real). No fim, confere-se trocando o x pela solução na equação do começo. O atalho "passa para o outro lado trocando o sinal" é só um jeito curto de escrever a mesma conta dos dois lados: x + 7 = 12 vira x = 12 − 7 porque se tirou 7 dos dois. Erros esperados: fazer a conta só de um lado (3x + 5 = 20 vira 3x = 20); parar no 2x = 8 e responder 8; desfazer com a mesma operação (x − 4 = 6 dá 2; 2x = 8 dá 16); tirar o número da frente (3x = 15 dá 12); mudar um número de lado sem trocar o sinal; não conferir. Guie com "O que você fez neste lado? Fez no outro?", "Que conta desfaz esta?", "Troque o x e veja se os dois lados batem". x dos dois lados é da próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Duas caixas iguais e 3 pesos equilibram 11 pesos. Como achar o peso de uma caixa sem chutar?',
      fala: 'Duas caixas iguais e três pesos equilibram onze pesos. Como achar o peso de uma caixa sem chutar?',
      visual: bal({ ...GANCHO, mostraEquacao: true }, 'A balança reta: 2 caixas e 3 pesos contra 11 pesos. Embaixo: 2x + 3 = 11.'),
      esboco: 'Na aula anterior, o aluno conferia valores. Agora ele quer um caminho que sempre funciona.',
    },
    {
      tipo: 'mexa',
      texto: 'Primeiro, livre as caixas: tire os 3 pesos soltos. Mas a balança tem de continuar reta.',
      fala: 'Primeiro, livre as caixas: tire os três pesos soltos. Mas a balança tem de continuar reta.',
      visual: bal({ ...GANCHO, valor: 4, tirar: true, mostraEquacao: true }, 'A balança de 2x + 3 = 11, com as peças tocáveis. Tirando só da esquerda, ela inclina, a direita desce e o = vira ≠ em vermelho. Tirando o mesmo da direita, volta a ficar reta. No fim: 2x = 8.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos pesos para tirá-los. Tire o mesmo dos dois pratos.',
        sucesso: { esquerda: { x: 2 }, direita: { n: 8 } },
        mostre: 'Saem os 3 pesos da esquerda e 3 da direita. Sobram 2 caixas contra 8 pesos, reta: 2x = 8.',
      },
      descoberta: 'Tirar de um lado só inclina a balança: a igualdade se perde. Tirando 3 dos dois lados, ela fica reta: 2x = 8.',
      esboco: 'O momento-chave. Quase todo mundo tira primeiro os 3 da esquerda, e a balança inclina na hora: o ≠ aparece. O aluno descobre sozinho que tem de tirar do outro lado também.',
    },
    {
      tipo: 'mexa',
      texto: 'Sobrou ${2x = 8}$: duas caixas pesam 8. Cada prato está partido em 2 grupos iguais. Fique com um de cada lado.',
      fala: 'Sobrou dois x igual a oito: duas caixas pesam oito. Cada prato está partido em dois grupos iguais. Fique com um de cada lado.',
      visual: bal({ esquerda: { x: 2 }, direita: { n: 8 }, dividir: 2, mostraEquacao: true }, 'Cada prato partido em 2 grupos com moldura tracejada: uma caixa em cada grupo da esquerda, 4 pesos em cada grupo da direita. Um toque num grupo deixa só um grupo de cada lado: x = 4.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque num dos grupos.',
        sucesso: { dividido: true },
        mostre: 'Fica um grupo de cada lado: uma caixa contra 4 pesos. Embaixo, x = 4.',
      },
      descoberta: 'Dividir os dois lados por 2 é ficar com metade de cada prato: uma caixa contra 4 pesos. x = 4.',
      esboco: 'A divisão como repartir em partes iguais, nos dois pratos ao mesmo tempo.',
    },
    {
      tipo: 'ideia',
      texto: 'Dividir por 2 desfaz o vezes 2, como na prova real. Confira na balança do começo: ${2 \\cdot 4 + 3 = 11}$.',
      fala: 'Dividir por dois desfaz o vezes dois, como na prova real. Confira na balança do começo: dois vezes quatro mais três, onze.',
      visual: bal({ ...GANCHO, valor: 4, abrir: true, mostraEquacao: true }, 'A balança do gancho volta, com as duas caixas abertas mostrando 4. Reta. Embaixo: 2x + 3 = 11.'),
      esboco: 'A ponte com a unidade 4: multiplicação e divisão desfazem uma à outra. A conferência fecha o primeiro exemplo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${3x + 5 = 20}$, alguém tirou 5 só da esquerda e escreveu ${3x = 20}$. Está certo?',
      fala: 'Em três x mais cinco igual a vinte, alguém tirou cinco só da esquerda e escreveu três x igual a vinte. Está certo?',
      visual: bal({ ...TRES, mostraEquacao: true }, 'A balança reta: 3 caixas e 5 pesos contra 20 pesos. Embaixo: 3x + 5 = 20.'),
      opcoes: [
        {
          texto: 'Não: tem de tirar 5 dos dois lados', certa: true,
          explica: 'Isso. Tirando 5 de cada lado, fica ${3x = 15}$, e a balança continua reta.',
          fala: 'Isso. Tirando cinco de cada lado, fica três x igual a quinze, e a balança continua reta.',
          mostra: bal({ esquerda: { x: 3 }, direita: { n: 15 }, riscadas: { esquerda: { n: 5 }, direita: { n: 5 } }, mostraEquacao: true }, 'Os 5 pesos saem dos dois pratos e ficam riscados. A balança continua reta. Embaixo: 3x = 15.'),
        },
        {
          texto: 'Sim: o 5 saiu da conta', erro: 'opera-so-de-um-lado',
          explica: 'O 5 saiu só da esquerda: a direita ficou mais pesada. A balança inclina, e ${3x}$ não é 20.',
          fala: 'O cinco saiu só da esquerda: a direita ficou mais pesada. A balança inclina, e três x não é vinte.',
          mostra: bal({ esquerda: { x: 3 }, direita: { n: 20 }, riscadas: { esquerda: { n: 5 } }, valor: 5, mostraEquacao: true }, 'Os 5 pesos saem só da esquerda e a direita desce. Embaixo, em vermelho: 3x ≠ 20.'),
        },
      ],
      esboco: 'O mesmo erro do Mexa, agora na escrita. A balança mostra o que a conta esconde.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x - 4 = 6}$? Na reta: de $x$, voltar 4 dá 6. Que conta, dos dois lados, desfaz o −4?',
      fala: 'E x menos quatro igual a seis? Na reta: de x, voltar quatro dá seis. Que conta, dos dois lados, desfaz o menos quatro?',
      visual: reta({ marcas: [6], numeros: [6], comparacao: 'x − 4 = 6' }, 'A reta de 0 a 12, com o 6 aceso. Embaixo: x − 4 = 6. O x ainda não aparece: é o que se procura.'),
      opcoes: [
        {
          texto: 'Somar 4', certa: true,
          explica: 'Isso. Andar 4 para a frente desfaz voltar 4: ${x = 6 + 4 = 10}$. Confira: ${10 - 4 = 6}$.',
          fala: 'Isso. Andar quatro para a frente desfaz voltar quatro: x igual a seis mais quatro, dez. Confira: dez menos quatro, seis.',
          mostra: reta({ marcas: [6, 10], numeros: [10], saltos: [[6, 10, '+4']], comparacao: 'x = 10' }, 'O arco agora vai do 6 ao 10, para a frente, com +4. O ponto acende no 10. Embaixo: x = 10.'),
        },
        {
          texto: 'Tirar 4', erro: 'desfaz-com-a-mesma-operacao',
          explica: 'Tirar 4 é voltar mais: ${6 - 4 = 2}$, e ${2 - 4}$ não dá 6. Para desfazer o −4, some 4.',
          fala: 'Tirar quatro é voltar mais: seis menos quatro, dois, e dois menos quatro não dá seis. Para desfazer o menos quatro, some quatro.',
          mostra: reta({ marcas: [2, 6], saltos: [[6, 2, '−4']], comparacao: '2 − 4 não dá 6' }, 'Um arco volta do 6 ao 2: mais longe do x. Embaixo: 2 − 4 não dá 6.'),
        },
      ],
      esboco: 'Sem balança: os pratos não têm pesos negativos. A reta mostra a conta contrária como o caminho de volta.',
    },
    {
      tipo: 'anote',
      titulo: 'Resolver uma equação',
      definicao: 'Para **resolver** uma equação, faça a mesma operação dos dois lados, até sobrar só o $x$. Cada conta se desfaz com a contrária.',
      exemplo: { tex: '2x + 3 = 11 \\;\\Rightarrow\\; 2x = 8 \\;\\Rightarrow\\; x = 4', fala: 'dois x mais três igual a onze. Tira três: dois x igual a oito. Divide por dois: x igual a quatro' },
      alerta: 'O + se desfaz com o −, e o vezes com a divisão. No fim, confira: ${2 \\cdot 4 + 3 = 11}$.',
      esboco: 'Na página: as três linhas, com "− 3 dos dois lados" e "÷ 2 dos dois lados" anotados ao lado das setas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${x + 7 = 12}$, tem gente que diz: "o 7 passa para o outro lado com o sinal trocado". Por que dá certo?',
      fala: 'Em x mais sete igual a doze, tem gente que diz: o sete passa para o outro lado com o sinal trocado. Por que dá certo?',
      visual: bal({ ...SETE, mostraEquacao: true }, 'A balança reta: 1 caixa e 7 pesos contra 12 pesos. Embaixo: x + 7 = 12.'),
      opcoes: [
        {
          texto: 'É tirar 7 dos dois lados', certa: true,
          explica: 'Isso. Nada muda de prato: tira-se 7 de cada lado. Fica ${x = 12 - 7 = 5}$.',
          fala: 'Isso. Nada muda de prato: tira-se sete de cada lado. Fica x igual a doze menos sete, cinco.',
          mostra: bal({ esquerda: { x: 1 }, direita: { n: 5 }, riscadas: { esquerda: { n: 7 }, direita: { n: 7 } }, mostraEquacao: true }, 'Os 7 pesos saem dos dois pratos, riscados. Sobra a caixa contra 5, reta. Embaixo: x = 5.'),
        },
        {
          texto: 'O 7 pula para o outro prato', erro: 'passa-para-o-outro-lado',
          explica: 'Se o 7 pulasse de prato, a direita ficaria com 19, e a balança inclinaria. O 7 sai dos **dois** lados.',
          fala: 'Se o sete pulasse de prato, a direita ficaria com dezenove, e a balança inclinaria. O sete sai dos dois lados.',
          mostra: bal({ esquerda: { x: 1 }, direita: { n: 19 }, valor: 5, rotulo: 'x ≠ 12 + 7' }, 'Os 7 pesos pulam para a direita, que desce muito. Embaixo: x ≠ 12 + 7.'),
        },
      ],
      esboco: 'O atalho da escola, desmontado: ele é a mesma conta dos dois lados, escrita de um jeito curto. Quem só "passa" esquece o sinal.',
    },
    {
      tipo: 'passo',
      problema: 'Resolva ${3x - 4 = 11}$.',
      fala: 'Resolva três x menos quatro igual a onze.',
      visual: expr(['3x − 4 = 11'], 'A equação grande, sozinha.'),
      passos: [
        {
          pergunta: 'Primeiro, desfazer o −4. O que fazer dos dois lados?',
          fala: 'Primeiro, desfazer o menos quatro. O que fazer dos dois lados?',
          opcoes: [
            {
              texto: 'Somar 4', certa: true,
              explica: 'Isso. O contrário de tirar 4 é somar 4: ${3x = 15}$.',
              fala: 'Isso. O contrário de tirar quatro é somar quatro: três x igual a quinze.',
              mostra: expr(['3x − 4 = 11', '3x − 4 + 4 = 11 + 4', '3x = 15'], 'Três linhas: a equação, + 4 dos dois lados, e grande: 3x = 15.'),
            },
            {
              texto: 'Tirar 4', erro: 'desfaz-com-a-mesma-operacao',
              explica: 'Tirar mais 4 dá ${3x - 8 = 7}$: o −4 piorou. Para desfazer, some 4.',
              fala: 'Tirar mais quatro dá três x menos oito igual a sete: o menos quatro piorou. Para desfazer, some quatro.',
            },
            {
              texto: 'Somar 4 só ao 11', erro: 'opera-so-de-um-lado',
              explica: 'Um lado só desequilibra: ${3x - 4}$ não é 15. Some 4 nos **dois** lados.',
              fala: 'Um lado só desequilibra: três x menos quatro não é quinze. Some quatro nos dois lados.',
            },
          ],
          linha: { tex: '3x = 15', fala: 'três x igual a quinze' },
        },
        {
          pergunta: 'Agora ${3x = 15}$. E então?',
          fala: 'Agora três x igual a quinze. E então?',
          opcoes: [
            {
              texto: 'Dividir por 3: ${x = 5}$', certa: true,
              explica: 'Isso. Três vezes $x$ dá 15, então $x$ é ${15 \\div 3 = 5}$.',
              fala: 'Isso. Três vezes x dá quinze, então x é quinze dividido por três, cinco.',
              mostra: expr(['3x − 4 = 11', '3x = 15', 'x = 5'], 'As linhas descem até x = 5, grande.'),
            },
            {
              texto: 'Tirar 3: ${x = 12}$', erro: 'subtrai-o-coeficiente',
              explica: '$3x$ é 3 vezes $x$, não ${3 + x}$. Com 12, ${3 \\cdot 12 = 36}$. Divida por 3.',
              fala: 'Três x é três vezes x, não três mais x. Com doze, três vezes doze, trinta e seis. Divida por três.',
            },
            {
              texto: '${x = 15}$', erro: 'esquece-de-dividir',
              explica: '15 é o valor de ${3x}$, três caixas. Uma só vale ${15 \\div 3}$.',
              fala: 'Quinze é o valor de três x, três caixas. Uma só vale quinze dividido por três.',
            },
          ],
          linha: { tex: 'x = 5', fala: 'x igual a cinco' },
        },
        {
          pergunta: 'Confira: troque o $x$ por 5 na equação do começo.',
          opcoes: [
            {
              texto: '${3 \\cdot 5 - 4 = 11}$', certa: true,
              explica: 'Isso. ${15 - 4 = 11}$: os dois lados dão 11. A solução é ${x = 5}$.',
              fala: 'Isso. Quinze menos quatro, onze: os dois lados dão onze. A solução é x igual a cinco.',
              mostra: expr(['3x − 4 = 11', '3 · 5 − 4 = 11', '11 = 11'], 'A conferência em linhas, até 11 = 11, grande.'),
            },
            {
              texto: '${35 - 4 = 31}$', erro: 'junta-algarismos-com-a-letra',
              explica: '${3x}$ com ${x = 5}$ é ${3 \\cdot 5 = 15}$, e não 35. Fica ${15 - 4 = 11}$.',
              fala: 'Três x com x igual a cinco é três vezes cinco, quinze, e não trinta e cinco. Fica quinze menos quatro, onze.',
            },
          ],
          linha: { tex: '3 \\cdot 5 - 4 = 11 \\; \\checkmark', fala: 'três vezes cinco menos quatro é onze: confere' },
        },
      ],
      esboco: 'Sem balança, só a escrita: cada passo diz que conta desfaz o quê. A conferência é o último passo, sempre.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${4x + 7 = 31}$ e confira. Quanto vale $x$?',
      fala: 'No papel: resolva quatro x mais sete igual a trinta e um e confira. Quanto vale x?',
      resposta: 6,
      sinal: true,
      resolucao: [
        { tex: '4x + 7 - 7 = 31 - 7', fala: 'tire sete dos dois lados' },
        { tex: '4x = 24', fala: 'quatro x igual a vinte e quatro' },
        { tex: 'x = 24 \\div 4 = 6', fala: 'divida por quatro: x igual a seis' },
        { tex: '4 \\cdot 6 + 7 = 31 \\; \\checkmark', fala: 'confere: quatro vezes seis mais sete é trinta e um' },
      ],
      esboco: 'Quem digitar 24 parou no 4x. Quem digitar 9,5 somou 7 em vez de tirar.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['resolver-equacao-n1', 'resolver-equacao-n2', 'resolver-equacao-n3'],
      esboco: 'Nível 1: ax + b = c na balança e x − a = b na reta. Nível 2: ax − b = c, soluções negativas e o primeiro passo certo. Nível 3: a academia e o táxi, números maiores e a conferência, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'A caixa pesa 4: tirar 3 e dividir por 2, sempre dos dois lados. Na próxima aula: caixas nos dois pratos.',
      fala: 'A caixa pesa quatro: tirar três e dividir por dois, sempre dos dois lados. Na próxima aula: caixas nos dois pratos.',
      visual: bal({ esquerda: { x: 1 }, direita: { n: 4 }, valor: 4, abrir: true, rotulo: 'x = 4' }, 'Uma caixa aberta com 4 contra 4 pesos, reta. Embaixo: x = 4.'),
      esboco: 'Responde ao gancho e anuncia x dos dois lados.',
    },
  ],
}
