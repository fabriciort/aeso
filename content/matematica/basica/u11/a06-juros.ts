import type { Aula, Visual } from '@/lib/formation/schema'

// Juros simples e compostos. Nos simples, a taxa age sempre sobre o valor
// inicial: R$ 1.000 a 10 % ao mês ganham R$ 100 todo mês (+ 100 na
// tabela). Nos compostos, a taxa age sobre a dívida do momento, então os
// juros também rendem juros: × 1,1 todo mês, como as variações sucessivas
// da aula 5. Em 3 meses: 1.300 contra 1.331; em 12 meses, 2.200 contra
// mais de 3.100. A tabela de proporção é a âncora: os meses em cima, a
// dívida embaixo, as setas entre colunas seguidas. Fecha a missão da
// unidade, "À vista ou parcelado?", comparando o total do parcelado com o
// preço à vista em porcentagem (a aula 4). Os erros a desmontar: calcular
// juros compostos como simples, responder só os juros quando a pergunta é
// o total, e medir a diferença do parcelado sobre o valor errado.

const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })

const MESES = { rotulo: 'mês', valores: [0, 1, 2, 3] }
const SIMPLES = [1000, 1100, 1200, 1300]
const COMPOSTOS = [1000, 1100, 1210, 1331]
const passos = (rotulos: string[]) => rotulos.map((rotulo, i) => ({ de: i, para: i + 1, rotulo, embaixo: true }))

const DIVIDA = tab({ linhas: [MESES, { rotulo: 'dívida (R$)', valores: [1000, '?', '?', '?'] }] }, 'A tabela com os meses em cima, 0 a 3, e a dívida embaixo: R$ 1.000 no mês 0 e "?" nos outros.')
const LADO_A_LADO = tab(
  { linhas: [MESES, { rotulo: 'simples (R$)', valores: SIMPLES }, { rotulo: 'compostos (R$)', valores: COMPOSTOS }], destaque: [3] },
  'A tabela com três linhas: os meses, a dívida nos juros simples (1.000, 1.100, 1.200, 1.300) e nos compostos (1.000, 1.100, 1.210, 1.331). O mês 3 ganha moldura âmbar.',
)
const DOZE = (fim: string) => tab(
  { linhas: [{ rotulo: 'mês', valores: [0, 3, 6, 12] }, { rotulo: 'dívida (R$)', valores: [1000, 1331, '1.771,56', fim] }] },
  fim === '?'
    ? 'A tabela dos juros compostos, saltando meses: 0, 3, 6 e 12. A dívida: 1.000, 1.331, 1.771,56 e "?".'
    : 'O "?" vira 3.138,43: em 12 meses, a dívida mais que triplicou.',
)
const TV = (total: number | string) => tab(
  { linhas: [{ rotulo: 'reais', valores: [1000, 200] }, { rotulo: 'porcentagem', valores: ['100 %', total] }] },
  total === '?'
    ? 'A tabela da compra: o preço à vista, R$ 1.000, ao lado de 100 %; os R$ 200 a mais do parcelado, ao lado de "?".'
    : 'O "?" vira 20 %: o parcelado custa 20 % a mais que o à vista.',
)

