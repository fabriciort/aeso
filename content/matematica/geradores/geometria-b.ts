import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 16: geometria plana (parte B). Aula 5, perímetro; aula 6, área;
// aula 7, círculo e π; aula 8, teorema de Pitágoras.
//
// O teclado só digita números. As medidas vêm em negrito no enunciado, com
// a unidade e o espaço que não quebra (5 cm, 12 m). As contas com π usam
// 3,14 e dão decimais com vírgula (219,8); elas são feitas em centésimos,
// com inteiros, para não carregar erros de arredondamento. Pitágoras usa só
// ternas inteiras (3-4-5 e seus múltiplos, 5-12-13, 8-15-17, 7-24-25).
// Nenhuma resposta é negativa: os itens não levam a tecla do menos.

// ---------------------------------------------------------------- ferramentas

/** O espaço que não quebra: 5 cm e 12 m² ficam na mesma linha. */
const NB = ' '
/** Uma medida: 5 cm. */
const med = (n: number | string, u: string) => `${n}${NB}${u}`
/** Uma medida em negrito: **5 cm**. */
const neg = (n: number | string, u: string) => `**${med(n, u)}**`

/** Centésimos como o aluno escreve: 21980 → '219,8'; 31400 → '314'. */
function cent(c: number): string {
  const i = Math.floor(c / 100)
  const r = c % 100
  if (r === 0) return String(i)
  return `${i},${String(r).padStart(2, '0').replace(/0$/, '')}`
}
/** A resposta em centésimos: um número se for inteiro, o texto com vírgula se não. */
const resp = (c: number) => (c % 100 === 0 ? c / 100 : cent(c))

/** Erros previsíveis (como o aluno digitaria), sem a certa e sem repetir. Os valores vêm em centésimos. */
function mapaC(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (!Number.isInteger(valor) || valor <= 0 || valor === certa) continue
    const k = cent(valor)
    if (k in erros) continue
    erros[k] = erro
  }
  return erros
}
/** O mesmo, para inteiros. */
const mapa = (certa: number, pares: [number, string][]) => mapaC(certa * 100, pares.map(([v, e]) => [v * 100, e]))

