import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U3.A5",
  "titulo": "A fórmula",
  "objetivo": "Entender a fórmula como completar o quadrado, identificar coeficientes com sinal, calcular as duas raízes e conferi-las na equação original.",
  "modelo": "retangulo",
  "esboco": "Uma moldura leva a 2x² + 6x − 8 = 0. Dividir por 2 revela o mesmo quadrado da aula anterior. A dedução geral fica em etapas; só então vem a fórmula.",
  "vega": "A fórmula não é mágica: para a diferente de zero, divida ax² + bx + c = 0 por a, isole −c/a e some (b/2a)² dos dois lados. Daí (x + b/2a)² = (b² − 4ac)/(4a²). Uma forma equivalente, sem discutir o sinal de a, é (2ax + b)² = b² − 4ac. Resolva 2ax + b = ±√(b² − 4ac) e então divida todo −b ± √Δ por 2a. Identifique b e c com seus sinais. Calcule as duas contas separadas e substitua ambas no original. O visual geométrico é só para coeficiente positivo de x e x positivo; a identidade geral também vale para a negativo.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Uma foto de **2 cm por 4 cm** ganha moldura de largura x. O conjunto ocupa **24 cm²**. Quanto vale x?",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "base": [
            "x",
            2,
            "x"
          ],
          "altura": [
            "x",
            4,
            "x"
          ],
          "total": "24 cm²"
        },
        "esboco": "Foto no centro, com faixas iguais nos dois lados de cada dimensão."
      },
      "esboco": "Retoma a moldura como aplicação da área. O problema completo virá na última aula."
    },
    {
      "tipo": "ideia",
      "texto": "A área dá $(2+2x)(4+2x)=24$. Expandindo e dividindo por 2, chegamos à equação:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "4x^2+12x+8=24",
            "2x^2+6x-8=0"
          ]
        },
        "esboco": "As duas linhas mostram a equação da área e sua forma reduzida."
      },
      "esboco": "A ponte entre o desenho e a equação aparece antes da fórmula."
    },
    {
      "tipo": "aposta",
      "pergunta": "Dividindo **todos** os termos por 2, qual equação fica?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "2x² + 6x − 8 = 0"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: 2x² + 6x − 8 = 0"
      },
      "opcoes": [
        {
          "texto": "$x^2 + 3x - 4 = 0$",
          "explica": "2x² ÷ 2 = x², 6x ÷ 2 = 3x e −8 ÷ 2 = −4.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "expressao": [
                "x² + 3x = 4"
              ]
            },
            "esboco": "A conta em linhas, com a última etapa em destaque: x² + 3x = 4"
          }
        },
        {
          "texto": "$x^2 + 6x - 8 = 0$",
          "explica": "A divisão vale para cada termo, não só para x².",
          "erro": "divide-so-o-primeiro"
        }
      ],
      "esboco": "Liga o coeficiente a ao método já conhecido."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em $x^2 + 3x = 4$, que número completa o quadrado?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x^2+3x=4"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "opcoes": [
        {
          "texto": "$9/4$",
          "explica": "Metade de 3 é 3/2. O canto vale (3/2)² = 9/4.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "formulas": [
                "(x+3/2)^2=25/4"
              ]
            },
            "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
          }
        },
        {
          "texto": "$3/2$",
          "explica": "3/2 é o lado do canto. Ainda falta elevá-lo ao quadrado.",
          "erro": "completar-metade-sem-quadrado"
        }
      ],
      "esboco": "O coeficiente ímpar abre a necessidade de uma receita que preserve as frações."
    },
    {
      "tipo": "ideia",
      "texto": "Podemos fazer essa mesma conta com letras. Em $ax^2 + bx + c = 0$, precisamos de $a \\ne 0$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "ax^2+bx+c=0",
            "x^2+\\frac{b}{a}x=-\\frac{c}{a}"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "esboco": "Divide a equação inteira por a, mostrando a fração em cada termo.",
      "fala": "Podemos fazer essa mesma conta com letras. Em a x ao quadrado mais b x mais c igual a zero, precisamos de a diferente de zero."
    },
    {
      "tipo": "aposta",
      "pergunta": "Qual é a metade do coeficiente $b/a$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x^2+\\frac{b}{a}x=-\\frac{c}{a}"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "opcoes": [
        {
          "texto": "$b/(2a)$",
          "explica": "Dividir b/a por 2 põe mais um fator 2 no denominador.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "formulas": [
                "\\left(x+\\frac{b}{2a}\\right)^2=\\frac{b^2-4ac}{4a^2}"
              ]
            },
            "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
          }
        },
        {
          "texto": "$2b/a$",
          "explica": "Isso dobra o coeficiente. Para repartir em duas faixas, divida por 2.",
          "erro": "completar-dobra-coeficiente"
        }
      ],
      "esboco": "A escolha do aluno faz aparecer o quadrado completo geral.",
      "fala": "Qual é a metade do coeficiente b dividido por a?"
    },
    {
      "tipo": "ideia",
      "texto": "Somamos $(b/2a)^2$ dos dois lados e juntamos as frações. Multiplicar por $4a^2$ dá:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "\\left(x+\\frac{b}{2a}\\right)^2=\\frac{b^2-4ac}{4a^2}",
            "(2ax+b)^2=b^2-4ac"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "esboco": "A ponte algébrica evita extrair √(4a²) como 2a quando a é negativo.",
      "fala": "Somamos o quadrado de b sobre dois a aos dois lados e juntamos as frações. Veja o que acontece ao multiplicar por quatro a ao quadrado."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se o lado direito é positivo, como desfazemos o quadrado?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(2ax+b)^2=b^2-4ac"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "opcoes": [
        {
          "texto": "$2ax+b=\\pm\\sqrt{b^2-4ac}$",
          "explica": "O número ao quadrado pode ser positivo ou negativo.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "formulas": [
                "2ax+b=\\pm\\sqrt{b^2-4ac}",
                "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}"
              ]
            },
            "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
          }
        },
        {
          "texto": "$2ax+b=\\sqrt{b^2-4ac}$ apenas",
          "explica": "Faltou o outro sinal: um número e seu oposto têm o mesmo quadrado.",
          "erro": "equacao-esquece-raiz-negativa"
        }
      ],
      "esboco": "Só agora aparece a fórmula, como resumo de passos vistos."
    },
    {
      "tipo": "anote",
      "titulo": "Fórmula do 2º grau",
      "definicao": "Em $ax^2 + bx + c = 0$, com $a \\ne 0$, a fórmula resume o método de completar o quadrado.",
      "exemplo": {
        "tex": "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}",
        "fala": "x é menos b, mais ou menos a raiz de b ao quadrado menos quatro a c, tudo dividido por dois a."
      },
      "alerta": "Use os sinais de a, b e c. Divida **todo o numerador** por 2a.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $2x^2 + 6x - 8 = 0$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2x^2+6x-8=0"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "passos": [
        {
          "pergunta": "Quais são os coeficientes?",
          "opcoes": [
            {
              "texto": "$a=2$, $b=6$, $c=-8$",
              "explica": "O termo constante é −8: seu sinal faz parte de c.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "a = 2, b = 6, c = −8"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: a = 2, b = 6, c = −8"
              }
            },
            {
              "texto": "$a=2$, $b=6$, $c=8$",
              "explica": "Na equação está −8, não +8.",
              "erro": "equacao-coeficiente-sem-sinal"
            }
          ],
          "linha": {
            "tex": "a=2,\\quad b=6,\\quad c=-8",
            "fala": "a dois, b seis e c menos oito."
          }
        },
        {
          "pergunta": "Quanto vale $b^2 - 4ac$?",
          "opcoes": [
            {
              "texto": "$100$",
              "explica": "36 − 4 · 2 · (−8) = 36 + 64 = 100.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "formulas": [
                    "x=\\frac{-6\\pm10}{4}"
                  ]
                },
                "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
              }
            },
            {
              "texto": "$-28$",
              "explica": "O produto 4ac é −64. Subtrair −64 soma 64.",
              "erro": "equacao-coeficiente-sem-sinal"
            }
          ],
          "linha": {
            "tex": "b^2-4ac=36+64=100",
            "fala": "Trinta e seis mais sessenta e quatro é cem."
          }
        },
        {
          "pergunta": "Faça as duas divisões. Quais são as raízes?",
          "opcoes": [
            {
              "texto": "$1$ e $-4$",
              "explica": "(−6 + 10) ÷ 4 = 1. (−6 − 10) ÷ 4 = −4.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x = 1 ou x = −4",
                    "2 · 1² + 6 · 1 − 8 = 0"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: 2 · 1² + 6 · 1 − 8 = 0"
              }
            },
            {
              "texto": "$-3{,}5$ e $-8{,}5$",
              "explica": "O −6 também se divide por 4. Use parênteses em cada numerador.",
              "erro": "equacao-divide-so-radical"
            }
          ],
          "linha": {
            "tex": "x=1 \\text{ ou } x=-4",
            "fala": "Um ou menos quatro."
          }
        }
      ],
      "esboco": "Identifica sinais, calcula o radical e divide o numerador inteiro, com confirmação visual em cada acerto."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se $b=-6$, quanto vale $-b$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "b = −6",
            "−b = −(−6)"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: −b = −(−6)"
      },
      "opcoes": [
        {
          "texto": "$6$",
          "explica": "O oposto de −6 é +6.",
          "certa": true
        },
        {
          "texto": "$-6$",
          "explica": "O menos da fórmula troca o sinal do valor de b.",
          "erro": "equacao-menos-b"
        }
      ],
      "esboco": "Inclui o sinal que o exemplo de b positivo ainda não praticou.",
      "fala": "Se b vale menos seis, quanto vale o oposto de b?"
    },
    {
      "tipo": "caderno",
      "instrucao": "Use a fórmula em $2x^2 - 2x - 4 = 0$. Digite a **menor** raiz.",
      "resposta": -1,
      "sinal": true,
      "resolucao": [
        {
          "tex": "a=2,\\ b=-2,\\ c=-4",
          "fala": "a dois, b menos dois e c menos quatro."
        },
        {
          "tex": "b^2-4ac=4+32=36",
          "fala": "O radicando é trinta e seis."
        },
        {
          "tex": "x=\\frac{2\\pm6}{4}",
          "fala": "Dois mais ou menos seis, tudo sobre quatro."
        },
        {
          "tex": "x=2 \\text{ ou } x=-1",
          "fala": "Dois ou menos um."
        },
        {
          "tex": "2(-1)^2-2(-1)-4=0",
          "fala": "Dois mais dois menos quatro é zero."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "segundo-formula-n1",
        "segundo-formula-n2",
        "segundo-formula-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "A fórmula deu **1 e −4**. Na moldura, só **1** pode medir a largura. A fórmula nasceu de completar o quadrado.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x=\\frac{-6\\pm10}{4}",
            "x=1\\text{ ou }x=-4"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
