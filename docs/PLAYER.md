# O player de aulas

Como o player lê o conteúdo de `content/matematica/` e o transforma em tela: o que cada cartão mostra e quais chaves de `estado` cada modelo entende. Quem escreve uma aula usa estas chaves; quem estende o player para uma unidade nova acrescenta aqui as chaves novas, na mesma mudança.

Código: `components/aula/` (player, cartões, exercícios, visuais) e `components/observatory/views/AulaView.tsx` (a rota).

## A tela

Uma aula é um story, sem rolagem:

- **Em cima:** um traço por cartão, o botão de sair, o título, Ajustes e a Vega.
- **No meio:** o palco (o visual do cartão) e o texto.
- **Embaixo:** voltar e um botão só.

O botão diz o que acontece agora:

| Botão | Quando |
|---|---|
| Continuar | o cartão está pronto |
| Conferir | há uma resposta digitada |
| Próximo passo | um passo do passo a passo foi resolvido |
| Próximo | depois de um exercício |
| Anotei | no Anote |
| Concluir | no último cartão |

O botão só acende quando o cartão está pronto. Nada é bloqueado de verdade: "Me mostre" resolve qualquer Mexa.

O palco **fica montado** de um cartão para o outro. Quando dois cartões seguidos usam o mesmo modelo, só o estado muda, e as peças se movem até o novo lugar. Quando o modelo muda, um some e o outro aparece. Por isso vale manter o mesmo modelo em sequência quando a ideia continua.

O aluno pode sair e voltar: a aula retoma no cartão em que parou. O último cartão marca a aula como concluída no mapa.

**Como num story:** nos cartões só de leitura (gancho, ideia, anote, fecho), um toque em qualquer lugar da tela segue; um toque no terço esquerdo volta.

**Fim da aula:** "Concluir" mostra "Aula concluída", o tempo da aula, as aulas da unidade (as feitas marcadas, a próxima acesa com "a seguir") e o botão **Próxima aula**, que abre a aula seguinte direto, sem passar pelo mapa.

**Primeira visita:** enquanto o aluno não abriu nenhuma aula, o mapa da Matemática abre com a apresentação da formação ("Do zero ao Cálculo, uma aula de cada vez") e o botão **Começar a formação**. Depois, o cartão "Próximo passo" diz a unidade e a aula.

**Sons:** acerto, erro e fim de aula têm sons curtos e baixos. O aluno desliga em Ajustes.

No primeiro cartão, no lugar do botão de voltar, fica **Já sei isso**: leva direto ao cartão `sua-vez`, para quem já sabe o assunto. O diagnóstico de entrada não tem esse botão.

## Cartões

| Cartão | O que o aluno vê | Pronto quando |
|---|---|---|
| `gancho`, `ideia`, `fecho` | palco + texto grande | já está pronto |
| `mexa` | palco interativo + texto + instrução | o estado de `sucesso` é alcançado, ou o aluno toca "Me mostre" |
| `aposta` | palco + pergunta + opções | uma escolha |
| `passo` | palco + caderno da tela + pergunta do passo. O `mostra` de uma opção troca o palco quando ela é tocada, a certa também: use-o na certa de cada passo para o palco andar com a conta (o `?` da tabela vira o número achado) | o último passo é acertado |
| `anote` | uma página quadriculada | já está pronto ("Anotei") |
| `caderno` | "Resolva no papel" + teclado | o aluno confere ou toca "Ver a resolução" |
| `sua-vez` | exercícios | domínio |
| `fecho` (último) | palco + texto | já está pronto ("Concluir") |

Detalhes por cartão:

- **Aposta:**
  - A escolha mostra `explica` logo abaixo das opções.
  - O palco troca para o `mostra` da opção escolhida.
  - A opção certa fica marcada depois de qualquer escolha.
  - O aluno pode tocar as outras opções para ver a explicação de cada uma.
- **Passo:**
  - Uma opção errada mostra `explica` e o seu `mostra`. O aluno tenta de novo.
  - A certa escreve a `linha` no caderno da tela, embaixo do palco.
- **Caderno:**
  - Uma `resposta` numérica abre o teclado numérico da tela (com vírgula, se for um decimal, e com a tecla do menos, se for negativa ou se o cartão tiver `sinal: true`).
  - Uma `resposta` em texto abre um campo de texto. Vale se o que o aluno escreveu contém a resposta, sem contar maiúsculas e acentos ("tentar sozinho" vale para `tentar`).
  - A `resolucao` se escreve linha a linha.
- **Voz:** com a voz ligada, o player lê `fala` (ou o texto sem markdown) ao entrar no cartão, e lê `explica` depois de uma aposta.
- **Fórmulas** (`$...$` e `Linha.tex`) nunca rolam para o lado: encolhem até caber. A pontuação logo depois de uma fórmula (`$2^3$?`) fica na mesma linha que ela.

## Exercícios (`sua-vez`)

- **Ordem e domínio:**
  - Os geradores vêm na ordem do cartão.
  - Quem sabe passa rápido: **um acerto de primeira** (sem dica e sem erro antes) em cada gerador basta.
  - Quem errou ou usou dica num gerador precisa de **dois acertos de primeira seguidos** nele, com outro item do mesmo gerador.
  - Depois de um acerto, o próximo exercício vem sozinho em pouco mais de 1 segundo (tocar em "Próximo" adianta).
- **Erros:** cada erro abre a próxima dica:
  1. a ideia;
  2. o primeiro passo;
  3. a resolução, com a resposta à vista.

  O aluno também pode pedir "Dica".
- **Formatos:**
  - `numero` usa o teclado da tela. Pontos e espaços são ignorados na comparação (`12.500` = `12500`).
  - Decimais: quando a `resposta` é um decimal (`'0,25'`, ou o número `0.25`), a tecla do ponto vira a vírgula. Zeros no fim não contam (`0,50` = `0,5`). Escreva a resposta com vírgula, como o aluno digita.
  - Negativos: quando a `resposta` é negativa (`-3`, `'−2,5'`), aparece a tecla **−**, que põe ou tira o sinal na frente do número. Para o teclado não entregar o sinal, dê `sinal: true` ao item: a tecla aparece também quando a resposta é positiva. Na U12 em diante, use `sinal: true` em todo item cuja resposta poderia ser negativa. O hífen e o sinal de menos valem o mesmo, e −0 vale 0.
  - `escolha` usa as opções. A resposta é o índice.
  - `fracao`, `reta` e `expressao` ainda não existem no player.
- **Visual:** o `visual` do item aparece no palco, sem interação.
- **Diagnóstico:** quando todos os geradores são `diagnostico-*`, o cartão vira o diagnóstico de entrada:
  - um item por gerador, sem dicas, com "Não sei";
  - no fim, a lista do `ROTEIRO_DIAGNOSTICO_ENTRADA` com "Já sabe" ou "Ver a aula";
  - o resultado fica guardado no progresso.
- **Diagnóstico de erros:** o mapa `erros` ainda não aparece para o aluno. O feedback é a próxima dica. O mapa está pronto para a Vega usar depois.

## Modelos e chaves de `estado`

O player desenha só o que reconhece. Uma chave desconhecida é ignorada sem erro, mas também não aparece. Se a aula precisa de algo que não está aqui, estenda o modelo em `components/aula/visual/` e documente a chave nesta seção.

### `blocos`

| Chave | Efeito |
|---|---|
| `milhares`, `centenas`, `dezenas`, `unidades` | quantas peças de cada; mudanças animam |
| `grupos` + `soltos` / `unidadesSoltas` | o mesmo, com o nome dos geradores (grupos de 10 = dezenas) |
| `total` | mostra o número embaixo (`totalVisivel: false` esconde) |
| `destaque` | `'unidades'`, `'dezenas'`… acende o grupo |
| `rotulos` | legendas: uma lista embaixo de tudo, ou `{ unidades: 'unidade', dezenas: 'dezena' }` para uma legenda embaixo de cada grupo |
| `tamanhoGrupo` | moldura de 10 lugares para as peças soltas |
| `abrirDezenas`, `abrirCentenas` | barras e placas abertas em peças |
| `desagrupar: true` | no Mexa, o toque abre 1 peça em 10 da ordem de baixo (uma barra vira 10 cubos), em vez de juntar |

### `quadro-posicional`

| Chave | Efeito |
|---|---|
| `casas` | colunas (`['M','C','D','U']`) |
| `numero`, `numeros` | uma linha por número, alinhada à direita; com uma linha e até 4 casas, os blocos aparecem embaixo (`blocosVisiveis: false` esconde) |
| `destaque` | uma casa (`'C'`, `'U e C'`) ou um algarismo (`3` acende todo 3) |
| `primeiraDiferente`, `casaDecisiva` | acendem essa casa |
| `classes` + `grupos` | quadro de classes; cada classe com 3 casas e zeros à esquerda (`5` em milhões depois de bilhões vira `005`) |
| `leituras` | uma leitura embaixo de cada classe |
| `algarismos` + `tamanhoGrupo` | algarismos em linha, com pontos entre eles (`separadores`) |
| `transicoes` | uma cadeia 1.000 → 1.000.000 → … |
| `etiquetas`, `escritas`, `etiqueta`, `fichas` | cartões de texto; com `quantidadeOculta` aparecem sozinhos, grandes |
| `ditado` | o número por extenso, acima do quadro |
| `conta` | a conta armada num caderno quadriculado: `{ parcelas: [147, 85], sinal: '+' }`; `resultado` são os algarismos já escritos, da direita (`'32'`); `reservas` são os vai um em âmbar acima da casa (`{ D: '1' }`); `trocas` riscam o algarismo de cima e escrevem o novo valor (`{ D: '4', U: '12' }`); `destaque` acende uma coluna (`'U'`) |
| `conta` com `sinal: '×'` | a multiplicação armada: `{ parcelas: [23, 14], sinal: '×', parciais: ['92', '230'], resultado: '322', reservas: { D: '1' } }`. `parciais` são as linhas entre os dois traços (cada uma alinhada à direita; o zero de deslocamento faz parte do texto); `resultado` vem depois do segundo traço. Sem `parciais`, fica como a soma: um traço só |
| `conta` com decimais | parcelas com vírgula (`['3,5', '1,25']` ou `[3.5, 1.25]`) se alinham pela vírgula, com as casas `d`, `c`, `m` depois dela. `zeros: true` completa com zeros apagados as casas que faltam (3,5 aparece 3,50; 5 aparece 5,0). `resultado` sem vírgula preenche da direita (`'75'`); com ela, alinha pela vírgula (`'4,75'`). `reservas`, `trocas` e `destaque` usam `d` e `c` para as casas decimais (`{ U: '4', d: '10' }`) |
| `conta` com `alinhar: 'direita'` | arma como nos inteiros: cada caractere numa coluna, alinhado pela direita, vírgulas incluídas, sem os nomes das casas. Para mostrar o erro de alinhar decimais pela direita (`['3,5', '1,25']` com `resultado: '1,60'`) e para a multiplicação com decimais (`['6,15', '2,4']`, `sinal: '×'`, `parciais`, `resultado: '14760'`) |

### `quadro-posicional`: quadro de unidades

| Chave | Efeito |
|---|---|
| `medida` | `{ casas: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], numero: '1,25', de: 'm' }`: o número no quadro, com o último algarismo antes da vírgula na casa `de` e a vírgula (âmbar) depois dela. Embaixo, a leitura (`1,25 m`) |
| `medida.para` | a unidade de chegada: a vírgula anda até depois dessa casa, os zeros que faltam aparecem em âmbar e a leitura vira `1,5 m = 150 cm`. Zeros à esquerda que não contam ficam apagados |
| `medida.porCasa` | algarismos por casa: `2` para área (m², cm²: 1 m² = 10.000 cm²), `3` para volume |

No Mexa, com `acao.sucesso: { para: 'cm' }`, o aluno toca a unidade e a vírgula vai para depois dela (o número parte de `de`).

### `reta`

| Chave | Efeito |
|---|---|
| `de`, `ate`, `passo` | o trecho e a escala (sem `passo`, uma escala redonda) |
| `marcas` | números escritos (fora da escala também ganham traço) |
| `marcaSemRotulo` | um traço com "?" |
| `numero`, `numeros`, `exemplos`, `exato`, `maior` | pontos em destaque |
| `vizinhos` | setas de cada número (`numeros` ou `exemplos`) até o seu vizinho |
| `saltos` | arcos que aparecem um depois do outro, com rótulo em âmbar: `[[38, 40, '+2'], [40, 63, '+23']]`; para trás, o arco volta (`[63, 60, '−3']`) |
| `meio` | uma linha tracejada |
| `aproximado` | um anel no valor aproximado |
| `escolhas` | círculos tocáveis |
| `etiquetas`, `etiquetaSolta`, `fichas` | cartões acima da reta, ainda fora do lugar |
| `destaqueIntervalos` | os intervalos acendem um a um |
| `comparacoes`, `comparacao`, `aproximacao` | frases grandes embaixo (ex.: `12 > 7`) |
| `unidade` | junto das etiquetas (ex.: km) |
| `sinais: true` | negativos (U12): a reta fica azul à esquerda do zero e âmbar à direita, o zero ganha um traço mais forte e os pontos negativos ficam azuis. Os números negativos sempre aparecem com o sinal de menos de verdade (−3) |
| `distancias` | colchetes embaixo da reta, do zero até cada número, com um rótulo: `[[-4, '4 passos'], [4, '4 passos']]` (o módulo e os opostos). Cabem dois |
| `fracoes` | os números aparecem como frações com esse denominador: com `fracoes: 4`, 0,75 vira 3/4 (os inteiros continuam 1, 2). Use `passo` igual a 1/denominador (`passo: 0.25`) |

#### `reta`: inequações (AF.U5)

O pedaço da reta que serve, o sinal de um produto em cada pedaço, os testes de um número na condição e o espelho de multiplicar por −1. Os números vêm com o menos de verdade (−3) e a vírgula decimal; as pontas dos pedaços, as raízes e os números testados são escritos embaixo da reta sozinhos (somam-se às `marcas`).

| Chave | Efeito |
|---|---|
| `intervalos` | as faixas grossas do que serve. Cada uma é uma condição escrita (`'x > 3'`, `'2 < x ≤ 5'`, `'x < −3 ou x > 3'`, `'2x + 3 < 11'`, que vira x < 4) ou um pedaço `{ de: 3, ate: null, inclui: [false, false] }` (`de`/`ate` ausente ou `null`: sem fim; `inclui: true` as duas pontas, `[true, false]` só a da esquerda; padrão: nenhuma). Bolinha **vazia** na ponta que não entra, **cheia** na que entra, e a **seta** onde o pedaço segue sem fim (ou passa da ponta da reta). Uma faixa só fica na própria reta, em âmbar. Duas (ou três) ficam um pouco acima da reta, paralelas: âmbar, azul, verde. Cada uma aceita `cor` (`'ambar'`, `'azul'`, `'verde'`, `'rosa'`), `rotulo` (um texto pequeno na cor dela, ao lado da bolinha: `'x ≥ −1'`) e, no lugar da condição como texto, `{ condicao: 'x ≥ −1', rotulo: 'x ≥ −1' }` |
| `sobreposicao: true` | com dois intervalos: o que serve aos dois, em verde, na própria reta (com as bolinhas certas: x ≥ −1 e x < 3 dão −1 cheia, 3 vazia). Sem sobreposição, a reta fica sem nada: diga em `comparacao` ("Nenhum número serve às duas.") |
| `regioes` | o sinal de um produto em cada pedaço (2º grau): `[{ ate: 2, sinal: '+' }, { de: 2, ate: 5, sinal: '−' }, { de: 5, sinal: '+' }]`. Um + âmbar ou um − azul grande sobre o meio de cada pedaço, e um traço forte em cada raiz. `serve: true` pinta o pedaço por baixo, na cor do sinal, com bolinhas vazias (`inclui` para ≤ e ≥) |
| `condicao` | a condição dos testes: as formas de `intervalos`, e também produtos e quadrados: `'(x − 2)(x − 5) < 0'`, `'x² < 9'`, `'x(x − 4) < 0'`, `'−1 ≤ 2x + 1 < 7'`, `'x ≥ −1 e x < 3'`, `'40 + 0,5x ≤ 100'`, `'(7 + 8 + x) / 3 ≥ 6'`. Uma letra só (`'a > 2'` vale). Sem parênteses que não fecham, sem duas letras. Com `condicao`, embaixo da reta fica guardado o lugar da conta (a reta não pula quando ela aparece) |
| `testados` | números já postos na condição: cada um com uma bolinha verde e ✓ em cima, ou rosa e ✗; o número embaixo na mesma cor. Na ponta de uma faixa, fica só a bolinha da faixa (vazia ou cheia) e o ✓/✗ |
| `testado` | o teste cuja conta aparece embaixo (padrão: o último de `testados`). A conta tem até três linhas: os lados que não são só um número (`2 · 5 + 3 = 13`; `(3 − 2)(3 − 5) = 1 · (−2) = −2`), a comparação em verde ou rosa (`13 < 11 ✗`, `−2 < 0 ✓`, `−1 ≤ 7 < 7 ✗`) e, no empate, `3 é igual a 3: não é maior.` |
| `solucao: true` | com `condicao`: a faixa do que serve (a mesma de pôr a condição em `intervalos`) |
| `espelhado` | multiplicar por −1. `false`: o antes; `true`: cada número de `numeros` vai para o oposto (3 → −3), e cada faixa de `intervalos` vira para o outro lado do zero (x < 3 → a faixa de −3 em diante), com os arcos tracejados de cada número até o oposto. Com a chave (mesmo `false`), embaixo vem a frase sozinha: com dois `numeros`, `3 < 5` vira `−3 > −5`; com um intervalo, `x < 3` vira `−x > −3`, e o sinal novo fica âmbar e maior. Um `comparacao` em texto troca a frase. Em cima fica guardado o lugar do botão × (−1). Use com `sinais: true` para os negativos ficarem azuis |
| `letra` | outra letra nas frases do espelho (padrão `x`) |

