import type { Aula, Visual } from '@/lib/formation/schema'

// Nenhuma ou infinitas soluções. Dois números que somam 3 e também somam 5
// não existem: x + y = 3 e x + y = 5 são retas paralelas, e a adição dá
// 0 = 2, um absurdo. Já x + y = 3 e 2x + 2y = 6 são a mesma reta: no Mexa
// pares, cada par da segunda cai na primeira, e a adição dá 0 = 0, que vale
// sempre. O momento-chave é a aposta do 0 = 0: não é x = 0 nem "nenhuma",
// é "todo par da reta serve". Depois, prever olhando as equações: se um
// lado esquerdo é o outro multiplicado, confere-se o lado direito.

const sis = (sistema: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { sistema }, esboco })
const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })

const TRES_CINCO = ['x + y = 3', 'x + y = 5']
const PARALELAS_RETAS = [{ equacao: 'x + y = 3' }, { equacao: 'x + y = 5' }]
const PARALELAS = plano({ retas: PARALELAS_RETAS, rotulo: 'Nunca se cruzam.' }, 'As retas x + y = 3 (âmbar) e x + y = 5 (azul), lado a lado, sem se tocar. Embaixo, "Nunca se cruzam."')

const TRES_SEIS = ['x + y = 3', '2x + 2y = 6']
const MESMA = plano({ retas: [{ equacao: 'x + y = 3' }, { equacao: '2x + 2y = 6' }], rotulo: 'É a mesma reta.' }, 'x + y = 3 grossa, em âmbar, e 2x + 2y = 6 tracejada por cima, em azul. Embaixo, "É a mesma reta."')

const QUATRO_DEZ = ['x + 2y = 4', '2x + 4y = 10']
const SEIS_OITO = ['x + y = 6', 'x + 2y = 8']

