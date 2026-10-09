import type { Aula, Visual } from '@/lib/formation/schema'

const blocos = (estado: Visual['estado'], esboco: string, movimento?: string): Visual => ({
  modelo: 'blocos', estado, esboco, ...(movimento ? { movimento } : {}),
})

export const aula: Aula = {
  id: 'B.U1.A1',
  titulo: 'Agrupar de 10 em 10',
  objetivo: 'Agrupar objetos em dezenas, centenas e milhares, conservar a quantidade ao trocar e manter as unidades que sobram.',
  modelo: 'blocos',
  vega:
    'Ideia central: mudar a embalagem não muda a quantidade. Dez cubos formam uma barra; dez barras, uma placa; dez placas, um bloco de mil. As sobras permanecem visíveis. Primeiro a troca concreta; depois os nomes unidades, dezenas, centenas e milhares. Não exigir multiplicação: abra cada barra e conte dez cubos; uma placa pode abrir em dez barras. Erros: contar grupos como unidades, descartar sobras, aceitar troca incompleta ou perder um grupo na troca, pôr a sobra na ordem errada. Guie perguntando quantos cubos aparecem ao abrir um grupo e o que aconteceu com as peças soltas. Em 2 dezenas e 7 unidades, contraste dois grupos de dez com sete cubos; não anuncie 27 antes da contagem. Retome da U0 o registro no caderno e a possibilidade de pedir uma demonstração. Na próxima aula, levar estes mesmos blocos às casas do quadro posicional. Revisões propostas em 1, 3, 7 e 21 dias, alternando abrir e fechar grupos; em U2, retomar a conservação no reagrupamento. A reforma é um exemplo imaginado de contagem, sem recomendação profissional.',
  esboco:
    'Uma bancada acompanha a aula: arruelas de um exemplo imaginado viram cubos, sem trocar a quantidade. O aluno circunda dez cubos; eles se encaixam em uma barra com dez divisões visíveis. Sobras nunca saem do palco. Momento-chave: uma barra abre novamente em dez cubos e o contador do total fica imóvel, mostrando que organizar não é retirar. O gesto se repete com dez barras em uma placa e dez placas em um bloco de mil. Só depois surgem U, D, C e M. Para pouca movimentação, apresentar antes/depois lado a lado, mantendo o mesmo total e as divisões internas.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você comprou arruelas para uma reforma. Como saber quantas são sem contar uma por uma?',
      visual: blocos(
        { centenas: 0, dezenas: 0, unidades: 27, totalVisivel: false, objetos: 'arruelas' },
        '27 arruelas espalhadas numa bancada, sem numeral nem total revelado. Duas regiões comportam dez peças; sete ficam soltas.',
      ),
      esboco: 'Começar pela necessidade adulta de conferir material. A bancada permite observar a desorganização, sem sugerir a resposta numérica.',
    },
    {
      tipo: 'mexa',
      texto: 'Junte as peças em grupos de **10**. As que sobrarem ficam soltas.',
      visual: blocos(
        { centenas: 0, dezenas: 0, unidades: 27, tamanhoGrupo: 10, totalVisivel: false },
        'Cada arruela vira um cubo. Uma moldura com dez encaixes acompanha o gesto; peças excedentes continuam fora da moldura.',
        'Preservar a posição de cada peça na transformação de arruela para cubo.',
      ),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Forme todos os grupos de 10 que der.',
        sucesso: { centenas: 0, dezenas: 2, unidades: 7 },
        mostre: 'Preencher dez encaixes, fechá-los numa barra e repetir uma vez. Manter sete cubos soltos e o total oculto.',
      },
      descoberta: 'Organizar 27 peças produz dois grupos completos de dez e sete peças soltas; nenhum objeto é acrescentado ou retirado.',
      esboco: 'O aluno monta os grupos antes de saber o nome dezena. Ao fechar, as dez divisões permanecem discerníveis; sobras continuam no mesmo plano.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Duas barras de 10 e mais 7 peças soltas. Quantas peças são?',
      visual: blocos(
        { centenas: 0, dezenas: 2, unidades: 7, totalVisivel: false },
        'Duas barras de dez e sete cubos soltos. Cada barra pode abrir durante a explicação; ainda não mostrar algarismos por casa.',
      ),
      opcoes: [
        {
          texto: '27', certa: true,
          explica: 'Isso. Cada barra tem 10 peças: 10 + 10 + 7 = 27.',
          mostra: blocos(
            { centenas: 0, dezenas: 0, unidades: 27, total: 27 },
            'Abrir cada barra em dez cubos, conservar os sete soltos e revelar o contador 27 junto da coleção completa.',
            'As duas barras se abrem; nenhuma peça entra ou sai e o total permanece 27.',
          ),
        },
        {
          texto: '9', erro: 'conta-grupos-como-unidades',
          explica: 'Cada barra conta como 10 peças, não como 1. São 10 + 10 + 7.',
          mostra: blocos(
            { centenas: 0, dezenas: 2, unidades: 7, abrirDezenas: true, total: 27 },
            'Contornar os nove objetos visíveis e então abrir cada um dos dois objetos longos em dez cubos: objetos e unidades diferem.',
            'Expandir uma barra de cada vez, conservando a posição dos sete cubos soltos.',
          ),
        },
        {
          texto: '20', erro: 'descarta-sobra',
          explica: 'As barras dão 20. Faltou somar as 7 soltas.',
          mostra: blocos(
            { centenas: 0, dezenas: 2, unidades: 7, destaque: 'unidades', total: 27 },
            'Conservar duas barras à esquerda e contornar os sete cubos à direita. O contador passa de subtotal 20 ao total 27.',
          ),
        },
      ],
      esboco: 'A escolha abre ou destaca a própria coleção. O momento-chave é ver a quantidade conservada quando o formato das peças muda.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada peça é uma **unidade**. Um grupo de 10 unidades é uma **dezena**.',
      visual: blocos(
        { centenas: 0, dezenas: 1, unidades: 0, abrirDezenas: true, rotulos: ['unidade', 'dezena'] },
        'Comparar uma barra fechada com a mesma barra aberta em dez cubos; rotular um cubo como unidade e a barra como dezena.',
        'Os nomes aparecem depois do gesto que o aluno já realizou.',
      ),
      esboco: 'Dar nome ao objeto conhecido. Permitir alternar barra aberta e fechada; o tamanho do conjunto continua o mesmo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Há 9 peças na moldura. Já dá para trocar por 1 dezena?',
      visual: blocos(
        { centenas: 0, dezenas: 0, unidades: 9, tamanhoGrupo: 10 },
        'Moldura de dez encaixes com nove preenchidos e um vazio; uma barra completa aparece apenas como contorno.',
      ),
      opcoes: [
        {
          texto: 'Ainda falta 1 unidade', certa: true,
          explica: 'A barra tem 10 lugares. Com 9 unidades, um lugar fica vazio.',
          mostra: blocos(
            { centenas: 0, dezenas: 0, unidades: 9, tamanhoGrupo: 10, faltam: 1 },
            'Manter o encaixe vazio à vista e confrontá-lo com a décima divisão da barra de referência.',
          ),
        },
        {
          texto: 'Sim, 9 já está perto de 10', erro: 'troca-incompleta',
          explica: 'Uma dezena tem exatamente 10. Com 9, ainda falta 1.',
          mostra: blocos(
            { antes: 9, tentativa: 10, unidadesCriadas: 1, tamanhoGrupo: 10 },
            'Sobrepor os nove cubos ao desenho da barra; a divisão que não tem cubo ganha um contorno isolado.',
          ),
        },
      ],
      esboco: 'A previsão distingue troca exata de aproximação. Mostrar o cubo que precisaria aparecer do nada, sem aceitar a troca.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora junte **10 barras**. As que sobrarem ficam soltas.',
      visual: blocos(
        { centenas: 0, dezenas: 12, unidades: 4, tamanhoGrupo: 10 },
        'Doze barras e quatro cubos. Dez barras cabem lado a lado num contorno quadrado de dez por dez divisões.',
      ),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Troque 10 barras por uma placa.',
        sucesso: { centenas: 1, dezenas: 2, unidades: 4 },
        mostre: 'Alinhar dez barras na placa, deixando duas barras e quatro cubos fora. Abrir a placa uma vez para conferir as dez barras.',
      },
      descoberta: 'Dez dezenas formam cem unidades; a troca produz uma placa e conserva as duas barras e quatro cubos restantes.',
      esboco: 'Repetir o gesto da dezena, agora com barras. A placa preserva a grade interna; não introduzir uma conta de multiplicação.',
    },
    {
      tipo: 'ideia',
      texto: '10 dezenas formam 100 unidades: uma **centena**.',
      visual: blocos(
        { centenas: 1, dezenas: 0, unidades: 0, abrirCentenas: true, total: 100 },
        'Uma placa abre em dez barras, e uma delas abre em dez cubos. Rotular a placa centena; manter a grade de cem partes.',
        'As barras se alinham e voltam a compor a placa, sem cortar nenhuma divisão.',
      ),
      esboco: 'Nomear a centena só depois da troca. O aluno pode conferir barras e cubos sem decorar uma multiplicação.',
    },
    {
      tipo: 'mexa',
      texto: 'E continua: **10 centenas** formam um **milhar**, 1.000 unidades.',
      visual: blocos(
        { milhares: 0, centenas: 10, dezenas: 0, unidades: 0, total: 1000 },
        'Dez placas de cem separadas numa pilha baixa. Ao lado, contorno de um bloco com dez camadas do tamanho das placas.',
      ),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Junte as 10 placas num bloco de mil.',
        sucesso: { milhares: 1, centenas: 0, dezenas: 0, unidades: 0 },
        mostre: 'Empilhar as dez placas sem escondê-las; indicar as dez camadas e revelar 1.000 no total, que não muda.',
      },
      descoberta: 'O agrupamento em dez se repete nas ordens seguintes: dez centenas têm a mesma quantidade que um milhar.',
      esboco: 'O milhar é uma continuação do mesmo gesto. Permitir afastar as camadas e conferir a presença das dez placas.',
    },
    {
      tipo: 'anote',
      titulo: 'Agrupamento decimal',
      definicao: 'Contamos em grupos de 10: 10 unidades formam 1 dezena; 10 dezenas formam 1 centena. O total não muda.',
      exemplo: {
        tex: '10\\text{ unidades}=1\\text{ dezena};\\quad 10\\text{ dezenas}=1\\text{ centena}',
        fala: 'dez unidades formam uma dezena; dez dezenas formam uma centena',
      },
      alerta: 'Só troque grupos completos de 10. As unidades que sobram continuam no total.',
      esboco: 'No caderno, desenhar dez cubos ligados a uma barra e dez barras ligadas a uma placa. Copiar a definição, o exemplo e o alerta.',
    },
    {
      tipo: 'passo',
      problema: 'Organize **137 unidades** em centenas, dezenas e unidades.',
      visual: blocos(
        { centenas: 0, dezenas: 0, unidades: 137, organizarEmLinhasDe: 10, total: 137 },
        '137 cubos em treze linhas de dez e uma linha com sete. Separar visualmente quantidade total e quantidade de grupos.',
      ),
      passos: [
        {
          pergunta: 'Juntando as unidades de 10 em 10, o que você tem?',
          opcoes: [
            {
              texto: '13 dezenas e 7 unidades', certa: true,
              explica: 'Isso. Dá 13 grupos de 10, e sobram 7 cubos soltos.',
              mostra: blocos(
                { centenas: 0, dezenas: 13, unidades: 7, total: 137 },
                'Fechar cada uma das treze linhas em uma barra, mantendo a linha curta com os sete cubos.',
              ),
            },
            {
              texto: '13 dezenas, sem unidades', erro: 'descarta-sobra',
              explica: 'E os 7 cubos que sobraram? Eles também contam.',
              mostra: blocos(
                { centenas: 0, dezenas: 13, unidades: 7, destaque: 'unidades', total: 137 },
                'Desenhar um contorno em torno da linha curta; mostrar 130 nas barras e 7 nos cubos, sem removê-los.',
              ),
            },
            {
              texto: '7 dezenas e 13 unidades', erro: 'sobra-na-casa-errada',
              explica: 'Ao contrário: são 13 grupos de 10, e sobram 7 soltas.',
              mostra: blocos(
                { centenas: 0, dezenas: 13, unidades: 7, total: 137, rotulos: ['D', 'U'] },
                'Pôr o rótulo D nas treze barras e U nos sete cubos. Confrontar com a tentativa, que teria sete barras e treze cubos.',
              ),
            },
          ],
          linha: { tex: '137\\text{ unidades}=13\\text{ dezenas}+7\\text{ unidades}', fala: 'cento e trinta e sete unidades são treze dezenas e sete unidades' },
        },
        {
          pergunta: 'Agora troque 10 das 13 barras por uma placa. O que fica fora da placa?',
          opcoes: [
            {
              texto: '3 dezenas e 7 unidades', certa: true,
              explica: 'Isso. 10 barras viram a placa. Ficam 3 barras e 7 cubos.',
              mostra: blocos(
                { centenas: 1, dezenas: 3, unidades: 7, total: 137 },
                'Deslizar dez barras para a placa e manter três barras e sete cubos nas posições anteriores.',
              ),
            },
            {
              texto: '2 dezenas e 7 unidades', erro: 'troca-incompleta',
              explica: 'Das 13 barras, 10 viram a placa. 13 − 10 = 3: ficam 3 barras, não 2.',
              mostra: blocos(
                { centenas: 1, dezenas: 3, unidades: 7, total: 137, conferirDezenas: 13 },
                'Numerar temporariamente as treze barras e seguir dez até a placa. As barras 11, 12 e 13 permanecem fora.',
              ),
            },
            {
              texto: '7 dezenas e 3 unidades', erro: 'sobra-na-casa-errada',
              explica: 'Ficam 3 barras e 7 cubos, não o contrário.',
              mostra: blocos(
                { centenas: 1, dezenas: 3, unidades: 7, total: 137, rotulos: ['C', 'D', 'U'] },
                'Rotular os três tipos de peça e contornar separadamente as três barras e os sete cubos.',
              ),
            },
          ],
          linha: { tex: '13\\text{ dezenas}=1\\text{ centena}+3\\text{ dezenas}', fala: 'treze dezenas são uma centena e três dezenas' },
        },
        {
          pergunta: 'A quantidade total mudou depois das duas trocas?',
          opcoes: [
            {
              texto: 'Não: continuam 137 unidades', certa: true,
              explica: 'Isso. A placa vale 100, as barras 30, e há 7 soltos: 137.',
              mostra: blocos(
                { centenas: 1, dezenas: 3, unidades: 7, total: 137, subtotais: [100, 30, 7] },
                'Abrir placa e barras por demanda, mantendo o total fixo; três etiquetas mostram 100, 30 e 7 sob cada conjunto.',
              ),
            },
            {
              texto: 'Sim: agora são 11 unidades', erro: 'conta-grupos-como-unidades',
              explica: 'São 11 peças na tela, mas a placa vale 100 e cada barra vale 10.',
              mostra: blocos(
                { centenas: 1, dezenas: 3, unidades: 7, total: 137, abrirTodos: true },
                'Abrir a placa em cem cubos e as barras em trinta, junto dos sete soltos; contrastar onze objetos com 137 unidades.',
              ),
            },
          ],
          linha: { tex: '137=100+30+7', fala: 'cento e trinta e sete é cem mais trinta mais sete' },
        },
      ],
      esboco: 'O caderno registra uma troca por escolha. Manter o palco de 137 peças do começo ao fim; rótulos C, D e U só resumem grupos já vistos.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, desenhe 2 placas, 13 barras e 6 cubos. Troque 10 barras por 1 placa e digite o total.',
      resposta: 336,
      resolucao: [
        { tex: '13\\text{ dezenas}=1\\text{ centena}+3\\text{ dezenas}', fala: 'treze dezenas formam uma centena e três dezenas' },
        { tex: '2\\text{ centenas}+13\\text{ dezenas}+6\\text{ unidades}=3\\text{ centenas}+3\\text{ dezenas}+6\\text{ unidades}', fala: 'duas centenas, treze dezenas e seis unidades equivalem a três centenas, três dezenas e seis unidades' },
        { tex: '336=300+30+6', fala: 'trezentos e trinta e seis é trezentos mais trinta mais seis' },
      ],
      esboco: 'Pedir desenho com placas e barras esquemáticas, sem 336 cubinhos. Ao conferir, circular dez barras e a nova placa; comparar estratégia e total.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['agrupamento-n1', 'agrupamento-n2', 'agrupamento-n3'],
      esboco: 'Primeiro contar grupos com sobras e visual; depois resolver trocas; por fim, contar material em contexto imaginado sem palco de apoio.',
    },
    {
      tipo: 'fecho',
      texto: 'As arruelas: 2 grupos de 10 e 7 soltas. São **27**, sem contar uma por uma. Na próxima aula, cada grupo ganha uma casa.',
      visual: blocos(
        { centenas: 0, dezenas: 2, unidades: 7, total: 27, objetos: 'arruelas', casasFuturas: ['D', 'U'] },
        'Voltar à bancada inicial; dois feixes de dez arruelas e sete soltas. Surgem contornos vazios D e U abaixo, como ponte à próxima aula.',
        'Recolocar as arruelas sobre os cubos e preservar os grupos; só os contornos do quadro começam a aparecer.',
      ),
      esboco: 'Responder à pergunta de conferência do gancho: organizar poupa recontagem e conserva peças. Preparar o quadro posicional sem ensinar outro conceito.',
    },
  ],
}
