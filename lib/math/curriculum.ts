// A Formação em Matemática as data: módulos → unidades → aulas, each with
// its prerequisites. This is the single source of truth for the map of the
// formation (the prerequisite tree) and, later, for routing and diagnosis.
// Content plan: docs/MATEMATICA.md.

export type ModuleId = 'basica' | 'algebra' | 'geometria' | 'calculo-1' | 'calculo-2' | 'calculo-3' | 'calculo-4'

export interface Lesson {
  /** e.g. "B.U7.A8" */
  id: string
  title: string
  /** The one idea of the lesson, in a sentence. */
  idea: string
  /** Lessons in other units this lesson needs (the previous lesson of the same unit is implied). */
  requires?: string[]
}

export interface Unit {
  /** e.g. "B.U7" */
  id: string
  module: ModuleId
  /** Number shown on the map ("7"). */
  n: number
  title: string
  /** Short name for the map node (two lines at most). */
  short: string
  /** Part of the module (color group). */
  part: string
  /** What the student can do at the end. */
  outcome: string
  /** Units this one needs (direct prerequisites, including other modules). */
  requires: string[]
  lessons: Lesson[]
  /** Interactive laboratório that closes the unit (slug). */
  lab?: string
  /** Real-world mission planned for the unit. */
  mission?: string
}

export interface Part {
  id: string
  title: string
  color: string
}

export interface Module {
  id: ModuleId
  title: string
  /** Short name for tight places ("Álgebra"). */
  short: string
  /** One line: what it forms. */
  promise: string
  /** External milestone, said honestly. */
  milestone?: string
  color: string
  requires: ModuleId[]
  parts: Part[]
  units: Unit[]
  /** Whole module is still being planned in detail. */
  planned?: boolean
}

const L = (unit: string, items: [string, string, string[]?][]): Lesson[] =>
  items.map(([title, idea, requires], i) => ({ id: `${unit}.A${i + 1}`, title, idea, requires }))

// ---------------------------------------------------------------- Matemática Básica

const B = 'basica' as const

