import type { Aula, Visual } from '@/lib/formation/schema'

// Área. Medir o chão é contar quadrados de 1 m de lado: o retângulo da
// multiplicação da unidade 3, agora com unidade. 1 m² tem 10.000 cm² porque
// são 100 fileiras de 100 quadradinhos de 1 cm: as duas medidas mudam. Por
// isso o quadro de área tem 2 algarismos por unidade. Os erros a desmontar:
// converter área como comprimento (1 m² = 100 cm²), calcular a volta
// (perímetro) no lugar da área e multiplicar medidas em unidades diferentes.

const AREA = ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²']
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const quadro = (medida: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { medida: { casas: AREA, porCasa: 2, ...medida } }, esboco })
const SALA = { linhas: 3, colunas: 4, rotulos: true }

export const aula: Aula = {
  id: 'B.U9.A3',
  titulo: 'Área',
  objetivo: 'Calcular a área de um retângulo em m² ou cm² e converter entre m², dm² e cm², sabendo por que 1 m² tem 10.000 cm².',
  modelo: 'retangulo',
  esboco: 'Abre na reforma: o piso da sala, 4 m por 3 m. O aluno cobre o chão com quadrados de 1 m de lado, uma fileira de 4 por vez: o retângulo da multiplicação, 3 × 4 = 12 m². Momento-chave: o quadrado de 1 m de lado vira uma grade de 10 × 10 quadradinhos de 10 cm, e cada um deles ainda tem 100 cm². O "1 m² = 100 cm²" cabe num quadradinho só. Depois, o quadro de área, com 2 algarismos por casa: a vírgula de 1 m² pula 4 zeros até o cm². Fecha com a conta do piso: área, caixas e o arredondamento para cima.',
  vega: 'Ideia central: área é quanto uma figura cobre, contado em quadrados de 1 de lado (1 m², 1 cm²). No retângulo, área = comprimento × largura: são fileiras iguais de quadrados, como no retângulo da multiplicação da unidade 3. Como o metro tem 100 cm nos dois lados, 1 m² = 100 × 100 = 10.000 cm², e 1 m² = 10 × 10 = 100 dm²: no quadro de área, cada unidade vale 100 vezes a da direita (2 algarismos por casa). Erros esperados: converter área como comprimento (1 m² = 100 cm²); somar os lados (perímetro, o rodapé) no lugar de multiplicar; multiplicar 2 m por 80 cm sem converter (160). Guie com "Quantos quadrados de 1 m cabem numa fileira?", "Quantas fileiras?", "Os dois lados estão na mesma unidade?", "Quantos centímetros tem cada lado do metro quadrado?". Na compra de piso, a conta dá um número quebrado de caixas e se arredonda para cima; na obra, ainda se compra uma margem para cortes, que fica fora desta aula. Em Sua vez, peça para desenhar o retângulo no caderno quadriculado.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você vai trocar o piso da sala, de **4 m** por **3 m**. A loja vende piso por m². Quanto você compra?',
      fala: 'Você vai trocar o piso da sala, de quatro metros por três metros. A loja vende piso por metro quadrado. Quanto você compra?',
      visual: ret({ base: [4], altura: [3], areas: [['?']] }, 'A planta da sala vista de cima: um retângulo liso, com 4 em cima, 3 do lado e "?" dentro. Ainda sem os quadradinhos.'),
      esboco: 'A missão da unidade, "O piso da sala", começa aqui. A pergunta fica aberta.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada quadradinho é **1 m²**: um quadrado de 1 m de lado. Cubra o chão, uma fileira de 4 por vez.',
      fala: 'Cada quadradinho é um metro quadrado: um quadrado de um metro de lado. Cubra o chão, uma fileira de quatro por vez.',
      visual: ret({ linhas: 0, colunas: 4, adicionar: true, rotulos: true, total: 0 }, 'O chão vazio, com o botão "+ 1 linha". Cada toque desliza uma fileira de 4 placas de 1 m por 1 m, e o total embaixo sobe: 4, 8, 12.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em "+ 1 linha" até cobrir as 3 fileiras.',
        sucesso: { linhas: 3 },
        mostre: 'Três fileiras de 4 placas entram, uma de cada vez, e o total sobe até 12.',
      },
      descoberta: '3 fileiras de 4 quadrados de 1 m²: 12 m². A área do retângulo é comprimento × largura.',
      esboco: 'O gesto da unidade 3, agora com unidade de medida. O aluno vê a área como contagem de quadrados.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quantos m² de piso, então?',
      fala: 'Quantos metros quadrados de piso, então?',
      visual: ret(SALA, 'O chão coberto: 3 fileiras de 4 placas, com o 4 em cima e o 3 do lado.'),
      opcoes: [
        {
          texto: '12 m²', certa: true,
          explica: 'Isso. 3 fileiras de 4: $3 \\times 4 = 12$ quadrados de 1 m².',
          mostra: ret({ ...SALA, total: 12 }, 'As fileiras acendem uma a uma, e o 12 aparece embaixo.'),
        },
        {
          texto: '14 m²', erro: 'confunde-area-perimetro',
          explica: '4 + 3 + 4 + 3 = 14 m é a volta da sala: o rodapé. O piso cobre o chão: 12 quadrados.',
          mostra: ret({ ...SALA, total: 12 }, 'O chão coberto, com o 12 embaixo: são as placas que contam, não a borda.'),
        },
        {
          texto: '7 m²', erro: 'soma-no-lugar-de-multiplicar',
          explica: '4 + 3 conta uma fileira e uma coluna. O chão tem 3 fileiras de 4: 12.',
          mostra: ret({ ...SALA, destaque: 'linha', total: 12 }, 'A primeira fileira acende: já são 4. Depois as outras duas, até 12.'),
        },
      ],
      esboco: 'As duas iscas do dia a dia: o rodapé e a soma dos lados. Proposta: no 14, uma linha âmbar correr pela borda da sala (o retângulo ainda não desenha o contorno).',
    },
    {
      tipo: 'aposta',
      pergunta: 'Esta placa de **1 m²** foi partida em quadradinhos de **10 cm** de lado. Quantos cm² tem cada quadradinho?',
      fala: 'Esta placa de um metro quadrado foi partida em quadradinhos de dez centímetros de lado. Quantos centímetros quadrados tem cada quadradinho?',
      visual: grade({ pintadas: 1, rotulo: '1 m²' }, 'Uma placa da sala ampliada: a grade 10 × 10, com o primeiro quadradinho de 10 cm pintado no canto e "1 m²" embaixo.'),
      opcoes: [
        {
          texto: '100 cm²', certa: true,
          explica: 'Isso. 10 fileiras de 10 quadradinhos de 1 cm: $10 \\times 10 = 100$ cm².',
          mostra: ret({ linhas: 10, colunas: 10, rotulos: true, total: 100 }, 'Uma lupa no quadradinho do canto: ele vira um quadrado de 10 por 10 quadradinhos de 1 cm, com 100 embaixo.'),
        },
        {
          texto: '10 cm²', erro: 'converte-area-como-comprimento',
          explica: '10 cm é o lado. 10 cm² é só uma fileira; o quadradinho tem 10 fileiras: 100 cm².',
          mostra: ret({ linhas: 1, colunas: 10, rotulos: true, total: 10 }, 'Uma fileira só de 10 quadradinhos de 1 cm: 10 cm². Ainda faltam 9 fileiras para cobrir o quadradinho.'),
        },
        {
          texto: '40 cm²', erro: 'confunde-area-perimetro',
          explica: '40 cm é a volta do quadradinho: 10 + 10 + 10 + 10. A área conta o que ele cobre: 100 cm².',
          mostra: ret({ linhas: 10, colunas: 10, rotulos: true, total: 100 }, 'O quadradinho ampliado, coberto por 10 × 10 quadradinhos de 1 cm: 100.'),
        },
      ],
      esboco: 'A lupa: o quadradinho de 10 cm da grade vira 10 × 10 quadradinhos de 1 cm. Prepara o momento-chave do próximo cartão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E a placa inteira? **1 m²** tem quantos cm²?',
      fala: 'E a placa inteira? Um metro quadrado tem quantos centímetros quadrados?',
      visual: grade({ pintadas: 1, rotulo: '100 cm²' }, 'De volta à placa: a grade 10 × 10 com um quadradinho pintado e "100 cm²" embaixo.'),
      opcoes: [
        {
          texto: '10.000 cm²', certa: true,
          explica: 'Isso. 100 quadradinhos de 100 cm²: $100 \\times 100 = 10.000$. Cada lado do metro tem 100 cm.',
          mostra: grade({ pintadas: 100, rotulo: '10.000 cm²' }, 'A grade se pinta inteira, coluna por coluna, e o número embaixo chega a 10.000 cm².'),
        },
        {
          texto: '100 cm²', erro: 'converte-area-como-comprimento',
          explica: '100 cm² cabem num quadradinho só, de 10 cm por 10 cm. A placa tem 100 deles.',
          mostra: grade({ pintadas: 1, rotulo: '100 cm²' }, 'Só o quadradinho do canto continua pintado: são os 100 cm². Os outros 99 estão vazios.'),
        },
        {
          texto: '1.000 cm²', erro: 'fator-de-conversao-errado',
          explica: '1.000 cm² são só uma coluna: 10 quadradinhos de 100 cm². A placa tem 10 colunas.',
          mostra: grade({ pintadas: 10, rotulo: '1.000 cm²' }, 'Uma coluna se pinta: 10 quadradinhos de 100 cm². Ainda faltam 9 colunas.'),
        },
      ],
      esboco: 'O momento-chave. O "1 m² = 100 cm²" é desmontado pelo tamanho: cabe num cantinho da placa. As duas medidas, comprimento e largura, mudam: 100 × 100.',
    },
    {
      tipo: 'mexa',
      texto: 'No quadro de área, cada unidade vale **100 vezes** a da direita: 2 algarismos por casa. Leve **1 m²** até o **cm²**.',
      fala: 'No quadro de área, cada unidade vale cem vezes a da direita: dois algarismos por casa. Leve um metro quadrado até o centímetro quadrado.',
      visual: quadro({ numero: '1', de: 'm²' }, 'O quadro km² hm² dam² m² dm² cm² mm², cada casa com dois lugares. O 1 no segundo lugar do m². As casas são tocáveis.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na casa do cm².',
        sucesso: { para: 'cm²' },
        mostre: 'A vírgula pula duas casas de área, e quatro 0 âmbar aparecem no dm² e no cm²: 1 m² = 10.000 cm².',
      },
      descoberta: 'Do m² ao cm² são 2 casas de área, 4 algarismos: × 10.000. No comprimento a vírgula anda 1 algarismo por casa; na área, 2.',
      esboco: 'O quadro da aula 1, mas com casas largas. Os quatro zeros aparecendo de dois em dois fixam o 10.000.',
    },
    {
      tipo: 'anote',
      titulo: 'Área',
      definicao: '**Área** é quantos quadrados de 1 de lado cobrem a figura. No retângulo: comprimento × largura. 1 m² = 10.000 cm².',
      exemplo: { tex: '1 \\text{ m}^2 = 100 \\text{ cm} \\times 100 \\text{ cm} = 10.000 \\text{ cm}^2', fala: 'um metro quadrado são cem centímetros vezes cem centímetros: dez mil centímetros quadrados' },
      alerta: 'Na área, a vírgula anda **2 casas** por unidade: 1 m² não é 100 cm². E área não é a volta da sala.',
      esboco: 'Na página: o retângulo de 3 por 4 com 12 m² dentro; ao lado, o quadrado de 1 m com 100 cm em cada lado e o quadro de área com 1 m² = 10.000 cm².',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um tampo de mesa tem **0,5 m²**. Quantos cm² são?',
      fala: 'Um tampo de mesa tem zero vírgula cinco metro quadrado. Quantos centímetros quadrados são?',
      visual: quadro({ numero: '0,5', de: 'm²' }, 'O 0 no m² e o 5 no primeiro lugar do dm².'),
      opcoes: [
        {
          texto: '5.000 cm²', certa: true,
          explica: 'Isso. Metade de 10.000. A vírgula anda 4 algarismos: 0,5 vira 5.000.',
          mostra: quadro({ numero: '0,5', de: 'm²', para: 'cm²' }, 'A vírgula pula até depois do cm², com três 0 âmbar: 0,5 m² = 5.000 cm².'),
        },
        {
          texto: '50 cm²', erro: 'converte-area-como-comprimento',
          explica: '× 100 é a conta do comprimento. 50 cm² é menos que a palma da mão, não um tampo de mesa.',
          mostra: quadro({ numero: '0,5', de: 'm²', para: 'cm²' }, 'A vírgula precisa andar duas casas largas, 4 algarismos: 5.000.'),
        },
        {
          texto: '500 cm²', erro: 'fator-de-conversao-errado',
          explica: '500 cm² não chega a uma folha de papel A4. Do m² ao cm² o fator é 10.000: 5.000 cm².',
          mostra: quadro({ numero: '0,5', de: 'm²', para: 'cm²' }, 'O quadro conta 4 algarismos depois do m²: 5.000.'),
        },
      ],
      esboco: 'Treina o 10.000 com um decimal. O tamanho de coisas conhecidas (mão, folha) desmonta as iscas.',
    },
    {
      tipo: 'passo',
      problema: 'A sala tem **4,5 m** por **3 m**. Cada caixa de piso cobre **2 m²**. Quantas caixas comprar?',
      fala: 'A sala tem quatro metros e meio por três metros. Cada caixa de piso cobre dois metros quadrados. Quantas caixas comprar?',
      visual: ret({ base: [4.5], altura: [3], areas: [['?']] }, 'O retângulo da sala por área, com 4,5 em cima, 3 do lado e "?" dentro.'),
      passos: [
        {
          pergunta: 'Primeiro, a área do chão.',
          fala: 'Primeiro, a área do chão.',
          opcoes: [
            { texto: '$4{,}5 \\times 3 = 13{,}5$ m²', certa: true, explica: 'Isso. 4 × 3 = 12, e a meia fileira dá mais 1,5: 13,5 m².', mostra: ret({ base: [4, 0.5], altura: [3], areas: [[12, '1,5']] }, 'O retângulo se parte em 4 e 0,5: 12 m² e mais 1,5 m².') },
            { texto: '4,5 + 3 + 4,5 + 3 = 15', erro: 'confunde-area-perimetro', explica: '15 m é o rodapé, a volta da sala. O piso cobre o chão: comprimento × largura.' },
          ],
          linha: { tex: '4{,}5 \\times 3 = 13{,}5 \\text{ m}^2', fala: 'quatro vírgula cinco vezes três são treze vírgula cinco metros quadrados' },
        },
        {
          pergunta: 'Quantas caixas de 2 m²?',
          fala: 'Quantas caixas de dois metros quadrados?',
          opcoes: [
            { texto: '13,5 ÷ 2 = 6,75: compro **7**', certa: true, explica: 'Isso. 6 caixas cobrem 12 m² e faltaria piso. A loja não vende 0,75 caixa.' },
            { texto: '13,5 ÷ 2 = 6,75: compro **6**', erro: 'ignora-contexto-do-resto', explica: '6 caixas cobrem só 12 m². Ficaria 1,5 m² de chão sem piso: precisa da 7ª.' },
          ],
          linha: { tex: '13{,}5 \\div 2 = 6{,}75 \\to 7 \\text{ caixas}', fala: 'treze vírgula cinco dividido por dois dá seis vírgula setenta e cinco: sete caixas' },
        },
      ],
      esboco: 'A conta da missão: área e depois caixas. O arredondamento para cima volta da unidade 4.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um tapete de **2 m** por **80 cm**. Qual é a área dele em m²?',
      fala: 'No papel: um tapete de dois metros por oitenta centímetros. Qual é a área dele em metros quadrados?',
      resposta: '1,6',
      resolucao: [
        { tex: '80 \\text{ cm} = 0{,}8 \\text{ m}', fala: 'oitenta centímetros são zero vírgula oito metro' },
        { tex: '2 \\times 0{,}8 = 1{,}6', fala: 'dois vezes zero vírgula oito são um vírgula seis' },
        { tex: '\\text{Área} = 1{,}6 \\text{ m}^2', fala: 'a área é um vírgula seis metro quadrado' },
      ],
      esboco: 'A isca escondida: 2 × 80 = 160, sem converter. Na resolução, os dois lados na mesma unidade antes da conta.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['area-n1', 'area-n2', 'area-n3'],
      esboco: 'Nível 1: contar a área de um retângulo de quadradinhos de 1 m², com o desenho. Nível 2: converter m², dm² e cm². Nível 3: o piso, o tapete e o preço por m², sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'A sala de 4 m por 3 m pede **12 m²** de piso: 12 placas de 1 m de lado, cada uma com 10.000 cm². Na próxima aula: volume.',
      fala: 'A sala de quatro metros por três pede doze metros quadrados de piso: doze placas de um metro de lado, cada uma com dez mil centímetros quadrados. Na próxima aula: volume.',
      visual: ret({ ...SALA, total: 12 }, 'O chão do gancho, coberto pelas 12 placas, com o 12 embaixo.'),
      esboco: 'Responde ao gancho com o chão coberto.',
    },
  ],
}
