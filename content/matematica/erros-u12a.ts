import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 12, aulas 1 a 3: abaixo de zero, somar e
// subtrair na reta, tirar um negativo (somados ao catálogo em erros.ts).
// Reaproveitado de outra unidade: inverte-reta.
export const ERROS_U12A: ErroComum[] = [
  {
    id: 'negativo-maior-pelo-numero',
    nome: 'compara negativos pelo número sem o sinal',
    causa: 'Olha só o número depois do sinal, como fazia com os naturais: 5 é maior que 2, então acha que −5 é maior que −2. Esquece que, abaixo de zero, quanto mais longe do zero, menor.',
    exemplo: '"−5 > −2"; entre −4 °C e −7 °C, diz que a mais fria é −4 °C; entre saldos de −R$ 30 e −R$ 80, diz que o maior é −R$ 80.',
    desmonte: 'Pôr os dois na reta: −5 fica à esquerda de −2, e na reta quem está mais à esquerda é o menor. No termômetro, −5 °C é mais frio que −2 °C; no extrato, dever R$ 80 é pior que dever R$ 30.',
  },
  {
    id: 'modulo-com-sinal',
    nome: 'dá a distância até o zero com o sinal de menos',
    causa: 'Confunde o número com a distância dele até o zero. Como −6 é negativo, acha que a distância também é negativa.',
    exemplo: 'A distância de −6 até o zero é −6 (é 6); o módulo de −4 é −4 (é 4).',
    desmonte: 'Contar os passos do zero até −6 na reta: são 6 passos, como do zero até 6. Distância é quanto se anda, e ninguém anda −6 passos. −6 e 6 são opostos: a mesma distância, lados contrários.',
  },
  {
    id: 'esquece-sinal-do-resultado',
    nome: 'esquece o sinal de menos do resultado',
    causa: 'Faz a conta com os números sem sinal (o maior menos o menor) e escreve o resultado como positivo, sem ver que passou do zero e ficou do lado esquerdo.',
    exemplo: '3 − 5 = 2 (é −2); o saldo de R$ 40 depois de pagar R$ 65 fica R$ 25 (é −R$ 25); (−5) − (−2) = 3 (é −3).',
    desmonte: 'Andar na reta: do 3, 3 passos levam ao zero e os outros 2 passam dele. Chega a −2, à esquerda do zero. No saldo: pagar mais do que se tem deixa uma dívida.',
  },
  {
    id: 'anda-para-o-lado-errado',
    nome: 'anda para o lado errado na reta',
    causa: 'Junta os números sem olhar o sinal de cada um: soma quando um deles é uma dívida, ou anda para a direita quando a conta manda ir para a esquerda.',
    exemplo: '2 + (−3) = 5 (é −1); (−3) + 5 = −8 (é 2); (−6) − 2 = −4 (é −8).',
    desmonte: 'Somar um positivo é andar para a direita; subtrair um positivo ou somar um negativo é andar para a esquerda. Com fichas: 2 + (−3) são 2 + e 3 −; dois pares valem zero e sobra uma −.',
  },
  {
    id: 'menos-com-menos-na-soma',
    nome: 'usa "menos com menos dá mais" numa soma',
    causa: 'Ouviu a frase "menos com menos dá mais" e a aplica a toda conta com dois negativos. A regra é da multiplicação; numa soma, dívida mais dívida é mais dívida.',
    exemplo: '(−4) + (−3) = 7 (é −7); uma temperatura de −2 °C que cai mais 3 graus vira 5 °C (é −5 °C).',
    desmonte: 'Com fichas: 4 − e mais 3 − são 7 −, nenhuma +. Não há como sobrar dinheiro. Na reta: do −4, andar 3 para a esquerda leva a −7, mais longe do zero.',
  },
  {
    id: 'tirar-negativo-subtrai',
    nome: 'tira um negativo como se fosse um positivo',
    causa: 'Vê o sinal de subtrair e subtrai o número, sem ver que o que sai é uma dívida. Lê 2 − (−3) como 2 − 3.',
    exemplo: '2 − (−3) = −1 (é 5); (−5) − (−2) = −7 (é −3); de 5 °C a −3 °C a temperatura caiu 2 graus (caiu 8).',
    desmonte: 'Com fichas: para tirar três − de +2, pôr três pares + − (valem zero) e tirar as três −. Sobram 5 +. Cancelar uma dívida aumenta o saldo: 2 − (−3) = 2 + 3 = 5.',
  },
]
