import type { Aula, Visual } from '@/lib/formation/schema'

// Do método da área ao algoritmo. 23 × 14 é um retângulo partido nos dois
// lados: 200 + 30 + 80 + 12. A faixa do 4 (80 + 12 = 92) e a faixa do 10
// (200 + 30 = 230) são exatamente as duas linhas da conta armada. O zero de
// deslocamento não é truque: é o "vezes 10" da aula 3.

type Conta = { parcelas: number[]; sinal: '×'; parciais?: string[]; resultado?: string; reservas?: Record<string, string>; destaque?: string }
const conta = (c: Omit<Conta, 'sinal'>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { conta: { ...c, sinal: '×' } }, esboco })
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const A23x14 = { base: [20, 3], altura: [10, 4] }
const C = { parcelas: [23, 14] }

export const aula: Aula = {
  id: 'B.U3.A5',
  titulo: 'Multiplicação armada',
  objetivo: 'Multiplicar números de dois algarismos (23 × 14) pelo método da área e pela conta armada, com o vai um e o zero de deslocamento, e explicar cada linha da conta pelo retângulo.',
  modelo: 'retangulo',
  esboco: 'O retângulo de 23 por 14 se parte nos dois lados: 20 + 3 em cima, 10 + 4 do lado. Quatro pedaços: 200, 30, 80 e 12. Depois as duas faixas horizontais deslizam para fora do retângulo e viram as duas linhas da conta armada: a faixa do 4 vira 92, a faixa do 10 vira 230. Momento-chave: a faixa do 10 pousar na segunda linha e o 0 aparecer na casa das unidades, mostrando que ele é o "vezes 10".',
  vega: 'Ideia central: a conta armada é o retângulo partido, escrito de forma curta. 23 × 14 = 4 × 23 + 10 × 23 = 92 + 230 = 322. Pelo método da área: 200 + 30 + 80 + 12 = 322. Na conta armada, multiplica-se o número de cima por cada algarismo de baixo, uma linha para cada; a linha das dezenas começa com 0, porque o 1 do 14 vale 10. Erros esperados: esquecer o zero de deslocamento (23 × 14 → 92 + 23 = 115), multiplicar só dezena com dezena e unidade com unidade (→ 200 + 12 = 212), esquecer o vai um (4 × 23 → 82) e somar o vai um antes de multiplicar (6 × 27 → 362). Guie perguntando "Quanto vale esse 1 do 14?", "Quantos pedaços tem o retângulo?". Para conferir, estime: 23 × 14 fica perto de 20 × 15 = 300. Em Sua vez, não diga o resultado: peça a primeira linha.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um auditório tem **14 fileiras** de **23 cadeiras**. Quantas cadeiras? Os dois números já passam da tabuada.',
      fala: 'Um auditório tem catorze fileiras de vinte e três cadeiras. Quantas cadeiras? Os dois números já passam da tabuada.',
      visual: ret({ base: [23], altura: [14] }, 'Um retângulo de 23 de base por 14 de altura, inteiro, com um "?" dentro.'),
      esboco: 'Na aula anterior, só um lado era grande. Agora os dois são.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quebrando os dois lados, em quantos pedaços o retângulo se parte?',
      visual: ret({ ...A23x14 }, 'O retângulo partido: 20 e 3 na base, 10 e 4 na altura. Os pedaços ainda vazios.'),
      opcoes: [
        {
          texto: '4', certa: true,
          explica: 'Isso. Cada parte da base encontra cada parte da altura: $10 \\times 20$, $10 \\times 3$, $4 \\times 20$ e $4 \\times 3$.',
          mostra: ret({ ...A23x14, areas: [['?', '?'], ['?', '?']] }, 'Os quatro pedaços acendem um a um, cada um com "?".'),
        },
        {
          texto: '2', erro: 'multiplica-so-casas-iguais',
          explica: 'Com só $20 \\times 10$ e $3 \\times 4$, sobram dois pedaços sem contar. São 4.',
          mostra: ret({ ...A23x14, areas: [['?', '?'], ['?', '?']] }, 'Os pedaços 20 × 10 e 3 × 4 acendem; depois os outros dois piscam: ficaram de fora.'),
        },
      ],
      esboco: 'O erro de multiplicar casa com casa (como na soma) se desmonta aqui, antes de qualquer conta.',
    },
    {
      tipo: 'passo',
      problema: 'Ache os quatro pedaços de $23 \\times 14$.',
      fala: 'Ache os quatro pedaços de vinte e três vezes catorze.',
      visual: ret({ ...A23x14, areas: [['?', '?'], ['?', '?']] }, 'O retângulo partido com os quatro "?".'),
      passos: [
        {
          pergunta: 'Na faixa do 10: $10 \\times 20$ e $10 \\times 3$.',
          fala: 'Na faixa do dez: dez vezes vinte e dez vezes três.',
          opcoes: [
            { texto: '200 e 30', certa: true, explica: 'Isso. Vezes 10, os algarismos andam uma casa.', mostra: ret({ ...A23x14, areas: [[200, 30], ['?', '?']] }, 'A faixa de cima mostra 200 e 30.') },
            { texto: '20 e 3', erro: 'conta-zeros-errado', explica: 'Isso seria vezes 1. Vezes 10, cada algarismo anda uma casa: 200 e 30.', mostra: ret({ ...A23x14, areas: [[200, 30], ['?', '?']] }, 'O 20 e o 3 andam uma casa: 200 e 30.') },
          ],
          linha: { tex: '10 \\times 23 = 200 + 30', fala: 'dez vezes vinte e três é duzentos mais trinta' },
        },
        {
          pergunta: 'Na faixa do 4: $4 \\times 20$ e $4 \\times 3$.',
          fala: 'Na faixa do quatro: quatro vezes vinte e quatro vezes três.',
          opcoes: [
            { texto: '80 e 12', certa: true, explica: 'Isso. $4 \\times 2 = 8$ dezenas, 80. E $4 \\times 3 = 12$.', mostra: ret({ ...A23x14, areas: [[200, 30], [80, 12]] }, 'A faixa de baixo mostra 80 e 12.') },
            { texto: '8 e 12', erro: 'conta-zeros-errado', explica: 'O 20 vale 2 dezenas: $4 \\times 2$ dezenas são 8 dezenas, 80.', mostra: ret({ ...A23x14, areas: [[200, 30], [80, 12]] }, 'O 8 anda uma casa: 80.') },
          ],
          linha: { tex: '4 \\times 23 = 80 + 12', fala: 'quatro vezes vinte e três é oitenta mais doze' },
        },
        {
          pergunta: 'Some os quatro pedaços.',
          opcoes: [
            { texto: '322', certa: true, explica: 'Isso. $200 + 30 + 80 + 12 = 322$.', mostra: ret({ ...A23x14, areas: [[200, 30], [80, 12]], total: 322 }, 'O total 322 aparece embaixo.') },
            { texto: '212', erro: 'multiplica-so-casas-iguais', explica: '212 é só $200 + 12$. O 30 e o 80 também são cadeiras: 322.', mostra: ret({ ...A23x14, areas: [[200, 30], [80, 12]], total: 322 }, 'O 30 e o 80 piscam; o total vira 322.') },
          ],
          linha: { tex: '200 + 30 + 80 + 12 = 322', fala: 'duzentos mais trinta mais oitenta mais doze é trezentos e vinte e dois' },
        },
      ],
      esboco: 'O método da área completo. Ele funciona sempre e é a forma de conferir a conta armada.',
    },
    {
      tipo: 'ideia',
      texto: 'A faixa do 4 dá $80 + 12 = 92$. A do 10 dá $200 + 30 = 230$. A conta armada escreve **uma linha para cada**.',
      fala: 'A faixa do quatro dá oitenta mais doze, noventa e dois. A do dez dá duzentos mais trinta, duzentos e trinta. A conta armada escreve uma linha para cada.',
      visual: { ...conta({ ...C, parciais: ['92', '230'], resultado: '322' }, 'A conta armada 23 × 14, com 92 e 230 entre os dois traços e 322 embaixo.'), movimento: 'As duas faixas do retângulo deslizam para a direita e encolhem até virar as linhas 92 e 230 da conta armada.' },
      esboco: 'Momento-chave: as faixas viram linhas. O 0 do 230 já está ali antes de qualquer regra.',
    },
    {
      tipo: 'passo',
      problema: 'Agora pela conta armada: $23 \\times 14$.',
      fala: 'Agora pela conta armada: vinte e três vezes catorze.',
      visual: conta({ ...C, destaque: 'U' }, 'A conta armada vazia, com 23 em cima, 14 embaixo e dois traços. A coluna das unidades acende.'),
      passos: [
        {
          pergunta: '$4 \\times 3 = 12$. O que você escreve?',
          fala: 'Quatro vezes três é doze. O que você escreve?',
          opcoes: [
            { texto: 'Fica 2, vai 1', certa: true, explica: 'Isso. 12 unidades são 1 dezena e 2 unidades.', mostra: conta({ ...C, parciais: ['2'], reservas: { D: '1' }, destaque: 'D' }, 'O 2 se escreve na primeira linha; um 1 pequeno sobe para a coluna D.') },
            { texto: 'Escrevo 12', erro: 'escreve-numero-inteiro-na-casa', explica: 'Cada casa guarda um algarismo só. Fica 2, e 10 unidades viram 1 dezena.', mostra: conta({ ...C, parciais: ['2'], reservas: { D: '1' }, destaque: 'D' }, 'O 12 não cabe numa casa; o 1 sobe para D.') },
          ],
          linha: { tex: '4 \\times 3 = 12\\text{: fica 2, vai 1}', fala: 'quatro vezes três é doze, fica dois e vai um' },
        },
        {
          pergunta: 'Agora $4 \\times 2$, mais o 1 que subiu.',
          fala: 'Agora quatro vezes dois, mais o um que subiu.',
          opcoes: [
            { texto: '9', certa: true, explica: 'Isso. $4 \\times 2 = 8$, mais 1: 9. A primeira linha é **92**.', mostra: conta({ ...C, parciais: ['92'], reservas: { D: '1' } }, 'O 9 se escreve: a primeira linha é 92.') },
            { texto: '12', erro: 'reserva-antes-de-multiplicar', explica: 'O 1 entra depois: $4 \\times 2 = 8$, e $8 + 1 = 9$. Somar antes daria $(2 + 1) \\times 4$.', mostra: conta({ ...C, parciais: ['92'], reservas: { D: '1' } }, 'Primeiro o 8 aparece; depois o 1 pequeno se junta a ele: 9.') },
            { texto: '8', erro: 'esquece-reserva', explica: 'Faltou o 1 que subiu das unidades: $8 + 1 = 9$.', mostra: conta({ ...C, parciais: ['92'], reservas: { D: '1' } }, 'O 1 pequeno pisca e o 8 vira 9.') },
          ],
          linha: { tex: '4 \\times 23 = 92', fala: 'quatro vezes vinte e três é noventa e dois' },
        },
        {
          pergunta: 'Agora o 1 do 14, que vale **10**. Como começa a segunda linha?',
          fala: 'Agora o um do catorze, que vale dez. Como começa a segunda linha?',
          opcoes: [
            { texto: 'Com um 0 nas unidades', certa: true, explica: 'Isso. É $10 \\times 23$: o 0 guarda as unidades e o 23 anda uma casa. Fica 230.', mostra: conta({ ...C, parciais: ['92', '230'] }, 'Um 0 âmbar cai nas unidades da segunda linha; o 2 e o 3 se escrevem à esquerda dele: 230.') },
            { texto: 'Com o 3, embaixo do 2', erro: 'esquece-deslocar-linha', explica: 'Assim você escreve 23, não 230. Esse 1 vale 10: a linha é $10 \\times 23 = 230$.', mostra: conta({ ...C, parciais: ['92', '230'] }, 'O 23 escrito embaixo do 92 escorrega uma casa para a esquerda; o 0 entra.') },
          ],
          linha: { tex: '10 \\times 23 = 230', fala: 'dez vezes vinte e três é duzentos e trinta' },
        },
        {
          pergunta: 'Some as duas linhas.',
          opcoes: [
            { texto: '322', certa: true, explica: 'Isso. $92 + 230 = 322$, como no retângulo.', mostra: conta({ ...C, parciais: ['92', '230'], resultado: '322' }, 'O 322 se escreve embaixo do segundo traço.') },
            { texto: '115', erro: 'esquece-deslocar-linha', explica: '115 é $92 + 23$, sem o 0. A segunda linha é 230: 322.', mostra: conta({ ...C, parciais: ['92', '230'], resultado: '322' }, 'O 0 da segunda linha acende; o resultado vira 322.') },
          ],
          linha: { tex: '23 \\times 14 = 322', fala: 'vinte e três vezes catorze é trezentos e vinte e dois' },
        },
      ],
      esboco: 'Cada passo da conta aponta para um pedaço do retângulo. O 0 de deslocamento acende em âmbar.',
    },
    {
      tipo: 'anote',
      titulo: 'Multiplicação armada',
      definicao: 'Multiplique o número de cima por cada algarismo de baixo, uma linha para cada. A linha das dezenas começa com 0. Some as linhas.',
      exemplo: { tex: '23 \\times 14 = 92 + 230 = 322', fala: 'vinte e três vezes catorze é noventa e dois mais duzentos e trinta, trezentos e vinte e dois' },
      alerta: 'Não esqueça o 0 da segunda linha: o 1 do 14 vale 10.',
      esboco: 'Na página: a conta armada completa ao lado do retângulo partido, com setas ligando cada faixa à sua linha.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém fez $36 \\times 25$ e achou **252**. O que aconteceu?',
      fala: 'Alguém fez trinta e seis vezes vinte e cinco e achou duzentos e cinquenta e dois. O que aconteceu?',
      visual: conta({ parcelas: [36, 25], parciais: ['180', '72'], resultado: '252' }, 'A conta armada 36 × 25 com as linhas 180 e 72 alinhadas pela direita e 252 embaixo.'),
      opcoes: [
        {
          texto: 'Esqueceu o 0 da segunda linha', certa: true,
          explica: 'Isso. O 2 do 25 vale 20: $20 \\times 36 = 720$. E $180 + 720 = 900$.',
          mostra: conta({ parcelas: [36, 25], parciais: ['180', '720'], resultado: '900' }, 'O 72 escorrega uma casa para a esquerda e ganha o 0: 720. O resultado vira 900.'),
        },
        {
          texto: 'Errou a tabuada',
          explica: '$5 \\times 36 = 180$ e $2 \\times 36 = 72$ estão certos. Mas o 2 vale 20: 720. Dá 900.',
          mostra: conta({ parcelas: [36, 25], parciais: ['180', '720'], resultado: '900' }, 'O 72 ganha o 0 e anda uma casa: 720. O resultado vira 900.'),
        },
      ],
      esboco: 'Estimar também denuncia: 36 × 25 fica perto de 40 × 25 = 1.000. 252 é pequeno demais.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Arme e resolva: $47 \\times 23$. Confira com uma estimativa.',
      fala: 'Arme e resolva: quarenta e sete vezes vinte e três. Confira com uma estimativa.',
      resposta: 1081,
      resolucao: [
        { tex: '3 \\times 47 = 141', fala: 'três vezes quarenta e sete é cento e quarenta e um' },
        { tex: '20 \\times 47 = 940', fala: 'vinte vezes quarenta e sete é novecentos e quarenta' },
        { tex: '141 + 940 = 1.081', fala: 'cento e quarenta e um mais novecentos e quarenta é mil e oitenta e um' },
        { tex: '50 \\times 20 = 1.000', fala: 'estimativa: cinquenta vezes vinte é mil, perto do resultado' },
      ],
      esboco: 'Um vai um em cada linha (3 × 7 = 21, vai 2; 2 × 7 = 14, vai 1) e a estimativa para fechar.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['armada-mult-n1', 'armada-mult-n2', 'armada-mult-n3'],
      esboco: 'Nível 1: dois algarismos vezes um, com vai um, com a conta na tela. Nível 2: dois algarismos vezes dois, com o zero de deslocamento. Nível 3: uma situação, sem a conta armada.',
    },
    {
      tipo: 'fecho',
      texto: 'O auditório tem **322** cadeiras. Na próxima unidade, o caminho de volta: a **divisão**.',
      fala: 'O auditório tem trezentas e vinte e duas cadeiras. Na próxima unidade, o caminho de volta: a divisão.',
      visual: conta({ ...C, parciais: ['92', '230'], resultado: '322' }, 'A conta armada completa, ao lado do retângulo partido com 200, 30, 80 e 12.'),
      esboco: 'Responder ao gancho e abrir a divisão: se 14 fileiras têm 322 cadeiras, quantas há em cada fileira?',
    },
  ],
}
