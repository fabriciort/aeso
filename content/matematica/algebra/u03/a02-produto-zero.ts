import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U3.A2",
  "titulo": "Produto igual a zero",
  "objetivo": "Resolver equações fatoradas pelo produto nulo, entendendo por que basta um fator zerar e por que a regra exige produto igual a zero.",
  "modelo": "livre",
  "esboco": "O produto é testado com números positivos, negativos e zero. Cada raiz acende um fator diferente. Uma soma e um produto não nulo confrontam a regra.",
  "vega": "Em números reais, ab = 0 implica a = 0 ou b = 0; os dois podem zerar, mas não precisam. Não aplique a regra a uma soma nem a ab = 6. O visual usa (x − p)(x − q), fatores numéricos com sinal, não lados físicos. No exemplo, x = 2 zera o primeiro fator, e x = −3 zera o segundo. Guie para conferir o produto completo. Em 2x − 6 = 0 é preciso dividir por 2.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Uma área é lado vezes lado. Se o produto é **zero**, o que você pode dizer dos fatores?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "produtoZero": {
            "raizes": [
              2,
              -3
            ],
            "valores": [
              -4,
              -3,
              -1,
              0,
              1,
              2,
              3
            ]
          }
        },
        "esboco": "Valores de x para testar; os dois fatores e o produto em três colunas."
      },
      "esboco": "Parte da multiplicação conhecida, depois avisa que os fatores também podem ser negativos."
    },
    {
      "tipo": "mexa",
      "texto": "Aqui os fatores são números, inclusive negativos. Quais valores de x zeram o produto?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "produtoZero": {
            "raizes": [
              2,
              -3
            ],
            "valores": [
              -4,
              -3,
              -1,
              0,
              1,
              2,
              3
            ]
          }
        },
        "esboco": "Valores de x para testar; os dois fatores e o produto em três colunas."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Teste valores até encontrar todas as raízes.",
        "sucesso": {
          "zerado": true
        },
        "mostre": "Em x = 2 e x = −3, um fator vale zero."
      },
      "descoberta": "O produto zera quando pelo menos um fator zera.",
      "esboco": "O aluno compara os dois fatores com o produto, sem receber as raízes de antemão."
    },
    {
      "tipo": "aposta",
      "pergunta": "Com $x = 2$, o produto é $0 \\cdot 5$. Os **dois** fatores precisam ser zero?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "produtoZero": {
            "raizes": [
              2,
              -3
            ],
            "valores": [
              -4,
              -3,
              -1,
              0,
              1,
              2,
              3
            ],
            "x": 2
          }
        },
        "esboco": "Valores de x para testar; os dois fatores e o produto em três colunas."
      },
      "opcoes": [
        {
          "texto": "Não. Um fator zero basta",
          "explica": "0 · 5 = 0. Com x = −3, o outro fator é que zera.",
          "certa": true
        },
        {
          "texto": "Sim, os dois precisam zerar",
          "explica": "O exemplo já mostra 0 · 5 = 0: o 5 não precisa ser zero.",
          "erro": "produto-zero-exige-dois"
        }
      ],
      "esboco": "Transforma a descoberta em explicação."
    },
    {
      "tipo": "anote",
      "titulo": "Produto nulo",
      "definicao": "Um produto de dois números reais é zero quando pelo menos um dos fatores é zero.",
      "exemplo": {
        "tex": "\\begin{gathered}(x-2)(x+3)=0\\\\x=2\\text{ ou }x=-3\\end{gathered}",
        "fala": "x menos dois vezes x mais três igual a zero: x vale dois ou menos três."
      },
      "alerta": "É preciso ter **multiplicação** e resultado **zero**.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em $(x - 2) + (x + 2) = 0$, cada parcela precisa zerar?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "(x − 2) + (x + 2) = 0",
            "x = 0 → −2 + 2 = 0"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x = 0 → −2 + 2 = 0"
      },
      "opcoes": [
        {
          "texto": "Não: parcelas podem se cancelar",
          "explica": "−2 + 2 = 0, mesmo sem nenhuma parcela ser zero.",
          "certa": true
        },
        {
          "texto": "Sim: x = 2 ou x = −2",
          "explica": "Troque x por 2: 0 + 4 não dá zero. A regra era de produto.",
          "erro": "produto-zero-aplicado-a-soma"
        }
      ],
      "esboco": "Contraexemplo da soma antes de praticar a regra."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em $(x - 2)(x + 3) = 6$, podemos igualar cada fator a zero?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "(x − 2)(x + 3) = 6"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (x − 2)(x + 3) = 6"
      },
      "opcoes": [
        {
          "texto": "Não: o produto não é zero",
          "explica": "Um fator zero faria o produto valer 0, e precisamos de 6.",
          "certa": true
        },
        {
          "texto": "Sim: basta abrir os parênteses",
          "explica": "As raízes 2 e −3 dão produto 0, não 6.",
          "erro": "produto-nulo-sem-zero"
        }
      ],
      "esboco": "Delimita a regra: ela não resolve todo produto."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $(2x - 6)(x + 1) = 0$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "(2x − 6)(x + 1) = 0"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (2x − 6)(x + 1) = 0"
      },
      "passos": [
        {
          "pergunta": "Quais equações precisamos resolver?",
          "opcoes": [
            {
              "texto": "$2x - 6 = 0$ ou $x + 1 = 0$",
              "explica": "Basta um fator zerar.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "2x − 6 = 0 ou x + 1 = 0"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: 2x − 6 = 0 ou x + 1 = 0"
              }
            },
            {
              "texto": "$2x - 6 = 0$ e $x + 1 = 0$ ao mesmo tempo",
              "explica": "Cada raiz pode zerar um fator diferente.",
              "erro": "produto-zero-exige-dois"
            }
          ],
          "linha": {
            "tex": "2x - 6 = 0 \\text{ ou } x + 1 = 0",
            "fala": "Dois x menos seis igual a zero ou x mais um igual a zero."
          }
        },
        {
          "pergunta": "Quais valores zeram os fatores?",
          "opcoes": [
            {
              "texto": "$3$ e $-1$",
              "explica": "2 · 3 − 6 = 0, e −1 + 1 = 0.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x = 3 ou x = −1"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: x = 3 ou x = −1"
              }
            },
            {
              "texto": "$6$ e $-1$",
              "explica": "No primeiro fator, 2x = 6 pede x = 3.",
              "erro": "equacao-fator-esquece-coeficiente"
            }
          ],
          "linha": {
            "tex": "x=3 \\text{ ou } x=-1",
            "fala": "Três ou menos um."
          }
        }
      ],
      "esboco": "O passo a passo retoma uma equação do primeiro grau em cada ramo."
    },
    {
      "tipo": "caderno",
      "instrucao": "Resolva $(x + 4)(x - 7) = 0$. Digite a **menor** raiz.",
      "resposta": -4,
      "sinal": true,
      "resolucao": [
        {
          "tex": "x+4=0 \\text{ ou } x-7=0",
          "fala": "Um dos fatores é zero."
        },
        {
          "tex": "x=-4 \\text{ ou } x=7",
          "fala": "Menos quatro ou sete."
        },
        {
          "tex": "(-4+4)(-4-7)=0",
          "fala": "Zero vezes menos onze é zero."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "segundo-produto-n1",
        "segundo-produto-n2",
        "segundo-produto-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Se o produto é zero, pelo menos um fator zerou. Na próxima aula, vamos transformar uma soma em produto.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "produtoZero": {
            "raizes": [
              2,
              -3
            ],
            "valores": [
              -4,
              -3,
              -1,
              0,
              1,
              2,
              3
            ],
            "x": 2
          }
        },
        "esboco": "Valores de x para testar; os dois fatores e o produto em três colunas."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
