import type { Aula, Visual } from '@/lib/formation/schema'

// Massa e capacidade. O grama e o litro usam os mesmos nomes do metro: kg é
// mil gramas, mL é um milésimo do litro, mg é um milésimo do grama. O quadro
// de unidades é o mesmo da aula 1. A grade da unidade 8 vira uma caixa de
// leite: 100 quadradinhos de 10 mL, e 250 mL são 0,25 L. Os erros a
// desmontar: o fator errado (× 100 onde é × 1.000), o sentido errado
// (500 mg = 500.000 g) e o µg, que é mais uma volta de "mili".

const MASSA = ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg']
const CAP = ['kL', 'hL', 'daL', 'L', 'dL', 'cL', 'mL']
const quadro = (casas: string[], medida: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { medida: { casas, ...medida } }, esboco })
const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })

export const aula: Aula = {
  id: 'B.U9.A2',
  titulo: 'Massa e capacidade',
  objetivo: 'Converter massas (kg, g, mg, µg) e capacidades (L, mL) com o quadro de unidades, sabendo que de kg para g, de g para mg e de L para mL o fator é 1.000.',
  modelo: 'quadro-posicional',
  esboco: 'Abre na cozinha: a receita pede 250 mL e a caixa de leite tem 1 L. A grade da unidade 8 vira a caixa: cada quadradinho é 10 mL. O aluno pinta 25 quadradinhos e vê 0,25 aparecer embaixo. Momento-chave: 250 mL = 0,25 L é o mesmo 0,25 dos 25 centavos, e o quadro de unidades do litro mostra a vírgula andando 3 casas. Depois o pacote de café (0,5 kg = 500 g), o comprimido de 500 mg e o micrograma.',
  vega: 'Ideia central: massa (quanto pesa) se mede em gramas; capacidade (quanto cabe), em litros. Os prefixos são os mesmos do metro, então 1 kg = 1.000 g, 1 g = 1.000 mg, 1 mg = 1.000 µg e 1 L = 1.000 mL. Em todos esses pares, a vírgula anda 3 casas. Erros esperados: usar 100 no lugar de 1.000 (2,5 kg = 250 g; 250 mL = 2,5 L); converter no sentido errado (500 mg = 500.000 g); pôr zeros depois da vírgula. Guie com "Quantos gramas tem 1 kg?", "A unidade de chegada é maior ou menor?", "Quantas casas a vírgula anda?". Os remédios são exemplos de conversão, não de dose: dose quem define é o médico ou o farmacêutico (contexto de saúde: revisar com farmacêutico). µg se lê micrograma; às vezes aparece mcg na embalagem. Em Sua vez, peça para dizer o fator antes da conta.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A receita pede **250 mL** de leite. A caixa tem **1 L**. Que pedaço da caixa vai na receita?',
      fala: 'A receita pede duzentos e cinquenta mililitros de leite. A caixa tem um litro. Que pedaço da caixa vai na receita?',
      visual: grade({ pintadas: 0, rotulo: '1 L' }, 'A grade 10 × 10 vazia, com cara de caixa de leite, e "1 L" embaixo.'),
      esboco: 'Cozinha de verdade: o copo medidor marca mL, a caixa diz L.',
    },
    {
      tipo: 'mexa',
      texto: 'A grade é **1 L**, que tem 1.000 mL. Cada quadradinho é **10 mL**. Pinte os **250 mL** da receita.',
      fala: 'A grade é um litro, que tem mil mililitros. Cada quadradinho é dez mililitros. Pinte os duzentos e cinquenta mililitros da receita.',
      visual: grade({ pintadas: 0, pintar: true, separar: true }, 'A grade vazia. Um toque pinta até aquele quadradinho, coluna por coluna. O número embaixo anda: 0,1, 0,2, 0,25.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no quadradinho até onde quer pintar: 25 quadradinhos.',
        sucesso: { pintadas: 25 },
        mostre: 'Duas colunas e 5 quadradinhos se pintam: 250 mL. Embaixo, 0,25.',
      },
      descoberta: '250 mL são 25 quadradinhos de 10 mL: um quarto da caixa. Embaixo aparece 0,25, a parte do litro.',
      esboco: 'A ponte com a unidade 8: o mesmo desenho dos 25 centavos, agora com leite.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Então **250 mL**, em litros, é…',
      fala: 'Então duzentos e cinquenta mililitros, em litros, é…',
      visual: grade({ pintadas: 25, separar: true, semRotulo: true }, 'A grade com 2 colunas âmbar e 5 quadradinhos verdes, sem o número.'),
      opcoes: [
        {
          texto: '0,25 L', certa: true,
          explica: 'Isso. 25 dos 100 quadradinhos: 0,25 da caixa, um quarto do litro.',
          mostra: grade({ pintadas: 25, separar: true, rotulo: '0,25 L' }, 'Embaixo aparece 0,25 L.'),
        },
        {
          texto: '2,5 L', erro: 'fator-de-conversao-errado',
          explica: '2,5 L são duas caixas e meia. A receita usa só um pedaço de uma caixa.',
          mostra: grade({ pintadas: 250, rotulo: '2,5 L' }, 'Duas grades cheias e meia, com 2,5 L embaixo: bem mais que a receita.'),
        },
        {
          texto: '250 L', erro: 'converte-no-sentido-errado',
          explica: '250 L enchem uma caixa-d’água pequena! O litro é maior que o mL: o número diminui.',
        },
      ],
      esboco: 'As duas iscas desmontadas pelo tamanho: duas caixas e meia, ou uma caixa-d’água.',
    },
    {
      tipo: 'ideia',
      texto: 'O litro usa os nomes do metro: **mili** é milésimo. Por isso a vírgula anda **3 casas**, do L até o mL.',
      fala: 'O litro usa os nomes do metro: mili é milésimo. Por isso a vírgula anda três casas, do litro até o mililitro.',
      visual: { ...quadro(CAP, { numero: '250', de: 'mL', para: 'L' }, 'O quadro de unidades do litro: kL hL daL L dL cL mL. O 2, o 5 e o 0 nas três casas depois do L, e um 0 âmbar no L: 250 mL = 0,25 L.'), movimento: 'A grade encolhe e vira o quadro; o 0,25 que estava embaixo dela desliza para dentro das casas.' },
      esboco: 'O mesmo 0,25, agora no quadro. O aluno reconhece o quadro da aula passada com outros nomes.',
    },
    {
      tipo: 'mexa',
      texto: 'Com gramas é igual. O pacote de café tem **0,5 kg**. Leve a vírgula até o **g** para ver em gramas.',
      fala: 'Com gramas é igual. O pacote de café tem meio quilo. Leve a vírgula até o grama para ver em gramas.',
      visual: quadro(MASSA, { numero: '0,5', de: 'kg' }, 'O quadro de unidades da massa: kg hg dag g dg cg mg. O 0 no kg e o 5 no hg. As casas são tocáveis.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na casa do g.',
        sucesso: { para: 'g' },
        mostre: 'A vírgula anda três casas para a direita, dois 0 âmbar aparecem no dag e no g: 0,5 kg = 500 g.',
      },
      descoberta: 'Do kg ao g são 3 casas: × 1.000. Meio quilo são 500 g.',
      esboco: 'O quadro troca de nomes e o gesto é o mesmo da aula 1. Os dois zeros âmbar mostram de onde vêm as centenas.',
    },
    {
      tipo: 'anote',
      titulo: 'Massa e capacidade',
      definicao: '**Massa** se mede em gramas; **capacidade**, em litros. Com os nomes do metro: 1 kg = 1.000 g, 1 g = 1.000 mg, 1 L = 1.000 mL.',
      exemplo: { tex: '250 \\text{ mL} = 0{,}25 \\text{ L}', fala: 'duzentos e cinquenta mililitros são zero vírgula vinte e cinco litro' },
      alerta: 'Do kg ao g, do g ao mg e do L ao mL são **3 casas**: × 1.000, e não × 100.',
      esboco: 'Na página: os dois quadros, um embaixo do outro (kg … mg e kL … mL), com 0,5 kg = 500 g e 250 mL = 0,25 L.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A caixa do remédio diz **500 mg** por comprimido. Quantos gramas é isso?',
      fala: 'A caixa do remédio diz quinhentos miligramas por comprimido. Quantos gramas é isso?',
      visual: quadro(MASSA, { numero: '500', de: 'mg' }, 'O 5 no dg, os dois 0 no cg e no mg. O g vazio à esquerda.'),
      opcoes: [
        {
          texto: '0,5 g', certa: true,
          explica: 'Isso. Do mg ao g são 3 casas para a esquerda: 500 mg é meio grama.',
          mostra: quadro(MASSA, { numero: '500', de: 'mg', para: 'g' }, 'A vírgula volta três casas, até depois do g. Um 0 âmbar aparece no g: 500 mg = 0,5 g.'),
        },
        {
          texto: '5 g', erro: 'fator-de-conversao-errado',
          explica: '5 g seriam 5.000 mg: dez vezes mais. Num remédio, esse erro é grave. Do mg ao g são 3 casas.',
          mostra: quadro(MASSA, { numero: '500', de: 'mg', para: 'g' }, 'A vírgula conta três casas, mg até g: 0,5.'),
        },
        {
          texto: '500.000 g', erro: 'converte-no-sentido-errado',
          explica: 'Isso pesaria meia tonelada! O grama é maior que o mg: o número diminui.',
        },
      ],
      esboco: 'Saúde: o lugar onde a conversão precisa ser certa. O quadro mostra as 3 casas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Mais uma volta do mili: 1 mg = **1.000 µg** (micrograma). Um comprimido de **0,05 mg** tem quantos µg?',
      fala: 'Mais uma volta do mili: um miligrama são mil microgramas. Um comprimido de zero vírgula zero cinco miligrama tem quantos microgramas?',
      visual: { modelo: 'livre', estado: { atalho: '1 mg', destino: '1.000 µg' }, esboco: 'Dois cartões ligados por uma seta: 1 mg → 1.000 µg. O µg é o mg partido em mil.' },
      opcoes: [
        {
          texto: '50 µg', certa: true,
          explica: 'Isso. × 1.000: a vírgula anda 3 casas. 0,05 vira 50.',
        },
        {
          texto: '5 µg', erro: 'fator-de-conversao-errado',
          explica: '5 µg são só 0,005 mg. Do mg ao µg são 3 casas, não 2: 50 µg.',
        },
        {
          texto: '500 µg', erro: 'conta-zeros-errado',
          explica: '500 µg são 0,5 mg: dez vezes o comprimido. A vírgula de 0,05 anda 3 casas e para em 50.',
        },
      ],
      esboco: 'O micrograma aparece em vitaminas e hormônios. É a mesma regra uma casa de mil mais para baixo.',
    },
    {
      tipo: 'passo',
      problema: 'Uma garrafa de **2 L** de suco. Quantos copos de **250 mL** ela enche?',
      fala: 'Uma garrafa de dois litros de suco. Quantos copos de duzentos e cinquenta mililitros ela enche?',
      visual: grade({ pintadas: 200, rotulo: '2 L' }, 'Duas grades cheias, lado a lado: os 2 litros. Cada grade é a caixa de 1 L da receita.'),
      passos: [
        {
          pergunta: 'Primeiro, a mesma unidade. 2 L são…',
          fala: 'Primeiro, a mesma unidade. Dois litros são…',
          opcoes: [
            { texto: '2.000 mL', certa: true, explica: 'Isso. Cada litro tem 1.000 mL.' },
            { texto: '200 mL', erro: 'fator-de-conversao-errado', explica: '200 mL não enchem nem um copo. Cada litro tem 1.000 mL: 2.000 mL.' },
          ],
          linha: { tex: '2 \\text{ L} = 2.000 \\text{ mL}', fala: 'dois litros são dois mil mililitros' },
        },
        {
          pergunta: 'Quantos copos de 250 mL cabem em 2.000 mL?',
          fala: 'Quantos copos de duzentos e cinquenta mililitros cabem em dois mil mililitros?',
          opcoes: [
            { texto: '$2.000 \\div 250 = 8$', certa: true, explica: 'Isso. 4 copos por litro, e são 2 litros: 8 copos.' },
            { texto: '$2.000 \\div 250 = 80$', erro: 'conta-zeros-errado', explica: '80 copos de 250 mL dariam 20 L. Confira: $8 \\times 250 = 2.000$.' },
            { texto: '$2 \\div 250$: não cabe nenhum', erro: 'mistura-unidades', explica: 'O 2 conta litros e o 250, mL. Na mesma unidade: 2.000 ÷ 250.' },
          ],
          linha: { tex: '2.000 \\div 250 = 8 \\text{ copos}', fala: 'dois mil dividido por duzentos e cinquenta são oito copos' },
        },
      ],
      esboco: 'Converter primeiro, dividir depois. Proposta: cada bloco de 25 quadradinhos acender como um copo, 4 em cada grade (a grade ainda não marca blocos separados).',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: o bolo pede **0,75 kg** de farinha. Quantos gramas são?',
      fala: 'No papel: o bolo pede zero vírgula setenta e cinco quilo de farinha. Quantos gramas são?',
      resposta: 750,
      resolucao: [
        { tex: '\\text{kg} \\to \\text{g}: 3 \\text{ casas}, \\times 1.000', fala: 'do quilo ao grama são três casas: vezes mil' },
        { tex: '0{,}75 \\times 1.000 = 750', fala: 'zero vírgula setenta e cinco vezes mil são setecentos e cinquenta' },
        { tex: '0{,}75 \\text{ kg} = 750 \\text{ g}', fala: 'zero vírgula setenta e cinco quilo são setecentos e cinquenta gramas' },
      ],
      esboco: 'Na resolução, o quadro da massa com 0,75 kg e a vírgula pulando até o g, com um 0 âmbar.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['massa-capacidade-n1', 'massa-capacidade-n2', 'massa-capacidade-n3'],
      esboco: 'Nível 1: kg para g e L para mL, com o quadro na tela. Nível 2: para a unidade maior, com os zeros que pegam (50 mL = 0,05 L). Nível 3: cozinha e farmácia, sem desenho (copos na garrafa, comprimidos, µg).',
    },
    {
      tipo: 'fecho',
      texto: 'A receita leva **250 mL = 0,25 L**: um quarto da caixa. Na próxima aula: quanto piso cobre o chão da sala.',
      fala: 'A receita leva duzentos e cinquenta mililitros, zero vírgula vinte e cinco litro: um quarto da caixa. Na próxima aula: quanto piso cobre o chão da sala.',
      visual: grade({ pintadas: 25, separar: true, rotulo: '0,25 L' }, 'A grade do gancho, agora com 0,25 L pintado.'),
      esboco: 'Responde ao gancho com a caixa pintada.',
    },
  ],
}
