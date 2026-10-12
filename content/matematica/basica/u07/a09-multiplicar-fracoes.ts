import type { Aula, Visual } from '@/lib/formation/schema'

// Multiplicar frações: "1/2 de 3/4" é 1/2 × 3/4, e é a área do cruzamento
// no retângulo: 3 de 8 quadradinhos. Multiplicar por uma fração menor que 1
// diminui (meia receita leva menos de tudo). Um inteiro vezes uma fração
// multiplica só os pedaços (2 × 3/4 = 6/4), não o tamanho deles.

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const MEIA = { linhas: 2, colunas: 4, faixas: [1, 3] }

export const aula: Aula = {
  id: 'B.U7.A9',
  titulo: 'Multiplicar frações',
  objetivo: 'Multiplicar frações como fração de fração, pela área do retângulo, e prever se o produto fica maior ou menor; multiplicar um inteiro por uma fração para ampliar ou reduzir uma receita.',
  modelo: 'retangulo',
  esboco: 'Meia receita de uma que pede 3/4 de xícara de açúcar. O aluno aposta se vai mais ou menos açúcar, e depois pinta a metade dos 3/4 numa barra em oitavos. O retângulo explica: 3/4 nas colunas, 1/2 nas linhas, o cruzamento em âmbar é 3 de 8 quadradinhos. Daí a regra (numeradores vezes numeradores, denominadores vezes denominadores) e a receita dobrada, 2 × 3/4 = 6/4. Momento-chave: o cruzamento em âmbar, menor que os 3/4, desmonta "multiplicar sempre aumenta".',
  vega: 'Ideia central: "a/b de c/d" é a/b × c/d; no retângulo, c/d nas colunas e a/b nas linhas, e o cruzamento tem a × c quadradinhos de b × d. Multiplicar por uma fração menor que 1 dá menos que o número; maior que 1, dá mais. Um inteiro vezes uma fração multiplica só o numerador (2 × 3/4 = 6/4). Erros esperados: "multiplicar sempre aumenta"; multiplicar só os numeradores (2/3 × 3/5 = 6/5); multiplicar o inteiro em cima e embaixo (2 × 3/4 = 6/8, que é 3/4 de novo); somar em vez de multiplicar. Guie com "Meia receita leva mais ou menos?", "Quantos quadradinhos tem o retângulo inteiro?", "Dobrar a receita mudou alguma coisa?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A receita pede $\\frac{3}{4}$ de xícara de açúcar. Você vai fazer **meia** receita. Quanto açúcar?',
      fala: 'A receita pede três quartos de xícara de açúcar. Você vai fazer meia receita. Quanto açúcar?',
      visual: barra({ partes: 4, pintadas: 3 }, 'A xícara em quartos, com 3 pintados de açúcar.'),
      esboco: 'A missão da unidade começa: mudar o tamanho de uma receita.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Meia receita é $\\frac{1}{2}$ de $\\frac{3}{4}$, ou $\\frac{1}{2} \\times \\frac{3}{4}$. Dá mais ou menos que $\\frac{3}{4}$?',
      fala: 'Meia receita é um meio de três quartos, ou um meio vezes três quartos. Dá mais ou menos que três quartos?',
      visual: barra({ partes: 4, pintadas: 3 }, 'A xícara com os 3 quartos.'),
      opcoes: [
        {
          texto: 'Menos: é a metade de $\\frac{3}{4}$', certa: true,
          explica: 'Isso. Meia receita leva menos de tudo. Aqui, multiplicar diminui.',
        },
        {
          texto: 'Mais: multiplicar aumenta', erro: 'multiplicar-sempre-aumenta',
          explica: 'Com inteiros, sim. Mas $\\frac{1}{2}$ de uma coisa é a metade dela: menos que $\\frac{3}{4}$.',
        },
      ],
      esboco: 'A crença "multiplicar aumenta" aparece aqui, antes de qualquer conta.',
    },
    {
      tipo: 'mexa',
      texto: 'Embaixo, a mesma xícara em **oitavos**. Pinte a metade do açúcar de cima.',
      fala: 'Embaixo, a mesma xícara em oitavos. Pinte a metade do açúcar de cima.',
      visual: barra(
        { barras: [{ partes: 4, pintadas: 3 }, { partes: 8, pintadas: 0 }], pintar: true, ativa: 1 },
        'Em cima, 3/4. Embaixo, a mesma barra em oitavos, vazia: 3/4 são 6 oitavos, e a metade disso são 3.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte a metade de $\\frac{3}{4}$ na barra de baixo.',
        sucesso: { pintadas: 3 },
        mostre: 'Três oitavos se pintam embaixo: a metade dos 6 oitavos que cabem em 3/4.',
      },
      descoberta: '3/4 são 6 oitavos; a metade são 3 oitavos. Meia receita leva 3/8 de xícara.',
      esboco: 'A metade feita com a mão, nas barras que o aluno já conhece.',
    },
    {
      tipo: 'ideia',
      texto: 'No retângulo: $\\frac{3}{4}$ nas colunas, $\\frac{1}{2}$ nas linhas. O cruzamento, em âmbar, é a resposta: **3** de **8** quadradinhos.',
      fala: 'No retângulo: três quartos nas colunas, um meio nas linhas. O cruzamento, em âmbar, é a resposta: três de oito quadradinhos.',
      visual: ret(MEIA, 'O retângulo de 2 × 4. As 3 primeiras colunas ficam claras (3/4), a primeira linha também (1/2); o cruzamento acende em âmbar: 3 de 8.'),
      esboco: 'O desenho da fração de fração, que vale para quaisquer duas frações.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E $\\frac{2}{3}$ de $\\frac{3}{5}$? Conte no retângulo.',
      fala: 'E dois terços de três quintos? Conte no retângulo.',
      visual: ret({ linhas: 3, colunas: 5, faixas: [2, 3] }, 'O retângulo de 3 × 5: 3 colunas claras (3/5), 2 linhas claras (2/3) e o cruzamento em âmbar.'),
      opcoes: [
        {
          texto: '$\\frac{6}{15}$', fala: 'seis quinze avos', certa: true,
          explica: 'Isso. $2 \\times 3 = 6$ quadradinhos âmbar, de $3 \\times 5 = 15$.',
        },
        {
          texto: '$\\frac{6}{5}$', fala: 'seis quintos', erro: 'muda-so-um-termo',
          explica: 'Multiplicou só em cima. O retângulo tem 15 quadradinhos, não 5: e $\\frac{6}{5}$ passa de 1.',
        },
        {
          texto: '$\\frac{5}{8}$', fala: 'cinco oitavos',
          explica: 'Isso é somar em cima e embaixo. Conte: 6 âmbar de 15.',
        },
      ],
      esboco: 'O aluno conta os quadradinhos e vê a regra surgir: em cima vezes em cima, embaixo vezes embaixo.',
    },
    {
      tipo: 'anote',
      titulo: 'Multiplicar frações',
      definicao: 'Fração de fração: multiplique os numeradores e os denominadores. É o cruzamento no retângulo.',
      exemplo: { tex: '\\frac{1}{2} \\times \\frac{3}{4} = \\frac{1 \\times 3}{2 \\times 4} = \\frac{3}{8}', fala: 'um meio vezes três quartos é um vezes três sobre dois vezes quatro, três oitavos' },
      alerta: 'Multiplicar por uma fração menor que 1 **diminui**: $\\frac{1}{2}$ de $\\frac{3}{4}$ é menos que $\\frac{3}{4}$.',
      esboco: 'O retângulo de 2 × 4 com o cruzamento âmbar, e a regra embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora ampliar: receita **dobrada**. Quanto é $2 \\times \\frac{3}{4}$ de xícara?',
      fala: 'Agora ampliar: receita dobrada. Quanto é duas vezes três quartos de xícara?',
      visual: barra({ partes: 4, pintadas: 3 }, 'A xícara com 3/4.'),
      opcoes: [
        {
          texto: '$\\frac{6}{4}$: uma xícara e meia', certa: true,
          explica: 'Isso. 3 quartos e mais 3 quartos: 6 quartos. O 2 multiplica os pedaços, não o tamanho deles.',
          mostra: barra({ partes: 4, pintadas: 6, inteiros: 2 }, 'Os pedaços dobram e passam para uma segunda xícara: 1 cheia e meia.'),
        },
        {
          texto: '$\\frac{6}{8}$', fala: 'seis oitavos', erro: 'inteiro-multiplica-os-dois',
          explica: '$\\frac{6}{8}$ é o mesmo que $\\frac{3}{4}$: dobrar não teria mudado nada. São 6 quartos.',
          mostra: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 8, pintadas: 6 }] }, '6/8 embaixo de 3/4: exatamente o mesmo tamanho.'),
        },
      ],
      esboco: 'Ampliar a receita: o inteiro vezes a fração. O 6/8 se desmonta com as equivalentes.',
    },
    {
      tipo: 'passo',
      problema: 'Você vai fazer $\\frac{2}{3}$ de uma receita que leva $\\frac{3}{4}$ de xícara de leite. Quanto leite?',
      fala: 'Você vai fazer dois terços de uma receita que leva três quartos de xícara de leite. Quanto leite?',
      visual: ret({ linhas: 3, colunas: 4, faixas: [2, 3] }, 'O retângulo de 3 × 4: 3/4 nas colunas, 2/3 nas linhas, o cruzamento em âmbar.'),
      passos: [
        {
          pergunta: 'Que conta é essa?',
          opcoes: [
            { texto: '$\\frac{2}{3} \\times \\frac{3}{4}$', certa: true, explica: 'Isso. $\\frac{2}{3}$ de alguma coisa é vezes.' },
            { texto: '$\\frac{2}{3} + \\frac{3}{4}$', explica: 'Somar daria mais leite que a receita inteira. $\\frac{2}{3}$ de algo é vezes.' },
          ],
          linha: { tex: '\\frac{2}{3} \\times \\frac{3}{4}', fala: 'dois terços vezes três quartos' },
        },
        {
          pergunta: 'Multiplique em cima e embaixo.',
          opcoes: [
            { texto: '$\\frac{6}{12}$', fala: 'seis doze avos', certa: true, explica: 'Isso. 6 quadradinhos âmbar de 12.' },
            { texto: '$\\frac{6}{4}$', fala: 'seis quartos', erro: 'muda-so-um-termo', explica: 'Os denominadores também se multiplicam: $3 \\times 4 = 12$ quadradinhos.' },
          ],
          linha: { tex: '\\frac{2 \\times 3}{3 \\times 4} = \\frac{6}{12}', fala: 'dois vezes três sobre três vezes quatro: seis doze avos' },
        },
        {
          pergunta: 'Na forma mais simples, quanto leite?',
          opcoes: [
            { texto: '$\\frac{1}{2}$ xícara', fala: 'meia xícara', certa: true, explica: 'Isso. 6 de 12 é a metade: meia xícara.' },
            { texto: '$\\frac{3}{4}$ de xícara', fala: 'três quartos de xícara', erro: 'multiplicar-sempre-aumenta', explica: 'Essa é a receita inteira. $\\frac{2}{3}$ dela é menos: $\\frac{6}{12}$, meia xícara.' },
          ],
          linha: { tex: '\\frac{6}{12} = \\frac{1}{2}', fala: 'seis doze avos é um meio' },
        },
      ],
      esboco: 'O roteiro: ver que é vezes, multiplicar, simplificar como na aula 5.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: $\\frac{3}{5}$ de $\\frac{2}{3}$ de xícara. Quanto dá, na forma mais simples?',
      fala: 'No papel: três quintos de dois terços de xícara. Quanto dá, na forma mais simples?',
      resposta: '2/5',
      resolucao: [
        { tex: '\\frac{3}{5} \\times \\frac{2}{3} = \\frac{3 \\times 2}{5 \\times 3}', fala: 'três quintos vezes dois terços é três vezes dois sobre cinco vezes três' },
        { tex: '\\frac{6}{15}', fala: 'seis quinze avos' },
        { tex: '\\frac{6}{15} = \\frac{2}{5}', fala: 'seis quinze avos é dois quintos' },
      ],
      esboco: 'Sem retângulo: a regra sozinha, e a simplificação no fim.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['multiplicar-fracoes-n1', 'multiplicar-fracoes-n2', 'multiplicar-fracoes-n3'],
      esboco: 'Nível 1: 1/b de c/d, com o retângulo. Nível 2: ampliar ou reduzir uma receita (2/3 de 12 colheres; 3/2 de 8 ovos). Nível 3: fração de fração numa receita, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Meia receita leva $\\frac{3}{8}$ de xícara de açúcar, menos que $\\frac{3}{4}$. Na próxima aula: dividir frações.',
      fala: 'Meia receita leva três oitavos de xícara de açúcar, menos que três quartos. Na próxima aula: dividir frações.',
      visual: ret(MEIA, 'O retângulo de 2 × 4 com os 3 quadradinhos âmbar.'),
      esboco: 'Responde ao gancho com o retângulo e abre a divisão.',
    },
  ],
}
