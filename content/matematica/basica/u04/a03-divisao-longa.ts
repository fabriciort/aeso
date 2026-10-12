import type { Aula, Visual } from '@/lib/formation/schema'

// A divisão longa é repartir dinheiro em notas de 100, de 10 e de 1. Começa
// pelas notas grandes; o que não dá para repartir é trocado por notas
// menores e desce para a casa seguinte. Quando uma casa não dá nem 1 para
// cada, o quociente ganha um 0: é o caso de 612 ÷ 6 = 102, que muita gente
// escreve como 12.

type Divisao = { dividendo: number; divisor: number; quociente?: string; linhas?: [string, number][]; destaque?: number }
const chave = (d: Divisao, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { divisao: d }, esboco })
const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })
const NOTAS = { centenas: 'notas de 100', dezenas: 'notas de 10', unidades: 'notas de 1' }
const D612 = { dividendo: 612, divisor: 6 }
const L612: [string, number][] = [['−6', 0], ['01', 1], ['−0', 1], ['12', 2], ['−12', 2], ['0', 2]]
const D738 = { dividendo: 738, divisor: 3 }

export const aula: Aula = {
  id: 'B.U4.A3',
  titulo: 'Divisão longa',
  objetivo: 'Dividir um número de até 3 algarismos por um de 1 algarismo na chave, casa por casa, trocando o que sobra pela casa seguinte e escrevendo 0 no quociente quando uma casa não dá para dividir.',
  modelo: 'quadro-posicional',
  esboco: 'Um prêmio de R$ 612 para 6 pessoas, em notas. As placas, barras e cubos da unidade 1 viram notas de 100, 10 e 1. O aluno reparte as notas de 100 (1 para cada), descobre que 1 nota de 10 não dá para 6 e a troca por 10 notas de 1. Depois tudo isso vira a chave no papel. Momento-chave: perceber que "ninguém recebeu nota de 10" se escreve como um 0 no quociente, e que sem ele o 102 vira 12.',
  vega: 'Ideia central: dividir casa por casa, começando pela maior. O que sobra numa casa vira 10 da casa seguinte (como o desagrupamento da subtração). Se uma casa não dá nem 1 para cada, escreve-se 0 no quociente e segue. Nomes: dividendo (o total), divisor (em quantas partes, ou o tamanho do grupo), quociente (o resultado). Erros esperados: esquecer o 0 do quociente (612 ÷ 6 = 12), trocar 1 centena por 1 dezena em vez de 10, deixar um resto maior que o divisor numa casa, e começar pelas unidades, como na soma. Guie perguntando "Quantas notas de 100 cada um recebe?", "Dá para repartir essa nota de 10 entre 6?", "Então quantas notas de 10 cada um recebe? Onde isso aparece na conta?". Confira com a multiplicação: 6 × 102 = 612. Em Sua vez, não diga o quociente: peça a próxima casa.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um prêmio de **R$ 612** vai ser dividido igualmente entre **6** pessoas. Quanto cada uma recebe?',
      fala: 'Um prêmio de seiscentos e doze reais vai ser dividido igualmente entre seis pessoas. Quanto cada uma recebe?',
      visual: blocos({ centenas: 6, dezenas: 1, unidades: 2, rotulos: NOTAS, total: 612 }, 'As 6 placas, a barra e os 2 cubos, com a legenda de notas embaixo de cada grupo. Proposta: as peças com cara de cédula.'),
      esboco: 'Dinheiro em notas é o jeito mais natural de pensar nas casas. A pergunta fica aberta até o fecho.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Por onde começar a repartir as notas?',
      visual: blocos({ centenas: 6, dezenas: 1, unidades: 2, rotulos: NOTAS }, 'As notas no centro; seis lugares em volta, um por pessoa.'),
      opcoes: [
        {
          texto: 'Pelas notas de 100', certa: true,
          explica: 'Isso. As 6 notas de 100 dão **1** para cada. O que sobrar de uma casa é trocado e desce.',
          mostra: blocos({ centenas: 0, dezenas: 1, unidades: 2, rotulos: NOTAS }, 'As 6 placas saem, uma para cada lugar; ficam a barra e os 2 cubos.'),
        },
        {
          texto: 'Pelas notas de 1, como na soma',
          explica: 'Na divisão, o que sobra das notas grandes vira notas menores. Por isso começa pelas de 100.',
          mostra: blocos({ centenas: 0, dezenas: 1, unidades: 2, rotulos: NOTAS }, 'As placas saem primeiro, uma para cada lugar.'),
        },
      ],
      esboco: 'Ao contrário da soma e da subtração, a divisão anda da esquerda para a direita. A razão é concreta: o que sobra desce.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Sobrou **1** nota de 10 para **6** pessoas. Quantas notas de 10 cada uma recebe?',
      fala: 'Sobrou uma nota de dez para seis pessoas. Quantas notas de dez cada uma recebe?',
      visual: blocos({ centenas: 0, dezenas: 1, unidades: 2, rotulos: NOTAS, destaque: 'dezenas' }, 'A barra sozinha acende, diante dos 6 lugares.'),
      opcoes: [
        {
          texto: 'Nenhuma: 0', certa: true,
          explica: 'Isso. 1 nota não dá para 6. Cada um recebe **0** notas de 10, e esse 0 vai para a conta.',
        },
        {
          texto: '1',
          explica: 'Com 1 nota, só uma pessoa ganharia. Em partes iguais, cada uma recebe **0** notas de 10.',
        },
      ],
      esboco: 'O zero do quociente nasce aqui, como uma frase do dia a dia: ninguém recebeu nota de 10.',
    },
    {
      tipo: 'mexa',
      texto: 'Para repartir o que sobrou, troque a nota de 10 por **10** notas de 1.',
      fala: 'Para repartir o que sobrou, troque a nota de dez por dez notas de um.',
      visual: blocos({ centenas: 0, dezenas: 1, unidades: 2, rotulos: NOTAS, desagrupar: true }, 'A barra com a borda tracejada: é ela que se abre.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na nota de 10.',
        sucesso: { dezenas: 0, unidades: 12 },
        mostre: 'A barra se abre em 10 cubos, que se juntam aos 2: ficam 12 notas de 1.',
      },
      descoberta: 'A nota de 10 que não dava para repartir vira 10 notas de 1. Com as 2, são 12, e 12 dá para repartir entre 6.',
      esboco: 'O mesmo gesto do empresta da subtração: abrir uma peça em 10 da casa de baixo.',
    },
    {
      tipo: 'ideia',
      texto: 'As **12** notas de 1 dão **2** para cada. Cada pessoa recebe 1 de 100, **0** de 10 e 2 de 1: **R$ 102**.',
      fala: 'As doze notas de um dão duas para cada. Cada pessoa recebe uma de cem, zero de dez e duas de um: cento e dois reais.',
      visual: blocos({ centenas: 1, dezenas: 0, unidades: 2, rotulos: NOTAS, total: 102 }, 'A parte de uma pessoa: 1 placa, nenhuma barra e 2 cubos. O lugar vazio das barras fica tracejado.'),
      esboco: 'O lugar vazio das notas de 10 é o zero, como na aula do zero que guarda lugar.',
    },
    {
      tipo: 'ideia',
      texto: 'No papel, é a **chave**: 612 é o **dividendo**, 6 é o **divisor** e 102 é o **quociente**.',
      fala: 'No papel, é a chave: seiscentos e doze é o dividendo, seis é o divisor e cento e dois é o quociente.',
      visual: chave({ ...D612, quociente: '102', linhas: L612 }, 'As notas se recolhem e a chave se escreve: cada algarismo do 102 aparece junto da casa que ele repartiu. Os três nomes aparecem por um instante ao lado de cada número.'),
      esboco: 'A conta no papel como registro do que as notas fizeram. Proposta: ao tocar numa linha da chave, as notas correspondentes piscam.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém fez $612 \\div 6$ e achou **12**. O que deu errado?',
      fala: 'Alguém fez seiscentos e doze dividido por seis e achou doze. O que deu errado?',
      visual: chave({ ...D612, quociente: '12' }, 'A chave com 12 no quociente, numa letra um pouco tremida.'),
      opcoes: [
        {
          texto: 'Pulou as dezenas sem escrever o 0', certa: true,
          explica: 'Isso. Sem o 0, o 1 das centenas escorrega para as dezenas. Cada pessoa recebeu R$ 102, não R$ 12.',
          mostra: chave({ ...D612, quociente: '102', linhas: L612, destaque: 1 }, 'A casa das dezenas do 612 acende e o 0 aparece no quociente, empurrando o 1 de volta para as centenas.'),
        },
        {
          texto: 'Nada: $6 \\times 12$ dá 612', fala: 'Nada: seis vezes doze dá seiscentos e doze', erro: 'esquece-zero-no-quociente',
          explica: '$6 \\times 12 = 72$, longe de 612. Cada pessoa ganhou uma nota de 100: o quociente passa de 100.',
          mostra: chave({ ...D612, quociente: '102', linhas: L612, destaque: 1 }, 'O 12 é riscado e o 102 se escreve no lugar, com o 0 em âmbar.'),
        },
      ],
      esboco: 'O erro mais comum da divisão longa, desmontado pelas notas e pela multiplicação.',
    },
    {
      tipo: 'passo',
      problema: 'Na chave: $738 \\div 3$.',
      fala: 'Na chave: setecentos e trinta e oito dividido por três.',
      visual: chave(D738, 'A chave armada: 738 à esquerda, 3 na caixa, o quociente vazio. A casa das centenas acende.'),
      passos: [
        {
          pergunta: 'Centenas: $7 \\div 3$. Quanto para cada, e quanto sobra?',
          fala: 'Centenas: sete dividido por três. Quanto para cada, e quanto sobra?',
          opcoes: [
            {
              texto: '2, sobra 1', certa: true, explica: 'Isso. $3 \\times 2 = 6$, e das 7 centenas sobra 1.',
              mostra: chave({ ...D738, quociente: '2', linhas: [['−6', 0], ['1', 0]] }, 'O 2 se escreve no quociente; embaixo do 7, o −6 e o resto 1.'),
            },
            { texto: '3, sobra 0', explica: '$3 \\times 3 = 9$: passa de 7. Cabem 2 para cada, e sobra 1.' },
          ],
          linha: { tex: '7 \\div 3 = 2 \\text{, resto } 1', fala: 'sete dividido por três é dois, resto um' },
        },
        {
          pergunta: 'A centena que sobrou vira dezenas. Com as 3 dezenas do 738, ficam quantas?',
          fala: 'A centena que sobrou vira dezenas. Com as três dezenas do setecentos e trinta e oito, ficam quantas?',
          opcoes: [
            {
              texto: '13', certa: true, explica: 'Isso. 1 centena são 10 dezenas; com as 3, são 13.',
              mostra: chave({ ...D738, quociente: '2', linhas: [['−6', 0], ['13', 1]] }, 'O 3 desce e encosta no 1: 13.'),
            },
            { texto: '4', erro: 'troca-incompleta', explica: '1 centena vale 10 dezenas, não 1. Com as 3, são **13**.' },
          ],
          linha: { tex: '10 + 3 = 13 \\text{ dezenas}', fala: 'dez mais três, treze dezenas' },
        },
        {
          pergunta: '$13 \\div 3$?',
          fala: 'Treze dividido por três?',
          opcoes: [
            {
              texto: '4, sobra 1', certa: true, explica: 'Isso. $3 \\times 4 = 12$, e sobra 1 dezena.',
              mostra: chave({ ...D738, quociente: '24', linhas: [['−6', 0], ['13', 1], ['−12', 1], ['1', 1]] }, 'O 4 entra no quociente; embaixo, −12 e o resto 1.'),
            },
            { texto: '3, sobra 4', erro: 'resto-maior-que-divisor', explica: 'Sobrando 4, ainda dá mais 1 para cada. São 4, e sobra 1.' },
          ],
          linha: { tex: '13 \\div 3 = 4 \\text{, resto } 1', fala: 'treze dividido por três é quatro, resto um' },
        },
        {
          pergunta: 'A dezena que sobrou vira 10 unidades. Com as 8, são 18. $18 \\div 3$?',
          fala: 'A dezena que sobrou vira dez unidades. Com as oito, são dezoito. Dezoito dividido por três?',
          opcoes: [
            {
              texto: '6', certa: true, explica: 'Isso. $3 \\times 6 = 18$, resto 0. O quociente é **246**.',
              mostra: chave({ ...D738, quociente: '246', linhas: [['−6', 0], ['13', 1], ['−12', 1], ['18', 2], ['−18', 2], ['0', 2]] }, 'O 6 fecha o quociente: 246. O resto 0 embaixo.'),
            },
            { texto: '3', erro: 'troca-incompleta', explica: 'Isso seria $9 \\div 3$, com a dezena valendo 1. Ela vale 10: são 18, e $18 \\div 3 = 6$.' },
          ],
          linha: { tex: '738 \\div 3 = 246', fala: 'setecentos e trinta e oito dividido por três é duzentos e quarenta e seis' },
        },
      ],
      esboco: 'Uma casa por passo, com as trocas. Os erros das opções são a troca que vale 1 em vez de 10 e o resto grande demais.',
    },
    {
      tipo: 'anote',
      titulo: 'Divisão longa (na chave)',
      definicao: 'Divida casa por casa, da maior para a menor. O que sobra numa casa vira 10 da casa seguinte.',
      exemplo: { tex: '612 \\div 6 = 102', fala: 'seiscentos e doze dividido por seis é cento e dois' },
      alerta: 'Se uma casa não dá para dividir, escreva **0** no quociente e siga.',
      esboco: 'A página com a chave do 612 ÷ 6 completa e o 0 do quociente circulado.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Na chave, no papel: $824 \\div 4$.',
      fala: 'Na chave, no papel: oitocentos e vinte e quatro dividido por quatro.',
      resposta: 206,
      resolucao: [
        { tex: '8 \\div 4 = 2', fala: 'oito dividido por quatro é dois' },
        { tex: '2 \\div 4 \\text{ não dá: } 0 \\text{, resto } 2', fala: 'dois dividido por quatro não dá: zero, resto dois' },
        { tex: '24 \\div 4 = 6', fala: 'vinte e quatro dividido por quatro é seis' },
        { tex: '824 \\div 4 = 206', fala: 'oitocentos e vinte e quatro dividido por quatro é duzentos e seis' },
      ],
      esboco: 'De novo um 0 no quociente, agora sozinho no papel. A resolução mostra o 2 que não dá e desce junto com o 4.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['divisao-longa-n1', 'divisao-longa-n2', 'divisao-longa-n3'],
      esboco: 'Nível 1: cada casa divide sem sobra (84 ÷ 4), com a chave na tela. Nível 2: o zero no quociente, no meio ou no fim (612 ÷ 6, 840 ÷ 4). Nível 3: situações com números até 999, sem apoio.',
    },
    {
      tipo: 'fecho',
      texto: 'Cada pessoa recebe **R$ 102**. Mas como ter certeza de que a conta está certa? Na próxima aula: a **prova real**.',
      fala: 'Cada pessoa recebe cento e dois reais. Mas como ter certeza de que a conta está certa? Na próxima aula: a prova real.',
      visual: chave({ ...D612, quociente: '102', linhas: L612 }, 'A chave do gancho, completa, com o 0 do quociente em âmbar.'),
      esboco: 'Responder ao gancho e plantar a dúvida que a prova real resolve.',
    },
  ],
}
