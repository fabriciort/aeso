# Design e movimento

## Princípio número 1: pouco texto

Nosso aluno tem pouco tempo e pouco foco, como quase todo mundo hoje. Por isso, **o desenho explica e o texto só acompanha.**

- **O que se mostra não se escreve.** Se o mapa, a animação ou o gesto já dizem, não há legenda repetindo.
- **Uma frase curta por vez**, em letra grande:
  - ≥ 17 px para o que se lê;
  - ≥ 14 px para rótulos;
  - nunca parágrafos cinza miúdos.
- **Sem instruções do tipo "toque aqui para…"** quando o próprio elemento convida ao toque (brilho, movimento).
- **Explicação longa vira sequência:** mais cartões, cada um com pouco texto, e nunca uma tela cheia de palavras.
- **Antes de publicar uma tela, corte tudo o que puder sair** sem o aluno perder nada. O que sobra é o necessário.

## Princípio número 2: aprender mexendo

- **O aluno aprende interagindo**, não lendo. Toda ideia tem algo para tocar, arrastar ou prever.
- **Toda ação tem resposta visual imediata** (em até 100 ms): o desenho muda junto com o dedo, o erro aparece no próprio desenho, o acerto acende.
- **O feedback ensina:** não é só "certo/errado", é ver *por que*. A balança tomba, o pedaço não encaixa, a reta não passa pelo ponto.
- **Cada aula é planejada cartão a cartão**, com um momento-chave claro (`docs/CONTEUDO.md`).

## Identidade

A identidade nasceu de uma revisão das telas (outubro de 2026) que achou os vícios de interface genérica: caixa alta espaçada, bolinhas coloridas, arco-íris pastel, halos pulsando, etiquetas empilhadas e nenhuma ação óbvia. A resposta:

- **Preto, branco e uma luz:** a interface é monocromática e a única cor de destaque é o âmbar "luz de estrela" (`#f6b74e`), que marca só o próximo passo.
- **Cor só com significado:** concluído é branco sólido; próximo é âmbar; o resto é contorno discreto.
- **Sem os vícios genéricos:** nada de caixa alta espaçada, bolinhas decorativas, arco-íris pastel, halos pulsando ou etiquetas empilhadas.
- **Papel quadriculado:** a textura nossa, discreta, nas telas da formação.
- **Sempre uma ação óbvia:** toda tela de entrada mostra o próximo passo, grande, no topo.

## Fundamentos

- **Tema:** escuro ("céu noturno"), fundo `#030407`, superfícies de vidro fosco (`.glass`, `.glass-strong`).
- **Tipografia:** Geist Sans em tudo, inclusive nos números da formação. Geist Mono só para coordenadas e identificadores do Céu. Títulos com `tracking` negativo (−0,02 a −0,045 em), em letra normal (nunca caixa alta).
- **Cor:** quase toda a interface é neutra; o destaque é o âmbar (`#f6b74e`). No Céu, cada missão do MAST tem uma cor fixa (`lib/missions.ts`), e os dados reais aparecem em azul-claro.
- **Raios:** 22–28 px para cartões e painéis; `rounded-full` para botões e chips.
- **Rótulos** usam `.eyebrow` (14 px, letra normal, branco a 50 %).

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

## Laboratórios: uma tela, sem rolagem

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

- **A aula:** um story sem rolagem; palco no meio, uma frase grande, um botão só embaixo. Os detalhes de cada cartão e de cada visual estão em `docs/PLAYER.md`.
- **O palco se transforma:** quando dois cartões seguidos usam o mesmo modelo, as peças se movem até o novo estado em vez de trocar de tela.
- **O mapa da formação** é uma árvore de pré-requisitos, monocromática sobre o papel quadriculado:
  - as unidades são quadrados arredondados com o número e o nome embaixo;
  - concluída é branca sólida; a recomendada agora é âmbar; o resto é contorno discreto;
  - as ligações são curvas finas; as longas correm em faixas próprias e nunca atravessam outra unidade;
  - ao tocar numa unidade, a cadeia de pré-requisitos acende, o que ela abre aparece pontilhado e o resto esmaece;
  - nada é bloqueado: o mapa recomenda, nunca proíbe.
- **Nos laboratórios de matemática:** fundo de grade leve, eixos discretos, a curva principal em branco, o objeto da ideia (tangente, retângulos, vetor) em destaque, dados reais em azul-claro (`#7dd3fc`).
- Fórmulas em KaTeX herdam a cor do texto e encolhem até caber, nunca rolam para o lado.

## Pendências de identidade

| Item | Proposta |
|---|---|
| Vega (orbe de gradiente com ✨) | Um sinal próprio e simples, sem gradiente nem brilhinho. Decisão de marca: precisa do Fabricio |
| Boas-vindas do Observatório | Hoje oferece o laboratório do exoplaneta e o Céu. Deveria levar à formação, como começo da jornada |
| Início com muitas portas | Um "Próximo passo" único no topo, como na Matemática, e o resto abaixo |
| Capas e cartões dos laboratórios | Cor própria por laboratório, chips de conceito e metadados: avaliar ao revisar a área Laboratórios |
| `Part.color` em `lib/math/curriculum.ts` | Não aparece mais na interface; apagar se continuar sem uso |

## Layout do Observatório

- **Desktop:** trilho lateral fino à esquerda (Início, Céu, Laboratórios, Matemática), área principal ao centro e a Vega como painel deslizante à direita.
- **Celular:** barra inferior com as mesmas áreas; a Vega abre como folha inferior.
- A **URL acompanha o estado** (`/app`, `/app/ceu?q=M51`, `/app/laboratorios/exoplaneta`, `/app/matematica/derivada`) para links compartilháveis, sem recarregar a página.
