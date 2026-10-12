import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 5 (somados ao catálogo em erros.ts).
// Expressões numéricas: a ordem das operações, os parênteses, o sinal de
// igual e a calculadora.
export const ERROS_U05: ErroComum[] = [
  {
    id: 'ignora-prioridade',
    nome: 'resolve da esquerda para a direita, sem a prioridade',
    causa: 'Lê a conta como um texto, da esquerda para a direita, e faz cada operação na ordem em que aparece, sem saber que × e ÷ vêm antes de + e −.',
    exemplo: '2 + 3 × 4: faz 2 + 3 = 5 e depois 5 × 4, achando 20 em vez de 14.',
    desmonte: 'Uma situação que já tem resposta: 2 cafés de R$ 3 e um pão de R$ 5 dão R$ 11. Escrita como 5 + 2 × 3, a conta da esquerda para a direita daria R$ 21, o preço de 7 cafés.',
  },
  {
    id: 'soma-antes-de-subtrair',
    nome: 'faz a soma antes da subtração',
    causa: 'Acha que a adição tem prioridade sobre a subtração (ou decorou uma ordem fixa), e não que as duas têm a mesma prioridade e se resolvem da esquerda para a direita.',
    exemplo: '10 − 3 + 2: faz 3 + 2 = 5 e depois 10 − 5, achando 5 em vez de 9.',
    desmonte: 'Em dinheiro: você tem R$ 10, gasta R$ 3 e depois ganha R$ 2. Fica com R$ 9. Os R$ 2 entram no bolso, não se juntam ao que saiu.',
  },
  {
    id: 'multiplica-antes-de-dividir',
    nome: 'faz a multiplicação antes da divisão',
    causa: 'Acha que × vem antes de ÷, quando as duas têm a mesma prioridade e se resolvem da esquerda para a direita.',
    exemplo: '12 ÷ 2 × 3: faz 2 × 3 = 6 e depois 12 ÷ 6, achando 2 em vez de 18.',
    desmonte: '12 pães divididos em 2 cestas dão 6 por cesta. Três cestas assim têm 18 pães. A conta segue a ordem da história: primeiro dividir, depois multiplicar.',
  },
  {
    id: 'ignora-parenteses',
    nome: 'ignora ou esquece os parênteses',
    causa: 'Aplica a prioridade de × e ÷ sem olhar os parênteses, ou escreve uma conta que precisa deles sem pôr os parênteses.',
    exemplo: '(2 + 3) × 4: faz 3 × 4 primeiro e acha 14 em vez de 20. Ou escreve 30 + 15 ÷ 3 para dividir R$ 45 entre 3 pessoas.',
    desmonte: 'O retângulo de 4 linhas por 2 + 3 colunas: são 4 × 5 = 20 quadradinhos. Sem os parênteses, sobra só 2 + 12 = 14, um pedaço do retângulo.',
  },
  {
    id: 'igual-encadeado',
    nome: 'encadeia contas com o sinal de igual',
    causa: 'Usa o "=" como "e o resultado é" ou "e depois", uma seta para o próximo passo, e não como "vale o mesmo que".',
    exemplo: 'Para somar 3 e 2 e dobrar, escreve 3 + 2 = 5 × 2 = 10. O primeiro "=" diz que 5 vale 10.',
    desmonte: 'Ler cada "=" sozinho: 3 + 2 = 5 × 2 diz que 5 é igual a 10. A escrita certa é (3 + 2) × 2, com cada passo numa linha nova: = 5 × 2, = 10.',
  },
  {
    id: 'calculadora-simples-sem-prioridade',
    nome: 'confia na calculadora simples sem pensar na ordem',
    causa: 'Digita a expressão na ordem em que está escrita numa calculadora que faz conta a conta, e aceita o visor sem estimar.',
    exemplo: 'Digita 2 + 3 × 4 = numa calculadora de balcão e aceita 20.',
    desmonte: 'Mostrar o visor tecla a tecla: ao apertar ×, ele já mostra 5. A calculadora somou antes. Estimar: 48 + 52 × 3 fica perto de 200, e o visor mostra 300.',
  },
]
