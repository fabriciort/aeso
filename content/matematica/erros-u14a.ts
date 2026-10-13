import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 14, aulas 1 a 3: uma letra no lugar de um
// número, valor numérico e termos semelhantes (somados ao catálogo em
// erros.ts). Reaproveitados de outras unidades: soma-no-lugar-de-multiplicar,
// ignora-prioridade, esquece-sinal-do-resultado, tirar-negativo-subtrai,
// potencia-multiplica-base-pelo-expoente, potencia-sinal-fora-dos-parenteses
// e confunde-area-perimetro.
export const ERROS_U14A: ErroComum[] = [
  {
    id: 'letra-como-objeto',
    nome: 'lê a letra como um objeto',
    causa: 'Lê a letra como a abreviação de uma coisa (a de abacaxi, m de maçã) e não como um número que ainda não sabemos. Então 3a vira "3 abacaxis", e a conta perde o sentido.',
    exemplo: 'Um abacaxi custa a reais; acha que 3a quer dizer "3 abacaxis", e não o preço de 3 abacaxis (3 × a reais).',
    desmonte: 'Trocar a letra por um número de verdade: se o abacaxi custa R$ 4, 3a é 3 × 4 = 12, o preço em reais. A letra guarda o número (o preço), nunca o abacaxi.',
  },
  {
    id: 'junta-algarismos-com-a-letra',
    nome: 'cola o número da frente no valor da letra',
    causa: 'Troca a letra pelo número mas esquece que a escrita junta (3x) quer dizer multiplicação. Escreve os algarismos lado a lado, como se 3x fosse um número de dois algarismos.',
    exemplo: '3x com x = 5 vira 35 (é 3 × 5 = 15); 2x + 3 com x = 5 vira 25 + 3 = 28 (é 13).',
    desmonte: '3x é x + x + x: três barras de 5, que dão 15. Ao trocar a letra, o sinal de vezes que estava escondido volta: 3x = 3 × 5. Escrever 3 × 5, nunca 35.',
  },
  {
    id: 'letra-negativa-sem-parenteses',
    nome: 'troca a letra por um negativo sem parênteses',
    causa: 'Põe o número negativo no lugar da letra sem parênteses. O menos do número se mistura com a conta e vira uma subtração.',
    exemplo: '3x com x = −2 escrito 3 − 2 = 1 (é 3 × (−2) = −6); 5 − 2x com x = −3 escrito 5 − 2 − 3 = 0 (é 11).',
    desmonte: 'Escrever primeiro o lugar da letra com parênteses vazios, 3 × ( ), e só depois pôr o −2 dentro. 3 × (−2) são três dívidas de 2: −6.',
  },
  {
    id: 'junta-termos-nao-semelhantes',
    nome: 'junta termos que não são semelhantes',
    causa: 'Vê uma soma e soma todos os números que aparecem, sem olhar se a parte com letra é a mesma. Acha que a resposta precisa ser um termo só.',
    exemplo: '2x + 3 = 5x; 4x + 2 = 6; 3x² + 2x = 5x².',
    desmonte: 'Com os azulejos: 2 barras e 3 quadradinhos não viram 5 barras. Com 10 parafusos por caixa, 2 caixas e 3 soltos são 23 parafusos; 5 caixas seriam 50. 2x + 3 já está pronto.',
  },
  {
    id: 'x-vezes-x-da-2x',
    nome: 'acha que x · x é 2x',
    causa: 'Conta quantas vezes o x aparece e escreve 2x, como na soma. Não separa juntar (somar) de multiplicar.',
    exemplo: 'x · x = 2x (é x²); 3x · x = 4x (é 3x²).',
    desmonte: 'O quadrado de lado x: x · x é a área dele, x², uma peça nova. 2x são duas barras. Com x = 5: x · x = 25, e 2x = 10.',
  },
  {
    id: 'x-mais-x-da-x2',
    nome: 'acha que x + x é x²',
    causa: 'Vê duas letras iguais e lembra do "ao quadrado". Confunde somar o mesmo número com multiplicar o número por ele mesmo.',
    exemplo: 'x + x = x² (é 2x); a + a + a = a³ (é 3a); 4x + 2x = 6x² (é 6x).',
    desmonte: 'Duas barras lado a lado são 2x, ainda barras: nenhum quadrado grande aparece. Com x = 5: x + x = 10, e x² = 25.',
  },
  {
    id: 'letra-sozinha-sem-o-um',
    nome: 'não conta a letra sozinha como 1',
    causa: 'Não vê número na frente do x e acha que ele não conta, ou que some quando é tirado. Esquece que x é 1x, uma barra.',
    exemplo: 'x + 3x = 3x (é 4x); 5x − x = 5 (é 4x); 5x − x = 5x.',
    desmonte: 'Uma barra é x, e x é 1x. Três barras e mais uma são quatro barras: x + 3x = 4x. Tirar uma barra de cinco deixa quatro barras: 5x − x = 4x, ainda com a letra.',
  },
]