const BASICA_UNITS: Unit[] = [
  {
    id: 'B.U0', module: B, n: 0, part: 'inicio', title: 'Comece aqui', short: 'Comece aqui',
    outcome: 'Sabe como estudar aqui: caderno, rascunho, ritmo, Vega, e onde começar.',
    requires: [],
    lessons: L('B.U0', [
      ['Como esta formação funciona', 'Caderno quadriculado, rascunho, voz, Vega e o seu ritmo; errar faz parte.'],
      ['Diagnóstico de entrada', 'Descobrir onde você começa no mapa.'],
    ]),
  },
  {
    id: 'B.U1', module: B, n: 1, part: 'A', title: 'O sistema de numeração', short: 'Sistema de numeração',
    outcome: 'Lê, escreve, compara, arredonda e estima números naturais.',
    requires: ['B.U0'],
    lessons: L('B.U1', [
      ['Agrupar de 10 em 10', 'Contamos em grupos de dez: dezenas, centenas, milhares.'],
      ['O zero que guarda o lugar', 'O valor de um algarismo depende da casa em que ele está.'],
      ['Números grandes', 'Mil, milhão, bilhão, e os dois jeitos de escrever o milhar.'],
      ['Comparar na reta numérica', 'Todo número tem um lugar na reta; mais à direita, maior.'],
      ['Arredondar e estimar', 'Um valor aproximado confere qualquer conta.'],
    ]),
  },
  {
    id: 'B.U2', module: B, n: 2, part: 'A', title: 'Adição e subtração', short: 'Adição e subtração',
    outcome: 'Soma e subtrai com e sem papel, e confere o resultado.',
    requires: ['B.U1'],
    lessons: L('B.U2', [
      ['Juntar, tirar, comparar, completar', 'Os quatro sentidos de somar e subtrair; o troco é completar.'],
      ['Contas de cabeça', 'Decompor e completar a dezena.'],
      ['Adição armada', 'O reagrupamento, o famoso "vai um", é trocar 10 unidades por 1 dezena.'],
      ['Subtração armada', 'O desagrupamento, o famoso "empresta", é trocar 1 dezena por 10 unidades.'],
      ['Conferir', 'Estimativa e operação inversa.', ['B.U1.A5']],
    ]),
  },
  {
    id: 'B.U3', module: B, n: 3, part: 'A', title: 'Multiplicação', short: 'Multiplicação',
    outcome: 'Multiplica com fluência e explica por que a conta funciona.',
    requires: ['B.U2'],
    lessons: L('B.U3', [
      ['Grupos iguais e retângulos', 'Multiplicar é contar grupos iguais; um retângulo mostra isso.'],
      ['A tabuada com estratégia', 'Dobros, ordem que não importa e fatos derivados, sem decoreba.'],
      ['Multiplicar por 10, 100, 1000', 'Os algarismos andam de casa.', ['B.U1.A2']],
      ['Quebrar para multiplicar', 'Partir o retângulo: a propriedade distributiva.'],
      ['Multiplicação armada', 'Do método da área ao algoritmo.'],
    ]),
  },
  {
    id: 'B.U4', module: B, n: 4, part: 'A', title: 'Divisão', short: 'Divisão',
    outcome: 'Divide, interpreta o resto e confere com a multiplicação.',
    requires: ['B.U3'],
    lessons: L('B.U4', [
      ['Repartir e quantos cabem', 'Os dois sentidos da divisão.'],
      ['O resto', 'O que sobra, e o que fazer com o que sobra.'],
      ['Divisão longa', 'Repartir notas de 100, de 10 e de 1.'],
      ['A prova real', 'Divisão e multiplicação desfazem uma à outra.'],
      ['Por que não se divide por zero', 'Nenhum número resolve a pergunta.'],
    ]),
  },
  {
    id: 'B.U5', module: B, n: 5, part: 'A', title: 'Expressões numéricas', short: 'Expressões',
    outcome: 'Resolve expressões e usa a calculadora com consciência.',
    requires: ['B.U4'],
    lessons: L('B.U5', [
      ['A ordem das operações', 'Uma convenção para todos lerem a conta do mesmo jeito.'],
      ['Parênteses e o sinal de igual', 'Mudar a ordem, e usar o "=" só entre coisas iguais.'],
      ['Calculadora', 'Por que duas calculadoras podem dar resultados diferentes.'],
    ]),
  },
  {
    id: 'B.U6', module: B, n: 6, part: 'A', title: 'Múltiplos, divisores e primos', short: 'Múltiplos e primos',
    outcome: 'Fatora números e usa MMC e MDC.',
    requires: ['B.U4'],
    lessons: L('B.U6', [
      ['Múltiplos e divisores', 'Quem cabe exatamente em quem.'],
      ['Regras de divisibilidade', 'Atalhos, e por que funcionam.'],
      ['Primos e fatoração', 'Os números que são tijolos de todos os outros.'],
      ['MMC e MDC', 'Quando os ônibus se encontram; cortar em pedaços iguais.'],
    ]),
  },
  {
    id: 'B.U7', module: B, n: 7, part: 'B', title: 'Frações', short: 'Frações',
    outcome: 'Opera com frações e explica cada regra com o desenho.',
    requires: ['B.U4', 'B.U6'],
    mission: 'Ampliar uma receita',
    lessons: L('B.U7', [
      ['Partes iguais de um todo', 'Fração só existe com partes iguais.'],
      ['Fração é um número', 'Toda fração tem um ponto na reta.', ['B.U1.A4']],
      ['Fração como divisão', '3/4 é o que cada um recebe ao dividir 3 por 4.', ['B.U4.A1']],
      ['Frações equivalentes', 'Cortar mais fino não muda a quantidade.'],
      ['Simplificar', 'O mesmo número, escrito com pedaços maiores.', ['B.U6.A3']],
      ['Comparar frações', 'Mesmo tamanho de pedaço, ou uma referência como 1/2.'],
      ['Somar com pedaços iguais', 'Só se somam pedaços do mesmo tamanho.'],
      ['Somar com pedaços diferentes', 'Primeiro deixar os pedaços do mesmo tamanho.', ['B.U6.A4']],
      ['Multiplicar frações', 'Fração de fração é a área de um retângulo.', ['B.U3.A1']],
      ['Dividir frações', 'Quantas vezes uma cabe na outra.'],
    ]),
  },
  {
    id: 'B.U8', module: B, n: 8, part: 'B', title: 'Decimais', short: 'Decimais',
    outcome: 'Usa decimais com segurança e converte de e para fração.',
    requires: ['B.U7'],
    lessons: L('B.U8', [
      ['Décimos e centésimos', 'As casas depois da vírgula; o centavo.', ['B.U1.A2']],
      ['Fração ↔ decimal', 'Dois jeitos de escrever o mesmo número.'],
      ['Comparar e arredondar', 'Comparar casa por casa, não pelo comprimento.'],
      ['Somar e subtrair', 'Vírgula embaixo de vírgula: casa com casa.', ['B.U2.A3']],
      ['Multiplicar', 'Por que se contam as casas decimais.', ['B.U7.A9']],
      ['Dividir e as dízimas', 'Divisões que não terminam.'],
    ]),
  },
  {
    id: 'B.U9', module: B, n: 9, part: 'B', title: 'Medidas', short: 'Medidas',
    outcome: 'Converte unidades com sentido, inclusive entre sistemas.',
    requires: ['B.U8'],
    mission: 'O piso da sala',
    lessons: L('B.U9', [
      ['Comprimento e o sistema métrico', 'Quilo, centi, mili: potências de 10.'],
      ['Massa e capacidade', 'Grama, miligrama, litro, mililitro.'],
      ['Área', 'Por que 1 m² tem 10.000 cm².', ['B.U3.A1']],
      ['Volume e o litro', '1 litro cabe num cubo de 10 cm de lado.'],
      ['Tempo', 'Horas e minutos contam de 60 em 60.'],
      ['Outras unidades', 'Polegada, pé, milha e milha náutica; converter com fator.'],
    ]),
  },
  {
    id: 'B.U10', module: B, n: 10, part: 'B', title: 'Razão e proporção', short: 'Razão e proporção',
    outcome: 'Resolve situações proporcionais, inclusive concentração e diluição.',
    requires: ['B.U7', 'B.U8', 'B.U9'],
    mission: 'Preparar uma solução',
    lessons: L('B.U10', [
      ['Razão', 'Comparar quantidades por divisão: receitas e misturas.'],
      ['Escala', 'Mapa e planta baixa.'],
      ['Proporção e regra de três', 'Duas razões iguais, e como achar a que falta.'],
      ['Inversamente proporcional', 'Quando um aumenta, o outro diminui na mesma razão.'],
      ['Taxa unitária', 'Preço por kg, km/L, velocidade: quanto por um.'],
      ['Concentração e diluição', 'Quanto soluto em quanto volume; diluir é manter o soluto.', ['B.U9.A2']],
    ]),
  },
  {
    id: 'B.U11', module: B, n: 11, part: 'B', title: 'Porcentagem', short: 'Porcentagem',
    outcome: 'Calcula descontos, aumentos e juros, e decide entre à vista e parcelado.',
    requires: ['B.U10'],
    mission: 'À vista ou parcelado?',
    lessons: L('B.U11', [
      ['Por cento é por cem', 'Uma fração com denominador 100.'],
      ['Porcentagem de um valor', '10 %, 1 % e 50 % de cabeça.'],
      ['Aumento e desconto', 'Multiplicar por um fator: ×1,1 e ×0,9.', ['B.U8.A5']],
      ['Que porcentagem é?', 'A parte dividida pelo todo.'],
      ['Variações sucessivas', 'Dois descontos de 20 % não dão 40 %.'],
      ['Juros simples e compostos', 'Juros sobre juros fazem a dívida crescer cada vez mais rápido.'],
    ]),
  },
  {
    id: 'B.U12', module: B, n: 12, part: 'C', title: 'Números negativos', short: 'Negativos',
    outcome: 'Opera com negativos e explica a regra dos sinais.',
    requires: ['B.U5', 'B.U7'],
    lessons: L('B.U12', [
      ['Abaixo de zero', 'A reta continua para a esquerda.', ['B.U1.A4']],
      ['Somar e subtrair na reta', 'Andar para a direita ou para a esquerda.'],
      ['Tirar um negativo', 'Cancelar uma dívida aumenta o saldo.'],
      ['Multiplicar e dividir', 'A regra dos sinais nasce de um padrão.'],
      ['Os números racionais', 'Frações e decimais também podem ser negativos.'],
    ]),
  },
  {
    id: 'B.U13', module: B, n: 13, part: 'C', title: 'Potências e raízes', short: 'Potências e raízes',
    outcome: 'Usa potências e raízes e lê notação científica.',
    requires: ['B.U12', 'B.U9'],
    lessons: L('B.U13', [
      ['Potência', 'Multiplicar o mesmo número várias vezes.'],
      ['Propriedades sem decorar', 'Escrevendo por extenso, as regras aparecem sozinhas.'],
      ['Expoente zero e negativo', 'O padrão de dividir por 10 continua.'],
      ['Notação científica', 'Números enormes e minúsculos com potências de 10.', ['B.U8.A1']],
      ['Raiz quadrada', 'O lado do quadrado que tem aquela área.', ['B.U9.A3']],
      ['Estimar raízes e raiz cúbica', 'Entre quais quadrados o número está.'],
    ]),
  },
  {
    id: 'B.U14', module: B, n: 14, part: 'D', title: 'Linguagem algébrica', short: 'Linguagem algébrica',
    outcome: 'Escreve, simplifica e calcula o valor de expressões com letras.',
    requires: ['B.U5', 'B.U7', 'B.U12', 'B.U13'],
    lessons: L('B.U14', [
      ['Uma letra no lugar de um número', 'A letra guarda um número que ainda não sabemos, ou que muda.'],
      ['Expressões e valor numérico', 'Trocar a letra por um número e calcular.', ['B.U5.A1']],
      ['Termos semelhantes', 'x + x = 2x, mas x · x = x².', ['B.U13.A1']],
      ['Distributiva com letras', 'O retângulo partido, agora com letras.', ['B.U3.A4']],
      ['Traduzir frases', '"O dobro de um número menos 3" vira 2x − 3.'],
    ]),
  },
  {
    id: 'B.U15', module: B, n: 15, part: 'D', title: 'Equações do 1º grau', short: 'Equações',
    outcome: 'Resolve e monta equações do 1º grau, e confere a solução.',
    requires: ['B.U14'],
    lab: 'equacoes',
    lessons: L('B.U15', [
      ['Igualdade é equilíbrio', 'Uma equação é uma balança em equilíbrio.'],
      ['Resolver passo a passo', 'Fazer a mesma operação dos dois lados.', ['B.U4.A4']],
      ['x dos dois lados', 'Tirar o mesmo número de caixas dos dois pratos.'],
      ['Parênteses e frações', 'Primeiro arrumar, depois resolver.', ['B.U7.A8']],
      ['Do problema à equação', 'Transformar uma situação em uma equação.'],
      ['Inequações simples', 'A balança inclinada, e a solução na reta.', ['B.U12.A1']],
    ]),
  },
  {
    id: 'B.U16', module: B, n: 16, part: 'E', title: 'Geometria plana', short: 'Geometria plana',
    outcome: 'Calcula perímetros e áreas e usa o teorema de Pitágoras.',
    requires: ['B.U9', 'B.U13'],
    lessons: L('B.U16', [
      ['Ponto, reta, ângulo', 'As peças da geometria.'],
      ['Medir ângulos', 'Graus e o transferidor.'],
      ['Triângulos e os 180°', 'Os três cantos sempre formam meia volta.'],
      ['Polígonos', 'Lados, ângulos e nomes.'],
      ['Perímetro', 'O contorno.'],
      ['Área', 'Recortar e mover pedaços sem mudar a área.', ['B.U9.A3']],
      ['Círculo e π', 'Todo círculo dá a volta em pouco mais de 3 diâmetros.', ['B.U8.A6']],
      ['Teorema de Pitágoras', 'O esquadro 3-4-5 do pedreiro.', ['B.U13.A5']],
    ]),
  },
  {
    id: 'B.U17', module: B, n: 17, part: 'E', title: 'Sólidos e volume', short: 'Sólidos e volume',
    outcome: 'Calcula volumes e áreas de superfície de sólidos simples.',
    requires: ['B.U16'],
    mission: 'A caixa-d\'água e a tinta',
    lessons: L('B.U17', [
      ['Planificações', 'Abrir um sólido e ver suas faces.'],
      ['Volume de prismas e cilindros', 'Área da base vezes a altura.', ['B.U9.A4']],
      ['Área de superfície', 'Quanto de tinta, quanto de embalagem.'],
    ]),
  },
  {
    id: 'B.U18', module: B, n: 18, part: 'F', title: 'Plano cartesiano e gráficos', short: 'Gráficos e função',
    outcome: 'Lê e constrói gráficos e descreve relações como regras de entrada e saída.',
    requires: ['B.U10', 'B.U12', 'B.U15'],
    lessons: L('B.U18', [
      ['Coordenadas', 'Dois números marcam um ponto.', ['B.U12.A1']],
      ['Ler gráficos', 'Barras, linhas e setores.'],
      ['Gráficos que enganam', 'Eixo cortado e escala torta.'],
      ['Relações entre grandezas', 'Proporcional é uma reta que passa pela origem.', ['B.U10.A3']],
      ['A ideia de função', 'Uma máquina: entra um número, sai outro.'],
    ]),
  },
  {
    id: 'B.U19', module: B, n: 19, part: 'F', title: 'Estatística e probabilidade', short: 'Estatística',
    outcome: 'Resume dados, entende dispersão e calcula probabilidades simples.',
    requires: ['B.U8', 'B.U11', 'B.U13'],
    mission: 'O lote passou no controle?',
    lessons: L('B.U19', [
      ['Média, mediana e moda', 'Três jeitos de resumir um conjunto de números.'],
      ['Quando a média engana', 'Os valores podem estar espalhados.'],
      ['Desvio padrão, a ideia', 'Quanto os valores se afastam da média.', ['B.U13.A5']],
      ['Contagem', 'Escolhas em sequência se multiplicam.'],
      ['Probabilidade', 'Casos favoráveis sobre casos possíveis.', ['B.U7.A1']],
      ['Frequência e simulação', 'Jogar mil vezes e ver a chance aparecer.'],
    ]),
  },
  {
    id: 'B.U20', module: B, n: 20, part: 'fim', title: 'Projeto final e conclusão', short: 'Projeto final',
    outcome: 'Junta tudo num projeto real e conclui a Matemática Básica.',
    requires: ['B.U9', 'B.U11', 'B.U15', 'B.U17', 'B.U18', 'B.U19'],
    lessons: L('B.U20', [
      ['O projeto', 'A reforma de um cômodo, ou o orçamento do mês.'],
      ['Avaliação final', 'No estilo da prova de Matemática do ENCCEJA.'],
    ]),
  },
]

