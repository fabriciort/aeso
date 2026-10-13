# AGENTS.md

Guia para agentes de código que trabalham neste repositório. Leia inteiro antes de começar.

## O propósito

O AESo é, antes de tudo, a **Formação em Matemática**: uma formação interativa para o adulto que parte do zero absoluto e pode chegar ao Cálculo. Tudo em português do Brasil, no celular ou no computador.

- O aluno aprende **mexendo**: junta blocos, corta retângulos, salta na reta. O texto só acompanha.
- Cada aula é um **story** curto, com um conceito só.
- O **onboarding é o começo de uma jornada**: a pessoa precisa sentir, desde a primeira tela, que começou uma formação e que vai ser guiada aula por aula.

O app também tem o Céu e os laboratórios de astronomia (a origem do projeto). Eles continuam no código e funcionando, mas o trabalho em andamento é a formação.

## Estado atual (outubro de 2026)

| Unidade | Aulas | Situação |
|---|---|---|
| U0 Comece aqui | 2 | pronta |
| U1 O sistema de numeração | 5 | pronta |
| U2 Adição e subtração | 5 | pronta |
| U3 Multiplicação | 5 | pronta |
| U4 Divisão | 5 | pronta |
| U5 Expressões numéricas | 3 | pronta |
| U6 Múltiplos, divisores e primos | 4 | pronta |
| U7 Frações | 10 | pronta; trouxe o modelo `barra` |
| U8 Decimais | 6 | pronta; trouxe a `grade` 10 × 10, a vírgula no teclado e a conta com decimais |
| U9 Medidas | 6 | pronta; trouxe o quadro de unidades (`medida`) |
| U10 Razão e proporção | 6 | pronta; trouxe a tabela de proporção (`livre.tabela`) |
| U11 Porcentagem | 6 | pronta; a grade lê em % e em R$ (`leitura`) |
| U12 Números negativos | 5 | pronta; trouxe a tecla do menos, a reta com sinais e as fichas de saldo (`livre.saldo`) |
| U13 Potências e raízes | 6 | pronta |
| U14 Linguagem algébrica | 5 | pronta; trouxe os azulejos algébricos (`livre.azulejos`) e o retângulo com letras |
| U15 Equações do 1º grau | 6 | pronta; trouxe a balança (`balanca`) |
| **U16 Geometria plana** | 8 | **em andamento**; trouxe as figuras (`figura`): ângulos, transferidor, contorno, recorte, círculo e Pitágoras |
| U17 em diante | | planejadas em `docs/MATEMATICA.md`, seção 6 |

São 79 aulas no ar. A fonte de verdade do que existe é `content/matematica/index.ts`; atualize esta tabela quando uma unidade entrar na `main`.

## Leia antes de começar

1. `docs/CONTEUDO.md`: como escrever uma aula (pedagogia, tom, ritmo, notação, checklist). **Obrigatório.**
2. `docs/PLAYER.md`: o que o player já desenha e quais chaves de `estado` cada modelo entende.
3. `docs/MATEMATICA.md`: o plano da formação (unidades, aulas, modelos-âncora, erros comuns por unidade).
4. `lib/formation/schema.ts`: o contrato tipado de aula, cartão, gerador e erro comum.
5. `lib/math/curriculum.ts`: ids, títulos e pré-requisitos de todas as aulas.
6. Uma unidade pronta como modelo. A U8 mostra bem e mostra a organização atual (a unidade dividida em duas partes, para dois autores trabalharem ao mesmo tempo):
   - `content/matematica/basica/u08/` (as aulas, `parte-a.ts`, `parte-b.ts` e o `index.ts`);
   - `content/matematica/geradores/decimais-a.ts` e `decimais-b.ts` (os exercícios);
   - `content/matematica/erros-u08a.ts` e `erros-u08b.ts` (os erros comuns novos);
   - `tests/geradores-u08a.test.ts` e `tests/geradores-u08b.test.ts` (os testes dos exercícios).

## Como criar uma unidade nova

O mesmo agente escreve o conteúdo **e** estende o player quando a unidade pede um visual novo. Não há mais uma divisão entre "frente de conteúdo" e "frente de experiência".

