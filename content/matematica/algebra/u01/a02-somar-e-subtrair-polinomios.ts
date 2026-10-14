import type { Aula, Visual } from '@/lib/formation/schema'

// Somar e subtrair polinômios com os azulejos, sempre os mesmos dois montes:
// 2x² + x + 3 e x² − 2x + 1. Somar é juntar os montes e agrupar (as barras
// vermelhas cancelam barras amarelas): 3x² − x + 4. Subtrair: o menos fica
// na frente do parêntese inteiro. Momento-chave: no Mexa virar, um toque no
// monte vira TODAS as peças dele (x² → −x², −2x → 2x, 1 → −1), não só a
// primeira. A conferência com x = 2 desmonta quem vira só a primeira. Depois
// as peças viradas se juntam com o primeiro monte: x² + 3x + 2. O passo a
// passo, já sem peças, faz (3x² + 2x − 1) − (x² + 4x − 3).

const az = (pecas: string[], extra: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos: { pecas, ...extra } }, esboco })
const exp = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** 2x² + x + 3. */
const P = ['x²', 'x²', 'x', '1', '1', '1']
/** x² − 2x + 1. */
const Q = ['x²', '−x', '−x', '1']
/** O segundo monte virado: −x² + 2x − 1. */
const Q_VIRADO = ['−x²', 'x', 'x', '−1']
const MONTES = [P.length, Q.length]

const DOIS = (extra: Record<string, unknown>, esboco: string) => az([...P, ...Q], { montes: MONTES, ...extra }, esboco)
const VIRADO = (extra: Record<string, unknown>, esboco: string) => DOIS({ virar: 1, virado: true, ...extra }, esboco)
const DIFERENCA = (extra: Record<string, unknown>, esboco: string) => az([...P, ...Q_VIRADO], { montes: MONTES, ...extra }, esboco)

const CONTA = '(3x² + 2x − 1) − (x² + 4x − 3)'

