import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 16, parte A (aulas 1 a 4: ponto, reta,
// ângulo; medir ângulos; triângulos e os 180°; polígonos), somados ao
// catálogo em erros.ts. Reaproveitados de outras unidades: operacao-trocada
// e esquece-de-dividir.
export const ERROS_U16A: ErroComum[] = [
  {
    id: 'confunde-reta-e-segmento',
    nome: 'confunde reta, segmento e semirreta',
    causa: 'Vê só o traço desenhado e não as pontas: acha que toda linha acaba onde o desenho acaba, ou que todas são a mesma coisa.',
    exemplo: 'Diz que a reta AB termina em A e em B; chama de reta uma linha que começa num ponto e segue sem fim.',
    desmonte: 'Olhar as pontas: o segmento tem duas pontas (os dois pontos), a semirreta tem uma (o começo) e uma seta, a reta não tem pontas, só as duas setas. O desenho mostra um pedaço; as setas dizem que continua.',
  },
  {
    id: 'angulo-pelo-tamanho-dos-lados',
    nome: 'acha maior o ângulo de lados mais compridos',
    causa: 'Mede o ângulo pelo tamanho do desenho, e não pela abertura. Lados compridos parecem "mais ângulo".',
    exemplo: 'Entre um ângulo fechado de lados de 8 cm e um bem aberto de lados de 2 cm, escolhe o de 8 cm como maior.',
    desmonte: 'Encolher os lados compridos até ficarem do tamanho dos outros: o arco não muda e o ângulo continua fechado. Na tesoura, as lâminas não crescem quando ela abre.',
  },
  {
    id: 'troca-tipo-de-angulo',
    nome: 'troca agudo, reto e obtuso',
    causa: 'Decorou os nomes sem a régua do canto reto, ou compara com o raso em vez do reto.',
    exemplo: 'Chama de agudo um ângulo de 120°; chama de obtuso um de 60°.',
    desmonte: 'Pôr o canto de uma folha sobre o ângulo, com um lado em cima do outro: se o ângulo cabe dentro do canto, é agudo; se passa, é obtuso; se coincide, é reto. Em graus: agudo tem menos de 90°, obtuso mais de 90° e menos de 180°.',
  },
  {
    id: 'le-escala-de-fora',
    nome: 'lê o transferidor na escala errada',
    causa: 'O transferidor tem duas escalas, uma em cada sentido. Lê o primeiro número que vê, sem olhar qual escala começa no 0 sobre o lado do ângulo.',
    exemplo: 'Num ângulo de 40°, lê 140°, o número da outra escala.',
    desmonte: 'Seguir o lado de baixo até a escala: a escala certa tem o 0 ali. E conferir com o tipo do ângulo: um ângulo agudo não pode ter 140°.',
  },
  {
    id: 'confunde-volta-e-meia-volta',
    nome: 'troca a volta (360°) e a meia volta (180°)',
    causa: 'Sabe os dois números, 180 e 360, mas não liga cada um ao seu desenho.',
    exemplo: 'Diz que o ângulo raso tem 360°; reparte uma pizza em 4 fatias e dá 45° a cada canto (180 ÷ 4).',
    desmonte: 'Desenhar: a meia volta é uma linha reta, dois cantos retos, 90 + 90 = 180. A volta inteira são quatro cantos retos, 360. A pizza inteira é a volta inteira.',
  },
  {
    id: 'confunde-reto-e-raso',
    nome: 'usa o raso (180°) no lugar do reto (90°), ou o contrário',
    causa: 'Na conta do ângulo que falta, pega o número errado como inteiro: 180 quando o ângulo todo era um canto reto, ou 90 quando era uma reta.',
    exemplo: 'Um canto reto foi dividido em dois, e um pedaço tem 30°. Responde 150° (180 − 30) em vez de 60°.',
    desmonte: 'Olhar o desenho inteiro antes da conta: um canto de folha é 90°; uma reta, 180°. O pedaço que falta tem de caber no desenho: 150° não cabe num canto reto.',
  },
  {
    id: 'soma-depende-do-triangulo',
    nome: 'acha que a soma dos ângulos depende do triângulo',
    causa: 'Imagina que um triângulo grande tem ângulos maiores, ou que um triângulo comprido e fino soma menos.',
    exemplo: 'Diz que os ângulos de um triângulo enorme somam mais que 180°; ou que um triângulo pode ter dois ângulos retos se for grande.',
    desmonte: 'Recortar os três cantos de triângulos bem diferentes e juntá-los: sempre fecham uma reta, meia volta, 180°. Aumentar o triângulo alonga os lados, mas não abre os cantos.',
  },
  {
    id: 'triangulo-soma-360',
    nome: 'usa 360° como a soma dos ângulos do triângulo',
    causa: 'Lembra que "dá uma volta" e troca a meia volta pela volta inteira.',
    exemplo: 'Num triângulo com ângulos de 50° e 60°, responde que o terceiro mede 250° (360 − 110).',
    desmonte: 'Os três cantos juntos fazem uma reta, não uma volta. E um ângulo de 250° nem caberia dentro de um triângulo: cada canto tem menos de 180°.',
  },
  {
    id: 'esquece-um-angulo-na-soma',
    nome: 'esquece um dos ângulos conhecidos na soma',
    causa: 'Tira de 180 só o ângulo que tem número escrito e esquece o reto, marcado só pelo quadradinho, ou esquece o segundo ângulo.',
    exemplo: 'Num triângulo retângulo com um ângulo de 35°, responde 145° (180 − 35) em vez de 55°.',
    desmonte: 'Contar os três cantos antes da conta: o quadradinho vale 90°. 90 + 35 + 145 passaria muito de 180°.',
  },
  {
    id: 'curva-e-poligono',
    nome: 'acha que qualquer figura fechada é um polígono',
    causa: 'Guarda só a ideia de "figura fechada" e esquece que os lados têm de ser segmentos retos.',
    exemplo: 'Diz que o círculo é um polígono, ou que uma figura com um lado curvo é um polígono.',
    desmonte: 'Procurar os lados e os cantos: o círculo não tem nenhum segmento reto e nenhum canto. Polígono é fechado e feito só de segmentos.',
  },
  {
    id: 'regular-so-pelos-lados',
    nome: 'acha regular o polígono que só tem os lados iguais',
    causa: 'Olha só os lados. Esquece que o polígono regular tem também todos os ângulos iguais.',
    exemplo: 'Diz que o losango é regular porque os quatro lados são iguais.',
    desmonte: 'Pôr o losango ao lado do quadrado: os dois têm 4 lados iguais, mas o losango tem cantos fechados e cantos abertos. Só o quadrado tem os 4 ângulos iguais.',
  },
  {
    id: 'poligono-soma-180',
    nome: 'acha que os ângulos de qualquer polígono somam 180°',
    causa: 'Aprendeu os 180° do triângulo e usa o mesmo número para qualquer figura.',
    exemplo: 'Diz que os ângulos de um quadrado somam 180°, ou que os de um pentágono somam 180°.',
    desmonte: 'O quadrado tem 4 cantos retos: 4 · 90 = 360. Cortado por uma diagonal, vira 2 triângulos, e cada um dá 180°.',
  },
  {
    id: 'triangulos-demais',
    nome: 'conta um triângulo por lado ao dividir o polígono',
    causa: 'Acha que um polígono de n lados se divide em n triângulos a partir de um vértice, e multiplica 180 pelo número de lados.',
    exemplo: 'Diz que os ângulos do pentágono somam 5 · 180 = 900°, e não 3 · 180 = 540°.',
    desmonte: 'Traçar as diagonais a partir de um vértice: os dois lados que saem dele não viram diagonal. Sobram n − 2 triângulos: o pentágono dá 3. Com n triângulos, os cantos do meio entrariam na soma sem ser cantos do polígono.',
  },
  {
    id: 'troca-nome-do-poligono',
    nome: 'troca o nome do polígono',
    causa: 'Conta os lados com pressa, ou mistura os nomes (pentágono e hexágono).',
    exemplo: 'Chama de pentágono uma figura de 6 lados.',
    desmonte: 'Contar os lados tocando um por um, a partir de um canto marcado. O nome vem do número: penta é 5, hexa é 6.',
  },
]
