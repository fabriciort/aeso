import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U5.A5",
  "titulo": "O sinal de um produto",
  "objetivo": "Determinar onde um produto de fatores lineares é positivo, negativo ou zero, separando os intervalos pelas raízes e evitando divisão por expressão de sinal desconhecido.",
  "modelo": "reta",
  "esboco": "Da situação às tentativas na reta, depois à escrita simbólica, com perguntas que explicam cada transformação e seus limites.",
  "vega": "Para (x−1)(x−4), os zeros 1 e 4 separam regiões. Em x<1 ambos os fatores são negativos e o produto é positivo. Entre 1 e 4, sinais opostos dão produto negativo. Acima de 4 ambos positivos dão positivo. Em cada região, fatores lineares não mudam de sinal sem passar pelo próprio zero; por isso um teste interno basta quando a expressão já está fatorada e todas as raízes estão listadas. Os pontos das raízes precisam ser tratados separadamente: produto zero não satisfaz <0, mas satisfaz ≤0. Para >0, os dois fatores podem ser negativos, não apenas positivos. Não divida por x−1 sem conhecer seu sinal e excluir zero: estudar os sinais evita esse risco.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Quais valores tornam $(x-1)(x-4)$ negativo? Testar só as raízes não responde à pergunta.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x-1)(x-4)<0"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A situação abre uma pergunta real antes de apresentar a regra."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em x = 0, os fatores são −1 e −4. O produto é:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(-1)(-4)=?"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Positivo: 4",
          "explica": "Dois fatores negativos dão um produto positivo.",
          "certa": true
        },
        {
          "texto": "Negativo: −4",
          "explica": "Negativo vezes negativo é positivo.",
          "erro": "sinais-iguais-da-negativo"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "mexa",
      "texto": "Teste os zeros e um valor em cada faixa. Compare os sinais dos dois fatores.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 6,
            "intervalos": [
              {
                "de": 1,
                "ate": 4,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "candidatos": [
              0,
              1,
              2,
              4,
              5
            ],
            "ocultar": true,
            "teste": {
              "coeficientes": [
                1,
                -5,
                4
              ],
              "relacao": "<",
              "direita": 0
            },
            "fatores": [
              1,
              4
            ]
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Teste cada número e observe o resultado.",
        "sucesso": {
          "testados": true
        },
        "mostre": "Todos os valores são testados; o conjunto de soluções aparece na reta."
      },
      "descoberta": "O produto é negativo só entre as raízes, onde os fatores têm sinais opostos.",
      "esboco": "Cada tentativa faz a comparação numérica e mostra se o ponto pertence. Repetir um valor não avança; explorar não soma erros."
    },
    {
      "tipo": "aposta",
      "pergunta": "Por que os zeros 1 e 4 dividem a reta em faixas?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x-1=0\\Rightarrow x=1",
            "x-4=0\\Rightarrow x=4"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Um fator muda de sinal ao passar pelo seu zero",
          "explica": "Dentro de cada faixa, nenhum dos fatores cruza zero.",
          "certa": true
        },
        {
          "texto": "Todo número entre raízes é uma raiz",
          "explica": "No meio, o produto não é zero. Por exemplo, em 2 dá −2.",
          "erro": "ineq-so-raizes"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "ideia",
      "texto": "Em cada faixa, descubra o sinal de **cada fator**. Depois use a regra de multiplicação dos sinais.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 6,
            "intervalos": [
              {
                "de": 1,
                "ate": 4,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "rotulo": "1<x<4"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "esboco": "A frase conecta a descoberta visual ao próximo raciocínio, sem repetir uma definição."
    },
    {
      "tipo": "aposta",
      "pergunta": "Para o produto ser positivo, os dois fatores precisam ser positivos?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(-1)(-4)=4",
            "1\\cdot2=2"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Não: dois negativos também servem",
          "explica": "O produto é positivo quando os sinais dos fatores são iguais.",
          "certa": true
        },
        {
          "texto": "Sim: só sinais positivos servem",
          "explica": "O exemplo (−1) · (−4) já dá um produto positivo.",
          "erro": "ineq-produto-so-positivos"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "anote",
      "titulo": "Estudo de sinais",
      "definicao": "Os zeros dos fatores separam faixas. Em cada faixa, combine os sinais dos fatores para obter o sinal do produto.",
      "exemplo": {
        "tex": "\\begin{gathered}(x-1)(x-4)<0\\\\\\Longleftrightarrow1<x<4\\\\(x-1)(x-4)=0\\\\\\Longleftrightarrow x=1\\text{ ou }x=4\\end{gathered}",
        "fala": "O produto é negativo entre um e quatro, e zero nos dois extremos."
      },
      "alerta": "Produto negativo pede sinais opostos. Produto positivo pede sinais iguais. Não confunda sinal com zero.",
      "esboco": "O caderno reúne a definição, um exemplo exato e o cuidado que evita o erro central."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $(x+2)(x-3)\\ge0$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x+2)(x-3)\\ge0"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "passos": [
        {
          "pergunta": "Quais valores zeram os fatores?",
          "opcoes": [
            {
              "texto": "$-2$ e $3$",
              "explica": "x + 2 zera em −2; x − 3 zera em 3.",
              "certa": true
            },
            {
              "texto": "$2$ e $-3$",
              "explica": "Resolva cada fator igual a zero; não copie seu sinal.",
              "erro": "equacao-raiz-copia-sinal"
            }
          ],
          "linha": {
            "tex": "x=-2\\quad\\text{ou}\\quad x=3",
            "fala": "Os zeros são menos dois e três."
          }
        },
        {
          "pergunta": "Em qual parte o produto é não negativo?",
          "opcoes": [
            {
              "texto": "$x\\le-2$ ou $x\\ge3$",
              "explica": "Fora das raízes os sinais são iguais; nas raízes, zero é permitido.",
              "certa": true
            },
            {
              "texto": "$-2\\le x\\le3$",
              "explica": "No meio, os sinais são opostos e o produto é negativo.",
              "erro": "ineq-produto-escolhe-meio"
            }
          ],
          "linha": {
            "tex": "]-\\infty;-2]\\cup[3;+\\infty[",
            "fala": "Menores ou iguais a menos dois, ou maiores ou iguais a três."
          }
        }
      ],
      "esboco": "O aluno decide cada etapa. A conta escrita mostra a operação e preserva o conjunto de soluções."
    },
    {
      "tipo": "aposta",
      "pergunta": "Podemos dividir $(x-1)(x-4)<0$ por $x-1$ mantendo sempre o sinal?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x-1)(x-4)<0"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Não: x − 1 pode ser negativo ou zero",
          "explica": "O sinal da divisão dependeria de x; em 1, a divisão nem existe.",
          "certa": true
        },
        {
          "texto": "Sim: basta cortar o fator",
          "explica": "Se x − 1 for negativo, seria preciso inverter. Não sabemos isso para todos os x.",
          "erro": "ineq-divide-expressao"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "caderno",
      "instrucao": "Em $(x-1)(x-4)<0$, quantos **inteiros** servem?",
      "resposta": 2,
      "sinal": true,
      "resolucao": [
        {
          "tex": "1<x<4",
          "fala": "O produto é negativo entre as raízes, sem incluí-las."
        },
        {
          "tex": "x=2\\quad\\text{ou}\\quad x=3",
          "fala": "Os inteiros são dois e três: dois valores."
        }
      ],
      "esboco": "Resolva no papel; digite apenas o número pedido e confira as etapas e as bordas."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "inequacao-produto-n1",
        "inequacao-produto-n2",
        "inequacao-produto-n3"
      ],
      "esboco": "Três níveis: visual e valores amigáveis, caso que pega e resolução independente sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "O produto é negativo em **]1; 4[**. Encontramos uma faixa inteira, com os zeros separando as mudanças de sinal.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 6,
            "intervalos": [
              {
                "de": 1,
                "ate": 4,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "rotulo": "]1;4["
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "esboco": "Responde à pergunta inicial e abre o próximo conceito."
    }
  ]
}
