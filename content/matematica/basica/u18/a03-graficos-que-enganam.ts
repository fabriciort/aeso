import type { Aula, Visual } from '@/lib/formation/schema'

// Gráficos que enganam. Um anúncio mostra as vendas de 92, 95 e 98 mil com
// o eixo começando no 90: a barra de março parece quatro vezes a de janeiro.
// O momento-chave é a aposta "e se o eixo começar no 0?": o eixo desce até
// o 0 e as barras ficam quase iguais. Depois o aluno desenha abril (100 mil)
// no gráfico honesto. O segundo truque é a escala torta (marcas à mesma
// distância, com valores 0, 10, 20, 50, 100), que faz R$ 50 parecer pouco
// mais que R$ 20. A pergunta que fica: onde começa o eixo? Os erros a
// desmontar: não olhar o começo do eixo e não conferir a escala.

const graf = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grafico', estado, esboco })

/** As vendas do anúncio, em mil reais. */
const VENDAS = [['jan', 92], ['fev', 95], ['mar', 98]]
const TITULO = 'Vendas (mil R$)'
/** O eixo cortado: começa no 90, de 2 em 2. */
const CORTADO = { titulo: TITULO, dados: VENDAS, eixoInicio: 90, valores: false }
/** O mesmo, com o eixo no 0. */
const HONESTO = { titulo: TITULO, dados: VENDAS, eixoFim: 100, passo: 20 }
/** Os dois planos, na escala torta. */
const PLANOS = { titulo: 'Preço por mês (R$)', dados: [['A', 20], ['B', 50]], escala: [0, 10, 20, 50, 100], valores: false }
/** O quilo do pão, com o eixo começando no 9. */
const PAO = { titulo: 'Quilo do pão (R$)', dados: [['jan', 10], ['fev', 11]], eixoInicio: 9, passo: 1, valores: false }

