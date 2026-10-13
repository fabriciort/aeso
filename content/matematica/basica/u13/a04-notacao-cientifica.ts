import type { Aula, Visual } from '@/lib/formation/schema'

// Notação científica. Números enormes e minúsculos se escrevem com um
// número de 1 a 10 vezes uma potência de 10. A base é o que a parte A
// ensinou: 10³ = 1.000 e 10⁻¹ = 0,1. Multiplicar por 10 anda a vírgula uma
// casa para a direita; o expoente diz quantas casas. No quadro, cada casa é
// uma potência de 10, e o expoente é a casa do primeiro algarismo. Os erros
// a desmontar: contar os zeros no lugar das casas (150.000.000 = 1,5 × 10⁷),
// trocar o sinal do expoente (0,00007 = 7 × 10⁵) e deixar o primeiro número
// fora de 1 a 10 (15 × 10⁷).

/** As casas do quadro, de 10⁸ até 1 (números grandes) e de 1 até 10⁻⁵ (pequenos). */
const GRANDE = ['× 10⁸', '× 10⁷', '× 10⁶', '× 10⁵', '× 10⁴', '× 10³', '× 10²', '× 10¹', '× 1']
const PEQUENO = ['× 1', '× 10⁻¹', '× 10⁻²', '× 10⁻³', '× 10⁻⁴', '× 10⁻⁵']

