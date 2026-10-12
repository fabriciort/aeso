import type { Gerador, Resposta, Visual } from '@/lib/formation/schema'

// Unidade 11: porcentagem (aulas 4 a 6). Que porcentagem é, variações
// sucessivas e juros simples e compostos.
//
// Toda conta é feita em inteiros: dinheiro em centavos, porcentagens em
// décimos ou centésimos de ponto. Um decimal só vira texto com vírgula no
// fim. Respostas decimais vão como texto com vírgula ('12,5'); inteiras,
// como número. As porcentagens são pedidas como número ("Quantos por
// cento?": o aluno digita 75, sem o sinal). Quando os números precisam
// combinar entre si (a conta tem de dar exata), as combinações boas são
// listadas uma vez, ao carregar o arquivo, e o gerador sorteia uma delas:
// sem laços de tentativa.

/** n em unidades de 10^-casas, com vírgula e sem zeros no fim: (125, 1) → '12,5'; (7500, 2) → '75'. */
function dec(n: number, casas: number): string {
  const s = String(n).padStart(casas + 1, '0')
  const inteira = s.slice(0, s.length - casas)
  const resto = s.slice(s.length - casas).replace(/0+$/, '')
  return resto ? `${inteira},${resto}` : inteira
}
/** Milhar com ponto, para o enunciado: 2000 → 2.000. */
const mil = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** A resposta como o aluno digita: inteiro vira número; decimal, texto com vírgula. */
function resposta(n: number, casas: number): Resposta {
  const t = dec(n, casas)
  return t.includes(',') ? t : Number(t)
}
/** Centavos em reais, como se escreve: 133100 → 'R$ 1.331'; 11025 → 'R$ 110,25'. */
const brl = (c: number) => `R$ ${mil(Math.floor(c / 100))}${c % 100 ? `,${String(c % 100).padStart(2, '0')}` : ''}`
/** Centavos sem o R$, em TeX: 110250 → '1.102{,}50'. */
const tex = (c: number) => brl(c).slice(3).replace(',', '{,}')
/** Um fator em centésimos, para as setas: 90 → '× 0,9'; 105 → '× 1,05'. */
const fator = (centesimos: number) => `× ${dec(centesimos, 2)}`

/** Erros previsíveis, sem marcar a certa e sem repetir. */
function mapa(certa: Resposta, pares: [string | undefined, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor !== undefined && valor !== String(certa) && !(valor in erros)) erros[valor] = erro
  }
  return erros
}
/** a ÷ b × 100 como o aluno digitaria, se der exato com até 2 casas; senão, nada. */
function porCento(a: number, b: number): string | undefined {
  return (a * 10000) % b === 0 ? dec((a * 10000) / b, 2) : undefined
}

type Valor = number | string
const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })
const linha = (rotulo: string, valores: Valor[]) => ({ rotulo, valores })
/** As setas entre colunas seguidas, embaixo da última linha. */
const passos = (rotulos: string[], embaixo = false) => rotulos.map((rotulo, i) => ({ de: i, para: i + 1, rotulo, ...(embaixo ? { embaixo: true } : {}) }))
const meses = (n: number) => Array.from({ length: n + 1 }, (_, i) => i)

// ---------------------------------------------------------------- aula 4: que porcentagem é?

/** A parte e o todo numa frase: os números aparecem na ordem (parte, todo). */
interface Parte {
  frase: (parte: number, todo: number) => string
}

const PARTES_N1: Parte[] = [
  { frase: (x, y) => `Você acertou ${x} de ${y} questões. Que porcentagem da prova você acertou?` },
  { frase: (x, y) => `No estacionamento, ${x} das ${y} vagas estão ocupadas. Que porcentagem das vagas está ocupada?` },
  { frase: (x, y) => `Numa caixa, ${x} das ${y} lâmpadas vieram queimadas. Que porcentagem das lâmpadas veio queimada?` },
]

