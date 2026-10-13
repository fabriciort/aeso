import type { Gerador, Item, Rng, Visual } from '@/lib/formation/schema'

// Unidade 13: potências e raízes (aulas 1 a 3). Potência, propriedades sem
// decorar, expoente zero e negativo. As potências aparecem em TeX, com a
// conta inteira entre chaves para a linha não quebrar no meio
// (${2^{3} \times 2^{2}}$), e o expoente sempre entre chaves. O teclado só
// digita números: os itens pedem um valor, um expoente ou um decimal (com
// vírgula, '0,01'), ou usam "escolha" para comparar contas. As contas são
// feitas com inteiros: o maior valor (10⁹) cabe folgado num número do
// JavaScript.

// ---------------------------------------------------------------- ajudas

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' }
/** O expoente em sobrescrito, para os visuais: 3 → ³, −1 → ⁻¹. */
const sup = (e: number) => [...String(e)].map((c) => SUP[c]).join('')

/** A potência em TeX: 2^{3}; a base negativa entre parênteses: (-3)^{2}. */
const tp = (b: number, e: number) => (b < 0 ? `(${b})^{${e}}` : `${b}^{${e}}`)
/** Uma fórmula inteira em TeX, entre chaves para não quebrar a linha. */
const tex = (f: string) => `\${${f}}$`
/** A mesma fórmula com o ponto de interrogação dentro do TeX, para ele não cair sozinho na linha de baixo. */
const texQ = (f: string) => `\${${f}}\\text{?}$`

/** Inteiro com o ponto do milhar: 1000000 → 1.000.000. */
const mil = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
/** O mesmo número dentro do TeX: 1{.}000. */
const milTex = (n: number) => mil(n).replace(/\./g, '{.}')

/** b elevado a e (e ≥ 0), multiplicando de verdade. */
function pot(b: number, e: number): number {
  let v = 1
  for (let i = 0; i < e; i++) v *= b
  return v
}

/** 10⁻ᵏ como o aluno digita: 0,01. */
const decimalDe10 = (k: number) => `0,${'0'.repeat(k - 1)}1`
/** 1 ÷ bᵏ como decimal exato (b é 2, 4, 5 ou 10): 2⁻² → 0,25. */
function decimalInverso(b: number, k: number): string {
  // 1 ÷ bᵏ = (10ᵈ ÷ bᵏ) ÷ 10ᵈ, com d casas suficientes para a divisão ser exata.
  const den = pot(b, k)
  let d = 0
  while (pot(10, d) % den !== 0) d++
  const num = String(pot(10, d) / den).padStart(d, '0')
  return `0,${num}`
}

/** Fatores por extenso: "2 × 2 × 2". */
const extenso = (b: number, e: number) => Array.from({ length: e }, () => String(b)).join(' × ')
/** Um grupo de fatores, com parênteses só quando tem mais de um. */
const grupo = (b: number, e: number) => (e > 1 ? `(${extenso(b, e)})` : String(b))

