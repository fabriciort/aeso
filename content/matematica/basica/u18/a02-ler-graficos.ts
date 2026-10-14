import type { Aula, Visual } from '@/lib/formation/schema'

// Ler gráficos. Barras, linhas e setores com a conta de luz e o salário de
// Marta. Nas barras e nas linhas, a altura é o valor, lido no eixo; na
// pizza, a fatia é a parte do todo. O momento-chave é o Mexa "apontar" na
// linha: o mês mais caro (junho) não é o do maior salto (maio, +40). A
// subida é a diferença de um mês para o outro, não a altura. Depois a pizza
// liga com a porcentagem da unidade 11 (40 % de R$ 2.000). Os erros a
// desmontar: ler o valor na marca mais perto, julgar a subida pela altura e
// tomar o 40 % por R$ 40.

const graf = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grafico', estado, esboco })

/** A conta de luz de Marta, em reais, de janeiro a junho. */
const LUZ = [['jan', 120], ['fev', 100], ['mar', 90], ['abr', 100], ['mai', 140], ['jun', 150]]
const BARRAS = { titulo: 'Conta de luz (R$)', dados: LUZ, eixoFim: 160, passo: 20, valores: false }
const LINHA = { ...BARRAS, tipo: 'linhas' }
/** O salário de R$ 2.000, em fatias: 40 %, 25 %, 15 %, 10 % e 10 %. */
const SALARIO = { tipo: 'setores', titulo: 'Salário: R$ 2.000', dados: [['aluguel', 800], ['comida', 500], ['transporte', 300], ['luz', 200], ['outros', 200]] }

