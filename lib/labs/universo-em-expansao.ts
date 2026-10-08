import type { Lab } from './types'

// Definição do laboratório "universo-em-expansao". Conteúdo em components/labs/universo-em-expansao/.

export const UNIVERSO_EM_EXPANSAO: Lab = {
  slug: 'universo-em-expansao',
  title: 'Meça a expansão do universo',
  subtitle: 'Do apito de uma ambulância ao redshift das galáxias: refaça a descoberta de Hubble.',
  area: 'Astronomia',
  level: 'Ensino médio',
  minutes: 25,
  status: 'em-breve',
  concepts: ['Efeito Doppler', 'Redshift', 'Lei de Hubble'],
  accent: '#b993ff',
  skyTarget: 'M31',
  achievement: {
    title: 'Medidor do cosmos',
    description: 'Você mediu a velocidade de galáxias pela luz delas e estimou a idade do universo.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'O som que muda',
      goal: 'Ouça uma sirene passar e descubra por que o som muda.',
      vega:
        'No palco, uma ambulância passa por um ouvinte numa rua à noite e emite frentes de onda (círculos). As frentes se apertam na frente da ambulância e se espaçam atrás. O aluno pode tocar "Ouvir" (sirene de dois tons sintetizada) e mudar a velocidade (0 a 40 m/s). A frequência ouvida segue f′ = f·c/(c − v·cosθ), com c ≈ 343 m/s. Chegando: mais agudo; indo embora: mais grave; quanto mais rápido, maior a diferença. O desenho exagera a velocidade 3× para as ondas ficarem visíveis; o som usa a velocidade real. Faça o aluno perceber a relação entre o espaçamento das ondas e o tom, sem jogar a fórmula logo de cara.',
      ask: ['Por que a sirene fica mais grave depois que passa?', 'Se a ambulância estiver parada, o som muda?', 'O motorista também ouve o som mudar?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'E se fosse luz?',
      goal: 'Aposte: o que acontece com a luz de uma galáxia que se afasta?',
      vega:
        'Pergunta de previsão: a luz também é uma onda; se a fonte se afasta, as cristas chegam mais espaçadas, o comprimento de onda aumenta e a luz desloca para o vermelho (redshift). Resposta: "Mais vermelha". "Mais azul" seria aproximação. Brilho não é o efeito Doppler (embora uma fonte mais distante pareça mais fraca). Não entregue antes da escolha; depois, ligue com a ambulância: indo embora = onda esticada = grave (som) ou vermelho (luz).',
      ask: ['Por que vermelho e não azul?', 'A galáxia fica vermelha de verdade a olho nu?', 'E se a galáxia se aproximasse?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'O código de barras da luz',
      goal: 'Use as linhas do hidrogênio para medir velocidades.',
      vega:
        'O palco mostra um espectro (arco-íris) com as linhas escuras do hidrogênio: Hα 656,3 nm, Hβ 486,1, Hγ 434,0 e Hδ 410,2 nm. Cada elemento absorve em comprimentos de onda fixos, como um código de barras. Na segunda cena há dois espectros: o de laboratório (em repouso, em cima) e o observado (embaixo), ligados por conectores. O aluno muda a velocidade (−3 000 a +30 000 km/s) e vê λobs = λ0(1 + v/c); todas as linhas se deslocam na mesma proporção. Tarefa: levar Hα até ≈ 670 nm, o que corresponde a v ≈ 6 200 km/s (v ≈ c·Δλ/λ = 299 792 × 13,7/656,3). A fórmula é a aproximação de primeira ordem, ótima para v muito menor que c. Guie para o leitor olhar o deslocamento de Hα, sem dar o número da velocidade.',
      ask: ['Por que o hidrogênio tem linhas nesses lugares?', 'Como sei que é o hidrogênio e não outro elemento?', 'O que acontece se v for negativo?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      title: 'Galáxias fugindo',
      goal: 'Meça a velocidade de galáxias pelo deslocamento da linha Hα.',
      vega:
        'Mapa com cinco galáxias HIPOTÉTICAS (A–E) a 20, 45, 80, 120 e 160 Mpc da Via Láctea; as distâncias vieram de "velas padrão" (Cefeidas e supernovas tipo Ia, de brilho conhecido). As velocidades foram geradas como 70·d mais um desvio peculiar de 50 a 200 km/s (dados simulados). O aluno toca numa galáxia, vê o espectro dela perto de Hα e arrasta o espectro observado de volta até a linha alinhar com a de laboratório; o quanto ele desfez é o deslocamento, que vira velocidade por v = c·Δλ/λ. Velocidades: A 1 530, B 3 060, C 5 780, D 8 240, E 11 270 km/s. Tarefa: medir 3. Ideia final: quanto mais longe, mais rápido se afasta. Não dê as velocidades; ajude a alinhar.',
      ask: ['O que é uma vela padrão?', 'Por que usar só a linha Hα?', 'O que é um megaparsec?'],
    },
    {
      id: 'meca',
      kind: 'medicao',
      title: 'A constante de Hubble',
      goal: 'Ajuste a reta v = H0·d até ela passar pelos pontos.',
      vega:
        'O palco virou um gráfico velocidade × distância com os pontos medidos pelo aluno (fortes) e os restantes (apagados, medidos automaticamente). O aluno ajusta a inclinação H0 de uma reta pela origem (40 a 100 km/s/Mpc) até ficar a menos de 5 % do melhor ajuste por mínimos quadrados (≈ 70,1). As linhas finas verticais mostram a distância de cada ponto à reta. Depois, valores reais: H0 = 67,4 ± 0,5 (satélite Planck, radiação cósmica de fundo, 2018) e 73,0 ± 1,0 (Telescópio Hubble/SH0ES, Cefeidas e supernovas, Riess et al. 2022). A diferença entre eles, a "tensão de Hubble", ainda não tem explicação: é um problema aberto. Não diga o valor do melhor ajuste antes de o aluno tentar.',
      ask: ['O que significa H0 = 70 km/s/Mpc?', 'Por que a reta passa pela origem?', 'O que é a tensão de Hubble?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'Rebobine o universo',
      goal: 'Use a lei de Hubble em situações que você só pode imaginar.',
      vega:
        'Três desafios. (1) Rebobinar: se tudo se afasta a ~70 km/s por Mpc, o tempo para tudo estar junto é ≈ 1/H0 ≈ 977,8/H0 bilhões de anos ≈ 14 bilhões de anos (a idade medida é 13,8 bilhões; a conta simples supõe velocidade constante). (2) Não estamos no centro: numa expansão uniforme, de qualquer galáxia se vê todas as outras se afastando com velocidade proporcional à distância (analogia do pão de passas crescendo). (3) Andrômeda, a 0,78 Mpc, se afastaria a ~55 km/s pela lei de Hubble, mas se aproxima a ~300 km/s (blueshift): a gravidade entre ela e a Via Láctea vence a expansão em distâncias pequenas; devem se encontrar em uns 4 a 5 bilhões de anos. Guie o raciocínio, sem entregar a alternativa.',
      ask: ['Como 1/H0 vira uma idade?', 'Se não há centro, onde foi o Big Bang?', 'Por que a expansão não separa o Sistema Solar?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'Você mediu o universo',
      goal: 'O que você descobriu e para onde ir agora.',
      vega:
        'Resumo: o efeito Doppler muda a frequência de ondas de fontes em movimento; na luz, afastamento = redshift, medido pelas linhas do hidrogênio com v ≈ c·Δλ/λ. Velocidade e distância das galáxias seguem v = H0·d (Lemaître 1927, Hubble 1929); 1/H0 dá uma estimativa da idade do universo. O aluno mediu um H0 próprio com galáxias hipotéticas. Próximos passos: ver Andrômeda (M31) no Céu, ou pesquisar a tensão de Hubble e a energia escura.',
      ask: ['Como os astrônomos medem distâncias tão grandes?', 'A expansão está acelerando?', 'O que existia antes do Big Bang?'],
    },
  ],
}
