import type { Aula, Visual } from '@/lib/formation/schema'

// Volume de prismas e cilindros. A caixa-d'água de 80 cm por 60 cm por 50 cm:
// quantos litros cabem nela? A unidade 9 contou cubinhos num aquário; aqui a
// conta vira regra. Com cubos de 10 cm (1 litro cada), o fundo tem 8 · 6 = 48
// cubos. O momento-chave é o Mexa "empilhar": as camadas caem uma a uma até
// a altura, e 5 camadas de 48 dão 240 litros. Volume = área da base · altura.
// A regra vale para o prisma de base triangular (a base é a metade de 6 · 4)
// e para o cilindro. Para o cilindro, a aula ensina a área do círculo num
// cartão: os 4 quadrados do raio cobrem o quadrado em volta, e o círculo fica
// com π deles (π · r · r), o mesmo π da volta. Os erros: somar as medidas,
// parar na camada do fundo, esquecer a metade do triângulo, dar ao círculo a
// área do quadrado, escrever o volume em cm² e errar a conversão para litros.

const sol = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'solido', estado, esboco })
const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** A caixa-d'água: 80 cm por 60 cm por 50 cm, desenhada em cubos de 10 cm (8, 6 e 5). */
const CAIXA = { comprimento: 8, largura: 6, altura: 5, medidas: { comprimento: '80 cm', largura: '60 cm', altura: '50 cm' } }
const caixa = (extra: Record<string, unknown>, esboco: string) => sol({ ...CAIXA, ...extra }, esboco)

/** O prisma: a base é um triângulo de 6 cm por 4 cm (12 cm²), com 5 cm de altura. */
const PRISMA = { solido: 'prisma', comprimento: 6, largura: 4, altura: 5, unidade: 'cm' }
const prisma = (extra: Record<string, unknown>, esboco: string) => sol({ ...PRISMA, ...extra }, esboco)

/** O círculo de raio 2 e os 4 quadrados do raio, que cobrem o quadrado em volta. */
const quadrado = (x: number, y: number) => [[x, y], [x + 2, y], [x + 2, y + 2], [x, y + 2]]
const circulo = (esboco: string) =>
  fig(
    {
      grade: true,
      pontos: { O: [0, 0] },
      rotulos: false,
      poligonos: [
        { vertices: quadrado(0, 0), preenchido: 'azul', nome: 'r · r' },
        { vertices: quadrado(-2, 0) },
        { vertices: quadrado(-2, -2) },
        { vertices: quadrado(0, -2) },
      ],
      circulo: { centro: 'O', raio: 2, preenchido: true },
    },
    esboco,
  )

/** A lata: 4 cm de raio e 6 cm de altura. */
const LATA = { solido: 'cilindro', raio: 4, altura: 6, unidade: 'cm' }

/** A caixa-d'água do passo a passo: 2 m por 1,5 m por 1 m. */
const GRANDE = { comprimento: 2, largura: 1.5, altura: 1, unidade: 'm' }
const grande = (extra: Record<string, unknown>, esboco: string) => sol({ ...GRANDE, ...extra }, esboco)

