import type { Aula, Visual } from '@/lib/formation/schema'

// Estimar raízes e raiz cúbica. Com 20 placas, o maior quadrado é 4 × 4 =
// 16 e sobram 4; para 5 × 5 faltam 5. Então √20 fica entre 4 e 5. Testando
// 4,5: 4,5 × 4,5 = 20,25, um pouco mais que 20, então √20 é um pouco menos
// que 4,5. A raiz cúbica é o lado do cubo: o cubo de milhar dos blocos tem
// 1.000 cubinhos e 10 em cada lado, ∛1.000 = 10. Os erros a desmontar:
// responder os quadrados (entre 16 e 25) no lugar dos lados, a raiz como
// metade e a raiz cúbica como divisão por 3 (∛27 = 9). Fecha a unidade com a
// missão da caixa-d'água cúbica de 1.000 L e a horta de 50 m².

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const expr = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })
const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })

const VINTE = ret({ linhas: 4, colunas: 4, sobra: 4, rotulos: true }, 'O quadrado de 4 por 4 montado, com 4 em cima e 4 do lado. Embaixo, as 4 placas que sobraram, soltas e contornadas em âmbar.')
const DENTRO_DO_5 = ret({ linhas: 5, colunas: 5, faixas: [4, 4], rotulos: true }, 'Um quadrado de 5 por 5. Os 16 quadradinhos de 4 por 4 em âmbar, no canto; os outros 9, claros: são os que faltam para o 25. O 20 fica no meio do caminho.')
const RETA_45 = (extra: Record<string, unknown>, esboco: string) => reta({ de: 4, ate: 5, passo: 0.1, marcas: [4, 4.5, 5], ...extra }, esboco)
const CUBO = blocos({ milhares: 1 }, 'O cubo de milhar dos blocos, sozinho no palco: 10 cubinhos de cada lado.')
const CAMADAS = blocos({ milhares: 1, total: 1000 }, 'O mesmo cubo, com 1.000 embaixo: as 10 placas de 10 por 10 empilhadas, uma camada atrás da outra. Proposta: o cubo se abrir nas 10 placas, lado a lado, e voltar.')

