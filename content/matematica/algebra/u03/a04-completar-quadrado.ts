import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U3.A4",
  "titulo": "Completar o quadrado",
  "objetivo": "Completar x² + bx somando (b/2)² dos dois lados, resolver as duas equações lineares e distinguir o desenho de área das soluções algébricas negativas.",
  "modelo": "retangulo",
  "esboco": "Um pátio tem área 16: x² e duas faixas de 3x. O aluno move uma faixa e vê o canto 3 por 3 que falta. Adicioná-lo também aumenta o outro lado.",
  "vega": "Com metade m positiva, x² + 2mx = d vira (x + m)² = d + m². Mover as faixas conserva área. Acrescentar o canto muda área: por isso some m² DOS DOIS LADOS. O desenho ilustra x positivo; as contas valem para qualquer x real. Na equação x² + 6x = 16, raízes 2 e −8; só 2 mede o lado do pátio. Pratique também coeficiente negativo algebricamente. Não diga que todas as equações têm duas raízes reais.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Um pátio tem **16 m²**: um quadrado de lado x e duas faixas de 3 m. Quanto vale x?",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "completarQuadrado": {
            "metade": 3,
            "direita": 16
          }
        },
        "esboco": "Quadrado x² com duas faixas de 3x ao lado, ainda sem o canto."
      },
      "esboco": "A área do pátio é x² + 6x. A falta de um canto motiva completar o quadrado."
    },
    {
      "tipo": "mexa",
      "texto": "As duas faixas têm área $6x$. Reparta-as e descubra o canto que falta.",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "completarQuadrado": {
            "metade": 3,
            "direita": 16
          }
        },
        "esboco": "Uma faixa de 3x move-se para baixo do x². Fica uma vaga de 3 por 3."
      },
      "acao": {
        "tipo": "tocar",
        "instrucao": "Reparta as faixas e complete os dois lados da igualdade.",
        "sucesso": {
          "completado": true
        },
        "mostre": "Uma faixa vai para baixo. Somamos o canto de área 9 dos dois lados."
      },
      "descoberta": "x² + 6x + 9 = 16 + 9: o quadrado completo tem lado x + 3 e área 25.",
      "esboco": "Momento-chave: o espaço vazio é 3 por 3; ao preenchê-lo, 16 também recebe +9.",
      "fala": "As duas faixas têm área seis x. Reparta-as e descubra o canto que falta."
    },
    {
      "tipo": "aposta",
      "pergunta": "Por que somamos 9 também ao 16?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "x² + 6x = 16",
            "x² + 6x + 9 = 16 + 9"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x² + 6x + 9 = 16 + 9"
      },
      "opcoes": [
        {
          "texto": "Para manter a igualdade",
          "explica": "Se acrescentamos 9 à área da esquerda, a da direita também aumenta 9.",
          "certa": true
        },
        {
          "texto": "Não precisa: só arrumamos as peças",
          "explica": "Mover não muda a área. Preencher o canto acrescenta uma peça nova de área 9.",
          "erro": "completar-so-um-lado"
        }
      ],
      "esboco": "Separa conservar a área ao mover e alterar a área ao somar."
    },
    {
      "tipo": "aposta",
      "pergunta": "O quadrado completo tem lado $x + 3$ e área 25. Qual x serve ao pátio?",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "completarQuadrado": {
            "metade": 3,
            "direita": 16,
            "etapa": 2
          }
        },
        "esboco": "Quadrado completo de lado x + 3 e área 25."
      },
      "opcoes": [
        {
          "texto": "$2$",
          "explica": "O lado completo mede 5. Tirando a faixa de 3 m, sobra x = 2 m.",
          "certa": true
        },
        {
          "texto": "$5$",
          "explica": "5 é o lado x + 3. Ainda precisamos tirar os 3 m da faixa.",
          "erro": "equacao-deslocamento-troca-sinal"
        }
      ],
      "esboco": "Usa o lado do quadrado antes da equação abstrata."
    },
    {
      "tipo": "ideia",
      "texto": "Na equação, há outro caso: $x + 3 = -5$, então $x = -8$. Ele não mede o pátio.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "(x + 3)² = 25",
            "x + 3 = 5 ou x + 3 = −5",
            "x = 2 ou x = −8"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: x = 2 ou x = −8"
      },
      "esboco": "O desenho explica a construção; o símbolo permite conferir a outra raiz.",
      "fala": "Na equação há outro caso: x mais três igual a menos cinco. Então x vale menos oito. Ele não mede o pátio."
    },
    {
      "tipo": "aposta",
      "pergunta": "O −8 resolve mesmo $x^2 + 6x = 16$?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "(−8)² + 6 · (−8) = ?"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (−8)² + 6 · (−8) = ?"
      },
      "opcoes": [
        {
          "texto": "Sim: 64 − 48 = 16",
          "explica": "A raiz negativa satisfaz a equação, embora não seja um comprimento.",
          "certa": true
        },
        {
          "texto": "Não: o desenho não aceita −8",
          "explica": "A equação aceita números negativos. O contexto é que exige x positivo.",
          "erro": "equacao-aceita-medida-negativa"
        }
      ],
      "esboco": "Confronta explicitamente a limitação física do desenho.",
      "fala": "O menos oito resolve mesmo x ao quadrado mais seis x igual a dezesseis?"
    },
    {
      "tipo": "anote",
      "titulo": "Completar o quadrado",
      "definicao": "Em $x^2 + bx$, some $(b/2)^2$ para formar $(x + b/2)^2$. Some o mesmo ao outro lado.",
      "exemplo": {
        "tex": "\\begin{gathered}x^2+6x=16\\\\(x+3)^2=25\\end{gathered}",
        "fala": "Metade de seis é três. Somando nove aos dois lados, x mais três ao quadrado é vinte e cinco."
      },
      "alerta": "Metade de 6 é 3. O canto vale **3² = 9**, e não 3.",
      "esboco": "No caderno: definição, exemplo resolvido e o cuidado que impede o erro mais comum."
    },
    {
      "tipo": "passo",
      "problema": "Resolva $x^2 + 4x = 5$.",
      "visual": {
        "modelo": "retangulo",
        "estado": {
          "completarQuadrado": {
            "metade": 2,
            "direita": 5,
            "etapa": 1
          }
        },
        "esboco": "As faixas de 2x deixam uma vaga 2 por 2."
      },
      "passos": [
        {
          "pergunta": "Quanto falta para completar o quadrado?",
          "opcoes": [
            {
              "texto": "$4$ dos dois lados",
              "explica": "Metade de 4 é 2. O canto é 2 · 2 = 4.",
              "certa": true,
              "mostra": {
                "modelo": "retangulo",
                "estado": {
                  "completarQuadrado": {
                    "metade": 2,
                    "direita": 5,
                    "etapa": 2
                  }
                },
                "esboco": "O canto 4 entra e 5 vira 9."
              }
            },
            {
              "texto": "$2$ dos dois lados",
              "explica": "2 é o lado do canto, não a área. A área é 2² = 4.",
              "erro": "completar-metade-sem-quadrado"
            }
          ],
          "linha": {
            "tex": "(x+2)^2=9",
            "fala": "x mais dois ao quadrado igual a nove."
          }
        },
        {
          "pergunta": "Agora $x + 2 = 3$ ou $-3$. Quanto vale x?",
          "opcoes": [
            {
              "texto": "$1$ ou $-5$",
              "explica": "Subtraia 2 em cada caso.",
              "certa": true,
              "mostra": {
                "modelo": "livre",
                "estado": {
                  "expressao": [
                    "x = 1 ou x = −5"
                  ]
                },
                "esboco": "A conta em linhas, com a última etapa em destaque: x = 1 ou x = −5"
              }
            },
            {
              "texto": "Só $1$",
              "explica": "O caso x + 2 = −3 também satisfaz o quadrado.",
              "erro": "equacao-esquece-raiz-negativa"
            }
          ],
          "linha": {
            "tex": "x=1 \\text{ ou } x=-5",
            "fala": "x igual a um ou menos cinco."
          }
        }
      ],
      "esboco": "A construção já veio pronta; o aluno escolhe o canto e desfaz os dois ramos."
    },
    {
      "tipo": "caderno",
      "instrucao": "Complete o quadrado em $x^2 - 4x = 5$. Digite a **menor** raiz.",
      "resposta": -1,
      "sinal": true,
      "resolucao": [
        {
          "tex": "x^2-4x+4=9",
          "fala": "Metade de menos quatro é menos dois; seu quadrado é quatro."
        },
        {
          "tex": "(x-2)^2=9",
          "fala": "O quadrado completo é x menos dois ao quadrado."
        },
        {
          "tex": "x-2=3 \\text{ ou } x-2=-3",
          "fala": "x menos dois vale três ou menos três."
        },
        {
          "tex": "x=5 \\text{ ou } x=-1",
          "fala": "Somando dois, cinco ou menos um."
        }
      ],
      "esboco": "Resolva no papel, confira a resposta pedida e compare cada linha da resolução."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "segundo-completar-n1",
        "segundo-completar-n2",
        "segundo-completar-n3"
      ],
      "esboco": "Três níveis: começa com visual, passa pelo erro que pega e termina sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "No pátio, x mede **2 m**: $2^2 + 6 \\cdot 2 = 16$. O canto que faltava revelou como resolver.",
      "visual": {
        "modelo": "livre",
        "estado": {
          "expressao": [
            "4 + 12 = 16 m²",
            "(x + 3)² = 25"
          ]
        },
        "esboco": "A conta em linhas, com a última etapa em destaque: (x + 3)² = 25"
      },
      "esboco": "Responde à pergunta inicial e prepara o conceito da próxima aula."
    }
  ]
}
