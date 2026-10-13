import type { Aula, Visual } from '@/lib/formation/schema'

// Parênteses e frações. Primeiro arrumar, depois resolver. Dois combos
// iguais, cada um com um sanduíche x e um suco de R$ 3, custaram R$ 14:
// 2(x + 3) = 14. Caminho 1: distribuir (unidade 14), 2x + 6 = 14, tirar 6
// dos dois pratos e dividir por 2, x = 4. Caminho 2: os parênteses já dizem
// "dois grupos iguais"; partir cada prato em 2 deixa x + 3 = 7, e x = 4 de
// novo. O momento-chave: dividir os dois lados por 2 desfaz o 2 de fora dos
// parênteses, e os dois caminhos chegam ao mesmo x. Depois a fração: x/3 = 5
// diz que um terço de x é 5, então x tem três pedaços de 5 (multiplicar os
// dois lados por 3). E x/2 + 1 = 4: tirar o 1 primeiro, depois multiplicar
// os dois lados por 2. Multiplicar só o x/2 é o erro a desmontar.

const balanca = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'balanca', estado, esboco })
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** Os dois combos: 2 caixas (os sanduíches) e 6 pesos (os dois sucos de 3), contra 14. */
const COMBOS = { esquerda: { x: 2, n: 6 }, direita: { n: 14 } }
const RESOLVIDA = balanca({ esquerda: { x: 2 }, direita: { n: 8 }, valor: 4, abrir: true, rotulo: 'x = 4' }, 'Sobram 2 caixas contra 8 pesos. As caixas se abrem e mostram 4 dentro; embaixo, x = 4.')

const terco = (pintadas: number, rotulo: string, esboco: string) => barra({ partes: 3, pintadas, rotulo }, esboco)

