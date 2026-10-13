import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 11, aulas 4 a 6: que porcentagem é,
// variações sucessivas, juros simples e compostos (somados ao catálogo em
// erros.ts). Reaproveitados: pensa-aditivamente (unidade 10).
export const ERROS_U11B: ErroComum[] = [
  {
    id: 'divide-todo-pela-parte',
    nome: 'divide o todo pela parte',
    causa: 'Sabe que precisa dividir, mas põe o número maior na frente, porque "o maior dividido pelo menor" parece a conta certa.',
    exemplo: 'Acertou 18 de 24 questões e calcula 24 ÷ 18 = 1,33: "133 %". Ou: R$ 30 de desconto em R$ 120 vira 120 ÷ 30 = 4, "400 %".',
    desmonte: 'A parte cabe dentro do todo, então é menos de 100 %. Na grade, os 18 acertos não enchem a prova: pintam 75 dos 100 quadradinhos. A conta é parte ÷ todo: 18 ÷ 24 = 0,75.',
  },
  {
    id: 'parte-como-porcentagem',
    nome: 'lê a parte como se fosse a porcentagem',
    causa: 'Vê o número da parte e acha que ele já é a porcentagem, sem comparar com o todo.',
    exemplo: 'Acertou 18 de 24 questões: "18 %". R$ 30 de desconto em R$ 120: "30 % de desconto".',
    desmonte: 'Porcentagem é por cem. Só quando o todo é 100 a parte é a porcentagem. Com 24 questões, 18 acertos são 18 ÷ 24 = 0,75: 75 quadradinhos de 100.',
  },
  {
    id: 'esquece-multiplicar-por-100',
    nome: 'para no decimal e chama de porcentagem',
    causa: 'Divide a parte pelo todo, chega ao decimal e escreve esse número com o sinal de %, sem multiplicar por 100.',
    exemplo: '18 ÷ 24 = 0,75, e a resposta vira "0,75 %". Ou: 30 ÷ 150 = 0,2, e o aumento vira "0,2 %".',
    desmonte: '0,75 são 75 centésimos: 75 quadradinhos da grade de 100. Por cento é por cem: 0,75 = 75 %. E 0,75 % seria menos de um quadradinho.',
  },
  {
    id: 'porcentagem-sobre-o-valor-errado',
    nome: 'divide pelo valor novo, em vez do valor de antes',
    causa: 'Num aumento ou numa comparação, não pergunta "por cento de quê?" e divide pelo número que está mais à vista, o valor novo.',
    exemplo: 'A conta foi de R$ 150 para R$ 180: calcula 30 ÷ 180 e diz que subiu uns 17 %, em vez de 30 ÷ 150 = 20 %. Ou: o parcelado de R$ 1.200 contra R$ 1.000 à vista vira 200 ÷ 1.200.',
    desmonte: 'Perguntar "a mais que o quê?". O aumento é comparado com o valor de antes: R$ 150 é o 100 %. Conferir: 20 % de 150 é 30, e 150 + 30 = 180.',
  },
  {
    id: 'soma-porcentagens-sucessivas',
    nome: 'soma porcentagens seguidas',
    causa: 'Trata cada porcentagem como um pedaço fixo do preço inicial, sem ver que a segunda age sobre o preço que já mudou.',
    exemplo: 'Dois descontos de 20 % numa TV de R$ 1.000: "40 % de desconto, R$ 600". Mas paga R$ 640: o desconto total é de 36 %. Ou: "50 % + 20 %" vira 70 %.',
    desmonte: 'Na grade da TV, o primeiro desconto deixa 80 quadradinhos; o segundo tira 20 % desses 80, só 16. Com fatores: 0,8 × 0,8 = 0,64. Os fatores se multiplicam, não se somam.',
  },
  {
    id: 'sobe-e-desce-volta-ao-mesmo',
    nome: 'acha que subir e cair a mesma porcentagem volta ao mesmo valor',
    causa: 'Pensa que os dois 10 % são do mesmo tamanho e se cancelam, sem ver que o segundo é calculado sobre um valor diferente.',
    exemplo: 'R$ 200 subiu 10 % e caiu 10 %: "voltou a R$ 200". Mas subiu para R$ 220, e 10 % de 220 são R$ 22: ficou R$ 198.',
    desmonte: 'O 10 % da subida é de R$ 200; o da descida é de R$ 220, um pedaço maior. Com fatores: 1,1 × 0,9 = 0,99, sempre um pouco menos que o começo.',
  },
  {
    id: 'confunde-ponto-percentual',
    nome: 'confunde ponto percentual com porcentagem',
    causa: 'Subtrai duas porcentagens e chama a diferença de "x %", sem notar que a diferença entre taxas se mede em pontos percentuais e que o aumento relativo é outro número.',
    exemplo: 'Os juros foram de 10 % para 12 % ao mês: "subiram 2 %". Subiram 2 pontos percentuais, e 2 em 10 é 20 %: os juros ficaram 20 % mais caros.',
    desmonte: 'Na grade, 10 quadradinhos viram 12. A diferença é de 2 quadradinhos: 2 pontos percentuais. Mas 2 a mais em cima de 10 é 2 ÷ 10 = 0,2: um aumento de 20 %.',
  },
  {
    id: 'juros-compostos-como-simples',
    nome: 'calcula juros compostos como se fossem simples',
    causa: 'Calcula os juros de um mês e repete o mesmo valor todo mês, sem ver que os juros entram na dívida e também passam a render juros.',
    exemplo: 'R$ 1.000 a 10 % ao mês, juros compostos, por 3 meses: "R$ 100 por mês, R$ 1.300". Mas a dívida vai a R$ 1.100, R$ 1.210 e R$ 1.331.',
    desmonte: 'Na tabela, mês a mês: a seta é × 1,1, não + 100. Os juros crescem: R$ 100, depois R$ 110, depois R$ 121. Em 12 meses a diferença passa de R$ 900.',
  },
  {
    id: 'juros-sem-o-valor-inicial',
    nome: 'responde só os juros quando a pergunta é o total',
    causa: 'Calcula os juros e esquece de juntá-los ao valor que tinha no começo.',
    exemplo: 'R$ 2.000 a 2 % ao mês, juros simples, por 3 meses: responde R$ 120, mas a dívida no fim é R$ 2.000 + R$ 120 = R$ 2.120.',
    desmonte: 'Olhar a tabela: o mês 0 já começa com R$ 2.000, e cada mês soma os juros. A dívida no fim é o valor de antes mais os juros.',
  },
]
