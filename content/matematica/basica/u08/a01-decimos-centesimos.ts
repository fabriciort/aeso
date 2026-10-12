import type { Aula, Visual } from '@/lib/formation/schema'

// Décimos e centésimos: a grade 10 × 10 é 1 inteiro (R$ 1,00). Uma coluna é
// um décimo (10 centavos); um quadradinho, um centésimo (1 centavo). A
// primeira casa depois da vírgula conta colunas; a segunda, quadradinhos.
// Os erros a desmontar: trocar décimos e centésimos, esquecer o zero dos
// décimos (5 centavos não é 0,5) e ler o ponto da calculadora como milhar.

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const REAL = { pintadas: 0, rotulo: 'R$ 1,00' }

export const aula: Aula = {
  id: 'B.U8.A1',
  titulo: 'Décimos e centésimos',
  objetivo: 'Ler e escrever números com décimos e centésimos, ligando cada casa depois da vírgula à grade 10 × 10 e aos centavos do real.',
  modelo: 'grade',
  esboco: 'A grade 10 × 10 é R$ 1,00. O aluno pinta 3 colunas e vê o rótulo andar 0,1, 0,2, 0,3; depois pinta 25 quadradinhos e vê 0,25, ou 25 centavos. Momento-chave: as 2 colunas cheias e os 5 quadradinhos soltos de 0,25, em âmbar e verde, lado a lado com os algarismos 2 e 5. Depois, as iscas: 5 centavos não é 0,5 (o zero guarda a casa) e o 2.5 da calculadora é 2,5.',
  vega: 'Ideia central: as casas depois da vírgula continuam o valor posicional da unidade 1, dividindo por 10: a primeira é a dos décimos (uma coluna da grade, 10 centavos), a segunda a dos centésimos (um quadradinho, 1 centavo). O centavo é o centésimo do real. Erros esperados: trocar décimos e centésimos (3 décimos escritos 0,03); esquecer o zero dos décimos (5 centavos escritos 0,5); ler o ponto da calculadora como separador de milhar. Guie com "Quantas colunas cheias?", "E quantos quadradinhos soltos?", "Quantos centavos vale uma coluna?". Na calculadora e em programas em inglês, o ponto faz o papel da vírgula; no Brasil, o ponto separa os milhares (12.500). Em Sua vez, peça para pensar em moedas de 10 centavos e de 1 centavo.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma bala custa **R$ 0,25**. É menos de 1 real. Mas que pedaço do real é esse?',
      fala: 'Uma bala custa vinte e cinco centavos. É menos de um real. Mas que pedaço do real é esse?',
      visual: grade(REAL, 'Uma grade 10 × 10 vazia, grande, com "R$ 1,00" embaixo: o real inteiro.'),
      esboco: 'Todo mundo sabe o que são 25 centavos. A pergunta é o que a vírgula e as duas casas querem dizer.',
    },
    {
      tipo: 'mexa',
      texto: 'A grade inteira é **1**. Cada coluna é **um décimo** dela. Pinte **3** colunas.',
      fala: 'A grade inteira é um. Cada coluna é um décimo dela. Pinte três colunas.',
      visual: grade({ pintadas: 0, pintar: true, porColuna: true, escala: true }, 'A grade vazia, com 0,1 … 1 embaixo das colunas. Cada toque pinta uma coluna inteira, e o número embaixo anda: 0,1, 0,2, 0,3.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas colunas até pintar 3.',
        sucesso: { pintadas: 30 },
        mostre: 'Três colunas se pintam, uma de cada vez, e o número embaixo vai de 0,1 a 0,3.',
      },
      descoberta: '1 coluna é 1 décimo, 0,1. Três colunas são 3 décimos: 0,3.',
      esboco: 'O gesto é o de encher a grade em fatias. A escala embaixo liga cada coluna a um décimo.',
    },
    {
      tipo: 'aposta',
      pergunta: '3 colunas de 10. Como se escreve esse número?',
      fala: 'Três colunas de dez. Como se escreve esse número?',
      visual: grade({ pintadas: 30, semRotulo: true, escala: true }, 'A grade com 3 colunas pintadas e o número escondido.'),
      opcoes: [
        {
          texto: '0,3', certa: true,
          explica: 'Isso. Nenhum inteiro e 3 décimos: 0,3.',
          mostra: grade({ pintadas: 30, escala: true }, 'O 0,3 aparece embaixo da grade.'),
        },
        {
          texto: '0,03', erro: 'troca-decimo-centesimo',
          explica: '0,03 seriam só 3 quadradinhos. Aqui são 3 colunas inteiras: 0,3.',
          mostra: grade({ grades: [{ pintadas: 30 }, { pintadas: 3 }] }, 'Ao lado, uma grade com só 3 quadradinhos pintados e 0,03 embaixo: bem menos.'),
        },
        {
          texto: '3',
          explica: '3 seriam 3 grades inteiras. Aqui é um pedaço de uma grade só.',
          mostra: grade({ pintadas: 300 }, 'Três grades inteiras pintadas, com 3 embaixo: muito mais que as 3 colunas.'),
        },
      ],
      esboco: 'As duas iscas desmontadas pelo tamanho do pintado.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada coluna tem 10 quadradinhos. Cada um é **um centésimo**. Pinte **25** quadradinhos.',
      fala: 'Cada coluna tem dez quadradinhos. Cada um é um centésimo. Pinte vinte e cinco quadradinhos.',
      visual: grade({ pintadas: 0, pintar: true, separar: true }, 'A grade vazia. Um toque pinta até aquele quadradinho, coluna por coluna. As colunas cheias ficam âmbar; os quadradinhos soltos, verdes.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no quadradinho até onde quer pintar.',
        sucesso: { pintadas: 25 },
        mostre: 'Duas colunas inteiras se pintam de âmbar e mais 5 quadradinhos de verde. Embaixo: 0,25.',
      },
      descoberta: '25 quadradinhos são 2 colunas cheias e 5 soltos: 2 décimos e 5 centésimos, 0,25.',
      esboco: 'O momento-chave. As duas cores mostram o 2 e o 5 do 0,25: colunas e quadradinhos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Se a grade é **R$ 1,00**, quanto valem esses 25 quadradinhos?',
      fala: 'Se a grade é um real, quanto valem esses vinte e cinco quadradinhos?',
      visual: grade({ pintadas: 25, separar: true, semRotulo: true }, 'A grade com 2 colunas âmbar e 5 quadradinhos verdes, sem o número.'),
      opcoes: [
        {
          texto: 'R$ 0,25', certa: true,
          explica: 'Isso. 100 centavos fazem 1 real: cada quadradinho é 1 centavo.',
          mostra: grade({ pintadas: 25, separar: true, rotulo: 'R$ 0,25' }, 'Embaixo aparece R$ 0,25. Uma coluna acende: 10 centavos.'),
        },
        {
          texto: 'R$ 2,50',
          explica: 'R$ 2,50 são 2 reais e meio: 2 grades e meia. Aqui é menos de 1 grade.',
          mostra: grade({ pintadas: 250, rotulo: 'R$ 2,50' }, 'Duas grades cheias e meia, com R$ 2,50 embaixo.'),
        },
        {
          texto: 'R$ 25,00',
          explica: '25 reais seriam 25 grades inteiras. Cada quadradinho é só 1 centavo.',
        },
      ],
      esboco: 'Liga a grade ao dinheiro: coluna = 10 centavos, quadradinho = 1 centavo.',
    },
    {
      tipo: 'anote',
      titulo: 'Décimos e centésimos',
      definicao: 'Depois da vírgula, a 1ª casa conta os **décimos** e a 2ª, os **centésimos**. No real, 1 centésimo é 1 centavo.',
      exemplo: { tex: '0{,}25 = 2 \\text{ décimos} + 5 \\text{ centésimos}', fala: 'zero vírgula vinte e cinco são dois décimos e cinco centésimos' },
      alerta: 'Casa vazia leva zero: 5 centavos são **0,05**, não 0,5.',
      esboco: 'Na página: a grade com 0,25 em âmbar e verde, e embaixo U , d c com 0 , 2 5.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um chiclete custa **5 centavos**. Como fica a etiqueta?',
      fala: 'Um chiclete custa cinco centavos. Como fica a etiqueta?',
      visual: grade({ pintadas: 5, separar: true, semRotulo: true }, 'A grade com só 5 quadradinhos verdes, numa coluna incompleta.'),
      opcoes: [
        {
          texto: 'R$ 0,05', certa: true,
          explica: 'Isso. Nenhuma coluna cheia: zero décimos. E 5 quadradinhos: 5 centésimos.',
          mostra: grade({ pintadas: 5, separar: true, rotulo: 'R$ 0,05' }, 'Embaixo, R$ 0,05; o 0 dos décimos acende.'),
        },
        {
          texto: 'R$ 0,5', erro: 'esquece-zero-decimal',
          explica: '0,5 são 5 colunas: metade do real, 50 centavos. O zero guarda a casa dos décimos.',
          mostra: grade({ grades: [{ pintadas: 5, rotulo: '0,05' }, { pintadas: 50, rotulo: '0,5' }] }, 'Ao lado, uma grade com 5 colunas cheias: 0,5 é dez vezes mais.'),
        },
        {
          texto: 'R$ 5,00',
          explica: '5 reais seriam 5 grades inteiras. O chiclete custa só 5 quadradinhos.',
        },
      ],
      esboco: 'O zero que guarda o lugar, agora depois da vírgula. A grade de 0,5 desmonta na hora.',
    },
    {
      tipo: 'passo',
      problema: 'A passagem custa **R$ 3,07**. O que diz cada algarismo?',
      fala: 'A passagem custa três reais e sete centavos. O que diz cada algarismo?',
      visual: grade({ pintadas: 307, separar: true, rotulo: 'R$ 3,07' }, 'Três grades cheias e, na quarta, 7 quadradinhos verdes.'),
      passos: [
        {
          pergunta: 'O 3, antes da vírgula, é…',
          fala: 'O três, antes da vírgula, é…',
          opcoes: [
            { texto: '3 reais inteiros', certa: true, explica: 'Isso. Antes da vírgula ficam os inteiros: 3 grades cheias.' },
            { texto: '3 décimos', erro: 'troca-decimo-centesimo', explica: 'Os décimos vêm depois da vírgula. O 3 está antes: são 3 inteiros.' },
          ],
          linha: { tex: '3 \\text{ inteiros}', fala: 'três inteiros' },
        },
        {
          pergunta: 'E o 0, logo depois da vírgula?',
          fala: 'E o zero, logo depois da vírgula?',
          opcoes: [
            { texto: 'Nenhum décimo: nenhuma coluna cheia', certa: true, explica: 'Isso. Na quarta grade não há coluna cheia.' },
            { texto: 'Nada: dá para apagar', erro: 'esquece-zero-decimal', explica: 'Sem o zero, fica 3,7: 3 reais e 70 centavos. O zero segura o 7 nos centésimos.' },
          ],
          linha: { tex: '0 \\text{ décimos}', fala: 'zero décimos' },
        },
        {
          pergunta: 'E o 7?',
          fala: 'E o sete?',
          opcoes: [
            { texto: '7 centésimos: 7 centavos', certa: true, explica: 'Isso. 7 quadradinhos soltos.' },
            { texto: '7 décimos: 70 centavos', erro: 'troca-decimo-centesimo', explica: '7 décimos seriam 7 colunas. O 7 está na 2ª casa: 7 quadradinhos, 7 centavos.' },
          ],
          linha: { tex: '3{,}07 = 3 + 0{,}07', fala: 'três vírgula zero sete é três mais sete centésimos' },
        },
      ],
      esboco: 'Uma casa por vez, da esquerda para a direita. A grade acende a parte de cada algarismo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você dividiu R$ 5 por 2 na calculadora, e ela mostrou **2.5**. Quanto cada um paga?',
      fala: 'Você dividiu cinco reais por dois na calculadora, e ela mostrou dois ponto cinco. Quanto cada um paga?',
      visual: { modelo: 'livre', estado: { calculadoras: [{ nome: 'Celular', teclas: '5 ÷ 2 =', visor: '2.5' }] }, esboco: 'O visor de uma calculadora de celular com 5 ÷ 2 = 2.5, com ponto.' },
      opcoes: [
        {
          texto: 'R$ 2,50', certa: true,
          explica: 'Isso. A calculadora usa o ponto no lugar da vírgula: 2.5 é 2,5.',
          mostra: grade({ pintadas: 250, rotulo: 'R$ 2,50' }, 'Duas grades cheias e meia: R$ 2,50.'),
        },
        {
          texto: 'R$ 2.500,00', erro: 'separador-decimal',
          explica: 'Aqui o ponto não separa milhar: é a vírgula da calculadora. Metade de R$ 5 não dá R$ 2.500.',
          mostra: grade({ pintadas: 250, rotulo: 'R$ 2,50' }, 'Duas grades cheias e meia: R$ 2,50.'),
        },
        {
          texto: 'R$ 25,00',
          explica: 'R$ 25 é mais que os R$ 5 da conta. O ponto separa o 2 inteiro dos 5 décimos.',
        },
      ],
      esboco: 'Vírgula e ponto: a calculadora e os programas em inglês trocam os dois. O tamanho da conta desmonta.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: 4 moedas de 10 centavos e 3 moedas de 1 centavo. Escreva o total em reais, com vírgula.',
      fala: 'No papel: quatro moedas de dez centavos e três moedas de um centavo. Escreva o total em reais, com vírgula.',
      resposta: '0,43',
      resolucao: [
        { tex: '4 \\times 10 \\text{ centavos} = 4 \\text{ décimos}', fala: 'quatro moedas de dez centavos são quatro décimos' },
        { tex: '3 \\times 1 \\text{ centavo} = 3 \\text{ centésimos}', fala: 'três moedas de um centavo são três centésimos' },
        { tex: 'R\\$\\ 0{,}43', fala: 'quarenta e três centavos: zero vírgula quarenta e três' },
      ],
      esboco: 'As moedas de 10 são colunas; as de 1, quadradinhos. Na resolução, a grade com 4 colunas e 3 quadradinhos.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['decimos-centesimos-n1', 'decimos-centesimos-n2', 'decimos-centesimos-n3'],
      esboco: 'Nível 1: ler o número pintado na grade. Nível 2: escrever reais e centavos com vírgula, com os zeros que pegam. Nível 3: o que um algarismo quer dizer num preço, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'A bala custa **R$ 0,25**: 2 décimos e 5 centésimos do real. Na próxima aula: frações que viram decimais.',
      fala: 'A bala custa vinte e cinco centavos: dois décimos e cinco centésimos do real. Na próxima aula: frações que viram decimais.',
      visual: grade({ pintadas: 25, separar: true, rotulo: 'R$ 0,25' }, 'A grade do gancho, agora com 0,25 pintado em âmbar e verde.'),
      esboco: 'Responde ao gancho com a grade pintada.',
    },
  ],
}
