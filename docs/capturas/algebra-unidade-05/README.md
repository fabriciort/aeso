# Inequações — revisão visual

Sete aulas, 84 cartões. O percurso final foi revisado em 390 × 844 e 1440 × 1000, incluindo alternativas erradas e certas em cada previsão e passo guiado, todos os controles dos Mexa, resoluções no caderno e os três níveis de prática por aula.

| Momento de aprendizagem | Captura |
|---|---|
| 20 fica de fora de x > 20; a faixa continua sem fim | [Borda aberta](celular-01-borda-aberta.png) |
| A igualdade inclui o extremo | [Borda fechada](celular-02-borda-fechada.png) |
| A comparação que resta pode valer para todos os reais | [Cancelamento de x](celular-03-todos-os-reais.png) |
| Um fator negativo reflete os dois pontos | [Celular](celular-04-reflexao.png) · [Desktop](desktop-01-reflexao.png) |
| O mesmo número precisa respeitar as duas condições | [Celular](celular-05-intersecao.png) · [Desktop](desktop-02-intersecao.png) |
| OU reúne duas faixas separadas | [União](celular-06-uniao.png) |
| Sinais opostos produzem um resultado negativo | [Fatores e produto](celular-07-sinais-do-produto.png) |
| O coeficiente negativo altera o sinal das regiões | [Celular](celular-08-coeficiente-negativo.png) · [Desktop](desktop-03-coeficiente-negativo.png) |
| A raiz dupla não troca o sinal | [Quadrado não positivo](celular-09-raiz-dupla.png) |
| Sem raízes reais, ainda é preciso conferir o sinal | [Quadrado mais um](celular-10-sem-raizes.png) |
| O intervalo algébrico precisa respeitar o comprimento positivo | [Jardim](celular-11-comprimento-positivo.png) |
| Ultrapassar a meta exige excluir o mês do empate | [Caderno](celular-12-caderno.png) |
| Fórmulas em linhas separadas preservam o tamanho no celular | [Anotação revisada](celular-13-anotacao-legivel.png) |

Validação final: `npm test` aprovou 2.569 testes em 72 arquivos; tipos, lint e build de produção também passaram. Um teste específico compara as alternativas na borda e verifica se o feedback distingue incluir um extremo proibido de excluir um permitido.

Os 21 geradores foram conferidos por um leitor independente dos enunciados, com 300 sementes e os dois extremos do RNG. A verificação compara as soluções nas fronteiras, em pontos de cada região e nas duas caudas, e detecta alternativas que representam o mesmo conjunto. Problemas de contagem e de área são conferidos enumerando os inteiros permitidos.

O build rodou em uma cópia do projeto, preservando o servidor da revisão. O PR parte da branch do PR 24, que já recebeu Sistemas pelo merge do PR 25; as capturas desta pasta pertencem somente à unidade de Inequações.
