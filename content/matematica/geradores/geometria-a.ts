import type { Gerador, Item, Visual } from '@/lib/formation/schema'

// Unidade 16: geometria plana (aulas 1 a 4). Ponto, reta e ângulo; medir
// ângulos; triângulos e os 180°; polígonos. Os graus vão com o símbolo
// colado ao número (35°), fora do TeX. O teclado só digita números: os
// itens pedem graus ou contagens e usam "escolha" para o tipo do ângulo, o
// tipo da linha e o nome do polígono. Nos visuais do nível 1, a figura: o
// ângulo (com o transferidor, na aula 2), o triângulo com dois ângulos
// escritos e o polígono com as diagonais de um vértice.

// ---------------------------------------------------------------- ajudas

/** O espaço que não quebra, entre o número e a unidade. */
const NB = ' '
/** Uma fórmula inteira em TeX, entre chaves para não quebrar a linha. */
const tex = (f: string) => `\${${f}}$`

/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa, sem repetir e só com números positivos. */
function mapa(certa: number, pares: [number | null, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([String(certa)])
  for (const [valor, erro] of pares) {
    if (valor === null || !Number.isInteger(valor) || valor <= 0) continue
    const k = String(valor)
    if (vistos.has(k)) continue
    vistos.add(k)
    erros[k] = erro
  }
  return erros
}
/** A divisão, só quando é exata (senão, null: não vira erro previsível). */
const exata = (a: number, b: number) => (b !== 0 && a % b === 0 ? a / b : null)

/** Opções numa ordem fixa, com a certa e o mesmo erro para todas as outras. */
function fixas(opcoes: string[], certa: number, erro: string): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const erros: Record<string, string> = {}
  opcoes.forEach((_, i) => i !== certa && (erros[String(i)] = erro))
  return { opcoes, resposta: certa, erros }
}

const fig = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'figura', estado, esboco })
const r3 = (v: number) => Math.round(v * 1000) / 1000
const rad = (g: number) => (g * Math.PI) / 180

// ---------------------------------------------------------------- o tipo do ângulo

export const TIPOS = ['agudo', 'reto', 'obtuso', 'raso'] as const
type Tipo = (typeof TIPOS)[number]
const tipoDe = (g: number): Tipo => (g < 90 ? 'agudo' : g === 90 ? 'reto' : g < 180 ? 'obtuso' : 'raso')
const PERGUNTA_TIPO = 'Ele é agudo, reto, obtuso ou raso?'
/** As dicas do tipo do ângulo: a régua do canto reto, a regra e a resposta. */
const dicasTipo = (g: number, como: string): [string, string, string] => [
  'Compare com o canto de uma folha, o ângulo reto.',
  'Cabe dentro do canto: agudo. Passa do canto: obtuso. As duas semirretas em linha: raso.',
  `${como}: é ${tipoDe(g)}.`,
]
const opcoesTipo = (g: number) => fixas([...TIPOS], TIPOS.indexOf(tipoDe(g)), 'troca-tipo-de-angulo')
/** O ângulo entre os ponteiros numa hora cheia (de 1 a 23), em graus. */
const ponteiros = (h: number) => {
  const k = h % 12
  return 30 * Math.min(k, 12 - k)
}

// ---------------------------------------------------------------- aula 1: ponto, reta, ângulo

