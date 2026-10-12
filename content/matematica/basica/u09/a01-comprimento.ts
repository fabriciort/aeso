import type { Aula, Visual } from '@/lib/formation/schema'

// Comprimento e o sistema métrico. Os nomes das unidades dizem o tamanho:
// quilo é mil, centi é centésimo (como o centavo), mili é milésimo. Cada
// unidade vale 10 vezes a da direita, então o quadro de unidades é o quadro
// das casas da unidade 1 com outros nomes: converter é andar com a vírgula.
// Os erros a desmontar: o fator errado (1 m = 10 cm), o sentido errado
// (35 cm = 3.500 m), os zeros postos depois da vírgula (1,500 cm) e a conta
// com unidades misturadas (2 m − 35 cm).

const COMP = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm']
const quadro = (medida: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'quadro-posicional', estado: { medida: { casas: COMP, ...medida } }, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const METRO = { de: 0, ate: 1, passo: 0.1, marcas: [0, 1], unidade: 'm' }

export const aula: Aula = {
  id: 'B.U9.A1',
  titulo: 'Comprimento e o sistema métrico',
  objetivo: 'Converter medidas de comprimento entre km, m, cm e mm, sabendo o que cada prefixo quer dizer e andando com a vírgula no quadro de unidades.',
  modelo: 'quadro-posicional',
  esboco: 'Começa na trena: 1 m tem 100 cm porque centi é centésimo, como o centavo. Depois o quadro de unidades (km hm dam m dm cm mm) aparece como o velho quadro das casas: cada casa vale 10 vezes a da direita. Momento-chave: o aluno toca no cm e a vírgula de 1,5 m pula duas casas, com um zero âmbar surgindo no cm: 150 cm. Depois o sentido contrário (35 cm = 0,35 m, 750 m = 0,75 km) e a conta com unidades misturadas.',
  vega: 'Ideia central: o sistema métrico é o sistema decimal com nomes. Os prefixos dizem o tamanho: quilo = 1.000, hecto = 100, deca = 10, deci = 1/10, centi = 1/100 (como o centavo do real), mili = 1/1.000. Cada unidade vale 10 vezes a da direita, então converter é andar com a vírgula uma casa por unidade, completando com zeros. Para uma unidade menor, o número cresce; para uma maior, diminui. Erros esperados: fator errado (1 m = 10 cm, 1,5 m = 150 mm); sentido errado (35 cm = 3.500 m); pôr zeros depois da vírgula (1,5 × 100 = 1,500); fazer conta com unidades diferentes (2 m − 35 cm = 33). Guie com "A unidade de chegada é maior ou menor?", "Quantas casas há entre as duas?", "O resultado tem cara de verdade?". hm, dam e dm quase não se usam no dia a dia; aparecem no quadro só para as casas ficarem contínuas. Em Sua vez, peça para dizer antes se o número vai crescer ou diminuir.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A bancada da cozinha vai ter **1,5 m**. A marcenaria pede a medida em centímetros. Quantos centímetros são?',
      fala: 'A bancada da cozinha vai ter um metro e meio. A marcenaria pede a medida em centímetros. Quantos centímetros são?',
      visual: reta({ de: 0, ate: 2, passo: 0.1, marcas: [0, 1, 2], numero: 1.5, unidade: 'm' }, 'Uma trena aberta: a reta de 0 a 2 m com um traço a cada 10 cm e um ponto âmbar em 1,5 m, a ponta da bancada.'),
      esboco: 'Uma conta de obra que todo mundo já precisou fazer. A pergunta fica aberta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Comece pelo metro inteiro. Quantos centímetros cabem em **1 m**?',
      fala: 'Comece pelo metro inteiro. Quantos centímetros cabem em um metro?',
      visual: reta(METRO, 'A reta de 0 a 1 m, como um metro de carpinteiro, com 10 traços grandes.'),
      opcoes: [
        {
          texto: '100 cm', certa: true,
          explica: 'Isso. **Centi** quer dizer centésimo: 1 cm é 1 dos 100 pedaços do metro, como o centavo no real.',
          mostra: reta({ ...METRO, passo: 0.01 }, 'Entre cada traço grande nascem 10 tracinhos: 100 tracinhos de 1 cm no metro.'),
        },
        {
          texto: '10 cm', erro: 'fator-de-conversao-errado',
          explica: '10 cm é um palmo pequeno: um destes 10 pedaços. O metro tem 10 deles, $10 \\times 10 = 100$ cm.',
          mostra: reta({ ...METRO, saltos: [[0, 0.1, '10 cm']] }, 'Um arco âmbar cobre só o primeiro dos 10 pedaços do metro: 10 cm. Faltam outros 9 iguais.'),
        },
        {
          texto: '1.000 cm', erro: 'fator-de-conversao-errado',
          explica: '1.000 é o que cabe de **milímetros**, os tracinhos menores da trena. O centímetro é maior: cabem 100.',
          mostra: reta({ ...METRO, passo: 0.01 }, 'Os 100 tracinhos de 1 cm no metro. O milímetro seria 10 vezes menor que cada um.'),
        },
      ],
      esboco: 'O centavo é a ponte: centi = centésimo. Os tracinhos da trena desmontam o 10 e o 1.000.',
    },
    {
      tipo: 'ideia',
      texto: 'É o quadro das casas da unidade 1, com nomes de medida: cada casa vale **10 vezes** a da direita.',
      fala: 'É o quadro das casas da unidade 1, com nomes de medida: cada casa vale dez vezes a da direita.',
      visual: { ...quadro({ numero: '1', de: 'm' }, 'O quadro de unidades: km hm dam m dm cm mm, com o 1 na casa do m e "1 m" embaixo. A casa do m fica acesa.'), movimento: 'A reta encolhe e some; o quadro entra no lugar, com o 1 caindo na casa do m.' },
      esboco: 'É o quadro posicional da unidade 1, com nomes de medida no lugar de M C D U. hm, dam e dm quase não se usam, mas ficam no quadro para as casas seguirem de 10 em 10. Proposta: escrever 1.000 m, 1/100 m e 1/1.000 m pequenos embaixo de km, cm e mm (o quadro de unidades ainda não tem essa chave).',
    },
    {
      tipo: 'mexa',
      texto: 'No quadro, a vírgula fica depois da unidade. Para ver **1,5 m** em centímetros, leve a vírgula até o **cm**.',
      fala: 'No quadro, a vírgula fica depois da unidade. Para ver um vírgula cinco metro em centímetros, leve a vírgula até o centímetro.',
      visual: quadro({ numero: '1,5', de: 'm' }, 'O 1 na casa do m, o 5 no dm e a vírgula âmbar entre os dois. As casas são tocáveis.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na casa do cm.',
        sucesso: { para: 'cm' },
        mostre: 'A vírgula pula duas casas para a direita, um 0 âmbar aparece no cm e a leitura vira 1,5 m = 150 cm.',
      },
      descoberta: 'Do m ao cm são 2 casas: × 100. A vírgula anda 2 casas e o zero que falta aparece: 1,5 m = 150 cm.',
      esboco: 'O momento-chave. O zero que surge sozinho no cm mostra que ninguém "põe zeros": a vírgula anda e a casa vazia pede o 0.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E em milímetros? **1,5 m** são quantos mm?',
      fala: 'E em milímetros? Um vírgula cinco metro são quantos milímetros?',
      visual: quadro({ numero: '1,5', de: 'm', para: 'cm' }, 'O quadro com 1,5 m = 150 cm. A casa do mm, vazia, à direita.'),
      opcoes: [
        {
          texto: '1.500 mm', certa: true,
          explica: 'Isso. Do m ao mm são 3 casas: a vírgula anda 3 e entram dois zeros.',
          mostra: quadro({ numero: '1,5', de: 'm', para: 'mm' }, 'A vírgula anda mais uma casa, um segundo 0 âmbar aparece no mm: 1,5 m = 1.500 mm.'),
        },
        {
          texto: '150 mm', erro: 'fator-de-conversao-errado',
          explica: '150 é o que dá em cm. O mm fica uma casa adiante: mais um zero, 1.500 mm.',
          mostra: quadro({ numero: '1,5', de: 'm', para: 'mm' }, 'A vírgula sai do cm e anda até o mm: 1.500.'),
        },
        {
          texto: '1,500 mm', erro: 'acrescenta-zeros-no-decimal',
          explica: 'Zeros no fim, depois da vírgula, não mudam nada: 1,500 ainda é 1,5. Quem anda é a vírgula.',
          mostra: quadro({ numero: '1,5', de: 'm', para: 'mm' }, 'A vírgula pula três casas e os zeros entram antes dela: 1.500 mm.'),
        },
      ],
      esboco: 'Mais uma casa, mais um zero. A isca 1,500 é o "põe três zeros" decorado.',
    },
    {
      tipo: 'anote',
      titulo: 'O sistema métrico',
      definicao: 'Os nomes dizem o tamanho: **quilo** = 1.000, **centi** = 1/100, **mili** = 1/1.000. Converter é andar com a vírgula, uma casa por unidade.',
      exemplo: { tex: '1{,}5 \\text{ m} = 150 \\text{ cm} = 1.500 \\text{ mm}', fala: 'um vírgula cinco metro são cento e cinquenta centímetros, ou mil e quinhentos milímetros' },
      alerta: 'Unidade **menor**: o número cresce. Unidade **maior**: o número diminui. Confira se a medida tem cara de verdade.',
      esboco: 'Na página: o quadro km hm dam m dm cm mm, com 1,5 m e a vírgula pulando até o cm. Embaixo, km = 1.000 m, cm = 1/100 m, mm = 1/1.000 m.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A fita métrica da costureira marcou **35 cm**. Em metros, isso é…',
      fala: 'A fita métrica da costureira marcou trinta e cinco centímetros. Em metros, isso é…',
      visual: quadro({ numero: '35', de: 'cm' }, 'O 3 no dm e o 5 no cm. A casa do m, vazia, à esquerda.'),
      opcoes: [
        {
          texto: '0,35 m', certa: true,
          explica: 'Isso. O metro é maior: cabe menos dele. A vírgula anda 2 casas para a esquerda e o 0 guarda o m.',
          mostra: quadro({ numero: '35', de: 'cm', para: 'm' }, 'A vírgula volta duas casas, até depois do m. Um 0 âmbar aparece no m: 35 cm = 0,35 m.'),
        },
        {
          texto: '3.500 m', erro: 'converte-no-sentido-errado',
          explica: '3.500 m são três quilômetros e meio! A fita de 35 cm não chega a 1 m.',
          mostra: reta({ ...METRO, numero: 0.35 }, 'Na reta de 0 a 1 m, o ponto 0,35 fica perto do começo: bem menos que 1 m.'),
        },
        {
          texto: '3,5 m', erro: 'fator-de-conversao-errado',
          explica: '3,5 m é mais alto que uma porta. Do cm ao m são 2 casas, não 1: 0,35 m.',
          mostra: quadro({ numero: '35', de: 'cm', para: 'm' }, 'A vírgula conta duas casas para a esquerda, cm até m: 0,35.'),
        },
      ],
      esboco: 'O sentido contrário. A pergunta "tem cara de verdade?" desmonta o 3.500 sem conta nenhuma.',
    },
    {
      tipo: 'mexa',
      texto: 'A caminhada da manhã teve **750 m**. Para ver em quilômetros, leve a vírgula até o **km**.',
      fala: 'A caminhada da manhã teve setecentos e cinquenta metros. Para ver em quilômetros, leve a vírgula até o quilômetro.',
      visual: quadro({ numero: '750', de: 'm' }, 'O 7 no hm, o 5 no dam e o 0 no m. O km vazio à esquerda.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na casa do km.',
        sucesso: { para: 'km' },
        mostre: 'A vírgula anda três casas para a esquerda, um 0 âmbar aparece no km: 750 m = 0,75 km.',
      },
      descoberta: 'Do m ao km são 3 casas para a esquerda: ÷ 1.000. 750 m = 0,75 km, três quartos de quilômetro.',
      esboco: 'Agora o aluno escolhe sozinho o lado. O 0 do km aparece, e o 0 do fim some da leitura: 0,750 = 0,75.',
    },
    {
      tipo: 'passo',
      problema: 'Você comprou **2 m** de fio e usou **35 cm**. Quanto sobrou?',
      fala: 'Você comprou dois metros de fio e usou trinta e cinco centímetros. Quanto sobrou?',
      visual: reta({ de: 0, ate: 2, passo: 0.1, marcas: [0, 1, 2], unidade: 'm', saltos: [[2, 1.65, '−35 cm']] }, 'A reta de 0 a 2 m. Um arco volta de 2 m e para um pouco depois do 1,6.'),
      passos: [
        {
          pergunta: 'Primeiro, as duas medidas na mesma unidade. 2 m são…',
          fala: 'Primeiro, as duas medidas na mesma unidade. Dois metros são…',
          opcoes: [
            { texto: '200 cm', certa: true, explica: 'Isso. Cada metro tem 100 cm.' },
            { texto: '20 cm', erro: 'fator-de-conversao-errado', explica: '20 cm é um palmo. Cada metro tem 100 cm: 200 cm.' },
            { texto: 'Não precisa: faço 2 − 35', erro: 'mistura-unidades', explica: 'O 2 conta metros e o 35, centímetros. Antes da conta, a mesma unidade.' },
          ],
          linha: { tex: '2 \\text{ m} = 200 \\text{ cm}', fala: 'dois metros são duzentos centímetros' },
        },
        {
          pergunta: 'Agora a conta.',
          fala: 'Agora a conta.',
          opcoes: [
            { texto: '200 − 35 = 165 cm', certa: true, explica: 'Isso. 200 − 30 = 170, e 170 − 5 = 165.' },
            { texto: '200 − 35 = 235 cm', erro: 'subtrai-menor-do-maior', explica: 'Sobrou mais do que tinha? Nas colunas de zero, é preciso desagrupar: 165.' },
          ],
          linha: { tex: '200 - 35 = 165 \\text{ cm}', fala: 'duzentos menos trinta e cinco são cento e sessenta e cinco centímetros' },
        },
        {
          pergunta: 'Em metros, sobraram…',
          fala: 'Em metros, sobraram…',
          opcoes: [
            { texto: '1,65 m', certa: true, explica: 'Isso. A vírgula volta 2 casas: 1 metro e 65 centímetros.' },
            { texto: '16,5 m', erro: 'fator-de-conversao-errado', explica: '16,5 m é mais do que os 2 m comprados. Do cm ao m são 2 casas: 1,65.' },
          ],
          linha: { tex: '165 \\text{ cm} = 1{,}65 \\text{ m}', fala: 'cento e sessenta e cinco centímetros são um vírgula sessenta e cinco metro' },
        },
      ],
      esboco: 'Converter primeiro, contar depois. O arco na reta mostra que sobrou pouco mais de 1,6 m.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: a estrada até o sítio tem **2,4 km**. Quantos metros são?',
      fala: 'No papel: a estrada até o sítio tem dois vírgula quatro quilômetros. Quantos metros são?',
      resposta: 2400,
      resolucao: [
        { tex: '\\text{km} \\to \\text{m}: 3 \\text{ casas}, \\times 1.000', fala: 'do quilômetro ao metro são três casas: vezes mil' },
        { tex: '2{,}4 \\times 1.000 = 2.400', fala: 'dois vírgula quatro vezes mil são dois mil e quatrocentos' },
        { tex: '2{,}4 \\text{ km} = 2.400 \\text{ m}', fala: 'dois vírgula quatro quilômetros são dois mil e quatrocentos metros' },
      ],
      esboco: 'Na resolução, o quadro com 2,4 km e a vírgula pulando até o m, com dois zeros âmbar.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['comprimento-n1', 'comprimento-n2', 'comprimento-n3'],
      esboco: 'Nível 1: para uma unidade menor, com o quadro na tela. Nível 2: para uma unidade maior, com os zeros que pegam (5 cm = 0,05 m). Nível 3: somar ou tirar medidas em unidades diferentes, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'A bancada tem **1,5 m = 150 cm**: a vírgula andou duas casas. Na próxima aula, o mesmo quadro pesa e mede líquidos.',
      fala: 'A bancada tem um metro e meio, cento e cinquenta centímetros: a vírgula andou duas casas. Na próxima aula, o mesmo quadro pesa e mede líquidos.',
      visual: quadro({ numero: '1,5', de: 'm', para: 'cm' }, 'O quadro do Mexa: 1,5 m = 150 cm, com o 0 âmbar no cm.'),
      esboco: 'Responde ao gancho com o quadro que o aluno mexeu.',
    },
  ],
}
