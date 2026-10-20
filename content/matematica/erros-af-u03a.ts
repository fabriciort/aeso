import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 3 de Álgebra e Funções, parte A: aulas 1 a
// 4, x² = k, produto igual a zero, resolver por fatoração e completar o
// quadrado (somados ao catálogo em erros.ts). Reaproveitados: raiz-e-a-metade
// (unidade de potências: √36 = 18), sinais-iguais-da-negativo (unidade dos
// negativos), potencia-sinal-fora-dos-parenteses ((−8)² = −64),
// desfaz-com-a-mesma-operacao, opera-so-de-um-lado, esquece-de-dividir e
// passa-para-o-outro-lado (equações do 1º grau), vezes-como-mais e
// termo-perde-o-sinal (linguagem algébrica e expressões), e, da unidade
// anterior, fatora-com-o-sinal-trocado, fatores-com-a-soma-errada,
// fatora-sem-tirar-a-raiz e canto-do-quadrado-negativo.
export const ERROS_AF_U03A: ErroComum[] = [
  {
    id: 'raiz-so-positiva',
    nome: 'acha só a raiz positiva de x² = k',
    causa: 'Lembra da raiz quadrada como o lado de um quadrado, que é sempre positivo, e esquece que a equação aceita qualquer número cujo quadrado seja k, inclusive o negativo.',
    exemplo: 'x² = 25 dá só x = 5 (falta o −5). Ou: (x − 1)² = 16 vira só x − 1 = 4, e x = 5 (falta o −3).',
    desmonte: 'Ponha o −5 no lugar do x: (−5)² = (−5) · (−5) = 25, menos vezes menos dá mais. Na reta, o 5 e o −5 ficam à mesma distância do zero. O √25 é o lado, 5; a equação tem as duas raízes, x = ±5.',
  },
  {
    id: 'raiz-de-numero-negativo',
    nome: 'acha raízes para x² igual a um número negativo',
    causa: 'Faz a conta da raiz sem olhar o sinal: vê o 9 em x² = −9 e responde 3 e −3, ou acha que (−3)² dá −9.',
    exemplo: 'x² = −9 dá x = 3 ou x = −3. Ou: (x + 1)² = −4 dá x + 1 = ±2.',
    desmonte: 'Na tabela dos quadrados de −3 a 3 (9, 4, 1, 0, 1, 4, 9), nenhum é negativo: positivo vezes positivo e negativo vezes negativo dão positivo. Confira o 3: 3² = 9, não −9. Um quadrado não tem área negativa.',
  },
  {
    id: 'raiz-com-o-sinal-do-fator',
    nome: 'copia o número do fator, com o sinal dele, como raiz',
    causa: 'Vê o número escrito no parêntese e o toma como a raiz, sem perguntar que x deixa aquele fator igual a zero.',
    exemplo: '(x − 2)(x + 3) = 0 dá x = −2 ou x = 3, em vez de 2 ou −3. Ou: x + 4 = 0 dá x = 4.',
    desmonte: 'Ponha o número no lugar do x: com 3, x + 3 dá 6, não 0. O fator x + 3 zera em −3, porque −3 + 3 = 0. Na tabela do produto, a coluna do 3 não fica âmbar; a do −3, sim.',
  },
  {
    id: 'produto-zero-exige-os-dois',
    nome: 'acha que os dois fatores têm de ser zero',
    causa: 'Lê a regra "se a · b = 0" como se pedisse a = 0 e b = 0 ao mesmo tempo, e não um ou outro.',
    exemplo: '(2x − 6)(x + 4) = 0 pede 2x − 6 = 0 e x + 4 = 0 juntos, e conclui que não há solução, porque nenhum x faz as duas coisas.',
    desmonte: 'Basta um fator zero: 0 · 7 = 0. Com x = 3, o primeiro fator é 0 e o segundo é 7, e o produto já é 0. Por isso as raízes vêm de cada fator, com "ou": x = 3 ou x = −4.',
  },
  {
    id: 'separa-produto-diferente-de-zero',
    nome: 'separa os fatores quando o produto não é zero',
    causa: 'Aprendeu a igualar cada fator ao lado direito e repete com qualquer número, sem ver que só o zero obriga um fator a ser ele.',
    exemplo: '(x − 2)(x + 3) = 6 vira x − 2 = 6 ou x + 3 = 6, e x = 8 ou x = 3.',
    desmonte: 'Confira o 8: (8 − 2)(8 + 3) = 6 · 11 = 66, não 6. Um produto 6 pode ser 1 · 6, 2 · 3, 12 · 0,5: nenhum fator precisa ser 6. Primeiro deixe zero de um lado: x² + x − 12 = 0.',
  },
  {
    id: 'divide-por-x-e-perde-o-zero',
    nome: 'divide os dois lados por x e perde a raiz 0',
    causa: 'Quer simplificar x² = 4x e divide por x, como faria com um número. Não vê que x pode ser 0, e que não se divide por zero.',
    exemplo: 'x² = 4x vira x = 4, e a raiz 0 some. Ou: x² − 6x = 0 dá só x = 6.',
    desmonte: 'Teste x = 0: 0² = 4 · 0, 0 = 0. O 0 é raiz. Em vez de dividir, ponha x em evidência: x² − 4x = x(x − 4) = 0, e o produto zera em 0 e em 4.',
  },
  {
    id: 'iguala-a-zero-sem-fatorar',
    nome: 'usa a regra do zero numa soma, sem fatorar',
    causa: 'Sabe que "cada parte igual a zero" resolve um produto e aplica a regra aos termos de uma soma, ou toma o número solto como a raiz.',
    exemplo: 'x² − 5x + 6 = 0 vira x² − 5x = 0 ou 6 = 0, ou dá x = 6. Ou: x² = x + 12 vira x² = 0 ou x + 12 = 0.',
    desmonte: 'Confira o 6: 36 − 30 + 6 = 12, não 0. A regra vale porque um produto só zera com um fator zero; numa soma, os termos podem se cancelar. Fatore antes: (x − 2)(x − 3) = 0.',
  },
  {
    id: 'completa-com-a-metade',
    nome: 'completa o quadrado com a metade de b, sem elevar',
    causa: 'Lembra que a metade do número do x entra na conta e para ali: põe o lado do canto no lugar da área dele.',
    exemplo: 'x² + 10x + 5 como quadrado, em vez de x² + 10x + 25. Ou: x² + 6x = 16 vira (x + 3)² = 16 + 3.',
    desmonte: 'Nos azulejos, as 10 barras se partem em 5 e 5 e falta um canto de 5 por 5: são 5² = 25 quadradinhos, não 5. Confira: (x + 5)² = x² + 10x + 25.',
  },
  {
    id: 'completa-com-b-ao-quadrado',
    nome: 'completa o quadrado com b ao quadrado, sem a metade',
    causa: 'Sabe que um quadrado entra na conta, mas eleva o número do x inteiro, sem partir as barras em duas metades.',
    exemplo: 'x² + 10x + 100 como quadrado, em vez de x² + 10x + 25. Ou: em x² − 4x, completa com 16.',
    desmonte: 'As barras se partem: metade de cada lado do x². O canto é 5 por 5, não 10 por 10. Confira: (x + 10)² = x² + 20x + 100, com 20 barras, e não 10.',
  },
]
