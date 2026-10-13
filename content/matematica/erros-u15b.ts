import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 15, parte B: aulas 4 a 6, parênteses e
// frações, do problema à equação e inequações simples (somados ao catálogo
// em erros.ts). Reaproveitados: distributiva-parcial (unidade 3: 2(x + 3)
// vira 2x + 3), soma-no-lugar-de-multiplicar (unidade 3), vezes-como-mais e
// esquece-valor-fixo (unidade 14) e, das aulas 1 a 3 desta unidade,
// opera-so-de-um-lado, desfaz-com-a-mesma-operacao e subtrai-o-coeficiente.
export const ERROS_U15B: ErroComum[] = [
  {
    id: 'multiplica-so-um-termo',
    nome: 'multiplica só um pedaço de um lado da equação',
    causa: 'Quer desfazer a fração e multiplica só o termo com o x. Esquece que o lado inteiro tem de ir vezes o mesmo número, inclusive o número solto.',
    exemplo: 'x/2 + 1 = 4 vira x + 1 = 8, e x = 7 (é 6). O 1 também tinha de ir vezes 2: x + 2 = 8.',
    desmonte: 'Confira com x = 7: 7/2 + 1 = 4,5, não 4. Mais curto: tire o 1 dos dois lados antes (x/2 = 3) e só depois multiplique os dois lados por 2 (x = 6).',
  },
  {
    id: 'responde-outra-pergunta',
    nome: 'resolve a equação e não responde a pergunta',
    causa: 'Acha o x e para, sem voltar ao problema. O x pode ser outra coisa que a pergunta pede, ou a conta parou num pedaço do caminho.',
    exemplo: 'O pai tem o triplo da idade do filho e juntos somam 48. x = 12 é o filho; a pergunta era o pai, 36 anos. Ou: responde R$ 7 quando a pergunta era quantos km.',
    desmonte: 'Antes de montar, escreva o que é o x ("x = idade do filho"). No fim, leia a pergunta de novo e responda com a unidade: "o pai tem 36 anos". Conferir no problema mostra a falta: 12 não é o triplo de nada.',
  },
  {
    id: 'equacao-diferente-do-problema',
    nome: 'monta uma equação que não diz o que o problema diz',
    causa: 'Junta os números do problema na ordem em que aparecem, ou deixa uma parte de fora, sem ler cada lado como uma frase da história.',
    exemplo: 'R$ 5 para começar e R$ 2 por km, total R$ 19, escrito 2 + 5x = 19. Ou: pai e filho juntos somam 48, escrito 3x = 48 (só o pai).',
    desmonte: 'Leia a equação de volta, em palavras: 2 + 5x seria R$ 2 para começar e R$ 5 por km. Ou teste com a resposta: com x = 7 km, 2 + 5 · 7 = 37, não 19.',
  },
  {
    id: 'inequacao-como-equacao',
    nome: 'trata a inequação como uma equação, com uma resposta só',
    causa: 'Está acostumado a achar "o" valor do x. Resolve x + 3 > 7 como se fosse x + 3 = 7 e responde só o 4, ou acha que a balança inclinada vai ficar reta.',
    exemplo: 'x + 3 > 7 com a resposta x = 4. Ou: "tirando 3 de cada prato, a balança fica reta".',
    desmonte: 'Com 4 na caixa, 4 + 3 = 7: a balança fica reta, não inclina. Com 5, 6 ou 4,5 ela desce. São muitas soluções: todo número maior que 4. Na reta, uma semirreta inteira, não um ponto.',
  },
  {
    id: 'inequacao-inclui-a-borda',
    nome: 'conta o número da borda como solução',
    causa: 'Acha o número em que os dois lados empatam e o põe na resposta. Esquece que > e < pedem um lado maior, não igual.',
    exemplo: 'x > 4 com o 4 como menor solução inteira (é 5). Ou: guardando R$ 15 por mês a partir de R$ 10, responde 6 meses para passar de R$ 100 (em 6 meses dá R$ 100: chega, mas não passa).',
    desmonte: 'Troque o x pelo 4: 4 + 3 = 7, e 7 > 7 é falso. Na reta, a bolinha do 4 fica vazia. Em 6 meses o cofre tem exatamente R$ 100; só no 7º ele passa: R$ 115.',
  },
  {
    id: 'inequacao-sentido-trocado',
    nome: 'troca o sentido da comparação',
    causa: 'Resolve a conta certa, mas escreve o sinal virado, ou confunde qual prato desce: o lado mais pesado é o maior.',
    exemplo: 'x + 3 > 7 resolvida como x < 4. Ou: com a caixa de 2 kg, acha que o prato do x desce.',
    desmonte: 'Teste um número do lado que você escreveu: com x = 2, 2 + 3 = 5, e 5 > 7 é falso. Na balança, o prato do x tem de descer: ele pesa mais que 7 só se a caixa passa de 4.',
  },
]
