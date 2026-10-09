import type { Lab } from './types'

// Definição do laboratório "derivada" (Matemática, Cálculo 1). Conteúdo em components/labs/derivada/.

export const DERIVADA: Lab = {
  slug: 'derivada',
  title: 'A velocidade de um instante',
  subtitle: 'Aproxime duas medidas até elas virarem uma só e descubra a derivada, com os tempos reais de Usain Bolt.',
  area: 'Matemática',
  level: 'Graduação',
  track: 'calculo-1',
  minutes: 20,
  status: 'disponivel',
  concepts: ['Taxa de variação', 'Reta secante e tangente', 'Limite', 'Derivada'],
  accent: '#ff6b8b',
  achievement: {
    title: 'Caçador de instantes',
    description: 'Você transformou uma média em uma velocidade instantânea e mediu o pico de Usain Bolt.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Um velocímetro impossível',
      goal: 'Veja um carro sair do semáforo e desenhe o gráfico da posição dele.',
      vega:
        'Um carro imaginado sai do semáforo com posição s(t) = t² (em metros, t em segundos, de 0 a 10 s). O aluno arrasta o tempo e vê o carro andar e o gráfico posição × tempo ser desenhado (uma parábola). Em 10 s ele anda 100 m: média de 10 m/s. O paradoxo do lab: velocidade é distância ÷ tempo, mas o velocímetro mostra a velocidade "num instante", que não dura tempo nenhum (paradoxo da flecha de Zenão). Não explique a derivada ainda; deixe a pergunta no ar.',
      ask: ['Como o velocímetro sabe a velocidade num instante?', 'Por que o gráfico é curvo e não reto?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Média ou instante?',
      goal: 'Compare a velocidade média com a velocidade num instante.',
      vega:
        'Pergunta: de 0 a 5 s o carro andou 25 m, média de 5 m/s. No instante t = 5 s, a velocidade é maior, menor ou igual a 5 m/s? Resposta: maior (é 10 m/s), porque o carro está acelerando: no fim do intervalo ele já está mais rápido do que a média do intervalo. No gráfico, a reta do começo até t = 5 é menos inclinada que a curva em t = 5. Erro comum: achar que velocidade = posição ÷ tempo em qualquer caso. Não entregue antes de ele escolher.',
      ask: ['Me dá uma pista sem contar a resposta', 'O que é velocidade média?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'Encolha o intervalo',
      goal: 'Aproxime dois instantes até virarem um só.',
      vega:
        'Conceito: a velocidade média entre t = 5 e t = 5 + h é a inclinação da reta secante: (s(5 + h) − s(5)) / h = 10 + h para s = t². O aluno arrasta o segundo ponto em direção ao primeiro: h = 3 dá 13 m/s, h = 1 dá 11, h = 0,1 dá 10,1, h = 0,01 dá 10,01. Os valores se aproximam de 10: esse é o limite quando h → 0, e a secante vira a reta tangente. Depois um zoom mostra que de muito perto a curva parece reta (linearidade local): a derivada é a inclinação dessa reta. Note que não dá para pôr h = 0 direto (0/0); o limite é o valor do qual as médias se aproximam.',
      ask: ['Por que não posso simplesmente usar h = 0?', 'O que é uma reta tangente?', 'O que significa limite?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      label: 'No mundo real',
      title: 'Usain Bolt, 9,58 s',
      goal: 'Meça a velocidade de Bolt em cada instante da corrida do recorde mundial.',
      vega:
        'Dados reais: final dos 100 m do Mundial de Berlim, 16/08/2009, recorde mundial 9,58 s. Tempos parciais oficiais a cada 10 m (projeto de biomecânica da IAAF; Graubner & Nixdorf, New Studies in Athletics, 2011): 1,89; 2,88; 3,78; 4,64; 5,47; 6,29; 7,10; 7,92; 8,75; 9,58 s; tempo de reação 0,146 s. A curva suave é um MODELO ajustado a esses pontos (modelo de Keller com um termo de cansaço, erro < 0,2 m), não uma medida. O aluno arrasta a reta tangente pela curva e lê a inclinação = velocidade. Pico do modelo ≈ 12,2 m/s ≈ 44 km/h, por volta de 8 s; a média do melhor trecho de 10 m (60–70 m, 0,81 s) é 12,35 m/s. Depois ele vê que cada inclinação vira um ponto do gráfico de velocidade: a derivada também é uma função.',
      ask: ['Bolt corre mais rápido que um carro?', 'Por que a curva começa quase plana?', 'Como mediram esses tempos?'],
    },
    {
      id: 'resolva',
      kind: 'medicao',
      label: 'Resolva',
      title: 'A conta do instante',
      goal: 'Calcule a velocidade exata no instante, passo a passo.',
      vega:
        'Resolução guiada. Problema 1: velocidade do carro s(t) = t² em t = 5. Passos: média = ((5 + h)² − 25)/h; expandir (5 + h)² = 25 + 10h + h²; simplificar (10h + h²)/h = 10 + h (h ≠ 0); fazer h → 0: 10 m/s. Erros comuns: (5 + h)² = 25 + h²; cancelar h antes de subtrair; dizer que 0/0 dá 0. Problema 2: o mesmo para um t qualquer: ((t + h)² − t²)/h = 2t + h → 2t; a derivada de t² é 2t, uma função. Problema 3 (sozinho): s(t) = 3t² + t, velocidade em t = 2: a derivada é 6t + 1, que dá 13. Guie com perguntas sobre o próximo passo, sem dar o resultado.',
      ask: ['Por que (5 + h)² não é 25 + h²?', 'Posso cortar o h de cima com o de baixo?', 'Existe um atalho para derivar?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'E se…?',
      goal: 'Use a ideia de derivada em situações que você só pode imaginar.',
      vega:
        'Desafios: (1) Em t = 0 a velocidade do carro é 0 (2·0 = 0), mas ele está acelerando: velocidade zero não é o mesmo que estar parado para sempre. (2) A curva y = |x| tem um bico em x = 0: as inclinações são −1 à esquerda e +1 à direita; de perto ela nunca fica reta, então não há derivada ali. (3) A derivada de v(t) = 2t é 2: é a aceleração, 2 m/s². A derivada da derivada mede como a velocidade muda.',
      ask: ['Toda curva tem derivada?', 'O que é aceleração?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'A inclinação de um instante',
      goal: 'O que você descobriu e para onde ir agora.',
      vega:
        "Resumo: a derivada é o limite das taxas médias quando o intervalo encolhe, f'(x) = lim (f(x + h) − f(x))/h com h → 0. Geometricamente, é a inclinação da reta tangente. O aluno calculou v(5) = 10 m/s para s = t², achou s' = 2t e mediu o pico de Bolt (≈ 12,2 m/s no modelo). Próximo passo: o laboratório 'Somando fatias infinitas' (integral), que faz o caminho inverso: da velocidade de volta à distância.",
      ask: ['Para que mais serve a derivada?', 'O que a integral tem a ver com isso?'],
    },
  ],
}
