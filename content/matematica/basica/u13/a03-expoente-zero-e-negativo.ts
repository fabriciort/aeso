import type { Aula, Visual } from '@/lib/formation/schema'

// Expoente zero e negativo: o padrão de dividir por 10 continua. Na tabela,
// 10³ = 1.000, 10² = 100, 10¹ = 10: cada vez que o expoente cai 1, o valor
// é dividido por 10. Seguindo o padrão, 10⁰ = 1, 10⁻¹ = 0,1 e 10⁻² = 0,01.
// O mesmo com o 2: 2⁰ = 1, 2⁻¹ = 1/2. Momento-chave: o expoente zero não dá
// zero; dá 1, porque o padrão continua. Os erros a desmontar: achar que
// 10⁰ = 0 e que o expoente negativo dá um número negativo (2⁻¹ = −2).

const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })
const exp = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

type Valor = number | string
/** Setas entre colunas seguidas: "− 1" em cima (o expoente) e o passo embaixo (o valor). */
const setas = (n: number, baixo: string, quantas = n - 1) => [
  ...Array.from({ length: n - 1 }, (_, i) => ({ de: i, para: i + 1, rotulo: '− 1' })),
  ...Array.from({ length: quantas }, (_, i) => ({ de: i, para: i + 1, rotulo: baixo, embaixo: true })),
]

/** De 10³ a 10⁰. */
const DEZ = (ultimo: Valor, extra: Record<string, unknown>, esboco: string) => tab(
  {
    linhas: [
      { rotulo: 'potência', valores: ['10³', '10²', '10¹', '10⁰'] },
      { rotulo: 'valor', valores: [1000, 100, 10, ultimo] },
    ],
    setas: setas(4, '÷ 10', ultimo === '?' ? 2 : 3),
    ...extra,
  },
  esboco,
)
const DEZ_COMPLETA = DEZ(1, { destaque: [3] }, 'A tabela de 10³ a 10⁰: 1.000, 100, 10 e 1, com "÷ 10" embaixo de cada passo. A coluna do 10⁰ em moldura âmbar: o 1.')

/** A continuação: de 10¹ a 10⁻². */
const ABAIXO = (extra: Record<string, unknown>, esboco: string) => tab(
  {
    linhas: [
      { rotulo: 'potência', valores: ['10¹', '10⁰', '10⁻¹', '10⁻²'] },
      { rotulo: 'valor', valores: [10, 1, '0,1', '0,01'] },
    ],
    setas: setas(4, '÷ 10'),
    ...extra,
  },
  esboco,
)

/** O mesmo padrão com o 2: de 2³ a 2⁻¹. */
const DOIS = (valores: Valor[], esboco: string, destaque?: number[]) => tab(
  {
    linhas: [
      { rotulo: 'potência', valores: ['2³', '2²', '2¹', '2⁰', '2⁻¹'] },
      { rotulo: 'valor', valores },
    ],
    setas: setas(5, '÷ 2', valores.filter((v) => v !== '?').length - 1),
    ...(destaque ? { destaque } : {}),
  },
  esboco,
)

