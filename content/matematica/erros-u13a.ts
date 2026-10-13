import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 13, aulas 1 a 3: potência, propriedades sem
// decorar, expoente zero e negativo (somados ao catálogo em erros.ts).
// Reaproveitados de outras unidades: conta-zeros-errado,
// esquece-sinal-do-resultado, converte-no-sentido-errado.
export const ERROS_U13A: ErroComum[] = [
  {
    id: 'potencia-multiplica-base-pelo-expoente',
    nome: 'multiplica a base pelo expoente',
    causa: 'Lê o expoente como um fator a mais, porque 2³ parece "2 e 3". Faz a conta que conhece, a multiplicação dos dois números, em vez de repetir a base.',
    exemplo: '2³ = 6 (é 8); 10³ = 30 (é 1.000); 5² = 10 (é 25).',
    desmonte: 'Escrever por extenso: 2³ é 2 × 2 × 2, três 2 multiplicados, e dá 8. O 3 não entra na conta: ele só conta quantos 2. No papel dobrado, 3 dobras dão 8 camadas, não 6.',
  },
  {
    id: 'potencia-troca-base-e-expoente',
    nome: 'troca a base e o expoente',
    causa: 'Sabe que é uma multiplicação repetida, mas repete o número errado: o expoente no lugar da base.',
    exemplo: '2³ = 9 (é 8; 9 é 3²); 3⁴ = 64 (é 81; 64 é 4³).',
    desmonte: 'A base é o número grande, embaixo; o expoente, pequeno, em cima, só conta. Na notícia passada a 3 pessoas por rodada, quem se repete é o 3: 3⁴ = 3 × 3 × 3 × 3 = 81.',
  },
  {
    id: 'potencia-multiplica-expoentes',
    nome: 'multiplica os expoentes num produto de potências',
    causa: 'Vê duas potências multiplicadas e multiplica também os expoentes, ou divide os expoentes numa divisão: faz com os expoentes a mesma conta que está entre as potências.',
    exemplo: '2³ × 2² = 2⁶ (é 2⁵); 2⁶ ÷ 2² = 2³ (é 2⁴).',
    desmonte: 'Escrever por extenso e contar: (2 × 2 × 2) × (2 × 2) tem cinco 2, não seis. Na divisão, os dois 2 de baixo cancelam dois dos seis de cima: sobram quatro.',
  },
  {
    id: 'potencia-soma-expoentes-na-divisao',
    nome: 'soma os expoentes numa divisão',
    causa: 'Decorou "os expoentes se somam" e usa a regra do produto também na divisão.',
    exemplo: '2⁵ ÷ 2² = 2⁷ (é 2³).',
    desmonte: 'Dividir tira fatores, não põe: dos cinco 2 de cima, os dois de baixo se cancelam e sobram três. Confere pelos valores: 32 ÷ 4 = 8 = 2³.',
  },
  {
    id: 'potencia-opera-as-bases',
    nome: 'faz a conta com as bases',
    causa: 'Junta tudo o que vê: multiplica (ou divide) as bases e também mexe nos expoentes, como se as duas partes fossem números soltos.',
    exemplo: '2³ × 2² = 4⁵ (é 2⁵); 2⁵ ÷ 2² = 1³ (é 2³).',
    desmonte: 'Por extenso, só aparecem fatores 2: (2 × 2 × 2) × (2 × 2). Nenhum 4 em lugar nenhum. A base fica a mesma; só a quantidade de fatores muda.',
  },
  {
    id: 'potencia-junta-bases-diferentes',
    nome: 'junta potências de bases diferentes',
    causa: 'Aplica as regras das potências a qualquer produto, sem ver que elas valem só quando a base é a mesma.',
    exemplo: '2³ × 3² = 6⁵ (é 8 × 9 = 72); 2³ × 3² = 5⁵.',
    desmonte: 'Por extenso: (2 × 2 × 2) × (3 × 3). Três 2 e dois 3 não viram cinco de nada. Calcula-se cada potência: 8 × 9 = 72. 6⁵ é 7.776, muito longe.',
  },
  {
    id: 'potencia-de-potencia-soma',
    nome: 'soma os expoentes na potência de potência',
    causa: 'Vê dois expoentes e soma, como no produto, sem ver que o expoente de fora repete a potência inteira.',
    exemplo: '(2³)² = 2⁵ (é 2⁶ = 64); (10²)³ = 10⁵ (é 10⁶).',
    desmonte: '(2³)² é 2³ × 2³: dois grupos de três 2, seis 2 ao todo. Grupos iguais pedem multiplicação: 2 × 3 = 6.',
  },
  {
    id: 'potencia-sinal-fora-dos-parenteses',
    nome: 'confunde (−3)² com −3²',
    causa: 'Não vê que o expoente vale só para o que está logo antes dele. Sem parênteses, eleva o −3 inteiro; com parênteses, deixa o menos de fora.',
    exemplo: '−3² = 9 (é −9); (−3)² = −9 (é 9); (−2)⁴ = −16 (é 16).',
    desmonte: 'Os parênteses dizem qual é a base. (−3)² = (−3) × (−3) = 9: sinais iguais, positivo. −3² = −(3 × 3) = −9: só o 3 é elevado, e o menos vem depois. A calculadora do celular faz igual.',
  },
  {
    id: 'expoente-zero-da-zero',
    nome: 'acha que o expoente zero dá zero',
    causa: 'Lê o expoente como uma multiplicação pelo expoente (zero vezes qualquer coisa é zero) ou acha que "nenhum fator" é nada.',
    exemplo: '10⁰ = 0 (é 1); 7⁰ = 0 (é 1); 2³ ÷ 2³ = 0 (é 2⁰ = 1).',
    desmonte: 'Descer a tabela: 1.000, 100, 10, e cada passo divide por 10. O próximo é 10 ÷ 10 = 1. Pela divisão: 2³ ÷ 2³ = 2⁰, e um número dividido por ele mesmo dá 1.',
  },
  {
    id: 'expoente-negativo-da-negativo',
    nome: 'acha que o expoente negativo dá um número negativo',
    causa: 'Leva o sinal do expoente para o resultado, como se o menos de cima fosse o menos do número.',
    exemplo: '2⁻¹ = −2 (é 1/2); 10⁻¹ = −10 (é 0,1); 10⁻² = −100 (é 0,01).',
    desmonte: 'Continuar a tabela: 10, 1, e o próximo é 1 ÷ 10 = 0,1. Ficou menor que 1, mas ainda é maior que zero. O menos no expoente pede divisão; o número continua positivo.',
  },
]
