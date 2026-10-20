import type { Gerador, Rng, Visual } from '@/lib/formation/schema'

// Exercícios da unidade 4 de Álgebra e Funções, parte B. Aula 4, a adição;
// aula 5, nenhuma ou infinitas soluções; aula 6, problemas com sistemas.
//
// O teclado só digita números. Por isso os itens pedem um número (quanto
// vale x, y ou x + y; o número que falta na equação; quantas meias) ou dão
// "Nenhuma", "Uma" e "Infinitas" como opções de `escolha`. A solução
// (x, y) é escolhida antes, inteira, e as equações saem dela, para as contas
// darem números que o aluno digita. Erros com resposta negativa se escrevem
// com o menos verdadeiro (−5).

// ---------------------------------------------------------------- ferramentas

/** O número como o aluno o digita, com o menos verdadeiro: −12. */
const num = (n: number): string => (n < 0 ? `−${Math.abs(n)}` : String(n))

/** Um termo em TeX, com o sinal se não for o primeiro: (3, 'x', true) → '3x'; (−1, 'y', false) → ' - y'. */
function termo(k: number, letra: string, primeiro: boolean): string {
  const m = Math.abs(k)
  const corpo = `${m === 1 ? '' : m}${letra}`
  if (primeiro) return `${k < 0 ? '-' : ''}${corpo}`
  return `${k < 0 ? ' - ' : ' + '}${corpo}`
}

/** a·x + b·y = c em TeX: '2x + 3y = 26', 'x - y = 4', '-x + 2y = -3'. O lado direito pode ser uma letra ('k'). */
function eq(a: number, b: number, c: number | string): string {
  const partes: string[] = []
  if (a !== 0) partes.push(termo(a, 'x', true))
  if (b !== 0) partes.push(termo(b, 'y', partes.length === 0))
  return `${partes.join('')} = ${c}`
}

/** A mesma equação para o palco (`sistema`, `retas`), com o menos verdadeiro. */
const eqPalco = (a: number, b: number, c: number) => eq(a, b, c).replace(/-/g, '−')

/** Erros previsíveis (como o aluno digitaria), sem a certa e sem repetir: o primeiro tem a vez. */
function mapa(certa: number, pares: [number, string | undefined][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (!erro || !Number.isFinite(valor) || !Number.isInteger(valor) || valor === certa) continue
    const k = num(valor)
    if (k in erros) continue
    erros[k] = erro
  }
  return erros
}

/** Um inteiro de `de` a `ate`, com o sinal sorteado. */
const comSinal = (r: Rng, de: number, ate: number) => r.int(de, ate) * (r.int(0, 1) === 0 ? 1 : -1)

/** Um inteiro de `de` a `ate`, diferente de zero. */
function semZero(r: Rng, de: number, ate: number): number {
  const v = r.int(de, ate)
  return v === 0 ? (ate > 0 ? 1 : -1) : v
}

const NB = ' '

/** As três respostas de "quantas soluções", sempre nesta ordem. */
const QUANTAS = ['Nenhuma', 'Uma', 'Infinitas']

const pilha = (eqs: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { sistema: { equacoes: eqs } }, esboco })

// ---------------------------------------------------------------- aula 4: a adição

