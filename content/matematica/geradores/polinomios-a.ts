import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 1 de Álgebra e Funções, parte A: monômios e polinômios, somar e
// subtrair polinômios, multiplicar monômios. Os polinômios aparecem em TeX,
// com a fórmula inteira entre chaves para a linha não quebrar no meio. O
// teclado só digita números: os itens pedem um coeficiente, um grau, um
// expoente ou um valor numérico, e usam "escolha" para polinômios inteiros
// (as opções erradas vêm dos erros comuns, todas diferentes da certa). Nos
// visuais do nível 1, os azulejos (com os montes e o menos na frente) e o
// retângulo por área.

// ---------------------------------------------------------------- ajudas

/** O espaço que não quebra, entre o número e a unidade. */
const NB = ' '
/** Uma fórmula inteira em TeX, entre chaves para não quebrar a linha. */
const tex = (f: string) => `\${${f}}$`
/** O número com o menos verdadeiro, para o texto fora do TeX: −3. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))
/** O número para o TeX, entre parênteses se for negativo: (−3). */
const ent = (n: number) => (n < 0 ? `(${n})` : String(n))

/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number, pares: [number | null, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([String(certa)])
  for (const [valor, erro] of pares) {
    if (valor === null) continue
    const k = String(valor)
    if (vistos.has(k)) continue
    vistos.add(k)
    erros[k] = erro
  }
  return erros
}

type Op = { texto: string; certa?: boolean; erro?: string }
/** As opções em ordem aleatória (sem repetir texto), com a resposta e o mapa de erros pelo índice. */
function embaralhar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const vistos = new Set<string>()
  const resto = opcoes.filter((o) => !vistos.has(o.texto) && vistos.add(o.texto))
  const ordem: Op[] = []
  while (resto.length) ordem.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

/** A lista embaralhada (Fisher-Yates com o rng). */
function misturar<T>(r: Rng, xs: T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Um inteiro entre min e max, nunca zero. */
const naoZero = (r: Rng, min: number, max: number) => {
  const v = r.int(min, max - 1)
  return v >= 0 ? v + 1 : v
}

// ---------------------------------------------------------------- polinômios

/** Um termo: o coeficiente e o grau (o expoente do x). */
type Termo = [number, number]

/** A parte literal em TeX: x, x^2, x^{12}; vazia no grau 0. */
function literal(g: number, l = 'x'): string {
  if (g === 0) return ''
  if (g === 1) return l
  return g < 10 ? `${l}^${g}` : `${l}^{${g}}`
}

/** O termo em TeX, sem sinal: 3x^2, x, 7. */
function corpo(k: number, g: number, l = 'x'): string {
  const a = Math.abs(k)
  if (g === 0) return String(a)
  return `${a === 1 ? '' : a}${literal(g, l)}`
}

/** Os termos na ordem dada, com os sinais: 4x + 2x^3 - 7. Zeros saem; sem termos, 0. */
function poli(ts: Termo[], l = 'x'): string {
  const vivos = ts.filter(([k]) => k !== 0)
  if (!vivos.length) return '0'
  return vivos.map(([k, g], i) => (i === 0 ? `${k < 0 ? '-' : ''}${corpo(k, g, l)}` : `${k < 0 ? ' - ' : ' + '}${corpo(k, g, l)}`)).join('')
}

/** Um monômio sozinho em TeX, com o sinal: -10x^7. */
const mono = (k: number, g: number, l = 'x') => poli([[k, g]], l)

/** Como se fala a parte literal: x, x ao quadrado, x ao cubo, x elevado a 5. */
function falaLiteral(g: number, l = 'x'): string {
  if (g === 1) return l
  if (g === 2) return `${l} ao quadrado`
  if (g === 3) return `${l} ao cubo`
  return `${l} elevado a ${g}`
}
function falaCorpo(k: number, g: number, l = 'x'): string {
  const a = Math.abs(k)
  if (g === 0) return String(a)
  return a === 1 ? falaLiteral(g, l) : `${a} ${falaLiteral(g, l)}`
}
/** Os termos falados: 4 x mais 2 x ao cubo menos 7. */
function falaPoli(ts: Termo[], l = 'x'): string {
  const vivos = ts.filter(([k]) => k !== 0)
  if (!vivos.length) return 'zero'
  return vivos.map(([k, g], i) => (i === 0 ? `${k < 0 ? 'menos ' : ''}${falaCorpo(k, g, l)}` : `${k < 0 ? ' menos ' : ' mais '}${falaCorpo(k, g, l)}`)).join('')
}

/** Junta os termos semelhantes e põe do maior grau para o menor. */
function simplifica(ts: Termo[]): Termo[] {
  const por = new Map<number, number>()
  for (const [k, g] of ts) por.set(g, (por.get(g) ?? 0) + k)
  return [...por.entries()].filter(([, k]) => k !== 0).sort((a, b) => b[0] - a[0]).map(([g, k]) => [k, g])
}

/** O oposto: cada termo com o sinal trocado. */
const oposto = (ts: Termo[]): Termo[] => ts.map(([k, g]) => [-k, g])
/** O coeficiente do grau g (0 se não houver). */
const coef = (ts: Termo[], g: number) => ts.filter(([, h]) => h === g).reduce((s, [k]) => s + k, 0)
/** O valor dos termos com x = v. */
const valorEm = (ts: Termo[], v: number) => ts.reduce((s, [k, g]) => s + k * v ** g, 0)

/** O polinômio em TeX entre parênteses, como parte de uma conta. */
const par = (ts: Termo[]) => `(${poli(ts)})`

// ---------------------------------------------------------------- visuais

const az = (pecas: string[], extra: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { azulejos: { pecas, ...extra } }, esboco })
const ret = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'retangulo', estado, esboco })
const exp = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** As peças de um polinômio de grau até 2, em ordem: x² e −x², depois x e −x, depois 1 e −1. */
function pecasDe(ts: Termo[]): string[] {
  const out: string[] = []
  for (const g of [2, 1, 0]) {
    const k = coef(ts, g)
    const nome = g === 2 ? 'x²' : g === 1 ? 'x' : '1'
    for (let i = 0; i < Math.abs(k); i++) out.push(k < 0 ? `−${nome}` : nome)
  }
  return out
}

