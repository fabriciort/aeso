import type { Gerador, Rng, Visual } from '@/lib/formation/schema'

// Exercícios da unidade 3 de Álgebra e Funções, parte A. Aula 1, x² = k tem
// duas raízes; aula 2, produto igual a zero; aula 3, resolver por
// fatoração; aula 4, completar o quadrado.
//
// O teclado só digita números. Por isso os itens pedem uma raiz ("Qual é a
// maior raiz?", "Qual é a menor raiz?"), quantas raízes há, a soma das
// raízes ou o número que completa o quadrado. Os coeficientes saem das
// raízes, escolhidas inteiras, para as contas darem números que o aluno
// digita. Todo polinômio é uma lista de termos [coeficiente, expoente],
// escrita por `poli` na ordem da lista (do grau maior para o menor). Erros
// com resposta negativa se escrevem com o menos verdadeiro (−5). Os sorteios
// com condição têm tentativas limitadas e uma saída fixa: o rng de borda,
// que repete sempre o mesmo número, também termina.

// ---------------------------------------------------------------- ferramentas

/** Um termo: [coeficiente, expoente de x]. [−5, 1] é −5x. */
type Termo = [number, number]

/** O número como se escreve no texto, com o menos verdadeiro: −12. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))

/** A parte com x em TeX: '', 'x', 'x^2'. */
const potencia = (e: number) => (e === 0 ? '' : e === 1 ? 'x' : `x^${e}`)

/** Um termo em TeX, sem o sinal: (3, 2) → '3x^2'; (1, 1) → 'x'; (5, 0) → '5'. */
function corpo(k: number, e: number): string {
  const a = Math.abs(k)
  if (e === 0) return String(a)
  return `${a === 1 ? '' : a}${potencia(e)}`
}

/** Um monômio em TeX: (−3, 1) → '-3x'. */
const mono = (k: number, e: number) => `${k < 0 ? '-' : ''}${corpo(k, e)}`

/** Os termos em TeX, na ordem da lista: [[1, 2], [−5, 1], [6, 0]] → 'x^2 - 5x + 6'. */
function poli(termos: Termo[]): string {
  const ts = termos.filter(([k]) => k !== 0)
  if (!ts.length) return '0'
  return ts.map(([k, e], i) => (i === 0 ? mono(k, e) : `${k < 0 ? ' - ' : ' + '}${corpo(k, e)}`)).join('')
}

/** O binômio x ± a em TeX: 'x + 3', 'x - 2'; com a = 0, só 'x'. */
const xMais = (a: number) => (a === 0 ? 'x' : `x ${a < 0 ? '-' : '+'} ${Math.abs(a)}`)

/** O binômio kx ± m em TeX: '2x - 6'. */
const kxMais = (k: number, m: number) => `${k === 1 ? '' : k}x ${m < 0 ? '-' : '+'} ${Math.abs(m)}`

/** Um fator de produto em TeX: x sozinho fica sem parênteses, os outros entre parênteses. */
const fator = (a: number) => (a === 0 ? 'x' : `(${xMais(a)})`)

/** O trinômio x² + bx + c em TeX. */
const trinomio = (b: number, c: number) => poli([[1, 2], [b, 1], [c, 0]])

/**
 * Erros previsíveis (como o aluno digitaria), sem a certa, sem os valores de
 * `fora` (as outras raízes, que não são erro) e sem repetir: o primeiro par
 * de um valor é o que vale.
 */
function mapa(certa: number, pares: [number, string | undefined][], fora: number[] = []): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    const k = num(valor)
    if (!erro || valor === certa || fora.includes(valor) || k in erros) continue
    erros[k] = erro
  }
  return erros
}

/** Um inteiro de `de` a `ate`, com o sinal sorteado. */
const comSinal = (r: Rng, de: number, ate: number) => r.int(de, ate) * (r.int(0, 1) === 0 ? 1 : -1)

/** A maior ou a menor de duas raízes, sorteada: a palavra e o valor. */
function extremo(r: Rng, raizes: number[]): { qual: 'maior' | 'menor'; valor: number; outra: number } {
  const maior = r.int(0, 1) === 0
  const [lo, hi] = [Math.min(...raizes), Math.max(...raizes)]
  return maior ? { qual: 'maior', valor: hi, outra: lo } : { qual: 'menor', valor: lo, outra: hi }
}

/**
 * Duas raízes inteiras diferentes, nenhuma zero, sem serem opostas (para o
 * erro do sinal trocado nunca cair na outra raiz). Saída fixa: 2 e −3.
 */