// ---------------------------------------------------------------- next modules (planned)

const planned = (module: ModuleId, prefix: string, items: [string, string, string[], string?][]): Unit[] =>
  items.map(([title, outcome, requires, lab], i) => ({
    id: `${prefix}.U${i + 1}`,
    module,
    n: i + 1,
    part: 'p',
    title,
    short: title,
    outcome,
    requires,
    lessons: [],
    lab,
  }))

const ALGEBRA_UNITS = planned('algebra', 'AF', [
  ['Expressões algébricas', 'Opera com polinômios.', ['B.U14']],
  ['Produtos notáveis e fatoração', 'Expande e fatora, vendo o retângulo.', ['AF.U1']],
  ['Equações do 2º grau', 'Resolve por fatoração e pela fórmula.', ['AF.U2', 'B.U15']],
  ['Sistemas de equações', 'Resolve dois problemas ao mesmo tempo.', ['B.U15']],
  ['Inequações', 'Resolve e mostra a solução na reta.', ['AF.U3']],
  ['Funções', 'Domínio, imagem e gráfico.', ['B.U18']],
  ['Função afim', 'Taxa de variação constante.', ['AF.U6']],
  ['Função quadrática', 'Parábola, vértice e raízes.', ['AF.U7', 'AF.U3'], 'funcao-quadratica'],
  ['Função exponencial', 'Crescimento por um fator fixo.', ['AF.U6', 'B.U11', 'B.U13']],
  ['Logaritmo', 'O expoente que falta.', ['AF.U9']],
  ['Transformações, composição e inversa', 'Monta funções com outras.', ['AF.U8', 'AF.U10']],
])

