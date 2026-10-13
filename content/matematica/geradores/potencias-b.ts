import type { Gerador, Item, Visual } from '@/lib/formation/schema'

// Unidade 13: potências e raízes (aulas 4 a 6). Notação científica, raiz
// quadrada, estimar raízes e raiz cúbica.
//
// Nada de ponto flutuante: um número da notação científica é guardado como
// um inteiro M sem zeros no fim (a mantissa sem vírgula: 1,5 é 15) e a
// potência de 10 que o acompanha. O texto (150.000.000, 0,00007) é montado
// com os algarismos. Respostas inteiras vão como número; decimais, como
// texto com vírgula ('0,0025'). Todo item que pede um expoente tem
// `sinal: true`: a tecla do menos aparece sempre, e o teclado não entrega o
// sinal. Quando os números precisam combinar (a área tem de dar um
// quadrado), as combinações boas são listadas uma vez, ao carregar o
// arquivo.

/** Milhar com ponto: '150000000' → '150.000.000'. */
const mil = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/** M × 10^e com todos os algarismos, com ponto de milhar e vírgula: (15, 7) → '150.000.000'; (7, −5) → '0,00007'. */
function extenso(M: number, e: number): string {
  const d = String(M)
  if (e >= 0) return mil(d + '0'.repeat(e))
  const s = d.padStart(-e + 1, '0')
  return `${mil(s.slice(0, s.length + e))},${s.slice(s.length + e)}`
}
/** O mesmo, como o aluno digita: inteiro vira número; decimal, texto com vírgula e sem ponto. */
const digitado = (M: number, e: number) => (e >= 0 ? M * 10 ** e : extenso(M, e).replace(/\./g, ''))
/** A mantissa com a vírgula depois do primeiro algarismo: 15 → '1,5'; 406 → '4,06'; 7 → '7'. */
const mant = (M: number) => {
  const d = String(M)
  return d.length === 1 ? d : `${d[0]},${d.slice(1)}`
}
/** O mesmo em TeX: 15 → '1{,}5'. */
const mantTex = (M: number) => mant(M).replace(',', '{,}')
/** A potência em TeX: −5 → '10^{-5}'. */
const pot = (n: number) => `10^{${n}}`
/** O expoente como se escreve no texto, com o menos verdadeiro: −5 → '−5'. */
const exp = (n: number) => (n < 0 ? `−${-n}` : String(n))
/** Expoente em sobrescrito, para as casas do quadro: −5 → '⁻⁵'. */
const SOBRE: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
const sobre = (n: number) => String(n).split('').map((c) => SOBRE[c]).join('')
/** As casas do quadro de potências, da maior para a menor: (3, 0) → ['× 10³', '× 10²', '× 10¹', '× 1']. */
const casas = (de: number, ate: number) => Array.from({ length: de - ate + 1 }, (_, i) => de - i).map((n) => (n === 0 ? '× 1' : `× 10${sobre(n)}`))

/** Erros previsíveis (como o aluno digitaria), sem a certa e sem repetir. */
function mapa(certa: number | string, pares: [number | string | undefined, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor === undefined) continue
    const k = typeof valor === 'number' ? exp(valor) : valor
    if (k === exp(Number(certa)) || k === String(certa) || k in erros) continue
    erros[k] = erro
  }
  return erros
}
/** a ÷ b, se der inteiro. */
const exata = (a: number, b: number) => (a % b === 0 ? a / b : undefined)

