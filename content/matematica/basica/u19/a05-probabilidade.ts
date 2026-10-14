import type { Aula, Visual } from '@/lib/formation/schema'

// Probabilidade. Casos favoráveis sobre casos possíveis. O jogo do dado (par:
// 3 de 6 = 1/2 = 50 %), o saco de bolas coloridas (o Mexa "favoráveis" acende
// as azuis: 3 de 8) e os dois dados na grade 6 × 6. O momento-chave é o Mexa
// na grade: a soma 7 acende 6 casas de 36, e a soma 12, uma só. As 11 somas
// não são 11 casos de mesma chance. Também: a chance vai de 0 (impossível) a
// 1 (certo). Os erros a desmontar: pôr embaixo só os casos que não servem,
// contar as somas (ou as cores) como casos iguais e achar que a chance passa
// de 1. A chance é uma fração (unidade 7) e uma porcentagem (unidade 11).

const sort = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'sorteio', estado, esboco })
const cont = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'contagem', estado, esboco })

const PAR = { casos: 'dado', favoraveis: { valores: [2, 4, 6] } }
/** O saco: 3 azuis, 4 vermelhas e 1 verde. */
const SACO = { bolas: { azul: 3, vermelha: 4, verde: 1 } }
const AZUIS = { ...SACO, favoraveis: { cor: 'azul' } }
/** O saco do passo a passo: 3 vermelhas, 5 azuis e 2 verdes. */
const SACO2 = { bolas: { vermelha: 3, azul: 5, verde: 2 } }
/** Os dois dados, com a soma em cada casa. */
const SOMAS = { grade: { linhas: 6, colunas: 6, conteudo: 'soma', nomes: ['dado amarelo', 'dado azul'] } }
const CERTO = { casos: 'dado', favoraveis: { menor: 7 }, chance: true, porcentagem: true }