const GEOMETRIA_UNITS = planned('geometria', 'GT', [
  ['Semelhança', 'Figuras com a mesma forma, em escalas diferentes.', ['B.U16', 'B.U10']],
  ['Trigonometria no triângulo', 'Seno, cosseno e tangente como razões.', ['GT.U1']],
  ['Círculo trigonométrico', 'Ângulos e radianos num círculo de raio 1.', ['GT.U2'], 'circulo-trigonometrico'],
  ['Funções trigonométricas', 'Ondas e periodicidade.', ['GT.U3', 'AF.U6']],
  ['Identidades', 'Igualdades que valem para todo ângulo.', ['GT.U4']],
  ['Geometria analítica', 'Retas e circunferências por equações.', ['AF.U7', 'B.U16']],
  ['Vetores', 'Grandezas com direção.', ['GT.U2', 'GT.U6']],
])

const CALCULO1_UNITS = planned('calculo-1', 'C1', [
  ['Limites', 'Chegar perto sem chegar.', ['AF.U11', 'GT.U4']],
  ['Continuidade', 'Funções sem saltos.', ['C1.U1']],
  ['Derivada', 'A inclinação de um instante.', ['C1.U1'], 'derivada'],
  ['Regras de derivação', 'Derivar sem limite toda vez.', ['C1.U3']],
  ['Aplicações da derivada', 'Taxas, máximos e mínimos.', ['C1.U4']],
  ['Integral', 'Somar fatias infinitas.', ['C1.U3'], 'integral'],
  ['Teorema fundamental', 'A integral desfaz a derivada.', ['C1.U6', 'C1.U4']],
])