/** Embaralha com o rng (Fisher–Yates). */
function embaralha<T>(r: { int(a: number, b: number): number }, xs: T[]): T[] {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
/** Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada, embaralhada. */
function escolha(r: { int(a: number, b: number): number }, opcoes: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const ordem = embaralha(r, opcoes.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = opcoes[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => opcoes[o][0]), resposta: ordem.indexOf(0), erros }
}

/** Mantissas de dois algarismos sem zero no fim: 11 a 99 (1,1 a 9,9). */
const DOIS = Array.from({ length: 89 }, (_, i) => i + 11).filter((m) => m % 10 !== 0)

// ---------------------------------------------------------------- aula 4: notação científica

export const notacaoCientificaN1: Gerador = {
  id: 'notacao-cientifica-n1',
  aula: 'B.U13.A4',
  nivel: 1,
  gerar(r) {
    // d seguido de n zeros: d × 10ⁿ.
    const d = r.int(2, 9)
    const n = r.int(3, 8)
    const numero = extenso(d, n)
    return {
      enunciado: `**${numero}** é $${d} \\times 10^{?}$. Qual é o expoente?`,
      formato: 'numero',
      resposta: n,
      sinal: true,
      erros: mapa(n, [
        [n + 1, 'expoente-conta-os-zeros'],
        [-n, 'expoente-com-sinal-trocado'],
      ]),
      dicas: [
        'Cada × 10 anda a vírgula uma casa. O expoente conta as casas.',
        `No quadro, o ${d} está na casa do $${pot(n)}$. A vírgula vai para depois dele.`,
        `Do ${d} até o fim são ${n} casas: $${numero} = ${d} \\times ${pot(n)}$.`,
      ],
      visual: {
        modelo: 'quadro-posicional',
        estado: { medida: { casas: casas(n, 0), numero, de: '× 1' } },
        esboco: `O quadro de potências, de "× 10${sobre(n)}" até "× 1", com ${numero}: o ${d} na casa do 10${sobre(n)} e os zeros até a casa do 1.`,
      },
    }
  },
}

/** Os três tipos do nível 2. */
type TipoN2 = 'grande' | 'pequeno' | 'forma'
const TIPOS_N2: TipoN2[] = ['grande', 'pequeno', 'forma']

export const notacaoCientificaN2: Gerador = {
  id: 'notacao-cientifica-n2',
  aula: 'B.U13.A4',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(TIPOS_N2)
    if (tipo === 'grande') {
      // 150.000.000 = 1,5 × 10⁸: o 5 também ocupa uma casa.
      const M = r.pick(DOIS)
      const n = r.int(4, 9)
      const numero = extenso(M, n - 1)
      return {
        enunciado: `**${numero}** é $${mantTex(M)} \\times 10^{?}$. Qual é o expoente?`,
        formato: 'numero',
        resposta: n,
        sinal: true,
        erros: mapa(n, [
          [n - 1, 'expoente-conta-os-zeros'],
          [n + 1, 'expoente-conta-os-zeros'],
          [-n, 'expoente-com-sinal-trocado'],
        ]),
        dicas: [
          'O expoente conta as casas que a vírgula anda, não os zeros.',
          `A vírgula vai para depois do ${String(M)[0]}. Conte as casas dali até o fim.`,
          `São ${n} casas, contando a do ${String(M)[1]}: $${numero} = ${mantTex(M)} \\times ${pot(n)}$.`,
        ],
      }
    }
    if (tipo === 'pequeno') {
      // 0,00007 = 7 × 10⁻⁵: a vírgula anda para a direita, o expoente é negativo.
      const M = r.int(0, 1) === 0 ? r.int(1, 9) : r.pick(DOIS)
      const k = r.int(2, 6)
      const numero = extenso(M, -k - (String(M).length - 1))
      return {
        enunciado: `**${numero}** é $${mantTex(M)} \\times 10^{?}$. Qual é o expoente?`,
        formato: 'numero',
        resposta: -k,
        sinal: true,
        erros: mapa(-k, [
          [k, 'expoente-com-sinal-trocado'],
          [-(k - 1), 'expoente-conta-os-zeros'],
        ]),
        dicas: [
          'O número é menor que 1: a vírgula anda para a direita, e o expoente é negativo.',
          `Conte as casas da vírgula até depois do ${String(M)[0]}, contando a dele.`,
          `São ${k} casas para a direita: $${numero.replace(',', '{,}')} = ${mantTex(M)} \\times ${pot(-k)}$.`,
        ],
      }
    }
    // Qual das três formas está em notação científica?
    const M = r.pick(DOIS)
    const n = r.int(0, 1) === 0 ? r.int(3, 9) : -r.int(2, 6)
    const numero = extenso(M, n - 1)
    const certa = `$${mantTex(M)} \\times ${pot(n)}$`
    const vezes10 = `$${M} \\times ${pot(n - 1)}$`
    const dividido = `$0{,}${M} \\times ${pot(n + 1)}$`
    return {
      enunciado: `Os três valem **${numero}**. Qual está em notação científica?`,
      formato: 'escolha',
      ...escolha(r, [
        [certa, undefined],
        [vezes10, 'notacao-fora-de-1-a-10'],
        [dividido, 'notacao-fora-de-1-a-10'],
      ]),
      dicas: [
        'Em notação científica, o primeiro número fica entre 1 e 10.',
        `${M} passa de 10, e 0,${M} é menor que 1.`,
        `A vírgula fica logo depois do ${String(M)[0]}: ${certa}.`,
      ],
    }
  },
}

