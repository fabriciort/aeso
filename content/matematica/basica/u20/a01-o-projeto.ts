import type { Aula, Visual } from '@/lib/formation/schema'

// O projeto. A reforma de um quarto de 5 m por 3 m, com 2,5 m de altura, do
// começo ao fim: o rodapé (o perímetro, 16 m), o piso (a área, 15 m²; as
// caixas de 2 m², arredondando para cima, com 10 % de sobra: 9 caixas), a
// tinta (as 4 paredes, 40 m², sem a porta e a janela: 36 m²; latas de
// 10 m²: 4 latas), a água da tinta (uma tabela de proporção) e o orçamento
// (uma tabela que o aluno fecha, R$ 1.200, e o desconto de 10 % à vista,
// R$ 1.080). O momento-chave é o passo do orçamento: as contas de cada
// cartão viram uma linha da tabela e o total da obra aparece. Os erros a
// desmontar: confundir perímetro e área, arredondar as caixas e as latas
// para baixo, esquecer a sobra, pintar a porta e a janela, somar os preços
// sem a quantidade e dar o desconto no lugar do preço.

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })
const sol = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'solido', estado, esboco })
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const tab = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })
const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })

/** A planta do quarto: 5 m por 3 m. */
const QUARTO = [[0, 0], [5, 0], [5, 3], [0, 3]]
const PLANTA = { poligono: { vertices: QUARTO, preenchido: true, lados: [5, 3, 5, 3] }, unidade: 'm' }

/** O chão coberto de caixas de 2 m² (2 m por 1 m): 6 inteiras e 3 metades, 7,5 caixas. */
const ret = (x0: number, y0: number, x1: number, y1: number) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]
const CAIXAS = [0, 1, 2].flatMap((y) => [
  { vertices: ret(0, y, 2, y + 1), preenchido: true },
  { vertices: ret(2, y, 4, y + 1), preenchido: true },
  { vertices: ret(4, y, 5, y + 1), preenchido: 'azul' },
])
const CHAO = { poligonos: [{ vertices: QUARTO, lados: [5, 3, null, null] }, ...CAIXAS], unidade: 'm' }

/** O quarto como uma caixa: 5 m, 3 m e 2,5 m de altura. As 4 paredes levam tinta. */
const SALA = { comprimento: 5, largura: 3, altura: 2.5, unidade: 'm' }

/** A parede da frente, com a porta (1 m por 2 m) e a janela (2 m por 1 m). */
const PAREDE = {
  poligonos: [
    { vertices: ret(0, 0, 5, 2.5), preenchido: true, lados: ['5 m', '2,5 m', null, null] },
    { vertices: ret(0.5, 0, 1.5, 2), preenchido: 'azul', nome: 'porta' },
    { vertices: ret(2.5, 1, 4.5, 2), preenchido: 'azul', nome: 'janela' },
  ],
}

/** A água da tinta: 300 mL por lata. */
const AGUA = {
  linhas: [{ rotulo: 'latas', valores: [1, 2, 4] }, { rotulo: 'água (mL)', valores: [300, 600, 1200] }],
  setas: [{ de: 0, para: 1, rotulo: '× 2' }, { de: 1, para: 2, rotulo: '× 2' }, { de: 0, para: 1, rotulo: '× 2', embaixo: true }, { de: 1, para: 2, rotulo: '× 2', embaixo: true }],
}

/** O orçamento: uma coluna por item, o total da obra na última. */
const ORC = (piso: string, tinta: string, obra: string) => ({
  linhas: [
    { rotulo: 'item', valores: ['piso', 'rodapé', 'tinta', 'obra'] },
    { rotulo: 'quanto', valores: ['9 caixas', '16 m', '4 latas', ''] },
    { rotulo: 'preço', valores: ['R$ 60', 'R$ 15', 'R$ 105', ''] },
    { rotulo: 'total', valores: [piso, 'R$ 240', tinta, obra] },
  ],
})
const ORC_TUDO = ORC('R$ 540', 'R$ 420', 'R$ 1.200')

