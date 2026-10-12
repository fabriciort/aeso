import type { Aula, Visual } from '@/lib/formation/schema'

// A primeira aula de expressões. Uma conta escrita numa linha só precisa de
// uma regra de leitura, senão cada pessoa acha um número: × e ÷ antes de
// + e −; entre operações da mesma prioridade, da esquerda para a direita.
// A padaria mostra que a regra não é capricho: ela diz o que a situação diz.

const expressao = (linhas: string[], esboco: string, destaque?: string): Visual => ({
  modelo: 'livre',
  estado: destaque ? { expressao: linhas, destaque } : { expressao: linhas },
  esboco,
})
const PADARIA = ['5 + 2 × 3', '5 + 6', '11']
const PASSO = '30 − 4 × 5 + 6 ÷ 2'

export const aula: Aula = {
  id: 'B.U5.A1',
  titulo: 'A ordem das operações',
  objetivo: 'Resolver expressões com +, −, × e ÷ na ordem certa: primeiro × e ÷, depois + e −, e da esquerda para a direita entre operações da mesma prioridade.',
  modelo: 'livre',
  esboco: 'A aula abre com a briga de internet: 2 + 3 × 4 dá 20 ou 14? Antes de dar a regra, a padaria decide: 2 cafés de R$ 3 e um pão de R$ 5 custam R$ 11, e não R$ 21. A regra aparece como o jeito de a conta escrita dizer o mesmo que a situação. No palco, a expressão sempre resolvida em linhas que encolhem, de cima para baixo, com a próxima conta numa moldura âmbar. Momento-chave: perceber que R$ 21 seria o preço de 7 cafés, e que a regra "× antes de +" só protege o que já faz sentido.',
  vega: 'Ideia central: uma expressão tem uma ordem de leitura combinada por todos. Primeiro × e ÷, depois + e −. Entre operações da mesma prioridade (+ com −, × com ÷), da esquerda para a direita. A regra existe para que uma conta escrita tenha um resultado só; em situações concretas, ela coincide com o sentido (o preço de 2 cafés é 2 × 3, e só depois se soma o pão). Erros esperados: resolver tudo da esquerda para a direita (2 + 3 × 4 = 20); achar que + vem antes de − (10 − 3 + 2 = 5); achar que × vem antes de ÷ (12 ÷ 2 × 3 = 2). Guie perguntando "Tem × ou ÷ nesta conta?", "Qual aparece primeiro, da esquerda para a direita?", e use dinheiro para a mesma prioridade (tem R$ 10, gasta 3, ganha 2). Escreva cada passo numa linha nova, começando com "=". Parênteses ficam para a próxima aula: se o aluno perguntar, diga que eles mudam a ordem e vêm logo depois. Em Sua vez, não resolva: pergunte qual conta vem primeiro.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Num grupo de mensagens, alguém posta **2 + 3 × 4**. Metade responde **20**, metade **14**. Quem está certo?',
      fala: 'Num grupo de mensagens, alguém posta: dois mais três vezes quatro. Metade responde vinte, metade catorze. Quem está certo?',
      visual: expressao(['2 + 3 × 4'], 'A conta sozinha, grande, como um post. Embaixo dela, dois balões de resposta, 20 e 14, empatados. Nada é resolvido ainda.'),
      esboco: 'Uma discussão que todo adulto já viu circular. A pergunta fica aberta até o fecho: primeiro a padaria vai mostrar por que existe uma regra.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na padaria: **2 cafés** de R$ 3 e um **pão** de R$ 5. A conta é $5 + 2 \\times 3$. Quanto você paga?',
      fala: 'Na padaria: dois cafés de três reais e um pão de cinco. A conta é cinco mais dois vezes três. Quanto você paga?',
      visual: expressao(['5 + 2 × 3'], 'A conta da padaria. Acima de cada parte, um desenho pequeno: o pão com R$ 5 em cima do 5, os dois cafés com R$ 3 em cima do 2 × 3.'),
      opcoes: [
        {
          texto: 'R$ 11', certa: true,
          explica: 'Isso. Os 2 cafés custam $2 \\times 3 = 6$. Com o pão, $5 + 6 = 11$.',
          mostra: expressao(PADARIA, 'A conta encolhe linha a linha: o 2 × 3 vira 6 debaixo dos cafés, e o 5 + 6 vira 11.'),
        },
        {
          texto: 'R$ 21', erro: 'ignora-prioridade',
          explica: 'R$ 21 é o preço de 7 cafés. Você levou 2: $2 \\times 3 = 6$, mais R$ 5 do pão. Dá R$ 11.',
          mostra: expressao(PADARIA, 'Por um instante aparecem 7 xícaras para o 5 + 2 virar 7; elas somem, ficam só 2, e a conta encolhe até 11.'),
        },
      ],
      esboco: 'O momento-chave. O aluno já sabe quanto custa a compra. A conta da esquerda para a direita dá um número que a padaria nunca cobraria.',
    },
    {
      tipo: 'ideia',
      texto: 'Para todo mundo ler a conta igual, a regra é: **× e ÷ antes de + e −**.',
      fala: 'Para todo mundo ler a conta igual, a regra é: vezes e dividir antes de mais e menos.',
      visual: expressao(['5 + 2 × 3'], 'A conta da padaria volta inteira, com o 2 × 3 numa moldura âmbar: é por ele que se começa.', '2 × 3'),
      esboco: 'A regra nasce como resumo do que a padaria mostrou. Uma frase, e a moldura âmbar que vai acompanhar a unidade inteira.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E quando só tem **+** e **−**? Quanto dá $10 - 3 + 2$?',
      fala: 'E quando só tem mais e menos? Quanto dá dez menos três mais dois?',
      visual: expressao(['10 − 3 + 2'], 'Uma conta só com + e −. Nenhuma moldura: o aluno decide por onde começar.'),
      opcoes: [
        {
          texto: '9', certa: true,
          explica: 'Isso. Mesma prioridade: **da esquerda para a direita**. $10 - 3 = 7$, e $7 + 2 = 9$.',
          mostra: expressao(['10 − 3 + 2', '7 + 2', '9'], 'A conta encolhe da esquerda para a direita: primeiro o 10 − 3, depois o + 2.'),
        },
        {
          texto: '5', erro: 'soma-antes-de-subtrair',
          explica: 'Você fez $3 + 2$ antes. Pense: você tem R$ 10, gasta R$ 3 e ganha R$ 2. Fica com R$ 9.',
          mostra: expressao(['10 − 3 + 2', '7 + 2', '9'], 'Uma carteira com R$ 10: saem R$ 3, entram R$ 2. Ao lado, a conta encolhe até 9.'),
        },
      ],
      esboco: 'A segunda metade da regra, com dinheiro no desmonte. Os R$ 2 entram na carteira, não se juntam ao que saiu.',
    },
    {
      tipo: 'mexa',
      texto: 'Em que ordem se faz $20 - 4 \\times 3 + 2$?',
      fala: 'As duas regras juntas: vinte menos quatro vezes três mais dois.',
      visual: {
        modelo: 'livre',
        estado: { fichas: ['−', '×', '+'], lugares: ['1º', '2º', '3º'] },
        esboco: 'Os três sinais da conta viram fichas soltas, na ordem em que aparecem: −, ×, +. Em cima, três lugares: 1º, 2º e 3º. Proposta: mostrar a expressão 20 − 4 × 3 + 2 acima dos lugares, com cada sinal tocável no próprio lugar dele, e a conta encolhendo a cada ficha certa (20 − 12 + 2, depois 8 + 2, depois 10).',
      },
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos sinais na ordem em que as contas se fazem.',
        sucesso: { ordem: ['×', '−', '+'] },
        mostre: 'O × vai para o 1º lugar, o − para o 2º e o + para o 3º. A conta encolhe: 20 − 12 + 2, depois 8 + 2, depois 10.',
      },
      descoberta: 'Primeiro o × (4 × 3 = 12). Depois, entre − e +, quem vem antes da esquerda para a direita: 20 − 12 = 8, e 8 + 2 = 10.',
      esboco: 'O aluno aplica as duas regras com o dedo, sem fazer conta nenhuma ainda. Errar a ordem balança as fichas.',
    },
    {
      tipo: 'anote',
      titulo: 'A ordem das operações',
      definicao: 'Primeiro × e ÷, depois + e −. Entre contas de mesma prioridade, da esquerda para a direita.',
      exemplo: { tex: '20 - 4 \\times 3 + 2 = 10', fala: 'vinte menos quatro vezes três mais dois é igual a dez' },
      alerta: 'Não resolva tudo na ordem em que está escrito: em $5 + 2 \\times 3$, o × vem antes.',
      esboco: 'A página de caderno com a regra, o exemplo do Mexa e o alerta da padaria.',
    },
    {
      tipo: 'passo',
      problema: 'Resolva $30 - 4 \\times 5 + 6 \\div 2$, um passo por linha.',
      fala: 'Resolva trinta menos quatro vezes cinco mais seis dividido por dois, um passo por linha.',
      visual: expressao([PASSO], 'A conta inteira, grande. Cada passo certo escreve uma linha nova embaixo, e a de cima fica menor.'),
      passos: [
        {
          pergunta: 'Qual conta você faz primeiro?',
          opcoes: [
            { texto: '4 × 5', certa: true, explica: 'Isso. × e ÷ vêm antes, e o $4 \\times 5$ é o primeiro deles.', mostra: expressao([PASSO, '30 − 20 + 6 ÷ 2'], 'O 4 × 5 vira 20 na linha de baixo.') },
            { texto: '30 − 4', erro: 'ignora-prioridade', explica: 'O − espera. Antes vêm as contas de × e ÷: $4 \\times 5$ e $6 \\div 2$.', mostra: expressao([PASSO], 'A conta com o 4 × 5 e o 6 ÷ 2 em moldura âmbar.', '4 × 5') },
          ],
          linha: { tex: '= 30 - 20 + 6 \\div 2', fala: 'igual a trinta menos vinte mais seis dividido por dois' },
        },
        {
          pergunta: 'E agora?',
          opcoes: [
            { texto: '6 ÷ 2', certa: true, explica: 'Isso. Ainda falta uma divisão: ela vem antes do − e do +.', mostra: expressao([PASSO, '30 − 20 + 6 ÷ 2', '30 − 20 + 3'], 'O 6 ÷ 2 vira 3.') },
            { texto: '30 − 20', erro: 'ignora-prioridade', explica: 'Ainda há uma divisão: $6 \\div 2$ vem antes do − e do +.', mostra: expressao([PASSO, '30 − 20 + 6 ÷ 2'], 'O 6 ÷ 2 ganha a moldura âmbar.', '6 ÷ 2') },
          ],
          linha: { tex: '= 30 - 20 + 3', fala: 'igual a trinta menos vinte mais três' },
        },
        {
          pergunta: 'Só sobraram − e +. Quanto dá?',
          opcoes: [
            { texto: '13', certa: true, explica: 'Isso. Da esquerda para a direita: $30 - 20 = 10$, e $10 + 3 = 13$.', mostra: expressao([PASSO, '30 − 20 + 6 ÷ 2', '30 − 20 + 3', '10 + 3', '13'], 'As últimas linhas: 10 + 3 e, grande, 13.') },
            { texto: '7', erro: 'soma-antes-de-subtrair', explica: 'Você fez $20 + 3$ antes. Da esquerda: $30 - 20 = 10$, e depois $10 + 3 = 13$.', mostra: expressao([PASSO, '30 − 20 + 6 ÷ 2', '30 − 20 + 3', '10 + 3', '13'], 'A conta encolhe da esquerda para a direita até 13.') },
          ],
          linha: { tex: '= 13', fala: 'igual a treze' },
        },
      ],
      esboco: 'O caderno da tela mostra o jeito certo de escrever: cada linha começa com "=" e vale o mesmo que a de cima. É a semente da próxima aula.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No caderno: 3 sacos de cimento de R$ 35 e R$ 20 de entrega. Resolva $20 + 3 \\times 35$, um passo por linha.',
      fala: 'No caderno: três sacos de cimento de trinta e cinco reais e vinte de entrega. Resolva vinte mais três vezes trinta e cinco, um passo por linha.',
      resposta: 125,
      resolucao: [
        { tex: '20 + 3 \\times 35', fala: 'vinte mais três vezes trinta e cinco' },
        { tex: '= 20 + 105', fala: 'igual a vinte mais cento e cinco' },
        { tex: '= 125', fala: 'igual a cento e vinte e cinco' },
      ],
      esboco: 'Uma compra de obra, com a entrega escrita antes, para a ordem da regra importar. O aluno escreve as linhas como no passo a passo.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['ordem-n1', 'ordem-n2', 'ordem-n3'],
      esboco: 'Nível 1: uma soma ou subtração com um × ou ÷, com a moldura âmbar na conta que vem primeiro. Nível 2: mesma prioridade da esquerda para a direita, e contas com três operações. Nível 3: compras e contas do dia a dia, sem a expressão escrita.',
    },
    {
      tipo: 'fecho',
      texto: 'Quem respondeu **14** acertou: $3 \\times 4$ vem antes. Na próxima aula: **parênteses**, para mudar a ordem.',
      fala: 'Quem respondeu catorze acertou: três vezes quatro vem antes. Na próxima aula: parênteses, para mudar a ordem.',
      visual: expressao(['2 + 3 × 4', '2 + 12', '14'], 'A conta do gancho, agora resolvida em três linhas. O balão do 14 acende em âmbar; o do 20 fica com a pergunta "e se fosse (2 + 3) × 4?".'),
      esboco: 'Responder ao gancho com a mesma imagem e abrir a próxima aula: quem achou 20 não estava louco, só faltavam os parênteses.',
    },
  ],
}
