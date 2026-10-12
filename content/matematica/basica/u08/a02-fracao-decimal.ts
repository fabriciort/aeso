import type { Aula, Visual } from '@/lib/formation/schema'

// Fração e decimal: dois jeitos de escrever o mesmo número. Uma fração vira
// decimal quando se escreve com 10 ou 100 embaixo (as equivalentes da
// unidade 7): 3/4 = 75/100 = 0,75. E um decimal se lê como fração: 0,6 são
// 6 décimos, 6/10. Os erros a desmontar: trocar a barra pela vírgula
// (3/4 = 3,4) e achar que 1/4 é 0,4.

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })

export const aula: Aula = {
  id: 'B.U8.A2',
  titulo: 'Fração ↔ decimal',
  objetivo: 'Escrever frações de denominador 2, 4, 5, 10, 20, 25, 50 e 100 como decimais, passando por décimos ou centésimos equivalentes, e ler um decimal como fração.',
  modelo: 'grade',
  esboco: 'A receita pede 3/4 kg e a balança só mostra decimais. O aluno aposta (a isca é 3,4), depois corta a grade em 4 quartos de 25 quadradinhos e pinta 3: o rótulo embaixo diz 0,75. Momento-chave: o rótulo virar 0,75 quando o terceiro quarto se completa, com a fração 3/4 ao lado. Depois, a metade: 5 colunas são 5/10 e também 50/100, então 0,5 = 0,50. Por fim, o caminho de volta: 0,6 são 6 décimos.',
  vega: 'Ideia central: fração e decimal são dois jeitos de escrever o mesmo número. Para ir da fração ao decimal, ache uma fração equivalente com 10 ou 100 embaixo (unidade 7: multiplicar os dois números pelo mesmo); depois leia os décimos ou centésimos. Para voltar, leia o decimal: 0,6 são 6 décimos, 6/10; 0,25 são 25 centésimos, 25/100 = 1/4. Erros esperados: trocar a barra pela vírgula (3/4 = 3,4 ou 0,34); escrever 1/4 como 0,4 (o número de baixo depois da vírgula); trocar décimos e centésimos (0,6 = 6/100); somar em vez de multiplicar para chegar a 10 (2/5 = 7/10). Guie com "Quanto falta para o de baixo virar 10 ou 100?", "Esse número é mais ou menos que 1 inteiro?", "Quantos quadradinhos tem cada quarto?". Frações como 1/3 não viram décimos nem centésimos exatos: ficam para a aula das dízimas.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A receita pede $\\frac{3}{4}$ kg de farinha. A balança do mercado só mostra decimais. Que número você procura nela?',
      fala: 'A receita pede três quartos de quilo de farinha. A balança do mercado só mostra decimais. Que número você procura nela?',
      visual: { modelo: 'barra', estado: { partes: 4, pintadas: 3 }, esboco: 'A barra de 3/4, da unidade 7, com a fração ao lado. Ao fundo, o visor de uma balança com "?,?? kg".' },
      esboco: 'Uma situação de mercado em que a fração e o decimal se encontram de verdade.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na balança, $\\frac{3}{4}$ kg aparece como…',
      fala: 'Na balança, três quartos de quilo aparece como…',
      visual: { modelo: 'barra', estado: { partes: 4, pintadas: 3 }, esboco: 'A barra de 3/4.' },
      opcoes: [
        {
          texto: '0,75 kg', certa: true,
          explica: 'Isso. Vamos ver por quê na grade.',
        },
        {
          texto: '3,4 kg', erro: 'fracao-vira-virgula',
          explica: '3,4 kg passa de 3 quilos. E $\\frac{3}{4}$ kg é menos de 1 quilo.',
          mostra: grade({ pintadas: 340 }, 'Três grades cheias e mais 4 colunas: 3,4 é muito mais que 3/4 de uma grade.'),
        },
        {
          texto: '0,34 kg', erro: 'fracao-vira-virgula',
          explica: '0,34 nem chega à metade da grade. $\\frac{3}{4}$ é quase o inteiro.',
          mostra: grade({ pintadas: 34 }, 'Uma grade com 34 quadradinhos: nem metade.'),
        },
      ],
      esboco: 'A isca é juntar os números em volta da vírgula. O tamanho na grade desmonta.',
    },
    {
      tipo: 'mexa',
      texto: 'A grade tem 100 quadradinhos. Cada quarto tem **25**. Pinte $\\frac{3}{4}$ da grade.',
      fala: 'A grade tem cem quadradinhos. Cada quarto tem vinte e cinco. Pinte três quartos da grade.',
      visual: grade({ pintadas: 0, pintar: true }, 'A grade vazia, com linhas mais grossas depois de 25, 50 e 75 quadradinhos (os quartos). O número embaixo acompanha o pintado.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte 3 quartos: 25 + 25 + 25 quadradinhos.',
        sucesso: { pintadas: 75 },
        mostre: 'Três quartos se pintam, um de cada vez: 0,25, 0,5 e 0,75.',
      },
      descoberta: '3 quartos de 100 quadradinhos são 75 quadradinhos: 75 centésimos, 0,75.',
      esboco: 'O momento-chave: o número embaixo chega a 0,75 quando o terceiro quarto se fecha. Proposta: marcar os quartos com linhas grossas (hoje a grade não tem essa chave).',
    },
    {
      tipo: 'ideia',
      texto: '$\\frac{3}{4} = \\frac{75}{100} = 0{,}75$. Com 100 embaixo, a fração se lê em centésimos.',
      fala: 'Três quartos é setenta e cinco centésimos, zero vírgula setenta e cinco. Com cem embaixo, a fração se lê em centésimos.',
      visual: grade({ pintadas: 75, separar: true }, 'A grade com 7 colunas âmbar e 5 quadradinhos verdes; embaixo, 0,75.'),
      esboco: 'A fração equivalente da unidade 7 faz a ponte: 3/4 = 75/100.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora $\\frac{1}{2}$. Pinte metade da grade, coluna por coluna.',
      fala: 'Agora um meio. Pinte metade da grade, coluna por coluna.',
      visual: grade({ pintadas: 0, pintar: true, porColuna: true, escala: true }, 'A grade vazia, com 0,1 … 1 embaixo das colunas. Cada toque pinta uma coluna.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas colunas até a metade.',
        sucesso: { pintadas: 50 },
        mostre: 'Cinco colunas se pintam: 5 de 10 colunas, 50 de 100 quadradinhos. Embaixo: 0,5.',
      },
      descoberta: 'Metade são 5 colunas de 10, ou 50 quadradinhos de 100: 1/2 = 5/10 = 50/100 = 0,5.',
      esboco: 'Por colunas, para o aluno ver os 5 décimos. A escala embaixo mostra o 0,5 no meio.',
    },
    {
      tipo: 'aposta',
      pergunta: '5 colunas são $\\frac{5}{10}$, ou 0,5. Também são 50 quadradinhos: 0,50. Qual dos dois é a metade?',
      fala: 'Cinco colunas são cinco décimos, ou zero vírgula cinco. Também são cinquenta quadradinhos: zero vírgula cinquenta. Qual dos dois é a metade?',
      visual: grade({ pintadas: 50, rotulo: '0,5 ou 0,50?' }, 'A grade com 5 colunas pintadas, e "0,5 ou 0,50?" embaixo.'),
      opcoes: [
        {
          texto: 'Os dois: são o mesmo número', certa: true,
          explica: 'Isso. O pintado é o mesmo. O zero no fim só conta os quadradinhos: 0,5 = 0,50.',
          mostra: grade({ grades: [{ pintadas: 50, rotulo: '0,5' }, { pintadas: 50, rotulo: '0,50' }] }, 'Duas grades iguais, lado a lado: 0,5 e 0,50.'),
        },
        {
          texto: 'Só 0,50: 50 é mais que 5', erro: 'decimal-mais-casas-maior',
          explica: '50 quadradinhos são as mesmas 5 colunas. O tamanho é o mesmo: 0,50 = 0,5.',
          mostra: grade({ grades: [{ pintadas: 50, rotulo: '0,5' }, { pintadas: 50, rotulo: '0,50' }] }, 'Duas grades iguais, lado a lado: 0,5 e 0,50.'),
        },
        {
          texto: 'Só 0,5',
          explica: 'O 0,5 é a metade, e o 0,50 também: as mesmas 5 colunas, contadas em quadradinhos.',
        },
      ],
      esboco: 'O zero no fim não muda o número. Prepara a próxima aula, de comparar.',
    },
    {
      tipo: 'anote',
      titulo: 'Fração e decimal',
      definicao: 'Para escrever uma fração como decimal, ache a equivalente com **10** ou **100** embaixo e leia os décimos ou centésimos.',
      exemplo: { tex: '\\frac{3}{4} = \\frac{75}{100} = 0{,}75 \\qquad \\frac{1}{2} = \\frac{5}{10} = 0{,}5', fala: 'três quartos é setenta e cinco centésimos, zero vírgula setenta e cinco; um meio é cinco décimos, zero vírgula cinco' },
      alerta: 'A barra não vira vírgula: $\\frac{3}{4}$ não é 3,4 nem 0,34. E $\\frac{1}{4}$ não é 0,4: é 0,25.',
      esboco: 'Na página: a grade com 3 quartos pintados e a cadeia 3/4 = 75/100 = 0,75.',
    },
    {
      tipo: 'passo',
      problema: 'Escreva $\\frac{2}{5}$ como decimal.',
      fala: 'Escreva dois quintos como decimal.',
      visual: grade({ pintadas: 0, linhas: 1, escala: true, semRotulo: true }, 'A tira de 10 décimos, vazia, com a escala 0,1 … 1.'),
      passos: [
        {
          pergunta: 'Para o 5 virar 10, o que fazer com os dois números?',
          fala: 'Para o cinco virar dez, o que fazer com os dois números?',
          opcoes: [
            { texto: 'Multiplicar os dois por 2', certa: true, explica: 'Isso. $5 \\times 2 = 10$ e $2 \\times 2 = 4$: cada quinto vira 2 décimos.' },
            { texto: 'Somar 5 nos dois', erro: 'equivalente-somando', explica: 'Somando, fica $\\frac{7}{10}$, mais que a metade. Mas $\\frac{2}{5}$ é menos. Multiplique os dois por 2.' },
          ],
          linha: { tex: '\\frac{2}{5} = \\frac{2 \\times 2}{5 \\times 2} = \\frac{4}{10}', fala: 'dois quintos é dois vezes dois sobre cinco vezes dois, quatro décimos' },
        },
        {
          pergunta: '$\\frac{4}{10}$ em decimal é…',
          fala: 'quatro décimos em decimal é…',
          opcoes: [
            { texto: '0,4', certa: true, explica: 'Isso. 4 décimos: 4 das 10 partes da tira.', mostra: grade({ pintadas: 4, linhas: 1, escala: true }, 'Quatro décimos da tira se pintam: 0,4.') },
            { texto: '0,04', erro: 'troca-decimo-centesimo', explica: '0,04 são 4 centésimos, bem menos. Aqui são 4 décimos: 0,4.', mostra: grade({ pintadas: 4, separar: true }, 'Na grade de 100, 4 quadradinhos: 0,04 é bem pouco.') },
            { texto: '2,5', erro: 'fracao-vira-virgula', explica: '2,5 passa de 2 inteiros. $\\frac{2}{5}$ é menos que 1: 0,4.' },
          ],
          linha: { tex: '\\frac{4}{10} = 0{,}4', fala: 'quatro décimos é zero vírgula quatro' },
        },
      ],
      esboco: 'Primeiro a equivalente (o passo da unidade 7), depois a leitura. A tira de décimos é a grade com uma linha só.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma corda tem **0,6 m**. Que fração do metro é isso?',
      fala: 'Uma corda tem zero vírgula seis metro. Que fração do metro é isso?',
      visual: grade({ pintadas: 6, linhas: 1, escala: true, semRotulo: true }, 'A tira de 10 décimos com 6 pintados: o metro em 10 partes.'),
      opcoes: [
        {
          texto: '$\\frac{6}{10}$ do metro', fala: 'seis décimos do metro', certa: true,
          explica: 'Isso. 0,6 são 6 décimos: 6 das 10 partes.',
          mostra: grade({ pintadas: 6, linhas: 1, escala: true, rotulo: '0,6 = 6/10' }, 'A tira com 6 décimos pintados e 0,6 = 6/10 embaixo.'),
        },
        {
          texto: '$\\frac{6}{100}$ do metro', fala: 'seis centésimos do metro', erro: 'troca-decimo-centesimo',
          explica: 'O 6 está na casa dos décimos, não na dos centésimos. São 6 de 10 partes.',
          mostra: grade({ grades: [{ pintadas: 60, rotulo: '6/10' }, { pintadas: 6, rotulo: '6/100' }] }, 'Duas grades: 6 colunas contra 6 quadradinhos.'),
        },
        {
          texto: '$\\frac{1}{6}$ do metro', fala: 'um sexto do metro', erro: 'denominador-como-decimal',
          explica: '$\\frac{1}{6}$ é menos que $\\frac{1}{5}$, que é 0,2. E 0,6 passa da metade.',
          mostra: grade({ pintadas: 6, linhas: 1, escala: true }, 'A tira com 6 décimos: passa da metade, longe de um sexto.'),
        },
      ],
      esboco: 'O caminho de volta: o decimal se lê como fração.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: o tanque está com $\\frac{1}{4}$ de gasolina. Escreva esse número como decimal.',
      fala: 'No papel: o tanque está com um quarto de gasolina. Escreva esse número como decimal.',
      resposta: '0,25',
      resolucao: [
        { tex: '4 \\times 25 = 100', fala: 'quatro vezes vinte e cinco, cem' },
        { tex: '\\frac{1}{4} = \\frac{1 \\times 25}{4 \\times 25} = \\frac{25}{100}', fala: 'um quarto é um vezes vinte e cinco sobre quatro vezes vinte e cinco, vinte e cinco centésimos' },
        { tex: '\\frac{25}{100} = 0{,}25', fala: 'vinte e cinco centésimos é zero vírgula vinte e cinco' },
      ],
      esboco: 'O ponteiro do tanque em 1/4. A isca 0,4 fica para o aluno estranhar sozinho.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fracao-decimal-n1', 'fracao-decimal-n2', 'fracao-decimal-n3'],
      esboco: 'Nível 1: décimos e centésimos (7/10, 35/100), com a grade. Nível 2: frações que precisam da equivalente (3/5, 1/4, 7/20). Nível 3: medidas, nos dois sentidos, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'Na balança, procure **0,75 kg**: $\\frac{3}{4} = \\frac{75}{100}$. Na próxima aula: qual decimal é maior?',
      fala: 'Na balança, procure zero vírgula setenta e cinco quilo: três quartos é setenta e cinco centésimos. Na próxima aula: qual decimal é maior?',
      visual: grade({ pintadas: 75, separar: true, rotulo: '3/4 = 0,75' }, 'A grade com 0,75 pintado e "3/4 = 0,75" embaixo.'),
      esboco: 'Responde ao gancho e abre a comparação.',
    },
  ],
}
