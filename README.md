# AESo

![next](https://img.shields.io/badge/next.js-15.5-blue?logo=next.js)
![code-license](https://img.shields.io/badge/code%20license-MIT-red)
![content-license](https://img.shields.io/badge/content%20license-CC%20BY--SA%204.0-red)

**AESo** é uma plataforma de ensino interativa, em português. O centro dela é a **Formação em Matemática**: um caminho do zero absoluto ao Cálculo, para adultos, em aulas curtas que se aprendem mexendo.

## A Formação em Matemática

- **Para quem:** o adulto que não aprendeu matemática na escola, ou esqueceu, e quem sabe um pouco e quer fechar lacunas.
- **Como:** cada aula é um story com um conceito só. O aluno junta blocos, corta retângulos, salta na reta, aposta antes de ver a resposta e resolve no caderno de papel. O texto é curto e acompanha o desenho.
- **Uma jornada:** a primeira aula mostra o caminho inteiro e onde a pessoa está. No fim de cada aula, ela vê o que já fez e qual é a próxima.
- **Até onde vai:** a Matemática Básica prepara para a prova do ENCCEJA Ensino Fundamental. Depois vêm Álgebra e Funções, Geometria e Trigonometria e Cálculo 1 a 4.

**Estado:** 29 aulas prontas, da U0 (Comece aqui) à U6 (Múltiplos, divisores e primos). A próxima unidade é Frações. Detalhes em [AGENTS.md](AGENTS.md).

No app, a formação fica em `/app/matematica`.

## O resto do app

O AESo nasceu como um observatório de astronomia, e essa parte continua no app:

- **Céu:** busca de objetos, céu interativo (Aladin Lite) e observações do MAST.
- **Laboratórios:** experiências guiadas com dados reais, como *Encontre um exoplaneta* (TESS), e oito laboratórios de matemática (equações, função quadrática, derivada, integral e outros) que depois vão fechar unidades da formação.
- **Vega:** a guia de IA, que dá pistas em vez de respostas.

## Documentação

| Documento | Para quê |
|---|---|
| [AGENTS.md](AGENTS.md) | **Comece aqui.** Estado atual e como criar uma unidade nova |
| [docs/CONTEUDO.md](docs/CONTEUDO.md) | Como escrever uma aula: pedagogia, tom, ritmo, notação, checklist |
| [docs/PLAYER.md](docs/PLAYER.md) | O player de aulas: cartões, modelos visuais e chaves de `estado` |
| [docs/MATEMATICA.md](docs/MATEMATICA.md) | O plano da formação: módulos, unidades, aulas, erros comuns |
| [docs/DESIGN.md](docs/DESIGN.md) | Princípios de design, identidade e movimento |
| [docs/PRODUTO.md](docs/PRODUTO.md) | Visão, público, voz e nomenclatura |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Estrutura do código, IA, fontes de dados |
| [docs/LABORATORIOS.md](docs/LABORATORIOS.md) | Como criar um laboratório (o formato dos laboratórios, não das aulas) |

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · framer-motion · KaTeX · Aladin Lite 3 · zod · Groq (ou Claude) · vitest

## Instalação

```bash
git clone https://github.com/fabriciort/aeso.git
cd aeso
pnpm install
cp .env.example .env.local   # opcional: GROQ_API_KEY ou ANTHROPIC_API_KEY para a Vega
pnpm dev                     # http://localhost:3000
```

```bash
pnpm dev:mock    # dados simulados, sem rede
pnpm test        # testes (conteúdo da formação, exercícios, currículo, laboratórios)
pnpm lint && pnpm typecheck
pnpm build && pnpm start
```

## Licença

O projeto usa duas licenças:

- **Código** ([MIT](LICENSE-MIT)): arquivos `.ts`, `.tsx`, `.js`, `.json`, configurações e scripts.
- **Conteúdo e documentação** ([CC BY-SA 4.0](LICENSE-CC-BY-SA)): documentação (`.md`), textos e descrições, imagens e mídias em `public/`, dados derivados e visualizações.

### Dados externos

Os dados e as imagens do MAST/STScI seguem as próprias licenças: [STScI Copyright](https://www.stsci.edu/copyright), [STScI Privacy Policy](https://www.stsci.edu/privacy), [MAST Data Usage](https://archive.stsci.edu/publishing/data-use).

O projeto usa o SIMBAD, o Sesame, o hips2fits e o Aladin Lite, operados pelo CDS (Strasbourg, França). Ao publicar resultados, cite o [SIMBAD](https://cds.unistra.fr/help/acknowledgement/) e o [Aladin](https://aladin.cds.unistra.fr/). O Aladin Lite é distribuído pelo CDS sob a licença LGPL-3.0 e é usado como dependência npm, sem modificações.
