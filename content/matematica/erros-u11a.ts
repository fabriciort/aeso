import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 11, aulas 1 a 3: por cento, porcentagem de
// um valor, aumento e desconto (somados ao catálogo em erros.ts).
// Reaproveitados de outras unidades: esquece-zero-decimal,
// troca-decimo-centesimo, fracao-vira-virgula, conta-grupos-como-unidades.
export const ERROS_U11A: ErroComum[] = [
  {
    id: 'porcentagem-como-numero-inteiro',
    nome: 'lê o número da porcentagem como a própria quantidade',
    causa: 'Vê o 25 de "25 %" e usa o 25 inteiro, como se fossem 25 unidades ou 25 reais. Esquece que "por cento" quer dizer "de cada 100": um pedaço do todo.',
    exemplo: '25 % escrito como 25 em vez de 0,25; 10 % de R$ 80 dado como R$ 10; 10 % de desconto em R$ 60 como 60 − 10 = R$ 50.',
    desmonte: 'Pintar 25 % na grade: são 25 quadradinhos de 100, um quarto de um inteiro só. Para 10 % de R$ 80, cortar a barra de R$ 80 em 10 partes: cada uma vale R$ 8, não R$ 10. R$ 10 só seria 10 % de R$ 100.',
  },
  {
    id: 'troca-10-e-1-por-cento',
    nome: 'divide por 10 quando é por 100 (ou o contrário)',
    causa: 'Sabe que porcentagem é dividir, mas troca as duas contas: 10 % é ÷ 10 e 1 % é ÷ 100. Também aparece ao escrever 25 % como 2,5.',
    exemplo: '1 % de R$ 80 dado como R$ 8; 10 % de R$ 80 dado como R$ 0,80; 25 % escrito 2,5.',
    desmonte: 'Na tabela, descer de 100 % a 10 % (÷ 10) e de 10 % a 1 % (÷ 10 de novo). 1 % é um décimo de 10 %: tem de ser bem menor. Na grade, 1 % é um quadradinho; 10 %, uma coluna inteira.',
  },
  {
    id: 'divide-pelo-numero-da-porcentagem',
    nome: 'divide o valor pelo número da porcentagem',
    causa: 'Generaliza "10 % é dividir por 10" para qualquer porcentagem: 20 % viraria dividir por 20.',
    exemplo: '20 % de R$ 45 dado como 45 ÷ 20 = R$ 2,25; 25 % de R$ 80 como 80 ÷ 25 = R$ 3,20.',
    desmonte: 'Na barra de 10 partes, 20 % são 2 partes de 10 %: o dobro de 10 %, não um pedaço menor. Conferir: 20 % tem de dar mais que 10 % (R$ 9 contra R$ 4,50).',
  },
  {
    id: 'desconto-como-preco-final',
    nome: 'dá o desconto no lugar do preço a pagar',
    causa: 'Faz a conta da porcentagem certa e para ali: o valor do desconto parece a resposta. Também aparece ao multiplicar o preço pelo número do desconto (× 0,1), em vez do que sobra (× 0,9).',
    exemplo: 'Camisa de R$ 60 com 10 % de desconto: responde R$ 6 (o desconto) em vez de R$ 54 (o que se paga); 30 % OFF em R$ 200 vira 200 × 0,3 = R$ 60.',
    desmonte: 'Na barra do preço, o desconto é a parte que sai; você paga as que ficam. Com 10 % de desconto, ficam 9 das 10 partes: 90 %, o preço × 0,9. Conferir: o preço final é um pouco menor que o preço cheio.',
  },
  {
    id: 'fator-de-aumento-sem-o-um',
    nome: 'multiplica só pela porcentagem do aumento',
    causa: 'Sabe que 10 % é 0,1 e multiplica o preço por 0,1 para aumentar 10 %. Esquece que o valor novo é o antigo inteiro (100 %) mais o aumento.',
    exemplo: 'A conta de R$ 120 sobe 10 %: faz 120 × 0,1 = R$ 12 e diz que a conta nova é R$ 12 (é R$ 132, ou 120 × 1,1).',
    desmonte: 'Na barra, o aumento é uma parte a mais depois das 10 partes da conta antiga: 11 partes, 110 %, o fator 1,1. Conferir: depois de um aumento, o valor tem de ficar maior que o antigo.',
  },
]
