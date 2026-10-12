import type { Aula, Visual } from '@/lib/formation/schema'

// Variações sucessivas: uma porcentagem depois da outra. Cada variação age
// sobre o valor novo, então os fatores da aula 3 se multiplicam: dois
// descontos de 20 % são × 0,8 × 0,8 = × 0,64, um desconto de 36 %, não de
// 40 %. Na grade da TV (cada quadradinho vale R$ 10), o segundo desconto
// tira 16 quadradinhos dos 80 que sobraram, não 20. Subir 10 % e cair 10 %
// dá × 1,1 × 0,9 = × 0,99: não volta ao mesmo. E a diferença entre duas
// taxas se mede em pontos percentuais (de 10 % para 12 %: 2 pontos), que
// não é o aumento em porcentagem (2 em 10: 20 %).

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })

const TV = grade({ pintadas: 100, rotulo: 'R$ 1.000' }, 'A grade cheia, os 100 quadradinhos em âmbar, com "R$ 1.000" embaixo. Cada quadradinho vale R$ 10.')
const OITENTA = grade({ pintadas: 80, rotulo: 'R$ 800' }, 'A grade com 80 quadradinhos pintados, "R$ 800" embaixo: o preço depois do primeiro desconto.')
const DESCONTOS = {
  linhas: [
    { rotulo: 'preço (R$)', valores: [1000, 800, 640] },
    { rotulo: 'do preço inicial', valores: ['100 %', '80 %', '64 %'] },
  ],
  setas: [
    { de: 0, para: 1, rotulo: '× 0,8' },
    { de: 1, para: 2, rotulo: '× 0,8' },
    { de: 0, para: 2, rotulo: '× 0,64', embaixo: true },
  ],
}
const SOBE_DESCE = (fim: number | string) => tab(
  {
    linhas: [{ rotulo: 'preço (R$)', valores: [200, 220, fim] }],
    setas: [
      { de: 0, para: 1, rotulo: '× 1,1' },
      { de: 1, para: 2, rotulo: '× 0,9' },
      ...(fim === '?' ? [] : [{ de: 0, para: 2, rotulo: '× 0,99', embaixo: true }]),
    ],
  },
  fim === '?'
    ? 'A tabela do preço: R$ 200, R$ 220 depois de × 1,1, e "?" depois de × 0,9.'
    : 'O 198 entra no lugar do "?". Embaixo, uma seta do começo ao fim: × 0,99.',
)
const JUROS = grade(
  { grades: [{ pintadas: 10, rotulo: '10 %' }, { pintadas: 12, rotulo: '12 %' }] },
  'Duas grades lado a lado: 10 quadradinhos pintados (10 %) e 12 quadradinhos pintados (12 %). A diferença é de 2 quadradinhos.',
)

