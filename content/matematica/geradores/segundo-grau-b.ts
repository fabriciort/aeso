import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Exercícios da unidade 3 de Álgebra e Funções, parte B. Aula 5, a fórmula;
// aula 6, o discriminante; aula 7, problemas do 2º grau.
//
// O teclado só digita números. Por isso os itens pedem um número (a maior
// ou a menor raiz, o valor do discriminante, quantas raízes há, o lado de
// um terreno) ou dão a fórmula montada como opções de `escolha`, em TeX. Os
// coeficientes saem das raízes, escolhidas antes, para as contas darem
// números que o aluno digita (inteiros, ou decimais com uma casa). Erros com
// resposta negativa se escrevem com o menos verdadeiro (−5), e os decimais
// com vírgula (−2,5).

// ---------------------------------------------------------------- ferramentas

/** Espaço que não quebra, entre o número e a unidade. */
const NB = ' '

/** O número como o aluno o digita, com o menos verdadeiro e a vírgula: −12, 0,5, −2,25. */
function num(n: number): string {
  const v = Math.round(n * 10000) / 10000
  const t = String(Math.abs(v)).replace('.', ',')
  return v < 0 ? `−${t}` : t
}

/** A resposta: inteira como número; decimal como texto com vírgula. */
const resposta = (n: number): number | string => (Number.isInteger(n) ? n : num(n))

/** Um termo em TeX, sem o sinal: (3, 2) → '3x^2'; (1, 1) → 'x'; (5, 0) → '5'. */
function corpo(k: number, e: number): string {
  const a = Math.abs(k)
  if (e === 0) return String(a)
  return `${a === 1 ? '' : a}${e === 1 ? 'x' : 'x^2'}`
}

/** ax² + bx + c = 0 em TeX, sem os termos nulos: '2x^2 - 5x + 3 = 0'. */
function equacao(a: number, b: number, c: number): string {
  const ts: [number, number][] = ([[a, 2], [b, 1], [c, 0]] as [number, number][]).filter(([k]) => k !== 0)
  const p = ts.map(([k, e], i) => (i === 0 ? `${k < 0 ? '-' : ''}${corpo(k, e)}` : `${k < 0 ? ' - ' : ' + '}${corpo(k, e)}`)).join('')
  return `${p} = 0`
}

/** O número dentro do TeX, com parênteses se for negativo: (−3) vira '(-3)'. */
const par = (n: number) => (n < 0 ? `(${n})` : String(n))