export const aula: Aula = {
  id: 'AF.U1.A2',
  titulo: 'Somar e subtrair polinômios',
  objetivo: 'Somar polinômios juntando os termos semelhantes e subtrair trocando o sinal de todos os termos do polinômio que se tira; conferir o resultado trocando a letra por um número.',
  modelo: 'livre',
  esboco: 'Dois montes de azulejos ficam no palco a aula toda: 2x² + x + 3 e x² − 2x + 1. Primeiro o aluno soma: junta as peças iguais, e as barras vermelhas cancelam barras amarelas (3x² − x + 4). Depois o menos aparece na frente do segundo monte. Momento-chave: no Mexa virar, um toque vira todas as peças do monte de uma vez. A aposta confere com x = 2 que virar só a primeira peça dá errado. As peças viradas se juntam com o primeiro monte: x² + 3x + 2. O anote dá a regra; o passo a passo e o caderno fazem contas sem peças.',
  vega: 'Ideia central: somar polinômios é juntar os termos semelhantes. Subtrair um polinômio é somar o oposto dele: o menos antes do parêntese troca o sinal de TODOS os termos de dentro. −(x² − 2x + 1) = −x² + 2x − 1. Nos azulejos, o menos vira cada peça do monte. Hábito: conferir trocando a letra por um número dos dois lados (com x = 2, a conta e o resultado têm de dar o mesmo). Erros esperados: trocar só o sinal do primeiro termo; tirar o parêntese sem trocar nada; errar o sinal ao juntar (2x − 4x = 2x); juntar termos que não são semelhantes. Guie com "O menos está na frente de quê?", "Vire o monte inteiro", "Confira com x = 1 ou x = 2". Multiplicar é da próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Dois montes: ${2x^2 + x + 3}$ e ${x^2 - 2x + 1}$. Quanto dão juntos? E quanto sobra se você tira o segundo do primeiro?',
      fala: 'Dois montes: dois x ao quadrado mais x mais três, e x ao quadrado menos dois x mais um. Quanto dão juntos? E quanto sobra se você tira o segundo do primeiro?',
      visual: DOIS({}, 'Os dois montes lado a lado, com um vão entre eles: dois quadrados grandes, uma barra e três quadradinhos; um quadrado grande, duas barras vermelhas e um quadradinho.'),
      esboco: 'As duas perguntas da aula. A segunda é a que pega.',
    },
    {
      tipo: 'mexa',
      texto: 'Somar é juntar os dois montes. Uma barra vermelha cancela uma amarela. Junte as peças iguais.',
      fala: 'Somar é juntar os dois montes. Uma barra vermelha cancela uma amarela. Junte as peças iguais.',
      visual: DOIS({ agrupar: true, cancela: true, mostraExpressao: true }, 'Os dois montes, com borda tracejada. Cada toque junta um tipo, dos dois montes de uma vez: 3x², x, 4 e −2x. A barra amarela e uma vermelha ficam riscadas. No fim, 3x² − x + 4 embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa peça para juntar as do mesmo tipo.',
        sucesso: { agrupado: true },
        mostre: 'As peças dos dois montes se juntam por tipo. Uma barra amarela cancela uma vermelha. Embaixo: 3x² − x + 4.',
      },
      descoberta: 'A soma junta os semelhantes dos dois polinômios: 2x² + x² = 3x², x − 2x = −x e 3 + 1 = 4. Fica 3x² − x + 4.',
      esboco: 'A soma é o que o aluno já sabe da Linguagem algébrica, agora com dois polinômios inteiros.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora tire: ${(2x^2 + x + 3) - (x^2 - 2x + 1)}$. O menos fica na frente do parêntese inteiro.',
      fala: 'Agora tire: dois x ao quadrado mais x mais três, menos, o parêntese x ao quadrado menos dois x mais um. O menos fica na frente do parêntese inteiro.',
      visual: DOIS({ virar: 1 }, 'Os dois montes de novo, soltos. O segundo está numa moldura tracejada vermelha, com um − vermelho na frente.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no monte com o menos na frente.',
        sucesso: { virado: true },
        mostre: 'Todas as peças do monte giram e trocam de sinal: −x², duas barras amarelas e −1. O − vira +.',
      },
      descoberta: 'O menos vira todas as peças do monte de uma vez: −(x² − 2x + 1) = −x² + 2x − 1. As barras vermelhas viram amarelas.',
      esboco: 'O momento-chave. As quatro peças giram juntas: o quadrado grande fica vermelho, as barras vermelhas ficam amarelas, o quadradinho fica vermelho.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Confira com ${x = 2}$: ${x^2 - 2x + 1}$ vale 1, então ${-(x^2 - 2x + 1)}$ vale −1. Qual escrita também vale −1?',
      fala: 'Confira com x igual a dois: x ao quadrado menos dois x mais um vale um, então menos o parêntese vale menos um. Qual escrita também vale menos um?',
      visual: VIRADO({}, 'Os dois montes, o segundo já virado, com um + na frente: −x², duas barras amarelas e −1.'),
      opcoes: [
        {
          texto: '${-x^2 + 2x - 1}$', certa: true,
          explica: 'Isso. ${-4 + 4 - 1 = -1}$. Virar todas as peças dá o valor certo.',
          fala: 'Isso. Menos quatro mais quatro menos um, menos um. Virar todas as peças dá o valor certo.',
          mostra: VIRADO({ rotulo: 'x = 2: −4 + 4 − 1 = −1' }, 'Os montes, o segundo virado. Embaixo: x = 2: −4 + 4 − 1 = −1.'),
        },
        {
          texto: '${-x^2 - 2x + 1}$', erro: 'menos-so-no-primeiro',
          explica: 'Essa vira só a primeira peça: ${-4 - 4 + 1 = -7}$, e não −1. O menos vira o monte todo.',
          fala: 'Essa vira só a primeira peça: menos quatro menos quatro mais um, menos sete, e não menos um. O menos vira o monte todo.',
          mostra: VIRADO({ rotulo: 'x = 2: −4 − 4 + 1 = −7' }, 'Os montes, o segundo virado. Embaixo: x = 2: −4 − 4 + 1 = −7, longe do −1.'),
        },
        {
          texto: '${x^2 - 2x + 1}$', erro: 'ignora-o-menos-do-parentese',
          explica: 'Essa não troca nada: vale ${4 - 4 + 1 = 1}$, e não −1. Tirar o monte troca todos os sinais.',
          fala: 'Essa não troca nada: vale quatro menos quatro mais um, um, e não menos um. Tirar o monte troca todos os sinais.',
          mostra: VIRADO({ rotulo: 'x = 2: 4 − 4 + 1 = 1' }, 'Os montes, o segundo virado. Embaixo: x = 2: 4 − 4 + 1 = 1.'),
        },
      ],
      esboco: 'O hábito da unidade: trocar a letra por um número dos dois lados. O −7 convence quem vira só a primeira peça.',
    },
    {
      tipo: 'mexa',
      texto: 'Com o monte virado, a subtração virou uma soma. Junte as peças iguais.',
      fala: 'Com o monte virado, a subtração virou uma soma. Junte as peças iguais.',
      visual: DIFERENCA({ agrupar: true, cancela: true, mostraExpressao: true }, 'O primeiro monte e as peças viradas do segundo, soltas, com borda tracejada. Cada toque junta um tipo. Um quadrado grande cancela o −x², um quadradinho cancela o −1. No fim, x² + 3x + 2 embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa peça para juntar as do mesmo tipo.',
        sucesso: { agrupado: true },
        mostre: 'As peças se juntam por tipo. Um par de quadrados grandes e um par de quadradinhos se cancelam. Embaixo: x² + 3x + 2.',
      },
      descoberta: '2x² − x² = x², x + 2x = 3x e 3 − 1 = 2. A diferença é x² + 3x + 2.',
      esboco: 'As mesmas peças do gancho, agora com o segundo monte virado: a diferença sai do mesmo gesto da soma.',
    },
    {
      tipo: 'anote',
      titulo: 'Somar e subtrair polinômios',
      definicao: 'Para **somar**, junte os termos semelhantes. Para **subtrair**, troque o sinal de **todos** os termos do segundo e some.',
      exemplo: { tex: '(2x^2 + x + 3) - (x^2 - 2x + 1) = x^2 + 3x + 2', fala: 'dois x ao quadrado mais x mais três, menos x ao quadrado menos dois x mais um, é igual a x ao quadrado mais três x mais dois' },
      alerta: '${-(x^2 - 2x + 1)}$ é ${-x^2 + 2x - 1}$: o menos troca todos os sinais, não só o primeiro.',
      esboco: 'Na página: os dois montes, o segundo com o − e a seta "vira tudo". Embaixo, a conta e a conferência com x = 2.',
    },
    {
      tipo: 'passo',
      problema: 'Calcule ${(3x^2 + 2x - 1) - (x^2 + 4x - 3)}$.',
      fala: 'Calcule três x ao quadrado mais dois x menos um, menos, o parêntese x ao quadrado mais quatro x menos três.',
      visual: exp([CONTA], 'A conta numa linha, sem peças.'),
      passos: [
        {
          pergunta: 'O menos troca o sinal de cada termo do segundo parêntese. Como ele fica?',
          opcoes: [
            {
              texto: '${-x^2 - 4x + 3}$', certa: true,
              explica: 'Isso. $x^2$ vira $-x^2$, $4x$ vira $-4x$ e $-3$ vira $+3$.',
              fala: 'Isso. x ao quadrado vira menos x ao quadrado, quatro x vira menos quatro x e menos três vira mais três.',
              mostra: exp([CONTA, '3x² + 2x − 1 − x² − 4x + 3'], 'A conta e, embaixo, sem parênteses: 3x² + 2x − 1 − x² − 4x + 3.'),
            },
            {
              texto: '${-x^2 + 4x - 3}$', erro: 'menos-so-no-primeiro',
              explica: 'Essa trocou só o primeiro. O menos vale para os três termos do parêntese.',
              fala: 'Essa trocou só o primeiro. O menos vale para os três termos do parêntese.',
            },
          ],
          linha: { tex: '3x^2 + 2x - 1 - x^2 - 4x + 3', fala: 'três x ao quadrado mais dois x menos um menos x ao quadrado menos quatro x mais três' },
        },
        {
          pergunta: 'Junte os termos semelhantes. Como fica?',
          opcoes: [
            {
              texto: '${2x^2 - 2x + 2}$', certa: true,
              explica: 'Isso. ${3x^2 - x^2 = 2x^2}$, ${2x - 4x = -2x}$ e ${-1 + 3 = 2}$.',
              fala: 'Isso. Três x ao quadrado menos x ao quadrado, dois x ao quadrado; dois x menos quatro x, menos dois x; menos um mais três, dois.',
              mostra: exp([CONTA, '3x² + 2x − 1 − x² − 4x + 3', '2x² − 2x + 2'], 'As linhas da conta e, maior, o resultado: 2x² − 2x + 2.'),
            },
            {
              texto: '${2x^2 + 2x + 2}$', erro: 'esquece-sinal-do-resultado',
              explica: '${2x - 4x}$ tira mais do que tem: dá ${-2x}$.',
              fala: 'Dois x menos quatro x tira mais do que tem: dá menos dois x.',
            },
            {
              texto: '${2x^2 - 2x - 4}$', erro: 'termo-perde-o-sinal',
              explica: 'O 3 ficou positivo no passo anterior: ${-1 + 3 = 2}$.',
              fala: 'O três ficou positivo no passo anterior: menos um mais três, dois.',
            },
          ],
          linha: { tex: '= 2x^2 - 2x + 2', fala: 'igual a dois x ao quadrado menos dois x mais dois' },
        },
        {
          pergunta: 'Confira com ${x = 1}$: a conta dá ${4 - 2 = 2}$. E ${2x^2 - 2x + 2}$?',
          fala: 'Confira com x igual a um: a conta dá quatro menos dois, dois. E dois x ao quadrado menos dois x mais dois?',
          opcoes: [
            {
              texto: '2: confere', certa: true,
              explica: 'Isso. ${2 - 2 + 2 = 2}$. Os dois lados dão o mesmo.',
              fala: 'Isso. Dois menos dois mais dois, dois. Os dois lados dão o mesmo.',
              mostra: exp([CONTA, '2x² − 2x + 2', 'x = 1: 4 − 2 = 2 e 2 − 2 + 2 = 2'], 'A conta, o resultado e, embaixo, a conferência com x = 1: os dois lados dão 2.'),
            },
            {
              texto: '6: não confere', erro: 'esquece-sinal-do-resultado',
              explica: 'Com ${x = 1}$, ${-2x}$ vale −2: ${2 - 2 + 2 = 2}$. Confere.',
              fala: 'Com x igual a um, menos dois x vale menos dois: dois menos dois mais dois, dois. Confere.',
            },
          ],
          linha: { tex: 'x = 1:\\ 2 - 2 + 2 = 2', fala: 'com x igual a um, os dois lados dão dois' },
        },
      ],
      esboco: 'Sem peças: o apoio diminui. O último passo é o hábito de conferir com um número.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: calcule ${(5x^2 - x + 2) - (2x^2 - 3x + 6)}$. Qual é o coeficiente de $x$?',
      fala: 'No papel: calcule cinco x ao quadrado menos x mais dois, menos, o parêntese dois x ao quadrado menos três x mais seis. Qual é o coeficiente de x?',
      resposta: 2,
      sinal: true,
      resolucao: [
        { tex: '5x^2 - x + 2 - 2x^2 + 3x - 6', fala: 'o menos troca os três sinais: menos dois x ao quadrado, mais três x, menos seis' },
        { tex: '= 3x^2 + 2x - 4', fala: 'igual a três x ao quadrado mais dois x menos quatro' },
        { tex: 'x = 1:\\ 6 - 5 = 1 \\text{ e } 3 + 2 - 4 = 1', fala: 'com x igual a um, os dois lados dão um' },
      ],
      esboco: 'Quem digitar −4 trocou só o primeiro sinal (−x − 3x).',
    },
    {
      tipo: 'sua-vez',
      geradores: ['polinomios-somar-n1', 'polinomios-somar-n2', 'polinomios-somar-n3'],
      esboco: 'Nível 1: um coeficiente da soma ou da diferença, com os montes de azulejos. Nível 2: a diferença inteira (com as escolhas de quem vira só o primeiro ou não vira nada) e um coeficiente sem peças. Nível 3: o lucro de uma loja (receita menos custo), o valor da diferença com x = 2 e a diferença de dois polinômios de três termos.',
    },
    {
      tipo: 'fecho',
      texto: 'Juntos, os montes dão ${3x^2 - x + 4}$. Tirando o segundo, sobra ${x^2 + 3x + 2}$. Na próxima aula: multiplicar monômios.',
      fala: 'Juntos, os montes dão três x ao quadrado menos x mais quatro. Tirando o segundo, sobra x ao quadrado mais três x mais dois. Na próxima aula: multiplicar monômios.',
      visual: DIFERENCA({ agrupado: true, cancela: true, mostraExpressao: true }, 'As peças da diferença juntas por tipo, os pares riscados, com x² + 3x + 2 embaixo.'),
      esboco: 'Responde às duas perguntas do gancho.',
    },
  ],
}
