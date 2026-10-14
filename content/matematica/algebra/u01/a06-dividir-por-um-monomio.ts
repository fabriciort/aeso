import type { Aula, Visual } from '@/lib/formation/schema'

// Dividir por um monômio. O caminho de volta da multiplicação: um depósito
// tem área 6x² + 9x e 3x de fundo. O retângulo mostra as áreas e esconde a
// frente ('?'). O momento-chave é o Mexa revelar com o lado escondido: que
// lado, vezes 3x, dá cada pedaço? 2x e 3. Cada termo se divide, e a conta se
// confere multiplicando de volta (a Lia que dividiu só o primeiro termo não
// passa). Depois, x³ ÷ x = x², escrito por extenso como nas potências, e um
// trinômio com um termo negativo e um termo que vira 1. É a última aula da
// unidade: o fecho mostra a jornada do módulo, com a próxima unidade acesa.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** O depósito: área 6x² + 9x, fundo 3x, frente 2x + 3 (escondida). */
const DEPOSITO = { base: ['2x', 3], altura: ['3x'], areas: [['6x²', '9x']] }
const DEPOSITO_PRONTO = ret({ ...DEPOSITO, total: '2x + 3' }, 'O depósito com a frente descoberta: 2x e 3 em cima, 6x² e 9x dentro, 3x de fundo, e 2x + 3 embaixo.')

/** x³ ÷ x: um pedaço só. */
const CUBO = { base: ['x²'], altura: ['x'], areas: [['x³']] }

/** (4x³ − 8x² + 2x) ÷ 2x = 2x² − 4x + 1. */
const TRES = { base: ['2x²', '−4x', 1], altura: ['2x'], areas: [['4x³', '−8x²', '2x']], tamanhoLetra: 1.5 }

/** (15x³ − 10x²) ÷ 5x = 3x² − 2x, do passo a passo. */
const PASSO_AREAS = { altura: ['5x'], areas: [['15x³', '−10x²']] }

/** As unidades do módulo Álgebra e Funções, na ordem do currículo. */
const JORNADA = ['Expressões algébricas', 'Produtos notáveis e fatoração', 'Equações do 2º grau', 'Sistemas de equações', 'Inequações', 'Funções', 'Função afim', 'Função quadrática', 'Função exponencial', 'Logaritmo', 'Transformações, composição e inversa']