export const aula: Aula = {
  id: 'B.U17.A2',
  titulo: 'Volume de prismas e cilindros',
  objetivo: 'Calcular o volume de caixas, prismas de base triangular e cilindros como área da base vezes altura, sabendo por que (camadas iguais empilhadas), com a área do círculo π · r · r, e passar de cm³ e m³ para litros.',
  modelo: 'solido',
  esboco: 'Abre na caixa-d\'água de 80 por 60 por 50 cm: quantos litros cabem? Cubos de 10 cm, de 1 litro: o aluno aposta nos 48 do fundo (8 · 6, não 8 + 6). Momento-chave: o Mexa "empilhar", em que as camadas caem até a altura; 5 camadas de 48, 240 litros. A regra vai para o prisma (a base é um triângulo de 12 cm²) e, depois de um cartão sobre a área do círculo (os 4 quadrados do raio, e o círculo com π deles), para a lata, em discos. Fecha com a caixa-d\'água de 2 m por 1,5 m por 1 m (3.000 L) e um balde redondo.',
  vega: 'Ideia central: o volume é quantos cubos de 1 enchem o sólido. Num prisma ou num cilindro, todas as camadas são iguais à base: a camada do fundo tem a área da base em cubinhos, e cabem tantas camadas quanto a altura. Por isso V = área da base · altura. Caixa: comprimento · largura · altura. Prisma de base triangular: (b · a ÷ 2) · altura. Cilindro: a base é um círculo, de área π · r · r (o círculo cabe π vezes no quadrado do raio, o mesmo π da volta; com 3,14 a conta é aproximada). Litros: 1 dm³ = 1 L e 1 m³ = 1.000 L. Erros esperados: somar as medidas (8 + 6 + 5); parar na camada do fundo; esquecer a metade do triângulo; usar a área do quadrado em volta do círculo (4 · r · r); escrever o volume em cm²; achar que 1 m³ é 1 L ou 100 L. Guie com "Quantos cubos cobrem o fundo?", "Quantas camadas cabem?", "Essa unidade é de cubos ou de quadrados?", "Um metro cúbico é do tamanho de uma garrafa ou de uma caixa-d\'água?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma caixa-d\'água tem **80 cm** por **60 cm**, e **50 cm** de altura. Quantos litros de água cabem nela?',
      fala: 'Uma caixa-d\'água tem oitenta centímetros por sessenta centímetros, e cinquenta centímetros de altura. Quantos litros de água cabem nela?',
      visual: caixa({}, 'A caixa-d\'água em perspectiva, com 80 cm na frente, 60 cm no fundo e 50 cm de altura.'),
      esboco: 'A pergunta fica aberta. Lembra a caixa de 1 m³ da unidade 9.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Encha com cubos de **10 cm** de lado, de 1 litro cada: cabem 8 na frente e 6 no fundo. Quantos cobrem o fundo?',
      fala: 'Encha com cubos de dez centímetros de lado, de um litro cada: cabem oito na frente e seis no fundo. Quantos cobrem o fundo?',
      visual: caixa({}, 'A mesma caixa, ainda vazia.'),
      opcoes: [
        {
          texto: '48', certa: true,
          explica: 'Isso. 6 fileiras de 8 cubos: $8 \\cdot 6 = 48$. É a área do fundo.',
          fala: 'Isso. Seis fileiras de oito cubos: oito vezes seis, quarenta e oito. É a área do fundo.',
          mostra: caixa({ baseCheia: true }, 'A camada do fundo se enche de cubinhos; embaixo, 8 × 6 = 48 cubinhos.'),
        },
        {
          texto: '14', erro: 'soma-no-lugar-de-multiplicar',
          explica: '$8 + 6 = 14$ é uma fileira e uma coluna. O fundo tem 6 fileiras de 8: 48.',
          fala: 'Oito mais seis, catorze, é uma fileira e uma coluna. O fundo tem seis fileiras de oito: quarenta e oito.',
          mostra: caixa({ baseCheia: true }, 'A camada do fundo cheia: 8 × 6 = 48 cubinhos.'),
        },
      ],
      esboco: 'A retomada da unidade 9: a camada do fundo é a área da base, em cubos.',
    },
    {
      tipo: 'mexa',
      texto: 'A caixa tem **50 cm** de altura: cabem 5 camadas de cubos. Encha a caixa.',
      fala: 'A caixa tem cinquenta centímetros de altura: cabem cinco camadas de cubos. Encha a caixa.',
      visual: caixa({ baseCheia: true, empilhar: true }, 'A camada do fundo cheia, com 8 × 6 = 48 cubinhos embaixo. Cada toque derruba mais uma camada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na caixa para pôr mais uma camada.',
        sucesso: { camadas: 5 },
        mostre: 'As camadas caem até encher a caixa: 5 camadas de 48.',
      },
      descoberta: 'Todas as camadas são iguais à do fundo. 5 camadas de 48 são 240 cubos de 1 litro.',
      esboco: 'O momento-chave: a altura diz quantas camadas iguais à base cabem.',
    },
    {
      tipo: 'ideia',
      texto: '5 camadas de 48: $48 \\cdot 5 = 240$ cubos de 1 litro. O volume é a área da base vezes a altura.',
      fala: 'Cinco camadas de quarenta e oito: quarenta e oito vezes cinco, duzentos e quarenta cubos de um litro. O volume é a área da base vezes a altura.',
      visual: caixa({ camadas: 5 }, 'A caixa cheia de cubinhos, com 5 camadas de 48 = 240 embaixo.'),
      esboco: 'Dá nome ao que o aluno viu, antes de levar a regra para outros sólidos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Num prisma, a camada do fundo é um triângulo: $6 \\cdot 4 \\div 2 = 12$ cm². A altura é 5 cm. Qual é o volume?',
      fala: 'Num prisma, a camada do fundo é um triângulo: seis vezes quatro dividido por dois, doze centímetros quadrados. A altura é cinco centímetros. Qual é o volume?',
      visual: prisma({ baseCheia: true }, 'O prisma de pé, com a fatia triangular do fundo cheia; embaixo, 6 × 4 ÷ 2 = 12.'),
      opcoes: [
        {
          texto: '60 cm³', certa: true,
          explica: 'Isso. 5 camadas de 12: $12 \\cdot 5 = 60$ cm³.',
          fala: 'Isso. Cinco camadas de doze: doze vezes cinco, sessenta centímetros cúbicos.',
          mostra: prisma({ camadas: 5 }, 'As fatias triangulares se empilham até a altura; embaixo, 5 camadas de 12 = 60 cm³.'),
        },
        {
          texto: '120 cm³', erro: 'area-do-triangulo-sem-metade',
          explica: '$6 \\cdot 4 \\cdot 5 = 120$ é a caixa inteira. A base é um triângulo, metade do retângulo: 60 cm³.',
          fala: 'Seis vezes quatro vezes cinco, cento e vinte, é a caixa inteira. A base é um triângulo, metade do retângulo: sessenta centímetros cúbicos.',
          mostra: prisma({ camadas: 5 }, 'As 5 fatias de 12: 60 cm³.'),
        },
        {
          texto: '15 cm³', erro: 'soma-no-lugar-de-multiplicar',
          explica: '$6 + 4 + 5$ soma as medidas. O volume são camadas: 5 camadas de 12, 60 cm³.',
          fala: 'Seis mais quatro mais cinco soma as medidas. O volume são camadas: cinco camadas de doze, sessenta centímetros cúbicos.',
          mostra: prisma({ camadas: 5 }, 'As 5 fatias de 12: 60 cm³.'),
        },
      ],
      esboco: 'A mesma regra num sólido de base triangular. A metade do triângulo é da unidade 16.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A lata tem o fundo redondo. Os 4 quadrados do raio cobrem o quadrado em volta. Quantos deles cabem no círculo?',
      fala: 'A lata tem o fundo redondo. Os quatro quadrados do raio cobrem o quadrado em volta. Quantos deles cabem no círculo?',
      visual: circulo('Um círculo âmbar claro de raio 2 sobre a grade. Em volta, o quadrado de 4 por 4 partido em 4 quadrados de 2 por 2; um deles, em azul, com r · r.'),
      opcoes: [
        {
          texto: 'Pouco mais de 3: π', certa: true,
          explica: 'Isso. O círculo perde os 4 cantos e fica com π quadrados do raio: a área é $\\pi \\cdot r \\cdot r$.',
          fala: 'Isso. O círculo perde os quatro cantos e fica com pi quadrados do raio: a área é pi vezes r vezes r.',
          mostra: circulo('O mesmo desenho: os cantos do quadrado ficam fora do círculo.'),
        },
        {
          texto: '4', erro: 'area-do-circulo-como-quadrado',
          explica: 'Os 4 cobrem também os cantos, fora do círculo. Sem eles, cabem pouco mais de 3: π quadrados do raio.',
          fala: 'Os quatro cobrem também os cantos, fora do círculo. Sem eles, cabem pouco mais de três: pi quadrados do raio.',
          mostra: circulo('Os cantos do quadrado, fora do círculo, à vista.'),
        },
      ],
      esboco: 'A área do círculo, que a unidade 16 deixou de fora, num cartão: o mesmo π da volta. Na grade, o círculo cobre uns 12,5 quadradinhos, pouco mais de 3 vezes os 4 do quadrado azul.',
    },
    {
      tipo: 'mexa',
      texto: 'A lata tem **4 cm** de raio e **6 cm** de altura. O fundo tem $\\pi \\cdot 4 \\cdot 4 \\approx 50{,}24$ cm². Empilhe os discos.',
      fala: 'A lata tem quatro centímetros de raio e seis centímetros de altura. O fundo tem pi vezes quatro vezes quatro, cerca de cinquenta vírgula vinte e quatro centímetros quadrados. Empilhe os discos.',
      visual: sol({ ...LATA, baseCheia: true, empilhar: true }, 'A lata com o disco do fundo cheio; embaixo, 3,14 × 4 × 4 = 50,24. Cada toque põe mais um disco de 1 cm.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na lata para pôr mais um disco.',
        sucesso: { camadas: 6 },
        mostre: 'Os discos se empilham até a altura: 6 camadas de 50,24.',
      },
      descoberta: 'O cilindro também é base vezes altura: 6 camadas de 50,24 cm³, cerca de 301 cm³, uns 300 mL.',
      esboco: 'O cilindro em discos: a mesma regra das camadas. 301,44 cm³ é o tamanho de uma lata de leite condensado.',
    },
    {
      tipo: 'anote',
      titulo: 'Volume de prismas e cilindros',
      definicao: '**Volume** = área da base · altura. A base é a camada do fundo; a altura diz quantas camadas cabem. No círculo, a área é $\\pi \\cdot r \\cdot r$.',
      exemplo: { tex: 'V = 48 \\cdot 5 = 240 \\text{ dm}^3 = 240 \\text{ L}', fala: 'o volume é quarenta e oito vezes cinco, duzentos e quarenta decímetros cúbicos, que são duzentos e quarenta litros' },
      alerta: 'Multiplique, não some. O volume vem em cubos: cm³, m³. 1 dm³ = 1 L e 1 m³ = 1.000 L.',
      esboco: 'Na página: a caixa em camadas, o prisma e a lata, com V = área da base · altura.',
    },
    {
      tipo: 'passo',
      problema: 'Outra caixa-d\'água tem **2 m** por **1,5 m**, e **1 m** de altura. Quantos litros cabem nela?',
      fala: 'Outra caixa-d\'água tem dois metros por um metro e meio, e um metro de altura. Quantos litros cabem nela?',
      visual: grande({}, 'Uma caixa-d\'água grande, com 2 m na frente, 1,5 m no fundo e 1 m de altura.'),
      passos: [
        {
          pergunta: 'Qual é a área do fundo?',
          opcoes: [
            {
              texto: '$2 \\cdot 1{,}5 = 3$ m²', certa: true,
              explica: 'Isso. O fundo é um retângulo de 2 m por 1,5 m.',
              fala: 'Isso. O fundo é um retângulo de dois metros por um metro e meio.',
              mostra: grande({ rotulo: 'base: 3 m²' }, 'Embaixo: base, 3 m².'),
            },
            {
              texto: '$2 + 1{,}5 = 3{,}5$ m²', erro: 'soma-no-lugar-de-multiplicar',
              explica: 'Somar dá a beirada, não o chão. O fundo tem 1,5 fileira de 2 quadrados de 1 m²: $2 \\cdot 1{,}5 = 3$.',
              fala: 'Somar dá a beirada, não o chão. O fundo tem uma fileira e meia de dois quadrados de um metro quadrado: dois vezes um vírgula cinco, três.',
              mostra: grande({ rotulo: 'base: 3 m²' }, 'Embaixo: base, 3 m².'),
            },
          ],
          linha: { tex: '\\text{base: } 2 \\cdot 1{,}5 = 3 \\text{ m}^2', fala: 'a base é dois vezes um vírgula cinco, três metros quadrados' },
        },
        {
          pergunta: 'Qual é o volume?',
          opcoes: [
            {
              texto: '$3 \\cdot 1 = 3$ m³', certa: true,
              explica: 'Isso. Uma camada de 3 cubos de 1 m: 3 m³.',
              fala: 'Isso. Uma camada de três cubos de um metro: três metros cúbicos.',
              mostra: grande({ rotulo: '3 m² · 1 m = 3 m³' }, 'Embaixo: 3 m² · 1 m = 3 m³.'),
            },
            {
              texto: '$3 \\cdot 1 = 3$ m²', erro: 'volume-em-unidade-de-area',
              explica: 'A conta está certa, a unidade não. São cubos de 1 m de lado, que enchem a caixa: 3 m³.',
              fala: 'A conta está certa, a unidade não. São cubos de um metro de lado, que enchem a caixa: três metros cúbicos.',
              mostra: grande({ rotulo: '3 m² · 1 m = 3 m³' }, 'Embaixo: 3 m² · 1 m = 3 m³.'),
            },
          ],
          linha: { tex: 'V = 3 \\cdot 1 = 3 \\text{ m}^3', fala: 'o volume é três vezes um, três metros cúbicos' },
        },
        {
          pergunta: 'Cada m³ tem 1.000 L. Quantos litros cabem?',
          fala: 'Cada metro cúbico tem mil litros. Quantos litros cabem?',
          opcoes: [
            {
              texto: '3.000 L', certa: true,
              explica: 'Isso. $3 \\cdot 1.000 = 3.000$ L: uma caixa-d\'água de casa grande.',
              fala: 'Isso. Três vezes mil, três mil litros: uma caixa-d\'água de casa grande.',
              mostra: grande({ rotulo: '3 m³ = 3.000 L' }, 'Embaixo: 3 m³ = 3.000 L.'),
            },
            {
              texto: '3 L', erro: 'confunde-m3-com-litro',
              explica: '3 L cabem numa garrafa. O cubo de 1 m tem a altura de uma mesa: cabem 1.000 L em cada um.',
              fala: 'Três litros cabem numa garrafa. O cubo de um metro tem a altura de uma mesa: cabem mil litros em cada um.',
              mostra: grande({ rotulo: '3 m³ = 3.000 L' }, 'Embaixo: 3 m³ = 3.000 L.'),
            },
            {
              texto: '300 L', erro: 'converte-volume-como-comprimento',
              explica: 'O 100 é o fator da área. No volume são 3 medidas: $10 \\cdot 10 \\cdot 10 = 1.000$ L em cada m³.',
              fala: 'O cem é o fator da área. No volume são três medidas: dez vezes dez vezes dez, mil litros em cada metro cúbico.',
              mostra: grande({ rotulo: '3 m³ = 3.000 L' }, 'Embaixo: 3 m³ = 3.000 L.'),
            },
          ],
          linha: { tex: '3 \\text{ m}^3 = 3.000 \\text{ L}', fala: 'três metros cúbicos são três mil litros' },
        },
      ],
      esboco: 'A conta inteira, com os erros de cada passo: somar, a unidade da área e a conversão para litros.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um balde redondo tem **10 cm** de raio e **20 cm** de altura. Quantos litros cabem nele? Use π ≈ 3,14.',
      fala: 'No papel: um balde redondo tem dez centímetros de raio e vinte centímetros de altura. Quantos litros cabem nele? Use pi aproximadamente três vírgula catorze.',
      resposta: '6,28',
      resolucao: [
        { tex: '\\text{base: } \\pi \\cdot 10 \\cdot 10 \\approx 314 \\text{ cm}^2', fala: 'a base é pi vezes dez vezes dez, cerca de trezentos e catorze centímetros quadrados' },
        { tex: 'V \\approx 314 \\cdot 20 = 6.280 \\text{ cm}^3', fala: 'o volume é cerca de trezentos e catorze vezes vinte, seis mil duzentos e oitenta centímetros cúbicos' },
        { tex: '6.280 \\text{ cm}^3 = 6{,}28 \\text{ L}', fala: 'seis mil duzentos e oitenta centímetros cúbicos são seis vírgula vinte e oito litros' },
      ],
      esboco: 'O cilindro com a área do círculo e a conversão: 1.000 cm³ em cada litro.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['volume-solidos-n1', 'volume-solidos-n2', 'volume-solidos-n3'],
      esboco: 'Nível 1: a caixa em cubinhos, com a camada do fundo à vista. Nível 2: o prisma de base triangular e o cilindro, com o raio ou com a área da base dada. Nível 3: caixas-d\'água, aquários e tanques redondos, em litros.',
    },
    {
      tipo: 'fecho',
      texto: 'Cabem **240 litros**: 48 no fundo e 5 camadas. Na próxima aula: quanta tinta pinta a caixa por fora.',
      fala: 'Cabem duzentos e quarenta litros: quarenta e oito no fundo e cinco camadas. Na próxima aula: quanta tinta pinta a caixa por fora.',
      visual: caixa({ camadas: 5 }, 'A caixa-d\'água cheia de cubinhos, com 5 camadas de 48 = 240 embaixo.'),
      esboco: 'Responde ao gancho e anuncia a área de superfície.',
    },
  ],
}
