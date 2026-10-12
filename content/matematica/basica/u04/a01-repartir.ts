import type { Aula, Visual } from '@/lib/formation/schema'

// A divisão tem dois sentidos: repartir (quanto cada um recebe) e quantos
// cabem (quantos grupos de um tamanho cabem no total). O aluno faz os dois
// com as mãos, no mesmo retângulo de 12, e vê que é a mesma conta lida de
// dois jeitos. A ordem importa: o total vem primeiro.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })

export const aula: Aula = {
  id: 'B.U4.A1',
  titulo: 'Repartir e quantos cabem',
  objetivo: 'Reconhecer os dois sentidos da divisão (repartir em partes iguais e contar quantos grupos cabem), escrever a conta na ordem certa e resolvê-la com a tabuada, com totais até cerca de 100.',
  modelo: 'retangulo',
  esboco: 'As 12 balas em fila viram um retângulo. Primeiro o aluno reparte como quem dá cartas: uma rodada de 3, uma bala para cada pessoa, até acabar; cada coluna é uma pessoa e tem 4. Depois faz pacotes de 4: cada linha é um pacote, e cabem 3. A reta mostra os mesmos 3 saltos de 4. Momento-chave: perceber que o retângulo de 12 responde às duas perguntas, por coluna e por linha.',
  vega: 'Ideia central: dividir é separar um total em partes iguais. Há duas perguntas: "quanto vai em cada parte?" (repartir: 12 balas para 3 pessoas, 4 cada) e "quantas partes cabem?" (12 balas em pacotes de 4, 3 pacotes). As duas se escrevem com ÷, e o total vem primeiro. Erros esperados: inverter a ordem (5 ÷ 20 em vez de 20 ÷ 5), trocar a operação (multiplicar ou subtrair uma vez só) e confundir o tamanho do grupo com o número de grupos. Guie perguntando "O que está sendo repartido?", "Quanto vai em cada uma?", "Quantos grupos você montou?". A tabuada ajuda: 3 vezes quanto dá 12? Em Sua vez, não diga a conta: peça para o aluno contar de grupo em grupo.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Repartir **12** balas entre **3** pessoas, ou fazer pacotes de **4** balas. É a mesma conta?',
      fala: 'Repartir doze balas entre três pessoas, ou fazer pacotes de quatro balas. É a mesma conta?',
      visual: ret({ linhas: 1, colunas: 12, total: 12 }, 'As 12 balas em fila, um quadradinho cada, com o 12 embaixo.'),
      esboco: 'Duas perguntas parecidas lado a lado. O fecho responde: é uma divisão só, lida de dois jeitos.',
    },
    {
      tipo: 'mexa',
      texto: 'Reparta como quem dá cartas: cada rodada dá **1** bala para cada uma das **3** pessoas.',
      fala: 'Reparta como quem dá cartas: cada rodada dá uma bala para cada uma das três pessoas.',
      visual: ret({ linhas: 0, colunas: 3, rotulos: true, adicionar: true, total: 12 }, 'Três colunas vazias, uma por pessoa, com o 12 embaixo. Cada toque desce uma linha de 3 quadradinhos: uma rodada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para dar uma rodada, até as 12 acabarem.',
        sucesso: { linhas: 4 },
        mostre: 'Quatro rodadas descem, uma por vez: 3, 6, 9, 12. Cada coluna fica com 4.',
      },
      descoberta: 'Depois de 4 rodadas as 12 balas acabam, e cada pessoa (cada coluna) tem 4.',
      esboco: 'O gesto de repartir que todo mundo conhece. Um contador discreto mostra quantas balas já saíram: 3, 6, 9, 12.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada pessoa ficou com **4**. Repartir em partes iguais é **dividir**: $12 \\div 3 = 4$.',
      fala: 'Cada pessoa ficou com quatro. Repartir em partes iguais é dividir: doze dividido por três é igual a quatro.',
      visual: ret({ linhas: 4, colunas: 3, rotulos: true, total: 12 }, 'As 4 linhas de 3. Proposta: uma coluna acende de cima a baixo, é o que uma pessoa ganhou (hoje o destaque só acende linhas).'),
      esboco: 'Nome e sinal depois do gesto. O sinal ÷ se lê "dividido por".',
    },
    {
      tipo: 'aposta',
      pergunta: 'Com as mesmas **12** balas, quantos **pacotes de 4** dá para fazer?',
      fala: 'Com as mesmas doze balas, quantos pacotes de quatro dá para fazer?',
      visual: ret({ linhas: 1, colunas: 12, total: 12 }, 'As 12 balas voltam para a fila.'),
      opcoes: [
        {
          texto: '3', certa: true,
          explica: 'Isso. Um pacote, dois, três: as 12 acabam. Quantos cabem também é dividir: $12 \\div 4 = 3$.',
          mostra: ret({ linhas: 3, colunas: 4, grupos: true, rotulos: true, total: 12 }, 'A fila se quebra em pedaços de 4, que descem um a um: 3 linhas separadas, 3 pacotes.'),
        },
        {
          texto: '4',
          explica: '4 é o que vai em cada pacote. A pergunta é quantos pacotes: 4, 8, 12, são **3**.',
          mostra: ret({ linhas: 3, colunas: 4, grupos: true, rotulos: true, total: 12 }, 'Os 3 pacotes de 4 se separam; o número 3 aparece ao lado, contando os pacotes.'),
        },
        {
          texto: '8', erro: 'operacao-trocada',
          explica: '8 é o que sobra depois do primeiro pacote. Continue tirando: 8, 4, 0. São **3** pacotes.',
          mostra: ret({ linhas: 3, colunas: 4, grupos: true, rotulos: true, total: 12 }, 'Um pacote sai e restam 8; depois mais um, e mais um.'),
        },
      ],
      esboco: 'O segundo sentido, previsto antes de feito. A opção 4 é a confusão entre o tamanho do grupo e o número de grupos.',
    },
    {
      tipo: 'ideia',
      texto: 'Na reta, **quantos cabem** são saltos: de 12, voltando de 4 em 4, são **3** saltos até o zero.',
      fala: 'Na reta, quantos cabem são saltos: de doze, voltando de quatro em quatro, são três saltos até o zero.',
      visual: reta({ de: 0, ate: 12, passo: 1, marcas: [0, 4, 8, 12], numero: 12, saltos: [[12, 8, '−4'], [8, 4, '−4'], [4, 0, '−4']] }, 'Três arcos voltam do 12 ao 0, um depois do outro, cada um com −4 em âmbar.'),
      esboco: 'A reta da unidade 1 reaparece: dividir é tirar o mesmo grupo várias vezes, como uma subtração repetida.',
    },
    {
      tipo: 'aposta',
      pergunta: '**20** pessoas vão de van, com **5** lugares cada. Qual conta diz quantas vans?',
      fala: 'Vinte pessoas vão de van, com cinco lugares cada. Qual conta diz quantas vans?',
      visual: ret({ linhas: 0, colunas: 5, rotulos: true, total: 20 }, 'Linhas de 5 lugares ainda vazias, com o 20 embaixo.'),
      opcoes: [
        {
          texto: '$20 \\div 5$', fala: 'vinte dividido por cinco', certa: true,
          explica: 'Isso. As 20 pessoas são o total, que vem primeiro. Cabem 4 vans: $20 \\div 5 = 4$.',
          mostra: ret({ linhas: 4, colunas: 5, grupos: true, rotulos: true, total: 20 }, 'Quatro linhas de 5 descem: 4 vans cheias.'),
        },
        {
          texto: '$5 \\div 20$', fala: 'cinco dividido por vinte', erro: 'divide-o-menor-pelo-maior',
          explica: 'Essa conta reparte 5 coisas entre 20: ninguém ganha uma inteira. O total, as 20 pessoas, vem primeiro.',
          mostra: ret({ linhas: 4, colunas: 5, grupos: true, rotulos: true, total: 20 }, 'O 20 embaixo acende: é ele que é separado em grupos de 5.'),
        },
        {
          texto: '$20 \\times 5$', fala: 'vinte vezes cinco', erro: 'operacao-trocada',
          explica: '$20 \\times 5 = 100$: seriam 100 lugares. Aqui as 20 pessoas se separam em grupos de 5.',
          mostra: ret({ linhas: 4, colunas: 5, grupos: true, rotulos: true, total: 20 }, 'As 20 pessoas enchem 4 linhas de 5, e acabam.'),
        },
      ],
      esboco: 'A ordem importa: na soma e na multiplicação não, aqui sim. O desmonte do 5 ÷ 20 é a imagem de 5 coisas para 20 pessoas.',
    },
    {
      tipo: 'anote',
      titulo: 'Divisão',
      definicao: 'Dividir é separar um total em partes iguais. Pergunta quanto vai em cada parte, ou quantas partes cabem.',
      exemplo: { tex: '12 \\div 3 = 4 \\qquad 12 \\div 4 = 3', fala: 'doze dividido por três é quatro; doze dividido por quatro é três' },
      alerta: 'O total vem primeiro: $20 \\div 5$, não $5 \\div 20$.',
      esboco: 'A página com o retângulo de 3 por 4, as duas leituras e o sinal ÷.',
    },
    {
      tipo: 'passo',
      problema: 'Uma receita usa **3** ovos. Você tem **18**. Quantas receitas dá para fazer?',
      fala: 'Uma receita usa três ovos. Você tem dezoito. Quantas receitas dá para fazer?',
      visual: reta({ de: 0, ate: 18, passo: 1, marcas: [0, 3, 6, 9, 12, 15, 18], numero: 18 }, 'A reta de 0 a 18, com marcas de 3 em 3 e o 18 aceso.'),
      passos: [
        {
          pergunta: 'Qual conta?',
          opcoes: [
            { texto: '$18 \\div 3$', fala: 'dezoito dividido por três', certa: true, explica: 'Isso. Os 18 ovos são o total; cada receita leva um grupo de 3.' },
            { texto: '$3 \\div 18$', fala: 'três dividido por dezoito', erro: 'divide-o-menor-pelo-maior', explica: 'O que se separa são os 18 ovos. O total vem primeiro: $18 \\div 3$.' },
          ],
          linha: { tex: '18 \\div 3', fala: 'dezoito dividido por três' },
        },
        {
          pergunta: '3 vezes quanto dá 18?',
          fala: 'Três vezes quanto dá dezoito?',
          opcoes: [
            {
              texto: '6', certa: true, explica: 'Isso. $3 \\times 6 = 18$: dá para **6** receitas.',
              mostra: reta({ de: 0, ate: 18, passo: 1, marcas: [0, 3, 6, 9, 12, 15, 18], numero: 18, saltos: [[18, 15, '−3'], [15, 12, '−3'], [12, 9, '−3'], [9, 6, '−3'], [6, 3, '−3'], [3, 0, '−3']] }, 'Seis saltos de 3 voltam do 18 ao 0.'),
            },
            {
              texto: '5', explica: '$3 \\times 5 = 15$: sobram 3 ovos, e eles fazem mais uma receita. São **6**.',
              mostra: reta({ de: 0, ate: 18, passo: 1, marcas: [0, 3, 6, 9, 12, 15, 18], numero: 18, saltos: [[0, 3, '+3'], [3, 6, '+3'], [6, 9, '+3'], [9, 12, '+3'], [12, 15, '+3']] }, 'Cinco saltos param no 15; o trecho de 15 a 18 pisca: cabe mais um.'),
            },
            {
              texto: '15', erro: 'operacao-trocada', explica: '15 é o que sobra depois da primeira receita. Contando os grupos de 3, são **6**.',
              mostra: reta({ de: 0, ate: 18, passo: 1, marcas: [0, 3, 6, 9, 12, 15, 18], numero: 18, saltos: [[18, 15, '−3'], [15, 12, '−3'], [12, 9, '−3'], [9, 6, '−3'], [6, 3, '−3'], [3, 0, '−3']] }, 'O primeiro salto para no 15; os outros cinco seguem até o 0.'),
            },
          ],
          linha: { tex: '18 \\div 3 = 6', fala: 'dezoito dividido por três é seis' },
        },
      ],
      esboco: 'A tabuada do 3 vira ferramenta de divisão. O "5" pega quem para antes; o "15" pega quem subtrai uma vez só.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: **24** cadeiras em **4** fileiras iguais. Quantas cadeiras vão em cada fileira?',
      fala: 'No papel: vinte e quatro cadeiras em quatro fileiras iguais. Quantas cadeiras vão em cada fileira?',
      resposta: 6,
      resolucao: [
        { tex: '24 \\div 4', fala: 'vinte e quatro dividido por quatro' },
        { tex: '4 \\times 6 = 24', fala: 'quatro vezes seis é vinte e quatro' },
        { tex: '24 \\div 4 = 6', fala: 'vinte e quatro dividido por quatro é seis' },
      ],
      esboco: 'Agora o sentido de repartir, sozinho. Desenhar as 4 fileiras e distribuir as cadeiras vale.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['repartir-n1', 'repartir-n2', 'repartir-n3'],
      esboco: 'Nível 1: os dois sentidos com números pequenos e o retângulo na tela. Nível 2: escolher a conta certa, na ordem certa. Nível 3: situações do dia a dia, sem apoio.',
    },
    {
      tipo: 'fecho',
      texto: 'É uma divisão só: 3 colunas de 4 ou 3 linhas de 4, o mesmo retângulo girado. Na próxima aula: e quando **sobra**?',
      fala: 'É uma divisão só: três colunas de quatro ou três linhas de quatro, o mesmo retângulo girado. Na próxima aula: e quando sobra?',
      visual: ret({ linhas: 4, colunas: 3, rotulos: true, girar: true, total: 12 }, 'O retângulo de 4 linhas e 3 colunas gira e vira 3 linhas de 4: as pessoas e os pacotes no mesmo desenho.'),
      esboco: 'Responder ao gancho com a imagem do giro. A pergunta da sobra prepara o resto.',
    },
  ],
}