export const aula: Aula = {
  id: 'B.U13.A6',
  titulo: 'Estimar raízes e raiz cúbica',
  objetivo: 'Dizer entre quais inteiros fica a raiz de um número que não é quadrado perfeito, estimá-la testando o meio, e achar a raiz cúbica de um cubo perfeito como o lado do cubo.',
  modelo: 'retangulo',
  esboco: 'Abre com 20 placas: qual o maior chão quadrado que dá para montar? O aluno monta fileiras de 4 e o quadrado fecha com 16, sobrando 4. Momento-chave: o 20 está entre os quadrados 16 e 25, então √20 está entre os lados 4 e 5. Depois testa 4,5 (4,5² = 20,25) e chega perto: √20 é um pouco menos que 4,5. Em seguida, o cubo de milhar dos blocos: 1.000 cubinhos, 10 em cada lado, ∛1.000 = 10, e ∛27 = 3. Fecha a unidade com a missão: a caixa-d\'água cúbica de 1.000 L e a horta de 50 m².',
  vega: 'Ideia central: se um número fica entre dois quadrados perfeitos, a raiz dele fica entre os lados desses quadrados. 16 < 20 < 25, então 4 < √20 < 5. Para chegar mais perto, teste o meio: 4,5² = 20,25, um pouco mais que 20, então √20 ≈ 4,47, um pouco menos que 4,5. Raiz cúbica: o número que, multiplicado três vezes por ele mesmo, dá aquele número; é o lado (a aresta) do cubo com aquele volume. ∛1.000 = 10, ∛27 = 3, ∛8 = 2. Missão: a caixa-d\'água cúbica de 1.000 L tem 1 m³ (1 L = 1 dm³, unidade 9), então tem 10 dm = 1 m de lado por dentro. A horta de 50 m²: 49 < 50 < 64, o lado fica entre 7 m e 8 m, bem perto de 7 (7,1² = 50,41). Erros esperados: responder 16 e 25 no lugar de 4 e 5; achar a raiz como metade (√20 = 10); dividir por 3 na raiz cúbica (∛27 = 9); multiplicar 4,5 × 4,5 por partes (16,25). Guie com "Qual o maior quadrado que cabe?", "E o próximo quadrado?", "A resposta é o lado ou a área?", "Quanto é o seu número vezes ele mesmo, três vezes?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você tem **20** placas quadradas de 1 m². Qual é o maior chão **quadrado** que dá para montar com elas?',
      fala: 'Você tem vinte placas quadradas de um metro quadrado. Qual é o maior chão quadrado que dá para montar com elas?',
      visual: ret({ linhas: 0, colunas: 4, sobra: 20 }, 'As 20 placas soltas, contornadas em âmbar, em fileiras de 4. Ainda nenhum chão montado.'),
      esboco: 'Na aula passada, 36 placas fecharam um quadrado. Agora, 20 não fecham. A pergunta fica aberta.',
    },
    {
      tipo: 'mexa',
      texto: 'Monte fileiras de 4 até fechar um quadrado. Sobra alguma placa?',
      fala: 'Monte fileiras de quatro até fechar um quadrado. Sobra alguma placa?',
      visual: ret({ linhas: 0, colunas: 4, adicionar: true, rotulos: true, total: 20 }, 'O chão vazio e as 20 placas soltas embaixo. Cada toque em "+ 1 linha" puxa uma fileira de 4 para o chão.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em "+ 1 linha" até o chão ficar quadrado.',
        sucesso: { linhas: 4 },
        mostre: 'Quatro fileiras de 4 entram: o quadrado de 4 por 4 fecha com 16 placas, e 4 ficam soltas embaixo.',
      },
      descoberta: 'O maior quadrado tem 4 de lado: 16 placas, e sobram 4. Para um quadrado de 5 por 5, seriam precisas 25.',
      esboco: 'O gesto da aula passada, mas agora sobra. A sobra é a pista: o 20 passou do 16 e não chegou ao 25.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Um quadrado de 20 m² teria o lado entre quais números?',
      fala: 'Um quadrado de vinte metros quadrados teria o lado entre quais números?',
      visual: VINTE,
      opcoes: [
        {
          texto: 'Entre 16 e 25', erro: 'estima-com-os-quadrados',
          explica: '16 e 25 são as áreas dos quadrados vizinhos. A pergunta é o lado: 4 e 5.',
          fala: 'Dezesseis e vinte e cinco são as áreas dos quadrados vizinhos. A pergunta é o lado: quatro e cinco.',
          mostra: DENTRO_DO_5,
        },
        {
          texto: 'Entre 10 e 11', erro: 'raiz-e-a-metade',
          explica: '10 é a metade de 20. Um quadrado de lado 10 teria 100 placas. O de 20 tem lado entre 4 e 5.',
          fala: 'Dez é a metade de vinte. Um quadrado de lado dez teria cem placas. O de vinte tem lado entre quatro e cinco.',
          mostra: DENTRO_DO_5,
        },
        {
          texto: 'Entre 4 e 5', certa: true,
          explica: 'Isso. 20 fica entre ${4^2 = 16}$ e ${5^2 = 25}$. Então ${\\sqrt{20}}$ fica entre 4 e 5.',
          fala: 'Isso. Vinte fica entre quatro ao quadrado, dezesseis, e cinco ao quadrado, vinte e cinco. Então a raiz de vinte fica entre quatro e cinco.',
          mostra: DENTRO_DO_5,
        },
      ],
      esboco: 'O momento-chave. O quadrado de 5 por 5 aparece com o de 4 por 4 em âmbar no canto: o 20 está entre os dois.',
    },
    {
      tipo: 'passo',
      problema: 'Chegue mais perto. ${\\sqrt{20}}$ fica entre 4 e 5. Teste o meio: 4,5.',
      fala: 'Chegue mais perto. A raiz de vinte fica entre quatro e cinco. Teste o meio: quatro vírgula cinco.',
      visual: RETA_45({}, 'A reta de 4 a 5, de décimo em décimo, com 4, 4,5 e 5 escritos.'),
      passos: [
        {
          pergunta: 'Quanto é ${4{,}5 \\times 4{,}5}$?',
          fala: 'Quanto é quatro vírgula cinco vezes quatro vírgula cinco?',
          opcoes: [
            { texto: '16,25', erro: 'multiplica-partes-separadas', explica: '${4 \\times 4}$ e ${0{,}5 \\times 0{,}5}$ deixam de fora os pedaços cruzados. Faça ${45 \\times 45 = 2.025}$: 20,25.', fala: 'Quatro vezes quatro e zero vírgula cinco vezes zero vírgula cinco deixam de fora os pedaços cruzados. Faça quarenta e cinco vezes quarenta e cinco: vinte vírgula vinte e cinco.', mostra: RETA_45({ numeros: [4.5] }, 'O ponto 4,5 aceso na reta.') },
            { texto: '20,25', certa: true, explica: 'Isso. ${45 \\times 45 = 2.025}$, com duas casas: 20,25.', fala: 'Isso. Quarenta e cinco vezes quarenta e cinco é dois mil e vinte e cinco, com duas casas: vinte vírgula vinte e cinco.', mostra: RETA_45({ numeros: [4.5] }, 'O ponto 4,5 aceso na reta.') },
            { texto: '9', explica: '9 é ${4{,}5 + 4{,}5}$. Ao quadrado é vezes: ${4{,}5 \\times 4{,}5 = 20{,}25}$.', fala: 'Nove é quatro vírgula cinco mais quatro vírgula cinco. Ao quadrado é vezes: vinte vírgula vinte e cinco.', mostra: RETA_45({ numeros: [4.5] }, 'O ponto 4,5 aceso na reta.') },
          ],
          linha: { tex: '4{,}5^2 = 20{,}25', fala: 'quatro vírgula cinco ao quadrado é vinte vírgula vinte e cinco' },
        },
        {
          pergunta: '20,25 passa um pouco de 20. Então ${\\sqrt{20}}$ é…',
          fala: 'Vinte vírgula vinte e cinco passa um pouco de vinte. Então a raiz de vinte é…',
          opcoes: [
            { texto: 'um pouco mais que 4,5', explica: 'Um lado maior que 4,5 daria mais que 20,25. Como 20,25 já passou de 20, o lado é um pouco menor.', fala: 'Um lado maior que quatro vírgula cinco daria mais que vinte vírgula vinte e cinco. Como isso já passou de vinte, o lado é um pouco menor.', mostra: RETA_45({ aproximado: 4.47 }, 'O anel um pouco antes do 4,5.') },
            { texto: 'exatamente 4,5', explica: '${4{,}5^2 = 20{,}25}$, não 20. Fica perto, mas um pouco antes: cerca de 4,47.', fala: 'Quatro vírgula cinco ao quadrado é vinte vírgula vinte e cinco, não vinte. Fica perto, mas um pouco antes: cerca de quatro vírgula quarenta e sete.', mostra: RETA_45({ aproximado: 4.47 }, 'O anel um pouco antes do 4,5.') },
            { texto: 'um pouco menos que 4,5', certa: true, explica: 'Isso. O quadrado de 4,5 passou de 20, então o lado é um pouco menor: ${\\sqrt{20} \\approx 4{,}47}$.', fala: 'Isso. O quadrado de quatro vírgula cinco passou de vinte, então o lado é um pouco menor: a raiz de vinte é mais ou menos quatro vírgula quarenta e sete.', mostra: RETA_45({ aproximado: 4.47 }, 'Um anel branco um pouco antes do 4,5: a raiz de 20 mora ali.') },
          ],
          linha: { tex: '4 < \\sqrt{20} < 4{,}5', fala: 'a raiz de vinte fica entre quatro e quatro vírgula cinco, perto de quatro vírgula cinco' },
        },
      ],
      esboco: 'A estimativa por tentativa, com a multiplicação de decimais da unidade 8. A reta mostra o anel da raiz um pouco antes do meio.',
    },
    {
      tipo: 'anote',
      titulo: 'Estimar uma raiz',
      definicao: 'Ache os quadrados perfeitos vizinhos do número. A **raiz** fica entre os lados deles.',
      exemplo: { tex: '16 < 20 < 25 \\;\\Rightarrow\\; 4 < \\sqrt{20} < 5', fala: 'dezesseis é menor que vinte, que é menor que vinte e cinco; então a raiz de vinte fica entre quatro e cinco' },
      alerta: 'A resposta são os lados, 4 e 5, não as áreas 16 e 25. Para chegar mais perto, teste o meio: ${4{,}5^2 = 20{,}25}$.',
      esboco: 'Na página: o quadrado de 4 por 4 dentro do de 5 por 5, com 16, 20 e 25 escritos; ao lado, a reta de 4 a 5 com o 4,5.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora um cubo. O cubo grande dos blocos tem **1.000** cubinhos. Quantos cubinhos vão em cada lado dele?',
      fala: 'Agora um cubo. O cubo grande dos blocos tem mil cubinhos. Quantos cubinhos vão em cada lado dele?',
      visual: CUBO,
      opcoes: [
        {
          texto: '333', erro: 'raiz-cubica-e-dividir-por-3',
          explica: '333 é o 1.000 dividido por 3. Mas o cubo multiplica: 10 camadas de 10 por 10, ${10 \\times 10 \\times 10}$.',
          fala: 'Trezentos e trinta e três é mil dividido por três. Mas o cubo multiplica: dez camadas de dez por dez, dez vezes dez vezes dez.',
          mostra: CAMADAS,
        },
        {
          texto: '100',
          explica: '100 é uma camada, uma placa de 10 por 10. O cubo tem 10 dessas placas, e cada lado tem 10.',
          fala: 'Cem é uma camada, uma placa de dez por dez. O cubo tem dez dessas placas, e cada lado tem dez.',
          mostra: CAMADAS,
        },
        {
          texto: '10', certa: true,
          explica: 'Isso. São 10 camadas de ${10 \\times 10}$: ${10 \\times 10 \\times 10 = 1.000}$.',
          fala: 'Isso. São dez camadas de dez por dez: dez vezes dez vezes dez é mil.',
          mostra: CAMADAS,
        },
      ],
      esboco: 'O cubo de milhar da unidade 1 volta como figura de volume. Todas as opções mostram o cubo com 1.000 embaixo: 10 placas de 100 empilhadas.',
    },
    {
      tipo: 'anote',
      titulo: 'Raiz cúbica',
      definicao: 'A **raiz cúbica** de um número é o número que, multiplicado três vezes por ele mesmo, dá aquele número: o lado do cubo.',
      exemplo: { tex: '\\sqrt[3]{1.000} = 10 \\quad \\text{porque} \\quad 10^3 = 1.000', fala: 'raiz cúbica de mil é dez, porque dez ao cubo, dez vezes dez vezes dez, é mil' },
      alerta: 'Não é dividir por 3: ${\\sqrt[3]{27}}$ não é 9. Confira: ${9 \\times 9 \\times 9 = 729}$.',
      esboco: 'Na página: o cubo de milhar com 10 em cada aresta, e o símbolo ∛ com o 3 pequeno.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto é ${\\sqrt[3]{27}}$?',
      fala: 'Quanto é a raiz cúbica de vinte e sete?',
      visual: expr(['? × ? × ? = 27'], 'A conta com três "?" iguais e o 27 no fim.'),
      opcoes: [
        {
          texto: '9', erro: 'raiz-cubica-e-dividir-por-3',
          explica: '${27 \\div 3 = 9}$, mas ${9 \\times 9 \\times 9 = 729}$. A raiz cúbica é o lado do cubo: 3.',
          fala: 'Vinte e sete dividido por três é nove, mas nove vezes nove vezes nove é setecentos e vinte e nove. A raiz cúbica é o lado do cubo: três.',
          mostra: expr(['9 × 9 × 9', '729'], '9 × 9 × 9 em cima e 729 grande embaixo: passa muito de 27.'),
        },
        {
          texto: '3', certa: true,
          explica: 'Isso. ${3 \\times 3 = 9}$ e ${9 \\times 3 = 27}$: um cubo de 3 cubinhos em cada lado.',
          fala: 'Isso. Três vezes três é nove, e nove vezes três é vinte e sete: um cubo de três cubinhos em cada lado.',
          mostra: expr(['3 × 3 × 3', '27'], 'A conta preenchida: 3 × 3 × 3 em cima, 27 grande embaixo.'),
        },
        {
          texto: '5',
          explica: '${5 \\times 5 \\times 5 = 125}$: passou de 27. Tente um número menor: ${3 \\times 3 \\times 3 = 27}$.',
          fala: 'Cinco vezes cinco vezes cinco é cento e vinte e cinco: passou de vinte e sete. Tente um número menor: três vezes três vezes três é vinte e sete.',
          mostra: expr(['5 × 5 × 5', '125'], '5 × 5 × 5 em cima e 125 embaixo.'),
        },
      ],
      esboco: 'O alerta do anote virado pergunta. Proposta: um cubo de 3 × 3 × 3 cubinhos (os blocos ainda não desenham um cubo de outro tamanho que o de milhar).',
    },
    {
      tipo: 'passo',
      problema: 'Missão: uma caixa-d\'água em forma de cubo guarda **1.000 L**. Quanto mede cada lado, por dentro?',
      fala: 'Missão: uma caixa-d\'água em forma de cubo guarda mil litros. Quanto mede cada lado, por dentro?',
      visual: CUBO,
      passos: [
        {
          pergunta: 'Lembre: 1 L é um cubinho de 1 dm de lado, ou 1 dm³. Quantos dm³ cabem na caixa?',
          fala: 'Lembre: um litro é um cubinho de um decímetro de lado, ou um decímetro cúbico. Quantos decímetros cúbicos cabem na caixa?',
          opcoes: [
            { texto: '1 dm³', erro: 'confunde-m3-com-litro', explica: '1 dm³ é um litro só, um cubinho. A caixa guarda 1.000 litros: 1.000 cubinhos.', fala: 'Um decímetro cúbico é um litro só, um cubinho. A caixa guarda mil litros: mil cubinhos.', mostra: CUBO },
            { texto: '1.000 dm³', certa: true, explica: 'Isso. Cada litro é um cubinho de 1 dm³: são 1.000 cubinhos, o cubo grande dos blocos.', fala: 'Isso. Cada litro é um cubinho de um decímetro cúbico: são mil cubinhos, o cubo grande dos blocos.', mostra: CUBO },
          ],
          linha: { tex: '1.000 \\text{ L} = 1.000 \\text{ dm}^3', fala: 'mil litros são mil decímetros cúbicos' },
        },
        {
          pergunta: 'Quantos cubinhos de 1 dm vão em cada lado?',
          fala: 'Quantos cubinhos de um decímetro vão em cada lado?',
          opcoes: [
            { texto: '10', certa: true, explica: 'Isso. ${\\sqrt[3]{1.000} = 10}$: o lado tem 10 dm.', fala: 'Isso. A raiz cúbica de mil é dez: o lado tem dez decímetros.', mostra: CAMADAS },
            { texto: '333', erro: 'raiz-cubica-e-dividir-por-3', explica: 'Dividir por 3 não desfaz o cubo. ${10 \\times 10 \\times 10 = 1.000}$: o lado tem 10.', fala: 'Dividir por três não desfaz o cubo. Dez vezes dez vezes dez é mil: o lado tem dez.', mostra: CAMADAS },
          ],
          linha: { tex: '\\sqrt[3]{1.000} = 10 \\text{ dm} = 1 \\text{ m}', fala: 'raiz cúbica de mil é dez decímetros, um metro' },
        },
      ],
      esboco: 'A missão da unidade: o cubo dos blocos é a caixa-d\'água. Cada cubinho é um litro, e 10 dm de lado são 1 m: a caixa de 1.000 L é um cubo de 1 m por dentro.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: uma horta quadrada tem **50 m²**. O lado fica entre quais metros inteiros? Digite o menor deles.',
      fala: 'No papel: uma horta quadrada tem cinquenta metros quadrados. O lado fica entre quais metros inteiros? Digite o menor deles.',
      resposta: 7,
      resolucao: [
        { tex: '7^2 = 49 \\qquad 8^2 = 64', fala: 'sete ao quadrado é quarenta e nove; oito ao quadrado é sessenta e quatro' },
        { tex: '49 < 50 < 64 \\;\\Rightarrow\\; 7 < \\sqrt{50} < 8', fala: 'cinquenta fica entre quarenta e nove e sessenta e quatro; a raiz de cinquenta fica entre sete e oito' },
        { tex: '\\sqrt{50} \\approx 7{,}1 \\text{ m}', fala: 'a raiz de cinquenta é mais ou menos sete vírgula um metros' },
      ],
      esboco: 'A estimativa sozinha, no papel. O 50 fica colado no 49: o lado é só um pouco mais que 7 m (7,1² = 50,41).',
    },
    {
      tipo: 'sua-vez',
      geradores: ['estimar-raiz-n1', 'estimar-raiz-n2', 'estimar-raiz-n3'],
      esboco: 'Nível 1: entre quais inteiros fica a raiz, com o quadrado e a sobra na tela. Nível 2: a raiz cúbica de um cubo perfeito, e de qual inteiro a raiz fica mais perto. Nível 3: a horta, a caixa cúbica e o azulejo, sem visual.',
    },
    {
      tipo: 'fecho',
      texto: 'Fim da unidade. A raiz desfaz a potência: ${\\sqrt{36} = 6}$, ${\\sqrt[3]{1.000} = 10}$. Na próxima unidade: as letras entram nas contas.',
      fala: 'Fim da unidade. A raiz desfaz a potência: raiz de trinta e seis é seis, raiz cúbica de mil é dez. Na próxima unidade: as letras entram nas contas.',
      visual: CUBO,
      esboco: 'Fecha a unidade com o cubo da caixa-d\'água e anuncia a linguagem algébrica.',
    },
  ],
}
