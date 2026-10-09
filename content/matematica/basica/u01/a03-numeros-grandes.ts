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
      texto: 'Exemplo imaginado: arquivos mostram **12.500** fotos em português e **12,500** em inglês. São a mesma quantidade?',
      fala: 'Exemplo imaginado: um arquivo mostra doze, ponto, quinhentos em português; outro mostra doze, vírgula, quinhentos em inglês. São a mesma quantidade?',
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
        instrucao: 'Separe 12500 em grupos, contando da direita.',
        sucesso: { grupos: [[1, 2], [5, 0, 0]] },
        mostre: 'Marcar as três casas finais, inserir a divisória e deixar 1 e 2 no grupo da esquerda: 12 | 500.',
      },
      descoberta: 'Os três últimos algarismos pertencem à classe das unidades. O grupo à esquerda conta milhares e pode ter menos de três algarismos.',
      esboco: 'Reusar o hábito da A2 de começar pelas unidades à direita. O aluno faz a separação antes de ver os nomes das classes.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em **12 | 500**, o grupo 12 conta o quê?',
      visual: quadro(
        { grupos: [12, 500], classes: [null, 'unidades'], casasPorClasse: 3 },
        'Acender o trio da direita como unidades; manter o nome da classe à esquerda em branco, sem revelar a resposta.',
      ),
      opcoes: [
        {
          texto: 'Milhares', certa: true,
          explica: 'Isso: são 12 mil e mais 500 unidades.',
          mostra: quadro(
            { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], parcelas: [12000, 500] },
            'Revelar milhares sobre 12 e unidades sobre 500; desenhar 12.000 e 500 abaixo de seus grupos, mantendo o número unido.',
          ),
        },
        {
          texto: 'Unidades', erro: 'classe-errada',
          explica: 'As unidades ficam no trio da direita. O grupo seguinte conta milhares.',
          mostra: quadro(
            { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], destaque: 'milhares' },
            'Contar U, D e C no trio 500; o primeiro algarismo à esquerda fica na casa dos milhares, sem fundir os dois grupos.',
          ),
        },
        {
          texto: 'Milhões', erro: 'classe-errada',
          explica: 'Entre unidades e milhões existe a classe dos milhares.',
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
      texto: 'Cada trio é uma **classe**: unidades, milhares, milhões, bilhões, da direita para a esquerda.',
      visual: quadro(
        { classes: ['bilhões', 'milhões', 'milhares', 'unidades'], casasPorClasse: 3, grupos: [0, 0, 12, 500] },
        'Expandir o quadro em quatro trios. Dentro de cada classe repetir C, D e U; em cima manter o nome completo da classe.',
        'Os novos trios entram pela esquerda; as unidades permanecem na posição que o aluno já conhece.',
      ),
      esboco: 'Dar nomes à extensão do quadro, mantendo casas e classes visualmente distintas. Cada trio pode ser tocado para ouvir seu nome.',
    },
    {
      tipo: 'ideia',
      texto: 'Mil milhares formam um **milhão**. Mil milhões formam um **bilhão**.',
      visual: quadro(
        { transicoes: [[1000, 1000000], [1000000, 1000000000]], saltosPorClasse: 3, agrupamentoPorOrdem: 10 },
        'Sobre as casas, traçar três saltos curtos de dez entre unidades de classes vizinhas. Ao fim dos três saltos, mudar mil para milhão e milhão para bilhão.',
        'Mostrar três reagrupamentos consecutivos, sem comprimir o raciocínio num salto sem explicação.',
      ),
      esboco: 'Retomar os grupos de dez da A1: dez, cem e mil grupos. Cada toque avança um dos três reagrupamentos e deixa o anterior disponível para conferir. Não pedir operação de multiplicação nem notação de potência.',
    },
    {
      tipo: 'aposta',
      pergunta: 'No Brasil, qual escrita representa **1 bilhão**?',
      visual: quadro(
        { classes: ['bilhões', 'milhões', 'milhares', 'unidades'], grupos: [1, 0, 0, 0], numeroOculto: true },
        'Um cartão 1 fica na classe bilhões. Os três trios seguintes têm molduras vazias para a previsão da escrita.',
      ),
      opcoes: [
        {
          texto: '1.000.000.000', certa: true,
          explica: 'Um bilhão ocupa a quarta classe; três classes ficam à direita.',
          mostra: quadro(
            { numero: 1000000000, grupos: [1, 0, 0, 0], classes: ['bilhões', 'milhões', 'milhares', 'unidades'], escrita: '1.000.000.000' },
            'Preencher os três trios à direita com 000 e exibir 1.000.000.000. Marcar cada classe ao ler o nome.',
          ),
        },
        {
          texto: '1.000.000', erro: 'classe-errada',
          explica: 'Essa escrita tem três classes: representa 1 milhão.',
          mostra: quadro(
            { numeros: [1000000, 1000000000], grupos: [[0, 1, 0, 0], [1, 0, 0, 0]], classes: ['bilhões', 'milhões', 'milhares', 'unidades'] },
            'Alinhar um milhão e um bilhão pelas unidades. O cartão 1 está uma classe mais à esquerda no bilhão.',
          ),
        },
        {
          texto: '1.000', erro: 'classe-errada',
          explica: 'Essa escrita tem duas classes: representa 1 milhar.',
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
      texto: 'Monte **2 bilhões, 5 milhões, 40 mil e 6 unidades**. Cada classe guarda três casas.',
      visual: quadro(
        { classes: ['bilhões', 'milhões', 'milhares', 'unidades'], cartoes: [2, 5, 40, 6], grupos: [null, null, null, null] },
        'Cartões 2, 5, 40 e 6 abaixo de quatro trios. Cada cartão encaixa à direita do trio; as casas vazias internas recebem zeros.',
      ),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Coloque cada grupo na classe correspondente.',
        sucesso: { grupos: [2, 5, 40, 6], numero: 2005040006 },
        mostre: 'Colocar 2 em bilhões, 005 em milhões, 040 em milhares e 006 em unidades; ler 2.005.040.006 acompanhando os trios.',
      },
      descoberta: 'Zeros completam as casas vazias dentro dos trios. A primeira classe pode ser escrita sem zeros à esquerda; as seguintes mantêm três casas.',
      esboco: 'O total aparece como 2.005.040.006 apenas ao concluir os encaixes. Permitir abrir cada trio para conferir o papel dos zeros da A2.',
    },
    {
      tipo: 'ideia',
      texto: 'Leia cada grupo com o nome da classe: **2 bilhões, 5 milhões, 40 mil e 6**.',
      visual: quadro(
        { numero: 2005040006, grupos: [2, 5, 40, 6], classes: ['bilhões', 'milhões', 'milhares', 'unidades'], leituras: ['2 bilhões', '5 milhões', '40 mil', '6'] },
        'Manter o número montado. Ao tocar um trio, destacá-lo e ler sua quantidade com o nome da classe; no último, ler apenas seis.',
      ),
      esboco: 'Converter a montagem anterior em leitura. Os zeros continuam desenhados, embora a leitura de 005 seja cinco e a de 006 seja seis.',
    },
    {
      tipo: 'ideia',
      texto: 'No padrão brasileiro, o milhar usa ponto: **12.500**. No inglês, usa vírgula: **12,500**.',
      fala: 'No padrão brasileiro, o milhar usa ponto: doze mil e quinhentos. No inglês, usa vírgula para a mesma quantidade.',
      visual: quadro(
        { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], formatos: ['pt-BR', 'en-US'], escritas: ['12.500', '12,500'] },
        'Um único quadro 12 | 500 sustenta as duas etiquetas com idioma. Trocar somente o separador, mantendo cada algarismo na mesma casa.',
        'O ponto da etiqueta portuguesa vira vírgula na inglesa; o quadro e a quantidade permanecem imóveis.',
      ),
      esboco: 'Resolver a dúvida do gancho por convenção explícita. Usar o idioma por extenso, sem exigir familiaridade com códigos de localização.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um arquivo em **inglês** mostra **12,500** fotos. Como ler essa quantidade?',
      visual: quadro(
        { etiqueta: '12,500', formato: 'en-US', idioma: 'inglês', quantidadeOculta: true },
        'Etiqueta 12,500 com inglês ao lado. O quadro reaparece só no feedback, para que a escolha ainda seja uma previsão.',
      ),
      opcoes: [
        {
          texto: 'Doze mil e quinhentos', certa: true,
          explica: 'Nesse formato, a vírgula separa os milhares: 12 | 500.',
          mostra: quadro(
            { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], escritas: ['12,500', '12.500'] },
            'A vírgula abre espaço para a divisória 12 | 500; mostrar a etiqueta portuguesa 12.500 abaixo do mesmo quadro.',
          ),
        },
        {
          texto: 'Doze vírgula quinhentos', erro: 'separador-decimal',
          explica: 'Essa seria uma leitura decimal no padrão brasileiro. Aqui, a etiqueta está em inglês.',
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
      definicao: 'Uma classe numérica reúne três casas consecutivas, agrupadas da direita para a esquerda.',
      exemplo: { tex: '12.500=12.000+500', fala: 'doze mil e quinhentos é doze mil mais quinhentos' },
      alerta: 'Depois da primeira classe, mantenha três algarismos por grupo, incluindo zeros. Confira o idioma do separador.',
      esboco: 'Copiar definição, exemplo e alerta; abaixo, desenhar dois trios com milhares e unidades. Na margem, registrar português 12.500 e inglês 12,500.',
    },
    {
      tipo: 'passo',
      problema: 'Escreva **3 milhões, 40 mil e 6 unidades**.',
      visual: quadro(
        { classes: ['milhões', 'milhares', 'unidades'], grupos: [null, null, null], cartoes: [3, 40, 6] },
        'Três trios vazios e os cartões 3, 40 e 6. O caderno recebe primeiro as classes, depois a escrita e por fim a conferência.',
      ),
      passos: [
        {
          pergunta: 'Em que classe fica o grupo 3?',
          opcoes: [
            {
              texto: 'Milhões', certa: true,
              explica: 'O enunciado diz 3 milhões; o 3 vai no trio dos milhões.',
              mostra: quadro(
                { classes: ['milhões', 'milhares', 'unidades'], grupos: [3, null, null] },
                'Encaixar o 3 na última casa do trio milhões, deixando os outros dois trios livres para os próximos grupos.',
              ),
            },
            {
              texto: 'Milhares', erro: 'classe-errada',
              explica: 'Nessa classe, o 3 representaria 3 mil. Precisamos da classe à esquerda.',
              mostra: quadro(
                { classes: ['milhões', 'milhares', 'unidades'], tentativa: [null, 3, null], correto: [3, null, null] },
                'Comparar o 3 em milhares com o 3 em milhões; deslocar o cartão um trio para a esquerda, marcando o nome da classe.',
              ),
            },
          ],
          linha: { tex: '3\\text{ milhões}=3.000.000', fala: 'três milhões são três milhões de unidades' },
        },
        {
          pergunta: 'Como escrever os grupos de 40 mil e 6 unidades depois do 3?',
          opcoes: [
            {
              texto: '3 | 040 | 006', certa: true,
              explica: 'Os grupos seguintes têm três casas: 040 milhares e 006 unidades.',
              mostra: quadro(
                { numero: 3040006, grupos: [3, 40, 6], escritas: ['3', '040', '006'], classes: ['milhões', 'milhares', 'unidades'] },
                'Encaixar 40 e 6 à direita de seus trios e preencher as casas vazias com zeros; ler 3 | 040 | 006.',
              ),
            },
            {
              texto: '3 | 40 | 6', erro: 'esquece-zero',
              explica: 'Sem os zeros, 3406 tem só quatro casas. Os trios precisam manter seus lugares.',
              mostra: quadro(
                { numeros: [3406, 3040006], grupos: [[0, 3, 406], [3, 40, 6]], classes: ['milhões', 'milhares', 'unidades'] },
                'Alinhar 3406 e 3.040.006 pelas unidades. Na primeira linha, o 3 cai nos milhares; na segunda, permanece nos milhões.',
              ),
            },
            {
              texto: '3000000 | 40000 | 6', erro: 'concatena-casas',
              explica: 'Cada parcela já vale uma quantidade. Para montar o número, use as casas, sem colar parcelas.',
              mostra: quadro(
                { numero: 3040006, parcelas: [3000000, 40000, 6], grupos: [3, 40, 6], classes: ['milhões', 'milhares', 'unidades'] },
                'Alinhar as três parcelas nas casas correspondentes em linhas separadas; montar uma única linha, sem concatenar suas escritas.',
              ),
            },
          ],
          linha: { tex: '\\text{classes: }3\\;|\\;040\\;|\\;006', fala: 'classes: três milhões, quarenta milhares e seis unidades' },
        },
        {
          pergunta: 'Qual soma confere o número que você montou?',
          opcoes: [
            {
              texto: '3.000.000 + 40.000 + 6', certa: true,
              explica: 'Cada parcela corresponde a uma classe do número 3.040.006.',
              mostra: quadro(
                { numero: 3040006, parcelas: [3000000, 40000, 6], grupos: [3, 40, 6], classes: ['milhões', 'milhares', 'unidades'] },
                'Ligar cada grupo à parcela correspondente, com as unidades alinhadas à direita nas três linhas.',
              ),
            },
            {
              texto: '3.000.000 + 400 + 6', erro: 'classe-errada',
              explica: 'O grupo 040 conta milhares: vale 40.000, não 400.',
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
      instrucao: 'Exemplo imaginado: um arquivo tem 7 milhões, 40 mil e 9 fotos. Monte o número no caderno e digite sem separadores.',
      resposta: 7040009,
      resolucao: [
        { tex: '\\text{milhões }7\\;|\\;\\text{milhares }040\\;|\\;\\text{unidades }009', fala: 'sete na classe dos milhões, zero quatro zero na classe dos milhares e zero zero nove na classe das unidades' },
        { tex: '7.040.009=7.000.000+40.000+9', fala: 'sete milhões, quarenta mil e nove é sete milhões mais quarenta mil mais nove' },
        { tex: '\\text{entrada sem separadores: }7040009', fala: 'entrada sem separadores: sete zero quatro zero zero zero nove' },
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
      texto: 'Nos arquivos do gancho, **12.500** e **12,500** são 12 mil e 500 fotos. Próxima aula: comparar números na reta.',
      fala: 'Nos arquivos do gancho, com os idiomas indicados, são doze mil e quinhentas fotos. Próxima aula: comparar números na reta.',
      visual: quadro(
        { numero: 12500, grupos: [12, 500], classes: ['milhares', 'unidades'], escritas: ['12.500', '12,500'], formatos: ['pt-BR', 'en-US'] },
        'Voltar às duas etiquetas do gancho e ligar ambas ao quadro 12 | 500. Ao lado, reservar um espaço para a reta da próxima aula, sem ordenação nova.',
      ),
      esboco: 'Responder explicitamente à pergunta inicial: a quantidade é a mesma nos formatos indicados. Manter os idiomas visíveis para preservar a condição.',
    },
  ],
}