/** Embaralha com o rng (Fisher–Yates). */
function embaralha<T>(r: Rng, xs: T[]): T[] {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
/** Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada, embaralhada. */
function escolha(r: Rng, opcoes: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const ordem = embaralha(r, opcoes.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = opcoes[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => opcoes[o][0]), resposta: ordem.indexOf(0), erros }
}

const retangulo = (b: number, h: number): number[][] => [[0, 0], [b, 0], [b, h], [0, h]]

// ---------------------------------------------------------------- aula 5: perímetro

export const perimetroN1: Gerador = {
  id: 'perimetro-n1',
  aula: 'B.U16.A5',
  nivel: 1,
  gerar(r) {
    // O retângulo com as duas medidas e o desenho com os quatro lados.
    const b = r.int(3, 9)
    let h = r.int(2, 7)
    if (h === b) h = b - 1
    // No 6 por 3, a área e a volta dão o mesmo número (18): o erro não apareceria.
    if (b * h === 2 * (b + h)) h++
    const p = 2 * (b + h)
    const visual: Visual = {
      modelo: 'figura',
      // Os lados sem a unidade: "3 cm" na vertical não cabe na borda do palco do celular.
      estado: { poligono: { vertices: retangulo(b, h), lados: [b, h, b, h], angulosRetos: [0, 1, 2, 3] } },
      esboco: `Um retângulo de ${b} por ${h}, com a medida de cada um dos quatro lados por fora.`,
    }
    return {
      enunciado: `Um retângulo tem ${neg(b, 'cm')} por ${neg(h, 'cm')}. Qual é o perímetro, em cm?`,
      formato: 'numero',
      resposta: p,
      erros: mapa(p, [
        [b + h, 'perimetro-esquece-lados'],
        [b * h, 'confunde-area-perimetro'],
      ]),
      dicas: [
        'O perímetro é a volta: a soma de **todos** os lados.',
        `Os lados de frente são iguais: ${b}, ${h}, ${b} e ${h}.`,
        `$${b} + ${h} + ${b} + ${h} = ${p}$. O perímetro é ${med(p, 'cm')}.`,
      ],
      visual,
    }
  },
}

const REGULARES: [string, number][] = [
  ['triângulo', 3],
  ['pentágono', 5],
  ['hexágono', 6],
  ['octógono', 8],
]

export const perimetroN2: Gerador = {
  id: 'perimetro-n2',
  aula: 'B.U16.A5',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(['quadrado', 'regular', 'retangulo'] as const)
    if (tipo === 'quadrado') {
      // De 5 em diante: no quadrado de 4, a área e a volta dão o mesmo número (16).
      const l = r.int(5, 25)
      return {
        enunciado: `Um quadrado tem ${neg(l, 'cm')} de lado. Qual é o perímetro, em cm?`,
        formato: 'numero',
        resposta: 4 * l,
        erros: mapa(4 * l, [
          [2 * l, 'perimetro-esquece-lados'],
          [l * l, 'confunde-area-perimetro'],
          [l, 'perimetro-esquece-lados'],
        ]),
        dicas: [
          'O perímetro é a soma de todos os lados. O quadrado tem 4 lados iguais.',
          `São 4 lados de ${med(l, 'cm')}: $4 \\cdot ${l}$.`,
          `$4 \\cdot ${l} = ${4 * l}$. O perímetro é ${med(4 * l, 'cm')}.`,
        ],
      }
    }
    if (tipo === 'regular') {
      const [nome, n] = r.pick(REGULARES)
      const l = r.int(3, 15)
      return {
        enunciado: `Um ${nome} tem os ${n} lados iguais, de ${neg(l, 'cm')} cada. Qual é o perímetro, em cm?`,
        formato: 'numero',
        resposta: n * l,
        erros: mapa(n * l, [
          [l, 'perimetro-esquece-lados'],
          [n + l, 'perimetro-esquece-lados'],
        ]),
        dicas: [
          'O perímetro é a soma de todos os lados.',
          `São ${n} lados de ${med(l, 'cm')}: $${n} \\cdot ${l}$.`,
          `$${n} \\cdot ${l} = ${n * l}$. O perímetro é ${med(n * l, 'cm')}.`,
        ],
      }
    }
    const b = r.int(10, 40)
    let h = r.int(5, 30)
    if (h === b) h = b - 3
    const p = 2 * (b + h)
    return {
      enunciado: `Um retângulo tem ${neg(b, 'cm')} por ${neg(h, 'cm')}. Qual é o perímetro, em cm?`,
      formato: 'numero',
      resposta: p,
      erros: mapa(p, [
        [b + h, 'perimetro-esquece-lados'],
        [b * h, 'confunde-area-perimetro'],
      ]),
      dicas: [
        'O perímetro é a volta: a soma dos quatro lados.',
        `Os lados de frente são iguais: $${b} + ${h} + ${b} + ${h}$.`,
        `$${b} + ${h} + ${b} + ${h} = ${p}$. O perímetro é ${med(p, 'cm')}.`,
      ],
    }
  },
}

