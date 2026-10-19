import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U4.A1",
  "titulo": "Duas condições ao mesmo tempo",
  "objetivo": "Reconhecer a solução de um sistema como um par ordenado que satisfaz simultaneamente as duas equações, distinguindo uma condição das duas.",
  "modelo": "livre",
  "esboco": "Doze ingressos, dois preços e cem reais. Testar pares faz uma linha conferir sem a outra: o sistema exige as duas juntas.",
  "vega": "Defina x como quantidade de inteiras e y como quantidade de meias. Inteira custa 10 reais e meia 5 reais. Venderam-se 12 ingressos por 100 reais. x+y=12 representa quantidade; 10x+5y=100 representa dinheiro. O par (8,4) atende às duas. (6,6) atende só à primeira. A ordem importa porque cada letra mantém seu significado. Uma equação com duas incógnitas pode admitir muitos pares, mas as duas condições selecionam os comuns. Não prometa solução única para todo sistema: a aula das retas mostrará os outros casos. Sempre confira substituindo nas duas equações originais.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Foram vendidos **12 ingressos** por **R$ 100**. Inteira: R$ 10. Meia: R$ 5. Quantos de cada tipo?",
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
                10,
                5,
                100
              ]
            ],
            "rotulos": [
              "Quantidade",
              "Dinheiro"
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "esboco": "Os dois totais aparecem separados; ainda não sabemos como os ingressos se repartem."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se x conta inteiras e y conta meias, o que diz $x+y=12$?",
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
                10,
                5,
                100
              ]
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "opcoes": [
        {
          "texto": "A quantidade total",
          "explica": "Cada ingresso entra uma vez na contagem.",
          "certa": true
        },
        {
          "texto": "O dinheiro recebido",
          "explica": "Para contar reais, cada quantidade precisa ser multiplicada pelo seu preço.",
          "erro": "sistema-unidades"
        }
      ],
      "esboco": "Primeiro decide o significado da igualdade."
    },
    {
      "tipo": "mexa",
      "texto": "Teste os pares. Qual faz conferir **a quantidade e o dinheiro**?",
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
                10,
                5,
                100
              ]
            ],
            "pares": [
              [
                6,
                6
              ],
              [
                8,
                4
              ],
              [
                4,
                8
              ],
              [
                10,
                2
              ]
            ],
            "rotulos": [
              "Quantidade",
              "Dinheiro"
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Toque em um par e compare as duas linhas.",
        "sucesso": {
          "sistema": [
            8,
            4
          ]
        },
        "mostre": "Com x = 8 e y = 4: 12 ingressos e R$ 100."
      },
      "descoberta": "Um par só resolve o sistema quando as duas condições conferem.",
      "esboco": "A tentativa (6,6) é plausível: acerta a quantidade e erra a arrecadação."
    },
    {
      "tipo": "aposta",
      "pergunta": "Por que 6 inteiras e 6 meias não resolvem?",
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
                10,
                5,
                100
              ]
            ],
            "par": [
              6,
              6
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "opcoes": [
        {
          "texto": "Dão 12 ingressos, mas só R$ 90",
          "explica": "6 · 10 + 6 · 5 = 90. Falta atender ao total de dinheiro.",
          "certa": true
        },
        {
          "texto": "Porque 6 + 6 não dá 12",
          "explica": "A soma dá 12, sim. É a outra condição que falha.",
          "erro": "sistema-so-uma"
        }
      ],
      "esboco": "A justificativa usa a segunda condição, não uma rejeição vaga."
    },
    {
      "tipo": "ideia",
      "texto": "As letras representam **duas incógnitas**. Um sistema reúne condições que devem valer **ao mesmo tempo**.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x+y=12",
            "10x+5y=100"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "esboco": "Nomeia o sistema depois da experiência."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se sabemos apenas $x+y=12$, dá para decidir quantas inteiras foram vendidas?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "6+6=12",
            "8+4=12"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "Não: vários pares somam 12",
          "explica": "Precisamos também da condição sobre o dinheiro.",
          "certa": true
        },
        {
          "texto": "Sim: só pode ser 6 e 6",
          "explica": "8 e 4 também somam 12. Não há motivo para repartir igualmente.",
          "erro": "sistema-reparte-igual"
        }
      ],
      "esboco": "Evita transformar uma soma em duas quantidades iguais."
    },
    {
      "tipo": "anote",
      "titulo": "Solução de um sistema",
      "definicao": "É um par $(x,y)$ que faz **todas** as equações do sistema serem verdadeiras.",
      "exemplo": {
        "tex": "\\begin{gathered}8+4=12\\\\10\\cdot8+5\\cdot4=100\\end{gathered}",
        "fala": "Oito mais quatro dá doze. Dez vezes oito mais cinco vezes quatro dá cem."
      },
      "alerta": "A ordem importa: $(8,4)$ significa x = 8 e y = 4.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Confira o par $(4,8)$ no sistema dos ingressos.",
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
                10,
                5,
                100
              ]
            ],
            "par": [
              4,
              8
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "passos": [
        {
          "pergunta": "A quantidade confere?",
          "opcoes": [
            {
              "texto": "Sim: 4 + 8 = 12",
              "explica": "As duas quantidades somam 12.",
              "certa": true
            },
            {
              "texto": "Não: a ordem mudou",
              "explica": "A soma continua 12. Precisamos conferir a segunda equação.",
              "erro": "sistema-troca-par"
            }
          ],
          "linha": {
            "tex": "4+8=12",
            "fala": "Quatro mais oito dá doze."
          }
        },
        {
          "pergunta": "E o dinheiro?",
          "opcoes": [
            {
              "texto": "R$ 80: o par não resolve",
              "explica": "4 · 10 + 8 · 5 = 80, diferente de 100.",
              "certa": true
            },
            {
              "texto": "R$ 100: o par resolve",
              "explica": "São 4 inteiras, não 8: o dinheiro muda ao trocar as quantidades.",
              "erro": "sistema-troca-par"
            }
          ],
          "linha": {
            "tex": "10\\cdot4+5\\cdot8=80\\ne100",
            "fala": "Oitenta é diferente de cem."
          }
        }
      ],
      "esboco": "A ordem não afeta a soma, mas muda a receita."
    },
    {
      "tipo": "aposta",
      "pergunta": "No par $(8,4)$, qual é a quantidade de **meias**?",
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
                10,
                5,
                100
              ]
            ],
            "par": [
              8,
              4
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "opcoes": [
        {
          "texto": "4",
          "explica": "y conta meias e é o segundo número do par.",
          "certa": true
        },
        {
          "texto": "8",
          "explica": "O primeiro número é x, que conta inteiras.",
          "erro": "sistema-troca-par"
        }
      ],
      "esboco": "Mantém as letras ligadas às quantidades reais."
    },
    {
      "tipo": "caderno",
      "instrucao": "No sistema $x+y=9$ e $x-y=3$, teste x = 6. Que valor de y faz as **duas** igualdades valerem?",
      "resposta": 3,
      "sinal": true,
      "resolucao": [
        {
          "tex": "6+y=9\\Rightarrow y=3",
          "fala": "Seis mais y é nove: y vale três."
        },
        {
          "tex": "6+3=9\\quad\\text{e}\\quad6-3=3",
          "fala": "As duas condições conferem com o mesmo par."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "sistema-par-n1",
        "sistema-par-n2",
        "sistema-par-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "Foram **8 inteiras e 4 meias**. Agora vamos achar esse tipo de resposta sem testar par por par.",
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
                10,
                5,
                100
              ]
            ],
            "par": [
              8,
              4
            ],
            "rotulos": [
              "12 ingressos",
              "R$ 100"
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
