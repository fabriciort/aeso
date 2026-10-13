import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 15: equações do 1º grau (aulas 1 a 3). Igualdade é equilíbrio,
// resolver passo a passo e x dos dois lados. As equações aparecem em TeX,
// inteiras entre chaves para a linha não quebrar no meio (${2x + 3 = 11}$).
// O teclado só digita números: os itens pedem o valor de x (ou o peso de
// uma caixa) e usam "escolha" para o que acontece com a balança, para o
// primeiro passo e para "é solução?". Nos visuais do nível 1, a balança de
// dois pratos (caixa = x, peso = 1) ou a reta, para a subtração.

// ---------------------------------------------------------------- ajudas

/** O espaço que não quebra, depois de "R$" e entre o número e a unidade. */
const NB = '\u00a0'
/** Uma fórmula inteira em TeX, entre chaves para não quebrar a linha. */
const tex = (f: string) => `\${${f}}$`
/** A mesma fórmula com o ponto de interrogação dentro do TeX. */
const texQ = (f: string) => `\${${f}}\\text{?}$`
/** O número com o menos verdadeiro, para o texto fora do TeX: −3. */
const num = (n: number) => (n < 0 ? `−${-n}` : String(n))

/** Um lado da equação em TeX: a x + b (2x + 3, x - 4, 5, -x + 2). */
function lado(a: number, b: number): string {
  const t: string[] = []
  if (a) t.push(a === 1 ? 'x' : a === -1 ? '-x' : `${a}x`)
  if (!t.length) return String(b)
  if (b) t.push(b < 0 ? `- ${-b}` : `+ ${b}`)
  return t.join(' ')
}
/** A equação a x + b = c x + d em TeX. */
const equacao = (a: number, b: number, c: number, d: number) => `${lado(a, b)} = ${lado(c, d)}`
/** Como a voz lê uma fórmula simples: "2 x mais 3 igual a 11". */
const falar = (f: string) =>
  f
    .replace(/\\cdot/g, 'vezes')
    .replace(/(\d)x/g, '$1 x')
    .replace(/ = /g, ' igual a ')
    .replace(/ \+ /g, ' mais ')
    .replace(/ - /g, ' menos ')
    .replace(/(^|\s)-/g, '$1menos ')

/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number, pares: [number | null, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([String(certa)])
  for (const [valor, erro] of pares) {
    if (valor === null || !Number.isInteger(valor)) continue
    const k = String(valor)
    if (vistos.has(k)) continue
    vistos.add(k)
    erros[k] = erro
  }
  return erros
}
/** A divisão, só quando é exata (senão, null: não vira erro previsível). */
const exata = (a: number, b: number) => (b !== 0 && a % b === 0 ? a / b : null)

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

/** A balança de a x + b contra c x + d, com a equação embaixo. */
const balanca = (a: number, b: number, c: number, d: number, esboco: string): Visual => ({
  modelo: 'balanca',
  estado: { esquerda: { x: a, n: b }, direita: { x: c, n: d }, mostraEquacao: true },
  esboco,
})

// ---------------------------------------------------------------- aula 1: igualdade é equilíbrio

