import type { Lab } from './types'

// Definição do laboratório "gradiente" (Matemática). Conteúdo em components/labs/gradiente/.

export const GRADIENTE: Lab = {
  slug: 'gradiente',
  title: 'Subindo a montanha',
  subtitle: 'Explore uma montanha imaginária com curvas de nível e descubra o gradiente: a direção mais íngreme.',
  area: 'Matemática',
  level: 'Graduação',
  track: 'calculo-3',
  minutes: 20,
  status: 'disponivel',
  concepts: ['Funções de duas variáveis', 'Curvas de nível', 'Derivadas parciais', 'Gradiente'],
  accent: '#f5d061',
  achievement: {
    title: 'Bússola do gradiente',
    description: 'Você leu um mapa de curvas de nível, calculou ∇f e desceu um vale na neblina só com a inclinação.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'Uma montanha imaginada',
      goal: 'Arraste o trilheiro pelo terreno e ache o cume.',
      vega:
        'Exemplo imaginado: uma montanha em 3D (malha de linhas, gira ao arrastar o fundo). Cada ponto do chão (x, y), em km, tem uma altura f(x, y). O aluno é o ponto dourado: arrasta-o e vê a altura ao vivo e o recorde. Tarefa: achar o cume (≈ 1.114 m). Existe um falso cume (≈ 626 m) a sudoeste: se ele parar lá, pergunte se há algo mais alto, sem dizer onde. Ideia central: uma função de duas variáveis é um terreno; a entrada é um lugar no mapa, a saída é a altura. No cume o chão fica plano em todas as direções (isso vira ∇f = 0 mais tarde).',
      ask: ['O que significa f(x, y)?', 'Por que a montanha tem dois picos?', 'Como eu sei que cheguei no topo?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Curvas de nível',
      goal: 'Transforme a montanha num mapa e preveja onde ela é mais íngreme.',
      vega:
        'O palco fatia a montanha a cada 100 m (anéis sobre a superfície), depois a câmera sobe até a vista de cima e os anéis descem para o plano: o mapa de curvas de nível. Pergunta: duas trilhas, A (encosta leste) e B (ombro oeste), sobem ambas de 300 m a 600 m. Qual é mais íngreme? Resposta: A, onde as curvas estão juntas (sobe 300 m em ≈ 0,37 km; B precisa de ≈ 1,2 km). Erros comuns: achar que curvas juntas significam lugar alto (no cume as curvas se afastam: lá é quase plano); achar que as trilhas são iguais porque sobem a mesma altura (esquecem a distância). Não entregue antes da escolha; depois, mostre a razão subida ÷ distância.',
      ask: ['O que é uma curva de nível?', 'Por que curvas juntas significam subida íngreme?', 'O cume não deveria ter curvas juntas?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'Fatias e a seta',
      goal: 'Veja as derivadas parciais como fatias e junte-as no gradiente.',
      vega:
        'Cena 1–2: um plano vertical corta a montanha na direção leste-oeste (y constante) passando pelo trilheiro; a borda do corte é uma curva de uma variável e a inclinação da reta tangente é ∂f/∂x. Tarefa: achar um ponto onde ∂f/∂x = 0 sem estar no cume (por exemplo na encosta sul, logo abaixo do topo: lá a fatia leste-oeste está no ponto mais alto dela, mas para o norte ainda sobe). Cena 3: o plano gira para norte-sul e mostra ∂f/∂y. Cena 4–5: vista de cima, a seta ∇f = (∂f/∂x, ∂f/∂y) nasce da soma das duas componentes; ela aponta para a subida mais íngreme, é perpendicular à curva de nível e o comprimento é a inclinação máxima. No cume ∇f = 0. Unidades: x, y e f em km, então a inclinação é um número puro (0,5 = sobe 50 cm por metro). Guie com perguntas sobre a forma da fatia, sem dar coordenadas.',
      ask: ['Por que ∂f/∂x pode ser zero fora do cume?', 'Por que a seta é perpendicular à curva de nível?', 'O que significa o comprimento da seta?'],
    },
    {
      id: 'mundo-real',
      kind: 'observacao',
      label: 'No mundo real',
      title: 'Pão de Açúcar',
      goal: 'Leia o relevo do Pão de Açúcar e do Morro da Urca com o gradiente.',
      vega:
        'Relevo inspirado no Pão de Açúcar (396 m) e no Morro da Urca (≈ 220 m), no Rio de Janeiro: alturas reais (Parque Bondinho Pão de Açúcar), forma simplificada por gaussianas (está rotulado). O bondinho liga Praia Vermelha, Urca e Pão de Açúcar desde 1912. Cena 2: tocar no ponto mais íngreme (as encostas do Pão de Açúcar, onde as curvas se apertam; a inclinação máxima do modelo é ≈ 50°). Cena 3: escolher a direção de uma trilha suave na encosta da Urca: seguir ∇f é o caminho mais íngreme; perpendicular a ∇f não sobe nada (é andar sobre a curva de nível); contra ∇f desce; a resposta é o zigue-zague, num ângulo entre os dois. Cena 4: girar a direção; a subida por metro é |∇f|·cos θ (θ = ângulo com ∇f). Trilhas confortáveis têm uns 10–20 % de inclinação.',
      ask: ['Por que as trilhas fazem zigue-zague?', 'Qual é a inclinação real do Pão de Açúcar?', 'Como funciona o bondinho?'],
    },
    {
      id: 'resolva',
      kind: 'medicao',
      label: 'Resolva',
      title: 'Calculando ∇f',
      goal: 'Calcule o gradiente de f(x, y) = x² + 3y², um passo de cada vez.',
      vega:
        'Problema 1 (com muita ajuda), f(x, y) = x² + 3y² no ponto (1, 1): ∂f/∂x = 2x (y é constante, então 3y² vira número e deriva para 0; erros comuns: 2x + 3y², x², 2x + 6y); a fatia y = 1 é a parábola x² + 3, tangente de inclinação 2. ∂f/∂y = 6y (erros: 2y, x² + 6y, 3y²); fatia x = 1, inclinação 6. ∇f(1, 1) = (2, 6) (erros: (6, 2) não é perpendicular à elipse; 8 não é vetor; (2x, 6y) ainda não foi avaliado no ponto). |∇f| = √(2² + 6²) = √40 ≈ 6,32 (erros: 8, 40, 6). Problema 2 (menos ajuda): derivada direcional em (1, 1) na direção u = (0,6; 0,8): ∇f · u = 1,2 + 4,8 = 6 (erros: 6,32 só vale na direção de ∇f; 5,2 troca os pares; 8 esquece u). Problema 3 (sozinho): ∇f(−2; 0,5) = (−4, 3), comprimento 5; o aluno monta a seta arrastando no palco ou com os botões. Não dê a resposta; peça a regra (derivar só a letra que anda) e a substituição.',
      ask: ['Por que 3y² some quando derivo em x?', 'Como somo dois vetores para achar o comprimento?', 'O que é derivada direcional?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'Perdido na neblina',
      goal: 'Desça um vale sem enxergar, só sentindo a inclinação.',
      vega:
        'Vale f = x² + 3y² coberto de neblina: o aluno só sente o chão sob os pés. Pergunta 1: para descer, ande na direção de −∇f (descida mais íngreme), não de ∇f nem ao longo da curva de nível; ir "direto ao fundo" é impossível sem enxergar. Regra: (x, y) ← (x, y) − η∇f. Em x² + 3y², cada passo multiplica x por (1 − 2η) e y por (1 − 6η): η pequeno (0,02) chega devagar; η ≈ 0,15 chega rápido; acima de 1/6 faz zigue-zague em y; acima de 1/3 (ex. 0,4, fator −1,4) diverge, cada passo mais longe. Ligação real e geral: redes neurais são treinadas com variações da descida do gradiente; o "vale" é a função de erro, com milhões de parâmetros, e η é a taxa de aprendizado (Cauchy, 1847; Rumelhart, Hinton & Williams, 1986). Não exagere: é a ideia central do treino, não toda a história.',
      ask: ['Por que um passo grande demais faz zigue-zague?', 'Como as redes neurais usam isso?', 'Como escolher um bom η?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'O mapa no bolso',
      goal: 'Reveja o que você descobriu sobre o gradiente.',
      vega:
        'Resumo: f(x, y) é um terreno; curvas de nível ligam pontos de mesma altura, juntas = íngreme (não alto); ∂f/∂x e ∂f/∂y são inclinações de fatias; ∇f = (∂f/∂x, ∂f/∂y) aponta para a maior subida, é perpendicular às curvas de nível e |∇f| é a inclinação máxima; D_u f = ∇f · u; descer por −∇f é a descida do gradiente. Fontes: Parque Bondinho Pão de Açúcar (alturas), Cauchy (1847), Rumelhart, Hinton & Williams (1986). Próximo laboratório da trilha: "A equação que prevê o futuro" (Cálculo 4), sobre equações diferenciais e campos de direções.',
      ask: ['Onde mais o gradiente aparece?', 'O que vem depois do Cálculo 3?'],
    },
  ],
}
