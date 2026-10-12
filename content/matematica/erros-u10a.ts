import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 10, aulas 1 a 3: razão, escala, proporção e
// regra de três (somados ao catálogo em erros.ts). Reaproveitados de outras
// unidades: muda-so-um-termo, converte-no-sentido-errado,
// fator-de-conversao-errado.
export const ERROS_U10A: ErroComum[] = [
  {
    id: 'pensa-aditivamente',
    nome: 'compara ou aumenta somando, quando a relação é de multiplicar',
    causa: 'Vê "a receita cresceu" e soma o mesmo número nas duas quantidades. Compara pela diferença (quanto falta), e não pela divisão (quantas vezes cabe).',
    exemplo: '1 copo de suco para 3 de água vira 2 para 4 ("um a mais em cada"); 2 xícaras para 3 ovos vira 8 para 9; 4 cm no mapa de 1 cm = 50 km viram 54 km.',
    desmonte: 'Pôr as duas jarras lado a lado na barra: 2 de suco em 6 copos é bem mais forte que 1 em 4. Na tabela de proporção, a diferença muda de coluna para coluna (2, 4, 6…), e a divisão fica igual (3 ÷ 1 = 6 ÷ 2 = 3). Uma receita dobrada é a receita duas vezes: vezes 2 nos dois.',
  },
  {
    id: 'razao-invertida',
    nome: 'escreve a razão na ordem trocada',
    causa: 'Pega os dois números na ordem em que aparecem no texto, ou acha que a ordem não importa, como na multiplicação.',
    exemplo: '"Farinha para açúcar" com 2 de açúcar e 3 de farinha escrito 2 : 3; na regra de três, 18 × 3 ÷ 5 no lugar de 18 × 5 ÷ 3.',
    desmonte: 'A ordem da pergunta é a ordem da razão: o que vem primeiro na frase vem primeiro. 1 de suco para 3 de água e 3 de suco para 1 de água são sucos bem diferentes. Na regra de três, conferir se o resultado anda junto: mais quilos, mais caro.',
  },
  {
    id: 'escala-unidade-esquecida',
    nome: 'lê a escala 1 : 100 sem a unidade',
    causa: 'Faz a conta certa (4 × 100 = 400), mas põe no resultado a unidade errada. Esquece que, em 1 : 100, os dois números estão na mesma unidade do desenho: 1 cm vale 100 cm.',
    exemplo: 'Na planta 1 : 100, a sala de 4 cm vira 400 m (deveria ser 400 cm, que são 4 m).',
    desmonte: 'Perguntar se tem cara de verdade: uma sala de 400 m teria quatro quarteirões. Em 1 : 100, 1 cm do papel vale 100 cm de verdade, que é 1 m. A conta dá centímetros; depois, a vírgula anda até o metro.',
  },
]
