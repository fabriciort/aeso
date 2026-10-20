import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 4 de Álgebra e Funções, parte B: aulas 4 a
// 6, a adição, nenhuma ou infinitas soluções e os problemas com sistemas
// (somados ao catálogo em erros.ts). Reaproveitados: termo-perde-o-sinal
// (o −y lido como y, e a soma fica 2y), esquece-de-dividir (para no 2x),
// subtrai-o-coeficiente, desfaz-com-a-mesma-operacao, multiplica-so-um-termo
// (multiplica só um pedaço do lado esquerdo), equacao-diferente-do-problema,
// responde-outra-pergunta, e da parte A desta unidade: par-so-de-uma-equacao
// e esquece-a-segunda-letra.
export const ERROS_AF_U04B: ErroComum[] = [
  {
    id: 'soma-sem-sumir-letra',
    nome: 'soma as equações sem que uma letra suma',
    causa: 'Aprendeu que somar as equações resolve o sistema e soma sempre, do jeito que estão. Não olha antes se alguma letra aparece com sinais opostos (+y e −y), ou acha que x com x também se anula.',
    exemplo: 'x + 2y = 7 e x + y = 5, somadas, dão 2x + 3y = 12: ainda há duas letras. Ou: acha que x e x somem e escreve 3y = 12.',
    desmonte: 'Na soma, x + x dá 2x, como duas caixas iguais nos pratos. Só some o que se anula: +y com −y. Se nada se anula, multiplique uma equação inteira antes (x + y = 5 vezes −1 vira −x − y = −5), e aí o x some.',
  },
  {
    id: 'multiplica-so-um-lado',
    nome: 'multiplica a equação só de um lado do =',
    causa: 'Multiplica as letras para uma delas sumir na soma e esquece o número do outro lado. Não vê a equação como uma balança: o que se faz de um lado tem de se fazer do outro.',
    exemplo: 'x + y = 6 vezes −2 vira −2x − 2y = 6 (é −2x − 2y = −12). Com 3x + 2y = 16, a soma dá x = 22, e o par não serve.',
    desmonte: 'Uma balança com o dobro de peso num prato só inclina. Confira com o par certo (4, 2): −8 − 4 = −12, não 6. Os dois lados vão vezes o mesmo número.',
  },
  {
    id: 'zero-igual-zero-da-x-zero',
    nome: 'lê 0 = 0 como x = 0',
    causa: 'Está acostumado a terminar a conta com "x = número" e lê o 0 = 0 assim. Não vê que as letras sumiram todas e o que sobrou é uma frase sempre verdadeira.',
    exemplo: 'x + y = 3 e 2x + 2y = 6: a adição dá 0 = 0, e responde x = 0 e y = 0. Mas (0, 0) dá 0 + 0 = 0, não 3.',
    desmonte: 'No plano, as duas retas são a mesma: (0, 3), (1, 2) e (2, 1) servem às duas. O 0 = 0 diz "sempre vale": todo par da reta é solução. E (0, 0) nem está na reta.',
  },
  {
    id: 'zero-igual-zero-sem-solucao',
    nome: 'acha que 0 = 0 quer dizer "nenhuma solução"',
    causa: 'Vê as letras sumirem e acha que a conta deu errado ou que não sobrou resposta. Confunde o 0 = 0 (sempre verdade) com o 0 = 2 (nunca verdade).',
    exemplo: 'x + y = 3 e 2x + 2y = 6 dão 0 = 0, e responde "o sistema não tem solução". Mas (1, 2) serve às duas.',
    desmonte: 'Teste um par: (1, 2) dá 1 + 2 = 3 e 2 + 4 = 6. Serve. Absurdo é 0 = 2, uma frase que nunca vale; 0 = 0 é uma frase que sempre vale, e então todo par da reta serve.',
  },
  {
    id: 'sistema-sempre-tem-um-par',
    nome: 'acha que todo sistema tem exatamente um par',
    causa: 'Viu sempre sistemas com uma solução e acha que é uma regra. Não imagina duas retas que nunca se cruzam ou que são a mesma.',
    exemplo: 'Em x + y = 3 e x + y = 5, procura o par e responde (1, 2), que só serve à primeira. Em x + y = 3 e 2x + 2y = 6, diz que há um par só.',
    desmonte: 'Duas retas no plano podem se cruzar num ponto, ser paralelas (nunca se cruzam) ou ser a mesma reta (se cruzam em tudo). A mesma soma não dá 3 e 5 ao mesmo tempo.',
  },
  {
    id: 'proporcional-so-a-esquerda',
    nome: 'vê os lados esquerdos proporcionais e esquece o direito',
    causa: 'Percebe que 2x + 4y é o dobro de x + 2y e conclui que é a mesma reta, sem conferir se o número do outro lado também dobrou. Ou acha que as retas se cruzam porque os números da direita são diferentes.',
    exemplo: 'x + 2y = 4 e 2x + 4y = 10: diz que são a mesma reta (infinitas soluções). Mas o dobro de 4 é 8, não 10: as retas são paralelas.',
    desmonte: 'Multiplique a primeira inteira por 2: 2x + 4y = 8. A segunda diz 2x + 4y = 10. A mesma conta não dá 8 e 10: nenhum par serve. Só é a mesma reta se os dois lados forem multiplicados pelo mesmo número.',
  },
  {
    id: 'acha-paralelas-sem-proporcao',
    nome: 'acha que as retas não se cruzam (ou são a mesma) sem que uma equação seja múltipla da outra',
    causa: 'Olha os números parecidos (x + y e x + 2y, ou o mesmo número à direita) e conclui que há algo especial. Não confere se os lados esquerdos são proporcionais.',
    exemplo: 'x + y = 5 e x + 2y = 5: diz que não há solução porque os dois dão 5. Mas (5, 0) serve às duas.',
    desmonte: 'Faça a adição: x + 2y = 5 menos x + y = 5 dá y = 0, e x = 5. Uma letra sobrou: há um par só. Paralelas ou a mesma reta só quando um lado esquerdo é o outro multiplicado.',
  },
  {
    id: 'troca-o-preco-das-letras',
    nome: 'dá a cada letra o valor da outra',
    causa: 'Escolhe as letras, mas na hora de montar a equação do dinheiro põe os valores na ordem em que aparecem no problema, sem olhar o que cada letra conta.',
    exemplo: 'x inteiras (R$ 20) e y meias (R$ 10), escrito 10x + 20y = 800. Com x de R$ 5 e y de R$ 10, escrito 10x + 5y = 85.',
    desmonte: 'Leia a equação como frase: 10x seria "cada inteira custa R$ 10". Confira com o par certo (30, 20): 300 + 400 = 700, não 800. Escreva ao lado o que cada letra é antes de montar.',
  },
]
