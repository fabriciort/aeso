import type { Aula, Visual } from '@/lib/formation/schema'

// Perímetro. O contorno de uma figura, medido andando em volta dela: a soma
// de todos os lados. A horta de 5 m por 3 m pede 16 m de tela. O momento-
// chave é o Mexa "contorno": o aluno toca lado por lado, cada um acende e a
// soma cresce embaixo, até fechar a volta (5 + 3 + 5 + 3 = 16 m). Depois,
// duas hortas com a mesma volta e chãos diferentes (15 m² e 16 m²) separam o
// perímetro (comprimento, m) da área (quadrados, m²). Os erros a desmontar:
// somar só os dois lados escritos (8 m) e calcular a área no lugar da volta.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** A horta: 5 m por 3 m. Os lados vão de baixo, no sentido anti-horário. */
const HORTA = [[0, 0], [5, 0], [5, 3], [0, 3]]
const horta = (estado: Record<string, unknown>, esboco: string) =>
  fig({ poligono: { vertices: HORTA, preenchido: 'verde', lados: [5, 3, null, null] }, unidade: 'm', ...estado }, esboco)
const HORTA_TODA = { poligono: { vertices: HORTA, preenchido: 'verde', lados: [5, 3, 5, 3] }, unidade: 'm' }

/** A sala em L, para o rodapé. */
const SALA = [[0, 0], [6, 0], [6, 3], [3, 3], [3, 5], [0, 5]]
const SALA_LADOS = [6, 3, 3, 2, 3, 5]

/** A moldura quadrada de 30 cm. */
const MOLDURA = [[0, 0], [3, 0], [3, 3], [0, 3]]
// Os lados sem a unidade: "30 cm" na vertical não cabe na borda do palco do celular.
const moldura = (lados: (number | null)[], extra: Record<string, unknown>, esboco: string) =>
  fig({ poligono: { vertices: MOLDURA, lados, angulosRetos: [0, 1, 2, 3] }, ...extra }, esboco)

