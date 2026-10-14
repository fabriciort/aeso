import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 18, parte B: aulas 4 e 5, relações entre
// grandezas e a ideia de função (somados ao catálogo em erros.ts).
// Reaproveitados: pensa-aditivamente (unidade 10: somar o mesmo nas duas
// grandezas), esquece-valor-fixo (unidade 14: esquecer a parte que se paga de
// qualquer jeito), desfaz-com-a-mesma-operacao (unidade 15: desfazer o + 15
// somando 15), esquece-de-dividir (unidade 15: parar no 0,8x), responde-outra-
// pergunta (unidade 15: dar o preço por hora quando a pergunta é o fixo) e
// junta-algarismos-com-a-letra (unidade 14: 2x com x = 3 vira 23).
export const ERROS_U18B: ErroComum[] = [
  {
    id: 'toda-reta-e-proporcional',
    nome: 'acha que toda reta mostra grandezas proporcionais',
    causa: 'Vê os pontos numa reta e chama de proporcional, sem olhar onde a reta começa. Uma reta que não passa pelo (0, 0) tem uma parte fixa, que não cresce junto.',
    exemplo: 'A corrida de R$ 5 para começar e R$ 2 por km dá uma reta, e a pessoa diz que o preço é proporcional aos km.',
    desmonte: 'Seguir a reta para trás até o 0 km: ela chega em R$ 5, não em R$ 0. Com 0 km você já paga a bandeirada. Proporcional é a reta que sai do (0, 0), como a do pão.',
  },
  {
    id: 'regra-de-tres-sem-proporcao',
    nome: 'dobra (ou usa a regra de três) onde não há proporção',
    causa: 'Aprendeu que "o dobro de um dá o dobro do outro" e usa isso em toda relação que cresce, mesmo quando há um valor fixo ou quando o crescimento não é sempre o mesmo.',
    exemplo: '4 km de corrida custam R$ 13, então 8 km custariam R$ 26. Com R$ 5 fixos e R$ 2 por km, 8 km custam R$ 21.',
    desmonte: 'Na tabela, os R$ 5 entram uma vez só, em cada corrida: 5 + 4 · 2 = 13 e 5 + 8 · 2 = 21. Dobrar 13 cobra a bandeirada duas vezes. No gráfico, a reta não sai do (0, 0).',
  },
  {
    id: 'cresce-junto-e-proporcional',
    nome: 'acha que crescer junto é ser proporcional',
    causa: 'Quando uma grandeza aumenta e a outra também, pensa que as duas são proporcionais. Não confere se dobrar uma dobra a outra.',
    exemplo: 'O lado do quadrado passa de 2 m para 4 m, e a pessoa acha que a área passa de 4 m² para 8 m² (passa para 16 m²).',
    desmonte: 'Marcar os pontos (1, 1), (2, 4), (3, 9) e (4, 16): eles fazem uma curva, não uma reta pelo (0, 0). Dobrar o lado deixa a área 4 vezes maior.',
  },
  {
    id: 'regra-fora-de-ordem',
    nome: 'faz os passos da regra fora da ordem',
    causa: 'Na regra "× 0,80 + 15", soma o 15 antes de multiplicar, ou, para voltar da saída à entrada, desfaz primeiro o × e depois o +. A ordem dos passos muda o resultado.',
    exemplo: 'Com 150 kWh: (150 + 15) · 0,80 = R$ 132, em vez de 150 · 0,80 + 15 = R$ 135. Na volta, de R$ 215: 215 ÷ 0,80 − 15 em vez de (215 − 15) ÷ 0,80.',
    desmonte: 'A máquina faz os passos da esquerda para a direita: primeiro o consumo vira o preço da energia (× 0,80), depois entra a taxa fixa (+ 15). Para voltar, desfaz-se do fim para o começo, como tirar as meias depois dos sapatos: primeiro − 15, depois ÷ 0,80.',
  },
  {
    id: 'saida-muda-na-mesma-entrada',
    nome: 'acha que a mesma entrada pode dar outra saída',
    causa: 'Não vê a regra como fixa: pensa que a máquina "lembra" o que já passou ou que o resultado pode variar de uma vez para a outra.',
    exemplo: 'Duas casas gastaram 200 kWh, e a pessoa acha que as contas podem vir diferentes.',
    desmonte: 'Pôr o 200 de novo na máquina: a regra faz a mesma conta, 200 · 0,80 + 15 = 175, e o ponto cai no mesmo lugar do plano. Uma função dá uma só saída para cada entrada.',
  },
  {
    id: 'troca-entrada-e-saida',
    nome: 'põe a saída na máquina como se fosse a entrada',
    causa: 'Recebe o valor que saiu (a conta em reais) e aplica a regra nele, em vez de procurar a entrada que dá esse valor.',
    exemplo: 'A conta veio R$ 215 e a pessoa faz 215 · 0,80 + 15 = 187, como se tivesse gastado 215 kWh.',
    desmonte: 'Perguntar o que é cada número: 215 está em reais, é o y, o que saiu. A pergunta é o x, os kWh. Fica a equação 0,8x + 15 = 215, e a resposta (250 kWh) volta na máquina: 250 · 0,80 + 15 = 215.',
  },
]
