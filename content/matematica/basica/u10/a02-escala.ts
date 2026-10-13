import type { Aula, Visual } from '@/lib/formation/schema'

// Escala: a razão entre a medida no desenho e a medida de verdade. Começa no
// mapa da viagem (1 cm = 50 km), onde cada centímetro é um salto de 50 km na
// reta, e a tabela de proporção mostra a seta × 50 que vale para qualquer
// distância. Depois a planta baixa (1 : 100), em que os dois números estão
// na mesma unidade. Os erros a desmontar: somar a escala (4 cm viram 54 km),
// multiplicar no caminho de volta (150 km viram 7.500 cm) e esquecer a
// unidade da escala 1 : 100 (a sala de 4 cm vira 400 m).

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const tabela = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })

/** Saltos de 50 km, um por centímetro do mapa; só o primeiro leva o rótulo. */
const saltos = (n: number) => Array.from({ length: n }, (_, i) => (i === 0 ? [0, 50, '1 cm'] : [50 * i, 50 * (i + 1)]))
const ESTRADA = { de: 0, ate: 400, passo: 50, marcas: [0, 100, 200, 300, 400], unidade: 'km' }
const REGUA = { de: 0, ate: 5, passo: 1, marcas: [0, 1, 2, 3, 4, 5] }

export const aula: Aula = {
  id: 'B.U10.A2',
  titulo: 'Escala',
  objetivo: 'Usar a escala de um mapa (1 cm = 50 km) ou de uma planta (1 : 100) para passar da medida no desenho para a medida de verdade, e de volta.',
  modelo: 'reta',
  esboco: 'O mapa da viagem: a régua do mapa diz 1 cm = 50 km. Na tabela de proporção, cada coluna é uma distância no mapa, e a seta × 50 à direita leva o mapa à estrada. Momento-chave: a seta × 50 vale para toda coluna; ela é a escala. Na reta em km, 7 cm são 7 saltos de 50. O caminho de volta divide. Depois a planta baixa 1 : 100: 1 cm do papel vale 100 cm, que é 1 m.',
  vega: 'Ideia central: escala é uma razão, a do tamanho no desenho para o tamanho de verdade. "1 cm = 50 km" diz que cada centímetro do mapa vale 50 km: do desenho para a verdade, multiplica-se por 50; da verdade para o desenho, divide-se. Na escala numérica 1 : 100, os dois números estão na mesma unidade: 1 cm vale 100 cm (1 m), 1 mm vale 100 mm. Erros esperados: somar a escala (4 cm virando 54 km), multiplicar no caminho de volta (150 km virando 7.500 cm), esquecer a unidade (a sala de 4 cm na escala 1 : 100 virando 400 m). Guie com "Quantos saltos de 50?", "O desenho é maior ou menor que a coisa de verdade?", "Em que unidade está a conta?". A distância no mapa é em linha reta; a estrada de verdade costuma ser um pouco maior.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na régua do mapa da viagem: **1 cm = 50 km**. A cidade fica a **4 cm** de você, no mapa. Quantos quilômetros de verdade?',
      fala: 'Na régua do mapa da viagem: um centímetro vale cinquenta quilômetros. A cidade fica a quatro centímetros de você, no mapa. Quantos quilômetros de verdade?',
      visual: reta({ ...REGUA, numero: 4, unidade: 'cm' }, 'Uma régua de 0 a 5 cm, como a do mapa, com um ponto âmbar em 4 cm: a cidade.'),
      esboco: 'Um mapa de papel, de estrada. A pergunta fica aberta.',
    },
    {
      tipo: 'mexa',
      texto: 'Na tabela, em cima a medida no mapa, embaixo a de verdade. Toque para ver até os 4 cm da cidade.',
      fala: 'Na tabela, em cima a medida no mapa, embaixo a de verdade. Toque para ver até os quatro centímetros da cidade.',
      visual: tabela(
        { linhas: [{ rotulo: 'no mapa (cm)', valores: [1, 2, 3, 4] }, { rotulo: 'de verdade (km)', valores: [50, 100, 150, 200] }], fator: '× 50', mostradas: 1, completar: true },
        'A tabela de proporção com a primeira coluna (1 cm, 50 km) e a seta "× 50" à direita, do mapa para a estrada. Três caixas vazias à direita.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na próxima coluna vazia, até a quarta.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem: 2 cm e 100 km, 3 cm e 150 km, 4 cm e 200 km.',
      },
      descoberta: 'Em toda coluna, a medida de verdade é a do mapa vezes 50. A cidade a 4 cm fica a 200 km.',
      esboco: 'A seta × 50 já está lá, à direita, e vale para cada coluna nova. Responde ao gancho: 200 km.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A praia fica a **7 cm** no mapa. Quantos quilômetros de verdade?',
      fala: 'A praia fica a sete centímetros no mapa. Quantos quilômetros de verdade?',
      visual: reta({ ...ESTRADA, saltos: saltos(1) }, 'A reta da estrada, de 0 a 400 km, com um só salto âmbar de 0 a 50, marcado "1 cm".'),
      opcoes: [
        {
          texto: '350 km', certa: true,
          explica: 'Isso. 7 saltos de 50 km: $7 \\times 50 = 350$.',
          fala: 'Trezentos e cinquenta quilômetros.',
          mostra: reta({ ...ESTRADA, saltos: saltos(7), numero: 350 }, 'Os saltos de 50 km aparecem um depois do outro, 7 ao todo, e param em 350.'),
        },
        {
          texto: '57 km', erro: 'pensa-aditivamente',
          explica: '57 km mal passa do primeiro centímetro. Cada centímetro vale 50 km: são 7 saltos de 50.',
          fala: 'Cinquenta e sete quilômetros.',
          mostra: reta({ ...ESTRADA, saltos: saltos(1), numero: 57 }, 'O ponto 57 logo depois do primeiro salto. A reta inteira ainda está à frente.'),
        },
        {
          texto: '50 km',
          explica: '50 km é só o primeiro centímetro. A praia está a 7 deles: 350 km.',
          fala: 'Cinquenta quilômetros.',
          mostra: reta({ ...ESTRADA, saltos: saltos(7), numero: 350 }, 'Os 7 saltos de 50 km, até 350.'),
        },
      ],
      esboco: 'A reta mostra a escala como saltos iguais. A isca 57 é o erro aditivo (7 + 50).',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora o contrário. Uma estrada de **150 km** mede quantos centímetros no mapa?',
      fala: 'Agora o contrário. Uma estrada de cento e cinquenta quilômetros mede quantos centímetros no mapa?',
      visual: reta({ ...ESTRADA, numero: 150 }, 'A reta da estrada com o ponto âmbar em 150 km, sem saltos.'),
      opcoes: [
        {
          texto: '3 cm', certa: true,
          explica: 'Isso. Quantos 50 cabem em 150? $150 \\div 50 = 3$ saltos, 3 cm.',
          fala: 'Três centímetros.',
          mostra: reta({ ...ESTRADA, saltos: saltos(3), numero: 150 }, 'Três saltos de 50 km chegam a 150: 3 cm no mapa.'),
        },
        {
          texto: '7.500 cm', erro: 'converte-no-sentido-errado',
          explica: '7.500 cm são 75 m: maior que o mapa inteiro! Do real para o mapa, divida por 50.',
          fala: 'Sete mil e quinhentos centímetros.',
          mostra: reta({ ...ESTRADA, saltos: saltos(3), numero: 150 }, 'Os 3 saltos de 50 km até 150.'),
        },
        {
          texto: '100 cm', erro: 'pensa-aditivamente',
          explica: '$150 - 50$ não conta os saltos. 100 cm é um metro de mapa! Cabem 3 saltos de 50: 3 cm.',
          fala: 'Cem centímetros.',
          mostra: reta({ ...ESTRADA, saltos: saltos(3), numero: 150 }, 'Os 3 saltos de 50 km até 150.'),
        },
      ],
      esboco: 'O caminho de volta é a divisão. "O mapa cabe na mesa?" desmonta o 7.500 sem conta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A planta baixa do apartamento tem escala **1 : 100**. A sala mede **4 cm** no papel. E de verdade?',
      fala: 'A planta baixa do apartamento tem escala um para cem. A sala mede quatro centímetros no papel. E de verdade?',
      visual: reta({ ...REGUA, numero: 4, unidade: 'cm' }, 'A régua de 0 a 5 cm sobre a planta, com o ponto âmbar em 4 cm: a parede da sala.'),
      opcoes: [
        {
          texto: '4 m', certa: true,
          explica: 'Isso. Em 1 : 100, 1 cm do papel vale 100 cm, que é 1 m. 4 cm valem 400 cm: 4 m.',
          fala: 'Quatro metros.',
          mostra: reta({ ...REGUA, numero: 4, unidade: 'm' }, 'A mesma régua, agora em metros: cada centímetro do papel virou 1 m de verdade. O ponto em 4 m.'),
        },
        {
          texto: '400 m', erro: 'escala-unidade-esquecida',
          explica: 'Uma sala de 400 m teria quatro quarteirões! Os dois lados da escala estão em cm: 400 cm, que são 4 m.',
          fala: 'Quatrocentos metros.',
          mostra: reta({ ...REGUA, numero: 4, unidade: 'm' }, 'A régua em metros: a sala tem 4 m.'),
        },
        {
          texto: '104 cm', erro: 'pensa-aditivamente',
          explica: 'Escala não se soma. Cada centímetro do papel vale 100: $4 \\times 100 = 400$ cm, 4 m.',
          fala: 'Cento e quatro centímetros.',
          mostra: reta({ ...REGUA, numero: 4, unidade: 'm' }, 'A régua em metros: 4 cm do papel são 4 m.'),
        },
      ],
      esboco: 'A escala numérica: sem unidade escrita, os dois lados usam a mesma. A régua troca o rótulo de cm para m.',
    },
    {
      tipo: 'anote',
      titulo: 'Escala',
      definicao: '**Escala** é a razão entre a medida no desenho e a medida de verdade. Na escala $1 : 100$, 1 cm no papel vale 100 cm de verdade.',
      exemplo: { tex: '1 : 100 \\Rightarrow 4 \\text{ cm} \\to 400 \\text{ cm} = 4 \\text{ m}', fala: 'na escala um para cem, quatro centímetros do papel são quatrocentos centímetros, ou quatro metros' },
      alerta: 'Do desenho para a verdade, **multiplique**. Da verdade para o desenho, **divida**. Confira se a medida tem cara de verdade.',
      esboco: 'Na página: a régua do mapa (1 cm = 50 km) e a da planta (1 : 100), com 4 cm → 200 km e 4 cm → 4 m.',
    },
    {
      tipo: 'passo',
      problema: 'O quarto mede **3,5 m** de comprimento. Na planta, com escala **1 : 100**, quantos centímetros ele tem?',
      fala: 'O quarto mede três vírgula cinco metros de comprimento. Na planta, com escala um para cem, quantos centímetros ele tem?',
      visual: reta({ de: 0, ate: 4, passo: 0.5, marcas: [0, 1, 2, 3, 4], numero: 3.5, unidade: 'm' }, 'Uma trena de 0 a 4 m com o ponto âmbar em 3,5 m: a parede do quarto.'),
      passos: [
        {
          pergunta: 'Primeiro, a medida de verdade em centímetros, a unidade da planta.',
          opcoes: [
            { texto: '350 cm', certa: true, explica: 'Isso. Cada metro tem 100 cm.', mostra: reta({ de: 0, ate: 400, passo: 50, marcas: [0, 100, 200, 300, 400], numero: 350, unidade: 'cm' }, 'A mesma trena, agora em centímetros: de 0 a 400 cm, com o ponto âmbar em 350 cm.') },
            { texto: '35 cm', erro: 'fator-de-conversao-errado', explica: '35 cm é um palmo e meio. Cada metro tem 100 cm: 350 cm.' },
          ],
          linha: { tex: '3{,}5 \\text{ m} = 350 \\text{ cm}', fala: 'três vírgula cinco metros são trezentos e cinquenta centímetros' },
        },
        {
          pergunta: 'Da verdade para o papel…',
          opcoes: [
            { texto: '$350 \\div 100 = 3{,}5$ cm', fala: 'trezentos e cinquenta dividido por cem: três vírgula cinco centímetros', certa: true, explica: 'Isso. O papel é 100 vezes menor: 3,5 cm.', mostra: reta({ de: 0, ate: 5, passo: 0.5, marcas: [0, 1, 2, 3, 4, 5], numero: 3.5, unidade: 'cm' }, 'A régua da planta, de 0 a 5 cm, com o ponto âmbar em 3,5 cm: o quarto no papel.') },
            { texto: '$350 \\times 100 = 35.000$ cm', fala: 'trezentos e cinquenta vezes cem: trinta e cinco mil centímetros', erro: 'converte-no-sentido-errado', explica: '35.000 cm são 350 m: a planta seria maior que o prédio. Do real para o papel, divida.' },
          ],
          linha: { tex: '350 \\div 100 = 3{,}5 \\text{ cm}', fala: 'trezentos e cinquenta dividido por cem dá três vírgula cinco centímetros' },
        },
      ],
      esboco: 'Mesma unidade dos dois lados, depois dividir. Na escala 1 : 100, o número em metros vira o número em centímetros.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: no mapa da trilha, **1 cm = 200 m**. A trilha mede **7 cm** no mapa. Quantos metros ela tem?',
      fala: 'No papel: no mapa da trilha, um centímetro vale duzentos metros. A trilha mede sete centímetros no mapa. Quantos metros ela tem?',
      resposta: 1400,
      resolucao: [
        { tex: '\\text{desenho} \\to \\text{verdade}: \\times 200', fala: 'do desenho para a verdade: vezes duzentos' },
        { tex: '7 \\times 200 = 1.400 \\text{ m}', fala: 'sete vezes duzentos são mil e quatrocentos metros' },
      ],
      esboco: 'Na resolução, a reta com 7 saltos de 200 m.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['escala-n1', 'escala-n2', 'escala-n3'],
      esboco: 'Nível 1: do mapa para a verdade (1 cm = 50 km), com a tabela. Nível 2: a planta 1 : 100 ou 1 : 50, com a resposta em metros. Nível 3: da verdade para o desenho, sem apoio.',
    },
    {
      tipo: 'fecho',
      texto: 'A cidade a 4 cm no mapa fica a **200 km**: 4 saltos de 50. Na próxima aula, a tabela acha qualquer número que falta.',
      fala: 'A cidade a quatro centímetros no mapa fica a duzentos quilômetros: quatro saltos de cinquenta. Na próxima aula, a tabela acha qualquer número que falta.',
      visual: reta({ ...ESTRADA, saltos: saltos(4), numero: 200 }, 'A reta da estrada com 4 saltos de 50 km, até a cidade em 200 km.'),
      esboco: 'Responde ao gancho na reta.',
    },
  ],
}
