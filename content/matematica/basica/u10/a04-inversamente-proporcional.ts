import type { Aula, Visual } from '@/lib/formation/schema'

// Inversamente proporcional. Mais torneiras enchem a caixa-d'água mais
// depressa: quando uma grandeza dobra, a outra cai pela metade. Na tabela de
// proporção, a seta de cima diz × 2 e a de baixo, ÷ 2 (na direta, as duas
// diziam × 2). O que fica igual em toda coluna é o produto: 1 × 12 = 2 × 6.
// Os erros a desmontar: usar a regra de três direta na inversa (com o dobro
// de torneiras, o dobro de horas) e pensar aditivamente (3 torneiras a mais,
// 3 horas a menos).

const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })

const TORNEIRAS = { rotulo: 'torneiras', valores: [1, 2, 4, 8] }
const HORAS = { rotulo: 'horas', valores: [12, 6, 3, '1,5'] }
/** × 2 em cima e ÷ 2 embaixo, de cada coluna para a seguinte. */
const DOBRA = [0, 1, 2].flatMap((i) => [
  { de: i, para: i + 1, rotulo: '× 2' },
  { de: i, para: i + 1, rotulo: '÷ 2', embaixo: true },
])
const GANCHO = { linhas: [{ rotulo: 'torneiras', valores: [1, 4] }, { rotulo: 'horas', valores: [12, '?'] }] }
const QUATRO = (horas: number | string) => ({
  linhas: [{ rotulo: 'torneiras', valores: [1, 4] }, { rotulo: 'horas', valores: [12, horas] }],
  setas: [{ de: 0, para: 1, rotulo: '× 4' }, { de: 0, para: 1, rotulo: '÷ 4', embaixo: true }],
})
const VIAGEM = (tempo: number | string) => ({
  linhas: [{ rotulo: 'velocidade (km/h)', valores: [60, 90] }, { rotulo: 'tempo (h)', valores: [3, tempo] }],
})

