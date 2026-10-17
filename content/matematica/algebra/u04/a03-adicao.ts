import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U4.A3",
  "titulo": "Somar para eliminar",
  "objetivo": "Entender e aplicar a adição de igualdades com coeficientes opostos, recuperar a outra incógnita e distinguir consequência de sistema equivalente.",
  "modelo": "livre",
  "esboco": "A soma x+y=12 e a diferença x−y=4 se juntam. +y e −y cancelam; os dois lados são somados, deixando 2x=16.",
  "vega": "Somar igualdades é válido: se A=B e C=D, então A+C=B+D. +y e −y somam zero, não dois y. x+x é 2x, não x². A soma dá uma consequência; sozinha pode admitir pares que não satisfazem as originais. Conserve uma original para recuperar y. Com x=8, x+y=12 dá y=4. Um par como (8,0) satisfaz 2x=16 mas não o sistema: use o contraexemplo para delimitar o método. O nome método da adição aparece depois da manipulação. Os exercícios incluem coeficientes opostos diferentes de um e negativos.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Em $x+y=12$ e $x-y=4$, as duas letras aparecem nas duas linhas. Uma delas pode desaparecer?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                1,
                12
              ],
              [
                1,
                -1,
                4
              ]
            ],
            "modo": "somar",
            "fatores": [
              1,
              1
            ],
            "etapa": 1
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "esboco": "A coluna de y tem termos opostos, ainda sem a soma pronta."
    },
    {
      "tipo": "aposta",
      "pergunta": "Quanto dá $y+(-y)$, qualquer que seja y?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "y+(-y)=?"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "$0$",
          "explica": "Um número e seu oposto se cancelam. Por exemplo: 3 + (−3) = 0.",
          "certa": true
        },
        {
          "texto": "$2y$",
          "explica": "Isso seria y + y. Aqui o segundo termo é −y.",
          "erro": "sistema-sinais-na-soma"
        }
      ],
      "esboco": "A razão do cancelamento precede o procedimento."
    },
    {
      "tipo": "mexa",
      "texto": "Some as duas igualdades. Observe a coluna de y e o lado dos números.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                1,
                12
              ],
              [
                1,
                -1,
                4
              ]
            ],
            "modo": "somar",
            "fatores": [
              1,
              1
            ],
            "etapa": 1
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Toque para somar os dois lados.",
        "sucesso": {
          "somado": true
        },
        "mostre": "À esquerda, x + x e y − y; à direita, 12 + 4."
      },
      "descoberta": "O resultado é 2x = 16. A incógnita y se cancelou.",
      "esboco": "A soma é feita em ambos os lados e não só nos termos de letras."
    },
    {
      "tipo": "aposta",
      "pergunta": "Por que o lado direito virou 16?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                1,
                12
              ],
              [
                1,
                -1,
                4
              ]
            ],
            "modo": "somar",
            "fatores": [
              1,
              1
            ],
            "etapa": 2
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "opcoes": [
        {
          "texto": "Porque 12 + 4 = 16",
          "explica": "Somamos as duas expressões da esquerda e também as duas da direita.",
          "certa": true
        },
        {
          "texto": "Porque só podemos somar as letras",
          "explica": "Se somamos as esquerdas, precisamos somar as direitas para preservar a igualdade.",
          "erro": "sistema-soma-so-esquerda"
        }
      ],
      "esboco": "Explicita a igualdade que sustenta o método."
    },
    {
      "tipo": "ideia",
      "texto": "De $2x=16$ vem **x = 8**. Para descobrir y, conservamos uma das equações originais.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2x=16",
            "x=8",
            "8+y=12"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "esboco": "Não apaga a segunda informação do sistema."
    },
    {
      "tipo": "aposta",
      "pergunta": "O par $(8,0)$ satisfaz $2x=16$. Ele resolve o sistema original?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                1,
                1,
                12
              ],
              [
                1,
                -1,
                4
              ]
            ],
            "par": [
              8,
              0
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "opcoes": [
        {
          "texto": "Não: 8 + 0 não dá 12",
          "explica": "A equação somada não substitui sozinha as duas condições.",
          "certa": true
        },
        {
          "texto": "Sim: já encontramos x",
          "explica": "Ainda precisamos de y e da conferência nas equações originais.",
          "erro": "sistema-soma-perde-condicao"
        }
      ],
      "esboco": "Contraexemplo mostra por que precisamos voltar a uma original."
    },
    {
      "tipo": "anote",
      "titulo": "Método da adição",
      "definicao": "Some as equações para cancelar termos opostos. Resolva a incógnita restante e use uma original para achar a outra.",
      "exemplo": {
        "tex": "\\begin{gathered}(x+y)+(x-y)=12+4\\\\2x=16\\Rightarrow x=8\\\\8+y=12\\Rightarrow y=4\\end{gathered}",
        "fala": "Somando, dois x é dezesseis. x é oito; voltando, y é quatro."
      },
      "alerta": "A equação somada é uma consequência. Guarde uma original para completar o par.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $2x+y=11$ e $x-y=1$ por adição.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "sistema": {
            "equacoes": [
              [
                2,
                1,
                11
              ],
              [
                1,
                -1,
                1
              ]
            ],
            "modo": "somar",
            "fatores": [
              1,
              1
            ],
            "etapa": 1
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "passos": [
        {
          "pergunta": "Qual é o resultado da soma?",
          "opcoes": [
            {
              "texto": "$3x=12$",
              "explica": "2x + x = 3x; y − y = 0; 11 + 1 = 12.",
              "certa": true
            },
            {
              "texto": "$3x+2y=12$",
              "explica": "Os y têm sinais opostos: sua soma é zero.",
              "erro": "sistema-sinais-na-soma"
            }
          ],
          "linha": {
            "tex": "3x=12\\Rightarrow x=4",
            "fala": "Três x é doze: x é quatro."
          }
        },
        {
          "pergunta": "Use $x-y=1$. Quanto vale y?",
          "opcoes": [
            {
              "texto": "$3$",
              "explica": "4 − y = 1, então y = 3.",
              "certa": true
            },
            {
              "texto": "$5$",
              "explica": "Confira: 4 − 5 = −1, diferente de 1.",
              "erro": "sistema-volta-sinal"
            }
          ],
          "linha": {
            "tex": "4-y=1\\Rightarrow y=3",
            "fala": "Quatro menos y é um: y vale três."
          }
        }
      ],
      "esboco": "Coeficientes diferentes de x mostram que se somam termos semelhantes."
    },
    {
      "tipo": "aposta",
      "pergunta": "Em $2x+x$, por que não aparece $x^2$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2x+x=3x"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "Estamos somando parcelas",
          "explica": "2 grupos de x mais 1 grupo de x são 3 grupos de x.",
          "certa": true
        },
        {
          "texto": "Porque x nunca pode ter quadrado",
          "explica": "x pode ter quadrado, mas x² aparece em x · x, não em 2x + x.",
          "erro": "sistema-soma-vira-produto"
        }
      ],
      "esboco": "Separa adição e multiplicação de incógnitas."
    },
    {
      "tipo": "caderno",
      "instrucao": "Some $x+2y=11$ e $x-2y=-1$. Digite y depois de resolver o sistema.",
      "resposta": 3,
      "sinal": true,
      "resolucao": [
        {
          "tex": "2x=10\\Rightarrow x=5",
          "fala": "Os termos de y se cancelam; dois x é dez."
        },
        {
          "tex": "5+2y=11",
          "fala": "Substitua x na primeira original."
        },
        {
          "tex": "2y=6\\Rightarrow y=3",
          "fala": "y vale três."
        },
        {
          "tex": "5+6=11\\quad\\text{e}\\quad5-6=-1",
          "fala": "Os dois totais conferem."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "sistema-somar-n1",
        "sistema-somar-n2",
        "sistema-somar-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Os termos **+y e −y** se cancelaram. Quando os coeficientes não são opostos, podemos prepará-los.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x=8",
            "y=4"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
