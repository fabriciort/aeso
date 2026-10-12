import type { Aula, Visual } from '@/lib/formation/schema'

// Somar e subtrair decimais é a conta armada da unidade 2, com uma regra
// só: vírgula embaixo de vírgula, para cada casa ficar embaixo da mesma
// casa. 3,5 tem 5 décimos, não 5 centésimos: por isso vira 3,50, e o zero
// só mostra a casa vazia. Na subtração, o 10 vira 10,00 e o empresta
// atravessa a vírgula, como em 304 − 128.

type Conta = { parcelas: (string | number)[]; sinal: '+' | '−'; zeros?: boolean; resultado?: string; reservas?: Record<string, string>; trocas?: Record<string, string>; destaque?: string; alinhar?: 'direita' }
const conta = (c: Conta, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { conta: c }, esboco })
const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const SACOLA = { parcelas: ['3,5', '1,25'], sinal: '+' as const }
const TROCO = { parcelas: ['10', '3,75'], sinal: '−' as const, zeros: true }
const TROCAS = { D: '0', U: '9', d: '9', c: '10' }

export const aula: Aula = {
  id: 'B.U8.A4',
  titulo: 'Somar e subtrair',
  objetivo: 'Somar e subtrair decimais armando a conta com vírgula embaixo de vírgula, completando com zeros as casas vazias e fazendo o vai um e o empresta através da vírgula, inclusive no troco de uma nota inteira.',
  modelo: 'quadro-posicional',
  esboco: 'Uma sacola com 3,5 kg de batata e 1,25 kg de cebola. O aluno aposta no total e muita gente diz 1,60 ou 4,30. A grade desmonta: 0,5 são 5 colunas, 50 quadradinhos; somando 0,25, o aluno pinta 75. Daí a conta armada: vírgula embaixo de vírgula, 3,5 vira 3,50, casa com casa. Depois o troco de R$ 10 para R$ 3,75: o 10 vira 10,00 e o empresta desce em cascata, como no 304 − 128. Momento-chave: pintar 0,5 + 0,25 na grade e ver 75 quadradinhos, não 30.',
  vega: 'Ideia central: casa com casa. Na conta armada, a vírgula fica embaixo da vírgula, e assim décimos ficam embaixo de décimos e centésimos embaixo de centésimos. As casas vazias se completam com zeros (3,5 = 3,50; 10 = 10,00), que não mudam o número. Depois, é a conta da unidade 2, com vai um e empresta. A vírgula do resultado desce no mesmo lugar. Erros esperados: alinhar pela direita, como nos inteiros (3,5 + 1,25 = 1,60); somar o que vem depois da vírgula como um número inteiro (5 + 25 = 30, então 4,30); no troco, copiar as casas que só existem embaixo (10 − 3,75 = 7,75); e abrir a casa de cima sem diminuí-la (7,25). Guie com "O 5 de 3,5 é décimo ou centésimo?", "Onde fica a casa dos décimos de cada número?", "Quanto é 10 com duas casas depois da vírgula?". Confira estimando: 3,5 + 1,25 é um pouco menos que 5.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na sacola: **3,5 kg** de batata e **1,25 kg** de cebola. Quanto pesa tudo?',
      fala: 'Na sacola: três vírgula cinco quilos de batata e um vírgula vinte e cinco quilo de cebola. Quanto pesa tudo?',
      visual: conta(SACOLA, 'A conta armada no caderno quadriculado, com as vírgulas uma embaixo da outra e a linha do resultado vazia. Por enquanto só os números, sem zeros.'),
      esboco: 'Dois números com casas diferentes depois da vírgula: o caso que faz errar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'De cabeça: quanto é 3,5 + 1,25?',
      fala: 'De cabeça: quanto é três vírgula cinco mais um vírgula vinte e cinco?',
      visual: conta(SACOLA, 'A conta armada, sem resultado.'),
      opcoes: [
        {
          texto: '4,75 kg', certa: true,
          explica: 'Isso. 3 kg e meio, mais 1 kg e um quarto: quase 5 kg.',
        },
        {
          texto: '4,30 kg', erro: 'parte-decimal-como-inteiro',
          explica: 'Isso é 5 + 25 depois da vírgula. Mas o 5 de 3,5 é meio quilo, e meio mais um quarto passa de 0,30.',
          mostra: grade({ grades: [{ pintadas: 50 }, { pintadas: 25 }, { pintadas: 30 }], destaque: 2 }, 'Três grades: 0,5, 0,25 e 0,30. A terceira é menor que a primeira sozinha.'),
        },
        {
          texto: '1,60 kg', erro: 'alinha-decimais-pela-direita',
          explica: 'Isso é 35 + 125, com a vírgula no fim. Só a batata já pesa mais que 1,60 kg.',
          mostra: conta({ parcelas: ['3,5', '1,25'], sinal: '+', resultado: '1,60', alinhar: 'direita' }, 'A conta alinhada pela direita, como nos inteiros: as vírgulas ficam tortas e o 5 dos décimos cai embaixo do 5 dos centésimos.'),
        },
      ],
      esboco: 'Os dois erros mais comuns aparecem antes de qualquer regra. A estimativa (quase 5 kg) já desmonta os dois.',
    },
    {
      tipo: 'mexa',
      texto: 'Só o que vem depois da vírgula: **0,5 + 0,25**. Pinte a soma na terceira grade.',
      fala: 'Só o que vem depois da vírgula: zero vírgula cinco mais zero vírgula vinte e cinco. Pinte a soma na terceira grade.',
      visual: grade(
        { grades: [{ pintadas: 50 }, { pintadas: 25 }, { pintadas: 0 }], separar: true, pintar: true, ativa: 2 },
        'Três grades lado a lado. A primeira tem 5 colunas cheias (0,5); a segunda, 2 colunas e 5 quadradinhos (0,25); a terceira, vazia, recebe os toques.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte 0,5 + 0,25 na grade vazia.',
        sucesso: { pintadas: 75 },
        mostre: 'As 5 colunas da primeira grade deslizam para a terceira, e depois as 2 colunas e os 5 quadradinhos da segunda: 75 quadradinhos.',
      },
      descoberta: '0,5 são 50 centésimos, não 5. Colunas com colunas (5 + 2 = 7 décimos) e quadradinhos com quadradinhos (0 + 5): 0,75.',
      esboco: 'O momento-chave. Proposta: ao terminar, as colunas cheias da terceira grade ficam em âmbar e os 5 quadradinhos soltos em verde, com 7 décimos e 5 centésimos escritos embaixo.',
    },
    {
      tipo: 'ideia',
      texto: '0,5 são **50** centésimos. Por isso 3,5 vira **3,50**: o zero só mostra a casa vazia. Vírgula embaixo de vírgula.',
      fala: 'Zero vírgula cinco são cinquenta centésimos. Por isso três vírgula cinco vira três vírgula cinquenta: o zero só mostra a casa vazia. Vírgula embaixo de vírgula.',
      visual: conta({ ...SACOLA, zeros: true, destaque: 'c' }, 'A conta armada; um 0 apagado aparece depois do 3,5, na casa dos centésimos, que acende.'),
      esboco: 'Liga a grade à conta: cada casa embaixo da sua. Movimento: o 0 surge apagado na casa c do 3,5; os rótulos U, d, c acendem em cima das colunas.',
    },
    {
      tipo: 'passo',
      problema: 'Termine **3,50 + 1,25**, casa com casa.',
      fala: 'Termine três vírgula cinquenta mais um vírgula vinte e cinco, casa com casa.',
      visual: conta({ ...SACOLA, zeros: true, destaque: 'c' }, 'A conta com o zero apagado; a coluna dos centésimos acesa.'),
      passos: [
        {
          pergunta: 'Centésimos: 0 + 5.',
          fala: 'Centésimos: zero mais cinco.',
          opcoes: [
            { texto: '5', certa: true, explica: 'Isso. O zero não muda nada: 5 centésimos.', mostra: conta({ ...SACOLA, zeros: true, resultado: '5', destaque: 'd' }, 'O 5 se escreve embaixo dos centésimos; a luz passa para os décimos.') },
            { texto: '0', explica: 'Zero mais 5 é 5. O zero só guarda o lugar.' },
          ],
          linha: { tex: '0 + 5 = 5', fala: 'zero mais cinco é cinco' },
        },
        {
          pergunta: 'Décimos: 5 + 2.',
          fala: 'Décimos: cinco mais dois.',
          opcoes: [
            { texto: '7', certa: true, explica: 'Isso. 7 décimos: as 7 colunas da grade.', mostra: conta({ ...SACOLA, zeros: true, resultado: '75', destaque: 'U' }, 'O 7 entra embaixo dos décimos; a luz passa para as unidades.') },
            { texto: '30', erro: 'parte-decimal-como-inteiro', explica: 'Assim você somou 5 + 25. Casa com casa: décimos com décimos, 5 + 2.' },
          ],
          linha: { tex: '5 + 2 = 7', fala: 'cinco mais dois é sete' },
        },
        {
          pergunta: 'Unidades: 3 + 1. A vírgula desce no mesmo lugar. Quanto pesa a sacola?',
          fala: 'Unidades: três mais um. A vírgula desce no mesmo lugar. Quanto pesa a sacola?',
          opcoes: [
            { texto: '4,75 kg', certa: true, explica: 'Isso. Quase 5 kg, como a estimativa dizia.', mostra: conta({ ...SACOLA, zeros: true, resultado: '4,75' }, 'O 4 e a vírgula descem: 4,75.') },
            { texto: '47,5 kg', explica: 'A vírgula desce embaixo das outras vírgulas: 4 unidades, 7 décimos, 5 centésimos.' },
          ],
          linha: { tex: '3{,}50 + 1{,}25 = 4{,}75', fala: 'três vírgula cinquenta mais um vírgula vinte e cinco é quatro vírgula setenta e cinco' },
        },
      ],
      esboco: 'A conta da unidade 2, da direita para a esquerda, com a vírgula descendo no fim.',
    },
    {
      tipo: 'anote',
      titulo: 'Somar e subtrair decimais',
      definicao: 'Arme com vírgula embaixo de vírgula: cada casa embaixo da mesma casa. Complete com zeros e faça a conta como nos inteiros.',
      exemplo: { tex: '3{,}50 + 1{,}25 = 4{,}75', fala: 'três vírgula cinquenta mais um vírgula vinte e cinco é quatro vírgula setenta e cinco' },
      alerta: 'Não alinhe pela direita: 3,5 + 1,25 não é 1,60. O zero no fim não muda o número: 3,5 = 3,50.',
      esboco: 'A página do caderno com a conta armada, o zero apagado e as vírgulas numa coluna só, ligadas por um traço vertical.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você paga uma conta de **R$ 3,75** com uma nota de **R$ 10**. Qual é o troco?',
      fala: 'Você paga uma conta de três reais e setenta e cinco com uma nota de dez reais. Qual é o troco?',
      visual: conta(TROCO, 'A subtração armada: 10 em cima, com ,00 apagados que aparecem sozinhos; 3,75 embaixo.'),
      opcoes: [
        {
          texto: 'R$ 6,25', certa: true,
          explica: 'Isso. R$ 3,75 mais R$ 6,25 dão R$ 10 certinho.',
          mostra: conta({ ...TROCO, trocas: TROCAS, resultado: '6,25' }, 'As trocas em cascata, da dezena até os centésimos, e o 6,25 embaixo.'),
        },
        {
          texto: 'R$ 7,75', erro: 'copia-casas-que-faltam',
          explica: 'Os 75 centavos não podem descer: em cima há 0 centavos, que é 10,00. É preciso abrir 1 real.',
          mostra: conta({ ...TROCO, destaque: 'c' }, 'Os dois zeros apagados do 10,00 acendem: em cima há 0 centésimos, não um vazio.'),
        },
        {
          texto: 'R$ 7,25', erro: 'esquece-que-desagrupou',
          explica: 'Os centavos vieram de 1 real aberto. Das 10 unidades sobram 9: 9 − 3 = 6. O troco é R$ 6,25.',
          mostra: conta({ ...TROCO, trocas: TROCAS, resultado: '6,25', destaque: 'U' }, 'O 0 das unidades, riscado, vira 10 e depois 9; a coluna U acende.'),
        },
      ],
      esboco: 'O troco é a subtração de decimais que todo adulto faz. As duas erradas são os erros reais de quem confere troco no papel.',
    },
    {
      tipo: 'passo',
      problema: 'Faça **10,00 − 3,75**, casa com casa.',
      fala: 'Faça dez vírgula zero zero menos três vírgula setenta e cinco, casa com casa.',
      visual: conta({ ...TROCO, destaque: 'c' }, 'A conta com os zeros apagados; a coluna dos centésimos acesa.'),
      passos: [
        {
          pergunta: 'Centésimos: 0 − 5. Em cima falta. De onde vem?',
          fala: 'Centésimos: zero menos cinco. Em cima falta. De onde vem?',
          opcoes: [
            {
              texto: 'Abro 1 real, depois 1 décimo', certa: true,
              explica: 'Isso. 1 dezena vira 10 unidades; 1 unidade, 10 décimos; 1 décimo, 10 centésimos.',
              mostra: conta({ ...TROCO, trocas: TROCAS, destaque: 'c' }, 'As trocas aparecem uma a uma, da esquerda para a direita: o 1 vira 0, o 0 das unidades vira 9, o dos décimos vira 9, o dos centésimos vira 10.'),
            },
            {
              texto: 'Desço o 5', erro: 'copia-casas-que-faltam',
              explica: 'Em cima há 0 centésimos, não um vazio. Tirar 5 de 0 pede o empresta.',
            },
          ],
          linha: { tex: '10{,}00 = 9 \\text{ unidades}, 9 \\text{ décimos}, 10 \\text{ centésimos}', fala: 'dez vírgula zero zero é nove unidades, nove décimos e dez centésimos' },
        },
        {
          pergunta: 'Agora casa a casa: 10 − 5, 9 − 7, 9 − 3.',
          fala: 'Agora casa a casa: dez menos cinco, nove menos sete, nove menos três.',
          opcoes: [
            { texto: '5, 2 e 6', certa: true, explica: 'Isso. A vírgula desce: **6,25**.', mostra: conta({ ...TROCO, trocas: TROCAS, resultado: '6,25' }, 'O resultado se escreve da direita para a esquerda: 5, 2, a vírgula, 6.') },
            { texto: '5, 2 e 7', erro: 'esquece-que-desagrupou', explica: 'Das unidades, 1 foi aberta. Ficaram 9: 9 − 3 = 6.' },
          ],
          linha: { tex: '10{,}00 - 3{,}75 = 6{,}25', fala: 'dez menos três vírgula setenta e cinco é seis vírgula vinte e cinco' },
        },
      ],
      esboco: 'É o 304 − 128 da unidade 2, com a vírgula no meio: abrir em cascata.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: você tinha 7,2 m de fio e usou 2,85 m. Quanto sobrou?',
      fala: 'No papel: você tinha sete vírgula dois metros de fio e usou dois vírgula oitenta e cinco. Quanto sobrou?',
      resposta: '4,35',
      resolucao: [
        { tex: '7{,}20 - 2{,}85', fala: 'sete vírgula vinte menos dois vírgula oitenta e cinco' },
        { tex: '7{,}20 = 6 \\text{ unidades}, 11 \\text{ décimos}, 10 \\text{ centésimos}', fala: 'sete vírgula vinte é seis unidades, onze décimos e dez centésimos' },
        { tex: '10 - 5 = 5,\\; 11 - 8 = 3,\\; 6 - 2 = 4', fala: 'dez menos cinco é cinco, onze menos oito é três, seis menos dois é quatro' },
        { tex: '7{,}2 - 2{,}85 = 4{,}35', fala: 'sete vírgula dois menos dois vírgula oitenta e cinco é quatro vírgula trinta e cinco' },
      ],
      esboco: 'Sem a conta na tela: o aluno completa o zero e faz dois empresta sozinho.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['somar-decimais-n1', 'somar-decimais-n2', 'somar-decimais-n3'],
      esboco: 'Nível 1: somas com casas diferentes, sem vai um, com a conta armada. Nível 2: vai um que atravessa a vírgula, ou subtração com empresta. Nível 3: troco e compras, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A sacola pesa **4,75 kg**. Vírgula embaixo de vírgula, e é a conta de sempre. Na próxima aula: multiplicar decimais.',
      fala: 'A sacola pesa quatro vírgula setenta e cinco quilos. Vírgula embaixo de vírgula, e é a conta de sempre. Na próxima aula: multiplicar decimais.',
      visual: conta({ ...SACOLA, zeros: true, resultado: '4,75' }, 'A conta do gancho, completa, com o zero apagado e as vírgulas em coluna.'),
      esboco: 'Responde ao gancho e abre a multiplicação, onde a vírgula não se alinha.',
    },
  ],
}

