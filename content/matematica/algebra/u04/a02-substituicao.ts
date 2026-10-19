import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U4.A2",
  "titulo": "Substituir sem mudar o valor",
  "objetivo": "Resolver sistemas por substituição, isolando uma incógnita, usando parênteses e recuperando a outra para conferir o par.",
  "modelo": "livre",
  "esboco": "Doze livros em duas prateleiras, a de cima com quatro a mais. Trocar x por y+4 transforma duas incógnitas em uma só.",
  "vega": "x conta livros da prateleira de cima e y da de baixo. x+y=12 e x=y+4. Igualdade permite substituir uma expressão por outra de mesmo valor. Na soma, (y+4)+y=12 leva a y=4 e depois x=8. Ao aparecer 2x, substituir dá 2(y+4), que exige distributiva. Não diga passar para o outro lado sem operação: subtraia a mesma quantidade dos dois lados. A substituição não é trocar x por qualquer número. Conserve a relação original para recuperar a segunda incógnita e confira ambas. A prática retira apoio e inclui coeficientes e soluções negativas.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Duas prateleiras têm **12 livros**. A de cima tem **4 a mais** que a de baixo. Como descobrir as duas quantidades?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x+y=12",
            "x=y+4"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "esboco": "x é cima; y é baixo. A diferença é uma relação entre quantidades, não o valor de uma delas."
    },
    {
      "tipo": "aposta",
      "pergunta": "Se a prateleira de baixo tem y livros, a de cima tem:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x=y+4"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "$y+4$",
          "explica": "São os y livros de baixo, mais 4.",
          "certa": true
        },
        {
          "texto": "$4$",
          "explica": "Quatro é a diferença entre as prateleiras, não o total de cima.",
          "erro": "sistema-diferenca-e-quantidade"
        }
      ],
      "esboco": "Interpreta a relação antes de substituir."
    },
    {
      "tipo": "mexa",
      "texto": "Teste o par que respeita a soma 12 e a diferença 4.",
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
            "pares": [
              [
                6,
                6
              ],
              [
                4,
                8
              ],
              [
                8,
                4
              ],
              [
                10,
                2
              ]
            ],
            "rotulos": [
              "Soma 12",
              "Cima tem 4 a mais"
            ]
          }
        },
        "esboco": "Duas condições em linhas separadas. O mesmo par é substituído nas duas; na soma, cada lado recebe a operação indicada."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Compare as duas linhas em cada tentativa.",
        "sucesso": {
          "sistema": [
            8,
            4
          ]
        },
        "mostre": "x = 8 e y = 4 respeitam as duas relações."
      },
      "descoberta": "Agora vamos obter o mesmo par por uma conta com uma incógnita.",
      "esboco": "A tentativa vem antes do método."
    },
    {
      "tipo": "aposta",
      "pergunta": "Sabendo que $x=y+4$, como reescrever $x+y=12$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x+y=12",
            "x=y+4"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "$(y+4)+y=12$",
          "explica": "No lugar de x, entrou uma expressão de mesmo valor.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "formulas": [
                "(y+4)+y=12",
                "2y+4=12"
              ]
            },
            "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
          }
        },
        {
          "texto": "$4+y=12$",
          "explica": "x não vale só 4; ele vale y + 4.",
          "erro": "sistema-substitui-parte"
        }
      ],
      "esboco": "A troca é justificada pela igualdade."
    },
    {
      "tipo": "ideia",
      "texto": "**Substituir** é trocar pelo mesmo valor. Assim, as duas incógnitas viraram uma só.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "(y+4)+y=12",
            "2y+4=12"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "esboco": "O ganho do método fica visível na redução das letras."
    },
    {
      "tipo": "aposta",
      "pergunta": "De $2y+4=12$, qual operação ajuda a isolar y?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "2y+4=12"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "Subtrair 4 dos dois lados",
          "explica": "Fica 2y = 8; depois, divida ambos os lados por 2.",
          "certa": true,
          "mostra": {
            "modelo": "livre",
            "estado": {
              "formulas": [
                "2y=8",
                "y=4"
              ]
            },
            "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
          }
        },
        {
          "texto": "Subtrair 4 só do lado esquerdo",
          "explica": "Isso muda a igualdade: o lado direito também precisa perder 4.",
          "erro": "sistema-opera-um-lado"
        }
      ],
      "esboco": "Retoma o equilíbrio das equações do primeiro grau."
    },
    {
      "tipo": "anote",
      "titulo": "Método da substituição",
      "definicao": "Isole uma incógnita, substitua sua expressão na outra equação, resolva e recupere a incógnita que faltou.",
      "exemplo": {
        "tex": "\\begin{gathered}x=y+4\\\\(y+4)+y=12\\\\y=4,\\quad x=8\\end{gathered}",
        "fala": "x é y mais quatro. Substituindo, y vale quatro; voltando, x vale oito."
      },
      "alerta": "Encontrar só y ainda não fornece o par. Volte a uma relação original para achar x.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Agora $x=y+4$ e $2x+y=17$. Encontre o par.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x=y+4",
            "2x+y=17"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "passos": [
        {
          "pergunta": "Como substituir x em 2x?",
          "opcoes": [
            {
              "texto": "$2(y+4)$",
              "explica": "O 2 multiplica todo o valor de x.",
              "certa": true
            },
            {
              "texto": "$2y+4$",
              "explica": "O 4 também faz parte de x. Ele precisa ser multiplicado por 2.",
              "erro": "sistema-sem-parenteses"
            }
          ],
          "linha": {
            "tex": "2(y+4)+y=17",
            "fala": "Duas vezes y mais quatro, mais y, igual a dezessete."
          }
        },
        {
          "pergunta": "Depois da distributiva, quanto vale y?",
          "opcoes": [
            {
              "texto": "$3$",
              "explica": "2y + 8 + y = 17; logo 3y = 9 e y = 3.",
              "certa": true
            },
            {
              "texto": "$13/3$",
              "explica": "Isso vem de esquecer 2 · 4 = 8.",
              "erro": "sistema-sem-parenteses"
            }
          ],
          "linha": {
            "tex": "3y+8=17\\Rightarrow y=3",
            "fala": "Três y mais oito é dezessete, então y vale três."
          }
        },
        {
          "pergunta": "Quanto vale x?",
          "opcoes": [
            {
              "texto": "$7$",
              "explica": "x = y + 4 = 3 + 4 = 7.",
              "certa": true
            },
            {
              "texto": "$3$",
              "explica": "x e y não precisam ser iguais. Use x = y + 4.",
              "erro": "sistema-nao-recupera"
            }
          ],
          "linha": {
            "tex": "x=3+4=7",
            "fala": "x vale sete."
          }
        }
      ],
      "esboco": "Parênteses protegem o valor inteiro que substitui x."
    },
    {
      "tipo": "aposta",
      "pergunta": "O par $(7,3)$ confere no problema anterior?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "7=3+4",
            "2\\cdot7+3=17"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "opcoes": [
        {
          "texto": "Sim: as duas igualdades valem",
          "explica": "A volta às originais confirma o par.",
          "certa": true
        },
        {
          "texto": "Não: x e y são diferentes",
          "explica": "Duas incógnitas podem ter valores diferentes. A condição é satisfazer as equações.",
          "erro": "sistema-reparte-igual"
        }
      ],
      "esboco": "Fecha o exemplo com verificação explícita."
    },
    {
      "tipo": "caderno",
      "instrucao": "Resolva $x=y+2$ e $x+y=10$. Digite o valor de **x**.",
      "resposta": 6,
      "sinal": true,
      "resolucao": [
        {
          "tex": "(y+2)+y=10",
          "fala": "Substitua x por y mais dois."
        },
        {
          "tex": "2y=8\\Rightarrow y=4",
          "fala": "Subtraia dois e divida por dois."
        },
        {
          "tex": "x=4+2=6",
          "fala": "Volte para encontrar x."
        },
        {
          "tex": "6+4=10\\quad\\text{e}\\quad6=4+2",
          "fala": "O par seis, quatro atende às duas."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "sistema-substituir-n1",
        "sistema-substituir-n2",
        "sistema-substituir-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "A prateleira de baixo tem **4 livros**; a de cima, **8**. Substituir juntou as duas informações numa conta só.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "y=4",
            "x=y+4=8"
          ]
        },
        "esboco": "Igualdades alinhadas em etapas; cada transformação preserva o valor dos dois lados."
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
