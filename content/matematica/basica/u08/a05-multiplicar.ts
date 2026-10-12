import type { Aula, Visual } from '@/lib/formation/schema'

// Multiplicar decimais é fração de fração (aula 9 da unidade 7) com
// denominadores 10 e 100. Na grade, 0,3 × 0,4 é o cruzamento de 3 linhas
// com 4 colunas: 12 quadradinhos de 100, 0,12. Um décimo de um décimo é um
// centésimo: por isso as casas decimais dos fatores se somam no produto.
// A conta se faz sem vírgula, e a vírgula volta no fim.

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const conta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { conta: estado }, esboco })
const CRUZAMENTO = { faixas: [3, 4], rotulo: '0,3 × 0,4' }
const GASOLINA = { parcelas: ['6,15', '2,4'], sinal: '×', parciais: ['2460', '12300'], resultado: '14760', alinhar: 'direita' }

export const aula: Aula = {
  id: 'B.U8.A5',
  titulo: 'Multiplicar',
  objetivo: 'Multiplicar decimais fazendo a conta sem vírgula e pondo no produto tantas casas decimais quantas os fatores têm juntos, explicando pela grade que um décimo de um décimo é um centésimo; prever que vezes um número menor que 1 diminui.',
  modelo: 'grade',
  esboco: 'Uma placa de 1 m por 1 m, a grade 10 × 10. O aluno pinta 0,4 da placa (4 colunas) e depois pega 0,3 disso (3 linhas): o cruzamento tem 12 quadradinhos, 0,12. A grade desmonta o 1,2 e o "multiplicar aumenta" ao mesmo tempo. Daí a regra das casas, o inteiro vezes decimal (2 garrafas de 1,5 L) e a gasolina, 2,4 L a R$ 6,15. Momento-chave: o cruzamento de 3 linhas com 4 colunas acende 12 quadradinhos de 100.',
  vega: 'Ideia central: multiplicar decimais é fração de fração. 0,3 × 0,4 é 3/10 de 4/10, que é 12/100. Um décimo de um décimo é um centésimo, e por isso o produto tem tantas casas decimais quantas os fatores juntos (1 + 1 = 2). A conta se faz sem vírgula (3 × 4 = 12) e a vírgula volta contando as casas. Erros esperados: pôr no produto as casas de um fator só, como na soma (0,3 × 0,4 = 1,2); multiplicar a parte inteira e a decimal separadas (2 × 1,5 = 2,10); achar que multiplicar sempre aumenta (vezes 0,4 é menos que o número). Guie com "Que pedaço é um décimo de um décimo?", "Quantas casas depois da vírgula têm os dois fatores, juntos?", "Vezes um número menor que 1: dá mais ou menos?". Confira estimando: 2,4 × 6,15 é perto de 2 × 6 = 12, um pouco mais.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma placa de 1 m por 1 m. Você corta um pedaço de **0,4 m** por **0,3 m**. Que parte da placa é?',
      fala: 'Uma placa de um metro por um metro. Você corta um pedaço de zero vírgula quatro metro por zero vírgula três metro. Que parte da placa é?',
      visual: grade({ pintadas: 0, rotulo: '1 m × 1 m' }, 'A grade vazia como uma placa quadrada, com 1 m escrito num lado e no outro.'),
      esboco: 'Área, que o aluno conhece do retângulo da unidade 3, agora em pedaços de placa.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A conta é **0,3 × 0,4**. O resultado é maior ou menor que 0,4?',
      fala: 'A conta é zero vírgula três vezes zero vírgula quatro. O resultado é maior ou menor que zero vírgula quatro?',
      visual: grade({ pintadas: 0, rotulo: '1 m × 1 m' }, 'A placa vazia.'),
      opcoes: [
        {
          texto: 'Menor: é 0,3 de 0,4', certa: true,
          explica: 'Isso. Vezes 0,3 é pegar 3 décimos de alguma coisa: menos que ela inteira.',
        },
        {
          texto: 'Maior: multiplicar aumenta', erro: 'multiplicar-sempre-aumenta',
          explica: 'Com inteiros, sim. Mas o pedaço cabe dentro da tira de 0,4: tem de ser menor.',
        },
      ],
      esboco: 'A mesma pergunta da aula de multiplicar frações, agora com decimais.',
    },
    {
      tipo: 'mexa',
      texto: 'Primeiro, a tira de **0,4 m**: pinte 4 colunas da placa.',
      fala: 'Primeiro, a tira de zero vírgula quatro metro: pinte quatro colunas da placa.',
      visual: grade({ pintadas: 0, pintar: true, porColuna: true, escala: true }, 'A placa vazia com 0,1 … 1 embaixo das colunas. Cada toque pinta uma coluna inteira.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte 0,4 da placa.',
        sucesso: { pintadas: 40 },
        mostre: 'As 4 primeiras colunas se pintam de cima a baixo: 0,4 da placa.',
      },
      descoberta: '0,4 da placa são 4 colunas, 40 quadradinhos.',
      esboco: 'O primeiro fator com a mão. As colunas cheias preparam o cruzamento.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora pegue **0,3** dessa tira: 3 das 10 linhas. Quanto é o cruzamento?',
      fala: 'Agora pegue zero vírgula três dessa tira: três das dez linhas. Quanto é o cruzamento?',
      visual: grade({ ...CRUZAMENTO, semRotulo: true }, 'As 4 colunas e as 3 primeiras linhas ficam claras; o cruzamento acende em âmbar.'),
      opcoes: [
        {
          texto: '0,12: 12 de 100 quadradinhos', certa: true,
          explica: 'Isso. 3 linhas por 4 colunas: 12 quadradinhos. Cada um é um centésimo da placa.',
          mostra: grade(CRUZAMENTO, 'Os 12 quadradinhos âmbar piscam, contados de 1 a 12; embaixo, 0,12.'),
        },
        {
          texto: '1,2', erro: 'casas-do-produto-como-na-soma',
          explica: '1,2 é mais que a placa inteira. O pedaço tem 12 quadradinhos de 100: 0,12.',
          mostra: grade({ grades: [{ pintadas: 100 }, { pintadas: 20 }, { pintadas: 12 }], destaque: 2 }, 'Ao lado, 1,2 placa: uma cheia e mais 2 colunas. O pedaço, 12 quadradinhos, é muito menor.'),
        },
        {
          texto: '0,7', erro: 'soma-no-lugar-de-multiplicar',
          explica: '0,7 é 0,3 + 0,4: 70 quadradinhos. O cruzamento tem só 12.',
          mostra: grade(CRUZAMENTO, 'O cruzamento acende: 12 quadradinhos, longe de 70.'),
        },
      ],
      esboco: 'É a fração de fração da unidade 7, na grade: 3/10 de 4/10 = 12/100.',
    },
    {
      tipo: 'ideia',
      texto: 'Um décimo de um décimo é um **centésimo**: 1 quadradinho. Por isso 1 casa vezes 1 casa dá **2** casas.',
      fala: 'Um décimo de um décimo é um centésimo: um quadradinho. Por isso uma casa vezes uma casa dá duas casas.',
      visual: grade({ faixas: [1, 1], rotulo: '0,1 × 0,1 = 0,01' }, 'Uma linha e uma coluna claras; só o quadradinho do canto em âmbar.'),
      esboco: 'O porquê da regra: o tamanho do pedaço encolhe dez vezes duas vezes. Movimento: as faixas encolhem de 3 × 4 até 1 × 1, e sobra um quadradinho âmbar.',
    },
    {
      tipo: 'anote',
      titulo: 'Multiplicar decimais',
      definicao: 'Multiplique sem a vírgula. O produto tem tantas casas decimais quantas os dois fatores juntos.',
      exemplo: { tex: '0{,}3 \\times 0{,}4 = 0{,}12', fala: 'zero vírgula três vezes zero vírgula quatro é zero vírgula doze' },
      alerta: 'Não alinhe vírgulas como na soma: 0,3 × 0,4 não é 1,2. Vezes um número menor que 1 **diminui**.',
      esboco: 'A grade com o cruzamento 3 × 4 e, ao lado, 3 × 4 = 12 com as casas contadas: 1 + 1 = 2.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Duas garrafas de **1,5 L** de água. Quanto é $2 \\times 1{,}5$?',
      fala: 'Duas garrafas de um vírgula cinco litro de água. Quanto é dois vezes um vírgula cinco?',
      visual: grade({ grades: [{ pintadas: 15 }, { pintadas: 15 }], linhas: 1, escala: true }, 'Duas tiras de décimos: cada garrafa é 1 tira cheia e mais meia.'),
      opcoes: [
        {
          texto: '3 L', certa: true,
          explica: 'Isso. Um litro e meio, mais um litro e meio: 3 litros. Sem vírgula, 2 × 15 = 30; uma casa: 3,0.',
          mostra: grade({ pintadas: 30, linhas: 1, rotulo: '3 L' }, 'As duas meias tiras se juntam e completam a terceira: 3 tiras cheias.'),
        },
        {
          texto: '2,10 L', erro: 'multiplica-partes-separadas',
          explica: 'Isso é 2 × 1 e 2 × 5, colados. Mas 2 × 5 décimos são 10 décimos: 1 litro inteiro a mais.',
          mostra: grade({ pintadas: 30, linhas: 1, rotulo: '3 L' }, 'As duas metades se juntam numa tira cheia: os 10 décimos viram 1 litro.'),
        },
        {
          texto: '30 L',
          explica: 'Duas garrafas pequenas não dão 30 litros. 2 × 15 = 30, e a vírgula volta: 3,0.',
        },
      ],
      esboco: 'Inteiro vezes decimal. A grade em tiras mostra os décimos virando um inteiro.',
    },
    {
      tipo: 'passo',
      problema: 'Você põe **2,4 L** de gasolina num galão. O litro custa **R$ 6,15**. Quanto paga?',
      fala: 'Você põe dois vírgula quatro litros de gasolina num galão. O litro custa seis reais e quinze. Quanto paga?',
      visual: conta(GASOLINA, 'A multiplicação armada com os fatores alinhados pela direita: faz-se 615 × 24 como nos inteiros, e o 14760 espera a vírgula.'),
      passos: [
        {
          pergunta: 'Sem vírgula, a conta é 615 × 24. Quantas casas decimais os dois fatores têm juntos?',
          fala: 'Sem vírgula, a conta é seiscentos e quinze vezes vinte e quatro. Quantas casas decimais os dois fatores têm juntos?',
          opcoes: [
            { texto: '3: duas do 6,15 e uma do 2,4', certa: true, explica: 'Isso. Centésimos vezes décimos dão milésimos.' },
            { texto: '2, como no 6,15', erro: 'casas-do-produto-como-na-soma', explica: 'Na soma, a vírgula se alinha. Aqui as casas se somam: 2 + 1 = 3.' },
          ],
          linha: { tex: '615 \\times 24 = 14.760 \\quad (2 + 1 = 3 \\text{ casas})', fala: 'seiscentos e quinze vezes vinte e quatro é catorze mil setecentos e sessenta; duas mais uma, três casas' },
        },
        {
          pergunta: 'Ponha a vírgula 3 casas da direita para a esquerda. Quanto você paga?',
          fala: 'Ponha a vírgula três casas da direita para a esquerda. Quanto você paga?',
          opcoes: [
            { texto: 'R$ 14,76', certa: true, explica: 'Isso. 14,760 é R$ 14,76. Perto de 2 × 6 = 12, como devia.' },
            { texto: 'R$ 147,60', erro: 'casas-do-produto-como-na-soma', explica: 'Com duas casas, 2,4 L custariam mais de R$ 100. São 3 casas: R$ 14,76.' },
          ],
          linha: { tex: '2{,}4 \\times 6{,}15 = 14{,}760 = 14{,}76', fala: 'dois vírgula quatro vezes seis vírgula quinze é catorze vírgula setenta e seis' },
        },
      ],
      esboco: 'A conta de inteiros que o aluno já sabe, e só depois a vírgula. A estimativa (perto de 12) confere.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: 1,5 kg de carne a R$ 32,80 o quilo. Quanto custa?',
      fala: 'No papel: um vírgula cinco quilo de carne a trinta e dois reais e oitenta o quilo. Quanto custa?',
      resposta: '49,2',
      resolucao: [
        { tex: '328 \\times 15 = 4.920', fala: 'trezentos e vinte e oito vezes quinze é quatro mil novecentos e vinte' },
        { tex: '1 + 1 = 2 \\text{ casas}', fala: 'uma mais uma, duas casas' },
        { tex: '1{,}5 \\times 32{,}8 = 49{,}20', fala: 'um vírgula cinco vezes trinta e dois vírgula oito é quarenta e nove vírgula vinte' },
      ],
      esboco: 'R$ 32,80 tem um zero no fim: dá para fazer 328 × 15 (uma casa) ou 3280 × 15 (duas). As duas dão R$ 49,20.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['multiplicar-decimais-n1', 'multiplicar-decimais-n2', 'multiplicar-decimais-n3'],
      esboco: 'Nível 1: décimo vezes décimo, com o cruzamento na grade. Nível 2: inteiro vezes decimal, com vai um que vira inteiro. Nível 3: preço por quilo ou por litro, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'O pedaço é **0,12** da placa: 3 décimos de 4 décimos. Na próxima aula: dividir, e as divisões que não terminam.',
      fala: 'O pedaço é zero vírgula doze da placa: três décimos de quatro décimos. Na próxima aula: dividir, e as divisões que não terminam.',
      visual: grade(CRUZAMENTO, 'A placa com o cruzamento âmbar de 12 quadradinhos.'),
      esboco: 'Responde ao gancho com a grade e abre a divisão.',
    },
  ],
}