export const quePorcentagemN1: Gerador = {
  id: 'que-porcentagem-n1',
  aula: 'B.U11.A4',
  nivel: 1,
  gerar(r) {
    // Todos que dividem 100: a porcentagem sai inteira.
    const s = r.pick(PARTES_N1)
    const y = r.pick([4, 5, 10, 20, 25])
    const x = r.int(1, y - 1)
    const certa = (100 * x) / y
    return {
      enunciado: s.frase(x, y),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(x), 'parte-como-porcentagem'],
        [porCento(y, x), 'divide-todo-pela-parte'],
        [dec(certa, 2), 'esquece-multiplicar-por-100'],
      ]),
      dicas: [
        'Porcentagem é quantos de cada 100. Divida a parte pelo todo.',
        `$${x} \\div ${y} = ${dec(certa, 2).replace(',', '{,}')}$.`,
        `${dec(certa, 2)} são ${certa} centésimos: ${certa} %.`,
      ],
      visual: { modelo: 'barra', estado: { partes: y, pintadas: x }, esboco: `Uma barra partida em ${y} partes, com ${x} em âmbar e ${x}/${y} à direita.` },
    }
  },
}

/** Combinações (valor, porcentagem) com a parte inteira em reais; o valor nunca é 100 (aí a parte já seria a porcentagem). */
const COMBOS_REAIS: [number, number][] = []
for (let v = 60; v <= 600; v += 10) {
  for (const p of [5, 10, 15, 20, 25, 30, 40, 50, 60, 75]) {
    if (v !== 100 && (v * p) % 100 === 0) COMBOS_REAIS.push([v, p])
  }
}
const PRODUTOS = ['Um par de tênis', 'Um casaco', 'Um liquidificador', 'Um ventilador', 'Uma mochila', 'Um jogo de panelas']
const CONTAS = ['luz', 'água', 'internet', 'gás']

export const quePorcentagemN2: Gerador = {
  id: 'que-porcentagem-n2',
  aula: 'B.U11.A4',
  nivel: 2,
  gerar(r) {
    const [v, p] = r.pick(COMBOS_REAIS)
    const parte = (v * p) / 100
    const desconto = r.int(0, 1) === 0
    const enunciado = desconto
      ? `${r.pick(PRODUTOS)} de R$ ${v} está com R$ ${parte} de desconto. De quantos por cento é o desconto?`
      : `A conta de ${r.pick(CONTAS)} foi de R$ ${v} para R$ ${mil(v + parte)}. De quantos por cento foi o aumento?`
    return {
      enunciado,
      formato: 'numero',
      resposta: p,
      erros: mapa(p, [
        [String(parte), 'parte-como-porcentagem'],
        [desconto ? porCento(v, parte) : porCento(parte, v + parte), desconto ? 'divide-todo-pela-parte' : 'porcentagem-sobre-o-valor-errado'],
        [dec(p, 2), 'esquece-multiplicar-por-100'],
      ]),
      dicas: desconto
        ? ['O desconto é a parte; o preço é o todo, o 100 %.', `Divida o desconto pelo preço: $${parte} \\div ${v}$.`, `$${parte} \\div ${v} = ${dec(p, 2).replace(',', '{,}')}$: ${p} %.`]
        : ['O aumento é a parte; a conta de antes é o todo, o 100 %.', `A conta subiu $${mil(v + parte)} - ${v} = ${parte}$. Divida por ${v}.`, `$${parte} \\div ${v} = ${dec(p, 2).replace(',', '{,}')}$: ${p} %.`],
      visual: tab(
        { linhas: [linha('reais', [v, parte]), linha('porcentagem', ['100 %', '?'])] },
        desconto
          ? `A tabela: o preço, R$ ${v}, ao lado de 100 %; o desconto, R$ ${parte}, ao lado de "?".`
          : `A tabela: a conta de antes, R$ ${v}, ao lado de 100 %; o aumento, R$ ${parte}, ao lado de "?".`,
      ),
    }
  },
}

/** Salário e gasto (salário, porcentagem em décimos): o gasto sai inteiro em reais. */
const COMBOS_SALARIO: [number, number][] = []
for (let s = 1500; s <= 6000; s += 500) {
  for (let p = 50; p <= 500; p += 25) {
    if ((s * p) % 1000 === 0) COMBOS_SALARIO.push([s, p])
  }
}
/** Turma e faltas (alunos, faltas): a porcentagem com até uma casa. */
const COMBOS_TURMA: [number, number][] = []
for (const n of [8, 16, 20, 24, 25, 32, 40]) {
  for (let k = 1; k < n / 2; k++) {
    if ((k * 1000) % n === 0) COMBOS_TURMA.push([n, k])
  }
}

