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
| `destaque` | acende uma parte: `[linha, coluna]` das partes (`[0, 1]`), `'linha'` (a primeira linha, um grupo) ou `'coluna'` (a primeira coluna) |
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
| `destaque`, `total` | como acima |

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

Com um tipo só, a expressão embaixo não repete a contagem do grupo.

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
| `reta`, `acao.tipo: 'deslizar'` | `{ numero }` | arrasta um ponto entre `de + unidadeDe` e `de + unidadeAte`; a seta mostra o arredondamento |
| `livre` com `fichas` | `{ ordem }` | toca as fichas na ordem |
| `retangulo` com `adicionar: true` | `{ linhas }` | toca o retângulo (ou "+ 1 linha") e uma linha nova de `colunas` quadradinhos entra; começa de `linhas` (pode ser 0) |
| `retangulo` com `cortar: true` | `{ corte }` | toca entre duas colunas para partir o retângulo ali; o certo é a coluna `corte` |
| `retangulo` com `girar: true` em `acao.sucesso` | `{ girado: true }` | toca o retângulo e ele gira 90° |
| `barra` com `pintar: true` | `{ pintadas }` | toca as partes da barra para pintar (um toque pinta até ali; um toque numa pintada tira dali em diante). Com várias barras, `ativa` é o índice da que recebe os toques (padrão 0) |
| `quadro-posicional` com `medida` | `{ para }` | toca a unidade de chegada: a vírgula anda até depois dela e os zeros que faltam aparecem |
| `grade` com `pintar: true` | `{ pintadas }` | toca os quadradinhos para pintar (um toque pinta até ali, coluna por coluna; um toque num pintado tira dali em diante). Com `porColuna: true`, cada toque pinta a coluna inteira (para décimos; `pintadas` deve ser múltiplo de 10). Com várias grades, `ativa` é o índice do número que recebe os toques |
| `barra` com `partir: true` | `{ partes }` | toca a barra e cada parte se corta em `fator` (padrão 2); o pintado continua do mesmo tamanho (1/2 → 2/4 → 4/8) |
| `livre` com `azulejos.agrupar: true` | `{ agrupado: true }` | toca uma peça e todas as do mesmo tipo vão juntas para um grupo, com a contagem; termina quando todos os tipos estão juntos (com `mostraExpressao`, a expressão aparece no fim) |
| `livre` com `saldo.tirar` | `{ tiradas }` | toca as fichas do sinal `tirar` e elas saem, uma por toque. Quando acabam as fichas daquele sinal, o botão "Pôr um par + −" traz uma + e uma − (vale zero, o saldo não muda) e o aluno continua tirando. Termina com `tiradas` fichas fora. Ex.: 2 − (−3) é `{ positivas: 2, negativas: 0, tirar: '−' }` com `{ tiradas: 3 }`: três pares, três − fora, sobra +5 |
| `balanca` com `tirar: true` | `{ esquerda: { x, n }, direita: { x, n } }`: o que deve **sobrar** em cada prato (o que falta vale 0; `n` conta também os `pesos`) | toca uma peça e ela sai. Tirando só de um lado, a balança inclina (pelo `valor`; sem ele, pelo valor que equilibra os pratos do começo) e aparece "A balança inclinou: você tirou só de um lado. Tire o mesmo do outro lado."; tirando o mesmo do outro, ela volta. Tocar numa peça que tem de ficar é erro ("Essa caixa fica: neste prato tem de sobrar 2x."). Termina quando sobra o alvo, em equilíbrio. Ex.: 3x + 2 = x + 10 é `{ esquerda: { x: 3, n: 2 }, direita: { x: 1, n: 10 }, tirar: true, mostraEquacao: true }` com `{ esquerda: { x: 2 }, direita: { n: 8 } }` |
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