```ts
// x > 3: bolinha vazia no 3 e a seta
{ modelo: 'reta', estado: { de: 0, ate: 8, passo: 1, marcas: [0, 8], intervalos: ['x > 3'], comparacao: 'x > 3' } }
// x ≥ 3: bolinha cheia
{ modelo: 'reta', estado: { de: 0, ate: 8, passo: 1, marcas: [0, 8], intervalos: [{ de: 3, inclui: true }], comparacao: 'x ≥ 3' } }
// um pedaço entre dois números
{ modelo: 'reta', estado: { de: 0, ate: 8, passo: 1, marcas: [0, 8], intervalos: ['2 < x ≤ 5'], comparacao: '2 < x ≤ 5' } }
// duas condições e o que serve às duas, em verde
{ modelo: 'reta', estado: { de: -4, ate: 6, passo: 1, marcas: [-4, 0, 6], intervalos: [{ condicao: 'x ≥ −1', rotulo: 'x ≥ −1' }, { condicao: 'x < 3', rotulo: 'x < 3' }], sobreposicao: true, comparacao: '−1 ≤ x < 3' } }
// sem sobreposição
{ modelo: 'reta', estado: { de: -2, ate: 8, passo: 1, marcas: [-2, 8], intervalos: [{ condicao: 'x < 1', rotulo: 'x < 1' }, { condicao: 'x > 4', rotulo: 'x > 4' }], sobreposicao: true, comparacao: 'Nenhum número serve às duas.' } }
// a união do 2º grau
{ modelo: 'reta', estado: { de: -6, ate: 6, passo: 1, sinais: true, marcas: [-6, 0, 6], intervalos: ['x < −3 ou x > 3'], comparacao: 'x < −3 ou x > 3' } }
// o sinal em cada pedaço, e o que serve pintado
{ modelo: 'reta', estado: { de: 0, ate: 7, passo: 1, marcas: [0, 7], regioes: [{ ate: 2, sinal: '+' }, { de: 2, ate: 5, sinal: '−', serve: true }, { de: 5, sinal: '+' }], comparacao: '(x − 2)(x − 5) < 0' } }
{ modelo: 'reta', estado: { de: -6, ate: 6, passo: 1, marcas: [-6, 0, 6], regioes: [{ ate: -3, sinal: '+', serve: true }, { de: -3, ate: 3, sinal: '−' }, { de: 3, sinal: '+', serve: true }], comparacao: 'x² − 9 > 0' } }
// testes prontos (o estado depois do Mexa "testar"), com a conta do 3
{ modelo: 'reta', estado: { de: 0, ate: 8, passo: 1, marcas: [0, 8], condicao: 'x > 3', testados: [1, 5, 3], solucao: true } }
{ modelo: 'reta', estado: { de: -1, ate: 7, passo: 1, marcas: [-1, 7], condicao: '(x − 2)(x − 5) < 0', testados: [0, 3, 6], testado: 3, solucao: true } }
// o espelho: antes e depois
{ modelo: 'reta', estado: { de: -6, ate: 6, passo: 1, sinais: true, marcas: [-6, 0, 6], numeros: [3, 5], espelhado: false } }
{ modelo: 'reta', estado: { de: -6, ate: 6, passo: 1, sinais: true, marcas: [-6, 0, 6], numeros: [3, 5], espelhado: true } }
{ modelo: 'reta', estado: { de: -6, ate: 6, passo: 1, marcas: [-6, 0, 6], intervalos: ['x < 3'], espelhado: true } } // −x > −3
```

Os Mexa da reta para inequações:

```ts
// testar: o aluno toca números da reta; no fim aparece o pedaço inteiro. O 3 tem de ser testado (o empate)
{ tipo: 'mexa', texto: 'Quais números servem a x > 3?', visual: { modelo: 'reta', estado: { de: 0, ate: 8, passo: 1, marcas: [0, 8], condicao: 'x > 3' } },
  acao: { tipo: 'tocar', instrucao: 'Toque em 4 números da reta. Teste também o 3.', sucesso: { testados: 4, testar: [3] }, mostre: 'Do 3 para a direita, sem o 3: x > 3.' }, descoberta: 'x > 3 é um pedaço da reta; o 3 não entra.' }
// testar no 2º grau: um número em cada pedaço
{ tipo: 'mexa', texto: 'Ponha um número de cada pedaço em (x − 2)(x − 5).', visual: { modelo: 'reta', estado: { de: -1, ate: 7, passo: 1, marcas: [-1, 7], condicao: '(x − 2)(x − 5) < 0' } },
  acao: { tipo: 'tocar', instrucao: 'Teste o 0, o 3 e o 6.', sucesso: { testar: [0, 3, 6] }, mostre: 'Só o pedaço do meio dá negativo.' }, descoberta: 'O sinal só muda nas raízes.' }
// espelhar: um toque em × (−1)
{ tipo: 'mexa', texto: '3 < 5. E multiplicados por −1?', visual: { modelo: 'reta', estado: { de: -6, ate: 6, passo: 1, sinais: true, marcas: [-6, 0, 6], numeros: [3, 5] } },
  acao: { tipo: 'tocar', instrucao: 'Toque em × (−1).', sucesso: { espelhado: true }, mostre: 'Os dois vão para o outro lado do zero: −3 > −5.' }, descoberta: 'Multiplicar por −1 espelha a reta e inverte o sinal.' }
```

Limites (medidos no celular, 390 × 844, e no computador):

- Cabem bem retas de até uns 12 traços no celular (de −6 a 6). Com mais, os números embaixo se afastam um do outro e encostam; use `marcas` só nas pontas e nos números que importam.
- Até três `intervalos`; com dois, os `rotulo` cabem com até 6 caracteres de cada lado da bolinha. A sobreposição só olha os dois primeiros.
- No espelho, use até 3 `numeros` (dois para a frase sozinha) e uma reta simétrica em torno do zero (de −6 a 6): um número cujo oposto sai da reta não ganha arco. A frase sozinha só aparece com dois `numeros`, ou com um intervalo e sem `numeros`.
- A conta do teste cabe em uma linha no celular até uns 34 caracteres (`(3 − 2)(3 − 5) = 1 · (−2) = −2`); passando, ela quebra em duas.
- `regioes` e `testados` ao mesmo tempo disputam o espaço acima da reta: use um ou outro.

As duas raízes de x² = 25 (AF.U3), sem chave nova: os dois pulos de mesmo tamanho, do 0 para cada lado.

```ts
{ modelo: 'reta', estado: { de: -6, ate: 6, passo: 1, sinais: true, marcas: [-5, 0, 5], numeros: [-5, 5], saltos: [[0, 5, '+5'], [0, -5, '−5']] } }
// ou com as distâncias até o zero
{ modelo: 'reta', estado: { de: -6, ate: 6, passo: 1, sinais: true, marcas: [-5, 0, 5], numeros: [-5, 5], distancias: [[-5, '5'], [5, '5']] } }
```

### `retangulo`

O retângulo de multiplicação. Duas formas:

**Em quadradinhos** (fatos até 12 × 12): `linhas` × `colunas` quadradinhos.

| Chave | Efeito |
|---|---|
| `linhas`, `colunas` | o tamanho; mudanças animam (uma linha nova desliza para baixo) |
| `rotulos: true` | escreve quantas linhas (à esquerda) e quantas colunas (em cima); com cortes, o tamanho de cada parte |
| `cortes` | colunas onde o retângulo se parte, contando da esquerda (`[5]` parte 7 colunas em 5 + 2) |
| `cortesLinhas` | o mesmo, nas linhas |
| `areas: true` | escreve o produto dentro de cada parte |
| `destaque` | acende uma parte: `[linha, coluna]` das partes (`[0, 1]`), uma lista de partes (`[[0, 1], [1, 0]]`), `'linha'` (a primeira linha, um grupo) ou `'coluna'` (a primeira coluna) |
| `sobra` | o resto: quadradinhos soltos, contornados em âmbar, numa linha incompleta embaixo do retângulo |
| `girar: true` | o retângulo gira 90° (linhas viram colunas) |
| `total` | o número embaixo |
| `grupos: true` | cada linha aparece como um grupo separado (pacotes iguais), com um pequeno espaço entre as linhas |
| `faixas: [l, c]` | fração de fração: as primeiras `l` linhas e as primeiras `c` colunas ficam claras, e o cruzamento das duas, em âmbar (`linhas: 3, colunas: 4, faixas: [2, 3]` é 2/3 de 3/4 = 6/12) |

**Por área** (números maiores, sem quadradinhos): `base` e `altura` são listas das partes de cada lado.

| Chave | Efeito |
|---|---|
| `base`, `altura` | ex.: `base: [20, 3]`, `altura: [10, 4]` para 23 × 14; as partes ficam proporcionais (com um tamanho mínimo para caber o rótulo). Uma parte pode ser uma letra (U14): `base: ['x', 3]`, `altura: [2]` é 2(x + 3), e `areas: true` escreve 2x e 6; x × x vira x² |
| `tamanhoLetra` | quanto uma letra ocupa, na escala dos números (padrão: 1,6 vez a maior parte numérica, no mínimo 4) |
| `total` | o número (ou o texto, como `'2x + 6'`) embaixo |
| `areas: true` ou `areas: [[200, 30], [80, 12]]` | escreve o produto em cada parte (true calcula; uma lista escreve o que vier, inclusive `'?'`) |
| `destaque`, `total` | como acima. Uma lista acende várias partes juntas: em (x + 3)², `destaque: [[0, 1], [1, 0]]` acende os dois 3x do meio. Uma parte negativa acesa continua vermelha, mais forte |
| lados iguais | com `base` e `altura` iguais (`['x', 3]` e `['x', 3]`), o desenho é um quadrado, no celular e no computador: (x + 3)² |
| monômios nos lados | uma parte pode ser um monômio (AF.U1): `-2`, `'3x'`, `'x²'`, `'2x²'`, `'−x'`, `'−3x'`, `'y'`, `'xy'`, `'2a'` (o hífen vale como menos). `areas: true` multiplica de verdade: x² · 3x = 3x³, 2x · (−3) = −6x, x · y = xy, −x · (−2) = 2x. O desenho: um número pelo valor absoluto, x² mais comprido que x, 3x umas 2,5 vezes o x (limitado, para caber no celular), y mais curto que x. Ex.: (x − 2)(x + 3) é `base: ['x', 3], altura: ['x', -2], areas: true` |
| partes negativas | o rótulo de uma parte negativa e as partes com área negativa ficam vermelhos, como os azulejos negativos: o aluno vê o que se subtrai. A área mantém o sinal (−6x) |
| `oculto: 'base'` (ou `'altura'`) | esse lado aparece com `?` em cada parte, mas o desenho usa as partes de verdade. Para a divisão: (6x² + 9x) ÷ 3x é `base: ['2x', 3], altura: ['3x'], areas: [['6x²', '9x']], oculto: 'base'` |
| `somaTermos: true` | embaixo, a soma das áreas e, juntando os termos semelhantes, a soma simplificada: `x² + 3x + 2x + 6` e `= x² + 5x + 6` (em âmbar). Os termos ficam do grau maior para o menor. Se nada se junta, aparece uma linha só |
| `cancela: true` | duas partes de áreas opostas (3x e −3x) aparecem apagadas e riscadas, como os azulejos que se cancelam. Na `somaTermos`, os dois termos também aparecem riscados: `x² + 3x − 3x − 9` e `= x² − 9`. Ex.: (x + 3)(x − 3) é `base: ['x', 3], altura: ['x', -3], areas: true, cancela: true, somaTermos: true`. Funciona com `revelar` (risca quando as duas áreas estão descobertas) |
| `revelar: true` | o Mexa "revelar" (veja abaixo) |

No Mexa "revelar", cada parte começa com `?` e borda tracejada; o toque descobre a área dela (com um pulo) e acende a parte. Com `oculto`, as áreas já aparecem e o toque descobre a parte do lado escondido (qualquer parte da coluna serve). O `total` e a `somaTermos` aparecem quando tudo está descoberto. `sucesso.reveladas` é o número de partes (com `oculto`, o de partes do lado escondido); os testes cobram.

```ts
// revelar: (x + 2)(x + 3), as quatro áreas uma a uma
{ tipo: 'mexa', texto: 'O retângulo tem quatro pedaços.', visual: { modelo: 'retangulo', estado: { base: ['x', 3], altura: ['x', 2], revelar: true, somaTermos: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque em cada pedaço para ver a área.', sucesso: { reveladas: 4 }, mostre: 'As quatro áreas aparecem.' }, descoberta: 'x² + 3x + 2x + 6 = x² + 5x + 6.' }
// revelar com o lado escondido: a área e um lado dão o outro lado
{ tipo: 'mexa', texto: 'A área é 6x² + 9x e a altura é 3x.', visual: { modelo: 'retangulo', estado: { base: ['2x', 3], altura: ['3x'], areas: [['6x²', '9x']], oculto: 'base', revelar: true, total: '2x + 3' } },
  acao: { tipo: 'tocar', instrucao: 'Toque em cada parte para achar o lado de cima.', sucesso: { reveladas: 2 }, mostre: 'O lado é 2x + 3.' }, descoberta: '(6x² + 9x) ÷ 3x = 2x + 3.' }
```

### `retangulo`: o recorte da diferença de quadrados

A diferença de quadrados da AF.U2: um quadrado x por x sem um canto b por b. O L que sobra se parte em dois retângulos; o de baixo gira e vai para o lado do outro, e os dois formam um retângulo só, (x + b) por (x − b). A área não muda: x² − 9 = (x + 3)(x − 3).

| Chave | Efeito |
|---|---|
| `recorte` | o lado do canto que falta, um número (`recorte: 3` é x² − 9). O x é desenhado umas três vezes maior que o b, sempre igual (é um tamanho que não sabemos). Antes: em cima "x", à esquerda "x"; à direita e embaixo, os pedaços do lado ("x − 3" e "3"); o canto tracejado, com 9 dentro; o pedaço de baixo em âmbar; embaixo, `x² − 9` |
| `movido: true` | o depois: o retângulo (x + 3) por (x − 3), com "x + 3" em cima (numa cota), "x − 3" à esquerda, e "x" e "3" dentro, em cima de cada pedaço. Embaixo, em âmbar, `x² − 9 = (x + 3)(x − 3)` |
| `letra` | outra letra no lugar do x (`'a'`) |
| `mover: true` | o Mexa "mover" (veja abaixo) |

O recorte não usa `base` nem `altura`: com `recorte`, as outras chaves do retângulo ficam de fora.

No Mexa "mover", o pedaço de baixo aparece com a borda tracejada e a linha do corte, em âmbar, já marcada. O toque corta, o pedaço gira um quarto de volta e desliza para a direita do outro; depois os rótulos mudam e a igualdade aparece embaixo.

```ts
// mover: x² − 9 vira (x + 3)(x − 3)
{ tipo: 'mexa', texto: 'Do quadrado de lado x saiu um canto de 3 por 3. Sobrou x² − 9.', visual: { modelo: 'retangulo', estado: { recorte: 3, mover: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque no pedaço tracejado para cortar e levar para o lado.', sucesso: { movido: true }, mostre: 'O pedaço vai para o lado e o L vira um retângulo.' }, descoberta: 'x² − 9 = (x + 3)(x − 3).' }
// antes e depois, sem Mexa
{ modelo: 'retangulo', estado: { recorte: 2 } }
{ modelo: 'retangulo', estado: { recorte: 2, movido: true } }
```

### `quadro-posicional`: divisão na chave

| Chave | Efeito |
|---|---|
| `divisao` | `{ dividendo: 612, divisor: 6, quociente?: '10', linhas?: [['−6', 0], ['01', 1]], destaque?: 1 }`. O método da chave: o dividendo à esquerda, o divisor na caixa, o quociente embaixo do divisor (os algarismos já escritos, da esquerda). Cada linha embaixo do dividendo é um texto e o índice da casa do dividendo (da esquerda, a partir de 0) onde o último caractere termina. `destaque` acende uma casa do dividendo |
| `divisao` com vírgula | `dividendo` em texto (`'10,000'`): a vírgula ocupa uma casa, e o quociente leva a sua (`quociente: '3,333'`). Conte a vírgula ao dar a casa de cada linha; um espaço na linha deixa a casa da vírgula vazia (`['1 0', 3]` põe o 1 embaixo do 0 das unidades e o 0 embaixo do primeiro décimo) |

### `livre`: expressões e calculadoras

| Chave | Efeito |
|---|---|
| `expressao` com `fichas` + `lugares` | a expressão em cima e as fichas para pôr em ordem embaixo (o Mexa `ordem`) |
| `expressao` + (`destaque`) | uma expressão resolvida em etapas, uma por linha, de cima para baixo (`['2 + 3 × 4', '2 + 12', '14']`); a última fica maior. Uma linha comprida encolhe até caber na largura (no mínimo 18 px). `destaque` é um trecho da última linha que ganha uma moldura âmbar (`'3 × 4'`) |
| `calculadoras` | visores lado a lado: `[{ nome: 'Celular', teclas: '2 + 3 × 4 =', visor: '20' }, …]` |

### `livre`

Um destes, nesta ordem:

| Chave | Efeito |
|---|---|
| `jornada` + `aqui` (+ `feitas`) | o caminho da formação: paradas ligadas por uma linha, a atual acesa com "você está aqui" |
| `fichas` + `lugares` | fichas para pôr em ordem |
| `etapas` + `etapa` | o ciclo, com a etapa atual acesa |
| `pagina` | uma página de caderno com os blocos |
| `materiais` | itens com ícone |
| `dicas` | 3 linhas numeradas |
| `atalho` + `destino` | dois cartões com uma seta |
| `alvos`, `registros`, `caminhos`, `comparacao`, `superficie` | uma lista |

Um estado `livre` sem nenhuma dessas chaves não desenha nada. O cartão fica só com o texto, maior.

### `livre`: tabela de proporção

A tabela de proporção da U10: uma grandeza em cada linha e os pares lado a lado, em colunas. As setas mostram a conta que leva de uma coluna a outra (em cima e embaixo) ou de uma linha à outra (à direita).

| Chave | Efeito |
|---|---|
| `tabela.linhas` | `[{ rotulo: 'farinha (xícaras)', valores: [2, 4, 6] }, { rotulo: 'ovos', valores: [3, 6, '?'] }]`. `'?'` ou `null` é o valor que falta: aparece em âmbar, com borda tracejada |
| `tabela.setas` | setas curvas entre colunas: `[{ de: 0, para: 1, rotulo: '× 2' }, { de: 0, para: 1, rotulo: '÷ 2', embaixo: true }]`. Sem `embaixo`, a seta fica em cima da primeira linha; com ela, embaixo da última. Na proporção inversa, × em cima e ÷ embaixo |
| `tabela.fator` | uma seta à direita, da primeira linha para a segunda, com o fator que vale para toda coluna (`'× 12'`: R$ 12 o quilo) |
| `tabela.fatorNoFim: true` | o `fator` só aparece quando todas as colunas estão à vista: no Mexa, depois que o aluno completa a tabela |
| `tabela.destaque` | colunas com moldura âmbar (`[2]`) |
| `tabela.mostradas` | quantas colunas aparecem; as outras ficam como caixas vazias |
| `tabela.completar: true` | o Mexa "completar" (veja abaixo) |

Os números de cada linha têm o mesmo tamanho, o que cabe no mais comprido da linha (uma linha de 1.000.000 não encolhe a linha de 10⁶). Com muitas colunas no celular (5 ou mais), os rótulos encolhem primeiro.

### `livre`: fichas de saldo

As fichas da U12: cada **+** (âmbar) é 1 real que você tem, cada **−** (azul) é 1 real que você deve. As + ficam em cima e as − embaixo, alinhadas: uma coluna com as duas é um par que vale zero.

