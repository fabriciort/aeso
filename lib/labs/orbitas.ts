import type { Lab } from './types'

// Definição do laboratório "orbitas". Conteúdo em components/labs/orbitas/.

export const ORBITAS: Lab = {
  slug: 'orbitas',
  title: 'Coloque um planeta em órbita',
  subtitle: 'Lance um satélite imaginário e descubra as leis de Kepler na prática.',
  area: 'Física',
  level: 'Ensino médio',
  minutes: 15,
  status: 'em-breve',
  concepts: ['Gravitação', 'Leis de Kepler', 'Órbitas'],
  accent: '#46d9c6',
  achievement: {
    title: 'Mestre das órbitas',
    description: 'Você colocou uma bala em órbita, viu as áreas iguais de Kepler e mediu a regra dos períodos com os planetas reais.',
  },
  steps: [
    {
      id: 'imagine',
      kind: 'cenario',
      title: 'O canhão de Newton',
      goal: 'Dispare o canhão de Newton com velocidades diferentes.',
      vega:
        'No palco: a Terra grande, uma montanha exageradamente alta (nas contas, 30 km) e um canhão no topo, como no experimento mental de Newton (Principia, 1687). O aluno escolhe a velocidade (0 a 12 km/s, slider ou arrastando no palco) e dispara; o ar é ignorado. Tarefa: uma bala lenta (< 4 km/s) e uma rápida (> 6 km/s). Ideia central: quanto mais rápida, mais longe a bala cai, e o chão se curva por baixo dela. Não revele ainda que 7,9 km/s dá a volta; pergunte o que aconteceria se o chão "fugisse" tão rápido quanto a bala cai.',
      ask: ['Por que a bala cai em curva?', 'Newton tinha mesmo um canhão?', 'Por que a montanha precisa estar acima do ar?'],
    },
    {
      id: 'preveja',
      kind: 'previsao',
      title: 'A volta ao mundo',
      goal: 'Aposte na velocidade que faz a bala nunca tocar o chão.',
      vega:
        'Pergunta: com qual velocidade a bala dá a volta na Terra sem tocar o chão? Opções: 0,8 km/s; 7,9 km/s; 79 km/s; nenhuma (sempre cai). Resposta: 7,9 km/s = √(GM/r), com GM = 3,986 × 10¹⁴ m³/s² e r ≈ 6371 km. Depois o palco dispara a 7,9 km/s e a bala volta pelas costas do canhão. Ideia: ela continua caindo, mas a Terra se curva na mesma medida; órbita é queda livre sem fim. 79 km/s escaparia; 0,8 km/s cai logo. Antes da escolha, não entregue a resposta.',
      ask: ['Por que a bala não para de cair?', 'De onde sai o número 7,9 km/s?', 'O que aconteceria a 79 km/s?'],
    },
    {
      id: 'entenda',
      kind: 'conceito',
      title: 'Órbita é queda',
      goal: 'Ache a órbita circular, depois uma elipse e um escape.',
      vega:
        'O palco mostra a Terra inteira. Cena 1: o aluno ajusta a velocidade até a bala fechar uma volta quase circular (entre ≈ 7,88 e 8,0 km/s). Cena 2: acima disso a órbita vira elipse; a partir de √2 × 7,9 ≈ 11,2 km/s (velocidade de escape) a bala escapa. Um rótulo mostra o tipo: Cai, Círculo, Elipse, Escapa!. A simulação integra a gravidade de Newton com o método de Verlet; a montanha e as altitudes estão exageradas no desenho. Guie pelo rótulo e pela forma do rastro, sem dar o número exato da cena 1 se o aluno ainda não achou.',
      ask: ['Por que a velocidade de escape é √2 vezes a circular?', 'Por que a elipse passa de novo pelo canhão?', 'Satélites de verdade usam essa velocidade?'],
    },
    {
      id: 'observe',
      kind: 'observacao',
      title: 'Áreas iguais',
      goal: 'Pinte fatias de área varridas em tempos iguais.',
      vega:
        'O palco se afasta: a Terra vira uma estrela parecida com o Sol e aparece um planeta imaginário numa órbita bem excêntrica (e = 0,6, a = 1 UA, periélio 0,4 UA, afélio 1,6 UA). A seta mostra a velocidade: perto da estrela ≈ 60 km/s, longe ≈ 15 km/s (vis-viva). O aluno toca em Marcar para pintar a área varrida pela linha estrela–planeta durante intervalos iguais (1/10 do período). Cada fatia mostra a área (≈ 0,25 UA²): todas iguais. É a 2ª lei de Kepler (Astronomia Nova, 1609), consequência da conservação do momento angular.',
      ask: ['Por que o planeta acelera perto da estrela?', 'Por que as áreas dão iguais?', 'A Terra também muda de velocidade?'],
    },
    {
      id: 'meca',
      kind: 'medicao',
      title: 'A regra dos períodos',
      goal: 'Ajuste uma reta aos planetas reais no gráfico T² × a³.',
      vega:
        'Cena 1: Sistema Solar de Mercúrio a Saturno, distâncias comprimidas (raiz quadrada) e velocidades angulares relativas corretas. Cena 2: os planetas viram pontos num gráfico T × a (uma curva). Cena 3: o gráfico vira T² × a³ e os pontos se alinham; o aluno gira uma reta T² = k·a³ até passar pelos pontos; o valor esperado é k = 1 ano²/UA³ (um quadro ampliado mostra os planetas internos). Dados da NASA (a em UA / T em anos): Mercúrio 0,387/0,241; Vênus 0,723/0,615; Terra 1/1; Marte 1,524/1,881; Júpiter 5,203/11,862; Saturno 9,537/29,457. Cena 4: 3ª lei de Kepler (Harmonices Mundi, 1619): T² ∝ a³.',
      ask: ['Por que T² e a³, e não T e a?', 'O k seria 1 em outra estrela?', 'Como Kepler descobriu isso sem computador?'],
    },
    {
      id: 'e-se',
      kind: 'desafio',
      title: 'Três órbitas imaginárias',
      goal: 'Use as leis das órbitas em três situações.',
      vega:
        'Três desafios, um por cena. (a) Planeta imaginário a 4 UA do Sol: T = a^1,5 = 8 anos (T² = 64 = 4³). (b) Astronautas da ISS (≈ 400 km, volta em ≈ 92 min) flutuam porque estão em queda livre junto com a estação; a gravidade lá é ≈ 89 % da superfície, (6371/6771)². (c) Se a Terra andasse √2 ≈ 1,41 vez mais rápido, atingiria a velocidade de escape do Sol e iria embora numa parábola. Antes da resposta, ajude com perguntas; depois, explique nos dois casos.',
      ask: ['Por que dobrar a distância não dobra o ano?', 'Se há gravidade na ISS, por que flutuam?', 'O que acontece com 1,2 vez a velocidade?'],
    },
    {
      id: 'conclua',
      kind: 'conclusao',
      title: 'Mestre das órbitas',
      goal: 'Veja o que você descobriu.',
      vega:
        'Conclusão. O aluno achou a velocidade circular (≈ 7,9 km/s), viu a 2ª lei (áreas iguais) e ajustou a 3ª lei (T² = k·a³, k ≈ 1 ano²/UA³), e calculou que um planeta a 4 UA tem ano de 8 anos. Fontes: Newton, Principia (1687); Kepler, Astronomia Nova (1609) e Harmonices Mundi (1619); NASA Planetary Fact Sheet. Sugira observar Júpiter e Saturno no céu ou explorar outros laboratórios.',
      ask: ['Como Newton explicou as leis de Kepler?', 'Como se lança um satélite de verdade?', 'Exoplanetas seguem as mesmas leis?'],
    },
  ],
}
