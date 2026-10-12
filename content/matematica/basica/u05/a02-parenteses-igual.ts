import type { Aula, Visual } from '@/lib/formation/schema'

// Os parênteses mudam a ordem: o que está dentro deles vem primeiro. E o
// sinal de igual só fica entre coisas que valem o mesmo: uma conta se
// resolve em linhas, cada uma igual à de cima, nunca numa corrente
// 3 + 2 = 5 × 2 = 10.

const expressao = (linhas: string[], esboco: string, destaque?: string): Visual => ({
  modelo: 'livre',
  estado: destaque ? { expressao: linhas, destaque } : { expressao: linhas },
  esboco,
})
const retangulo = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const PIZZA = ['(30 + 15) ÷ 3', '45 ÷ 3', '15']
const BIA = ['(3 + 2) × 2', '5 × 2', '10']

export const aula: Aula = {
  id: 'B.U5.A2',
  titulo: 'Parênteses e o sinal de igual',
  objetivo: 'Usar parênteses para mudar a ordem das operações, resolver expressões com parênteses e escrever a resolução com o sinal de igual só entre coisas iguais, um passo por linha.',
  modelo: 'livre',
  esboco: 'Três amigos dividem a conta da pizza. A primeira tentativa de escrever a conta, 30 + 15 ÷ 3, dá R$ 35 pela regra da aula passada: mais do que cada um deve. Os parênteses consertam: (30 + 15) ÷ 3. O retângulo mostra (2 + 3) × 4 inteiro, 20 quadradinhos, contra o pedaço 2 + 12. Depois, o caderno de Bia: o resultado certo, a escrita errada. Momento-chave: ler só o começo de 3 + 2 = 5 × 2 e ver que ele diz "5 vale 10".',
  vega: 'Ideia central: parênteses mandam fazer primeiro o que está dentro deles; depois vale a regra de sempre (× e ÷, depois + e −, da esquerda para a direita). O sinal = quer dizer "vale o mesmo que", não "e o resultado é". Cada passo da resolução vai numa linha nova, começando com =, e cada linha vale o mesmo que a de cima. Erros esperados: ignorar os parênteses e fazer o × primeiro ((2 + 3) × 4 = 14); escrever a conta sem parênteses quando precisa deles (30 + 15 ÷ 3 para dividir a conta); encadear contas com o = (3 + 2 = 5 × 2 = 10). Guie perguntando "O que está dentro dos parênteses?", "Os dois lados deste = valem o mesmo?", "Cada um pagaria isso mesmo?". Se o aluno encadear, peça que leia o primeiro = em voz alta. Em Sua vez, não diga o resultado: peça a primeira linha.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Três amigos dividem a conta: R$ 30 de pizza e R$ 15 de suco. Como escrever, numa conta só, quanto cada um paga?',
      fala: 'Três amigos dividem a conta: trinta reais de pizza e quinze de suco. Como escrever, numa conta só, quanto cada um paga?',
      visual: expressao(['30 + 15 ÷ 3'], 'Uma comanda de restaurante, e nela uma primeira tentativa a lápis: 30 + 15 ÷ 3, com um ponto de interrogação ao lado.'),
      esboco: 'Uma situação em que todo mundo sabe a resposta de cabeça (R$ 15), mas não sabe escrever a conta. A tentativa a lápis vai ser testada no próximo cartão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Alguém escreveu $30 + 15 \\div 3$. Pela regra da aula passada, quanto dá?',
      fala: 'Alguém escreveu trinta mais quinze dividido por três. Pela regra da aula passada, quanto dá?',
      visual: expressao(['30 + 15 ÷ 3'], 'A tentativa da comanda, agora grande.'),
      opcoes: [
        {
          texto: '35', certa: true,
          explica: 'Isso: $15 \\div 3 = 5$, e $30 + 5 = 35$. Mas a conta toda é R$ 45. Ninguém paga R$ 35!',
          mostra: expressao(['30 + 15 ÷ 3', '30 + 5', '35'], 'A conta encolhe até 35. Ao lado, três pessoas pagando R$ 35 cada: R$ 105 por uma conta de R$ 45. O 35 fica vermelho.'),
        },
        {
          texto: '15', erro: 'ignora-prioridade',
          explica: '15 é o que cada um deve, mas a conta escrita diz outra coisa: o ÷ vem antes. Dá $30 + 5 = 35$.',
          mostra: expressao(['30 + 15 ÷ 3', '30 + 5', '35'], 'A moldura âmbar no 15 ÷ 3, depois a conta encolhe até 35.'),
        },
      ],
      esboco: 'O momento em que a regra da aula 1 "atrapalha": a conta escrita não diz o que queremos. Precisamos de um jeito de mudar a ordem.',
    },
    {
      tipo: 'ideia',
      texto: 'Os **parênteses** mandam fazer primeiro o que está dentro deles: $(30 + 15) \\div 3$.',
      fala: 'Os parênteses mandam fazer primeiro o que está dentro deles: trinta mais quinze, entre parênteses, dividido por três.',
      visual: expressao(PIZZA, 'Os parênteses se desenham em volta de 30 + 15, que vira 45; depois 45 ÷ 3 vira 15. O 15 acende: R$ 15 para cada um.'),
      esboco: 'Os parênteses entram como a ferramenta que faltava, já com a resposta que o aluno sabia de cabeça.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E $(2 + 3) \\times 4$? Quanto dá?',
      fala: 'E dois mais três, entre parênteses, vezes quatro? Quanto dá?',
      visual: expressao(['(2 + 3) × 4'], 'A conta do grupo de mensagens da aula passada, agora com parênteses.'),
      opcoes: [
        {
          texto: '20', certa: true,
          explica: 'Isso. Primeiro $2 + 3 = 5$, depois $5 \\times 4 = 20$. São 4 linhas de 5 quadradinhos.',
          mostra: retangulo({ linhas: 4, colunas: 5, cortes: [2], rotulos: true, areas: true, total: 20 }, 'Um retângulo de 4 linhas por 5 colunas, partido em 2 + 3 colunas. As duas partes, 8 e 12, se juntam no total 20.'),
        },
        {
          texto: '14', erro: 'ignora-parenteses',
          explica: '14 é a conta sem parênteses: $2 + 12$. Com eles, as 4 linhas têm $2 + 3 = 5$ quadradinhos: 20.',
          mostra: retangulo({ linhas: 4, colunas: 5, cortes: [2], rotulos: true, areas: true, destaque: [0, 1], total: 20 }, 'O retângulo de 4 por 2 + 3. Só a parte de 12 acende: isso é o 3 × 4. Faltou a parte de 8, a do 2 × 4.'),
        },
      ],
      esboco: 'Quem achou 20 no gancho da aula passada fez esta conta. O retângulo mostra os parênteses: o 4 multiplica o 2 + 3 inteiro.',
    },
    {
      tipo: 'mexa',
      texto: 'Em que ordem se faz $2 \\times (10 - 4) + 1$?',
      fala: 'Parênteses e regra juntos: dois vezes, abre parênteses, dez menos quatro, fecha parênteses, mais um.',
      visual: {
        modelo: 'livre',
        estado: { fichas: ['×', '−', '+'], lugares: ['1º', '2º', '3º'] },
        esboco: 'Os três sinais da conta em fichas, na ordem em que aparecem: ×, −, +. Proposta: a expressão inteira acima dos lugares, com os parênteses em âmbar, e a conta encolhendo a cada ficha certa (2 × 6 + 1, depois 12 + 1, depois 13).',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos sinais na ordem em que as contas se fazem.',
        sucesso: { ordem: ['−', '×', '+'] },
        mostre: 'O − dos parênteses vai para o 1º lugar, o × para o 2º e o + para o 3º. A conta encolhe: 2 × 6 + 1, depois 12 + 1, depois 13.',
      },
      descoberta: 'Os parênteses passam na frente até do ×: 10 − 4 = 6. Depois a regra de sempre: 2 × 6 = 12, e 12 + 1 = 13.',
      esboco: 'O mesmo gesto da aula passada, agora com parênteses. O aluno vê que o − passou na frente do ×.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Bia somou 3 e 2 e dobrou. No caderno, escreveu $3 + 2 = 5 \\times 2 = 10$. Está certo?',
      fala: 'Bia somou três e dois e dobrou. No caderno, escreveu: três mais dois igual a cinco vezes dois igual a dez. Está certo?',
      visual: expressao(['3 + 2 = 5 × 2 = 10'], 'A linha do caderno de Bia, numa letra à mão.'),
      opcoes: [
        {
          texto: 'O 10 está certo, a escrita não', certa: true,
          explica: 'Isso. Leia só o começo: $3 + 2 = 5 \\times 2$ diz que 5 vale 10. Cada passo vai numa linha nova.',
          mostra: expressao(BIA, 'A linha de Bia se desfaz e vira três linhas, cada uma valendo o mesmo que a de cima: (3 + 2) × 2, 5 × 2, 10.'),
        },
        {
          texto: 'Está tudo certo', erro: 'igual-encadeado',
          explica: 'O = diz que os dois lados valem o mesmo. Mas $3 + 2$ vale 5, e $5 \\times 2$ vale 10.',
          mostra: expressao(['3 + 2 = 5 × 2'], 'Só o começo da linha fica: embaixo do 3 + 2 aparece 5, embaixo do 5 × 2 aparece 10. O = entre eles fica vermelho.', '3 + 2 = 5 × 2'),
        },
        {
          texto: 'O 10 está errado',
          explica: 'O 10 está certo: 5 dobrado é 10. O que está errado é o primeiro sinal de igual.',
          mostra: expressao(BIA, 'As três linhas certas, terminando em 10.'),
        },
      ],
      esboco: 'O momento-chave do sinal de igual. A conta de Bia chega ao número certo, e por isso o erro é difícil de ver: só lendo cada = sozinho.',
    },
    {
      tipo: 'anote',
      titulo: 'Parênteses e o sinal de igual',
      definicao: 'Primeiro o que está dentro dos parênteses. O sinal = só fica entre coisas que valem o mesmo.',
      exemplo: { tex: '(3 + 2) \\times 2 = 10', fala: 'três mais dois, entre parênteses, vezes dois, é igual a dez' },
      alerta: 'Nunca escreva $3 + 2 = 5 \\times 2 = 10$. Cada passo vai numa linha nova, começando com =.',
      esboco: 'A página do caderno com as duas regras. O exemplo é a conta de Bia escrita do jeito certo.',
    },
    {
      tipo: 'passo',
      problema: 'Volte à pizza: R$ 30 e R$ 15 divididos por 3 pessoas. Escreva e resolva.',
      fala: 'Volte à pizza: trinta reais e quinze divididos por três pessoas. Escreva e resolva.',
      visual: expressao(['30 + 15 ÷ 3'], 'A tentativa a lápis do gancho, com o ponto de interrogação. Cada passo certo escreve uma linha no caderno da tela.'),
      passos: [
        {
          pergunta: 'Qual conta diz isso?',
          opcoes: [
            { texto: '(30 + 15) ÷ 3', certa: true, explica: 'Isso. Os parênteses juntam a conta toda antes de dividir.', mostra: expressao(['(30 + 15) ÷ 3'], 'A tentativa a lápis ganha os parênteses, em âmbar.', '(30 + 15)') },
            { texto: '30 + 15 ÷ 3', erro: 'ignora-parenteses', explica: 'Sem parênteses, só o suco é dividido: dá 35. Junte a conta antes: $(30 + 15) \\div 3$.', mostra: expressao(['30 + 15 ÷ 3', '30 + 5', '35'], 'A conta sem parênteses encolhe até 35, e o 35 fica vermelho.') },
          ],
          linha: { tex: '(30 + 15) \\div 3', fala: 'trinta mais quinze, entre parênteses, dividido por três' },
        },
        {
          pergunta: 'Qual é a próxima linha?',
          opcoes: [
            { texto: '= 45 ÷ 3', certa: true, explica: 'Isso. Primeiro os parênteses: $30 + 15 = 45$.', mostra: expressao(['(30 + 15) ÷ 3', '45 ÷ 3'], 'Os parênteses viram 45.') },
            { texto: '= 30 + 5', erro: 'ignora-parenteses', explica: 'Os parênteses vêm antes do ÷: primeiro $30 + 15 = 45$.', mostra: expressao(['(30 + 15) ÷ 3'], 'A moldura âmbar no que está dentro dos parênteses.', '(30 + 15)') },
          ],
          linha: { tex: '= 45 \\div 3', fala: 'igual a quarenta e cinco dividido por três' },
        },
        {
          pergunta: 'E a última linha?',
          opcoes: [
            { texto: '= 15', certa: true, explica: 'Isso. Cada um paga R$ 15, e cada linha vale o mesmo que a de cima.', mostra: expressao(PIZZA, 'As três linhas, terminando em 15, grande.') },
            { texto: '= 45', explica: '45 é a conta toda. Ainda falta dividir pelas 3 pessoas: $45 \\div 3 = 15$.', mostra: expressao(PIZZA, 'As três linhas, terminando em 15.') },
          ],
          linha: { tex: '= 15', fala: 'igual a quinze' },
        },
      ],
      esboco: 'O aluno escreve a conta do gancho do jeito certo: com parênteses e uma linha por passo.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No caderno, um passo por linha: $5 \\times (8 - 2) - 10$. Quanto dá?',
      fala: 'No caderno, um passo por linha: cinco vezes, abre parênteses, oito menos dois, fecha parênteses, menos dez. Quanto dá?',
      resposta: 20,
      resolucao: [
        { tex: '5 \\times (8 - 2) - 10', fala: 'cinco vezes oito menos dois, entre parênteses, menos dez' },
        { tex: '= 5 \\times 6 - 10', fala: 'igual a cinco vezes seis menos dez' },
        { tex: '= 30 - 10', fala: 'igual a trinta menos dez' },
        { tex: '= 20', fala: 'igual a vinte' },
      ],
      esboco: 'Parênteses, depois ×, depois −. O aluno compara as linhas dele com as da tela, não só o resultado.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['parenteses-n1', 'parenteses-n2', 'parenteses-n3'],
      esboco: 'Nível 1: parênteses no começo, com moldura âmbar. Nível 2: parênteses no meio ou no fim, dois parênteses, e escolher a escrita certa com o sinal de igual. Nível 3: dividir a conta, kits e gastos, sem a expressão escrita.',
    },
    {
      tipo: 'fecho',
      texto: 'Cada um paga **R$ 15**: $(30 + 15) \\div 3$. Na próxima aula: duas calculadoras, a mesma conta, dois resultados.',
      fala: 'Cada um paga quinze reais: trinta mais quinze, entre parênteses, dividido por três. Na próxima aula: duas calculadoras, a mesma conta, dois resultados.',
      visual: expressao(PIZZA, 'A comanda do gancho, agora com a conta certa escrita em três linhas e o R$ 15 aceso.'),
      esboco: 'Responder ao gancho com a mesma comanda e provocar a próxima aula.',
    },
  ],
}
