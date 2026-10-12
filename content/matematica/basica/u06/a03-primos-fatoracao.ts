import type { Aula, Visual } from '@/lib/formation/schema'

// Primo é o número que só forma um retângulo: uma fileira. Tem exatamente
// dois divisores, 1 e ele mesmo. O 1 não é primo (tem um divisor só), o 2 é
// (o único par). Os outros números se quebram em primos, e por qualquer
// caminho a quebra termina nos mesmos primos: a fatoração é única.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const arvore = (linhas: string[], esboco: string, destaque?: string): Visual => ({
  modelo: 'livre',
  estado: destaque ? { expressao: linhas, destaque } : { expressao: linhas },
  esboco,
})
const UM_A_QUINZE = Array.from({ length: 15 }, (_, i) => String(i + 1))

export const aula: Aula = {
  id: 'B.U6.A3',
  titulo: 'Primos e fatoração',
  objetivo: 'Reconhecer números primos (exatamente dois divisores), saber que 1 não é primo e que ímpar não quer dizer primo, e fatorar um número em primos até o fim.',
  modelo: 'retangulo',
  esboco: 'O 12 formava três painéis. E o 7? O aluno tenta fileiras de 2, sobra 1; de 3, sobra 1; nada fecha, só a fileira comprida. Esse é o primo. Depois, o crivo: tocar os primos de 1 a 15. Por fim, os compostos se quebram em primos como uma árvore (60 = 6 × 10 = 2 × 3 × 2 × 5), e por qualquer caminho os primos são os mesmos. Momento-chave: 4 × 15 e 6 × 10 parecem caminhos diferentes, mas os dois terminam em 2 × 2 × 3 × 5.',
  vega: 'Ideia central: primo é o número com exatamente dois divisores, 1 e ele mesmo; no retângulo, só forma uma fileira. Os demais (a partir do 4) são compostos e se escrevem como produto de primos, de um jeito só, a menos da ordem. Erros esperados: achar que 1 é primo (tem um divisor só); achar que primo é o mesmo que ímpar (9, 15 e 21 não são; 2 é); parar a fatoração num fator composto (60 = 4 × 15); escrever cada primo uma vez só (60 = 2 × 3 × 5). Guie perguntando "Esse número forma mais de um retângulo?", "Esse fator ainda se quebra?", "Multiplicando de volta, dá o número?". Comece a fatoração pelo menor primo que divide (use as regras da aula anterior). Em Sua vez, peça a árvore no papel.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Com **12** azulejos você montou 3 painéis diferentes. Com **7**, quantos dá para montar?',
      fala: 'Com doze azulejos você montou três painéis diferentes. Com sete, quantos dá para montar?',
      visual: ret({ linhas: 0, colunas: 7, total: 7 }, 'Os 7 azulejos soltos numa fila.'),
      esboco: 'A mesma pergunta da primeira aula, com um número que se recusa a formar retângulos.',
    },
    {
      tipo: 'mexa',
      texto: 'Tente fileiras de **2** com os 7.',
      fala: 'Tente fileiras de dois com os sete.',
      visual: ret({ linhas: 0, colunas: 2, rotulos: true, adicionar: true, total: 7 }, 'Os 7 soltos. Cada toque sobe uma fileira de 2.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque até não dar para montar outra fileira de 2.',
        sucesso: { linhas: 3 },
        mostre: 'Três fileiras de 2 sobem. Sobra 1 azulejo, contornado em âmbar.',
      },
      descoberta: 'Fileiras de 2 deixam 1 sobrando. O 2 não é divisor de 7.',
      esboco: 'O azulejo que sobra fica aceso. O aluno já desconfia do resto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Fileiras de 3, 4, 5 e 6 também deixam sobra. Quantos painéis o **7** forma?',
      fala: 'Fileiras de três, quatro, cinco e seis também deixam sobra. Quantos painéis o sete forma?',
      visual: ret({ linhas: 3, colunas: 2, rotulos: true, sobra: 1 }, 'As 3 fileiras de 2 e o azulejo solto.'),
      opcoes: [
        {
          texto: 'Um só: a fileira de 7', certa: true,
          explica: 'Isso. Só $1 \\times 7$. O 7 tem dois divisores: 1 e 7.',
          mostra: ret({ linhas: 1, colunas: 7, rotulos: true, total: 7 }, 'Os 7 azulejos se alinham numa fileira só.'),
        },
        {
          texto: 'Dois: 1 × 7 e 7 × 1',
          explica: '$7 \\times 1$ é o mesmo painel girado, como 3 × 4 e 4 × 3. É um painel só.',
          mostra: ret({ linhas: 1, colunas: 7, rotulos: true, total: 7, girar: true }, 'A fileira gira e fica em pé: o mesmo painel.'),
        },
        {
          texto: 'Nenhum',
          explica: 'Uma fileira só também é um retângulo: $1 \\times 7$. É o único.',
          mostra: ret({ linhas: 1, colunas: 7, rotulos: true, total: 7 }, 'Os 7 numa fileira só.'),
        },
      ],
      esboco: 'O 7 é o primeiro número "teimoso" da aula.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E o **1**? Ele forma um painel só. Ele é primo?',
      fala: 'E o um? Ele forma um painel só. Ele é primo?',
      visual: ret({ linhas: 1, colunas: 1, total: 1 }, 'Um azulejo sozinho.'),
      opcoes: [
        {
          texto: 'Não: tem um divisor só', certa: true,
          explica: 'Isso. Primo tem **exatamente** dois divisores. O 1 tem só um, ele mesmo.',
          mostra: ret({ linhas: 1, colunas: 1, total: 1 }, 'O azulejo sozinho, com um rótulo só: 1.'),
        },
        {
          texto: 'Sim: só se divide por 1 e por ele mesmo', erro: 'um-e-primo',
          explica: 'Aqui "1 e ele mesmo" são o mesmo número: um divisor só. Primo precisa de dois.',
          mostra: ret({ linhas: 1, colunas: 1, total: 1 }, 'Os dois rótulos, 1 e 1, se juntam num só.'),
        },
      ],
      esboco: 'O erro mais famoso dos primos, desmontado contando divisores.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O **9** é ímpar. Ele é primo?',
      fala: 'O nove é ímpar. Ele é primo?',
      visual: ret({ linhas: 0, colunas: 9, total: 9 }, 'Os 9 azulejos soltos numa fila.'),
      opcoes: [
        {
          texto: 'Não: forma 3 × 3', certa: true,
          explica: 'Isso. O 9 forma um quadrado de 3 por 3. Tem três divisores: 1, 3 e 9.',
          mostra: ret({ linhas: 3, colunas: 3, rotulos: true, total: 9 }, 'Os 9 se arrumam num quadrado 3 por 3.'),
        },
        {
          texto: 'Sim: é ímpar', erro: 'primo-e-impar',
          explica: 'Ímpar não basta: o 9 forma um quadrado 3 × 3. E o 2 é par e primo.',
          mostra: ret({ linhas: 3, colunas: 3, rotulos: true, total: 9 }, 'Os 9 se arrumam num quadrado 3 por 3.'),
        },
      ],
      esboco: 'Primo não é ímpar. O quadrado 3 × 3 aparece na hora.',
    },
    {
      tipo: 'anote',
      titulo: 'Número primo',
      definicao: 'Um número **primo** tem exatamente dois divisores: 1 e ele mesmo. Ele só forma um retângulo, de uma fileira.',
      exemplo: { tex: '7 = 1 \\times 7 \\text{: primo} \\qquad 9 = 3 \\times 3 \\text{: não é primo}', fala: 'sete é um vezes sete: primo. Nove é três vezes três: não é primo' },
      alerta: 'O **1** não é primo: tem um divisor só. E o 2 é primo, mesmo sendo par.',
      esboco: 'A página com a fileira de 7 e o quadrado de 9 lado a lado.',
    },
    {
      tipo: 'mexa',
      texto: 'Toque nos primos de 1 a 15, do menor para o maior.',
      fala: 'Toque nos primos de um a quinze, do menor para o maior.',
      visual: {
        modelo: 'livre',
        estado: { fichas: UM_A_QUINZE, lugares: ['1º', '2º', '3º', '4º', '5º', '6º'] },
        esboco: 'As fichas de 1 a 15 e seis lugares. Proposta (o crivo): uma grade de 1 a 15 em que tocar um primo risca os múltiplos dele. Tocar o 2 risca 4, 6, 8…; o 3 risca 9 e 15; o 1 fica de fora, cinza.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque só nos primos, do menor para o maior.',
        sucesso: { ordem: ['2', '3', '5', '7', '11', '13'] },
        mostre: 'O 2, o 3, o 5, o 7, o 11 e o 13 vão para os lugares, nessa ordem. O 1, o 9 e o 15 ficam de fora.',
      },
      descoberta: 'De 1 a 15, os primos são 2, 3, 5, 7, 11 e 13. O 1 não entra, e o 9 e o 15 são ímpares que não são primos.',
      esboco: 'O crivo de Eratóstenes em miniatura. Errar o 1 ou o 9 balança as fichas.',
    },
    {
      tipo: 'ideia',
      texto: 'Os outros números se **quebram em primos**, como uma árvore: $60 = 6 \\times 10 = 2 \\times 3 \\times 2 \\times 5$.',
      fala: 'Os outros números se quebram em primos, como uma árvore: sessenta é seis vezes dez, que é dois vezes três vezes dois vezes cinco.',
      visual: arvore(['60', '6 × 10', '2 × 3 × 2 × 5'], 'A árvore do 60 de cima para baixo: o 6 se abre em 2 e 3, o 10 em 2 e 5. Proposta: galhos de verdade, com os primos nas folhas, acesos em âmbar.'),
      esboco: 'Os primos são os tijolos: todo número se monta com eles.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém escreveu $60 = 4 \\times 15$ e parou. A fatoração em primos acabou?',
      fala: 'Alguém escreveu sessenta igual a quatro vezes quinze e parou. A fatoração em primos acabou?',
      visual: arvore(['60', '4 × 15'], 'A árvore do 60 parada no 4 e no 15.'),
      opcoes: [
        {
          texto: 'Não: 4 e 15 ainda se quebram', certa: true,
          explica: 'Isso. $4 = 2 \\times 2$ e $15 = 3 \\times 5$. Só se para quando todos são primos.',
          mostra: arvore(['60', '4 × 15', '2 × 2 × 3 × 5'], 'O 4 se abre em 2 e 2, o 15 em 3 e 5.'),
        },
        {
          texto: 'Sim: 4 × 15 dá 60', erro: 'fatoracao-com-composto',
          explica: 'Dá 60, mas o 4 e o 15 não são primos: formam mais de um retângulo. Continue: $2 \\times 2 \\times 3 \\times 5$.',
          mostra: arvore(['60', '4 × 15', '2 × 2 × 3 × 5'], 'O 4 e o 15 piscam e se abrem.'),
        },
      ],
      esboco: 'Parar cedo é o erro da fatoração. A pergunta de cada fator: "ainda se quebra?".',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um começou por $6 \\times 10$, outro por $4 \\times 15$. No fim, os primos são diferentes?',
      fala: 'Um começou por seis vezes dez, outro por quatro vezes quinze. No fim, os primos são diferentes?',
      visual: arvore(['6 × 10', '2 × 3 × 2 × 5'], 'A primeira árvore, a do 6 × 10.'),
      opcoes: [
        {
          texto: 'Não: os dois chegam a 2 × 2 × 3 × 5', certa: true,
          explica: 'Isso. Por qualquer caminho, os primos do 60 são os mesmos: dois 2, um 3 e um 5.',
          mostra: arvore(['4 × 15', '2 × 2 × 3 × 5'], 'A segunda árvore desce e termina nas mesmas folhas, só em outra ordem.'),
        },
        {
          texto: 'Sim: começaram diferente',
          explica: 'As duas árvores terminam em dois 2, um 3 e um 5. Muda a ordem, não os primos.',
          mostra: arvore(['4 × 15', '2 × 2 × 3 × 5'], 'As folhas das duas árvores se alinham, iguais.'),
        },
      ],
      esboco: 'O momento-chave: a fatoração é única. É por isso que os primos são os tijolos.',
    },
    {
      tipo: 'anote',
      titulo: 'Fatoração em primos',
      definicao: 'Fatorar é escrever o número como produto de primos. Por qualquer caminho, os primos são sempre os mesmos.',
      exemplo: { tex: '60 = 2 \\times 2 \\times 3 \\times 5', fala: 'sessenta é dois vezes dois vezes três vezes cinco' },
      alerta: 'Só pare quando todos forem primos. E não esqueça os repetidos: 60 tem dois 2.',
      esboco: 'A página com a árvore do 60, as folhas circuladas.',
    },
    {
      tipo: 'passo',
      problema: 'Fatore **84** em primos.',
      fala: 'Fatore oitenta e quatro em primos.',
      visual: arvore(['84'], 'O 84 no topo da árvore, esperando o primeiro galho.'),
      passos: [
        {
          pergunta: 'Por qual primo começar?',
          opcoes: [
            { texto: '2: o 84 é par', certa: true, explica: 'Isso. $84 = 2 \\times 42$.', mostra: arvore(['84', '2 × 42'], 'O 84 se abre em 2 e 42.') },
            { texto: '1', erro: 'um-e-primo', explica: 'O 1 não é primo, e $1 \\times 84$ não quebra nada. Comece pelo 2: o 84 é par.', mostra: arvore(['84', '2 × 42'], 'O 84 se abre em 2 e 42.') },
          ],
          linha: { tex: '84 = 2 \\times 42', fala: 'oitenta e quatro é dois vezes quarenta e dois' },
        },
        {
          pergunta: 'E o 42?',
          fala: 'E o quarenta e dois?',
          opcoes: [
            { texto: '2 × 21', certa: true, explica: 'Isso. O 42 também é par.', mostra: arvore(['84', '2 × 42', '2 × 2 × 21'], 'O 42 se abre em 2 e 21.') },
            { texto: '42 é primo', explica: '42 é par: $42 = 2 \\times 21$. O único primo par é o 2.', mostra: arvore(['84', '2 × 42', '2 × 2 × 21'], 'O 42 se abre em 2 e 21.') },
          ],
          linha: { tex: '= 2 \\times 2 \\times 21', fala: 'igual a dois vezes dois vezes vinte e um' },
        },
        {
          pergunta: 'E o 21?',
          fala: 'E o vinte e um?',
          opcoes: [
            { texto: '3 × 7', certa: true, explica: 'Isso. $2 + 1 = 3$: divisível por 3. E 3 e 7 são primos.', mostra: arvore(['84', '2 × 42', '2 × 2 × 21', '2 × 2 × 3 × 7'], 'O 21 se abre em 3 e 7. Todas as folhas são primas.') },
            { texto: '21 é primo: é ímpar', erro: 'primo-e-impar', explica: 'Ímpar não basta: $21 = 3 \\times 7$. A soma $2 + 1 = 3$ já avisava.', mostra: arvore(['84', '2 × 42', '2 × 2 × 21', '2 × 2 × 3 × 7'], 'O 21 se abre em 3 e 7.') },
          ],
          linha: { tex: '= 2 \\times 2 \\times 3 \\times 7', fala: 'igual a dois vezes dois vezes três vezes sete' },
        },
      ],
      esboco: 'Cada passo tira o menor primo. As regras de divisibilidade da aula anterior escolhem o galho.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: fatore **90** em primos. Qual é o maior primo da fatoração?',
      fala: 'No papel: fatore noventa em primos. Qual é o maior primo da fatoração?',
      resposta: 5,
      resolucao: [
        { tex: '90 = 2 \\times 45', fala: 'noventa é dois vezes quarenta e cinco' },
        { tex: '= 2 \\times 3 \\times 15', fala: 'igual a dois vezes três vezes quinze' },
        { tex: '= 2 \\times 3 \\times 3 \\times 5', fala: 'igual a dois vezes três vezes três vezes cinco' },
        { tex: '\\text{O maior primo é 5}', fala: 'o maior primo é cinco' },
      ],
      esboco: 'A árvore no papel. O maior primo pega quem para no 15 ou no 45.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['primos-n1', 'primos-n2', 'primos-n3'],
      esboco: 'Nível 1: achar o primo entre quatro números, com o 1 e um ímpar composto de isca. Nível 2: escolher a fatoração certa entre uma com fator composto, uma sem o repetido e uma com o 1. Nível 3: fatorar sozinho e dar o maior primo, às vezes numa situação de caixas.',
    },
    {
      tipo: 'fecho',
      texto: 'Com 7 azulejos, um painel só: o **7** é primo. Na próxima aula: quando dois ônibus saem juntos de novo.',
      fala: 'Com sete azulejos, um painel só: o sete é primo. Na próxima aula: quando dois ônibus saem juntos de novo.',
      visual: ret({ linhas: 1, colunas: 7, rotulos: true, total: 7 }, 'A fileira de 7, sozinha.'),
      esboco: 'Responder ao gancho. Os primos e a fatoração vão servir para o MMC e o MDC.',
    },
  ],
}
