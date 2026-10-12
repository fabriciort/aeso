import type { Aula, Visual } from '@/lib/formation/schema'

// Somar com pedaços diferentes: metades e terços não se somam direto. Primeiro
// se cortam os pedaços até ficarem do mesmo tamanho (o MMC dos denominadores,
// da unidade 6), depois se somam os numeradores. O erro a desmontar:
// 1/2 + 1/3 = 2/5, que dá menos que 1/2 sozinho.

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const LEITE_AGUA = { barras: [{ partes: 2, pintadas: 1 }, { partes: 3, pintadas: 1 }] }

export const aula: Aula = {
  id: 'B.U7.A8',
  titulo: 'Somar com pedaços diferentes',
  objetivo: 'Somar frações de denominadores diferentes, deixando os pedaços do mesmo tamanho com o MMC, e mostrar por que 1/2 + 1/3 não é 2/5.',
  modelo: 'barra',
  esboco: 'Leite e água numa receita: 1/2 xícara e 1/3. O aluno aposta, e o 2/5 se desmonta por ser menos que 1/2. Depois ele corta as metades em 3 e os terços em 2: tudo vira sexto, e a soma aparece, 5/6. O MMC da unidade 6 volta com nome: é o menor pedaço comum. Momento-chave: as duas barras cortadas ficam com pedaços do mesmo tamanho e, aí sim, se somam.',
  vega: 'Ideia central: só se somam pedaços do mesmo tamanho. Com denominadores diferentes, primeiro se troca cada fração por uma equivalente com o mesmo denominador; o menor que serve é o MMC dos denominadores. Depois, somam-se os numeradores. Erros esperados: somar em cima e embaixo (1/2 + 1/3 = 2/5); trocar o denominador sem mudar o numerador (1/2 = 1/6); usar sempre o produto (24 para 4 e 6), que funciona, mas dá contas maiores. Guie com "Esses pedaços têm o mesmo tamanho?", "O resultado pode ser menor que uma das parcelas?", "Em quantas partes cortar para as duas caberem?". Ligue ao MMC dos ônibus.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma receita pede $\\frac{1}{2}$ xícara de leite e $\\frac{1}{3}$ de água, na mesma xícara. Quanto líquido dá? Cabe?',
      fala: 'Uma receita pede meia xícara de leite e um terço de água, na mesma xícara. Quanto líquido dá? Cabe?',
      visual: barra(LEITE_AGUA, 'Duas barras do mesmo tamanho: uma em metades com 1 pintada (leite), outra em terços com 1 pintado (água).'),
      esboco: 'A soma que todo mundo erra, numa situação em que o erro dá para ver.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto é $\\frac{1}{2} + \\frac{1}{3}$?',
      fala: 'Quanto é um meio mais um terço?',
      visual: barra(LEITE_AGUA, 'As duas parcelas, uma embaixo da outra.'),
      opcoes: [
        {
          texto: 'Ainda não dá para saber: os pedaços são diferentes', certa: true,
          explica: 'Isso. Metades e terços não se juntam direto. Primeiro, pedaços do mesmo tamanho.',
        },
        {
          texto: '$\\frac{2}{5}$', fala: 'dois quintos', erro: 'soma-numeradores-e-denominadores',
          explica: '$\\frac{2}{5}$ é menos que $\\frac{1}{2}$ sozinho. Pôr água no leite não pode dar menos líquido.',
          mostra: barra({ barras: [{ partes: 2, pintadas: 1 }, { partes: 5, pintadas: 2 }], guia: 0.5 }, 'Embaixo, 2/5; a linha da metade mostra que nem chega ao leite sozinho.'),
        },
        {
          texto: '$\\frac{2}{6}$', fala: 'dois sextos',
          explica: '$\\frac{2}{6}$ é menos que $\\frac{1}{2}$. Em sextos, a metade sozinha já são 3 pedaços.',
          mostra: barra({ barras: [{ partes: 2, pintadas: 1 }, { partes: 6, pintadas: 2 }], guia: 0.5 }, '2/6 embaixo de 1/2: não chega à linha da metade.'),
        },
      ],
      esboco: 'O 2/5 é a isca. A linha da metade desmonta: a soma tem de passar de 1/2.',
    },
    {
      tipo: 'mexa',
      texto: 'Vamos deixar os pedaços iguais. Corte cada **metade** em 3.',
      fala: 'Vamos deixar os pedaços iguais. Corte cada metade em três.',
      visual: barra({ ...LEITE_AGUA, partir: true, fator: 3, ativa: 0 }, 'A barra do leite recebe o toque: cada metade se corta em 3, e o pintado continua do mesmo tamanho.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na barra de cima.',
        sucesso: { partes: 6 },
        mostre: 'Cada metade se corta em 3: a barra de cima fica em sextos, com 3 pintados.',
      },
      descoberta: 'A metade vira 3 sextos: 1/2 = 3/6.',
      esboco: 'O leite não muda, só o corte. Proposta: um som de faca curto a cada corte.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora a água: corte cada **terço** em 2.',
      fala: 'Agora a água: corte cada terço em dois.',
      visual: barra({ barras: [{ partes: 6, pintadas: 3 }, { partes: 3, pintadas: 1 }], partir: true, fator: 2, ativa: 1 }, 'A barra de cima já em sextos. A de baixo recebe o toque: cada terço em 2.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na barra de baixo.',
        sucesso: { partes: 6 },
        mostre: 'Cada terço se corta ao meio: a barra de baixo fica em sextos, com 2 pintados.',
      },
      descoberta: 'O terço vira 2 sextos: 1/3 = 2/6. Agora as duas barras têm pedaços do mesmo tamanho.',
      esboco: 'As duas barras ficam com o mesmo corte: o momento-chave.',
    },
    {
      tipo: 'ideia',
      texto: 'Tudo em sextos: $\\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$. Cabe na xícara, e ainda sobra $\\frac{1}{6}$.',
      fala: 'Tudo em sextos: três sextos mais dois sextos é cinco sextos. Cabe na xícara, e ainda sobra um sexto.',
      visual: barra(
        { barras: [{ partes: 6, pintadas: 3 }, { partes: 6, pintadas: 2 }, { partes: 6, pintadas: 5 }], destaque: 2 },
        'Os 2 sextos de baixo sobem e se encaixam depois dos 3 de cima, numa terceira barra: 5 de 6.',
      ),
      esboco: 'Com pedaços iguais, a soma é a da aula anterior.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O 6 é múltiplo de 2 e de 3. Para $\\frac{1}{4} + \\frac{1}{6}$, qual denominador comum dá as contas menores?',
      fala: 'O seis é múltiplo de dois e de três. Para um quarto mais um sexto, qual denominador comum dá as contas menores?',
      visual: barra({ barras: [{ partes: 4, pintadas: 1 }, { partes: 6, pintadas: 1 }] }, 'Uma barra em quartos e outra em sextos, 1 pedaço pintado em cada.'),
      opcoes: [
        {
          texto: '12', certa: true,
          explica: 'Isso. 12 é o MMC de 4 e 6: o menor número em que quartos e sextos se encontram.',
          mostra: barra({ barras: [{ partes: 12, pintadas: 3 }, { partes: 12, pintadas: 2 }] }, 'As duas barras se cortam em doze avos: 3/12 e 2/12.'),
        },
        {
          texto: '24', erro: 'mmc-e-o-produto',
          explica: '$4 \\times 6 = 24$ também serve, mas antes vem o 12, o MMC. Contas menores.',
          mostra: barra({ barras: [{ partes: 12, pintadas: 3 }, { partes: 12, pintadas: 2 }] }, 'Em doze avos as duas já se encontram.'),
        },
        {
          texto: '10',
          explica: '10 não é múltiplo de 4: quartos não viram décimos. O menor que serve é 12.',
        },
      ],
      esboco: 'O MMC da unidade 6, agora com função: o menor pedaço comum.',
    },
    {
      tipo: 'anote',
      titulo: 'Somar com pedaços diferentes',
      definicao: 'Primeiro deixe os pedaços do mesmo tamanho: o denominador comum é o MMC dos denominadores. Depois, some os numeradores.',
      exemplo: { tex: '\\frac{1}{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}', fala: 'um meio mais um terço é três sextos mais dois sextos, que é cinco sextos' },
      alerta: 'Não some em cima e embaixo: $\\frac{1}{2} + \\frac{1}{3}$ não é $\\frac{2}{5}$, que é menos que $\\frac{1}{2}$.',
      esboco: 'As barras de leite e água, cortadas em sextos, e o 2/5 riscado.',
    },
    {
      tipo: 'passo',
      problema: 'Um bolo leva $\\frac{3}{4}$ de xícara de açúcar e $\\frac{1}{6}$ de cacau. Quanto pó, ao todo?',
      fala: 'Um bolo leva três quartos de xícara de açúcar e um sexto de cacau. Quanto pó, ao todo?',
      visual: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 6, pintadas: 1 }] }, 'Açúcar em quartos, cacau em sextos.'),
      passos: [
        {
          pergunta: 'Qual é o denominador comum?',
          opcoes: [
            { texto: '12', certa: true, explica: 'Isso. O MMC de 4 e 6 é 12.' },
            { texto: '24', erro: 'mmc-e-o-produto', explica: '24 serve, mas o 12 vem antes: é o MMC de 4 e 6.' },
            { texto: '10', explica: '$4 + 6 = 10$, mas 10 não é múltiplo de 4. O MMC é 12.' },
          ],
          linha: { tex: '\\text{mmc}(4, 6) = 12', fala: 'o mmc de quatro e seis é doze' },
        },
        {
          pergunta: '$\\frac{3}{4}$ em doze avos é…',
          fala: 'três quartos em doze avos é…',
          opcoes: [
            { texto: '$\\frac{9}{12}$', certa: true, explica: 'Isso. Cada quarto vira 3 pedaços: $3 \\times 3 = 9$.', mostra: barra({ barras: [{ partes: 12, pintadas: 9 }, { partes: 6, pintadas: 1 }] }, 'A barra do açúcar se corta: cada quarto em 3.') },
            { texto: '$\\frac{3}{12}$', erro: 'muda-so-um-termo', explica: 'O pedaço ficou 3 vezes menor: são precisos 3 vezes mais pedaços. São 9.', mostra: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 12, pintadas: 3 }] }, '3/12 embaixo de 3/4: bem menos açúcar.') },
          ],
          linha: { tex: '\\frac{3}{4} = \\frac{9}{12}', fala: 'três quartos é nove doze avos' },
        },
        {
          pergunta: 'E $\\frac{1}{6}$ em doze avos?',
          fala: 'E um sexto em doze avos?',
          opcoes: [
            { texto: '$\\frac{2}{12}$', certa: true, explica: 'Isso. Cada sexto vira 2 pedaços.' },
            { texto: '$\\frac{1}{12}$', erro: 'muda-so-um-termo', explica: 'Mudou só o de baixo. Cada sexto vira 2 doze avos.' },
          ],
          linha: { tex: '\\frac{1}{6} = \\frac{2}{12}', fala: 'um sexto é dois doze avos' },
        },
        {
          pergunta: 'Quanto pó ao todo?',
          opcoes: [
            { texto: '$\\frac{11}{12}$', certa: true, explica: 'Isso. 9 + 2 = 11 pedaços de doze avos: quase 1 xícara.', mostra: barra({ partes: 12, pintadas: 11 }, 'Os pedaços se juntam: falta só 1 para a xícara cheia.') },
            { texto: '$\\frac{11}{24}$', erro: 'soma-denominadores-iguais', explica: 'Os pedaços já são doze avos e continuam doze avos ao juntar: $\\frac{11}{12}$.' },
            { texto: '$\\frac{4}{10}$', erro: 'soma-numeradores-e-denominadores', explica: 'Somou em cima e embaixo. $\\frac{4}{10}$ é menos que o açúcar sozinho.' },
          ],
          linha: { tex: '\\frac{9}{12} + \\frac{2}{12} = \\frac{11}{12}', fala: 'nove doze avos mais dois doze avos é onze doze avos' },
        },
      ],
      esboco: 'O roteiro inteiro: denominador comum, converter cada uma, somar.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: $\\frac{1}{2} + \\frac{2}{5}$. Use décimos. Quantos décimos dá?',
      fala: 'No papel: um meio mais dois quintos. Use décimos. Quantos décimos dá?',
      resposta: 9,
      resolucao: [
        { tex: '\\text{mmc}(2, 5) = 10', fala: 'o mmc de dois e cinco é dez' },
        { tex: '\\frac{1}{2} = \\frac{5}{10} \\qquad \\frac{2}{5} = \\frac{4}{10}', fala: 'um meio é cinco décimos; dois quintos é quatro décimos' },
        { tex: '\\frac{5}{10} + \\frac{4}{10} = \\frac{9}{10}', fala: 'cinco décimos mais quatro décimos é nove décimos' },
      ],
      esboco: 'Décimos, que voltam na próxima unidade, de decimais.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['somar-diferentes-n1', 'somar-diferentes-n2', 'somar-diferentes-n3'],
      esboco: 'Nível 1: um denominador é múltiplo do outro (1/2 + 1/4), com as barras. Nível 2: o MMC é menor que o produto (1/4 + 1/6). Nível 3: receitas com quaisquer denominadores, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Leite e água: $\\frac{5}{6}$ de xícara. Cabe, e sobra $\\frac{1}{6}$. Na próxima aula: meia receita, ou multiplicar frações.',
      fala: 'Leite e água: cinco sextos de xícara. Cabe, e sobra um sexto. Na próxima aula: meia receita, ou multiplicar frações.',
      visual: barra({ partes: 6, pintadas: 5 }, 'A xícara com 5 sextos de líquido e 1 sexto vazio.'),
      esboco: 'Responde ao gancho e chama a missão da unidade, a receita.',
    },
  ],
}
