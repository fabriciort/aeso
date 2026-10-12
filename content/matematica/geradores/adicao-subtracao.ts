import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 2: adição e subtração. Os sentidos (juntar, tirar, comparar,
// completar), as contas de cabeça, a conta armada com o vai um e o empresta,
// e a conferência por estimativa e pela operação inversa.

const fmt = (n: number) => n.toLocaleString('pt-BR')
const algarismos = (n: number, casas: number) => String(n).padStart(casas, '0').split('').map(Number)
const casasDe = (...ns: number[]) => Math.max(...ns.map((n) => String(n).length))
const acima = (n: number) => Math.ceil((n + 1) / 10) * 10
const abaixo = (n: number) => Math.floor(n / 10) * 10

/** O erro de quem subtrai o menor do maior em cada coluna (52 − 17 → 45). */
export function menorDoMaior(a: number, b: number): number {
  const k = casasDe(a, b)
  const da = algarismos(a, k)
  const db = algarismos(b, k)
  return Number(da.map((d, i) => Math.abs(d - db[i])).join(''))
}

/** O erro de quem esquece o vai um: cada casa fica só com as unidades da soma. */
export function semReserva(a: number, b: number): number {
  const k = casasDe(a, b)
  const da = algarismos(a, k)
  const db = algarismos(b, k)
  return Number(da.map((d, i) => (d + db[i]) % 10).join(''))
}

/** O erro de quem escreve a soma inteira de cada coluna (58 + 27 → 715). */
export function colunasColadas(a: number, b: number): number {
  const k = casasDe(a, b)
  const da = algarismos(a, k)
  const db = algarismos(b, k)
  return Number(da.map((d, i) => d + db[i]).join(''))
}

/** Erros previsíveis, sem nunca marcar a resposta certa e sem sobrescrever. */
function mapa(certa: number, pares: [number, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor !== certa && valor >= 0 && !(String(valor) in erros)) erros[String(valor)] = erro
  }
  return erros
}

/** Opções em ordem girada pela semente; a resposta é o índice da certa. */
function girar(r: Rng, opcoes: { texto: string; erro?: string }[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const inicio = r.int(0, opcoes.length - 1)
  const ordem = [...opcoes.slice(inicio), ...opcoes.slice(0, inicio)]
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => !o.erro), erros }
}

const conta = (parcelas: number[], sinal: '+' | '−', esboco: string): Visual => ({
  modelo: 'quadro-posicional',
  estado: { conta: { parcelas, sinal } },
  esboco,
})

// ---------------------------------------------------------------- aula 1: os sentidos

const COISAS = ['parafusos', 'ovos', 'figurinhas', 'botões', 'pregos'] as const

export const sentidosN1: Gerador = {
  id: 'sentidos-n1',
  aula: 'B.U2.A1',
  nivel: 1,
  gerar(r) {
    const coisa = r.pick(COISAS)
    if (r.int(0, 1) === 0) {
      const a = r.int(12, 59)
      const b = r.int(5, 99 - a > 39 ? 39 : 99 - a)
      const certa = a + b
      return {
        enunciado: `Você tem ${a} ${coisa} e ganha mais ${b}. Quantos ficam?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[a - b, 'operacao-trocada']]),
        dicas: ['Ganhar mais faz a quantidade aumentar: é somar.', `Junte ${a} e ${b}: primeiro as dezenas, depois as unidades.`, `${a} + ${b} = ${certa}.`],
        visual: { modelo: 'blocos', estado: { dezenas: Math.floor(a / 10), unidades: a % 10 }, esboco: `Os ${a} ${coisa} em barras e soltos. As ${b} peças novas chegam ao conferir.` },
      }
    }
    const a = r.int(25, 99)
    const b = r.int(3, a - 5)
    const certa = a - b
    return {
      enunciado: `Você tem ${a} ${coisa} e usa ${b}. Quantos sobram?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[a + b, 'operacao-trocada'], [menorDoMaior(a, b), 'subtrai-menor-do-maior']]),
      dicas: ['Usar faz a quantidade diminuir: é subtrair.', `Tire ${b} de ${a}. Se faltar unidade, abra uma dezena.`, `${a} − ${b} = ${certa}.`],
      visual: { modelo: 'blocos', estado: { dezenas: Math.floor(a / 10), unidades: a % 10 }, esboco: `Os ${a} ${coisa} em barras e soltos. Ao conferir, ${b} peças saem do palco.` },
    }
  },
}

