# Sistemas de equações — revisão visual

A unidade tem seis aulas e 72 cartões. O percurso foi revisado a 390 × 844 e 1440 × 1000, incluindo uma alternativa incorreta e a correta em cada previsão e etapa guiada, todas as manipulações, as seis resoluções no caderno e os três níveis de prática de cada aula.

As capturas selecionadas registram os pontos em que o desenho e a explicação precisam trabalhar juntos:

| Situação | Celular | Desktop |
|---|---|---|
| O mesmo par nas duas condições | [Conferência](celular-01-duas-condicoes.png) | [Conferência](desktop-01-duas-condicoes.png) |
| Substituir uma expressão inteira | [O erro dos parênteses](celular-02-parenteses.png) | — |
| Somar os dois lados | [Adição](celular-03-adicao.png) | — |
| Multiplicar antes de somar | [Linhas multiplicadas](celular-04-equacoes-multiplicadas.png) | — |
| Eliminar uma incógnita | [Resultado da soma](celular-05-eliminacao.png) | [Resultado da soma](desktop-02-eliminacao.png) |
| Marcar a interseção | [Ponto comum](celular-06-intersecao.png) | [Ponto comum](desktop-03-intersecao.png) |
| Duas condições incompatíveis | [Paralelas distintas](celular-07-paralelas.png) | — |
| Duas equações da mesma reta | [Coincidência](celular-08-coincidentes.png) | — |
| Por que 0 = 3 impede uma solução | [Contradição](celular-09-contradicao.png) | — |
| A álgebra e as restrições do problema | [Bilhetes inteiros](celular-10-bilhetes-inteiros.png) | — |
| Responder e conferir as duas condições | [Resolução no caderno](celular-11-caderno.png) | — |

Verificações: `npm test` (2.463 testes em 70 arquivos), `npm run typecheck`, `npm run lint` e `npm run build` aprovados. Os 18 geradores também foram resolvidos por um leitor matemático independente, com 300 sementes e os dois extremos do RNG por gerador. As compras de bilhetes foram conferidas enumerando todas as contagens inteiras permitidas.

O build foi executado em uma cópia do projeto para preservar o servidor usado na revisão. Não houve dependências novas. A branch parte do PR 24, ainda não incorporado à main; este conjunto de capturas pertence apenas à unidade de Sistemas.
