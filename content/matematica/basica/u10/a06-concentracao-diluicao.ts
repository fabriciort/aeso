import type { Aula, Visual } from '@/lib/formation/schema'

// Concentração e diluição. A concentração é uma taxa unitária: quantos mg
// de soluto em cada mL. Diluir é pôr água: o soluto fica, o volume cresce e
// a concentração cai na mesma razão. Na tabela, volume e concentração são
// inversamente proporcionais (× 2 em cima, ÷ 2 embaixo), e o soluto, no
// meio, não muda: concentração × volume antes = concentração × volume
// depois (C₁ × V₁ = C₂ × V₂, sem as letras). A barra mostra o mesmo
// concentrado espalhado numa jarra maior. Os erros a desmontar: achar que
// diluir muda o soluto, usar a regra de três direta (mais água, mais forte)
// e contar a água como o volume final inteiro.
//
// Contextos de exercício, sem recomendação de uso: o xarope só é lido no
// rótulo, e a diluição é feita com suco, sal e água sanitária para limpeza.

const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })

const SUCO = barra(
  { barras: [{ partes: 1, pintadas: 1, rotulo: '200 mL' }, { partes: 1, pintadas: 1, inteiros: 5, rotulo: '1 L' }], escala: 5 },
  'Duas barras na mesma escala. Em cima, a de 200 mL, toda em âmbar: o concentrado. Embaixo, a jarra de 1 L, 5 vezes mais comprida, com os mesmos 200 mL em âmbar e o resto (a água) vazio.',
)
const XAROPE = (mg: number | string) => ({ linhas: [{ rotulo: 'xarope (mL)', valores: [1, 5] }, { rotulo: 'remédio (mg)', valores: [20, mg] }], fator: '× 20' })
const FRASCO = (mgml: number | string, completo: boolean) => ({
  linhas: [
    { rotulo: 'volume (mL)', valores: [50, 200] },
    ...(completo ? [{ rotulo: 'sal (mg)', valores: [1000, 1000] }] : []),
    { rotulo: 'mg/mL', valores: [20, mgml] },
  ],
  setas: [{ de: 0, para: 1, rotulo: '× 4' }, ...(completo ? [{ de: 0, para: 1, rotulo: '÷ 4', embaixo: true }] : [])],
})
const PREPARO = (forte: number | string) => ({
  linhas: [
    { rotulo: 'volume (mL)', valores: [forte, 250] },
    ...(forte === '?' ? [] : [{ rotulo: 'soluto (mg)', valores: [2000, 2000] }]),
    { rotulo: 'mg/mL', valores: [40, 8] },
  ],
})

