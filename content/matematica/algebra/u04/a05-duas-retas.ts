import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U4.A5",
  "titulo": "As duas retas do sistema",
  "objetivo": "Ligar pares às coordenadas do plano, interpretar interseção, paralelismo e coincidência e distinguir nenhuma, uma e infinitas soluções.",
  "modelo": "plano",
  "esboco": "Cada igualdade desenha uma reta de pares. A solução comum é o encontro. Depois duas paralelas e duas equações da mesma reta ligam 0=3 e 0=0 aos conjuntos de soluções.",
  "vega": "Cada ponto (x,y) de uma reta satisfaz sua equação. x+y=6 e x−y=2 se encontram em (4,2). A ordem das coordenadas importa. A solução do sistema precisa estar nas duas retas. Duas retas distintas podem ser paralelas e não ter ponto comum: x+y=6 e x+y=3, cuja subtração daria 0=3. Equações proporcionais como x+y=6 e 2x+2y=12 descrevem a mesma reta e infinitos pares comuns. A identidade 0=0 não fixa x nem y em zero: a condição original continua valendo. Não generalize esse critério para equações não lineares. A prática usa também retas vertical e horizontal e soluções negativas; o gráfico é apoio, a substituição confirma valores exatos.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Cada par que satisfaz $x+y=6$ vira um ponto de uma reta. Onde ficam os pares que atendem **às duas** equações?",
      "visual": {
        "modelo": "plano",
        "estado": {
          "x": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "x"
          },
          "y": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "y"
          },
          "retas": [
            {
              "a": -1,
              "b": 6,
              "destaque": "ambar",
              "rotulo": "x + y = 6"
            },
            {
              "a": 1,
              "b": -2,
              "destaque": "azul",
              "rotulo": "x − y = 2"
            }
          ],
          "coordenadas": true,
          "guias": true
        },
        "esboco": "Duas retas com cores distintas no mesmo plano. Um ponto comum deve pertencer às duas, com x antes de y."
      },
      "esboco": "Retoma coordenadas da Matemática Básica e mantém os nomes x e y."
    },
    {
      "tipo": "aposta",
      "pergunta": "O ponto (2, 4) está em $x+y=6$. Ele também está em $x-y=2$?",
      "visual": {
        "modelo": "plano",
        "estado": {
          "x": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "x"
          },
          "y": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "y"
          },
          "retas": [
            {
              "a": -1,
              "b": 6,
              "destaque": "ambar",
              "rotulo": "x + y = 6"
            },
            {
              "a": 1,
              "b": -2,
              "destaque": "azul",
              "rotulo": "x − y = 2"
            }
          ],
          "coordenadas": true,
          "guias": true,
          "pontos": {
            "P": [
              2,
              4
            ]
          }
        },
        "esboco": "Duas retas com cores distintas no mesmo plano. Um ponto comum deve pertencer às duas, com x antes de y."
      },
      "opcoes": [
        {
          "texto": "Não: 2 − 4 = −2",
          "explica": "Está na primeira reta, mas não na segunda.",
          "certa": true
        },
        {
          "texto": "Sim: basta estar numa reta",
          "explica": "A solução comum precisa estar nas duas. Aqui a diferença deu −2.",
          "erro": "sistema-grafico-uma-reta"
        }
      ],
      "esboco": "Um ponto de uma reta não é automaticamente solução do sistema."
    },
    {
      "tipo": "mexa",
      "texto": "Marque o ponto em que as duas retas se encontram.",
      "visual": {
        "modelo": "plano",
        "estado": {
          "x": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "x"
          },
          "y": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "y"
          },
          "retas": [
            {
              "a": -1,
              "b": 6,
              "destaque": "ambar",
              "rotulo": "x + y = 6"
            },
            {
              "a": 1,
              "b": -2,
              "destaque": "azul",
              "rotulo": "x − y = 2"
            }
          ],
          "coordenadas": true,
          "guias": true
        },
        "esboco": "Duas retas com cores distintas no mesmo plano. Um ponto comum deve pertencer às duas, com x antes de y."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Toque no ponto comum às duas retas.",
        "sucesso": {
          "ponto": [
            4,
            2
          ]
        },
        "mostre": "O encontro está em x = 4, y = 2."
      },
      "descoberta": "4 + 2 = 6 e 4 − 2 = 2: o ponto comum resolve as duas equações.",
      "esboco": "Marcação real no plano, com as duas retas visíveis."
    },
    {
      "tipo": "aposta",
      "pergunta": "No encontro (4, 2), qual conta confirma a segunda equação?",
      "visual": {
        "modelo": "plano",
        "estado": {
          "x": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "x"
          },
          "y": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "y"
          },
          "retas": [
            {
              "a": -1,
              "b": 6,
              "destaque": "ambar",
              "rotulo": "x + y = 6"
            },
            {
              "a": 1,
              "b": -2,
              "destaque": "azul",
              "rotulo": "x − y = 2"
            }
          ],
          "coordenadas": true,
          "guias": true,
          "pontos": {
            "P": [
              4,
              2
            ]
          }
        },
        "esboco": "Duas retas com cores distintas no mesmo plano. Um ponto comum deve pertencer às duas, com x antes de y."
      },
      "opcoes": [
        {
          "texto": "$4-2=2$",
          "explica": "x é a primeira coordenada; y é a segunda.",
          "certa": true
        },
        {
          "texto": "$2-4=2$",
          "explica": "A ordem foi trocada e 2 − 4 dá −2.",
          "erro": "sistema-troca-par"
        }
      ],
      "esboco": "A leitura gráfica volta à verificação algébrica."
    },
    {
      "tipo": "ideia",
      "texto": "Se duas retas se cruzam em um ponto, há **uma solução**. Mas nem todo par de retas se cruza.",
      "visual": {
        "modelo": "plano",
        "estado": {
          "x": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "x"
          },
          "y": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "y"
          },
          "retas": [
            {
              "a": -1,
              "b": 6,
              "destaque": "ambar",
              "rotulo": "x + y = 6"
            },
            {
              "a": 1,
              "b": -2,
              "destaque": "azul",
              "rotulo": "x − y = 2"
            }
          ],
          "coordenadas": true,
          "guias": true,
          "pontos": {
            "P": [
              4,
              2
            ]
          }
        },
        "esboco": "Duas retas com cores distintas no mesmo plano. Um ponto comum deve pertencer às duas, com x antes de y."
      },
      "esboco": "Prepara os casos que não apareceram nas aulas anteriores."
    },
    {
      "tipo": "aposta",
      "pergunta": "Agora $x+y=6$ e $x+y=3$. Existe um par que atende às duas?",
      "visual": {
        "modelo": "plano",
        "estado": {
          "x": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "x"
          },
          "y": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "y"
          },
          "retas": [
            {
              "a": -1,
              "b": 6,
              "destaque": "ambar"
            },
            {
              "a": -1,
              "b": 3,
              "destaque": "azul"
            }
          ],
          "coordenadas": true,
          "guias": true
        },
        "esboco": "Duas retas com cores distintas no mesmo plano. Um ponto comum deve pertencer às duas, com x antes de y."
      },
      "opcoes": [
        {
          "texto": "Não: a mesma soma não pode ser 6 e 3",
          "explica": "São retas paralelas distintas, sem ponto comum.",
          "certa": true
        },
        {
          "texto": "Sim: escolha x = 6 e y = 3",
          "explica": "6 + 3 = 9: esse par não atende a nenhuma das duas.",
          "erro": "sistema-paralelas-tem-solucao"
        }
      ],
      "esboco": "A impossibilidade aparece no significado das equações e no desenho."
    },
    {
      "tipo": "aposta",
      "pergunta": "E $x+y=6$ com $2x+2y=12$?",
      "visual": {
        "modelo": "plano",
        "estado": {
          "x": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "x"
          },
          "y": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "y"
          },
          "retas": [
            {
              "a": -1,
              "b": 6,
              "destaque": "ambar"
            },
            {
              "a": -1,
              "b": 6,
              "destaque": "azul",
              "tracejado": true
            }
          ],
          "coordenadas": true,
          "guias": true
        },
        "esboco": "Duas retas com cores distintas no mesmo plano. Um ponto comum deve pertencer às duas, com x antes de y."
      },
      "opcoes": [
        {
          "texto": "Infinitos pares: é a mesma reta",
          "explica": "A segunda igualdade é o dobro da primeira.",
          "certa": true
        },
        {
          "texto": "Só o par (0, 0)",
          "explica": "0 + 0 não dá 6. A reta inteira, e não a origem, atende às duas.",
          "erro": "sistema-identidade-zero"
        }
      ],
      "esboco": "Condições repetidas não selecionam apenas um ponto."
    },
    {
      "tipo": "anote",
      "titulo": "Sistemas e retas",
      "definicao": "Retas que se cruzam: uma solução. Paralelas distintas: nenhuma. Coincidentes: infinitas soluções.",
      "exemplo": {
        "tex": "\\begin{gathered}x+y=6\\\\2x+2y=12\\end{gathered}",
        "fala": "As duas equações descrevem a mesma reta: infinitos pares."
      },
      "alerta": "Se a eliminação dá 0 = 0, a condição original continua valendo. Isso não diz que x = y = 0.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Compare $x+y=6$ com $2x+2y=12$, depois com $2x+2y=15$.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x+y=6",
            "2x+2y=12"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "passos": [
        {
          "pergunta": "Subtraindo o dobro da primeira de $2x+2y=12$, sobra:",
          "opcoes": [
            {
              "texto": "$0=0$: a mesma condição",
              "explica": "A igualdade é sempre verdadeira, mas os pares ainda precisam somar 6.",
              "certa": true
            },
            {
              "texto": "$x=0$ e $y=0$",
              "explica": "Nenhuma letra foi fixada. (1,5) e (2,4) também servem.",
              "erro": "sistema-identidade-zero"
            }
          ],
          "linha": {
            "tex": "0=0\\quad\\text{(infinitas soluções)}",
            "fala": "Zero é zero: a condição se repetiu."
          }
        },
        {
          "pergunta": "Se o outro total fosse 15, sobraria $0=3$. Isso indica:",
          "opcoes": [
            {
              "texto": "Nenhuma solução",
              "explica": "Nenhum par torna 0 igual a 3.",
              "certa": true
            },
            {
              "texto": "Solução x = 0 e y = 3",
              "explica": "As letras se cancelaram. Zero igual a três é uma contradição.",
              "erro": "sistema-contradicao-par"
            }
          ],
          "linha": {
            "tex": "0=3\\quad\\text{(nenhuma solução)}",
            "fala": "Zero igual a três é impossível."
          }
        }
      ],
      "esboco": "Distingue identidade de contradição sem memorizar nomes isolados."
    },
    {
      "tipo": "caderno",
      "instrucao": "No sistema $x+y=6$ e $x-y=2$, calcule o ponto comum. Digite a coordenada **y**.",
      "resposta": 2,
      "sinal": true,
      "resolucao": [
        {
          "tex": "2x=8\\Rightarrow x=4",
          "fala": "Somando, x vale quatro."
        },
        {
          "tex": "4+y=6\\Rightarrow y=2",
          "fala": "Na primeira reta, y vale dois."
        },
        {
          "tex": "(x,y)=(4,2)",
          "fala": "O ponto comum é quatro, dois."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "sistema-retas-n1",
        "sistema-retas-n2",
        "sistema-retas-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "O encontro era **(4, 2)**. Um sistema de duas retas pode ter **uma, nenhuma ou infinitas soluções**.",
      "visual": {
        "modelo": "plano",
        "estado": {
          "x": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "x"
          },
          "y": {
            "de": -2,
            "ate": 8,
            "passo": 1,
            "numeros": true,
            "rotulo": "y"
          },
          "retas": [
            {
              "a": -1,
              "b": 6,
              "destaque": "ambar",
              "rotulo": "x + y = 6"
            },
            {
              "a": 1,
              "b": -2,
              "destaque": "azul",
              "rotulo": "x − y = 2"
            }
          ],
          "coordenadas": true,
          "guias": true,
          "pontos": {
            "P": [
              4,
              2
            ]
          }
        },
        "esboco": "Duas retas com cores distintas no mesmo plano. Um ponto comum deve pertencer às duas, com x antes de y."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
