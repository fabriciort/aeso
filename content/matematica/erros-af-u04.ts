import type { ErroComum } from '@/lib/formation/schema'

export const ERROS_AF_U04: ErroComum[] = [
  {
    "id": "sistema-unidades",
    "nome": "Mistura quantidade e dinheiro",
    "causa": "Escreve a mesma soma para grandezas com unidades diferentes.",
    "exemplo": "12 ingressos por R$ 100 vira x + y = 100.",
    "desmonte": "x + y conta ingressos. Para contar reais, multiplique cada quantidade pelo preço: 10x + 5y = 100."
  },
  {
    "id": "sistema-so-uma",
    "nome": "Confere só uma condição",
    "causa": "Aceita um par assim que ele satisfaz uma das equações.",
    "exemplo": "6 inteiras e 6 meias somam 12, então servem para R$ 100.",
    "desmonte": "A quantidade dá 12, mas o dinheiro dá 90. Substitua o mesmo par nas duas equações."
  },
  {
    "id": "sistema-reparte-igual",
    "nome": "Divide o total igualmente sem motivo",
    "causa": "Confunde ter duas incógnitas com elas terem o mesmo valor.",
    "exemplo": "x + y = 12 implica x = y = 6.",
    "desmonte": "8 + 4 também dá 12. Só outra condição pode decidir a repartição."
  },
  {
    "id": "sistema-troca-par",
    "nome": "Troca a ordem do par",
    "causa": "Desliga cada posição do significado da respectiva letra.",
    "exemplo": "Troca (8,4) por (4,8) no problema dos ingressos.",
    "desmonte": "O primeiro valor é x; o segundo, y. 8 inteiras e 4 meias dão R$ 100; 4 inteiras e 8 meias dão R$ 80."
  },
  {
    "id": "sistema-diferenca-e-quantidade",
    "nome": "Trata a diferença como o total",
    "causa": "Lê quatro a mais como quatro objetos ao todo.",
    "exemplo": "x = y + 4 vira x = 4.",
    "desmonte": "Se y vale 3, x vale 7. O 4 mede quanto uma quantidade supera a outra."
  },
  {
    "id": "sistema-substitui-parte",
    "nome": "Substitui só um pedaço da expressão",
    "causa": "Apaga a incógnita da expressão que deveria entrar inteira.",
    "exemplo": "x = y + 4 e x + y = 12 viram 4 + y = 12.",
    "desmonte": "Troque x por todo y + 4: (y + 4) + y = 12. As duas expressões têm o mesmo valor."
  },
  {
    "id": "sistema-opera-um-lado",
    "nome": "Opera só de um lado",
    "causa": "Aplica uma operação que quebra a igualdade.",
    "exemplo": "2y + 4 = 12 vira 2y = 12.",
    "desmonte": "Subtraia 4 dos dois lados: 2y = 8. Depois divida ambos os lados por 2."
  },
  {
    "id": "sistema-sem-parenteses",
    "nome": "Não distribui no valor substituído",
    "causa": "Multiplica só o primeiro termo da expressão.",
    "exemplo": "2x com x = y + 4 vira 2y + 4.",
    "desmonte": "Escreva 2(y + 4). São dois grupos inteiros, então 2y + 8. Os parênteses preservam a substituição."
  },
  {
    "id": "sistema-nao-recupera",
    "nome": "Para na primeira incógnita",
    "causa": "Acha uma letra e não retorna a uma original.",
    "exemplo": "Em x = y + 4, encontra y = 3 e responde x = 3.",
    "desmonte": "Use a relação que ainda vale: x = 3 + 4 = 7. Confira as duas condições com (7,3)."
  },
  {
    "id": "sistema-sinais-na-soma",
    "nome": "Soma termos opostos como iguais",
    "causa": "Ignora o sinal de um coeficiente.",
    "exemplo": "y + (−y) = 2y.",
    "desmonte": "Um valor e seu oposto somam zero. Teste y = 3: 3 + (−3) = 0."
  },
  {
    "id": "sistema-soma-so-esquerda",
    "nome": "Não soma os lados direitos",
    "causa": "Cancela termos de letras mas esquece os totais.",
    "exemplo": "x + y = 12 e x − y = 4 viram 2x = 12.",
    "desmonte": "Some à esquerda e à direita: (x + y) + (x − y) = 12 + 4. Assim 2x = 16."
  },
  {
    "id": "sistema-soma-perde-condicao",
    "nome": "Troca o sistema por uma consequência",
    "causa": "Acha que a equação somada guarda sozinha as duas condições.",
    "exemplo": "De 2x = 16 aceita (8,0) para x + y = 12 e x − y = 4.",
    "desmonte": "(8,0) atende a 2x = 16, mas 8 + 0 não dá 12. Conserve uma original para recuperar y."
  },
  {
    "id": "sistema-volta-sinal",
    "nome": "Erra o sinal ao recuperar a incógnita",
    "causa": "Desfaz uma subtração sem verificar o resultado.",
    "exemplo": "4 − y = 1 leva a y = 5.",
    "desmonte": "Teste: 4 − 5 = −1, não 1. Subtraindo 4: −y = −3; logo y = 3."
  },
  {
    "id": "sistema-soma-vira-produto",
    "nome": "Confunde soma com produto de letras",
    "causa": "Aplica a regra de potências a termos somados.",
    "exemplo": "2x + x = 2x².",
    "desmonte": "São dois grupos de x mais um: 3x. x² aparece em x vezes x, que é uma multiplicação."
  },
  {
    "id": "sistema-cancela-mesmo-sinal",
    "nome": "Cancela coeficientes do mesmo sinal",
    "causa": "Vê números iguais e apaga sem considerar a operação.",
    "exemplo": "6y + 6y = 0.",
    "desmonte": "A soma é 12y. Para cancelar na adição, prepare 6y e −6y: números opostos somam zero."
  },
  {
    "id": "sistema-multiplica-parte",
    "nome": "Multiplica só parte da equação",
    "causa": "Aplica o fator só a uma letra e mantém os outros termos.",
    "exemplo": "−1 vezes (2x + y = 12) vira −2x + y = 12.",
    "desmonte": "O fator atua em cada termo e nos dois lados: −2x − y = −12."
  },
  {
    "id": "sistema-multiplica-zero",
    "nome": "Apaga a condição multiplicando por zero",
    "causa": "Trata multiplicar por zero como transformação reversível.",
    "exemplo": "x + 2y = 9 vira 0 = 0 e considera preservada toda a informação.",
    "desmonte": "0 = 0 aceita qualquer par. A original restringia os pares. Use fatores não nulos para manter as soluções."
  },
  {
    "id": "sistema-divisao-sinal",
    "nome": "Erra o sinal na divisão final",
    "causa": "Mantém o negativo mesmo dividindo negativo por negativo.",
    "exemplo": "−5x = −25 leva a x = −5.",
    "desmonte": "Divida os dois lados por −5: (−25)/(−5) = 5. Confira: −5 · 5 = −25."
  },
  {
    "id": "sistema-nao-divide",
    "nome": "Confunde o múltiplo com a incógnita",
    "causa": "Para antes da divisão pelo coeficiente.",
    "exemplo": "3y = 6 leva a y = 6.",
    "desmonte": "6 é o valor de três grupos de y. Cada grupo vale 6 ÷ 3 = 2."
  },
  {
    "id": "sistema-ordem-rigida",
    "nome": "Acha que só pode eliminar uma letra específica",
    "causa": "Decora uma ordem sem olhar os coeficientes.",
    "exemplo": "Diz que só pode eliminar y em qualquer sistema.",
    "desmonte": "Escolha a letra cujos coeficientes forem mais fáceis de tornar opostos. Os dois caminhos chegam ao mesmo par."
  },
  {
    "id": "sistema-grafico-uma-reta",
    "nome": "Aceita ponto de apenas uma reta",
    "causa": "Confunde pertencer a uma reta com ser ponto comum.",
    "exemplo": "Aceita (2,4) em x + y = 6 e x − y = 2.",
    "desmonte": "2 + 4 = 6, mas 2 − 4 = −2. O ponto precisa estar na interseção das duas retas."
  },
  {
    "id": "sistema-paralelas-tem-solucao",
    "nome": "Não distingue paralelas e coincidência",
    "causa": "Supõe que duas equações sempre selecionam um ponto.",
    "exemplo": "x + y = 6 e x + y = 3 teriam um par comum.",
    "desmonte": "A mesma soma não pode ter dois valores diferentes. Essas retas são paralelas distintas e não têm ponto comum."
  },
  {
    "id": "sistema-identidade-zero",
    "nome": "Lê 0 = 0 como par zero",
    "causa": "Confunde identidade com valores das incógnitas.",
    "exemplo": "x + y = 6 e 2x + 2y = 12 dariam só (0,0).",
    "desmonte": "A segunda é o dobro da primeira. Infinitos pares somam 6, como (1,5) e (2,4). (0,0) nem satisfaz a original."
  },
  {
    "id": "sistema-contradicao-par",
    "nome": "Transforma contradição em par",
    "causa": "Toma os números que restaram como valores de x e y.",
    "exemplo": "0 = 3 leva a (0,3).",
    "desmonte": "As letras já se cancelaram. Não existe número que torne 0 igual a 3; nenhuma solução satisfaz ambas."
  },
  {
    "id": "sistema-responde-outra",
    "nome": "Responde a incógnita que não foi pedida",
    "causa": "Dá o primeiro valor encontrado sem ligar a letra à pergunta.",
    "exemplo": "Acha 4 bilhetes de metrô e responde 4 bilhetes de ônibus.",
    "desmonte": "Volte a x + y = 10: x = 6. Rotule cada letra e releia a pergunta antes de responder."
  },
  {
    "id": "sistema-arredonda-contagem",
    "nome": "Arredonda uma contagem incompatível",
    "causa": "Força um par inteiro alterando os totais do enunciado.",
    "exemplo": "10 bilhetes de 4 e 6 reais por R$ 49 dão 4,5 bilhetes de metrô.",
    "desmonte": "Bilhetes inteiros não podem ter essa quantidade. Arredondar muda o gasto; os dados não permitem a compra descrita."
  },
  {
    "id": "sistema-fracao-proibida",
    "nome": "Rejeita frações em todo sistema",
    "causa": "Generaliza a restrição de contagem a medidas.",
    "exemplo": "Rejeita 1,5 m de tecido por não ser inteiro.",
    "desmonte": "Comprimentos podem ter frações. O contexto determina as restrições; depois confira as equações."
  },
  {
    id: 'sistema-identidade-sem-solucao', nome: 'Confunde identidade com impossibilidade',
    causa: 'Ao cancelar todas as letras, pensa que nenhum par restou.',
    exemplo: 'x + y = 6 e 2x + 2y = 12 levam a 0 = 0 e diz nenhuma solução.',
    desmonte: '0 = 0 é verdadeiro. As equações repetem a mesma condição: infinitos pares somam 6, como (1,5) e (2,4).',
  }, {
    id: 'sistema-direcoes-diferentes', nome: 'Não reconhece o encontro de retas',
    causa: 'Classifica o sistema sem combinar as duas condições.',
    exemplo: 'x + y = 6 e x − y = 2 seriam paralelas ou coincidentes.',
    desmonte: 'Somando, x = 4; voltando, y = 2. Só esse par atende às duas: as retas têm um único ponto comum.',
  }, {
    id: 'sistema-paralelas-coincidentes', nome: 'Confunde paralelas distintas com a mesma reta',
    causa: 'Olha só os coeficientes de x e y e ignora o total.',
    exemplo: 'x + y = 6 e 2x + 2y = 15 teriam infinitas soluções.',
    desmonte: 'O dobro da primeira dá total 12, não 15. Subtraindo, sobra 0 = 3: as retas são distintas e não têm ponto comum.',
  },
]
