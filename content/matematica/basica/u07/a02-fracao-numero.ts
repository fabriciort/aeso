import type { Aula, Visual } from '@/lib/formation/schema'

// A fração deixa de ser só um pedaço e vira um número: um ponto na reta. O
// trecho de 0 a 1 é uma barra inteira; cortado em 4 espaços iguais, cada
// espaço é 1/4, e 3/4 é o terceiro traço. A fração pode passar de 1: 5/4 é
// um quarto depois do 1, e 4/4 é o próprio 1.

const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const QUARTOS = { de: 0, ate: 2, passo: 0.25, fracoes: 4, marcas: [0, 1, 2] }
const QUINTOS = { de: 0, ate: 2, passo: 0.2, fracoes: 5, marcas: [0, 1, 2] }

export const aula: Aula = {
  id: 'B.U7.A2',
  titulo: 'Fração é um número',
  objetivo: 'Localizar uma fração na reta (cortando cada inteiro em partes iguais e contando os espaços a partir do 0), inclusive frações maiores que 1, e saber que 4/4 = 1.',
  modelo: 'reta',
  esboco: 'A receita pede 3/4 de xícara. A barra de 3/4 se deita sobre a reta, de 0 a 1, e o pintado termina no terceiro traço: ali mora o 3/4. Depois 5/4: o aluno pinta duas barras e vê o quinto quarto cair depois do 1. Momento-chave: 4/4 cai em cima do 1, e o 5/4 passa dele; a fração é um número como os outros, com um lugar na reta.',
  vega: 'Ideia central: toda fração é um número e tem um ponto na reta. Para achar k/d: corte cada inteiro em d espaços iguais e conte k espaços a partir do 0. Frações podem passar de 1 (5/4 é um quarto depois do 1), e d/d = 1. Erros esperados: achar que fração é sempre menor que 1 (5/4 "não existe" ou fica entre 0 e 1); contar os traços em vez dos espaços (5 traços de 0 a 1 viram quintos, mas são quartos); trocar os números. Guie perguntando "Quantos espaços há de 0 a 1?", "Quantos quartos fecham um inteiro?", "Passou do 1?". Em Sua vez, peça para marcar os espaços com o lápis antes de contar.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A receita pede $\\frac{3}{4}$ de xícara de leite. Isso é um número? Onde ele fica na reta?',
      fala: 'A receita pede três quartos de xícara de leite. Isso é um número? Onde ele fica na reta?',
      visual: reta({ de: 0, ate: 2, passo: 1, marcas: [0, 1, 2] }, 'A reta de 0 a 2, só com os inteiros. Proposta: uma xícara medidora ao lado, com marcas de quarto.'),
      esboco: 'A fração aparece numa medida de cozinha. A pergunta muda o jeito de olhar: pedaço ou número?',
    },
    {
      tipo: 'ideia',
      texto: 'De 0 a 1 cabe uma xícara inteira. Corte esse trecho em **4** espaços iguais: cada um é $\\frac{1}{4}$.',
      fala: 'De zero a um cabe uma xícara inteira. Corte esse trecho em quatro espaços iguais: cada um é um quarto.',
      visual: barra({ partes: 4, pintadas: 3, rotulos: true, escala: 2 }, 'A barra de 3/4, com a metade da largura da tela, alinhada com o trecho de 0 a 1 da reta. Proposta: a barra desce e se deita sobre a reta, e as bordas das partes viram os traços.'),
      esboco: 'A ponte entre a barra (pedaço) e a reta (número). Movimento: A barra encolhe até o tamanho do trecho de 0 a 1 e desce sobre a reta.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora a reta está cortada em quartos.',
      fala: 'Agora a reta está cortada em quartos.',
      visual: reta({ ...QUARTOS, etiquetaSolta: 0.75 }, 'A reta de 0 a 2 com traços de quarto em quarto e a etiqueta 3/4 solta acima dela.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na reta onde fica o $\\frac{3}{4}$.',
        sucesso: { posicao: 0.75 },
        mostre: 'A etiqueta 3/4 desce para o terceiro traço depois do 0, antes do 1.',
      },
      descoberta: 'Contando 3 espaços de um quarto a partir do 0, chega-se ao 3/4, que fica antes do 1.',
      esboco: 'Errar o traço balança o palco e pede para contar de novo os espaços.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O pão pede $\\frac{5}{4}$ de xícara de farinha. Onde fica o $\\frac{5}{4}$?',
      fala: 'O pão pede cinco quartos de xícara de farinha. Onde fica o cinco quartos?',
      visual: reta({ ...QUARTOS }, 'A mesma reta de quartos, de 0 a 2.'),
      opcoes: [
        {
          texto: 'Depois do 1', certa: true,
          explica: 'Isso. 4 quartos já fecham o 1. O quinto quarto passa dele.',
          mostra: reta({ ...QUARTOS, numero: 1.25 }, 'O ponto 5/4 acende um quarto depois do 1.'),
        },
        {
          texto: 'Entre 0 e 1', erro: 'fracao-so-menor-que-um',
          explica: 'De 0 a 1 só cabem 4 quartos. O quinto já está depois do 1.',
          mostra: reta({ ...QUARTOS, numero: 1.25 }, 'Os quartos se contam de 1 a 4 até o 1; o quinto acende depois dele.'),
        },
        {
          texto: 'Não existe: só há 4 quartos', erro: 'fracao-so-menor-que-um',
          explica: 'Uma xícara tem 4 quartos, mas você pode encher mais. $\\frac{5}{4}$ é mais que uma xícara.',
          mostra: reta({ ...QUARTOS, numero: 1.25 }, 'O ponto 5/4 acende um quarto depois do 1.'),
        },
      ],
      esboco: 'A fração maior que 1 parece impossível para quem só viu pedaço. A reta desmonta isso.',
    },
    {
      tipo: 'mexa',
      texto: 'Com duas xícaras, dá para medir mais. Pinte $\\frac{7}{4}$ de xícara.',
      fala: 'Com duas xícaras, dá para medir mais. Pinte sete quartos de xícara.',
      visual: barra({ partes: 4, inteiros: 2, pintadas: 0, pintar: true }, 'Duas barras de 4 partes lado a lado, como duas xícaras, todas apagadas.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Pinte 7 quartos.',
        sucesso: { pintadas: 7 },
        mostre: 'A primeira barra se pinta inteira (4 quartos) e a segunda, 3 quartos. Ao lado, 7/4.',
      },
      descoberta: 'Os 4 primeiros quartos fecham um inteiro; os outros 3 vão para o segundo. 7/4 passa de 1.',
      esboco: 'A fração maior que 1 com as mãos: o pintado transborda para a segunda barra.',
    },
    {
      tipo: 'aposta',
      pergunta: 'E o $\\frac{4}{4}$? Onde ele fica na reta?',
      fala: 'E o quatro quartos? Onde ele fica na reta?',
      visual: reta({ ...QUARTOS }, 'A reta de quartos.'),
      opcoes: [
        {
          texto: 'Em cima do 1', certa: true,
          explica: 'Isso. 4 quartos são uma xícara cheia: $\\frac{4}{4} = 1$.',
          mostra: reta({ ...QUARTOS, numero: 1 }, 'O ponto acende em cima do 1.'),
        },
        {
          texto: 'Entre 0 e 1', erro: 'fracao-so-menor-que-um',
          explica: 'Contando 4 espaços de quarto a partir do 0, você chega no 1. $\\frac{4}{4} = 1$.',
          mostra: reta({ ...QUARTOS, numero: 1, saltos: [[0, 0.25, '1'], [0.25, 0.5, '2'], [0.5, 0.75, '3'], [0.75, 1, '4']] }, 'Quatro saltos de quarto, numerados, terminam no 1.'),
        },
        {
          texto: 'No 4',
          explica: 'Até o 4 são 16 quartos. Com 4 quartos você só chega no 1.',
          mostra: reta({ ...QUARTOS, numero: 1, saltos: [[0, 0.25, '1'], [0.25, 0.5, '2'], [0.5, 0.75, '3'], [0.75, 1, '4']] }, 'Quatro saltos de quarto, numerados, terminam no 1.'),
        },
      ],
      esboco: 'O inteiro escrito como fração: a ponte para as equivalentes.',
    },
    {
      tipo: 'anote',
      titulo: 'Fração é um número',
      definicao: 'Toda fração é um **número** e tem um ponto na reta. Corte cada inteiro em partes iguais e conte as partes a partir do 0.',
      exemplo: { tex: '\\frac{3}{4} < 1 = \\frac{4}{4} < \\frac{5}{4}', fala: 'três quartos é menor que um, que é quatro quartos, que é menor que cinco quartos' },
      alerta: 'Fração pode passar de 1. E conte os espaços, não os traços: de 0 a 1, 5 traços são 4 espaços.',
      esboco: 'Na página: a reta de 0 a 2 em quartos, com 3/4, 4/4 = 1 e 5/4 marcados.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Cada inteiro desta reta foi cortado em partes iguais. Quanto vale cada parte?',
      fala: 'Cada inteiro desta reta foi cortado em partes iguais. Quanto vale cada parte?',
      visual: reta({ de: 0, ate: 1, passo: 0.2, marcas: [0, 1] }, 'A reta de 0 a 1, com 4 traços pequenos no meio: 6 traços ao todo, 5 espaços.'),
      opcoes: [
        {
          texto: '$\\frac{1}{5}$', fala: 'um quinto', certa: true,
          explica: 'Isso. São **5** espaços entre o 0 e o 1.',
          mostra: reta({ de: 0, ate: 1, passo: 0.2, fracoes: 5, marcas: [0, 1], saltos: [[0, 0.2, '1'], [0.2, 0.4, '2'], [0.4, 0.6, '3'], [0.6, 0.8, '4'], [0.8, 1, '5']] }, 'Cinco saltos numerados de 1 a 5 cobrem o trecho; cada ponto ganha o seu quinto.'),
        },
        {
          texto: '$\\frac{1}{6}$', fala: 'um sexto', erro: 'reta-conta-tracos',
          explica: 'São 6 traços, mas 5 espaços. Os traços são as bordas das partes: $\\frac{1}{5}$.',
          mostra: reta({ de: 0, ate: 1, passo: 0.2, fracoes: 5, marcas: [0, 1], saltos: [[0, 0.2, '1'], [0.2, 0.4, '2'], [0.4, 0.6, '3'], [0.6, 0.8, '4'], [0.8, 1, '5']] }, 'Cinco saltos numerados de 1 a 5: os espaços, não os traços.'),
        },
        {
          texto: '$\\frac{1}{4}$', fala: 'um quarto',
          explica: 'Os 4 traços do meio cortam o trecho em **5** espaços. Cada um é $\\frac{1}{5}$.',
          mostra: reta({ de: 0, ate: 1, passo: 0.2, fracoes: 5, marcas: [0, 1], saltos: [[0, 0.2, '1'], [0.2, 0.4, '2'], [0.4, 0.6, '3'], [0.6, 0.8, '4'], [0.8, 1, '5']] }, 'Cinco saltos numerados de 1 a 5 cobrem o trecho.'),
        },
      ],
      esboco: 'A pegadinha dos traços, logo depois do alerta do anote.',
    },
    {
      tipo: 'passo',
      problema: 'Onde fica o $\\frac{7}{5}$ nesta reta?',
      fala: 'Onde fica o sete quintos nesta reta?',
      visual: reta({ ...QUINTOS, marcaSemRotulo: 1.4 }, 'A reta de 0 a 2, cada inteiro em 5 espaços, com um traço "?" no lugar do 7/5.'),
      passos: [
        {
          pergunta: 'Em quantas partes cada inteiro está cortado?',
          opcoes: [
            { texto: '5', certa: true, explica: 'Isso. 5 espaços entre o 0 e o 1: quintos.' },
            { texto: '6', erro: 'reta-conta-tracos', explica: 'São 6 traços de 0 a 1, mas 5 espaços.' },
            { texto: '10', explica: '10 é de 0 a 2. Cada inteiro tem 5 espaços.' },
          ],
          linha: { tex: '\\text{cada parte: } \\frac{1}{5}', fala: 'cada parte: um quinto' },
        },
        {
          pergunta: 'O $\\frac{7}{5}$ passa do 1?',
          fala: 'O sete quintos passa do um?',
          opcoes: [
            { texto: 'Sim: 5 quintos já fecham o 1', certa: true, explica: 'Isso. $\\frac{5}{5} = 1$, e ainda faltam 2 quintos.' },
            { texto: 'Não: fração é menor que 1', erro: 'fracao-so-menor-que-um', explica: 'Fração pode passar de 1. Com 5 quintos você já está no 1.' },
          ],
          linha: { tex: '\\frac{5}{5} = 1', fala: 'cinco quintos é um' },
        },
        {
          pergunta: 'Então o $\\frac{7}{5}$ fica quantos espaços depois do 1?',
          fala: 'Então o sete quintos fica quantos espaços depois do um?',
          opcoes: [
            { texto: '2', certa: true, explica: 'Isso. 7 quintos: 5 até o 1 e mais 2.', mostra: reta({ ...QUINTOS, numero: 1.4 }, 'O ponto 7/5 acende dois traços depois do 1.') },
            { texto: '7', explica: 'Os 7 espaços se contam a partir do 0, não do 1. Depois do 1 são 2.', mostra: reta({ ...QUINTOS, numero: 1.4 }, 'O ponto 7/5 acende dois traços depois do 1.') },
          ],
          linha: { tex: '\\frac{7}{5}: 2 \\text{ quintos depois do } 1', fala: 'sete quintos: dois quintos depois do um' },
        },
      ],
      esboco: 'O método inteiro: achar o tamanho da parte, ver se passa de 1, contar.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: uma reta de 0 a 2, cada inteiro em **3** partes iguais. Marque $\\frac{4}{3}$. Quantas partes depois do 1?',
      fala: 'No papel: uma reta de zero a dois, cada inteiro em três partes iguais. Marque quatro terços. Quantas partes depois do um?',
      resposta: 1,
      resolucao: [
        { tex: '\\text{cada parte: } \\frac{1}{3}', fala: 'cada parte: um terço' },
        { tex: '\\frac{3}{3} = 1', fala: 'três terços é um' },
        { tex: '\\frac{4}{3}: 1 \\text{ terço depois do } 1', fala: 'quatro terços: um terço depois do um' },
      ],
      esboco: 'Use 3 quadradinhos do caderno por inteiro: a reta sai certa sem régua.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['fracao-reta-n1', 'fracao-reta-n2', 'fracao-reta-n3'],
      esboco: 'Nível 1: que fração o ponto marca, entre 0 e 1. Nível 2: frações maiores que 1. Nível 3: entre quais inteiros fica a fração, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'O $\\frac{3}{4}$ de xícara fica antes do 1: menos que uma xícara cheia. Na próxima aula: de onde sai o $\\frac{3}{4}$ numa divisão.',
      fala: 'O três quartos de xícara fica antes do um: menos que uma xícara cheia. Na próxima aula: de onde sai o três quartos numa divisão.',
      visual: reta({ ...QUARTOS, numero: 0.75 }, 'A reta de quartos com o ponto 3/4 aceso, antes do 1.'),
      esboco: 'Responde ao gancho com o ponto na reta.',
    },
  ],
}
