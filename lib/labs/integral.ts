import type { Lab } from './types'

// Definição do laboratório "integral" (Matemática). Conteúdo em components/labs/integral/.

export const INTEGRAL: Lab = {
  slug: 'integral',
  title: 'Somando fatias infinitas',
  subtitle: 'Corte uma área curva em retângulos cada vez mais finos e descubra a integral, e por que ela desfaz a derivada.',
  area: 'Matemática',
  level: 'Graduação',
  track: 'calculo-1',
  minutes: 20,
  status: 'disponivel',
  concepts: ['Soma de Riemann', 'Integral definida', 'Área sob a curva', 'Teorema fundamental'],
  accent: '#b388ff',
  achievement: {
    title: 'Área sob controle',
    description: 'Você somou fatias infinitas, viu a integral desfazer a derivada e reconstruiu os 100 m de Usain Bolt só com áreas.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Área é distância',
      goal: 'Descubra que a área sob o gráfico de velocidade é a distância percorrida.',
      vega:
        'Exemplo imaginado: um carro numa estrada reta, com o gráfico velocidade × tempo. Cena 1: velocidade constante de 60 km/h, o carro anda na estrada no topo do palco e a área sob o gráfico se pinta enquanto o tempo corre. Cena 2 (tarefa): o aluno arrasta o tempo até 2 h; o número no topo mostra a distância. Cena 3: 60 km/h × 2 h = 120 km, que é base × altura do retângulo: área = distância. Cena 4: o carro acelera, v(t) = 30 + 15t² km/h (de 30 a 90 km/h), e a área agora tem topo curvo (vale 100 km, mas não conte ainda). Ideia central: distância = área sob a curva de velocidade. Erro comum: achar que a distância é a altura do gráfico (a velocidade) e não a área. Guie perguntando "o que a base e a altura medem?".',
      ask: ['Por que a área é a distância?', 'E se a velocidade mudar o tempo todo?', 'Qual a unidade dessa área?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Acima ou abaixo?',
      goal: 'Preveja o que acontece ao aproximar uma área curva com retângulos.',
      vega:
        'Curva crescente v(t) = 30 + 15t² em [0, 2] (área real 100 km). Pergunta 1: 4 retângulos com altura pelo ponto da esquerda; a soma fica acima ou abaixo da real? Resposta: abaixo (86,25 km), porque numa curva crescente o ponto da esquerda é o mais baixo de cada fatia; as faltas aparecem em azul. Pergunta 2: pela direita a soma é 116,25 km (acima, sobras em rosa); com 8 retângulos ela vai... Resposta: diminuir (107,8 km). Erro clássico que esta etapa desmonta: "mais retângulos sempre aumentam a área". Mais retângulos aproximam do valor real, por cima ou por baixo. Não entregue a resposta antes da escolha; depois da escolha, aponte as cores no palco.',
      ask: ['Por que a esquerda fica abaixo?', 'Mais retângulos não deveriam dar mais área?', 'E se a curva fosse descendo?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'Da soma à integral',
      goal: 'Fatie a área com cada vez mais retângulos e veja a soma virar integral.',
      vega:
        'Cena 1: anatomia de um retângulo, altura f(xᵢ) e largura Δx; a soma de todos, Σ f(xᵢ)Δx, é a soma de Riemann. Cena 2 (tarefa): o aluno muda n (1 a 200) arrastando para os lados no palco (ou com pinça) ou no controle, e escolhe esquerda, meio ou direita; as sobras (rosa) e faltas (azul) encolhem; meta n ≥ 50. Para v = 30 + 15t² em [0,2]: esquerda n=50 ≈ 98,8; meio n=50 ≈ 99,99; direita n=50 ≈ 101,2. Cena 3: animação da notação, o Σ se alonga no ∫ (o S alongado de Leibniz, de "summa") e Δx vira dx, uma fatia infinitamente fina. Cena 4: só a área exata, ∫₀² v(t) dt = 100 km. Ideia central: a integral é o limite das somas de Riemann quando n → ∞ (Δx → 0). Erro comum: achar que dx é "um número pequeno qualquer"; é a lembrança da largura que encolheu até zero.',
      ask: ['O que significa o dx?', 'Por que o símbolo da integral é um S?', 'Qual método chega mais rápido?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      label: 'No mundo real',
      title: 'Os 100 m de Bolt',
      goal: 'Some as áreas da velocidade real de Usain Bolt e reencontre os 100 m.',
      vega:
        'Dados reais: final dos 100 m do Mundial de Berlim, 16/08/2009, recorde mundial de Usain Bolt, 9,58 s. Tempos oficiais a cada 10 m (IAAF Biomechanics Research Project, Graubner & Nixdorf, 2011): reação 0,146 s; 1,89; 2,88; 3,78; 4,64; 5,47; 6,29; 7,10; 7,92; 8,75; 9,58 s. O gráfico mostra a VELOCIDADE MÉDIA DE CADA TRECHO (10 m ÷ duração), em degraus: ≈ 5,7 m/s no primeiro trecho (descontando a reação), 10,1; 11,1; 11,6; 12,0; 12,2; 12,3 (pico, de 60 a 70 m, ≈ 44 km/h); 12,2; 12,0; 12,0 m/s. Cada degrau tem área exatamente 10 m (v × Δt = 10), e os dez somam 100 m: a integral da velocidade devolve a distância. Tarefa: arrastar o tempo até 9,58 s enquanto Bolt anda na pista e os metros acumulam. Ligação com o lab "derivada": lá a velocidade saiu da posição (derivada); aqui a posição volta da velocidade (integral). A velocidade instantânea real chegou a ≈ 12,3 m/s; o gráfico em degraus é uma média por trecho, não a velocidade instantânea.',
      ask: ['Por que o primeiro degrau é tão baixo?', 'Qual foi a velocidade máxima de Bolt?', 'Como isso se liga com a derivada?'],
    },
    {
      id: 'resolva',
      kind: 'medicao',
      label: 'Resolva',
      title: 'Três integrais',
      goal: 'Calcule integrais passo a passo, primeiro com ajuda, depois sozinho.',
      vega:
        'Três problemas, com cada vez menos ajuda; cada passo certo escreve uma linha no caderno do palco. Problema 1: ∫₀² x² dx por somas. Passos: Δx = (2 − 0)/4 = 0,5 (erros: 2, a largura toda; 0,25, que dá 8 fatias); alturas pela direita f(0,5), f(1), f(1,5), f(2) = 0,25; 1; 2,25; 4 (erros: usar x em vez de x²; usar a esquerda); soma das áreas 7,5 × 0,5 = 3,75 (erros: esquecer Δx; multiplicar pela largura total 2); próximo passo: fatias mais finas (erros: retângulos mais altos; parar). Então cada retângulo se parte em dois até n = 256 e R_n → 8/3 ≈ 2,667. Problema 2: A(x) = área de 0 até x sob x²; o aluno arrasta x até 2 e a curva A(x) = x³/3 é desenhada; pergunta: em x = 1,5, a inclinação de A é f(1,5) = 2,25 (erros: 1,125, que é o valor de A; 1,5, que é x). Teorema Fundamental do Cálculo: A′(x) = f(x), integrar desfaz derivar, e A(2) = 8/3 confirma o problema 1. Problema 3, sem ajuda: ∫₁³ (2x + 1) dx = F(3) − F(1) com F = x² + x: 12 − 2 = 10; o trapézio confirma (3 + 7)/2 × 2 = 10. Distratores: 12 (esqueceu F(1)), 8 (esqueceu o +1), 7 (f(3)). Guie com perguntas, nunca dê a alternativa.',
      ask: ['Por que a inclinação de A é f(x)?', 'O que é uma primitiva?', 'Como eu acho a F de 2x + 1?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'Ré e atalhos',
      goal: 'Teste a integral com velocidade negativa e compare métodos.',
      vega:
        'Desafio 1 (exemplo imaginado): v(t) = 60 − 40t km/h de 0 a 2,5 h; o carro anda para a frente até 1,5 h e depois dá ré. A área acima do eixo vale +45 km e abaixo −20 km; a integral é 25 km (deslocamento), enquanto a distância percorrida é 65 km (integral de |v|). Erro comum: achar que a integral sempre dá a distância percorrida. Desafio 2: com n = 10 em ∫₀² x² dx, a esquerda dá 2,28 (erro ≈ 0,39) e o ponto médio 2,66 (erro ≈ 0,0067). O ponto médio é muito melhor: a sobra de um lado da fatia quase cancela a falta do outro. Dobrar n divide o erro da esquerda por 2 e o do meio por 4 (erro de ordem 1/n contra 1/n²). O trapézio é a média de esquerda e direita.',
      ask: ['Qual a diferença entre deslocamento e distância?', 'Por que o ponto médio erra tão pouco?', 'E o método do trapézio?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'O ciclo fechado',
      goal: 'Veja o que você descobriu e para onde ir agora.',
      vega:
        'Resumo: área sob a velocidade = distância; a integral é o limite das somas de Riemann; Teorema Fundamental do Cálculo: d/dx ∫ₐˣ f = f(x) e ∫ₐᵇ f(x) dx = F(b) − F(a). O aluno reconstruiu os 100 m de Bolt (IAAF, Berlim 2009), mostrou que as somas de x² em [0,2] tendem a 8/3 e calculou ∫₁³(2x + 1)dx = 10. Próximo lab da trilha: "Imitando curvas com polinômios" (Cálculo 2, séries de Taylor).',
      ask: ['Onde mais a integral aparece?', 'O que vem depois disso no Cálculo?'],
    },
  ],
}
