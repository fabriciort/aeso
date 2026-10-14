import type { Aula, Visual } from '@/lib/formation/schema'

// A ideia de função. A conta de luz, com números redondos (R$ 0,80 por kWh
// e R$ 15 fixos), vira uma máquina: entra o consumo, a regra trabalha
// (× 0,80 + 15) e sai o valor em reais. O momento-chave é o Mexa
// "alimentar": o aluno põe 0, 100, 200 e 300 kWh, cada saída entra na tabela
// e vira um ponto no plano. Depois: a mesma entrada sempre dá a mesma saída;
// os passos têm ordem; com letras, a regra é y = 0,8x + 15 (a álgebra das
// unidades 14 e 15); e achar o consumo a partir da conta é uma equação.
// Fecha com outra máquina (o quadrado do lado), que também é função, mas
// faz uma curva.

const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })

/** A conta de luz: os eixos de 50 em 50, para caber com a máquina e a tabela no celular. */
const X_KWH = { de: 0, ate: 300, passo: 50, rotulo: 'kWh' }
const Y_RS = { de: 0, ate: 300, passo: 50, rotulo: 'R$' }
const REGRA = '× 0,80 + 15'
const ENTRADAS = [0, 100, 200, 300]
const RETA = { a: 0.8, b: 15, de: 0 }
const luz = (entradas: number[], feitas: number, extra: Record<string, unknown>, esboco: string) =>
  plano({ maquina: { regra: REGRA, entradas, feitas, rotulos: ['kWh', 'R$'] }, x: X_KWH, y: Y_RS, ...extra }, esboco)

/** A conta de R$ 215: a linha tracejada no 215 e, no fim, o ponto achado. */
const LINHA_215 = { a: 0, b: 215, tracejado: true, destaque: 'ambar' }
const volta = (extra: Record<string, unknown>, esboco: string) =>
  luz(ENTRADAS, 4, { retas: [{ ...RETA, rotulo: true }, LINHA_215], ...extra }, esboco)

/** A máquina do quadrado: o lado entra, a área sai. */
const X_LADO = { de: 0, ate: 5, passo: 1, rotulo: 'lado' }
const Y_AREA = { de: 0, ate: 20, passo: 4, rotulo: 'área' }

