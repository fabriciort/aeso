import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U5.A2",
  "titulo": "Resolver inequações do 1º grau",
  "objetivo": "Isolar x por operações equivalentes com divisor positivo, interpretar soluções vazias ou universais e verificar a fronteira na original.",
  "modelo": "reta",
  "esboco": "Da situação às tentativas na reta, depois à escrita simbólica, com perguntas que explicam cada transformação e seus limites.",
  "vega": "3x+2≤17 equivale a x≤5: subtrair a mesma quantidade desloca ambos os lados e mantém a ordem; dividir por 3 positivo também mantém. Inclua parênteses, letras nos dois lados e casos em que x desaparece. Em 2x+1<2x+4 sobra 1<4, verdadeiro para todo real. Em 2x+5≤2x+3 sobra 5≤3, falso para qualquer real. Zero não vira resposta só porque as letras se cancelaram. Ainda não use divisor negativo nesta aula: a próxima explica a inversão. No caderno pedir maior inteiro é legítimo porque há fronteira superior; não confundir com uma única solução.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Uma compra custa R$ 2 de taxa mais R$ 3 por unidade. Para gastar **até R$ 17**, que valores de x cabem?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "3x+2\\le17"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A situação abre uma pergunta real antes de apresentar a regra."
    },
    {
      "tipo": "aposta",
      "pergunta": "Para tirar a taxa de 2 da conta, o que fazer?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "3x+2\\le17"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Subtrair 2 dos dois lados",
          "explica": "A mesma retirada mantém a comparação: 3x ≤ 15.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "formulas": [
                "3x\\le15"
              ]
            },
            "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
          }
        },
        {
          "texto": "Tirar 2 só da esquerda",
          "explica": "O total da direita também precisa perder 2.",
          "erro": "opera-so-de-um-lado"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "mexa",
      "texto": "Teste a fronteira e os valores próximos em $3x+2\\le17$.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 1,
            "ate": 8,
            "intervalos": [
              {
                "de": null,
                "ate": 5,
                "incluiDe": false,
                "incluiAte": true
              }
            ],
            "candidatos": [
              4,
              5,
              5.5,
              6
            ],
            "ocultar": true,
            "teste": {
              "coeficientes": [
                0,
                3,
                2
              ],
              "relacao": "<=",
              "direita": 17
            }
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
      "descoberta": "O valor 5 dá empate e entra; acima dele, o gasto passa de 17.",
      "esboco": "Cada tentativa faz a comparação numérica e mostra se o ponto pertence. Repetir um valor não avança; explorar não soma erros."
    },
    {
      "tipo": "aposta",
      "pergunta": "De $3x\\le15$, dividir os dois lados por 3 dá:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "3x\\le15"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "$x\\le5$",
          "explica": "O divisor 3 é positivo. A ordem se mantém.",
          "certa": true
        },
        {
          "texto": "$x\\ge5$",
          "explica": "Dividir por positivo não inverte a ordem. 6 já dá 18 > 15.",
          "erro": "ineq-inverte-positivo"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "ideia",
      "texto": "A conta fornece todos os valores que servem. Na compra, ainda devemos exigir **quantidades inteiras e não negativas**.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 7,
            "intervalos": [
              {
                "de": 0,
                "ate": 5,
                "incluiDe": true,
                "incluiAte": true
              }
            ],
            "rotulo": "0\\le x\\le5"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "esboco": "A frase conecta a descoberta visual ao próximo raciocínio, sem repetir uma definição."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se $2x+1<2x+4$, tirar 2x dos dois lados deixa $1<4$. Quem serve?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2x+1<2x+4",
            "1<4"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Todo número real",
          "explica": "A comparação é verdadeira qualquer que seja x.",
          "certa": true
        },
        {
          "texto": "Só x = 0",
          "explica": "As letras se cancelaram; não foram igualadas a zero.",
          "erro": "ineq-cancelou-x-zero"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "anote",
      "titulo": "Resolver uma inequação",
      "definicao": "Resolva por operações que preservam o conjunto de soluções. Depois confira os limites na inequação original.",
      "exemplo": {
        "tex": "\\begin{gathered}3x+2\\le17\\\\3x\\le15\\\\x\\le5\\end{gathered}",
        "fala": "Subtraia dois dos dois lados, depois divida por três: x menor ou igual a cinco."
      },
      "alerta": "Somar ou subtrair a mesma quantidade mantém a ordem. Dividir por positivo também mantém.",
      "esboco": "O caderno reúne a definição, um exemplo exato e o cuidado que evita o erro central."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $2(x+1)\\le x+7$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2(x+1)\\le x+7"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "passos": [
        {
          "pergunta": "Depois da distributiva, qual é a comparação?",
          "opcoes": [
            {
              "texto": "$2x+2\\le x+7$",
              "explica": "O 2 multiplica x e também 1.",
              "certa": true
            },
            {
              "texto": "$2x+1\\le x+7$",
              "explica": "São dois grupos de (x + 1): o 1 também dobra.",
              "erro": "ineq-distributiva"
            }
          ],
          "linha": {
            "tex": "2x+2\\le x+7",
            "fala": "Dois x mais dois é menor ou igual a x mais sete."
          }
        },
        {
          "pergunta": "Subtraia x e depois 2 dos dois lados. O que fica?",
          "opcoes": [
            {
              "texto": "$x\\le5$",
              "explica": "O conjunto inclui 5 e todos os reais menores.",
              "certa": true
            },
            {
              "texto": "$x=5$",
              "explica": "5 é só a fronteira. 4 também satisfaz a original.",
              "erro": "inequacao-como-equacao"
            }
          ],
          "linha": {
            "tex": "x\\le5",
            "fala": "x é menor ou igual a cinco."
          }
        }
      ],
      "esboco": "O aluno decide cada etapa. A conta escrita mostra a operação e preserva o conjunto de soluções."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se $2x+5\\le2x+3$, sobra $5\\le3$. Há solução?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "5\\le3"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Nenhuma",
          "explica": "5 ≤ 3 é falso, independentemente de x.",
          "certa": true
        },
        {
          "texto": "Todos os reais",
          "explica": "As letras sumirem não basta: é preciso ler a comparação que restou.",
          "erro": "ineq-contradicao-todos"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "caderno",
      "instrucao": "Resolva $4x-3\\le13$. Digite o **maior inteiro** que serve.",
      "resposta": 4,
      "sinal": true,
      "resolucao": [
        {
          "tex": "4x\\le16",
          "fala": "Some três dos dois lados."
        },
        {
          "tex": "x\\le4",
          "fala": "Divida por quatro, que é positivo."
        },
        {
          "tex": "4\\cdot4-3=13",
          "fala": "Quatro entra: dá o empate permitido."
        }
      ],
      "esboco": "Resolva no papel; digite apenas o número pedido e confira as etapas e as bordas."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "inequacao-linear-n1",
        "inequacao-linear-n2",
        "inequacao-linear-n3"
      ],
      "esboco": "Três níveis: visual e valores amigáveis, caso que pega e resolução independente sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Cabem **0 a 5 unidades inteiras**. A conta deu x ≤ 5; a situação decidiu quais desses números podem ser quantidades.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 7,
            "intervalos": [
              {
                "de": 0,
                "ate": 5,
                "incluiDe": true,
                "incluiAte": true
              }
            ],
            "rotulo": "0\\le x\\le5"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "esboco": "Responde à pergunta inicial e abre o próximo conceito."
    }
  ]
}