const CALCULO2_UNITS = planned('calculo-2', 'C2', [
  ['Técnicas de integração', 'Substituição e por partes.', ['C1.U7']],
  ['Aplicações da integral', 'Áreas, volumes e trabalho.', ['C2.U1']],
  ['Sequências e séries', 'Somas infinitas que dão um número.', ['C1.U1']],
  ['Séries de Taylor', 'Polinômios que imitam funções.', ['C2.U3', 'C1.U4'], 'series-taylor'],
])

const CALCULO3_UNITS = planned('calculo-3', 'C3', [
  ['Funções de várias variáveis', 'Superfícies e curvas de nível.', ['C1.U5', 'GT.U7']],
  ['Derivadas parciais e gradiente', 'A direção mais íngreme.', ['C3.U1'], 'gradiente'],
  ['Integrais múltiplas', 'Volume em camadas.', ['C3.U1', 'C2.U2']],
])

const CALCULO4_UNITS = planned('calculo-4', 'C4', [
  ['Equações diferenciais', 'Regras de mudança que preveem o futuro.', ['C1.U7', 'AF.U9'], 'equacoes-diferenciais'],
  ['Campos vetoriais', 'Divergente e rotacional.', ['C3.U2']],
  ['Integrais de linha e de superfície', 'Somar ao longo de caminhos e superfícies.', ['C4.U2', 'C3.U3']],
  ['Teoremas de Green, Gauss e Stokes', 'O que acontece dentro aparece na borda.', ['C4.U3']],
])

