import type { Aula, Visual } from '@/lib/formation/schema'

// Comparar e arredondar decimais. Comparar é casa por casa, da esquerda para
// a direita (inteiros, décimos, centésimos), e não pelo comprimento: 0,5 é
// maior que 0,25. Completar com zeros (0,5 = 0,50) deixa a comparação
// clara. Arredondar ao décimo é ir para o décimo mais perto na reta, e não
// apagar casas: 2,37 ≈ 2,4.

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const QUEIJOS = { grades: [{ pintadas: 50, rotulo: '0,5 kg' }, { pintadas: 25, rotulo: '0,25 kg' }] }
const TABUA = { de: 2.3, ate: 2.4, passo: 0.01, marcas: [2.3, 2.37, 2.4], meio: 2.35, unidade: 'm' }

export const aula: Aula = {
  id: 'B.U8.A3',
  titulo: 'Comparar e arredondar',
  objetivo: 'Comparar decimais casa por casa, completando com zeros quando ajuda, e arredondar um decimal ao décimo ou ao inteiro mais perto.',
  modelo: 'grade',
  esboco: 'Dois pedaços de queijo, 0,5 kg e 0,25 kg. O aluno aposta (a isca é "25 é mais que 5") e depois pinta 0,5 ao lado do 0,25 já pintado. Momento-chave: as 5 colunas cheias passando as 2 colunas e meia do 0,25. Depois, o zero no fim (0,5 = 0,50), o erro do contrário (0,4 contra 0,45) e o passo a passo de duas tábuas na reta. Na mesma reta, arredondar 2,37 ao décimo: o meio 2,35 decide, e apagar o 7 dá a resposta errada.',
  vega: 'Ideia central: para comparar decimais, alinhe pela vírgula e compare casa por casa, da esquerda para a direita: inteiros, depois décimos, depois centésimos. A primeira casa diferente decide. Completar com zeros no fim não muda o número (0,5 = 0,50) e deixa os dois com o mesmo número de casas. Arredondar ao décimo é trocar o número pelo décimo mais perto na reta: olhe o centésimo, de 0 a 4 fica, de 5 a 9 sobe; no meio exato, fica o maior, como na unidade 1. Erros esperados: achar que o mais comprido é maior (0,25 > 0,5, porque 25 > 5); achar que o mais curto é maior (0,4 > 0,45, porque décimos valem mais); arredondar apagando casas (2,37 vira 2,3); subir sempre; descer no empate. Guie com "Quantas colunas cheias em cada um?", "Qual é a primeira casa diferente?", "Onde fica o meio entre os dois décimos?". Não diga "o que tem mais algarismos": mostre as duas grades.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Dois pedaços de queijo: um de **0,5 kg** e outro de **0,25 kg**. Qual é o maior?',
      fala: 'Dois pedaços de queijo: um de zero vírgula cinco quilo e outro de zero vírgula vinte e cinco quilo. Qual é o maior?',
      visual: grade({ grades: [{ pintadas: 0, rotulo: '0,5 kg' }, { pintadas: 0, rotulo: '0,25 kg' }] }, 'Duas grades vazias lado a lado, com 0,5 kg e 0,25 kg embaixo.'),
      esboco: 'As duas etiquetas, como na banca do mercado. O 25 parece maior que o 5.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual pedaço pesa mais?',
      visual: grade({ grades: [{ pintadas: 0, rotulo: '0,5 kg' }, { pintadas: 0, rotulo: '0,25 kg' }] }, 'As duas grades vazias.'),
      opcoes: [
        {
          texto: '0,5 kg', certa: true,
          explica: 'Isso. Vamos pintar os dois para ver o tamanho.',
        },
        {
          texto: '0,25 kg: 25 é mais que 5', erro: 'decimal-mais-casas-maior',
          explica: 'O 25 e o 5 estão em casas diferentes. Vamos pintar os dois para ver.',
        },
        {
          texto: 'Pesam o mesmo',
          explica: 'Os números são diferentes. Vamos pintar os dois para ver qual é maior.',
        },
      ],
      esboco: 'Só a previsão. A resposta vem no próximo cartão, pelas mãos do aluno.',
    },
    {
      tipo: 'mexa',
      texto: 'O 0,25 já está pintado. Pinte **0,5** na grade da esquerda.',
      fala: 'O zero vírgula vinte e cinco já está pintado. Pinte zero vírgula cinco na grade da esquerda.',
      visual: grade(
        { grades: [{ pintadas: 0, rotulo: '0,5 kg' }, { pintadas: 25, rotulo: '0,25 kg' }], pintar: true, porColuna: true, ativa: 0 },
        'Duas grades lado a lado. A da direita já tem 2 colunas e 5 quadradinhos. A da esquerda tem a borda tracejada; cada toque pinta uma coluna.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas colunas da esquerda até pintar 0,5.',
        sucesso: { pintadas: 50 },
        mostre: 'Cinco colunas se pintam na grade da esquerda e passam das 2 colunas e meia da direita.',
      },
      descoberta: '0,5 são 5 colunas cheias; 0,25 não chega a 3. O 0,5 é maior, mesmo com menos algarismos.',
      esboco: 'O momento-chave. A partir da terceira coluna, a grade da esquerda já passou a da direita.',
    },
    {
      tipo: 'ideia',
      texto: '**0,5 = 0,50**. Com as mesmas casas, fica claro: 50 centésimos contra 25.',
      fala: 'Zero vírgula cinco é zero vírgula cinquenta. Com as mesmas casas, fica claro: cinquenta centésimos contra vinte e cinco.',
      visual: grade({ grades: [{ pintadas: 50, rotulo: '0,50' }, { pintadas: 25, rotulo: '0,25' }], separar: true }, 'As duas grades, agora com 0,50 e 0,25 embaixo: 5 colunas contra 2 colunas e 5 quadradinhos.'),
      esboco: 'O zero no fim, da aula anterior, vira ferramenta de comparar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E agora: qual é maior, **0,4** ou **0,45**?',
      fala: 'E agora: qual é maior, zero vírgula quatro ou zero vírgula quarenta e cinco?',
      visual: grade({ grades: [{ pintadas: 0, rotulo: '0,4' }, { pintadas: 0, rotulo: '0,45' }] }, 'Duas grades vazias, com 0,4 e 0,45 embaixo.'),
      opcoes: [
        {
          texto: '0,45', certa: true,
          explica: 'Isso. Os dois têm 4 décimos. Os centésimos decidem: 0,40 contra 0,45.',
          mostra: grade({ grades: [{ pintadas: 40, rotulo: '0,40' }, { pintadas: 45, rotulo: '0,45' }], separar: true }, 'As duas grades se pintam: 4 colunas cada, e a da direita tem mais 5 quadradinhos verdes.'),
        },
        {
          texto: '0,4: décimos valem mais que centésimos', erro: 'decimal-mais-curto-maior',
          explica: 'Os dois têm 4 décimos, as mesmas 4 colunas. O 0,45 ainda tem 5 centésimos a mais.',
          mostra: grade({ grades: [{ pintadas: 40, rotulo: '0,40' }, { pintadas: 45, rotulo: '0,45' }], separar: true, destaque: 1 }, 'As duas grades pintadas; a do 0,45 acende, com os 5 quadradinhos a mais.'),
        },
        {
          texto: 'São iguais: os dois têm 4 décimos',
          explica: 'Os décimos empatam, mas o 0,45 tem ainda 5 centésimos. O 0,4 não tem nenhum.',
        },
      ],
      esboco: 'O erro do contrário: agora o mais curto é que parece maior. A mesma régua resolve: casa por casa.',
    },
    {
      tipo: 'anote',
      titulo: 'Comparar decimais',
      definicao: 'Compare **casa por casa**, da esquerda para a direita: inteiros, décimos, centésimos. A primeira casa diferente decide.',
      exemplo: { tex: '0{,}5 = 0{,}50 > 0{,}25', fala: 'zero vírgula cinco, que é zero vírgula cinquenta, é maior que zero vírgula vinte e cinco' },
      alerta: 'O número mais comprido não é o maior: 0,25 < 0,5. Complete com zeros para ficarem do mesmo tamanho.',
      esboco: 'Na página: as duas grades lado a lado e os números alinhados pela vírgula, 0,50 em cima de 0,25.',
    },
    {
      tipo: 'passo',
      problema: 'Duas tábuas: uma de **2,35 m** e outra de **2,4 m**. Qual é a mais comprida?',
      fala: 'Duas tábuas: uma de dois vírgula trinta e cinco metros e outra de dois vírgula quatro metros. Qual é a mais comprida?',
      visual: reta({ de: 2.3, ate: 2.5, passo: 0.01, marcas: [2.3, 2.4, 2.5], unidade: 'm' }, 'A reta de 2,3 a 2,5, com um traço a cada centésimo e números só em 2,3, 2,4 e 2,5.'),
      passos: [
        {
          pergunta: 'Os inteiros são 2 e 2. E agora?',
          fala: 'Os inteiros são dois e dois. E agora?',
          opcoes: [
            { texto: 'Empatou: olhar os décimos', certa: true, explica: 'Isso. Empatou numa casa, passe para a seguinte.' },
            { texto: '2,35 tem mais algarismos: é maior', erro: 'decimal-mais-casas-maior', explica: 'Algarismo a mais não quer dizer número maior. Compare casa por casa: depois dos inteiros, os décimos.' },
          ],
          linha: { tex: '2 = 2', fala: 'dois inteiros nos dois' },
        },
        {
          pergunta: 'Décimos: 3 contra 4. Qual tábua é a mais comprida?',
          fala: 'Décimos: três contra quatro. Qual tábua é a mais comprida?',
          opcoes: [
            { texto: 'A de 2,4 m', certa: true, explica: 'Isso. 4 décimos é mais que 3. Os centésimos nem precisam entrar.', mostra: reta({ de: 2.3, ate: 2.5, passo: 0.01, marcas: [2.3, 2.4, 2.5], numeros: [2.35, 2.4], maior: 2.4, unidade: 'm' }, 'Os dois pontos na reta: 2,4 fica à direita de 2,35.') },
            { texto: 'A de 2,35 m: 35 é mais que 4', erro: 'decimal-mais-casas-maior', explica: 'O 35 e o 4 estão em casas diferentes. Na reta, 2,35 fica antes de 2,4.', mostra: reta({ de: 2.3, ate: 2.5, passo: 0.01, marcas: [2.3, 2.4, 2.5], numeros: [2.35, 2.4], maior: 2.4, unidade: 'm' }, 'Os dois pontos na reta: 2,35 no meio entre 2,3 e 2,4, antes do 2,4.') },
          ],
          linha: { tex: '2{,}40 > 2{,}35', fala: 'dois vírgula quarenta é maior que dois vírgula trinta e cinco' },
        },
      ],
      esboco: 'Casa por casa, com a reta como prova. A mesma reta, ampliada, serve para arredondar no próximo cartão.',
    },
    {
      tipo: 'mexa',
      texto: 'Uma tábua tem **2,37 m**. Ao décimo, ela fica mais perto de **2,3** ou de **2,4**?',
      fala: 'Uma tábua tem dois vírgula trinta e sete metros. Ao décimo, ela fica mais perto de dois vírgula três ou de dois vírgula quatro?',
      visual: reta({ ...TABUA, escolhas: [2.3, 2.4] }, 'A reta de 2,3 a 2,4 ampliada, com 10 traços de centésimo, o meio 2,35 tracejado e o ponto 2,37. As marcas 2,3 e 2,4 são tocáveis.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no décimo mais perto.',
        sucesso: { vizinho: 2.4 },
        mostre: 'Um arco sai de 2,37 e pousa em 2,4: são só 3 centésimos até lá, contra 7 até 2,3.',
      },
      descoberta: '2,37 passou do meio (2,35), então fica mais perto de 2,4: 2,37 ≈ 2,4.',
      esboco: 'A reta da unidade 1, agora entre dois décimos. O meio tracejado decide.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um colega arredondou 2,37 m apagando o 7: escreveu **2,3 m**. Está certo?',
      fala: 'Um colega arredondou dois vírgula trinta e sete metros apagando o sete: escreveu dois vírgula três metros. Está certo?',
      visual: reta({ ...TABUA }, 'A mesma reta, com 2,37 e o meio 2,35.'),
      opcoes: [
        {
          texto: 'Não: 2,37 fica mais perto de 2,4', certa: true,
          explica: 'Isso. Arredondar é ir para o mais perto, e não apagar casas.',
          mostra: reta({ ...TABUA, numeros: [2.37], vizinhos: [2.4] }, 'O arco de 2,37 até 2,4.'),
        },
        {
          texto: 'Sim: arredondar é tirar a última casa', erro: 'arredondar-corta-casas',
          explica: 'Apagar só dá certo antes do meio. 2,37 passou de 2,35: fica mais perto de 2,4.',
          mostra: reta({ ...TABUA, numeros: [2.37], vizinhos: [2.4] }, 'O arco de 2,37 até 2,4, curto; o trecho até 2,3 é mais que o dobro.'),
        },
      ],
      esboco: 'O erro de cortar casas, desmontado pela mesma reta.',
    },
    {
      tipo: 'anote',
      titulo: 'Arredondar decimais',
      definicao: 'Arredondar ao décimo é trocar o número pelo décimo mais perto. Olhe o centésimo: de 0 a 4 fica, de 5 a 9 sobe. No meio, fica o maior.',
      exemplo: { tex: '2{,}37 \\approx 2{,}4 \\qquad 2{,}35 \\approx 2{,}4 \\qquad 2{,}32 \\approx 2{,}3', fala: 'dois vírgula trinta e sete é aproximadamente dois vírgula quatro; dois vírgula trinta e cinco também; dois vírgula trinta e dois, dois vírgula três' },
      alerta: 'Arredondar não é apagar casas: 2,37 vira 2,4, e não 2,3. Use ≈, porque o número muda.',
      esboco: 'Na página: a reta de 2,3 a 2,4 com o meio 2,35 e os três exemplos, como na unidade 1.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: a balança marca **1,46 kg**. Arredonde ao décimo. Desenhe os dois décimos vizinhos e o meio.',
      fala: 'No papel: a balança marca um vírgula quarenta e seis quilo. Arredonde ao décimo. Desenhe os dois décimos vizinhos e o meio.',
      resposta: '1,5',
      resolucao: [
        { tex: '1{,}4 < 1{,}46 < 1{,}5', fala: 'um vírgula quarenta e seis está entre um vírgula quatro e um vírgula cinco' },
        { tex: '\\text{meio: } 1{,}45 \\quad \\text{e} \\quad 1{,}46 > 1{,}45', fala: 'o meio é um vírgula quarenta e cinco, e um vírgula quarenta e seis passou dele' },
        { tex: '1{,}46 \\approx 1{,}5', fala: 'um vírgula quarenta e seis é aproximadamente um vírgula cinco' },
      ],
      esboco: 'A reta no caderno quadriculado: 10 quadradinhos de 1,4 a 1,5.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['comparar-decimais-n1', 'arredondar-decimais-n2', 'comparar-arredondar-n3'],
      esboco: 'Nível 1: comparar dois decimais com as grades, com o 0,5 contra 0,25 e os iguais (0,5 e 0,50). Nível 2: arredondar ao décimo na reta, com o empate e o 9 que vira o inteiro seguinte. Nível 3: medidas e preços, comparar três números ou arredondar, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'O queijo de **0,5 kg** é o maior: 0,50 contra 0,25. Na próxima aula: somar e subtrair decimais.',
      fala: 'O queijo de zero vírgula cinco quilo é o maior: zero vírgula cinquenta contra zero vírgula vinte e cinco. Na próxima aula: somar e subtrair decimais.',
      visual: grade(QUEIJOS, 'As duas grades pintadas do gancho: 0,5 kg e 0,25 kg.'),
      esboco: 'Responde ao gancho e abre a soma.',
    },
  ],
}
