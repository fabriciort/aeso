import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 15: equações do 1º grau (parte B). Aula 4, parênteses e frações;
// aula 5, do problema à equação; aula 6, inequações simples.
//
// O teclado só digita números. Os itens pedem o valor de x, a resposta de um
// problema (km, horas, anos, reais) ou o menor e o maior inteiro que é
// solução de uma inequação; a montagem da equação e a solução de uma
// inequação (x > 4) vêm como opções de `escolha`, em TeX. Erros com resposta
// negativa se escrevem com o menos verdadeiro (−3). Reais e unidades levam o
// espaço que não quebra (R$ 5, 7 km).

// ---------------------------------------------------------------- ferramentas

/** O espaço que não quebra: R$ 5 e 7 km ficam na mesma linha. */
const NB = ' '
/** O número como se escreve no texto, com o menos verdadeiro: −12. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))
/** Dinheiro: R$ 15. */
const rs = (n: number) => `R$${NB}${n}`

/** Erros previsíveis (como o aluno digitaria), sem a certa, sem repetir e só inteiros. */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (!Number.isInteger(valor)) continue
    const k = num(valor)
    if (valor === certa || k in erros) continue
    erros[k] = erro
  }
  return erros
}

/** Embaralha com o rng (Fisher–Yates). */
function embaralha<T>(r: Rng, xs: T[]): T[] {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
/**
 * Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada,
 * embaralhada. Cada opção é TeX sem os cifrões; o item a mostra como $...$.
 */
function escolha(r: Rng, opcoes: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const ordem = embaralha(r, opcoes.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = opcoes[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => `$${opcoes[o][0]}$`), resposta: ordem.indexOf(0), erros }
}

/** ax + b em TeX, com o termo sem x podendo ser negativo: (2, −6) → '2x - 6'. */
function lin(a: number, b: number): string {
  const x = a === 1 ? 'x' : `${a}x`
  if (b === 0) return x
  return b > 0 ? `${x} + ${b}` : `${x} - ${-b}`
}
/** Um número em TeX: −11 vira '-11'. */
const tex = (n: number) => String(n)

// ---------------------------------------------------------------- aula 4: parênteses e frações

export const equacaoParentesesN1: Gerador = {
  id: 'equacao-parenteses-n1',
  aula: 'B.U15.A4',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // a(x + b) = c, na balança: a caixas e a · b pesos contra c (até 20).
      const a = r.pick([2, 3])
      const b = r.int(1, 3)
      const x = r.int(2, Math.floor(20 / a) - b)
      const c = a * (x + b)
      const visual: Visual = {
        modelo: 'balanca',
        estado: { esquerda: { x: a, n: a * b }, direita: { n: c }, rotulo: `${a}(x + ${b}) = ${c}` },
        esboco: `A balança em equilíbrio: ${a} caixas e ${a * b} pesos contra ${c}. Embaixo, ${a}(x + ${b}) = ${c}.`,
      }
      return {
        enunciado: `Resolva $${a}(x + ${b}) = ${c}$. Quanto vale x?`,
        formato: 'numero',
        resposta: x,
        sinal: true,
        erros: mapa(x, [
          [(c - b) / a, 'distributiva-parcial'],
          [c - a * b, 'esquece-de-dividir'],
          [c / a + b, 'desfaz-com-a-mesma-operacao'],
        ]),
        dicas: [
          `Primeiro arrume: tire os parênteses, ou divida os dois lados por ${a}.`,
          `Dividindo os dois lados por ${a}: $x + ${b} = ${c / a}$.`,
          `$x = ${c / a} - ${b} = ${x}$. Confira: $${a}(${x} + ${b}) = ${a} \\cdot ${x + b} = ${c}$.`,
        ],
        visual,
      }
    }
    // x/k = m, na barra: um k-ésimo de x vale m.
    const k = r.int(2, 5)
    const m = r.int(2, 9)
    const x = k * m
    const visual: Visual = {
      modelo: 'barra',
      estado: { partes: k, pintadas: 1, rotulo: `x/${k} = ${m}` },
      esboco: `Uma barra (o x inteiro) partida em ${k} partes iguais, uma pintada. À direita, x/${k} = ${m}.`,
    }
    return {
      enunciado: `Resolva $\\frac{x}{${k}} = ${m}$. Quanto vale x?`,
      formato: 'numero',
      resposta: x,
      sinal: true,
      erros: mapa(x, [
        [m, 'opera-so-de-um-lado'],
        [m + k, 'soma-no-lugar-de-multiplicar'],
        [m / k, 'desfaz-com-a-mesma-operacao'],
      ]),
      dicas: [
        'Desfaça a fração multiplicando **os dois lados** pelo número de baixo.',
        `Uma parte de ${k} vale ${m}. O x inteiro tem ${k} partes.`,
        `$x = ${k} \\cdot ${m} = ${x}$. Confira: $${x} \\div ${k} = ${m}$.`,
      ],
      visual,
    }
  },
}

