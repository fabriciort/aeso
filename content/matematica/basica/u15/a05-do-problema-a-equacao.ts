import type { Aula, Visual } from '@/lib/formation/schema'

// Do problema à equação. Até aqui a equação vinha pronta; agora o aluno a
// monta a partir de uma história, em quatro passos: dizer o que é o x,
// montar, resolver e conferir no problema, respondendo com a unidade. A
// corrida de aplicativo da unidade 14 volta: R$ 5 para começar e R$ 2 por
// km. Lá, o preço de x km era 5 + 2x; aqui, você pagou R$ 19 e quer os km:
// 5 + 2x = 19. O momento-chave: escolher a equação que diz o problema (e
// ler de volta, em palavras, as que não dizem) e, no fim, responder "7 km",
// não "R$ 7" nem "R$ 14". Depois, a idade: o pai tem o triplo da idade do
// filho, juntos somam 48. O x é o filho (12), mas a pergunta é o pai (36).

const balanca = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'balanca', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** A corrida: 2 caixas (R$ 2 por km, x km) e 5 pesos (R$ 5 de começar), contra 19. */
const CORRIDA = { esquerda: { x: 2, n: 5 }, direita: { n: 19 } }
const RESPOSTA = balanca({ esquerda: { x: 1 }, direita: { n: 7 }, valor: 7, abrir: true, rotulo: 'x = 7 km' }, 'Uma caixa contra 7 pesos. A caixa se abre com 7 dentro; embaixo, x = 7 km.')

/** O pai e o filho na barra: o filho é um pedaço; o pai, três pedaços iguais ao do filho. */
const familia = (filho: string, pai: string, esboco: string): Visual => ({
  modelo: 'barra',
  estado: { barras: [{ partes: 1, pintadas: 1, rotulo: filho }, { partes: 1, pintadas: 3, inteiros: 3, rotulo: pai }], escala: 3 },
  esboco,
})