| Chave | Efeito |
|---|---|
| `saldo.positivas`, `saldo.negativas` | quantas fichas de cada sinal (`{ positivas: 3, negativas: 5 }`). Cabem umas 12 por linha no celular |
| `saldo.pares: true` | uma moldura tracejada em cada coluna com + e −, e "0" embaixo |
| `saldo.riscadas` | fichas que saíram, apagadas e riscadas, no fim da linha: `{ negativas: 2 }` |
| `saldo.mostraSaldo: true` | embaixo, "saldo: −2" (o que sobra) |
| `saldo.rotulo` | a frase embaixo, no lugar do saldo |
| `saldo.tirar` | `'−'` ou `'+'`: o Mexa "tirar" (veja abaixo) |

### `livre`: azulejos algébricos

Os azulejos da U14: o quadradinho vale **1**, a barra vale **x** (o lado comprido é o x) e o quadrado grande vale **x²**. As peças negativas são vermelhas, com o sinal de menos.

| Chave | Efeito |
|---|---|
| `azulejos.pecas` | as peças, na ordem em que aparecem: `['x', '1', 'x', 'x²', '1']`. Negativas: `'−x'`, `'−1'`, `'−x²'` (o hífen também vale) |
| `azulejos.letra` | outra letra no lugar do x (`'a'`) |
| `azulejos.agrupado: true` | as peças aparecem juntas por tipo, com a contagem embaixo de cada grupo (`3x`, `2`, `−x`) |
| `azulejos.mostraExpressao: true` | com as peças juntas, a expressão simplificada embaixo (`x² + 3x + 3`; x e −x se cancelam na conta) |
| `azulejos.rotulo` | a frase embaixo, no lugar da expressão |
| `azulejos.agrupar: true` | o Mexa "agrupar" (veja abaixo) |
| `azulejos.montes: 2` | as peças soltas em montes iguais, na ordem da lista, com um vão entre eles: `2(x + 3)` são 2 montes de `x + 3` |
| `azulejos.cancela: true` | com as peças juntas, cada par de opostos (um `x` e um `−x`, um `1` e um `−1`) aparece apagado e riscado: vale zero |
| `azulejos.montes: [3, 5]` | montes de tamanhos diferentes: um de 3 peças e um de 5, na ordem da lista |
| `azulejos.virar: 1` | o índice do monte que vem com um − vermelho na frente, dentro de uma moldura: o menos antes do parêntese. É o Mexa "virar" (veja abaixo) |
| `azulejos.virado: true` | o monte `virar` já aparece virado: cada peça com o sinal trocado e um + na frente. A expressão embaixo usa as peças viradas |

No Mexa "virar", o toque no monte vira todas as peças dele de uma vez (cada uma gira e mostra o outro lado: x² vira −x², −x vira x, 1 vira −1), e o − vira +. Use com `montes` em lista, porque os dois polinômios raramente têm o mesmo número de peças. Para juntar depois, o próximo cartão traz as peças já viradas (com `agrupar` ou `agrupado`).

```ts
// virar: (x² + 2x) − (x² − 3x + 1)
{ tipo: 'mexa', texto: 'O menos está na frente do parêntese inteiro.', visual: { modelo: 'livre', estado: { azulejos: { pecas: ['x²', 'x', 'x', 'x²', '−x', '−x', '−x', '1'], montes: [3, 5], virar: 1 } } },
  acao: { tipo: 'tocar', instrucao: 'Toque no monte com o menos na frente.', sucesso: { virado: true }, mostre: 'Todas as peças do monte trocam de sinal.' }, descoberta: '−(x² − 3x + 1) = −x² + 3x − 1.' }
```

Com um tipo só, a expressão embaixo não repete a contagem do grupo.

### `livre`: azulejos em retângulo (fatorar)

Os azulejos de x² + bx + c arrumados num retângulo, para fatorar (AF.U2). O x² fica no canto de cima, à esquerda; p barras de pé à direita dele; q barras deitadas embaixo; e os c quadradinhos numa grade de p colunas por q linhas, no canto de baixo. Em cima, "x + p"; à esquerda, "x + q". O retângulo fecha quando p × q = c e p + q = b.

| Chave | Efeito |
|---|---|
| `azulejos.retangulo: [p, q]` | o retângulo pronto de (x + p)(x + q). Embaixo, em âmbar, `x² + 5x + 6 = (x + 2)(x + 3)`; com p = q, `x² + 4x + 4 = (x + 2)²` (um quadrado) |
| `azulejos.fatorar: [b, c]` | as peças de x² + bx + c, soltas: o x², as b barras de pé ao lado dele (até 5 por linha) e os c quadradinhos embaixo (até 6 por linha). Embaixo, `x² + 5x + 6` |
| `azulejos.arranjo: [p, q]` | com `fatorar`: os quadradinhos numa grade de p colunas por q linhas, e as barras atrás (à direita primeiro, depois embaixo). Se o par pede mais barras do que há, as que faltam são vagas tracejadas no fim da fila de baixo ("faltam 2 barras", em rosa). Se pede menos, as que sobram ficam de lado, à direita, apagadas ("sobram 2 barras") |
| `azulejos.letra` | outra letra no lugar do x |

Limites: b até 8 e c até 12. O pior caso, 1 × 12, ainda deixa o "1" legível (o quadradinho fica com uns 27 px no celular e uns 18 px no computador); abaixo de 15 px o "1" some. Os pares vêm do mais fino ao mais largo (1 × 6, depois 2 × 3), com p ≤ q: p são as colunas, q as linhas.

No Mexa "fatorar", as peças começam soltas (ou em `arranjo`, se vier). Cada toque arruma os quadradinhos do próximo jeito possível, só os pares de fatores de c (1 × 6, 2 × 3, e de volta ao primeiro), e as barras vão atrás. O par que não fecha não conta como erro: o desenho mostra as vagas ou as sobras, e a frase diz por quê ("1 + 6 = 7 barras, mas você tem 5: faltam 2 barras. Toque de novo."). Quando p + q = b, o retângulo fecha e o Mexa termina. `sucesso.fatorado` é o par que fecha, em qualquer ordem; um par que não tem soma b (ou um trinômio sem par) não vira Mexa. Todos os arranjos usam a mesma escala, para nada mudar de tamanho entre um toque e outro.

```ts
// fatorar: x² + 5x + 6
{ tipo: 'mexa', texto: 'Os azulejos de x² + 5x + 6: um x², 5 barras e 6 quadradinhos. Dá para montar um retângulo?', visual: { modelo: 'livre', estado: { azulejos: { fatorar: [5, 6] } } },
  acao: { tipo: 'tocar', instrucao: 'Toque nos azulejos para arrumar os quadradinhos de outro jeito.', sucesso: { fatorado: [2, 3] }, mostre: 'Com 2 × 3, as 5 barras fecham o retângulo.' }, descoberta: 'x² + 5x + 6 = (x + 2)(x + 3): 2 · 3 = 6 e 2 + 3 = 5.' }
// o retângulo pronto, nos cartões seguintes
{ modelo: 'livre', estado: { azulejos: { retangulo: [2, 3] } } }
// um par que não serve: 2 × 3 em x² + 7x + 6 (sobram 2 barras)
{ modelo: 'livre', estado: { azulejos: { fatorar: [7, 6], arranjo: [2, 3] } } }
```

### `livre`: azulejos que completam o quadrado

Completar o quadrado com os azulejos (AF.U3). As peças de x² + bx: o x² e b barras. Partidas, b/2 barras ficam de pé à direita do x² e b/2 deitadas embaixo, e o canto de baixo, à direita, fica vazio e tracejado, (b/2) por (b/2). Completo, o canto se enche com (b/2)² quadradinhos novos, em âmbar claro: x² + 6x + 9 = (x + 3)².

| Chave | Efeito |
|---|---|
| `azulejos.completar: b` | as peças de x² + bx, soltas: o x² e as barras ao lado dele (numa fila até 4 barras; depois, em duas filas de b/2). Embaixo, `x² + 6x`. b é par, de 2 a 10; outro b não desenha nada |
| `azulejos.partido: true` | as barras partidas ao redor do x², o canto vazio tracejado com "3 × 3" dentro (quando cabe), "x + 3" em cima e à esquerda, e embaixo `x² + 6x` e, em âmbar, "falta um canto 3 por 3" |
| `azulejos.completo: true` | o canto cheio com os 9 quadradinhos novos. Embaixo, em âmbar, `x² + 6x + 9 = (x + 3)²`, com o "+ 9" sublinhado |
| `azulejos.igual: c` | o lado direito da equação: `x² + 6x = 16`; completo, `x² + 6x + 9 = 16 + 9` (os dois "+ 9" sublinhados) e, em âmbar, `(x + 3)² = 25`. Com c + (b/2)² negativo (o discriminante), a segunda linha fica rosa, `(x + 1)² = −4`, e uma terceira diz "nenhum quadrado tem área negativa" |
| `azulejos.letra` | outra letra no lugar do x |

As três fases de um mesmo b usam a mesma escala, no Mexa e nos cartões estáticos: nada muda de tamanho entre um toque e outro, nem de um cartão para o outro (dê o mesmo b e o mesmo `igual` na sequência). Com b = 10, o quadradinho fica com uns 27 px no celular.

No Mexa "completar", as barras começam soltas (ou partidas, com `partido: true`). O primeiro toque as parte em duas metades ao redor do x² e aparece o canto vazio; o segundo enche o canto, quadradinho por quadradinho, e aparece o "+ 9". `sucesso` é `{ completo: true }`.

```ts
// completar: x² + 6x vira (x + 3)²
{ tipo: 'mexa', texto: 'Os azulejos de x² + 6x: um x² e 6 barras. Dá para montar um quadrado?', visual: { modelo: 'livre', estado: { azulejos: { completar: 6 } } },
  acao: { tipo: 'tocar', instrucao: 'Toque nos azulejos: as barras se partem ao redor do x².', sucesso: { completo: true }, mostre: 'Metade das barras de cada lado; o canto 3 por 3 se enche com 9.' }, descoberta: 'x² + 6x + 9 = (x + 3)².' }
// com o lado direito: x² + 6x = 16
{ tipo: 'mexa', texto: 'Para resolver x² + 6x = 16, complete o quadrado.', visual: { modelo: 'livre', estado: { azulejos: { completar: 6, igual: 16 } } },
  acao: { tipo: 'tocar', instrucao: 'Toque nos azulejos.', sucesso: { completo: true }, mostre: 'O 9 entra dos dois lados.' }, descoberta: '(x + 3)² = 25.' }
// estáticos, nos cartões seguintes
{ modelo: 'livre', estado: { azulejos: { completar: 6, partido: true } } }
{ modelo: 'livre', estado: { azulejos: { completar: 6, completo: true } } }
// o discriminante: x² + 2x = −5 dá (x + 1)² = −4
{ modelo: 'livre', estado: { azulejos: { completar: 2, igual: -5, completo: true } } }
```

### `livre`: o produto que zera

A tabela do produto que zera (AF.U3). Em cima, o produto, `(x − 2)(x + 3)`. Embaixo, uma coluna por valor de x: na primeira linha, os botões de x; depois, cada fator e o produto. Um valor já posto mostra os números; o fator que dá zero fica âmbar, e o produto zero ganha uma moldura âmbar (o botão também acende). Na conta de baixo, o x da vez: `(2 − 2) · (2 + 3)` e `= 0 · 5 = 0`, com o produto grande e o fator zero em âmbar. Os negativos têm o menos de verdade (−3), entre parênteses na conta (`(−5) · 0`).

| Chave | Efeito |
|---|---|
| `produtoZero.fatores` | o a de cada fator x + a: `[-2, 3]` é (x − 2)(x + 3); `[0, -4]` é x(x − 4) (o fator x não tem linha própria: ela repetiria a do x) |
| `produtoZero.valores` | os valores de x, na ordem dos botões: `[-4, -3, 0, 1, 2, 3]`. Cabem uns 8 no celular |
| `produtoZero.x` | o x da conta de baixo (ele conta como já posto) |
| `produtoZero.marcados` | os valores já postos: a coluna deles mostra os números |
| `produtoZero.letra` | outra letra no lugar do x |

No Mexa "zerar", cada toque num botão põe aquele x: a coluna se preenche e a conta aparece embaixo. Um valor que não zera não é erro: é para o aluno ver. Termina quando o aluno pôs todos os valores que zeram o produto. `sucesso` é `{ raizes: [2, -3] }`, em qualquer ordem; as raízes têm de ser as de verdade e ter botão, senão o cartão não vira Mexa.

```ts
// zerar: (x − 2)(x + 3) só zera em 2 e em −3
{ tipo: 'mexa', texto: 'Troque o x em (x − 2)(x + 3) e veja o produto.', visual: { modelo: 'livre', estado: { produtoZero: { fatores: [-2, 3], valores: [-4, -3, 0, 1, 2, 3] } } },
  acao: { tipo: 'tocar', instrucao: 'Toque nos valores de x. Quais dão produto zero?', sucesso: { raizes: [2, -3] }, mostre: 'Só 2 e −3 zeram o produto.' }, descoberta: 'O produto só dá zero quando um dos fatores dá zero.' }
// uma conta pronta
{ modelo: 'livre', estado: { produtoZero: { fatores: [-2, 3], valores: [-4, -3, 0, 1, 2, 3], x: 2 } } }
// a tabela inteira, nos cartões seguintes
{ modelo: 'livre', estado: { produtoZero: { fatores: [-2, 3], valores: [-4, -3, 0, 1, 2, 3], marcados: [-4, -3, 0, 1, 2, 3], x: -3 } } }
// x(x − 4): a raiz 0 que a divisão por x perderia
{ modelo: 'livre', estado: { produtoZero: { fatores: [0, -4], valores: [-1, 0, 1, 2, 3, 4], marcados: [-1, 0, 1, 2, 3, 4], x: 0 } } }
```

### `livre`: o sistema empilhado (adição e substituição)

As contas dos sistemas (AF.U4) que não precisam do plano. As equações aparecem uma embaixo da outra, em letra grande; os termos em x ficam âmbar e os em y, azuis.

**A adição.** As equações alinhadas termo a termo (x sobre x, y sobre y, = sobre =), como duas balanças em equilíbrio uma sobre a outra.

| Chave | Efeito |
|---|---|
| `sistema.equacoes` | as equações, uma por linha: `['x + y = 10', 'x − y = 4']`. Cada uma vira a·x + b·y = c (um `'y = x + 2'` aparece como `−x + y = 2`: escreva na forma de somar). No máximo duas letras |
| `sistema.vezes` | por quanto multiplicar cada linha antes de somar: `[1, -1]` põe "× (−1)" ao lado da segunda |
| `sistema.multiplicado: true` | as linhas com fator já aparecem multiplicadas (`−x − y = −5`); o "× (−1)" fica, apagado |
| `sistema.somado: true` | um + à esquerda, um traço e a linha da soma embaixo (`2x = 14`). Os termos que se anulam ficam riscados em rosa nas duas linhas, e a coluna deles fica vazia na soma. Com `vezes`, a soma usa as linhas multiplicadas. Se todas as letras somem, a soma é `0 = 2` (nenhuma solução) ou `0 = 0` (infinitas); se nenhuma some, `2x + 3y = 24` mostra que a soma não ajudou |

**A substituição.** A primeira equação diz quanto vale uma letra; o que ela vale fica numa caixa. Na segunda, a letra fica acesa, sublinhada.

| Chave | Efeito |
|---|---|
| `sistema.trocar: 'y'` | com `equacoes: ['y = x + 2', 'x + y = 10']`: a caixa `x + 2` e o y aceso em `x + y = 10`. A primeira tem de ser `y = …` (sem y do lado direito) e a segunda, ter o y |
| `sistema.trocado: true` | a caixa voa para o lugar do y, com os parênteses: `x + (x + 2) = 10`; `2x + 3y = 21` vira `2x + 3(x − 3) = 21`. Em cima fica a marca tracejada de onde ela saiu |

A conta que vem depois (`2x + 2 = 10`, `x = 4`, e a outra letra) vai em TeX nos cartões, ou no caderno do passo a passo.

No Mexa "somar", um toque nas equações multiplica (se houver `vezes`; o "× (−1)" pisca tracejado) e o seguinte soma (o + pisca tracejado). `sucesso` é `{ somado: true }`; `{ multiplicado: true }` para só multiplicar. No Mexa "trocar", um toque leva a caixa; `sucesso` é `{ trocado: true }`.

```ts
// somar: x + y = 10 e x − y = 4; o y some
{ tipo: 'mexa', texto: 'Duas balanças em equilíbrio, somadas, continuam em equilíbrio.', visual: { modelo: 'livre', estado: { sistema: { equacoes: ['x + y = 10', 'x − y = 4'] } } },
  acao: { tipo: 'tocar', instrucao: 'Toque nas equações para somar uma com a outra.', sucesso: { somado: true }, mostre: '+y e −y se anulam: sobra 2x = 14.' }, descoberta: 'Somando, o y some: 2x = 14.' }
// multiplicar antes: × (−1) na segunda, depois somar
{ tipo: 'mexa', texto: 'Somadas assim, nenhuma letra some. E se a segunda virar do avesso?', visual: { modelo: 'livre', estado: { sistema: { equacoes: ['x + 2y = 7', 'x + y = 5'], vezes: [1, -1] } } },
  acao: { tipo: 'tocar', instrucao: 'Toque para multiplicar a segunda por −1; toque de novo para somar.', sucesso: { somado: true }, mostre: 'x e −x se anulam: sobra y = 2.' }, descoberta: 'Multiplicar uma equação inteira não tira o equilíbrio.' }
// estáticos
{ modelo: 'livre', estado: { sistema: { equacoes: ['x + y = 10', 'x − y = 4'], somado: true } } }
{ modelo: 'livre', estado: { sistema: { equacoes: ['3x + 2y = 16', 'x + y = 6'], vezes: [1, -2], somado: true } } }
{ modelo: 'livre', estado: { sistema: { equacoes: ['x + y = 5', 'x + y = 3'], vezes: [1, -1], somado: true } } } // 0 = 2
// trocar: y = x + 2 entra em x + y = 10
{ tipo: 'mexa', texto: 'A primeira equação diz quanto vale y.', visual: { modelo: 'livre', estado: { sistema: { equacoes: ['y = x + 2', 'x + y = 10'], trocar: 'y' } } },
  acao: { tipo: 'tocar', instrucao: 'Toque na caixa para pôr x + 2 no lugar do y.', sucesso: { trocado: true }, mostre: 'O y vira (x + 2), com os parênteses.' }, descoberta: 'Sobra uma equação com uma letra só: x + (x + 2) = 10.' }
{ modelo: 'livre', estado: { sistema: { equacoes: ['y = x − 3', '2x + 3y = 21'], trocar: 'y', trocado: true } } }
```

Cabe bem no celular com coeficientes de até dois algarismos: a letra encolhe até caber (no mínimo 18 px) e não passa de 44 px no computador.

### `barra`

A barra de frações: cada barra é um inteiro partido em partes iguais, e as pintadas (em âmbar) são a fração. Barras empilhadas têm o mesmo comprimento por inteiro, então comparam pedaços.