export const adicaoN1: Gerador = {
  id: 'sistemas-adicao-n1',
  aula: 'AF.U4.A4',
  nivel: 1,
  gerar(r) {
    // x + y = s e x − y = d, com x > y > 0: somadas, o y some (2x = s + d).
    const x = r.int(2, 9)
    const y = r.int(1, x - 1)
    const s = x + y
    const d = x - y
    const pedeX = r.int(0, 1) === 0
    const certa = pedeX ? x : y
    const e1 = eq(1, 1, s)
    const e2 = eq(1, -1, d)
    return {
      enunciado: `Pela adição: $${e1}$ e $${e2}$. Quanto vale **${pedeX ? 'x' : 'y'}**?`,
      formato: 'numero',
      resposta: certa,
      erros: pedeX
        ? mapa(x, [[s + d, 'esquece-de-dividir'], [s + d - 2, 'subtrai-o-coeficiente'], [y, 'responde-outra-pergunta']])
        : mapa(y, [[x, 'esquece-a-segunda-letra'], [s - d, 'esquece-de-dividir']]),
      dicas: [
        'Some as duas equações, lado com lado: o +y e o −y se anulam.',
        `$2x = ${s} + ${d} = ${s + d}$, então $x = ${x}$.`,
        pedeX ? `x = ${x}. Confira: ${x} + ${y} = ${s} e ${x} − ${y} = ${d}.` : `Com x = ${x}: $${x} + y = ${s}$, então y = ${y}. Confira: ${x} − ${y} = ${d}.`,
      ],
      visual: pilha([eqPalco(1, 1, s), eqPalco(1, -1, d)], `As duas equações empilhadas: x + y = ${s} em cima de x − y = ${d}.`),
    }
  },
}

