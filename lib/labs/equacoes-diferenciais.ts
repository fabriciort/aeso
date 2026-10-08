import type { Lab } from './types'

// Definição do laboratório "equacoes-diferenciais" (Matemática). Conteúdo em components/labs/equacoes-diferenciais/.

export const EQUACOES_DIFERENCIAIS: Lab = {
  slug: 'equacoes-diferenciais',
  title: 'A equação que prevê o futuro',
  subtitle: 'Siga as setas de um campo de direções e descubra como uma regra de mudança decide o destino de um café que esfria e de uma população.',
  area: 'Matemática',
  level: 'Graduação',
  track: 'calculo-4',
  minutes: 22,
  status: 'disponivel',
  concepts: ['Equações diferenciais', 'Campo de direções', 'Método de Euler', 'Crescimento e decaimento'],
  accent: '#ff8a5c',
  achievement: {
    title: 'Leitura do futuro',
    description: 'Seguiu um campo de direções, resolveu uma equação diferencial à mão e mediu o erro do método de Euler.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Um café esfriando',
      goal: 'Desenhe como você acha que a temperatura do café cai.',
      vega:
        'Exemplo imaginado: uma xícara de café a 90 °C numa sala a 20 °C, com um termômetro animado. Na cena 3 o aluno desenha com o dedo, num plano (t em minutos de 0 a 60, T em °C), como acha que a temperatura cai, começando no ponto (0, 90). Não há resposta certa ainda: é uma aposta. Não revele a forma da curva (exponencial que freia e se aproxima de 20 °C); peça que ele pense se o café perde calor no mesmo ritmo o tempo todo e até onde ele pode esfriar.',
      ask: ['Por que o café não esfria até 0 °C?', 'O que significa cada ponto desse gráfico?', 'Como eu sei se meu desenho está certo?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Rápido no começo ou no fim?',
      goal: 'Aposte em como e até onde o café esfria.',
      vega:
        'Duas previsões sobre o café (90 °C, sala a 20 °C, k = 0,05 por minuto). 1) Quando ele esfria mais rápido? Resposta: no começo, quando a diferença para a sala é maior (−3,5 °C/min em t = 0, só ≈ −0,5 °C/min em t = 40). Erro comum: queda em linha reta, no mesmo ritmo. 2) Ele chega a exatamente 20 °C? Resposta: não, ele se aproxima cada vez mais devagar (assíntota); após 2 h ainda falta ≈ 0,17 °C. Erro comum: achar que atinge a temperatura da sala num tempo finito. O palco revela a curva real sobre o desenho do aluno, com as inclinações em t = 0 e t = 40, e depois afasta a janela até 4 horas. Guie pela inclinação: onde a curva é mais íngreme?',
      ask: ['Por que o café esfria mais devagar no fim?', 'Se ele nunca chega a 20 °C, quando posso dizer que esfriou?', 'Isso vale para uma bebida gelada também?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'Uma regra de mudança',
      goal: 'Veja a equação virar um campo de setas e siga as setas.',
      vega:
        'Ideia central: a lei de resfriamento de Newton dT/dt = −k(T − 20), com k = 0,05/min, não dá a temperatura; dá a INCLINAÇÃO (o ritmo de mudança) em cada ponto (t, T). Cena 1: o aluno arrasta um ponto e vê o tracinho tangente: íngreme quando quente, deitado em 20 °C, subindo abaixo de 20 °C. Cena 3: tracinhos em todos os pontos formam o campo de direções. Cena 4: o aluno toca no plano para soltar cafés com outras temperaturas iniciais; cada partícula segue as setas e desenha uma solução; todas tendem a 20 °C, inclusive a de um café gelado (que esquenta). Cena 5: uma equação diferencial é uma regra de mudança; a solução é a curva que obedece à regra em todo lugar. Guie perguntando para onde o tracinho aponta.',
      ask: ['O que é um campo de direções?', 'Por que todas as curvas vão para 20 °C?', 'O que significa k = 0,05 por minuto?'],
    },
    {
      id: 'mundo-real',
      kind: 'observacao',
      label: 'No mundo real',
      title: 'O relógio do carbono-14',
      goal: 'Use a meia-vida real do C-14 para datar um osso.',
      vega:
        'Dado real: a meia-vida do carbono-14 é 5.730 ± 40 anos (Godwin, 1962, Nature 195, 984). Decaimento: dN/dt = −λN, com λ = ln 2 / 5.730 ≈ 1,21 × 10⁻⁴ por ano. É a mesma família de curvas do café, só que o alvo é zero (em vez de 20 °C). Tarefa: uma amostra (exemplo imaginado) tem 25 % do C-14 original; o aluno arrasta um cursor no tempo até a curva marcar 25 %. Resposta: 2 meias-vidas, ≈ 11.460 anos. Erro comum: achar que 25 % são 3/4 de uma meia-vida, ou que tudo some em 2 meias-vidas (metade da metade é um quarto, não zero). Obs.: os laboratórios de datação ainda calibram as idades com curvas como a IntCal; aqui o modelo é o ideal.',
      ask: ['Por que a meia-vida não depende da quantidade?', 'Até quantos anos dá para datar com carbono-14?', 'Qual é a ligação entre o café e o carbono-14?'],
    },
    {
      id: 'resolva',
      kind: 'medicao',
      label: 'Resolva',
      title: 'Resolvendo à mão',
      goal: 'Resolva a equação passo a passo e teste o método de Euler.',
      vega:
        'Problema 1 (com muita ajuda): resolver dT/dt = −k(T − 20), T(0) = 90, k = 0,05/min por separação de variáveis: separar (dT/(T − 20) = −k dt), integrar (ln|T − 20| = −kt + C), isolar (T = 20 + A e^(−kt)), usar a condição inicial (A = 70) e calcular T(10) = 20 + 70e^(−0,5) ≈ 62,5 °C. Erros comuns nos distratores: tratar T como constante (vira uma reta que congela o café), integrar 1/u como u²/2, esquecer a constante C, achar que e^(a+b) = e^a + e^b, esquecer o +20. Problema 2 (menos ajuda): Euler à mão com h = 5: T1 = 90 + 5·(−3,5) = 72,5; T2 = 72,5 + 5·(−2,625) ≈ 59,4 (exato 62,5; erro ≈ 3,1 °C). Erros: esquecer de multiplicar por h; repetir a inclinação antiga. Cena 3: o aluno muda h; passos pequenos colam na curva, h = 20 já cai direto para 20 °C e h = 40 oscila até −50 °C (instável). Problema 3 (sozinho): quando T = 40 °C? t = 20·ln(3,5) ≈ 25,1 min. Guie com perguntas sobre o próximo passo, sem dar o número.',
      ask: ['Por que posso separar dT e dt como se fossem frações?', 'De onde vem o ln?', 'Por que o método de Euler erra para baixo aqui?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'Um lago com limite',
      goal: 'Descubra para onde vai uma população num ambiente limitado.',
      vega:
        'Exemplo imaginado: peixes num lago que comporta no máximo K = 1.000 peixes, com r = 0,5 por mês. Modelo logístico dP/dt = rP(1 − P/K). Previsão: soltando 50 peixes, a população cresce quase exponencialmente no começo e se estabiliza perto de 1.000 (curva em S). Erros comuns: crescimento sem fim (exponencial puro) ou ultrapassar e voltar (isso não acontece numa equação de 1ª ordem: as soluções não se cruzam e não oscilam). O aluno solta populações abaixo e acima de 1.000; todas convergem para K. Linha de fase: equilíbrios em P = 0 (instável: as setas se afastam) e P = K (estável: as setas apontam para ele dos dois lados). Guie pela direção das setas.',
      ask: ['Por que a população não passa de 1.000 e depois volta?', 'O que é um equilíbrio estável?', 'Onde a população cresce mais rápido?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'O futuro numa regra',
      goal: 'Reveja o que você descobriu.',
      vega:
        'Resumo: uma equação diferencial é uma regra de mudança (a inclinação em cada ponto); a solução é a curva que obedece à regra em todo lugar, e a condição inicial escolhe uma curva da família. O café segue T(t) = 20 + 70e^(−0,05t); o carbono-14 cai à metade a cada 5.730 anos; a população logística vai para K. O método de Euler aproxima a solução seguindo tangentes, com erro que diminui com o passo. Próximo laboratório da trilha: "Ventos e redemoinhos" (campos vetoriais), em breve.',
      ask: ['Onde mais aparecem equações diferenciais?', 'O que vem depois disso no Cálculo?', 'Qual método os computadores usam de verdade?'],
    },
  ],
}