/** Situações com números grandes: o que vem antes e depois do número. */
const GRANDES: [string, string, string][] = [
  ['Uma cidade tem', 'habitantes', 'Escreva o número sem a potência de 10.'],
  ['Uma fábrica produziu', 'parafusos no ano', 'Escreva o número sem a potência de 10.'],
  ['Um reservatório guarda', 'litros de água', 'Escreva o número sem a potência de 10.'],
]
/** Situações com números pequenos, em metros, e os expoentes que fazem sentido em cada uma. */
const PEQUENOS: [string, number, number][] = [
  ['Uma camada de tinta tem', 4, 5],
  ['Um fio de cobre tem', 3, 4],
  ['Uma folha de papel-alumínio tem', 5, 5],
]
/** Mantissas do nível 3: dois algarismos, ou três com um zero no meio (4,06). */
const TRES = Array.from({ length: 81 }, (_, i) => (Math.floor(i / 9) + 1) * 100 + (i % 9) + 1)

export const notacaoCientificaN3: Gerador = {
  id: 'notacao-cientifica-n3',
  aula: 'B.U13.A4',
  nivel: 3,
  gerar(r) {
    const M = r.int(0, 2) === 0 ? r.pick(TRES) : r.pick(DOIS)
    const L = String(M).length
    if (r.int(0, 1) === 0) {
      // De volta sem a potência, um número grande: 3,2 × 10⁵ = 320.000.
      const [antes, depois, pergunta] = r.pick(GRANDES)
      const n = r.int(L + 1, 7)
      const e = n - (L - 1)
      const certa = digitado(M, e)
      return {
        enunciado: `${antes} $${mantTex(M)} \\times ${pot(n)}$ ${depois}. ${pergunta}`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [String(digitado(M, n)), 'expoente-conta-os-zeros'],
          [String(digitado(M, e - 1)), 'expoente-conta-os-zeros'],
        ]),
        dicas: [
          `$${pot(n)}$: a vírgula anda ${n} casas para a direita.`,
          `Os algarismos depois da vírgula de ${mant(M)} já ocupam ${L - 1} ${L - 1 === 1 ? 'casa' : 'casas'}. Faltam ${e} zeros.`,
          `$${mantTex(M)} \\times ${pot(n)} = ${extenso(M, e)}$.`,
        ],
      }
    }
    // De volta sem a potência, um número pequeno: 2,5 × 10⁻³ = 0,0025.
    const [antes, kMin, kMax] = r.pick(PEQUENOS)
    const k = r.int(kMin, kMax)
    const certa = digitado(M, -k - (L - 1))
    return {
      enunciado: `${antes} $${mantTex(M)} \\times ${pot(-k)}$ m de espessura. Escreva o número sem a potência de 10.`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [digitado(M, -k - L), 'expoente-conta-os-zeros'],
        [String(digitado(M, k - (L - 1))), 'expoente-com-sinal-trocado'],
      ]),
      dicas: [
        `O expoente é negativo: a vírgula anda ${k} casas para a esquerda, e o número fica menor que 1.`,
        `A cada casa, um 0 entra na frente: ${mant(M)} vira ${extenso(M, -L)}, depois ${extenso(M, -L - 1)}…`,
        `$${mantTex(M)} \\times ${pot(-k)} = ${String(certa).replace(',', '{,}')}$ m.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: raiz quadrada

const quadrado = (n: number, esboco: string): Visual => ({ modelo: 'retangulo', estado: { linhas: n, colunas: n, total: n * n }, esboco })

export const raizQuadradaN1: Gerador = {
  id: 'raiz-quadrada-n1',
  aula: 'B.U13.A5',
  nivel: 1,
  gerar(r) {
    const n = r.int(2, 10)
    const a = n * n
    return {
      enunciado: `O quadrado tem **${a}** quadradinhos. Quanto é $\\sqrt{${a}}$?`,
      formato: 'numero',
      resposta: n,
      erros: mapa(n, [
        [exata(a, 2), 'raiz-e-a-metade'],
        [exata(a, 4), 'confunde-area-perimetro'],
      ]),
      dicas: [
        'A raiz quadrada é o lado do quadrado: quantos quadradinhos em cada fileira?',
        `Que número vezes ele mesmo dá ${a}?`,
        `$${n} \\times ${n} = ${a}$, então $\\sqrt{${a}} = ${n}$.`,
      ],
      visual: quadrado(n, `O quadrado de ${n} por ${n} quadradinhos, sem os rótulos dos lados, com ${a} embaixo. O aluno conta uma fileira.`),
    }
  },
}

/** Somas de dois quadrados que dão um quadrado: [a, b, c] com a² + b² = c². */
const TRIOS: [number, number, number][] = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 6, 10], [4, 3, 5], [12, 5, 13], [12, 9, 15]]

export const raizQuadradaN2: Gerador = {
  id: 'raiz-quadrada-n2',
  aula: 'B.U13.A5',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Quadrados de 7 a 12.
      const n = r.int(7, 12)
      const a = n * n
      return {
        enunciado: `Quanto é $\\sqrt{${a}}$?`,
        formato: 'numero',
        resposta: n,
        erros: mapa(n, [
          [exata(a, 2), 'raiz-e-a-metade'],
          [exata(a, 4), 'confunde-area-perimetro'],
        ]),
        dicas: [
          `Que número vezes ele mesmo dá ${a}?`,
          `Pense na tabela: $10 \\times 10 = 100$. ${a} ${a > 100 ? 'passa' : 'não chega'} de 100.`,
          `$${n} \\times ${n} = ${a}$, então $\\sqrt{${a}} = ${n}$.`,
        ],
      }
    }
    // A raiz de uma soma: primeiro a soma.
    const [a, b, c] = r.pick(TRIOS)
    const soma = a * a + b * b
    return {
      enunciado: `Quanto é \${\\sqrt{${a * a} + ${b * b}}}$?`,
      formato: 'numero',
      resposta: c,
      erros: mapa(c, [
        [a + b, 'raiz-da-soma-separada'],
        [exata(soma, 2), 'raiz-e-a-metade'],
      ]),
      dicas: [
        'Primeiro a conta debaixo da raiz. A raiz não se reparte pela soma.',
        `$${a * a} + ${b * b} = ${soma}$. Agora, que número vezes ele mesmo dá ${soma}?`,
        `$\\sqrt{${soma}} = ${c}$, porque $${c} \\times ${c} = ${soma}$. Não é $${a} + ${b} = ${a + b}$.`,
      ],
    }
  },
}

/** Retângulos a × b (a < b) com a área de um quadrado de lado até 12. */
const RETANGULOS: [number, number, number][] = []
for (let n = 4; n <= 12; n++) {
  for (let a = 2; a < n; a++) if ((n * n) % a === 0 && (n * n) / a <= 40) RETANGULOS.push([a, (n * n) / a, n])
}
type TipoR3 = 'cerca' | 'retangulo' | 'azulejo'
const TIPOS_R3: TipoR3[] = ['cerca', 'retangulo', 'azulejo']

export const raizQuadradaN3: Gerador = {
  id: 'raiz-quadrada-n3',
  aula: 'B.U13.A5',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(TIPOS_R3)
    if (tipo === 'cerca') {
      const n = r.int(5, 12)
      const a = n * n
      const certa = 4 * n
      return {
        enunciado: `Uma horta quadrada tem **${a} m²**. Quantos metros de cerca são precisos para dar a volta nela?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [a, 'confunde-area-perimetro'],
          [exata(4 * a, 2), 'raiz-e-a-metade'],
        ]),
        dicas: [
          'Primeiro o lado: a raiz da área. Depois a volta: os 4 lados.',
          `$\\sqrt{${a}} = ${n}$, porque $${n} \\times ${n} = ${a}$. A horta tem ${n} m de lado.`,
          `$4 \\times ${n} = ${certa}$ m de cerca.`,
        ],
      }
    }
    if (tipo === 'retangulo') {
      const [a, b, n] = r.pick(RETANGULOS)
      const area = a * b
      return {
        enunciado: `Um quarto quadrado tem a mesma área de uma sala de **${a} m** por **${b} m**. Quanto mede o lado do quarto?`,
        formato: 'numero',
        resposta: n,
        erros: mapa(n, [
          [exata(area, 2), 'raiz-e-a-metade'],
          [exata(area, 4), 'confunde-area-perimetro'],
        ]),
        dicas: [
          'Primeiro a área da sala. O lado do quarto é a raiz dela.',
          `A sala tem $${a} \\times ${b} = ${area}$ m².`,
          `$\\sqrt{${area}} = ${n}$, porque $${n} \\times ${n} = ${area}$: o quarto tem ${n} m de lado.`,
        ],
      }
    }
    // Azulejo de dezenas de cm: √400 = 20.
    const d = r.int(2, 9)
    const n = 10 * d
    const a = n * n
    return {
      enunciado: `Um azulejo quadrado tem **${mil(String(a))} cm²**. Quanto mede o lado, em cm?`,
      formato: 'numero',
      resposta: n,
      erros: mapa(n, [
        [exata(a, 2), 'raiz-e-a-metade'],
        [exata(a, 4), 'confunde-area-perimetro'],
      ]),
      dicas: [
        'Que número vezes ele mesmo dá a área? Pense em dezenas: $10 \\times 10 = 100$.',
        `$${d} \\times ${d} = ${d * d}$. E $${n} \\times ${n}$?`,
        `$${n} \\times ${n} = ${mil(String(a))}$, então o lado tem ${n} cm.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: estimar raízes e raiz cúbica

/** Os números que não são quadrados, de 10 a 99. */
const NAO_QUADRADOS = Array.from({ length: 90 }, (_, i) => i + 10).filter((x) => !Number.isInteger(Math.sqrt(x)))
/** Os números que não são quadrados, de 10 a 140, para a horta. */
const HORTAS = Array.from({ length: 131 }, (_, i) => i + 10).filter((x) => !Number.isInteger(Math.sqrt(x)))
/** O maior inteiro cujo quadrado não passa de x, sem raiz de ponto flutuante. */
const piso = (x: number) => {
  let k = 0
  while ((k + 1) * (k + 1) <= x) k++
  return k
}
/** As três opções de "entre quais": os lados (certa), os quadrados e a metade. */
const entre = (x: number, u = '') => {
  const k = piso(x)
  const h = Math.floor(x / 2)
  return [
    [`Entre ${k}${u} e ${k + 1}${u}`, undefined],
    [`Entre ${k * k}${u} e ${(k + 1) * (k + 1)}${u}`, 'estima-com-os-quadrados'],
    [`Entre ${h}${u} e ${h + 1}${u}`, 'raiz-e-a-metade'],
  ] as [string, string | undefined][]
}

export const estimarRaizN1: Gerador = {
  id: 'estimar-raiz-n1',
  aula: 'B.U13.A6',
  nivel: 1,
  gerar(r) {
    const x = r.pick(NAO_QUADRADOS)
    const k = piso(x)
    return {
      enunciado: `$\\sqrt{${x}}$ fica entre quais números inteiros?`,
      formato: 'escolha',
      ...escolha(r, entre(x)),
      dicas: [
        `Qual o maior quadrado que dá para montar com ${x} quadradinhos?`,
        `$${k} \\times ${k} = ${k * k}$ e $${k + 1} \\times ${k + 1} = ${(k + 1) * (k + 1)}$. O ${x} fica no meio.`,
        `$${k * k} < ${x} < ${(k + 1) * (k + 1)}$, então $\\sqrt{${x}}$ fica entre ${k} e ${k + 1}.`,
      ],
      visual: {
        modelo: 'retangulo',
        estado: { linhas: k, colunas: k, sobra: x - k * k, rotulos: true },
        esboco: `Com ${x} quadradinhos: o quadrado de ${k} por ${k} montado e ${x - k * k} soltos embaixo, contornados em âmbar.`,
      },
    }
  },
}

export const estimarRaizN2: Gerador = {
  id: 'estimar-raiz-n2',
  aula: 'B.U13.A6',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // A raiz cúbica de um cubo de 2 a 10.
      const n = r.int(2, 10)
      const c = n * n * n
      return {
        enunciado: `Quanto é $\\sqrt[3]{${mil(String(c))}}$?`,
        formato: 'numero',
        resposta: n,
        erros: mapa(n, [[exata(c, 3), 'raiz-cubica-e-dividir-por-3']]),
        dicas: [
          'A raiz cúbica é o lado do cubo: o número que, três vezes multiplicado, dá aquele.',
          `Teste: $${n - 1} \\times ${n - 1} \\times ${n - 1} = ${mil(String((n - 1) ** 3))}$. Passou ou faltou?`,
          `$${n} \\times ${n} \\times ${n} = ${mil(String(c))}$, então $\\sqrt[3]{${mil(String(c))}} = ${n}$.`,
        ],
      }
    }
    // O teste do meio: (k,5)² = k² + k + 0,25.
    const k = r.int(2, 11)
    const certa = `${k * k + k},25`
    return {
      enunciado: `Para chegar perto de uma raiz, teste o meio. Quanto é $${k}{,}5 \\times ${k}{,}5$?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[`${k * k},25`, 'multiplica-partes-separadas']]),
      dicas: [
        'Faça sem a vírgula e ponha as casas no fim: uma casa em cada número, duas no resultado.',
        `$${k}5 \\times ${k}5 = ${mil(String((10 * k + 5) ** 2))}$.`,
        `Com duas casas: $${k}{,}5 \\times ${k}{,}5 = ${k * k + k}{,}25$.`,
      ],
    }
  },
}

