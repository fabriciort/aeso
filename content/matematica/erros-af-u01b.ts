import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 1 de Álgebra e Funções, parte B: aulas 4 a
// 6, monômio vezes polinômio, polinômio vezes polinômio e dividir por um
// monômio (somados ao catálogo em erros.ts). Reaproveitados:
// distributiva-parcial (unidade 3: o monômio de fora multiplica só o primeiro
// termo), distributiva-sinal-do-negativo (unidade 14), sinais-iguais-da-negativo
// e sinais-diferentes-da-positivo (unidade 12), x-vezes-x-da-2x e
// junta-termos-nao-semelhantes (unidade 14), soma-no-lugar-de-multiplicar
// (unidade 3), potencia-soma-expoentes-na-divisao e potencia-multiplica-expoentes
// (unidade 13: x³ ÷ x = x⁴, ou x³ ÷ x = x³ dividindo os expoentes).
export const ERROS_AF_U01B: ErroComum[] = [
  {
    id: 'esquece-a-letra-no-produto',
    nome: 'multiplica os números e perde a letra',
    causa: 'Faz a conta dos números e esquece que a letra do monômio de fora também multiplica: o pedaço do número fica sem o x.',
    exemplo: '3x(x + 4) = 3x² + 12, em vez de 3x² + 12x. Ou: 2x · (−3x) = −6x, em vez de −6x².',
    desmonte: 'No retângulo, o pedaço do 4 tem 3x de fundo: a área é 3x · 4 = 12x, uma faixa que cresce junto com o x. Confira com x = 2: 6 · 6 = 36, e 12 + 24 = 36, mas 12 + 12 = 24.',
  },
  {
    id: 'produto-so-das-pontas',
    nome: 'multiplica só as pontas de dois binômios',
    causa: 'Copia o jeito de 2(x + 3) e multiplica o primeiro com o primeiro e o último com o último. Esquece os pedaços do meio do retângulo (ou um deles).',
    exemplo: '(x + 2)(x + 3) = x² + 6, em vez de x² + 5x + 6. Ou: (x + 2)(x + 3) = x² + 3x + 6.',
    desmonte: 'O retângulo de (x + 2) por (x + 3) tem quatro pedaços: x², 3x, 2x e 6. Confira com x = 1: 3 · 4 = 12, e x² + 6 dá só 7.',
  },
  {
    id: 'divide-so-o-primeiro',
    nome: 'divide só o primeiro termo pelo monômio',
    causa: 'Divide o primeiro termo e copia os outros como estavam, como se a divisão pegasse só o que vem logo depois do parêntese.',
    exemplo: '(6x² + 9x) ÷ 3x = 2x + 9x, em vez de 2x + 3.',
    desmonte: 'Multiplique de volta: 3x(2x + 9x) = 6x² + 27x², não 6x² + 9x. No retângulo, cada pedaço da área tem o mesmo fundo 3x: cada um se divide por 3x.',
  },
]
