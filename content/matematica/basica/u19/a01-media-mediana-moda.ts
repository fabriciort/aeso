import type { Aula, Visual } from '@/lib/formation/schema'

// Média, mediana e moda. Os 9 tempos de entrega de uma pizzaria, como pontos
// empilhados sobre a reta. O momento-chave é o Mexa "equilibrar": o aluno
// arrasta o apoio até a reta ficar reta, e o ponto de equilíbrio é a média
// (35 minutos). Depois a fila do menor ao maior e o do meio, a mediana (30);
// com 10 entregas, a média dos dois do meio (32,5); e a pilha mais alta, a
// moda (25). Os três números são diferentes e os três estão certos: cada um
// resume o mesmo conjunto de um jeito. Os erros a desmontar: contar o valor
// repetido uma vez só, fazer o meio entre o menor e o maior, achar o meio
// sem pôr em fila, pegar só um dos dois do meio e tomar o maior valor pela
// moda.

const dados = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'dados', estado, esboco })

/** Os 9 tempos de entrega, em minutos, na ordem em que Lia anotou. Soma 315: média 35, mediana 30, moda 25. */
const TEMPOS = [30, 25, 40, 25, 55, 35, 30, 25, 50]
const E = { valores: TEMPOS, unidade: 'min', titulo: 'Tempo de entrega' }
/** Com mais uma entrega, de 45 minutos: 10 valores, os do meio são 30 e 35. */
const E10 = { ...E, valores: [...TEMPOS, 45] }
/** Os atrasos do ônibus de Davi: média 4, mediana 3, moda 2. */
const ONIBUS = { valores: [8, 2, 5, 2, 3], unidade: 'min', titulo: 'Atraso do ônibus' }

