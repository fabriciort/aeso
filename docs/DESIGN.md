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

## Layout do Observatório

- **Desktop:** trilho lateral fino à esquerda (Início, Céu, Laboratórios), área principal ao centro e a Vega como painel deslizante à direita.
- **Celular:** barra inferior com as mesmas áreas; a Vega abre como folha inferior.
- A **URL acompanha o estado** (`/app`, `/app/ceu?q=M51`, `/app/laboratorios/exoplaneta`) para links compartilháveis, sem recarregar a página.