export const aula: Aula = {
  id: 'B.U10.A4',
  titulo: 'Inversamente proporcional',
  objetivo: 'Reconhecer quando duas grandezas são inversamente proporcionais (uma multiplicada, a outra dividida pelo mesmo número), ver que o produto das duas não muda e usar isso para achar o valor que falta, sem cair na regra de três direta.',
  modelo: 'livre',
  esboco: 'Abre na caixa-d\'água: 1 torneira enche em 12 horas; com 4, quanto tempo? O aluno aposta e depois dobra as torneiras na tabela de proporção, coluna por coluna. Momento-chave: as setas dizem × 2 em cima e ÷ 2 embaixo, ao contrário da proporção da aula anterior. Depois descobre o que não muda (torneiras × horas = 12), separa a inversa da direta e usa o produto na viagem (60 km/h por 3 h = 180 km) e no muro dos pedreiros.',
  vega: 'Ideia central: duas grandezas são inversamente proporcionais quando, se uma é multiplicada por um número, a outra é dividida por ele. O produto das duas fica constante: 1 torneira × 12 h = 2 × 6 = 4 × 3 = 12 (as 12 "horas de torneira" que a caixa pede). Exemplos: torneiras e tempo, pessoas e a parte de cada uma, velocidade e tempo para a mesma distância, trabalhadores e dias para a mesma obra. Para achar o que falta: calcule o produto (o que não muda) e divida pelo valor novo. Erros esperados: regra de três direta (4 torneiras, 48 h; a 90 km/h, 4,5 h), pensar aditivamente (3 torneiras a mais, 3 horas a menos: 9 h), achar que toda relação em que uma cresce e a outra diminui é inversa (só é inversa se o produto não muda). Guie com "Com mais torneiras, a caixa enche mais rápido ou mais devagar?", "O que fica igual nas duas situações?", "Confira: o produto deu o mesmo?". Pressupõe que o ritmo é o mesmo (torneiras iguais, pedreiros no mesmo ritmo).',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Com **1 torneira**, a caixa-d\'água enche em **12 horas**. Com **4 torneiras** iguais, em quanto tempo ela enche?',
      fala: 'Com uma torneira, a caixa-d\'água enche em doze horas. Com quatro torneiras iguais, em quanto tempo ela enche?',
      visual: tab(GANCHO, 'A tabela de proporção com duas colunas: em cima, torneiras 1 e 4; embaixo, horas 12 e um "?" âmbar tracejado.'),
      esboco: 'Uma situação de casa. Quem aprendeu a regra de três na aula anterior tende a fazer 12 × 4.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Mais torneiras, mais água por hora. Aposte: com 4 torneiras, quantas horas?',
      fala: 'Mais torneiras, mais água por hora. Aposte: com quatro torneiras, quantas horas?',
      visual: tab(GANCHO, 'A mesma tabela, com o "?" piscando.'),
      opcoes: [
        {
          texto: '3 horas', certa: true,
          explica: 'Isso. Cada torneira faz um quarto do trabalho: $12 \\div 4 = 3$.',
          fala: 'Isso. Cada torneira faz um quarto do trabalho: doze dividido por quatro é três.',
          mostra: tab(QUATRO(3), 'O 3 entra no lugar do "?". Em cima aparece a seta × 4; embaixo, a seta ÷ 4.'),
        },
        {
          texto: '48 horas', erro: 'regra-de-tres-direta-na-inversa',
          explica: 'Seria assim se mais torneiras atrasassem. Com mais água entrando, a caixa enche mais rápido.',
          mostra: tab(QUATRO(3), 'As setas × 4 em cima e ÷ 4 embaixo: as horas diminuem, chegam a 3.'),
        },
        {
          texto: '9 horas', erro: 'pensa-aditivamente',
          explica: '3 torneiras a mais não tiram só 3 horas. Com 4 torneiras, entra 4 vezes mais água por hora.',
          fala: 'Três torneiras a mais não tiram só três horas. Com quatro torneiras, entra quatro vezes mais água por hora.',
          mostra: tab(QUATRO(3), 'As setas × 4 e ÷ 4: a conta é de vezes, não de mais e menos.'),
        },
      ],
      esboco: 'Os dois erros da unidade nas opções: a regra de três direta e o pensamento aditivo.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora dobre as torneiras, coluna por coluna, e veja o que acontece com as horas.',
      visual: tab({ linhas: [TORNEIRAS, HORAS], setas: DOBRA, completar: true, mostradas: 1 }, 'A tabela com 4 colunas; só a primeira (1 torneira, 12 horas) aparece. As outras são caixas vazias, a próxima com um "+".'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para completar a tabela.',
        sucesso: { colunas: 4 },
        mostre: 'As colunas se preenchem uma a uma: 2 torneiras, 6 horas; 4, 3 horas; 8, 1,5 hora. Em cima, × 2; embaixo, ÷ 2.',
      },
      descoberta: 'Quando as torneiras dobram, as horas caem pela metade. As setas dizem × 2 em cima e ÷ 2 embaixo, ao contrário da proporção direta.',
      esboco: 'O momento-chave: a cada toque entram a coluna nova e as duas setas que chegam nela, × 2 em cima e ÷ 2 embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em toda coluna, uma conta dá sempre o mesmo resultado. Qual?',
      visual: tab({ linhas: [TORNEIRAS, HORAS], setas: DOBRA }, 'A tabela completa do Mexa, com as setas.'),
      opcoes: [
        {
          texto: 'torneiras × horas', certa: true,
          explica: 'Isso. $1 \\times 12$, $2 \\times 6$, $4 \\times 3$: sempre 12. São 12 horas de trabalho de uma torneira.',
          fala: 'Isso. Um vezes doze, dois vezes seis, quatro vezes três: sempre doze. São doze horas de trabalho de uma torneira.',
          mostra: tab({ linhas: [TORNEIRAS, HORAS, { rotulo: 'torneiras × horas', valores: [12, 12, 12, 12] }] }, 'Uma terceira linha aparece embaixo: 12, 12, 12, 12.'),
        },
        {
          texto: 'torneiras + horas', erro: 'pensa-aditivamente',
          explica: '$1 + 12 = 13$, mas $2 + 6 = 8$. A soma muda; o que fica igual é o produto: 12.',
          fala: 'Um mais doze é treze, mas dois mais seis é oito. A soma muda; o que fica igual é o produto: doze.',
          mostra: tab({ linhas: [TORNEIRAS, HORAS, { rotulo: 'torneiras + horas', valores: [13, 8, 7, '9,5'] }] }, 'A terceira linha com as somas: 13, 8, 7, 9,5. Cada uma diferente.'),
        },
        {
          texto: 'horas ÷ torneiras',
          explica: '$12 \\div 1 = 12$, mas $6 \\div 2 = 3$. Essa conta muda a cada coluna.',
          fala: 'Doze dividido por um é doze, mas seis dividido por dois é três. Essa conta muda a cada coluna.',
        },
      ],
      esboco: 'Na direta, o que não muda é a divisão; na inversa, é o produto.',
    },
    {
      tipo: 'anote',
      titulo: 'Inversamente proporcional',
      definicao: 'Duas grandezas são inversamente proporcionais quando uma é multiplicada por um número e a outra é dividida por ele. O produto não muda.',
      exemplo: { tex: '1 \\times 12 = 2 \\times 6 = 4 \\times 3 = 12', fala: 'um vezes doze, dois vezes seis e quatro vezes três: todos dão doze' },
      alerta: 'Na inversa, a regra de três direta erra: com o dobro de torneiras, as horas não dobram, caem pela metade.',
      esboco: 'A página do caderno com a tabela das torneiras desenhada, × 2 em cima e ÷ 2 embaixo, e o produto 12 ao lado.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual destes pares é inversamente proporcional?',
      visual: tab({ linhas: [TORNEIRAS, HORAS], setas: DOBRA }, 'A tabela das torneiras, como lembrete.'),
      opcoes: [
        {
          texto: 'As pessoas e as fatias de cada uma, numa pizza de 8 fatias', certa: true,
          explica: 'Isso. Com o dobro de pessoas, cada uma come metade: $2 \\times 4 = 4 \\times 2 = 8$.',
          fala: 'Isso. Com o dobro de pessoas, cada uma come metade: dois vezes quatro e quatro vezes dois dão oito.',
          mostra: tab({ linhas: [{ rotulo: 'pessoas', valores: [2, 4, 8] }, { rotulo: 'fatias de cada', valores: [4, 2, 1] }], setas: [0, 1].flatMap((i) => [{ de: i, para: i + 1, rotulo: '× 2' }, { de: i, para: i + 1, rotulo: '÷ 2', embaixo: true }]) }, 'A tabela da pizza: pessoas 2, 4, 8 e fatias 4, 2, 1, com × 2 em cima e ÷ 2 embaixo.'),
        },
        {
          texto: 'Os quilos de arroz e o preço a pagar',
          explica: 'Com o dobro de quilos, você paga o dobro: × 2 em cima e × 2 embaixo. Essa é a direta.',
          fala: 'Com o dobro de quilos, você paga o dobro: vezes dois em cima e vezes dois embaixo. Essa é a direta.',
          mostra: tab({ linhas: [{ rotulo: 'arroz (kg)', valores: [1, 2, 4] }, { rotulo: 'preço (R$)', valores: [6, 12, 24] }], setas: [0, 1].flatMap((i) => [{ de: i, para: i + 1, rotulo: '× 2' }, { de: i, para: i + 1, rotulo: '× 2', embaixo: true }]) }, 'A tabela do arroz: 1, 2, 4 kg e R$ 6, 12, 24, com × 2 em cima e embaixo.'),
        },
        {
          texto: 'A idade e a altura de uma pessoa',
          explica: 'Esses nem são proporcionais: dobrar a idade não dobra nem divide a altura.',
        },
      ],
      esboco: 'Separar a inversa da direta e do que não é proporção nenhuma. A tabela de cada opção mostra as setas.',
    },
    {
      tipo: 'passo',
      problema: 'A **60 km/h**, uma viagem leva **3 h**. A **90 km/h**, na mesma estrada, quanto tempo ela leva?',
      fala: 'A sessenta quilômetros por hora, uma viagem leva três horas. A noventa, na mesma estrada, quanto tempo ela leva?',
      visual: tab(VIAGEM('?'), 'A tabela da viagem: velocidade 60 e 90, tempo 3 e "?".'),
      passos: [
        {
          pergunta: 'O que não muda entre as duas viagens?',
          opcoes: [
            { texto: 'A distância: $60 \\times 3 = 180$ km', fala: 'A distância: sessenta vezes três, cento e oitenta quilômetros', certa: true, explica: 'Isso. A estrada é a mesma: 180 km, a 60 km por hora durante 3 horas.' },
            { texto: 'O tempo: 3 h', explica: 'O tempo muda: indo mais rápido, você chega antes. O que fica é a estrada.' },
          ],
          linha: { tex: '60 \\times 3 = 180 \\text{ km}', fala: 'sessenta vezes três é cento e oitenta quilômetros' },
        },
        {
          pergunta: 'A 90 km/h, quantas horas para os mesmos 180 km?',
          fala: 'A noventa quilômetros por hora, quantas horas para os mesmos cento e oitenta quilômetros?',
          opcoes: [
            { texto: '2 h', certa: true, explica: 'Isso. $180 \\div 90 = 2$. E $90 \\times 2 = 180$: o produto não mudou.', fala: 'Isso. Cento e oitenta dividido por noventa é dois. E noventa vezes dois é cento e oitenta: o produto não mudou.', mostra: tab({ ...VIAGEM(2), destaque: [1] }, 'O 2 entra no lugar do "?", e a segunda coluna ganha moldura âmbar.') },
            { texto: '4,5 h', erro: 'regra-de-tres-direta-na-inversa', explica: 'Essa é a regra de três direta. Mais rápido, a viagem encurta: tem de dar menos que 3 h.' },
          ],
          linha: { tex: '180 \\div 90 = 2 \\text{ h}', fala: 'cento e oitenta dividido por noventa são duas horas' },
        },
      ],
      esboco: 'O produto ganha sentido: velocidade × tempo é a distância, que não muda.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: **6 pedreiros** fazem um muro em **10 dias**. Em quantos dias **4 pedreiros**, no mesmo ritmo, fazem o muro?',
      fala: 'No papel: seis pedreiros fazem um muro em dez dias. Em quantos dias quatro pedreiros, no mesmo ritmo, fazem o muro?',
      resposta: 15,
      resolucao: [
        { tex: '6 \\times 10 = 60', fala: 'seis vezes dez: o muro pede sessenta dias de trabalho de um pedreiro' },
        { tex: '60 \\div 4 = 15 \\text{ dias}', fala: 'sessenta dividido por quatro são quinze dias' },
        { tex: '4 \\times 15 = 60', fala: 'confere: quatro vezes quinze é sessenta' },
      ],
      esboco: 'O sentido contrário: menos pedreiros, mais dias. Quem faz a direta acha 6,67 dias, menos do que 10.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['inversa-n1', 'inversa-n2', 'inversa-n3'],
      esboco: 'Nível 1: o dobro ou o triplo, com a tabela e a seta de cima. Nível 2: menos trabalhadores, ou um fator que não é inteiro (6 para 4). Nível 3: velocidade e tempo, ou quantos operários para um prazo, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Com 4 torneiras, a caixa enche em **3 horas**: 4 vezes as torneiras, um quarto do tempo. Na próxima aula: a taxa unitária.',
      fala: 'Com quatro torneiras, a caixa enche em três horas: quatro vezes as torneiras, um quarto do tempo. Na próxima aula: a taxa unitária.',
      visual: tab(QUATRO(3), 'A tabela do gancho, completa: 1 e 4 torneiras, 12 e 3 horas, com × 4 em cima e ÷ 4 embaixo.'),
      esboco: 'Responde ao gancho com a tabela.',
    },
  ],
}
