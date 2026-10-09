import type { Aula } from '@/lib/formation/schema'

// EXEMPLO DE FORMATO, escrito para mostrar o contrato (lib/formation/schema.ts).
// O conteúdo definitivo é do autor de conteúdo, que pode reescrever tudo.

export const aula: Aula = {
  id: 'B.U1.A2',
  titulo: 'O zero que guarda o lugar',
  objetivo: 'Dizer quanto vale cada algarismo de um número pela casa em que ele está, e explicar por que o zero não pode sumir.',
  modelo: 'quadro-posicional',
  vega:
    'Ideia central: o valor de um algarismo depende da casa (unidades, dezenas, centenas, milhares); cada casa vale 10 vezes a da direita; o zero guarda o lugar de uma casa vazia. Erros esperados: ler o algarismo e não a casa (o 7 de 4.072 "vale 7"), escrever "seiscentos e nove" como 6009 ou 69. Guie pedindo para olhar os blocos embaixo de cada casa. Nunca dê a resposta de Sua vez.',
  esboco:
    'Tudo acontece sobre o quadro posicional (três colunas: C, D, U), com blocos de base 10 embaixo de cada coluna: placas de 100, barras de 10, cubos de 1. Os algarismos são cartões que o aluno arrasta para as colunas. O momento-chave é tirar o zero: o 3 escorrega de casa e as placas encolhem até virar barras, e o número cai de 305 para 35 diante dos olhos.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: '**305** e **35** usam o 3 e o 5. Por que um vale quase dez vezes o outro?',
      fala: 'Trezentos e cinco e trinta e cinco usam o três e o cinco. Por que um vale quase dez vezes o outro?',
      visual: { modelo: 'livre', estado: { etiquetas: ['R$ 305', 'R$ 35'] }, esboco: 'Duas etiquetas de preço lado a lado, como numa vitrine.' },
    },
    {
      tipo: 'mexa',
      texto: 'Arraste o **3**, o **0** e o **5** para as casas.',
      fala: 'Arraste o três, o zero e o cinco para as casas.',
      visual: {
        modelo: 'quadro-posicional',
        estado: { casas: ['C', 'D', 'U'], cartoes: [3, 0, 5], numero: null },
        movimento: 'As etiquetas da vitrine se desmontam e viram três cartões soltos; o quadro aparece embaixo.',
      },
      acao: {
        tipo: 'arrastar',
        instrucao: 'Arraste os algarismos para as casas.',
        sucesso: { numero: 305 },
        mostre: 'Os cartões vão sozinhos para C, D e U, nessa ordem, e os blocos nascem embaixo.',
      },
      descoberta: 'Cada coluna gera um tipo de bloco: o mesmo 3 vira placas na centena e barras na dezena.',
      esboco: 'Enquanto o aluno arrasta, os blocos nascem embaixo da coluna: 3 placas, nenhuma barra, 5 cubos. Se ele trocar de lugar (350), as placas e barras se reorganizam ao vivo.',
    },
    {
      tipo: 'aposta',
      pergunta: 'No 305, o zero não tem blocos. Se tirar o zero, muda alguma coisa?',
      fala: 'No trezentos e cinco, o zero não tem blocos. Se tirar o zero, muda alguma coisa?',
      visual: { modelo: 'quadro-posicional', estado: { numero: 305 } },
      opcoes: [
        {
          texto: 'Não muda nada',
          erro: 'esquece-zero',
          explica: 'Muda! Sem o zero, o 3 escorrega para as dezenas: **35**.',
          mostra: { modelo: 'quadro-posicional', estado: { numero: 35 }, movimento: 'O zero sai; o 3 desliza uma casa para a direita; as 3 placas encolhem até virar 3 barras.' },
        },
        {
          texto: 'Muda o número',
          certa: true,
          explica: 'Isso. O zero segura o 3 na casa das centenas.',
          mostra: { modelo: 'quadro-posicional', estado: { numero: 35 }, movimento: 'O mesmo movimento, para o aluno ver o que teria acontecido.' },
        },
      ],
    },
    {
      tipo: 'ideia',
      texto: 'Cada casa vale **10 vezes** a casa da direita. O zero guarda o lugar de uma casa vazia.',
      fala: 'Cada casa vale dez vezes a casa da direita. O zero guarda o lugar de uma casa vazia.',
      visual: { modelo: 'quadro-posicional', estado: { numero: 305, setas: 'x10' }, movimento: 'Setas "×10" aparecem entre as colunas, da direita para a esquerda.' },
    },
    {
      tipo: 'anote',
      titulo: 'Valor posicional',
      definicao: 'O valor de um algarismo depende da casa em que ele está.',
      exemplo: { tex: '305 = 3 \\text{ centenas} + 0 \\text{ dezenas} + 5 \\text{ unidades} = 300 + 5', fala: 'trezentos e cinco é três centenas, zero dezenas e cinco unidades: trezentos mais cinco' },
      alerta: 'Sem o zero, 305 vira 35.',
    },
    {
      tipo: 'passo',
      problema: 'No **4.072**, quanto vale o **7**?',
      fala: 'No quatro mil e setenta e dois, quanto vale o sete?',
      visual: { modelo: 'quadro-posicional', estado: { casas: ['M', 'C', 'D', 'U'], numero: 4072 } },
      passos: [
        {
          pergunta: 'Em que casa está o 7?',
          opcoes: [
            { texto: 'Unidades', erro: 'casa-errada', explica: 'Conte da direita: a primeira casa é a do 2.' },
            { texto: 'Dezenas', certa: true, explica: 'Isso: é a segunda casa, da direita para a esquerda.' },
            { texto: 'Centenas', erro: 'casa-errada', explica: 'Na casa das centenas está o 0.' },
          ],
          linha: { tex: '7 \\text{ está nas dezenas}', fala: 'sete está nas dezenas' },
        },
        {
          pergunta: 'Então quanto vale o 7?',
          opcoes: [
            { texto: '7', erro: 'valor-de-face', explica: 'Esse é o algarismo. Olhe os blocos: 7 barras de 10.' },
            { texto: '70', certa: true, explica: '7 dezenas são 70.' },
            { texto: '700', erro: 'casa-errada', explica: '700 seria o 7 nas centenas.' },
          ],
          linha: { tex: '7 \\text{ dezenas} = 70', fala: 'sete dezenas são setenta' },
        },
      ],
    },
    {
      tipo: 'caderno',
      instrucao: 'No caderno, escreva **2.408** como soma das casas. Depois digite quanto vale o **4**.',
      fala: 'No caderno, escreva dois mil quatrocentos e oito como soma das casas. Depois digite quanto vale o quatro.',
      resposta: 400,
      resolucao: [
        { tex: '2.408 = 2.000 + 400 + 0 + 8', fala: 'dois mil quatrocentos e oito é dois mil mais quatrocentos mais zero mais oito' },
        { tex: '\\text{o 4 vale } 400', fala: 'o quatro vale quatrocentos' },
      ],
    },
    { tipo: 'sua-vez', geradores: ['valor-do-algarismo', 'palavras-para-numero'] },
    {
      tipo: 'fecho',
      texto: 'Agora você lê cada algarismo pela casa dele. Próxima aula: **mil, milhão, bilhão**.',
      fala: 'Agora você lê cada algarismo pela casa dele. Próxima aula: mil, milhão, bilhão.',
      visual: { modelo: 'livre', estado: { etiquetas: ['R$ 305', 'R$ 35'] }, movimento: 'As etiquetas do gancho voltam, agora com os blocos embaixo de cada uma.' },
    },
  ],
}