export const aula: Aula = {
  id: 'B.U13.A3',
  titulo: 'Expoente zero e negativo',
  objetivo: 'Saber que um número diferente de zero elevado a 0 dá 1 e que o expoente negativo pede divisão (10⁻² = 0,01, 2⁻¹ = 1/2), explicando os dois pelo padrão da tabela.',
  modelo: 'livre',
  esboco: 'Abre com a calculadora: 10⁰ dá 1. Por que não zero? A tabela das potências de 10 começa em 10³ = 1.000 e o aluno a desce: 100, 10. Cada vez que o expoente cai 1, o valor é dividido por 10. Momento-chave: na aposta do 10⁰, o padrão pede 10 ÷ 10 = 1, não 0. O padrão segue: 10⁻¹ = 0,1 e 10⁻² = 0,01, números pequenos, mas positivos. O mesmo vale com o 2: 2⁰ = 1, 2⁻¹ = 1/2. Fecha anunciando a notação científica.',
  vega: 'Ideia central: na tabela das potências, cada vez que o expoente diminui 1, o valor é dividido pela base. Com o 10: 1.000, 100, 10, e o próximo é 10 ÷ 10 = 1, então 10⁰ = 1; depois 1 ÷ 10 = 0,1 = 10⁻¹ e 0,01 = 10⁻². Com o 2: 8, 4, 2, 1, 1/2. Todo número diferente de zero elevado a 0 dá 1 (0⁰ não se define aqui). O expoente negativo não deixa o número negativo: ele pede divisão. 2⁻¹ = 1/2 = 0,5 e 10⁻³ = 1/1.000 = 0,001. A regra da divisão da aula 2 confirma: 2³ ÷ 2³ = 2⁰, e qualquer número dividido por ele mesmo dá 1. Erros esperados: 10⁰ = 0, 10⁰ = 10, 2⁻¹ = −2, contar os zeros errado (10⁻² = 0,001). Guie com "O que acontece de uma coluna para a outra?", "Quanto é 10 ÷ 10?", "O número ficou menor que zero ou só menor que 1?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na calculadora, $10^0$ dá **1**, não zero. Por quê? E o que seria $10^{-1}\\text{?}$',
      fala: 'Na calculadora, dez elevado a zero dá um, não zero. Por quê? E o que seria dez elevado a menos um?',
      visual: { modelo: 'livre', estado: { calculadoras: [{ nome: 'Calculadora', teclas: '10 ^ 0 =', visor: '1' }] }, esboco: 'Uma calculadora com as teclas 10 ^ 0 = e o visor mostrando 1.' },
      esboco: 'Quase todo mundo espera 0. A calculadora diz 1, e a aula explica por quê.',
    },
    {
      tipo: 'mexa',
      texto: 'Comece de $10^3$ e desça o expoente de 1 em 1. O que acontece com o valor?',
      fala: 'Comece de dez ao cubo e desça o expoente de um em um. O que acontece com o valor?',
      visual: DEZ('?', { completar: true, mostradas: 1 }, 'A tabela com 10³ e 1.000 na primeira coluna; as outras vazias. Cada toque preenche uma: 10² e 100, 10¹ e 10, com "− 1" em cima e "÷ 10" embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para descer o expoente.',
        sucesso: { colunas: 3 },
        mostre: 'As colunas se preenchem: 10² = 100 e 10¹ = 10, com "÷ 10" embaixo de cada passo.',
      },
      descoberta: 'Cada vez que o expoente cai 1, o valor é dividido por 10: 1.000, 100, 10. Um zero sai a cada passo.',
      esboco: 'A tabela da unidade 10, com potências. As setas "÷ 10" de baixo são a pista da próxima aposta. A coluna do 10⁰ fica vazia.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Siga o padrão um passo além: quanto é $10^0\\text{?}$',
      fala: 'Siga o padrão um passo além: quanto é dez elevado a zero?',
      visual: DEZ('?', {}, 'A tabela de 10³ a 10⁰, com "?" em âmbar embaixo do 10⁰. As setas "÷ 10" vão até o 10; a última ainda não.'),
      opcoes: [
        {
          texto: '1', certa: true,
          explica: 'Isso. ${10 \\div 10 = 1}$. O expoente zero não dá zero: dá 1, porque o padrão continua.',
          fala: 'Isso. Dez dividido por dez, um. O expoente zero não dá zero: dá um, porque o padrão continua.',
          mostra: DEZ_COMPLETA,
        },
        {
          texto: '0', erro: 'expoente-zero-da-zero',
          explica: 'De 10 para 0 não é dividir por 10. O passo é sempre ÷ 10: ${10 \\div 10 = 1}$.',
          fala: 'De dez para zero não é dividir por dez. O passo é sempre dividir por dez: dez dividido por dez, um.',
          mostra: DEZ_COMPLETA,
        },
        {
          texto: '10',
          explica: '10 já é o $10^1$. O passo seguinte divide de novo: ${10 \\div 10 = 1}$.',
          fala: 'Dez já é o dez elevado a um. O passo seguinte divide de novo: dez dividido por dez, um.',
          mostra: DEZ_COMPLETA,
        },
      ],
      esboco: 'O momento-chave: a resposta vem da tabela, não de uma regra. A última seta "÷ 10" aparece e o 1 entra na moldura âmbar.',
    },
    {
      tipo: 'mexa',
      texto: 'O padrão não para no zero. Continue: $10^{-1}$ e $10^{-2}$.',
      fala: 'O padrão não para no zero. Continue: dez elevado a menos um e dez elevado a menos dois.',
      visual: ABAIXO({ completar: true, mostradas: 2 }, 'A tabela começa em 10¹ = 10 e 10⁰ = 1. Cada toque preenche uma coluna: 10⁻¹ e 0,1; 10⁻² e 0,01.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para seguir o padrão.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem: 0,1 embaixo do 10⁻¹ e 0,01 embaixo do 10⁻², com "÷ 10" em cada passo.',
      },
      descoberta: 'Do 1, dividir por 10 dá 0,1, e de novo, 0,01. O expoente negativo dá números pequenos, entre 0 e 1.',
      esboco: 'Os decimais da unidade 8 aparecem sozinhos: um décimo e um centésimo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Então $10^{-1}$ é um número negativo?',
      fala: 'Então dez elevado a menos um é um número negativo?',
      visual: ABAIXO({ destaque: [2] }, 'A tabela de 10¹ a 10⁻², com a coluna do 10⁻¹ em moldura âmbar.'),
      opcoes: [
        {
          texto: 'Não: é 0,1, um décimo', certa: true,
          explica: 'Isso. 0,1 é menor que 1, mas é maior que zero. O menos no expoente pede **divisão**, não um número negativo.',
          fala: 'Isso. Zero vírgula um é menor que um, mas é maior que zero. O menos no expoente pede divisão, não um número negativo.',
          mostra: ABAIXO({ destaque: [2] }, 'A mesma tabela, com o 0,1 aceso.'),
        },
        {
          texto: 'Sim: é −10', erro: 'expoente-negativo-da-negativo',
          explica: 'Veja a tabela: do 1, o passo é ÷ 10, e ${1 \\div 10 = 0{,}1}$. Positivo, só pequeno.',
          fala: 'Veja a tabela: do um, o passo é dividir por dez, e um dividido por dez é zero vírgula um. Positivo, só pequeno.',
          mostra: ABAIXO({ destaque: [2] }, 'A mesma tabela, com o 0,1 aceso.'),
        },
      ],
      esboco: 'Separa duas ideias: o sinal do expoente (pede divisão) e o sinal do número (continua positivo).',
    },
    {
      tipo: 'ideia',
      texto: 'O menos no expoente pede **divisão**: ${10^{-2} = 1 \\div 10^2 = 0{,}01}$. Um centésimo, ainda positivo.',
      fala: 'O menos no expoente pede divisão: dez elevado a menos dois é um dividido por dez ao quadrado, zero vírgula zero um. Um centésimo, ainda positivo.',
      visual: exp(['10⁻²', '1 ÷ 10²', '1 ÷ 100', '0,01'], 'Quatro linhas: 10⁻², 1 ÷ 10², 1 ÷ 100 e o 0,01 grande.'),
      esboco: 'A tabela vira uma conta: o expoente −2 diz quantas vezes dividir o 1 por 10.',
    },
    {
      tipo: 'anote',
      titulo: 'Expoente zero e negativo',
      definicao: 'Todo número diferente de zero elevado a **0** dá **1**. O expoente **negativo** pede divisão: ${10^{-2} = 1 \\div 10^2}$.',
      exemplo: { tex: '10^0 = 1 \\qquad 10^{-1} = 0{,}1 \\qquad 10^{-2} = 0{,}01', fala: 'dez elevado a zero é um; dez elevado a menos um é zero vírgula um; dez elevado a menos dois é zero vírgula zero um' },
      alerta: '$10^0$ não é 0, é 1. E $10^{-1}$ não é negativo: é 0,1.',
      esboco: 'Na página: a tabela de 10³ a 10⁻², com "÷ 10" embaixo de cada passo.',
    },
    {
      tipo: 'passo',
      problema: 'O mesmo padrão vale para o 2. Desça a tabela: $2^3 = 8$, $2^2 = 4$, $2^1 = 2$… E depois?',
      fala: 'O mesmo padrão vale para o dois. Desça a tabela: dois ao cubo, oito; dois ao quadrado, quatro; dois elevado a um, dois. E depois?',
      visual: DOIS([8, 4, 2, '?', '?'], 'A tabela de 2³ a 2⁻¹: 8, 4, 2 e dois "?". Embaixo, "÷ 2" entre as colunas já cheias.'),
      passos: [
        {
          pergunta: 'Cada passo divide por 2. Quanto é $2^0\\text{?}$',
          fala: 'Cada passo divide por dois. Quanto é dois elevado a zero?',
          opcoes: [
            { texto: '1', certa: true, explica: 'Isso. ${2 \\div 2 = 1}$. Com o 2 também: expoente zero dá 1.', fala: 'Isso. Dois dividido por dois, um. Com o dois também: expoente zero dá um.', mostra: DOIS([8, 4, 2, 1, '?'], 'O 1 entra embaixo do 2⁰.') },
            { texto: '0', erro: 'expoente-zero-da-zero', explica: 'O passo é ÷ 2, não "tira tudo": ${2 \\div 2 = 1}$.', fala: 'O passo é dividir por dois, não tirar tudo: dois dividido por dois, um.' },
            { texto: '2', explica: '2 já é o $2^1$. Mais um passo divide por 2: ${2 \\div 2 = 1}$.', fala: 'Dois já é o dois elevado a um. Mais um passo divide por dois: dois dividido por dois, um.' },
          ],
          linha: { tex: '2^0 = 2 \\div 2 = 1', fala: 'dois elevado a zero é dois dividido por dois, um' },
        },
        {
          pergunta: 'E $2^{-1}$, mais um passo?',
          fala: 'E dois elevado a menos um, mais um passo?',
          opcoes: [
            { texto: '$\\frac{1}{2}$', certa: true, explica: 'Isso. ${1 \\div 2}$ é meio: $\\frac{1}{2}$, ou 0,5.', fala: 'Isso. Um dividido por dois é meio: um meio, ou zero vírgula cinco.', mostra: DOIS([8, 4, 2, 1, '1/2'], 'A tabela inteira: 8, 4, 2, 1 e 1/2. A coluna do 2⁻¹ em moldura âmbar.', [4]) },
            { texto: '−2', erro: 'expoente-negativo-da-negativo', explica: 'A tabela só divide por 2: do 1, vem ${1 \\div 2 = \\frac{1}{2}}$. Pequeno, mas positivo.', fala: 'A tabela só divide por dois: do um, vem um dividido por dois, um meio. Pequeno, mas positivo.' },
            { texto: '0', explica: 'Dividir 1 ao meio não zera: sobra meio, $\\frac{1}{2}$.', fala: 'Dividir um ao meio não zera: sobra meio, um meio.' },
          ],
          linha: { tex: '2^{-1} = 1 \\div 2 = \\frac{1}{2}', fala: 'dois elevado a menos um é um dividido por dois, um meio' },
        },
      ],
      esboco: 'A tabela do 2 se preenche junto com o caderno. Mesmo padrão, outra base.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: continue a tabela do 10. Quanto é $10^{-3}\\text{?}$ Escreva como decimal.',
      fala: 'No papel: continue a tabela do dez. Quanto é dez elevado a menos três? Escreva como decimal.',
      resposta: '0,001',
      resolucao: [
        { tex: '10^{-2} = 0{,}01', fala: 'dez elevado a menos dois é zero vírgula zero um' },
        { tex: '0{,}01 \\div 10 = 0{,}001', fala: 'zero vírgula zero um dividido por dez é zero vírgula zero zero um' },
        { tex: '10^{-3} = 0{,}001', fala: 'dez elevado a menos três é um milésimo' },
      ],
      esboco: 'Mais um passo da tabela. Quem digitar 0,0001 pôs um zero a mais: o 1 fica na terceira casa depois da vírgula.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['expoente-zero-negativo-n1', 'expoente-zero-negativo-n2', 'expoente-zero-negativo-n3'],
      esboco: 'Nível 1: o valor que falta na tabela (expoente zero ou −1). Nível 2: qualquer base elevada a 0, 10 e 2 com expoente negativo, e o expoente de um decimal. Nível 3: a divisão que dá expoente zero, um produto de potências de 10 e as unidades de medida, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: '$10^0$ dá 1 porque o padrão continua: cada passo divide por 10. Na próxima aula: números enormes e minúsculos com potências de 10.',
      fala: 'Dez elevado a zero dá um porque o padrão continua: cada passo divide por dez. Na próxima aula: números enormes e minúsculos com potências de dez.',
      visual: tab(
        {
          linhas: [
            { rotulo: 'potência', valores: ['10²', '10¹', '10⁰', '10⁻¹', '10⁻²'] },
            { rotulo: 'valor', valores: [100, 10, 1, '0,1', '0,01'] },
          ],
          setas: setas(5, '÷ 10'),
          destaque: [2],
        },
        'A tabela de 10² a 10⁻², com o 10⁰ = 1 em moldura âmbar no meio.',
      ),
      esboco: 'Responde ao gancho com a tabela e anuncia a notação científica.',
    },
  ],
}
