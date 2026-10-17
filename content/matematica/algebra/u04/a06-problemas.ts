import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U4.A6",
  "titulo": "Problemas com duas incógnitas",
  "objetivo": "Definir incógnitas com unidades, modelar duas condições, escolher um método e verificar se o par atende ao contexto e à pergunta.",
  "modelo": "livre",
  "esboco": "Bilhetes de ônibus e metrô levam a quantidade e gasto. O método nasce dos coeficientes; a conferência retorna à situação, incluindo valores inteiros não negativos.",
  "vega": "Uma pessoa comprou 10 bilhetes: ônibus a 4 reais e metrô a 6 reais, pagando 48 reais. x conta ônibus, y conta metrô. x+y=10 e 4x+6y=48. Subtraia quatro vezes a primeira da segunda: 2y=8, y=4 e x=6. Dinheiro não é quantidade: preserve unidades. A resposta pedida é ônibus, então é 6, não o primeiro resultado encontrado. Para objetos inteiros, par fracionário pode resolver o modelo mas não a situação: 10 bilhetes por 49 reais daria y=4,5. Não rejeite frações em qualquer contexto: medidas podem ser fracionárias. Preços e quantidades não podem ser negativos neste problema. A prática inclui entrada de cinema e compra de material, além de detectar dados impossíveis. Feche com a ponte para inequações: o que muda ao trocar total exato por limite de gasto.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Você comprou **10 bilhetes**: ônibus a R$ 4 e metrô a R$ 6. Pagou **R$ 48**. Quantos eram de ônibus?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                1,
                10
              ],
              [
                4,
                6,
                48
              ]
            ],
            "rotulos": [
              "Bilhetes",
              "Reais"
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "esboco": "Problema completo antes do método. A pergunta pede a primeira incógnita, não a mais fácil de achar."
    },
    {
      "tipo": "aposta",
      "pergunta": "x conta ônibus e y conta metrô. Qual equação representa o gasto?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x+y=10"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "$4x+6y=48$",
          "explica": "Cada quantidade é multiplicada pelo preço do seu bilhete.",
          "certa": true
        },
        {
          "texto": "$x+y=48$",
          "explica": "x + y conta bilhetes, não reais. São 10 bilhetes.",
          "erro": "sistema-unidades"
        }
      ],
      "esboco": "As unidades justificam os coeficientes."
    },
    {
      "tipo": "mexa",
      "texto": "Antes da conta, teste um par. Ele precisa acertar a compra e o gasto.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                1,
                10
              ],
              [
                4,
                6,
                48
              ]
            ],
            "pares": [
              [
                5,
                5
              ],
              [
                6,
                4
              ],
              [
                4,
                6
              ],
              [
                8,
                2
              ]
            ],
            "rotulos": [
              "10 bilhetes",
              "R$ 48"
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Confira cada total nas duas linhas.",
        "sucesso": {
          "sistema": [
            6,
            4
          ]
        },
        "mostre": "6 de ônibus e 4 de metrô: 10 bilhetes e R$ 48."
      },
      "descoberta": "A conferência vai voltar ao final da resolução.",
      "esboco": "O par é explorado e depois reconstruído pelo método."
    },
    {
      "tipo": "aposta",
      "pergunta": "Para eliminar x, multiplique $x+y=10$ por −4 e some à segunda. O que sobra?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "-4x-4y=-40",
            "4x+6y=48"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "$2y=8$",
          "explica": "−4x + 4x zera, −4y + 6y dá 2y e −40 + 48 dá 8.",
          "certa": true
        },
        {
          "texto": "$2y=48$",
          "explica": "O total −40 também entra na soma: −40 + 48 = 8.",
          "erro": "sistema-soma-so-esquerda"
        }
      ],
      "esboco": "Escolha do método vem da estrutura dos coeficientes."
    },
    {
      "tipo": "ideia",
      "texto": "A conta encontrou **y = 4**, os bilhetes de metrô. Ainda falta responder quantos eram de **ônibus**.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2y=8",
            "y=4",
            "x+4=10"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "esboco": "A primeira incógnita encontrada não é necessariamente a resposta pedida."
    },
    {
      "tipo": "aposta",
      "pergunta": "Qual é a resposta à pergunta inicial?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x+4=10"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "6 bilhetes de ônibus",
          "explica": "x = 10 − 4 = 6. São 6 · 4 + 4 · 6 = 48 reais.",
          "certa": true
        },
        {
          "texto": "4 bilhetes de ônibus",
          "explica": "4 é o valor de y, a quantidade de metrô.",
          "erro": "sistema-responde-outra"
        }
      ],
      "esboco": "A resposta inclui a grandeza solicitada."
    },
    {
      "tipo": "anote",
      "titulo": "Modelar e conferir",
      "definicao": "Defina o significado das letras. Escreva uma condição por equação. Resolva e confira o par e suas unidades.",
      "exemplo": {
        "tex": "\\begin{gathered}x+y=10\\\\4x+6y=48\\\\(x,y)=(6,4)\\end{gathered}",
        "fala": "x ônibus e y metrô: seis e quatro satisfazem quantidade e gasto."
      },
      "alerta": "Quantidades de bilhetes devem ser inteiras e não negativas. Medidas podem aceitar frações.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "E se os mesmos 10 bilhetes tivessem custado **R$ 49**?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x+y=10",
            "4x+6y=49"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "passos": [
        {
          "pergunta": "Eliminando x, quanto vale y?",
          "opcoes": [
            {
              "texto": "$4{,}5$",
              "explica": "2y = 9: divida ambos os lados por 2.",
              "certa": true
            },
            {
              "texto": "$4$",
              "explica": "4 seria arredondamento. A equação exige 2y = 9.",
              "erro": "sistema-arredonda-contagem"
            }
          ],
          "linha": {
            "tex": "2y=9\\Rightarrow y=4{,}5",
            "fala": "y vale quatro e meio."
          }
        },
        {
          "pergunta": "Esse resultado serve para a compra de bilhetes inteiros?",
          "opcoes": [
            {
              "texto": "Não: os dados não permitem essa compra",
              "explica": "x = 5,5 e y = 4,5 resolvem as equações, mas não contam bilhetes inteiros.",
              "certa": true
            },
            {
              "texto": "Sim: basta arredondar",
              "explica": "Arredondar mudaria os totais. As duas condições deixariam de valer juntas.",
              "erro": "sistema-arredonda-contagem"
            }
          ],
          "linha": {
            "tex": "4\\cdot5{,}5+6\\cdot4{,}5=49",
            "fala": "O par fracionário confere na álgebra, mas não no contexto."
          }
        }
      ],
      "esboco": "Distingue a solução real do modelo e uma solução aceitável no contexto."
    },
    {
      "tipo": "aposta",
      "pergunta": "Um sistema deu 1,5 m de um tecido e 2,5 m de outro. A fração torna a resposta impossível?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x=1{,}5\\text{ m}",
            "y=2{,}5\\text{ m}"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "Não: comprimentos podem ter frações",
          "explica": "O contexto decide os valores permitidos. Confira os dois totais.",
          "certa": true
        },
        {
          "texto": "Sim: sistema só aceita inteiros",
          "explica": "Soluções de sistemas podem ser fracionárias. Bilhetes inteiros é que exigiam contagem inteira.",
          "erro": "sistema-fracao-proibida"
        }
      ],
      "esboco": "Não generaliza uma restrição de contagem para todas as situações."
    },
    {
      "tipo": "caderno",
      "instrucao": "Foram comprados 8 itens: cadernos de R$ 7 e canetas de R$ 2, por R$ 36. Quantos **cadernos**?",
      "resposta": 4,
      "sinal": true,
      "resolucao": [
        {
          "tex": "x+y=8,\\quad7x+2y=36",
          "fala": "x conta cadernos e y conta canetas."
        },
        {
          "tex": "-2x-2y=-16",
          "fala": "Multiplique a equação da quantidade por menos dois."
        },
        {
          "tex": "5x=20\\Rightarrow x=4",
          "fala": "Somando, x vale quatro."
        },
        {
          "tex": "y=4,\\quad7\\cdot4+2\\cdot4=36",
          "fala": "Quatro cadernos e quatro canetas custam trinta e seis reais."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "sistema-problemas-n1",
        "sistema-problemas-n2",
        "sistema-problemas-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Eram **6 bilhetes de ônibus**. Você modelou, resolveu e conferiu. A seguir: e quando há um **limite**, em vez de total exato?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "6+4=10",
            "4\\cdot6+6\\cdot4=48"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
