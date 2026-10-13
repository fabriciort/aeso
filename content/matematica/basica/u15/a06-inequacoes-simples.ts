import type { Aula, Visual } from '@/lib/formation/schema'

// Inequações simples. Uma caixa e 3 kg pesam mais que 7 kg: a balança
// inclina, e o lado do x desce. x + 3 > 7 não tem uma solução só: com 4 a
// balança fica reta (empate), com 2 o outro prato desce, e com 5, 6, 4,5 ou
// 10 o prato do x desce. As soluções são todos os números maiores que 4:
// x > 4, uma semirreta, com a bolinha do 4 vazia. O momento-chave: tirar o
// mesmo dos dois pratos (ou partir os dois em grupos iguais) não muda qual
// prato pesa mais. A balança continua inclinada para o mesmo lado, e a
// inequação se resolve como a equação: x + 3 > 7 vira x > 4; 2x > 8 vira
// x > 4. A missão fecha a unidade: com R$ 10 guardados e R$ 15 por mês,
// quando o cofre passa de R$ 100? 10 + 15x > 100, x > 6: no 7º mês.
//
// Fica de fora o cuidado com multiplicar ou dividir por um número negativo
// (que vira o sinal): na balança só há peças positivas, e sem uma imagem
// seria uma regra decorada. Ele volta quando as inequações voltarem.

const balanca = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'balanca', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** x + 3 contra 7, comparados com > ou <. */
const CAIXA = { esquerda: { x: 1, n: 3 }, direita: { n: 7 }, inequacao: true, mostraEquacao: true }
/** A caixa aberta com um peso: a balança inclina pelo peso de verdade. */
const comPeso = (v: number, esboco: string) => balanca({ ...CAIXA, valor: v, abrir: true }, esboco)

/** As soluções de x > 4 na reta: o 4 com a bolinha vazia, os inteiros de 5 a 10 acesos. */
const MAIOR_QUE_4 = reta({ de: 0, ate: 10, passo: 1, marcas: [0, 4, 10], aproximado: 4, numeros: [5, 6, 7, 8, 9, 10], comparacao: 'x > 4' }, 'A reta de 0 a 10. No 4, uma bolinha vazia (o 4 não entra); de 5 a 10, pontos âmbar. Embaixo, x > 4. Entre os pontos também há soluções: 4,5, 7,2...')

/** O cofre mês a mês: R$ 10 mais R$ 15 por mês. */
const cofre = (destaque: number[], esboco: string): Visual => ({
  modelo: 'livre',
  estado: { tabela: { linhas: [{ rotulo: 'meses', valores: [5, 6, 7] }, { rotulo: 'no cofre (R$)', valores: [85, 100, 115] }], destaque } },
  esboco,
})