export const quePorcentagemN3: Gerador = {
  id: 'que-porcentagem-n3',
  aula: 'B.U11.A4',
  nivel: 3,
  gerar(r) {
    // A porcentagem em décimos de ponto: 125 é 12,5 %.
    let todo: number
    let parte: number
    let enunciado: string
    if (r.int(0, 1) === 0) {
      const [s, p] = r.pick(COMBOS_SALARIO)
      todo = s
      parte = (s * p) / 1000
      enunciado = r.int(0, 1) === 0
        ? `De um salário de R$ ${mil(s)}, R$ ${mil(parte)} vão para o aluguel. Quantos por cento do salário vão para o aluguel?`
        : `Uma família ganha R$ ${mil(s)} por mês e gasta R$ ${mil(parte)} no mercado. Quantos por cento da renda vão para o mercado?`
    } else {
      const [n, k] = r.pick(COMBOS_TURMA)
      todo = n
      parte = k
      enunciado = `Numa turma de ${n} alunos, ${k} faltaram hoje. Quantos por cento da turma faltaram?`
    }
    const decimos = (parte * 1000) / todo
    const certa = resposta(decimos, 1)
    return {
      enunciado,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(parte), 'parte-como-porcentagem'],
        [porCento(todo, parte), 'divide-todo-pela-parte'],
        [dec(decimos, 3), 'esquece-multiplicar-por-100'],
      ]),
      dicas: [
        'Divida a parte pelo todo e multiplique por 100.',
        `$${mil(parte)} \\div ${mil(todo)} = ${dec(decimos, 3).replace(',', '{,}')}$.`,
        `${dec(decimos, 3)} × 100 = ${dec(decimos, 1)}: são ${dec(decimos, 1)} %.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: variações sucessivas

const PRECOS_N1 = [100, 200, 300, 400, 500, 600, 800, 1000, 1200, 1500, 2000]

export const variacoesN1: Gerador = {
  id: 'variacoes-n1',
  aula: 'B.U11.A5',
  nivel: 1,
  gerar(r) {
    const p = r.pick(PRECOS_N1)
    const a = r.pick([10, 20, 50])
    const b = r.pick([10, 20, 50])
    const meio = (p * (100 - a)) / 100
    const certa = (meio * (100 - b)) / 100
    const produto = r.pick(['uma TV', 'um sofá', 'uma bicicleta', 'um celular'])
    return {
      enunciado: `Na loja, ${produto} de R$ ${mil(p)} tem ${a} % de desconto e, no caixa, mais ${b} % sobre o preço novo. Quantos reais você paga?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[String((p * (100 - a - b)) / 100), 'soma-porcentagens-sucessivas']]),
      dicas: [
        'O segundo desconto age sobre o preço que já baixou, não sobre o preço inicial.',
        `Primeiro desconto: $${mil(p)} \\times ${dec(100 - a, 2).replace(',', '{,}')} = ${mil(meio)}$. Agora tire ${b} % de ${mil(meio)}.`,
        `$${mil(meio)} \\times ${dec(100 - b, 2).replace(',', '{,}')} = ${mil(certa)}$: você paga R$ ${mil(certa)}.`,
      ],
      visual: tab(
        { linhas: [linha('preço (R$)', [p, meio, '?'])], setas: passos([fator(100 - a), fator(100 - b)]) },
        `A tabela do preço: ${mil(p)}, ${mil(meio)} depois de ${fator(100 - a)}, e "?" depois de ${fator(100 - b)}.`,
      ),
    }
  },
}

/** Taxas que mudam (antes, depois), em %: a variação relativa sai inteira e não é a diferença. */
const COMBOS_TAXAS: [number, number][] = []
for (let x = 2; x <= 20; x++) {
  for (let y = 1; y <= 30; y++) {
    const d = Math.abs(y - x)
    if (y === x || (d * 100) % x !== 0) continue
    const rel = (d * 100) / x
    if (rel <= 100 && rel !== d) COMBOS_TAXAS.push([x, y])
  }
}
const PRECOS_N2 = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 2000]