type Sentido = 'comparar' | 'completar' | 'juntar' | 'tirar'
const SITUACOES: Record<Sentido, (a: number, b: number) => string> = {
  comparar: (a, b) => `Ana tem ${a} figurinhas e Beto tem ${b}. Quantas Ana tem a mais?`,
  completar: (a, b) => `Você juntou R$ ${b} e quer comprar algo de R$ ${a}. Quanto falta?`,
  juntar: (a, b) => `Uma sala tem ${a} cadeiras e chegaram mais ${b}. Quantas são agora?`,
  tirar: (a, b) => `Havia ${a} pães e foram vendidos ${b}. Quantos restam?`,
}
const DICAS_SENTIDO: Record<Sentido, (a: number, b: number) => Item['dicas']> = {
  comparar: (a, b) => ['"A mais" pergunta a distância entre os dois números.', `Na reta, quanto falta de ${b} até ${a}?`, `A distância de ${b} até ${a} é ${a} − ${b}.`],
  completar: (a, b) => ['"Quanto falta" é completar: de onde você está até onde quer chegar.', `De ${b} até ${a}.`, `O que falta de ${b} até ${a} é ${a} − ${b}.`],
  juntar: (a, b) => ['Chegaram mais: a quantidade aumenta.', 'Juntar duas quantidades é somar.', `As ${a} cadeiras com as ${b} novas: ${a} + ${b}.`],
  tirar: (a, b) => ['Vender tira pães: a quantidade diminui.', 'Tirar é subtrair.', `Dos ${a} pães saíram ${b}: ${a} − ${b}.`],
}

export const sentidosN2: Gerador = {
  id: 'sentidos-n2',
  aula: 'B.U2.A1',
  nivel: 2,
  gerar(r) {
    const sentido = r.pick(['comparar', 'completar', 'juntar', 'tirar'] as const)
    const a = r.int(30, 95)
    const b = r.int(11, a - 6)
    const soma = sentido === 'juntar'
    return {
      enunciado: SITUACOES[sentido](a, b),
      formato: 'escolha',
      ...girar(r, [
        { texto: `${a} + ${b}`, erro: soma ? undefined : 'operacao-trocada' },
        { texto: `${a} − ${b}`, erro: soma ? 'operacao-trocada' : undefined },
      ]),
      dicas: DICAS_SENTIDO[sentido](a, b),
    }
  },
}

