import type { Aula, Visual } from '@/lib/formation/schema'

// Volume e o litro. Volume é quanto espaço algo ocupa, contado em cubos.
// Os blocos da unidade 1 viram régua de volume: o cubinho é 1 cm³, a placa
// é uma camada de 100, e 10 camadas fazem o cubo de 10 cm, que é 1 dm³ e é
// exatamente 1 litro. Por isso 1 mL = 1 cm³. O mesmo desenho, numa escala
// maior, é a caixa-d'água: o cubo de 1 m tem 1.000 cubos de 10 cm, 1.000 L.
// No quadro de volume, cada unidade tem 3 algarismos. Os erros a desmontar:
// converter volume como comprimento (1 m³ = 10 dm³) e achar que 1 m³ é 1 L.

const VOLUME = ['m³', 'dm³', 'cm³']
const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })
const quadro = (medida: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { medida: { casas: VOLUME, porCasa: 3, ...medida } }, esboco })
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const LITRO = { milhares: 1, totalVisivel: false, rotulos: { milhares: '1 dm³ = 1 L' } }
const CAIXA = { milhares: 1, totalVisivel: false, rotulos: { milhares: '1 m³ = 1.000 L' } }
const FUNDO = { base: [60], altura: [30] }

export const aula: Aula = {
  id: 'B.U9.A4',
  titulo: 'Volume e o litro',
  objetivo: 'Entender o volume como contagem de cubos, saber que 1 L = 1 dm³ = 1.000 cm³, que 1 mL = 1 cm³ e que 1 m³ = 1.000 L, e converter entre m³, litros e mililitros, inclusive o volume de uma caixa.',
  modelo: 'blocos',
  esboco: 'Abre na caixa-d\'água de 1 m³: quantos litros? O aluno empilha as 10 placas dos blocos e vê nascer o cubo de mil: 10 × 10 × 10 cubinhos de 1 cm³. Momento-chave: esse cubo de 10 cm de lado é 1 litro, e cada cubinho é 1 mL. Depois o mesmo desenho em outra escala: o cubo de 1 m tem 1.000 cubos de 10 cm, 1.000 L. O quadro de volume, com 3 algarismos por casa, faz a vírgula pular de 3 em 3. Fecha com o aquário (camadas de cubinhos) e a caixa-d\'água.',
  vega: 'Ideia central: volume é quanto espaço algo ocupa, contado em cubos de 1 de lado (1 cm³, 1 dm³, 1 m³). Um cubo de 10 cm de lado tem 10 × 10 × 10 = 1.000 cubinhos de 1 cm: 1 dm³ = 1.000 cm³. O litro é definido como 1 dm³ (Bureau Internacional de Pesos e Medidas, Sistema Internacional de Unidades), por isso 1 L = 1.000 cm³ e 1 mL = 1 cm³. O cubo de 1 m tem 10 × 10 × 10 cubos de 10 cm: 1 m³ = 1.000 dm³ = 1.000 L. No quadro de volume, cada unidade vale 1.000 vezes a da direita (3 algarismos por casa). Erros esperados: converter volume com o fator do comprimento ou da área (1 m³ = 10 dm³ ou 100 dm³; 2,5 L = 250 cm³); achar que 1 m³ é 1 L; somar as três medidas da caixa em vez de contar camadas. Guie com "Quantos cubinhos no fundo?", "Quantas camadas?", "Uma garrafa de 1 L é do tamanho de uma caixa-d\'água?". Confira pelo tamanho: uma caixa de leite é 1 L; uma caixa-d\'água de 1.000 L chega à altura de uma mesa.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A caixa-d\'água da casa diz **1 m³**. Quantas garrafas de **1 L** são precisas para enchê-la?',
      fala: 'A caixa-d\'água da casa diz um metro cúbico. Quantas garrafas de um litro são precisas para enchê-la?',
      visual: quadro({ numero: '1', de: 'm³' }, 'O quadro de volume com m³, dm³ e cm³ em cima, cada casa larga, com lugar para 3 algarismos. O 1 está na casa do m³, e embaixo se lê "1 m³".'),
      esboco: 'Uma pergunta de casa que quase ninguém sabe de cabeça. Fica aberta até o fim da aula.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada cubinho tem 1 cm de lado: é **1 cm³**. Cada placa é uma camada de 100 cubinhos. Empilhe as 10 camadas.',
      fala: 'Cada cubinho tem um centímetro de lado: é um centímetro cúbico. Cada placa é uma camada de cem cubinhos. Empilhe as dez camadas.',
      visual: blocos({ centenas: 10, totalVisivel: false, rotulos: { centenas: 'camada de 100 cm³' } }, 'As 10 placas dos blocos, deitadas uma ao lado da outra, com "camada de 100 cm³" embaixo. Um toque as empilha: as placas sobem uma sobre a outra e viram o cubo de mil.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas placas para empilhar as camadas.',
        sucesso: { milhares: 1, centenas: 0 },
        mostre: 'As 10 placas sobem uma sobre a outra, de baixo para cima, e viram o cubo grande.',
      },
      descoberta: 'O cubo de 10 cm de lado é 10 camadas de 10 × 10 cubinhos: 1.000 cm³. O volume tem três medidas, e as três contam.',
      esboco: 'O cubo de mil da unidade 1, agora como volume. Proposta: ao empilhar, aparecem "10 cm" nas três arestas do cubo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quantos cubinhos de **1 cm³** tem o cubo de 10 cm de lado?',
      fala: 'Quantos cubinhos de um centímetro cúbico tem o cubo de dez centímetros de lado?',
      visual: blocos({ milhares: 1, totalVisivel: false }, 'O cubo de mil, sozinho, com as arestas marcadas.'),
      opcoes: [
        {
          texto: '1.000', certa: true,
          explica: 'Isso. 10 fileiras de 10, em 10 camadas: $10 \\times 10 \\times 10 = 1.000$.',
          mostra: blocos({ milhares: 1, total: 1000 }, 'O cubo com 1.000 embaixo.'),
        },
        {
          texto: '100', erro: 'converte-volume-como-comprimento',
          explica: '100 é uma camada só, o fundo do cubo. Em cima dela vêm mais 9: são 1.000.',
          mostra: blocos({ centenas: 1, total: 100, totalVisivel: true }, 'Uma placa só: o fundo do cubo. Ela é fina, não enche nada.'),
        },
        {
          texto: '30', erro: 'soma-no-lugar-de-multiplicar',
          explica: '10 + 10 + 10 conta só três beiradas. O cubo tem 10 camadas de 100 cubinhos.',
          mostra: blocos({ milhares: 1, total: 1000 }, 'As três arestas do cubo acendem, e depois o cubo inteiro, com 1.000 embaixo.'),
        },
      ],
      esboco: 'Os dois erros do volume: o fator da área (100) e somar as medidas.',
    },
    {
      tipo: 'ideia',
      texto: 'Nesse cubo de 10 cm cabe **1 litro**. Cada cubinho de **1 cm³** é **1 mL**: 1.000 mL no litro.',
      fala: 'Nesse cubo de dez centímetros cabe um litro. Cada cubinho de um centímetro cúbico é um mililitro: mil mililitros no litro.',
      visual: blocos({ ...LITRO, unidades: 1, rotulos: { milhares: '1 dm³ = 1 L', unidades: '1 cm³ = 1 mL' } }, 'O cubo de mil com "1 dm³ = 1 L" embaixo e, ao lado, um cubinho solto com "1 cm³ = 1 mL".'),
      esboco: 'O momento-chave: o litro ganha um tamanho. Proposta: o cubo se enche de água azul de baixo para cima, como uma caixa de leite de 1 L.',
    },
    {
      tipo: 'mexa',
      texto: 'Uma garrafa de **1,5 L** tem 1,5 dm³. No quadro de volume, cada casa leva **3** algarismos.',
      fala: 'Uma garrafa de um litro e meio tem um vírgula cinco decímetro cúbico. No quadro de volume, cada casa leva três algarismos.',
      visual: quadro({ numero: '1,5', de: 'dm³' }, 'O 1 na casa do dm³ e o 5 depois da vírgula, já na casa do cm³. Embaixo, "1,5 dm³".'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no cm³ para ver a garrafa em cm³.',
        sucesso: { para: 'cm³' },
        mostre: 'A vírgula pula os 3 algarismos da casa do cm³, dois zeros âmbar aparecem e a leitura vira 1,5 dm³ = 1.500 cm³.',
      },
      descoberta: 'De dm³ para cm³ a vírgula anda 3 algarismos: × 1.000. A garrafa de 1,5 L tem 1.500 cm³, que são 1.500 mL.',
      esboco: 'O quadro de área tinha 2 algarismos por casa; o de volume tem 3, porque são três medidas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora a caixa-d\'água: um cubo de **1 m** de lado. Quantos litros cabem nela?',
      fala: 'Agora a caixa-d\'água: um cubo de um metro de lado. Quantos litros cabem nela?',
      visual: quadro({ numero: '1', de: 'm³' }, 'O quadro com 1 m³, como no começo.'),
      opcoes: [
        {
          texto: '1.000 L', certa: true,
          explica: 'Isso. O mesmo cubo, maior: 10 × 10 × 10 cubos de 10 cm, e cada um é 1 L.',
          mostra: blocos(CAIXA, 'O mesmo cubo de mil, em outra escala: cada cubinho agora é um cubo de 10 cm, 1 L, e o cubo inteiro tem 1 m de lado.'),
        },
        {
          texto: '1 L', erro: 'confunde-m3-com-litro',
          explica: '1 L é o cubo de 10 cm, do tamanho de uma caixa de leite. O cubo de 1 m chega à altura de uma mesa.',
          mostra: blocos({ ...CAIXA, unidades: 1 }, 'O cubo de 1 m ao lado de um cubinho solto, 1 L: um cabe mil vezes no outro.'),
        },
        {
          texto: '10 L', erro: 'converte-volume-como-comprimento',
          explica: '1 m tem 10 dm de comprimento. Mas há 3 medidas: $10 \\times 10 \\times 10 = 1.000$ dm³.',
          mostra: quadro({ numero: '1', de: 'm³', para: 'dm³' }, 'A vírgula pula os 3 algarismos do dm³: 1 m³ = 1.000 dm³, e cada dm³ é 1 L.'),
        },
      ],
      esboco: 'O desenho do cubo de mil serve duas vezes: 1 cm³ dentro de 1 dm³, e 1 dm³ dentro de 1 m³.',
    },
    {
      tipo: 'anote',
      titulo: 'Volume e o litro',
      definicao: 'Volume é quanto espaço algo ocupa, contado em cubos. 1 L = 1 dm³ = 1.000 cm³, 1 mL = 1 cm³ e 1 m³ = 1.000 L.',
      exemplo: { tex: '1{,}5 \\text{ L} = 1{,}5 \\text{ dm}^3 = 1.500 \\text{ cm}^3 = 1.500 \\text{ mL}', fala: 'um vírgula cinco litro é um vírgula cinco decímetro cúbico, que são mil e quinhentos centímetros cúbicos, ou mil e quinhentos mililitros' },
      alerta: 'O volume anda de 1.000 em 1.000, não de 10: 1 m³ não é 10 dm³. E 1 m³ não é 1 L: são 1.000 L.',
      esboco: 'A página do caderno com o cubo de mil desenhado, as três arestas de 10 e as igualdades embaixo.',
    },
    {
      tipo: 'passo',
      problema: 'Um aquário tem **60 cm** × **30 cm** × **40 cm** por dentro. Quantos litros cabem nele?',
      fala: 'Um aquário tem sessenta centímetros por trinta por quarenta, por dentro. Quantos litros cabem nele?',
      visual: ret(FUNDO, 'O fundo do aquário visto de cima: um retângulo de 60 por 30, sem número dentro.'),
      passos: [
        {
          pergunta: 'Quantos cubinhos de 1 cm³ cobrem o fundo, numa camada só?',
          fala: 'Quantos cubinhos de um centímetro cúbico cobrem o fundo, numa camada só?',
          opcoes: [
            { texto: '$60 \\times 30 = 1.800$', certa: true, explica: 'Isso. 30 fileiras de 60: a área do fundo.', mostra: ret({ ...FUNDO, areas: [['1.800']] }, 'O 1.800 aparece dentro do fundo.') },
            { texto: '$60 + 30 = 90$', erro: 'soma-no-lugar-de-multiplicar', explica: '90 cubinhos fazem uma fileira e uma coluna. O fundo tem 30 fileiras de 60.' },
          ],
          linha: { tex: '60 \\times 30 = 1.800 \\text{ cm}^3 \\text{ por camada}', fala: 'sessenta vezes trinta é mil e oitocentos centímetros cúbicos por camada' },
        },
        {
          pergunta: 'A água sobe 40 cm: são 40 camadas. Quantos cm³ ao todo?',
          fala: 'A água sobe quarenta centímetros: são quarenta camadas. Quantos centímetros cúbicos ao todo?',
          opcoes: [
            { texto: '72.000 cm³', certa: true, explica: 'Isso. $1.800 \\times 40 = 72.000$.' },
            { texto: '7.200 cm³', erro: 'conta-zeros-errado', explica: '$1.800 \\times 4 = 7.200$. Mas são 40 camadas: mais um zero, 72.000.' },
          ],
          linha: { tex: '1.800 \\times 40 = 72.000 \\text{ cm}^3', fala: 'mil e oitocentos vezes quarenta é setenta e dois mil centímetros cúbicos' },
        },
        {
          pergunta: 'Cada litro tem 1.000 cm³. Quantos litros?',
          fala: 'Cada litro tem mil centímetros cúbicos. Quantos litros?',
          opcoes: [
            { texto: '72 L', certa: true, explica: 'Isso. $72.000 \\div 1.000 = 72$: uns 7 baldes de 10 L.' },
            { texto: '720 L', erro: 'converte-volume-como-comprimento', explica: 'Isso é dividir por 100, o fator da área. O litro tem 1.000 cm³: 72 L.' },
            { texto: '72.000 L', erro: 'converte-no-sentido-errado', explica: '72.000 L é um caminhão-pipa. O litro é maior que o cm³: o número diminui.' },
          ],
          linha: { tex: '72.000 \\text{ cm}^3 = 72 \\text{ L}', fala: 'setenta e dois mil centímetros cúbicos são setenta e dois litros' },
        },
      ],
      esboco: 'Camada por camada, como o cubo de mil: o fundo, depois a altura, depois o litro.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: uma caixa-d\'água de **1,5 m³** enche quantos galões de 20 L?',
      fala: 'No papel: uma caixa-d\'água de um vírgula cinco metro cúbico enche quantos galões de vinte litros?',
      resposta: 75,
      resolucao: [
        { tex: '1 \\text{ m}^3 = 1.000 \\text{ L}', fala: 'um metro cúbico são mil litros' },
        { tex: '1{,}5 \\text{ m}^3 = 1.500 \\text{ L}', fala: 'um vírgula cinco metro cúbico são mil e quinhentos litros' },
        { tex: '1.500 \\div 20 = 75', fala: 'mil e quinhentos dividido por vinte é setenta e cinco' },
      ],
      esboco: 'Primeiro em litros, depois a divisão. Confere: 75 × 20 = 1.500.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['volume-litro-n1', 'volume-litro-n2', 'volume-litro-n3'],
      esboco: 'Nível 1: litros em mL ou cm³, com o quadro de volume. Nível 2: m³ e litros nos dois sentidos, o caso do fator 1.000. Nível 3: os litros de uma caixa com três medidas em cm, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A caixa de **1 m³** guarda **1.000 L**: mil cubos de 10 cm. Na próxima aula: o tempo, que não conta de 10 em 10.',
      fala: 'A caixa de um metro cúbico guarda mil litros: mil cubos de dez centímetros. Na próxima aula: o tempo, que não conta de dez em dez.',
      visual: blocos(CAIXA, 'O cubo de mil com "1 m³ = 1.000 L" embaixo.'),
      esboco: 'Responde ao gancho: mil garrafas de 1 L.',
    },
  ],
}
