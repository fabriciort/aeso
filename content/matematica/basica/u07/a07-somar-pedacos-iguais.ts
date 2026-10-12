import type { Aula, Visual } from '@/lib/formation/schema'

// Somar com pedaços iguais: o denominador é o tamanho do pedaço e não muda
// ao juntar; somam-se (ou subtraem-se) só os numeradores. O erro a
// desmontar: 2/5 + 1/5 = 3/10, que dá menos do que já havia.

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })

export const aula: Aula = {
  id: 'B.U7.A7',
  titulo: 'Somar com pedaços iguais',
  objetivo: 'Somar e subtrair frações de mesmo denominador, inclusive quando a soma passa de 1 inteiro, e explicar por que o denominador não muda.',
  modelo: 'barra',
  esboco: 'Uma receita pede 2/5 de xícara de leite e mais 1/5. Na barra de quintos, o aluno pinta mais um pedaço: são 3 quintos, e o pedaço continua quinto. A conta vem depois, e o 3/10 se desmonta porque é menos que os 2/5 que já havia. Depois, a subtração (o que sobrou) e uma soma que passa de 1 inteiro. Momento-chave: ver que juntar pedaços não muda o tamanho de cada pedaço.',
  vega: 'Ideia central: com o mesmo denominador, os pedaços são do mesmo tamanho; somar ou subtrair é contar pedaços, e o denominador, que é o tamanho do pedaço, fica. Erros esperados: somar os denominadores (2/5 + 1/5 = 3/10); somar quando a pergunta é o que sobrou; achar que a soma não pode passar de 1. Guie com "De que tamanho é cada pedaço?", "Juntar deixa os pedaços menores?", "O resultado pode ser menor que o que você já tinha?". Use sempre a barra: pintar mais pedaços na mesma barra.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma receita pede $\\frac{2}{5}$ de xícara de leite e, depois, mais $\\frac{1}{5}$. Quanto leite vai ao todo?',
      fala: 'Uma receita pede dois quintos de xícara de leite e, depois, mais um quinto. Quanto leite vai ao todo?',
      visual: barra({ partes: 5, pintadas: 2 }, 'A xícara como uma barra em quintos, com 2 pintados de leite.'),
      esboco: 'Uma receita de verdade: a primeira soma de frações sai da cozinha.',
    },
    {
      tipo: 'mexa',
      texto: 'A barra já tem $\\frac{2}{5}$. Junte mais $\\frac{1}{5}$ de leite.',
      fala: 'A barra já tem dois quintos. Junte mais um quinto de leite.',
      visual: barra({ partes: 5, pintadas: 2, pintar: true }, 'A barra em quintos com 2 pintados. O aluno toca o próximo pedaço.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte mais 1 pedaço.',
        sucesso: { pintadas: 3 },
        mostre: 'O terceiro quinto se pinta: a barra fica com 3 de 5 pedaços.',
      },
      descoberta: 'Juntar 1 quinto a 2 quintos dá 3 quintos. Os pedaços continuam do mesmo tamanho.',
      esboco: 'A soma feita com a mão, antes da conta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Na conta, $\\frac{2}{5} + \\frac{1}{5}$ dá…',
      fala: 'Na conta, dois quintos mais um quinto dá…',
      visual: barra({ partes: 5, pintadas: 3 }, 'A barra com os 3 quintos pintados.'),
      opcoes: [
        {
          texto: '$\\frac{3}{5}$', fala: 'três quintos', certa: true,
          explica: 'Isso. 2 pedaços e mais 1: 3 pedaços. E cada pedaço continua sendo um quinto.',
        },
        {
          texto: '$\\frac{3}{10}$', fala: 'três décimos', erro: 'soma-denominadores-iguais',
          explica: '$\\frac{3}{10}$ é menos que os $\\frac{2}{5}$ que já havia. Juntar leite não encolhe os pedaços.',
          mostra: barra({ barras: [{ partes: 5, pintadas: 3 }, { partes: 10, pintadas: 3 }] }, 'Embaixo, 3/10: bem menos pintado que os 3/5 de cima.'),
        },
      ],
      esboco: 'O 3/10 é o erro mais comum. A barra de décimos, curta, desmonta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Havia $\\frac{7}{8}$ de um tablete de manteiga. A receita usou $\\frac{3}{8}$. Quanto sobrou?',
      fala: 'Havia sete oitavos de um tablete de manteiga. A receita usou três oitavos. Quanto sobrou?',
      visual: barra({ partes: 8, pintadas: 7 }, 'O tablete em oitavos, com 7 pintados.'),
      opcoes: [
        {
          texto: '$\\frac{4}{8}$', fala: 'quatro oitavos', certa: true,
          explica: 'Isso. 7 oitavos menos 3 oitavos: 4 oitavos, a metade do tablete.',
          mostra: barra({ partes: 8, pintadas: 4, guia: 0.5 }, 'Três pedaços se apagam; sobram 4, até a linha da metade.'),
        },
        {
          texto: '$\\frac{10}{8}$', fala: 'dez oitavos',
          explica: 'Usar tira, não junta. Sobra menos do que havia: 4 oitavos.',
          mostra: barra({ partes: 8, pintadas: 4 }, 'Os 3 pedaços usados se apagam.'),
        },
        {
          texto: '$\\frac{3}{8}$', fala: 'três oitavos',
          explica: 'Esse é o que a receita usou. Sobrou o resto: 4 oitavos.',
          mostra: barra({ partes: 8, pintadas: 4 }, 'Os 3 usados se apagam; os 4 que ficam acendem.'),
        },
      ],
      esboco: 'Subtrair é o mesmo raciocínio: os pedaços continuam oitavos.',
    },
    {
      tipo: 'anote',
      titulo: 'Somar com pedaços iguais',
      definicao: 'Com o mesmo denominador, some ou subtraia os numeradores. O denominador fica: ele é o tamanho do pedaço.',
      exemplo: { tex: '\\frac{2}{5} + \\frac{1}{5} = \\frac{3}{5} \\qquad \\frac{7}{8} - \\frac{3}{8} = \\frac{4}{8}', fala: 'dois quintos mais um quinto é três quintos; sete oitavos menos três oitavos é quatro oitavos' },
      alerta: 'O denominador não se soma: $\\frac{2}{5} + \\frac{1}{5}$ não é $\\frac{3}{10}$.',
      esboco: 'A barra de quintos, com 2 pedaços e mais 1, e o 3/10 riscado.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E $\\frac{3}{4} + \\frac{2}{4}$? Passa de 1 xícara?',
      fala: 'E três quartos mais dois quartos? Passa de uma xícara?',
      visual: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 4, pintadas: 2 }] }, 'Duas barras em quartos: 3 pintados em cima, 2 embaixo.'),
      opcoes: [
        {
          texto: 'Passa: $\\frac{5}{4}$, 1 xícara e mais $\\frac{1}{4}$', certa: true,
          explica: 'Isso. 5 quartos: 4 enchem 1 xícara e sobra 1 quarto.',
          mostra: barra({ partes: 4, pintadas: 5, inteiros: 2 }, 'Os pedaços se juntam numa barra de 2 inteiros: o primeiro cheio, mais 1 quarto no segundo.'),
        },
        {
          texto: 'Não passa: $\\frac{5}{8}$', erro: 'soma-denominadores-iguais',
          explica: '$\\frac{5}{8}$ é menos que os $\\frac{3}{4}$ do começo. Somar não pode dar menos. São 5 quartos.',
          mostra: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 8, pintadas: 5 }] }, '5/8 embaixo de 3/4: menos pintado que a primeira parcela.'),
        },
      ],
      esboco: 'Uma fração pode passar de 1. O 5/8 cai sozinho: dá menos que uma das parcelas.',
    },
    {
      tipo: 'passo',
      problema: 'Um bolo leva $\\frac{3}{8}$ de xícara de açúcar na massa e $\\frac{2}{8}$ na cobertura. Quanto açúcar? Quanto falta para 1 xícara?',
      fala: 'Um bolo leva três oitavos de xícara de açúcar na massa e dois oitavos na cobertura. Quanto açúcar? Quanto falta para uma xícara?',
      visual: barra({ barras: [{ partes: 8, pintadas: 3 }, { partes: 8, pintadas: 2 }] }, 'As duas parcelas em barras de oitavos.'),
      passos: [
        {
          pergunta: 'Os pedaços são do mesmo tamanho?',
          opcoes: [
            { texto: 'Sim: os dois são oitavos', certa: true, explica: 'Isso. O denominador é 8 nos dois: dá para somar direto.' },
            { texto: 'Não: 3 e 2 são diferentes', explica: '3 e 2 contam os pedaços. O tamanho é o denominador, e ele é 8 nos dois.' },
          ],
          linha: { tex: '\\frac{3}{8} + \\frac{2}{8}', fala: 'três oitavos mais dois oitavos' },
        },
        {
          pergunta: 'Quanto açúcar ao todo?',
          opcoes: [
            { texto: '$\\frac{5}{8}$', fala: 'cinco oitavos', certa: true, explica: 'Isso. 3 + 2 = 5 pedaços de um oitavo.', mostra: barra({ partes: 8, pintadas: 5 }, 'Os pedaços de baixo sobem e enchem 5 de 8.') },
            { texto: '$\\frac{5}{16}$', fala: 'cinco dezesseis avos', erro: 'soma-denominadores-iguais', explica: 'Juntar não deixa os pedaços menores: continuam oitavos. São 5 oitavos.', mostra: barra({ barras: [{ partes: 8, pintadas: 5 }, { partes: 16, pintadas: 5 }] }, '5/16 embaixo de 5/8: metade do tamanho.') },
          ],
          linha: { tex: '\\frac{3}{8} + \\frac{2}{8} = \\frac{5}{8}', fala: 'três oitavos mais dois oitavos é cinco oitavos' },
        },
        {
          pergunta: '1 xícara são $\\frac{8}{8}$. Quanto falta para encher?',
          fala: 'Uma xícara são oito oitavos. Quanto falta para encher?',
          opcoes: [
            { texto: '$\\frac{3}{8}$', fala: 'três oitavos', certa: true, explica: 'Isso. 8 − 5 = 3 pedaços vazios.', mostra: barra({ partes: 8, pintadas: 5, rotulos: true }, 'Os 3 pedaços vazios piscam.') },
            { texto: '$\\frac{5}{8}$', fala: 'cinco oitavos', explica: 'Esse é o açúcar que já está na xícara. Faltam os pedaços vazios: 3.' },
          ],
          linha: { tex: '\\frac{8}{8} - \\frac{5}{8} = \\frac{3}{8}', fala: 'oito oitavos menos cinco oitavos é três oitavos' },
        },
      ],
      esboco: 'Somar e subtrair na mesma receita, conferindo o tamanho do pedaço primeiro.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: $\\frac{5}{6} - \\frac{2}{6} + \\frac{4}{6}$. Quantos sextos dá?',
      fala: 'No papel: cinco sextos menos dois sextos mais quatro sextos. Quantos sextos dá?',
      resposta: 7,
      resolucao: [
        { tex: '\\frac{5}{6} - \\frac{2}{6} = \\frac{3}{6}', fala: 'cinco sextos menos dois sextos é três sextos' },
        { tex: '\\frac{3}{6} + \\frac{4}{6} = \\frac{7}{6}', fala: 'três sextos mais quatro sextos é sete sextos' },
        { tex: '\\frac{7}{6} = 1 \\text{ inteiro e } \\frac{1}{6}', fala: 'sete sextos é um inteiro e um sexto' },
      ],
      esboco: 'Da esquerda para a direita, como na unidade 5, e passando de 1.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['somar-iguais-n1', 'somar-iguais-n2', 'somar-iguais-n3'],
      esboco: 'Nível 1: somas até 1, com as barras. Nível 2: somas que passam de 1. Nível 3: receitas que juntam ou tiram, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Vão $\\frac{3}{5}$ de xícara de leite. Na próxima aula: e se os pedaços forem de tamanhos diferentes, como $\\frac{1}{2} + \\frac{1}{3}$?',
      fala: 'Vão três quintos de xícara de leite. Na próxima aula: e se os pedaços forem de tamanhos diferentes, como um meio mais um terço?',
      visual: barra({ partes: 5, pintadas: 3 }, 'A xícara com 3 quintos de leite.'),
      esboco: 'Responde ao gancho e deixa no ar a soma de metade com terço.',
    },
  ],
}