export const variacoesN2: Gerador = {
  id: 'variacoes-n2',
  aula: 'B.U11.A5',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Sobe e cai a mesma porcentagem (ou cai e sobe): × (1 + a) × (1 − a).
      const p = r.pick(PRECOS_N2)
      const a = r.pick([10, 20, 30, 50])
      const sobe = r.int(0, 1) === 0
      const f1 = sobe ? 100 + a : 100 - a
      const f2 = sobe ? 100 - a : 100 + a
      const meio = (p * f1) / 100
      const certa = (meio * f2) / 100
      return {
        enunciado: sobe
          ? `Um produto de R$ ${mil(p)} subiu ${a} % e, no mês seguinte, caiu ${a} %. Quantos reais ele custa agora?`
          : `Um produto de R$ ${mil(p)} caiu ${a} % e, no mês seguinte, subiu ${a} %. Quantos reais ele custa agora?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[String(p), 'sobe-e-desce-volta-ao-mesmo']]),
        dicas: [
          `Os dois ${a} % não são do mesmo valor: o segundo age sobre o preço novo.`,
          `Depois da primeira mudança: $${mil(p)} \\times ${dec(f1, 2).replace(',', '{,}')} = ${mil(meio)}$.`,
          `$${mil(meio)} \\times ${dec(f2, 2).replace(',', '{,}')} = ${mil(certa)}$: R$ ${mil(certa)}, menos que no começo.`,
        ],
        visual: tab(
          { linhas: [linha('preço (R$)', [p, meio, '?'])], setas: passos([fator(f1), fator(f2)]) },
          `A tabela do preço: ${mil(p)}, ${mil(meio)} depois de ${fator(f1)}, e "?" depois de ${fator(f2)}.`,
        ),
      }
    }
    // Pontos percentuais × porcentagem.
    const [x, y] = r.pick(COMBOS_TAXAS)
    const d = Math.abs(y - x)
    const certa = (d * 100) / x
    const subiu = y > x
    return {
      enunciado: subiu
        ? `Os juros do cartão foram de ${x} % para ${y} % ao mês. Os juros ficaram quantos por cento mais caros?`
        : `Os juros do cartão foram de ${x} % para ${y} % ao mês. Os juros ficaram quantos por cento mais baratos?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[String(d), 'confunde-ponto-percentual']]),
      dicas: [
        `A diferença, ${d}, está em pontos percentuais. A pergunta é: ${d} em cima de quanto?`,
        `Compare com a taxa de antes: $${d} \\div ${x}$.`,
        `$${d} \\div ${x} = ${dec(certa, 2).replace(',', '{,}')}$: ${certa} %.`,
      ],
      visual: {
        modelo: 'grade',
        estado: { grades: [{ pintadas: x, rotulo: `${x} %` }, { pintadas: y, rotulo: `${y} %` }] },
        esboco: `Duas grades: ${x} quadradinhos (${x} %) e ${y} quadradinhos (${y} %). A diferença é de ${d} quadradinhos.`,
      },
    }
  },
}