export const aula: Aula = {
  id: 'B.U20.A1',
  titulo: 'O projeto',
  objetivo: 'Planejar a reforma de um quarto do começo ao fim, juntando o que aprendeu: perímetro (rodapé), área (piso), divisão arredondada para cima com sobra de 10 % (caixas de piso), área das paredes sem a porta e a janela (latas de tinta), proporção (a água da tinta), o orçamento numa tabela, o desconto em porcentagem e uma equação.',
  modelo: 'figura',
  esboco: 'O mesmo quarto do começo ao fim. A planta (figura) dá o rodapé, no Mexa "contorno" (16 m), e o piso (15 m², contando os quadradinhos). O chão coberto de caixas de 2 m² mostra 7,5 caixas: compra 8; com 10 % de sobra, 8,25 na barra: compra 9. O anote dá a regra de quanto comprar. Depois o quarto como uma caixa (sólido): as 4 paredes somam 40 m²; a parede da frente, com a porta e a janela, tira 4 m²: 36 m², 3,6 latas na barra, compra 4. A tabela de proporção dá a água da tinta. Momento-chave: o passo do orçamento, em que cada conta vira uma casa da tabela e a obra fecha em R$ 1.200; a grade dá o desconto de 10 % à vista (R$ 1.080). O caderno monta a equação do pedreiro.',
  vega: 'Ideia central: um projeto real junta várias contas, e cada uma tem o seu jeito de arredondar e de conferir. Rodapé é o contorno (perímetro: 5 + 3 + 5 + 3 = 16 m); piso é o chão (área: 5 · 3 = 15 m²). Material se compra inteiro: área ÷ quanto cobre uma caixa ou uma lata, sempre arredondando para cima; no piso, com 10 % a mais para os cortes e as quebras (15 + 1,5 = 16,5 m²; 16,5 ÷ 2 = 8,25: 9 caixas). Na tinta, só as 4 paredes (40 m²), sem a porta (2 m²) e a janela (2 m²): 36 m², 3,6 latas, 4 latas. O orçamento é quantidade vezes preço, item por item, e a soma: 540 + 240 + 420 = R$ 1.200; 10 % à vista: R$ 1.080. As medidas e os preços são da aula, não são preços de loja. Erros esperados: dar a área no lugar do perímetro (ou o contrário); arredondar caixas e latas para baixo; esquecer a sobra; pintar a porta e a janela, ou o chão e o teto; somar os preços sem a quantidade; responder o desconto no lugar do preço. Guie com "Isso vai na borda ou cobre o chão?", "Com essa quantidade, falta um pedaço?", "Isso leva tinta?", "Quanto custa a quantidade toda?".',
  cartoes: [
    {
      tipo: 'gancho',
      texto: 'Você vai reformar um quarto de **5 m** por **3 m**: piso novo, rodapé e pintura. Quanto vai custar a obra?',
      fala: 'Você vai reformar um quarto de cinco metros por três metros: piso novo, rodapé e pintura. Quanto vai custar a obra?',
      visual: fig(PLANTA, 'A planta do quarto vista de cima: um retângulo âmbar claro, com 5 m e 3 m nos lados.'),
      esboco: 'A obra inteira numa pergunta só. A aula vai respondendo em pedaços, sempre no mesmo quarto.',
    },
    {
      tipo: 'mexa',
      texto: 'Comece pelo rodapé. Ele corre na borda do chão, em volta do quarto todo.',
      visual: fig({ ...PLANTA, contorno: true }, 'A planta, com os quatro lados medidos. Cada toque acende um lado em âmbar e a soma cresce embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque em cada lado do quarto.',
        sucesso: { perimetro: 16 },
        mostre: 'Os quatro lados acendem e a soma fecha: 5 + 3 + 5 + 3 = 16 m.',
      },
      descoberta: 'O rodapé é o perímetro: 5 + 3 + 5 + 3 = 16 m.',
      esboco: 'A unidade 16 de volta: o contorno, lado por lado.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora o piso. Quanto chão ele cobre?',
      visual: fig(PLANTA, 'A planta, de novo sem a soma.'),
      opcoes: [
        {
          texto: '15 m²', certa: true,
          explica: 'Isso. 3 fileiras de 5 quadrados de 1 m²: $5 \\cdot 3 = 15$.',
          fala: 'Isso. Três fileiras de cinco quadrados de um metro quadrado: cinco vezes três, quinze.',
          mostra: fig({ ...PLANTA, grade: true }, 'A grade aparece no chão: 15 quadradinhos de 1 m².'),
        },
        {
          texto: '16 m²', erro: 'confunde-area-perimetro',
          explica: '16 m é a volta, o rodapé. O piso cobre o chão de dentro: conte os quadradinhos, são 15.',
          fala: 'Dezesseis metros é a volta, o rodapé. O piso cobre o chão de dentro: conte os quadradinhos, são quinze.',
          mostra: fig({ ...PLANTA, grade: true }, 'A grade no chão: 15 quadradinhos.'),
        },
        {
          texto: '8 m²', erro: 'soma-no-lugar-de-multiplicar',
          explica: '$5 + 3$ junta dois lados. O chão tem 3 fileiras de 5 quadrados: $5 \\cdot 3 = 15$.',
          fala: 'Cinco mais três junta dois lados. O chão tem três fileiras de cinco quadrados: cinco vezes três, quinze.',
          mostra: fig({ ...PLANTA, grade: true }, 'A grade no chão: 15 quadradinhos.'),
        },
      ],
      esboco: 'Perímetro e área, lado a lado, no mesmo quarto: a borda e o chão.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Cada caixa de piso cobre **2 m²**. Quantas caixas comprar?',
      fala: 'Cada caixa de piso cobre dois metros quadrados. Quantas caixas comprar?',
      visual: fig(CHAO, 'O chão coberto de caixas de 2 m por 1 m: duas inteiras em cada fileira (âmbar) e meia caixa no fim (azul). Seis inteiras e três metades.'),
      opcoes: [
        {
          texto: '8 caixas', certa: true,
          explica: 'Isso. $15 \\div 2 = 7{,}5$. A loja não vende meia caixa: compre 8.',
          fala: 'Isso. Quinze dividido por dois, sete e meio. A loja não vende meia caixa: compre oito.',
          mostra: barra({ partes: 2, pintadas: 15, inteiros: 8, rotulo: '7,5' }, 'Oito caixas lado a lado, cada uma em duas metades; sete e meia pintadas.'),
        },
        {
          texto: '7 caixas', erro: 'ignora-contexto-do-resto',
          explica: '7 caixas cobrem 14 m². Falta 1 m² de chão sem piso: compre 8.',
          fala: 'Sete caixas cobrem catorze metros quadrados. Falta um metro quadrado de chão sem piso: compre oito.',
          mostra: barra({ partes: 2, pintadas: 15, inteiros: 8, rotulo: '7,5' }, 'Oito caixas lado a lado; sete e meia pintadas.'),
        },
        {
          texto: '7,5 caixas', erro: 'ignora-contexto-do-resto',
          explica: 'A conta dá 7,5, mas a loja vende a caixa inteira. Para cobrir a meia que falta, compre 8.',
          fala: 'A conta dá sete e meio, mas a loja vende a caixa inteira. Para cobrir a meia que falta, compre oito.',
          mostra: barra({ partes: 2, pintadas: 15, inteiros: 8, rotulo: '7,5' }, 'Oito caixas lado a lado; sete e meia pintadas.'),
        },
      ],
      esboco: 'A divisão da unidade 4 com o resto que pede mais um grupo, agora com decimal (unidade 8). As metades azuis no chão mostram a caixa que falta.',
    },
    {
      tipo: 'passo',
      problema: 'O pedreiro pede **10 %** a mais de piso, para os cortes e as quebras. Quantas caixas agora?',
      fala: 'O pedreiro pede dez por cento a mais de piso, para os cortes e as quebras. Quantas caixas agora?',
      visual: barra({ partes: 4, pintadas: 30, inteiros: 9, rotulo: '7,5' }, 'Nove caixas lado a lado, cada uma em quartos. Sete e meia pintadas; a nona vazia.'),
      passos: [
        {
          pergunta: 'Quanto piso, com a sobra?',
          opcoes: [
            {
              texto: '16,5 m²', certa: true,
              explica: 'Isso. 10 % de 15 é 1,5. O chão mais a sobra: 16,5 m².',
              fala: 'Isso. Dez por cento de quinze é um e meio. O chão mais a sobra: dezesseis e meio.',
              mostra: barra({ partes: 4, pintadas: 30, inteiros: 9, rotulo: '7,5' }, 'A barra ainda com 7,5 caixas.'),
            },
            {
              texto: '15 m²', erro: 'esquece-a-sobra',
              explica: '15 m² é só o chão. Os cortes nas paredes e as peças que quebram pedem mais 10 %.',
              fala: 'Quinze metros quadrados é só o chão. Os cortes nas paredes e as peças que quebram pedem mais dez por cento.',
            },
            {
              texto: '25 m²', erro: 'porcentagem-como-numero-inteiro',
              explica: '10 % não são 10 m². São 10 de cada 100: de 15, dá 1,5. O total é 16,5 m².',
              fala: 'Dez por cento não são dez metros quadrados. São dez de cada cem: de quinze, dá um e meio. O total é dezesseis e meio.',
            },
          ],
          linha: { tex: '15 + 1{,}5 = 16{,}5 \\text{ m}^2', fala: 'quinze mais um e meio, dezesseis e meio metros quadrados' },
        },
        {
          pergunta: 'Quantas caixas de 2 m²?',
          fala: 'Quantas caixas de dois metros quadrados?',
          opcoes: [
            {
              texto: '9 caixas', certa: true,
              explica: 'Isso. $16{,}5 \\div 2 = 8{,}25$: com 8, falta um pedaço. Compre 9.',
              fala: 'Isso. Dezesseis e meio dividido por dois, oito vírgula vinte e cinco: com oito, falta um pedaço. Compre nove.',
              mostra: barra({ partes: 4, pintadas: 33, inteiros: 9, rotulo: '8,25' }, 'A barra cresce até 8 caixas e um quarto: a nona começa a ser usada.'),
            },
            {
              texto: '8 caixas', erro: 'ignora-contexto-do-resto',
              explica: '8 caixas cobrem 16 m². Falta meio metro quadrado: compre 9.',
              fala: 'Oito caixas cobrem dezesseis metros quadrados. Falta meio metro quadrado: compre nove.',
              mostra: barra({ partes: 4, pintadas: 33, inteiros: 9, rotulo: '8,25' }, 'A barra em 8,25: um quarto da nona caixa.'),
            },
          ],
          linha: { tex: '16{,}5 \\div 2 = 8{,}25 \\;\\Rightarrow\\; 9 \\text{ caixas}', fala: 'dezesseis e meio dividido por dois, oito vírgula vinte e cinco: nove caixas' },
        },
      ],
      esboco: 'A porcentagem (unidade 11) entra na compra. A barra mostra a nona caixa começando a ser usada.',
    },
    {
      tipo: 'anote',
      titulo: 'Quanto comprar',
      definicao: 'Material se compra inteiro: divida a área pelo que cobre uma caixa (ou uma lata) e **arredonde para cima**. No piso, some antes a sobra.',
      exemplo: { tex: '15 \\cdot 1{,}1 = 16{,}5 \\qquad 16{,}5 \\div 2 = 8{,}25 \\;\\Rightarrow\\; 9 \\text{ caixas}', fala: 'quinze vezes um vírgula um, dezesseis e meio. Dezesseis e meio dividido por dois, oito vírgula vinte e cinco: nove caixas' },
      alerta: 'Não arredonde para baixo: com 8,25 caixas, 8 não cobrem o chão.',
      esboco: 'Na página: a planta com as caixas e a conta da sobra.',
    },
    {
      tipo: 'aposta',
      pergunta: 'Agora a tinta. O quarto tem **2,5 m** de altura. Só as 4 paredes levam tinta. Quanto de parede?',
      fala: 'Agora a tinta. O quarto tem dois metros e meio de altura. Só as quatro paredes levam tinta. Quanto de parede?',
      visual: sol({ ...SALA, destaque: 'laterais' }, 'O quarto como uma caixa, em perspectiva: 5 m na frente, 3 m no fundo, 2,5 m de altura. As paredes acesas.'),
      opcoes: [
        {
          texto: '40 m²', certa: true,
          explica: 'Isso. Duas paredes de 12,5 m² e duas de 7,5 m².',
          fala: 'Isso. Duas paredes de doze e meio e duas de sete e meio metros quadrados.',
          mostra: sol({ ...SALA, destaque: 'laterais', ocultas: true, rotulo: 'paredes: 12,5 + 7,5 + 12,5 + 7,5 = 40 m²' }, 'As arestas de trás tracejadas mostram as 2 paredes escondidas. Embaixo: 12,5 + 7,5 + 12,5 + 7,5 = 40 m².'),
        },
        {
          texto: '20 m²', erro: 'conta-so-o-que-ve',
          explica: 'Essas são as 2 paredes à vista. Atrás há mais duas iguais: 40 m².',
          fala: 'Essas são as duas paredes à vista. Atrás há mais duas iguais: quarenta metros quadrados.',
          mostra: sol({ ...SALA, destaque: 'laterais', ocultas: true, rotulo: 'paredes: 12,5 + 7,5 + 12,5 + 7,5 = 40 m²' }, 'As paredes acesas, com a soma embaixo.'),
        },
        {
          texto: '70 m²', erro: 'pinta-faces-a-mais',
          explica: 'Aí entraram o chão e o teto, 15 m² cada. A pergunta é só das paredes: 40 m².',
          fala: 'Aí entraram o chão e o teto, quinze metros quadrados cada. A pergunta é só das paredes: quarenta.',
          mostra: sol({ ...SALA, destaque: 'laterais', ocultas: true, rotulo: 'paredes: 12,5 + 7,5 + 12,5 + 7,5 = 40 m²' }, 'Só as paredes acesas, com a soma embaixo.'),
        },
      ],
      esboco: 'A área de superfície da unidade 17, escolhendo as faces.',
    },
    {
      tipo: 'aposta',
      pergunta: 'A porta (**1 m** por **2 m**) e a janela (**2 m** por **1 m**) não levam tinta. Quanto pintar?',
      fala: 'A porta, de um metro por dois, e a janela, de dois metros por um, não levam tinta. Quanto pintar?',
      visual: fig(PAREDE, 'A parede da frente, de 5 m por 2,5 m, em âmbar claro; a porta e a janela em azul, com o nome dentro.'),
      opcoes: [
        {
          texto: '36 m²', certa: true,
          explica: 'Isso. A porta tem 2 m² e a janela, 2 m². $40 - 2 - 2 = 36$.',
          fala: 'Isso. A porta tem dois metros quadrados e a janela, dois. Quarenta menos dois menos dois, trinta e seis.',
        },
        {
          texto: '40 m²', erro: 'esquece-de-descontar-aberturas',
          explica: 'Nos 40 m² estão a porta e a janela, que não levam tinta. Tire os 4 m² delas: 36 m².',
          fala: 'Nos quarenta metros quadrados estão a porta e a janela, que não levam tinta. Tire os quatro metros quadrados delas: trinta e seis.',
        },
        {
          texto: '44 m²', erro: 'operacao-trocada',
          explica: 'A porta e a janela são buracos na parede: a tinta diminui. $40 - 4 = 36$.',
          fala: 'A porta e a janela são buracos na parede: a tinta diminui. Quarenta menos quatro, trinta e seis.',
        },
      ],
      esboco: 'Descontar o que não se pinta. A figura volta, agora de frente para a parede.',
    },
    {
      tipo: 'passo',
      problema: 'Uma lata pinta **10 m²**, já com as duas demãos. Quantas latas para **36 m²**?',
      fala: 'Uma lata pinta dez metros quadrados, já com as duas demãos. Quantas latas para trinta e seis metros quadrados?',
      visual: barra({ partes: 5, pintadas: 0, inteiros: 4, semFracao: true }, 'Quatro latas lado a lado, vazias, cada uma em 5 partes.'),
      passos: [
        {
          pergunta: 'Quantas latas de tinta cabem em 36 m²?',
          fala: 'Quantas latas de tinta cabem em trinta e seis metros quadrados?',
          opcoes: [
            {
              texto: '3,6 latas', certa: true,
              explica: 'Isso. $36 \\div 10 = 3{,}6$.',
              fala: 'Isso. Trinta e seis dividido por dez, três vírgula seis.',
              mostra: barra({ partes: 5, pintadas: 18, inteiros: 4, rotulo: '3,6' }, 'A barra enche três latas e mais três quintos da quarta.'),
            },
            {
              texto: '360 latas', erro: 'operacao-trocada',
              explica: 'Cada lata pinta 10 m²: a pergunta é quantas vezes 10 cabe em 36. Divida: 3,6.',
              fala: 'Cada lata pinta dez metros quadrados: a pergunta é quantas vezes dez cabe em trinta e seis. Divida: três vírgula seis.',
            },
          ],
          linha: { tex: '36 \\div 10 = 3{,}6', fala: 'trinta e seis dividido por dez, três vírgula seis' },
        },
        {
          pergunta: 'Quantas latas comprar?',
          opcoes: [
            {
              texto: '4 latas', certa: true,
              explica: 'Isso. Com 3, ficam 6 m² sem tinta. A quarta lata sobra um pouco.',
              fala: 'Isso. Com três, ficam seis metros quadrados sem tinta. A quarta lata sobra um pouco.',
              mostra: barra({ partes: 5, pintadas: 18, inteiros: 4, rotulo: '4 latas' }, 'A barra com 3,6; à direita, "4 latas".'),
            },
            {
              texto: '3 latas', erro: 'ignora-contexto-do-resto',
              explica: '3 latas pintam 30 m². Faltam 6 m² de parede: compre 4.',
              fala: 'Três latas pintam trinta metros quadrados. Faltam seis metros quadrados de parede: compre quatro.',
            },
          ],
          linha: { tex: '3{,}6 \\;\\Rightarrow\\; 4 \\text{ latas}', fala: 'três vírgula seis: quatro latas' },
        },
      ],
      esboco: 'A mesma regra do anote, agora na tinta: dividir e arredondar para cima.',
    },
    {
      tipo: 'mexa',
      texto: 'A tinta pede **300 mL** de água por lata. Quanto de água para as 4 latas?',
      fala: 'A tinta pede trezentos mililitros de água por lata. Quanto de água para as quatro latas?',
      visual: tab({ ...AGUA, completar: true, mostradas: 1 }, 'A tabela de proporção: 1 lata e 300 mL. Cada toque abre a próxima coluna, com as setas × 2 em cima e embaixo.'),
      acao: {
        tipo: 'tocar',
        instrucao: 'Toque na próxima coluna até chegar às 4 latas.',
        sucesso: { colunas: 3 },
        mostre: 'As colunas se completam: 2 latas, 600 mL; 4 latas, 1.200 mL.',
      },
      descoberta: 'O dobro de latas pede o dobro de água: 4 latas, 1.200 mL, ou 1,2 L.',
      esboco: 'A proporção da unidade 10, como num rótulo de tinta.',
    },
    {
      tipo: 'passo',
      problema: 'Hora de fechar o orçamento. Cada coisa: a quantidade vezes o preço.',
      visual: tab(ORC('?', '?', '?'), 'A tabela do orçamento: uma coluna por item (piso, rodapé, tinta) e a última para a obra. O total do rodapé já está lá; os outros, "?" em âmbar.'),
      passos: [
        {
          pergunta: 'O piso: 9 caixas a R$ 60. Quanto?',
          fala: 'O piso: nove caixas a sessenta reais. Quanto?',
          opcoes: [
            {
              texto: 'R$ 540', certa: true,
              explica: 'Isso. $9 \\cdot 60 = 540$.',
              fala: 'Isso. Nove vezes sessenta, quinhentos e quarenta.',
              mostra: tab(ORC('R$ 540', '?', '?'), 'O total do piso aparece: R$ 540.'),
            },
            {
              texto: 'R$ 69', erro: 'soma-no-lugar-de-multiplicar',
              explica: 'São 9 caixas de R$ 60 cada: 9 vezes 60, e não 9 mais 60.',
              fala: 'São nove caixas de sessenta reais cada: nove vezes sessenta, e não nove mais sessenta.',
            },
          ],
          linha: { tex: '9 \\cdot 60 = 540', fala: 'nove vezes sessenta, quinhentos e quarenta' },
        },
        {
          pergunta: 'A tinta: 4 latas a R$ 105. Quanto?',
          fala: 'A tinta: quatro latas a cento e cinco reais. Quanto?',
          opcoes: [
            {
              texto: 'R$ 420', certa: true,
              explica: 'Isso. $4 \\cdot 105 = 420$.',
              fala: 'Isso. Quatro vezes cento e cinco, quatrocentos e vinte.',
              mostra: tab(ORC('R$ 540', 'R$ 420', '?'), 'O total da tinta aparece: R$ 420.'),
            },
            {
              texto: 'R$ 378', erro: 'ignora-contexto-do-resto',
              explica: 'Esse é o preço de 3,6 latas, e a loja não vende pedaço de lata. São 4: R$ 420.',
              fala: 'Esse é o preço de três vírgula seis latas, e a loja não vende pedaço de lata. São quatro: quatrocentos e vinte.',
            },
          ],
          linha: { tex: '4 \\cdot 105 = 420', fala: 'quatro vezes cento e cinco, quatrocentos e vinte' },
        },
        {
          pergunta: 'E a obra toda?',
          opcoes: [
            {
              texto: 'R$ 1.200', certa: true,
              explica: 'Isso. $540 + 240 + 420 = 1.200$. A obra está fechada.',
              fala: 'Isso. Quinhentos e quarenta mais duzentos e quarenta mais quatrocentos e vinte, mil e duzentos. A obra está fechada.',
              mostra: tab({ ...ORC_TUDO, destaque: [3] }, 'O total da obra aparece na última coluna, com moldura âmbar: R$ 1.200.'),
            },
            {
              texto: 'R$ 180', erro: 'esquece-a-quantidade',
              explica: '$60 + 15 + 105$ é o preço de 1 caixa, 1 metro e 1 lata. Some os totais da última linha.',
              fala: 'Sessenta mais quinze mais cento e cinco é o preço de uma caixa, um metro e uma lata. Some os totais da última linha.',
            },
          ],
          linha: { tex: '540 + 240 + 420 = 1.200', fala: 'quinhentos e quarenta mais duzentos e quarenta mais quatrocentos e vinte, mil e duzentos' },
        },
      ],
      esboco: 'O momento-chave: as contas da aula inteira viram as casas de uma tabela, e o aluno vê a obra fechar em R$ 1.200.',
    },
    {
      tipo: 'aposta',
      pergunta: 'À vista, a loja dá **10 %** de desconto. Quanto você paga?',
      fala: 'À vista, a loja dá dez por cento de desconto. Quanto você paga?',
      visual: grade({ pintadas: 100, leitura: { vezes: 12, antes: 'R$ ' } }, 'A grade inteira pintada: os 100 quadradinhos são R$ 1.200, cada um vale R$ 12.'),
      opcoes: [
        {
          texto: 'R$ 1.080', certa: true,
          explica: 'Isso. 10 % de 1.200 são 120. Você paga 90 %: R$ 1.080.',
          fala: 'Isso. Dez por cento de mil e duzentos são cento e vinte. Você paga noventa por cento: mil e oitenta reais.',
          mostra: grade({ pintadas: 90, leitura: { vezes: 12, antes: 'R$ ' } }, 'Uma coluna se apaga: ficam 90 quadradinhos, R$ 1.080.'),
        },
        {
          texto: 'R$ 120', erro: 'desconto-como-preco-final',
          explica: 'R$ 120 é o desconto, o que sai do preço. Você paga o resto: $1.200 - 120 = 1.080$.',
          fala: 'Cento e vinte é o desconto, o que sai do preço. Você paga o resto: mil e duzentos menos cento e vinte, mil e oitenta.',
          mostra: grade({ pintadas: 90, leitura: { vezes: 12, antes: 'R$ ' } }, 'Uma coluna se apaga: ficam R$ 1.080.'),
        },
        {
          texto: 'R$ 1.190', erro: 'porcentagem-como-numero-inteiro',
          explica: '10 % não são R$ 10. São 10 de cada 100: uma coluna inteira da grade, R$ 120.',
          fala: 'Dez por cento não são dez reais. São dez de cada cem: uma coluna inteira da grade, cento e vinte reais.',
          mostra: grade({ pintadas: 90, leitura: { vezes: 12, antes: 'R$ ' } }, 'Uma coluna se apaga: ficam R$ 1.080.'),
        },
      ],
      esboco: 'A grade da unidade 11 lida em reais. O desconto é uma coluna.',
    },
    {
      tipo: 'caderno',
      instrucao: 'No papel: o pedreiro cobra R$ 50 fixos mais um valor por m². Pelos 15 m² de piso, cobrou R$ 500. Quanto por m²?',
      fala: 'No papel: o pedreiro cobra cinquenta reais fixos mais um valor por metro quadrado. Pelos quinze metros quadrados de piso, cobrou quinhentos reais. Quanto por metro quadrado?',
      resposta: 30,
      resolucao: [
        { tex: '50 + 15x = 500', fala: 'cinquenta mais quinze x igual a quinhentos' },
        { tex: '15x = 450', fala: 'quinze x igual a quatrocentos e cinquenta' },
        { tex: 'x = 30', fala: 'x igual a trinta: trinta reais por metro quadrado' },
      ],
      esboco: 'A equação da unidade 15, montada a partir da conta do pedreiro.',
    },
    {
      tipo: 'sua-vez',
      geradores: ['obra-n1', 'obra-n2', 'obra-n3'],
      esboco: 'Nível 1: o rodapé, o piso ou as caixas sem sobra, com a planta na tela. Nível 2: as caixas com 10 % de sobra, ou as latas descontando a porta e a janela. Nível 3: o orçamento com desconto à vista, ou a equação do pedreiro.',
    },
    {
      tipo: 'fecho',
      texto: 'Quarto pronto: 9 caixas, 16 m de rodapé e 4 latas. **R$ 1.080** à vista. Na próxima aula: a avaliação final.',
      fala: 'Quarto pronto: nove caixas, dezesseis metros de rodapé e quatro latas. Mil e oitenta reais à vista. Na próxima aula: a avaliação final.',
      visual: tab(ORC_TUDO, 'A tabela do orçamento inteira: piso R$ 540, rodapé R$ 240, tinta R$ 420, obra R$ 1.200.'),
      esboco: 'Responde ao gancho com o orçamento fechado.',
    },
  ],
}
