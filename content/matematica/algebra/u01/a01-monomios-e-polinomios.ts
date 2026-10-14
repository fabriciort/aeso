import type { Aula, Visual } from '@/lib/formation/schema'

// A primeira aula de Álgebra e Funções. Abre com a sensação de etapa nova:
// a Matemática Básica ficou para trás, agora as letras trabalham. Na mesa,
// os azulejos da Linguagem algébrica misturados: um quadrado grande, três
// barras e quatro quadradinhos. Momento-chave: no Mexa, o aluno junta as
// peças por tipo e cada grupo vira um TERMO (x², 3x, 4); a soma dos termos é
// um polinômio. Depois os nomes: coeficiente (quantas peças, o 1 escondido
// de x²), parte literal (o tipo da peça), grau (o maior expoente, mesmo fora
// do começo) e a ordem do maior grau para o menor, com o sinal indo junto do
// termo. Monômio, binômio e trinômio pelo número de termos.

const az = (pecas: string[], extra: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos: { pecas, ...extra } }, esboco })
const exp = (expressao: string[], esboco: string, extra: Record<string, unknown> = {}): Visual => ({ modelo: 'livre', estado: { expressao, ...extra }, esboco })

/** A mesa: um quadrado grande, três barras e quatro quadradinhos, misturados (x² + 3x + 4). */
const MESA = ['x', '1', 'x²', 'x', '1', '1', 'x', '1']
const MESA_JUNTA = (esboco: string, rotulo?: string) => az(MESA, { agrupado: true, mostraExpressao: true, ...(rotulo ? { rotulo } : {}) }, esboco)

const FORA = '4x + 2x³ − 7'
const ARRUMAR = '5 + 3x² − x'

