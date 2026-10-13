import type { Aula, Visual } from '@/lib/formation/schema'

// Os números racionais. Frações e decimais também têm o seu oposto: −1/2
// fica no meio entre −1 e 0, −3/4 = −0,75 a três quartos do caminho. Do
// lado negativo, quem está mais longe do zero é menor: −0,5 < −0,25. Entre
// −1 e 0 cabem infinitos números (entre dois, sempre cabe o do meio), e as
// frações e os decimais dos dois lados estão por toda a reta: são os
// números racionais. Uma fração é uma divisão, então o menos pode ir na
// frente, em cima ou embaixo (−3/4 = (−3)/4 = 3/(−4)); com menos em cima e
// embaixo, o número é positivo. Fecha a unidade com contas de decimais
// negativos: a temperatura que passa do zero e o extrato do banco.

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { sinais: true, ...estado }, esboco })
const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })

const TERMOMETRO = reta({ de: -3, ate: 3, passo: 0.5, marcas: [-3, -2, -1, 0, 1, 2, 3], numeros: [1.5] }, 'A reta de −3 a 3 em pé de termômetro, deitada: azul abaixo de zero, âmbar acima. Um ponto âmbar no 1,5.')
const QUEDA = reta(
  { de: -3, ate: 3, passo: 0.5, marcas: [-3, -2, -1, 0, 1, 2, 3], saltos: [[1.5, 0, '−1,5'], [0, -1, '−1']] },
  'A mesma reta. Um arco do 1,5 até o 0 ("−1,5") e outro do 0 até o −1 ("−1"): a queda de 2,5 passa do zero e para no −1, em azul.',
)
const COMPARA = reta(
  { de: -1, ate: 0.25, passo: 0.25, marcas: [-1, 0], numeros: [-0.5, -0.25], comparacao: '−0,5 < −0,25' },
  'A reta de −1 a 0, partida em quartos. Dois pontos azuis: −0,5 no meio e −0,25 mais perto do zero. Embaixo, "−0,5 < −0,25".',
)
const MEIO = reta(
  { de: -1, ate: 0.25, passo: 0.125, marcas: [-1, -0.5, -0.25, 0], numeros: [-0.375] },
  'A reta de −1 a 0 em oitavos. As marcas −0,5 e −0,25 escritas; entre elas, um ponto azul no −0,375, o do meio.',
)
const MENOS_TRES_QUARTOS = (extra: Record<string, unknown>, esboco: string) => reta({ de: -1, ate: 1, passo: 0.25, fracoes: 4, marcas: [-1, 0, 1], ...extra }, esboco)
const EXTRATO = (meio: string, fim: string, destaque?: number[]) => tab(
  {
    linhas: [{ rotulo: 'saldo (R$)', valores: [20, meio, fim] }],
    setas: [{ de: 0, para: 1, rotulo: '− 32,50' }, { de: 1, para: 2, rotulo: '3 × (−1,50)' }],
    ...(destaque ? { destaque } : {}),
  },
  `O extrato numa tabela de uma linha: 20, depois do boleto (− 32,50) ${meio}, depois das 3 tarifas ${fim}.`,
)

