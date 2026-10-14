import type { Aula, Visual } from '@/lib/formation/schema'

// Multiplicar monômios no retângulo por área. Um cômodo de 3x por 4x metros:
// no Mexa revelar, o aluno toca e a área aparece, 12x². Partindo os lados em
// x, são 3 fileiras de 4 quadrados de x por x: os números se multiplicam
// (12, não 7) e as letras viram x². Momento-chave: x² · x³ por extenso,
// (x · x)(x · x · x), cinco x: os expoentes se somam porque os fatores se
// juntam. O contraste: x² + x³ não se junta (peças diferentes; com x = 2,
// 12 e não 32). Depois um segundo retângulo, 2x por 3x² (6x³), e o passo a
// passo com sinal, (−2x³) · 5x⁴ = −10x⁷.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const exp = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** O cômodo de 3x por 4x. */
const COMODO = { base: ['4x'], altura: ['3x'] }
/** O mesmo cômodo, com os lados partidos em x: 3 fileiras de 4 quadrados x². */
const PARTIDO = ret({ base: ['x', 'x', 'x', 'x'], altura: ['x', 'x', 'x'], areas: true, total: '12x²' }, 'O retângulo partido em 3 fileiras de 4 quadrados, cada um com x² dentro. Embaixo, 12x².')

const EXTENSO = ['x² · x³', '(x · x) · (x · x · x)']
const PRODUTO = exp([...EXTENSO, 'x⁵'], 'Três linhas: x² · x³; por extenso, (x · x) · (x · x · x); e o x⁵ grande embaixo. Os cinco x contados.')

const PASSO = '(−2x³) · 5x⁴'