export const aula: Aula = {
  id: 'AF.U1.A1',
  titulo: 'Monômios e polinômios',
  objetivo: 'Reconhecer os termos de um polinômio, dizer o coeficiente, a parte literal e o grau de cada um, chamar de monômio, binômio ou trinômio e escrever o polinômio do maior grau para o menor, com o sinal junto de cada termo.',
  modelo: 'livre',
  esboco: 'Abre a etapa nova: "você terminou a Matemática Básica; agora as letras vão trabalhar". Na mesa, os azulejos misturados. Momento-chave: o aluno junta as peças iguais e vê três grupos, x², 3x e 4: cada grupo é um termo, e a soma é um polinômio. A aposta do coeficiente de x² (1, escondido; o 2 é o expoente). O anote dá monômio, coeficiente, parte literal e polinômio. O grau entra com uma aposta (4x + 2x³ − 7: o maior expoente está no meio). O Mexa de ordem arruma do maior grau para o menor, com o −7 levando o seu menos. Os nomes pelo número de termos e um passo a passo para arrumar 5 + 3x² − x.',
  vega: 'Ideia central: um polinômio é uma soma de termos; cada termo (monômio) é um número, o coeficiente, vezes letras, a parte literal. Nos azulejos, cada tipo de peça é uma parte literal e a quantidade é o coeficiente. O grau de um termo é o expoente da letra; o do polinômio, o maior deles. Um número sozinho tem grau 0. Escreve-se do maior grau para o menor, e o sinal vai junto do termo (o −7 continua −7 no fim). Erros esperados: dizer que o coeficiente de x² é 2 (é o expoente) ou 0 (o 1 escondido); achar o grau pelo primeiro termo ou pelo maior número; mudar um termo de lugar sem o sinal dele. Guie com "Quantas peças desse tipo?", "Qual é o maior expoente, esteja onde estiver?", "O menos é a cor da peça: ela muda de lugar com a cor". Somar e subtrair polinômios é da próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você terminou a Matemática Básica. Agora as letras vão trabalhar. Comece pela mesa: como escrever estas peças numa conta só?',
      fala: 'Você terminou a Matemática Básica. Agora as letras vão trabalhar. Comece pela mesa: como escrever estas peças numa conta só?',
      visual: az(MESA, {}, 'Os azulejos da Linguagem algébrica, misturados: barra, quadradinho, quadrado grande, barra, dois quadradinhos, barra, quadradinho.'),
      esboco: 'O começo de uma etapa: o tom é de quem sobe um degrau, com as peças conhecidas na mão. A pergunta fica no ar.',
    },
    {
      tipo: 'mexa',
      texto: 'O quadrado grande vale $x^2$, a barra vale $x$ e o quadradinho vale 1. Junte as peças iguais.',
      fala: 'O quadrado grande vale x ao quadrado, a barra vale x e o quadradinho vale um. Junte as peças iguais.',
      visual: az(MESA, { agrupar: true, mostraExpressao: true }, 'As peças misturadas, com borda tracejada. Cada toque junta um tipo: o quadrado grande (x²), as três barras (3x), os quatro quadradinhos (4). No fim, x² + 3x + 4 embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa peça para juntar as do mesmo tipo.',
        sucesso: { agrupado: true },
        mostre: 'Cada tipo vai para o seu grupo: x², 3x e 4. Embaixo aparece x² + 3x + 4.',
      },
      descoberta: 'As peças viram três grupos, um de cada tipo: x², 3x e 4. A mesa inteira é x² + 3x + 4.',
      esboco: 'O momento-chave: cada grupo que se forma é um termo. O aluno faz a separação com as mãos.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada grupo é um **termo**: $x^2$, $3x$ e $4$. Uma soma de termos é um **polinômio**.',
      fala: 'Cada grupo é um termo: x ao quadrado, três x e quatro. Uma soma de termos é um polinômio.',
      visual: MESA_JUNTA('Os três grupos lado a lado, com x² + 3x + 4 embaixo.'),
      esboco: 'O nome chega depois do gesto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em $3x$, o 3 conta as barras: é o **coeficiente**. E em $x^2$, qual é o coeficiente?',
      fala: 'Em três x, o três conta as barras: é o coeficiente. E em x ao quadrado, qual é o coeficiente?',
      visual: MESA_JUNTA('Os três grupos, com x² + 3x + 4 embaixo. O quadrado grande está sozinho no grupo dele.'),
      opcoes: [
        {
          texto: '1', certa: true,
          explica: 'Isso. Há um quadrado grande só. O 1 fica escondido, como no $x$ sozinho: ${x^2 = 1x^2}$.',
          fala: 'Isso. Há um quadrado grande só. O um fica escondido, como no x sozinho: x ao quadrado é um x ao quadrado.',
          mostra: MESA_JUNTA('Os três grupos; embaixo, x² = 1x².', 'x² = 1x²'),
        },
        {
          texto: '2', erro: 'coeficiente-e-o-expoente',
          explica: 'O 2 de cima é o **expoente**: diz que a peça é ${x \\cdot x}$, o quadrado. Quadrados, há um só.',
          fala: 'O dois de cima é o expoente: diz que a peça é x vezes x, o quadrado. Quadrados, há um só.',
          mostra: MESA_JUNTA('Os três grupos; embaixo, x² = 1x².', 'x² = 1x²'),
        },
        {
          texto: '0', erro: 'letra-sozinha-sem-o-um',
          explica: 'Zero seria nenhum quadrado grande. Há um na mesa: o coeficiente é 1, escondido.',
          fala: 'Zero seria nenhum quadrado grande. Há um na mesa: o coeficiente é um, escondido.',
          mostra: MESA_JUNTA('Os três grupos; embaixo, x² = 1x².', 'x² = 1x²'),
        },
      ],
      esboco: 'O coeficiente é a contagem do grupo. O 2 do expoente é a armadilha: ele diz o tipo da peça, não quantas.',
    },
    {
      tipo: 'anote',
      titulo: 'Monômio e polinômio',
      definicao: 'Um **monômio** é um termo só: um número, o **coeficiente**, vezes letras, a **parte literal**. Um **polinômio** é uma soma de monômios.',
      exemplo: { tex: 'x^2 + 3x + 4', fala: 'x ao quadrado mais três x mais quatro: um polinômio com três termos' },
      alerta: 'Em $x^2$, o coeficiente é 1, escondido. O 2 de cima é o expoente, não o coeficiente.',
      esboco: 'Na página: os três grupos de azulejos, cada um com o seu termo embaixo. Setas: "coeficiente" no 3 de 3x, "parte literal" no x.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O **grau** de um polinômio é o maior expoente da letra. Qual é o grau de ${4x + 2x^3 - 7}$?',
      fala: 'O grau de um polinômio é o maior expoente da letra. Qual é o grau de quatro x mais dois x ao cubo menos sete?',
      visual: exp([FORA], 'O polinômio grande no centro, fora de ordem: 4x + 2x³ − 7.'),
      opcoes: [
        {
          texto: '3', certa: true,
          explica: 'Isso. O maior expoente está no $2x^3$, mesmo fora do começo. O $4x$ tem grau 1, e o 7, grau 0.',
          fala: 'Isso. O maior expoente está no dois x ao cubo, mesmo fora do começo. O quatro x tem grau um, e o sete, grau zero.',
          mostra: exp([FORA], 'O mesmo polinômio, com uma moldura âmbar no 2x³.', { destaque: '2x³' }),
        },
        {
          texto: '1', erro: 'grau-pelo-primeiro-termo',
          explica: 'O $4x$ vem primeiro, mas tem expoente 1. O maior expoente é o 3, do $2x^3$.',
          fala: 'O quatro x vem primeiro, mas tem expoente um. O maior expoente é o três, do dois x ao cubo.',
          mostra: exp([FORA], 'O mesmo polinômio, com uma moldura âmbar no 2x³.', { destaque: '2x³' }),
        },
        {
          texto: '7', erro: 'grau-pelo-coeficiente',
          explica: 'O 7 é um número sem letra: grau 0. O grau olha os expoentes, e o maior é 3.',
          fala: 'O sete é um número sem letra: grau zero. O grau olha os expoentes, e o maior é três.',
          mostra: exp([FORA], 'O mesmo polinômio, com uma moldura âmbar no 2x³.', { destaque: '2x³' }),
        },
      ],
      esboco: 'O maior expoente está no meio de propósito: quem olha só o primeiro termo diz 1; quem olha o maior número diz 7.',
    },
    {
      tipo: 'mexa',
      texto: 'Um polinômio se escreve do maior grau para o menor. Cada termo leva o seu sinal junto.',
      fala: 'Um polinômio se escreve do maior grau para o menor. Cada termo leva o seu sinal junto.',
      visual: exp([FORA], 'Em cima, 4x + 2x³ − 7. Embaixo, as fichas 4x, 2x³ e −7 e três lugares: 1º, 2º e 3º.', { fichas: ['4x', '2x³', '−7'], lugares: ['1º', '2º', '3º'] }),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos termos do maior grau para o menor.',
        sucesso: { ordem: ['2x³', '4x', '−7'] },
        mostre: 'O 2x³ vai para o 1º lugar, o 4x para o 2º e o −7 para o 3º: 2x³ + 4x − 7.',
      },
      descoberta: 'Em ordem: 2x³ + 4x − 7. O −7 vai para o fim com o seu menos.',
      esboco: 'A ficha −7 já traz o menos: o aluno vê que o sinal é parte do termo.',
    },
    {
      tipo: 'ideia',
      texto: 'Um termo: **monômio**. Dois: **binômio**. Três: **trinômio**. ${2x^3 + 4x - 7}$ é um trinômio de grau 3.',
      fala: 'Um termo: monômio. Dois: binômio. Três: trinômio. Dois x ao cubo mais quatro x menos sete é um trinômio de grau três.',
      visual: exp(['2x³ + 4x − 7'], 'O polinômio arrumado, grande: 2x³ + 4x − 7.'),
      esboco: 'Os nomes pelo número de termos, com o polinômio que o aluno acabou de arrumar.',
    },
    {
      tipo: 'passo',
      problema: 'Arrume ${5 + 3x^2 - x}$ do maior grau para o menor.',
      fala: 'Arrume cinco mais três x ao quadrado menos x, do maior grau para o menor.',
      visual: exp([ARRUMAR], 'O polinômio fora de ordem: 5 + 3x² − x.'),
      passos: [
        {
          pergunta: 'Qual termo vem primeiro?',
          opcoes: [
            {
              texto: '$3x^2$', certa: true,
              explica: 'Isso. Expoente 2, o maior.',
              fala: 'Isso. Expoente dois, o maior.',
              mostra: exp([ARRUMAR, '3x²'], 'Embaixo do polinômio, começa a linha arrumada: 3x².'),
            },
            {
              texto: '$5$', erro: 'grau-pelo-coeficiente',
              explica: 'O 5 é o maior número, mas não tem letra: grau 0. Ele vai para o fim.',
              fala: 'O cinco é o maior número, mas não tem letra: grau zero. Ele vai para o fim.',
            },
          ],
          linha: { tex: '3x^2', fala: 'três x ao quadrado' },
        },
        {
          pergunta: 'Agora o termo com $x$. Como ele entra?',
          fala: 'Agora o termo com x. Como ele entra?',
          opcoes: [
            {
              texto: '${-x}$, com o menos', certa: true,
              explica: 'Isso. O menos é do $x$: vai junto com ele.',
              fala: 'Isso. O menos é do x: vai junto com ele.',
              mostra: exp([ARRUMAR, '3x² − x'], 'A linha arrumada cresce: 3x² − x.'),
            },
            {
              texto: '${+x}$', erro: 'termo-perde-o-sinal',
              explica: 'O menos é parte do termo. Com ${x = 1}$, ${5 + 3 - 1 = 7}$, mas ${3 + 1 + 5 = 9}$.',
              fala: 'O menos é parte do termo. Com x igual a um, cinco mais três menos um é sete, mas três mais um mais cinco é nove.',
            },
          ],
          linha: { tex: '3x^2 - x', fala: 'três x ao quadrado menos x' },
        },
        {
          pergunta: 'Falta o 5. Como fica tudo?',
          fala: 'Falta o cinco. Como fica tudo?',
          opcoes: [
            {
              texto: '${3x^2 - x + 5}$', certa: true,
              explica: 'Isso. O 5 não tinha menos: entra com mais. É um trinômio de grau 2.',
              fala: 'Isso. O cinco não tinha menos: entra com mais. É um trinômio de grau dois.',
              mostra: exp([ARRUMAR, '3x² − x + 5'], 'A linha arrumada completa e maior: 3x² − x + 5.'),
            },
            {
              texto: '${3x^2 - x - 5}$', erro: 'termo-perde-o-sinal',
              explica: 'O 5 era positivo e continua positivo. O menos é só do $x$.',
              fala: 'O cinco era positivo e continua positivo. O menos é só do x.',
            },
          ],
          linha: { tex: '3x^2 - x + 5', fala: 'três x ao quadrado menos x mais cinco' },
        },
      ],
      esboco: 'O caderno escreve o polinômio arrumado, termo a termo. A cada passo, a linha de baixo do palco cresce.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: arrume ${7 - 2x + x^3 + 4x^2}$ do maior grau para o menor. Qual é o coeficiente de $x$?',
      fala: 'No papel: arrume sete menos dois x mais x ao cubo mais quatro x ao quadrado, do maior grau para o menor. Qual é o coeficiente de x?',
      resposta: -2,
      sinal: true,
      resolucao: [
        { tex: 'x^3 + 4x^2 - 2x + 7', fala: 'x ao cubo mais quatro x ao quadrado menos dois x mais sete' },
        { tex: '-2x \\text{ tem coeficiente } -2', fala: 'menos dois x tem coeficiente menos dois: o menos vai junto' },
      ],
      esboco: 'Quem digitar 2 deixou o menos para trás. Grau 3, quatro termos.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['polinomios-termos-n1', 'polinomios-termos-n2', 'polinomios-termos-n3'],
      esboco: 'Nível 1: o polinômio das peças, o coeficiente de um grupo e o 1 escondido de x², com os azulejos. Nível 2: o grau fora de ordem, o coeficiente com sinal e o nome pelo número de termos. Nível 3: arrumar do maior grau para o menor, o coeficiente depois de juntar os semelhantes e o grau de um custo.',
    },
    {
      tipo: 'fecho',
      texto: 'As peças da mesa são ${x^2 + 3x + 4}$: um trinômio de grau 2. Na próxima aula: somar e subtrair polinômios.',
      fala: 'As peças da mesa são x ao quadrado mais três x mais quatro: um trinômio de grau dois. Na próxima aula: somar e subtrair polinômios.',
      visual: MESA_JUNTA('A mesa arrumada: x², 3x e 4, com x² + 3x + 4 embaixo.'),
      esboco: 'Responde ao gancho e anuncia a próxima aula.',
    },
  ],
}