1. **Planeje.** Leia a unidade em `docs/MATEMATICA.md` e em `lib/math/curriculum.ts`. Para cada aula, decida o momento-chave (o instante em que o aluno entende) e o que ele vai mexer.
2. **Veja se o player desenha o que você precisa** (`docs/PLAYER.md`). Se não desenha:
   - estenda o modelo em `components/aula/visual/` (ou crie um, como `barra` para Frações);
   - se for um Mexa novo, ensine o player a jogá-lo em `components/aula/mexa.ts`, para `tests/aula-mexa.test.ts` passar;
   - documente as chaves novas em `docs/PLAYER.md`.
3. **Escreva as aulas**, uma por arquivo: `content/matematica/basica/uNN/aNN-nome-curto.ts`, exportando `aula: Aula`. Junte-as em `content/matematica/basica/uNN/index.ts` (`AULAS_UNN`), na ordem do currículo.
4. **Escreva os erros comuns novos** em `content/matematica/erros-uNN.ts` (`ERROS_UNN`) e some-os ao catálogo em `content/matematica/erros.ts`. Reaproveite ids que já existem.
5. **Escreva os geradores** em `content/matematica/geradores/<tema>.ts` (`GERADORES_UN`), três níveis por aula, e os testes em `tests/geradores-uNN.test.ts`: cada teste lê o enunciado e refaz a conta por um cálculo independente.
6. **Registre tudo** em `content/matematica/index.ts` (aulas e geradores). Uma aula entra no mapa assim que está em `AULAS`.
7. **Valide:** `pnpm test`, `pnpm typecheck`, `pnpm lint` e `pnpm build`.
8. **Percorra cada aula no navegador**, cartão por cartão, em 390 × 844 e no desktop. Cada aula abre direto em `/app/matematica/aula/<id>` (ex.: `/app/matematica/aula/B.U6.A4`); use `pnpm dev` e o Playwright. Procure: texto cortado ou sobreposto, visual que não bate com a frase, Mexa sem saída, fórmula que encolhe demais. Corrija antes de entregar.
9. **Entregue** (veja abaixo).

Se o título ou a ideia de uma aula precisar mudar, ou se o conceito pedir uma aula a mais, ajuste `lib/math/curriculum.ts` e diga no PR. O título da aula tem de ser igual ao do currículo (os testes cobram).

## Onde mexer com cuidado

- **`lib/formation/schema.ts`** é o contrato. Mude só quando uma ideia não couber nele, de forma compatível com o conteúdo que já existe, e explique no PR.
- **Céu, laboratórios, Vega e APIs** (`components/aeso/`, `components/labs/`, `lib/astro/`, `lib/server/`, `app/api/`) não fazem parte do trabalho da formação. Não mexa sem um pedido.
- **Dependências novas:** só com motivo forte, dito no PR.

## Comandos

```bash
pnpm install
pnpm dev         # http://localhost:3000/app/matematica
pnpm test        # vitest; tests/conteudo.test.ts valida todo o conteúdo
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint
pnpm build
```

Antes de entregar, os quatro passam.

## Entrega

- **Uma unidade por branch e por PR**, aberto em rascunho.
- **Commits em português**, descritivos ("Unidade 6: Múltiplos, divisores e primos, quatro aulas novas").
- **No PR, escreva:**
  - as aulas entregues, com o momento-chave de cada uma;
  - os erros comuns novos;
  - os geradores e os seus níveis;
  - o que mudou no player (modelos, chaves de `estado`, Mexa novos);
  - capturas de tela das telas principais;
  - dúvidas e decisões que você tomou.
- **Depois do merge**, atualize a tabela "Estado atual" acima e a seção 10 de `docs/MATEMATICA.md`.

## Com o Fabricio (dono do projeto)

- Fale em português, com frases curtas e sem jargão.
- Na produção de aulas, siga de uma unidade para a próxima sem parar para perguntar se deve continuar. Pare só por uma decisão que muda o rumo da formação.
- Entregue coisas que ele possa abrir e testar: o link do PR e a prévia da Vercel.
