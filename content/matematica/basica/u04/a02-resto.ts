import type { Aula, Visual } from '@/lib/formation/schema'

// Nem toda divisão acaba certinho. O resto é o que sobra quando não cabe
// mais um grupo inteiro, e é sempre menor que o grupo. A conta dá o mesmo
// resto em qualquer situação; o que fazer com ele depende da pergunta: às
// vezes pede mais um grupo (as vans), às vezes fica de fora (as caixas
// cheias). Com dinheiro, ele ainda pode virar centavos (unidade 8).

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const VANS = { colunas: 8, grupos: true, rotulos: true, total: 26 }
const R38 = { de: 0, ate: 40, passo: 1, marcas: [0, 5, 10, 15, 20, 25, 30, 35, 38, 40], numero: 38 }

export const aula: Aula = {
  id: 'B.U4.A2',
  titulo: 'O resto',
  objetivo: 'Achar o quociente e o resto de uma divisão com a tabuada, saber que o resto é menor que o divisor e decidir, pela situação, se o resto pede mais um grupo ou fica de fora.',
  modelo: 'retangulo',
  esboco: 'As vans de um casamento: 26 pessoas, vans de 8 lugares. O aluno enche uma van por vez (uma linha de 8 no retângulo) e vê sobrar 2 pessoas na calçada. A mesma conta, 26 ÷ 8 = 3, resto 2, responde de dois jeitos: 4 vans para levar todo mundo, mas só 3 caixas cheias de salgados. Momento-chave: as 2 pessoas que sobram não podem ficar em casa, então o resto vira mais uma van.',
  vega: 'Ideia central: o resto é o que sobra quando não cabe mais um grupo inteiro, e é sempre menor que o grupo (o divisor). Depois de dividir, volte à pergunta: o resto pode pedir mais um grupo (vans, mesas, caixas para levar tudo), ficar de fora (caixas cheias, quantos ingressos dá para comprar) ou, com dinheiro, virar troco ou centavos (os centavos ficam para a unidade de decimais). Erros esperados: parar cedo e deixar um resto maior que o grupo (26 ÷ 8 = 2, resto 10), responder o quociente quando a pergunta é o resto (ou o contrário) e entregar o quociente sem pensar no contexto (3 vans para 26 pessoas). Guie perguntando "Cabe mais um grupo no que sobrou?", "O que a pergunta quer: os grupos ou a sobra?", "E as pessoas que sobraram, como vão?". Em Sua vez, não diga se é para arredondar: peça para o aluno imaginar a cena.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: '**26** pessoas vão a um casamento em vans de **8** lugares. Quantas vans é preciso alugar?',
      fala: 'Vinte e seis pessoas vão a um casamento em vans de oito lugares. Quantas vans é preciso alugar?',
      visual: ret({ ...VANS, linhas: 0 }, 'Uma linha tracejada de 8 lugares, a van vazia, e o 26 embaixo.'),
      esboco: 'Uma conta que não acaba certinho, numa situação em que errar deixa gente para trás.',
    },
    {
      tipo: 'mexa',
      texto: 'Encha as vans: cada toque põe **8** pessoas numa van.',
      fala: 'Encha as vans: cada toque põe oito pessoas numa van.',
      visual: ret({ ...VANS, linhas: 0, adicionar: true }, 'Cada toque desce uma linha cheia de 8, separada das outras: uma van. Um contador mostra quantas pessoas ainda esperam: 26, 18, 10, 2.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para encher uma van, até não dar para encher outra.',
        sucesso: { linhas: 3 },
        mostre: 'Três vans enchem, uma por vez: ficam 18, 10, 2 pessoas esperando. Com 2, não dá para encher mais uma.',
      },
      descoberta: 'Três vans cheias levam 24 pessoas. Sobram 2, que não enchem uma van inteira.',
      esboco: 'Proposta: um quarto toque balança o palco ("Só sobraram 2: não enche uma van") e os 2 quadradinhos ficam soltos ao lado, com borda tracejada (chave nova `sobra: 2`).',
    },
    {
      tipo: 'ideia',
      texto: '3 vans cheias e sobram **2** pessoas. Esse 2 é o **resto**: $26 \\div 8 = 3$, resto $2$.',
      fala: 'Três vans cheias e sobram duas pessoas. Esse dois é o resto: vinte e seis dividido por oito é três, resto dois.',
      visual: ret({ ...VANS, linhas: 3, sobra: 2 }, 'As 3 linhas de 8 e, ao lado, 2 quadradinhos soltos acesos em âmbar.'),
      esboco: 'Dar o nome ao que sobrou, com a escrita "resto 2" ao lado da conta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Então, quantas vans é preciso **alugar** para levar todo mundo?',
      fala: 'Então, quantas vans é preciso alugar para levar todo mundo?',
      visual: ret({ ...VANS, linhas: 3, sobra: 2 }, 'As 3 vans cheias e as 2 pessoas na calçada.'),
      opcoes: [
        {
          texto: '4', certa: true,
          explica: 'Isso. As 2 que sobram também vão ao casamento: precisam de mais uma van, mesmo quase vazia.',
          mostra: ret({ ...VANS, linhas: 4 }, 'Uma quarta van chega e as 2 pessoas entram nela; os outros 6 lugares ficam vazios, tracejados.'),
        },
        {
          texto: '3', erro: 'ignora-contexto-do-resto',
          explica: 'Com 3 vans, 2 pessoas ficam em casa. Aqui o resto pede mais uma van: são **4**.',
          mostra: ret({ ...VANS, linhas: 3, sobra: 2 }, 'As 3 vans partem; as 2 pessoas ficam piscando na calçada.'),
        },
        {
          texto: '2', erro: 'troca-quociente-e-resto',
          explica: '2 são as pessoas que sobraram. As vans são 3 cheias e mais uma para essas 2: **4**.',
          mostra: ret({ ...VANS, linhas: 4 }, 'O 2 aponta para as pessoas soltas; a quarta van chega para elas.'),
        },
      ],
      esboco: 'O momento-chave. A conta diz 3, resto 2; a situação diz 4.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora **26** salgados em caixas de **8**. Quantas caixas ficam **cheias**?',
      fala: 'Agora vinte e seis salgados em caixas de oito. Quantas caixas ficam cheias?',
      visual: ret({ ...VANS, linhas: 3, sobra: 2 }, 'O mesmo retângulo: agora cada linha é uma caixa de salgados.'),
      opcoes: [
        {
          texto: '3', certa: true,
          explica: 'Isso. Mesma conta, outra pergunta. Os 2 salgados que sobram não enchem uma caixa.',
          mostra: ret({ ...VANS, linhas: 3, sobra: 2 }, 'As 3 caixas se fecham; os 2 salgados ficam fora, num pratinho.'),
        },
        {
          texto: '4', erro: 'ignora-contexto-do-resto',
          explica: 'A quarta caixa teria só 2 salgados: não está cheia. Aqui o resto fica de fora: **3**.',
          mostra: ret({ ...VANS, linhas: 4 }, 'Uma quarta caixa aparece com só 2 salgados e 6 lugares vazios; ela pisca e some.'),
        },
      ],
      esboco: 'O contraste com as vans: o mesmo 26 ÷ 8 dá 4 ou 3, conforme a pergunta.',
    },
    {
      tipo: 'ideia',
      texto: 'O resto é o mesmo, **2**. A pergunta decide: vira mais um grupo, fica de fora ou, se for dinheiro, vira troco.',
      fala: 'O resto é o mesmo, dois. A pergunta decide: vira mais um grupo, fica de fora ou, se for dinheiro, vira troco.',
      visual: ret({ ...VANS, linhas: 3, sobra: 2 }, 'Os 2 quadradinhos soltos acendem. Três ícones pequenos ao lado: uma van, um pratinho, uma moeda.'),
      esboco: 'Uma frase só para os destinos do resto. Os centavos ficam como menção: chegam na unidade de decimais.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém fez $26 \\div 8$ e achou **2**, resto **10**. Está certo?',
      fala: 'Alguém fez vinte e seis dividido por oito e achou dois, resto dez. Está certo?',
      visual: ret({ ...VANS, linhas: 2, sobra: 10 }, 'Duas vans cheias e 10 pessoas soltas ao lado.'),
      opcoes: [
        {
          texto: 'Não: com 10 sobrando, cabe mais uma van', certa: true,
          explica: 'Isso. Das 10, mais 8 enchem uma van: 3 vans, resto 2. O resto é sempre **menor** que o grupo.',
          mostra: ret({ ...VANS, linhas: 3, sobra: 2 }, 'Oito das 10 pessoas soltas formam uma linha nova; ficam 2.'),
        },
        {
          texto: 'Sim: as 26 pessoas estão lá', erro: 'resto-maior-que-divisor',
          explica: 'Estão, mas 10 pessoas ainda enchem uma van de 8. Enquanto o resto der um grupo, a conta não acabou.',
          mostra: ret({ ...VANS, linhas: 3, sobra: 2 }, 'As 10 soltas piscam; 8 delas sobem para uma terceira van.'),
        },
      ],
      esboco: 'O resto tem um limite: se ele ainda forma um grupo, faltou dividir.',
    },
    {
      tipo: 'anote',
      titulo: 'Resto',
      definicao: 'O **resto** é o que sobra quando não cabe mais um grupo inteiro. Ele é sempre menor que o grupo.',
      exemplo: { tex: '26 \\div 8 = 3 \\text{, resto } 2', fala: 'vinte e seis dividido por oito é três, resto dois' },
      alerta: 'Depois de dividir, volte à pergunta: às vezes o resto pede mais um grupo.',
      esboco: 'A página com as 3 vans, as 2 pessoas e a quarta van tracejada.',
    },
    {
      tipo: 'passo',
      problema: 'Uma reforma precisa de **38** azulejos. Eles vêm em caixas de **5**. Quantas caixas comprar?',
      fala: 'Uma reforma precisa de trinta e oito azulejos. Eles vêm em caixas de cinco. Quantas caixas comprar?',
      visual: reta(R38, 'A reta de 0 a 40, com marcas de 5 em 5 e o 38 aceso.'),
      passos: [
        {
          pergunta: 'Quantas caixas cheias cabem em 38?',
          fala: 'Quantas caixas cheias cabem em trinta e oito?',
          opcoes: [
            {
              texto: '7', certa: true, explica: 'Isso. $5 \\times 7 = 35$. Mais uma passaria: $5 \\times 8 = 40$.',
              mostra: reta({ ...R38, saltos: [[0, 5, '+5'], [5, 10, '+5'], [10, 15, '+5'], [15, 20, '+5'], [20, 25, '+5'], [25, 30, '+5'], [30, 35, '+5']] }, 'Sete saltos de 5 param no 35, logo antes do 38.'),
            },
            {
              texto: '8', explica: '$5 \\times 8 = 40$: passa de 38. Cheias, cabem **7**.',
              mostra: reta({ ...R38, saltos: [[0, 5, '+5'], [5, 10, '+5'], [10, 15, '+5'], [15, 20, '+5'], [20, 25, '+5'], [25, 30, '+5'], [30, 35, '+5']] }, 'O oitavo salto passaria do 38; ele aparece tracejado e some.'),
            },
            {
              texto: '6', erro: 'resto-maior-que-divisor', explica: '$5 \\times 6 = 30$: sobram 8, e 8 ainda enche mais uma caixa. São **7**.',
              mostra: reta({ ...R38, saltos: [[0, 5, '+5'], [5, 10, '+5'], [10, 15, '+5'], [15, 20, '+5'], [20, 25, '+5'], [25, 30, '+5'], [30, 35, '+5']] }, 'Do 30 ao 38 ainda cabe um salto de 5.'),
            },
          ],
          linha: { tex: '5 \\times 7 = 35', fala: 'cinco vezes sete é trinta e cinco' },
        },
        {
          pergunta: 'Quantos azulejos sobram?',
          opcoes: [
            { texto: '3', certa: true, explica: 'Isso. De 35 até 38 faltam 3. E 3 é menor que 5.' },
            { texto: '33', explica: '$38 - 5 = 33$ tira só uma caixa. Com 7 caixas saem 35: sobram **3**.' },
          ],
          linha: { tex: '38 \\div 5 = 7 \\text{, resto } 3', fala: 'trinta e oito dividido por cinco é sete, resto três' },
        },
        {
          pergunta: 'Quantas caixas comprar?',
          opcoes: [
            { texto: '8', certa: true, explica: 'Isso. Os 3 azulejos que faltam vêm numa caixa a mais. Sobram 2 para guardar.' },
            { texto: '7', erro: 'ignora-contexto-do-resto', explica: 'Com 7 caixas, faltam 3 azulejos na parede. O resto pede mais uma caixa: **8**.' },
          ],
          linha: { tex: '7 + 1 = 8 \\text{ caixas}', fala: 'sete mais uma, oito caixas' },
        },
      ],
      esboco: 'Os três movimentos: quantos cabem, o que sobra, o que fazer com o que sobra.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: com **R$ 50**, quantos pacotes de café de **R$ 8** você compra? Anote também o troco.',
      fala: 'No papel: com cinquenta reais, quantos pacotes de café de oito reais você compra? Anote também o troco.',
      resposta: 6,
      resolucao: [
        { tex: '8 \\times 6 = 48', fala: 'oito vezes seis é quarenta e oito' },
        { tex: '50 - 48 = 2', fala: 'cinquenta menos quarenta e oito é dois' },
        { tex: '50 \\div 8 = 6 \\text{, resto } 2', fala: 'cinquenta dividido por oito é seis, resto dois' },
        { tex: '\\text{6 pacotes, e sobram 2 reais de troco}', fala: 'seis pacotes, e sobram dois reais de troco' },
      ],
      esboco: 'Aqui o resto vira troco. O aluno digita os pacotes; a resolução mostra o troco.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['resto-n1', 'resto-n2', 'resto-n3'],
      esboco: 'Nível 1: quanto sobra, com o retângulo na tela. Nível 2: decidir se o resto pede mais um grupo ou fica de fora. Nível 3: números até cerca de 100, perguntas misturadas.',
    },
    {
      tipo: 'fecho',
      texto: 'São **4** vans: 3 cheias e uma para as 2 que sobraram. Na próxima aula: dividir números grandes, como $612 \\div 6$.',
      fala: 'São quatro vans: três cheias e uma para as duas que sobraram. Na próxima aula: dividir números grandes, como seiscentos e doze dividido por seis.',
      visual: ret({ ...VANS, linhas: 4 }, 'As 4 vans partem, a última com 2 pessoas e 6 lugares vazios.'),
      esboco: 'Responder ao gancho com a quarta van. A conta grande do fecho abre a divisão longa.',
    },
  ],
}
