import type { Aula, Visual } from '@/lib/formation/schema'

// Contagem. As roupas de Lia: 3 camisas e 2 calças. O momento-chave é o Mexa
// "ramificar": cada toque faz a árvore crescer uma etapa, e o aluno vê cada
// camisa abrir 2 calças, 3 → 3 × 2 = 6. Mais uma etapa (os calçados)
// multiplica de novo: 6 × 2 = 12. Depois o lanche (2 × 3 × 2 = 12), os dois
// dados na grade (6 × 6 = 36, com 2 e 5 diferente de 5 e 2, que prepara a
// próxima aula) e o cadeado de 3 rodinhas (1.000 senhas). O erro a desmontar:
// somar as opções no lugar de multiplicar.

const cont = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'contagem', estado, esboco })

const CAMISAS = [{ nome: 'azul', cor: 'azul' }, { nome: 'preta', cor: 'preto' }, { nome: 'branca', cor: 'branco' }]
const CALCAS = ['jeans', 'social']
const CALCADOS = ['tênis', 'bota']
/** As roupas: 3 camisas e 2 calças. */
const ROUPA = { arvore: [CAMISAS, CALCAS], nomes: ['camisa', 'calça'], unidade: 'roupas' }
/** As roupas com os calçados: 3 × 2 × 2 = 12. */
const COMPLETA = { arvore: [CAMISAS, CALCAS, CALCADOS], nomes: ['camisa', 'calça', 'calçado'], unidade: 'roupas' }
/** O lanche: 2 pães, 3 recheios e 2 sucos. */
const LANCHE = { arvore: [['francês', 'forma'], ['queijo', 'frango', 'ovo'], ['laranja', 'uva']], nomes: ['pão', 'recheio', 'suco'], unidade: 'lanches' }
/** Dois dados de cores diferentes: as linhas são o amarelo, as colunas, o azul. */
const DADOS = { linhas: 6, colunas: 6, nomes: ['dado amarelo', 'dado azul'] }

