import type { Aula, Visual } from '@/lib/formation/schema'

// Área de superfície. O presente numa caixa de 10 cm por 8 cm por 6 cm:
// quanto papel cobre a caixa toda? O momento-chave é o Mexa "pintar": o
// aluno pinta face por face, a área de cada uma entra na soma e, quando as
// três da frente estão pintadas, a caixa se abre sozinha e mostra as de trás.
// As faces de frente uma para a outra são iguais: some três e dobre,
// 2 · (60 + 48 + 80) = 376 cm². Depois, a diferença para o volume (480
// cm³ é o que cabe dentro), a tinta das paredes de um quarto (só 4 faces, e a
// lata que falta) e a lata de 3 cm de raio: 2 tampas de π · r · r (aula
// anterior) e o rótulo, um retângulo de largura 2 · π · r. Os erros:
// esquecer as faces escondidas, confundir com o volume, somar faces que não
// entram e arredondar as latas de tinta para baixo.

const sol = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'solido', estado, esboco })

/** O presente: 10 cm por 8 cm por 6 cm. Faces de 60, 48 e 80 cm², duas de cada. */
const CAIXA = { comprimento: 10, largura: 8, altura: 6, unidade: 'cm' }
const caixa = (extra: Record<string, unknown>, esboco: string) => sol({ ...CAIXA, ...extra }, esboco)
const PARES = { frente: 'ambar', tras: 'ambar', topo: 'azul', base: 'azul', esquerda: 'verde', direita: 'verde' }

/** O quarto: 4 m por 3 m, com 2,5 m de altura. */
const QUARTO = { comprimento: 4, largura: 3, altura: 2.5, unidade: 'm' }
const quarto = (extra: Record<string, unknown>, esboco: string) => sol({ ...QUARTO, ...extra }, esboco)
const PAREDES = { frente: 'ambar', direita: 'ambar', esquerda: 'ambar', tras: 'ambar' }

/** A lata: 3 cm de raio e 5 cm de altura. Tampas de 28,26 cm², rótulo de 94,2 cm². Com raio 2, a volta e a tampa dariam o mesmo número (12,56), e o rótulo e o volume também. */
const LATA = { solido: 'cilindro', raio: 3, altura: 5, unidade: 'cm' }
const lata = (extra: Record<string, unknown>, esboco: string) => sol({ ...LATA, ...extra }, esboco)