/** Erros previsíveis (respostas digitadas), sem nunca marcar a certa e sem repetir. */
function mapa(certa: number | string, pares: [number | string | null, string][]): Record<string, string> {
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
function embaralhar(r: Rng, opcoes: Op[]): Pick<Item, 'opcoes' | 'resposta' | 'erros'> {
  const resto = [...opcoes]
  const ordem: Op[] = []
  while (resto.length) ordem.push(resto.splice(r.int(0, resto.length - 1), 1)[0])
  const erros: Record<string, string> = {}
  ordem.forEach((o, i) => o.erro && (erros[String(i)] = o.erro))
  return { opcoes: ordem.map((o) => o.texto), resposta: ordem.findIndex((o) => o.certa), erros }
}

const exp = (expressao: string[], esboco: string): Visual => ({ modelo: 'livre', estado: { expressao }, esboco })

/** Como se fala "2 elevado a 3": "dois ao quadrado" e "ao cubo" nos expoentes 2 e 3. */
const elevado = (b: number | string, e: number) => (e === 2 ? `${b} ao quadrado` : e === 3 ? `${b} ao cubo` : `${b} elevado a ${e < 0 ? `menos ${-e}` : e}`)

// ---------------------------------------------------------------- aula 1: potência

export const potenciaN1: Gerador = {
  id: 'potencia-n1',
  aula: 'B.U13.A1',
  nivel: 1,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // O quadrado de lado b, desenhado.
      const b = r.int(2, 9)
      const certa = b * b
      return {
        enunciado: `Quanto é ${texQ(tp(b, 2))} Conte os quadradinhos do quadrado.`,
        fala: `Quanto é ${b} ao quadrado? Conte os quadradinhos do quadrado.`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [b * 2, 'potencia-multiplica-base-pelo-expoente'],
          [pot(2, b), 'potencia-troca-base-e-expoente'],
        ]),
        dicas: [
          `${tex(tp(b, 2))} é ${b} ao quadrado: o quadrado de lado ${b}.`,
          `São ${b} linhas de ${b} quadradinhos: ${tex(`${b} \\times ${b}`)}.`,
          `${tex(`${b} \\times ${b} = ${certa}`)}.`,
        ],
        visual: { modelo: 'retangulo', estado: { linhas: b, colunas: b, rotulos: true }, esboco: `O quadrado de ${b} linhas e ${b} colunas, com o lado escrito.` },
      }
    }
    if (tipo === 1) {
      // Uma potência pequena, com a conta por extenso na tela.
      const [b, e] = r.pick([[2, 3], [2, 4], [2, 5], [3, 3], [3, 4], [4, 3], [5, 3], [10, 3], [10, 4]] as const)
      const certa = pot(b, e)
      return {
        enunciado: `Quanto é ${texQ(tp(b, e))}`,
        fala: `Quanto é ${elevado(b, e)}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [b * e, 'potencia-multiplica-base-pelo-expoente'],
          [pot(e, b), 'potencia-troca-base-e-expoente'],
        ]),
        dicas: [
          `O expoente ${e} conta quantas vezes o ${b} aparece.`,
          `${tex(`${tp(b, e)} = ${extenso(b, e).replace(/×/g, '\\times')}`)}. Multiplique de dois em dois.`,
          `${tex(`${tp(b, e)} = ${milTex(certa)}`)}.`,
        ],
        visual: exp([`${b}${sup(e)}`, extenso(b, e)], `${b}${sup(e)} e, embaixo, grande, ${extenso(b, e)}.`),
      }
    }
    // O expoente de um produto de fatores iguais.
    const b = r.int(2, 9)
    const k = r.int(3, 6)
    const conta = extenso(b, k).replace(/×/g, '\\times')
    return {
      enunciado: `Escreva ${tex(conta)} como potência de **${b}**. Qual é o expoente?`,
      fala: `Escreva ${extenso(b, k).replace(/×/g, 'vezes')} como potência de ${b}. Qual é o expoente?`,
      formato: 'numero',
      resposta: k,
      erros: mapa(k, [[b, 'potencia-troca-base-e-expoente']]),
      dicas: [
        'O expoente conta quantas vezes o mesmo número aparece.',
        `Conte os ${b} da conta, um por um.`,
        `São ${k} fatores ${b}: ${tex(tp(b, k))}. O expoente é ${k}.`,
      ],
      visual: exp([extenso(b, k)], `${extenso(b, k)}, grande, no centro.`),
    }
  },
}

export const potenciaN2: Gerador = {
  id: 'potencia-n2',
  aula: 'B.U13.A1',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Potência de 10: o expoente conta os zeros.
      const n = r.int(2, 7)
      const certa = pot(10, n)
      return {
        enunciado: `Quanto é ${texQ(tp(10, n))}`,
        fala: `Quanto é ${elevado(10, n)}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [10 * n, 'potencia-multiplica-base-pelo-expoente'],
          [pot(10, n - 1), 'conta-zeros-errado'],
          [pot(10, n + 1), 'conta-zeros-errado'],
        ]),
        dicas: [
          'Em potência de 10, o expoente conta os zeros.',
          `${tex(tp(10, n))} tem ${n} zeros depois do 1.`,
          `${tex(`${tp(10, n)} = ${milTex(certa)}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // O caminho de volta: o número com zeros, o expoente.
      const n = r.int(2, 9)
      const v = pot(10, n)
      return {
        enunciado: `**${mil(v)}** é 10 elevado a quanto?`,
        fala: `${mil(v)} é 10 elevado a quanto?`,
        formato: 'numero',
        resposta: n,
        erros: mapa(n, [[n + 1, 'conta-zeros-errado'], [n - 1, 'conta-zeros-errado']]),
        dicas: [
          'Em potência de 10, o expoente conta os zeros.',
          `Conte só os zeros de ${mil(v)}, sem o 1.`,
          `São ${n} zeros: ${tex(tp(10, n))}.`,
        ],
      }
    }
    // Potências maiores, sem o desenho.
    const [b, e] = r.pick([[2, 6], [2, 7], [2, 8], [2, 10], [3, 4], [3, 5], [4, 4], [5, 4], [6, 3], [7, 3], [9, 3]] as const)
    const certa = pot(b, e)
    return {
      enunciado: `Quanto é ${texQ(tp(b, e))}`,
      fala: `Quanto é ${elevado(b, e)}?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [b * e, 'potencia-multiplica-base-pelo-expoente'],
        [pot(e, b), 'potencia-troca-base-e-expoente'],
      ]),
      dicas: [
        `São ${e} fatores ${b} multiplicados.`,
        `Multiplique de dois em dois: ${tex(`${b} \\times ${b} = ${b * b}`)}, e siga.`,
        `${tex(`${tp(b, e)} = ${milTex(certa)}`)}.`,
      ],
    }
  },
}

export const potenciaN3: Gerador = {
  id: 'potencia-n3',
  aula: 'B.U13.A1',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 3)
    if (tipo === 0) {
      const n = r.int(4, 8)
      const certa = pot(2, n)
      const enunciado = `Você dobra uma folha ao meio **${n}** vezes. Quantas camadas ficam?`
      return {
        enunciado,
        fala: enunciado.replace(/\*\*/g, ''),
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[2 * n, 'potencia-multiplica-base-pelo-expoente'], [n * n, 'potencia-troca-base-e-expoente']]),
        dicas: [
          'Cada dobra multiplica as camadas por 2.',
          `${n} dobras: ${tex(tp(2, n))}, ${n} fatores 2.`,
          `${tex(`${tp(2, n)} = ${certa}`)} camadas.`,
        ],
      }
    }
    if (tipo === 1) {
      const c = r.int(2, 5)
      const k = r.int(3, c === 5 ? 4 : 5)
      const certa = pot(c, k)
      const enunciado = `Você conta uma notícia a **${c}** pessoas, e cada uma conta a **${c}** novas. Quantas pessoas ouvem na rodada **${k}**?`
      return {
        enunciado,
        fala: enunciado.replace(/\*\*/g, ''),
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[c * k, 'potencia-multiplica-base-pelo-expoente'], [pot(k, c), 'potencia-troca-base-e-expoente']]),
        dicas: [
          `A cada rodada, o número de pessoas é multiplicado por ${c}.`,
          `Na rodada 1 são ${c}; na rodada ${k}, ${tex(tp(c, k))}.`,
          `${tex(`${tp(c, k)} = ${milTex(certa)}`)} pessoas.`,
        ],
      }
    }
    if (tipo === 2) {
      const h = r.int(5, 10)
      const certa = pot(2, h)
      const enunciado = `Uma bactéria vira **2** a cada hora, e cada nova faz o mesmo. Começando com **1**, quantas há depois de **${h}** horas?`
      return {
        enunciado,
        fala: enunciado.replace(/\*\*/g, ''),
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[2 * h, 'potencia-multiplica-base-pelo-expoente'], [h * h, 'potencia-troca-base-e-expoente']]),
        dicas: [
          'A cada hora, o número de bactérias dobra.',
          `${h} horas são ${h} fatores 2: ${tex(tp(2, h))}.`,
          `${tex(`${tp(2, h)} = ${milTex(certa)}`)} bactérias.`,
        ],
      }
    }
    const b = r.int(3, 9)
    const certa = pot(b, 3)
    const enunciado = `Uma caixa em forma de cubo tem **${b}** cubinhos em cada lado. Quantos cubinhos cabem nela?`
    return {
      enunciado,
      fala: enunciado.replace(/\*\*/g, ''),
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [[3 * b, 'potencia-multiplica-base-pelo-expoente'], [pot(3, b), 'potencia-troca-base-e-expoente']]),
      dicas: [
        'O cubo tem largura, fundo e altura iguais: é o lado ao cubo.',
        `${tex(`${tp(b, 3)} = ${b} \\times ${b} \\times ${b}`)}.`,
        `${tex(`${b} \\times ${b} = ${b * b}`)} e ${tex(`${b * b} \\times ${b} = ${certa}`)} cubinhos.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 2: propriedades sem decorar

export const propriedadesN1: Gerador = {
  id: 'propriedades-n1',
  aula: 'B.U13.A2',
  nivel: 1,
  gerar(r) {
    const b = r.int(2, 7)
    if (r.int(0, 1) === 0) {
      // Produto: os fatores se juntam.
      const a = r.int(1, 5)
      const c = r.int(1, 6 - a + 1)
      const certa = a + c
      return {
        enunciado: `${tex(`${tp(b, a)} \\times ${tp(b, c)}`)} é **${b}** elevado a quanto?`,
        fala: `${elevado(b, a)} vezes ${elevado(b, c)} é ${b} elevado a quanto?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[a * c, 'potencia-multiplica-expoentes']]),
        dicas: [
          'Escreva por extenso e conte os fatores.',
          `São ${a} fatores ${b} e mais ${c}.`,
          `${a} + ${c} = ${certa}: ${tex(tp(b, certa))}.`,
        ],
        visual: exp([`${b}${sup(a)} × ${b}${sup(c)}`, `${grupo(b, a)} × ${grupo(b, c)}`, '= ?'], `A conta, embaixo por extenso (${a} fatores ${b} e mais ${c}) e, grande, "= ?".`),
      }
    }
    // Divisão: os fatores de baixo cancelam os de cima.
    const a = r.int(3, 6)
    const c = r.int(1, Math.min(a - 1, 7 - a))
    const certa = a - c
    return {
      enunciado: `${tex(`${tp(b, a)} \\div ${tp(b, c)}`)} é **${b}** elevado a quanto?`,
      fala: `${elevado(b, a)} dividido por ${elevado(b, c)} é ${b} elevado a quanto?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [a + c, 'potencia-soma-expoentes-na-divisao'],
        [a % c === 0 ? a / c : null, 'potencia-multiplica-expoentes'],
      ]),
      dicas: [
        'Escreva por extenso: cada fator de baixo cancela um de cima.',
        `Dos ${a} fatores ${b} de cima, saem ${c}.`,
        `${a} − ${c} = ${certa}: ${tex(tp(b, certa))}.`,
      ],
      visual: exp([`${b}${sup(a)} ÷ ${b}${sup(c)}`, `${grupo(b, a)} ÷ ${grupo(b, c)}`, '= ?'], `A conta, embaixo por extenso (${a} fatores ${b} divididos por ${c}) e, grande, "= ?".`),
    }
  },
}