export const aula: Aula = {
  id: 'B.U16.A5',
  titulo: 'Perímetro',
  objetivo: 'Calcular o perímetro de um polígono somando todos os lados, usar os lados iguais do retângulo e do quadrado, e separar o perímetro (um comprimento, em m ou cm) da área (em m² ou cm²).',
  modelo: 'figura',
  esboco: 'Abre na horta de 5 m por 3 m que vai ser cercada com tela. A aposta separa a volta certa (16 m) das duas erradas: 8 m (só os dois lados escritos) e 15 m² (o chão). Momento-chave: o Mexa "contorno", em que o aluno anda em volta da horta tocando cada lado; o lado acende em âmbar e a soma cresce embaixo até 5 + 3 + 5 + 3 = 16 m. Depois, a horta de 4 m por 4 m tem a mesma volta e mais chão: perímetro e área são coisas diferentes. Fecha com a sala em L (seis lados) e a moldura quadrada (4 · 30 cm).',
  vega: 'Ideia central: perímetro é a medida do contorno de uma figura, a soma de todos os lados. É um comprimento: se mede em cm ou m, como uma fita ou uma cerca. No retângulo os lados de frente são iguais (5 + 3 + 5 + 3), e no quadrado os quatro são iguais (4 · lado). Erros esperados: somar só os dois lados escritos no retângulo (5 + 3 = 8); calcular a área (5 · 3 = 15) quando a pergunta é a volta, ou o contrário; esquecer um lado numa figura com muitos lados. Guie com "Imagine que você anda em volta: por quantos lados passa?", "A tela cobre o chão ou só a borda?", "Quais lados são iguais?". Mesmo perímetro não quer dizer mesma área: 5 por 3 e 4 por 4 têm 16 m de volta, com 15 m² e 16 m² de chão.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você vai cercar uma horta de **5 m** por **3 m** com tela. Quantos metros de tela precisa comprar?',
      fala: 'Você vai cercar uma horta de cinco metros por três metros com tela. Quantos metros de tela precisa comprar?',
      visual: horta({}, 'A horta vista de cima: um retângulo verde, com 5 m embaixo e 3 m do lado direito. Os outros dois lados sem número.'),
      esboco: 'Só duas medidas escritas, como no dia a dia. A pergunta fica aberta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto de tela?',
      visual: horta({}, 'A mesma horta, com 5 m e 3 m.'),
      opcoes: [
        {
          texto: '16 m', certa: true,
          explica: 'Isso. A tela passa pelos quatro lados, e os de frente são iguais. Ande em volta para conferir.',
          fala: 'Isso. A tela passa pelos quatro lados, e os de frente são iguais. Ande em volta para conferir.',
          mostra: fig(HORTA_TODA, 'Os quatro lados ganham o número: 5 m, 3 m, 5 m e 3 m.'),
        },
        {
          texto: '8 m', erro: 'perimetro-esquece-lados',
          explica: '$5 + 3$ cerca só dois lados, um canto. A volta passa pelos quatro: o de cima e o da esquerda também.',
          fala: 'Cinco mais três cerca só dois lados, um canto. A volta passa pelos quatro: o de cima e o da esquerda também.',
          mostra: fig({ ...HORTA_TODA, acesos: [0, 1], soma: true }, 'Só o lado de baixo e o da direita acesos, com 5 + 3 embaixo: falta metade da volta.'),
        },
        {
          texto: '15 m²', erro: 'confunde-area-perimetro',
          explica: '$5 \\cdot 3 = 15$ conta os quadrados do chão, em m². A tela não cobre o chão: só dá a volta, em metros.',
          fala: 'Cinco vezes três, quinze, conta os quadrados do chão, em metros quadrados. A tela não cobre o chão: só dá a volta, em metros.',
          mostra: fig({ ...HORTA_TODA, grade: true }, 'A grade aparece sob a horta: 15 quadradinhos no chão. A tela fica só na borda.'),
        },
      ],
      esboco: 'As duas erradas são os dois erros da aula: metade da volta e o chão no lugar da volta.',
    },
    {
      tipo: 'mexa',
      texto: 'Ande em volta da horta. A tela vai em cada lado: toque em todos e veja a soma crescer.',
      fala: 'Ande em volta da horta. A tela vai em cada lado: toque em todos e veja a soma crescer.',
      visual: fig({ ...HORTA_TODA, contorno: true }, 'A horta com os quatro lados medidos. Cada toque acende um lado em âmbar e a soma cresce embaixo: 5, 5 + 3, 5 + 3 + 5…'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada lado da horta.',
        sucesso: { perimetro: 16 },
        mostre: 'Os quatro lados acendem, um por um, e a soma fecha: 5 + 3 + 5 + 3 = 16 m.',
      },
      descoberta: 'A volta é a soma de todos os lados: 5 + 3 + 5 + 3 = 16 m.',
      esboco: 'O momento-chave: o perímetro é o caminho em volta, lado por lado. A soma cresce embaixo, na ordem dos toques.',
    },
    {
      tipo: 'anote',
      titulo: 'Perímetro',
      definicao: '**Perímetro** é a medida do contorno de uma figura: a soma de todos os lados. É um comprimento, em cm ou m.',
      exemplo: { tex: '5 + 3 + 5 + 3 = 16 \\text{ m}', fala: 'cinco mais três mais cinco mais três, dezesseis metros' },
      alerta: 'Perímetro não é área. A volta se mede em m; o chão de dentro, em m².',
      esboco: 'Na página: a horta desenhada, com os quatro lados e a conta embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Outra horta, de **4 m** por **4 m**, também tem **16 m** de volta. Ela tem o mesmo chão?',
      fala: 'Outra horta, de quatro metros por quatro metros, também tem dezesseis metros de volta. Ela tem o mesmo chão?',
      visual: fig({
        grade: true,
        poligonos: [
          { vertices: HORTA, preenchido: 'verde', lados: [5, 3, null, null] },
          { vertices: [[7, 0], [11, 0], [11, 4], [7, 4]], preenchido: 'azul', lados: [4, 4, null, null] },
        ],
        unidade: 'm',
      }, 'As duas hortas lado a lado sobre a grade: a de 5 por 3, verde, e a de 4 por 4, azul.'),
      opcoes: [
        {
          texto: 'Não: tem mais chão', certa: true,
          explica: 'Isso. A volta é a mesma, mas a de 4 por 4 cobre 16 quadradinhos, e a de 5 por 3, só 15.',
          fala: 'Isso. A volta é a mesma, mas a de quatro por quatro cobre dezesseis quadradinhos, e a de cinco por três, só quinze.',
          mostra: fig({
            grade: true,
            poligonos: [
              { vertices: HORTA, preenchido: 'verde', nome: '15 m²' },
              { vertices: [[7, 0], [11, 0], [11, 4], [7, 4]], preenchido: 'azul', nome: '16 m²' },
            ],
            rotulo: 'mesma volta: 16 m',
          }, 'Cada horta ganha a área no meio: 15 m² e 16 m². Embaixo, "mesma volta: 16 m".'),
        },
        {
          texto: 'Sim: mesma volta, mesmo chão', erro: 'confunde-area-perimetro',
          explica: 'Conte os quadradinhos: 15 numa, 16 na outra. A mesma cerca pode fechar chãos diferentes.',
          fala: 'Conte os quadradinhos: quinze numa, dezesseis na outra. A mesma cerca pode fechar chãos diferentes.',
          mostra: fig({
            grade: true,
            poligonos: [
              { vertices: HORTA, preenchido: 'verde', nome: '15 m²' },
              { vertices: [[7, 0], [11, 0], [11, 4], [7, 4]], preenchido: 'azul', nome: '16 m²' },
            ],
            rotulo: 'mesma volta: 16 m',
          }, 'As áreas no meio de cada horta: 15 m² e 16 m².'),
        },
      ],
      esboco: 'Separa as duas ideias: o perímetro é a cerca, a área é o chão. Mesma cerca, chãos diferentes.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora o rodapé de uma sala em **L**. Ele dá a volta toda. Toque em cada lado.',
      fala: 'Agora o rodapé de uma sala em L. Ele dá a volta toda. Toque em cada lado.',
      visual: fig({ poligono: { vertices: SALA, lados: SALA_LADOS }, unidade: 'm', contorno: true }, 'A planta de uma sala em L, com os seis lados medidos: 6, 3, 3, 2, 3 e 5 m. Cada toque acende um lado e soma.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos seis lados da sala.',
        sucesso: { perimetro: 22 },
        mostre: 'Os seis lados acendem e a soma fecha: 6 + 3 + 3 + 2 + 3 + 5 = 22 m.',
      },
      descoberta: 'Com seis lados é a mesma coisa: somar todos. Os cantos de dentro também contam.',
      esboco: 'Uma figura com mais lados, para o aluno não esquecer nenhum. O toque garante que cada lado entra uma vez.',
    },
    {
      tipo: 'passo',
      problema: 'Uma moldura quadrada tem **30 cm** de lado. Quantos cm de madeira dão a volta?',
      fala: 'Uma moldura quadrada tem trinta centímetros de lado. Quantos centímetros de madeira dão a volta?',
      visual: moldura([30, null, null, null], {}, 'Um quadrado com os quatro cantos retos e 30 cm embaixo.'),
      passos: [
        {
          pergunta: 'No quadrado, quantos lados medem **30 cm**?',
          fala: 'No quadrado, quantos lados medem trinta centímetros?',
          opcoes: [
            {
              texto: '4', certa: true,
              explica: 'Isso. O quadrado tem os quatro lados iguais.',
              fala: 'Isso. O quadrado tem os quatro lados iguais.',
              mostra: moldura([30, 30, 30, 30], {}, 'Os quatro lados ganham 30 cm.'),
            },
            {
              texto: '2', erro: 'perimetro-esquece-lados',
              explica: 'Esse é o retângulo, com dois pares iguais. No quadrado, os quatro lados são iguais.',
              fala: 'Esse é o retângulo, com dois pares iguais. No quadrado, os quatro lados são iguais.',
              mostra: moldura([30, 30, 30, 30], {}, 'Os quatro lados com 30 cm.'),
            },
          ],
          linha: { tex: '4 \\text{ lados de } 30 \\text{ cm}', fala: 'quatro lados de trinta centímetros' },
        },
        {
          pergunta: 'Quanto de madeira?',
          opcoes: [
            {
              texto: '$4 \\cdot 30 = 120$ cm', certa: true,
              explica: 'Isso. Quatro lados de 30: 120 cm de volta.',
              fala: 'Isso. Quatro lados de trinta: cento e vinte centímetros de volta.',
              mostra: moldura([30, 30, 30, 30], { acesos: true, soma: true }, 'Os quatro lados acesos e, embaixo, 30 + 30 + 30 + 30 = 120 cm.'),
            },
            {
              texto: '$30 \\cdot 30 = 900$ cm²', erro: 'confunde-area-perimetro',
              explica: '900 cm² é o vidro de dentro, a área. A madeira só contorna: $4 \\cdot 30 = 120$ cm.',
              fala: 'Novecentos centímetros quadrados é o vidro de dentro, a área. A madeira só contorna: quatro vezes trinta, cento e vinte centímetros.',
              mostra: moldura([30, 30, 30, 30], { acesos: true, soma: true }, 'Os quatro lados acesos e a soma: 120 cm.'),
            },
          ],
          linha: { tex: '4 \\cdot 30 = 120 \\text{ cm}', fala: 'quatro vezes trinta, cento e vinte centímetros' },
        },
      ],
      esboco: 'No quadrado, somar os quatro lados iguais é multiplicar por 4. A errada do segundo passo é a área, o vidro.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: uma sala quadrada tem **4 m** de lado. A porta tem **1 m** e não leva rodapé. Quantos metros de rodapé?',
      fala: 'No papel: uma sala quadrada tem quatro metros de lado. A porta tem um metro e não leva rodapé. Quantos metros de rodapé?',
      resposta: 15,
      resolucao: [
        { tex: '4 \\cdot 4 = 16 \\text{ m de volta}', fala: 'quatro vezes quatro, dezesseis metros de volta' },
        { tex: '16 - 1 = 15 \\text{ m de rodapé}', fala: 'dezesseis menos um, quinze metros de rodapé' },
      ],
      esboco: 'A volta inteira e depois o vão da porta. A resposta é 15 m, um comprimento.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['perimetro-n1', 'perimetro-n2', 'perimetro-n3'],
      esboco: 'Nível 1: o retângulo com as duas medidas e o desenho. Nível 2: o que pega, só com palavras: quadrado, polígono de lados iguais e retângulo com dois números. Nível 3: cerca com portão, rodapé com porta e a praça quadrada ao contrário (da volta ao lado).',
    },
    {
      tipo: 'fecho',
      texto: 'A horta pede **16 m** de tela: a volta toda. Na próxima aula: a área, o chão de dentro.',
      fala: 'A horta pede dezesseis metros de tela: a volta toda. Na próxima aula: a área, o chão de dentro.',
      visual: fig({ ...HORTA_TODA, acesos: true, soma: true }, 'A horta com os quatro lados acesos e 5 + 3 + 5 + 3 = 16 m embaixo.'),
      esboco: 'Responde ao gancho e anuncia a área.',
    },
  ],
}
