import type { Aula, Visual } from '@/lib/formation/schema'

// Teorema de Pitágoras. O pedreiro confere o canto reto com a trena: 3 m
// numa parede, 4 m na outra, e a diagonal tem de dar 5 m. Por quê? O
// triângulo retângulo ganha os nomes (catetos e hipotenusa) e um quadrado
// sobre cada lado: 9, 16 e 25 quadradinhos. O momento-chave é o Mexa
// "encaixar": os quadradinhos dos dois quadrados menores voam para o grande
// e o enchem, 9 + 16 = 25. Daí a² + b² = c², e a hipotenusa é a raiz (a
// unidade 13): √25 = 5. Só vale com o canto reto: num triângulo sem ele, os
// quadrados não fecham. Os erros: somar os lados (3 + 4 = 7), parar no
// quadrado (25) e usar o teorema sem canto reto.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

/** O canto do pedreiro: 3 m numa parede, 4 m na outra, o canto reto em A. Mais alto que largo, para os nomes dos lados caberem no celular. */
const TRI = [[0, 0], [3, 0], [0, 4]]
const canto = (lados: (string | number | null)[], extra: Record<string, unknown>, esboco: string) =>
  fig({ grade: true, poligono: { vertices: TRI, lados, angulosRetos: [0] }, unidade: 'm', ...extra }, esboco)
const quadrados = (areas: (string | number)[] | undefined, extra: Record<string, unknown>, esboco: string) =>
  fig({ poligono: { vertices: TRI, angulosRetos: [0] }, quadradosNosLados: areas ? { quadriculado: true, areas } : { quadriculado: true }, ...extra }, esboco)

/** Um triângulo sem canto reto: quadrados de 16, 18 e 10. */
const TORTO = [[0, 0], [4, 0], [1, 3]]

/** A tela de 80 cm por 60 cm, com o canto reto embaixo à direita. */
const TELA = [[0, 0], [8, 0], [8, 6]]
// Os lados sem a unidade: "60 cm" na vertical não cabe na borda do palco do celular.
const tela = (diagonal: number | string, esboco: string) => fig({ poligono: { vertices: TELA, lados: [80, 60, diagonal], angulosRetos: [1] } }, esboco)

