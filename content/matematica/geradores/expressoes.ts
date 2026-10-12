import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 5: expressões numéricas. A ordem das operações (× e ÷ antes de
// + e −; mesma prioridade, da esquerda para a direita), os parênteses, o
// sinal de igual e a calculadora simples, que faz conta a conta.
// Só números naturais, divisões exatas e resultados nunca negativos.

const fmt = (n: number) => n.toLocaleString('pt-BR')

// ---------------------------------------------------------------- avaliar

/**
 * Como a conta é lida:
 * - certo: × e ÷ antes de + e −, da esquerda para a direita;
 * - esquerda: tudo da esquerda para a direita (a calculadora simples);
 * - soma-primeiro: + antes de −;
 * - multiplica-primeiro: × antes de ÷;
 * - sem-parenteses: a regra certa, mas sem os parênteses.
 */
export type Leitura = 'certo' | 'esquerda' | 'soma-primeiro' | 'multiplica-primeiro' | 'sem-parenteses'

const PRIORIDADE: Record<Exclude<Leitura, 'sem-parenteses'>, Record<string, number>> = {
  certo: { '+': 1, '−': 1, '×': 2, '÷': 2 },
  esquerda: { '+': 1, '−': 1, '×': 1, '÷': 1 },
  'soma-primeiro': { '−': 1, '+': 2, '×': 3, '÷': 3 },
  'multiplica-primeiro': { '+': 1, '−': 1, '÷': 2, '×': 3 },
}

/**
 * O valor de uma expressão como "2 + 3 × 4" ou "(30 + 15) ÷ 3", lida de um
 * jeito. NaN quando a leitura cai fora dos naturais (divisão não exata ou
 * resultado negativo): essa resposta errada não entra no mapa de erros.
 */
export function avaliar(expr: string, leitura: Leitura = 'certo'): number {
  let t: string[] = expr.match(/\d+|[+−×÷()]/g) ?? []
  if (leitura === 'sem-parenteses') t = t.filter((x) => x !== '(' && x !== ')')
  const prio = PRIORIDADE[leitura === 'sem-parenteses' ? 'certo' : leitura]
  let i = 0
  const faz = (a: number, op: string, b: number) => {
    if (op === '+') return a + b
    if (op === '−') return a >= b ? a - b : NaN
    if (op === '×') return a * b
    return b !== 0 && a % b === 0 ? a / b : NaN
  }
  const primario = (): number => {
    if (t[i] === '(') {
      i++
      const v = conta(1)
      i++
      return v
    }
    return Number(t[i++])
  }
  const conta = (min: number): number => {
    let a = primario()
    while (i < t.length && t[i] !== ')' && prio[t[i]] >= min) {
      const op = t[i++]
      a = faz(a, op, conta(prio[op] + 1))
    }
    return a
  }
  return conta(1)
}

/** Erros previsíveis, sem nunca marcar a resposta certa e sem sobrescrever. */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (Number.isInteger(valor) && valor >= 0 && valor !== certa && !(String(valor) in erros)) erros[String(valor)] = erro
  }
  return erros
}

