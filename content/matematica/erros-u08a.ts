import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 8, aulas 1 a 3: ler, escrever, converter,
// comparar e arredondar decimais (somados ao catálogo em erros.ts).
// Reaproveitados de outras unidades: separador-decimal (vírgula e ponto),
// equivalente-somando, arredonda-sempre-para-cima, empate-para-baixo,
// olha-casa-errada.
export const ERROS_U08A: ErroComum[] = [
  {
    id: 'troca-decimo-centesimo',
    nome: 'confunde a casa dos décimos com a dos centésimos',
    causa: 'Não guarda a ordem das casas depois da vírgula. Põe o algarismo uma casa adiante ou atrás, ou lê décimos como centésimos.',
    exemplo: '3 décimos escritos 0,03; R$ 0,40 lido como 4 centavos; 0,6 escrito como 6/100.',
    desmonte: 'Pintar na grade: 0,3 são 3 colunas inteiras, 30 quadradinhos; 0,03 são só 3 quadradinhos. A primeira casa depois da vírgula conta colunas (décimos); a segunda, quadradinhos (centésimos). No dinheiro: 3 moedas de 10 centavos contra 3 de 1 centavo.',
  },
  {
    id: 'esquece-zero-decimal',
    nome: 'esquece o zero que guarda a casa dos décimos',
    causa: 'Acha que o zero logo depois da vírgula não vale nada e pode sumir, como se a casa vazia não existisse.',
    exemplo: '5 centavos escritos R$ 0,5; "três reais e sete centavos" escrito 3,7.',
    desmonte: 'Pintar 0,5 na grade: 5 colunas, metade do real, 50 centavos. Os 5 centavos são só 5 quadradinhos: 0,05. Sem o zero, o 5 escorrega para a casa dos décimos e vale dez vezes mais.',
  },
  {
    id: 'fracao-vira-virgula',
    nome: 'troca a barra da fração por uma vírgula',
    causa: 'Vê dois números na fração e dois lados na vírgula, e junta um com o outro, sem pensar no tamanho do número.',
    exemplo: '3/4 escrito 3,4 ou 0,34; 2/5 escrito 2,5.',
    desmonte: '3/4 é menos que 1 inteiro, e 3,4 passa de 3 inteiros. Na grade, 3/4 são 3 pedaços de 25 quadradinhos: 75 centésimos, 0,75. E 0,34 nem chega à metade da grade.',
  },
  {
    id: 'denominador-como-decimal',
    nome: 'escreve 1/n como 0,n',
    causa: 'Generaliza o caso de 1/10 = 0,1 e 1/2 = 0,5: acha que o número de baixo vai direto para depois da vírgula.',
    exemplo: '1/4 escrito 0,4; 1/5 escrito 0,5; 0,6 lido como 1/6.',
    desmonte: '0,5 é a metade, então não pode ser 1/5. Na grade, 1/4 é um quarto dos 100 quadradinhos: 25, ou 0,25. E quanto maior o número de baixo, menor o pedaço: 1/5 é menos que 1/4, mas 0,5 seria mais.',
  },
  {
    id: 'decimal-mais-casas-maior',
    nome: 'acha que o decimal mais comprido é o maior',
    causa: 'Lê o que vem depois da vírgula como um número inteiro: 25 é mais que 5, então 0,25 seria mais que 0,5.',
    exemplo: 'Diz que 0,25 > 0,5, ou que 2,35 m é mais comprido que 2,4 m.',
    desmonte: 'Duas grades lado a lado: 0,5 são 5 colunas cheias, e 0,25 nem chega a 3. Completar com zero, 0,5 = 0,50: aí sim, 50 centésimos contra 25. Comparar casa por casa, começando pelos décimos.',
  },
  {
    id: 'decimal-mais-curto-maior',
    nome: 'acha que o decimal mais curto é o maior',
    causa: 'Aprendeu que décimos valem mais que centésimos e conclui que o número só com décimos sempre ganha, sem olhar os algarismos.',
    exemplo: 'Diz que 0,4 > 0,45 porque "0,4 tem décimos e 0,45 tem centésimos".',
    desmonte: 'Os dois têm 4 décimos: 4 colunas cheias nas duas grades. O 0,45 ainda tem 5 quadradinhos a mais. Completar com zero: 0,40 contra 0,45. Os décimos empatam, e os centésimos decidem.',
  },
  {
    id: 'arredondar-corta-casas',
    nome: 'arredonda apagando as últimas casas',
    causa: 'Acha que arredondar é deixar o número mais curto, então só corta as casas que sobram, sem ver qual marca está mais perto.',
    exemplo: 'Arredonda 2,37 ao décimo como 2,3.',
    desmonte: 'Na reta de 2,3 a 2,4, com o meio em 2,35: o 2,37 já passou do meio e fica mais perto de 2,4. Cortar só funciona quando o algarismo seguinte é de 0 a 4.',
  },
]