export const tipoDeAnguloN1: Gerador = {
  id: 'tipo-de-angulo-n1',
  aula: 'B.U16.A1',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 2) < 2) {
      // Um ângulo desenhado: agudo, reto, obtuso ou raso.
      const tipo = r.pick(['agudo', 'agudo', 'reto', 'obtuso', 'obtuso', 'raso'] as const)
      const g = tipo === 'agudo' ? r.int(3, 16) * 5 : tipo === 'obtuso' ? r.int(20, 34) * 5 : tipo === 'reto' ? 90 : 180
      const inicio = r.pick([0, 0, 10, 20, -15])
      const comprimento = r.pick([1.5, 2.5, 3.5])
      return {
        enunciado: 'Este ângulo é agudo, reto, obtuso ou raso?',
        formato: 'escolha',
        ...opcoesTipo(g),
        dicas: dicasTipo(g, g < 90 ? 'Ele cabe dentro do canto de uma folha' : g === 90 ? 'Ele é igual ao canto de uma folha' : g < 180 ? 'Ele passa do canto de uma folha' : 'As duas semirretas estão em linha'),
        visual: fig({ angulo: { graus: g, inicio, comprimento } }, `Um ângulo de ${g}°, sem o número, com o arco âmbar.`),
      }
    }
    // Dois ângulos: o que abre menos tem os lados mais compridos.
    const menor = r.int(3, 10) * 5
    const maior = menor + r.int(4, 12) * 5
    const esquerdaMenor = r.int(0, 1) === 1
    const [g1, g2] = esquerdaMenor ? [menor, maior] : [maior, menor]
    const [c1, c2] = esquerdaMenor ? [3.6, 1.4] : [1.4, 3.6]
    const x = c1 + 1.5 + c2 * Math.max(0, -Math.cos(rad(g2)))
    const certa = esquerdaMenor ? 1 : 0
    return {
      enunciado: 'Qual dos dois ângulos abre mais?',
      formato: 'escolha',
      ...fixas(['O ângulo 1', 'O ângulo 2'], certa, 'angulo-pelo-tamanho-dos-lados'),
      dicas: [
        'O ângulo é a abertura, não o tamanho dos lados.',
        'Imagine os dois com lados do mesmo tamanho. Qual arco é mais aberto?',
        `O ângulo ${certa + 1} abre mais, mesmo com os lados mais curtos.`,
      ],
      visual: fig(
        { angulo: [{ graus: g1, em: [0, 0], comprimento: c1, nome: 'ângulo 1' }, { graus: g2, em: [r3(x), 0], comprimento: c2, nome: 'ângulo 2' }] },
        `Dois ângulos lado a lado: o de ${menor}°, de lados compridos, e o de ${maior}°, de lados curtos.`,
      ),
    }
  },
}

/** Ângulos descritos pela comparação com o canto de uma folha. */
export const DESCRICOES: [string, Tipo][] = [
  ['abre menos que o canto de uma folha', 'agudo'],
  ['cabe dentro do canto de uma folha', 'agudo'],
  ['abre igual ao canto de uma folha', 'reto'],
  ['é um quarto de volta', 'reto'],
  ['abre mais que o canto de uma folha e menos que meia volta', 'obtuso'],
  ['passa do canto de uma folha, mas os lados não ficam em linha', 'obtuso'],
  ['tem as duas semirretas em linha, uma para cada lado', 'raso'],
  ['é meia volta', 'raso'],
]

export const tipoDeAnguloN2: Gerador = {
  id: 'tipo-de-angulo-n2',
  aula: 'B.U16.A1',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Os ponteiros do relógio numa hora cheia.
      const h = r.int(1, 11)
      const g = ponteiros(h)
      const hora = h === 1 ? 'À 1 hora' : `Às ${h} horas`
      return {
        enunciado: `${hora}, os ponteiros do relógio formam um ângulo. ${PERGUNTA_TIPO}`,
        formato: 'escolha',
        ...opcoesTipo(g),
        dicas: [
          'Do 12 ao 3, os ponteiros fazem um canto reto. Do 12 ao 6, ficam em linha.',
          `Um ponteiro no 12, o outro no ${h}. Ele fica antes do 3 (ou do 9), em cima, ou passa?`,
          `${hora}, o ângulo é ${tipoDe(g)}.`,
        ],
      }
    }
    const [d, tipo] = r.pick(DESCRICOES)
    const g = tipo === 'agudo' ? 45 : tipo === 'reto' ? 90 : tipo === 'obtuso' ? 135 : 180
    return {
      enunciado: `Um ângulo ${d}. ${PERGUNTA_TIPO}`,
      formato: 'escolha',
      ...opcoesTipo(g),
      dicas: dicasTipo(g, 'Compare com o canto de uma folha'),
    }
  },
}

