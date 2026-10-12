import type { Aula, Visual } from '@/lib/formation/schema'

// Taxa unitária: quanto por um. O preço de 1 kg, os km com 1 L, os km em
// 1 hora. Na tabela de proporção, achá-la é dividir as duas linhas pelo
// mesmo número até a coluna do 1. Com ela, dá para comparar ofertas (qual
// quilo é mais barato) e escalar (a taxa vira a seta da direita, que vale
// para toda coluna). Os erros a desmontar: comparar o preço do pacote sem
// dividir, achar que o pacote maior sempre compensa, e pensar aditivamente
// (de 5 kg para 1 kg, tirar R$ 4 do preço).

const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })
const div = (k: number) => [{ de: 0, para: 1, rotulo: `÷ ${k}` }, { de: 0, para: 1, rotulo: `÷ ${k}`, embaixo: true }]

const PACOTES = [{ rotulo: 'pacote (kg)', valores: [2, 5] }, { rotulo: 'preço (R$)', valores: [11, 26] }]
const ARROZ = tab({ linhas: PACOTES }, 'A tabela com os dois pacotes de arroz: 2 kg por R$ 11 e 5 kg por R$ 26.')
const POR_KG = tab({ linhas: [...PACOTES, { rotulo: 'preço de 1 kg', valores: ['5,50', '5,20'] }], destaque: [1] }, 'Uma terceira linha aparece: o preço de 1 kg de cada pacote, R$ 5,50 e R$ 5,20. O pacote de 5 kg ganha moldura âmbar.')
const CINCO = (preco: number | string) => ({ linhas: [{ rotulo: 'arroz (kg)', valores: [5, 1] }, { rotulo: 'preço (R$)', valores: [26, preco] }] })
const ONIBUS = (km: number | string) => ({ linhas: [{ rotulo: 'tempo (h)', valores: [3, 1] }, { rotulo: 'distância (km)', valores: [240, km] }] })
const SABAO = [{ rotulo: 'pacote (kg)', valores: [1, 3] }, { rotulo: 'preço (R$)', valores: [16, 51] }]

