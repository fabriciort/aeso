import type { Aula, Visual } from '@/lib/formation/schema'

// Frações equivalentes: o mesmo pedaço com nomes diferentes. Cortar cada
// parte em 2 dobra o número de partes e o de pintadas, e o pintado não muda
// de tamanho: 1/2 = 2/4 = 4/8. A regra é multiplicar (ou dividir) os dois
// termos pelo mesmo número. Somar o mesmo nos dois não vale.

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const MEIO = { partes: 2, pintadas: 1 }

export const aula: Aula = {
  id: 'B.U7.A4',
  titulo: 'Frações equivalentes',
  objetivo: 'Reconhecer frações equivalentes como o mesmo número, achar uma fração equivalente multiplicando os dois termos pelo mesmo número e completar igualdades como 3/4 = ?/12.',
  modelo: 'barra',
  esboco: 'Ana comeu 1/2 pizza; Bia, 2/4 de outra igual. Quem comeu mais? O aluno corta a barra de baixo ao meio duas vezes: 1/2 vira 2/4 e 4/8, e o pintado não sai da linha tracejada da metade. Momento-chave: o pintado fica parado enquanto os números dobram; cortar mais fino só muda o nome. Depois, a isca: somar 1 nos dois (2/3 e 3/4) não dá o mesmo pedaço, e a barra mostra.',
  vega: 'Ideia central: frações equivalentes são o mesmo número com nomes diferentes. Cortar cada parte em k pedaços multiplica por k o número de partes e o de pintadas: n/d = (n × k)/(d × k). Também vale dividir os dois termos pelo mesmo número. Erros esperados: somar o mesmo nos dois termos (2/3 = 3/4); mudar só um termo (3/4 = 3/12); achar que números maiores são um pedaço maior (2/4 maior que 1/2). Guie perguntando "Em quantos pedaços cada parte foi cortada?", "E o pintado, mudou de tamanho?", "Os dois números foram multiplicados pelo mesmo?". Em Sua vez, peça para achar primeiro o fator (12 ÷ 4 = 3).',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Ana comeu $\\frac{1}{2}$ pizza. Bia comeu $\\frac{2}{4}$ de outra pizza igual. Quem comeu mais?',
      fala: 'Ana comeu meia pizza. Bia comeu dois quartos de outra pizza igual. Quem comeu mais?',
      visual: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }] }, 'Duas barras do mesmo tamanho, uma embaixo da outra: 1/2 em cima e 2/4 embaixo, com as frações ao lado.'),
      esboco: 'Dois números diferentes. A barra já sussurra a resposta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quem comeu mais pizza?',
      visual: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }] }, 'As duas barras.'),
      opcoes: [
        {
          texto: 'As duas comeram o mesmo', certa: true,
          explica: 'Isso. O pintado das duas termina no mesmo lugar: a metade.',
          mostra: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }], guia: 0.5 }, 'Uma linha tracejada desce na metade e passa pelo fim dos dois pintados.'),
        },
        {
          texto: 'Bia: 2 pedaços é mais que 1',
          explica: 'Os pedaços da Bia são menores: cada um é metade do da Ana. Os 2 cobrem a mesma metade.',
          mostra: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }], guia: 0.5 }, 'A linha tracejada da metade passa pelo fim dos dois pintados.'),
        },
        {
          texto: 'Ana: o pedaço dela é maior',
          explica: 'O pedaço da Ana é maior, mas a Bia comeu 2. Juntos, cobrem a mesma metade.',
          mostra: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }], guia: 0.5 }, 'A linha tracejada da metade passa pelo fim dos dois pintados.'),
        },
      ],
      esboco: 'As duas iscas (mais pedaços, pedaço maior) desmontadas pela mesma linha da metade.',
    },
    {
      tipo: 'mexa',
      texto: 'Embaixo, a mesma metade. Corte cada parte ao meio, e de novo.',
      fala: 'Embaixo, a mesma metade. Corte cada parte ao meio, e de novo.',
      visual: barra({ barras: [MEIO, MEIO], ativa: 1, partir: true, guia: 0.5 }, 'Duas barras de 1/2, com a linha da metade. A de baixo tem a borda tracejada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na barra de baixo até ela ter 8 partes.',
        sucesso: { partes: 8 },
        mostre: 'A barra de baixo se corta em 4 e depois em 8. O pintado não sai da linha: 1/2, 2/4, 4/8.',
      },
      descoberta: 'A cada corte, as partes e as pintadas dobram, e o pintado continua do mesmo tamanho.',
      esboco: 'O momento-chave. A fração ao lado muda (2/4, 4/8) e o âmbar fica parado na linha.',
    },
    {
      tipo: 'ideia',
      texto: '$\\frac{1}{2}$, $\\frac{2}{4}$ e $\\frac{4}{8}$: o mesmo pedaço. Cortar mais fino só muda o nome.',
      fala: 'Um meio, dois quartos e quatro oitavos: o mesmo pedaço. Cortar mais fino só muda o nome.',
      visual: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }, { partes: 8, pintadas: 4 }], guia: 0.5 }, 'Três barras empilhadas, 1/2, 2/4 e 4/8, e a linha da metade atravessando as três.'),
      esboco: 'A escada das três barras, que vai para o caderno.',
    },
    {
      tipo: 'aposta',
      pergunta: 'De $\\frac{1}{2}$ para $\\frac{2}{4}$, o que aconteceu com os dois números?',
      fala: 'De um meio para dois quartos, o que aconteceu com os dois números?',
      visual: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }], guia: 0.5 }, 'As barras de 1/2 e 2/4.'),
      opcoes: [
        {
          texto: 'Os dois foram multiplicados por 2', certa: true,
          explica: 'Isso. Cada parte virou 2: as partes dobram, e as pintadas também.',
          mostra: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }], rotulos: true, guia: 0.5 }, 'Cada metade da barra de cima corresponde a dois quartos embaixo.'),
        },
        {
          texto: 'Os dois ganharam 1', erro: 'equivalente-somando',
          explica: 'O 1 ganhou 1, mas o 2 ganhou 2. Os dois foram **multiplicados** por 2.',
          mostra: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }, { partes: 8, pintadas: 4 }], guia: 0.5 }, 'A terceira barra: de 2/4 para 4/8 os números dobram de novo, e não ganham 1.'),
        },
        {
          texto: 'Só o de baixo mudou', erro: 'muda-so-um-termo',
          explica: 'O de cima também mudou: 1 pintada virou 2. Os dois dobraram.',
          mostra: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }], rotulos: true, guia: 0.5 }, 'A parte pintada de cima corresponde a duas pintadas embaixo.'),
        },
      ],
      esboco: 'A regra sai da barra. "Ganhar 1" é a isca, e a próxima aposta a testa.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Somando 1 nos dois, $\\frac{2}{3}$ vira $\\frac{3}{4}$. São iguais?',
      fala: 'Somando um nos dois, dois terços vira três quartos. São iguais?',
      visual: barra({ barras: [{ partes: 3, pintadas: 2 }, { partes: 4, pintadas: 3 }] }, 'As barras de 2/3 e 3/4, uma embaixo da outra.'),
      opcoes: [
        {
          texto: 'Não: $\\frac{3}{4}$ é maior', certa: true,
          explica: 'Isso. O pintado de $\\frac{3}{4}$ passa da linha de $\\frac{2}{3}$. Somar muda o tamanho.',
          mostra: barra({ barras: [{ partes: 3, pintadas: 2 }, { partes: 4, pintadas: 3 }], guia: 2 / 3 }, 'A linha tracejada no fim do 2/3: o pintado do 3/4 passa dela.'),
        },
        {
          texto: 'Sim: fez o mesmo nos dois', erro: 'equivalente-somando',
          explica: 'Olhe a linha: o pintado de baixo passa. Fazer o mesmo só vale multiplicando ou dividindo.',
          mostra: barra({ barras: [{ partes: 3, pintadas: 2 }, { partes: 4, pintadas: 3 }], guia: 2 / 3 }, 'A linha tracejada no fim do 2/3: o pintado do 3/4 passa dela.'),
        },
      ],
      esboco: 'O contraexemplo que convence: a linha tracejada.',
    },
    {
      tipo: 'anote',
      titulo: 'Frações equivalentes',
      definicao: '**Frações equivalentes** são o mesmo número com nomes diferentes. Multiplique (ou divida) os **dois** números pelo mesmo número.',
      exemplo: { tex: '\\frac{1}{2} = \\frac{1 \\times 2}{2 \\times 2} = \\frac{2}{4}', fala: 'um meio é um vezes dois sobre dois vezes dois, dois quartos' },
      alerta: 'Somar o mesmo nos dois não vale: $\\frac{2}{3}$ não é $\\frac{3}{4}$. E os dois números mudam juntos.',
      esboco: 'Na página: as três barras de 1/2, 2/4 e 4/8 com a linha da metade, e o ×2 em cima e embaixo.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora $\\frac{2}{3}$. Corte cada parte da barra de baixo em **3**.',
      fala: 'Agora dois terços. Corte cada parte da barra de baixo em três.',
      visual: barra({ barras: [{ partes: 3, pintadas: 2 }, { partes: 3, pintadas: 2 }], ativa: 1, partir: true, fator: 3, guia: 2 / 3 }, 'Duas barras de 2/3 com a linha no fim do pintado. A de baixo tem a borda tracejada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na barra de baixo para cortar.',
        sucesso: { partes: 9 },
        mostre: 'Cada terço se corta em 3. A barra de baixo fica com 9 partes e 6 pintadas: 6/9.',
      },
      descoberta: 'Cortando cada parte em 3, as partes e as pintadas ficam 3 vezes maiores: 2/3 = 6/9.',
      esboco: 'O mesmo gesto com outro fator: a regra vale para qualquer corte.',
    },
    {
      tipo: 'passo',
      problema: 'Complete: $\\frac{3}{4} = \\frac{?}{12}$.',
      fala: 'Complete: três quartos é igual a quantos doze avos?',
      visual: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 12, rotulo: '?' }], guia: 0.75 }, 'A barra de 3/4 em cima e, embaixo, uma barra de 12 partes sem nada pintado, com "?" ao lado.'),
      passos: [
        {
          pergunta: 'O 4 virou 12. Multiplicou por quanto?',
          fala: 'O quatro virou doze. Multiplicou por quanto?',
          opcoes: [
            { texto: '3', certa: true, explica: 'Isso. $4 \\times 3 = 12$: cada quarto foi cortado em 3.' },
            { texto: '8', erro: 'equivalente-somando', explica: '8 é o que se soma: $4 + 8 = 12$. Mas cortar em pedaços multiplica: $4 \\times 3$.' },
          ],
          linha: { tex: '4 \\times 3 = 12', fala: 'quatro vezes três, doze' },
        },
        {
          pergunta: 'Então o 3 de cima vira…',
          fala: 'Então o três de cima vira quanto?',
          opcoes: [
            { texto: '9', certa: true, explica: 'Isso. $3 \\times 3 = 9$.', mostra: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 12, pintadas: 9 }], guia: 0.75 }, '9 das 12 partes se pintam embaixo e terminam na linha do 3/4.') },
            { texto: '3', erro: 'muda-so-um-termo', explica: '$\\frac{3}{12}$ é bem menos que $\\frac{3}{4}$. O de cima também é multiplicado por 3.', mostra: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 12, pintadas: 3 }], guia: 0.75 }, 'Só 3 das 12 partes pintadas: o pintado fica longe da linha.') },
            { texto: '11', erro: 'equivalente-somando', explica: '$3 + 8 = 11$ soma, não multiplica. $\\frac{11}{12}$ passa da linha. É $3 \\times 3$.', mostra: barra({ barras: [{ partes: 4, pintadas: 3 }, { partes: 12, pintadas: 11 }], guia: 0.75 }, '11 partes pintadas passam da linha do 3/4.') },
          ],
          linha: { tex: '\\frac{3}{4} = \\frac{3 \\times 3}{4 \\times 3} = \\frac{9}{12}', fala: 'três quartos é três vezes três sobre quatro vezes três, nove doze avos' },
        },
      ],
      esboco: 'Primeiro o fator, depois o outro número. A barra mostra cada erro passando ou ficando longe da linha.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: a receita pede $\\frac{2}{3}$ de xícara, mas o seu copo marca **sextos**. Quantos sextos você põe?',
      fala: 'No papel: a receita pede dois terços de xícara, mas o seu copo marca sextos. Quantos sextos você põe?',
      resposta: 4,
      resolucao: [
        { tex: '3 \\times 2 = 6', fala: 'três vezes dois, seis' },
        { tex: '\\frac{2}{3} = \\frac{2 \\times 2}{3 \\times 2} = \\frac{4}{6}', fala: 'dois terços é dois vezes dois sobre três vezes dois, quatro sextos' },
      ],
      esboco: 'Uma conta de cozinha de verdade: o copo medidor com outra escala.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['equivalentes-n1', 'equivalentes-n2', 'equivalentes-n3'],
      esboco: 'Nível 1: completar o número de cima, com as barras. Nível 2: completar o de baixo, multiplicando ou dividindo. Nível 3: reconhecer a medida igual numa receita, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'Ana e Bia comeram o mesmo: $\\frac{1}{2} = \\frac{2}{4}$. Na próxima aula, o caminho de volta: juntar pedaços para simplificar.',
      fala: 'Ana e Bia comeram o mesmo: um meio é dois quartos. Na próxima aula, o caminho de volta: juntar pedaços para simplificar.',
      visual: barra({ barras: [MEIO, { partes: 4, pintadas: 2 }], guia: 0.5 }, 'As barras da Ana e da Bia com a linha da metade.'),
      esboco: 'Responde ao gancho e aponta para a simplificação.',
    },
  ],
}
