import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 19, parte A (aulas 1 a 3: média, mediana e
// moda; quando a média engana; desvio padrão), somados ao catálogo em erros.ts.
// Reaproveitados de outras unidades: esquece-sinal-do-resultado,
// potencia-sinal-fora-dos-parenteses, raiz-e-a-metade, responde-outra-pergunta
// e soma-no-lugar-de-multiplicar.
export const ERROS_U19A: ErroComum[] = [
  {
    id: 'media-esquece-valores',
    nome: 'na média, deixa valores de fora',
    causa: 'Soma cada número uma vez só, sem contar os repetidos, ou deixa de fora da quantidade um valor que é 0. No gráfico de pontos, lê os números da reta, e não os pontos.',
    exemplo: 'Os atrasos 8, 2, 5, 2 e 3 viram (8 + 2 + 5 + 3) ÷ 4 = 4,5 (é 20 ÷ 5 = 4). Os quadrados 1, 9, 0, 9 e 1 viram 20 ÷ 4 = 5, porque o 0 "não conta" (é 20 ÷ 5 = 4).',
    desmonte: 'Cada ponto é uma entrega, um dia, um comprimido: contar os pontos, não os números da reta. A pilha de 3 pontos no 25 são 3 entregas de 25 minutos. Um desvio 0 é um comprimido de verdade, que também entra na conta.',
  },
  {
    id: 'media-do-menor-e-do-maior',
    nome: 'faz a média só do menor e do maior',
    causa: 'Acha que a média é o meio do caminho entre o menor e o maior valor, sem usar os valores do meio.',
    exemplo: 'Nas entregas de 25 a 55 minutos, diz que a média é (25 + 55) ÷ 2 = 40, mas 315 ÷ 9 = 35.',
    desmonte: 'Pôr o apoio no 40: a reta pende para a esquerda, porque a maioria dos pontos está lá. A média usa todos os pontos: a soma de todos dividida pela quantidade.',
  },
  {
    id: 'mediana-sem-ordenar',
    nome: 'acha o meio da lista sem pôr em fila',
    causa: 'Sabe que a mediana é o valor do meio, mas pega o do meio da lista na ordem em que veio, sem ordenar do menor ao maior.',
    exemplo: 'Os atrasos 8, 2, 5, 2, 3: diz que a mediana é 5, o do meio da lista. Em fila, 2, 2, 3, 5, 8: é 3.',
    desmonte: 'Pôr os pontos em fila, do menor ao maior, e só então achar o do meio. A mesma lista em outra ordem daria outra "mediana": por isso a fila vem antes.',
  },
  {
    id: 'mediana-par-pega-um-do-meio',
    nome: 'com quantidade par, pega só um dos dois do meio',
    causa: 'Com uma quantidade par de valores, a fila tem dois no meio. A pessoa escolhe um deles, em vez de ficar entre os dois.',
    exemplo: 'Na fila 20, 25, 30, 35, 40, 50, diz que a mediana é 30 (ou 35). É (30 + 35) ÷ 2 = 32,5.',
    desmonte: 'Contar quantos ficam de cada lado: com o 30, sobram 2 à esquerda e 3 à direita. O meio de verdade fica entre o 30 e o 35, na média dos dois: 32,5.',
  },
  {
    id: 'moda-e-o-maior-valor',
    nome: 'acha que a moda é o maior valor',
    causa: 'Liga "moda" a "o que está no alto" e escolhe o maior número, e não o que mais se repete.',
    exemplo: 'Nos atrasos 8, 2, 5, 2, 3, diz que a moda é 8. É 2, que aparece duas vezes.',
    desmonte: 'No gráfico de pontos, a moda é a pilha mais alta, não o ponto mais à direita. Na loja, o tamanho da moda é o que mais vende, não o maior.',
  },
  {
    id: 'moda-como-frequencia',
    nome: 'dá quantas vezes a moda aparece, no lugar dela',
    causa: 'Conta a pilha mais alta e responde a altura dela, e não o valor embaixo dela.',
    exemplo: 'Nas entregas, a pilha do 25 tem 3 pontos: responde que a moda é 3. A moda é 25 minutos; o 3 é quantas vezes ele aparece.',
    desmonte: 'Ler o número embaixo da pilha, na reta: a moda é um tempo, como os outros valores. A altura diz só quantas entregas tiveram esse tempo.',
  },
  {
    id: 'troca-media-mediana-moda',
    nome: 'troca a média, a mediana e a moda',
    causa: 'Sabe que são três resumos, mas não guarda qual é qual: dá a média quando pedem a mediana, ou a mediana quando pedem a moda.',
    exemplo: 'Nas entregas, pedem a mediana e a pessoa responde 35, a média. Pedem a moda e ela responde 30, o do meio da fila.',
    desmonte: 'Ligar cada nome a um gesto: a média é o apoio que equilibra a reta; a mediana é o do meio da fila; a moda é a pilha mais alta.',
  },
  {
    id: 'usa-sempre-a-media',
    nome: 'usa sempre a média',
    causa: 'Acha que a média é sempre o melhor resumo, o "valor típico", e que duas listas com a mesma média são iguais. Não olha os valores que destoam nem o espalhamento.',
    exemplo: 'Uma vaga anuncia salário médio de R$ 6 mil numa loja em que 6 das 7 pessoas ganham até R$ 4 mil. Ou: duas linhas de ônibus com média de 10 minutos "tanto faz", mas uma já fez esperar 18. Ou: um lote de comprimidos com média 500 mg aprovado, mesmo espalhado demais.',
    desmonte: 'Olhar os pontos, não só o número: o salário do dono puxa o apoio para longe de todos. A mediana fica junto da maioria; a amplitude e o desvio padrão mostram o espalhamento que a média esconde.',
  },
  {
    id: 'mediana-segue-o-extremo',
    nome: 'acha que a mediana sobe junto com o valor que destoa',
    causa: 'Vê a média mudar quando o maior valor cresce e acha que a mediana muda do mesmo jeito.',
    exemplo: 'Os salários 2, 2, 3, 3, 3, 4 e 25 mil: o dono passa a ganhar 32. A pessoa diz que a mediana sobe. Ela continua 3: o dono ainda é o último da fila.',
    desmonte: 'Pôr em fila antes e depois: só o último muda de valor, e o do meio continua o mesmo. A mediana só olha a posição na fila.',
  },
  {
    id: 'amplitude-e-o-maior-valor',
    nome: 'dá o maior valor como amplitude',
    causa: 'Lê "o quanto vai" como "até onde vai" e responde o maior valor, sem tirar o menor.',
    exemplo: 'Esperas de 2 a 18 minutos: diz que a amplitude é 18. É 18 − 2 = 16.',
    desmonte: 'O colchete da amplitude começa no menor valor, não no 0. Medir o colchete: de 2 a 18 são 16 minutos.',
  },
  {
    id: 'soma-desvios-sem-sinal',
    nome: 'soma os desvios sem os sinais',
    causa: 'Junta os desvios como distâncias e não vê que os de baixo da média são negativos e cancelam os de cima.',
    exemplo: 'Desvios −1, +3, 0, −3 e +1: diz que a soma é 8. Com os sinais, dá 0.',
    desmonte: 'Pôr os segmentos na reta: os verdes vão para a direita, os rosa para a esquerda, e se cancelam. A média é o equilíbrio: a soma dos desvios dá 0 sempre. Por isso se tira o sinal de propósito, com a distância ou o quadrado.',
  },
  {
    id: 'desvio-padrao-sem-a-raiz',
    nome: 'esquece a raiz no desvio padrão',
    causa: 'Faz os quadrados e a média deles e para ali. Não vê que o número ainda está ao quadrado, em "mg ao quadrado".',
    exemplo: 'Desvios −1, +3, 0, −3, +1: quadrados somam 20, e 20 ÷ 5 = 4. Responde 4 mg, mas o desvio padrão é √4 = 2 mg.',
    desmonte: 'Comparar com os desvios: eles são de 1 e de 3 mg, então o afastamento típico não pode ser 4. A raiz desfaz o quadrado e volta para miligramas.',
  },
  {
    id: 'desvio-padrao-sem-o-quadrado',
    nome: 'faz a média das distâncias no lugar do desvio padrão',
    causa: 'Tira o sinal dos desvios e faz a média deles, sem o quadrado e a raiz. É uma medida de espalhamento, mas não é o desvio padrão.',
    exemplo: 'Desvios −1, +3, 0, −3, +1: responde (1 + 3 + 0 + 3 + 1) ÷ 5 = 1,6. O desvio padrão é √4 = 2.',
    desmonte: 'As duas medem o afastamento, e por isso dão perto. O desvio padrão eleva ao quadrado, faz a média e tira a raiz: os desvios grandes pesam mais.',
  },
]
