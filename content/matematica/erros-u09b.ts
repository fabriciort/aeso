import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 9, aulas 4 a 6: volume e litro, tempo, e
// unidades de outros sistemas (somados ao catálogo em erros.ts).
// Reaproveitados: converte-no-sentido-errado e fator-de-conversao-errado
// (aulas 1 a 3 desta unidade), soma-no-lugar-de-multiplicar,
// conta-zeros-errado, esquece-reserva, subtrai-menor-do-maior e
// ignora-contexto-do-resto.
export const ERROS_U09B: ErroComum[] = [
  {
    id: 'converte-volume-como-comprimento',
    nome: 'converte volume com o fator do comprimento (ou da área)',
    causa: 'Sabe que 1 m = 10 dm e acha que 1 m³ = 10 dm³, ou lembra da área e usa 100. Esquece que o volume tem três medidas, comprimento, largura e altura, e que as três mudam.',
    exemplo: '1 m³ = 10 dm³ (ou 100 dm³); 2,5 L = 250 cm³; 500 L = 5 m³.',
    desmonte: 'Os blocos: uma placa de 10 × 10 cubinhos cobre só o fundo do cubo de 10 cm. Faltam as 10 camadas de cima: 10 × 10 × 10 = 1.000. No quadro de unidades de volume, cada casa leva 3 algarismos: de m³ para dm³ a vírgula pula 3 algarismos.',
  },
  {
    id: 'confunde-m3-com-litro',
    nome: 'acha que 1 m³ é 1 litro',
    causa: 'Ouve que "litro é volume" e que "o metro cúbico é a unidade de volume" e junta as duas coisas, sem ver o tamanho de cada uma. O litro é o cubo de 10 cm, não o de 1 m.',
    exemplo: 'Uma caixa-d\'água de 1 m³ guarda 1 L. Ou 500 L = 500 m³.',
    desmonte: 'Uma garrafa de 1 L ao lado de um cubo de 1 m de lado, da altura de uma mesa: não pode ser a mesma coisa. 1 L é o cubo de 10 cm, e cabem 10 × 10 × 10 = 1.000 deles no cubo de 1 m.',
  },
  {
    id: 'hora-decimal-como-minutos',
    nome: 'lê o que vem depois da vírgula como minutos',
    causa: 'Trata as horas como dinheiro ou como metros, onde 0,5 do inteiro é 50 centésimos. Mas a hora tem 60 minutos, e 0,5 h é metade de 60.',
    exemplo: '1,5 h = 1 h 50 min. Ou, no sentido contrário, 7 h 30 min = 7,3 h na folha de horas.',
    desmonte: 'Na reta de minutos, 1,5 h fica no meio entre 60 e 120: 90 min, ou 1 h 30 min. Na barra de uma hora partida em 4 quartos de 15 min, meia hora são 2 quartos: 30 min. 50 minutos seria metade de 100.',
  },
  {
    id: 'tempo-em-base-cem',
    nome: 'faz conta de horas como se a hora tivesse 100 minutos',
    causa: 'Soma e subtrai horas e minutos como números comuns, de 10 em 10, sem trocar 60 minutos por 1 hora.',
    exemplo: '8 h 45 + 30 min = 8 h 75. Ou um voo de 9 h 40 a 11 h 15 dura 1115 − 940 = 175 min.',
    desmonte: 'Na barra das horas, 45 min mais 30 min passam do fim da hora: 15 min entram na hora seguinte. 75 minutos são 1 h 15 min, e 8 h 75 não existe no relógio. Na subtração, ir até a hora cheia: de 9 h 40 a 10 h são 20 min, mais 75 min até 11 h 15: 95 min.',
  },
  {
    id: 'milha-nautica-igual-milha',
    nome: 'usa o fator da milha comum para a milha náutica',
    causa: 'Ouve "milha" e usa o 1,6 km de sempre, sem notar que navios e aviões medem em milha náutica, que é maior: 1,852 km.',
    exemplo: '10 milhas náuticas = 16 km, em vez de 18,52 km.',
    desmonte: 'Duas réguas lado a lado: a milha comum termina em 1,6 km, a náutica passa dela e vai até 1,852 km. São unidades diferentes com o mesmo nome; o fator vem junto do nome inteiro.',
  },
]
