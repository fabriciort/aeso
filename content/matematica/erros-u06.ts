import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 6 (somados ao catálogo em erros.ts).
// Reaproveitado de outras unidades: resto-maior-que-divisor.
export const ERROS_U06: ErroComum[] = [
  {
    id: 'confunde-multiplo-divisor',
    nome: 'troca múltiplo e divisor',
    causa: 'As duas palavras falam da mesma divisão sem resto, e o aluno não guarda quem é o pequeno e quem é o grande.',
    exemplo: 'Diz que 12 é divisor de 3, ou que 2 é múltiplo de 8.',
    desmonte: 'Os 12 azulejos em fileiras de 3: o 3 é a fileira, que cabe em 12 (divisor). O 12 é o painel, que se forma com saltos de 3 (múltiplo). 3 fileiras não formam 12 em 3.',
  },
  {
    id: 'esquece-divisores-extremos',
    nome: 'esquece o 1 e o próprio número entre os divisores',
    causa: 'Acha que 1 e o próprio número "não contam" porque não quebram nada, e lista só os do meio.',
    exemplo: 'Os divisores de 12 viram 2, 3, 4 e 6, e o 12 fica com 4 divisores.',
    desmonte: 'Uma fileira só de 12 azulejos também é um retângulo (1 × 12), e 12 fileiras de 1 também. Os divisores vêm em pares, e o par 1 × 12 é o primeiro deles.',
  },
  {
    id: 'regra-no-algarismo-errado',
    nome: 'usa a regra de divisibilidade no algarismo errado',
    causa: 'Decora "olhe o algarismo" sem saber por quê: olha o primeiro algarismo para 2 e 5, ou o último para 3 e 9.',
    exemplo: '512 é divisível por 5 porque começa com 5. 27 não é divisível por 3 porque termina em 7. 13 é divisível por 3 porque termina em 3.',
    desmonte: 'Os blocos: placas e barras de 10 já se dividem por 2, 5 e 10, então só os cubos soltos decidem. Para 3 e 9, cada barra deixa 1 cubo, então todos os algarismos contam: 2 + 7 = 9.',
  },
  {
    id: 'confunde-3-e-9',
    nome: 'acha que divisível por 3 é divisível por 9',
    causa: 'As duas regras usam a soma dos algarismos, e o aluno para no primeiro "deu certo".',
    exemplo: '1.236 é divisível por 9 porque 1 + 2 + 3 + 6 = 12, que é divisível por 3.',
    desmonte: 'O 12 não é múltiplo de 9. Contraexemplo curto: 6 é divisível por 3 e não por 9. Todo múltiplo de 9 é múltiplo de 3, mas não o contrário.',
  },
  {
    id: 'um-e-primo',
    nome: 'acha que 1 é primo',
    causa: 'Lê "só se divide por 1 e por ele mesmo" e, como o 1 só se divide por 1, acha que ele cabe na definição.',
    exemplo: 'Diz que 1 é primo, ou fatora 12 como 1 × 2 × 2 × 3.',
    desmonte: 'Primo tem exatamente dois divisores. O 1 tem um só. E o 1 não muda nada num produto: se valesse, 12 teria infinitas fatorações (1 × 1 × 2 × 2 × 3…).',
  },
  {
    id: 'primo-e-impar',
    nome: 'confunde primo com ímpar',
    causa: 'Os primeiros primos depois do 2 são ímpares (3, 5, 7), e o aluno generaliza: ímpar vira primo, e par vira composto.',
    exemplo: 'Diz que 9, 15 ou 21 são primos, ou que 2 não é primo porque é par.',
    desmonte: 'Montar 9 quadradinhos: dá um quadrado 3 × 3, então 9 não é primo. Montar 2: só uma fileira de 2, então 2 é primo, o único primo par.',
  },
  {
    id: 'fatoracao-com-composto',
    nome: 'para a fatoração com um fator que ainda se quebra',
    causa: 'Acha que qualquer produto que dá o número é a fatoração, e para no primeiro par.',
    exemplo: '60 = 4 × 15, e para aí. Ou diz que o maior primo de 60 é 30.',
    desmonte: 'Perguntar de cada fator: ele ainda forma mais de um retângulo? 4 = 2 × 2 e 15 = 3 × 5. Só para quando todos são primos: 60 = 2 × 2 × 3 × 5.',
  },
  {
    id: 'esquece-fator-repetido',
    nome: 'escreve cada primo uma vez só',
    causa: 'Lista os primos que aparecem, como numa lista de divisores, e esquece que um primo pode entrar mais de uma vez.',
    exemplo: '60 = 2 × 3 × 5.',
    desmonte: 'Multiplicar de volta: 2 × 3 × 5 = 30, não 60. Falta um 2. A fatoração tem de dar o número.',
  },
  {
    id: 'mmc-e-o-produto',
    nome: 'acha que o MMC é sempre o produto',
    causa: 'O produto é sempre um múltiplo comum, e o aluno não procura um menor.',
    exemplo: 'mmc(4, 6) = 24.',
    desmonte: 'Os saltos na reta: os de 4 e os de 6 já se encontram no 12, antes do 24. O 24 é o segundo encontro.',
  },
  {
    id: 'confunde-mmc-mdc',
    nome: 'troca MMC e MDC',
    causa: 'Os nomes são parecidos e as duas contas usam os mesmos números. O aluno faz a conta sem perguntar o que a situação pede.',
    exemplo: 'Ônibus a cada 4 e 6 minutos se encontram em 2 minutos. Fitas de 12 m e 18 m são cortadas em pedaços de 36 m.',
    desmonte: 'Perguntar se a resposta cabe na situação: pedaços de 36 m não saem de uma fita de 12 m. Encontro no futuro é MMC, maior ou igual aos números. Cortar em partes iguais é MDC, menor ou igual a eles.',
  },
  {
    id: 'mdc-nao-e-o-maior',
    nome: 'acha um divisor comum, mas não o maior',
    causa: 'Para no primeiro número que divide os dois, quase sempre o 2, sem testar se há um maior.',
    exemplo: 'mdc(12, 18) = 2.',
    desmonte: 'Pedaços de 2 m servem, mas pedaços de 6 m também servem e são maiores. Listar os divisores comuns (1, 2, 3, 6) e pegar o último.',
  },
]
