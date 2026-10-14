import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 18: plano cartesiano e gráficos (parte B). Aula 4, relações entre
// grandezas (proporcional é uma reta que passa pela origem); aula 5, a ideia
// de função (a máquina de entrada e saída).
//
// Os números do enunciado vêm em negrito, com a unidade e o espaço que não
// quebra (R$ 5, 3 km, 200 kWh). Os preços são de exemplo, redondos. As contas
// com centavos (R$ 0,80 por kWh) são feitas em centavos, com inteiros, para
// não carregar erros de arredondamento; um decimal vem como texto com
// vírgula, como o aluno digita. Na aula 5, nível 2, a saída pode ser
// negativa: esses itens levam `sinal: true`.

// ---------------------------------------------------------------- ferramentas

/** O espaço que não quebra: R$ 5 e 3 km ficam na mesma linha. */
const NB = ' '
/** Centavos como o aluno escreve: 12460 → '124,6'; 1500 → '15'; −250 → '-2,5'. */
function cent(c: number): string {
  if (c < 0) return `-${cent(-c)}`
  const i = Math.floor(c / 100)
  const r = c % 100
  if (r === 0) return String(i)
  return `${i},${String(r).padStart(2, '0').replace(/0$/, '')}`
}
/** Centavos em dinheiro, para a tela: 80 → 'R$ 0,80'; 1500 → 'R$ 15'. */
function reais(c: number): string {
  const i = Math.floor(c / 100)
  const r = c % 100
  return `R$${NB}${r === 0 ? i : `${i},${String(r).padStart(2, '0')}`}`
}
/** Em negrito: **R$ 5**, **3 km**. */
const neg = (t: string | number, u?: string) => `**${u ? `${t}${NB}${u}` : t}**`
/** A resposta em centavos: um número se for inteiro, o texto com vírgula se não. */
const resp = (c: number) => (c % 100 === 0 ? c / 100 : cent(c))

/** Erros previsíveis (como o aluno digitaria), sem a certa e sem repetir. Os valores vêm em centavos. */
function mapaC(certa: number, pares: [number, string][], negativos = false): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (!Number.isInteger(valor) || valor === certa) continue
    if (!negativos && valor < 0) continue
    const k = cent(valor)
    if (k in erros) continue
    erros[k] = erro
  }
  return erros
}
/** O mesmo, para inteiros. */
const mapa = (certa: number, pares: [number, string][], negativos = false) =>
  mapaC(certa * 100, pares.map(([v, e]) => [v * 100, e]), negativos)