| Chave | Efeito |
|---|---|
| `partes`, `pintadas` | uma barra só: `{ partes: 4, pintadas: 3 }` é 3/4. A fração aparece à direita, escrita em pé |
| `barras` | várias, uma embaixo da outra: `[{ partes: 2, pintadas: 1 }, { partes: 4, pintadas: 2 }]`. Cada uma aceita as chaves abaixo |
| `inteiros` | quantos inteiros a barra tem, lado a lado (`{ partes: 4, pintadas: 5, inteiros: 2 }` é 5/4) |
| `cortes` | partes desiguais, em frações do inteiro: `[0.2, 0.55]` parte em 3 pedaços de tamanhos diferentes (aí não aparece fração) |
| `marcadas` | pinta partes fora da ordem, pelos índices (`[1, 3]`) |
| `rotulo` | o que aparece à direita no lugar da fração (`'?'`, `'1 inteiro'`) |
| `rotulos: true` | escreve 1/d dentro de cada parte |
| `semFracao: true` | esconde a fração à direita |
| `escala` | quantos inteiros cabem na largura (padrão: a barra mais longa). Use para alinhar barras de tamanhos diferentes |
| `destaque` | o índice da barra em destaque; as outras ficam apagadas |
| `guia` | uma linha tracejada vertical nesta posição, em inteiros (`0.5` para comparar com a metade) |

### `grade`

A grade dos decimais: cada grade é um inteiro, com 10 colunas de 10 quadradinhos. Uma coluna é um décimo; um quadradinho, um centésimo. O pintado (em âmbar) enche coluna por coluna, de cima para baixo: 0,25 são 2 colunas e 5 quadradinhos.

| Chave | Efeito |
|---|---|
| `pintadas` | quantos quadradinhos pintados (`25` é 0,25). Passando de 100, entram mais grades lado a lado (`135` é 1,35) |
| `grades` | vários números lado a lado, para comparar: `[{ pintadas: 25 }, { pintadas: 50 }]`. Cada um aceita `pintadas`, `inteiros`, `marcadas`, `rotulo` |
| `linhas: 1` | cada grade vira uma tira de 10 décimos (`pintadas: 7` é 0,7) |
| `inteiros` | quantas grades o número ocupa (padrão: as que o pintado pede) |
| `marcadas` | pinta quadradinhos fora da ordem, pelos índices (coluna por coluna, a partir de 0) |
| `rotulo` | o que aparece embaixo no lugar do número (`'R$ 0,25'`, `'0,50'`). Padrão: o número sem zeros no fim (`50` vira 0,5) |
| `leitura` | como ler o pintado embaixo, quando não há `rotulo`: conta os quadradinhos (vezes `vezes`) entre `antes` e `depois`, e anda com o Mexa. `{ depois: ' %' }` mostra 25 %; `{ vezes: 10, antes: 'R$ ' }` mostra R$ 640 com 64 pintados. Vale também dentro de `grades` |
| `semRotulo: true` | esconde o número embaixo |
| `separar: true` | as colunas cheias (décimos) em âmbar e os quadradinhos soltos (centésimos) em verde |
| `escala: true` | escreve 0,1 … 1 embaixo das colunas (melhor na tira) |
| `faixas: [l, c]` | multiplicação: as primeiras `l` linhas e `c` colunas ficam claras, e o cruzamento em âmbar (`[3, 4]` é 0,3 × 0,4 = 0,12) |
| `destaque` | o índice do número em destaque; os outros ficam apagados |

### `balanca`

A balança de dois pratos da U15: uma equação é uma balança em equilíbrio. Cada **caixa** âmbar é um x (todas pesam o mesmo); cada **peso** cinza vale 1; um peso rotulado ("10") vale o número escrito nele. O prato mais pesado desce; com os dois iguais, o braço fica reto e a agulha acende.

| Chave | Efeito |
|---|---|
| `esquerda`, `direita` | o que há em cada prato: `{ x: 2, n: 3 }` são 2 caixas e 3 pesos de 1. `pesos: [10, 5]` acrescenta pesos rotulados (`{ n: 2, pesos: [10] }` pesa 12). Mudanças animam: peças novas caem no prato, as que saem sobem e somem |
| n grande | até 20 pesos de 1 por prato aparecem um a um, em fileiras (as peças encolhem para caber). Passando de 20, viram pesos de 10 e os que sobram (37 = 10, 10, 10 e sete de 1) |
| `letra` | outra letra nas caixas (padrão `x`) |
| `valor` | o valor escondido de x: a balança inclina pelo peso real dos pratos. Sem `valor` e sem `inclina`, fica em equilíbrio |
| `inclina` | força a inclinação: `'esquerda'` (o prato da esquerda desce), `'direita'` ou `'equilibrio'`. Vale mais que `valor` |
| `riscadas` | peças que saíram, apagadas e riscadas, depois das outras do prato: `{ esquerda: { n: 3 }, direita: { n: 3 } }`. Não pesam nem entram na equação |
| `abrir: true` | as caixas mostram `valor` dentro (a solução revelada) |
| `dividir: k` | cada prato partido em `k` grupos iguais, um em cima do outro, com moldura tracejada: as caixas e os pesos se repartem igualmente. O grupo `grupo` (padrão 0, o de baixo) fica aceso em azul; os outros, apagados |
| `mostraEquacao: true` | a equação embaixo, lida dos pratos (`2x + 3 = 11`, `3x + 2 = x + 10`). Inclinada, o `=` vira `≠` em vermelho; com `inequacao: true`, vira `>` ou `<` em azul (o lado que desce é o maior) |
| `rotulo` | a frase embaixo, no lugar da equação (`'x = 4'`) |
| `tirar: true` | o Mexa "tirar" (veja abaixo) |

**A balança inclinada (inequações, AF.U5).** 2x + 3 < 11 é `{ esquerda: { x: 2, n: 3 }, direita: { n: 11 }, inclina: 'direita', inequacao: true, mostraEquacao: true }`: o prato da direita desce e embaixo aparece `2x + 3 < 11`, com o < em azul. O Mexa "tirar" vale para ela: quando a balança começa inclinada (por `inclina` ou por `valor`), o alvo é terminar **inclinada para o mesmo lado**, não em equilíbrio. Durante o Mexa, a inclinação segue o peso de verdade com o `valor` escondido (sem `valor`, o player escolhe um x que pende para o lado de `inclina`: com 2x + 3 < 11, x = 3); tirando só de um lado, ela pode virar para o outro lado ("A balança virou para o outro lado: você tirou só de um lado. Tire o mesmo do outro lado.") ou ficar reta ("A balança ficou reta: …"); tirando o mesmo do outro, volta a pender como antes. Sem `mostraEquacao` nem `rotulo`, o fim mostra "Continua inclinada para o mesmo lado."

```ts
{ tipo: 'mexa', texto: '2x + 3 < 11: a direita pesa mais. Tire 3 de cada prato.', visual: { modelo: 'balanca', estado: { esquerda: { x: 2, n: 3 }, direita: { n: 11 }, inclina: 'direita', inequacao: true, mostraEquacao: true, tirar: true } },
  acao: { tipo: 'tocar', instrucao: 'Tire 3 pesos de cada prato.', sucesso: { esquerda: { x: 2 }, direita: { n: 8 } }, mostre: 'Sobra 2x < 8, ainda inclinada para a direita.' }, descoberta: 'Tirar o mesmo dos dois lados não muda o lado que desce.' }
// depois, dividir por 2 (o Mexa "dividir" já serve): 2x < 8 vira x < 4
{ modelo: 'balanca', estado: { esquerda: { x: 2 }, direita: { n: 8 }, inclina: 'direita', inequacao: true, mostraEquacao: true, dividir: 2 } }
```

O que a balança não faz: pôr peso (só tirar), pesos negativos e multiplicar por −1. Para o sinal que se inverte, use a reta com `espelhado`.

No Mexa "tirar", um peso rotulado (ou um peso de 10 automático) sai inteiro, nunca se parte: use pesos de 1 (até 20 por prato) quando o aluno precisa tirar um número que não é múltiplo do peso. Com `dividir: k`, dê pratos que se repartem certo (caixas e pesos múltiplos de `k`); senão, os grupos saem desiguais.

Os pratos só têm peças positivas: não há pesos negativos nem balões. Para equações com subtração (x − 3 = 5), use a barra ou a reta, ou mostre a equação com `rotulo`.

### `figura`

A geometria plana da U16: pontos, retas, ângulos, polígonos, o transferidor, o círculo e os quadrados de Pitágoras, num palco desenhado. As coordenadas são do **mundo**: x para a direita, **y para cima**, em unidades (1 unidade = 1 quadradinho da `grade`). A figura se ajusta sozinha ao palco: não importa o tamanho dos números, só as proporções.

De um cartão para o outro, o que tem o mesmo nome se move até o novo lugar (o ponto C que anda, o lado que cresce, o canto que vai para a reta), e o que é novo aparece aos poucos. Para o aluno ver a figura se transformar, mantenha os mesmos pontos e mude só o necessário.

Um ponto é o nome de um ponto de `pontos` (`'A'`) ou as coordenadas (`[2, 3]`). Os nomes só aparecem para os pontos de `pontos`.

| Chave | Efeito |
|---|---|
| `pontos` | pontos com nome: `{ A: [0, 0], B: [4, 0], C: [0, 3] }`. Cada um ganha um ponto branco e o nome, do lado de fora da figura |
| `rotulos` | `false` esconde os nomes; um mapa troca o texto (`{ O: 'centro', H: '' }`) |
| `posRotulos` | onde vai um nome, quando o automático não fica bom: `{ A: 'abaixo' }` (`'acima'`, `'abaixo'`, `'esquerda'`, `'direita'`) |
| `segmentos` | `[['A', 'B']]`, com a medida no meio: `[['A', 'B', '5 cm']]`, ou `{ de: 'A', ate: 'B', medida: '3 cm', destaque: true, tracejado: true }` (a altura tracejada) |
| `retas` | como `segmentos`, mas a linha passa dos pontos e segue com uma seta em cada ponta |
| `semirretas` | começa no primeiro ponto, passa pelo segundo e segue com uma seta |
| `destaque` (num traço, polígono, ângulo ou círculo) | `true` ou `'ambar'` (âmbar), `'azul'`, `'verde'`, `'erro'` (rosa) |
| `poligono` | a figura fechada: `['A', 'B', 'C']` ou `{ vertices: ['A', 'B', 'C'], … }`, com as chaves abaixo |
| `poligono.preenchido` | pinta o interior (`true` âmbar claro; `'azul'`, `'verde'`) |
| `poligono.lados` | a medida de cada lado, por fora (o lado i vai do canto i ao canto i + 1): `true` calcula (com uma casa: 4,2); uma lista escreve o que vier: `[5, 4, 5, 4]` (com `unidade`) ou `['5 cm', '?', null, 'x']` (null pula) |
| `poligono.angulos` | o arco de cada canto, com o valor por dentro: `true` calcula os graus (inteiros); uma lista escreve o que vier (`[60, '?', null]`). Com `true`, um canto de 90° ganha o quadradinho |
| `poligono.angulosRetos` | os cantos com o quadradinho do ângulo reto: índices ou nomes (`['A']`) |
| `poligono.nome` | uma palavra no meio da figura (`'quadrado'`, `'5 lados'`) |
| `poligonos` | vários polígonos, cada um como `poligono` (para comparar formas lado a lado; posicione cada um nas coordenadas) |
| `unidade` | a unidade das medidas em número e da soma (`'cm'`: `5` vira `5 cm`) |
| `angulo` | um ângulo com pontos: `{ vertice: 'B', de: 'A', ate: 'C' }` (os dois lados e o arco; mede o ângulo menor) ou isolado: `{ graus: 60 }` (um lado para a direita, o outro girado 60°). Também uma lista |
| `angulo.valor` | `true` escreve os graus (`60°`); um texto escreve o texto (`'?'`). Sem ele, o valor não aparece |
| `angulo.inicio`, `angulo.em`, `angulo.comprimento` | no ângulo isolado: para onde aponta o primeiro lado (graus, 0 = direita), onde fica o vértice (`[3, 0]`) e o comprimento dos lados (padrão 1) |
| `angulo.nome` | uma palavra embaixo do ângulo: `[{ graus: 40, em: [0, 0], nome: 'agudo' }, { graus: 90, em: [1.6, 0], nome: 'reto' }, { graus: 130, em: [3.8, 0], nome: 'obtuso' }]` |
| `angulo.arco: false`, `angulo.lados: false` | sem o arco; sem os lados (quando eles já são segmentos da figura) |
| `transferidor: true` | o transferidor sobre o vértice do (primeiro) ângulo, com a base no lado `de`: marcas de 5 em 5, números de 10 em 10 em duas escalas. A de dentro (azul) começa no 0 sobre o lado `de`; a de fora (branca), no outro canto. Um lado mais curto que o transferidor continua tracejado até a escala |
| `transferidor: { raio, invertido }` | o raio, em unidades do mundo (padrão: 0,9 do lado mais comprido); `invertido: true` troca as escalas (a de fora passa a começar no lado `de`) |
| `medido: true` | com o transferidor: o número certo ganha um anel âmbar e o ângulo mostra o valor |
| `circulo` | `{ centro: 'O', raio: 2 }`. `raioVisivel` (âmbar) e `diametroVisivel` (azul) desenham o raio e o diâmetro; `raioTexto` e `diametroTexto` os nomeiam (`'raio'`, `'4 cm'`); `preenchido`, `destaque` |
| `desenrolado: true` | o círculo já rolou sobre a reta: a volta virou um segmento âmbar, com 3 diâmetros marcados embaixo (1, 2, 3) e o pedacinho que sobra (0,14). O círculo fica na ponta |
| `quadradosNosLados: true` | num triângulo (`poligono` de 3 cantos): um quadrado sobre cada lado, por fora, com a área no meio. No triângulo retângulo, o do cateto menor é âmbar, o do outro azul, o da hipotenusa cinza. As medidas dos lados (`lados`) vão para dentro do triângulo |
| `quadradosNosLados: { quadriculado: true, areas }` | os quadrados divididos em quadradinhos (lados inteiros: 3-4-5 dá 9, 16 e 25); `areas` troca os números (`['a²', 'b²', 'c²']`, na ordem dos lados) ou, com `false`, os esconde |
| `encaixado: true` | com `quadradosNosLados`: os 9 + 16 quadradinhos já estão dentro do quadrado grande (os 9 num canto, os 16 no resto); os pequenos ficam vazios, tracejados |
| `juntados` | num triângulo: os três cantos recortados e juntos sobre uma reta embaixo, formando meia volta, com "180°". `true` junta os três; uma lista junta esses, nesta ordem, da esquerda para a direita (`[2, 0]`). Cada canto tem uma cor (âmbar, azul, verde); com `angulos`, o valor vai junto |
| `recortado: true` | num paralelogramo com a base deitada: o triângulo de um lado foi recortado na altura e levado para o outro lado; a figura virou um retângulo com a mesma área |
| `recorte` | o recorte de outra figura (um trapézio, um L): `{ pedaco: [...], resto: [...], mover: [dx, dy] }`, o pedaço que sai, o que fica e para onde o pedaço anda. Só desliza, não gira |
| `acesos`, `soma: true` | lados acesos do primeiro polígono (`[0, 1]` ou `true`), e a soma deles embaixo: `5 + 4` e, com todos, `5 + 4 + 5 + 4 = 18 cm` |
| `grade: true` | o quadriculado de fundo, em unidades, no palco todo (para contar áreas e para o pedreiro) |
| `rotulo` | a frase embaixo |

Exemplos:

```ts
// O esquadro do pedreiro: 3, 4 e 5 metros
{ modelo: 'figura', estado: { grade: true, pontos: { A: [0, 0], B: [4, 0], C: [0, 3] }, poligono: { vertices: ['A', 'B', 'C'], lados: [4, 5, 3] }, unidade: 'm' } }
// Pitágoras, com os quadradinhos
{ modelo: 'figura', estado: { poligono: [[0, 0], [4, 0], [0, 3]], quadradosNosLados: { quadriculado: true } } }
// Um ângulo de 60° medido no transferidor
{ modelo: 'figura', estado: { angulo: { graus: 60 }, transferidor: true, medido: true } }
```

Limites:

- O palco tem uns 360 × 380 px no celular. Figuras de até uns 12 × 12 unidades ficam boas; os quadradinhos da grade somem abaixo de 9 px (a grade passa a ir de 2 em 2).
- Os nomes dos pontos e as medidas vão para fora da figura por uma regra simples; num ponto apertado, use `posRotulos`.
- `quadradosNosLados`, `juntados` e `juntar` valem para o primeiro polígono, e ele tem de ser um triângulo. `encaixar` e `encaixado` pedem um triângulo retângulo de lados inteiros (3-4-5, 6-8-10).
- `recortado` sem `recorte` só sabe partir paralelogramos com dois lados deitados (horizontais).
- Os números do transferidor são de 10 em 10. No Mexa "medir", qualquer ângulo inteiro vale (o toque perto do lado lê o ângulo do lado), mas os de 10 em 10 são os que o aluno lê direto na escala.

### `solido`

Os sólidos da U17, em perspectiva: a **caixa** (paralelepípedo), o **cubo**, o **prisma** de base triangular e o **cilindro**, que se abrem na planificação; a **pirâmide** e o **cone**, só para nomear (não abrem nem se enchem de cubinhos). O sólido se ajusta sozinho ao palco: só as proporções importam.

**Abrir é dobrar ao contrário:** a face da frente fica parada e cada face gira em torno da sua aresta até o plano dela, enquanto o olhar vira de frente para a planificação. A caixa vira a cruz de 6 retângulos; o prisma, 3 retângulos e 2 triângulos; o cilindro desenrola a face lateral num retângulo de largura 2πr, com os dois círculos presos em cima e embaixo. Mantenha o mesmo sólido de um cartão para o outro: as medidas que mudam crescem, `aberto` abre, `camadas` enche. Trocar o `solido` faz um sumir e o outro aparecer.

Os nomes das faces (para `destaque`, `nomes`, `areas`, `pintadas`):

| Sólido | Faces |
|---|---|
| `caixa`, `cubo` | `frente`, `direita`, `topo`, `esquerda`, `tras`, `base` |
| `prisma` | `frente`, `direita`, `topo`, `esquerda`, `base` (o topo e a base são os triângulos) |
| `cilindro` | `topo`, `lateral`, `base` |
| `piramide` | `frente`, `direita`, `tras`, `esquerda`, `base` |
| `cone` | `lateral`, `base` |

No sólido fechado aparecem só `frente`, `direita` e `topo` (no cilindro, `topo` e `lateral`); as outras estão atrás.

