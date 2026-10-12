import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 3 (somados ao catálogo em erros.ts).
// Reaproveitados da unidade 2: esquece-reserva (o vai um da multiplicação),
// escreve-numero-inteiro-na-casa e operacao-trocada.
export const ERROS_U03: ErroComum[] = [
  {
    id: 'soma-no-lugar-de-multiplicar',
    nome: 'soma os dois números em vez de multiplicar',
    causa: 'Vê dois números e um sinal e junta os dois, sem perceber que um deles diz quantos grupos e o outro, quanto há em cada grupo.',
    exemplo: '4 pacotes de 6 pães viram 4 + 6 = 10 pães.',
    desmonte: 'Pôr os 4 pacotes na mesa, um de cada vez: 6, 12, 18, 24. Só um pacote já tem 6; com 4 pacotes, 10 é pouco demais.',
  },
  {
    id: 'esquece-grupo-extra',
    nome: 'parte de um fato conhecido e esquece o grupo que falta (ou que sobra)',
    causa: 'Usa um fato vizinho para chegar a um fato novo, mas para no meio do caminho: não soma a linha que faltava, ou não tira a linha que sobrava.',
    exemplo: '6 × 7: lembra que 5 × 7 = 35 e responde 35. Ou 9 × 8: lembra que 10 × 8 = 80 e responde 80.',
    desmonte: 'No retângulo de 6 linhas de 7, cobrir 5 linhas: 35. A sexta linha ainda está lá, com 7 quadradinhos. 35 + 7 = 42.',
  },
  {
    id: 'soma-grupo-errado',
    nome: 'soma ou tira o número errado no fato derivado',
    causa: 'Sabe que precisa de uma linha a mais (ou a menos), mas usa a quantidade de linhas em vez do tamanho da linha.',
    exemplo: '6 × 7 = 5 × 7 + 6 = 41, em vez de 5 × 7 + 7 = 42. Ou 9 × 8 = 80 − 9 = 71.',
    desmonte: 'Acender a linha que falta no retângulo e contar os quadradinhos dela: são 7, o tamanho de cada linha. O 6 é o número de linhas.',
  },
  {
    id: 'conta-zeros-errado',
    nome: 'põe zeros a mais ou a menos ao multiplicar por 10, 100, 1.000',
    causa: 'Decora "põe zero no fim" sem pensar nas casas: esquece os zeros que o número já tinha, conta os algarismos de 1.000 em vez dos zeros, ou trata 20 como 2.',
    exemplo: '50 × 100 = 500; 36 × 100 = 360; 6 × 20 = 12.',
    desmonte: 'No quadro posicional, cada ×10 faz todos os algarismos andarem uma casa para a esquerda. 50 × 100: o 5 sai das dezenas e anda duas casas, até os milhares: 5.000.',
  },
  {
    id: 'distributiva-parcial',
    nome: 'quebra um número e multiplica só uma das partes',
    causa: 'Parte o número para facilitar, mas depois só multiplica a parte redonda e soma a outra parte como está.',
    exemplo: '6 × 23 = 6 × 20 + 3 = 123, em vez de 6 × 20 + 6 × 3 = 138.',
    desmonte: 'Partir o retângulo de 6 por 23: o pedaço pequeno também tem 6 linhas. Ele vale 6 × 3 = 18, não 3.',
  },
  {
    id: 'multiplica-so-casas-iguais',
    nome: 'multiplica dezena com dezena e unidade com unidade',
    causa: 'Leva para a multiplicação a regra da adição (casa com casa) e esquece os produtos cruzados.',
    exemplo: '23 × 14 = 20 × 10 + 3 × 4 = 212, em vez de 322.',
    desmonte: 'Quebrar os dois lados do retângulo: são 4 pedaços (200, 30, 80 e 12). Contando só dois, 30 e 80 ficam de fora.',
  },
  {
    id: 'esquece-deslocar-linha',
    nome: 'esquece o zero de deslocamento na segunda linha',
    causa: 'Na multiplicação armada, multiplica pelo algarismo das dezenas como se fosse unidade e escreve a linha sem andar uma casa.',
    exemplo: '23 × 14: escreve 92 e, embaixo, 23 alinhado pela direita. Soma e acha 115, em vez de 92 + 230 = 322.',
    desmonte: 'O 1 do 14 vale 10: a segunda linha é 10 × 23 = 230. Estimar também denuncia: 23 × 14 fica perto de 20 × 15 = 300, longe de 115.',
  },
  {
    id: 'reserva-antes-de-multiplicar',
    nome: 'soma o vai um antes de multiplicar',
    causa: 'Na multiplicação armada, junta a reserva ao algarismo de cima e só depois multiplica, como se a reserva fizesse parte do número.',
    exemplo: '6 × 27: 6 × 7 = 42, fica 2, vai 4. Depois faz (2 + 4) × 6 = 36 e acha 362, em vez de 6 × 2 + 4 = 16, e 162.',
    desmonte: 'A reserva são 4 dezenas prontas, que já foram multiplicadas. 6 × 2 dezenas = 12 dezenas, e mais as 4 que subiram: 16 dezenas.',
  },
]
