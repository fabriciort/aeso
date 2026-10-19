import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U5.A3",
  "titulo": "Quando o sinal se inverte",
  "objetivo": "Explicar a inversão da ordem ao multiplicar ou dividir por negativo e distinguir essa operação de somar ou subtrair um negativo.",
  "modelo": "reta",
  "esboco": "Da situação às tentativas na reta, depois à escrita simbólica, com perguntas que explicam cada transformação e seus limites.",
  "vega": "Na reta, 2<5. Multiplicar ambos por −1 reflete os pontos no zero: −2>−5. Um fator negativo combina reflexão com escala; positivo só escala. Em −2x<6, dividir ambos por −2 exige x>−3. Somar −2 dos dois lados é deslocar, não refletir: não inverte. Não ensinar troca de sinal porque passou de lado. Divisão por zero não existe. Incluir teste da fronteira e um valor interno na original. Desigualdade estrita continua estrita; ≥ vira ≤ ao dividir por negativo.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Na reta, $2<5$. Se você multiplicar os dois números por −1, qual fica maior?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "espelho": {
            "par": [
              2,
              5
            ],
            "fatores": [
              1,
              -1,
              2,
              -2
            ]
          }
        },
        "esboco": "O desenho acompanha a pergunta com valores exatos, sem antecipar a conclusão."
      },
      "esboco": "A situação abre uma pergunta real antes de apresentar a regra."
    },
    {
      "tipo": "aposta",
      "pergunta": "Compare −2 e −5 na reta:",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -7,
            "ate": 2,
            "intervalos": [
              {
                "de": -5,
                "ate": -2,
                "incluiDe": true,
                "incluiAte": true
              }
            ]
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "$-2>-5$",
          "explica": "−2 fica à direita de −5.",
          "certa": true
        },
        {
          "texto": "$-2<-5$",
          "explica": "Entre negativos, estar mais longe do zero à esquerda torna o número menor.",
          "erro": "inequacao-sentido-trocado"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "mexa",
      "texto": "Multiplique os dois valores. O que acontece com a ordem quando o fator é negativo?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "espelho": {
            "par": [
              2,
              5
            ],
            "fatores": [
              1,
              -1,
              2,
              -2
            ]
          }
        },
        "esboco": "O desenho acompanha a pergunta com valores exatos, sem antecipar a conclusão."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Experimente cada fator e compare os pontos.",
        "sucesso": {
          "ordemVista": true
        },
        "mostre": "Os quatro fatores são testados; com −1 e −2, a ordem se inverte."
      },
      "descoberta": "O fator negativo reflete a reta: o número que estava à direita vai para a esquerda.",
      "esboco": "Dois pontos mantêm sua identidade; fatores positivos escalam e negativos refletem, com comparação exata ao lado."
    },
    {
      "tipo": "aposta",
      "pergunta": "Para manter verdadeira a comparação após multiplicar por negativo, precisamos:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2<5",
            "-4\\;?\\;-10"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Inverter < para >",
          "explica": "−4 é maior que −10. O desenho mostra a ordem invertida.",
          "certa": true
        },
        {
          "texto": "Manter <",
          "explica": "−4 < −10 é falso. A reflexão trocou os lados dos pontos.",
          "erro": "ineq-nao-inverte-negativo"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "ideia",
      "texto": "Multiplicar por negativo **reflete a reta**. Dividir por negativo faz o mesmo tipo de inversão.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2<5",
            "-2>-5"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A frase conecta a descoberta visual ao próximo raciocínio, sem repetir uma definição."
    },
    {
      "tipo": "aposta",
      "pergunta": "E somar −2 aos dois lados de $2<5$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2+(-2)<5+(-2)",
            "0<3"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Mantém a ordem",
          "explica": "Os dois pontos só se deslocam duas unidades à esquerda.",
          "certa": true
        },
        {
          "texto": "Também inverte",
          "explica": "Aqui há uma soma, não uma multiplicação por negativo.",
          "erro": "ineq-inverte-na-soma"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "anote",
      "titulo": "Fator negativo",
      "definicao": "Ao multiplicar ou dividir os dois lados por um número negativo, inverta o sentido da desigualdade.",
      "exemplo": {
        "tex": "\\begin{gathered}-2x<6\\\\x>-3\\end{gathered}",
        "fala": "Menos dois x é menor que seis. Dividindo por menos dois, x é maior que menos três."
      },
      "alerta": "Inverta na multiplicação ou divisão por negativo. Somar ou subtrair mantém a ordem. Não divida por zero.",
      "esboco": "O caderno reúne a definição, um exemplo exato e o cuidado que evita o erro central."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $-3x+2\\ge11$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "-3x+2\\ge11"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "passos": [
        {
          "pergunta": "Subtraia 2 dos dois lados. Qual sinal fica?",
          "opcoes": [
            {
              "texto": "$-3x\\ge9$",
              "explica": "A subtração mantém a ordem.",
              "certa": true
            },
            {
              "texto": "$-3x\\le9$",
              "explica": "Subtrair 2 não reflete a reta.",
              "erro": "ineq-inverte-na-soma"
            }
          ],
          "linha": {
            "tex": "-3x\\ge9",
            "fala": "Menos três x é maior ou igual a nove."
          }
        },
        {
          "pergunta": "Divida por −3. O que resulta?",
          "opcoes": [
            {
              "texto": "$x\\le-3$",
              "explica": "O divisor negativo inverte ≥ para ≤.",
              "certa": true
            },
            {
              "texto": "$x\\ge-3$",
              "explica": "Teste x = 0: 2 ≥ 11 é falso. Esse lado da reta não serve.",
              "erro": "ineq-nao-inverte-negativo"
            }
          ],
          "linha": {
            "tex": "x\\le-3",
            "fala": "x é menor ou igual a menos três."
          }
        }
      ],
      "esboco": "O aluno decide cada etapa. A conta escrita mostra a operação e preserva o conjunto de soluções."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em $x\\le-3$, a borda −3 entra?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -7,
            "ate": 1,
            "intervalos": [
              {
                "de": null,
                "ate": -3,
                "incluiDe": false,
                "incluiAte": true
              }
            ]
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "Sim: a igualdade continua permitida",
          "explica": "Na original: −3 · (−3) + 2 = 11.",
          "certa": true
        },
        {
          "texto": "Não: inverter também tira a igualdade",
          "explica": "≥ vira ≤. O traço de igualdade permanece.",
          "erro": "ineq-exclui-igualdade"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "caderno",
      "instrucao": "Resolva $-2x+1>7$. Digite o **maior inteiro** que serve.",
      "resposta": -4,
      "sinal": true,
      "resolucao": [
        {
          "tex": "-2x>6",
          "fala": "Subtraia um dos dois lados."
        },
        {
          "tex": "x<-3",
          "fala": "Divida por menos dois e inverta a desigualdade."
        },
        {
          "tex": "-2(-3)+1=7",
          "fala": "Menos três empata e não entra."
        },
        {
          "tex": "-2(-4)+1=9>7",
          "fala": "O maior inteiro permitido é menos quatro."
        }
      ],
      "esboco": "Resolva no papel; digite apenas o número pedido e confira as etapas e as bordas."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "inequacao-negativo-n1",
        "inequacao-negativo-n2",
        "inequacao-negativo-n3"
      ],
      "esboco": "Três níveis: visual e valores amigáveis, caso que pega e resolução independente sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Depois de multiplicar por −1, **−2 > −5**. O sinal acompanha a ordem que a reta mostra.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2<5",
            "-2>-5"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "Responde à pergunta inicial e abre o próximo conceito."
    }
  ]
}