export const aula: Aula = {
  id: 'B.U15.A4',
  titulo: 'Parênteses e frações',
  objetivo: 'Resolver equações com parênteses, como 2(x + 3) = 14 (distribuindo ou dividindo os dois lados pelo número de fora), e com frações, como x/3 = 5 e x/2 + 1 = 4 (multiplicando os dois lados pelo número de baixo), e conferir a solução.',
  modelo: 'balanca',
  esboco: 'Abre com dois combos iguais na balança: 2(x + 3) = 14. Primeiro o aluno tira os parênteses (2x + 6) e resolve tirando 6 dos dois pratos: x = 4. Depois, o momento-chave: o mesmo problema por outro caminho, partindo cada prato em 2 grupos (x + 3 = 7) e chegando ao mesmo x. Então a fração: x/3 = 5 na barra partida em 3 (x tem três pedaços de 5), e x/2 + 1 = 4 no passo a passo, com o 1 saindo antes da multiplicação.',
  vega: 'Ideia central: antes de resolver, arrume a equação. Com parênteses, distribua (2(x + 3) = 2x + 6) ou divida os dois lados pelo número de fora (2(x + 3) = 14 vira x + 3 = 7); os dois caminhos dão x = 4. Com fração, multiplique os dois lados pelo número de baixo: x/3 = 5 vira x = 15, porque um terço de x é 5 e x tem três terços. Com um número solto, tire-o antes: x/2 + 1 = 4 vira x/2 = 3, e x = 6. Erros esperados: distribuir só no primeiro termo (2x + 3 = 14), multiplicar só um lado (x/3 = 5 vira x = 5), dividir em vez de multiplicar (x = 5/3), multiplicar só o x/2 e não o 1 (x + 1 = 8). Guie com "Quantos sucos há nos dois combos?", "Se um terço é 5, quanto é o inteiro?", "Troque o x pela sua resposta: os dois lados dão o mesmo?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Dois combos iguais, cada um com um sanduíche e um suco de **R$ 3**, custaram **R$ 14**. Quanto custa o sanduíche?',
      fala: 'Dois combos iguais, cada um com um sanduíche e um suco de três reais, custaram catorze reais. Quanto custa o sanduíche?',
      visual: balanca({ ...COMBOS, rotulo: '2(x + 3) = 14' }, 'A balança em equilíbrio: à esquerda, 2 caixas (os sanduíches) e 6 pesos de 1 (os dois sucos); à direita, 14 pesos. Embaixo, 2(x + 3) = 14.'),
      esboco: 'Uma conta com parênteses, que o aluno ainda não sabe resolver. Cada caixa é o preço do sanduíche; cada peso, R$ 1.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Primeiro, arrume: tire os parênteses. Como fica ${2(x + 3)}$?',
      fala: 'Primeiro, arrume: tire os parênteses. Como fica dois, abre parênteses, x mais três?',
      visual: balanca({ ...COMBOS, rotulo: '2(x + 3) = 14' }, 'A mesma balança, com 2(x + 3) = 14 embaixo.'),
      opcoes: [
        {
          texto: '$2x + 6$', certa: true,
          explica: 'Isso. Dois sanduíches e dois sucos: ${2 \\cdot 3 = 6}$. Na balança, 6 pesos.',
          fala: 'Isso. Dois sanduíches e dois sucos: dois vezes três, seis. Na balança, seis pesos.',
          mostra: balanca({ ...COMBOS, mostraEquacao: true }, 'Embaixo, a equação lida dos pratos: 2x + 6 = 14.'),
        },
        {
          texto: '$2x + 3$', erro: 'distributiva-parcial',
          explica: 'São dois combos, então dois sucos: ${2 \\cdot 3 = 6}$. Conte os pesos da esquerda: 6, não 3.',
          fala: 'São dois combos, então dois sucos: dois vezes três, seis. Conte os pesos da esquerda: seis, não três.',
          mostra: balanca({ ...COMBOS, mostraEquacao: true }, 'Embaixo, 2x + 6 = 14: os 6 pesos são os dois sucos.'),
        },
      ],
      esboco: 'A distributiva da unidade 14 volta como o primeiro passo de arrumar. A balança conta os pesos e confirma o 6.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora é a equação que você já sabe resolver. Tire os 6 pesos dos dois pratos.',
      fala: 'Agora é a equação que você já sabe resolver. Tire os seis pesos dos dois pratos.',
      visual: balanca({ ...COMBOS, tirar: true, mostraEquacao: true }, '2x + 6 = 14. Cada peça tem borda clara: um toque tira a peça. Tirando só de um lado, a balança inclina.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos pesos para tirá-los, o mesmo dos dois lados.',
        sucesso: { esquerda: { x: 2 }, direita: { n: 8 } },
        mostre: 'Saem os 6 pesos da esquerda e 6 da direita. Sobram 2 caixas contra 8 pesos: 2x = 8.',
      },
      descoberta: 'Depois de tirar os parênteses, a equação 2x + 6 = 14 se resolve como na aula 2: tirando 6 dos dois lados, sobra 2x = 8.',
      esboco: 'Revisão rápida do que o aluno já sabe. A equação embaixo muda a cada par de toques.',
    },
    {
      tipo: 'ideia',
      texto: 'Sobrou ${2x = 8}$, então ${x = 4}$. Confira: ${2(4 + 3) = 2 \\cdot 7 = 14}$. O sanduíche custa **R$ 4**.',
      fala: 'Sobrou dois x igual a oito, então x é igual a quatro. Confira: dois vezes, abre parênteses, quatro mais três, é dois vezes sete, catorze. O sanduíche custa quatro reais.',
      visual: RESOLVIDA,
      esboco: 'As caixas se abrem com 4 dentro. A conferência usa a equação do começo, com os parênteses.',
    },
    {
      tipo: 'mexa',
      texto: 'Há outro caminho. ${2(x + 3)}$ são **dois grupos iguais** de ${x + 3}$. Parta cada prato em 2 e fique com um grupo.',
      fala: 'Há outro caminho. Dois, abre parênteses, x mais três, são dois grupos iguais de x mais três. Parta cada prato em dois e fique com um grupo.',
      visual: balanca({ ...COMBOS, dividir: 2, mostraEquacao: true }, 'A balança do começo, com cada prato partido em 2 grupos: à esquerda, 2 grupos de 1 caixa e 3 pesos; à direita, 2 grupos de 7. Um toque num grupo deixa só um grupo de cada lado.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque num dos grupos com a borda tracejada.',
        sucesso: { dividido: true },
        mostre: 'Fica um grupo de cada lado: 1 caixa e 3 pesos contra 7 pesos. Embaixo, x + 3 = 7.',
      },
      descoberta: 'Dividir os dois lados por 2 desfaz o 2 de fora dos parênteses: 2(x + 3) = 14 vira x + 3 = 7. Cada combo custa R$ 7.',
      esboco: 'O momento-chave: os parênteses mostram os grupos. Metade de cada prato continua em equilíbrio, e a conta fica menor.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Sobrou ${x + 3 = 7}$: um combo custa **R$ 7**. E o sanduíche?',
      fala: 'Sobrou x mais três igual a sete: um combo custa sete reais. E o sanduíche?',
      visual: balanca({ ...COMBOS, dividir: 2, rotulo: 'x + 3 = 7' }, 'Os pratos ainda partidos em 2 grupos, um aceso de cada lado: 1 caixa e 3 pesos contra 7. Embaixo, x + 3 = 7.'),
      opcoes: [
        {
          texto: 'R$ 4', certa: true,
          explica: 'Isso. Tirando 3 dos dois lados, ${x = 4}$. Os dois caminhos chegam ao mesmo sanduíche.',
          fala: 'Isso. Tirando três dos dois lados, x é igual a quatro. Os dois caminhos chegam ao mesmo sanduíche.',
          mostra: balanca({ esquerda: { x: 1 }, direita: { n: 4 }, riscadas: { esquerda: { n: 3 }, direita: { n: 3 } }, valor: 4, abrir: true, rotulo: 'x = 4' }, 'Os 3 pesos saem riscados dos dois pratos. A caixa se abre com 4 dentro.'),
        },
        {
          texto: 'R$ 10', erro: 'desfaz-com-a-mesma-operacao',
          explica: 'O suco está somado ao sanduíche. Para desfazer o + 3, tire 3 dos dois lados: ${7 - 3 = 4}$.',
          fala: 'O suco está somado ao sanduíche. Para desfazer o mais três, tire três dos dois lados: sete menos três, quatro.',
          mostra: balanca({ esquerda: { x: 1 }, direita: { n: 4 }, riscadas: { esquerda: { n: 3 }, direita: { n: 3 } }, valor: 4, abrir: true, rotulo: 'x = 4' }, 'Os 3 pesos saem riscados dos dois pratos. A caixa se abre com 4 dentro.'),
        },
      ],
      esboco: 'Fecha o segundo caminho com o mesmo x = 4 do primeiro.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E com fração? Em ${\\frac{x}{3} = 5}$, a terça parte de x vale 5. Quanto vale x?',
      fala: 'E com fração? Em x sobre três igual a cinco, a terça parte de x vale cinco. Quanto vale x?',
      visual: terco(1, 'x/3 = 5', 'Uma barra (o x inteiro) partida em 3 partes iguais, com 1 parte pintada. À direita, x/3 = 5.'),
      opcoes: [
        {
          texto: '15', certa: true,
          explica: 'Isso. x tem três pedaços de 5: ${3 \\cdot 5 = 15}$. Multiplicar os dois lados por 3 desfaz o ÷ 3.',
          fala: 'Isso. x tem três pedaços de cinco: três vezes cinco, quinze. Multiplicar os dois lados por três desfaz o dividido por três.',
          mostra: terco(3, 'x = 15', 'As 3 partes se pintam, uma por uma: 5, 10, 15. À direita, x = 15.'),
        },
        {
          texto: '5', erro: 'opera-so-de-um-lado',
          explica: '5 é só um pedaço. Se o x vira x inteiro, o 5 também vai vezes 3: ${x = 15}$.',
          fala: 'Cinco é só um pedaço. Se o x vira x inteiro, o cinco também vai vezes três: x igual a quinze.',
          mostra: terco(3, 'x = 15', 'As 3 partes se pintam: três pedaços de 5 são 15.'),
        },
        {
          texto: '$\\frac{5}{3}$', erro: 'desfaz-com-a-mesma-operacao',
          explica: 'Dividir de novo deixaria x menor que 5. Mas 5 é só um terço dele: x é maior, ${3 \\cdot 5 = 15}$.',
          fala: 'Dividir de novo deixaria x menor que cinco. Mas cinco é só um terço dele: x é maior, três vezes cinco, quinze.',
          mostra: terco(3, 'x = 15', 'As 3 partes se pintam: o x inteiro é maior que o pedaço de 5.'),
        },
      ],
      esboco: 'A barra da unidade 7: um terço pintado vale 5. O inteiro tem três terços, então é 15. A fração some multiplicando os dois lados.',
    },
    {
      tipo: 'passo',
      problema: 'Agora ${\\frac{x}{2} + 1 = 4}$. Primeiro arrumar, depois resolver.',
      fala: 'Agora x sobre dois mais um igual a quatro. Primeiro arrumar, depois resolver.',
      visual: expr(['x/2 + 1 = 4'], 'A equação grande, sozinha. Cada passo acertado acrescenta uma linha embaixo.'),
      passos: [
        {
          pergunta: 'O que fazer primeiro?',
          opcoes: [
            {
              texto: 'Tirar 1 dos dois lados', certa: true,
              explica: 'Isso. Sem o 1, sobra só a fração: ${\\frac{x}{2} = 3}$.',
              fala: 'Isso. Sem o um, sobra só a fração: x sobre dois igual a três.',
              mostra: expr(['x/2 + 1 = 4', 'x/2 = 3'], 'Uma linha nova: x/2 = 3.'),
            },
            {
              texto: 'Multiplicar só o ${\\frac{x}{2}}$ por 2', erro: 'multiplica-so-um-termo',
              explica: 'Vezes 2 vale para os lados inteiros: o 1 e o 4 também. Mais fácil: tire o 1 antes.',
              fala: 'Vezes dois vale para os lados inteiros: o um e o quatro também. Mais fácil: tire o um antes.',
              mostra: expr(['x/2 + 1 = 4', '2 · (x/2 + 1) = 2 · 4', 'x + 2 = 8'], 'Multiplicando os lados inteiros: o 1 vira 2 e o 4 vira 8.'),
            },
          ],
          linha: { tex: '\\frac{x}{2} = 3', fala: 'tirando um dos dois lados, x sobre dois é igual a três' },
        },
        {
          pergunta: 'A metade de x é 3. E agora?',
          opcoes: [
            {
              texto: 'Multiplicar os dois lados por 2', certa: true,
              explica: 'Isso. ${x = 6}$. Confira: ${\\frac{6}{2} + 1 = 3 + 1 = 4}$.',
              fala: 'Isso. x igual a seis. Confira: seis sobre dois mais um, três mais um, quatro.',
              mostra: expr(['x/2 + 1 = 4', 'x/2 = 3', 'x = 6'], 'A última linha, maior: x = 6.'),
            },
            {
              texto: 'Dividir os dois lados por 2', erro: 'desfaz-com-a-mesma-operacao',
              explica: 'Se a metade de x é 3, x é o dobro: 6. Dividir de novo daria a metade da metade.',
              fala: 'Se a metade de x é três, x é o dobro: seis. Dividir de novo daria a metade da metade.',
              mostra: expr(['x/2 + 1 = 4', 'x/2 = 3', 'x = 6'], 'A última linha, maior: x = 6.'),
            },
          ],
          linha: { tex: 'x = 6 \\qquad \\tfrac{6}{2} + 1 = 4', fala: 'x é igual a seis; confere: seis sobre dois mais um, quatro' },
        },
      ],
      esboco: 'A ordem importa: o número solto sai primeiro, a fração depois. Quem multiplica só a fração vê os lados inteiros indo vezes 2.',
    },
    {
      tipo: 'anote',
      titulo: 'Primeiro arrumar, depois resolver',
      definicao: 'Tire os parênteses (ou divida os dois lados pelo número de fora). Desfaça a fração multiplicando **os dois lados** pelo número de baixo.',
      exemplo: { tex: '\\frac{x}{3} = 5 \\;\\to\\; x = 3 \\cdot 5 = 15', fala: 'x sobre três igual a cinco; multiplicando os dois lados por três, x é igual a quinze' },
      alerta: 'Multiplique o lado inteiro: em ${\\frac{x}{2} + 1 = 4}$, o 1 também iria vezes 2. Tire o 1 antes.',
      esboco: 'Na página: 2(x + 3) = 14 pelos dois caminhos (2x + 6 = 14 e x + 3 = 7), e x/3 = 5 com a barra partida em 3.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${3(x - 2) = 15}$ e confira trocando x pela sua resposta. Quanto vale x?',
      fala: 'No papel: resolva três, abre parênteses, x menos dois, igual a quinze, e confira trocando x pela sua resposta. Quanto vale x?',
      resposta: 7,
      sinal: true,
      resolucao: [
        { tex: '3(x - 2) = 15', fala: 'três vezes x menos dois é igual a quinze' },
        { tex: 'x - 2 = 5 \\qquad (\\div 3 \\text{ dos dois lados})', fala: 'dividindo os dois lados por três, x menos dois é igual a cinco' },
        { tex: 'x = 7 \\qquad (+ 2 \\text{ dos dois lados})', fala: 'somando dois dos dois lados, x é igual a sete' },
        { tex: '\\text{confere: } 3(7 - 2) = 3 \\cdot 5 = 15', fala: 'confere: três vezes sete menos dois, três vezes cinco, quinze' },
      ],
      esboco: 'O caminho mais curto é dividir por 3 primeiro. Distribuir também serve: 3x − 6 = 15, 3x = 21, x = 7.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['equacao-parenteses-n1', 'equacao-parenteses-n2', 'equacao-parenteses-n3'],
      esboco: 'Nível 1: a(x + b) = c com a balança, ou x/k = m com a barra. Nível 2: x/k + b = c e a(x − b) = c, sem visual. Nível 3: os combos e a conta dividida com gorjeta, em reais.',
    },
    {
      tipo: 'fecho',
      texto: 'O sanduíche custa **R$ 4**: ${2(4 + 3) = 14}$. Na próxima aula, a equação não vem pronta: você a monta a partir da história.',
      fala: 'O sanduíche custa quatro reais: dois vezes, abre parênteses, quatro mais três, catorze. Na próxima aula, a equação não vem pronta: você a monta a partir da história.',
      visual: RESOLVIDA,
      esboco: 'Responde ao gancho e anuncia a modelagem.',
    },
  ],
}
