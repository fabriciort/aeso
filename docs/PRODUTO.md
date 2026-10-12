# AESo: produto e nomenclatura

## Em uma frase

**O AESo forma pessoas em matemática a partir do zero:** aulas curtas e interativas em que o aluno aprende mexendo, numa formação que começa em contar de 10 em 10 e pode chegar ao Cálculo.

## Para quem

| Prioridade | Público | O que procura |
|---|---|---|
| 1 | Adultos que não aprenderam matemática na escola, ou esqueceram | Entender de verdade, sem medo, no ritmo deles, pelo celular |
| 2 | Quem sabe um pouco e tem lacunas | Achar o que falta e pular o que já sabe ("Já sei isso") |
| 3 | Quem vai fazer o ENCCEJA, o ENEM ou precisa da matemática no trabalho | Um caminho claro até um marco concreto |
| 4 | Curiosos por ciência | O Céu e os laboratórios de astronomia, que continuam no app |

## Princípios de experiência

1. **Uma jornada, não um catálogo.** Desde a primeira tela, a pessoa sabe que começou uma formação, vê onde está no caminho e qual é o próximo passo.
2. **Aprender mexendo.** Toda ideia começa em algo que o aluno manipula. A regra aparece depois, como resumo do que ele já viu.
3. **Pouco texto.** O desenho explica; uma frase curta acompanha.
4. **Errar é parte.** O erro é respondido com o porquê, mostrado no desenho, nunca com punição.
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
| **Matemática** | A área da Formação em Matemática, com o mapa da formação | `views/MathView.tsx` |
| **Formação** | O percurso completo de matemática, do zero ao Cálculo (`docs/MATEMATICA.md`) | `lib/math/curriculum.ts` |
| **Módulo** | Uma grande etapa da formação (ex.: Matemática Básica, Cálculo 1) | `Module` |
| **Unidade** | Um tema dentro do módulo (ex.: Frações), com pré-requisitos | `Unit` |
| **Aula** | Um conceito, em formato de story (`docs/CONTEUDO.md`) | `Lesson` no currículo; `Aula` no conteúdo (`content/matematica/`) |
| **Cartão** | Um momento da aula: gancho, mexa, aposta, ideia, anote, passo, caderno, sua vez, fecho | `Cartao` (`lib/formation/schema.ts`) |
| **Player** | A tela que mostra uma aula, cartão por cartão | `components/aula/` |
| **Modelo-âncora** | Um visual que volta ao longo da formação: blocos, reta, retângulo, barra… | `Visual.modelo`; `components/aula/visual/` |
| **Gerador** | Produz exercícios sem fim para o "Sua vez", em três níveis | `content/matematica/geradores/` |
| **Erro comum** | Uma resposta errada típica, com a causa e o desmonte | `content/matematica/erros*.ts` |
| **Mapa da formação** | A árvore de pré-requisitos de módulos e unidades | `components/math/FormationMap.tsx` |
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

A cobrança fica fora do MVP. Primeiro é preciso medir se as pessoas terminam as primeiras unidades da formação e voltam para a próxima aula.
