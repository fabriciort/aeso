# AESo

![release](https://img.shields.io/badge/release-v0.2.0-green)
![next](https://img.shields.io/badge/next.js-15.5-blue?logo=next.js)
![code-license](https://img.shields.io/badge/code%20license-MIT-red)
![content-license](https://img.shields.io/badge/content%20license-CC%20BY--SA%204.0-red)

![M31 MMSB Demo](public/assets/m31_mmsb.gif)

## Visão Geral

AESo é um explorador do céu: uma única barra de busca encontra objetos astronômicos por **nome, catálogo, coordenadas ou características**, mostra o objeto num **céu interativo** (Aladin Lite, embutido no projeto) e lista as **observações e arquivos do MAST** para download.

### O que a barra entende

| Você digita | O que acontece |
|---|---|
| `M51`, `NGC 1300`, `HD 209458`, `Betelgeuse` | Resolve o nome (Sesame → SIMBAD/NED/VizieR, com o MAST como alternativa) e abre o objeto |
| `Pilares da Criação`, `Galáxia de Andrômeda` | Nomes populares em português/inglês são traduzidos para o catálogo |
| `202.47 +47.19`, `13h29m52s +47d11m43s` | Vai direto para as coordenadas |
| `galáxias espirais mais brilhantes que 10` | Busca por características no SIMBAD (ADQL) e mostra uma grade de resultados |
| `nebulosas planetárias perto de M27 num raio de 2 graus` | Busca por proximidade |
| `quasares com z > 6`, `estrelas tipo M`, `aglomerados globulares do catálogo messier` | Filtros por redshift, tipo espectral e catálogo |

Com `ANTHROPIC_API_KEY` configurada, perguntas livres que as regras não entendem são interpretadas pelo Claude. Ele devolve um nome de objeto ou filtros estruturados; nunca SQL livre.

### Ao abrir um objeto

- **Céu interativo** (Aladin Lite v3): arrastar, dar zoom, tela cheia, trocar entre óptico (DSS2, Pan-STARRS), infravermelho (2MASS, WISE) e ultravioleta (GALEX). Os campos observados pelo MAST são desenhados por cima, com uma cor por missão.
- **Ficha do objeto**: tipo, coordenadas (clique para copiar), distância (em pc/Mpc e anos-luz), magnitudes, tamanho aparente, redshift, morfologia, outros nomes e links para SIMBAD, NED e MAST Portal.
- **Observações MAST** (JWST, HST, GALEX, TESS, Swift…): filtros por missão e tipo, prévias, lista de arquivos por observação, download direto, “baixar selecionados” e geração de script `curl`.

## Arquitetura

Tudo roda dentro deste projeto Next.js, sem serviços extras. Deploy direto na Vercel ou com `pnpm build && pnpm start`.

```
app/
  page.tsx                 → <Explorer />
  api/search/route.ts      → interpreta a busca e resolve objetos/listas
  api/observations/route.ts→ observações MAST num cone (Mast.Caom.Filtered.Position)
  api/products/route.ts    → arquivos de uma observação (Mast.Caom.Products)
components/aeso/           → Explorer, SearchBar, SkyViewer (Aladin), ObjectDetails,
                             Observations, ResultsList, SkyThumb, Starfield
lib/astro/                 → coordenadas, interpretador de buscas, ADQL, tipos SIMBAD (isomórfico)
lib/server/                → clientes SIMBAD TAP, Sesame, MAST, Claude (opcional), fixtures
tests/                     → testes do interpretador e do gerador de ADQL (vitest)
```

As chamadas ao MAST/SIMBAD passam pelas rotas `/api/*` do próprio Next.js. Isso evita problemas de CORS, centraliza o cache (`s-maxage`) e mantém chaves no servidor. O Aladin Lite vem do npm e é carregado só no cliente (WebGL2); as imagens do céu (HiPS) e as miniaturas (`hips2fits`) vêm do CDS.

## Stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · framer-motion · Aladin Lite 3 · Geist · lucide · zod · Anthropic SDK (opcional) · vitest

## Instalação

```bash
git clone https://github.com/fabriciort/aeso.git
cd aeso
pnpm install
cp .env.example .env.local   # opcional: ANTHROPIC_API_KEY
pnpm dev                     # http://localhost:3000
```

Outros comandos:

```bash
pnpm dev:mock    # dados simulados, sem acessar MAST/SIMBAD (UI offline)
pnpm test        # testes unitários
pnpm lint && pnpm typecheck
pnpm build && pnpm start
```

## Roadmap

- [x] Busca por nome, catálogo, coordenadas e características
- [x] Céu interativo embutido com campos observados
- [x] Observações e downloads reais do MAST
- [ ] Visualização de FITS e espectros no navegador
- [ ] Coleções / favoritos e autenticação (dados proprietários do MAST)
- [ ] Outros arquivos (ESA, NOIRLab, Gaia)

## Licença e Atribuições

O projeto utiliza um modelo de **licenciamento dual**:

### Código Fonte ([MIT License](LICENSE-MIT))
O código fonte, que podem incluir componentes, configurações e scripts está sob a licença MIT:
- Arquivos `.ts`, `.tsx`, `.js`, `.py`, `.ipynb`, `.json`, etc.****
- Configurações (`.config.js`, etc.)
- Scripts de build e desenvolvimento

### Conteúdo e Documentação ([CC BY-SA 4.0](LICENSE-CC-BY-SA))
O conteúdo, documentação e assets está sob Creative Commons BY-SA 4.0:
- Documentação (`.md`, etc.)
- Imagens e mídia
- Textos e descrições
- Dados derivados e visualizações

### Dados Externos
Os dados, imagens equaisquer conteúdos do MAST/STScI estão sujeitos às suas próprias licenças:
- [STScI Copyright](https://www.stsci.edu/copyright)
- [STScI Privacy Policy](https://www.stsci.edu/privacy)
- [MAST Data Usage](https://archive.stsci.edu/publishing/data-use)

Este projeto usa o SIMBAD, o Sesame, o hips2fits e o Aladin Lite, operados pelo CDS (Strasbourg, França). Ao publicar resultados, cite o [SIMBAD](https://cds.unistra.fr/help/acknowledgement/) e o [Aladin](https://aladin.cds.unistra.fr/). O Aladin Lite é distribuído pelo CDS sob licença LGPL-3.0 e é usado como dependência npm, sem modificações.

### Estrutura de Licenciamento

```
aeso/
├── LICENSE-MIT       
├── LICENSE-CC-BY-SA  
├── app/              # MIT License
│   ├── components/   # MIT License
│   ├── lib/         # MIT License
│   └── ...
├── public/          # CC BY-SA 4.0
│   └── assets/      # CC BY-SA 4.0 (exceto conteúdo MAST)
└── README.md        # MIT License
```

- Flexibilidade para reutilização do código (MIT)
- Proteção e atribuição adequada do conteúdo (CC BY-SA 4.0)
- Conformidade com licenças de dados externos
- Clareza sobre o que pode ser usado e como

## Status

🚧 Contribuições são bem-vindas!

---

Desenvolvimento movido a paixão 💚 e curiosidade pelo cosmos
