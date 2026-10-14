import type { Aula, Visual } from '@/lib/formation/schema'

// Coordenadas. Dois números marcam um ponto: o primeiro (x) anda para o
// lado, o segundo (y) anda para cima. Abre num mapa do tesouro com (3, 2).
// O momento-chave é o Mexa "marcar": o aluno toca no cruzamento e o ponto
// anda da origem, primeiro 3 no x, depois 2 no y. Logo depois, (3, 2) e
// (2, 3) lado a lado: a ordem importa. Depois os eixos crescem para os
// negativos (a reta da unidade 12, agora em pé também) e aparecem os quatro
// quadrantes. Fecha com a batalha naval, passo a passo. Os erros a
// desmontar: trocar x e y e ignorar o sinal.

const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })

/** O mapa do começo: só o lado positivo, de 0 a 6. */
const MAPA = { x: { de: 0, ate: 6, passo: 1 }, y: { de: 0, ate: 6, passo: 1 } }
/** O plano inteiro, com os negativos. */
const TODO = { x: { de: -5, ate: 5, passo: 1 }, y: { de: -5, ate: 5, passo: 1 } }

export const aula: Aula = {
  id: 'B.U18.A1',
  titulo: 'Coordenadas',
  objetivo: 'Marcar e ler pontos no plano cartesiano pelo par (x, y), com o x primeiro (para o lado) e o y depois (para cima ou para baixo), inclusive com negativos, e reconhecer os quatro quadrantes.',
  modelo: 'plano',
  esboco: 'O palco é o plano o tempo todo. Primeiro só o lado positivo, de 0 a 6, como um mapa: o tesouro em (3, 2). A aposta pergunta qual número anda para o lado; o traço âmbar sai da origem 3 casas no eixo x. Momento-chave: o Mexa "marcar", em que o aluno toca no cruzamento e o ponto anda da origem, 3 para a direita e depois 2 para cima. Depois (3, 2) e (2, 3) aparecem juntos: a ordem importa. Os eixos crescem para os negativos, com os quatro quadrantes, e o aluno marca três pontos com sinais. Fecha com a batalha naval: o tiro em (−3, 4), passo a passo.',
  vega: 'Ideia central: um ponto do plano é um par (x, y). Saindo da origem (0, 0), o x anda para o lado (direita se positivo, esquerda se negativo) e depois o y anda para cima (positivo) ou para baixo (negativo). A ordem importa: (3, 2) e (2, 3) são lugares diferentes. Os dois eixos são retas numéricas, como a da unidade 12, uma deitada e uma em pé, e repartem o plano em quatro quadrantes: 1º (+, +), 2º (−, +), 3º (−, −) e 4º (+, −). Um ponto com um zero fica em cima de um eixo: (0, 4) está no eixo y. Erros esperados: trocar x e y; ignorar o sinal (marcar (−3, 2) em (3, 2)); andar no y primeiro. Guie com "Qual número vem primeiro?", "O primeiro anda para o lado ou para cima?", "O menos manda para onde?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'No mapa do tesouro está escrito **(3, 2)**. São dois números para um lugar só. Qual número diz o quê?',
      fala: 'No mapa do tesouro está escrito: três, dois. São dois números para um lugar só. Qual número diz o quê?',
      visual: plano({ ...MAPA, rotulo: 'o tesouro: (3, 2)' }, 'O plano de 0 a 6 nos dois eixos, com a grade, como um mapa quadriculado. Embaixo, "o tesouro: (3, 2)".'),
      esboco: 'Dois números, um lugar. A pergunta fica aberta: qual é o do lado e qual é o de cima?',
    },
    {
      tipo: 'aposta',
      pergunta: 'Saindo do **0**, um número anda para o lado e o outro para cima. Qual anda para o lado?',
      fala: 'Saindo do zero, um número anda para o lado e o outro para cima. Qual anda para o lado?',
      visual: plano({ ...MAPA, rotulo: 'o tesouro: (3, 2)' }, 'O mesmo mapa.'),
      opcoes: [
        {
          texto: 'O 3, o primeiro', certa: true,
          explica: 'Isso. O primeiro número é o **x**: anda no eixo de baixo, para o lado. O segundo, o **y**, anda para cima.',
          fala: 'Isso. O primeiro número é o x: anda no eixo de baixo, para o lado. O segundo, o y, anda para cima.',
          mostra: plano({ ...MAPA, segmentos: [{ de: [0, 0], ate: [3, 0], destaque: 'ambar' }], rotulo: 'primeiro o x: 3 para o lado' }, 'Um traço âmbar sai da origem e anda 3 casas no eixo x.'),
        },
        {
          texto: 'O 2, o segundo', erro: 'troca-x-e-y',
          explica: 'A regra é a mesma no mundo todo: o primeiro número, o **x**, anda para o lado. O segundo, o **y**, anda para cima.',
          fala: 'A regra é a mesma no mundo todo: o primeiro número, o x, anda para o lado. O segundo, o y, anda para cima.',
          mostra: plano({ ...MAPA, segmentos: [{ de: [0, 0], ate: [3, 0], destaque: 'ambar' }], rotulo: 'primeiro o x: 3 para o lado' }, 'O traço âmbar anda 3 casas no eixo x.'),
        },
      ],
      esboco: 'A errada é o erro da aula: trocar a ordem. A certa já mostra o primeiro pedaço do caminho.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora o tesouro: **3** para a direita e depois **2** para cima. Marque o lugar.',
      fala: 'Agora o tesouro: três para a direita e depois dois para cima. Marque o lugar.',
      visual: plano({ ...MAPA, pontos: { A: [3, 2] }, nomes: { A: 'tesouro' } }, 'O mapa de 0 a 6. O tesouro está escondido em (3, 2) até o aluno tocar no cruzamento certo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no cruzamento (3, 2).',
        sucesso: { ponto: [3, 2] },
        mostre: 'O ponto anda da origem: 3 no eixo x, depois 2 para cima. Aparece "tesouro (3, 2)".',
      },
      descoberta: 'O primeiro número anda para o lado; o segundo, para cima. O ponto fica no cruzamento.',
      esboco: 'O momento-chave: o ponto anda da origem, traço âmbar no x e traço azul no y. Se tocar em (2, 3), o player avisa que trocou x e y.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O ponto **B** é **(2, 3)**. Ele fica no mesmo lugar do tesouro?',
      fala: 'O ponto B é: dois, três. Ele fica no mesmo lugar do tesouro?',
      visual: plano({ ...MAPA, pontos: { A: [3, 2] }, nomes: { A: 'tesouro' }, coordenadas: ['A'] }, 'O tesouro em (3, 2), com o par escrito.'),
      opcoes: [
        {
          texto: 'Não: é outro lugar', certa: true,
          explica: 'Isso. O B anda 2 para o lado e 3 para cima. Os mesmos números, na outra ordem, dão outro ponto.',
          fala: 'Isso. O B anda dois para o lado e três para cima. Os mesmos números, na outra ordem, dão outro ponto.',
          mostra: plano({ ...MAPA, pontos: { A: [3, 2], B: [2, 3] }, nomes: { A: 'tesouro' }, coordenadas: true, cores: { B: 'azul' }, caminho: 'B' }, 'O B aparece em azul e anda da origem: 2 no x, 3 para cima. Os dois pontos ficam lado a lado.'),
        },
        {
          texto: 'Sim: são os mesmos números', erro: 'troca-x-e-y',
          explica: 'Os números são os mesmos, mas a ordem não. O B anda só 2 para o lado e sobe 3: fica em outro cruzamento.',
          fala: 'Os números são os mesmos, mas a ordem não. O B anda só dois para o lado e sobe três: fica em outro cruzamento.',
          mostra: plano({ ...MAPA, pontos: { A: [3, 2], B: [2, 3] }, nomes: { A: 'tesouro' }, coordenadas: true, cores: { B: 'azul' }, caminho: 'B' }, 'O B anda até (2, 3), longe do tesouro.'),
        },
      ],
      esboco: 'Os dois pontos lado a lado desmontam a troca de vez.',
    },
    {
      tipo: 'anote',
      titulo: 'Coordenadas',
      definicao: 'Um ponto do plano é um par **(x, y)**. Saindo do (0, 0), o **x** anda para o lado e depois o **y** anda para cima.',
      exemplo: { tex: '(3,\\ 2):\\ 3 \\text{ para a direita, } 2 \\text{ para cima}', fala: 'três, dois: três para a direita, dois para cima' },
      alerta: 'A ordem importa: (3, 2) e (2, 3) são pontos diferentes. Primeiro o x.',
      esboco: 'Na página: os dois eixos, o caminho até (3, 2) e o (2, 3) ao lado, para comparar.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora o contrário: o mapa do bairro. Toque em cada lugar e leia o par dele.',
      visual: plano({ ...MAPA, pontos: { P: [1, 4], Q: [4, 1], R: [5, 3] }, nomes: { P: 'casa', Q: 'escola', R: 'mercado' } }, 'A casa em (1, 4), a escola em (4, 1) e o mercado em (5, 3), sem os pares.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos três lugares.',
        sucesso: { lidos: 3 },
        mostre: 'Cada lugar mostra o par e os tracejados até os eixos: casa (1, 4), escola (4, 1), mercado (5, 3).',
      },
      descoberta: 'Para ler o par, desça até o eixo x e vá de lado até o eixo y. O x vem primeiro.',
      esboco: 'A casa (1, 4) e a escola (4, 1) são a troca de novo, agora para ler.',
    },
    {
      tipo: 'ideia',
      texto: 'Os eixos são duas retas numéricas, uma deitada e uma em pé. À esquerda do 0 e abaixo dele vêm os **negativos**.',
      fala: 'Os eixos são duas retas numéricas, uma deitada e uma em pé. À esquerda do zero e abaixo dele vêm os negativos.',
      visual: plano({ ...TODO, quadrantes: true }, 'Os eixos crescem para a esquerda e para baixo, de −5 a 5. Os cantos ganham 1º, 2º, 3º e 4º.'),
      esboco: 'A reta dos números negativos, agora em dois eixos.',
    },
    {
      tipo: 'mexa',
      texto: 'Com o menos, o caminho vira: **x** negativo vai para a esquerda, **y** negativo vai para baixo.',
      fala: 'Com o menos, o caminho vira: x negativo vai para a esquerda, y negativo vai para baixo.',
      visual: plano({ ...TODO, quadrantes: true }, 'O plano inteiro, com os quatro quadrantes.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Marque (−2, 3), (−4, −1) e (2, −3).',
        sucesso: { pontos: [[-2, 3], [-4, -1], [2, -3]] },
        mostre: 'Os três pontos andam da origem até o lugar, cada um num quadrante.',
      },
      descoberta: 'O sinal diz o sentido: o menos no x vai para a esquerda; no y, para baixo.',
      esboco: 'Um ponto no 2º, um no 3º e um no 4º quadrante. O player avisa quando o sinal está trocado.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em que quadrante fica o ponto **(−3, −2)**?',
      fala: 'Em que quadrante fica o ponto: menos três, menos dois?',
      visual: plano({ ...TODO, quadrantes: true }, 'O plano com os quatro quadrantes.'),
      opcoes: [
        {
          texto: 'No 3º', certa: true,
          explica: 'Isso. 3 para a esquerda e 2 para baixo: o canto de baixo, à esquerda. Os dois sinais são menos.',
          fala: 'Isso. Três para a esquerda e dois para baixo: o canto de baixo, à esquerda. Os dois sinais são menos.',
          mostra: plano({ ...TODO, quadrantes: [3], pontos: { P: [-3, -2] }, coordenadas: true, caminho: 'P' }, 'O ponto anda 3 para a esquerda e 2 para baixo; o 3º quadrante acende.'),
        },
        {
          texto: 'No 1º', erro: 'ignora-sinal-da-coordenada',
          explica: 'No 1º ficaria o (3, 2). O menos manda para o outro lado: 3 para a esquerda e 2 para baixo.',
          fala: 'No primeiro ficaria o três, dois. O menos manda para o outro lado: três para a esquerda e dois para baixo.',
          mostra: plano({ ...TODO, quadrantes: [3], pontos: { P: [-3, -2] }, coordenadas: true, caminho: 'P' }, 'O ponto anda até (−3, −2), no 3º quadrante.'),
        },
        {
          texto: 'No 2º', erro: 'ignora-sinal-da-coordenada',
          explica: 'No 2º o y é positivo, para cima. Aqui o y é −2: o ponto desce, para o 3º.',
          fala: 'No segundo o y é positivo, para cima. Aqui o y é menos dois: o ponto desce, para o terceiro.',
          mostra: plano({ ...TODO, quadrantes: [3], pontos: { P: [-3, -2] }, coordenadas: true, caminho: 'P' }, 'O ponto anda até (−3, −2), no 3º quadrante.'),
        },
      ],
      esboco: 'Os dois erros esquecem um sinal: o do x e o do y.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E o ponto **(0, 4)**? Onde ele fica?',
      fala: 'E o ponto: zero, quatro? Onde ele fica?',
      visual: plano({ ...TODO, quadrantes: true }, 'O plano com os quadrantes.'),
      opcoes: [
        {
          texto: 'Em cima do eixo y', certa: true,
          explica: 'Isso. O x é 0: não anda para o lado. Só sobe 4, pelo eixo y. Ele não fica em quadrante nenhum.',
          fala: 'Isso. O x é zero: não anda para o lado. Só sobe quatro, pelo eixo y. Ele não fica em quadrante nenhum.',
          mostra: plano({ ...TODO, quadrantes: true, pontos: { P: [0, 4] }, coordenadas: true, caminho: 'P' }, 'O ponto sobe pelo eixo y até o 4.'),
        },
        {
          texto: 'Em cima do eixo x', erro: 'troca-x-e-y',
          explica: 'No eixo x ficaria o (4, 0). Aqui o primeiro número é 0: não anda para o lado, só sobe 4.',
          fala: 'No eixo x ficaria o quatro, zero. Aqui o primeiro número é zero: não anda para o lado, só sobe quatro.',
          mostra: plano({ ...TODO, quadrantes: true, pontos: { P: [0, 4] }, coordenadas: true, caminho: 'P' }, 'O ponto sobe pelo eixo y até o 4.'),
        },
      ],
      esboco: 'O zero não anda. Quem tem um zero fica num eixo.',
    },
    {
      tipo: 'passo',
      problema: 'Batalha naval: o navio está em **(−3, 4)**. Leve o tiro da origem até ele.',
      fala: 'Batalha naval: o navio está em menos três, quatro. Leve o tiro da origem até ele.',
      visual: plano({ ...TODO }, 'O plano sem os quadrantes, como o tabuleiro.'),
      passos: [
        {
          pergunta: 'Primeiro o x, que é **−3**. Para onde o tiro vai?',
          fala: 'Primeiro o x, que é menos três. Para onde o tiro vai?',
          opcoes: [
            {
              texto: '3 para a esquerda', certa: true,
              explica: 'Isso. O x negativo vai para a esquerda.',
              mostra: plano({ ...TODO, segmentos: [{ de: [0, 0], ate: [-3, 0], destaque: 'ambar' }] }, 'O traço âmbar anda 3 para a esquerda no eixo x.'),
            },
            {
              texto: '3 para a direita', erro: 'ignora-sinal-da-coordenada',
              explica: 'Para a direita é o +3. O menos manda para a esquerda, como na reta dos negativos.',
              fala: 'Para a direita é o mais três. O menos manda para a esquerda, como na reta dos negativos.',
              mostra: plano({ ...TODO, segmentos: [{ de: [0, 0], ate: [-3, 0], destaque: 'ambar' }] }, 'O traço âmbar anda para a esquerda.'),
            },
            {
              texto: '4 para cima', erro: 'troca-x-e-y',
              explica: 'O 4 é o segundo número, o y. Primeiro vem o x: o −3, para o lado.',
              fala: 'O quatro é o segundo número, o y. Primeiro vem o x: o menos três, para o lado.',
            },
          ],
          linha: { tex: 'x = -3:\\ 3 \\text{ para a esquerda}', fala: 'x igual a menos três: três para a esquerda' },
        },
        {
          pergunta: 'Agora o y, que é **4**. Para onde?',
          fala: 'Agora o y, que é quatro. Para onde?',
          opcoes: [
            {
              texto: '4 para cima', certa: true,
              explica: 'Isso. O y positivo sobe. Fogo: o tiro chega em (−3, 4).',
              fala: 'Isso. O y positivo sobe. Fogo: o tiro chega em menos três, quatro.',
              mostra: plano({ ...TODO, pontos: { N: [-3, 4] }, nomes: { N: 'navio' }, coordenadas: true, caminho: 'N' }, 'O tiro anda 3 para a esquerda e sobe 4. Aparece "navio (−3, 4)".'),
            },
            {
              texto: '4 para baixo', erro: 'ignora-sinal-da-coordenada',
              explica: 'Para baixo é o −4. Este 4 não tem menos: o tiro sobe.',
              fala: 'Para baixo é o menos quatro. Este quatro não tem menos: o tiro sobe.',
            },
          ],
          linha: { tex: 'y = 4:\\ 4 \\text{ para cima}', fala: 'y igual a quatro: quatro para cima' },
        },
      ],
      esboco: 'O aluno anda o caminho em dois passos, primeiro o x e depois o y, com um sinal de cada tipo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: desenhe os eixos e marque **(−1, 2)**. Ande **4** para a direita. Qual é o x do ponto novo?',
      fala: 'No papel: desenhe os eixos e marque menos um, dois. Ande quatro para a direita. Qual é o x do ponto novo?',
      resposta: 3,
      sinal: true,
      resolucao: [
        { tex: '-1 + 4 = 3', fala: 'menos um mais quatro, três' },
        { tex: '\\text{o ponto novo: } (3,\\ 2)', fala: 'o ponto novo: três, dois' },
      ],
      esboco: 'Andar para o lado muda só o x. O y continua 2.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['coordenadas-n1', 'coordenadas-n2', 'coordenadas-n3'],
      esboco: 'Nível 1: ler o x ou o y de um ponto desenhado, ou o quadrante dele. Nível 2: o quadrante pelo par, sem desenho, e o ponto que anda. Nível 3: o mapa do bairro e a batalha naval, com distâncias.',
    },
    {
      tipo: 'fecho',
      texto: 'O tesouro está em **(3, 2)**: 3 para o lado, depois 2 para cima. Na próxima aula: ler gráficos.',
      fala: 'O tesouro está em três, dois: três para o lado, depois dois para cima. Na próxima aula: ler gráficos.',
      visual: plano({ ...TODO, pontos: { A: [3, 2] }, nomes: { A: 'tesouro' }, coordenadas: true, guias: true }, 'O tesouro em (3, 2), com os tracejados até os eixos.'),
      esboco: 'Responde ao gancho e anuncia os gráficos.',
    },
  ],
}
