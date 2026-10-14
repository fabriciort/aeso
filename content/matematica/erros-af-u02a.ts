import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 2 de Álgebra e Funções, parte A: aulas 1 a
// 3, o quadrado da soma, o quadrado da diferença e a soma vezes a diferença
// (somados ao catálogo em erros.ts). Reaproveitados: produto-so-das-pontas
// (unidade 1 de Álgebra: só um dos pedaços do meio, x² + 3x + 9),
// sinais-diferentes-da-positivo (unidade 12: 3 · (−3) = 9),
// potencia-multiplica-base-pelo-expoente (unidade 13: 3² = 6) e
// x-mais-x-da-x2 (unidade 14: 3x + 3x = 6x²).
export const ERROS_AF_U02A: ErroComum[] = [
  {
    id: 'quadrado-da-soma-sem-o-meio',
    nome: 'eleva cada termo ao quadrado e esquece o meio',
    causa: 'Faz com o quadrado o que faria com um produto por um número: distribui o expoente por cada termo. Vê (x + 3)² como "x² e 3²" e não como (x + 3) vezes (x + 3).',
    exemplo: '(x + 3)² = x² + 9, em vez de x² + 6x + 9. Também: (x − 3)² = x² − 9, em vez de x² − 6x + 9.',
    desmonte: 'O quadrado de lado x + 3 tem quatro pedaços: x², 3x, 3x e 9. O x² + 9 cobre só os dois cantos. Confira com x = 1: (1 + 3)² = 16, e x² + 9 dá só 10.',
  },
  {
    id: 'canto-do-quadrado-negativo',
    nome: 'põe o canto de (x − 3)² com o sinal de menos',
    causa: 'Vê os dois menos em (x − 3)² e copia o menos para todos os termos, sem fazer a conta do canto: (−3) · (−3).',
    exemplo: '(x − 3)² = x² − 6x − 9, em vez de x² − 6x + 9.',
    desmonte: 'O canto tem os dois lados −3: (−3) · (−3) = +9, menos vezes menos dá mais. Confira com x = 5: (5 − 3)² = 4, e 25 − 30 − 9 dá −14, uma área negativa.',
  },
  {
    id: 'quadrado-do-monomio-so-na-letra',
    nome: 'eleva ao quadrado só a letra do monômio',
    causa: 'Em (2x)², o expoente parece estar só no x, como em 2x². Esquece que o 2 também está dentro do quadrado.',
    exemplo: '(2x + 1)² = 2x² + 4x + 1, em vez de 4x² + 4x + 1. Ou: (3x)² = 3x², em vez de 9x².',
    desmonte: 'O pedaço grande é 2x por 2x: 2x · 2x = 4x². Confira com x = 1: um quadrado de lado 2 tem área 4, não 2.',
  },
  {
    id: 'meios-opostos-somados',
    nome: 'soma os pedaços do meio de (x + 3)(x − 3) em vez de cancelar',
    causa: 'Decorou que os produtos notáveis têm um termo do meio e escreve um 6x, sem olhar o sinal de cada pedaço: 3x e −3x valem zero juntos.',
    exemplo: '(x + 3)(x − 3) = x² − 6x − 9 (ou x² + 6x − 9), em vez de x² − 9.',
    desmonte: 'No retângulo, um pedaço do meio é 3x e o outro é −3x: um põe o que o outro tira, e os dois se riscam. Confira com x = 10: 13 · 7 = 91 = 100 − 9.',
  },
  {
    id: 'mais-e-menos-nao-mudam-a-area',
    nome: 'acha que ganhar e perder o mesmo deixa a área igual',
    causa: 'Pensa que +3 num lado e −3 no outro se compensam, como numa soma. Esquece o canto: (+3) · (−3) = −9.',
    exemplo: '(x + 3)(x − 3) = x², em vez de x² − 9. Ou: 21 · 19 = 400, em vez de 399.',
    desmonte: 'Os dois pedaços do meio se cancelam, mas o canto fica: 3 por −3, uma área de −9. Um terreno de 10 por 10 tem 100 m²; de 13 por 7, só 91 m².',
  },
  {
    id: 'soma-vezes-diferenca-como-quadrado',
    nome: 'confunde (x + 3)(x − 3) com (x − 3)²',
    causa: 'Vê o x − 3 e escreve o resultado do quadrado da diferença, sem ver que o outro fator é x + 3, com o sinal trocado.',
    exemplo: '(x + 3)(x − 3) = x² − 6x + 9, em vez de x² − 9.',
    desmonte: 'Em (x − 3)², os dois pedaços do meio são −3x e se somam: −6x. Em (x + 3)(x − 3), um é 3x e o outro −3x: se cancelam. Confira com x = 10: 13 · 7 = 91, e 100 − 60 + 9 = 49.',
  },
]
