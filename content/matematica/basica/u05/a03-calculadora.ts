import type { Aula, Visual } from '@/lib/formation/schema'

// A calculadora simples (a de balcão, de bolso) faz conta a conta, na ordem
// das teclas: para 2 + 3 × 4 ela mostra 20. A científica guarda a conta e
// segue a ordem das operações: 14. Usar a calculadora com consciência é
// digitar primeiro o × e o ÷ e estimar antes de confiar no visor.

type Calc = { nome: string; teclas: string; visor: string }
const calculadoras = (lista: Calc[], esboco: string): Visual => ({ modelo: 'livre', estado: { calculadoras: lista }, esboco })
const DUAS: Calc[] = [
  { nome: 'De balcão', teclas: '2 + 3 × 4 =', visor: '20' },
  { nome: 'Científica', teclas: '2 + 3 × 4 =', visor: '14' },
]
const SIMPLES = (teclas: string, visor: string): Calc[] => [{ nome: 'De balcão', teclas, visor }]

export const aula: Aula = {
  id: 'B.U5.A3',
  titulo: 'Calculadora',
  objetivo: 'Entender por que uma calculadora simples e uma científica podem dar resultados diferentes para a mesma expressão, digitar a conta na ordem certa numa calculadora simples e conferir o visor com uma estimativa.',
  modelo: 'livre',
  esboco: 'Duas calculadoras lado a lado, as mesmas teclas, dois visores: 20 e 14. O aluno vira detetive: o visor da de balcão, tecla a tecla, mostra o 5 aparecendo quando se aperta o ×. Ela não errou, ela faz conta a conta. Depois, o aluno aprende a digitar na ordem certa (3 × 4 = e depois + 2 =) e a desconfiar de um visor que não tem o tamanho certo. Momento-chave: ver o 5 no visor no instante em que o × é apertado.',
  vega: 'Ideia central: a calculadora simples (de balcão, de bolso, de quatro operações) faz cada conta assim que recebe o próximo sinal, da esquerda para a direita, sem a ordem das operações: 2 + 3 × 4 = dá 20. A científica guarda a expressão e segue a regra: dá 14. Aplicativos de celular variam: muitos seguem a regra, alguns não; por isso o aluno testa o próprio com 2 + 3 × 4 =. Na simples, digite primeiro o × e o ÷ (3 × 4 =, depois + 2 =); numa subtração como 100 − 8 × 7, faça 8 × 7, anote 56 e depois 100 − 56. Erros esperados: digitar a expressão na ordem em que está escrita e aceitar o visor; achar que a calculadora "não erra". Guie perguntando "Perto de quanto deve dar?", "O que o visor mostra quando você aperta o ×?". A calculadora não está quebrada: ela segue outra regra. Em Sua vez, não dê as teclas: pergunte qual conta vem primeiro.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Na loja, a calculadora de balcão dá **20** para **2 + 3 × 4**. A científica dá **14**. Por que a mesma conta dá dois resultados?',
      fala: 'Na loja, a calculadora de balcão dá vinte para dois mais três vezes quatro. A científica dá catorze. Por que a mesma conta dá dois resultados?',
      visual: calculadoras(DUAS, 'As duas calculadoras lado a lado, com as mesmas teclas acesas uma a uma. No fim, os visores: 20 e 14.'),
      esboco: 'A briga do grupo de mensagens da aula 1 volta, agora entre duas máquinas. O aluno já sabe que 14 é o certo; a pergunta é o que a outra fez.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Como a calculadora de balcão chegou a **20**?',
      fala: 'Como a calculadora de balcão chegou a vinte?',
      visual: calculadoras(SIMPLES('2 + 3 × 4 =', '20'), 'Só a calculadora de balcão, grande, com o 20 no visor.'),
      opcoes: [
        {
          texto: 'Fez 2 + 3 e depois × 4', certa: true,
          explica: 'Isso. Ela faz cada conta assim que você aperta o próximo sinal: $2 + 3 = 5$, e $5 \\times 4 = 20$.',
          mostra: calculadoras(
            [{ nome: 'Ao apertar ×', teclas: '2 + 3 ×', visor: '5' }, { nome: 'No fim', teclas: '2 + 3 × 4 =', visor: '20' }],
            'O visor tecla a tecla: no instante em que o × é apertado, aparece 5. A soma já foi feita. Depois, × 4 = dá 20.',
          ),
        },
        {
          texto: 'Está com defeito',
          explica: 'Ela funciona. Só faz as contas na ordem em que as teclas chegam, sem a regra do × primeiro.',
          mostra: calculadoras(
            [{ nome: 'Ao apertar ×', teclas: '2 + 3 ×', visor: '5' }, { nome: 'No fim', teclas: '2 + 3 × 4 =', visor: '20' }],
            'O visor tecla a tecla: ao apertar ×, aparece 5. É a soma, feita antes da hora.',
          ),
        },
        {
          texto: 'Fez 3 × 4 primeiro',
          explica: 'Com $3 \\times 4$ primeiro dá 14, como a científica. Para dar 20, ela somou antes.',
          mostra: calculadoras(DUAS, 'As duas de novo: 14 na científica, que faz 3 × 4 primeiro; 20 na de balcão, que soma antes.'),
        },
      ],
      esboco: 'O momento-chave: ver o 5 no visor quando o × é apertado. A calculadora deixa de ser mágica e vira uma máquina com uma regra própria.',
    },
    {
      tipo: 'ideia',
      texto: 'A calculadora simples faz **conta a conta**, na ordem das teclas. A científica segue a **ordem das operações**.',
      fala: 'A calculadora simples faz conta a conta, na ordem das teclas. A científica segue a ordem das operações.',
      visual: calculadoras(DUAS, 'As duas lado a lado. Embaixo da de balcão, "conta a conta"; embaixo da científica, "× antes de +".'),
      esboco: 'O nome das duas regras, curto. Nenhuma está quebrada.',
    },
    {
      tipo: 'ideia',
      texto: 'E o celular? Depende do aplicativo. Teste o seu: digite **2 + 3 × 4 =**. Deu 14 ou 20?',
      fala: 'E o celular? Depende do aplicativo. Teste o seu: digite dois mais três vezes quatro igual. Deu catorze ou vinte?',
      visual: calculadoras(
        [
          { nome: 'De balcão', teclas: '2 + 3 × 4 =', visor: '20' },
          { nome: 'Científica', teclas: '2 + 3 × 4 =', visor: '14' },
          { nome: 'Seu celular', teclas: '2 + 3 × 4 =', visor: '?' },
        ],
        'Uma terceira calculadora entra, com o visor "?": a do aluno. A pausa convida a pegar o celular.',
      ),
      esboco: 'Um teste de verdade, fora da tela. Muitos aplicativos de celular seguem a regra; alguns fazem conta a conta. O aluno descobre como é o dele.',
    },
    {
      tipo: 'mexa',
      texto: 'Na calculadora de balcão, dá para chegar a **14**. Em que ordem digitar?',
      fala: 'Na calculadora de balcão, dá para chegar a catorze. Em que ordem digitar?',
      visual: {
        modelo: 'livre',
        estado: { fichas: ['2 + 3 =', '3 × 4 =', '+ 2 ='], lugares: ['1º', '2º'] },
        esboco: 'Três grupos de teclas em fichas e dois lugares. Uma ficha sobra. Proposta: a calculadora de balcão acima dos lugares, com o visor mudando a cada ficha posta (12, depois 14; ou 5, se o aluno começar pela soma).',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas teclas na ordem certa.',
        sucesso: { ordem: ['3 × 4 =', '+ 2 ='] },
        mostre: 'A ficha 3 × 4 = vai para o 1º lugar e o visor mostra 12. A ficha + 2 = vai para o 2º e o visor mostra 14. A ficha 2 + 3 = sobra.',
      },
      descoberta: 'Na calculadora simples, quem segue a regra é você: digite primeiro o × (3 × 4 = dá 12) e depois some (+ 2 = dá 14).',
      esboco: 'O aluno faz a ordem das operações com as próprias mãos, na máquina que não a conhece.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você digita $48 + 52 \\times 3$ na calculadora de balcão e o visor mostra **300**. Dá para confiar?',
      fala: 'Você digita quarenta e oito mais cinquenta e dois vezes três na calculadora de balcão e o visor mostra trezentos. Dá para confiar?',
      visual: calculadoras(SIMPLES('48 + 52 × 3 =', '300'), 'A calculadora de balcão com 300 no visor.'),
      opcoes: [
        {
          texto: 'Não: deve dar perto de 200', certa: true,
          explica: 'Isso. $52 \\times 3$ fica perto de 150. Mais 48, perto de 200. A conta certa dá **204**.',
          mostra: calculadoras(
            [{ nome: 'De balcão', teclas: '48 + 52 × 3 =', visor: '300' }, { nome: 'Científica', teclas: '48 + 52 × 3 =', visor: '204' }],
            'A científica entra ao lado e mostra 204, perto da estimativa de 200. O 300 fica vermelho.',
          ),
        },
        {
          texto: 'Sim: a calculadora não erra', erro: 'calculadora-simples-sem-prioridade',
          explica: 'Ela fez $48 + 52 = 100$ e depois $100 \\times 3$. Estime: $52 \\times 3$ fica perto de 150, mais 48, perto de 200.',
          mostra: calculadoras(
            [{ nome: 'Ao apertar ×', teclas: '48 + 52 ×', visor: '100' }, { nome: 'Científica', teclas: '48 + 52 × 3 =', visor: '204' }],
            'O visor tecla a tecla: ao apertar ×, aparece 100. A científica, ao lado, dá 204.',
          ),
        },
      ],
      esboco: 'A estimativa da unidade 1 vira o detector de visor errado. O aluno aprende a perguntar "isso tem o tamanho certo?".',
    },
    {
      tipo: 'anote',
      titulo: 'A calculadora simples',
      definicao: 'A calculadora simples faz conta a conta, na ordem das teclas. Nela, digite primeiro o × e o ÷.',
      exemplo: { tex: '2 + 3 \\times 4\\text{: teclas } 3 \\times 4 \\;=\\; + \\; 2 \\;=\\; \\to 14', fala: 'dois mais três vezes quatro: teclas três vezes quatro, igual, mais dois, igual, e o visor mostra catorze' },
      alerta: 'Antes de confiar no visor, estime: o resultado tem o tamanho certo?',
      esboco: 'A página do caderno com a regra da máquina, o jeito de digitar e o hábito de estimar.',
    },
    {
      tipo: 'passo',
      problema: 'Na calculadora de balcão: R$ 25 de entrega e 5 caixas de R$ 12. Calcule $25 + 5 \\times 12$.',
      fala: 'Na calculadora de balcão: vinte e cinco reais de entrega e cinco caixas de doze. Calcule vinte e cinco mais cinco vezes doze.',
      visual: calculadoras(SIMPLES('', '0'), 'A calculadora de balcão zerada. Cada passo certo aperta as teclas e o visor muda.'),
      passos: [
        {
          pergunta: 'O que você digita primeiro?',
          opcoes: [
            { texto: '5 × 12 =', certa: true, explica: 'Isso. A multiplicação primeiro: o visor mostra 60.', mostra: calculadoras(SIMPLES('5 × 12 =', '60'), 'O visor mostra 60.') },
            { texto: '25 + 5', erro: 'calculadora-simples-sem-prioridade', explica: 'Assim ela faz $25 + 5 = 30$ e depois $30 \\times 12$: R$ 360, muito mais que a compra.', mostra: calculadoras(SIMPLES('25 + 5 × 12 =', '360'), 'O visor mostra 360, em vermelho.') },
          ],
          linha: { tex: '5 \\times 12 = 60', fala: 'cinco vezes doze é sessenta' },
        },
        {
          pergunta: 'O visor mostra 60. E agora?',
          opcoes: [
            { texto: '+ 25 =', certa: true, explica: 'Isso. Some a entrega: o visor mostra 85.', mostra: calculadoras(SIMPLES('5 × 12 = + 25 =', '85'), 'O visor vai de 60 para 85.') },
            { texto: '× 25 =', explica: 'A entrega se soma, não se multiplica. Digite + 25 =.', mostra: calculadoras(SIMPLES('5 × 12 = × 25 =', '1500'), 'O visor mostra 1500, em vermelho: muito mais que a compra.') },
          ],
          linha: { tex: '60 + 25 = 85', fala: 'sessenta mais vinte e cinco é oitenta e cinco' },
        },
        {
          pergunta: 'Estime para conferir. R$ 85 faz sentido?',
          fala: 'Estime para conferir. Oitenta e cinco reais faz sentido?',
          opcoes: [
            { texto: 'Sim', certa: true, explica: 'Isso. 5 caixas de uns R$ 10 passam um pouco de R$ 50. Com R$ 25 de entrega, perto de R$ 80.' },
            { texto: 'Não, devia ser 360', erro: 'calculadora-simples-sem-prioridade', explica: '360 é o que a calculadora dá com as teclas na ordem escrita. 5 caixas de R$ 12 não chegam a R$ 100.' },
          ],
          linha: { tex: '25 + 5 \\times 12 = 85', fala: 'vinte e cinco mais cinco vezes doze é oitenta e cinco' },
        },
      ],
      esboco: 'O aluno usa a calculadora de balcão do jeito certo e termina conferindo com uma estimativa, o hábito da unidade 2.',
    },
    {
      tipo: 'caderno',
      instrucao: 'Na calculadora simples, faça $100 - 8 \\times 7$: primeiro $8 \\times 7$, anote, depois a subtração. Quanto dá?',
      fala: 'Na calculadora simples, faça cem menos oito vezes sete: primeiro oito vezes sete, anote, depois a subtração. Quanto dá?',
      resposta: 44,
      resolucao: [
        { tex: '8 \\times 7 = 56', fala: 'oito vezes sete é cinquenta e seis' },
        { tex: '100 - 56 = 44', fala: 'cem menos cinquenta e seis é quarenta e quatro' },
      ],
      esboco: 'Uma subtração não dá para emendar: depois de 8 × 7 = 56, digitar − 100 faria 56 − 100. O caderno guarda o resultado do meio.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['calculadora-n1', 'calculadora-n2', 'calculadora-n3'],
      esboco: 'Nível 1: a simples mostrou um número; qual é o certo? Nível 2: escolher as teclas que dão o resultado certo. Nível 3: compras e estoque com o visor errado, sem apoio.',
    },
    {
      tipo: 'fecho',
      texto: 'A de balcão faz conta a conta, e a científica segue a regra. Unidade 5 completa! Próxima: **múltiplos, divisores e primos**.',
      fala: 'A de balcão faz conta a conta, e a científica segue a regra. Unidade cinco completa! Próxima: múltiplos, divisores e primos.',
      visual: calculadoras(
        [
          { nome: 'De balcão', teclas: '3 × 4 = + 2 =', visor: '14' },
          { nome: 'Científica', teclas: '2 + 3 × 4 =', visor: '14' },
        ],
        'As duas calculadoras do gancho, agora as duas com 14: a de balcão, com as teclas na ordem certa.',
      ),
      esboco: 'Responder ao gancho com as duas máquinas concordando, porque o aluno aprendeu a usar a simples. Fechar a unidade e apontar a próxima.',
    },
  ],
}
