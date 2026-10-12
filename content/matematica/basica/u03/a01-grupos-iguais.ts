import type { Aula, Visual } from '@/lib/formation/schema'

// A primeira aula de multiplicação. Multiplicar é contar grupos iguais: 4
// pacotes de 6 são 6 + 6 + 6 + 6. Encostados, os pacotes viram um retângulo,
// o modelo que acompanha a unidade inteira (e volta em frações, área e
// álgebra): as linhas são os grupos, as colunas dizem quanto há em cada um.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const SALTOS_4x6 = [[0, 6, '+6'], [6, 12, '+6'], [12, 18, '+6'], [18, 24, '+6']]
const R24 = { de: 0, ate: 24, passo: 1, marcas: [0, 6, 12, 18, 24] }

export const aula: Aula = {
  id: 'B.U3.A1',
  titulo: 'Grupos iguais e retângulos',
  objetivo: 'Reconhecer situações de grupos iguais, escrevê-las como multiplicação (4 × 6 são 4 grupos de 6) e contar o total por um retângulo de linhas e colunas.',
  modelo: 'retangulo',
  esboco: 'Os pacotes de pão de queijo chegam à mesa um de cada vez, como linhas de quadradinhos separadas por um espaço. A soma cresce de 6 em 6. Depois os pacotes se encostam e viram um retângulo: 4 linhas, 6 colunas. Daí em diante o retângulo é a imagem da multiplicação: piso, estante, caixa de ovos. Momento-chave: os 4 pacotes se encostando e o aluno ver que o retângulo é a mesma conta, só que sem os espaços.',
  vega: 'Ideia central: multiplicar é juntar grupos iguais. 4 × 6 quer dizer 4 grupos de 6 (6 + 6 + 6 + 6 = 24). No retângulo, cada linha é um grupo; o número de linhas diz quantos grupos, o de colunas diz quanto há em cada grupo. Erros esperados: somar os dois números (4 pacotes de 6 → 10), contar só a beirada do retângulo, e multiplicar quando a situação é só juntar mais alguns (6 ovos e mais 4 → 24). Guie perguntando "Quantos grupos há?", "Quanto tem em cada grupo?", "Os grupos são iguais?". A tabuada ainda não é cobrada: somar de grupo em grupo vale. Em Sua vez, não diga o total: peça para somar uma linha de cada vez.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você comprou **4 pacotes** de pão de queijo, com **6** em cada. Dá para saber o total sem contar um por um?',
      fala: 'Você comprou quatro pacotes de pão de queijo, com seis em cada. Dá para saber o total sem contar um por um?',
      visual: ret({ linhas: 4, colunas: 6, grupos: true }, 'Quatro fileiras de 6 bolinhas (quadradinhos), cada fileira com um pequeno espaço da outra: são os pacotes. Nada escrito.'),
      esboco: 'Uma compra comum. Contar 24 bolinhas uma por uma é chato; a pergunta convida a achar um jeito melhor.',
    },
    {
      tipo: 'mexa',
      texto: 'Ponha os **4 pacotes** na mesa, um de cada vez.',
      fala: 'Ponha os quatro pacotes na mesa, um de cada vez.',
      visual: ret({ linhas: 0, colunas: 6, grupos: true, adicionar: true, total: 0 }, 'A mesa vazia, com o botão "+ 1 linha". Cada toque desliza um pacote de 6 para baixo dos outros, com um espaço entre eles, e o total embaixo sobe: 6, 12, 18, 24.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para pôr mais um pacote de 6.',
        sucesso: { linhas: 4 },
        mostre: 'Os quatro pacotes entram um depois do outro; o total sobe de 6 em 6 até 24.',
      },
      descoberta: 'Cada pacote soma 6. Com 4 pacotes: 6, 12, 18, 24. O total cresce de grupo em grupo, não de um em um.',
      esboco: 'O aluno sente a soma repetida com o dedo: cada toque é "mais 6". O total contando junto é o que ensina.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Que conta dá o total dos **4 pacotes de 6**?',
      fala: 'Que conta dá o total dos quatro pacotes de seis?',
      visual: ret({ linhas: 4, colunas: 6, grupos: true }, 'Os 4 pacotes na mesa, sem o total escrito.'),
      opcoes: [
        {
          texto: '$6 + 6 + 6 + 6$', certa: true,
          explica: 'Isso. Um 6 para cada pacote: 6, 12, 18, **24**.',
          mostra: reta({ ...R24, saltos: SALTOS_4x6, numeros: [24] }, 'Quatro saltos de +6 na reta, de 0 até 24, um para cada pacote.'),
        },
        {
          texto: '$4 + 6$', erro: 'soma-no-lugar-de-multiplicar',
          explica: '4 + 6 = 10, mas só um pacote já tem 6. São 4 pacotes **de** 6: 6 + 6 + 6 + 6 = 24.',
          mostra: reta({ ...R24, saltos: SALTOS_4x6, numeros: [10, 24] }, 'O 10 acende na reta, perto do começo; depois os quatro saltos de +6 passam por ele e chegam ao 24.'),
        },
      ],
      esboco: 'O erro de somar os dois números aparece logo, e a reta mostra que 10 fica muito antes do fim.',
    },
    {
      tipo: 'ideia',
      texto: 'Encoste os pacotes: vira um **retângulo**. 4 linhas de 6 é $4 \\times 6$, que se lê "4 vezes 6".',
      fala: 'Encoste os pacotes: vira um retângulo. Quatro linhas de seis é quatro vezes seis.',
      visual: { ...ret({ linhas: 4, colunas: 6, rotulos: true, total: 24 }, 'Os espaços entre os pacotes somem e as fileiras se encostam num retângulo de 4 por 6. O 4 aparece à esquerda, o 6 em cima e o 24 embaixo.'), movimento: 'As 4 fileiras deslizam até se encostar; os rótulos 4 e 6 aparecem nos lados.' },
      esboco: 'Momento-chave: o retângulo é a mesma conta, sem os espaços. Daqui para a frente, toda multiplicação tem um retângulo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O piso da área tem **5 fileiras** de **8** lajotas. Quantas lajotas?',
      fala: 'O piso da área tem cinco fileiras de oito lajotas. Quantas lajotas?',
      visual: ret({ linhas: 5, colunas: 8, rotulos: true }, 'Um retângulo de 5 linhas e 8 colunas, com cara de piso. O 5 e o 8 nos lados.'),
      opcoes: [
        {
          texto: '40', certa: true,
          explica: 'Isso. 5 linhas de 8: 8, 16, 24, 32, 40. É $5 \\times 8 = 40$.',
          mostra: ret({ linhas: 5, colunas: 8, rotulos: true, total: 40 }, 'As linhas acendem uma a uma, e o total sobe de 8 em 8 até 40.'),
        },
        {
          texto: '13', erro: 'soma-no-lugar-de-multiplicar',
          explica: '5 + 8 = 13 conta só uma linha e mais um pouco. São 5 linhas de 8: 40.',
          mostra: ret({ linhas: 5, colunas: 8, rotulos: true, destaque: 'linha', total: 40 }, 'A primeira linha acende: já são 8. Depois as outras quatro.'),
        },
        {
          texto: '22',
          explica: '22 são só as lajotas da beirada. O meio também tem piso: 5 linhas de 8, 40.',
          mostra: ret({ linhas: 5, colunas: 8, rotulos: true, total: 40 }, 'A beirada acende e depois o miolo também, até todas as 40.'),
        },
      ],
      esboco: 'O retângulo agora é um piso de verdade. Quem conta só a borda vê o miolo acender.',
    },
    {
      tipo: 'passo',
      problema: 'Uma estante tem **3 prateleiras** com **7 livros** em cada. Quantos livros?',
      fala: 'Uma estante tem três prateleiras com sete livros em cada. Quantos livros?',
      visual: ret({ linhas: 3, colunas: 7, grupos: true }, 'Três fileiras de 7, separadas, como prateleiras.'),
      passos: [
        {
          pergunta: 'Quantos **grupos** iguais há?',
          opcoes: [
            { texto: '3, as prateleiras', certa: true, explica: 'Isso. Cada prateleira é um grupo.' },
            { texto: '7, os livros', explica: '7 é quanto tem em cada prateleira. Os grupos são as prateleiras: 3.' },
          ],
          linha: { tex: '3\\text{ grupos}', fala: 'três grupos' },
        },
        {
          pergunta: 'E quantos livros em **cada** grupo?',
          opcoes: [
            { texto: '7', certa: true, explica: 'Isso. 7 em cada prateleira.' },
            { texto: '10', explica: 'Cada prateleira tem 7 livros. 10 seria 3 + 7.' },
          ],
          linha: { tex: '7\\text{ em cada}', fala: 'sete em cada' },
        },
        {
          pergunta: 'Qual é a conta?',
          opcoes: [
            { texto: '$3 \\times 7 = 21$', certa: true, explica: 'Isso. 7 + 7 + 7 = 21.', mostra: ret({ linhas: 3, colunas: 7, rotulos: true, total: 21 }, 'As prateleiras se encostam num retângulo de 3 por 7; o total 21 aparece.') },
            { texto: '$3 + 7 = 10$', erro: 'soma-no-lugar-de-multiplicar', explica: 'São 3 grupos **de** 7, não 3 e mais 7. 7 + 7 + 7 = 21.', mostra: ret({ linhas: 3, colunas: 7, rotulos: true, total: 21 }, 'Cada prateleira acende com o seu 7; o total chega a 21.') },
          ],
          linha: { tex: '3 \\times 7 = 21', fala: 'três vezes sete é vinte e um' },
        },
      ],
      esboco: 'Duas perguntas que servem para qualquer problema de multiplicação: quantos grupos, quanto em cada.',
    },
    {
      tipo: 'anote',
      titulo: 'Multiplicação',
      definicao: 'Multiplicar é juntar grupos iguais: $4 \\times 6$ são 4 grupos de 6. No retângulo, 4 linhas de 6.',
      exemplo: { tex: '4 \\times 6 = 6 + 6 + 6 + 6 = 24', fala: 'quatro vezes seis é seis mais seis mais seis mais seis, vinte e quatro' },
      alerta: '$4 \\times 6$ não é $4 + 6$. São 4 grupos **de** 6.',
      esboco: 'Na página: o retângulo de 4 por 6 desenhado no quadriculado, com o 4 à esquerda e o 6 em cima.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No quadriculado, desenhe um retângulo de **3 linhas** e **9 colunas**. Quantos quadradinhos?',
      fala: 'No quadriculado, desenhe um retângulo de três linhas e nove colunas. Quantos quadradinhos?',
      resposta: 27,
      resolucao: [
        { tex: '3 \\times 9 = 9 + 9 + 9', fala: 'três vezes nove é nove mais nove mais nove' },
        { tex: '9 + 9 + 9 = 27', fala: 'nove mais nove mais nove é vinte e sete' },
      ],
      esboco: 'Desenhar o retângulo no papel fixa a imagem. A resolução mostra a soma das linhas.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['grupos-n1', 'grupos-n2', 'grupos-n3'],
      esboco: 'Nível 1: contar um retângulo pequeno, com ele na tela. Nível 2: grupos iguais numa situação, sem desenho. Nível 3: decidir se é para multiplicar ou só somar.',
    },
    {
      tipo: 'fecho',
      texto: 'São $4 \\times 6 = 24$ pães de queijo. Na próxima aula: a **tabuada**, sem decoreba.',
      fala: 'São quatro vezes seis, vinte e quatro pães de queijo. Na próxima aula: a tabuada, sem decoreba.',
      visual: ret({ linhas: 4, colunas: 6, rotulos: true, total: 24 }, 'O retângulo de 4 por 6 do gancho, com o 24 embaixo.'),
      esboco: 'Responder ao gancho com o retângulo. A próxima aula mostra que não é preciso decorar a tabuada inteira.',
    },
  ],
}
