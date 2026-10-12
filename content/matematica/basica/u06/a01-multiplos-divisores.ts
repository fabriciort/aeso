import type { Aula, Visual } from '@/lib/formation/schema'

// A primeira aula da unidade 6. Divisor é o tamanho de fileira que arruma
// um número inteiro em retângulo, sem sobrar. Múltiplo é onde caem os saltos
// de um número na reta. As duas palavras falam da mesma divisão sem resto,
// vista de lados opostos: 3 é divisor de 12, e 12 é múltiplo de 3.

const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const reta = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'reta', estado, esboco })
const R4 = { de: 0, ate: 24, passo: 1, marcas: [0, 4, 8, 12, 16, 20, 24] }
const SALTOS4 = [[0, 4, '+4'], [4, 8, '+4'], [8, 12, '+4'], [12, 16, '+4'], [16, 20, '+4']]

export const aula: Aula = {
  id: 'B.U6.A1',
  titulo: 'Múltiplos e divisores',
  objetivo: 'Reconhecer quando um número divide outro sem resto, listar todos os divisores de um número em pares e listar múltiplos com saltos na reta, sem trocar as duas palavras.',
  modelo: 'retangulo',
  esboco: 'Doze azulejos para um painel. O aluno tenta fileiras de 3 (fecha certinho, 4 fileiras) e de 5 (sobram 2). Os tamanhos que fecham são os divisores de 12, e eles vêm em pares: cada par é um retângulo, que gira. Depois, na reta, as caixas de 4 azulejos: os saltos de 4 caem nos múltiplos de 4, e o 18 fica de fora. Momento-chave: perceber que 3 × 4 é um retângulo só, visto como "3 cabe em 12" (divisor) ou como "12 se forma com 3" (múltiplo).',
  vega: 'Ideia central: se a divisão de a por b não deixa resto, b é divisor de a, e a é múltiplo de b. Divisor é o pequeno, que cabe; múltiplo é o grande, que se forma. Os divisores vêm em pares (1 × 12, 2 × 6, 3 × 4), e cada par é um retângulo. Os múltiplos são os saltos na reta: 4, 8, 12, 16… Erros esperados: trocar as palavras ("12 é divisor de 3"); esquecer o 1 e o próprio número na lista de divisores; achar que todo par é múltiplo de 4. Guie perguntando "Sobra alguma coisa?", "Quem cabe em quem?", "Qual é o par deste divisor?". Para achar todos os divisores, teste 1, 2, 3… até os pares começarem a se repetir. Em Sua vez, peça para imaginar o retângulo ou os saltos.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você tem **12** azulejos para um painel retangular. De quantos jeitos dá para arrumar todos, sem sobrar nenhum?',
      fala: 'Você tem doze azulejos para um painel retangular. De quantos jeitos dá para arrumar todos, sem sobrar nenhum?',
      visual: ret({ linhas: 0, colunas: 12, total: 12 }, 'Os 12 azulejos soltos numa fila, esperando a arrumação.'),
      esboco: 'Uma pergunta de obra, com uma resposta que o aluno ainda não sabe contar.',
    },
    {
      tipo: 'mexa',
      texto: 'Arrume os 12 em fileiras de **3**.',
      fala: 'Arrume os doze em fileiras de três.',
      visual: ret({ linhas: 0, colunas: 3, rotulos: true, adicionar: true, total: 12 }, 'Os 12 azulejos soltos embaixo. Cada toque sobe uma fileira de 3 para o painel; os soltos diminuem: 9, 6, 3, 0.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque para montar uma fileira de 3, até acabarem os azulejos.',
        sucesso: { linhas: 4 },
        mostre: 'Quatro fileiras de 3 sobem, uma por vez. Não sobra nenhum azulejo: o painel é 4 por 3.',
      },
      descoberta: 'Fileiras de 3 fecham o painel: 4 fileiras, nada sobra. 12 ÷ 3 = 4, sem resto.',
      esboco: 'O painel fecha. O último toque acende o retângulo inteiro.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora tente fileiras de **5**.',
      fala: 'Agora tente fileiras de cinco.',
      visual: ret({ linhas: 0, colunas: 5, rotulos: true, adicionar: true, total: 12 }, 'Os mesmos 12 soltos. Cada toque sobe uma fileira de 5.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque até não dar para montar outra fileira de 5.',
        sucesso: { linhas: 2 },
        mostre: 'Duas fileiras de 5 sobem. Ficam 2 azulejos soltos, contornados em âmbar: não dá outra fileira.',
      },
      descoberta: 'Com fileiras de 5, sobram 2 azulejos. 5 não serve: 12 ÷ 5 deixa resto.',
      esboco: 'O contraste com o cartão anterior: o painel não fecha, e os 2 que sobram ficam acesos em âmbar.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Com 12, quais tamanhos de fileira **não deixam sobra**?',
      visual: ret({ linhas: 2, colunas: 5, rotulos: true, sobra: 2 }, 'As 2 fileiras de 5 e os 2 azulejos soltos.'),
      opcoes: [
        {
          texto: '1, 2, 3, 4, 6 e 12', certa: true,
          explica: 'Isso. Uma fileira só de 12 também vale, e 12 fileiras de 1 também.',
          mostra: ret({ linhas: 2, colunas: 6, rotulos: true, total: 12 }, 'O painel se refaz em 2 por 6, depois 1 por 12, sem sobra.'),
        },
        {
          texto: '2, 3, 4 e 6', erro: 'esquece-divisores-extremos',
          explica: 'Faltam o 1 e o 12: uma fileira só de 12 azulejos também é um painel, sem sobra.',
          mostra: ret({ linhas: 1, colunas: 12, rotulos: true, total: 12 }, 'Os 12 azulejos numa fileira só: um retângulo comprido.'),
        },
        {
          texto: '1, 2, 3, 4, 5, 6 e 12',
          explica: 'O 5 você acabou de testar: sobram 2. Ficam 1, 2, 3, 4, 6 e 12.',
          mostra: ret({ linhas: 2, colunas: 5, rotulos: true, sobra: 2 }, 'Os 2 azulejos soltos piscam.'),
        },
      ],
      esboco: 'O aluno testa de cabeça os outros tamanhos. O retângulo comprido 1 × 12 costuma surpreender.',
    },
    {
      tipo: 'mexa',
      texto: 'Os tamanhos vêm em pares: 3 fileiras de 4 é o mesmo painel que 4 fileiras de 3. Gire.',
      fala: 'Os tamanhos vêm em pares: três fileiras de quatro é o mesmo painel que quatro fileiras de três. Gire.',
      visual: ret({ linhas: 3, colunas: 4, rotulos: true, total: 12 }, 'O painel 3 por 4, com os rótulos dos lados.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque no painel para girar.',
        sucesso: { girado: true },
        mostre: 'O painel gira 90°: agora são 4 fileiras de 3. O 3 e o 4 trocam de lado, o 12 fica.',
      },
      descoberta: 'Cada retângulo junta dois divisores: 3 × 4 = 12. Achou o 3, achou o 4. Os pares de 12: 1 e 12, 2 e 6, 3 e 4.',
      esboco: 'Proposta: depois do giro, os três painéis de 12 (1 × 12, 2 × 6, 3 × 4) aparecem lado a lado, pequenos, cada um com seu par de rótulos.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Os azulejos vêm em caixas de **4**: 4, 8, 12… Dá para comprar exatamente **18**?',
      fala: 'Os azulejos vêm em caixas de quatro: quatro, oito, doze… Dá para comprar exatamente dezoito?',
      visual: reta({ ...R4, saltos: SALTOS4.slice(0, 3) }, 'A reta de 0 a 24, com os três primeiros saltos de 4.'),
      opcoes: [
        {
          texto: 'Não: os saltos de 4 pulam do 16 para o 20', certa: true,
          explica: 'Isso. Os saltos caem em 4, 8, 12, 16, 20… O 18 fica no meio de um salto.',
          mostra: reta({ ...R4, saltos: SALTOS4, marcaSemRotulo: 18 }, 'Os saltos continuam até o 20; o 18 aparece como um traço com "?" entre o 16 e o 20.'),
        },
        {
          texto: 'Sim: 18 é par, como o 4',
          explica: 'Par não basta: $18 \\div 4 = 4$, resto $2$. Os saltos de 4 passam pelo 16 e pelo 20.',
          mostra: reta({ ...R4, saltos: SALTOS4, marcaSemRotulo: 18 }, 'Os saltos passam por cima do 18 sem parar nele.'),
        },
      ],
      esboco: 'Os múltiplos aparecem como o que os saltos alcançam. Sem nome ainda: o nome vem no Anote.',
    },
    {
      tipo: 'aposta',
      pergunta: '**12** azulejos em fileiras de **3**, sem sobra. Qual frase está certa?',
      fala: 'Doze azulejos em fileiras de três, sem sobra. Qual frase está certa?',
      visual: ret({ linhas: 4, colunas: 3, rotulos: true, total: 12 }, 'O painel de 4 fileiras de 3.'),
      opcoes: [
        {
          texto: '3 é divisor de 12', certa: true,
          explica: 'Isso. A fileira de 3 cabe em 12 sem sobrar. E, do outro lado, 12 é **múltiplo** de 3.',
          mostra: ret({ linhas: 4, colunas: 3, rotulos: true, total: 12, destaque: 'linha' }, 'A primeira fileira acende: é ela, de 3, que cabe 4 vezes.'),
        },
        {
          texto: '12 é divisor de 3', erro: 'confunde-multiplo-divisor',
          explica: 'O pequeno é que cabe no grande: o 3 cabe em 12. Doze azulejos não formam fileira em 3.',
          mostra: ret({ linhas: 4, colunas: 3, rotulos: true, total: 12, destaque: 'linha' }, 'A fileira de 3 acende; o 12 embaixo fica grande.'),
        },
      ],
      esboco: 'As duas palavras, divisor e múltiplo, com a mesma imagem. O pequeno cabe; o grande se forma.',
    },
    {
      tipo: 'anote',
      titulo: 'Múltiplos e divisores',
      definicao: 'Se a divisão de **a** por **b** não deixa resto, **b** é **divisor** de **a**, e **a** é **múltiplo** de **b**.',
      exemplo: { tex: '12 \\div 3 = 4 \\text{: 3 é divisor de 12, e 12 é múltiplo de 3}', fala: 'doze dividido por três é quatro: três é divisor de doze, e doze é múltiplo de três' },
      alerta: 'Divisor é o pequeno, que cabe. Múltiplo é o grande, que se forma. E o 1 e o próprio número também são divisores.',
      esboco: 'A página com o painel 4 por 3 e, ao lado, a reta com os saltos de 3 até o 12.',
    },
    {
      tipo: 'passo',
      problema: 'Ache todos os divisores de **18**, aos pares.',
      fala: 'Ache todos os divisores de dezoito, aos pares.',
      visual: ret({ linhas: 1, colunas: 18, rotulos: true, total: 18 }, 'Os 18 azulejos numa fileira só: o primeiro par, 1 por 18.'),
      passos: [
        {
          pergunta: 'O primeiro par é $1 \\times 18$. E com fileiras de 2?',
          fala: 'O primeiro par é um vezes dezoito. E com fileiras de dois?',
          opcoes: [
            { texto: '2 × 9', certa: true, explica: 'Isso. 9 fileiras de 2: o 2 e o 9 entram na lista.', mostra: ret({ linhas: 2, colunas: 9, rotulos: true, total: 18 }, 'O painel vira 2 por 9.') },
            { texto: '2 × 8', explica: '$2 \\times 8 = 16$: sobram 2 azulejos. São 9 fileiras de 2: $2 \\times 9 = 18$.', mostra: ret({ linhas: 8, colunas: 2, rotulos: true, sobra: 2 }, '8 fileiras de 2 e 2 azulejos soltos, que fecham uma nona fileira.') },
          ],
          linha: { tex: '1 \\times 18 \\qquad 2 \\times 9', fala: 'um vezes dezoito, dois vezes nove' },
        },
        {
          pergunta: 'E com 3?',
          opcoes: [
            { texto: '3 × 6', certa: true, explica: 'Isso. 6 fileiras de 3, sem sobra.', mostra: ret({ linhas: 3, colunas: 6, rotulos: true, total: 18 }, 'O painel vira 3 por 6.') },
            { texto: '3 não serve', explica: 'Serve: $3 \\times 6 = 18$, sem sobra. O 3 entra na lista e traz o 6.', mostra: ret({ linhas: 6, colunas: 3, rotulos: true, total: 18 }, '6 fileiras de 3 fecham o painel.') },
          ],
          linha: { tex: '3 \\times 6', fala: 'três vezes seis' },
        },
        {
          pergunta: 'O 4 e o 5 servem?',
          opcoes: [
            { texto: 'Não: os dois deixam sobra', certa: true, explica: 'Isso. $18 \\div 4$ deixa 2, e $18 \\div 5$ deixa 3. Depois vem o 6, que já está no par 3 × 6.', mostra: ret({ linhas: 4, colunas: 4, rotulos: true, sobra: 2 }, '4 fileiras de 4 e 2 azulejos soltos.') },
            { texto: 'Sim, o 4 serve', explica: '$4 \\times 4 = 16$ e $4 \\times 5 = 20$: o 18 fica entre os dois. Sobram 2.', mostra: ret({ linhas: 4, colunas: 4, rotulos: true, sobra: 2 }, '4 fileiras de 4 e 2 azulejos soltos.') },
          ],
          linha: { tex: '4 \\text{ e } 5 \\text{ deixam sobra}', fala: 'quatro e cinco deixam sobra' },
        },
        {
          pergunta: 'Os pares começaram a se repetir. Quais são os divisores de 18?',
          fala: 'Os pares começaram a se repetir. Quais são os divisores de dezoito?',
          opcoes: [
            { texto: '1, 2, 3, 6, 9 e 18', certa: true, explica: 'Isso. Seis divisores, em três pares: três retângulos.' },
            { texto: '2, 3, 6 e 9', erro: 'esquece-divisores-extremos', explica: 'Faltam o 1 e o 18: o par $1 \\times 18$ também é um painel, a fileira comprida.' },
          ],
          linha: { tex: '\\text{Divisores de 18: } 1, 2, 3, 6, 9, 18', fala: 'divisores de dezoito: um, dois, três, seis, nove, dezoito' },
        },
      ],
      esboco: 'O método dos pares: testar de baixo para cima, e parar quando o par já apareceu. O caderno da tela guarda os pares.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: escreva os divisores de **20**, aos pares. Quantos são?',
      fala: 'No papel: escreva os divisores de vinte, aos pares. Quantos são?',
      resposta: 6,
      resolucao: [
        { tex: '1 \\times 20 \\qquad 2 \\times 10 \\qquad 4 \\times 5', fala: 'um vezes vinte, dois vezes dez, quatro vezes cinco' },
        { tex: '3 \\text{ deixa sobra}', fala: 'três deixa sobra' },
        { tex: '\\text{Divisores de 20: } 1, 2, 4, 5, 10, 20', fala: 'divisores de vinte: um, dois, quatro, cinco, dez, vinte' },
        { tex: '\\text{São 6}', fala: 'são seis' },
      ],
      esboco: 'O aluno repete o método dos pares sozinho, com um número em que o 3 falha no meio.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['multiplos-divisores-n1', 'multiplos-divisores-n2', 'multiplos-divisores-n3'],
      esboco: 'Nível 1: achar o múltiplo entre quatro números, com os saltos na reta. Nível 2: contar os divisores de um número até 60. Nível 3: ovos, cadeiras e fitas, para escolher a frase certa entre divisor e múltiplo.',
    },
    {
      tipo: 'fecho',
      texto: '**6** tamanhos de fileira, que formam **3** painéis: 1 × 12, 2 × 6 e 3 × 4. Na próxima aula: saber se 3 divide 1.236 sem fazer a conta.',
      fala: 'Seis tamanhos de fileira, que formam três painéis: um por doze, dois por seis e três por quatro. Na próxima aula: saber se três divide mil duzentos e trinta e seis sem fazer a conta.',
      visual: ret({ linhas: 3, colunas: 4, rotulos: true, total: 12 }, 'O painel 3 por 4. Proposta: os três painéis de 12 lado a lado.'),
      esboco: 'Responder ao gancho com os três painéis. O número grande do fecho abre a aula dos atalhos.',
    },
  ],
}
