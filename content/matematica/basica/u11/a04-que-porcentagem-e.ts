import type { Aula, Visual } from '@/lib/formation/schema'

// Que porcentagem é? O caminho de volta da aula 2: dados a parte e o todo,
// achar o por cento. Parte ÷ todo dá um decimal (18 ÷ 24 = 0,75), e o
// decimal em centésimos é a porcentagem (0,75 = 75 %): na grade, a parte
// pinta 75 dos 100 quadradinhos. A porcentagem serve para comparar partes
// de todos diferentes (18 de 24 contra 21 de 30) e para medir um aumento
// (o aumento dividido pelo valor de antes). Os erros a desmontar: ler a
// parte como porcentagem (18 acertos, "18 %"), dividir o todo pela parte,
// parar no decimal (0,75 %) e, no aumento, dividir pelo valor novo.

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })

const PROVA = barra({ partes: 24, pintadas: 18 }, 'Uma barra partida em 24 partes, uma por questão. As 18 acertadas em âmbar; à direita, 18/24.')
const SETENTA_E_CINCO = grade({ pintadas: 75, rotulo: '75 %' }, 'A grade de 100 com 75 quadradinhos pintados e "75 %" embaixo.')
const BLUSA = barra({ partes: 4, pintadas: 1, rotulo: '25 %' }, 'A barra dos R$ 120 partida em 4 pedaços de R$ 30. Um pedaço em âmbar, o desconto, e "25 %" à direita.')
const LUZ = (aumento: number | string, pct: string, destaque?: number[]) => tab(
  {
    linhas: [{ rotulo: 'reais', valores: [150, aumento] }, { rotulo: 'porcentagem', valores: ['100 %', pct] }],
    ...(pct === '?' ? {} : { setas: [{ de: 0, para: 1, rotulo: '÷ 5' }, { de: 0, para: 1, rotulo: '÷ 5', embaixo: true }] }),
    ...(destaque ? { destaque } : {}),
  },
  pct !== '?'
    ? 'A mesma tabela com ÷ 5 em cima e embaixo: R$ 30 é um quinto de R$ 150, e 20 % é um quinto de 100 %.'
    : aumento === '?'
      ? 'A tabela da conta de luz: R$ 150, o valor de antes, ao lado de 100 %; o aumento e a porcentagem dele ainda em "?".'
      : 'A tabela da conta de luz: R$ 150, o valor de antes, ao lado de 100 %; o aumento, R$ 30, ao lado de "?".',
)