/** Embaralha com o rng (Fisher–Yates). */
function embaralha<T>(r: Rng, xs: T[]): T[] {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = r.int(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
/** Uma escolha com a certa no índice 0 de `opcoes` e o erro de cada errada, embaralhada. */
function escolha(r: Rng, opcoes: [string, string | undefined][]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const ordem = embaralha(r, opcoes.map((_, i) => i))
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => {
    const e = opcoes[o][1]
    if (o !== 0 && e) erros[String(i)] = e
  })
  return { opcoes: ordem.map((o) => opcoes[o][0]), resposta: ordem.indexOf(0), erros }
}

// ---------------------------------------------------------------- aula 4: relações entre grandezas

const PROPORCIONAL = 'Sim: é uma reta que passa pelo (0, 0)'
const COM_FIXO = 'Não: é uma reta que não passa pelo (0, 0)'
const CURVA = 'Não: os pontos não ficam numa reta'

/** Os contextos: o nome da grandeza do eixo de baixo e o enunciado. */
const PROPORCIONAIS = [
  { rotulo: 'kg', texto: 'o preço do arroz pelo peso, em kg' },
  { rotulo: 'litros', texto: 'o preço do suco pela quantidade, em litros' },
  { rotulo: 'metros', texto: 'o preço do fio pelo comprimento, em metros' },
]
const COM_VALOR_FIXO = [
  { rotulo: 'km', texto: 'o preço de uma corrida pela distância, em km' },
  { rotulo: 'horas', texto: 'o preço de um estacionamento pelo tempo, em horas' },
  { rotulo: 'horas', texto: 'o preço do aluguel de uma bicicleta pelo tempo, em horas' },
]

export const relacoesN1: Gerador = {
  id: 'relacoes-n1',
  aula: 'B.U18.A4',
  nivel: 1,
  gerar(r) {
    // O gráfico na tela: uma reta pela origem, uma reta com valor fixo ou uma curva.
    const tipo = r.pick(['proporcional', 'fixo', 'curva'] as const)
    const xs = [1, 2, 3, 4]
    if (tipo === 'curva') {
      const pares: [number, number][] = [0, ...xs].map((x) => [x, x * x])
      const visual: Visual = {
        modelo: 'plano',
        estado: { x: { de: 0, ate: 5, passo: 1, rotulo: 'lado' }, y: { de: 0, ate: 20, passo: 4, rotulo: 'área' }, tabela: { rotulos: ['lado', 'área'], pares }, ligar: true },
        esboco: 'A tabela lado e área (0, 1, 2, 3, 4; 0, 1, 4, 9, 16) e os pontos ligados no plano, fazendo uma curva.',
      }
      return {
        enunciado: 'O gráfico mostra a área do quadrado pelo lado. As duas grandezas são proporcionais?',
        formato: 'escolha',
        ...escolha(r, [[CURVA, undefined], [PROPORCIONAL, 'cresce-junto-e-proporcional'], [COM_FIXO, undefined]]),
        dicas: [
          'Proporcional é uma reta que passa pela origem, o (0, 0).',
          'Os pontos ficam numa reta? Veja os degraus: a área sobe 1, depois 3, depois 5.',
          'Os pontos fazem uma curva: lado 2, área 4; lado 4, área 16. Não é proporcional.',
        ],
        visual,
      }
    }
    const a = r.int(2, 5)
    const b = tipo === 'fixo' ? r.int(3, 8) : 0
    const ctx = r.pick(tipo === 'fixo' ? COM_VALOR_FIXO : PROPORCIONAIS)
    const pares: [number, number][] = xs.map((x) => [x, a * x + b])
    // O y com passo maior que o do x: com o mesmo passo, os quadradinhos seriam quadrados e o plano, estreito.
    const maior = pares[pares.length - 1][1]
    const passoY = maior <= 12 ? 2 : maior <= 24 ? 4 : 5
    const visual: Visual = {
      modelo: 'plano',
      estado: {
        x: { de: 0, ate: 5, passo: 1, rotulo: ctx.rotulo },
        y: { de: 0, ate: Math.ceil((maior + 1) / passoY) * passoY, passo: passoY, rotulo: 'R$' },
        tabela: { rotulos: [ctx.rotulo, 'R$'], pares },
        retas: [{ a, b, de: 0 }],
      },
      esboco: `A tabela (${pares.map((p) => `${p[0]}, R$ ${p[1]}`).join('; ')}) e os pontos no plano, com a reta que passa por eles${b ? `, começando em R$ ${b}` : ' e sai da origem'}.`,
    }
    const opcoes: [string, string | undefined][] = tipo === 'fixo'
      ? [[COM_FIXO, undefined], [PROPORCIONAL, 'toda-reta-e-proporcional'], [CURVA, undefined]]
      : [[PROPORCIONAL, undefined], [COM_FIXO, undefined], [CURVA, undefined]]
    return {
      enunciado: `O gráfico mostra ${ctx.texto}. As duas grandezas são proporcionais?`,
      formato: 'escolha',
      ...escolha(r, opcoes),
      dicas: [
        'Proporcional é uma reta que passa pela origem, o (0, 0).',
        'Siga a reta para trás até o 0 do eixo de baixo: onde ela chega?',
        b
          ? `A reta chega em R$${NB}${b}, não no 0: há um valor fixo. Não é proporcional.`
          : `A reta chega no (0, 0): com 0, o preço é R$${NB}0. É proporcional.`,
      ],
      visual,
    }
  },
}

const MERCADO = ['arroz', 'feijão', 'café', 'queijo']

export const relacoesN2: Gerador = {
  id: 'relacoes-n2',
  aula: 'B.U18.A4',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Proporcional: vale o preço de 1 kg.
      const k = r.int(2, 5)
      const p = r.int(3, 12)
      let m = r.int(k + 1, 12)
      if (m % k === 0 && r.int(0, 1) === 0) m = Math.min(12, m + 1)
      const coisa = r.pick(MERCADO)
      return {
        enunciado: `${neg(k, 'kg')} de ${coisa} custam ${neg(reais(k * p * 100))}, e o preço é proporcional. Quanto custam ${neg(m, 'kg')}, em reais?`,
        formato: 'numero',
        resposta: m * p,
        erros: mapa(m * p, [
          [k * p + (m - k), 'pensa-aditivamente'],
        ]),
        dicas: [
          'Proporcional: o gráfico é uma reta que sai do (0, 0). Cada quilo custa o mesmo.',
          `Ache o preço de 1${NB}kg: $${k * p} \\div ${k} = ${p}$.`,
          `$${m} \\cdot ${p} = ${m * p}$. ${m}${NB}kg custam R$${NB}${m * p}.`,
        ],
      }
    }
    // Com valor fixo: dobrar os km não dobra o preço.
    const a = r.int(2, 4)
    const b = r.int(3, 9)
    const n = r.int(2, 6)
    const vezes = r.int(2, 3)
    const m = n * vezes
    const v = b + a * n
    const certa = b + a * m
    return {
      enunciado: `Uma corrida custa ${neg(reais(b * 100))} para começar e ${neg(reais(a * 100))} por km. ${neg(n, 'km')} custam ${neg(reais(v * 100))}. Quanto custam ${neg(m, 'km')}, em reais?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [vezes * v, 'regra-de-tres-sem-proporcao'],
        [a * m, 'esquece-valor-fixo'],
      ]),
      dicas: [
        `Com 0${NB}km já se paga R$${NB}${b}: a reta não sai do (0, 0). Não dá para multiplicar o preço por ${vezes}.`,
        `Os R$${NB}${b} entram uma vez só. Os km: $${m} \\cdot ${a} = ${a * m}$.`,
        `$${b} + ${m} \\cdot ${a} = ${certa}$. ${m}${NB}km custam R$${NB}${certa}.`,
      ],
    }
  },
}

const ALUGUEIS = ['Um estacionamento', 'Um aluguel de bicicleta', 'Um aluguel de quadra']

export const relacoesN3: Gerador = {
  id: 'relacoes-n3',
  aula: 'B.U18.A4',
  nivel: 3,
  gerar(r) {
    const a = r.int(2, 6)
    let b = r.int(2, 10)
    if (b === a) b++
    const h1 = r.int(1, 3)
    const h2 = h1 + r.int(1, 4)
    const v1 = b + a * h1
    const v2 = b + a * h2
    const quem = r.pick(ALUGUEIS)
    const dados = `${quem} cobra um valor fixo e mais o mesmo tanto por hora. ${neg(h1, 'h')} custam ${neg(reais(v1 * 100))}; ${neg(h2, 'h')}, ${neg(reais(v2 * 100))}.`
    const porHora = `De ${h1}${NB}h para ${h2}${NB}h, o preço sobe $${v2} - ${v1} = ${v2 - v1}$ em ${h2 - h1}${NB}h: R$${NB}${a} por hora.`
    if (r.int(0, 1) === 0) {
      return {
        enunciado: `${dados} Qual é o valor fixo, em reais?`,
        formato: 'numero',
        resposta: b,
        erros: mapa(b, [
          [0, 'toda-reta-e-proporcional'],
          [a, 'responde-outra-pergunta'],
          [v2 - v1, 'responde-outra-pergunta'],
        ]),
        dicas: [
          'O valor fixo é onde a reta encontra o eixo do preço, com 0 hora.',
          porHora,
          `Volte de ${h1}${NB}h para 0${NB}h: $${v1} - ${h1} \\cdot ${a} = ${b}$. O valor fixo é R$${NB}${b}.`,
        ],
      }
    }
    const h3 = h2 + r.int(1, 4)
    const certa = b + a * h3
    const proporcao: [number, string][] = [h1, h2]
      .map((h, i) => [h, i === 0 ? v1 : v2])
      .filter(([h, v]) => (v * h3) % h === 0)
      .map(([h, v]) => [(v * h3) / h, 'regra-de-tres-sem-proporcao'])
    return {
      enunciado: `${dados} Quanto custam ${neg(h3, 'h')}, em reais?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [...proporcao, [a * h3, 'esquece-valor-fixo']]),
      dicas: [
        'Há um valor fixo: a reta não sai do (0, 0), e a regra de três não vale.',
        `${porHora} Com 0${NB}h: $${v1} - ${h1} \\cdot ${a} = ${b}$.`,
        `$${b} + ${h3} \\cdot ${a} = ${certa}$. ${h3}${NB}h custam R$${NB}${certa}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: a ideia de função

export const funcaoN1: Gerador = {
  id: 'funcao-n1',
  aula: 'B.U18.A5',
  nivel: 1,
  gerar(r) {
    // A máquina na tela, com dois passos inteiros.
    const a = r.int(2, 5)
    const b = r.int(1, 9)
    const x = r.int(2, 9)
    const certa = a * x + b
    const visual: Visual = {
      modelo: 'plano',
      estado: { maquina: { regra: `× ${a} + ${b}`, entradas: [x], feitas: 0 } },
      esboco: `A máquina com "× ${a} + ${b}" na caixa e, na tabela, o ${x} esperando para entrar.`,
    }
    return {
      enunciado: `A máquina faz $\\times\\ ${a}$ e depois $+\\ ${b}$. Entra **${x}**. Que número sai?`,
      fala: `A máquina faz vezes ${a} e depois mais ${b}. Entra ${x}. Que número sai?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [a * x, 'esquece-valor-fixo'],
        [a * (x + b), 'regra-fora-de-ordem'],
      ]),
      dicas: [
        'A máquina faz os passos na ordem, da esquerda para a direita.',
        `Primeiro o vezes: $${x} \\cdot ${a} = ${a * x}$.`,
        `Depois o mais: $${a * x} + ${b} = ${certa}$. Sai ${certa}.`,
      ],
      visual,
    }
  },
}

