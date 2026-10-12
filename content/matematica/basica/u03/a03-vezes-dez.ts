import type { Aula, Visual } from '@/lib/formation/schema'

// Multiplicar por 10 não é "pôr um zero": é cada unidade virar uma dezena,
// cada dezena virar uma centena. No quadro posicional, todos os algarismos
// andam uma casa para a esquerda, e o zero guarda a casa que ficou vazia
// (a mesma ideia do zero que guarda o lugar, na unidade 1). Por 100, duas
// casas; por 1.000, três. E 8 × 30 é 8 × 3, vezes 10.

const quadro = (numeros: number[], esboco: string, extra: Record<string, unknown> = {}): Visual => ({
  modelo: 'quadro-posicional',
  estado: { numeros, casas: ['M', 'C', 'D', 'U'], blocosVisiveis: false, ...extra },
  esboco,
})
const quadro5 = (numeros: number[], esboco: string): Visual => ({
  modelo: 'quadro-posicional',
  estado: { numeros, casas: ['DM', 'M', 'C', 'D', 'U'], blocosVisiveis: false },
  esboco,
})

export const aula: Aula = {
  id: 'B.U3.A3',
  titulo: 'Multiplicar por 10, 100, 1000',
  objetivo: 'Multiplicar qualquer número natural por 10, 100 e 1.000 movendo os algarismos no quadro posicional, e usar isso para multiplicar por números redondos (8 × 30, 7 × 60).',
  modelo: 'quadro-posicional',
  esboco: 'Primeiro os blocos: 10 sacos de 14 são 10 barras e 40 cubos. Juntando de 10 em 10, cada cubo vira barra e cada barra vira placa: 140. Depois o quadro posicional mostra o mesmo, sem peças: o 1 e o 4 deslizam juntos uma casa para a esquerda e um 0 entra para guardar as unidades. Momento-chave: ver os algarismos andando juntos, e não um zero sendo colado no fim.',
  vega: 'Ideia central: vezes 10, cada algarismo anda uma casa para a esquerda (cada unidade vira dezena, cada dezena vira centena). O zero que aparece guarda a casa das unidades, que ficou vazia. Vezes 100 são duas casas (10 × 10); vezes 1.000, três. Números redondos: 8 × 30 = 8 × 3 × 10 = 240. Erros esperados: somar 10 em vez de multiplicar (36 × 10 → 46), zeros a mais ou a menos (36 × 100 → 360; 50 × 100 → 500, esquecendo o zero que o 50 já tinha), e tratar 30 como 3 (8 × 30 → 24). Guie perguntando "Para que casa o 3 vai?", "Quantas vezes você multiplicou por 10?". A regra "põe zeros" funciona só para números naturais; a ideia das casas que andam serve depois para os decimais (2,5 × 10 = 25). Em Sua vez, não diga o resultado: peça para mover um algarismo de cada vez.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma loja recebe **10 caixas** com **36** parafusos cada. Quantos parafusos? E se fossem **100** caixas?',
      fala: 'Uma loja recebe dez caixas com trinta e seis parafusos cada. Quantos parafusos? E se fossem cem caixas?',
      visual: quadro([36], 'O 36 no quadro de M, C, D, U, com as casas vazias à esquerda.'),
      esboco: 'Dois tamanhos de pedido: 10 e 100 caixas. A segunda pergunta só fecha no final.',
    },
    {
      tipo: 'mexa',
      texto: 'Dez sacos de **14**: são 10 barras e 40 cubos. Junte de 10 em 10.',
      fala: 'Dez sacos de catorze: são dez barras e quarenta cubos. Junte de dez em dez.',
      visual: {
        modelo: 'blocos',
        estado: { centenas: 0, dezenas: 10, unidades: 40, rotulos: { dezenas: '10 × 1', unidades: '10 × 4' } },
        esboco: 'Dez cópias do 14 chegam e se juntam: 10 barras de um lado, 40 cubos do outro. Os cubos têm a borda tracejada.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas peças para juntar 10 numa só.',
        sucesso: { centenas: 1, dezenas: 4, unidades: 0 },
        mostre: 'Os 40 cubos viram 4 barras; depois 10 barras viram 1 placa. Ficam 1 placa e 4 barras: 140.',
      },
      descoberta: 'Os 4 cubos, dez vezes, viraram 4 barras; a barra, dez vezes, virou uma placa. 14 × 10 = 140: cada peça subiu uma ordem.',
      esboco: 'O agrupamento da unidade 1 explica a regra antes de ela existir. As unidades acabam vazias: é de onde vem o zero.',
    },
    {
      tipo: 'ideia',
      texto: '$14 \\times 10 = 140$: o 1 e o 4 **andaram uma casa** para a esquerda. O 0 guarda as unidades vazias.',
      fala: 'Catorze vezes dez é cento e quarenta: o um e o quatro andaram uma casa para a esquerda. O zero guarda as unidades vazias.',
      visual: { ...quadro([14, 140], 'O 14 no quadro. Uma cópia dele desliza uma casa para a esquerda, para a linha de baixo, e um 0 cai na casa das unidades: 140.'), movimento: 'O 1 desliza das dezenas para as centenas e o 4 das unidades para as dezenas, juntos; o 0 aparece por último.' },
      esboco: 'Momento-chave: os algarismos andam juntos. O zero não é colado; ele ocupa a casa que ficou vazia.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Então, quanto é $36 \\times 10$?',
      fala: 'Então, quanto é trinta e seis vezes dez?',
      visual: quadro([36], 'O 36 no quadro, com uma linha vazia embaixo.'),
      opcoes: [
        {
          texto: '360', certa: true,
          explica: 'Isso. O 3 vai para as centenas, o 6 para as dezenas, e o 0 guarda as unidades.',
          mostra: quadro([36, 360], 'O 3 e o 6 deslizam uma casa para a esquerda; o 0 entra: 360.'),
        },
        {
          texto: '46', erro: 'soma-no-lugar-de-multiplicar',
          explica: '46 é $36 + 10$: uma caixa a mais. São 10 caixas de 36: 360.',
          mostra: quadro([36, 360], 'O 46 aparece e some; os algarismos do 36 andam uma casa: 360.'),
        },
        {
          texto: '3.600', erro: 'conta-zeros-errado',
          explica: 'Isso seria $36 \\times 100$. Por 10, cada algarismo anda **uma** casa: 360.',
          mostra: quadro([36, 360], 'O 3 para nas centenas, não nos milhares: 360.'),
        },
      ],
      esboco: 'Metade do gancho respondida. A opção 3.600 já prepara a pergunta seguinte.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E com **100 caixas**? Quanto é $36 \\times 100$?',
      fala: 'E com cem caixas? Quanto é trinta e seis vezes cem?',
      visual: quadro([36, 360], 'O 36 e o 360 no quadro, e uma terceira linha vazia.'),
      opcoes: [
        {
          texto: '3.600', certa: true,
          explica: 'Isso. $100 = 10 \\times 10$: o 36 anda uma casa, e outra. **Duas casas**: 3.600.',
          mostra: quadro([36, 360, 3600], 'O 360 anda mais uma casa: o 3 chega aos milhares. Dois zeros guardam D e U: 3.600.'),
        },
        {
          texto: '360', erro: 'conta-zeros-errado',
          explica: '360 são 10 caixas. Com 100, é 10 vezes mais: anda mais uma casa, 3.600.',
          mostra: quadro([36, 360, 3600], 'O 360 anda mais uma casa para a esquerda: 3.600.'),
        },
        {
          texto: '136', erro: 'soma-no-lugar-de-multiplicar',
          explica: '136 é $36 + 100$. Cem caixas de 36 são muito mais: 3.600.',
          mostra: quadro([36, 360, 3600], 'Os algarismos do 36 andam duas casas: 3.600.'),
        },
      ],
      esboco: 'A escada: ×10, ×10 de novo. Cada degrau é uma casa.',
    },
    {
      tipo: 'passo',
      problema: 'Uma fábrica faz **45 caixas** de **1.000** grampos. Quantos grampos?',
      fala: 'Uma fábrica faz quarenta e cinco caixas de mil grampos. Quantos grampos?',
      visual: quadro5([45], 'O 45 num quadro de cinco casas: DM, M, C, D, U.'),
      passos: [
        {
          pergunta: 'Vezes 1.000: quantas casas cada algarismo anda?',
          fala: 'Vezes mil: quantas casas cada algarismo anda?',
          opcoes: [
            { texto: '3', certa: true, explica: 'Isso. $1.000 = 10 \\times 10 \\times 10$: três vezes uma casa.' },
            { texto: '4', erro: 'conta-zeros-errado', explica: '1.000 tem 4 algarismos, mas só 3 zeros: $10 \\times 10 \\times 10$. Anda 3 casas.' },
            { texto: '1', erro: 'conta-zeros-errado', explica: 'Uma casa é vezes 10. Vezes 1.000 é 10 três vezes: 3 casas.' },
          ],
          linha: { tex: '\\times 1.000\\text{: 3 casas}', fala: 'vezes mil: três casas' },
        },
        {
          pergunta: 'O 4 e o 5 andam 3 casas. Que número fica?',
          fala: 'O quatro e o cinco andam três casas. Que número fica?',
          opcoes: [
            { texto: '45.000', certa: true, explica: 'Isso. O 4 chega às dezenas de milhar, o 5 aos milhares. Três zeros guardam C, D e U.', mostra: quadro5([45, 45000], 'O 4 e o 5 deslizam três casas; três zeros entram: 45.000.') },
            { texto: '4.500', erro: 'conta-zeros-errado', explica: '4.500 é $45 \\times 100$: andou só 2 casas. Com 3 casas: 45.000.', mostra: quadro5([45, 45000], 'O 4 e o 5 andam a terceira casa: 45.000.') },
            { texto: '1.045', erro: 'soma-no-lugar-de-multiplicar', explica: '1.045 é $45 + 1.000$: uma caixa e uns grampos. São 45 caixas de 1.000: 45.000.', mostra: quadro5([45, 45000], 'Os algarismos andam três casas: 45.000.') },
          ],
          linha: { tex: '45 \\times 1.000 = 45.000', fala: 'quarenta e cinco vezes mil é quarenta e cinco mil' },
        },
      ],
      esboco: 'Contar as casas, depois mover. O quadro cresce uma coluna para caber o 4.',
    },
    {
      tipo: 'anote',
      titulo: 'Multiplicar por 10, 100, 1.000',
      definicao: 'Vezes 10, cada algarismo anda uma casa para a esquerda. Vezes 100, duas casas. Vezes 1.000, três.',
      exemplo: { tex: '36 \\times 100 = 3.600', fala: 'trinta e seis vezes cem é três mil e seiscentos' },
      alerta: 'Os zeros que aparecem guardam as casas vazias. Conte as casas, não os algarismos.',
      esboco: 'Na página: o quadro M, C, D, U com 36, 360 e 3.600 em linhas, e setas curvas de uma casa entre eles.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto é $50 \\times 100$?',
      fala: 'Quanto é cinquenta vezes cem?',
      visual: quadro([50], 'O 50 no quadro: o 5 nas dezenas, o 0 nas unidades.'),
      opcoes: [
        {
          texto: '5.000', certa: true,
          explica: 'Isso. O 5 sai das dezenas e anda duas casas, até os milhares: 5.000.',
          mostra: quadro([50, 5000], 'O 5 e o 0 deslizam duas casas juntos; dois zeros novos entram: 5.000.'),
        },
        {
          texto: '500', erro: 'conta-zeros-errado',
          explica: '500 é $5 \\times 100$. O 50 vale 5 **dezenas**: o 5 anda duas casas a partir delas e chega a 5.000.',
          mostra: quadro([50, 5000], 'O 5 começa nas dezenas, não nas unidades; anda duas casas: 5.000.'),
        },
        {
          texto: '50.000', erro: 'conta-zeros-errado',
          explica: 'Isso seria $50 \\times 1.000$. Por 100, duas casas: 5.000.',
          mostra: quadro([50, 5000], 'O 5 para nos milhares: 5.000.'),
        },
      ],
      esboco: 'O caso que pega: o zero que o número já tinha também anda. Quem só "cola dois zeros no 5" erra.',
    },
    {
      tipo: 'ideia',
      texto: 'E $8 \\times 30$? O 30 é $3 \\times 10$. Faça $8 \\times 3 = 24$ e depois vezes 10: **240**.',
      fala: 'E oito vezes trinta? O trinta é três vezes dez. Faça oito vezes três, vinte e quatro, e depois vezes dez: duzentos e quarenta.',
      visual: quadro([24, 240], 'O 24 no quadro; ele anda uma casa e vira 240.'),
      esboco: 'A ponte para as próximas aulas: multiplicar por números redondos é a tabuada mais uma casa.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Uma obra gasta **60 sacos** de cimento por semana. Quantos sacos em **7 semanas**?',
      fala: 'Uma obra gasta sessenta sacos de cimento por semana. Quantos sacos em sete semanas?',
      resposta: 420,
      resolucao: [
        { tex: '7 \\times 6 = 42', fala: 'sete vezes seis é quarenta e dois' },
        { tex: '7 \\times 60 = 420', fala: 'sete vezes sessenta é quatrocentos e vinte' },
      ],
      esboco: 'A tabuada (7 × 6) e depois uma casa. Quem erra para 42 esqueceu que são 6 dezenas.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['vezes-dez-n1', 'vezes-dez-n2', 'vezes-dez-n3'],
      esboco: 'Nível 1: vezes 10, com o quadro na tela. Nível 2: vezes 100 e 1.000, com números que já terminam em zero. Nível 3: números redondos numa situação (7 × 60, 4 × 300).',
    },
    {
      tipo: 'fecho',
      texto: '10 caixas: **360** parafusos. 100 caixas: **3.600**. Na próxima aula: **quebrar** um número para multiplicar.',
      fala: 'Dez caixas: trezentos e sessenta parafusos. Cem caixas: três mil e seiscentos. Na próxima aula: quebrar um número para multiplicar.',
      visual: quadro([36, 360, 3600], 'O 36, o 360 e o 3.600 empilhados no quadro, com a escada de casas.'),
      esboco: 'Responder às duas perguntas do gancho. A próxima aula usa o ×10 para multiplicar números como 6 × 23.',
    },
  ],
}