/** Opções em ordem girada pela semente; a resposta é o índice da certa. */
function girar(r: Rng, opcoes: { texto: string; certa?: boolean; erro?: string }[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const inicio = r.int(0, opcoes.length - 1)
  const ordem = [...opcoes.slice(inicio), ...opcoes.slice(0, inicio)]
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

const expressao = (linhas: string[], esboco: string, destaque?: string): Visual => ({
  modelo: 'livre',
  estado: destaque ? { expressao: linhas, destaque } : { expressao: linhas },
  esboco,
})

const calculadoras = (lista: { nome: string; teclas: string; visor: string }[], esboco: string): Visual => ({
  modelo: 'livre',
  estado: { calculadoras: lista },
  esboco,
})

// ---------------------------------------------------------------- aula 1: a ordem das operações

export const ordemN1: Gerador = {
  id: 'ordem-n1',
  aula: 'B.U5.A1',
  nivel: 1,
  gerar(r) {
    const forma = r.int(0, 2)
    let a: number, b: number, c: number, op1: string, op2: string
    if (forma === 0) {
      ;[a, b, c, op1, op2] = [r.int(2, 20), r.int(2, 9), r.int(2, 9), '+', '×']
    } else if (forma === 1) {
      b = r.int(2, 6)
      c = r.int(2, 6)
      ;[a, op1, op2] = [b * c + r.int(1, 15), '−', '×']
    } else {
      c = r.int(2, 9)
      b = c * r.int(2, 9)
      ;[a, op1, op2] = [r.int(2, 20), '+', '÷']
    }
    const e = `${a} ${op1} ${b} ${op2} ${c}`
    const parte = `${b} ${op2} ${c}`
    const p = avaliar(parte)
    const certa = avaliar(e)
    return {
      enunciado: `Resolva: ${e}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[avaliar(e, 'esquerda'), 'ignora-prioridade']]),
      dicas: ['× e ÷ vêm antes de + e −.', `Primeiro ${parte} = ${p}.`, `${a} ${op1} ${p} = ${certa}.`],
      visual: expressao([e], `A conta grande, com ${parte} numa moldura âmbar: é a primeira a fazer. Ao conferir, a conta encolhe linha a linha.`, parte),
    }
  },
}

export const ordemN2: Gerador = {
  id: 'ordem-n2',
  aula: 'B.U5.A1',
  nivel: 2,
  gerar(r) {
    const forma = r.int(0, 3)
    let e: string
    let dicas: Item['dicas']
    if (forma === 0) {
      const b = r.int(3, 15)
      const c = r.int(2, 15)
      const a = b + c + r.int(1, 30)
      e = `${a} − ${b} + ${c}`
      dicas = ['Só + e −: da esquerda para a direita.', `Primeiro ${a} − ${b} = ${a - b}.`, `${a - b} + ${c} = ${a - b + c}.`]
    } else if (forma === 1) {
      const b = r.int(2, 6)
      const c = r.int(2, 5)
      const a = b * c * r.int(1, 5)
      e = `${a} ÷ ${b} × ${c}`
      dicas = ['Só × e ÷: da esquerda para a direita.', `Primeiro ${a} ÷ ${b} = ${a / b}.`, `${a / b} × ${c} = ${(a / b) * c}.`]
    } else if (forma === 2) {
      const b = r.int(2, 6)
      const c = r.int(2, 6)
      const d = r.int(2, 12)
      const a = b * c + r.int(1, 20)
      const p = b * c
      e = `${a} − ${b} × ${c} + ${d}`
      dicas = ['Primeiro × e ÷. Depois + e −, da esquerda para a direita.', `Primeiro ${b} × ${c} = ${p}.`, `${a} − ${p} = ${a - p}, e ${a - p} + ${d} = ${a - p + d}.`]
    } else {
      const ee = r.int(2, 5)
      const q = r.int(2, 6)
      const d = ee * q
      const b = r.int(2, 7)
      const c = r.int(2, 7)
      const a = r.int(5, 20)
      e = `${a} + ${b} × ${c} − ${d} ÷ ${ee}`
      dicas = ['Primeiro × e ÷. Depois + e −, da esquerda para a direita.', `${b} × ${c} = ${b * c} e ${d} ÷ ${ee} = ${q}.`, `${a} + ${b * c} − ${q} = ${a + b * c - q}.`]
    }
    const certa = avaliar(e)
    return {
      enunciado: `Resolva: ${e}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [avaliar(e, 'esquerda'), 'ignora-prioridade'],
        [avaliar(e, 'soma-primeiro'), 'soma-antes-de-subtrair'],
        [avaliar(e, 'multiplica-primeiro'), 'multiplica-antes-de-dividir'],
      ]),
      dicas,
    }
  },
}

