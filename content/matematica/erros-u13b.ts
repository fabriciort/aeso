import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 13, parte B: aulas 4 a 6, notação
// científica, raiz quadrada, estimar raízes e raiz cúbica (somados ao
// catálogo em erros.ts). Reaproveitados: confunde-area-perimetro e
// confunde-m3-com-litro (unidade 9), multiplica-partes-separadas e
// acrescenta-zeros-no-decimal (unidades 8 e 9).
export const ERROS_U13B: ErroComum[] = [
  {
    id: 'expoente-conta-os-zeros',
    nome: 'conta os zeros ou os algarismos no lugar das casas que a vírgula anda',
    causa: 'Decorou "o expoente é o número de zeros" e conta os zeros que aparecem (ou todos os algarismos), sem ver quantas casas a vírgula andou.',
    exemplo: '150.000.000 = 1,5 × 10⁷ (contou 7 zeros). Ou: 0,00007 = 7 × 10⁻⁴ (contou só os zeros depois da vírgula). Ou: 3,2 × 10⁴ = 320.000.',
    desmonte: 'No quadro, cada casa é uma potência de 10. Em 150.000.000, o 1 está na casa do 10⁸: a vírgula anda 8 casas para ficar depois dele. O 5 também ocupa uma casa, e ela conta.',
  },
  {
    id: 'expoente-com-sinal-trocado',
    nome: 'troca o sinal do expoente',
    causa: 'Conta as casas certo, mas não pensa se o número é grande ou pequeno: põe expoente positivo num número menor que 1, ou negativo num número grande.',
    exemplo: '0,00007 = 7 × 10⁵. Ou: 7 × 10⁻⁵ = 700.000.',
    desmonte: '7 × 10⁵ = 700.000, muito mais que um fio de cabelo. Multiplicar por 10 anda a vírgula para a direita e o número cresce; o expoente negativo divide por 10 e anda para a esquerda: 7 × 10⁻⁵ = 0,00007.',
  },
  {
    id: 'notacao-fora-de-1-a-10',
    nome: 'deixa o primeiro número fora do intervalo de 1 a 10',
    causa: 'Escreve um produto certo por uma potência de 10, mas para a vírgula no lugar errado: a conta vale, só que não está em notação científica.',
    exemplo: '150.000.000 = 15 × 10⁷. Ou: 0,00007 = 0,7 × 10⁻⁴.',
    desmonte: '15 × 10⁷ vale o mesmo, mas o 15 passou de 10. A vírgula vai logo depois do primeiro algarismo que não é zero: 1,5 × 10⁸. Assim, dois números se comparam pelo expoente.',
  },
  {
    id: 'raiz-e-a-metade',
    nome: 'acha que a raiz quadrada é a metade',
    causa: 'Confunde "ao quadrado" com "vezes 2" e desfaz dividindo por 2: o lado de um quadrado de 36 m² seria 18.',
    exemplo: '√36 = 18. Ou: √100 = 50.',
    desmonte: 'Um quadrado de lado 18 tem 18 × 18 = 324 quadradinhos, muito mais que 36. A raiz é o lado: que número vezes ele mesmo dá 36? 6 × 6 = 36.',
  },
  {
    id: 'raiz-da-soma-separada',
    nome: 'tira a raiz de cada parcela de uma soma',
    causa: 'Acha que a raiz se distribui pela soma, como a multiplicação se distribui: √(9 + 16) viraria √9 + √16.',
    exemplo: '√(9 + 16) = 3 + 4 = 7.',
    desmonte: 'Primeiro a soma, debaixo da raiz: 9 + 16 = 25, e √25 = 5. Confira o 7: 7 × 7 = 49, não 25. Um quadrado de 3 por 3 e outro de 4 por 4 não formam um de 7 por 7.',
  },
  {
    id: 'estima-com-os-quadrados',
    nome: 'responde os quadrados vizinhos no lugar das raízes',
    causa: 'Acha os quadrados perfeitos em volta do número, mas responde esses quadrados, e não os seus lados.',
    exemplo: '√20 fica entre 16 e 25.',
    desmonte: 'O 20 está entre 16 e 25. A raiz é o lado: o quadrado de 16 tem lado 4 e o de 25 tem lado 5. √20 fica entre 4 e 5.',
  },
  {
    id: 'raiz-cubica-e-dividir-por-3',
    nome: 'acha que a raiz cúbica é dividir por 3',
    causa: 'Vê o 3 do "cubo" e divide por 3, como quem acha que a raiz quadrada é a metade.',
    exemplo: '∛27 = 9. Ou: ∛1.000 = 333.',
    desmonte: 'O cubo multiplica três vezes: 9 × 9 × 9 = 729, não 27. O lado do cubo de 27 cubinhos é 3, porque 3 × 3 × 3 = 27. O cubo de 1.000 dos blocos tem 10 cubinhos em cada lado.',
  },
]
