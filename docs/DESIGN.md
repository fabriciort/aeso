# Design e movimento

## Fundamentos

- **Tema:** escuro ("céu noturno"), fundo `#030407`, superfícies de vidro fosco (`.glass`, `.glass-strong`).
- **Tipografia:** Geist Sans (interface) e Geist Mono (números, coordenadas, identificadores). Títulos com `tracking` negativo (−0,02 a −0,045 em).
- **Cor:** quase toda a interface é neutra. A cor de destaque é o azul `sky-300/400`. Cada missão do MAST tem uma cor fixa (`lib/missions.ts`). O âmbar (`#f6b74e`) indica "estrela/energia" nos laboratórios.
- **Raios:** 22–28 px para cartões e painéis; `rounded-full` para botões e chips.
- **Rótulos pequenos** usam `.eyebrow` (11 px, caixa alta, espaçamento 0,16 em).

## Movimento

Todo movimento vem de molas (framer-motion). Tokens em `lib/motion.ts`:

| Token | Uso | Valores |
|---|---|---|
| `spring.soft` | painéis entrando, layout | stiffness 260, damping 30 |
| `spring.snappy` | botões, pílulas, indicadores | stiffness 500, damping 38 |
| `spring.gentle` | grandes transições de área | stiffness 170, damping 26 |
| `rise` | entrada de conteúdo: sobe 12 px, sai do desfoque | ver `lib/motion.ts` |

Regras:

1. **Nunca há tela em branco.** Toda troca de área é um crossfade com leve escala (0,985 → 1) e desfoque (8 px → 0).
2. **Conteúdo novo entra em cascata** (`stagger` de 40–60 ms), de cima para baixo.
3. **Carregamento invisível.** Pré-carregamos o que a próxima ação vai precisar (Aladin, dados do laboratório) enquanto o aluno lê.
4. **Feedback em até 100 ms** para todo toque (escala 0,96 no `active`).
5. **`prefers-reduced-motion`** desliga animações contínuas e reduz transições a fades rápidos.

## Abertura (boot)

1. Estrelas surgem e convergem para o anel do logo (≈ 0,8 s).
2. O anel acende, e mensagens de estado mudam conforme o carregamento real acontece ("Calibrando instrumentos", "Carregando o céu", "Pronto").
3. O anel se expande e "abre" o Observatório (máscara circular), revelando a interface.

A duração mínima é 1,6 s na primeira visita da sessão; nas seguintes, a abertura é encurtada para ≈ 0,4 s.

## Laboratório: uma tela, sem rolagem

O celular é a referência. Cada **Etapa** ocupa exatamente a tela (`100svh`) e nunca rola:

```
┌────────────────────────┐
│ ▬▬▬▬▬▬▬  progresso      │  barra de etapas (a atual se enche conforme as cenas)
│ ✕   4/7 · Observe  Vega │
│ ┌────────────────────┐ │
│ │                    │ │
│ │       PALCO        │ │  instrumento: sempre visível, ocupa o espaço livre
│ │                    │ │
│ └────────────────────┘ │
│ OBSERVE · Agora, de…   │
│ Legenda: 1–2 frases.   │  troca com animação a cada cena
│ [ controles ]          │  perto do polegar
│ (←)  [  Continuar  →  ]│
└────────────────────────┘
```

- **Cenas:** o conteúdo que não cabe vira cenas da mesma etapa. **Continuar** avança as cenas e só depois passa para a próxima etapa. O palco permanece; só a legenda e os controles trocam. Isso é storytelling, não rolagem.
- **Interação direta:** arrastar no próprio palco muda o valor (tamanho do planeta, profundidade do modelo). O controle deslizante é a alternativa precisa.
- **Feedback físico:** vibração curta em escolhas, acertos e conquistas (Android); ondas no ponto tocado; partículas no encaixe.
- **Desktop:** o mesmo conteúdo, com palco à esquerda e legenda e controles à direita, também sem rolagem.

## Ajustes: tela cheia e voz (opcionais)

- **Nada é automático.** O laboratório foi desenhado para ser ótimo numa aba comum do navegador. Tela cheia e voz são **ajustes desligados por padrão**, guardados no navegador (`lib/preferences.ts`).
- Na **capa do laboratório**, dois botões discretos sob "Entrar no laboratório": **Voz da Vega** e **Tela cheia** (este só aparece onde o navegador permite). Dentro do laboratório, o ícone de ajustes na barra superior abre os mesmos controles, mais a velocidade da voz.
- **Tela cheia**: quando ligada, é pedida no toque de entrar (`requestFullscreen({ navigationUI: 'hide' })`). O aviso do Android não pode ser desativado por sites; o mergulho de entrada cobre o aviso. O iPhone não permite tela cheia em páginas: lá, só o app instalado (PWA) abre sem barras.
- **Tela acesa** (Wake Lock) vale sempre durante um laboratório.
- **Voz da Vega** (`lib/observatory/voice.ts`, Web Speech API): lê a legenda de cada cena, as perguntas com as opções e as respostas do chat. O botão com o orbe da Vega ao lado do rótulo da etapa liga a voz, repete ou para. Notação (δ, ≈, ², K, nm…) é convertida para fala. Futuro: trocar o motor por uma voz hospedada (ex.: ElevenLabs) sem mudar quem chama `speak`.
- **Dica da Vega**: se o aluno fica ~18 s parado numa cena com tarefa, aparece um balão (e a voz, se ligada) que orienta o olhar sem entregar a resposta.

## Palco contínuo

Laboratórios novos têm um único palco que atravessa todas as etapas e se transforma em vez de ser trocado (ex.: a esfera aquecida vira estrela, encolhe para o canto enquanto o espectro cresce, voa para o lugar de Betelgeuse em Órion). As etapas trocam só a coluna de texto. Ver `docs/LABORATORIOS.md`.

## Matemática

- As trilhas aparecem como um caminho vertical numerado; cada trilha tem sua cor, que vira o `accent` dos seus laboratórios. Os laboratórios prontos vêm primeiro; os "em breve" ficam esmaecidos, para o aluno ver o caminho inteiro.
- No palco: fundo de grade leve, eixos discretos, a curva principal em branco, o objeto da ideia (tangente, retângulos, vetor) na cor do laboratório, dados reais em azul-claro (`#7dd3fc`).
- Fórmulas em KaTeX herdam a cor do texto. Frações em opções de escolha usam `\displaystyle`; no Caderno, o estilo de texto, para caber.

## Layout do Observatório

- **Desktop:** trilho lateral fino à esquerda (Início, Céu, Laboratórios, Matemática), área principal ao centro e a Vega como painel deslizante à direita.
- **Celular:** barra inferior com as mesmas áreas; a Vega abre como folha inferior.
- A **URL acompanha o estado** (`/app`, `/app/ceu?q=M51`, `/app/laboratorios/exoplaneta`, `/app/matematica/derivada`) para links compartilháveis, sem recarregar a página.
