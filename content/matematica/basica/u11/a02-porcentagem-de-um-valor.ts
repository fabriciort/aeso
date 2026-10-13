import type { Aula, Visual } from '@/lib/formation/schema'

// Porcentagem de um valor, de cabeça. A barra é a conta inteira (100 %):
// cortada em 10 partes iguais, cada parte é 10 %, a conta ÷ 10. A tabela
// de proporção da unidade 10 desce de 100 % a 10 % e a 1 % (÷ 10 de cada
// vez, em cima e embaixo). 50 % é a metade; 25 %, a metade da metade.
// As outras se montam: 5 % é a metade de 10 %, 15 % = 10 % + 5 %, 20 % é
// o dobro de 10 %. Os erros a desmontar: 10 % de R$ 80 como R$ 10
// (porcentagem-como-numero-inteiro), trocar ÷ 10 e ÷ 100
// (troca-10-e-1-por-cento) e dividir pelo número da porcentagem
// (divide-pelo-numero-da-porcentagem: 20 % como ÷ 20).

const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const tabela = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })

const PCT = (pct: (number | string)[], reais: (number | string)[]) => [
  { rotulo: 'porcentagem (%)', valores: pct },
  { rotulo: 'valor (R$)', valores: reais },
]
const DIV10 = [{ de: 0, para: 1, rotulo: '÷ 10' }, { de: 1, para: 2, rotulo: '÷ 10' }]
const DIV10_BAIXO = DIV10.map((s) => ({ ...s, embaixo: true }))

