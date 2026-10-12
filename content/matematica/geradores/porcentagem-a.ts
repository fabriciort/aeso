import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 11: porcentagem (aulas 1 a 3). Por cento é por cem, porcentagem
// de um valor e aumento e desconto com fator. Todo número com vírgula é
// guardado como um inteiro n e um número de casas decimais d (o valor é
// n ÷ 10^d), para nenhuma conta passar por um decimal de JavaScript. O
// dinheiro vai em centavos: p % de R$ v são v × p centavos.

/** Os algarismos de n ÷ 10^d: a parte inteira e a decimal, sem zeros no fim. */
function partes(n: number, d: number): [string, string] {
  if (d <= 0) return [String(n * 10 ** -d), '']
  const s = String(n).padStart(d + 1, '0')
  return [s.slice(0, s.length - d), s.slice(s.length - d).replace(/0+$/, '')]
}
const milhar = (i: string) => i.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** Para a tela: (2400, 0) → "2.400"; (15, 1) → "1,5"; (5, 2) → "0,05". */
const escrito = (n: number, d = 0) => {
  const [i, f] = partes(n, d)
  return f ? `${milhar(i)},${f}` : milhar(i)
}
/** Como o aluno digita: um inteiro vira número; um decimal, texto com vírgula ('2,5'). */
const resposta = (n: number, d = 0): number | string => {
  const [i, f] = partes(n, d)
  return f ? `${i},${f}` : Number(i)
}
const dig = (n: number, d = 0) => String(resposta(n, d))
/** Dinheiro em centavos, para a tela: 5400 → "R$ 54"; 450 → "R$ 4,50"; 150000 → "R$ 1.500". */
const moeda = (c: number) => (c % 100 === 0 ? `R$ ${milhar(String(c / 100))}` : `R$ ${milhar(String(Math.floor(c / 100)))},${String(c % 100).padStart(2, '0')}`)
/** p ÷ q como texto digitado, se a divisão for exata em até 4 casas; senão, null. */
function divisao(p: number, q: number): string | null {
  for (let d = 0; d <= 4; d++) if ((p * 10 ** d) % q === 0) return dig((p * 10 ** d) / q, d)
  return null
}

/** "0,50" e "0,5" são o mesmo número. */
const norm = (s: string) => (s.includes(',') ? s.replace(/0+$/, '').replace(/,$/, '') : s)
/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number | string, pares: [string | null, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  const vistos = new Set([norm(String(certa))])
  for (const [valor, erro] of pares) {
    if (valor === null || vistos.has(norm(valor))) continue
    vistos.add(norm(valor))
    erros[valor] = erro
  }
  return erros
}

type Op = { texto: string; certa?: boolean; erro?: string }
function embaralhar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const resto = [...opcoes]
  const ordem: Op[] = []
  while (resto.length) ordem.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

const grade = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'grade', estado, esboco })
const barra = (estado: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'barra', estado, esboco })
const tabela = (t: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela: t }, esboco })

// ---------------------------------------------------------------- aula 1: por cento é por cem

export const porCentoN1: Gerador = {
  id: 'por-cento-n1',
  aula: 'B.U11.A1',
  nivel: 1,
  gerar(r) {
    const c = r.int(1, 9)
    const s = r.int(1, 9)
    const p = 10 * c + s
    return {
      enunciado: 'A grade inteira é a bateria cheia: **100 quadradinhos**. Quantos por cento estão pintados?',
      fala: 'A grade inteira é a bateria cheia: cem quadradinhos. Quantos por cento estão pintados?',
      formato: 'numero',
      resposta: p,
      erros: mapa(p, [[String(c + s), 'conta-grupos-como-unidades']]),
      dicas: [
        'Cada quadradinho é 1 %. Cada coluna cheia tem 10 quadradinhos: 10 %.',
        `São ${c} colunas cheias: ${10 * c} %. Agora some os quadradinhos soltos.`,
        `${10 * c} % + ${s} % = ${p} %.`,
      ],
      visual: grade({ pintadas: p, semRotulo: true }, `A grade 10 × 10 com ${c} colunas cheias e ${s} quadradinhos pintados, sem número embaixo.`),
    }
  },
}

