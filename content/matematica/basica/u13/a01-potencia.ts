import type { Aula, Visual } from '@/lib/formation/schema'

// Potência: multiplicar o mesmo número várias vezes. Começa no papel
// dobrado: cada dobra dobra as camadas (2, 4, 8, 16, 32). Cinco dobras são
// cinco 2 multiplicados, e isso se escreve 2⁵. Momento-chave: 2³ é
// 2 × 2 × 2 = 8, não 2 × 3 = 6. Depois os nomes: o quadrado de lado 3
// (3² = 9, "ao quadrado") no retângulo, o cubo de 10 × 10 × 10 = 1.000 nos
// blocos ("ao cubo") e as potências de 10, em que o expoente conta os zeros.
// Os erros a desmontar: multiplicar a base pelo expoente (2³ = 6), trocar a
// base e o expoente (2³ = 9) e contar os zeros errado (10⁶ = 100.000).

const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })
const exp = (expressao: string[], esboco: string, destaque?: string): Visual => ({ modelo: 'livre', estado: { expressao, ...(destaque ? { destaque } : {}) }, esboco })
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const blocos = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'blocos', estado, esboco })

/** A tabela das dobras: 1 a 5 dobras, 2 a 32 camadas, "× 2" embaixo de cada passo. */
const DOBRAS = (extra: Record<string, unknown>, esboco: string) => tab(
  {
    linhas: [
      { rotulo: 'dobras', valores: [1, 2, 3, 4, 5] },
      { rotulo: 'camadas', valores: [2, 4, 8, 16, 32] },
    ],
    setas: [0, 1, 2, 3].map((i) => ({ de: i, para: i + 1, rotulo: '× 2', embaixo: true })),
    ...extra,
  },
  esboco,
)

/** A tabela das potências de 10. */
const DEZ = (potencias: string[], valores: (number | string)[], extra: Record<string, unknown>, esboco: string) => tab(
  { linhas: [{ rotulo: 'potência', valores: potencias }, { rotulo: 'valor', valores }], ...extra },
  esboco,
)
const DEZ_ATE_3 = DEZ(['10¹', '10²', '10³'], [10, 100, 1000], {}, 'A tabela: 10¹, 10², 10³ em cima; 10, 100, 1.000 embaixo.')
const DEZ_ATE_6 = DEZ(['10³', '10⁴', '10⁵', '10⁶'], [1000, 10000, 100000, 1000000], { destaque: [3] }, 'A tabela continua: 10³ a 10⁶, com 1.000, 10.000, 100.000 e 1.000.000. A coluna do 10⁶ em moldura âmbar: seis zeros.')

/** A notícia: cada pessoa conta para 3 novas. */
const NOTICIA = (valores: (number | string)[], esboco: string) => tab(
  { linhas: [{ rotulo: 'rodada', valores: [1, 2, 3, 4] }, { rotulo: 'pessoas', valores }], setas: [0, 1, 2].map((i) => ({ de: i, para: i + 1, rotulo: '× 3', embaixo: true })) },
  esboco,
)

const DOIS_AO_CUBO = exp(['2³', '2 × 2 × 2', '8'], 'Três linhas: 2³, depois 2 × 2 × 2 por extenso, e o 8 grande embaixo.')

