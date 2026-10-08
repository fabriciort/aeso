import type { Lab } from './types'
import { COR_DAS_ESTRELAS } from './cor-das-estrelas'
import { DIAGRAMA_HR } from './diagrama-hr'
import { ORBITAS } from './orbitas'
import { UNIVERSO_EM_EXPANSAO } from './universo-em-expansao'

// The lab catalog. Content components live in components/labs/<slug>/.

export const EXOPLANETA: Lab = {
  slug: 'exoplaneta',
  title: 'Encontre um exoplaneta',
  subtitle: 'Descubra o tamanho de um planeta que você nunca vai ver, só pela sombra que ele faz na luz da estrela.',
  area: 'Astronomia',
  level: 'Todos',
  minutes: 20,
  status: 'disponivel',
  concepts: ['Método do trânsito', 'Curva de luz', 'Razão de raios', 'Dados do TESS'],
  accent: '#f6b74e',
  achievement: {
    title: 'Caçador de exoplanetas',
    description: 'Você mediu o tamanho de um planeta fora do Sistema Solar com dados reais do TESS.',
  },
  target: {
    name: 'WASP-121',
    ra: 107.60025,
    dec: -39.09727,
    period: 1.2749255,
    aR: 3.754,
    impact: 0.1,
    radiusRatio: 0.1245,
    starRadiusSun: 1.458,
    distanceLy: 880,
    limbDarkening: { u1: 0.33, u2: 0.22 },
    reference: 'Delrez et al. (2016), MNRAS 458, 4025',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Uma sombra na luz',
      goal: 'Veja o que acontece com o brilho de uma estrela quando um planeta passa na frente dela.',
      vega:
        'O aluno controla um simulador: uma estrela parecida com o Sol e um planeta que cruza o disco. Ele pode mudar o tamanho do planeta (de Terra a 2× Júpiter) e ver a curva de luz (brilho × tempo) sendo desenhada. Ideia central: o planeta bloqueia uma fração da luz e o brilho cai enquanto ele está na frente; quanto maior o planeta, maior a queda. Incentive a observar a forma da queda (descida, fundo, subida).',
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Faça uma aposta',
      goal: 'Se o planeta tivesse o dobro do tamanho, o que aconteceria com a queda de brilho?',
      vega:
        'Pergunta de previsão: se o raio do planeta dobra, a queda de brilho fica 4× maior, porque o que importa é a ÁREA do disco do planeta (proporcional ao raio ao quadrado). Não entregue a resposta antes de o aluno escolher; depois, ajude-o a entender por que a área cresce com o quadrado do raio.',
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'A regra da sombra',
      goal: 'A queda de brilho é a fração da estrela que o planeta cobre.',
      vega:
        'Conceito: profundidade do trânsito δ ≈ (Rp/R★)², a razão entre a área do disco do planeta e a área do disco da estrela. Ex.: Júpiter na frente do Sol: (0,1)² = 1 %. Terra: (0,0092)² ≈ 0,0084 %. O aluno mexe num controle e vê as áreas. Mencione que o escurecimento de borda da estrela (a borda é mais escura que o centro) muda um pouco a forma, mas a regra é essa.',
    },
    {
      id: 'observe',
      kind: 'observacao',
      title: 'Agora, de verdade',
      goal: 'O mesmo fenômeno numa estrela de verdade: WASP-121, observada pelo telescópio espacial TESS.',
      vega:
        'O aluno vê a curva de luz real de WASP-121 medida pelo TESS durante cerca de 27 dias (um setor). As quedas regulares a cada ~1,27 dia são o planeta WASP-121 b passando na frente da estrela. O ruído (pontos espalhados) vem de fótons e do instrumento. Depois ele "empilha" os trânsitos (dobra a curva no período orbital) para somar todos e reduzir o ruído. Explique o que é período e por que empilhar ajuda.',
    },
    {
      id: 'meca',
      kind: 'medicao',
      title: 'Meça o planeta',
      goal: 'Ajuste o tamanho do planeta até o modelo encaixar nos dados.',
      vega:
        'O aluno ajusta a razão de raios k = Rp/R★ de um modelo de trânsito até ele coincidir com os trânsitos empilhados. O valor de literatura é cerca de 0,12 (queda ≈ 1,5 %). Com a estrela tendo 1,46 raio solar, o planeta tem ≈ 1,8 raio de Júpiter: é um "Júpiter quente" inflado. Dê dicas sobre olhar o fundo da queda, não as bordas. Não diga o valor exato antes de ele tentar.',
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'E se…?',
      goal: 'Use a regra da sombra em situações que você só pode imaginar.',
      vega:
        'Desafios hipotéticos. (1) Terra na frente do Sol: k = 1/109 ≈ 0,0092, δ ≈ 0,0084 % ≈ 84 ppm (muito difícil de detectar). (2) Planeta do tamanho de Júpiter na frente de uma anã vermelha de 0,2 R☉: k = 0,1/0,2 = 0,5, δ ≈ 25 %. Ajude o aluno a montar a conta k = Rp/R★ e elevar ao quadrado, com as unidades na mesma escala.',
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'Você mediu um mundo',
      goal: 'O que você descobriu e para onde ir agora.',
      vega:
        'Resumo: o método do trânsito usa a queda de brilho para medir o tamanho do planeta (δ ≈ (Rp/R★)²); o período diz quanto tempo dura o ano do planeta; WASP-121 b tem ≈ 1,8 R♃ e um ano de ~30 horas. Sugira próximos passos: o explorador do Céu, ou pensar em como medir a massa (velocidade radial).',
    },
  ],
}

export const LABS: Lab[] = [EXOPLANETA, COR_DAS_ESTRELAS, ORBITAS, UNIVERSO_EM_EXPANSAO, DIAGRAMA_HR]

export function getLab(slug: string): Lab | undefined {
  return LABS.find((l) => l.slug === slug)
}
