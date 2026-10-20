import type { Aula, Visual } from '@/lib/formation/schema'

// Problemas do 2º grau. Um terreno retangular com um lado 3 m maior que o
// outro e área de 40 m². No Mexa revelar, o aluno descobre as duas áreas do
// retângulo de x por x + 3: x² + 3x = 40. Resolve pelo produto que zera:
// x = 5 ou x = −8. O momento-chave é a aposta "qual raiz é o lado?": as duas
// resolvem a equação, mas um lado de −8 m não existe. Depois, a moldura de
// largura x em volta de uma foto (a moldura está dos dois lados: 10 + 2x) e
// os dois números de soma 11 e produto 24, em que as duas raízes servem.
// Última aula da unidade: o fecho mostra a jornada do módulo, com Sistemas
// de equações a seguir.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const TERRENO = ret({ base: ['x', 3], altura: ['x'], total: 'área: 40\u00a0m²' }, 'O terreno: um retângulo com x à esquerda e x e 3 em cima, partido em dois pedaços vazios. Embaixo, 40\u00a0m².')
const TERRENO_PRONTO = ret({ base: [5, 3], altura: [5], areas: true, total: '5 · 8 = 40\u00a0m²' }, 'O terreno com x = 5: 5 à esquerda, 5 e 3 em cima, áreas 25 e 15. Embaixo, 5 · 8 = 40\u00a0m².')

const MOLDURA = ret({ base: ['x', 20, 'x'], altura: ['x', 10, 'x'], tamanhoLetra: 4, destaque: [1, 1] }, 'O quadro: a foto de 20 por 10 acesa no meio e a moldura em volta, com x nos quatro lados (em cima, x, 20, x; à esquerda, x, 10, x).')
const MOLDURA_LADOS = ret({ base: ['x', 20, 'x'], altura: ['x', 10, 'x'], tamanhoLetra: 4, destaque: [1, 1], total: '(20 + 2x) por (10 + 2x)' }, 'O mesmo quadro; embaixo, (20 + 2x) por (10 + 2x): cada lado ganha um x de cada ponta.')

const EQ_TERRENO = 'x² + 3x = 40'
const EQ_MOLDURA = '(20 + 2x)(10 + 2x) = 600'

/** As unidades do módulo Álgebra e Funções, na ordem do currículo. */
const JORNADA = ['Expressões algébricas', 'Produtos notáveis e fatoração', 'Equações do 2º grau', 'Sistemas de equações', 'Inequações', 'Funções', 'Função afim', 'Função quadrática', 'Função exponencial', 'Logaritmo', 'Transformações, composição e inversa']

