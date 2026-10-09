import type { Lab } from './types'

// Definição do laboratório "cor-das-estrelas". Conteúdo em components/labs/cor-das-estrelas/.

export const COR_DAS_ESTRELAS: Lab = {
  slug: 'cor-das-estrelas',
  title: 'Por que as estrelas têm cores',
  subtitle: 'Aqueça um objeto imaginário e descubra a temperatura de Betelgeuse, de Rigel e do Sol.',
  area: 'Física',
  level: 'Todos',
  minutes: 15,
  status: 'disponivel',
  concepts: ['Radiação de corpo negro', 'Lei de Wien', 'Temperatura', 'Espectro'],
  accent: '#ff8a65',
  skyTarget: 'Betelgeuse',
  achievement: {
    title: 'Termômetro cósmico',
    description: 'Você mediu a temperatura do Sol só pela forma da luz dele.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Uma esfera no fogo',
      goal: 'Aqueça um objeto imaginário e veja a cor da luz que ele emite.',
      vega:
        'O aluno aquece uma esfera de metal imaginária (de 300 K a 30.000 K) arrastando no palco. Ela começa escura, brilha vermelho escuro perto de 800 K (ponto de Draper), depois laranja, amarelo, branco e, muito quente, branco-azulado. Tarefas: chegar à brasa (≥ 1.000 K) e ao branco-azulado (≥ 9.000 K). Ideia central: a cor da luz de um objeto quente depende só da temperatura. Exemplos do cotidiano: brasa, filamento de lâmpada incandescente (~2.700 K), ferro na forja.',
      ask: ['Por que a esfera não brilha no começo?', 'Por que objetos quentes emitem luz?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Vermelha ou azul?',
      goal: 'Use o que você viu para comparar duas estrelas.',
      vega:
        'Pergunta de previsão: uma estrela avermelhada (A, ~3.200 K) e uma azulada (B, ~15.000 K). Qual é mais quente? Resposta: B, a azul. Muitos alunos erram por causa das torneiras e do senso comum (vermelho = quente). Não entregue a resposta antes de ele escolher; depois, ligue ao que ele viu na esfera.',
      ask: ['Me dá uma pista sem contar a resposta', 'Por que as torneiras usam vermelho para quente?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'O arco-íris escondido',
      goal: 'Veja quanta luz de cada cor um objeto quente emite.',
      vega:
        'Conceito: radiação de corpo negro (lei de Planck). Um objeto quente emite em todos os comprimentos de onda, com uma curva que tem um pico. O gráfico mostra a forma da curva (normalizada pelo pico) de 0 a 2.500 nm, com a faixa visível (380–750 nm) colorida. Lei de Wien: λpico = 2.898.000 nm·K ÷ T. Ex.: 5.772 K → 502 nm; 3.000 K → 966 nm (infravermelho); 12.000 K → 241 nm (ultravioleta). Também vale dizer que um objeto mais quente emite MAIS luz em todas as cores (lei de Stefan-Boltzmann, ∝ T⁴), mas aqui o foco é a forma.',
      ask: ['O que é o pico da curva?', 'Por que a curva continua fora do arco-íris?', 'De onde vem o número 2.898.000?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      title: 'Órion de verdade',
      goal: 'Compare as cores reais de duas estrelas famosas.',
      vega:
        'O aluno vê a constelação de Órion (posições reais). Betelgeuse (ombro, supergigante vermelha, ~3.600 K, Levesque & Massey 2020) e Rigel (pé, supergigante azul, ~12.100 K, Przybilla et al. 2006). Ao tocar em cada estrela, a curva de corpo negro dela aparece: o pico de Betelgeuse fica em ~805 nm (infravermelho próximo), o de Rigel em ~240 nm (ultravioleta). Órion aparece no céu do Brasil nas noites de verão (dezembro a março). Estrelas reais não são corpos negros perfeitos, mas chegam perto.',
      ask: ['Por que Betelgeuse é tão grande se é fria?', 'Dá para ver essas cores a olho nu?'],
    },
    {
      id: 'meca',
      kind: 'medicao',
      title: 'O termômetro de luz',
      goal: 'Meça a temperatura da superfície do Sol pela forma da luz dele.',
      vega:
        'O aluno ajusta a temperatura de uma curva de corpo negro (2.500–10.000 K) até ela passar pelos pontos do espectro do Sol (pontos simulados a partir da forma real: corpo negro de 5.772 K com linhas de absorção e o "cobertor de linhas" no ultravioleta). O valor esperado é ~5.800 K (temperatura efetiva do Sol: 5.772 K). Dica: olhar onde fica o pico dos pontos, não as pontas. Não diga o número antes de ele tentar.',
      ask: ['Como sei se a curva encaixou?', 'Por que alguns pontos ficam abaixo da curva?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'E se…?',
      goal: 'Use a lei de Wien em situações que você só pode imaginar.',
      vega:
        'Desafios: (1) Corpo humano a 310 K: pico em 2.898.000/310 ≈ 9.350 nm (infravermelho térmico), por isso câmeras térmicas veem pessoas no escuro. (2) Por que não há estrelas verdes: a curva é larga; com o pico no verde, as outras cores vêm juntas e a mistura parece branca (o Sol visto do espaço é branco). (3) Pico em 290 nm: T = 2.898.000/290 ≈ 10.000 K (estrela branco-azulada como Vega). Ajude a montar a conta T = 2.898.000 ÷ λ, com λ em nanômetros.',
      ask: ['Como monto essa conta?', 'Por que o Sol parece amarelo daqui da Terra?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'A cor é um termômetro',
      goal: 'O que você descobriu e para onde ir agora.',
      vega:
        'Resumo: a cor da luz de um objeto quente revela a temperatura dele (lei de Wien, λpico = 2.898.000 ÷ T). Estrelas vermelhas são as "frias" (~3.000 K), azuis as mais quentes (>10.000 K). O aluno mediu a temperatura do Sol pelo espectro. Próximos passos: o laboratório "Monte o diagrama H-R" (temperatura × luminosidade) e procurar Betelgeuse no Céu.',
      ask: ['Como os astrônomos medem o espectro de uma estrela?', 'O que é o diagrama H-R?'],
    },
  ],
}