export const aula: Aula = {
  id: 'B.U17.A3',
  titulo: 'Área de superfície',
  objetivo: 'Calcular a área de superfície de caixas, cubos e cilindros como a soma das áreas das faces (2 · (cl + ch + lh) na caixa; 2 tampas de π · r · r e o rótulo de 2 · π · r · h no cilindro), separando-a do volume e escolhendo só as faces que a situação pede.',
  modelo: 'solido',
  esboco: 'Abre no presente numa caixa de 10 por 8 por 6 cm: quanto papel? O aluno aposta em quantas faces o papel cobre. Momento-chave: o Mexa "pintar", face por face, com a soma crescendo embaixo; quando as três da frente estão pintadas, a caixa se abre e as de trás aparecem. Depois: as faces opostas iguais, a diferença para o volume (480 cm³ dentro, 376 cm² na casca), as paredes de um quarto (35 m², 4 latas) e a lata pintada (2 tampas e o rótulo).',
  vega: 'Ideia central: a área de superfície é a casca do sólido, o que se pinta ou embrulha: a soma das áreas de todas as faces, em cm² ou m². Na caixa, as faces de frente uma para a outra são iguais: 2 · (c · l + c · h + l · h). No cubo, 6 quadrados iguais. No cilindro, 2 tampas de π · r · r e o rótulo, um retângulo de largura igual à volta (2 · π · r) e altura h. Erros esperados: esquecer as faces de trás e de baixo (somar só três); confundir com o volume (c · l · h, que é o que cabe dentro); somar faces que a situação deixa de fora (o chão, a tampa que não existe); comprar latas de tinta a menos, arredondando para baixo. Guie com "Quantas faces o papel cobre?", "Esta face leva tinta?", "Isso é o que cabe dentro ou o que cobre por fora?", "Com 3 latas, a parede fica toda pintada?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você vai embrulhar um presente numa caixa de **10 cm** por **8 cm** por **6 cm**. Quanto papel cobre a caixa toda?',
      fala: 'Você vai embrulhar um presente numa caixa de dez centímetros por oito centímetros por seis centímetros. Quanto papel cobre a caixa toda?',
      visual: caixa({}, 'A caixa do presente em perspectiva, com as três medidas.'),
      esboco: 'A pergunta fica aberta: o papel não é o que cabe dentro, é o que cobre.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O papel tem de cobrir quantas faces da caixa?',
      visual: caixa({}, 'A mesma caixa, fechada.'),
      opcoes: [
        {
          texto: '6', certa: true,
          explica: 'Isso. As 3 que você vê e as 3 de trás e de baixo.',
          fala: 'Isso. As três que você vê e as três de trás e de baixo.',
          mostra: caixa({ ocultas: true }, 'A caixa "de arame": as arestas de trás, tracejadas, mostram as faces escondidas.'),
        },
        {
          texto: '3', erro: 'conta-so-o-que-ve',
          explica: 'Você vê 3. Atrás e embaixo há mais 3: sem elas, o presente fica aparecendo.',
          fala: 'Você vê três. Atrás e embaixo há mais três: sem elas, o presente fica aparecendo.',
          mostra: caixa({ ocultas: true }, 'A caixa de arame, com as faces de trás à mostra.'),
        },
      ],
      esboco: 'A aposta antes de pintar. A errada é o erro da aula: só as faces à vista.',
    },
    {
      tipo: 'mexa',
      texto: 'Pinte cada face. A área dela entra na soma, embaixo.',
      visual: caixa({ pintar: true }, 'A caixa fechada. Cada toque numa face a pinta de âmbar e escreve a área dela; a soma cresce embaixo. Com as 3 da frente pintadas, a caixa se abre sozinha e mostra as 3 de trás.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada face para pintá-la.',
        sucesso: { area: 376 },
        mostre: 'Todas as faces pintadas: 376 cm².',
      },
      descoberta: 'A área da superfície é a soma das áreas das 6 faces: 376 cm².',
      esboco: 'O momento-chave: a caixa se abre quando as faces à vista acabam, e o aluno vê que faltavam três.',
    },
    {
      tipo: 'ideia',
      texto: 'As faces de frente uma para a outra são iguais. Some três e dobre: $2 \\cdot (60 + 48 + 80) = 376$ cm².',
      fala: 'As faces de frente uma para a outra são iguais. Some três e dobre: dois vezes sessenta mais quarenta e oito mais oitenta, trezentos e setenta e seis centímetros quadrados.',
      visual: caixa({ aberto: true, destaque: PARES, areas: true }, 'A caixa aberta, com a área em cada face e os pares na mesma cor: 60 em âmbar, 80 em azul, 48 em verde.'),
      esboco: 'O atalho, visto nas cores: três pares.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Dentro da caixa cabem $10 \\cdot 8 \\cdot 6 = 480$ cm³. E o papel, quanto é?',
      fala: 'Dentro da caixa cabem dez vezes oito vezes seis, quatrocentos e oitenta centímetros cúbicos. E o papel, quanto é?',
      visual: caixa({ aberto: true, destaque: PARES, areas: true }, 'A mesma caixa aberta, com as áreas.'),
      opcoes: [
        {
          texto: '376 cm²', certa: true,
          explica: 'Isso. 480 cm³ é o que cabe dentro, em cubinhos. O papel é a casca, em quadradinhos: 376 cm².',
          fala: 'Isso. Quatrocentos e oitenta centímetros cúbicos é o que cabe dentro, em cubinhos. O papel é a casca, em quadradinhos: trezentos e setenta e seis centímetros quadrados.',
          mostra: caixa({ aberto: true, destaque: PARES, areas: true, rotulo: 'papel: 376 cm²' }, 'Embaixo: papel, 376 cm².'),
        },
        {
          texto: '480 cm²', erro: 'confunde-volume-superficie',
          explica: '480 é o volume, o que cabe dentro. O papel fica do lado de fora: a soma das faces, 376 cm².',
          fala: 'Quatrocentos e oitenta é o volume, o que cabe dentro. O papel fica do lado de fora: a soma das faces, trezentos e setenta e seis centímetros quadrados.',
          mostra: caixa({ aberto: true, destaque: PARES, areas: true, rotulo: 'papel: 376 cm²' }, 'Embaixo: papel, 376 cm².'),
        },
      ],
      esboco: 'Volume e superfície usam as mesmas medidas, com contas e unidades diferentes.',
    },
    {
      tipo: 'anote',
      titulo: 'Área de superfície',
      definicao: 'A **área de superfície** é a soma das áreas de todas as faces: o que se pinta ou embrulha. Vem em cm² ou m².',
      exemplo: { tex: '2 \\cdot (60 + 48 + 80) = 376 \\text{ cm}^2', fala: 'dois vezes sessenta mais quarenta e oito mais oitenta, trezentos e setenta e seis centímetros quadrados' },
      alerta: 'Conte as faces de trás e de baixo. Não confunda com o volume, que é o que cabe dentro.',
      esboco: 'Na página: a caixa aberta com as áreas das faces e a soma.',
    },
    {
      tipo: 'passo',
      problema: 'Você vai pintar só as paredes de um quarto de **4 m** por **3 m**, com **2,5 m** de altura. Quantas latas de tinta comprar?',
      fala: 'Você vai pintar só as paredes de um quarto de quatro metros por três metros, com dois metros e meio de altura. Quantas latas de tinta comprar?',
      visual: quarto({}, 'O quarto como uma caixa: 4 m na frente, 3 m no fundo, 2,5 m de altura.'),
      passos: [
        {
          pergunta: 'Quais faces levam tinta?',
          opcoes: [
            {
              texto: 'As 4 paredes', certa: true,
              explica: 'Isso. Frente, fundo e os dois lados. O chão e o teto ficam de fora.',
              fala: 'Isso. Frente, fundo e os dois lados. O chão e o teto ficam de fora.',
              mostra: quarto({ destaque: PAREDES }, 'As paredes à vista acesas em âmbar.'),
            },
            {
              texto: 'As 6 faces', erro: 'pinta-faces-a-mais',
              explica: 'A pergunta é só das paredes. O chão e o teto não entram: são 4 faces.',
              fala: 'A pergunta é só das paredes. O chão e o teto não entram: são quatro faces.',
              mostra: quarto({ destaque: PAREDES }, 'As paredes à vista acesas.'),
            },
          ],
          linha: { tex: '\\text{4 paredes: duas de } 4 \\cdot 2{,}5 \\text{ e duas de } 3 \\cdot 2{,}5', fala: 'quatro paredes: duas de quatro por dois e meio e duas de três por dois e meio' },
        },
        {
          pergunta: 'Qual é a área das paredes?',
          opcoes: [
            {
              texto: '$2 \\cdot 10 + 2 \\cdot 7{,}5 = 35$ m²', certa: true,
              explica: 'Isso. Cada parede de 4 m tem 10 m², cada uma de 3 m tem 7,5 m². Duas de cada.',
              fala: 'Isso. Cada parede de quatro metros tem dez metros quadrados, cada uma de três metros tem sete e meio. Duas de cada.',
              mostra: quarto({ destaque: PAREDES, rotulo: 'paredes: 35 m²' }, 'Embaixo: paredes, 35 m².'),
            },
            {
              texto: '$10 + 7{,}5 = 17{,}5$ m²', erro: 'conta-so-o-que-ve',
              explica: 'Essas são as 2 paredes à vista. Atrás há mais duas iguais: $2 \\cdot 17{,}5 = 35$ m².',
              fala: 'Essas são as duas paredes à vista. Atrás há mais duas iguais: duas vezes dezessete e meio, trinta e cinco metros quadrados.',
              mostra: quarto({ destaque: PAREDES, ocultas: true }, 'As arestas de trás tracejadas: as duas paredes escondidas.'),
            },
          ],
          linha: { tex: '2 \\cdot 10 + 2 \\cdot 7{,}5 = 35 \\text{ m}^2', fala: 'dois vezes dez mais dois vezes sete e meio, trinta e cinco metros quadrados' },
        },
        {
          pergunta: 'Uma lata pinta **10 m²**. Quantas latas?',
          fala: 'Uma lata pinta dez metros quadrados. Quantas latas?',
          opcoes: [
            {
              texto: '4 latas', certa: true,
              explica: 'Isso. $35 \\div 10 = 3{,}5$: 3 latas não bastam. Com 4, sobra um pouco.',
              fala: 'Isso. Trinta e cinco dividido por dez, três e meio: três latas não bastam. Com quatro, sobra um pouco.',
              mostra: quarto({ destaque: PAREDES, rotulo: '35 m² ÷ 10 = 3,5: 4 latas' }, 'Embaixo: 35 m² ÷ 10 = 3,5: 4 latas.'),
            },
            {
              texto: '3 latas', erro: 'ignora-contexto-do-resto',
              explica: '3 latas pintam 30 m². Faltam 5 m² de parede: compre 4.',
              fala: 'Três latas pintam trinta metros quadrados. Faltam cinco metros quadrados de parede: compre quatro.',
              mostra: quarto({ destaque: PAREDES, rotulo: '35 m² ÷ 10 = 3,5: 4 latas' }, 'Embaixo: 4 latas.'),
            },
          ],
          linha: { tex: '35 \\div 10 = 3{,}5 \\;\\Rightarrow\\; 4 \\text{ latas}', fala: 'trinta e cinco dividido por dez, três e meio: quatro latas' },
        },
      ],
      esboco: 'A tinta da parede: escolher as faces, somar as escondidas e arredondar as latas para cima.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora uma lata de **3 cm** de raio e **5 cm** de altura. Pinte as tampas e a parede.',
      fala: 'Agora uma lata de três centímetros de raio e cinco centímetros de altura. Pinte as tampas e a parede.',
      visual: lata({ pintar: true }, 'A lata fechada. Cada toque pinta uma parte e escreve a área: a tampa (28,26 cm²) e a parede (94,2 cm²). Com as duas pintadas, a lata se abre e mostra a tampa de baixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada parte da lata para pintá-la.',
        sucesso: { area: 150.72 },
        mostre: 'As tampas e a parede pintadas: 150,72 cm².',
      },
      descoberta: 'A lata são 2 tampas de 28,26 cm² e o rótulo de 94,2 cm²: 150,72 cm².',
      esboco: 'O cilindro: a tampa de baixo só aparece quando a lata se abre.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A parede da lata, aberta, é o retângulo do rótulo. Qual conta dá a área dele?',
      visual: lata({ aberto: true, areas: { topo: '28,26 cm²', base: '28,26 cm²', lateral: '?' } }, 'A lata aberta, com as tampas de 28,26 cm² e um ponto de interrogação no retângulo.'),
      opcoes: [
        {
          texto: '$2 \\cdot \\pi \\cdot 3 \\cdot 5$', certa: true,
          explica: 'Isso. A largura é a volta, $2 \\cdot \\pi \\cdot 3$; a altura, 5 cm. Dá cerca de 94,2 cm².',
          fala: 'Isso. A largura é a volta, dois vezes pi vezes três; a altura, cinco centímetros. Dá cerca de noventa e quatro vírgula dois centímetros quadrados.',
          mostra: lata({ aberto: true, areas: true }, 'O retângulo ganha 94,2 cm², e a largura, a cota da volta.'),
        },
        {
          texto: '$\\pi \\cdot 3 \\cdot 3 \\cdot 5$', erro: 'confunde-volume-superficie',
          explica: 'Essa é o volume: o fundo vezes a altura. O rótulo é um retângulo: a volta vezes a altura.',
          fala: 'Essa é o volume: o fundo vezes a altura. O rótulo é um retângulo: a volta vezes a altura.',
          mostra: lata({ aberto: true, areas: true }, 'A lata aberta, com a área de cada parte.'),
        },
      ],
      esboco: 'O porquê do número que o Mexa escreveu: a largura do retângulo é a volta (primeira aula).',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: quantos cm² de papel cobrem um cubo de **5 cm** de aresta, todo fechado?',
      fala: 'No papel: quantos centímetros quadrados de papel cobrem um cubo de cinco centímetros de aresta, todo fechado?',
      resposta: 150,
      resolucao: [
        { tex: '\\text{uma face: } 5 \\cdot 5 = 25 \\text{ cm}^2', fala: 'uma face tem cinco vezes cinco, vinte e cinco centímetros quadrados' },
        { tex: '6 \\cdot 25 = 150 \\text{ cm}^2', fala: 'seis faces: seis vezes vinte e cinco, cento e cinquenta centímetros quadrados' },
      ],
      esboco: 'O cubo: 6 quadrados iguais. Quem esquece as de trás acha 75; quem faz o volume, 125.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['area-superficie-n1', 'area-superficie-n2', 'area-superficie-n3'],
      esboco: 'Nível 1: a caixa aberta, com a área de cada face. Nível 2: o cubo, a caixa sem desenho e o rótulo da lata. Nível 3: as paredes e as latas de tinta, e a lata inteira.',
    },
    {
      tipo: 'fecho',
      texto: 'O presente pede **376 cm²** de papel: as 6 faces, três pares iguais. Na próxima unidade: o plano cartesiano e os gráficos.',
      fala: 'O presente pede trezentos e setenta e seis centímetros quadrados de papel: as seis faces, três pares iguais. Na próxima unidade: o plano cartesiano e os gráficos.',
      visual: caixa({ aberto: true, destaque: PARES, areas: true, rotulo: 'papel: 376 cm²' }, 'A caixa aberta, com as áreas e papel: 376 cm² embaixo.'),
      esboco: 'Responde ao gancho e fecha a unidade.',
    },
  ],
}
