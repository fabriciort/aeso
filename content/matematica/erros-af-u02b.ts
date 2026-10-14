import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 2 de Álgebra e Funções, parte B: aulas 4 a
// 6, fator comum em evidência, fatorar x² + bx + c e reconhecer os produtos
// notáveis (somados ao catálogo em erros.ts). Reaproveitados:
// evidencia-esquece-termo (unidade 14: copia um termo ou deixa o 1 sumir),
// mdc-nao-e-o-maior (unidade 6: para no 2), termo-perde-o-sinal (unidade 1
// de Álgebra), sinais-iguais-da-negativo (unidade 12), produto-so-das-pontas
// (unidade 1 de Álgebra: só um pedaço do meio) e quadrado-da-soma-sem-o-meio
// (parte A desta unidade: x² + 9 lido como (x + 3)²).
export const ERROS_AF_U02B: ErroComum[] = [
  {
    id: 'fator-comum-incompleto',
    nome: 'põe em evidência só o número ou só a letra',
    causa: 'Acha um fator comum e para: tira o número e esquece que a letra também está em todos os termos, ou tira o x e esquece o número.',
    exemplo: '6x² + 9x = 3(2x² + 3x), ou x(6x + 9), em vez de 3x(2x + 3).',
    desmonte: 'A conta está certa, mas não acabou: dentro do parêntese ainda há um fator comum (2x² e 3x ainda têm x). No retângulo, o lado comum é 3x: os dois pedaços têm 3x de altura.',
  },
  {
    id: 'fator-comum-maior-potencia',
    nome: 'tira a maior potência da letra, e não a menor',
    causa: 'Olha o termo de expoente maior e acha que ele manda. Esquece que o fator tem de estar em todos os termos.',
    exemplo: '4x³ + 10x² = 2x³(2x + 5), em vez de 2x²(2x + 5). Ou: o maior fator comum de 12x³ e 8x² é 4x³.',
    desmonte: 'Por extenso: x³ é x · x · x e x² é x · x. Os dois têm x · x, mas só um tem três x. Multiplique de volta: 2x³(2x + 5) = 4x⁴ + 10x³, não dá.',
  },
  {
    id: 'fatores-com-a-soma-errada',
    nome: 'acha dois números com o produto certo e a soma errada',
    causa: 'Procura só a conta do produto, porque os quadradinhos são o que se vê primeiro. Pega o primeiro par de divisores de c, sem conferir a soma.',
    exemplo: 'x² + 5x + 6 = (x + 1)(x + 6), em vez de (x + 2)(x + 3). Ou: x² − x − 6 = (x − 2)(x + 3), que dá x² + x − 6.',
    desmonte: 'Nos azulejos, o 1 por 6 pede 1 + 6 = 7 barras, e só há 5: o retângulo não fecha. Multiplique de volta: (x + 1)(x + 6) = x² + 7x + 6.',
  },
  {
    id: 'fatores-com-o-produto-errado',
    nome: 'acha dois números com a soma certa e o produto errado',
    causa: 'Parte o número do meio em dois (5 em 1 e 4) e esquece que os mesmos dois números têm de dar o termo sem x, multiplicados.',
    exemplo: 'x² + 5x + 6 = (x + 1)(x + 4), em vez de (x + 2)(x + 3).',
    desmonte: 'Nos azulejos, as barras fecham os lados, mas o canto de 1 por 4 tem 4 quadradinhos, e há 6. Multiplique de volta: (x + 1)(x + 4) = x² + 5x + 4.',
  },
  {
    id: 'fatora-com-o-sinal-trocado',
    nome: 'acerta os números da fatoração e troca os sinais',
    causa: 'Acha o par certo pelo tamanho dos números, mas põe os sinais por hábito (tudo mais, ou o menos no lugar errado), sem conferir a soma com os sinais.',
    exemplo: 'x² − 10x + 25 = (x + 5)², em vez de (x − 5)². Ou: x² − x − 6 = (x − 2)(x + 3), em vez de (x + 2)(x − 3).',
    desmonte: 'O termo do meio diz o sinal: em (x + 5)², os pedaços do meio são +5x e +5x, e dão +10x. Para dar −10x, os dois têm de ser −5x: (x − 5)².',
  },
  {
    id: 'fatora-sem-tirar-a-raiz',
    nome: 'usa o número inteiro no lugar do lado do quadrado',
    causa: 'Copia o número do fim (o 9, o 25) para dentro do parêntese, sem ver que ele é a área do canto, e não o lado.',
    exemplo: 'x² − 25 = (x + 25)(x − 25), em vez de (x + 5)(x − 5). Ou: x² + 6x + 9 = (x + 9)².',
    desmonte: 'O canto que saiu do quadrado tem área 25: é um quadrado de 5 por 5. O lado é 5, porque 5 · 5 = 25. Multiplique de volta: (x + 25)(x − 25) = x² − 625.',
  },
  {
    id: 'confunde-diferenca-e-quadrado-ao-fatorar',
    nome: 'troca a diferença de quadrados e o quadrado perfeito ao fatorar',
    causa: 'Reconhece um quadrado (x² e 9 = 3²) e escreve a primeira forma que lembra, sem olhar se há um termo do meio.',
    exemplo: 'x² − 9 = (x − 3)², em vez de (x + 3)(x − 3). Ou: x² + 6x + 9 = (x + 3)(x − 3).',
    desmonte: 'Conte os termos: x² − 9 não tem o termo do meio, então os pedaços do meio se cancelaram: um é +3x e o outro −3x. Confira com x = 5: 25 − 9 = 16, e (5 − 3)² = 4.',
  },
]