function duasRaizes(r: Rng, ate: number): [number, number] {
  for (let i = 0; i < 20; i++) {
    const a = comSinal(r, 1, ate)
    const b = comSinal(r, 1, ate)
    if (Math.abs(a) !== Math.abs(b)) return [a, b]
  }
  return [2, -3]
}

// ---------------------------------------------------------------- aula 1: x² = k tem duas raízes

export const duasRaizesN1: Gerador = {
  id: 'segundo-grau-duas-raizes-n1',
  aula: 'AF.U3.A1',
  nivel: 1,
  gerar(r) {
    // x² = n²: a raiz negativa, −n.
    const n = r.int(2, 12)
    const k = n * n
    const visual: Visual = {
      modelo: 'retangulo',
      estado: { base: ['x'], altura: ['x'], areas: [[String(k)]], total: `x² = ${k}` },
      esboco: `O quadrado de lado x com ${k} dentro, e x² = ${k} embaixo. O lado é a raiz positiva; a pergunta é a outra.`,
    }
    return {
      enunciado: `Qual é a menor raiz de $x^2 = ${k}$?`,
      formato: 'numero',
      resposta: -n,
      sinal: true,
      erros: mapa(-n, [
        [n, 'raiz-so-positiva'],
        ...(k % 2 === 0 ? ([[-k / 2, 'raiz-e-a-metade'], [k / 2, 'raiz-e-a-metade']] as [number, string][]) : []),
      ]),
      dicas: [
        'Um número e o seu **oposto** têm o mesmo quadrado: menos vezes menos dá mais.',
        `Que número vezes ele mesmo dá ${k}? E o oposto dele?`,
        `$${n}^2 = ${k}$ e $(-${n})^2 = ${k}$: as raízes são ${n} e −${n}. A menor é −${n}.`,
      ],
      visual,
    }
  },
}

export const duasRaizesN2: Gerador = {
  id: 'segundo-grau-duas-raizes-n2',
  aula: 'AF.U3.A1',
  nivel: 2,
  gerar(r) {
    // (x + a)² = n²: x + a = ±n, x = −a ± n. Com n ≠ |a|, as raízes não se confundem com os erros.
    const a = comSinal(r, 1, 6)
    let n = r.int(2, 9)
    if (n === Math.abs(a)) n = n === 9 ? 2 : n + 1
    const k = n * n
    const raizes = [-a + n, -a - n]
    const { qual, valor } = extremo(r, raizes)
    // Só o ramo positivo (x + a = n) dá a outra raiz: com "menor", é o erro. Desfazer o + a somando a: x = a ± n.
    const erros = mapa(
      valor,
      qual === 'menor'
        ? [
            [-a + n, 'raiz-so-positiva'],
            [a - n, 'desfaz-com-a-mesma-operacao'],
          ]
        : [[a + n, 'desfaz-com-a-mesma-operacao']],
    )
    const eq = `(${xMais(a)})^2 = ${k}`
    return {
      enunciado: `Qual é a ${qual} raiz de $${eq}$?`,
      formato: 'numero',
      resposta: valor,
      sinal: true,
      erros,
      dicas: [
        `O que está ao quadrado é $${xMais(a)}$: ele vale a raiz de ${k} **ou** o oposto dela.`,
        `$${xMais(a)} = ${n}$ ou $${xMais(a)} = -${n}$. Agora desfaça o ${a > 0 ? `+ ${a}` : `− ${-a}`} dos dois lados.`,
        `x = ${num(-a + n)} ou x = ${num(-a - n)}. A ${qual} é ${num(valor)}.`,
      ],
    }
  },
}