export const aula: Aula = {
  id: 'B.U15.A6',
  titulo: 'Inequações simples',
  objetivo: 'Resolver inequações simples como x + 3 > 7 e 3x + 2 < 14, fazendo a mesma operação dos dois lados, entender que elas têm muitas soluções (x > 4), marcá-las na reta e responder problemas como "em quantos meses passa de R$ 100".',
  modelo: 'balanca',
  esboco: 'Abre com a balança inclinada: uma caixa e 3 kg pesam mais que 7 kg. O aluno testa pesos na caixa (2, 4 e 6 kg) e vê a balança subir, ficar reta ou descer. Descobre que muitos pesos servem: todo peso maior que 4, x > 4, e a reta mostra isso com a bolinha do 4 vazia. Momento-chave: tirar 3 dos dois pratos não muda o lado que desce, e partir 2x > 8 em dois grupos deixa x > 4. Depois, 3x + 2 < 14 no passo a passo e a missão do cofre, que fecha a unidade.',
  vega: 'Ideia central: uma inequação compara dois lados com > ou <, como uma balança inclinada (o lado que desce é o maior). Ela tem muitas soluções: todo número que deixa a comparação verdadeira. Resolve-se como a equação, fazendo a mesma operação dos dois lados: tirar ou somar o mesmo número, ou dividir pelo mesmo número positivo, não muda o lado que pesa mais. x + 3 > 7 vira x > 4: 4,5, 5 e 10 servem, o 4 não (empate). Na reta, a bolinha do 4 fica vazia. Ficou de fora a divisão por um número negativo, que vira o sinal (−2x > 6 dá x < −3); se o aluno perguntar, mostre com números: −2 · (−4) = 8 > 6, e −4 < −3. Erros esperados: responder só um número (x = 4), contar a borda (o 4 em x > 4; 6 meses no cofre), virar o sinal sem motivo (x < 4), esquecer o que já está guardado (15x > 100). Guie com "Teste o 4: dá empate ou passa?", "Qual prato desce?", "Em 6 meses o cofre tem quanto?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma caixa e mais **3 kg** pesam **mais** que 7 kg: o prato dela desceu. Quanto pode pesar a caixa?',
      fala: 'Uma caixa e mais três quilos pesam mais que sete quilos: o prato dela desceu. Quanto pode pesar a caixa?',
      visual: balanca({ ...CAIXA, inclina: 'esquerda' }, 'A balança inclinada: à esquerda, 1 caixa e 3 pesos, mais baixa; à direita, 7 pesos, mais alta. Embaixo, x + 3 > 7, com o > em azul.'),
      esboco: 'A balança que não fica reta. A pergunta é "quanto pode", não "quanto é": a resposta vai ser mais de um número.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Qual destes pode ser o peso da caixa?',
      visual: balanca({ ...CAIXA, inclina: 'esquerda' }, 'A mesma balança inclinada.'),
      opcoes: [
        {
          texto: '2 kg', erro: 'inequacao-sentido-trocado',
          explica: 'Com 2 kg, o prato do x pesa ${2 + 3 = 5}$, menos que 7. Ele subiria.',
          fala: 'Com dois quilos, o prato do x pesa dois mais três, cinco, menos que sete. Ele subiria.',
          mostra: comPeso(2, 'A caixa se abre com 2 dentro: o prato da direita desce. Embaixo, x + 3 < 7.'),
        },
        {
          texto: '4 kg', erro: 'inequacao-como-equacao',
          explica: 'Com 4 kg, ${4 + 3 = 7}$: empate. A balança fica reta, e o prato tinha de descer.',
          fala: 'Com quatro quilos, quatro mais três, sete: empate. A balança fica reta, e o prato tinha de descer.',
          mostra: comPeso(4, 'A caixa se abre com 4 dentro: a balança fica reta. Embaixo, x + 3 = 7.'),
        },
        {
          texto: '6 kg', certa: true,
          explica: 'Isso. ${6 + 3 = 9}$, mais que 7: o prato do x desce.',
          fala: 'Isso. Seis mais três, nove, mais que sete: o prato do x desce.',
          mostra: comPeso(6, 'A caixa se abre com 6 dentro: o prato da esquerda desce. Embaixo, x + 3 > 7.'),
        },
      ],
      esboco: 'Cada escolha abre a caixa com aquele peso, e a balança se move de verdade: sobe, fica reta ou desce. O 4 é a borda.',
    },
    {
      tipo: 'aposta',
      pergunta: '6 kg serve. Quantos pesos servem?',
      fala: 'Seis quilos serve. Quantos pesos servem?',
      visual: comPeso(6, 'A caixa aberta com 6, o prato da esquerda embaixo.'),
      opcoes: [
        {
          texto: 'Só o 6', erro: 'inequacao-como-equacao',
          explica: 'Com 5 também desce: ${5 + 3 = 8}$. E com 4,5, e com 10. Todo peso **maior que 4** serve.',
          fala: 'Com cinco também desce: cinco mais três, oito. E com quatro e meio, e com dez. Todo peso maior que quatro serve.',
          mostra: MAIOR_QUE_4,
        },
        {
          texto: 'Todo peso maior que 4', certa: true,
          explica: 'Isso. 5, 4,5 e 10 servem. O 4 não: dá empate. Na reta, a bolinha do 4 fica vazia.',
          fala: 'Isso. Cinco, quatro e meio e dez servem. O quatro não: dá empate. Na reta, a bolinha do quatro fica vazia.',
          mostra: MAIOR_QUE_4,
        },
      ],
      esboco: 'A virada: não é um número, é uma semirreta. A reta da unidade 12 mostra os inteiros de 5 em diante, e o 4 com a bolinha vazia.',
    },
    {
      tipo: 'aposta',
      pergunta: 'De volta à balança: tire 3 kg de cada prato. Como ela fica?',
      fala: 'De volta à balança: tire três quilos de cada prato. Como ela fica?',
      visual: balanca({ ...CAIXA, inclina: 'esquerda' }, 'A balança inclinada do começo, x + 3 > 7.'),
      opcoes: [
        {
          texto: 'Fica reta', erro: 'inequacao-como-equacao',
          explica: 'Os dois pratos perderam o mesmo peso. Quem pesava mais continua pesando mais.',
          fala: 'Os dois pratos perderam o mesmo peso. Quem pesava mais continua pesando mais.',
          mostra: balanca({ esquerda: { x: 1 }, direita: { n: 4 }, riscadas: { esquerda: { n: 3 }, direita: { n: 3 } }, inclina: 'esquerda', inequacao: true, mostraEquacao: true }, 'Os 3 pesos de cada prato saem riscados. A balança continua inclinada para a esquerda: x > 4.'),
        },
        {
          texto: 'O prato do x continua embaixo', certa: true,
          explica: 'Isso. Tirar o mesmo dos dois lados não muda quem pesa mais: ${x > 4}$.',
          fala: 'Isso. Tirar o mesmo dos dois lados não muda quem pesa mais: x maior que quatro.',
          mostra: balanca({ esquerda: { x: 1 }, direita: { n: 4 }, riscadas: { esquerda: { n: 3 }, direita: { n: 3 } }, inclina: 'esquerda', inequacao: true, mostraEquacao: true }, 'Os 3 pesos de cada prato saem riscados. A balança continua inclinada para a esquerda: x > 4.'),
        },
        {
          texto: 'O prato do x sobe', erro: 'inequacao-sentido-trocado',
          explica: 'Os dois perderam 3 kg. A diferença entre eles não mudou: o prato do x continua embaixo.',
          fala: 'Os dois perderam três quilos. A diferença entre eles não mudou: o prato do x continua embaixo.',
          mostra: balanca({ esquerda: { x: 1 }, direita: { n: 4 }, riscadas: { esquerda: { n: 3 }, direita: { n: 3 } }, inclina: 'esquerda', inequacao: true, mostraEquacao: true }, 'Os 3 pesos de cada prato saem riscados. A balança continua inclinada para a esquerda: x > 4.'),
        },
      ],
      esboco: 'Prever antes de ver: a mesma operação dos dois lados mantém a inclinação, como mantinha o equilíbrio.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora **2 caixas** pesam mais que 8 kg: ${2x > 8}$. Parta cada prato em 2 e fique com um grupo.',
      fala: 'Agora duas caixas pesam mais que oito quilos: dois x maior que oito. Parta cada prato em dois e fique com um grupo.',
      visual: balanca({ esquerda: { x: 2 }, direita: { n: 8 }, inclina: 'esquerda', inequacao: true, mostraEquacao: true, dividir: 2 }, 'A balança inclinada para a esquerda, 2x > 8, com cada prato partido em 2 grupos: uma caixa em cada grupo da esquerda, 4 pesos em cada grupo da direita.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque num dos grupos com a borda tracejada.',
        sucesso: { dividido: true },
        mostre: 'Fica um grupo de cada lado: 1 caixa contra 4 pesos, ainda inclinada. Embaixo, x > 4.',
      },
      descoberta: 'Metade de cada prato continua com o lado do x mais pesado: 2x > 8 vira x > 4. Dividir os dois lados pelo mesmo número positivo não muda o sentido.',
      esboco: 'O momento-chave na mão do aluno: a balança partida continua inclinada para o mesmo lado. A inequação se resolve como a equação.',
    },
    {
      tipo: 'anote',
      titulo: 'Inequação',
      definicao: 'Uma **inequação** compara dois lados com > ou <. As soluções são **todos** os números que deixam a comparação verdadeira.',
      exemplo: { tex: 'x + 3 > 7 \\;\\to\\; x > 4', fala: 'x mais três maior que sete; tirando três dos dois lados, x maior que quatro' },
      alerta: '${x > 4}$ não inclui o 4: com 4, os dois lados ficam iguais. Na reta, a bolinha do 4 fica vazia.',
      esboco: 'Na página: a balança inclinada (o lado que desce é o maior), x + 3 > 7, x > 4, e a reta com a bolinha vazia no 4 e a seta para a direita.',
    },
    {
      tipo: 'passo',
      problema: 'Agora o outro prato desceu: ${3x + 2 < 14}$. Resolva na balança.',
      fala: 'Agora o outro prato desceu: três x mais dois menor que catorze. Resolva na balança.',
      visual: balanca({ esquerda: { x: 3, n: 2 }, direita: { n: 14 }, inclina: 'direita', inequacao: true, mostraEquacao: true }, 'A balança inclinada para a direita: 3 caixas e 2 pesos sobem, 14 pesos descem. Embaixo, 3x + 2 < 14.'),
      passos: [
        {
          pergunta: 'Tire 2 de cada prato. O que sobra?',
          fala: 'Tire dois de cada prato. O que sobra?',
          opcoes: [
            {
              texto: '$3x < 12$', certa: true,
              explica: 'Isso. Os dois pratos perderam 2, e o da direita continua embaixo.',
              fala: 'Isso. Os dois pratos perderam dois, e o da direita continua embaixo.',
              mostra: balanca({ esquerda: { x: 3 }, direita: { n: 12 }, riscadas: { esquerda: { n: 2 }, direita: { n: 2 } }, inclina: 'direita', inequacao: true, mostraEquacao: true }, 'Os 2 pesos de cada prato saem riscados. Embaixo, 3x < 12.'),
            },
            {
              texto: '$3x < 14$', erro: 'opera-so-de-um-lado',
              explica: 'Os 2 saíram só da esquerda. Tire também da direita: ${14 - 2 = 12}$.',
              fala: 'Os dois saíram só da esquerda. Tire também da direita: catorze menos dois, doze.',
              mostra: balanca({ esquerda: { x: 3 }, direita: { n: 12 }, riscadas: { esquerda: { n: 2 }, direita: { n: 2 } }, inclina: 'direita', inequacao: true, mostraEquacao: true }, 'Os 2 pesos saem riscados dos dois pratos: 3x < 12.'),
            },
          ],
          linha: { tex: '3x < 12', fala: 'três x menor que doze' },
        },
        {
          pergunta: 'Parta cada prato em 3 grupos e fique com um. O que sobra?',
          fala: 'Parta cada prato em três grupos e fique com um. O que sobra?',
          opcoes: [
            {
              texto: '$x < 4$', certa: true,
              explica: 'Isso. Uma caixa pesa menos que 4: ${12 \\div 3 = 4}$.',
              fala: 'Isso. Uma caixa pesa menos que quatro: doze dividido por três, quatro.',
              mostra: balanca({ esquerda: { x: 3 }, direita: { n: 12 }, inclina: 'direita', dividir: 3, rotulo: 'x < 4' }, 'Cada prato partido em 3 grupos, um aceso de cada lado: 1 caixa contra 4 pesos. Embaixo, x < 4.'),
            },
            {
              texto: '$x < 9$', erro: 'subtrai-o-coeficiente',
              explica: '${3x}$ são 3 caixas, não x mais 3. Partindo em 3 grupos, cada caixa fica com 4 pesos: ${x < 4}$.',
              fala: 'Três x são três caixas, não x mais três. Partindo em três grupos, cada caixa fica com quatro pesos: x menor que quatro.',
              mostra: balanca({ esquerda: { x: 3 }, direita: { n: 12 }, inclina: 'direita', dividir: 3, rotulo: 'x < 4' }, 'Cada prato partido em 3 grupos: 1 caixa contra 4 pesos. Embaixo, x < 4.'),
            },
          ],
          linha: { tex: 'x < 4', fala: 'x menor que quatro' },
        },
        {
          pergunta: 'Qual destes números é solução de ${x < 4}$?',
          fala: 'Qual destes números é solução de x menor que quatro?',
          opcoes: [
            {
              texto: '3', certa: true,
              explica: 'Isso. Confira: ${3 \\cdot 3 + 2 = 11}$, menos que 14. O 0 e o −1 também servem.',
              fala: 'Isso. Confira: três vezes três mais dois, onze, menos que catorze. O zero e o menos um também servem.',
              mostra: reta({ de: -3, ate: 6, passo: 1, marcas: [-3, 0, 4, 6], sinais: true, aproximado: 4, numeros: [-3, -2, -1, 0, 1, 2, 3], comparacao: 'x < 4' }, 'A reta de −3 a 6, com os sinais da unidade 12. No 4, a bolinha vazia; de −3 a 3, pontos acesos. Embaixo, x < 4.'),
            },
            {
              texto: '4', erro: 'inequacao-inclui-a-borda',
              explica: 'Com 4: ${3 \\cdot 4 + 2 = 14}$. Empate, não é menos que 14. O 4 fica de fora.',
              fala: 'Com quatro: três vezes quatro mais dois, catorze. Empate, não é menos que catorze. O quatro fica de fora.',
              mostra: reta({ de: -3, ate: 6, passo: 1, marcas: [-3, 0, 4, 6], sinais: true, aproximado: 4, numeros: [-3, -2, -1, 0, 1, 2, 3], comparacao: 'x < 4' }, 'A reta com a bolinha vazia no 4 e os pontos de −3 a 3.'),
            },
            {
              texto: '5', erro: 'inequacao-sentido-trocado',
              explica: 'Com 5: ${3 \\cdot 5 + 2 = 17}$, mais que 14. As soluções ficam à esquerda do 4.',
              fala: 'Com cinco: três vezes cinco mais dois, dezessete, mais que catorze. As soluções ficam à esquerda do quatro.',
              mostra: reta({ de: -3, ate: 6, passo: 1, marcas: [-3, 0, 4, 6], sinais: true, aproximado: 4, numeros: [-3, -2, -1, 0, 1, 2, 3], comparacao: 'x < 4' }, 'A reta com a bolinha vazia no 4 e os pontos à esquerda dele.'),
            },
          ],
          linha: { tex: '3 \\cdot 3 + 2 = 11 < 14', fala: 'três vezes três mais dois, onze, menor que catorze' },
        },
      ],
      esboco: 'A mesma resolução da equação, agora com a balança inclinada para a direita. No fim, a reta com os negativos da unidade 12: as soluções vão para a esquerda, sem fim.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: resolva ${2x + 5 > 17}$. Qual é o **menor número inteiro** que é solução?',
      fala: 'No papel: resolva dois x mais cinco maior que dezessete. Qual é o menor número inteiro que é solução?',
      resposta: 7,
      sinal: true,
      resolucao: [
        { tex: '2x > 12 \\qquad (-5 \\text{ dos dois lados})', fala: 'tirando cinco dos dois lados, dois x maior que doze' },
        { tex: 'x > 6 \\qquad (\\div 2 \\text{ dos dois lados})', fala: 'dividindo os dois lados por dois, x maior que seis' },
        { tex: '\\text{o 6 não entra: } 2 \\cdot 6 + 5 = 17', fala: 'o seis não entra: dois vezes seis mais cinco dá dezessete, empate' },
        { tex: '\\text{menor inteiro: } 7 \\qquad 2 \\cdot 7 + 5 = 19 > 17', fala: 'o menor inteiro é sete: dois vezes sete mais cinco, dezenove, maior que dezessete' },
      ],
      esboco: 'Resolver e cuidar da borda: o 6 empata, o 7 é o primeiro inteiro que passa.',
    },
    {
      tipo: 'passo',
      problema: 'Missão: você já tem **R$ 10** no cofre e guarda **R$ 15** por mês. Em quantos meses o cofre passa de **R$ 100**?',
      fala: 'Missão: você já tem dez reais no cofre e guarda quinze reais por mês. Em quantos meses o cofre passa de cem reais?',
      visual: expr(['já tem R$ 10', 'guarda R$ 15 por mês', 'passar de R$ 100'], 'Os dados do cofre em três linhas; a última, maior.'),
      passos: [
        {
          pergunta: 'Com x meses, o cofre tem ${10 + 15x}$. Qual é a inequação?',
          fala: 'Com x meses, o cofre tem dez mais quinze x. Qual é a inequação?',
          opcoes: [
            {
              texto: '$10 + 15x > 100$', certa: true,
              explica: 'Isso. Passar de 100 é ficar **maior** que 100.',
              fala: 'Isso. Passar de cem é ficar maior que cem.',
              mostra: expr(['já tem R$ 10', 'guarda R$ 15 por mês', '10 + 15x > 100'], 'A última linha vira a inequação: 10 + 15x > 100.'),
            },
            {
              texto: '$10 + 15x = 100$', erro: 'inequacao-como-equacao',
              explica: 'Igual a 100 é chegar, não passar. Passar de 100 é ser maior: ${10 + 15x > 100}$.',
              fala: 'Igual a cem é chegar, não passar. Passar de cem é ser maior: dez mais quinze x maior que cem.',
              mostra: expr(['já tem R$ 10', 'guarda R$ 15 por mês', '10 + 15x > 100'], 'A última linha vira a inequação: 10 + 15x > 100.'),
            },
            {
              texto: '$15x > 100$', erro: 'esquece-valor-fixo',
              explica: 'Faltaram os R$ 10 que já estão no cofre: ${10 + 15x > 100}$.',
              fala: 'Faltaram os dez reais que já estão no cofre: dez mais quinze x maior que cem.',
              mostra: expr(['já tem R$ 10', 'guarda R$ 15 por mês', '10 + 15x > 100'], 'A última linha vira a inequação: 10 + 15x > 100.'),
            },
          ],
          linha: { tex: '10 + 15x > 100', fala: 'dez mais quinze x maior que cem' },
        },
        {
          pergunta: 'Tire 10 dos dois lados e divida os dois por 15. O que sobra?',
          fala: 'Tire dez dos dois lados e divida os dois por quinze. O que sobra?',
          opcoes: [
            {
              texto: '$x > 6$', certa: true,
              explica: 'Isso. ${15x > 90}$, e ${90 \\div 15 = 6}$.',
              fala: 'Isso. Quinze x maior que noventa, e noventa dividido por quinze, seis.',
              mostra: expr(['10 + 15x > 100', '15x > 90', 'x > 6'], 'A conta desce em três linhas: 10 + 15x > 100, 15x > 90 e x > 6, maior.'),
            },
            {
              texto: '$x > 75$', erro: 'subtrai-o-coeficiente',
              explica: '${15x}$ é 15 vezes x. Divida os dois lados por 15: ${90 \\div 15 = 6}$.',
              fala: 'Quinze x é quinze vezes x. Divida os dois lados por quinze: noventa dividido por quinze, seis.',
              mostra: expr(['10 + 15x > 100', '15x > 90', 'x > 6'], 'A conta em três linhas, terminando em x > 6.'),
            },
          ],
          linha: { tex: '15x > 90 \\;\\to\\; x > 6', fala: 'quinze x maior que noventa, x maior que seis' },
        },
        {
          pergunta: 'Então, em quantos meses o cofre passa de R$ 100?',
          fala: 'Então, em quantos meses o cofre passa de cem reais?',
          opcoes: [
            {
              texto: '6 meses', erro: 'inequacao-inclui-a-borda',
              explica: 'Em 6 meses, ${10 + 90 = 100}$: chega a 100, mas não passa. Só no 7º mês.',
              fala: 'Em seis meses, dez mais noventa, cem: chega a cem, mas não passa. Só no sétimo mês.',
              mostra: cofre([1], 'A tabela do cofre: 5, 6 e 7 meses, com R$ 85, R$ 100 e R$ 115. A coluna do 6 acende: R$ 100, ainda não passou.'),
            },
            {
              texto: '7 meses', certa: true,
              explica: 'Isso. Em 7 meses: ${10 + 105 = 115}$. É o primeiro mês que passa de 100.',
              fala: 'Isso. Em sete meses: dez mais cento e cinco, cento e quinze. É o primeiro mês que passa de cem.',
              mostra: cofre([2], 'A tabela do cofre: 5, 6 e 7 meses, com R$ 85, R$ 100 e R$ 115. A coluna do 7 acende: R$ 115.'),
            },
          ],
          linha: { tex: '7 \\text{ meses: } 10 + 15 \\cdot 7 = 115 > 100', fala: 'sete meses: dez mais quinze vezes sete, cento e quinze, maior que cem' },
        },
      ],
      esboco: 'A missão junta a unidade: montar a partir da história (aula 5), resolver fazendo o mesmo dos dois lados e cuidar da borda. A tabela mostra o 6 empatando e o 7 passando.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['inequacao-n1', 'inequacao-n2', 'inequacao-n3'],
      esboco: 'Nível 1: escolher a solução de x + a > b ou x + a < b, com a balança inclinada. Nível 2: o menor (ou o maior) inteiro que é solução de ax + b > c ou ax + b < c. Nível 3: o cofre e o plano de celular, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A caixa pesa **mais de 4 kg**: ${x > 4}$. Você fechou a unidade: monta, resolve e confere equações, e sabe ler a balança inclinada.',
      fala: 'A caixa pesa mais de quatro quilos: x maior que quatro. Você fechou a unidade: monta, resolve e confere equações, e sabe ler a balança inclinada.',
      visual: MAIOR_QUE_4,
      esboco: 'Responde ao gancho com a reta das soluções e fecha a unidade 15.',
    },
  ],
}
