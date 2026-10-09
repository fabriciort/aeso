# AGENTS.md

Instruções para agentes de código (Codex) que trabalham neste repositório.

## O projeto

AESo é uma plataforma educacional (Next.js 15, React 19, TypeScript, Tailwind, framer-motion), toda em português do Brasil. Este trabalho é a **Formação em Matemática**: uma formação completa, do zero absoluto ao Cálculo, para adultos. Comece pela Matemática Básica.

## O seu papel: o conteúdo

O trabalho está dividido em duas frentes:

| Frente | Quem | O quê |
|---|---|---|
| **Conteúdo** | **você** | O que ensinar e como explicar, aula por aula: cartões, textos, perguntas, opções, erros comuns, exercícios (geradores), dicas, e **esboços** de como apresentaria cada visual e cada animação |
| Experiência | outro agente | Player de aulas, desenho, movimento, interação, UX |

Você escreve o conteúdo no formato do contrato `lib/formation/schema.ts`. A outra frente transforma seus esboços em telas e animações. Seus esboços são bem-vindos e importantes: diga como você apresentaria cada conceito.

## Leia antes de começar

1. `docs/CONTEUDO.md`: as diretrizes de conteúdo (missão, pedagogia, tom, notação, formato, checklist). **Obrigatório.**
2. `docs/MATEMATICA.md`: o plano da formação (módulos, unidades, aulas, modelos-âncora, erros comuns por unidade).
3. `docs/DESIGN.md`: princípios 1 (pouco texto) e 2 (aprender mexendo).
4. `lib/formation/schema.ts`: o contrato (tipos comentados).
5. `lib/math/curriculum.ts`: os ids e títulos de todas as aulas, com pré-requisitos.
6. O exemplo de formato:
   - `content/matematica/basica/u01/a02-zero-guarda-lugar.ts`;
   - `content/matematica/geradores/valor-posicional.ts`;
   - `tests/geradores-u01.test.ts`.

## Onde você escreve

- `content/matematica/**`: aulas, geradores, erros comuns, índice.
- `tests/geradores-*.test.ts`: testes dos seus geradores.
- `lib/math/curriculum.ts`: **só** para ajustar títulos ou ideias de aulas da unidade em que você está trabalhando, ou para acrescentar uma aula que o conceito exige. Explique a mudança no PR.

## Onde você NÃO escreve

- `components/`, `app/`, `lib/` (exceto o caso acima), `docs/DESIGN.md`, estilos, dependências. Se precisar de algo da experiência, descreva no esboço ou no PR.
- Não mude `lib/formation/schema.ts`. Se o contrato não comportar uma ideia sua, proponha a mudança no PR.

## Comandos

```bash
pnpm install
pnpm test        # vitest: inclui tests/conteudo.test.ts, que valida todo o conteúdo
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
```

Antes de entregar: os três passam.

## Entrega

- **Uma unidade por branch e por PR** (ex.: `conteudo/basica-u01`). Comece pelo piloto: U0 e U1.
- **No PR, escreva:**
  - as aulas entregues, com o momento-chave de cada uma;
  - os erros comuns novos;
  - os geradores e os seus níveis;
  - as propostas de visual novo, se houver;
  - dúvidas e decisões que você tomou.
- **Commits** em português, descritivos.
