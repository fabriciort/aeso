import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 10, aulas 4 a 6: inversamente proporcional,
// taxa unitária, concentração e diluição (somados ao catálogo em erros.ts).
// Reaproveitados: pensa-aditivamente (aulas 1 a 3 desta unidade),
// soma-no-lugar-de-multiplicar e operacao-trocada.
export const ERROS_U10B: ErroComum[] = [
  {
    id: 'regra-de-tres-direta-na-inversa',
    nome: 'usa a regra de três direta numa relação inversa',
    causa: 'Monta a regra de três no automático, como se as duas grandezas crescessem juntas, sem perguntar se, quando uma aumenta, a outra aumenta ou diminui.',
    exemplo: '1 torneira enche a caixa em 12 h; com 4 torneiras, calcula 48 h. Ou: uma viagem de 3 h a 60 km/h levaria 4,5 h a 90 km/h. Ou: com 4 vezes mais água, a solução fica 4 vezes mais forte.',
    desmonte: 'Perguntar antes da conta: com mais torneiras, a caixa enche mais rápido ou mais devagar? Na tabela, a seta de cima diz × 4 e a de baixo, ÷ 4. E o produto confere: 1 × 12 = 4 × 3, mas 4 × 48 não dá 12.',
  },
  {
    id: 'compara-preco-sem-taxa-unitaria',
    nome: 'compara o preço dos pacotes sem dividir pela quantidade',
    causa: 'Olha só o preço na etiqueta e acha que o menor é o mais barato, sem notar que os pacotes têm tamanhos diferentes.',
    exemplo: 'Arroz de 2 kg por R$ 11 ou de 5 kg por R$ 26: escolhe o de 2 kg porque R$ 11 é menos, mas o quilo dele sai R$ 5,50, e o do grande, R$ 5,20.',
    desmonte: 'Na tabela, dividir as duas linhas pelo mesmo número até a coluna do 1: R$ 11 ÷ 2 e R$ 26 ÷ 5. Só o preço do mesmo tanto (1 kg) compara.',
  },
  {
    id: 'maior-pacote-sempre-mais-barato',
    nome: 'acha que o pacote maior sempre sai mais barato',
    causa: 'Ouviu que comprar em quantidade compensa e escolhe o pacote grande sem calcular o preço de 1 kg (ou de 1 L).',
    exemplo: 'Sabão em pó de 1 kg por R$ 16 ou de 3 kg por R$ 51: escolhe o de 3 kg, mas o quilo dele sai R$ 17, um real a mais.',
    desmonte: 'Calcular a taxa unitária dos dois: R$ 51 ÷ 3 = R$ 17 por kg, contra R$ 16. A linha do preço de 1 kg, embaixo da tabela, mostra o pequeno mais barato.',
  },
  {
    id: 'diluir-muda-o-soluto',
    nome: 'acha que diluir muda a quantidade de soluto',
    causa: 'Vê o líquido aumentar e acha que o soluto aumentou junto (ou que a água "levou" parte dele), em vez de ver o mesmo soluto espalhado num volume maior.',
    exemplo: '200 mL de concentrado completados até 1 L viram "1 L de concentrado". Ou: 50 mL a 20 mg/mL (1.000 mg) diluídos até 200 mL passam a ter 4.000 mg.',
    desmonte: 'A barra do concentrado: com a água, a jarra fica 5 vezes mais comprida, mas o âmbar continua do mesmo tamanho. Na tabela, a linha do soluto repete 100, 100, 100 enquanto o volume dobra. A água não trouxe nem tirou soluto.',
  },
  {
    id: 'esquece-volume-do-concentrado',
    nome: 'põe de água o volume final inteiro',
    causa: 'Confunde "completar até 250 mL" com "juntar 250 mL de água", e esquece que a solução forte já ocupa parte do volume final.',
    exemplo: 'Para 250 mL a partir de 50 mL da solução forte, junta 250 mL de água e fica com 300 mL, mais fraca do que queria.',
    desmonte: 'Somar o que entra: 50 mL da forte + 250 mL de água = 300 mL, não 250. A água é o que falta: 250 − 50 = 200 mL.',
  },
]