| Chave | Efeito |
|---|---|
| `solido` | `'caixa'` (padrão), `'cubo'`, `'prisma'`, `'cilindro'`, `'piramide'`, `'cone'` |
| `comprimento`, `largura`, `altura` | caixa e pirâmide: a aresta da frente, a do fundo e a altura (padrão 4, 3, 2). Prisma: a base é um triângulo com o lado da frente `comprimento` e a altura `largura` (do lado da frente até o canto de trás); `altura` é a altura do prisma (padrão 6, 4, 5) |
| `aresta` | cubo: a aresta (padrão 3) |
| `raio`, `altura` | cilindro e cone (padrão 2 e 4) |
| `apice` | prisma: onde fica o canto de trás do triângulo, de 0 (em cima do canto da esquerda: triângulo retângulo) a 1. Padrão 0,5 (isósceles). Para lados inteiros: `comprimento: 6, largura: 4` (lados 5 e 5) ou `apice: 0` com `comprimento: 4, largura: 3` (lados 3 e 5) |
| `unidade` | junto das medidas (`'cm'`: `4 cm`), das áreas (`12 cm²`) e do volume (`24 cm³`) |
| `medidas` | as medidas nas arestas: aparecem sempre (padrão `true`); `false` esconde todas; um mapa troca o texto ou esconde uma: `{ altura: '?', largura: null }`. Os nomes: `comprimento`, `largura`, `altura`, `raio` e `volta` (o retângulo do cilindro aberto, padrão 2 × 3,14 × r, em azul, com uma cota de ponta a ponta) |
| `destaque` | faces acesas: `'base'`, `['base', 'topo']`, `'bases'` (base e topo), `'laterais'` (as outras) ou um mapa com a cor: `{ base: 'azul', lateral: 'verde' }` (`'ambar'`, `'azul'`, `'verde'`, `'erro'`) |
| `nomes` | uma palavra dentro da face: `{ base: 'base', topo: 'base', lateral: 'face lateral' }`. Só aparece se a face estiver à vista |
| `areas` | `true` escreve a área de cada face à vista (`12 cm²`; no cilindro com π = 3,14); um mapa escreve o que vier: `{ base: '?', lateral: '2πrh' }`. Um texto que não cabe na face (um disco pequeno) vai para o lado dela |
| `aberto` | `true`: a planificação. Um número de 0 a 1 deixa meio aberto (`0.5`, para um gancho). Na pirâmide e no cone, não faz nada |
| `ocultas: true` | as arestas de trás, tracejadas (o cubo "de arame") |
| `camadas` | a caixa vira cubinhos de 1 unidade: `camadas: 2` mostra 2 camadas cheias, a caixa inteira tracejada em volta, e embaixo "2 camadas de 12 = 24" (com `unidade`, `= 24 cm³`). As camadas novas caem uma a uma. No cilindro, as camadas são discos de altura 1 ("3 camadas de 12,56 = 37,68"); no prisma, fatias triangulares |
| `baseCheia: true` | só a camada do fundo, e embaixo "4 × 3 = 12 cubinhos" (cilindro: "3,14 × 2 × 2 = 12,56"; prisma: "6 × 4 ÷ 2 = 12") |
| `contagem: false` | esconde a contagem embaixo das camadas |
| `pintadas` | faces pintadas de âmbar: `['frente', 'topo']` |
| `soma: true` | a soma das áreas das faces pintadas embaixo, na ordem da lista: `8 + 12` e, com todas, `8 + 6 + 12 + 6 + 8 + 12 = 52 cm²`. As faces pintadas mostram a sua área |
| `rotulo` | a frase embaixo (no lugar da contagem) |
| `abrir`, `empilhar`, `pintar` | os Mexa (veja abaixo) |

Exemplos:

```ts
// A caixa de sapato: 30, 20 e 12 cm, com a base acesa
{ modelo: 'solido', estado: { comprimento: 30, largura: 20, altura: 12, unidade: 'cm', destaque: 'base', nomes: { base: 'base' } } }
// O cilindro aberto, com a área de cada parte
{ modelo: 'solido', estado: { solido: 'cilindro', raio: 2, altura: 5, unidade: 'cm', aberto: true, areas: true } }
// O volume: a base contada, depois as camadas
{ modelo: 'solido', estado: { comprimento: 4, largura: 3, altura: 2, baseCheia: true } }
{ modelo: 'solido', estado: { comprimento: 4, largura: 3, altura: 2, camadas: 2, unidade: 'cm' } }
```

Os Mexa, prontos para copiar:

```ts
// abrir: um toque abre a caixa
{ tipo: 'mexa', texto: 'Uma caixa é feita de quê? Abra e veja.', visual: { modelo: 'solido', estado: { comprimento: 4, largura: 3, altura: 2, unidade: 'cm', abrir: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque na caixa para abri-la.', sucesso: { aberto: true }, mostre: 'A caixa se abre na planificação: 6 retângulos.' }, descoberta: 'A caixa aberta são 6 retângulos, iguais dois a dois.' }
// empilhar: cada toque põe mais uma camada de cubinhos
{ tipo: 'mexa', texto: 'Quantos cubinhos de 1 cm cabem na caixa?', visual: { modelo: 'solido', estado: { comprimento: 4, largura: 3, altura: 3, unidade: 'cm', baseCheia: true, empilhar: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque na caixa para pôr mais uma camada.', sucesso: { camadas: 3 }, mostre: 'As camadas caem até encher a caixa.' }, descoberta: 'Cada camada tem 4 × 3 = 12; três camadas, 36.' }
// pintar: cada toque pinta uma face e soma a área dela
{ tipo: 'mexa', texto: 'Quanto papel embrulha a caixa?', visual: { modelo: 'solido', estado: { comprimento: 4, largura: 3, altura: 2, unidade: 'cm', pintar: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque em cada face para pintar.', sucesso: { area: 52 }, mostre: 'Todas as faces pintadas: 52 cm².' }, descoberta: 'A área da superfície é a soma das áreas das 6 faces.' }
```

Limites:

- O palco tem uns 360 × 380 px no celular. A planificação é mais larga que o sólido: o sólido fechado enche o palco e diminui enquanto abre. Caixas muito achatadas (12 × 8 × 1,5) ficam com faces finas na planificação; os textos de área não cabem nelas.
- As camadas pedem medidas inteiras na caixa (os cubinhos são de 1 unidade). A `altura` arredonda para cima: uma caixa de altura 2,5 tem 3 camadas, a última passando da tampa.
- Na pirâmide e no cone, `aberto`, `camadas` e os Mexa não funcionam (só "Me mostre"). A altura deles aparece tracejada, por dentro.
- `areas` e `nomes` só aparecem nas faces à vista. No sólido fechado, para falar da base, use `destaque` e o texto do cartão, ou abra.
- Os números do cilindro usam π = 3,14 (como na unidade 16): a área da base de raio 2 é 12,56, a lateral de raio 2 e altura 5 é 62,8.

### `plano`

O plano cartesiano da U18: dois eixos com números, a grade, os quatro quadrantes, pontos com nome e coordenadas, o ponto que anda (primeiro no x, depois no y), retas por uma regra simples ou por dois pontos, e a **máquina de função** com a tabela de entrada e saída. As coordenadas são do mundo: x para a direita, **y para cima**.

São dois modelos na U18: `plano` (dois eixos de números, onde cada ponto é um par) e `grafico` (barras, linhas e setores, com categorias no eixo de baixo). A máquina fica no `plano` porque os pares que saem dela viram pontos no plano. Os dois usam o mesmo motor de cena da `figura` (`components/aula/visual/cena.tsx`): de um cartão para o outro, o que tem o mesmo nome se move até o novo lugar, e o que é novo aparece aos poucos. Mantenha os mesmos pontos e os mesmos eixos de um cartão para o outro e mude só o necessário.

Um ponto é o nome de um ponto de `pontos` (`'A'`) ou as coordenadas (`[2, 3]`).

| Chave | Efeito |
|---|---|
| `x`, `y` | os eixos: `[-5, 5]` ou `{ de: 0, ate: 10, passo: 1, rotulo: 'horas', numeros: 2 }`. `passo` é a distância entre duas linhas da grade (padrão: uma escala redonda); `numeros` diz de quantos em quantos passos aparece um número (padrão: o que cabe; `false` esconde); `rotulo` é o nome do eixo, na ponta da seta (padrão `x` e `y`). Sem `de` e `ate`, o eixo vai do 0 (ou do menor negativo) até um passo depois do maior ponto; sem nada, de −5 a 5 |
| escala dos eixos | com o mesmo `passo` nos dois eixos, os quadradinhos são quadrados (o plano não estica). Com passos diferentes (`x` de 1 em 1, `y` de 20 em 20), cada eixo ocupa o espaço que tem |
| `grade: false` | sem a grade |
| `quadrantes` | `true` escreve 1º, 2º, 3º e 4º nos cantos; uma lista acende esses quadrantes (`[2]`) |
| `pontos` | com nome: `{ A: [3, 2], B: [-4, 1] }` (ponto âmbar e o nome ao lado, para fora dos eixos); sem nome: `[[1, 20], [2, 40]]` |
| `coordenadas` | o par junto do nome: `true` (todos) ou `['A']`. Fica `A (3, 2)`; com decimal, `(2,5; 3)`; negativos com o sinal de menos de verdade, `(−4, 1)` |
| `nomes` | `false` esconde os nomes; um mapa troca o texto (`{ A: 'casa' }`) |
| `cores` | a cor de um ponto: `{ B: 'azul' }` (`'ambar'`, `'azul'`, `'verde'`, `'erro'`, `'branco'`) |
| `posRotulos` | onde vai um nome, quando o automático não fica bom: `{ A: 'abaixo' }` (`'acima'`, `'abaixo'`, `'esquerda'`, `'direita'`) |
| `caminho` | o ponto anda: sai da origem, vai pelo eixo x (traço âmbar) e depois sobe ou desce (traço azul) até o lugar; os números do eixo acendem e o par aparece no fim. Um nome (`'A'`) ou uma lista (`['A', 'B']`, um depois do outro). Para o aluno ver andar, o ponto já pode estar no cartão anterior |
| `guias` | tracejados do ponto até os dois eixos, com os números acesos (âmbar no x, azul no y): `true` ou `['A']` |
| `retas` | retas pela regra y = a·x + b: `[{ a: 2 }]` é y = 2x; `{ a: 0.8, b: 15 }`. Ou por dois pontos: `{ por: ['A', 'B'] }`. Cada uma aceita `de` e `ate` (só o trecho com x entre eles: `{ a: 20, de: 0 }` para grandezas que não são negativas), `destaque` (padrão azul), `tracejado` e `rotulo` (`true` escreve a regra, `'y = 2x'`; um texto escreve o texto). A reta nova cresce da esquerda |
| `segmentos` | `[['A', 'B']]` ou `{ de: 'A', ate: [0, 0], destaque: 'ambar', tracejado: true }` |
| `ligar: true` | liga os pontos com nome e depois os pares da tabela ou da máquina, na ordem, com uma linha azul |
| `maquina` | a máquina de função (veja abaixo) |
| `tabela` | a tabela de pares, deitada (uma grandeza em cada linha): `{ rotulos: ['horas', 'R$'], pares: [[1, 20], [2, 40], [3, '?']] }`. `'?'` ou `null` deixa a casa com "?". Os pares com dois números viram pontos no plano (`noPlano: false` não) |
| `eixos: false` | esconde o plano |
| `rotulo` | a frase embaixo |

**A máquina de função.** Uma caixa com a regra no meio: o número entra pela esquerda, a regra trabalha, a saída sai pela direita. Embaixo, a tabela de entrada e saída; no plano, cada par vira um ponto.

| Chave de `maquina` | Efeito |
|---|---|
| `regra` | a regra em passos, feitos da esquerda para a direita: `'× 0,80 + 15'`, `'÷ 2'`, `'× 3 − 1'`, `'²'`. Vírgula decimal e ponto de milhar (`'+ 1.000'`). O player faz a conta |
| `a`, `b` | ou a regra como y = a·x + b; a caixa mostra `× 2 + 1` |
| `saidas` | as saídas, quando a regra não é uma conta de passos (`'2x + 1'`, uma tarifa por faixa). Valem mais que a regra |
| `entradas` | os números que entram, na ordem: `[0, 100, 200, 300]` |
| `feitas` | quantos já passaram (padrão 0). O último aparece na máquina: ele voa da tabela até a entrada, a saída sai da caixa, entra na tabela e voa até o plano. De um cartão para o outro, aumente `feitas` de 1 em 1 |
| `rotulos` | os nomes da entrada e da saída, embaixo da máquina e na tabela: `['kWh', 'R$']` (padrão `entra` e `sai`) |
| `tabela: false` | sem a tabela |

Com `maquina` ou `tabela` e sem `x`, `y`, `pontos`, `retas` ou `segmentos`, o palco mostra só a máquina e a tabela, maiores. Dê `x` e `y` para os pares aparecerem no plano. Com a máquina, o plano já cabe todas as saídas desde o começo: ele não muda de escala enquanto os pontos chegam.

Exemplos:

```ts
// Os quatro quadrantes, com os pares
{ modelo: 'plano', estado: { x: [-5, 5], y: [-5, 5], quadrantes: true, pontos: { A: [3, 2], B: [-4, 1], C: [-2, -3], D: [4, -4] }, coordenadas: true } }
// O ponto que anda: primeiro 3 para a direita, depois 2 para cima
{ modelo: 'plano', estado: { x: [-5, 5], y: [-5, 5], pontos: { A: [3, 2] }, caminho: 'A' } }
// Proporcional é uma reta que passa pela origem
{ modelo: 'plano', estado: { x: { de: 0, ate: 10, rotulo: 'horas' }, y: { de: 0, ate: 200, passo: 20, rotulo: 'R$' }, pontos: [[1, 20], [2, 40], [3, 60]], retas: [{ a: 20, de: 0, rotulo: true }] } }
// A conta de luz: três números já passaram pela máquina
{ modelo: 'plano', estado: { maquina: { regra: '× 0,80 + 15', entradas: [0, 100, 200, 300], feitas: 3, rotulos: ['kWh', 'R$'] }, x: { de: 0, ate: 300, passo: 50, rotulo: 'kWh' }, y: { de: 0, ate: 300, passo: 50, rotulo: 'R$' }, ligar: true } }
```

Os Mexa, prontos para copiar:

```ts
// marcar: o aluno toca no cruzamento da grade; o ponto anda da origem até lá
{ tipo: 'mexa', texto: 'O mapa diz: 3 para a direita, 2 para cima. Marque o ponto A.', visual: { modelo: 'plano', estado: { x: [-5, 5], y: [-5, 5], pontos: { A: [3, 2] } } },
  acao: { tipo: 'tocar', instrucao: 'Toque no ponto (3, 2).', sucesso: { ponto: [3, 2] }, mostre: 'O ponto anda 3 no x e depois 2 no y.' }, descoberta: 'O primeiro número anda para o lado; o segundo, para cima.' }
// marcar vários (um em cada quadrante)
{ tipo: 'mexa', texto: 'Agora com negativos.', visual: { modelo: 'plano', estado: { x: [-5, 5], y: [-5, 5], quadrantes: true } },
  acao: { tipo: 'tocar', instrucao: 'Marque (−2, 3), (−4, −1) e (2, −3).', sucesso: { pontos: [[-2, 3], [-4, -1], [2, -3]] }, mostre: 'Os três pontos andam até o lugar.' }, descoberta: 'x negativo vai para a esquerda; y negativo, para baixo.' }
// ler: tocar num ponto mostra as coordenadas dele
{ tipo: 'mexa', texto: 'Onde fica cada ponto?', visual: { modelo: 'plano', estado: { x: [-5, 5], y: [-5, 5], pontos: { A: [2, 3], B: [-3, 1], C: [0, -2] } } },
  acao: { tipo: 'tocar', instrucao: 'Toque em cada ponto.', sucesso: { lidos: 3 }, mostre: 'Cada ponto mostra o seu par.' }, descoberta: 'Cada ponto é um par: o x e o y.' }
// alimentar: cada toque põe o próximo número na máquina
{ tipo: 'mexa', texto: 'Na conta de luz, cada kWh custa R$ 0,80, mais R$ 15 fixos.', visual: { modelo: 'plano', estado: { maquina: { regra: '× 0,80 + 15', entradas: [0, 100, 200, 300], rotulos: ['kWh', 'R$'] }, x: { de: 0, ate: 300, passo: 50, rotulo: 'kWh' }, y: { de: 0, ate: 300, passo: 50, rotulo: 'R$' } } },
  acao: { tipo: 'tocar', instrucao: 'Toque na máquina para pôr cada consumo.', sucesso: { saidas: 4 }, mostre: 'Os quatro consumos passam pela máquina.' }, descoberta: 'Cada número que entra dá um só número que sai.' }
```

Limites:

- O palco tem uns 360 × 400 px no celular. Com a máquina, a tabela e o plano juntos, o plano fica com uns 230 px de altura: use poucos números nos eixos (de 50 em 50, não de 10 em 10). No computador (palco com 600 px ou mais), a máquina e a tabela vão para a esquerda e o plano para a direita.
- A tabela cabe umas 6 colunas no celular; os números encolhem até 11 px.
- No Mexa "marcar", o toque vai para o cruzamento mais perto da grade: o alvo tem de estar num cruzamento (um múltiplo do `passo` de cada eixo).
- Os nomes dos pontos vão para fora dos eixos por uma regra simples; num ponto apertado (perto de outro ou de um canto), use `posRotulos`.
- A regra da máquina é uma sequência de passos, sem parênteses e sem a letra: `'× 2 + 1'` funciona, `'2x + 1'` não (use `a` e `b`, ou `saidas`).

### `plano`: retas de equações (sistemas)

As retas da AF.U4: cada equação do 1º grau com duas letras é uma reta no plano, e o par que serve às duas é onde elas se cruzam. Vale tudo do `plano` (pontos, coordenadas, tabela de pares); estas chaves se somam a ele.

| Chave | Efeito |
|---|---|
| `retas: [{ equacao: 'x + y = 10' }]` | a reta da equação, com a equação escrita perto dela (o hífen vira −). Aceita números com vírgula, as duas letras dos dois lados (`'y = x + 2'`, `'2x + 3 = y + 7'`) e uma letra só (`'2x = 6'` é uma reta em pé). Não aceita parênteses nem potências. `equacao` vale mais que `a`, `b` e `por`; `destaque`, `tracejado`, `de` e `ate` continuam valendo; `rotulo: false` esconde a equação, um texto troca |
| cores | as retas de equação, sem `destaque`, ficam âmbar, azul e verde, nessa ordem. Os rótulos não se sobrepõem: fogem um do outro, dos eixos e dos números, dos pontos e do cruzamento |
| letras | x no eixo de baixo e y no de pé. Com outras letras (`'i + m = 10'`), a primeira que aparece vai para o eixo de baixo; dê `x: { rotulo: 'i' }` e `y: { rotulo: 'm' }` |
| eixos sozinhos | sem `x` e `y`, os eixos vão até onde as retas cortam os eixos e até o cruzamento, com a grade de 1 em 1 (até umas 20 linhas): `x + y = 10` e `2x + 3y = 26` dão x de 0 a 14 e y de 0 a 11 |
| a mesma reta duas vezes | `x + y = 3` e `2x + 2y = 6`: a primeira fica grossa e a segunda vem tracejada por cima, na outra cor. Vê-se que coincidem |
| paralelas | `x + y = 3` e `x + y = 5`: só as duas retas. Diga em `rotulo` ("Nunca se cruzam.") |
| `cruzamento: true` | o ponto onde as duas primeiras retas se cruzam: branco, com um anel, e as coordenadas ao lado, `(4, 6)`, do lado livre das retas. Vale para qualquer reta (de regra, por dois pontos ou de equação). Paralelas ou a mesma reta: nada |
| `conferir: true` | embaixo do plano, uma linha por equação com o cruzamento posto nela, na cor da reta: `4 + 6 = 10 ✓`, `2 · 4 + 3 · 6 = 26 ✓` |
| `conferir: [3, 7]` | o mesmo com outro par, que também aparece no plano (branco se serve às duas, rosa se não): `3 + 7 = 10 ✓` e, em rosa, `2 · 3 + 3 · 7 = 27 ≠ 26 ✗`. É o erro "um par que serve a uma equação só" |