// ---------------------------------------------------------------- aula 1: monômios e polinômios

/** Um polinômio de grau até 2 com coeficientes positivos, como os azulejos: a x² + b x + c. */
function mesa(r: Rng, umQuadrado = false): Termo[] {
  const a = umQuadrado ? 1 : r.int(1, 2)
  const b = r.int(1, 4)
  const c = r.int(1, 5)
  return [[a, 2], [b, 1], [c, 0]]
}

export const termosN1: Gerador = {
  id: 'polinomios-termos-n1',
  aula: 'AF.U1.A1',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Que polinômio as peças formam?
      const ts = mesa(r)
      const [[a], [b], [c]] = ts
      const pecas = misturar(r, pecasDe(ts))
      const opcoes: Op[] = [
        { texto: tex(poli(ts)), certa: true },
        { texto: tex(poli([[a + b + c, 1]])), erro: 'junta-termos-nao-semelhantes' },
        { texto: tex(poli([[a + b, 2], [c, 0]])), erro: 'junta-termos-nao-semelhantes' },
      ]
      if (b !== c) opcoes.push({ texto: tex(poli([[a, 2], [c, 1], [b, 0]])) })
      return {
        enunciado: 'Junte as peças iguais. Que polinômio elas formam?',
        formato: 'escolha',
        ...embaralhar(r, opcoes),
        dicas: [
          'Cada tipo de peça é um termo: quadrados grandes, barras e quadradinhos.',
          `Conte cada tipo: ${a} quadrado${a > 1 ? 's' : ''} grande${a > 1 ? 's' : ''}, ${b} barra${b > 1 ? 's' : ''} e ${c} quadradinho${c > 1 ? 's' : ''}.`,
          `As peças formam ${tex(poli(ts))}.`,
        ],
        visual: az(pecas, {}, `As peças misturadas: ${a} quadrado(s) grande(s), ${b} barra(s) e ${c} quadradinho(s).`),
      }
    }
    if (tipo === 1) {
      // O coeficiente de x: quantas barras.
      const ts = mesa(r)
      const [[a], [b], [c]] = ts
      const pecas = misturar(r, pecasDe(ts))
      return {
        enunciado: 'Junte as peças iguais. Qual é o coeficiente de $x$?',
        fala: 'Junte as peças iguais. Qual é o coeficiente de x?',
        formato: 'numero',
        resposta: b,
        erros: mapa(b, [[a + b + c, 'junta-termos-nao-semelhantes']]),
        dicas: [
          `O coeficiente de ${tex('x')} conta as barras.`,
          'Conte só as barras, sem os quadrados grandes e os quadradinhos.',
          `São ${b} barra${b > 1 ? 's' : ''}: ${tex(corpo(b, 1))}. O coeficiente é ${b}.`,
        ],
        visual: az(pecas, {}, `As peças misturadas, com ${b} barra(s) entre elas.`),
      }
    }
    // O 1 escondido de x².
    const ts = mesa(r, true)
    return {
      enunciado: `As peças formam ${tex(poli(ts))}. Qual é o coeficiente de ${tex('x^2')}?`,
      fala: `As peças formam ${falaPoli(ts)}. Qual é o coeficiente de x ao quadrado?`,
      formato: 'numero',
      resposta: 1,
      erros: mapa(1, [[2, 'coeficiente-e-o-expoente'], [0, 'letra-sozinha-sem-o-um']]),
      dicas: [
        `O coeficiente conta quantos quadrados grandes há.`,
        `O 2 de cima é o expoente: diz que a peça é ${tex('x \\cdot x')}.`,
        `Há um quadrado grande só: ${tex('x^2 = 1x^2')}. O coeficiente é 1.`,
      ],
      visual: az(pecasDe(ts), { agrupado: true, mostraExpressao: true }, 'As peças juntas por tipo: um quadrado grande, as barras e os quadradinhos, com o polinômio embaixo.'),
    }
  },
}

/** Três graus diferentes, o maior fora do começo, com coeficientes de sinal variado. */
function foraDeOrdem(r: Rng, n: number): Termo[] {
  const graus = misturar(r, [0, 1, 2, 3, 4]).slice(0, n)
  const max = Math.max(...graus)
  if (graus[0] === max) graus.push(graus.shift()!)
  return graus.map((g, i) => [i === 0 ? r.int(1, 9) : naoZero(r, -9, 9), g])
}