export const aula: Aula = {
  id: 'B.U19.A5',
  titulo: 'Probabilidade',
  objetivo: 'Calcular a chance de um resultado como casos favoráveis sobre casos possíveis, em fração e em porcentagem, no dado, num saco de bolas e com dois dados, e saber que a chance vai de 0 (impossível) a 1 (certo).',
  modelo: 'sorteio',
  esboco: 'O palco começa no dado: o aluno acende as faces pares e vê 3 de 6 = 1/2 = 50 %. No saco, ele acende as 3 azuis e escolhe a fração (3/8, não 3/5 nem 1/3). O anote dá a definição. O dado mostra os extremos: sair 7 é 0, sair menos que 7 é 1. Depois os dois dados na grade com as somas: o aluno aposta qual soma sai mais e, no momento-chave, acende as 6 casas da soma 7. A soma 12 tem uma só: as 11 somas não têm a mesma chance. Fecha com o saco no passo a passo e as cartas no caderno.',
  vega: 'Ideia central: quando todos os casos têm a mesma chance, a chance de um resultado é o número de casos favoráveis dividido pelo número de casos possíveis. Par no dado: 3/6 = 1/2 = 50 %. No saco, cada bola é um caso: 3 azuis de 8 bolas, 3/8 = 37,5 %. Com dois dados há 36 casos; a soma 7 sai em 6 deles (1/6, cerca de 17 %), a soma 12 em 1 (1/36). A chance vai de 0 (impossível) a 1, ou 100 % (certo). Erros esperados: pôr embaixo só os casos que não servem (3/5), trocar os números de lugar (8/3), dar a mesma chance a cada cor ou a cada soma (1/3, 1/11), achar que a chance passa de 1, ler 3 bolas como 3 %. Guie com "Quantos casos há ao todo?", "Quantos servem?", "Cada soma sai do mesmo número de jeitos?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Num jogo, você ganha se o dado der um número **par**. Qual é a sua chance de ganhar?',
      visual: sort({ casos: 'dado' }, 'As seis faces do dado, em duas linhas.'),
      esboco: 'Uma pergunta que muita gente responde "metade" sem saber dizer por quê.',
    },
    {
      tipo: 'mexa',
      texto: 'Quais faces fazem você ganhar?',
      visual: sort({ ...PAR, chance: true, simplificada: true, porcentagem: true }, 'As seis faces. A cada face par tocada, ela acende em âmbar e a contagem cresce embaixo: 1 de 6, 2 de 6. Com as três, aparece 3 de 6 = 3/6 = 1/2 = 50 %.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada face par.',
        sucesso: { favoraveis: 3 },
        mostre: 'O 2, o 4 e o 6 acendem.',
      },
      descoberta: '3 faces servem, de 6: a chance é 3/6 = 1/2 = 50 %.',
      esboco: 'O aluno separa os casos que servem dos que não servem. A chance aparece sozinha embaixo.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora um saco com bolas de três cores. Você tira uma sem olhar.',
      visual: sort(AZUIS, 'Oito bolas: 3 azuis, 4 vermelhas e 1 verde. As azuis acendem a cada toque; as outras apagam no fim.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas bolas azuis.',
        sucesso: { favoraveis: 3 },
        mostre: 'As 3 azuis acendem.',
      },
      descoberta: '3 bolas servem, de 8 no saco.',
      esboco: 'Cada bola é um caso. A chance ainda não aparece: o aluno escolhe a fração no próximo cartão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual é a chance de tirar uma bola **azul**?',
      visual: sort(AZUIS, 'As 3 azuis acesas; as 5 outras apagadas.'),
      opcoes: [
        {
          texto: '$\\frac{3}{8}$', certa: true,
          explica: 'Isso. 3 bolas servem, de 8 no saco.',
          mostra: sort({ ...AZUIS, chance: true, porcentagem: true }, 'Embaixo: 3 de 8 = 3/8 = 37,5 %.'),
        },
        {
          texto: '$\\frac{3}{5}$', erro: 'pintadas-sobre-nao-pintadas',
          explica: 'Embaixo vão todas as bolas, não só as 5 que não servem: 3 de 8.',
          mostra: sort({ ...AZUIS, chance: true, porcentagem: true }, 'Embaixo: 3 de 8 = 3/8 = 37,5 %.'),
        },
        {
          texto: '$\\frac{1}{3}$', erro: 'resultados-como-casos-iguais',
          explica: 'São 3 cores, mas não com a mesma quantidade: há 4 vermelhas e 1 verde. Conte bola por bola.',
          mostra: sort({ ...AZUIS, chance: true, porcentagem: true }, 'Embaixo: 3 de 8 = 3/8 = 37,5 %.'),
        },
      ],
      esboco: 'As erradas são os dois jeitos de errar o número de baixo.',
    },
    {
      tipo: 'anote',
      titulo: 'Probabilidade',
      definicao: 'A **chance** de um resultado é o número de casos **favoráveis** dividido pelo número de casos **possíveis**, todos com a mesma chance.',
      exemplo: { tex: '\\text{par no dado: } \\frac{3}{6} = \\frac{1}{2} = 50\\%', fala: 'par no dado: três sextos, igual a um meio, igual a cinquenta por cento' },
      alerta: 'Embaixo vão todos os casos possíveis, não só os que não servem.',
      esboco: 'Na página: o dado com as faces pares acesas e a fração embaixo.',
    },
    {
      tipo: 'ideia',
      texto: 'Sair **7** num dado: 0 de 6, chance **0**. Sair menos que 7: 6 de 6, chance **1**. A chance vai de 0 a 1.',
      fala: 'Sair sete num dado: zero de seis, chance zero. Sair menos que sete: seis de seis, chance um. A chance vai de zero a um.',
      visual: sort(CERTO, 'As seis faces acesas. Embaixo: 6 de 6 = 6/6 = 100 %.'),
      esboco: 'Os dois extremos: o impossível e o certo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A chance de algum resultado pode ser **maior que 1**?',
      visual: sort(CERTO, 'As seis faces acesas, com 100 % embaixo.'),
      opcoes: [
        {
          texto: 'Não: os favoráveis nunca passam dos possíveis', certa: true,
          explica: 'Isso. No máximo, todos os casos servem: 6 de 6 = 1, ou 100 %.',
        },
        {
          texto: 'Pode, se o resultado for muito provável', erro: 'chance-maior-que-um',
          explica: 'O mais provável que existe é o certo: todos os casos servem, 6 de 6 = 1. Não há mais que isso.',
        },
      ],
      esboco: 'Fixa o limite: entre 0 e 1, ou entre 0 % e 100 %.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Dois dados, um amarelo e um azul. A soma vai de 2 a 12. Qual soma sai mais?',
      visual: cont(SOMAS, 'A grade dos dois dados, da aula anterior, agora com a soma em cada casa. Embaixo, 6 × 6 = 36.'),
      opcoes: [
        {
          texto: 'A soma 7', certa: true,
          explica: 'Isso. Na grade, há mais casas com 7 do que com qualquer outra soma.',
        },
        {
          texto: 'Tanto faz: são 11 somas', erro: 'resultados-como-casos-iguais',
          explica: 'As somas não saem do mesmo número de jeitos. O 12 só sai com 6 e 6; o 7 sai de vários jeitos.',
        },
      ],
      esboco: 'A troca de palco: do sorteio para a grade de pares. As somas estão escritas; o aluno pode olhar.',
    },
    {
      tipo: 'mexa',
      texto: 'Em quantas casas a soma dá 7?',
      visual: cont({ ...SOMAS, favoraveis: { soma: 7 }, chance: true, simplificada: true, porcentagem: true }, 'A grade com as somas. Cada casa com 7 acende ao toque; a contagem cresce embaixo. Com as 6, aparece 6 de 36 = 6/36 = 1/6 ≈ 16,7 %.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada casa com soma 7.',
        sucesso: { favoraveis: 6 },
        mostre: 'As 6 casas da diagonal acendem.',
      },
      descoberta: '6 de 36: a chance da soma 7 é 1/6, cerca de 17 %.',
      esboco: 'O momento-chave: a diagonal inteira acende. Amarelo 1 com azul 6 e amarelo 6 com azul 1 são duas casas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E a soma **12**? Qual é a chance?',
      visual: cont(SOMAS, 'A grade com as somas, sem nada aceso.'),
      opcoes: [
        {
          texto: '$\\frac{1}{36}$', certa: true,
          explica: 'Isso. Só uma casa dá 12: o 6 com o 6.',
          mostra: cont({ ...SOMAS, favoraveis: { soma: 12 }, chance: true, porcentagem: true }, 'Só a casa do canto acende. Embaixo: 1 de 36 = 1/36 ≈ 2,8 %.'),
        },
        {
          texto: '$\\frac{1}{11}$', erro: 'resultados-como-casos-iguais',
          explica: 'As 11 somas não são casos de mesma chance. Os casos são as 36 casas, e só uma dá 12.',
          mostra: cont({ ...SOMAS, favoraveis: { soma: 12 }, chance: true, porcentagem: true }, 'Só a casa do canto acende: 1 de 36.'),
        },
      ],
      esboco: 'O contraste com a soma 7: seis vezes menos provável.',
    },
    {
      tipo: 'passo',
      problema: 'Um saco tem **3** bolas vermelhas, **5** azuis e **2** verdes. Qual é a chance de tirar uma vermelha?',
      fala: 'Um saco tem três bolas vermelhas, cinco azuis e duas verdes. Qual é a chance de tirar uma vermelha?',
      visual: sort(SACO2, 'Dez bolas no saco: 3 vermelhas, 5 azuis e 2 verdes.'),
      passos: [
        {
          pergunta: 'Quantos casos possíveis?',
          opcoes: [
            {
              texto: '10 bolas', certa: true,
              explica: 'Isso. Cada bola é um caso.',
              mostra: sort({ ...SACO2, favoraveis: { cor: 'vermelha' } }, 'As 3 vermelhas acendem; as outras 7 apagam.'),
            },
            {
              texto: '3 cores', erro: 'resultados-como-casos-iguais',
              explica: 'As cores têm quantidades diferentes: há 5 azuis e 2 verdes. Cada bola é um caso.',
            },
          ],
          linha: { tex: '3 + 5 + 2 = 10 \\text{ casos}', fala: 'três mais cinco mais dois, dez casos' },
        },
        {
          pergunta: 'Qual é a chance de vermelha?',
          opcoes: [
            {
              texto: '$\\frac{3}{10} = 30\\%$', certa: true,
              explica: 'Isso. 3 vermelhas de 10 bolas.',
              mostra: sort({ ...SACO2, favoraveis: { cor: 'vermelha' }, chance: true, porcentagem: true }, 'Embaixo: 3 de 10 = 3/10 = 30 %.'),
            },
            {
              texto: '$\\frac{3}{7}$', erro: 'pintadas-sobre-nao-pintadas',
              explica: '7 são as bolas que não servem. Embaixo vão todas as 10.',
            },
            {
              texto: '$3\\%$', erro: 'parte-como-porcentagem',
              explica: '3 são as bolas, não a porcentagem. 3 de 10 são 30 de 100: 30 %.',
            },
          ],
          linha: { tex: '\\frac{3}{10} = 30\\%', fala: 'três décimos, trinta por cento' },
        },
      ],
      esboco: 'Primeiro os possíveis, depois os favoráveis. O saco acende com o passo certo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: 20 cartas, numeradas de 1 a 20. Você tira uma. Qual é a chance de sair um múltiplo de 5, em %?',
      fala: 'No papel: vinte cartas, numeradas de um a vinte. Você tira uma. Qual é a chance de sair um múltiplo de cinco, em porcentagem?',
      resposta: 20,
      resolucao: [
        { tex: '\\text{múltiplos de 5: } 5,\\ 10,\\ 15,\\ 20', fala: 'os múltiplos de cinco: cinco, dez, quinze e vinte' },
        { tex: '\\frac{4}{20} = \\frac{1}{5} = 20\\%', fala: 'quatro vinte avos, igual a um quinto, igual a vinte por cento' },
      ],
      esboco: 'Os múltiplos da unidade 6 entram como casos favoráveis.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['probabilidade-n1', 'probabilidade-n2', 'probabilidade-n3'],
      esboco: 'Nível 1: a fração no dado ou no saco, com os casos acesos na tela. Nível 2: a chance em porcentagem, no saco ou nas cartas. Nível 3: dois dados, sem a grade.',
    },
    {
      tipo: 'fecho',
      texto: 'Par no dado: **1/2**. Soma 7 com dois dados: **1/6**, a mais provável. Na próxima aula: jogar mil vezes e ver a chance aparecer.',
      fala: 'Par no dado: um meio. Soma sete com dois dados: um sexto, a mais provável. Na próxima aula: jogar mil vezes e ver a chance aparecer.',
      visual: cont({ ...SOMAS, favoraveis: { soma: 7 }, chance: true, simplificada: true, porcentagem: true }, 'A grade com a diagonal da soma 7 acesa e a chance inteira embaixo.'),
      esboco: 'Responde ao gancho e prepara a simulação.',
    },
  ],
}