export const aula: Aula = {
  id: 'AF.U4.A5',
  titulo: 'Nenhuma ou infinitas soluções',
  objetivo: 'Reconhecer um sistema sem solução (retas paralelas; a conta dá um absurdo como 0 = 2) e um com infinitas (a mesma reta; a conta dá 0 = 0), e prever olhando as equações: um lado esquerdo é o outro multiplicado, e o lado direito também é ou não é.',
  modelo: 'plano',
  esboco: 'Abre com dois números que somam 3 e também 5. A aposta oferece pares que servem a uma só; a certa mostra as paralelas. O Mexa somar dá 0 = 2. Depois, x + y = 3 e 2x + 2y = 6: a aposta pergunta quantos pares servem, e o Mexa pares mostra que cada par da segunda cai na primeira. Momento-chave: a aposta do 0 = 0 (todo par da reta serve; não é x = 0 nem nenhuma solução). O anote. Duas apostas de prever sem conta (paralelas; um par só). O caderno: 3x + y = 7 e 6x + 2y = 15. O fecho volta às paralelas.',
  vega: 'Ideia central: duas retas no plano se cruzam num ponto (uma solução), nunca se cruzam (paralelas: nenhuma solução) ou são a mesma reta (infinitas soluções, todos os pares dela). Na conta, quando as letras somem todas: sobra uma frase falsa (0 = 2), e não há solução; ou uma frase sempre verdadeira (0 = 0), e todo par da reta serve. Para prever: se o lado esquerdo de uma equação é o da outra multiplicado (2x + 4y é o dobro de x + 2y), confira o lado direito: também multiplicado, é a mesma reta; diferente, paralelas. Se os lados esquerdos não são proporcionais, há um par só. Erros esperados: procurar um par a qualquer custo e aceitar um que serve a uma só; ler 0 = 0 como x = 0; achar que 0 = 0 é nenhuma solução; olhar só o lado esquerdo; achar que todo sistema tem um par. Guie com "Esse par serve à outra?", "O que sobrou é verdade ou mentira?", "Teste um par da reta nas duas", "O lado direito também dobrou?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Dois números somam 3. Os mesmos dois números também somam 5. Que números são esses?',
      visual: sis({ equacoes: TRES_CINCO }, 'x + y = 3 em cima de x + y = 5.'),
      esboco: 'Um sistema estranho, mas de cara. A pergunta parece ter resposta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Que par serve às duas equações?',
      visual: sis({ equacoes: TRES_CINCO }, 'x + y = 3 em cima de x + y = 5.'),
      opcoes: [
        {
          texto: '(1, 2)', erro: 'par-so-de-uma-equacao',
          explica: '${1 + 2 = 3}$, mas não dá 5. Serve só à primeira.',
          fala: 'Um mais dois dá três, mas não dá cinco. Serve só à primeira.',
          mostra: plano({ retas: PARALELAS_RETAS, conferir: [1, 2] }, 'As paralelas e o ponto (1, 2) em rosa, na reta âmbar. Embaixo: 1 + 2 = 3 ✓ e, em rosa, 1 + 2 = 3 ≠ 5 ✗.'),
        },
        {
          texto: '(2, 3)', erro: 'par-so-de-uma-equacao',
          explica: '${2 + 3 = 5}$, mas não dá 3. Serve só à segunda.',
          fala: 'Dois mais três dá cinco, mas não dá três. Serve só à segunda.',
          mostra: plano({ retas: PARALELAS_RETAS, conferir: [2, 3] }, 'As paralelas e o ponto (2, 3) em rosa, na reta azul. Embaixo, a conta que falha na primeira.'),
        },
        {
          texto: 'Nenhum par', certa: true,
          explica: 'Isso. A mesma soma não dá 3 e 5. As duas retas nunca se cruzam.',
          fala: 'Isso. A mesma soma não dá três e cinco. As duas retas nunca se cruzam.',
          mostra: PARALELAS,
        },
      ],
      esboco: 'Os pares que servem a uma só aparecem no plano, em rosa. A certa mostra as duas retas paralelas.',
    },
    {
      tipo: 'mexa',
      texto: 'A conta também avisa. Multiplique a primeira por −1 e some com a segunda.',
      fala: 'A conta também avisa. Multiplique a primeira por menos um e some com a segunda.',
      visual: sis({ equacoes: TRES_CINCO, vezes: [-1, 1] }, 'As duas equações, com "× (−1)" ao lado da primeira.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para multiplicar a primeira; toque de novo para somar.',
        sucesso: { somado: true },
        mostre: 'A primeira vira −x − y = −3; somadas, tudo some e sobra 0 = 2.',
      },
      descoberta: 'As duas letras somem juntas, e o que sobra, 0 = 2, nunca é verdade.',
      esboco: 'O primeiro toque troca os sinais da primeira linha; o segundo soma: x e −x riscados, y e −y riscados, embaixo 0 = 2.',
    },
    {
      tipo: 'ideia',
      texto: 'Sobrou ${0 = 2}$, uma mentira. Nenhum par faz 0 virar 2: o sistema **não tem solução**. As retas são paralelas.',
      fala: 'Sobrou zero igual a dois, uma mentira. Nenhum par faz zero virar dois: o sistema não tem solução. As retas são paralelas.',
      visual: PARALELAS,
      esboco: 'O plano das paralelas. A conta e o desenho dizem o mesmo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x + y = 3}$ com ${2x + 2y = 6}$? Quantos pares servem às duas?',
      fala: 'E x mais y igual a três com dois x mais dois y igual a seis? Quantos pares servem às duas?',
      visual: sis({ equacoes: TRES_SEIS }, 'x + y = 3 em cima de 2x + 2y = 6.'),
      opcoes: [
        {
          texto: 'Nenhum: 3 e 6 são diferentes', erro: 'acha-paralelas-sem-proporcao',
          explica: 'Teste (1, 2): ${1 + 2 = 3}$ e ${2 + 4 = 6}$. Serve às duas.',
          fala: 'Teste um, dois: um mais dois dá três, e dois mais quatro dá seis. Serve às duas.',
        },
        {
          texto: 'Um só, como sempre', erro: 'sistema-sempre-tem-um-par',
          explica: '(1, 2) serve, e (0, 3) também: ${0 + 3 = 3}$ e ${0 + 6 = 6}$. Já são dois.',
          fala: 'Um, dois serve, e zero, três também: zero mais três dá três, e zero mais seis dá seis. Já são dois.',
        },
        {
          texto: 'Infinitos', certa: true,
          explica: 'Isso. A segunda é a primeira dobrada, nos dois lados. Marque os pares e veja.',
          fala: 'Isso. A segunda é a primeira dobrada, nos dois lados. Marque os pares e veja.',
        },
      ],
      esboco: 'Prever antes do Mexa. Cada opção errada se desmonta testando pares.',
    },
    {
      tipo: 'mexa',
      texto: 'A reta de ${x + y = 3}$ está no plano. Marque pares de ${2x + 2y = 6}$ e veja onde eles caem.',
      fala: 'A reta de x mais y igual a três está no plano. Marque pares de dois x mais dois y igual a seis e veja onde eles caem.',
      visual: plano({ retas: [{ equacao: '2x + 2y = 6' }, { equacao: 'x + y = 3' }], x: [-2, 5], y: [-2, 5] }, 'O plano de −2 a 5, com a reta x + y = 3 à vista (azul). A reta 2x + 2y = 6 fica escondida até o fim.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em 4 pontos da grade em que ${2x + 2y}$ dá 6.',
        sucesso: { pontos: 4 },
        mostre: 'Quatro pares de 2x + 2y = 6, todos na reta x + y = 3. As retas coincidem.',
      },
      descoberta: 'Todo par de 2x + 2y = 6 está na reta x + y = 3: as duas são a mesma reta.',
      esboco: 'Cada par certo fica âmbar, em cima da reta azul. No fim, a reta 2x + 2y = 6 aparece e coincide com a outra.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Pela adição, com a primeira vezes −2, tudo some e sobra ${0 = 0}$. O que isso quer dizer?',
      fala: 'Pela adição, com a primeira vezes menos dois, tudo some e sobra zero igual a zero. O que isso quer dizer?',
      visual: sis({ equacoes: TRES_SEIS, vezes: [-2, 1], somado: true }, '−2x − 2y = −6 em cima de 2x + 2y = 6, tudo riscado em rosa; embaixo, 0 = 0.'),
      opcoes: [
        {
          texto: '$x = 0$ e $y = 0$', erro: 'zero-igual-zero-da-x-zero',
          explica: '(0, 0) nem serve: ${0 + 0}$ não dá 3. O 0 = 0 não fala do x; as letras sumiram.',
          fala: 'Zero, zero nem serve: zero mais zero não dá três. O zero igual a zero não fala do x; as letras sumiram.',
          mostra: plano({ retas: [{ equacao: 'x + y = 3' }, { equacao: '2x + 2y = 6' }], conferir: [0, 0] }, 'A mesma reta duas vezes e o ponto (0, 0) em rosa, fora dela. Embaixo, as contas que falham.'),
        },
        {
          texto: 'Nenhuma solução', erro: 'zero-igual-zero-sem-solucao',
          explica: '${0 = 0}$ é verdade. Absurdo é ${0 = 2}$. E (1, 2) serve às duas.',
          fala: 'Zero igual a zero é verdade. Absurdo é zero igual a dois. E um, dois serve às duas.',
          mostra: plano({ retas: [{ equacao: 'x + y = 3' }, { equacao: '2x + 2y = 6' }], conferir: [1, 2] }, 'A mesma reta duas vezes e o ponto (1, 2) branco, nela. Embaixo, 1 + 2 = 3 ✓ e 2 · 1 + 2 · 2 = 6 ✓.'),
        },
        {
          texto: 'Todo par da reta serve', certa: true,
          explica: 'Isso. ${0 = 0}$ vale sempre: o sistema tem **infinitas soluções**.',
          fala: 'Isso. Zero igual a zero vale sempre: o sistema tem infinitas soluções.',
          mostra: MESMA,
        },
      ],
      esboco: 'O momento-chave: 0 = 0 é uma frase sempre verdadeira, não "x = 0" nem "não tem". Cada errada se desmonta com um par no plano.',
    },
    {
      tipo: 'anote',
      titulo: 'Nenhuma ou infinitas soluções',
      definicao: 'Se tudo some e sobra um absurdo (0 = 2), as retas são paralelas: **nenhuma solução**. Se sobra 0 = 0, é a mesma reta: **infinitas**.',
      exemplo: { tex: 'x + y = 3 \\text{ e } x + y = 5: \\ 0 = 2', fala: 'x mais y igual a três e x mais y igual a cinco: zero igual a dois, nenhuma solução' },
      alerta: '${0 = 0}$ não quer dizer x = 0. Quer dizer que todo par da reta serve.',
      esboco: 'Na página: as paralelas com 0 = 2 e "nenhuma"; a mesma reta com 0 = 0 e "infinitas".',
    },
    {
      tipo: 'aposta',
      pergunta: 'Sem fazer conta: ${x + 2y = 4}$ e ${2x + 4y = 10}$. Quantas soluções?',
      fala: 'Sem fazer conta: x mais dois y igual a quatro e dois x mais quatro y igual a dez. Quantas soluções?',
      visual: sis({ equacoes: QUATRO_DEZ }, 'x + 2y = 4 em cima de 2x + 4y = 10.'),
      opcoes: [
        {
          texto: 'Infinitas: a segunda é o dobro', erro: 'proporcional-so-a-esquerda',
          explica: 'O lado esquerdo dobrou, mas o dobro de 4 é 8, não 10. As retas são paralelas.',
          fala: 'O lado esquerdo dobrou, mas o dobro de quatro é oito, não dez. As retas são paralelas.',
          mostra: plano({ retas: [{ equacao: 'x + 2y = 4' }, { equacao: '2x + 4y = 10' }], rotulo: 'Nunca se cruzam.' }, 'As retas x + 2y = 4 e 2x + 4y = 10, paralelas.'),
        },
        {
          texto: 'Uma', erro: 'sistema-sempre-tem-um-par',
          explica: 'Dobrada, a primeira diz ${2x + 4y = 8}$. A segunda diz 10. A mesma conta não dá 8 e 10.',
          fala: 'Dobrada, a primeira diz dois x mais quatro y igual a oito. A segunda diz dez. A mesma conta não dá oito e dez.',
          mostra: plano({ retas: [{ equacao: 'x + 2y = 4' }, { equacao: '2x + 4y = 10' }], rotulo: 'Nunca se cruzam.' }, 'As retas x + 2y = 4 e 2x + 4y = 10, paralelas.'),
        },
        {
          texto: 'Nenhuma', certa: true,
          explica: 'Isso. ${2x + 4y}$ não dá 8 e 10 ao mesmo tempo: as retas são paralelas.',
          fala: 'Isso. Dois x mais quatro y não dá oito e dez ao mesmo tempo: as retas são paralelas.',
          mostra: plano({ retas: [{ equacao: 'x + 2y = 4' }, { equacao: '2x + 4y = 10' }], rotulo: 'Nunca se cruzam.' }, 'As retas x + 2y = 4 e 2x + 4y = 10, paralelas.'),
        },
      ],
      esboco: 'Prever: o lado esquerdo é o dobro; confira o direito. A certa mostra as paralelas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E ${x + y = 6}$ com ${x + 2y = 8}$?',
      fala: 'E x mais y igual a seis com x mais dois y igual a oito?',
      visual: sis({ equacoes: SEIS_OITO }, 'x + y = 6 em cima de x + 2y = 8.'),
      opcoes: [
        {
          texto: 'Nenhuma: as duas começam com x', erro: 'acha-paralelas-sem-proporcao',
          explica: '${x + 2y}$ não é ${x + y}$ multiplicado. As retas se cruzam em (4, 2).',
          fala: 'x mais dois y não é x mais y multiplicado. As retas se cruzam em quatro, dois.',
          mostra: plano({ retas: [{ equacao: 'x + y = 6' }, { equacao: 'x + 2y = 8' }], cruzamento: true, conferir: true }, 'As retas x + y = 6 e x + 2y = 8 se cruzam em (4, 2), com a conferência nas duas.'),
        },
        {
          texto: 'Uma', certa: true,
          explica: 'Isso. Um lado esquerdo não é o outro multiplicado: as retas se cruzam, em (4, 2).',
          fala: 'Isso. Um lado esquerdo não é o outro multiplicado: as retas se cruzam, em quatro, dois.',
          mostra: plano({ retas: [{ equacao: 'x + y = 6' }, { equacao: 'x + 2y = 8' }], cruzamento: true, conferir: true }, 'As retas x + y = 6 e x + 2y = 8 se cruzam em (4, 2), com a conferência nas duas.'),
        },
      ],
      esboco: 'O caso comum, para contraste: sem proporção, um par só.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: ${3x + y = 7}$ e ${6x + 2y = 15}$. Faça a adição. Quantas soluções? Escreva nenhuma, uma ou infinitas.',
      fala: 'No papel: três x mais y igual a sete e seis x mais dois y igual a quinze. Faça a adição. Quantas soluções? Escreva nenhuma, uma ou infinitas.',
      resposta: 'nenhuma',
      resolucao: [
        { tex: '3x + y = 7 \\quad \\times (-2): \\ -6x - 2y = -14', fala: 'três x mais y igual a sete, vezes menos dois: menos seis x menos dois y igual a menos catorze' },
        { tex: '(-6x - 2y) + (6x + 2y) = -14 + 15', fala: 'menos seis x menos dois y, mais seis x mais dois y, igual a menos catorze mais quinze' },
        { tex: '0 = 1', fala: 'zero igual a um' },
        { tex: '\\text{absurdo: nenhuma solução}', fala: 'um absurdo: nenhuma solução' },
      ],
      esboco: 'O lado esquerdo dobrou (6x + 2y), o direito não (14 e 15): paralelas. A conta confirma: 0 = 1.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['sistemas-solucoes-n1', 'sistemas-solucoes-n2', 'sistemas-solucoes-n3'],
      esboco: 'Nível 1: quantas soluções, com as duas retas no plano. Nível 2: quantas soluções, só pelas equações (múltiplos por 2, 3, −1). Nível 3: o número que falta para o sistema não ter solução ou ter infinitas.',
    },
    {
      tipo: 'fecho',
      texto: 'Os números que somam 3 e também 5 não existem: as retas são paralelas. Já a mesma reta, dobrada, tem infinitos pares.',
      fala: 'Os números que somam três e também cinco não existem: as retas são paralelas. Já a mesma reta, dobrada, tem infinitos pares.',
      visual: PARALELAS,
      esboco: 'Responde ao gancho com as paralelas. A próxima aula leva os sistemas aos problemas.',
    },
  ],
}