export const termosN2: Gerador = {
  id: 'polinomios-termos-n2',
  aula: 'AF.U1.A1',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // O grau fora de ordem.
      const ts = foraDeOrdem(r, 3)
      const grau = Math.max(...ts.map(([, g]) => g))
      const maiorK = Math.max(...ts.map(([k]) => Math.abs(k)))
      const maior = ts.find(([, g]) => g === grau)!
      return {
        enunciado: `Qual é o grau de ${tex(poli(ts))}?`,
        fala: `Qual é o grau de ${falaPoli(ts)}?`,
        formato: 'numero',
        resposta: grau,
        erros: mapa(grau, [
          [ts[0][1], 'grau-pelo-primeiro-termo'],
          [maiorK, 'grau-pelo-coeficiente'],
        ]),
        dicas: [
          'O grau é o maior expoente da letra, esteja ele onde estiver.',
          `Olhe o expoente de cada termo. Um número sozinho tem grau 0, e ${tex('x')} tem grau 1.`,
          `O maior expoente está em ${tex(mono(maior[0], maior[1]))}: o grau é ${grau}.`,
        ],
      }
    }
    if (tipo === 1) {
      // O coeficiente de x com sinal (às vezes o −x sozinho).
      const a = r.int(1, 6)
      const b = r.int(0, 2) === 0 ? 1 : r.int(2, 9)
      const c = naoZero(r, -9, 9)
      const ts: Termo[] = [[a, 2], [-b, 1], [c, 0]]
      const certa = -b
      return {
        enunciado: `Qual é o coeficiente de $x$ em ${tex(poli(ts))}?`,
        fala: `Qual é o coeficiente de x em ${falaPoli(ts)}?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [
          [b, 'termo-perde-o-sinal'],
          [b === 1 ? 0 : null, 'letra-sozinha-sem-o-um'],
        ]),
        dicas: [
          'O coeficiente é o número da frente do termo, com o sinal dele.',
          `O termo com ${tex('x')} é ${tex(mono(-b, 1))}: o menos vai junto.`,
          b === 1 ? `${tex('-x = -1x')}: o coeficiente é ${num(-1)}.` : `${tex(mono(-b, 1))}: o coeficiente é ${num(-b)}.`,
        ],
      }
    }
    // Monômio, binômio ou trinômio.
    const n = r.int(1, 3)
    const ts = foraDeOrdem(r, n)
    const nomes = ['Monômio', 'Binômio', 'Trinômio']
    return {
      enunciado: `Pelo número de termos, ${tex(poli(ts))} é um monômio, um binômio ou um trinômio?`,
      fala: `Pelo número de termos, ${falaPoli(ts)} é um monômio, um binômio ou um trinômio?`,
      formato: 'escolha',
      opcoes: nomes,
      resposta: n - 1,
      erros: {},
      dicas: [
        'Conte os termos: eles ficam separados pelos sinais de mais e de menos.',
        'Um termo é monômio, dois é binômio, três é trinômio.',
        `${n > 1 ? `São ${n} termos` : 'É 1 termo'}: é um ${nomes[n - 1].toLowerCase()}.`,
      ],
    }
  },
}

export const termosN3: Gerador = {
  id: 'polinomios-termos-n3',
  aula: 'AF.U1.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Arrumar do maior grau para o menor, com os sinais junto.
      const graus = misturar(r, [3, 2, 1, 0])
      if (graus[0] === 3) graus.push(graus.shift()!)
      const ts: Termo[] = graus.map((g, i) => [i === 0 ? r.int(1, 9) : naoZero(r, -9, 9), g])
      // Pelo menos um termo negativo, para o sinal ter de ir junto.
      if (!ts.some(([k]) => k < 0)) ts[ts.length - 1][0] = -ts[ts.length - 1][0]
      const certa = simplifica(ts)
      // Os sinais ficam no lugar da fila, e não com o termo.
      const sinais = ts.map(([k]) => Math.sign(k))
      const noLugar: Termo[] = certa.map(([k, g], i) => [Math.abs(k) * sinais[i], g])
      const semSinal: Termo[] = certa.map(([k, g]) => [Math.abs(k), g])
      return {
        enunciado: `Arrume ${tex(poli(ts))} do maior grau para o menor. Como fica?`,
        fala: `Arrume ${falaPoli(ts)} do maior grau para o menor. Como fica?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(poli(certa)), certa: true },
          { texto: tex(poli(noLugar)), erro: 'termo-perde-o-sinal' },
          { texto: tex(poli(semSinal)), erro: 'termo-perde-o-sinal' },
        ].filter((o, i) => i === 0 || o.texto !== tex(poli(certa)))),
        dicas: [
          'Do maior expoente para o menor. Cada termo leva o seu sinal.',
          `Comece pelo termo com ${tex('x^3')}, depois ${tex('x^2')}, ${tex('x')} e o número.`,
          `Fica ${tex(poli(certa))}.`,
        ],
      }
    }
    if (tipo === 1) {
      // O coeficiente de x² depois de juntar os semelhantes.
      const a = r.int(1, 7)
      let c = r.int(1, 9)
      if (c === a) c += 1
      const b = naoZero(r, -6, 6)
      const d = naoZero(r, -9, 9)
      const ts: Termo[] = [[a, 2], [b, 1], [-c, 2], [d, 0]]
      const certa = a - c
      return {
        enunciado: `Junte os termos semelhantes de ${tex(poli(ts))}. Qual é o coeficiente de ${tex('x^2')}?`,
        fala: `Junte os termos semelhantes de ${falaPoli(ts)}. Qual é o coeficiente de x ao quadrado?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [
          [a + c, 'termo-perde-o-sinal'],
          [certa < 0 ? -certa : null, 'esquece-sinal-do-resultado'],
        ]),
        dicas: [
          `Os termos com ${tex('x^2')} são semelhantes: junte os dois, com os sinais.`,
          `${tex(mono(a, 2))} e ${tex(mono(-c, 2))}: ${tex(`${a} - ${c}`)}.`,
          `${tex(`${poli([[a, 2], [-c, 2]])} = ${mono(certa, 2)}`)}. O coeficiente é ${num(certa)}.`,
        ],
      }
    }
    // O grau da área de um terreno, fora de ordem.
    const b = r.int(11, 40)
    const c = r.int(2, 9) * 50
    const ts: Termo[] = misturar(r, [[b, 1], [1, 2], [c, 0]] as Termo[])
    if (ts[0][1] === 2) ts.push(ts.shift()!)
    return {
      enunciado: `A área de um terreno, em metros quadrados, é ${tex(poli(ts))}. Qual é o grau desse polinômio?`,
      fala: `A área de um terreno, em metros quadrados, é ${falaPoli(ts)}. Qual é o grau desse polinômio?`,
      formato: 'numero',
      resposta: 2,
      erros: mapa(2, [
        [ts[0][1], 'grau-pelo-primeiro-termo'],
        [c, 'grau-pelo-coeficiente'],
        [b, 'grau-pelo-coeficiente'],
      ]),
      dicas: [
        'O grau é o maior expoente da letra.',
        `Os números grandes não contam: ${c} tem grau 0 e ${tex(corpo(b, 1))} tem grau 1.`,
        `O maior expoente é o de ${tex('x^2')}: o grau é 2.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: somar e subtrair polinômios

/** Um polinômio de grau 2 para os azulejos, com poucas peças (cabem no celular). */
function monte(r: Rng, negativos: boolean): Termo[] {
  const a = r.int(1, 2)
  const b = negativos ? naoZero(r, -3, 3) : r.int(1, 3)
  const c = negativos ? naoZero(r, -3, 3) : r.int(1, 3)
  return [[a, 2], [b, 1], [c, 0]]
}

/** P − Q como quem troca só o sinal do primeiro termo de Q. */
const soPrimeiro = (p: Termo[], q: Termo[]): Termo[] => simplifica([...p, [-q[0][0], q[0][1]], ...q.slice(1)])

/** Qual coeficiente perguntar: o de x ou o número sem letra. */
const PERGUNTA = [
  { g: 1, texto: 'o coeficiente de $x$', fala: 'o coeficiente de x' },
  { g: 0, texto: 'o número sem letra', fala: 'o número sem letra' },
] as const

export const somarN1: Gerador = {
  id: 'polinomios-somar-n1',
  aula: 'AF.U1.A2',
  nivel: 1,
  gerar(r) {
    const menos = r.int(0, 1) === 1
    const p = monte(r, false)
    const perg = r.pick(PERGUNTA)
    // A resposta nunca é zero (um coeficiente zero some do polinômio), e são até 11 peças,
    // para caberem no celular junto com o teclado. Sem sorte em 20 tentativas, um monte pequeno.
    const serve = (q: Termo[]) => coef(p, perg.g) + (menos ? -1 : 1) * coef(q, perg.g) !== 0 && pecasDe(p).length + pecasDe(q).length <= 11
    let q = monte(r, true)
    for (let t = 0; t < 20 && !serve(q); t++) q = monte(r, true)
    if (!serve(q)) q = [[1, 2], [menos ? -1 : 1, 1], [menos ? -1 : 1, 0]]
    const conta = `${par(p)} ${menos ? '-' : '+'} ${par(q)}`
    const certa = coef(menos ? simplifica([...p, ...oposto(q)]) : simplifica([...p, ...q]), perg.g)
    const pk = coef(p, perg.g)
    const qk = coef(q, perg.g)
    const pecas = [...pecasDe(p), ...pecasDe(q)]
    const montes = [pecasDe(p).length, pecasDe(q).length]
    return {
      enunciado: `${menos ? 'Tire o segundo monte do primeiro' : 'Junte os dois montes'}: ${tex(conta)}. Qual é ${perg.texto}?`,
      fala: `${menos ? 'Tire o segundo monte do primeiro' : 'Junte os dois montes'}: ${falaPoli(p)}, ${menos ? 'menos' : 'mais'}, ${falaPoli(q)}. Qual é ${perg.fala}?`,
      formato: 'numero',
      sinal: true,
      resposta: certa,
      // O primeiro termo do segundo monte é o x²: quem vira só ele deixa este coeficiente como estava.
      erros: menos ? mapa(certa, [[pk + qk, 'menos-so-no-primeiro']]) : mapa(certa, [[qk < 0 ? pk - qk : null, 'termo-perde-o-sinal']]),
      dicas: [
        menos ? 'O menos na frente do monte vira todas as peças dele.' : 'Junte as peças iguais dos dois montes. Uma peça vermelha cancela uma amarela.',
        menos
          ? `O segundo monte virado: ${tex(poli(oposto(q)))}. Agora junte.`
          : `Do primeiro monte vem ${tex(mono(pk, perg.g))}; do segundo, ${tex(mono(qk, perg.g))}.`,
        `${tex(`${pk} ${menos ? '-' : '+'} ${ent(qk)} = ${certa}`)}. A resposta é ${num(certa)}.`,
      ],
      visual: az(pecas, { montes, ...(menos ? { virar: 1 } : {}) }, menos ? 'Os dois montes; o segundo numa moldura vermelha, com um − na frente.' : 'Os dois montes lado a lado.'),
    }
  },
}

/** Um polinômio de três termos (graus 2, 1, 0) com coeficientes de sinal variado. */
function tresTermos(r: Rng, max = 6): Termo[] {
  return [[naoZero(r, -max, max), 2], [naoZero(r, -max, max), 1], [naoZero(r, -max, max), 0]]
}

export const somarN2: Gerador = {
  id: 'polinomios-somar-n2',
  aula: 'AF.U1.A2',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // A diferença inteira: quem vira só o primeiro e quem não vira nada.
      const p: Termo[] = [[r.int(2, 6), 2], [naoZero(r, -6, 6), 1], [naoZero(r, -6, 6), 0]]
      let q = tresTermos(r)
      q = [[Math.abs(q[0][0]), 2], q[1], q[2]]
      if (q[0][0] === p[0][0]) q[0][0] += 1
      const certa = simplifica([...p, ...oposto(q)])
      return {
        enunciado: `${tex(`${par(p)} - ${par(q)}`)} é igual a quê?`,
        fala: `${falaPoli(p)}, menos, o parêntese ${falaPoli(q)}, é igual a quê?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(poli(certa)), certa: true },
          { texto: tex(poli(soPrimeiro(p, q))), erro: 'menos-so-no-primeiro' },
          { texto: tex(poli(simplifica([...p, ...q]))), erro: 'ignora-o-menos-do-parentese' },
        ]),
        dicas: [
          'O menos antes do parêntese troca o sinal de todos os termos de dentro.',
          `${tex(`-${par(q)} = ${poli(oposto(q))}`)}. Agora junte com o primeiro.`,
          `${tex(`${poli(p)} ${poli(oposto(q)).startsWith('-') ? '' : '+ '}${poli(oposto(q))} = ${poli(certa)}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // Um coeficiente da diferença, sem peças.
      const p = tresTermos(r, 7)
      const q = tresTermos(r, 7)
      const g = r.int(0, 1)
      const certa = coef(p, g) - coef(q, g)
      if (certa === 0) q[2 - g][0] += q[2 - g][0] > 0 ? 1 : -1
      const resp = coef(p, g) - coef(q, g)
      const perg = PERGUNTA[1 - g]
      return {
        enunciado: `Calcule ${tex(`${par(p)} - ${par(q)}`)}. Qual é ${perg.texto}?`,
        fala: `Calcule ${falaPoli(p)}, menos, o parêntese ${falaPoli(q)}. Qual é ${perg.fala}?`,
        formato: 'numero',
        sinal: true,
        resposta: resp,
        erros: mapa(resp, [[coef(p, g) + coef(q, g), 'menos-so-no-primeiro']]),
        dicas: [
          'O menos troca o sinal de todos os termos do segundo parêntese.',
          `${tex(mono(coef(q, g), g))} vira ${tex(mono(-coef(q, g), g))}.`,
          `${tex(`${coef(p, g)} - ${ent(coef(q, g))} = ${resp}`)}. A resposta é ${num(resp)}.`,
        ],
      }
    }
    // A soma: quem soma os expoentes ou esquece o sinal.
    const p: Termo[] = [[r.int(1, 6), 2], [r.int(1, 6), 1], [naoZero(r, -6, 6), 0]]
    const q: Termo[] = [[r.int(1, 6), 2], [-r.int(1, 9), 1], [naoZero(r, -6, 6), 0]]
    if (coef(p, 1) + coef(q, 1) === 0) q[1][0] -= 1
    const certa = simplifica([...p, ...q])
    const x2 = coef(certa, 2)
    const x1 = coef(certa, 1)
    const x0 = coef(certa, 0)
    return {
      enunciado: `${tex(`${par(p)} + ${par(q)}`)} é igual a quê?`,
      fala: `${falaPoli(p)}, mais, ${falaPoli(q)}, é igual a quê?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: tex(poli(certa)), certa: true },
        { texto: tex(poli([[x2, 4], [x1, 1], [x0, 0]])), erro: 'potencia-soma-expoentes-na-adicao' },
        { texto: tex(poli([[x2, 2], [-x1, 1], [x0, 0]])), ...(x1 < 0 ? { erro: 'esquece-sinal-do-resultado' } : {}) },
      ]),
      dicas: [
        'Somar é juntar os termos semelhantes: o expoente não muda.',
        `Junte ${tex('x^2')} com ${tex('x^2')}, ${tex('x')} com ${tex('x')} e os números entre si.`,
        `Fica ${tex(poli(certa))}.`,
      ],
    }
  },
}

