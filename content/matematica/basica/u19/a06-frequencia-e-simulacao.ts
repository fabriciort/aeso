import type { Aula, Visual } from '@/lib/formation/schema'

// Frequência e simulação. Jogar a moeda e o dado muitas vezes e ver a chance
// aparecer. Com 10 jogadas, a moeda deu 7 caras e 3 coroas (70 %); o
// momento-chave é o Mexa "jogar": o aluno joga até 1.000 e vê a curva da
// porcentagem de caras assentar perto de 50 % (494 caras, 49,4 %). Depois a
// falácia do jogador: 5 caras seguidas e a próxima ainda tem chance 1/2; em
// 1.000 jogadas, as 5 primeiras quase não pesam. Fecha com o dado: 600
// jogadas, cada face perto de 100 vezes, e 95 não é sinal de dado viciado.
// As sementes foram escolhidas e conferidas na tela (sorteio-geo.ts):
// moeda, semente 3: 7 e 3 (10), 494 e 506 (1.000), 4.992 e 5.008 (10.000);
// 5 caras e depois a semente 2: 490 e 510 (1.000); dado, semente 31, 600
// jogadas: 97, 107, 105, 96, 100, 95 (com 60, o 5 sai 16 vezes).

const sort = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'sorteio', estado, esboco })

const DEZ = { casos: 'moeda', jogadas: 10, semente: 3 }
const CINCO_CARAS = ['cara', 'cara', 'cara', 'cara', 'cara']
const SEQUENCIA = { casos: 'moeda', jogadas: 5, sequencia: CINCO_CARAS, semente: 2 }
const DADO = { casos: 'dado', jogadas: 600, semente: 31 }

