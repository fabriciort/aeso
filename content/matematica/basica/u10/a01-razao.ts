import type { Aula, Visual } from '@/lib/formation/schema'

// Razão: comparar duas quantidades por divisão. O suco concentrado é a
// imagem: 1 copo de suco para 3 de água. A barra é a jarra (copos pintados
// são suco, os apagados são água), e a tabela de proporção põe as jarras
// lado a lado. O momento-chave: de jarra em jarra, a diferença entre água
// e suco muda (2, 4, 6), e a divisão fica a mesma (sempre 3).
// Os erros a desmontar: somar o mesmo nos dois (pensa-aditivamente),
// mudar só um dos dois (muda-so-um-termo) e trocar a ordem (razao-invertida).

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const tabela = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })

const JARRA = { partes: 4, pintadas: 1, rotulo: '1 : 3' }
/** Duas jarras pequenas juntas: 8 copos, o suco no primeiro copo de cada uma. */
const DOBRADA = { partes: 4, inteiros: 2, marcadas: [0, 4], rotulo: '2 : 6' }
const SUCO = (valores: (number | string)[], agua: (number | string)[]) => [
  { rotulo: 'suco (copos)', valores },
  { rotulo: 'água (copos)', valores: agua },
]

export const aula: Aula = {
  id: 'B.U10.A1',
  titulo: 'Razão',
  objetivo: 'Comparar duas quantidades por divisão (quantas vezes uma cabe na outra), escrever a razão na ordem certa (1 : 3) e manter a razão ao aumentar uma receita.',
  modelo: 'barra',
  esboco: 'A jarra de suco concentrado é uma barra de 4 copos: 1 âmbar (suco) e 3 apagados (água). O aluno dobra a jarra pintando o suco de uma jarra de 8 copos. Depois a tabela de proporção põe as jarras de 1, 2, 3 e 4 copos de suco lado a lado. Momento-chave: na tabela, a diferença entre água e suco cresce (2, 4, 6, 8), mas a água é sempre o triplo do suco, e a seta × 3 aparece à direita. Só então o nome: razão, 1 : 3. Por fim, a ordem importa (açúcar para farinha não é farinha para açúcar).',
  vega: 'Ideia central: razão compara duas quantidades por divisão, não por subtração. "1 copo de suco para 3 de água" quer dizer que a água é 3 vezes o suco, em qualquer tamanho de jarra. Escreve-se 1 : 3 (lê-se "1 para 3") ou como fração, 1/3. A ordem importa: suco para água é 1 : 3; água para suco é 3 : 1. Erros esperados: pensar aditivamente (dobrar a jarra como 2 para 4, "um a mais em cada"), mudar só um dos dois (2 de suco e a mesma água) e trocar a ordem. Guie com "Quantas vezes a água cabe no suco?", "Essa jarra tem o mesmo gosto?", "Quem vem primeiro na pergunta?". Não confunda com a fração da jarra: o suco é 1/4 da jarra (1 de 4 copos), e a razão suco para água é 1 : 3. Se o aluno perguntar, mostre a barra: 1 pintado, 3 apagados, 4 no total.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'O suco concentrado diz: **1 copo de suco para 3 de água**. Você vai usar **2 copos de suco**. Quanta água?',
      fala: 'O suco concentrado diz: um copo de suco para três de água. Você vai usar dois copos de suco. Quanta água?',
      visual: barra(JARRA, 'A jarra como uma barra de 4 copos: o primeiro em âmbar (suco), os outros 3 apagados (água). À direita, 1 : 3.'),
      esboco: 'Todo mundo já leu esse rótulo. A pergunta fica aberta: a tentação é dizer 4 (um a mais em cada).',
    },
    {
      tipo: 'mexa',
      texto: 'Duas jarras iguais juntas fazem uma jarra dobrada, de **8 copos**. Pinte o suco dela, com o mesmo gosto.',
      fala: 'Duas jarras iguais juntas fazem uma jarra dobrada, de oito copos. Pinte o suco dela, com o mesmo gosto.',
      visual: barra(
        { barras: [JARRA, { partes: 4, inteiros: 2, pintadas: 0, rotulo: '8 copos' }], escala: 2, pintar: true, ativa: 1 },
        'Em cima, a jarra de 4 copos (1 : 3). Embaixo, a jarra dobrada: 8 copos do mesmo tamanho, todos apagados, com a borda tracejada. Os copos têm o mesmo tamanho nas duas barras.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos copos de suco da jarra dobrada.',
        sucesso: { pintadas: 2 },
        mostre: 'Dois copos da jarra dobrada ficam âmbar: 2 de suco e 6 de água.',
      },
      descoberta: 'Dobrar a jarra dobra o suco e a água: 2 copos de suco e 6 de água. Não é 2 e 4.',
      esboco: 'O aluno conta: a jarra dobrada são duas jarras pequenas, cada uma com 1 de suco. Pinta 2 e vê sobrar 6 apagados. Responde ao gancho: 6 copos de água.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma amiga faz **2 de suco para 4 de água**: "um a mais em cada". Fica com o mesmo gosto?',
      fala: 'Uma amiga faz dois de suco para quatro de água: um a mais em cada. Fica com o mesmo gosto?',
      visual: barra({ barras: [JARRA, { partes: 6, pintadas: 2, rotulo: '2 : 4' }] }, 'Duas jarras cheias, do mesmo comprimento: em cima 1 de 4 copos em âmbar, embaixo 2 de 6.'),
      opcoes: [
        {
          texto: 'Não: fica mais forte', certa: true,
          explica: 'Isso. Cada copo de suco ficou com só 2 de água, não 3. A parte âmbar da jarra cresceu.',
          mostra: barra({ barras: [JARRA, { partes: 6, pintadas: 2, rotulo: '2 : 4' }], guia: 0.25 }, 'A linha tracejada marca onde o suco termina na jarra de cima. Embaixo, o âmbar passa dela: mais suco na jarra.'),
        },
        {
          texto: 'Sim, o mesmo gosto', erro: 'pensa-aditivamente',
          explica: 'Somar 1 nos dois muda a mistura. Na barra, o âmbar de baixo passa do de cima: o suco ficou mais forte.',
          mostra: barra({ barras: [JARRA, { partes: 6, pintadas: 2, rotulo: '2 : 4' }], guia: 0.25 }, 'A linha tracejada no fim do suco da jarra de cima. O âmbar de baixo vai além dela.'),
        },
        {
          texto: 'Não: fica mais fraco',
          explica: 'Seria mais fraco com mais água para cada suco. Aqui cada copo de suco tem só 2 de água: mais forte.',
          mostra: barra({ barras: [JARRA, { partes: 6, pintadas: 2, rotulo: '2 : 4' }], guia: 0.25 }, 'A linha tracejada no fim do suco de cima; embaixo o âmbar vai além.'),
        },
      ],
      esboco: 'As duas barras têm o mesmo comprimento (a jarra cheia), então a parte âmbar é o "quanto de suco" da jarra: 1/4 contra 2/6. O erro aditivo se desmonta no olho.',
    },
    {
      tipo: 'mexa',
      texto: 'Na tabela, cada coluna é uma jarra. Toque para fazer jarras com 2, 3 e 4 copos de suco.',
      fala: 'Na tabela, cada coluna é uma jarra. Toque para fazer jarras com dois, três e quatro copos de suco.',
      visual: tabela(
        { linhas: SUCO([1, 2, 3, 4], [3, 6, 9, 12]), mostradas: 1, completar: true },
        'A tabela de proporção: suco em cima, água embaixo. Só a primeira coluna (1 e 3) aparece; as outras três são caixas vazias, a próxima com a borda âmbar.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na próxima coluna vazia, até a quarta.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem uma a uma: 2 e 6, 3 e 9, 4 e 12.',
      },
      descoberta: 'Cada jarra maior é a jarra pequena repetida: 2 e 6, 3 e 9, 4 e 12.',
      esboco: 'A tabela é a jarra repetida. O aluno vê crescer a linha de baixo três vezes mais rápido que a de cima.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em toda coluna, o que fica igual entre a água e o suco?',
      fala: 'Em toda coluna, o que fica igual entre a água e o suco?',
      visual: tabela({ linhas: SUCO([1, 2, 3, 4], [3, 6, 9, 12]) }, 'A tabela completa: 1, 2, 3, 4 em cima; 3, 6, 9, 12 embaixo.'),
      opcoes: [
        {
          texto: 'A água é sempre o triplo do suco', certa: true,
          explica: 'Isso. $3 \\div 1$, $6 \\div 2$, $9 \\div 3$, $12 \\div 4$: sempre 3. A divisão não muda.',
          fala: 'A água é sempre o triplo do suco.',
          mostra: tabela({ linhas: SUCO([1, 2, 3, 4], [3, 6, 9, 12]), fator: '× 3' }, 'A seta âmbar à direita, de cima para baixo, com "× 3": vale para todas as colunas.'),
        },
        {
          texto: 'A água é sempre 2 a mais', erro: 'pensa-aditivamente',
          explica: 'Só na primeira: $3 - 1 = 2$. Depois, $6 - 2 = 4$, $9 - 3 = 6$. A diferença cresce; a divisão fica 3.',
          mostra: tabela({ linhas: SUCO([1, 2, 3, 4], [3, 6, 9, 12]), fator: '× 3' }, 'A seta "× 3" à direita: a conta que vale em todas as colunas é a de vezes.'),
        },
      ],
      esboco: 'O momento-chave da aula. A diferença (2, 4, 6, 8) muda; o quociente (3) não. Comparar por divisão é o que a receita guarda.',
    },
    {
      tipo: 'anote',
      titulo: 'Razão',
      definicao: '**Razão** compara duas quantidades por divisão. 1 copo de suco para 3 de água: a razão é **1 para 3**, escrita $1 : 3$ ou $\\frac{1}{3}$.',
      exemplo: { tex: '\\text{suco} : \\text{água} = 1 : 3 = 2 : 6', fala: 'suco para água: um para três, o mesmo que dois para seis' },
      alerta: 'A ordem importa: suco para água é $1 : 3$; água para suco é $3 : 1$. E somar o mesmo nos dois muda a razão.',
      esboco: 'Na página: a barra da jarra (1 âmbar, 3 apagados), a tabela 1-3 / 2-6 com a seta × 3, e o alerta da ordem.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O bolo leva **2 xícaras de açúcar para 3 de farinha**. A razão de **farinha para açúcar** é…',
      fala: 'O bolo leva duas xícaras de açúcar para três de farinha. A razão de farinha para açúcar é…',
      visual: tabela({ linhas: [{ rotulo: 'açúcar (xícaras)', valores: [2] }, { rotulo: 'farinha (xícaras)', valores: [3] }] }, 'Uma tabela de uma coluna: 2 xícaras de açúcar em cima, 3 de farinha embaixo.'),
      opcoes: [
        {
          texto: '3 : 2', certa: true,
          explica: 'Isso. A pergunta começa pela farinha: 3 de farinha para 2 de açúcar.',
          fala: 'Três para dois.',
        },
        {
          texto: '2 : 3', erro: 'razao-invertida',
          explica: 'Essa é a de açúcar para farinha. O que vem primeiro na pergunta vem primeiro na razão.',
          fala: 'Dois para três.',
        },
        {
          texto: '3 : 5',
          explica: '5 é o total de xícaras. A pergunta compara farinha com açúcar, não com o total: 3 : 2.',
          fala: 'Três para cinco.',
        },
      ],
      esboco: 'A ordem da razão. O 3 : 5 é uma isca de parte-todo, explicada sem nome de erro.',
    },
    {
      tipo: 'passo',
      problema: 'Na obra, a massa leva **2 latas de cimento para 6 de areia**. Quantas latas de areia para cada lata de cimento?',
      fala: 'Na obra, a massa leva duas latas de cimento para seis de areia. Quantas latas de areia para cada lata de cimento?',
      visual: tabela({ linhas: [{ rotulo: 'cimento (latas)', valores: [2, 1] }, { rotulo: 'areia (latas)', valores: [6, '?'] }] }, 'A tabela: 2 e 6 na primeira coluna; 1 e "?" na segunda.'),
      passos: [
        {
          pergunta: 'Comparar por razão é comparar por…',
          opcoes: [
            { texto: 'divisão: $6 \\div 2$', fala: 'divisão: seis dividido por dois', certa: true, explica: 'Isso. Quantas vezes o 2 cabe no 6.', mostra: tabela({ linhas: [{ rotulo: 'cimento (latas)', valores: [2, 1] }, { rotulo: 'areia (latas)', valores: [6, '?'] }], fator: '× 3' }, 'À direita, a seta "× 3": o 2 cabe 3 vezes no 6, a areia é o triplo do cimento.') },
            { texto: 'subtração: $6 - 2$', fala: 'subtração: seis menos dois', erro: 'pensa-aditivamente', explica: 'A diferença diz quanto falta, não quantas vezes. A razão compara por divisão.' },
          ],
          linha: { tex: '6 \\div 2 = 3', fala: 'seis dividido por dois dá três' },
        },
        {
          pergunta: 'Então, para cada lata de cimento, vão…',
          opcoes: [
            { texto: '3 latas de areia', certa: true, explica: 'Isso. 2 : 6 é o mesmo que 1 : 3: a areia é o triplo do cimento.', mostra: tabela({ linhas: [{ rotulo: 'cimento (latas)', valores: [2, 1] }, { rotulo: 'areia (latas)', valores: [6, 3] }], setas: [{ de: 0, para: 1, rotulo: '÷ 2' }, { de: 0, para: 1, rotulo: '÷ 2', embaixo: true }], fator: '× 3', destaque: [1] }, 'O "?" vira 3, com "÷ 2" em cima e embaixo e o "× 3" à direita.') },
            { texto: '4 latas de areia', erro: 'pensa-aditivamente', explica: '4 é a diferença $6 - 2$. Com 1 lata de cimento e 4 de areia, a massa fica fraca.' },
          ],
          linha: { tex: '2 : 6 = 1 : 3', fala: 'dois para seis é o mesmo que um para três' },
        },
      ],
      esboco: 'Dividir os dois pelo mesmo número dá a razão "por um". A tabela mostra 2 → 1 em cima, e o aluno descobre o 3 embaixo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: na festa há **20 salgados e 5 doces**. Quantos salgados para cada doce?',
      fala: 'No papel: na festa há vinte salgados e cinco doces. Quantos salgados para cada doce?',
      resposta: 4,
      resolucao: [
        { tex: '20 \\div 5 = 4', fala: 'vinte dividido por cinco dá quatro' },
        { tex: '\\text{salgados} : \\text{doces} = 20 : 5 = 4 : 1', fala: 'salgados para doces: vinte para cinco, o mesmo que quatro para um' },
      ],
      esboco: 'Uma razão "por um" fora da cozinha de líquidos. Quem fizer 20 − 5 = 15 confere e vê a diferença.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['razao-n1', 'razao-n2', 'razao-n3'],
      esboco: 'Nível 1: quantos de um para cada um do outro, com a barra da jarra. Nível 2: escolher a razão na ordem pedida. Nível 3: a razão "por um" sozinho, às vezes com vírgula (2 para 5 é 1 para 2,5).',
    },
    {
      tipo: 'fecho',
      texto: 'Com 2 copos de suco, a jarra leva **6 de água**: a razão $1 : 3$ continua. Na próxima aula, a razão vira a escala do mapa.',
      fala: 'Com dois copos de suco, a jarra leva seis de água: a razão um para três continua. Na próxima aula, a razão vira a escala do mapa.',
      visual: barra({ barras: [JARRA, DOBRADA], escala: 2 }, 'A jarra de 4 copos e a dobrada, de 8, com o suco no primeiro copo de cada metade: 1 : 3 e 2 : 6.'),
      esboco: 'Responde ao gancho com a jarra dobrada.',
    },
  ],
}