export const sentidosN3: Gerador = {
  id: 'sentidos-n3',
  aula: 'B.U2.A1',
  nivel: 3,
  gerar(r) {
    const nota = r.pick([20, 50, 100])
    let preco = r.int(nota / 2 + 1, nota - 1)
    if (preco % 10 === 0) preco += 3
    const certa = nota - preco
    const dezena = acima(preco - 1)
    return {
      enunciado: `Você paga R$ ${preco} com uma nota de R$ ${nota}. Quanto volta de troco?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[nota + preco, 'operacao-trocada'], [menorDoMaior(nota, preco), 'subtrai-menor-do-maior']]),
      dicas: [
        'Troco é completar: do preço até o valor da nota.',
        dezena === nota ? `De ${preco} até ${nota} faltam ${certa}.` : `De ${preco} até ${dezena} faltam ${dezena - preco}. De ${dezena} até ${nota}, mais ${nota - dezena}.`,
        dezena === nota ? `O troco é R$ ${certa}.` : `${dezena - preco} + ${nota - dezena} = ${certa}. O troco é R$ ${certa}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: contas de cabeça

export const cabecaN1: Gerador = {
  id: 'cabeca-n1',
  aula: 'B.U2.A2',
  nivel: 1,
  gerar(r) {
    const a = r.int(1, 8) * 10 + r.int(6, 9)
    const b = r.int(10 - (a % 10), 9)
    const certa = a + b
    const redondo = acima(a)
    const falta = redondo - a
    return {
      enunciado: `De cabeça: ${a} + ${b}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[certa - 10, 'esquece-reserva'], [redondo + b, 'perde-o-resto']]),
      dicas: ['Leve o primeiro número até a dezena redonda.', `De ${a} até ${redondo} faltam ${falta}. Do ${b}, sobram ${b - falta}.`, `${redondo} + ${b - falta} = ${certa}.`],
      visual: {
        modelo: 'reta',
        estado: { de: redondo - 10, ate: redondo + 10, passo: 1, marcas: [redondo - 10, redondo, redondo + 10], numeros: [a] },
        esboco: `A reta de ${redondo - 10} a ${redondo + 10} com o ${a} aceso. Ao conferir, dois saltos: até ${redondo} e o resto.`,
      },
    }
  },
}

export const cabecaN2: Gerador = {
  id: 'cabeca-n2',
  aula: 'B.U2.A2',
  nivel: 2,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const a = r.int(1, 7) * 10 + r.int(5, 9)
      const b = r.int(1, 8 - Math.floor(a / 10)) * 10 + r.int(10 - (a % 10), 9)
      const certa = a + b
      const redondo = acima(a)
      const falta = redondo - a
      return {
        enunciado: `De cabeça: ${a} + ${b}`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[certa - 10, 'esquece-reserva'], [redondo + b, 'perde-o-resto']]),
        dicas: ['Leve o primeiro número até a dezena redonda.', `De ${a} até ${redondo} faltam ${falta}. Do ${b}, sobram ${b - falta}.`, `${redondo} + ${b - falta} = ${certa}.`],
      }
    }
    const a = r.int(2, 9) * 10 + r.int(1, 4)
    const b = r.int((a % 10) + 1, 9)
    const certa = a - b
    const redondo = abaixo(a)
    const desce = a - redondo
    return {
      enunciado: `De cabeça: ${a} − ${b}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[menorDoMaior(a, b), 'subtrai-menor-do-maior'], [certa + 10, 'esquece-que-desagrupou']]),
      dicas: ['Desça primeiro até a dezena redonda.', `De ${a} até ${redondo} são ${desce}. Do ${b}, faltam ${b - desce}.`, `${redondo} − ${b - desce} = ${certa}.`],
    }
  },
}

const COMPRAS = [['carne', 'arroz'], ['pão', 'leite'], ['café', 'açúcar'], ['frango', 'feijão'], ['sabão', 'detergente']] as const

export const cabecaN3: Gerador = {
  id: 'cabeca-n3',
  aula: 'B.U2.A2',
  nivel: 3,
  gerar(r) {
    const [x, y] = r.pick(COMPRAS)
    const a = r.int(1, 8) * 10 + r.int(5, 9)
    const b = r.int(1, 9) * 10 + r.int(10 - (a % 10), 9)
    const certa = a + b
    const redondo = acima(a)
    const falta = redondo - a
    return {
      enunciado: `No mercado: R$ ${a} de ${x} e R$ ${b} de ${y}. Quanto dá ao todo?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[certa - 10, 'esquece-reserva'], [redondo + b, 'perde-o-resto']]),
      dicas: ['Some de cabeça: leve um dos preços até a dezena redonda.', `${a} + ${falta} = ${redondo}. Do ${b}, sobram ${b - falta}.`, `${redondo} + ${b - falta} = ${certa}. Dá R$ ${certa}.`],
    }
  },
}

// ---------------------------------------------------------------- aula 3: adição armada

export const armadaSomaN1: Gerador = {
  id: 'armada-soma-n1',
  aula: 'B.U2.A3',
  nivel: 1,
  gerar(r) {
    const ua = r.int(3, 9)
    const ub = r.int(10 - ua, 9)
    const ta = r.int(1, 7)
    const tb = r.int(1, 8 - ta)
    const a = ta * 10 + ua
    const b = tb * 10 + ub
    const certa = a + b
    return {
      enunciado: `Arme e resolva: ${a} + ${b}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[certa - 10, 'esquece-reserva'], [colunasColadas(a, b), 'escreve-numero-inteiro-na-casa']]),
      dicas: ['Comece pelas unidades, à direita.', `${ua} + ${ub} = ${ua + ub}: fica ${(ua + ub) % 10}, vai 1 para as dezenas.`, `Dezenas: 1 + ${ta} + ${tb} = ${1 + ta + tb}. Resultado: ${certa}.`],
      visual: conta([a, b], '+', 'A conta armada, sem resultado. Ao conferir, o 1 sobe para as dezenas em âmbar e o resultado se escreve da direita para a esquerda.'),
    }
  },
}

