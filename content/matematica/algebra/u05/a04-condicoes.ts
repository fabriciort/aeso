import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U5.A4",
  "titulo": "Juntar condições",
  "objetivo": "Representar interseção e união de intervalos, interpretar E e OU e reconhecer interseção vazia ou reduzida a uma borda.",
  "modelo": "reta",
  "esboco": "Da situação às tentativas na reta, depois à escrita simbólica, com perguntas que explicam cada transformação e seus limites.",
  "vega": "Em x≥1 E x<5, o mesmo x deve atender às duas condições: interseção [1;5[. Em x<1 OU x>5, basta uma condição: união de duas faixas. OU é inclusivo: um número que satisfaz ambas também entra. Usar exemplos concretos como entrega entre um horário mínimo e um máximo, sem apresentar regulamento real. Não trocar E por OU. Intervalos podem não se encontrar; se x≥3 E x≤3, resta só 3. Se x>3 E x≤3, nenhum número serve. Na cadeia −1≤2x+1<7, subtraia 1 dos três membros e divida os três por 2 positivo. Não introduzir inequações racionais nesta unidade.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Uma entrega deve ocorrer a partir da hora 1 e antes da hora 5. Quais horários atendem **aos dois limites**?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x\\ge1",
            "x<5"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A situação abre uma pergunta real antes de apresentar a regra."
    },
    {
      "tipo": "aposta",
      "pergunta": "O horário x = 6 atende às duas condições?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 7,
            "intervalos": [
              {
                "de": 1,
                "ate": null,
                "incluiDe": true,
                "incluiAte": false
              }
            ]
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "Não: atende ao início, mas passa do fim",
          "explica": "6 ≥ 1, mas 6 < 5 é falso.",
          "certa": true
        },
        {
          "texto": "Sim: 6 é maior que 1",
          "explica": "Com E, satisfazer só uma condição não basta.",
          "erro": "ineq-confunde-e-ou"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "mexa",
      "texto": "Teste os horários. O mesmo x precisa respeitar as duas linhas.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 7,
            "intervalos": [
              {
                "de": 1,
                "ate": 5,
                "incluiDe": true,
                "incluiAte": false
              }
            ],
            "candidatos": [
              0,
              1,
              3,
              5,
              6
            ],
            "ocultar": true,
            "linhas": [
              {
                "titulo": "A partir de 1",
                "intervalos": [
                  {
                    "de": 1,
                    "ate": null,
                    "incluiDe": true,
                    "incluiAte": false
                  }
                ]
              },
              {
                "titulo": "Antes de 5",
                "intervalos": [
                  {
                    "de": null,
                    "ate": 5,
                    "incluiDe": false,
                    "incluiAte": false
                  }
                ]
              }
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
      "descoberta": "As duas faixas se sobrepõem de 1 incluído até 5 excluído.",
      "esboco": "Cada tentativa faz a comparação numérica e mostra se o ponto pertence. Repetir um valor não avança; explorar não soma erros."
    },
    {
      "tipo": "aposta",
      "pergunta": "Com E, qual faixa fica?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 7,
            "intervalos": [
              {
                "de": 1,
                "ate": 5,
                "incluiDe": true,
                "incluiAte": false
              }
            ],
            "rotulo": "[1;5["
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "$[1;5[$",
          "explica": "É a parte comum: x ≥ 1 e x < 5 ao mesmo tempo.",
          "certa": true
        },
        {
          "texto": "$]-\\infty;5[\\cup[1;+\\infty[$",
          "explica": "Isso junta qualquer uma das condições. A pergunta exige as duas.",
          "erro": "ineq-confunde-e-ou"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "ideia",
      "texto": "Com **OU**, basta atender a uma condição. As faixas se juntam, mesmo quando ficam separadas.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -2,
            "ate": 8,
            "intervalos": [
              {
                "de": null,
                "ate": 1,
                "incluiDe": false,
                "incluiAte": false
              },
              {
                "de": 5,
                "ate": null,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "rotulo": "x<1\\;\\text{ ou }\\;x>5"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "esboco": "A frase conecta a descoberta visual ao próximo raciocínio, sem repetir uma definição."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em $x<1$ **OU** $x>5$, o 3 entra?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -2,
            "ate": 8,
            "intervalos": [
              {
                "de": null,
                "ate": 1,
                "incluiDe": false,
                "incluiAte": false
              },
              {
                "de": 5,
                "ate": null,
                "incluiDe": false,
                "incluiAte": false
              }
            ]
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "Não: não atende a nenhuma das duas",
          "explica": "3 não é menor que 1 nem maior que 5.",
          "certa": true
        },
        {
          "texto": "Sim: está entre as bordas",
          "explica": "As soluções são as faixas de fora; o intervalo do meio fica excluído.",
          "erro": "ineq-escolhe-meio-ou"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "anote",
      "titulo": "Interseção e união",
      "definicao": "E pede a parte comum: interseção. OU reúne quem atende a pelo menos uma condição: união.",
      "exemplo": {
        "tex": "\\begin{gathered}x\\ge1\\text{ e }x<5\\\\\\Longleftrightarrow[1;5[\\\\x<1\\text{ ou }x>5\\\\\\Longleftrightarrow]-\\infty;1[\\cup]5;+\\infty[\\end{gathered}",
        "fala": "E seleciona a sobreposição; ou junta as faixas. O símbolo de união reúne os dois intervalos."
      },
      "alerta": "OU também aceita quem atende às duas condições. E pode deixar um ponto só ou nenhum.",
      "esboco": "O caderno reúne a definição, um exemplo exato e o cuidado que evita o erro central."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $-1\\le2x+1<7$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "-1\\le2x+1<7"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "passos": [
        {
          "pergunta": "Subtraindo 1 de cada um dos três membros, fica:",
          "opcoes": [
            {
              "texto": "$-2\\le2x<6$",
              "explica": "Os três valores recebem a mesma subtração.",
              "certa": true
            },
            {
              "texto": "$-1\\le2x<6$",
              "explica": "O limite esquerdo também precisa perder 1.",
              "erro": "ineq-cadeia-incompleta"
            }
          ],
          "linha": {
            "tex": "-2\\le2x<6",
            "fala": "Menos dois é menor ou igual a dois x, que é menor que seis."
          }
        },
        {
          "pergunta": "Divida os três por 2. Qual é a faixa?",
          "opcoes": [
            {
              "texto": "$[-1;3[$",
              "explica": "−1 entra e 3 fica de fora.",
              "certa": true
            },
            {
              "texto": "$]-1;3]$",
              "explica": "A divisão por positivo mantém os dois tipos de borda.",
              "erro": "ineq-exclui-igualdade"
            }
          ],
          "linha": {
            "tex": "-1\\le x<3",
            "fala": "x está de menos um incluído até três excluído."
          }
        }
      ],
      "esboco": "O aluno decide cada etapa. A conta escrita mostra a operação e preserva o conjunto de soluções."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se $x\\ge3$ **E** $x\\le3$, quem serve?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 0,
            "ate": 6,
            "intervalos": [
              {
                "de": 3,
                "ate": 3,
                "incluiDe": true,
                "incluiAte": true
              }
            ],
            "rotulo": "x=3"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "Só 3",
          "explica": "É o único valor que satisfaz as duas comparações.",
          "certa": true
        },
        {
          "texto": "Ninguém",
          "explica": "As duas permitem igualdade. O ponto 3 pertence a ambas.",
          "erro": "ineq-intersecao-ponto"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "caderno",
      "instrucao": "Em $x>3$ E $x\\le3$, quantos números reais servem?",
      "resposta": 0,
      "sinal": true,
      "resolucao": [
        {
          "tex": "x>3\\quad\\text{e}\\quad x\\le3",
          "fala": "O mesmo número teria que superar três e não superar três."
        },
        {
          "tex": "\\varnothing",
          "fala": "Nenhum número: o conjunto vazio."
        }
      ],
      "esboco": "Resolva no papel; digite apenas o número pedido e confira as etapas e as bordas."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "inequacao-condicoes-n1",
        "inequacao-condicoes-n2",
        "inequacao-condicoes-n3"
      ],
      "esboco": "Três níveis: visual e valores amigáveis, caso que pega e resolução independente sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "A entrega cabe em **[1; 5[**: começa em 1 e termina antes de 5. Agora vamos descobrir faixas pelo sinal de produtos.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 7,
            "intervalos": [
              {
                "de": 1,
                "ate": 5,
                "incluiDe": true,
                "incluiAte": false
              }
            ],
            "rotulo": "[1;5["
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "esboco": "Responde à pergunta inicial e abre o próximo conceito."
    }
  ]
}