```ts
// x + y = 10: os pares formam uma reta
{ modelo: 'plano', estado: { retas: [{ equacao: 'x + y = 10' }], pontos: { A: [0, 10], B: [3, 7], C: [6, 4], D: [10, 0] }, coordenadas: true } }
// duas condições: onde as retas se cruzam, conferido nas duas
{ modelo: 'plano', estado: { retas: [{ equacao: 'x + y = 10' }, { equacao: '2x + 3y = 26' }], cruzamento: true, conferir: true } }
// um par que serve a uma só
{ modelo: 'plano', estado: { retas: [{ equacao: 'x + y = 10' }, { equacao: '2x + 3y = 26' }], conferir: [3, 7] } }
// com negativos: x + y = 10 e x − y = 4 se cruzam em (7, 3)
{ modelo: 'plano', estado: { retas: [{ equacao: 'x + y = 10' }, { equacao: 'x − y = 4' }], cruzamento: true } }
// nenhuma solução e infinitas
{ modelo: 'plano', estado: { retas: [{ equacao: 'x + y = 3' }, { equacao: 'x + y = 5' }], rotulo: 'Nunca se cruzam.' } }
{ modelo: 'plano', estado: { retas: [{ equacao: 'x + y = 3' }, { equacao: '2x + 2y = 6' }], rotulo: 'É a mesma reta.' } }
```

Os Mexa, prontos para copiar:

```ts
// pares: o aluno toca a grade; o par que serve fica, o que não serve pisca e some. No fim, a reta aparece
{ tipo: 'mexa', texto: 'Dois números que somam 10. Quais pares servem?', visual: { modelo: 'plano', estado: { retas: [{ equacao: 'x + y = 10' }] } },
  acao: { tipo: 'tocar', instrucao: 'Toque em 4 pontos da grade em que x + y dá 10.', sucesso: { pontos: 4 }, mostre: 'Quatro pares de x + y = 10, e a reta passa por todos.' }, descoberta: 'Os pares de x + y = 10 ficam todos numa reta.' }
// cruzar: o aluno toca o ponto que está nas duas retas
{ tipo: 'mexa', texto: '10 frutas, R$ 26: a maçã custa R$ 2 e a pera, R$ 3.', visual: { modelo: 'plano', estado: { retas: [{ equacao: 'x + y = 10' }, { equacao: '2x + 3y = 26' }] } },
  acao: { tipo: 'tocar', instrucao: 'Toque no ponto que serve às duas equações.', sucesso: { par: [4, 6] }, mostre: 'As retas se cruzam em (4, 6): 4 maçãs e 6 peras.' }, descoberta: 'O par que serve às duas é onde as retas se cruzam.' }
```

- No Mexa "pares", a reta da primeira `equacao` fica escondida até o fim (as outras retas aparecem). Os eixos ficam fixos desde o começo. Embaixo, "2 de 4 pares" (um `rotulo` do cartão fica no lugar). Um par que não serve não é erro: pisca em rosa e a frase diz a conta ("(3, 5): 3 + 5 = 8 ≠ 10. Esse par não serve."). Só vira Mexa se a grade tem tantos pares inteiros da reta: com x e y de 0 a 10, x + y = 10 tem 11; 2x + 3y = 26 tem 4.
- No Mexa "cruzar", o `par` tem de ser o cruzamento das duas primeiras retas e cair num cruzamento da grade. Antes, o ponto não aparece; no fim, aparecem o ponto, as coordenadas e a conferência nas duas equações. Um par numa reta só é erro, com a conta que falha ("(3, 7) está na reta x + y = 10, mas não na 2x + 3y = 26: 2 · 3 + 3 · 7 = 27 ≠ 26."); fora das duas: "(2, 2) não está em nenhuma das duas retas. Procure onde elas se cruzam."

A **tabela de pares** da aula 1 já existe: `livre.tabela` com uma linha por grandeza (os pares em colunas) e `destaque` numa coluna; ou `plano.tabela` (duas linhas), cujos pares viram pontos no plano.

```ts
{ modelo: 'livre', estado: { tabela: { linhas: [{ rotulo: 'x', valores: [0, 3, 4.5, 6, 10] }, { rotulo: 'y', valores: [10, 7, 5.5, 4, 0] }, { rotulo: 'x + y', valores: [10, 10, 10, 10, 10] }], destaque: [3] } } }
```

### `grafico`

Os gráficos de dados da U18: **barras**, **linhas** (uma série no tempo) e **setores** (a pizza, com as porcentagens). O eixo pode começar longe do 0 (o eixo cortado) e as marcas podem ter valores desiguais (a escala torta), para a aula dos gráficos que enganam. De um cartão para o outro, as barras crescem ou encolhem até o novo valor: `eixoInicio: 90` e, no cartão seguinte, sem ele, mostra o eixo descendo até o 0 e as barras ficando quase iguais.

| Chave | Efeito |
|---|---|
| `tipo` | `'barras'` (padrão), `'linhas'` ou `'setores'` |
| `dados` | os dados, na ordem: `[['jan', 92], ['fev', 95]]` ou `[{ rotulo: 'jan', valor: 92, cor: 'verde' }]` |
| `series` | linhas: mais linhas sobre os mesmos rótulos, `[{ nome: 'Recife', valores: [27, 28, 29] }]` (a primeira linha, dos `dados`, é azul; as outras, verde, rosa, lilás) |
| `legenda` | linhas: o nome de cada linha, na ordem (a dos `dados` primeiro), em cima à direita: `['São Paulo', 'Recife']` |
| `eixoInicio` | o eixo começa aqui (o eixo cortado): `90`. Padrão 0 |
| `eixoFim`, `passo` | até onde vai o eixo e a distância entre as marcas (padrão: uma escala redonda acima do maior valor) |
| `escala` | a escala torta: estas marcas ficam à mesma distância na tela, com valores desiguais (`[0, 10, 20, 50, 100]`); as barras seguem as marcas |
| `quebra: true` | o zigue-zague no pé do eixo, o jeito honesto de avisar que o eixo foi cortado |
| `honesto` | dois gráficos lado a lado: o do estado (cortado ou torto) e a versão honesta (eixo no 0, escala regular), com os títulos "como veio" e "eixo no 0" (ou "escala regular"). Um par troca os títulos: `['o anúncio', 'de verdade']` |
| `valores` | os valores escritos (padrão: sim nas barras e nos setores, não nas linhas; os pontos acesos sempre mostram o valor) |
| `antes`, `depois` | junto de cada valor: `antes: 'R$ '`, `depois: ' %'`. Nos setores, com eles a legenda mostra o valor no lugar da porcentagem |
| `destaque` | barras, pontos ou fatias acesos em âmbar (`2` ou `[0, 2]`); a fatia acesa sai um pouco da pizza |
| `titulo` | em cima |
| `rotuloY`, `rotuloX` | o nome do eixo vertical (em cima, à esquerda) e do horizontal (embaixo) |
| `rotulo` | a frase embaixo |

Nos setores, as porcentagens são inteiras e somam 100 (a maior sobra fica com quem tem a maior parte decimal). A porcentagem aparece dentro da fatia a partir de 7 %; todas aparecem na legenda. As cores das fatias, na ordem: âmbar, azul, verde, rosa, lilás, cinza (`cor` no dado troca).

Exemplos:

```ts
// O eixo cortado: 92, 95 e 98 parecem muito diferentes
{ modelo: 'grafico', estado: { titulo: 'Vendas (mil R$)', dados: [['jan', 92], ['fev', 95], ['mar', 98]], eixoInicio: 90 } }
// O mesmo, com a versão honesta ao lado
{ modelo: 'grafico', estado: { dados: [['jan', 92], ['fev', 95], ['mar', 98]], eixoInicio: 90, honesto: true } }
// Uma semana de temperaturas
{ modelo: 'grafico', estado: { tipo: 'linhas', dados: [['seg', 18], ['ter', 22], ['qua', 25]], rotuloY: '°C', destaque: 2 } }
// Para onde vai o salário
{ modelo: 'grafico', estado: { tipo: 'setores', dados: [['aluguel', 900], ['comida', 600], ['transporte', 300], ['outros', 200]], destaque: 0 } }
```

Os Mexa, prontos para copiar:

```ts
// apontar: tocar na barra (num ponto da linha, numa fatia) que responde à pergunta
{ tipo: 'mexa', texto: 'Em que mês a loja vendeu mais?', visual: { modelo: 'grafico', estado: { dados: [['jan', 92], ['fev', 95], ['mar', 98]], eixoInicio: 90 } },
  acao: { tipo: 'tocar', instrucao: 'Toque na barra do mês que vendeu mais.', sucesso: { barra: 2 }, mostre: 'Março: 98 mil.' }, descoberta: 'A barra mais alta é o maior valor.' }
{ tipo: 'mexa', texto: 'Qual gasto é quase um terço do salário?', visual: { modelo: 'grafico', estado: { tipo: 'setores', dados: [['aluguel', 50], ['comida', 30], ['outros', 20]] } },
  acao: { tipo: 'tocar', instrucao: 'Toque na fatia.', sucesso: { setor: 1 }, mostre: 'A comida: 30 %.' }, descoberta: 'A fatia mostra a parte do todo.' }
// ajustar: arrastar a barra até o valor (ela é conferida quando o dedo sai)
{ tipo: 'mexa', texto: 'Em fevereiro, a conta foi R$ 60. Desenhe a barra.', visual: { modelo: 'grafico', estado: { dados: [['jan', 40], ['fev', 0]], ativa: 1, antes: 'R$ ' } },
  acao: { tipo: 'arrastar', instrucao: 'Arraste a barra de fevereiro até R$ 60.', sucesso: { valor: 60 }, mostre: 'A barra sobe até o 60.' }, descoberta: 'A altura da barra é o valor, lido no eixo.' }
```

Limites:

- Barras e linhas cabem umas 7 categorias no celular, com rótulos curtos (`jan`, `seg`); os rótulos encolhem até 11 px e não quebram linha. Com `honesto`, cada gráfico tem metade da largura: use até 4 barras.
- Valores negativos não aparecem (a barra fica no pé do eixo). Valores abaixo de `eixoInicio` também ficam no pé: é o que o eixo cortado faz.
- Nos setores, a legenda vai ao lado da pizza quando cabe; senão, embaixo. Até 6 fatias ficam boas.
- No Mexa "ajustar", o eixo fica parado enquanto a barra anda: vai até uma marca redonda acima do maior valor e do alvo (ou até `eixoFim`). O arraste anda de passo das marcas (ou de meio, um quarto, um quinto ou um décimo dele, o que alcança o alvo); `ajustePasso` troca. Só barras.

### `dados`

Os dados da U19: um conjunto de valores como **pontos empilhados sobre a reta** (o gráfico de pontos). Cada valor é um ponto; valores iguais formam uma pilha. Sobre esse desenho o player mostra a **média como ponto de equilíbrio** (um apoio embaixo da reta: fora da média, a reta inclina para o lado mais pesado), a **mediana como o valor do meio da fila** (os pontos saem da reta e se enfileiram do menor ao maior, com o número dentro), a **moda como a pilha mais alta**, a **amplitude** (o colchete do menor ao maior), os **desvios** até a média (e a soma deles, que dá zero) e a **faixa média ± desvio padrão**. Dois ou três conjuntos podem ficar um embaixo do outro, na mesma escala.

O motor é o mesmo da `figura` e do `plano`: de um cartão para o outro, os pontos se movem até o novo lugar. Mantenha os mesmos `valores` e mude só as chaves: `{ valores }` → `{ valores, media: true }` → `{ valores, fila: true, mediana: true }`. As contas ficam em `components/aula/visual/dados-geo.ts`.

| Chave | Efeito |
|---|---|
| `valores` | os valores, na ordem em que foram anotados: `[7, 5, 8, 7, 6]`. Decimais valem (`2.5` aparece `2,5`) |
| `conjuntos` | dois ou três conjuntos, um embaixo do outro, na mesma reta: `[{ nome: 'Loja A', valores: [...] }, { nome: 'Loja B', valores: [...] }]`. O nome do primeiro fica em âmbar, o do segundo em azul. Todas as outras chaves valem para cada conjunto |
| `de`, `ate`, `passo` | a reta: o começo, o fim e a distância entre as marcas. Padrão: um passo redondo, de uma marca antes do menor a uma depois do maior; dados que não são negativos não descem do 0 |
| `numeros` | de quantas em quantas marcas vai um número (padrão: o que cabe); `false` esconde |
| `unidade`, `antes` | junto dos números: `unidade: 'min'` escreve "média 7 min" e põe "min" na ponta da reta; `antes: 'R$ '` escreve "média R$ 1.200" |
| `media: true` | o apoio (o triângulo âmbar) embaixo da reta, na média, com "média 6,7". A reta fica reta |
| `fulcro` | o apoio neste lugar (`fulcro: 5`): fora da média, a reta inclina para o lado mais pesado, mais quanto mais longe (até 10°). Com `media: true`, o apoio vai para a média |
| `fila: true` | os pontos saem da reta e formam uma fila, do menor ao maior, com o número dentro |
| `mediana: true` | sem `fila`, uma linha azul tracejada no valor do meio, com "mediana 7" em cima. Com `fila`, os do meio da fila acendem em azul e "mediana 5,5" aparece embaixo (com quantidade par, uma marca entre os dois do meio) |
| `moda: true` | as pilhas mais altas em verde, com "moda" em cima (num empate, todas). Sem valor repetido: "sem moda: nenhum valor se repete" |
| `amplitude: true` | o colchete lilás embaixo da reta, do menor ao maior, com "amplitude: 32 − 28 = 4" |
| `desvios: true` | a linha tracejada da média e, de cada ponto até ela, um segmento (à direita em verde, à esquerda em rosa) com o desvio (`+2`, `−3`). Cada ponto ganha a sua altura, para os segmentos não se cruzarem |
| `somaDesvios: true` | embaixo, a soma dos desvios escrita: `(−2) + (0) + (+1) + … = 0` |
| `distancias: true` | como `desvios`, mas sem sinal e todos em lilás (a distância até a média), com "distância média: 1,5" embaixo |
| `faixa` | a faixa média ± desvio padrão, sombreada em azul, com "média ± desvio: 500 ± 1,87". `true` calcula o desvio padrão (dividindo por n, a quantidade de valores); um número usa esse desvio (`faixa: 2`, para escrever um valor redondo) |
| `destaque` | valores acesos em âmbar (todos os pontos com esse valor): `30` ou `[2, 30]` |
| `titulo` | em cima |
| `rotulo` | a frase embaixo |
| `ativo` | Mexa com `conjuntos`: o índice do conjunto que recebe os toques (padrão 0) |
| `ajustePasso` | Mexa "equilibrar": o passo do arraste do apoio (padrão: o passo da reta, ou meio, um quarto, um quinto ou um décimo dele, o que alcança a média) |

As contas: média = soma ÷ quantidade; mediana = o do meio da fila (com quantidade par, a média dos dois do meio); moda = o valor que mais aparece (todos, num empate; nenhum, se nenhum se repete); amplitude = maior − menor; desvio = valor − média; desvio padrão = raiz da média dos quadrados dos desvios (dividindo por n, não por n − 1). Os números saem com vírgula, até duas casas (`6,57`); quando a conta não fecha, escolha valores que dão uma média redonda ou use `faixa: 2`.

Exemplos, um por aula da U19:

```ts
// A1 Média, mediana e moda: as notas, depois a média equilibrando, a fila com a mediana e a moda
{ modelo: 'dados', estado: { valores: [5, 7, 8, 6, 7, 9, 7, 6, 8, 4] } }
{ modelo: 'dados', estado: { valores: [5, 7, 8, 6, 7, 9, 7, 6, 8, 4], media: true } }
{ modelo: 'dados', estado: { valores: [5, 7, 8, 6, 7, 9, 7, 6, 8, 4], fulcro: 5 } }  // a reta inclina para a direita
{ modelo: 'dados', estado: { valores: [7, 4, 9, 6, 8], fila: true, mediana: true } }
{ modelo: 'dados', estado: { valores: [5, 7, 8, 6, 7, 9, 7, 6, 8, 4], moda: true } }
// A2 Quando a média engana: o salário do dono puxa a média; a mediana não sai do lugar
{ modelo: 'dados', estado: { valores: [2, 2, 3, 3, 3, 4, 30], unidade: 'mil R$', media: true, mediana: true, destaque: 30 } }
// A2 Duas lojas com a mesma média e espalhamentos diferentes
{ modelo: 'dados', estado: { conjuntos: [{ nome: 'Loja A', valores: [26, 28, 30, 30, 32, 34] }, { nome: 'Loja B', valores: [18, 22, 30, 30, 38, 42] }], media: true, amplitude: true } }
// A3 Desvio padrão: cada desvio, a soma que dá zero e a faixa média ± desvio
{ modelo: 'dados', estado: { valores: [498, 500, 501, 499, 502, 500, 503, 497], unidade: 'mg', desvios: true, somaDesvios: true } }
{ modelo: 'dados', estado: { valores: [498, 500, 501, 499, 502, 500, 503, 497], unidade: 'mg', distancias: true } }
{ modelo: 'dados', estado: { valores: [498, 500, 501, 499, 502, 500, 503, 497], unidade: 'mg', media: true, faixa: true } }
```

Os Mexa, prontos para copiar:

