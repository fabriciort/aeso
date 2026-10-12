# Arquitetura

Um único projeto Next.js (App Router), sem serviços externos próprios. O deploy é direto na Vercel ou com `pnpm build && pnpm start`.

```
app/
  page.tsx                     Site (página pública). /?q=… redireciona para o Céu
  app/[[...path]]/page.tsx     Observatório: um único client component para todas as áreas
  api/search                   Busca: nome, catálogo, coordenadas, características (SIMBAD/Sesame/MAST + IA)
  api/observations             Observações do MAST num cone
  api/products                 Arquivos de uma observação
  api/lightcurve?lab=…         Curva de luz do TESS para um laboratório (FITS → JSON)
  api/gaia-hr                  Estrelas do Gaia para o laboratório do diagrama H-R
  api/vega                     Vega: chat em streaming, com contexto da tela
content/matematica/            O conteúdo da formação (docs/CONTEUDO.md)
  basica/uNN/                  As aulas de cada unidade e o index.ts da unidade
  geradores/                   Os exercícios ("Sua vez"), por tema
  erros.ts, erros-uNN.ts       O catálogo de erros comuns
  index.ts                     Toda aula e todo gerador entram aqui
components/
  aula/                        O player de aulas (docs/PLAYER.md): Player, Exercicios, Keypad, mexa.ts
    visual/                    Os modelos-âncora: Blocos, Reta, Quadro, Retangulo, Livre, Stage
  math/                        Mapa da formação, painel da unidade, KaTeX (Tex), canvas dos laboratórios
  site/                        Página pública
  observatory/                 Shell (Abertura, Boas-vindas, Nav, Vega) e áreas (views/, inclusive AulaView e MathView)
  labs/                        Runtime dos laboratórios, capas e etapas por laboratório
  instruments/                 Componentes interativos reutilizáveis dos laboratórios (Plot, TransitSimulator)
  aeso/                        Céu: barra de busca, SkyViewer (Aladin Lite), ficha, observações
lib/
  formation/                   O contrato do conteúdo (schema.ts) e o gerador de números (rng.ts)
  math/                        O currículo (curriculum.ts: módulos, unidades, aulas, pré-requisitos) e a matemática dos laboratórios
  astro/                       Física e dados, sem dependência de servidor: coordenadas, ADQL,
                               FITS, trânsito, curva de luz, interpretação de buscas
  labs/                        Catálogo e tipos de laboratório
  observatory/                 Roteador interno, contexto da Vega e voz
  server/                      Só no servidor: SIMBAD, MAST, TESS, IA (Groq/Claude), limites de uso
  progress.ts                  Progresso do aluno (localStorage); o da formação fica em math/formation-progress.ts
  motion.ts                    Tokens de animação
docs/                          Produto, design, formação, conteúdo, player, laboratórios, arquitetura
tests/                         Vitest: conteúdo, exercícios, Mexa, currículo, laboratórios
```

## Navegação sem recarregar

`/app/*` é uma rota única do Next. Dentro dela, `lib/observatory/router.tsx` mantém a rota em estado e sincroniza a URL com `history.pushState`. Trocar de área é uma troca de componente com animação (`viewTransition`); voltar e avançar do navegador funcionam, e links como `/app/matematica/aula/B.U6.A4` ou `/app/laboratorios/exoplaneta?etapa=meca` abrem direto no lugar certo.

## IA

`lib/server/ai.ts` é a única porta para modelos de linguagem.

| Variável | Efeito |
|---|---|
| `GROQ_API_KEY` | Usa o Groq (API compatível com OpenAI). Tem preferência |
| `AESO_AI_MODEL` | Modelo no Groq (padrão `qwen/qwen3.8-27b`) |
| `ANTHROPIC_API_KEY` | Usa o Claude quando não há chave do Groq |
| `AESO_CLAUDE_MODEL` | Modelo do Claude (padrão `claude-opus-5-5`) |

- Usos: interpretar buscas livres (`completeJson`, validado com zod) e a Vega (`streamChat`, em streaming).
- Blocos `<think>` de modelos de raciocínio são removidos antes de chegar ao aluno.
- Sem nenhuma chave, a busca usa só as regras e a Vega avisa que não está configurada.
- `lib/server/ratelimit.ts` limita a Vega a 20 mensagens a cada 10 minutos por IP (em memória, por instância).

## Dados

| Fonte | Para quê | Onde |
|---|---|---|
| Sesame (CDS) | Resolver nomes | `lib/server/simbad.ts` |
| SIMBAD TAP | Detalhes, buscas por características, objeto mais próximo | `lib/server/simbad.ts`, `lib/astro/adql.ts` |
| MAST API | Observações, produtos, curvas de luz do TESS | `lib/server/mast.ts`, `lib/server/tess.ts` |
| HiPS / hips2fits (CDS) | Imagens do céu (Aladin Lite) e miniaturas | no navegador |

As respostas das rotas têm `Cache-Control` com `s-maxage`, para que a CDN guarde resultados e poupe os serviços públicos.

## Modo offline

`AESO_MOCK=1` (ou `pnpm dev:mock`) responde com dados simulados em todas as rotas, inclusive uma curva de luz sintética do WASP-121 (marcada como "simulada") e respostas fictícias da Vega. Serve para trabalhar na interface sem rede.