export const propriedadesN2: Gerador = {
  id: 'propriedades-n2',
  aula: 'B.U13.A2',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Potência de potência: grupos iguais.
      const b = r.int(2, 10)
      const a = r.int(2, 5)
      const c = r.int(2, 4)
      const certa = a * c
      return {
        enunciado: `${tex(`(${tp(b, a)})^{${c}}`)} é **${b}** elevado a quanto?`,
        fala: `${elevado(b, a)}, elevado a ${c}, é ${b} elevado a quanto?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[a + c, 'potencia-de-potencia-soma']]),
        dicas: [
          `O expoente de fora diz quantas vezes o ${tex(tp(b, a))} aparece.`,
          `São ${c} grupos de ${a} fatores ${b}.`,
          `${c} × ${a} = ${certa}: ${tex(tp(b, certa))}.`,
        ],
      }
    }
    if (tipo === 1) {
      // Três potências numa conta, da esquerda para a direita.
      const b = r.int(2, 9)
      const a = r.int(2, 6)
      const c = r.int(1, 5)
      const d = r.int(1, a + c - 1)
      const certa = a + c - d
      return {
        enunciado: `${tex(`${tp(b, a)} \\times ${tp(b, c)} \\div ${tp(b, d)}`)} é **${b}** elevado a quanto?`,
        fala: `${elevado(b, a)} vezes ${elevado(b, c)}, dividido por ${elevado(b, d)}, é ${b} elevado a quanto?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [a + c + d, 'potencia-soma-expoentes-na-divisao'],
          [(a * c) % d === 0 ? (a * c) / d : null, 'potencia-multiplica-expoentes'],
        ]),
        dicas: [
          'Por extenso: multiplicar junta fatores, dividir tira.',
          `Primeiro ${a} + ${c} = ${a + c} fatores ${b}; depois saem ${d}.`,
          `${a + c} − ${d} = ${certa}: ${tex(tp(b, certa))}.`,
        ],
      }
    }
    // Os parênteses decidem o que é a base.
    const [k, e] = r.int(0, 3) < 3 ? [r.int(2, 9), 2] : [r.int(2, 3), 4]
    const entre = r.int(0, 1) === 0
    const certa = entre ? pot(k, e) : -pot(k, e)
    const f = entre ? tp(-k, e) : `-${tp(k, e)}`
    return {
      enunciado: `Quanto é ${texQ(f)}`,
      fala: entre ? `Quanto é menos ${k}, entre parênteses, ${e === 2 ? 'ao quadrado' : `elevado a ${e}`}?` : `Quanto é menos ${k} ${e === 2 ? 'ao quadrado' : `elevado a ${e}`}, sem parênteses?`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [
        [-certa, 'potencia-sinal-fora-dos-parenteses'],
        [-k * e, 'potencia-multiplica-base-pelo-expoente'],
      ]),
      dicas: [
        'O expoente vale só para o que está logo antes dele.',
        entre
          ? `Com parênteses, a base é ${tex(`-${k}`)}: ${tex(Array.from({ length: e }, () => `(-${k})`).join(' \\times '))}.`
          : `Sem parênteses, só o ${k} é elevado: ${tex(`-(${extenso(k, e).replace(/×/g, '\\times')})`)}.`,
        entre ? `Um número par de fatores negativos dá positivo: ${tex(`${f} = ${certa}`)}.` : `${tex(`${tp(k, e)} = ${pot(k, e)}`)}, e o menos fica: ${tex(`${f} = ${certa}`)}.`,
      ],
    }
  },
}

