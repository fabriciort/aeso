import type { Aula, Visual } from '@/lib/formation/schema'

// Avaliação final. Doze questões no estilo da prova de Matemática do ENCCEJA
// Ensino Fundamental: uma situação do dia a dia, um enunciado curto, opções
// de resposta e, quase sempre, uma figura, uma tabela ou um gráfico. Uma
// questão de cada assunto da Matemática Básica: divisão com resto, frações,
// medidas, proporção, porcentagem, negativos, raiz quadrada, equação,
// volume, gráfico, média e probabilidade. As opções erradas são os erros
// comuns da formação, cada uma desmontada com o visual. O anote dá o jeito
// de fazer uma questão de prova (ler, fazer a conta, conferir se faz
// sentido). O momento-chave é o conjunto: o aluno vê que sabe resolver
// questões de todos os assuntos. O fecho comemora a conclusão da
// Matemática Básica e aponta a prova do ENCCEJA e o próximo módulo.

const livre = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado, esboco })
const chave = (divisao: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { divisao }, esboco })
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const quadro = (medida: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { medida: { casas: ['L', 'dL', 'cL', 'mL'], ...medida } }, esboco })
const tab = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })
const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { sinais: true, ...estado }, esboco })
const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })
const balanca = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'balanca', estado, esboco })
const sol = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'solido', estado, esboco })
const graf = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grafico', estado, esboco })
const dados = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'dados', estado, esboco })
const sort = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'sorteio', estado, esboco })

/** As partes da Matemática Básica, como no mapa. */
const PARTES = ['Números e operações', 'Partes do todo', 'Além dos naturais', 'Álgebra inicial', 'Espaço e forma', 'Relações e dados', 'Avaliação final']
/** Os módulos da formação. */
const MODULOS = ['Matemática Básica', 'Álgebra e Funções', 'Geometria e Trigonometria', 'Cálculo']

/** 130 pessoas em ônibus de 40 lugares. */
const ONIBUS = { dividendo: 130, divisor: 40 }
const ONIBUS_FEITO = { ...ONIBUS, quociente: '3', linhas: [['−120', 2], ['10', 2]] }

/** A pizza em 8 fatias; 3 comidas (pintadas). */
const PIZZA = { partes: 8, pintadas: 3, semFracao: true }
const SOBROU = { partes: 8, pintadas: 5, marcadas: [3, 4, 5, 6, 7], rotulo: '5/8' }

/** A receita: 3 xícaras para 12 pães; para 20, passando por 4 pães. */
const RECEITA = (farinha: (number | string)[], pao: number[], setas: unknown[]) => ({ linhas: [{ rotulo: 'pães', valores: pao }, { rotulo: 'xícaras', valores: farinha }], setas })
const RECEITA_FEITA = RECEITA([3, 1, 5], [12, 4, 20], [{ de: 0, para: 1, rotulo: '÷ 3' }, { de: 1, para: 2, rotulo: '× 5' }, { de: 0, para: 1, rotulo: '÷ 3', embaixo: true }, { de: 1, para: 2, rotulo: '× 5', embaixo: true }])

/** A TV de R$ 2.000: cada quadradinho vale R$ 20. */
const TV = { leitura: { vezes: 20, antes: 'R$ ' } }

/** O terreno quadrado de 144 m². */
const TERRENO = (lados: unknown[], nome: string) => ({ poligono: { vertices: [[0, 0], [12, 0], [12, 12], [0, 12]], preenchido: true, lados, nome, angulosRetos: [0, 1, 2, 3] } })

/** O plano de celular: R$ 30 mais R$ 2 por GB; a conta veio R$ 46. */
const CELULAR = { esquerda: { x: 2, pesos: [10, 10, 10] }, direita: { pesos: [10, 10, 10, 10], n: 6 }, valor: 8 }

/** A caixa-d'água: 2 m por 1 m por 1 m. */
const CAIXA = { comprimento: 2, largura: 1, altura: 1, unidade: 'm' }

/** A conta de luz, de janeiro a abril. */
const LUZ = { dados: [['jan', 120], ['fev', 90], ['mar', 150], ['abr', 110]], antes: 'R$ ', titulo: 'Conta de luz' }

/** Os km que Ana correu em 5 dias: soma 35, média 7, mediana e moda 6. */
const CORRIDA = { valores: [4, 6, 11, 6, 8], unidade: 'km', de: 2, ate: 12, passo: 1 }

