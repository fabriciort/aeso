import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 1 de Álgebra e Funções, parte A: monômios e
// polinômios, somar e subtrair polinômios, multiplicar monômios (somados ao
// catálogo em erros.ts). Reaproveitados: junta-termos-nao-semelhantes,
// letra-sozinha-sem-o-um e x-mais-x-da-x2 (Linguagem algébrica),
// esquece-sinal-do-resultado e sinais-diferentes-da-positivo (negativos),
// potencia-multiplica-expoentes (potências) e soma-no-lugar-de-multiplicar.
export const ERROS_AF_U01A: ErroComum[] = [
  {
    id: 'coeficiente-e-o-expoente',
    nome: 'lê o expoente como o coeficiente',
    causa: 'Procura "o número do termo" e pega o primeiro que vê, o expoente pequeno lá em cima. Não separa o número que conta as peças (o coeficiente) do número que diz o tipo da peça (o expoente).',
    exemplo: 'Diz que o coeficiente de x² é 2 (é 1); que 3x² tem coeficiente 2 (é 3).',
    desmonte: 'Nos azulejos, x² é um quadrado grande só: o coeficiente conta os quadrados, 1. O 2 de cima diz que a peça é x · x, o quadrado. Com x = 10: x² = 100, e 2x = 20.',
  },
  {
    id: 'grau-pelo-primeiro-termo',
    nome: 'acha o grau olhando só o primeiro termo',
    causa: 'Lê o polinômio como está escrito e acha que o primeiro termo manda. Não procura o maior expoente quando o polinômio está fora de ordem.',
    exemplo: 'O grau de 4x + 2x³ − 7 é 1 (é 3); o de 5 + x² é 0 (é 2).',
    desmonte: 'Arrume do maior grau para o menor: 2x³ + 4x − 7. O grau é o maior expoente da letra, esteja ele onde estiver: 3.',
  },
  {
    id: 'grau-pelo-coeficiente',
    nome: 'acha o grau pelo maior número da frente',
    causa: 'Confunde o tamanho do número com o grau. Pega o maior coeficiente (ou o número solto) em vez do maior expoente.',
    exemplo: 'O grau de 4x + 2x³ − 7 é 7 (é 3); o de 9x + x² é 9 (é 2).',
    desmonte: 'O grau olha a letra, não o número da frente: 9x são nove barras, ainda barras (grau 1). Um x² sozinho é um quadrado grande: grau 2.',
  },
  {
    id: 'termo-perde-o-sinal',
    nome: 'muda o termo de lugar sem o sinal dele',
    causa: 'Vê o sinal como uma separação entre os termos, e não como parte do termo que vem depois. Ao mudar a ordem, deixa o sinal no lugar ou o perde.',
    exemplo: '3 − 2x + x² arrumado como x² + 2x − 3 (é x² − 2x + 3); o coeficiente de x em 5x² − x é 1 (é −1).',
    desmonte: 'O menos é a cor da peça: −2x são duas barras vermelhas, e elas continuam vermelhas em qualquer lugar da fila. Confira com x = 1: 3 − 2 + 1 = 2, mas 1 + 2 − 3 = 0.',
  },
  {
    id: 'menos-so-no-primeiro',
    nome: 'troca só o sinal do primeiro termo do parêntese',
    causa: 'Tira o parêntese e aplica o menos só ao termo que está colado nele. Esquece que o menos vale para o parêntese inteiro.',
    exemplo: '−(x² − 2x + 1) = −x² − 2x + 1 (é −x² + 2x − 1); (3x + 5) − (x + 2) = 2x + 7 (é 2x + 3).',
    desmonte: 'Nos azulejos, o menos na frente do monte vira todas as peças dele, não só a primeira. Confira com x = 2: x² − 2x + 1 vale 1, então −(x² − 2x + 1) vale −1; −x² − 2x + 1 dá −7.',
  },
  {
    id: 'ignora-o-menos-do-parentese',
    nome: 'tira o parêntese sem trocar sinal nenhum',
    causa: 'Trata o parêntese como enfeite e copia os termos como estão. A subtração vira uma soma.',
    exemplo: '(2x² + x + 3) − (x² − 2x + 1) escrito 2x² + x + 3 + x² − 2x + 1, que dá 3x² − x + 4 (é x² + 3x + 2).',
    desmonte: 'Subtrair é tirar o monte inteiro, e o menos vira todas as peças dele. Com x = 2: 13 − 1 = 12, e x² + 3x + 2 = 12, mas 3x² − x + 4 = 14.',
  },
  {
    id: 'soma-coeficientes-na-multiplicacao',
    nome: 'soma os números da frente ao multiplicar monômios',
    causa: 'Lembra que, com termos semelhantes, os números da frente se somam, e faz o mesmo na multiplicação. Mistura juntar com multiplicar.',
    exemplo: '3x · 4x = 7x² (é 12x²); 2x² · 5x = 7x³ (é 10x³).',
    desmonte: 'O retângulo de 3x por 4x, partido em x por x, tem 3 fileiras de 4 quadrados: 12 quadrados x², não 7. Com x = 1: 3 · 4 = 12.',
  },
  {
    id: 'potencia-soma-expoentes-na-adicao',
    nome: 'soma os expoentes numa adição',
    causa: 'Usa a regra do produto (os expoentes se somam) também na soma. Acha que x² e x³ viram uma peça só.',
    exemplo: 'x² + x³ = x⁵ (não se junta); 2x² + 3x² = 5x⁴ (é 5x²).',
    desmonte: 'x² e x³ são peças diferentes: não se juntam. Com x = 2: x² + x³ = 4 + 8 = 12, e x⁵ = 32. Os expoentes só se somam quando os fatores se multiplicam: x² · x³ = x⁵.',
  },
]