export const variacoesN3: Gerador = {
  id: 'variacoes-n3',
  aula: 'B.U11.A5',
  nivel: 3,
  gerar(r) {
    // A variação total em centésimos de ponto: 1925 é 19,25 %.
    const modo = r.int(0, 2)
    if (modo === 0) {
      const a = r.pick([5, 10, 15, 20, 25, 30, 40, 50])
      const b = r.pick([5, 10, 20, 25, 50])
      const pago = (100 - a) * (100 - b)
      const total = 10000 - pago
      const certa = resposta(total, 2)
      return {
        enunciado: `A loja dá ${a} % de desconto e, no Pix, mais ${b} % sobre o preço novo. Qual é o desconto total, em porcentagem?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[String(a + b), 'soma-porcentagens-sucessivas']]),
        dicas: [
          'Multiplique os fatores dos dois descontos. O que falta para 100 % é o desconto.',
          `$${dec(100 - a, 2).replace(',', '{,}')} \\times ${dec(100 - b, 2).replace(',', '{,}')} = ${dec(pago, 4).replace(',', '{,}')}$: você paga ${dec(pago, 2)} % do preço.`,
          `100 − ${dec(pago, 2)} = ${dec(total, 2)}: o desconto total é de ${dec(total, 2)} %.`,
        ],
      }
    }
    if (modo === 1) {
      const a = r.pick([5, 10, 20, 25, 50])
      const b = r.pick([5, 10, 20, 25, 50])
      const novo = (100 + a) * (100 + b)
      const total = novo - 10000
      const certa = resposta(total, 2)
      return {
        enunciado: `O aluguel subiu ${a} % num ano e ${b} % no ano seguinte. Quanto ele subiu no total, em porcentagem?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[String(a + b), 'soma-porcentagens-sucessivas']]),
        dicas: [
          'O segundo aumento age sobre o aluguel que já subiu. Multiplique os fatores.',
          `$${dec(100 + a, 2).replace(',', '{,}')} \\times ${dec(100 + b, 2).replace(',', '{,}')} = ${dec(novo, 4).replace(',', '{,}')}$: o aluguel foi a ${dec(novo, 2)} % do que era.`,
          `${dec(novo, 2)} − 100 = ${dec(total, 2)}: subiu ${dec(total, 2)} % no total.`,
        ],
      }
    }
    const a = r.pick([10, 15, 20, 25, 30, 40, 50])
    const total = a * a
    const certa = resposta(total, 2)
    return {
      enunciado: `Uma ação da bolsa subiu ${a} % num dia e caiu ${a} % no dia seguinte. Quantos por cento ela ficou abaixo do começo?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [['0', 'sobe-e-desce-volta-ao-mesmo']]),
      dicas: [
        `Os dois ${a} % não se cancelam: a queda age sobre o valor que já subiu.`,
        `$${dec(100 + a, 2).replace(',', '{,}')} \\times ${dec(100 - a, 2).replace(',', '{,}')} = ${dec(10000 - total, 4).replace(',', '{,}')}$: ela vale ${dec(10000 - total, 2)} % do começo.`,
        `100 − ${dec(10000 - total, 2)} = ${dec(total, 2)}: ficou ${dec(total, 2)} % abaixo.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: juros simples e compostos

const CAPITAIS_N1 = [500, 1000, 1500, 2000, 2500, 3000, 4000, 5000]

export const jurosN1: Gerador = {
  id: 'juros-n1',
  aula: 'B.U11.A6',
  nivel: 1,
  gerar(r) {
    const c = r.pick(CAPITAIS_N1)
    const i = r.pick([1, 2, 3, 4, 5, 10])
    const n = r.int(2, 4)
    const j = (c * i) / 100
    const certa = c + n * j
    const deve = r.int(0, 1) === 0
    return {
      enunciado: deve
        ? `Você pega R$ ${mil(c)} emprestado a ${i} % ao mês, juros simples. Quantos reais deve depois de ${n} meses?`
        : `Você aplica R$ ${mil(c)} a ${i} % ao mês, juros simples. Quantos reais terá depois de ${n} meses?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[String(n * j), 'juros-sem-o-valor-inicial']]),
      dicas: [
        `Nos juros simples, a taxa de ${i} % age sempre sobre os R$ ${mil(c)}: os juros são iguais todo mês.`,
        `${i} % de ${mil(c)} são R$ ${mil(j)} por mês. Em ${n} meses: $${n} \\times ${mil(j)} = ${mil(n * j)}$.`,
        `$${mil(c)} + ${mil(n * j)} = ${mil(certa)}$: R$ ${mil(certa)}.`,
      ],
      visual: tab(
        { linhas: [linha('mês', meses(n)), linha(deve ? 'dívida (R$)' : 'saldo (R$)', [c, ...Array(n).fill('?')])], setas: passos(Array(n).fill(`+ ${mil(j)}`), true) },
        `A tabela com os meses 0 a ${n} em cima e o valor embaixo: R$ ${mil(c)} no mês 0 e "?" nos outros, com + ${mil(j)} em cada passo.`,
      ),
    }
  },
}

/** Juros compostos (capital, taxa, meses) com o total exato em centavos. */
const COMBOS_COMPOSTOS: [number, number, number][] = []
for (let c = 100; c <= 5000; c += 100) {
  for (const i of [2, 5, 10, 20]) {
    for (const n of [2, 3]) {
      // Centavos: c × 100 × (100 + i)^n ÷ 100^n.
      if ((c * 100 * (100 + i) ** n) % 100 ** n === 0) COMBOS_COMPOSTOS.push([c, i, n])
    }
  }
}
/** O total dos juros compostos, em centavos. */
const montante = (c: number, i: number, n: number) => (c * 100 * (100 + i) ** n) / 100 ** n

export const jurosN2: Gerador = {
  id: 'juros-n2',
  aula: 'B.U11.A6',
  nivel: 2,
  gerar(r) {
    const [c, i, n] = r.pick(COMBOS_COMPOSTOS)
    const etapas = meses(n).map((k) => montante(c, i, k))
    const total = etapas[n]
    const certa = resposta(total, 2)
    const simples = c * 100 + c * i * n
    return {
      enunciado: `Você deve R$ ${mil(c)} a ${i} % ao mês, juros compostos. Quantos reais vai dever depois de ${n} meses?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dec(simples, 2), 'juros-compostos-como-simples'],
        [dec(total - c * 100, 2), 'juros-sem-o-valor-inicial'],
      ]),
      dicas: [
        `Nos juros compostos, os ${i} % são sobre a dívida de cada mês: multiplique por ${dec(100 + i, 2)} a cada mês.`,
        `Depois de 1 mês: $${mil(c)} \\times ${dec(100 + i, 2).replace(',', '{,}')} = ${tex(etapas[1])}$. Repita.`,
        `${etapas.slice(1).map((e) => brl(e)).join(', depois ')}: no fim, ${brl(total)}.`,
      ],
      visual: tab(
        { linhas: [linha('mês', meses(n)), linha('dívida (R$)', [c, ...Array(n).fill('?')])], setas: passos(Array(n).fill(fator(100 + i)), true) },
        `A tabela com os meses 0 a ${n} em cima e a dívida embaixo: R$ ${mil(c)} no mês 0 e "?" nos outros, com ${fator(100 + i)} em cada passo.`,
      ),
    }
  },
}

