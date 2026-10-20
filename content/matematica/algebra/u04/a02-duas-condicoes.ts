import type { Aula, Visual } from '@/lib/formation/schema'

// Duas condições ao mesmo tempo. As 10 frutas custaram R$ 26: a maçã custa
// R$ 2 e a pera, R$ 3. O preço vira a segunda equação, 2x + 3y = 26, e uma
// segunda reta. O momento-chave é o Mexa "cruzar": o aluno toca o ponto que
// está nas duas retas, (4, 6): 4 maçãs e 6 peras. Um par que serve a uma só,
// (7, 3), dá 10 frutas e R$ 23. O hábito: conferir nas duas equações. O
// nome: sistema, com a chave. Depois, um cruzamento abaixo do eixo x, um
// par conferido passo a passo e um caderno de testar pares.

const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })

const DEZ = { equacao: 'x + y = 10' }
const PRECO = { equacao: '2x + 3y = 26' }
const EIXOS = { x: [0, 13], y: [0, 10] }
const ONZE: number[][] = [[0, 10], [1, 9], [2, 8], [3, 7], [4, 6], [5, 5], [6, 4], [7, 3], [8, 2], [9, 1], [10, 0]]

const DUAS = (extra: Record<string, unknown>, esboco: string) => plano({ ...EIXOS, retas: [DEZ, PRECO], ...extra }, esboco)
const SOLUCAO = DUAS({ cruzamento: true, conferir: true }, 'As duas retas se cruzam no (4, 6), branco com anel. Embaixo, em âmbar, 4 + 6 = 10 ✓; em azul, 2 · 4 + 3 · 6 = 26 ✓.')
const SETE_TRES = DUAS({ conferir: [7, 3] }, 'O (7, 3) na reta âmbar, fora da azul. Embaixo, 7 + 3 = 10 ✓ e, em rosa, 2 · 7 + 3 · 3 = 23 ≠ 26 ✗.')

const NEG = [{ equacao: 'x + y = 1' }, { equacao: '2x - y = 8' }]
const EIXOS_NEG = { x: [-2, 6], y: [-5, 4] }

const SETE = [{ equacao: 'x + y = 7' }, { equacao: '3x - y = 1' }]
const EIXOS_SETE = { x: [-1, 8], y: [-2, 8] }

