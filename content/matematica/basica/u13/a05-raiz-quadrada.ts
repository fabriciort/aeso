import type { Aula, Visual } from '@/lib/formation/schema'

// Raiz quadrada. A área de um quadrado é lado × lado, o lado "ao quadrado";
// a raiz quadrada faz o caminho de volta: da área para o lado. √36 = 6
// porque um quadrado de lado 6 tem 36 quadradinhos. O aluno monta o piso
// com as placas, fileira por fileira, até fechar o quadrado. Depois, os
// quadrados perfeitos até 12 × 12 = 144. Os erros a desmontar: a raiz como
// metade (√36 = 18), o lado pela volta (36 ÷ 4 = 9) e a raiz de uma soma
// tirada parcela por parcela (√(9 + 16) = 3 + 4 = 7).

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })
const quadrado = (n: number, esboco: string, extra: Record<string, unknown> = {}) => ret({ linhas: n, colunas: n, rotulos: true, total: n * n, ...extra }, esboco)

const Q6 = quadrado(6, 'O quadrado de 6 por 6: 6 em cima, 6 do lado e 36 embaixo.')
const Q5 = quadrado(5, 'O quadrado de 5 por 5, com 25 embaixo: é o lado que a raiz de 25 pede.')
const Q7 = quadrado(7, 'O quadrado de 7 por 7 cresce na tela, com 49 embaixo: muito mais que os 25 de 9 + 16.')
const Q9 = quadrado(9, 'O terreno de 9 por 9: 9 em cima, 9 do lado e 81 embaixo.')
const Q12 = quadrado(12, 'O quadrado de 12 por 12, o maior da tabuada, com 144 embaixo.')

const QUADRADOS = (completar: boolean) => ({
  modelo: 'livre' as const,
  estado: {
    tabela: {
      linhas: [
        { rotulo: 'lado', valores: [7, 8, 9, 10, 11, 12] },
        { rotulo: 'área', valores: [49, 64, 81, 100, 121, 144] },
      ],
      ...(completar ? { completar: true, mostradas: 1 } : {}),
    },
  },
  esboco: 'A tabela dos quadrados de 7 a 12: o lado em cima, a área embaixo. Começa só com 7 e 49; cada toque preenche uma coluna.',
})

