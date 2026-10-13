import type { Aula, Visual } from '@/lib/formation/schema'

// Círculo e π. A roda de bicicleta de 70 cm de diâmetro: quanto ela anda
// numa volta? O aluno conhece o centro, o raio e o diâmetro (o raio é a
// metade). O momento-chave é o Mexa "desenrolar": a roda rola uma volta
// sobre a reta, o contorno fica deitado, e cabem 3 diâmetros e mais um
// pedacinho (0,14…). Esse número é π, pouco mais de 3, e não acaba: 3,14 é
// uma aproximação, e a conta com ele se escreve com ≈. Ele é o mesmo em todo
// círculo. Daí C = π · d e, com o raio, C = 2 · π · r. A área do círculo
// fica de fora desta aula.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })

const roda = (circulo: Record<string, unknown>, esboco: string) => fig({ circulo: { raio: 1, diametroVisivel: true, diametroTexto: '70 cm', ...circulo } }, esboco)
// O mesmo rótulo do Mexa até a ideia, para o palco não mudar de tamanho no meio da rolagem.
const ROLADA = { circulo: { raio: 1, diametroVisivel: true }, desenrolado: true, rotulo: 'uma volta da roda' }
const rolada = (extra: Record<string, unknown>, esboco: string) => fig({ ...ROLADA, ...extra }, esboco)
const mesa = (esboco: string) => fig({ circulo: { raio: 1, raioVisivel: true, raioTexto: '50 cm' } }, esboco)