export const aula: Aula = {
  id: 'AF.U1.A3',
  titulo: 'Multiplicar monômios',
  objetivo: 'Multiplicar monômios multiplicando os coeficientes e somando os expoentes da mesma letra (3x · 4x = 12x², x² · x³ = x⁵), com o sinal pela regra dos sinais, e não confundir com a soma (x² + x³ não se junta).',
  modelo: 'retangulo',
  esboco: 'Abre num cômodo de 3x por 4x metros. O Mexa revelar mostra a área, 12x². Partindo os lados em x, aparecem 12 quadrados de x por x: os números se multiplicam (12, não 7). Momento-chave: x² · x³ escrito por extenso, cinco x, x⁵; não x⁶. O contraste com x² + x³, que não se junta (com x = 2, 12 e não 32). O anote dá a regra. Um segundo retângulo, 2x por 3x² = 6x³, e o passo a passo com sinal: (−2x³) · 5x⁴ = −10x⁷.',
  vega: 'Ideia central: para multiplicar monômios, números com números e letras com letras. Os coeficientes se multiplicam (3 · 4 = 12) e os expoentes da mesma letra se somam, porque os fatores se juntam: x² · x³ = (x · x)(x · x · x) = x⁵. O x sozinho tem expoente 1: x⁴ · x = x⁵. O sinal segue a regra dos sinais. Somar é outra coisa: x² + x³ não se junta, são termos diferentes. Erros esperados: somar os coeficientes (3x · 4x = 7x²); multiplicar os expoentes (x² · x³ = x⁶); somar os expoentes numa adição (x² + x³ = x⁵); esquecer o expoente 1 do x sozinho; errar o sinal. Guie com "Escreva por extenso: quantos x ficam?", "Conte os quadrados do retângulo", "Confira com x = 2". O monômio vezes polinômio é da próxima aula.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um cômodo mede $3x$ metros de largura e $4x$ de comprimento. Qual é a área do piso?',
      fala: 'Um cômodo mede três x metros de largura e quatro x de comprimento. Qual é a área do piso?',
      visual: ret({ ...COMODO, areas: [['?']] }, 'O retângulo do piso, com 4x em cima e 3x à esquerda, e um "?" dentro.'),
      esboco: 'Os lados mudam com x, mas a pergunta é a de sempre: a área.',
    },
    {
      tipo: 'mexa',
      texto: 'A área é a largura vezes o comprimento: ${3x \\cdot 4x}$.',
      fala: 'A área é a largura vezes o comprimento: três x vezes quatro x.',
      visual: ret({ ...COMODO, revelar: true, total: '12x²' }, 'O retângulo com um "?" e a borda tracejada. O toque descobre a área, 12x², com um pulo; o total aparece embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no retângulo para ver a área.',
        sucesso: { reveladas: 1 },
        mostre: 'A área aparece: 12x².',
      },
      descoberta: '3x · 4x = 12x²: o 12 vem de 3 · 4, e o x² de x · x.',
      esboco: 'Um toque só, para o resultado chegar antes da explicação.',
    },
    {
      tipo: 'ideia',
      texto: 'Por quê? Parta os lados em $x$: são **3** fileiras de **4** quadrados de $x$ por $x$. Doze quadrados de $x^2$: ${12x^2}$.',
      fala: 'Por quê? Parta os lados em x: são três fileiras de quatro quadrados de x por x. Doze quadrados de x ao quadrado: doze x ao quadrado.',
      visual: { ...PARTIDO, movimento: 'O retângulo se parte: 4x vira quatro x em cima, 3x vira três x ao lado.' },
      esboco: 'O mesmo retângulo, partido. Cada quadrado é o quadrado grande dos azulejos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Muita gente responde $7x^2$. Em ${3x \\cdot 4x}$, o que acontece com o 3 e o 4?',
      fala: 'Muita gente responde sete x ao quadrado. Em três x vezes quatro x, o que acontece com o três e o quatro?',
      visual: PARTIDO,
      opcoes: [
        {
          texto: 'Multiplicam: ${3 \\cdot 4 = 12}$', certa: true,
          explica: 'Isso. 3 fileiras de 4 quadrados são 12. E as letras: ${x \\cdot x = x^2}$.',
          fala: 'Isso. Três fileiras de quatro quadrados são doze. E as letras: x vezes x, x ao quadrado.',
        },
        {
          texto: 'Somam: ${3 + 4 = 7}$', erro: 'soma-coeficientes-na-multiplicacao',
          explica: 'Conte os quadrados: 3 fileiras de 4 são 12, não 7. Somar é para termos semelhantes.',
          fala: 'Conte os quadrados: três fileiras de quatro são doze, não sete. Somar é para termos semelhantes.',
        },
      ],
      esboco: 'Os doze quadrados na tela desmontam o 7.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x^2 \\cdot x^3}$? Por extenso, $x^2$ é ${x \\cdot x}$ e $x^3$ é ${x \\cdot x \\cdot x}$. Quantos $x$ ficam multiplicados?',
      fala: 'E x ao quadrado vezes x ao cubo? Por extenso, x ao quadrado é x vezes x, e x ao cubo é x vezes x vezes x. Quantos x ficam multiplicados?',
      visual: exp(EXTENSO, 'A conta e, embaixo, grande, por extenso: (x · x) · (x · x · x).'),
      opcoes: [
        {
          texto: 'Cinco: $x^5$', certa: true,
          explica: 'Isso. Dois $x$ e mais três: cinco. Os expoentes se **somam**, porque os fatores se juntam.',
          fala: 'Isso. Dois x e mais três: cinco. Os expoentes se somam, porque os fatores se juntam.',
          mostra: PRODUTO,
        },
        {
          texto: 'Seis: $x^6$', erro: 'potencia-multiplica-expoentes',
          explica: 'Conte os $x$ na tela: dois e mais três são cinco, não seis. ${x^2 \\cdot x^3 = x^5}$.',
          fala: 'Conte os x na tela: dois e mais três são cinco, não seis. x ao quadrado vezes x ao cubo é x elevado a cinco.',
          mostra: PRODUTO,
        },
      ],
      esboco: 'O momento-chave: a regra dos expoentes sai da contagem, como quando vimos potências. O x⁶ cai na conta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x^2 + x^3}$, com mais? Dá para juntar num termo só?',
      fala: 'E x ao quadrado mais x ao cubo, com mais? Dá para juntar num termo só?',
      visual: exp(['x² + x³'], 'A soma grande no centro: x² + x³.'),
      opcoes: [
        {
          texto: 'Não: fica ${x^3 + x^2}$', certa: true,
          explica: 'Isso. São termos diferentes. Com ${x = 2}$: ${8 + 4 = 12}$. Já $x^5$ seria 32.',
          fala: 'Isso. São termos diferentes. Com x igual a dois: oito mais quatro, doze. Já x elevado a cinco seria trinta e dois.',
          mostra: exp(['x² + x³', 'x = 2: 4 + 8 = 12'], 'A soma e, embaixo, a conferência com x = 2: 4 + 8 = 12.'),
        },
        {
          texto: 'Sim: $x^5$', erro: 'potencia-soma-expoentes-na-adicao',
          explica: 'Com ${x = 2}$: ${x^2 + x^3 = 4 + 8 = 12}$, mas ${x^5 = 32}$. Os expoentes se somam só na multiplicação.',
          fala: 'Com x igual a dois: x ao quadrado mais x ao cubo é quatro mais oito, doze, mas x elevado a cinco é trinta e dois. Os expoentes se somam só na multiplicação.',
          mostra: exp(['x² + x³', 'x = 2: 4 + 8 = 12', 'x⁵ = 32'], 'A soma, a conferência com x = 2 (12) e, embaixo, x⁵ = 32: não bate.'),
        },
      ],
      esboco: 'O contraste da aula: com vezes, os fatores se juntam; com mais, as peças diferentes ficam separadas.',
    },
    {
      tipo: 'anote',
      titulo: 'Multiplicar monômios',
      definicao: 'Para multiplicar monômios, multiplique os números e junte as letras: os expoentes da mesma letra se **somam**.',
      exemplo: { tex: '3x^2 \\cdot 4x^3 = 12x^5', fala: 'três x ao quadrado vezes quatro x ao cubo é igual a doze x elevado a cinco' },
      alerta: '${x^2 \\cdot x^3 = x^5}$, não $x^6$. E ${x^2 + x^3}$ não se junta: são termos diferentes.',
      esboco: 'Na página: o retângulo 3x por 4x partido em 12 quadrados, e a conta por extenso dos cinco x.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora com $x^2$ num lado: a altura é $2x$ e a base, $3x^2$.',
      fala: 'Agora com x ao quadrado num lado: a altura é dois x e a base, três x ao quadrado.',
      visual: ret({ base: ['3x²'], altura: ['2x'], revelar: true, total: '6x³' }, 'Um retângulo mais comprido, com 3x² em cima e 2x à esquerda, um "?" dentro e a borda tracejada. O toque descobre 6x³.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no retângulo para ver a área.',
        sucesso: { reveladas: 1 },
        mostre: 'A área aparece: 6x³.',
      },
      descoberta: '2x · 3x² = 6x³: 2 · 3 = 6, e x · x² = x³ (um x e mais dois).',
      esboco: 'O aluno prevê antes de tocar: o x sozinho tem expoente 1.',
    },
    {
      tipo: 'passo',
      problema: 'Calcule ${(-2x^3) \\cdot 5x^4}$.',
      fala: 'Calcule menos dois x ao cubo, vezes cinco x elevado a quatro.',
      visual: exp([PASSO], 'A conta numa linha: (−2x³) · 5x⁴.'),
      passos: [
        {
          pergunta: 'Separe: números com números, letras com letras.',
          opcoes: [
            {
              texto: '${(-2 \\cdot 5) \\cdot (x^3 \\cdot x^4)}$', certa: true,
              explica: 'Isso. Na multiplicação, a ordem dos fatores não muda o resultado.',
              mostra: exp([PASSO, '(−2 · 5) · (x³ · x⁴)'], 'A conta e, embaixo: (−2 · 5) · (x³ · x⁴).'),
            },
            {
              texto: '${(-2 + 5) \\cdot (x^3 + x^4)}$', erro: 'soma-coeficientes-na-multiplicacao',
              explica: 'Aqui é tudo multiplicação: nada se soma. Os números se multiplicam, as letras também.',
            },
          ],
          linha: { tex: '(-2 \\cdot 5) \\cdot (x^3 \\cdot x^4)', fala: 'menos dois vezes cinco, vezes x ao cubo vezes x elevado a quatro' },
        },
        {
          pergunta: 'Quanto é ${(-2) \\cdot 5}$?',
          fala: 'Quanto é menos dois vezes cinco?',
          opcoes: [
            {
              texto: '−10', certa: true,
              explica: 'Isso. Sinais diferentes: o produto é negativo.',
              mostra: exp([PASSO, '(−2 · 5) · (x³ · x⁴)', '−10 · x³ · x⁴'], 'As linhas da conta; a última: −10 · x³ · x⁴.'),
            },
            {
              texto: '10', erro: 'sinais-diferentes-da-positivo',
              explica: 'Menos vezes mais dá menos: ${(-2) \\cdot 5 = -10}$.',
              fala: 'Menos vezes mais dá menos: menos dois vezes cinco, menos dez.',
            },
          ],
          linha: { tex: '= -10 \\cdot x^3 \\cdot x^4', fala: 'igual a menos dez vezes x ao cubo vezes x elevado a quatro' },
        },
        {
          pergunta: 'E ${x^3 \\cdot x^4}$?',
          fala: 'E x ao cubo vezes x elevado a quatro?',
          opcoes: [
            {
              texto: '$x^7$', certa: true,
              explica: 'Isso. Três $x$ e mais quatro: sete. Fica ${-10x^7}$.',
              fala: 'Isso. Três x e mais quatro: sete. Fica menos dez x elevado a sete.',
              mostra: exp([PASSO, '(−2 · 5) · (x³ · x⁴)', '−10x⁷'], 'As linhas da conta e, maior, o resultado: −10x⁷.'),
            },
            {
              texto: '$x^{12}$', erro: 'potencia-multiplica-expoentes',
              explica: 'Por extenso, são três $x$ e mais quatro: sete, não doze.',
              fala: 'Por extenso, são três x e mais quatro: sete, não doze.',
            },
          ],
          linha: { tex: '= -10x^7', fala: 'igual a menos dez x elevado a sete' },
        },
      ],
      esboco: 'Sem retângulo: o apoio diminui. O caderno da tela escreve a conta enquanto o palco acompanha.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: calcule ${3x^4 \\cdot 2x}$. Qual é o expoente do $x$ no resultado?',
      fala: 'No papel: calcule três x elevado a quatro, vezes dois x. Qual é o expoente do x no resultado?',
      resposta: 5,
      resolucao: [
        { tex: '3 \\cdot 2 = 6', fala: 'três vezes dois, seis' },
        { tex: 'x^4 \\cdot x = x^4 \\cdot x^1 = x^5', fala: 'x elevado a quatro vezes x, que é x elevado a um, dá x elevado a cinco' },
        { tex: '3x^4 \\cdot 2x = 6x^5', fala: 'três x elevado a quatro vezes dois x é igual a seis x elevado a cinco' },
      ],
      esboco: 'Quem digitar 4 esqueceu o expoente 1 do x sozinho.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['polinomios-produto-monomios-n1', 'polinomios-produto-monomios-n2', 'polinomios-produto-monomios-n3'],
      esboco: 'Nível 1: a área do retângulo de lados ax e bx, o coeficiente de ax · bx e o expoente de xᵐ · xⁿ, com o retângulo ou a conta por extenso. Nível 2: com sinais, com o x sozinho e a soma xᵐ + xⁿ que não se junta. Nível 3: o produto inteiro com sinais, o volume de uma caixa e o produto com duas letras.',
    },
    {
      tipo: 'fecho',
      texto: 'O piso de $3x$ por $4x$ tem ${12x^2}$ metros quadrados. Na próxima aula: um monômio vezes um polinômio inteiro.',
      fala: 'O piso de três x por quatro x tem doze x ao quadrado metros quadrados. Na próxima aula: um monômio vezes um polinômio inteiro.',
      visual: ret({ ...COMODO, areas: true, total: '12x²' }, 'O retângulo do cômodo inteiro, com 12x² dentro e embaixo.'),
      esboco: 'Responde ao gancho e anuncia a distributiva com polinômios.',
    },
  ],
}