```ts
// ordenar: tocar os pontos do menor ao maior; cada um vai para a fila. Com mediana: true, os do meio acendem no fim
{ tipo: 'mexa', texto: 'Cinco tempos de espera, em minutos.', visual: { modelo: 'dados', estado: { valores: [7, 4, 9, 6, 8], unidade: 'min', mediana: true } },
  acao: { tipo: 'tocar', instrucao: 'Ponha os tempos em fila: toque do menor para o maior.', sucesso: { ordenado: true }, mostre: 'A fila: 4, 6, 7, 8, 9.' }, descoberta: 'O do meio da fila é a mediana: 7 minutos.' }
// equilibrar: arrastar o apoio até a reta ficar reta (conferido quando o dedo sai)
{ tipo: 'mexa', texto: 'Onde a reta fica em equilíbrio?', visual: { modelo: 'dados', estado: { valores: [5, 7, 8, 6, 7, 9, 7, 6, 8, 4], fulcro: 4 } },
  acao: { tipo: 'arrastar', instrucao: 'Arraste o apoio até a reta ficar reta.', sucesso: { media: 6.7 }, mostre: 'O apoio vai para 6,7.' }, descoberta: 'O ponto de equilíbrio é a média: 67 ÷ 10 = 6,7.' }
// achar: tocar na reta, no valor pedido (a mediana, a moda ou um valor)
{ tipo: 'mexa', texto: 'Sete salários, em mil reais.', visual: { modelo: 'dados', estado: { valores: [2, 2, 3, 3, 3, 4, 30], unidade: 'mil R$' } },
  acao: { tipo: 'tocar', instrucao: 'Toque na mediana.', sucesso: { mediana: 3 }, mostre: 'A mediana é 3.' }, descoberta: 'O salário de 30 não muda a mediana.' }
{ tipo: 'mexa', texto: 'Qual tamanho a loja mais vende?', visual: { modelo: 'dados', estado: { valores: [38, 40, 40, 40, 42, 42, 44] } },
  acao: { tipo: 'tocar', instrucao: 'Toque na moda.', sucesso: { moda: 40 }, mostre: 'A pilha mais alta é a do 40.' }, descoberta: 'A moda é o valor que mais aparece.' }
{ tipo: 'mexa', texto: 'Um salário destoa dos outros.', visual: { modelo: 'dados', estado: { valores: [2, 2, 3, 3, 3, 4, 30], unidade: 'mil R$', media: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque no salário que puxa a média.', sucesso: { valor: 30 }, mostre: 'O 30 fica longe de todos.' }, descoberta: 'Um valor muito longe puxa a média para o lado dele.' }
// achar na fila: com fila: true, o aluno toca o ponto do meio (com quantidade par, qualquer um dos dois do meio)
{ tipo: 'mexa', texto: 'Seis alturas, em fila.', visual: { modelo: 'dados', estado: { valores: [3, 8, 5, 6, 9, 4], fila: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque no meio da fila.', sucesso: { mediana: 5.5 }, mostre: 'No meio ficam o 5 e o 6.' }, descoberta: 'Com quantidade par, a mediana fica entre os dois do meio: 5,5.' }
```

Limites (medidos no celular, palco de uns 374 × 400 px):

- Os pontos têm raio de 6 a 13 px (16 px no computador). O raio sai da menor distância entre dois valores diferentes: valores a 1 unidade numa reta de 0 a 35 ficam com uns 6 px e se tocam. Para pontos grandes, a reta deve ter no máximo umas 18 unidades entre os valores mais próximos (`(ate − de) ÷ menor diferença ≤ 18`). Com um valor que destoa (o salário de 30), use inteiros pequenos nos outros (2, 3, 4), não 2,5 e 3,5.
- Pilhas: com um conjunto, uma pilha de até umas 12 ainda tem pontos de 13 px; mais alta, os pontos encolhem (até 6 px). Com dois conjuntos, cada um tem metade da altura (pilhas de até umas 5). Até uns 20 valores ficam bons.
- A fila cabe até uns 18 valores no celular (o círculo vai de 15 a 8 px de raio e o número encolhe até 9 px). Números de até 3 algarismos.
- Com `desvios` ou `distancias`, cada ponto tem a sua linha: até uns 10 valores.
- No Mexa "equilibrar", o apoio encaixa na média quando o dedo chega perto (meio passo do arraste, ou 3 % da reta): uma média como 7,33 também se alcança. `sucesso.media` tem de ser a média dos valores (os testes cobram).
- No Mexa "achar", o toque vai para o valor mais perto (um valor, a média ou a mediana, até 0,6 passo da reta); longe deles, para o meio passo mais perto. Tocar a média ou a moda no lugar da mediana tem aviso próprio ("Esse é o ponto de equilíbrio, a média…", "Essa é a pilha mais alta, a moda…"); tocar a mediana no lugar da moda também.
- Com `fila: true`, a mediana só acende com `mediana: true`: num Mexa "achar" na fila, deixe `mediana` de fora (o player acende no fim).

### `contagem`

A contagem da U19: a **árvore de possibilidades** (cada etapa abre um ramo para cada opção; as escolhas se multiplicam, `3 × 2 = 6`) e a **tabela de dupla entrada** (a grade de pares, como os 36 resultados de dois dados), com os **casos favoráveis** acesos e a **chance** escrita embaixo (`6 de 36 = 6/36 = 1/6 ≈ 16,7 %`). Com `grade`, o palco mostra a grade; sem ela, a árvore. As contas ficam em `components/aula/visual/contagem-geo.ts`.

**A árvore.** Cada etapa entra crescendo da anterior: de um cartão para o outro, aumente `mostradas` de 1 em 1 (ou use o Mexa "ramificar"). A árvore inteira decide onde fica cada nó, então crescer uma etapa não mexe nas outras.

| Chave | Efeito |
|---|---|
| `arvore` | as opções de cada etapa, na ordem: `[['azul', 'preta', 'branca'], ['jeans', 'social']]`. Uma opção pode ter cor: `{ nome: 'azul', cor: 'azul' }`. Até 4 etapas |
| `nomes` | o nome de cada etapa, em cima da coluna: `['camisa', 'calça']`. As etapas que ainda não cresceram mostram o nome apagado |
| `mostradas` | quantas etapas aparecem (padrão: todas; 0 mostra só a raiz) |
| `caminho` | um caminho aceso em âmbar, uma opção por etapa: `[0, 1]` (a primeira camisa com a segunda calça) |
| `combinacoes: true` | na ponta de cada ramo, a combinação inteira ("azul, social, tênis") |
| `conta` | a conta embaixo, `3 × 2 = 6` (só as etapas mostradas); `false` esconde |
| `unidade` | depois do total: `'roupas'` escreve "3 × 2 = 6 roupas" |
| `rotulo` | a frase embaixo |

As cores de opção (aqui, no `sorteio` e nas bolas): `'ambar'`, `'azul'`, `'verde'`, `'erro'` (rosa), `'cinza'`, `'lilas'`, `'branco'`, `'preto'`, e também os nomes do dia a dia: `'amarela'`, `'vermelha'`, `'roxa'`, `'branca'`, `'preta'`, no singular ou no plural. Sem cor, cada etapa tem a sua: âmbar, azul, verde, lilás.

**A grade de pares.** Linhas e colunas com as opções de cada lado; cada casa é um par.

| Chave | Efeito |
|---|---|
| `grade.linhas`, `grade.colunas` | o que vai em cada linha e coluna: `6` (de 1 a 6) ou uma lista (`['cara', 'coroa']`). Sem `colunas`, iguais às linhas. Até 12 de cada lado |
| `grade.nomes` | o nome de cada lado: `['1º dado', '2º dado']` (as linhas, à esquerda, em âmbar; as colunas, em cima, em azul) |
| `grade.conteudo` | o que cada casa mostra: `'par'` (padrão, "2, 5"), `'soma'`, `'produto'`, `'diferenca'` (a maior menos a menor) ou `'vazio'` |
| `grade.preenchidas` | quantas casas estão escritas, linha por linha (padrão: todas). De um cartão para o outro, as casas se escrevem uma a uma |
| `favoraveis` | as casas acesas em âmbar, por uma regra: `{ soma: 7 }`, `{ soma: [7, 11] }`, `{ iguais: true }` (pares iguais), `{ maior: 10 }`, `{ menor: 4 }`, `{ valores: [6, 12] }` (pelo que a casa mostra), ou a lista de casas `[[0, 5], [1, 4]]` (linha, coluna, contando do 0). Duas regras juntas valem as duas |
| `chance: true` | embaixo, "6 de 36 = 6/36"; com `simplificada: true`, "= 1/6"; com `porcentagem: true`, "≈ 16,7 %" (ou "= 50 %" quando é exata) |
| `conta` | sem `chance`, embaixo vai `6 × 6 = 36`; `false` esconde |

Exemplos, um por aula da U19:

```ts
// A4 Contagem: as roupas, a árvore inteira, e um caminho aceso com as combinações
{ modelo: 'contagem', estado: { arvore: [[{ nome: 'azul', cor: 'azul' }, { nome: 'preta', cor: 'preto' }, { nome: 'branca', cor: 'branco' }], ['jeans', 'social']], nomes: ['camisa', 'calça'], unidade: 'roupas' } }
{ modelo: 'contagem', estado: { arvore: [['azul', 'preta', 'branca'], ['jeans', 'social'], ['tênis', 'sapato']], nomes: ['camisa', 'calça', 'sapato'], caminho: [0, 1, 0], combinacoes: true } }
// A4 Dois dados: os 36 pares
{ modelo: 'contagem', estado: { grade: { linhas: 6, colunas: 6, nomes: ['1º dado', '2º dado'] } } }
// A5 Probabilidade: a soma 7 com dois dados
{ modelo: 'contagem', estado: { grade: { linhas: 6, conteudo: 'soma', nomes: ['1º dado', '2º dado'] }, favoraveis: { soma: 7 }, chance: true, simplificada: true, porcentagem: true } }
// A moeda e o dado juntos
{ modelo: 'contagem', estado: { grade: { linhas: ['cara', 'coroa'], colunas: 6, nomes: ['moeda', 'dado'] } } }
```

Os Mexa, prontos para copiar:

```ts
// ramificar: cada toque na árvore faz a próxima etapa crescer; a conta embaixo cresce junto
{ tipo: 'mexa', texto: 'Três camisas e duas calças. Quantas roupas diferentes?', visual: { modelo: 'contagem', estado: { arvore: [['azul', 'preta', 'branca'], ['jeans', 'social']], nomes: ['camisa', 'calça'], unidade: 'roupas' } },
  acao: { tipo: 'tocar', instrucao: 'Toque na árvore para abrir cada escolha.', sucesso: { etapas: 2 }, mostre: 'Cada camisa abre duas calças.' }, descoberta: '3 × 2 = 6 roupas.' }
// favoráveis: tocar cada casa que serve; a que não serve diz quanto dá
{ tipo: 'mexa', texto: 'Dois dados. Em quantos resultados a soma dá 7?', visual: { modelo: 'contagem', estado: { grade: { linhas: 6, conteudo: 'soma' }, favoraveis: { soma: 7 }, chance: true, simplificada: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque em cada casa com soma 7.', sucesso: { favoraveis: 6 }, mostre: 'São 6 casas, na diagonal.' }, descoberta: '6 de 36: a chance é 1/6.' }
```

Limites (medidos no celular):

- A árvore cabe até umas 12 pontas no celular com `combinacoes` (os nomes encolhem até 9 px), até 24 sem elas. Use nomes curtos (até uns 8 letras); com 3 etapas e `combinacoes`, "branca, social, sapato" ainda cabe.
- A grade 6 × 6 fica com casas de uns 50 × 45 px no celular: `'par'` ("6, 6") e a soma cabem bem. Até 12 × 12 funciona, mas as casas ficam pequenas (uns 25 px): para tocar, até 6 × 6.
- No Mexa "favoráveis", `sucesso.favoraveis` tem de ser a quantidade de casas da regra (os testes cobram): com 5 para `{ soma: 7 }`, o Mexa nunca fecha. A casa errada treme e diz o porquê: "Essa casa dá 1 + 1 = 2. Procure as que dão 7.", "Nessa casa os dois números são diferentes. Procure os pares iguais."
- Durante o Mexa, a chance mostra só "2 de 36"; a fração e a porcentagem aparecem quando todas as casas estão acesas.

### `sorteio`

O sorteio da U19: os **casos possíveis** (as faces do dado, a moeda, as bolas no saco, as cartas), com os **favoráveis** acesos e a **chance** escrita; e a **simulação**: jogar muitas vezes, as contagens crescem nas barras e a frequência relativa (a porcentagem de cada resultado) chega perto da chance, a linha tracejada. A simulação é **determinística**: a mesma `semente` dá sempre os mesmos resultados, e jogar mais não muda as primeiras jogadas (as barras só crescem). As contas ficam em `components/aula/visual/sorteio-geo.ts`.

Com `jogadas`, o palco mostra a simulação; sem ela, os casos.

| Chave | Efeito |
|---|---|
| `casos` | `'dado'` (as 6 faces), `'moeda'` (cara e coroa) ou uma lista: `['A', 'K', 'Q', 'J']` ou `[{ nome: 'A', cor: 'erro' }]` (cartas com borda colorida; até 24) |
| `bolas` | as bolas no saco, por cor: `{ azul: 3, vermelha: 2 }` (ou `[['azul', 3], ['vermelha', 2]]`; até 30 de cada cor). Cada bola é um caso |
| `favoraveis` | os casos acesos em âmbar (os outros apagam): `{ valores: [2, 4, 6] }` (pelo nome ou pelo número), `{ maior: 4 }`, `{ menor: 3 }`, `{ cor: 'vermelha' }` (ou uma lista de cores), ou a lista dos índices `[0, 1]` (contando do 0, na ordem dos casos; nas bolas, cor por cor) |
| `chance: true` | embaixo, "3 de 6 = 3/6"; com `simplificada: true`, "= 1/2"; com `porcentagem: true`, "= 50 %" (ou "≈ 16,7 %") |
| `sorteado` | um caso que saiu (índice): ele sobe, com um anel branco; os outros apagam |
| `jogadas` | quantas vezes já jogou (até 10.000): o palco mostra a simulação. Em cima, "100 jogadas" e os últimos resultados (o mais novo à direita, com anel); no meio, uma barra por resultado com a contagem em cima e a porcentagem embaixo; a linha tracejada é a chance. De um cartão para o outro, aumente `jogadas` (10 → 100 → 1.000) e as barras crescem |
| `semente` | a semente do sorteio (padrão 1). Mude para ter outra sequência; escolha uma que conte a história que você quer (veja abaixo) |
| `sequencia` | os primeiros resultados, fixos: `['cara', 'cara', 'cara', 'cara', 'cara']` (a falácia do jogador; nas bolas, a cor). Depois deles, o sorteio segue pela semente |
| `curva` | embaixo das barras, a curva da porcentagem de um resultado ao longo das jogadas, com a chance tracejada: `true` (o primeiro resultado) ou o índice (`curva: 5` é o 6 do dado) |
| `probabilidade: false` | sem a linha tracejada da chance |
| `botoes` | Mexa "jogar": os botões (padrão `[1, 10, 100]`; até 4) |
| `rotulo` | a frase embaixo |

Algumas sementes, para copiar (as contagens de cara e coroa, ou das faces 1 a 6):

| Estado | Resultado |
|---|---|
| `{ casos: 'moeda', jogadas: 10, semente: 3 }` | 7 caras e 3 coroas: com poucas jogadas, longe de metade |
| `{ casos: 'moeda', jogadas: 100, semente: 3 }` | 40 e 60 |
| `{ casos: 'moeda', jogadas: 1000, semente: 3 }` | 494 e 506: perto de metade |
| `{ casos: 'moeda', jogadas: 10000, semente: 3 }` | 4.992 e 5.008 |
| `{ casos: 'moeda' }` (semente 1), com 10, 100 e 1.000 jogadas | 3 e 7; 53 e 47; 505 e 495 |
| `{ casos: 'dado', jogadas: 600, semente: 7 }` | 85, 96, 89, 111, 124, 95 |

Exemplos, um por aula da U19:

```ts
// A5 Probabilidade: as faces pares do dado, as bolas azuis no saco, duas cartas
{ modelo: 'sorteio', estado: { casos: 'dado', favoraveis: { valores: [2, 4, 6] }, chance: true, simplificada: true, porcentagem: true } }
{ modelo: 'sorteio', estado: { bolas: { azul: 3, vermelha: 2, verde: 1 }, favoraveis: { cor: 'azul' }, chance: true, porcentagem: true } }
{ modelo: 'sorteio', estado: { casos: ['A', 'K', 'Q', 'J', '10', '9'], favoraveis: [0, 1], chance: true, simplificada: true } }
{ modelo: 'sorteio', estado: { casos: 'moeda', sorteado: 0 } }
// A6 Frequência e simulação: 100 jogadas da moeda; 600 do dado com a curva do 6; a falácia do jogador
{ modelo: 'sorteio', estado: { casos: 'moeda', jogadas: 100, semente: 3 } }
{ modelo: 'sorteio', estado: { casos: 'dado', jogadas: 600, semente: 7, curva: 5 } }
{ modelo: 'sorteio', estado: { casos: 'moeda', jogadas: 5, sequencia: ['cara', 'cara', 'cara', 'cara', 'cara'], rotulo: 'A próxima: ainda 1/2' } }
```

Os Mexa, prontos para copiar:

```ts
// jogar: cada botão joga 1, 10 ou 100 vezes; termina com `jogadas` (e o aluno pode continuar jogando)
{ tipo: 'mexa', texto: 'Cara ou coroa: metade das vezes?', visual: { modelo: 'sorteio', estado: { casos: 'moeda', jogadas: 0, semente: 3, curva: true } },
  acao: { tipo: 'tocar', instrucao: 'Jogue a moeda pelo menos 100 vezes.', sucesso: { jogadas: 100 }, mostre: 'A moeda é jogada 100 vezes.' }, descoberta: 'Com muitas jogadas, a porcentagem de caras fica perto de 50 %.' }
// favoráveis: tocar cada caso que serve; o que não serve diz o porquê
{ tipo: 'mexa', texto: 'Três bolas azuis e duas vermelhas no saco.', visual: { modelo: 'sorteio', estado: { bolas: { azul: 3, vermelha: 2 }, favoraveis: { cor: 'vermelha' }, chance: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque nas bolas vermelhas.', sucesso: { favoraveis: 2 }, mostre: 'As duas vermelhas acendem.' }, descoberta: '2 de 5: a chance de tirar vermelha é 2/5.' }
{ tipo: 'mexa', texto: 'No dado, quais faces são maiores que 4?', visual: { modelo: 'sorteio', estado: { casos: 'dado', favoraveis: { maior: 4 }, chance: true, simplificada: true } },
  acao: { tipo: 'tocar', instrucao: 'Toque em cada face maior que 4.', sucesso: { favoraveis: 2 }, mostre: 'O 5 e o 6.' }, descoberta: '2 de 6 = 1/3.' }
```

Limites (medidos no celular):

- Os casos crescem até caber: o dado fica com faces de uns 78 px (6 em duas linhas no celular, uma linha no computador); a moeda, com uns 96 px; as bolas, até 44 px (com 12 bolas, umas 6 por linha). Até 24 cartas; nomes de até 3 letras ficam grandes.
- A simulação cabe até uns 8 resultados lado a lado no celular (nomes de até 6 letras); o dado e a moeda ficam muito bem. Com `curva`, as barras ficam com pouco mais da metade da altura.
- As jogadas vão até 10.000. Com poucas jogadas (10, 20), a frequência fica longe da chance; com 1.000 ou mais, perto: é o que a aula mostra. Confira na tela a semente que você escolher.
- No Mexa "favoráveis", `sucesso.favoraveis` tem de ser a quantidade de casos da regra. Os avisos: "Essa bola é azul. Toque só nas vermelhas.", "Esse é o 1. Procure 2, 4 ou 6.", "3 não é maior que 4."
- No Mexa "jogar", os botões continuam depois da meta: o aluno pode jogar mais e ver a curva assentar.

