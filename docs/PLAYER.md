# O player de aulas

Como a experiência lê o conteúdo de `content/matematica/` e o transforma em tela. Este documento é para quem escreve o conteúdo: diz o que o player já entende, para os esboços virarem tela sem tradução.

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
  - Uma `resposta` em texto abre um campo de texto (o texto é comparado sem maiúsculas e sem acentos).
  - A `resolucao` se escreve linha a linha.
- **Voz:** com a voz ligada, o player lê `fala` (ou o texto sem markdown) ao entrar no cartão, e lê `explica` depois de uma aposta.
- **Fórmulas** (`$...$` e `Linha.tex`) nunca rolam para o lado: encolhem até caber.

## Exercícios (`sua-vez`)

- **Ordem e domínio:**
  - Os geradores vêm na ordem do cartão.
  - Cada gerador pede acertos **de primeira** (sem dica e sem erro antes):
    - nível 1: 1 acerto;
    - níveis 2 e 3: 2 acertos.
  - Errar ou usar dica zera a sequência daquele gerador, e vem outro item do mesmo gerador.
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
  - no fim, a lista do `ROTEIRO_DIAGNOSTICO_ENTRADA` com "Confirmar" ou "Retomar";
  - o resultado fica guardado no progresso.
- **Diagnóstico de erros:** o mapa `erros` ainda não aparece para o aluno. O feedback é a próxima dica. O mapa está pronto para a Vega usar depois.

## Modelos e chaves de `estado`

O player desenha só o que reconhece. Uma chave desconhecida é ignorada sem erro, mas também não aparece. Se um esboço precisar de algo que não está aqui, escreva no PR.

### `blocos`

| Chave | Efeito |
|---|---|
| `milhares`, `centenas`, `dezenas`, `unidades` | quantas peças de cada; mudanças animam |
| `grupos` + `soltos` / `unidadesSoltas` | o mesmo, com o nome dos geradores (grupos de 10 = dezenas) |
| `total` | mostra o número embaixo (`totalVisivel: false` esconde) |
| `destaque` | `'unidades'`, `'dezenas'`… acende o grupo |
| `rotulos` | legendas embaixo |
| `tamanhoGrupo` | moldura de 10 lugares para as peças soltas |
| `abrirDezenas`, `abrirCentenas` | barras e placas abertas em peças |

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

### `reta`

| Chave | Efeito |
|---|---|
| `de`, `ate`, `passo` | o trecho e a escala (sem `passo`, uma escala redonda) |
| `marcas` | números escritos (fora da escala também ganham traço) |
| `marcaSemRotulo` | um traço com "?" |
| `numero`, `numeros`, `exemplos`, `exato`, `maior` | pontos em destaque |
| `vizinhos` | setas de cada número (`numeros` ou `exemplos`) até o seu vizinho |
| `meio` | uma linha tracejada |
| `aproximado` | um anel no valor aproximado |
| `escolhas` | círculos tocáveis |
| `etiquetas`, `etiquetaSolta`, `fichas` | cartões acima da reta, ainda fora do lugar |
| `destaqueIntervalos` | os intervalos acendem um a um |
| `comparacoes`, `comparacao`, `aproximacao` | frases grandes embaixo (ex.: `12 > 7`) |
| `unidade` | junto das etiquetas (ex.: km) |

### `livre`

Um destes, nesta ordem:

| Chave | Efeito |
|---|---|
| `fichas` + `lugares` | fichas para pôr em ordem |
| `etapas` + `etapa` | o ciclo, com a etapa atual acesa |
| `pagina` | uma página de caderno com os blocos |
| `materiais` | itens com ícone |
| `dicas` | 3 linhas numeradas |
| `atalho` + `destino` | dois cartões com uma seta |
| `alvos`, `registros`, `caminhos`, `comparacao`, `superficie` | uma lista |

Um estado `livre` sem nenhuma dessas chaves não desenha nada. O cartão fica só com o texto, maior.

`barra`, `retangulo`, `grade` e `balanca` ainda não existem no player. Eles chegam com as unidades que os usam.

## Mexa: as manipulações

O player reconhece a manipulação pelo modelo e pelo formato de `acao.sucesso`:

| Modelo | `sucesso` | O aluno |
|---|---|---|
| `blocos` | `{ dezenas, unidades, … }` | toca um grupo com 10 ou mais peças: 10 viram 1 da ordem seguinte |
| `quadro-posicional` com `algarismos` | `{ numero }` | toca um algarismo e depois a casa |
| `quadro-posicional` com `algarismos` e `tamanhoGrupo` | `{ grupos: [[1,2],[5,0,0]] }` | toca entre algarismos para pôr pontos |
| `quadro-posicional` com `classes` e `cartoes` | `{ grupos: [2,5,40,6] }` | toca um grupo e depois a classe |
| `reta` com `etiquetaSolta` ou `etiquetas` | `{ posicao }` ou `{ posicoes }` | toca a reta onde cada etiqueta vai |
| `reta` com `escolhas` | `{ vizinho }` | toca uma das marcas |
| `reta`, `acao.tipo: 'deslizar'` | `{ numero }` | arrasta um ponto entre `de + unidadeDe` e `de + unidadeAte`; a seta mostra o arredondamento |
| `livre` com `fichas` | `{ ordem }` | toca as fichas na ordem |

- **Retorno:**
  - Um erro balança o palco e mostra uma frase curta.
  - Depois de 6 segundos sem toque, aparece o gesto ("Toque nas peças com a borda tracejada.").
  - "Me mostre" leva o palco direto ao estado de sucesso.
- **Fora da tabela:** um Mexa em outro formato funciona só com "Me mostre".
- **Teste:** `tests/aula-mexa.test.ts` joga todos os Mexa do conteúdo. Um Mexa novo que o player não saiba jogar faz o teste falhar.
