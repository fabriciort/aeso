# AESo: produto e nomenclatura

## Em uma frase

**AESo é o lugar onde estudantes aprendem física e astronomia fazendo ciência de verdade:** imaginam um cenário, testam uma hipótese e depois medem o fenômeno em dados reais de telescópios.

## Para quem

| Prioridade | Público | O que procura |
|---|---|---|
| 1 | Graduação em física e astronomia | Entender o que estuda, com dado real e sem montar ambiente de programação |
| 2 | Ensino médio olímpico (OBA, IOAA) e cursinhos | Prática guiada, desafios, portfólio |
| 3 | Professores | Atividades prontas para aplicar em turma |
| 4 | Curiosos e entusiastas | Explorar o céu e entender o que estão vendo |

## Princípios de experiência

1. **Um só lugar.** O Observatório é um ambiente contínuo: nada recarrega e tudo transita. O aluno nunca "sai" para outra página.
2. **Primeiro imaginar, depois medir.** Todo conceito começa num cenário que a pessoa controla e termina num dado real.
3. **Errar é parte.** Previsões erradas são respondidas com explicação, nunca com punição.
4. **Números com significado.** Todo número vem com unidade e com uma comparação humana ("1,8 vezes Júpiter").
5. **A IA guia, não resolve.** A Vega faz perguntas e dá pistas, sem entregar a resposta.
6. **Calma e precisão.** Movimento suave, poucos elementos por vez e nenhum ruído visual.

## Nomenclatura

Use estes termos **exatamente assim** na interface, no código e na comunicação.

| Termo | O que é | No código |
|---|---|---|
| **AESo** | A marca e o produto | — |
| **Site** | Páginas públicas (`/`): apresentação, laboratórios, para professores | `app/page.tsx`, `components/site/` |
| **Observatório** | O web app (`/app`), o ambiente onde tudo acontece | `components/observatory/` |
| **Abertura** | A sequência de carregamento animada ao entrar no Observatório | `Boot.tsx` |
| **Boas-vindas** | O primeiro contato (só na primeira visita), com a escolha do caminho | `Welcome.tsx` |
| **Início** | A área inicial do Observatório: continuar de onde parou, próximos passos | `views/HomeView.tsx` |
| **Céu** | A área de exploração: busca, céu interativo, ficha do objeto, observações do MAST | `views/SkyView.tsx` |
| **Laboratórios** | A área com o catálogo de laboratórios | `views/LabsView.tsx` |
| **Matemática** | A área com as trilhas de matemática, da básica ao Cálculo 4 | `views/MathView.tsx`, `lib/labs/math.ts` |
| **Trilha** | Uma sequência de laboratórios de matemática (ex.: Cálculo 1) | `Track` |
| **Caderno** (no Resolva) | A resolução que se escreve sozinha, uma linha por passo certo | palco de cada lab de matemática |
| **Laboratório** | Uma experiência guiada sobre um fenômeno. Ex.: "Encontre um exoplaneta" | `lib/labs/*.ts` |
| **Etapa** | Uma unidade de um laboratório (ver tipos abaixo), sempre numa tela só | `LabStep` |
| **Cena** | Um momento dentro de uma etapa: legenda + estado do palco. Continuar avança as cenas | `useScenes` |
| **Palco** | A área do instrumento, sempre visível na etapa | `StepFrame` (`stage`) |
| **Palco contínuo** | Um palco único que se transforma de etapa em etapa | `LabModule.Stage` |
| **Ajustes** | Tela cheia e Voz da Vega, opcionais e desligados por padrão | `lib/preferences.ts`, `Settings.tsx` |
| **Voz da Vega** | Narração das cenas e respostas em voz alta | `lib/observatory/voice.ts` |
| **Dica** | Balão da Vega quando o aluno fica parado numa tarefa | `StepFrame` (`nudge`) |
| **Instrumento** | Um componente interativo reutilizável dentro das etapas | `components/instruments/` |
| **Vega** | A guia de IA que acompanha o aluno | `components/observatory/Vega.tsx`, `/api/vega` |
| **Conquista** | O marco registrado ao concluir um laboratório | `lib/progress.ts` |

Termos futuros (já reservados): **Biblioteca** (artigos vivos), **Turma** (área do professor).

### Tipos de etapa

| Tipo | Nome na interface | Papel |
|---|---|---|
| `cenario` | Imagine | Uma situação hipotética e controlável que constrói intuição |
| `previsao` | Preveja | O aluno escolhe o que acha que vai acontecer, antes de ver |
| `conceito` | Entenda | A ideia por trás, com a equação interativa |
| `observacao` | Observe | O mesmo fenômeno em dados reais |
| `medicao` | Meça | O aluno ajusta um modelo ao dado e extrai um número |
| `desafio` | E se…? | Problemas hipotéticos para aplicar o que aprendeu |
| `conclusao` | Conclua | Resumo, conquista e próximos caminhos |

Em Matemática, a etapa `medicao` se chama **Resolva** (o aluno resolve um problema passo a passo, escolhendo a próxima operação) e a `observacao` pode se chamar **No mundo real**. Use `label` no `LabStep`.

## Voz e tom

- Fale com **você**, em frases curtas, no presente.
- Explique o jargão na primeira vez que ele aparece ("curva de luz: o brilho da estrela ao longo do tempo").
- Use números com vírgula decimal e unidade: "1,55 %", "1,8 R♃".
- Nada de exagero: evite "revolucionário" ou "incrível"; mostre em vez de adjetivar.
- Títulos curtos e com verbo: "Encontre um exoplaneta", "Meça o planeta".

## Modelo de negócio (hipótese a validar)

- **Grátis:** Céu completo e o primeiro laboratório.
- **Estudante:** todos os laboratórios, Vega sem limite apertado, Caderno e Biblioteca.
- **Turma e Instituição:** painel do professor e licenças por aluno.

A cobrança fica fora do MVP. Primeiro é preciso medir se os alunos terminam o primeiro laboratório e pedem o próximo.