/** Erros previsíveis (como o aluno digitaria), sem a certa e sem repetir. */
function mapa(certa: number, pares: [number, string | undefined][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (!erro || !Number.isFinite(valor) || Math.abs(valor - certa) < 1e-9) continue
    const k = num(valor)
    if (k in erros) continue
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

/** Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada, embaralhada. Cada opção é TeX sem os cifrões. */
function escolha(r: Rng, opcoes: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const ordem = embaralha(r, opcoes.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = opcoes[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => `$${opcoes[o][0]}$`), resposta: ordem.indexOf(0), erros }
}

/** Um inteiro de `de` a `ate`, com o sinal sorteado. */
const comSinal = (r: Rng, de: number, ate: number) => r.int(de, ate) * (r.int(0, 1) === 0 ? 1 : -1)

/** A maior ou a menor de duas raízes. */
const qual = (maior: boolean, x: number, y: number) => (maior ? Math.max(x, y) : Math.min(x, y))

/** Quantas raízes, pelo sinal do discriminante. */
const quantas = (d: number) => (d > 0 ? 2 : d === 0 ? 1 : 0)

// ---------------------------------------------------------------- aula 5: a fórmula

export const formulaN1: Gerador = {
  id: 'segundo-grau-formula-n1',
  aula: 'AF.U3.A5',
  nivel: 1,
  gerar(r) {
    // x² + 2mx + c = 0 com raízes −m ± d: os azulejos de x² + 2mx = −c no palco.
    const m = r.int(1, 3)
    let d = r.int(1, 6)
    if (d === m) d = m === 6 ? 5 : m + 1
    const b = 2 * m
    const c = m * m - d * d
    const maior = d - m
    const menor = -m - d
    const delta = b * b - 4 * c
    const eq = equacao(1, b, c)
    const visual: Visual = {
      modelo: 'livre',
      estado: { azulejos: { completar: b, igual: -c } },
      esboco: `Os azulejos de x² + ${b}x, soltos: o x² e ${b} barras. Embaixo, x² + ${b}x = ${num(-c)}.`,
    }
    return {
      enunciado: `Resolva $${eq}$ pela fórmula (ou completando o quadrado). Qual é a **maior** raiz?`,
      formato: 'numero',
      resposta: maior,
      sinal: true,
      erros: mapa(maior, [
        [m + d, 'formula-sinal-do-b'],
        [-2 * m + d, 'divide-so-a-raiz'],
        [2 * maior, 'esquece-de-dividir'],
        [menor, 'responde-outra-pergunta'],
      ]),
      dicas: [
        `A fórmula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$, com a = 1, b = ${b} e c = ${num(c)}.`,
        `Embaixo da raiz: $${b}^2 - 4 \\cdot 1 \\cdot ${par(c)} = ${delta}$, e $\\sqrt{${delta}} = ${2 * d}$.`,
        `$x = \\frac{-${b} \\pm ${2 * d}}{2}$: ${num(maior)} ou ${num(menor)}. A maior é ${num(maior)}.`,
      ],
      visual,
    }
  },
}

export const formulaN2: Gerador = {
  id: 'segundo-grau-formula-n2',
  aula: 'AF.U3.A5',
  nivel: 2,
  gerar(r) {
    // a(x − p)(x − q) = 0 com b ou c negativo: a fórmula montada, contra o +b, o sinal do c e a raiz dividida sozinha.
    // Tentativas limitadas, com uma saída fixa: o rng de borda repete sempre o mesmo sorteio.
    let a = 1
    let p = 3
    let q = -1
    for (let i = 0; i < 30; i++) {
      const a1 = r.int(1, 2)
      const p1 = comSinal(r, 1, 6)
      const q1 = comSinal(r, 1, 6)
      const b1 = -a1 * (p1 + q1)
      const c1 = a1 * p1 * q1
      if (p1 === q1 || b1 === 0 || (b1 > 0 && c1 > 0)) continue
      a = a1
      p = p1
      q = q1
      break
    }
    const b = -a * (p + q)
    const c = a * p * q
    const delta = b * b - 4 * a * c
    const errado = b * b + 4 * a * c
    const certa = `\\frac{${-b} \\pm \\sqrt{${delta}}}{${2 * a}}`
    return {
      enunciado: `Pela fórmula, as raízes de $${equacao(a, b, c)}$ são:`,
      formato: 'escolha',
      ...escolha(r, [
        [certa, undefined],
        [`\\frac{${b} \\pm \\sqrt{${delta}}}{${2 * a}}`, 'formula-sinal-do-b'],
        [`\\frac{${-b} \\pm \\sqrt{${errado}}}{${2 * a}}`, c < 0 ? 'sinais-iguais-da-negativo' : 'termo-perde-o-sinal'],
        [`${-b} \\pm \\frac{\\sqrt{${delta}}}{${2 * a}}`, 'divide-so-a-raiz'],
      ]),
      dicas: [
        `Leia a, b e c com o sinal: a = ${a}, b = ${num(b)}, c = ${num(c)}.`,
        `$b^2 - 4ac = ${par(b)}^2 - 4 \\cdot ${a} \\cdot ${par(c)} = ${delta}$, e $-b = ${-b}$.`,
        `$x = ${certa}$: ${num(Math.max(p, q))} ou ${num(Math.min(p, q))}. O 2a divide tudo.`,
      ],
    }
  },
}

export const formulaN3: Gerador = {
  id: 'segundo-grau-formula-n3',
  aula: 'AF.U3.A5',
  nivel: 3,
  gerar(r) {
    // (2x − p)(x − s) = 2x² − (p + 2s)x + ps, com p ímpar: as raízes s e p/2 (um decimal com uma casa).
    const s = comSinal(r, 1, 5)
    const p = comSinal(r, 0, 4) * 2 + (r.int(0, 1) === 0 ? 1 : -1)
    const a = 2
    const b = -(p + 2 * s)
    const c = p * s
    const raizes: [number, number] = [s, p / 2]
    const maior = r.int(0, 1) === 0
    const certa = qual(maior, ...raizes)
    const delta = b * b - 4 * a * c
    const raiz = Math.abs(p - 2 * s)
    return {
      enunciado: `Resolva $${equacao(a, b, c)}$. Qual é a **${maior ? 'maior' : 'menor'}** raiz?`,
      formato: 'numero',
      resposta: resposta(certa),
      sinal: true,
      erros: mapa(certa, [
        [qual(maior, -s, -p / 2), 'formula-sinal-do-b'],
        [qual(maior, -b + raiz / 4, -b - raiz / 4), 'divide-so-a-raiz'],
        [qual(maior, 4 * s, 2 * p), 'esquece-de-dividir'],
        [qual(!maior, ...raizes), 'responde-outra-pergunta'],
      ]),
      dicas: [
        `A fórmula, com a = 2, b = ${num(b)} e c = ${num(c)}. O 2a vale 4.`,
        `$b^2 - 4ac = ${par(b)}^2 - 4 \\cdot 2 \\cdot ${par(c)} = ${delta}$, e $\\sqrt{${delta}} = ${raiz}$.`,
        `$x = \\frac{${-b} \\pm ${raiz}}{4}$: ${num(Math.max(...raizes))} ou ${num(Math.min(...raizes))}. A ${maior ? 'maior' : 'menor'} é ${num(certa)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: o discriminante

export const discriminanteN1: Gerador = {
  id: 'segundo-grau-discriminante-n1',
  aula: 'AF.U3.A6',
  nivel: 1,
  gerar(r) {
    // x² + 2mx + c = 0, ou x² + 2mx = −c nos azulejos: completo, (x + m)² = m² − c.
    const m = r.int(1, 3)
    const caso = r.pick(['negativo', 'zero', 'positivo'] as const)
    let k = caso === 'zero' ? 0 : caso === 'negativo' ? -r.int(1, 9) : r.int(1, 20)
    // c = 0 deixaria a equação sem o termo sem x: com k = m², passa para m² + 1.
    if (k === m * m) k += 1
    const b = 2 * m
    const c = m * m - k
    const n = quantas(k)
    const erros: [number, string][] =
      caso === 'negativo' ? [[2, 'raiz-de-numero-negativo']] : caso === 'zero' ? [[0, 'discriminante-zero-nenhuma-raiz'], [2, 'discriminante-zero-da-duas']] : []
    const visual: Visual = {
      modelo: 'livre',
      estado: { azulejos: { completar: b, igual: -c } },
      esboco: `Os azulejos de x² + ${b}x, soltos: o x² e ${b} barras. Embaixo, x² + ${b}x = ${num(-c)}.`,
    }
    return {
      enunciado: `Quantas raízes tem $${equacao(1, b, c)}$?`,
      formato: 'numero',
      resposta: n,
      erros: mapa(n, erros),
      dicas: [
        `Complete o quadrado: as ${b} barras se partem em ${m} e ${m}, e falta um canto de ${m * m}.`,
        `$x^2 + ${b}x + ${m * m} = ${-c} + ${m * m}$: $(x + ${m})^2 = ${k}$. Ou: $\\Delta = ${b}^2 - 4 \\cdot ${par(c)} = ${4 * k}$.`,
        k > 0 ? `${k} é positivo: há dois números com quadrado ${k}. Duas raízes.` : k === 0 ? `Só 0 ao quadrado dá 0: $x + ${m} = 0$. Uma raiz.` : `Nenhum quadrado tem área negativa: nenhuma raiz.`,
      ],
      visual,
    }
  },
}

export const discriminanteN2: Gerador = {
  id: 'segundo-grau-discriminante-n2',
  aula: 'AF.U3.A6',
  nivel: 2,
  gerar(r) {
    // Δ = b² − 4ac com b ou c negativo (o caso que pega).
    // Tentativas limitadas, com uma saída fixa: o rng de borda repete sempre o mesmo sorteio.
    let a = 1
    let b = -4
    let c = -5
    for (let i = 0; i < 30; i++) {
      const a1 = r.int(1, 3)
      const b1 = comSinal(r, 1, 9)
      const c1 = comSinal(r, 1, 9)
      if (b1 > 0 && c1 > 0) continue
      a = a1
      b = b1
      c = c1
      break
    }
    const delta = b * b - 4 * a * c
    const erros: [number, string | undefined][] = [
      [b < 0 ? -b * b - 4 * a * c : NaN, 'potencia-sinal-fora-dos-parenteses'],
      [c < 0 ? b * b + 4 * a * c : NaN, 'sinais-iguais-da-negativo'],
      [2 * b - 4 * a * c, 'potencia-multiplica-base-pelo-expoente'],
    ]
    return {
      enunciado: `Quanto vale o discriminante $\\Delta = b^2 - 4ac$ de $${equacao(a, b, c)}$?`,
      formato: 'numero',
      resposta: delta,
      sinal: true,
      erros: mapa(delta, erros),
      dicas: [
        `Leia com o sinal: a = ${a}, b = ${num(b)}, c = ${num(c)}.`,
        `$b^2 = ${par(b)}^2 = ${b * b}$ e $-4ac = -4 \\cdot ${a} \\cdot ${par(c)} = ${-4 * a * c}$.`,
        `$\\Delta = ${b * b} ${-4 * a * c < 0 ? '-' : '+'} ${Math.abs(4 * a * c)} = ${delta}$.`,
      ],
    }
  },
}

/** Equações de saída para o nível 3, uma por caso: [a, b, c]. */
const SAIDA: Record<'negativo' | 'zero' | 'positivo', [number, number, number]> = {
  negativo: [2, -4, 3],
  zero: [4, -4, 1],
  positivo: [3, 5, -2],
}

export const discriminanteN3: Gerador = {
  id: 'segundo-grau-discriminante-n3',
  aula: 'AF.U3.A6',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 2) === 0) {
      // x² + bx + □ = 0 com uma raiz só: o canto (b/2)².
      const m = comSinal(r, 1, 6)
      const b = 2 * m
      const certa = m * m
      return {
        enunciado: `Que número no lugar do $\\square$ faz $x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x + \\square = 0$ ter **uma** raiz só?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [b * b, 'completa-com-b-ao-quadrado'],
          [Math.abs(m), 'completa-com-a-metade'],
        ]),
        dicas: [
          'Uma raiz só: o discriminante é zero, e a equação é um quadrado perfeito.',
          `$\\Delta = ${par(b)}^2 - 4 \\cdot \\square = 0$: $4 \\cdot \\square = ${b * b}$. Ou: o canto do quadrado tem lado ${Math.abs(m)}.`,
          `$\\square = ${certa}$: $x^2 ${b < 0 ? '-' : '+'} ${Math.abs(b)}x + ${certa} = (x ${m < 0 ? '-' : '+'} ${Math.abs(m)})^2$.`,
        ],
      }
    }
    // Quantas raízes, com a diferente de 1.
    const caso = r.pick(['negativo', 'zero', 'positivo'] as const)
    let [a, b, c] = SAIDA[caso]
    if (caso === 'zero') {
      // k(px + q)²: a = kp², b = 2kpq, c = kq².
      const [k, p] = r.pick([[2, 1], [1, 2], [3, 1]] as const)
      const q = comSinal(r, 1, 4)
      a = k * p * p
      b = 2 * k * p * q
      c = k * q * q
    } else {
      // Tentativas limitadas, com a saída fixa de SAIDA.
      for (let i = 0; i < 30; i++) {
        const a1 = r.int(2, 4)
        const b1 = comSinal(r, 1, 8)
        const c1 = comSinal(r, 1, 9)
        const d1 = b1 * b1 - 4 * a1 * c1
        if ((caso === 'negativo') !== d1 < 0 || d1 === 0) continue
        a = a1
        b = b1
        c = c1
        break
      }
    }
    const delta = b * b - 4 * a * c
    const n = quantas(delta)
    const erros: [number, string][] =
      n === 0 ? [[2, 'raiz-de-numero-negativo']] : n === 1 ? [[0, 'discriminante-zero-nenhuma-raiz'], [2, 'discriminante-zero-da-duas']] : c < 0 && b * b + 4 * a * c < 0 ? [[0, 'sinais-iguais-da-negativo']] : []
    return {
      enunciado: `Sem resolver: quantas raízes tem $${equacao(a, b, c)}$?`,
      formato: 'numero',
      resposta: n,
      erros: mapa(n, erros),
      dicas: [
        'Calcule o discriminante $\\Delta = b^2 - 4ac$: positivo, duas raízes; zero, uma; negativo, nenhuma.',
        `a = ${a}, b = ${num(b)}, c = ${num(c)}: $\\Delta = ${b * b} ${-4 * a * c < 0 ? '-' : '+'} ${Math.abs(4 * a * c)}$.`,
        `$\\Delta = ${delta}$: ${n === 2 ? 'positivo, duas raízes' : n === 1 ? 'zero, uma raiz' : 'negativo, nenhuma raiz'}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 7: problemas do 2º grau

export const problemasN1: Gerador = {
  id: 'segundo-grau-problemas-n1',
  aula: 'AF.U3.A7',
  nivel: 1,
  gerar(r) {
    // Um terreno de x por x + k com área s(s + k): x² + kx = A.
    const s = r.int(2, 12)
    const k = r.int(1, 6)
    const area = s * (s + k)
    const visual: Visual = {
      modelo: 'retangulo',
      estado: { base: ['x', k], altura: ['x'], areas: true, total: `área: ${area}${NB}m²` },
      esboco: `O terreno: x à esquerda, x e ${k} em cima, áreas x² e ${k}x. Embaixo, ${area} m².`,
    }
    return {
      enunciado: `Um terreno retangular tem um lado ${k}${NB}m maior que o outro e área de ${area}${NB}m². Quanto mede o lado **menor**, em metros?`,
      formato: 'numero',
      resposta: s,
      sinal: true,
      erros: mapa(s, [
        [-(s + k), 'aceita-raiz-negativa-no-problema'],
        [s + k, 'responde-outra-pergunta'],
      ]),
      dicas: [
        `Chame o lado menor de x. O outro é x + ${k}, e a área é $x(x + ${k}) = ${area}$.`,
        `$x^2 + ${k}x - ${area} = 0$: dois números com soma ${k} e produto −${area}.`,
        `As raízes são ${s} e −${s + k}. Um lado não é negativo: o lado menor mede ${s}${NB}m. Confere: ${s} · ${s + k} = ${area}.`,
      ],
      visual,
    }
  },
}

/** Os lados das fotos, em centímetros. */
const FOTOS = [10, 12, 15, 18, 20, 24, 30] as const

export const problemasN2: Gerador = {
  id: 'segundo-grau-problemas-n2',
  aula: 'AF.U3.A7',
  nivel: 2,
  gerar(r) {
    // A moldura de largura w em volta de uma foto de p por q: (p + 2x)(q + 2x) = A.
    let p = 20
    let q = 10
    for (let i = 0; i < 20; i++) {
      const p1 = r.pick(FOTOS)
      const q1 = r.pick(FOTOS)
      if (p1 > q1) {
        p = p1
        q = q1
        break
      }
    }
    const w = r.int(1, 6)
    const area = (p + 2 * w) * (q + 2 * w)
    const negativa = -(p + q) / 2 - w
    // Com a moldura de um lado só, (p + x)(q + x) = A: a raiz positiva.
    const umLado = (-(p + q) + Math.sqrt((p - q) ** 2 + 4 * area)) / 2
    const erros: [number, string | undefined][] = [[negativa, 'aceita-raiz-negativa-no-problema']]
    if (Number.isInteger(umLado * 2)) erros.push([umLado, 'moldura-so-de-um-lado'])
    return {
      enunciado: `Uma foto de ${p}${NB}cm por ${q}${NB}cm ganhou uma moldura de largura x. O quadro inteiro tem ${area}${NB}cm². Quanto mede x, em centímetros?`,
      formato: 'numero',
      resposta: w,
      sinal: true,
      erros: mapa(w, erros),
      dicas: [
        `A moldura está dos dois lados: o quadro mede $(${p} + 2x)$ por $(${q} + 2x)$.`,
        `$(${p} + 2x)(${q} + 2x) = ${area}$ dá $4x^2 + ${2 * (p + q)}x - ${area - p * q} = 0$.`,
        `As raízes são ${w} e ${num(negativa)}. A largura é ${w}${NB}cm: ${p + 2 * w} · ${q + 2 * w} = ${area}.`,
      ],
    }
  },
}

export const problemasN3: Gerador = {
  id: 'segundo-grau-problemas-n3',
  aula: 'AF.U3.A7',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Dois números positivos e diferentes, u < v, com soma e produto dados.
      const u = r.int(1, 9)
      const v = u + r.int(1, 8)
      const s = u + v
      const prod = u * v
      return {
        enunciado: `Dois números somam ${s} e o produto deles é ${prod}. Qual é o **maior**?`,
        formato: 'numero',
        resposta: v,
        erros: mapa(v, [[u, 'responde-outra-pergunta']]),
        dicas: [
          `Chame um de x. O outro é ${s} − x, e $x(${s} - x) = ${prod}$.`,
          `$x^2 - ${s}x + ${prod} = 0$: dois números com soma ${s} e produto ${prod}.`,
          `$(x - ${u})(x - ${v}) = 0$: x = ${u} ou x = ${v}. As duas dão o par ${u} e ${v}; o maior é ${v}.`,
        ],
      }
    }
    // O quadrado que cresce: (x + k)² = n², com n > k.
    const k = r.int(1, 6)
    const n = k + r.int(1, 9)
    const area = n * n
    const semMeio = Math.sqrt(area - k * k)
    const erros: [number, string | undefined][] = [
      [-n - k, 'aceita-raiz-negativa-no-problema'],
      [n, 'responde-outra-pergunta'],
    ]
    if (Number.isInteger(semMeio)) erros.push([semMeio, 'quadrado-da-soma-sem-o-meio'])
    return {
      enunciado: `O lado de um quadrado mede x metros. Aumentando o lado em ${k}${NB}m, a área passa a ser ${area}${NB}m². Quanto mede x, em metros?`,
      formato: 'numero',
      resposta: n - k,
      sinal: true,
      erros: mapa(n - k, erros),
      dicas: [
        `O lado novo é x + ${k}, e a área nova é $(x + ${k})^2 = ${area}$.`,
        `$x + ${k} = ${n}$ ou $x + ${k} = -${n}$, porque $${n}^2 = ${area}$.`,
        `x = ${n - k} ou x = −${n + k}. Um lado não é negativo: x = ${n - k}${NB}m.`,
      ],
    }
  },
}

export const GERADORES_AF_U03B: Gerador[] = [
  formulaN1,
  formulaN2,
  formulaN3,
  discriminanteN1,
  discriminanteN2,
  discriminanteN3,
  problemasN1,
  problemasN2,
  problemasN3,
]
