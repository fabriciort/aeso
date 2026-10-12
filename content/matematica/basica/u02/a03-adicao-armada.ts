import type { Aula, Visual } from '@/lib/formation/schema'

// A conta armada da adição nasce dos blocos: casa com casa, das unidades
// para a esquerda, e cada 10 de uma casa vira 1 na casa seguinte. O "vai um"
// não é truque: é o agrupamento da unidade 1 acontecendo dentro da conta.

type Conta = { parcelas: number[]; sinal: '+' | '−'; resultado?: string; reservas?: Record<string, string>; destaque?: string }
const conta = (c: Conta, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { conta: c }, esboco })
const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })
const C147 = { parcelas: [147, 85], sinal: '+' as const }

export const aula: Aula = {
  id: 'B.U2.A3',
  titulo: 'Adição armada',
  objetivo: 'Armar e resolver adições com números até 1.000, alinhando as casas, começando pelas unidades e fazendo o reagrupamento (vai um) quando uma casa passa de 9.',
  modelo: 'quadro-posicional',
  esboco: 'A conta armada aparece num caderno quadriculado na tela, com as casas U, D, C no topo. Antes da regra, os blocos: 7 + 5 cubos dão 12, e 10 deles viram uma barra. Essa barra é o "1" pequeno que sobe para as dezenas. O resultado se escreve da direita para a esquerda, casa por casa. Momento-chave: ver o 1 do vai um subir e entender que ele é uma dezena de verdade, não um número que se "leva".',
  vega: 'Ideia central: casa com casa, começando pelas unidades. Quando uma casa soma 10 ou mais, 10 dela viram 1 da casa seguinte: fica o que passou de 10, e 1 vai para a esquerda. Isso é o agrupamento da unidade 1. Erros esperados: esquecer o vai um (147 + 85 → 222), escrever a soma inteira de cada coluna (58 + 27 → 715) e desalinhar as casas (85 embaixo do 14 de 147). Guie perguntando "Quanto deu nas unidades? Passou de 9?", "Esse 1 vale 1 ou vale 10?", "O 8 do 85 está embaixo de qual casa?". Para conferir, estime: 147 + 85 fica perto de 150 + 80 = 230. Em Sua vez, não diga o resultado: peça a casa das unidades primeiro.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'De cabeça, **147 + 85** já pesa. No papel, a conta armada resolve **uma casa de cada vez**.',
      fala: 'De cabeça, cento e quarenta e sete mais oitenta e cinco já pesa. No papel, a conta armada resolve uma casa de cada vez.',
      visual: conta(C147, 'A conta armada no caderno quadriculado: 147 em cima, 85 embaixo, alinhados pela direita, o sinal + à esquerda e a linha do resultado vazia. As casas C, D, U no topo.'),
      esboco: 'O aluno já viu que o 8 de 85 fica embaixo do 4: as casas da unidade 1 viram colunas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Por qual casa você começa a conta?',
      visual: conta(C147, 'As três colunas da conta piscam de leve, uma de cada vez, sem indicar a resposta.'),
      opcoes: [
        {
          texto: 'Pelas unidades, à direita', certa: true,
          explica: 'Isso. Se as unidades passarem de 9, sobra algo para a dezena. Por isso a conta anda para a esquerda.',
          mostra: conta({ ...C147, destaque: 'U' }, 'A coluna U acende: 7 e 5.'),
        },
        {
          texto: 'Pelas centenas, à esquerda',
          explica: 'Lemos da esquerda, mas a conta começa na direita: o que sobra das unidades vai para as dezenas.',
          mostra: conta({ ...C147, destaque: 'U' }, 'A luz pula da coluna C para a coluna U.'),
        },
      ],
      esboco: 'Uma escolha rápida que o próximo cartão justifica com as mãos.',
    },
    {
      tipo: 'mexa',
      texto: 'Nas unidades: **7 + 5** cubos. Junte 10 numa barra.',
      fala: 'Nas unidades: sete mais cinco cubos. Junte dez numa barra.',
      visual: blocos({ centenas: 0, dezenas: 0, unidades: 12, rotulos: { unidades: '7 + 5' } }, 'Os 7 cubos do 147 e os 5 do 85 lado a lado: 12 cubos, com a borda tracejada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos cubos.',
        sucesso: { dezenas: 1, unidades: 2 },
        mostre: 'Dez cubos se fundem numa barra; ficam 2 cubos soltos.',
      },
      descoberta: '12 unidades são 1 dezena e 2 unidades. O 2 fica nas unidades; a barra vai para as dezenas.',
      esboco: 'O mesmo gesto da unidade 1, agora com sentido: a barra nova é o vai um.',
    },
    {
      tipo: 'ideia',
      texto: 'Fica **2** nas unidades e a barra **vai** para as dezenas: é o **vai um**. Esse 1 vale **10**.',
      fala: 'Fica dois nas unidades e a barra vai para as dezenas: é o vai um. Esse um vale dez.',
      visual: conta({ ...C147, resultado: '2', reservas: { D: '1' }, destaque: 'U' }, 'O 2 se escreve na linha do resultado, embaixo das unidades. Um 1 pequeno, em âmbar, sobe para o alto da coluna D.'),
      esboco: 'Ligar a barra ao 1 pequeno. A palavra do caderno vem no anote: reagrupamento.',
    },
    {
      tipo: 'passo',
      problema: 'Termine: **147 + 85**.',
      fala: 'Termine: cento e quarenta e sete mais oitenta e cinco.',
      visual: conta({ ...C147, resultado: '2', reservas: { D: '1' }, destaque: 'D' }, 'A coluna D acende: o 1 pequeno, o 4 e o 8.'),
      passos: [
        {
          pergunta: 'Dezenas: **1 + 4 + 8** = 13. O que você escreve?',
          fala: 'Dezenas: um mais quatro mais oito é treze. O que você escreve?',
          opcoes: [
            { texto: 'Fica 3, vai 1', certa: true, explica: 'Isso. 13 dezenas são 1 centena e 3 dezenas.', mostra: conta({ ...C147, resultado: '32', reservas: { D: '1', C: '1' }, destaque: 'C' }, 'O 3 se escreve embaixo das dezenas; outro 1 pequeno sobe para a coluna C.') },
            { texto: 'Escrevo 13', erro: 'escreve-numero-inteiro-na-casa', explica: 'Cada casa guarda só um algarismo. 13 dezenas: fica 3, e 10 dezenas viram 1 centena.', mostra: conta({ ...C147, resultado: '32', reservas: { D: '1', C: '1' }, destaque: 'C' }, 'O 13 tenta caber na coluna D e não cabe; o 1 sobe para C.') },
            { texto: 'Fica 2, vai 1', erro: 'esquece-reserva', explica: '4 + 8 = 12, mas tem o 1 que veio das unidades: 13. Fica 3.', mostra: conta({ ...C147, resultado: '32', reservas: { D: '1', C: '1' }, destaque: 'C' }, 'O 1 pequeno da coluna D pisca: ele também conta.') },
          ],
          linha: { tex: '1 + 4 + 8 = 13', fala: 'um mais quatro mais oito é treze' },
        },
        {
          pergunta: 'Centenas: **1 + 1**. Qual é o resultado da conta?',
          fala: 'Centenas: um mais um. Qual é o resultado da conta?',
          opcoes: [
            { texto: '232', certa: true, explica: 'Isso. 147 + 85 = 232. Perto de 150 + 80 = 230: faz sentido.', mostra: conta({ ...C147, resultado: '232', reservas: { D: '1', C: '1' } }, 'O 2 se escreve embaixo das centenas: 232.') },
            { texto: '132', erro: 'esquece-reserva', explica: 'Faltou o 1 que subiu para as centenas: 1 + 1 = 2. Dá 232.', mostra: conta({ ...C147, resultado: '232', reservas: { D: '1', C: '1' } }, 'O 1 pequeno da coluna C pisca e o 2 se escreve.') },
          ],
          linha: { tex: '147 + 85 = 232', fala: 'cento e quarenta e sete mais oitenta e cinco é duzentos e trinta e dois' },
        },
      ],
      esboco: 'O caderno da tela guarda as linhas; a conta armada se completa da direita para a esquerda.',
    },
    {
      tipo: 'anote',
      titulo: 'Reagrupamento (vai um)',
      definicao: 'Na adição armada, some casa com casa a partir das unidades. Se der 10 ou mais, fica a unidade e 1 vai para a casa da esquerda.',
      exemplo: { tex: '147 + 85 = 232', fala: 'cento e quarenta e sete mais oitenta e cinco é duzentos e trinta e dois' },
      alerta: 'Alinhe pela direita: unidade embaixo de unidade. E some o 1 que subiu.',
      esboco: 'A página do caderno com a conta armada inteira, os vai um em outra cor.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém armou **58 + 27** e escreveu **715**. O que aconteceu?',
      fala: 'Alguém armou cinquenta e oito mais vinte e sete e escreveu setecentos e quinze. O que aconteceu?',
      visual: conta({ parcelas: [58, 27], sinal: '+', resultado: '715' }, 'A conta com 715 escrito embaixo: o 15 ocupa duas colunas e o resultado fica maior que as duas parcelas juntas.'),
      opcoes: [
        {
          texto: 'Escreveu o 15 inteiro nas unidades', certa: true,
          explica: 'Isso. 8 + 7 = 15: fica 5, vai 1. Dezenas: 1 + 5 + 2 = 8. O certo é **85**.',
          mostra: conta({ parcelas: [58, 27], sinal: '+', resultado: '85', reservas: { D: '1' } }, 'O 715 se apaga; o 5 fica nas unidades, o 1 sobe e o 8 se escreve: 85.'),
        },
        {
          texto: 'Nada, a conta está certa', erro: 'escreve-numero-inteiro-na-casa',
          explica: '58 + 27 não chega nem a 100: 60 + 30 dá 90. Cada casa guarda um algarismo. O certo é 85.',
          mostra: conta({ parcelas: [58, 27], sinal: '+', resultado: '85', reservas: { D: '1' } }, 'O 715 se apaga; a conta se refaz com o vai um: 85.'),
        },
      ],
      esboco: 'Diagnosticar o erro de outra pessoa é mais leve do que corrigir o próprio, e prepara a aula 5, de conferir.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Arme no caderno e resolva: $368 + 257$.',
      fala: 'Arme no caderno e resolva: trezentos e sessenta e oito mais duzentos e cinquenta e sete.',
      resposta: 625,
      resolucao: [
        { tex: '8 + 7 = 15\\text{: fica 5, vai 1}', fala: 'oito mais sete é quinze, fica cinco e vai um' },
        { tex: '1 + 6 + 5 = 12\\text{: fica 2, vai 1}', fala: 'um mais seis mais cinco é doze, fica dois e vai um' },
        { tex: '1 + 3 + 2 = 6', fala: 'um mais três mais dois é seis' },
        { tex: '368 + 257 = 625', fala: 'trezentos e sessenta e oito mais duzentos e cinquenta e sete é seiscentos e vinte e cinco' },
      ],
      esboco: 'Dois vai um seguidos. A resolução mostra cada casa numa linha.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['armada-soma-n1', 'armada-soma-n2', 'armada-soma-n3'],
      esboco: 'Nível 1: duas casas, um vai um, com a conta armada na tela. Nível 2: três casas, dois vai um. Nível 3: um problema, sem a conta armada.',
    },
    {
      tipo: 'fecho',
      texto: '**147 + 85 = 232**, uma casa de cada vez. Na próxima aula: a **subtração** armada.',
      fala: 'Cento e quarenta e sete mais oitenta e cinco é duzentos e trinta e dois, uma casa de cada vez. Na próxima aula: a subtração armada.',
      visual: conta({ ...C147, resultado: '232', reservas: { D: '1', C: '1' } }, 'A conta do gancho, completa, com os dois vai um em âmbar.'),
      esboco: 'A conta do gancho resolvida. A subtração vem com o caminho inverso: abrir uma barra em 10 cubos.',
    },
  ],
}
