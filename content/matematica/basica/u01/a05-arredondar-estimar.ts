import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  id: 'B.U1.A5',
  titulo: 'Arredondar e estimar',
  objetivo: 'Arredondar naturais à dezena, centena e milhar mais próximos, com empate para cima; usar aproximações para avaliar a ordem de grandeza sem confundi-las com igualdade ou garantia de um limite.',
  modelo: 'reta',
  vega:
    'Ideia central: arredondar é escolher a marca de 10 em 10, 100 em 100 ou 1.000 em 1.000 mais próxima; nesta formação o empate escolhe o maior. Recupere B.U1.A4: as posições e as distâncias na mesma escala decidem. Recupere B.U1.A2: a primeira casa à direita da precisão indica de que lado do meio o número está; as demais casas ficam zeradas. Não peça adição ou subtração antes da U2: toda distância é visualizada na reta, e a estimativa avalia uma quantidade já conhecida. Erros esperados: subir sempre, olhar a casa errada, descer no empate, usar = para uma aproximação e tomar um valor arredondado como garantia de caber num limite. Guie perguntando "Quais são as duas marcas vizinhas?", "Onde fica o meio?" e "O valor exato mudou?". Em Sua vez, não forneça o número ou escolha pelo aluno. Usar ≈ quando os valores diferem; um múltiplo já exato pode permanecer igual. As viagens, livros e convites são exemplos imaginados. Não há doses, normas ou recomendações profissionais. A estimativa ajuda a estranhar um registro muito distante, mas não prova uma conta correta nem substitui a comparação exata.',
  esboco:
    'A régua da A4 continua no palco. Dois extremos, o ponto do número e o meio tornam visível a escolha do vizinho mais próximo. Mudar apenas um algarismo desloca o ponto; ao passar pelo meio, muda o vizinho escolhido. O momento-chave é 995 no meio de 990 e 1.000: o empate sobe e abre uma nova casa, sem inventar 9910. Depois, separar o ponto exato do marcador aproximado, preservando ambos. A estimativa serve para avaliar o tamanho; a cena de envelopes mostra por que arredondar não garante um limite. Com movimento reduzido, mostrar posições finais, setas curtas e casas realçadas.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você vai viajar **243 km**. Contando para alguém, você diria “uns **200 km**” ou “uns **300 km**”?',
      visual: {
        modelo: 'reta',
        estado: { de: 200, ate: 300, passo: 10, marcas: [200, 300], etiquetaSolta: 243, unidade: 'km' },
        movimento: 'A régua se amplia para o trecho 200–300; a distância exata aparece numa etiqueta solta.',
        esboco: 'A régua representa os valores de distância, sem desenhar uma rota real ou insinuar dados geográficos.',
      },
      esboco: 'Pedir a escolha antes de dar nome ao arredondamento. A etiqueta conserva o rótulo exemplo imaginado.',
    },
    {
      tipo: 'mexa',
      texto: 'Qual fica mais perto de **243**: 200 ou 300?',
      visual: {
        modelo: 'reta',
        estado: { de: 200, ate: 300, passo: 10, marcas: [200, 243, 300], escolhas: [200, 300] },
        movimento: 'O ponto 243 pousa entre 240 e 250; dois segmentos ligam o ponto aos extremos.',
        esboco: 'Mostrar os comprimentos reais dos dois trechos na mesma escala, sem já realçar o menor.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na marca mais perto.',
        sucesso: { vizinho: 200 },
        mostre: 'Sobrepor o trecho 243–200 ao trecho 243–300; destacar o mais curto e escolher 200.',
      },
      descoberta: 'Escolher uma centena próxima depende da distância até as duas marcas vizinhas.',
      esboco: 'O toque realça o trecho escolhido. Se ele escolher 300, os dois comprimentos se alinham para permitir outra decisão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Para **287**, qual centena fica mais perto?',
      visual: {
        modelo: 'reta',
        estado: { de: 200, ate: 300, passo: 10, marcas: [200, 287, 300], meio: 250 },
        movimento: 'O ponto desliza de 243 para 287; as marcas 200 e 300 permanecem fixas.',
        esboco: 'O meio é uma referência discreta; os trechos até os extremos acompanham o ponto.',
      },
      opcoes: [
        {
          texto: '200: começa com 2',
          erro: 'olha-casa-errada',
          explica: '287 já passou do meio, que é 250. Até 300 faltam só 13. Começar com 2 não decide.',
          mostra: {
            modelo: 'reta',
            estado: { de: 200, ate: 300, passo: 10, marcas: [200, 250, 287, 300], vizinho: 300 },
            movimento: 'Os dois trechos se alinham; o trecho até 300 ganha destaque por ser menor.',
            esboco: 'Voltar à proximidade, sem corrigir por uma regra de algarismo ainda não apresentada.',
          },
        },
        {
          texto: '300: está mais perto',
          certa: true,
          explica: 'Isso. De 287 até 300 faltam só 13.',
          mostra: {
            modelo: 'reta',
            estado: { de: 200, ate: 300, passo: 10, marcas: [200, 250, 287, 300], vizinho: 300 },
            movimento: 'Um marcador aproximado pousa em 300, mas o ponto exato 287 continua visível.',
            esboco: 'Conservar a quantidade original, antecipando a diferença entre aproximar e mudar o valor real.',
          },
        },
      ],
      esboco: 'Contrastar um caso que desce com outro que sobe, evitando a ideia de subir sempre.',
    },
    {
      tipo: 'ideia',
      texto: '**Arredondar** à centena é trocar o número pela marca de **100 em 100** mais perto dele.',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 400, passo: 100, marcas: [0, 100, 200, 300, 400], numeros: [243, 287], vizinhos: [200, 300] },
        movimento: 'A régua afasta; as marcas de cem em cem aparecem e os dois exemplos apontam para seus vizinhos.',
        esboco: 'Apresentar múltiplo como nome das marcas já conhecidas, sem antecipar a teoria da U6.',
      },
      esboco: 'Dar o nome depois das escolhas concretas; o visual mostra que os destinos pertencem à escala de centenas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Arredondando à **dezena**, 243 fica entre **240** e **250**. Qual está mais perto?',
      visual: {
        modelo: 'reta',
        estado: { de: 240, ate: 250, passo: 1, marcas: [240, 243, 250], meio: 245, escolhas: [240, 250] },
        movimento: 'O intervalo de uma dezena se amplia, revelando dez intervalos iguais de uma unidade.',
        esboco: 'Sinalizar a mudança de zoom e manter os dois extremos no palco.',
      },
      opcoes: [
        {
          texto: '250: arredondar é sempre subir',
          erro: 'arredonda-sempre-para-cima',
          explica: '243 ainda não chegou ao meio, 245. Está mais perto de 240. Arredondar também pode descer.',
          mostra: {
            modelo: 'reta',
            estado: { de: 240, ate: 250, passo: 1, marcas: [240, 243, 245, 250], vizinho: 240 },
            movimento: 'Os dois trechos se alinham; o menor, até 240, ganha destaque.',
            esboco: 'Confrontar subir sempre com os comprimentos reais da régua.',
          },
        },
        {
          texto: '240: está mais perto',
          certa: true,
          explica: 'Isso. À dezena, 243 vira 240. À centena, virou 200. Depende de quanto você arredonda.',
          mostra: {
            modelo: 'reta',
            estado: { de: 240, ate: 250, passo: 1, marcas: [240, 243, 245, 250], vizinho: 240 },
            movimento: 'Um marcador aproximado pousa em 240 enquanto o ponto exato 243 permanece.',
            esboco: 'Conservar o número exato e mostrar o destino na precisão de dezena.',
          },
        },
      ],
      esboco: 'Uma resposta 250 realça o trecho mais longo; o aluno revê a proximidade sem perder o ponto 243. A aposta diagnostica subir sempre.',
    },
    {
      tipo: 'aposta',
      pergunta: '**245** fica bem no meio de **240** e **250**. Quando empata, a regra é ficar com o maior. Qual fica?',
      visual: {
        modelo: 'reta',
        estado: { de: 240, ate: 250, passo: 1, marcas: [240, 245, 250], meio: 245 },
        movimento: 'O ponto desliza até o meio; os dois segmentos recebem o mesmo comprimento visual.',
        esboco: 'Deixar o empate explícito e declarar a convenção antes da resposta, pois ela não vem da distância.',
      },
      opcoes: [
        {
          texto: '240',
          erro: 'empate-para-baixo',
          explica: 'Empatou: 5 para cada lado. No empate, a regra é ficar com o maior: 250.',
          mostra: {
            modelo: 'reta',
            estado: { de: 240, ate: 250, passo: 1, marcas: [240, 245, 250], vizinho: 250 },
            movimento: 'Os segmentos iguais ficam visíveis e a seta da convenção aponta para 250.',
            esboco: 'A seta indica uma escolha combinada, sem fingir que 250 está mais próximo.',
          },
        },
        {
          texto: '250',
          certa: true,
          explica: 'Isso. Não é que 250 esteja mais perto: empatou, e a regra manda ficar com o maior.',
          mostra: {
            modelo: 'reta',
            estado: { de: 240, ate: 250, passo: 1, marcas: [240, 245, 250], vizinho: 250 },
            movimento: 'O marcador aproximado vai a 250; 245 permanece no meio dos dois trechos iguais.',
            esboco: 'Preservar a igualdade de distâncias enquanto aparece o destino da convenção.',
          },
        },
      ],
      esboco: 'Distinguir decisão por proximidade de decisão por convenção no único caso de empate.',
    },
    {
      tipo: 'ideia',
      texto: 'Antes do meio, vá para a marca menor. Depois do meio, para a maior. **No meio, fique com a maior**.',
      visual: {
        modelo: 'reta',
        estado: { de: 240, ate: 250, passo: 1, marcas: [240, 245, 250], exemplos: [243, 245, 247], vizinhos: [240, 250, 250] },
        movimento: 'O mesmo ponto passa por 243, 245 e 247; o destino troca no meio.',
        esboco: 'Mostrar os três estados em sequência, sem três retas concorrendo por espaço.',
      },
      esboco: 'Resumir o padrão espacial visto nas ações; deixar a casa das unidades para o próximo experimento.',
    },
    {
      tipo: 'mexa',
      texto: 'Arraste o ponto de 240 até 249. A partir de qual número o arredondamento vira **250**?',
      visual: {
        modelo: 'reta',
        estado: { de: 240, ate: 250, passo: 1, marcas: [240, 245, 250], numero: 240, casaVariavel: 'U', unidadeDe: 0, unidadeAte: 9 },
        movimento: 'As casas C, D e U aparecem sob o ponto; só a unidade se move junto com o controle.',
        esboco: 'A régua e o quadro posicional coexistem; centenas e dezenas ficam fixas durante a exploração.',
      },
      acao: {
        tipo: 'deslizar',
        instrucao: 'Pare no primeiro número que vai para 250.',
        sucesso: { unidade: 5, numero: 245, vizinho: 250 },
        mostre: 'Mover de 240 até 245, uma unidade por vez; o destino fica em 240 até 244 e muda para 250 ao chegar a 245.',
      },
      descoberta: 'À dezena, unidades de 0 a 4 ficam antes do meio; de 5 a 9 ficam no meio ou depois.',
      esboco: 'O destino acompanha cada tentativa imediatamente. O aluno encontra a fronteira, em vez de receber a regra antes de mexer.',
    },
    {
      tipo: 'ideia',
      texto: 'Para arredondar à dezena, olhe a **unidade**. De 0 a 4, desce. De 5 a 9, sobe.',
      visual: {
        modelo: 'quadro-posicional',
        estado: { numero: 243, casas: ['C', 'D', 'U'], casaDecisiva: 'U', destinos: [240, 250], faixaMenor: [0, 4], faixaMaior: [5, 9] },
        movimento: 'O controle de unidades se divide em duas faixas; a unidade 3 aponta para o destino 240.',
        esboco: 'A regra de algarismo aparece como resumo da posição do ponto; não omitir a unidade zerada no resultado.',
      },
      esboco: 'Recuperar o valor posicional da A2 e ligar a unidade ao trecho da reta explorado.',
    },
    {
      tipo: 'ideia',
      texto: 'À centena, olhe a **dezena**. Ao milhar, olhe a **centena**. As casas da direita viram zero.',
      visual: {
        modelo: 'quadro-posicional',
        estado: { numeros: [243, 2460], precisao: [100, 1000], casasDecisivas: ['D', 'C'], aproximacoes: [200, 2000] },
        movimento: 'O realce muda de unidade para dezena e depois centena; as casas descartadas viram zeros nos destinos.',
        esboco: 'Apresentar uma precisão por vez: 243 à centena; 2.460 ao milhar. Manter visível qual precisão foi pedida.',
      },
      esboco: 'Não olhar sempre a unidade: a casa decisiva é a primeira à direita da precisão escolhida.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A viagem tem **243 km**. Como escrever “mais ou menos 200 km”?',
      fala: 'A viagem tem duzentos e quarenta e três quilômetros. Como escrever mais ou menos duzentos quilômetros?',
      visual: {
        modelo: 'reta',
        estado: { de: 200, ate: 300, passo: 10, marcas: [200, 243], unidade: 'km' },
        movimento: 'Voltam o ponto exato da viagem e o marcador aproximado em 200, em posições diferentes.',
        esboco: 'Os dois valores distintos ficam visíveis; a pergunta pede o símbolo para essa relação.',
      },
      opcoes: [
        {
          texto: '243 = 200',
          fala: 'duzentos e quarenta e três é igual a duzentos',
          erro: 'estimativa-exata',
          explica: 'O sinal = só vale para números iguais. E 243 não é igual a 200.',
          mostra: {
            modelo: 'reta',
            estado: { de: 200, ate: 300, passo: 10, marcas: [200, 243], escrita: '243 ≈ 200' },
            movimento: 'Realçar a separação dos pontos; o sinal de igualdade é trocado pelo de aproximação.',
            esboco: 'Retomar a igualdade da A4, em que dois rótulos compartilhavam a mesma posição.',
          },
        },
        {
          texto: '243 ≈ 200',
          fala: 'duzentos e quarenta e três é aproximadamente igual a duzentos',
          certa: true,
          explica: 'Isso. O ≈ quer dizer “mais ou menos”. A viagem continua tendo 243 km.',
          mostra: {
            modelo: 'reta',
            estado: { de: 200, ate: 300, passo: 10, marcas: [200, 243], escrita: '243 ≈ 200' },
            movimento: 'A escrita aparece ligando os dois rótulos, sem mover o ponto exato.',
            esboco: 'O marcador aproximado representa a comunicação do valor, não a alteração da viagem.',
          },
        },
      ],
      esboco: 'Apostar na escrita antes de nomear ≈; a diferença de posições explica por que = não serve.',
    },
    {
      tipo: 'ideia',
      texto: '**≈** quer dizer “aproximadamente igual”. **=** é só para números iguais: **200 = 200**.',
      fala: 'O sinal de aproximação significa aproximadamente igual. O sinal de igual fica para valores iguais: duzentos é igual a duzentos.',
      visual: {
        modelo: 'reta',
        estado: { de: 200, ate: 300, passo: 10, marcas: [200, 243], aproximacao: '243 ≈ 200', igualdade: '200 = 200' },
        movimento: 'Dois rótulos 200 apontam para um mesmo ponto; 243 permanece separado e ligado por aproximação.',
        esboco: 'Comparar a aproximação entre pontos distintos à igualdade de dois rótulos do mesmo ponto.',
      },
      esboco: 'A voz lê os símbolos por extenso. Um múltiplo já na precisão pedida continua igual a ele mesmo.',
    },
    {
      tipo: 'anote',
      titulo: 'Arredondar',
      definicao: 'Arredondar é trocar um número pela marca de 10 em 10, 100 em 100 ou 1.000 em 1.000 mais perto dele. No meio, fica a maior.',
      exemplo: { tex: '243 \\approx 240 \\quad\\text{à dezena}', fala: 'duzentos e quarenta e três é aproximadamente duzentos e quarenta, à dezena' },
      alerta: 'Olhe a casa logo à direita da que você quer. Arredondar pode descer ou subir: não é sempre para cima.',
      esboco: 'Copiar a definição, a reta 240–250 com o ponto 243 e a escrita com ≈. Revelar cada parte separadamente para caber no celular.',
    },
    {
      tipo: 'passo',
      problema: 'Arredonde **2.460** à **centena**.',
      visual: {
        modelo: 'reta',
        estado: { de: 2400, ate: 2500, passo: 10, marcas: [2400, 2460, 2500], precisao: 100 },
        movimento: 'A régua muda para 2.400–2.500; os extremos são centenas vizinhas e cada intervalo menor vale dez.',
        esboco: 'O ponto exato aparece, mas o meio e o destino ficam para as escolhas guiadas.',
      },
      passos: [
        {
          pergunta: 'Quais são as centenas vizinhas de 2.460?',
          opcoes: [
            { texto: '2.400 e 2.500', certa: true, explica: 'Isso. 2.460 fica entre 2.400 e 2.500.' },
            { texto: '2.000 e 3.000', erro: 'olha-casa-errada', explica: 'Essas são de mil em mil. Aqui é de cem em cem: 2.400 e 2.500.' },
          ],
          linha: { tex: '2.400 < 2.460 < 2.500', fala: 'dois mil quatrocentos e sessenta está entre dois mil quatrocentos e dois mil e quinhentos' },
        },
        {
          pergunta: 'O meio é 2.450. De que lado fica 2.460?',
          opcoes: [
            { texto: 'Depois do meio', certa: true, explica: 'Isso. 2.460 passou do meio, então fica mais perto de 2.500.' },
            { texto: 'Antes, porque termina em 0', erro: 'olha-casa-errada', explica: 'À centena, quem decide é a dezena: 6. O zero do final não importa aqui.' },
          ],
          linha: { tex: '2.460 > 2.450', fala: 'dois mil quatrocentos e sessenta é maior que dois mil quatrocentos e cinquenta' },
        },
        {
          pergunta: 'Como escrever o arredondamento?',
          opcoes: [
            { texto: '2.460 ≈ 2.500', certa: true, explica: 'Isso. 2.460 fica mais perto de 2.500.' },
            { texto: '2.460 = 2.500', erro: 'estimativa-exata', explica: '2.460 não é igual a 2.500. Use ≈, que quer dizer “mais ou menos”.' },
          ],
          linha: { tex: '2.460 \\approx 2.500', fala: 'dois mil quatrocentos e sessenta é aproximadamente dois mil e quinhentos' },
        },
      ],
      esboco: 'Depois da primeira escolha, marcar as centenas; depois da segunda, o meio; depois da terceira, escrever ≈ e pousar um segundo marcador em 2.500.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Arredonde **995** à dezena. Ele fica bem no meio de **990** e **1.000**. Qual fica?',
      visual: {
        modelo: 'reta',
        estado: { de: 990, ate: 1000, passo: 1, marcas: [990, 995, 1000], meio: 995, precisao: 10 },
        movimento: 'A régua aproxima a fronteira de mil; cada trecho de uma unidade conserva o mesmo comprimento.',
        esboco: 'Mostrar 1.000 como dezena vizinha de 990, mesmo quando o destino ganha uma casa.',
      },
      opcoes: [
        {
          texto: '990',
          erro: 'empate-para-baixo',
          explica: 'Empatou. No empate, fica o maior: 1.000, mesmo ganhando uma casa a mais.',
          mostra: {
            modelo: 'quadro-posicional',
            estado: { numero: 995, aproximacao: 1000, precisao: 10, casas: ['M', 'C', 'D', 'U'] },
            movimento: 'O destino passa a 1.000; a casa de milhar aparece e centenas, dezenas e unidades ficam zeradas.',
            esboco: 'Não colar 10 no lugar de um algarismo; o destino inteiro é mil.',
          },
        },
        {
          texto: '1.000',
          certa: true,
          explica: 'Isso. No empate, 995 vai para 1.000.',
          mostra: {
            modelo: 'reta',
            estado: { de: 990, ate: 1000, passo: 1, marcas: [990, 995, 1000], vizinho: 1000, escrita: '995 ≈ 1.000' },
            movimento: 'O marcador aproximado vai a 1.000; o ponto 995 e as duas distâncias iguais permanecem.',
            esboco: 'Momento-chave: a fronteira troca a escrita do número, mas conserva o motivo da escolha.',
          },
        },
      ],
      esboco: 'Forçar a decisão por proximidade e empate, sem depender de um atalho de algarismo que falha na troca de casas.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora **9.950** à **centena**. Fica no meio de **9.900** e **10.000**. Para onde vai?',
      visual: {
        modelo: 'reta',
        estado: { de: 9900, ate: 10000, passo: 10, marcas: [9900, 9950, 10000], meio: 9950, escolhas: [9900, 10000], precisao: 100 },
        movimento: 'A escala amplia a fronteira de dez mil; os trechos até os extremos se igualam.',
        esboco: 'Mostrar a precisão centena claramente; 10.000 também é uma marca de cem em cem.',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Lembre: no empate, fica o maior.',
        sucesso: { vizinho: 10000 },
        mostre: 'Comparar os trechos iguais e mover apenas o marcador aproximado para 10.000; mostrar 9.950 ≈ 10.000.',
      },
      descoberta: 'O mesmo critério continua válido ao passar de quatro para cinco algarismos.',
      esboco: 'Transferir a decisão para outro tamanho de número, com menos apoio que em 995. Ao conferir, realçar o novo zero e a casa de dezena de milhar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma biblioteca tem **2.470 livros**. Se você diz “uns 2.000”, o número de livros muda?',
      visual: {
        modelo: 'reta',
        estado: { de: 2000, ate: 3000, passo: 100, marcas: [2000, 2470, 3000], meio: 2500 },
        movimento: 'Uma etiqueta de contagem ocupa 2.470; um segundo marcador aponta para a aproximação 2.000.',
        esboco: 'A contagem vem pronta; não pedir somas de caixas ou uma nova operação antes da U2.',
      },
      opcoes: [
        {
          texto: 'Sim: passam a ser 2.000',
          erro: 'estimativa-exata',
          explica: 'Continuam 2.470 livros. O “uns 2.000” só dá uma ideia do tamanho.',
          mostra: {
            modelo: 'reta',
            estado: { de: 2000, ate: 3000, passo: 100, marcas: [2000, 2470], exato: 2470, aproximado: 2000 },
            movimento: 'A etiqueta exata se mantém em 2.470 enquanto a palavra cerca de aparece em 2.000.',
            esboco: 'Não retirar livros no desenho; a mudança acontece no registro aproximado.',
          },
        },
        {
          texto: 'Não: continuam 2.470',
          certa: true,
          explica: 'Isso. Arredondar dá uma ideia do tamanho. Os livros continuam sendo 2.470.',
          mostra: {
            modelo: 'reta',
            estado: { de: 2000, ate: 3000, passo: 100, marcas: [2000, 2470], escrita: '2.470 ≈ 2.000' },
            movimento: 'A escrita com ≈ liga os dois rótulos, e o ponto exato continua no mesmo lugar.',
            esboco: 'Preparar o uso da estimativa como avaliação de tamanho, sem prometer exatidão.',
          },
        },
      ],
      esboco: 'Perguntar sobre a interpretação da aproximação, além de treinar o número de destino.',
    },
    {
      tipo: 'ideia',
      texto: 'Isso tem nome: **estimar**. É usar um número arredondado para ter uma ideia do tamanho.',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 30000, passo: 10000, marcas: [0, 2470, 10000, 20000, 30000], comparacao: [2470, 20000] },
        movimento: 'A régua afasta: 2.470 fica nos poucos milhares; um registro de 20.000 aparece muito distante.',
        esboco: 'Avaliar ordem de grandeza por posições na mesma escala, sem exigir operações novas.',
      },
      esboco: 'O ponto aproximado permite estranhar uma contagem anotada muito maior; ele não comprova uma operação.',
    },
    {
      tipo: 'anote',
      titulo: 'Estimar',
      definicao: 'Estimar é usar um número arredondado para ter uma ideia do tamanho de uma quantidade.',
      exemplo: { tex: '2.470 \\approx 2.000 \\quad\\text{ao milhar}', fala: 'dois mil quatrocentos e setenta é aproximadamente dois mil, ao milhar' },
      alerta: 'A estimativa dá uma ideia, não a conta exata. Para saber se algo cabe ou basta, use o número exato.',
      esboco: 'Copiar a definição, a aproximação ao milhar e o alerta. Cada linha entra separadamente; o aluno confirma no papel.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você tem **104 convites** e **100 envelopes**. 104 é “uns 100”. Dá um envelope para cada convite?',
      visual: {
        modelo: 'reta',
        estado: { de: 90, ate: 110, passo: 1, marcas: [100, 104], convites: 104, envelopes: 100, precisao: 10 },
        movimento: 'A reta retorna aos valores exatos; as etiquetas convites e envelopes apontam para pontos diferentes.',
        esboco: 'Usar uma situação doméstica com quantidades dadas, sem compras, orçamento profissional ou subtração.',
      },
      opcoes: [
        {
          texto: 'Sim: uns 100 cabem em 100',
          erro: 'aproximacao-garante-limite',
          explica: 'São 104 convites, não 100. Faltam 4 envelopes. Arredondar não faz os convites sumirem.',
          mostra: {
            modelo: 'reta',
            estado: { de: 90, ate: 110, passo: 1, marcas: [100, 104], limite: 100, escrita: '104 > 100' },
            movimento: 'Uma marca de limite permanece em 100; o ponto exato 104 continua à direita.',
            esboco: 'Comparar os valores exatos sem calcular a diferença; o limite e a aproximação não deslocam o ponto.',
          },
        },
        {
          texto: 'Não: 104 é maior que 100',
          certa: true,
          explica: 'Isso. Faltam 4 envelopes. Para saber se dá, compare os números exatos.',
          mostra: {
            modelo: 'reta',
            estado: { de: 90, ate: 110, passo: 1, marcas: [100, 104], escrita: '104 > 100' },
            movimento: 'Os rótulos exatos ficam em destaque e a aproximação perde destaque.',
            esboco: 'A estratégia de comparação da A4 fornece a decisão; não pedir uma reserva calculada.',
          },
        },
      ],
      esboco: 'Desmontar a confiança excessiva no valor aproximado com a mesma reta usada para comparar.',
    },
    {
      tipo: 'ideia',
      texto: 'Para ter uma ideia, arredonde. Para saber se dá ou não dá, use os **números exatos**.',
      visual: {
        modelo: 'reta',
        estado: { de: 90, ate: 110, passo: 1, marcas: [100, 104], exato: 104, aproximado: 100, limite: 100 },
        movimento: 'O marcador aproximado encosta no limite, mas uma linha guia mantém o ponto exato 104 à direita.',
        esboco: 'Distinguir os três papéis: quantidade real, número arredondado e limite, mesmo quando dois valores coincidem.',
      },
      esboco: 'A frase responde à aposta e delimita o uso da estimativa; não oferecer uma regra de segurança fora da matemática.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, arredonde **2.470** ao milhar. Desenhe os dois milhares vizinhos e o meio. Depois digite o resultado.',
      resposta: 2000,
      resolucao: [
        { tex: '2.000 < 2.470 < 3.000', fala: 'dois mil quatrocentos e setenta está entre dois mil e três mil' },
        { tex: '\\text{meio: }2.500 \\quad\\text{e}\\quad 2.470 < 2.500', fala: 'o meio é dois mil e quinhentos, e dois mil quatrocentos e setenta está antes dele' },
        { tex: '2.470 \\approx 2.000', fala: 'dois mil quatrocentos e setenta é aproximadamente dois mil, ao milhar' },
      ],
      esboco: 'Esperar o papel e a resposta. A conferência desenha os extremos 2.000 e 3.000 com intervalos de cem, marca o meio 2.500 e coloca 2.470 antes dele; as linhas surgem uma por vez.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['arredondar-n1', 'arredondar-n2', 'arredondar-n3'],
      esboco: 'Primeiro dezenas amigáveis com reta; depois empates e troca de casas em três precisões; por fim quantidades imaginadas, escrita com ≈ e comparação de um limite sem visual. Liberar dicas em três etapas.',
    },
    {
      tipo: 'fecho',
      texto: 'Na viagem: **243 km ≈ 200 km**. Dá para dizer “uns 200 km”, e a estrada continua com 243. Na próxima unidade, as contas.',
      fala: 'Na viagem: duzentos e quarenta e três quilômetros é aproximadamente duzentos. Dá para dizer uns duzentos quilômetros, e a estrada continua com duzentos e quarenta e três. Na próxima unidade, as contas.',
      visual: {
        modelo: 'reta',
        estado: { de: 200, ate: 300, passo: 10, marcas: [200, 243, 300], exato: 243, aproximado: 200, unidade: 'km' },
        movimento: 'A régua da viagem retorna com os dois marcadores: 243 exato e cerca de 200 aproximado.',
        esboco: 'Responder à pergunta inicial e preservar a distinção entre a viagem e a forma aproximada de contá-la.',
      },
      esboco: 'Fechar com o uso adulto da aproximação. O apoio da reta estará disponível para conferir contas na U2.',
    },
  ],
}
