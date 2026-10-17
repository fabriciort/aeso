import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U3.A6",
  "titulo": "O discriminante",
  "objetivo": "Usar o sinal de Δ para prever o número de raízes reais distintas, tratando a raiz repetida como um único valor e diferenciando raiz irracional de inexistente.",
  "modelo": "livre",
  "esboco": "Três quadrados deslocados se igualam a 4, 0 e −4. As previsões vêm antes da regra de Δ. O radical não exato mantém duas raízes reais.",
  "vega": "Discriminante Δ = b² − 4ac. A identidade (2ax+b)² = Δ mostra por que o sinal decide: Δ > 0 dá duas raízes reais distintas, Δ = 0 dá uma raiz real (dupla), Δ < 0 não dá raiz real. Raiz não inteira não é ausência de raiz: √2 é real. Ainda não ensine plano complexo nem antecipe o gráfico de parábolas. Sempre a diferente de zero. Em b² com b negativo use parênteses.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Você já fez uma conta inteira para descobrir que não havia resposta? Dá para prever as raízes antes de resolver?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x^2-6x+5=0",
            "x^2-6x+9=0",
            "x^2-6x+13=0"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "esboco": "Três equações parecidas terão respostas diferentes; a pergunta é a quantidade, não os valores."
    },
    {
      "tipo": "aposta",
      "pergunta": "A primeira vira $(x-3)^2=4$. Quantas raízes reais **diferentes** ela tem?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x-3)^2=4"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "opcoes": [
        {
          "texto": "Duas",
          "explica": "x − 3 pode ser 2 ou −2. Logo x é 5 ou 1.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "formulas": [
                "x=1\\text{ ou }x=5"
              ]
            },
            "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
          }
        },
        {
          "texto": "Uma",
          "explica": "O −2 também tem quadrado 4. Ele dá a outra raiz.",
          "erro": "equacao-esquece-raiz-negativa"
        }
      ],
      "esboco": "Recupera a primeira aula para explicar a contagem."
    },
    {
      "tipo": "aposta",
      "pergunta": "A segunda vira $(x-3)^2=0$. Quantas raízes diferentes?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x-3)^2=0"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "opcoes": [
        {
          "texto": "Uma",
          "explica": "x − 3 precisa ser zero. Só x = 3 serve.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "formulas": [
                "x=3"
              ]
            },
            "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
          }
        },
        {
          "texto": "Duas: 3 e 3",
          "explica": "3 escrito duas vezes é o mesmo valor. Chamamos de raiz dupla.",
          "erro": "raizes-iguais-contadas-duas"
        }
      ],
      "esboco": "Distingue multiplicidade e quantidade de valores."
    },
    {
      "tipo": "aposta",
      "pergunta": "A terceira vira $(x-3)^2=-4$. Quantas raízes reais?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x-3)^2=-4"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "opcoes": [
        {
          "texto": "Nenhuma",
          "explica": "Nenhum número real ao quadrado dá −4.",
          "certa": true
        },
        {
          "texto": "Duas: $3 \\pm 2$",
          "explica": "Nos dois casos o quadrado dá +4, não −4.",
          "erro": "quadrado-negativo-tem-raiz-real"
        }
      ],
      "esboco": "O sinal, e não o tamanho da conta, decide a existência."
    },
    {
      "tipo": "ideia",
      "texto": "Na fórmula, o número dentro da raiz é $\\Delta = b^2 - 4ac$. Seu nome é **discriminante**.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(2ax+b)^2=\\Delta",
            "\\Delta=b^2-4ac"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "esboco": "Nome depois das três previsões. A mesma identidade justifica a regra.",
      "fala": "Na fórmula, o número dentro da raiz é delta: b ao quadrado menos quatro a c. Seu nome é discriminante."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se $\\Delta=0$, os sinais + e − da fórmula dão respostas diferentes?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x=\\frac{-b\\pm0}{2a}"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "opcoes": [
        {
          "texto": "Não: somar ou tirar 0 dá o mesmo",
          "explica": "As duas contas chegam ao mesmo valor, −b/(2a).",
          "certa": true
        },
        {
          "texto": "Sim: o ± sempre dá duas raízes",
          "explica": "+0 e −0 são iguais. A fórmula repete a mesma raiz.",
          "erro": "raizes-iguais-contadas-duas"
        }
      ],
      "esboco": "Explica a raiz dupla dentro da fórmula.",
      "fala": "Se delta é zero, os sinais mais e menos da fórmula dão respostas diferentes?"
    },
    {
      "tipo": "anote",
      "titulo": "Discriminante",
      "definicao": "O discriminante é $\\Delta = b^2 - 4ac$. Seu sinal indica quantas raízes reais diferentes a equação tem.",
      "exemplo": {
        "tex": "\\Delta>0:2;\\quad\\Delta=0:1;\\quad\\Delta<0:0",
        "fala": "Delta positivo, duas; delta zero, uma; delta negativo, nenhuma raiz real."
      },
      "alerta": "Raiz **não inteira** ainda é real. $\\sqrt{2}$ existe; $\\sqrt{-2}$ não é real.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Sem resolver, conte as raízes de $x^2 - 4x + 5 = 0$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x^2-4x+5=0"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "passos": [
        {
          "pergunta": "Quanto vale $\\Delta$?",
          "opcoes": [
            {
              "texto": "$-4$",
              "explica": "(−4)² − 4 · 1 · 5 = 16 − 20 = −4.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "formulas": [
                    "\\Delta=16-20=-4"
                  ]
                },
                "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
              }
            },
            {
              "texto": "$-36$",
              "explica": "O quadrado de −4 é +16, não −16.",
              "erro": "sinais-iguais-da-negativo"
            }
          ],
          "linha": {
            "tex": "\\Delta=(-4)^2-4\\cdot1\\cdot5=-4",
            "fala": "Delta é menos quatro."
          }
        },
        {
          "pergunta": "O que esse sinal permite concluir?",
          "opcoes": [
            {
              "texto": "Não há raiz real",
              "explica": "Teríamos um quadrado igual a −4, o que não acontece nos reais.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "formulas": [
                    "(x-2)^2=-1"
                  ]
                },
                "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
              }
            },
            {
              "texto": "Há duas raízes negativas",
              "explica": "Delta negativo não diz que x é negativo. Diz que a raiz da fórmula não é real.",
              "erro": "delta-negativo-raizes-negativas"
            }
          ],
          "linha": {
            "tex": "\\text{Nenhuma raiz real}",
            "fala": "Nenhuma raiz real."
          }
        }
      ],
      "esboco": "O aluno calcula Δ com b negativo e interpreta o sinal, sem fazer contas desnecessárias."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em $x^2 - 2 = 0$, $\\Delta=8$. Não é quadrado perfeito. Há raízes reais?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x^2=2"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "opcoes": [
        {
          "texto": "Sim: $-\\sqrt{2}$ e $\\sqrt{2}$",
          "explica": "Δ é positivo. As raízes existem, mesmo sem serem inteiras.",
          "certa": true
        },
        {
          "texto": "Não: 8 não tem raiz exata",
          "explica": "√8 é real. Só não é um número inteiro.",
          "erro": "delta-nao-quadrado-sem-raizes"
        }
      ],
      "esboco": "Derruba a associação entre conta sem inteiro e ausência de solução.",
      "fala": "Em x ao quadrado menos dois igual a zero, delta é oito. Não é quadrado perfeito. Há raízes reais?"
    },
    {
      "tipo": "caderno",
      "instrucao": "Calcule $\\Delta$ de $x^2 + 2x + 1 = 0$. Digite quantas raízes reais **diferentes** ela tem.",
      "resposta": 1,
      "sinal": true,
      "resolucao": [
        {
          "tex": "\\Delta=2^2-4\\cdot1\\cdot1=0",
          "fala": "Quatro menos quatro é zero."
        },
        {
          "tex": "(x+1)^2=0 \\Rightarrow x=-1",
          "fala": "O quadrado zera só com x igual a menos um."
        },
        {
          "tex": "\\text{Uma raiz real distinta}",
          "fala": "Uma raiz real diferente."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução.",
      "fala": "Calcule delta de x ao quadrado mais dois x mais um igual a zero. Digite quantas raízes reais diferentes ela tem."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "segundo-delta-n1",
        "segundo-delta-n2",
        "segundo-delta-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Antes de resolver, olhe o sinal de $\\Delta$: ele já diz se haverá **duas, uma ou nenhuma raiz real**.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "\\Delta>0\\quad 2",
            "\\Delta=0\\quad 1",
            "\\Delta<0\\quad 0"
          ]
        },
        "esboco": "Etapas da dedução em TeX, com a última em âmbar. As frações mantêm a divisão de todo o numerador."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
