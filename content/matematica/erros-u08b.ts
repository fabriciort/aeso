import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 8, aulas 4 a 6: as operações com decimais
// (somados ao catálogo em erros.ts). Reaproveitados de outras unidades:
// esquece-que-desagrupou, subtrai-menor-do-maior, soma-no-lugar-de-multiplicar,
// multiplicar-sempre-aumenta, dividir-sempre-diminui, descarta-sobra,
// divide-o-menor-pelo-maior.
export const ERROS_U08B: ErroComum[] = [
  {
    id: 'alinha-decimais-pela-direita',
    nome: 'arma a conta de decimais alinhada pela direita',
    causa: 'Leva para os decimais o jeito de armar os inteiros, encostando os últimos algarismos. Assim, décimos ficam embaixo de centésimos, e a vírgula do resultado vai para um lugar qualquer.',
    exemplo: '3,5 + 1,25 armado como 35 + 125 = 160, e o resultado vira 1,60.',
    desmonte: 'Estimar antes: 3 kg e meio mais 1 kg e pouco é quase 5 kg, nunca 1,60. Na grade, 0,5 são 5 colunas (50 quadradinhos) e não 5 quadradinhos. Vírgula embaixo de vírgula põe cada casa embaixo da sua: 3,50 + 1,25 = 4,75.',
  },
  {
    id: 'parte-decimal-como-inteiro',
    nome: 'soma o que vem depois da vírgula como um número inteiro',
    causa: 'Vê o decimal como dois inteiros separados pela vírgula: soma a parte inteira com a inteira, e o "resto" com o "resto", sem ver que 5 décimos valem mais que 25 centésimos.',
    exemplo: '3,5 + 1,25 = 4,30, porque 3 + 1 = 4 e 5 + 25 = 30.',
    desmonte: 'Pintar na grade: 0,5 são 50 quadradinhos, 0,25 são 25, juntos dão 75. O 0,30 da resposta errada é menor que o 0,5 sozinho, e somar não pode dar menos. Completar com zero: 3,5 é 3,50.',
  },
  {
    id: 'copia-casas-que-faltam',
    nome: 'copia para o resultado as casas que só existem embaixo',
    causa: 'Na subtração, quando o número de cima tem menos casas depois da vírgula, trata as casas vazias como se não houvesse nada a fazer e desce os algarismos de baixo.',
    exemplo: 'Troco de R$ 10 para R$ 3,75: faz 10 − 3 = 7 e desce o 75, achando R$ 7,75.',
    desmonte: 'Completar com zeros: 10 é 10,00, e em cima há 0 centavos. 0 − 5 pede o empresta, como em 304 − 128. Conferir somando: 3,75 + 7,75 = 11,50, não 10.',
  },
  {
    id: 'casas-do-produto-como-na-soma',
    nome: 'põe no produto as casas de um fator só, como na soma',
    causa: 'Aprendeu que na soma a vírgula fica no mesmo lugar e faz igual na multiplicação, sem ver que décimo vezes décimo é centésimo.',
    exemplo: '0,3 × 0,4 = 1,2. Ou 2,4 × 6,15 = 147,60.',
    desmonte: 'Na grade, 0,3 × 0,4 é o cruzamento de 3 linhas com 4 colunas: 12 quadradinhos de 100, 0,12. E 1,2 é mais que a placa inteira, quando o pedaço cabe dentro dela. As casas se somam: 1 + 1 = 2.',
  },
  {
    id: 'multiplica-partes-separadas',
    nome: 'multiplica a parte inteira e a decimal separadas',
    causa: 'Trata o decimal como dois números colados pela vírgula e multiplica cada um, sem fazer o vai um da casa dos décimos para as unidades.',
    exemplo: '2 × 1,5 = 2,10, porque 2 × 1 = 2 e 2 × 5 = 10.',
    desmonte: 'Duas garrafas de 1,5 L: um litro e meio mais um litro e meio são 3 litros. Nas tiras de décimos, as duas metades formam um litro inteiro: 10 décimos viram 1 unidade. Faça a conta sem vírgula: 2 × 15 = 30, e 3,0.',
  },
  {
    id: 'resto-vira-decimal',
    nome: 'escreve o resto depois da vírgula',
    causa: 'Junta o quociente e o resto da divisão com uma vírgula, como se o resto fosse a parte decimal. Não vê que o resto ainda é para repartir.',
    exemplo: '7 ÷ 4 = 1 e sobram 3, então 1,3. Ou 10 ÷ 3 = 3,1.',
    desmonte: 'Conferir multiplicando: 4 × 1,30 = 5,20, não 7. Os 3 reais que sobram trocam-se por 30 moedas de 10 centavos, que ainda se repartem: 7 para cada, e sobram 20 centavos, 5 para cada. R$ 1,75.',
  },
  {
    id: 'dizima-como-exata',
    nome: 'acha que a dízima termina',
    causa: 'Para a conta depois de uma ou duas casas e trata o resultado como exato, sem ver que o resto se repete e a divisão não acaba.',
    exemplo: '1 ÷ 3 = 0,3. Ou 10 ÷ 3 = 3,33, exato.',
    desmonte: 'Conferir multiplicando: 3 × 0,3 = 0,9 e 3 × 3,33 = 9,99, falta sempre um pouco. Na chave, o resto 1 volta a cada linha. 0,333… é o valor exato; 0,3 e 0,33 são aproximações.',
  },
]
