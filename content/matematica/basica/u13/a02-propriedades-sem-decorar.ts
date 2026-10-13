import type { Aula, Visual } from '@/lib/formation/schema'

// Propriedades sem decorar. Nada de regra pronta: o aluno escreve cada conta
// por extenso e conta os fatores. 2³ × 2² são três 2 e mais dois 2: cinco 2,
// 2⁵. 2⁵ ÷ 2² cancela dois 2 de cima com os dois de baixo: sobram três, 2³.
// (2³)² são dois grupos de três 2: seis 2, 2⁶. Momento-chave: as regras
// (somar, subtrair, multiplicar os expoentes) saem da contagem. Depois, os
// cuidados: bases diferentes não se juntam (2³ × 3² = 8 × 9 = 72) e só o que
// está entre parênteses é elevado ((−3)² = 9, −3² = −9). Os erros a
// desmontar: multiplicar os expoentes no produto, operar as bases (4⁵),
// somar os expoentes na potência de potência e juntar bases diferentes.

const exp = (expressao: string[], esboco: string, destaque?: string): Visual => ({ modelo: 'livre', estado: { expressao, ...(destaque ? { destaque } : {}) }, esboco })
const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })

const PRODUTO = exp(['2³ × 2²', '(2 × 2 × 2) × (2 × 2)', '2⁵'], 'Três linhas: 2³ × 2²; por extenso, (2 × 2 × 2) × (2 × 2); e o 2⁵ grande embaixo. Os cinco 2 contados.')
const QUOCIENTE = exp(['2⁵ ÷ 2²', '(2 × 2 × 2 × 2 × 2) ÷ (2 × 2)', '2³'], 'Três linhas: 2⁵ ÷ 2²; por extenso, cinco 2 divididos por dois 2; embaixo, 2³: dois 2 de cima se cancelam com os de baixo.')
const POTENCIA_DE_POTENCIA = exp(['(2³)²', '2³ × 2³', '(2 × 2 × 2) × (2 × 2 × 2)', '2⁶'], 'Quatro linhas: (2³)², depois 2³ × 2³, depois os dois grupos de três 2, e o 2⁶ grande.')
const BASES_DIFERENTES = exp(['2³ × 3²', '(2 × 2 × 2) × (3 × 3)', '8 × 9 = 72'], 'Três linhas: 2³ × 3²; por extenso, três 2 e dois 3; embaixo, 8 × 9 = 72. Os 2 e os 3 não se misturam.')
const MENOS_3_ENTRE = exp(['(−3)²', '(−3) × (−3)', '9'], 'Três linhas: (−3)², (−3) × (−3), e o 9 grande.')
const MENOS_3_FORA = exp(['−3²', '−(3 × 3)', '−9'], 'Três linhas: −3², −(3 × 3), e o −9 grande. Só o 3 é elevado; o menos fica de fora.')

/** A tabela do produto: o primeiro expoente cresce, o segundo fica 2. */
const TABELA = (extra: Record<string, unknown>, esboco: string) => tab(
  {
    linhas: [
      { rotulo: 'conta', valores: ['2¹ × 2²', '2² × 2²', '2³ × 2²'] },
      { rotulo: 'quantos 2', valores: [3, 4, 5] },
      { rotulo: 'resultado', valores: ['2³', '2⁴', '2⁵'] },
    ],
    ...extra,
  },
  esboco,
)

