import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U5.A6",
  "titulo": "Inequações do 2º grau",
  "objetivo": "Resolver inequações quadráticas pelo sinal após fatorar, tratando coeficiente negativo, raiz dupla e ausência de raízes reais.",
  "modelo": "reta",
  "esboco": "Da situação às tentativas na reta, depois à escrita simbólica, com perguntas que explicam cada transformação e seus limites.",
  "vega": "x²−5x+4<0 fatora em (x−1)(x−4)<0 e dá ]1;4[. Resolver a equação associada acha fronteiras, não a faixa. Para −x²+5x−4≥0, multiplicar a inequação inteira por −1 inverte ≥ para ≤: fica x²−5x+4≤0, solução [1;4]. Não usar sinal de dentro/fora sem olhar o coeficiente. Raiz dupla: (x−2)²≥0 é todo real; >0 exclui só 2; <0 não tem solução; ≤0 aceita só 2. Sem raízes: x²+1>0 vale para todo real, x²+1<0 para nenhum; justifique pelo quadrado, não pela ausência de raízes sozinha. Generalize com completar quadrado e a>0 ou a<0. Não antecipar o gráfico da parábola, que nasce em função quadrática.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Na unidade anterior, $x^2-5x+4=0$ tinha duas raízes. E se quisermos $x^2-5x+4<0$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x^2-5x+4<0"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A situação abre uma pergunta real antes de apresentar a regra."
    },
    {
      "tipo": "aposta",
      "pergunta": "O que muda ao trocar = 0 por < 0?",
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
          "texto": "Precisamos das faixas de produto negativo",
          "explica": "As raízes apenas marcam onde o produto zera.",
          "certa": true
        },
        {
          "texto": "Nada: a resposta continua só 1 e 4",
          "explica": "Em 1 e 4, o resultado é zero, que não é negativo.",
          "erro": "ineq-so-raizes"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "mexa",
      "texto": "Agora o coeficiente de x² é negativo. Teste $-x^2+5x-4\\ge0$.",
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
                "incluiDe": true,
                "incluiAte": true
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
                -1,
                5,
                -4
              ],
              "relacao": ">=",
              "direita": 0
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
      "descoberta": "Com o sinal negativo na frente, a região não negativa fica entre as raízes, incluindo as duas.",
      "esboco": "Cada tentativa faz a comparação numérica e mostra se o ponto pertence. Repetir um valor não avança; explorar não soma erros."
    },
    {
      "tipo": "aposta",
      "pergunta": "Multiplicando $-x^2+5x-4\\ge0$ por −1, fica:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "-x^2+5x-4\\ge0"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "$x^2-5x+4\\le0$",
          "explica": "A multiplicação por negativo inverte ≥ para ≤.",
          "certa": true
        },
        {
          "texto": "$x^2-5x+4\\ge0$",
          "explica": "Trocar só os sinais dos termos sem inverter muda as soluções.",
          "erro": "ineq-nao-inverte-negativo"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "ideia",
      "texto": "A fatoração permite estudar os sinais. Mas algumas quadráticas têm **um zero só ou nenhum zero real**.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x-2)^2",
            "x^2+1"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A frase conecta a descoberta visual ao próximo raciocínio, sem repetir uma definição."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em $(x-2)^2>0$, quais reais servem?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x-2)^2>0"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Todos, exceto 2",
          "explica": "Um quadrado é positivo quando a base é diferente de zero.",
          "certa": true
        },
        {
          "texto": "Só x > 2",
          "explica": "x = 1 dá (−1)² = 1, também positivo. A raiz dupla não troca o sinal.",
          "erro": "ineq-raiz-dupla-troca"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "anote",
      "titulo": "Inequação do 2º grau",
      "definicao": "Leve tudo para um lado. Ache os zeros reais e estude o sinal da expressão em cada faixa e nas bordas.",
      "exemplo": {
        "tex": "\\begin{gathered}x^2-5x+4\\le0\\\\(x-1)(x-4)\\le0\\\\x\\in[1;4]\\end{gathered}",
        "fala": "Fatorando, o produto é não positivo de um a quatro, incluindo as raízes."
      },
      "alerta": "Olhe o coeficiente de x². Raiz dupla e ausência de raízes exigem conferir o sinal, não decorar dentro ou fora.",
      "esboco": "O caderno reúne a definição, um exemplo exato e o cuidado que evita o erro central."
    },
    {
      "tipo": "passo",
      "problema": "Compare os casos sem duas raízes distintas.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(x-2)^2",
            "x^2+1"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "passos": [
        {
          "pergunta": "Quem resolve $(x-2)^2\\le0$?",
          "opcoes": [
            {
              "texto": "Só x = 2",
              "explica": "Quadrado nunca é negativo. Só o zero é permitido.",
              "certa": true
            },
            {
              "texto": "Todos os reais",
              "explica": "Com x = 3 o quadrado é 1, e 1 ≤ 0 é falso.",
              "erro": "ineq-quadrado-sempre-serve"
            }
          ],
          "linha": {
            "tex": "(x-2)^2\\le0\\Longleftrightarrow x=2",
            "fala": "Só x igual a dois."
          }
        },
        {
          "pergunta": "E $x^2+1<0$?",
          "opcoes": [
            {
              "texto": "Nenhum real",
              "explica": "x² ≥ 0, então x² + 1 ≥ 1. Nunca é negativo.",
              "certa": true
            },
            {
              "texto": "Todos os reais, pois não há raízes",
              "explica": "Não ter raízes não decide a desigualdade. Aqui o sinal é sempre positivo.",
              "erro": "ineq-sem-raizes-sem-sinal"
            }
          ],
          "linha": {
            "tex": "x^2+1\\ge1>0",
            "fala": "x ao quadrado mais um é pelo menos um."
          }
        }
      ],
      "esboco": "O aluno decide cada etapa. A conta escrita mostra a operação e preserva o conjunto de soluções."
    },
    {
      "tipo": "aposta",
      "pergunta": "A mesma expressão $x^2+1>0$ tem:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x^2+1>0"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Todos os reais como solução",
          "explica": "O sinal é sempre positivo, qualquer que seja x.",
          "certa": true
        },
        {
          "texto": "Nenhuma solução, pois não há raízes",
          "explica": "A pergunta pede positivo, não zero. x = 0 já dá 1 > 0.",
          "erro": "ineq-so-raizes"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "caderno",
      "instrucao": "Resolva $x^2-4x+4\\le0$. Digite o único valor que serve.",
      "resposta": 2,
      "sinal": true,
      "resolucao": [
        {
          "tex": "x^2-4x+4=(x-2)^2",
          "fala": "É o quadrado de x menos dois."
        },
        {
          "tex": "(x-2)^2\\le0\\Longleftrightarrow(x-2)^2=0",
          "fala": "Um quadrado não é negativo; resta o zero."
        },
        {
          "tex": "x=2",
          "fala": "Só o valor dois atende."
        }
      ],
      "esboco": "Resolva no papel; digite apenas o número pedido e confira as etapas e as bordas."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "inequacao-quadratica-n1",
        "inequacao-quadratica-n2",
        "inequacao-quadratica-n3"
      ],
      "esboco": "Três níveis: visual e valores amigáveis, caso que pega e resolução independente sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Em $x^2-5x+4<0$, a solução é **]1; 4[**. As raízes marcaram as bordas; os sinais decidiram a faixa.",
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
