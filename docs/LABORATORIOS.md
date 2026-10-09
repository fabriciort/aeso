# Como criar um laboratório

Um **Laboratório** é uma sequência de **Etapas** (ver `docs/PRODUTO.md`). O primeiro, "Encontre um exoplaneta", serve de referência.

## 1. Defina o laboratório no catálogo

`lib/labs/catalog.ts`

```ts
{
  slug: 'cor-das-estrelas',          // vira a URL /app/laboratorios/cor-das-estrelas
  title: 'Por que as estrelas têm cores',
  subtitle: 'Uma frase que dá vontade de começar.',
  area: 'Física',
  level: 'Todos',
  minutes: 15,
  status: 'disponivel',              // 'em-breve' mostra o cartão, mas não abre
  concepts: ['Radiação de corpo negro', 'Lei de Wien'],
  accent: '#ff8a65',                 // cor do laboratório (capa, rótulos, barra de progresso)
  achievement: { title: '…', description: '…' },
  steps: [
    { id: 'imagine', kind: 'cenario', title: '…', goal: '…', vega: 'contexto para a Vega' },
    // …
  ],
}
```

- **`goal`** aparece sob o título da etapa. Escreva uma frase só, com verbo.
- **`vega`** é invisível ao aluno: descreve o que está na tela, a ideia central e a resposta esperada, para a Vega guiar sem entregá-la.
- Siga a ordem recomendada dos tipos: `cenario → previsao → conceito → observacao → medicao → desafio → conclusao`. Um laboratório pode pular tipos, mas sempre começa num cenário e termina numa conclusão.

## 2. Escreva as etapas

`components/labs/<slug>/steps.tsx` exporta um componente por etapa e um mapa `{ [stepId]: Componente }`. Cada etapa recebe `StepProps`:

| Prop | Uso |
|---|---|
| `lab` | A definição do laboratório |
| `answers` / `setAnswer(chave, valor)` | Estado salvo do aluno (persiste no navegador) |
| `setReady(true)` | Libera o botão **Continuar** para a cena atual |
| `registerNav` / `reportScene` | Usados por `useScenes`; não chame direto |

**Regra de ouro: a etapa cabe numa tela de celular (390 × 844) sem rolar.** Use `StepFrame` com três partes:

```tsx
const [scene, setScene] = useScenes(props, 3, 'minhaEtapaScene')

<StepFrame
  lab={lab} stepIndex={0} scene={scene}
  stage={<Panel>…instrumento…</Panel>}         // sempre visível
  caption={legendas[scene]}                      // 1–2 frases, no máximo ~140 caracteres
  controls={scene === 2 ? <Slider … /> : null}   // compactos, perto do polegar
/>
```

- Se o texto não cabe, **divida em cenas** em vez de escrever mais.
- O palco deve reagir a cada cena (mostrar um rótulo, ligar uma curva, trocar a visualização). É isso que dá a sensação de história contínua.
- Uma ação concluída pode avançar a cena sozinha (`setScene`), como ao achar as quedas no gráfico.
- Use `useVegaScreen({ lab, step, state })` para contar à Vega o que está na tela, em uma frase.

- `narration="…"`: texto alternativo para a **voz da Vega** quando a legenda tem símbolos que soam mal (fórmulas). Sem ele, a voz lê o texto da legenda (`lib/observatory/voice.ts` já converte δ, ≈, ², K, nm, km/s…).
- `nudge="…"`: uma dica que a Vega oferece (balão + voz) se o aluno ficar ~18 s parado na mesma cena. Passe só enquanto a tarefa não foi feita (`nudge={!feito ? '…' : undefined}`). A dica orienta o olhar; nunca entrega a resposta.

Cada laboratório tem um `components/labs/<slug>/index.ts` que exporta por padrão um `LabModule` (`{ steps, Stage? }`), registrado em `components/labs/registry.ts` (carregado sob demanda, pré-carregado na capa).

## 2b. Palco contínuo (animações que se ligam)

Num laboratório com **palco contínuo**, um único instrumento fica montado do começo ao fim, fora das transições das etapas. Ele **se transforma** de uma etapa para a outra (a esfera aquecida vira estrela, a estrela se abre num espectro…) em vez de ser trocado. As etapas mostram só legenda + controles.

