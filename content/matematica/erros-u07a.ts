import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 7, aulas 1 a 5 (somados ao catálogo em erros.ts).
// Reaproveitados de outras unidades: divide-o-menor-pelo-maior, mdc-nao-e-o-maior,
// confunde-mmc-mdc.
export const ERROS_U07A: ErroComum[] = [
  {
    id: 'partes-desiguais',
    nome: 'chama de fração um pedaço de partes desiguais',
    causa: 'Conta os pedaços e esquece que eles têm de ser do mesmo tamanho: "1 de 4 pedaços" vira "um quarto", seja qual for o pedaço.',
    exemplo: 'Um chocolate partido em 4 pedaços tortos: diz que o menor pedaço é 1/4 da barra.',
    desmonte: 'Pôr a barra de 4 partes iguais embaixo da barra torta: o quarto de verdade é maior que o pedaço pequeno e menor que o grande. Se as partes não são iguais, "quarto" não diz o tamanho.',
  },
  {
    id: 'pintadas-sobre-nao-pintadas',
    nome: 'compara as partes pintadas com as não pintadas',
    causa: 'Põe embaixo as partes que sobraram, em vez de todas as partes do inteiro: lê a fração como "pintadas contra não pintadas".',
    exemplo: '3 partes pintadas e 1 sem pintar viram 3/1, em vez de 3/4.',
    desmonte: 'O número de baixo diz em quantas partes o inteiro foi cortado. Contar todas, pintadas e não pintadas: são 4. E 3/1 seriam 3 barras inteiras, muito mais do que está pintado.',
  },
  {
    id: 'troca-numerador-denominador',
    nome: 'troca o número de cima com o de baixo',
    causa: 'Não guarda qual número diz o tamanho do pedaço e qual diz quantos se pegou; escreve o maior embaixo, ou o primeiro que leu em cima.',
    exemplo: '3 de 4 partes pintadas viram 4/3.',
    desmonte: 'Embaixo fica o corte: 4 partes iguais, cada uma é 1/4. Em cima, quantas você pegou: 3. 4/3 seriam 4 pedaços de um terço, mais que uma barra inteira.',
  },
  {
    id: 'fracao-so-menor-que-um',
    nome: 'acha que fração é sempre menor que 1',
    causa: 'Só viu fração como pedaço de uma coisa só, e acha que não dá para pegar mais partes do que o inteiro tem.',
    exemplo: 'Diz que 5/4 não existe, ou põe 5/4 entre 0 e 1 na reta.',
    desmonte: 'Duas barras de 4 partes: 4 quartos fecham a primeira, e o quinto quarto já está na segunda. Na reta, 5/4 fica um quarto depois do 1. A receita de 5/4 de xícara pede mais que uma xícara.',
  },
  {
    id: 'reta-conta-tracos',
    nome: 'conta os traços da reta em vez dos espaços',
    causa: 'Para saber em quantas partes o trecho de 0 a 1 foi cortado, conta os traços, incluindo o do 0 e o do 1, e acha uma parte a mais.',
    exemplo: 'De 0 a 1 há 5 traços (0, 1 e três no meio): diz que cada parte é 1/5, mas são 4 espaços, quartos.',
    desmonte: 'Pintar cada espaço da reta como um pedaço de barra: são 4 pedaços. Os traços são as bordas dos pedaços, e sempre há uma borda a mais que pedaços.',
  },
  {
    id: 'menor-por-maior-da-zero',
    nome: 'acha que dividir um número menor por um maior dá zero',
    causa: 'Na divisão de inteiros, 3 ÷ 4 dá 0 e sobra 3. O aluno para aí e acha que ninguém recebe nada.',
    exemplo: '3 chocolates para 4 pessoas: "não dá, cada um fica com zero".',
    desmonte: 'Cortar cada chocolate em 4 e dar um pedaço de cada chocolate para cada pessoa: cada uma fica com 3 quartos. Nada sobra e ninguém fica sem: 3 ÷ 4 = 3/4.',
  },
  {
    id: 'equivalente-somando',
    nome: 'soma (ou subtrai) o mesmo número em cima e embaixo',
    causa: 'Sabe que "o que se faz em cima se faz embaixo", mas usa a soma no lugar da multiplicação ou da divisão.',
    exemplo: '1/2 = 2/3 (somou 1 nos dois), ou 6/8 = 4/6 (tirou 2 dos dois).',
    desmonte: 'As barras de 1/2 e 2/3, uma embaixo da outra, com a linha da metade: 2/3 passa da linha. Cortar cada parte em 2 dobra os dois números (2/4), e o pintado não muda.',
  },
  {
    id: 'muda-so-um-termo',
    nome: 'multiplica ou divide só um dos números da fração',
    causa: 'Muda o número de baixo (ou o de cima) e esquece o outro, achando que basta um para trocar o tamanho do pedaço.',
    exemplo: '3/4 = 3/12, ou 6/8 simplificado como 3/8.',
    desmonte: 'Cortar cada quarto em 3 faz 12 pedaços, e os 3 pintados viram 9 pedaços: 9/12. Com 3/12 a barra de baixo fica com muito menos pintado que a de cima.',
  },
  {
    id: 'simplificacao-incompleta',
    nome: 'para de simplificar antes do fim',
    causa: 'Divide os dois termos uma vez, quase sempre por 2, e acha que acabou, sem testar se ainda há um divisor comum.',
    exemplo: '12/18 vira 6/9, e para aí. Mas 6 e 9 ainda se dividem por 3: 2/3.',
    desmonte: 'Perguntar: os dois números ainda têm um divisor comum além do 1? Ou dividir de uma vez pelo MDC: mdc(12, 18) = 6, e 12/18 = 2/3.',
  },
]
