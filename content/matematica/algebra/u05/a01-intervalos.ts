import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  "id": "AF.U5.A1",
  "titulo": "Limites e intervalos",
  "objetivo": "Ler <, ≤, > e ≥ como conjuntos de números, testar as bordas e escrever intervalos, distinguindo os reais dos inteiros.",
  "modelo": "reta",
  "esboco": "Da situação às tentativas na reta, depois à escrita simbólica, com perguntas que explicam cada transformação e seus limites.",
  "vega": "O saldo precisa ficar acima de 20 reais: x>20. Exatamente 20 não atende, 20,50 atende. Uma inequação pode admitir infinitos números reais; não procure um único valor nem um menor real acima de 20. A notação ]20;+∞[ exclui 20 e continua sem limite superior; infinito não é número e nunca é incluído. Círculo aberto exclui, fechado inclui. Em ]2;5], o 2 fica fora e o 5 entra. Use ponto e vírgula para separar extremos e não confundir com vírgula decimal. Para inteiros, x>20 começa em 21; para reais, não há menor valor. Os problemas devem dizer qual domínio vale.",
  "cartoes": [
    {
      "tipo": "gancho",
      "texto": "Seu saldo deve ficar **acima de R$ 20**. Ter exatamente R$ 20 atende? E R$ 20,50?",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x>20"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "esboco": "A situação abre uma pergunta real antes de apresentar a regra."
    },
    {
      "tipo": "aposta",
      "pergunta": "Acima de 20 quer dizer:",
      "visual": {
        "modelo": "livre",
        "estado": {
          "formulas": [
            "x>20"
          ]
        },
        "esboco": "Contas em linhas separadas: cada transformação mantém exatamente o mesmo conjunto de soluções."
      },
      "opcoes": [
        {
          "texto": "Maior que 20, sem incluir 20",
          "explica": "O empate fica de fora. 20,50 já é maior que 20.",
          "certa": true
        },
        {
          "texto": "20 ou mais",
          "explica": "Isso incluiria o empate e seria x ≥ 20.",
          "erro": "inequacao-inclui-a-borda"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "mexa",
      "texto": "Teste os valores. Quais ficam acima de 20?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 18,
            "ate": 24,
            "intervalos": [
              {
                "de": 20,
                "ate": null,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "candidatos": [
              19,
              20,
              20.5,
              22
            ],
            "ocultar": true,
            "teste": {
              "coeficientes": [
                0,
                1,
                0
              ],
              "relacao": ">",
              "direita": 20
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
      "descoberta": "20 não entra; 20,5 e 22 entram. Há outros números entre eles.",
      "esboco": "Cada tentativa faz a comparação numérica e mostra se o ponto pertence. Repetir um valor não avança; explorar não soma erros."
    },
    {
      "tipo": "aposta",
      "pergunta": "Só 21, 22, 23… resolvem $x>20$?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 18,
            "ate": 24,
            "intervalos": [
              {
                "de": 20,
                "ate": null,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "rotulo": "x>20"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "Não: 20,5 também resolve",
          "explica": "A reta é contínua. Sem pedir inteiros, os decimais também podem servir.",
          "certa": true
        },
        {
          "texto": "Sim: a solução começa no 21",
          "explica": "21 é o menor inteiro que serve. 20,5 é real e também serve.",
          "erro": "ineq-so-inteiros"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "ideia",
      "texto": "A faixa continua para a direita. O símbolo $+\\infty$ indica que ela **não termina**.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 18,
            "ate": 24,
            "intervalos": [
              {
                "de": 20,
                "ate": null,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "rotulo": "]20;+\\infty["
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "esboco": "A frase conecta a descoberta visual ao próximo raciocínio, sem repetir uma definição."
    },
    {
      "tipo": "aposta",
      "pergunta": "E $x\\ge20$? O ponto 20 fica:",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 18,
            "ate": 24,
            "intervalos": [
              {
                "de": 20,
                "ate": null,
                "incluiDe": true,
                "incluiAte": false
              }
            ],
            "rotulo": "x\\ge20"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "opcoes": [
        {
          "texto": "Incluído: círculo fechado",
          "explica": "O sinal ≥ aceita ser maior ou igual.",
          "certa": true
        },
        {
          "texto": "Excluído: círculo aberto",
          "explica": "O traço de igualdade permite o empate em 20.",
          "erro": "ineq-exclui-igualdade"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "anote",
      "titulo": "Intervalo de soluções",
      "definicao": "Um intervalo reúne todos os números reais entre seus limites. A borda pode entrar ou ficar de fora.",
      "exemplo": {
        "tex": "\\begin{gathered}2<x\\le5\\quad\\Longleftrightarrow\\quad]2;5]\\\\x>20\\quad\\Longleftrightarrow\\quad]20;+\\infty[\\end{gathered}",
        "fala": "Maior que dois e menor ou igual a cinco: dois fica fora, cinco entra. Acima de vinte continua sem fim."
      },
      "alerta": "Colchete virado para fora exclui a borda. Infinito nunca é incluído.",
      "esboco": "O caderno reúne a definição, um exemplo exato e o cuidado que evita o erro central."
    },
    {
      "tipo": "passo",
      "problema": "Leia $]2;5]$.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 0,
            "ate": 7,
            "intervalos": [
              {
                "de": 2,
                "ate": 5,
                "incluiDe": false,
                "incluiAte": true
              }
            ],
            "rotulo": "2<x\\le5"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "passos": [
        {
          "pergunta": "O número 2 pertence?",
          "opcoes": [
            {
              "texto": "Não",
              "explica": "A borda 2 é aberta: precisamos de x > 2.",
              "certa": true
            },
            {
              "texto": "Sim",
              "explica": "O colchete do lado do 2 está virado para fora.",
              "erro": "inequacao-inclui-a-borda"
            }
          ],
          "linha": {
            "tex": "x>2",
            "fala": "x é maior que dois."
          }
        },
        {
          "pergunta": "E 5?",
          "opcoes": [
            {
              "texto": "Sim",
              "explica": "O 5 é a borda fechada: x ≤ 5.",
              "certa": true
            },
            {
              "texto": "Não",
              "explica": "A escrita inclui 5, e o círculo é preenchido.",
              "erro": "ineq-exclui-igualdade"
            }
          ],
          "linha": {
            "tex": "2<x\\le5",
            "fala": "x é maior que dois e menor ou igual a cinco."
          }
        }
      ],
      "esboco": "O aluno decide cada etapa. A conta escrita mostra a operação e preserva o conjunto de soluções."
    },
    {
      "tipo": "aposta",
      "pergunta": "Existe o **menor número real** maior que 20?",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 19,
            "ate": 22,
            "intervalos": [
              {
                "de": 20,
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
          "texto": "Não: sempre cabe outro entre ele e 20",
          "explica": "Entre 20 e 20,1 cabe 20,05. Isso continua para qualquer candidato.",
          "certa": true
        },
        {
          "texto": "Sim: 20,1",
          "explica": "20,05 é menor que 20,1 e também é maior que 20.",
          "erro": "ineq-menor-real"
        }
      ],
      "esboco": "Previsão com uma alternativa plausível; o feedback explica o erro com uma conta ou contraexemplo."
    },
    {
      "tipo": "caderno",
      "instrucao": "Considere $-2<x\\le3$. Quantos **inteiros** pertencem ao intervalo?",
      "resposta": 5,
      "sinal": true,
      "resolucao": [
        {
          "tex": "-1,0,1,2,3",
          "fala": "Os inteiros são menos um, zero, um, dois e três."
        },
        {
          "tex": "\\text{São 5 inteiros.}",
          "fala": "O menos dois fica de fora; o três entra."
        }
      ],
      "esboco": "Resolva no papel; digite apenas o número pedido e confira as etapas e as bordas."
    },
    {
      "tipo": "sua-vez",
      "geradores": [
        "inequacao-intervalos-n1",
        "inequacao-intervalos-n2",
        "inequacao-intervalos-n3"
      ],
      "esboco": "Três níveis: visual e valores amigáveis, caso que pega e resolução independente sem desenho."
    },
    {
      "tipo": "fecho",
      "texto": "R$ 20 não bastam; **R$ 20,50 servem**. Uma inequação descreve um conjunto. Agora vamos encontrar esse conjunto pela conta.",
      "visual": {
        "modelo": "reta",
        "estado": {
          "faixas": {
            "de": 18,
            "ate": 24,
            "intervalos": [
              {
                "de": 20,
                "ate": null,
                "incluiDe": false,
                "incluiAte": false
              }
            ],
            "rotulo": "x>20"
          }
        },
        "esboco": "Reta contínua com círculos abertos ou fechados e setas para além da janela. Os testes mostram inclusão antes de revelar a faixa inteira."
      },
      "esboco": "Responde à pergunta inicial e abre o próximo conceito."
    }
  ]
}
