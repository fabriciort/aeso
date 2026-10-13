import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 15, aulas 1 a 3: igualdade é equilíbrio,
// resolver passo a passo e x dos dois lados (somados ao catálogo em
// erros.ts). Reaproveitados de outras unidades: junta-termos-nao-semelhantes,
// junta-algarismos-com-a-letra, ignora-prioridade, esquece-sinal-do-resultado
// e operacao-trocada.
export const ERROS_U15A: ErroComum[] = [
  {
    id: 'opera-so-de-um-lado',
    nome: 'faz a conta só de um lado da equação',
    causa: 'Vê a equação como uma conta para "limpar" o lado do x, e não como uma igualdade entre dois lados. Tira ou divide de um lado e copia o outro como estava.',
    exemplo: '3x + 5 = 20 vira 3x = 20 (tirou 5 só da esquerda); 2x = 8 vira x = 8 (dividiu só a esquerda).',
    desmonte: 'Na balança, tirar 5 de um prato só faz o outro descer: a igualdade se perde. Para a balança continuar reta, o que sai de um prato sai também do outro: 3x = 15.',
  },
  {
    id: 'passa-para-o-outro-lado',
    nome: 'muda um número de lado sem fazer a conta nos dois',
    causa: 'Decorou "passa para o outro lado trocando o sinal" sem saber de onde vem. Muda o número de lado e esquece de trocar o sinal, ou troca quando não devia.',
    exemplo: 'x + 7 = 12 vira x = 12 + 7 = 19 (é 5); 3x = x + 10 vira 4x = 10 (é 2x = 10).',
    desmonte: 'Nada muda de prato: tira-se 7 dos dois lados. À esquerda o 7 some; à direita aparece o − 7. Com x = 19, a balança mostra 26 contra 12. O atalho é só um jeito curto de escrever a mesma conta dos dois lados.',
  },
  {
    id: 'nao-confere-a-solucao',
    nome: 'não confere a solução',
    causa: 'Acha que a conta terminou quando aparece "x = número". Não troca o x pelo número para ver se os dois lados dão o mesmo, e aceita um valor que quase equilibra.',
    exemplo: 'Acha x = 5 em 3x + 2 = 20 e não vê que 3 · 5 + 2 = 17, não 20.',
    desmonte: 'Abrir a caixa: com 5 dentro, a balança inclina. Trocar o x pelo número na equação do começo leva um minuto e mostra se os dois lados batem: 3 · 6 + 2 = 20.',
  },
  {
    id: 'esquece-de-dividir',
    nome: 'para no 2x e responde como se fosse x',
    causa: 'Depois de tirar os números soltos, acha que terminou. Não vê que sobrou o peso de várias caixas, e não o de uma.',
    exemplo: '2x + 3 = 11 vira 2x = 8, e responde x = 8 (é 4).',
    desmonte: 'Na balança sobram 2 caixas contra 8 pesos: 2 caixas pesam 8, então uma pesa 4. Partir cada prato em 2 grupos iguais e ficar com um de cada lado.',
  },
  {
    id: 'desfaz-com-a-mesma-operacao',
    nome: 'desfaz uma conta repetindo a mesma conta',
    causa: 'Sabe que tem de fazer algo dos dois lados, mas usa a mesma operação que está na equação, em vez da contrária. Tirar 4 não desfaz um − 4; multiplicar não desfaz um vezes.',
    exemplo: 'x − 4 = 6 vira x = 6 − 4 = 2 (é 10); 2x = 8 vira x = 16 (é 4).',
    desmonte: 'Na reta: de x, voltar 4 deu 6. Para chegar ao x, faz-se o caminho de volta: de 6, andar 4 para a frente, 10. Conferir: 10 − 4 = 6. O contrário do + é o −, e o do vezes é a divisão.',
  },
  {
    id: 'subtrai-o-coeficiente',
    nome: 'tira o número da frente do x em vez de dividir',
    causa: 'Vê o 3 de 3x como um número somado ao x e desfaz com uma subtração. Esquece que 3x quer dizer 3 vezes x.',
    exemplo: '3x = 15 vira x = 15 − 3 = 12 (é 5); 2x = 8 vira x = 6 (é 4).',
    desmonte: '3x são 3 caixas iguais. Se 3 caixas pesam 15, uma pesa 15 ÷ 3 = 5. Conferir: com x = 12, 3x seria 36, não 15.',
  },
]