export const ordemN3: Gerador = {
  id: 'ordem-n3',
  aula: 'B.U5.A1',
  nivel: 3,
  gerar(r) {
    const forma = r.int(0, 3)
    if (forma === 0) {
      const b = r.int(2, 5)
      const c = r.int(6, 15)
      const a = (Math.floor((b * c) / 10) + 1 + r.int(0, 3)) * 10
      const certa = a - b * c
      return {
        enunciado: `Você tem R$ ${a} e compra ${b} cadernos de R$ ${c}. Quanto sobra?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[avaliar(`${a} − ${b} × ${c}`, 'esquerda'), 'ignora-prioridade'], [a + b * c, 'operacao-trocada']]),
        dicas: ['Primeiro o preço dos cadernos. Depois, o que sobra.', `${b} cadernos de R$ ${c}: ${b} × ${c} = ${b * c}.`, `${a} − ${b * c} = ${certa}. Sobram R$ ${certa}.`],
      }
    }
    if (forma === 1) {
      const a = r.int(5, 20) * 10
      const b = r.int(3, 10)
      const c = r.int(15, 90)
      const certa = a + b * c
      return {
        enunciado: `Você dá R$ ${a} de entrada e paga ${b} parcelas de R$ ${c}. Quanto paga no total?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[avaliar(`${a} + ${b} × ${c}`, 'esquerda'), 'ignora-prioridade']]),
        dicas: ['As parcelas são uma multiplicação. Faça antes de somar a entrada.', `${b} parcelas de R$ ${c}: ${b} × ${c} = ${fmt(b * c)}.`, `${a} + ${fmt(b * c)} = ${fmt(certa)}. O total é R$ ${fmt(certa)}.`],
      }
    }
    if (forma === 2) {
      const a = r.int(2, 11)
      const b = r.int(2, 5)
      const c = r.pick([6, 12, 30])
      const certa = a + b * c
      return {
        enunciado: `Você tinha ${a} ovos e comprou ${b} caixas com ${c} ovos cada. Quantos ovos tem agora?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[avaliar(`${a} + ${b} × ${c}`, 'esquerda'), 'ignora-prioridade']]),
        dicas: ['Primeiro os ovos das caixas. Depois some os que você tinha.', `${b} caixas de ${c}: ${b} × ${c} = ${b * c}.`, `${a} + ${b * c} = ${certa} ovos.`],
      }
    }
    const n = r.int(2, 6)
    const k = r.int(15, 40)
    const a = n * k
    const b = r.int(5, 20)
    const certa = k + b
    return {
      enunciado: `${n} pessoas dividem uma conta de R$ ${a}, e cada uma paga mais R$ ${b} de estacionamento. Quanto cada uma gasta?`,
      formato: 'numero',
      resposta: certa,
      erros: {},
      dicas: ['Primeiro a parte de cada um na conta. Depois o estacionamento.', `A parte de cada um: ${a} ÷ ${n} = ${k}.`, `${k} + ${b} = ${certa}. Cada uma gasta R$ ${certa}.`],
    }
  },
}

// ---------------------------------------------------------------- aula 2: parênteses e o sinal de igual

export const parentesesN1: Gerador = {
  id: 'parenteses-n1',
  aula: 'B.U5.A2',
  nivel: 1,
  gerar(r) {
    const forma = r.int(0, 2)
    let a: number, b: number, c: number, op1: string, op2: string
    if (forma === 0) {
      ;[a, b, c, op1, op2] = [r.int(1, 9), r.int(1, 9), r.int(2, 9), '+', '×']
    } else if (forma === 1) {
      a = r.int(5, 15)
      ;[b, c, op1, op2] = [r.int(1, a - 2), r.int(2, 9), '−', '×']
    } else {
      c = r.int(2, 6)
      const s = c * r.int(2, 9)
      a = r.int(1, s - 1)
      ;[b, op1, op2] = [s - a, '+', '÷']
    }
    const dentro = `(${a} ${op1} ${b})`
    const s = avaliar(dentro)
    const e = `${dentro} ${op2} ${c}`
    const certa = avaliar(e)
    return {
      enunciado: `Resolva: ${e}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[avaliar(e, 'sem-parenteses'), 'ignora-parenteses']]),
      dicas: ['Primeiro o que está dentro dos parênteses.', `Dentro dos parênteses: ${a} ${op1} ${b} = ${s}.`, `${s} ${op2} ${c} = ${certa}.`],
      visual: expressao([e], `A conta grande, com ${dentro} numa moldura âmbar. Ao conferir, os parênteses viram ${s} e a conta encolhe.`, dentro),
    }
  },
}

