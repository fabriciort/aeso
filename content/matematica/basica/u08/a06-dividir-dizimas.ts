import type { Aula, Visual } from '@/lib/formation/schema'

// Dividir com decimais é continuar a divisão da unidade 4 depois da vírgula:
// o resto que sobra vira décimos, depois centésimos, e a conta segue. Em
// 7 ÷ 4, os 3 reais que sobram viram 30 moedas de 10 centavos, e cada um
// paga R$ 1,75. Às vezes o resto volta sempre: 10 ÷ 3 = 3,333…, a dízima
// periódica, e 1/3 = 0,333…. Dividir por um decimal menor que 1 aumenta
// (3 ÷ 0,5 = 6), como na divisão de frações. Fecha a unidade.

type Divisao = { dividendo: number | string; divisor: number; quociente?: string; linhas?: [string, number][]; destaque?: number }
const chave = (d: Divisao, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { divisao: d }, esboco })
const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })
const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })

const MOEDAS = { dezenas: 'R$ 1', unidades: '10 centavos' }
const D7 = { dividendo: 7, divisor: 4 }
const D700: Divisao = { dividendo: 700, divisor: 4, quociente: '175', linhas: [['−4', 0], ['30', 1], ['−28', 1], ['20', 2], ['−20', 2], ['0', 2]] }
const D1000: Divisao = { dividendo: '10,000', divisor: 3, quociente: '3,333', linhas: [['−9', 1], ['1 0', 3], ['−9', 3], ['10', 4], ['−9', 4], ['10', 5], ['−9', 5], ['1', 5]] }
const TERCO = { pintadas: 33, rotulo: '0,333…' }
const R3 = { de: 0, ate: 3, passo: 0.5, marcas: [0, 1, 2, 3] }
const COPOS = [[0, 0.5, '0,5'], [0.5, 1, '0,5'], [1, 1.5, '0,5'], [1.5, 2, '0,5'], [2, 2.5, '0,5'], [2.5, 3, '0,5']]

