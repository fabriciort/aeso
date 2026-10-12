import type { Aula, Visual } from '@/lib/formation/schema'

// A distributiva com o retângulo partido. Partir o retângulo não muda o
// total: 7 × 8 = 7 × 5 + 7 × 3. Com números maiores, o retângulo deixa de
// ter quadradinhos e vira área: 6 × 23 = 6 × 20 + 6 × 3. É a ideia que faz
// a multiplicação armada funcionar (próxima aula) e que volta na álgebra.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const R7x8 = { linhas: 7, colunas: 8, rotulos: true }
const A6x23 = { base: [20, 3], altura: [6] }

export const aula: Aula = {
  id: 'B.U3.A4',
  titulo: 'Quebrar para multiplicar',
  objetivo: 'Multiplicar um número de um algarismo por um de dois (6 × 23) quebrando o maior em dezenas e unidades, multiplicando cada parte e somando, e explicar com o retângulo partido por que isso funciona.',
  modelo: 'retangulo',
  esboco: 'O retângulo de 7 por 8 em quadradinhos. O aluno corta entre a quinta e a sexta coluna: o retângulo se separa em 7 × 5 e 7 × 3, dois fatos fáceis. Depois o retângulo cresce para 6 por 23 e os quadradinhos somem: vira um retângulo de área, partido em 20 e 3. Momento-chave: o pedaço pequeno (6 × 3) acender e o aluno perceber que ele também tem 6 linhas, então vale 18, não 3.',
  vega: 'Ideia central: para multiplicar, quebre um número em partes, multiplique cada parte e some (propriedade distributiva). No retângulo: partir não muda o total. 7 × 8 = 7 × 5 + 7 × 3 = 35 + 21 = 56. 6 × 23 = 6 × 20 + 6 × 3 = 120 + 18 = 138. Erros esperados: multiplicar só a parte redonda e somar a outra como está (6 × 23 → 120 + 3 = 123), tratar 20 como 2 (6 × 23 → 12 + 18 = 30) e somar os números (6 + 23). Guie perguntando "Quantas linhas tem o pedaço pequeno?", "Quanto vale o 2 do 23?". Quebrar em dezena redonda e unidades é o caminho mais útil, mas qualquer quebra certa vale. Em Sua vez, não diga o resultado: peça o produto de cada pedaço.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você leva **6 camisetas** de **R$ 23**. A tabuada não chega até 23. Quanto dá?',
      fala: 'Você leva seis camisetas de vinte e três reais. A tabuada não chega até vinte e três. Quanto dá?',
      visual: ret({ base: [23], altura: [6] }, 'Um retângulo comprido, de 6 de altura por 23 de base, sem quadradinhos. O 6 à esquerda, o 23 em cima, e um "?" dentro.'),
      esboco: 'Uma conta de loja que já passa da tabuada. A aula começa num retângulo pequeno e volta aqui.',
    },
    {
      tipo: 'mexa',
      texto: 'Esqueceu $7 \\times 8$? Corte o retângulo em **5 colunas** e **3 colunas**.',
      fala: 'Esqueceu sete vezes oito? Corte o retângulo em cinco colunas e três colunas.',
      visual: ret({ ...R7x8, cortar: true }, 'O retângulo de 7 por 8 em quadradinhos. Entre as colunas, linhas finas que acendem quando o dedo passa.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque entre duas colunas para cortar.',
        sucesso: { corte: 5 },
        mostre: 'Uma linha de corte desce entre a quinta e a sexta coluna; os dois pedaços se afastam um pouco: 7 × 5 e 7 × 3.',
      },
      descoberta: 'Um retângulo difícil vira dois fáceis. Os dois pedaços continuam com 7 linhas: 7 × 5 e 7 × 3.',
      esboco: 'Se o aluno cortar em outro lugar, o palco balança e diz "5 e 3 são fáceis: conte 5 colunas".',
    },
    {
      tipo: 'aposta',
      pergunta: 'Os pedaços são $7 \\times 5$ e $7 \\times 3$. Quanto dá o retângulo todo?',
      fala: 'Os pedaços são sete vezes cinco e sete vezes três. Quanto dá o retângulo todo?',
      visual: ret({ ...R7x8, cortes: [5] }, 'O retângulo partido em 5 e 3 colunas, os pedaços levemente afastados, com os rótulos de cada parte.'),
      opcoes: [
        {
          texto: '56', certa: true,
          explica: 'Isso. $35 + 21 = 56$. Partir não muda os quadradinhos.',
          mostra: ret({ ...R7x8, cortes: [5], areas: true, total: 56 }, 'Os pedaços mostram 35 e 21; o total 56 aparece embaixo.'),
        },
        {
          texto: '38', erro: 'distributiva-parcial',
          explica: '38 é $35 + 3$. O pedaço da direita também tem 7 linhas: $7 \\times 3 = 21$. Dá 56.',
          mostra: ret({ ...R7x8, cortes: [5], areas: true, destaque: [0, 1], total: 56 }, 'O pedaço da direita acende: 7 linhas de 3, 21.'),
        },
        {
          texto: '15', erro: 'soma-no-lugar-de-multiplicar',
          explica: '$7 + 8 = 15$ é menos que uma metade só. Os pedaços valem 35 e 21: 56.',
          mostra: ret({ ...R7x8, cortes: [5], areas: true, total: 56 }, 'Os pedaços mostram 35 e 21.'),
        },
      ],
      esboco: 'O erro mais comum desta aula aparece logo: esquecer que o pedaço pequeno também tem 7 linhas.',
    },
    {
      tipo: 'ideia',
      texto: 'Partir não muda o total: $7 \\times 8 = 7 \\times 5 + 7 \\times 3$. É a **propriedade distributiva**.',
      fala: 'Partir não muda o total: sete vezes oito é sete vezes cinco mais sete vezes três. É a propriedade distributiva.',
      visual: ret({ ...R7x8, cortes: [5], areas: true, total: 56 }, 'Os dois pedaços com 35 e 21 se encostam de novo; o 56 fica embaixo.'),
      esboco: 'O nome vem depois do corte. A frase do anote vem a seguir, com o caso grande.',
    },
    {
      tipo: 'passo',
      problema: 'Volte às camisetas: $6 \\times 23$.',
      fala: 'Volte às camisetas: seis vezes vinte e três.',
      visual: ret({ base: [23], altura: [6] }, 'O retângulo do gancho, 6 por 23, sem quadradinhos.'),
      passos: [
        {
          pergunta: 'Como quebrar o 23?',
          fala: 'Como quebrar o vinte e três?',
          opcoes: [
            { texto: '$20 + 3$', certa: true, explica: 'Isso. Um número redondo e o resto: as duas contas ficam fáceis.', mostra: ret({ ...A6x23 }, 'Um corte parte o retângulo em 20 e 3.') },
            { texto: '$10 + 13$', explica: 'Dá certo, mas $6 \\times 13$ ainda é difícil. Com $20 + 3$, as duas contas ficam fáceis.', mostra: ret({ ...A6x23 }, 'O corte vai para o lugar do 20 e 3.') },
          ],
          linha: { tex: '23 = 20 + 3', fala: 'vinte e três é vinte mais três' },
        },
        {
          pergunta: 'Quanto é $6 \\times 20$?',
          fala: 'Quanto é seis vezes vinte?',
          opcoes: [
            { texto: '120', certa: true, explica: 'Isso. $6 \\times 2 = 12$, vezes 10: 120.', mostra: ret({ ...A6x23, areas: [[120, '?']] }, 'O pedaço grande mostra 120.') },
            { texto: '12', erro: 'conta-zeros-errado', explica: '12 é $6 \\times 2$. O 20 vale 2 dezenas: 12 dezenas, 120.', mostra: ret({ ...A6x23, areas: [[120, '?']] }, 'O pedaço grande mostra 120.') },
          ],
          linha: { tex: '6 \\times 20 = 120', fala: 'seis vezes vinte é cento e vinte' },
        },
        {
          pergunta: 'E o pedaço pequeno?',
          opcoes: [
            { texto: '$6 \\times 3 = 18$', certa: true, explica: 'Isso. O pedaço pequeno também tem altura 6.', mostra: ret({ ...A6x23, areas: [[120, 18]], destaque: [0, 1] }, 'O pedaço pequeno acende e mostra 18.') },
            { texto: '3', erro: 'distributiva-parcial', explica: 'O pedaço pequeno tem 6 de altura, como o grande: $6 \\times 3 = 18$.', mostra: ret({ ...A6x23, areas: [[120, 18]], destaque: [0, 1] }, 'O pedaço pequeno acende: 6 de altura, 3 de base, 18.') },
          ],
          linha: { tex: '6 \\times 3 = 18', fala: 'seis vezes três é dezoito' },
        },
        {
          pergunta: 'Junte os pedaços.',
          opcoes: [
            { texto: '138', certa: true, explica: 'Isso. $120 + 18 = 138$.', mostra: ret({ ...A6x23, areas: [[120, 18]], total: 138 }, 'Os dois pedaços se encostam; o total 138 aparece embaixo.') },
            { texto: '123', erro: 'distributiva-parcial', explica: '123 é $120 + 3$: o 3 ficou sem multiplicar. $120 + 18 = 138$.', mostra: ret({ ...A6x23, areas: [[120, 18]], total: 138 }, 'O 18 do pedaço pequeno pisca; o total vira 138.') },
          ],
          linha: { tex: '6 \\times 23 = 120 + 18 = 138', fala: 'seis vezes vinte e três é cento e vinte mais dezoito, cento e trinta e oito' },
        },
      ],
      esboco: 'O retângulo de área substitui os quadradinhos: 6 × 23 teria 138 quadradinhos, demais para contar. As medidas nos lados bastam.',
    },
    {
      tipo: 'anote',
      titulo: 'Propriedade distributiva',
      definicao: 'Para multiplicar, quebre um número em partes, multiplique **cada parte** e some os resultados.',
      exemplo: { tex: '6 \\times 23 = 6 \\times 20 + 6 \\times 3 = 138', fala: 'seis vezes vinte e três é seis vezes vinte mais seis vezes três, cento e trinta e oito' },
      alerta: 'Multiplique todas as partes: $6 \\times 23$ não é $6 \\times 20 + 3$.',
      esboco: 'Na página: o retângulo de 6 por 23 partido em 20 e 3, com 120 e 18 dentro.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém fez $4 \\times 38 = 4 \\times 30 + 8 = 128$. Está certo?',
      fala: 'Alguém fez quatro vezes trinta e oito igual a quatro vezes trinta mais oito, cento e vinte e oito. Está certo?',
      visual: ret({ base: [30, 8], altura: [4], areas: [[120, '?']] }, 'O retângulo de 4 por 38 partido em 30 e 8. O pedaço grande mostra 120; o pequeno, "?".'),
      opcoes: [
        {
          texto: 'Não: faltou $4 \\times 8$', certa: true,
          explica: 'Isso. $4 \\times 8 = 32$, e $120 + 32 = 152$.',
          mostra: ret({ base: [30, 8], altura: [4], areas: [[120, 32]], total: 152 }, 'O pedaço pequeno mostra 32; o total 152 aparece.'),
        },
        {
          texto: 'Sim, está certo', erro: 'distributiva-parcial',
          explica: 'O pedaço do 8 também tem 4 de altura: $4 \\times 8 = 32$. Dá 152, não 128.',
          mostra: ret({ base: [30, 8], altura: [4], areas: [[120, 32]], total: 152, destaque: [0, 1] }, 'O pedaço pequeno acende: 4 por 8, 32.'),
        },
      ],
      esboco: 'Achar o erro de outra pessoa é mais leve que errar e fixa a regra: todas as partes.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Desenhe o retângulo partido e resolva: $7 \\times 34$.',
      fala: 'Desenhe o retângulo partido e resolva: sete vezes trinta e quatro.',
      resposta: 238,
      resolucao: [
        { tex: '34 = 30 + 4', fala: 'trinta e quatro é trinta mais quatro' },
        { tex: '7 \\times 30 = 210', fala: 'sete vezes trinta é duzentos e dez' },
        { tex: '7 \\times 4 = 28', fala: 'sete vezes quatro é vinte e oito' },
        { tex: '7 \\times 34 = 210 + 28 = 238', fala: 'sete vezes trinta e quatro é duzentos e dez mais vinte e oito, duzentos e trinta e oito' },
      ],
      esboco: 'O desenho não precisa ser em escala: um retângulo com um corte e as medidas nos lados.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['distributiva-n1', 'distributiva-n2', 'distributiva-n3'],
      esboco: 'Nível 1: um fato da tabuada partido em 5 e o resto, com o retângulo e os produtos na tela. Nível 2: um algarismo vezes dois, com o retângulo de área. Nível 3: preço vezes quantidade, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: '6 camisetas: $120 + 18$, **R$ 138**. Na próxima aula: e quando os **dois** números são grandes?',
      fala: 'Seis camisetas: cento e vinte mais dezoito, cento e trinta e oito reais. Na próxima aula: e quando os dois números são grandes?',
      visual: ret({ ...A6x23, areas: [[120, 18]], total: 138 }, 'O retângulo do gancho, partido em 120 e 18, com o 138 embaixo.'),
      esboco: 'Responder ao gancho. A próxima aula parte os dois lados do retângulo e chega à conta armada.',
    },
  ],
}