export const propriedadesN3: Gerador = {
  id: 'propriedades-n3',
  aula: 'B.U13.A2',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // Bases diferentes: calcular cada potência.
      const a = r.int(2, 5)
      let c = r.int(2, 5)
      if (c === a) c = a === 5 ? 2 : a + 1
      const m = r.int(2, 3)
      const n = r.int(2, 3)
      const certa = pot(a, m) * pot(c, n)
      return {
        enunciado: `Quanto é ${texQ(`${tp(a, m)} \\times ${tp(c, n)}`)}`,
        fala: `Quanto é ${elevado(a, m)} vezes ${elevado(c, n)}?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [
          [pot(a * c, m + n), 'potencia-junta-bases-diferentes'],
          [pot(a + c, m + n), 'potencia-junta-bases-diferentes'],
          [a * m * c * n, 'potencia-multiplica-base-pelo-expoente'],
        ]),
        dicas: [
          'Bases diferentes não viram uma potência só. Calcule cada uma.',
          `${tex(`${tp(a, m)} = ${pot(a, m)}`)} e ${tex(`${tp(c, n)} = ${pot(c, n)}`)}.`,
          `${tex(`${pot(a, m)} \\times ${pot(c, n)} = ${milTex(certa)}`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      // Qual conta dá a potência pedida?
      const b = r.pick([2, 3, 5, 10])
      const t = r.int(5, 8)
      const x = r.int(2, t - 2)
      const outra = b === 2 ? 3 : 2
      return {
        enunciado: `Qual conta dá ${texQ(tp(b, t))}`,
        fala: `Qual conta dá ${elevado(b, t)}?`,
        formato: 'escolha',
        ...embaralhar(r, [
          { texto: tex(`${tp(b, x)} \\times ${tp(b, t - x)}`), certa: true },
          { texto: tex(`(${tp(b, x)})^{${t - x}}`), erro: 'potencia-de-potencia-soma' },
          { texto: tex(`${tp(b, t * x)} \\div ${tp(b, x)}`), erro: 'potencia-multiplica-expoentes' },
          { texto: tex(`${tp(b, x)} \\times ${tp(outra, t - x)}`), erro: 'potencia-junta-bases-diferentes' },
        ]),
        dicas: [
          'Escreva cada conta por extenso e conte os fatores.',
          `Multiplicar soma os expoentes; potência de potência multiplica; dividir subtrai.`,
          `${tex(`${tp(b, x)} \\times ${tp(b, t - x)} = ${b}^{${x} + ${t - x}} = ${tp(b, t)}`)}.`,
        ],
      }
    }
    // Caixas de parafusos.
    if (r.int(0, 1) === 0) {
      const a = r.int(2, 4)
      const c = r.int(2, 3)
      const certa = a + c
      const enunciado = `Um depósito tem $10^{${a}}$ caixas com $10^{${c}}$ parafusos cada. O total de parafusos é 10 elevado a quanto?`
      return {
        enunciado,
        fala: `Um depósito tem ${elevado(10, a)} caixas com ${elevado(10, c)} parafusos cada. O total de parafusos é 10 elevado a quanto?`,
        formato: 'numero',
        resposta: certa,
        erros: mapa(certa, [[a * c, 'potencia-multiplica-expoentes']]),
        dicas: [
          'O total é caixas vezes parafusos por caixa.',
          `${tex(`${tp(10, a)} \\times ${tp(10, c)}`)}: ${a} fatores 10 e mais ${c}.`,
          `${a} + ${c} = ${certa}: ${tex(tp(10, certa))} parafusos.`,
        ],
      }
    }
    const a = r.int(4, 6)
    const c = r.int(1, 3)
    const certa = a - c
    const enunciado = `Você tem $10^{${a}}$ parafusos para pôr em caixas de $10^{${c}}$. O número de caixas é 10 elevado a quanto?`
    return {
      enunciado,
      fala: `Você tem ${elevado(10, a)} parafusos para pôr em caixas de ${elevado(10, c)}. O número de caixas é 10 elevado a quanto?`,
      formato: 'numero',
      resposta: certa,
      erros: mapa(certa, [
        [a + c, 'potencia-soma-expoentes-na-divisao'],
        [a % c === 0 ? a / c : null, 'potencia-multiplica-expoentes'],
      ]),
      dicas: [
        'O número de caixas é o total dividido pelo que cabe em cada uma.',
        `${tex(`${tp(10, a)} \\div ${tp(10, c)}`)}: dos ${a} fatores 10, saem ${c}.`,
        `${a} − ${c} = ${certa}: ${tex(tp(10, certa))} caixas.`,
      ],
    }
  },
}

// ---------------------------------------------------------------- aula 3: expoente zero e negativo

/** A tabela do padrão, de bᵃ para baixo, com "?" na última coluna. */
function tabela(b: number, de: number, ate: number, esboco: string): Visual {
  const es: number[] = []
  for (let e = de; e >= ate; e--) es.push(e)
  const valores = es.map((e, i) => (i === es.length - 1 ? '?' : e >= 0 ? pot(b, e) : decimalInverso(b, -e)))
  return {
    modelo: 'livre',
    estado: {
      tabela: {
        linhas: [
          { rotulo: 'potência', valores: es.map((e) => `${b}${sup(e)}`) },
          { rotulo: 'valor', valores },
        ],
        setas: es.slice(0, -2).map((_, i) => ({ de: i, para: i + 1, rotulo: `÷ ${b}`, embaixo: true })),
      },
    },
    esboco,
  }
}

export const expoenteZeroNegativoN1: Gerador = {
  id: 'expoente-zero-negativo-n1',
  aula: 'B.U13.A3',
  nivel: 1,
  gerar(r) {
    if (r.int(0, 1) === 0) {
      const b = r.pick([2, 3, 5, 10])
      return {
        enunciado: `Siga o padrão da tabela: quanto é ${texQ(tp(b, 0))}`,
        fala: `Siga o padrão da tabela: quanto é ${b} elevado a zero?`,
        formato: 'numero',
        resposta: 1,
        sinal: true,
        erros: mapa(1, [[0, 'expoente-zero-da-zero']]),
        dicas: [
          `Cada vez que o expoente cai 1, o valor é dividido por ${b}.`,
          `Depois de ${tex(`${tp(b, 1)} = ${b}`)}, divida por ${b} mais uma vez.`,
          `${tex(`${b} \\div ${b} = 1`)}: ${tex(`${tp(b, 0)} = 1`)}.`,
        ],
        visual: tabela(b, 3, 0, `A tabela de ${b}³ a ${b}⁰, com "÷ ${b}" embaixo de cada passo e "?" embaixo do ${b}⁰.`),
      }
    }
    const b = r.pick([2, 4, 5, 10])
    const certa = decimalInverso(b, 1)
    return {
      enunciado: `Siga o padrão da tabela: quanto é ${texQ(tp(b, -1))} Escreva como decimal.`,
      fala: `Siga o padrão da tabela: quanto é ${b} elevado a menos um? Escreva como decimal.`,
      formato: 'numero',
      resposta: certa,
      sinal: true,
      erros: mapa(certa, [[-b, 'expoente-negativo-da-negativo']]),
      dicas: [
        `Cada vez que o expoente cai 1, o valor é dividido por ${b}.`,
        `Depois de ${tex(`${tp(b, 0)} = 1`)}, divida o 1 por ${b}.`,
        `${tex(`1 \\div ${b} = ${certa.replace(',', '{,}')}`)}: ${tex(`${tp(b, -1)} = ${certa.replace(',', '{,}')}`)}.`,
      ],
      visual: tabela(b, 2, -1, `A tabela de ${b}² a ${b}⁻¹, com "÷ ${b}" embaixo de cada passo e "?" embaixo do ${b}⁻¹.`),
    }
  },
}

export const expoenteZeroNegativoN2: Gerador = {
  id: 'expoente-zero-negativo-n2',
  aula: 'B.U13.A3',
  nivel: 2,
  gerar(r) {
    const tipo = r.int(0, 3)
    if (tipo === 0) {
      const b = r.pick([r.int(2, 9), r.int(11, 99), r.int(100, 999)])
      return {
        enunciado: `Quanto é ${texQ(tp(b, 0))}`,
        fala: `Quanto é ${b} elevado a zero?`,
        formato: 'numero',
        resposta: 1,
        sinal: true,
        erros: mapa(1, [[0, 'expoente-zero-da-zero']]),
        dicas: [
          'Todo número diferente de zero elevado a 0 dá 1.',
          `Desça a tabela do ${b}: de ${tex(`${tp(b, 1)} = ${b}`)}, divida por ${b}.`,
          `${tex(`${b} \\div ${b} = 1`)}: ${tex(`${tp(b, 0)} = 1`)}.`,
        ],
      }
    }
    if (tipo === 1) {
      const k = r.int(1, 5)
      const certa = decimalDe10(k)
      return {
        enunciado: `Escreva ${tex(tp(10, -k))} como decimal.`,
        fala: `Escreva 10 elevado a menos ${k} como decimal.`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [-pot(10, k), 'expoente-negativo-da-negativo'],
          [decimalDe10(k + 1), 'conta-zeros-errado'],
          [k > 1 ? decimalDe10(k - 1) : null, 'conta-zeros-errado'],
        ]),
        dicas: [
          'O menos no expoente pede divisão: o número fica pequeno, mas positivo.',
          `${tex(`${tp(10, -k)} = 1 \\div ${tp(10, k)}`)}: o 1 anda ${k} ${k === 1 ? 'casa' : 'casas'} para a direita da vírgula.`,
          `${tex(`${tp(10, -k)} = ${certa.replace(',', '{,}')}`)}.`,
        ],
      }
    }
    if (tipo === 2) {
      const k = r.int(1, 3)
      const certa = decimalInverso(2, k)
      return {
        enunciado: `Escreva ${tex(tp(2, -k))} como decimal.`,
        fala: `Escreva 2 elevado a menos ${k} como decimal.`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [[-pot(2, k), 'expoente-negativo-da-negativo']]),
        dicas: [
          'O menos no expoente pede divisão: o número fica pequeno, mas positivo.',
          `${tex(`${tp(2, -k)} = 1 \\div ${tp(2, k)} = 1 \\div ${pot(2, k)}`)}.`,
          `${tex(`1 \\div ${pot(2, k)} = ${certa.replace(',', '{,}')}`)}.`,
        ],
      }
    }
    const k = r.int(1, 5)
    const v = decimalDe10(k)
    return {
      enunciado: `**${v}** é 10 elevado a quanto?`,
      fala: `${v} é 10 elevado a quanto?`,
      formato: 'numero',
      resposta: -k,
      sinal: true,
      erros: mapa(-k, [
        [k, 'esquece-sinal-do-resultado'],
        [k > 1 ? -(k - 1) : null, 'conta-zeros-errado'],
      ]),
      dicas: [
        'Números entre 0 e 1 têm expoente negativo.',
        `Conte as casas depois da vírgula até o 1, inclusive: são ${k}.`,
        `${tex(`${v.replace(',', '{,}')} = ${tp(10, -k)}`)}: o expoente é ${tex(`${-k}`)}.`,
      ],
    }
  },
}