**A U19, aula por aula.** O modelo de cada momento, para planejar:

| Aula | Modelo | O momento que o player já desenha |
|---|---|---|
| A1 Média, mediana e moda | `dados` | os pontos sobre a reta; o apoio que equilibra (Mexa "equilibrar"); a fila e o do meio (Mexa "ordenar", "achar" a mediana); a pilha mais alta (Mexa "achar" a moda) |
| A2 Quando a média engana | `dados` | o valor que destoa puxa a média e não mexe na mediana (`media` + `mediana` + `destaque`); duas lojas com a mesma média e amplitudes diferentes (`conjuntos` + `amplitude`) |
| A3 Desvio padrão, a ideia | `dados` | cada desvio até a média e a soma que dá zero (`desvios`, `somaDesvios`); as distâncias sem sinal (`distancias`); a faixa média ± desvio de duas máquinas (`conjuntos` + `faixa`): o lote passou no controle? |
| A4 Contagem | `contagem` | a árvore que cresce etapa por etapa (Mexa "ramificar"), o caminho aceso, a grade dos 36 pares de dois dados |
| A5 Probabilidade | `sorteio`, `contagem` | os casos possíveis e os favoráveis acesos com a chance escrita (Mexa "favoráveis" no dado, no saco, nas cartas); a soma 7 na grade |
| A6 Frequência e simulação | `sorteio` | jogar 1, 10, 100 vezes e ver as barras e a curva chegarem na chance (Mexa "jogar"); cinco caras seguidas e a próxima ainda 1/2 (`sequencia`) |

## Mexa: as manipulações

O player reconhece a manipulação pelo modelo e pelo formato de `acao.sucesso`:

| Modelo | `sucesso` | O aluno |
|---|---|---|
| `blocos` | `{ dezenas, unidades, … }` | toca um grupo com 10 ou mais peças: 10 viram 1 da ordem seguinte |
| `blocos` com `desagrupar: true` | `{ dezenas, unidades, … }` | toca uma barra (ou placa): ela vira 10 da ordem de baixo |
| `quadro-posicional` com `algarismos` | `{ numero }` | toca um algarismo e depois a casa |
| `quadro-posicional` com `algarismos` e `tamanhoGrupo` | `{ grupos: [[1,2],[5,0,0]] }` | toca entre algarismos para pôr pontos |
| `quadro-posicional` com `classes` e `cartoes` | `{ grupos: [2,5,40,6] }` | toca um grupo e depois a classe |
| `reta` com `etiquetaSolta` ou `etiquetas` | `{ posicao }` ou `{ posicoes }` | toca a reta onde cada etiqueta vai |
| `reta` com `escolhas` | `{ vizinho }` | toca uma das marcas |
| `reta` com `condicao` | `{ testados: 4 }` (quantos números diferentes), `{ testar: [0, 3, 6] }` (estes números) ou os dois juntos | toca a reta: o toque vai para o traço mais perto (de `passo` em `passo`) e põe aquele número na condição. Ele fica com ✓ verde ou ✗ rosa, e embaixo aparece a conta (`2 · 5 + 3 = 13`, `13 < 11 ✗`; no empate, `3 > 3 ✗` e `3 é igual a 3: não é maior.`). Não servir não é erro. Embaixo, "2 de 4 números". Termina com a meta, com pelo menos um número que serve e um que não serve (se a reta tem dos dois: "Teste também um número que não serve.") e com todos os de `testar` ("Teste também o 3."). No fim aparece o pedaço inteiro que serve (`solucao`). A meta não pode passar do número de traços, e os de `testar` têm de ser traços |
| `reta` com `numeros` ou `intervalos` | `{ espelhado: true }` | toca o botão × (−1) (ou a reta): cada número viaja por um arco até o outro lado do zero, a faixa vira para o outro lado, e a frase troca o sinal (`3 < 5` → `−3 > −5`, `x < 3` → `−x > −3`) |
| `reta`, `acao.tipo: 'deslizar'` | `{ numero }` | arrasta um ponto entre `de + unidadeDe` e `de + unidadeAte`; a seta mostra o arredondamento |
| `livre` com `fichas` | `{ ordem }` | toca as fichas na ordem |
| `retangulo` com `adicionar: true` | `{ linhas }` | toca o retângulo (ou "+ 1 linha") e uma linha nova de `colunas` quadradinhos entra; começa de `linhas` (pode ser 0) |
| `retangulo` com `cortar: true` | `{ corte }` | toca entre duas colunas para partir o retângulo ali; o certo é a coluna `corte` |
| `retangulo` com `girar: true` em `acao.sucesso` | `{ girado: true }` | toca o retângulo e ele gira 90° |
| `retangulo` por área com `revelar: true` | `{ reveladas: 4 }` (o número de partes; com `oculto`, o de partes do lado escondido) | toca cada parte: a área aparece com um pulo e a parte acende. Com `oculto`, o toque descobre a parte do lado escondido. Termina com tudo descoberto; aí aparecem o `total` e a `somaTermos` |
| `barra` com `pintar: true` | `{ pintadas }` | toca as partes da barra para pintar (um toque pinta até ali; um toque numa pintada tira dali em diante). Com várias barras, `ativa` é o índice da que recebe os toques (padrão 0) |
| `quadro-posicional` com `medida` | `{ para }` | toca a unidade de chegada: a vírgula anda até depois dela e os zeros que faltam aparecem |
| `grade` com `pintar: true` | `{ pintadas }` | toca os quadradinhos para pintar (um toque pinta até ali, coluna por coluna; um toque num pintado tira dali em diante). Com `porColuna: true`, cada toque pinta a coluna inteira (para décimos; `pintadas` deve ser múltiplo de 10). Com várias grades, `ativa` é o índice do número que recebe os toques |
| `barra` com `partir: true` | `{ partes }` | toca a barra e cada parte se corta em `fator` (padrão 2); o pintado continua do mesmo tamanho (1/2 → 2/4 → 4/8) |
| `livre` com `azulejos.agrupar: true` | `{ agrupado: true }` | toca uma peça e todas as do mesmo tipo vão juntas para um grupo, com a contagem; termina quando todos os tipos estão juntos (com `mostraExpressao`, a expressão aparece no fim) |
| `livre` com `azulejos.virar` | `{ virado: true }` | toca o monte com o − na frente: todas as peças dele trocam de sinal de uma vez, girando, e o − vira + |
| `livre` com `azulejos.fatorar: [b, c]` | `{ fatorado: [p, q] }` (o par que fecha, em qualquer ordem) | toca os azulejos: os quadradinhos se arrumam no próximo par de fatores de c (1 × 6, 2 × 3…) e as barras vão atrás. O par que não fecha mostra as barras que faltam (vagas tracejadas) ou que sobram (de lado) e diz por quê, sem contar como erro. Termina quando p + q = b |
| `livre` com `azulejos.completar: b` | `{ completo: true }` | toca os azulejos: o primeiro toque parte as barras em duas metades ao redor do x² e aparece o canto vazio ("falta um canto 3 por 3"); o segundo enche o canto com os (b/2)² quadradinhos e aparece o "+ 9" (`x² + 6x + 9 = (x + 3)²`). Com `partido: true`, começa partido e basta um toque |
| `livre` com `produtoZero` | `{ raizes: [2, -3] }` (os valores que zeram, em qualquer ordem) | toca os botões de x: a coluna mostra cada fator e o produto, e a conta do x aparece embaixo, com o fator zero em âmbar. Um valor que não zera não é erro. Termina quando todos os valores que zeram foram postos |
| `livre` com `sistema.equacoes` | `{ somado: true }` (ou `{ multiplicado: true }`) | toca as equações: com `vezes`, o primeiro toque multiplica a linha (o "× (−1)" pisca); o seguinte soma: os termos que se anulam são riscados e a soma aparece embaixo (`2x = 14`) |
| `livre` com `sistema.trocar` | `{ trocado: true }` | toca a caixa: ela voa para o lugar da letra na segunda equação, com os parênteses (`x + (x + 2) = 10`) |
| `retangulo` com `recorte` e `mover: true` | `{ movido: true }` | toca o quadrado recortado: o L se corta em dois, o pedaço de baixo gira e vai para o lado, e aparece x² − 9 = (x + 3)(x − 3) |
| `livre` com `saldo.tirar` | `{ tiradas }` | toca as fichas do sinal `tirar` e elas saem, uma por toque. Quando acabam as fichas daquele sinal, o botão "Pôr um par + −" traz uma + e uma − (vale zero, o saldo não muda) e o aluno continua tirando. Termina com `tiradas` fichas fora. Ex.: 2 − (−3) é `{ positivas: 2, negativas: 0, tirar: '−' }` com `{ tiradas: 3 }`: três pares, três − fora, sobra +5 |
| `balanca` com `tirar: true` (inclinada: veja "A balança inclinada") | `{ esquerda: { x, n }, direita: { x, n } }`: o que deve **sobrar** em cada prato (o que falta vale 0; `n` conta também os `pesos`) | toca uma peça e ela sai. Tirando só de um lado, a balança inclina (pelo `valor`; sem ele, pelo valor que equilibra os pratos do começo) e aparece "A balança inclinou: você tirou só de um lado. Tire o mesmo do outro lado."; tirando o mesmo do outro, ela volta. Tocar numa peça que tem de ficar é erro ("Essa caixa fica: neste prato tem de sobrar 2x."). Termina quando sobra o alvo, em equilíbrio (a balança que começa inclinada termina inclinada para o mesmo lado). Ex.: 3x + 2 = x + 10 é `{ esquerda: { x: 3, n: 2 }, direita: { x: 1, n: 10 }, tirar: true, mostraEquacao: true }` com `{ esquerda: { x: 2 }, direita: { n: 8 } }` |
| `balanca` com `dividir: k` | `{ dividido: true }` | os pratos aparecem partidos em `k` grupos, todos acesos; o aluno toca num grupo e fica só um grupo de cada lado (com `mostraEquacao`, `2x = 8` vira `x = 4`) |
| `livre` com `tabela.completar: true` | `{ colunas }` | toca a próxima coluna vazia e ela se preenche, com as setas que chegam nela; começa com `tabela.mostradas` (padrão 1) e termina quando aparecem `colunas` colunas |
| `figura` com `transferidor` | `{ graus: 60 }` (o ângulo desenhado) | toca o número da escala onde o lado do ângulo passa. Na escala certa (a que começa no 0 sobre o outro lado), o número ganha o anel âmbar e o ângulo mostra o valor. Na outra escala (120 em vez de 60): "Esse número é da escala de fora. Use a que começa no 0, sobre o lado do ângulo."; longe do lado: "Siga o outro lado do ângulo até a escala." |
| `figura` com `juntar: true` | `{ cantos: 3 }` ou `{ juntados: true }` | toca cada canto colorido do triângulo: ele é recortado e vai para a reta embaixo, ao lado dos que já estão lá; com os três, a meia volta fica completa e aparece "180°" |
| `figura` com `contorno: true` | `{ perimetro: 18 }` (a soma dos lados) | toca os lados, um a um, em qualquer ordem: cada lado acende em âmbar e a soma cresce embaixo (`5 + 4 + 5`); termina quando todos acendem (`= 18 cm`). Os números vêm de `poligono.lados` (`'5 cm'` vale 5) |
| `figura` com `recortar: true` | `{ recortado: true }` | toca a figura: o triângulo tracejado sai e desliza para o outro lado; o paralelogramo vira retângulo. Use `grade: true` para o aluno contar que a área não mudou |
| `figura` com `desenrolar: true` (e `circulo`) | `{ desenrolado: true }` | toca o palco: o círculo rola sobre a reta, uma volta, e o contorno fica deitado; depois aparecem os 3 diâmetros e o pedacinho que sobra |
| `figura` com `encaixar: true` (e `quadradosNosLados`) | `{ encaixado: true }` | toca o palco: os quadradinhos dos dois quadrados menores voam, um a um, para o quadrado grande e o enchem (9 + 16 = 25) |
| `solido` com `abrir: true` | `{ aberto: true }` | toca o sólido: as faces giram até o plano e ele fica aberto na planificação (caixa, cubo, prisma, cilindro) |
| `solido` com `empilhar: true` | `{ camadas: 3 }` (a altura) | toca o sólido: cai mais uma camada de cubinhos (no cilindro, um disco) e a contagem cresce embaixo ("2 camadas de 12 = 24"). Começa de `camadas` (padrão 0; com `baseCheia`, 1) e para em `camadas` do sucesso |
| `solido` com `pintar: true` | `{ area: 52 }` (a área total, com π = 3,14 no cilindro) | toca as faces, uma a uma, em qualquer ordem: cada uma fica âmbar, mostra a sua área, e a soma cresce embaixo. No sólido fechado, quando as faces à vista estão pintadas, ele se abre sozinho para mostrar as de trás. Termina quando todas as faces estão pintadas e a soma é `area` (`= 52 cm²`) |
| `plano` | `{ ponto: [3, 2] }` ou `{ pontos: [[-2, 3], [2, -3]] }` | toca a grade: o toque vai para o cruzamento mais perto, e um ponto certo anda da origem até lá (primeiro no x, depois no y) e mostra o par; um ponto de `pontos` nas coordenadas do alvo fica escondido até ser marcado e aparece com o nome (`A (3, 2)`). Errado, o ponto aparece em rosa com o par. Trocar x e y: "Você trocou x e y. O primeiro número anda para o lado; o segundo, para cima ou para baixo."; o sinal trocado: "Confira os sinais: x negativo vai para a esquerda; y negativo, para baixo."; outro lugar: "Ainda não. Ande primeiro no x, para o lado; depois no y, para cima ou para baixo." Com `pontos`, termina quando todos estão marcados, em qualquer ordem |
| `plano` com `pontos` com nome | `{ lido: 'B' }` ou `{ lidos: 3 }` | toca um ponto: ele mostra o par e os tracejados até os eixos. Com `lido`, outro ponto é erro ("Esse é o A (2, 3). Procure o ponto pedido."); com `lidos`, termina com tantos pontos lidos |
| `plano` com `maquina` | `{ saidas: 4 }` | toca a máquina (ou a tabela): o próximo número de `entradas` voa até a máquina, a saída sai, entra na tabela e, com o plano, vira um ponto. Começa de `maquina.feitas` (padrão 0) e termina com `saidas` números passados |
| `plano` com `retas` de `equacao` | `{ pontos: 4 }` (quantos pares achar) | toca a grade: um par que serve à primeira equação fica, âmbar, com as coordenadas; o que não serve pisca em rosa e some, e a frase diz a conta ("(3, 5): 3 + 5 = 8 ≠ 10. Esse par não serve.", sem contar como erro). A reta fica escondida e aparece no fim, passando pelos pares. Embaixo, "2 de 4 pares" |
| `plano` com duas `retas` | `{ par: [4, 6] }` (o cruzamento) | toca a grade no ponto das duas retas: o ponto acende com as coordenadas e a conferência nas duas equações. Um par numa reta só é erro, com a conta da outra ("(3, 7) está na reta x + y = 10, mas não na 2x + 3y = 26: 2 · 3 + 3 · 7 = 27 ≠ 26."); fora das duas, "Procure onde elas se cruzam." |
| `grafico` | `{ barra: 2 }`, `{ ponto: 2 }` (linhas) ou `{ setor: 1 }` | toca a barra, o ponto da linha ou a fatia: o certo acende em âmbar; o errado fica rosa ("Ainda não. Compare o topo de cada barra com os números do eixo.", "… Siga a linha e leia cada ponto no eixo.", "… Compare o tamanho das fatias.") |
| `grafico` (barras) | `{ valor: 60 }` | arrasta a barra `ativa` (padrão 0) para cima ou para baixo; o valor anda com o dedo e é conferido quando o dedo sai. Errado: "Ainda não. Leve o topo da barra até o valor, olhando os números do eixo." |
| `dados` | `{ ordenado: true }` | toca os pontos do menor para o maior: cada um sai da reta e entra na fila, com o número dentro. Tocar um que não é o menor que falta é erro (o ponto fica rosa: "Ainda não. Vá do menor para o maior: toque no ponto mais à esquerda."). Termina com todos na fila; com `mediana: true`, os do meio acendem |
| `dados` | `{ media: 6.7 }` (a média dos valores) | arrasta o apoio pela reta (começa em `fulcro`; sem ele, na segunda marca); fora da média, a reta inclina para o lado mais pesado. Perto da média, o apoio encaixa nela. Conferido quando o dedo sai: "A reta pende para a direita: leve o apoio para a direita." (ou para a esquerda) |
| `dados` | `{ mediana: 7 }`, `{ moda: 40 }` ou `{ valor: 30 }` | toca a reta no valor pedido (o toque vai para o valor, a média ou a mediana mais perto); o errado fica marcado em rosa, com o número. Na mediana, tocar a média ou a moda tem aviso próprio ("Esse é o ponto de equilíbrio, a média. A mediana é o valor do meio, com os valores em fila."); na moda, tocar a mediana ou a média também. Com duas modas, as duas valem. Com `fila: true`, toca um ponto da fila: com quantidade par, qualquer um dos dois do meio. No fim, a mediana, a moda ou o valor acendem |
| `contagem` com `arvore` | `{ etapas: 2 }` | toca a árvore: a próxima etapa cresce, um ramo para cada opção, e a conta embaixo cresce junto (`3` → `3 × 2 = 6`). Começa de `mostradas` (padrão 0, só a raiz) |
| `contagem` com `grade` e `favoraveis` | `{ favoraveis: 6 }` (quantas casas a regra acende) | toca cada casa que serve: ela acende e a contagem embaixo cresce ("2 de 36"). A casa que não serve treme e diz o porquê ("Essa casa dá 1 + 1 = 2. Procure as que dão 7."). Termina com todas acesas, e aí a chance aparece inteira |
| `sorteio` com `favoraveis` | `{ favoraveis: 2 }` | toca cada caso que serve (face, bola, carta), como na grade. Avisos: "Essa bola é azul. Toque só nas vermelhas.", "Esse é o 1. Procure 2, 4 ou 6.", "3 não é maior que 4." |
| `sorteio` com `jogadas` | `{ jogadas: 100 }` | toca os botões (`+ 1`, `+ 10`, `+ 100`, ou os de `botoes`): as jogadas somam, as barras e a curva crescem. Termina com `jogadas` ou mais; os botões continuam, para jogar mais |

- **Retorno:**
  - Um erro balança o palco e mostra uma frase curta.
  - Depois de 6 segundos sem toque, aparece o gesto ("Toque nas peças com a borda tracejada.").
  - "Me mostre" leva o palco direto ao estado de sucesso.
- **Fora da tabela:** um Mexa em outro formato funciona só com "Me mostre".
- **Teste:** `tests/aula-mexa.test.ts` joga todos os Mexa do conteúdo. Um Mexa novo que o player não saiba jogar faz o teste falhar.