export const equilibrioN1: Gerador = {
  id: 'equilibrio-n1',
  aula: 'B.U15.A1',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // x + a = b: o peso da caixa.
      const a = r.int(2, 9)
      const x = r.int(2, 9)
      const b = x + a
      const f = equacao(1, a, 0, b)
      return {
        enunciado: `A balança está reta: ${tex(f)}. Quanto pesa a caixa?`,
        fala: `A balança está reta: ${falar(f)}. Quanto pesa a caixa?`,
        formato: 'numero',
        resposta: x,
        erros: mapa(x, [[a + b, 'desfaz-com-a-mesma-operacao']]),
        dicas: [
          `A caixa e mais ${a} pesam o mesmo que ${b}.`,
          `Tire ${a} pesos de cada prato: sobra a caixa contra ${b} − ${a}.`,
          `${tex(`x = ${b} - ${a} = ${x}`)}. Confira: ${tex(`${x} + ${a} = ${b}`)}.`,
        ],
        visual: balanca(1, a, 0, b, `A balança reta: 1 caixa e ${a} pesos contra ${b} pesos. Embaixo: ${f}.`),
      }
    }
    if (tipo === 1) {
      // kx = b: o peso de uma caixa.
      const k = r.int(2, 4)
      const x = r.int(2, 5)
      const b = k * x
      const f = equacao(k, 0, 0, b)
      return {
        enunciado: `A balança está reta: ${tex(f)}. Quanto pesa uma caixa?`,
        fala: `A balança está reta: ${falar(f)}. Quanto pesa uma caixa?`,
        formato: 'numero',
        resposta: x,
        erros: mapa(x, [
          [b, 'esquece-de-dividir'],
          [b - k, 'subtrai-o-coeficiente'],
          [b * k, 'desfaz-com-a-mesma-operacao'],
        ]),
        dicas: [
          `${k} caixas iguais pesam ${b}.`,
          `Reparta os ${b} pesos em ${k} grupos iguais, um para cada caixa.`,
          `${tex(`x = ${b} \\div ${k} = ${x}`)}. Confira: ${tex(`${k} \\cdot ${x} = ${b}`)}.`,
        ],
        visual: balanca(k, 0, 0, b, `A balança reta: ${k} caixas contra ${b} pesos. Embaixo: ${f}.`),
      }
    }
    // O que acontece se mexer num prato só.
    const a = r.int(2, 6)
    const x = r.int(2, 8)
    const b = x + a
    const poe = r.int(0, 1) === 1
    const ladoMexe = r.pick(['esquerda', 'direita'] as const)
    const k = r.int(1, a)
    const f = equacao(1, a, 0, b)
    const desce = (ladoMexe === 'esquerda') === poe ? 'esquerda' : 'direita'
    const outro = desce === 'esquerda' ? 'direita' : 'esquerda'
    const acao = poe ? `põe ${k} ${k === 1 ? 'peso' : 'pesos'} só no prato da ${ladoMexe}` : `tira ${k} ${k === 1 ? 'peso' : 'pesos'} só do prato da ${ladoMexe}`
    return {
      enunciado: `A balança está reta: ${tex(f)}. Você ${acao}. O que acontece?`,
      fala: `A balança está reta: ${falar(f)}. Você ${acao}. O que acontece?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `O prato da ${desce} desce`, certa: true },
        { texto: `O prato da ${outro} desce` },
        { texto: 'A balança continua reta', erro: 'opera-so-de-um-lado' },
      ]),
      dicas: [
        'A balança fica reta só se os dois pratos pesam o mesmo.',
        poe ? `O prato da ${ladoMexe} ganha ${k}; o outro continua igual.` : `O prato da ${ladoMexe} perde ${k}; o outro continua igual.`,
        `O prato mais pesado desce: o da ${desce}.`,
      ],
      visual: balanca(1, a, 0, b, `A balança reta: 1 caixa e ${a} pesos contra ${b} pesos, antes de mexer.`),
    }
  },
}

export const equilibrioN2: Gerador = {
  id: 'equilibrio-n2',
  aula: 'B.U15.A1',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // x + a = b, com números maiores e em outras ordens.
      const a = r.int(11, 60)
      const x = r.int(5, 40)
      const b = x + a
      const forma = r.int(0, 2)
      const f = forma === 0 ? `x + ${a} = ${b}` : forma === 1 ? `${a} + x = ${b}` : `${b} = x + ${a}`
      return {
        enunciado: `Quanto vale $x$ em ${texQ(f)}`,
        fala: `Quanto vale x em ${falar(f)}?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [[a + b, 'desfaz-com-a-mesma-operacao']]),
        dicas: [
          `O $x$ e mais ${a} dão ${b}.`,
          `Tire ${a} dos dois lados.`,
          `${tex(`x = ${b} - ${a} = ${x}`)}. Confira: ${tex(`${x} + ${a} = ${b}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // É solução? Trocar o x pelo número e conferir.
      const k = r.int(2, 5)
      const x = r.int(2, 9)
      const a = r.int(1, 9)
      const b = k * x + a
      const v = r.pick([x, x, x - 1, x + 1])
      const f = equacao(k, a, 0, b)
      const e = v === x
      const esq = k * v + a
      return {
        enunciado: `O valor ${tex(`x = ${v}`)} é solução de ${texQ(f)}`,
        fala: `O valor x igual a ${v} é solução de ${falar(f)}?`,
        formato: 'escolha',
        opcoes: ['Sim', 'Não'],
        resposta: e ? 0 : 1,
        erros: e ? {} : ({ '0': 'nao-confere-a-solucao' } as Record<string, string>),
        dicas: [
          `Troque o $x$ por ${v} e faça a conta do lado esquerdo.`,
          `${tex(`${k} \\cdot ${v} + ${a} = ${esq}`)}.`,
          e ? `${esq} é igual a ${b}: os dois lados batem. É solução.` : `${esq} não é ${b}: os dois lados não batem. Não é solução.`,
        ],
      }
    }
    // kx = b, com números maiores.
    const k = r.int(2, 9)
    const x = r.int(3, 12)
    const b = k * x
    const f = equacao(k, 0, 0, b)
    return {
      enunciado: `Quanto vale $x$ em ${texQ(f)}`,
      fala: `Quanto vale x em ${falar(f)}?`,
      formato: 'numero',
      sinal: true,
      resposta: x,
      erros: mapa(x, [
        [b, 'esquece-de-dividir'],
        [b - k, 'subtrai-o-coeficiente'],
        [b * k, 'desfaz-com-a-mesma-operacao'],
      ]),
      dicas: [
        `${tex(`${k}x`)} é ${k} vezes $x$: ${k} caixas iguais pesam ${b}.`,
        `Divida os dois lados por ${k}.`,
        `${tex(`x = ${b} \\div ${k} = ${x}`)}. Confira: ${tex(`${k} \\cdot ${x} = ${b}`)}.`,
      ],
    }
  },
}

