import type { Aula, Visual } from '@/lib/formation/schema'

// Dividir frações: "3 ÷ 1/2" pergunta quantas metades cabem em 3, e cabem 6.
// Dividir por uma fração menor que 1 aumenta. A conta: multiplicar pela
// fração que divide, invertida (3 ÷ 3/4 = 3 × 4/3 = 4). Fecha a unidade e
// aponta para os decimais.

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const XICARAS = { partes: 1, pintadas: 3, inteiros: 3, rotulo: '3 xícaras' }
const METADES = { partes: 2, pintadas: 6, inteiros: 3, rotulos: true, rotulo: '6 metades' }
const R3 = { de: 0, ate: 3, passo: 0.25, fracoes: 4, marcas: [0, 1, 2, 3] }
const COPOS = [[0, 0.75, '3/4'], [0.75, 1.5, '3/4'], [1.5, 2.25, '3/4'], [2.25, 3, '3/4']]

export const aula: Aula = {
  id: 'B.U7.A10',
  titulo: 'Dividir frações',
  objetivo: 'Dividir por uma fração lendo a divisão como "quantas vezes cabe", prever que dividir por uma fração menor que 1 aumenta, e calcular multiplicando pela fração que divide, invertida.',
  modelo: 'barra',
  esboco: 'Três xícaras de farinha e receitas que usam meia xícara cada. O aluno aposta se o resultado é maior ou menor que 3, corta cada xícara ao meio e conta 6 metades. Depois, copos de 3/4: 4 saltos na reta chegam ao 3. A regra (inverter a que divide e multiplicar) aparece como atalho do que ele já contou, e o erro de inverter a fração errada se desmonta com as barras. Momento-chave: as 3 xícaras viram 6 metades, e dividir dá mais.',
  vega: 'Ideia central: dividir é perguntar quantas vezes uma quantidade cabe na outra. Por isso, dividir por uma fração menor que 1 dá mais que o número (3 ÷ 1/2 = 6). Dividir por 1/2 é o mesmo que multiplicar por 2; em geral, dividir por c/d é multiplicar por d/c. Erros esperados: "dividir sempre diminui" (3 ÷ 1/2 = 1 e meio); inverter a primeira fração, e não a que divide; trocar a ordem (1/6 ÷ 2/3). Guie com "Quantas vezes isso cabe ali?", "Cabe mais de uma vez? Então o resultado passa de 1", "Quantos pedaços de 1/d há em cada inteiro?". Esta aula fecha a unidade: a próxima é de decimais, que são frações de denominador 10, 100, 1.000.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você tem **3** xícaras de farinha. Cada receita de panqueca usa $\\frac{1}{2}$ xícara. Quantas receitas dá?',
      fala: 'Você tem três xícaras de farinha. Cada receita de panqueca usa meia xícara. Quantas receitas dá?',
      visual: barra(XICARAS, 'Três xícaras inteiras, lado a lado, todas pintadas de farinha.'),
      esboco: 'Uma divisão por fração que qualquer pessoa resolve na cozinha, sem regra.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Isso é $3 \\div \\frac{1}{2}$. O resultado é maior ou menor que 3?',
      fala: 'Isso é três dividido por um meio. O resultado é maior ou menor que três?',
      visual: barra(XICARAS, 'As 3 xícaras.'),
      opcoes: [
        {
          texto: 'Maior: cabem muitas metades em 3', certa: true,
          explica: 'Isso. Em cada xícara cabem 2 metades. Em 3 xícaras, cabem mais de 3.',
        },
        {
          texto: 'Menor: dividir diminui', erro: 'dividir-sempre-diminui',
          explica: 'Dividir por 2 diminui. Dividir por $\\frac{1}{2}$ pergunta quantas metades cabem: muitas.',
        },
      ],
      esboco: 'A crença "dividir sempre diminui" aparece antes da conta, como na aula anterior.',
    },
    {
      tipo: 'mexa',
      texto: 'Corte cada xícara ao meio e conte as metades.',
      fala: 'Corte cada xícara ao meio e conte as metades.',
      visual: barra({ ...XICARAS, partir: true }, 'As 3 xícaras. Um toque corta todas ao meio; o pintado não muda, mas agora são 6 pedaços.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas xícaras.',
        sucesso: { partes: 2 },
        mostre: 'Cada xícara se corta ao meio: 6 metades, que se acendem uma a uma.',
      },
      descoberta: 'Em 3 xícaras cabem 6 metades: 3 ÷ 1/2 = 6.',
      esboco: 'O momento-chave: ver 6 pedaços onde havia 3. Proposta: as metades se contam com números que sobem, 1 a 6.',
    },
    {
      tipo: 'ideia',
      texto: 'Cabem **6** metades: $3 \\div \\frac{1}{2} = 6$. Dividir por $\\frac{1}{2}$ dá o mesmo que multiplicar por 2.',
      fala: 'Cabem seis metades: três dividido por um meio é seis. Dividir por um meio dá o mesmo que multiplicar por dois.',
      visual: barra(METADES, 'As 3 xícaras em metades, cada metade com 1/2 escrito dentro.'),
      esboco: 'Dá nome ao que ele contou e aponta para a regra.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E com copos de $\\frac{3}{4}$ de xícara? Quantos copos você enche com as 3 xícaras?',
      fala: 'E com copos de três quartos de xícara? Quantos copos você enche com as três xícaras?',
      visual: reta(R3, 'A reta de 0 a 3, marcada de quarto em quarto.'),
      opcoes: [
        {
          texto: '4', certa: true,
          explica: 'Isso. 4 saltos de $\\frac{3}{4}$ chegam ao 3.',
          mostra: reta({ ...R3, marcas: [0, 3], saltos: COPOS }, 'Os 4 saltos de 3/4 aparecem um depois do outro e chegam ao 3.'),
        },
        {
          texto: '$\\frac{9}{4}$', fala: 'nove quartos', erro: 'dividir-sempre-diminui',
          explica: '$3 \\times \\frac{3}{4} = \\frac{9}{4}$ é menos que 3. Mas a pergunta é quantos copos cabem: conte os saltos.',
          mostra: reta({ ...R3, marcas: [0, 3], saltos: COPOS }, 'Os 4 saltos chegam ao 3.'),
        },
        {
          texto: '12',
          explica: '12 é o número de quartos em 3 xícaras. Cada copo leva 3 deles: 4 copos.',
          mostra: reta({ ...R3, marcas: [0, 3], saltos: COPOS }, 'Os 12 quartos se agrupam de 3 em 3: 4 saltos.'),
        },
      ],
      esboco: 'Agora o numerador pesa: cada copo leva 3 quartos. A reta mostra os saltos.',
    },
    {
      tipo: 'ideia',
      texto: 'Em 3 xícaras cabem 12 quartos, e cada copo leva 3: $3 \\div \\frac{3}{4} = 3 \\times \\frac{4}{3} = 4$.',
      fala: 'Em três xícaras cabem doze quartos, e cada copo leva três: três dividido por três quartos é três vezes quatro terços, que é quatro.',
      visual: reta({ ...R3, marcas: [0, 3], saltos: COPOS }, 'Os 4 saltos de 3/4 sobre a reta.'),
      esboco: 'O atalho surge do que ele contou: vezes 4 (os quartos), dividido por 3 (cada copo).',
    },
    {
      tipo: 'anote',
      titulo: 'Dividir frações',
      definicao: 'Dividir por uma fração é perguntar quantas vezes ela cabe. A conta: multiplique pela fração que divide, invertida.',
      exemplo: { tex: '3 \\div \\frac{3}{4} = 3 \\times \\frac{4}{3} = 4', fala: 'três dividido por três quartos é três vezes quatro terços, que é quatro' },
      alerta: 'Inverta só a que divide, a segunda. E dividir por uma fração menor que 1 **aumenta**.',
      esboco: 'A reta com os 4 copos e a regra embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: '$\\frac{3}{4} \\div \\frac{1}{8}$: qual conta está certa?',
      fala: 'três quartos dividido por um oitavo: qual conta está certa?',
      visual: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 8, pintadas: 1 }] }, '3/4 em cima; um oitavo embaixo.'),
      opcoes: [
        {
          texto: '$\\frac{3}{4} \\times \\frac{8}{1} = 6$', certa: true,
          explica: 'Isso. Em $\\frac{3}{4}$ cabem 6 oitavos, porque $\\frac{3}{4} = \\frac{6}{8}$.',
          mostra: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 8, pintadas: 6 }] }, 'A barra de baixo enche até o fim dos 3/4: 6 oitavos.'),
        },
        {
          texto: '$\\frac{4}{3} \\times \\frac{1}{8} = \\frac{1}{6}$', erro: 'inverte-a-fracao-errada',
          explica: 'Inverteu a primeira. Inverte-se a que divide, $\\frac{1}{8}$. E cabem 6 oitavos, não menos que 1.',
          mostra: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 8, pintadas: 6 }] }, 'Os 6 oitavos enchem os 3/4.'),
        },
      ],
      esboco: 'O erro de inverter a fração errada, desmontado com as barras: o resultado tem de passar de 1.',
    },
    {
      tipo: 'passo',
      problema: 'Você tem $\\frac{2}{3}$ de xícara de óleo. Cada receita usa $\\frac{1}{6}$. Quantas receitas dá?',
      fala: 'Você tem dois terços de xícara de óleo. Cada receita usa um sexto. Quantas receitas dá?',
      visual: barra({ barras: [{ partes: 3, pintadas: 2 }, { partes: 6, pintadas: 1 }] }, '2/3 de óleo em cima, a dose de 1/6 embaixo.'),
      passos: [
        {
          pergunta: 'Quantas vezes $\\frac{1}{6}$ cabe em $\\frac{2}{3}$. Que conta é?',
          fala: 'Quantas vezes um sexto cabe em dois terços. Que conta é?',
          opcoes: [
            { texto: '$\\frac{2}{3} \\div \\frac{1}{6}$', certa: true, explica: 'Isso. O que se tem, dividido pelo tamanho da dose.' },
            { texto: '$\\frac{1}{6} \\div \\frac{2}{3}$', erro: 'divide-o-menor-pelo-maior', explica: 'Essa pergunta quantas vezes $\\frac{2}{3}$ cabe em $\\frac{1}{6}$. O óleo que você tem vem primeiro.' },
          ],
          linha: { tex: '\\frac{2}{3} \\div \\frac{1}{6}', fala: 'dois terços dividido por um sexto' },
        },
        {
          pergunta: 'Inverta a que divide e multiplique.',
          opcoes: [
            { texto: '$\\frac{2}{3} \\times \\frac{6}{1}$', certa: true, explica: 'Isso. Dividir por $\\frac{1}{6}$ é multiplicar por 6.' },
            { texto: '$\\frac{3}{2} \\times \\frac{1}{6}$', erro: 'inverte-a-fracao-errada', explica: 'Inverteu a primeira. Quem se inverte é a dose, $\\frac{1}{6}$.' },
          ],
          linha: { tex: '\\frac{2}{3} \\times \\frac{6}{1} = \\frac{12}{3}', fala: 'dois terços vezes seis é doze terços' },
        },
        {
          pergunta: 'Quantas receitas?',
          opcoes: [
            { texto: '4', certa: true, explica: 'Isso. $\\frac{12}{3} = 4$: e $\\frac{2}{3}$ são mesmo 4 sextos.', mostra: barra({ barras: [{ partes: 3, pintadas: 2 }, { partes: 6, pintadas: 4 }] }, 'Os 2/3 em sextos: 4 doses.') },
            { texto: '$\\frac{1}{4}$', erro: 'dividir-sempre-diminui', explica: 'A dose é pequena e cabe várias vezes: o resultado passa de 1. São 4.' },
          ],
          linha: { tex: '\\frac{12}{3} = 4', fala: 'doze terços é quatro' },
        },
      ],
      esboco: 'O roteiro: montar a divisão na ordem certa, inverter a que divide, conferir com as barras.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: com $\\frac{5}{2}$ L de suco, quantos copos de $\\frac{1}{4}$ L você enche?',
      fala: 'No papel: com cinco meios litros de suco, quantos copos de um quarto de litro você enche?',
      resposta: 10,
      resolucao: [
        { tex: '\\frac{5}{2} \\div \\frac{1}{4} = \\frac{5}{2} \\times \\frac{4}{1}', fala: 'cinco meios dividido por um quarto é cinco meios vezes quatro' },
        { tex: '\\frac{20}{2} = 10', fala: 'vinte meios é dez' },
      ],
      esboco: 'Conferência: 5/2 L são 2 L e meio; em cada litro cabem 4 copos: 8 + 2 = 10.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['dividir-fracoes-n1', 'dividir-fracoes-n2', 'dividir-fracoes-n3'],
      esboco: 'Nível 1: quantos 1/d cabem em n, com as barras. Nível 2: copos de c/d, com saltos na reta. Nível 3: fração dividida por fração numa receita, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Dá **6** receitas: cabem 6 metades em 3 xícaras. Você já muda o tamanho de qualquer receita. Na próxima unidade: decimais.',
      fala: 'Dá seis receitas: cabem seis metades em três xícaras. Você já muda o tamanho de qualquer receita. Na próxima unidade: decimais.',
      visual: barra(METADES, 'As 6 metades acesas nas 3 xícaras.'),
      esboco: 'Fecha o gancho e a unidade. Decimais são frações de 10, 100, 1.000: a ponte natural.',
    },
  ],
}