export const aula: Aula = {
  id: 'B.U8.A6',
  titulo: 'Dividir e as dízimas',
  objetivo: 'Continuar uma divisão depois da vírgula, transformando o resto em décimos e centésimos; reconhecer uma dízima periódica quando o resto se repete (10 ÷ 3 = 3,333…; 1/3 = 0,333…); prever que dividir por um decimal menor que 1 aumenta.',
  modelo: 'quadro-posicional',
  esboco: 'Quatro colegas dividem R$ 7 de café. Na chave, 7 ÷ 4 dá 1 e sobram 3, e muita gente escreve 1,3. O aluno troca os 3 reais por 30 moedas de 10 centavos, que se repartem: 7 para cada, e ainda sobram 20 centavos, 5 para cada. R$ 1,75. Depois R$ 10 para 3: o resto 1 volta sempre, e nasce a dízima 3,333…. Por fim, 3 L em copos de 0,5 L, e o "dividir diminui" cai. Momento-chave: as 3 notas de R$ 1 virando 30 moedas, que ainda dá para repartir.',
  vega: 'Ideia central: o resto de uma divisão ainda pode ser repartido. Ponha a vírgula no quociente, troque o resto por décimos (um 0 a mais), divida, e repita com os centésimos. 7 ÷ 4 = 1,75 porque 7 reais são 700 centavos, e 700 ÷ 4 = 175. Se o resto se repete, a conta não termina: é uma dízima periódica (10 ÷ 3 = 3,333…; 1/3 = 0,333…), e 3,33 é só uma aproximação. Dividir por um número menor que 1 aumenta: 3 ÷ 0,5 = 6, porque cabem 2 meios litros em cada litro. Erros esperados: escrever o resto depois da vírgula (7 ÷ 4 = 1,3); achar que a dízima termina (1/3 = 0,3 ou 0,33 exato); achar que dividir sempre diminui (3 ÷ 0,5 = 1,5). Guie com "Os 3 reais que sobram ainda dá para repartir?", "Em quantas moedas de 10 centavos eles se trocam?", "O resto voltou ao mesmo número?", "Quantos copos de 0,5 L cabem em 1 litro?". Esta aula fecha a unidade.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Quatro colegas dividem **R$ 7** de café. Quanto cada um paga?',
      fala: 'Quatro colegas dividem sete reais de café. Quanto cada um paga?',
      visual: chave(D7, 'A chave da unidade 4: 7 dentro, 4 na caixa, o quociente vazio.'),
      esboco: 'Uma divisão que não dá certo nos inteiros, mas que se resolve todo dia no caixa.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na chave, 7 ÷ 4 dá 1 e sobram 3. Quanto cada um paga?',
      fala: 'Na chave, sete dividido por quatro dá um e sobram três. Quanto cada um paga?',
      visual: chave({ ...D7, quociente: '1', linhas: [['−4', 0], ['3', 0]] }, 'O 1 no quociente, o −4 e o resto 3 embaixo do 7.'),
      opcoes: [
        {
          texto: 'R$ 1,75', certa: true,
          explica: 'Isso. 4 × R$ 1,75 = R$ 7. Os 3 reais que sobram também se repartem.',
        },
        {
          texto: 'R$ 1,30', erro: 'resto-vira-decimal',
          explica: 'O 3 é o resto: 3 reais, não 30 centavos. 4 × R$ 1,30 dá só R$ 5,20.',
        },
        {
          texto: 'R$ 1', erro: 'descarta-sobra',
          explica: 'Assim ficam 3 reais na mesa, sem dono. Eles ainda podem ser repartidos.',
        },
      ],
      esboco: 'O erro do 1,3 é o mais comum: o resto vira a parte decimal. A conferência (4 × 1,30) desmonta.',
    },
    {
      tipo: 'mexa',
      texto: 'Os 3 reais que sobram não dão 1 real para cada. Troque cada um por **10 moedas** de 10 centavos.',
      fala: 'Os três reais que sobram não dão um real para cada. Troque cada um por dez moedas de dez centavos.',
      visual: blocos({ centenas: 0, dezenas: 3, unidades: 0, desagrupar: true, rotulos: MOEDAS }, 'Três barras com a legenda R$ 1; cada toque abre uma barra em 10 cubos, que são moedas de 10 centavos. Proposta: as peças com cara de nota e de moeda.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas notas de R$ 1.',
        sucesso: { dezenas: 0, unidades: 30 },
        mostre: 'As 3 barras se abrem, uma a uma, em 30 cubos: 30 moedas de 10 centavos.',
      },
      descoberta: 'O resto 3 vira 30 décimos de real. 30 ÷ 4 = 7, e sobram 2: são 20 centavos, que dão 5 para cada. 1 + 0,70 + 0,05 = 1,75.',
      esboco: 'O momento-chave: é a troca da divisão longa da unidade 4, agora depois da vírgula. Proposta: as 30 moedas se repartem em 4 montes de 7, e as 2 que sobram se trocam por 20 de 1 centavo.',
    },
    {
      tipo: 'ideia',
      texto: '7 reais são **700 centavos**, e 700 ÷ 4 = 175 centavos. Cada um paga **R$ 1,75**.',
      fala: 'Sete reais são setecentos centavos, e setecentos dividido por quatro é cento e setenta e cinco centavos. Cada um paga um real e setenta e cinco.',
      visual: chave(D700, 'A chave de 700 ÷ 4, completa: 175. Proposta: uma chave com vírgula, 7,00 ÷ 4 = 1,75, com a vírgula do quociente aparecendo quando o primeiro 0 desce.'),
      esboco: 'Na chave de hoje, só inteiros: o truque dos centavos mostra que o 0 que desce é um décimo, depois um centésimo. Movimento: o 7 ganha dois zeros apagados; a conta continua e o 175 se escreve; a vírgula entra depois do 1.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E **R$ 10** para **3** pessoas? 10 ÷ 3 dá 3 e sobra 1. Continue.',
      fala: 'E dez reais para três pessoas? Dez dividido por três dá três e sobra um. Continue.',
      visual: chave({ dividendo: 10, divisor: 3, quociente: '3', linhas: [['−9', 1], ['1', 1]] }, 'A chave de 10 ÷ 3, com o resto 1.'),
      opcoes: [
        {
          texto: '3,333…, e não acaba', certa: true,
          explica: 'Isso. O resto é sempre 1: vira 10, dá 3, sobra 1 de novo. A conta não termina.',
          mostra: chave(D1000, 'A chave de 10,000 ÷ 3: o resto 1 aparece de novo a cada linha, em âmbar.'),
        },
        {
          texto: '3,1', erro: 'resto-vira-decimal',
          explica: 'O 1 é o resto: 1 real, que ainda se reparte. 3 × 3,10 dá só 9,30.',
          mostra: chave(D1000, 'O resto 1 vira 10 décimos, que dão 3 para cada, e volta a sobrar 1.'),
        },
        {
          texto: '3,33, exato', erro: 'dizima-como-exata',
          explica: '3 × 3,33 = 9,99: falta 1 centavo. A conta continua e não para nunca.',
          mostra: chave(D1000, 'O resto 1 no fim da conta pisca: ainda sobra 1 centavo.'),
        },
      ],
      esboco: 'A primeira dízima, num lugar real: no caixa, alguém paga 1 centavo a mais.',
    },
    {
      tipo: 'ideia',
      texto: 'Quando o resto se repete, a conta não termina: é uma **dízima periódica**. $10 \\div 3 = 3{,}333\\ldots$',
      fala: 'Quando o resto se repete, a conta não termina: é uma dízima periódica. Dez dividido por três é três vírgula três três três, e assim por diante.',
      visual: chave(D1000, 'A chave de 10,000 ÷ 3 com os restos 1 em âmbar, um embaixo do outro, e reticências embaixo de tudo.'),
      esboco: 'O nome chega depois de o aluno ver o resto voltar.',
    },
    {
      tipo: 'anote',
      titulo: 'Dividir com decimais',
      definicao: 'Se sobrar resto, ponha a vírgula no quociente e continue com um 0. Se o resto se repetir, é uma dízima periódica.',
      exemplo: { tex: '7 \\div 4 = 1{,}75 \\qquad 10 \\div 3 = 3{,}333\\ldots', fala: 'sete dividido por quatro é um vírgula setenta e cinco; dez dividido por três é três vírgula três três três, sem fim' },
      alerta: 'O resto não é a parte decimal: 7 ÷ 4 não é 1,3. E 3,33 é só um arredondamento de 10 ÷ 3.',
      esboco: 'A página com as duas chaves lado a lado: a que termina e a que não termina.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um terço de uma pizza: $\\frac{1}{3} = 1 \\div 3$. Quanto é, em decimal?',
      fala: 'Um terço de uma pizza: um terço é um dividido por três. Quanto é, em decimal?',
      visual: grade({ pintadas: 0, semRotulo: true }, 'A grade vazia, como a pizza inteira.'),
      opcoes: [
        {
          texto: '0,333…', certa: true,
          explica: 'Isso. 33 quadradinhos e mais um pedaço do seguinte, que nunca fecha.',
          mostra: grade(TERCO, 'A grade com 33 quadradinhos pintados e um terço do 34º, em âmbar mais claro. Proposta: uma chave para pintar uma fração de quadradinho.'),
        },
        {
          texto: '0,3', erro: 'dizima-como-exata',
          explica: '0,3 são 30 quadradinhos. Três vezes isso dá 90: faltam 10 para a pizza inteira.',
          mostra: grade({ grades: [{ pintadas: 30 }, { pintadas: 33 }], destaque: 0 }, '0,3 ao lado de 0,333…: o 0,3 fica um pouco menor.'),
        },
        {
          texto: '3', erro: 'divide-o-menor-pelo-maior',
          explica: '3 é 3 ÷ 1: três pizzas. Um terço é menos que uma pizza.',
          mostra: grade(TERCO, 'Um terço da grade.'),
        },
      ],
      esboco: 'A ponte com as frações: 1/3 é um número de verdade, mas em decimal não termina.',
    },
    {
      tipo: 'aposta',
      pergunta: '**3 L** de suco em copos de **0,5 L**. Quantos copos? É $3 \\div 0{,}5$.',
      fala: 'Três litros de suco em copos de zero vírgula cinco litro. Quantos copos? É três dividido por zero vírgula cinco.',
      visual: reta(R3, 'A reta de 0 a 3, marcada de meio em meio litro.'),
      opcoes: [
        {
          texto: '6 copos', certa: true,
          explica: 'Isso. Cabem 2 copos em cada litro. Dividir por 0,5 é multiplicar por 2.',
          mostra: reta({ ...R3, saltos: COPOS }, 'Os 6 saltos de 0,5 aparecem um depois do outro e chegam ao 3.'),
        },
        {
          texto: '1,5 copo', erro: 'dividir-sempre-diminui',
          explica: '1,5 é a metade de 3. Mas a pergunta é quantos copos pequenos cabem: muitos.',
          mostra: reta({ ...R3, saltos: COPOS }, 'Os 6 saltos de 0,5 chegam ao 3.'),
        },
      ],
      esboco: 'O mesmo desmonte da divisão de frações: quantas vezes cabe.',
    },
    {
      tipo: 'passo',
      problema: 'Você pagou **R$ 45** de gasolina a **R$ 6** o litro. Quantos litros?',
      fala: 'Você pagou quarenta e cinco reais de gasolina a seis reais o litro. Quantos litros?',
      visual: chave({ dividendo: 45, divisor: 6, quociente: '7', linhas: [['−42', 1], ['3', 1]] }, 'A chave de 45 ÷ 6 com o 7 e o resto 3. Proposta: a chave com vírgula, em que o 0 desce depois do 45.'),
      passos: [
        {
          pergunta: '45 ÷ 6 dá 7 e sobram 3. O que fazer com o 3?',
          fala: 'Quarenta e cinco dividido por seis dá sete e sobram três. O que fazer com o três?',
          opcoes: [
            { texto: 'Vírgula no 7, e o 3 vira 30 décimos', certa: true, explica: 'Isso. 30 décimos ÷ 6 = 5 décimos.' },
            { texto: 'Escrevo 7,3', erro: 'resto-vira-decimal', explica: 'O 3 é o resto, 3 reais. Eles ainda compram gasolina: continue a conta.' },
          ],
          linha: { tex: '3 = 30 \\text{ décimos}, \\quad 30 \\div 6 = 5', fala: 'três são trinta décimos, e trinta dividido por seis é cinco' },
        },
        {
          pergunta: 'Quantos litros?',
          opcoes: [
            { texto: '7,5 L', certa: true, explica: 'Isso. Confira: 7,5 × 6 = 45.' },
            { texto: '7,05 L', explica: 'O 5 é de décimos: o 3 virou 30 décimos, não centésimos. 7,5 L.' },
          ],
          linha: { tex: '45 \\div 6 = 7{,}5', fala: 'quarenta e cinco dividido por seis é sete vírgula cinco' },
        },
      ],
      esboco: 'A chave de sempre, até o resto, e depois a vírgula. A conferência com a multiplicação fecha.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: cinco pessoas dividem uma conta de R$ 83. Quanto cada uma paga?',
      fala: 'No papel: cinco pessoas dividem uma conta de oitenta e três reais. Quanto cada uma paga?',
      resposta: '16,6',
      resolucao: [
        { tex: '83 \\div 5 = 16, \\text{ resto } 3', fala: 'oitenta e três dividido por cinco é dezesseis, com resto três' },
        { tex: '3 = 30 \\text{ décimos}, \\quad 30 \\div 5 = 6', fala: 'três são trinta décimos, e trinta dividido por cinco é seis' },
        { tex: '83 \\div 5 = 16{,}6', fala: 'oitenta e três dividido por cinco é dezesseis vírgula seis' },
      ],
      esboco: 'R$ 16,60 para cada. Confere: 5 × 16,6 = 83.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['dividir-decimais-n1', 'dividir-decimais-n2', 'dividir-decimais-n3'],
      esboco: 'Nível 1: um valor em reais dividido por 2, 4 ou 5, com resposta exata. Nível 2: divisões que não terminam, por 3, 6 ou 7. Nível 3: rateio e "quantos cabem" com divisor decimal, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Cada colega paga **R$ 1,75**. Agora você faz as quatro contas com decimais. Na próxima unidade: medidas.',
      fala: 'Cada colega paga um real e setenta e cinco. Agora você faz as quatro contas com decimais. Na próxima unidade: medidas.',
      visual: chave(D700, 'A chave do gancho, completa: 175 centavos para cada um.'),
      esboco: 'Fecha o gancho e a unidade. Medidas usam decimais o tempo todo: 1,75 m, 0,5 L.',
    },
  ],
}
