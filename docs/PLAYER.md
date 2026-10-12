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
| `passo` | palco + caderno da tela + pergunta do passo | o último passo é acertado |
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
  - Uma `resposta` numérica abre o teclado numérico da tela (com vírgula, se for um decimal).
  - Uma `resposta` em texto abre um campo de texto. Vale se o que o aluno escreveu contém a resposta, sem contar maiúsculas e acentos ("tentar sozinho" vale para `tentar`).
  - A `resolucao` se escreve linha a linha.
- **Voz:** com a voz ligada, o player lê `fala` (ou o texto sem markdown) ao entrar no cartão, e lê `explica` depois de uma aposta.
- **Fórmulas** (`$...$` e `Linha.tex`) nunca rolam para o lado: encolhem até caber.

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
| `base`, `altura` | ex.: `base: [20, 3]`, `altura: [10, 4]` para 23 × 14; as partes ficam proporcionais (com um tamanho mínimo para caber o rótulo) |
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
| `expressao` + (`destaque`) | uma expressão resolvida em etapas, uma por linha, de cima para baixo (`['2 + 3 × 4', '2 + 12', '14']`); a última fica maior. `destaque` é um trecho da última linha que ganha uma moldura âmbar (`'3 × 4'`) |
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

Os números da tabela inteira têm o mesmo tamanho, o que cabe no mais comprido. Com muitas colunas no celular (5 ou mais), os rótulos encolhem primeiro.

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
| `semRotulo: true` | esconde o número embaixo |
| `separar: true` | as colunas cheias (décimos) em âmbar e os quadradinhos soltos (centésimos) em verde |
| `escala: true` | escreve 0,1 … 1 embaixo das colunas (melhor na tira) |
| `faixas: [l, c]` | multiplicação: as primeiras `l` linhas e `c` colunas ficam claras, e o cruzamento em âmbar (`[3, 4]` é 0,3 × 0,4 = 0,12) |
| `destaque` | o índice do número em destaque; os outros ficam apagados |

`balanca` ainda não existe no player. Ele chega com a unidade que o usa.

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
| `livre` com `tabela.completar: true` | `{ colunas }` | toca a próxima coluna vazia e ela se preenche, com as setas que chegam nela; começa com `tabela.mostradas` (padrão 1) e termina quando aparecem `colunas` colunas |

- **Retorno:**
  - Um erro balança o palco e mostra uma frase curta.
  - Depois de 6 segundos sem toque, aparece o gesto ("Toque nas peças com a borda tracejada.").
  - "Me mostre" leva o palco direto ao estado de sucesso.
- **Fora da tabela:** um Mexa em outro formato funciona só com "Me mostre".
- **Teste:** `tests/aula-mexa.test.ts` joga todos os Mexa do conteúdo. Um Mexa novo que o player não saiba jogar faz o teste falhar.