export const aula: Aula = {
  id: 'B.U13.A2',
  titulo: 'Propriedades sem decorar',
  objetivo: 'Multiplicar e dividir potências de mesma base e calcular potência de potência escrevendo por extenso e contando os fatores; não juntar bases diferentes; distinguir (−3)² de −3².',
  modelo: 'livre',
  esboco: 'Abre com uma conta que confunde muita gente: 2³ × 2² dá 2⁵, 2⁶ ou 4⁵? O aluno escreve por extenso e conta cinco 2. Na tabela, o primeiro expoente cresce e o resultado acompanha: os expoentes se somam. Momento-chave: a regra aparece da contagem, sem decorar. Depois a divisão (dois 2 se cancelam) e a potência de potência (dois grupos de três 2). Por fim os cuidados: bases diferentes não se juntam, e o menos sem parênteses fica de fora da potência.',
  vega: 'Ideia central: toda regra de potência sai de escrever por extenso e contar os fatores. Mesma base: no produto os fatores se juntam e os expoentes se somam (2³ × 2² = 2⁵); na divisão, os fatores de baixo cancelam os de cima e os expoentes se subtraem (2⁵ ÷ 2² = 2³); na potência de potência, são grupos iguais e os expoentes se multiplicam ((2³)² = 2⁶). Cuidados: bases diferentes não viram uma potência só (2³ × 3² = 8 × 9 = 72); o expoente vale só para o que está imediatamente antes dele: (−3)² = (−3) × (−3) = 9, mas −3² = −(3 × 3) = −9. Erros esperados: multiplicar os expoentes no produto (2⁶), multiplicar as bases (4⁵), somar os expoentes na potência de potência (2⁵), juntar bases diferentes (6⁵), confundir (−3)² com −3². Guie sempre com "Escreva por extenso: quantos fatores ficam?". Não peça para decorar as regras.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Quanto é ${2^3 \\times 2^2}\\text{?}$ Muita gente diz $2^6$, outros $4^5$. Sem decorar regra nenhuma, dá para ter certeza.',
      fala: 'Quanto é dois ao cubo vezes dois ao quadrado? Muita gente diz dois elevado a seis, outros quatro elevado a cinco. Sem decorar regra nenhuma, dá para ter certeza.',
      visual: exp(['2³ × 2² = ?'], 'A conta grande no centro, com o "?" em âmbar.'),
      esboco: 'Um adulto que lembra que "tem uma regra" mas não sabe qual. A promessa: a regra vai aparecer sozinha.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Escreva por extenso: $2^3$ são três 2, e $2^2$, dois 2. Quantos 2 ficam multiplicados?',
      fala: 'Escreva por extenso: dois ao cubo são três dois, e dois ao quadrado, dois dois. Quantos dois ficam multiplicados?',
      visual: exp(['2³ × 2²', '(2 × 2 × 2) × (2 × 2)'], 'A conta e, embaixo, grande, por extenso: (2 × 2 × 2) × (2 × 2).'),
      opcoes: [
        {
          texto: '5', certa: true,
          explica: 'Isso. Três 2 e mais dois 2: cinco 2. ${2^3 \\times 2^2 = 2^5}$.',
          fala: 'Isso. Três dois e mais dois dois: cinco dois. Dois ao cubo vezes dois ao quadrado é dois elevado a cinco.',
          mostra: PRODUTO,
        },
        {
          texto: '6', erro: 'potencia-multiplica-expoentes',
          explica: 'Conte os 2 na tela: três e mais dois são cinco, não seis. ${2^3 \\times 2^2 = 2^5}$.',
          fala: 'Conte os dois na tela: três e mais dois são cinco, não seis. Dois ao cubo vezes dois ao quadrado é dois elevado a cinco.',
          mostra: PRODUTO,
        },
      ],
      esboco: 'O momento-chave começa aqui: contar os fatores na tela. O 2⁶ (multiplicar os expoentes) cai na contagem.',
    },
    {
      tipo: 'mexa',
      texto: 'Mude o primeiro expoente e conte os 2 de cada conta. O que acontece com o resultado?',
      fala: 'Mude o primeiro expoente e conte os dois de cada conta. O que acontece com o resultado?',
      visual: TABELA({ completar: true, mostradas: 1 }, 'A tabela com só a primeira coluna: 2¹ × 2², três 2, 2³. Cada toque preenche a próxima: 2² × 2², quatro 2, 2⁴; 2³ × 2², cinco 2, 2⁵. A última é a conta do gancho.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para fazer a próxima conta.',
        sucesso: { colunas: 3 },
        mostre: 'As colunas se preenchem: 2³, 2⁴, 2⁵. O expoente do resultado é a soma dos dois.',
      },
      descoberta: 'O expoente do resultado é sempre a soma: 1 + 2 = 3, 2 + 2 = 4, 3 + 2 = 5. Os fatores se juntam.',
      esboco: 'A linha do meio, "quantos 2", é a ponte entre a conta e o resultado: o aluno vê a contagem virar expoente.',
    },
    {
      tipo: 'ideia',
      texto: 'Na **mesma base**, multiplicar junta os fatores: os expoentes se **somam**. ${2^3 \\times 2^2 = 2^{3+2} = 2^5}$.',
      fala: 'Na mesma base, multiplicar junta os fatores: os expoentes se somam. Dois ao cubo vezes dois ao quadrado é dois elevado a três mais dois, dois elevado a cinco.',
      visual: PRODUTO,
      esboco: 'A regra chega como resumo da tabela. O desenho por extenso continua na tela.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${2^5 \\div 2^2}\\text{?}$ Escreva por extenso: dois 2 de baixo cancelam dois 2 de cima. Quanto sobra?',
      fala: 'E dois elevado a cinco dividido por dois ao quadrado? Escreva por extenso: dois dois de baixo cancelam dois dois de cima. Quanto sobra?',
      visual: exp(['2⁵ ÷ 2²', '(2 × 2 × 2 × 2 × 2) ÷ (2 × 2)', '= ?'], 'A conta, embaixo por extenso (cinco 2 divididos por dois 2) e, grande, "= ?".'),
      opcoes: [
        {
          texto: '$2^3$', certa: true,
          explica: 'Isso. Saem dois dos cinco 2: sobram três. Na divisão, os expoentes se **subtraem**: ${5 - 2 = 3}$.',
          fala: 'Isso. Saem dois dos cinco dois: sobram três. Na divisão, os expoentes se subtraem: cinco menos dois, três.',
          mostra: QUOCIENTE,
        },
        {
          texto: '$2^7$', erro: 'potencia-soma-expoentes-na-divisao',
          explica: 'Somar é do produto. Dividir tira fatores: dos cinco 2, saem dois. Sobra $2^3$.',
          fala: 'Somar é do produto. Dividir tira fatores: dos cinco dois, saem dois. Sobra dois ao cubo.',
          mostra: QUOCIENTE,
        },
        {
          texto: '$1^3$', erro: 'potencia-opera-as-bases',
          explica: 'A base não se divide: os 2 que sobram continuam 2. Sobram três: $2^3$, que é 8.',
          fala: 'A base não se divide: os dois que sobram continuam dois. Sobram três: dois ao cubo, que é oito.',
          mostra: QUOCIENTE,
        },
      ],
      esboco: 'Confere: 32 ÷ 4 = 8 = 2³. O 1³ vem de dividir também as bases.',
    },
    {
      tipo: 'passo',
      problema: 'E uma potência de potência: quanto é ${(2^3)^2}\\text{?}$',
      fala: 'E uma potência de potência: quanto é dois ao cubo, elevado ao quadrado?',
      visual: exp(['(2³)² = ?'], 'A conta grande no centro, com o "?".'),
      passos: [
        {
          pergunta: 'O expoente 2 de fora diz quantas vezes o $2^3$ aparece. Como fica?',
          fala: 'O expoente dois de fora diz quantas vezes o dois ao cubo aparece. Como fica?',
          opcoes: [
            { texto: '${2^3 \\times 2^3}$', certa: true, explica: 'Isso. Elevar ao quadrado é multiplicar por ele mesmo: dois grupos de $2^3$.', fala: 'Isso. Elevar ao quadrado é multiplicar por ele mesmo: dois grupos de dois ao cubo.', mostra: exp(['(2³)²', '2³ × 2³'], 'A conta e, embaixo, 2³ × 2³.') },
            { texto: '${2^3 \\times 2}$', explica: 'O 2 de fora é um expoente: o $2^3$ aparece duas vezes, ${2^3 \\times 2^3}$.', fala: 'O dois de fora é um expoente: o dois ao cubo aparece duas vezes, dois ao cubo vezes dois ao cubo.' },
          ],
          linha: { tex: '(2^3)^2 = 2^3 \\times 2^3', fala: 'dois ao cubo, ao quadrado, é dois ao cubo vezes dois ao cubo' },
        },
        {
          pergunta: 'Por extenso, quantos 2 ficam?',
          fala: 'Por extenso, quantos dois ficam?',
          opcoes: [
            { texto: 'Seis: $2^6$', certa: true, explica: 'Isso. Dois grupos de três 2: ${2 \\times 3 = 6}$. Aqui os expoentes se **multiplicam**.', fala: 'Isso. Dois grupos de três dois: dois vezes três, seis. Aqui os expoentes se multiplicam.', mostra: POTENCIA_DE_POTENCIA },
            { texto: 'Cinco: $2^5$', erro: 'potencia-de-potencia-soma', explica: 'Conte os grupos: são dois grupos de três 2, seis ao todo. $2^5$ seria ${2^3 \\times 2^2}$.', fala: 'Conte os grupos: são dois grupos de três dois, seis ao todo. Dois elevado a cinco seria dois ao cubo vezes dois ao quadrado.', mostra: POTENCIA_DE_POTENCIA },
          ],
          linha: { tex: '(2 \\times 2 \\times 2) \\times (2 \\times 2 \\times 2) = 2^6', fala: 'dois grupos de três dois: dois elevado a seis' },
        },
        {
          pergunta: 'Quanto vale $2^6\\text{?}$',
          fala: 'Quanto vale dois elevado a seis?',
          opcoes: [
            { texto: '64', certa: true, explica: 'Isso. ${2^3 = 8}$ e ${8 \\times 8 = 64}$.', fala: 'Isso. Dois ao cubo é oito, e oito vezes oito, sessenta e quatro.', mostra: exp(['(2³)²', '8 × 8', '64'], 'As linhas: (2³)², 8 × 8 e o 64 grande.') },
            { texto: '12', erro: 'potencia-multiplica-base-pelo-expoente', explica: '12 é ${2 \\times 6}$. São seis 2 multiplicados: 2, 4, 8, 16, 32, 64.', fala: 'Doze é dois vezes seis. São seis dois multiplicados: dois, quatro, oito, dezesseis, trinta e dois, sessenta e quatro.' },
          ],
          linha: { tex: '2^6 = 64', fala: 'dois elevado a seis é sessenta e quatro' },
        },
      ],
      esboco: 'A terceira regra também sai da contagem: grupos iguais de fatores.',
    },
    {
      tipo: 'anote',
      titulo: 'Propriedades das potências',
      definicao: 'Na **mesma base**: multiplicar soma os expoentes; dividir subtrai; potência de potência multiplica. Na dúvida, escreva por extenso.',
      exemplo: { tex: '2^3 \\times 2^2 = 2^5 \\quad 2^5 \\div 2^2 = 2^3 \\quad (2^3)^2 = 2^6', fala: 'dois ao cubo vezes dois ao quadrado é dois elevado a cinco; dois elevado a cinco dividido por dois ao quadrado é dois ao cubo; dois ao cubo, ao quadrado, é dois elevado a seis' },
      alerta: '${2^3 \\times 2^2}$ é $2^5$, não $2^6$ nem $4^5$. A base fica a mesma; só os fatores se juntam.',
      esboco: 'Na página: as três contas por extenso, uma embaixo da outra, com a regra ao lado de cada uma.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Bases diferentes: quanto é ${2^3 \\times 3^2}\\text{?}$',
      fala: 'Bases diferentes: quanto é dois ao cubo vezes três ao quadrado?',
      visual: exp(['2³ × 3² = ?'], 'A conta grande, com o "?".'),
      opcoes: [
        {
          texto: '72', certa: true,
          explica: 'Isso. Três 2 e dois 3 não viram uma potência só. Faça cada uma: ${8 \\times 9 = 72}$.',
          fala: 'Isso. Três dois e dois três não viram uma potência só. Faça cada uma: oito vezes nove, setenta e dois.',
          mostra: BASES_DIFERENTES,
        },
        {
          texto: '$6^5$', erro: 'potencia-junta-bases-diferentes',
          explica: 'Por extenso não há nenhum 6: são três 2 e dois 3. Só se juntam fatores iguais. ${8 \\times 9 = 72}$.',
          fala: 'Por extenso não há nenhum seis: são três dois e dois três. Só se juntam fatores iguais. Oito vezes nove, setenta e dois.',
          mostra: BASES_DIFERENTES,
        },
        {
          texto: '$5^5$', erro: 'potencia-junta-bases-diferentes',
          explica: 'Não há nenhum 5 por extenso: são três 2 e dois 3. Calcule cada uma: ${8 \\times 9 = 72}$.',
          fala: 'Não há nenhum cinco por extenso: são três dois e dois três. Calcule cada uma: oito vezes nove, setenta e dois.',
          mostra: BASES_DIFERENTES,
        },
      ],
      esboco: 'As regras valem só na mesma base. Por extenso, o 2 e o 3 ficam separados.',
    },
    {
      tipo: 'passo',
      problema: 'O expoente vale só para o que está logo antes dele. Compare ${(-3)^2}$ com ${-3^2}$.',
      fala: 'O expoente vale só para o que está logo antes dele. Compare menos três, entre parênteses, ao quadrado, com menos três ao quadrado, sem parênteses.',
      visual: exp(['(−3)²  ou  −3²'], 'As duas contas lado a lado, grandes, com "ou" no meio: com e sem parênteses.'),
      passos: [
        {
          pergunta: 'Com parênteses, o $-3$ inteiro é elevado. Quanto é ${(-3)^2}\\text{?}$',
          fala: 'Com parênteses, o menos três inteiro é elevado. Quanto é menos três, entre parênteses, ao quadrado?',
          opcoes: [
            { texto: '9', certa: true, explica: 'Isso. ${(-3) \\times (-3) = 9}$: sinais iguais, positivo.', fala: 'Isso. Menos três vezes menos três, nove: sinais iguais, positivo.', mostra: MENOS_3_ENTRE },
            { texto: '−9', erro: 'potencia-sinal-fora-dos-parenteses', explica: 'Os parênteses põem o menos dentro: ${(-3) \\times (-3)}$. Menos vezes menos dá mais: 9.', fala: 'Os parênteses põem o menos dentro: menos três vezes menos três. Menos vezes menos dá mais: nove.', mostra: MENOS_3_ENTRE },
            { texto: '−6', erro: 'potencia-multiplica-base-pelo-expoente', explica: '−6 é ${(-3) \\times 2}$. O 2 conta quantas vezes o −3 aparece: ${(-3) \\times (-3) = 9}$.', fala: 'Menos seis é menos três vezes dois. O dois conta quantas vezes o menos três aparece: menos três vezes menos três, nove.', mostra: MENOS_3_ENTRE },
          ],
          linha: { tex: '(-3)^2 = (-3) \\times (-3) = 9', fala: 'menos três, entre parênteses, ao quadrado é menos três vezes menos três, igual a nove' },
        },
        {
          pergunta: 'Sem parênteses, só o 3 é elevado; o menos fica de fora. Quanto é ${-3^2}\\text{?}$',
          fala: 'Sem parênteses, só o três é elevado; o menos fica de fora. Quanto é menos três ao quadrado?',
          opcoes: [
            { texto: '−9', certa: true, explica: 'Isso. Primeiro ${3^2 = 9}$, depois o menos: −9.', fala: 'Isso. Primeiro três ao quadrado, nove, depois o menos: menos nove.', mostra: MENOS_3_FORA },
            { texto: '9', erro: 'potencia-sinal-fora-dos-parenteses', explica: 'Sem parênteses, o expoente pega só o 3: ${-(3 \\times 3) = -9}$.', fala: 'Sem parênteses, o expoente pega só o três: menos, três vezes três, menos nove.', mostra: MENOS_3_FORA },
          ],
          linha: { tex: '-3^2 = -(3 \\times 3) = -9', fala: 'menos três ao quadrado é menos, três vezes três, igual a menos nove' },
        },
      ],
      esboco: 'Os parênteses decidem o que é a base. A calculadora do celular faz o mesmo: −3² dá −9.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: escreva por extenso e calcule ${2^4 \\times 2^3 \\div 2^5}$.',
      fala: 'No papel: escreva por extenso e calcule dois elevado a quatro, vezes dois ao cubo, dividido por dois elevado a cinco.',
      resposta: 4,
      resolucao: [
        { tex: '2^4 \\times 2^3 = 2^7', fala: 'quatro dois e mais três dois: sete dois, dois elevado a sete' },
        { tex: '2^7 \\div 2^5 = 2^2', fala: 'dos sete dois, saem cinco: sobram dois, dois ao quadrado' },
        { tex: '2^2 = 4', fala: 'dois ao quadrado é quatro' },
      ],
      esboco: 'Duas regras seguidas. Quem quiser confere pelos valores: 16 × 8 = 128 e 128 ÷ 32 = 4.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['propriedades-n1', 'propriedades-n2', 'propriedades-n3'],
      esboco: 'Nível 1: produto e divisão de mesma base, com a conta por extenso na tela. Nível 2: potência de potência, três potências numa conta, e os parênteses com o sinal. Nível 3: bases diferentes, qual conta dá a potência pedida e caixas de parafusos, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: '${2^3 \\times 2^2}$ tem cinco 2: é $2^5$. Na próxima aula: quanto vale $2^0$, e o que é um expoente negativo.',
      fala: 'Dois ao cubo vezes dois ao quadrado tem cinco dois: é dois elevado a cinco. Na próxima aula: quanto vale dois elevado a zero, e o que é um expoente negativo.',
      visual: PRODUTO,
      esboco: 'Responde ao gancho com a conta por extenso.',
    },
  ],
}