export const aula: Aula = {
  id: 'B.U18.A5',
  titulo: 'A ideia de função',
  objetivo: 'Ver uma relação como uma máquina de entrada e saída (uma função): aplicar a regra na ordem, montar a tabela e o gráfico, saber que cada entrada dá uma só saída, escrever a regra com letras (y = 0,8x + 15) e achar a entrada a partir da saída com uma equação.',
  modelo: 'plano',
  esboco: 'Abre na conta de luz com números redondos: R$ 0,80 por kWh e R$ 15 fixos. A conta vira uma máquina. Momento-chave: o Mexa "alimentar", em que o aluno põe 0, 100, 200 e 300 kWh; cada valor sai, entra na tabela e vira um ponto no plano, e os pontos se alinham. Depois: a casa vizinha com o mesmo consumo tem a mesma conta; com 150 kWh, a ordem dos passos importa; a regra ganha letras (y = 0,8x + 15) e vira a reta. No passo a passo, a conta de R$ 215 pede o consumo: uma equação, desfeita do fim para o começo. Fecha com a máquina do quadrado, que também é função e faz uma curva.',
  vega: 'Ideia central: uma função é uma regra que, para cada número que entra, dá um só número que sai. A conta de luz é uma: entra o consumo em kWh, sai o valor em reais, pela regra × 0,80 + 15 (valores de exemplo, redondos, não uma tarifa real). Com letras: y = 0,8x + 15, em que x é a entrada e y a saída. Cada par (x, y) é um ponto do plano; aqui eles fazem uma reta que começa em R$ 15 (não é proporcional, como na aula anterior). Achar a entrada a partir da saída é resolver uma equação: 0,8x + 15 = 215, desfazendo do fim para o começo (− 15, depois ÷ 0,8): x = 250. Erros esperados: esquecer a taxa fixa (150 · 0,80 = 120); fazer os passos fora da ordem ((150 + 15) · 0,80 = 132); achar que a mesma entrada pode dar outra saída; pôr a saída na máquina como se fosse a entrada (215 · 0,80 + 15); desfazer com a mesma operação (215 + 15). Guie com "O que entra e o que sai?", "Qual passo a máquina faz primeiro?", "Esse número está em kWh ou em reais?", "Para voltar, qual foi o último passo da ida?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma conta de luz com números redondos: cada **kWh** custa **R$ 0,80**, mais **R$ 15** fixos. Gastando **200 kWh**, quanto vem?',
      fala: 'Uma conta de luz com números redondos: cada quilowatt-hora custa oitenta centavos, mais quinze reais fixos. Gastando duzentos quilowatts-hora, quanto vem?',
      visual: luz(ENTRADAS, 0, {}, 'A máquina, com "× 0,80 + 15" na caixa e kWh e R$ embaixo; a tabela vazia (0, 100, 200, 300 kWh, sem os R$); ao lado, o plano de 0 a 300 nos dois eixos, de 50 em 50.'),
      esboco: 'A pergunta do dia a dia: quanto vem a conta. Os números são de exemplo, redondos.',
    },
    {
      tipo: 'mexa',
      texto: 'A conta é uma máquina: entra o consumo, sai o valor em reais. Ponha os quatro consumos.',
      fala: 'A conta é uma máquina: entra o consumo, sai o valor em reais. Ponha os quatro consumos.',
      visual: luz(ENTRADAS, 0, { ligar: true }, 'A mesma máquina. Cada toque leva o próximo consumo da tabela à máquina; o valor sai, entra na tabela e voa até o plano. Os pontos se ligam em azul.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na máquina para pôr cada consumo.',
        sucesso: { saidas: 4 },
        mostre: 'Os quatro consumos passam pela máquina: R$ 15, R$ 95, R$ 175 e R$ 255.',
      },
      descoberta: 'Cada consumo que entra dá um só valor que sai; os pares viram pontos, e os pontos se alinham.',
      esboco: 'O momento-chave: a regra trabalha sozinha, a tabela se enche e o gráfico aparece. Com 200 kWh, R$ 175.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na casa ao lado, também gastaram **200 kWh**. A conta deles vem de quanto?',
      fala: 'Na casa ao lado, também gastaram duzentos quilowatts-hora. A conta deles vem de quanto?',
      visual: luz(ENTRADAS, 4, { ligar: true }, 'A máquina depois dos quatro consumos: a tabela cheia e os quatro pontos ligados.'),
      opcoes: [
        {
          texto: 'R$ 175, a mesma', certa: true,
          explica: 'Isso. A regra é a mesma: $200 \\cdot 0{,}80 + 15 = 175$. Mesma entrada, mesma saída.',
          fala: 'Isso. A regra é a mesma: duzentos vezes zero vírgula oitenta, mais quinze, cento e setenta e cinco. Mesma entrada, mesma saída.',
          mostra: luz([...ENTRADAS, 200], 5, { ligar: false }, 'O 200 entra de novo na máquina: sai R$ 175, a tabela ganha uma coluna igual e o ponto cai em cima do (200, 175).'),
        },
        {
          texto: 'Pode vir outro valor', erro: 'saida-muda-na-mesma-entrada',
          explica: 'A máquina não muda de uma casa para a outra: entra 200, sai 175, sempre.',
          fala: 'A máquina não muda de uma casa para a outra: entra duzentos, sai cento e setenta e cinco, sempre.',
          mostra: luz([...ENTRADAS, 200], 5, { ligar: false }, 'O 200 passa de novo: R$ 175, e o ponto cai em cima do outro.'),
        },
      ],
      esboco: 'A propriedade que define a função: uma entrada, uma saída só.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E com **150 kWh**? A máquina faz os passos na ordem: primeiro $\\times\\ 0{,}80$, depois $+\\ 15$.',
      fala: 'E com cento e cinquenta quilowatts-hora? A máquina faz os passos na ordem: primeiro vezes zero vírgula oitenta, depois mais quinze.',
      visual: luz(ENTRADAS, 4, {}, 'A máquina com a tabela cheia e os quatro pontos.'),
      opcoes: [
        {
          texto: 'R$ 135', certa: true,
          explica: 'Isso. $150 \\cdot 0{,}80 = 120$, e mais 15: 135.',
          fala: 'Isso. Cento e cinquenta vezes zero vírgula oitenta, cento e vinte, e mais quinze: cento e trinta e cinco.',
          mostra: luz([...ENTRADAS, 150], 5, {}, 'O 150 passa pela máquina: sai R$ 135, a tabela ganha a coluna e o ponto (150, 135) cai entre o 100 e o 200.'),
        },
        {
          texto: 'R$ 132', erro: 'regra-fora-de-ordem',
          explica: 'Somou o 15 antes: $165 \\cdot 0{,}80 = 132$. A taxa fixa entra no fim: $120 + 15 = 135$.',
          fala: 'Somou o quinze antes: cento e sessenta e cinco vezes zero vírgula oitenta, cento e trinta e dois. A taxa fixa entra no fim: cento e vinte mais quinze, cento e trinta e cinco.',
          mostra: luz([...ENTRADAS, 150], 5, {}, 'O 150 passa pela máquina na ordem certa: R$ 135.'),
        },
        {
          texto: 'R$ 120', erro: 'esquece-valor-fixo',
          explica: 'R$ 120 é só a energia. Os R$ 15 fixos entram em toda conta: R$ 135.',
          fala: 'Cento e vinte reais é só a energia. Os quinze reais fixos entram em toda conta: cento e trinta e cinco reais.',
          mostra: luz([...ENTRADAS, 150], 5, {}, 'O 150 passa pela máquina: R$ 135.'),
        },
      ],
      esboco: 'A ordem dos passos e a taxa fixa, os dois erros da conta de ida.',
    },
    {
      tipo: 'ideia',
      texto: 'Com letras: **x** é o que entra, **y** é o que sai. A regra fica $y = 0{,}8x + 15$, e os pontos fazem esta reta.',
      fala: 'Com letras: x é o que entra, y é o que sai. A regra fica y igual a zero vírgula oito x mais quinze, e os pontos fazem esta reta.',
      visual: luz([...ENTRADAS, 150], 5, { retas: [{ ...RETA, rotulo: true }] }, 'A reta azul cresce pelos cinco pontos, com "y = 0,8x + 15" escrito ao lado.'),
      esboco: 'A ponte para a álgebra das unidades 14 e 15: a regra da máquina é uma expressão com x.',
    },
    {
      tipo: 'anote',
      titulo: 'Função',
      definicao: 'Uma **função** é uma regra que, para cada número que entra, dá um só número que sai.',
      exemplo: { tex: 'y = 0{,}8x + 15: \\quad x = 200 \\;\\to\\; y = 175', fala: 'y igual a zero vírgula oito x mais quinze: x igual a duzentos dá y igual a cento e setenta e cinco' },
      alerta: 'A ordem dos passos importa: primeiro × 0,80, depois + 15. E a mesma entrada sempre dá a mesma saída.',
      esboco: 'Na página: a máquina desenhada, a tabela e a regra com letras.',
    },
    {
      tipo: 'passo',
      problema: 'A conta de outro mês veio **R$ 215**. Quantos kWh foram gastos?',
      fala: 'A conta de outro mês veio duzentos e quinze reais. Quantos quilowatts-hora foram gastos?',
      visual: volta({}, 'A reta da conta e uma linha tracejada âmbar na altura do R$ 215. Onde as duas se cruzam está a resposta.'),
      passos: [
        {
          pergunta: 'O que diz "veio R$ 215"?',
          fala: 'O que diz veio duzentos e quinze reais?',
          opcoes: [
            {
              texto: '$0{,}8x + 15 = 215$', certa: true,
              explica: 'Isso. 215 é o que saiu, o y. O x, que entrou, é o que falta.',
              fala: 'Isso. Duzentos e quinze é o que saiu, o y. O x, que entrou, é o que falta.',
              mostra: volta({}, 'A linha tracejada no R$ 215 fica acesa.'),
            },
            {
              texto: '$y = 0{,}8 \\cdot 215 + 15$', erro: 'troca-entrada-e-saida',
              explica: 'Isso põe 215 kWh na máquina. Mas 215 está em reais: é o que saiu.',
              fala: 'Isso põe duzentos e quinze quilowatts-hora na máquina. Mas duzentos e quinze está em reais: é o que saiu.',
            },
          ],
          linha: { tex: '0{,}8x + 15 = 215', fala: 'zero vírgula oito x mais quinze igual a duzentos e quinze' },
        },
        {
          pergunta: 'Desfaça o último passo, o $+\\ 15$.',
          fala: 'Desfaça o último passo, o mais quinze.',
          opcoes: [
            {
              texto: '$0{,}8x = 200$', certa: true,
              explica: 'Isso. Tirando 15 dos dois lados, sobra $0{,}8x = 200$.',
              fala: 'Isso. Tirando quinze dos dois lados, sobra zero vírgula oito x igual a duzentos.',
              mostra: volta({}, 'A linha tracejada continua no R$ 215.'),
            },
            {
              texto: '$0{,}8x = 230$', erro: 'desfaz-com-a-mesma-operacao',
              explica: 'Somar 15 de novo não desfaz o + 15. O contrário do + é o −: $215 - 15 = 200$.',
              fala: 'Somar quinze de novo não desfaz o mais quinze. O contrário do mais é o menos: duzentos e quinze menos quinze, duzentos.',
            },
          ],
          linha: { tex: '0{,}8x = 200', fala: 'zero vírgula oito x igual a duzentos' },
        },
        {
          pergunta: 'Agora desfaça o $\\times\\ 0{,}80$.',
          fala: 'Agora desfaça o vezes zero vírgula oitenta.',
          opcoes: [
            {
              texto: '$x = 200 \\div 0{,}8 = 250$', certa: true,
              explica: 'Isso. 250 kWh. Confira na máquina: $250 \\cdot 0{,}80 + 15 = 215$.',
              fala: 'Isso. Duzentos e cinquenta quilowatts-hora. Confira na máquina: duzentos e cinquenta vezes zero vírgula oitenta, mais quinze, duzentos e quinze.',
              mostra: volta({ pontos: { P: [250, 215] }, coordenadas: ['P'], nomes: { P: '' }, posRotulos: { P: 'abaixo' } }, 'No cruzamento da reta com a linha tracejada, o ponto âmbar com (250, 215) escrito embaixo.'),
            },
            {
              texto: '$x = 200 \\cdot 0{,}8 = 160$', erro: 'desfaz-com-a-mesma-operacao',
              explica: 'Multiplicar de novo não desfaz o vezes. O contrário é dividir: $200 \\div 0{,}8 = 250$.',
              fala: 'Multiplicar de novo não desfaz o vezes. O contrário é dividir: duzentos dividido por zero vírgula oito, duzentos e cinquenta.',
            },
          ],
          linha: { tex: 'x = 250 \\text{ kWh}', fala: 'x igual a duzentos e cinquenta quilowatts-hora' },
        },
      ],
      esboco: 'Achar a entrada pela saída é uma equação da unidade 15: desfazer do fim para o começo. No gráfico, é ler o x onde a reta cruza a altura do 215.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: com a mesma regra, uma conta veio **R$ 63**. Quantos kWh foram gastos?',
      fala: 'No papel: com a mesma regra, uma conta veio sessenta e três reais. Quantos quilowatts-hora foram gastos?',
      resposta: 60,
      resolucao: [
        { tex: '0{,}8x + 15 = 63', fala: 'zero vírgula oito x mais quinze igual a sessenta e três' },
        { tex: '0{,}8x = 48', fala: 'zero vírgula oito x igual a quarenta e oito' },
        { tex: 'x = 48 \\div 0{,}8 = 60', fala: 'x igual a quarenta e oito dividido por zero vírgula oito, sessenta' },
        { tex: '\\text{confira: } 60 \\cdot 0{,}80 + 15 = 63', fala: 'confira: sessenta vezes zero vírgula oitenta, mais quinze, sessenta e três' },
      ],
      esboco: 'A volta inteira, sozinho, com a conferência na máquina.',
    },
    {
      tipo: 'mexa',
      texto: 'Outra máquina: ela eleva ao quadrado, como a área do quadrado pelo lado. Ponha os lados de 0 a 4.',
      fala: 'Outra máquina: ela eleva ao quadrado, como a área do quadrado pelo lado. Ponha os lados de zero a quatro.',
      visual: plano({ maquina: { regra: 'lado × lado', saidas: [0, 1, 4, 9, 16], entradas: [0, 1, 2, 3, 4], rotulos: ['lado', 'área'] }, x: X_LADO, y: Y_AREA, ligar: true }, 'A máquina com "lado × lado" na caixa (o "²" sozinho fica miúdo na caixa); a tabela com os lados 0 a 4; o plano com o lado de 0 a 5 e a área de 0 a 20. Os pontos se ligam e fazem uma curva.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na máquina para pôr cada lado.',
        sucesso: { saidas: 5 },
        mostre: 'Os cinco lados passam: as áreas 0, 1, 4, 9 e 16 saem e viram pontos numa curva.',
      },
      descoberta: 'Também é uma função: cada lado dá uma só área. Mas os pontos fazem uma curva, não uma reta.',
      esboco: 'Nem toda função é uma reta. A área do quadrado da aula anterior, agora como máquina.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['funcao-n1', 'funcao-n2', 'funcao-n3'],
      esboco: 'Nível 1: a máquina na tela, com uma regra de dois passos inteiros; o aluno diz o que sai. Nível 2: a regra com letras (y = ax − b ou y = ax + b), com saídas que podem ser negativas. Nível 3: a conta de luz e a corrida, de ida e de volta (da conta ao consumo, do preço aos km).',
    },
    {
      tipo: 'fecho',
      texto: 'Com **200 kWh**, a conta vem **R$ 175**. Uma regra que dá uma saída só para cada entrada: isso é uma **função**.',
      fala: 'Com duzentos quilowatts-hora, a conta vem cento e setenta e cinco reais. Uma regra que dá uma saída só para cada entrada: isso é uma função.',
      visual: luz(ENTRADAS, 4, { retas: [{ ...RETA, rotulo: true }], pontos: { C: [200, 175] }, nomes: { C: '' }, coordenadas: ['C'], guias: ['C'] }, 'Volta a máquina da conta de luz, com a reta e o ponto (200, 175) aceso, com os tracejados até os eixos.'),
      esboco: 'Responde ao gancho e dá o nome que a próxima etapa da formação vai usar.',
    },
  ],
}