export const aula: Aula = {
  id: 'B.U18.A2',
  titulo: 'Ler gráficos',
  objetivo: 'Ler valores em gráficos de barras e de linhas pelo eixo, achar o maior valor e a maior subida (a diferença entre dois meses), e ler um gráfico de setores como partes de um todo, em porcentagem e em reais.',
  modelo: 'grafico',
  esboco: 'O palco é o gráfico o tempo todo. A conta de luz de Marta em barras, sem os números escritos: o aluno acha o mês mais caro e lê março no eixo (90, entre as marcas 80 e 100). As barras viram uma linha. Momento-chave: o Mexa "apontar" na linha, o mês do maior salto. Junho é o mais alto, mas maio subiu 40 e junho só 10. Depois o salário de R$ 2.000 vira uma pizza: a fatia de um quarto é a comida, e 40 % do salário são R$ 800, não R$ 40. Fecha com a diferença entre duas barras, passo a passo.',
  vega: 'Ideia central: num gráfico de barras ou de linhas, a altura é o valor, lido no eixo da esquerda; um valor entre duas marcas fica no meio delas. A subida de um mês para o outro é a diferença entre os dois valores: a parte da linha mais inclinada, não o ponto mais alto. Num gráfico de setores (a pizza), cada fatia é a parte do todo, e as porcentagens somam 100 %; 40 % de R$ 2.000 são R$ 800. Valores da conta e do salário são exemplo da aula. Erros esperados: ler o valor na marca mais perto (80 em vez de 90); achar que o mês mais alto é o que mais subiu; tomar 40 % por R$ 40; somar quando a pergunta é quanto um passou o outro. Guie com "Até onde vai o topo da barra?", "Quanto subiu de um mês para o outro?", "40 % de quanto?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A conta de luz de Marta, mês a mês. Em que mês ela pesou mais? E quando ela mais subiu?',
      visual: graf(BARRAS, 'Seis barras azuis, de janeiro a junho, sem os valores escritos. O eixo da esquerda vai de 0 a 160, de 20 em 20.'),
      esboco: 'Duas perguntas que parecem a mesma. A aula separa as duas.',
    },
    {
      tipo: 'mexa',
      texto: 'Comece pela primeira pergunta: em que mês a conta foi mais alta?',
      visual: graf(BARRAS, 'As seis barras da conta de luz.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na barra do mês mais caro.',
        sucesso: { barra: 5 },
        mostre: 'A barra de junho acende: a mais alta.',
      },
      descoberta: 'A barra mais alta é o maior valor: junho.',
      esboco: 'Um toque para entrar no gráfico. A barra certa acende em âmbar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto foi a conta de **março**? Leia no eixo.',
      fala: 'Quanto foi a conta de março? Leia no eixo.',
      visual: graf({ ...BARRAS, destaque: 2 }, 'A barra de março acesa. O topo fica entre as marcas 80 e 100.'),
      opcoes: [
        {
          texto: 'R$ 90', certa: true,
          explica: 'Isso. O topo fica bem no meio entre 80 e 100: 90.',
          mostra: graf({ ...BARRAS, valores: true, destaque: 2 }, 'Os valores aparecem em cima das barras; março tem 90.'),
        },
        {
          texto: 'R$ 80', erro: 'le-valor-entre-marcas',
          explica: 'O topo passa do 80. Ele fica no meio entre 80 e 100: 90.',
          mostra: graf({ ...BARRAS, valores: true, destaque: 2 }, 'Os valores aparecem: março tem 90.'),
        },
        {
          texto: 'R$ 100', erro: 'le-valor-entre-marcas',
          explica: 'O topo não chega no 100. Compare com fevereiro, que chega: março fica no meio, em 90.',
          mostra: graf({ ...BARRAS, valores: true, destaque: 2 }, 'Os valores aparecem: março 90, fevereiro 100.'),
        },
      ],
      esboco: 'Ler entre as marcas. Os números aparecem depois da escolha e ficam.',
    },
    {
      tipo: 'ideia',
      texto: 'A mesma conta, em **linhas**: cada mês vira um ponto, e a linha liga os pontos. Ela mostra o sobe e desce.',
      fala: 'A mesma conta, em linhas: cada mês vira um ponto, e a linha liga os pontos. Ela mostra o sobe e desce.',
      visual: graf(LINHA, 'As barras somem e ficam só os topos, ligados por uma linha azul.'),
      esboco: 'Barras e linha mostram os mesmos números. A linha deixa ver a subida.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora a segunda pergunta: em que mês a conta deu o **maior salto**? Procure onde a linha sobe mais em pé.',
      fala: 'Agora a segunda pergunta: em que mês a conta deu o maior salto? Procure onde a linha sobe mais em pé.',
      visual: graf(LINHA, 'A linha da conta de luz, sem os valores.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no ponto do mês que chegou com o maior salto.',
        sucesso: { ponto: 4 },
        mostre: 'O ponto de maio acende: de 100 para 140, um salto de 40.',
      },
      descoberta: 'O maior salto é o pedaço mais em pé da linha: de abril para maio. O ponto mais alto, junho, subiu pouco.',
      esboco: 'O momento-chave. Quem toca em junho erra: ele é o mais alto, mas não o maior salto.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Junho foi o mês mais caro. Por que ele não foi o maior salto?',
      visual: graf({ ...LINHA, destaque: [4, 5] }, 'Os pontos de maio e junho acesos.'),
      opcoes: [
        {
          texto: 'Subiu só R$ 10, de 140 para 150', certa: true,
          explica: 'Isso. Maio subiu 40, de 100 para 140. A subida é a diferença entre dois meses, não a altura.',
          fala: 'Isso. Maio subiu quarenta, de cem para cento e quarenta. A subida é a diferença entre dois meses, não a altura.',
          mostra: graf({ ...LINHA, valores: true, destaque: [4, 5] }, 'Os valores aparecem nos pontos: 100, 140, 150.'),
        },
        {
          texto: 'Foi, sim: o mais alto subiu mais', erro: 'subida-pela-altura',
          explica: 'Junho está mais alto, mas veio de 140: subiu só 10. Maio veio de 100 e subiu 40.',
          fala: 'Junho está mais alto, mas veio de cento e quarenta: subiu só dez. Maio veio de cem e subiu quarenta.',
          mostra: graf({ ...LINHA, valores: true, destaque: [4, 5] }, 'Os valores aparecem: 100, 140, 150.'),
        },
      ],
      esboco: 'Separa as duas perguntas do gancho: o mais alto e o que mais subiu.',
    },
    {
      tipo: 'ideia',
      texto: 'Agora o salário de Marta, **R$ 2.000**, numa pizza. Cada fatia é a parte de um gasto no todo.',
      fala: 'Agora o salário de Marta, dois mil reais, numa pizza. Cada fatia é a parte de um gasto no todo.',
      visual: graf(SALARIO, 'Uma pizza com cinco fatias: aluguel, comida, transporte, luz e outros, com as porcentagens.'),
      esboco: 'O gráfico de setores: as porcentagens dentro das fatias e na legenda, somando 100 %.',
    },
    {
      tipo: 'mexa',
      texto: 'Qual gasto leva **um quarto** do salário?',
      fala: 'Qual gasto leva um quarto do salário?',
      visual: graf(SALARIO, 'A pizza do salário.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na fatia que é um quarto da pizza.',
        sucesso: { setor: 1 },
        mostre: 'A fatia da comida acende e sai um pouco da pizza: 25 %.',
      },
      descoberta: 'Um quarto é 25 %: a fatia da comida.',
      esboco: 'Liga a fatia à porcentagem da unidade 11: um quarto é 25 %.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O aluguel é a fatia de **40 %**. Quanto é o aluguel, em reais?',
      fala: 'O aluguel é a fatia de quarenta por cento. Quanto é o aluguel, em reais?',
      visual: graf({ ...SALARIO, destaque: 0 }, 'A fatia do aluguel acesa, com 40 %.'),
      opcoes: [
        {
          texto: 'R$ 800', certa: true,
          explica: 'Isso. 10 % de R$ 2.000 são R$ 200. 40 % são 4 vezes isso: R$ 800.',
          fala: 'Isso. Dez por cento de dois mil são duzentos. Quarenta por cento são quatro vezes isso: oitocentos reais.',
          mostra: graf({ ...SALARIO, destaque: 0, antes: 'R$ ' }, 'A legenda troca as porcentagens pelos reais: aluguel R$ 800.'),
        },
        {
          texto: 'R$ 40', erro: 'porcentagem-como-numero-inteiro',
          explica: '40 % é 40 de cada 100. Num salário de R$ 2.000, são R$ 800.',
          fala: 'Quarenta por cento é quarenta de cada cem. Num salário de dois mil reais, são oitocentos.',
          mostra: graf({ ...SALARIO, destaque: 0, antes: 'R$ ' }, 'A legenda mostra os reais: aluguel R$ 800.'),
        },
        {
          texto: 'R$ 50', erro: 'divide-pelo-numero-da-porcentagem',
          explica: '2.000 ÷ 40 dá 50, uma fatia bem fininha. A fatia do aluguel é quase metade: R$ 800.',
          fala: 'Dois mil dividido por quarenta dá cinquenta, uma fatia bem fininha. A fatia do aluguel é quase metade: oitocentos reais.',
          mostra: graf({ ...SALARIO, destaque: 0, antes: 'R$ ' }, 'A legenda mostra os reais: aluguel R$ 800.'),
        },
      ],
      esboco: 'Da fatia aos reais. As erradas são os erros de porcentagem da unidade 11.',
    },
    {
      tipo: 'anote',
      titulo: 'Ler um gráfico',
      definicao: 'Nas barras e nas linhas, a **altura** é o valor, lido no eixo. Na pizza, cada **fatia** é a parte do todo, em %.',
      exemplo: { tex: '40\\% \\text{ de } 2{.}000 = 800', fala: 'quarenta por cento de dois mil, oitocentos' },
      alerta: 'O mês mais alto não é sempre o que mais subiu. A subida é a diferença de um mês para o outro.',
      esboco: 'Na página: uma barra com o eixo ao lado, a linha com o salto marcado e a pizza do salário.',
    },
    {
      tipo: 'passo',
      problema: 'Quanto a conta de **junho** passou a de **março**?',
      fala: 'Quanto a conta de junho passou a de março?',
      visual: graf({ ...BARRAS, destaque: [2, 5] }, 'De volta às barras, sem os valores. Março e junho acesos.'),
      passos: [
        {
          pergunta: 'Quanto foi junho? Leia no eixo.',
          opcoes: [
            {
              texto: 'R$ 150', certa: true,
              explica: 'Isso. O topo fica no meio entre 140 e 160.',
              mostra: graf({ ...BARRAS, valores: true, destaque: [2, 5] }, 'Os valores aparecem: junho 150, março 90.'),
            },
            {
              texto: 'R$ 160', erro: 'le-valor-entre-marcas',
              explica: 'O topo não chega no 160, a última marca. Fica no meio entre 140 e 160: 150.',
              fala: 'O topo não chega no cento e sessenta, a última marca. Fica no meio entre cento e quarenta e cento e sessenta: cento e cinquenta.',
            },
          ],
          linha: { tex: '\\text{junho: } 150 \\quad \\text{março: } 90', fala: 'junho, cento e cinquenta; março, noventa' },
        },
        {
          pergunta: 'Quanto junho passou março?',
          opcoes: [
            {
              texto: '$150 - 90 = 60$', certa: true,
              explica: 'Isso. "Passou" é a diferença: R$ 60 a mais.',
              fala: 'Isso. Passou é a diferença: sessenta reais a mais.',
              mostra: graf({ ...BARRAS, valores: true, destaque: [2, 5], rotulo: 'junho passou março em R$ 60' }, 'Os valores e, embaixo, "junho passou março em R$ 60".'),
            },
            {
              texto: '$150 + 90 = 240$', erro: 'operacao-trocada',
              explica: 'Somar junta as duas contas. "Passou" é quanto uma barra sobra em cima da outra: a diferença.',
              fala: 'Somar junta as duas contas. Passou é quanto uma barra sobra em cima da outra: a diferença.',
            },
          ],
          linha: { tex: '150 - 90 = 60', fala: 'cento e cinquenta menos noventa, sessenta' },
        },
      ],
      esboco: 'Ler dois valores e comparar. A errada do segundo passo soma.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: na pizza, o transporte é **15 %** de R$ 2.000. Quanto é o transporte, em reais?',
      fala: 'No papel: na pizza, o transporte é quinze por cento de dois mil reais. Quanto é o transporte, em reais?',
      resposta: 300,
      resolucao: [
        { tex: '10\\% \\text{ de } 2{.}000 = 200', fala: 'dez por cento de dois mil, duzentos' },
        { tex: '5\\% \\text{ de } 2{.}000 = 100', fala: 'cinco por cento de dois mil, cem' },
        { tex: '200 + 100 = 300', fala: 'duzentos mais cem, trezentos' },
      ],
      esboco: 'A porcentagem em partes, como na unidade 11.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['ler-grafico-n1', 'ler-grafico-n2', 'ler-grafico-n3'],
      esboco: 'Nível 1: ler o valor de uma barra ou de um ponto da linha no eixo. Nível 2: o maior salto de uma lista de meses e a fatia em reais. Nível 3: a fatia em porcentagem e a fatia que falta.',
    },
    {
      tipo: 'fecho',
      texto: 'A luz pesou mais em **junho**, mas o maior salto foi em **maio**. Na próxima aula: gráficos que enganam.',
      fala: 'A luz pesou mais em junho, mas o maior salto foi em maio. Na próxima aula: gráficos que enganam.',
      visual: graf({ ...LINHA, valores: true, destaque: [4, 5] }, 'A linha com os valores, maio e junho acesos.'),
      esboco: 'Responde às duas perguntas do gancho.',
    },
  ],
}
