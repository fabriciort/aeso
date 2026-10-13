import type { Aula, Visual } from '@/lib/formation/schema'

// Termos semelhantes com os azulejos: o quadradinho vale 1, a barra vale x
// e o quadrado grande vale x². Começa na bancada: 2 caixas de parafusos
// (2 barras) e 3 parafusos soltos (3 quadradinhos). Momento-chave: no Mexa,
// o aluno junta as barras com as barras e os quadradinhos com os
// quadradinhos, e vê que 2x + 3 não vira 5x: uma barra e um quadradinho
// nunca viram uma peça só (com 10 por caixa, 23 parafusos, não 50). Depois
// o contraste x + x = 2x (duas barras) e x · x = x² (o quadrado de lado x,
// no retângulo por área), e o segundo Mexa com tudo misturado, incluindo a
// barra vermelha −x, que cancela uma barra: 3x − x = 2x.

const az = (pecas: string[], extra: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos: { pecas, ...extra } }, esboco })
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })

/** A bancada: 2 caixas (barras) e 3 parafusos soltos (quadradinhos), misturados. */
const BANCADA = ['x', '1', '1', 'x', '1']
/** Tudo misturado: 3 barras, 1 barra vermelha, 2 quadrados grandes e 3 quadradinhos (2x² + 2x + 3). */
const MISTURA = ['x', '1', 'x²', '−x', 'x', '1', 'x', 'x²', '1']
/** 4x + 3 + 2x − 1. */
const CONTA = ['x', 'x', 'x', 'x', '1', '1', '1', 'x', 'x', '−1']

const BANCADA_JUNTA = (rotulo: string, esboco: string) => az(BANCADA, { agrupado: true, rotulo }, esboco)