export const porCentoN2: Gerador = {
  id: 'por-cento-n2',
  aula: 'B.U11.A1',
  nivel: 2,
  gerar(r) {
    // Os casos que pegam: um algarismo só (5 %), dezenas redondas (30 %) e os outros (25 %).
    const tipo = r.int(0, 2)
    const p = tipo === 0 ? r.int(1, 9) : tipo === 1 ? 10 * r.int(1, 9) : 10 * r.int(1, 9) + r.int(1, 9)
    const fracao = `$\\frac{${p}}{100}$`
    if (r.int(0, 1) === 0) {
      // Da porcentagem para o decimal.
      const certa = resposta(p, 2)
      const errado: [string, string] =
        tipo === 0 ? [dig(p, 1), 'esquece-zero-decimal'] : tipo === 1 ? [dig(p, 3), 'troca-decimo-centesimo'] : [dig(p, 1), 'troca-10-e-1-por-cento']
      return {
        enunciado: `Escreva **${p} %** como número decimal.`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[String(p), 'porcentagem-como-numero-inteiro'], errado]),
        dicas: [
          'Por cento é de cada 100: a porcentagem é uma fração com 100 embaixo.',
          `${p} % = ${fracao}. Quantos centésimos são?`,
          `${fracao} = ${escrito(p, 2)}.`,
        ],
      }
    }
    // Do decimal para a porcentagem.
    const errado: [string, string] =
      tipo === 0 ? [String(10 * p), 'esquece-zero-decimal'] : tipo === 1 ? [String(p / 10), 'troca-decimo-centesimo'] : [dig(p, 1), 'troca-10-e-1-por-cento']
    return {
      enunciado: `O número **${escrito(p, 2)}** é quantos por cento?`,
      formato: 'numero',
      resposta: p,
      erros: mapa(p, [errado]),
      dicas: [
        'Por cento é de cada 100: conte os centésimos.',
        `${escrito(p, 2)} = ${fracao}.`,
        `${p} centésimos: ${p} %.`,
      ],
    }
  },
}

/** Frações cujo denominador cabe em 100 um número inteiro de vezes. */
const DENOMINADORES = [2, 4, 5, 10, 20, 25, 50]
const EM_CADA: ((a: number, b: number) => string)[] = [
  (a, b) => `Numa pesquisa, **${a} em cada ${b}** pessoas preferem café. Quantos por cento é isso?`,
  (a, b) => `**${a} de cada ${b}** vagas do estacionamento estão ocupadas. Quantos por cento estão ocupadas?`,
  (a, b) => `Na turma, **${a} em cada ${b}** alunos vêm de ônibus. Quantos por cento da turma?`,
  (a, b) => `O time ganhou **${a} de cada ${b}** jogos. Quantos por cento dos jogos ele ganhou?`,
]

export const porCentoN3: Gerador = {
  id: 'por-cento-n3',
  aula: 'B.U11.A1',
  nivel: 3,
  gerar(r) {
    const frase = r.pick(EM_CADA)
    const b = r.pick(DENOMINADORES)
    const a = r.int(1, b - 1)
    const k = 100 / b
    const certa = a * k
    return {
      enunciado: frase(a, b),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [`${a},${b}`, 'fracao-vira-virgula'],
        [String(a), 'porcentagem-como-numero-inteiro'],
      ]),
      dicas: [
        'Por cento é de cada 100. Quantos seriam em cada 100?',
        `${b} × ${k} = 100. Multiplique os dois números por ${k}.`,
        `${a} × ${k} = ${certa}: ${certa} em cada 100, ${certa} %.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: porcentagem de um valor

export const porcentagemDeValorN1: Gerador = {
  id: 'porcentagem-de-valor-n1',
  aula: 'B.U11.A2',
  nivel: 1,
  gerar(r) {
    const p = r.pick([10, 10, 50])
    const v = 10 * r.int(2, 40)
    const c = v * p
    const certa = resposta(c, 2)
    const dez = p === 10
    return {
      enunciado: `Quanto é **${p} %** de **R$ ${v}**, em reais?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(p), 'porcentagem-como-numero-inteiro'],
        dez ? [divisao(v, 100), 'troca-10-e-1-por-cento'] : [divisao(v, 50), 'divide-pelo-numero-da-porcentagem'],
      ]),
      dicas: dez
        ? ['10 % é uma parte de 10: divida por 10.', `Corte R$ ${v} em 10 partes iguais.`, `${v} ÷ 10 = ${escrito(c, 2)}: ${moeda(c)}.`]
        : ['50 % é a metade.', `A metade de R$ ${v}.`, `${v} ÷ 2 = ${escrito(c, 2)}: ${moeda(c)}.`],
      visual: barra({ partes: 10, pintadas: p / 10, rotulo: `${p} %` }, `A barra de R$ ${v} em 10 partes, ${p / 10} em âmbar, com "${p} %" à direita.`),
    }
  },
}

