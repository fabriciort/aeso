import type { Gerador, Item, Resposta, Rng, Visual } from '@/lib/formation/schema'

// Unidade 10: razão e proporção (aulas 4 a 6). Inversamente proporcional,
// taxa unitária e concentração e diluição.
//
// Toda conta é feita em inteiros: dinheiro em centavos, horas em décimos.
// Um decimal só vira texto com vírgula no fim. Respostas decimais vão como
// texto com vírgula ('2,5'); respostas inteiras, como número. Quando os
// números precisam combinar entre si (o produto dividido pelo valor novo
// tem de dar exato), as combinações boas são listadas uma vez, ao carregar
// o arquivo, e o gerador sorteia uma delas: sem laços de tentativa.

/** n em unidades de 10^-casas, com vírgula e sem zeros no fim: (25, 1) → '2,5'; (520, 2) → '5,2'; (500, 2) → '5'. */
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
/** Centavos em reais, como se escreve: 1100 → 'R$ 11'; 520 → 'R$ 5,20'; 264000 → 'R$ 2.640'. */
const brl = (c: number) => `R$ ${mil(Math.floor(c / 100))}${c % 100 ? `,${String(c % 100).padStart(2, '0')}` : ''}`
/** Centavos sem o R$, para a tabela: 520 → '5,20'; 1100 → 11. */
const reais = (c: number): number | string => (c % 100 ? `${Math.floor(c / 100)},${String(c % 100).padStart(2, '0')}` : c / 100)

/** Erros previsíveis, sem marcar a certa e sem repetir. */
function mapa(certa: Resposta, pares: [string, string][]): Record<string, string> {
  const erros: Record<string, string> = {}
  for (const [valor, erro] of pares) {
    if (valor !== String(certa) && !(valor in erros)) erros[valor] = erro
  }
  return erros
}
/** a ÷ b como o aluno digitaria, se der exato com até 2 casas; senão, nada. */
function exato(a: number, b: number): string | undefined {
  return (a * 100) % b === 0 ? dec((a * 100) / b, 2) : undefined
}
/** Só os pares que existem (um erro que não dá conta exata fica de fora). */
const pares = (ps: [string | undefined, string][]) => ps.filter((p): p is [string, string] => p[0] !== undefined)

type Op = { texto: string; certa?: boolean; erro?: string }
/** Opções em ordem embaralhada pela semente; a resposta é o índice da certa. */
function embaralhar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const resto = [...opcoes]
  const ordem: Op[] = []
  while (resto.length) ordem.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

type Valor = number | string
const tab = (tabela: Record<string, unknown>, esboco: string): Visual => ({ modelo: 'livre', estado: { tabela }, esboco })
const linha = (rotulo: string, valores: Valor[]) => ({ rotulo, valores })
const seta = (rotulo: string, embaixo = false) => ({ de: 0, para: 1, rotulo, ...(embaixo ? { embaixo: true } : {}) })

// ---------------------------------------------------------------- aula 4: inversamente proporcional

/** Uma situação inversa: os números aparecem na ordem (x, t, y), e a resposta é x × t ÷ y. */
interface Inversa {
  a: string
  b: string
  frase: (x: number, t: number, y: number) => string
  /** O que não muda, em palavras ("o trabalho todo"). */
  todo?: string
}

const INVERSAS_N1: Inversa[] = [
  { a: 'torneiras', b: 'horas', frase: (x, t, y) => `Com ${x} torneiras, o tanque enche em ${t} h. Com ${y} torneiras iguais, em quantas horas ele enche?` },
  { a: 'pintores', b: 'dias', frase: (x, t, y) => `${x} pintores pintam a casa em ${t} dias. Em quantos dias ${y} pintores, no mesmo ritmo, pintam a casa?` },
  { a: 'impressoras', b: 'minutos', frase: (x, t, y) => `${x} impressoras imprimem o lote em ${t} min. Em quantos minutos ${y} impressoras iguais imprimem o lote?` },
]

