import type { Aula, Visual } from '@/lib/formation/schema'

// Os atalhos de divisibilidade, com o porquê nos blocos. Por 2, 5 e 10, as
// placas e as barras já se dividem, então só os cubos soltos decidem: o
// último algarismo. Por 3 e 9, cada barra de 10 é 9 + 1 (e cada placa de
// 100 é 99 + 1): tirando os grupos de 9, cada peça deixa 1 cubo. O que
// sobra é a soma dos algarismos.

const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const quadro = (numero: number, esboco: string, destaque?: string): Visual => ({
  modelo: 'quadro-posicional',
  estado: destaque ? { numero, casas: ['M', 'C', 'D', 'U'], destaque, blocosVisiveis: false } : { numero, casas: ['M', 'C', 'D', 'U'], blocosVisiveis: false },
  esboco,
})
const B135 = { centenas: 1, dezenas: 3, unidades: 5, total: 135 }
const B27 = { dezenas: 2, unidades: 7, total: 27 }

export const aula: Aula = {
  id: 'B.U6.A2',
  titulo: 'Regras de divisibilidade',
  objetivo: 'Decidir sem fazer a conta se um número é divisível por 2, 5, 10, 3 ou 9, e explicar com os blocos por que cada regra funciona.',
  modelo: 'blocos',
  esboco: 'Uma conta de R$ 1.236 para 3 amigos: dá em reais inteiros? Primeiro os blocos de 135 mostram por que, para 5, só os cubos soltos decidem: placas e barras já se dividem em grupos de 5. Depois, a surpresa: 27 termina em 7 e é divisível por 3. O aluno arruma uma barra de 10 em fileiras de 9 e vê sobrar 1. Cada barra deixa 1 cubo; em 27, as 2 barras deixam 2, mais os 7 soltos: 9. Momento-chave: ver que a soma dos algarismos é exatamente o que sobra quando se tiram os grupos de 9.',
  vega: 'Ideia central: as regras de divisibilidade são atalhos com motivo. Por 2, 5 e 10, toda dezena, centena e milhar já se divide, então só o último algarismo decide (2: final 0, 2, 4, 6, 8; 5: final 0 ou 5; 10: final 0). Por 3 e 9, cada 10 é 9 + 1, cada 100 é 99 + 1: tirando os grupos de 9, cada peça deixa 1 cubo, e o que sobra é a soma dos algarismos. Se a soma é divisível por 3 (ou por 9), o número também é. Erros esperados: olhar o primeiro algarismo para 5 ("512 é divisível por 5 porque começa com 5"); usar o último algarismo para 3 ("27 não, termina em 7"); achar que divisível por 3 é divisível por 9 (1.236: soma 12). Guie perguntando "Quem decide: as barras ou os cubos soltos?", "Quanto sobra de cada barra quando você tira 9?". As regras do 4, 6 e 11 ficam de fora; se o aluno perguntar, 6 é "por 2 e por 3 ao mesmo tempo". Em Sua vez, peça para dizer a regra antes de responder.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma conta de **R$ 1.236** vai ser dividida entre **3** amigos. Dá em reais inteiros? Sem fazer a conta.',
      fala: 'Uma conta de mil duzentos e trinta e seis reais vai ser dividida entre três amigos. Dá em reais inteiros? Sem fazer a conta.',
      visual: quadro(1236, 'O 1.236 grande no quadro, com as quatro casas. Nenhuma conta à vista.'),
      esboco: 'A pergunta fica aberta. Primeiro os atalhos mais simples, depois o do 3.',
    },
    {
      tipo: 'aposta',
      pergunta: '**135** em grupos de **5**. Quem decide se sobra alguma coisa?',
      fala: 'Cento e trinta e cinco em grupos de cinco. Quem decide se sobra alguma coisa?',
      visual: blocos(B135, '1 placa, 3 barras e 5 cubos soltos.'),
      opcoes: [
        {
          texto: 'Só os 5 cubos soltos', certa: true,
          explica: 'Isso. A placa de 100 e as barras de 10 já se dividem em grupos de 5. Só os soltos podiam sobrar.',
          mostra: blocos({ ...B135, destaque: 'unidades' }, 'A placa e as barras se quebram em grupos de 5 e apagam; os 5 cubos soltos acendem e formam mais um grupo.'),
        },
        {
          texto: 'O 1 da frente', erro: 'regra-no-algarismo-errado',
          explica: 'O 1 da frente é uma placa de 100, e 100 já se divide em 20 grupos de 5. Quem decide são os cubos soltos.',
          mostra: blocos({ ...B135, destaque: 'centenas' }, 'A placa se quebra em 20 grupos de 5, sem sobra.'),
        },
        {
          texto: 'Todos os algarismos juntos',
          explica: 'Para 5, não precisa: 100 e 30 já são grupos de 5. Sobram só as unidades para decidir.',
          mostra: blocos({ ...B135, destaque: 'unidades' }, 'Placa e barras apagam; os cubos soltos acendem.'),
        },
      ],
      esboco: 'O porquê antes da regra. O aluno vê que as peças grandes nunca deixam sobra para 5.',
    },
    {
      tipo: 'ideia',
      texto: 'Por **2**, **5** e **10**, o último algarismo decide. Por 2: 0, 2, 4, 6 ou 8. Por 5: 0 ou 5. Por 10: 0.',
      fala: 'Por dois, cinco e dez, o último algarismo decide. Por dois: zero, dois, quatro, seis ou oito. Por cinco: zero ou cinco. Por dez: zero.',
      visual: blocos({ ...B135, destaque: 'unidades' }, 'Os cubos soltos acesos; placa e barras em cinza, já resolvidas.'),
      esboco: 'Três regras numa frase, todas com o mesmo motivo: 10 já se divide por 2, por 5 e por 10.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora por **3**. O **27** termina em 7. Ele é divisível por 3?',
      fala: 'Agora por três. O vinte e sete termina em sete. Ele é divisível por três?',
      visual: blocos(B27, '2 barras e 7 cubos soltos.'),
      opcoes: [
        {
          texto: 'Sim: 3 × 9 = 27', certa: true,
          explica: 'Isso. E 13 termina em 3, mas não é divisível por 3. Para o 3, o último algarismo não decide.',
          mostra: blocos({ ...B27, destaque: 'dezenas' }, 'Os 27 cubos se arrumam em 9 grupos de 3, sem sobra.'),
        },
        {
          texto: 'Não: termina em 7', erro: 'regra-no-algarismo-errado',
          explica: '$3 \\times 9 = 27$, sem sobra. Para o 3, a barra de 10 não se divide certinho: o final não basta.',
          mostra: blocos({ ...B27, destaque: 'dezenas' }, 'Os 27 cubos se arrumam em 9 grupos de 3.'),
        },
      ],
      esboco: 'A surpresa da aula: o atalho do final não serve para o 3. Por quê? O próximo cartão mostra.',
    },
    {
      tipo: 'mexa',
      texto: 'Uma barra tem **10**. Arrume os 10 em fileiras de **9**.',
      fala: 'Uma barra tem dez. Arrume os dez em fileiras de nove.',
      visual: ret({ linhas: 0, colunas: 9, rotulos: true, adicionar: true, total: 10 }, 'Os 10 cubos de uma barra, soltos. Cada toque sobe uma fileira de 9.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque até não dar para montar outra fileira de 9.',
        sucesso: { linhas: 1 },
        mostre: 'Uma fileira de 9 sobe. Sobra 1 cubo, contornado em âmbar.',
      },
      descoberta: 'Uma barra de 10 é 9 + 1: tirando o grupo de 9, sobra 1. Toda barra deixa 1 cubo. E a placa de 100 é 99 + 1: também deixa 1.',
      esboco: 'Proposta para os blocos: um Mexa em que cada toque numa barra tira 9 cubos dela (que somem) e deixa 1 cubo âmbar no lugar. Em 27, as 2 barras viram 2 cubos, e ficam 2 + 7 = 9.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em **27**, cada barra deixa 1 cubo. Tirando os grupos de 9, quantos cubos sobram para olhar?',
      fala: 'Em vinte e sete, cada barra deixa um cubo. Tirando os grupos de nove, quantos cubos sobram para olhar?',
      visual: blocos(B27, 'As 2 barras e os 7 cubos soltos.'),
      opcoes: [
        {
          texto: '2 + 7 = 9', certa: true,
          explica: 'Isso. 2 cubos das barras e 7 soltos: 9, que forma mais um grupo de 9. A soma dos algarismos decide.',
          mostra: blocos({ dezenas: 0, unidades: 9 }, 'Cada barra perde 9 cubos e fica com 1; os 2 cubos se juntam aos 7: 9 cubos acesos.'),
        },
        {
          texto: 'Só os 7 soltos', erro: 'regra-no-algarismo-errado',
          explica: 'Cada barra também deixa 1 cubo. São 2 das barras e 7 soltos: $2 + 7 = 9$.',
          mostra: blocos({ dezenas: 0, unidades: 9 }, 'Os 2 cubos que as barras deixam se juntam aos 7.'),
        },
      ],
      esboco: 'O momento-chave. A soma dos algarismos deixa de ser truque: é o que sobra de verdade.',
    },
    {
      tipo: 'ideia',
      texto: 'Por **3** e por **9**, some os algarismos. Se a soma é divisível, o número também é: $2 + 7 = 9$.',
      fala: 'Por três e por nove, some os algarismos. Se a soma é divisível, o número também é: dois mais sete é nove.',
      visual: blocos({ dezenas: 0, unidades: 9 }, 'Os 9 cubos que sobraram, em 3 grupos de 3.'),
      esboco: 'Vale para o 3 também, porque 9 é 3 grupos de 3.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Volte ao **1.236**. Ele é divisível por **3**?',
      fala: 'Volte ao mil duzentos e trinta e seis. Ele é divisível por três?',
      visual: quadro(1236, 'O 1.236 no quadro, com as quatro casas acesas.'),
      opcoes: [
        {
          texto: 'Sim: 1 + 2 + 3 + 6 = 12', certa: true,
          explica: 'Isso. 12 é divisível por 3, então 1.236 também é. A conta fecha em reais inteiros.',
          mostra: quadro(1236, 'Os quatro algarismos descem e viram a soma 12, que se parte em 4 grupos de 3.'),
        },
        {
          texto: 'Não: termina em 6, e 6 é par', erro: 'regra-no-algarismo-errado',
          explica: 'Par é a regra do 2. Para o 3, some tudo: $1 + 2 + 3 + 6 = 12$, divisível por 3.',
          mostra: quadro(1236, 'Todas as casas acendem, não só a das unidades.'),
        },
      ],
      esboco: 'O gancho respondido pela regra, antes do fecho.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E o **1.236** é divisível por **9**?',
      fala: 'E o mil duzentos e trinta e seis é divisível por nove?',
      visual: quadro(1236, 'O 1.236 e, ao lado, a soma 12.'),
      opcoes: [
        {
          texto: 'Não: 12 não é múltiplo de 9', certa: true,
          explica: 'Isso. Tirando os grupos de 9, sobram 12, e 12 deixa 3. Todo múltiplo de 9 é de 3, mas não o contrário.',
          mostra: quadro(1236, 'O 12 se parte em um grupo de 9 e 3 cubos âmbar que sobram.'),
        },
        {
          texto: 'Sim: já é divisível por 3', erro: 'confunde-3-e-9',
          explica: 'O 6 é divisível por 3 e não por 9. Aqui também: a soma 12 não é múltiplo de 9.',
          mostra: quadro(1236, 'O 12 se parte em um grupo de 9 e 3 que sobram.'),
        },
      ],
      esboco: 'As duas regras parecem iguais. O contraexemplo do 6 desmonta a confusão em um segundo.',
    },
    {
      tipo: 'anote',
      titulo: 'Regras de divisibilidade',
      definicao: 'Por 2, 5 e 10, olhe o último algarismo. Por 3 e 9, some os algarismos e veja se a soma é divisível.',
      exemplo: { tex: '1{.}236 \\to 1 + 2 + 3 + 6 = 12 = 3 \\times 4', fala: 'mil duzentos e trinta e seis: um mais dois mais três mais seis é doze, que é três vezes quatro' },
      alerta: 'Para o 3, o final não decide: 27 termina em 7 e é divisível. E divisível por 3 nem sempre é por 9.',
      esboco: 'A página com as cinco regras numa tabela pequena e o desenho da barra 9 + 1.',
    },
    {
      tipo: 'passo',
      problema: 'O número **4.185** é divisível por 2? Por 5? Por 9?',
      fala: 'O número quatro mil cento e oitenta e cinco é divisível por dois? Por cinco? Por nove?',
      visual: quadro(4185, 'O 4.185 no quadro.'),
      passos: [
        {
          pergunta: 'Por 2?',
          fala: 'Por dois?',
          opcoes: [
            { texto: 'Não: termina em 5', certa: true, explica: 'Isso. Para o 2, o final tem de ser 0, 2, 4, 6 ou 8.', mostra: quadro(4185, 'A casa das unidades acende.', 'U') },
            { texto: 'Sim: o 4 e o 8 são pares', erro: 'regra-no-algarismo-errado', explica: 'O 4 e o 8 são placas e barras, que já se dividem por 2. Só o final decide: 5 é ímpar.', mostra: quadro(4185, 'A casa das unidades acende.', 'U') },
          ],
          linha: { tex: '4{.}185 \\text{ termina em 5: não é divisível por 2}', fala: 'quatro mil cento e oitenta e cinco termina em cinco: não é divisível por dois' },
        },
        {
          pergunta: 'Por 5?',
          fala: 'Por cinco?',
          opcoes: [
            { texto: 'Sim: termina em 5', certa: true, explica: 'Isso. Final 0 ou 5: divisível por 5.', mostra: quadro(4185, 'A casa das unidades acende.', 'U') },
            { texto: 'Não: é ímpar', explica: 'Ímpar só tira o 2. Para o 5, o final 5 basta: $4{.}185 \\div 5 = 837$.', mostra: quadro(4185, 'A casa das unidades acende.', 'U') },
          ],
          linha: { tex: '4{.}185 \\text{ termina em 5: é divisível por 5}', fala: 'termina em cinco: é divisível por cinco' },
        },
        {
          pergunta: 'Por 9?',
          fala: 'Por nove?',
          opcoes: [
            { texto: 'Sim: 4 + 1 + 8 + 5 = 18', certa: true, explica: 'Isso. 18 é múltiplo de 9, então 4.185 também é.', mostra: quadro(4185, 'As quatro casas acendem juntas.') },
            { texto: 'Não: termina em 5', erro: 'regra-no-algarismo-errado', explica: 'Para o 9, todos os algarismos contam: $4 + 1 + 8 + 5 = 18$, múltiplo de 9.', mostra: quadro(4185, 'As quatro casas acendem juntas.') },
          ],
          linha: { tex: '4 + 1 + 8 + 5 = 18 \\text{: é divisível por 9}', fala: 'quatro mais um mais oito mais cinco é dezoito: é divisível por nove' },
        },
      ],
      esboco: 'Três regras no mesmo número, cada uma olhando um lugar diferente: a casa das unidades, depois todas as casas.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: que algarismo no lugar do **?** deixa **3?5** divisível por 9?',
      fala: 'No papel: que algarismo no lugar da interrogação deixa três, interrogação, cinco divisível por nove?',
      resposta: 1,
      resolucao: [
        { tex: '3 + 5 = 8', fala: 'três mais cinco é oito' },
        { tex: '8 + 1 = 9', fala: 'oito mais um é nove' },
        { tex: '315 = 9 \\times 35', fala: 'trezentos e quinze é nove vezes trinta e cinco' },
      ],
      esboco: 'A regra usada ao contrário: completar a soma. O aluno digita o algarismo.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['divisibilidade-n1', 'divisibilidade-n2', 'divisibilidade-n3'],
      esboco: 'Nível 1: achar o divisível por 2, 5 ou 10 entre quatro números. Nível 2: por 3 ou por 9, com um número que termina em 3 ou 9 de isca. Nível 3: completar o algarismo que falta num lote ou numa conta.',
    },
    {
      tipo: 'fecho',
      texto: 'Dá: a soma 12 é divisível por 3. Cada amigo paga **R$ 412**. Na próxima aula: os números que só formam um retângulo.',
      fala: 'Dá: a soma doze é divisível por três. Cada amigo paga quatrocentos e doze reais. Na próxima aula: os números que só formam um retângulo.',
      visual: quadro(1236, 'O 1.236 se reparte em três pilhas iguais de 412.'),
      esboco: 'Responder ao gancho com o valor de cada um. O retângulo único anuncia os primos.',
    },
  ],
}
