import type { Aula, Visual } from '@/lib/formation/schema'

// Por cento é por cem. A grade 10 × 10 da unidade 8 volta como a bateria
// cheia: 100 quadradinhos, cada um 1 %. Pintar 25 % são 25 quadradinhos,
// que são 0,25 (os centésimos da unidade 8) e um quarto (as frações da
// unidade 7). Uma coluna inteira é 10 %. Os erros a desmontar: ler 25 %
// como o número 25 (porcentagem-como-numero-inteiro), escrever 5 % como
// 0,5 (esquece-zero-decimal) e dividir por 10 no lugar de 100
// (troca-10-e-1-por-cento: 25 % como 2,5).

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })

export const aula: Aula = {
  id: 'B.U11.A1',
  titulo: 'Por cento é por cem',
  objetivo: 'Ler uma porcentagem como uma fração com denominador 100 e escrevê-la como decimal e como fração simples (25 % = 25/100 = 0,25 = 1/4), pintando-a na grade 10 × 10.',
  modelo: 'grade',
  esboco: 'A bateria do celular em 25 % é a grade 10 × 10: cada quadradinho é 1 %. O aluno pinta 25 quadradinhos e descobre que é um quarto da grade e o decimal 0,25. Momento-chave: o mesmo pintado ganha três nomes, 25 %, 1/4 e 0,25. Depois pinta 50 % coluna por coluna (cada coluna é 10 %) e vê que 50 % OFF é a metade. As iscas: 5 % não é 0,5, e 75 % não é 75/10.',
  vega: 'Ideia central: "por cento" quer dizer "de cada 100". Uma porcentagem é uma fração com denominador 100: 25 % = 25/100 = 0,25. Na grade 10 × 10, um quadradinho é 1 % e uma coluna, 10 %. 100 % é o inteiro todo. Erros esperados: ler 25 % como o número 25 (é 0,25, um pedaço de um inteiro); escrever 5 % como 0,5 (o zero dos décimos some: 0,5 é 50 %); dividir por 10 no lugar de 100 (25 % como 2,5 ou 75/10). Guie com "Quantos quadradinhos de 100?", "Quantas colunas cheias?", "Isso é mais ou menos que a grade inteira?". Ligue com o que o aluno já viu: os centésimos da unidade 8 (0,25 são 2 colunas e 5 quadradinhos) e as frações da unidade 7 (25/100 simplifica para 1/4).',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'O celular avisa: **25 % de bateria**. Que pedaço da carga ainda resta?',
      fala: 'O celular avisa: vinte e cinco por cento de bateria. Que pedaço da carga ainda resta?',
      visual: grade({ pintadas: 0, rotulo: '100 quadradinhos' }, 'A grade 10 × 10 vazia, grande, com "100 quadradinhos" embaixo: a bateria, ainda sem pintar.'),
      esboco: 'Todo mundo já viu esse aviso. A pergunta é o que o "por cento" quer dizer.',
    },
    {
      tipo: 'mexa',
      texto: 'A grade é a bateria cheia: **100 %**. Cada quadradinho é **1 %**, um de cem. Pinte **25 %**.',
      fala: 'A grade é a bateria cheia: cem por cento. Cada quadradinho é um por cento, um de cem. Pinte vinte e cinco por cento.',
      visual: grade({ pintadas: 0, pintar: true, leitura: { depois: ' %' } }, 'A grade vazia, com 0 % embaixo. Um toque pinta até aquele quadradinho, coluna por coluna, e a porcentagem embaixo anda junto.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no quadradinho até onde quer pintar.',
        sucesso: { pintadas: 25 },
        mostre: 'Duas colunas inteiras e mais 5 quadradinhos se pintam: 25 de 100.',
      },
      descoberta: '25 % são 25 quadradinhos de cada 100: duas colunas e meia.',
      esboco: 'O aluno conta até 25 pintando. A carga que resta fica à vista.',
    },
    {
      tipo: 'aposta',
      pergunta: 'São **25 de 100** quadradinhos. Que fração da bateria é essa?',
      fala: 'São vinte e cinco de cem quadradinhos. Que fração da bateria é essa?',
      visual: grade({ pintadas: 25, leitura: { depois: ' %' } }, 'A grade com 25 quadradinhos pintados e 25 % embaixo.'),
      opcoes: [
        {
          texto: '$\\frac{1}{4}$: um quarto', fala: 'Um quarto.', certa: true,
          explica: 'Isso. 25 cabe 4 vezes em 100: quatro pedaços assim enchem a bateria. $\\frac{25}{100} = \\frac{1}{4}$.',
          mostra: grade({ pintadas: 25, rotulo: '25/100 = 1/4' }, 'Embaixo da grade aparece 25/100 = 1/4.'),
        },
        {
          texto: '$\\frac{1}{2}$: a metade', fala: 'A metade.',
          explica: 'A metade seriam 50 quadradinhos, 5 colunas. Os 25 são a metade da metade: um quarto.',
          mostra: grade({ grades: [{ pintadas: 25, rotulo: '25 %' }, { pintadas: 50, rotulo: '50 %' }] }, 'Ao lado, uma grade com 5 colunas pintadas: 50 % é o dobro.'),
        },
        {
          texto: '$\\frac{1}{25}$', fala: 'Um vinte e cinco avos.',
          explica: '$\\frac{1}{25}$ seria 1 pedaço de 25, só 4 quadradinhos. Aqui são 25 de 100: $\\frac{25}{100}$, um quarto.',
          mostra: grade({ grades: [{ pintadas: 25, rotulo: '25/100' }, { pintadas: 4, rotulo: '1/25' }] }, 'Ao lado, uma grade com só 4 quadradinhos: 1/25 é bem menos.'),
        },
      ],
      esboco: 'Liga a porcentagem às frações da unidade 7: 25/100 simplifica para 1/4.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Se a grade inteira vale **1**, que número são esses 25 quadradinhos?',
      fala: 'Se a grade inteira vale um, que número são esses vinte e cinco quadradinhos?',
      visual: grade({ pintadas: 25, separar: true, leitura: { depois: ' %' } }, 'A grade com 2 colunas âmbar e 5 quadradinhos verdes, com 25 % embaixo.'),
      opcoes: [
        {
          texto: '0,25', fala: 'Zero vírgula vinte e cinco.', certa: true,
          explica: 'Isso. 2 décimos e 5 centésimos: 0,25. Então 25 % = 0,25.',
          mostra: grade({ pintadas: 25, separar: true, rotulo: '25 % = 0,25' }, 'Embaixo aparece 25 % = 0,25.'),
        },
        {
          texto: '25', fala: 'Vinte e cinco.', erro: 'porcentagem-como-numero-inteiro',
          explica: '25 seriam 25 grades cheias. 25 % é um pedaço de uma grade só: 0,25.',
        },
        {
          texto: '2,5', fala: 'Dois vírgula cinco.', erro: 'troca-10-e-1-por-cento',
          explica: '2,5 são 2 grades e meia. Os 25 quadradinhos não enchem nem uma: 0,25.',
          mostra: grade({ pintadas: 250, rotulo: '2,5' }, 'Duas grades cheias e meia, com 2,5 embaixo: muito mais que os 25 quadradinhos.'),
        },
      ],
      esboco: 'O momento-chave: o mesmo pintado tem três nomes, 25 %, 1/4 e 0,25. A grade é a da unidade 8.',
    },
    {
      tipo: 'anote',
      titulo: 'Porcentagem',
      definicao: '**Por cento** quer dizer **de cada 100**. 25 % são 25 partes de 100: a fração $\\frac{25}{100}$, ou o decimal 0,25.',
      exemplo: { tex: '25\\,\\% = \\frac{25}{100} = 0{,}25 = \\frac{1}{4}', fala: 'vinte e cinco por cento é vinte e cinco centésimos, zero vírgula vinte e cinco, um quarto' },
      alerta: '25 % não é o número 25: é **0,25**, um pedaço de um inteiro. E **100 %** é o inteiro todo.',
      esboco: 'Na página: a grade com 25 quadradinhos pintados e embaixo os três nomes, 25 %, 25/100 = 1/4 e 0,25.',
    },
    {
      tipo: 'mexa',
      texto: 'Uma coluna tem 10 quadradinhos: **10 %**. A loja anuncia **50 % OFF**. Pinte 50 %, coluna por coluna.',
      fala: 'Uma coluna tem dez quadradinhos: dez por cento. A loja anuncia cinquenta por cento de desconto. Pinte cinquenta por cento, coluna por coluna.',
      visual: grade({ pintadas: 0, pintar: true, porColuna: true, leitura: { depois: ' %' } }, 'A grade vazia, com 0 % embaixo. Cada toque pinta uma coluna inteira: 10 % de cada vez, e a porcentagem embaixo anda junto.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas colunas até pintar 50 %.',
        sucesso: { pintadas: 50 },
        mostre: 'Cinco colunas se pintam, uma de cada vez: 10 %, 20 %, 30 %, 40 %, 50 %.',
      },
      descoberta: '50 % são 5 colunas de 10 %: a metade da grade.',
      esboco: 'A coluna de 10 % prepara a próxima aula (10 % de um preço é dividir por 10).',
    },
    {
      tipo: 'aposta',
      pergunta: 'Com **50 % OFF**, quanto do preço sai?',
      fala: 'Com cinquenta por cento de desconto, quanto do preço sai?',
      visual: grade({ pintadas: 50, leitura: { depois: ' %' } }, 'A grade com 5 colunas pintadas e 50 % embaixo.'),
      opcoes: [
        {
          texto: 'A metade do preço', certa: true,
          explica: 'Isso. 50 de cada 100: $\\frac{50}{100} = \\frac{1}{2}$. O preço cai pela metade.',
          mostra: grade({ pintadas: 50, rotulo: '50 % = 1/2' }, 'Embaixo aparece 50 % = 1/2.'),
        },
        {
          texto: 'R$ 50', erro: 'porcentagem-como-numero-inteiro', fala: 'Cinquenta reais.',
          explica: '50 % não fala em reais. Fala em 50 de cada 100: numa TV de R$ 3.000, saem R$ 1.500.',
          mostra: grade({ pintadas: 50, rotulo: '50 % = 1/2' }, 'A grade com a metade pintada: 50 % é a metade de qualquer preço.'),
        },
      ],
      esboco: 'A porcentagem é um pedaço do preço, não uma quantia fixa. A TV de R$ 3.000 desmonta o "R$ 50".',
    },
    {
      tipo: 'aposta',
      pergunta: 'E **5 %**? Quantos quadradinhos da grade?',
      fala: 'E cinco por cento? Quantos quadradinhos da grade?',
      visual: grade({ pintadas: 0, rotulo: '5 %' }, 'A grade vazia, com 5 % embaixo.'),
      opcoes: [
        {
          texto: '5 quadradinhos: 0,05', fala: 'Cinco quadradinhos: zero vírgula zero cinco.', certa: true,
          explica: 'Isso. 5 de 100, meia coluna: 0,05. O zero guarda a casa dos décimos.',
          mostra: grade({ pintadas: 5, separar: true, rotulo: '5 % = 0,05' }, 'Cinco quadradinhos verdes numa coluna incompleta; embaixo, 5 % = 0,05.'),
        },
        {
          texto: '50 quadradinhos: 0,5', fala: 'Cinquenta quadradinhos: zero vírgula cinco.', erro: 'esquece-zero-decimal',
          explica: '0,5 são 5 colunas: 50 %. 5 % é dez vezes menos, só 5 quadradinhos.',
          mostra: grade({ grades: [{ pintadas: 5, rotulo: '5 %' }, { pintadas: 50, rotulo: '50 %' }] }, 'Lado a lado: 5 quadradinhos e 5 colunas. A segunda é dez vezes a primeira.'),
        },
      ],
      esboco: 'O erro da unidade 8 (5 centavos não é 0,5) volta com a porcentagem.',
    },
    {
      tipo: 'passo',
      problema: 'O estacionamento está **75 %** ocupado. Escreva como fração e como decimal.',
      fala: 'O estacionamento está setenta e cinco por cento ocupado. Escreva como fração e como decimal.',
      visual: grade({ pintadas: 75, separar: true, rotulo: '75 %' }, 'A grade com 7 colunas âmbar e 5 quadradinhos verdes: 75 vagas de 100.'),
      passos: [
        {
          pergunta: 'Por cento é de cada 100. Que fração é?',
          opcoes: [
            { texto: '$\\frac{75}{100}$', fala: 'setenta e cinco centésimos', certa: true, explica: 'Isso. 75 vagas de cada 100.', mostra: grade({ pintadas: 75, separar: true, rotulo: '75 % = 75/100' }, 'Embaixo da grade aparece 75 % = 75/100.') },
            { texto: '$\\frac{75}{10}$', fala: 'setenta e cinco décimos', erro: 'troca-10-e-1-por-cento', explica: '$\\frac{75}{10}$ passa de 7 inteiros. Por cento é de cada 100: $\\frac{75}{100}$.' },
          ],
          linha: { tex: '75\\,\\% = \\frac{75}{100}', fala: 'setenta e cinco por cento são setenta e cinco centésimos' },
        },
        {
          pergunta: 'E como decimal?',
          opcoes: [
            { texto: '0,75', fala: 'zero vírgula setenta e cinco', certa: true, explica: 'Isso. 7 colunas e 5 quadradinhos: 0,75.', mostra: grade({ pintadas: 75, separar: true, rotulo: '75/100 = 0,75' }, 'Embaixo da grade aparece 75/100 = 0,75.') },
            { texto: '75', fala: 'setenta e cinco', erro: 'porcentagem-como-numero-inteiro', explica: '75 seriam 75 estacionamentos cheios. É um pedaço de um só: 0,75.' },
          ],
          linha: { tex: '\\frac{75}{100} = 0{,}75', fala: 'setenta e cinco centésimos são zero vírgula setenta e cinco' },
        },
        {
          pergunta: 'Simplifique a fração: divida em cima e embaixo por 25.',
          opcoes: [
            { texto: '$\\frac{3}{4}$', fala: 'três quartos', certa: true, explica: 'Isso. $75 \\div 25 = 3$ e $100 \\div 25 = 4$: 3 de cada 4 vagas.', mostra: grade({ pintadas: 75, separar: true, rotulo: '75/100 = 3/4' }, 'Embaixo da grade aparece 75/100 = 3/4.') },
            { texto: '$\\frac{3}{100}$', fala: 'três centésimos', erro: 'muda-so-um-termo', explica: 'Dividiu só em cima. Embaixo também: $100 \\div 25 = 4$. Fica $\\frac{3}{4}$.' },
          ],
          linha: { tex: '\\frac{75}{100} = \\frac{3}{4}', fala: 'setenta e cinco centésimos são três quartos' },
        },
      ],
      esboco: 'Os três nomes de novo, agora escritos pelo aluno, um passo de cada vez.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: a etiqueta diz **8 % de desconto**. Escreva 8 % como número decimal.',
      fala: 'No papel: a etiqueta diz oito por cento de desconto. Escreva oito por cento como número decimal.',
      resposta: '0,08',
      resolucao: [
        { tex: '8\\,\\% = \\frac{8}{100}', fala: 'oito por cento são oito centésimos' },
        { tex: '\\frac{8}{100} = 0{,}08', fala: 'oito centésimos: zero vírgula zero oito, com o zero dos décimos' },
      ],
      esboco: 'O caso que pega: um algarismo só. Na grade, 8 quadradinhos e nenhuma coluna cheia.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['por-cento-n1', 'por-cento-n2', 'por-cento-n3'],
      esboco: 'Nível 1: ler a porcentagem pintada na grade. Nível 2: de porcentagem para decimal e de volta, com os zeros que pegam. Nível 3: "3 em cada 4" em porcentagem, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'Restam **25 %**: 25 de cada 100, **um quarto** da bateria. Na próxima aula: quanto é 10 % de um preço.',
      fala: 'Restam vinte e cinco por cento: vinte e cinco de cada cem, um quarto da bateria. Na próxima aula: quanto é dez por cento de um preço.',
      visual: grade({ pintadas: 25, rotulo: '25 % = 1/4' }, 'A grade do gancho, agora com 25 quadradinhos pintados e 25 % = 1/4 embaixo.'),
      esboco: 'Responde ao gancho com a grade pintada.',
    },
  ],
}