export const inversaN1: Gerador = {
  id: 'inversa-n1',
  aula: 'B.U10.A4',
  nivel: 1,
  gerar(r) {
    // O dobro ou o triplo: y = x × k, e t é múltiplo de k.
    const s = r.pick(INVERSAS_N1)
    const x = r.int(2, 4)
    const k = r.int(2, 3)
    const y = x * k
    const certa = r.int(2, 8)
    const t = certa * k
    return {
      enunciado: s.frase(x, t, y),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares([
        [String(t * k), 'regra-de-tres-direta-na-inversa'],
        [t - (y - x) > 0 ? String(t - (y - x)) : undefined, 'pensa-aditivamente'],
      ])),
      dicas: [
        `Mais ${s.a} terminam mais rápido. Com ${k === 2 ? 'o dobro' : 'o triplo'} de ${s.a}, o tempo cai para ${k === 2 ? 'a metade' : 'um terço'}.`,
        `De ${x} para ${y} ${s.a}: × ${k}. Então o tempo: ÷ ${k}.`,
        `${t} ÷ ${k} = ${certa}. Confira: ${x} × ${t} = ${y} × ${certa} = ${x * t}.`,
      ],
      visual: tab(
        { linhas: [linha(s.a, [x, y]), linha(s.b, [t, '?'])], setas: [seta(`× ${k}`)] },
        `A tabela: ${s.a} ${x} e ${y}, com × ${k} em cima; ${s.b} ${t} e "?". Ao conferir, aparece a seta ÷ ${k} embaixo.`,
      ),
    }
  },
}

/** Combinações (x, t, y) com x × t ÷ y exato: menos gente (y < x) ou um fator que não é inteiro. */
const COMBOS_N2: [number, number, number][] = []
for (let x = 2; x <= 10; x++) {
  for (let y = 2; y <= 10; y++) {
    if (y === x || (y > x && y % x === 0)) continue
    for (let t = 4; t <= 30; t++) {
      const p = x * t
      if (p % y === 0 && p <= 120 && p / y <= 60) COMBOS_N2.push([x, t, y])
    }
  }
}

const INVERSAS_N2: Inversa[] = [
  { a: 'pedreiros', b: 'dias', frase: (x, t, y) => `${x} pedreiros fazem o muro em ${t} dias. Em quantos dias ${y} pedreiros, no mesmo ritmo, fazem o muro?`, todo: 'o trabalho todo' },
  { a: 'cães', b: 'dias', frase: (x, t, y) => `Para ${x} cães, um saco de ração dura ${t} dias. Para ${y} cães do mesmo porte, quantos dias ele dura?`, todo: 'a ração toda' },
  { a: 'máquinas', b: 'horas', frase: (x, t, y) => `${x} máquinas iguais embalam o pedido em ${t} h. Em quantas horas ${y} dessas máquinas embalam o pedido?`, todo: 'o trabalho todo' },
]

export const inversaN2: Gerador = {
  id: 'inversa-n2',
  aula: 'B.U10.A4',
  nivel: 2,
  gerar(r) {
    const s = r.pick(INVERSAS_N2)
    const [x, t, y] = r.pick(COMBOS_N2)
    const p = x * t
    const certa = p / y
    return {
      enunciado: s.frase(x, t, y),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares([
        [exato(t * y, x), 'regra-de-tres-direta-na-inversa'],
        [t - (y - x) > 0 ? String(t - (y - x)) : undefined, 'pensa-aditivamente'],
      ])),
      dicas: [
        `${y < x ? 'Menos' : 'Mais'} ${s.a}, ${y < x ? 'mais' : 'menos'} tempo. O que não muda é ${s.a} × ${s.b}: ${s.todo}.`,
        `${s.todo![0].toUpperCase()}${s.todo!.slice(1)}: ${x} × ${t} = ${p}. Agora divida por ${y}.`,
        `${p} ÷ ${y} = ${certa} ${s.b}. Confira: ${y} × ${certa} = ${p}.`,
      ],
      visual: tab(
        { linhas: [linha(s.a, [x, y]), linha(s.b, [t, '?'])] },
        `A tabela sem setas: ${s.a} ${x} e ${y}; ${s.b} ${t} e "?".`,
      ),
    }
  },
}

