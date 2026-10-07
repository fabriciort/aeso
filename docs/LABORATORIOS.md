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
| `setReady(true)` | Libera o botão **Continuar**. Chame quando a etapa cumprir seu objetivo |

Use `StepFrame` para o layout padrão (narrativa à esquerda, instrumento à direita) e `useVegaScreen({ lab, step, state })` para contar à Vega o que está na tela, em uma frase.

Registre o mapa em `components/observatory/views/LabView.tsx` (`STEP_COMPONENTS`).

## 3. Reutilize instrumentos

`components/instruments/`:

- **`TransitSimulator`**: estrela com escurecimento de borda e planeta em trânsito, com a curva de luz ao vivo.
- **`Plot`**: gráfico em canvas para milhares de pontos, com marcadores, faixa de destaque e clique.

Instrumentos não sabem nada de laboratórios: recebem números e devolvem eventos.

## 4. Dados reais

Se o laboratório usa dados de telescópio, declare um `target` e crie uma rota em `app/api/…` que só aceita alvos do catálogo; nunca aceite URLs arbitrárias. Sempre tenha uma alternativa simulada, **rotulada como simulada**, para quando o arquivo de dados estiver fora do ar.

## Lista de verificação antes de publicar

- [ ] Todas as etapas chamam `setReady` em algum momento.
- [ ] Previsões e desafios explicam a resposta depois da escolha, nos dois casos (certo e errado).
- [ ] Números com unidade e vírgula decimal (`formatNumber`).
- [ ] A física foi revisada por alguém da área.
- [ ] Funciona em 390 px de largura e com `prefers-reduced-motion`.
- [ ] Testes para qualquer cálculo novo (`tests/`).
