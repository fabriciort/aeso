import type { Aula, Visual } from '@/lib/formation/schema'

// O MMC é onde os saltos de dois números se encontram pela primeira vez
// (os ônibus que saem juntos de novo). O MDC é o maior pedaço que cabe nos
// dois sem sobrar (as fitas cortadas em partes iguais). Encontro no futuro
// é MMC, maior ou igual aos números; cortar em partes iguais é MDC, menor
// ou igual a eles. Os dois voltam na soma de frações.

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const R24 = { de: 0, ate: 24, passo: 1, marcas: [0, 6, 12, 18, 24] }
const DE4 = [[0, 4, '+4'], [4, 8, '+4'], [8, 12, '+4'], [12, 16, '+4'], [16, 20, '+4'], [20, 24, '+4']]
const FITAS = { de: 0, ate: 18, passo: 1, marcas: [0, 6, 12, 18], numeros: [12, 18] }

export const aula: Aula = {
  id: 'B.U6.A4',
  titulo: 'MMC e MDC',
  objetivo: 'Achar o MMC e o MDC de dois números, listando múltiplos e divisores ou pela fatoração, e saber qual dos dois a situação pede.',
  modelo: 'reta',
  esboco: 'Dois ônibus saem juntos às 6 h, um a cada 4 minutos e o outro a cada 6. Na reta, os saltos de 4 e as marcas de 6: o primeiro lugar onde se encontram é o 12, e não o 24. Depois, o contrário: fitas de 12 m e 18 m cortadas em pedaços iguais, sem sobra. O aluno toca os tamanhos que servem para as duas (1, 2, 3, 6) e escolhe o maior. Momento-chave: perceber que um é encontro no futuro (cresce: MMC) e o outro é corte em partes (encolhe: MDC).',
  vega: 'Ideia central: o MMC (mínimo múltiplo comum) é o menor número que está nas duas listas de múltiplos; na reta, é o primeiro encontro dos saltos. O MDC (máximo divisor comum) é o maior número que divide os dois; é o maior pedaço que cabe nos dois sem sobrar. Para achar: liste os múltiplos do maior até achar um múltiplo do menor (MMC); liste os divisores do menor e teste no maior (MDC); ou fatore e compare os primos. Erros esperados: usar sempre o produto como MMC (mmc(4, 6) = 24); trocar MMC e MDC; parar num divisor comum que não é o maior (mdc(12, 18) = 2). Guie perguntando "É um encontro ou um corte?", "A resposta pode ser maior que os números?", "Tem um encontro antes desse?". O MMC volta na soma de frações. Em Sua vez, peça para dizer se é MMC ou MDC antes de calcular.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Dois ônibus saem juntos às 6 h. Um volta a cada **4** minutos, o outro a cada **6**. Quando saem juntos de novo?',
      fala: 'Dois ônibus saem juntos às seis horas. Um volta a cada quatro minutos, o outro a cada seis. Quando saem juntos de novo?',
      visual: reta({ ...R24, numero: 0 }, 'A reta dos minutos, de 0 a 24, com os dois ônibus parados no 0.'),
      esboco: 'Uma pergunta de terminal de ônibus, com dois ritmos diferentes.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Os saltos são do ônibus de 4. As marcas, do ônibus de 6. Onde eles se encontram **primeiro**?',
      fala: 'Os saltos são do ônibus de quatro. As marcas, do ônibus de seis. Onde eles se encontram primeiro?',
      visual: reta({ ...R24, saltos: DE4 }, 'Os saltos de 4 por cima da reta; as marcas 6, 12, 18 e 24 do outro ônibus.'),
      opcoes: [
        {
          texto: 'No 12', certa: true,
          explica: 'Isso. 12 é o primeiro número que está nas duas listas: 4, 8, **12** e 6, **12**.',
          mostra: reta({ ...R24, saltos: DE4.slice(0, 3), numero: 12 }, 'Os saltos de 4 chegam no 12, que já é marca do ônibus de 6, e o 12 acende. Proposta: os saltos de 6 por baixo da reta, em outra cor.'),
        },
        {
          texto: 'No 24', erro: 'mmc-e-o-produto',
          explica: '$4 \\times 6 = 24$ é um encontro, mas não o primeiro. Antes, no 12, os dois já se cruzam.',
          mostra: reta({ ...R24, saltos: DE4, numeros: [12, 24] }, 'O 12 e o 24 acendem; o 12 vem antes.'),
        },
        {
          texto: 'No 2', erro: 'confunde-mmc-mdc',
          explica: 'Em 2 minutos nenhum ônibus voltou ainda. O encontro vem depois dos dois: no 12.',
          mostra: reta({ ...R24, saltos: DE4.slice(0, 3), numero: 12 }, 'Os saltos começam no 0 e o primeiro encontro acende no 12.'),
        },
        {
          texto: 'No 10',
          explica: '$4 + 6 = 10$, mas o 10 não está nos saltos de 4 nem nos de 6. O primeiro encontro é no 12.',
          mostra: reta({ ...R24, saltos: DE4.slice(0, 3), numero: 12 }, 'O 10 fica entre dois saltos; o 12 acende.'),
        },
      ],
      esboco: 'O aluno olha a reta e aposta. O 24, o produto, é a isca mais forte.',
    },
    {
      tipo: 'ideia',
      texto: 'Agora o contrário: fitas de **12 m** e **18 m** vão ser cortadas em pedaços iguais, os maiores possíveis, sem sobra.',
      fala: 'Agora o contrário: fitas de doze metros e dezoito metros vão ser cortadas em pedaços iguais, os maiores possíveis, sem sobra.',
      visual: reta({ ...FITAS, unidade: 'm' }, 'As duas fitas medidas na reta: uma até o 12, outra até o 18. Proposta: duas barras de fita, uma em cima da outra, que o aluno corta.'),
      esboco: 'Em vez de crescer até um encontro, agora se corta. Só a situação; a pergunta vem no toque.',
    },
    {
      tipo: 'mexa',
      texto: 'Quais tamanhos de pedaço cortam as **duas** fitas sem sobra?',
      fala: 'Quais tamanhos de pedaço cortam as duas fitas sem sobra?',
      visual: {
        modelo: 'livre',
        estado: { fichas: ['1', '2', '3', '4', '5', '6', '9', '12'], lugares: ['1º', '2º', '3º', '4º'] },
        esboco: 'Fichas com tamanhos de pedaço, em metros. Proposta: cada ficha tocada corta as duas fitas nesse tamanho, e a sobra, se houver, acende em âmbar no fim da fita.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos tamanhos que servem para as duas, do menor para o maior.',
        sucesso: { ordem: ['1', '2', '3', '6'] },
        mostre: 'O 1, o 2, o 3 e o 6 vão para os lugares. O 4, o 9 e o 12 servem para uma fita só e ficam de fora.',
      },
      descoberta: 'Os divisores comuns de 12 e 18 são 1, 2, 3 e 6. O 4 e o 12 servem só para o 12; o 9, só para o 18.',
      esboco: 'Os divisores de cada fita se cruzam. Errar o 4 ou o 9 deixa sobra numa das fitas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Para pedaços **os maiores possíveis**, qual tamanho usar?',
      fala: 'Para pedaços os maiores possíveis, qual tamanho usar?',
      visual: reta({ ...FITAS, unidade: 'm' }, 'As duas fitas na reta.'),
      opcoes: [
        {
          texto: '6 m', certa: true,
          explica: 'Isso. 6 é o maior que divide 12 e 18: 2 pedaços de uma fita, 3 da outra.',
          mostra: reta({ ...FITAS, unidade: 'm', saltos: [[0, 6, '6 m'], [6, 12, '6 m'], [12, 18, '6 m']] }, 'A fita de 18 se corta em 3 pedaços de 6; a de 12 para no segundo corte.'),
        },
        {
          texto: '2 m', erro: 'mdc-nao-e-o-maior',
          explica: '2 m serve, mas 6 m também serve e é maior. O maior que divide os dois é o **6**.',
          mostra: reta({ ...FITAS, unidade: 'm', saltos: [[0, 6, '6 m'], [6, 12, '6 m'], [12, 18, '6 m']] }, 'Os pedaços de 2 se juntam de 3 em 3 e viram pedaços de 6.'),
        },
        {
          texto: '36 m', erro: 'confunde-mmc-mdc',
          explica: 'Um pedaço de 36 m não sai de uma fita de 12 m. Cortar encolhe: o pedaço é **6 m**.',
          mostra: reta({ ...FITAS, unidade: 'm', saltos: [[0, 6, '6 m'], [6, 12, '6 m'], [12, 18, '6 m']] }, 'Um pedaço de 36 m aparece, maior que a reta inteira, e some.'),
        },
      ],
      esboco: 'O 36 é o MMC de 12 e 18: quem troca as contas cai nele, e a fita curta desmonta na hora.',
    },
    {
      tipo: 'anote',
      titulo: 'MMC e MDC',
      definicao: '**MMC**: o menor múltiplo comum, onde os saltos se encontram. **MDC**: o maior divisor comum, o maior pedaço que cabe nos dois.',
      exemplo: { tex: '\\text{mmc}(4, 6) = 12 \\qquad \\text{mdc}(12, 18) = 6', fala: 'o mmc de quatro e seis é doze; o mdc de doze e dezoito é seis' },
      alerta: 'Encontro no futuro: MMC, nunca menor que os números. Cortar em partes iguais: MDC, nunca maior.',
      esboco: 'A página com a reta dos ônibus e as fitas cortadas, cada uma com o seu nome.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um remédio é a cada **6 h**, outro a cada **8 h**. Quando você toma os dois juntos de novo? É MMC ou MDC?',
      fala: 'Um remédio é a cada seis horas, outro a cada oito horas. Quando você toma os dois juntos de novo? É mmc ou mdc?',
      visual: reta({ de: 0, ate: 48, passo: 2, marcas: [0, 8, 16, 24, 32, 40, 48] }, 'A reta das horas, de 0 a 48, com as marcas de 8 em 8.'),
      opcoes: [
        {
          texto: 'MMC: é um encontro no futuro', certa: true,
          explica: 'Isso. Os horários dos dois remédios vão se encontrar mais à frente: é o menor múltiplo comum.',
        },
        {
          texto: 'MDC: tem dois números', erro: 'confunde-mmc-mdc',
          explica: 'Os dois usam dois números. Aqui ninguém corta nada: os horários se encontram no futuro. É MMC.',
        },
      ],
      esboco: 'Antes de calcular, decidir. É a pergunta que o aluno vai fazer sozinho em Sua vez.',
    },
    {
      tipo: 'passo',
      problema: 'Remédios a cada **6 h** e a cada **8 h**, os dois agora, às 8 h da manhã. Quando juntos de novo?',
      fala: 'Remédios a cada seis horas e a cada oito horas, os dois agora, às oito da manhã. Quando juntos de novo?',
      visual: reta({ de: 0, ate: 48, passo: 2, marcas: [0, 8, 16, 24, 32, 40, 48] }, 'A reta das horas, com as marcas de 8 em 8.'),
      passos: [
        {
          pergunta: 'Conte de 8 em 8. Qual é o primeiro que também é múltiplo de 6?',
          fala: 'Conte de oito em oito. Qual é o primeiro que também é múltiplo de seis?',
          opcoes: [
            { texto: '24', certa: true, explica: 'Isso. 8, 16, **24**: e $24 = 6 \\times 4$.', mostra: reta({ de: 0, ate: 48, passo: 2, marcas: [0, 8, 16, 24, 32, 40, 48], saltos: [[0, 8, '+8'], [8, 16, '+8'], [16, 24, '+8']], numero: 24 }, 'Três saltos de 8 chegam ao 24, que acende.') },
            { texto: '16', explica: '$16 \\div 6$ deixa resto 4. O próximo, 24, é $6 \\times 4$.', mostra: reta({ de: 0, ate: 48, passo: 2, marcas: [0, 8, 16, 24, 32, 40, 48], saltos: [[0, 8, '+8'], [8, 16, '+8'], [16, 24, '+8']], numero: 24 }, 'O 16 pisca e o salto segue até o 24.') },
            { texto: '48', erro: 'mmc-e-o-produto', explica: '$6 \\times 8 = 48$ é um encontro, mas antes, no 24, os dois já coincidem.', mostra: reta({ de: 0, ate: 48, passo: 2, marcas: [0, 8, 16, 24, 32, 40, 48], numeros: [24, 48] }, 'O 24 e o 48 acendem; o 24 vem antes.') },
          ],
          linha: { tex: '\\text{mmc}(6, 8) = 24', fala: 'o mmc de seis e oito é vinte e quatro' },
        },
        {
          pergunta: 'Então, a que horas você toma os dois juntos de novo?',
          opcoes: [
            { texto: 'Amanhã, às 8 h', certa: true, explica: 'Isso. 24 horas depois: o mesmo horário, no dia seguinte.' },
            { texto: 'Às 10 h de hoje', erro: 'confunde-mmc-mdc', explica: '2 é o mdc de 6 e 8. Em 2 horas nenhum remédio chegou à hora. São 24 h: amanhã, às 8 h.' },
          ],
          linha: { tex: '8 \\text{ h} + 24 \\text{ h} \\to \\text{amanhã, às 8 h}', fala: 'oito horas mais vinte e quatro horas: amanhã, às oito' },
        },
      ],
      esboco: 'O método: contar com o maior e parar no primeiro que o menor também alcança.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: fitas de **24 cm** e **36 cm**, em pedaços iguais, os maiores possíveis. Use a fatoração. Quantos cm?',
      fala: 'No papel: fitas de vinte e quatro e trinta e seis centímetros, em pedaços iguais, os maiores possíveis. Use a fatoração. Quantos centímetros?',
      resposta: 12,
      resolucao: [
        { tex: '24 = 2 \\times 2 \\times 2 \\times 3', fala: 'vinte e quatro é dois vezes dois vezes dois vezes três' },
        { tex: '36 = 2 \\times 2 \\times 3 \\times 3', fala: 'trinta e seis é dois vezes dois vezes três vezes três' },
        { tex: '\\text{Em comum: } 2 \\times 2 \\times 3 = 12', fala: 'em comum: dois vezes dois vezes três, doze' },
        { tex: '\\text{mdc}(24, 36) = 12', fala: 'o mdc de vinte e quatro e trinta e seis é doze' },
      ],
      esboco: 'A fatoração da aula anterior vira ferramenta: o MDC é o que as duas árvores têm em comum.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['mmc-mdc-n1', 'mmc-mdc-n2', 'mmc-mdc-n3'],
      esboco: 'Nível 1: os ônibus, com os saltos na reta (MMC). Nível 2: fitas e tábuas cortadas em partes iguais (MDC). Nível 3: remédios, luzes, painéis e buquês misturados: o aluno decide se é MMC ou MDC.',
    },
    {
      tipo: 'fecho',
      texto: 'Saem juntos de novo em **12** minutos, às 6 h 12. Na próxima unidade: frações, onde o MMC deixa os pedaços do mesmo tamanho.',
      fala: 'Saem juntos de novo em doze minutos, às seis e doze. Na próxima unidade: frações, onde o mmc deixa os pedaços do mesmo tamanho.',
      visual: reta({ ...R24, saltos: DE4.slice(0, 3), numero: 12 }, 'Os saltos de 4 chegam ao 12, marca do ônibus de 6: os dois juntos. Proposta: os saltos de 6 por baixo, em outra cor.'),
      esboco: 'Responder ao gancho com o horário. O MMC aponta para a soma de frações.',
    },
  ],
}