export const aula: Aula = {
  id: 'AF.U4.A2',
  titulo: 'Duas condições ao mesmo tempo',
  objetivo: 'Montar a segunda equação de um problema, ver cada condição como uma reta e achar o par que serve às duas no cruzamento; conferir um par nas duas equações e reconhecer o que serve a uma só.',
  modelo: 'plano',
  esboco: 'Volta à reta das 10 frutas, agora com o preço: R$ 26, maçã a R$ 2, pera a R$ 3. A aposta monta 2x + 3y = 26, e a segunda reta aparece. Momento-chave: o Mexa "cruzar", em que o aluno toca o ponto das duas retas, (4, 6). A aposta do (7, 3) mostra o par que serve a uma só: 10 frutas, mas R$ 23. O anote dá o nome, sistema, com a chave. Depois, um cruzamento com y negativo, um passo a passo de conferir e um caderno de testar pares.',
  vega: 'Ideia central: duas condições ao mesmo tempo são duas equações, e a solução é o par que serve às duas. Cada equação é uma reta; o par das duas é onde as retas se cruzam. Para saber se um par é a solução, ponha-o nas duas equações: servir a uma só não basta. Erros esperados: montar o preço como x + y = 26 ou trocar os preços (3x + 2y); aceitar um par que dá 10 frutas sem conferir o preço; trocar x e y no par; ler o cruzamento com o sinal errado. Guie com "Esse par serve à primeira? E à segunda?", "Onde as duas retas se encontram?", "Quanto custam 7 maçãs e 3 peras?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'As 10 frutas custaram **R$ 26**. A maçã custa R$ 2 e a pera, R$ 3. Agora dá para saber quantas de cada?',
      fala: 'As dez frutas custaram vinte e seis reais. A maçã custa dois reais e a pera, três. Agora dá para saber quantas de cada?',
      visual: plano({ ...EIXOS, retas: [DEZ], pontos: ONZE }, 'A reta de x + y = 10 da aula anterior, com os 11 pares das frutas. Os eixos já vão até 13.'),
      esboco: 'Os 11 jeitos de ter 10 frutas, e uma informação nova que vai escolher um deles.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Com x maçãs e y peras, que equação diz o preço?',
      fala: 'Com x maçãs e y peras, que equação diz o preço?',
      visual: plano({ ...EIXOS, retas: [DEZ], pontos: ONZE }, 'A mesma reta com os 11 pares.'),
      opcoes: [
        {
          texto: '$x + y = 26$',
          erro: 'equacao-diferente-do-problema',
          explica: 'Essa conta frutas, não reais. Cada maçã vale R$ 2: x maçãs custam 2x.',
          fala: 'Essa conta frutas, não reais. Cada maçã vale dois reais: x maçãs custam dois x.',
          mostra: plano({ ...EIXOS, retas: [DEZ], pontos: ONZE }, 'A reta das frutas, sem mudança.'),
        },
        {
          texto: '$2x + 3y = 26$',
          certa: true,
          explica: 'Isso. x maçãs a R$ 2 dão 2x; y peras a R$ 3 dão 3y. É outra reta.',
          fala: 'Isso. x maçãs a dois reais dão dois x; y peras a três reais dão três y. É outra reta.',
          mostra: DUAS({}, 'A segunda reta, azul, de 2x + 3y = 26, cresce cruzando a âmbar. Os pontos somem.'),
        },
        {
          texto: '$3x + 2y = 26$',
          erro: 'troca-x-e-y',
          explica: 'O x são as maçãs, que custam R$ 2. Então é 2x; as peras, 3y.',
          fala: 'O x são as maçãs, que custam dois reais. Então é dois x; as peras, três y.',
          mostra: plano({ ...EIXOS, retas: [DEZ], pontos: ONZE }, 'A reta das frutas, sem mudança.'),
        },
      ],
      esboco: 'O preço vira equação: quantidade vezes preço, somados. Na certa, a segunda reta aparece.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada condição é uma reta. O par certo tem de estar nas duas.',
      fala: 'Cada condição é uma reta. O par certo tem de estar nas duas.',
      visual: DUAS({}, 'As duas retas, âmbar e azul, com as equações escritas perto. O cruzamento ainda sem ponto.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no ponto que serve às duas equações.',
        sucesso: { par: [4, 6] },
        mostre: 'As retas se cruzam em (4, 6): 4 maçãs e 6 peras.',
      },
      descoberta: 'O par que serve às duas é onde as retas se cruzam: (4, 6). Confere: 4 + 6 = 10 e 2 · 4 + 3 · 6 = 26.',
      esboco: 'O momento-chave: o aluno procura o encontro. Um toque num ponto de uma reta só mostra a conta que falha na outra. No (4, 6), o ponto acende e a conferência aparece embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Bia achou 7 maçãs e 3 peras: ${7 + 3 = 10}$. O par ${(7, 3)}$ resolve o problema?',
      fala: 'Bia achou sete maçãs e três peras: sete mais três é dez. O par sete, três, resolve o problema?',
      visual: SOLUCAO,
      opcoes: [
        {
          texto: 'Resolve: dá 10 frutas',
          erro: 'par-so-de-uma-equacao',
          explica: 'Dá 10 frutas, mas custa ${2 \\cdot 7 + 3 \\cdot 3 = 23}$ reais, não 26. Serve só à primeira.',
          fala: 'Dá dez frutas, mas custa dois vezes sete mais três vezes três, vinte e três reais, não vinte e seis. Serve só à primeira.',
          mostra: SETE_TRES,
        },
        {
          texto: 'Não resolve: custa R$ 23',
          certa: true,
          explica: 'Isso. Está na reta das frutas, fora da reta do preço. Confira sempre nas **duas**.',
          fala: 'Isso. Está na reta das frutas, fora da reta do preço. Confira sempre nas duas.',
          mostra: SETE_TRES,
        },
      ],
      esboco: 'O hábito da unidade: um par que serve a uma equação não basta. A conferência em rosa mostra a conta que falha.',
    },
    {
      tipo: 'anote',
      titulo: 'Sistema de equações',
      definicao: 'Um **sistema** são equações que valem **ao mesmo tempo**. A solução é o par que serve a **todas**.',
      exemplo: { tex: '\\begin{cases} x + y = 10 \\\\ 2x + 3y = 26 \\end{cases} \\quad (4, 6)', fala: 'o sistema x mais y igual a dez e dois x mais três y igual a vinte e seis tem a solução quatro, seis' },
      alerta: 'Confira o par nas **duas** equações. Servir a uma só não basta.',
      esboco: 'Na página: a chave com as duas equações, as duas retas e o cruzamento (4, 6).',
    },
    {
      tipo: 'mexa',
      texto: 'Sem frutas, o cruzamento pode cair em qualquer lugar. Ache o par de ${x + y = 1}$ e ${2x - y = 8}$.',
      fala: 'Sem frutas, o cruzamento pode cair em qualquer lugar. Ache o par de x mais y igual a um e dois x menos y igual a oito.',
      visual: plano({ ...EIXOS_NEG, retas: NEG }, 'As retas de x + y = 1 (âmbar) e 2x − y = 8 (azul), com os eixos indo abaixo do zero. Elas se cruzam abaixo do eixo x.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no ponto que serve às duas equações.',
        sucesso: { par: [3, -2] },
        mostre: 'As retas se cruzam em (3, −2), abaixo do eixo x.',
      },
      descoberta: 'O cruzamento é (3, −2): 3 + (−2) = 1 e 2 · 3 − (−2) = 8.',
      esboco: 'O mesmo gesto com um y negativo: o aluno desce abaixo do eixo x. A conferência mostra as contas com o −2 entre parênteses.',
    },
    {
      tipo: 'passo',
      problema: 'O par ${(2, 5)}$ é solução de ${x + y = 7}$ e ${3x - y = 1}$? Confira nas duas.',
      fala: 'O par dois, cinco, é solução de x mais y igual a sete e três x menos y igual a um? Confira nas duas.',
      visual: plano({ ...EIXOS_SETE, retas: SETE }, 'As retas de x + y = 7 e 3x − y = 1. Nenhum ponto marcado.'),
      passos: [
        {
          pergunta: 'Na primeira, ${x + y}$ com o par ${(2, 5)}$ dá quanto?',
          fala: 'Na primeira, x mais y com o par dois, cinco, dá quanto?',
          opcoes: [
            {
              texto: '7: serve',
              certa: true,
              explica: 'Isso. ${2 + 5 = 7}$. Serve à primeira. Falta a segunda.',
              fala: 'Isso. Dois mais cinco é sete. Serve à primeira. Falta a segunda.',
              mostra: plano({ ...EIXOS_SETE, retas: SETE, pontos: { P: [2, 5] }, nomes: false, coordenadas: true }, 'O (2, 5) aparece na reta âmbar.'),
            },
            {
              texto: '10: não serve',
              erro: 'vezes-como-mais',
              explica: 'Isso seria ${2 \\cdot 5}$. Na equação é soma: ${2 + 5 = 7}$.',
              fala: 'Isso seria dois vezes cinco. Na equação é soma: dois mais cinco, sete.',
              mostra: plano({ ...EIXOS_SETE, retas: SETE }, 'As retas sem ponto.'),
            },
          ],
          linha: { tex: '2 + 5 = 7 \\;\\checkmark', fala: 'dois mais cinco é sete, confere' },
        },
        {
          pergunta: 'Serviu à primeira. Já dá para dizer que é a solução?',
          fala: 'Serviu à primeira. Já dá para dizer que é a solução?',
          opcoes: [
            {
              texto: 'Dá: já serviu',
              erro: 'par-so-de-uma-equacao',
              explica: 'Ainda não. A solução tem de servir às duas. Confira a segunda.',
              fala: 'Ainda não. A solução tem de servir às duas. Confira a segunda.',
              mostra: plano({ ...EIXOS_SETE, retas: SETE, pontos: { P: [2, 5] }, nomes: false, coordenadas: true }, 'O (2, 5) na reta âmbar; a azul ainda sem conferir.'),
            },
            {
              texto: 'Falta conferir a segunda',
              certa: true,
              explica: 'Isso. Um par pode estar numa reta e fora da outra.',
              fala: 'Isso. Um par pode estar numa reta e fora da outra.',
              mostra: plano({ ...EIXOS_SETE, retas: SETE, pontos: { P: [2, 5] }, nomes: false, coordenadas: true }, 'O (2, 5) na reta âmbar; a azul ainda sem conferir.'),
            },
          ],
          linha: { tex: '\\text{falta a segunda}', fala: 'falta a segunda' },
        },
        {
          pergunta: 'Na segunda, ${3x - y}$ com ${(2, 5)}$ dá quanto?',
          fala: 'Na segunda, três x menos y com dois, cinco, dá quanto?',
          opcoes: [
            {
              texto: '1: é a solução',
              certa: true,
              explica: 'Isso. ${3 \\cdot 2 - 5 = 1}$. Serve às duas: ${(2, 5)}$ é a solução.',
              fala: 'Isso. Três vezes dois menos cinco é um. Serve às duas: dois, cinco, é a solução.',
              mostra: plano({ ...EIXOS_SETE, retas: SETE, cruzamento: true, conferir: true }, 'O (2, 5) no cruzamento das duas retas, com as duas contas conferidas embaixo.'),
            },
            {
              texto: '13: não é',
              erro: 'troca-x-e-y',
              explica: 'Isso é ${3 \\cdot 5 - 2}$: o x virou 5. No par, x = 2 e y = 5.',
              fala: 'Isso é três vezes cinco menos dois: o x virou cinco. No par, x é dois e y é cinco.',
              mostra: plano({ ...EIXOS_SETE, retas: SETE, pontos: { P: [5, 2] }, nomes: false, coordenadas: true }, 'O (5, 2), com x e y trocados, fora das duas retas.'),
            },
          ],
          linha: { tex: '3 \\cdot 2 - 5 = 1 \\;\\checkmark', fala: 'três vezes dois menos cinco é um, confere' },
        },
      ],
      esboco: 'Conferir sem o desenho: o par nas duas equações, uma depois da outra. O passo do meio é o hábito: servir a uma só não basta.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: teste (1, 5), (2, 4), (3, 3) e (4, 2) em ${x + y = 6}$ e ${x + 2y = 8}$. Qual serve às duas? Digite o x.',
      fala: 'No papel: teste um e cinco, dois e quatro, três e três, quatro e dois, em x mais y igual a seis e x mais dois y igual a oito. Qual serve às duas? Digite o x.',
      resposta: 4,
      resolucao: [
        { tex: '\\text{todos dão } x + y = 6', fala: 'todos dão x mais y igual a seis' },
        { tex: '1 + 10 = 11,\\; 2 + 8 = 10,\\; 3 + 6 = 9,\\; 4 + 4 = 8', fala: 'na segunda: um mais dez, onze; dois mais oito, dez; três mais seis, nove; quatro mais quatro, oito' },
        { tex: '(4, 2)', fala: 'o par é quatro, dois' },
      ],
      esboco: 'Os quatro pares servem à primeira: a segunda é que escolhe. O aluno vê por que conferir só uma não basta.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['sistemas-cruzamento-n1', 'sistemas-cruzamento-n2', 'sistemas-cruzamento-n3'],
      esboco: 'Nível 1: qual par serve às duas equações, com as duas retas no palco. Nível 2: um par conferido no sistema, que pode servir às duas, a uma só ou a nenhuma. Nível 3: um problema de carros e motos ou de frutas, resolvido testando pares.',
    },
    {
      tipo: 'fecho',
      texto: '4 maçãs e 6 peras: o único par que serve às duas. A seguir: achar o par sem desenhar, por uma conta.',
      fala: 'Quatro maçãs e seis peras: o único par que serve às duas. A seguir: achar o par sem desenhar, por uma conta.',
      visual: SOLUCAO,
      esboco: 'Responde ao gancho e aponta para a substituição: o desenho mostra, mas nem sempre o cruzamento cai num ponto da grade.',
    },
  ],
}
