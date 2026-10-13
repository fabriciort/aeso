import type { ErroComum } from '@/lib/formation/schema'

// Erros comuns novos da unidade 9, aulas 1 a 3: converter comprimento, massa,
// capacidade e área no sistema métrico (somados ao catálogo em erros.ts).
// Reaproveitados de outras unidades: conta-zeros-errado,
// soma-no-lugar-de-multiplicar, subtrai-menor-do-maior,
// ignora-contexto-do-resto.
export const ERROS_U09A: ErroComum[] = [
  {
    id: 'converte-no-sentido-errado',
    nome: 'multiplica quando devia dividir na conversão (ou o contrário)',
    causa: 'Sabe que "do metro para o centímetro é 100", mas não pensa no tamanho da unidade: usa o mesmo × 100 nos dois sentidos.',
    exemplo: '35 cm escritos 3.500 m; 250 mL escritos 250.000 L; 500 mg escritos 500.000 g.',
    desmonte: 'Perguntar se a resposta tem cara de verdade: uma fita de 35 cm não tem 3,5 km. Unidade menor, mais pedaços: o número cresce. Unidade maior, menos pedaços: o número diminui. No quadro de unidades, a vírgula anda para o lado da unidade de chegada.',
  },
  {
    id: 'fator-de-conversao-errado',
    nome: 'usa o fator errado entre duas unidades',
    causa: 'Não liga o nome da unidade ao tamanho dela. Acha que toda conversão é × 10, ou troca o 100 do centi pelo 1.000 do mili.',
    exemplo: '1 m = 10 cm; 1,5 m = 150 mm; 2,5 kg = 250 g; 0,05 mg = 5 µg.',
    desmonte: 'O prefixo diz o fator: centi é centésimo (100 cm no metro, como 100 centavos no real), mili é milésimo (1.000 mm, 1.000 mL, 1.000 g no kg). No quadro de unidades, contar as casas entre as duas unidades: cada casa é um × 10.',
  },
  {
    id: 'acrescenta-zeros-no-decimal',
    nome: 'põe zeros depois da vírgula para multiplicar por 10, 100, 1.000',
    causa: 'Decorou "multiplicar por 100 é pôr dois zeros" com números inteiros e repete a regra num decimal, sem mexer na vírgula.',
    exemplo: '1,5 m × 100 = 1,500 cm; 2,5 kg = 2,5000 g.',
    desmonte: '1,500 é o mesmo que 1,5: zeros no fim, depois da vírgula, não mudam nada (unidade 8). No quadro de unidades, quem anda é a vírgula: de m para cm ela pula duas casas, e o zero que falta aparece: 150 cm.',
  },
  {
    id: 'mistura-unidades',
    nome: 'faz a conta com medidas em unidades diferentes',
    causa: 'Vê dois números e faz a conta direto, sem notar que um conta metros e o outro, centímetros.',
    exemplo: '2 m − 35 cm vira 35 − 2 = 33; 1,2 m + 85 cm = 86,2; tapete de 2 m por 80 cm com área 160.',
    desmonte: 'Na régua: 2 m menos um palmo e meio não pode dar 33 de nada. Antes da conta, as duas medidas na mesma unidade: 2 m = 200 cm, e 200 − 35 = 165 cm.',
  },
  {
    id: 'converte-area-como-comprimento',
    nome: 'converte área com o fator do comprimento',
    causa: 'Sabe que 1 m = 100 cm e acha que 1 m² = 100 cm². Esquece que a área tem duas medidas, comprimento e largura, e que as duas mudam.',
    exemplo: '1 m² = 100 cm²; 3 m² = 300 cm²; 5.000 cm² = 50 m².',
    desmonte: 'Um quadrado de 1 m de lado tem 100 fileiras de 100 quadradinhos de 1 cm: 100 × 100 = 10.000 cm². Os 100 cm² do erro cabem num quadradinho de 10 cm por 10 cm, um dos 100 da grade do metro quadrado. No quadro de área, cada unidade tem 2 casas.',
  },
  {
    id: 'confunde-area-perimetro',
    nome: 'calcula a volta (perímetro) no lugar da área',
    causa: 'Soma os lados, como quem mede o rodapé, quando a pergunta é quanto chão a figura cobre.',
    exemplo: 'Sala de 4 m por 3 m com área de 14 m² (4 + 3 + 4 + 3).',
    desmonte: 'Cobrir o chão com quadrados de 1 m de lado: 3 fileiras de 4, 12 quadrados. O 14 é o rodapé, em metros, e não cobre nada. Área conta quadrados (m²); perímetro conta comprimento (m).',
  },
]
