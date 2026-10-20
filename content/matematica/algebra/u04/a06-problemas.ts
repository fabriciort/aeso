import type { Aula, Visual } from '@/lib/formation/schema'

// Problemas com sistemas. Um cinema vendeu 50 ingressos e fez R$\u00a0800, com a
// inteira a R$\u00a020 e a meia a R$\u00a010. Como nas 10 frutas que custaram R$\u00a026,
// cada informação vira uma equação e uma reta: x + y = 50 e
// 20x + 10y = 800. O momento-chave é montar: dizer o que cada letra é e
// ler cada informação como uma equação. Depois, a aposta de um par que
// serve a uma só (40 inteiras e 10 meias dão 50, mas não R$\u00a0800), a adição
// (× (−10) na primeira), o par (30, 20) conferido no problema. As cédulas
// de R$\u00a05 e R$\u00a010 (montar e resolver) e as idades (responder o que se
// pede). Última aula da unidade: o fecho mostra a jornada do módulo, com
// Inequações a seguir.

const sis = (sistema: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { sistema }, esboco })
const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })
const chips = (materiais: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { materiais }, esboco })

const CINEMA = chips(['50 ingressos', 'R$\u00a0800', 'inteira: R$\u00a020', 'meia: R$\u00a010'], 'As quatro informações do cinema, em fichas: 50 ingressos, R$\u00a0800, a inteira a R$\u00a020 e a meia a R$\u00a010.')
const EIXOS = { x: { de: 0, ate: 50, passo: 10 }, y: { de: 0, ate: 80, passo: 10 } }
const RETA_1 = { equacao: 'x + y = 50' }
const RETA_2 = { equacao: '20x + 10y = 800' }
const PLANO_1 = plano({ ...EIXOS, retas: [RETA_1] }, 'O plano de 0 a 50 no x e de 0 a 80 no y, de 10 em 10, com a reta x + y = 50 (âmbar).')
const PLANO_2 = plano({ ...EIXOS, retas: [RETA_1, RETA_2] }, 'As duas retas: x + y = 50 (âmbar) e 20x + 10y = 800 (azul).')
const PLANO_ERRADO = plano({ ...EIXOS, retas: [RETA_1, RETA_2], conferir: [40, 10] }, 'As duas retas e o ponto (40, 10) em rosa, na reta âmbar. Embaixo: 40 + 10 = 50 ✓ e, em rosa, 20 · 40 + 10 · 10 = 900 ≠ 800 ✗.')
const PLANO_CERTO = plano({ ...EIXOS, retas: [RETA_1, RETA_2], cruzamento: true, conferir: true }, 'As duas retas se cruzam em (30, 20). Embaixo: 30 + 20 = 50 ✓ e 20 · 30 + 10 · 20 = 800 ✓.')

const CINE = ['x + y = 50', '20x + 10y = 800']
const CINE_VEZES = (extra: Record<string, unknown>, esboco: string) => sis({ equacoes: CINE, vezes: [-10, 1], ...extra }, esboco)

const CEDULAS = chips(['12 cédulas', 'R$\u00a085', 'de R$\u00a05', 'de R$\u00a010'], 'As informações das cédulas, em fichas: 12 cédulas, R$\u00a085 ao todo, umas de R$\u00a05 e outras de R$\u00a010.')

/** As unidades do módulo Álgebra e Funções, na ordem do currículo. */
const JORNADA = ['Expressões algébricas', 'Produtos notáveis e fatoração', 'Equações do 2º grau', 'Sistemas de equações', 'Inequações', 'Funções', 'Função afim', 'Função quadrática', 'Função exponencial', 'Logaritmo', 'Transformações, composição e inversa']