export const funcaoN2: Gerador = {
  id: 'funcao-n2',
  aula: 'B.U18.A5',
  nivel: 2,
  gerar(r) {
    // A regra com letras; com o menos, a saída pode ser negativa.
    const menos = r.int(0, 1) === 0
    const a = r.int(2, 6)
    const b = r.int(1, 15)
    const x = menos ? r.int(0, 6) : r.int(2, 9)
    const s = menos ? -1 : 1
    const certa = a * x + s * b
    const op = menos ? '-' : '+'
    const erros: [number, string][] = [
      [a * x, 'esquece-valor-fixo'],
      [a * (x + s * b), 'regra-fora-de-ordem'],
    ]
    if (x > 0) erros.push([Number(`${a}${x}`) + s * b, 'junta-algarismos-com-a-letra'])
    return {
      enunciado: `A regra de uma máquina é $y = ${a}x ${op} ${b}$. Quanto sai quando entra $x = ${x}$?`,
      fala: `A regra de uma máquina é y igual a ${a} x ${menos ? 'menos' : 'mais'} ${b}. Quanto sai quando entra x igual a ${x}?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, erros, true),
      dicas: [
        `$${a}x$ é $${a} \\cdot x$. Troque o x pelo número que entra e faça primeiro a multiplicação.`,
        `$${a} \\cdot ${x} = ${a * x}$.`,
        `$${a} \\cdot ${x} ${op} ${b} = ${certa}$. Sai ${certa < 0 ? `−${-certa}` : certa}.`,
      ],
    }
  },
}

/** O preço do kWh, em centavos. */
const KWH = [50, 60, 80]
const FIXOS = [10, 12, 15, 20]

export const funcaoN3: Gerador = {
  id: 'funcao-n3',
  aula: 'B.U18.A5',
  nivel: 3,
  gerar(r) {
    const tipo = r.pick(['luz-volta', 'corrida-volta', 'luz-ida'] as const)
    if (tipo === 'corrida-volta') {
      // Do preço aos km: a equação b + a·x = V, desfeita do fim para o começo.
      const a = r.int(2, 4)
      const b = r.int(4, 9)
      const km = r.int(3, 20)
      const v = b + a * km
      const pares: [number, string][] = [
        [(v - b) * a, 'desfaz-com-a-mesma-operacao'],
        [v * a + b, 'troca-entrada-e-saida'],
        [v - b, 'esquece-de-dividir'],
      ]
      if ((v + b) % a === 0) pares.push([(v + b) / a, 'desfaz-com-a-mesma-operacao'])
      if (v % a === 0) pares.push([v / a - b, 'regra-fora-de-ordem'])
      return {
        enunciado: `Uma corrida custa ${neg(reais(b * 100))} para começar e ${neg(reais(a * 100))} por km. Você pagou ${neg(reais(v * 100))}. Quantos km andou?`,
        formato: 'numero',
        resposta: km,
        erros: mapa(km, pares),
        dicas: [
          `A regra é $y = ${a}x + ${b}$: o x são os km, o y é o preço. Você sabe o y.`,
          `$${a}x + ${b} = ${v}$. Desfaça do fim: $${v} - ${b} = ${v - b}$.`,
          `$${v - b} \\div ${a} = ${km}$. Você andou ${km}${NB}km. Confira: $${b} + ${a} \\cdot ${km} = ${v}$.`,
        ],
      }
    }
    const pc = r.pick(KWH)
    const f = r.pick(FIXOS)
    const preco = `Uma conta de luz cobra ${neg(reais(f * 100))} fixos mais ${neg(reais(pc))} por kWh.`
    const p = cent(pc)
    if (tipo === 'luz-ida') {
      // Do consumo à conta, com centavos.
      const k = r.int(50, 400)
      const certaC = k * pc + f * 100
      return {
        enunciado: `${preco} Quanto vem a conta com ${neg(k, 'kWh')}, em reais?`,
        formato: 'numero',
        resposta: resp(certaC),
        erros: mapaC(certaC, [
          [k * pc, 'esquece-valor-fixo'],
          [(k + f) * pc, 'regra-fora-de-ordem'],
        ]),
        dicas: [
          `A regra é $y = ${p.replace(',', '{,}')}x + ${f}$: primeiro o consumo vezes o preço, depois o fixo.`,
          `$${k} \\cdot ${p.replace(',', '{,}')} = ${cent(k * pc).replace(',', '{,}')}$.`,
          `$${cent(k * pc).replace(',', '{,}')} + ${f} = ${cent(certaC).replace(',', '{,}')}$. A conta vem ${reais(certaC)}.`,
        ],
      }
    }
    // Da conta ao consumo: p·x + f = V. O consumo é um múltiplo de 10, para a conta dar reais inteiros.
    const k = 10 * r.int(5, 40)
    const vC = k * pc + f * 100
    const v = vC / 100
    const pares: [number, string][] = [
      [(v - f) * pc, 'desfaz-com-a-mesma-operacao'],
      [v * pc + f * 100, 'troca-entrada-e-saida'],
      [(v - f) * 100, 'esquece-de-dividir'],
    ]
    if (((v + f) * 100) % pc === 0) pares.push([(((v + f) * 100) / pc) * 100, 'desfaz-com-a-mesma-operacao'])
    if ((v * 100) % pc === 0) pares.push([((v * 100) / pc - f) * 100, 'regra-fora-de-ordem'])
    return {
      enunciado: `${preco} A conta veio ${neg(reais(vC))}. Quantos kWh foram gastos?`,
      formato: 'numero',
      resposta: k,
      erros: mapaC(k * 100, pares),
      dicas: [
        `A regra é $y = ${p.replace(',', '{,}')}x + ${f}$: o x é o consumo, o y é a conta. Você sabe o y.`,
        `$${p.replace(',', '{,}')}x + ${f} = ${v}$. Desfaça do fim: $${v} - ${f} = ${v - f}$.`,
        `$${v - f} \\div ${p.replace(',', '{,}')} = ${k}$. Foram ${k}${NB}kWh.`,
      ],
    }
  },
}

export const GERADORES_U18B: Gerador[] = [
  relacoesN1,
  relacoesN2,
  relacoesN3,
  funcaoN1,
  funcaoN2,
  funcaoN3,
]
