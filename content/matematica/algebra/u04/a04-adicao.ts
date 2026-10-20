import type { Aula, Visual } from '@/lib/formation/schema'

// Adição. As duas retas da aula 2 voltam: x + y = 10 (a das 10 frutas) e
// agora x − y = 4, que se cruzam em (7, 3). Cada equação é uma balança em
// equilíbrio; somadas, lado com lado, continuam em equilíbrio. No Mexa
// somar, o +y e o −y se anulam: 2x = 14. O momento-chave é ver a letra
// sumir na soma. Depois, um sistema em que nada some (x + 2y = 7 e
// x + y = 5): multiplicar a segunda inteira por −1, os dois lados, antes de
// somar. Um passo a passo com × (−2), o anote, e a escolha entre a
// substituição e a adição.

const sis = (sistema: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { sistema }, esboco })
const plano = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'plano', estado, esboco })

const RETAS = [{ equacao: 'x + y = 10' }, { equacao: 'x − y = 4' }]
const PLANO = plano({ retas: RETAS }, 'As retas x + y = 10 (âmbar, a das 10 frutas) e x − y = 4 (azul), sem o ponto do cruzamento.')
const PLANO_CRUZA = plano({ retas: RETAS, cruzamento: true, conferir: true }, 'As mesmas retas, agora com o cruzamento (7, 3) e embaixo a conferência: 7 + 3 = 10 ✓ e 7 − 3 = 4 ✓.')

const DEZ = ['x + y = 10', 'x − y = 4']
const DEZ_SOLTO = sis({ equacoes: DEZ }, 'As duas equações, uma embaixo da outra: x sobre x, y sobre y, = sobre =. x em âmbar, y em azul.')
const DEZ_SOMA = sis({ equacoes: DEZ, somado: true }, 'Um + à esquerda e o traço: o +y e o −y riscados em rosa, e embaixo 2x = 14.')

const SETE = ['x + 2y = 7', 'x + y = 5']
const SETE_SOLTO = sis({ equacoes: SETE }, 'x + 2y = 7 em cima de x + y = 5.')
const SETE_SOMA = sis({ equacoes: SETE, somado: true }, 'A soma direto: nada se anula, e embaixo 2x + 3y = 12, ainda com as duas letras.')

const DEZESSEIS = ['3x + 2y = 16', 'x + y = 6']
const DZ = (extra: Record<string, unknown>, esboco: string) => sis({ equacoes: DEZESSEIS, ...extra }, esboco)

const TROCA = ['y = 2x − 1', '3x + 2y = 12']

