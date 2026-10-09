import type { Lab } from './types'

// Definição do laboratório "circulo-trigonometrico" (Matemática). Conteúdo em components/labs/circulo-trigonometrico/.

export const CIRCULO_TRIGONOMETRICO: Lab = {
  slug: 'circulo-trigonometrico',
  title: 'A roda que vira onda',
  subtitle: 'Gire um ponto num círculo e veja o seno e o cosseno nascerem, desenrolando uma onda.',
  area: 'Matemática',
  level: 'Pré-cálculo',
  track: 'pre-calculo',
  minutes: 18,
  status: 'disponivel',
  concepts: ['Círculo trigonométrico', 'Radianos', 'Seno e cosseno', 'Periodicidade'],
  accent: '#6cc4ff',
  achievement: {
    title: 'Mestre da roda',
    description: 'Você transformou um giro numa onda e leu seno e cosseno direto do círculo.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Uma roda-gigante',
      goal: 'Gire a cabine e veja o gráfico da altura nascer.',
      vega:
        'Na tela: à esquerda, uma roda-gigante imaginada com uma cabine; à direita, um gráfico que registra a altura da cabine (em relação ao eixo: topo, eixo, base) contra o ângulo girado, de 0° a 720°. O aluno arrasta a cabine (ou o gráfico) no sentido anti-horário. Uma linha horizontal liga a cabine ao ponto do gráfico: mesma altura. Tarefas: dar uma volta completa (360°) e depois uma segunda volta, para ver o desenho se repetir. Ideia central: a altura de um ponto que gira desenha uma onda suave e periódica, a senoide. Não fale de seno ainda na primeira cena; deixe o aluno descobrir a forma. Se ele travar, peça para olhar a linha que liga a cabine ao gráfico.',
      ask: ['Por que a curva fica arredondada lá em cima?', 'O que quer dizer a curva se repetir?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Meia volta e a forma da onda',
      goal: 'Preveja a altura depois de meia volta e a forma do gráfico.',
      vega:
        'Duas previsões. (1) Depois de girar 180° a partir da altura do eixo (lado direito), a cabine está mais alta, mais baixa ou na mesma altura? Resposta: na mesma altura (está do outro lado, à esquerda, na altura do eixo). Erro comum: achar que meia volta leva ao topo; o topo é em 90°, um quarto de volta. (2) A roda gira com rapidez constante: qual gráfico é altura × tempo? A: zigue-zague (triângulo), B: onda suave (senoide), C: dente de serra. Resposta: B. Erro comum: achar que a altura cresce em linha reta (triângulo). Perto do topo e da base a cabine anda quase na horizontal, então a altura quase não muda: o pico é arredondado. A seta da velocidade mostra a parte vertical encolhendo. Não entregue antes da escolha.',
      ask: ['Por que não é um zigue-zague?', 'Onde a cabine sobe mais rápido?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'O círculo unitário',
      goal: 'Leia seno e cosseno como sombras e meça ângulos em raios.',
      vega:
        'Conceito: círculo unitário (raio 1). O ponto P no ângulo θ tem coordenadas (cos θ, sen θ): o cosseno é a sombra horizontal (âmbar), o seno é a sombra vertical (azul). Radiano: o arco do mesmo comprimento do raio mede 1 rad ≈ 57,3°. O aluno "dobra" raios sobre a borda: cabem π ≈ 3,14 raios em meia volta e 2π ≈ 6,28 na volta inteira (6 raios e sobra ≈ 0,28). Depois a sombra vertical se desenrola numa onda com o eixo horizontal em radianos (π/2, π, 3π/2, 2π). Por fim, o cosseno é a mesma onda adiantada de π/2: cos θ = sen(θ + π/2). Erros comuns: achar que o radiano depende do tamanho do círculo (não depende: é uma razão arco/raio); trocar seno e cosseno (seno é a altura).',
      ask: ['Por que usar radianos e não graus?', 'Por que o cosseno é a sombra horizontal?', 'O que quer dizer "adiantada de π/2"?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      label: 'No mundo real',
      title: 'A London Eye',
      goal: 'Modele a altura de uma cabine numa roda-gigante de verdade.',
      vega:
        'Dados reais (site oficial, londoneye.com): a London Eye tem 135 m de altura, roda de 120 m de diâmetro e dá uma volta em cerca de 30 minutos. O eixo fica a 135 − 60 = 75 m; a base da roda a ≈ 15 m do chão (aproximação). A cabine embarca embaixo, então o modelo é h(t) = 75 − 60·cos(2πt/30), h em metros e t em minutos: 75 é a altura do eixo, 60 o raio, 30 os minutos de uma volta, e o sinal de menos porque em t = 0 a cabine está embaixo. Pergunta: quando a cabine passa de 100 m? 75 − 60·cos(2πt/30) > 100 ⇔ cos(2πt/30) < −5/12 ⇔ 9,6 min < t < 20,4 min (≈ 10,9 min por volta acima de 100 m). O aluno arrasta o tempo e acha as duas passagens pela linha de 100 m. Não dê os números antes; ajude a olhar onde a curva cruza a linha.',
      ask: ['Por que tem um sinal de menos no modelo?', 'Como acho o instante exato sem arrastar?'],
    },
    {
      id: 'resolva',
      kind: 'medicao',
      label: 'Resolva',
      title: 'Simetria no círculo',
      goal: 'Ache senos e cossenos de outros ângulos usando espelhos e meias-voltas.',
      vega:
        'Resolução passo a passo, com ajuda diminuindo. Problema 1: sen 150°. Passos: 150° é o espelho de 30° no eixo vertical (150° = 180° − 30°); esse espelho troca só o sinal do x (cosseno); então sen 150° = sen 30° = 1/2. Problema 2 (menos ajuda): cos 210°. 210° = 30° + 180°, meia volta pelo centro, que troca os dois sinais; cos 210° = −cos 30° = −√3/2 ≈ −0,87. Problema 3 (sozinho): resolver sen θ = 1/2 em [0, 2π]; o aluno arrasta P e marca as soluções. Respostas: π/6 e 5π/6. Erro clássico: esquecer a segunda solução (a reta y = 1/2 corta o círculo em dois pontos). Outros erros: trocar seno com cosseno, esquecer o sinal. Nunca diga a resposta antes de ele tentar; aponte para o palco (a altura do ponto, de que lado ele está).',
      ask: ['Por que o espelho no eixo vertical não muda o seno?', 'Como sei o sinal do cosseno?', 'Por que existem duas respostas?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'Outra roda, outra onda',
      goal: 'Mude o tamanho, a rapidez e a altura da roda e veja a onda mudar.',
      vega:
        'Modelo h(t) = A·sen(ωt) + d. A é a amplitude (raio da roda: a onda fica mais alta), ω é a frequência angular (rapidez do giro: a onda fica mais apertada; período 2π/ω), d é o deslocamento vertical (altura do eixo: a onda inteira sobe). Previsão: girar 2× mais rápido deixa a onda mais apertada (mesma altura máxima). Desafio: casar a curva com a tracejada, que é A = 0,5, ω = 2, d = 1. Dica sem entregar: medir a altura entre pico e vale (2A), contar quantas ondas cabem e olhar onde fica o meio da onda.',
      ask: ['Qual parâmetro deixa a onda mais apertada?', 'Como acho o d olhando a curva?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'A roda é uma onda',
      goal: 'O que você descobriu e para onde ir agora.',
      vega:
        'Resumo: um ponto que gira num círculo de raio 1 tem coordenadas (cos θ, sen θ); a altura desenha a senoide, periódica de 2π. Ângulos em radianos medem o arco em raios. Simetrias do círculo dão senos e cossenos de outros ângulos. sen²θ + cos²θ = 1 é Pitágoras no triângulo de catetos cos θ e sen θ e hipotenusa 1. Fonte da London Eye: site oficial (londoneye.com). Próximo laboratório: Cálculo 1, "A velocidade de um instante" (derivada), onde a rapidez com que a altura muda vira uma ideia precisa.',
      ask: ['Por que sen²θ + cos²θ = 1 vale para todo ângulo?', 'Onde mais aparecem senoides?'],
    },
  ],
}
