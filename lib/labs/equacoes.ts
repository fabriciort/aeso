import type { Lab } from './types'

// Definição do laboratório "equacoes" (Matemática). Conteúdo em components/labs/equacoes/.

export const EQUACOES: Lab = {
  slug: 'equacoes',
  title: 'Equações na balança',
  subtitle: 'Descubra o valor escondido mantendo uma balança em equilíbrio, e aprenda a resolver qualquer equação do 1º grau.',
  area: 'Matemática',
  level: 'Ensino fundamental',
  track: 'basica',
  minutes: 15,
  status: 'disponivel',
  concepts: ['Igualdade', 'Operações inversas', 'Equação do 1º grau'],
  accent: '#7bd88f',
  achievement: {
    title: 'Mestre da balança',
    description: 'Você resolveu equações do 1º grau mantendo a igualdade, um passo de cada vez.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'A caixa misteriosa',
      goal: 'Equilibre a balança e descubra quanto pesa a caixa.',
      vega:
        'Palco: uma balança de dois pratos (física de mola: o lado mais pesado desce). Embaixo, uma bandeja com pesinhos de 1 que o aluno arrasta para os pratos (ou usa os botões +1/−1). Cena 1: brincar livremente. Cena 2: uma caixa fechada de peso x escondido (x = 4) fica na esquerda; o aluno põe pesinhos na direita até a balança ficar reta. Resposta: 4 pesinhos, então a caixa pesa 4. Cena 3: a caixa mostra 4. Ideia central: equilíbrio quer dizer igualdade. Erro comum: parar quando a balança "quase" está reta, ou achar que o lado mais alto é o mais pesado. Guie perguntando qual lado desceu e o que isso diz sobre o peso; não diga o número.',
      ask: ['Por que o lado mais pesado desce?', 'Como sei que a balança está equilibrada?', 'E se a caixa pesasse 7?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'Mexer de um lado só?',
      goal: 'Preveja o que acontece quando você tira pesos da balança.',
      vega:
        'Palco: balança reta com 2 caixas + 3 pesos na esquerda e 11 pesos na direita (caixas de peso 4). Pergunta 1: tirando 3 pesos só da esquerda, o que acontece? Resposta: a direita desce (a esquerda ficou mais leve). Pergunta 2: tirando 3 dos dois lados? Resposta: fica reta (2 caixas contra 8). Erros comuns: achar que dá para mexer de um lado só; achar que depende do peso da caixa. Guie: o que muda em cada lado? Os dois lados continuam iguais?',
      ask: ['Por que tirar de um lado só desequilibra?', 'Tirar o mesmo dos dois lados sempre funciona?', 'E se eu pusesse 3 dos dois lados?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'A balança vira equação',
      goal: 'Traduza a balança para a linguagem da álgebra e use a regra de ouro.',
      vega:
        'Palco: a balança 2 caixas + 3 | 11 e, embaixo, um caderno que se escreve sozinho em notação matemática. Cena 1: a balança é lida como 2x + 3 = 11 (cada caixa vale x, cada peso vale 1, o equilíbrio é o sinal de igual). Cena 2: o aluno toca em "−3 dos dois lados" e o caderno escreve 2x = 8. Cena 3: operações inversas (tirar desfaz pôr, dividir desfaz multiplicar). Cena 4 e 5: dividir cada lado em 2 grupos iguais e ficar com um: x = 4. Regra de ouro: o que você faz de um lado, faz do outro. Erro comum: tratar o 2 de 2x como pesos soltos. Guie com perguntas sobre o que está "grudado" no x.',
      ask: ['Por que 2x quer dizer 2 vezes x?', 'O que é uma operação inversa?', 'Por que dividir em grupos iguais funciona?'],
    },
    {
      id: 'mundo-real',
      kind: 'observacao',
      label: 'No mundo real',
      title: 'Febre em Fahrenheit',
      goal: 'Use uma equação para traduzir um termômetro americano.',
      vega:
        'Palco: termômetro com escalas °F e °C e a balança com blocos. A relação exata entre as escalas é F = 1,8C + 32 (definição das escalas; NIST SP 811, Apêndice B). Um termômetro americano marca 98,6 °F: resolver 1,8C + 32 = 98,6. Passos: −32 dos dois lados (1,8C = 66,6), depois ÷1,8 (C = 37). Distratores: dividir por 1,8 primeiro (pode, mas o 32 vira 17,77…), tirar 1,8 em vez de dividir. Depois, exemplo imaginado (não é dado real): corrida de app com R$ 5 fixos + R$ 2 por km que custou R$ 29: 2k + 5 = 29, k = 12 km. Erros comuns: 17 (somou o 5), 14,5 (esqueceu a tarifa fixa), 24 (não dividiu). Guie pela ordem inversa: o que foi feito por último com o C?',
      ask: ['De onde vem a fórmula F = 1,8C + 32?', 'Por que tirar o 32 antes de dividir?', 'Qual temperatura é igual nas duas escalas?'],
    },
    {
      id: 'resolva',
      kind: 'medicao',
      label: 'Resolva',
      title: 'O Raciocinador',
      goal: 'Escolha cada passo e resolva três equações.',
      vega:
        'O aluno resolve escolhendo a próxima operação entre 3 botões; a balança anima e o caderno registra a linha. Escolha que mexe de um lado só faz a balança tombar e volta. Problema 1 (com dicas): 3x + 2 = 14 → −2 dos dois lados → 3x = 12 → ÷3 → x = 4. Problema 2 (menos ajuda): 5x + 1 = 2x + 10 → −2x dos dois lados (ou −1 primeiro) → 3x + 1 = 10 → −1 → 3x = 9 → x = 3. Problema 3 (sozinho, só confere a resposta): 4(x − 1) = 2x + 6, com balões de hélio (cada balão vale −1, puxa para cima): abrir parênteses 4x − 4 (erro clássico: 4x − 1), −2x, +4 (cada peso cancela um balão), ÷2 → x = 5. Erros comuns: mexer de um lado só, tirar o coeficiente (3x − 3), subtrair o número do outro lado, distribuir só no primeiro termo. Nunca diga a resposta; pergunte o que está junto do x e qual operação desfaz.',
      ask: ['Qual deve ser o primeiro passo?', 'Por que não posso tirar 3 de 3x?', 'Como funcionam os balões?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'Balanças teimosas',
      goal: 'Descubra equações sem solução e com infinitas soluções.',
      vega:
        'Palco: balança em que o aluno gira o valor de x num controle (as caixas mostram o valor). Cena 1-2: x + 2 = x + 5 nunca equilibra (a direita sempre pesa 3 a mais); tirando uma caixa de cada lado sobra 2 = 5, falso: sem solução. Cena 3-4: 2(x + 1) = 2x + 2 equilibra para qualquer x; abrindo os parênteses os dois lados são iguais, sobra 2 = 2: infinitas soluções. Erros comuns: achar que um x enorme resolve; achar que só um valor serve. Guie: o que acontece com a diferença entre os lados quando x muda?',
      ask: ['Uma equação pode não ter solução?', 'Por que 2(x + 1) = 2x + 2 vale sempre?', 'Como reconheço esses casos sem a balança?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'Igualdade dominada',
      goal: 'Reveja o que você resolveu e leve a regra com você.',
      vega:
        'Conclusão: medalha, os três problemas que o aluno resolveu (x = 4, x = 3, x = 5) e a regra em notação: se a = b, então a ± c = b ± c e a ÷ k = b ÷ k (k ≠ 0). Fontes: NIST SP 811 para °F/°C; a corrida de app é exemplo imaginado. Próximo lab da trilha: Porcentagem sem susto (em breve); depois, Ensino médio (A reta da corrida de táxi). Ajude o aluno a revisar e a criar uma equação própria.',
      ask: ['Me dá uma equação nova para treinar?', 'Onde equações aparecem no dia a dia?', 'O que vem depois de equações?'],
    },
  ],
}
