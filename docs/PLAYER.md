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
  - Uma `resposta` numérica abre o teclado numérico da tela.
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

`barra`, `grade` e `balanca` ainda não existem no player. Eles chegam com as unidades que os usam.

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

- **Retorno:**
  - Um erro balança o palco e mostra uma frase curta.
  - Depois de 6 segundos sem toque, aparece o gesto ("Toque nas peças com a borda tracejada.").
  - "Me mostre" leva o palco direto ao estado de sucesso.
- **Fora da tabela:** um Mexa em outro formato funciona só com "Me mostre".
- **Teste:** `tests/aula-mexa.test.ts` joga todos os Mexa do conteúdo. Um Mexa novo que o player não saiba jogar faz o teste falhar.
