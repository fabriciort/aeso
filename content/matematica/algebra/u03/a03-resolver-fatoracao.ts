import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U3.A3",
  "titulo": "Resolver por fatoração",
  "objetivo": "Fatorar uma equação igualada a zero, resolver cada fator e preservar a raiz zero ao colocar x em evidência.",
  "modelo": "retangulo",
  "esboco": "O retângulo reconstitui x² − 5x + 6. O produto nulo encontra 2 e 3. O exemplo x² − 4x mostra por que dividir por x pode perder uma solução.",
  "vega": "Primeiro reúna os termos de um lado para obter zero do outro. Fatoração é uma identidade: x² − 5x + 6 = (x − 2)(x − 3). Depois use produto nulo. Nos desenhos com partes negativas, as áreas representam termos algébricos, não comprimentos negativos de um terreno. Para x² − 4x = 0, fatorar x(x − 4) conserva 0. Dividir por x exige x diferente de zero e eliminaria a raiz 0. Ao final confira cada candidata na equação original.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Um terreno tem largura x e comprimento x − 5. Sua área é 6 m². Como resolver $x^2 - 5x = 6$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x(x − 5) = 6",
            "x² − 5x − 6 = 0"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x² − 5x − 6 = 0"
      },
      "esboco": "Abre uma necessidade de fatorar, sem confundir o exemplo seguinte de raízes 2 e 3 com as medidas deste terreno."
    },
    {
      "tipo": "aposta",
      "pergunta": "Para usar o produto nulo em $x^2 - 5x = 6$, o que fazemos primeiro?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x² − 5x = 6"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x² − 5x = 6"
      },
      "opcoes": [
        {
          "texto": "Subtrair 6 dos dois lados",
          "explica": "Assim o lado direito vira zero: x² − 5x − 6 = 0.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "expressao": [
                "x² − 5x − 6 = 0"
              ]
            },
            "esboco": "A conta em linhas, com a última etapa em destaque: x² − 5x − 6 = 0"
          }
        },
        {
          "texto": "Igualar x² e −5x a zero",
          "explica": "Ainda temos uma soma igual a 6. Precisamos de um produto igual a zero.",
          "erro": "produto-zero-aplicado-a-soma"
        }
      ],
      "esboco": "Conserva a igualdade antes da fatoração."
    },
    {
      "tipo": "ideia",
      "texto": "Primeiro, um caso menor: $x^2 - 5x + 6 = 0$. Vamos escrever a soma como produto.",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "base": [
            "x",
            -2
          ],
          "altura": [
            "x",
            -3
          ],
          "areas": true,
          "somaTermos": true
        },
        "esboco": "Retângulo com cada área escrita e os lados separados em partes."
      },
      "esboco": "Os sinais no retângulo são termos algébricos, não lados de um terreno."
    },
    {
      "tipo": "mexa",
      "texto": "O retângulo mostra por que $(x - 2)(x - 3)$ dá $x^2 - 5x + 6$.",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "base": [
            "x",
            -2
          ],
          "altura": [
            "x",
            -3
          ],
          "areas": true,
          "revelar": true,
          "somaTermos": true
        },
        "esboco": "Retângulo com cada área escrita e os lados separados em partes."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Toque nas quatro partes e confira os sinais.",
        "sucesso": {
          "reveladas": 4
        },
        "mostre": "As áreas são x², −2x, −3x e +6."
      },
      "descoberta": "Os termos −2x e −3x somam −5x. O canto é positivo.",
      "esboco": "Reconstrói a fatoração antes de usá-la para resolver."
    },
    {
      "tipo": "aposta",
      "pergunta": "Agora $(x - 2)(x - 3) = 0$. Quais são as raízes?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "(x − 2)(x − 3) = 0"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (x − 2)(x − 3) = 0"
      },
      "opcoes": [
        {
          "texto": "$2$ e $3$",
          "explica": "2 zera x − 2. O 3 zera x − 3.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "produtoZero": {
                "raizes": [
                  2,
                  3
                ],
                "valores": [
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
          }
        },
        {
          "texto": "$-2$ e $-3$",
          "explica": "Para x − 2 zerar, x vale +2. Substitua para conferir.",
          "erro": "equacao-raiz-copia-sinal"
        }
      ],
      "esboco": "Distingue sinais dos fatores e sinais das raízes."
    },
    {
      "tipo": "anote",
      "titulo": "Resolver por fatoração",
      "definicao": "Deixe zero de um lado, fatore o outro e iguale cada fator a zero.",
      "exemplo": {
        "tex": "\\begin{gathered}x^2-5x+6=(x-2)(x-3)\\\\(x-2)(x-3)=0\\\\x=2\\text{ ou }x=3\\end{gathered}",
        "fala": "Fatorar revela os fatores x menos dois e x menos três. As raízes são dois e três."
      },
      "alerta": "Não divida por x sem conferir se **x = 0** é uma raiz.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $x^2 - 4x = 0$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x² − 4x = 0"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x² − 4x = 0"
      },
      "passos": [
        {
          "pergunta": "Qual fator comum aparece nos dois termos?",
          "opcoes": [
            {
              "texto": "$x$: fica $x(x - 4) = 0$",
              "explica": "x vezes x dá x²; x vezes −4 dá −4x.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x(x − 4) = 0"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: x(x − 4) = 0"
              }
            },
            {
              "texto": "Dividir por x: sobra x − 4 = 0",
              "explica": "Se x for zero, não podemos dividir por ele. A fatoração conserva essa possibilidade.",
              "erro": "equacao-divide-por-x"
            }
          ],
          "linha": {
            "tex": "x(x-4)=0",
            "fala": "x vezes x menos quatro igual a zero."
          }
        },
        {
          "pergunta": "Quais raízes precisamos conferir?",
          "opcoes": [
            {
              "texto": "$0$ e $4$",
              "explica": "0 zera o primeiro fator, e 4 zera o segundo.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x = 0 ou x = 4",
                    "0² − 4 · 0 = 0"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: 0² − 4 · 0 = 0"
              }
            },
            {
              "texto": "Só $4$",
              "explica": "O primeiro fator é x. Ele também pode zerar.",
              "erro": "equacao-divide-por-x"
            }
          ],
          "linha": {
            "tex": "x=0 \\text{ ou } x=4",
            "fala": "Zero ou quatro."
          }
        }
      ],
      "esboco": "O momento-chave é manter a raiz zero, mesmo quando não há termo independente."
    },
    {
      "tipo": "aposta",
      "pergunta": "Voltando ao terreno: $x^2 - 5x - 6 = (x - 6)(x + 1) = 0$. Qual largura serve?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x = 6 ou x = −1",
            "Comprimento: x − 5"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: Comprimento: x − 5"
      },
      "opcoes": [
        {
          "texto": "6 m",
          "explica": "A largura é 6 m e o comprimento, 1 m. A área é 6 m².",
          "certa": true
        },
        {
          "texto": "−1 m",
          "explica": "−1 resolve a equação, mas não pode medir a largura.",
          "erro": "equacao-aceita-medida-negativa"
        }
      ],
      "esboco": "Responde ao contexto inicial e verifica a restrição física."
    },
    {
      "tipo": "caderno",
      "instrucao": "Resolva $x^2 + 3x = 0$. Digite a **maior** raiz.",
      "resposta": 0,
      "sinal": true,
      "resolucao": [
        {
          "tex": "x(x+3)=0",
          "fala": "Coloque x em evidência."
        },
        {
          "tex": "x=0 \\text{ ou } x=-3",
          "fala": "Zero ou menos três."
        },
        {
          "tex": "0^2+3\\cdot0=0",
          "fala": "Conferindo zero na equação original."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "segundo-fatoracao-n1",
        "segundo-fatoracao-n2",
        "segundo-fatoracao-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "A fatoração guardou todas as raízes. No terreno, só **6 m** serve. Na equação $x^2 - 4x = 0$, servem **0 e 4**.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x² − 5x − 6 = 0 → −1 ou 6",
            "x² − 4x = 0 → 0 ou 4"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x² − 4x = 0 → 0 ou 4"
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