export const armadaSomaN2: Gerador = {
  id: 'armada-soma-n2',
  aula: 'B.U2.A3',
  nivel: 2,
  gerar(r) {
    // Vai um nas unidades e nas dezenas; o resultado ainda tem 3 casas.
    const ua = r.int(2, 9)
    const ub = r.int(10 - ua, 9)
    const da = r.int(1, 9)
    const db = r.int(Math.max(0, 9 - da), 9)
    const ca = r.int(1, 7)
    const cb = r.int(1, 8 - ca)
    const a = ca * 100 + da * 10 + ua
    const b = cb * 100 + db * 10 + ub
    const certa = a + b
    return {
      enunciado: `Arme e resolva: ${a} + ${b}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[semReserva(a, b), 'esquece-reserva'], [colunasColadas(a, b), 'escreve-numero-inteiro-na-casa']]),
      dicas: ['Casa por casa, das unidades para a esquerda. Cada 10 vira 1 na casa seguinte.', `Unidades: ${ua} + ${ub} = ${ua + ub}. Fica ${(ua + ub) % 10}, vai 1.`, `Dezenas: 1 + ${da} + ${db} = ${1 + da + db}. Fica ${(1 + da + db) % 10}, vai 1. Resultado: ${certa}.`],
      visual: conta([a, b], '+', 'Conta armada de três casas. Ao conferir, dois vai um aparecem em âmbar, um de cada vez.'),
    }
  },
}

export const armadaSomaN3: Gerador = {
  id: 'armada-soma-n3',
  aula: 'B.U2.A3',
  nivel: 3,
  gerar(r) {
    // Vai um garantido nas unidades; as dezenas e centenas ficam livres.
    const ua = r.int(1, 9)
    const ub = r.int(10 - ua, 9)
    const a = r.int(1, 8) * 100 + r.int(0, 9) * 10 + ua
    const b = r.int(1, 8) * 100 + r.int(0, 9) * 10 + ub
    const certa = a + b
    return {
      enunciado: `Uma loja vendeu ${a} camisetas em maio e ${b} em junho. Quantas nos dois meses?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[semReserva(a, b), 'esquece-reserva'], [colunasColadas(a, b), 'escreve-numero-inteiro-na-casa']]),
      dicas: ['Nos dois meses é juntar: some as vendas.', `Arme ${a} + ${b} e comece pelas unidades. Não esqueça o vai um.`, `${a} + ${b} = ${fmt(certa)} camisetas.`],
    }
  },
}

// ---------------------------------------------------------------- aula 4: subtração armada

export const armadaSubN1: Gerador = {
  id: 'armada-sub-n1',
  aula: 'B.U2.A4',
  nivel: 1,
  gerar(r) {
    const ua = r.int(0, 7)
    const ub = r.int(ua + 1, 9)
    const ta = r.int(3, 9)
    const tb = r.int(1, ta - 1)
    const a = ta * 10 + ua
    const b = tb * 10 + ub
    const certa = a - b
    return {
      enunciado: `Arme e resolva: ${a} − ${b}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[menorDoMaior(a, b), 'subtrai-menor-do-maior'], [certa + 10, 'esquece-que-desagrupou']]),
      dicas: ['Comece pelas unidades. Se em cima tiver menos, abra uma dezena.', `${ua} − ${ub} não dá: abra 1 dezena. ${10 + ua} − ${ub} = ${10 + ua - ub}.`, `Dezenas: ${ta - 1} − ${tb} = ${ta - 1 - tb}. Resultado: ${certa}.`],
      visual: conta([a, b], '−', 'A conta armada. Ao conferir, a dezena de cima é riscada e ganha um a menos; as unidades de cima ganham 10.'),
    }
  },
}

export const armadaSubN2: Gerador = {
  id: 'armada-sub-n2',
  aula: 'B.U2.A4',
  nivel: 2,
  gerar(r) {
    // Zero nas dezenas de cima: o empresta passa pela centena.
    const ca = r.int(2, 9)
    const ua = r.int(0, 8)
    const a = ca * 100 + ua
    const cb = r.int(1, ca - 1)
    const db = r.int(1, 9)
    const ub = r.int(ua + 1, 9)
    const b = cb * 100 + db * 10 + ub
    const certa = a - b
    return {
      enunciado: `Arme e resolva: ${a} − ${b}`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[menorDoMaior(a, b), 'subtrai-menor-do-maior'], [certa + 100, 'esquece-que-desagrupou']]),
      dicas: ['As dezenas de cima estão vazias. Abra primeiro uma centena.', `${a} vira ${ca - 1} centenas, 9 dezenas e ${10 + ua} unidades.`, `${10 + ua} − ${ub} = ${10 + ua - ub}; 9 − ${db} = ${9 - db}; ${ca - 1} − ${cb} = ${ca - 1 - cb}. Resultado: ${certa}.`],
      visual: conta([a, b], '−', 'Conta armada com o zero nas dezenas de cima. Ao conferir, a centena riscada vira 10 dezenas, e uma delas vira 10 unidades.'),
    }
  },
}

export const armadaSubN3: Gerador = {
  id: 'armada-sub-n3',
  aula: 'B.U2.A4',
  nivel: 3,
  gerar(r) {
    const a = r.int(300, 999)
    const ub = r.int((a % 10) + 1 > 9 ? 9 : (a % 10) + 1, 9)
    const b = r.int(1, Math.floor(a / 100) - 1) * 100 + r.int(0, 9) * 10 + ub
    const certa = a - b
    return {
      enunciado: `Um tanque tinha ${a} litros de água. Saíram ${b} litros. Quantos litros ficaram?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[menorDoMaior(a, b), 'subtrai-menor-do-maior'], [a + b, 'operacao-trocada']]),
      dicas: ['Saíram litros: a quantidade diminui. É subtrair.', `Arme ${a} − ${b}. Onde faltar em cima, abra uma unidade da casa da esquerda.`, `${a} − ${b} = ${certa} litros.`],
    }
  },
}