/** As unidades: quantos metros tem cada uma, como potência de 10. */
const UNIDADES = [
  { u: 'km', frase: '1 km tem **1.000** m. Então 1 km é ${10^{?}}$ m.', fala: 'Um quilômetro tem mil metros. Então um quilômetro é dez elevado a quanto, em metros?', e: 3, quantos: 1000 },
  { u: 'dm', frase: '1 m tem **10** dm. Então 1 dm é ${10^{?}}$ m.', fala: 'Um metro tem dez decímetros. Então um decímetro é dez elevado a quanto, em metros?', e: -1, quantos: 10 },
  { u: 'cm', frase: '1 m tem **100** cm. Então 1 cm é ${10^{?}}$ m.', fala: 'Um metro tem cem centímetros. Então um centímetro é dez elevado a quanto, em metros?', e: -2, quantos: 100 },
  { u: 'mm', frase: '1 m tem **1.000** mm. Então 1 mm é ${10^{?}}$ m.', fala: 'Um metro tem mil milímetros. Então um milímetro é dez elevado a quanto, em metros?', e: -3, quantos: 1000 },
] as const

export const expoenteZeroNegativoN3: Gerador = {
  id: 'expoente-zero-negativo-n3',
  aula: 'B.U13.A3',
  nivel: 3,
  gerar(r) {
    const tipo = r.int(0, 2)
    if (tipo === 0) {
      // A divisão de uma potência por ela mesma: o expoente zero.
      const b = r.int(2, 9)
      const k = r.int(2, 6)
      return {
        enunciado: `Quanto é ${texQ(`${tp(b, k)} \\div ${tp(b, k)}`)}`,
        fala: `Quanto é ${elevado(b, k)} dividido por ${elevado(b, k)}?`,
        formato: 'numero',
        resposta: 1,
        sinal: true,
        erros: mapa(1, [[0, 'expoente-zero-da-zero']]),
        dicas: [
          'Um número dividido por ele mesmo dá 1.',
          `Pela regra dos expoentes: ${tex(`${tp(b, k)} \\div ${tp(b, k)} = ${tp(b, 0)}`)}.`,
          `${tex(`${tp(b, 0)} = 1`)}: o expoente zero dá 1.`,
        ],
      }
    }
    if (tipo === 1) {
      // Um produto de potências de 10 com expoente negativo.
      const a = r.int(1, 3)
      const c = r.int(a + 1, a + 4)
      const k = c - a
      const certa = decimalDe10(k)
      return {
        enunciado: `Escreva ${tex(`${tp(10, a)} \\times ${tp(10, -c)}`)} como decimal.`,
        fala: `Escreva ${elevado(10, a)} vezes 10 elevado a menos ${c} como decimal.`,
        formato: 'numero',
        resposta: certa,
        sinal: true,
        erros: mapa(certa, [
          [-pot(10, k), 'expoente-negativo-da-negativo'],
          [decimalDe10(k + 1), 'conta-zeros-errado'],
          [k > 1 ? decimalDe10(k - 1) : null, 'conta-zeros-errado'],
        ]),
        dicas: [
          'Na mesma base, multiplicar soma os expoentes, também os negativos.',
          `${tex(`${a} + (${-c}) = ${-k}`)}: o resultado é ${tex(tp(10, -k))}.`,
          `${tex(`${tp(10, -k)} = ${certa.replace(',', '{,}')}`)}.`,
        ],
      }
    }
    // Unidades de medida como potências de 10.
    const { u, frase, fala, e, quantos } = r.pick(UNIDADES)
    return {
      enunciado: `${frase} Qual é o expoente?`,
      fala: `${fala} Qual é o expoente?`,
      formato: 'numero',
      resposta: e,
      sinal: true,
      erros: mapa(e, [[-e, 'converte-no-sentido-errado']]),
      dicas: [
        e > 0 ? 'Uma unidade maior que o metro tem expoente positivo.' : 'Uma unidade menor que o metro tem expoente negativo: ela divide o metro.',
        e > 0 ? `1 km são ${mil(quantos)} m, e ${mil(quantos)} tem ${e} zeros.` : `1 ${u} é o metro dividido por ${mil(quantos)}: ${tex(`1 \\div ${tp(10, -e)}`)}.`,
        `1 ${u} = ${tex(tp(10, e))} m. O expoente é ${tex(String(e))}.`,
      ],
    }
  },
}

export const GERADORES_U13A: Gerador[] = [
  potenciaN1, potenciaN2, potenciaN3,
  propriedadesN1, propriedadesN2, propriedadesN3,
  expoenteZeroNegativoN1, expoenteZeroNegativoN2, expoenteZeroNegativoN3,
]