export const aula: Aula = {
  id: 'B.U15.A5',
  titulo: 'Do problema à equação',
  objetivo: 'Transformar uma situação numa equação do 1º grau e resolvê-la em quatro passos: dizer o que é o x, montar a equação, resolver e conferir no problema, respondendo à pergunta com a unidade.',
  modelo: 'balanca',
  esboco: 'Abre com a corrida de aplicativo da unidade 14, agora ao contrário: você pagou R$ 19 e quer os km. O aluno escolhe a equação que diz o problema (5 + 2x = 19) e desmonta as que não dizem (2 + 5x = 19, 2x = 19). Resolve na balança, tirando 5 e partindo em 2, e responde 7 km. O momento-chave é a ida e a volta entre a história e a equação: montar e, no fim, responder o que foi perguntado. Depois, a idade do pai e do filho na barra, com x = 12 e a resposta 36.',
  vega: 'Ideia central: um problema vira equação em quatro passos. 1. Dizer o que é o x (os km da corrida, a idade do filho). 2. Montar: cada lado da equação diz uma parte da história (5 + 2x é o preço da corrida; 19 é o que se pagou). 3. Resolver, fazendo a mesma conta dos dois lados. 4. Conferir no problema e responder com a unidade (7 km; o pai tem 36 anos). Erros esperados: montar trocando os papéis dos números (2 + 5x = 19), esquecer o valor fixo (2x = 19), deixar uma parte de fora (3x = 48 para pai e filho juntos), responder o x quando a pergunta é outra (12 em vez de 36) ou com a unidade errada (R$ 7). Guie com "O que você não sabe? Chame isso de x", "Leia a equação em voz alta: ela conta a história?", "Releia a pergunta: o x é o que ela pede?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma corrida de aplicativo custa **R$ 5** para começar e **R$ 2** por km. Você pagou **R$ 19**. Quantos km andou?',
      fala: 'Uma corrida de aplicativo custa cinco reais para começar e dois reais por quilômetro. Você pagou dezenove reais. Quantos quilômetros andou?',
      visual: expr(['R$ 5 para começar', 'R$ 2 por km', 'você pagou R$ 19'], 'Os dados da corrida em três linhas; a última, maior: você pagou R$ 19.'),
      esboco: 'Na unidade 14 o aluno calculou o preço a partir dos km. Agora o caminho é o contrário, e a conta não sai de cabeça tão fácil.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Chame os km de **x**. Na unidade 14, o preço de x km era ${5 + 2x}$. Qual equação conta esta história?',
      fala: 'Chame os quilômetros de x. Na unidade catorze, o preço de x quilômetros era cinco mais dois x. Qual equação conta esta história?',
      visual: expr(['R$ 5 para começar', 'R$ 2 por km', 'você pagou R$ 19'], 'Os mesmos dados.'),
      opcoes: [
        {
          texto: '$5 + 2x = 19$', certa: true,
          explica: 'Isso. O preço da corrida, ${5 + 2x}$, é igual ao que você pagou, 19.',
          fala: 'Isso. O preço da corrida, cinco mais dois x, é igual ao que você pagou, dezenove.',
          mostra: balanca({ ...CORRIDA, mostraEquacao: true }, 'A balança: 2 caixas e 5 pesos contra 19 pesos, em equilíbrio. Embaixo, 2x + 5 = 19.'),
        },
        {
          texto: '$2 + 5x = 19$', erro: 'equacao-diferente-do-problema',
          explica: 'Leia de volta: seriam R$ 2 para começar e R$ 5 por km. O fixo é o 5; o 2 vai com o x.',
          fala: 'Leia de volta: seriam dois reais para começar e cinco reais por quilômetro. O fixo é o cinco; o dois vai com o x.',
          mostra: balanca({ ...CORRIDA, mostraEquacao: true }, 'A balança da corrida certa: 2 caixas (R$ 2 por km) e 5 pesos (R$ 5 de começar).'),
        },
        {
          texto: '$2x = 19$', erro: 'esquece-valor-fixo',
          explica: 'Faltaram os R$ 5 de começar. Mesmo com 0 km, a corrida custa 5: ${5 + 2x = 19}$.',
          fala: 'Faltaram os cinco reais de começar. Mesmo com zero quilômetro, a corrida custa cinco: cinco mais dois x igual a dezenove.',
          mostra: balanca({ ...CORRIDA, mostraEquacao: true }, 'A balança da corrida: os 5 pesos de começar estão no prato da esquerda.'),
        },
      ],
      esboco: 'O momento-chave da montagem: cada lado da equação diz uma parte da história. As erradas se desmontam lendo-as de volta em palavras.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora resolva na balança. Primeiro, tire os 5 pesos de começar dos dois pratos.',
      fala: 'Agora resolva na balança. Primeiro, tire os cinco pesos de começar dos dois pratos.',
      visual: balanca({ ...CORRIDA, tirar: true, mostraEquacao: true }, '2x + 5 = 19, com as peças tocáveis. Tirando só de um lado, a balança inclina.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos pesos para tirá-los, o mesmo dos dois lados.',
        sucesso: { esquerda: { x: 2 }, direita: { n: 14 } },
        mostre: 'Saem 5 pesos de cada prato. Sobram 2 caixas contra 14: 2x = 14.',
      },
      descoberta: 'Sem os R$ 5 de começar, sobra o que se pagou pelos km: 2x = 14.',
      esboco: 'A resolução é a das aulas anteriores. O que é novo é saber o que cada peça quer dizer: os 14 pesos são os reais dos km.',
    },
    {
      tipo: 'mexa',
      texto: 'Sobrou ${2x = 14}$: os km custaram **R$ 14**. Parta cada prato em 2 e fique com um grupo.',
      fala: 'Sobrou dois x igual a catorze: os quilômetros custaram catorze reais. Parta cada prato em dois e fique com um grupo.',
      visual: balanca({ esquerda: { x: 2 }, direita: { n: 14 }, dividir: 2, mostraEquacao: true }, 'Cada prato partido em 2 grupos: uma caixa em cada grupo da esquerda, 7 pesos em cada grupo da direita.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque num dos grupos com a borda tracejada.',
        sucesso: { dividido: true },
        mostre: 'Fica um grupo de cada lado: 1 caixa contra 7 pesos. Embaixo, x = 7.',
      },
      descoberta: 'Uma caixa vale 7: x = 7.',
      esboco: 'Dividir por 2 dos dois lados: cada km custa R$ 2, então R$ 14 pagam 7 km.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Achou ${x = 7}$. Qual é a resposta do problema?',
      fala: 'Achou x igual a sete. Qual é a resposta do problema?',
      visual: balanca({ esquerda: { x: 2 }, direita: { n: 14 }, dividir: 2, rotulo: 'x = 7' }, 'Os pratos ainda partidos em 2 grupos, um aceso de cada lado: 1 caixa contra 7 pesos. Embaixo, x = 7.'),
      opcoes: [
        {
          texto: '7 km', certa: true,
          explica: 'Isso. O x são os km. Confira: ${5 + 2 \\cdot 7 = 5 + 14 = 19}$.',
          fala: 'Isso. O x são os quilômetros. Confira: cinco mais dois vezes sete, cinco mais catorze, dezenove.',
          mostra: RESPOSTA,
        },
        {
          texto: 'R$ 7', erro: 'responde-outra-pergunta',
          explica: 'O x não é dinheiro: são os km. A pergunta foi quantos km: 7 km.',
          fala: 'O x não é dinheiro: são os quilômetros. A pergunta foi quantos quilômetros: sete quilômetros.',
          mostra: RESPOSTA,
        },
        {
          texto: 'R$ 14', erro: 'responde-outra-pergunta',
          explica: 'R$ 14 é o que você pagou pelos km. A pergunta é quantos km: ${14 \\div 2 = 7}$.',
          fala: 'Catorze reais é o que você pagou pelos quilômetros. A pergunta é quantos quilômetros: catorze dividido por dois, sete.',
          mostra: RESPOSTA,
        },
      ],
      esboco: 'Voltar à história: o número achado tem uma unidade, e a resposta é o que a pergunta pede.',
    },
    {
      tipo: 'anote',
      titulo: 'Do problema à equação',
      definicao: '**1.** Diga o que é o x. **2.** Monte a equação. **3.** Resolva. **4.** Confira no problema e responda com a unidade.',
      exemplo: { tex: '5 + 2x = 19 \\;\\to\\; x = 7 \\;\\to\\; 7 \\text{ km}', fala: 'cinco mais dois x igual a dezenove, x igual a sete, sete quilômetros' },
      alerta: 'Responda o que foi perguntado. Se o x é a idade do filho e a pergunta é a do pai, ainda falta uma conta.',
      esboco: 'Na página: os quatro passos numerados, com a corrida ao lado de cada um (x = km; 5 + 2x = 19; x = 7; 5 + 14 = 19, 7 km).',
    },
    {
      tipo: 'passo',
      problema: 'Um pai tem **o triplo** da idade do filho. Juntos, os dois somam **48 anos**. Quantos anos tem o pai?',
      fala: 'Um pai tem o triplo da idade do filho. Juntos, os dois somam quarenta e oito anos. Quantos anos tem o pai?',
      visual: familia('filho', 'pai', 'Duas barras: o filho, um pedaço; o pai, três pedaços do mesmo tamanho, lado a lado.'),
      passos: [
        {
          pergunta: 'Chame a idade do filho de **x**. Como se escreve a idade do pai?',
          fala: 'Chame a idade do filho de x. Como se escreve a idade do pai?',
          opcoes: [
            {
              texto: '$3x$', certa: true,
              explica: 'Isso. O triplo é 3 vezes: três pedaços do tamanho do filho.',
              fala: 'Isso. O triplo é três vezes: três pedaços do tamanho do filho.',
              mostra: familia('filho: x', 'pai: 3x', 'As mesmas barras, com filho: x e pai: 3x à direita.'),
            },
            {
              texto: '$x + 3$', erro: 'vezes-como-mais',
              explica: '${x + 3}$ é 3 anos a mais. O triplo são três pedaços iguais ao do filho: ${3x}$.',
              fala: 'x mais três é três anos a mais. O triplo são três pedaços iguais ao do filho: três x.',
              mostra: familia('filho: x', 'pai: 3x', 'As barras com filho: x e pai: 3x.'),
            },
          ],
          linha: { tex: '\\text{filho: } x \\qquad \\text{pai: } 3x', fala: 'filho, x; pai, três x' },
        },
        {
          pergunta: 'Juntos, somam 48. Qual é a equação?',
          opcoes: [
            {
              texto: '$x + 3x = 48$', certa: true,
              explica: 'Isso. O filho mais o pai: 4 pedaços iguais somam 48.',
              fala: 'Isso. O filho mais o pai: quatro pedaços iguais somam quarenta e oito.',
              mostra: familia('filho: x', 'pai: 3x', 'As barras com filho: x e pai: 3x. Ao todo, 4 pedaços iguais.'),
            },
            {
              texto: '$3x = 48$', erro: 'equacao-diferente-do-problema',
              explica: '${3x}$ é só o pai. Juntos é o filho mais o pai: ${x + 3x = 48}$.',
              fala: 'Três x é só o pai. Juntos é o filho mais o pai: x mais três x igual a quarenta e oito.',
              mostra: familia('filho: x', 'pai: 3x', 'As duas barras juntas: 4 pedaços.'),
            },
          ],
          linha: { tex: 'x + 3x = 48', fala: 'x mais três x igual a quarenta e oito' },
        },
        {
          pergunta: '${x + 3x}$ são ${4x}$. Resolva ${4x = 48}$.',
          fala: 'x mais três x são quatro x. Resolva quatro x igual a quarenta e oito.',
          opcoes: [
            {
              texto: '$x = 12$', certa: true,
              explica: 'Isso. Dividindo os dois lados por 4: ${48 \\div 4 = 12}$. Cada pedaço vale 12.',
              fala: 'Isso. Dividindo os dois lados por quatro: quarenta e oito dividido por quatro, doze. Cada pedaço vale doze.',
              mostra: familia('filho: 12', 'pai: ?', 'O filho ganha o 12; o pai ainda tem um "?".'),
            },
            {
              texto: '$x = 44$', erro: 'subtrai-o-coeficiente',
              explica: '${4x}$ é 4 vezes x, não x mais 4. Divida os dois lados por 4: ${x = 12}$.',
              fala: 'Quatro x é quatro vezes x, não x mais quatro. Divida os dois lados por quatro: x igual a doze.',
              mostra: familia('filho: 12', 'pai: ?', 'O filho ganha o 12.'),
            },
          ],
          linha: { tex: '4x = 48 \\;\\to\\; x = 12', fala: 'quatro x igual a quarenta e oito, x igual a doze' },
        },
        {
          pergunta: 'Qual é a resposta do problema?',
          opcoes: [
            {
              texto: '12 anos', erro: 'responde-outra-pergunta',
              explica: '12 é o filho, o x. A pergunta é o pai: ${3 \\cdot 12 = 36}$ anos.',
              fala: 'Doze é o filho, o x. A pergunta é o pai: três vezes doze, trinta e seis anos.',
              mostra: familia('filho: 12', 'pai: 36', 'O pai ganha o 36.'),
            },
            {
              texto: '36 anos', certa: true,
              explica: 'Isso. Confira: ${12 + 36 = 48}$, e 36 é o triplo de 12.',
              fala: 'Isso. Confira: doze mais trinta e seis, quarenta e oito, e trinta e seis é o triplo de doze.',
              mostra: familia('filho: 12', 'pai: 36', 'O pai ganha o 36: três pedaços de 12.'),
            },
          ],
          linha: { tex: '\\text{pai: } 3 \\cdot 12 = 36 \\text{ anos}', fala: 'o pai tem três vezes doze, trinta e seis anos' },
        },
      ],
      esboco: 'Os quatro passos, um por pergunta. A barra mostra a história: 4 pedaços iguais somam 48, e o pai são 3 deles.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: 3 amigos dividiram uma conta. Cada um pagou a sua parte e mais **R$ 10** de gorjeta: **R$ 40**. De quanto era a conta?',
      fala: 'No papel: três amigos dividiram uma conta. Cada um pagou a sua parte e mais dez reais de gorjeta: quarenta reais. De quanto era a conta?',
      resposta: 90,
      resolucao: [
        { tex: 'x = \\text{a conta} \\qquad \\frac{x}{3} + 10 = 40', fala: 'x é a conta; x sobre três mais dez é igual a quarenta' },
        { tex: '\\frac{x}{3} = 30 \\qquad (-10 \\text{ dos dois lados})', fala: 'tirando dez dos dois lados, x sobre três é igual a trinta' },
        { tex: 'x = 90 \\qquad (\\times 3 \\text{ dos dois lados})', fala: 'multiplicando os dois lados por três, x é igual a noventa' },
        { tex: '\\text{confere: } 90 \\div 3 + 10 = 30 + 10 = 40', fala: 'confere: noventa dividido por três, trinta, mais dez, quarenta' },
      ],
      esboco: 'Junta a montagem com a fração da aula passada. A resposta é a conta toda, R$ 90, não a parte de cada um (R$ 30).',
    },
    {
      tipo: 'sua-vez',
      geradores: ['equacao-problema-n1', 'equacao-problema-n2', 'equacao-problema-n3'],
      esboco: 'Nível 1: escolher a equação de uma tarifa (fixo mais um valor por unidade). Nível 2: resolver a tarifa e responder a quantidade. Nível 3: idades (o triplo, ou tantos anos a mais), com a resposta que não é o x.',
    },
    {
      tipo: 'fecho',
      texto: 'Você andou **7 km**: ${5 + 2 \\cdot 7 = 19}$. Na próxima aula: quando a balança não fica reta.',
      fala: 'Você andou sete quilômetros: cinco mais dois vezes sete, dezenove. Na próxima aula: quando a balança não fica reta.',
      visual: RESPOSTA,
      esboco: 'Responde ao gancho com a caixa aberta e anuncia as inequações.',
    },
  ],
}