export const aula: Aula = {
  id: 'B.U13.A5',
  titulo: 'Raiz quadrada',
  objetivo: 'Achar a raiz quadrada de um quadrado perfeito até 144 como o lado do quadrado com aquela área, e saber que a raiz de uma soma não é a soma das raízes.',
  modelo: 'retangulo',
  esboco: 'Abre na reforma: um piso quadrado de 36 m², quanto mede o lado? O aluno aposta (6, 18 ou 9) e cada erro mostra o quadrado que ele daria: 18 × 18 são 324 placas. Momento-chave: com as 36 placas, ele monta fileiras de 6 e o quadrado fecha na sexta fileira: √36 = 6, porque um quadrado de lado 6 tem área 36. Depois, a tabela dos quadrados até 144, a raiz que desfaz o "ao quadrado" e a armadilha √(9 + 16). Fecha com a cerca de um terreno quadrado.',
  vega: 'Ideia central: a raiz quadrada de um número é o número que, multiplicado por ele mesmo, dá aquele número; é o lado do quadrado com aquela área. √36 = 6 porque 6 × 6 = 36. A raiz desfaz o "ao quadrado": √(6²) = 6. Quadrados perfeitos até 144: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144. A raiz quadrada é sempre o número positivo: (−6)² também dá 36 (unidade 12), mas √36 é 6, como o lado de um quadrado. Erros esperados: a raiz como metade (√36 = 18); o lado pela volta (36 ÷ 4 = 9, que é o lado de um quadrado de perímetro 36); √(9 + 16) = 3 + 4 = 7, quando o certo é somar primeiro: √25 = 5. Guie com "Que número vezes ele mesmo dá isso?", "Monte o quadrado: quantas placas em cada fileira?", "Confira: quanto é o seu lado vezes ele mesmo?", "Primeiro a conta debaixo da raiz".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você vai trocar o piso de um quarto quadrado. A loja calculou **36 m²**. Quanto mede cada lado do quarto?',
      fala: 'Você vai trocar o piso de um quarto quadrado. A loja calculou trinta e seis metros quadrados. Quanto mede cada lado do quarto?',
      visual: expr(['lado × lado = 36 m²', 'lado = ?'], 'A pergunta grande: lado × lado = 36 m², e embaixo "lado = ?". Ainda sem placas.'),
      esboco: 'A unidade 9 calculou a área a partir dos lados. Aqui é o caminho de volta, e a pergunta fica aberta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto você acha que mede o lado?',
      visual: expr(['lado × lado = 36 m²', 'lado = ?'], 'A mesma pergunta.'),
      opcoes: [
        {
          texto: '18 m', erro: 'raiz-e-a-metade',
          explica: '18 é a metade de 36. Um quadrado de 18 por 18 tem ${18 \\times 18 = 324}$ placas, não 36.',
          fala: 'Dezoito é a metade de trinta e seis. Um quadrado de dezoito por dezoito tem trezentas e vinte e quatro placas, não trinta e seis.',
          mostra: quadrado(18, 'O quadrado de 18 por 18 enche o palco de quadradinhos miúdos, com 324 embaixo: muito mais que 36.'),
        },
        {
          texto: '6 m', certa: true,
          explica: 'Isso. Um quadrado de 6 por 6 tem ${6 \\times 6 = 36}$ placas de 1 m².',
          fala: 'Isso. Um quadrado de seis por seis tem seis vezes seis, trinta e seis placas de um metro quadrado.',
          mostra: expr(['6 × 6 = 36'], 'A conta que confere: 6 × 6 = 36. O quadrado em placas fica para o próximo cartão.'),
        },
        {
          texto: '9 m', erro: 'confunde-area-perimetro',
          explica: '${36 \\div 4 = 9}$ dá o lado de uma volta de 36 m. Mas 36 m² é o chão: 9 por 9 são 81 placas.',
          fala: 'Trinta e seis dividido por quatro, nove, dá o lado de uma volta de trinta e seis metros. Mas trinta e seis metros quadrados é o chão: nove por nove são oitenta e uma placas.',
          mostra: quadrado(9, 'O quadrado de 9 por 9, com 81 embaixo: mais que o dobro do quarto.'),
        },
      ],
      esboco: 'Cada erro vira o quadrado que ele daria: o 18 enche o palco, a metade passa muito longe. A certa só mostra a conta: o quadrado se monta no próximo cartão.',
    },
    {
      tipo: 'mexa',
      texto: 'Confira com as placas de 1 m². Monte fileiras de 6 até usar as **36** placas. Que forma tem o chão?',
      fala: 'Confira com as placas de um metro quadrado. Monte fileiras de seis até usar as trinta e seis placas. Que forma tem o chão?',
      visual: ret({ linhas: 0, colunas: 6, adicionar: true, rotulos: true, total: 0 }, 'O chão vazio, com o botão "+ 1 linha" e o total 0 embaixo. Cada toque desliza uma fileira de 6 placas, e o total sobe: 6, 12, 18… até 36, quando o chão fecha um quadrado.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em "+ 1 linha" até o total chegar a 36.',
        sucesso: { linhas: 6 },
        mostre: 'Seis fileiras de 6 entram, uma de cada vez, e o total sobe até 36: o chão é um quadrado de 6 por 6.',
      },
      descoberta: 'Na sexta fileira, as placas acabam e o chão fica com 6 de cada lado: um quadrado de lado 6 tem área 36.',
      esboco: 'O momento-chave: o lado aparece montando a área. A raiz é o lado do quadrado que gasta todas as placas.',
    },
    {
      tipo: 'anote',
      titulo: 'Raiz quadrada',
      definicao: 'A **raiz quadrada** de um número é o número que, vezes ele mesmo, dá aquele número: o lado do quadrado com aquela área.',
      exemplo: { tex: '\\sqrt{36} = 6 \\quad \\text{porque} \\quad 6 \\times 6 = 6^2 = 36', fala: 'raiz quadrada de trinta e seis é seis, porque seis vezes seis, seis ao quadrado, é trinta e seis' },
      alerta: 'A raiz não é a metade: ${\\sqrt{36}}$ não é 18. Confira multiplicando o lado por ele mesmo.',
      esboco: 'Na página: o quadrado de 6 por 6 com 36 dentro, e o símbolo √ apontando do 36 para o lado 6.',
    },
    {
      tipo: 'mexa',
      texto: 'Os quadrados de 1 a 6 você já tem: 1, 4, 9, 16, 25, 36. Complete os outros, até ${12 \\times 12}$.',
      fala: 'Os quadrados de um a seis você já tem: um, quatro, nove, dezesseis, vinte e cinco, trinta e seis. Complete os outros, até doze vezes doze.',
      visual: QUADRADOS(true),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para achar o próximo quadrado.',
        sucesso: { colunas: 6 },
        mostre: 'As colunas se preenchem: 64, 81, 100, 121, 144.',
      },
      descoberta: 'Os quadrados perfeitos até 144: 49, 64, 81, 100, 121, 144. Ler a tabela de baixo para cima é tirar a raiz.',
      esboco: 'A tabela que o aluno vai consultar no resto da aula. De cima para baixo, ao quadrado; de baixo para cima, a raiz.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A raiz faz o caminho de volta, da área para o lado. Quanto é ${\\sqrt{144}}$?',
      fala: 'A raiz faz o caminho de volta, da área para o lado. Quanto é a raiz quadrada de cento e quarenta e quatro?',
      visual: QUADRADOS(false),
      opcoes: [
        {
          texto: '72', erro: 'raiz-e-a-metade',
          explica: '72 é a metade de 144. Na tabela, 144 está embaixo do 12: o lado é 12.',
          fala: 'Setenta e dois é a metade de cento e quarenta e quatro. Na tabela, cento e quarenta e quatro está embaixo do doze: o lado é doze.',
          mostra: Q12,
        },
        {
          texto: '14',
          explica: '${14 \\times 14 = 196}$, passa de 144. Na tabela, 144 está embaixo do 12.',
          fala: 'Catorze vezes catorze é cento e noventa e seis, passa de cento e quarenta e quatro. Na tabela, cento e quarenta e quatro está embaixo do doze.',
          mostra: Q12,
        },
        {
          texto: '12', certa: true,
          explica: 'Isso. Na tabela, 144 está embaixo do 12: ${12 \\times 12 = 144}$.',
          fala: 'Isso. Na tabela, cento e quarenta e quatro está embaixo do doze: doze vezes doze é cento e quarenta e quatro.',
          mostra: Q12,
        },
      ],
      esboco: 'A tabela lida de baixo para cima. O quadrado de 12 por 12 confirma.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Cuidado com a soma. Quanto é ${\\sqrt{9 + 16}}$?',
      fala: 'Cuidado com a soma. Quanto é a raiz quadrada de nove mais dezesseis?',
      visual: expr(['√(9 + 16) = ?'], 'A conta grande, com o "?" no fim.'),
      opcoes: [
        {
          texto: '7', erro: 'raiz-da-soma-separada',
          explica: '${3 + 4 = 7}$, mas um quadrado de lado 7 tem 49 placas, não 25. Some primeiro: ${\\sqrt{25} = 5}$.',
          fala: 'Três mais quatro é sete, mas um quadrado de lado sete tem quarenta e nove placas, não vinte e cinco. Some primeiro: raiz de vinte e cinco, cinco.',
          mostra: Q7,
        },
        {
          texto: '5', certa: true,
          explica: 'Isso. Primeiro a conta debaixo da raiz: ${9 + 16 = 25}$, e ${\\sqrt{25} = 5}$.',
          fala: 'Isso. Primeiro a conta debaixo da raiz: nove mais dezesseis é vinte e cinco, e a raiz de vinte e cinco é cinco.',
          mostra: Q5,
        },
        {
          texto: '12,5', erro: 'raiz-e-a-metade',
          explica: '12,5 é a metade de 25. A raiz é o lado: ${5 \\times 5 = 25}$.',
          fala: 'Doze vírgula cinco é a metade de vinte e cinco. A raiz é o lado: cinco vezes cinco é vinte e cinco.',
          mostra: Q5,
        },
      ],
      esboco: 'A armadilha da unidade. O 7 vira um quadrado de 49: as placas de 9 e de 16 não dão para cobri-lo.',
    },
    {
      tipo: 'passo',
      problema: 'Um terreno quadrado tem **81 m²**. Quantos metros de cerca são precisos para dar a volta nele?',
      fala: 'Um terreno quadrado tem oitenta e um metros quadrados. Quantos metros de cerca são precisos para dar a volta nele?',
      visual: expr(['área = 81 m²', 'cerca = ?'], 'A área do terreno e a pergunta da cerca.'),
      passos: [
        {
          pergunta: 'Primeiro o lado. Quanto é ${\\sqrt{81}}$?',
          fala: 'Primeiro o lado. Quanto é a raiz quadrada de oitenta e um?',
          opcoes: [
            { texto: '20,25 m', erro: 'confunde-area-perimetro', explica: '${81 \\div 4}$ trata a área como se fosse a volta. O lado vem da raiz: ${9 \\times 9 = 81}$.', fala: 'Oitenta e um dividido por quatro trata a área como se fosse a volta. O lado vem da raiz: nove vezes nove é oitenta e um.', mostra: Q9 },
            { texto: '9 m', certa: true, explica: 'Isso. ${9 \\times 9 = 81}$: o terreno tem 9 m de cada lado.', fala: 'Isso. Nove vezes nove é oitenta e um: o terreno tem nove metros de cada lado.', mostra: Q9 },
            { texto: '40,5 m', erro: 'raiz-e-a-metade', explica: '40,5 é a metade de 81. Que número vezes ele mesmo dá 81? ${9 \\times 9}$.', fala: 'Quarenta vírgula cinco é a metade de oitenta e um. Que número vezes ele mesmo dá oitenta e um? Nove vezes nove.', mostra: Q9 },
          ],
          linha: { tex: '\\sqrt{81} = 9 \\text{ m}', fala: 'raiz quadrada de oitenta e um é nove metros' },
        },
        {
          pergunta: 'A cerca dá a volta: 4 lados de 9 m. Quantos metros?',
          fala: 'A cerca dá a volta: quatro lados de nove metros. Quantos metros?',
          opcoes: [
            { texto: '81 m', erro: 'confunde-area-perimetro', explica: '81 m² é o chão. A cerca é a borda: 4 lados de 9 m, 36 m.', fala: 'Oitenta e um metros quadrados é o chão. A cerca é a borda: quatro lados de nove metros, trinta e seis metros.', mostra: Q9 },
            { texto: '36 m', certa: true, explica: 'Isso. ${4 \\times 9 = 36}$ m de cerca para 81 m² de terreno.', fala: 'Isso. Quatro vezes nove, trinta e seis metros de cerca para oitenta e um metros quadrados de terreno.', mostra: quadrado(9, 'O terreno de 9 por 9, com a borda acesa.', { destaque: 'linha' }) },
          ],
          linha: { tex: '4 \\times 9 = 36 \\text{ m de cerca}', fala: 'quatro vezes nove, trinta e seis metros de cerca' },
        },
      ],
      esboco: 'A raiz como primeiro passo de um problema da obra: da área ao lado, do lado à cerca. Proposta: na resposta da cerca, a borda do quadrado acender em âmbar (o retângulo ainda não desenha o contorno; por ora acende a primeira fileira).',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: quanto é ${\\sqrt{36 + 64}}$? Faça primeiro a conta de dentro.',
      fala: 'No papel: quanto é a raiz quadrada de trinta e seis mais sessenta e quatro? Faça primeiro a conta de dentro.',
      resposta: 10,
      resolucao: [
        { tex: '36 + 64 = 100', fala: 'trinta e seis mais sessenta e quatro é cem' },
        { tex: '\\sqrt{100} = 10 \\quad \\text{porque} \\quad 10 \\times 10 = 100', fala: 'raiz de cem é dez, porque dez vezes dez é cem' },
        { tex: '\\text{e não } 6 + 8 = 14', fala: 'e não seis mais oito, catorze' },
      ],
      esboco: 'A armadilha de novo, sozinho. 6, 8 e 10 voltam no teorema de Pitágoras.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['raiz-quadrada-n1', 'raiz-quadrada-n2', 'raiz-quadrada-n3'],
      esboco: 'Nível 1: a raiz de um quadrado de até 10 × 10, com o quadrado na tela. Nível 2: quadrados até 144 e raízes de uma soma. Nível 3: terreno, horta e azulejo, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'O quarto de 36 m² tem 6 m de lado: ${\\sqrt{36} = 6}$. Na próxima aula: e quando não fecha um quadrado, como com 20 placas?',
      fala: 'O quarto de trinta e seis metros quadrados tem seis metros de lado: raiz de trinta e seis é seis. Na próxima aula: e quando não fecha um quadrado, como com vinte placas?',
      visual: Q6,
      esboco: 'Responde ao gancho com o quadrado montado e anuncia a estimativa.',
    },
  ],
}