```tsx
// components/labs/<slug>/index.ts
const lab: LabModule = { steps: MEU_LAB_STEPS, Stage: MeuPalco }
```

- O `Stage` recebe `StageProps`: `stepId`, `stepIndex`, `scene`, `answers`/`setAnswer` e `live`/`setLive`.
- **`live`** são valores ao vivo do laboratório inteiro (temperatura escolhida, estrela tocada…), não salvos. Nas etapas: `const [live, setLive] = useLive<MeuLive>()`. Use `live` para o palco e as etapas conversarem (ex.: o palco detecta a órbita fechada e a etapa libera o Continuar).
- Nas etapas, use `StepFrame` normalmente **sem** `stage`: no modo contínuo ele desenha só a coluna de texto, numa área de altura fixa (o palco nunca pula de tamanho).
- O palco deve **interpolar** suas formas (posição, tamanho, cor, escala dos eixos) a cada quadro em direção ao alvo de cada etapa/cena. Nunca troque de visual com um corte seco: é isso que faz uma animação fluir para a outra.
- Interações diretas (arrastar, tocar) acontecem no palco; respeite `prefers-reduced-motion` (pule a interpolação).

## 3. Reutilize instrumentos

`components/instruments/`:

- **`TransitSimulator`**: estrela com escurecimento de borda e planeta em trânsito, com a curva de luz ao vivo.
- **`Plot`**: gráfico em canvas para milhares de pontos, com marcadores, faixa de destaque e clique.

Instrumentos não sabem nada de laboratórios: recebem números e devolvem eventos.

## 4. Dados reais

Se o laboratório usa dados de telescópio, declare um `target` e crie uma rota em `app/api/…` que só aceita alvos do catálogo; nunca aceite URLs arbitrárias. Sempre tenha uma alternativa simulada, **rotulada como simulada**, para quando o arquivo de dados estiver fora do ar.

## 5. Laboratórios de Matemática

Mesmo formato (etapas, cenas, palco contínuo, voz, dicas), com `area: 'Matemática'` e `track` (veja `lib/labs/math.ts`, onde ficam as trilhas e a ordem dos laboratórios). A rota é `/app/matematica/<slug>`.

- **Pedagogia:** concreto → visual → simbólico. A fórmula aparece como resumo do que o aluno já viu e manipulou, nunca antes. Antes de cada revelação, o aluno prevê.
- **Resolva:** pelo menos um problema resolvido passo a passo. A cada passo o aluno escolhe a próxima operação entre 2–4 opções, cujos distratores são erros comuns; a escolha errada é explicada com gentileza e mostrada no palco. A ajuda diminui do 1º ao 3º problema. O **Caderno** no palco escreve uma linha em Tex por passo certo.
- **Notação:** `<Tex say="…">` (`components/math/Tex.tsx`, KaTeX). O `say` é o que a voz da Vega lê. Decimal com vírgula: `texNum`/`fmt` (`lib/math/view.ts`).
- **Gráficos:** `lib/math/view.ts` (janela animável, `toPx`, ticks) e `components/math/canvas.ts` (`useMathCanvas`, `drawAxes` com `titles`, `drawFunction`, `drawDot`, `drawArrow`). Anime a **janela** entre cenas (zoom num ponto, deslizar) em vez de trocar de gráfico.
- **Mundo real:** cada lab liga a ideia a algo verificável e cita a fonte (ex.: os tempos de Usain Bolt em Berlim 2009 no lab da derivada). Modelos ajustados são rotulados como modelo.

## Lista de verificação antes de publicar

- [ ] Todas as etapas chamam `setReady` em algum momento.
- [ ] Previsões e desafios explicam a resposta depois da escolha, nos dois casos (certo e errado).
- [ ] Números com unidade e vírgula decimal (`formatNumber`).
- [ ] A física foi revisada por alguém da área.
- [ ] Nenhuma etapa rola em 390 × 844 (teste com o Playwright: `scrollHeight === innerHeight`).
- [ ] Funciona em 390 px de largura e com `prefers-reduced-motion`.
- [ ] Testes para qualquer cálculo novo (`tests/`).