export const perimetroN3: Gerador = {
  id: 'perimetro-n3',
  aula: 'B.U16.A5',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['cerca', 'rodape', 'praca'] as const)
    if (tipo === 'praca') {
      // Ao contrário: da volta ao lado.
      const l = r.int(5, 30)
      const p = 4 * l
      const raiz = Math.round(Math.sqrt(p))
      return {
        enunciado: `Uma praça quadrada tem ${neg(p, 'm')} de volta. Quanto mede cada lado, em m?`,
        formato: 'numero',
        resposta: l,
        erros: mapa(l, [
          [p / 2, 'perimetro-esquece-lados'],
          ...(raiz * raiz === p ? ([[raiz, 'confunde-area-perimetro']] as [number, string][]) : []),
        ]),
        dicas: [
          'A volta passa pelos 4 lados do quadrado, e eles são iguais.',
          `4 lados iguais somam ${med(p, 'm')}: cada um é $${p} \\div 4$.`,
          `$${p} \\div 4 = ${l}$. Confira: $4 \\cdot ${l} = ${p}$. Cada lado mede ${med(l, 'm')}.`,
        ],
      }
    }
    const b = r.int(6, 20)
    let h = r.int(4, 15)
    if (h === b) h = b - 2
    const volta = 2 * (b + h)
    const vao = tipo === 'cerca' ? r.int(1, 3) : 1
    const certa = volta - vao
    const enunciado =
      tipo === 'cerca'
        ? `Você vai cercar um terreno de ${neg(b, 'm')} por ${neg(h, 'm')} e deixar um portão de ${neg(vao, 'm')}. Quantos metros de cerca?`
        : `Uma sala tem ${neg(b, 'm')} por ${neg(h, 'm')}. A porta, de ${neg(vao, 'm')}, não leva rodapé. Quantos metros de rodapé?`
    return {
      enunciado,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [b + h - vao, 'perimetro-esquece-lados'],
        [b + h, 'perimetro-esquece-lados'],
        [b * h, 'confunde-area-perimetro'],
        [b * h - vao, 'confunde-area-perimetro'],
      ]),
      dicas: [
        `Primeiro a volta toda, pelos quatro lados. Depois tire o ${tipo === 'cerca' ? 'portão' : 'vão da porta'}.`,
        `A volta: $${b} + ${h} + ${b} + ${h} = ${volta}$.`,
        `$${volta} - ${vao} = ${certa}$. São ${med(certa, 'm')} de ${tipo === 'cerca' ? 'cerca' : 'rodapé'}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: área

/** Inclinações com o lado inteiro: [para o lado, altura, lado inclinado]. */
const INCLINADOS: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
]

export const areaN1: Gerador = {
  id: 'area-figuras-n1',
  aula: 'B.U16.A6',
  nivel: 1,
  gerar(r) {
    // O retângulo sobre a grade: contar os quadradinhos ou multiplicar.
    const b = r.int(2, 9)
    let h = r.int(2, 6)
    if (h === b) h = b === 2 ? 3 : b - 1
    // No 6 por 3, a área e a volta dão o mesmo número (18): o erro não apareceria.
    if (b * h === 2 * (b + h)) h++
    const a = b * h
    const visual: Visual = {
      modelo: 'figura',
      estado: { grade: true, poligono: { vertices: retangulo(b, h), preenchido: true, lados: [b, h, null, null] } },
      esboco: `Um retângulo de ${b} por ${h} sobre a grade de quadradinhos de 1 cm, com ${b} cm embaixo e ${h} cm do lado.`,
    }
    return {
      enunciado: `Um retângulo tem ${neg(b, 'cm')} por ${neg(h, 'cm')}. Qual é a área, em cm²?`,
      formato: 'numero',
      resposta: a,
      erros: mapa(a, [
        [2 * (b + h), 'confunde-area-perimetro'],
        [b + h, 'confunde-area-perimetro'],
      ]),
      dicas: [
        `A área é quantos quadradinhos de ${med(1, 'cm')} de lado cobrem a figura.`,
        `São ${h} fileiras de ${b} quadradinhos: $${b} \\cdot ${h}$.`,
        `$${b} \\cdot ${h} = ${a}$. A área é ${med(a, 'cm²')}.`,
      ],
      visual,
    }
  },
}

/** O paralelogramo: base · altura, com o lado inclinado para confundir. */
function paralelogramo(b: number, h: number, s: number, u: string, contexto?: string): Item {
  const a = b * h
  return {
    enunciado: contexto ?? `Um paralelogramo tem base ${neg(b, u)}, altura ${neg(h, u)} e lado inclinado ${neg(s, u)}. Qual é a área, em ${u}²?`,
    formato: 'numero',
    resposta: a,
    erros: mapa(a, [
      [b * s, 'area-com-o-lado-inclinado'],
      [2 * (b + s), 'confunde-area-perimetro'],
      [a / 2, 'area-do-triangulo-sem-metade'],
    ]),
    dicas: [
      'Recorte o triângulo da ponta e leve para o outro lado: vira um retângulo. A conta usa a altura, a medida em pé.',
      `O lado inclinado (${med(s, u)}) fica de fora. A conta é base · altura: $${b} \\cdot ${h}$.`,
      `$${b} \\cdot ${h} = ${a}$. A área é ${med(a, `${u}²`)}.`,
    ],
  }
}

/** O triângulo: metade de base · altura, com um lado inclinado para confundir. */
function triangulo(b: number, h: number, s: number | undefined, u: string, contexto?: string): Item {
  const a = (b * h) / 2
  const lado = s === undefined ? '' : ` e um lado de ${neg(s, u)}`
  return {
    enunciado: contexto ?? `Um triângulo tem base ${neg(b, u)}, altura ${neg(h, u)}${lado}. Qual é a área, em ${u}²?`,
    formato: 'numero',
    resposta: a,
    erros: mapa(a, [
      [b * h, 'area-do-triangulo-sem-metade'],
      ...(s === undefined ? [] : ([[(b * s) / 2, 'area-com-o-lado-inclinado'], [b * s, 'area-com-o-lado-inclinado']] as [number, string][])),
    ]),
    dicas: [
      'Dois triângulos iguais formam um paralelogramo. O triângulo é a metade de base · altura.',
      `Base · altura: $${b} \\cdot ${h} = ${b * h}$. Agora a metade.`,
      `$${b * h} \\div 2 = ${a}$. A área é ${med(a, `${u}²`)}.`,
    ],
  }
}

export const areaN2: Gerador = {
  id: 'area-figuras-n2',
  aula: 'B.U16.A6',
  nivel: 2,
  gerar(r) {
    const [o, h, s] = r.pick(INCLINADOS)
    if (r.int(0, 1) === 0) return paralelogramo(r.int(o + 2, o + 10), h, s, 'cm')
    // A base passa do pé da altura, e base · altura é par (a metade é inteira).
    let b = r.int(o + 2, o + 10)
    if ((b * h) % 2 === 1) b++
    return triangulo(b, h, s, 'cm')
  },
}

export const areaN3: Gerador = {
  id: 'area-figuras-n3',
  aula: 'B.U16.A6',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['parede', 'terreno', 'canteiro'] as const)
    if (tipo === 'parede') {
      const w = r.int(3, 8)
      const hh = r.int(2, 3)
      const jw = r.int(1, 2)
      const jh = r.int(1, hh - 1)
      const certa = w * hh - jw * jh
      return {
        enunciado: `Uma parede tem ${neg(w, 'm')} por ${neg(hh, 'm')}, com uma janela de ${neg(jw, 'm')} por ${neg(jh, 'm')}. Quantos m² de parede vão ser pintados?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [2 * (w + hh) - 2 * (jw + jh), 'confunde-area-perimetro'],
          [2 * (w + hh), 'confunde-area-perimetro'],
        ]),
        dicas: [
          'A área da parede inteira, menos a da janela, que não leva tinta.',
          `A parede: $${w} \\cdot ${hh} = ${w * hh}$. A janela: $${jw} \\cdot ${jh} = ${jw * jh}$.`,
          `$${w * hh} - ${jw * jh} = ${certa}$. São ${med(certa, 'm²')} de pintura.`,
        ],
      }
    }
    if (tipo === 'terreno') {
      let b = r.int(10, 40)
      const h = r.int(6, 30)
      if ((b * h) % 2 === 1) b++
      return triangulo(b, h, undefined, 'm', `Um terreno em forma de triângulo tem ${neg(b, 'm')} de base e ${neg(h, 'm')} de altura. Qual é a área, em m²?`)
    }
    const [o, h, s] = r.pick(INCLINADOS)
    const b = r.int(o + 2, o + 10)
    return paralelogramo(b, h, s, 'm', `Um canteiro torto, em forma de paralelogramo, tem base ${neg(b, 'm')}, altura ${neg(h, 'm')} e lado inclinado ${neg(s, 'm')}. Quantos m² de grama?`)
  },
}