export const aula: Aula = {
  id: 'B.U16.A8',
  titulo: 'Teorema de Pitágoras',
  objetivo: 'Reconhecer os catetos e a hipotenusa de um triângulo retângulo, saber que a² + b² = c² (a área dos quadrados sobre os lados) só quando há um canto reto, e achar a hipotenusa com a raiz quadrada em medidas inteiras.',
  modelo: 'figura',
  esboco: 'Abre na obra: o pedreiro marca 3 m numa parede e 4 m na outra, e a diagonal tem de dar 5 m para o canto ficar reto. O aluno aposta (5 ou 7), recebe os nomes (catetos e hipotenusa) e vê um quadrado em cada lado, quadriculado: 9, 16 e o da hipotenusa. Momento-chave: o Mexa "encaixar", em que os 9 + 16 quadradinhos voam para o quadrado grande e o enchem: 25. A hipotenusa é o lado dele, √25 = 5. Depois, um triângulo sem canto reto, em que os quadrados não fecham (10 + 16 não dá 18). Fecha com a diagonal de uma tela de 80 cm por 60 cm (100 cm) e o canto de 6 m e 8 m (10 m).',
  vega: 'Ideia central: num triângulo retângulo (com um canto de 90°), os dois lados do canto reto são os catetos e o lado em frente, o maior, é a hipotenusa. O quadrado sobre a hipotenusa tem a mesma área que os dois quadrados sobre os catetos juntos: a² + b² = c². Para achar a hipotenusa, soma-se os quadrados dos catetos e tira-se a raiz quadrada (unidade 13): 3² + 4² = 25, √25 = 5. O pedreiro usa isso ao contrário: se os lados dão 3, 4 e 5 m, o canto está reto (o esquadro 3-4-5, ou 6-8-10). Só vale com o canto reto. Erros esperados: somar os lados (3 + 4 = 7); parar na soma dos quadrados (25) e esquecer a raiz; fazer 3² = 6; usar o teorema num triângulo sem ângulo reto. Guie com "Onde está o canto reto? O lado em frente a ele é a hipotenusa", "Quantos quadradinhos tem cada quadrado?", "O 25 é a área do quadrado grande. E o lado dele?", "A diagonal pode ser maior que os dois catetos juntos?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'O pedreiro quer o canto bem reto. Ele marca **3 m** numa parede e **4 m** na outra. Quanto deve dar a diagonal?',
      fala: 'O pedreiro quer o canto bem reto. Ele marca três metros numa parede e quatro metros na outra. Quanto deve dar a diagonal?',
      visual: canto([3, '?', 4], {}, 'A planta vista de cima, sobre a grade: as duas paredes formam um canto reto (o quadradinho do ângulo reto), com 4 m e 3 m, e a diagonal com "?".'),
      esboco: 'A situação real: o esquadro 3-4-5 da obra. A pergunta fica aberta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quanto você acha que mede a diagonal?',
      visual: canto([3, '?', 4], {}, 'O mesmo canto.'),
      opcoes: [
        {
          texto: '5 m', certa: true,
          explica: 'Isso: é o famoso 3-4-5 do pedreiro. Agora, o porquê.',
          fala: 'Isso: é o famoso três, quatro, cinco do pedreiro. Agora, o porquê.',
          mostra: canto([3, 5, 4], {}, 'A diagonal ganha 5 m.'),
        },
        {
          texto: '7 m', erro: 'pitagoras-soma-os-lados',
          explica: '7 m é dar a volta pelas duas paredes. A diagonal vai reto, por um caminho mais curto: 5 m.',
          fala: 'Sete metros é dar a volta pelas duas paredes. A diagonal vai reto, por um caminho mais curto: cinco metros.',
          mostra: canto([3, 5, 4], {}, 'A diagonal ganha 5 m, menos que 3 + 4.'),
        },
      ],
      esboco: 'A previsão antes da explicação. A errada é a soma dos lados.',
    },
    {
      tipo: 'ideia',
      texto: 'Com um canto reto, o triângulo é **retângulo**. Os lados do canto são os **catetos**, a e b. O de frente, o maior, é a **hipotenusa**, c.',
      fala: 'Com um canto reto, o triângulo é retângulo. Os lados do canto são os catetos, a e b. O de frente, o maior, é a hipotenusa, c.',
      visual: canto(['a', 'c', 'b'], {}, 'Os números dão lugar às letras: a e b nos catetos, c na diagonal. (As palavras inteiras não cabem na borda do palco do celular.)'),
      esboco: 'Os nomes, depois de o aluno já ter visto a figura, e as letras da fórmula que vem no anote.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Ponha um quadrado em cada lado. Os dos catetos têm **9** e **16** quadradinhos. E o da hipotenusa?',
      fala: 'Ponha um quadrado em cada lado. Os dos catetos têm nove e dezesseis quadradinhos. E o da hipotenusa?',
      visual: quadrados([9, '?', 16], {}, 'Um quadrado sobre cada lado, por fora, quadriculado: o de 3 por 3 (âmbar, 9), o de 4 por 4 (azul, 16) e o da hipotenusa (cinza, "?").'),
      opcoes: [
        {
          texto: '25', certa: true,
          explica: 'Isso. A hipotenusa mede 5, e $5 \\cdot 5 = 25$. Repare: $9 + 16 = 25$.',
          fala: 'Isso. A hipotenusa mede cinco, e cinco vezes cinco, vinte e cinco. Repare: nove mais dezesseis, vinte e cinco.',
          mostra: quadrados([9, 25, 16], {}, 'O quadrado da hipotenusa ganha 25.'),
        },
        {
          texto: '49', erro: 'pitagoras-soma-os-lados',
          explica: '49 seria um lado de $3 + 4 = 7$. A hipotenusa mede 5: $5 \\cdot 5 = 25$. Repare: $9 + 16 = 25$.',
          fala: 'Quarenta e nove seria um lado de três mais quatro, sete. A hipotenusa mede cinco: cinco vezes cinco, vinte e cinco. Repare: nove mais dezesseis, vinte e cinco.',
          mostra: quadrados([9, 25, 16], {}, 'O quadrado da hipotenusa ganha 25.'),
        },
      ],
      esboco: 'A coincidência que o aluno nota: 9 + 16 = 25. O Mexa a seguir mostra que não é coincidência.',
    },
    {
      tipo: 'mexa',
      texto: 'Leve os quadradinhos dos dois quadrados menores para o grande. Eles cabem?',
      fala: 'Leve os quadradinhos dos dois quadrados menores para o grande. Eles cabem?',
      visual: quadrados(undefined, { encaixar: true }, 'Os três quadrados com 9, 16 e 25. Um toque e os quadradinhos âmbar e azuis voam, um a um, para o quadrado da hipotenusa e o enchem; os pequenos ficam vazios, tracejados.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na figura para levar os quadradinhos.',
        sucesso: { encaixado: true },
        mostre: 'Os 9 quadradinhos âmbar e os 16 azuis voam para o quadrado grande e o enchem, sem sobrar nem faltar: 9 + 16 = 25.',
      },
      descoberta: 'Os quadrados dos catetos, juntos, enchem o quadrado da hipotenusa: 9 + 16 = 25.',
      esboco: 'O momento-chave. A área dos quadrados é o que o teorema compara.',
    },
    {
      tipo: 'anote',
      titulo: 'Teorema de Pitágoras',
      definicao: 'No **triângulo retângulo**, o quadrado da hipotenusa é a soma dos quadrados dos catetos: $a^2 + b^2 = c^2$.',
      exemplo: { tex: '3^2 + 4^2 = 9 + 16 = 25 \\qquad c = \\sqrt{25} = 5', fala: 'três ao quadrado mais quatro ao quadrado, nove mais dezesseis, vinte e cinco; a hipotenusa é a raiz de vinte e cinco, cinco' },
      alerta: 'Só vale com um canto reto. Some os quadrados, não os lados: $3 + 4$ não dá a hipotenusa.',
      esboco: 'Na página: o triângulo 3-4-5 com os três quadrados e a conta ao lado.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Este triângulo **não tem canto reto**. Os dois quadrados menores enchem o maior?',
      fala: 'Este triângulo não tem canto reto. Os dois quadrados menores enchem o maior?',
      visual: fig({ poligono: TORTO, quadradosNosLados: true }, 'Outro triângulo, sem o quadradinho do ângulo reto, com um quadrado em cada lado: 10, 16 e 18.'),
      opcoes: [
        {
          texto: 'Não: $10 + 16$ passa de 18', certa: true,
          explica: 'Isso. ${10 + 16 = 26}$, e o maior tem 18. Sem o canto reto, a conta não fecha.',
          fala: 'Isso. Dez mais dezesseis, vinte e seis, e o maior tem dezoito. Sem o canto reto, a conta não fecha.',
          mostra: fig({ poligono: TORTO, quadradosNosLados: true, rotulo: '10 + 16 = 26, não 18' }, 'Embaixo: 10 + 16 = 26, não 18.'),
        },
        {
          texto: 'Sim: vale em todo triângulo', erro: 'pitagoras-sem-angulo-reto',
          explica: 'Some: ${10 + 16 = 26}$, e o maior tem 18. O teorema só vale com um canto reto.',
          fala: 'Some: dez mais dezesseis, vinte e seis, e o maior tem dezoito. O teorema só vale com um canto reto.',
          mostra: fig({ poligono: TORTO, quadradosNosLados: true, rotulo: '10 + 16 = 26, não 18' }, 'Embaixo: 10 + 16 = 26, não 18.'),
        },
      ],
      esboco: 'O contraexemplo: é por isso que o 3-4-5 garante o canto reto.',
    },
    {
      tipo: 'passo',
      problema: 'Uma tela tem **80 cm** por **60 cm**, com os cantos retos. Quanto mede a diagonal?',
      fala: 'Uma tela tem oitenta centímetros por sessenta centímetros, com os cantos retos. Quanto mede a diagonal?',
      visual: tela('?', 'Metade da tela: um triângulo retângulo com 80 cm embaixo, 60 cm em pé à direita (o canto reto marcado) e a diagonal com "?".'),
      passos: [
        {
          pergunta: 'Some os quadrados dos catetos.',
          opcoes: [
            {
              texto: '$80^2 + 60^2 = 10.000$', certa: true,
              explica: 'Isso. ${6.400 + 3.600 = 10.000}$: é a área do quadrado da diagonal.',
              fala: 'Isso. Seis mil e quatrocentos mais três mil e seiscentos, dez mil: é a área do quadrado da diagonal.',
              mostra: tela('?', 'O mesmo triângulo.'),
            },
            {
              texto: '$80 + 60 = 140$', erro: 'pitagoras-soma-os-lados',
              explica: 'Somar os lados é dar a volta pelos dois. O teorema soma os **quadrados**: ${80^2 + 60^2}$.',
              fala: 'Somar os lados é dar a volta pelos dois. O teorema soma os quadrados: oitenta ao quadrado mais sessenta ao quadrado.',
              mostra: tela('?', 'O mesmo triângulo.'),
            },
            {
              texto: '$80 \\cdot 2 + 60 \\cdot 2 = 280$', erro: 'potencia-multiplica-base-pelo-expoente',
              explica: '${80^2}$ é ${80 \\cdot 80 = 6.400}$, não ${80 \\cdot 2}$. O 2 diz quantas vezes o 80 entra.',
              fala: 'Oitenta ao quadrado é oitenta vezes oitenta, seis mil e quatrocentos, não oitenta vezes dois. O dois diz quantas vezes o oitenta entra.',
              mostra: tela('?', 'O mesmo triângulo.'),
            },
          ],
          linha: { tex: '80^2 + 60^2 = 6.400 + 3.600 = 10.000', fala: 'oitenta ao quadrado mais sessenta ao quadrado, seis mil e quatrocentos mais três mil e seiscentos, dez mil' },
        },
        {
          pergunta: 'A diagonal é o lado do quadrado de **10.000**. Quanto mede?',
          fala: 'A diagonal é o lado do quadrado de dez mil. Quanto mede?',
          opcoes: [
            {
              texto: '100 cm', certa: true,
              explica: 'Isso. ${100 \\cdot 100 = 10.000}$: a raiz de 10.000 é 100.',
              fala: 'Isso. Cem vezes cem, dez mil: a raiz de dez mil é cem.',
              mostra: tela(100, 'A diagonal ganha 100 cm.'),
            },
            {
              texto: '10.000 cm', erro: 'pitagoras-esquece-a-raiz',
              explica: '10.000 é a área do quadrado. A diagonal é o lado dele: ${\\sqrt{10.000} = 100}$ cm.',
              fala: 'Dez mil é a área do quadrado. A diagonal é o lado dele: a raiz de dez mil, cem centímetros.',
              mostra: tela(100, 'A diagonal ganha 100 cm.'),
            },
            {
              texto: '5.000 cm', erro: 'raiz-e-a-metade',
              explica: 'A raiz não é a metade. Que número vezes ele mesmo dá 10.000? ${100 \\cdot 100}$.',
              fala: 'A raiz não é a metade. Que número vezes ele mesmo dá dez mil? Cem vezes cem.',
              mostra: tela(100, 'A diagonal ganha 100 cm.'),
            },
          ],
          linha: { tex: 'c = \\sqrt{10.000} = 100 \\text{ cm}', fala: 'a diagonal é a raiz de dez mil, cem centímetros' },
        },
      ],
      esboco: 'A conta inteira, com os três erros da aula: somar os lados, 80² = 160 e esquecer (ou errar) a raiz.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: o pedreiro marcou **6 m** e **8 m** a partir do canto. Para o canto ficar reto, quantos metros deve dar a diagonal?',
      fala: 'No papel: o pedreiro marcou seis metros e oito metros a partir do canto. Para o canto ficar reto, quantos metros deve dar a diagonal?',
      resposta: 10,
      resolucao: [
        { tex: '6^2 + 8^2 = 36 + 64 = 100', fala: 'seis ao quadrado mais oito ao quadrado, trinta e seis mais sessenta e quatro, cem' },
        { tex: 'c = \\sqrt{100} = 10 \\text{ m}', fala: 'a diagonal é a raiz de cem, dez metros' },
      ],
      esboco: 'O 3-4-5 em dobro: 6-8-10, que o pedreiro usa num cômodo grande.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['pitagoras-n1', 'pitagoras-n2', 'pitagoras-n3'],
      esboco: 'Nível 1: a hipotenusa do 3-4-5 e dos seus múltiplos, com os quadrados desenhados. Nível 2: outras ternas (5-12-13, 8-15-17…) e o cateto que falta. Nível 3: a escada na parede, a diagonal da tela e o esquadro do pedreiro.',
    },
    {
      tipo: 'fecho',
      texto: 'Se a trena dá **5 m** na diagonal, o canto está reto: ${3^2 + 4^2 = 5^2}$. Na próxima unidade: os sólidos e o volume.',
      fala: 'Se a trena dá cinco metros na diagonal, o canto está reto: três ao quadrado mais quatro ao quadrado é cinco ao quadrado. Na próxima unidade: os sólidos e o volume.',
      visual: canto([3, 5, 4], {}, 'O canto do pedreiro sobre a grade, com 4 m, 3 m e a diagonal de 5 m.'),
      esboco: 'Responde ao gancho e anuncia a unidade 17.',
    },
  ],
}
