import type { Aula, Visual } from '@/lib/formation/schema'

// A tabuada sem decoreba. O retângulo mostra três atalhos: girar não muda o
// total (comutativa), dobrar as linhas dobra o total (dobro) e um fato novo
// sai de um vizinho que você sabe (6 × 7 = 5 × 7 + 7; 9 × 8 = 10 × 8 − 8).
// A partir desta aula entra o treino curto e espaçado da tabuada.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const R6x7 = { linhas: 6, colunas: 7, rotulos: true }

export const aula: Aula = {
  id: 'B.U3.A2',
  titulo: 'A tabuada com estratégia',
  objetivo: 'Achar qualquer fato da tabuada até 10 × 10 a partir de poucos fatos conhecidos: trocando a ordem (comutativa), dobrando e somando ou tirando uma linha de um fato vizinho.',
  modelo: 'retangulo',
  esboco: 'O retângulo vira uma ferramenta de lembrar. Primeiro ele gira: 3 × 8 deitado vira 8 × 3 em pé, os mesmos quadradinhos. Depois ele se parte: 4 linhas são duas vezes 2 linhas; 6 linhas são 5 linhas e mais uma. O aluno nunca fica sem saída: sempre há um fato vizinho. Momento-chave: o retângulo de 6 × 7 com 5 linhas acesas (35) e a sexta linha piscando, esperando o "+ 7".',
  vega: 'Ideia central: a tabuada tem poucos fatos para decorar, porque um fato sai de outro. A ordem não muda o resultado (3 × 8 = 8 × 3: o retângulo girado). Dobrar as linhas dobra o total (4 × 7 é o dobro de 2 × 7). Um fato novo sai de um vizinho: 6 × 7 = 5 × 7 + 7, 9 × 8 = 10 × 8 − 8. Erros esperados: parar no fato vizinho (6 × 7 → 35), somar o número de linhas em vez do tamanho da linha (5 × 7 + 6 = 41), somar os fatores (6 + 7 = 13). Guie perguntando "Que fato perto deste você sabe?", "Quantas linhas faltam? Quanto vale cada linha?". Os fatos âncora são 2×, 5× e 10×. A partir desta aula, a tabuada volta em treinos curtos e espaçados. Em Sua vez, não diga o resultado: peça um fato vizinho.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma prateleira do mercado tem **6 fileiras** de **7** latas. Você não lembra quanto é $6 \\times 7$. E agora?',
      fala: 'Uma prateleira do mercado tem seis fileiras de sete latas. Você não lembra quanto é seis vezes sete. E agora?',
      visual: ret(R6x7, 'O retângulo de 6 linhas e 7 colunas, como latas empilhadas, com o 6 e o 7 nos lados e um "?" embaixo.'),
      esboco: 'Esquecer a tabuada é comum e dá vergonha. A aula mostra que não é preciso lembrar: dá para chegar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual dá mais: $3 \\times 8$ ou $8 \\times 3$?',
      fala: 'Qual dá mais: três vezes oito ou oito vezes três?',
      visual: ret({ linhas: 3, colunas: 8, rotulos: true }, 'Um retângulo deitado, de 3 linhas e 8 colunas.'),
      opcoes: [
        { texto: 'Dão o mesmo', certa: true, explica: 'Isso. São os mesmos quadradinhos, deitados ou em pé. Gire e confira.' },
        { texto: '$8 \\times 3$', explica: '8 linhas parecem mais, mas cada uma tem só 3. Gire o retângulo e veja.' },
        { texto: '$3 \\times 8$', explica: 'Cada linha tem mais, mas são só 3 linhas. Gire o retângulo e veja.' },
      ],
      esboco: 'Uma previsão rápida. A confirmação vem com o dedo, no cartão seguinte.',
    },
    {
      tipo: 'mexa',
      texto: 'Este é $3 \\times 8$. Gire o retângulo.',
      fala: 'Este é três vezes oito. Gire o retângulo.',
      visual: ret({ linhas: 3, colunas: 8, rotulos: true, total: 24 }, 'O retângulo deitado, 3 por 8, com o total 24 embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no retângulo para girar.',
        sucesso: { girado: true },
        mostre: 'O retângulo gira 90°: agora são 8 linhas de 3. Os rótulos trocam de lado e o total continua 24.',
      },
      descoberta: 'Girar troca linhas por colunas, mas não tira nem põe quadradinhos: 3 × 8 = 8 × 3 = 24.',
      esboco: 'O giro é o porquê da comutativa. O 24 fica parado enquanto o retângulo gira.',
    },
    {
      tipo: 'ideia',
      texto: 'A ordem não muda o resultado: $3 \\times 8 = 8 \\times 3$. É a **propriedade comutativa**. Saber um fato é saber dois.',
      fala: 'A ordem não muda o resultado: três vezes oito é igual a oito vezes três. É a propriedade comutativa. Saber um fato é saber dois.',
      visual: ret({ linhas: 3, colunas: 8, rotulos: true, total: 24, girar: true }, 'O retângulo girado, 8 por 3, com o 24 embaixo.'),
      esboco: 'Dar o nome depois do gesto. A tabuada encolhe quase pela metade.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você sabe que $2 \\times 7 = 14$. Quanto é $4 \\times 7$?',
      fala: 'Você sabe que dois vezes sete é catorze. Quanto é quatro vezes sete?',
      visual: ret({ linhas: 4, colunas: 7, rotulos: true, cortesLinhas: [2] }, 'Um retângulo de 4 linhas de 7, partido ao meio por um corte entre a segunda e a terceira linha.'),
      opcoes: [
        {
          texto: '28', certa: true,
          explica: 'Isso. 4 linhas são duas vezes 2 linhas: o **dobro** de 14, $14 + 14 = 28$.',
          mostra: ret({ linhas: 4, colunas: 7, rotulos: true, cortesLinhas: [2], areas: true, total: 28 }, 'As duas metades mostram 14 e 14; o total 28 aparece.'),
        },
        {
          texto: '21',
          explica: '21 são 3 linhas de 7. Aqui são 4: duas metades de 14, $14 + 14 = 28$.',
          mostra: ret({ linhas: 4, colunas: 7, rotulos: true, cortesLinhas: [2], areas: true, total: 28 }, 'A quarta linha pisca; as metades mostram 14 e 14.'),
        },
        {
          texto: '11', erro: 'soma-no-lugar-de-multiplicar',
          explica: '4 + 7 = 11 é menos que uma metade só. Cada metade tem 14: dá 28.',
          mostra: ret({ linhas: 4, colunas: 7, rotulos: true, cortesLinhas: [2], areas: true, total: 28 }, 'As duas metades acendem com 14 cada.'),
        },
      ],
      esboco: 'O dobro: a tabuada do 4 é a do 2 duas vezes. O mesmo vale para o 8 (dobro do 4).',
    },
    {
      tipo: 'passo',
      problema: 'Volte às latas: $6 \\times 7$.',
      fala: 'Volte às latas: seis vezes sete.',
      visual: ret({ ...R6x7, cortesLinhas: [5] }, 'O retângulo de 6 por 7, com um corte depois da quinta linha. A sexta linha fica separada, sozinha.'),
      passos: [
        {
          pergunta: 'Que fato perto deste você sabe?',
          opcoes: [
            { texto: '$5 \\times 7 = 35$', certa: true, explica: 'Isso. 5 linhas de 7 são 35: a metade de $10 \\times 7 = 70$.', mostra: ret({ ...R6x7, cortesLinhas: [5], destaque: [0, 0] }, 'As 5 primeiras linhas acendem: 35.') },
            { texto: '$6 + 7 = 13$', erro: 'soma-no-lugar-de-multiplicar', explica: 'Somar não conta as latas: só uma fileira já tem 7. Use um fato da tabuada: $5 \\times 7$.', mostra: ret({ ...R6x7, cortesLinhas: [5], destaque: [0, 0] }, 'As 5 primeiras linhas acendem.') },
          ],
          linha: { tex: '5 \\times 7 = 35', fala: 'cinco vezes sete é trinta e cinco' },
        },
        {
          pergunta: 'Falta uma fileira. Quantas latas ela tem?',
          opcoes: [
            { texto: '7', certa: true, explica: 'Isso. Toda fileira tem 7 latas.', mostra: ret({ ...R6x7, cortesLinhas: [5], destaque: [1, 0] }, 'A sexta linha acende: 7 quadradinhos.') },
            { texto: '6', erro: 'soma-grupo-errado', explica: '6 é o número de fileiras. A fileira que falta tem 7 latas, como as outras.', mostra: ret({ ...R6x7, cortesLinhas: [5], destaque: [1, 0] }, 'A sexta linha acende e os 7 quadradinhos dela piscam um a um.') },
          ],
          linha: { tex: '6 \\times 7 = 35 + 7', fala: 'seis vezes sete é trinta e cinco mais sete' },
        },
        {
          pergunta: 'Então $6 \\times 7$ é…',
          fala: 'Então seis vezes sete é',
          opcoes: [
            { texto: '42', certa: true, explica: 'Isso. $35 + 7 = 42$. Sem decorar.', mostra: ret({ ...R6x7, cortesLinhas: [5], areas: true, total: 42 }, 'As partes mostram 35 e 7; o total 42 aparece embaixo.') },
            { texto: '35', erro: 'esquece-grupo-extra', explica: '35 são só 5 fileiras. A sexta ainda está ali: $35 + 7 = 42$.', mostra: ret({ ...R6x7, cortesLinhas: [5], areas: true, total: 42 }, 'A sexta linha pisca até o total virar 42.') },
            { texto: '41', erro: 'soma-grupo-errado', explica: 'Você somou 6, o número de fileiras. A fileira tem 7: $35 + 7 = 42$.', mostra: ret({ ...R6x7, cortesLinhas: [5], areas: true, total: 42 }, 'A sexta linha mostra 7.') },
          ],
          linha: { tex: '6 \\times 7 = 42', fala: 'seis vezes sete é quarenta e dois' },
        },
      ],
      esboco: 'Momento-chave: o fato novo nasce do vizinho. O corte do retângulo mostra exatamente o que somar.',
    },
    {
      tipo: 'anote',
      titulo: 'Tabuada com estratégia',
      definicao: 'A ordem não muda o resultado. Um fato novo sai de um vizinho: some ou tire uma linha inteira.',
      exemplo: { tex: '6 \\times 7 = 5 \\times 7 + 7 = 42', fala: 'seis vezes sete é cinco vezes sete mais sete, quarenta e dois' },
      alerta: 'A linha que entra ou sai tem o tamanho da linha: em $6 \\times 7$, some 7, não 6.',
      esboco: 'Na página: o retângulo de 6 por 7 partido em 5 linhas e 1 linha. Ao lado, a lista dos fatos âncora: ×2, ×5, ×10.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E $9 \\times 8$? Que caminho dá certo?',
      fala: 'E nove vezes oito? Que caminho dá certo?',
      visual: ret({ linhas: 9, colunas: 8, rotulos: true }, 'O retângulo de 9 linhas de 8. Uma linha fantasma, tracejada, aparece embaixo: seria a décima.'),
      opcoes: [
        {
          texto: '$10 \\times 8 - 8$', certa: true,
          explica: 'Isso. 10 linhas de 8 são 80. Tire uma linha: $80 - 8 = 72$.',
          mostra: ret({ linhas: 10, colunas: 8, rotulos: true, cortesLinhas: [9], destaque: [1, 0], total: 72 }, 'Surge a décima linha, completa: 80. Depois ela acende e sai; fica 72.'),
        },
        {
          texto: '$10 \\times 8 - 9$', erro: 'soma-grupo-errado',
          explica: 'A linha que sai tem 8, não 9. $80 - 8 = 72$.',
          mostra: ret({ linhas: 10, colunas: 8, rotulos: true, cortesLinhas: [9], destaque: [1, 0], total: 72 }, 'A décima linha acende e mostra os seus 8 quadradinhos.'),
        },
        {
          texto: '$9 + 8$', erro: 'soma-no-lugar-de-multiplicar',
          explica: '$9 + 8 = 17$ não chega nem a 3 linhas. Use o 10: $80 - 8 = 72$.',
          mostra: ret({ linhas: 10, colunas: 8, rotulos: true, cortesLinhas: [9], destaque: [1, 0], total: 72 }, 'A décima linha aparece e sai; fica 72.'),
        },
      ],
      esboco: 'O vizinho também pode ser de cima: o 10 é o fato mais fácil de todos. Na tabuada do 9, tire uma linha do 10.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, por um caminho seu: $7 \\times 8$.',
      fala: 'No papel, por um caminho seu: sete vezes oito.',
      resposta: 56,
      resolucao: [
        { tex: '5 \\times 8 = 40', fala: 'cinco vezes oito é quarenta' },
        { tex: '2 \\times 8 = 16', fala: 'dois vezes oito é dezesseis' },
        { tex: '7 \\times 8 = 40 + 16 = 56', fala: 'sete vezes oito é quarenta mais dezesseis, cinquenta e seis' },
      ],
      esboco: 'Qualquer caminho vale (8 × 8 − 8, ou 7 × 7 + 7). A resolução mostra um deles, partindo do 5.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['tabuada-n1', 'tabuada-n2', 'tabuada-n3'],
      esboco: 'Nível 1: o dobro, com o retângulo partido ao meio. Nível 2: um fato a partir do 5 ou do 10. Nível 3: fatos difíceis (6 a 9) numa situação, sem ajuda.',
    },
    {
      tipo: 'fecho',
      texto: 'As latas: $35 + 7 = 42$, sem decorar. Na próxima aula: multiplicar por **10, 100 e 1.000**.',
      fala: 'As latas: trinta e cinco mais sete, quarenta e dois, sem decorar. Na próxima aula: multiplicar por dez, cem e mil.',
      visual: ret({ ...R6x7, cortesLinhas: [5], areas: true, total: 42 }, 'O retângulo do gancho partido em 35 e 7, com o 42 embaixo.'),
      esboco: 'Responder ao gancho e preparar o ×10, que foi o vizinho mais útil desta aula.',
    },
  ],
}