export const aula: Aula = {
  id: 'B.U13.A1',
  titulo: 'Potência',
  objetivo: 'Escrever e calcular uma potência como multiplicação do mesmo número (2³ = 2 × 2 × 2 = 8), nomear base e expoente, ler "ao quadrado" e "ao cubo" e escrever potências de 10 contando os zeros.',
  modelo: 'livre',
  esboco: 'Abre numa folha de papel: cada dobra dobra as camadas. O aluno completa a tabela das dobras e vê o × 2 se repetir. Cinco dobras são cinco 2 multiplicados: 2⁵ = 32. Momento-chave: na aposta, 2³ é 2 × 2 × 2 = 8, não 2 × 3 = 6. Depois os nomes com imagem: o quadrado de lado 3 (3², ao quadrado), o cubo de 10 placas (10³ = 1.000, ao cubo) e as potências de 10, em que o expoente conta os zeros. Fecha com a notícia passada adiante (3⁴ = 81).',
  vega: 'Ideia central: potência é multiplicação repetida do mesmo número. Em 2³, a base é 2 (o número que se multiplica) e o expoente é 3 (quantas vezes ele aparece): 2³ = 2 × 2 × 2 = 8. "Ao quadrado" vem do quadrado: um quadrado de lado 3 tem 3 × 3 = 3² = 9 quadradinhos. "Ao cubo" vem do cubo: o bloco de milhar tem 10 × 10 × 10 = 10³ = 1.000 cubinhos. Nas potências de 10, o expoente conta os zeros: 10⁶ = 1.000.000. Erros esperados: multiplicar a base pelo expoente (2³ = 6, 10³ = 30), trocar base e expoente (2³ = 9), contar os zeros errado (10⁶ = 100.000). Guie com "Escreva por extenso: quantos 2 aparecem?", "Multiplique de dois em dois", "Quantos zeros o expoente pede?". Não fale ainda de expoente zero ou negativo: isso é da aula 3.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Dobre uma folha ao meio: **2** camadas. Dobre de novo: **4**. Com **5** dobras, quantas camadas?',
      fala: 'Dobre uma folha ao meio: duas camadas. Dobre de novo: quatro. Com cinco dobras, quantas camadas?',
      visual: DOBRAS({ mostradas: 2 }, 'A tabela das dobras com só as duas primeiras colunas: 1 dobra, 2 camadas; 2 dobras, 4 camadas. As outras três colunas são caixas vazias.'),
      esboco: 'Quem chuta "10" pensa em somar 2 a cada dobra. A pergunta fica no ar até o Mexa.',
    },
    {
      tipo: 'mexa',
      texto: 'Cada dobra põe uma folha em cima da outra: as camadas **dobram**. Complete a tabela até 5 dobras.',
      fala: 'Cada dobra põe uma folha em cima da outra: as camadas dobram. Complete a tabela até cinco dobras.',
      visual: DOBRAS({ completar: true, mostradas: 2 }, 'A tabela começa com 2 e 4. Cada toque preenche uma coluna: 8, 16, 32, com "× 2" embaixo de cada passo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na coluna vazia para fazer mais uma dobra.',
        sucesso: { colunas: 5 },
        mostre: 'As colunas se preenchem até 5 dobras: 8, 16, 32 camadas, com "× 2" embaixo de cada passo.',
      },
      descoberta: 'A cada dobra, as camadas são multiplicadas por 2. Cinco dobras: 2 × 2 × 2 × 2 × 2 = 32.',
      esboco: 'As setas "× 2" embaixo mostram que a conta se repete: é sempre o mesmo número multiplicado.',
    },
    {
      tipo: 'ideia',
      texto: 'Cinco dobras são cinco 2 multiplicados. Para não escrever tudo, escreve-se $2^5$: o **5** conta quantos 2.',
      fala: 'Cinco dobras são cinco dois multiplicados. Para não escrever tudo, escreve-se dois elevado a cinco: o cinco conta quantos dois.',
      visual: exp(['2 × 2 × 2 × 2 × 2', '2⁵ = 32'], 'Em cima, pequeno, 2 × 2 × 2 × 2 × 2; embaixo, grande, 2⁵ = 32.', '2⁵'),
      esboco: 'A notação chega como resumo do que o aluno já fez. O 2⁵ fica na moldura âmbar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Então quanto é $2^3\\text{?}$',
      fala: 'Então quanto é dois elevado a três?',
      visual: exp(['2³ = ?'], 'A conta grande no centro, com o "?".'),
      opcoes: [
        {
          texto: '8', certa: true,
          explica: 'Isso. Três 2 multiplicados: ${2 \\times 2 = 4}$ e ${4 \\times 2 = 8}$. São as camadas de 3 dobras.',
          fala: 'Isso. Três dois multiplicados: dois vezes dois, quatro, e quatro vezes dois, oito. São as camadas de três dobras.',
          mostra: DOIS_AO_CUBO,
        },
        {
          texto: '6', erro: 'potencia-multiplica-base-pelo-expoente',
          explica: '6 é ${2 \\times 3}$. O 3 não multiplica: ele conta quantos 2. ${2 \\times 2 \\times 2 = 8}$.',
          fala: 'Seis é dois vezes três. O três não multiplica: ele conta quantos dois. Dois vezes dois vezes dois, oito.',
          mostra: DOIS_AO_CUBO,
        },
        {
          texto: '9', erro: 'potencia-troca-base-e-expoente',
          explica: '9 é ${3 \\times 3}$, o 3 que se repete. Em $2^3$ quem se repete é o 2, três vezes: 8.',
          fala: 'Nove é três vezes três, o três que se repete. Em dois elevado a três quem se repete é o dois, três vezes: oito.',
          mostra: DOIS_AO_CUBO,
        },
      ],
      esboco: 'O momento-chave: 2³ não é 2 × 3. Todas as opções mostram 2 × 2 × 2 por extenso e o 8.',
    },
    {
      tipo: 'anote',
      titulo: 'Potência',
      definicao: '**Potência** é multiplicar o mesmo número várias vezes. A **base** é o número; o **expoente** diz quantas vezes ele aparece.',
      exemplo: { tex: '2^3 = 2 \\times 2 \\times 2 = 8', fala: 'dois elevado a três é dois vezes dois vezes dois, igual a oito' },
      alerta: '$2^3$ não é ${2 \\times 3}$. São três 2 multiplicados: 8, não 6.',
      esboco: 'Na página: 2³ com setas, "base" no 2 e "expoente" no 3. Embaixo, 2 × 2 × 2 = 8.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora um **quadrado** de lado 3: monte 3 linhas de 3 quadradinhos.',
      fala: 'Agora um quadrado de lado três: monte três linhas de três quadradinhos.',
      visual: ret({ linhas: 0, colunas: 3, rotulos: true, adicionar: true }, 'O retângulo vazio, com o botão "+ 1 linha". Cada toque desliza uma linha de 3 quadradinhos.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para pôr linhas de 3 até fechar o quadrado.',
        sucesso: { linhas: 3 },
        mostre: 'Três linhas de 3 quadradinhos entram, uma depois da outra: o quadrado de lado 3.',
      },
      descoberta: 'O quadrado de lado 3 tem 3 × 3 = 9 quadradinhos: 3². Por isso 3² se lê "3 ao quadrado".',
      esboco: 'O nome "ao quadrado" sai do desenho. O próximo cartão diz o nome junto com o cubo.',
    },
    {
      tipo: 'mexa',
      texto: 'O quadrado tem ${3 \\times 3 = 9}$: $3^2$ é **3 ao quadrado**. Agora o cubo: junte **10 placas** de ${10 \\times 10}$.',
      fala: 'O quadrado tem três vezes três, nove: três elevado a dois é três ao quadrado. Agora o cubo: junte dez placas de dez por dez.',
      visual: blocos({ milhares: 0, centenas: 10, dezenas: 0, unidades: 0, total: 1000 }, 'As 10 placas de cem, separadas. Ao lado, o contorno do bloco de mil.'),
      acao: {
        tipo: 'arrastar',
        instrucao: 'Junte as 10 placas num bloco.',
        sucesso: { milhares: 1, centenas: 0, dezenas: 0, unidades: 0 },
        mostre: 'As dez placas se empilham e viram o bloco de mil: 10 × 10 × 10 cubinhos.',
      },
      descoberta: 'O cubo tem 10 × 10 × 10 = 1.000 cubinhos: 10³, "10 ao cubo".',
      esboco: 'O bloco de milhar da unidade 1, agora visto como um cubo: 10 de largura, 10 de fundo, 10 de altura.',
    },
    {
      tipo: 'ideia',
      texto: 'O bloco tem ${10 \\times 10 \\times 10 = 1{.}000}$ cubinhos. Por isso $10^3$ se lê **10 ao cubo**.',
      fala: 'O bloco tem dez vezes dez vezes dez, mil cubinhos. Por isso dez elevado a três se lê dez ao cubo.',
      visual: blocos({ milhares: 1, centenas: 1, dezenas: 1, unidades: 1, rotulos: { unidades: '1', dezenas: '10', centenas: '10 × 10', milhares: '10 × 10 × 10' } }, 'Lado a lado: o cubinho, a barra, a placa e o bloco, com 1, 10, 10 × 10 e 10 × 10 × 10 embaixo de cada um.'),
      esboco: 'As quatro peças da unidade 1, agora como potências de 10: a barra é 10, a placa é 10², o bloco é 10³.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Veja os zeros na tabela. Quanto é $10^6\\text{?}$',
      fala: 'Veja os zeros na tabela. Quanto é dez elevado a seis?',
      visual: DEZ_ATE_3,
      opcoes: [
        {
          texto: '1.000.000', certa: true,
          explica: 'Isso. Cada 10 a mais põe um zero. Em potência de 10, o **expoente conta os zeros**: seis.',
          fala: 'Isso. Cada dez a mais põe um zero. Em potência de dez, o expoente conta os zeros: seis.',
          mostra: DEZ_ATE_6,
        },
        {
          texto: '60', erro: 'potencia-multiplica-base-pelo-expoente',
          explica: '60 é ${10 \\times 6}$. São seis 10 multiplicados: um 1 e seis zeros, 1.000.000.',
          fala: 'Sessenta é dez vezes seis. São seis dez multiplicados: um um e seis zeros, um milhão.',
          mostra: DEZ_ATE_6,
        },
        {
          texto: '100.000', erro: 'conta-zeros-errado',
          explica: '100.000 tem cinco zeros: é $10^5$. Com seis 10, são seis zeros: 1.000.000.',
          fala: 'Cem mil tem cinco zeros: é dez elevado a cinco. Com seis dez, são seis zeros: um milhão.',
          mostra: DEZ_ATE_6,
        },
      ],
      esboco: 'A tabela mostra o padrão de 10¹ a 10³. A opção certa estende a tabela até 10⁶.',
    },
    {
      tipo: 'passo',
      problema: 'Você conta uma notícia a **3** pessoas. Cada uma conta a **3** novas, e assim por diante. Quantas ouvem na **4ª** rodada?',
      fala: 'Você conta uma notícia a três pessoas. Cada uma conta a três novas, e assim por diante. Quantas ouvem na quarta rodada?',
      visual: NOTICIA([3, '?', '?', '?'], 'A tabela das rodadas: 1, 2, 3, 4 em cima; embaixo, 3 e três "?", com "× 3" entre as colunas.'),
      passos: [
        {
          pergunta: 'Como fica a conta da 4ª rodada, com potência?',
          fala: 'Como fica a conta da quarta rodada, com potência?',
          opcoes: [
            { texto: '$3^4$', certa: true, explica: 'Isso. Quatro rodadas, quatro vezes o 3: ${3 \\times 3 \\times 3 \\times 3}$.', fala: 'Isso. Quatro rodadas, quatro vezes o três: três vezes três vezes três vezes três.', mostra: NOTICIA([3, '?', '?', '?'], 'A mesma tabela; o 3 da primeira coluna acende.') },
            { texto: '$4^3$', erro: 'potencia-troca-base-e-expoente', explica: 'Quem se repete é o 3, a cada rodada. São quatro rodadas: $3^4$.', fala: 'Quem se repete é o três, a cada rodada. São quatro rodadas: três elevado a quatro.' },
            { texto: '${3 \\times 4}$', erro: 'potencia-multiplica-base-pelo-expoente', explica: '${3 \\times 4}$ seria somar 3 a cada rodada. Aqui cada rodada multiplica por 3.', fala: 'Três vezes quatro seria somar três a cada rodada. Aqui cada rodada multiplica por três.' },
          ],
          linha: { tex: '3^4 = 3 \\times 3 \\times 3 \\times 3', fala: 'três elevado a quatro é três vezes três vezes três vezes três' },
        },
        {
          pergunta: 'Multiplique de dois em dois. Quanto é ${3 \\times 3}$, a 2ª rodada?',
          fala: 'Multiplique de dois em dois. Quanto é três vezes três, a segunda rodada?',
          opcoes: [
            { texto: '9', certa: true, explica: 'Isso. Na 2ª rodada, 9 pessoas: $3^2$.', fala: 'Isso. Na segunda rodada, nove pessoas: três ao quadrado.', mostra: NOTICIA([3, 9, '?', '?'], 'O 9 entra na segunda coluna.') },
            { texto: '6', explica: '6 é ${3 + 3}$. Cada uma das 3 pessoas conta a 3 novas: ${3 \\times 3 = 9}$.', fala: 'Seis é três mais três. Cada uma das três pessoas conta a três novas: três vezes três, nove.' },
          ],
          linha: { tex: '3 \\times 3 = 9', fala: 'três vezes três, nove' },
        },
        {
          pergunta: 'Continue: ${9 \\times 3}$ e depois ${27 \\times 3}$. Quantas pessoas na 4ª rodada?',
          fala: 'Continue: nove vezes três e depois vinte e sete vezes três. Quantas pessoas na quarta rodada?',
          opcoes: [
            { texto: '81', certa: true, explica: 'Isso. 27 na 3ª rodada e 81 na 4ª: ${3^4 = 81}$.', fala: 'Isso. Vinte e sete na terceira rodada e oitenta e um na quarta: três elevado a quatro, oitenta e um.', mostra: NOTICIA([3, 9, 27, 81], 'A tabela inteira: 3, 9, 27, 81.') },
            { texto: '27', explica: '27 é a 3ª rodada, $3^3$. Falta mais um 3: ${27 \\times 3 = 81}$.', fala: 'Vinte e sete é a terceira rodada, três ao cubo. Falta mais um três: vinte e sete vezes três, oitenta e um.', mostra: NOTICIA([3, 9, 27, '?'], 'O 27 entra na terceira coluna; a quarta continua com "?".') },
            { texto: '64', erro: 'potencia-troca-base-e-expoente', explica: '64 é $4^3$. Aqui o 3 se repete quatro vezes: 81.', fala: 'Sessenta e quatro é quatro ao cubo. Aqui o três se repete quatro vezes: oitenta e um.' },
          ],
          linha: { tex: '9 \\times 3 = 27, \\quad 27 \\times 3 = 81', fala: 'nove vezes três, vinte e sete; vinte e sete vezes três, oitenta e um' },
        },
      ],
      esboco: 'A tabela das rodadas se preenche com o caderno: 3, 9, 27, 81. Contexto diferente, a mesma ideia do papel dobrado.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: escreva $5^3$ por extenso e calcule.',
      fala: 'No papel: escreva cinco elevado a três por extenso e calcule.',
      resposta: 125,
      resolucao: [
        { tex: '5^3 = 5 \\times 5 \\times 5', fala: 'cinco elevado a três é cinco vezes cinco vezes cinco' },
        { tex: '5 \\times 5 = 25, \\quad 25 \\times 5 = 125', fala: 'cinco vezes cinco, vinte e cinco; vinte e cinco vezes cinco, cento e vinte e cinco' },
      ],
      esboco: 'O aluno escreve os três 5 e multiplica de dois em dois. Quem digitar 15 caiu no 5 × 3.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['potencia-n1', 'potencia-n2', 'potencia-n3'],
      esboco: 'Nível 1: o quadrado de um número com o desenho, uma potência pequena por extenso, o expoente de um produto de fatores iguais. Nível 2: potências de 10 (o expoente conta os zeros) e potências maiores. Nível 3: papel dobrado, notícia, bactérias e caixa cúbica, sem desenho.',
    },
    {
      tipo: 'fecho',
      texto: 'Com 5 dobras, a folha tem ${2^5 = 32}$ camadas. Na próxima aula: escrevendo por extenso, as regras das potências aparecem.',
      fala: 'Com cinco dobras, a folha tem dois elevado a cinco, trinta e duas camadas. Na próxima aula: escrevendo por extenso, as regras das potências aparecem.',
      visual: DOBRAS({ destaque: [4] }, 'A tabela das dobras inteira, com a coluna das 5 dobras e 32 camadas em moldura âmbar.'),
      esboco: 'Responde ao gancho com a tabela e anuncia as propriedades.',
    },
  ],
}