export const aula: Aula = {
  id: 'B.U11.A6',
  titulo: 'Juros simples e compostos',
  objetivo: 'Calcular juros simples (a taxa sempre sobre o valor inicial) e compostos (a taxa sobre o valor do momento, multiplicando pelo fator a cada mês), ver por que os compostos crescem cada vez mais rápido e comparar à vista com parcelado em porcentagem.',
  modelo: 'livre',
  esboco: 'Abre no cartão: R$ 1.000 de dívida a 10 % ao mês, sobre o que se deve. Em 3 meses, quanto? O aluno aposta e completa duas tabelas: nos juros simples, + 100 todo mês; nos compostos, × 1,1. Momento-chave: na tabela dos compostos, os juros crescem a cada coluna (100, 110, 121), porque os juros do mês entram na dívida e rendem juros. A aposta dos 12 meses mostra a distância (2.200 contra mais de 3.100). A missão da unidade fecha no passo a passo: a TV em 12 × R$ 100 "sem juros" ou R$ 1.000 à vista. O parcelado custa 20 % a mais.',
  vega: 'Ideia central: juros são o que se paga (ou se ganha) pelo uso do dinheiro no tempo, uma porcentagem por período. Nos juros simples, a taxa age sempre sobre o valor inicial: R$ 1.000 a 10 % ao mês dão R$ 100 por mês, R$ 1.300 em 3 meses. Nos juros compostos, a taxa age sobre o valor do momento: × 1,1 a cada mês, 1.100, 1.210, 1.331. São as variações sucessivas da aula 5: os fatores se multiplicam. Os compostos crescem cada vez mais rápido (em 12 meses: R$ 2.200 nos simples, R$ 3.138,43 nos compostos, porque 1,1 elevado a 12 dá cerca de 3,138). Dívidas de cartão de crédito e de cheque especial no Brasil são cobradas com juros compostos. A missão "À vista ou parcelado?": comparar o total pago no parcelado com o preço à vista e dizer a diferença em porcentagem sobre o à vista (parte ÷ todo, aula 4); "sem juros" com desconto à vista tem um custo escondido. Erros esperados: calcular compostos como simples (somar R$ 100 todo mês); responder só os juros quando a pergunta é o total; medir a diferença sobre o parcelado (200 ÷ 1.200) em vez do à vista. Guie com "Os juros deste mês são 10 % de quanto?", "Os juros do mês passado entraram na dívida?", "A mais que o quê?". A aula mostra a conta da escolha, sem recomendar crédito, loja ou forma de pagamento. Taxas e preços são de exercício, sem fonte. Contexto de finanças marcado para revisão por alguém da área.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você deve **R$ 1.000** no cartão, com juros de **10 %** ao mês sobre o que deve. Sem pagar nada, quanto deve em **3 meses**?',
      fala: 'Você deve mil reais no cartão, com juros de dez por cento ao mês sobre o que deve. Sem pagar nada, quanto deve em três meses?',
      visual: DIVIDA,
      esboco: 'Uma dívida que cresce sozinha, de um jeito que muita gente já viveu. "Sobre o que deve" é a pista dos juros compostos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Aposte: quanto você deve no fim do terceiro mês?',
      visual: DIVIDA,
      opcoes: [
        {
          texto: 'R$ 1.331', certa: true,
          explica: 'Isso. Os juros de cada mês entram na dívida e, no mês seguinte, também pagam juros.',
        },
        {
          texto: 'R$ 1.300', erro: 'juros-compostos-como-simples',
          explica: 'Seria assim se os 10 % fossem sempre sobre os R$ 1.000. Aqui eles são sobre o que você deve, e a dívida cresce.',
          fala: 'Seria assim se os dez por cento fossem sempre sobre os mil reais. Aqui eles são sobre o que você deve, e a dívida cresce.',
        },
        {
          texto: 'R$ 1.100',
          explica: 'R$ 1.100 é a dívida depois de 1 mês. Os juros voltam a cada mês, por 3 meses.',
          fala: 'Mil e cem reais é a dívida depois de um mês. Os juros voltam a cada mês, por três meses.',
        },
      ],
      esboco: 'As duas tabelas a seguir mostram de onde vêm o 1.300 e o 1.331.',
    },
    {
      tipo: 'mexa',
      texto: 'Nos **juros simples**, os 10 % são sempre sobre os R$ 1.000: **R$ 100** por mês. Complete a tabela.',
      fala: 'Nos juros simples, os dez por cento são sempre sobre os mil reais: cem reais por mês. Complete a tabela.',
      visual: tab(
        { linhas: [MESES, { rotulo: 'dívida (R$)', valores: SIMPLES }], setas: passos(['+ 100', '+ 100', '+ 100']), completar: true, mostradas: 1 },
        'A tabela com o mês 0 (R$ 1.000) e três caixas vazias. Cada toque preenche um mês, com a seta + 100 embaixo.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para passar um mês.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem: 1.100, 1.200 e 1.300, com + 100 embaixo de cada passo.',
      },
      descoberta: 'Nos juros simples, a dívida cresce sempre o mesmo tanto, R$ 100 por mês: em 3 meses, R$ 1.300.',
      esboco: 'A soma repetida, para contrastar com a tabela seguinte.',
    },
    {
      tipo: 'mexa',
      texto: 'Nos **juros compostos**, os 10 % são sobre a dívida do mês: **× 1,1** a cada mês. Complete a tabela.',
      fala: 'Nos juros compostos, os dez por cento são sobre a dívida do mês: vezes um vírgula um a cada mês. Complete a tabela.',
      visual: tab(
        { linhas: [MESES, { rotulo: 'dívida (R$)', valores: COMPOSTOS }], setas: passos(['× 1,1', '× 1,1', '× 1,1']), completar: true, mostradas: 1 },
        'A mesma tabela, agora com × 1,1 embaixo de cada passo. Cada toque preenche um mês: 1.100, 1.210, 1.331.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para passar um mês.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem: 1.100, 1.210 e 1.331, com × 1,1 embaixo de cada passo.',
      },
      descoberta: 'Os juros crescem a cada mês: R$ 100, depois R$ 110, depois R$ 121. São juros sobre juros, e a dívida chega a R$ 1.331.',
      esboco: 'O momento-chave: o aumento de cada coluna é maior que o da anterior. É a variação sucessiva da aula 5, três vezes.',
    },
    {
      tipo: 'ideia',
      texto: 'Nos compostos, os juros do mês entram na dívida e também pagam juros: **juros sobre juros**.',
      fala: 'Nos compostos, os juros do mês entram na dívida e também pagam juros: juros sobre juros.',
      visual: LADO_A_LADO,
      esboco: 'As duas linhas lado a lado: no mês 3, a diferença já é de R$ 31, e ela cresce a cada mês.',
    },
    {
      tipo: 'anote',
      titulo: 'Juros simples e compostos',
      definicao: 'Nos juros simples, a taxa age sempre sobre o valor inicial. Nos compostos, age sobre o valor do momento: juros sobre juros.',
      exemplo: { tex: '1.000 \\times 1{,}1 \\times 1{,}1 \\times 1{,}1 = 1.331', fala: 'mil vezes um vírgula um, vezes um vírgula um, vezes um vírgula um, dá mil trezentos e trinta e um' },
      alerta: 'Nos juros compostos, não some os juros do primeiro mês: multiplique pelo fator a cada mês.',
      esboco: 'A página do caderno com as duas tabelas: + 100 nos simples e × 1,1 nos compostos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E em **12 meses**, a 10 % ao mês, juros compostos? A dívida de R$ 1.000 vai a quanto?',
      fala: 'E em doze meses, a dez por cento ao mês, juros compostos? A dívida de mil reais vai a quanto?',
      visual: DOZE('?'),
      opcoes: [
        {
          texto: 'Mais de R$ 3.000', certa: true,
          explica: 'Isso. Vai a R$ 3.138,43: mais que o triplo. A cada mês, os juros crescem mais.',
          fala: 'Isso. Vai a três mil cento e trinta e oito reais e quarenta e três centavos: mais que o triplo. A cada mês, os juros crescem mais.',
          mostra: DOZE('3.138,43'),
        },
        {
          texto: 'R$ 2.200', erro: 'juros-compostos-como-simples',
          explica: 'R$ 2.200 são os juros simples, R$ 100 por mês. Nos compostos, a dívida passa de R$ 3.100.',
          fala: 'Dois mil e duzentos são os juros simples, cem reais por mês. Nos compostos, a dívida passa de três mil e cem.',
          mostra: DOZE('3.138,43'),
        },
        {
          texto: 'R$ 2.662: o dobro de 1.331',
          explica: '12 meses são 4 vezes 3 meses, não 2. E cada trecho de 3 meses multiplica por 1,331: dá R$ 3.138,43.',
          fala: 'Doze meses são quatro vezes três meses, não duas. E cada trecho de três meses multiplica por um vírgula trezentos e trinta e um: dá três mil cento e trinta e oito.',
          mostra: DOZE('3.138,43'),
        },
      ],
      esboco: 'A tabela salta meses (0, 3, 6, 12) para mostrar a curva: de 3 em 3 meses, a dívida cresce cada vez mais.',
    },
    {
      tipo: 'passo',
      problema: 'A missão: a TV custa **R$ 1.000** à vista ou **12 × R$ 100** "sem juros". Quanto o parcelado custa a mais?',
      fala: 'A missão: a TV custa mil reais à vista, ou doze vezes cem reais sem juros. Quanto o parcelado custa a mais?',
      visual: TV('?'),
      passos: [
        {
          pergunta: 'Quanto você paga, no total, no parcelado?',
          opcoes: [
            { texto: 'R$ 1.200', certa: true, explica: 'Isso. $12 \\times 100 = 1.200$: R$ 200 a mais que à vista.', fala: 'Isso. Doze vezes cem, mil e duzentos: duzentos reais a mais que à vista.' },
            { texto: 'R$ 100', explica: 'R$ 100 é cada parcela. São 12 delas: $12 \\times 100$.', fala: 'Cem reais é cada parcela. São doze delas: doze vezes cem.' },
          ],
          linha: { tex: '12 \\times 100 = 1.200', fala: 'doze vezes cem são mil e duzentos reais' },
        },
        {
          pergunta: 'R$ 200 a mais que o quê? Por quanto você divide?',
          fala: 'Duzentos reais a mais que o quê? Por quanto você divide?',
          opcoes: [
            { texto: 'Por 1.000, o preço à vista', certa: true, explica: 'Isso. O à vista é o 100 %: o preço da TV hoje.', fala: 'Isso. O à vista é o cem por cento: o preço da TV hoje.' },
            { texto: 'Por 1.200, o total parcelado', erro: 'porcentagem-sobre-o-valor-errado', explica: 'Você quer saber quanto o parcelado custa a mais que o à vista. O todo é o à vista, R$ 1.000.', fala: 'Você quer saber quanto o parcelado custa a mais que o à vista. O todo é o à vista, mil reais.' },
          ],
          linha: { tex: '200 \\div 1.000 = 0{,}2', fala: 'duzentos dividido por mil dá zero vírgula dois' },
        },
        {
          pergunta: 'O parcelado "sem juros" custa quantos por cento a mais?',
          fala: 'O parcelado sem juros custa quantos por cento a mais?',
          opcoes: [
            { texto: '20 %', certa: true, explica: 'Isso. Você paga 20 % a mais para dividir em 12 meses. Com a conta na mão, a escolha é sua.', fala: 'Isso. Você paga vinte por cento a mais para dividir em doze meses. Com a conta na mão, a escolha é sua.', mostra: TV('20 %') },
            { texto: '0 %: é sem juros', explica: 'Sem juros no nome, mas o total é R$ 200 maior que o à vista: 20 % a mais.', fala: 'Sem juros no nome, mas o total é duzentos reais maior que o à vista: vinte por cento a mais.', mostra: TV('20 %') },
          ],
          linha: { tex: '0{,}2 = 20\\,\\%', fala: 'zero vírgula dois são vinte por cento a mais' },
        },
      ],
      esboco: 'A missão da unidade, com a aula 4: a diferença como parte, o à vista como todo. A conta não diz o que comprar; diz quanto custa cada escolha.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: **R$ 2.000** a **5 %** ao mês, juros compostos, por **2 meses**. Quantos reais fica a dívida?',
      fala: 'No papel: dois mil reais a cinco por cento ao mês, juros compostos, por dois meses. Quantos reais fica a dívida?',
      resposta: 2205,
      resolucao: [
        { tex: '2.000 \\times 1{,}05 = 2.100', fala: 'dois mil vezes um vírgula zero cinco são dois mil e cem' },
        { tex: '2.100 \\times 1{,}05 = 2.205', fala: 'dois mil e cem vezes um vírgula zero cinco são dois mil duzentos e cinco' },
      ],
      esboco: 'O fator de 5 % é 1,05. Confere: os juros do segundo mês, R$ 105, são 5 % de 2.100, não de 2.000. Nos simples seriam R$ 2.200.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['juros-n1', 'juros-n2', 'juros-n3'],
      esboco: 'Nível 1: juros simples, a dívida no fim de 2 a 4 meses, com a tabela e o + de cada mês. Nível 2: juros compostos por 2 ou 3 meses, com a tabela e o fator. Nível 3: à vista ou parcelado (quantos por cento a mais) e os juros compostos pagos, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Em 3 meses, **R$ 1.331** nos compostos, contra R$ 1.300 nos simples. Fim da unidade. Na próxima: números negativos.',
      fala: 'Em três meses, mil trezentos e trinta e um reais nos compostos, contra mil e trezentos nos simples. Fim da unidade. Na próxima: números negativos.',
      visual: LADO_A_LADO,
      esboco: 'Responde ao gancho com as duas linhas lado a lado e fecha a unidade. A missão "À vista ou parcelado?" junta as seis aulas.',
    },
  ],
}