const LETRAS = ['A', 'B', 'C', 'D', 'M', 'N', 'P', 'Q', 'R', 'S']
const LINHAS = ['um segmento', 'uma reta', 'uma semirreta'] as const

export const tipoDeAnguloN3: Gerador = {
  id: 'tipo-de-angulo-n3',
  aula: 'B.U16.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Segmento, reta ou semirreta, pela descrição.
      const i = r.int(0, LETRAS.length - 2)
      const [P, Q] = [LETRAS[i], LETRAS[i + 1]]
      const qual = r.int(0, 2)
      const desc = [
        `A linha vai de ${P} até ${Q} e para nos dois pontos.`,
        `A linha passa por ${P} e por ${Q} e segue sem fim para os dois lados.`,
        `A linha começa em ${P}, passa por ${Q} e segue sem fim.`,
      ][qual]
      return {
        enunciado: `${desc} Ela é um segmento, uma reta ou uma semirreta?`,
        formato: 'escolha',
        ...fixas([...LINHAS], qual, 'confunde-reta-e-segmento'),
        dicas: [
          'Olhe as pontas: o segmento tem duas, a semirreta tem uma, a reta nenhuma.',
          'Ela para nos dois pontos? Começa num ponto e segue? Ou segue sem fim para os dois lados?',
          `É ${LINHAS[qual]}.`,
        ],
      }
    }
    if (tipo === 1) {
      // Dois ângulos com os lados medidos: o tamanho dos lados não decide.
      const par = r.pick([['agudo', 'obtuso'], ['agudo', 'reto'], ['reto', 'obtuso'], ['obtuso', 'raso'], ['agudo', 'raso']] as const)
      const longo = r.int(6, 12)
      const curto = r.int(1, 4)
      const aLongo = r.int(0, 1) === 1
      // O ângulo de lados compridos é o que abre menos.
      const [tA, tB] = aLongo ? par : [par[1], par[0]]
      const [lA, lB] = aLongo ? [longo, curto] : [curto, longo]
      return {
        enunciado: `O ângulo A tem lados de ${lA}${NB}cm e é ${tA}. O ângulo B tem lados de ${lB}${NB}cm e é ${tB}. Qual abre mais?`,
        formato: 'escolha',
        ...fixas(['O ângulo A', 'O ângulo B'], aLongo ? 1 : 0, 'angulo-pelo-tamanho-dos-lados'),
        dicas: [
          'O tamanho dos lados não muda o ângulo. Olhe só o tipo de cada um.',
          'Agudo é menor que o reto, que é menor que o obtuso, que é menor que o raso.',
          `O ${par[1]} abre mais que o ${par[0]}: o ângulo ${aLongo ? 'B' : 'A'}.`,
        ],
      }
    }
    // Os ponteiros numa hora da tarde ou da noite.
    const h = r.int(13, 23)
    const g = ponteiros(h)
    return {
      enunciado: `Às ${h}${NB}h, os ponteiros do relógio formam um ângulo. ${PERGUNTA_TIPO}`,
      formato: 'escolha',
      ...opcoesTipo(g),
      dicas: [
        `${h}${NB}h no relógio de ponteiros é ${h - 12} da tarde (ou da noite).`,
        `Um ponteiro no 12, o outro no ${h - 12}. Do 12 ao 3 é um canto reto; do 12 ao 6, uma linha.`,
        `Às ${h}${NB}h, o ângulo é ${tipoDe(g)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: medir ângulos

export const medirAnguloN1: Gerador = {
  id: 'medir-angulo-n1',
  aula: 'B.U16.A2',
  nivel: 1,
  gerar(r) {
    let g = r.int(1, 17) * 10
    if (g === 90) g = r.pick([80, 100])
    const virado = r.int(0, 2) === 0
    const estado = virado
      ? { angulo: { graus: -g, inicio: 180, comprimento: 3 }, transferidor: { invertido: true } }
      : { angulo: { graus: g, comprimento: 3 }, transferidor: true }
    const escala = virado ? 'de fora' : 'de dentro'
    return {
      enunciado: 'Quantos graus mede este ângulo?',
      formato: 'numero',
      resposta: g,
      erros: mapa(g, [[180 - g, 'le-escala-de-fora']]),
      dicas: [
        'Use a escala que tem o 0 em cima do lado deitado.',
        `Aqui é a escala ${escala}. Siga o outro lado do ângulo até ela.`,
        `O lado passa no ${g} da escala ${escala}: o ângulo mede ${g}°. Ele é ${tipoDe(g)}, e o número combina.`,
      ],
      visual: fig(estado, `Um ângulo de ${g}° com o transferidor por cima, com o lado deitado para a ${virado ? 'esquerda' : 'direita'}.`),
    }
  },
}

export const medirAnguloN2: Gerador = {
  id: 'medir-angulo-n2',
  aula: 'B.U16.A2',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // As duas escalas, em palavras.
      let g = r.int(1, 17) * 10
      if (g === 90) g = r.pick([40, 130])
      const zeroDentro = r.int(0, 1) === 1
      const [dentro, fora] = zeroDentro ? [g, 180 - g] : [180 - g, g]
      return {
        enunciado: `Sobre o lado deitado, a escala de ${zeroDentro ? 'dentro' : 'fora'} marca 0. O outro lado passa no ${dentro} de dentro e no ${fora} de fora. Quanto mede o ângulo?`,
        formato: 'numero',
        resposta: g,
        erros: mapa(g, [[180 - g, 'le-escala-de-fora']]),
        dicas: [
          'Vale a escala que começa no 0 sobre o lado deitado.',
          `É a escala de ${zeroDentro ? 'dentro' : 'fora'}.`,
          `${g}°. Confira: o ângulo é ${tipoDe(g)}${g < 90 ? ', menor que 90°' : ', maior que 90°'}.`,
        ],
      }
    }
    // O tipo pelos graus.
    const g = r.pick([r.int(1, 17) * 5, r.int(19, 35) * 5, 90, 180, r.int(2, 8) * 10 + 5])
    return {
      enunciado: `Um ângulo mede ${g}°. ${PERGUNTA_TIPO}`,
      formato: 'escolha',
      ...opcoesTipo(g),
      dicas: ['O reto tem 90°; o raso, 180°.', 'Menos de 90°: agudo. Entre 90° e 180°: obtuso.', `${g}°: é ${tipoDe(g)}.`],
    }
  },
}

export const medirAnguloN3: Gerador = {
  id: 'medir-angulo-n3',
  aula: 'B.U16.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Um canto reto dividido em dois.
      let a = r.int(2, 16) * 5
      if (a === 45) a = 35
      return {
        enunciado: `Um canto reto foi dividido em dois ângulos. Um deles mede ${a}°. Quanto mede o outro?`,
        formato: 'numero',
        resposta: 90 - a,
        erros: mapa(90 - a, [[180 - a, 'confunde-reto-e-raso']]),
        dicas: ['O canto reto inteiro tem 90°.', `Os dois juntos dão 90°: falta tirar ${a}°.`, `${tex(`90 - ${a} = ${90 - a}`)}: o outro mede ${90 - a}°.`],
      }
    }
    if (tipo === 1) {
      // Uma semirreta que sai de uma reta: os dois ângulos fazem meia volta.
      let a = r.int(4, 32) * 5
      if (a === 90) a = 70
      return {
        enunciado: `Uma semirreta sai de um ponto de uma reta e faz ${a}° com ela. Quanto mede o ângulo do outro lado?`,
        formato: 'numero',
        resposta: 180 - a,
        erros: mapa(180 - a, [[90 - a, 'confunde-reto-e-raso']]),
        dicas: ['Os dois ângulos, juntos, fazem a reta: meia volta, 180°.', `Falta tirar ${a}° de 180°.`, `${tex(`180 - ${a} = ${180 - a}`)}: o outro mede ${180 - a}°.`],
      }
    }
    // A pizza cortada do centro: a volta inteira repartida.
    const n = r.pick([3, 4, 5, 6, 8, 9, 10, 12])
    return {
      enunciado: `Uma pizza foi cortada do centro em ${n} fatias iguais. Quantos graus tem o canto de cada fatia, no centro?`,
      formato: 'numero',
      resposta: 360 / n,
      erros: mapa(360 / n, [[exata(180, n), 'confunde-volta-e-meia-volta']]),
      dicas: ['Os cantos de todas as fatias, juntos, fazem a volta inteira: 360°.', `Reparta 360° em ${n} partes iguais.`, `${tex(`360 \\div ${n} = ${360 / n}`)}: cada canto tem ${360 / n}°.`],
    }
  },
}

// ---------------------------------------------------------------- aula 3: triângulos e os 180°

/** O triângulo de base AB (6 unidades, deitada) com os ângulos a em A e b em B. */
function triangulo(a: number, b: number) {
  const t = (6 * Math.sin(rad(b))) / Math.sin(rad(a + b))
  return { A: [0, 0], B: [6, 0], C: [r3(t * Math.cos(rad(a))), r3(t * Math.sin(rad(a)))] }
}

export const terceiroAnguloN1: Gerador = {
  id: 'terceiro-angulo-n1',
  aula: 'B.U16.A3',
  nivel: 1,
  gerar(r) {
    const a = r.int(5, 20) * 5
    let c = r.int(8, 24) * 5
    if (a + c > 155) c = 155 - a
    const b = 180 - a - c
    return {
      enunciado: `Dois ângulos do triângulo medem ${a}° e ${b}°. Quanto mede o terceiro?`,
      formato: 'numero',
      resposta: c,
      erros: mapa(c, [
        [360 - a - b, 'triangulo-soma-360'],
        [a + b, 'operacao-trocada'],
      ]),
      dicas: ['Os três ângulos do triângulo somam 180°.', `Some os dois que você sabe: ${tex(`${a} + ${b} = ${a + b}`)}.`, `${tex(`180 - ${a + b} = ${c}`)}: o terceiro mede ${c}°.`],
      visual: fig({ pontos: triangulo(a, b), poligono: { vertices: ['A', 'B', 'C'], angulos: [a, b, '?'] } }, `Um triângulo com ${a}° em A, ${b}° em B e um ponto de interrogação em C.`),
    }
  },
}

export const terceiroAnguloN2: Gerador = {
  id: 'terceiro-angulo-n2',
  aula: 'B.U16.A3',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // O triângulo retângulo: o reto conta.
      let a = r.int(2, 16) * 5 + r.pick([0, 0, 2])
      if (a === 45) a = 40
      return {
        enunciado: `Um triângulo retângulo tem um ângulo de ${a}°. Quanto mede o outro ângulo agudo?`,
        formato: 'numero',
        resposta: 90 - a,
        erros: mapa(90 - a, [
          [180 - a, 'esquece-um-angulo-na-soma'],
          [270 - a, 'triangulo-soma-360'],
        ]),
        dicas: ['Retângulo quer dizer que um dos ângulos é reto: 90°.', `Os três somam 180°: ${tex(`90 + ${a} = ${90 + a}`)}.`, `${tex(`180 - ${90 + a} = ${90 - a}`)}: o outro mede ${90 - a}°.`],
      }
    }
    if (tipo === 1) {
      // Dois ângulos iguais e o terceiro conhecido.
      const t = r.int(2, 16) * 10
      const cada = (180 - t) / 2
      return {
        enunciado: `Num triângulo, dois ângulos são iguais e o terceiro mede ${t}°. Quanto mede cada um dos iguais?`,
        formato: 'numero',
        resposta: cada,
        erros: mapa(cada, [
          [180 - t, 'esquece-de-dividir'],
          [exata(360 - t, 2), 'triangulo-soma-360'],
        ]),
        dicas: ['Os três somam 180°.', `Os dois iguais, juntos, têm ${tex(`180 - ${t} = ${180 - t}`)}.`, `${tex(`${180 - t} \\div 2 = ${cada}`)}: cada um mede ${cada}°.`],
      }
    }
    // Dois ângulos iguais conhecidos e o terceiro.
    const e = r.int(4, 17) * 5
    return {
      enunciado: `Num triângulo, dois ângulos medem ${e}° cada um. Quanto mede o terceiro?`,
      formato: 'numero',
      resposta: 180 - 2 * e,
      erros: mapa(180 - 2 * e, [
        [180 - e, 'esquece-um-angulo-na-soma'],
        [360 - 2 * e, 'triangulo-soma-360'],
      ]),
      dicas: ['Os três somam 180°.', `Os dois iguais, juntos: ${tex(`${e} + ${e} = ${2 * e}`)}.`, `${tex(`180 - ${2 * e} = ${180 - 2 * e}`)}: o terceiro mede ${180 - 2 * e}°.`],
    }
  },
}

/** Os ângulos de um triângulo como x, 2x e 3x: os multiplicadores. */
export const MULTIPLOS: [number, number, number][] = [
  [1, 2, 3],
  [1, 1, 2],
  [2, 3, 4],
  [1, 2, 6],
  [1, 3, 5],
  [1, 4, 7],
  [2, 3, 7],
  [1, 1, 4],
  [3, 4, 5],
]
const termo = (k: number) => (k === 1 ? 'x' : `${k}x`)

export const terceiroAnguloN3: Gerador = {
  id: 'terceiro-angulo-n3',
  aula: 'B.U16.A3',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // A escada encostada na parede.
      const a = r.int(11, 16) * 5 + r.pick([0, 0, 3])
      return {
        enunciado: `A escada encostada na parede faz ${a}° com o chão. A parede faz um canto reto com o chão. Que ângulo a escada faz com a parede?`,
        formato: 'numero',
        resposta: 90 - a,
        erros: mapa(90 - a, [
          [180 - a, 'esquece-um-angulo-na-soma'],
          [270 - a, 'triangulo-soma-360'],
        ]),
        dicas: ['A escada, a parede e o chão formam um triângulo com um canto reto.', `Os três somam 180°: ${tex(`90 + ${a} = ${90 + a}`)}.`, `${tex(`180 - ${90 + a} = ${90 - a}`)}: a escada faz ${90 - a}° com a parede.`],
      }
    }
    if (tipo === 1) {
      // A tesoura do telhado: a ponta e os dois cantos iguais.
      const t = r.int(9, 15) * 10
      const cada = (180 - t) / 2
      return {
        enunciado: `A tesoura do telhado tem a ponta de cima com ${t}° e os dois cantos de baixo iguais. Quanto mede cada canto de baixo?`,
        formato: 'numero',
        resposta: cada,
        erros: mapa(cada, [
          [180 - t, 'esquece-de-dividir'],
          [exata(360 - t, 2), 'triangulo-soma-360'],
        ]),
        dicas: ['Os três cantos do triângulo somam 180°.', `Os dois de baixo, juntos: ${tex(`180 - ${t} = ${180 - t}`)}.`, `${tex(`${180 - t} \\div 2 = ${cada}`)}: cada um mede ${cada}°.`],
      }
    }
    // x, 2x e 3x: uma equação da unidade 15.
    const ks = r.pick(MULTIPLOS)
    const s = ks[0] + ks[1] + ks[2]
    const x = 180 / s
    const [t1, t2, t3] = ks.map(termo)
    return {
      enunciado: `Os ângulos de um triângulo medem ${tex(t1)}, ${tex(t2)} e ${tex(t3)}, em graus. Quanto vale $x$?`,
      formato: 'numero',
      resposta: x,
      erros: mapa(x, [
        [exata(360, s), 'triangulo-soma-360'],
        [180, 'esquece-de-dividir'],
      ]),
      dicas: ['Os três somam 180°: escreva a equação.', `${tex(`${t1} + ${t2} + ${t3} = 180`)}, ou seja, ${tex(`${s}x = 180`)}.`, `${tex(`x = 180 \\div ${s} = ${x}`)}. Confira: ${tex(`${ks.map((k) => k * x).join(' + ')} = 180`)}.`],
    }
  },
}

// ---------------------------------------------------------------- aula 4: polígonos

export const NOMES = ['triângulo', 'quadrilátero', 'pentágono', 'hexágono'] as const
/** Os cantos de um polígono regular de n lados, girado de `giro` graus. */
function regular(n: number, raio: number, giro: number): number[][] {
  return Array.from({ length: n }, (_, i) => {
    const g = rad(giro + (360 * i) / n)
    return [r3(raio * Math.cos(g)), r3(raio * Math.sin(g))]
  })
}

export const poligonoN1: Gerador = {
  id: 'poligono-n1',
  aula: 'B.U16.A4',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O nome do polígono desenhado (às vezes torto).
      const n = r.int(3, 6)
      const torto = r.int(0, 1) === 1
      const vertices = regular(n, 2.5, r.pick([90, 0, 15, -20])).map(([x, y], i) => (torto ? [r3(x * (1 + 0.12 * (i % 3))), r3(y * (1 - 0.1 * (i % 2)))] : [x, y]))
      return {
        enunciado: 'Como se chama este polígono?',
        formato: 'escolha',
        ...fixas([...NOMES], n - 3, 'troca-nome-do-poligono'),
        dicas: ['O nome vem do número de lados.', 'Conte os lados, um por um, a partir de um canto.', `São ${n} lados: é um ${NOMES[n - 3]}.`],
        visual: fig({ poligono: { vertices, preenchido: true } }, `Um polígono de ${n} lados, pintado de âmbar claro.`),
      }
    }
    // As diagonais de um vértice e os triângulos.
    const n = r.int(4, 8)
    const vertices = regular(n, 2.5, 180)
    const cores = ['azul', true, 'verde'] as const
    const triangulos = Array.from({ length: n - 2 }, (_, i) => ({ vertices: [vertices[0], vertices[i + 1], vertices[i + 2]], preenchido: cores[i % 3] }))
    return {
      enunciado: `As diagonais saem de um vértice deste polígono de ${n} lados. Quantos triângulos elas formam?`,
      formato: 'numero',
      resposta: n - 2,
      erros: mapa(n - 2, [[n, 'triangulos-demais']]),
      dicas: ['Conte os triângulos coloridos, um a um.', `Os 2 lados que saem do vértice não viram diagonal: ${n === 4 ? 'sai 1 diagonal' : `saem ${n - 3} diagonais`}.`, `${tex(`${n} - 2 = ${n - 2}`)}: são ${n - 2} triângulos.`],
      visual: fig({ poligono: { vertices }, poligonos: triangulos }, `Um polígono regular de ${n} lados, com as diagonais que saem do canto da esquerda e os ${n - 2} triângulos coloridos.`),
    }
  },
}

export const poligonoN2: Gerador = {
  id: 'poligono-n2',
  aula: 'B.U16.A4',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // A soma dos ângulos de um polígono de n lados.
      const n = r.int(4, 12)
      const soma = (n - 2) * 180
      return {
        enunciado: `Quanto somam os ângulos de um polígono de ${n} lados?`,
        formato: 'numero',
        resposta: soma,
        erros: mapa(soma, [
          [n * 180, 'triangulos-demais'],
          [180, 'poligono-soma-180'],
        ]),
        dicas: ['Divida o polígono em triângulos, com as diagonais de um vértice.', `São ${tex(`${n} - 2 = ${n - 2}`)} triângulos, de 180° cada.`, `${tex(`${n - 2} \\cdot 180 = ${soma}`)}: os ângulos somam ${soma}°.`],
      }
    }
    // Cada canto de um polígono regular.
    const n = r.pick([3, 4, 5, 6, 8, 9, 10, 12])
    const soma = (n - 2) * 180
    const cada = soma / n
    return {
      enunciado: `Um polígono regular tem ${n} lados. Quanto mede cada um dos seus ângulos?`,
      formato: 'numero',
      resposta: cada,
      erros: mapa(cada, [
        [soma, 'esquece-de-dividir'],
        [exata(n * 180, n), 'triangulos-demais'],
      ]),
      dicas: ['No regular, os ângulos são todos iguais: ache a soma e reparta.', `A soma é ${tex(`(${n} - 2) \\cdot 180 = ${soma}`)}.`, `${tex(`${soma} \\div ${n} = ${cada}`)}: cada ângulo mede ${cada}°.`],
    }
  },
}

/** Objetos com a forma de um polígono regular. */
export const OBJETOS: [string, number][] = [
  ['A lajota do piso é um hexágono regular', 6],
  ['A placa de PARE é um octógono regular, de 8 lados', 8],
  ['O tampo da mesa é um pentágono regular', 5],
  ['A moldura do espelho é um polígono regular de 10 lados', 10],
  ['A peça do jogo é um triângulo de lados iguais e ângulos iguais', 3],
  ['O ladrilho é um quadrado', 4],
]

export const poligonoN3: Gerador = {
  id: 'poligono-n3',
  aula: 'B.U16.A4',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo < 2) {
      // O ângulo que falta num quadrilátero (n = 4) ou num pentágono (n = 5).
      const n = tipo === 0 ? 4 : 5
      const soma = (n - 2) * 180
      const falta = r.int(8, 34) * 5
      // Os outros n − 1 ângulos: quase iguais, de 5 em 5, e depois embaralhados aos pares.
      const alvo = soma - falta
      const base = Math.floor(alvo / 5 / (n - 1)) * 5
      const conhecidos = Array.from({ length: n - 1 }, (_, i) => base + (i < (alvo - base * (n - 1)) / 5 ? 5 : 0))
      for (let k = 0; k < 4; k++) {
        const i = r.int(0, n - 2)
        const j = r.int(0, n - 2)
        const d = r.int(1, 5) * 5
        if (i !== j && conhecidos[i] + d <= 170 && conhecidos[j] - d >= 45) {
          conhecidos[i] += d
          conhecidos[j] -= d
        }
      }
      const total = conhecidos.reduce((s, v) => s + v, 0)
      const quarto = soma - total
      const nome = n === 4 ? 'quadrilátero' : 'pentágono'
      const lista = `${conhecidos.slice(0, -1).map((v) => `${v}°`).join(', ')} e ${conhecidos[conhecidos.length - 1]}°`
      return {
        enunciado: `${n === 4 ? 'Três' : 'Quatro'} ângulos de um ${nome} medem ${lista}. Quanto mede o ${n === 4 ? 'quarto' : 'quinto'}?`,
        formato: 'numero',
        resposta: quarto,
        erros: mapa(quarto, [
          [n * 180 - total, 'triangulos-demais'],
          [180 - total, 'poligono-soma-180'],
        ]),
        dicas: [`Primeiro a soma dos ângulos do ${nome}: são ${n - 2} triângulos.`, `${tex(`${n - 2} \\cdot 180 = ${soma}`)}, e os que você sabe somam ${total}°.`, `${tex(`${soma} - ${total} = ${quarto}`)}: o ${n === 4 ? 'quarto' : 'quinto'} mede ${quarto}°.`],
      }
    }
    // O canto de um objeto com a forma de um polígono regular.
    const [frase, n] = r.pick(OBJETOS)
    const soma = (n - 2) * 180
    const cada = soma / n
    return {
      enunciado: `${frase}. Quanto mede cada um dos seus ângulos?`,
      formato: 'numero',
      resposta: cada,
      erros: mapa(cada, [
        [soma, 'esquece-de-dividir'],
        [180, 'triangulos-demais'],
      ]),
      dicas: [`São ${n} lados e ${n} ângulos iguais.`, `A soma é ${tex(`(${n} - 2) \\cdot 180 = ${soma}`)}.`, `${tex(`${soma} \\div ${n} = ${cada}`)}: cada ângulo mede ${cada}°.`],
    }
  },
}

export const GERADORES_U16A: Gerador[] = [
  tipoDeAnguloN1,
  tipoDeAnguloN2,
  tipoDeAnguloN3,
  medirAnguloN1,
  medirAnguloN2,
  medirAnguloN3,
  terceiroAnguloN1,
  terceiroAnguloN2,
  terceiroAnguloN3,
  poligonoN1,
  poligonoN2,
  poligonoN3,
]
