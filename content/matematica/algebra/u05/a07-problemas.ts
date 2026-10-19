import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U5.A7",
  "titulo": "Problemas com limites",
  "objetivo": "Modelar limites com sinais coerentes, resolver e impor as restrições de contagem ou medida, incluindo limites quadráticos de área.",
  "modelo": "reta",
  "esboco": "Da situação às tentativas na reta, depois à escrita simbólica, com perguntas que explicam cada transformação e seus limites.",
  "vega": "Orçamento de 50 reais com taxa fixa de 8 e itens de 6: 8+6x≤50 implica x≤7; contagens inteiras não negativas dão 0 a 7 itens. Ultrapassar uma meta é >, atingir pelo menos é ≥. Para quantidade inteira e x<5,7, maior inteiro é 5; não arredonde para o mais próximo. Medidas contínuas podem aceitar frações. Um jardim de lados x e x+3 com área no máximo 10 dá x²+3x−10≤0, faixa algébrica [−5;2], mas comprimentos exigem x>0: fica ]0;2]. Não transformar o comprimento zero em jardim. Valide a solução e um valor proibido na situação original, além da desigualdade. Não buscar um único valor quando a situação permite toda uma faixa.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Você tem **R$ 50**. A entrega custa R$ 8 e cada item, R$ 6. Quantos itens pode comprar sem passar do orçamento?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "8+6x\\le50"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A situação abre uma pergunta real antes de apresentar a regra."
    },
    {
      "tipo": "aposta",
      "pergunta": "Sem passar de R$ 50 permite gastar exatamente R$ 50?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "8+6x\\;?\\;50"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Sim: usamos ≤",
          "explica": "O teto inclui o empate.",
          "certa": true
        },
        {
          "texto": "Não: usamos <",
          "explica": "Sem passar aceita ficar no limite. Gastar menos exigiria <.",
          "erro": "ineq-linguagem-limite"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "mexa",
      "texto": "Teste quantidades inteiras e confira o gasto antes de escolher o máximo.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 0,
            "ate": 10,
            "intervalos": [
              {
                "de": 0,
                "ate": 7,
                "incluiDe": true,
                "incluiAte": true
              }
            ],
            "candidatos": [
              0,
              6,
              7,
              8
            ],
            "ocultar": true,
            "teste": {
              "coeficientes": [
                0,
                6,
                8
              ],
              "relacao": "<=",
              "direita": 50
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
      "descoberta": "Sete itens custam exatamente 50; oito ultrapassam o orçamento.",
      "esboco": "Cada tentativa faz a comparação numérica e mostra se o ponto pertence. Repetir um valor não avança; explorar não soma erros."
    },
    {
      "tipo": "aposta",
      "pergunta": "De $x\\le7$, a compra permite quais quantidades?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": -1,
            "ate": 9,
            "intervalos": [
              {
                "de": 0,
                "ate": 7,
                "incluiDe": true,
                "incluiAte": true
              }
            ]
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "0, 1, 2, 3, 4, 5, 6 ou 7 itens",
          "explica": "A quantidade deve ser inteira e não negativa.",
          "certa": true
        },
        {
          "texto": "Qualquer real menor que 7",
          "explica": "Não compramos uma quantidade negativa ou uma parte deste item inteiro.",
          "erro": "ineq-ignora-contexto"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "ideia",
      "texto": "O conjunto algébrico ainda precisa respeitar a situação: **contagem, medida e positividade** mudam o que pode entrar.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x\\le7",
            "x\\in\\{0,1,2,3,4,5,6,7\\}"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A frase conecta a descoberta visual ao próximo raciocínio, sem repetir uma definição."
    },
    {
      "tipo": "aposta",
      "pergunta": "Uma conta deu $x<5{,}7$ para caixas inteiras. Qual é o máximo?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x<5{,}7"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "5 caixas",
          "explica": "5 cabe no limite; 6 já é maior que 5,7.",
          "certa": true
        },
        {
          "texto": "6 caixas",
          "explica": "Arredondar para o mais próximo pode violar o limite.",
          "erro": "ineq-arredonda-limite"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "anote",
      "titulo": "Conferir um limite",
      "definicao": "Traduza o limite, resolva e selecione os valores permitidos pelo contexto. Confira a fronteira na situação original.",
      "exemplo": {
        "tex": "\\begin{gathered}8+6x\\le50\\Longrightarrow x\\le7\\\\x\\in\\{0,1,2,3,4,5,6,7\\}\\end{gathered}",
        "fala": "A conta dá x menor ou igual a sete. Para itens inteiros, de zero a sete."
      },
      "alerta": "No máximo inclui igualdade. Mais que exclui. Quantidades inteiras não se arredondam sem conferir o limite.",
      "esboco": "O caderno reúne a definição, um exemplo exato e o cuidado que evita o erro central."
    },
    {
      "tipo": "passo",
      "problema": "Um jardim tem lados x e x + 3, em metros. Sua área deve ser **no máximo 10 m²**.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x(x+3)\\le10"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "passos": [
        {
          "pergunta": "Levando tudo para um lado e fatorando, fica:",
          "opcoes": [
            {
              "texto": "$(x+5)(x-2)\\le0$",
              "explica": "x² + 3x − 10 é o produto desses dois fatores.",
              "certa": true
            },
            {
              "texto": "$(x+5)(x-2)=0$",
              "explica": "A equação encontra bordas; ainda precisamos de todas as áreas até 10.",
              "erro": "inequacao-como-equacao"
            }
          ],
          "linha": {
            "tex": "(x+5)(x-2)\\le0",
            "fala": "x mais cinco vezes x menos dois é não positivo."
          }
        },
        {
          "pergunta": "A álgebra dá $-5\\le x\\le2$. Quais valores servem como lado do jardim?",
          "opcoes": [
            {
              "texto": "$0<x\\le2$",
              "explica": "Um comprimento é positivo. O 2 dá área 10 e entra.",
              "certa": true
            },
            {
              "texto": "$-5\\le x\\le2$",
              "explica": "Valores negativos ou zero não formam o lado deste jardim.",
              "erro": "ineq-ignora-contexto"
            }
          ],
          "linha": {
            "tex": "x\\in]0;2]",
            "fala": "x é positivo e no máximo dois."
          }
        }
      ],
      "esboco": "O aluno decide cada etapa. A conta escrita mostra a operação e preserva o conjunto de soluções."
    },
    {
      "tipo": "aposta",
      "pergunta": "Um corte de tecido deve medir menos de 2 m. Um corte de 1,8 m pode servir?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 0,
            "ate": 3,
            "intervalos": [
              {
                "de": 0,
                "ate": 2,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "rotulo": "0<x<2"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "Sim: medidas podem ser fracionárias",
          "explica": "1,8 é positivo e menor que 2.",
          "certa": true
        },
        {
          "texto": "Não: x precisa ser inteiro",
          "explica": "A exigência de inteiros era para contagem de caixas, não para comprimentos.",
          "erro": "ineq-so-inteiros"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "caderno",
      "instrucao": "Você já tem R$ 10 e guarda R$ 15 por mês. Após quantos meses terá **mais de R$ 100**, pela primeira vez?",
      "resposta": 7,
      "sinal": true,
      "resolucao": [
        {
          "tex": "10+15x>100",
          "fala": "Ultrapassar cem exige maior, sem igualdade."
        },
        {
          "tex": "15x>90\\Longrightarrow x>6",
          "fala": "Subtraia dez e divida por quinze."
        },
        {
          "tex": "x=7\\text{ meses}:\\quad10+15\\cdot7=115",
          "fala": "No sexto mês dá cem; no sétimo, cento e quinze."
        }
      ],
      "esboco": "Resolva no papel; digite apenas o número pedido e confira as etapas e as bordas."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "inequacao-problemas-n1",
        "inequacao-problemas-n2",
        "inequacao-problemas-n3"
      ],
      "esboco": "Três níveis: visual e valores amigáveis, caso que pega e resolução independente sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Você pode comprar **até 7 itens**. Agora sabe transformar limites em conjuntos e conferir o que cada solução significa.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "8+6\\cdot7=50",
            "8+6\\cdot8=56>50"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "Responde à pergunta inicial e abre o próximo conceito."
    }
  ]
}
