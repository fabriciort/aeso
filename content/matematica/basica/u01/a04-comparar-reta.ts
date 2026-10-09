import type { Aula } from '@/lib/formation/schema'

export const aula: Aula = {
  id: 'B.U1.A4',
  titulo: 'Comparar na reta numérica',
  objetivo: 'Localizar, comparar e ordenar números naturais na reta; ler >, < e =; comparar pela quantidade de casas e pela primeira casa diferente.',
  modelo: 'reta',
  vega:
    'Ideia central: na reta orientada para a direita, intervalos iguais representam avanços iguais; o maior fica à direita. Antes de apresentar > e <, peça a localização e a leitura por extenso. Para naturais escritos sem zeros à esquerda, mais algarismos significam maior número; com a mesma quantidade, compare da esquerda para a direita até a primeira casa diferente. Recupere B.U1.A2 com as casas de 4.072 e 4.027. Erros esperados: comparar pela unidade, ignorar a quantidade de casas, inverter a reta e variar o valor de intervalos iguais. Guie com perguntas como "Quanto vale este intervalo?", "Qual casa você comparou primeiro?" e "Onde os números deixam de empatar?". Em Sua vez, peça uma marca ou uma justificativa antes de oferecer a próxima dica; não escolha a opção pelo aluno. As quantidades de livros são um exemplo imaginado, sem dados externos.',
  esboco:
    'Uma reta contínua nasce de uma régua com 0, 10 e 20. O aluno fixa a escala, aproxima para enxergar unidades e coloca os números. O momento-chave é ver 104 depois de 100 e 89 antes de 100, embora 89 termine em 9. As posições viram uma frase e depois símbolos. O quadro posicional aparece como apoio para números grandes, sem substituir a reta. Toda transição preserva a escala ou indica a mudança de zoom; com movimento reduzido, usar estados finais e realce das casas.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma estante tem **89 livros** e outra tem **104**. Qual tem mais? Como ter certeza?',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 120, passo: 10, marcas: [], etiquetas: [89, 104] },
        movimento: 'As duas etiquetas surgem acima da mesma régua, ainda sem ocupar posições.',
        esboco: 'Duas etiquetas de contagem de uma biblioteca de casa; a régua ao fundo ainda não resolve a pergunta.',
      },
      esboco: 'Perguntar antes de mostrar a ordem. As etiquetas têm o mesmo tamanho, para não sugerir uma resposta pelo desenho.',
    },
    {
      tipo: 'mexa',
      texto: 'Se cada intervalo vale **10**, onde fica **20**?',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 30, passo: 10, marcas: [0, 10], etiquetaSolta: 20 },
        movimento: 'A régua aproxima; três intervalos de mesmo comprimento ficam visíveis.',
        esboco: '0 e 10 estão nos dois primeiros traços; a etiqueta 20 pode ser arrastada para os seguintes.',
      },
      acao: {
        tipo: 'arrastar',
        instrucao: 'Toque na marca onde fica o 20.',
        sucesso: { posicao: 20 },
        mostre: 'Realçar o intervalo de 0 a 10 e repetir seu comprimento de 10 a 20; encaixar a etiqueta no traço 20.',
      },
      descoberta: 'O mesmo comprimento na reta representa o mesmo avanço numérico.',
      esboco: 'O trecho 0–10 desliza como gabarito sobre 10–20. Uma colocação em 30 deixa dois intervalos expostos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Depois do 20, a próxima marca pode ser 50?',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 30, passo: 10, marcas: [0, 10, 20], marcaSemRotulo: 30 },
        movimento: 'Aparece mais um traço com a mesma distância entre os anteriores.',
        esboco: 'Manter os intervalos de dez; deixar apenas o último rótulo escondido.',
      },
      opcoes: [
        {
          texto: 'Sim, posso pôr qualquer número',
          erro: 'intervalos-desiguais',
          explica: 'Os espaços entre as marcas são todos iguais. Se cada um vale 10, depois do 20 vem o 30.',
          mostra: {
            modelo: 'reta',
            estado: { de: 0, ate: 50, passo: 10, marcas: [0, 10, 20, 30, 50] },
            movimento: 'O 50 desliza para três intervalos depois de 20; o rótulo 30 ocupa o intervalo seguinte.',
            esboco: 'Comparar um intervalo de dez com os três necessários para chegar a cinquenta.',
          },
        },
        {
          texto: 'Não. A próxima é 30',
          certa: true,
          explica: 'Isso. Cada espaço vale 10: 10, 20, 30.',
          mostra: {
            modelo: 'reta',
            estado: { de: 0, ate: 30, passo: 10, marcas: [0, 10, 20, 30] },
            movimento: 'Os três intervalos acendem em sequência e recebem o mesmo rótulo de avanço: 10.',
            esboco: 'O rótulo 30 entra depois da previsão, preservando a régua.',
          },
        },
      ],
      esboco: 'Desmontar a ideia de que os traços podem ter valores arbitrários em uma escala fixa.',
    },
    {
      tipo: 'ideia',
      texto: 'Os espaços entre as marcas são os **intervalos**. Na reta, todos têm o mesmo tamanho e valem o mesmo: aqui, 10.',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 30, passo: 10, marcas: [0, 10, 20, 30], destaqueIntervalos: true },
        movimento: 'O gabarito de um intervalo percorre os três trechos sem mudar de tamanho.',
        esboco: 'A legenda dá nome ao padrão que o aluno acabou de testar.',
      },
      esboco: 'Formalizar a escala antes de comparar números; o desenho carrega a repetição, sem uma lista de regras.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora cada intervalo vale **1**. Coloque **7** e **12** na reta.',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 20, passo: 1, marcas: [0, 10, 20], etiquetas: [7, 12] },
        movimento: 'O trecho 0–20 se amplia, revelando dez intervalos de uma unidade entre 0 e 10.',
        esboco: 'Os traços menores continuam igualmente espaçados; os rótulos principais ancoram a contagem.',
      },
      acao: {
        tipo: 'arrastar',
        instrucao: 'Ponha cada número na sua marca.',
        sucesso: { posicoes: [7, 12] },
        mostre: 'Contar sete intervalos desde 0 e marcar 7; partir de 10, avançar dois intervalos e marcar 12.',
      },
      descoberta: 'Cada número ocupa uma posição; avançar para a direita aumenta a quantidade.',
      esboco: 'O ponto acompanha a etiqueta ao arrastar. Uma tentativa fora da marca realça o intervalo contado, sem só exibir uma cruz.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual é maior: **7** ou **12**?',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 20, passo: 1, marcas: [7, 12] },
        movimento: 'Os dois pontos permanecem; a contagem auxiliar desaparece.',
        esboco: 'Pedir uma previsão sobre a posição, antes de mostrar qualquer sinal de comparação.',
      },
      opcoes: [
        {
          texto: '7, porque fica à esquerda',
          erro: 'inverte-reta',
          explica: 'Do 7 ao 12 ainda contamos mais 5. Quem fica à direita é o maior.',
          mostra: {
            modelo: 'reta',
            estado: { de: 0, ate: 20, passo: 1, marcas: [7, 12], sentido: 'direita' },
            movimento: 'Um marcador percorre os inteiros de 7 a 12; a contagem cresce com o deslocamento à direita.',
            esboco: 'O percurso convence pela contagem, sem depender de decorar uma seta.',
          },
        },
        {
          texto: '12, porque fica à direita',
          certa: true,
          explica: 'Isso. Na reta, quem fica à direita é o maior.',
          mostra: {
            modelo: 'reta',
            estado: { de: 0, ate: 20, passo: 1, marcas: [7, 12], maior: 12 },
            movimento: 'O ponto 12 ganha destaque; os dois números permanecem na escala.',
            esboco: 'Conservar o 7 à esquerda para que o realce mantenha o motivo da comparação.',
          },
        },
      ],
      esboco: 'A resposta é uma leitura da reta já construída pelo aluno.',
    },
    {
      tipo: 'ideia',
      texto: '**12 é maior que 7**: escrevemos **12 > 7**. **7 é menor que 12**: escrevemos **7 < 12**.',
      fala: 'Doze é maior que sete. Sete é menor que doze.',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 20, passo: 1, marcas: [7, 12], comparacoes: ['12 > 7', '7 < 12'] },
        movimento: 'As frases surgem sob a reta; maior que e menor que são substituídos pelos símbolos.',
        esboco: 'Primeiro a leitura por extenso; depois > e < como abreviações da mesma relação.',
      },
      esboco: 'Apresentar os símbolos depois da experiência. A voz lê as relações por extenso.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora ponha outro **12** na reta. Ele fica em outro lugar?',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 20, passo: 1, marcas: [12], etiquetaSolta: 12 },
        movimento: 'A etiqueta 7 sai; uma segunda etiqueta 12 aparece para ser colocada.',
        esboco: 'Duas etiquetas podem apontar para um único ponto, sem criar duas posições diferentes.',
      },
      acao: {
        tipo: 'arrastar',
        instrucao: 'Ponha o 12 na marca dele.',
        sucesso: { posicao: 12 },
        mostre: 'Encaixar a segunda etiqueta sobre a primeira; abrir dois pequenos rótulos ligados ao mesmo ponto 12.',
      },
      descoberta: 'Números iguais ocupam a mesma posição, ainda que tenham duas etiquetas.',
      esboco: 'As etiquetas se empilham por um instante e depois apontam para o mesmo ponto, sem deslocá-lo.',
    },
    {
      tipo: 'ideia',
      texto: 'Números iguais ocupam o mesmo ponto: **12 = 12**. O sinal **=** diz que os valores são iguais.',
      fala: 'Doze é igual a doze. O sinal de igual diz que os valores são iguais.',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 20, passo: 1, marcas: [12], etiquetas: [12, 12], comparacao: '12 = 12' },
        movimento: 'A relação de igualdade aparece embaixo das duas etiquetas que compartilham o ponto.',
        esboco: 'A igualdade nasce da coincidência das posições, preparando o contraste com aproximação na aula seguinte.',
      },
      esboco: 'Dar significado a = sem antecipar contas; a relação é entre valores iguais.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Voltando às estantes: qual passa de 100, **89** ou **104**?',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 120, passo: 10, marcas: [0, 100], etiquetas: [89, 104] },
        movimento: 'A régua volta à escala de dez; as etiquetas do gancho reaparecem soltas.',
        esboco: '100 é a referência; ainda não colocar as etiquetas para o aluno.',
      },
      opcoes: [
        {
          texto: '89, porque começa com 8 e 104 com 1',
          erro: 'ignora-quantidade-casas',
          explica: '89 nem chega a 100. 104 passa de 100: tem uma centena inteira.',
          mostra: {
            modelo: 'quadro-posicional',
            estado: { numeros: [89, 104], casas: ['C', 'D', 'U'], destaque: 'C' },
            movimento: 'As etiquetas se alinham pela unidade; em 104 surge uma placa de centena, ausente em 89.',
            esboco: 'Não inserir zero à esquerda como novo algarismo de 89; deixar a coluna da centena vazia.',
          },
        },
        {
          texto: '104: tem uma centena',
          certa: true,
          explica: 'Isso. 104 fica depois do 100, e 89 fica antes.',
          mostra: {
            modelo: 'reta',
            estado: { de: 0, ate: 120, passo: 10, marcas: [89, 100, 104] },
            movimento: '89 pousa antes de 90 e 104 depois de 100; a referência 100 permanece acesa.',
            esboco: 'Momento-chave: a unidade 9 não faz 89 ultrapassar uma centena.',
          },
        },
      ],
      esboco: 'Responder à armadilha do gancho por uma referência numérica e pelo valor das casas.',
    },
    {
      tipo: 'ideia',
      texto: 'Quem tem **mais algarismos** é maior: 104 tem 3, 89 tem 2. Por isso **104 > 89**.',
      fala: 'Quem tem mais algarismos é maior: cento e quatro tem três, oitenta e nove tem dois. Por isso cento e quatro é maior que oitenta e nove.',
      visual: {
        modelo: 'quadro-posicional',
        estado: { numeros: [89, 104], casas: ['C', 'D', 'U'], quantidadeAlgarismos: [2, 3] },
        movimento: 'Os dois algarismos de 89 e os três de 104 recebem contornos; a centena de 104 ganha destaque.',
        esboco: 'Alinhar pela direita e contar os algarismos reais, sem contar ponto de milhar ou uma coluna vazia.',
      },
      esboco: 'Delimitar a regra aos naturais desta unidade; não sugerir que o comprimento decide números decimais.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Os dois têm três algarismos. Quem é maior: **482** ou **479**?',
      visual: {
        modelo: 'quadro-posicional',
        estado: { numeros: [482, 479], casas: ['C', 'D', 'U'], destaque: null },
        movimento: 'As duas etiquetas se alinham em centenas, dezenas e unidades.',
        esboco: 'Não realçar a casa que decide antes da escolha.',
      },
      opcoes: [
        {
          texto: '479, porque termina em 9',
          erro: 'compara-pela-ultima-casa',
          explica: 'As centenas empatam. Nas dezenas, 8 é mais que 7, e isso já decide. O 9 do final não importa.',
          mostra: {
            modelo: 'quadro-posicional',
            estado: { numeros: [482, 479], casas: ['C', 'D', 'U'], destaque: 'D', casasIguais: ['C'] },
            movimento: 'As centenas coincidem; as dezenas recebem oito e sete barras. As unidades perdem destaque.',
            esboco: 'A primeira diferença, da esquerda, vence antes de comparar o 2 com o 9.',
          },
        },
        {
          texto: '482, porque tem mais dezenas',
          certa: true,
          explica: 'Isso. As centenas empatam, e nas dezenas 8 é mais que 7.',
          mostra: {
            modelo: 'reta',
            estado: { de: 470, ate: 490, passo: 1, marcas: [479, 480, 482] },
            movimento: 'Os números saem do quadro e pousam na régua: 479 antes de 480; 482 depois.',
            esboco: 'Fazer a leitura das casas concordar com a posição na reta.',
          },
        },
      ],
      esboco: 'Aposta para revelar por que comparar apenas a última casa falha.',
    },
    {
      tipo: 'ideia',
      texto: 'Mesmo número de algarismos? Compare **da esquerda para a direita**, até achar uma casa diferente.',
      visual: {
        modelo: 'quadro-posicional',
        estado: { numeros: [482, 479], casas: ['C', 'D', 'U'], casasIguais: ['C'], primeiraDiferente: 'D' },
        movimento: 'Um foco percorre as casas da esquerda e para nas dezenas; aparece 482 > 479.',
        esboco: 'O foco para na primeira diferença, sem percorrer inutilmente as unidades.',
      },
      esboco: 'Nomear a estratégia que explica a aposta, sem criar uma regra baseada na aparência do símbolo.',
    },
    {
      tipo: 'anote',
      titulo: 'Comparar na reta',
      definicao: 'Na reta numérica, o número maior fica à direita e o menor fica à esquerda.',
      exemplo: { tex: '12 > 7 \\quad\\text{e}\\quad 7 < 12', fala: 'doze é maior que sete, e sete é menor que doze' },
      alerta: 'Não compare pelo último algarismo. Conte os algarismos. Se empatar, compare a partir da esquerda.',
      esboco: 'No caderno, copiar a definição, a reta com 7 e 12 e as duas leituras. A escrita aparece uma linha por vez.',
    },
    {
      tipo: 'passo',
      problema: 'Qual é maior: **4.072** ou **4.027**?',
      visual: {
        modelo: 'quadro-posicional',
        estado: { numeros: [4072, 4027], casas: ['M', 'C', 'D', 'U'] },
        movimento: 'As casas de milhares até unidades surgem alinhadas à direita.',
        esboco: 'Recuperar o zero que guarda lugar da A2; nenhum destaque entrega o resultado inicial.',
      },
      passos: [
        {
          pergunta: 'Os milhares e as centenas são iguais. Qual é a primeira casa diferente, lendo da esquerda?',
          opcoes: [
            { texto: 'Dezenas: 7 e 2', certa: true, explica: 'Isso. As dezenas vêm antes das unidades: 7 contra 2.' },
            { texto: 'Unidades: 2 e 7', erro: 'compara-pela-ultima-casa', explica: 'Lendo da esquerda, as dezenas vêm antes. E elas já são diferentes: 7 e 2.' },
          ],
          linha: { tex: '\\text{primeira diferença: dezenas, }7 > 2', fala: 'a primeira diferença está nas dezenas: sete é maior que dois' },
        },
        {
          pergunta: 'Então, qual é o maior?',
          opcoes: [
            { texto: '4.072 é maior que 4.027', certa: true, explica: 'Isso. 7 dezenas ganham de 2 dezenas.' },
            { texto: '4.027 é maior que 4.072', erro: 'compara-pela-ultima-casa', explica: 'O 7 das unidades não conta mais: as dezenas já decidiram.' },
          ],
          linha: { tex: '4.072 > 4.027', fala: 'quatro mil e setenta e dois é maior que quatro mil e vinte e sete' },
        },
      ],
      esboco: 'Depois de cada escolha, realçar a casa e escrever sua linha; no final, os números se colocam numa reta ampliada.',
    },
    {
      tipo: 'mexa',
      texto: '**Ordem crescente** vai do menor para o maior. Organize **12, 7 e 19** na reta.',
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: 20, passo: 1, marcas: [0, 10, 20], etiquetas: [12, 7, 19] },
        movimento: 'A reta de unidades retorna, com as três etiquetas soltas e uma seta de leitura para a direita.',
        esboco: 'Pedir a localização dos três números; sua ordem na régua escreve a lista crescente abaixo.',
      },
      acao: {
        tipo: 'arrastar',
        instrucao: 'Ponha cada número na sua marca e leia da esquerda para a direita.',
        sucesso: { posicoes: [7, 12, 19], ordem: [7, 12, 19] },
        mostre: 'Localizar 7 antes de 10, 12 depois de 10 e 19 antes de 20; percorrer a reta da esquerda para a direita.',
      },
      descoberta: 'Ordenar vários naturais é repetir comparações e ler as posições da esquerda para a direita.',
      esboco: 'Os rótulos assentam nas posições reais. A lista só aparece depois da ação, sem opções que antecipem a ordem.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, desenhe uma reta de 10 em 10 e marque **89** e **104**. Depois digite o maior.',
      resposta: 104,
      resolucao: [
        { tex: '80 < 89 < 90', fala: 'oitenta e nove fica entre oitenta e noventa' },
        { tex: '100 < 104 < 110', fala: 'cento e quatro fica entre cem e cento e dez' },
        { tex: '104 > 89', fala: 'cento e quatro é maior que oitenta e nove' },
      ],
      esboco: 'A tela espera o papel e a resposta. Ao conferir, desenhar intervalos iguais de 80 a 110 e colocar os dois pontos nas posições proporcionais; revelar as três linhas em sequência.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['comparar-n1', 'comparar-n2', 'comparar-n3'],
      esboco: 'Do menor para o maior na reta; depois pares com zeros e casas que enganam; por fim ordenar distâncias de um exemplo imaginado sem visual. As dicas aparecem uma de cada vez.',
    },
    {
      tipo: 'fecho',
      texto: 'A estante de **104 livros** tem mais: **104 > 89**. Agora vamos usar a reta para **arredondar e estimar**.',
      fala: 'A estante de cento e quatro livros tem mais: cento e quatro é maior que oitenta e nove. Agora vamos arredondar e estimar.',
      visual: {
        modelo: 'reta',
        estado: { de: 80, ate: 110, passo: 10, marcas: [89, 100, 104], comparacao: '104 > 89' },
        movimento: 'As etiquetas das estantes retornam nos pontos conferidos; 100 fica como referência entre elas.',
        esboco: 'Fechar a pergunta inicial pela imagem: 104 está à direita de 89, com a escala preservada.',
      },
      esboco: 'Retomar o gancho e deixar a régua no palco para a próxima aula.',
    },
  ],
}