export const parentesesN2: Gerador = {
  id: 'parenteses-n2',
  aula: 'B.U5.A2',
  nivel: 2,
  gerar(r) {
    const forma = r.int(0, 4)
    if (forma === 4) {
      // O sinal de igual: qual escrita está certa?
      const a = r.int(2, 9)
      const b = r.int(2, 9)
      const c = r.int(2, 5)
      const s = a + b
      const certa = s * c
      return {
        enunciado: `Bia somou ${a} e ${b} e multiplicou o resultado por ${c}. Qual escrita está certa?`,
        formato: 'escolha',
        ...girar(r, [
          { texto: `(${a} + ${b}) × ${c} = ${certa}`, certa: true },
          { texto: `${a} + ${b} = ${s} × ${c} = ${certa}`, erro: 'igual-encadeado' },
          { texto: `${a} + ${b} × ${c} = ${certa}`, erro: 'ignora-parenteses' },
        ]),
        dicas: ['O sinal = só fica entre coisas que valem o mesmo.', `Leia cada =. ${a} + ${b} vale ${s}, e ${s} × ${c} vale ${certa}: não são iguais.`, `A escrita certa é (${a} + ${b}) × ${c} = ${certa}.`],
      }
    }
    let e: string
    let dicas: Item['dicas']
    if (forma === 0) {
      const a = r.int(2, 9)
      const c = r.int(1, 8)
      const b = c + r.int(2, 9)
      e = `${a} × (${b} − ${c})`
      dicas = ['Primeiro o que está dentro dos parênteses.', `Dentro dos parênteses: ${b} − ${c} = ${b - c}.`, `${a} × ${b - c} = ${a * (b - c)}.`]
    } else if (forma === 1) {
      const b = r.int(3, 20)
      const c = r.int(3, 20)
      const a = b + c + r.int(1, 30)
      e = `${a} − (${b} + ${c})`
      dicas = ['Primeiro o que está dentro dos parênteses.', `Dentro dos parênteses: ${b} + ${c} = ${b + c}.`, `${a} − ${b + c} = ${a - b - c}.`]
    } else if (forma === 2) {
      const q = r.int(2, 5)
      const d = r.int(1, 6)
      const c = q + d
      const s = q * r.int(2, 9)
      const a = r.int(1, s - 1)
      const b = s - a
      e = `(${a} + ${b}) ÷ (${c} − ${d})`
      dicas = ['Resolva os dois parênteses antes de dividir.', `${a} + ${b} = ${s} e ${c} − ${d} = ${q}.`, `${s} ÷ ${q} = ${s / q}.`]
    } else {
      const c = r.int(1, 9)
      const b = c + r.int(1, 6)
      const d = r.int(2, 6)
      const a = r.int(1, 20)
      e = `${a} + (${b} − ${c}) × ${d}`
      dicas = ['Primeiro os parênteses, depois o ×, por último o +.', `${b} − ${c} = ${b - c}, e ${b - c} × ${d} = ${(b - c) * d}.`, `${a} + ${(b - c) * d} = ${a + (b - c) * d}.`]
    }
    const certa = avaliar(e)
    return {
      enunciado: `Resolva: ${e}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[avaliar(e, 'sem-parenteses'), 'ignora-parenteses']]),
      dicas,
    }
  },
}

export const parentesesN3: Gerador = {
  id: 'parenteses-n3',
  aula: 'B.U5.A2',
  nivel: 3,
  gerar(r) {
    const forma = r.int(0, 2)
    if (forma === 0) {
      const n = r.int(2, 5)
      const total = n * r.int(12, 40)
      const b = r.int(6, 20)
      const a = total - b
      const certa = total / n
      return {
        enunciado: `${n} amigos dividem R$ ${a} de pizza e R$ ${b} de suco. Quanto cada um paga?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[avaliar(`${a} + ${b} ÷ ${n}`), 'ignora-parenteses']]),
        dicas: ['Junte a conta toda antes de dividir: (pizza + suco) ÷ pessoas.', `Primeiro ${a} + ${b} = ${total}.`, `${total} ÷ ${n} = ${certa}. Cada um paga R$ ${certa}.`],
      }
    }
    if (forma === 1) {
      const n = r.int(2, 6)
      const a = r.int(8, 25)
      const b = r.int(2, 6)
      const certa = n * (a + b)
      return {
        enunciado: `Você compra ${n} kits, cada um com um caderno de R$ ${a} e uma caneta de R$ ${b}. Quanto paga?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[n * a + b, 'ignora-parenteses']]),
        dicas: ['Primeiro o preço de um kit. Depois multiplique: quantidade × (caderno + caneta).', `Um kit: ${a} + ${b} = ${a + b}.`, `${n} × ${a + b} = ${certa}. Você paga R$ ${certa}.`],
      }
    }
    const b = r.int(15, 60)
    const c = r.int(10, 40)
    const a = (Math.floor((b + c) / 10) + 1 + r.int(0, 5)) * 10
    const certa = a - (b + c)
    return {
      enunciado: `Você tinha R$ ${a}. Gastou R$ ${b} no mercado e R$ ${c} na farmácia. Quanto sobrou?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[a - b + c, 'ignora-parenteses'], [a + b + c, 'operacao-trocada']]),
      dicas: ['Os dois gastos saem do mesmo dinheiro: R$ ' + a + ' − (mercado + farmácia).', `Os gastos: ${b} + ${c} = ${b + c}.`, `${a} − ${b + c} = ${certa}. Sobraram R$ ${certa}.`],
    }
  },
}

