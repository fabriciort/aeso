import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 4 de Álgebra e Funções, parte A: aulas 1 a
// 3, duas incógnitas, duas condições ao mesmo tempo e substituição (somados
// ao catálogo em erros.ts). Reaproveitados: desfaz-com-a-mesma-operacao,
// opera-so-de-um-lado, esquece-de-dividir, passa-para-o-outro-lado,
// multiplica-so-um-termo, equacao-diferente-do-problema e
// responde-outra-pergunta (equações do 1º grau), vezes-como-mais e
// x-mais-x-da-x2 (linguagem algébrica), esquece-sinal-do-resultado (números
// negativos), troca-x-e-y (plano cartesiano) e distributiva-sinal-do-negativo.
export const ERROS_AF_U04A: ErroComum[] = [
  {
    id: 'equacao-de-duas-letras-com-um-par-so',
    nome: 'acha que uma equação com x e y tem uma resposta só',
    causa: 'Está acostumado com equações de uma letra, que têm um valor certo. Acha o primeiro par que serve (muitas vezes o "meio a meio") e para, sem ver que outros pares também servem.',
    exemplo: '10 frutas entre maçãs e peras dá "5 e 5", e só. Ou: x + y = 10 tem a solução x = 5 e y = 5.',
    desmonte: 'Na tabela, 3 e 7, 4 e 6, 8 e 2 e 0 e 10 também dão 10. No plano, os pares formam uma reta inteira. Para sobrar um par só, falta uma segunda informação.',
  },
  {
    id: 'reta-so-com-inteiros-positivos',
    nome: 'acha que só números inteiros e positivos servem à equação',
    causa: 'Leva para a equação sozinha a regra do problema (não há −2 peras nem meia fruta), e acha que a reta só tem os pontos da grade do primeiro quadrante.',
    exemplo: 'Diz que (12, −2) e (4,5; 5,5) não são soluções de x + y = 10.',
    desmonte: 'Faça a conta: 12 + (−2) = 10 e 4,5 + 5,5 = 10. A reta continua entre os pontos inteiros e depois dos eixos. Quem limita a inteiros positivos é o problema, não a equação.',
  },
  {
    id: 'par-so-de-uma-equacao',
    nome: 'aceita um par que serve a uma equação só',
    causa: 'Confere o par na primeira equação, vê que dá certo e para. Não vê que a solução de um sistema tem de servir às duas ao mesmo tempo.',
    exemplo: 'Em x + y = 10 e 2x + 3y = 26, aceita (7, 3), porque 7 + 3 = 10; mas 2 · 7 + 3 · 3 = 23, não 26.',
    desmonte: 'Ponha o par na outra equação: 7 maçãs e 3 peras custam R$ 23, não R$ 26. No plano, o (7, 3) está numa reta e fora da outra. Só o cruzamento, (4, 6), está nas duas.',
  },
  {
    id: 'substitui-sem-parenteses',
    nome: 'troca a letra pelo que ela vale sem os parênteses',
    causa: 'Copia o que a letra vale no lugar dela, mas sem parênteses. O número que multiplicava a letra fica só com o primeiro termo.',
    exemplo: 'Com y = x + 2, 2y vira 2x + 2 (é 2(x + 2) = 2x + 4). Com y = x − 3, 2x + 3y = 21 vira 2x + 3x − 3 = 21.',
    desmonte: 'O y é um número só, o x + 2 inteiro. Com x = 4, y = 6 e 2y = 12; mas 2x + 2 = 10. Com os parênteses, 2(4 + 2) = 12. A caixa chega ao lugar do y já com os parênteses.',
  },
  {
    id: 'esquece-a-segunda-letra',
    nome: 'acha uma letra e para',
    causa: 'Depois da troca, resolve a equação de uma letra e acha que a conta terminou. Esquece que a solução do sistema é um par.',
    exemplo: 'Em y = x + 2 e x + y = 10, acha x = 4 e responde "4 de cada" (são 4 maçãs e 6 peras).',
    desmonte: 'Volte a uma das equações com o x achado: y = 4 + 2 = 6. Confira o par nas duas: 4 e 4 dariam 8 frutas, não 10.',
  },
]
