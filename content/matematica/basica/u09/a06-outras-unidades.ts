import type { Aula, Visual } from '@/lib/formation/schema'

// Outras unidades. Polegada, pé e milha não são do sistema métrico: não
// andam de 10 em 10, e a conversão usa um fator, quanto 1 unidade vale na
// outra (1 pol = 2,54 cm). Da unidade grande para a pequena, cada peça
// grande vira muitas pequenas: multiplica pelo fator. No sentido contrário,
// divide. A milha náutica, de navios e aviões, é outra unidade, maior que a
// milha da estrada. Fecha a unidade com o piso da sala: placas de 1 pé num
// chão de 4 m por 3 m.

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const REGUA = { de: 0, ate: 8, passo: 1, marcas: [0, 2, 4, 6, 8], unidade: 'cm' }
const POLEGADAS = { de: 0, ate: 8, passo: 1, marcas: [0, 2.54, 5.08, 7.62], saltos: [[0, 2.54, '1 pol'], [2.54, 5.08, '1 pol'], [5.08, 7.62, '1 pol']] }
const MILHAS = { de: 0, ate: 2, passo: 0.1, marcas: [0, 1, 1.6, 1.852] }
const SALA = { base: [400], altura: [300] }

export const aula: Aula = {
  id: 'B.U9.A6',
  titulo: 'Outras unidades',
  objetivo: 'Converter polegadas, pés, milhas e milhas náuticas para o sistema métrico e de volta, usando o fator de conversão: multiplicar ao ir para a unidade menor e dividir ao voltar, conferindo pelo tamanho.',
  modelo: 'reta',
  esboco: 'Abre na loja: a TV de 50 polegadas. A régua em cm mostra a polegada como um salto de 2,54 cm. Momento-chave: cada polegada carrega 2,54 cm, então 50 polegadas são 50 saltos, 50 × 2,54 = 127 cm; o número em cm cresce porque o cm é menor. No sentido contrário, divide. Depois o pé do piloto (0,3048 m) e as duas milhas: a da estrada (cerca de 1,6 km) e a náutica (1,852 km), lado a lado na reta. Fecha a unidade com o piso da sala: placas de 1 pé num chão de 4 m por 3 m.',
  vega: 'Ideia central: fora do sistema métrico, a conversão usa um fator, o quanto 1 unidade vale na outra. Valores exatos por definição internacional (acordo de 1959 sobre a jarda e a libra; Organização Hidrográfica Internacional, 1929): 1 polegada = 2,54 cm; 1 pé = 12 polegadas = 30,48 cm; 1 milha = 1,609344 km (cerca de 1,6 km); 1 milha náutica = 1,852 km. Indo para a unidade menor, cada peça grande vira várias pequenas: multiplica pelo fator. Voltando, divide. Confira pelo tamanho: o número cresce quando a unidade de chegada é menor. Erros esperados: dividir quando devia multiplicar (50 pol = 19,7 cm); somar o fator (50 + 2,54); usar 30,48 (o pé em cm) para converter em metros; usar o 1,6 da milha comum para a milha náutica. Na missão, a fileira de placas arredonda para cima: o pedaço que falta também precisa de piso. Aviação e navegação aparecem como aplicação; os números foram escolhidos para a conta, não tirados de um voo real.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A TV da loja tem **50 polegadas** na diagonal. Na trena, em centímetros, quanto é isso?',
      fala: 'A TV da loja tem cinquenta polegadas na diagonal. Na trena, em centímetros, quanto é isso?',
      visual: reta({ ...REGUA, marcaSemRotulo: 2.54 }, 'A régua em centímetros, de 0 a 8, com um traço a cada 1 cm. Um "?" âmbar logo depois do 2,5: onde termina 1 polegada.'),
      esboco: 'Polegada é a unidade das telas, dos canos e das rodas. Quase ninguém sabe o tamanho dela.',
    },
    {
      tipo: 'aposta',
      pergunta: '1 polegada é **2,54 cm**, a largura de um dedão. Quanto são **50 polegadas**?',
      fala: 'Uma polegada é dois vírgula cinquenta e quatro centímetros, a largura de um dedão. Quanto são cinquenta polegadas?',
      visual: reta(POLEGADAS, 'Três saltos de 2,54 cm na régua, cada um com "1 pol": 2,54, 5,08, 7,62.'),
      opcoes: [
        {
          texto: '127 cm', certa: true,
          explica: 'Isso. 50 saltos de 2,54 cm: $50 \\times 2{,}54 = 127$.',
        },
        {
          texto: '19,7 cm', erro: 'converte-no-sentido-errado',
          explica: 'Isso é 50 ÷ 2,54. Mas cada polegada é maior que 1 cm: em cm, o número tem de crescer.',
          mostra: reta(POLEGADAS, 'Os saltos de 2,54 passam dos números da régua: 3 polegadas já são 7,62 cm.'),
        },
        {
          texto: '52,54 cm', erro: 'soma-no-lugar-de-multiplicar',
          explica: 'São 50 polegadas, cada uma com 2,54 cm: 50 vezes 2,54, não 50 mais 2,54.',
          mostra: reta(POLEGADAS, 'Os três saltos acendem um a um: 2,54 a cada polegada.'),
        },
      ],
      esboco: 'O fator aparece na pergunta; a aposta é sobre o que fazer com ele.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada polegada carrega 2,54 cm. Indo para a unidade menor, o número **cresce**: multiplique pelo fator. Voltando, **divida**.',
      fala: 'Cada polegada carrega dois vírgula cinquenta e quatro centímetros. Indo para a unidade menor, o número cresce: multiplique pelo fator. Voltando, divida.',
      visual: reta(POLEGADAS, 'Os três saltos, com 1, 2, 3 polegadas em cima e 2,54, 5,08, 7,62 cm embaixo. Proposta: uma seta "× 2,54" de cima para baixo e "÷ 2,54" de volta.'),
      esboco: 'O porquê do sentido: peças grandes viram muitas peças pequenas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O piloto avisa: **10.000 pés** de altitude. 1 pé = **0,3048 m**. Quantos metros?',
      fala: 'O piloto avisa: dez mil pés de altitude. Um pé é zero vírgula três zero quatro oito metro. Quantos metros?',
      visual: reta({ de: 0, ate: 100, passo: 10, marcas: [0, 30.48, 100], unidade: 'cm' }, 'Um metro na reta, de 0 a 100 cm, com o pé marcado em 30,48: pouco menos de um terço do metro.'),
      opcoes: [
        {
          texto: '3.048 m', certa: true,
          explica: 'Isso. $10.000 \\times 0{,}3048 = 3.048$. O pé é menor que o metro: o número diminui.',
        },
        {
          texto: '32.808 m', erro: 'converte-no-sentido-errado',
          explica: 'Isso é 10.000 ÷ 0,3048. Um pé é menos que 1 m: em metros, o número tem de diminuir.',
        },
        {
          texto: '304.800 m', erro: 'fator-de-conversao-errado',
          explica: '30,48 é o pé em centímetros. Em metros, o fator é 0,3048: 3.048 m, uns 3 km.',
        },
      ],
      esboco: 'Aqui o fator é menor que 1: multiplicar diminui. Confere-se pelo tamanho, não pela palavra "multiplicar".',
    },
    {
      tipo: 'anote',
      titulo: 'Converter com fator',
      definicao: 'O fator diz quanto 1 unidade vale na outra: 1 pol = 2,54 cm. Multiplique por ele para ir. Divida para voltar.',
      exemplo: { tex: '50 \\text{ pol} = 50 \\times 2{,}54 \\text{ cm} = 127 \\text{ cm}', fala: 'cinquenta polegadas são cinquenta vezes dois vírgula cinquenta e quatro centímetros, cento e vinte e sete centímetros' },
      alerta: 'Confira o tamanho: 50 pol não podem dar 19,7 cm. Fatores: 1 pé = 30,48 cm, 1 milha ≈ 1,6 km, 1 milha náutica = 1,852 km.',
      esboco: 'A página do caderno com a tabela dos quatro fatores e as setas × e ÷.',
    },
    {
      tipo: 'mexa',
      texto: 'A milha da estrada tem cerca de **1,6 km**. Navios e aviões usam a **milha náutica**, que é maior. Toque nela.',
      fala: 'A milha da estrada tem cerca de um vírgula seis quilômetro. Navios e aviões usam a milha náutica, que é maior. Toque nela.',
      visual: reta({ ...MILHAS, unidade: 'km', escolhas: [1.6, 1.852] }, 'A reta de 0 a 2 km, com 1, 1,6 e 1,852 escritos. Dois círculos tocáveis: no 1,6 e no 1,852.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no círculo onde termina 1 milha náutica.',
        sucesso: { vizinho: 1.852 },
        mostre: 'Uma seta sai do 0, passa pelo 1,6 da milha comum e para no 1,852.',
      },
      descoberta: 'São duas unidades diferentes com o mesmo nome. A milha náutica tem 1,852 km; a da estrada, cerca de 1,6 km.',
      esboco: 'As duas réguas do desmonte, numa reta só. Proposta: o rótulo "milha" no 1,6 e "milha náutica" no 1,852.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um barco navega **10 milhas náuticas**. Quantos quilômetros?',
      fala: 'Um barco navega dez milhas náuticas. Quantos quilômetros?',
      visual: reta({ ...MILHAS, unidade: 'km' }, 'A reta das duas milhas, sem círculos.'),
      opcoes: [
        {
          texto: '18,52 km', certa: true,
          explica: 'Isso. $10 \\times 1{,}852 = 18{,}52$.',
        },
        {
          texto: '16 km', erro: 'milha-nautica-igual-milha',
          explica: 'Esse é o fator da milha da estrada. No mar, cada milha tem 1,852 km: 18,52 km.',
          mostra: reta({ ...MILHAS, unidade: 'km', saltos: [[0, 1.6, 'milha'], [0, 1.852, 'náutica']] }, 'Dois arcos saindo do 0: um para no 1,6, o outro vai até 1,852.'),
        },
        {
          texto: '5,4 km', erro: 'converte-no-sentido-errado',
          explica: 'Isso é 10 ÷ 1,852. Uma milha náutica passa de 1 km: em km, o número cresce.',
        },
      ],
      esboco: 'O erro do nome igual e o erro do sentido, juntos.',
    },
    {
      tipo: 'passo',
      problema: 'O piso da sala: placas de **1 pé** × **1 pé**, num chão de **4 m** × **3 m**. Quantas placas?',
      fala: 'O piso da sala: placas de um pé por um pé, num chão de quatro metros por três. Quantas placas?',
      visual: ret(SALA, 'A planta da sala de 4 m por 3 m, com 400 em cima e 300 do lado, em cm. Sem placas ainda.'),
      passos: [
        {
          pergunta: 'Um pé tem 12 polegadas. Quantos cm tem o lado da placa?',
          fala: 'Um pé tem doze polegadas. Quantos centímetros tem o lado da placa?',
          opcoes: [
            { texto: '30,48 cm', certa: true, explica: 'Isso. $12 \\times 2{,}54 = 30{,}48$ cm: um pouco mais que uma régua escolar.' },
            { texto: '12 cm', erro: 'fator-de-conversao-errado', explica: '12 é o lado em polegadas. Cada uma tem 2,54 cm: $12 \\times 2{,}54$.' },
          ],
          linha: { tex: '1 \\text{ pé} = 12 \\times 2{,}54 \\text{ cm} = 30{,}48 \\text{ cm}', fala: 'um pé são doze vezes dois vírgula cinquenta e quatro centímetros, trinta vírgula quarenta e oito centímetros' },
        },
        {
          pergunta: 'Os 4 m são 400 cm. Quantas placas numa fileira?',
          fala: 'Os quatro metros são quatrocentos centímetros. Quantas placas numa fileira?',
          opcoes: [
            { texto: '$400 \\div 30{,}48 \\approx 13{,}1$: 14 placas', certa: true, explica: 'Isso. Com 13, falta um pedaço de quase 4 cm. A 14ª placa é cortada.' },
            { texto: '$400 \\div 30{,}48 \\approx 13{,}1$: 13 placas', erro: 'ignora-contexto-do-resto', explica: '13 placas cobrem 396,24 cm. Os 3,76 cm que faltam também pedem piso: 14.' },
            { texto: '$400 \\times 30{,}48 = 12.192$ placas', erro: 'converte-no-sentido-errado', explica: 'Doze mil placas não cabem numa sala. A pergunta é quantas vezes 30,48 cabe em 400: divida.' },
          ],
          linha: { tex: '400 \\div 30{,}48 \\approx 13{,}1 \\;\\Rightarrow\\; 14 \\text{ placas}', fala: 'quatrocentos dividido por trinta vírgula quarenta e oito dá cerca de treze vírgula um, então catorze placas' },
        },
        {
          pergunta: 'Nos 3 m, $300 \\div 30{,}48 \\approx 9{,}8$. Quantas placas ao todo?',
          fala: 'Nos três metros, trezentos dividido por trinta vírgula quarenta e oito dá cerca de nove vírgula oito. Quantas placas ao todo?',
          opcoes: [
            { texto: '10 fileiras de 14: 140 placas', certa: true, explica: 'Isso. $14 \\times 10 = 140$ placas.', mostra: ret({ ...SALA, areas: [['14 × 10 = 140']] }, 'A sala coberta pela grade de placas, 14 por 10, com "14 × 10 = 140" no meio.') },
            { texto: '9 fileiras de 14: 126 placas', erro: 'ignora-contexto-do-resto', explica: '9 fileiras deixam uma faixa de quase 26 cm sem piso. São 10 fileiras.' },
            { texto: '14 + 10 = 24 placas', erro: 'soma-no-lugar-de-multiplicar', explica: '24 placas fazem uma fileira e uma coluna. O chão tem 10 fileiras de 14.' },
          ],
          linha: { tex: '14 \\times 10 = 140 \\text{ placas}', fala: 'catorze vezes dez são cento e quarenta placas' },
        },
      ],
      esboco: 'A missão da unidade: o fator (pé em cm), a divisão que conta quantas cabem, o arredondamento para cima e a área da unidade 3.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: a estrada até a praia tem **60 milhas**. Com 1 milha ≈ 1,6 km, quantos km são?',
      fala: 'No papel: a estrada até a praia tem sessenta milhas. Com uma milha cerca de um vírgula seis quilômetro, quantos quilômetros são?',
      resposta: 96,
      resolucao: [
        { tex: '1 \\text{ milha} \\approx 1{,}6 \\text{ km}', fala: 'uma milha é cerca de um vírgula seis quilômetro' },
        { tex: '60 \\times 1{,}6 = 96', fala: 'sessenta vezes um vírgula seis é noventa e seis' },
        { tex: '60 \\text{ milhas} \\approx 96 \\text{ km}', fala: 'sessenta milhas são cerca de noventa e seis quilômetros' },
      ],
      esboco: 'Milha para km: a unidade de chegada é menor, então o número cresce.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fator-conversao-n1', 'fator-conversao-n2', 'fator-conversao-n3'],
      esboco: 'Nível 1: polegadas em cm, com os saltos na reta. Nível 2: o sentido de volta (cm em polegadas) e a milha náutica. Nível 3: telas, altitudes, estradas e barcos, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A sala pede **140 placas** de 1 pé. Metro, litro, hora ou milha: você converte com sentido. Na próxima unidade: razão e proporção.',
      fala: 'A sala pede cento e quarenta placas de um pé. Metro, litro, hora ou milha: você converte com sentido. Na próxima unidade: razão e proporção.',
      visual: ret({ ...SALA, areas: [['140 placas']] }, 'A sala do começo da unidade, agora com "140 placas" no meio.'),
      esboco: 'Fecha a missão "O piso da sala" e a unidade. A TV do gancho (127 cm) já foi respondida na aposta.',
    },
  ],
}