export const somarN3: Gerador = {
  id: 'polinomios-somar-n3',
  aula: 'AF.U1.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // O lucro: receita menos custo.
      const p = r.int(20, 60)
      const q = r.int(5, 15)
      const f = r.int(2, 10) * 50
      const receita: Termo[] = [[p, 1]]
      const custo: Termo[] = [[q, 1], [f, 0]]
      const certa = simplifica([...receita, ...oposto(custo)])
      return {
        enunciado: `Uma loja vende $x$ cadernos. A receita é ${tex(poli(receita))} reais e o custo, ${tex(poli(custo))} reais. Qual expressão dá o lucro, a receita menos o custo?`,
        fala: `Uma loja vende x cadernos. A receita é ${falaPoli(receita)} reais e o custo, ${falaPoli(custo)} reais. Qual expressão dá o lucro, a receita menos o custo?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(poli(certa)), certa: true },
          { texto: tex(poli(soPrimeiro(receita, custo))), erro: 'menos-so-no-primeiro' },
          { texto: tex(poli(simplifica([...receita, ...custo]))), erro: 'ignora-o-menos-do-parentese' },
        ]),
        dicas: [
          'O lucro é a receita menos o custo inteiro: o custo vai entre parênteses.',
          `${tex(`${poli(receita)} - ${par(custo)} = ${poli(receita)} - ${poli([[q, 1]])} - ${f}`)}.`,
          `${tex(`${p}x - ${q}x = ${p - q}x`)}: o lucro é ${tex(poli(certa))}.`,
        ],
      }
    }
    if (tipo === 1) {
      // O valor da diferença com x = 2: o hábito de conferir.
      const p = tresTermos(r, 5)
      const q = tresTermos(r, 5)
      const v = 2
      const certa = valorEm(p, v) - valorEm(q, v)
      return {
        enunciado: `Quanto vale ${tex(`${par(p)} - ${par(q)}`)} com ${tex(`x = ${v}`)}?`,
        fala: `Quanto vale ${falaPoli(p)}, menos, o parêntese ${falaPoli(q)}, com x igual a ${v}?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [
          [valorEm(soPrimeiro(p, q), v), 'menos-so-no-primeiro'],
          [valorEm(p, v) + valorEm(q, v), 'ignora-o-menos-do-parentese'],
        ]),
        dicas: [
          'Calcule cada parêntese com o número no lugar do x e depois subtraia.',
          `O primeiro vale ${num(valorEm(p, v))} e o segundo, ${num(valorEm(q, v))}.`,
          `${tex(`${valorEm(p, v)} - ${ent(valorEm(q, v))} = ${certa}`)}.`,
        ],
      }
    }
    // O perímetro de um triângulo com lados que dependem de x.
    const lados: Termo[][] = [0, 1, 2].map(() => [[r.int(1, 4), 1], [naoZero(r, -3, 6), 0]])
    if (!lados.some((l) => l[1][0] < 0)) lados[r.int(0, 2)][1][0] = -r.int(1, 3)
    if (lados.reduce((s, l) => s + l[1][0], 0) === 0) lados[0][1][0] += 1
    const soma = simplifica(lados.flat())
    const a = coef(soma, 1)
    const b = coef(soma, 0)
    const absB = lados.reduce((s, l) => s + Math.abs(l[1][0]), 0)
    const opcoes: Op[] = [
      { texto: tex(poli(soma)), certa: true },
      { texto: tex(poli([[a, 2], [b, 0]])), erro: 'x-mais-x-da-x2' },
      { texto: tex(poli([[a, 1], [absB, 0]])), erro: 'termo-perde-o-sinal' },
    ]
    if (a + b !== 0) opcoes.push({ texto: tex(poli([[a + b, 1]])), erro: 'junta-termos-nao-semelhantes' })
    return {
      enunciado: `Os lados de um triângulo medem ${lados.map((l) => tex(poli(l))).join(', ').replace(/, ([^,]*)$/, ' e $1')} metros. Qual é o perímetro?`,
      fala: `Os lados de um triângulo medem ${lados.map((l) => falaPoli(l)).join(', ')} metros. Qual é o perímetro?`,
      formato: 'escolha',
      ...embaralhar(r, opcoes),
      dicas: [
        'O perímetro é a soma dos três lados: junte os termos semelhantes.',
        `Os ${tex('x')}: ${tex(`${lados.map((l) => l[0][0]).join(' + ')} = ${a}`)}. Os números, com os sinais.`,
        `O perímetro é ${tex(poli(soma))} metros.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: multiplicar monômios

export const produtoN1: Gerador = {
  id: 'polinomios-produto-monomios-n1',
  aula: 'AF.U1.A3',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 2) {
      // xᵐ · xⁿ por extenso.
      const m = r.int(2, 4)
      const n = r.int(2, 4)
      const extenso = (k: number) => Array.from({ length: k }, () => 'x').join(' · ')
      const sup = ['', '', '²', '³', '⁴']
      return {
        enunciado: `Complete: ${tex(`x^{${m}} \\cdot x^{${n}} = x^{\\square}`)}. Que número vai no quadradinho?`,
        fala: `Complete: ${falaLiteral(m)} vezes ${falaLiteral(n)} é igual a x elevado a quanto?`,
        formato: 'numero',
        resposta: m + n,
        erros: mapa(m + n, [[m * n, 'potencia-multiplica-expoentes']]),
        dicas: [
          'Escreva por extenso e conte os x multiplicados.',
          `${tex(`x^{${m}}`)} são ${m} x, e ${tex(`x^{${n}}`)} são ${n} x.`,
          `${m} e mais ${n}: ${m + n} x. ${tex(`x^{${m}} \\cdot x^{${n}} = x^{${m + n}}`)}.`,
        ],
        visual: exp([`x${sup[m]} · x${sup[n]}`, `(${extenso(m)}) · (${extenso(n)})`], `A conta e, embaixo, por extenso: ${m} x vezes ${n} x.`),
      }
    }
    // O retângulo de ax por bx.
    let a = r.int(2, 5)
    const b = r.int(2, 6)
    if (a === 2 && b === 2) a = 3
    const visual = ret({ base: [`${b}x`], altura: [`${a}x`], areas: [['?']] }, `O retângulo com ${b}x em cima e ${a}x à esquerda, e um "?" dentro.`)
    if (tipo === 0) {
      return {
        enunciado: `Um retângulo tem lados ${tex(`${a}x`)} e ${tex(`${b}x`)}. Qual é a área?`,
        fala: `Um retângulo tem lados ${a} x e ${b} x. Qual é a área?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(mono(a * b, 2)), certa: true },
          { texto: tex(mono(a + b, 2)), erro: 'soma-coeficientes-na-multiplicacao' },
          { texto: tex(mono(a + b, 1)), erro: 'soma-no-lugar-de-multiplicar' },
          { texto: tex(mono(a * b, 1)) },
        ]),
        dicas: [
          'A área é um lado vezes o outro: números com números, letras com letras.',
          `${tex(`${a} \\cdot ${b} = ${a * b}`)} e ${tex('x \\cdot x = x^2')}.`,
          `${tex(`${a}x \\cdot ${b}x = ${a * b}x^2`)}.`,
        ],
        visual,
      }
    }
    return {
      enunciado: `Complete: ${tex(`${a}x \\cdot ${b}x = \\square x^2`)}. Que número vai no quadradinho?`,
      fala: `Complete: ${a} x vezes ${b} x é igual a quantos x ao quadrado?`,
      formato: 'numero',
      resposta: a * b,
      erros: mapa(a * b, [[a + b, 'soma-coeficientes-na-multiplicacao']]),
      dicas: [
        'Parta os lados em x: o retângulo vira fileiras de quadrados x².',
        `São ${a} fileiras de ${b} quadrados: ${tex(`${a} \\cdot ${b}`)}.`,
        `${tex(`${a}x \\cdot ${b}x = ${a * b}x^2`)}. Vai o ${a * b}.`,
      ],
      visual,
    }
  },
}