export const MODULES: Module[] = [
  {
    id: 'basica',
    short: 'Básica',
    title: 'Matemática Básica',
    promise: 'As contas da vida e do trabalho, com segurança: do valor posicional às equações, gráficos e porcentagem.',
    milestone: 'Prepara para a prova de Matemática do ENCCEJA Ensino Fundamental',
    color: '#7dd3fc',
    requires: [],
    parts: [
      { id: 'inicio', title: 'Início', color: '#e5e7eb' },
      { id: 'A', title: 'Números e operações', color: '#7dd3fc' },
      { id: 'B', title: 'Partes do todo', color: '#86efac' },
      { id: 'C', title: 'Além dos naturais', color: '#c4b5fd' },
      { id: 'D', title: 'Álgebra inicial', color: '#fcd34d' },
      { id: 'E', title: 'Espaço e forma', color: '#f9a8d4' },
      { id: 'F', title: 'Relações e dados', color: '#5eead4' },
      { id: 'fim', title: 'Conclusão', color: '#e5e7eb' },
    ],
    units: BASICA_UNITS,
  },
  {
    id: 'algebra',
    short: 'Álgebra',
    title: 'Álgebra e Funções',
    promise: 'Equações, sistemas e as famílias de funções: ler e montar modelos.',
    milestone: 'Base para o ENEM',
    color: '#fcd34d',
    requires: ['basica'],
    parts: [{ id: 'p', title: 'Em planejamento', color: '#fcd34d' }],
    units: ALGEBRA_UNITS,
    planned: true,
  },
  {
    id: 'geometria',
    short: 'Geometria',
    title: 'Geometria e Trigonometria',
    promise: 'Semelhança, trigonometria, geometria analítica e vetores.',
    color: '#f9a8d4',
    requires: ['basica', 'algebra'],
    parts: [{ id: 'p', title: 'Em planejamento', color: '#f9a8d4' }],
    units: GEOMETRIA_UNITS,
    planned: true,
  },
  {
    id: 'calculo-1',
    short: 'Cálculo 1',
    title: 'Cálculo 1',
    promise: 'Limites e derivadas: medir o instante.',
    color: '#ff8fa3',
    requires: ['algebra', 'geometria'],
    parts: [{ id: 'p', title: 'Em planejamento', color: '#ff8fa3' }],
    units: CALCULO1_UNITS,
    planned: true,
  },
  {
    id: 'calculo-2',
    short: 'Cálculo 2',
    title: 'Cálculo 2',
    promise: 'Integrais e séries: somar o contínuo.',
    color: '#5eead4',
    requires: ['calculo-1'],
    parts: [{ id: 'p', title: 'Em planejamento', color: '#5eead4' }],
    units: CALCULO2_UNITS,
    planned: true,
  },
  {
    id: 'calculo-3',
    short: 'Cálculo 3',
    title: 'Cálculo 3',
    promise: 'Várias variáveis: superfícies, gradiente e volumes.',
    color: '#fde68a',
    requires: ['calculo-2'],
    parts: [{ id: 'p', title: 'Em planejamento', color: '#fde68a' }],
    units: CALCULO3_UNITS,
    planned: true,
  },
  {
    id: 'calculo-4',
    short: 'Cálculo 4',
    title: 'Cálculo 4',
    promise: 'Cálculo vetorial e equações diferenciais.',
    color: '#fdba74',
    requires: ['calculo-3'],
    parts: [{ id: 'p', title: 'Em planejamento', color: '#fdba74' }],
    units: CALCULO4_UNITS,
    planned: true,
  },
]