export const aula: Aula = {
  id: 'B.U10.A6',
  titulo: 'Concentração e diluição',
  objetivo: 'Ler uma concentração em mg/mL como taxa unitária, calcular quanto soluto há num volume e, numa diluição, manter o soluto: achar a nova concentração, o volume da solução forte e a água a juntar.',
  modelo: 'barra',
  esboco: 'Abre na jarra de suco: 200 mL de concentrado e água até 1 L; o suco fica mais fraco, mas o concentrado é o mesmo? A barra mostra os 200 mL espalhados em 1 L. O mg/mL entra como taxa unitária, lendo o rótulo de um xarope. Momento-chave: na tabela do sal, o aluno põe água coluna por coluna; o volume dobra, a concentração cai pela metade e os 100 mg de sal, no meio, não mudam. Depois: concentração × volume não muda, o preparo de uma solução fraca a partir de uma forte, e a água sanitária no balde.',
  vega: 'Ideia central: concentração é quanto soluto (a substância dissolvida) há em cada unidade de volume: soluto ÷ volume, em mg/mL. É uma taxa unitária, como o preço por kg. Diluir é acrescentar solvente (água): a quantidade de soluto não muda, o volume aumenta e a concentração diminui na mesma razão. Volume e concentração são inversamente proporcionais, e o produto deles é o soluto: C₁ × V₁ = C₂ × V₂ (a aula diz isso sem letras: concentração vezes volume, antes e depois). Erros esperados: achar que diluir muda a quantidade de soluto (ou multiplicar a concentração pelo fator do volume: 4 vezes mais água, 4 vezes mais forte); somar em vez de multiplicar (20 mg/mL em 5 mL dá 25 mg); contar a água a juntar como o volume final inteiro. Guie com "A água trouxe ou tirou soluto?", "O volume aumentou quantas vezes?", "Confira: a concentração vezes o volume dá o mesmo antes e depois?". Cuidados: a aula é de matemática, não orienta doses nem preparo de remédios; o xarope só aparece na leitura do rótulo. A água sanitária comum tem de 2,0 % a 2,5 % de cloro ativo, perto de 20 a 25 mg/mL (confira no rótulo); o exercício usa 25 mg/mL. Contexto de saúde e de laboratório marcado para revisão por um farmacêutico.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na jarra vão **200 mL** de suco concentrado e água até **1 L**. O suco fica mais fraco. Mas o concentrado não é o mesmo?',
      fala: 'Na jarra vão duzentos mililitros de suco concentrado e água até um litro. O suco fica mais fraco. Mas o concentrado não é o mesmo?',
      visual: barra({ barras: [{ partes: 1, pintadas: 1, rotulo: '200 mL' }], escala: 5 }, 'Uma barra curta, toda em âmbar, com "200 mL" ao lado: o concentrado, antes da água. A barra ocupa um quinto da largura.'),
      esboco: 'Uma situação de cozinha, sem risco. A pergunta fica aberta até a aposta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Depois da água, quanto suco concentrado há na jarra?',
      visual: barra({ barras: [{ partes: 1, pintadas: 1, rotulo: '200 mL' }], escala: 5 }, 'A barra do concentrado, como no gancho.'),
      opcoes: [
        {
          texto: '200 mL, espalhados em 1 L', certa: true,
          explica: 'Isso. A água não tira nem põe suco. Os 200 mL ficam, só que em mais volume.',
          fala: 'Isso. A água não tira nem põe suco. Os duzentos mililitros ficam, só que em mais volume.',
          mostra: SUCO,
        },
        {
          texto: '1 L', erro: 'diluir-muda-o-soluto',
          explica: '1 L é a jarra toda, com 800 mL de água. Concentrado, só os 200 mL que você pôs.',
          fala: 'Um litro é a jarra toda, com oitocentos mililitros de água. Concentrado, só os duzentos que você pôs.',
          mostra: SUCO,
        },
        {
          texto: 'Menos de 200 mL', erro: 'diluir-muda-o-soluto',
          explica: 'Nenhum suco saiu da jarra. Ele ficou mais espalhado, não menos.',
          mostra: SUCO,
        },
      ],
      esboco: 'A barra de baixo é 5 vezes mais comprida, mas o âmbar continua do mesmo tamanho: o momento em que "mais fraco" ganha forma.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Num rótulo, **20 mg/mL** quer dizer 20 mg do remédio em cada mL. Quantos mg há em **5 mL** desse xarope?',
      fala: 'Num rótulo, vinte miligramas por mililitro quer dizer vinte miligramas do remédio em cada mililitro. Quantos miligramas há em cinco mililitros desse xarope?',
      visual: tab(XAROPE('?'), 'A tabela do xarope: 1 mL e 5 mL em cima, 20 mg e "?" embaixo. À direita, a seta × 20.'),
      opcoes: [
        {
          texto: '100 mg', certa: true,
          explica: 'Isso. 5 mL com 20 mg cada: $5 \\times 20 = 100$. O mg/mL é uma taxa unitária.',
          fala: 'Isso. Cinco mililitros com vinte miligramas cada: cinco vezes vinte, cem. O miligrama por mililitro é uma taxa unitária.',
          mostra: tab(XAROPE(100), 'O 100 entra no lugar do "?".'),
        },
        {
          texto: '25 mg', erro: 'soma-no-lugar-de-multiplicar',
          explica: 'Somar não serve: cada um dos 5 mL tem 20 mg. São $5 \\times 20 = 100$ mg.',
          fala: 'Somar não serve: cada um dos cinco mililitros tem vinte miligramas. São cinco vezes vinte, cem miligramas.',
          mostra: tab(XAROPE(100), 'A seta × 20 acende e o 100 entra no lugar do "?".'),
        },
        {
          texto: '4 mg', erro: 'operacao-trocada',
          explica: '4 mg é menos do que há em 1 mL só. Em 5 mL há mais: $5 \\times 20$.',
          fala: 'Quatro miligramas é menos do que há em um mililitro só. Em cinco mililitros há mais: cinco vezes vinte.',
          mostra: tab(XAROPE(100), 'A seta × 20 acende e o 100 entra no lugar do "?".'),
        },
      ],
      esboco: 'Só a leitura do rótulo, como conta. A taxa unitária da aula anterior, agora em mg/mL.',
    },
    {
      tipo: 'mexa',
      texto: 'No laboratório, **5 mL** de solução têm **100 mg** de sal: 20 mg/mL. Ponha água e complete a tabela.',
      fala: 'No laboratório, cinco mililitros de solução têm cem miligramas de sal: vinte miligramas por mililitro. Ponha água e complete a tabela.',
      visual: tab(
        {
          linhas: [
            { rotulo: 'volume (mL)', valores: [5, 10, 20] },
            { rotulo: 'sal (mg)', valores: [100, 100, 100] },
            { rotulo: 'mg/mL', valores: [20, 10, 5] },
          ],
          setas: [0, 1].flatMap((i) => [{ de: i, para: i + 1, rotulo: '× 2' }, { de: i, para: i + 1, rotulo: '÷ 2', embaixo: true }]),
          completar: true,
          mostradas: 1,
        },
        'A tabela com três linhas (volume, sal, mg/mL) e três colunas; só a primeira aparece: 5 mL, 100 mg, 20 mg/mL. As outras são caixas vazias.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para pôr água.',
        sucesso: { colunas: 3 },
        mostre: 'As colunas se preenchem: 10 mL, 100 mg, 10 mg/mL; 20 mL, 100 mg, 5 mg/mL. Em cima, × 2; embaixo, ÷ 2.',
      },
      descoberta: 'O sal fica em 100 mg. O volume dobra e a concentração cai pela metade: volume e concentração são inversamente proporcionais.',
      esboco: 'O momento-chave: a linha do meio repete 100, 100, 100, enquanto as setas dizem × 2 em cima e ÷ 2 embaixo, como as torneiras da aula 4.',
    },
    {
      tipo: 'anote',
      titulo: 'Concentração e diluição',
      definicao: 'Concentração é quanto soluto, a substância dissolvida, há em cada mL: soluto ÷ volume. Diluir é pôr água: o soluto fica igual.',
      exemplo: { tex: '100 \\text{ mg} \\div 20 \\text{ mL} = 5 \\text{ mg/mL}', fala: 'cem miligramas divididos por vinte mililitros dão cinco miligramas por mililitro' },
      alerta: 'Diluir não muda o soluto. Com 4 vezes o volume, a concentração vai a um quarto, não a 4 vezes.',
      esboco: 'A página do caderno com a tabela do sal: volume × 2, sal igual, concentração ÷ 2.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um frasco tem **50 mL** de solução de sal a **20 mg/mL**. Com água, ela vai a **200 mL**. Quantos mg/mL fica?',
      fala: 'Um frasco tem cinquenta mililitros de solução de sal a vinte miligramas por mililitro. Com água, ela vai a duzentos mililitros. Quantos miligramas por mililitro fica?',
      visual: tab(FRASCO('?', false), 'A tabela: volume 50 e 200, com × 4 em cima; mg/mL 20 e "?".'),
      opcoes: [
        {
          texto: '5 mg/mL', certa: true,
          explica: 'Isso. O volume foi a 4 vezes; a concentração, a um quarto: $20 \\div 4 = 5$.',
          fala: 'Isso. O volume foi a quatro vezes; a concentração, a um quarto: vinte dividido por quatro, cinco.',
          mostra: tab(FRASCO(5, true), 'Entra a linha do sal no meio, 1.000 e 1.000 mg, e a seta ÷ 4 embaixo. O 5 no lugar do "?".'),
        },
        {
          texto: '80 mg/mL', erro: 'regra-de-tres-direta-na-inversa',
          explica: '80 seria mais forte, e só entrou água. A água enfraquece: volume × 4, concentração ÷ 4.',
          fala: 'Oitenta seria mais forte, e só entrou água. A água enfraquece: volume vezes quatro, concentração dividida por quatro.',
          mostra: tab(FRASCO(5, true), 'A linha do sal, 1.000 e 1.000 mg, e a seta ÷ 4 embaixo: a concentração cai para 5.'),
        },
        {
          texto: '20 mg/mL',
          explica: 'A água não tem sal, mas ocupa lugar: os mesmos mg ficam em mais mL. A concentração cai.',
          fala: 'A água não tem sal, mas ocupa lugar: os mesmos miligramas ficam em mais mililitros. A concentração cai.',
          mostra: tab(FRASCO(5, true), 'A linha do sal, 1.000 e 1.000 mg, e a seta ÷ 4 embaixo: a concentração cai para 5.'),
        },
      ],
      esboco: 'A diluição como proporção inversa, com um fator que não é 2.',
    },
    {
      tipo: 'ideia',
      texto: 'O sal é o mesmo antes e depois: $20 \\times 50 = 5 \\times 200 = 1.000$ mg. Concentração vezes volume não muda.',
      fala: 'O sal é o mesmo antes e depois: vinte vezes cinquenta e cinco vezes duzentos dão mil miligramas. Concentração vezes volume não muda.',
      visual: tab(FRASCO(5, true), 'A tabela completa do frasco, com a linha do sal no meio: 1.000 e 1.000 mg.'),
      esboco: 'É o C₁ × V₁ = C₂ × V₂ dos livros, dito em palavras: o produto da inversa, que aqui é o soluto.',
    },
    {
      tipo: 'passo',
      problema: 'No laboratório há uma solução de **40 mg/mL**. Você quer **250 mL** a **8 mg/mL**. Quantos mL da solução forte entram?',
      fala: 'No laboratório há uma solução de quarenta miligramas por mililitro. Você quer duzentos e cinquenta mililitros a oito. Quantos mililitros da solução forte entram?',
      visual: tab(PREPARO('?'), 'A tabela com duas colunas, a forte e a fraca: volume "?" e 250 mL; mg/mL 40 e 8.'),
      passos: [
        {
          pergunta: 'Quantos mg de soluto vão nos 250 mL a 8 mg/mL?',
          fala: 'Quantos miligramas de soluto vão nos duzentos e cinquenta mililitros a oito miligramas por mililitro?',
          opcoes: [
            { texto: '$8 \\times 250 = 2.000$ mg', fala: 'oito vezes duzentos e cinquenta, dois mil miligramas', certa: true, explica: 'Isso. 250 mL, com 8 mg em cada.' },
            { texto: '$8 + 250 = 258$ mg', erro: 'soma-no-lugar-de-multiplicar', explica: 'Cada um dos 250 mL leva 8 mg: multiplique.', fala: 'Cada um dos duzentos e cinquenta mililitros leva oito miligramas: multiplique.' },
          ],
          linha: { tex: '8 \\times 250 = 2.000 \\text{ mg}', fala: 'oito vezes duzentos e cinquenta são dois mil miligramas' },
        },
        {
          pergunta: 'Em quantos mL da solução forte cabem esses 2.000 mg?',
          fala: 'Em quantos mililitros da solução forte cabem esses dois mil miligramas?',
          opcoes: [
            { texto: '50 mL', certa: true, explica: 'Isso. $2.000 \\div 40 = 50$. Confira: $40 \\times 50 = 2.000$.', fala: 'Isso. Dois mil dividido por quarenta é cinquenta. Confira: quarenta vezes cinquenta, dois mil.', mostra: tab(PREPARO(50), 'O 50 entra no lugar do "?" e aparece a linha do soluto, 2.000 e 2.000 mg.') },
            { texto: '1.250 mL', erro: 'regra-de-tres-direta-na-inversa', explica: '1.250 mL é mais que os 250 mL que você quer. A forte é mais forte: entra menos dela.', fala: 'Mil duzentos e cinquenta é mais que os duzentos e cinquenta que você quer. A forte é mais forte: entra menos dela.' },
          ],
          linha: { tex: '2.000 \\div 40 = 50 \\text{ mL}', fala: 'dois mil dividido por quarenta são cinquenta mililitros' },
        },
        {
          pergunta: 'E quanta água completa os 250 mL?',
          fala: 'E quanta água completa os duzentos e cinquenta mililitros?',
          opcoes: [
            { texto: '200 mL', certa: true, explica: 'Isso. $50 + 200 = 250$ mL, com os mesmos 2.000 mg.', fala: 'Isso. Cinquenta mais duzentos dão duzentos e cinquenta mililitros, com os mesmos dois mil miligramas.' },
            { texto: '250 mL', erro: 'esquece-volume-do-concentrado', explica: 'Com 250 mL de água, o total iria a 300 mL. Os 50 mL da forte já contam.', fala: 'Com duzentos e cinquenta de água, o total iria a trezentos mililitros. Os cinquenta da forte já contam.' },
          ],
          linha: { tex: '250 - 50 = 200 \\text{ mL de água}', fala: 'duzentos e cinquenta menos cinquenta são duzentos mililitros de água' },
        },
      ],
      esboco: 'O preparo em três passos: o soluto que a solução fraca pede, o volume da forte que o carrega, e a água que falta.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: **20 mL** de água sanitária, com **25 mg/mL** de cloro, vão num balde com água até **1 L**. Quantos mg/mL fica?',
      fala: 'No papel: vinte mililitros de água sanitária, com vinte e cinco miligramas de cloro por mililitro, vão num balde com água até um litro. Quantos miligramas por mililitro fica?',
      resposta: '0,5',
      resolucao: [
        { tex: '25 \\times 20 = 500 \\text{ mg de cloro}', fala: 'vinte e cinco vezes vinte são quinhentos miligramas de cloro' },
        { tex: '1 \\text{ L} = 1.000 \\text{ mL}', fala: 'um litro são mil mililitros' },
        { tex: '500 \\div 1.000 = 0{,}5 \\text{ mg/mL}', fala: 'quinhentos dividido por mil é zero vírgula cinco miligrama por mililitro' },
      ],
      esboco: 'Junta a aula: o soluto (taxa × volume), a conversão de litro (unidade 9) e a nova concentração. Confere: o volume foi a 50 vezes, e 25 ÷ 50 = 0,5.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['concentracao-n1', 'concentracao-n2', 'concentracao-n3'],
      esboco: 'Nível 1: ler a concentração (mg num volume, ou mg/mL), com a tabela. Nível 2: diluir por um fator inteiro, achando a nova concentração ou o soluto que ficou. Nível 3: concentração × volume com fatores quaisquer: a nova concentração, o volume da forte ou a água a juntar, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Os **200 mL** de concentrado ficaram em 1 L: o suco ficou 5 vezes mais fraco. Na próxima unidade: porcentagem.',
      fala: 'Os duzentos mililitros de concentrado ficaram em um litro: o suco ficou cinco vezes mais fraco. Na próxima unidade: porcentagem.',
      visual: SUCO,
      esboco: 'Responde ao gancho com a barra e fecha a unidade. A missão "Preparar uma solução" junta as seis aulas.',
    },
  ],
}