export const aula: Aula = {
  id: 'B.U11.A2',
  titulo: 'Porcentagem de um valor',
  objetivo: 'Calcular de cabeça 10 % (÷ 10), 1 % (÷ 100) e 50 % (a metade) de um valor, e montar a partir deles 5 %, 15 %, 20 %, 25 % e outras porcentagens.',
  modelo: 'barra',
  esboco: 'A conta de R$ 80 do restaurante é uma barra: 100 %. O aluno corta a barra em 10 partes e cada parte é 10 %: R$ 8, a gorjeta. Momento-chave: as 10 partes iguais da barra, cada uma valendo a conta ÷ 10. A tabela de proporção desce de 100 % a 10 % e a 1 % com ÷ 10 em cima e embaixo. Depois o aluno pinta 50 % (a metade) e acha 25 % (a metade da metade). O passo a passo monta 15 % com 10 % e 5 %, e a aposta dos 20 % desmonta o "dividir por 20".',
  vega: 'Ideia central: toda porcentagem de um valor sai de três contas de cabeça. 10 % é o valor ÷ 10 (uma parte de 10); 1 % é o valor ÷ 100 (um décimo de 10 %); 50 % é a metade. As outras se montam: 5 % é a metade de 10 %; 20 % é o dobro de 10 %; 25 % é a metade de 50 %; 15 % = 10 % + 5 %; 35 % = 3 × 10 % + 5 %. Na tabela de proporção, porcentagem e reais andam juntos: o que se faz em cima, se faz embaixo. Erros esperados: 10 % de R$ 80 como R$ 10 (o número da porcentagem lido como reais); trocar ÷ 10 e ÷ 100 (1 % de R$ 80 como R$ 8); 20 % como ÷ 20 (dá menos que 10 %). Guie com "Quanto é 10 %?", "Essa porcentagem é quantas vezes 10 %?", "Deu mais ou menos que 10 %? Faz sentido?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A conta do restaurante deu **R$ 80**, e vem escrito: **10 % de serviço**. Quanto é a gorjeta?',
      fala: 'A conta do restaurante deu oitenta reais, e vem escrito: dez por cento de serviço. Quanto é a gorjeta?',
      visual: barra({ partes: 1, pintadas: 0, rotulo: 'R$ 80' }, 'Uma barra inteira, sem cortes, com "R$ 80" à direita: a conta toda.'),
      esboco: 'Todo mundo já viu os 10 % do garçom. A pergunta fica aberta; a tentação é dizer R$ 10.',
    },
    {
      tipo: 'mexa',
      texto: 'A conta inteira é **100 %**. Para achar 10 %, corte a barra em **10 partes iguais**.',
      fala: 'A conta inteira é cem por cento. Para achar dez por cento, corte a barra em dez partes iguais.',
      visual: barra({ partes: 1, pintadas: 0, partir: true, fator: 10, rotulo: 'R$ 80' }, 'A barra da conta, com a borda tracejada. Um toque a corta em 10 partes iguais.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na barra para cortá-la.',
        sucesso: { partes: 10 },
        mostre: 'A barra se corta em 10 partes iguais, de 10 % cada.',
      },
      descoberta: '10 partes iguais: cada uma é 10 % da conta.',
      esboco: 'O corte em 10 é o gesto da aula: 10 % é uma parte de 10.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Cada parte é **10 %** da conta de R$ 80. Quanto vale uma parte?',
      fala: 'Cada parte é dez por cento da conta de oitenta reais. Quanto vale uma parte?',
      visual: barra({ partes: 10, pintadas: 1, rotulo: '10 %' }, 'A barra em 10 partes, a primeira em âmbar, com "10 %" à direita.'),
      opcoes: [
        {
          texto: 'R$ 8', fala: 'Oito reais.', certa: true,
          explica: 'Isso. R$ 80 em 10 partes: $80 \\div 10 = 8$. **10 %** é dividir por 10.',
          mostra: barra({ partes: 10, pintadas: 1, rotulo: 'R$ 8' }, 'À direita, o "10 %" vira "R$ 8".'),
        },
        {
          texto: 'R$ 10', fala: 'Dez reais.', erro: 'porcentagem-como-numero-inteiro',
          explica: 'R$ 10 seria 10 % de R$ 100. Aqui são R$ 80 em 10 partes: R$ 8 cada.',
          mostra: barra({ partes: 10, pintadas: 1, rotulo: 'R$ 8' }, 'A parte âmbar com "R$ 8" à direita.'),
        },
        {
          texto: 'R$ 0,80', fala: 'Oitenta centavos.', erro: 'troca-10-e-1-por-cento',
          explica: 'R$ 0,80 é dividir por 100. Uma parte de 10 vale mais: $80 \\div 10 = 8$.',
          mostra: barra({ partes: 10, pintadas: 1, rotulo: 'R$ 8' }, 'A parte âmbar com "R$ 8" à direita.'),
        },
      ],
      esboco: 'O momento-chave: a conta ÷ 10. Responde ao gancho: a gorjeta é R$ 8.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora **1 %**: um décimo dos 10 %. Quanto é 1 % de R$ 80?',
      fala: 'Agora um por cento: um décimo dos dez por cento. Quanto é um por cento de oitenta reais?',
      visual: tabela({ linhas: PCT([100, 10, 1], [80, 8, '?']), setas: DIV10 }, 'A tabela de proporção: 100 % e R$ 80; 10 % e R$ 8; 1 % e "?". Em cima, as setas "÷ 10" de coluna em coluna.'),
      opcoes: [
        {
          texto: 'R$ 0,80', fala: 'Oitenta centavos.', certa: true,
          explica: 'Isso. $8 \\div 10 = 0{,}8$: 80 centavos. **1 %** é dividir por 100.',
          mostra: tabela({ linhas: PCT([100, 10, 1], [80, 8, '0,80']), setas: [...DIV10, ...DIV10_BAIXO] }, 'O "?" vira 0,80. As setas "÷ 10" aparecem também embaixo.'),
        },
        {
          texto: 'R$ 1', fala: 'Um real.', erro: 'porcentagem-como-numero-inteiro',
          explica: '1 % não é R$ 1. É uma parte de 100 da conta: $80 \\div 100 = 0{,}8$, 80 centavos.',
          mostra: tabela({ linhas: PCT([100, 10, 1], [80, 8, '0,80']), setas: [...DIV10, ...DIV10_BAIXO] }, 'As setas "÷ 10" embaixo levam R$ 8 a R$ 0,80.'),
        },
        {
          texto: 'R$ 8', fala: 'Oito reais.', erro: 'troca-10-e-1-por-cento',
          explica: 'R$ 8 é 10 %. 1 % é dez vezes menos: ÷ 10 de novo, R$ 0,80.',
          mostra: tabela({ linhas: PCT([100, 10, 1], [80, 8, '0,80']), setas: [...DIV10, ...DIV10_BAIXO] }, 'A segunda seta "÷ 10" embaixo leva R$ 8 a R$ 0,80.'),
        },
      ],
      esboco: 'A tabela da unidade 10: o que se faz na porcentagem se faz nos reais. ÷ 10 e ÷ 10 de novo é ÷ 100.',
    },
    {
      tipo: 'mexa',
      texto: '**50 %** são 5 das 10 partes. Pinte 50 % da conta de R$ 80.',
      fala: 'Cinquenta por cento são cinco das dez partes. Pinte cinquenta por cento da conta de oitenta reais.',
      visual: barra({ partes: 10, pintadas: 0, pintar: true, semFracao: true }, 'A barra em 10 partes, todas apagadas, com a borda tracejada.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas partes até pintar 50 %.',
        sucesso: { pintadas: 5 },
        mostre: 'Cinco partes se pintam: a metade da barra.',
      },
      descoberta: '50 % é a metade: 5 partes de R$ 8, R$ 40.',
      esboco: 'Cinco partes de 10 %: a metade. A conta de cabeça é dividir por 2.',
    },
    {
      tipo: 'aposta',
      pergunta: '50 % de R$ 80 é **R$ 40**, a metade. E **25 %**?',
      fala: 'Cinquenta por cento de oitenta reais é quarenta reais, a metade. E vinte e cinco por cento?',
      visual: barra({ partes: 4, pintadas: 2, rotulo: '50 %' }, 'A barra agora em 4 partes, 2 em âmbar: a mesma metade, com "50 %" à direita.'),
      opcoes: [
        {
          texto: 'R$ 20: a metade da metade', fala: 'Vinte reais: a metade da metade.', certa: true,
          explica: 'Isso. 25 % é a metade de 50 %: $40 \\div 2 = 20$. É um quarto da conta.',
          mostra: barra({ partes: 4, pintadas: 1, rotulo: 'R$ 20' }, 'Só uma das 4 partes fica âmbar, com "R$ 20" à direita.'),
        },
        {
          texto: 'R$ 25', fala: 'Vinte e cinco reais.', erro: 'porcentagem-como-numero-inteiro',
          explica: 'R$ 25 seria 25 % de R$ 100. Aqui, 25 % é um quarto de R$ 80: R$ 20.',
          mostra: barra({ partes: 4, pintadas: 1, rotulo: 'R$ 20' }, 'Uma das 4 partes em âmbar: R$ 20.'),
        },
        {
          texto: 'R$ 3,20', fala: 'Três reais e vinte centavos.', erro: 'divide-pelo-numero-da-porcentagem',
          explica: '$80 \\div 25$ dá menos que os 10 % (R$ 8). 25 % é a metade de 50 %: R$ 20.',
          mostra: barra({ partes: 4, pintadas: 1, rotulo: 'R$ 20' }, 'Uma das 4 partes em âmbar: R$ 20, bem mais que R$ 3,20.'),
        },
      ],
      esboco: 'A barra passa de 10 para 4 partes sem mudar o pintado: 50 % são 2 quartos. Tirar um quarto é 25 %.',
    },
    {
      tipo: 'anote',
      titulo: 'Porcentagem de um valor',
      definicao: '**10 %** de um valor é ele ÷ 10. **1 %** é ele ÷ 100. **50 %** é a metade. As outras porcentagens se montam com essas.',
      exemplo: { tex: '15\\,\\% \\text{ de } 80:\\quad 10\\,\\% + 5\\,\\% = 8 + 4 = 12', fala: 'quinze por cento de oitenta: dez por cento mais cinco por cento, oito mais quatro, doze' },
      alerta: '10 % de R$ 80 não é R$ 10. E 20 % não é dividir por 20: é o dobro de 10 %.',
      esboco: 'Na página: a barra em 10 partes de R$ 8, e a tabela 100 % → 10 % → 1 % com ÷ 10 em cima e embaixo.',
    },
    {
      tipo: 'passo',
      problema: 'A conta deu **R$ 60** e você quer deixar **15 %** de gorjeta. Quanto é?',
      fala: 'A conta deu sessenta reais e você quer deixar quinze por cento de gorjeta. Quanto é?',
      visual: tabela({ linhas: PCT([100, 10, 5, 15], [60, '?', '?', '?']) }, 'A tabela: 100 % e R$ 60; depois 10 %, 5 % e 15 %, com os reais ainda em "?".'),
      passos: [
        {
          pergunta: 'Comece por **10 %** de R$ 60.',
          fala: 'Comece por dez por cento de sessenta reais.',
          opcoes: [
            { texto: 'R$ 6', fala: 'seis reais', certa: true, explica: 'Isso. $60 \\div 10 = 6$.', mostra: tabela({ linhas: PCT([100, 10, 5, 15], [60, 6, '?', '?']), setas: [{ de: 0, para: 1, rotulo: '÷ 10' }, { de: 0, para: 1, rotulo: '÷ 10', embaixo: true }], destaque: [1] }, 'O primeiro "?" vira 6, com "÷ 10" em cima e embaixo.') },
            { texto: 'R$ 10', fala: 'dez reais', erro: 'porcentagem-como-numero-inteiro', explica: 'R$ 10 seria 10 % de R$ 100. De R$ 60: $60 \\div 10 = 6$.' },
          ],
          linha: { tex: '10\\,\\% \\text{ de } 60 = 6', fala: 'dez por cento de sessenta: seis' },
        },
        {
          pergunta: 'E **5 %**? É a metade de 10 %.',
          fala: 'E cinco por cento? É a metade de dez por cento.',
          opcoes: [
            { texto: 'R$ 3', fala: 'três reais', certa: true, explica: 'Isso. A metade de R$ 6.', mostra: tabela({ linhas: PCT([100, 10, 5, 15], [60, 6, 3, '?']), setas: [{ de: 0, para: 1, rotulo: '÷ 10' }, { de: 0, para: 1, rotulo: '÷ 10', embaixo: true }, { de: 1, para: 2, rotulo: '÷ 2' }, { de: 1, para: 2, rotulo: '÷ 2', embaixo: true }], destaque: [2] }, 'O segundo "?" vira 3, com "÷ 2" em cima e embaixo.') },
            { texto: 'R$ 12', fala: 'doze reais', erro: 'divide-pelo-numero-da-porcentagem', explica: '$60 \\div 5 = 12$ é o dobro de 10 %, não a metade. 5 % é $6 \\div 2 = 3$.' },
            { texto: 'R$ 5', fala: 'cinco reais', erro: 'porcentagem-como-numero-inteiro', explica: '5 % não é R$ 5. É a metade dos 10 %: $6 \\div 2 = 3$.' },
          ],
          linha: { tex: '5\\,\\% \\text{ de } 60 = 6 \\div 2 = 3', fala: 'cinco por cento de sessenta: seis dividido por dois, três' },
        },
        {
          pergunta: '15 % são 10 % mais 5 %. Quanto dá a gorjeta?',
          fala: 'Quinze por cento são dez por cento mais cinco por cento. Quanto dá a gorjeta?',
          opcoes: [
            { texto: 'R$ 9', fala: 'nove reais', certa: true, explica: 'Isso. $6 + 3 = 9$: a gorjeta é R$ 9.', mostra: tabela({ linhas: PCT([100, 10, 5, 15], [60, 6, 3, 9]), setas: [{ de: 0, para: 1, rotulo: '÷ 10' }, { de: 0, para: 1, rotulo: '÷ 10', embaixo: true }, { de: 1, para: 2, rotulo: '÷ 2' }, { de: 1, para: 2, rotulo: '÷ 2', embaixo: true }, { de: 2, para: 3, rotulo: '+ 10 %' }, { de: 2, para: 3, rotulo: '+ 6', embaixo: true }], destaque: [3] }, 'O último "?" vira 9: aos 5 % (R$ 3) se somam os 10 % (R$ 6).') },
            { texto: 'R$ 15', fala: 'quinze reais', erro: 'porcentagem-como-numero-inteiro', explica: 'R$ 15 seria 15 % de R$ 100. De R$ 60: $6 + 3 = 9$.' },
          ],
          linha: { tex: '15\\,\\% \\text{ de } 60 = 6 + 3 = 9', fala: 'quinze por cento de sessenta: seis mais três, nove' },
        },
      ],
      esboco: 'Montar uma porcentagem com as de cabeça. A tabela se preenche coluna a coluna no caderno da tela.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto é **20 %** de **R$ 45**?',
      fala: 'Quanto é vinte por cento de quarenta e cinco reais?',
      visual: barra({ partes: 10, pintadas: 2, rotulo: '20 %' }, 'A barra em 10 partes, 2 em âmbar, com "20 %" à direita.'),
      opcoes: [
        {
          texto: 'R$ 9', fala: 'Nove reais.', certa: true,
          explica: 'Isso. 10 % são R$ 4,50, e 20 % é o dobro: R$ 9.',
          mostra: barra({ partes: 10, pintadas: 2, rotulo: 'R$ 9' }, 'À direita, o "20 %" vira "R$ 9".'),
        },
        {
          texto: 'R$ 2,25', fala: 'Dois reais e vinte e cinco centavos.', erro: 'divide-pelo-numero-da-porcentagem',
          explica: '$45 \\div 20$ dá menos que os 10 % (R$ 4,50). 20 % são duas partes de 10 %: R$ 9.',
          mostra: barra({ partes: 10, pintadas: 2, rotulo: 'R$ 9' }, 'As 2 partes de R$ 4,50: R$ 9.'),
        },
        {
          texto: 'R$ 20', fala: 'Vinte reais.', erro: 'porcentagem-como-numero-inteiro',
          explica: 'R$ 20 é quase a metade de R$ 45. 20 % são só 2 partes de 10: R$ 9.',
          mostra: barra({ partes: 10, pintadas: 2, rotulo: 'R$ 9' }, 'As 2 partes em âmbar, longe da metade da barra: R$ 9.'),
        },
      ],
      esboco: 'A isca "20 % é dividir por 20" se desmonta comparando com 10 %: 20 % tem de ser mais.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: quanto é **35 %** de **R$ 200**, em reais?',
      fala: 'No papel: quanto é trinta e cinco por cento de duzentos reais, em reais?',
      resposta: 70,
      resolucao: [
        { tex: '10\\,\\% \\text{ de } 200 = 20', fala: 'dez por cento de duzentos: vinte' },
        { tex: '30\\,\\% \\text{ de } 200 = 3 \\times 20 = 60', fala: 'trinta por cento: três vezes vinte, sessenta' },
        { tex: '5\\,\\% \\text{ de } 200 = 20 \\div 2 = 10', fala: 'cinco por cento: a metade de vinte, dez' },
        { tex: '35\\,\\% \\text{ de } 200 = 60 + 10 = 70', fala: 'trinta e cinco por cento: sessenta mais dez, setenta reais' },
      ],
      esboco: 'Montar 35 % com 3 vezes 10 % e mais 5 %. Outro caminho vale: 25 % (R$ 50) + 10 % (R$ 20).',
    },
    {
      tipo: 'sua-vez',
      geradores: ['porcentagem-de-valor-n1', 'porcentagem-de-valor-n2', 'porcentagem-de-valor-n3'],
      esboco: 'Nível 1: 10 % ou 50 % de um valor redondo, com a barra. Nível 2: 1 %, 5 %, 20 % e 25 %, com a tabela. Nível 3: 15 %, 30 %, 35 %, 12 %… numa situação, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'A gorjeta é **R$ 8**: 10 % é a conta ÷ 10. Na próxima aula: o preço depois do desconto, numa conta só.',
      fala: 'A gorjeta é oito reais: dez por cento é a conta dividida por dez. Na próxima aula: o preço depois do desconto, numa conta só.',
      visual: barra({ partes: 10, pintadas: 1, rotulo: 'R$ 8' }, 'A barra da conta em 10 partes, a primeira em âmbar, com "R$ 8" à direita.'),
      esboco: 'Responde ao gancho com a barra cortada.',
    },
  ],
}
