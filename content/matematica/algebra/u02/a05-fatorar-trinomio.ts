import type { Aula, Visual } from '@/lib/formation/schema'

// Fatorar x² + bx + c. Uma sala de área x² + 5x + 6: não há um x em todos
// os termos, e a evidência da aula anterior não serve. Os azulejos (um x², 5
// barras, 6 quadradinhos) vêm soltos. O momento-chave é o Mexa fatorar: cada
// toque arruma os 6 quadradinhos de outro jeito; o 1 × 6 pede 7 barras e não
// fecha; o 2 × 3 fecha, e aparece (x + 2)(x + 3). O 2 e o 3 fazem as duas
// contas: produto 6, soma 5. Um segundo caso, x² + 7x + 12, com três
// arrumações. Depois, com sinais, só na conta, sem peças: x² − x − 6.

const az = (azulejos: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos }, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

const SALA_SOLTA = az({ fatorar: [5, 6] }, 'Os azulejos de x² + 5x + 6, soltos: o x², as 5 barras ao lado e os 6 quadradinhos embaixo. Embaixo, x² + 5x + 6.')
const SALA_1x6 = az({ fatorar: [5, 6], arranjo: [1, 6] }, 'Os 6 quadradinhos numa fila de 1 por 6: o contorno pede 7 barras, e há 5. Duas vagas tracejadas, "faltam 2 barras".')
const SALA_PRONTA = az({ retangulo: [2, 3] }, 'O retângulo fechado: o x² no canto, 2 barras de pé, 3 deitadas e os 6 quadradinhos em 2 por 3. Em cima x + 2, à esquerda x + 3. Embaixo, x² + 5x + 6 = (x + 2)(x + 3).')

const DOZE = (arranjo: [number, number] | null, esboco: string) => az(arranjo ? { fatorar: [7, 12], arranjo } : { fatorar: [7, 12] }, esboco)

const SINAIS = 'x² − x − 6'