type TipoP2 = 'fracao-mais' | 'fracao-menos' | 'parenteses-menos'
const TIPOS_P2: TipoP2[] = ['fracao-mais', 'fracao-menos', 'parenteses-menos']

export const equacaoParentesesN2: Gerador = {
  id: 'equacao-parenteses-n2',
  aula: 'B.U15.A4',
  nivel: 2,
  gerar(r) {
    const tipo = r.pick(TIPOS_P2)
    if (tipo === 'parenteses-menos') {
      // a(x − b) = c.
      const a = r.int(2, 6)
      const b = r.int(1, 9)
      const x = r.int(b + 1, b + 9)
      const c = a * (x - b)
      return {
        enunciado: `Resolva $${a}(x - ${b}) = ${c}$. Quanto vale x?`,
        formato: 'numero',
        resposta: x,
        sinal: true,
        erros: mapa(x, [
          [(c + b) / a, 'distributiva-parcial'],
          [c / a - b, 'desfaz-com-a-mesma-operacao'],
          [c + a * b, 'esquece-de-dividir'],
        ]),
        dicas: [
          `Primeiro arrume: divida os dois lados por ${a}, ou tire os parênteses.`,
          `Dividindo os dois lados por ${a}: $x - ${b} = ${c / a}$.`,
          `$x = ${c / a} + ${b} = ${x}$. Confira: $${a}(${x} - ${b}) = ${a} \\cdot ${x - b} = ${c}$.`,
        ],
      }
    }
    // x/k ± b = c: o número solto sai primeiro, a fração depois.
    const k = r.int(2, 5)
    const b = r.int(1, 9)
    if (tipo === 'fracao-mais') {
      const q = r.int(2, 9)
      return fracaoMais(k, q, b, q + b)
    }
    // x/k − b = c, com c ≥ 1 neste nível.
    const c = r.int(1, 8)
    return fracaoMenos(k, c + b, b, c)
  },
}

function fracaoMais(k: number, q: number, b: number, c: number): Item {
  const x = k * q
  return {
    enunciado: `Resolva $\\frac{x}{${k}} + ${b} = ${c}$. Quanto vale x?`,
    formato: 'numero',
    resposta: x,
    sinal: true,
    erros: mapa(x, [
      [k * c - b, 'multiplica-so-um-termo'],
      [q, 'opera-so-de-um-lado'],
      [k * (c + b), 'desfaz-com-a-mesma-operacao'],
    ]),
    dicas: [
      'Primeiro tire o número solto dos dois lados; depois desfaça a fração.',
      `Tirando ${b} dos dois lados: $\\frac{x}{${k}} = ${q}$.`,
      `Multiplicando os dois lados por ${k}: $x = ${x}$. Confira: $${x} \\div ${k} + ${b} = ${q} + ${b} = ${c}$.`,
    ],
  }
}
function fracaoMenos(k: number, q: number, b: number, c: number): Item {
  const x = k * q
  return {
    enunciado: `Resolva $\\frac{x}{${k}} - ${b} = ${c}$. Quanto vale x?`,
    formato: 'numero',
    resposta: x,
    sinal: true,
    erros: mapa(x, [
      [k * c + b, 'multiplica-so-um-termo'],
      [q, 'opera-so-de-um-lado'],
      [k * (c - b), 'desfaz-com-a-mesma-operacao'],
    ]),
    dicas: [
      'Primeiro desfaça o − dos dois lados; depois desfaça a fração.',
      `Somando ${b} dos dois lados: $\\frac{x}{${k}} = ${q}$.`,
      `Multiplicando os dois lados por ${k}: $x = ${x}$. Confira: $${x} \\div ${k} - ${b} = ${q} - ${b} = ${c}$.`,
    ],
  }
}

