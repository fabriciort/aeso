import type { Aula, Visual } from '@/lib/formation/schema'

// Por que não se divide por zero, pelos dois sentidos da divisão e pela
// prova real. Quantos pacotes de 0 cabem em 12? Os pacotes vazios nunca
// gastam as balas. Que número vezes 0 dá 12? Nenhum: tudo vezes 0 dá 0.
// E o contrário, 0 ÷ 5, existe e dá 0.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const livre = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado, esboco })
const CELULAR = [{ nome: 'Celular', teclas: '12 ÷ 0 =', visor: 'Erro' }]

export const aula: Aula = {
  id: 'B.U4.A5',
  titulo: 'Por que não se divide por zero',
  objetivo: 'Explicar, pela prova real e pelo sentido de "quantos cabem", por que a divisão por zero não existe, e distinguir isso de 0 dividido por um número, que dá 0.',
  modelo: 'retangulo',
  esboco: 'A calculadora do celular se recusa a fazer 12 ÷ 0. O aluno monta pacotes de 2 com 12 balas (6 pacotes) e vê o padrão: quanto menor o pacote, mais pacotes. Com pacotes de 0, eles nunca acabam com as balas. Depois a prova real fecha a questão: nenhum número vezes 0 dá 12. Momento-chave: a lista 0 × 0 = 0, 12 × 0 = 0, 100 × 0 = 0, em que nenhuma linha chega a 12.',
  vega: 'Ideia central: 12 ÷ 0 pergunta que número vezes 0 dá 12. Nenhum: todo número vezes 0 dá 0. Por isso a divisão por zero não existe (não é 0, nem 12, nem "infinito"). No sentido de quantos cabem: pacotes de 0 balas nunca gastam as 12. Já 0 ÷ 5 = 0: zero balas para 5 pessoas, cada uma recebe nada, e 5 × 0 = 0 confere. Se o aluno perguntar por 0 ÷ 0: também não se define, porque qualquer número vezes 0 dá 0, e a conta não teria uma resposta só; não puxe esse assunto. Erros esperados: achar que 12 ÷ 0 = 0, achar que 12 ÷ 0 = 12 (confundir com dividir por 1) e achar que 0 ÷ 5 não existe. Guie perguntando "Que número vezes 0 dá 12?", "E vezes 5, que número dá 0?". Em Sua vez, não diga a resposta: peça a prova real.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Digite **12 ÷ 0** na calculadora do celular: ela não dá um número. Por quê?',
      fala: 'Digite doze dividido por zero na calculadora do celular: ela não dá um número. Por quê?',
      visual: livre({ calculadoras: CELULAR }, 'O visor do celular com "Erro". Cada aparelho escreve de um jeito ("Erro", "Não é possível dividir por zero"), mas nenhum dá um número.'),
      esboco: 'Uma experiência que o aluno pode repetir no próprio celular agora mesmo.',
    },
    {
      tipo: 'mexa',
      texto: 'Quantos pacotes de **2** cabem em **12** balas? Monte um por vez.',
      fala: 'Quantos pacotes de dois cabem em doze balas? Monte um por vez.',
      visual: ret({ linhas: 0, colunas: 2, grupos: true, rotulos: true, adicionar: true, total: 12 }, 'Linhas de 2 quadradinhos, cada uma um pacote. Um contador mostra as balas que faltam: 12, 10, 8…'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para montar um pacote, até as balas acabarem.',
        sucesso: { linhas: 6 },
        mostre: 'Seis pacotes de 2 descem, um por vez, e as 12 balas acabam.',
      },
      descoberta: 'Com pacotes de 2 cabem 6. Com pacotes de 4 cabiam 3: quanto menor o pacote, mais pacotes.',
      esboco: 'Lembrar a aula 1 com um pacote menor, para o padrão aparecer.',
    },
    {
      tipo: 'ideia',
      texto: 'Pacotes de 4: **3**. De 2: **6**. De 1: **12**. Quanto menor o pacote, mais pacotes cabem.',
      fala: 'Pacotes de quatro: três. De dois: seis. De um: doze. Quanto menor o pacote, mais pacotes cabem.',
      visual: ret({ linhas: 12, colunas: 1, grupos: true, rotulos: true, total: 12 }, 'O retângulo se afina: 3 linhas de 4, depois 6 de 2, depois 12 de 1, cada vez mais comprido.'),
      esboco: 'O padrão que prepara a aposta: e se o pacote encolher até zero?',
    },
    {
      tipo: 'aposta',
      pergunta: 'E pacotes de **0** balas? Quantos você monta até as 12 acabarem?',
      fala: 'E pacotes de zero balas? Quantos você monta até as doze acabarem?',
      visual: ret({ linhas: 12, colunas: 1, grupos: true, rotulos: true, total: 12 }, 'As 12 linhas de 1, e uma linha vazia tracejada esperando.'),
      opcoes: [
        {
          texto: 'Nunca acabam: um pacote vazio não gasta bala', certa: true,
          explica: 'Isso. Você monta pacotes vazios para sempre e as 12 continuam lá. A pergunta não tem resposta.',
          mostra: ret({ linhas: 0, colunas: 0, total: 12 }, 'Pacotes vazios aparecem um atrás do outro, o contador sobe 1, 2, 3… e o 12 embaixo não diminui.'),
        },
        {
          texto: '0 pacotes', erro: 'dividir-por-zero-da-zero',
          explica: 'Com 0 pacotes, as 12 balas ficam todas na mesa. E com mais pacotes de 0, também. Não há resposta.',
          mostra: ret({ linhas: 0, colunas: 0, total: 12 }, 'Nenhum pacote, e as 12 balas paradas.'),
        },
        {
          texto: '12 pacotes', erro: 'dividir-por-zero-da-o-dividendo',
          explica: '12 pacotes de 0 levam 0 balas, não 12. Quem dá 12 pacotes é o pacote de 1.',
          mostra: ret({ linhas: 0, colunas: 0, total: 12 }, '12 pacotes vazios em fila; as 12 balas continuam todas fora.'),
        },
      ],
      esboco: 'O sentido de quantos cabem leva ao absurdo sem nenhuma regra.',
    },
    {
      tipo: 'ideia',
      texto: 'Pela prova real, $12 \\div 0$ seria um número que vezes **0** dá 12. Mas todo número vezes 0 dá **0**.',
      fala: 'Pela prova real, doze dividido por zero seria um número que vezes zero dá doze. Mas todo número vezes zero dá zero.',
      visual: livre({ expressao: ['0 × 0 = 0', '12 × 0 = 0', '100 × 0 = 0', '1.000 × 0 = 0'] }, 'As linhas descem uma a uma; todas terminam em 0, nenhuma em 12.'),
      esboco: 'O momento-chave: nenhum número serve. Não é que a resposta seja difícil; ela não existe.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E o contrário: $0 \\div 5$? São zero balas para 5 pessoas.',
      fala: 'E o contrário: zero dividido por cinco? São zero balas para cinco pessoas.',
      visual: ret({ linhas: 0, colunas: 5, rotulos: true, total: 0 }, 'Cinco colunas vazias, uma por pessoa, e o 0 embaixo.'),
      opcoes: [
        {
          texto: '0', certa: true,
          explica: 'Isso. Cada pessoa recebe nada. Prova real: $5 \\times 0 = 0$, confere.',
        },
        {
          texto: 'Não existe', erro: 'zero-dividido-nao-existe',
          explica: 'O proibido é dividir **por** zero. Dividir o zero entre 5 dá 0: $5 \\times 0 = 0$.',
        },
        {
          texto: '5',
          explica: '$5 \\times 5 = 25$, não 0. Sem balas, ninguém recebe nada: dá **0**.',
        },
      ],
      esboco: 'Separar as duas contas que parecem iguais: o zero na frente pode, o zero atrás não.',
    },
    {
      tipo: 'anote',
      titulo: 'Divisão por zero',
      definicao: 'Não existe divisão por zero: nenhum número vezes 0 volta ao dividendo. Já 0 dividido por um número dá 0.',
      exemplo: { tex: '0 \\div 5 = 0 \\text{, mas } 5 \\div 0 \\text{ não existe}', fala: 'zero dividido por cinco é zero, mas cinco dividido por zero não existe' },
      alerta: '$12 \\div 0$ não é 0 nem 12: não existe.',
      esboco: 'A página com as duas contas lado a lado e a prova real de cada uma.',
    },
    {
      tipo: 'passo',
      problema: 'Use a prova real em $0 \\div 9$ e em $9 \\div 0$.',
      fala: 'Use a prova real em zero dividido por nove e em nove dividido por zero.',
      visual: livre({ expressao: ['0 ÷ 9 = ?', '9 ÷ 0 = ?'] }, 'As duas contas, uma embaixo da outra, cada uma com um "?" em âmbar.'),
      passos: [
        {
          pergunta: '$0 \\div 9$: que número vezes 9 dá 0?',
          fala: 'Zero dividido por nove: que número vezes nove dá zero?',
          opcoes: [
            { texto: '0', certa: true, explica: 'Isso. $9 \\times 0 = 0$. Então $0 \\div 9 = 0$.' },
            { texto: 'Nenhum', erro: 'zero-dividido-nao-existe', explica: 'Tem um: $9 \\times 0 = 0$. Zero dividido por 9 dá 0.' },
            { texto: '9', explica: '$9 \\times 9 = 81$, não 0. O número é **0**.' },
          ],
          linha: { tex: '0 \\div 9 = 0', fala: 'zero dividido por nove é zero' },
        },
        {
          pergunta: '$9 \\div 0$: que número vezes 0 dá 9?',
          fala: 'Nove dividido por zero: que número vezes zero dá nove?',
          opcoes: [
            { texto: 'Nenhum', certa: true, explica: 'Isso. Todo número vezes 0 dá 0, nunca 9. $9 \\div 0$ não existe.' },
            { texto: '0', erro: 'dividir-por-zero-da-zero', explica: '$0 \\times 0 = 0$, não 9. Nenhum número serve.' },
            { texto: '9', erro: 'dividir-por-zero-da-o-dividendo', explica: '$9 \\times 0 = 0$, não 9. Quem deixa o 9 igual é dividir por 1.' },
          ],
          linha: { tex: '9 \\div 0 \\text{ não existe}', fala: 'nove dividido por zero não existe' },
        },
      ],
      esboco: 'As duas contas com a mesma ferramenta, a prova real. A diferença aparece sozinha.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, explique com a prova real por que $7 \\div 0$ não existe. Que número vezes 0 dá 7?',
      fala: 'No papel, explique com a prova real por que sete dividido por zero não existe. Que número vezes zero dá sete?',
      resposta: 'nenhum',
      resolucao: [
        { tex: '7 \\div 0 = \\, ? \\quad \\text{pede} \\quad ? \\times 0 = 7', fala: 'sete dividido por zero pede um número que vezes zero dá sete' },
        { tex: '0 \\times 0 = 0 \\qquad 7 \\times 0 = 0 \\qquad 100 \\times 0 = 0', fala: 'zero vezes zero é zero, sete vezes zero é zero, cem vezes zero é zero' },
        { tex: '\\text{Nenhum número vezes 0 dá 7: } 7 \\div 0 \\text{ não existe}', fala: 'nenhum número vezes zero dá sete: sete dividido por zero não existe' },
      ],
      esboco: 'Escrever o porquê com as próprias palavras. A resposta digitada é "nenhum".',
    },
    {
      tipo: 'sua-vez',
      geradores: ['zero-n1', 'zero-n2', 'zero-n3'],
      esboco: 'Nível 1: quanto é 0 dividido por um número. Nível 2: misturado, zero na frente ou atrás. Nível 3: achar, entre quatro contas, a que não existe ou a que dá 0.',
    },
    {
      tipo: 'fecho',
      texto: 'A calculadora não dá número porque **nenhum** número resolve $12 \\div 0$. Na próxima unidade: **expressões**, contas com várias operações.',
      fala: 'A calculadora não dá número porque nenhum número resolve doze dividido por zero. Na próxima unidade: expressões, contas com várias operações.',
      visual: livre({ calculadoras: CELULAR }, 'O visor do gancho volta, agora com a prova real escrita ao lado: ? × 0 = 12.'),
      esboco: 'Fechar a unidade de divisão e abrir a de expressões, que também usa a calculadora.',
    },
  ],
}
