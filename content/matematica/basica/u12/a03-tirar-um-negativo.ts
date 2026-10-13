import type { Aula, Visual } from '@/lib/formation/schema'

// Tirar um negativo: cancelar uma dívida aumenta o saldo. O banco estorna
// uma cobrança de R$ 3 de quem tem R$ 2: 2 − (−3). Nas fichas, não há −
// para tirar; o aluno põe três pares + − (cada par vale zero, o saldo
// continua +2) e tira as três −. Sobram cinco +. Tirar −3 deu o mesmo que
// somar 3. O padrão 2 − 2, 2 − 1, 2 − 0, 2 − (−1) confirma por outro
// caminho, e a amplitude térmica (5 °C e −3 °C) é o uso. Os erros a
// desmontar: ler 2 − (−3) como 2 − 3 (tirar-negativo-subtrai) e esquecer o
// sinal quando ainda sobra dívida (esquece-sinal-do-resultado).

const saldo = (s: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { saldo: s }, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado: { sinais: true, ...estado }, esboco })
const expressao = (etapas: string[], esboco: string, destaque?: string): Visual => ({ modelo: 'livre', estado: { expressao: etapas, ...(destaque ? { destaque } : {}) }, esboco })

/** O padrão de 2 − 2 até 2 − (−1). */
const PADRAO = ['2 − 2 = 0', '2 − 1 = 1', '2 − 0 = 2']
/** A reta da temperatura, de −4 a 6. */
const T = { de: -4, ate: 6, passo: 1, marcas: [-3, 0, 5] }

