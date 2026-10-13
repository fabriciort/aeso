import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 12, parte B: aulas 4 e 5, multiplicar e
// dividir com sinais e os números racionais (somados ao catálogo em
// erros.ts). Reaproveitado: soma-no-lugar-de-multiplicar (unidade 3).
export const ERROS_U12B: ErroComum[] = [
  {
    id: 'sinais-diferentes-da-positivo',
    nome: 'esquece o sinal quando um dos números é negativo',
    causa: 'Multiplica ou divide só os números, sem olhar os sinais, e escreve o resultado como se fosse positivo.',
    exemplo: '3 × (−2) = 6. Ou: (−6) ÷ 3 = 2. Ou: três tarifas de R$ 1,50 "somam R$ 4,50 ao saldo".',
    desmonte: 'Três dívidas de R$ 2 não viram dinheiro no bolso: na reta, são três saltos de 2 para a esquerda, até o −6. Sinais diferentes, o produto é negativo.',
  },
  {
    id: 'sinais-iguais-da-negativo',
    nome: 'acha que menos vezes menos dá menos',
    causa: 'Vê dois sinais de menos e acha que o resultado tem de ser "ainda mais negativo", ou não conhece o padrão que leva ao positivo.',
    exemplo: '(−2) × (−3) = −6. Ou: (−6) ÷ (−3) = −2.',
    desmonte: 'A tabela do padrão: 1 × (−2) = −2, 0 × (−2) = 0. Cada passo para a esquerda sobe 2, então (−1) × (−2) = 2. Na divisão, confira de volta: (−3) × 2 = −6.',
  },
  {
    id: 'regra-dos-sinais-na-soma',
    nome: 'usa "menos com menos dá mais" na soma',
    causa: 'Decorou a regra dos sinais como uma regra geral e a aplica a qualquer conta com dois sinais de menos, inclusive na soma.',
    exemplo: '(−2) + (−3) = 5. Ou, no extrato: −12,50 + (−4,50) vira −12,50 + 4,50 = −8.',
    desmonte: 'Somar duas dívidas é ficar devendo mais: na reta, dois saltos para a esquerda, até o −5. A regra dos sinais vale só para multiplicar e dividir.',
  },
  {
    id: 'compara-decimais-negativos-sem-o-sinal',
    nome: 'compara decimais negativos como se fossem positivos',
    causa: 'Olha só os algarismos depois do menos e escolhe o que parece maior, sem lembrar que, do lado negativo, quem está mais longe do zero é menor.',
    exemplo: 'Diz que −0,75 é maior que −0,5, porque 0,75 > 0,5 (ou porque 75 > 5). Ou que −0,5 é maior que −0,25.',
    desmonte: 'Dever R$ 0,75 é pior que dever R$ 0,50. Na reta, −0,75 fica à esquerda do −0,5: mais longe do zero, menor.',
  },
  {
    id: 'menos-no-numerador-e-no-denominador',
    nome: 'acha que menos em cima e embaixo deixa a fração negativa',
    causa: 'Vê dois sinais de menos na fração e acha que o número é negativo, sem lembrar que a fração é uma divisão e que sinais iguais dão positivo.',
    exemplo: '(−3)/(−4) = −0,75. Ou: escreve −3/4 com um menos em cima e outro embaixo, achando que é o mesmo número.',
    desmonte: 'A fração é uma divisão: (−3) ÷ (−4). Sinais iguais, resultado positivo: 0,75. O menos de −3/4 vai num lugar só: na frente, em cima ou embaixo.',
  },
  {
    id: 'decimal-negativo-sem-sinal',
    nome: 'passa do zero e esquece o sinal',
    causa: 'Faz a conta com os números sem os sinais, o maior menos o menor, e não percebe que o resultado passou para o lado negativo.',
    exemplo: 'Estava 1,5 °C e caiu 2,5 °C: "agora está 1 °C". Ou: saldo de R$ 20 e um boleto de R$ 32,50: "sobram R$ 12,50".',
    desmonte: 'Na reta, a queda de 2,5 passa do zero: 1,5 até o 0, e mais 1 abaixo dele. O termômetro marca −1 °C. Quem paga mais do que tem fica devendo.',
  },
]
