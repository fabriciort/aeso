import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 3 de Álgebra e Funções, parte B: aulas 5 a
// 7, a fórmula, o discriminante e os problemas do 2º grau (somados ao
// catálogo em erros.ts). Reaproveitados: termo-perde-o-sinal (unidade 1 de
// Álgebra: o b de −2x lido como 2), coeficiente-e-o-expoente (o a de x² lido
// como 2), sinais-iguais-da-negativo (−4ac com c negativo),
// potencia-sinal-fora-dos-parenteses ((−2)² = −4), divide-so-o-primeiro,
// passa-para-o-outro-lado, esquece-de-dividir, esquece-sinal-do-resultado,
// produto-so-das-pontas, fatora-com-o-sinal-trocado,
// fatores-com-a-soma-errada, responde-outra-pergunta,
// potencia-multiplica-base-pelo-expoente, quadrado-da-soma-sem-o-meio, e da
// parte A desta unidade: raiz-so-positiva, raiz-de-numero-negativo,
// raiz-com-o-sinal-do-fator, separa-produto-diferente-de-zero,
// completa-com-b-ao-quadrado (o canto (b/a)² em vez de (b/2a)²) e
// completa-com-a-metade.
export const ERROS_AF_U03B: ErroComum[] = [
  {
    id: 'formula-sinal-do-b',
    nome: 'usa +b em vez de −b na fórmula',
    causa: 'Copia o b da equação para a fórmula sem o menos que vem na frente dele, ou acha que o "−" de −b quer dizer "b é negativo". Com b negativo, esquece que −b fica positivo.',
    exemplo: 'Em x² − 2x − 3 = 0 (b = −2), escreve x = (−2 ± 4)/2 e acha 1 e −3, em vez de x = (2 ± 4)/2, que dá 3 e −1.',
    desmonte: 'O −b vem de tirar b/2a dos dois lados, no fim do completar o quadrado: (x − 1)² = 4 dá x = 1 ± 2, com o 1 positivo. E conferir: com x = 1, 1 − 2 − 3 = −4, não 0.',
  },
  {
    id: 'divide-so-a-raiz',
    nome: 'divide por 2a só a raiz, e não o −b',
    causa: 'Lê a fórmula da esquerda para a direita e vê o traço da fração só embaixo da raiz. Esquece que o traço é comprido: pega o −b e a raiz juntos.',
    exemplo: 'Em x² − 2x − 3 = 0, faz x = 2 ± 4/2 = 2 ± 2 e acha 4 e 0, em vez de (2 ± 4)/2, que dá 3 e −1.',
    desmonte: 'Na fórmula, tudo está sobre 2a: x = (−b ± √Δ)/2a, como o −b/2a e o √Δ/2a que saem do completar o quadrado. Confira o 4: 16 − 8 − 3 = 5, não 0.',
  },
  {
    id: 'aceita-raiz-negativa-no-problema',
    nome: 'aceita a raiz negativa como medida',
    causa: 'Resolve a equação e responde as duas raízes, porque as duas deixam a equação certa. Não volta ao problema para ver o que o x é.',
    exemplo: 'Um terreno de lados x e x + 3 com 40 m²: responde "5 m ou −8 m". Ou: a moldura tem largura 5 cm ou −20 cm.',
    desmonte: 'A equação não sabe que x é um lado. Desenhe o terreno com −8: um lado de −8 m não existe. Com 5, os lados são 5 e 8, e 5 · 8 = 40. Escreva o que é o x antes de montar.',
  },
  {
    id: 'discriminante-zero-nenhuma-raiz',
    nome: 'acha que Δ = 0 não tem raiz',
    causa: 'Associa o zero a "nada": se o número embaixo da raiz deu 0, acha que a conta acabou sem resposta.',
    exemplo: 'Em x² − 6x + 9 = 0, Δ = 36 − 36 = 0, e diz "nenhuma raiz". Mas x = 3 resolve: 9 − 18 + 9 = 0.',
    desmonte: 'A raiz de 0 existe: é 0, porque 0 · 0 = 0. Fica x = (6 ± 0)/2 = 3, uma raiz só. É o quadrado perfeito: (x − 3)² = 0 só com x = 3.',
  },
  {
    id: 'discriminante-zero-da-duas',
    nome: 'acha que Δ = 0 dá duas raízes',
    causa: 'Decorou que o ± sempre dá duas raízes. Não vê que somar zero e tirar zero chegam ao mesmo número.',
    exemplo: 'Em x² − 6x + 9 = 0, com Δ = 0, responde "3 e −3", ou conta duas raízes.',
    desmonte: '(6 + 0)/2 e (6 − 0)/2 dão os dois 3: uma raiz só. Confira o −3: 9 + 18 + 9 = 36, não 0. Na reta, os dois pulos do ± têm tamanho zero e caem no mesmo ponto.',
  },
  {
    id: 'moldura-so-de-um-lado',
    nome: 'põe a moldura só de um lado',
    causa: 'Lê "uma moldura de largura x" e soma um x a cada lado da foto, sem ver que a moldura aparece nas duas pontas de cada lado.',
    exemplo: 'Uma foto de 20 cm por 10 cm com moldura de largura x vira um quadro de (20 + x) por (10 + x), em vez de (20 + 2x) por (10 + 2x).',
    desmonte: 'Desenhe: em cima, a moldura tem x à esquerda da foto e x à direita. O lado de cima mede x + 20 + x = 20 + 2x. Com x = 5, o quadro mede 30 por 20, e 30 · 20 = 600.',
  },
]