/** Por onde se chega a cada porcentagem na tabela: [colunas de %, setas]. */
const CAMINHO: Record<number, [number[], string[]]> = {
  1: [[100, 1], ['÷ 100']],
  5: [[100, 10, 5], ['÷ 10', '÷ 2']],
  20: [[100, 10, 20], ['÷ 10', '× 2']],
  25: [[100, 50, 25], ['÷ 2', '÷ 2']],
}

export const porcentagemDeValorN2: Gerador = {
  id: 'porcentagem-de-valor-n2',
  aula: 'B.U11.A2',
  nivel: 2,
  gerar(r) {
    const p = r.pick([1, 5, 20, 25])
    // Valores que dão no máximo centavos redondos: 1 % de 350 é 3,50; 5 % de 30 é 1,50.
    const v = p === 1 ? 10 * r.int(10, 99) : p === 5 ? 10 * r.int(3, 50) : p === 20 ? 5 * r.int(3, 40) : 4 * r.int(5, 50)
    const c = v * p
    const certa = resposta(c, 2)
    const pares: [string | null, string][] = [[String(p), 'porcentagem-como-numero-inteiro']]
    let dicas: [string, string, string]
    if (p === 1) {
      pares.push([divisao(v, 10), 'troca-10-e-1-por-cento'])
      dicas = ['1 % é dividir por 100.', `R$ ${v} ÷ 100: a vírgula anda duas casas para a esquerda.`, `${v} ÷ 100 = ${escrito(c, 2)}: ${moeda(c)}.`]
    } else if (p === 5) {
      pares.push([divisao(v, 2), 'esquece-zero-decimal'], [divisao(v, 5), 'divide-pelo-numero-da-porcentagem'])
      dicas = ['5 % é a metade de 10 %.', `10 % de R$ ${v} são ${moeda(v * 10)}. Agora a metade.`, `A metade de ${moeda(v * 10)}: ${moeda(c)}.`]
    } else if (p === 20) {
      pares.push([divisao(v, 20), 'divide-pelo-numero-da-porcentagem'])
      dicas = ['20 % é o dobro de 10 %.', `10 % de R$ ${v} são ${moeda(v * 10)}. Agora o dobro.`, `2 × ${moeda(v * 10)} = ${moeda(c)}.`]
    } else {
      pares.push([divisao(v, 25), 'divide-pelo-numero-da-porcentagem'])
      dicas = ['25 % é a metade da metade.', `50 % de R$ ${v} são ${moeda(v * 50)}. Agora a metade disso.`, `A metade de ${moeda(v * 50)}: ${moeda(c)}.`]
    }
    const [cols, setas] = CAMINHO[p]
    return {
      enunciado: `Quanto é **${p} %** de **R$ ${v}**, em reais?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares),
      dicas,
      visual: tabela(
        {
          linhas: [{ rotulo: 'porcentagem (%)', valores: cols }, { rotulo: 'valor (R$)', valores: [v, ...cols.slice(1).map(() => '?')] }],
          setas: setas.map((rotulo, i) => ({ de: i, para: i + 1, rotulo })),
        },
        `A tabela: 100 % e R$ ${v}; depois ${cols.slice(1).join(' % e ')} %, com os reais em "?". Em cima, as setas ${setas.join(' e ')}.`,
      ),
    }
  },
}

/** Como montar cada porcentagem com as de cabeça. */
const MONTAGEM: Record<number, string> = {
  2: '2 × 1 %',
  5: 'a metade de 10 %',
  12: '10 % + 2 × 1 %',
  15: '10 % + 5 %',
  30: '3 × 10 %',
  35: '3 × 10 % + 5 %',
  40: '4 × 10 %',
  45: '4 × 10 % + 5 %',
  60: '50 % + 10 %',
  75: '50 % + 25 %',
}
/** [frase com o valor e a porcentagem, o valor em reais]. */
const VALORES: [(v: string, p: number) => string, (r: Rng) => number][] = [
  [(v, p) => `A conta do restaurante deu **R$ ${v}**. Quanto é a gorjeta de **${p} %**, em reais?`, (r) => 10 * r.int(4, 30)],
  [(v, p) => `Você ganha **${p} %** de comissão numa venda de **R$ ${v}**. Quanto é a comissão, em reais?`, (r) => 100 * r.int(5, 60)],
  [(v, p) => `A entrada do carro é **${p} %** de **R$ ${v}**. Quanto é a entrada, em reais?`, (r) => 1000 * r.int(20, 90)],
  [(v, p) => `Do salário de **R$ ${v}**, você guarda **${p} %**. Quanto você guarda, em reais?`, (r) => 100 * r.int(15, 60)],
]

export const porcentagemDeValorN3: Gerador = {
  id: 'porcentagem-de-valor-n3',
  aula: 'B.U11.A2',
  nivel: 3,
  gerar(r) {
    const [frase, valor] = r.pick(VALORES)
    const p = r.pick([2, 5, 12, 15, 30, 35, 40, 45, 60, 75])
    const v = valor(r)
    const c = v * p
    const certa = resposta(c, 2)
    return {
      enunciado: frase(escrito(v), p),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(p), 'porcentagem-como-numero-inteiro'],
        [divisao(v, p), 'divide-pelo-numero-da-porcentagem'],
        [dig(c, 1), 'troca-10-e-1-por-cento'],
      ]),
      dicas: [
        'Monte com as de cabeça: 10 % é ÷ 10, 1 % é ÷ 100, 50 % é a metade.',
        `${p} % = ${MONTAGEM[p]}. E 10 % de R$ ${escrito(v)} são ${moeda(v * 10)}.`,
        `${p} % de R$ ${escrito(v)} = ${moeda(c)}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: aumento e desconto

const PRODUTOS = ['A camisa', 'O ventilador', 'A panela', 'O sapato']
const CONTAS = ['A conta de luz', 'O aluguel', 'A mensalidade', 'O plano de celular']

export const aumentoDescontoN1: Gerador = {
  id: 'aumento-desconto-n1',
  aula: 'B.U11.A3',
  nivel: 1,
  gerar(r) {
    const v = 10 * r.int(3, 50)
    if (r.int(0, 1) === 0) {
      const certa = (v / 10) * 9
      return {
        enunciado: `${r.pick(PRODUTOS)} de **R$ ${v}** está com **10 % de desconto**. Quanto você paga, em reais?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [String(v / 10), 'desconto-como-preco-final'],
          [String(v - 10), 'porcentagem-como-numero-inteiro'],
        ]),
        dicas: [
          'Com 10 % de desconto, você paga 9 das 10 partes: 90 % do preço, × 0,9.',
          `10 % de R$ ${v} são R$ ${v / 10}. Tire do preço, ou faça ${v} × 0,9.`,
          `${v} × 0,9 = ${certa}: R$ ${certa}.`,
        ],
        visual: barra({ partes: 10, pintadas: 9, rotulo: '90 %' }, `A barra de R$ ${v} em 10 partes, 9 em âmbar (o que você paga) e a última apagada (o desconto).`),
      }
    }
    const certa = (v / 10) * 11
    return {
      enunciado: `${r.pick(CONTAS)} de **R$ ${v}** subiu **10 %**. Quanto ficou, em reais?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(v / 10), 'fator-de-aumento-sem-o-um'],
        [String(v + 10), 'porcentagem-como-numero-inteiro'],
      ]),
      dicas: [
        'Com 10 % de aumento, fica o valor inteiro e mais uma parte de 10: 110 %, × 1,1.',
        `10 % de R$ ${v} são R$ ${v / 10}. Some ao valor, ou faça ${v} × 1,1.`,
        `${v} × 1,1 = ${certa}: R$ ${certa}.`,
      ],
      visual: barra({ partes: 10, inteiros: 2, pintadas: 11, rotulo: '110 %' }, `Duas barras de 10 partes: a primeira cheia (R$ ${v}) e mais uma parte da segunda (o aumento).`),
    }
  },
}

export const aumentoDescontoN2: Gerador = {
  id: 'aumento-desconto-n2',
  aula: 'B.U11.A3',
  nivel: 2,
  gerar(r) {
    const p = r.pick([3, 5, 8, 12, 15, 20, 25, 30, 35, 40])
    const desconto = r.int(0, 1) === 0
    const fica = desconto ? 100 - p : 100 + p
    const fator = escrito(fica, 2)
    const isca: Op =
      p < 10
        ? { texto: `× ${escrito(desconto ? 100 - 10 * p : 100 + 10 * p, 2)}`, erro: 'esquece-zero-decimal' }
        : { texto: `× ${fica}`, erro: 'porcentagem-como-numero-inteiro' }
    return {
      enunciado: desconto
        ? `A loja dá **${p} % de desconto**. O preço a pagar é o preço cheio vezes quanto?`
        : `A passagem vai subir **${p} %**. O preço novo é o antigo vezes quanto?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `× ${fator}`, certa: true },
        { texto: `× ${escrito(p, 2)}`, erro: desconto ? 'desconto-como-preco-final' : 'fator-de-aumento-sem-o-um' },
        { texto: `× ${escrito(desconto ? 100 + p : 100 - p, 2)}` },
        isca,
      ]),
      dicas: desconto
        ? ['Num desconto, você paga o que sobra: 100 % menos o desconto.', `100 % − ${p} % = ${fica} %.`, `${fica} % = ${fator}: × ${fator}.`]
        : ['Num aumento, fica o valor inteiro e mais o aumento: 100 % mais ele.', `100 % + ${p} % = ${fica} %.`, `${fica} % = ${fator}: × ${fator}.`],
    }
  },
}

/** [frase com o valor e a porcentagem, o valor em reais, é desconto?, porcentagens]. */
const SITUACOES: [(v: string, p: number) => string, (r: Rng) => number, boolean, number[]][] = [
  [(v, p) => `A TV de **R$ ${v}** está com **${p} % OFF**. Quanto você paga, em reais?`, (r) => 50 * r.int(20, 80), true, [5, 8, 12, 15, 20, 25, 30, 40]],
  [(v, p) => `À vista, a geladeira de **R$ ${v}** tem **${p} % de desconto**. Qual é o preço à vista, em reais?`, (r) => 10 * r.int(150, 450), true, [5, 8, 10, 12, 15, 20]],
  [(v, p) => `O aluguel de **R$ ${v}** vai subir **${p} %**. Qual será o aluguel novo, em reais?`, (r) => 50 * r.int(16, 60), false, [3, 5, 8, 10, 12, 15]],
  [(v, p) => `A conta de luz de **R$ ${v}** veio **${p} %** mais cara. Quanto ela deu, em reais?`, (r) => r.int(80, 300), false, [3, 5, 8, 10, 12, 15, 20]],
]

export const aumentoDescontoN3: Gerador = {
  id: 'aumento-desconto-n3',
  aula: 'B.U11.A3',
  nivel: 3,
  gerar(r) {
    const [frase, valor, desconto, ps] = r.pick(SITUACOES)
    const p = r.pick(ps)
    const v = valor(r)
    const fica = desconto ? 100 - p : 100 + p
    const c = v * fica
    const certa = resposta(c, 2)
    return {
      enunciado: frase(escrito(v), p),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [dig(v * p, 2), desconto ? 'desconto-como-preco-final' : 'fator-de-aumento-sem-o-um'],
        [String(desconto ? v - p : v + p), 'porcentagem-como-numero-inteiro'],
        [p < 10 ? dig(v * (desconto ? 100 - 10 * p : 100 + 10 * p), 2) : null, 'esquece-zero-decimal'],
      ]),
      dicas: [
        desconto ? `Com ${p} % de desconto, você paga ${fica} % do preço.` : `Com ${p} % de aumento, o valor novo é ${fica} % do antigo.`,
        `${fica} % = ${escrito(fica, 2)}: faça ${escrito(v)} × ${escrito(fica, 2)}.`,
        `${escrito(v)} × ${escrito(fica, 2)} = ${escrito(c, 2)}: ${moeda(c)}.`,
      ],
    }
  },
}

export const GERADORES_U11A: Gerador[] = [
  porCentoN1, porCentoN2, porCentoN3,
  porcentagemDeValorN1, porcentagemDeValorN2, porcentagemDeValorN3,
  aumentoDescontoN1, aumentoDescontoN2, aumentoDescontoN3,
]