export const aula: Aula = {
  id: 'AF.U3.A7',
  titulo: 'Problemas do 2º grau',
  objetivo: 'Montar a equação do 2º grau de um problema (um terreno, uma moldura, dois números), resolvê-la e conferir cada raiz no problema, ficando só com a que faz sentido (um lado não é negativo).',
  modelo: 'retangulo',
  esboco: 'Abre num terreno de lados x e x + 3, com 40\u00a0m². O Mexa revelar mostra as áreas x² e 3x: x² + 3x = 40. O passo a passo passa o 40, fatora e acha 5 e −8. Momento-chave: a aposta "qual é o lado?": as duas raízes resolvem a equação, mas um lado de −8\u00a0m não existe; o terreno com x = 5 aparece, 5 por 8. O anote dá o hábito. Depois, a moldura: a aposta dos lados (10 + 2x, a moldura dos dois lados) e o passo a passo até x = 5\u00a0cm. O caderno traz os dois números de soma 11 e produto 24, em que as duas raízes servem. O fecho mostra a jornada do módulo.',
  vega: 'Ideia central: num problema, a equação é só o meio. Chama-se de x o que se pede, monta-se a equação lendo cada lado como uma frase da história, resolve-se (fatorando, completando o quadrado ou pela fórmula) e volta-se ao problema com cada raiz: a equação não sabe que x é um lado, e aceita −8; o terreno, não. Às vezes as duas servem (os dois números de soma 11 e produto 24 são 3 e 8 nas duas raízes). Erros esperados: aceitar a raiz negativa como medida; esquecer que a moldura está dos dois lados (10 + x em vez de 10 + 2x); separar x(x + 3) = 40 em x = 40 (só o produto zero se separa); trocar o sinal das raízes ((x + 8) = 0 dá x = −8); multiplicar só as pontas ao abrir os parênteses; responder o outro lado em vez do pedido. Guie com "O que é o x?", "Esse número pode ser um lado?", "Confira no problema: os lados dão a área?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um terreno retangular tem um lado 3\u00a0m maior que o outro e área de 40\u00a0m². Quanto mede cada lado?',
      fala: 'Um terreno retangular tem um lado três metros maior que o outro e área de quarenta metros quadrados. Quanto mede cada lado?',
      visual: TERRENO,
      esboco: 'Um problema concreto, com um lado que não sabemos. O retângulo já tem o x e o 3 nos lados, e os pedaços vazios.',
    },
    {
      tipo: 'mexa',
      texto: 'Chame o lado menor de x. O outro é ${x + 3}$. Descubra a área de cada pedaço.',
      fala: 'Chame o lado menor de x. O outro é x mais três. Descubra a área de cada pedaço.',
      visual: ret({ base: ['x', 3], altura: ['x'], revelar: true, total: 'x² + 3x = 40' }, 'Os dois pedaços com "?" e a borda tracejada. Cada toque descobre uma área: x² e 3x. No fim, embaixo, x² + 3x = 40.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada pedaço para ver a área.',
        sucesso: { reveladas: 2 },
        mostre: 'As áreas x² e 3x aparecem, e a equação embaixo: x² + 3x = 40.',
      },
      descoberta: 'A área do terreno é x(x + 3) = x² + 3x, e vale 40: x² + 3x = 40.',
      esboco: 'Montar a equação: as áreas dos pedaços somadas dão a área do terreno.',
    },
    {
      tipo: 'passo',
      problema: 'Resolva ${x^2 + 3x = 40}$.',
      fala: 'Resolva x ao quadrado mais três x igual a quarenta.',
      visual: expr([EQ_TERRENO], 'A equação x² + 3x = 40, sozinha.'),
      passos: [
        {
          pergunta: 'O primeiro passo é:',
          opcoes: [
            { texto: '$x(x + 3) = 40$, então $x = 40$', erro: 'separa-produto-diferente-de-zero', explica: 'Com x = 40, a área seria ${40 \\cdot 43}$. Só um produto igual a zero se separa.', fala: 'Com x igual a quarenta, a área seria quarenta vezes quarenta e três. Só um produto igual a zero se separa.', mostra: expr([EQ_TERRENO], 'A equação continua sozinha.') },
            { texto: 'Tirar 40 dos dois lados', certa: true, explica: 'Isso. Com zero do outro lado, o produto que zera funciona.', fala: 'Isso. Com zero do outro lado, o produto que zera funciona.', mostra: expr([EQ_TERRENO, 'x² + 3x − 40 = 0'], 'Embaixo: x² + 3x − 40 = 0.') },
          ],
          linha: { tex: 'x^2 + 3x - 40 = 0', fala: 'x ao quadrado mais três x menos quarenta igual a zero' },
        },
        {
          pergunta: 'Dois números com soma 3 e produto −40:',
          fala: 'Dois números com soma três e produto menos quarenta:',
          opcoes: [
            { texto: '$-8$ e $5$', erro: 'fatora-com-o-sinal-trocado', explica: 'O produto dá −40, mas a soma dá ${-8 + 5 = -3}$. Troque os sinais.', fala: 'O produto dá menos quarenta, mas a soma dá menos oito mais cinco, menos três. Troque os sinais.', mostra: expr(['x² + 3x − 40 = 0'], 'A equação arrumada continua.') },
            { texto: '$4$ e $-10$', erro: 'fatores-com-a-soma-errada', explica: 'O produto dá −40, mas a soma dá ${4 + (-10) = -6}$.', fala: 'O produto dá menos quarenta, mas a soma dá quatro mais menos dez, menos seis.', mostra: expr(['x² + 3x − 40 = 0'], 'A equação arrumada continua.') },
            { texto: '$8$ e $-5$', certa: true, explica: 'Isso. ${8 \\cdot (-5) = -40}$ e ${8 + (-5) = 3}$.', fala: 'Isso. Oito vezes menos cinco, menos quarenta, e oito mais menos cinco, três.', mostra: expr(['x² + 3x − 40 = 0', '(x + 8)(x − 5) = 0'], 'Embaixo: (x + 8)(x − 5) = 0.') },
          ],
          linha: { tex: '(x + 8)(x - 5) = 0', fala: 'x mais oito vezes x menos cinco igual a zero' },
        },
        {
          pergunta: 'Então as raízes são:',
          opcoes: [
            { texto: '$x = 8$ ou $x = -5$', erro: 'raiz-com-o-sinal-do-fator', explica: 'Com x = 8, ${x + 8}$ dá 16, não 0. O fator ${x + 8}$ zera em −8.', fala: 'Com x igual a oito, x mais oito dá dezesseis, não zero. O fator x mais oito zera em menos oito.', mostra: expr(['(x + 8)(x − 5) = 0'], 'A fatoração continua.') },
            { texto: '$x = -8$ ou $x = 5$', certa: true, explica: 'Isso. Confira: ${25 + 15 = 40}$ e ${64 - 24 = 40}$.', fala: 'Isso. Confira: vinte e cinco mais quinze, quarenta, e sessenta e quatro menos vinte e quatro, quarenta.', mostra: expr(['(x + 8)(x − 5) = 0', 'x = −8 ou x = 5'], 'Embaixo, maior: x = −8 ou x = 5.') },
          ],
          linha: { tex: 'x = -8 \\text{ ou } x = 5', fala: 'x igual a menos oito ou x igual a cinco' },
        },
      ],
      esboco: 'A fatoração da unidade anterior resolve: arrumar com zero de um lado, achar o par, igualar cada fator a zero e conferir.',
    },
    {
      tipo: 'aposta',
      pergunta: 'As duas raízes resolvem ${x^2 + 3x = 40}$. Quanto mede o lado menor do terreno?',
      fala: 'As duas raízes resolvem x ao quadrado mais três x igual a quarenta. Quanto mede o lado menor do terreno?',
      visual: TERRENO,
      opcoes: [
        {
          texto: '5\u00a0m ou −8\u00a0m', erro: 'aceita-raiz-negativa-no-problema',
          explica: 'Um lado de −8\u00a0m não existe. A equação aceita o −8; o terreno, não.',
          fala: 'Um lado de menos oito metros não existe. A equação aceita o menos oito; o terreno, não.',
          mostra: TERRENO_PRONTO,
        },
        {
          texto: '5\u00a0m', certa: true,
          explica: 'Isso. O outro lado mede 8\u00a0m, e ${5 \\cdot 8 = 40}$. O −8 resolve a conta, mas não é um lado.',
          fala: 'Isso. O outro lado mede oito metros, e cinco vezes oito, quarenta. O menos oito resolve a conta, mas não é um lado.',
          mostra: TERRENO_PRONTO,
        },
      ],
      esboco: 'O momento-chave: a equação não sabe que x é um lado. O terreno com x = 5 aparece, com as áreas 25 e 15.',
    },
    {
      tipo: 'anote',
      titulo: 'Problemas do 2º grau',
      definicao: 'Chame de x o que se pede, monte a equação e resolva. Depois, **confira cada raiz no problema**: fica a que faz sentido.',
      exemplo: { tex: 'x(x + 3) = 40: \\ x = 5 \\text{ m}', fala: 'x vezes x mais três igual a quarenta: x é cinco metros; o menos oito não é um lado' },
      alerta: 'A equação não sabe que x é um lado. Um comprimento, uma largura ou um preço não são negativos.',
      esboco: 'Na página: o terreno de 5 por 8, a equação e o −8 riscado, com "não é um lado".',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma foto de 20\u00a0cm por 10\u00a0cm ganhou uma moldura de largura x. Quanto mede o quadro inteiro?',
      fala: 'Uma foto de vinte centímetros por dez centímetros ganhou uma moldura de largura x. Quanto mede o quadro inteiro?',
      visual: MOLDURA,
      opcoes: [
        {
          texto: '$(20 + x)$ por $(10 + x)$', erro: 'moldura-so-de-um-lado',
          explica: 'A moldura está dos dois lados: um x à esquerda e outro à direita. Cada lado ganha ${2x}$.',
          fala: 'A moldura está dos dois lados: um x à esquerda e outro à direita. Cada lado ganha dois x.',
          mostra: MOLDURA_LADOS,
        },
        {
          texto: '$(20 + 2x)$ por $(10 + 2x)$', certa: true,
          explica: 'Isso. Um x em cada ponta: em cima, ${x + 20 + x}$.',
          fala: 'Isso. Um x em cada ponta: em cima, x mais vinte mais x.',
          mostra: MOLDURA_LADOS,
        },
      ],
      esboco: 'Montar com cuidado: o desenho mostra um x em cada ponta de cada lado.',
    },
    {
      tipo: 'passo',
      problema: 'O quadro inteiro tem 600\u00a0cm². Ache a largura x da moldura.',
      fala: 'O quadro inteiro tem seiscentos centímetros quadrados. Ache a largura x da moldura.',
      visual: expr([EQ_MOLDURA], 'A equação (20 + 2x)(10 + 2x) = 600, sozinha.'),
      passos: [
        {
          pergunta: 'Abrindo os parênteses, fica:',
          opcoes: [
            { texto: '$4x^2 + 200 = 600$', erro: 'produto-so-das-pontas', explica: 'Faltam os pedaços do meio: ${20 \\cdot 2x}$ e ${2x \\cdot 10}$, que dão ${60x}$.', fala: 'Faltam os pedaços do meio: vinte vezes dois x e dois x vezes dez, que dão sessenta x.', mostra: expr([EQ_MOLDURA], 'A equação continua sozinha.') },
            { texto: '$4x^2 + 60x + 200 = 600$', certa: true, explica: 'Isso. Cada termo com cada termo: ${200 + 40x + 20x + 4x^2}$.', fala: 'Isso. Cada termo com cada termo: duzentos mais quarenta x mais vinte x mais quatro x ao quadrado.', mostra: expr([EQ_MOLDURA, '4x² + 60x + 200 = 600'], 'Embaixo: 4x² + 60x + 200 = 600.') },
          ],
          linha: { tex: '4x^2 + 60x + 200 = 600', fala: 'quatro x ao quadrado mais sessenta x mais duzentos igual a seiscentos' },
        },
        {
          pergunta: 'Tirando 600 dos dois lados e dividindo tudo por 4:',
          fala: 'Tirando seiscentos dos dois lados e dividindo tudo por quatro:',
          opcoes: [
            { texto: '$x^2 + 15x - 400 = 0$', erro: 'divide-so-o-primeiro', explica: 'O ${-400}$ também vai dividido por 4: ${-100}$.', fala: 'O menos quatrocentos também vai dividido por quatro: menos cem.', mostra: expr(['4x² + 60x + 200 = 600', '4x² + 60x − 400 = 0'], 'Embaixo: 4x² + 60x − 400 = 0, ainda sem dividir.') },
            { texto: '$x^2 + 15x - 100 = 0$', certa: true, explica: 'Isso. ${4x^2 + 60x - 400 = 0}$, e cada termo por 4.', fala: 'Isso. Quatro x ao quadrado mais sessenta x menos quatrocentos igual a zero, e cada termo por quatro.', mostra: expr(['4x² + 60x + 200 = 600', 'x² + 15x − 100 = 0'], 'Embaixo: x² + 15x − 100 = 0.') },
          ],
          linha: { tex: 'x^2 + 15x - 100 = 0', fala: 'x ao quadrado mais quinze x menos cem igual a zero' },
        },
        {
          pergunta: 'As raízes são 5 e −20. A largura da moldura é:',
          fala: 'As raízes são cinco e menos vinte. A largura da moldura é:',
          opcoes: [
            { texto: '5\u00a0cm ou −20\u00a0cm', erro: 'aceita-raiz-negativa-no-problema', explica: 'Uma largura de −20\u00a0cm não existe. Fica o 5.', fala: 'Uma largura de menos vinte centímetros não existe. Fica o cinco.', mostra: expr(['x² + 15x − 100 = 0', 'x = 5 ou x = −20'], 'Embaixo: x = 5 ou x = −20.') },
            { texto: '5\u00a0cm', certa: true, explica: 'Isso. Confira: o quadro mede 30 por 20, e ${30 \\cdot 20 = 600}$.', fala: 'Isso. Confira: o quadro mede trinta por vinte, e trinta vezes vinte, seiscentos.', mostra: expr(['x = 5 ou x = −20', 'x = 5\u00a0cm'], 'Embaixo, maior: x = 5\u00a0cm.') },
          ],
          linha: { tex: 'x = 5 \\text{ cm}', fala: 'x igual a cinco centímetros' },
        },
      ],
      esboco: 'A moldura: abrir os parênteses (os quatro pedaços), arrumar, dividir por 4 e ficar com a raiz que é uma largura. A conferência volta ao quadro: 30 por 20.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: dois números somam 11 e o produto é 24. Chame um de x e o outro de ${11 - x}$. Digite o maior.',
      fala: 'No papel: dois números somam onze e o produto é vinte e quatro. Chame um de x e o outro de onze menos x. Digite o maior.',
      resposta: 8,
      resolucao: [
        { tex: 'x(11 - x) = 24', fala: 'x vezes onze menos x igual a vinte e quatro' },
        { tex: 'x^2 - 11x + 24 = 0', fala: 'x ao quadrado menos onze x mais vinte e quatro igual a zero' },
        { tex: '(x - 3)(x - 8) = 0: \\ x = 3 \\text{ ou } x = 8', fala: 'x menos três vezes x menos oito igual a zero: x é três ou oito' },
        { tex: '\\text{as duas servem: o par é } 3 \\text{ e } 8', fala: 'as duas servem: o par é três e oito' },
      ],
      esboco: 'Aqui as duas raízes servem: x = 3 dá o par 3 e 8; x = 8 dá 8 e 3. Para chegar à segunda linha, passa-se tudo para a direita (ou multiplica-se por −1).',
    },
    {
      tipo: 'sua-vez',
      geradores: ['segundo-grau-problemas-n1', 'segundo-grau-problemas-n2', 'segundo-grau-problemas-n3'],
      esboco: 'Nível 1: o lado menor de um terreno com um lado k m maior, com o retângulo no palco. Nível 2: a largura da moldura em volta de uma foto. Nível 3: os dois números de soma e produto dados, ou o lado de um quadrado que cresce.',
    },
    {
      tipo: 'fecho',
      texto: 'O terreno mede 5\u00a0m por 8\u00a0m: o −8 resolve a conta, mas não é um lado. A seguir, Sistemas de equações: duas incógnitas ao mesmo tempo.',
      fala: 'O terreno mede cinco metros por oito metros: o menos oito resolve a conta, mas não é um lado. A seguir, Sistemas de equações: duas incógnitas ao mesmo tempo.',
      visual: { modelo: 'livre', estado: { jornada: JORNADA, aqui: 3, feitas: 3 }, esboco: 'O caminho de Álgebra e Funções: Expressões algébricas, Produtos notáveis e fatoração e Equações do 2º grau feitas; Sistemas de equações acesa com "você está aqui"; as outras esperando.' },
      esboco: 'Responde ao gancho, fecha a unidade e mostra a jornada do módulo, com a próxima parada acesa.',
    },
  ],
}
