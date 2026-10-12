import type { Aula, Visual } from '@/lib/formation/schema'

// Fechar a unidade com o hábito que protege todas as contas: estimar antes
// (o tamanho do resultado faz sentido?) e desfazer depois (a operação
// inversa volta ao começo?). Conferir não é refazer a mesma conta.

type Conta = { parcelas: number[]; sinal: '+' | '−'; resultado?: string; reservas?: Record<string, string>; destaque?: string }
const conta = (c: Conta, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { conta: c }, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })
const R84 = { de: 50, ate: 90, passo: 1, marcas: [50, 55, 60, 70, 80, 84, 90] }

export const aula: Aula = {
  id: 'B.U2.A5',
  titulo: 'Conferir',
  objetivo: 'Conferir adições e subtrações de duas formas: estimando o tamanho do resultado e usando a operação inversa; achar e corrigir o erro de uma conta.',
  modelo: 'reta',
  esboco: 'Uma conta errada abre a aula, e o aluno vira o revisor. Primeiro a estimativa, com a reta da U1: 298 + 413 tem de ficar perto de 700, então 1.711 não pode estar certo. Depois a inversa: na reta, voltar 29 a partir de 84 cai em 55; andar 29 a partir de 55 volta ao 84. Momento-chave: ver o salto de ida e o de volta na mesma reta e entender que somar desfaz subtrair.',
  vega: 'Ideia central: conferir de duas formas. Estimar: arredonde cada número (dezena ou centena) e veja se o resultado tem o tamanho certo; isso pega erros grandes, de casa ou de vai um nas centenas. Desfazer: na subtração, resultado + parte tirada = número de cima; na adição, resultado − uma parcela = a outra. Erros esperados: conferir com a conta errada (84 − 29 = 55 conferido com 84 + 29), estimar com uma casa a mais ou a menos (700 vira 7.000) e repetir a mesma conta, que repete o mesmo erro. Guie perguntando "Perto de quanto deveria dar?", "Que conta desfaz esta?". A estimativa não prova que está certo: só mostra que está longe. Em Sua vez, não diga se a conta confere: peça a inversa.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Alguém fez **298 + 413** e achou **1.711**. Dá para desconfiar sem refazer a conta?',
      fala: 'Alguém fez duzentos e noventa e oito mais quatrocentos e treze e achou mil setecentos e onze. Dá para desconfiar sem refazer a conta?',
      visual: conta({ parcelas: [298, 413], sinal: '+', resultado: '1711' }, 'A conta armada com 1.711 escrito embaixo, numa letra um pouco tremida: é o caderno de outra pessoa.'),
      esboco: 'O aluno começa como revisor de uma conta alheia. Errar ali não pesa, e o olhar crítico se forma.',
    },
    {
      tipo: 'aposta',
      pergunta: '298 é quase **300** e 413 é quase **400**. A soma fica perto de quanto?',
      fala: 'Duzentos e noventa e oito é quase trezentos e quatrocentos e treze é quase quatrocentos. A soma fica perto de quanto?',
      visual: reta({ de: 0, ate: 800, passo: 100, marcas: [0, 400, 800], numeros: [298, 413] }, 'A reta de 0 a 800, de 100 em 100. Os dois números aparecem perto das suas centenas.'),
      opcoes: [
        {
          texto: '700', certa: true,
          explica: 'Isso. 300 + 400 = 700. O resultado tem de ficar perto de 700, e 1.711 está longe demais.',
          mostra: reta({ de: 0, ate: 2000, passo: 100, marcas: [0, 1000, 2000], numeros: [700, 1711] }, 'A reta se alarga até 2.000. O 700 acende; o 1.711 aparece muito à direita, em vermelho.'),
        },
        {
          texto: '7.000', erro: 'estimativa-ordem-errada',
          explica: 'Os dois números são centenas: 3 centenas e 4 centenas dão 7 centenas, 700. Não 7.000.',
          mostra: reta({ de: 0, ate: 2000, passo: 100, marcas: [0, 1000, 2000], numeros: [700, 1711] }, 'O 700 acende; 7.000 nem cabe na reta.'),
        },
        {
          texto: '70', erro: 'estimativa-ordem-errada',
          explica: 'Só o 298 já passa de 70. Somando 300 e 400, dá 700.',
          mostra: reta({ de: 0, ate: 2000, passo: 100, marcas: [0, 1000, 2000], numeros: [700, 1711] }, 'O 700 acende longe do zero.'),
        },
      ],
      esboco: 'A estimativa da U1.A5 ganha uma função: ver se o resultado tem o tamanho certo.',
    },
    {
      tipo: 'ideia',
      texto: '**Estimar** mostra se o resultado tem o tamanho certo. A conta certa dá **711**, perto de 700.',
      fala: 'Estimar mostra se o resultado tem o tamanho certo. A conta certa dá setecentos e onze, perto de setecentos.',
      visual: conta({ parcelas: [298, 413], sinal: '+', resultado: '711', reservas: { D: '1', C: '1' } }, 'O 1.711 se apaga; a conta se refaz com os dois vai um e chega a 711.'),
      esboco: 'A estimativa achou o erro; a conta armada da aula 3 corrige.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Outra conta: **84 − 29 = 55**. Qual conta desfaz esta e confere?',
      fala: 'Outra conta: oitenta e quatro menos vinte e nove é cinquenta e cinco. Qual conta desfaz esta e confere?',
      visual: reta({ ...R84, numeros: [84, 55], saltos: [[84, 55, '−29']] }, 'Um salto para trás, de 84 até 55, com −29.'),
      opcoes: [
        {
          texto: '55 + 29 = 84?', certa: true,
          explica: 'Isso. A subtração voltou 29. Para desfazer, saia do 55 e ande 29 para a frente.',
          mostra: reta({ ...R84, numeros: [84, 55], saltos: [[84, 55, '−29'], [55, 84, '+29']] }, 'O salto de volta, de 55 a 84, com +29, por baixo do primeiro.'),
        },
        {
          texto: '84 + 29 = 55?', erro: 'inversa-errada',
          explica: '84 + 29 passa de 100. Para desfazer, comece do 55 e devolva os 29 que saíram.',
          mostra: reta({ ...R84, numeros: [84, 55], saltos: [[84, 55, '−29'], [55, 84, '+29']] }, 'O salto de volta sai do 55, não do 84.'),
        },
        {
          texto: '55 − 29 = 84?', erro: 'inversa-errada',
          explica: 'Tirar mais de 55 anda para trás, para longe do 84. O que desfaz é somar: 55 + 29.',
          mostra: reta({ ...R84, numeros: [84, 55], saltos: [[84, 55, '−29'], [55, 84, '+29']] }, 'O salto de volta vai para a direita, até o 84.'),
        },
      ],
      esboco: 'A reta torna a inversa visível: o salto de volta tem o mesmo tamanho, na direção contrária.',
    },
    {
      tipo: 'mexa',
      texto: 'Confira nos blocos: **55 + 29**. Junte 10 cubos numa barra.',
      fala: 'Confira nos blocos: cinquenta e cinco mais vinte e nove. Junte dez cubos numa barra.',
      visual: blocos({ centenas: 0, dezenas: 7, unidades: 14, rotulos: { dezenas: '5 + 2', unidades: '5 + 9' } }, 'As barras e os cubos do 55 e do 29 já juntos: 7 barras e 14 cubos, com a borda tracejada nos cubos.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos cubos.',
        sucesso: { dezenas: 8, unidades: 4 },
        mostre: 'Dez cubos viram uma barra: ficam 8 barras e 4 cubos, 84.',
      },
      descoberta: '55 + 29 = 84: a volta chegou ao começo. Então 84 − 29 = 55 está certa.',
      esboco: 'A conferência com as mãos. O 84 aparece como prova, não como resposta nova.',
    },
    {
      tipo: 'ideia',
      texto: 'Somar e subtrair são **operações inversas**: uma desfaz a outra. Se $84 - 29 = 55$, então $55 + 29 = 84$.',
      fala: 'Somar e subtrair são operações inversas: uma desfaz a outra. Se oitenta e quatro menos vinte e nove é cinquenta e cinco, então cinquenta e cinco mais vinte e nove é oitenta e quatro.',
      visual: reta({ ...R84, numeros: [84, 55], saltos: [[84, 55, '−29'], [55, 84, '+29']] }, 'Os dois saltos, de ida e de volta, na mesma reta.'),
      esboco: 'Dar o nome depois do gesto. A imagem da ida e volta é a definição.',
    },
    {
      tipo: 'anote',
      titulo: 'Conferir uma conta',
      definicao: 'Para conferir, estime o tamanho do resultado e desfaça a conta: a subtração se confere somando, a adição subtraindo.',
      exemplo: { tex: '84 - 29 = 55 \\text{ pois } 55 + 29 = 84', fala: 'oitenta e quatro menos vinte e nove é cinquenta e cinco, pois cinquenta e cinco mais vinte e nove é oitenta e quatro' },
      alerta: 'Repetir a mesma conta pode repetir o mesmo erro. Desfaça.',
      esboco: 'A página do caderno com as duas formas de conferir.',
    },
    {
      tipo: 'passo',
      problema: 'Confira: **603 − 247 = 356**.',
      fala: 'Confira: seiscentos e três menos duzentos e quarenta e sete é trezentos e cinquenta e seis.',
      visual: conta({ parcelas: [603, 247], sinal: '−', resultado: '356' }, 'A subtração armada com o 356 escrito, à espera de conferência.'),
      passos: [
        {
          pergunta: 'Que conta desfaz esta?',
          opcoes: [
            { texto: '356 + 247', certa: true, explica: 'Isso. O que sobrou mais o que saiu tem de dar 603.', mostra: conta({ parcelas: [356, 247], sinal: '+' }, 'A conta de conferir se arma ao lado: 356 + 247.') },
            { texto: '603 + 247', erro: 'inversa-errada', explica: 'Para desfazer, parta do que sobrou: 356 + 247 tem de dar 603.', mostra: conta({ parcelas: [356, 247], sinal: '+' }, 'A conta de conferir se arma com o 356 em cima.') },
          ],
          linha: { tex: '356 + 247 = \\text{?}', fala: 'trezentos e cinquenta e seis mais duzentos e quarenta e sete é quanto?' },
        },
        {
          pergunta: 'Quanto dá **356 + 247**?',
          fala: 'Quanto dá trezentos e cinquenta e seis mais duzentos e quarenta e sete?',
          opcoes: [
            { texto: '603', certa: true, explica: 'Isso. 6 + 7 = 13, vai 1; 1 + 5 + 4 = 10, vai 1; 1 + 3 + 2 = 6.', mostra: conta({ parcelas: [356, 247], sinal: '+', resultado: '603', reservas: { D: '1', C: '1' } }, 'O 603 se escreve com dois vai um.') },
            { texto: '593', erro: 'esquece-reserva', explica: 'Faltaram os vai um: 6 + 7 = 13, vai 1; 1 + 5 + 4 = 10, vai 1. Dá 603.', mostra: conta({ parcelas: [356, 247], sinal: '+', resultado: '603', reservas: { D: '1', C: '1' } }, 'Os dois vai um piscam em âmbar.') },
          ],
          linha: { tex: '356 + 247 = 603', fala: 'trezentos e cinquenta e seis mais duzentos e quarenta e sete é seiscentos e três' },
        },
        {
          pergunta: 'Voltou ao 603. E a conta?',
          opcoes: [
            { texto: 'Está certa', certa: true, explica: 'Isso. A volta chegou ao começo: $603 - 247 = 356$ confere.' },
            { texto: 'Ainda não dá para saber', explica: 'Dá: a inversa voltou exatamente ao 603. A conta confere.' },
          ],
          linha: { tex: '603 - 247 = 356\\text{: confere}', fala: 'seiscentos e três menos duzentos e quarenta e sete é trezentos e cinquenta e seis, confere' },
        },
      ],
      esboco: 'Conferir de ponta a ponta, com uma subtração que tem zero no meio, como na aula 4.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Alguém fez $472 + 389$ e achou **851**. Confira no caderno. Qual é o resultado certo?',
      fala: 'Alguém fez quatrocentos e setenta e dois mais trezentos e oitenta e nove e achou oitocentos e cinquenta e um. Confira no caderno. Qual é o resultado certo?',
      resposta: 861,
      resolucao: [
        { tex: '851 - 389 = 462 \\ne 472', fala: 'oitocentos e cinquenta e um menos trezentos e oitenta e nove é quatrocentos e sessenta e dois, diferente de quatrocentos e setenta e dois' },
        { tex: '2 + 9 = 11\\text{: fica 1, vai 1}', fala: 'dois mais nove é onze, fica um e vai um' },
        { tex: '1 + 7 + 8 = 16\\text{: fica 6, vai 1}', fala: 'um mais sete mais oito é dezesseis, fica seis e vai um' },
        { tex: '1 + 4 + 3 = 8\\text{: } 861', fala: 'um mais quatro mais três é oito: oitocentos e sessenta e um' },
      ],
      esboco: 'A inversa mostra que tem erro; a conta armada refeita acha onde: o vai um das unidades ficou para trás.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['conferir-n1', 'conferir-n2', 'conferir-n3'],
      esboco: 'Nível 1: estimar uma soma. Nível 2: escolher a conta que confere. Nível 3: achar o resultado certo de uma conta errada.',
    },
    {
      tipo: 'fecho',
      texto: '1.711 estava errado: dá **711**. Unidade 2 completa! Próxima parada: **multiplicar**.',
      fala: 'Mil setecentos e onze estava errado: dá setecentos e onze. Unidade dois completa! Próxima parada: multiplicar.',
      visual: { modelo: 'livre', estado: { jornada: ['Contar', 'Somar e subtrair', 'Multiplicar e dividir', 'Frações', 'Porcentagem', 'Equações', 'Funções', 'Cálculo'], aqui: 2, feitas: 2 }, esboco: 'A jornada da primeira aula volta. Contar e Somar e subtrair aparecem como feitas; a luz desce para Multiplicar e dividir.' },
      esboco: 'Fechar a unidade com o caminho: duas paradas feitas. O aluno vê o progresso na formação, não só na aula.',
    },
  ],
}