const quadro = (medida: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { medida }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const SOL = quadro(
  { casas: GRANDE, numero: '150.000.000', de: '× 1' },
  'O quadro com 9 casas, de "× 10⁸" até "× 1". Os algarismos de 150.000.000 em linha: o 1 na casa do 10⁸, o 5 na do 10⁷ e os zeros até a casa do 1. Embaixo, "150.000.000 × 1".',
)
const SOL_PRONTO = quadro(
  { casas: GRANDE, numero: '150.000.000', de: '× 1', para: '× 10⁸' },
  'A vírgula âmbar pula para depois da casa do 10⁸, logo depois do 1. Embaixo, "150.000.000 × 1 = 1,5 × 10⁸".',
)
const SOL_15 = quadro(
  { casas: GRANDE, numero: '150.000.000', de: '× 1', para: '× 10⁷' },
  'A vírgula para depois do 5, na casa do 10⁷. Embaixo, "15 × 10⁷": a conta vale, mas o 15 passou de 10.',
)
const CABELO = quadro(
  { casas: PEQUENO, numero: '0,00007', de: '× 1' },
  'O quadro com 6 casas, de "× 1" até "× 10⁻⁵". O 0 na casa do 1, a vírgula âmbar depois dela, quatro zeros e o 7 na casa do 10⁻⁵. Embaixo, "0,00007 × 1".',
)
const CABELO_PRONTO = quadro(
  { casas: PEQUENO, numero: '0,00007', de: '× 1', para: '× 10⁻⁵' },
  'A vírgula anda 5 casas para a direita, até depois do 7, na casa do 10⁻⁵. Os zeros da frente apagam. Embaixo, "0,00007 × 1 = 7 × 10⁻⁵".',
)
const MILHOES = (para?: string) => quadro(
  { casas: GRANDE.slice(2), numero: '3.200.000', de: '× 1', ...(para ? { para } : {}) },
  para
    ? `A vírgula pula para depois da casa "${para}". Embaixo, a leitura com a potência dessa casa.`
    : 'O quadro de "× 10⁶" até "× 1", com 3.200.000: o 3 na casa do 10⁶, o 2 na do 10⁵ e cinco zeros.',
)

const TABELA = (mostradas: number, completar: boolean) => ({
  modelo: 'livre' as const,
  estado: {
    tabela: {
      linhas: [
        { rotulo: 'potência', valores: ['10¹', '10²', '10³', '10⁴'] },
        { rotulo: '1,5 × potência', valores: ['15', '150', '1.500', '15.000'] },
      ],
      setas: [
        { de: 0, para: 1, rotulo: '× 10' },
        { de: 1, para: 2, rotulo: '× 10' },
        { de: 2, para: 3, rotulo: '× 10' },
        { de: 0, para: 1, rotulo: '1 casa', embaixo: true },
        { de: 1, para: 2, rotulo: '1 casa', embaixo: true },
        { de: 2, para: 3, rotulo: '1 casa', embaixo: true },
      ],
      mostradas,
      ...(completar ? { completar: true } : {}),
    },
  },
  esboco: 'A tabela de duas linhas: as potências 10¹, 10², 10³, 10⁴ em cima e 1,5 vezes cada uma embaixo. Começa só com 10¹ e 15. Cada toque preenche uma coluna: 150, 1.500, 15.000, com "× 10" em cima e "1 casa" embaixo.',
})

export const aula: Aula = {
  id: 'B.U13.A4',
  titulo: 'Notação científica',
  objetivo: 'Escrever números muito grandes e muito pequenos em notação científica e de volta com todos os algarismos, contando as casas que a vírgula anda.',
  modelo: 'quadro-posicional',
  esboco: 'Abre com dois números difíceis de ler: a distância da Terra ao Sol (150.000.000 km) e a espessura de um fio de cabelo (0,00007 m). Na tabela, 1,5 × 10, × 10², × 10³: a cada potência, a vírgula anda uma casa. Momento-chave: no quadro de potências, o aluno põe a vírgula logo depois do 1 de 150.000.000 e lê "1,5 × 10⁸": o expoente é a casa do primeiro algarismo, e o primeiro número fica entre 1 e 10. Depois, o fio de cabelo: a vírgula anda para a direita e o expoente é negativo, 7 × 10⁻⁵. Fecha com os dois números escritos curtos.',
  vega: 'Ideia central: um número em notação científica é a × 10ⁿ, com a maior ou igual a 1 e menor que 10, e n inteiro. Multiplicar por 10 anda a vírgula uma casa para a direita; o expoente n diz quantas casas. Número grande (10 ou mais): n positivo, 150.000.000 = 1,5 × 10⁸. Número entre 0 e 1: n negativo, 0,00007 = 7 × 10⁻⁵ (a parte A mostrou que 10⁻¹ = 0,1 e 10⁻⁵ = 0,00001). Dica prática: n é a casa do primeiro algarismo que não é zero. Erros esperados: contar os zeros e não as casas (1,5 × 10⁷, ou 7 × 10⁻⁴); trocar o sinal (7 × 10⁵); parar a vírgula no lugar errado (15 × 10⁷, que vale o mesmo, mas não é notação científica); pôr zeros depois da vírgula (1,5 × 10 = 1,50). Guie com "Para que lado a vírgula anda?", "O número é maior ou menor que 1?", "Em que casa está o primeiro algarismo?", "O primeiro número ficou entre 1 e 10?". Dados: a distância média da Terra ao Sol é de cerca de 150 milhões de km (1 unidade astronômica = 149.597.870,7 km, União Astronômica Internacional, 2012). Um fio de cabelo humano tem de 0,02 mm a 0,18 mm de espessura; 0,07 mm (0,00007 m) é um valor típico.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'O Sol fica a uns **150.000.000 km** da Terra. Um fio de cabelo tem uns **0,00007 m** de espessura. Dá para escrever sem contar zeros?',
      fala: 'O Sol fica a uns cento e cinquenta milhões de quilômetros da Terra. Um fio de cabelo tem uns sete centésimos de milésimo de metro de espessura. Dá para escrever sem contar zeros?',
      visual: expr(['0,00007 m', '150.000.000 km'], 'Os dois números, um embaixo do outro: o fio de cabelo apagado em cima e a distância ao Sol grande embaixo. Muitos zeros para contar.'),
      esboco: 'Dois números de verdade, um enorme e um minúsculo. A pergunta: como escrevê-los curtos. Voltam no fecho.',
    },
    {
      tipo: 'mexa',
      texto: 'Você já viu que ${10^3 = 10 \\times 10 \\times 10 = 1.000}$. Agora multiplique ${1{,}5}$ por ${10}$, por ${10^2}$, por ${10^3}$…',
      fala: 'Você já viu que dez ao cubo é dez vezes dez vezes dez, mil. Agora multiplique um vírgula cinco por dez, por dez ao quadrado, por dez ao cubo.',
      visual: TABELA(1, true),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para fazer a próxima conta.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem: 15, 150, 1.500, 15.000, com "× 10" em cima e "1 casa" embaixo.',
      },
      descoberta: 'Cada × 10 anda a vírgula uma casa para a direita: 1,5 → 15 → 150 → 1.500. O expoente diz quantas casas ela andou.',
      esboco: 'A tabela da unidade 10, agora com potências. O "1 casa" embaixo de cada seta é a pista da próxima aposta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Então quanto é ${1{,}5 \\times 10^8}$?',
      fala: 'Então quanto é um vírgula cinco vezes dez à oitava?',
      visual: TABELA(4, false),
      opcoes: [
        {
          texto: '1.500.000.000', erro: 'expoente-conta-os-zeros',
          explica: 'Aí são 15 e mais 8 zeros: a vírgula andou 9 casas. O 5 já ocupa uma das 8.',
          fala: 'Aí são quinze e mais oito zeros: a vírgula andou nove casas. O cinco já ocupa uma das oito.',
          mostra: SOL,
        },
        {
          texto: '150.000.000', certa: true,
          explica: 'Isso. A vírgula anda 8 casas: o 5 ocupa uma, e mais 7 zeros. É a distância até o Sol.',
          fala: 'Isso. A vírgula anda oito casas: o cinco ocupa uma, e mais sete zeros. É a distância até o Sol.',
          mostra: SOL,
        },
        {
          texto: '1,500000000', erro: 'acrescenta-zeros-no-decimal',
          explica: 'Zeros depois da vírgula não mudam nada: isso ainda é 1,5. Quem anda é a vírgula, 8 casas.',
          fala: 'Zeros depois da vírgula não mudam nada: isso ainda é um vírgula cinco. Quem anda é a vírgula, oito casas.',
          mostra: SOL,
        },
      ],
      esboco: 'Da tabela para um expoente grande, sem fazer as 8 contas. Todas as opções mostram 150.000.000 no quadro de potências, com o 1 na casa do 10⁸.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora o caminho de volta. Em **150.000.000**, ponha a vírgula para o primeiro número ficar **entre 1 e 10**.',
      fala: 'Agora o caminho de volta. Em cento e cinquenta milhões, ponha a vírgula para o primeiro número ficar entre um e dez.',
      visual: SOL,
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na casa depois da qual a vírgula deve ficar.',
        sucesso: { para: '× 10⁸' },
        mostre: 'A vírgula pula para depois do 1, na casa do 10⁸, e a leitura vira "150.000.000 × 1 = 1,5 × 10⁸".',
      },
      descoberta: 'Com a vírgula logo depois do 1, o número é 1,5, e a casa do 1 é a do 10⁸: 150.000.000 = 1,5 × 10⁸. O expoente é a casa do primeiro algarismo.',
      esboco: 'O momento-chave. Cada casa do quadro já diz a sua potência, e a leitura embaixo mostra o número curto. Um toque no 10⁷ mostra "15 × 10⁷": vale o mesmo, mas passa de 10.',
    },
    {
      tipo: 'anote',
      titulo: 'Notação científica',
      definicao: 'Um número em **notação científica** é um número de 1 até menos de 10, vezes uma potência de 10.',
      exemplo: { tex: '150.000.000 = 1{,}5 \\times 10^8', fala: 'cento e cinquenta milhões é um vírgula cinco vezes dez à oitava' },
      alerta: 'O expoente conta as casas que a vírgula anda, não os zeros: 150.000.000 tem 7 zeros, mas é ${10^8}$.',
      esboco: 'Na página: o quadro de potências com 150.000.000 e a vírgula depois do 1; embaixo, "1 ≤ número < 10".',
    },
    {
      tipo: 'aposta',
      pergunta: 'Os três valem 150.000.000. Qual está em notação científica?',
      fala: 'Os três valem cento e cinquenta milhões. Qual está em notação científica?',
      visual: SOL,
      opcoes: [
        {
          texto: '$15 \\times 10^7$', erro: 'notacao-fora-de-1-a-10',
          explica: 'A conta vale, mas o 15 passou de 10. A vírgula vai mais uma casa para a esquerda: ${1{,}5 \\times 10^8}$.',
          fala: 'A conta vale, mas o quinze passou de dez. A vírgula vai mais uma casa para a esquerda: um vírgula cinco vezes dez à oitava.',
          mostra: SOL_15,
        },
        {
          texto: '$1{,}5 \\times 10^8$', certa: true,
          explica: 'Isso. O 1,5 fica entre 1 e 10. Assim, o expoente sozinho já diz o tamanho do número.',
          fala: 'Isso. O um vírgula cinco fica entre um e dez. Assim, o expoente sozinho já diz o tamanho do número.',
          mostra: SOL_PRONTO,
        },
        {
          texto: '$0{,}15 \\times 10^9$', erro: 'notacao-fora-de-1-a-10',
          explica: 'Também vale, mas 0,15 é menor que 1. A vírgula fica logo depois do 1: ${1{,}5 \\times 10^8}$.',
          fala: 'Também vale, mas zero vírgula quinze é menor que um. A vírgula fica logo depois do um: um vírgula cinco vezes dez à oitava.',
          mostra: SOL_PRONTO,
        },
      ],
      esboco: 'O alerta do anote virado pergunta. O 15 × 10⁷ aparece no quadro com a vírgula depois do 5, na casa do 10⁷.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora o fio de cabelo, ${0{,}00007}$ m. Até o 7, a vírgula anda 5 casas para a direita. Qual é a potência?',
      fala: 'Agora o fio de cabelo, zero vírgula zero zero zero zero sete metro. Até o sete, a vírgula anda cinco casas para a direita. Qual é a potência?',
      visual: CABELO,
      opcoes: [
        {
          texto: '$10^5$', erro: 'expoente-com-sinal-trocado',
          explica: '${7 \\times 10^5 = 700.000}$: maior que o fio, muito maior. Número menor que 1 tem expoente negativo.',
          fala: 'Sete vezes dez à quinta é setecentos mil: maior que o fio, muito maior. Número menor que um tem expoente negativo.',
          mostra: CABELO_PRONTO,
        },
        {
          texto: '$10^{-4}$', erro: 'expoente-conta-os-zeros',
          explica: 'São 4 zeros depois da vírgula, mas a vírgula anda 5 casas: o 7 ocupa a última. ${10^{-5}}$.',
          fala: 'São quatro zeros depois da vírgula, mas a vírgula anda cinco casas: o sete ocupa a última. Dez à menos cinco.',
          mostra: CABELO_PRONTO,
        },
        {
          texto: '$10^{-5}$', certa: true,
          explica: 'Isso. Como você viu, ${10^{-1} = 0{,}1}$. O fio é menor que 1: ${7 \\times 10^{-5}}$, 7 dividido por 10 cinco vezes.',
          fala: 'Isso. Como você viu, dez à menos um é zero vírgula um. O fio é menor que um: sete vezes dez à menos cinco, sete dividido por dez cinco vezes.',
          mostra: CABELO_PRONTO,
        },
      ],
      esboco: 'O expoente negativo da parte A, agora útil. A vírgula anda 5 casas no quadro, até depois do 7, e a leitura mostra "7 × 10⁻⁵".',
    },
    {
      tipo: 'passo',
      problema: 'Uma cidade tem **3.200.000** habitantes. Escreva em notação científica.',
      fala: 'Uma cidade tem três milhões e duzentos mil habitantes. Escreva em notação científica.',
      visual: MILHOES(),
      passos: [
        {
          pergunta: 'Primeiro, a vírgula. Qual é o primeiro número?',
          opcoes: [
            { texto: '$32$', erro: 'notacao-fora-de-1-a-10', explica: '32 passou de 10. A vírgula vai uma casa mais para a esquerda, logo depois do 3.', mostra: MILHOES('× 10⁵') },
            { texto: '$3{,}2$', certa: true, explica: 'Isso. A vírgula fica logo depois do 3: 3,2 está entre 1 e 10.', mostra: expr(['3.200.000', '3,2 × ?'], 'O número em cima, apagado, e embaixo "3,2 × ?": falta a potência.') },
            { texto: '$0{,}32$', erro: 'notacao-fora-de-1-a-10', explica: '0,32 é menor que 1. A vírgula fica logo depois do primeiro algarismo, o 3.', mostra: expr(['3.200.000', '3,2 × ?'], 'O número em cima, apagado, e embaixo "3,2 × ?": a vírgula logo depois do 3.') },
          ],
          linha: { tex: '3.200.000 = 3{,}2 \\times \\ ?', fala: 'três milhões e duzentos mil é três vírgula dois vezes alguma potência' },
        },
        {
          pergunta: 'Da vírgula, depois do 3, até o fim do número, quantas casas? Qual é a potência?',
          fala: 'Da vírgula, depois do três, até o fim do número, quantas casas? Qual é a potência?',
          opcoes: [
            { texto: '$10^5$', erro: 'expoente-conta-os-zeros', explica: 'São 5 zeros, mas a vírgula anda 6 casas: o 2 também ocupa uma. ${10^6}$.', fala: 'São cinco zeros, mas a vírgula anda seis casas: o dois também ocupa uma. Dez à sexta.', mostra: MILHOES('× 10⁶') },
            { texto: '$10^6$', certa: true, explica: 'Isso. Da vírgula depois do 3 até o fim, são 6 casas: ${3{,}2 \\times 10^6}$.', fala: 'Isso. Da vírgula depois do três até o fim, são seis casas: três vírgula dois vezes dez à sexta.', mostra: MILHOES('× 10⁶') },
            { texto: '$10^7$', erro: 'expoente-conta-os-zeros', explica: '3.200.000 tem 7 algarismos, mas o 3 fica antes da vírgula. Ela anda 6 casas: ${10^6}$.', fala: 'Três milhões e duzentos mil tem sete algarismos, mas o três fica antes da vírgula. Ela anda seis casas: dez à sexta.', mostra: MILHOES('× 10⁶') },
          ],
          linha: { tex: '3.200.000 = 3{,}2 \\times 10^6', fala: 'três milhões e duzentos mil é três vírgula dois vezes dez à sexta' },
        },
      ],
      esboco: 'O caminho de ida, guiado: primeiro a vírgula, depois a casa do primeiro algarismo. O quadro de 10⁶ até 1 mostra a vírgula pulando.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: escreva ${4{,}06 \\times 10^4}$ sem a potência de 10. Ande a vírgula uma casa de cada vez.',
      fala: 'No papel: escreva quatro vírgula zero seis vezes dez à quarta sem a potência de dez. Ande a vírgula uma casa de cada vez.',
      resposta: 40600,
      resolucao: [
        { tex: '4{,}06 \\to 40{,}6 \\to 406 \\to 4.060 \\to 40.600', fala: 'quatro vírgula zero seis, quarenta vírgula seis, quatrocentos e seis, quatro mil e sessenta, quarenta mil e seiscentos' },
        { tex: '4{,}06 \\times 10^4 = 40.600', fala: 'quatro vírgula zero seis vezes dez à quarta é quarenta mil e seiscentos' },
      ],
      esboco: 'O caminho de volta, com um zero no meio que tem de ficar. Quem pôr 4 zeros depois do 406 chega a 4.060.000 e vê o erro na resolução.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['notacao-cientifica-n1', 'notacao-cientifica-n2', 'notacao-cientifica-n3'],
      esboco: 'Nível 1: o expoente de um número redondo, como 5.000.000, com o quadro de potências. Nível 2: o expoente de 150.000.000 e de 0,00007, e qual forma está em notação científica. Nível 3: de volta sem a potência, números grandes e pequenos, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'O Sol fica a ${1{,}5 \\times 10^8}$ km; o fio tem ${7 \\times 10^{-5}}$ m. O expoente diz as casas. Na próxima aula: a raiz quadrada.',
      fala: 'O Sol fica a um vírgula cinco vezes dez à oitava quilômetros; o fio tem sete vezes dez à menos cinco metro. O expoente diz as casas. Na próxima aula: a raiz quadrada.',
      visual: expr(['0,00007 m = 7 × 10⁻⁵ m', '150.000.000 km', '1,5 × 10⁸ km'], 'Os dois números do gancho com a forma curta: o fio numa linha só, apagado; a distância ao Sol embaixo, e a forma curta dela grande.'),
      esboco: 'Responde ao gancho e anuncia a raiz quadrada.',
    },
  ],
}
