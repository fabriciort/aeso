import type { Aula, Visual } from '@/lib/formation/schema'

// A fração também é uma divisão: 3 chocolates para 4 pessoas dá 3/4 para
// cada uma. Cortando cada chocolate em 4, cada pessoa pega um quarto de cada
// chocolate: 3 quartos. Por isso o traço da fração é um sinal de dividir:
// a/b = a ÷ b. Dividir o menor pelo maior não dá zero, e a ordem importa.

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const TRES = { partes: 1, inteiros: 3, semFracao: true }
const UM_DE_CADA = [{ partes: 4, marcadas: [0] }, { partes: 4, marcadas: [1] }, { partes: 4, marcadas: [2] }]

export const aula: Aula = {
  id: 'B.U7.A3',
  titulo: 'Fração como divisão',
  objetivo: 'Entender a fração a/b como o resultado de a ÷ b (o que cada um recebe ao repartir a inteiros entre b), escrever a divisão como fração e acertar a ordem.',
  modelo: 'barra',
  esboco: 'Três chocolates para quatro pessoas. Ninguém ganha um inteiro, mas ninguém fica sem: o aluno corta cada chocolate em 4 e vê que cada pessoa pega um pedaço de cada um. Os três pedaços, juntos numa barra só, pintam 3/4. Momento-chave: os três quartos espalhados (um em cada chocolate) se juntam e formam exatamente 3/4 de um chocolate; o traço da fração é a divisão.',
  vega: 'Ideia central: a fração a/b é o resultado de a ÷ b. Repartir 3 inteiros entre 4 dá 3/4 para cada um: corte cada inteiro em 4 e dê um pedaço de cada inteiro para cada pessoa. Vale também quando a é maior que b (5 ÷ 2 = 5/2, mais de 2 inteiros). Erros esperados: achar que 3 ÷ 4 dá zero ("não dá para dividir"); inverter a ordem (4/3); dividir só um dos inteiros (1/4). Guie perguntando "O que está sendo repartido?", "Entre quantos?", "Cada um ganha mais ou menos que um inteiro?". O que é repartido vai em cima; entre quantos, embaixo.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: '**3** chocolates para **4** pessoas, em partes iguais. Não dá um inteiro para cada. Quanto cada uma ganha?',
      fala: 'Três chocolates para quatro pessoas, em partes iguais. Não dá um inteiro para cada. Quanto cada uma ganha?',
      visual: barra({ ...TRES }, 'Três barras de chocolate inteiras, lado a lado. Proposta: quatro bonequinhos embaixo, esperando.'),
      esboco: 'Uma divisão "impossível" na escola, que todo mundo resolve na vida.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto chocolate cada pessoa recebe?',
      visual: barra({ ...TRES }, 'As três barras inteiras.'),
      opcoes: [
        {
          texto: '$\\frac{3}{4}$ de chocolate', fala: 'três quartos de chocolate', certa: true,
          explica: 'Isso. Corte os chocolates e confira.',
          mostra: barra({ partes: 4, pintadas: 3 }, 'Uma barra com 3/4 pintado.'),
        },
        {
          texto: 'Nada: 3 não se divide por 4', erro: 'menor-por-maior-da-zero',
          explica: 'Dá para cortar os chocolates. Ninguém fica sem: cada um ganha um pedaço de cada.',
          mostra: barra({ barras: UM_DE_CADA, semFracao: true }, 'Os três chocolates cortados em 4, com um pedaço de cada aceso para a mesma pessoa.'),
        },
        {
          texto: '$\\frac{4}{3}$ de chocolate', fala: 'quatro terços de chocolate', erro: 'divide-o-menor-pelo-maior',
          explica: '$\\frac{4}{3}$ passa de um chocolate inteiro. Com 3 chocolates para 4, ninguém ganha um inteiro.',
          mostra: barra({ partes: 3, pintadas: 4, inteiros: 2 }, 'Uma barra de 4/3 transborda para um segundo chocolate.'),
        },
        {
          texto: '$\\frac{1}{4}$ de chocolate', fala: 'um quarto de chocolate',
          explica: '$\\frac{1}{4}$ é a parte de um chocolate só. São 3 chocolates: um quarto de cada.',
          mostra: barra({ barras: UM_DE_CADA, semFracao: true }, 'Os três chocolates cortados em 4, com um pedaço de cada aceso.'),
        },
      ],
      esboco: 'Apostar antes de cortar. As quatro respostas que adultos realmente dão.',
    },
    {
      tipo: 'mexa',
      texto: 'Corte cada chocolate em **4** partes iguais, uma para cada pessoa.',
      fala: 'Corte cada chocolate em quatro partes iguais, uma para cada pessoa.',
      visual: barra({ ...TRES, partir: true, fator: 4 }, 'As três barras inteiras, com a borda tracejada. Um toque corta cada uma em 4.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos chocolates para cortar.',
        sucesso: { partes: 4 },
        mostre: 'Cada chocolate se corta em 4 partes iguais: 12 pedaços ao todo.',
      },
      descoberta: 'Cortando cada chocolate em 4, há 12 pedaços: 3 para cada pessoa.',
      esboco: 'Um toque, e os três chocolates se partem juntos.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada pessoa pega **um pedaço de cada** chocolate: 3 quartos.',
      fala: 'Cada pessoa pega um pedaço de cada chocolate: três quartos.',
      visual: barra({ barras: UM_DE_CADA, semFracao: true }, 'Os três chocolates empilhados, cada um em 4 partes. Acesos: a 1ª parte do primeiro, a 2ª do segundo, a 3ª do terceiro, em escada.'),
      esboco: 'A escada sugere o encaixe: os três pedaços cabem lado a lado numa barra só. Movimento: Os três chocolates sobem e se empilham; os pedaços de uma pessoa acendem em escada.',
    },
    {
      tipo: 'mexa',
      texto: 'Junte os 3 pedaços dela num chocolate só.',
      fala: 'Junte os três pedaços dela num chocolate só.',
      visual: barra({ barras: [...UM_DE_CADA, { partes: 4, pintadas: 0 }], ativa: 3, pintar: true, semFracao: true }, 'A escada de pedaços em cima e, embaixo, um chocolate vazio em 4 partes, com a borda tracejada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte no chocolate de baixo o que ela ganhou.',
        sucesso: { pintadas: 3 },
        mostre: 'Os três pedaços da escada descem e pintam 3 das 4 partes do chocolate de baixo.',
      },
      descoberta: 'Os 3 pedaços, um de cada chocolate, formam 3/4 de um chocolate.',
      esboco: 'Proposta: cada parte pintada embaixo puxa o pedaço da escada que está acima dela.',
    },
    {
      tipo: 'ideia',
      texto: '**3 dividido por 4** dá $\\frac{3}{4}$. O traço da fração é um sinal de dividir.',
      fala: 'Três dividido por quatro dá três quartos. O traço da fração é um sinal de dividir.',
      visual: barra({ partes: 4, pintadas: 3 }, 'O chocolate de 3/4, com a fração ao lado. Proposta: o sinal ÷ gira e vira o traço da fração.'),
      esboco: 'A notação chega como resumo do que ele montou. Movimento: O ÷ entre o 3 e o 4 gira e os dois pontos viram os números da fração.',
    },
    {
      tipo: 'anote',
      titulo: 'Fração como divisão',
      definicao: 'A fração $\\frac{a}{b}$ é o que cada um recebe ao dividir **a** inteiros entre **b**: $\\frac{a}{b} = a \\div b$.',
      exemplo: { tex: '3 \\div 4 = \\frac{3}{4}', fala: 'três dividido por quatro é três quartos' },
      alerta: 'Dividir o menor pelo maior não dá zero: dá uma fração menor que 1. E a ordem importa: o que se reparte vai em cima.',
      esboco: 'Na página: os três chocolates cortados e a escada de pedaços, com 3 ÷ 4 = 3/4.',
    },
    {
      tipo: 'aposta',
      pergunta: '**5** pizzas para **2** pessoas, em partes iguais. Quanto cada uma come?',
      fala: 'Cinco pizzas para duas pessoas, em partes iguais. Quanto cada uma come?',
      visual: barra({ partes: 1, inteiros: 5, semFracao: true }, 'Cinco barras inteiras, como cinco pizzas.'),
      opcoes: [
        {
          texto: '$\\frac{5}{2}$ de pizza', fala: 'cinco meios de pizza', certa: true,
          explica: 'Isso. $5 \\div 2 = \\frac{5}{2}$: 2 pizzas inteiras e mais meia.',
          mostra: barra({ partes: 2, pintadas: 5, inteiros: 3 }, 'Três pizzas cortadas ao meio, com 5 metades pintadas: 5/2.'),
        },
        {
          texto: '$\\frac{2}{5}$ de pizza', fala: 'dois quintos de pizza', erro: 'divide-o-menor-pelo-maior',
          explica: 'O que se reparte são as 5 pizzas: vão em cima. $\\frac{2}{5}$ nem chega a meia pizza.',
          mostra: barra({ partes: 2, pintadas: 5, inteiros: 3 }, 'As 5 metades pintadas que cada um come: 5/2.'),
        },
        {
          texto: '2 pizzas, e sobra 1',
          explica: 'A pizza que sobra também se divide: meia para cada. São $\\frac{5}{2}$.',
          mostra: barra({ partes: 2, pintadas: 5, inteiros: 3 }, 'A quinta pizza se corta ao meio, e a metade dela se pinta: 5/2.'),
        },
      ],
      esboco: 'A mesma regra quando o de cima é maior: a fração passa de 1.',
    },
    {
      tipo: 'passo',
      problema: 'Uma corda de **2 m** vai ser cortada em **3** pedaços iguais. Quanto mede cada pedaço?',
      fala: 'Uma corda de dois metros vai ser cortada em três pedaços iguais. Quanto mede cada pedaço?',
      visual: barra({ partes: 1, inteiros: 2, semFracao: true }, 'Dois metros de corda: duas barras de 1 m lado a lado.'),
      passos: [
        {
          pergunta: 'Qual é a divisão?',
          opcoes: [
            { texto: '$2 \\div 3$', fala: 'dois dividido por três', certa: true, explica: 'Isso. Os 2 m são repartidos em 3 pedaços.' },
            { texto: '$3 \\div 2$', fala: 'três dividido por dois', erro: 'divide-o-menor-pelo-maior', explica: 'O que se reparte é a corda, de 2 m. Ela vem primeiro: $2 \\div 3$.' },
          ],
          linha: { tex: '2 \\div 3', fala: 'dois dividido por três' },
        },
        {
          pergunta: 'Quanto mede cada pedaço?',
          opcoes: [
            { texto: '$\\frac{2}{3}$ de metro', fala: 'dois terços de metro', certa: true, explica: 'Isso. Um terço de cada metro: $\\frac{2}{3}$ m.', mostra: barra({ partes: 3, inteiros: 2, marcadas: [0, 3] }, 'Cada metro se corta em 3; um terço de cada metro acende: 2/3.') },
            { texto: '0 m: 2 não se divide por 3', erro: 'menor-por-maior-da-zero', explica: 'A corda se corta, sim. Cada pedaço é menor que 1 m: $\\frac{2}{3}$ m.' },
            { texto: '$\\frac{3}{2}$ de metro', fala: 'três meios de metro', erro: 'divide-o-menor-pelo-maior', explica: '$\\frac{3}{2}$ m passa de 1 m. Três pedaços assim não cabem em 2 m.' },
          ],
          linha: { tex: '2 \\div 3 = \\frac{2}{3} \\text{ m}', fala: 'dois dividido por três é dois terços de metro' },
        },
      ],
      esboco: 'Primeiro a ordem da divisão, depois a fração. A corda é a barra.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: **7** litros de suco em **4** jarras iguais. Quanto vai em cada jarra? Escreva como fração.',
      fala: 'No papel: sete litros de suco em quatro jarras iguais. Quanto vai em cada jarra? Escreva como fração.',
      resposta: '7/4',
      resolucao: [
        { tex: '7 \\div 4 = \\frac{7}{4} \\text{ L}', fala: 'sete dividido por quatro é sete quartos de litro' },
        { tex: '\\frac{7}{4} > \\frac{4}{4} = 1 \\text{ L}', fala: 'quatro quartos é um, então sete quartos passa de um litro' },
      ],
      esboco: 'Uma divisão em que o de cima é maior, com unidade.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fracao-divisao-n1', 'fracao-divisao-n2', 'fracao-divisao-n3'],
      esboco: 'Nível 1: chocolates repartidos, com a barra. Nível 2: uma divisão escrita como fração, de cima maior ou menor. Nível 3: cordas, sucos e terrenos, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'Cada pessoa ganha $\\frac{3}{4}$ de chocolate: **3 dividido por 4**. Na próxima aula: frações diferentes que são o mesmo número.',
      fala: 'Cada pessoa ganha três quartos de chocolate: três dividido por quatro. Na próxima aula: frações diferentes que são o mesmo número.',
      visual: barra({ barras: [...UM_DE_CADA, { partes: 4, pintadas: 3 }], destaque: 3 }, 'A escada apagada em cima e o chocolate de 3/4 aceso embaixo.'),
      esboco: 'Responde ao gancho com o chocolate montado.',
    },
  ],
}
