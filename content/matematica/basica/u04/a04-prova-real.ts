import type { Aula, Visual } from '@/lib/formation/schema'

// Dividir e multiplicar desfazem uma à outra. A prova real junta de novo o
// que foi repartido: divisor × quociente + resto = dividendo. Ela pega o
// zero esquecido do quociente (816 ÷ 8 = 12 dá 96), mas não pega um resto
// grande demais, por isso vem junto da outra regra: o resto é menor que o
// divisor.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
type Divisao = { dividendo: number; divisor: number; quociente?: string; linhas?: [string, number][]; destaque?: number }
const chave = (d: Divisao, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { divisao: d }, esboco })
const P852 = { base: [200, 10, 3], altura: [4] }
const D816 = { dividendo: 816, divisor: 8 }

export const aula: Aula = {
  id: 'B.U4.A4',
  titulo: 'A prova real',
  objetivo: 'Conferir uma divisão com a multiplicação (divisor × quociente + resto = dividendo), verificar que o resto é menor que o divisor e usar a prova real para achar o quociente certo de uma conta errada.',
  modelo: 'retangulo',
  esboco: 'O prêmio da aula anterior volta, agora dividido por 4: R$ 852 dá R$ 213 para cada? O retângulo de 4 por 213, partido em 200, 10 e 3, junta de novo o que foi repartido: 800 + 40 + 12 = 852. Com resto, as vans da aula 2 voltam: 3 vans de 8 e mais as 2 pessoas. Momento-chave: ver o retângulo da multiplicação remontar o dividendo e entender que dividir e multiplicar desfazem uma à outra.',
  vega: 'Ideia central: a prova real desfaz a divisão. Divisor vezes quociente, mais o resto, tem de dar o dividendo; e o resto tem de ser menor que o divisor. As duas condições juntas garantem a conta. Erros esperados: conferir com a conta errada (852 × 4), esquecer de somar o resto (8 × 3 = 24 e achar que 26 ÷ 8 = 3, resto 2 está errado), confiar só na prova real com um resto grande demais (50 ÷ 6 = 7, resto 8 fecha a prova, mas está errado) e o zero esquecido do quociente (816 ÷ 8 = 12). Guie perguntando "Se cada um recebeu isso, juntando todos dá quanto?", "E o que sobrou, entra onde?", "Esse resto ainda forma mais um grupo?". Em Sua vez, não diga se confere: peça a multiplicação.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Alguém dividiu **R$ 852** entre **4** pessoas e achou **R$ 213** para cada. Dá para conferir sem dividir de novo?',
      fala: 'Alguém dividiu oitocentos e cinquenta e dois reais entre quatro pessoas e achou duzentos e treze para cada. Dá para conferir sem dividir de novo?',
      visual: chave({ dividendo: 852, divisor: 4, quociente: '213' }, 'A chave com 213 no quociente, no caderno de outra pessoa.'),
      esboco: 'O aluno começa como revisor, como na aula de conferir da unidade 2.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Se cada uma das **4** pessoas recebeu **R$ 213**, como saber se o total era mesmo R$ 852?',
      fala: 'Se cada uma das quatro pessoas recebeu duzentos e treze reais, como saber se o total era mesmo oitocentos e cinquenta e dois?',
      visual: ret({ ...P852, areas: [['?', '?', '?']] }, 'O retângulo de 4 por 213, partido em 200, 10 e 3, com "?" em cada parte.'),
      opcoes: [
        {
          texto: 'Juntar o que as 4 receberam: $4 \\times 213$', fala: 'Juntar o que as quatro receberam: quatro vezes duzentos e treze', certa: true,
          explica: 'Isso. $800 + 40 + 12 = 852$: juntando as 4 partes, volta o prêmio inteiro.',
          mostra: ret({ ...P852, areas: true, total: 852 }, 'As áreas aparecem uma a uma: 800, 40, 12. O total 852 surge embaixo.'),
        },
        {
          texto: 'Fazer $852 \\times 4$', fala: 'Fazer oitocentos e cinquenta e dois vezes quatro', erro: 'inversa-errada',
          explica: '$852 \\times 4$ dá mais de 3.000, nada a ver com o prêmio. Para desfazer, multiplique o que cada um recebeu por 4.',
          mostra: ret({ ...P852, areas: true, total: 852 }, 'O retângulo de 4 por 213 se completa: 852.'),
        },
        {
          texto: 'Dividir de novo, mais devagar',
          explica: 'Refazer a mesma conta pode repetir o mesmo erro. Desfazer é mais seguro: $4 \\times 213$.',
          mostra: ret({ ...P852, areas: true, total: 852 }, 'O retângulo se completa: 852.'),
        },
      ],
      esboco: 'A multiplicação da unidade 3, no retângulo por área, desfaz a divisão.',
    },
    {
      tipo: 'ideia',
      texto: 'Isso é a **prova real**: divisor vezes quociente dá o dividendo. $4 \\times 213 = 852$: confere.',
      fala: 'Isso é a prova real: divisor vezes quociente dá o dividendo. Quatro vezes duzentos e treze é oitocentos e cinquenta e dois: confere.',
      visual: ret({ ...P852, areas: true, total: 852 }, 'O retângulo completo. Ao lado, a chave do gancho ganha um visto.'),
      esboco: 'Dar o nome depois de ver. Dividir reparte; multiplicar junta de volta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E com resto? Como conferir $26 \\div 8 = 3$, resto $2$?',
      fala: 'E com resto? Como conferir vinte e seis dividido por oito é três, resto dois?',
      visual: ret({ linhas: 3, colunas: 8, grupos: true, rotulos: true, sobra: 2, total: 26 }, 'As vans da aula 2: 3 linhas de 8 e 2 quadradinhos soltos ao lado.'),
      opcoes: [
        {
          texto: '$8 \\times 3 + 2 = 26$', fala: 'oito vezes três mais dois é vinte e seis', certa: true,
          explica: 'Isso. As 3 vans levam 24, e as 2 pessoas que sobraram completam as 26.',
          mostra: ret({ linhas: 3, colunas: 8, grupos: true, rotulos: true, sobra: 2, total: 26 }, 'As 3 linhas mostram 24; os 2 soltos se juntam e o total 26 acende.'),
        },
        {
          texto: '$8 \\times 3 = 26$', fala: 'oito vezes três é vinte e seis', erro: 'prova-real-sem-resto',
          explica: '$8 \\times 3 = 24$. Faltam as 2 pessoas que sobraram: some o resto.',
          mostra: ret({ linhas: 3, colunas: 8, grupos: true, rotulos: true, sobra: 2, total: 26 }, 'As 3 linhas acendem com 24; os 2 soltos piscam: ficaram de fora.'),
        },
      ],
      esboco: 'O resto entra na prova real. A imagem das pessoas na calçada lembra que elas também contam.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém fez $50 \\div 6 = 7$, resto $8$. A prova dá $6 \\times 7 + 8 = 50$. Está certo?',
      fala: 'Alguém fez cinquenta dividido por seis é sete, resto oito. A prova dá seis vezes sete mais oito, cinquenta. Está certo?',
      visual: ret({ linhas: 7, colunas: 6, grupos: true, rotulos: true, sobra: 8, total: 50 }, '7 linhas de 6 e 8 quadradinhos soltos ao lado.'),
      opcoes: [
        {
          texto: 'Não: o resto 8 é maior que 6', certa: true,
          explica: 'Isso. Com 8 sobrando, cabe mais um grupo de 6. O certo é $50 \\div 6 = 8$, resto $2$.',
          mostra: ret({ linhas: 8, colunas: 6, grupos: true, rotulos: true, sobra: 2, total: 50 }, 'Seis dos 8 soltos sobem e formam a oitava linha; ficam 2.'),
        },
        {
          texto: 'Sim: a prova real fechou', erro: 'resto-maior-que-divisor',
          explica: 'A prova fecha, mas o resto 8 ainda tem um grupo de 6. Confira também: o resto é menor que o divisor?',
          mostra: ret({ linhas: 8, colunas: 6, grupos: true, rotulos: true, sobra: 2, total: 50 }, 'Os 8 soltos piscam; 6 deles viram mais uma linha.'),
        },
      ],
      esboco: 'A prova real tem um ponto cego. A segunda regra, do resto menor que o divisor, fecha o buraco.',
    },
    {
      tipo: 'anote',
      titulo: 'Prova real da divisão',
      definicao: 'Divisor vezes quociente, mais o resto, dá o dividendo. E o resto tem de ser menor que o divisor.',
      exemplo: { tex: '26 \\div 8 = 3 \\text{, resto } 2 \\quad 8 \\times 3 + 2 = 26', fala: 'vinte e seis dividido por oito é três, resto dois; oito vezes três mais dois é vinte e seis' },
      alerta: 'Não esqueça de somar o resto. E confira se ele é menor que o divisor.',
      esboco: 'A página com a conta, a prova embaixo e o resto circulado com "2 < 8".',
    },
    {
      tipo: 'passo',
      problema: 'Alguém fez $816 \\div 8$ e achou **12**. Confira com a prova real.',
      fala: 'Alguém fez oitocentos e dezesseis dividido por oito e achou doze. Confira com a prova real.',
      visual: chave({ ...D816, quociente: '12' }, 'A chave com 12 no quociente.'),
      passos: [
        {
          pergunta: 'Qual conta confere?',
          opcoes: [
            { texto: '$8 \\times 12$', fala: 'oito vezes doze', certa: true, explica: 'Isso. Divisor vezes quociente. Não há resto para somar.' },
            { texto: '$816 \\times 8$', fala: 'oitocentos e dezesseis vezes oito', erro: 'inversa-errada', explica: 'Isso só aumenta o 816. Para desfazer, multiplique o quociente pelo divisor: $8 \\times 12$.' },
          ],
          linha: { tex: '8 \\times 12 = 96', fala: 'oito vezes doze é noventa e seis' },
        },
        {
          pergunta: '$8 \\times 12 = 96$. O que isso diz?',
          fala: 'Oito vezes doze é noventa e seis. O que isso diz?',
          opcoes: [
            { texto: 'A conta está errada: 96 não é 816', certa: true, explica: 'Isso. Faltam 720. O quociente tem de ser bem maior que 12.' },
            { texto: 'Está certa: não sobrou resto', explica: 'Sem resto, a prova tinha de dar 816. Deu 96: a conta está errada.' },
          ],
          linha: { tex: '96 \\neq 816', fala: 'noventa e seis é diferente de oitocentos e dezesseis' },
        },
        {
          pergunta: 'Refaça na chave. Qual é o quociente certo?',
          opcoes: [
            {
              texto: '102', certa: true, explica: 'Isso. $1 \\div 8$ não dá: 0 nas dezenas. Prova: $8 \\times 102 = 816$.',
              mostra: chave({ ...D816, quociente: '102', linhas: [['−8', 0], ['01', 1], ['−0', 1], ['16', 2], ['−16', 2], ['0', 2]] }, 'A chave se refaz com o 0 do quociente em âmbar.'),
            },
            { texto: '12', erro: 'esquece-zero-no-quociente', explica: 'É o mesmo erro: falta o 0 das dezenas. $8 \\times 12 = 96$, não 816.' },
            { texto: '120', explica: '$8 \\times 120 = 960$: passa de 816. O 0 vai nas dezenas: **102**.' },
          ],
          linha: { tex: '8 \\times 102 = 816', fala: 'oito vezes cento e dois é oitocentos e dezesseis' },
        },
      ],
      esboco: 'A prova real como detetive: ela não só diz que está errado, aponta o tamanho do erro.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, divida e faça a prova real: $95 \\div 4$. Qual é o resto?',
      fala: 'No papel, divida e faça a prova real: noventa e cinco dividido por quatro. Qual é o resto?',
      resposta: 3,
      resolucao: [
        { tex: '95 \\div 4 = 23 \\text{, resto } 3', fala: 'noventa e cinco dividido por quatro é vinte e três, resto três' },
        { tex: '4 \\times 23 = 92', fala: 'quatro vezes vinte e três é noventa e dois' },
        { tex: '92 + 3 = 95', fala: 'noventa e dois mais três é noventa e cinco' },
        { tex: '3 < 4', fala: 'três é menor que quatro' },
      ],
      esboco: 'Dividir e conferir as duas condições, sozinho.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['prova-real-n1', 'prova-real-n2', 'prova-real-n3'],
      esboco: 'Nível 1: achar o dividendo a partir do divisor e do quociente, com o retângulo. Nível 2: o mesmo, com resto. Nível 3: achar o erro de uma conta (o zero esquecido ou o resto grande demais).',
    },
    {
      tipo: 'fecho',
      texto: '$4 \\times 213 = 852$: a divisão do prêmio confere. Na próxima aula: e se o divisor for **zero**?',
      fala: 'Quatro vezes duzentos e treze é oitocentos e cinquenta e dois: a divisão do prêmio confere. Na próxima aula: e se o divisor for zero?',
      visual: ret({ ...P852, areas: true, total: 852 }, 'O retângulo do prêmio completo, com um visto ao lado.'),
      esboco: 'Responder ao gancho. A pergunta do zero usa a prova real que o aluno acabou de aprender.',
    },
  ],
}