export const aula: Aula = {
  id: 'B.U16.A7',
  titulo: 'Círculo e π',
  objetivo: 'Reconhecer o centro, o raio e o diâmetro de um círculo, saber que a volta tem π diâmetros (pouco mais de 3, um número que não acaba) e calcular a volta com C = π · d ou C = 2 · π · r, usando π ≈ 3,14.',
  modelo: 'figura',
  esboco: 'Abre na roda de bicicleta de 70 cm de diâmetro: quanto ela anda numa volta? Primeiro os nomes: o raio é a metade do diâmetro. Momento-chave: o Mexa "desenrolar", em que a roda rola uma volta sobre a reta e o contorno fica deitado; embaixo, 3 diâmetros marcados e um pedacinho que sobra (0,14). Esse número é π: não acaba, e 3,14 é uma aproximação. É o mesmo na moeda e na roda gigante. Depois, a volta da roda (π · 70 ≈ 219,8 cm) e a da mesa, pelo raio (2 · π · 50 ≈ 314 cm).',
  vega: 'Ideia central: em todo círculo, a volta (a circunferência) tem o mesmo número de diâmetros, pouco mais de 3. Esse número se chama π (pi) e não acaba: 3,14159… Para fazer contas, troca-se π por 3,14, que é uma aproximação; por isso o resultado se escreve com ≈. A volta é C = π · d; como o diâmetro é o dobro do raio, também C = 2 · π · r. Erros esperados: usar o raio no lugar do diâmetro (π · 35 para uma roda de 70 cm de diâmetro); achar que π é 3,14, ou 3, exatamente; achar que um círculo maior tem um π maior. Guie com "Quantos diâmetros cabem na volta?", "Você tem o raio ou o diâmetro?", "A volta tem de dar pouco mais de 3 diâmetros: confere?". A área do círculo (π · r²) fica para depois.',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'A roda de uma bicicleta tem **70 cm** de diâmetro, de ponta a ponta. Numa volta da roda, quanto a bicicleta anda?',
      fala: 'A roda de uma bicicleta tem setenta centímetros de diâmetro, de ponta a ponta. Numa volta da roda, quanto a bicicleta anda?',
      visual: roda({}, 'Um círculo com o centro marcado e o diâmetro em azul, atravessando de ponta a ponta, com 70 cm embaixo.'),
      esboco: 'A roda anda, numa volta, o comprimento do contorno dela. A pergunta fica aberta.',
    },
    {
      tipo: 'aposta',
      pergunta: 'O **diâmetro** atravessa pelo centro. O **raio** vai do centro até a borda. Quanto mede o raio da roda?',
      fala: 'O diâmetro atravessa pelo centro. O raio vai do centro até a borda. Quanto mede o raio da roda?',
      visual: roda({ raioVisivel: true, raioTexto: 'raio' }, 'O mesmo círculo, agora também com o raio em âmbar, do centro à borda.'),
      opcoes: [
        {
          texto: '35 cm', certa: true,
          explica: 'Isso. O raio faz metade do caminho: o diâmetro tem dois raios.',
          fala: 'Isso. O raio faz metade do caminho: o diâmetro tem dois raios.',
          mostra: roda({ raioVisivel: true, raioTexto: '35 cm' }, 'O raio ganha 35 cm.'),
        },
        {
          texto: '140 cm', erro: 'confunde-raio-diametro',
          explica: '140 é o dobro. O raio vai só do centro à borda, metade do diâmetro: 35 cm.',
          fala: 'Cento e quarenta é o dobro. O raio vai só do centro à borda, metade do diâmetro: trinta e cinco centímetros.',
          mostra: roda({ raioVisivel: true, raioTexto: '35 cm' }, 'O raio ganha 35 cm.'),
        },
      ],
      esboco: 'Os nomes, com o desmonte da troca entre raio e diâmetro.',
    },
    {
      tipo: 'mexa',
      texto: 'Agora role a roda uma volta inteira sobre o chão. O contorno dela vai ficar deitado na reta.',
      fala: 'Agora role a roda uma volta inteira sobre o chão. O contorno dela vai ficar deitado na reta.',
      visual: fig({ circulo: { raio: 1, diametroVisivel: true }, desenrolar: true, rotulo: 'uma volta da roda' }, 'A roda parada sobre a reta, com o diâmetro em azul. Um toque e ela rola para a direita uma volta, deixando o contorno deitado em âmbar.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na roda para ela rolar.',
        sucesso: { desenrolado: true },
        mostre: 'A roda rola uma volta; o contorno fica deitado. Embaixo, 3 diâmetros marcados e um pedacinho que sobra.',
      },
      descoberta: 'A volta tem 3 diâmetros e mais um pedacinho.',
      esboco: 'O momento-chave: a volta medida com o diâmetro, como uma régua.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Quantos diâmetros cabem na volta?',
      visual: rolada({}, 'A volta deitada, com os 3 diâmetros em azul, numerados 1, 2 e 3, e o pedacinho âmbar com 0,14.'),
      opcoes: [
        {
          texto: 'Um pouco mais de 3', certa: true,
          explica: 'Isso. Cabem 3 e sobra um pedacinho, uns 0,14 de diâmetro.',
          fala: 'Isso. Cabem três e sobra um pedacinho, uns quatorze centésimos de diâmetro.',
          mostra: rolada({}, 'A mesma volta, com o pedacinho que sobra.'),
        },
        {
          texto: 'Exatamente 3', erro: 'pi-e-3-14',
          explica: 'Olhe a ponta: depois do 3 sobra um pedacinho. A volta passa um pouco de 3 diâmetros.',
          fala: 'Olhe a ponta: depois do três sobra um pedacinho. A volta passa um pouco de três diâmetros.',
          mostra: rolada({}, 'O pedacinho âmbar depois do terceiro diâmetro.'),
        },
      ],
      esboco: 'A leitura do desenho, antes de dar o nome ao número.',
    },
    {
      tipo: 'ideia',
      texto: 'Esse número é **π** (pi): 3,14159… Ele **não acaba**. O 3,14 é só uma aproximação, boa para as contas.',
      fala: 'Esse número é pi: três vírgula um quatro um cinco nove, e continua. Ele não acaba. O três vírgula catorze é só uma aproximação, boa para as contas.',
      visual: rolada({ rotulo: 'π = 3,14159…' }, 'A volta deitada, com π = 3,14159… embaixo.'),
      esboco: 'O nome e o alerta: π não é 3,14.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma moeda e uma roda gigante. Em qual delas cabem mais diâmetros na volta?',
      fala: 'Uma moeda e uma roda gigante. Em qual delas cabem mais diâmetros na volta?',
      visual: rolada({ rotulo: 'π = 3,14159…' }, 'A mesma volta deitada.'),
      opcoes: [
        {
          texto: 'Nas duas, π diâmetros', certa: true,
          explica: 'Isso. Na roda gigante, a volta e o diâmetro crescem juntos. Em todo círculo, a volta tem π diâmetros.',
          fala: 'Isso. Na roda gigante, a volta e o diâmetro crescem juntos. Em todo círculo, a volta tem pi diâmetros.',
          mostra: rolada({ rotulo: 'todo círculo: π diâmetros' }, 'Embaixo: todo círculo, π diâmetros.'),
        },
        {
          texto: 'Na roda gigante', erro: 'pi-depende-do-tamanho',
          explica: 'A volta da roda gigante é maior, mas o diâmetro também. Os dois crescem juntos: sempre π diâmetros.',
          fala: 'A volta da roda gigante é maior, mas o diâmetro também. Os dois crescem juntos: sempre pi diâmetros.',
          mostra: rolada({ rotulo: 'todo círculo: π diâmetros' }, 'Embaixo: todo círculo, π diâmetros.'),
        },
      ],
      esboco: 'π é o mesmo em todo círculo: a figura só muda de escala.',
    },
    {
      tipo: 'anote',
      titulo: 'Círculo e π',
      definicao: '**π** (pi) é quantas vezes o diâmetro cabe na volta do círculo: 3,14159…, um número que não acaba. A volta é $C = \\pi \\cdot d$.',
      exemplo: { tex: 'C = \\pi \\cdot 70 \\approx 3{,}14 \\cdot 70 = 219{,}8 \\text{ cm}', fala: 'a volta é pi vezes setenta, aproximadamente três vírgula catorze vezes setenta, duzentos e dezenove vírgula oito centímetros' },
      alerta: 'π não é 3,14: 3,14 é uma aproximação. Use ≈ quando trocar π por 3,14.',
      esboco: 'Na página: o círculo com o raio e o diâmetro, a volta deitada e C = π · d.',
    },
    {
      tipo: 'passo',
      problema: 'A roda tem **70 cm** de diâmetro. Quanto a bicicleta anda numa volta?',
      fala: 'A roda tem setenta centímetros de diâmetro. Quanto a bicicleta anda numa volta?',
      visual: roda({}, 'A roda parada de novo, com o diâmetro de 70 cm.'),
      passos: [
        {
          pergunta: 'Qual conta dá a volta?',
          opcoes: [
            {
              texto: '$\\pi \\cdot 70$', certa: true,
              explica: 'Isso. A volta tem π diâmetros, e o diâmetro é 70.',
              fala: 'Isso. A volta tem pi diâmetros, e o diâmetro é setenta.',
              mostra: roda({}, 'O diâmetro de 70 cm aceso.'),
            },
            {
              texto: '$\\pi \\cdot 35$', erro: 'confunde-raio-diametro',
              explica: '35 é o raio. A volta tem π **diâmetros**: $\\pi \\cdot 70$.',
              fala: 'Trinta e cinco é o raio. A volta tem pi diâmetros: pi vezes setenta.',
              mostra: roda({ raioVisivel: true, raioTexto: '35 cm' }, 'O raio de 35 cm, que é a metade do diâmetro.'),
            },
          ],
          linha: { tex: 'C = \\pi \\cdot 70', fala: 'a volta é pi vezes setenta' },
        },
        {
          pergunta: 'Troque π por 3,14. Como fica a conta?',
          fala: 'Troque pi por três vírgula catorze. Como fica a conta?',
          opcoes: [
            {
              texto: '$\\pi \\cdot 70 \\approx 219{,}8$ cm', certa: true,
              explica: 'Isso. $3{,}14 \\cdot 70 = 219{,}8$. Como π não é 3,14, a volta é **cerca de** 219,8 cm.',
              fala: 'Isso. Três vírgula catorze vezes setenta, duzentos e dezenove vírgula oito. Como pi não é três vírgula catorze, a volta é cerca de duzentos e dezenove vírgula oito centímetros.',
              mostra: rolada({ rotulo: '≈ 219,8 cm' }, 'A roda rola de novo e a volta deitada ganha ≈ 219,8 cm embaixo.'),
            },
            {
              texto: '$\\pi \\cdot 70 = 219{,}8$ cm', erro: 'pi-e-3-14',
              explica: 'A conta $3{,}14 \\cdot 70$ dá 219,8, mas π não é 3,14. Então a volta é **cerca de** 219,8: use ≈.',
              fala: 'A conta três vírgula catorze vezes setenta dá duzentos e dezenove vírgula oito, mas pi não é três vírgula catorze. Então a volta é cerca de duzentos e dezenove vírgula oito: use aproximadamente.',
              mostra: rolada({ rotulo: '≈ 219,8 cm' }, 'A volta deitada com ≈ 219,8 cm embaixo.'),
            },
          ],
          linha: { tex: 'C \\approx 3{,}14 \\cdot 70 = 219{,}8 \\text{ cm}', fala: 'a volta é aproximadamente três vírgula catorze vezes setenta, duzentos e dezenove vírgula oito centímetros' },
        },
      ],
      esboco: 'A conta do gancho, com os dois erros: o raio no lugar do diâmetro e o π tratado como 3,14 exato.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Uma mesa redonda tem **50 cm** de **raio**. Qual conta dá a volta dela?',
      fala: 'Uma mesa redonda tem cinquenta centímetros de raio. Qual conta dá a volta dela?',
      visual: mesa('Um círculo com o raio em âmbar, do centro à borda, com 50 cm.'),
      opcoes: [
        {
          texto: '$2 \\cdot \\pi \\cdot 50$', certa: true,
          explica: 'Isso. O diâmetro tem dois raios, ${2 \\cdot 50 = 100}$ cm. Com o raio: $C = 2 \\cdot \\pi \\cdot r$.',
          fala: 'Isso. O diâmetro tem dois raios, cem centímetros. Com o raio, a volta é dois vezes pi vezes r.',
          mostra: fig({ circulo: { raio: 1, raioVisivel: true, raioTexto: '50 cm', diametroVisivel: true, diametroTexto: '100 cm' } }, 'O diâmetro aparece em azul, com 100 cm, ao lado do raio de 50 cm.'),
        },
        {
          texto: '$\\pi \\cdot 50$', erro: 'confunde-raio-diametro',
          explica: '50 é o raio, metade do diâmetro. Com ele, a conta dá meia volta. Dobre: $2 \\cdot \\pi \\cdot 50$.',
          fala: 'Cinquenta é o raio, metade do diâmetro. Com ele, a conta dá meia volta. Dobre: dois vezes pi vezes cinquenta.',
          mostra: fig({ circulo: { raio: 1, raioVisivel: true, raioTexto: '50 cm', diametroVisivel: true, diametroTexto: '100 cm' } }, 'O diâmetro de 100 cm ao lado do raio de 50 cm.'),
        },
      ],
      esboco: 'A segunda forma da conta, pelo raio. O desmonte é o mesmo: o diâmetro tem dois raios.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: quantos cm de fita dão a volta na mesa de **50 cm** de raio? Use π ≈ 3,14.',
      fala: 'No papel: quantos centímetros de fita dão a volta na mesa de cinquenta centímetros de raio? Use pi aproximadamente três vírgula catorze.',
      resposta: 314,
      resolucao: [
        { tex: 'C = 2 \\cdot \\pi \\cdot 50 = \\pi \\cdot 100', fala: 'a volta é dois vezes pi vezes cinquenta, que é pi vezes cem' },
        { tex: 'C \\approx 3{,}14 \\cdot 100 = 314 \\text{ cm}', fala: 'aproximadamente três vírgula catorze vezes cem, trezentos e catorze centímetros' },
      ],
      esboco: 'A conta da mesa. Confere: 314 é pouco mais de 3 diâmetros de 100.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['circulo-n1', 'circulo-n2', 'circulo-n3'],
      esboco: 'Nível 1: a volta pelo diâmetro, com o desenho. Nível 2: a volta pelo raio, e uma pergunta sobre o que é π. Nível 3: o diâmetro a partir da volta, e a distância de várias voltas de uma roda.',
    },
    {
      tipo: 'fecho',
      texto: 'Numa volta, a bicicleta anda **cerca de 220 cm**: pouco mais de 3 diâmetros. Na próxima aula: o esquadro do pedreiro.',
      fala: 'Numa volta, a bicicleta anda cerca de duzentos e vinte centímetros: pouco mais de três diâmetros. Na próxima aula: o esquadro do pedreiro.',
      visual: rolada({ rotulo: '≈ 219,8 cm' }, 'A volta deitada com os 3 diâmetros e ≈ 219,8 cm embaixo.'),
      esboco: 'Responde ao gancho e anuncia Pitágoras.',
    },
  ],
}