export const aula: Aula = {
  id: 'B.U14.A3',
  titulo: 'Termos semelhantes',
  objetivo: 'Juntar termos semelhantes (somar os números da frente de termos com a mesma parte com letra), ver que termos diferentes não se juntam (2x + 3 não é 5x), distinguir x + x = 2x de x · x = x² e cancelar x com −x.',
  modelo: 'livre',
  esboco: 'Abre na bancada: 2 caixas de parafusos e 3 soltos, em azulejos misturados. O aluno junta as peças iguais e vê 2x + 3. Momento-chave: na aposta, 2x + 3 não vira 5x, porque barra e quadradinho nunca viram uma peça só (com 10 por caixa: 23, não 50). Depois o quadrado de lado x: x · x = x², uma peça nova, e não 2x. O anote dá o nome. O segundo Mexa mistura tudo, com uma barra vermelha −x que cancela uma barra. O passo a passo simplifica 4x + 3 + 2x − 1.',
  vega: 'Ideia central: termos semelhantes têm a mesma parte com letra (3x e 5x; 2x² e x²; 4 e 7). Só eles se juntam, somando os números da frente: 3x + 5x = 8x. Termos diferentes ficam separados: 2x + 3 não é 5x. x + x = 2x (duas barras), mas x · x = x² (o quadrado de lado x). Uma barra negativa −x cancela uma barra x. Uma letra sozinha conta como 1: x = 1x. Erros esperados: juntar termos que não são semelhantes (2x + 3 = 5x); x · x = 2x; x + x = x²; esquecer o 1 do x sozinho (x + 3x = 3x, 5x − x = 5). Guie com "Que peça é essa: barra, quadradinho ou quadrado grande?", "Troque o x por 10 e confira", "Quantas barras sobram?". A distributiva com letras é da próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na bancada, **2** caixas iguais de parafusos e **3** parafusos soltos. Com $x$ parafusos por caixa, dá para dizer $5x$?',
      fala: 'Na bancada, duas caixas iguais de parafusos e três parafusos soltos. Com x parafusos por caixa, dá para dizer cinco x?',
      visual: az(BANCADA, {}, 'Os azulejos misturados: barra, quadradinho, quadradinho, barra, quadradinho. Cada barra tem "x"; cada quadradinho, "1".'),
      esboco: 'A bancada bagunçada. A pergunta deixa o 5x no ar: muita gente diria que sim.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada barra é uma caixa: vale $x$. Cada quadradinho é um parafuso: vale 1. Junte as peças iguais.',
      fala: 'Cada barra é uma caixa: vale x. Cada quadradinho é um parafuso: vale um. Junte as peças iguais.',
      visual: az(BANCADA, { agrupar: true, mostraExpressao: true }, 'As peças misturadas, com borda tracejada. Um toque numa barra junta as duas barras (2x); um toque num quadradinho junta os três (3). No fim, 2x + 3 embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa peça para juntar as do mesmo tipo.',
        sucesso: { agrupado: true },
        mostre: 'As barras vão para um grupo (2x) e os quadradinhos para outro (3). Embaixo aparece 2x + 3.',
      },
      descoberta: 'As peças iguais se juntam e se contam: 2 barras são 2x, 3 quadradinhos são 3. Os dois grupos continuam separados: 2x + 3.',
      esboco: 'O aluno faz a separação com as mãos: barras com barras, quadradinhos com quadradinhos. Nenhum toque junta os dois grupos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'As peças dão ${2x + 3}$. Dá para juntar tudo e escrever $5x$?',
      fala: 'As peças dão dois x mais três. Dá para juntar tudo e escrever cinco x?',
      visual: az(BANCADA, { agrupado: true, mostraExpressao: true }, 'Os dois grupos lado a lado: 2x e 3. Embaixo, 2x + 3.'),
      opcoes: [
        {
          texto: 'Não. Barra e quadradinho são peças diferentes', certa: true,
          explica: 'Isso. Com 10 por caixa, ${2x + 3}$ são ${20 + 3 = 23}$ parafusos. $5x$ seriam 50.',
          fala: 'Isso. Com dez por caixa, dois x mais três são vinte mais três, vinte e três parafusos. Cinco x seriam cinquenta.',
          mostra: BANCADA_JUNTA('x = 10: 2 · 10 + 3 = 23', 'Os dois grupos, e embaixo: x = 10: 2 · 10 + 3 = 23.'),
        },
        {
          texto: 'Sim, porque ${2 + 3 = 5}$', erro: 'junta-termos-nao-semelhantes',
          explica: '$5x$ são 5 caixas. Você tem 2 caixas e 3 soltos: com 10 por caixa, 23 parafusos, não 50.',
          fala: 'Cinco x são cinco caixas. Você tem duas caixas e três soltos: com dez por caixa, vinte e três parafusos, não cinquenta.',
          mostra: az(['x', 'x', 'x', 'x', 'x'], { agrupado: true, rotulo: 'x = 10: 5x = 50' }, 'Cinco barras juntas, muito mais do que a bancada tem. Embaixo: x = 10: 5x = 50.'),
        },
      ],
      esboco: 'O momento-chave. O contraexemplo com x = 10 convence: 23 parafusos não são 50. A errada mostra as cinco barras que a bancada não tem.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Duas barras lado a lado: ${x + x = 2x}$. E ${x \\cdot x}$, a área do quadrado de lado $x$?',
      fala: 'Duas barras lado a lado: x mais x é dois x. E x vezes x, a área do quadrado de lado x?',
      visual: ret({ base: ['x'], altura: ['x'], areas: [['?']] }, 'O quadrado de lado x, com x em cima e x à esquerda, e um "?" dentro.'),
      opcoes: [
        {
          texto: '$x^2$', certa: true,
          explica: 'Isso. ${x \\cdot x = x^2}$, x ao quadrado: uma peça nova, o quadrado grande.',
          fala: 'Isso. x vezes x é x ao quadrado: uma peça nova, o quadrado grande.',
          mostra: ret({ base: ['x'], altura: ['x'], areas: true, total: 'x²' }, 'O mesmo quadrado, agora com x² dentro e embaixo.'),
        },
        {
          texto: '$2x$', erro: 'x-vezes-x-da-2x',
          explica: '$2x$ são duas barras, ${x + x}$. Multiplicar é outra coisa: com ${x = 5}$, ${2x = 10}$, mas ${x \\cdot x = 25}$.',
          fala: 'Dois x são duas barras, x mais x. Multiplicar é outra coisa: com x igual a cinco, dois x é dez, mas x vezes x é vinte e cinco.',
          mostra: ret({ base: ['x'], altura: ['x'], areas: true, total: 'x²' }, 'O quadrado com x² dentro: muito maior que duas barras.'),
        },
        {
          texto: '$x$',
          explica: '$x$ é uma barra só. Multiplicar $x$ por $x$ dá a área do quadrado inteiro: $x^2$.',
          fala: 'x é uma barra só. Multiplicar x por x dá a área do quadrado inteiro: x ao quadrado.',
          mostra: ret({ base: ['x'], altura: ['x'], areas: true, total: 'x²' }, 'O quadrado com x² dentro.'),
        },
      ],
      esboco: 'O retângulo por área da unidade 3, agora com letras nos lados. A potência da unidade 13 reaparece: x · x = x².',
    },
    {
      tipo: 'anote',
      titulo: 'Termos semelhantes',
      definicao: '**Termos semelhantes** têm a mesma parte com letra, como $3x$ e $5x$. Só eles se juntam: somam-se os números da frente.',
      exemplo: { tex: '2x + 3 + 4x = 6x + 3', fala: 'dois x mais três mais quatro x é igual a seis x mais três' },
      alerta: '${x + x = 2x}$, mas ${x \\cdot x = x^2}$. E ${2x + 3}$ não vira $5x$: fica como está.',
      esboco: 'Na página: as barras com as barras, os quadradinhos com os quadradinhos. Ao lado, o quadrado grande com x².',
    },
    {
      tipo: 'mexa',
      texto: 'O quadrado grande vale $x^2$. A barra vermelha vale $-x$: ela tira um $x$. Junte as peças iguais.',
      fala: 'O quadrado grande vale x ao quadrado. A barra vermelha vale menos x: ela tira um x. Junte as peças iguais.',
      visual: az(MISTURA, { agrupar: true, cancela: true, mostraExpressao: true }, 'Nove peças misturadas: três barras amarelas, uma barra vermelha (−x), dois quadrados grandes (x²) e três quadradinhos. Cada toque junta um tipo; juntas, uma barra amarela e a vermelha ficam riscadas (valem zero). No fim, 2x² + 2x + 3 embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa peça para juntar as do mesmo tipo.',
        sucesso: { agrupado: true },
        mostre: 'Cada tipo vai para o seu grupo: 2x², 3x, 3 e −x. Embaixo aparece 2x² + 2x + 3: a barra vermelha cancelou uma barra.',
      },
      descoberta: 'Cada tipo de peça é um tipo de termo. Os quadrados grandes não se juntam com as barras. Uma barra vermelha cancela uma amarela: 3x − x = 2x.',
      esboco: 'A barra vermelha fica num grupo à parte, mas a expressão no fim já conta o cancelamento: 3x e −x viram 2x.',
    },
    {
      tipo: 'passo',
      problema: 'Simplifique ${4x + 3 + 2x - 1}$.',
      fala: 'Simplifique quatro x mais três mais dois x menos um.',
      visual: az(CONTA, {}, 'As peças da conta em fila: quatro barras, três quadradinhos, duas barras e um quadradinho vermelho (−1).'),
      passos: [
        {
          pergunta: 'Quais termos são semelhantes?',
          opcoes: [
            {
              texto: '$4x$ com $2x$, e $3$ com $-1$', certa: true,
              explica: 'Isso. As barras com as barras, os números com os números.',
              mostra: az(CONTA, { agrupado: true }, 'As peças se juntam por tipo: 6 barras (6x), 3 quadradinhos (3) e o quadradinho vermelho (−1).'),
            },
            {
              texto: '$4x$ com $3$', erro: 'junta-termos-nao-semelhantes',
              explica: 'O 3 não tem letra: é quadradinho, não barra. Ele vai com o −1.',
            },
          ],
          linha: { tex: '4x + 2x + 3 - 1', fala: 'quatro x mais dois x, mais três menos um' },
        },
        {
          pergunta: 'Quanto é ${4x + 2x}$?',
          fala: 'Quanto é quatro x mais dois x?',
          opcoes: [
            {
              texto: '$6x$', certa: true,
              explica: 'Isso. 4 barras e mais 2: 6 barras.',
              fala: 'Isso. Quatro barras e mais duas: seis barras.',
              mostra: az(CONTA, { agrupado: true, rotulo: '6x + 3 − 1' }, 'Os grupos por tipo, com 6x + 3 − 1 embaixo.'),
            },
            {
              texto: '$6x^2$', erro: 'x-mais-x-da-x2',
              explica: 'Somar barras não faz quadrado grande. 4 barras e mais 2 são 6 barras: $6x$.',
              fala: 'Somar barras não faz quadrado grande. Quatro barras e mais duas são seis barras: seis x.',
            },
            {
              texto: '$8x$',
              explica: '8 é ${4 \\cdot 2}$. Juntar é somar as barras: ${4 + 2 = 6}$.',
              fala: 'Oito é quatro vezes dois. Juntar é somar as barras: quatro mais dois, seis.',
            },
          ],
          linha: { tex: '= 6x + 3 - 1', fala: 'igual a seis x mais três menos um' },
        },
        {
          pergunta: 'Agora ${3 - 1}$. Como fica tudo?',
          fala: 'Agora três menos um. Como fica tudo?',
          opcoes: [
            {
              texto: '${6x + 2}$', certa: true,
              explica: 'Isso. O −1 cancela um quadradinho: sobram 2. E o $6x$ fica separado.',
              fala: 'Isso. O menos um cancela um quadradinho: sobram dois. E o seis x fica separado.',
              mostra: az(CONTA, { agrupado: true, cancela: true, mostraExpressao: true }, 'Os grupos por tipo; um quadradinho e o quadradinho vermelho aparecem riscados (valem zero). Embaixo, 6x + 2.'),
            },
            {
              texto: '$8x$', erro: 'junta-termos-nao-semelhantes',
              explica: '$8x$ junta barras com quadradinhos. O 2 fica separado: ${6x + 2}$.',
              fala: 'Oito x junta barras com quadradinhos. O dois fica separado: seis x mais dois.',
            },
            {
              texto: '${6x + 4}$',
              explica: 'O −1 tira um quadradinho: ${3 - 1 = 2}$, não 4.',
              fala: 'O menos um tira um quadradinho: três menos um, dois, não quatro.',
            },
          ],
          linha: { tex: '= 6x + 2', fala: 'igual a seis x mais dois' },
        },
      ],
      esboco: 'O caderno escreve a conta enquanto as peças se juntam. No fim, 6x + 2: dois termos, e está pronto.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: simplifique ${5x + 3 + x - 2x}$. Quantos $x$ ficam?',
      fala: 'No papel: simplifique cinco x mais três mais x menos dois x. Quantos x ficam?',
      resposta: 4,
      sinal: true,
      resolucao: [
        { tex: '5x + x - 2x = 4x', fala: 'cinco x mais um x menos dois x, quatro x' },
        { tex: '5x + 3 + x - 2x = 4x + 3', fala: 'a expressão inteira fica quatro x mais três' },
      ],
      esboco: 'O x sozinho vale 1x: quem digitar 3 esqueceu dele. O 3 sem letra fica de fora da conta dos x.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['termos-semelhantes-n1', 'termos-semelhantes-n2', 'termos-semelhantes-n3'],
      esboco: 'Nível 1: ax + bx = □x e x + bx com os azulejos, e se ax + b pode virar um termo só. Nível 2: subtração (com resultado negativo e o x sozinho), x · x contra x + x, e 3x · x. Nível 3: simplificar ax + b + cx − d, o perímetro de um terreno de lados x e k, e ax + bx − cx sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: '2 caixas e 3 parafusos soltos são ${2x + 3}$, e fica assim. Na próxima aula: o retângulo partido, agora com letras.',
      fala: 'Duas caixas e três parafusos soltos são dois x mais três, e fica assim. Na próxima aula: o retângulo partido, agora com letras.',
      visual: az(BANCADA, { agrupado: true, mostraExpressao: true }, 'A bancada arrumada: 2x e 3 lado a lado, com 2x + 3 embaixo.'),
      esboco: 'Responde ao gancho e anuncia a distributiva com letras.',
    },
  ],
}