export const equilibrioN3: Gerador = {
  id: 'equilibrio-n3',
  aula: 'B.U15.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Sacos iguais de arroz na balança: kx = b.
      const k = r.int(2, 6)
      const x = r.int(2, 10)
      const b = k * x
      return {
        enunciado: `Numa balança, **${k}** sacos iguais de arroz equilibram **${b}**${NB}kg. Quanto pesa cada saco, em kg?`,
        fala: `Numa balança, ${k} sacos iguais de arroz equilibram ${b} quilos. Quanto pesa cada saco, em quilos?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [
          [b, 'esquece-de-dividir'],
          [b - k, 'subtrai-o-coeficiente'],
          [b * k, 'desfaz-com-a-mesma-operacao'],
        ]),
        dicas: [
          `Chame o peso de um saco de $x$: ${tex(`${k}x = ${b}`)}.`,
          `${k} sacos pesam ${b}${NB}kg. Divida por ${k}.`,
          `${tex(`x = ${b} \\div ${k} = ${x}`)}: cada saco pesa ${x}${NB}kg.`,
        ],
      }
    }
    if (tipo === 1) {
      // Uma caixa e um peso: x + a = b.
      const a = r.int(3, 25)
      const x = r.int(4, 30)
      const b = x + a
      return {
        enunciado: `Uma caixa e um peso de **${a}**${NB}kg equilibram **${b}**${NB}kg. Quanto pesa a caixa, em kg?`,
        fala: `Uma caixa e um peso de ${a} quilos equilibram ${b} quilos. Quanto pesa a caixa, em quilos?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [[a + b, 'desfaz-com-a-mesma-operacao']]),
        dicas: [
          `Chame o peso da caixa de $x$: ${tex(`x + ${a} = ${b}`)}.`,
          `Tire ${a}${NB}kg dos dois pratos.`,
          `${tex(`x = ${b} - ${a} = ${x}`)}: a caixa pesa ${x}${NB}kg.`,
        ],
      }
    }
    // Qual destes valores resolve kx + a = b?
    const k = r.int(2, 6)
    const x = r.int(2, 9)
    const a = r.int(1, 12)
    const b = k * x + a
    const f = equacao(k, a, 0, b)
    const mesma = exata(b + a, k)
    return {
      enunciado: `Qual destes valores é a solução de ${texQ(f)}`,
      fala: `Qual destes valores é a solução de ${falar(f)}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: tex(`x = ${x}`), certa: true },
        { texto: tex(`x = ${b - a}`), erro: 'esquece-de-dividir' },
        { texto: tex(`x = ${mesma ?? x + 1}`), erro: mesma === null ? undefined : 'desfaz-com-a-mesma-operacao' },
        { texto: tex(`x = ${x + 2}`) },
      ]),
      dicas: [
        'Troque o $x$ por cada valor e veja qual deixa os dois lados iguais.',
        `Com ${tex(`x = ${x}`)}: ${tex(`${k} \\cdot ${x} + ${a}`)}.`,
        `${tex(`${k} \\cdot ${x} + ${a} = ${b}`)}: os dois lados batem. A solução é ${tex(`x = ${x}`)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: resolver passo a passo

export const resolverN1: Gerador = {
  id: 'resolver-equacao-n1',
  aula: 'B.U15.A2',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 2) < 2) {
      // ax + b = c, na balança.
      const a = r.int(2, 3)
      const x = r.int(2, 5)
      const b = r.int(1, 20 - a * x > 6 ? 6 : 20 - a * x)
      const c = a * x + b
      const f = equacao(a, b, 0, c)
      return {
        enunciado: `Resolva ${tex(f)}. Quanto pesa uma caixa?`,
        fala: `Resolva ${falar(f)}. Quanto pesa uma caixa?`,
        formato: 'numero',
        resposta: x,
        erros: mapa(x, [
          [c - b, 'esquece-de-dividir'],
          [exata(c + b, a), 'desfaz-com-a-mesma-operacao'],
          [c - b - a, 'subtrai-o-coeficiente'],
        ]),
        dicas: [
          'Faça a mesma coisa dos dois pratos, até sobrar uma caixa.',
          `Tire ${b} pesos de cada prato: ${tex(`${a}x = ${c - b}`)}.`,
          `Divida por ${a}: ${tex(`x = ${(c - b)} \\div ${a} = ${x}`)}. Confira: ${tex(`${a} \\cdot ${x} + ${b} = ${c}`)}.`,
        ],
        visual: balanca(a, b, 0, c, `A balança reta: ${a} caixas e ${b} pesos contra ${c} pesos. Embaixo: ${f}.`),
      }
    }
    // x − a = b, na reta.
    const a = r.int(2, 6)
    const b = r.int(2, 8)
    const x = a + b
    const f = equacao(1, -a, 0, b)
    return {
      enunciado: `Resolva ${tex(f)}. Quanto vale $x$?`,
      fala: `Resolva ${falar(f)}. Quanto vale x?`,
      formato: 'numero',
      resposta: x,
      erros: mapa(x, [[b - a, 'desfaz-com-a-mesma-operacao']]),
      dicas: [
        `De $x$, voltar ${a} dá ${b}. Faça o caminho de volta.`,
        `O contrário de tirar ${a} é somar ${a}: some ${a} dos dois lados.`,
        `${tex(`x = ${b} + ${a} = ${x}`)}. Confira: ${tex(`${x} - ${a} = ${b}`)}.`,
      ],
      visual: {
        modelo: 'reta',
        estado: { de: 0, ate: x + 2, passo: 1, marcas: [b], numeros: [b], comparacao: `x − ${a} = ${b}` },
        esboco: `A reta de 0 a ${x + 2}, com o ${b} aceso. Embaixo: x − ${a} = ${b}. O x não aparece: é a resposta.`,
      },
    }
  },
}

