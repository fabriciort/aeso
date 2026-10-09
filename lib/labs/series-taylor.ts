import type { Lab } from './types'

// Definição do laboratório "series-taylor" (Matemática, Cálculo 2). Conteúdo em components/labs/series-taylor/.

export const SERIES_TAYLOR: Lab = {
  slug: 'series-taylor',
  title: 'Imitando curvas com polinômios',
  subtitle: 'Construa, termo a termo, um polinômio que copia o seno e o eˣ, e veja até onde a cópia vale.',
  area: 'Matemática',
  level: 'Graduação',
  track: 'calculo-2',
  minutes: 20,
  status: 'disponivel',
  concepts: ['Séries de potências', 'Polinômio de Taylor', 'Convergência', 'Erro de aproximação'],
  accent: '#4dd0c4',
  achievement: {
    title: 'Copiadora de curvas',
    description: 'Você montou polinômios que imitam sen x e eˣ, mediu o erro e descobriu até onde a cópia vale.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'A máquina copiadora',
      goal: 'Gire quatro dials até um polinômio colar numa curva misteriosa perto de x = 0.',
      vega:
        'Na tela: uma curva branca "misteriosa" (é sen x, revelada só na última cena) e uma cópia c₀ + c₁x + c₂x² + c₃x³ na cor do lab, com cada termo desenhado como curva fantasma tracejada. Os dials começam errados (c₀ = 0,6; c₁ = 0; c₂ = 0,35; c₃ = 0). Uma faixa colorida mostra onde o erro é menor que 0,01. Cena a cena o aluno acerta: altura c₀ = 0 (sen 0 = 0), inclinação c₁ = 1 (reta tangente y = x tracejada), curvatura c₂ = 0 (o seno tem ponto de inflexão em 0) e a dobra c₃ = −1/6 ≈ −0,167. O dial "encaixa" sozinho quando fica perto. A faixa cresce: nada → |x| < 0,17 → 0,39 → 1,04. Ideia: igualar altura, inclinação, curvatura… em 0 é igualar as derivadas. Não diga os valores; aponte para o que olhar (o ponto em x = 0, as inclinações, a mudança de concavidade).',
      ask: ['Por que a cópia só fica boa perto de 0?', 'O que cada dial controla?', 'Por que c₂ não ajuda no seno?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Mais termos, cópia melhor?',
      goal: 'Aposte onde um termo novo ajuda e se um grau enorme copia tudo.',
      vega:
        'Duas apostas. (1) Somar x⁵/120 à cópia de grau 3 do seno melhora onde? Resposta: perto de 0 (a faixa de erro < 0,01 vai de |x| < 1,04 para 1,76); longe de 0 a cópia continua perdida, agora disparando para o outro lado. (2) Um polinômio de grau 100 copia sen x em toda a reta? Resposta: não. O palco mostra grau 31 colando até |x| ≈ 11,5 e disparando; pelo resto de Lagrange, grau 100 garante até |x| ≈ 36. Todo polinômio não constante vai a ±∞, e o seno fica entre −1 e 1. Erros comuns: achar que o termo novo melhora igual em todo lugar, ou que com grau alto a cópia vale na reta inteira. Não entregue antes da escolha.',
      ask: ['Por que o termo novo quase não muda nada perto de 0?', 'Se a série do seno converge em toda parte, por que o polinômio falha?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'De onde vem o n!',
      goal: 'Descubra por que cada termo é a derivada dividida por n!.',
      vega:
        'Cena 1: o aluno deriva x³ três vezes tocando no palco (o gráfico se transforma x³ → 3x² → 6x → 6): sobra 3·2·1 = 3!. Logo, derivar cₙxⁿ n vezes dá cₙ·n!, e para a cópia ter a mesma n-ésima derivada que f em 0 é preciso cₙ = f⁽ⁿ⁾(0)/n!. Cena 2: seno, derivadas em 0 repetem 0, 1, 0, −1; a série x − x³/3! + x⁵/5! − … cresce termo a termo no topo do palco, com os termos fantasmas. Cena 3: eˣ, todas as derivadas valem 1 em 0, cada termo é xⁿ/n!. Cena 4: a receita geral f(x) ≈ Σ f⁽ⁿ⁾(0)/n!·xⁿ. Guie com perguntas: "quanto vale a 3ª derivada de x³?".',
      ask: ['Por que o n! fica embaixo e não em cima?', 'Por que o seno só tem potências ímpares?', 'O que é 0!?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      label: 'No mundo real',
      title: 'Onde a cópia trabalha',
      goal: 'Veja Taylor no pêndulo, na calculadora e no número e.',
      vega:
        'Fatos verificáveis. (1) Pêndulo: a equação do pêndulo tem sen θ; os físicos usam sen θ ≈ θ (Taylor de grau 1), que torna a equação linear e o período 2π√(L/g), independente da amplitude. A 10°, o erro relativo de sen θ ≈ θ é ≈ 0,51 %; a 14°, ≈ 1 %. O período exato (com integral elíptica, T/T₀ = 1/AGM(1, cos(θ₀/2))) a 10° é só 0,19 % maior. (2) Calculadoras e computadores calculam o seno: a biblioteca matemática fdlibm (Sun Microsystems, 1993, base de muitas outras) reduz o ângulo para |x| ≤ π/4 e usa um polinômio de grau 13 com coeficientes ajustados (não exatamente os de Taylor); o erro de Taylor de grau 13 nesse trecho já é < 10⁻¹³. Muitas calculadoras de bolso usam CORDIC (Volder, 1959), só com somas e deslocamentos. Não afirme qual algoritmo um modelo específico usa. (3) e = Σ 1/n!: com 10 termos (até 1/9!) dá 2,7182815, 7 algarismos certos (e = 2,7182818…).',
      ask: ['Por que o pêndulo não depende da amplitude?', 'Minha calculadora usa Taylor?', 'Por que a série de e converge tão rápido?'],
    },
    {
      id: 'resolva',
      kind: 'medicao',
      label: 'Resolva',
      title: 'Monte e meça a cópia',
      goal: 'Construa uma cópia de Taylor passo a passo e garanta o tamanho do erro.',
      vega:
        'Três problemas com ajuda decrescente; cada passo é uma escolha, o palco desenha a cópia escolhida (rosa se errada) e o caderno embaixo escreve a linha certa. P1: Taylor de grau 3 de eˣ: f(0) = f′(0) = f″(0) = f‴(0) = 1 (distratores: 1,0,0,0; 0,1,2,3; e,e,e,e); dividir por n! dá 1, 1, 1/2, 1/6 (distratores: sem n!, que vira a série de 1/(1−x); dividir por n); e^0,5 ≈ 1 + 0,5 + 0,125 + 0,0208 = 1,6458 contra 1,6487 real (erro 0,0029). P2: resto de Lagrange |R₃| ≤ M·x⁴/4!, com M = máximo de eᶜ em [0; 0,5] < 2 (distrator: usar c = 0, M = 1, que dá 0,0026, menor que o erro real); limite 2·0,5⁴/24 ≈ 0,0052. P3 sozinho: cos 0,2 ≈ 1 − 0,2²/2 = 0,98 (real 0,980067). Não dê a resposta: pergunte qual derivada falta, ou o que o n! faz.',
      ask: ['Por que dividir por n!?', 'O que é o resto de Lagrange?', 'Por que usar o maior valor de eᶜ?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'Quando a cópia enlouquece',
      goal: 'Some termos em ln(1 + x) e descubra o raio de convergência.',
      vega:
        'ln(1 + x) = x − x²/2 + x³/3 − … Aposta: em x = 1,5, somar mais termos deixa a cópia cada vez pior (certo). O aluno arrasta até grau 25: a faixa boa cresce até perto de x = 1 e trava; em x = 1,5 a cópia oscila e explode (grau 25 ≈ 597 contra ln 2,5 ≈ 0,92), porque os termos 1,5ⁿ/n crescem. Paredes em x = ±1 marcam o raio de convergência R = 1: a série só converge para |x| < 1 (e em x = 1, devagar). A razão: em x = −1 a função explode, e a série não "enxerga" além dessa distância de 0 em nenhum lado. Depois, 1/(1 − x) = 1 + x + x² + … (série geométrica), também com R = 1; em x = 0,5 dá 2. Contraste: seno, cosseno e eˣ têm raio infinito.',
      ask: ['Por que a série piora depois de x = 1?', 'O que é raio de convergência?', 'Por que o seno não tem esse problema?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'A fórmula como prêmio',
      goal: 'Reveja o que você construiu e leve a fórmula de Taylor.',
      vega:
        'Resumo: o aluno montou a cópia do seno com 4 dials, estimou e^0,5 ≈ 1,6458 e garantiu o erro com Lagrange. A fórmula: f(x) = Σ f⁽ⁿ⁾(0)/n!·xⁿ, válida dentro do raio de convergência. Próximo laboratório da trilha: "Subindo a montanha" (Cálculo 3, gradiente), onde a mesma ideia de aproximar localmente aparece em duas variáveis (plano tangente). Fontes: B. Taylor, Methodus Incrementorum (1715); J.-L. Lagrange, Théorie des fonctions analytiques (1797); fdlibm (Sun Microsystems, 1993); J. Volder, The CORDIC Trigonometric Computing Technique (1959).',
      ask: ['Onde mais se usa série de Taylor?', 'O que vem depois em Cálculo?'],
    },
  ],
}