export const produtoN2: Gerador = {
  id: 'polinomios-produto-monomios-n2',
  aula: 'AF.U1.A3',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Com sinais.
      const a = r.int(2, 6)
      const b = r.int(2, 6)
      const m = r.int(1, 4)
      const n = r.int(1, 4)
      const dois = r.int(0, 2) === 0
      const sa = -1
      const sb = dois ? -1 : 1
      const certa = sa * a * sb * b
      const f = `(${mono(sa * a, m)}) \\cdot ${sb < 0 ? `(${mono(sb * b, n)})` : mono(b, n)}`
      return {
        enunciado: `Complete: ${tex(`${f} = \\square ${literal(m + n)}`)}. Que número vai no quadradinho?`,
        fala: `Complete: ${falaPoli([[sa * a, m]])}, vezes ${falaPoli([[sb * b, n]])}, é igual a quantos ${falaLiteral(m + n)}?`,
        formato: 'numero',
        sinal: true,
        resposta: certa,
        erros: mapa(certa, [
          [-certa, dois ? 'sinais-iguais-da-negativo' : 'sinais-diferentes-da-positivo'],
          [sa * a + sb * b, 'soma-coeficientes-na-multiplicacao'],
        ]),
        dicas: [
          'Números com números, letras com letras. O sinal segue a regra dos sinais.',
          `${tex(`(${sa * a}) \\cdot ${ent(sb * b)}`)}: ${dois ? 'sinais iguais, o produto é positivo' : 'sinais diferentes, o produto é negativo'}.`,
          `${tex(`${f} = ${mono(certa, m + n)}`)}. Vai o ${num(certa)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // O x sozinho tem expoente 1.
      const a = r.int(2, 6)
      const b = r.int(2, 6)
      const m = r.int(2, 6)
      const antes = r.int(0, 1) === 0
      const f = antes ? `${a}x^{${m}} \\cdot ${b}x` : `${b}x \\cdot ${a}x^{${m}}`
      return {
        enunciado: `Complete: ${tex(`${f} = ${a * b}x^{\\square}`)}. Que número vai no quadradinho?`,
        fala: `Complete: ${antes ? `${a} ${falaLiteral(m)} vezes ${b} x` : `${b} x vezes ${a} ${falaLiteral(m)}`} é igual a ${a * b} x elevado a quanto?`,
        formato: 'numero',
        sinal: true,
        resposta: m + 1,
        erros: mapa(m + 1, [[m, 'letra-sozinha-sem-o-um']]),
        dicas: [
          `O ${tex('x')} sozinho é ${tex('x^1')}: um x.`,
          `${tex(`x^{${m}} \\cdot x^1`)}: ${m} x e mais um.`,
          `${tex(`x^{${m}} \\cdot x = x^{${m + 1}}`)}. Vai o ${m + 1}.`,
        ],
      }
    }
    // Vezes ou mais: os expoentes só se somam na multiplicação.
    const m = r.int(2, 5)
    let n = r.int(2, 5)
    if (n === m) n = m === 5 ? 2 : m + 1
    const [maior, menor] = m > n ? [m, n] : [n, m]
    const vezes = r.int(0, 1) === 0
    const opcoes: Op[] = vezes
      ? [
          { texto: tex(literal(m + n)), certa: true },
          { texto: tex(`x^{${maior}} + x^{${menor}}`) },
        ]
      : [
          { texto: tex(`x^{${maior}} + x^{${menor}}`), certa: true },
          { texto: tex(literal(m + n)), erro: 'potencia-soma-expoentes-na-adicao' },
          { texto: tex(`2${literal(m + n)}`), erro: 'junta-termos-nao-semelhantes' },
        ]
    if (vezes && m * n !== m + n) opcoes.push({ texto: tex(literal(m * n)), erro: 'potencia-multiplica-expoentes' })
    return {
      enunciado: `${tex(`x^{${m}} ${vezes ? '\\cdot' : '+'} x^{${n}}`)} é igual a quê?`,
      fala: `${falaLiteral(m)} ${vezes ? 'vezes' : 'mais'} ${falaLiteral(n)} é igual a quê?`,
      formato: 'escolha',
      ...embaralhar(r, opcoes),
      dicas: [
        vezes ? 'Na multiplicação, os fatores se juntam: conte os x.' : 'Na soma, só se juntam termos semelhantes, com o mesmo expoente.',
        vezes ? `${m} x e mais ${n} x.` : `${tex(`x^{${m}}`)} e ${tex(`x^{${n}}`)} são peças diferentes. Com ${tex('x = 2')}: ${2 ** m} e ${2 ** n}.`,
        vezes ? `${tex(`x^{${m}} \\cdot x^{${n}} = x^{${m + n}}`)}.` : `Não se junta: fica ${tex(`x^{${maior}} + x^{${menor}}`)}.`,
      ],
    }
  },
}

export const produtoN3: Gerador = {
  id: 'polinomios-produto-monomios-n3',
  aula: 'AF.U1.A3',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // O produto inteiro, com sinais.
      const comSinal = () => r.int(2, 7) * (r.int(0, 1) === 0 ? -1 : 1)
      const a = comSinal()
      // A soma dos coeficientes nunca vale o produto (nem o oposto dele), nem zero.
      const ruim = (b: number) => a + b === 0 || Math.abs(a + b) === Math.abs(a * b)
      let b = comSinal()
      for (let t = 0; t < 20 && ruim(b); t++) b = comSinal()
      if (ruim(b)) b = Math.abs(a) === 3 ? 5 : 3
      const m = r.int(2, 5)
      const n = r.int(2, 5)
      const k = a * b
      const fa = a < 0 ? `(${mono(a, m)})` : mono(a, m)
      const fb = b < 0 ? `(${mono(b, n)})` : mono(b, n)
      const opcoes: Op[] = [
        { texto: tex(mono(k, m + n)), certa: true },
        { texto: tex(mono(-k, m + n)), erro: (a < 0) === (b < 0) ? 'sinais-iguais-da-negativo' : 'sinais-diferentes-da-positivo' },
        { texto: tex(mono(a + b, m + n)), erro: 'soma-coeficientes-na-multiplicacao' },
      ]
      if (m * n !== m + n) opcoes.push({ texto: tex(mono(k, m * n)), erro: 'potencia-multiplica-expoentes' })
      return {
        enunciado: `${tex(`${fa} \\cdot ${fb}`)} é igual a quê?`,
        fala: `${falaPoli([[a, m]])}, vezes ${falaPoli([[b, n]])}, é igual a quê?`,
        formato: 'escolha',
        ...embaralhar(r, opcoes),
        dicas: [
          'Números com números, letras com letras. O sinal segue a regra dos sinais.',
          `${tex(`${ent(a)} \\cdot ${ent(b)} = ${k}`)} e ${tex(`x^{${m}} \\cdot x^{${n}} = x^{${m + n}}`)}.`,
          `${tex(`${fa} \\cdot ${fb} = ${mono(k, m + n)}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // O volume de uma caixa de lados ax, bx e cx.
      const a = r.int(2, 5)
      const b = r.int(2, 5)
      const c = r.int(2, 5)
      const v = a * b * c
      return {
        enunciado: `Uma caixa mede ${tex(`${a}x`)}${NB}cm de largura, ${tex(`${b}x`)}${NB}cm de comprimento e ${tex(`${c}x`)}${NB}cm de altura. Qual expressão dá o volume, em cm³?`,
        fala: `Uma caixa mede ${a} x centímetros de largura, ${b} x de comprimento e ${c} x de altura. Qual expressão dá o volume, em centímetros cúbicos?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(mono(v, 3)), certa: true },
          { texto: tex(mono(a + b + c, 3)), erro: 'soma-coeficientes-na-multiplicacao' },
          { texto: tex(mono(a + b + c, 1)), erro: 'soma-no-lugar-de-multiplicar' },
          { texto: tex(mono(v, 1)) },
        ]),
        dicas: [
          'O volume é largura vezes comprimento vezes altura.',
          `Os números: ${tex(`${a} \\cdot ${b} \\cdot ${c} = ${v}`)}. As letras: ${tex('x \\cdot x \\cdot x')}.`,
          `${tex(`${a}x \\cdot ${b}x \\cdot ${c}x = ${v}x^3`)}.`,
        ],
      }
    }
    // Duas letras: cada letra junta os seus expoentes.
    const a = r.int(2, 6)
    const b = r.int(2, 6)
    const p = r.int(2, 4)
    const q = r.int(2, 4)
    const lit = (ex: number, ey: number) => `${literal(ex)}${literal(ey, 'y')}`
    return {
      enunciado: `${tex(`${a}${lit(p, 1)} \\cdot ${b}${lit(1, q)}`)} é igual a quê?`,
      fala: `${a} ${falaLiteral(p)} y, vezes ${b} x ${falaLiteral(q, 'y')}, é igual a quê?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: tex(`${a * b}${lit(p + 1, q + 1)}`), certa: true },
        { texto: tex(`${a * b}${lit(p, q)}`), erro: 'letra-sozinha-sem-o-um' },
        { texto: tex(`${a + b}${lit(p + 1, q + 1)}`), erro: 'soma-coeficientes-na-multiplicacao' },
      ].filter((o, i) => i === 0 || o.texto !== tex(`${a * b}${lit(p + 1, q + 1)}`))),
      dicas: [
        'Números com números; cada letra com a mesma letra.',
        `${tex(`${a} \\cdot ${b} = ${a * b}`)}. O ${tex('x')} sozinho é ${tex('x^1')}, e o ${tex('y')} também.`,
        `${tex(`x^{${p}} \\cdot x = x^{${p + 1}}`)} e ${tex(`y \\cdot y^{${q}} = y^{${q + 1}}`)}: ${tex(`${a * b}${lit(p + 1, q + 1)}`)}.`,
      ],
    }
  },
}

export const GERADORES_AF_U01A: Gerador[] = [termosN1, termosN2, termosN3, somarN1, somarN2, somarN3, produtoN1, produtoN2, produtoN3]