export const aula: Aula = {
  id: 'AF.U4.A6',
  titulo: 'Problemas com sistemas',
  objetivo: 'Montar o sistema de um problema com duas perguntas (ingressos de inteira e meia, cédulas, idades): dizer o que cada letra é, escrever uma equação para cada informação, resolver por substituição ou adição e conferir o par no problema, respondendo o que foi pedido.',
  modelo: 'plano',
  esboco: 'Abre nas fichas do cinema: 50 ingressos, R$\u00a0800, inteira R$\u00a020, meia R$\u00a010. Momento-chave: o passo a passo de montar, em que cada informação vira uma equação e uma reta no plano. A aposta do par (40, 10): serve aos 50 ingressos, mas dá R$\u00a0900. O Mexa somar com a primeira vezes −10: 10x = 300. O passo a passo termina: 30 inteiras, 20 meias, conferido nas duas informações (o cruzamento no plano). O anote. As cédulas: a aposta de montar e o caderno. As idades: a aposta de responder o que se pede. O fecho mostra a jornada do módulo.',
  vega: 'Ideia central: um problema com duas perguntas e duas informações vira um sistema. Primeiro, diga o que cada letra é ("x: as inteiras; y: as meias"). Depois, leia cada informação como uma frase: "50 ingressos" é x + y = 50; "R$\u00a0800" é 20x + 10y = 800 (cada inteira vale 20, cada meia vale 10). Resolva pelo caminho mais curto (aqui, a adição com a primeira vezes −10) e confira o par no PROBLEMA, nas duas informações. Por fim, responda o que foi pedido (as meias, não as inteiras). Erros esperados: montar com os números na ordem em que aparecem (x + y = 800); dar a cada letra o preço da outra; aceitar um par que serve a uma informação só; responder a outra letra; parar no 2y = 16 sem dividir. Guie com "O que é o x? E o y?", "Que frase do problema diz isso?", "Esse par dá os R$\u00a0800?", "O que o problema pergunta?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um cinema vendeu 50 ingressos e fez R$\u00a0800. A inteira custa R$\u00a020 e a meia, R$\u00a010. Quantas meias foram vendidas?',
      fala: 'Um cinema vendeu cinquenta ingressos e fez oitocentos reais. A inteira custa vinte reais e a meia, dez. Quantas meias foram vendidas?',
      visual: CINEMA,
      esboco: 'Um problema do dia a dia com duas perguntas escondidas: quantas inteiras e quantas meias.',
    },
    {
      tipo: 'passo',
      problema: 'Como nas 10 frutas, cada informação vira uma equação. Chame de x as inteiras e de y as meias.',
      fala: 'Como nas dez frutas, cada informação vira uma equação. Chame de x as inteiras e de y as meias.',
      visual: CINEMA,
      passos: [
        {
          pergunta: '"50 ingressos" vira:',
          fala: 'Cinquenta ingressos vira:',
          opcoes: [
            { texto: '$20x + 10y = 50$', erro: 'equacao-diferente-do-problema', explica: '50 é quantos ingressos, não quantos reais. Conte os ingressos: x inteiras e y meias.', fala: 'Cinquenta é quantos ingressos, não quantos reais. Conte os ingressos: x inteiras e y meias.', mostra: CINEMA },
            { texto: '$x + y = 50$', certa: true, explica: 'Isso. Inteiras mais meias dão os 50 ingressos.', fala: 'Isso. x mais y igual a cinquenta: inteiras mais meias dão os cinquenta ingressos.', mostra: PLANO_1 },
          ],
          linha: { tex: 'x + y = 50', fala: 'x mais y igual a cinquenta' },
        },
        {
          pergunta: '"R$\u00a0800" vira:',
          fala: 'Oitocentos reais vira:',
          opcoes: [
            { texto: '$x + y = 800$', erro: 'equacao-diferente-do-problema', explica: 'Cada inteira vale R$\u00a020, não R$\u00a01. O dinheiro das inteiras é ${20x}$.', fala: 'Cada inteira vale vinte reais, não um. O dinheiro das inteiras é vinte x.', mostra: PLANO_1 },
            { texto: '$10x + 20y = 800$', erro: 'troca-o-preco-das-letras', explica: 'O x são as inteiras, que custam R$\u00a020. Cada letra leva o preço dela: ${20x}$.', fala: 'O x são as inteiras, que custam vinte reais. Cada letra leva o preço dela: vinte x.', mostra: PLANO_1 },
            { texto: '$20x + 10y = 800$', certa: true, explica: 'Isso. O dinheiro das inteiras mais o das meias. Duas informações, duas retas.', fala: 'Isso. Vinte x mais dez y igual a oitocentos: o dinheiro das inteiras mais o das meias. Duas informações, duas retas.', mostra: PLANO_2 },
          ],
          linha: { tex: '20x + 10y = 800', fala: 'vinte x mais dez y igual a oitocentos' },
        },
      ],
      esboco: 'O momento-chave: montar. Cada informação acertada vira uma reta no plano, como as das frutas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém respondeu: 40 inteiras e 10 meias. Está certo?',
      fala: 'Alguém respondeu: quarenta inteiras e dez meias. Está certo?',
      visual: PLANO_2,
      opcoes: [
        {
          texto: 'Sim: $40 + 10 = 50$', erro: 'par-so-de-uma-equacao',
          explica: 'Dá os 50 ingressos, mas ${40 \\cdot 20 + 10 \\cdot 10 = 900}$, não 800. Serve a uma informação só.',
          fala: 'Dá os cinquenta ingressos, mas quarenta vezes vinte mais dez vezes dez dá novecentos, não oitocentos. Serve a uma informação só.',
          mostra: PLANO_ERRADO,
        },
        {
          texto: 'Não: daria R$\u00a0900', certa: true,
          explica: 'Isso. ${800 + 100 = 900}$. O par tem de servir às duas informações.',
          fala: 'Isso. Oitocentos mais cem dá novecentos. O par tem de servir às duas informações.',
          mostra: PLANO_ERRADO,
        },
      ],
      esboco: 'O hábito de conferir nas duas, no problema. O ponto (40, 10) fica em rosa, numa reta só.',
    },
    {
      tipo: 'mexa',
      texto: 'Pela adição: a primeira vezes −10 deixa ${-10y}$, oposto ao ${10y}$ da segunda.',
      fala: 'Pela adição: a primeira vezes menos dez deixa menos dez y, oposto ao dez y da segunda.',
      visual: CINE_VEZES({}, 'x + y = 50 com "× (−10)" ao lado, em cima de 20x + 10y = 800.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para multiplicar a primeira; toque de novo para somar.',
        sucesso: { somado: true },
        mostre: 'A primeira vira −10x − 10y = −500; somadas, o y some: 10x = 300.',
      },
      descoberta: 'Com a primeira vezes −10, o y some e sobra 10x = 300.',
      esboco: 'O primeiro toque multiplica a primeira linha; o segundo soma: −10y e 10y riscados, embaixo 10x = 300.',
    },
    {
      tipo: 'passo',
      problema: 'Sobrou ${10x = 300}$. Termine e responda o problema.',
      fala: 'Sobrou dez x igual a trezentos. Termine e responda o problema.',
      visual: CINE_VEZES({ somado: true }, 'A soma: −10y e 10y riscados, embaixo 10x = 300.'),
      passos: [
        {
          pergunta: 'Então x = 30. E o y?',
          fala: 'Então x é trinta. E o y?',
          opcoes: [
            { texto: '$y = 80$', erro: 'desfaz-com-a-mesma-operacao', explica: 'Em ${30 + y = 50}$, desfaz-se o + 30 tirando 30: ${50 - 30}$.', fala: 'Em trinta mais y igual a cinquenta, desfaz-se o mais trinta tirando trinta: cinquenta menos trinta.', mostra: CINE_VEZES({ somado: true }, 'A soma continua.') },
            { texto: '$y = 20$', certa: true, explica: 'Isso. ${30 + y = 50}$, então ${y = 20}$.', fala: 'Isso. Trinta mais y igual a cinquenta, então y igual a vinte.', mostra: CINE_VEZES({ somado: true }, 'A soma continua.') },
          ],
          linha: { tex: 'x = 30, \\ 30 + y = 50 \\Rightarrow y = 20', fala: 'x igual a trinta; trinta mais y igual a cinquenta, então y igual a vinte' },
        },
        {
          pergunta: 'Confira no problema:',
          opcoes: [
            { texto: '$30 + 20 = 50$: pronto', erro: 'par-so-de-uma-equacao', explica: 'Falta o dinheiro. O par (40, 10) também dava 50 ingressos.', fala: 'Falta o dinheiro. O par quarenta, dez também dava cinquenta ingressos.', mostra: CINE_VEZES({ somado: true }, 'A soma continua.') },
            { texto: '50 ingressos e ${600 + 200 = 800}$', certa: true, explica: 'Isso. As duas informações batem: as retas se cruzam em (30, 20).', fala: 'Isso. Cinquenta ingressos, e seiscentos mais duzentos, oitocentos. As retas se cruzam em trinta, vinte.', mostra: PLANO_CERTO },
          ],
          linha: { tex: '30 + 20 = 50 \\ \\checkmark \\quad 600 + 200 = 800 \\ \\checkmark', fala: 'trinta mais vinte dá cinquenta, certo; seiscentos mais duzentos dá oitocentos, certo' },
        },
        {
          pergunta: 'Quantas meias foram vendidas?',
          opcoes: [
            { texto: '30', erro: 'responde-outra-pergunta', explica: '30 é o x, as inteiras. As meias são o y.', fala: 'Trinta é o x, as inteiras. As meias são o y.', mostra: PLANO_CERTO },
            { texto: '20', certa: true, explica: 'Isso. 20 meias, e 30 inteiras.', fala: 'Isso. Vinte meias, e trinta inteiras.', mostra: PLANO_CERTO },
          ],
          linha: { tex: '20 \\text{ meias}', fala: 'vinte meias' },
        },
      ],
      esboco: 'Achar o y, conferir nas duas informações (o plano mostra o cruzamento) e responder o que se pede: as meias.',
    },
    {
      tipo: 'anote',
      titulo: 'Problemas com sistemas',
      definicao: 'Diga o que cada letra é. Cada informação vira uma equação. Resolva e **confira no problema**: as duas informações têm de bater.',
      exemplo: { tex: 'x + y = 50, \\ 20x + 10y = 800: \\ (30, 20)', fala: 'x mais y igual a cinquenta e vinte x mais dez y igual a oitocentos: trinta inteiras e vinte meias' },
      alerta: 'No fim, responda o que foi pedido: a pergunta pode ser o y.',
      esboco: 'Na página: "x: inteiras, y: meias", as duas equações, a adição, o par e a conferência com o dinheiro.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Lia tem 12 cédulas, de R$\u00a05 e de R$\u00a010, que somam R$\u00a085. Com x de R$\u00a05 e y de R$\u00a010, o sistema é:',
      fala: 'Lia tem doze cédulas, de cinco e de dez reais, que somam oitenta e cinco reais. Com x de cinco e y de dez, o sistema é:',
      visual: CEDULAS,
      opcoes: [
        {
          texto: '$x + y = 85$ e $5x + 10y = 12$', erro: 'equacao-diferente-do-problema',
          explica: '12 é quantas cédulas; 85 é quantos reais. Troque: ${x + y = 12}$.',
          fala: 'Doze é quantas cédulas; oitenta e cinco é quantos reais. Troque: x mais y igual a doze.',
        },
        {
          texto: '$x + y = 12$ e $10x + 5y = 85$', erro: 'troca-o-preco-das-letras',
          explica: 'O x são as de R$\u00a05: o dinheiro delas é ${5x}$.',
          fala: 'O x são as de cinco reais: o dinheiro delas é cinco x.',
        },
        {
          texto: '$x + y = 12$ e $5x + 10y = 85$', certa: true,
          explica: 'Isso. As cédulas contadas, e o dinheiro de cada tipo somado.',
          fala: 'Isso. As cédulas contadas, e o dinheiro de cada tipo somado.',
        },
      ],
      esboco: 'Montar outro problema com o mesmo jeito do cinema: contar e somar o dinheiro.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, resolva o sistema das cédulas. Quantas cédulas de R$\u00a010 Lia tem?',
      fala: 'No papel, resolva o sistema das cédulas. Quantas cédulas de dez reais Lia tem?',
      resposta: 5,
      resolucao: [
        { tex: 'x + y = 12 \\quad \\times (-5): \\ -5x - 5y = -60', fala: 'x mais y igual a doze, vezes menos cinco: menos cinco x menos cinco y igual a menos sessenta' },
        { tex: '5y = 85 - 60 = 25 \\Rightarrow y = 5', fala: 'somando com cinco x mais dez y igual a oitenta e cinco: cinco y igual a vinte e cinco, então y igual a cinco' },
        { tex: 'x = 12 - 5 = 7', fala: 'x igual a doze menos cinco, sete' },
        { tex: '35 + 50 = 85 \\ \\checkmark', fala: 'trinta e cinco mais cinquenta dá oitenta e cinco, certo' },
      ],
      esboco: 'A adição com a primeira vezes −5 (ou a substituição x = 12 − y). A pergunta é o y: 5 cédulas de R$\u00a010.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Ana e a filha somam 40 anos, e Ana tem 24 a mais. Com x para Ana e y para a filha, a adição dá ${2x = 64}$. A filha tem:',
      fala: 'Ana e a filha somam quarenta anos, e Ana tem vinte e quatro a mais. Com x para Ana e y para a filha, a adição dá dois x igual a sessenta e quatro. A filha tem:',
      visual: sis({ equacoes: ['x + y = 40', 'x − y = 24'], somado: true }, 'x + y = 40 em cima de x − y = 24; o y e o −y riscados, embaixo 2x = 64.'),
      opcoes: [
        {
          texto: '32 anos', erro: 'responde-outra-pergunta',
          explica: '32 é o x, a idade de Ana. A filha é o y: ${32 + y = 40}$.',
          fala: 'Trinta e dois é o x, a idade de Ana. A filha é o y: trinta e dois mais y igual a quarenta.',
        },
        {
          texto: '16 anos', erro: 'esquece-de-dividir',
          explica: '${40 - 24 = 16}$ é o dobro da idade dela: ${2y = 16}$. Com 16, Ana teria 24 anos, e não daria 40.',
          fala: 'Quarenta menos vinte e quatro, dezesseis, é o dobro da idade dela. Com dezesseis, Ana teria vinte e quatro, e não daria quarenta.',
        },
        {
          texto: '8 anos', certa: true,
          explica: 'Isso. Ana tem 32: ${32 + 8 = 40}$ e ${32 - 8 = 24}$.',
          fala: 'Isso. Ana tem trinta e dois: trinta e dois mais oito dá quarenta, e trinta e dois menos oito dá vinte e quatro.',
        },
      ],
      esboco: 'Responder o que se pede: a conta dá o x, a pergunta é o y.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['sistemas-problemas-n1', 'sistemas-problemas-n2', 'sistemas-problemas-n3'],
      esboco: 'Nível 1: ingressos de inteira e meia, com as fichas no palco. Nível 2: cédulas de dois valores. Nível 3: idades (soma e diferença) ou galinhas e porcos (cabeças e patas).',
    },
    {
      tipo: 'fecho',
      texto: 'O cinema vendeu 20 meias e 30 inteiras, e as duas informações batem. A seguir, Inequações: em vez de igual, maior ou menor.',
      fala: 'O cinema vendeu vinte meias e trinta inteiras, e as duas informações batem. A seguir, Inequações: em vez de igual, maior ou menor.',
      visual: { modelo: 'livre', estado: { jornada: JORNADA, aqui: 4, feitas: 4 }, esboco: 'O caminho de Álgebra e Funções: as quatro primeiras feitas; Inequações acesa com "você está aqui"; as outras esperando.' },
      esboco: 'Responde ao gancho, fecha a unidade e mostra a jornada do módulo, com a próxima parada acesa.',
    },
  ],
}
