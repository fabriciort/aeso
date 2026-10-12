import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 7, aulas 6 a 10 (somados ao catálogo em erros.ts).
// Reaproveitados de outras unidades: mmc-e-o-produto, divide-o-menor-pelo-maior.
export const ERROS_U07B: ErroComum[] = [
  {
    id: 'maior-denominador-maior-fracao',
    nome: 'acha que o denominador maior faz a fração maior',
    causa: 'Compara frações como compara números inteiros: olha o 8 e o 6 e conclui que o 8 ganha, sem ver que o denominador diz em quantas partes o inteiro foi cortado.',
    exemplo: '1/8 > 1/6 porque 8 > 6. Ou 3/8 > 2/3 porque 3 e 8 são maiores que 2 e 3.',
    desmonte: 'Duas barras do mesmo tamanho, uma em 6 e outra em 8 partes, uma em cima da outra: o pedaço de 8 é visivelmente mais curto. Mais partes no mesmo inteiro, pedaços menores. Uma torta em 8 fatias dá fatias menores que em 6.',
  },
  {
    id: 'soma-numeradores-e-denominadores',
    nome: 'soma em cima e embaixo',
    causa: 'Trata a fração como dois números soltos e soma cada andar, como se fossem duas contas separadas, sem pensar no tamanho dos pedaços.',
    exemplo: '1/2 + 1/3 = 2/5.',
    desmonte: 'O resultado é menor que uma das parcelas: 2/5 é menos que 1/2, e juntar água ao leite não pode dar menos líquido. Nas barras, metades e terços viram sextos: 3/6 + 2/6 = 5/6.',
  },
  {
    id: 'soma-denominadores-iguais',
    nome: 'soma também os denominadores iguais',
    causa: 'Aprendeu que "se soma em cima" e, por simetria, soma embaixo também. Não vê o denominador como o tamanho do pedaço, que não muda ao juntar.',
    exemplo: '2/5 + 1/5 = 3/10.',
    desmonte: 'Na barra de quintos, 2 pedaços pintados e mais 1: são 3 quintos, e os pedaços continuam quintos. 3/10 é menos que os 2/5 que já havia: somar não pode dar menos. Como 2 maçãs + 1 maçã: 3 maçãs, não 3 "maçãs duplas".',
  },
  {
    id: 'multiplicar-sempre-aumenta',
    nome: 'acha que multiplicar sempre aumenta',
    causa: 'Com inteiros, multiplicar sempre deu um resultado maior (ou igual). O aluno leva a regra para as frações e estranha ou rejeita um produto menor.',
    exemplo: '1/2 × 3/4 deve ser maior que 3/4. Ou meia receita de 12 colheres dá 24 colheres.',
    desmonte: '"1/2 de 3/4" é pegar a metade de 3/4: no retângulo, o cruzamento em âmbar fica dentro dos 3/4, então é menor. Multiplicar por um número menor que 1 diminui; meia receita usa menos de tudo.',
  },
  {
    id: 'dividir-sempre-diminui',
    nome: 'acha que dividir sempre diminui',
    causa: 'Com inteiros, dividir sempre deu um resultado menor. O aluno não lê a divisão como "quantas vezes cabe" e espera um número pequeno.',
    exemplo: '3 ÷ 1/2 = 1 e meio. Ou 3/4 ÷ 1/8 = 3/32.',
    desmonte: 'Pergunte quantas metades cabem em 3 xícaras: corte cada xícara ao meio e conte, são 6. Dividir por um número menor que 1 aumenta, porque o pedaço é pequeno e cabe muitas vezes.',
  },
  {
    id: 'inverte-a-fracao-errada',
    nome: 'inverte a primeira fração, e não a que divide',
    causa: 'Decorou "inverte e multiplica" sem saber por quê, e inverte a fração que aparece primeiro, ou as duas.',
    exemplo: '3/4 ÷ 1/8 = 4/3 × 1/8 = 1/6.',
    desmonte: 'A pergunta é quantos oitavos cabem em 3/4. Nas barras, 3/4 = 6/8: cabem 6. Só a que divide se inverte (dividir por 1/8 é multiplicar por 8), e o resultado 1/6 nem chega a 1, quando cabem vários.',
  },
  {
    id: 'inteiro-multiplica-os-dois',
    nome: 'multiplica o numerador e o denominador pelo inteiro',
    causa: 'Mistura a regra das frações equivalentes (multiplicar em cima e embaixo) com a multiplicação por um inteiro.',
    exemplo: '2 × 3/4 = 6/8.',
    desmonte: '6/8 é o mesmo que 3/4: dobrar a receita não teria mudado nada. O 2 conta quantas vezes se pega 3/4: 3 quartos e mais 3 quartos, 6 quartos. O tamanho do pedaço não muda.',
  },
]
