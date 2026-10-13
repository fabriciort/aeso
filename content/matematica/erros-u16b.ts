import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 16, parte B: aulas 5 a 8, perímetro, área,
// círculo e π e o teorema de Pitágoras (somados ao catálogo em erros.ts).
// Reaproveitados: confunde-area-perimetro (unidade 9: somar os lados quando
// a pergunta é o chão, ou o contrário), potencia-multiplica-base-pelo-expoente
// (unidade 13: 3² = 6), raiz-e-a-metade (unidade 13: √100 = 50) e
// raiz-da-soma-separada (unidade 13: √(9 + 16) = 3 + 4).
export const ERROS_U16B: ErroComum[] = [
  {
    id: 'perimetro-esquece-lados',
    nome: 'soma só os lados que aparecem escritos',
    causa: 'O retângulo traz só duas medidas, e a pessoa soma as duas. Esquece que a volta passa pelos quatro lados, e que os lados de frente são iguais.',
    exemplo: 'Horta de 5 m por 3 m com 8 m de tela (5 + 3). A volta é 5 + 3 + 5 + 3 = 16 m.',
    desmonte: 'Andar em volta da figura, tocando lado por lado: a tela passa por quatro lados, não por dois. Os 8 m cercam só metade da horta, um canto em L.',
  },
  {
    id: 'area-em-unidade-de-comprimento',
    nome: 'escreve a área em m (ou cm), sem o quadrado',
    causa: 'Faz a conta certa, mas dá à área a unidade dos lados. Não separa o que se mede com uma régua (comprimento) do que se cobre com quadrados (área).',
    exemplo: 'Canteiro de 6 m por 3 m com 18 m de área (são 18 m²).',
    desmonte: 'Os 18 são quadrados de 1 m de lado, que cobrem o chão: 18 m². "18 m" seria uma fita de 18 metros, que não cobre nada.',
  },
  {
    id: 'area-com-o-lado-inclinado',
    nome: 'usa o lado inclinado no lugar da altura',
    causa: 'No paralelogramo ou no triângulo, multiplica a base pelo lado torto, que é uma medida que aparece na figura. A altura é a distância em pé, do topo até a base, e é menor que o lado inclinado.',
    exemplo: 'Paralelogramo de base 6 m, altura 3 m e lado inclinado 3,6 m com área 6 · 3,6 = 21,6 m² (são 18 m²).',
    desmonte: 'Recortar o triângulo da ponta e levá-lo para o outro lado: a figura vira um retângulo de 6 por 3, e a grade mostra 18 quadradinhos. O lado inclinado some na conta: quem manda é a altura.',
  },
  {
    id: 'area-do-triangulo-sem-metade',
    nome: 'esquece de dividir por 2 a área do triângulo',
    causa: 'Lembra que a área é base vezes altura e aplica ao triângulo como num retângulo, sem ver que o triângulo é só metade.',
    exemplo: 'Triângulo de base 8 cm e altura 4 cm com área 32 cm² (são 16 cm²).',
    desmonte: 'Dois triângulos iguais, um virado, formam um paralelogramo de base 8 e altura 4, com 32 cm². Cada triângulo é a metade: 16 cm².',
  },
  {
    id: 'confunde-raio-diametro',
    nome: 'troca o raio pelo diâmetro',
    causa: 'Raio e diâmetro são as duas medidas do círculo que passam pelo centro, e a pessoa usa uma no lugar da outra: põe o raio em C = π · d, ou o diâmetro em C = 2 · π · r.',
    exemplo: 'Roda de 70 cm de diâmetro com volta de 3,14 · 35 = 109,9 cm (são 219,8 cm). Ou: raio de 15 cm com diâmetro de 7,5 cm.',
    desmonte: 'O diâmetro atravessa o círculo de borda a borda; o raio vai só do centro à borda, metade do caminho. A volta tem pouco mais de 3 diâmetros: com o raio, só daria metade da volta.',
  },
  {
    id: 'pi-e-3-14',
    nome: 'acha que π é 3,14 (ou 3) exatamente',
    causa: 'Viu π trocado por 3,14 nas contas e acha que o número é esse. Não sabe que π não acaba, e que 3,14 é uma aproximação, boa para a obra, mas não exata.',
    exemplo: 'π = 3,14, ou "a volta é exatamente 3 diâmetros". Ou escreve π · 70 = 219,8 (é ≈ 219,8).',
    desmonte: 'Desenrolar a volta do círculo e medir com o diâmetro: cabem 3 e sobra um pedacinho, um pouco mais de 0,14, e depois mais um pouco. π = 3,14159…, sem fim. Por isso, com 3,14, a conta se escreve com ≈.',
  },
  {
    id: 'pi-depende-do-tamanho',
    nome: 'acha que π muda com o tamanho do círculo',
    causa: 'Vê que um círculo maior tem a volta maior e acha que o número de diâmetros na volta também cresce.',
    exemplo: 'Uma roda gigante "tem um π maior" que uma moeda.',
    desmonte: 'Um círculo maior é a mesma figura em escala: o diâmetro cresce junto com a volta. Na moeda ou na roda gigante, a volta tem sempre pouco mais de 3 diâmetros.',
  },
  {
    id: 'pitagoras-soma-os-lados',
    nome: 'soma (ou subtrai) os lados no lugar dos quadrados',
    causa: 'Lembra que "os catetos dão a hipotenusa" e soma as medidas. Não vê que o teorema fala das áreas dos quadrados sobre os lados.',
    exemplo: 'Catetos de 3 m e 4 m com hipotenusa de 7 m (é 5 m). Ou: hipotenusa de 13 e cateto de 5, com o outro cateto de 13 − 5 = 8 (é 12).',
    desmonte: 'O caminho reto, pela diagonal, é mais curto que dar a volta pelos dois catetos: tem de dar menos de 7. Os quadrados mostram: 9 + 16 = 25 quadradinhos, e o lado de 25 é 5.',
  },
  {
    id: 'pitagoras-esquece-a-raiz',
    nome: 'para no quadrado e esquece a raiz',
    causa: 'Soma os quadrados dos catetos e entrega a soma como a hipotenusa. Esquece que 25 é a área do quadrado grande, e que a pergunta é o lado dele.',
    exemplo: 'Catetos de 3 cm e 4 cm com hipotenusa de 25 cm (é 5 cm).',
    desmonte: 'Uma hipotenusa de 25 cm seria muito maior que os dois catetos juntos. O 25 são quadradinhos, a área do quadrado sobre a hipotenusa; o lado é √25 = 5.',
  },
  {
    id: 'pitagoras-sem-angulo-reto',
    nome: 'usa o teorema de Pitágoras sem um canto reto',
    causa: 'Decorou a² + b² = c² e aplica a qualquer triângulo, sem conferir se ele tem um ângulo de 90°.',
    exemplo: 'Num triângulo sem canto reto, com quadrados de 10 e 16 sobre dois lados, acha que o terceiro tem 26 (tem 18).',
    desmonte: 'Pôr os quadrados nos lados de um triângulo sem canto reto e contar: os dois menores não enchem o grande (10 + 16 dá 26, o grande tem 18). O pedreiro usa o 3-4-5 justamente para achar o canto reto.',
  },
]