export const aula: Aula = {
  id: 'B.U11.A5',
  titulo: 'Variações sucessivas',
  objetivo: 'Calcular variações sucessivas multiplicando os fatores, ver que porcentagens seguidas não se somam e que subir e cair a mesma porcentagem não volta ao mesmo valor, e distinguir ponto percentual de porcentagem.',
  modelo: 'grade',
  esboco: 'Abre na loja: a TV de R$ 1.000 com 20 % de desconto e mais 20 % no caixa. Dá 40 %? Na grade, cada quadradinho é R$ 10. O aluno vê os 80 que ficaram depois do primeiro desconto e pinta o que sobra depois do segundo. Momento-chave: o segundo desconto tira 16 quadradinhos, não 20, porque é 20 % de 80. Na tabela, os fatores × 0,8 e × 0,8 viram × 0,64 direto. Depois: o preço que sobe 10 % e cai 10 % e não volta, e os juros que vão de 10 % para 12 % (2 pontos percentuais, um aumento de 20 %). Fecha com o "50 % + 20 %" da Black Friday.',
  vega: 'Ideia central: em variações sucessivas, cada porcentagem age sobre o valor que já mudou, então os fatores se multiplicam. Dois descontos de 20 %: × 0,8 × 0,8 = × 0,64; paga-se 64 % do preço, um desconto de 36 %. Subir 10 % e cair 10 %: × 1,1 × 0,9 = × 0,99, 1 % a menos que o começo. Ponto percentual é a diferença entre duas porcentagens (de 10 % para 12 %: 2 pontos percentuais); a variação em porcentagem é essa diferença dividida pela taxa de antes (2 ÷ 10 = 20 %). Erros esperados: somar as porcentagens (20 % + 20 % = 40 %; "50 % + 20 %" = 70 %); achar que subir e cair 10 % volta ao mesmo; dizer que os juros "subiram 2 %". Guie com "O segundo desconto é 20 % de quanto?", "Os dois 10 % são do mesmo valor?", "2 a mais em cima de quanto?". Preços e taxas são de exercício, sem fonte; a aula mostra a conta, não recomenda compras.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A TV de **R$ 1.000** tem **20 %** de desconto, e no caixa ganha mais **20 %**. Você paga 40 % a menos?',
      fala: 'A TV de mil reais tem vinte por cento de desconto, e no caixa ganha mais vinte por cento. Você paga quarenta por cento a menos?',
      visual: TV,
      esboco: 'Uma promoção de loja comum. A soma 20 + 20 puxa a resposta errada.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Aposte: quanto você paga pela TV no fim?',
      visual: TV,
      opcoes: [
        {
          texto: 'R$ 640', certa: true,
          explica: 'Boa aposta. Depois do primeiro desconto, a TV custa R$ 800. Veja na grade o que o segundo tira.',
          fala: 'Boa aposta. Depois do primeiro desconto, a TV custa oitocentos reais. Veja na grade o que o segundo tira.',
          mostra: OITENTA,
        },
        {
          texto: 'R$ 600: 40 % a menos', erro: 'soma-porcentagens-sucessivas',
          explica: 'O primeiro desconto deixa a TV em R$ 800. O segundo 20 % é de R$ 800, não de R$ 1.000.',
          fala: 'O primeiro desconto deixa a TV em oitocentos reais. O segundo vinte por cento é de oitocentos, não de mil.',
          mostra: OITENTA,
        },
        {
          texto: 'R$ 800',
          explica: 'R$ 800 é o preço depois do primeiro desconto. Ainda falta o segundo, no caixa.',
          fala: 'Oitocentos reais é o preço depois do primeiro desconto. Ainda falta o segundo, no caixa.',
          mostra: OITENTA,
        },
      ],
      esboco: 'Toda opção mostra a grade com 80 quadradinhos, o preço depois do primeiro desconto. O porquê do segundo vem no Mexa.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada quadradinho vale R$ 10. O 2º desconto tira 20 % **destes 80**. Pinte na grade da direita o que você paga.',
      fala: 'Cada quadradinho vale dez reais. O segundo desconto tira vinte por cento destes oitenta. Pinte na grade da direita o que você paga.',
      visual: grade(
        { grades: [{ pintadas: 80, rotulo: 'R$ 800' }, { pintadas: 0 }], ativa: 1, pintar: true },
        'Duas grades. A da esquerda com os 80 quadradinhos de R$ 800. A da direita vazia; um toque pinta até aquele quadradinho, e o número embaixo acompanha.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Tire 20 % de 80 e pinte o que sobra na grade da direita.',
        sucesso: { pintadas: 64 },
        mostre: 'A grade da direita se pinta até 64 quadradinhos: 80 menos 16. Embaixo, 0,64.',
      },
      descoberta: '20 % de 80 são 16 quadradinhos, não 20. Sobram 64: você paga R$ 640, 64 % do preço. O desconto total foi de 36 %, não de 40 %.',
      esboco: 'O momento-chave: o segundo desconto é menor que o primeiro, porque age sobre um preço menor. 10 % de 80 é 8; 20 % é 16.',
    },
    {
      tipo: 'mexa',
      texto: 'Com o fator da aula 3: cada desconto de 20 % é **× 0,8** no preço do momento. Complete a tabela.',
      fala: 'Com o fator da aula três: cada desconto de vinte por cento é vezes zero vírgula oito no preço do momento. Complete a tabela.',
      visual: tab({ ...DESCONTOS, completar: true, mostradas: 1 }, 'A tabela com a coluna do preço inicial (R$ 1.000, 100 %) e duas caixas vazias. As setas × 0,8 aparecem com cada coluna; no fim, × 0,64 embaixo, do começo ao fim.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para aplicar cada desconto.',
        sucesso: { colunas: 3 },
        mostre: 'As colunas se preenchem: R$ 800 (80 %) e R$ 640 (64 %). Embaixo aparece a seta × 0,64.',
      },
      descoberta: 'Os dois fatores viram um só: 0,8 × 0,8 = 0,64. Pagar 64 % é ter 36 % de desconto.',
      esboco: 'A seta de baixo, do começo ao fim, só aparece com a tabela completa: é a multiplicação dos fatores.',
    },
    {
      tipo: 'anote',
      titulo: 'Variações sucessivas',
      definicao: 'Em variações sucessivas, cada porcentagem age sobre o valor novo. Os fatores se multiplicam, não se somam.',
      exemplo: { tex: '0{,}8 \\times 0{,}8 = 0{,}64', fala: 'zero vírgula oito vezes zero vírgula oito dá zero vírgula sessenta e quatro: você paga sessenta e quatro por cento, um desconto de trinta e seis por cento' },
      alerta: 'Dois descontos de 20 % não dão 40 %: dão 36 %. Porcentagens seguidas não se somam.',
      esboco: 'A página do caderno com a tabela 1.000 → 800 → 640 e a seta × 0,64 embaixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um produto de **R$ 200** subiu **10 %** e, no mês seguinte, caiu **10 %**. Quanto custa agora?',
      fala: 'Um produto de duzentos reais subiu dez por cento e, no mês seguinte, caiu dez por cento. Quanto custa agora?',
      visual: SOBE_DESCE('?'),
      opcoes: [
        {
          texto: 'R$ 198', certa: true,
          explica: 'Isso. Caiu 10 % de R$ 220, que são R$ 22. Ficou R$ 2 abaixo do começo.',
          fala: 'Isso. Caiu dez por cento de duzentos e vinte, que são vinte e dois reais. Ficou dois reais abaixo do começo.',
          mostra: SOBE_DESCE(198),
        },
        {
          texto: 'R$ 200: voltou ao mesmo', erro: 'sobe-e-desce-volta-ao-mesmo',
          explica: 'A subida foi 10 % de R$ 200, R$ 20. A queda foi 10 % de R$ 220, R$ 22: tirou mais do que pôs.',
          fala: 'A subida foi dez por cento de duzentos, vinte reais. A queda foi dez por cento de duzentos e vinte, vinte e dois: tirou mais do que pôs.',
          mostra: SOBE_DESCE(198),
        },
        {
          texto: 'R$ 202',
          explica: 'Depois da subida, o preço é R$ 220. A queda de 10 % tira R$ 22 desses 220: fica R$ 198.',
          fala: 'Depois da subida, o preço é duzentos e vinte. A queda de dez por cento tira vinte e dois desses duzentos e vinte: fica cento e noventa e oito.',
          mostra: SOBE_DESCE(198),
        },
      ],
      esboco: 'A tabela mostra os dois fatores e, depois da escolha, a seta × 0,99 do começo ao fim: subir e cair 10 % deixa 1 % a menos.',
    },
    {
      tipo: 'passo',
      problema: 'Os juros do cartão eram de **10 %** ao mês e passaram a **12 %**. Quanto eles subiram?',
      fala: 'Os juros do cartão eram de dez por cento ao mês e passaram a doze por cento. Quanto eles subiram?',
      visual: JUROS,
      passos: [
        {
          pergunta: 'De 10 % para 12 %: qual é a diferença?',
          fala: 'De dez por cento para doze por cento: qual é a diferença?',
          opcoes: [
            { texto: '2 pontos percentuais', certa: true, explica: 'Isso. $12 - 10 = 2$. A diferença entre duas porcentagens se diz em **pontos percentuais**.', fala: 'Isso. Doze menos dez, dois. A diferença entre duas porcentagens se diz em pontos percentuais.' },
            { texto: '12 pontos percentuais', explica: '12 % é a taxa nova. A diferença é o que ela tem a mais: $12 - 10$.', fala: 'Doze por cento é a taxa nova. A diferença é o que ela tem a mais: doze menos dez.' },
          ],
          linha: { tex: '12\\,\\% - 10\\,\\% = 2 \\text{ pontos percentuais}', fala: 'doze por cento menos dez por cento são dois pontos percentuais' },
        },
        {
          pergunta: 'E os juros ficaram quantos por cento maiores?',
          opcoes: [
            { texto: '20 %', certa: true, explica: 'Isso. 2 a mais em cima de 10: $2 \\div 10 = 0{,}2$, 20 %. Os juros ficaram 20 % mais caros.', fala: 'Isso. Dois a mais em cima de dez: dois dividido por dez, zero vírgula dois, vinte por cento. Os juros ficaram vinte por cento mais caros.' },
            { texto: '2 %', erro: 'confunde-ponto-percentual', explica: '2 é a diferença em pontos. Comparado com os 10 % de antes, 2 é um quinto: 20 %.', fala: 'Dois é a diferença em pontos. Comparado com os dez por cento de antes, dois é um quinto: vinte por cento.' },
          ],
          linha: { tex: '2 \\div 10 = 0{,}2 = 20\\,\\%', fala: 'dois dividido por dez dá zero vírgula dois, vinte por cento' },
        },
      ],
      esboco: 'As duas grades: 10 e 12 quadradinhos. A diferença são 2 quadradinhos (2 pontos); comparados com os 10 de antes, são um quinto a mais (20 %), como o aumento da aula 4.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: a geladeira de **R$ 2.000** tem **10 %** de desconto e mais **5 %** no Pix. Quantos reais você paga?',
      fala: 'No papel: a geladeira de dois mil reais tem dez por cento de desconto e mais cinco por cento no Pix. Quantos reais você paga?',
      resposta: 1710,
      resolucao: [
        { tex: '2.000 \\times 0{,}9 = 1.800', fala: 'dois mil vezes zero vírgula nove são mil e oitocentos' },
        { tex: '1.800 \\times 0{,}95 = 1.710', fala: 'mil e oitocentos vezes zero vírgula noventa e cinco são mil setecentos e dez' },
      ],
      esboco: 'Dois fatores diferentes. Confere: 5 % de 1.800 é 90, e 1.800 − 90 = 1.710. O desconto total foi de 14,5 %, não de 15 %.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['variacoes-n1', 'variacoes-n2', 'variacoes-n3'],
      esboco: 'Nível 1: dois descontos seguidos num preço redondo, com a tabela e os fatores. Nível 2: sobe e cai a mesma porcentagem, ou juros que mudam de taxa (pontos percentuais × porcentagem), com visual. Nível 3: o desconto ou o aumento total de duas variações, em porcentagem, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Dois descontos de 20 % dão **36 %**. E o "50 % + 20 %" da Black Friday dá 60 %, não 70 %. Na próxima aula: juros.',
      fala: 'Dois descontos de vinte por cento dão trinta e seis por cento. E o cinquenta mais vinte por cento da Black Friday dá sessenta por cento, não setenta. Na próxima aula: juros.',
      visual: tab(DESCONTOS, 'A tabela completa da TV: 1.000, 800 e 640, com × 0,8 em cima e × 0,64 embaixo.'),
      esboco: 'Responde ao gancho e leva a ideia para a promoção mais famosa: 0,5 × 0,8 = 0,4, paga-se 40 %.',
    },
  ],
}