export const aula: Aula = {
  id: 'B.U19.A6',
  titulo: 'Frequência e simulação',
  objetivo: 'Calcular a frequência de um resultado (quantas vezes saiu ÷ quantas jogadas), ver que ela chega perto da chance com muitas jogadas e não com poucas, estimar quantas vezes um resultado deve sair, e reconhecer que os resultados anteriores não mudam a chance da próxima jogada.',
  modelo: 'sorteio',
  esboco: 'O palco é o sorteio. A chance de cara é 1/2, mas em 10 jogadas saíram 7 caras. No momento-chave, o aluno joga a moeda até 1.000 e vê a curva da porcentagem de caras sair de 70 % e assentar perto de 50 %. O anote dá a frequência. Depois a falácia do jogador: 5 caras seguidas, e a próxima ainda tem chance 1/2; com 1.000 jogadas, a curva desce de 100 % para perto de 50 % sem compensação nenhuma. Por fim o dado: o aluno joga 600 vezes, calcula que se espera cerca de 100 de cada face e vê que 95 está perto. Fecha com 10.000 jogadas da moeda.',
  vega: 'Ideia central: a frequência de um resultado é quantas vezes ele saiu dividido pelo número de jogadas (7 caras em 10 são 70 %). Com poucas jogadas, ela pode ficar longe da chance; com muitas, fica perto (494 em 1.000, 49,4 %), mas quase nunca igual. Em 600 jogadas de um dado, espera-se cerca de 600 ÷ 6 = 100 de cada face. A moeda e o dado não têm memória: depois de 5 caras, a chance de cara na próxima continua 1/2 (a falácia do jogador é achar que a coroa está atrasada). As jogadas da tela são uma simulação com sorteio fixo. Erros esperados: esperar exatamente 5 caras em 10 jogadas, achar que um dado com 95 seis em 600 está viciado, achar que a coroa está atrasada, multiplicar 600 por 6, ler 92 caras como 92 %. Guie com "Quantas jogadas foram?", "E com mil jogadas?", "A moeda sabe o que saiu antes?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na moeda, a chance de cara é **1/2**. Se você jogar a moeda 10 vezes, saem 5 caras?',
      fala: 'Na moeda, a chance de cara é um meio. Se você jogar a moeda dez vezes, saem cinco caras?',
      visual: sort({ casos: 'moeda' }, 'A moeda, com as duas faces: cara e coroa.'),
      esboco: 'A chance da aula anterior vira uma previsão que dá para testar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Aposte: jogando a moeda 10 vezes, quantas caras saem?',
      visual: sort({ casos: 'moeda' }, 'A moeda, parada.'),
      opcoes: [
        {
          texto: 'Perto de 5, mas pode dar outro número', certa: true,
          explica: 'Isso. A chance não garante a conta exata. Aqui saíram 7 caras.',
          mostra: sort(DEZ, 'A simulação: 10 jogadas. A barra da cara sobe até 7 (70 %), a da coroa até 3 (30 %). A linha tracejada da chance fica em 50 %.'),
        },
        {
          texto: 'Exatamente 5', erro: 'frequencia-igual-a-chance',
          explica: 'Em 10 jogadas pode dar 7 a 3, como aqui. A chance fala do que acontece em muitas jogadas.',
          mostra: sort(DEZ, 'As 10 jogadas: 7 caras e 3 coroas.'),
        },
      ],
      esboco: 'O resultado de 10 jogadas surpreende: 7 a 3.',
    },
    {
      tipo: 'mexa',
      texto: '7 caras em 10 são 70 %. Jogue mais: a porcentagem de caras chega perto de 50 %?',
      fala: 'Sete caras em dez são setenta por cento. Jogue mais: a porcentagem de caras chega perto de cinquenta por cento?',
      visual: sort({ ...DEZ, curva: true, botoes: [10, 100, 1000] }, 'As barras das 10 jogadas e, embaixo, a curva da porcentagem de caras, começando em 70 %. Os botões + 10, + 100 e + 1.000 jogam mais; as barras crescem e a curva se aproxima da linha de 50 %.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Jogue a moeda até passar de 1.000 jogadas.',
        sucesso: { jogadas: 1000 },
        mostre: 'A moeda chega a 1.000 jogadas: 494 caras, 49,4 %.',
      },
      descoberta: 'Com muitas jogadas, a porcentagem de caras fica perto de 50 %.',
      esboco: 'O momento-chave: a curva balança muito no começo e assenta perto da linha tracejada.',
    },
    {
      tipo: 'anote',
      titulo: 'Frequência',
      definicao: 'A **frequência** de um resultado é quantas vezes ele saiu dividido pelo número de jogadas. Com muitas jogadas, ela chega perto da chance.',
      exemplo: { tex: '\\frac{494}{1{.}000} = 49{,}4\\%', fala: 'quatrocentos e noventa e quatro em mil, quarenta e nove vírgula quatro por cento' },
      alerta: 'Com poucas jogadas, a frequência pode ficar bem longe da chance.',
      esboco: 'Na página: as barras de 10 e de 1.000 jogadas, lado a lado.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Saíram **5 caras** seguidas. Na próxima jogada, qual é a chance de cara?',
      visual: sort(SEQUENCIA, 'A simulação com 5 jogadas, todas cara: a barra da cara em 5 (100 %), a da coroa vazia. Em cima, as 5 caras em fila.'),
      opcoes: [
        {
          texto: '$\\frac{1}{2}$, como sempre', certa: true,
          explica: 'Isso. A moeda não lembra o que saiu. A próxima jogada é nova.',
          mostra: sort({ ...SEQUENCIA, rotulo: 'A próxima: ainda 1/2' }, 'As 5 caras e, embaixo, "A próxima: ainda 1/2".'),
        },
        {
          texto: 'Menos de $\\frac{1}{2}$: agora é a vez da coroa', erro: 'falacia-do-jogador',
          explica: 'A moeda não tem memória. Nada empurra a coroa: a chance continua 1/2.',
          mostra: sort({ ...SEQUENCIA, rotulo: 'A próxima: ainda 1/2' }, 'As 5 caras e "A próxima: ainda 1/2".'),
        },
        {
          texto: 'Mais de $\\frac{1}{2}$: a cara está em alta', erro: 'falacia-do-jogador',
          explica: 'As 5 caras já passaram. Elas não mudam a moeda: a chance continua 1/2.',
          mostra: sort({ ...SEQUENCIA, rotulo: 'A próxima: ainda 1/2' }, 'As 5 caras e "A próxima: ainda 1/2".'),
        },
      ],
      esboco: 'A falácia do jogador, nos dois sentidos: "a coroa está atrasada" e "a cara está em alta".',
    },
    {
      tipo: 'ideia',
      texto: 'Depois das 5 caras, a moeda segue metade a metade. Em 1.000 jogadas, as 5 primeiras quase não pesam.',
      fala: 'Depois das cinco caras, a moeda segue metade a metade. Em mil jogadas, as cinco primeiras quase não pesam.',
      visual: sort({ ...SEQUENCIA, jogadas: 1000, curva: true }, 'As barras crescem até 1.000 jogadas: 490 caras e 510 coroas. A curva começa em 100 % e desce até perto de 50 %, sem a coroa precisar compensar.'),
      esboco: 'A curva volta para perto de 50 % porque as jogadas novas pesam mais, não porque a coroa compensa.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora o dado. Cada face tem chance **1/6**, cerca de 17 %. Jogue e veja as barras.',
      fala: 'Agora o dado. Cada face tem chance um sexto, cerca de dezessete por cento. Jogue e veja as barras.',
      visual: sort({ casos: 'dado', jogadas: 0, semente: 31, botoes: [10, 100] }, 'Seis barras vazias, uma por face, e a linha tracejada da chance em 16,7 %. Com 60 jogadas, o 5 dispara (16 vezes); com 600, as barras ficam quase iguais.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Jogue o dado até 600 vezes.',
        sucesso: { jogadas: 600 },
        mostre: 'O dado é jogado 600 vezes: cada face sai perto de 100 vezes.',
      },
      descoberta: 'Com poucas jogadas, uma face pode disparar; com 600, todas ficam perto de 100.',
      esboco: 'O mesmo fenômeno da moeda, com seis resultados.',
    },
    {
      tipo: 'passo',
      problema: 'Em **600** jogadas de um dado, quantas vezes você espera que saia o **6**?',
      fala: 'Em seiscentas jogadas de um dado, quantas vezes você espera que saia o seis?',
      visual: sort(DADO, 'As 600 jogadas: 97, 107, 105, 96, 100 e 95.'),
      passos: [
        {
          pergunta: 'Qual é a chance do 6?',
          opcoes: [
            {
              texto: '$\\frac{1}{6}$', certa: true,
              explica: 'Isso. 1 face de 6.',
              mostra: sort({ ...DADO, rotulo: 'chance do 6: 1/6' }, 'As barras, com "chance do 6: 1/6" embaixo.'),
            },
            {
              texto: '$\\frac{1}{5}$', erro: 'pintadas-sobre-nao-pintadas',
              explica: '5 são as faces que não servem. Embaixo vão as 6 faces: 1/6.',
            },
          ],
          linha: { tex: '\\text{chance do 6: } \\frac{1}{6}', fala: 'a chance do seis é um sexto' },
        },
        {
          pergunta: 'Quanto é $\\frac{1}{6}$ de 600?',
          fala: 'Quanto é um sexto de seiscentos?',
          opcoes: [
            {
              texto: '$600 \\div 6 = 100$', certa: true,
              explica: 'Isso. Um sexto é uma das 6 partes iguais: cerca de 100 vezes.',
              mostra: sort({ ...DADO, rotulo: 'esperado: cerca de 100' }, 'As barras, com "esperado: cerca de 100" embaixo.'),
            },
            {
              texto: '$600 \\times 6 = 3{.}600$', erro: 'operacao-trocada',
              explica: '3.600 é mais que as 600 jogadas. Um sexto é dividir em 6 partes iguais.',
            },
          ],
          linha: { tex: '\\frac{1}{6} \\text{ de } 600 = 600 \\div 6 = 100', fala: 'um sexto de seiscentos, seiscentos dividido por seis, cem' },
        },
      ],
      esboco: 'A chance vira uma previsão: chance vezes jogadas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O 6 saiu **95** vezes, e não 100. O dado está viciado?',
      visual: sort(DADO, 'As 600 jogadas, com a barra do 6 em 95.'),
      opcoes: [
        {
          texto: 'Não: 95 está perto de 100', certa: true,
          explica: 'Isso. A frequência varia um pouco. Aqui, todas as faces ficaram entre 95 e 107.',
        },
        {
          texto: 'Sim: um dado honesto daria 100 exatos', erro: 'frequencia-igual-a-chance',
          explica: 'Nem a moeda deu 500 em 1.000. A frequência fica perto da chance, não igual a ela.',
        },
      ],
      esboco: 'Perto não é igual. É o que se espera de um dado honesto.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: uma moeda foi jogada **200** vezes e deu **92** caras. Qual foi a frequência de caras, em %?',
      fala: 'No papel: uma moeda foi jogada duzentas vezes e deu noventa e duas caras. Qual foi a frequência de caras, em porcentagem?',
      resposta: 46,
      resolucao: [
        { tex: '\\frac{92}{200} = \\frac{46}{100}', fala: 'noventa e dois em duzentos é igual a quarenta e seis em cem' },
        { tex: '\\frac{46}{100} = 46\\%', fala: 'quarenta e seis por cento' },
      ],
      esboco: 'A frequência em porcentagem, como na unidade 11. 46 % está perto de 50 %.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['frequencia-n1', 'frequencia-n2', 'frequencia-n3'],
      esboco: 'Nível 1: a frequência em porcentagem, lida num gráfico de barras. Nível 2: quantas vezes se espera um resultado. Nível 3: a falácia do jogador e qual resultado merece mais confiança.',
    },
    {
      tipo: 'fecho',
      texto: 'Poucas jogadas enganam; muitas mostram a chance. E a moeda não tem memória. Na próxima unidade: o projeto final.',
      visual: sort({ casos: 'moeda', jogadas: 10000, semente: 3, curva: true }, '10.000 jogadas: 4.992 caras e 5.008 coroas. A curva colada na linha de 50 %.'),
      esboco: 'Responde ao gancho: 5 caras em 10 não é garantido; em 10.000, fica quase metade.',
    },
  ],
}