/** O saco: 2 vermelhas, 3 azuis e 5 verdes. */
const SACO = { bolas: { vermelha: 2, azul: 3, verde: 5 } }
const AZUIS = { ...SACO, favoraveis: { cor: 'azul' }, chance: true, simplificada: true, porcentagem: true }

export const aula: Aula = {
  id: 'B.U20.A2',
  titulo: 'Avaliação final',
  objetivo: 'Resolver questões de múltipla escolha no estilo da prova de Matemática do ENCCEJA Ensino Fundamental, uma de cada assunto da Matemática Básica, lendo a situação, fazendo a conta e conferindo se a resposta faz sentido.',
  modelo: 'livre',
  esboco: 'Abre com o caminho da Matemática Básica, com a luz na última parada: a avaliação. Depois, doze questões como as da prova, cada uma com o seu visual de sempre: a chave da divisão (os ônibus), a barra (a pizza), o quadro de unidades (os copos), a tabela de proporção (a receita), a grade em reais (a TV), a reta com sinais (a temperatura), a figura (o terreno), a balança (o plano de celular), o sólido (a caixa-d\'água), o gráfico de barras (a conta de luz), o gráfico de pontos (a corrida) e o saco de bolas (a chance). Cada opção errada é um erro comum, e o palco desmonta o erro. O anote, depois da primeira, dá o jeito de fazer uma questão. Fecha com o caminho dos módulos: a Básica concluída e o próximo passo aceso.',
  vega: 'Ideia central: juntar tudo. Cada questão é de um assunto da Matemática Básica, no estilo do ENCCEJA Ensino Fundamental (o exame do Inep para certificar jovens e adultos): situação do dia a dia, enunciado curto, opções, às vezes com gráfico, tabela ou figura. As questões são da aula, no estilo da prova, não são questões oficiais. As opções erradas são os erros comuns: arredondar os ônibus para baixo, dar a parte comida no lugar da que sobrou, converter litros com o fator errado, somar na proporção, dar o desconto no lugar do preço, tirar um negativo como positivo, achar que a raiz é a metade, esquecer o valor fixo, achar que 1 m³ é 1 litro, responder outra pergunta no gráfico, trocar média e mediana, pôr embaixo só os casos que não servem. Guie com "O que a pergunta pede, exatamente?", "Que conta resolve?", "A resposta faz sentido na situação?". Lembre que a formação prepara para o ENCCEJA, mas não emite o certificado oficial: a inscrição e as datas estão no edital do Inep.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Hora de juntar tudo. São **12 questões** como as da prova do ENCCEJA, uma de cada assunto. Leia, faça a conta e escolha.',
      fala: 'Hora de juntar tudo. São doze questões como as da prova do encceja, uma de cada assunto. Leia, faça a conta e escolha.',
      visual: livre({ jornada: PARTES, aqui: 6, feitas: 6 }, 'O caminho da Matemática Básica, de Números e operações até a Avaliação final. As seis partes feitas; a última acesa com "você está aqui".'),
      esboco: 'O aluno vê de onde veio. A prova é a última parada.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma excursão tem **130** pessoas, em ônibus de **40** lugares. Quantos ônibus, no mínimo?',
      fala: 'Uma excursão tem cento e trinta pessoas, em ônibus de quarenta lugares. Quantos ônibus, no mínimo?',
      visual: chave(ONIBUS, 'A chave da divisão: 130 dividido por 40, ainda sem o quociente.'),
      opcoes: [
        {
          texto: '4 ônibus', certa: true,
          explica: 'Isso. As 10 pessoas que sobram vão num 4º ônibus.',
          fala: 'Isso. As dez pessoas que sobram vão num quarto ônibus.',
          mostra: chave(ONIBUS_FEITO, 'A conta armada: quociente 3, resto 10.'),
        },
        {
          texto: '3 ônibus', erro: 'ignora-contexto-do-resto',
          explica: 'Com 3 ônibus, 10 pessoas ficam em casa. Faltou um.',
          fala: 'Com três ônibus, dez pessoas ficam em casa. Faltou um.',
          mostra: chave(ONIBUS_FEITO, 'A conta armada: quociente 3, resto 10.'),
        },
        {
          texto: '10 ônibus', erro: 'troca-quociente-e-resto',
          explica: '10 é o resto: as pessoas que sobram, não os ônibus.',
          fala: 'Dez é o resto: as pessoas que sobram, não os ônibus.',
          mostra: chave(ONIBUS_FEITO, 'A conta armada: quociente 3, resto 10.'),
        },
        {
          texto: '90 ônibus', erro: 'operacao-trocada',
          explica: '$130 - 40$ tira um ônibus só. Divida: quantos 40 cabem em 130?',
          fala: 'Cento e trinta menos quarenta tira um ônibus só. Divida: quantos quarenta cabem em cento e trinta?',
          mostra: chave(ONIBUS_FEITO, 'A conta armada: quociente 3, resto 10.'),
        },
      ],
      esboco: 'A primeira questão é a da divisão com resto, a que a prova adora: a conta dá 3, a resposta é 4.',
    },
    {
      tipo: 'anote',
      titulo: 'Questão de prova',
      definicao: 'Numa questão de escolher: leia a pergunta até o fim, faça a conta e **confira se a resposta faz sentido** na situação.',
      exemplo: { tex: '130 \\div 40 = 3 \\text{, resto } 10 \\;\\Rightarrow\\; 4 \\text{ ônibus}', fala: 'cento e trinta dividido por quarenta, três, resto dez: quatro ônibus' },
      alerta: 'As opções erradas são os erros mais comuns. Não marque a primeira que bater com a conta: confira.',
      esboco: 'Na página: os três passos (ler, fazer a conta, conferir) e a conta dos ônibus.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma pizza foi cortada em **8** fatias iguais. Você comeu **3**. Que fração da pizza sobrou?',
      fala: 'Uma pizza foi cortada em oito fatias iguais. Você comeu três. Que fração da pizza sobrou?',
      visual: barra(PIZZA, 'A barra em 8 partes, com 3 pintadas: as fatias comidas.'),
      opcoes: [
        {
          texto: '$\\frac{5}{8}$', certa: true,
          explica: 'Isso. Sobraram 5 fatias, de 8.',
          fala: 'Isso. Sobraram cinco fatias, de oito.',
          mostra: barra(SOBROU, 'As 5 fatias que sobraram pintadas, com 5/8 à direita.'),
        },
        {
          texto: '$\\frac{3}{8}$', erro: 'responde-outra-pergunta',
          explica: '3/8 é o que você comeu. A pergunta é o que sobrou: 5 de 8.',
          fala: 'Três oitavos é o que você comeu. A pergunta é o que sobrou: cinco de oito.',
          mostra: barra(SOBROU, 'As 5 fatias que sobraram pintadas.'),
        },
        {
          texto: '$\\frac{5}{3}$', erro: 'pintadas-sobre-nao-pintadas',
          explica: 'Embaixo vai a pizza inteira, as 8 fatias, e não só as 3 comidas.',
          fala: 'Embaixo vai a pizza inteira, as oito fatias, e não só as três comidas.',
          mostra: barra(SOBROU, 'As 5 fatias que sobraram pintadas, de 8.'),
        },
        {
          texto: '$\\frac{8}{5}$', erro: 'troca-numerador-denominador',
          explica: 'Embaixo vai em quantas partes a pizza foi cortada: 8. Em cima, as que sobraram: 5.',
          fala: 'Embaixo vai em quantas partes a pizza foi cortada: oito. Em cima, as que sobraram: cinco.',
          mostra: barra(SOBROU, 'As 5 fatias que sobraram pintadas, de 8.'),
        },
      ],
      esboco: 'Frações (unidade 7). A barra pinta as comidas; a resposta são as outras.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma garrafa tem **1,5 L** de suco. Quantos copos de **250 mL** ela enche?',
      fala: 'Uma garrafa tem um litro e meio de suco. Quantos copos de duzentos e cinquenta mililitros ela enche?',
      visual: quadro({ numero: '1,5', de: 'L' }, 'O quadro de unidades com 1,5 na casa do litro.'),
      opcoes: [
        {
          texto: '6 copos', certa: true,
          explica: 'Isso. 1,5 L são 1.500 mL, e $1.500 \\div 250 = 6$.',
          fala: 'Isso. Um litro e meio são mil e quinhentos mililitros, e mil e quinhentos dividido por duzentos e cinquenta, seis.',
          mostra: quadro({ numero: '1,5', de: 'L', para: 'mL' }, 'A vírgula anda até depois do mL: 1,5 L = 1.500 mL.'),
        },
        {
          texto: '60 copos', erro: 'fator-de-conversao-errado',
          explica: 'Do litro ao mililitro são 3 casas: 1,5 L são 1.500 mL, não 15.000. Dá 6 copos.',
          fala: 'Do litro ao mililitro são três casas: um litro e meio são mil e quinhentos mililitros, não quinze mil. Dá seis copos.',
          mostra: quadro({ numero: '1,5', de: 'L', para: 'mL' }, 'A vírgula anda três casas: 1.500 mL.'),
        },
        {
          texto: '0,6 copo', erro: 'fator-de-conversao-errado',
          explica: '1 L tem 1.000 mL, não 100. Andando 3 casas, 1,5 L são 1.500 mL: 6 copos.',
          fala: 'Um litro tem mil mililitros, não cem. Andando três casas, um litro e meio são mil e quinhentos mililitros: seis copos.',
          mostra: quadro({ numero: '1,5', de: 'L', para: 'mL' }, 'A vírgula anda três casas: 1.500 mL.'),
        },
      ],
      esboco: 'Medidas e decimais (unidades 8 e 9). O quadro de unidades leva o litro ao mililitro.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma receita usa **3** xícaras de farinha para **12** pães. Quantas xícaras para **20** pães?',
      fala: 'Uma receita usa três xícaras de farinha para doze pães. Quantas xícaras para vinte pães?',
      visual: tab(RECEITA([3, '?'], [12, 20], []), 'A tabela de proporção: 12 pães com 3 xícaras; 20 pães com "?".'),
      opcoes: [
        {
          texto: '5 xícaras', certa: true,
          explica: 'Isso. 3 xícaras dão 12 pães: 1 xícara, 4 pães. Para 20 pães, 5 xícaras.',
          fala: 'Isso. Três xícaras dão doze pães: uma xícara, quatro pães. Para vinte pães, cinco xícaras.',
          mostra: tab(RECEITA_FEITA, 'A tabela passa pelo 4: 12 ÷ 3 = 4 pães com 1 xícara; × 5, 20 pães com 5 xícaras.'),
        },
        {
          texto: '11 xícaras', erro: 'pensa-aditivamente',
          explica: 'São 8 pães a mais, mas não 8 xícaras a mais. A receita cresce multiplicando: passe pelo 1.',
          fala: 'São oito pães a mais, mas não oito xícaras a mais. A receita cresce multiplicando: passe pelo um.',
          mostra: tab(RECEITA_FEITA, 'A tabela passa pelo 4 e chega a 5 xícaras.'),
        },
        {
          texto: '80 xícaras', erro: 'razao-invertida',
          explica: 'Aí os números trocaram de lugar. Cada xícara dá 4 pães: para 20 pães, $20 \\div 4 = 5$.',
          fala: 'Aí os números trocaram de lugar. Cada xícara dá quatro pães: para vinte pães, vinte dividido por quatro, cinco.',
          mostra: tab(RECEITA_FEITA, 'A tabela passa pelo 4 e chega a 5 xícaras.'),
        },
      ],
      esboco: 'Proporção (unidade 10), passando pelo 1.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma TV custa **R$ 2.000**. À vista, tem **15 %** de desconto. Quanto você paga?',
      fala: 'Uma TV custa dois mil reais. À vista, tem quinze por cento de desconto. Quanto você paga?',
      visual: grade({ pintadas: 100, ...TV }, 'A grade inteira pintada: R$ 2.000. Cada quadradinho vale R$ 20.'),
      opcoes: [
        {
          texto: 'R$ 1.700', certa: true,
          explica: 'Isso. 15 % de 2.000 são 300. Você paga 85 %: R$ 1.700.',
          fala: 'Isso. Quinze por cento de dois mil são trezentos. Você paga oitenta e cinco por cento: mil e setecentos reais.',
          mostra: grade({ pintadas: 85, ...TV }, 'Quinze quadradinhos se apagam: ficam 85, R$ 1.700.'),
        },
        {
          texto: 'R$ 300', erro: 'desconto-como-preco-final',
          explica: 'R$ 300 é o desconto. Você paga o resto: $2.000 - 300 = 1.700$.',
          fala: 'Trezentos reais é o desconto. Você paga o resto: dois mil menos trezentos, mil e setecentos.',
          mostra: grade({ pintadas: 85, ...TV }, 'Ficam 85 quadradinhos: R$ 1.700.'),
        },
        {
          texto: 'R$ 1.985', erro: 'porcentagem-como-numero-inteiro',
          explica: '15 % não são R$ 15. São 15 quadradinhos de R$ 20: R$ 300 de desconto.',
          fala: 'Quinze por cento não são quinze reais. São quinze quadradinhos de vinte reais: trezentos de desconto.',
          mostra: grade({ pintadas: 85, ...TV }, 'Ficam 85 quadradinhos: R$ 1.700.'),
        },
        {
          texto: 'R$ 2.300', erro: 'operacao-trocada',
          explica: 'Desconto faz o preço cair. Os R$ 300 saem dos R$ 2.000: R$ 1.700.',
          fala: 'Desconto faz o preço cair. Os trezentos reais saem dos dois mil: mil e setecentos.',
          mostra: grade({ pintadas: 85, ...TV }, 'Ficam 85 quadradinhos: R$ 1.700.'),
        },
      ],
      esboco: 'Porcentagem (unidade 11), na grade lida em reais.',
    },
    {
      tipo: 'aposta',
      pergunta: 'De madrugada fez **−3 °C**. À tarde, **8 °C**. Quantos graus a temperatura subiu?',
      fala: 'De madrugada fez três graus abaixo de zero. À tarde, oito graus. Quantos graus a temperatura subiu?',
      visual: reta({ de: -5, ate: 10, passo: 1, numeros: [-3, 8] }, 'A reta com sinais, de −5 a 10, com o −3 (azul) e o 8 marcados.'),
      opcoes: [
        {
          texto: '11 graus', certa: true,
          explica: 'Isso. Do −3 ao 0 são 3 graus; do 0 ao 8, mais 8.',
          fala: 'Isso. Do menos três ao zero são três graus; do zero ao oito, mais oito.',
          mostra: reta({ de: -5, ate: 10, passo: 1, numeros: [-3, 8], saltos: [[-3, 0, '+3'], [0, 8, '+8']] }, 'Dois saltos: do −3 ao 0 (+3) e do 0 ao 8 (+8).'),
        },
        {
          texto: '5 graus', erro: 'tirar-negativo-subtrai',
          explica: '$8 - 3$ só vai do 3 ao 8. Do −3 até o 0 já são 3 graus: $8 - (-3) = 11$.',
          fala: 'Oito menos três só vai do três ao oito. Do menos três até o zero já são três graus: oito menos menos três, onze.',
          mostra: reta({ de: -5, ate: 10, passo: 1, numeros: [-3, 8], saltos: [[-3, 0, '+3'], [0, 8, '+8']] }, 'Os dois saltos: +3 e +8.'),
        },
        {
          texto: '8 graus', erro: 'responde-outra-pergunta',
          explica: '8 °C é onde a temperatura chegou. A pergunta é quanto ela subiu, desde o −3.',
          fala: 'Oito graus é onde a temperatura chegou. A pergunta é quanto ela subiu, desde o menos três.',
          mostra: reta({ de: -5, ate: 10, passo: 1, numeros: [-3, 8], saltos: [[-3, 0, '+3'], [0, 8, '+8']] }, 'Os dois saltos: +3 e +8.'),
        },
      ],
      esboco: 'Números negativos (unidade 12): a distância passa pelo zero.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um terreno quadrado tem **144 m²** de área. Quanto mede cada lado?',
      fala: 'Um terreno quadrado tem cento e quarenta e quatro metros quadrados de área. Quanto mede cada lado?',
      visual: fig(TERRENO(['?', null, null, null], '144 m²'), 'O terreno quadrado, com 144 m² no meio e "?" no lado de baixo.'),
      opcoes: [
        {
          texto: '12 m', certa: true,
          explica: 'Isso. $12 \\cdot 12 = 144$: a raiz quadrada de 144 é 12.',
          fala: 'Isso. Doze vezes doze, cento e quarenta e quatro: a raiz quadrada de cento e quarenta e quatro é doze.',
          mostra: fig({ ...TERRENO(['12 m', '12 m', null, null], '144 m²'), grade: true }, 'A grade aparece: 12 fileiras de 12 quadradinhos.'),
        },
        {
          texto: '72 m', erro: 'raiz-e-a-metade',
          explica: 'A raiz não é a metade: $72 \\cdot 72$ passa de 5.000. O lado vezes ele mesmo dá 144: 12.',
          fala: 'A raiz não é a metade: setenta e dois vezes setenta e dois passa de cinco mil. O lado vezes ele mesmo dá cento e quarenta e quatro: doze.',
          mostra: fig({ ...TERRENO(['12 m', '12 m', null, null], '144 m²'), grade: true }, 'A grade: 12 por 12.'),
        },
        {
          texto: '36 m', erro: 'confunde-area-perimetro',
          explica: 'Dividir por 4 reparte a volta entre os lados. Mas 144 é o chão: o lado vezes o lado. $12 \\cdot 12 = 144$.',
          fala: 'Dividir por quatro reparte a volta entre os lados. Mas cento e quarenta e quatro é o chão: o lado vezes o lado. Doze vezes doze.',
          mostra: fig({ ...TERRENO(['12 m', '12 m', null, null], '144 m²'), grade: true }, 'A grade: 12 por 12.'),
        },
      ],
      esboco: 'Raiz quadrada (unidade 13): o lado do quadrado.',
    },
    {
      tipo: 'passo',
      problema: 'Um plano de celular custa **R$ 30** por mês, mais **R$ 2** por GB extra. A conta veio **R$ 46**. Quantos GB extras?',
      fala: 'Um plano de celular custa trinta reais por mês, mais dois reais por gigabyte extra. A conta veio quarenta e seis reais. Quantos gigabytes extras?',
      visual: balanca(CELULAR, 'A balança: 2 caixas e três pesos de 10 contra quatro pesos de 10 e seis de 1.'),
      passos: [
        {
          pergunta: 'Com x os GB extras, qual é a equação?',
          fala: 'Com x os gigabytes extras, qual é a equação?',
          opcoes: [
            {
              texto: '$30 + 2x = 46$', certa: true,
              explica: 'Isso. Os R$ 30 fixos, mais R$ 2 por GB, dão os R$ 46.',
              fala: 'Isso. Os trinta reais fixos, mais dois reais por gigabyte, dão os quarenta e seis.',
              mostra: balanca({ ...CELULAR, mostraEquacao: true }, 'Embaixo, a equação da balança: 2x + 30 = 46.'),
            },
            {
              texto: '$2x = 46$', erro: 'esquece-valor-fixo',
              explica: 'Os R$ 30 do plano entram na conta todo mês. Eles também estão nos R$ 46.',
              fala: 'Os trinta reais do plano entram na conta todo mês. Eles também estão nos quarenta e seis.',
            },
            {
              texto: '$30x + 2 = 46$', erro: 'equacao-diferente-do-problema',
              explica: 'Quem multiplica o x é o preço de cada GB, R$ 2. Os R$ 30 vêm uma vez só.',
              fala: 'Quem multiplica o x é o preço de cada gigabyte, dois reais. Os trinta reais vêm uma vez só.',
            },
          ],
          linha: { tex: '30 + 2x = 46', fala: 'trinta mais dois x igual a quarenta e seis' },
        },
        {
          pergunta: 'Quanto vale x?',
          opcoes: [
            {
              texto: '8', certa: true,
              explica: 'Isso. Tirando 30 dos dois lados, $2x = 16$; partindo em 2, $x = 8$.',
              fala: 'Isso. Tirando trinta dos dois lados, dois x igual a dezesseis; partindo em dois, x igual a oito.',
              mostra: balanca({ esquerda: { x: 1 }, direita: { n: 8 }, valor: 8, abrir: true, rotulo: 'x = 8 GB' }, 'Uma caixa contra 8 pesos. A caixa se abre com 8 dentro; embaixo, x = 8 GB.'),
            },
            {
              texto: '16', erro: 'esquece-de-dividir',
              explica: '16 é o preço dos 2x, de todos os GB. Cada GB custa R$ 2: são 8.',
              fala: 'Dezesseis é o preço dos dois x, de todos os gigabytes. Cada gigabyte custa dois reais: são oito.',
            },
            {
              texto: '38', erro: 'desfaz-com-a-mesma-operacao',
              explica: 'Somar 30 não desfaz o + 30: tire 30 dos dois lados. Sobra $2x = 16$.',
              fala: 'Somar trinta não desfaz o mais trinta: tire trinta dos dois lados. Sobra dois x igual a dezesseis.',
            },
          ],
          linha: { tex: '2x = 16 \\qquad x = 8', fala: 'dois x igual a dezesseis, x igual a oito' },
        },
      ],
      esboco: 'Equação do 1º grau (unidade 15), na balança: montar e resolver. A única questão em dois passos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma caixa-d\'água tem **2 m** por **1 m** por **1 m**. Quantos litros cabem nela?',
      fala: 'Uma caixa-d\'água tem dois metros por um metro por um metro. Quantos litros cabem nela?',
      visual: sol(CAIXA, 'A caixa-d\'água em perspectiva: 2 m, 1 m e 1 m.'),
      opcoes: [
        {
          texto: '2.000 litros', certa: true,
          explica: 'Isso. São 2 m³, e cada m³ guarda 1.000 litros.',
          fala: 'Isso. São dois metros cúbicos, e cada metro cúbico guarda mil litros.',
          mostra: sol({ ...CAIXA, camadas: 1 }, 'A caixa vira cubos de 1 m: 2 cubos, 2 m³.'),
        },
        {
          texto: '2 litros', erro: 'confunde-m3-com-litro',
          explica: '2 litros cabem numa garrafa. Um cubo de 1 m guarda 1.000 litros: são 2.000.',
          fala: 'Dois litros cabem numa garrafa. Um cubo de um metro guarda mil litros: são dois mil.',
          mostra: sol({ ...CAIXA, camadas: 1 }, 'Os 2 cubos de 1 m.'),
        },
        {
          texto: '200 litros', erro: 'fator-de-conversao-errado',
          explica: '1 m³ tem 1.000 litros, não 100: 10 por 10 por 10 cubos de 1 litro.',
          fala: 'Um metro cúbico tem mil litros, não cem: dez por dez por dez cubos de um litro.',
          mostra: sol({ ...CAIXA, camadas: 1 }, 'Os 2 cubos de 1 m.'),
        },
        {
          texto: '10.000 litros', erro: 'confunde-volume-superficie',
          explica: 'Os 10 m² são a casca da caixa, as 6 faces. O que cabe dentro é o volume: 2 m³.',
          fala: 'Os dez metros quadrados são a casca da caixa, as seis faces. O que cabe dentro é o volume: dois metros cúbicos.',
          mostra: sol({ ...CAIXA, camadas: 1 }, 'Os 2 cubos de 1 m: o que cabe dentro.'),
        },
      ],
      esboco: 'Volume (unidade 17) e o litro (unidade 9).',
    },
    {
      tipo: 'aposta',
      pergunta: 'Pelo gráfico, quanto a conta de luz de março passou a de fevereiro?',
      visual: graf(LUZ, 'O gráfico de barras da conta de luz: jan R$ 120, fev R$ 90, mar R$ 150, abr R$ 110.'),
      opcoes: [
        {
          texto: 'R$ 60', certa: true,
          explica: 'Isso. Março, R$ 150; fevereiro, R$ 90. $150 - 90 = 60$.',
          fala: 'Isso. Março, cento e cinquenta; fevereiro, noventa. Cento e cinquenta menos noventa, sessenta.',
          mostra: graf({ ...LUZ, destaque: [1, 2] }, 'As barras de fevereiro e março acesas.'),
        },
        {
          texto: 'R$ 150', erro: 'responde-outra-pergunta',
          explica: 'R$ 150 é a conta de março. A pergunta é a diferença para fevereiro: $150 - 90$.',
          fala: 'Cento e cinquenta é a conta de março. A pergunta é a diferença para fevereiro: cento e cinquenta menos noventa.',
          mostra: graf({ ...LUZ, destaque: [1, 2] }, 'As barras de fevereiro e março acesas.'),
        },
        {
          texto: 'R$ 240', erro: 'operacao-trocada',
          explica: '"Passou" pede a diferença, não a soma: $150 - 90 = 60$.',
          fala: 'Passou pede a diferença, não a soma: cento e cinquenta menos noventa, sessenta.',
          mostra: graf({ ...LUZ, destaque: [1, 2] }, 'As barras de fevereiro e março acesas.'),
        },
        {
          texto: 'R$ 30', erro: 'responde-outra-pergunta',
          explica: 'Essa é a diferença de março para janeiro. Fevereiro é a barra mais baixa, R$ 90.',
          fala: 'Essa é a diferença de março para janeiro. Fevereiro é a barra mais baixa, noventa.',
          mostra: graf({ ...LUZ, destaque: [1, 2] }, 'As barras de fevereiro e março acesas.'),
        },
      ],
      esboco: 'Ler gráficos (unidade 18): achar as duas barras e fazer a conta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Ana correu **4**, **6**, **11**, **6** e **8 km** em 5 dias. Qual foi a média por dia?',
      fala: 'Ana correu quatro, seis, onze, seis e oito quilômetros em cinco dias. Qual foi a média por dia?',
      visual: dados(CORRIDA, 'Os 5 valores como pontos sobre a reta dos km, de 2 a 12; dois pontos empilhados no 6.'),
      opcoes: [
        {
          texto: '7 km', certa: true,
          explica: 'Isso. $4 + 6 + 11 + 6 + 8 = 35$, e $35 \\div 5 = 7$.',
          fala: 'Isso. Quatro mais seis mais onze mais seis mais oito, trinta e cinco, dividido por cinco, sete.',
          mostra: dados({ ...CORRIDA, media: true }, 'O apoio embaixo da reta, no 7: a reta fica em equilíbrio.'),
        },
        {
          texto: '6 km', erro: 'troca-media-mediana-moda',
          explica: '6 é o do meio da fila, a mediana, e o que mais se repete. A média é a soma dividida por 5: 7.',
          fala: 'Seis é o do meio da fila, a mediana, e o que mais se repete. A média é a soma dividida por cinco: sete.',
          mostra: dados({ ...CORRIDA, media: true }, 'O apoio no 7.'),
        },
        {
          texto: '7,5 km', erro: 'media-do-menor-e-do-maior',
          explica: 'Esse é o meio entre o 4 e o 11. A média usa todos os dias: $35 \\div 5 = 7$.',
          fala: 'Esse é o meio entre o quatro e o onze. A média usa todos os dias: trinta e cinco dividido por cinco, sete.',
          mostra: dados({ ...CORRIDA, media: true }, 'O apoio no 7.'),
        },
        {
          texto: '7,25 km', erro: 'media-esquece-valores',
          explica: 'O 6 aparece duas vezes, e são 5 dias: some todos e divida por 5. Dá 7.',
          fala: 'O seis aparece duas vezes, e são cinco dias: some todos e divida por cinco. Dá sete.',
          mostra: dados({ ...CORRIDA, media: true }, 'O apoio no 7.'),
        },
      ],
      esboco: 'Estatística (unidade 19): a média como equilíbrio.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Num saco há **2** bolas vermelhas, **3** azuis e **5** verdes. Qual é a chance de tirar uma azul?',
      fala: 'Num saco há duas bolas vermelhas, três azuis e cinco verdes. Qual é a chance de tirar uma azul?',
      visual: sort(SACO, 'O saco: 10 bolas, 2 vermelhas, 3 azuis e 5 verdes.'),
      opcoes: [
        {
          texto: '30 %', certa: true,
          explica: 'Isso. 3 azuis de 10 bolas: $\\frac{3}{10}$, 30 %.',
          fala: 'Isso. Três azuis de dez bolas: três décimos, trinta por cento.',
          mostra: sort(AZUIS, 'As 3 azuis acesas. Embaixo: 3 de 10 = 3/10 = 30 %.'),
        },
        {
          texto: '3 %', erro: 'parte-como-porcentagem',
          explica: '3 são as bolas, não a porcentagem. 3 de 10 são 30 de 100: 30 %.',
          fala: 'Três são as bolas, não a porcentagem. Três de dez são trinta de cem: trinta por cento.',
          mostra: sort(AZUIS, 'As 3 azuis acesas: 3 de 10.'),
        },
        {
          texto: 'cerca de 43 %', erro: 'pintadas-sobre-nao-pintadas',
          explica: 'Isso é 3 de 7: embaixo ficaram só as bolas que não são azuis. Embaixo vão todas as 10.',
          fala: 'Isso é três de sete: embaixo ficaram só as bolas que não são azuis. Embaixo vão todas as dez.',
          mostra: sort(AZUIS, 'As 3 azuis acesas, de 10 bolas.'),
        },
        {
          texto: 'cerca de 33 %', erro: 'resultados-como-casos-iguais',
          explica: 'São 3 cores, mas não com a mesma quantidade: há 5 verdes. Conte bola por bola.',
          fala: 'São três cores, mas não com a mesma quantidade: há cinco verdes. Conte bola por bola.',
          mostra: sort(AZUIS, 'As 3 azuis acesas, de 10 bolas.'),
        },
      ],
      esboco: 'Probabilidade (unidade 19): favoráveis sobre possíveis, em porcentagem.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['prova-n1', 'prova-n2', 'prova-n3'],
      esboco: 'Questões novas, misturadas, no mesmo estilo. Nível 1: com o visual (a grade do desconto, a pizza, o saco de bolas, a média). Nível 2: o caso que pega (o resto da divisão, o negativo, o decimal maior, a conversão). Nível 3: duas contas seguidas (a equação, a raiz, o volume em litros, a proporção).',
    },
    {
      tipo: 'fecho',
      texto: 'Você concluiu a **Matemática Básica**: 109 aulas, de contar até a chance. Próximo passo: a prova do ENCCEJA e o módulo Álgebra e Funções.',
      fala: 'Você concluiu a Matemática Básica: cento e nove aulas, de contar até a chance. Próximo passo: a prova do encceja e o módulo Álgebra e Funções.',
      visual: livre({ jornada: MODULOS, aqui: 1, feitas: 1 }, 'O caminho da formação: a Matemática Básica feita; Álgebra e Funções acesa com "você está aqui"; Geometria e Trigonometria e Cálculo esperando.'),
      esboco: 'A comemoração precisa: o que foi feito e o que vem. A luz já está na próxima parada.',
    },
  ],
}
