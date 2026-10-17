# Equações do 2º grau: revisão da unidade

A unidade acrescenta sete aulas e 21 geradores. A formação passa de 121 para 128 aulas nesta branch.

O fio das aulas é o mesmo: prever, experimentar, dar nome à ideia, escolher os passos de um exemplo, resolver no caderno e praticar sem o desenho. A fórmula aparece depois da construção do quadrado.

| Aula | O que deve ficar claro | Conferência matemática |
|---|---|---|
| As raízes de x² = k | A equação pede todos os valores; √ escolhe o não negativo. O sinal de k muda a quantidade de raízes. | x² = 25 aceita −5 e 5; x² = 0 só aceita 0; x² = −9 não aceita real. (x − 1)² = 16 dá −3 e 5. |
| Produto igual a zero | Um fator zero basta. A regra não vale para uma soma nem para um produto igual a 6. | (x − 2)(x + 3) zera em 2 e −3. (2x − 6)(x + 1) zera em 3 e −1. |
| Resolver por fatoração | Primeiro obter zero, depois fatorar. Colocar x em evidência preserva a raiz zero. | x² − 5x + 6 tem raízes 2 e 3. x² − 4x tem raízes 0 e 4. O terreno x(x − 5) = 6 só aceita x = 6. |
| Completar o quadrado | Mover conserva a área; acrescentar o canto exige somar dos dois lados. | x² + 6x = 16 vira (x + 3)² = 25: x = 2 ou −8. No pátio só 2 serve. x² − 4x = 5 dá −1 e 5. |
| A fórmula | É a construção anterior com letras. Coeficientes têm sinal, e todo o numerador se divide por 2a. | Foto 2 × 4, área externa 24: (2 + 2x)(4 + 2x) = 24, equivalente a 2x² + 6x − 8 = 0. Raízes 1 e −4; largura 1. |
| O discriminante | Δ prevê a quantidade de raízes reais distintas. Raiz não inteira continua sendo real. | x² − 6x + 5, x² − 6x + 9 e x² − 6x + 13 têm duas, uma e nenhuma raiz real. x² − 2 tem duas irracionais. |
| Problemas do 2º grau | Definir x e sua condição, montar antes de expandir, conferir no contexto. | Terreno 40 m²: 5 × 8. Foto 4 × 6 com área externa 48: faixa 1 cm. Inteiros consecutivos de produto 6: (2, 3) e (−3, −2). |

## Decisões pedagógicas

- O título da primeira aula passou de “x² = k tem duas raízes” para “As raízes de x² = k”. A primeira frase não vale para k zero ou negativo.
- As áreas com termos negativos são representações algébricas. Medidas físicas positivas e raízes da equação são distinguidas nos problemas.
- A construção visual de completar o quadrado usa coeficiente de x positivo. O caderno e os exercícios também trabalham coeficiente negativo, sem atribuir comprimento negativo às faixas.
- Na dedução, a identidade `(2ax + b)² = b² − 4ac` evita tratar `√(4a²)` como `2a` quando a é negativo. Os exercícios incluem a negativo e raízes fracionárias.
- O último nível de produto nulo propõe três fatores já escritos. É uma transferência da mesma ideia; não exige aprender a expandir um polinômio de terceiro grau.
- Respostas com o conjunto completo de raízes usam alternativas. O teclado numérico é usado quando se pede uma raiz específica, uma quantidade ou uma medida. Cada enunciado explicita o que responder.
- Exemplos longos no Anote foram divididos em linhas, mantendo as fórmulas legíveis no celular.

## Verificação

- `npm test`: os mesmos scripts do projeto, 68 arquivos e 2.373 testes passaram. Inclui todo o conteúdo anterior.
- `tests/geradores-af-u03.test.ts`: 300 sementes por gerador, mais extremos do RNG. Um leitor independente substitui valores nas expressões do enunciado. Os testes procuram todas as raízes inteiras ou seminteiras dos itens e verificam que exatamente uma alternativa contém o conjunto completo. Para os problemas, reconstroem áreas, diferenças e produtos a partir do texto. Os casos irracionais aparecem na contagem por Δ.
- `tests/segundo-grau-mexa.test.ts`: exploração sem penalidade, valores fora das opções, repetição de uma raiz, raiz dupla, dois estágios da montagem e saída “Me mostre”.
- `tests/completar-quadrado-geo.test.ts`: confere os quatro cantos da faixa após o giro, preservando seus lados e encaixando-a abaixo do quadrado.
- `tests/aula-mexa.test.ts`: joga todos os Mexa da formação, incluindo os novos.
- Tipos, lint e build de produção passaram.
- Os 81 cartões foram percorridos em 390 × 844 e 1440 × 1000. A passagem incluiu 34 passos guiados e 42 exercícios, somando as duas telas, sem erros de execução nem transbordamento detectado. A montagem e o exercício do quadrado também foram conferidos separadamente depois dos ajustes de posição e tamanho.
- 13 capturas selecionadas da revisão visual: `docs/capturas/algebra-unidade-03/`.