export const aula: Aula = {
  id: 'AF.U2.A5',
  titulo: 'Fatorar x² + bx + c',
  objetivo: 'Fatorar trinômios como x² + 5x + 6 = (x + 2)(x + 3) e x² − x − 6 = (x + 2)(x − 3), achando dois números com soma b e produto c (vistos nos azulejos arrumados em retângulo), e conferir multiplicando de volta.',
  modelo: 'livre',
  esboco: 'Abre numa sala de área x² + 5x + 6, com os azulejos soltos. Momento-chave: o aluno toca os azulejos e os quadradinhos se arrumam em 1 por 6 (faltam 2 barras) e em 2 por 3 (fecha): (x + 2)(x + 3). A aposta desmonta o (x + 1)(x + 6): produto certo, soma errada. O 2 e o 3 fazem as duas contas. Em x² + 7x + 12, três arrumações; só 3 por 4 fecha. A regra no anote, e o x² − x − 6 sem peças, com os sinais pela regra dos sinais.',
  vega: 'Ideia central: x² + bx + c = (x + p)(x + q) quando p + q = b e p · q = c. Nos azulejos: os c quadradinhos formam um retângulo de p por q no canto, e as barras (p de um lado, q do outro) fecham o contorno só quando p + q = b. Por isso se procura nos pares de divisores de c (unidade de divisores) o que tem a soma b. Com sinais: produto negativo, sinais diferentes; produto positivo e soma negativa, os dois negativos. Sempre se confere multiplicando de volta, ou com um número no lugar do x. Erros esperados: o par com o produto certo e a soma errada ((x + 1)(x + 6)), a soma certa e o produto errado ((x + 1)(x + 4)), os sinais trocados ((x − 2)(x + 3) para x² − x − 6), achar que menos com menos dá produto negativo. Guie com "Quantas barras esse retângulo pede?", "Que pares dão o produto?", "Desses, qual tem a soma?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Uma sala tem área ${x^2 + 5x + 6}$ m². Não há um x em todos os termos. Como achar os lados?',
      fala: 'Uma sala tem área x ao quadrado mais cinco x mais seis metros quadrados. Não há um x em todos os termos. Como achar os lados?',
      visual: SALA_SOLTA,
      esboco: 'A evidência da aula anterior não serve: o 6 não tem x. Os azulejos da área estão soltos, esperando virar um retângulo.',
    },
    {
      tipo: 'mexa',
      texto: 'Um ${x^2}$, 5 barras e 6 quadradinhos. Monte um retângulo com todas as peças.',
      fala: 'Um x ao quadrado, cinco barras e seis quadradinhos. Monte um retângulo com todas as peças.',
      visual: az({ fatorar: [5, 6] }, 'As peças soltas. Cada toque arruma os 6 quadradinhos no canto: 1 por 6 (faltam 2 barras, em rosa), depois 2 por 3 (as 5 barras fecham).'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos azulejos para arrumar os quadradinhos de outro jeito.',
        sucesso: { fatorado: [2, 3] },
        mostre: 'Com 2 por 3, as 5 barras fecham o retângulo: (x + 2) por (x + 3).',
      },
      descoberta: 'Os quadradinhos em 2 por 3 pedem 2 + 3 = 5 barras: o retângulo fecha. x² + 5x + 6 = (x + 2)(x + 3).',
      esboco: 'O momento-chave: o 1 por 6 deixa vagas tracejadas; o 2 por 3 fecha o retângulo, e os lados aparecem em cima e à esquerda.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Caio apostou em ${(x + 1)(x + 6)}$, porque ${1 \\cdot 6 = 6}$. O retângulo fecha?',
      fala: 'Caio apostou em x mais um vezes x mais seis, porque um vezes seis é seis. O retângulo fecha?',
      visual: SALA_1x6,
      opcoes: [
        {
          texto: 'Fecha: $1 \\cdot 6 = 6$', erro: 'fatores-com-a-soma-errada',
          explica: 'Os 6 quadradinhos cabem, mas o contorno pede ${1 + 6 = 7}$ barras, e só há 5.',
          fala: 'Os seis quadradinhos cabem, mas o contorno pede um mais seis, sete barras, e só há cinco.',
          mostra: SALA_1x6,
        },
        {
          texto: 'Não fecha: faltam barras', certa: true,
          explica: 'Isso. 1 por 6 pede ${1 + 6 = 7}$ barras. Há 5: faltam 2.',
          fala: 'Isso. Um por seis pede um mais seis, sete barras. Há cinco: faltam duas.',
          mostra: SALA_1x6,
        },
      ],
      esboco: 'O produto dá os quadradinhos; a soma dá as barras. As vagas tracejadas mostram o que falta.',
    },
    {
      tipo: 'ideia',
      texto: 'Com 2 por 3, fechou: ${(x + 2)(x + 3)}$. O 2 e o 3 fazem duas contas: ${2 \\cdot 3 = 6}$ quadradinhos e ${2 + 3 = 5}$ barras.',
      fala: 'Com dois por três, fechou: x mais dois vezes x mais três. O dois e o três fazem duas contas: dois vezes três, seis quadradinhos, e dois mais três, cinco barras.',
      visual: SALA_PRONTA,
      esboco: 'O retângulo pronto. Os dois números aparecem nos dois lados e nas duas contas.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora ${x^2 + 7x + 12}$: 7 barras e 12 quadradinhos. Que arrumação dos quadradinhos fecha o retângulo?',
      fala: 'Agora x ao quadrado mais sete x mais doze: sete barras e doze quadradinhos. Que arrumação dos quadradinhos fecha o retângulo?',
      visual: DOZE(null, 'Os azulejos de x² + 7x + 12, soltos: o x², 7 barras e 12 quadradinhos.'),
      opcoes: [
        {
          texto: '1 por 12', erro: 'fatores-com-a-soma-errada',
          explica: 'Pede ${1 + 12 = 13}$ barras, e há 7. Procure o par de produto 12 e soma 7.',
          fala: 'Pede um mais doze, treze barras, e há sete. Procure o par de produto doze e soma sete.',
          mostra: DOZE([1, 12], 'Os 12 quadradinhos numa fila de 1 por 12: faltam 6 barras.'),
        },
        {
          texto: '2 por 6', erro: 'fatores-com-a-soma-errada',
          explica: 'Pede ${2 + 6 = 8}$ barras, e há 7: falta 1. Procure outro par de produto 12.',
          fala: 'Pede dois mais seis, oito barras, e há sete: falta uma. Procure outro par de produto doze.',
          mostra: DOZE([2, 6], 'Os 12 quadradinhos em 2 por 6: falta 1 barra.'),
        },
        {
          texto: '3 por 4', certa: true,
          explica: 'Isso. ${3 \\cdot 4 = 12}$ e ${3 + 4 = 7}$: ${(x + 3)(x + 4)}$.',
          fala: 'Isso. Três vezes quatro, doze, e três mais quatro, sete: x mais três vezes x mais quatro.',
          mostra: az({ retangulo: [3, 4] }, 'O retângulo fechado de (x + 3) por (x + 4). Embaixo, x² + 7x + 12 = (x + 3)(x + 4).'),
        },
      ],
      esboco: 'Os pares de divisores de 12, como na unidade de divisores. Só um tem a soma 7. Cada opção mostra a sua arrumação.',
    },
    {
      tipo: 'anote',
      titulo: 'Fatorar x² + bx + c',
      definicao: 'Ache **dois números** com **soma b** e **produto c**. Eles são os números dos lados: ${(x + p)(x + q)}$.',
      exemplo: { tex: 'x^2 + 5x + 6 = (x + 2)(x + 3)', fala: 'x ao quadrado mais cinco x mais seis é x mais dois vezes x mais três' },
      alerta: 'O produto certo não basta: ${1 \\cdot 6 = 6}$, mas ${1 + 6 = 7}$. Confira a soma, com os sinais.',
      esboco: 'Na página: o retângulo de azulejos de (x + 2) por (x + 3), com "soma 5" e "produto 6" ao lado.',
    },
    {
      tipo: 'passo',
      problema: 'Com sinais, só na conta: fatore ${x^2 - x - 6}$.',
      fala: 'Com sinais, só na conta: fatore x ao quadrado menos x menos seis.',
      visual: expr([SINAIS], 'A expressão x² − x − 6, sozinha.'),
      passos: [
        {
          pergunta: 'Os dois números têm produto −6 e soma −1. Como são os sinais deles?',
          fala: 'Os dois números têm produto menos seis e soma menos um. Como são os sinais deles?',
          opcoes: [
            { texto: 'Um positivo e um negativo', certa: true, explica: 'Isso. Só sinais diferentes dão um produto negativo.', fala: 'Isso. Só sinais diferentes dão um produto negativo.', mostra: expr([SINAIS, 'produto −6: sinais diferentes'], 'Embaixo de x² − x − 6: produto −6, sinais diferentes.') },
            { texto: 'Os dois negativos', erro: 'sinais-iguais-da-negativo', explica: 'Menos vezes menos dá mais: ${(-2) \\cdot (-3) = 6}$. Para dar −6, os sinais são diferentes.', fala: 'Menos vezes menos dá mais: menos dois vezes menos três, seis. Para dar menos seis, os sinais são diferentes.', mostra: expr([SINAIS, '(−2) · (−3) = 6'], 'Embaixo: (−2) · (−3) = 6, positivo.') },
          ],
          linha: { tex: '\\text{produto } -6: \\text{ sinais diferentes}', fala: 'produto menos seis: sinais diferentes' },
        },
        {
          pergunta: 'Qual par tem produto −6 e soma −1?',
          fala: 'Qual par tem produto menos seis e soma menos um?',
          opcoes: [
            { texto: '$-2$ e $3$', erro: 'fatora-com-o-sinal-trocado', explica: 'O produto dá −6, mas a soma dá ${-2 + 3 = 1}$. Troque os sinais: 2 e −3.', fala: 'O produto dá menos seis, mas a soma dá menos dois mais três, um. Troque os sinais: dois e menos três.', mostra: expr([SINAIS, '−2 + 3 = 1'], 'Embaixo: −2 + 3 = 1, a soma errada.') },
            { texto: '$1$ e $-6$', erro: 'fatores-com-a-soma-errada', explica: 'O produto dá −6, mas a soma dá ${1 + (-6) = -5}$.', fala: 'O produto dá menos seis, mas a soma dá um mais menos seis, menos cinco.', mostra: expr([SINAIS, '1 + (−6) = −5'], 'Embaixo: 1 + (−6) = −5, a soma errada.') },
            { texto: '$2$ e $-3$', certa: true, explica: 'Isso. ${2 \\cdot (-3) = -6}$ e ${2 + (-3) = -1}$.', fala: 'Isso. Dois vezes menos três, menos seis, e dois mais menos três, menos um.', mostra: expr([SINAIS, '2 · (−3) = −6', '2 + (−3) = −1'], 'Embaixo: 2 · (−3) = −6 e 2 + (−3) = −1.') },
          ],
          linha: { tex: '2 \\cdot (-3) = -6, \\quad 2 + (-3) = -1', fala: 'dois vezes menos três, menos seis; dois mais menos três, menos um' },
        },
        {
          pergunta: 'Então ${x^2 - x - 6}$ é igual a:',
          fala: 'Então x ao quadrado menos x menos seis é igual a:',
          opcoes: [
            { texto: '$(x - 2)(x + 3)$', erro: 'fatora-com-o-sinal-trocado', explica: 'Essa dá ${x^2 + x - 6}$. Os números são 2 e −3: ${(x + 2)(x - 3)}$.', fala: 'Essa dá x ao quadrado mais x menos seis. Os números são dois e menos três: x mais dois vezes x menos três.', mostra: expr([SINAIS, '(x − 2)(x + 3) = x² + x − 6'], 'Embaixo: (x − 2)(x + 3) = x² + x − 6, o meio com o sinal trocado.') },
            { texto: '$(x + 2)(x - 3)$', certa: true, explica: 'Isso. Confira com x = 4: ${16 - 4 - 6 = 6}$ e ${6 \\cdot 1 = 6}$.', fala: 'Isso. Confira com x igual a quatro: dezesseis menos quatro menos seis, seis, e seis vezes um, seis.', mostra: expr([SINAIS, '= (x + 2)(x − 3)'], 'A fatoração embaixo, maior: = (x + 2)(x − 3).') },
          ],
          linha: { tex: 'x^2 - x - 6 = (x + 2)(x - 3)', fala: 'x ao quadrado menos x menos seis é x mais dois vezes x menos três' },
        },
      ],
      esboco: 'Sem peças: a regra dos sinais escolhe o tipo de par, a soma escolhe o par, e o par vira os lados. A conferência com x = 4.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: ${x^2 - 7x + 10 = (x - 2)(x - \\square)}$. Ache o número e confira multiplicando de volta.',
      fala: 'No papel: x ao quadrado menos sete x mais dez é igual a x menos dois vezes x menos um número. Ache o número e confira multiplicando de volta.',
      resposta: 5,
      sinal: true,
      resolucao: [
        { tex: '(-2) \\cdot (-5) = 10, \\quad -2 + (-5) = -7', fala: 'menos dois vezes menos cinco, dez; menos dois mais menos cinco, menos sete' },
        { tex: 'x^2 - 7x + 10 = (x - 2)(x - 5)', fala: 'x ao quadrado menos sete x mais dez é x menos dois vezes x menos cinco' },
        { tex: '\\text{confere: } x^2 - 5x - 2x + 10 = x^2 - 7x + 10', fala: 'confere: x ao quadrado menos cinco x menos dois x mais dez, x ao quadrado menos sete x mais dez' },
      ],
      esboco: 'Produto positivo e soma negativa: os dois números são negativos. O número que falta é 5, porque o sinal já está escrito.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fatoracao-trinomio-n1', 'fatoracao-trinomio-n2', 'fatoracao-trinomio-n3'],
      esboco: 'Nível 1: escolher o par de números que fecha o retângulo, com os azulejos soltos. Nível 2: escolher a fatoração com sinais (contra o sinal trocado, a soma errada e o produto errado). Nível 3: o número que falta num dos lados, com sinais, e o lado de um terreno com x dado, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'A sala mede ${(x + 2)}$ por ${(x + 3)}$: soma 5, produto 6. A seguir: reconhecer os produtos notáveis de trás para a frente.',
      fala: 'A sala mede x mais dois por x mais três: soma cinco, produto seis. A seguir: reconhecer os produtos notáveis de trás para a frente.',
      visual: SALA_PRONTA,
      esboco: 'Responde ao gancho com o retângulo de azulejos pronto e aponta para a última aula da unidade.',
    },
  ],
}