export const aula: Aula = {
  id: 'AF.U1.A6',
  titulo: 'Dividir por um monômio',
  objetivo: 'Dividir um polinômio por um monômio, como (6x² + 9x) ÷ 3x = 2x + 3 e (4x³ − 8x² + 2x) ÷ 2x = 2x² − 4x + 1, dividindo cada termo (os expoentes se subtraem) e conferindo pela multiplicação.',
  modelo: 'retangulo',
  esboco: 'Abre num depósito de área 6x² + 9x e 3x de fundo, com a frente escondida. A aposta retoma a divisão (12 ÷ 3 = 4 porque 3 · 4 = 12) e pede o lado que, vezes 3x, dá 6x². Momento-chave: o aluno toca as partes e descobre a frente, 2x e 3. A conta de Lia (dividiu só o primeiro) não passa na volta. Depois, x³ ÷ x = x² por extenso, um trinômio com um termo negativo e um que vira 1, e o passo a passo. O fecho fecha a unidade e mostra a jornada do módulo, com Produtos notáveis e fatoração a seguir.',
  vega: 'Ideia central: dividir por um monômio é achar o lado que falta do retângulo: cada termo da área se divide pelo lado conhecido. (6x² + 9x) ÷ 3x = 2x + 3, porque 3x(2x + 3) = 6x² + 9x. Em cada termo, números com números e letras com letras; os expoentes se subtraem (x³ ÷ x = x², como nas potências). Um termo igual ao divisor vira 1, não some (2x ÷ 2x = 1). Sempre se confere multiplicando de volta. Erros esperados: dividir só o primeiro termo (2x + 9x), somar os expoentes (x³ ÷ x = x⁴), perder a letra (6x² ÷ 3x = 2), errar o sinal de um termo negativo. Guie com "Que lado, vezes 3x, dá esse pedaço?", "Multiplique de volta: dá a área?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um depósito tem área ${6x^2 + 9x}$ m² e **3x** metros de fundo. Quanto mede a frente?',
      fala: 'Um depósito tem área seis x ao quadrado mais nove x metros quadrados e três x metros de fundo. Quanto mede a frente?',
      visual: ret({ ...DEPOSITO, oculto: 'base' }, 'O depósito: 3x de altura, 6x² e 9x dentro dos dois pedaços, e "?" em cima de cada pedaço.'),
      esboco: 'O caminho de volta da aula anterior: agora a área é conhecida e um lado falta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na divisão, ${12 \\div 3 = 4}$ porque ${3 \\cdot 4 = 12}$. Que lado, vezes ${3x}$, dá ${6x^2}$?',
      fala: 'Na divisão, doze dividido por três é quatro porque três vezes quatro é doze. Que lado, vezes três x, dá seis x ao quadrado?',
      visual: ret({ ...DEPOSITO, oculto: 'base', destaque: [0, 0] }, 'O pedaço do 6x² aceso, com "?" em cima.'),
      opcoes: [
        {
          texto: '$2x$', certa: true,
          explica: 'Isso. ${3x \\cdot 2x = 6x^2}$, então ${6x^2 \\div 3x = 2x}$.',
          fala: 'Isso. Três x vezes dois x, seis x ao quadrado, então seis x ao quadrado dividido por três x é dois x.',
          mostra: ret({ base: ['2x', '?'], altura: ['3x'], areas: [['6x²', '9x']], destaque: [0, 0] }, 'O "?" do pedaço aceso vira 2x.'),
        },
        {
          texto: '$2x^3$', erro: 'potencia-soma-expoentes-na-divisao',
          explica: 'Confira: ${3x \\cdot 2x^3 = 6x^4}$. Dividir tira um x: ${2x}$.',
          fala: 'Confira: três x vezes dois x ao cubo, seis x à quarta. Dividir tira um x: dois x.',
          mostra: ret({ base: ['2x', '?'], altura: ['3x'], areas: [['6x²', '9x']], destaque: [0, 0] }, 'O "?" do pedaço aceso vira 2x.'),
        },
        {
          texto: '$2$', erro: 'esquece-a-letra-no-produto',
          explica: 'Confira: ${3x \\cdot 2 = 6x}$, não ${6x^2}$. Falta um x: ${2x}$.',
          fala: 'Confira: três x vezes dois, seis x, não seis x ao quadrado. Falta um x: dois x.',
          mostra: ret({ base: ['2x', '?'], altura: ['3x'], areas: [['6x²', '9x']], destaque: [0, 0] }, 'O "?" do pedaço aceso vira 2x.'),
        },
      ],
      esboco: 'A divisão como a pergunta da multiplicação ao contrário, como na unidade de divisão. Cada opção se confere multiplicando.',
    },
    {
      tipo: 'mexa',
      texto: 'Faça o mesmo com cada pedaço: que lado, vezes ${3x}$, dá a área dele?',
      fala: 'Faça o mesmo com cada pedaço: que lado, vezes três x, dá a área dele?',
      visual: ret({ ...DEPOSITO, oculto: 'base', revelar: true, total: '2x + 3' }, 'Os dois "?" em cima, com as partes tracejadas. Cada toque descobre um lado: 2x e 3. No fim, 2x + 3 embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada parte para achar o lado de cima.',
        sucesso: { reveladas: 2 },
        mostre: 'Os lados aparecem: 2x e 3. A frente é 2x + 3.',
      },
      descoberta: '6x² ÷ 3x = 2x e 9x ÷ 3x = 3. (6x² + 9x) ÷ 3x = 2x + 3: cada termo se divide.',
      esboco: 'O momento-chave: o 3 aparece em cima do 9x. O 9x também se divide, e o x some porque está dos dois lados.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Lia achou ${2x + 9x}$: dividiu só o ${6x^2}$. Multiplique de volta. A conta dela confere?',
      fala: 'Lia achou dois x mais nove x: dividiu só o seis x ao quadrado. Multiplique de volta. A conta dela confere?',
      visual: DEPOSITO_PRONTO,
      opcoes: [
        {
          texto: 'Sim: o $2x$ está certo', erro: 'divide-so-o-primeiro',
          explica: '${3x \\cdot 9x = 27x^2}$, não ${9x}$. O ${9x}$ também se divide: ${9x \\div 3x = 3}$.',
          fala: 'Três x vezes nove x, vinte e sete x ao quadrado, não nove x. O nove x também se divide: nove x dividido por três x, três.',
          mostra: expr(['3x(2x + 9x) = 6x² + 27x²', '3x(2x + 3) = 6x² + 9x'], 'As duas voltas, uma embaixo da outra: a de Lia dá 6x² + 27x²; a certa dá a área, 6x² + 9x.'),
        },
        {
          texto: 'Não: $3x \\cdot 9x$ dá $27x^2$', certa: true,
          explica: 'Isso. A volta certa é ${3x(2x + 3) = 6x^2 + 9x}$, a área do depósito.',
          fala: 'Isso. A volta certa é três x vezes dois x mais três, seis x ao quadrado mais nove x, a área do depósito.',
          mostra: expr(['3x(2x + 9x) = 6x² + 27x²', '3x(2x + 3) = 6x² + 9x'], 'As duas voltas, uma embaixo da outra: a de Lia dá 6x² + 27x²; a certa dá a área, 6x² + 9x.'),
        },
      ],
      esboco: 'O hábito da unidade, na divisão: conferir multiplicando de volta. O erro de dividir só o primeiro aparece na volta.',
    },
    {
      tipo: 'anote',
      titulo: 'Dividir por um monômio',
      definicao: 'Divida **cada termo** pelo monômio. Para conferir, multiplique de volta.',
      exemplo: { tex: '(6x^2 + 9x) \\div 3x = 2x + 3', fala: 'seis x ao quadrado mais nove x, dividido por três x, é dois x mais três' },
      alerta: 'Divida todos os termos, não só o primeiro. Confira: ${3x(2x + 3) = 6x^2 + 9x}$.',
      esboco: 'Na página: o depósito com a frente descoberta e uma seta de volta, da frente para a área.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um expoente maior: ${x^3 \\div x}$. Por extenso, ${\\frac{x \\cdot x \\cdot x}{x}}$. Quanto dá?',
      fala: 'Um expoente maior: x ao cubo dividido por x. Por extenso, x vezes x vezes x, sobre x. Quanto dá?',
      visual: ret({ ...CUBO, oculto: 'base' }, 'Um retângulo de um pedaço só: x de altura, x³ dentro e "?" em cima.'),
      opcoes: [
        {
          texto: '$x^4$', erro: 'potencia-soma-expoentes-na-divisao',
          explica: 'Dividir tira fatores, não põe. Um x de cima cancela com o de baixo: sobram dois, ${x^2}$.',
          fala: 'Dividir tira fatores, não põe. Um x de cima cancela com o de baixo: sobram dois, x ao quadrado.',
          mostra: ret({ ...CUBO }, 'O "?" vira x².'),
        },
        {
          texto: '$x^2$', certa: true,
          explica: 'Isso. Como nas potências, os expoentes se subtraem: ${3 - 1 = 2}$. Confere: ${x \\cdot x^2 = x^3}$.',
          fala: 'Isso. Como nas potências, os expoentes se subtraem: três menos um, dois. Confere: x vezes x ao quadrado, x ao cubo.',
          mostra: ret({ ...CUBO }, 'O "?" vira x².'),
        },
        {
          texto: '$x^3$', erro: 'potencia-multiplica-expoentes',
          explica: 'Assim nada saiu: ${x \\cdot x^3 = x^4}$. Um x sai: ${x^2}$.',
          fala: 'Assim nada saiu: x vezes x ao cubo, x à quarta. Um x sai: x ao quadrado.',
          mostra: ret({ ...CUBO }, 'O "?" vira x².'),
        },
      ],
      esboco: 'A ligação com as potências, escrita por extenso: um x de cima e o de baixo se cancelam.',
    },
    {
      tipo: 'mexa',
      texto: 'Três termos: ${(4x^3 - 8x^2 + 2x) \\div 2x}$. Ache cada parte da frente.',
      fala: 'Três termos: quatro x ao cubo menos oito x ao quadrado mais dois x, dividido por dois x. Ache cada parte da frente.',
      visual: ret({ ...TRES, oculto: 'base', revelar: true, total: '2x² − 4x + 1' }, 'Três pedaços com 4x³, −8x² (vermelho) e 2x dentro, 2x de altura e três "?" em cima. Os toques descobrem 2x², −4x (vermelho) e 1. No fim, 2x² − 4x + 1 embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada parte para achar o lado de cima.',
        sucesso: { reveladas: 3 },
        mostre: 'Os lados aparecem: 2x², −4x e 1. A frente é 2x² − 4x + 1.',
      },
      descoberta: '4x³ ÷ 2x = 2x², −8x² ÷ 2x = −4x e 2x ÷ 2x = 1: o último termo não some, vira 1.',
      esboco: 'O sinal fica com o termo (−8x² dá −4x, vermelho), e o pedaço igual ao lado conhecido dá 1.',
    },
    {
      tipo: 'passo',
      problema: 'Agora você: ${(15x^3 - 10x^2) \\div 5x}$.',
      fala: 'Agora você: quinze x ao cubo menos dez x ao quadrado, dividido por cinco x.',
      visual: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'], oculto: 'base' }, 'Dois pedaços, 15x³ e −10x² (vermelho), 5x de altura e "?" em cima de cada um.'),
      passos: [
        {
          pergunta: 'O primeiro termo: ${15x^3 \\div 5x}$.',
          fala: 'O primeiro termo: quinze x ao cubo dividido por cinco x.',
          opcoes: [
            { texto: '$3x^4$', erro: 'potencia-soma-expoentes-na-divisao', explica: 'Confira: ${5x \\cdot 3x^4 = 15x^5}$. Dividir tira um x: ${3x^2}$.', fala: 'Confira: cinco x vezes três x à quarta, quinze x à quinta. Dividir tira um x: três x ao quadrado.', mostra: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'], oculto: 'base', destaque: [0, 0] }, 'O primeiro pedaço acende; a conta 15x³ ÷ 5x = 3x² entra no caderno da tela.') },
            { texto: '$3x^2$', certa: true, explica: 'Isso. ${15 \\div 5 = 3}$ e ${x^3 \\div x = x^2}$.', fala: 'Isso. Quinze dividido por cinco, três, e x ao cubo dividido por x, x ao quadrado.', mostra: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'], oculto: 'base', destaque: [0, 0] }, 'O primeiro pedaço acende; a conta 15x³ ÷ 5x = 3x² entra no caderno da tela.') },
            { texto: '$3x^3$', erro: 'potencia-multiplica-expoentes', explica: 'Confira: ${5x \\cdot 3x^3 = 15x^4}$. Um x sai: ${3x^2}$.', fala: 'Confira: cinco x vezes três x ao cubo, quinze x à quarta. Um x sai: três x ao quadrado.', mostra: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'], oculto: 'base', destaque: [0, 0] }, 'O primeiro pedaço acende; a conta 15x³ ÷ 5x = 3x² entra no caderno da tela.') },
          ],
          linha: { tex: '15x^3 \\div 5x = 3x^2', fala: 'quinze x ao cubo dividido por cinco x, três x ao quadrado' },
        },
        {
          pergunta: 'O segundo: ${-10x^2 \\div 5x}$.',
          fala: 'O segundo: menos dez x ao quadrado dividido por cinco x.',
          opcoes: [
            { texto: '$-2x$', certa: true, explica: 'Isso. O menos fica com o termo: ${-10 \\div 5 = -2}$.', fala: 'Isso. O menos fica com o termo: menos dez dividido por cinco, menos dois.', mostra: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'] }, 'O segundo "?" vira −2x, em vermelho.') },
            { texto: '$2x$', erro: 'sinais-diferentes-da-positivo', explica: 'Menos dividido por mais dá menos: ${-2x}$. Confira: ${5x \\cdot (-2x) = -10x^2}$.', fala: 'Menos dividido por mais dá menos: menos dois x. Confira: cinco x vezes menos dois x, menos dez x ao quadrado.', mostra: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'] }, 'O segundo "?" vira −2x, em vermelho.') },
            { texto: '$-10x^2$', erro: 'divide-so-o-primeiro', explica: 'Esse termo também se divide: ${-10x^2 \\div 5x = -2x}$.', fala: 'Esse termo também se divide: menos dez x ao quadrado dividido por cinco x, menos dois x.', mostra: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'] }, 'O segundo "?" vira −2x, em vermelho.') },
          ],
          linha: { tex: '-10x^2 \\div 5x = -2x', fala: 'menos dez x ao quadrado dividido por cinco x, menos dois x' },
        },
        {
          pergunta: 'Confira multiplicando de volta: ${5x(3x^2 - 2x)}$ dá a área?',
          fala: 'Confira multiplicando de volta: cinco x vezes três x ao quadrado menos dois x dá a área?',
          opcoes: [
            { texto: 'Sim: $15x^3 - 10x^2$', certa: true, explica: 'Isso. A frente é ${3x^2 - 2x}$.', fala: 'Isso. A frente é três x ao quadrado menos dois x.', mostra: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'], total: '3x² − 2x' }, 'A frente inteira em cima, e 3x² − 2x embaixo.') },
            { texto: 'Não: dá $15x^3 - 2x$', erro: 'distributiva-parcial', explica: 'O ${5x}$ multiplica também o ${-2x}$: ${5x \\cdot (-2x) = -10x^2}$. Confere.', fala: 'O cinco x multiplica também o menos dois x: cinco x vezes menos dois x, menos dez x ao quadrado. Confere.', mostra: ret({ ...PASSO_AREAS, base: ['3x²', '−2x'], total: '3x² − 2x' }, 'A frente inteira em cima, e 3x² − 2x embaixo.') },
          ],
          linha: { tex: '5x(3x^2 - 2x) = 15x^3 - 10x^2', fala: 'cinco x vezes três x ao quadrado menos dois x, quinze x ao cubo menos dez x ao quadrado' },
        },
      ],
      esboco: 'Um termo por vez, com o expoente e o sinal, e a volta pela multiplicação no fim.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: ${(14x^2 - 21x) \\div 7x}$. Confira multiplicando de volta. Qual é o número sem x?',
      fala: 'No papel: catorze x ao quadrado menos vinte e um x, dividido por sete x. Confira multiplicando de volta. Qual é o número sem x?',
      resposta: -3,
      sinal: true,
      resolucao: [
        { tex: '14x^2 \\div 7x = 2x, \\quad -21x \\div 7x = -3', fala: 'catorze x ao quadrado dividido por sete x, dois x; menos vinte e um x dividido por sete x, menos três' },
        { tex: '(14x^2 - 21x) \\div 7x = 2x - 3', fala: 'catorze x ao quadrado menos vinte e um x, dividido por sete x, é dois x menos três' },
        { tex: '\\text{confere: } 7x(2x - 3) = 14x^2 - 21x', fala: 'confere: sete x vezes dois x menos três, catorze x ao quadrado menos vinte e um x' },
      ],
      esboco: 'Dividir cada termo e conferir pela volta. O número sem x é negativo: o menos fica com o termo.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['polinomios-divisao-n1', 'polinomios-divisao-n2', 'polinomios-divisao-n3'],
      esboco: 'Nível 1: o número que falta na frente, com o retângulo de lado escondido. Nível 2: escolher o quociente com um termo negativo e expoentes maiores. Nível 3: o número sem x, o expoente que falta e a frente do depósito com x dado, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A frente mede ${2x + 3}$. Você fechou a unidade: somar, subtrair, multiplicar e dividir polinômios. A seguir: produtos notáveis e fatoração.',
      fala: 'A frente mede dois x mais três. Você fechou a unidade: somar, subtrair, multiplicar e dividir polinômios. A seguir: produtos notáveis e fatoração.',
      visual: { modelo: 'livre', estado: { jornada: JORNADA, aqui: 1, feitas: 1 }, esboco: 'O caminho de Álgebra e Funções: Expressões algébricas feita; Produtos notáveis e fatoração acesa com "você está aqui"; as outras unidades do módulo esperando, até Transformações, composição e inversa.' },
      esboco: 'Responde ao gancho, fecha a unidade e mostra a jornada do módulo: a próxima parada é o retângulo dos produtos notáveis.',
    },
  ],
}