// ---------------------------------------------------------------- aula 7: círculo e π

/** π ≈ 3,14, em centésimos. */
const PI = 314

export const circuloN1: Gerador = {
  id: 'circulo-n1',
  aula: 'B.U16.A7',
  nivel: 1,
  gerar(r) {
    // A volta pelo diâmetro, com o círculo desenhado.
    const d = r.int(2, 60)
    const c = PI * d
    const visual: Visual = {
      modelo: 'figura',
      estado: { circulo: { raio: 1, diametroVisivel: true, diametroTexto: med(d, 'cm') } },
      esboco: `Um círculo com o centro e o diâmetro em azul, de ponta a ponta, com ${d} cm.`,
    }
    return {
      enunciado: `Uma tampa redonda tem ${neg(d, 'cm')} de diâmetro. Com π ≈ 3,14, quanto mede a volta, em cm?`,
      formato: 'numero',
      resposta: resp(c),
      erros: mapaC(c, [
        [(PI * d) / 2, 'confunde-raio-diametro'],
        [2 * PI * d, 'confunde-raio-diametro'],
        [300 * d, 'pi-e-3-14'],
      ]),
      dicas: [
        'A volta tem π diâmetros: pouco mais de 3.',
        `A conta é $C = \\pi \\cdot ${d} \\approx 3{,}14 \\cdot ${d}$.`,
        `$3{,}14 \\cdot ${d} = ${cent(c).replace(',', '{,}')}$. A volta mede cerca de ${med(cent(c), 'cm')}.`,
      ],
      visual,
    }
  },
}

