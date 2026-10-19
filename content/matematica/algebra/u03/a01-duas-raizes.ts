import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U3.A1",
  "titulo": "As raízes de x² = k",
  "objetivo": "Resolver x² = k e quadrados deslocados, distinguir a raiz quadrada principal das soluções da equação e contar raízes para k positivo, zero e negativo.",
  "modelo": "reta",
  "esboco": "Do piso quadrado de 25 m² à equação: −5 e 5 dão o mesmo quadrado. A reta separa as duas soluções. O deslocamento vem depois.",
  "vega": "Raiz da equação é um número que faz a igualdade valer. Em x² = k, há duas raízes reais se k > 0, uma se k = 0 e nenhuma se k < 0. √25 é 5, nunca ±5; x² = 25 aceita −5 e 5. Um comprimento físico é positivo. Em (x − 1)² = 16, resolva x − 1 = 4 OU x − 1 = −4 antes de somar 1. Pergunte: ao elevar sua resposta ao quadrado, volta ao número pedido? Não antecipe números complexos.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Um piso quadrado tem **25 m²**. Seu lado mede 5 m. Mas só o 5 resolve $x^2 = 25$?",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "base": [
            "?"
          ],
          "altura": [
            "?"
          ],
          "areas": [
            [
              "25 m²"
            ]
          ]
        },
        "esboco": "Retângulo com cada área escrita e os lados separados em partes."
      },
      "esboco": "A área é conhecida; o lado físico é positivo. A pergunta abre espaço para a equação aceitar mais números."
    },
    {
      "tipo": "aposta",
      "pergunta": "Quanto dá $(-5)^2$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x² = 25",
            "(−5) · (−5) = ?"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (−5) · (−5) = ?"
      },
      "opcoes": [
        {
          "texto": "$25$",
          "explica": "Dois fatores negativos dão um produto positivo.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "expressao": [
                "(−5) · (−5) = 25"
              ]
            },
            "esboco": "A conta em linhas, com a última etapa em destaque: (−5) · (−5) = 25"
          }
        },
        {
          "texto": "$-25$",
          "explica": "O menos está dentro dos parênteses: (−5) · (−5) dá +25.",
          "erro": "sinais-iguais-da-negativo",
          "mostra": {
            "modelo": "livre",
            "estado": {
              "expressao": [
                "(−5) · (−5) = 25"
              ]
            },
            "esboco": "A conta em linhas, com a última etapa em destaque: (−5) · (−5) = 25"
          }
        }
      ],
      "esboco": "O negativo surge antes da regra do mais ou menos.",
      "fala": "Quanto dá menos cinco, entre parênteses, ao quadrado?"
    },
    {
      "tipo": "mexa",
      "texto": "Tanto $-5$ quanto $5$ têm quadrado 25. Marque os dois na reta.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "de": -6,
          "ate": 6,
          "passo": 1,
          "sinais": true,
          "etiquetas": [
            -5,
            5
          ]
        },
        "esboco": "Duas etiquetas soltas: −5 e 5, à mesma distância do zero."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Toque na reta para colocar cada etiqueta.",
        "sucesso": {
          "posicoes": [
            -5,
            5
          ]
        },
        "mostre": "As etiquetas vão para −5 e 5."
      },
      "descoberta": "Os dois valores são opostos; o quadrado é o mesmo.",
      "esboco": "A reta dá lugar às duas respostas, sem transformar −5 em comprimento."
    },
    {
      "tipo": "ideia",
      "texto": "Uma **raiz da equação** é um número que faz a igualdade valer. Aqui, $-5$ e $5$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "5² = 25",
            "(−5)² = 25"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (−5)² = 25"
      },
      "esboco": "Nomeia o que o aluno acabou de testar."
    },
    {
      "tipo": "aposta",
      "pergunta": "A calculadora mostra $\\sqrt{25} = 5$. Ela esqueceu o −5?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "√25 = 5",
            "x² = 25 → x = −5 ou x = 5"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x² = 25 → x = −5 ou x = 5"
      },
      "opcoes": [
        {
          "texto": "Não: são perguntas diferentes",
          "explica": "√25 pede a raiz não negativa. A equação pede todos os números cujo quadrado é 25.",
          "certa": true
        },
        {
          "texto": "Sim: √25 deveria ser ±5",
          "explica": "O símbolo √ escolhe a raiz não negativa. O ± aparece ao resolver a equação.",
          "erro": "raiz-equacao-confunde-radical"
        }
      ],
      "esboco": "Distingue radical e conjunto de soluções."
    },
    {
      "tipo": "anote",
      "titulo": "Resolver um quadrado",
      "definicao": "Se $k > 0$, $x^2 = k$ tem duas raízes reais: $x = \\sqrt{k}$ ou $x = -\\sqrt{k}$.",
      "exemplo": {
        "tex": "x^2 = 25 \\Rightarrow x = -5 \\text{ ou } x = 5",
        "fala": "x ao quadrado igual a vinte e cinco: x igual a menos cinco ou cinco."
      },
      "alerta": "Se $k = 0$, só há a raiz 0. Se $k < 0$, não há raiz real.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "aposta",
      "pergunta": "Quantas raízes reais tem $x^2 = 0$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "0 · 0 = 0"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: 0 · 0 = 0"
      },
      "opcoes": [
        {
          "texto": "Uma: 0",
          "explica": "+0 e −0 são o mesmo número.",
          "certa": true
        },
        {
          "texto": "Duas: +0 e −0",
          "explica": "As duas escritas apontam para o mesmo ponto da reta.",
          "erro": "raizes-iguais-contadas-duas"
        }
      ],
      "esboco": "O caso zero impede decorar duas para qualquer equação.",
      "fala": "Quantas raízes reais tem x ao quadrado igual a zero?"
    },
    {
      "tipo": "aposta",
      "pergunta": "E $x^2 = -9$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "3² = 9",
            "(−3)² = 9"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (−3)² = 9"
      },
      "opcoes": [
        {
          "texto": "Nenhuma raiz real",
          "explica": "O quadrado de qualquer número real é maior ou igual a zero.",
          "certa": true
        },
        {
          "texto": "$x = -3$",
          "explica": "(−3)² dá +9, e não −9.",
          "erro": "quadrado-negativo-tem-raiz-real"
        }
      ],
      "esboco": "O aluno testa a candidata antes da conclusão.",
      "fala": "E x ao quadrado igual a menos nove?"
    },
    {
      "tipo": "passo",
      "problema": "Resolva $(x - 1)^2 = 16$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "(x − 1)² = 16"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (x − 1)² = 16"
      },
      "passos": [
        {
          "pergunta": "Que valores pode ter $x - 1$?",
          "opcoes": [
            {
              "texto": "$4$ ou $-4$",
              "explica": "4² e (−4)² dão 16.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x − 1 = 4 ou x − 1 = −4"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: x − 1 = 4 ou x − 1 = −4"
              }
            },
            {
              "texto": "Só $4$",
              "explica": "Confira o outro sinal: (−4)² também dá 16.",
              "erro": "equacao-esquece-raiz-negativa"
            }
          ],
          "linha": {
            "tex": "x - 1 = 4 \\text{ ou } x - 1 = -4",
            "fala": "x menos um igual a quatro ou menos quatro."
          }
        },
        {
          "pergunta": "Some 1 em cada caso. Quais são as raízes?",
          "opcoes": [
            {
              "texto": "$5$ e $-3$",
              "explica": "5 − 1 = 4 e −3 − 1 = −4.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x = 5 ou x = −3",
                    "(−3 − 1)² = 16"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: (−3 − 1)² = 16"
              }
            },
            {
              "texto": "$5$ e $-5$",
              "explica": "O ± vale para x − 1, não para x. Some 1 também no caso −4.",
              "erro": "equacao-deslocamento-troca-sinal"
            }
          ],
          "linha": {
            "tex": "x = 5 \\text{ ou } x = -3",
            "fala": "x igual a cinco ou menos três."
          }
        }
      ],
      "esboco": "Primeiro desfaz o quadrado, depois a subtração, conferindo o ramo negativo.",
      "fala": "Resolva: x menos um, entre parênteses, ao quadrado, igual a dezesseis."
    },
    {
      "tipo": "caderno",
      "instrucao": "Resolva $(x + 2)^2 = 9$ no papel. Digite a **menor** raiz.",
      "resposta": -5,
      "sinal": true,
      "resolucao": [
        {
          "tex": "x + 2 = 3 \\text{ ou } x + 2 = -3",
          "fala": "x mais dois vale três ou menos três."
        },
        {
          "tex": "x = 1 \\text{ ou } x = -5",
          "fala": "Subtraindo dois: um ou menos cinco."
        },
        {
          "tex": "(-5 + 2)^2 = 9",
          "fala": "Conferindo a menor: menos três ao quadrado é nove."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "segundo-quadrado-n1",
        "segundo-quadrado-n2",
        "segundo-quadrado-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "O piso tem lado **5 m**. Já a equação $x^2 = 25$ aceita **−5 e 5**. A pergunta decide quais valores servem.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "Lado do piso: 5 m",
            "Raízes da equação: −5 e 5"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: Raízes da equação: −5 e 5"
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