export const aula: Aula = {
  id: 'B.U11.A4',
  titulo: 'Que porcentagem é?',
  objetivo: 'Achar que porcentagem uma parte é do todo, dividindo a parte pelo todo e multiplicando por 100, e usar isso para comparar resultados e medir um aumento.',
  modelo: 'grade',
  esboco: 'Abre na prova: 18 acertos em 24 questões. Que porcentagem é? O aluno aposta, depois divide 18 por 24 e pinta 0,75 da grade. Momento-chave: a parte que era 18 de 24 vira 75 quadradinhos de 100, e 75 de 100 é 75 %. Depois o desconto da blusa (R$ 30 em R$ 120), a comparação com a amiga que acertou 21 de 30 (mais acertos, menor porcentagem) e o aumento da conta de luz, em que o todo é o valor de antes.',
  vega: 'Ideia central: para saber que porcentagem a parte é do todo, divide-se a parte pelo todo e multiplica-se por 100. 18 ÷ 24 = 0,75; 0,75 = 75 centésimos = 75 %. Na grade de 100, a parte pinta 75 quadradinhos. A porcentagem põe todos diferentes na mesma escala, de 100, e por isso compara (18 de 24 é 75 %; 21 de 30 é 70 %). Num aumento, a parte é o quanto subiu e o todo é o valor de antes (de R$ 150 para R$ 180: 30 ÷ 150 = 20 %). Erros esperados: ler a parte como porcentagem (18 acertos, "18 %"); dividir o todo pela parte (24 ÷ 18, "133 %"); parar no decimal ("0,75 %"); no aumento, dividir pelo valor novo (30 ÷ 180). Guie com "A parte é maior ou menor que o todo? Então a porcentagem passa de 100 ou não?", "Quantos quadradinhos de 100 isso pinta?", "A mais que o quê?". Confira de volta: 75 % de 24 é 18. Notas e preços são de exercício, sem fonte.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na prova, você acertou **18** de **24** questões. Que porcentagem da prova você acertou?',
      fala: 'Na prova, você acertou dezoito de vinte e quatro questões. Que porcentagem da prova você acertou?',
      visual: PROVA,
      esboco: 'Uma situação que todo adulto conhece. A nota em porcentagem é o que se compara depois, em concurso ou curso.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Aposte: 18 de 24 questões são quantos por cento?',
      fala: 'Aposte: dezoito de vinte e quatro questões são quantos por cento?',
      visual: PROVA,
      opcoes: [
        {
          texto: '75 %', certa: true,
          explica: 'Boa aposta. A prova não tem 100 questões. Falta ver quantos de 100 os 18 acertos valem.',
          fala: 'Boa aposta. A prova não tem cem questões. Falta ver quantos de cem os dezoito acertos valem.',
        },
        {
          texto: '18 %', erro: 'parte-como-porcentagem',
          explica: '18 % seria 18 de 100. A prova tem 24 questões: 18 delas são bem mais que 18 %.',
          fala: 'Dezoito por cento seria dezoito de cem. A prova tem vinte e quatro questões: dezoito delas são bem mais que dezoito por cento.',
        },
        {
          texto: '133 %', erro: 'divide-todo-pela-parte',
          explica: 'Passar de 100 % seria acertar mais que a prova inteira. Os 18 cabem nos 24: é menos de 100 %.',
          fala: 'Passar de cem por cento seria acertar mais que a prova inteira. Os dezoito cabem nos vinte e quatro: é menos de cem por cento.',
        },
      ],
      esboco: 'A certa fica marcada, mas o porquê vem no Mexa: o aluno vai fazer a conta e pintar.',
    },
    {
      tipo: 'mexa',
      texto: 'Acertar 18 de 24 é $18 \\div 24 = 0{,}75$ da prova. Pinte **0,75** da grade.',
      fala: 'Acertar dezoito de vinte e quatro é dezoito dividido por vinte e quatro, zero vírgula setenta e cinco da prova. Pinte zero vírgula setenta e cinco da grade.',
      visual: grade({ pintadas: 0, pintar: true }, 'A grade de 100 vazia. Um toque pinta até aquele quadradinho, coluna por coluna; o número embaixo acompanha: 0,5, 0,7, 0,75.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos quadradinhos para pintar 0,75 da grade.',
        sucesso: { pintadas: 75 },
        mostre: 'A grade se pinta até 75 quadradinhos: 7 colunas e meia. Embaixo, 0,75.',
      },
      descoberta: '0,75 são 75 centésimos: 75 quadradinhos de 100. Por cento é por cem, então 18 de 24 são 75 %. A parte ÷ o todo dá o decimal; em centésimos, ele é a porcentagem.',
      esboco: 'O momento-chave: a parte que era 18 de 24 aparece como 75 de 100. A divisão vem da aula de decimais; a grade, da aula 1 desta unidade.',
    },
    {
      tipo: 'anote',
      titulo: 'Que porcentagem é?',
      definicao: 'Para saber que porcentagem a parte é do todo, divida a parte pelo todo e multiplique por 100.',
      exemplo: { tex: '18 \\div 24 = 0{,}75 = 75\\,\\%', fala: 'dezoito dividido por vinte e quatro dá zero vírgula setenta e cinco, que são setenta e cinco por cento' },
      alerta: 'Divida a parte pelo todo, não o todo pela parte. Se a parte cabe no todo, a porcentagem é menor que 100 %.',
      esboco: 'A página do caderno com a grade de 75 quadradinhos ao lado da conta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma blusa de **R$ 120** está com **R$ 30** de desconto. De quantos por cento é o desconto?',
      fala: 'Uma blusa de cento e vinte reais está com trinta reais de desconto. De quantos por cento é o desconto?',
      visual: barra({ partes: 1, pintadas: 0, rotulo: 'R$ 120' }, 'Uma barra inteira, sem nada pintado, com "R$ 120" à direita: o preço da blusa.'),
      opcoes: [
        {
          texto: '25 %', certa: true,
          explica: 'Isso. $30 \\div 120 = 0{,}25$: R$ 30 é um quarto do preço, 25 %.',
          fala: 'Isso. Trinta dividido por cento e vinte dá zero vírgula vinte e cinco: trinta reais é um quarto do preço, vinte e cinco por cento.',
          mostra: BLUSA,
        },
        {
          texto: '30 %', erro: 'parte-como-porcentagem',
          explica: 'R$ 30 seria 30 % só se a blusa custasse R$ 100. Divida pelo preço: $30 \\div 120$.',
          fala: 'Trinta reais seria trinta por cento só se a blusa custasse cem reais. Divida pelo preço: trinta dividido por cento e vinte.',
          mostra: BLUSA,
        },
        {
          texto: '400 %', erro: 'divide-todo-pela-parte',
          explica: '$120 \\div 30 = 4$ diz que R$ 30 cabe 4 vezes no preço. Então o desconto é 1 de 4 partes: 25 %.',
          fala: 'Cento e vinte dividido por trinta dá quatro: trinta reais cabe quatro vezes no preço. Então o desconto é uma de quatro partes: vinte e cinco por cento.',
          mostra: BLUSA,
        },
      ],
      esboco: 'Todas as opções mostram a barra dos R$ 120 partida em 4 pedaços de R$ 30: o desconto é um pedaço, um quarto.',
    },
    {
      tipo: 'mexa',
      texto: 'Sua amiga acertou **21** de **30**: $21 \\div 30 = 0{,}7$. Pinte 0,7 na segunda grade e compare com a sua nota.',
      fala: 'Sua amiga acertou vinte e um de trinta: vinte e um dividido por trinta, zero vírgula sete. Pinte zero vírgula sete na segunda grade e compare com a sua nota.',
      visual: grade(
        { grades: [{ pintadas: 75, rotulo: 'você: 75 %' }, { pintadas: 0, leitura: { antes: 'amiga: ', depois: ' %' } }], ativa: 1, pintar: true, porColuna: true },
        'Duas grades lado a lado. A da esquerda já tem os seus 75 quadradinhos, com "você: 75 %". A da direita está vazia, com "amiga: 0 %"; cada toque pinta uma coluna inteira e a porcentagem embaixo anda junto, até "amiga: 70 %".',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas colunas da segunda grade para pintar 0,7.',
        sucesso: { pintadas: 70 },
        mostre: 'A segunda grade se pinta até 7 colunas: 0,7, 70 quadradinhos, "amiga: 70 %". A primeira tem 75.',
      },
      descoberta: 'Ela acertou mais questões, 21 contra 18, mas a prova dela era maior: 70 % contra os seus 75 %. A porcentagem põe os dois resultados na mesma escala, de 100.',
      esboco: 'O caso que pega: o número maior de acertos é a porcentagem menor. Na grade, a da direita fica meia coluna atrás.',
    },
    {
      tipo: 'passo',
      problema: 'A conta de luz foi de **R$ 150** para **R$ 180**. De quantos por cento foi o aumento?',
      fala: 'A conta de luz foi de cento e cinquenta para cento e oitenta reais. De quantos por cento foi o aumento?',
      visual: LUZ('?', '?'),
      passos: [
        {
          pergunta: 'Quantos reais a conta subiu?',
          opcoes: [
            { texto: 'R$ 30', certa: true, explica: 'Isso. $180 - 150 = 30$. Essa é a parte: o aumento.', fala: 'Isso. Cento e oitenta menos cento e cinquenta, trinta. Essa é a parte: o aumento.', mostra: LUZ(30, '?', [1]) },
            { texto: 'R$ 180', explica: 'R$ 180 é a conta nova. O aumento é o que ela tem a mais: $180 - 150$.', fala: 'Cento e oitenta é a conta nova. O aumento é o que ela tem a mais: cento e oitenta menos cento e cinquenta.' },
          ],
          linha: { tex: '180 - 150 = 30', fala: 'cento e oitenta menos cento e cinquenta são trinta reais de aumento' },
        },
        {
          pergunta: 'R$ 30 a mais que o quê? Por quanto você divide?',
          fala: 'Trinta reais a mais que o quê? Por quanto você divide?',
          opcoes: [
            { texto: 'Por 150, a conta de antes', certa: true, explica: 'Isso. O aumento se compara com o valor de antes: R$ 150 é o 100 %.', fala: 'Isso. O aumento se compara com o valor de antes: cento e cinquenta reais é o cem por cento.', mostra: LUZ(30, '?', [0]) },
            { texto: 'Por 180, a conta nova', erro: 'porcentagem-sobre-o-valor-errado', explica: 'A conta subiu a partir de R$ 150. É sobre ela que se mede o aumento: R$ 150 é o 100 %.', fala: 'A conta subiu a partir de cento e cinquenta reais. É sobre ela que se mede o aumento: cento e cinquenta é o cem por cento.' },
          ],
          linha: { tex: '30 \\div 150', fala: 'trinta dividido por cento e cinquenta' },
        },
        {
          pergunta: '$30 \\div 150 = 0{,}2$. De quantos por cento foi o aumento?',
          fala: 'Trinta dividido por cento e cinquenta dá zero vírgula dois. De quantos por cento foi o aumento?',
          opcoes: [
            { texto: '20 %', certa: true, explica: 'Isso. 0,2 são 20 centésimos. Confira: 20 % de 150 é 30.', fala: 'Isso. Zero vírgula dois são vinte centésimos. Confira: vinte por cento de cento e cinquenta é trinta.', mostra: LUZ(30, '20 %', [1]) },
            { texto: '0,2 %', erro: 'esquece-multiplicar-por-100', explica: '0,2 % não chega a um quadradinho da grade. 0,2 são 20 centésimos: multiplique por 100.', fala: 'Zero vírgula dois por cento não chega a um quadradinho da grade. Zero vírgula dois são vinte centésimos: multiplique por cem.', mostra: LUZ(30, '20 %') },
          ],
          linha: { tex: '0{,}2 = 20\\,\\%', fala: 'zero vírgula dois são vinte por cento' },
        },
      ],
      esboco: 'O aumento como parte e o valor de antes como todo. A tabela da unidade 10 confere: R$ 150 está para 100 % assim como R$ 30 está para 20 %.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: de um salário de **R$ 2.500**, **R$ 750** vão para o aluguel. Que porcentagem do salário é o aluguel?',
      fala: 'No papel: de um salário de dois mil e quinhentos reais, setecentos e cinquenta vão para o aluguel. Que porcentagem do salário é o aluguel?',
      resposta: 30,
      resolucao: [
        { tex: '750 \\div 2.500 = 0{,}3', fala: 'setecentos e cinquenta dividido por dois mil e quinhentos dá zero vírgula três' },
        { tex: '0{,}3 = 30\\,\\%', fala: 'zero vírgula três são trinta por cento' },
      ],
      esboco: 'Parte ÷ todo com números de verdade do orçamento. Confere de cabeça: 10 % de 2.500 é 250, e 750 são 3 vezes isso.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['que-porcentagem-n1', 'que-porcentagem-n2', 'que-porcentagem-n3'],
      esboco: 'Nível 1: acertos, vagas ou peças, com todos pequenos (4, 5, 10, 20, 25) e a barra. Nível 2: um desconto ou um aumento em reais, com a tabela até o 100 %. Nível 3: salário, entrada e turma, às vezes com meia porcentagem (12,5 %), sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Seus 18 de 24 são **75 %** da prova: 75 quadradinhos de 100. Na próxima aula: um desconto depois do outro.',
      fala: 'Seus dezoito de vinte e quatro são setenta e cinco por cento da prova: setenta e cinco quadradinhos de cem. Na próxima aula: um desconto depois do outro.',
      visual: SETENTA_E_CINCO,
      esboco: 'Responde ao gancho com a grade de 75 e anuncia as variações sucessivas.',
    },
  ],
}
