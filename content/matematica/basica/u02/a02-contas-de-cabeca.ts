import type { Aula, Visual } from '@/lib/formation/schema'

// Conta de cabeça sem decorar truque: a reta mostra que é mais fácil passar
// por uma dezena redonda. Somar: completar a dezena e somar o resto.
// Subtrair: descer até a dezena redonda e tirar o resto. Decompor: dezenas
// com dezenas, unidades com unidades.

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const R38 = { de: 30, ate: 70, passo: 1, marcas: [30, 40, 50, 60, 70] }

export const aula: Aula = {
  id: 'B.U2.A2',
  titulo: 'Contas de cabeça',
  objetivo: 'Somar e subtrair de cabeça números até 100 passando pela dezena redonda (completar a dezena, descer até a dezena) e decompondo em dezenas e unidades.',
  modelo: 'reta',
  esboco: 'A reta numérica vira o rascunho da cabeça. Cada conta é um caminho de saltos: um salto curto até a dezena redonda, depois o resto. O aluno vê que 38 + 25 fica fácil quando o 25 se divide em 2 e 23. Na subtração, o caminho anda para trás: 63 − 8 desce 3 até 60, depois mais 5. Momento-chave: perceber que os saltos curtos até a dezena redonda são a "ponte" que deixa qualquer conta leve.',
  vega: 'Ideia central: passar pela dezena redonda. Para somar, complete a dezena (38 + 2 = 40) e some o que sobrou do outro número (40 + 23 = 63). Para subtrair, desça até a dezena redonda (63 − 3 = 60) e tire o resto (60 − 5 = 55). Outra estratégia: decompor (46 + 32 = 70 + 8). Erros esperados: esquecer o resto depois de chegar à dezena (38 + 25 → 60 ou 65), esquecer a dezena que passou (38 + 25 → 53), e na subtração tirar o menor do maior em cada casa (63 − 8 → 65). Guie perguntando "Quanto falta para a dezena redonda?", "Quanto sobrou do outro número?". Não exija uma estratégia só: qualquer caminho de saltos que chegue certo vale. Em Sua vez, não diga o resultado: peça o primeiro salto.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'No mercado: **R$ 38** de carne e **R$ 25** de arroz. Dá para somar de cabeça, sem papel?',
      fala: 'No mercado: trinta e oito reais de carne e vinte e cinco de arroz. Dá para somar de cabeça, sem papel?',
      visual: reta({ ...R38, numeros: [38], unidade: 'R$' }, 'A reta de 30 a 70 com o 38 aceso. O 25 aparece como uma etiqueta ao lado, esperando para ser somado.'),
      esboco: 'Uma conta que pede cabeça, não papel: está na fila do caixa. A reta é o papel da cabeça.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Para somar 25 a **38**, qual é o primeiro salto mais fácil?',
      fala: 'Para somar vinte e cinco a trinta e oito, qual é o primeiro salto mais fácil?',
      visual: reta({ ...R38, numeros: [38] }, 'O 38 aceso, a dois passos do 40. O 40 brilha de leve como dezena redonda.'),
      opcoes: [
        {
          texto: '+2, até o 40', certa: true,
          explica: 'Isso. De 38 até 40 faltam 2. Na dezena redonda, o resto fica fácil.',
          mostra: reta({ ...R38, numeros: [38], saltos: [[38, 40, '+2']] }, 'Um salto curto, de 38 a 40, com +2 em âmbar.'),
        },
        {
          texto: '+5, até o 43',
          explica: 'Dá, mas 43 não ajuda. O salto que ajuda é até a dezena redonda: +2, até 40.',
          mostra: reta({ ...R38, numeros: [38, 43], saltos: [[38, 40, '+2']] }, 'O 43 acende e apaga; o salto até 40 aparece no lugar.'),
        },
        {
          texto: '+25 de uma vez',
          explica: 'De uma vez é difícil de ver. Divida: +2 até 40, e depois o que sobrou do 25.',
          mostra: reta({ ...R38, numeros: [38], saltos: [[38, 40, '+2']] }, 'O salto longo some; aparece o salto curto até 40.'),
        },
      ],
      esboco: 'Deixar o aluno descobrir que a dezena redonda é o lugar bom para parar, antes de dar nome à estratégia.',
    },
    {
      tipo: 'passo',
      problema: 'Some de cabeça: **38 + 25**.',
      fala: 'Some de cabeça: trinta e oito mais vinte e cinco.',
      visual: reta({ ...R38, numeros: [38] }, 'A reta do gancho. Cada passo acertado desenha um salto e escreve uma linha.'),
      passos: [
        {
          pergunta: 'De 38 até 40, quanto sai do 25?',
          opcoes: [
            { texto: '2', certa: true, explica: 'Isso. 38 + 2 = 40.', mostra: reta({ ...R38, numeros: [38], saltos: [[38, 40, '+2']] }, 'O salto de 38 a 40.') },
            { texto: '10', explica: 'De 38 até 40 são só 2 passos: 39, 40.', mostra: reta({ ...R38, numeros: [38], saltos: [[38, 40, '+2']] }, 'Dois pulinhos de 1, de 38 a 40.') },
          ],
          linha: { tex: '38 + 2 = 40', fala: 'trinta e oito mais dois é quarenta' },
        },
        {
          pergunta: 'Do 25 você já usou 2. Quanto sobra?',
          opcoes: [
            { texto: '23', certa: true, explica: 'Isso. 25 − 2 = 23.' },
            { texto: '25', erro: 'perde-o-resto', explica: 'Os 2 já foram usados no primeiro salto. Do 25 sobram 23.' },
            { texto: '27', erro: 'operacao-trocada', explica: 'Você somou os 2. Eles saíram do 25: sobram 23.' },
          ],
          linha: { tex: '25 = 2 + 23', fala: 'vinte e cinco é dois mais vinte e três' },
        },
        {
          pergunta: 'Agora: **40 + 23**.',
          opcoes: [
            { texto: '63', certa: true, explica: 'Isso. Na dezena redonda é fácil: 4 dezenas e 2 dezenas dão 6, e mais 3.', mostra: reta({ ...R38, numeros: [38, 63], saltos: [[38, 40, '+2'], [40, 63, '+23']] }, 'O segundo salto, de 40 a 63.') },
            { texto: '53', erro: 'esquece-reserva', explica: '40 + 20 dá 60, não 50. E mais 3: 63.', mostra: reta({ ...R38, numeros: [38, 63], saltos: [[38, 40, '+2'], [40, 63, '+23']] }, 'O salto de 40 a 63 passa por 50 e 60.') },
          ],
          linha: { tex: '38 + 25 = 63', fala: 'trinta e oito mais vinte e cinco é sessenta e três' },
        },
      ],
      esboco: 'A estratégia inteira em três escolhas. O caderno da tela guarda o caminho.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora **47 + 5**. Toque na dezena redonda para onde vale saltar primeiro.',
      fala: 'Agora quarenta e sete mais cinco. Toque na dezena redonda para onde vale saltar primeiro.',
      visual: reta({ de: 40, ate: 50, passo: 1, marcas: [40, 47, 50], escolhas: [40, 50] }, 'A reta de 40 a 50 com o 47 aceso. As marcas 40 e 50 ficam tocáveis.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque numa das duas marcas.',
        sucesso: { vizinho: 50 },
        mostre: 'Um salto de +3 sai do 47 e pousa no 50; depois, +2 até 52.',
      },
      descoberta: 'Somar anda para a frente: a dezena redonda que ajuda é a de cima. 47 + 3 = 50, e sobram 2: 52.',
      esboco: 'Tocar a dezena da frente fixa a direção da soma. Se tocar 40, o palco mostra que a soma anda para a direita.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E para trás? Quanto é **63 − 8**?',
      fala: 'E para trás? Quanto é sessenta e três menos oito?',
      visual: reta({ de: 50, ate: 70, passo: 1, marcas: [50, 55, 60, 63, 70], numeros: [63] }, 'A reta de 50 a 70 com o 63 aceso. O 60, logo atrás, brilha de leve.'),
      opcoes: [
        {
          texto: '55', certa: true,
          explica: 'Isso. Desce 3 até 60; dos 8 faltam 5; 60 − 5 = 55.',
          mostra: reta({ de: 50, ate: 70, passo: 1, marcas: [50, 55, 60, 63, 70], numeros: [63, 55], saltos: [[63, 60, '−3'], [60, 55, '−5']] }, 'Dois saltos para trás: −3 até 60, −5 até 55.'),
        },
        {
          texto: '65', erro: 'subtrai-menor-do-maior',
          explica: 'Fazer 8 − 3 inverte a conta. São 3 que tiram 8: desça 3 até 60, depois mais 5. Dá 55.',
          mostra: reta({ de: 50, ate: 70, passo: 1, marcas: [50, 55, 60, 63, 70], numeros: [63, 55], saltos: [[63, 60, '−3'], [60, 55, '−5']] }, 'O 65 acende à direita do 63, onde a subtração não pode chegar; depois os saltos para trás.'),
        },
        {
          texto: '71', erro: 'operacao-trocada',
          explica: 'O sinal é de menos: a conta anda para trás. Desça 3 até 60, depois mais 5: 55.',
          mostra: reta({ de: 50, ate: 70, passo: 1, marcas: [50, 55, 60, 63, 70], numeros: [63, 55], saltos: [[63, 60, '−3'], [60, 55, '−5']] }, 'Os saltos para trás aparecem, da direita para a esquerda.'),
        },
      ],
      esboco: 'A mesma ponte, agora para trás. Os saltos com sinal de menos mostram a direção.',
    },
    {
      tipo: 'ideia',
      texto: 'Outro caminho: **decompor**. $46 + 32$ é $40 + 30 = 70$ e $6 + 2 = 8$. Juntos, **78**.',
      fala: 'Outro caminho: decompor. Quarenta e seis mais trinta e dois é quarenta mais trinta, setenta, e seis mais dois, oito. Juntos, setenta e oito.',
      visual: { modelo: 'blocos', estado: { centenas: 0, dezenas: 7, unidades: 8, rotulos: { dezenas: '4 + 3', unidades: '6 + 2' }, total: 78 }, esboco: 'Barras com barras, cubos com cubos: 4 + 3 barras e 6 + 2 cubos. O total 78 aparece embaixo.' },
      esboco: 'Quando as unidades não passam de 10, decompor é o mais rápido. Os blocos mostram por que funciona.',
    },
    {
      tipo: 'anote',
      titulo: 'Completar a dezena',
      definicao: 'Para somar de cabeça, leve um número até a dezena redonda e some o que sobrou do outro.',
      exemplo: { tex: '38 + 25 = 38 + 2 + 23 = 40 + 23 = 63', fala: 'trinta e oito mais vinte e cinco é trinta e oito mais dois mais vinte e três, quarenta mais vinte e três, sessenta e três' },
      alerta: 'Depois de chegar à dezena, não esqueça o resto do outro número.',
      esboco: 'A estratégia principal, com o exemplo do gancho. Na subtração, a mesma ideia vale para trás.',
    },
    {
      tipo: 'caderno',
      instrucao: 'De cabeça, e anote só os saltos: $57 + 26$.',
      fala: 'De cabeça, e anote só os saltos: cinquenta e sete mais vinte e seis.',
      resposta: 83,
      resolucao: [
        { tex: '57 + 3 = 60', fala: 'cinquenta e sete mais três é sessenta' },
        { tex: '26 - 3 = 23', fala: 'vinte e seis menos três é vinte e três' },
        { tex: '60 + 23 = 83', fala: 'sessenta mais vinte e três é oitenta e três' },
      ],
      esboco: 'Anotar só os saltos treina a cabeça e deixa rastro para conferir.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['cabeca-n1', 'cabeca-n2', 'cabeca-n3'],
      esboco: 'Nível 1: somar um número de um algarismo, com a reta. Nível 2: somar ou subtrair, sem reta. Nível 3: a conta do mercado.',
    },
    {
      tipo: 'fecho',
      texto: 'Dá **R$ 63**, e sem papel. Na próxima aula: a **conta armada**, para números maiores.',
      fala: 'Dá sessenta e três reais, e sem papel. Na próxima aula: a conta armada, para números maiores.',
      visual: reta({ ...R38, numeros: [38, 63], saltos: [[38, 40, '+2'], [40, 63, '+23']], unidade: 'R$' }, 'A reta do gancho com os dois saltos e o 63 aceso.'),
      esboco: 'Responder ao gancho e mostrar o limite da cabeça: para 147 + 85, o papel ajuda.',
    },
  ],
}
