import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 14, parte B: aulas 4 e 5, distributiva com
// letras e traduzir frases (somados ao catálogo em erros.ts). Reaproveitados:
// distributiva-parcial e soma-no-lugar-de-multiplicar (unidade 3, o
// 2(x + 3) = 2x + 3 é o mesmo 6 × 23 = 6 × 20 + 3) e ignora-prioridade
// (unidade 5, a corrida calculada como (5 + 2) × 8).
export const ERROS_U14B: ErroComum[] = [
  {
    id: 'distributiva-sinal-do-negativo',
    nome: 'erra o sinal ao distribuir com um menos',
    causa: 'Multiplica cada termo, mas cuida só dos números: esquece que o menos vai junto do termo, ou que menos vezes menos dá mais (unidade 12).',
    exemplo: '−2(x − 3) = −2x − 6, em vez de −2x + 6. Ou: 3(x − 2) = 3x + 6.',
    desmonte: 'Confira com um número: com x = 5, −2(5 − 3) = −2 × 2 = −4, e −2 × 5 + 6 = −4, mas −2 × 5 − 6 = −16. Nos azulejos, tirar dois montes de x − 3 tira dois x e devolve seis 1.',
  },
  {
    id: 'evidencia-esquece-termo',
    nome: 'põe em evidência e não divide todos os termos',
    causa: 'Tira o número comum da frente, mas copia um dos termos como estava, ou deixa um termo sumir quando ele vira 1.',
    exemplo: '4x + 8 = 4(x + 8), em vez de 4(x + 2). Ou: 3x + 3 = 3(x), em vez de 3(x + 1).',
    desmonte: 'Distribua de volta para conferir: 4(x + 8) = 4x + 32, não 4x + 8. No retângulo de área 4x + 8 e altura 4, a base é x + 2: 4 × 2 = 8.',
  },
  {
    id: 'traduz-parenteses-errados',
    nome: 'põe (ou esquece) parênteses ao traduzir uma frase',
    causa: 'Escreve as palavras na ordem em que aparecem, sem ver qual conta a frase manda fazer primeiro.',
    exemplo: '"O dobro de um número, menos 3" escrito 2(x − 3), em vez de 2x − 3. Ou: "a soma de um número com 5, vezes 2" escrito x + 5 · 2.',
    desmonte: 'Faça com um número, como a frase manda: o dobro de 10, menos 3, é 20 − 3 = 17. Já 2(10 − 3) = 14 tira o 3 antes de dobrar: é "o dobro da diferença entre um número e 3".',
  },
  {
    id: 'inverte-ordem-da-subtracao',
    nome: 'escreve "3 a menos que x" como 3 − x',
    causa: 'Copia a frase na ordem das palavras: o 3 aparece antes, então vai na frente da conta.',
    exemplo: '"3 a menos que x" escrito 3 − x, em vez de x − 3. Ou: "a diferença entre um número e 3" escrito 3 − x.',
    desmonte: 'Com x = 40: 3 anos a menos que 40 anos são 37 anos, x − 3. Já 3 − 40 dá −37, que não é idade de ninguém.',
  },
  {
    id: 'confunde-dobro-e-metade',
    nome: 'troca o dobro pela metade',
    causa: 'Lembra que as duas palavras têm a ver com o 2, mas não qual conta cada uma faz.',
    exemplo: '"A metade de x" escrita 2x, em vez de x/2. Ou: "o dobro de x" escrito x/2.',
    desmonte: 'Com x = 10: a metade de 10 é 5, e 2 × 10 = 20 é o dobro. A metade é menor que o número; o dobro, maior.',
  },
  {
    id: 'vezes-como-mais',
    nome: 'escreve "o triplo" como "3 a mais"',
    causa: 'Junta o número com a letra por uma soma, sem ver se a frase pede vezes ou mais.',
    exemplo: '"O triplo de um número" escrito x + 3, em vez de 3x. Ou: "3 a mais que x" escrito 3x.',
    desmonte: 'Com x = 10: o triplo é 3 × 10 = 30, e 3 a mais é 10 + 3 = 13. Nos azulejos, 3x são três barras; x + 3 é uma barra e três quadradinhos.',
  },
  {
    id: 'esquece-valor-fixo',
    nome: 'traduz só a parte que muda e esquece o valor fixo',
    causa: 'Vê o "por quilômetro" e multiplica, mas esquece o valor que se paga de qualquer jeito, mesmo com 0 km.',
    exemplo: 'R$ 5 mais R$ 2 por km, com 8 km: 2 × 8 = R$ 16, em vez de 5 + 2 × 8 = R$ 21.',
    desmonte: 'Com 0 km, a corrida já custa R$ 5: é o valor de entrar no carro. Na tabela, a primeira coluna começa em 5, e cada km soma R$ 2.',
  },
]
