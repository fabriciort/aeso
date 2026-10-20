import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Exercícios da unidade 4 de Álgebra e Funções, parte A. Aula 1, duas
// incógnitas (os pares de uma equação com x e y); aula 2, duas condições ao
// mesmo tempo (o par que serve às duas); aula 3, substituição.
//
// O teclado só digita números. Por isso os itens pedem uma letra ("Quanto
// vale y?"), uma quantidade do problema, ou uma escolha (qual par serve,
// a equação que sai da troca). A solução (x, y) é sorteada primeiro, inteira,
// e as equações são montadas a partir dela. Toda equação é a·x + b·y = c,
// escrita por `lin` (em TeX, com o hífen) ou por `linTexto` (para o palco,
// com o menos verdadeiro). Os sorteios com condição têm tentativas limitadas
// e uma saída fixa: o rng de borda, que repete sempre o mesmo número, também
// termina.

// ---------------------------------------------------------------- ferramentas

/** O número como se escreve no texto, com o menos verdadeiro: −12. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))

/** O par como se escreve no texto: (3, −2). */
const par = (x: number, y: number) => `(${num(x)}, ${num(y)})`

/** Um termo sem o sinal: (1, 'x') → 'x'; (3, 'y') → '3y'. */
const corpo = (k: number, letra: string) => `${Math.abs(k) === 1 ? '' : Math.abs(k)}${letra}`

/** a·x + b·y = c em TeX (com o hífen): '2x - 3y = -4'. Coeficientes zero somem. */
function lin(a: number, b: number, c: number, menos = '-'): string {
  const termos: string[] = []
  for (const [k, l] of [[a, 'x'], [b, 'y']] as const) {
    if (k === 0) continue
    termos.push(termos.length ? `${k < 0 ? ` ${menos} ` : ' + '}${corpo(k, l)}` : `${k < 0 ? menos : ''}${corpo(k, l)}`)
  }
  return `${termos.join('') || '0'} = ${c < 0 ? menos : ''}${Math.abs(c)}`
}
/** A mesma equação com o menos verdadeiro, para o palco. */
const linTexto = (a: number, b: number, c: number) => lin(a, b, c, '−')

/** k·x + q em TeX: 'x + 2', '2x - 3'. */
const kxMais = (k: number, q: number, menos = '-') => `${corpo(k, 'x')}${q === 0 ? '' : ` ${q < 0 ? menos : '+'} ${Math.abs(q)}`}`

/**
 * Erros previsíveis (como o aluno digitaria), sem a certa, sem valores que
 * não são inteiros e sem repetir: o primeiro par de um valor é o que vale.
 */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (!Number.isInteger(valor) || valor === certa) continue
    const k = num(valor)
    if (!(k in erros)) erros[k] = erro
  }
  return erros
}

/** Um inteiro de `de` a `ate`, sem o zero e com o sinal sorteado. */
const comSinal = (r: Rng, de: number, ate: number) => r.int(de, ate) * (r.int(0, 1) === 0 ? 1 : -1)

/**
 * As opções de uma escolha: a certa num lugar sorteado e as erradas na
 * ordem dada, sem repetir textos. Os erros apontam para o índice de cada
 * errada que tem um erro comum.
 */
function escolha(r: Rng, certa: string, erradas: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const vistas = new Set([certa])
  const outras = erradas.filter(([t]) => (vistas.has(t) ? false : (vistas.add(t), true)))
  const pos = r.int(0, outras.length)
  const opcoes = outras.map(([t]) => t)
  opcoes.splice(pos, 0, certa)
  const erros: Record<string, string> = {}
  opcoes.forEach((t, i) => {
    const e = outras.find(([o]) => o === t)?.[1]
    if (i !== pos && e) erros[String(i)] = e
  })
  return { opcoes, resposta: pos, erros }
}

/** Se o par serve à equação a·x + b·y = c. */
const serve = (e: [number, number, number], x: number, y: number) => e[0] * x + e[1] * y === e[2]

// ---------------------------------------------------------------- aula 1: duas incógnitas