export const adicaoN2: Gerador = {
  id: 'sistemas-adicao-n2',
  aula: 'AF.U4.A4',
  nivel: 2,
  gerar(r) {
    // ax + by = c e dx + qy = e, com q = ±1: a segunda vezes m = −b·q deixa o y oposto.
    // Tentativas limitadas, com uma saída fixa: o rng de borda repete sempre o mesmo sorteio.
    let [a, b, d, q] = [3, 2, 1, 1]
    for (let i = 0; i < 30; i++) {
      const a1 = r.int(1, 4)
      const b1 = r.int(2, 4)
      const d1 = r.int(1, 3)
      const q1 = r.int(0, 1) === 0 ? 1 : -1
      if (a1 - b1 * q1 * d1 === 0) continue
      ;[a, b, d, q] = [a1, b1, d1, q1]
      break
    }
    const m = -b * q
    const x = r.int(1, 7)
    const y = semZero(r, -4, 6)
    const c = a * x + b * y
    const e = d * x + q * y
    const k = a + m * d
    const pedeX = r.int(0, 1) === 0
    const certa = pedeX ? x : y
    const pares: [number, string | undefined][] = pedeX
      ? [[(c + e) / k, 'multiplica-so-um-lado'], [Math.abs(k) === 1 ? NaN : c + m * e, 'esquece-de-dividir']]
      : [[x, 'esquece-a-segunda-letra']]
    return {
      enunciado: `Resolva: $${eq(a, b, c)}$ e $${eq(d, q, e)}$. Quanto vale **${pedeX ? 'x' : 'y'}**?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, pares),
      dicas: [
        'Somadas como estão, nenhuma letra some. Multiplique a segunda inteira, os dois lados, para o y ficar oposto.',
        `A segunda vezes ${num(m)}: $${eq(m * d, m * q, m * e)}$. Some com a primeira: $${eq(k, 0, c + m * e)}$.`,
        `x = ${x}. Na segunda: $${eq(d, q, e)}$ dá y = ${num(y)}. Confira nas duas.`,
      ],
    }
  },
}

export const adicaoN3: Gerador = {
  id: 'sistemas-adicao-n3',
  aula: 'AF.U4.A4',
  nivel: 3,
  gerar(r) {
    // a1x + b1y = c1 e a2x + b2y = c2, com b2 = k·b1: a primeira vezes −k deixa o y oposto.
    let [a1, b1, a2, k] = [2, 3, 5, 2]
    for (let i = 0; i < 30; i++) {
      const a = r.int(2, 5)
      const b = comSinal(r, 1, 3)
      const k1 = r.pick([2, 3, -2] as const)
      const a2b = r.int(1, 7) * (r.int(0, 3) === 0 ? -1 : 1)
      if (a2b - k1 * a === 0) continue
      ;[a1, b1, a2, k] = [a, b, a2b, k1]
      break
    }
    const b2 = k * b1
    const x = semZero(r, -4, 6)
    const y = semZero(r, -4, 6)
    const c1 = a1 * x + b1 * y
    const c2 = a2 * x + b2 * y
    const fator = a2 - k * a1
    const pergunta = r.pick(['x', 'y', 'x + y'] as const)
    const certa = pergunta === 'x' ? x : pergunta === 'y' ? y : x + y
    const pares: [number, string | undefined][] =
      pergunta === 'x' ? [[(c2 + c1) / fator, 'multiplica-so-um-lado'], [Math.abs(fator) === 1 ? NaN : c2 - k * c1, 'esquece-de-dividir']] : [[x, 'esquece-a-segunda-letra']]
    return {
      enunciado: `Resolva: $${eq(a1, b1, c1)}$ e $${eq(a2, b2, c2)}$. Quanto vale **${pergunta}**?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, pares),
      dicas: [
        `O y da segunda é ${num(k)} vezes o da primeira. Multiplique a primeira inteira por ${num(-k)}.`,
        `$${eq(-k * a1, -k * b1, -k * c1)}$, somada com a segunda: $${eq(fator, 0, c2 - k * c1)}$.`,
        `x = ${num(x)} e, na primeira, y = ${num(y)}.${pergunta === 'x + y' ? ` Então x + y = ${num(x + y)}.` : ''} Confira nas duas.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: nenhuma ou infinitas

type Caso = 0 | 1 | 2

/** O erro de cada opção errada de "quantas soluções", pelo caso certo. */
function errosQuantas(t: Caso): Record<string, string> {
  if (t === 0) return { '1': 'sistema-sempre-tem-um-par', '2': 'proporcional-so-a-esquerda' }
  if (t === 2) return { '0': 'zero-igual-zero-sem-solucao', '1': 'sistema-sempre-tem-um-par' }
  return { '0': 'acha-paralelas-sem-proporcao', '2': 'acha-paralelas-sem-proporcao' }
}

/** As dicas de "quantas soluções". */
function dicasQuantas(t: Caso, k: number): [string, string, string] {
  return [
    'Veja se um lado esquerdo é o outro multiplicado por um mesmo número.',
    t === 1 ? 'Os lados esquerdos não são proporcionais: as retas se cruzam.' : `O lado esquerdo da segunda é o da primeira vezes ${num(k)}. E o lado direito?`,
    t === 0 ? 'O lado direito não foi multiplicado igual: a conta dá um absurdo. Paralelas, nenhuma solução.' : t === 2 ? 'O lado direito também: é a mesma reta, e a conta dá 0 = 0. Infinitas soluções.' : 'As retas se cruzam num ponto só: uma solução.',
  ]
}

/** Um sistema de cada caso: [a, b, c] e [d, f, g], e o fator k (para paralelas e a mesma reta). */
function sistemaDoCaso(r: Rng, t: Caso, ks: readonly number[], grande: boolean): { e1: [number, number, number]; e2: [number, number, number]; k: number } {
  const a = r.int(1, 3)
  const b = r.int(1, 3)
  if (t === 1) {
    // Um par só: (x0, y0) e uma segunda equação que não é múltipla da primeira.
    const x0 = r.int(0, grande ? 5 : 3)
    const y0 = r.int(1, grande ? 5 : 3)
    let d = a
    let f = b + 1
    for (let i = 0; i < 20; i++) {
      const d1 = r.int(1, grande ? 4 : 3)
      const f1 = r.int(1, grande ? 4 : 3)
      if (a * f1 - b * d1 === 0) continue
      // No plano, uma reta mais em pé e outra mais deitada, para os rótulos não se encostarem.
      if (!grande && Math.sign(a - b) === Math.sign(d1 - f1)) continue
      d = d1
      f = f1
      break
    }
    return { e1: [a, b, a * x0 + b * y0], e2: [d, f, d * x0 + f * y0], k: 1 }
  }
  // O lado direito sai de um par inteiro, para a reta ter pares inteiros (2x + 2y = 5 não tem nenhum).
  const c = a * r.int(grande ? 0 : 1, 3) + b * r.int(1, 3)
  const k0 = r.pick(ks)
  // A mesma reta precisa de um fator diferente de 1, senão as duas equações são iguais.
  const k = t === 2 && k0 === 1 ? 2 : k0
  const g = t === 2 ? k * c : k * c + comSinal(r, 1, 3)
  return { e1: [a, b, c], e2: [k * a, k * b, g], k }
}

export const solucoesN1: Gerador = {
  id: 'sistemas-solucoes-n1',
  aula: 'AF.U4.A5',
  nivel: 1,
  gerar(r) {
    const t = r.int(0, 2) as Caso
    const { e1, e2, k } = sistemaDoCaso(r, t, [1, 2], false)
    // Paralelas com o mesmo lado esquerdo (k = 1) e lados direitos que não são negativos, para o plano ficar pequeno.
    if (t === 0 && e2[2] < 1) e2[2] = k * e1[2] + 1
    const s1 = eqPalco(...e1)
    const s2 = eqPalco(...e2)
    return {
      enunciado: `Quantas soluções tem o sistema $${eq(...e1)}$ e $${eq(...e2)}$?`,
      formato: 'escolha',
      opcoes: QUANTAS,
      resposta: t,
      erros: errosQuantas(t),
      dicas: dicasQuantas(t, k),
      visual: {
        modelo: 'plano',
        estado: { retas: [{ equacao: s1 }, { equacao: s2 }] },
        esboco: `As retas ${s1} (âmbar) e ${s2} (azul) no plano: ${t === 0 ? 'paralelas' : t === 2 ? 'a mesma reta, a segunda tracejada por cima' : 'elas se cruzam num ponto'}.`,
      },
    }
  },
}

export const solucoesN2: Gerador = {
  id: 'sistemas-solucoes-n2',
  aula: 'AF.U4.A5',
  nivel: 2,
  gerar(r) {
    const t = r.int(0, 2) as Caso
    const { e1, e2, k } = sistemaDoCaso(r, t, [2, 3, -1, -2], true)
    // A múltipla pode vir primeiro.
    const troca = r.int(0, 1) === 1
    const [p, s] = troca ? [e2, e1] : [e1, e2]
    return {
      enunciado: `Sem desenhar: quantas soluções tem o sistema $${eq(...p)}$ e $${eq(...s)}$?`,
      formato: 'escolha',
      opcoes: QUANTAS,
      resposta: t,
      erros: errosQuantas(t),
      dicas: dicasQuantas(t, k),
    }
  },
}

export const solucoesN3: Gerador = {
  id: 'sistemas-solucoes-n3',
  aula: 'AF.U4.A5',
  nivel: 3,
  gerar(r) {
    const a = r.int(1, 4)
    const b = r.int(1, 4)
    const c = r.int(2, 9)
    const m = r.pick([2, 3, 4, -2] as const)
    if (r.int(0, 1) === 0) {
      // Nenhuma solução: o y da segunda tem de ser m·b, e o lado direito não é m·c.
      const e = m * c + comSinal(r, 1, 4)
      const ky = m * b
      return {
        enunciado: `Que número no lugar de k faz o sistema $${eq(a, b, c)}$ e $${eq(m * a, 0, e).replace(' =', ' + ky =')}$ **não ter solução**?`,
        formato: 'numero',
        resposta: ky,
        sinal: true,
        erros: mapa(ky, [[b, 'multiplica-so-um-termo']]),
        dicas: [
          'Sem solução, as retas são paralelas: o lado esquerdo da segunda é o da primeira multiplicado.',
          `O x foi multiplicado por ${num(m)}: ${a} vezes ${num(m)} dá ${num(m * a)}. O y também tem de ir vezes ${num(m)}.`,
          `k = ${num(b)} · ${m < 0 ? `(${num(m)})` : m} = ${num(ky)}. E o lado direito, ${num(e)}, não é ${num(m * c)}: nenhuma solução.`,
        ],
      }
    }
    // Infinitas soluções: o lado direito da segunda tem de ser m·c.
    const g = m * c
    return {
      enunciado: `Que número no lugar de k faz o sistema $${eq(a, b, c)}$ e $${eq(m * a, m * b, 'k')}$ ter **infinitas soluções**?`,
      formato: 'numero',
      resposta: g,
      sinal: true,
      erros: mapa(g, [[c, 'multiplica-so-um-lado']]),
      dicas: [
        'Infinitas soluções: é a mesma reta. A segunda é a primeira inteira multiplicada.',
        `O lado esquerdo foi multiplicado por ${num(m)}. O lado direito também tem de ir.`,
        `k = ${c} · ${m < 0 ? `(${num(m)})` : m} = ${num(g)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: problemas

/** O preço da meia; a inteira custa o dobro. */
const MEIAS = [8, 10, 12, 15, 20] as const

export const problemasN1: Gerador = {
  id: 'sistemas-problemas-n1',
  aula: 'AF.U4.A6',
  nivel: 1,
  gerar(r) {
    const meia = r.pick(MEIAS)
    const inteira = 2 * meia
    const i = r.int(5, 40)
    let m = r.int(5, 40)
    if (m === i) m = i === 40 ? 39 : i + 1
    const n = i + m
    const total = inteira * i + meia * m
    const pedeMeias = r.int(0, 1) === 0
    const certa = pedeMeias ? m : i
    return {
      enunciado: `Um teatro vendeu ${n} ingressos e fez R$${NB}${total}. A inteira custa R$${NB}${inteira} e a meia, R$${NB}${meia}. Quantas **${pedeMeias ? 'meias' : 'inteiras'}** foram vendidas?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[pedeMeias ? i : m, 'responde-outra-pergunta']]),
      dicas: [
        `x inteiras e y meias: $x + y = ${n}$ e $${inteira}x + ${meia}y = ${total}$.`,
        `A primeira vezes −${meia}, somada com a segunda: $${meia}x = ${total - meia * n}$, então x = ${i}.`,
        `${i} inteiras e ${m} meias. Confira: ${i} + ${m} = ${n} e ${inteira * i} + ${meia * m} = ${total}.`,
      ],
      visual: { modelo: 'livre', estado: { materiais: [`${n} ingressos`, `R$${NB}${total}`, `inteira: R$${NB}${inteira}`, `meia: R$${NB}${meia}`] }, esboco: `As fichas do teatro: ${n} ingressos, R$ ${total}, a inteira a R$ ${inteira} e a meia a R$ ${meia}.` },
    }
  },
}

/** Os valores das cédulas, do menor para o maior. */
const CEDULAS = [[2, 5], [5, 10], [10, 20], [2, 10], [5, 20], [10, 50], [20, 50]] as const
const NOMES = ['Lia', 'Rui', 'Dona Teresa', 'Seu Antônio', 'Joana', 'Marcos', 'Aline', 'Caio'] as const

export const problemasN2: Gerador = {
  id: 'sistemas-problemas-n2',
  aula: 'AF.U4.A6',
  nivel: 2,
  gerar(r) {
    const [a, b] = r.pick(CEDULAS)
    const nome = r.pick(NOMES)
    const u = r.int(2, 15)
    let v = r.int(2, 15)
    if (v === u) v = u === 15 ? 14 : u + 1
    const n = u + v
    const total = a * u + b * v
    const pedeMaior = r.int(0, 1) === 0
    const certa = pedeMaior ? v : u
    return {
      enunciado: `${nome} tem ${n} cédulas, umas de R$${NB}${a} e outras de R$${NB}${b}, que somam R$${NB}${total}. Quantas são de **R$${NB}${pedeMaior ? b : a}**?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[pedeMaior ? u : v, 'responde-outra-pergunta']]),
      dicas: [
        `x cédulas de R$${NB}${a} e y de R$${NB}${b}: $x + y = ${n}$ e $${a}x + ${b}y = ${total}$.`,
        `A primeira vezes −${a}, somada com a segunda: $${b - a}y = ${total - a * n}$.`,
        `y = ${v} e x = ${u}. Confira: ${a * u} + ${b * v} = ${total}.`,
      ],
    }
  },
}

const PAIS = [['Marta', 'o filho'], ['Seu Jorge', 'a filha'], ['Cida', 'a filha'], ['Paulo', 'o filho'], ['Rosa', 'o neto']] as const

export const problemasN3: Gerador = {
  id: 'sistemas-problemas-n3',
  aula: 'AF.U4.A6',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Idades: soma e diferença.
      const [nome, quem] = r.pick(PAIS)
      const f = r.int(3, 20)
      const dif = r.int(18, 40)
      const s = 2 * f + dif
      const pedeFilho = r.int(0, 1) === 0
      const certa = pedeFilho ? f : f + dif
      return {
        enunciado: `${nome} e ${quem} somam ${s} anos, e ${nome} tem ${dif} anos a mais. Quantos anos tem **${pedeFilho ? quem : nome}**?`,
        formato: 'numero',
        resposta: certa,
        erros: pedeFilho ? mapa(f, [[f + dif, 'responde-outra-pergunta'], [2 * f, 'esquece-de-dividir']]) : mapa(f + dif, [[f, 'responde-outra-pergunta'], [s + dif, 'esquece-de-dividir']]),
        dicas: [
          `x para ${nome} e y para ${quem}: $x + y = ${s}$ e $x - y = ${dif}$.`,
          `Somadas: $2x = ${s + dif}$, então x = ${f + dif}.`,
          `${nome} tem ${f + dif} anos e ${quem}, ${f}. Confira: ${f + dif} + ${f} = ${s}.`,
        ],
      }
    }
    // Galinhas (2 patas) e porcos (4 patas): cabeças e patas.
    const g = r.int(2, 20)
    let p = r.int(2, 20)
    if (p === g) p = g === 20 ? 19 : g + 1
    const cabecas = g + p
    const patas = 2 * g + 4 * p
    const pedePorcos = r.int(0, 1) === 0
    const certa = pedePorcos ? p : g
    return {
      enunciado: `Num sítio há galinhas e porcos: ${cabecas} cabeças e ${patas} patas. Quantos são os **${pedePorcos ? 'porcos' : 'galinhas'}**?`.replace('Quantos são os **galinhas**', 'Quantas são as **galinhas**'),
      formato: 'numero',
      resposta: certa,
      erros: pedePorcos ? mapa(p, [[g, 'responde-outra-pergunta'], [2 * p, 'esquece-de-dividir']]) : mapa(g, [[p, 'responde-outra-pergunta'], [2 * g, 'esquece-de-dividir']]),
      dicas: [
        `x galinhas e y porcos: $x + y = ${cabecas}$ e $2x + 4y = ${patas}$.`,
        `A primeira vezes −2, somada com a segunda: $2y = ${patas - 2 * cabecas}$, então y = ${p}.`,
        `${g} galinhas e ${p} porcos. Confira: ${2 * g} + ${4 * p} = ${patas} patas.`,
      ],
    }
  },
}

export const GERADORES_AF_U04B: Gerador[] = [
  adicaoN1,
  adicaoN2,
  adicaoN3,
  solucoesN1,
  solucoesN2,
  solucoesN3,
  problemasN1,
  problemasN2,
  problemasN3,
]