export const duasRaizesN3: Gerador = {
  id: 'segundo-grau-duas-raizes-n3',
  aula: 'AF.U3.A1',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Quantas raízes tem x² + a = b? Depende do sinal de b − a.
      const a = r.int(2, 20)
      const tipo = r.int(0, 2)
      const k = tipo === 0 ? -r.int(1, 15) : tipo === 1 ? 0 : r.int(1, 7) ** 2
      const b = a + k
      const certa = k > 0 ? 2 : k === 0 ? 1 : 0
      return {
        enunciado: `Quantas raízes tem $x^2 + ${a} = ${b}$?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, k > 0 ? [[1, 'raiz-so-positiva']] : k < 0 ? [[2, 'raiz-de-numero-negativo']] : []),
        dicas: [
          'Deixe o $x^2$ sozinho. Um quadrado positivo tem duas raízes; o 0, uma; um negativo, nenhuma.',
          `Tire ${a} dos dois lados: $x^2 = ${b - a}$.`,
          k > 0
            ? `$x^2 = ${k}$: duas raízes, uma positiva e uma negativa.`
            : k === 0
              ? '$x^2 = 0$: só o 0. Uma raiz.'
              : `$x^2 = ${k}$: nenhum número ao quadrado dá negativo. Nenhuma raiz.`,
        ],
      }
    }
    // cx² = c·n²: x² = n², a menor raiz é −n.
    const c = r.int(2, 5)
    const n = r.int(2, 7)
    const d = c * n * n
    return {
      enunciado: `Qual é a menor raiz de $${c}x^2 = ${d}$?`,
      formato: 'numero',
      resposta: -n,
      sinal: true,
      erros: mapa(-n, [
        [n, 'raiz-so-positiva'],
        [-n * n, 'esquece-de-dividir'],
      ]),
      dicas: [
        'Primeiro deixe o $x^2$ sozinho. Depois, as duas raízes.',
        `Divida os dois lados por ${c}: $x^2 = ${n * n}$.`,
        `$x^2 = ${n * n}$ dá x = ${n} ou x = −${n}. A menor é −${n}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: produto igual a zero

export const produtoZeroN1: Gerador = {
  id: 'segundo-grau-produto-zero-n1',
  aula: 'AF.U3.A2',
  nivel: 1,
  gerar(r) {
    // (x + p)(x + q) = 0: as raízes −p e −q. O erro é copiar p e q.
    const [p, q] = duasRaizes(r, 5)
    const { qual, valor, outra } = extremo(r, [-p, -q])
    const valores = [...new Set([-p, -q, p, q, 0])].sort((x, y) => x - y)
    const visual: Visual = {
      modelo: 'livre',
      estado: { produtoZero: { fatores: [p, q], valores, marcados: valores.filter((v) => v !== -p && v !== -q) } },
      esboco: `A tabela do produto ${fator(p)}${fator(q)}, com os botões ${valores.map(num).join(', ')}. As colunas que não zeram já estão preenchidas; as das raízes, vazias.`,
    }
    return {
      enunciado: `Qual é a ${qual} raiz de $${fator(p)}${fator(q)} = 0$?`,
      formato: 'numero',
      resposta: valor,
      sinal: true,
      erros: mapa(valor, [
        [p, 'raiz-com-o-sinal-do-fator'],
        [q, 'raiz-com-o-sinal-do-fator'],
      ], [outra]),
      dicas: [
        'Um produto só dá zero quando um dos fatores é zero.',
        `Que x deixa $${xMais(p)}$ igual a zero? E $${xMais(q)}$?`,
        `$${xMais(p)} = 0$ dá x = ${num(-p)}; $${xMais(q)} = 0$ dá x = ${num(-q)}. A ${qual} é ${num(valor)}.`,
      ],
      visual,
    }
  },
}

export const produtoZeroN2: Gerador = {
  id: 'segundo-grau-produto-zero-n2',
  aula: 'AF.U3.A2',
  nivel: 2,
  gerar(r) {
    // (kx + m)(x + n) = 0, com m = −k·s: as raízes s e −n. Os erros: k·s (não dividiu), −s e n (o sinal do fator).
    const k = r.int(2, 5)
    let s = 3
    let t = -4
    for (let i = 0; i < 20; i++) {
      const s1 = comSinal(r, 1, 5)
      const t1 = comSinal(r, 1, 6)
      const valores = [s1, t1, k * s1, -s1, -t1]
      if (new Set(valores).size === valores.length) {
        s = s1
        t = t1
        break
      }
    }
    const m = -k * s
    const n = -t
    const { qual, valor, outra } = extremo(r, [s, t])
    const eq = `(${kxMais(k, m)})${fator(n)} = 0`
    return {
      enunciado: `Qual é a ${qual} raiz de $${eq}$?`,
      formato: 'numero',
      resposta: valor,
      sinal: true,
      erros: mapa(valor, [
        [k * s, 'esquece-de-dividir'],
        [-s, 'raiz-com-o-sinal-do-fator'],
        [n, 'raiz-com-o-sinal-do-fator'],
      ], [outra]),
      dicas: [
        'Iguale **cada fator** a zero e resolva cada um.',
        `$${kxMais(k, m)} = 0$ dá $${k}x = ${-m}$; $${xMais(n)} = 0$ dá x = ${num(t)}.`,
        `$${k}x = ${-m}$ dá x = ${num(s)}. As raízes são ${num(s)} e ${num(t)}; a ${qual} é ${num(valor)}.`,
      ],
    }
  },
}

export const produtoZeroN3: Gerador = {
  id: 'segundo-grau-produto-zero-n3',
  aula: 'AF.U3.A2',
  nivel: 3,
  gerar(r) {
    // Três fatores x + a (um deles pode ser só x): a soma das raízes, −(a + b + c), diferente de zero.
    let as = [-1, 2, -5]
    for (let i = 0; i < 20; i++) {
      const cand = [r.int(-6, 6), r.int(-6, 6), r.int(-6, 6)]
      const soma = cand[0] + cand[1] + cand[2]
      if (new Set(cand).size === 3 && soma !== 0) {
        as = cand
        break
      }
    }
    const raizes = as.map((a) => -a)
    const certa = raizes.reduce((x, y) => x + y, 0)
    // O fator x sozinho vem na frente: x(x − 1)(x + 2).
    const ordem = [...as.filter((a) => a === 0), ...as.filter((a) => a !== 0)]
    const eq = `${ordem.map(fator).join('')} = 0`
    return {
      enunciado: `Some as raízes de $${eq}$. Quanto dá?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [[-certa, 'raiz-com-o-sinal-do-fator']]),
      dicas: [
        'Com três fatores, vale o mesmo: o produto zera quando **um** deles é zero.',
        'Iguale cada fator a zero: cada um dá uma raiz, com o sinal contrário do número dele.',
        `As raízes são ${raizes.map(num).join(', ')}. A soma é ${num(certa)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: resolver por fatoração

/** Pares p < q de números positivos com p + q ≤ 8 e p · q ≤ 12: os azulejos de x² + (p + q)x + pq. */
const PARES_AZULEJOS: [number, number][] = [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [2, 3], [2, 4], [2, 5], [2, 6], [3, 4]]

export const fatoracaoN1: Gerador = {
  id: 'segundo-grau-fatoracao-n1',
  aula: 'AF.U3.A3',
  nivel: 1,
  gerar(r) {
    // x² + bx + c = 0 com b, c positivos: (x + p)(x + q) = 0, raízes −p e −q.
    const [p, q] = r.pick(PARES_AZULEJOS)
    const b = p + q
    const c = p * q
    const { qual, valor, outra } = extremo(r, [-p, -q])
    const visual: Visual = {
      modelo: 'livre',
      estado: { azulejos: { fatorar: [b, c] } },
      esboco: `Os azulejos de x² + ${b}x + ${c}, soltos: o x², ${b} barras e ${c} quadradinhos.`,
    }
    return {
      enunciado: `Qual é a ${qual} raiz de $${trinomio(b, c)} = 0$?`,
      formato: 'numero',
      resposta: valor,
      sinal: true,
      erros: mapa(valor, [
        [p, 'raiz-com-o-sinal-do-fator'],
        [q, 'raiz-com-o-sinal-do-fator'],
        [c, 'iguala-a-zero-sem-fatorar'],
        [-c, 'iguala-a-zero-sem-fatorar'],
      ], [outra]),
      dicas: [
        `Fatore primeiro: dois números com soma ${b} e produto ${c}.`,
        `$${trinomio(b, c)} = (x + ${p})(x + ${q})$. Agora iguale cada fator a zero.`,
        `As raízes são −${p} e −${q}. A ${qual} é ${num(valor)}.`,
      ],
      visual,
    }
  },
}

export const fatoracaoN2: Gerador = {
  id: 'segundo-grau-fatoracao-n2',
  aula: 'AF.U3.A3',
  nivel: 2,
  gerar(r) {
    const forma = r.int(0, 2)
    if (forma === 0) {
      // x² = bx: x(x − b) = 0, raízes 0 e b. Pergunta-se a raiz 0, a que a divisão por x perde.
      const b = comSinal(r, 2, 9)
      const qual = b > 0 ? 'menor' : 'maior'
      return {
        enunciado: `Qual é a ${qual} raiz de $x^2 = ${mono(b, 1)}$?`,
        formato: 'numero',
        resposta: 0,
        sinal: true,
        erros: mapa(0, [[b, 'divide-por-x-e-perde-o-zero']]),
        dicas: [
          'Não divida por x: x pode ser 0. Deixe zero de um lado e ponha x em evidência.',
          `$x^2 ${b > 0 ? '-' : '+'} ${corpo(b, 1)} = 0$, ou seja, $x(${xMais(-b)}) = 0$.`,
          `x = 0 ou x = ${num(b)}. A ${qual} é 0.`,
        ],
      }
    }
    if (forma === 1) {
      // x² − n² = 0: (x + n)(x − n) = 0, a menor raiz é −n.
      const n = r.int(2, 12)
      return {
        enunciado: `Qual é a menor raiz de $x^2 - ${n * n} = 0$?`,
        formato: 'numero',
        resposta: -n,
        sinal: true,
        erros: mapa(-n, [
          [n, 'raiz-so-positiva'],
          [-n * n, 'fatora-sem-tirar-a-raiz'],
          [n * n, 'fatora-sem-tirar-a-raiz'],
        ]),
        dicas: [
          `É uma diferença de quadrados: $x^2 - ${n * n} = (x + ${n})(x - ${n})$.`,
          `$x + ${n} = 0$ ou $x - ${n} = 0$.`,
          `x = −${n} ou x = ${n}. A menor é −${n}.`,
        ],
      }
    }
    // x² − (r + s)x + rs = 0, com sinais: (x − r)(x − s) = 0.
    const [p, q] = duasRaizes(r, 6)
    const b = -(p + q)
    const c = p * q
    const { qual, valor, outra } = extremo(r, [p, q])
    return {
      enunciado: `Qual é a ${qual} raiz de $${trinomio(b, c)} = 0$?`,
      formato: 'numero',
      resposta: valor,
      sinal: true,
      erros: mapa(valor, [
        [-p, 'raiz-com-o-sinal-do-fator'],
        [-q, 'raiz-com-o-sinal-do-fator'],
        [c, 'iguala-a-zero-sem-fatorar'],
      ], [outra]),
      dicas: [
        `Fatore: dois números com soma ${num(b)} e produto ${num(c)}.`,
        `$${trinomio(b, c)} = ${fator(-p)}${fator(-q)}$. Iguale cada fator a zero.`,
        `As raízes são ${num(p)} e ${num(q)}. A ${qual} é ${num(valor)}.`,
      ],
    }
  },
}

export const fatoracaoN3: Gerador = {
  id: 'segundo-grau-fatoracao-n3',
  aula: 'AF.U3.A3',
  nivel: 3,
  gerar(r) {
    // Arrumar antes de fatorar: x² = Bx + C ou x² + C' = Bx, com as raízes p e q.
    const [p, q] = duasRaizes(r, 7)
    const soma = p + q
    const produto = p * q
    const eq = r.int(0, 1) === 0 ? `x^2 = ${poli([[soma, 1], [-produto, 0]])}` : `${poli([[1, 2], [produto, 0]])} = ${mono(soma, 1)}`
    const { qual, valor, outra } = extremo(r, [p, q])
    const arrumada = trinomio(-soma, produto)
    return {
      enunciado: `Qual é a ${qual} raiz de $${eq}$?`,
      formato: 'numero',
      resposta: valor,
      sinal: true,
      erros: mapa(valor, [
        [-p, 'raiz-com-o-sinal-do-fator'],
        [-q, 'raiz-com-o-sinal-do-fator'],
      ], [outra]),
      dicas: [
        'Primeiro deixe **zero** de um lado, mudando os termos dos dois lados, como na balança.',
        `Fica $${arrumada} = 0$, que fatora em $${fator(-p)}${fator(-q)} = 0$.`,
        `As raízes são ${num(p)} e ${num(q)}. A ${qual} é ${num(valor)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 4: completar o quadrado

export const completarN1: Gerador = {
  id: 'segundo-grau-completar-n1',
  aula: 'AF.U3.A4',
  nivel: 1,
  gerar(r) {
    // x² + bx + (b/2)², com b par de 2 a 8 (peças legíveis no celular): os azulejos partidos mostram o canto vazio.
    const h = r.int(1, 4)
    const b = 2 * h
    const certa = h * h
    const visual: Visual = {
      modelo: 'livre',
      estado: { azulejos: { completar: b, partido: true } },
      esboco: `As ${b} barras partidas, ${h} de pé e ${h} deitadas ao redor do x², e o canto vazio de ${h} por ${h}.`,
    }
    return {
      enunciado: `Que número completa o quadrado em $x^2 + ${b}x + \\square$?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [h, 'completa-com-a-metade'],
        [b * b, 'completa-com-b-ao-quadrado'],
      ]),
      dicas: [
        'As barras se partem em duas metades ao redor do $x^2$. Falta o canto.',
        `A metade de ${b} é ${h}: o canto é ${h} por ${h}.`,
        `$${h}^2 = ${certa}$: $x^2 + ${b}x + ${certa} = (x + ${h})^2$.`,
      ],
      visual,
    }
  },
}

export const completarN2: Gerador = {
  id: 'segundo-grau-completar-n2',
  aula: 'AF.U3.A4',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Com b negativo: x² − 2hx + h². O canto continua positivo.
      const h = r.int(1, 6)
      const b = -2 * h
      const certa = h * h
      return {
        enunciado: `Que número completa o quadrado em $x^2 - ${-b}x + \\square$?`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [-certa, 'canto-do-quadrado-negativo'],
          [b * b, 'completa-com-b-ao-quadrado'],
          [h, 'completa-com-a-metade'],
          [-h, 'completa-com-a-metade'],
        ]),
        dicas: [
          'O número que completa é o quadrado da metade do número do x.',
          `A metade de ${num(b)} é ${num(-h)}.`,
          `$(-${h})^2 = ${certa}$, positivo: $x^2 - ${-b}x + ${certa} = (x - ${h})^2$.`,
        ],
      }
    }
    // O lado direito depois de completar: x² + 2hx = c vira (x + h)² = c + h².
    const h = comSinal(r, 1, 5)
    let n = r.int(1, 8)
    if (n === Math.abs(h)) n = n === 8 ? 1 : n + 1
    const c = n * n - h * h
    const certa = n * n
    const b = 2 * h
    return {
      enunciado: `Completando o quadrado, $${poli([[1, 2], [b, 1]])} = ${c}$ vira $(${xMais(h)})^2 = \\square$. Que número falta?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [c, 'opera-so-de-um-lado'],
        [c + Math.abs(h), 'completa-com-a-metade'],
        [c + b * b, 'completa-com-b-ao-quadrado'],
        [c - h * h, 'canto-do-quadrado-negativo'],
      ]),
      dicas: [
        'O canto que completa o quadrado entra **dos dois lados**, como na balança.',
        `O canto é $${h < 0 ? `(-${-h})` : h}^2 = ${h * h}$. Some ${h * h} dos dois lados.`,
        `${num(c)} + ${h * h} = ${certa}: $(${xMais(h)})^2 = ${certa}$.`,
      ],
    }
  },
}

export const completarN3: Gerador = {
  id: 'segundo-grau-completar-n3',
  aula: 'AF.U3.A4',
  nivel: 3,
  gerar(r) {
    // x² + 2hx = c, com c = n² − h²: (x + h)² = n², x = −h ± n.
    const h = comSinal(r, 1, 5)
    let n = r.int(1, 8)
    if (n === Math.abs(h)) n = n === 8 ? 1 : n + 1
    const c = n * n - h * h
    const b = 2 * h
    const raizes = [-h + n, -h - n]
    const { qual, valor } = extremo(r, raizes)
    const erros = mapa(
      valor,
      qual === 'menor'
        ? [
            [-h + n, 'raiz-so-positiva'],
            [h - n, 'desfaz-com-a-mesma-operacao'],
          ]
        : [[h + n, 'desfaz-com-a-mesma-operacao']],
    )
    return {
      enunciado: `Complete o quadrado: qual é a ${qual} raiz de $${poli([[1, 2], [b, 1]])} = ${c}$?`,
      formato: 'numero',
      resposta: valor,
      sinal: true,
      erros,
      dicas: [
        'Some o quadrado da metade do número do x dos dois lados.',
        `$${poli([[1, 2], [b, 1], [h * h, 0]])} = ${c} + ${h * h}$, ou seja, $(${xMais(h)})^2 = ${n * n}$.`,
        `$${xMais(h)} = \\pm ${n}$: x = ${num(raizes[0])} ou x = ${num(raizes[1])}. A ${qual} é ${num(valor)}.`,
      ],
    }
  },
}

export const GERADORES_AF_U03A: Gerador[] = [
  duasRaizesN1,
  duasRaizesN2,
  duasRaizesN3,
  produtoZeroN1,
  produtoZeroN2,
  produtoZeroN3,
  fatoracaoN1,
  fatoracaoN2,
  fatoracaoN3,
  completarN1,
  completarN2,
  completarN3,
]