export const aula: Aula = {
  id: 'B.U18.A3',
  titulo: 'Gráficos que enganam',
  objetivo: 'Perceber quando um gráfico engana pelo eixo cortado (que não começa no 0) ou pela escala torta (marcas à mesma distância com valores desiguais), e comparar os valores pelos números do eixo, não pelo tamanho do desenho.',
  modelo: 'grafico',
  esboco: 'O palco é o gráfico o tempo todo. O anúncio: 92, 95 e 98 mil com o eixo começando no 90, e a barra de março quatro vezes a de janeiro. O aluno lê os números e vê que são quase iguais. Momento-chave: a aposta "e se o eixo começar no 0?". O eixo desce até o 0 e as barras crescem até ficarem quase da mesma altura. Depois o aluno arrasta a barra de abril até 100 no gráfico honesto. O segundo truque, a escala torta, faz R$ 50 parecer pouco mais que R$ 20; o gráfico honesto aparece ao lado. Fecha com o zigue-zague que avisa o corte e o preço do pão, passo a passo.',
  vega: 'Ideia central: o tamanho de uma barra só compara valores se o eixo começa no 0 e as marcas pulam sempre o mesmo valor. Com o eixo cortado (começando no 90), o desenho mostra só a pontinha das barras: 92 e 98 parecem 1 e 4. Com a escala torta (0, 10, 20, 50, 100 à mesma distância), uma diferença grande parece pequena. O zigue-zague no pé do eixo é o jeito honesto de avisar o corte. A pergunta que resolve: onde começa o eixo? Os números do anúncio e dos planos são exemplo da aula. Erros esperados: comparar pelo desenho sem olhar o começo do eixo; não conferir se as marcas pulam igual. Guie com "Qual é o primeiro número do eixo?", "Quanto vale cada pulo de marca?", "Leia os números: quanto cada um vale de verdade?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Um anúncio diz: “Nossas vendas dispararam!” A barra de março é quatro vezes a de janeiro. Dispararam mesmo?',
      visual: graf(CORTADO, 'Três barras, de janeiro a março. A de janeiro é baixinha, a de março vai até o topo. O eixo começa no 90, sem aviso.'),
      esboco: 'O gráfico parece dizer tudo. A pergunta põe a dúvida.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Leia os números do eixo. Quanto março vendeu, comparado a janeiro?',
      visual: graf(CORTADO, 'O mesmo gráfico. O eixo vai de 90 a 98, de 2 em 2.'),
      opcoes: [
        {
          texto: 'Quase o mesmo: 98 mil e 92 mil', certa: true,
          explica: 'Isso. O eixo começa no **90**, não no 0. O desenho mostra só a pontinha de cada barra.',
          fala: 'Isso. O eixo começa no noventa, não no zero. O desenho mostra só a pontinha de cada barra.',
          mostra: graf({ ...CORTADO, valores: true }, 'Os valores aparecem em cima das barras: 92, 95 e 98.'),
        },
        {
          texto: 'Umas 4 vezes mais', erro: 'nao-olha-o-inicio-do-eixo',
          explica: 'A barra parece 4 vezes, mas o eixo começa no **90**. Janeiro vendeu 92 mil; março, 98 mil.',
          fala: 'A barra parece quatro vezes, mas o eixo começa no noventa. Janeiro vendeu noventa e dois mil; março, noventa e oito mil.',
          mostra: graf({ ...CORTADO, valores: true }, 'Os valores aparecem: 92, 95 e 98.'),
        },
      ],
      esboco: 'O aluno descobre o truque lendo o primeiro número do eixo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E se o eixo começar no **0**, como deve ser? Como ficam as barras?',
      fala: 'E se o eixo começar no zero, como deve ser? Como ficam as barras?',
      visual: graf({ ...CORTADO, valores: true }, 'O gráfico cortado, com os valores.'),
      opcoes: [
        {
          texto: 'Quase da mesma altura', certa: true,
          explica: 'Isso. Com o eixo no 0, aparece a barra inteira: 92 e 98 ficam quase iguais.',
          fala: 'Isso. Com o eixo no zero, aparece a barra inteira: noventa e dois e noventa e oito ficam quase iguais.',
          mostra: graf(HONESTO, 'O eixo desce até o 0 e as barras crescem para baixo até ficarem quase da mesma altura.'),
        },
        {
          texto: 'Março continua 4 vezes janeiro', erro: 'nao-olha-o-inicio-do-eixo',
          explica: 'Veja o eixo descer até o 0: as barras ficam quase iguais. O 4 vezes era só o corte.',
          fala: 'Veja o eixo descer até o zero: as barras ficam quase iguais. O quatro vezes era só o corte.',
          mostra: graf(HONESTO, 'O eixo desce até o 0 e as barras ficam quase da mesma altura.'),
        },
      ],
      esboco: 'O momento-chave: o eixo desce do 90 até o 0 e a diferença enorme some.',
    },
    {
      tipo: 'mexa',
      texto: 'Abril vendeu **100** mil. Desenhe a barra de abril no gráfico honesto, com o eixo no 0.',
      fala: 'Abril vendeu cem mil. Desenhe a barra de abril no gráfico honesto, com o eixo no zero.',
      visual: graf({ titulo: TITULO, dados: [...VENDAS, ['abr', 0]], ativa: 3, eixoFim: 100, passo: 20 }, 'O gráfico honesto com uma quarta barra, abril, ainda no pé do eixo.'),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Arraste a barra de abril até 100.',
        sucesso: { valor: 100 },
        mostre: 'A barra de abril sobe até o 100, só um pouco acima das outras.',
      },
      descoberta: 'Com o eixo no 0, 100 mil fica só um pouco acima de 92 mil: as vendas cresceram pouco.',
      esboco: 'O aluno faz o gráfico honesto com a própria mão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O site do plano **B** mostra este gráfico. Pelo desenho, B parece pouco mais caro que A. É mesmo?',
      fala: 'O site do plano B mostra este gráfico. Pelo desenho, B parece pouco mais caro que A. É mesmo?',
      visual: graf(PLANOS, 'Duas barras, A e B. O eixo tem as marcas 0, 10, 20, 50 e 100, todas à mesma distância. A chega no 20 e B no 50.'),
      opcoes: [
        {
          texto: 'Não: R$ 50 é 2,5 vezes R$ 20', certa: true,
          explica: 'Isso. As marcas pulam 10, 10, 30 e 50: é a **escala torta**. Na escala regular, B fica bem mais alta.',
          fala: 'Isso. As marcas pulam dez, dez, trinta e cinquenta: é a escala torta. Na escala regular, B fica bem mais alta.',
          mostra: graf({ ...PLANOS, valores: true, honesto: true }, 'Dois gráficos lado a lado: "como veio", na escala torta, e "escala regular", em que B tem 2,5 vezes a altura de A.'),
        },
        {
          texto: 'É: a barra é só um pouco maior', erro: 'nao-confere-a-escala',
          explica: 'Leia as marcas: 10, 20, 50, 100. Cada pulo vale outra coisa. Na escala regular, B é 2,5 vezes A.',
          fala: 'Leia as marcas: dez, vinte, cinquenta, cem. Cada pulo vale outra coisa. Na escala regular, B é duas vezes e meia A.',
          mostra: graf({ ...PLANOS, valores: true, honesto: true }, 'O gráfico torto e o regular lado a lado.'),
        },
      ],
      esboco: 'O segundo truque, ao contrário do primeiro: aqui o desenho esconde uma diferença grande.',
    },
    {
      tipo: 'anote',
      titulo: 'Onde começa o eixo?',
      definicao: 'Antes de comparar barras, olhe o eixo: ele começa no **0**? As marcas pulam sempre o **mesmo valor**?',
      exemplo: { tex: '\\text{eixo no } 90\\text{: } 98 \\text{ parece } 4 \\text{ vezes } 92', fala: 'com o eixo no noventa, noventa e oito parece quatro vezes noventa e dois' },
      alerta: 'O eixo cortado aumenta diferenças pequenas. A escala torta esconde diferenças grandes. Leia os números.',
      esboco: 'Na página: o gráfico cortado e o honesto, lado a lado, e a escala torta com os pulos marcados.',
    },
    {
      tipo: 'ideia',
      texto: 'Cortar o eixo pode ser honesto: o **zigue-zague** no pé avisa que ele não começa no 0. Mesmo assim, leia os números.',
      fala: 'Cortar o eixo pode ser honesto: o zigue-zague no pé avisa que ele não começa no zero. Mesmo assim, leia os números.',
      visual: graf({ ...CORTADO, valores: true, quebra: true }, 'O gráfico das vendas cortado no 90, agora com o zigue-zague no pé do eixo.'),
      esboco: 'O aviso honesto. O aluno aprende a procurar o zigue-zague.',
    },
    {
      tipo: 'passo',
      problema: 'O jornal mostra o quilo do pão em janeiro e em fevereiro. Quanto ele subiu de verdade?',
      visual: graf(PAO, 'Duas barras: a de fevereiro tem o dobro da altura da de janeiro. O eixo começa no 9.'),
      passos: [
        {
          pergunta: 'Primeiro: onde começa o eixo?',
          opcoes: [
            {
              texto: 'No 9', certa: true,
              explica: 'Isso. O eixo está cortado: começa no R$ 9.',
              fala: 'Isso. O eixo está cortado: começa no nove reais.',
              mostra: graf({ ...PAO, valores: true, antes: 'R$ ', quebra: true }, 'O zigue-zague aparece no pé do eixo e os valores aparecem: R$ 10 e R$ 11.'),
            },
            {
              texto: 'No 0', erro: 'nao-olha-o-inicio-do-eixo',
              explica: 'Leia o número mais baixo do eixo: é 9. O pé do gráfico não é o 0.',
              fala: 'Leia o número mais baixo do eixo: é nove. O pé do gráfico não é o zero.',
            },
          ],
          linha: { tex: '\\text{o eixo começa no } 9', fala: 'o eixo começa no nove' },
        },
        {
          pergunta: 'No desenho, fevereiro parece o dobro. Quanto o pão subiu de verdade?',
          opcoes: [
            {
              texto: 'R$ 1, de R$ 10 para R$ 11', certa: true,
              explica: 'Isso. Subiu um real, um décimo do preço. Com o eixo no 0, as barras ficam quase iguais.',
              fala: 'Isso. Subiu um real, um décimo do preço. Com o eixo no zero, as barras ficam quase iguais.',
              mostra: graf({ ...PAO, valores: true, antes: 'R$ ', honesto: true }, 'O gráfico cortado e o honesto lado a lado: R$ 10 e R$ 11 quase da mesma altura.'),
            },
            {
              texto: 'Dobrou: de R$ 10 para R$ 20', erro: 'nao-olha-o-inicio-do-eixo',
              explica: 'O dobro é só no desenho, porque o eixo começa no 9. Os números dizem R$ 10 e R$ 11.',
              fala: 'O dobro é só no desenho, porque o eixo começa no nove. Os números dizem dez e onze reais.',
            },
          ],
          linha: { tex: '11 - 10 = 1 \\text{ real a mais}', fala: 'onze menos dez, um real a mais' },
        },
      ],
      esboco: 'A pergunta da aula vira o primeiro passo: onde começa o eixo?',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: um gráfico mostra **48** e **52**, com o eixo começando no **46**. No desenho, a barra de 52 fica quantas vezes a de 48?',
      fala: 'No papel: um gráfico mostra quarenta e oito e cinquenta e dois, com o eixo começando no quarenta e seis. No desenho, a barra de cinquenta e dois fica quantas vezes a de quarenta e oito?',
      resposta: 3,
      resolucao: [
        { tex: '48 - 46 = 2 \\qquad 52 - 46 = 6', fala: 'quarenta e oito menos quarenta e seis, dois; cinquenta e dois menos quarenta e seis, seis' },
        { tex: '6 \\div 2 = 3 \\text{ vezes, no desenho}', fala: 'seis dividido por dois, três vezes, no desenho' },
        { tex: '\\text{de verdade: } 52 \\text{ é só } 4 \\text{ a mais que } 48', fala: 'de verdade: cinquenta e dois é só quatro a mais que quarenta e oito' },
      ],
      esboco: 'O aluno mede o tamanho do engano: a barra desenhada é o que passa do 46.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['grafico-enganoso-n1', 'grafico-enganoso-n2', 'grafico-enganoso-n3'],
      esboco: 'Nível 1: onde começa o eixo, se as vendas dispararam ou subiram pouco, e a escala torta desenhada. Nível 2: o tamanho do desenho num eixo cortado e o valor de uma barra num eixo cortado. Nível 3: a subida de verdade, em %, e a escala torta descrita.',
    },
    {
      tipo: 'fecho',
      texto: 'As vendas foram de 92 para 98 mil: pouco mais de 6 %. Não dispararam. Na próxima aula: relações entre grandezas.',
      fala: 'As vendas foram de noventa e dois para noventa e oito mil: pouco mais de seis por cento. Não dispararam. Na próxima aula: relações entre grandezas.',
      visual: graf({ ...CORTADO, valores: true, honesto: ['o anúncio', 'de verdade'] }, 'O anúncio e o gráfico de verdade, lado a lado.'),
      esboco: 'Responde ao gancho e anuncia as relações entre grandezas.',
    },
  ],
}