export const aula: Aula = {
  id: 'B.U19.A4',
  titulo: 'Contagem',
  objetivo: 'Contar as combinações de escolhas em sequência multiplicando as opções de cada etapa (o princípio multiplicativo), com a árvore de possibilidades e a grade de dois dados, e usar a conta em senhas e códigos.',
  modelo: 'contagem',
  esboco: 'O palco é a árvore de possibilidades. Lia tem 3 camisas e 2 calças: o aluno aposta quantas roupas dá e, no momento-chave, toca a árvore, que cresce uma etapa por vez (3 → 3 × 2 = 6). Um caminho aceso mostra que cada ponta é uma roupa. Os calçados fazem a árvore crescer mais uma etapa: 6 × 2 = 12. O anote dá o princípio multiplicativo. No passo a passo, o lanche (2 × 3 × 2 = 12). Depois a grade de dois dados, um amarelo e um azul: 36 casas, e 2 com 5 é outra casa que 5 com 2. Fecha com o cadeado de 3 rodinhas no caderno.',
  vega: 'Ideia central: escolhas em sequência se multiplicam. Se a primeira etapa tem 3 opções e cada uma abre 2, são 3 × 2 = 6 combinações; cada etapa nova multiplica de novo. A árvore mostra isso: cada ponta é uma combinação. Com dois dados, a grade 6 × 6 tem 36 resultados, e amarelo 2 com azul 5 é diferente de amarelo 5 com azul 2. Um cadeado de 3 rodinhas de 0 a 9 tem 10 × 10 × 10 = 1.000 senhas. Erros esperados: somar as opções (3 + 2 = 5), contar só uma etapa, juntar 2 e 5 com 5 e 2, contar zeros errado em 10 × 10 × 10. Guie com "Cada camisa vai com quantas calças?", "Cada ponta da árvore é o quê?", "E a próxima etapa, multiplica por quanto?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Lia tem **3 camisas** e **2 calças**. De quantos jeitos diferentes ela pode se vestir?',
      visual: cont({ ...ROUPA, mostradas: 0 }, 'Só a raiz da árvore, à esquerda. Em cima, os nomes das etapas, apagados: camisa, calça.'),
      esboco: 'A pergunta parece de somar. A aula mostra que é de multiplicar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Aposte antes de contar: quantas roupas diferentes ela pode montar?',
      visual: cont({ ...ROUPA, mostradas: 0 }, 'A raiz da árvore, parada.'),
      opcoes: [
        {
          texto: '6', certa: true,
          explica: 'Boa aposta. Cada camisa pode ir com as 2 calças. Confira na árvore.',
        },
        {
          texto: '5', erro: 'soma-no-lugar-de-multiplicar',
          explica: '3 + 2 = 5 conta as peças, não as roupas. Cada camisa pode ir com as 2 calças.',
        },
        {
          texto: '3', erro: 'esquece-uma-etapa',
          explica: '3 são só as camisas. Cada uma ainda pode ir com 2 calças diferentes.',
        },
      ],
      esboco: 'A aposta guarda a pergunta para o Mexa. A soma é o erro mais comum.',
    },
    {
      tipo: 'mexa',
      texto: 'Monte a árvore: primeiro a camisa, depois a calça.',
      visual: cont({ ...ROUPA, mostradas: 0 }, 'A raiz espera o toque. A cada toque, uma etapa cresce: 3 ramos coloridos, depois 2 ramos saindo de cada um. Embaixo, a conta cresce junto: 3, depois 3 × 2 = 6 roupas.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na árvore para abrir cada escolha.',
        sucesso: { etapas: 2 },
        mostre: 'Cada camisa abre dois ramos, um para cada calça.',
      },
      descoberta: '3 camisas, cada uma com 2 calças: 3 × 2 = 6 roupas.',
      esboco: 'O momento-chave: o aluno vê a segunda etapa sair de cada ramo da primeira. São 3 grupos de 2.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada ponta da árvore é uma roupa. A acesa: camisa **preta** com calça **social**.',
      visual: cont({ ...ROUPA, caminho: [1, 1], combinacoes: true }, 'A árvore inteira, com a roupa escrita na ponta de cada ramo. O caminho da camisa preta com a calça social acende em âmbar.'),
      esboco: 'As 6 pontas são as 6 roupas, uma a uma.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Lia tem também **2 calçados**: tênis e bota. Quantas roupas completas agora?',
      visual: cont({ ...COMPLETA, mostradas: 2 }, 'A árvore ganha uma terceira coluna, ainda apagada: calçado. As 6 pontas esperam.'),
      opcoes: [
        {
          texto: '12', certa: true,
          explica: 'Isso. Cada uma das 6 roupas vai com 2 calçados: 6 × 2 = 12.',
          mostra: cont(COMPLETA, 'A terceira etapa cresce: cada ponta abre 2 ramos. Embaixo, 3 × 2 × 2 = 12 roupas.'),
        },
        {
          texto: '8', erro: 'soma-no-lugar-de-multiplicar',
          explica: '6 + 2 põe os calçados uma vez só. Mas cada roupa pode ir com os 2: 6 × 2 = 12.',
          mostra: cont(COMPLETA, 'A terceira etapa cresce: 3 × 2 × 2 = 12 roupas.'),
        },
        {
          texto: '7', erro: 'soma-no-lugar-de-multiplicar',
          explica: '3 + 2 + 2 = 7 conta as peças. As escolhas se multiplicam: 3 × 2 × 2 = 12.',
          mostra: cont(COMPLETA, 'A terceira etapa cresce: 3 × 2 × 2 = 12 roupas.'),
        },
      ],
      esboco: 'Mais uma etapa, mais uma multiplicação. A árvore dobra de pontas.',
    },
    {
      tipo: 'anote',
      titulo: 'Contagem: o princípio multiplicativo',
      definicao: 'Escolhas em sequência se **multiplicam**: o total é o produto das opções de cada etapa.',
      exemplo: { tex: '3 \\times 2 \\times 2 = 12', fala: 'três vezes dois vezes dois, doze' },
      alerta: 'Não some as opções: 3 + 2 + 2 conta as peças, não as combinações.',
      esboco: 'Na página: a árvore das roupas de Lia, com 3, depois 6, depois 12 pontas.',
    },
    {
      tipo: 'passo',
      problema: 'Uma lanchonete tem **2 pães**, **3 recheios** e **2 sucos**. Quantos lanches diferentes, com um de cada?',
      fala: 'Uma lanchonete tem dois pães, três recheios e dois sucos. Quantos lanches diferentes, com um de cada?',
      visual: cont({ ...LANCHE, mostradas: 1 }, 'A árvore do lanche com a primeira etapa aberta: os 2 pães. Embaixo, 2 lanches.'),
      passos: [
        {
          pergunta: 'Quantos sanduíches, juntando pão e recheio?',
          opcoes: [
            {
              texto: '$2 \\times 3 = 6$', certa: true,
              explica: 'Isso. Cada pão abre 3 recheios.',
              mostra: cont({ ...LANCHE, mostradas: 2 }, 'Cada pão abre 3 ramos. Embaixo, 2 × 3 = 6.'),
            },
            {
              texto: '$2 + 3 = 5$', erro: 'soma-no-lugar-de-multiplicar',
              explica: 'Somar conta as peças. Cada pão vai com os 3 recheios: 2 grupos de 3.',
            },
          ],
          linha: { tex: '2 \\times 3 = 6', fala: 'dois vezes três, seis' },
        },
        {
          pergunta: 'E com o suco?',
          opcoes: [
            {
              texto: '$6 \\times 2 = 12$', certa: true,
              explica: 'Isso. Cada um dos 6 sanduíches vai com 2 sucos.',
              mostra: cont(LANCHE, 'A terceira etapa cresce: 12 pontas. Embaixo, 2 × 3 × 2 = 12 lanches.'),
            },
            {
              texto: '$6 + 2 = 8$', erro: 'soma-no-lugar-de-multiplicar',
              explica: 'Cada um dos 6 sanduíches pode ir com os 2 sucos: 6 grupos de 2.',
            },
            {
              texto: '$6$, o suco não muda', erro: 'esquece-uma-etapa',
              explica: 'O suco é mais uma escolha: cada sanduíche abre 2 ramos, um de laranja e um de uva.',
            },
          ],
          linha: { tex: '6 \\times 2 = 12', fala: 'seis vezes dois, doze' },
        },
      ],
      esboco: 'A árvore cresce com cada passo certo. Na terceira etapa, as 12 pontas mostram o tamanho da conta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora dois dados, um amarelo e um azul. Quantos resultados diferentes podem sair?',
      visual: cont({ grade: { ...DADOS, conteudo: 'vazio' }, conta: false }, 'Uma grade de 6 linhas e 6 colunas, vazia: as faces do dado amarelo à esquerda, as do azul em cima.'),
      opcoes: [
        {
          texto: '36', certa: true,
          explica: 'Isso. Cada face do amarelo vai com as 6 do azul: 6 × 6 = 36.',
          mostra: cont({ grade: DADOS }, 'As casas se escrevem, linha por linha: "1, 1", "1, 2"… Embaixo, 6 × 6 = 36.'),
        },
        {
          texto: '12', erro: 'soma-no-lugar-de-multiplicar',
          explica: '6 + 6 = 12 conta as faces. Cada face do amarelo vai com as 6 do azul: 6 × 6 = 36.',
          mostra: cont({ grade: DADOS }, 'As 36 casas se escrevem. Embaixo, 6 × 6 = 36.'),
        },
        {
          texto: '6', erro: 'esquece-uma-etapa',
          explica: '6 são as faces de um dado só. Cada uma ainda vai com as 6 faces do outro: 36.',
          mostra: cont({ grade: DADOS }, 'As 36 casas se escrevem. Embaixo, 6 × 6 = 36.'),
        },
      ],
      esboco: 'A grade é a árvore de duas etapas arrumada em linhas e colunas: cada casa é uma ponta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Amarelo **2** e azul **5** é o mesmo resultado que amarelo **5** e azul **2**?',
      fala: 'Amarelo dois e azul cinco é o mesmo resultado que amarelo cinco e azul dois?',
      visual: cont({ grade: DADOS, favoraveis: [[1, 4], [4, 1]] }, 'A grade dos 36 pares, com as casas "2, 5" e "5, 2" acesas em âmbar.'),
      opcoes: [
        {
          texto: 'Não: são duas casas diferentes', certa: true,
          explica: 'Isso. Cada dado tem a sua cor. 2 no amarelo e 5 no azul é uma casa; 5 e 2, outra.',
        },
        {
          texto: 'Sim: são os mesmos números', erro: 'ignora-a-ordem-dos-dados',
          explica: 'Os dados são diferentes: o amarelo pode dar 2 ou 5. Por isso são duas casas da grade.',
        },
      ],
      esboco: 'Prepara a próxima aula: a soma 7 vai acender 6 casas, não 3.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um cadeado tem **3 rodinhas**, cada uma de 0 a 9. Quantas senhas diferentes ele tem?',
      fala: 'No papel: um cadeado tem três rodinhas, cada uma de zero a nove. Quantas senhas diferentes ele tem?',
      resposta: 1000,
      resolucao: [
        { tex: '\\text{cada rodinha: 10 opções}', fala: 'cada rodinha tem dez opções' },
        { tex: '10 \\times 10 \\times 10 = 1{.}000', fala: 'dez vezes dez vezes dez, mil' },
      ],
      esboco: 'Uma árvore grande demais para desenhar: a conta faz o trabalho.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['contagem-n1', 'contagem-n2', 'contagem-n3'],
      esboco: 'Nível 1: duas etapas, com a árvore na tela para contar as pontas. Nível 2: três etapas, ou o dado com a moeda. Nível 3: senhas e códigos com letras e algarismos.',
    },
    {
      tipo: 'fecho',
      texto: 'Lia tem **6** roupas; com os calçados, **12**. Na próxima aula: a chance de cada resultado.',
      fala: 'Lia tem seis roupas; com os calçados, doze. Na próxima aula: a chance de cada resultado.',
      visual: cont({ ...COMPLETA, caminho: [2, 0, 1], combinacoes: true }, 'A árvore das 12 roupas, com cada combinação escrita na ponta. Acesa: branca, jeans, bota.'),
      esboco: 'Responde ao gancho e aponta para a probabilidade.',
    },
  ],
}