export const ALL_UNITS: Unit[] = MODULES.flatMap((m) => m.units)
const UNIT_BY_ID = new Map(ALL_UNITS.map((u) => [u.id, u]))
const LESSON_BY_ID = new Map(ALL_UNITS.flatMap((u) => u.lessons.map((l) => [l.id, { lesson: l, unit: u }] as const)))

export const getModule = (id: string) => MODULES.find((m) => m.id === id)
export const getUnit = (id: string) => UNIT_BY_ID.get(id)
export const getLesson = (id: string) => LESSON_BY_ID.get(id)
export const partOf = (u: Unit) => getModule(u.module)?.parts.find((p) => p.id === u.part)

/** The unit (if any) whose laboratório is `slug`. */
export function unitOfLab(slug: string): Unit | undefined {
  return ALL_UNITS.find((u) => u.lab === slug)
}

// ---------------------------------------------------------------- graph

/** All units `id` depends on, directly or not. */
export function ancestors(id: string): Set<string> {
  const out = new Set<string>()
  const stack = [...(getUnit(id)?.requires ?? [])]
  while (stack.length) {
    const u = stack.pop()!
    if (out.has(u)) continue
    out.add(u)
    stack.push(...(getUnit(u)?.requires ?? []))
  }
  return out
}

/** All units that depend on `id`, directly or not. */
export function descendants(id: string): Set<string> {
  const out = new Set<string>()
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()!
    for (const u of ALL_UNITS) if (u.requires.includes(cur) && !out.has(u.id)) {
      out.add(u.id)
      stack.push(u.id)
    }
  }
  return out
}

/** Units that list `id` as a direct prerequisite. */
export function unlocks(id: string): Unit[] {
  return ALL_UNITS.filter((u) => u.requires.includes(id))
}

/**
 * Direct prerequisites that are not already implied by another one (the
 * transitive reduction). The map draws only these edges, so the tree stays
 * readable; the detail panel still lists every direct prerequisite.
 */
export function essentialRequires(u: Unit): string[] {
  return u.requires.filter((r) => !u.requires.some((o) => o !== r && ancestors(o).has(r)))
}

export interface MapNode {
  id: string
  layer: number
  /** Position inside the layer, 0..1 (center of the node). */
  x: number
}

export interface MapEdge {
  from: string
  to: string
  /** Points the edge passes through, from the prerequisite down to the unit. */
  points: { x: number; layer: number }[]
}