const QUANTOS = ['', '', 'Dois', 'Três', 'Quatro']

export const equacaoParentesesN3: Gerador = {
  id: 'equacao-parenteses-n3',
  aula: 'B.U15.A4',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Combos iguais: a(x + b) = c, em reais.
      const a = r.int(2, 4)
      const b = r.int(2, 6)
      const x = r.int(5, 15)
      const c = a * (x + b)
      return {
        enunciado: `${QUANTOS[a]} combos iguais, cada um com um lanche e um suco de **${rs(b)}**, custaram **${rs(c)}**. Quanto custa o lanche, em reais?`,
        formato: 'numero',
        resposta: x,
        erros: mapa(x, [
          [(c - b) / a, 'distributiva-parcial'],
          [c / a, 'responde-outra-pergunta'],
          [c - a * b, 'esquece-de-dividir'],
        ]),
        dicas: [
          `Com x no lugar do lanche, os combos custam $${a}(x + ${b}) = ${c}$.`,
          `Dividindo os dois lados por ${a}: um combo custa $x + ${b} = ${c / a}$.`,
          `$x = ${c / a} - ${b} = ${x}$ reais. Confira: $${a} \\cdot (${x} + ${b}) = ${c}$.`,
        ],
      }
    }
    // A conta dividida, com gorjeta: x/k + g = T.
    const k = r.int(2, 5)
    const q = 5 * r.int(4, 12)
    const g = 5 * r.int(1, 3)
    const t = q + g
    const x = k * q
    return {
      enunciado: `Uma conta foi dividida igualmente por **${k} amigos**. Cada um pagou a sua parte e mais **${rs(g)}** de gorjeta: **${rs(t)}**. De quanto era a conta, em reais?`,
      formato: 'numero',
      resposta: x,
      erros: mapa(x, [
        [k * t - g, 'multiplica-so-um-termo'],
        [q, 'responde-outra-pergunta'],
      ]),
      dicas: [
        `Com x no lugar da conta, cada um pagou $\\frac{x}{${k}} + ${g} = ${t}$.`,
        `Tirando ${g} dos dois lados: $\\frac{x}{${k}} = ${q}$. Essa é a parte de cada um.`,
        `Multiplicando os dois lados por ${k}: $x = ${x}$ reais. Confira: $${x} \\div ${k} + ${g} = ${t}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: do problema à equação

/** Tarifas com um valor fixo e um valor por unidade: f + p · k = total. */
interface Tarifa {
  /** A história, com o fixo, o valor por unidade e o total já escritos. */
  texto: (f: string, p: string, total: string) => string
  pergunta: string
  /** Como se lê o x (os km, as horas). */
  x: string
  /** A unidade da resposta. */
  unidade: string
  f: [number, number, number]
  p: [number, number, number]
  k: [number, number]
}
const TARIFAS: Tarifa[] = [
  {
    texto: (f, p, t) => `Uma corrida de aplicativo custa **${f}** para começar e **${p}** por km. Você pagou **${t}**.`,
    pergunta: 'Quantos km você andou?', x: 'os km', unidade: 'km',
    f: [3, 8, 1], p: [2, 4, 1], k: [3, 15],
  },
  {
    texto: (f, p, t) => `Um eletricista cobra **${f}** pela visita e **${p}** por hora. O serviço saiu por **${t}**.`,
    pergunta: 'Quantas horas durou o serviço?', x: 'as horas', unidade: 'horas',
    f: [50, 100, 10], p: [40, 90, 10], k: [2, 6],
  },
  {
    texto: (f, p, t) => `Um estacionamento cobra **${f}** na entrada e **${p}** por hora. Você pagou **${t}**.`,
    pergunta: 'Quantas horas o carro ficou?', x: 'as horas', unidade: 'horas',
    f: [5, 10, 1], p: [2, 5, 1], k: [2, 8],
  },
  {
    texto: (f, p, t) => `Uma academia cobra **${f}** de matrícula e **${p}** por mês. Você já pagou **${t}**, com a matrícula.`,
    pergunta: 'Quantos meses você pagou?', x: 'os meses', unidade: 'meses',
    f: [50, 120, 10], p: [80, 150, 10], k: [2, 6],
  },
]
const passo = (r: Rng, [de, ate, por]: [number, number, number]) => de + por * r.int(0, (ate - de) / por)

/** Uma tarifa com fixo diferente do valor por unidade (para as leituras erradas não coincidirem). */
function tarifa(r: Rng) {
  const t = r.pick(TARIFAS)
  const f = passo(r, t.f)
  let p = passo(r, t.p)
  if (p === f) p = p === t.p[0] ? p + t.p[2] : p - t.p[2]
  const k = r.int(t.k[0], t.k[1])
  return { t, f, p, k, total: f + p * k }
}

export const equacaoProblemaN1: Gerador = {
  id: 'equacao-problema-n1',
  aula: 'B.U15.A5',
  nivel: 1,
  gerar(r) {
    const { t, f, p, total } = tarifa(r)
    return {
      enunciado: `${t.texto(rs(f), rs(p), rs(total))} Com x ${t.unidade}, qual é a equação?`,
      formato: 'escolha',
      ...escolha(r, [
        [`${f} + ${p}x = ${total}`, undefined],
        [`${p} + ${f}x = ${total}`, 'equacao-diferente-do-problema'],
        [`${p}x = ${total}`, 'esquece-valor-fixo'],
      ]),
      dicas: [
        'Cada lado da equação diz uma parte da história: o preço de um lado, o que se pagou do outro.',
        `O fixo entra uma vez: ${f}. O valor por unidade vai com o x: $${p}x$.`,
        `$${f} + ${p}x = ${total}$: o fixo, mais ${p} vezes x, dá o total.`,
      ],
    }
  },
}

export const equacaoProblemaN2: Gerador = {
  id: 'equacao-problema-n2',
  aula: 'B.U15.A5',
  nivel: 2,
  gerar(r) {
    const { t, f, p, k, total } = tarifa(r)
    return {
      enunciado: `${t.texto(rs(f), rs(p), rs(total))} ${t.pergunta}`,
      formato: 'numero',
      resposta: k,
      erros: mapa(k, [
        [total - f, 'responde-outra-pergunta'],
        [total / p, 'esquece-valor-fixo'],
        [total - f - p, 'subtrai-o-coeficiente'],
        [(total - p) / f, 'equacao-diferente-do-problema'],
      ]),
      dicas: [
        `Chame ${t.x} de x e monte: $${f} + ${p}x = ${total}$.`,
        `Tirando ${f} dos dois lados: $${p}x = ${total - f}$.`,
        `Dividindo os dois lados por ${p}: $x = ${k}$, ou seja, ${k}${NB}${t.unidade}. Confira: $${f} + ${p} \\cdot ${k} = ${total}$.`,
      ],
    }
  },
}

const VEZES: [number, string][] = [
  [2, 'o dobro'],
  [3, 'o triplo'],
  [4, 'o quádruplo'],
]
/** Quem tem a idade maior e quem tem a menor, com o artigo. */
const PARES: [string, string][] = [
  ['Uma mãe', 'da filha'],
  ['Um pai', 'do filho'],
  ['Uma tia', 'do sobrinho'],
  ['Um avô', 'da neta'],
]
const IRMAOS: [string, string][] = [
  ['Ana', 'o irmão'],
  ['Caio', 'a irmã'],
  ['Lia', 'a prima'],
  ['Davi', 'o primo'],
]

export const equacaoProblemaN3: Gerador = {
  id: 'equacao-problema-n3',
  aula: 'B.U15.A5',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O dobro (triplo, quádruplo) da idade, e a soma das duas.
      const [k, vezes] = r.pick(VEZES)
      const [quem, de] = r.pick(PARES)
      const x = k === 2 ? r.int(18, 30) : k === 3 ? r.int(10, 18) : r.int(7, 12)
      const s = (k + 1) * x
      const certa = k * x
      return {
        enunciado: `${quem} tem **${vezes}** da idade ${de}. A soma das duas idades é **${s}${NB}anos**. Quantos anos tem ${quem.split(' ')[0] === 'Uma' ? 'a' : 'o'} ${quem.split(' ')[1]}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [x, 'responde-outra-pergunta'],
          [(s + k) / 2, 'vezes-como-mais'],
        ]),
        dicas: [
          `Chame de x a idade ${de}. A outra idade é $${k}x$, e juntas somam ${s}.`,
          `$x + ${k}x = ${s}$, ou seja, $${k + 1}x = ${s}$, e $x = ${x}$.`,
          `A pergunta é a idade maior: $${k} \\cdot ${x} = ${certa}$ anos. Confira: $${x} + ${certa} = ${s}$.`,
        ],
      }
    }
    // Tantos anos a mais, e a soma das duas idades.
    const [nome, outro] = r.pick(IRMAOS)
    const d = r.int(2, 9)
    const x = r.int(8, 30)
    const s = 2 * x + d
    const certa = x + d
    return {
      enunciado: `${nome} tem **${d}${NB}anos a mais** que ${outro}. A soma das duas idades é **${s}${NB}anos**. Quantos anos tem ${nome}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [x, 'responde-outra-pergunta'],
        [s / 2, 'equacao-diferente-do-problema'],
        [s - d, 'esquece-de-dividir'],
      ]),
      dicas: [
        `Chame de x a idade d${outro.startsWith('o') ? 'o' : 'a'} ${outro.split(' ')[1]}. A de ${nome} é $x + ${d}$.`,
        `$x + x + ${d} = ${s}$, ou seja, $2x = ${s - d}$, e $x = ${x}$.`,
        `A pergunta é ${nome}: $${x} + ${d} = ${certa}$ anos. Confira: $${x} + ${certa} = ${s}$.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: inequações simples

export const inequacaoN1: Gerador = {
  id: 'inequacao-n1',
  aula: 'B.U15.A6',
  nivel: 1,
  gerar(r) {
    // x + a > b ou x + a < b, na balança inclinada.
    const maior = r.int(0, 1) === 0
    const s = maior ? '>' : '<'
    const inv = maior ? '<' : '>'
    const a = r.int(1, 6)
    const borda = r.int(1, 12)
    const b = a + borda
    const visual: Visual = {
      modelo: 'balanca',
      estado: { esquerda: { x: 1, n: a }, direita: { n: b }, inclina: maior ? 'esquerda' : 'direita', inequacao: true, mostraEquacao: true },
      esboco: `A balança inclinada: 1 caixa e ${a} pesos contra ${b}; ${maior ? 'o prato do x desce' : 'o prato dos ' + b + ' desce'}. Embaixo, x + ${a} ${s} ${b}.`,
    }
    return {
      enunciado: `Resolva $x + ${a} ${s} ${b}$. Qual é a solução?`,
      formato: 'escolha',
      ...escolha(r, [
        [`x ${s} ${borda}`, undefined],
        [`x ${inv} ${borda}`, 'inequacao-sentido-trocado'],
        [`x = ${borda}`, 'inequacao-como-equacao'],
        [`x ${s} ${b + a}`, 'desfaz-com-a-mesma-operacao'],
      ]),
      dicas: [
        'Resolva como a equação: a mesma conta dos dois lados não muda o lado que pesa mais.',
        `Tire ${a} dos dois pratos: sobra x contra ${borda}.`,
        `$x ${s} ${borda}$: todos os números ${maior ? 'maiores' : 'menores'} que ${borda}. O ${borda} não entra (empate).`,
      ],
      visual,
    }
  },
}

export const inequacaoN2: Gerador = {
  id: 'inequacao-n2',
  aula: 'B.U15.A6',
  nivel: 2,
  gerar(r) {
    // ax + b > c (o menor inteiro) ou ax + b < c (o maior inteiro), com a borda inteira.
    const maior = r.int(0, 1) === 0
    const a = r.int(2, 5)
    const b = r.int(1, 9)
    const borda = r.int(-4, 9)
    const c = a * borda + b
    const s = maior ? '>' : '<'
    const certa = maior ? borda + 1 : borda - 1
    const sub = c - b - a
    return {
      enunciado: `Qual é o **${maior ? 'menor' : 'maior'} número inteiro** que é solução de $${lin(a, b)} ${s} ${tex(c)}$?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [borda, 'inequacao-inclui-a-borda'],
        [maior ? borda - 1 : borda + 1, 'inequacao-sentido-trocado'],
        [maior ? sub + 1 : sub - 1, 'subtrai-o-coeficiente'],
      ]),
      dicas: [
        'Resolva como a equação, fazendo a mesma conta dos dois lados. Depois cuide da borda.',
        `Tirando ${b} dos dois lados: $${a}x ${s} ${tex(c - b)}$. Dividindo por ${a}: $x ${s} ${tex(borda)}$.`,
        `O ${num(borda)} empata, então não entra. O ${maior ? 'primeiro inteiro depois' : 'último inteiro antes'} dele é ${num(certa)}.`,
      ],
    }
  },
}

export const inequacaoN3: Gerador = {
  id: 'inequacao-n3',
  aula: 'B.U15.A6',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // O cofre: s + p · x > M. A resposta é o primeiro mês que passa.
      const s = 10 * r.int(1, 5)
      const p = 5 * r.int(2, 10)
      const m = r.pick([100, 150, 200, 300])
      const certa = Math.floor((m - s) / p) + 1
      return {
        enunciado: `Você já tem **${rs(s)}** no cofre e guarda **${rs(p)}** por mês. Em quantos meses o cofre passa de **${rs(m)}**?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [certa - 1, 'inequacao-inclui-a-borda'],
          [Math.floor(m / p) + 1, 'esquece-valor-fixo'],
        ]),
        dicas: [
          `Com x meses, o cofre tem $${s} + ${p}x$. Passar de ${m} é ficar maior: $${s} + ${p}x > ${m}$.`,
          `Tirando ${s} dos dois lados: $${p}x > ${m - s}$. Divida por ${p}.`,
          `Em ${certa - 1}${NB}meses o cofre tem ${rs(s + p * (certa - 1))}, e ainda não passou. Em ${certa}, ${rs(s + p * certa)}: ${certa}${NB}meses.`,
        ],
      }
    }
    // O plano de celular: f + g · x < A. A resposta é o maior número de GB.
    const g = r.int(2, 6)
    const borda = r.int(3, 12)
    const f = 5 * r.int(2, 8)
    const a = f + g * borda
    const certa = borda - 1
    return {
      enunciado: `O plano A custa **${rs(a)}** por mês. O plano B custa **${rs(f)}** mais **${rs(g)}** por GB. Até quantos GB (inteiros) o plano B sai mais barato?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [borda, 'inequacao-inclui-a-borda'],
        [borda + 1, 'inequacao-sentido-trocado'],
        [Math.ceil(a / g) - 1, 'esquece-valor-fixo'],
      ]),
      dicas: [
        `Com x GB, o plano B custa $${f} + ${g}x$. Mais barato que o A: $${f} + ${g}x < ${a}$.`,
        `Tirando ${f} dos dois lados: $${g}x < ${a - f}$. Dividindo por ${g}: $x < ${borda}$.`,
        `Com ${borda}${NB}GB os dois planos empatam (${rs(a)}). Até ${certa}${NB}GB o plano B sai mais barato.`,
      ],
    }
  },
}

export const GERADORES_U15B: Gerador[] = [
  equacaoParentesesN1,
  equacaoParentesesN2,
  equacaoParentesesN3,
  equacaoProblemaN1,
  equacaoProblemaN2,
  equacaoProblemaN3,
  inequacaoN1,
  inequacaoN2,
  inequacaoN3,
]