/** À vista e parcelado (à vista, parcelas, valor da parcela): o parcelado custa uma porcentagem inteira a mais. */
const COMBOS_PARCELADO: [number, number, number][] = []
for (let v = 500; v <= 3000; v += 100) {
  for (let p = 5; p <= 40; p += 5) {
    const t = (v * (100 + p)) / 100
    for (const n of [3, 4, 5, 6, 10, 12]) {
      if (Number.isInteger(t) && t % n === 0) COMBOS_PARCELADO.push([v, n, t / n])
    }
  }
}

export const jurosN3: Gerador = {
  id: 'juros-n3',
  aula: 'B.U11.A6',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const [v, n, q] = r.pick(COMBOS_PARCELADO)
      const t = n * q
      const certa = ((t - v) * 100) / v
      const produto = r.pick(['A geladeira', 'O notebook', 'A máquina de lavar', 'O sofá'])
      return {
        enunciado: `${produto} custa R$ ${mil(v)} à vista ou ${n} × R$ ${mil(q)} sem juros. Quantos por cento o parcelado custa a mais?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [String(t - v), 'parte-como-porcentagem'],
          [porCento(t - v, t), 'porcentagem-sobre-o-valor-errado'],
        ]),
        dicas: [
          'Ache o total do parcelado. A diferença é a parte; o à vista é o todo.',
          `$${n} \\times ${mil(q)} = ${mil(t)}$: são R$ ${mil(t - v)} a mais. Divida por ${mil(v)}.`,
          `$${mil(t - v)} \\div ${mil(v)} = ${dec(certa, 2).replace(',', '{,}')}$: ${certa} % a mais.`,
        ],
      }
    }
    const [c, i, n] = r.pick(COMBOS_COMPOSTOS)
    const juros = montante(c, i, n) - c * 100
    const certa = resposta(juros, 2)
    return {
      enunciado: `Uma dívida de R$ ${mil(c)} ficou ${n} meses no cartão a ${i} % ao mês, juros compostos. Quantos reais são só de juros?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[dec(c * i * n, 2), 'juros-compostos-como-simples']]),
      dicas: [
        `A dívida é multiplicada por ${dec(100 + i, 2)} a cada mês. Os juros são o que ela cresceu.`,
        `Em ${n} meses, a dívida vai a ${brl(montante(c, i, n))}.`,
        `${brl(montante(c, i, n))} − R$ ${mil(c)} = ${brl(juros)} de juros.`,
      ],
    }
  },
}

export const GERADORES_U11B: Gerador[] = [
  quePorcentagemN1,
  quePorcentagemN2,
  quePorcentagemN3,
  variacoesN1,
  variacoesN2,
  variacoesN3,
  jurosN1,
  jurosN2,
  jurosN3,
]