export const circuloN2: Gerador = {
  id: 'circulo-n2',
  aula: 'B.U16.A7',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 2) === 0) {
      // O que é π.
      return {
        enunciado: 'Qual frase sobre o número **π** é verdadeira?',
        formato: 'escolha',
        ...escolha(r, [
          ['Vale um pouco mais que 3 e não acaba.', undefined],
          ['É exatamente 3,14.', 'pi-e-3-14'],
          ['É maior num círculo maior.', 'pi-depende-do-tamanho'],
        ]),
        dicas: [
          'π é quantas vezes o diâmetro cabe na volta do círculo.',
          'Desenrolando a volta, cabem 3 diâmetros e sobra um pedacinho: 3,14159…, sem fim.',
          'π vale um pouco mais que 3, não acaba, e é o mesmo em todo círculo. O 3,14 é uma aproximação.',
        ],
      }
    }
    // A volta pelo raio: C = 2 · π · r.
    const raio = r.int(2, 40)
    const c = 2 * PI * raio
    return {
      enunciado: `Um prato tem ${neg(raio, 'cm')} de raio. Com π ≈ 3,14, quanto mede a volta, em cm?`,
      formato: 'numero',
      resposta: resp(c),
      erros: mapaC(c, [
        [PI * raio, 'confunde-raio-diametro'],
        [4 * PI * raio, 'confunde-raio-diametro'],
        [600 * raio, 'pi-e-3-14'],
      ]),
      dicas: [
        'A volta tem π diâmetros, e o diâmetro tem dois raios.',
        `O diâmetro é $2 \\cdot ${raio} = ${2 * raio}$. A conta: $C \\approx 3{,}14 \\cdot ${2 * raio}$.`,
        `$3{,}14 \\cdot ${2 * raio} = ${cent(c).replace(',', '{,}')}$. A volta mede cerca de ${med(cent(c), 'cm')}.`,
      ],
    }
  },
}