export const aula: Aula = {
  id: 'AF.U4.A4',
  titulo: 'Adição',
  objetivo: 'Resolver um sistema somando as duas equações para uma letra sumir (x + y = 10 e x − y = 4 dão 2x = 14), multiplicar uma equação inteira antes quando nenhuma letra some, achar a outra letra e conferir nas duas; e escolher entre a substituição e a adição.',
  modelo: 'livre',
  esboco: 'Abre no plano com as retas x + y = 10 e x − y = 4: dá para achar o cruzamento sem desenhar? A aposta pergunta o que acontece com o y se somar as duas. Momento-chave: o Mexa somar, em que +y e −y se riscam e sobra 2x = 14. O passo a passo termina: x = 7, y = 3, e confere nas duas (o plano volta, com o cruzamento). Depois, x + 2y = 7 e x + y = 5: somar direto não tira nenhuma letra (aposta); o Mexa multiplica a segunda por −1 e soma. Um passo a passo com × (−2) nos dois lados. O anote. A aposta da escolha: com y = 2x − 1, a substituição é mais curta. O caderno: 2x + y = 11 e x − y = 1. O fecho volta ao plano.',
  vega: 'Ideia central: cada equação é uma balança em equilíbrio. Somar o lado esquerdo de uma com o da outra, e o direito com o direito, mantém o equilíbrio: (x + y) + (x − y) = 10 + 4. Quando uma letra aparece com sinais opostos (+y e −y), ela some na soma e sobra uma equação com uma letra só. Quando nenhuma some, multiplica-se uma equação INTEIRA (os dois lados) por um número que deixe os coeficientes opostos: x + y = 5 vezes −1 é −x − y = −5. Depois de achar uma letra, volta-se a uma das equações para achar a outra, e confere-se o par nas DUAS. Escolher: se uma equação já diz quanto vale uma letra (y = 2x − 1), a substituição é mais curta; se há opostos, ou se um × resolve, a adição. Erros esperados: achar que +y e −y dão 2y; somar quando nada some; multiplicar só o lado das letras (−2x − 2y = 6); multiplicar só um termo; parar no x; esquecer de dividir no 2x = 14. Guie com "O que acontece com +y e −y?", "Por quanto multiplicar para ficar o oposto?", "Você multiplicou o número também?", "E o y?", "Confira nas duas".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'As retas ${x + y = 10}$ e ${x - y = 4}$ se cruzam num ponto. Dá para achar esse par só com contas, sem desenhar?',
      fala: 'As retas x mais y igual a dez e x menos y igual a quatro se cruzam num ponto. Dá para achar esse par só com contas, sem desenhar?',
      visual: PLANO,
      esboco: 'A reta das 10 frutas volta, com outra. O ponto do cruzamento ainda não aparece.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Some as duas equações, lado com lado: ${x + y}$ com ${x - y}$, e 10 com 4. O que acontece com o y?',
      fala: 'Some as duas equações, lado com lado: x mais y com x menos y, e dez com quatro. O que acontece com o y?',
      visual: DEZ_SOLTO,
      opcoes: [
        {
          texto: 'Fica $2y$, como o $2x$', erro: 'termo-perde-o-sinal',
          explica: 'O segundo y vem com o menos: ${y + (-y) = 0}$. Já o x vem com mais nos dois: ${x + x = 2x}$.',
          fala: 'O segundo y vem com o menos: y mais menos y dá zero. Já o x vem com mais nos dois: x mais x dá dois x.',
          mostra: DEZ_SOLTO,
        },
        {
          texto: 'O y some: $+y$ e $-y$ dão zero', certa: true,
          explica: 'Isso. Sobra uma letra só. Toque para ver a soma.',
          fala: 'Isso. Sobra uma letra só. Toque para ver a soma.',
          mostra: DEZ_SOLTO,
        },
      ],
      esboco: 'As duas equações empilhadas. A previsão antes da soma: o y vem com sinais opostos.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada equação é uma balança em equilíbrio. Duas balanças somadas continuam em equilíbrio.',
      fala: 'Cada equação é uma balança em equilíbrio. Duas balanças somadas continuam em equilíbrio.',
      visual: DEZ_SOLTO,
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nas equações para somar uma com a outra.',
        sucesso: { somado: true },
        mostre: 'O +y e o −y se anulam: sobra 2x = 14.',
      },
      descoberta: 'Somando, o y some: (x + y) + (x − y) = 10 + 4, e sobra 2x = 14.',
      esboco: 'O momento-chave: o + pisca, o traço desce, o +y e o −y ficam riscados em rosa, e embaixo aparece 2x = 14.',
    },
    {
      tipo: 'passo',
      problema: 'Sobrou ${2x = 14}$. Termine o sistema.',
      fala: 'Sobrou dois x igual a catorze. Termine o sistema.',
      visual: DEZ_SOMA,
      passos: [
        {
          pergunta: 'De ${2x = 14}$:',
          fala: 'De dois x igual a catorze:',
          opcoes: [
            { texto: '$x = 12$', erro: 'subtrai-o-coeficiente', explica: '2x é 2 vezes x. Desfaz-se dividindo: ${14 \\div 2}$.', fala: 'Dois x é duas vezes x. Desfaz-se dividindo: catorze dividido por dois.', mostra: DEZ_SOMA },
            { texto: '$x = 28$', erro: 'desfaz-com-a-mesma-operacao', explica: 'Multiplicar não desfaz um vezes. Com x = 28, 2x daria 56.', fala: 'Multiplicar não desfaz um vezes. Com x igual a vinte e oito, dois x daria cinquenta e seis.', mostra: DEZ_SOMA },
            { texto: '$x = 7$', certa: true, explica: 'Isso. Dois x valem 14; um x vale 7.', fala: 'Isso. Dois x valem catorze; um x vale sete.', mostra: DEZ_SOMA },
          ],
          linha: { tex: '2x = 14 \\Rightarrow x = 7', fala: 'dois x igual a catorze, então x igual a sete' },
        },
        {
          pergunta: 'E o y?',
          opcoes: [
            { texto: 'Pronto: a resposta é $x = 7$', erro: 'esquece-a-segunda-letra', explica: 'O sistema pede um par. Ponha o 7 numa das equações para achar o y.', fala: 'O sistema pede um par. Ponha o sete numa das equações para achar o y.', mostra: DEZ_SOMA },
            { texto: '$7 + y = 10$, então $y = 3$', certa: true, explica: 'Isso. Qualquer uma das duas serve para achar o y.', fala: 'Isso. Sete mais y igual a dez, então y igual a três. Qualquer uma das duas serve.', mostra: DEZ_SOMA },
          ],
          linha: { tex: '7 + y = 10 \\Rightarrow y = 3', fala: 'sete mais y igual a dez, então y igual a três' },
        },
        {
          pergunta: 'Para conferir o par (7, 3):',
          fala: 'Para conferir o par sete, três:',
          opcoes: [
            { texto: 'Basta uma: $7 + 3 = 10$', erro: 'par-so-de-uma-equacao', explica: 'Muitos pares servem a uma equação só. A solução tem de servir às duas.', fala: 'Muitos pares servem a uma equação só. A solução tem de servir às duas.', mostra: DEZ_SOMA },
            { texto: 'Nas duas: $7 + 3 = 10$ e $7 - 3 = 4$', certa: true, explica: 'Isso. E (7, 3) é onde as retas se cruzam.', fala: 'Isso. Sete mais três, dez, e sete menos três, quatro. E sete, três é onde as retas se cruzam.', mostra: PLANO_CRUZA },
          ],
          linha: { tex: '7 + 3 = 10 \\ \\checkmark \\quad 7 - 3 = 4 \\ \\checkmark', fala: 'sete mais três dá dez, certo; sete menos três dá quatro, certo' },
        },
      ],
      esboco: 'A soma continua no palco enquanto o caderno se escreve. Na conferência, o plano volta com o cruzamento (7, 3) e as duas contas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora ${x + 2y = 7}$ e ${x + y = 5}$. Somando as duas como estão, o que sobra?',
      fala: 'Agora x mais dois y igual a sete e x mais y igual a cinco. Somando as duas como estão, o que sobra?',
      visual: SETE_SOLTO,
      opcoes: [
        {
          texto: '$3y = 12$: o x some', erro: 'soma-sem-sumir-letra',
          explica: '${x + x}$ dá ${2x}$, não zero. Para sumir, um tem de ser x e o outro, −x.',
          fala: 'x mais x dá dois x, não zero. Para sumir, um tem de ser x e o outro, menos x.',
          mostra: SETE_SOMA,
        },
        {
          texto: '$2x + 3y = 12$: nenhuma letra some', certa: true,
          explica: 'Isso. A soma ainda tem as duas letras. Não ajudou.',
          fala: 'Isso. Dois x mais três y igual a doze: a soma ainda tem as duas letras. Não ajudou.',
          mostra: SETE_SOMA,
        },
      ],
      esboco: 'Somar direto não serve: a linha da soma tem 2x + 3y, nada riscado.',
    },
    {
      tipo: 'mexa',
      texto: 'Vire a segunda do avesso: ${x + y = 5}$ vezes −1, nos dois lados, é ${-x - y = -5}$. Ela continua em equilíbrio.',
      fala: 'Vire a segunda do avesso: x mais y igual a cinco, vezes menos um, nos dois lados, é menos x menos y igual a menos cinco. Ela continua em equilíbrio.',
      visual: sis({ equacoes: SETE, vezes: [1, -1] }, 'As duas equações, com "× (−1)" ao lado da segunda.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para multiplicar a segunda por −1; toque de novo para somar.',
        sucesso: { somado: true },
        mostre: 'A segunda vira −x − y = −5; somadas, x e −x se anulam: sobra y = 2.',
      },
      descoberta: 'Multiplicar uma equação inteira não tira o equilíbrio, e deixa o x oposto: a soma dá y = 2.',
      esboco: 'O primeiro toque troca os sinais da segunda linha (o "× (−1)" fica apagado); o segundo soma: x e −x riscados, sobra y = 2.',
    },
    {
      tipo: 'passo',
      problema: 'Resolva ${3x + 2y = 16}$ e ${x + y = 6}$.',
      fala: 'Resolva três x mais dois y igual a dezesseis e x mais y igual a seis.',
      visual: DZ({}, '3x + 2y = 16 em cima de x + y = 6.'),
      passos: [
        {
          pergunta: 'Para o y sumir, multiplique a segunda por:',
          opcoes: [
            { texto: '$2$', erro: 'soma-sem-sumir-letra', explica: 'Com × 2, fica ${2y}$ e ${2y}$: somados, dão ${4y}$. O y precisa ficar oposto.', fala: 'Com vezes dois, fica dois y e dois y: somados, dão quatro y. O y precisa ficar oposto.', mostra: DZ({ vezes: [1, 2], somado: true }, 'Com × 2: a soma dá 5x + 4y = 28, nada riscado.') },
            { texto: '$-2$', certa: true, explica: 'Isso. ${2y}$ em cima e ${-2y}$ embaixo se anulam.', fala: 'Isso. Dois y em cima e menos dois y embaixo se anulam.', mostra: DZ({ vezes: [1, -2] }, 'Ao lado da segunda, "× (−2)".') },
          ],
          linha: { tex: 'x + y = 6 \\quad \\times (-2)', fala: 'x mais y igual a seis, vezes menos dois' },
        },
        {
          pergunta: '${x + y = 6}$ vezes −2 fica:',
          fala: 'x mais y igual a seis, vezes menos dois, fica:',
          opcoes: [
            { texto: '$-2x - 2y = 6$', erro: 'multiplica-so-um-lado', explica: 'O 6 também vai vezes −2. Uma balança com o dobro num prato só inclina.', fala: 'O seis também vai vezes menos dois. Uma balança com o dobro num prato só inclina.', mostra: DZ({ vezes: [1, -2] }, 'O "× (−2)" continua ao lado da segunda.') },
            { texto: '$-2x + y = -12$', erro: 'multiplica-so-um-termo', explica: 'Cada termo vai vezes −2, o y também: ${-2y}$.', fala: 'Cada termo vai vezes menos dois, o y também: menos dois y.', mostra: DZ({ vezes: [1, -2] }, 'O "× (−2)" continua ao lado da segunda.') },
            { texto: '$-2x - 2y = -12$', certa: true, explica: 'Isso. Os dois lados, termo a termo, vezes −2.', fala: 'Isso. Os dois lados, termo a termo, vezes menos dois.', mostra: DZ({ vezes: [1, -2], multiplicado: true }, 'A segunda linha vira −2x − 2y = −12; o "× (−2)" fica apagado.') },
          ],
          linha: { tex: '-2x - 2y = -12', fala: 'menos dois x menos dois y igual a menos doze' },
        },
        {
          pergunta: 'Somando com ${3x + 2y = 16}$:',
          fala: 'Somando com três x mais dois y igual a dezesseis:',
          opcoes: [
            { texto: '$x = 28$', erro: 'termo-perde-o-sinal', explica: 'O 12 de baixo vem com o menos: 16 + (−12) é 16 − 12, que dá 4.', fala: 'Dezesseis mais menos doze é dezesseis menos doze, que dá quatro.', mostra: DZ({ vezes: [1, -2], multiplicado: true }, 'As linhas multiplicadas, ainda sem a soma.') },
            { texto: '$x = 4$', certa: true, explica: 'Isso. ${3x - 2x = x}$ e ${16 - 12 = 4}$.', fala: 'Isso. Três x menos dois x dá x, e dezesseis menos doze dá quatro.', mostra: DZ({ vezes: [1, -2], somado: true }, 'A soma: 2y e −2y riscados, embaixo x = 4.') },
          ],
          linha: { tex: 'x = 4', fala: 'x igual a quatro' },
        },
        {
          pergunta: 'Com ${x = 4}$ em ${x + y = 6}$:',
          fala: 'Com x igual a quatro em x mais y igual a seis:',
          opcoes: [
            { texto: '$y = 10$', erro: 'desfaz-com-a-mesma-operacao', explica: 'Para desfazer o + 4, tira-se 4: ${6 - 4}$.', fala: 'Para desfazer o mais quatro, tira-se quatro: seis menos quatro.', mostra: DZ({ vezes: [1, -2], somado: true }, 'A soma continua.') },
            { texto: '$y = 2$', certa: true, explica: 'Isso. Confira: ${12 + 4 = 16}$ e ${4 + 2 = 6}$.', fala: 'Isso. Confira: doze mais quatro, dezesseis, e quatro mais dois, seis.', mostra: plano({ retas: [{ equacao: '3x + 2y = 16' }, { equacao: 'x + y = 6' }], cruzamento: true, conferir: true }, 'As retas 3x + 2y = 16 e x + y = 6 se cruzam em (4, 2), com a conferência nas duas.') },
          ],
          linha: { tex: '4 + y = 6 \\Rightarrow y = 2', fala: 'quatro mais y igual a seis, então y igual a dois' },
        },
      ],
      esboco: 'Escolher o fator, multiplicar os dois lados, somar, achar o y e conferir. O palco anda com a conta: o "× (−2)", as linhas multiplicadas, a soma e, no fim, o plano com o cruzamento (4, 2).',
    },
    {
      tipo: 'anote',
      titulo: 'Método da adição',
      definicao: 'Some as duas equações, lado com lado, para uma letra sumir. Se nenhuma some, multiplique antes uma equação inteira, **os dois lados**.',
      exemplo: { tex: '(x + y) + (x - y) = 10 + 4: \\ 2x = 14', fala: 'x mais y, mais x menos y, igual a dez mais quatro: dois x igual a catorze' },
      alerta: 'Achou uma letra? Ache a outra e confira o par nas duas equações.',
      esboco: 'Na página: as duas equações empilhadas, o +y e o −y riscados, 2x = 14, x = 7, y = 3 e as duas conferências.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Em ${y = 2x - 1}$ e ${3x + 2y = 12}$, qual caminho é mais curto?',
      fala: 'Em y igual a dois x menos um e três x mais dois y igual a doze, qual caminho é mais curto?',
      visual: sis({ equacoes: TROCA, trocar: 'y' }, 'A substituição armada: a caixa "2x − 1" e o y aceso em 3x + 2y = 12.'),
      opcoes: [
        {
          texto: 'Somar as duas como estão', erro: 'soma-sem-sumir-letra',
          explica: 'A primeira é ${-2x + y = -1}$. Somada com a outra, dá ${x + 3y = 11}$: nada some.',
          fala: 'A primeira é menos dois x mais y igual a menos um. Somada com a outra, dá x mais três y igual a onze: nada some.',
          mostra: sis({ equacoes: ['−2x + y = −1', '3x + 2y = 12'], somado: true }, 'A soma direto: x + 3y = 11, nada riscado.'),
        },
        {
          texto: 'Trocar o y por $(2x - 1)$', certa: true,
          explica: 'Isso. A primeira já diz quanto vale y. Fica ${7x - 2 = 12}$: x = 2 e y = 3.',
          fala: 'Isso. A primeira já diz quanto vale y. Fica sete x menos dois igual a doze: x igual a dois e y igual a três.',
          mostra: sis({ equacoes: TROCA, trocar: 'y', trocado: true }, 'A caixa voa para o lugar do y: 3x + 2(2x − 1) = 12.'),
        },
      ],
      esboco: 'Escolher o caminho: com uma letra já isolada, a substituição; com opostos (ou um × que os faça), a adição.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel, pela adição: ${2x + y = 11}$ e ${x - y = 1}$. Digite o valor de y.',
      fala: 'No papel, pela adição: dois x mais y igual a onze e x menos y igual a um. Digite o valor de y.',
      resposta: 3,
      sinal: true,
      resolucao: [
        { tex: '(2x + y) + (x - y) = 11 + 1', fala: 'dois x mais y, mais x menos y, igual a onze mais um' },
        { tex: '3x = 12 \\Rightarrow x = 4', fala: 'três x igual a doze, então x igual a quatro' },
        { tex: '4 - y = 1 \\Rightarrow y = 3', fala: 'quatro menos y igual a um, então y igual a três' },
        { tex: '8 + 3 = 11 \\ \\checkmark \\quad 4 - 3 = 1 \\ \\checkmark', fala: 'oito mais três dá onze, certo; quatro menos três dá um, certo' },
      ],
      esboco: 'Os y já são opostos: a soma direto dá 3x = 12. O aluno tem de achar o y, não parar no x.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['sistemas-adicao-n1', 'sistemas-adicao-n2', 'sistemas-adicao-n3'],
      esboco: 'Nível 1: x + y = s e x − y = d, com as equações empilhadas no palco. Nível 2: multiplicar uma equação antes (o y com coeficiente 2, 3 ou 4 numa e ±1 na outra). Nível 3: coeficientes maiores, com a pergunta por x, y ou x + y.',
    },
    {
      tipo: 'fecho',
      texto: 'Somadas, ${x + y = 10}$ e ${x - y = 4}$ deram ${2x = 14}$. O par (7, 3) é onde as retas se cruzam. A seguir: e se tudo sumir?',
      fala: 'Somadas, x mais y igual a dez e x menos y igual a quatro deram dois x igual a catorze. O par sete, três é onde as retas se cruzam. A seguir: e se tudo sumir?',
      visual: PLANO_CRUZA,
      esboco: 'Responde ao gancho: o plano com o cruzamento (7, 3) e a conferência nas duas.',
    },
  ],
}