export const resolverN2: Gerador = {
  id: 'resolver-equacao-n2',
  aula: 'B.U15.A2',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // ax − b = c.
      const a = r.int(2, 6)
      const x = r.int(2, 12)
      const b = r.int(1, Math.min(15, a * x - 1))
      const c = a * x - b
      const f = equacao(a, -b, 0, c)
      return {
        enunciado: `Resolva ${tex(f)}. Quanto vale $x$?`,
        fala: `Resolva ${falar(f)}. Quanto vale x?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [
          [exata(c - b, a), 'desfaz-com-a-mesma-operacao'],
          [c + b, 'esquece-de-dividir'],
          [c + b - a, 'subtrai-o-coeficiente'],
        ]),
        dicas: [
          `Primeiro desfaça o − ${b}, depois o vezes ${a}.`,
          `Some ${b} dos dois lados: ${tex(`${a}x = ${c + b}`)}.`,
          `${tex(`x = ${c + b} \\div ${a} = ${x}`)}. Confira: ${tex(`${a} \\cdot ${x} - ${b} = ${c}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // ax + b = c com solução negativa.
      const a = r.int(2, 5)
      const x = -r.int(1, 6)
      const b = r.int(10, 30)
      const c = a * x + b
      const f = equacao(a, b, 0, c)
      return {
        enunciado: `Resolva ${tex(f)}. Quanto vale $x$?`,
        fala: `Resolva ${falar(f)}. Quanto vale x?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [
          [-x, 'esquece-sinal-do-resultado'],
          [c - b, 'esquece-de-dividir'],
        ]),
        dicas: [
          `Tire ${b} dos dois lados, depois divida por ${a}.`,
          `${tex(`${a}x = ${c} - ${b} = ${c - b}`)}.`,
          `${tex(`x = ${c - b} \\div ${a} = ${x}`)}. Confira: ${tex(`${a} \\cdot (${x}) + ${b} = ${c}`)}.`,
        ],
      }
    }
    // O primeiro passo certo.
    const a = r.int(2, 6)
    const x = r.int(2, 9)
    const b = r.int(2, 9)
    const menos = r.int(0, 1) === 1
    const c = menos ? a * x - b : a * x + b
    const f = equacao(a, menos ? -b : b, 0, c)
    return {
      enunciado: `Qual é um bom primeiro passo para resolver ${texQ(f)}`,
      fala: `Qual é um bom primeiro passo para resolver ${falar(f)}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `${menos ? 'Somar' : 'Tirar'} ${b} dos dois lados`, certa: true },
        { texto: `${menos ? 'Tirar' : 'Somar'} ${b} dos dois lados`, erro: 'desfaz-com-a-mesma-operacao' },
        { texto: `${menos ? 'Somar' : 'Tirar'} ${b} só do lado ${menos ? 'direito' : 'esquerdo'}`, erro: 'opera-so-de-um-lado' },
      ]),
      dicas: [
        'O que se faz de um lado se faz do outro, com a conta contrária.',
        `Ao lado do ${tex(`${a}x`)} há um ${menos ? '−' : '+'} ${b}. O contrário dele é ${menos ? '+' : '−'} ${b}.`,
        `${menos ? 'Somar' : 'Tirar'} ${b} dos dois lados: ${tex(`${a}x = ${a * x}`)}.`,
      ],
    }
  },
}

/** Planos e cobranças: um valor fixo e um valor por unidade. */
const COBRANCAS = [
  { quem: 'Uma academia', fixo: 'de matrícula', por: 'por mês', unidade: 'meses', pergunta: 'Quantos meses ela pagou?' },
  { quem: 'Um estacionamento', fixo: 'na entrada', por: 'por hora', unidade: 'horas', pergunta: 'Quantas horas o carro ficou?' },
  { quem: 'Um eletricista', fixo: 'pela visita', por: 'por tomada', unidade: 'tomadas', pergunta: 'Quantas tomadas ele instalou?' },
] as const

export const resolverN3: Gerador = {
  id: 'resolver-equacao-n3',
  aula: 'B.U15.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Um valor fixo mais um valor por unidade: px + m = t.
      const c = r.pick(COBRANCAS)
      const m = r.int(2, 15) * 10
      const p = r.int(3, 12) * 5
      const x = r.int(2, 12)
      const t = p * x + m
      return {
        enunciado: `${c.quem} cobra R$${NB}${m} ${c.fixo} e R$${NB}${p} ${c.por}. A conta deu R$${NB}${t}. ${c.pergunta}`,
        fala: `${c.quem} cobra ${m} reais ${c.fixo} e ${p} reais ${c.por}. A conta deu ${t} reais. ${c.pergunta}`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [
          [t - m, 'esquece-de-dividir'],
          [exata(t + m, p), 'desfaz-com-a-mesma-operacao'],
        ]),
        dicas: [
          `Chame de $x$ o número de ${c.unidade}: ${tex(`${p}x + ${m} = ${t}`)}.`,
          `Tire ${m} dos dois lados: ${tex(`${p}x = ${t - m}`)}.`,
          `${tex(`x = ${t - m} \\div ${p} = ${x}`)}. Confira: ${tex(`${p} \\cdot ${x} + ${m} = ${t}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // ax ± b = c com números maiores; a solução pode ser negativa.
      const a = r.int(4, 12)
      let x = r.int(-12, 20)
      if (x === 0) x = 7
      const b = r.int(10, 99) * (r.int(0, 1) === 1 ? -1 : 1)
      const c = a * x + b
      const f = equacao(a, b, 0, c)
      return {
        enunciado: `Resolva ${tex(f)}. Quanto vale $x$?`,
        fala: `Resolva ${falar(f)}. Quanto vale x?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [
          [c - b, 'esquece-de-dividir'],
          [exata(c + b, a), 'desfaz-com-a-mesma-operacao'],
          [x < 0 ? -x : null, 'esquece-sinal-do-resultado'],
        ]),
        dicas: [
          `Desfaça o ${b < 0 ? '−' : '+'} ${Math.abs(b)} dos dois lados; depois divida por ${a}.`,
          `${tex(`${a}x = ${c} ${b < 0 ? '+' : '-'} ${Math.abs(b)} = ${c - b}`)}.`,
          `${tex(`x = ${c - b} \\div ${a} = ${x}`)}. Confira trocando o $x$ por ${num(x)}.`,
        ],
      }
    }
    // Conferir: trocar o x pelo número e calcular o lado esquerdo.
    const a = r.int(3, 9)
    const v = r.int(2, 9)
    const b = r.int(2, 30)
    const certo = r.int(0, 1) === 1
    const c = a * v + b + (certo ? 0 : r.pick([-a, a]))
    const f = equacao(a, b, 0, c)
    const esq = a * v + b
    return {
      enunciado: `Alguém achou ${tex(`x = ${v}`)} em ${tex(f)}. Para conferir, quanto dá o lado esquerdo com ${texQ(`x = ${v}`)}`,
      fala: `Alguém achou x igual a ${v} em ${falar(f)}. Para conferir, quanto dá o lado esquerdo com x igual a ${v}?`,
      formato: 'numero',
      sinal: true,
      resposta: esq,
      erros: mapa(esq, [
        [Number(`${a}${v}`) + b, 'junta-algarismos-com-a-letra'],
        [a * (v + b), 'ignora-prioridade'],
      ]),
      dicas: [
        `Troque o $x$ por ${v}: ${tex(`${a} \\cdot ${v} + ${b}`)}.`,
        `Primeiro a multiplicação: ${tex(`${a} \\cdot ${v} = ${a * v}`)}.`,
        `${tex(`${a * v} + ${b} = ${esq}`)}. ${esq === c ? `Bate com o ${c}: está certo.` : `Não bate com o ${c}: ${tex(`x = ${v}`)} não é a solução.`}`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: x dos dois lados

export const doisLadosN1: Gerador = {
  id: 'x-dos-dois-lados-n1',
  aula: 'B.U15.A3',
  nivel: 1,
  gerar(r) {
    // ax + b = cx + d, com a > c, na balança.
    const c = r.int(1, 2)
    const a = c + r.int(1, 3)
    const b = r.int(1, 6)
    // Os pesos de 1 cabem num prato (até 20).
    const x = r.int(1, Math.min(5, Math.floor((20 - b) / (a - c))))
    const d = (a - c) * x + b
    const sol = (d - b) / (a - c)
    const f = equacao(a, b, c, d)
    const visual = balanca(a, b, c, d, `A balança reta: ${a} caixas e ${b} pesos contra ${c} ${c === 1 ? 'caixa' : 'caixas'} e ${d} pesos. Embaixo: ${f}.`)
    if (r.int(0, 2) === 0) {
      return {
        enunciado: `A balança está reta: ${tex(f)}. Quantas caixas dá para tirar de cada prato?`,
        fala: `A balança está reta: ${falar(f)}. Quantas caixas dá para tirar de cada prato?`,
        formato: 'numero',
        resposta: c,
        erros: {},
        dicas: [
          'Tire o mesmo número de caixas dos dois pratos.',
          `A direita tem só ${c} ${c === 1 ? 'caixa' : 'caixas'}.`,
          `Dá para tirar ${c} de cada: fica ${tex(equacao(a - c, b, 0, d))}.`,
        ],
        visual,
      }
    }
    return {
      enunciado: `Resolva ${tex(f)}. Quanto pesa uma caixa?`,
      fala: `Resolva ${falar(f)}. Quanto pesa uma caixa?`,
      formato: 'numero',
      resposta: sol,
      erros: mapa(sol, [
        [d - b, 'esquece-de-dividir'],
        [exata(d - b, a + c), 'passa-para-o-outro-lado'],
        [exata(d + b, a - c), 'desfaz-com-a-mesma-operacao'],
      ]),
      dicas: [
        `Tire ${c} ${c === 1 ? 'caixa' : 'caixas'} de cada prato, depois os pesos.`,
        `${tex(equacao(a - c, b, 0, d))}, e então ${tex(equacao(a - c, 0, 0, d - b))}.`,
        `${tex(`x = ${sol}`)}. Confira: ${tex(`${a} \\cdot ${sol} + ${b} = ${a * sol + b}`)} e ${tex(`${c === 1 ? '' : `${c} \\cdot `}${sol} + ${d} = ${c * sol + d}`)}.`,
      ],
      visual,
    }
  },
}

export const doisLadosN2: Gerador = {
  id: 'x-dos-dois-lados-n2',
  aula: 'B.U15.A3',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // As caixas sobram à direita: ax + b = cx + d, com c > a.
      const a = r.int(1, 4)
      const c = a + r.int(2, 4)
      const x = r.int(2, 9)
      const d = r.int(0, 8)
      const b = (c - a) * x + d
      const f = equacao(a, b, c, d)
      return {
        enunciado: `Resolva ${tex(f)}. Quanto vale $x$?`,
        fala: `Resolva ${falar(f)}. Quanto vale x?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [
          [b - d, 'esquece-de-dividir'],
          [exata(b - d, a + c), 'passa-para-o-outro-lado'],
        ]),
        dicas: [
          `O lado direito tem mais $x$: tire ${tex(lado(a, 0))} dos dois lados.`,
          `${tex(equacao(0, b, c - a, d))}${d ? `, e tirando ${d}: ${tex(equacao(0, b - d, c - a, 0))}` : ''}.`,
          `${tex(`x = ${b - d} \\div ${c - a} = ${x}`)}. Confira: os dois lados dão ${num(a * x + b)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // Solução negativa: ax + b = cx + d, com a > c e b > d.
      const c = r.int(1, 4)
      const a = c + r.int(1, 4)
      const x = -r.int(1, 6)
      const d = r.int(1, 10)
      const b = d - (a - c) * x
      const f = equacao(a, b, c, d)
      return {
        enunciado: `Resolva ${tex(f)}. Quanto vale $x$?`,
        fala: `Resolva ${falar(f)}. Quanto vale x?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [
          [-x, 'esquece-sinal-do-resultado'],
          [exata(d - b, a + c), 'passa-para-o-outro-lado'],
          [d - b, 'esquece-de-dividir'],
        ]),
        dicas: [
          `Tire ${tex(lado(c, 0))} dos dois lados; depois tire ${b}.`,
          `${tex(equacao(a - c, b, 0, d))}, e então ${tex(equacao(a - c, 0, 0, d - b))}.`,
          `${tex(`x = ${d - b} \\div ${a - c} = ${x}`)}. O resultado é negativo.`,
        ],
      }
    }
    // O primeiro passo certo.
    const c = r.int(1, 4)
    const a = c + r.int(1, 4)
    const x = r.int(1, 8)
    const b = r.int(1, 9)
    const d = (a - c) * x + b
    const f = equacao(a, b, c, d)
    const cx = lado(c, 0)
    return {
      enunciado: `Qual é um bom primeiro passo para resolver ${texQ(f)}`,
      fala: `Qual é um bom primeiro passo para resolver ${falar(f)}?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `Tirar ${tex(cx)} dos dois lados`, certa: true },
        { texto: `Juntar ${tex(lado(c, d))} em ${tex(`${c + d}x`)}`, erro: 'junta-termos-nao-semelhantes' },
        { texto: `Tirar ${tex(cx)} só do lado direito`, erro: 'opera-so-de-um-lado' },
      ]),
      dicas: [
        'Com $x$ dos dois lados, tire o mesmo número de $x$ de cada lado.',
        `O lado direito tem ${tex(cx)}. Tire ${tex(cx)} dos dois.`,
        `Fica ${tex(equacao(a - c, b, 0, d))}. $x$ e número não se juntam.`,
      ],
    }
  },
}

export const doisLadosN3: Gerador = {
  id: 'x-dos-dois-lados-n3',
  aula: 'B.U15.A3',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Dois planos de celular com o mesmo preço.
      const gB = r.int(2, 5)
      const gA = gB + r.int(1, 4)
      const x = r.int(2, 15)
      const pA = r.int(2, 8) * 5
      const pB = pA + (gA - gB) * x
      return {
        enunciado: `O plano A custa R$${NB}${pA} mais R$${NB}${gA} por GB. O plano B, R$${NB}${pB} mais R$${NB}${gB} por GB. Com quantos GB custam o mesmo?`,
        fala: `O plano A custa ${pA} reais mais ${gA} reais por GB. O plano B, ${pB} reais mais ${gB} reais por GB. Com quantos GB custam o mesmo?`,
        formato: 'numero',
        sinal: true,
        resposta: x,
        erros: mapa(x, [
          [pB - pA, 'esquece-de-dividir'],
          [exata(pB - pA, gA + gB), 'passa-para-o-outro-lado'],
        ]),
        dicas: [
          `Com $x$ GB: ${tex(`${gA}x + ${pA} = ${gB}x + ${pB}`)}.`,
          `Tire ${tex(`${gB}x`)} e ${pA} dos dois lados: ${tex(`${gA - gB === 1 ? '' : gA - gB}x = ${pB - pA}`)}.`,
          `${tex(`x = ${pB - pA} \\div ${gA - gB} = ${x}`)}. Com ${x}${NB}GB, os dois custam R$${NB}${gA * x + pA}.`,
        ],
      }
    }
    // ax + b = cx + d com números maiores e sinais; a solução pode ser negativa.
    const a = r.int(2, 12)
    let c = r.int(2, 12)
    if (c === a) c = a + 1
    let x = r.int(-10, 12)
    if (x === 0) x = 3
    const b = r.int(-20, 30)
    const d = (a - c) * x + b
    const f = equacao(a, b, c, d)
    return {
      enunciado: `Resolva ${tex(f)}. Quanto vale $x$?`,
      fala: `Resolva ${falar(f)}. Quanto vale x?`,
      formato: 'numero',
      sinal: true,
      resposta: x,
      erros: mapa(x, [
        [exata(d - b, a + c), 'passa-para-o-outro-lado'],
        [-x, 'esquece-sinal-do-resultado'],
      ]),
      dicas: [
        `Tire ${tex(lado(Math.min(a, c), 0))} dos dois lados, depois os números soltos.`,
        a > c ? `${tex(equacao(a - c, 0, 0, d - b))}.` : `${tex(equacao(0, b - d, c - a, 0))}.`,
        `${tex(`x = ${x}`)}. Confira: os dois lados dão ${num(a * x + b)}.`,
      ],
    }
  },
}

export const GERADORES_U15A: Gerador[] = [equilibrioN1, equilibrioN2, equilibrioN3, resolverN1, resolverN2, resolverN3, doisLadosN1, doisLadosN2, doisLadosN3]