export const aula: Aula = {
  id: 'B.U19.A1',
  titulo: 'Média, mediana e moda',
  objetivo: 'Resumir um conjunto de números pela média (a soma dividida pela quantidade, o ponto de equilíbrio), pela mediana (o valor do meio da fila; com quantidade par, a média dos dois do meio) e pela moda (o valor que mais aparece), e entender que os três resumem o mesmo conjunto de jeitos diferentes.',
  modelo: 'dados',
  esboco: 'O palco é o gráfico de pontos o tempo todo: cada entrega é um ponto sobre a reta dos minutos, e tempos iguais formam pilhas. Momento-chave: o Mexa "equilibrar". A reta é uma gangorra; com o apoio no 25, ela pende para a direita; o aluno arrasta o apoio até ela ficar reta, no 35. A conta confirma: 315 ÷ 9 = 35. Depois os pontos saem da reta e formam a fila (Mexa "ordenar"): o do meio é a mediana, 30. Com uma entrega a mais, dois ficam no meio (32,5). Volta ao gráfico de pontos e o aluno toca a pilha mais alta, a moda (25). Os três aparecem juntos. Fecha com o ônibus de Davi, passo a passo.',
  vega: 'Ideia central: três jeitos de resumir um conjunto de números. A média é a soma dividida pela quantidade: o ponto de equilíbrio dos pontos sobre a reta. A mediana é o valor do meio, com os valores em fila do menor ao maior; com uma quantidade par, é a média dos dois do meio. A moda é o valor que mais aparece (pode não existir, ou haver duas). Nos 9 tempos de entrega (30, 25, 40, 25, 55, 35, 30, 25, 50 minutos), a média é 35, a mediana 30 e a moda 25: os três estão certos. Os tempos são exemplo da aula. Erros esperados: contar uma vez só um valor repetido (somar 235 em vez de 315); fazer o meio entre o menor e o maior ((25 + 55) ÷ 2 = 40); achar o meio da lista sem pôr em fila; com quantidade par, pegar um só dos dois do meio; dizer que a moda é o maior valor; achar que só a média vale. Guie com "Cada ponto é uma entrega: quantos pontos há?", "Já pôs em fila?", "Qual pilha é a mais alta?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Lia anotou o tempo de 9 entregas da mesma pizzaria. Um amigo pergunta: quanto demora? Que número ela responde?',
      visual: dados(E, 'Nove pontos sobre a reta dos minutos, de 20 a 60. Três pontos empilhados no 25, dois no 30, um no 35, 40, 50 e 55.'),
      esboco: 'Uma pergunta do dia a dia que pede um número só para muitos números.',
    },
    {
      tipo: 'mexa',
      texto: 'Pense na reta como uma gangorra, e em cada entrega como um peso. Onde ela fica em equilíbrio?',
      visual: dados({ ...E, fulcro: 25 }, 'O apoio âmbar embaixo do 25. A reta pende para a direita, para o lado dos tempos longos.'),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Arraste o apoio até a reta ficar reta.',
        sucesso: { media: 35 },
        mostre: 'O apoio vai para 35 minutos e a reta fica reta.',
      },
      descoberta: 'O ponto de equilíbrio dos tempos é 35 minutos: a média.',
      esboco: 'O momento-chave. A reta inclina menos à medida que o apoio chega perto do 35; no 35, fica reta e aparece "média 35 min".',
    },
    {
      tipo: 'passo',
      problema: 'O equilíbrio tem uma conta: a **média**. Confira com os 9 tempos.',
      visual: dados({ ...E, media: true }, 'A reta equilibrada, com o apoio no 35.'),
      passos: [
        {
          pergunta: 'Quanto dá a soma dos 9 tempos?',
          opcoes: [
            {
              texto: '315 minutos', certa: true,
              explica: 'Isso. Cada ponto conta: o 25 entra 3 vezes, e o 30 entra 2.',
              mostra: dados({ ...E, media: true, destaque: [25, 30], rotulo: 'soma: 315 min' }, 'As pilhas do 25 e do 30 acesas; embaixo, "soma: 315 min".'),
            },
            {
              texto: '235 minutos', erro: 'media-esquece-valores',
              explica: 'Assim cada número entrou uma vez só. Mas o 25 aparece 3 vezes e o 30, 2: cada ponto é uma entrega.',
              mostra: dados({ ...E, media: true, destaque: [25, 30] }, 'As pilhas do 25 e do 30 acesas: são 5 entregas, não 2.'),
            },
          ],
          linha: { tex: '\\text{soma dos 9 tempos} = 315', fala: 'a soma dos nove tempos é trezentos e quinze' },
        },
        {
          pergunta: '315 minutos em 9 entregas. Qual é a média?',
          fala: 'Trezentos e quinze minutos em nove entregas. Qual é a média?',
          opcoes: [
            {
              texto: '$315 \\div 9 = 35$', certa: true,
              explica: 'Isso: 35 minutos, bem onde a reta ficou em equilíbrio.',
              fala: 'Isso: trinta e cinco minutos, bem onde a reta ficou em equilíbrio.',
              mostra: dados({ ...E, media: true }, 'A reta equilibrada no 35, com "média 35 min".'),
            },
            {
              texto: '$(25 + 55) \\div 2 = 40$', erro: 'media-do-menor-e-do-maior',
              explica: '40 é o meio entre a menor e a maior. A média usa todas as entregas: 315 ÷ 9 = 35.',
              fala: 'Quarenta é o meio entre a menor e a maior. A média usa todas as entregas: trezentos e quinze dividido por nove, trinta e cinco.',
              mostra: dados({ ...E, fulcro: 40 }, 'O apoio no 40: a reta pende para a esquerda.'),
            },
          ],
          linha: { tex: '315 \\div 9 = 35', fala: 'trezentos e quinze dividido por nove, trinta e cinco' },
        },
      ],
      esboco: 'A conta da média, depois de ver o equilíbrio. A errada do segundo passo põe o apoio no 40, e a reta pende.',
    },
    {
      tipo: 'mexa',
      texto: 'Outro resumo: o tempo do meio. Para achar o meio, ponha as entregas em fila.',
      visual: dados({ ...E, mediana: true }, 'Os nove pontos sobre a reta, com a borda tracejada para tocar.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos pontos do menor tempo para o maior.',
        sucesso: { ordenado: true },
        mostre: 'A fila se forma: 25, 25, 25, 30, 30, 35, 40, 50, 55.',
      },
      descoberta: 'Na fila, o 5º de 9 é o do meio: 30 minutos.',
      esboco: 'Cada toque leva um ponto para a fila, com o número dentro. No fim, o do meio acende em azul.',
    },
    {
      tipo: 'ideia',
      texto: 'O do meio da fila é a **mediana**: 30 minutos. Ficam 4 entregas antes dele e 4 depois.',
      visual: dados({ ...E, fila: true, mediana: true }, 'A fila de 9, com o 30 do meio aceso em azul e "mediana 30 min" embaixo.'),
      esboco: 'Dá o nome ao que o aluno acabou de fazer.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Lia anotou mais uma entrega, de 45 minutos. Agora são 10, e ficam dois no meio: 30 e 35. Qual é a mediana?',
      fala: 'Lia anotou mais uma entrega, de quarenta e cinco minutos. Agora são dez, e ficam dois no meio: trinta e trinta e cinco. Qual é a mediana?',
      visual: dados({ ...E10, fila: true }, 'A fila de 10: o 45 entra entre o 40 e o 50.'),
      opcoes: [
        {
          texto: '32,5 minutos', certa: true,
          explica: 'Isso. Com dois no meio, a mediana é a média dos dois: (30 + 35) ÷ 2 = 32,5.',
          fala: 'Isso. Com dois no meio, a mediana é a média dos dois: trinta mais trinta e cinco, dividido por dois, trinta e dois e meio.',
          mostra: dados({ ...E10, fila: true, mediana: true }, 'O 30 e o 35 acesos em azul, com a marca entre eles e "mediana 32,5 min".'),
        },
        {
          texto: '30 minutos', erro: 'mediana-par-pega-um-do-meio',
          explica: 'O 30 é só um dos dois do meio. A mediana fica entre eles: (30 + 35) ÷ 2 = 32,5.',
          fala: 'O trinta é só um dos dois do meio. A mediana fica entre eles: trinta e dois e meio.',
          mostra: dados({ ...E10, fila: true, mediana: true }, 'Os dois do meio acesos e a mediana 32,5 entre eles.'),
        },
        {
          texto: '35 minutos', erro: 'mediana-par-pega-um-do-meio',
          explica: 'O 35 é só um dos dois do meio. A mediana fica entre eles: (30 + 35) ÷ 2 = 32,5.',
          fala: 'O trinta e cinco é só um dos dois do meio. A mediana fica entre eles: trinta e dois e meio.',
          mostra: dados({ ...E10, fila: true, mediana: true }, 'Os dois do meio acesos e a mediana 32,5 entre eles.'),
        },
      ],
      esboco: 'A quantidade par. O 45 entra na fila no lugar certo; a mediana não é nenhum dos tempos anotados.',
    },
    {
      tipo: 'mexa',
      texto: 'De volta às 9 entregas. O último resumo: o tempo que mais se repete, a **moda**.',
      visual: dados(E, 'A fila se desfaz e os nove pontos voltam para as pilhas sobre a reta.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na moda: a pilha mais alta.',
        sucesso: { moda: 25 },
        mostre: 'A pilha do 25 acende em verde: 3 entregas.',
      },
      descoberta: 'A moda é 25 minutos: o tempo que mais aparece, 3 vezes.',
      esboco: 'Tocar o 30 (a mediana) ou o 35 (a média) dá o aviso de que aquele é outro resumo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Média 35, mediana 30, moda 25. Três números diferentes para as mesmas entregas. Qual está certo?',
      fala: 'Média trinta e cinco, mediana trinta, moda vinte e cinco. Três números diferentes para as mesmas entregas. Qual está certo?',
      visual: dados({ ...E, media: true, mediana: true, moda: true }, 'Os três juntos: o apoio no 35, a linha azul no 30 e a pilha verde do 25.'),
      opcoes: [
        {
          texto: 'Os três: cada um resume de um jeito', certa: true,
          explica: 'Isso. A média é o equilíbrio, a mediana é o meio da fila, a moda é o que mais se repete.',
          mostra: dados({ ...E, media: true, mediana: true, moda: true }, 'Os três resumos sobre a mesma reta.'),
        },
        {
          texto: 'Só a média: ela é a conta de verdade', erro: 'usa-sempre-a-media',
          explica: 'As três vêm de contas certas. E a mediana diz algo que a média não diz: metade chegou em até 30 minutos.',
          mostra: dados({ ...E, mediana: true, destaque: [25, 30] }, 'A linha da mediana no 30 e, acesas, as 5 entregas que chegaram em até 30 minutos.'),
        },
      ],
      esboco: 'Os três resumos convivem. A errada abre a próxima aula: a média não é sempre a melhor.',
    },
    {
      tipo: 'anote',
      titulo: 'Média, mediana e moda',
      definicao: '**Média**: a soma dividida pela quantidade. **Mediana**: o valor do meio, com os valores em fila. **Moda**: o valor que mais aparece.',
      exemplo: { tex: '\\text{média } 35 \\qquad \\text{mediana } 30 \\qquad \\text{moda } 25', fala: 'nas entregas: média trinta e cinco, mediana trinta, moda vinte e cinco' },
      alerta: 'Ponha os valores em fila antes de achar o meio. Com dois no meio, a mediana é a média dos dois.',
      esboco: 'Na página: o gráfico de pontos das entregas com o apoio, a fila com o do meio e a pilha mais alta.',
    },
    {
      tipo: 'passo',
      problema: 'O ônibus de Davi atrasou, em 5 dias, 8, 2, 5, 2 e 3 minutos. Ache a média, a mediana e a moda.',
      visual: dados(ONIBUS, 'Cinco pontos sobre a reta de 0 a 10: dois no 2, um no 3, no 5 e no 8.'),
      passos: [
        {
          pergunta: 'Qual é a média?',
          opcoes: [
            {
              texto: '$20 \\div 5 = 4$', certa: true,
              explica: 'Isso. 8 + 2 + 5 + 2 + 3 = 20, em 5 dias: 4 minutos.',
              fala: 'Isso. Oito mais dois mais cinco mais dois mais três, vinte, em cinco dias: quatro minutos.',
              mostra: dados({ ...ONIBUS, media: true }, 'O apoio no 4, com "média 4 min".'),
            },
            {
              texto: '$18 \\div 4 = 4{,}5$', erro: 'media-esquece-valores',
              explica: 'Assim o 2 entrou uma vez só. Foram 5 dias: 8 + 2 + 5 + 2 + 3 = 20, e 20 ÷ 5 = 4.',
              fala: 'Assim o dois entrou uma vez só. Foram cinco dias: a soma é vinte, e vinte dividido por cinco, quatro.',
              mostra: dados({ ...ONIBUS, destaque: 2 }, 'A pilha do 2 acesa: são dois dias.'),
            },
          ],
          linha: { tex: '(8 + 2 + 5 + 2 + 3) \\div 5 = 20 \\div 5 = 4', fala: 'oito mais dois mais cinco mais dois mais três, dividido por cinco: vinte dividido por cinco, quatro' },
        },
        {
          pergunta: 'Qual é a mediana?',
          opcoes: [
            {
              texto: '3 minutos', certa: true,
              explica: 'Isso. Em fila, 2, 2, 3, 5, 8: o do meio é o 3.',
              mostra: dados({ ...ONIBUS, fila: true, mediana: true }, 'A fila 2, 2, 3, 5, 8 com o 3 aceso em azul.'),
            },
            {
              texto: '5 minutos', erro: 'mediana-sem-ordenar',
              explica: 'O 5 é o do meio da lista como veio. Em fila, 2, 2, 3, 5, 8, o do meio é o 3.',
              mostra: dados({ ...ONIBUS, fila: true, mediana: true }, 'A fila com o 3 aceso no meio.'),
            },
          ],
          linha: { tex: '\\text{fila: } 2,\\ 2,\\ 3,\\ 5,\\ 8 \\qquad \\text{mediana } 3', fala: 'em fila, dois, dois, três, cinco, oito: a mediana é três' },
        },
        {
          pergunta: 'Qual é a moda?',
          opcoes: [
            {
              texto: '2 minutos', certa: true,
              explica: 'Isso. O 2 aparece duas vezes; os outros, uma vez só.',
              mostra: dados({ ...ONIBUS, moda: true }, 'Os pontos voltam para a reta e a pilha do 2 fica verde.'),
            },
            {
              texto: '8 minutos', erro: 'moda-e-o-maior-valor',
              explica: '8 é o maior atraso. A moda é o que mais se repete: o 2, que aparece duas vezes.',
              mostra: dados({ ...ONIBUS, moda: true }, 'A pilha do 2 em verde, a mais alta.'),
            },
          ],
          linha: { tex: '\\text{moda } 2', fala: 'a moda é dois' },
        },
      ],
      esboco: 'Os três resumos num conjunto novo, pequeno. A média 4, a mediana 3 e a moda 2 de novo são diferentes.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: outra pizzaria fez 6 entregas, de 20, 35, 25, 40, 30 e 50 minutos. Qual é a mediana?',
      resposta: '32,5',
      resolucao: [
        { tex: '\\text{fila: } 20,\\ 25,\\ 30,\\ 35,\\ 40,\\ 50', fala: 'em fila: vinte, vinte e cinco, trinta, trinta e cinco, quarenta, cinquenta' },
        { tex: '\\text{dois no meio: } 30 \\text{ e } 35', fala: 'dois no meio: trinta e trinta e cinco' },
        { tex: '(30 + 35) \\div 2 = 32{,}5', fala: 'trinta mais trinta e cinco, dividido por dois, trinta e dois e meio' },
      ],
      esboco: 'A quantidade par, sozinho: pôr em fila e fazer a média dos dois do meio.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['media-mediana-moda-n1', 'media-mediana-moda-n2', 'media-mediana-moda-n3'],
      esboco: 'Nível 1: a média, a mediana ou a moda lidas no gráfico de pontos. Nível 2: a lista fora de ordem, com quantidade par e valores repetidos. Nível 3: a nota que falta para a média e o total a partir da média.',
    },
    {
      tipo: 'fecho',
      texto: 'Lia pode dizer: uns 35 minutos, na média. Mas metade chega em até 30. Na próxima aula: quando a média engana.',
      fala: 'Lia pode dizer: uns trinta e cinco minutos, na média. Mas metade chega em até trinta. Na próxima aula: quando a média engana.',
      visual: dados({ ...E, media: true, mediana: true }, 'O apoio no 35 e a linha da mediana no 30.'),
      esboco: 'Responde ao gancho com dois números e deixa a dúvida para a próxima aula: qual usar?',
    },
  ],
}
