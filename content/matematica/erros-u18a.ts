import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 18, parte A (aulas 1 a 3: coordenadas; ler
// gráficos; gráficos que enganam), somados ao catálogo em erros.ts.
// Reaproveitados de outras unidades: anda-para-o-lado-errado,
// porcentagem-como-numero-inteiro, divide-pelo-numero-da-porcentagem,
// parte-como-porcentagem, divide-todo-pela-parte, responde-outra-pergunta e
// operacao-trocada.
export const ERROS_U18A: ErroComum[] = [
  {
    id: 'troca-x-e-y',
    nome: 'troca o x e o y',
    causa: 'Sabe que o ponto tem dois números, mas não guarda qual anda para o lado e qual anda para cima. Acha que a ordem não importa.',
    exemplo: 'Marca (3, 2) no lugar de (2, 3); diz que (0, 4) fica no eixo x; lê o ponto 1 para o lado e 4 para cima como (4, 1).',
    desmonte: 'Pôr (3, 2) e (2, 3) no mesmo plano: são dois lugares diferentes. Sair sempre da origem e andar primeiro no eixo de baixo (o x, como na ordem alfabética), depois subir (o y).',
  },
  {
    id: 'ignora-sinal-da-coordenada',
    nome: 'marca o ponto sem olhar o sinal',
    causa: 'Anda os números certos, mas sempre para a direita e para cima, como se o menos não mudasse o sentido.',
    exemplo: 'Marca (−3, −2) no 1º quadrante, em (3, 2); manda o tiro de (−3, 4) para a direita; da farmácia em (−2, 3) até a escola em (4, 3) conta 4 − 2 = 2 quadras.',
    desmonte: 'Os eixos são duas retas numéricas: o menos no x vai para a esquerda do 0, e no y vai para baixo. Andar o caminho da origem, casa por casa, e contar as casas no mapa.',
  },
  {
    id: 'le-valor-entre-marcas',
    nome: 'lê o valor na marca mais perto',
    causa: 'Procura o número escrito no eixo mais perto do topo da barra e para ali, sem ver que o topo fica entre duas marcas.',
    exemplo: 'A barra vai até o meio entre 80 e 100 e a pessoa lê 80 (ou 100); o topo fica no meio entre 140 e 160 e ela lê 160.',
    desmonte: 'Seguir o topo da barra até o eixo com o dedo. Se fica entre duas marcas, o valor também fica entre elas: no meio de 80 e 100 é 90. Comparar com uma barra que chega bem na marca.',
  },
  {
    id: 'subida-pela-altura',
    nome: 'julga a subida pela altura, e não pela diferença',
    causa: 'Olha só o ponto mais alto da linha e acha que ali foi a maior subida. A subida é a diferença entre dois meses seguidos, não o valor de um.',
    exemplo: 'A conta foi 100, 140 e 150: escolhe o 150 como o maior salto, mas ele subiu 10, e o 140 subiu 40.',
    desmonte: 'Escrever a diferença de cada mês para o seguinte (+40, +10). Na linha, o maior salto é o pedaço mais em pé, não o ponto mais alto.',
  },
  {
    id: 'nao-olha-o-inicio-do-eixo',
    nome: 'compara as barras sem olhar onde começa o eixo',
    causa: 'Compara o tamanho do desenho. Não vê que o eixo começa num número longe do 0 e que o desenho mostra só a pontinha das barras.',
    exemplo: 'Vendas de 92 e 98 mil com o eixo começando no 90: diz que março vendeu 4 vezes janeiro. Pão de R$ 10 e R$ 11 com o eixo no 9: diz que o preço dobrou.',
    desmonte: 'Ler o primeiro número do eixo. Descer o eixo até o 0: as barras crescem e ficam quase iguais. A comparação de verdade é pelos números: 98 contra 92.',
  },
  {
    id: 'nao-confere-a-escala',
    nome: 'não confere se as marcas do eixo pulam igual',
    causa: 'Supõe que marcas à mesma distância valem o mesmo pulo, e compara as barras pela altura numa escala torta.',
    exemplo: 'Marcas 0, 10, 20, 50 e 100 à mesma distância: R$ 20 e R$ 50 parecem quase iguais, mas R$ 50 é 2,5 vezes R$ 20.',
    desmonte: 'Escrever o pulo entre cada marca (10, 10, 30, 50). Se os pulos mudam, a altura engana: redesenhar na escala regular, com todos os pulos iguais.',
  },
]
