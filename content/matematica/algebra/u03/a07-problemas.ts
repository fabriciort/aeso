import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U3.A7",
  "titulo": "Problemas do 2º grau",
  "objetivo": "Definir a incógnita e sua restrição, montar a equação de área ou números, escolher um método, conferir todas as raízes e interpretar o resultado no contexto.",
  "modelo": "retangulo",
  "esboco": "O terreno 3 m mais comprido que largo conduz a x(x + 3) = 40. A moldura pede o cuidado de somar 2x em cada dimensão. Dois números mostram quando ambas as raízes servem.",
  "vega": "Quatro hábitos: diga o que x mede, escreva a condição (por exemplo x > 0), monte a relação antes de expandir, confira no enunciado. Terreno x por x + 3 com área 40 dá x = 5 ou −8, só 5 serve e comprimento 8. Moldura externa de largura x em foto 4 por 6 tem dimensões 4 + 2x e 6 + 2x; área total 48 dá x = 1 ou −6. Não acrescente x só uma vez. Em números, uma raiz negativa pode servir: x(x + 1) = 6 tem x = 2 ou −3; pares 2 e 3, −3 e −2. Não descarte negativos só por hábito. A unidade seguinte usa duas incógnitas.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Um terreno tem **40 m²**. O comprimento é 3 m maior que a largura. Quanto mede cada lado?",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "base": [
            "x",
            3
          ],
          "altura": [
            "x"
          ],
          "areas": true,
          "total": "40 m²"
        },
        "esboco": "Retângulo com cada área escrita e os lados separados em partes."
      },
      "esboco": "Desenha a largura desconhecida e os três metros extras do comprimento."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se x é a largura, como escrevemos a área?",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "base": [
            "x",
            3
          ],
          "altura": [
            "x"
          ],
          "areas": true,
          "total": "40 m²"
        },
        "esboco": "Retângulo com cada área escrita e os lados separados em partes."
      },
      "opcoes": [
        {
          "texto": "$x(x+3)=40$",
          "explica": "A área é largura vezes comprimento. Aqui, x > 0.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "expressao": [
                "x(x + 3) = 40",
                "x² + 3x − 40 = 0"
              ]
            },
            "esboco": "A conta em linhas, com a última etapa em destaque: x² + 3x − 40 = 0"
          }
        },
        {
          "texto": "$x+x+3=40$",
          "explica": "Isso soma dois lados. A área pede multiplicação.",
          "erro": "problema-area-soma-lados"
        }
      ],
      "esboco": "O aluno traduz a relação antes de operar."
    },
    {
      "tipo": "passo",
      "problema": "Encontre as raízes de $x^2 + 3x - 40 = 0$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x² + 3x − 40 = 0"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x² + 3x − 40 = 0"
      },
      "passos": [
        {
          "pergunta": "Que par tem soma 3 e produto −40?",
          "opcoes": [
            {
              "texto": "$8$ e $-5$",
              "explica": "8 − 5 = 3 e 8 · (−5) = −40.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "(x + 8)(x − 5) = 0"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: (x + 8)(x − 5) = 0"
              }
            },
            {
              "texto": "$5$ e $-8$",
              "explica": "O produto confere, mas a soma é −3.",
              "erro": "fatores-com-a-soma-errada"
            }
          ],
          "linha": {
            "tex": "(x+8)(x-5)=0",
            "fala": "x mais oito vezes x menos cinco igual a zero."
          }
        },
        {
          "pergunta": "Quais são as raízes da equação?",
          "opcoes": [
            {
              "texto": "$-8$ e $5$",
              "explica": "−8 zera x + 8; 5 zera x − 5.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x = −8 ou x = 5"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: x = −8 ou x = 5"
              }
            },
            {
              "texto": "$8$ e $-5$",
              "explica": "Confira em cada fator: x + 8 zera em −8.",
              "erro": "equacao-raiz-copia-sinal"
            }
          ],
          "linha": {
            "tex": "x=-8 \\text{ ou } x=5",
            "fala": "Menos oito ou cinco."
          }
        }
      ],
      "esboco": "Um problema conhecido de soma e produto faz a fatoração ter função."
    },
    {
      "tipo": "aposta",
      "pergunta": "A equação aceitou −8 e 5. Qual largura responde ao problema?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "Condição: x > 0",
            "x = −8 ou x = 5"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x = −8 ou x = 5"
      },
      "opcoes": [
        {
          "texto": "5 m de largura e 8 m de comprimento",
          "explica": "5 · 8 = 40 e 8 − 5 = 3. As duas condições conferem.",
          "certa": true,
          "mostra": {
            "modelo": "retangulo",
            "estado": {
              "base": [
                5
              ],
              "altura": [
                8
              ],
              "areas": true,
              "total": "40 m²"
            },
            "esboco": "Retângulo com cada área escrita e os lados separados em partes."
          }
        },
        {
          "texto": "−8 m de largura e −5 m de comprimento",
          "explica": "O produto dá 40, mas medidas de lados precisam ser positivas.",
          "erro": "equacao-aceita-medida-negativa"
        }
      ],
      "esboco": "Conferir o produto sozinho não basta: o contexto também exige comprimentos positivos."
    },
    {
      "tipo": "anote",
      "titulo": "Resolver um problema",
      "definicao": "Defina x, monte a equação, resolva e confira quais raízes atendem ao enunciado.",
      "exemplo": {
        "tex": "\\begin{gathered}x(x+3)=40\\\\x=5\\quad\\Rightarrow\\quad5\\cdot8=40\\end{gathered}",
        "fala": "Defina x como largura. A raiz cinco dá lados cinco e oito, com área quarenta."
      },
      "alerta": "Uma raiz da equação pode não servir ao problema. Confira as medidas e a pergunta.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "aposta",
      "pergunta": "Uma foto de 4 cm por 6 cm recebe moldura externa de largura x. Quais são os lados de fora?",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "base": [
            "x",
            4,
            "x"
          ],
          "altura": [
            "x",
            6,
            "x"
          ],
          "areas": true,
          "destaque": [
            [
              0,
              0
            ],
            [
              0,
              1
            ],
            [
              0,
              2
            ],
            [
              1,
              0
            ],
            [
              1,
              2
            ],
            [
              2,
              0
            ],
            [
              2,
              1
            ],
            [
              2,
              2
            ]
          ]
        },
        "esboco": "Retângulo com cada área escrita e os lados separados em partes."
      },
      "opcoes": [
        {
          "texto": "$4+2x$ e $6+2x$",
          "explica": "A faixa entra nas duas pontas de cada dimensão.",
          "certa": true
        },
        {
          "texto": "$4+x$ e $6+x$",
          "explica": "Faltou a faixa do outro lado da foto.",
          "erro": "moldura-conta-uma-faixa"
        }
      ],
      "esboco": "O desenho mostra a foto no centro e as faixas ao redor."
    },
    {
      "tipo": "passo",
      "problema": "Foto e moldura ocupam **48 cm²**. Resolva $(4+2x)(6+2x)=48$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "(4 + 2x)(6 + 2x) = 48"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (4 + 2x)(6 + 2x) = 48"
      },
      "passos": [
        {
          "pergunta": "Expandindo e tirando 48, que equação fica?",
          "opcoes": [
            {
              "texto": "$4x^2+20x-24=0$",
              "explica": "24 + 8x + 12x + 4x² = 48. Tirando 48, sobra −24.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "4x² + 20x − 24 = 0",
                    "x² + 5x − 6 = 0"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: x² + 5x − 6 = 0"
              }
            },
            {
              "texto": "$4x^2+24=48$",
              "explica": "Faltaram os dois pedaços do meio: 8x e 12x.",
              "erro": "produto-so-das-pontas"
            }
          ],
          "linha": {
            "tex": "x^2+5x-6=0",
            "fala": "Dividindo por quatro, x ao quadrado mais cinco x menos seis é zero."
          }
        },
        {
          "pergunta": "A fatoração é $(x+6)(x-1)=0$. Qual largura serve?",
          "opcoes": [
            {
              "texto": "1 cm",
              "explica": "As raízes são −6 e 1. Só 1 mede a faixa; os lados de fora são 6 cm e 8 cm.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x = 1 cm",
                    "6 · 8 = 48 cm²"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: 6 · 8 = 48 cm²"
              }
            },
            {
              "texto": "−6 cm",
              "explica": "Uma largura negativa não atende ao problema.",
              "erro": "equacao-aceita-medida-negativa"
            }
          ],
          "linha": {
            "tex": "x=1\\,\\text{cm}",
            "fala": "A largura da moldura é um centímetro."
          }
        }
      ],
      "esboco": "Mais autonomia: o aluno monta e simplifica a equação de uma moldura."
    },
    {
      "tipo": "aposta",
      "pergunta": "Dois inteiros consecutivos têm produto 6. O par **−3 e −2** também serve?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x(x + 1) = 6",
            "x = 2 ou x = −3"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x = 2 ou x = −3"
      },
      "opcoes": [
        {
          "texto": "Sim: são consecutivos e o produto é 6",
          "explica": "−3 + 1 = −2 e (−3) · (−2) = 6. Aqui negativos são permitidos.",
          "certa": true
        },
        {
          "texto": "Não: sempre descartamos negativos",
          "explica": "A pergunta fala de números inteiros, não de medidas. Os dois pares servem.",
          "erro": "problema-descarta-negativo-sempre"
        }
      ],
      "esboco": "Evita generalizar indevidamente a restrição de medidas."
    },
    {
      "tipo": "caderno",
      "instrucao": "Um terreno de **54 m²** é 3 m mais comprido que largo. Calcule e digite a largura, em metros.",
      "resposta": 6,
      "sinal": true,
      "resolucao": [
        {
          "tex": "x(x+3)=54",
          "fala": "Largura vezes comprimento é cinquenta e quatro."
        },
        {
          "tex": "x^2+3x-54=(x+9)(x-6)=0",
          "fala": "O par nove e menos seis tem soma três e produto menos cinquenta e quatro."
        },
        {
          "tex": "x=-9 \\text{ ou } x=6",
          "fala": "Menos nove ou seis. Só seis é largura."
        },
        {
          "tex": "6\\cdot9=54",
          "fala": "Conferindo: seis por nove dá cinquenta e quatro metros quadrados."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "segundo-problemas-n1",
        "segundo-problemas-n2",
        "segundo-problemas-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "O terreno mede **5 m por 8 m**. Você montou, resolveu e conferiu. A seguir: problemas com duas incógnitas.",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "base": [
            5
          ],
          "altura": [
            8
          ],
          "areas": true,
          "total": "40 m²"
        },
        "esboco": "Retângulo com cada área escrita e os lados separados em partes."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
