import type { Aula, Visual } from '@/lib/formation/schema'

// Tempo. As horas não contam de 10 em 10: 1 h = 60 min e 1 min = 60 s.
// Por isso 1,5 h é uma hora e meia, e meia hora são 30 min, não 50. Na
// soma, 60 minutos viram 1 hora (o vai um da hora); na duração, vale ir até
// a hora cheia. Os erros a desmontar: ler o que vem depois da vírgula como
// minutos (1,5 h = 1 h 50 min) e fazer a conta como se a hora tivesse 100
// minutos (8 h 45 + 30 min = 8 h 75).

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const MINUTOS = { de: 0, ate: 120, passo: 10, marcas: [0, 60, 120], unidade: 'min' }
const HORA_E_MEIA = { ...MINUTOS, saltos: [[0, 60, '1 h'], [60, 90, '+30 min']] }
const BOLO = { partes: 4, inteiros: 2, rotulo: '+ 30 min' }
const FILME = { de: 0, ate: 100, passo: 5, marcas: [0, 20, 80, 95] }
const FILME_SALTOS = [[0, 20, '+20 min'], [20, 80, '+1 h'], [80, 95, '+15 min']]

export const aula: Aula = {
  id: 'B.U9.A5',
  titulo: 'Tempo',
  objetivo: 'Converter horas com vírgula em horas e minutos (1,5 h = 1 h 30 min), somar minutos passando da hora e calcular a duração entre dois horários, sabendo que o tempo conta de 60 em 60.',
  modelo: 'reta',
  esboco: 'Abre no aplicativo de mapa: a viagem dura 1,5 h. Muita gente lê 1 h 50 min. A reta dos minutos desmonta: 1 hora é 60, e meia hora leva até 90. Na barra, uma hora em 4 quartos de 15 min: o aluno pinta meia hora, 2 quartos, 30 min. Momento-chave: ver que 0,5 h é a metade de 60, não 50. Depois o bolo das 8 h 45 que leva 30 min: o pintado passa do fim da hora, e 60 minutos viram 1 hora. Fecha com a duração do filme, indo até a hora cheia.',
  vega: 'Ideia central: o tempo conta de 60 em 60. 1 h = 60 min e 1 min = 60 s. Uma hora com vírgula é uma fração da hora: 0,5 h é a metade de 60 min (30 min), 0,25 h é um quarto (15 min), 0,75 h são três quartos (45 min). Para converter, multiplique a parte depois da vírgula por 60. Na soma, quando os minutos passam de 60, 60 deles viram 1 hora. Na duração, vá até a hora cheia, conte as horas inteiras e some o resto. Erros esperados: ler 1,5 h como 1 h 50 min (ou 1 h 5 min); escrever 7 h 30 min como 7,3 h; somar 8 h 45 + 30 min = 8 h 75; subtrair horários como números comuns (11 h 15 − 9 h 40 = 175 min). Guie com "Quantos minutos tem meia hora?", "Os minutos passaram de 60?", "Quanto falta para a hora cheia?". Confira na reta dos minutos ou num relógio de ponteiros.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'O aplicativo diz que a viagem dura **1,5 h**. Isso é 1 h 50 min? Ou outra coisa?',
      fala: 'O aplicativo diz que a viagem dura um vírgula cinco hora. Isso é uma hora e cinquenta minutos? Ou outra coisa?',
      visual: reta(MINUTOS, 'A reta dos minutos, de 0 a 120, com um traço a cada 10 min. Só o 0, o 60 e o 120 escritos, com "min" junto.'),
      esboco: 'Uma leitura do dia a dia em que o adulto erra sem perceber.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Aposte: quanto tempo é **1,5 h**?',
      fala: 'Aposte: quanto tempo é um vírgula cinco hora?',
      visual: reta(MINUTOS, 'A mesma reta, ainda sem pontos.'),
      opcoes: [
        {
          texto: '1 h 30 min', certa: true,
          explica: 'Isso. 1 hora são 60 min, e meia hora mais leva a reta até 90 min.',
          mostra: reta(HORA_E_MEIA, 'Dois saltos: de 0 a 60, "1 h"; de 60 a 90, "+30 min". O 90 acende.'),
        },
        {
          texto: '1 h 50 min', erro: 'hora-decimal-como-minutos',
          explica: 'O 0,5 é meia hora. A hora tem 60 min, e a metade de 60 é 30. O 50 seria a metade de 100.',
          mostra: reta({ ...HORA_E_MEIA, meio: 110 }, 'Os dois saltos param no 90. Um traço tracejado no 110 mostra onde 1 h 50 min cairia: longe demais.'),
        },
        {
          texto: '1 h 5 min', erro: 'hora-decimal-como-minutos',
          explica: 'O 5 depois da vírgula não são minutos: é meia hora. Meia hora são 30 min.',
          mostra: reta(HORA_E_MEIA, 'Os dois saltos param no 90.'),
        },
      ],
      esboco: 'A aposta mostra o erro antes de qualquer regra. A reta já desmonta.',
    },
    {
      tipo: 'mexa',
      texto: 'Uma hora partida em 4 quartos de **15 min**. Pinte **meia hora**: o 0,5 de 1,5 h.',
      fala: 'Uma hora partida em quatro quartos de quinze minutos. Pinte meia hora: o zero vírgula cinco de um vírgula cinco hora.',
      visual: barra({ partes: 4, pintadas: 0, pintar: true, rotulo: '1 h' }, 'Uma barra só, partida em 4 partes iguais, com "1 h" à direita. Proposta: "15 min" escrito embaixo de cada parte.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas partes para pintar meia hora.',
        sucesso: { pintadas: 2 },
        mostre: 'As duas primeiras partes se pintam de âmbar: 15 min e mais 15 min.',
      },
      descoberta: 'Meia hora são 2 quartos de 15 min: 30 min. O 0,5 é uma fração da hora, não um número de minutos.',
      esboco: 'O momento-chave: a hora com vírgula é uma fração da hora, como na barra das frações.',
    },
    {
      tipo: 'mexa',
      texto: 'E **0,75 h**? São 3 quartos de hora. Na reta dos minutos, toque onde ela termina.',
      fala: 'E zero vírgula setenta e cinco hora? São três quartos de hora. Na reta dos minutos, toque onde ela termina.',
      visual: reta({ de: 0, ate: 90, passo: 5, marcas: [0, 15, 30, 45, 60, 75, 90], escolhas: [45, 75] }, 'A reta de 0 a 90 min, com marcas de 15 em 15. Dois círculos tocáveis: no 45 e no 75. Quem lê 0,75 como 75 minutos toca o 75.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no círculo onde termina 0,75 h.',
        sucesso: { vizinho: 45 },
        mostre: 'Uma seta sai do 0 e para no 45, passando por 15 e 30: três quartos de 15 min.',
      },
      descoberta: '0,75 h são 3 × 15 = 45 min. O 75 seria 75 minutos, mais de uma hora.',
      esboco: 'A isca do 75 fica na reta, à vista. O aluno decide pela conta dos quartos.',
    },
    {
      tipo: 'anote',
      titulo: 'Horas e minutos',
      definicao: 'O tempo conta de 60 em 60: 1 h = 60 min e 1 min = 60 s. Meia hora são 30 min; um quarto de hora, 15 min.',
      exemplo: { tex: '1{,}5 \\text{ h} = 60 \\text{ min} + 30 \\text{ min} = 90 \\text{ min}', fala: 'um vírgula cinco hora são sessenta minutos mais trinta, noventa minutos' },
      alerta: '1,5 h não é 1 h 50 min: é 1 h 30 min. Depois da vírgula vem um pedaço da hora, não minutos.',
      esboco: 'A página do caderno com a barra de 4 quartos desenhada e "15 min" em cada um.',
    },
    {
      tipo: 'mexa',
      texto: 'O bolo entrou no forno às **8 h 45** e leva **30 min**. A barra vai das 8 h às 10 h. Pinte os 30 min.',
      fala: 'O bolo entrou no forno às oito e quarenta e cinco e leva trinta minutos. A barra vai das oito às dez. Pinte os trinta minutos.',
      visual: barra({ ...BOLO, pintadas: 3, pintar: true }, 'Duas horas lado a lado, cada uma em 4 quartos de 15 min. Os 3 primeiros quartos já pintados: 8 h 45. O toque continua o pintado.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte mais 2 quartos de hora, os 30 min do bolo.',
        sucesso: { pintadas: 5 },
        mostre: 'O 4º quarto se pinta, fecha a hora das 8, e o pintado passa para a hora das 9: um quarto, 15 min.',
      },
      descoberta: '45 min + 30 min = 75 min. Os primeiros 15 fecham a hora; 60 minutos viram 1 hora, e sobram 15 min na hora seguinte.',
      esboco: 'O vai um da hora, visto: o pintado atravessa a divisa entre as duas horas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A que horas o bolo sai do forno?',
      visual: barra({ ...BOLO, pintadas: 5 }, 'A barra com 5 quartos pintados: a hora das 8 cheia e 1 quarto da hora das 9.'),
      opcoes: [
        {
          texto: '9 h 15', certa: true,
          explica: 'Isso. 15 min fecham as 9 h, e sobram 15 min.',
        },
        {
          texto: '8 h 75', erro: 'tempo-em-base-cem',
          explica: '8 h 75 não existe no relógio. Quando os minutos passam de 60, 60 deles viram 1 hora: 9 h 15.',
          mostra: barra({ ...BOLO, pintadas: 5 }, 'A barra com a hora das 8 cheia. Proposta: a primeira hora acende, os 60 min que viram 1 hora.'),
        },
        {
          texto: '8 h 15', erro: 'esquece-reserva',
          explica: 'Os 15 min estão certos, mas a hora cheia que se fechou sumiu. É o vai um da hora: 9 h 15.',
          mostra: barra({ ...BOLO, pintadas: 5 }, 'A barra com a hora das 8 cheia e 1 quarto da hora das 9.'),
        },
      ],
      esboco: 'Dois erros reais de quem soma horas no papel: 8 h 75 e esquecer a hora cheia.',
    },
    {
      tipo: 'passo',
      problema: 'O filme começa às **19 h 40** e acaba às **21 h 15**. Quanto tempo dura?',
      fala: 'O filme começa às dezenove e quarenta e acaba às vinte e uma e quinze. Quanto tempo dura?',
      visual: reta({ ...FILME, marcas: [0] }, 'A reta do tempo do filme: o 0 é 19 h 40. Por enquanto, sem saltos.'),
      passos: [
        {
          pergunta: 'Primeiro, até a hora cheia: de 19 h 40 até 20 h.',
          fala: 'Primeiro, até a hora cheia: de dezenove e quarenta até vinte horas.',
          opcoes: [
            { texto: '20 min', certa: true, explica: 'Isso. Faltam 20 min para fechar os 60.', mostra: reta({ ...FILME, marcas: [0, 20], saltos: FILME_SALTOS.slice(0, 1) }, 'O primeiro salto: de 0 a 20, "+20 min".') },
            { texto: '60 min', explica: 'De 19 h 40 até 20 h não passa uma hora: os 40 min já foram. Faltam 20.' },
          ],
          linha: { tex: '19\\text{h}40 \\to 20\\text{h}: 20 \\text{ min}', fala: 'de dezenove e quarenta até vinte horas: vinte minutos' },
        },
        {
          pergunta: 'Depois, de 20 h até 21 h 15.',
          fala: 'Depois, de vinte horas até vinte e uma e quinze.',
          opcoes: [
            { texto: '1 h 15 min = 75 min', certa: true, explica: 'Isso. Uma hora cheia e mais um quarto.', mostra: reta({ ...FILME, saltos: FILME_SALTOS }, 'Os três saltos: +20 min, +1 h, +15 min, até o 95.') },
            { texto: '1 h 15 min = 115 min', erro: 'tempo-em-base-cem', explica: 'Uma hora tem 60 min, não 100: 60 + 15 = 75 min.' },
          ],
          linha: { tex: '20\\text{h} \\to 21\\text{h}15: 75 \\text{ min}', fala: 'de vinte horas até vinte e uma e quinze: setenta e cinco minutos' },
        },
        {
          pergunta: 'Quanto dura o filme?',
          opcoes: [
            { texto: '95 min, ou 1 h 35 min', certa: true, explica: 'Isso. 20 min + 75 min = 95 min.', mostra: reta({ ...FILME, saltos: FILME_SALTOS }, 'Os três saltos e o 95 aceso no fim.') },
            { texto: '175 min', erro: 'tempo-em-base-cem', explica: 'Isso é 2115 − 1940, como se a hora tivesse 100 min. O filme não dura quase 3 horas.' },
          ],
          linha: { tex: '20 + 75 = 95 \\text{ min} = 1\\text{h}\\,35\\text{min}', fala: 'vinte mais setenta e cinco são noventa e cinco minutos, uma hora e trinta e cinco minutos' },
        },
      ],
      esboco: 'Ir até a hora cheia, como completar até a dezena na unidade 2. A reta guarda os saltos.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: você estacionou às 13 h 50 e saiu às 16 h 20. Quantos minutos o carro ficou?',
      fala: 'No papel: você estacionou às treze e cinquenta e saiu às dezesseis e vinte. Quantos minutos o carro ficou?',
      resposta: 150,
      resolucao: [
        { tex: '13\\text{h}50 \\to 14\\text{h}: 10 \\text{ min}', fala: 'de treze e cinquenta até catorze horas: dez minutos' },
        { tex: '14\\text{h} \\to 16\\text{h}: 120 \\text{ min}', fala: 'de catorze até dezesseis horas: cento e vinte minutos' },
        { tex: '16\\text{h} \\to 16\\text{h}20: 20 \\text{ min}', fala: 'de dezesseis até dezesseis e vinte: vinte minutos' },
        { tex: '10 + 120 + 20 = 150 \\text{ min}', fala: 'dez mais cento e vinte mais vinte são cento e cinquenta minutos' },
      ],
      esboco: 'Duas horas e meia de estacionamento. Quem faz 1620 − 1350 acha 270.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['tempo-n1', 'tempo-n2', 'tempo-n3'],
      esboco: 'Nível 1: horas com vírgula em minutos, com a reta. Nível 2: somar minutos passando da hora, em escolha. Nível 3: a duração entre dois horários, em minutos, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A viagem de **1,5 h** dura **1 h 30 min**: meia hora são 30 min, não 50. Na próxima aula: polegadas, pés e milhas.',
      fala: 'A viagem de um vírgula cinco hora dura uma hora e trinta minutos: meia hora são trinta minutos, não cinquenta. Na próxima aula: polegadas, pés e milhas.',
      visual: reta(HORA_E_MEIA, 'A reta do gancho com os dois saltos até o 90.'),
      esboco: 'Responde ao gancho e abre as unidades de outros sistemas.',
    },
  ],
}