export const circuloN3: Gerador = {
  id: 'circulo-n3',
  aula: 'B.U16.A7',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Ao contrário: da volta ao diâmetro.
      const d = r.int(10, 90)
      const c = PI * d
      return {
        enunciado: `A volta de uma roda mede ${neg(cent(c), 'cm')}. Com π ≈ 3,14, quanto mede o diâmetro, em cm?`,
        formato: 'numero',
        resposta: d,
        erros: mapa(d, [
          [d / 2, 'confunde-raio-diametro'],
          [2 * d, 'confunde-raio-diametro'],
        ]),
        dicas: [
          'A volta tem π diâmetros. Para achar o diâmetro, divida a volta por π.',
          `$${cent(c).replace(',', '{,}')} \\div 3{,}14$: quantos 3,14 cabem na volta?`,
          `$${cent(c).replace(',', '{,}')} \\div 3{,}14 = ${d}$. Confira: $3{,}14 \\cdot ${d} = ${cent(c).replace(',', '{,}')}$. O diâmetro mede ${med(d, 'cm')}.`,
        ],
      }
    }
    // Várias voltas de uma roda.
    const d = r.pick([40, 50, 60, 70, 80])
    const n = r.int(2, 10)
    const c = n * PI * d
    return {
      enunciado: `Uma roda de ${neg(d, 'cm')} de diâmetro dá ${neg(n, 'voltas')}. Com π ≈ 3,14, quantos cm ela anda?`,
      formato: 'numero',
      resposta: resp(c),
      erros: mapaC(c, [
        [PI * d, 'responde-outra-pergunta'],
        [(n * PI * d) / 2, 'confunde-raio-diametro'],
        [n * 300 * d, 'pi-e-3-14'],
      ]),
      dicas: [
        'Em cada volta, a roda anda o contorno dela: π diâmetros.',
        `Uma volta: $3{,}14 \\cdot ${d} = ${cent(PI * d).replace(',', '{,}')}$ cm. Agora, ${med(n, 'voltas')}.`,
        `$${n} \\cdot ${cent(PI * d).replace(',', '{,}')} = ${cent(c).replace(',', '{,}')}$. A roda anda cerca de ${med(cent(c), 'cm')}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 8: teorema de Pitágoras

/** Ternas inteiras: [cateto menor, cateto maior, hipotenusa]. */
const TERNAS: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
]
const vezes = ([a, b, c]: [number, number, number], k: number): [number, number, number] => [a * k, b * k, c * k]

/** A hipotenusa a partir dos catetos. */
function hipotenusa(a: number, b: number, c: number, u: string, enunciado: string, visual?: Visual): Item {
  return {
    enunciado,
    formato: 'numero',
    resposta: c,
    erros: mapa(c, [
      [a + b, 'pitagoras-soma-os-lados'],
      [a * a + b * b, 'pitagoras-esquece-a-raiz'],
      [2 * a + 2 * b, 'potencia-multiplica-base-pelo-expoente'],
    ]),
    dicas: [
      'No triângulo retângulo, os quadrados dos catetos somados dão o quadrado da hipotenusa.',
      `$${a}^2 + ${b}^2 = ${a * a} + ${b * b} = ${c * c}$. A hipotenusa é o lado desse quadrado.`,
      `$\\sqrt{${c * c}} = ${c}$, porque $${c} \\cdot ${c} = ${c * c}$. A medida é ${med(c, u)}.`,
    ],
    ...(visual ? { visual } : {}),
  }
}

/** O cateto que falta, a partir da hipotenusa e do outro cateto. */
function cateto(a: number, b: number, c: number, u: string, enunciado: string): Item {
  return {
    enunciado,
    formato: 'numero',
    resposta: b,
    erros: mapa(b, [
      [c - a, 'pitagoras-soma-os-lados'],
      [c * c - a * a, 'pitagoras-esquece-a-raiz'],
    ]),
    dicas: [
      'O quadrado da hipotenusa é a soma dos quadrados dos catetos. Falta um deles.',
      `$${c}^2 - ${a}^2 = ${c * c} - ${a * a} = ${b * b}$: é o quadrado do cateto que falta.`,
      `$\\sqrt{${b * b}} = ${b}$, porque $${b} \\cdot ${b} = ${b * b}$. A medida é ${med(b, u)}.`,
    ],
  }
}

export const pitagorasN1: Gerador = {
  id: 'pitagoras-n1',
  aula: 'B.U16.A8',
  nivel: 1,
  gerar(r) {
    // O 3-4-5 e seus múltiplos, com os quadrados sobre os lados.
    const [a, b, c] = vezes(TERNAS[0], r.int(1, 4))
    const visual: Visual = {
      modelo: 'figura',
      estado: {
        // Sem as medidas dos lados: dentro do triângulo pequeno, elas ficam por cima umas das outras.
        poligono: { vertices: [[0, 0], [4, 0], [0, 3]], angulosRetos: [0] },
        quadradosNosLados: { areas: [b * b, '?', a * a] },
      },
      esboco: `Um triângulo retângulo com os catetos de ${a} e ${b} cm, a hipotenusa com "?" e um quadrado sobre cada lado: ${a * a}, ${b * b} e "?".`,
    }
    const [p, q] = r.int(0, 1) === 0 ? [a, b] : [b, a]
    return hipotenusa(a, b, c, 'cm', `Os catetos de um triângulo retângulo medem ${neg(p, 'cm')} e ${neg(q, 'cm')}. Quanto mede a hipotenusa, em cm?`, visual)
  },
}

export const pitagorasN2: Gerador = {
  id: 'pitagoras-n2',
  aula: 'B.U16.A8',
  nivel: 2,
  gerar(r) {
    const base = r.pick(TERNAS)
    const [a, b, c] = base[0] === 3 ? vezes(base, r.int(2, 6)) : base
    if (r.int(0, 1) === 0) {
      const [p, q] = r.int(0, 1) === 0 ? [a, b] : [b, a]
      return hipotenusa(a, b, c, 'cm', `Os catetos de um triângulo retângulo medem ${neg(p, 'cm')} e ${neg(q, 'cm')}. Quanto mede a hipotenusa, em cm?`)
    }
    // O cateto que falta: um dos dois, ao acaso.
    const [dado, falta] = r.int(0, 1) === 0 ? [a, b] : [b, a]
    return cateto(dado, falta, c, 'cm', `Num triângulo retângulo, a hipotenusa mede ${neg(c, 'cm')} e um cateto mede ${neg(dado, 'cm')}. Quanto mede o outro cateto, em cm?`)
  },
}

export const pitagorasN3: Gerador = {
  id: 'pitagoras-n3',
  aula: 'B.U16.A8',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['escada', 'tela', 'esquadro'] as const)
    if (tipo === 'escada') {
      // A escada é a hipotenusa; o pé e a altura no muro, os catetos.
      const [a, b, c] = vezes(TERNAS[0], r.int(1, 2))
      const [pe, altura] = r.int(0, 1) === 0 ? [a, b] : [b, a]
      return cateto(pe, altura, c, 'm', `Uma escada de ${neg(c, 'm')} está encostada num muro, com o pé a ${neg(pe, 'm')} do muro. A que altura, em m, ela toca o muro?`)
    }
    if (tipo === 'tela') {
      const k = r.int(1, 6) * 5
      const [a, b, c] = vezes(TERNAS[0], k)
      return hipotenusa(a, b, c, 'cm', `Uma tela tem ${neg(b, 'cm')} por ${neg(a, 'cm')}, com os cantos retos. Quanto mede a diagonal, em cm?`)
    }
    const [a, b, c] = r.pick([vezes(TERNAS[0], 1), vezes(TERNAS[0], 2), vezes(TERNAS[0], 3), TERNAS[1]])
    return hipotenusa(a, b, c, 'm', `O pedreiro marcou ${neg(a, 'm')} numa parede e ${neg(b, 'm')} na outra, a partir do canto. Para o canto ficar reto, quanto deve dar a diagonal, em m?`)
  },
}

export const GERADORES_U16B: Gerador[] = [
  perimetroN1,
  perimetroN2,
  perimetroN3,
  areaN1,
  areaN2,
  areaN3,
  circuloN1,
  circuloN2,
  circuloN3,
  pitagorasN1,
  pitagorasN2,
  pitagorasN3,
]