export const aula: Aula = {
  id: 'B.U10.A5',
  titulo: 'Taxa unitária',
  objetivo: 'Achar a taxa unitária (quanto corresponde a 1: o preço de 1 kg, os km com 1 L, a velocidade) dividindo, e usá-la para comparar ofertas e para calcular qualquer quantidade.',
  modelo: 'livre',
  esboco: 'Abre no mercado: arroz de 2 kg por R$ 11 ou de 5 kg por R$ 26? O aluno aposta, depois divide as duas linhas da tabela por 2 e acha o preço de 1 kg. Momento-chave: a coluna do 1 deixa os dois pacotes comparáveis (R$ 5,50 contra R$ 5,20). Depois a taxa vira a seta da direita (o carro de 12 km/L) e serve para escalar; a velocidade aparece como mais uma taxa. Fecha com o sabão em pó, em que o pacote pequeno é o mais barato, e com os ovos.',
  vega: 'Ideia central: a taxa unitária é quanto de uma grandeza corresponde a 1 da outra: o preço de 1 kg (R$/kg), os km rodados com 1 L (km/L), os km andados em 1 hora (km/h). Acha-se dividindo: R$ 26 ÷ 5 kg = R$ 5,20 por kg. Na tabela de proporção, é a coluna do 1, e a taxa é o fator que leva de uma linha à outra (km = litros × 12). Serve para comparar ofertas de tamanhos diferentes e para calcular qualquer quantidade (15 ovos = 15 × o preço de 1 ovo). Erros esperados: comparar o preço do pacote em vez do preço de 1 kg; achar que o pacote maior sempre sai mais barato (no sabão, o pequeno ganha); multiplicar em vez de dividir (26 × 5); pensar aditivamente (de 5 kg para 1 kg, tirar R$ 4). Guie com "Quanto custa 1 kg de cada?", "Em 1 hora o ônibus anda mais ou menos que em 3?", "Confira: a taxa vezes a quantidade dá o preço do pacote?". Preços e consumos são de exercício, sem fonte.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'No mercado: arroz de **2 kg** por **R$ 11** ou de **5 kg** por **R$ 26**. Qual sai mais barato?',
      fala: 'No mercado: arroz de dois quilos por onze reais, ou de cinco quilos por vinte e seis reais. Qual sai mais barato?',
      visual: ARROZ,
      esboco: 'Uma dúvida de toda compra. O preço menor na prateleira puxa a resposta errada.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Aposte: em qual pacote o quilo do arroz é mais barato?',
      visual: ARROZ,
      opcoes: [
        {
          texto: 'No de 2 kg: custa menos', erro: 'compara-preco-sem-taxa-unitaria',
          explica: 'R$ 11 é menos que R$ 26, mas leva menos arroz. Para comparar, veja quanto custa 1 kg de cada.',
          fala: 'Onze reais é menos que vinte e seis, mas leva menos arroz. Para comparar, veja quanto custa um quilo de cada.',
        },
        {
          texto: 'No de 5 kg', certa: true,
          explica: 'Boa aposta. Para ter certeza, ache quanto custa 1 kg em cada pacote.',
          fala: 'Boa aposta. Para ter certeza, ache quanto custa um quilo em cada pacote.',
        },
        {
          texto: 'Tanto faz',
          explica: 'Só dá para saber comparando o mesmo tanto de arroz: o preço de 1 kg de cada.',
          fala: 'Só dá para saber comparando o mesmo tanto de arroz: o preço de um quilo de cada.',
        },
      ],
      esboco: 'Nenhuma explicação entrega o preço por quilo: o aluno vai calcular no Mexa.',
    },
    {
      tipo: 'mexa',
      texto: 'Comece pelo pacote de **2 kg**. Divida as duas linhas por 2 e ache o preço de **1 kg**.',
      fala: 'Comece pelo pacote de dois quilos. Divida as duas linhas por dois e ache o preço de um quilo.',
      visual: tab({ linhas: [{ rotulo: 'arroz (kg)', valores: [2, 1] }, { rotulo: 'preço (R$)', valores: [11, '5,50'] }], setas: div(2), completar: true, mostradas: 1 }, 'A tabela com a coluna do pacote (2 kg, R$ 11) e uma caixa vazia ao lado, com um "+".'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para achar o preço de 1 kg.',
        sucesso: { colunas: 2 },
        mostre: 'A segunda coluna se preenche: 1 kg e R$ 5,50, com ÷ 2 em cima e ÷ 2 embaixo.',
      },
      descoberta: 'Metade do arroz custa metade do preço: 1 kg do pacote de 2 kg sai a R$ 5,50. Dividir as duas linhas pelo mesmo número leva à coluna do 1.',
      esboco: 'A coluna do 1 nasce com as duas setas ÷ 2, como na proporção da aula 3.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E no pacote de **5 kg** por **R$ 26**? Quanto custa 1 kg?',
      fala: 'E no pacote de cinco quilos por vinte e seis reais? Quanto custa um quilo?',
      visual: tab(CINCO('?'), 'A tabela do pacote de 5 kg: 5 e 1 em cima, 26 e "?" embaixo.'),
      opcoes: [
        {
          texto: 'R$ 5,20', certa: true,
          explica: 'Isso. $26 \\div 5 = 5{,}20$: mais barato que os R$ 5,50 do outro pacote.',
          fala: 'Isso. Vinte e seis dividido por cinco é cinco e vinte: mais barato que os cinco e cinquenta do outro pacote.',
          mostra: POR_KG,
        },
        {
          texto: 'R$ 22', erro: 'pensa-aditivamente',
          explica: 'De 5 kg para 1 kg são 4 kg a menos, mas o preço não cai R$ 4. Ele é dividido por 5, como os quilos.',
          fala: 'De cinco quilos para um são quatro a menos, mas o preço não cai quatro reais. Ele é dividido por cinco, como os quilos.',
          mostra: tab({ ...CINCO('5,20'), setas: div(5) }, 'As setas ÷ 5 em cima e embaixo, e o 5,20 no lugar do "?".'),
        },
        {
          texto: 'R$ 130', erro: 'operacao-trocada',
          explica: '$26 \\times 5$ é o preço de 25 kg. Para 1 kg, divida: $26 \\div 5$.',
          fala: 'Vinte e seis vezes cinco é o preço de vinte e cinco quilos. Para um quilo, divida: vinte e seis dividido por cinco.',
          mostra: tab({ ...CINCO('5,20'), setas: div(5) }, 'As setas ÷ 5 em cima e embaixo, e o 5,20 no lugar do "?".'),
        },
      ],
      esboco: 'A certa mostra a comparação: a linha nova com o preço de 1 kg de cada pacote responde ao gancho.',
    },
    {
      tipo: 'anote',
      titulo: 'Taxa unitária',
      definicao: 'Taxa unitária é quanto de uma grandeza corresponde a 1 da outra: o preço de 1 kg, os km com 1 L. Para achá-la, divida.',
      exemplo: { tex: '\\text{R\\$ } 26 \\div 5 \\text{ kg} = \\text{R\\$ } 5{,}20 \\text{ por kg}', fala: 'vinte e seis reais divididos por cinco quilos dão cinco reais e vinte por quilo' },
      alerta: 'O pacote com o menor preço nem sempre tem o quilo mais barato. Compare a taxa unitária: o preço de 1 kg de cada.',
      esboco: 'A página do caderno com a tabela 5 kg → 1 kg e as duas setas ÷ 5.',
    },
    {
      tipo: 'mexa',
      texto: 'O carro faz **12 km/L**: 12 km com 1 L. A taxa é a seta da direita. Complete a tabela.',
      fala: 'O carro faz doze quilômetros por litro: doze quilômetros com um litro. A taxa é a seta da direita. Complete a tabela.',
      visual: tab({ linhas: [{ rotulo: 'gasolina (L)', valores: [1, 5, 40] }, { rotulo: 'distância (km)', valores: [12, 60, 480] }], fator: '× 12', completar: true, mostradas: 1 }, 'A tabela com a coluna do 1 (1 L, 12 km) e duas caixas vazias. À direita, a seta × 12 de uma linha para a outra.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para completar a tabela.',
        sucesso: { colunas: 3 },
        mostre: 'As colunas se preenchem: 5 L, 60 km; 40 L, 480 km. A seta × 12 vale para todas.',
      },
      descoberta: 'Com a taxa, toda coluna é uma conta só: litros × 12. 5 L dão 60 km; um tanque de 40 L dá 480 km.',
      esboco: 'A taxa unitária vira o fator da direita, que vale para toda coluna. Daqui em diante, qualquer quantidade sai numa multiplicação.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um ônibus andou **240 km** em **3 h**, sempre no mesmo ritmo. Quantos km ele anda em 1 hora?',
      fala: 'Um ônibus andou duzentos e quarenta quilômetros em três horas, sempre no mesmo ritmo. Quantos quilômetros ele anda em uma hora?',
      visual: tab(ONIBUS('?'), 'A tabela do ônibus: 3 h e 1 h em cima, 240 km e "?" embaixo.'),
      opcoes: [
        {
          texto: '80 km', certa: true,
          explica: 'Isso. $240 \\div 3 = 80$: são **80 km/h**. A velocidade também é uma taxa unitária.',
          fala: 'Isso. Duzentos e quarenta dividido por três é oitenta: são oitenta quilômetros por hora. A velocidade também é uma taxa unitária.',
          mostra: tab({ ...ONIBUS(80), setas: div(3) }, 'O 80 entra no lugar do "?", com ÷ 3 em cima e embaixo.'),
        },
        {
          texto: '720 km', erro: 'operacao-trocada',
          explica: '720 km seriam 9 horas de viagem. Em 1 hora, o ônibus anda menos: divida por 3.',
          fala: 'Setecentos e vinte quilômetros seriam nove horas de viagem. Em uma hora, o ônibus anda menos: divida por três.',
          mostra: tab({ ...ONIBUS(80), setas: div(3) }, 'As setas ÷ 3 em cima e embaixo, e o 80 no lugar do "?".'),
        },
        {
          texto: '238 km', erro: 'pensa-aditivamente',
          explica: 'De 3 h para 1 h são 2 h a menos, não 2 km. O tempo foi dividido por 3: os km também.',
          fala: 'De três horas para uma são duas horas a menos, não dois quilômetros. O tempo foi dividido por três: os quilômetros também.',
          mostra: tab({ ...ONIBUS(80), setas: div(3) }, 'As setas ÷ 3 em cima e embaixo, e o 80 no lugar do "?".'),
        },
      ],
      esboco: 'A velocidade, em km/h, é a mesma ideia: quanto em 1 hora.',
    },
    {
      tipo: 'passo',
      problema: 'Sabão em pó: **1 kg** por **R$ 16** ou **3 kg** por **R$ 51**. Qual tem o quilo mais barato?',
      fala: 'Sabão em pó: um quilo por dezesseis reais, ou três quilos por cinquenta e um reais. Qual tem o quilo mais barato?',
      visual: tab({ linhas: SABAO }, 'A tabela com os dois pacotes de sabão: 1 kg por R$ 16 e 3 kg por R$ 51.'),
      passos: [
        {
          pergunta: 'Quanto custa 1 kg no pacote de 3 kg?',
          fala: 'Quanto custa um quilo no pacote de três quilos?',
          opcoes: [
            { texto: 'R$ 17', certa: true, explica: 'Isso. $51 \\div 3 = 17$.', fala: 'Isso. Cinquenta e um dividido por três é dezessete.' },
            { texto: 'R$ 153', erro: 'operacao-trocada', explica: '$51 \\times 3$ seria o preço de 9 kg. Divida: $51 \\div 3$.', fala: 'Cinquenta e um vezes três seria o preço de nove quilos. Divida: cinquenta e um dividido por três.' },
            { texto: 'R$ 49', erro: 'pensa-aditivamente', explica: 'Tirar 2 kg não tira R$ 2. O preço se divide por 3, como os quilos.', fala: 'Tirar dois quilos não tira dois reais. O preço se divide por três, como os quilos.' },
          ],
          linha: { tex: '\\text{R\\$ } 51 \\div 3 = \\text{R\\$ } 17 \\text{ por kg}', fala: 'cinquenta e um reais divididos por três dão dezessete reais por quilo' },
        },
        {
          pergunta: 'R$ 16 contra R$ 17 o quilo. Qual compensa?',
          fala: 'Dezesseis contra dezessete reais o quilo. Qual compensa?',
          opcoes: [
            { texto: 'O de 1 kg', certa: true, explica: 'Isso. Aqui o pacote pequeno sai mais barato: R$ 1 a menos por quilo.', fala: 'Isso. Aqui o pacote pequeno sai mais barato: um real a menos por quilo.', mostra: tab({ linhas: [...SABAO, { rotulo: 'preço de 1 kg', valores: [16, 17] }], destaque: [0] }, 'Uma terceira linha com o preço de 1 kg, 16 e 17. O pacote de 1 kg ganha moldura âmbar.') },
            { texto: 'O de 3 kg: o grande sempre compensa', erro: 'maior-pacote-sempre-mais-barato', explica: 'Nem sempre. Aqui o quilo do grande sai R$ 17, um real a mais. Só a taxa unitária diz.', fala: 'Nem sempre. Aqui o quilo do grande sai dezessete reais, um real a mais. Só a taxa unitária diz.' },
          ],
          linha: { tex: '\\text{R\\$ } 16 < \\text{R\\$ } 17', fala: 'dezesseis reais é menos que dezessete reais: o pacote de um quilo compensa' },
        },
      ],
      esboco: 'O caso que pega: o pacote grande não é o mais barato. Sem dividir, ninguém descobre.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: **6 ovos** custam **R$ 4,80**. Quantos reais custam **15 ovos**?',
      fala: 'No papel: seis ovos custam quatro reais e oitenta. Quantos reais custam quinze ovos?',
      resposta: 12,
      resolucao: [
        { tex: '4{,}80 \\div 6 = 0{,}80', fala: 'quatro e oitenta dividido por seis: oitenta centavos por ovo' },
        { tex: '0{,}80 \\times 15 = 12', fala: 'oitenta centavos vezes quinze são doze reais' },
      ],
      esboco: 'Primeiro a taxa (o preço de 1 ovo), depois a escala. Confere: 15 ovos são 2,5 vezes 6, e 4,80 × 2,5 = 12.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['taxa-unitaria-n1', 'taxa-unitaria-n2', 'taxa-unitaria-n3'],
      esboco: 'Nível 1: a taxa de um caso (preço por kg, km/L, km/h), com a tabela até a coluna do 1. Nível 2: comparar dois pacotes, às vezes com o pequeno mais barato. Nível 3: achar a taxa e escalar, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'O arroz de 5 kg sai a **R$ 5,20** o quilo: o mais barato. Na próxima aula: a concentração, quantos mg em cada mL.',
      fala: 'O arroz de cinco quilos sai a cinco reais e vinte o quilo: o mais barato. Na próxima aula: a concentração, quantos miligramas em cada mililitro.',
      visual: POR_KG,
      esboco: 'Responde ao gancho com a linha do preço de 1 kg.',
    },
  ],
}