export const paresN1: Gerador = {
  id: 'sistemas-pares-n1',
  aula: 'AF.U4.A1',
  nivel: 1,
  gerar(r) {
    // x + y = S, com x = a: y = S − a.
    const s = r.int(6, 12)
    const a = r.int(1, s - 1)
    const certa = s - a
    const visual: Visual = {
      modelo: 'livre',
      estado: {
        tabela: {
          linhas: [
            { rotulo: 'x', valores: [0, a] },
            { rotulo: 'y', valores: [s, '?'] },
            { rotulo: 'x + y', valores: [s, s] },
          ],
          destaque: [1],
        },
      },
      esboco: `A tabela de pares de x + y = ${s}: a coluna (0, ${s}) e a coluna do ${a}, com o y em branco e moldura âmbar.`,
    }
    return {
      enunciado: `Em $\{x + y = ${s}}$, com x = ${a}, quanto vale y?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [[s + a, 'desfaz-com-a-mesma-operacao']]),
      dicas: [
        `Cada par (x, y) tem de somar ${s}.`,
        `Ponha o ${a} no lugar do x: $${a} + y = ${s}$. Quanto falta para ${s}?`,
        `$y = ${s} - ${a} = ${certa}$. O par é ${par(a, certa)}.`,
      ],
      visual,
    }
  },
}

export const paresN2: Gerador = {
  id: 'sistemas-pares-n2',
  aula: 'AF.U4.A1',
  nivel: 2,
  gerar(r) {
    // Qual par está na reta a·x + b·y = c? Com negativos. Erradas: o par com x e y trocados, um sinal trocado e pares vizinhos.
    const a = r.int(1, 4)
    let b = comSinal(r, 1, 3)
    if (a === b) b = -b
    const p = r.int(-3, 5)
    let q = r.int(-4, 5)
    if (q === p) q = q === 5 ? -4 : q + 1
    const e: [number, number, number] = [a, b, a * p + b * q]
    const candidatos: [number, number, string | undefined][] = [
      [q, p, 'troca-x-e-y'],
      [p, -q, 'esquece-sinal-do-resultado'],
      [-p, q, 'esquece-sinal-do-resultado'],
      [p, q + 1, undefined],
      [p + 1, q, undefined],
      [p, q - 1, undefined],
      [p - 1, q, undefined],
    ]
    const erradas = candidatos
      .filter(([x, y]) => !serve(e, x, y))
      .map(([x, y, erro]) => [par(x, y), erro] as [string, string | undefined])
    const vistas = new Set<string>()
    const tres = erradas.filter(([t]) => (vistas.has(t) ? false : (vistas.add(t), true))).slice(0, 3)
    const eq = lin(...e)
    return {
      enunciado: `Qual destes pares está na reta $\{${eq}}$?`,
      formato: 'escolha',
      ...escolha(r, par(p, q), tres),
      dicas: [
        'Um par está na reta quando, posto na equação, deixa os dois lados iguais.',
        'Ponha o primeiro número no lugar do x e o segundo no lugar do y, em cada par.',
        `${par(p, q)}: $${a === 1 ? '' : `${a} \\cdot `}${p < 0 ? `(${p})` : p} ${b < 0 ? '-' : '+'} ${Math.abs(b) === 1 ? '' : `${Math.abs(b)} \\cdot `}${q < 0 ? `(${q})` : q} = ${e[2]}$.`,
      ],
    }
  },
}

/** Os contextos de compra: o produto 1, o produto 2 (no plural) e o lugar. */
const COMPRAS: { um: string; dois: string; umSing: string; doisSing: string; quantos: string; onde: string }[] = [
  { um: 'pastéis', dois: 'sucos', umSing: 'o pastel', doisSing: 'o suco', quantos: 'Quantos', onde: 'Na lanchonete' },
  { um: 'cadernos', dois: 'canetas', umSing: 'o caderno', doisSing: 'a caneta', quantos: 'Quantas', onde: 'Na papelaria' },
  { um: 'pães de queijo', dois: 'cafés', umSing: 'o pão de queijo', doisSing: 'o café', quantos: 'Quantos', onde: 'Na padaria' },
]

export const paresN3: Gerador = {
  id: 'sistemas-pares-n3',
  aula: 'AF.U4.A1',
  nivel: 3,
  gerar(r) {
    // p·n + s·m = T, com n dado: m = (T − p·n) ÷ s.
    const ctx = r.pick(COMPRAS)
    const p = r.int(3, 8)
    let s = r.int(2, 6)
    if (s === p) s = s === 2 ? 6 : s - 1
    const n = r.int(2, 6)
    const m = r.int(2, 8)
    const t = p * n + s * m
    return {
      enunciado: `${ctx.onde}, ${ctx.umSing} custa R$ ${p} e ${ctx.doisSing}, R$ ${s}. Uma mesa gastou R$ ${t} com ${n} ${ctx.um}. ${ctx.quantos} ${ctx.dois}?`,
      formato: 'numero',
      resposta: m,
      erros: mapa(m, [
        [t - p * n, 'esquece-de-dividir'],
        [(t - p) / s, 'esquece-a-quantidade'],
      ]),
      dicas: [
        `Com x ${ctx.um} e y ${ctx.dois}: $${p}x + ${s}y = ${t}$. O x você já sabe.`,
        `Os ${n} ${ctx.um} custam ${p} · ${n} = R$ ${p * n}. Quanto sobra para os ${ctx.dois}?`,
        `${t} − ${p * n} = ${t - p * n}, e ${t - p * n} ÷ ${s} = ${m}. São ${m} ${ctx.dois}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: duas condições ao mesmo tempo

export const cruzamentoN1: Gerador = {
  id: 'sistemas-cruzamento-n1',
  aula: 'AF.U4.A2',
  nivel: 1,
  gerar(r) {
    // x + y = p + q e k·x + m·y = k·p + m·q, com k ≠ m (as retas se cruzam).
    const p = r.int(1, 6)
    let q = r.int(1, 6)
    if (q === p) q = q === 6 ? 1 : q + 1
    const k = r.int(1, 3)
    let m = r.int(2, 4)
    if (m === k) m = m === 4 ? 2 : m + 1
    const e1: [number, number, number] = [1, 1, p + q]
    const e2: [number, number, number] = [k, m, k * p + m * q]
    // Um par só da primeira (andando na reta x + y = S) e um só da segunda (andando na reta k·x + m·y = T).
    const so1 = [[p + 1, q - 1], [p - 1, q + 1], [p + 2, q - 2]].find(([x, y]) => !(x === q && y === p))!
    const so2 = [[p - m, q + k], [p + m, q - k]].find(([x, y]) => x >= 0 && y >= 0) ?? [p - m, q + k]
    const visual: Visual = {
      modelo: 'plano',
      estado: { retas: [{ equacao: linTexto(...e1) }, { equacao: linTexto(...e2) }] },
      esboco: `As retas de ${linTexto(...e1)} (âmbar) e ${linTexto(...e2)} (azul). O cruzamento sem ponto: o aluno procura onde elas se encontram.`,
    }
    return {
      enunciado: `Qual par serve às duas equações, $\{${lin(...e1)}}$ e $\{${lin(...e2)}}$?`,
      formato: 'escolha',
      ...escolha(r, par(p, q), [
        [par(q, p), 'troca-x-e-y'],
        [par(so1[0], so1[1]), 'par-so-de-uma-equacao'],
        [par(so2[0], so2[1]), 'par-so-de-uma-equacao'],
      ]),
      dicas: [
        'O par certo serve às **duas** equações: no plano, é onde as retas se cruzam.',
        'Ponha cada par nas duas equações. Servir a uma só não basta.',
        `${par(p, q)}: $${p} + ${q} = ${p + q}$ e $${k === 1 ? '' : `${k} \\cdot `}${p} + ${m} \\cdot ${q} = ${e2[2]}$.`,
      ],
      visual,
    }
  },
}

const RESPOSTAS_CONFERIR = ['Sim: serve às duas', 'Não: serve só à primeira', 'Não: serve só à segunda', 'Não: não serve a nenhuma']

export const cruzamentoN2: Gerador = {
  id: 'sistemas-cruzamento-n2',
  aula: 'AF.U4.A2',
  nivel: 2,
  gerar(r) {
    // Um sistema com solução (s, t) e um par para conferir: a solução, um par só da primeira, só da segunda ou de nenhuma.
    const a1 = r.int(1, 3)
    const b1 = comSinal(r, 1, 3)
    const a2 = r.int(1, 3)
    let b2 = comSinal(r, 1, 3)
    if (a1 * b2 === a2 * b1) b2 = b2 === 3 ? -3 : b2 + (b2 === -1 ? 2 : 1)
    const s = r.int(-4, 5)
    const t = r.int(-4, 5)
    const e1: [number, number, number] = [a1, b1, a1 * s + b1 * t]
    const e2: [number, number, number] = [a2, b2, a2 * s + b2 * t]
    const caso = r.int(0, 3)
    // Andar na reta a·x + b·y = c é somar (b, −a): continua nela e sai da outra.
    const [x, y] = caso === 0 ? [s, t] : caso === 1 ? [s + b1, t - a1] : caso === 2 ? [s + b2, t - a2] : [s + 1, t]
    const erros: Record<string, string> = {}
    RESPOSTAS_CONFERIR.forEach((_, i) => {
      if (i === caso) return
      erros[String(i)] = i === 0 && (caso === 1 || caso === 2) ? 'par-so-de-uma-equacao' : 'nao-confere-a-solucao'
    })
    const conta = (e: [number, number, number]) => {
      const t1 = `${e[0] === 1 ? '' : `${e[0]} \\cdot `}${x < 0 ? `(${x})` : x}`
      const t2 = `${Math.abs(e[1]) === 1 ? '' : `${Math.abs(e[1])} \\cdot `}${y < 0 ? `(${y})` : y}`
      return `$${t1} ${e[1] < 0 ? '-' : '+'} ${t2} = ${e[0] * x + e[1] * y}$`
    }
    return {
      enunciado: `O par ${par(x, y)} é solução de $\{${lin(...e1)}}$ e $\{${lin(...e2)}}$?`,
      formato: 'escolha',
      opcoes: RESPOSTAS_CONFERIR,
      resposta: caso,
      erros,
      dicas: [
        'Um par é a solução do sistema só se servir às **duas** equações.',
        `Ponha x = ${num(x)} e y = ${num(y)} na primeira. Depois, na segunda.`,
        `Na primeira, ${conta(e1)} (precisa dar ${num(e1[2])}). Na segunda, ${conta(e2)} (precisa dar ${num(e2[2])}).`,
      ],
    }
  },
}

export const cruzamentoN3: Gerador = {
  id: 'sistemas-cruzamento-n3',
  aula: 'AF.U4.A2',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Carros e motos: c + m = n e 4c + 2m = R.
      const c = r.int(1, 8)
      let m = r.int(1, 8)
      if (m === c) m = m === 8 ? 1 : m + 1
      const n = c + m
      const rodas = 4 * c + 2 * m
      const motos = r.int(0, 1) === 0
      const certa = motos ? m : c
      return {
        enunciado: `No estacionamento há ${n} veículos, entre carros e motos, e ${rodas} rodas. Quant${motos ? 'as motos' : 'os carros'}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[motos ? c : m, 'responde-outra-pergunta']]),
        dicas: [
          `Duas condições: $x + y = ${n}$ (veículos) e $4x + 2y = ${rodas}$ (rodas), com x carros e y motos.`,
          `Teste pares que somam ${n}: com 1 carro e ${n - 1} motos, são ${4 + 2 * (n - 1)} rodas. Ajuste.`,
          `${c} carros e ${m} motos: ${c} + ${m} = ${n} e ${4 * c} + ${2 * m} = ${rodas}. São ${certa} ${motos ? 'motos' : 'carros'}.`,
        ],
      }
    }
    // Frutas: x + y = n e p·x + q·y = T.
    const p = r.int(2, 4)
    const q = p + r.int(1, 2)
    const x = r.int(1, 7)
    let y = r.int(1, 7)
    if (y === x) y = y === 7 ? 1 : y + 1
    const n = x + y
    const total = p * x + q * y
    const macas = r.int(0, 1) === 0
    const certa = macas ? x : y
    return {
      enunciado: `${n} frutas, entre maçãs a R$ ${p} e peras a R$ ${q}, custaram R$ ${total}. Quant${macas ? 'as maçãs' : 'as peras'}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[macas ? y : x, 'responde-outra-pergunta']]),
      dicas: [
        `Duas condições: $x + y = ${n}$ (frutas) e $${p}x + ${q}y = ${total}$ (reais), com x maçãs e y peras.`,
        `Teste pares que somam ${n} e veja qual custa R$ ${total}.`,
        `${x} maçãs e ${y} peras: ${x} + ${y} = ${n} e ${p * x} + ${q * y} = ${total}. São ${certa} ${macas ? 'maçãs' : 'peras'}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: substituição

export const substituicaoN1: Gerador = {
  id: 'sistemas-substituicao-n1',
  aula: 'AF.U4.A3',
  nivel: 1,
  gerar(r) {
    // y = x + a e x + y = S: 2x + a = S.
    const a = comSinal(r, 1, 5)
    const x = r.int(Math.max(1, 1 - a), 8)
    const y = x + a
    const s = x + y
    const qual = r.int(0, 1) === 0 ? 'x' : 'y'
    const certa = qual === 'x' ? x : y
    const primeira = `y = ${kxMais(1, a, '−')}`
    const visual: Visual = {
      modelo: 'livre',
      estado: { sistema: { equacoes: [primeira, `x + y = ${s}`], trocar: 'y', trocado: true } },
      esboco: `As duas equações empilhadas, com a caixa ${kxMais(1, a, '−')} já no lugar do y: x + (${kxMais(1, a, '−')}) = ${s}.`,
    }
    const erros =
      qual === 'x'
        ? mapa(certa, [
            [s - a, 'esquece-de-dividir'],
            [(s + a) / 2, 'desfaz-com-a-mesma-operacao'],
            [y, 'responde-outra-pergunta'],
          ])
        : mapa(certa, [[x, 'esquece-a-segunda-letra']])
    return {
      enunciado: `Em $\{y = ${kxMais(1, a)}}$ e $\{x + y = ${s}}$, quanto vale ${qual}?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros,
      dicas: [
        `A primeira diz quanto vale y. Troque o y da segunda por $(${kxMais(1, a)})$.`,
        `$x + (${kxMais(1, a)}) = ${s}$, ou seja, $2x ${a < 0 ? '-' : '+'} ${Math.abs(a)} = ${s}$.`,
        `$2x = ${s - a}$, $x = ${x}$ e $y = ${x} ${a < 0 ? '-' : '+'} ${Math.abs(a)} = ${y}$. ${qual === 'x' ? `x = ${num(x)}` : `y = ${num(y)}`}.`,
      ],
      visual,
    }
  },
}

export const substituicaoN2: Gerador = {
  id: 'sistemas-substituicao-n2',
  aula: 'AF.U4.A3',
  nivel: 2,
  gerar(r) {
    // y = k·x + q e m·x + n·y = c, com n de 2 a 4: os parênteses importam.
    const k = r.int(1, 2)
    const q = comSinal(r, 1, 5)
    const m = r.int(1, 4)
    const n = r.int(2, 4)
    const x = r.int(-3, 6)
    const y = k * x + q
    const c = m * x + n * y
    const a = m + n * k
    const primeira = `y = ${kxMais(k, q)}`
    const segunda = lin(m, n, c)
    if (r.int(0, 1) === 0) {
      // A equação que sai da troca, já com a distributiva feita.
      const eq = (coefX: number, solto: number) => `$${corpo(coefX, 'x')} ${solto < 0 ? '-' : '+'} ${Math.abs(solto)} = ${c}$`
      return {
        enunciado: `Trocando o y de $\{${primeira}}$ em $\{${segunda}}$ e juntando os x, fica:`,
        formato: 'escolha',
        ...escolha(r, eq(a, n * q), [
          [eq(a, q), 'substitui-sem-parenteses'],
          [eq(m + k, n * q), 'multiplica-so-um-termo'],
          ...(q < 0 ? ([[eq(a, -n * q), 'distributiva-sinal-do-negativo']] as [string, string][]) : []),
        ]),
        dicas: [
          `O y vale $${kxMais(k, q)}$ inteiro: ele entra **entre parênteses**.`,
          `$${corpo(m, 'x')} + ${n}(${kxMais(k, q)}) = ${c}$. O ${n} multiplica os dois termos.`,
          `$${corpo(m, 'x')} + ${corpo(n * k, 'x')} ${q < 0 ? '-' : '+'} ${Math.abs(n * q)} = ${c}$, ou seja, $${corpo(a, 'x')} ${q < 0 ? '-' : '+'} ${Math.abs(n * q)} = ${c}$.`,
        ],
      }
    }
    const qual = r.int(0, 1) === 0 ? 'x' : 'y'
    const certa = qual === 'x' ? x : y
    // Sem os parênteses: a·x + q = c.
    const xSem = (c - q) / a
    const erros =
      qual === 'x'
        ? mapa(certa, [
            [xSem, 'substitui-sem-parenteses'],
            [y, 'responde-outra-pergunta'],
          ])
        : mapa(certa, [
            [x, 'esquece-a-segunda-letra'],
            [k * xSem + q, 'substitui-sem-parenteses'],
          ])
    return {
      enunciado: `Em $\{${primeira}}$ e $\{${segunda}}$, quanto vale ${qual}?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros,
      dicas: [
        `Troque o y da segunda por $(${kxMais(k, q)})$, com os parênteses.`,
        `$${corpo(m, 'x')} + ${n}(${kxMais(k, q)}) = ${c}$, ou seja, $${corpo(a, 'x')} ${q < 0 ? '-' : '+'} ${Math.abs(n * q)} = ${c}$.`,
        `$${corpo(a, 'x')} = ${c - n * q}$, $x = ${x}$ e $y = ${k === 1 ? '' : `${k} \\cdot `}${x < 0 ? `(${x})` : x} ${q < 0 ? '-' : '+'} ${Math.abs(q)} = ${y}$.`,
      ],
    }
  },
}

export const substituicaoN3: Gerador = {
  id: 'sistemas-substituicao-n3',
  aula: 'AF.U4.A3',
  nivel: 3,
  gerar(r) {
    // x + y = S (y = S − x) ou x − y = D (y = x − D), e m·x + n·y = c. Isolar o y antes.
    const soma = r.int(0, 1) === 0
    const x = r.int(1, 7)
    const y = r.int(-2, 7)
    const n = r.int(2, 4)
    let m = r.int(1, 5)
    if (soma && m === n) m = m === 5 ? 1 : m + 1
    const c = m * x + n * y
    const s = soma ? x + y : x - y
    const qual = r.int(0, 1) === 0 ? 'x' : 'y'
    const certa = qual === 'x' ? x : y
    // Isolar sem trocar o sinal: y = S + x (na soma) ou y = D − x (na diferença).
    const xErr = soma ? (c - n * s) / (m + n) : m === n ? NaN : (c - n * s) / (m - n)
    const yErr = soma ? s + xErr : s - xErr
    const erros =
      qual === 'x'
        ? mapa(certa, [
            [xErr, 'passa-para-o-outro-lado'],
            [y, 'responde-outra-pergunta'],
          ])
        : mapa(certa, [
            [x, 'esquece-a-segunda-letra'],
            [yErr, 'passa-para-o-outro-lado'],
          ])
    const isolado = soma ? `${num(s)} − x` : `x ${s < 0 ? '+' : '−'} ${Math.abs(s)}`
    const isoladoTex = soma ? `${s} - x` : `x ${s < 0 ? '+' : '-'} ${Math.abs(s)}`
    const primeira = soma ? lin(1, 1, s) : lin(1, -1, s)
    return {
      enunciado: `Em $\{${primeira}}$ e $\{${lin(m, n, c)}}$, quanto vale ${qual}?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros,
      dicas: [
        'Nenhuma equação diz quanto vale y. Isole o y na primeira, fazendo a mesma conta dos dois lados.',
        `A primeira dá y = ${isolado}. Troque o y da segunda por $(${isoladoTex})$.`,
        `$${corpo(m, 'x')} + ${n}(${isoladoTex}) = ${c}$ dá x = ${num(x)}, e y = ${num(y)}.`,
      ],
    }
  },
}

export const GERADORES_AF_U04A: Gerador[] = [
  paresN1,
  paresN2,
  paresN3,
  cruzamentoN1,
  cruzamentoN2,
  cruzamentoN3,
  substituicaoN1,
  substituicaoN2,
  substituicaoN3,
]
