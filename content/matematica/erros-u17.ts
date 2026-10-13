import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 17: planificações, volume de prismas e
// cilindros, área de superfície (somados ao catálogo em erros.ts).
// Reaproveitados: soma-no-lugar-de-multiplicar (unidade 3: somar as medidas
// em vez de multiplicar), area-do-triangulo-sem-metade, confunde-raio-diametro,
// pi-e-3-14 e confunde-area-perimetro (unidade 16), confunde-m3-com-litro e
// converte-volume-como-comprimento (unidade 9) e ignora-contexto-do-resto
// (unidade 4: a lata de tinta que falta, arredondada para baixo).
export const ERROS_U17: ErroComum[] = [
  {
    id: 'conta-so-o-que-ve',
    nome: 'conta só as faces (ou cantos) que estão à vista',
    causa: 'O sólido no papel mostra só a frente, um lado e o topo. A pessoa conta o que vê e esquece o que está atrás e embaixo: a base, o fundo, o canto escondido, a segunda tampa da lata.',
    exemplo: 'A caixa com 3 faces (são 6) ou 7 vértices (são 8). O papel do embrulho só com frente, lado e topo. A lata pintada com uma tampa só.',
    desmonte: 'Abrir a caixa: a planificação mostra as 6 faces de uma vez, e as de trás aparecem. No sólido "de arame", as arestas de trás tracejadas mostram o canto que faltava.',
  },
  {
    id: 'conta-aresta-duas-vezes',
    nome: 'conta as arestas face por face',
    causa: 'Conta os 4 lados de cada uma das 6 faces da caixa (6 · 4 = 24) sem ver que cada aresta é a dobra entre duas faces: cada uma foi contada duas vezes.',
    exemplo: 'A caixa com 24 arestas (são 12). O prisma de base triangular com 18 (são 9).',
    desmonte: 'Na planificação, cada dobra junta duas faces: fechada a caixa, as duas bordas viram uma aresta só. 24 bordas, de duas em duas, dão 12 arestas. Contar no sólido: 4 em cima, 4 embaixo e 4 em pé.',
  },
  {
    id: 'toda-cruz-fecha-cubo',
    nome: 'acha que qualquer arrumação de 6 quadrados fecha um cubo',
    causa: 'Sabe que o cubo aberto tem 6 quadrados e acha que basta ter 6 quadrados juntos. Não imagina a dobra: duas faces podem cair no mesmo lugar e deixar um buraco.',
    exemplo: 'Uma fila de 5 quadrados com mais um do lado; ou uma fila de 4 com os dois de sobra do mesmo lado.',
    desmonte: 'Dobrar em pensamento: uma fila de 4 dá a volta no cubo (as 4 paredes). Os outros dois viram a tampa e o fundo, um de cada lado da fila. Numa fila de 5, a quinta face cai em cima da primeira.',
  },
  {
    id: 'lateral-com-o-diametro',
    nome: 'acha que o retângulo da lata tem a largura do diâmetro',
    causa: 'Vê a lata de frente, com a largura do diâmetro, e acha que o rótulo aberto tem essa largura. Esquece que o rótulo dá a volta inteira na lata.',
    exemplo: 'Lata de 8 cm de diâmetro com rótulo de 8 cm de largura (são π · 8 ≈ 25,12 cm).',
    desmonte: 'Desenrolar o rótulo: a largura do retângulo é a volta do círculo da tampa, π · d, pouco mais de 3 diâmetros. Com 8 cm, o rótulo só cobriria um terço da lata.',
  },
  {
    id: 'volume-so-a-base',
    nome: 'para na camada do fundo',
    causa: 'Multiplica o comprimento pela largura e acha que acabou: contou os cubinhos do fundo, uma camada só, e esqueceu que as camadas se empilham até a altura.',
    exemplo: 'Caixa de 4 cm por 3 cm por 5 cm com 12 cm³ (são 60 cm³).',
    desmonte: 'Encher a caixa com cubinhos: a primeira camada tem 4 · 3 = 12. A caixa tem 5 cm de altura, então cabem 5 camadas: 5 · 12 = 60.',
  },
  {
    id: 'confunde-volume-superficie',
    nome: 'confunde o volume com a área da superfície',
    causa: 'Volume e área de superfície usam as mesmas medidas da caixa, e a pessoa faz a conta da outra pergunta: multiplica as três medidas quando a pergunta é o papel do embrulho, ou soma as faces quando é o quanto cabe.',
    exemplo: 'Caixa de 10 por 8 por 6 cm com 480 cm² de papel (480 é o volume, em cm³; o papel é 376 cm²).',
    desmonte: 'O volume é o que cabe dentro: cubinhos, em cm³. A superfície é a casca, o que se pinta ou embrulha: quadradinhos nas faces, em cm². A tinta não entra na caixa; a água não fica do lado de fora.',
  },
  {
    id: 'volume-em-unidade-de-area',
    nome: 'escreve o volume em cm² (ou em m)',
    causa: 'Faz a conta certa, mas dá ao volume a unidade da área ou do comprimento. Não liga o volume aos cubos que enchem o sólido.',
    exemplo: 'Caixa de 4 cm por 3 cm por 5 cm com volume de 60 cm² (são 60 cm³).',
    desmonte: 'Os 60 são cubinhos de 1 cm de lado, que enchem a caixa: 60 cm³, com o 3 das três medidas. 60 cm² seriam quadradinhos de papel, que só cobrem.',
  },
  {
    id: 'area-do-circulo-como-quadrado',
    nome: 'dá ao círculo a área do quadrado em volta dele',
    causa: 'Põe o círculo dentro de um quadrado (de lado igual ao diâmetro) e usa a área do quadrado, sem tirar os cantos que ficam de fora do círculo.',
    exemplo: 'Círculo de raio 2 cm com área 4 · 2 · 2 = 16 cm² (são π · 2 · 2 ≈ 12,56 cm²).',
    desmonte: 'Os 4 quadrados do raio cobrem o quadrado em volta. O círculo perde os 4 cantos e fica com pouco mais de 3 deles: π quadrados do raio.',
  },
  {
    id: 'pinta-faces-a-mais',
    nome: 'soma faces que a pergunta deixa de fora',
    causa: 'Aprende que a superfície é a soma das 6 faces e soma sempre as 6, mesmo quando uma não entra: o chão do quarto que não se pinta, a tampa da caixa aberta.',
    exemplo: 'As paredes de um quarto de 4 m por 3 m, com 2,5 m de altura: 47 m² (com o teto) no lugar de 35 m².',
    desmonte: 'Pintar face por face e perguntar a cada uma: esta leva tinta? As paredes são 4: frente, fundo e os dois lados. O teto e o chão ficam de fora.',
  },
]