export const estimarRaizN3: Gerador = {
  id: 'estimar-raiz-n3',
  aula: 'B.U13.A6',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // A horta quadrada.
      const x = r.pick(HORTAS)
      const k = piso(x)
      return {
        enunciado: `Uma horta quadrada tem **${x} m²**. O lado dela fica entre quais medidas?`,
        formato: 'escolha',
        ...escolha(r, entre(x, ' m')),
        dicas: [
          'O lado é a raiz da área. Ache os quadrados perfeitos vizinhos da área.',
          `$${k}^2 = ${k * k}$ e $${k + 1}^2 = ${(k + 1) * (k + 1)}$.`,
          `$${k * k} < ${x} < ${(k + 1) * (k + 1)}$: o lado fica entre ${k} m e ${k + 1} m.`,
        ],
      }
    }
    // A caixa cúbica: 1 L = 1 dm³.
    const n = r.int(2, 10)
    const c = n * n * n
    return {
      enunciado: `Uma caixa em forma de cubo guarda **${mil(String(c))} L**. Quanto mede cada lado, por dentro, em dm?`,
      formato: 'numero',
      resposta: n,
      erros: mapa(n, [[exata(c, 3), 'raiz-cubica-e-dividir-por-3']]),
      dicas: [
        '1 L é um cubinho de 1 dm de lado. O lado da caixa é a raiz cúbica.',
        `São ${mil(String(c))} dm³. Que número, três vezes multiplicado, dá ${mil(String(c))}?`,
        `$${n} \\times ${n} \\times ${n} = ${mil(String(c))}$: cada lado tem ${n} dm.`,
      ],
    }
  },
}

export const GERADORES_U13B: Gerador[] = [
  notacaoCientificaN1,
  notacaoCientificaN2,
  notacaoCientificaN3,
  raizQuadradaN1,
  raizQuadradaN2,
  raizQuadradaN3,
  estimarRaizN1,
  estimarRaizN2,
  estimarRaizN3,
]
