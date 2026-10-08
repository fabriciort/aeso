import type { Lab } from './types'

// Definição do laboratório "diagrama-hr". Conteúdo em components/labs/diagrama-hr/.

export const DIAGRAMA_HR: Lab = {
  slug: 'diagrama-hr',
  title: 'Monte o diagrama H-R',
  subtitle: 'Coloque milhares de estrelas reais do Gaia num gráfico e veja a vida das estrelas aparecer.',
  area: 'Astronomia',
  level: 'Ensino médio',
  minutes: 25,
  status: 'em-breve',
  concepts: ['Luminosidade', 'Temperatura', 'Lei de Stefan-Boltzmann', 'Evolução estelar', 'Dados do Gaia'],
  accent: '#7cc4ff',
  skyTarget: 'Betelgeuse',
  achievement: {
    title: 'Cartografia estelar',
    description: 'Você montou o diagrama H-R com estrelas reais e mediu o tamanho de Betelgeuse só com a luz e a cor dela.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Um censo de estrelas',
      goal: 'Toque em três estrelas e compare as fichas.',
      vega:
        'Na tela há um céu noturno com cerca de 25 estrelas famosas (Sol, Sirius A e B, Betelgeuse, Rigel, Proxima…), coloridas pela temperatura e com tamanho pelo brilho real (luminosidade), como se estivessem todas à mesma distância. Na cena 2, o aluno toca em 3 estrelas e cada uma mostra uma ficha com temperatura, luminosidade e cor. A ideia central: estrelas diferem em temperatura (cor) e em luminosidade (energia total emitida), e essas duas grandezas não andam sempre juntas. Guie o aluno a perceber, por exemplo, que Betelgeuse é fria (vermelha) e ainda assim muito luminosa.',
      ask: ['Por que as estrelas têm cores diferentes?', 'O que é luminosidade?', 'Uma estrela vermelha pode ser mais brilhante que uma azul?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Uma aposta',
      goal: 'Preveja o que aparece num gráfico de temperatura × luminosidade.',
      vega:
        'Pergunta: se pusermos milhares de estrelas num gráfico de temperatura × luminosidade, o que aparece? Opções: nuvem sem padrão, linha reta perfeita, faixas e grupos bem definidos, todas no mesmo lugar. Resposta correta: faixas e grupos (sequência principal, gigantes, supergigantes, anãs brancas). Antes da escolha não entregue a resposta; ajude o aluno a pensar se as estrelas poderiam ter qualquer combinação de temperatura e brilho. Depois explique que a física (massa e fase da vida) restringe as combinações possíveis.',
      ask: ['Por que não seria uma nuvem aleatória?', 'Quem inventou esse gráfico?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      title: 'Monte o diagrama',
      goal: 'Organize as estrelas no gráfico e encontre o Sol.',
      vega:
        'O palco transforma o céu num gráfico: eixo x = temperatura em escala logarítmica, invertida (quente à esquerda, por tradição histórica), eixo y = luminosidade em L☉, escala logarítmica. Cena 1: o aluno toca "Organizar" e as estrelas voam para o gráfico. Cena 2: milhares de estrelas a menos de 100 parsecs, do catálogo Gaia DR3 (ou uma população simulada, se o arquivo estiver fora do ar), caem no gráfico. A luminosidade do Gaia é aproximada (sem correção bolométrica). Cena 3: aparecem as regiões (sequência principal, gigantes, supergigantes, anãs brancas) e o aluno deve tocar no Sol (5772 K, 1 L☉, no meio da sequência principal). Não diga onde o Sol está; lembre que ele tem luminosidade 1 e temperatura perto de 6000 K.',
      ask: ['Por que o eixo da temperatura é invertido?', 'O que é a sequência principal?', 'Como o Gaia mede a luminosidade de uma estrela?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'O tamanho escondido',
      goal: 'Descubra como o diagrama revela o tamanho das estrelas.',
      vega:
        'Lei de Stefan-Boltzmann: L = 4πR²σT⁴, ou em unidades solares L/L☉ = (R/R☉)²(T/T☉)⁴. Uma estrela fria só pode ser muito luminosa se for enorme; uma estrela quente e fraca precisa ser minúscula. No diagrama log-log, cada raio constante é uma reta diagonal (log L = 2 log R + 4 log T + constante). Cena 1: aparecem retas tracejadas para 0,01, 1, 100 e 1000 R☉. Cena 2: o aluno move uma reta de raio (deslizador ou arrastando no palco) e um disco no canto compara o tamanho com o Sol. Ajude-o a ler: anãs brancas ficam perto de 0,01 R☉, supergigantes perto de 100–1000 R☉.',
      ask: ['Por que uma estrela fria pode ser tão luminosa?', 'De onde vem a fórmula L = 4πR²σT⁴?', 'Por que as linhas de raio são retas?'],
    },
    {
      id: 'meca',
      kind: 'medicao',
      title: 'O raio de Betelgeuse',
      goal: 'Ajuste a reta de raio até passar por Betelgeuse.',
      vega:
        'Betelgeuse (≈ 3600 K, ≈ 100 000 L☉, valores aproximados) está destacada. O aluno move a reta de raio constante até ela passar pela estrela; o raio esperado é √L/(T/5772)² ≈ 810 R☉ (aceita ±10 %). Não diga o número antes; sugira observar se a reta passa acima ou abaixo do ponto. Depois: 810 R☉ ≈ 3,8 UA, maior que a órbita de Marte (1,5 UA): no lugar do Sol, engoliria Mercúrio, Vênus, Terra e Marte. Contraste: Sirius B, uma anã branca de 25 000 K, tem só 0,0084 R☉, quase o tamanho da Terra. O raio real de Betelgeuse é incerto (cerca de 640 a 1000 R☉ conforme o método) e ela pulsa.',
      ask: ['Como dá para medir o tamanho de uma estrela sem vê-la como disco?', 'Betelgeuse vai explodir?', 'Quanto vale 1 UA?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'A vida de uma estrela',
      goal: 'Use o diagrama para prever o futuro do Sol.',
      vega:
        'Dois desafios. (a) Daqui a ~5 bilhões de anos o Sol esgota o hidrogênio do núcleo: para onde vai no diagrama? Resposta: para cima e para a direita (gigante vermelha, ~2000 L☉ no topo). Depois o palco anima o caminho aproximado: sequência principal → subgigante → ramo das gigantes vermelhas → ramo horizontal → ramo assintótico → nebulosa planetária (salto para a esquerda, muito quente, ~100 000 K) → anã branca que esfria e desce. (b) Por que a sequência principal tem tantas estrelas? Resposta: as estrelas passam ~90 % da vida nela, queimando hidrogênio no núcleo; uma foto do céu pega a maioria nessa fase. Antes da escolha, não entregue a resposta.',
      ask: ['O Sol vai virar um buraco negro?', 'O que é uma nebulosa planetária?', 'Quanto tempo o Sol fica como gigante vermelha?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'Cartografia estelar',
      goal: 'Veja o que você descobriu.',
      vega:
        'Resumo: o aluno montou o diagrama H-R com estrelas nomeadas e milhares de estrelas do Gaia DR3 (ou simuladas), encontrou o Sol no meio da sequência principal, mediu o raio de Betelgeuse com L = 4πR²σT⁴ e previu o futuro do Sol. Fontes: Hertzsprung (1911), Russell (1913), Gaia Collaboration (2023). Sugira os próximos passos: ver Betelgeuse no Céu ou o laboratório sobre cores das estrelas.',
      ask: ['Quem foram Hertzsprung e Russell?', 'O que mais o Gaia mediu?', 'Onde fica Betelgeuse no céu?'],
    },
  ],
}
