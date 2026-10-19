import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U4.A4",
  "titulo": "Preparar a eliminação",
  "objetivo": "Multiplicar equações inteiras por números não nulos para formar coeficientes opostos, escolher a incógnita a eliminar e resolver o par.",
  "modelo": "livre",
  "esboco": "As duas equações têm coeficientes de mesmo sinal. Multiplicar a primeira por 2 e a segunda por −1 prepara +2x e −2x.",
  "vega": "No sistema x+2y=9 e 2x+y=12, a soma direta não elimina nada. Duplique a primeira e multiplique a segunda por −1: 2x+4y=18 e −2x−y=−12. Somando, 3y=6, então y=2 e x=5. Todo termo e o lado direito recebem o fator. Multiplicar por número não nulo mantém as soluções; por zero apagaria a informação. Pode-se eliminar y em vez de x, mantendo uma original para recuperar a outra incógnita. Exemplo posterior 2x+3y=16 e 3x+2y=19 usa fatores 2 e −3: −5x=−25, x=5, y=2. Não introduzir determinantes como receita.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Em $x+2y=9$ e $2x+y=12$, somar direto não cancela nenhuma letra. Como preparar a soma?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                2,
                9
              ],
              [
                2,
                1,
                12
              ]
            ],
            "modo": "somar",
            "fatores": [
              2,
              -1
            ],
            "etapa": 0
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "esboco": "Aparecem as duas linhas originais e os fatores, antes de aplicá-los."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se somarmos as linhas originais, o que sobra?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x+2y=9",
            "2x+y=12"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "$3x+3y=21$",
          "explica": "Nenhum coeficiente zera: ainda há duas incógnitas.",
          "certa": true
        },
        {
          "texto": "$3y=21$",
          "explica": "x + 2x é 3x, não zero. Precisamos de coeficientes opostos.",
          "erro": "sistema-cancela-mesmo-sinal"
        }
      ],
      "esboco": "Mostra por que preparar é necessário."
    },
    {
      "tipo": "mexa",
      "texto": "Faça os coeficientes de x ficarem opostos. Multiplique as linhas e só depois some.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                2,
                9
              ],
              [
                2,
                1,
                12
              ]
            ],
            "modo": "somar",
            "fatores": [
              2,
              -1
            ],
            "etapa": 0
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Toque para multiplicar; depois, para somar.",
        "sucesso": {
          "somado": true
        },
        "mostre": "A primeira linha dobra; a segunda troca todos os sinais."
      },
      "descoberta": "2x e −2x se cancelam. Sobram 3y = 6.",
      "esboco": "O aluno vê cada equação inteira transformada antes da eliminação."
    },
    {
      "tipo": "aposta",
      "pergunta": "Ao multiplicar $2x+y=12$ por −1, o que resulta?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(-1)(2x+y)=(-1)12"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "$-2x-y=-12$",
          "explica": "Cada termo e o outro lado recebem o fator −1.",
          "certa": true
        },
        {
          "texto": "$-2x+y=12$",
          "explica": "O −1 também multiplica y e 12.",
          "erro": "sistema-multiplica-parte"
        }
      ],
      "esboco": "Negativo atua sobre a linha inteira."
    },
    {
      "tipo": "ideia",
      "texto": "Multiplicar **os dois lados** por um número não nulo mantém as soluções e pode preparar o cancelamento.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                2,
                9
              ],
              [
                2,
                1,
                12
              ]
            ],
            "modo": "somar",
            "fatores": [
              2,
              -1
            ],
            "etapa": 1
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "esboco": "As linhas equivalentes continuam descrevendo o mesmo par comum."
    },
    {
      "tipo": "aposta",
      "pergunta": "Por que não multiplicar uma linha por zero?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "0(x+2y)=0\\cdot9",
            "0=0"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "A condição desapareceria",
          "explica": "0 = 0 vale para qualquer par; perdemos a informação x + 2y = 9.",
          "certa": true
        },
        {
          "texto": "Porque zero nunca pode aparecer",
          "explica": "Zero pode aparecer. O problema é apagar a condição ao multiplicar por ele.",
          "erro": "sistema-multiplica-zero"
        }
      ],
      "esboco": "Justifica a exigência de fator não nulo."
    },
    {
      "tipo": "anote",
      "titulo": "Preparar a adição",
      "definicao": "Multiplique equações inteiras por fatores não nulos para criar coeficientes opostos. Depois some e resolva.",
      "exemplo": {
        "tex": "\\begin{gathered}2x+4y=18\\\\-2x-y=-12\\\\3y=6\\Rightarrow y=2\\end{gathered}",
        "fala": "Primeira linha vezes dois, segunda vezes menos um: três y é seis."
      },
      "alerta": "O fator multiplica cada termo, inclusive o lado direito. Conserve uma original para recuperar x.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $2x+3y=16$ e $3x+2y=19$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                2,
                3,
                16
              ],
              [
                3,
                2,
                19
              ]
            ],
            "modo": "somar",
            "fatores": [
              2,
              -3
            ],
            "etapa": 0
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "passos": [
        {
          "pergunta": "Para eliminar y, multiplique as linhas por:",
          "opcoes": [
            {
              "texto": "2 e −3",
              "explica": "Os coeficientes de y ficam +6 e −6.",
              "certa": true
            },
            {
              "texto": "2 e 3",
              "explica": "Isso dá +6y e +6y; a soma não cancela.",
              "erro": "sistema-cancela-mesmo-sinal"
            }
          ],
          "linha": {
            "tex": "4x+6y=32,\\quad-9x-6y=-57",
            "fala": "Quatro x mais seis y é trinta e dois; menos nove x menos seis y é menos cinquenta e sete."
          }
        },
        {
          "pergunta": "Somando, quanto vale x?",
          "opcoes": [
            {
              "texto": "$5$",
              "explica": "−5x = −25: divida ambos os lados por −5.",
              "certa": true
            },
            {
              "texto": "$-5$",
              "explica": "Negativo dividido por negativo dá positivo.",
              "erro": "sistema-divisao-sinal"
            }
          ],
          "linha": {
            "tex": "-5x=-25\\Rightarrow x=5",
            "fala": "Menos cinco x é menos vinte e cinco: x é cinco."
          }
        },
        {
          "pergunta": "Volte a $2x+3y=16$. Quanto vale y?",
          "opcoes": [
            {
              "texto": "$2$",
              "explica": "10 + 3y = 16; 3y = 6; y = 2.",
              "certa": true
            },
            {
              "texto": "$6$",
              "explica": "6 é o valor de 3y. Ainda falta dividir por 3.",
              "erro": "sistema-nao-divide"
            }
          ],
          "linha": {
            "tex": "y=2",
            "fala": "y vale dois."
          }
        }
      ],
      "esboco": "Fatores diferentes nas duas linhas, soma negativa e recuperação do par."
    },
    {
      "tipo": "aposta",
      "pergunta": "Podemos escolher eliminar x em vez de y?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2x+3y=16",
            "3x+2y=19"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "Sim: use fatores 3 e −2",
          "explica": "Ficam +6x e −6x. A soma dá 5y = 10 e chega ao mesmo par.",
          "certa": true
        },
        {
          "texto": "Não: sempre é preciso eliminar y",
          "explica": "Podemos eliminar qualquer uma das incógnitas, se os coeficientes forem preparados.",
          "erro": "sistema-ordem-rigida"
        }
      ],
      "esboco": "Escolha estratégica sem impor uma receita única."
    },
    {
      "tipo": "caderno",
      "instrucao": "Resolva $x+2y=9$ e $2x+y=12$. Digite **x**.",
      "resposta": 5,
      "sinal": true,
      "resolucao": [
        {
          "tex": "2x+4y=18",
          "fala": "Multiplique a primeira por dois."
        },
        {
          "tex": "-2x-y=-12",
          "fala": "Multiplique a segunda por menos um."
        },
        {
          "tex": "3y=6\\Rightarrow y=2",
          "fala": "Some: y vale dois."
        },
        {
          "tex": "x+4=9\\Rightarrow x=5",
          "fala": "Volte à primeira original."
        },
        {
          "tex": "5+4=9\\quad\\text{e}\\quad10+2=12",
          "fala": "Os dois totais conferem."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "sistema-preparar-n1",
        "sistema-preparar-n2",
        "sistema-preparar-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "O par é **(5, 2)**. Preparar os coeficientes cria o cancelamento. A próxima aula vai mostrar o mesmo par no plano.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                2,
                9
              ],
              [
                2,
                1,
                12
              ]
            ],
            "par": [
              5,
              2
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
