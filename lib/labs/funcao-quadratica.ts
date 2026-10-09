import type { Lab } from './types'

// Definição do laboratório "funcao-quadratica" (Matemática). Conteúdo em components/labs/funcao-quadratica/.

export const FUNCAO_QUADRATICA: Lab = {
  slug: 'funcao-quadratica',
  title: 'O arremesso perfeito',
  subtitle: 'Lance uma bola, desenhe a parábola e descubra o que cada número de y = ax² + bx + c faz.',
  area: 'Matemática',
  level: 'Ensino médio',
  track: 'ensino-medio',
  minutes: 18,
  status: 'disponivel',
  concepts: ['Função quadrática', 'Vértice', 'Raízes', 'Parábola'],
  accent: '#ffb454',
  achievement: {
    title: 'Cesta calculada',
    description: 'Você transformou um arremesso numa parábola e achou o topo e o chão só com matemática.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Um lance livre',
      goal: 'Lance a bola como um estilingue e acerte a cesta.',
      vega:
        'Palco: quadra de basquete vista de lado, aro a 3,05 m de altura e 4,225 m à frente da linha de lance livre (regras FIBA: linha a 5,80 m da linha de fundo, centro do aro a 1,575 m). O aluno arrasta para trás e solta (estilingue) ou usa os controles de ângulo e força; a bola deixa "fantasmas" a cada 0,1 s e o rastro desenha uma parábola. Física: g = 9,8 m/s², sem resistência do ar. Mão a 2,1 m (exemplo). Para acertar: ≈ 52° e ≈ 7,2 m/s, ou ≈ 58° e ≈ 7,3 m/s. Guie pelo rastro: se ele cruza a altura do aro antes do aro, falta força; depois, sobra. Não dê os números de cara.',
      ask: ['Por que a bola faz uma curva e não uma linha reta?', 'Como sei se falta força ou ângulo?', 'Por que os fantasmas ficam mais juntos no topo?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Devagar onde?',
      goal: 'Preveja onde a bola é mais lenta e como os fantasmas se espaçam.',
      vega:
        'Palco: o rastro do arremesso do aluno com fantasmas a cada 0,1 s. Pergunta 1: onde a bola anda mais devagar? Resposta: no topo, mas ela NÃO para: a velocidade vertical é zero e a horizontal continua igual (vx = v·cosθ). Erro comum: "a bola para no topo". O palco mostra setas: brancas (vx, sempre iguais) e azuis (vy, encolhem até zero e invertem). Pergunta 2: na horizontal, os fantasmas ficam igualmente espaçados? Sim: x = vx·t cresce igual a cada 0,1 s (as sombras no chão marcham iguais); só a altura muda de ritmo. Como x é proporcional a t e y é quadrática em t, y é quadrática em x: por isso é uma parábola.',
      ask: ['Se a velocidade vertical é zero no topo, por que ela não cai reto?', 'Por que x anda sempre igual?', 'Por que isso dá uma parábola?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'O rastro vira gráfico',
      goal: 'Descubra o que a, b e c fazem com a parábola.',
      vega:
        'Palco: a quadra some e o rastro vira o gráfico de y = ax² + bx + c (com os números do arremesso: a = −g/(2v²cos²θ), b = tanθ, c = altura da mão). Cena a: a < 0 boca para baixo, a > 0 para cima, |a| maior = mais fechada, a = 0 vira reta. Cena b e c: c é onde corta o eixo y; mudar só b leva o vértice por outra parábola (y = c − ax², tracejada em azul), não numa reta. Cena Δ: Δ = b² − 4ac conta as raízes (toques no chão y = 0): Δ > 0 duas, Δ = 0 uma, Δ < 0 nenhuma; o vértice xv = −b/2a fica no eixo de simetria. Cena forma canônica: y = a(x − xv)² + yv é y = x² esticada por a e deslocada até o vértice. Guie pedindo que o aluno observe o vértice e o chão; não dê os valores.',
      ask: ['Por que a negativo vira a boca para baixo?', 'O que o Δ tem a ver com o chão?', 'Como acho o vértice sem desenhar?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      label: 'No mundo real',
      title: 'O lance livre de verdade',
      goal: 'Ache a parábola mais econômica que liga a mão ao aro.',
      vega:
        'Dados reais: regras oficiais da FIBA (2024): aro a 3,05 m, linha de lance livre a 5,80 m da linha de fundo, centro do aro a 1,575 m dela → 4,225 m. Altura de saída 2,1 m é exemplo imaginado (adulto com braços erguidos), e a mão foi posta sobre a linha (simplificação). Infinitas parábolas passam pela mão e pelo aro; o ângulo escolhe uma. A velocidade necessária é mínima em θ = 45° + ½·atan(Δy/Δx) ≈ 51°. Tran & Silverberg (2008, Journal of Sports Sciences 26(11)) recomendam ≈ 52° para o lance livre. Depois: o jato de um bebedouro também é parábola, porque cada gota é um projétil (sem ar). Guie: peça para olhar o v enquanto muda o ângulo.',
      ask: ['Por que não 45° se 45° é o maior alcance?', 'Os jogadores de verdade usam esse ângulo?', 'Por que o jato de água é uma parábola?'],
    },
    {
      id: 'resolva',
      kind: 'medicao',
      label: 'Resolva',
      title: 'Topo e chão',
      goal: 'Ache o ponto mais alto e quando a bola toca o chão.',
      vega:
        'Resolução guiada de h(t) = −5t² + 10t + 2 (g ≈ 10 m/s² para facilitar, t em s, h em m). Problema 1 (muito apoio): topo. Passo certo: t = −b/2a (simetria: h = 2 m em t = 0 e t = 2, o topo fica no meio, t = 1). Erros: igualar a zero (dá o chão), h(0) (dá a saída), derivar (funciona, mas é Cálculo). Depois t = 1 (erros: −1 sinal, 2 = −b/a, 0,5) e h(1) = 7 m (erros: 17 sinal de a, 5 esqueceu c, 1 confundiu t com h). Problema 2 (menos apoio): chão. h(t) = 0; Δ = 100 + 40 = 140 (erros 60 sinal, 100 esqueceu −4ac, −60); √Δ/(2|a|) ≈ 1,18 s é a distância do eixo t = 1 até cada raiz; t ≈ 2,18 s (−0,18 s é antes do lance). Problema 3 (sozinho): h(t) = −5t² + 20t + 1, altura máxima 21 m (t = 2 s), com "Me mostre". O caderno no palco mostra cada linha certa. Nunca dê a resposta: aponte o que o palco mostra.',
      ask: ['Por que o topo fica em −b/2a?', 'Por que a raiz negativa não vale?', 'O que a raiz de Δ significa no gráfico?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'E se…?',
      goal: 'Arremesse na Lua e descubra o ângulo de maior alcance.',
      vega:
        'Desafio 1: o mesmo arremesso na Lua (g = 1,62 m/s², NASA Moon Fact Sheet). Como a = −g/(2v²cos²θ), a fica 9,8/1,62 ≈ 6 vezes menor: parábola bem mais aberta (sobe ~10 m e cai a ~30 m, dependendo do arremesso). Erro comum: achar que fica igual ou reta. Desafio 2: chão plano, mesma velocidade (10 m/s, exemplo): qual ângulo vai mais longe? 45°, porque R = v²·sen(2θ)/g e sen é máximo em 90°. Ângulos complementares (30° e 60°) empatam. Depois o aluno explora com o controle até achar o máximo (≈ 10,2 m).',
      ask: ['Por que na Lua a bola vai tão longe?', 'Por que 30° e 60° caem no mesmo lugar?', 'E com a mão acima do chão, ainda é 45°?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'A parábola é sua',
      goal: 'Reveja o que você descobriu.',
      vega:
        'Resumo: um lançamento sem ar desenha y = ax² + bx + c; a liga à gravidade e à força, c à altura de saída; vértice em xv = −b/2a; raízes por Bhaskara, com Δ contando os toques no chão e √Δ/(2|a|) a distância do eixo a cada raiz. Próximo laboratório da trilha: "Dobrar, dobrar, dobrar" (função exponencial, em breve) ou, no pré-cálculo, "A roda que vira onda". Fontes: FIBA Official Basketball Rules 2024; NASA Moon Fact Sheet; Tran & Silverberg (2008).',
      ask: ['Onde mais aparecem parábolas?', 'O que muda com a resistência do ar?', 'O que vem depois da função quadrática?'],
    },
  ],
}