// ---------------------------------------------------------------- aula 3: calculadora

/** Uma conta "a + b × c" ou "a + b ÷ c" em que a calculadora simples dá um número inteiro diferente do certo. */
function contaDeCalculadora(r: Rng, grande = false) {
  if (!grande && r.int(0, 2) === 0) {
    const c = r.int(2, 5)
    const k = r.int(2, 9)
    const m = r.int(1, 5)
    return { a: c * m, b: c * k, c, op: '÷' }
  }
  return grande ? { a: r.int(10, 40), b: r.int(3, 9), c: r.int(12, 60), op: '×' } : { a: r.int(2, 9), b: r.int(2, 9), c: r.int(2, 9), op: '×' }
}

export const calculadoraN1: Gerador = {
  id: 'calculadora-n1',
  aula: 'B.U5.A3',
  nivel: 1,
  gerar(r) {
    const { a, b, c, op } = contaDeCalculadora(r)
    const e = `${a} + ${b} ${op} ${c}`
    const visor = avaliar(e, 'esquerda')
    const p = avaliar(`${b} ${op} ${c}`)
    const certa = avaliar(e)
    return {
      enunciado: `A calculadora simples mostrou ${visor} para ${e}. Qual é o resultado certo?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[visor, 'calculadora-simples-sem-prioridade']]),
      dicas: ['A simples faz conta a conta. A regra manda fazer × e ÷ antes do +.', `Primeiro ${b} ${op} ${c} = ${p}.`, `${a} + ${p} = ${certa}.`],
      visual: calculadoras(
        [
          { nome: 'Simples', teclas: `${e} =`, visor: String(visor) },
          { nome: 'Científica', teclas: `${e} =`, visor: '?' },
        ],
        'As duas calculadoras lado a lado, com as mesmas teclas. A simples já mostra o resultado dela; o visor da científica espera, com "?", e acende ao conferir.',
      ),
    }
  },
}

export const calculadoraN2: Gerador = {
  id: 'calculadora-n2',
  aula: 'B.U5.A3',
  nivel: 2,
  gerar(r) {
    const { a, b, c, op } = contaDeCalculadora(r)
    const e = `${a} + ${b} ${op} ${c}`
    const p = avaliar(`${b} ${op} ${c}`)
    const certa = avaliar(e)
    return {
      enunciado: `Na calculadora simples, que teclas dão o resultado certo de ${e}?`,
      formato: 'escolha',
      ...girar(r, [
        { texto: `${b} ${op} ${c} = + ${a} =`, certa: true },
        { texto: `${e} =`, erro: 'calculadora-simples-sem-prioridade' },
        { texto: `${a} + ${b} = ${op} ${c} =`, erro: 'calculadora-simples-sem-prioridade' },
      ]),
      dicas: ['A simples faz conta a conta, na ordem das teclas.', `Faça primeiro ${b} ${op} ${c}. Depois some ${a}.`, `Teclas: ${b} ${op} ${c} = + ${a} =. O visor mostra ${p} e depois ${certa}.`],
    }
  },
}

export const calculadoraN3: Gerador = {
  id: 'calculadora-n3',
  aula: 'B.U5.A3',
  nivel: 3,
  gerar(r) {
    const { a, b, c } = contaDeCalculadora(r, true)
    const visor = (a + b) * c
    const p = b * c
    const certa = a + p
    const parafusos = r.int(0, 1) === 0
    return {
      enunciado: parafusos
        ? `Você tinha ${a} parafusos e comprou ${b} caixas com ${c} cada. A calculadora simples deu ${fmt(visor)}. Quantos são de fato?`
        : `Entrega de R$ ${a} mais ${b} itens de R$ ${c}. A calculadora simples deu ${fmt(visor)}. Qual é o total certo?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[visor, 'calculadora-simples-sem-prioridade']]),
      dicas: [
        'Estime antes de confiar: o visor faz sentido? A simples somou antes de multiplicar.',
        parafusos ? `As caixas: ${b} × ${c} = ${p} parafusos.` : `Os itens: ${b} × ${c} = ${p}.`,
        parafusos ? `${a} + ${p} = ${certa} parafusos.` : `${a} + ${p} = ${certa}. O total é R$ ${certa}.`,
      ],
    }
  },
}

export const GERADORES_U5: Gerador[] = [ordemN1, ordemN2, ordemN3, parentesesN1, parentesesN2, parentesesN3, calculadoraN1, calculadoraN2, calculadoraN3]
