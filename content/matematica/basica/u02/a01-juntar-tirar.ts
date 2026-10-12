import type { Aula, Visual } from '@/lib/formation/schema'

// A primeira aula de contas. Antes de qualquer algoritmo, o aluno decide
// QUAL conta a situação pede: juntar e acrescentar somam; tirar, comparar e
// completar subtraem. Os blocos da U1 continuam no palco: somar é juntar
// peças (e 10 soltas viram uma barra); subtrair é tirar peças.

const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })

export const aula: Aula = {
  id: 'B.U2.A1',
  titulo: 'Juntar, tirar, comparar, completar',
  objetivo: 'Reconhecer numa situação se é para somar (juntar, acrescentar) ou subtrair (tirar, comparar, completar), e resolver com números até 100 usando blocos e a reta.',
  modelo: 'blocos',
  esboco: 'Os blocos da unidade 1 viram ferramenta de conta. Primeiro o aluno junta 28 e 15 com as mãos e vê 10 cubos virarem barra: a soma nasce do agrupamento. Depois a mesma subtração aparece com três caras: tirar (sai do palco), comparar (a distância entre dois pontos da reta) e completar (saltos até chegar). Momento-chave: comparar Ana e Beto e descobrir que "quantos a mais" também é uma subtração, sem tirar nada de ninguém.',
  vega: 'Ideia central: a conta vem da situação, não das palavras soltas. Juntar e acrescentar são somas. Tirar, comparar ("quantos a mais", "quantos a menos") e completar ("quanto falta", troco) são subtrações. Erro esperado: somar sempre que aparece "mais", como em "quantos a mais", e trocar a operação. Guie perguntando "A quantidade aumenta ou diminui?", "Alguém tirou alguma coisa, ou você está medindo a distância entre dois números?". Use blocos para juntar e tirar, e a reta para comparar e completar. Nesta aula os números vão até 100; a conta armada vem na aula 3, então resolva com blocos, reta ou contando de 10 em 10. Em Sua vez, não diga qual operação usar: pergunte o que acontece com a quantidade.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você paga uma compra de **R$ 37** com uma nota de **R$ 50**. Quanto volta de troco?',
      fala: 'Você paga uma compra de trinta e sete reais com uma nota de cinquenta. Quanto volta de troco?',
      visual: reta(
        { de: 30, ate: 50, passo: 1, marcas: [30, 37, 40, 50], numeros: [37, 50], unidade: 'R$' },
        'A reta de 30 a 50 com dois pontos acesos: 37, o preço, e 50, a nota. Entre eles, um espaço vazio que ainda não tem número.',
      ),
      esboco: 'Uma conta do dia a dia que todo mundo já fez sem papel. A pergunta fica no ar: o fecho responde com a reta.',
    },
    {
      tipo: 'mexa',
      texto: 'Você tem **28** peças e ganha mais **15**. Junte tudo.',
      fala: 'Você tem vinte e oito peças e ganha mais quinze. Junte tudo.',
      visual: blocos(
        { centenas: 0, dezenas: 3, unidades: 13, rotulos: { dezenas: '2 + 1', unidades: '8 + 5' } },
        'As 2 barras e 8 cubos do 28 à esquerda; a barra e os 5 cubos do 15 deslizam para perto. Barras com barras, cubos com cubos: 3 barras e 13 cubos soltos, com a borda tracejada nos cubos.',
      ),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque nos cubos para juntar 10 numa barra.',
        sucesso: { dezenas: 4, unidades: 3 },
        mostre: 'Dez dos treze cubos se fundem numa barra; ficam 4 barras e 3 cubos: 43.',
      },
      descoberta: 'Somar é juntar as peças. Quando as unidades passam de 10, dez delas viram uma barra, como na unidade 1.',
      esboco: 'O agrupamento da unidade 1 reaparece dentro de uma soma, sem nome novo. É a semente do "vai um" da aula 3.',
    },
    {
      tipo: 'ideia',
      texto: '**Juntar** duas quantidades é **somar**: $28 + 15 = 43$. O sinal $+$ se lê "mais".',
      fala: 'Juntar duas quantidades é somar: vinte e oito mais quinze é igual a quarenta e três. O sinal de mais se lê mais.',
      visual: blocos({ centenas: 0, dezenas: 4, unidades: 3, total: 43 }, 'As 4 barras e os 3 cubos ficam; o total 43 aparece embaixo.'),
      esboco: 'Dar o nome e o sinal depois do gesto. Uma linha só.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Das **43** peças, você dá **20** para um amigo. Quantas ficam?',
      fala: 'Das quarenta e três peças, você dá vinte para um amigo. Quantas ficam?',
      visual: blocos({ centenas: 0, dezenas: 4, unidades: 3 }, 'As 4 barras e 3 cubos. Duas barras ficam com a borda tracejada: são elas que vão sair.'),
      opcoes: [
        {
          texto: '23', certa: true,
          explica: 'Isso. Saem 2 barras: ficam 2 barras e 3 cubos. Tirar é **subtrair**: $43 - 20 = 23$.',
          mostra: blocos({ centenas: 0, dezenas: 2, unidades: 3, total: 23 }, 'Duas barras deslizam para fora do palco; ficam 2 barras e 3 cubos, e o total 23.'),
        },
        {
          texto: '63', erro: 'operacao-trocada',
          explica: 'Você somou. Dar peças tira peças: a quantidade diminui. Ficam $43 - 20 = 23$.',
          mostra: blocos({ centenas: 0, dezenas: 2, unidades: 3, total: 23 }, 'As duas barras saem do palco devagar; o total desce de 43 para 23.'),
        },
        {
          texto: '20',
          explica: '20 é o que saiu. A pergunta é o que fica: 2 barras e 3 cubos, 23.',
          mostra: blocos({ centenas: 0, dezenas: 2, unidades: 3, total: 23 }, 'As duas barras saem; as que ficam ganham destaque.'),
        },
      ],
      esboco: 'Tirar é o sentido mais conhecido da subtração. Aqui só saem barras inteiras, para não precisar abrir dezena ainda.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Ana tem **43** figurinhas e Beto tem **28**. Quantas **Ana tem a mais**?',
      fala: 'Ana tem quarenta e três figurinhas e Beto tem vinte e oito. Quantas Ana tem a mais?',
      visual: reta(
        { de: 20, ate: 50, passo: 1, marcas: [20, 28, 40, 43, 50], numeros: [28, 43] },
        'Dois pontos na reta: Beto em 28, Ana em 43. Ninguém perde figurinha; a pergunta é o tamanho do espaço entre eles.',
      ),
      opcoes: [
        {
          texto: '15', certa: true,
          explica: 'Isso. De 28 até 43 são 15. "Quantos a mais" é a distância: $43 - 28 = 15$.',
          mostra: reta(
            { de: 20, ate: 50, passo: 1, marcas: [20, 28, 40, 43, 50], numeros: [28, 43], saltos: [[28, 40, '+12'], [40, 43, '+3']] },
            'Dois saltos de Beto até Ana: +12 até a dezena redonda 40, +3 até 43. Os rótulos somam 15.',
          ),
        },
        {
          texto: '71', erro: 'operacao-trocada',
          explica: '71 junta as figurinhas dos dois. "A mais" pede a distância entre eles: de 28 até 43 são 15.',
          mostra: reta(
            { de: 20, ate: 50, passo: 1, marcas: [20, 28, 40, 43, 50], numeros: [28, 43], saltos: [[28, 40, '+12'], [40, 43, '+3']] },
            'Os saltos de 28 até 43 aparecem um por um; nada é juntado.',
          ),
        },
      ],
      esboco: 'O momento-chave. "Mais" na pergunta não quer dizer somar. A reta mostra a diferença como um espaço, e os saltos medem esse espaço.',
    },
    {
      tipo: 'passo',
      problema: 'Volte ao troco: de **R$ 37** até **R$ 50**, quanto falta?',
      fala: 'Volte ao troco: de trinta e sete reais até cinquenta, quanto falta?',
      visual: reta({ de: 30, ate: 50, passo: 1, marcas: [30, 37, 40, 50], numeros: [37, 50], unidade: 'R$' }, 'A reta do gancho. Cada passo acertado desenha um salto.'),
      passos: [
        {
          pergunta: 'De 37, quanto falta para chegar a **40**?',
          opcoes: [
            { texto: '3', certa: true, explica: 'Isso: 38, 39, 40. São 3.', mostra: reta({ de: 30, ate: 50, passo: 1, marcas: [30, 37, 40, 50], numeros: [37, 50], saltos: [[37, 40, '+3']] }, 'Um salto curto de 37 a 40, com +3.') },
            { texto: '4', explica: 'Conte os pulos, não os números: 38, 39, 40. São 3.', mostra: reta({ de: 30, ate: 50, passo: 1, marcas: [30, 37, 40, 50], numeros: [37, 50], saltos: [[37, 40, '+3']] }, 'Três pulinhos de 1 em 1, de 37 a 40.') },
          ],
          linha: { tex: '37 + 3 = 40', fala: 'trinta e sete mais três é quarenta' },
        },
        {
          pergunta: 'E de **40** até **50**?',
          opcoes: [
            { texto: '10', certa: true, explica: 'Isso. Uma dezena inteira.', mostra: reta({ de: 30, ate: 50, passo: 1, marcas: [30, 37, 40, 50], numeros: [37, 50], saltos: [[37, 40, '+3'], [40, 50, '+10']] }, 'O segundo salto, longo, de 40 a 50, com +10.') },
            { texto: '50', explica: '50 é onde você quer chegar. O salto é de 40 até 50: 10.', mostra: reta({ de: 30, ate: 50, passo: 1, marcas: [30, 37, 40, 50], numeros: [37, 50], saltos: [[37, 40, '+3'], [40, 50, '+10']] }, 'O salto de 40 a 50 aparece com +10.') },
          ],
          linha: { tex: '40 + 10 = 50', fala: 'quarenta mais dez é cinquenta' },
        },
        {
          pergunta: 'Então o troco é:',
          opcoes: [
            { texto: 'R$ 13', certa: true, explica: 'Isso. 3 e 10 dão 13. Completar também é subtrair: $50 - 37 = 13$.' },
            { texto: 'R$ 87', erro: 'operacao-trocada', explica: 'Isso juntaria 50 e 37. O troco é o que falta de 37 até 50: os saltos somam 13.' },
          ],
          linha: { tex: '50 - 37 = 13', fala: 'cinquenta menos trinta e sete é treze' },
        },
      ],
      esboco: 'Completar é como o caixa conta o troco: do preço até a nota, em saltos fáceis. O caderno da tela termina com a subtração escrita.',
    },
    {
      tipo: 'anote',
      titulo: 'Os sentidos da subtração',
      definicao: 'Subtrair responde a três perguntas: quanto sobra (tirar), quanto a mais (comparar) e quanto falta (completar).',
      exemplo: { tex: '50 - 37 = 13', fala: 'cinquenta menos trinta e sete é treze' },
      alerta: '"Quantos a mais" não é somar: é a distância entre dois números.',
      esboco: 'Uma página de caderno com as três perguntas e um exemplo. A soma já ficou clara no cartão da ideia.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No caderno: você tem R$ 50 e gasta R$ 26. Quanto sobra? Use saltos na reta.',
      fala: 'No caderno: você tem cinquenta reais e gasta vinte e seis. Quanto sobra? Use saltos na reta.',
      resposta: 24,
      resolucao: [
        { tex: '26 + 4 = 30', fala: 'vinte e seis mais quatro é trinta' },
        { tex: '30 + 20 = 50', fala: 'trinta mais vinte é cinquenta' },
        { tex: '4 + 20 = 24', fala: 'quatro mais vinte é vinte e quatro' },
        { tex: '50 - 26 = 24', fala: 'cinquenta menos vinte e seis é vinte e quatro' },
      ],
      esboco: 'Mesma estratégia do passo a passo, sem a reta na tela: o aluno desenha a reta no caderno.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['sentidos-n1', 'sentidos-n2', 'sentidos-n3'],
      esboco: 'Nível 1: ganhar ou usar, com blocos. Nível 2: escolher a conta certa em quatro situações. Nível 3: o troco, sem apoio.',
    },
    {
      tipo: 'fecho',
      texto: 'O troco é **R$ 13**. Na próxima aula: fazer contas assim **de cabeça**, sem papel.',
      fala: 'O troco é treze reais. Na próxima aula: fazer contas assim de cabeça, sem papel.',
      visual: reta(
        { de: 30, ate: 50, passo: 1, marcas: [30, 37, 40, 50], numeros: [37, 50], saltos: [[37, 40, '+3'], [40, 50, '+10']], unidade: 'R$' },
        'A reta do gancho, agora com os dois saltos e o 13 escrito acima, em âmbar.',
      ),
      esboco: 'Responder ao gancho com a mesma imagem e abrir a próxima aula.',
    },
  ],
}
