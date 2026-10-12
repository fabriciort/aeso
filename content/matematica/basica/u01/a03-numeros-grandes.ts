import type { Aula, Visual } from '@/lib/formation/schema'

const quadro = (estado: Visual['estado'], esboco: string, movimento?: string): Visual => ({
  modelo: 'quadro-posicional', estado, esboco, ...(movimento ? { movimento } : {}),
})

export const aula: Aula = {
  id: 'B.U1.A3',
  titulo: 'Números grandes',
  objetivo: 'Ler e escrever naturais até bilhões, separar classes de três algarismos, preservar zeros e reconhecer o milhar brasileiro e inglês.',
  modelo: 'quadro-posicional',
  vega:
    'Ideia central: o quadro da aula anterior continua; cada três casas forma uma classe. Agrupar da direita para a esquerda: unidades, milhares, milhões, bilhões. Ler cada grupo e seu nome; classes zeradas não são pronunciadas, mas continuam ocupando três casas na escrita. Retomar A1: dez unidades de uma ordem formam uma da seguinte; três passos de dez ligam uma classe à seguinte. Não exigir multiplicação ou potências. No Brasil, um bilhão é 1.000.000.000; o ponto agrupa milhares. No formato inglês usado aqui, a vírgula agrupa milhares: 12,500 significa doze mil e quinhentos. A mesma cadeia em português seria escrita decimal: apenas alertar para conferir idioma e separador, sem ensinar operações decimais nesta aula. Erros: classe-errada, esquece-zero, concatena-casas e separador-decimal. Guie pedindo começar pela última casa, formar trios e nomear cada trio; para um zero omitido, pergunte qual casa ficaria vazia. Não ditar o número final nos cartões Caderno ou Sua vez. Todos os arquivos e suas quantidades são exemplos imaginados, não estatísticas reais. Revisão em 1, 3, 7 e 21 dias: intercalar uma escrita por classes, uma casa do A2 e uma troca do A1; voltar à leitura de números no orçamento de U2 e na notação científica de U13.',
  esboco:
    'O quadro da A2 se estende horizontalmente, com unidades à direita sempre visíveis. No celular, cada classe é um trio que pode ser expandido; os nomes e a posição das classes permanecem no cabeçalho. Momento-chave: arrastar a divisória de 12.500 para formar 12 | 500 e ver que o 12 conta milhares, enquanto 500 conta unidades. Em seguida, zeros preservam trios inteiros numa escrita com milhões. Só após compreender as classes, alternar a etiqueta português/inglês: muda o separador, mas algarismos, quadro e quantidade ficam imóveis. Para pouca movimentação, usar os mesmos estados antes/depois sem deslocamento contínuo.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'No Brasil, escrevemos **12.500**. Num site americano, aparece **12,500**. É a mesma quantidade?',
      fala: 'No Brasil, escrevemos doze, ponto, quinhentos. Num site americano, aparece doze, vírgula, quinhentos. É a mesma quantidade?',
      visual: quadro(
        { numeros: [12500, 12500], etiquetas: ['12.500', '12,500'], formatos: ['pt-BR', 'en-US'], quantidadeOculta: true },
        'Duas etiquetas de arquivo no mesmo quadro, com idioma escrito ao lado do número. Ocultar leitura por extenso e quantidade até a exploração.',
      ),
      esboco: 'Abrir com uma dúvida sobre quantidade e convenção de escrita. Os rótulos de idioma evitam apresentar a vírgula de forma ambígua.',
    },
    {
      tipo: 'mexa',
      texto: 'Comece pela direita e separe os algarismos em grupos de **3**.',
      visual: quadro(
        { algarismos: [1, 2, 5, 0, 0], separadores: [], tamanhoGrupo: 3, nomesOcultos: true },
        'Os algarismos 1 2 5 0 0 saem da etiqueta portuguesa e ocupam cinco casas. Uma divisória pode encaixar depois de cada trio contado da direita.',
      ),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Conte 3 algarismos a partir da direita e ponha um ponto.',
        sucesso: { grupos: [[1, 2], [5, 0, 0]] },
        mostre: 'Marcar as três casas finais, inserir a divisória e deixar 1 e 2 no grupo da esquerda: 12 | 500.',
      },
      descoberta: 'Os três últimos algarismos pertencem à classe das unidades. O grupo à esquerda conta milhares e pode ter menos de três algarismos.',
      esboco: 'Reusar o hábito da A2 de começar pelas unidades à direita. O aluno faz a separação antes de ver os nomes das classes.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em **12 | 500**, o 12 conta o quê?',
      visual: quadro(
        { grupos: [12, 500], classes: [null, 'unidades'], casasPorClasse: 3 },
        'Acender o trio da direita como unidades; manter o nome da classe à esquerda em branco, sem revelar a resposta.',
      ),
      opcoes: [
        {
          texto: 'Milhares', certa: true,
          explica: 'Isso. São 12 mil e mais 500: doze mil e quinhentos.',
          mostra: quadro(
            { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], parcelas: [12000, 500] },
            'Revelar milhares sobre 12 e unidades sobre 500; desenhar 12.000 e 500 abaixo de seus grupos, mantendo o número unido.',
          ),
        },
        {
          texto: 'Unidades', erro: 'classe-errada',
          explica: 'As unidades são o grupo da direita, o 500. O 12 conta milhares.',
          mostra: quadro(
            { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], destaque: 'milhares' },
            'Contar U, D e C no trio 500; o primeiro algarismo à esquerda fica na casa dos milhares, sem fundir os dois grupos.',
          ),
        },
        {
          texto: 'Milhões', erro: 'classe-errada',
          explica: 'Antes dos milhões vêm os milhares. O 12 conta milhares: 12 mil.',
          mostra: quadro(
            { numero: 12500, grupos: [0, 12, 500], classes: ['milhões', 'milhares', 'unidades'], destaque: 'milhares' },
            'Acrescentar um trio vazio à esquerda de 12 | 500: milhões. Mostrar que 12 está no trio central, não naquele vazio.',
          ),
        },
      ],
      esboco: 'Fazer o grupo ganhar seu nome e seu valor diante da escolha. Esse encaixe entre grupo e classe é o momento-chave da aula.',
    },
    {
      tipo: 'ideia',
      texto: 'Cada grupo de 3 é uma **classe**. Da direita: unidades, milhares, milhões, bilhões. Mil milhares formam um **milhão**.',
      visual: quadro(
        { classes: ['bilhões', 'milhões', 'milhares', 'unidades'], casasPorClasse: 3, grupos: [0, 0, 12, 500] },
        'Expandir o quadro em quatro trios. Dentro de cada classe repetir C, D e U; em cima manter o nome completo da classe.',
        'Os novos trios entram pela esquerda; as unidades permanecem na posição que o aluno já conhece.',
      ),
      esboco: 'Dar nomes à extensão do quadro, mantendo casas e classes visualmente distintas. Cada trio pode ser tocado para ouvir seu nome.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Como se escreve **1 bilhão**?',
      visual: quadro(
        { classes: ['bilhões', 'milhões', 'milhares', 'unidades'], grupos: [1, 0, 0, 0], numeroOculto: true },
        'Um cartão 1 fica na classe bilhões. Os três trios seguintes têm molduras vazias para a previsão da escrita.',
      ),
      opcoes: [
        {
          texto: '1.000.000.000', certa: true,
          explica: 'Isso. 1 bilhão tem 4 classes: o 1 e mais três grupos de 000.',
          mostra: quadro(
            { numero: 1000000000, grupos: [1, 0, 0, 0], classes: ['bilhões', 'milhões', 'milhares', 'unidades'], escrita: '1.000.000.000' },
            'Preencher os três trios à direita com 000 e exibir 1.000.000.000. Marcar cada classe ao ler o nome.',
          ),
        },
        {
          texto: '1.000.000', erro: 'classe-errada',
          explica: 'Esse é 1 milhão. Para 1 bilhão, falta mais um grupo de 000.',
          mostra: quadro(
            { numeros: [1000000, 1000000000], grupos: [[0, 1, 0, 0], [1, 0, 0, 0]], classes: ['bilhões', 'milhões', 'milhares', 'unidades'] },
            'Alinhar um milhão e um bilhão pelas unidades. O cartão 1 está uma classe mais à esquerda no bilhão.',
          ),
        },
        {
          texto: '1.000', erro: 'classe-errada',
          explica: 'Esse é mil. Para 1 bilhão, faltam mais dois grupos de 000.',
          mostra: quadro(
            { numeros: [1000, 1000000000], grupos: [[0, 0, 1, 0], [1, 0, 0, 0]], classes: ['bilhões', 'milhões', 'milhares', 'unidades'] },
            'Alinhar um milhar e um bilhão num único quadro de quatro classes. Contornar a classe ocupada pelo 1 em cada linha.',
          ),
        },
      ],
      esboco: 'Fixar explicitamente o bilhão brasileiro por posição, sem apelar ao número de zeros como regra desconectada das classes.',
    },
    {
      tipo: 'mexa',
      texto: 'Monte **2 bilhões, 5 milhões, 40 mil e 6**.',
      visual: quadro(
        { classes: ['bilhões', 'milhões', 'milhares', 'unidades'], cartoes: [2, 5, 40, 6], grupos: [null, null, null, null] },
        'Cartões 2, 5, 40 e 6 abaixo de quatro trios. Cada cartão encaixa à direita do trio; as casas vazias internas recebem zeros.',
      ),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Ponha cada número na classe dele.',
        sucesso: { grupos: [2, 5, 40, 6], numero: 2005040006 },
        mostre: 'Colocar 2 em bilhões, 005 em milhões, 040 em milhares e 006 em unidades; ler 2.005.040.006 acompanhando os trios.',
      },
      descoberta: 'Zeros completam as casas vazias dentro dos trios. A primeira classe pode ser escrita sem zeros à esquerda; as seguintes mantêm três casas.',
      esboco: 'O total aparece como 2.005.040.006 apenas ao concluir os encaixes. Permitir abrir cada trio para conferir o papel dos zeros da A2.',
    },
    {
      tipo: 'ideia',
      texto: 'Para ler, diga cada grupo com o nome da classe: **2 bilhões, 5 milhões, 40 mil e 6**.',
      visual: quadro(
        { numero: 2005040006, grupos: [2, 5, 40, 6], classes: ['bilhões', 'milhões', 'milhares', 'unidades'], leituras: ['2 bilhões', '5 milhões', '40 mil', '6'] },
        'Manter o número montado. Ao tocar um trio, destacá-lo e ler sua quantidade com o nome da classe; no último, ler apenas seis.',
      ),
      esboco: 'Converter a montagem anterior em leitura. Os zeros continuam desenhados, embora a leitura de 005 seja cinco e a de 006 seja seis.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Num site em **inglês**, um produto tem **12,500** avaliações. Quantas são?',
      visual: quadro(
        { etiqueta: '12,500', formato: 'en-US', idioma: 'inglês', quantidadeOculta: true },
        'Etiqueta 12,500 com inglês ao lado. O quadro reaparece só no feedback, para que a escolha ainda seja uma previsão.',
      ),
      opcoes: [
        {
          texto: 'Doze mil e quinhentos', certa: true,
          explica: 'Isso. Em inglês, a vírgula separa os grupos: 12 | 500.',
          mostra: quadro(
            { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], escritas: ['12,500', '12.500'] },
            'A vírgula abre espaço para a divisória 12 | 500; mostrar a etiqueta portuguesa 12.500 abaixo do mesmo quadro.',
          ),
        },
        {
          texto: 'Doze vírgula quinhentos', erro: 'separador-decimal',
          explica: 'Em português, a vírgula seria de número quebrado. Em inglês, ela só separa os grupos: 12 mil e 500.',
          mostra: quadro(
            { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], formato: 'en-US', separadorMilhar: ',' },
            'Contornar o rótulo inglês e ligar a vírgula à fronteira das classes. Não construir um quadro decimal nesta aula.',
          ),
        },
      ],
      esboco: 'Ensinar a checar a convenção antes de interpretar o símbolo. A vírgula decimal brasileira é só um alerta de leitura, sem conteúdo de decimais.',
    },
    {
      tipo: 'anote',
      titulo: 'Classes numéricas',
      definicao: 'Classe é cada grupo de 3 casas, contado da direita: unidades, milhares, milhões, bilhões.',
      exemplo: { tex: '12.500=12.000+500', fala: 'doze mil e quinhentos é doze mil mais quinhentos' },
      alerta: 'Todo grupo, menos o da esquerda, tem 3 algarismos. Complete com zeros: 3 milhões e 40 mil é 3.040.000.',
      esboco: 'Copiar definição, exemplo e alerta; abaixo, desenhar dois trios com milhares e unidades. Na margem, registrar português 12.500 e inglês 12,500.',
    },
    {
      tipo: 'passo',
      problema: 'Escreva com algarismos: **3 milhões, 40 mil e 6**.',
      visual: quadro(
        { classes: ['milhões', 'milhares', 'unidades'], grupos: [null, null, null], cartoes: [3, 40, 6] },
        'Três trios vazios e os cartões 3, 40 e 6. O caderno recebe primeiro as classes, depois a escrita e por fim a conferência.',
      ),
      passos: [
        {
          pergunta: 'Em que classe vai o 3?',
          opcoes: [
            {
              texto: 'Milhões', certa: true,
              explica: 'Isso. São 3 milhões: o 3 vai na classe dos milhões.',
              mostra: quadro(
                { classes: ['milhões', 'milhares', 'unidades'], grupos: [3, null, null] },
                'Encaixar o 3 na última casa do trio milhões, deixando os outros dois trios livres para os próximos grupos.',
              ),
            },
            {
              texto: 'Milhares', erro: 'classe-errada',
              explica: 'Nos milhares, o 3 valeria só 3 mil. Ele vai uma classe à esquerda: milhões.',
              mostra: quadro(
                { classes: ['milhões', 'milhares', 'unidades'], tentativa: [null, 3, null], correto: [3, null, null] },
                'Comparar o 3 em milhares com o 3 em milhões; deslocar o cartão um trio para a esquerda, marcando o nome da classe.',
              ),
            },
          ],
          linha: { tex: '3\\text{ milhões}=3.000.000', fala: 'três milhões são três milhões de unidades' },
        },
        {
          pergunta: 'E como ficam o 40 mil e o 6?',
          opcoes: [
            {
              texto: '3 | 040 | 006', certa: true,
              explica: 'Isso. Cada grupo tem 3 algarismos: 040 e 006.',
              mostra: quadro(
                { numero: 3040006, grupos: [3, 40, 6], escritas: ['3', '040', '006'], classes: ['milhões', 'milhares', 'unidades'] },
                'Encaixar 40 e 6 à direita de seus trios e preencher as casas vazias com zeros; ler 3 | 040 | 006.',
              ),
            },
            {
              texto: '3 | 40 | 6', erro: 'esquece-zero',
              explica: 'Sem os zeros, vira 3406: três mil quatrocentos e seis. Cada grupo precisa de 3 algarismos.',
              mostra: quadro(
                { numeros: [3406, 3040006], grupos: [[0, 3, 406], [3, 40, 6]], classes: ['milhões', 'milhares', 'unidades'] },
                'Alinhar 3406 e 3.040.006 pelas unidades. Na primeira linha, o 3 cai nos milhares; na segunda, permanece nos milhões.',
              ),
            },
            {
              texto: '3000000 | 40000 | 6', erro: 'concatena-casas',
              explica: 'Assim você cola os números inteiros. Em cada classe vai só o grupo: 3 | 040 | 006.',
              mostra: quadro(
                { numero: 3040006, parcelas: [3000000, 40000, 6], grupos: [3, 40, 6], classes: ['milhões', 'milhares', 'unidades'] },
                'Alinhar as três parcelas nas casas correspondentes em linhas separadas; montar uma única linha, sem concatenar suas escritas.',
              ),
            },
          ],
          linha: { tex: '\\text{classes: }3\\;|\\;040\\;|\\;006', fala: 'classes: três milhões, quarenta milhares e seis unidades' },
        },
        {
          pergunta: 'Para conferir: qual soma dá 3.040.006?',
          opcoes: [
            {
              texto: '3.000.000 + 40.000 + 6', certa: true,
              explica: 'Isso. Cada parte da soma é uma classe: 3 milhões, 40 mil e 6.',
              mostra: quadro(
                { numero: 3040006, parcelas: [3000000, 40000, 6], grupos: [3, 40, 6], classes: ['milhões', 'milhares', 'unidades'] },
                'Ligar cada grupo à parcela correspondente, com as unidades alinhadas à direita nas três linhas.',
              ),
            },
            {
              texto: '3.000.000 + 400 + 6', erro: 'classe-errada',
              explica: 'O 040 está nos milhares: vale 40.000, não 400.',
              mostra: quadro(
                { numero: 3040006, grupoEmFoco: 40, classeEmFoco: 'milhares', valorDoGrupo: 40000 },
                'Expandir o trio milhares em suas três casas; o 4 ocupa dezenas de milhar e corresponde à parcela 40.000.',
              ),
            },
          ],
          linha: { tex: '3.040.006=3.000.000+40.000+6', fala: 'três milhões, quarenta mil e seis é três milhões mais quarenta mil mais seis' },
        },
      ],
      esboco: 'Diminuir o apoio a cada decisão: primeiro nome da classe, depois zeros, depois a soma que confere. O quadro escreve uma linha por acerto.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, escreva **7 milhões, 40 mil e 9** com algarismos. Depois digite aqui.',
      resposta: 7040009,
      resolucao: [
        { tex: '\\text{milhões }7\\;|\\;\\text{milhares }040\\;|\\;\\text{unidades }009', fala: 'sete na classe dos milhões, zero quatro zero na classe dos milhares e zero zero nove na classe das unidades' },
        { tex: '7.040.009=7.000.000+40.000+9', fala: 'sete milhões, quarenta mil e nove é sete milhões mais quarenta mil mais nove' },
      ],
      esboco: 'Resolver com trios desenhados no papel antes de digitar. Na conferência, realçar os zeros de 040 e 009 e comparar com a soma das classes.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['numeros-grandes-n1', 'numeros-grandes-n2', 'numeros-grandes-n3'],
      esboco: 'Começar por milhares com quadro; incluir milhões e classes vazias no segundo nível; chegar a bilhões e leitura de formato em contexto, sem apoio.',
    },
    {
      tipo: 'fecho',
      texto: '**12.500** e **12,500** são o mesmo número: doze mil e quinhentos. Só muda o sinal entre os grupos. Na próxima aula: comparar números.',
      fala: 'Doze, ponto, quinhentos e doze, vírgula, quinhentos são o mesmo número: doze mil e quinhentos. Só muda o sinal entre os grupos. Na próxima aula: comparar números.',
      visual: quadro(
        { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], escritas: ['12.500', '12,500'], formatos: ['pt-BR', 'en-US'] },
        'Voltar às duas etiquetas do gancho e ligar ambas ao quadro 12 | 500. Ao lado, reservar um espaço para a reta da próxima aula, sem ordenação nova.',
      ),
      esboco: 'Responder explicitamente à pergunta inicial: a quantidade é a mesma nos formatos indicados. Manter os idiomas visíveis para preservar a condição.',
    },
  ],
}