export const aula: Aula = {
  id: 'B.U12.A5',
  titulo: 'Os números racionais',
  objetivo: 'Pôr frações e decimais negativos na reta, compará-los, escrever o sinal de uma fração e fazer contas com decimais negativos, como temperatura e saldo.',
  modelo: 'reta',
  esboco: 'Abre no termômetro: 1,5 °C e uma queda de 2,5 °C. O aluno põe −1/2 e −3/4 na reta, compara −0,5 com −0,25 e descobre que entre −1 e 0 cabem infinitos números. Momento-chave: entre dois números sempre cabe o do meio, dos dois lados do zero; frações e decimais estão por toda a reta, e são os racionais. Depois, onde vai o menos de uma fração, a resposta do termômetro e a missão da unidade: o extrato que fica negativo.',
  vega: 'Ideia central: número racional é todo número que se escreve como fração de inteiros, positivo, negativo ou zero. −1/2 = −0,5 fica no meio entre −1 e 0; −3/4 = −0,75. Do lado negativo, quem está mais longe do zero é menor: −0,75 < −0,5 < −0,25. Entre dois racionais sempre cabe outro (o do meio), então entre −1 e 0 há infinitos. Cuidado: os racionais estão por toda a reta, mas não ocupam todos os pontos dela; números como a raiz de 2 vêm depois e não são frações. Fração é divisão: −3/4 = (−3)/4 = 3/(−4) = −0,75, e (−3)/(−4) = 0,75. Contas: 1,5 − 2,5 = −1; 20 − 32,50 = −12,50; 3 × (−1,50) = −4,50. Erros esperados: achar −0,5 maior que −0,25 (compara sem o sinal); menos em cima e embaixo "ainda negativo"; esquecer o sinal ao passar do zero ("sobram R$ 12,50"); levar a regra dos sinais para a soma. Guie com "Quem deve mais?", "Para que lado você anda?", "Passou do zero?", "Fração é uma divisão: quais são os sinais?". Temperaturas e valores são de exercício, sem fonte.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'De manhã, o termômetro marcava **1,5 °C**. À noite, a temperatura caiu **2,5 °C**. Quanto ele marca agora?',
      fala: 'De manhã, o termômetro marcava um vírgula cinco grau. À noite, a temperatura caiu dois vírgula cinco graus. Quanto ele marca agora?',
      visual: TERMOMETRO,
      esboco: 'Uma noite fria de inverno no Sul. A pergunta volta no fim da aula, com a reta.',
    },
    {
      tipo: 'mexa',
      texto: 'Meio grau abaixo de zero é ${-\\frac{1}{2}}$ °C. Leve a ficha até o lugar dele na reta.',
      fala: 'Meio grau abaixo de zero é menos um meio grau. Leve a ficha até o lugar dele na reta.',
      visual: reta({ de: -2, ate: 2, passo: 0.5, fracoes: 2, marcas: [-2, -1, 0, 1, 2], etiquetaSolta: -0.5 }, 'A reta de −2 a 2 com traços a cada meio. Acima, a ficha "−1/2", fora do lugar.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na ficha e depois no traço onde ela vai.',
        sucesso: { posicao: -0.5 },
        mostre: 'A ficha −1/2 desce até o traço do meio entre −1 e 0.',
      },
      descoberta: '−1/2 fica no meio entre −1 e 0, do lado azul. É o oposto de 1/2: a mesma distância do zero, do outro lado.',
      esboco: 'A fração negativa como um ponto da reta, igual às positivas da unidade 7, só que à esquerda do zero.',
    },
    {
      tipo: 'mexa',
      texto: 'E ${-\\frac{3}{4}}$? O trecho de −1 a 0 está partido em 4. Conte 3 partes a partir do zero, para a esquerda.',
      fala: 'E menos três quartos? O trecho de menos um a zero está partido em quatro. Conte três partes a partir do zero, para a esquerda.',
      visual: MENOS_TRES_QUARTOS({ etiquetaSolta: -0.75 }, 'A reta de −1 a 1 em quartos, só com −1, 0 e 1 escritos. A ficha "−3/4" acima.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na ficha e depois no traço onde ela vai.',
        sucesso: { posicao: -0.75 },
        mostre: 'A ficha −3/4 desce até o terceiro traço à esquerda do zero, um quarto antes do −1.',
      },
      descoberta: '−3/4 fica a três quartos do caminho entre 0 e −1. Em decimal, é −0,75.',
      esboco: 'O erro a evitar: contar a partir do −1 (cairia no −1/4). O zero é o ponto de partida dos dois lados.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual é maior: **−0,5** ou **−0,25**?',
      fala: 'Qual é maior: menos zero vírgula cinco, ou menos zero vírgula vinte e cinco?',
      visual: reta({ de: -1, ate: 0.25, passo: 0.25, marcas: [-1, 0] }, 'A reta de −1 a 0, partida em quartos, sem pontos.'),
      opcoes: [
        {
          texto: '−0,25', certa: true,
          explica: 'Isso. −0,25 fica à direita, mais perto do zero. Dever R$ 0,25 é melhor que dever R$ 0,50.',
          fala: 'Isso. Menos zero vírgula vinte e cinco fica à direita, mais perto do zero. Dever vinte e cinco centavos é melhor que dever cinquenta.',
          mostra: COMPARA,
        },
        {
          texto: '−0,5', erro: 'compara-decimais-negativos-sem-o-sinal',
          explica: '0,5 é maior que 0,25, mas dever R$ 0,50 é pior que dever R$ 0,25. −0,5 fica à esquerda: é menor.',
          fala: 'Zero vírgula cinco é maior que zero vírgula vinte e cinco, mas dever cinquenta centavos é pior que dever vinte e cinco. Menos zero vírgula cinco fica à esquerda: é menor.',
          mostra: COMPARA,
        },
      ],
      esboco: 'O caso que pega: do lado negativo, o número "maior" sem o sinal é o menor. Os dois pontos na reta e a desigualdade embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Entre **−1** e **0**, quantos números existem?',
      fala: 'Entre menos um e zero, quantos números existem?',
      visual: reta({ de: -1, ate: 0.25, passo: 0.25, marcas: [-1, 0] }, 'A mesma reta, de −1 a 0, sem pontos.'),
      opcoes: [
        {
          texto: 'Infinitos', certa: true,
          explica: 'Isso. Entre dois números sempre cabe o do meio: entre −0,5 e −0,25 está −0,375. E assim sem fim.',
          fala: 'Isso. Entre dois números sempre cabe o do meio: entre menos zero vírgula cinco e menos zero vírgula vinte e cinco está menos zero vírgula trezentos e setenta e cinco. E assim sem fim.',
          mostra: MEIO,
        },
        {
          texto: 'Nenhum: são vizinhos',
          explica: 'Vizinhos só entre os inteiros. Entre −1 e 0 estão −0,5, −0,25, −0,375… sempre cabe mais um.',
          fala: 'Vizinhos só entre os inteiros. Entre menos um e zero estão menos zero vírgula cinco, menos zero vírgula vinte e cinco, menos zero vírgula trezentos e setenta e cinco, e sempre cabe mais um.',
          mostra: MEIO,
        },
        {
          texto: 'Nove: de −0,1 a −0,9',
          explica: 'Esses são só os décimos. Entre −0,5 e −0,25 ainda cabe −0,375, e entre eles, outros. Sem fim.',
          fala: 'Esses são só os décimos. Entre menos zero vírgula cinco e menos zero vírgula vinte e cinco ainda cabe menos zero vírgula trezentos e setenta e cinco, e entre eles, outros. Sem fim.',
          mostra: MEIO,
        },
      ],
      esboco: 'O momento-chave, primeira metade: o trecho de −1 a 0 não está vazio. A reta passa para oitavos e o −0,375 aparece entre −0,5 e −0,25.',
    },
    {
      tipo: 'ideia',
      texto: 'Frações e decimais negativos estão por todo o lado esquerdo, como os positivos no direito. Entre dois, sempre cabe outro.',
      fala: 'Frações e decimais negativos estão por todo o lado esquerdo, como os positivos no direito. Entre dois, sempre cabe outro.',
      visual: reta({ de: -2, ate: 2, passo: 0.25, marcas: [-2, -1, 0, 1, 2], numeros: [-1.5, -0.5, 0.5, 1.5] }, 'A reta de −2 a 2 em quartos. Pontos dos dois lados: −1,5 e −0,5 em azul, 0,5 e 1,5 em âmbar, opostos dois a dois.'),
      esboco: 'O momento-chave, segunda metade: a reta inteira, dos dois lados do zero, tem frações e decimais em todo trecho. O anote dá o nome.',
    },
    {
      tipo: 'anote',
      titulo: 'Números racionais',
      definicao: 'Número racional é todo número que se escreve como fração de inteiros: positivo, negativo ou zero.',
      exemplo: { tex: '-\\frac{3}{4} = \\frac{-3}{4} = \\frac{3}{-4} = -0{,}75', fala: 'menos três quartos é igual a menos três sobre quatro, igual a três sobre menos quatro, igual a menos zero vírgula setenta e cinco' },
      alerta: 'Do lado negativo, mais longe do zero é menor: ${-0{,}75 < -0{,}5}$. E o menos da fração vai num lugar só.',
      esboco: 'A página do caderno com a reta de −1 a 1 e os pontos −3/4, −1/2 e 1/2, e as três escritas do −3/4.',
    },
    {
      tipo: 'passo',
      problema: 'Uma fração é uma divisão. Onde pode ir o menos de ${-\\frac{3}{4}}$? Faça as contas.',
      fala: 'Uma fração é uma divisão. Onde pode ir o menos de menos três quartos? Faça as contas.',
      visual: MENOS_TRES_QUARTOS({ numeros: [-0.75] }, 'A reta de −1 a 1 em quartos, com −3/4 em azul.'),
      passos: [
        {
          pergunta: '${\\frac{-3}{4}}$ é ${(-3) \\div 4}$. Quanto dá?',
          fala: 'Menos três sobre quatro é menos três dividido por quatro. Quanto dá?',
          opcoes: [
            { texto: '−0,75', certa: true, explica: 'Isso. Sinais diferentes, quociente negativo: o mesmo −3/4.', fala: 'Isso. Sinais diferentes, quociente negativo: o mesmo menos três quartos.', mostra: MENOS_TRES_QUARTOS({ numeros: [-0.75] }, 'O ponto −3/4 em azul, aceso.') },
            { texto: '0,75', erro: 'sinais-diferentes-da-positivo', explica: '${(-3) \\div 4}$ tem sinais diferentes: o quociente é negativo, −0,75.', fala: 'Menos três dividido por quatro tem sinais diferentes: o quociente é negativo, menos zero vírgula setenta e cinco.', mostra: MENOS_TRES_QUARTOS({ numeros: [-0.75, 0.75] }, 'Os dois pontos: −3/4 em azul e 3/4 em âmbar, um de cada lado do zero.') },
          ],
          linha: { tex: '\\frac{-3}{4} = (-3) \\div 4 = -0{,}75', fala: 'menos três sobre quatro é menos três dividido por quatro, menos zero vírgula setenta e cinco' },
        },
        {
          pergunta: 'E ${\\frac{3}{-4}}$, que é ${3 \\div (-4)}$?',
          fala: 'E três sobre menos quatro, que é três dividido por menos quatro?',
          opcoes: [
            { texto: '−0,75', certa: true, explica: 'Isso. De novo sinais diferentes: o mesmo ponto, −3/4.', fala: 'Isso. De novo sinais diferentes: o mesmo ponto, menos três quartos.', mostra: MENOS_TRES_QUARTOS({ numeros: [-0.75] }, 'O mesmo ponto −3/4: as duas escritas caem no mesmo lugar.') },
            { texto: '0,75', erro: 'sinais-diferentes-da-positivo', explica: 'Um número é positivo e o outro, negativo: sinais diferentes, quociente negativo.', fala: 'Um número é positivo e o outro, negativo: sinais diferentes, quociente negativo.', mostra: MENOS_TRES_QUARTOS({ numeros: [-0.75, 0.75] }, 'Os dois pontos, −3/4 e 3/4.') },
          ],
          linha: { tex: '\\frac{3}{-4} = 3 \\div (-4) = -0{,}75', fala: 'três sobre menos quatro é três dividido por menos quatro, menos zero vírgula setenta e cinco' },
        },
        {
          pergunta: 'E com menos em cima e embaixo: ${\\frac{-3}{-4}}$?',
          fala: 'E com menos em cima e embaixo: menos três sobre menos quatro?',
          opcoes: [
            { texto: '0,75', certa: true, explica: 'Isso. Sinais iguais, quociente positivo. Os dois menos se anulam: é 3/4.', fala: 'Isso. Sinais iguais, quociente positivo. Os dois menos se anulam: é três quartos.', mostra: MENOS_TRES_QUARTOS({ numeros: [-0.75, 0.75], distancias: [[-0.75], [0.75]] }, 'Os dois pontos com os colchetes até o zero: −3/4 e 3/4, a mesma distância, lados opostos. O 3/4 em âmbar é a resposta.') },
            { texto: '−0,75', erro: 'menos-no-numerador-e-no-denominador', explica: '${(-3) \\div (-4)}$ tem sinais iguais: o quociente é positivo, 0,75. O menos vai num lugar só.', fala: 'Menos três dividido por menos quatro tem sinais iguais: o quociente é positivo, zero vírgula setenta e cinco. O menos vai num lugar só.', mostra: MENOS_TRES_QUARTOS({ numeros: [-0.75, 0.75] }, 'Os dois pontos, −3/4 e 3/4.') },
          ],
          linha: { tex: '\\frac{-3}{-4} = (-3) \\div (-4) = 0{,}75', fala: 'menos três sobre menos quatro é menos três dividido por menos quatro, zero vírgula setenta e cinco' },
        },
      ],
      esboco: 'A regra dos sinais da aula 4, agora dentro da fração. As duas primeiras escritas caem no mesmo ponto azul; a terceira pula para o lado âmbar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Volte ao termômetro: **1,5 °C** e uma queda de **2,5 °C**. Quanto ele marca agora?',
      fala: 'Volte ao termômetro: um vírgula cinco grau e uma queda de dois vírgula cinco graus. Quanto ele marca agora?',
      visual: TERMOMETRO,
      opcoes: [
        {
          texto: '−1 °C', certa: true,
          explica: 'Isso. ${1{,}5 - 2{,}5 = -1}$: a queda leva 1,5 até o zero e mais 1 abaixo dele.',
          fala: 'Isso. Um vírgula cinco menos dois vírgula cinco dá menos um: a queda leva um vírgula cinco até o zero, e mais um abaixo dele.',
          mostra: QUEDA,
        },
        {
          texto: '1 °C', erro: 'decimal-negativo-sem-sinal',
          explica: 'A queda é maior que os 1,5 °C: passa do zero. Sobra 1 grau abaixo de zero, −1 °C.',
          fala: 'A queda é maior que um vírgula cinco grau: passa do zero. Sobra um grau abaixo de zero, menos um grau.',
          mostra: QUEDA,
        },
        {
          texto: '−4 °C',
          explica: '4 é ${1{,}5 + 2{,}5}$. Mas a queda começa no 1,5, não no zero: para no −1.',
          fala: 'Quatro é um vírgula cinco mais dois vírgula cinco. Mas a queda começa no um vírgula cinco, não no zero: para no menos um.',
          mostra: QUEDA,
        },
      ],
      esboco: 'Responde ao gancho. Os dois arcos mostram a queda partida no zero: 1,5 para chegar ao 0, e 1 depois dele.',
    },
    {
      tipo: 'passo',
      problema: 'A missão: o extrato. Saldo de **R$ 20**, um boleto de **R$ 32,50** e **3** tarifas de **R$ 1,50**. Qual é o saldo no fim?',
      fala: 'A missão: o extrato. Saldo de vinte reais, um boleto de trinta e dois reais e cinquenta centavos, e três tarifas de um real e cinquenta. Qual é o saldo no fim?',
      visual: EXTRATO('?', '?'),
      passos: [
        {
          pergunta: 'Depois do boleto, qual é o saldo?',
          opcoes: [
            { texto: '−R$ 12,50', certa: true, explica: 'Isso. ${20 - 32{,}50 = -12{,}50}$: o boleto é maior que o saldo, e a conta fica negativa.', fala: 'Isso. Vinte menos trinta e dois e cinquenta dá menos doze e cinquenta: o boleto é maior que o saldo, e a conta fica negativa.', mostra: EXTRATO('−12,50', '?', [1]) },
            { texto: 'R$ 12,50', erro: 'decimal-negativo-sem-sinal', explica: 'R$ 20 não pagam R$ 32,50. Faltam R$ 12,50: você fica devendo, −R$ 12,50.', fala: 'Vinte reais não pagam trinta e dois e cinquenta. Faltam doze e cinquenta: você fica devendo, menos doze reais e cinquenta.', mostra: EXTRATO('−12,50', '?', [1]) },
          ],
          linha: { tex: '20 - 32{,}50 = -12{,}50', fala: 'vinte menos trinta e dois e cinquenta dá menos doze e cinquenta' },
        },
        {
          pergunta: 'As **3** tarifas de **R$ 1,50** mudam o saldo em quanto?',
          fala: 'As três tarifas de um real e cinquenta mudam o saldo em quanto?',
          opcoes: [
            { texto: '−R$ 4,50', certa: true, explica: 'Isso. ${3 \\times (-1{,}50) = -4{,}50}$: três saídas de R$ 1,50.', fala: 'Isso. Três vezes menos um e cinquenta dá menos quatro e cinquenta: três saídas de um real e cinquenta.', mostra: EXTRATO('−12,50', '?', [2]) },
            { texto: '+R$ 4,50', erro: 'sinais-diferentes-da-positivo', explica: 'Tarifa é dinheiro que sai. São 3 vezes −1,50: sinais diferentes, −4,50.', fala: 'Tarifa é dinheiro que sai. São três vezes menos um e cinquenta: sinais diferentes, menos quatro e cinquenta.', mostra: EXTRATO('−12,50', '?', [2]) },
          ],
          linha: { tex: '3 \\times (-1{,}50) = -4{,}50', fala: 'três vezes menos um e cinquenta dá menos quatro e cinquenta' },
        },
        {
          pergunta: 'Qual é o saldo no fim?',
          opcoes: [
            { texto: '−R$ 17', certa: true, explica: 'Isso. ${-12{,}50 + (-4{,}50) = -17}$. Dívida mais dívida: você deve R$ 17 ao banco.', fala: 'Isso. Menos doze e cinquenta, mais menos quatro e cinquenta, dá menos dezessete. Dívida mais dívida: você deve dezessete reais ao banco.', mostra: EXTRATO('−12,50', '−17', [2]) },
            { texto: '−R$ 8', erro: 'regra-dos-sinais-na-soma', explica: '−8 seria as tarifas diminuírem a dívida. Elas aumentam: ${-12{,}50 + (-4{,}50) = -17}$.', fala: 'Menos oito seria as tarifas diminuírem a dívida. Elas aumentam: menos doze e cinquenta, mais menos quatro e cinquenta, dá menos dezessete.', mostra: EXTRATO('−12,50', '−17', [2]) },
          ],
          linha: { tex: '-12{,}50 + (-4{,}50) = -17', fala: 'menos doze e cinquenta mais menos quatro e cinquenta dá menos dezessete' },
        },
      ],
      esboco: 'A missão da unidade junta as aulas: passar do zero (aula 2), multiplicar um negativo (aula 4) e somar dívidas. A tabela de uma linha é o extrato.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: de madrugada, o termômetro marcou **−2,5 °C**. Ao meio-dia, **8 °C**. Quantos graus a temperatura subiu?',
      fala: 'No papel: de madrugada, o termômetro marcou menos dois vírgula cinco graus. Ao meio-dia, oito graus. Quantos graus a temperatura subiu?',
      resposta: '10,5',
      sinal: true,
      resolucao: [
        { tex: '8 - (-2{,}5) = 8 + 2{,}5', fala: 'oito menos menos dois vírgula cinco é oito mais dois vírgula cinco' },
        { tex: '8 + 2{,}5 = 10{,}5', fala: 'oito mais dois vírgula cinco dá dez vírgula cinco graus' },
      ],
      esboco: 'Tirar um negativo, da aula 3, com decimais. Na reta: 2,5 até o zero e mais 8 depois dele.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['racionais-n1', 'racionais-n2', 'racionais-n3'],
      esboco: 'Nível 1: qual é maior entre dois negativos, com a reta. Nível 2: o sinal de uma fração, em decimal. Nível 3: temperatura e saldo com decimais negativos, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'O termômetro marca **−1 °C**, e a reta toda tem frações e decimais. Fim da unidade. Na próxima: potências e raízes.',
      fala: 'O termômetro marca menos um grau, e a reta toda tem frações e decimais. Fim da unidade. Na próxima: potências e raízes.',
      visual: QUEDA,
      esboco: 'Responde ao gancho com os dois arcos da queda e fecha a unidade. A missão do extrato juntou as cinco aulas.',
    },
  ],
}