/**
 * Layered layout of a module's units (Sugiyama style): every unit sits one
 * layer below its deepest prerequisite inside the module; edges that skip
 * layers get a lane of their own (virtual points in each layer they cross),
 * so they never run through another unit; and the order inside each layer
 * follows the average position of the neighbours, which keeps edges short
 * and crossings few.
 */
export function layoutModule(m: Module): { nodes: MapNode[]; layers: number; edges: MapEdge[] } {
  const inModule = new Set(m.units.map((u) => u.id))
  const layer = new Map<string, number>()
  const depth = (id: string): number => {
    if (layer.has(id)) return layer.get(id)!
    const u = getUnit(id)!
    const parents = u.requires.filter((r) => inModule.has(r))
    const d = parents.length ? Math.max(...parents.map(depth)) + 1 : 0
    layer.set(id, d)
    return d
  }
  m.units.forEach((u) => depth(u.id))
  const layers = Math.max(...layer.values()) + 1

  // Real edges, then chains through virtual points for the long ones.
  const real: [string, string][] = []
  for (const u of m.units) for (const r of essentialRequires(u)) if (inModule.has(r)) real.push([r, u.id])
  const rows: string[][] = Array.from({ length: layers }, () => [])
  for (const u of m.units) rows[layer.get(u.id)!].push(u.id)
  const chains: { from: string; to: string; ids: string[] }[] = []
  const links: [string, string][] = []
  for (const [a, b] of real) {
    const ids = [a]
    for (let l = layer.get(a)! + 1; l < layer.get(b)!; l++) {
      const v = `~${a}>${b}@${l}`
      layer.set(v, l)
      rows[l].push(v)
      ids.push(v)
    }
    ids.push(b)
    for (let i = 1; i < ids.length; i++) links.push([ids[i - 1], ids[i]])
    chains.push({ from: a, to: b, ids })
  }

  // A real unit takes a full column; a lane takes a narrow one.
  const weight = (id: string) => (id.startsWith('~') ? 0.32 : 1)
  const pos = new Map<string, number>()
  const place = () =>
    rows.forEach((row) => {
      const total = row.reduce((s, id) => s + weight(id), 0)
      let acc = 0
      for (const id of row) {
        pos.set(id, (acc + weight(id) / 2) / total)
        acc += weight(id)
      }
    })
  place()
  const order = (id: string) => getUnit(id)?.n ?? 0
  for (let sweep = 0; sweep < 6; sweep++) {
    const down = sweep % 2 === 0
    const range = down ? [...Array(layers).keys()].slice(1) : [...Array(layers).keys()].reverse().slice(1)
    for (const li of range) {
      const bary = (id: string) => {
        const ns = links.filter(([p, c]) => (down ? c === id : p === id)).map(([p, c]) => pos.get(down ? p : c)!)
        return ns.length ? ns.reduce((x, y) => x + y, 0) / ns.length : pos.get(id)!
      }
      const b = new Map(rows[li].map((id) => [id, bary(id)]))
      rows[li].sort((x, y) => b.get(x)! - b.get(y)! || order(x) - order(y))
      place()
    }
  }

  const nodes = m.units.map((u) => ({ id: u.id, layer: layer.get(u.id)!, x: pos.get(u.id)! }))
  const edges = chains.map((c) => ({ from: c.from, to: c.to, points: c.ids.map((id) => ({ x: pos.get(id)!, layer: layer.get(id)! })) }))
  return { nodes, layers, edges }
}

// ---------------------------------------------------------------- status

export type UnitStatus = 'concluida' | 'recomendada' | 'depois'

/**
 * Where a unit stands for a student: done, recommended now (every
 * prerequisite done), or better after its prerequisites. Never "locked":
 * the student may still start, with a recommendation.
 */
export function unitStatus(id: string, done: Set<string>): UnitStatus {
  if (done.has(id)) return 'concluida'
  const u = getUnit(id)
  if (!u) return 'depois'
  return u.requires.every((r) => done.has(r)) ? 'recomendada' : 'depois'
}

/** Prerequisites still missing, nearest first. */
export function missingRequires(id: string, done: Set<string>): Unit[] {
  const u = getUnit(id)
  if (!u) return []
  return u.requires.filter((r) => !done.has(r)).map((r) => getUnit(r)!).filter(Boolean)
}
