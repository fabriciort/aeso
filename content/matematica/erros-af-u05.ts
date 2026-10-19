import type { ErroComum } from '@/lib/formation/schema'

export const ERROS_AF_U05: ErroComum[] = [
  {
    "id": "ineq-so-inteiros",
    "nome": "Limita a solução aos inteiros sem motivo",
    "causa": "Confunde marcas numeradas da reta com todos os pontos reais.",
    "exemplo": "Só 21, 22, 23… resolvem $x>20$? Responde: Sim: a solução começa no 21",
    "desmonte": "21 é o menor inteiro que serve. 20,5 é real e também serve."
  },
  {
    "id": "ineq-exclui-igualdade",
    "nome": "Exclui uma borda que aceita empate",
    "causa": "Ignora o traço de igualdade de ≤ ou ≥.",
    "exemplo": "E $x\\ge20$? O ponto 20 fica: Responde: Excluído: círculo aberto",
    "desmonte": "O traço de igualdade permite o empate em 20."
  },
  {
    "id": "ineq-menor-real",
    "nome": "Procura o primeiro real de um intervalo aberto",
    "causa": "Trata os reais como se fossem números separados por passos fixos.",
    "exemplo": "Existe o **menor número real** maior que 20? Responde: Sim: 20,1",
    "desmonte": "20,05 é menor que 20,1 e também é maior que 20."
  },
  {
    "id": "ineq-inverte-positivo",
    "nome": "Inverte ao dividir por positivo",
    "causa": "Aplica a inversão sem distinguir o sinal do divisor.",
    "exemplo": "De $3x\\le15$, dividir os dois lados por 3 dá: Responde: $x\\ge5$",
    "desmonte": "Dividir por positivo não inverte a ordem. 6 já dá 18 > 15."
  },
  {
    "id": "ineq-cancelou-x-zero",
    "nome": "Interpreta cancelamento como x igual a zero",
    "causa": "Confunde desaparecer da expressão com ter valor zero.",
    "exemplo": "Se $2x+1<2x+4$, tirar 2x dos dois lados deixa $1<4$. Quem serve? Responde: Só x = 0",
    "desmonte": "As letras se cancelaram; não foram igualadas a zero."
  },
  {
    "id": "ineq-distributiva",
    "nome": "Multiplica só o primeiro termo",
    "causa": "Desconsidera que o fator multiplica toda a expressão entre parênteses.",
    "exemplo": "Depois da distributiva, qual é a comparação? Responde: $2x+1\\le x+7$",
    "desmonte": "São dois grupos de (x + 1): o 1 também dobra."
  },
  {
    "id": "ineq-contradicao-todos",
    "nome": "Aceita todos ao chegar a uma comparação falsa",
    "causa": "Olha apenas para o cancelamento das letras e não lê o resultado.",
    "exemplo": "Se $2x+5\\le2x+3$, sobra $5\\le3$. Há solução? Responde: Todos os reais",
    "desmonte": "As letras sumirem não basta: é preciso ler a comparação que restou."
  },
  {
    "id": "ineq-nao-inverte-negativo",
    "nome": "Mantém a ordem ao dividir por negativo",
    "causa": "Transfere a regra de divisores positivos para um divisor que reflete a reta.",
    "exemplo": "Multiplicando $-x^2+5x-4\\ge0$ por −1, fica: Responde: $x^2-5x+4\\ge0$",
    "desmonte": "Trocar só os sinais dos termos sem inverter muda as soluções."
  },
  {
    "id": "ineq-inverte-na-soma",
    "nome": "Inverte por somar ou subtrair",
    "causa": "Confunde deslocamento com reflexão da reta.",
    "exemplo": "E somar −2 aos dois lados de $2<5$? Responde: Também inverte",
    "desmonte": "Aqui há uma soma, não uma multiplicação por negativo."
  },
  {
    "id": "ineq-confunde-e-ou",
    "nome": "Troca interseção por união",
    "causa": "Aceita cumprir uma condição quando ambas são exigidas, ou exige ambas quando basta uma.",
    "exemplo": "O horário x = 6 atende às duas condições? Responde: Sim: 6 é maior que 1",
    "desmonte": "Com E, satisfazer só uma condição não basta."
  },
  {
    "id": "ineq-escolhe-meio-ou",
    "nome": "Escolhe o meio de duas faixas externas",
    "causa": "Lê duas fronteiras como um intervalo entre elas sem conferir as condições.",
    "exemplo": "Em $x<1$ **OU** $x>5$, o 3 entra? Responde: Sim: está entre as bordas",
    "desmonte": "As soluções são as faixas de fora; o intervalo do meio fica excluído."
  },
  {
    "id": "ineq-cadeia-incompleta",
    "nome": "Opera só dois membros da cadeia",
    "causa": "Esquece que a desigualdade dupla contém duas comparações ligadas.",
    "exemplo": "Subtraindo 1 de cada um dos três membros, fica: Responde: $-1\\le2x<6$",
    "desmonte": "O limite esquerdo também precisa perder 1."
  },
  {
    "id": "ineq-intersecao-ponto",
    "nome": "Descarta o único ponto comum",
    "causa": "Supõe que um conjunto de soluções precisa conter uma faixa com comprimento positivo.",
    "exemplo": "Se $x\\ge3$ **E** $x\\le3$, quem serve? Responde: Ninguém",
    "desmonte": "As duas permitem igualdade. O ponto 3 pertence a ambas."
  },
  {
    "id": "ineq-so-raizes",
    "nome": "Responde as raízes em vez das faixas",
    "causa": "Resolve a equação associada e para antes de estudar a desigualdade.",
    "exemplo": "O que muda ao trocar = 0 por < 0? Responde: Nada: a resposta continua só 1 e 4",
    "desmonte": "Em 1 e 4, o resultado é zero, que não é negativo."
  },
  {
    "id": "ineq-produto-so-positivos",
    "nome": "Exige que os dois fatores sejam positivos",
    "causa": "Esquece que dois fatores negativos também produzem resultado positivo.",
    "exemplo": "Para o produto ser positivo, os dois fatores precisam ser positivos? Responde: Sim: só sinais positivos servem",
    "desmonte": "O exemplo (−1) · (−4) já dá um produto positivo."
  },
  {
    "id": "ineq-produto-escolhe-meio",
    "nome": "Escolhe a região sem conferir os sinais",
    "causa": "Decora dentro ou fora das raízes sem verificar o sinal pedido e o coeficiente.",
    "exemplo": "Em qual parte o produto é não negativo? Responde: $-2\\le x\\le3$",
    "desmonte": "No meio, os sinais são opostos e o produto é negativo."
  },
  {
    "id": "ineq-divide-expressao",
    "nome": "Divide por expressão de sinal desconhecido",
    "causa": "Trata um fator com x como se fosse um número positivo e não nulo.",
    "exemplo": "Podemos dividir $(x-1)(x-4)<0$ por $x-1$ mantendo sempre o sinal? Responde: Sim: basta cortar o fator",
    "desmonte": "Se x − 1 for negativo, seria preciso inverter. Não sabemos isso para todos os x."
  },
  {
    "id": "ineq-raiz-dupla-troca",
    "nome": "Troca o sinal ao cruzar uma raiz dupla",
    "causa": "Generaliza para todo zero a troca de sinal dos fatores de multiplicidade ímpar.",
    "exemplo": "Em $(x-2)^2>0$, quais reais servem? Responde: Só x > 2",
    "desmonte": "x = 1 dá (−1)² = 1, também positivo. A raiz dupla não troca o sinal."
  },
  {
    "id": "ineq-quadrado-sempre-serve",
    "nome": "Aplica a propriedade do quadrado ao sinal errado",
    "causa": "Sabe que o quadrado é não negativo mas não compara isso com o que foi pedido.",
    "exemplo": "Quem resolve $(x-2)^2\\le0$? Responde: Todos os reais",
    "desmonte": "Com x = 3 o quadrado é 1, e 1 ≤ 0 é falso."
  },
  {
    "id": "ineq-sem-raizes-sem-sinal",
    "nome": "Decide pela falta de raízes sem verificar o sinal",
    "causa": "Acha que não zerar implica sempre satisfazer a desigualdade.",
    "exemplo": "E $x^2+1<0$? Responde: Todos os reais, pois não há raízes",
    "desmonte": "Não ter raízes não decide a desigualdade. Aqui o sinal é sempre positivo."
  },
  {
    "id": "ineq-linguagem-limite",
    "nome": "Traduz o limite com o sinal errado",
    "causa": "Não distingue ultrapassar, atingir e não ultrapassar um valor.",
    "exemplo": "Sem passar de R$ 50 permite gastar exatamente R$ 50? Responde: Não: usamos <",
    "desmonte": "Sem passar aceita ficar no limite. Gastar menos exigiria <."
  },
  {
    "id": "ineq-ignora-contexto",
    "nome": "Aceita qualquer solução algébrica no contexto",
    "causa": "Esquece que comprimentos exigem positividade e contagens exigem inteiros não negativos.",
    "exemplo": "De $x\\le7$, a compra permite quais quantidades? Responde: Qualquer real menor que 7",
    "desmonte": "Não compramos uma quantidade negativa ou uma parte deste item inteiro."
  },
  {
    "id": "ineq-arredonda-limite",
    "nome": "Arredonda sem conferir o limite",
    "causa": "Usa arredondamento comum em um problema que pede máximo ou mínimo permitido.",
    "exemplo": "Uma conta deu $x<5{,}7$ para caixas inteiras. Qual é o máximo? Responde: 6 caixas",
    "desmonte": "Arredondar para o mais próximo pode violar o limite."
  },
  {
    "id": "ineq-descarta-solucoes",
    "nome": "Descarta todas as soluções sem conferir",
    "causa": "Confunde não encontrar um valor único com não existir solução.",
    "exemplo": "x > 2 leva a conjunto vazio.",
    "desmonte": "Teste x = 3: 3 > 2 é verdadeiro. As soluções formam a faixa à direita de 2, sem incluir 2."
  },
  {
    "id": "ineq-aceita-todos",
    "nome": "Aceita todos os reais sem conferir",
    "causa": "Não confronta o conjunto com as condições da desigualdade.",
    "exemplo": "x < 4 aceitaria qualquer real.",
    "desmonte": "Teste x = 5: 5 < 4 é falso. A solução precisa excluir todos os valores que violam a comparação."
  },
  {
    "id": "ineq-ignora-extremo-pedido",
    "nome": "Para num valor permitido sem achar o extremo pedido",
    "causa": "Não testa se cabe mais um item ou se a meta já foi atingida antes.",
    "exemplo": "Podem ser comprados de 0 a 7 itens, mas responde 6 como máximo.",
    "desmonte": "Para conferir o máximo, tente mais um item. Para conferir o primeiro mês, teste o anterior. Um valor permitido pode não ser o extremo pedido."
  }
]