export const aula: Aula = {
  id: 'B.U12.A3',
  titulo: 'Tirar um negativo',
  objetivo: 'Subtrair um número negativo trocando a conta por uma soma: tirar um negativo é o mesmo que somar o positivo (2 − (−3) = 2 + 3 = 5), e explicar por quê com as fichas de saldo (tirar uma dívida aumenta o saldo).',
  modelo: 'livre',
  esboco: 'O saldo é R$ 2 e o banco cancela uma cobrança de R$ 3: 2 − (−3). O aluno aposta e depois mexe nas fichas. Momento-chave: não há − para tirar; ele põe três pares + − (valem zero, o saldo continua +2) e tira as três −. Sobram cinco +: tirar −3 é o mesmo que somar 3. O padrão 2 − 2, 2 − 1, 2 − 0 continua até 2 − (−1) = 3. Depois uma dívida que diminui, (−5) − (−2) = −3, e a diferença entre 5 °C e −3 °C.',
  vega: 'Ideia central: tirar um negativo é o mesmo que somar o positivo, a − (−b) = a + b. Por quê: nas fichas de saldo, tirar uma − é cancelar uma dívida, e o saldo sobe. Se não há − para tirar, põem-se pares + − (cada par vale zero, o saldo não muda) e tiram-se as −; ficam as + dos pares. Outro caminho é o padrão: 2 − 2 = 0, 2 − 1 = 1, 2 − 0 = 2, então 2 − (−1) = 3; cada vez que se tira 1 a menos, o resultado sobe 1. O uso: a diferença entre 5 °C e −3 °C é 5 − (−3) = 8 graus. Erros esperados: ler 2 − (−3) como 2 − 3 = −1; em (−5) − (−2), fazer −7 (tirar mais) ou 3 (esquecer que ainda sobra dívida). Guie com "O que está saindo: dinheiro ou dívida?", "Se sai uma dívida, o saldo sobe ou desce?", "Há fichas − para tirar? Se não, ponha pares". Não fale em "menos com menos dá mais": essa frase é da multiplicação (aula 4), e aqui o porquê é o cancelamento da dívida.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Seu saldo é **R$ 2**. O banco cancela uma cobrança de **R$ 3** que tinha feito. Com quanto você fica?',
      fala: 'Seu saldo é dois reais. O banco cancela uma cobrança de três reais que tinha feito. Com quanto você fica?',
      visual: saldo({ positivas: 2, mostraSaldo: true }, 'Duas fichas + âmbar e, embaixo, "saldo: +2".'),
      esboco: 'Um estorno: todo mundo sabe que o dinheiro volta. A conta 2 − (−3) parece estranha, mas o bolso sabe a resposta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Cancelar a cobrança é **tirar uma dívida de 3**: a conta é **2 − (−3)**. Quanto você acha que dá?',
      fala: 'Cancelar a cobrança é tirar uma dívida de três: a conta é dois menos menos três. Quanto você acha que dá?',
      visual: saldo({ positivas: 2, mostraSaldo: true }, 'As mesmas duas fichas +, com "saldo: +2".'),
      opcoes: [
        {
          texto: '5', fala: 'Cinco.', certa: true,
          explica: 'Isso. Sem a cobrança, os R$ 3 voltam para você. As fichas vão mostrar o porquê.',
        },
        {
          texto: '−1', fala: 'Menos um.', erro: 'tirar-negativo-subtrai',
          explica: 'Essa é a conta 2 − 3, que tira dinheiro. Aqui sai uma dívida. Veja nas fichas.',
        },
        {
          texto: '2: não há dívida para tirar', fala: 'Dois: não há dívida para tirar.',
          explica: 'Parece que não, mas dá para tirar. Veja nas fichas como.',
        },
      ],
      esboco: 'A aposta vem antes da explicação. A terceira opção é a dúvida honesta de quem vê só duas +, e o Mexa responde a ela.',
    },
    {
      tipo: 'mexa',
      texto: 'Tire **três −**. Não tem? Um par **+ −** vale zero e não muda o saldo: ponha quantos precisar.',
      fala: 'Tire três fichas menos. Não tem? Um par mais e menos vale zero e não muda o saldo: ponha quantos precisar.',
      visual: saldo({ positivas: 2, negativas: 0, tirar: '−', mostraSaldo: true }, 'As duas fichas + e o botão "Pôr um par + − (vale 0)". Cada par entra com uma + em cima e uma − embaixo; o saldo continua +2. As − têm a borda clara: um toque tira uma.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Ponha pares e toque nas fichas − para tirar três.',
        sucesso: { tiradas: 3 },
        mostre: 'Três pares + − entram (o saldo continua +2) e as três − saem, uma por vez. Sobram cinco +.',
      },
      descoberta: 'Para tirar três −, é preciso pôr três pares. Quando as − saem, ficam as + dos pares: o saldo vai de +2 a +5.',
      esboco: 'O momento-chave da aula. O saldo embaixo não muda quando os pares entram (+2) e sobe a cada − que sai: +3, +4, +5.',
    },
    {
      tipo: 'ideia',
      texto: 'Tirar três **−** deixou três **+** a mais. Tirar −3 deu o mesmo que **somar 3**: 2 − (−3) = 2 + 3 = 5.',
      fala: 'Tirar três fichas menos deixou três fichas mais a mais. Tirar menos três deu o mesmo que somar três: dois menos menos três é dois mais três, cinco.',
      visual: saldo({ positivas: 5, riscadas: { negativas: 3 }, mostraSaldo: true }, 'Cinco fichas +; embaixo, as três − que saíram, apagadas e riscadas; "saldo: +5".'),
      esboco: 'O nome da troca: subtrair um negativo vira somar o positivo.',
    },
    {
      tipo: 'anote',
      titulo: 'Tirar um negativo',
      definicao: '**Tirar um negativo** é o mesmo que **somar o positivo**: cancelar uma dívida aumenta o saldo.',
      exemplo: { tex: '2 - (-3) = 2 + 3 = 5', fala: 'dois menos menos três é dois mais três, que dá cinco' },
      alerta: '2 − (−3) não é 2 − 3. O que sai é uma dívida: o saldo **sobe** e dá 5.',
      esboco: 'Na página: as duas + com os três pares, as três − riscadas e a conta 2 − (−3) = 2 + 3 = 5.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Veja o padrão: cada linha tira **1 a menos**. Quanto dá **2 − (−1)**?',
      fala: 'Veja o padrão: cada linha tira um a menos. Quanto dá dois menos menos um?',
      visual: expressao([...PADRAO, '2 − (−1) = ?'], 'As quatro linhas, uma embaixo da outra: 2 − 2 = 0, 2 − 1 = 1, 2 − 0 = 2 e 2 − (−1) = ?, a última maior.'),
      opcoes: [
        {
          texto: '3', fala: 'Três.', certa: true,
          explica: 'Isso. Cada vez que se tira 1 a menos, o resultado sobe 1: 0, 1, 2, 3. É 2 + 1.',
          mostra: expressao([...PADRAO, '2 − (−1) = 3'], 'O ? vira 3, com moldura âmbar.', '3'),
        },
        {
          texto: '1', fala: 'Um.', erro: 'tirar-negativo-subtrai',
          explica: 'Os resultados sobem: 0, 1, 2. O próximo é 3, não 1. Tirar −1 é somar 1.',
          mostra: expressao([...PADRAO, '2 − (−1) = 3'], 'O padrão continua até 3.', '3'),
        },
      ],
      esboco: 'Outro caminho até a mesma regra, sem fichas: o padrão não pode quebrar no zero.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Você deve **R$ 5**. A loja cancela **R$ 2** da dívida. Quanto é **(−5) − (−2)**?',
      fala: 'Você deve cinco reais. A loja cancela dois reais da dívida. Quanto é menos cinco menos menos dois?',
      visual: saldo({ negativas: 5, mostraSaldo: true }, 'Cinco fichas − azuis e "saldo: −5".'),
      opcoes: [
        {
          texto: '−3', fala: 'Menos três.', certa: true,
          explica: 'Isso. Saem duas −, e ainda ficam três: você deve menos, R$ 3. É (−5) + 2.',
          mostra: saldo({ negativas: 3, riscadas: { negativas: 2 }, mostraSaldo: true }, 'Duas − saem, riscadas; ficam três, com "saldo: −3".'),
        },
        {
          texto: '−7', fala: 'Menos sete.', erro: 'tirar-negativo-subtrai',
          explica: '−7 seria dever mais. A loja cancelou parte da dívida: ficam 3 −, −3.',
          mostra: saldo({ negativas: 3, riscadas: { negativas: 2 }, mostraSaldo: true }, 'As duas − riscadas; sobram três.'),
        },
        {
          texto: '3', fala: 'Três.', erro: 'esquece-sinal-do-resultado',
          explica: 'Ainda sobram 3 fichas −: você ainda deve. O saldo é −3.',
          mostra: saldo({ negativas: 3, riscadas: { negativas: 2 }, mostraSaldo: true }, 'As três − que sobram, com "saldo: −3".'),
        },
      ],
      esboco: 'Aqui há − para tirar e não precisa de pares. A dívida diminui, mas não some.',
    },
    {
      tipo: 'passo',
      problema: 'De dia fez **5 °C**; de madrugada, **−3 °C**. Quantos graus separam as duas: **5 − (−3)**?',
      fala: 'De dia fez cinco graus; de madrugada, menos três graus. Quantos graus separam as duas: cinco menos menos três?',
      visual: reta({ ...T, numeros: [-3, 5] }, 'A reta de −4 a 6, com o ponto azul no −3 e o âmbar no 5.'),
      passos: [
        {
          pergunta: 'Tirar −3 é o mesmo que…',
          fala: 'Tirar menos três é o mesmo que…',
          opcoes: [
            { texto: 'somar 3', certa: true, explica: 'Isso. A conta vira 5 + 3.', mostra: reta({ ...T, numeros: [-3, 5], comparacoes: ['5 − (−3) = 5 + 3'] }, 'Embaixo da reta aparece 5 − (−3) = 5 + 3.') },
            { texto: 'tirar 3', erro: 'tirar-negativo-subtrai', explica: 'Tirar 3 seria 5 − 3. Aqui sai um negativo: vira somar 3.' },
          ],
          linha: { tex: '5 - (-3) = 5 + 3', fala: 'cinco menos menos três é cinco mais três' },
        },
        {
          pergunta: 'Quanto é 5 + 3?',
          fala: 'Quanto é cinco mais três?',
          opcoes: [
            { texto: '8 graus', fala: 'oito graus', certa: true, explica: 'Isso. Na reta, do −3 ao 5 são 3 passos até o zero e mais 5: 8.', mostra: reta({ ...T, numeros: [-3, 5], saltos: [[-3, 0, '3'], [0, 5, '5']], comparacoes: ['5 − (−3) = 8'] }, 'Dois arcos, do −3 ao 0 (3) e do 0 ao 5 (5); embaixo, 5 − (−3) = 8.') },
            { texto: '2 graus', fala: 'dois graus', erro: 'tirar-negativo-subtrai', explica: '2 é 5 − 3. Do −3 ao 5 são 3 passos até o zero e mais 5: 8 graus.', mostra: reta({ ...T, numeros: [-3, 5], saltos: [[-3, 0, '3'], [0, 5, '5']] }, 'Os dois arcos, do −3 ao 0 e do 0 ao 5.') },
          ],
          linha: { tex: '5 + 3 = 8', fala: 'cinco mais três dá oito' },
        },
      ],
      esboco: 'A diferença de temperatura é uma subtração com negativo. A reta confere: os passos do −3 até o 5 são 8.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: calcule **(−4) − (−6)**. Troque a conta por uma soma antes.',
      fala: 'No papel: calcule menos quatro menos menos seis. Troque a conta por uma soma antes.',
      resposta: 2,
      sinal: true,
      resolucao: [
        { tex: '(-4) - (-6) = (-4) + 6', fala: 'menos quatro menos menos seis é menos quatro mais seis' },
        { tex: '(-4) + 6 = 2', fala: 'menos quatro mais seis dá dois: quatro pares valem zero e sobram duas fichas mais' },
      ],
      esboco: 'Tirar seis − de quatro −: faltam duas, e entram dois pares. O teclado mostra o menos, para não entregar o sinal.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['tirar-negativo-n1', 'tirar-negativo-n2', 'tirar-negativo-n3'],
      esboco: 'Nível 1: a − (−b) com as fichas. Nível 2: tirar um negativo de um negativo, sem desenho. Nível 3: diferença de temperatura e dívida cancelada.',
    },
    {
      tipo: 'fecho',
      texto: 'Você fica com **R$ 5**: 2 − (−3) = 2 + 3. Na próxima aula: multiplicar e dividir com negativos.',
      fala: 'Você fica com cinco reais: dois menos menos três é dois mais três. Na próxima aula: multiplicar e dividir com negativos.',
      visual: saldo({ positivas: 5, riscadas: { negativas: 3 }, mostraSaldo: true }, 'As cinco fichas + e as três − riscadas, com "saldo: +5".'),
      esboco: 'Responde ao gancho com as fichas.',
    },
  ],
}