// ---------------------------------------------------------------- aula 5: conferir

const perto100 = (r: Rng) => r.int(2, 5) * 100 + r.pick([-12, -8, -3, 4, 9, 13])

export const conferirN1: Gerador = {
  id: 'conferir-n1',
  aula: 'B.U2.A5',
  nivel: 1,
  gerar(r) {
    const a = perto100(r)
    const b = perto100(r)
    const ra = Math.round(a / 100) * 100
    const rb = Math.round(b / 100) * 100
    const est = ra + rb
    return {
      enunciado: `Sem fazer a conta: ${a} + ${b} dá perto de quanto?`,
      formato: 'escolha',
      ...girar(r, [{ texto: fmt(est) }, { texto: fmt(est * 10), erro: 'estimativa-ordem-errada' }, { texto: fmt(est / 10), erro: 'estimativa-ordem-errada' }]),
      dicas: ['Arredonde cada número à centena.', `${a} ≈ ${ra} e ${b} ≈ ${rb}.`, `${ra} + ${rb} = ${fmt(est)}. A soma fica perto de ${fmt(est)}.`],
    }
  },
}

export const conferirN2: Gerador = {
  id: 'conferir-n2',
  aula: 'B.U2.A5',
  nivel: 2,
  gerar(r) {
    const a = r.int(41, 399)
    const b = r.int(12, a - 11)
    const c = a - b
    return {
      enunciado: `Alguém fez ${a} − ${b} = ${c}. Qual conta confere o resultado?`,
      formato: 'escolha',
      ...girar(r, [{ texto: `${c} + ${b} = ${a}?` }, { texto: `${a} + ${b} = ${c}?`, erro: 'inversa-errada' }, { texto: `${c} − ${b} = ${a}?`, erro: 'inversa-errada' }]),
      dicas: ['Para conferir, desfaça a conta.', 'A subtração tirou uma parte. Devolva essa parte ao que sobrou.', `O que sobrou mais o que tirou: ${c} + ${b} tem de dar ${a}.`],
    }
  },
}

export const conferirN3: Gerador = {
  id: 'conferir-n3',
  aula: 'B.U2.A5',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const ua = r.int(3, 9)
      const ub = r.int(10 - ua, 9)
      const a = r.int(1, 6) * 100 + r.int(0, 8) * 10 + ua
      const b = r.int(1, 2) * 100 + r.int(0, 8) * 10 + ub
      const certa = a + b
      const achou = semReserva(a, b)
      return {
        enunciado: `Alguém fez ${a} + ${b} e achou ${achou}. Confira. Qual é o resultado certo?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[achou, 'esquece-reserva']]),
        dicas: ['Faça a inversa: o resultado menos uma parcela tem de dar a outra.', `Refaça ${a} + ${b} casa por casa, das unidades para a esquerda.`, `${a} + ${b} = ${certa}. O ${achou} esqueceu o vai um.`],
      }
    }
    const ua = r.int(0, 6)
    const ub = r.int(ua + 1, 9)
    const a = r.int(3, 9) * 100 + r.int(2, 9) * 10 + ua
    const b = r.int(1, 2) * 100 + r.int(0, 1) * 10 + ub
    const certa = a - b
    const achou = menorDoMaior(a, b)
    return {
      enunciado: `Alguém fez ${a} − ${b} e achou ${achou}. Confira. Qual é o resultado certo?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[achou, 'subtrai-menor-do-maior']]),
      dicas: ['Faça a inversa: o resultado mais o que tirou tem de dar o número de cima.', `${achou} + ${b} dá ${achou + b}, não ${a}. Refaça a conta armada.`, `${a} − ${b} = ${certa}. Nas unidades, ${ua} − ${ub} pede uma dezena aberta.`],
    }
  },
}

export const GERADORES_U2: Gerador[] = [
  sentidosN1, sentidosN2, sentidosN3,
  cabecaN1, cabecaN2, cabecaN3,
  armadaSomaN1, armadaSomaN2, armadaSomaN3,
  armadaSubN1, armadaSubN2, armadaSubN3,
  conferirN1, conferirN2, conferirN3,
]