/** Velocidade e tempo (v1, t1, v2): o tempo novo em meias horas. */
const COMBOS_VELOCIDADE: [number, number, number][] = []
for (let v1 = 40; v1 <= 120; v1 += 10) {
  for (let t1 = 1; t1 <= 6; t1++) {
    for (let v2 = 40; v2 <= 120; v2 += 10) {
      const d = v1 * t1
      if (v2 !== v1 && (2 * d) % v2 === 0 && d / v2 <= 10) COMBOS_VELOCIDADE.push([v1, t1, v2])
    }
  }
}
/** Operários e prazo (x, t1, t2): quantos operários fazem a obra em t2 dias. */
const COMBOS_OBRA: [number, number, number][] = []
for (let x = 2; x <= 20; x++) {
  for (let t1 = 4; t1 <= 40; t1 += 2) {
    for (let t2 = 4; t2 <= 40; t2 += 2) {
      const p = x * t1
      if (t2 !== t1 && p % t2 === 0 && p / t2 <= 40 && t2 % t1 !== 0 && t1 % t2 !== 0) COMBOS_OBRA.push([x, t1, t2])
    }
  }
}

export const inversaN3: Gerador = {
  id: 'inversa-n3',
  aula: 'B.U10.A4',
  nivel: 3,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const [v1, t1, v2] = r.pick(COMBOS_VELOCIDADE)
      const d = v1 * t1
      const decimos = (10 * d) / v2
      const certa = resposta(decimos, 1)
      return {
        enunciado: `A ${v1} km/h, uma viagem leva ${t1} h. Na mesma estrada, a ${v2} km/h, quantas horas ela leva?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, pares([[exato(t1 * v2, v1), 'regra-de-tres-direta-na-inversa']])),
        dicas: [
          'A estrada é a mesma: o que não muda é a distância, velocidade × tempo.',
          `A distância: ${v1} × ${t1} = ${d} km. Agora divida pela velocidade nova.`,
          `${d} ÷ ${v2} = ${dec(decimos, 1)} h. Confira: ${v2} × ${dec(decimos, 1)} = ${d}.`,
        ],
      }
    }
    const [x, t1, t2] = r.pick(COMBOS_OBRA)
    const p = x * t1
    const certa = p / t2
    return {
      enunciado: `${x} operários fazem a obra em ${t1} dias. Quantos operários, no mesmo ritmo, fazem a obra em ${t2} dias?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, pares([[exato(x * t2, t1), 'regra-de-tres-direta-na-inversa']])),
      dicas: [
        `Em ${t2 < t1 ? 'menos' : 'mais'} dias, a obra pede ${t2 < t1 ? 'mais' : 'menos'} operários. O que não muda é operários × dias.`,
        `O trabalho todo: ${x} × ${t1} = ${p}. Divida pelos ${t2} dias.`,
        `${p} ÷ ${t2} = ${certa} operários. Confira: ${certa} × ${t2} = ${p}.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 5: taxa unitária

/** Uma taxa: os números aparecem na ordem (quantidade, valor), e a taxa é valor ÷ quantidade. */
interface Taxa {
  q: string
  v: string
  frase: (q: number, v: number) => string
  por: string
  dinheiro?: boolean
}

const TAXAS_N1: Taxa[] = [
  { q: 'tomate (kg)', v: 'preço (R$)', frase: (q, v) => `${q} kg de tomate custam ${brl(v * 100)}. Quantos reais custa 1 kg?`, por: 'reais por kg', dinheiro: true },
  { q: 'gasolina (L)', v: 'distância (km)', frase: (q, v) => `Com ${q} L de gasolina, o carro andou ${v} km. Quantos km ele faz com 1 L?`, por: 'km/L' },
  { q: 'tempo (h)', v: 'distância (km)', frase: (q, v) => `Em ${q} h, sempre no mesmo ritmo, o ônibus andou ${v} km. Quantos km ele anda em 1 h?`, por: 'km/h' },
]

export const taxaUnitariaN1: Gerador = {
  id: 'taxa-unitaria-n1',
  aula: 'B.U10.A5',
  nivel: 1,
  gerar(r) {
    const modo = r.int(0, 2)
    const s = TAXAS_N1[modo]
    const q = r.int(2, 6)
    const certa = modo === 0 ? r.int(3, 15) : modo === 1 ? r.int(8, 16) : r.int(8, 18) * 5
    const v = certa * q
    return {
      enunciado: s.frase(q, v),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(v - (q - 1)), 'pensa-aditivamente'],
        [String(v * q), 'operacao-trocada'],
      ]),
      dicas: [
        'A taxa unitária é quanto corresponde a 1. Para chegar ao 1, divida as duas linhas pelo mesmo número.',
        `De ${q} para 1: ÷ ${q}. Faça ${v} ÷ ${q}.`,
        `${v} ÷ ${q} = ${certa} ${s.por}.`,
      ],
      visual: tab(
        { linhas: [linha(s.q, [q, 1]), linha(s.v, [v, '?'])], setas: [seta(`÷ ${q}`), seta(`÷ ${q}`, true)] },
        `A tabela: ${q} e 1 em cima, ${v} e "?" embaixo, com ÷ ${q} nas duas setas.`,
      ),
    }
  },
}

const PACOTES: { nome: string; u: string; um: string }[] = [
  { nome: 'Arroz', u: 'kg', um: 'o quilo' },
  { nome: 'Feijão', u: 'kg', um: 'o quilo' },
  { nome: 'Sabão em pó', u: 'kg', um: 'o quilo' },
  { nome: 'Amaciante', u: 'L', um: 'o litro' },
]

export const taxaUnitariaN2: Gerador = {
  id: 'taxa-unitaria-n2',
  aula: 'B.U10.A5',
  nivel: 2,
  gerar(r) {
    // Pacote pequeno (a) e grande (b), com o preço de 1 unidade em centavos.
    // O pacote grande custa mais no total; a metade das vezes, o quilo dele
    // é mais barato, e na outra metade, mais caro.
    const p = r.pick(PACOTES)
    const a = r.int(1, 2)
    const b = r.int(3, 5)
    const ua = r.int(40, 150) * 10
    const d = r.int(2, 10) * 10
    const grandeGanha = r.int(0, 1) === 0
    const ub = grandeGanha ? ua - d : ua + d
    const pa = a * ua
    const pb = b * ub
    const [ganha, perde] = grandeGanha ? [ub, ua] : [ua, ub]
    return {
      enunciado: `${p.nome}: ${a} ${p.u} por ${brl(pa)} ou ${b} ${p.u} por ${brl(pb)}. Em qual pacote ${p.um} é mais barato?`,
      formato: 'escolha',
      ...embaralhar(r, [
        { texto: `No de ${a} ${p.u}`, certa: !grandeGanha, erro: grandeGanha ? 'compara-preco-sem-taxa-unitaria' : undefined },
        { texto: `No de ${b} ${p.u}`, certa: grandeGanha, erro: grandeGanha ? undefined : 'maior-pacote-sempre-mais-barato' },
        { texto: 'Nos dois, o mesmo preço' },
      ]),
      dicas: [
        `Pacotes de tamanhos diferentes só se comparam pelo preço de 1 ${p.u} de cada.`,
        a === 1
          ? `O de 1 ${p.u} já mostra o preço de 1 ${p.u}: ${brl(pa)}. Agora o de ${b} ${p.u}: ${brl(pb)} ÷ ${b}.`
          : `No de ${a} ${p.u}: ${brl(pa)} ÷ ${a} = ${brl(ua)}. Agora o de ${b} ${p.u}: ${brl(pb)} ÷ ${b}.`,
        `${brl(ganha)} contra ${brl(perde)}: ${p.um} mais barato é o do pacote de ${grandeGanha ? b : a} ${p.u}.`,
      ],
      visual: tab(
        { linhas: [linha(`pacote (${p.u})`, [a, b]), linha('preço (R$)', [reais(pa), reais(pb)]), linha(`preço de 1 ${p.u}`, ['?', '?'])] },
        `A tabela com os dois pacotes e uma terceira linha, o preço de 1 ${p.u}, ainda com "?".`,
      ),
    }
  },
}

/** Combinações (q1, q2) para escalar com a taxa: q2 não é múltiplo de q1. */
const ESCALAS: [number, number][] = []
for (let q1 = 2; q1 <= 12; q1++) for (let q2 = 3; q2 <= 30; q2++) if (q2 !== q1 && q2 % q1 !== 0 && q1 % q2 !== 0) ESCALAS.push([q1, q2])
/** As mesmas, em horas de estrada: até 12 h. */
const ESCALAS_H = ESCALAS.filter(([q1, q2]) => q1 <= 5 && q2 <= 12)

/** Preços de 1 item, em centavos, de R$ 0,50 a R$ 6, sem o R$ 1 (nele, somar a diferença daria a certa). */
const PRECOS = Array.from({ length: 56 }, (_, i) => 50 + i * 10).filter((c) => c !== 100)

export const taxaUnitariaN3: Gerador = {
  id: 'taxa-unitaria-n3',
  aula: 'B.U10.A5',
  nivel: 3,
  gerar(r) {
    // Os números aparecem na ordem (q1, valor, q2); a resposta é valor ÷ q1 × q2.
    const modo = r.int(0, 2)
    const [q1, q2] = r.pick(modo === 2 ? ESCALAS_H : ESCALAS)
    if (modo === 0) {
      const u = r.pick(PRECOS)
      const c1 = u * q1
      const c2 = u * q2
      const certa = resposta(c2, 2)
      const coisa = r.pick(['ovos', 'pães', 'parafusos'])
      return {
        enunciado: `${q1} ${coisa} custam ${brl(c1)}. Quantos reais custam ${q2} ${coisa}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, pares([[c1 + (q2 - q1) * 100 > 0 ? dec(c1 + (q2 - q1) * 100, 2) : undefined, 'pensa-aditivamente']])),
        dicas: [
          `Ache primeiro a taxa unitária: o preço de 1 só. Depois multiplique por ${q2}.`,
          `${brl(c1)} ÷ ${q1} = ${brl(u)} cada.`,
          `${brl(u)} × ${q2} = ${brl(c2)}.`,
        ],
      }
    }
    const u = modo === 1 ? r.int(8, 15) : r.int(5, 9) * 10
    const v1 = u * q1
    const certa = u * q2
    const frase = modo === 1
      ? `Com ${q1} L, o carro andou ${v1} km. No mesmo consumo, quantos km ele anda com ${q2} L?`
      : `Em ${q1} h, o caminhão andou ${v1} km. No mesmo ritmo, quantos km ele anda em ${q2} h?`
    return {
      enunciado: frase,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[String(v1 + (q2 - q1)), 'pensa-aditivamente']]),
      dicas: [
        `Ache primeiro a taxa unitária: quantos km ${modo === 1 ? 'com 1 L' : 'em 1 h'}. Depois multiplique por ${q2}.`,
        `${v1} ÷ ${q1} = ${u} ${modo === 1 ? 'km/L' : 'km/h'}.`,
        `${u} × ${q2} = ${certa} km.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 6: concentração e diluição

export const concentracaoN1: Gerador = {
  id: 'concentracao-n1',
  aula: 'B.U10.A6',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      // Ler o rótulo: mg em V mL. Os números vêm na ordem (C, V).
      const c = r.pick([4, 5, 10, 12, 20, 25, 40, 50])
      const v = r.pick([2, 3, 4, 5, 10, 15, 20])
      const certa = c * v
      return {
        enunciado: `Um xarope tem ${c} mg/mL no rótulo. Quantos mg há em ${v} mL dele?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, pares([
          [String(c + v), 'soma-no-lugar-de-multiplicar'],
          [c % v === 0 ? String(c / v) : undefined, 'operacao-trocada'],
        ])),
        dicas: [
          `${c} mg/mL quer dizer ${c} mg em cada mL.`,
          `São ${v} mL, cada um com ${c} mg: faça ${v} × ${c}.`,
          `${v} × ${c} = ${certa} mg.`,
        ],
        visual: tab(
          { linhas: [linha('xarope (mL)', [1, v]), linha('remédio (mg)', [c, '?'])], fator: `× ${c}` },
          `A tabela: 1 e ${v} mL em cima, ${c} e "?" mg embaixo, com a seta × ${c} à direita.`,
        ),
      }
    }
    // A concentração de uma solução: S mg em V mL. Os números vêm na ordem (S, V).
    const v = r.pick([2, 4, 5, 10, 20, 25, 50])
    const certa = r.int(2, 30)
    const s = certa * v
    return {
      enunciado: `Uma solução tem ${mil(s)} mg de sal em ${v} mL. Quantos mg de sal há em cada mL?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [String(s * v), 'operacao-trocada'],
        [String(s - (v - 1)), 'pensa-aditivamente'],
      ]),
      dicas: [
        'A concentração é a taxa unitária: o sal de 1 mL. Divida o sal pelo volume.',
        `De ${v} mL para 1 mL: ÷ ${v}. Faça ${mil(s)} ÷ ${v}.`,
        `${mil(s)} ÷ ${v} = ${certa} mg/mL.`,
      ],
      visual: tab(
        { linhas: [linha('volume (mL)', [v, 1]), linha('sal (mg)', [s, '?'])], setas: [seta(`÷ ${v}`), seta(`÷ ${v}`, true)] },
        `A tabela: ${v} e 1 mL em cima, ${mil(s)} e "?" mg embaixo, com ÷ ${v} nas duas setas.`,
      ),
    }
  },
}

export const concentracaoN2: Gerador = {
  id: 'concentracao-n2',
  aula: 'B.U10.A6',
  nivel: 2,
  gerar(r) {
    // Diluir por um fator inteiro k. Os números vêm na ordem (V, C, V2).
    const k = r.pick([2, 4, 5, 10])
    const v = r.pick([10, 20, 25, 50, 100])
    const c2 = r.int(1, 10)
    const c = c2 * k
    const v2 = v * k
    const soluto = c * v
    const inicio = `Há ${v} mL de uma solução com ${c} mg/mL. Com água, o volume vai a ${mil(v2)} mL.`
    if (r.int(0, 1) === 0) {
      return {
        enunciado: `${inicio} Quantos mg/mL fica?`,
        formato: 'numero',
        resposta: c2,
        erros: mapa(c2, pares([
          [String(c * k), 'regra-de-tres-direta-na-inversa'],
          [c - (v2 - v) > 0 ? String(c - (v2 - v)) : undefined, 'pensa-aditivamente'],
        ])),
        dicas: [
          'A água não traz soluto: os mesmos mg ficam em mais mL. A concentração cai.',
          `O volume foi a ${k} vezes (${v} × ${k} = ${mil(v2)}). Então a concentração: ÷ ${k}.`,
          `${c} ÷ ${k} = ${c2} mg/mL. Confira: ${c} × ${v} = ${c2} × ${mil(v2)} = ${mil(soluto)} mg.`,
        ],
        visual: tab(
          { linhas: [linha('volume (mL)', [v, v2]), linha('soluto (mg)', [soluto, soluto]), linha('mg/mL', [c, '?'])], setas: [seta(`× ${k}`)] },
          `A tabela: volume ${v} e ${mil(v2)} com × ${k} em cima; o soluto igual, ${mil(soluto)} mg, nas duas colunas; mg/mL ${c} e "?".`,
        ),
      }
    }
    return {
      enunciado: `${inicio} Quantos mg de soluto há agora?`,
      formato: 'numero',
      resposta: soluto,
      erros: mapa(soluto, [
        [String(c * v2), 'diluir-muda-o-soluto'],
        [String(c2 * v), 'diluir-muda-o-soluto'],
      ]),
      dicas: [
        'Diluir é pôr água: o soluto não muda. Basta saber quanto havia antes.',
        `Antes: ${v} mL com ${c} mg em cada. Faça ${c} × ${v}.`,
        `${c} × ${v} = ${mil(soluto)} mg, antes e depois. Confira: ${c2} × ${mil(v2)} = ${mil(soluto)}.`,
      ],
      visual: tab(
        { linhas: [linha('volume (mL)', [v, v2]), linha('mg/mL', [c, c2])], setas: [seta(`× ${k}`), seta(`÷ ${k}`, true)] },
        `A tabela: volume ${v} e ${mil(v2)} com × ${k} em cima; mg/mL ${c} e ${c2} com ÷ ${k} embaixo.`,
      ),
    }
  },
}

const VOLUMES = [10, 20, 25, 40, 50, 60, 75, 80, 100, 150, 200, 250]
const FINAIS = [100, 125, 150, 200, 250, 300, 400, 500, 750, 1000]
/** Diluir até um volume que não é múltiplo do inicial (V1, C1, V2), com a concentração final exata. */
const COMBOS_FINAL: [number, number, number][] = []
for (const v1 of VOLUMES) for (let c1 = 4; c1 <= 100; c1 += 2) for (const v2 of FINAIS) if (v2 > v1 && v2 % v1 !== 0 && (c1 * v1) % v2 === 0) COMBOS_FINAL.push([v1, c1, v2])
/** Preparar V2 mL a C2 mg/mL a partir de uma solução de C1 (V2, C2, C1), com o volume da forte exato. */
const COMBOS_PREPARO: [number, number, number][] = []
for (const v2 of [100, 200, 250, 500, 1000]) for (let c2 = 2; c2 <= 20; c2++) for (let c1 = 10; c1 <= 100; c1 += 5) if (c1 > c2 && (v2 * c2) % c1 === 0 && c1 % c2 !== 0) COMBOS_PREPARO.push([v2, c2, c1])
/** A água a juntar a V1 mL de C1 para chegar a C2 (V1, C1, C2). */
const COMBOS_AGUA: [number, number, number][] = []
for (const v1 of [10, 20, 25, 50, 100]) for (let c1 = 10; c1 <= 100; c1 += 5) for (let c2 = 2; c2 < c1; c2++) if ((v1 * c1) % c2 === 0 && (v1 * c1) / c2 <= 2000) COMBOS_AGUA.push([v1, c1, c2])

export const concentracaoN3: Gerador = {
  id: 'concentracao-n3',
  aula: 'B.U10.A6',
  nivel: 3,
  gerar(r) {
    const modo = r.int(0, 2)
    if (modo === 0) {
      const [v1, c1, v2] = r.pick(COMBOS_FINAL)
      const soluto = c1 * v1
      const certa = soluto / v2
      return {
        enunciado: `${v1} mL de uma solução com ${c1} mg/mL vão a ${mil(v2)} mL com água. Quantos mg/mL fica?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, pares([
          [exato(c1 * v2, v1), 'regra-de-tres-direta-na-inversa'],
        ])),
        dicas: [
          'O soluto não muda: concentração × volume é o mesmo antes e depois.',
          `O soluto: ${c1} × ${v1} = ${mil(soluto)} mg. Agora divida pelo volume novo.`,
          `${mil(soluto)} ÷ ${mil(v2)} = ${certa} mg/mL.`,
        ],
      }
    }
    if (modo === 1) {
      const [v2, c2, c1] = r.pick(COMBOS_PREPARO)
      const soluto = c2 * v2
      const certa = soluto / c1
      return {
        enunciado: `Você quer ${mil(v2)} mL com ${c2} mg/mL, a partir de uma solução de ${c1} mg/mL. Quantos mL dela entram?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, pares([
          [exato(v2 * c1, c2), 'regra-de-tres-direta-na-inversa'],
        ])),
        dicas: [
          'A solução forte carrega todo o soluto da fraca. Ache o soluto e veja quantos mL da forte o têm.',
          `O soluto: ${c2} × ${mil(v2)} = ${mil(soluto)} mg. Cada mL da forte tem ${c1} mg.`,
          `${mil(soluto)} ÷ ${c1} = ${certa} mL. O resto, até ${mil(v2)} mL, é água.`,
        ],
      }
    }
    const [v1, c1, c2] = r.pick(COMBOS_AGUA)
    const soluto = v1 * c1
    const vf = soluto / c2
    const certa = vf - v1
    return {
      enunciado: `Você tem ${v1} mL de uma solução com ${c1} mg/mL e quer que ela fique com ${c2} mg/mL. Quantos mL de água junta?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[String(vf), 'esquece-volume-do-concentrado']]),
      dicas: [
        'O soluto não muda. Ache o volume final; a água é o que falta para chegar a ele.',
        `O soluto: ${c1} × ${v1} = ${mil(soluto)} mg. A ${c2} mg/mL, ele ocupa ${mil(soluto)} ÷ ${c2} = ${mil(vf)} mL.`,
        `${mil(vf)} − ${v1} = ${mil(certa)} mL de água.`,
      ],
    }
  },
}

export const GERADORES_U10B: Gerador[] = [
  inversaN1,
  inversaN2,
  inversaN3,
  taxaUnitariaN1,
  taxaUnitariaN2,
  taxaUnitariaN3,
  concentracaoN1,
  concentracaoN2,
  concentracaoN3,
]
